<?php

namespace App\Console\Commands;

use App\Models\CyclePrediction;
use App\Models\TrustedConnection;
use App\Services\SmsAlertService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendCompanionReadinessAlerts extends Command
{
    protected $signature = 'mwezi:send-readiness-alerts {--days=2 : Days before predicted start to trigger reminder}';

    protected $description = 'Send discreet SMS cycle readiness reminders to active Trusted Companions.';

    public function handle(SmsAlertService $smsService): int
    {
        $leadDays = max(1, (int) $this->option('days'));
        $connections = TrustedConnection::where('status', 'active')
            ->with(['primaryUser', 'trustedUser'])
            ->get();

        $sentCount = 0;

        foreach ($connections as $connection) {
            $permissions = $connection->permissions ?? [];
            if (array_key_exists('care_reminders', $permissions) && !$permissions['care_reminders']) {
                continue;
            }

            $prediction = CyclePrediction::where('user_id', $connection->primary_user_id)->latest()->first();
            if (!$prediction) {
                continue;
            }

            $daysUntil = (int) Carbon::now()->diffInDays(Carbon::parse($prediction->predicted_start_date), false);
            if ($daysUntil >= 0 && $daysUntil <= $leadDays) {
                $log = $smsService->sendCompanionReadinessAlert($connection, $daysUntil);
                if ($log) {
                    $sentCount++;
                }
            }
        }

        $this->info("Dispatched {$sentCount} companion readiness alert(s).");

        return self::SUCCESS;
    }
}

