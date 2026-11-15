<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HpczVerificationService
{
    /**
     * Validate HPCZ registration number format and optionally query an external HPCZ registry API.
     */
    public function verify(User $user, string $registrationNumber): array
    {
        $normalized = strtoupper(trim($registrationNumber));
        $isValidFormat = (bool) preg_match('/^[A-Z0-9\-\/]{5,25}$/', $normalized);

        if (!$isValidFormat) {
            $user->update([
                'hpcz_registration_number' => $normalized,
                'hpcz_verification_status' => 'rejected',
                'hpcz_verified_at' => null,
                'hpcz_verification_notes' => 'Invalid HPCZ registration number format.',
            ]);

            return [
                'status' => 'rejected',
                'verified' => false,
                'message' => 'Invalid HPCZ registration number format.',
            ];
        }

        $endpoint = config('services.hpcz.endpoint');
        if (!empty($endpoint)) {
            try {
                $response = Http::timeout(5)
                    ->withToken((string) config('services.hpcz.api_key'))
                    ->get($endpoint, ['registration_number' => $normalized]);

                if ($response->successful() && ($response->json('verified') === true)) {
                    $user->update([
                        'hpcz_registration_number' => $normalized,
                        'hpcz_verification_status' => 'verified',
                        'hpcz_verified_at' => now(),
                        'hpcz_verification_notes' => 'Verified via HPCZ registry API.',
                    ]);

                    return [
                        'status' => 'verified',
                        'verified' => true,
                        'message' => 'HPCZ credential verified via registry API.',
                    ];
                }

                if ($response->successful() && ($response->json('verified') === false)) {
                    $user->update([
                        'hpcz_registration_number' => $normalized,
                        'hpcz_verification_status' => 'rejected',
                        'hpcz_verified_at' => null,
                        'hpcz_verification_notes' => $response->json('reason', 'Not found in HPCZ registry.'),
                    ]);

                    return [
                        'status' => 'rejected',
                        'verified' => false,
                        'message' => 'HPCZ registration number was not found in registry.',
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning('HPCZ registry API lookup failed; falling back to admin queue.', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $user->update([
            'hpcz_registration_number' => $normalized,
            'hpcz_verification_status' => 'pending',
            'hpcz_verified_at' => null,
            'hpcz_verification_notes' => 'Format valid; awaiting Admin HPCZ verification.',
        ]);

        return [
            'status' => 'pending',
            'verified' => false,
            'message' => 'HPCZ number recorded and queued for Admin verification.',
        ];
    }

    public function adminSetStatus(User $user, string $status, ?string $notes = null): User
    {
        $user->update([
            'hpcz_verification_status' => $status,
            'hpcz_verified_at' => $status === 'verified' ? now() : null,
            'hpcz_verification_notes' => $notes ?? ($status === 'verified' ? 'Verified by Mwezi Admin.' : 'Rejected by Mwezi Admin.'),
        ]);

        return $user->fresh();
    }
}

