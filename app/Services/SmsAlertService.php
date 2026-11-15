<?php

namespace App\Services;

use App\Models\ProductAndEmergencyRequest;
use App\Models\SmsAlertLog;
use App\Models\TrustedConnection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SmsAlertService
{
    /**
     * Normalize a Zambian phone number to +260XXXXXXXXX format.
     */
    public function normalizeZambianPhone(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $phone);
        if (empty($digits)) {
            return null;
        }

        if (str_starts_with($digits, '260') && strlen($digits) === 12) {
            return '+' . $digits;
        }

        if (str_starts_with($digits, '0') && strlen($digits) === 10) {
            return '+260' . substr($digits, 1);
        }

        if (strlen($digits) === 9) {
            return '+260' . $digits;
        }

        return '+' . $digits;
    }

    /**
     * Dispatch an SMS alert via configured driver (africastalking or log fallback) and record SmsAlertLog.
     */
    public function send(string $recipientPhone, string $message, string $alertType, ?int $userId = null): ?SmsAlertLog
    {
        $normalized = $this->normalizeZambianPhone($recipientPhone);
        if (!$normalized) {
            return null;
        }

        $driver = config('services.sms.driver', 'log');
        $status = 'sent';
        $reference = 'SIM-' . strtoupper(Str::random(8));

        if ($driver === 'africastalking' && !empty(config('services.sms.api_key'))) {
            try {
                $response = Http::timeout(8)
                    ->withHeaders([
                        'apiKey' => (string) config('services.sms.api_key'),
                        'Accept' => 'application/json',
                    ])
                    ->asForm()
                    ->post(config('services.sms.endpoint', 'https://api.africastalking.com/version1/messaging'), [
                        'username' => config('services.sms.username', 'sandbox'),
                        'to' => $normalized,
                        'message' => $message,
                    ]);

                if ($response->successful()) {
                    $reference = data_get($response->json(), 'SMSMessageData.Recipients.0.messageId', $reference);
                } else {
                    $status = 'failed';
                }
            } catch (\Throwable $e) {
                $status = 'failed';
                Log::error('SMS dispatch failed', [
                    'phone' => $normalized,
                    'alert_type' => $alertType,
                    'error' => $e->getMessage(),
                ]);
            }
        } else {
            Log::info("Mwezi SMS [{$alertType}] -> {$normalized}: {$message}");
        }

        return SmsAlertLog::create([
            'user_id' => $userId,
            'recipient_phone' => $normalized,
            'alert_type' => $alertType,
            'message' => $message,
            'provider' => $driver,
            'status' => $status,
            'provider_reference' => $reference,
        ]);
    }

    /**
     * Send a discreet cycle readiness reminder to an active Trusted Companion.
     */
    public function sendCompanionReadinessAlert(TrustedConnection $connection, int $daysUntil): ?SmsAlertLog
    {
        $phone = $connection->trustedUser?->phone ?: $connection->contact_channel;
        if (empty($phone) || str_contains((string) $phone, '@')) {
            return null;
        }

        $name = $connection->primaryUser?->name ?? 'your loved one';
        $message = "Mwezi Care Reminder: {$name}'s next expected cycle window is in ~{$daysUntil} day(s). "
            . 'Consider checking sanitary pad supplies and offering warm comfort.';

        return $this->send($phone, $message, 'companion_readiness', $connection->trusted_user_id);
    }

    /**
     * Send a discreet supply pickup/dispatch SMS to the requesting user.
     */
    public function sendSupplyPickupAlert(ProductAndEmergencyRequest $request): ?SmsAlertLog
    {
        $phone = $request->user?->phone;
        if (empty($phone)) {
            return null;
        }

        $hubName = $request->hub?->organization_name ?? 'your assigned Mwezi Hub';
        $statusLabel = $request->status === 'dispatched' ? 'dispatched' : 'ready for pickup';
        $message = "Mwezi Hub Update ({$request->request_code}): Your requested supplies are {$statusLabel} at {$hubName}.";

        return $this->send($phone, $message, 'supply_pickup', $request->user_id);
    }
}

