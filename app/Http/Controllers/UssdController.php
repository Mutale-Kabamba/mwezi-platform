<?php

namespace App\Http\Controllers;

use App\Models\CommunityServiceHub;
use App\Models\CyclePrediction;
use App\Models\User;
use App\Services\SmsAlertService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UssdController extends Controller
{
    public function handle(Request $request, SmsAlertService $smsService): Response
    {
        $text = trim((string) $request->input('text', ''));
        $phone = $smsService->normalizeZambianPhone((string) $request->input('phoneNumber', ''));

        if ($text === '') {
            return response(
                "CON Welcome to Mwezi Zambia\n1. Check Cycle Forecast\n2. Nearest Free Pad Hubs\n3. 24/7 Crisis Helplines",
                200,
                ['Content-Type' => 'text/plain']
            );
        }

        $segments = explode('*', $text);
        $choice = $segments[0] ?? '';

        if ($choice === '1') {
            $user = $phone ? User::where('phone', $phone)->first() : null;
            if (!$user) {
                return response(
                    'END No Mwezi account found for this phone number. Register at Mwezi to activate SMS & USSD cycle tracking.',
                    200,
                    ['Content-Type' => 'text/plain']
                );
            }

            $prediction = CyclePrediction::where('user_id', $user->id)->latest()->first();
            if (!$prediction) {
                return response(
                    "END Hi {$user->name}, log your last period in Mwezi to activate cycle predictions.",
                    200,
                    ['Content-Type' => 'text/plain']
                );
            }

            $start = Carbon::parse($prediction->predicted_start_date);
            $days = max(0, (int) Carbon::now()->diffInDays($start, false));

            return response(
                "END Hi {$user->name}, your next expected period window starts {$start->format('d M Y')} (~{$days} days).",
                200,
                ['Content-Type' => 'text/plain']
            );
        }

        if ($choice === '2') {
            $hubs = CommunityServiceHub::where('verification_status', 'verified')
                ->where('offers_free_pads', true)
                ->take(3)
                ->get();

            if ($hubs->isEmpty()) {
                return response(
                    'END No verified free pad hubs are currently listed. Dial option 3 for support.',
                    200,
                    ['Content-Type' => 'text/plain']
                );
            }

            $lines = $hubs->map(fn ($h) => "- {$h->organization_name} ({$h->district})")->implode("\n");

            return response(
                "END Verified Mwezi Pad Hubs:\n{$lines}",
                200,
                ['Content-Type' => 'text/plain']
            );
        }

        if ($choice === '3') {
            return response(
                "END Zambia 24/7 Helplines:\n- Childline Zambia: 116\n- GBV & Emergency: 993 / 991",
                200,
                ['Content-Type' => 'text/plain']
            );
        }

        return response(
            'END Invalid option. Dial again to return to the Mwezi menu.',
            200,
            ['Content-Type' => 'text/plain']
        );
    }
}

