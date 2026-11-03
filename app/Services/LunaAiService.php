<?php

namespace App\Services;

use App\Models\LunaKnowledgeChunk;
use App\Models\CommunityServiceHub;
use App\Models\EducationalResource;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LunaAiService
{
    /**
     * Process user prompt with safety checks, RAG retrieval, and Gemini AI synthesis.
     */
    public function respond(string $userMessage, ?int $userId = null, array $conversationHistory = [], ?string $overrideLocale = null): array
    {
        $normalized = Str::lower($userMessage);

        // 1. HARD SAFETY BOUNDARY: Clinical & Safeguarding Escalation Checks
        $clinicalFlags = [
            'severe pain', 'extreme cramps', 'passed out', 'fainting', 'unbearable pain', 
            'hemorrhage', 'soaking', 'bleeding for weeks', 'bleeding for days and days',
            'blood clots bigger than', 'foul smell', 'green discharge', 'yellow discharge with fever',
            'burning sensation', 'fever and vomiting', 'toxic shock', 'infection', 'pelvic pain'
        ];

        $safeguardingFlags = [
            'forced', 'abuse', 'hit me', 'raped', 'assault', 'violence', 'scared at home', 'beat me', 'gbv'
        ];

        $emergencySupplyFlags = [
            'no pads', 'ran out of pads', 'emergency pads', 'leaking', 'stained uniform', 
            'need pad right now', 'need free pads', 'school pad'
        ];

        // Check Safeguarding Alert First (Highest Priority)
        foreach ($safeguardingFlags as $flag) {
            if (Str::contains($normalized, $flag)) {
                return [
                    'message' => "I hear you, and your safety and dignity are the absolute most important things. You do not have to carry this alone. Please reach out right now to verified, confidential safeguarding support in Zambia:\n\n• Toll-Free 116 (Childline / Lifeline Zambia — 24/7)\n• Toll-Free 992 (National Gender-Based Violence Support)\n\nThese lines are completely free and confidential. A trained professional counselor will listen and protect you.",
                    'safety_flag' => 'safeguarding_alert',
                    'escalation' => [
                        'type' => 'helpline',
                        'title' => 'Immediate Confidential Safeguarding Support',
                        'phone_1' => 'Toll-Free 116 (Childline / Lifeline Zambia)',
                        'phone_2' => 'Toll-Free 992 (National GBV Support Line)',
                        'action_text' => 'Call Toll-Free 116 Now',
                        'action_url' => 'tel:116'
                    ],
                    'referenced_resources' => []
                ];
            }
        }

        // Check Immediate Pad Supply Need
        $isEmergencySupply = false;
        foreach ($emergencySupplyFlags as $flag) {
            if (Str::contains($normalized, $flag)) {
                $isEmergencySupply = true;
                break;
            }
        }

        // Check Clinical Red Flags
        $isClinicalEscalation = false;
        foreach ($clinicalFlags as $flag) {
            if (Str::contains($normalized, $flag)) {
                $isClinicalEscalation = true;
                break;
            }
        }

        // 2. RAG RETRIEVAL: Search Knowledge Chunks for Grounding
        $queryWords = array_filter(explode(' ', preg_replace('/[^a-z0-9 ]/', '', $normalized)));
        $chunks = LunaKnowledgeChunk::where('approved_for_ai', true)
            ->with('resource')
            ->get();

        $matchedChunks = [];
        foreach ($chunks as $chunk) {
            $score = 0;
            foreach ($queryWords as $word) {
                if (strlen($word) > 2 && Str::contains(Str::lower($chunk->chunk_text), $word)) {
                    $score += 2;
                }
            }
            if ($chunk->topic_tags) {
                foreach ($chunk->topic_tags as $tag) {
                    if (Str::contains($normalized, Str::lower($tag))) {
                        $score += 3;
                    }
                }
            }
            if ($score > 0) {
                $matchedChunks[] = ['chunk' => $chunk, 'score' => $score];
            }
        }

        usort($matchedChunks, fn ($a, $b) => $b['score'] <=> $a['score']);
        
        $groundingContext = "";
        $referencedResources = [];
        
        // Take top 3 chunks for grounding
        $topChunks = array_slice($matchedChunks, 0, 3);
        foreach ($topChunks as $item) {
            $chunk = $item['chunk'];
            $groundingContext .= "- " . $chunk->chunk_text . "\n";
            if ($chunk->resource) {
                $referencedResources[] = [
                    'title' => $chunk->resource->title,
                    'slug' => $chunk->resource->slug
                ];
            }
        }

        // Deduplicate referenced resources
        $referencedResources = array_values(array_unique($referencedResources, SORT_REGULAR));

        // 3. GENERATE WITH GEMINI AI (With User Language Context)
        $userLocale = $overrideLocale ?: 'en';
        if ($userId && !$overrideLocale) {
            $user = \App\Models\User::find($userId);
            $userLocale = $user?->preferred_language ?? 'en';
        }

        $geminiResponse = $this->callGeminiApi($userMessage, $groundingContext, $conversationHistory, $userLocale);

        // Fallback response if Gemini is unavailable
        if (empty($geminiResponse)) {
            $geminiResponse = $this->getRuleBasedFallback($normalized, $topChunks ? $topChunks[0]['chunk'] : null);
        }

        // Check if Gemini itself advised seeing a doctor/professional
        $aiMentionedDoctor = Str::contains(Str::lower($geminiResponse), [
            'see a doctor', 'consult a doctor', 'healthcare provider', 'healthcare professional',
            'visit a clinic', 'medical attention', 'nurse', 'seek medical', 'hospital', 'clinical evaluation'
        ]);

        if ($isClinicalEscalation || $aiMentionedDoctor) {
            $nearbyClinic = CommunityServiceHub::where('offers_health_referrals', true)
                ->where('hub_type', 'clinic')
                ->first() ?? CommunityServiceHub::first();

            return [
                'message' => $geminiResponse,
                'safety_flag' => 'clinical_escalation',
                'escalation' => [
                    'type' => 'clinic_referral',
                    'title' => 'Professional Healthcare Provider Referral',
                    'facility' => $nearbyClinic ? $nearbyClinic->organization_name : 'Adolescent Friendly Health Centre',
                    'address' => $nearbyClinic ? $nearbyClinic->address : 'Local District Health Office / Health Post',
                    'phone' => $nearbyClinic ? $nearbyClinic->contact_phone : '+260955776611',
                    'advice' => 'Severe symptoms require a gentle, in-person checkup. You can visit this verified center or call Toll-Free 116 for guidance.',
                    'action_text' => 'Find Nearby Health Facility',
                    'action_url' => '/support/map'
                ],
                'referenced_resources' => $referencedResources
            ];
        }

        if ($isEmergencySupply) {
            return [
                'message' => $geminiResponse,
                'safety_flag' => 'emergency_supply_need',
                'escalation' => [
                    'type' => 'supply_request',
                    'title' => 'Emergency Pad Supply Request',
                    'advice' => 'Free dignity packs and emergency reusable pads are available at nearby school and community hubs.',
                    'action_text' => 'Request Free Emergency Kit',
                    'action_url' => '/support/request'
                ],
                'referenced_resources' => $referencedResources
            ];
        }

        return [
            'message' => $geminiResponse,
            'safety_flag' => 'none',
            'escalation' => null,
            'referenced_resources' => $referencedResources,
        ];
    }

    /**
     * Call the Google Gemini API with strict system guidelines and grounding.
     */
    protected function callGeminiApi(string $prompt, string $groundingContext, array $history = [], string $userLocale = 'en'): ?string
    {
        $apiKey = config('services.gemini.api_key');
        $model = config('services.gemini.model', 'gemini-3.5-flash-lite');
        $timeout = (int) config('services.gemini.timeout', 30);

        if (empty($apiKey)) {
            Log::warning('Gemini API key is not configured in services.gemini.api_key');
            return null;
        }

        $languageMap = [
            'bem' => 'Bemba (Icibemba, Zambia)',
            'nya' => 'Nyanja (Chinyanja, Zambia)',
            'toi' => 'Tonga (Chitonga, Zambia)',
            'loz' => 'Lozi (Silozi, Zambia)',
            'en' => 'English'
        ];
        $targetLang = $languageMap[$userLocale] ?? 'English';

        $systemInstruction = <<<EOT
You are Luna AI, the official, compassionate, and culturally rooted menstrual health companion for the Mwezi platform in Zambia.

STRICT DOMAIN BOUNDARY (CRITICAL):
1. You are strictly dedicated to Menstrual Hygiene Management (MHM), menstrual cycle health, puberty education, period pain/cramps management, reusable and disposable pad care (proper washing in clean water with soap, hanging in direct sunlight for natural UV disinfection, and dry storage), cycle irregularity guidance, and busting harmful taboos and myths.
2. ABSOLUTE OUT-OF-SCOPE ENFORCEMENT: If a user asks about anything unrelated to menstrual hygiene, periods, or reproductive health (e.g. coding, general mathematics, politics, entertainment, video games, general homework, sports, finance, etc.), you MUST warmly and politely decline. For example: "I am Luna, your dedicated companion for menstrual health and hygiene. I am only able to help with questions about periods, cycle tracking, pad care, cramps, and reproductive wellness. What can I help you with regarding your cycle today?"

PROFESSIONAL MEDICAL PERSONNEL REFERRAL (CRITICAL):
1. You are an educational and supportive guide, NOT a medical doctor. You NEVER provide definitive medical diagnoses or prescribe medications.
2. If the user reports severe or concerning symptoms—including:
   - Severe, unbearable, or debilitating cramps or pelvic pain that prevents normal daily activities or causes vomiting/fainting
   - Abnormally heavy bleeding (soaking through a sanitary pad or cloth in under 1-2 hours)
   - Bleeding continuously for longer than 7 to 10 days
   - Passing very large blood clots (larger than a 50 Ngwee coin or golf ball)
   - Foul-smelling, green, or thick yellow vaginal discharge with fever or chills
   - Sudden high fever, chills, dizziness, vomiting, or a sunburn-like rash during a period (signs of Toxic Shock Syndrome)
   - Suspected pregnancy complications or severe bodily distress
   YOU MUST:
   a) Explicitly urge them to consult professional medical personnel, a certified healthcare provider, or visit the nearest clinic/hospital immediately.
   b) Explain that severe pain or heavy bleeding is a medical signal that deserves compassionate in-person care.
   c) Remind them that confidential healthcare advice is available through Childline/Lifeline Zambia Toll-Free 116 or at local Adolescent Friendly Health Facilities.

MULTI-LINGUAL PROFICIENCY (ZAMBIAN INDIGENOUS LANGUAGES):
1. You are completely fluent in English and the 4 major Zambian languages:
   - Bemba (Icibemba)
   - Nyanja (Chinyanja)
   - Tonga (Chitonga)
   - Lozi (Silozi)
2. The user's active/preferred language is: {$targetLang}.
3. If the user addresses you in Bemba, Nyanja, Tonga, or Lozi, OR if their preferred language is not English ({$targetLang}), respond with sisterly warmth, fluency, and clinical accuracy in that language!
4. If they write in English, respond in English, but welcome them to use Bemba, Nyanja, Tonga, or Lozi anytime.

CULTURAL TONE & ADOLESCENT HEALTH DIGNITY:
- Speak with warm, reassuring, sisterly empathy, free of judgment or stigma.
- Explain terms clearly and simply (suitable for adolescents and young women in Zambia).
- Emphasize that menstruation is completely natural, normal, and nothing to feel ashamed of.
- Reusable pads must always be washed with cold water first (to avoid setting stains), cleaned with soap, and sun-dried in direct sunlight because ultraviolet rays naturally kill bacteria.
EOT;

        // Build Gemini API payload
        $contents = [];

        // Build prompt with grounding context if available
        $fullUserPrompt = $prompt;
        if (!empty($groundingContext)) {
            $fullUserPrompt = "MWEZI CERTIFIED HEALTHCARE KNOWLEDGE BASE CONTEXT:\n" . $groundingContext . "\n\nUSER QUESTION:\n" . $prompt;
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => $fullUserPrompt]
            ]
        ];

        $payload = [
            'contents' => $contents,
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemInstruction]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.4,
                'topP' => 0.95,
                'maxOutputTokens' => 800,
            ]
        ];

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
            
            $response = Http::withoutVerifying()
                ->timeout($timeout)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();
                $aiText = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if (!empty($aiText)) {
                    return trim($aiText);
                }
            } else {
                Log::warning('Gemini API call failed with status: ' . $response->status(), [
                    'body' => $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception connecting to Gemini API: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Fallback responses if external AI is momentarily unreachable.
     */
    protected function getRuleBasedFallback(string $normalized, ?LunaKnowledgeChunk $bestMatch): string
    {
        if (Str::contains($normalized, ['wash', 'reusable', 'clean', 'dry', 'cloth', 'sunlight'])) {
            return "Taking care of reusable pads is simple and keeps you healthy! Always pre-soak in cold water for 15–30 minutes (never hot water, which sets stains). Wash gently with bar soap or laundry soap, rinse thoroughly until water is clear, and hang in direct sunlight. Sunlight acts as a natural sanitizing agent!";
        } 
        
        if (Str::contains($normalized, ['cramp', 'pain', 'ache', 'relief', 'warm'])) {
            return "Mild menstrual cramps are common as uterine muscles contract. To find relief naturally: place a warm water bottle or warm cloth on your lower abdomen, sip warm ginger or chamomile tea, stay hydrated, and take a gentle stroll. If your pain is severe or prevents you from walking, please consult professional medical personnel at your nearest clinic right away.";
        } 
        
        if (Str::contains($normalized, ['phase', 'cycle', 'ovulation', 'follicular', 'luteal', 'when'])) {
            return "Your menstrual cycle flows through 4 natural phases: 1) Menstrual phase (days 1–5), 2) Follicular phase where estrogen rises, 3) Ovulation window (around day 14) when an egg is released, and 4) Luteal phase where your body prepares for renewal. Tracking daily signs helps you predict your next arrival!";
        } 
        
        if (Str::contains($normalized, ['myth', 'cook', 'touch', 'exercise', 'bad'])) {
            return "There are many taboos that are simply untrue! Menstrual flow is completely natural. Having your period does NOT spoil food, you can cook safely with normal handwashing, and exercising does not cause harm—in fact, physical activity helps relieve pain!";
        } 
        
        if ($bestMatch) {
            return $bestMatch->chunk_text . " Every body is unique, so listen to how you feel and treat yourself with kindness!";
        }

        return "Hello! I am Luna, your private Mwezi health companion dedicated specifically to menstrual hygiene and reproductive health. I can help explain your cycle phases, share tips for washing reusable pads in sunlight, suggest soothing ways to relieve cramps, or connect you to professional medical personnel if you are experiencing severe symptoms. What is on your mind today?";
    }
}
