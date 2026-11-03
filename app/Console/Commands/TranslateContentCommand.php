<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\EducationalResource;
use App\Models\EducationalResourceTranslation;
use App\Models\MythAndFact;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranslateContentCommand extends Command
{
    protected $signature = 'mwezi:translate-content';
    protected $description = 'Translate all educational resources, myths & facts, and UI content into Bemba, Nyanja, Tonga, and Lozi using Gemini AI';

    protected array $languages = [
        'bem' => [
            'name' => 'Bemba',
            'local' => 'Icibemba',
            'region' => 'Zambia (Copperbelt, Northern, Luapula, Muchinga)'
        ],
        'nya' => [
            'name' => 'Nyanja',
            'local' => 'Chinyanja / Chewa',
            'region' => 'Zambia (Lusaka, Eastern)'
        ],
        'toi' => [
            'name' => 'Tonga',
            'local' => 'Chitonga',
            'region' => 'Zambia (Southern, Western)'
        ],
        'loz' => [
            'name' => 'Lozi',
            'local' => 'Silozi',
            'region' => 'Zambia (Western, Barotseland)'
        ],
    ];

    public function handle(): int
    {
        $this->info("Starting Gemini AI full app translation for Zambian languages:");
        $this->info("Languages: Bemba (bem), Nyanja (nya), Tonga (toi), Lozi (loz)\n");

        $apiKey = config('services.gemini.api_key') ?? env('GEMINI_API_KEY');
        $model = config('services.gemini.model') ?? env('GEMINI_MODEL', 'gemini-3.5-flash-lite');

        if (empty($apiKey)) {
            $this->error("GEMINI_API_KEY is not configured in .env");
            return 1;
        }

        // 1. Translate Educational Resources
        $this->info("--- TRANSLATING EDUCATIONAL RESOURCES ---");
        $resources = EducationalResource::all();

        foreach ($resources as $resource) {
            $this->line("Processing Article [ID: {$resource->id}]: {$resource->title}");

            foreach ($this->languages as $langCode => $langInfo) {
                // Check if already translated
                $existing = EducationalResourceTranslation::where('resource_id', $resource->id)
                    ->where('locale', $langCode)
                    ->first();

                if ($existing && !empty($existing->translated_body) && strlen($existing->translated_body) > 100) {
                    $this->line("  ✓ Already translated to {$langInfo['name']} ({$langCode})");
                    continue;
                }

                $this->info("  Translating to {$langInfo['name']} ({$langCode})...");

                $translated = $this->translateResourceWithGemini(
                    $resource->title,
                    $resource->summary ?? '',
                    $resource->body_content,
                    $langInfo,
                    $apiKey,
                    $model
                );

                if ($translated) {
                    EducationalResourceTranslation::updateOrCreate(
                        ['resource_id' => $resource->id, 'locale' => $langCode],
                        [
                            'translated_title' => $translated['translated_title'] ?? $resource->title,
                            'translated_summary' => $translated['translated_summary'] ?? $resource->summary,
                            'translated_body' => $translated['translated_body'] ?? $resource->body_content,
                        ]
                    );
                    $this->info("  ✓ Successfully saved {$langInfo['name']} translation.");
                } else {
                    $this->warn("  ⚠ Failed to translate to {$langInfo['name']}, keeping fallback.");
                }

                // Brief pause to respect API rate limits
                usleep(500000); // 0.5 sec
            }
        }

        // 2. Translate Myths and Facts
        $this->info("\n--- TRANSLATING MYTHS & FACTS ---");
        $englishMyths = MythAndFact::where('locale', 'en')->get();

        foreach ($englishMyths as $myth) {
            $this->line("Processing Myth [ID: {$myth->id}]: {$myth->myth_statement}");

            foreach ($this->languages as $langCode => $langInfo) {
                // Check if this specific myth has already been translated
                $existing = MythAndFact::where('locale', $langCode)
                    ->where('category_id', $myth->category_id)
                    ->skip($myth->id - 1)
                    ->take(1)
                    ->first();

                // If fewer myths exist for this locale than English, translate it
                $currentCountForLocale = MythAndFact::where('locale', $langCode)->count();
                if ($currentCountForLocale >= $englishMyths->count()) {
                    $this->line("  ✓ Myths already fully populated in {$langInfo['name']} ({$langCode})");
                    continue;
                }

                $this->info("  Translating Myth to {$langInfo['name']} ({$langCode})...");

                $translated = $this->translateMythWithGemini(
                    $myth->myth_statement,
                    $myth->fact_explanation,
                    $langInfo,
                    $apiKey,
                    $model
                );

                if ($translated) {
                    MythAndFact::create([
                        'category_id' => $myth->category_id,
                        'verified_by_id' => $myth->verified_by_id,
                        'myth_statement' => $translated['myth_statement'] ?? $myth->myth_statement,
                        'fact_explanation' => $translated['fact_explanation'] ?? $myth->fact_explanation,
                        'locale' => $langCode,
                    ]);
                    $this->info("  ✓ Successfully created {$langInfo['name']} Myth & Fact.");
                } else {
                    $this->warn("  ⚠ Failed to translate Myth to {$langInfo['name']}.");
                }

                usleep(500000); // 0.5 sec
            }
        }

        $this->info("\n✓ Content translation complete for Bemba, Nyanja, Tonga, and Lozi!");
        return 0;
    }

    private function translateResourceWithGemini(
        string $title,
        string $summary,
        string $body,
        array $langInfo,
        string $apiKey,
        string $model
    ): ?array {
        $prompt = <<<EOT
You are an expert medical translator and linguist specializing in adolescent menstrual hygiene education in Zambia.
Translate the following menstrual health educational resource from English into {$langInfo['name']} ({$langInfo['local']} used in {$langInfo['region']}).

IMPORTANT INSTRUCTIONS:
1. Translate accurately, empathetically, and respectfully for young girls and communities.
2. PRESERVE ALL MARKDOWN FORMATTING IN THE BODY:
   - Keep ## Headings, ### Subheadings, and numbered lists (1. , 2. ) exactly intact.
   - Keep bold markers **...** and blockquotes > ... intact.
3. Return ONLY a valid JSON object with the following keys and NO markdown codeblock markers:
{
  "translated_title": "...",
  "translated_summary": "...",
  "translated_body": "..."
}

ENGLISH CONTENT TO TRANSLATE:
TITLE: {$title}

SUMMARY: {$summary}

BODY CONTENT:
{$body}
EOT;

        $response = $this->callGemini($prompt, $apiKey, $model);
        if (!$response) return null;

        // Clean any code fences
        $cleanJson = preg_replace('/^```(?:json)?\s*/i', '', trim($response));
        $cleanJson = preg_replace('/```$/', '', trim($cleanJson));

        $data = json_decode($cleanJson, true);
        if (json_last_error() === JSON_ERROR_NONE && isset($data['translated_title'], $data['translated_body'])) {
            return $data;
        }

        Log::warning("Failed to decode JSON from Gemini for {$langInfo['name']}: " . substr($response, 0, 200));
        return null;
    }

    private function translateMythWithGemini(
        string $myth,
        string $fact,
        array $langInfo,
        string $apiKey,
        string $model
    ): ?array {
        $prompt = <<<EOT
Translate this Menstrual Myth and Scientific Fact into {$langInfo['name']} ({$langInfo['local']} spoken in {$langInfo['region']}).
Culturally respectful, accessible, clear terminology for adolescent girls in Zambia.

Return strictly a JSON object:
{
  "myth_statement": "...",
  "fact_explanation": "..."
}

ENGLISH:
MYTH: {$myth}
FACT: {$fact}
EOT;

        $response = $this->callGemini($prompt, $apiKey, $model);
        if (!$response) return null;

        $cleanJson = preg_replace('/^```(?:json)?\s*/i', '', trim($response));
        $cleanJson = preg_replace('/```$/', '', trim($cleanJson));

        $data = json_decode($cleanJson, true);
        if (json_last_error() === JSON_ERROR_NONE && isset($data['myth_statement'], $data['fact_explanation'])) {
            return $data;
        }

        return null;
    }

    private function callGemini(string $prompt, string $apiKey, string $model): ?string
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $payload = [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.2,
                'maxOutputTokens' => 2048,
            ]
        ];

        try {
            $res = Http::withoutVerifying()
                ->timeout(45)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($url, $payload);

            if ($res->successful()) {
                $json = $res->json();
                return $json['candidates'][0]['content']['parts'][0]['text'] ?? null;
            } else {
                Log::error("Gemini Translation Error: " . $res->status() . " - " . $res->body());
            }
        } catch (\Exception $e) {
            Log::error("Gemini Translation Exception: " . $e->getMessage());
        }

        return null;
    }
}
