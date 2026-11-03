<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\CommunityServiceHub;
use App\Models\ProductAndEmergencyRequest;
use App\Models\EducationalResource;
use App\Models\SponsorshipCampaign;
use App\Models\Donation;
use App\Models\User;
use App\Models\MeImpactEvent;
use Carbon\Carbon;

class PortalController extends Controller
{
    /**
     * Community Partner Portal (Schools & NGOs)
     */
    public function partnerDashboard(Request $request): Response
    {
        $user = $request->user();

        // Get hub managed by user, or default to the first one for demonstration
        $hub = CommunityServiceHub::where('manager_user_id', $user->id)->first() 
            ?? CommunityServiceHub::first();

        $incomingRequests = ProductAndEmergencyRequest::where('assigned_hub_id', $hub?->id)
            ->with('user:id,name,phone')
            ->latest()
            ->get();

        $stats = [
            'total_requests' => $incomingRequests->count(),
            'pending_requests' => $incomingRequests->whereIn('status', ['submitted', 'acknowledged'])->count(),
            'fulfilled_requests' => $incomingRequests->where('status', 'fulfilled')->count(),
            'free_pad_stock' => $hub?->free_pad_stock_level ?? 'in_stock',
            'emergency_kit_stock' => $hub?->emergency_kit_stock_level ?? 'in_stock',
        ];

        return Inertia::render('Portal/PartnerDashboard', [
            'hub' => $hub,
            'requests' => $incomingRequests,
            'stats' => $stats,
        ]);
    }

    public function updateInventory(Request $request, CommunityServiceHub $hub)
    {
        $validated = $request->validate([
            'free_pad_stock_level' => 'required|in:in_stock,low_stock,out_of_stock',
            'emergency_kit_stock_level' => 'required|in:in_stock,low_stock,out_of_stock',
        ]);

        $hub->update([
            'free_pad_stock_level' => $validated['free_pad_stock_level'],
            'emergency_kit_stock_level' => $validated['emergency_kit_stock_level'],
            'last_inventory_update_at' => now(),
        ]);

        return back()->with('success', 'Hub stock levels updated successfully.');
    }

    public function fulfillRequest(Request $request, ProductAndEmergencyRequest $productRequest)
    {
        $validated = $request->validate([
            'status' => 'required|in:acknowledged,ready_for_pickup,dispatched,fulfilled,cancelled',
        ]);

        $productRequest->update([
            'status' => $validated['status'],
            'fulfilled_at' => in_array($validated['status'], ['fulfilled']) ? now() : $productRequest->fulfilled_at,
        ]);

        return back()->with('success', "Request {$productRequest->request_code} status updated to {$validated['status']}.");
    }

    /**
     * Healthcare Reviewer Portal (Doctors, Midwives, Clinics)
     */
    public function reviewerDashboard(Request $request): Response
    {
        $pendingArticles = EducationalResource::where('review_status', 'pending_medical_review')
            ->with(['category', 'author'])
            ->latest()
            ->get();

        $approvedArticles = EducationalResource::where('review_status', 'approved')
            ->with(['category', 'author', 'reviewer'])
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Portal/MedicalReview', [
            'pendingArticles' => $pendingArticles,
            'approvedArticles' => $approvedArticles,
        ]);
    }

    public function approveResource(Request $request, EducationalResource $resource)
    {
        $user = $request->user();

        $resource->update([
            'review_status' => 'approved',
            'reviewed_by_health_pro_id' => $user->id,
        ]);

        return back()->with('success', "Medical clearance granted for '{$resource->title}'.");
    }

    /**
     * Admin & M&E Analytics Portal
     */
    public function adminDashboard(Request $request): Response
    {
        $totalUsers = User::count();
        $totalPrimaryGirls = User::where('role', 'primary_user')->count();
        $totalHubs = CommunityServiceHub::where('verification_status', 'verified')->count();
        $totalRequests = ProductAndEmergencyRequest::count();
        $fulfilledRequests = ProductAndEmergencyRequest::where('status', 'fulfilled')->count();

        $campaign = SponsorshipCampaign::first();
        $totalDonationsZmw = Donation::where('payment_status', 'completed')->sum('amount_zmw');
        $girlsSponsored = Donation::where('payment_status', 'completed')->sum('girls_supported_count');

        $recentTelemetry = MeImpactEvent::latest('created_at')->take(15)->get();

        $kpis = [
            'total_users' => $totalUsers,
            'primary_girls' => $totalPrimaryGirls,
            'verified_hubs' => $totalHubs,
            'emergency_requests' => $totalRequests,
            'fulfilled_requests' => $fulfilledRequests,
            'fulfillment_rate' => $totalRequests > 0 ? round(($fulfilledRequests / $totalRequests) * 100) : 100,
            'funds_raised_zmw' => $totalDonationsZmw,
            'girls_sponsored' => $girlsSponsored,
        ];

        return Inertia::render('Portal/AdminDashboard', [
            'kpis' => $kpis,
            'campaign' => $campaign,
            'telemetry' => $recentTelemetry,
        ]);
    }
}

