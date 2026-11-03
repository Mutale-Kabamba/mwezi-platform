<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\CycleProfile;
use App\Models\CycleLog;
use App\Models\CyclePrediction;
use App\Models\EducationalResource;
use App\Models\ProductAndEmergencyRequest;
use App\Models\CommunityServiceHub;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Fetch Cycle Profile & Prediction
        $profile = CycleProfile::where('user_id', $user->id)->first();
        $prediction = CyclePrediction::where('user_id', $user->id)->latest()->first();

        // Calculate cycle phase and countdown
        $cycleInfo = [
            'phase' => 'Follicular Phase',
            'days_until_next' => 14,
            'phase_description' => 'Estrogen is steadily rising. Energy levels and mental focus are naturally high today.',
            'next_period_date' => Carbon::now()->addDays(14)->format('M d, Y'),
            'ovulation_status' => 'Ovulation in ~4 days',
            'has_logged_today' => false,
        ];

        if ($prediction) {
            $predictedStart = Carbon::parse($prediction->predicted_start_date);
            $diff = (int) Carbon::now()->diffInDays($predictedStart, false);
            $cycleInfo['days_until_next'] = max(0, $diff);
            $cycleInfo['next_period_date'] = $predictedStart->format('M d, Y');

            // Check if user is in period window or ovulation
            if ($diff < 0 && abs($diff) < ($profile?->average_period_length ?? 5)) {
                $cycleInfo['phase'] = 'Menstrual Phase';
                $cycleInfo['phase_description'] = 'Your cycle is active. Prioritize hydration, warm comfort, and restorative rest.';
            } elseif ($diff > 10 && $diff <= 16) {
                $cycleInfo['phase'] = 'Ovulation Window';
                $cycleInfo['phase_description'] = 'Peak hormonal vitality and natural energy. Stay hydrated!';
            } elseif ($diff <= 7 && $diff >= 0) {
                $cycleInfo['phase'] = 'Luteal Phase';
                $cycleInfo['phase_description'] = 'Progesterone is peaking. Be gentle with yourself and prepare your dignity kit.';
            }
        }

        // Check if logged today
        $todayLog = CycleLog::where('user_id', $user->id)
            ->whereDate('logged_date', Carbon::today())
            ->first();

        $cycleInfo['has_logged_today'] = !is_null($todayLog);
        $cycleInfo['today_flow'] = $todayLog ? $todayLog->flow_intensity : null;

        // 2. Featured Educational Guide (e.g. Reusable pad care)
        $featuredArticle = EducationalResource::where('is_featured', true)
            ->where('review_status', 'approved')
            ->with('category')
            ->first();

        // 3. User's recent requests
        $recentRequests = ProductAndEmergencyRequest::where('user_id', $user->id)
            ->with('hub')
            ->latest()
            ->take(2)
            ->get();

        // 4. Quick nearby hub status count
        $nearbyHubsCount = CommunityServiceHub::where('verification_status', 'verified')->count();

        // Daily wellbeing affirmation
        $affirmations = [
            "Your cycle is a natural strength and a vital sign of health.",
            "Take pride in caring for your body today with dignity.",
            "Rest when needed, move with joy, and know you are fully supported.",
            "Every stage of your cycle brings unique gifts and intuition."
        ];
        $dailyTip = $affirmations[date('j') % count($affirmations)];

        return Inertia::render('Dashboard', [
            'cycleInfo' => $cycleInfo,
            'featuredArticle' => $featuredArticle,
            'recentRequests' => $recentRequests,
            'nearbyHubsCount' => $nearbyHubsCount,
            'dailyTip' => $dailyTip,
        ]);
    }
}

