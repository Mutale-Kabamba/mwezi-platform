<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\CommunityServiceHub;
use App\Models\ProductAndEmergencyRequest;
use App\Models\EducationalResource;
use App\Models\EducationalCategory;
use App\Models\EducationalResourceTranslation;
use App\Models\SponsorshipCampaign;
use App\Models\Donation;
use App\Models\User;
use App\Models\MeImpactEvent;
use App\Models\MenstrualProductCatalog;
use App\Models\MythAndFact;
use App\Models\LunaKnowledgeChunk;
use App\Models\HealthReferral;
use App\Models\CommunityTopic;
use App\Models\CommunityPost;
use App\Models\CommunityComment;
use App\Models\Faq;
use App\Models\SupportTicket;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PortalController extends Controller
{
    // ==========================================
    // 1. COMMUNITY PARTNER (SCHOOLS & NGOS)
    // ==========================================

    public function partnerDashboard(Request $request): Response
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $hub = CommunityServiceHub::first();
        } else {
            $hub = CommunityServiceHub::where('manager_user_id', $user->id)->first();
        }

        $incomingRequests = ProductAndEmergencyRequest::where('assigned_hub_id', $hub?->id)
            ->with('user:id,name,phone')
            ->latest()
            ->get();

        $catalogProducts = MenstrualProductCatalog::where('hub_id', $hub?->id)
            ->latest()
            ->get();

        $myDrafts = EducationalResource::where('author_id', $user->id)
            ->with('category')
            ->latest()
            ->get();

        $categories = EducationalCategory::all();

        $stats = [
            'total_requests' => $incomingRequests->count(),
            'pending_requests' => $incomingRequests->whereIn('status', ['submitted', 'acknowledged'])->count(),
            'fulfilled_requests' => $incomingRequests->where('status', 'fulfilled')->count(),
            'free_pad_stock' => $hub?->free_pad_stock_level ?? 'in_stock',
            'emergency_kit_stock' => $hub?->emergency_kit_stock_level ?? 'in_stock',
            'free_pads_qty' => $hub?->free_pads_qty ?? 0,
            'emergency_kits_qty' => $hub?->emergency_kits_qty ?? 0,
            'reusable_pads_stock' => $hub?->current_reusable_pads_stock ?? 0,
        ];

        return Inertia::render('Portal/PartnerDashboard', [
            'hub' => $hub,
            'requests' => $incomingRequests,
            'catalogProducts' => $catalogProducts,
            'myDrafts' => $myDrafts,
            'categories' => $categories,
            'stats' => $stats,
        ]);
    }

    public function storeHub(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'organization_name' => 'required|string|max:150',
            'hub_type' => 'required|in:school,ngo,clinic,pharmacy,youth_center,safe_space',
            'province' => 'required|string|max:50',
            'district' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'contact_phone' => 'nullable|string|max:30',
            'operating_hours' => 'nullable|string|max:100',
            'free_pads_qty' => 'nullable|integer|min:0',
            'emergency_kits_qty' => 'nullable|integer|min:0',
            'current_reusable_pads_stock' => 'nullable|integer|min:0',
            'languages_spoken' => 'nullable|array',
        ]);

        $hub = CommunityServiceHub::create([
            'manager_user_id' => $user->id,
            'organization_name' => $validated['organization_name'],
            'hub_type' => $validated['hub_type'],
            'province' => $validated['province'],
            'district' => $validated['district'],
            'address' => $validated['address'],
            'contact_phone' => $validated['contact_phone'] ?? $user->phone,
            'operating_hours' => $validated['operating_hours'] ?? 'Mon - Fri: 08:00 - 16:00',
            'free_pads_qty' => $validated['free_pads_qty'] ?? 100,
            'emergency_kits_qty' => $validated['emergency_kits_qty'] ?? 50,
            'current_reusable_pads_stock' => $validated['current_reusable_pads_stock'] ?? 50,
            'languages_spoken' => $validated['languages_spoken'] ?? ['en', 'bem', 'nya'],
            'verification_status' => 'pending',
            'last_inventory_update_at' => now(),
        ]);
        $hub->recalculateStockLevels();

        return back()->with('success', 'Hub profile registered.');
    }

    public function updateHub(Request $request, CommunityServiceHub $hub)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $hub->manager_user_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'organization_name' => 'required|string|max:150',
            'hub_type' => 'required|in:school,ngo,clinic,pharmacy,youth_center,safe_space',
            'province' => 'required|string|max:50',
            'district' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'contact_phone' => 'nullable|string|max:30',
            'operating_hours' => 'nullable|string|max:100',
            'offers_free_pads' => 'nullable|boolean',
            'offers_emergency_kits' => 'nullable|boolean',
            'offers_reusable_pads' => 'nullable|boolean',
            'offers_health_referrals' => 'nullable|boolean',
            'free_pads_qty' => 'nullable|integer|min:0',
            'emergency_kits_qty' => 'nullable|integer|min:0',
            'current_reusable_pads_stock' => 'nullable|integer|min:0',
            'languages_spoken' => 'nullable|array',
        ]);

        $hub->update($validated);
        $hub->recalculateStockLevels();

        return back()->with('success', 'Hub details and stock levels updated.');
    }

    public function destroyHub(Request $request, CommunityServiceHub $hub)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $hub->manager_user_id !== $user->id) {
            abort(403);
        }

        $hub->update(['verification_status' => 'suspended']);

        return back()->with('info', 'Hub operations suspended.');
    }

    public function updateInventory(Request $request, CommunityServiceHub $hub)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $hub->manager_user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'free_pad_stock_level' => 'required|in:in_stock,low_stock,out_of_stock',
            'emergency_kit_stock_level' => 'required|in:in_stock,low_stock,out_of_stock',
            'free_pads_qty' => 'nullable|integer|min:0',
            'emergency_kits_qty' => 'nullable|integer|min:0',
            'current_reusable_pads_stock' => 'nullable|integer|min:0',
        ]);

        $hub->update([
            'free_pad_stock_level' => $validated['free_pad_stock_level'],
            'emergency_kit_stock_level' => $validated['emergency_kit_stock_level'],
            'free_pads_qty' => $validated['free_pads_qty'] ?? $hub->free_pads_qty,
            'emergency_kits_qty' => $validated['emergency_kits_qty'] ?? $hub->emergency_kits_qty,
            'current_reusable_pads_stock' => $validated['current_reusable_pads_stock'] ?? $hub->current_reusable_pads_stock,
            'last_inventory_update_at' => now(),
        ]);

        return back()->with('success', 'Hub stock levels updated.');
    }

    public function fulfillRequest(Request $request, ProductAndEmergencyRequest $productRequest)
    {
        $user = $request->user();
        $hub = $productRequest->hub;

        if ($user->role !== 'admin' && (!$hub || $hub->manager_user_id !== $user->id)) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:acknowledged,ready_for_pickup,dispatched,fulfilled,cancelled',
        ]);

        $newStatus = $validated['status'];
        $wasAlreadyFulfilled = !is_null($productRequest->fulfilled_at);

        $productRequest->status = $newStatus;

        if ($newStatus === 'fulfilled' && !$wasAlreadyFulfilled) {
            $productRequest->fulfilled_at = now();

            if ($hub) {
                if ($productRequest->request_type === 'emergency_kit') {
                    $hub->emergency_kits_qty = max(0, $hub->emergency_kits_qty - 1);
                } elseif ($productRequest->request_type === 'free_monthly_pack') {
                    $hub->free_pads_qty = max(0, $hub->free_pads_qty - 1);
                } elseif ($productRequest->request_type === 'affordable_order') {
                    $hub->current_reusable_pads_stock = max(0, $hub->current_reusable_pads_stock - 1);
                }

                $hub->recalculateStockLevels();
                $hub->save();
            }
        }

        $productRequest->save();

        return back()->with('success', "Request {$productRequest->request_code} updated to {$validated['status']}.");
    }

    // Menstrual Product Catalog CRUD (Partner)
    public function storeProduct(Request $request)
    {
        $user = $request->user();
        $hub = CommunityServiceHub::where('manager_user_id', $user->id)->first() ?? CommunityServiceHub::first();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'product_type' => 'required|in:disposable_pads,reusable_pads,menstrual_cup,emergency_kit,pain_relief',
            'price_zmw' => 'required|numeric|min:0',
            'is_subsidized' => 'required|boolean',
            'description' => 'required|string|max:1000',
            'care_instructions' => 'nullable|string|max:1000',
            'availability_status' => 'required|in:available,low_stock,out_of_stock',
        ]);

        MenstrualProductCatalog::create([
            'hub_id' => $hub?->id,
            'name' => $validated['name'],
            'product_type' => $validated['product_type'],
            'price_zmw' => $validated['price_zmw'],
            'is_subsidized' => $validated['is_subsidized'],
            'description' => $validated['description'],
            'care_instructions' => $validated['care_instructions'] ?? null,
            'availability_status' => $validated['availability_status'],
        ]);

        return back()->with('success', 'Product added to hub catalog.');
    }

    public function updateProduct(Request $request, MenstrualProductCatalog $product)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $product->hub?->manager_user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'product_type' => 'required|in:disposable_pads,reusable_pads,menstrual_cup,emergency_kit,pain_relief',
            'price_zmw' => 'required|numeric|min:0',
            'is_subsidized' => 'required|boolean',
            'description' => 'required|string|max:1000',
            'care_instructions' => 'nullable|string|max:1000',
            'availability_status' => 'required|in:available,low_stock,out_of_stock',
        ]);

        $product->update($validated);

        return back()->with('success', 'Product updated.');
    }

    public function destroyProduct(Request $request, MenstrualProductCatalog $product)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $product->hub?->manager_user_id !== $user->id) {
            abort(403);
        }

        $product->delete();

        return back()->with('success', 'Product removed from catalog.');
    }

    // Partner Guide Drafts CRUD
    public function storePartnerResource(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'category_id' => 'required|exists:educational_categories,id',
            'title' => 'required|string|max:200',
            'summary' => 'required|string|max:500',
            'body_content' => 'required|string',
            'format' => 'required|in:article,checklist,infographic,audio_guide',
            'read_time_minutes' => 'nullable|integer|min:1',
        ]);

        EducationalResource::create([
            'category_id' => $validated['category_id'],
            'author_id' => $user->id,
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . rand(100, 999),
            'summary' => $validated['summary'],
            'body_content' => $validated['body_content'],
            'format' => $validated['format'],
            'read_time_minutes' => $validated['read_time_minutes'] ?? 4,
            'review_status' => 'pending_medical_review',
        ]);

        return back()->with('success', 'Draft submitted for healthcare professional review.');
    }

    public function updatePartnerResource(Request $request, EducationalResource $resource)
    {
        $user = $request->user();
        if ($resource->author_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'summary' => 'required|string|max:500',
            'body_content' => 'required|string',
            'format' => 'required|in:article,checklist,infographic,audio_guide',
            'read_time_minutes' => 'nullable|integer|min:1',
        ]);

        $resource->update([
            ...$validated,
            'review_status' => 'pending_medical_review',
        ]);

        return back()->with('success', 'Resource updated and re-submitted for review.');
    }

    public function destroyPartnerResource(Request $request, EducationalResource $resource)
    {
        $user = $request->user();
        if ($resource->author_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        $resource->delete();

        return back()->with('success', 'Draft resource removed.');
    }

    // ==========================================
    // 2. HEALTHCARE REVIEWER (CLINICIANS)
    // ==========================================

    public function reviewerDashboard(Request $request): Response
    {
        $pendingArticles = EducationalResource::where('review_status', 'pending_medical_review')
            ->with(['category', 'author'])
            ->latest()
            ->get();

        $approvedArticles = EducationalResource::where('review_status', 'approved')
            ->with(['category', 'author', 'reviewer', 'translations'])
            ->latest()
            ->get();

        $myths = MythAndFact::with(['category', 'verifier'])->latest()->get();
        $knowledgeChunks = LunaKnowledgeChunk::with('resource')->latest()->get();
        $referrals = HealthReferral::with(['hub', 'user:id,name,phone,province,district'])->latest()->get();
        $categories = EducationalCategory::all();

        return Inertia::render('Portal/MedicalReview', [
            'pendingArticles' => $pendingArticles,
            'approvedArticles' => $approvedArticles,
            'myths' => $myths,
            'knowledgeChunks' => $knowledgeChunks,
            'referrals' => $referrals,
            'categories' => $categories,
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

    public function storeReviewerResource(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'category_id' => 'required|exists:educational_categories,id',
            'title' => 'required|string|max:200',
            'summary' => 'required|string|max:500',
            'body_content' => 'required|string',
            'format' => 'required|in:article,checklist,infographic,audio_guide',
            'read_time_minutes' => 'nullable|integer|min:1',
        ]);

        EducationalResource::create([
            'category_id' => $validated['category_id'],
            'author_id' => $user->id,
            'reviewed_by_health_pro_id' => $user->id,
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . rand(100, 999),
            'summary' => $validated['summary'],
            'body_content' => $validated['body_content'],
            'format' => $validated['format'],
            'read_time_minutes' => $validated['read_time_minutes'] ?? 4,
            'review_status' => 'approved',
        ]);

        return back()->with('success', 'Clinical resource published directly.');
    }

    public function updateReviewerResource(Request $request, EducationalResource $resource)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'summary' => 'required|string|max:500',
            'body_content' => 'required|string',
            'format' => 'required|in:article,checklist,infographic,audio_guide',
            'read_time_minutes' => 'nullable|integer|min:1',
            'review_status' => 'required|in:draft,pending_medical_review,approved,archived',
        ]);

        $resource->update([
            ...$validated,
            'reviewed_by_health_pro_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Resource updated.');
    }

    public function destroyReviewerResource(Request $request, EducationalResource $resource)
    {
        $resource->delete();
        return back()->with('success', 'Resource deleted.');
    }

    public function storeTranslation(Request $request, EducationalResource $resource)
    {
        $validated = $request->validate([
            'locale' => 'required|in:en,bem,nya,toi,loz',
            'translated_title' => 'required|string|max:200',
            'translated_summary' => 'required|string|max:500',
            'translated_body' => 'required|string',
            'audio_narration_url' => 'nullable|url',
        ]);

        EducationalResourceTranslation::updateOrCreate(
            [
                'resource_id' => $resource->id,
                'locale' => $validated['locale'],
            ],
            $validated
        );

        return back()->with('success', "Translation ({$validated['locale']}) saved.");
    }

    public function destroyTranslation(Request $request, EducationalResourceTranslation $translation)
    {
        $translation->delete();
        return back()->with('success', 'Translation deleted.');
    }

    // Myths & Facts CRUD (Reviewer)
    public function storeMyth(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'category_id' => 'required|exists:educational_categories,id',
            'myth_statement' => 'required|string|max:500',
            'fact_explanation' => 'required|string|max:1500',
            'locale' => 'required|in:en,bem,nya,toi,loz',
        ]);

        MythAndFact::create([
            ...$validated,
            'verified_by_id' => $user->id,
        ]);

        return back()->with('success', 'Myth & Fact verified and published.');
    }

    public function updateMyth(Request $request, MythAndFact $myth)
    {
        $validated = $request->validate([
            'myth_statement' => 'required|string|max:500',
            'fact_explanation' => 'required|string|max:1500',
            'locale' => 'required|in:en,bem,nya,toi,loz',
        ]);

        $myth->update($validated);

        return back()->with('success', 'Myth & Fact updated.');
    }

    public function destroyMyth(Request $request, MythAndFact $myth)
    {
        $myth->delete();
        return back()->with('success', 'Myth & Fact removed.');
    }

    // Luna Knowledge Chunks CRUD (Reviewer)
    public function storeChunk(Request $request)
    {
        $validated = $request->validate([
            'resource_id' => 'nullable|exists:educational_resources,id',
            'chunk_text' => 'required|string|max:3000',
            'topic_tags' => 'nullable|array',
            'approved_for_ai' => 'required|boolean',
        ]);

        LunaKnowledgeChunk::create($validated);

        return back()->with('success', 'Luna AI knowledge chunk saved.');
    }

    public function updateChunk(Request $request, LunaKnowledgeChunk $chunk)
    {
        $validated = $request->validate([
            'chunk_text' => 'required|string|max:3000',
            'topic_tags' => 'nullable|array',
            'approved_for_ai' => 'required|boolean',
        ]);

        $chunk->update($validated);

        return back()->with('success', 'Knowledge chunk updated.');
    }

    public function destroyChunk(Request $request, LunaKnowledgeChunk $chunk)
    {
        $chunk->delete();
        return back()->with('success', 'Knowledge chunk deleted.');
    }

    // Clinical Referrals (Reviewer Triage)
    public function updateReviewerReferral(Request $request, HealthReferral $referral)
    {
        $validated = $request->validate([
            'status' => 'required|in:generated,appointment_requested,completed',
            'notes' => 'nullable|string|max:1000',
        ]);

        $referral->update($validated);

        return back()->with('success', 'Referral status updated.');
    }

    public function destroyReviewerReferral(Request $request, HealthReferral $referral)
    {
        $referral->delete();
        return back()->with('success', 'Referral voucher closed/deleted.');
    }

    // ==========================================
    // 3. ADMIN (GOVERNANCE, SAFEGUARDING & M&E)
    // ==========================================

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

        $recentTelemetry = MeImpactEvent::latest('created_at')->take(20)->get();

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

        $users = User::latest()->take(50)->get();
        $allHubs = CommunityServiceHub::with('manager')->latest()->get();
        $campaigns = SponsorshipCampaign::latest()->get();
        $topics = CommunityTopic::withCount('posts')->orderBy('sort_order')->get();
        $flaggedPosts = CommunityPost::whereIn('moderation_status', ['flagged', 'approved'])
            ->with('user:id,name,role')
            ->latest()
            ->take(20)
            ->get();
        $faqs = Faq::orderBy('sort_order')->get();
        $tickets = SupportTicket::with('user:id,name,email,phone')->latest()->get();

        return Inertia::render('Portal/AdminDashboard', [
            'kpis' => $kpis,
            'campaign' => $campaign,
            'telemetry' => $recentTelemetry,
            'users' => $users,
            'allHubs' => $allHubs,
            'campaigns' => $campaigns,
            'topics' => $topics,
            'flaggedPosts' => $flaggedPosts,
            'faqs' => $faqs,
            'tickets' => $tickets,
        ]);
    }

    // Admin: User & Role Governance
    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'nullable|string|max:30|unique:users,phone',
            'role' => 'required|in:primary_user,trusted_contact,community_partner,health_reviewer,donor_sponsor,admin',
            'password' => 'required|string|min:8',
            'province' => 'nullable|string',
            'district' => 'nullable|string',
            'admin_scope' => 'nullable|string',
        ]);

        User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'User provisioned successfully.');
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|in:primary_user,trusted_contact,community_partner,health_reviewer,donor_sponsor,admin',
            'province' => 'nullable|string',
            'district' => 'nullable|string',
            'admin_scope' => 'nullable|string',
        ]);

        $user->update($validated);

        return back()->with('success', "User {$user->name} updated.");
    }

    public function destroyUser(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            abort(403, 'Cannot delete your own administrator account.');
        }

        $user->delete();

        return back()->with('success', 'User account removed.');
    }

    // Admin: Hub Verification & Assignment
    public function storeAdminHub(Request $request)
    {
        $validated = $request->validate([
            'organization_name' => 'required|string|max:150',
            'hub_type' => 'required|in:school,ngo,clinic,pharmacy,youth_center,safe_space',
            'province' => 'required|string|max:50',
            'district' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'contact_phone' => 'nullable|string|max:30',
            'manager_user_id' => 'nullable|exists:users,id',
            'verification_status' => 'required|in:pending,verified,suspended',
        ]);

        CommunityServiceHub::create($validated);

        return back()->with('success', 'Hub created and registered.');
    }

    public function updateAdminHub(Request $request, CommunityServiceHub $hub)
    {
        $validated = $request->validate([
            'organization_name' => 'required|string|max:150',
            'hub_type' => 'required|in:school,ngo,clinic,pharmacy,youth_center,safe_space',
            'verification_status' => 'required|in:pending,verified,suspended',
            'manager_user_id' => 'nullable|exists:users,id',
            'free_pads_qty' => 'nullable|integer|min:0',
            'emergency_kits_qty' => 'nullable|integer|min:0',
            'current_reusable_pads_stock' => 'nullable|integer|min:0',
        ]);

        $hub->update($validated);
        $hub->recalculateStockLevels();

        return back()->with('success', "Hub '{$hub->organization_name}' updated.");
    }

    public function destroyAdminHub(Request $request, CommunityServiceHub $hub)
    {
        $hub->delete();
        return back()->with('success', 'Hub removed.');
    }

    // Admin: Sponsorship Campaign CRUD
    public function storeCampaign(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'required|string',
            'target_amount_zmw' => 'required|numeric|min:100',
            'target_girls_count' => 'required|integer|min:1',
            'active' => 'required|boolean',
        ]);

        SponsorshipCampaign::create([
            ...$validated,
            'raised_amount_zmw' => 0,
            'sponsored_girls_count' => 0,
        ]);

        return back()->with('success', 'Sponsorship campaign launched.');
    }

    public function updateCampaign(Request $request, SponsorshipCampaign $campaign)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'required|string',
            'target_amount_zmw' => 'required|numeric|min:100',
            'target_girls_count' => 'required|integer|min:1',
            'active' => 'required|boolean',
        ]);

        $campaign->update($validated);

        return back()->with('success', 'Campaign details updated.');
    }

    public function destroyCampaign(Request $request, SponsorshipCampaign $campaign)
    {
        $campaign->delete();
        return back()->with('success', 'Campaign removed.');
    }

    // Admin: Forum Topics & Moderation
    public function storeTopic(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'required|string|max:500',
            'audience_scope' => 'required|in:girls_only,trusted_support_circle,open_community,ask_an_expert',
            'color' => 'nullable|string|max:30',
            'icon' => 'nullable|string|max:30',
            'sort_order' => 'nullable|integer',
        ]);

        CommunityTopic::create([
            ...$validated,
            'slug' => Str::slug($validated['name']),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'Forum topic created.');
    }

    public function updateTopic(Request $request, CommunityTopic $topic)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'required|string|max:500',
            'audience_scope' => 'required|in:girls_only,trusted_support_circle,open_community,ask_an_expert',
            'sort_order' => 'nullable|integer',
        ]);

        $topic->update($validated);

        return back()->with('success', 'Forum topic updated.');
    }

    public function destroyTopic(Request $request, CommunityTopic $topic)
    {
        $topic->delete();
        return back()->with('success', 'Forum topic removed.');
    }

    public function moderatePost(Request $request, CommunityPost $post)
    {
        $validated = $request->validate([
            'moderation_status' => 'required|in:approved,flagged,removed',
        ]);

        $post->update($validated);

        return back()->with('success', "Post status set to {$validated['moderation_status']}.");
    }

    public function destroyAdminPost(Request $request, CommunityPost $post)
    {
        $post->comments()->delete();
        $post->reactions()->delete();
        $post->delete();

        return back()->with('success', 'Post permanently deleted.');
    }

    // Admin: FAQ CRUD
    public function storeFaq(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:300',
            'answer' => 'required|string|max:2000',
            'locale' => 'required|in:en,bem,nya,toi,loz',
            'sort_order' => 'nullable|integer',
        ]);

        Faq::create([
            ...$validated,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'FAQ published.');
    }

    public function updateFaq(Request $request, Faq $faq)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:300',
            'answer' => 'required|string|max:2000',
            'locale' => 'required|in:en,bem,nya,toi,loz',
            'sort_order' => 'nullable|integer',
        ]);

        $faq->update($validated);

        return back()->with('success', 'FAQ updated.');
    }

    public function destroyFaq(Request $request, Faq $faq)
    {
        $faq->delete();
        return back()->with('success', 'FAQ deleted.');
    }

    // Admin: Support Tickets
    public function updateAdminTicket(Request $request, SupportTicket $ticket)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved',
            'admin_response' => 'required|string|max:2000',
        ]);

        $ticket->update($validated);

        return back()->with('success', 'Support ticket updated with administrative resolution.');
    }

    public function destroyAdminTicket(Request $request, SupportTicket $ticket)
    {
        $ticket->delete();
        return back()->with('success', 'Ticket removed.');
    }

    // Admin: M&E Telemetry CSV Export
    public function exportTelemetry(Request $request): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="mwezi-telemetry-export-' . date('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Event Type', 'Province', 'District', 'Cohort', 'Metadata', 'Created At']);

            MeImpactEvent::chunk(200, function ($events) use ($handle) {
                foreach ($events as $event) {
                    fputcsv($handle, [
                        $event->id,
                        $event->event_type,
                        $event->province,
                        $event->district,
                        $event->anonymized_cohort,
                        json_encode($event->metadata),
                        $event->created_at,
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }
}
