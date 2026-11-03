<?php

namespace App\Services;

use App\Models\LunaKnowledgeChunk;
use App\Models\CommunityServiceHub;
use App\Models\EducationalResource;
use Illuminate\Support\Str;

class LunaAiService
{
    /**
     * Process user prompt with safety checks and RAG retrieval
     */
    public function respond(string $userMessage, ?int $userId = null): array
    {
        $normalized = Str::lower($userMessage);

        // 1. HARD SAFETY BOUNDARY: Clinical & Safeguarding Escalation Checks
        $clinicalFlags = [
            'severe pain', 'extreme cramps', 'passed out', 'fainting', 'unbearable pain', 
            'hemorrhage', 'soaking', 'bleeding for weeks', 'blood clots bigger than an egg',
            'foul smell', 'green discharge', 'yellow discharge with fever', 'burning sensation',
            'fever and vomiting', 'toxic shock'
        ];

        $safeguardingFlags = [
            'forced', 'abuse', 'hit me', 'raped', 'assault', 'violence', 'scared at home', 'beat me'
        ];

        $emergencySupplyFlags = [
            'no pads', 'ran out of pads', 'emergency pads', 'leaking', 'stained uniform', 
            'need pad right now', 'need free pads', 'school pad'
        ];

        // Check Safeguarding Alert
        foreach ($safeguardingFlags as $flag) {
            if (Str::contains($normalized, $flag)) {
                return [
                    'message' => "I hear you, and your safety is the most important thing. You do not have to carry this alone. Please reach out right now to verified, confidential support lines in Zambia:",
                    'safety_flag' => 'safeguarding_alert',
                    'escalation' => [
                        'type' => 'helpline',
                        'title' => 'Immediate Confidential Safeguarding Support',
                        'phone_1' => 'Toll-Free 116 (Childline / Lifeline Zambia)',
                        'phone_2' => 'Toll-Free 992 (National GBV Support Line)',
                        'action_text' => 'Call Toll-Free 116',
                        'action_url' => 'tel:116'
                    ],
                    'referenced_resources' => []
                ];
            }
        }

        // Check Clinical Red Flags
        foreach ($clinicalFlags as $flag) {
            if (Str::contains($normalized, $flag)) {
                $nearbyClinic = CommunityServiceHub::where('offers_health_referrals', true)
                    ->where('hub_type', 'clinic')
                    ->first() ?? CommunityServiceHub::first();

                return [
                    'message' => "I want to be very clear with you: severe or debilitating pain, abnormal fever, and heavy bleeding that soaks through pads rapidly are important medical signals. Luna AI cannot diagnose medical conditions, and you deserve a gentle, thorough checkup with a healthcare professional.",
                    'safety_flag' => 'clinical_escalation',
                    'escalation' => [
                        'type' => 'clinic_referral',
                        'title' => 'Verified Healthcare Provider Referral',
                        'facility' => $nearbyClinic ? $nearbyClinic->organization_name : 'Adolescent Friendly Health Centre',
                        'address' => $nearbyClinic ? $nearbyClinic->address : 'Local District Health Office',
                        'phone' => $nearbyClinic ? $nearbyClinic->contact_phone : '+260955776611',
                        'advice' => 'Generate a free anonymous voucher to present at the clinic reception desk.',
                        'action_text' => 'View Healthcare Clinic',
                        'action_url' => '/support/map'
                    ],
                    'referenced_resources' => [
                        [
                            'title' => 'Severe Pain vs. Normal Period Cramps',
                            'slug' => 'understanding-4-phases-menstrual-cycle'
                        ]
                    ]
                ];
            }
        }

        // Check Immediate Supply Need
        foreach ($emergencySupplyFlags as $flag) {
            if (Str::contains($normalized, $flag)) {
                return [
                    'message' => "Don't worry! Free emergency sanitary supplies and dignity kits are stocked at verified community hubs and schools in your area. You can generate a 1-tap discreet pickup request right now.",
                    'safety_flag' => 'emergency_supply_need',
                    'escalation' => [
                        'type' => 'supply_request',
                        'title' => 'Emergency Supply Request',
                        'advice' => 'Choose a nearby school or community hub to collect your pack discreetly.',
                        'action_text' => 'Request Emergency Pack Now',
                        'action_url' => '/support/request'
                    ],
                    'referenced_resources' => []
                ];
            }
        }

        // 2. RAG RETRIEVAL: Search Knowledge Chunks
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
        $bestMatch = !empty($matchedChunks) ? $matchedChunks[0]['chunk'] : null;

        $referencedResources = [];

        // Synthesize grounding response
        if (Str::contains($normalized, ['wash', 'reusable', 'clean', 'dry', 'cloth', 'sunlight'])) {
            $text = "Taking care of reusable pads is simple and keeps you healthy! Always pre-soak in cold water for 15–30 minutes (never hot water, which sets stains). Wash gently with bar soap or laundry soap, rinse thoroughly until water is clear, and hang in direct sunlight. Sunlight acts as a natural sanitizing agent!";
            $referencedResources[] = [
                'title' => 'Step-by-Step Guide: Washing & Drying Reusable Pads in Dignity',
                'slug' => 'washing-drying-reusable-pads-in-dignity'
            ];
        } elseif (Str::contains($normalized, ['cramp', 'pain', 'ache', 'relief', 'warm'])) {
            $text = "Mild menstrual cramps are common as uterine muscles contract. To find relief naturally: place a warm water bottle or warm cloth on your lower abdomen, sip warm ginger or chamomile tea, stay hydrated, and take a gentle stroll. Gentle movement stimulates blood flow and releases soothing endorphins.";
            $referencedResources[] = [
                'title' => 'Understanding the 4 Phases of Your Menstrual Cycle',
                'slug' => 'understanding-4-phases-menstrual-cycle'
            ];
        } elseif (Str::contains($normalized, ['phase', 'cycle', 'ovulation', 'follicular', 'luteal', 'when'])) {
            $text = "Your menstrual cycle flows through 4 natural phases: 1) Menstrual phase (days 1–5), 2) Follicular phase where estrogen rises and energy grows, 3) Ovulation window (around day 14) when an egg is released, and 4) Luteal phase where your body prepares for renewal. Tracking daily signs helps you predict your next arrival!";
            $referencedResources[] = [
                'title' => 'Understanding the 4 Phases of Your Menstrual Cycle',
                'slug' => 'understanding-4-phases-menstrual-cycle'
            ];
        } elseif (Str::contains($normalized, ['myth', 'cook', 'touch', 'exercise', 'bad'])) {
            $text = "There are many taboos that are simply untrue! Menstrual flow is completely natural. Having your period does NOT spoil food, you can cook safely with normal handwashing, and exercising does not cause harm—in fact, physical activity helps relieve pain!";
            $referencedResources[] = [
                'title' => 'Busting Common Menstrual Taboos',
                'slug' => 'understanding-4-phases-menstrual-cycle'
            ];
        } elseif ($bestMatch) {
            $text = $bestMatch->chunk_text . " Every body is unique, so listen to how you feel and treat yourself with kindness!";
            if ($bestMatch->resource) {
                $referencedResources[] = [
                    'title' => $bestMatch->resource->title,
                    'slug' => $bestMatch->resource->slug
                ];
            }
        } else {
            $text = "Hello! I am Luna, your private Mwezi health companion. I can help explain your cycle phases, share tips for washing reusable pads, suggest soothing ways to relieve cramps, or help you find free pads nearby. What is on your mind today?";
        }

        return [
            'message' => $text,
            'safety_flag' => 'none',
            'escalation' => null,
            'referenced_resources' => $referencedResources,
        ];
    }
}

