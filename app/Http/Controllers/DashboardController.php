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

        // 1. Fetch or initialize Cycle Profile & Prediction (Available to all users)
        $profile = CycleProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'average_cycle_length' => 28,
                'average_period_length' => 5,
                'last_period_start' => Carbon::now()->subDays(14)->toDateString(),
            ]
        );
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
        $cycleInfo['is_first_year_menarche'] = (bool) ($profile?->is_first_year_menarche ?? false);
        $cycleInfo['average_cycle_length'] = $profile?->average_cycle_length ?? 28;

        // 2. Featured Educational Guide (prioritize reusable pad care if preferred)
        $featuredQuery = EducationalResource::where('review_status', 'approved')->with('category');
        if ($profile && in_array($profile->preferred_product_type, ['reusable_pads', 'need_supplies'], true)) {
            $reusableGuide = (clone $featuredQuery)
                ->where(function ($q) {
                    $q->where('slug', 'like', '%reusable%')
                      ->orWhere('title', 'like', '%reusable%')
                      ->orWhere('title', 'like', '%washing%');
                })
                ->first();
            $featuredArticle = $reusableGuide ?: $featuredQuery->where('is_featured', true)->first();
        } else {
            $featuredArticle = $featuredQuery->where('is_featured', true)->first();
        }

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

        // 5. Incoming Companion Invitations & Active Companion Support Hubs
        $pendingCompanionRequests = \App\Models\TrustedConnection::where('trusted_user_id', $user->id)
            ->where('status', 'pending')
            ->with('primaryUser:id,name')
            ->get();

        $companionCareSummaries = \App\Models\TrustedConnection::where('trusted_user_id', $user->id)
            ->where('status', 'active')
            ->with('primaryUser:id,name')
            ->get()
            ->map(function ($conn) {
                $prediction = CyclePrediction::where('user_id', $conn->primary_user_id)->latest()->first();
                $daysUntil = 14;
                $predictedDate = 'Upcoming Window';
                if ($prediction) {
                    $start = Carbon::parse($prediction->predicted_start_date);
                    $diff = (int) Carbon::now()->diffInDays($start, false);
                    $daysUntil = max(0, $diff);
                    $predictedDate = $start->format('M d, Y');
                }
                return [
                    'connection_id' => $conn->id,
                    'primary_name' => $conn->contact_name ?: ($conn->primaryUser?->name ?? 'Loved One'),
                    'relationship' => $conn->relationship,
                    'days_until_next' => $daysUntil,
                    'predicted_start_date' => $predictedDate,
                    'permissions' => $conn->permissions ?? [],
                ];
            });

        // 6. Role-Specific Operational Management Data
        $partnerManagement = null;
        if ($user->role === 'community_partner' || $user->role === 'admin') {
            $hub = CommunityServiceHub::where('manager_user_id', $user->id)->first()
                ?? ($user->role === 'admin' ? CommunityServiceHub::first() : null);

            if ($hub) {
                $pendingHubRequests = ProductAndEmergencyRequest::where('assigned_hub_id', $hub->id)
                    ->whereIn('status', ['submitted', 'acknowledged'])
                    ->with('user:id,name,phone')
                    ->latest()
                    ->get();

                $partnerManagement = [
                    'hub_id' => $hub->id,
                    'hub_name' => $hub->organization_name,
                    'hub_type' => $hub->hub_type,
                    'location' => "{$hub->district}, {$hub->province}",
                    'free_pads_qty' => $hub->free_pads_qty ?? 0,
                    'emergency_kits_qty' => $hub->emergency_kits_qty ?? 0,
                    'reusable_pads_stock' => $hub->current_reusable_pads_stock ?? 0,
                    'stock_status' => $hub->free_pad_stock_level ?? 'in_stock',
                    'pending_requests_count' => $pendingHubRequests->count(),
                    'recent_pending_requests' => $pendingHubRequests->take(3),
                ];
            }
        }

        $reviewerManagement = null;
        if ($user->role === 'health_reviewer' || $user->role === 'admin') {
            $pendingArticles = EducationalResource::where('review_status', 'pending_medical_review')
                ->with('category')
                ->latest()
                ->get();

            $reviewerManagement = [
                'pending_articles_count' => $pendingArticles->count(),
                'approved_articles_count' => EducationalResource::where('review_status', 'approved')->count(),
                'myths_count' => \App\Models\MythAndFact::count(),
                'referrals_count' => \App\Models\HealthReferral::where('status', 'referred')->count(),
                'recent_pending_articles' => $pendingArticles->take(3),
            ];
        }

        return Inertia::render('Dashboard', [
            'cycleInfo' => $cycleInfo,
            'cycleProfile' => $profile,
            'todayLog' => $todayLog,
            'featuredArticle' => $featuredArticle,
            'recentRequests' => $recentRequests,
            'nearbyHubsCount' => $nearbyHubsCount,
            'dailyTip' => $dailyTip,
            'pendingCompanionRequests' => $pendingCompanionRequests,
            'companionCareSummaries' => $companionCareSummaries,
            'partnerManagement' => $partnerManagement,
            'reviewerManagement' => $reviewerManagement,
        ]);
    }
}

