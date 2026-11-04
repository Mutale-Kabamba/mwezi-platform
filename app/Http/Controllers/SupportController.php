<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Faq;
use App\Models\CommunityServiceHub;
use App\Models\MenstrualProductCatalog;
use App\Models\ProductAndEmergencyRequest;
use App\Models\SponsorshipCampaign;
use App\Models\Donation;
use App\Models\SupportTicket;
use App\Models\HealthReferral;
use App\Models\MeImpactEvent;
use App\Services\BroadPayLencoService;
use Illuminate\Support\Str;

class SupportController extends Controller
{
    public function index(Request $request): Response
    {
        $faqs = Faq::orderBy('sort_order')->get();
        $user = $request->user();

        $activeRequests = ProductAndEmergencyRequest::where('user_id', $user->id)
            ->with('hub')
            ->latest()
            ->get();

        $userReferrals = HealthReferral::where('user_id', $user->id)
            ->with('hub')
            ->latest()
            ->get();

        $userTickets = SupportTicket::where('user_id', $user->id)
            ->latest()
            ->get();

        $campaign = SponsorshipCampaign::where('active', true)->first();

        return Inertia::render('Support/Index', [
            'faqs' => $faqs,
            'activeRequests' => $activeRequests,
            'userReferrals' => $userReferrals,
            'userTickets' => $userTickets,
            'campaign' => $campaign,
        ]);
    }

    public function requestView(Request $request): Response
    {
        $user = $request->user();

        $hubs = CommunityServiceHub::where('verification_status', 'verified')
            ->where(function ($q) {
                $q->where('offers_free_pads', true)
                  ->orWhere('offers_emergency_kits', true);
            })
            ->get();

        // Location & Default Hub Intelligence: prioritize user's default hub or matching district/province
        $sortedHubs = $hubs->sortByDesc(function ($hub) use ($user) {
            if ($user && $user->default_hub_id === $hub->id) return 30;
            if ($user && $user->district && $user->district === $hub->district) return 20;
            if ($user && $user->province && $user->province === $hub->province) return 10;
            return 0;
        })->values();

        $products = MenstrualProductCatalog::where('availability_status', 'available')
            ->get();

        return Inertia::render('Support/RequestSupplies', [
            'hubs' => $sortedHubs,
            'defaultHubId' => $user?->default_hub_id ?: ($sortedHubs->first()?->id ?? ''),
            'products' => $products,
        ]);
    }

    public function storeRequest(Request $request)
    {
        $validated = $request->validate([
            'assigned_hub_id' => 'required|exists:community_service_hubs,id',
            'request_type' => 'required|in:emergency_kit,free_monthly_pack,affordable_order',
            'urgency' => 'required|in:immediate_emergency,within_24h,standard',
            'delivery_method' => 'required|in:hub_pickup,school_focal_point,discreet_community_drop',
            'discreet_location_notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // 21-day fair-use dignity quota check for free monthly packs
        if ($validated['request_type'] === 'free_monthly_pack') {
            $recentPack = ProductAndEmergencyRequest::where('user_id', $user->id)
                ->where('request_type', 'free_monthly_pack')
                ->where('created_at', '>=', now()->subDays(21))
                ->whereIn('status', ['submitted', 'approved', 'fulfilled'])
                ->first();

            if ($recentPack) {
                return back()->withErrors([
                    'request_type' => 'Monthly dignity quota reached: To ensure equitable distribution across Zambia, free monthly packs are limited to one per 21 days. If this is an urgent school emergency, please select Emergency Kit.',
                ]);
            }
        }

        $requestCode = 'MWEZI-REQ-' . strtoupper(Str::random(6));

        $req = ProductAndEmergencyRequest::create([
            'request_code' => $requestCode,
            'user_id' => $user->id,
            'assigned_hub_id' => $validated['assigned_hub_id'],
            'request_type' => $validated['request_type'],
            'urgency' => $validated['urgency'],
            'delivery_method' => $validated['delivery_method'],
            'discreet_location_notes' => $validated['discreet_location_notes'] ?? null,
            'status' => 'submitted',
        ]);

        // Record M&E Telemetry
        $hub = CommunityServiceHub::find($validated['assigned_hub_id']);
        MeImpactEvent::create([
            'event_type' => 'emergency_request_fulfilled',
            'province' => $hub ? $hub->province : 'Lusaka',
            'district' => $hub ? $hub->district : 'Lusaka',
            'anonymized_cohort' => 'Community-Request',
            'metadata' => [
                'type' => $validated['request_type'],
                'urgency' => $validated['urgency'],
            ],
            'created_at' => now(),
        ]);

        return redirect()->route('support.index')->with('success', "Request {$requestCode} submitted successfully! Your chosen hub has been notified.");
    }

    public function mapView(Request $request): Response
    {
        $user = $request->user();
        $province = $request->query('province') ?: ($user?->province ?? null);
        $hubType = $request->query('hub_type');

        $query = CommunityServiceHub::where('verification_status', 'verified');

        if ($province) {
            $query->where('province', $province);
        }
        if ($hubType) {
            $query->where('hub_type', $hubType);
        }

        $hubs = $query->get();

        return Inertia::render('Support/DirectoryMap', [
            'hubs' => $hubs,
            'selectedProvince' => $province,
            'selectedHubType' => $hubType,
        ]);
    }

    public function sponsorView(Request $request): Response
    {
        $user = $request->user();
        $campaign = SponsorshipCampaign::where('active', true)->first();
        $recentDonations = Donation::where('payment_status', 'completed')
            ->latest()
            ->take(6)
            ->get();

        $myDonations = $user
            ? Donation::where('donor_user_id', $user->id)->with(['campaign', 'targetHub'])->latest()->get()
            : [];

        $hubs = CommunityServiceHub::where('verification_status', 'verified')->get();

        return Inertia::render('Support/Sponsor', [
            'campaign' => $campaign,
            'recentDonations' => $recentDonations,
            'myDonations' => $myDonations,
            'hubs' => $hubs,
            'paymentResult' => session('payment_result'),
            'lencoPublicKey' => config('services.lenco.public_key'),
        ]);
    }

    public function storeDonation(Request $request, BroadPayLencoService $broadPayService)
    {
        $validated = $request->validate([
            'donation_type' => 'required|in:sponsor_a_girl_monthly,sponsor_a_girl_annual,emergency_kit_bundle,reusable_pad_pack,custom_amount',
            'amount_zmw' => 'required|numeric|min:10',
            'donor_name' => 'nullable|string|max:100',
            'donor_email' => 'nullable|email',
            'donor_phone' => 'nullable|string|max:20',
            'payment_method' => 'required|string|in:broadpay_momo,broadpay_card',
            'target_hub_id' => 'nullable|exists:community_service_hubs,id',
        ]);

        $user = $request->user();
        $campaign = SponsorshipCampaign::where('active', true)->first();

        // Calculate girls supported estimate based on amount
        // ~ZMW 150 supports 1 girl with reusable pad kit & hygiene supplies
        $girlsSupported = max(1, (int) floor($validated['amount_zmw'] / 150));

        $donation = Donation::create([
            'campaign_id' => $campaign?->id,
            'donor_user_id' => $user?->id,
            'donor_name' => $validated['donor_name'] ?: ($user ? $user->name : 'Kind Supporter'),
            'donor_email' => $validated['donor_email'] ?: ($user ? $user->email : null),
            'donor_phone' => $validated['donor_phone'] ?? null,
            'donation_type' => $validated['donation_type'],
            'amount_zmw' => $validated['amount_zmw'],
            'girls_supported_count' => $girlsSupported,
            'target_hub_id' => $validated['target_hub_id'] ?? null,
            'payment_reference' => 'ZMW-SPON-' . strtoupper(Str::random(8)),
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'pending',
            'allocated_count' => 0,
        ]);

        // Process through Lenco by BroadPay payment gateway
        $paymentResult = $broadPayService->initiatePayment($donation, [
            'phone' => $validated['donor_phone'] ?? null,
        ]);

        // Redirect back for both registered and guest users
        $redirectRoute = $user ? 'support.sponsor' : 'public.sponsor';
        
        $msg = "Thank you deeply! Your sponsorship of ZMW {$validated['amount_zmw']} helps keep {$girlsSupported} schoolgirls learning with dignity. {$paymentResult['instruction']}";

        return redirect()->route($redirectRoute)->with([
            'success' => $msg,
            'payment_result' => $paymentResult,
        ]);
    }

    /**
     * Webhook Handler for BroadPay / Lenco Payment Gateway
     */
    public function handleBroadPayWebhook(Request $request, BroadPayLencoService $broadPayService)
    {
        $signature = $request->header('X-BroadPay-Signature') ?? $request->header('X-Lenco-Signature');
        $result = $broadPayService->handleWebhook($request->all(), $signature);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Real-time Payment Status Checker (Polling for mobile USSD approval)
     */
    public function verifyDonationStatus(string $reference, BroadPayLencoService $broadPayService)
    {
        $status = $broadPayService->verifyPaymentStatus($reference);
        return response()->json($status);
    }

    public function storeTicket(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:200',
            'description' => 'required|string|max:2000',
            'channel' => 'required|in:live_chat,email_support,helpline_callback',
            'priority' => 'required|in:emergency,urgent,normal',
        ]);

        $user = $request->user();
        $ticket = SupportTicket::create([
            'ticket_number' => 'TICK-' . strtoupper(Str::random(8)),
            'user_id' => $user->id,
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'channel' => $validated['channel'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);

        return back()->with('success', "Support ticket {$ticket->ticket_number} created. Our safeguarding team will respond promptly.");
    }

    /**
     * Update an active pending product/emergency request.
     */
    public function updateRequest(Request $request, ProductAndEmergencyRequest $productRequest)
    {
        if ($productRequest->user_id !== $request->user()->id || $productRequest->status !== 'submitted') {
            abort(403, 'Only newly submitted requests can be modified.');
        }

        $validated = $request->validate([
            'assigned_hub_id' => 'required|exists:community_service_hubs,id',
            'request_type' => 'required|in:emergency_kit,free_monthly_pack,affordable_order',
            'urgency' => 'required|in:immediate_emergency,within_24h,standard',
            'delivery_method' => 'required|in:hub_pickup,school_focal_point,discreet_community_drop',
            'discreet_location_notes' => 'nullable|string|max:500',
        ]);

        $productRequest->update($validated);

        return back()->with('success', 'Supply request updated successfully.');
    }

    /**
     * Cancel or delete a supply request while submitted.
     */
    public function destroyRequest(Request $request, ProductAndEmergencyRequest $productRequest)
    {
        if ($productRequest->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403);
        }

        if ($productRequest->status === 'submitted') {
            $productRequest->delete();
            return back()->with('success', 'Supply request cancelled and removed.');
        }

        $productRequest->update(['status' => 'cancelled']);
        return back()->with('success', 'Supply request marked as cancelled.');
    }

    /**
     * Create Clinical Referral Voucher.
     */
    public function storeReferral(Request $request)
    {
        $validated = $request->validate([
            'hub_id' => 'required|exists:community_service_hubs,id',
            'referral_reason_category' => 'required|in:severe_pain,irregular_bleeding,infection_concern,counseling_support,clinical_escalation_severe_symptoms',
            'notes' => 'nullable|string|max:500',
            'is_anonymous_voucher' => 'required|boolean',
        ]);

        $user = $request->user();
        $referral = HealthReferral::create([
            'user_id' => $user->id,
            'hub_id' => $validated['hub_id'],
            'referral_reason_category' => $validated['referral_reason_category'],
            'notes' => $validated['notes'] ?? 'Self-service clinical triage voucher',
            'status' => 'generated',
            'is_anonymous_voucher' => $validated['is_anonymous_voucher'],
        ]);

        $code = 'MWZ-CLINIC-' . str_pad($referral->id, 4, '0', STR_PAD_LEFT);
        return back()->with('success', "Referral voucher {$code} generated successfully.");
    }

    /**
     * Update Clinical Referral Voucher.
     */
    public function updateReferral(Request $request, HealthReferral $referral)
    {
        $user = $request->user();
        if ($referral->user_id !== $user->id && !in_array($user->role, ['health_reviewer', 'admin'], true)) {
            abort(403);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
            'status' => 'nullable|in:generated,appointment_requested,completed',
        ]);

        $referral->update($validated);
        return back()->with('success', 'Referral voucher updated.');
    }

    /**
     * Delete Clinical Referral Voucher.
     */
    public function destroyReferral(Request $request, HealthReferral $referral)
    {
        $user = $request->user();
        if ($referral->user_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        $referral->delete();
        return back()->with('success', 'Referral voucher removed.');
    }

    /**
     * Update Support Ticket.
     */
    public function updateTicket(Request $request, SupportTicket $ticket)
    {
        $user = $request->user();
        if ($ticket->user_id !== $user->id) {
            abort(403);
        }
        if ($ticket->status === 'resolved') {
            abort(403, 'Resolved tickets cannot be updated.');
        }

        $validated = $request->validate([
            'description' => 'required|string|max:2000',
            'priority' => 'nullable|in:emergency,urgent,normal',
        ]);

        $ticket->update($validated);
        return back()->with('success', 'Support ticket updated.');
    }

    /**
     * Close or Delete Support Ticket.
     */
    public function destroyTicket(Request $request, SupportTicket $ticket)
    {
        $user = $request->user();
        if ($ticket->user_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        $ticket->delete();
        return back()->with('success', 'Support ticket closed and deleted.');
    }

    /**
     * Update Donation Attribution (Donor Sponsor).
     */
    public function updateDonation(Request $request, Donation $donation)
    {
        $user = $request->user();
        if ($donation->donor_user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'donor_name' => 'required|string|max:100',
            'donor_email' => 'nullable|email',
            'target_hub_id' => 'nullable|exists:community_service_hubs,id',
        ]);

        $donation->update($validated);
        return back()->with('success', 'Donation attribution updated.');
    }

    /**
     * Cancel / Delete Pending Donation (Donor Sponsor).
     */
    public function destroyDonation(Request $request, Donation $donation)
    {
        $user = $request->user();
        if ($donation->donor_user_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        if ($donation->payment_status === 'completed') {
            abort(403, 'Completed donations cannot be removed.');
        }

        $donation->delete();
        return back()->with('success', 'Pending donation pledge cancelled.');
    }
}

