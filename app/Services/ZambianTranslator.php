<?php

namespace App\Services;

use InvalidArgumentException;
use Throwable;

class ZambianTranslator 
{
    private string $apiKey;
    private string $baseUrl;

    private array $supportedLanguages = [
        'bem'   => 'bem',
        'bemba' => 'bem',
        'nya'   => 'nya',
        'nyanja'=> 'nya',
        'loz'   => 'loz',
        'lozi'  => 'loz',
        'ton'   => 'ton',
        'toi'   => 'toi',
        'tonga' => 'ton',
    ];

    public function __construct(?string $apiKey = null, ?string $baseUrl = null) 
    {
        $this->apiKey = $apiKey ?? config('services.zedtranslate.api_key') ?? env('ZEDTRANSLATE_API_KEY', 'ZED_d26c1753d45849c9a02777ef46b0951d');
        $this->baseUrl = rtrim($baseUrl ?? config('services.zedtranslate.base_url') ?? env('ZEDTRANSLATE_BASE_URL', 'https://api.zedtranslate.com/v1'), '/');
    }

    /**
     * Translate text to/from English and a Zambian language (Bemba, Nyanja, Tonga, Lozi)
     *
     * @param string $text The text to translate
     * @param string $targetLanguage Language code ('bem', 'nya', 'loz', 'ton', 'toi' or 'bemba', etc.)
     * @param string $sourceLanguage Source language ('en' by default)
     * @return string|null Translated text or null on failure
     */
    public function translate(string $text, string $targetLanguage, string $sourceLanguage = 'en'): ?string 
    {
        $normalizedTarget = strtolower(trim($targetLanguage));
        $normalizedSource = strtolower(trim($sourceLanguage));

        if (!array_key_exists($normalizedTarget, $this->supportedLanguages) && $normalizedSource === 'en') {
            throw new InvalidArgumentException("Unsupported Zambian language code: {$targetLanguage}");
        }

        $apiTargetCode = $this->supportedLanguages[$normalizedTarget] ?? $normalizedTarget;

        // Build endpoint
        $endpoint = (str_ends_with($this->baseUrl, '/v1')) 
            ? $this->baseUrl . '/translate' 
            : $this->baseUrl . (str_contains($this->baseUrl, 'api.zedtranslate.com') ? '/v1/translate' : '/translate');

        $payload = [
            'text'    => $text,
            'source'  => $normalizedSource,
            'target'  => $apiTargetCode,
            'tone'    => 'neutral',
            'dialect' => 'standard'
        ];

        // Security headers required by ZedTranslate API v1
        $timestamp = (string)time();
        $nonce = bin2hex(random_bytes(16));

        $headers = [
            'Content-Type: application/json',
            'x-api-key: ' . $this->apiKey,
            'x-timestamp: ' . $timestamp,
            'x-nonce: ' . $nonce,
            'Authorization: Bearer ' . $this->apiKey
        ];

        try {
            $ch = curl_init($endpoint);
            
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode($payload),
                CURLOPT_HTTPHEADER     => $headers,
                CURLOPT_TIMEOUT        => 15,
                CURLOPT_SSL_VERIFYPEER => false // Windows local CA compatibility
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $response) {
                $data = json_decode($response, true);
                return $data['translatedText'] ?? $data['translated_text'] ?? null;
            }

            // Fallback attempt to alternate URL if primary endpoint failed
            if ($httpCode !== 200 && !str_contains($endpoint, 'api.zedtranslate.com')) {
                return $this->fallbackTranslate($payload, $headers);
            }
        } catch (Throwable $e) {
            report($e);
            return null;
        }

        return null;
    }

    /**
     * Fallback translation attempt against the live api.zedtranslate.com/v1/translate gateway
     */
    private function fallbackTranslate(array $payload, array $headers): ?string
    {
        try {
            $ch = curl_init('https://api.zedtranslate.com/v1/translate');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode($payload),
                CURLOPT_HTTPHEADER     => $headers,
                CURLOPT_TIMEOUT        => 15,
                CURLOPT_SSL_VERIFYPEER => false
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $response) {
                $data = json_decode($response, true);
                return $data['translatedText'] ?? $data['translated_text'] ?? null;
            }
        } catch (Throwable) {
            return null;
        }

        return null;
    }

    /**
     * Get list of supported languages
     */
    public function getSupportedLanguages(): array
    {
        return $this->supportedLanguages;
    }
}

