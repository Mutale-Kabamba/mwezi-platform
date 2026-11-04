<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\CycleProfile;
use App\Models\CyclePrediction;
use App\Models\CommunityServiceHub;
use App\Models\TrustedConnection;
use App\Models\MeImpactEvent;
use App\Services\BroadPayLencoService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class OnboardingWizardController extends Controller
{
    /**
     * Display Step 2: Role-Specific Intelligence Calibration
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $verifiedHubs = CommunityServiceHub::where('verification_status', 'verified')
            ->orderBy('organization_name')
            ->get(['id', 'organization_name', 'province', 'district', 'hub_type']);

        $cycleProfile = null;
        if ($user->role === 'primary_user') {
            $cycleProfile = CycleProfile::where('user_id', $user->id)->first();
        }

        // Zambian provinces and sample districts for structured selectors
        $zambianRegions = [
            'Lusaka' => ['Lusaka', 'Chongwe', 'Kafue', 'Chilanga', 'Luangwa', 'Rufunsa'],
            'Copperbelt' => ['Ndola', 'Kitwe', 'Chingola', 'Mufulira', 'Luanshya', 'Kalulushi', 'Chililabombwe'],
            'Central' => ['Kabwe', 'Kapiri Mposhi', 'Mkushi', 'Chibombo', 'Serenje', 'Mumbwa'],
            'Eastern' => ['Chipata', 'Petauke', 'Katete', 'Lundazi', 'Nyimba'],
            'Southern' => ['Livingstone', 'Choma', 'Mazabuka', 'Monze', 'Kalomo', 'Gwembe'],
            'North-Western' => ['Solwezi', 'Kasempa', 'Mwinilunga', 'Zambezi', 'Kabompo'],
            'Northern' => ['Kasama', 'Mbala', 'Luwingu', 'Mporokoso'],
            'Luapula' => ['Mansa', 'Kawambwa', 'Nchelenge', 'Samfya'],
            'Muchinga' => ['Chinsali', 'Mpika', 'Nakonde', 'Isoka'],
            'Western' => ['Mongu', 'Kaoma', 'Senanga', 'Sesheke']
        ];

        return Inertia::render('Auth/RoleOnboardingWizard', [
            'user' => $user,
            'verifiedHubs' => $verifiedHubs,
            'cycleProfile' => $cycleProfile,
            'zambianRegions' => $zambianRegions,
        ]);
    }

    /**
     * Process Step 2 Intelligence Calibration Submission
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $role = $user->role;

        switch ($role) {
            case 'primary_user':
                $validated = $request->validate([
                    'province' => 'required|string|max:50',
                    'district' => 'required|string|max:50',
                    'age_cohort' => 'required|in:10_13_early_teen,14_17_secondary,18_24_young_adult,25_plus',
                    'is_first_year_menarche' => 'required|boolean',
                    'last_period_start' => 'nullable|date',
                    'period_not_started' => 'nullable|boolean',
                    'average_cycle_length' => 'nullable|integer|min:20|max:45',
                    'average_period_length' => 'nullable|integer|min:2|max:10',
                    'preferred_product_type' => 'required|in:reusable_pads,disposable_pads,both,need_supplies',
                    'default_hub_id' => 'nullable|exists:community_service_hubs,id',
                    'discreet_mode_enabled' => 'nullable|boolean',
                    'pin' => 'nullable|string|digits:4',
                ]);

                // Update User details
                $user->province = $validated['province'];
                $user->district = $validated['district'];
                $user->default_hub_id = $validated['default_hub_id'] ?? null;
                $user->discreet_mode_enabled = $validated['discreet_mode_enabled'] ?? false;
                if (!empty($validated['pin'])) {
                    $user->pin_code_hash = Hash::make($validated['pin']);
                }
                $user->onboarding_completed_at = now();
                $user->save();

                // Save or Update CycleProfile
                $lastPeriodDate = empty($validated['period_not_started']) ? ($validated['last_period_start'] ?? null) : null;
                $cycleLen = $validated['average_cycle_length'] ?: ($validated['is_first_year_menarche'] ? 32 : 28);
                $periodLen = $validated['average_period_length'] ?: 5;

                $profile = CycleProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'age_band' => $validated['age_cohort'],
                        'is_first_year_menarche' => (bool) $validated['is_first_year_menarche'],
                        'preferred_product_type' => $validated['preferred_product_type'],
                        'average_cycle_length' => $cycleLen,
                        'average_period_length' => $periodLen,
                        'last_period_start' => $lastPeriodDate,
                    ]
                );

                // Compute initial CyclePrediction ONLY if last_period_start was provided
                if ($lastPeriodDate) {
                    $loggedDate = Carbon::parse($lastPeriodDate);
                    $nextStart = (clone $loggedDate)->addDays($cycleLen);
                    $nextEnd = (clone $nextStart)->addDays($periodLen);

                    CyclePrediction::updateOrCreate(
                        ['user_id' => $user->id],
                        [
                            'predicted_start_date' => $nextStart->toDateString(),
                            'predicted_end_date' => $nextEnd->toDateString(),
                            'ovulation_window' => [
                                'start' => (clone $loggedDate)->addDays(max(10, $cycleLen - 16))->toDateString(),
                                'peak' => (clone $loggedDate)->addDays(max(12, $cycleLen - 14))->toDateString(),
                                'end' => (clone $loggedDate)->addDays(max(14, $cycleLen - 12))->toDateString(),
                            ],
                            'confidence_score' => $validated['is_first_year_menarche'] ? 0.75 : 0.90,
                        ]
                    );
                }

                return redirect()->route('dashboard')->with('success', 'Welcome to Mwezi! Your cycle intelligence has been calibrated.');

            case 'trusted_contact':
                $validated = $request->validate([
                    'invite_code' => 'nullable|string|max:50',
                    'relationship' => 'required|in:mother,father,guardian,partner,sibling,mentor',
                    'contact_channel' => 'required|string|max:100',
                    'province' => 'nullable|string|max:50',
                    'district' => 'nullable|string|max:50',
                ]);

                $user->province = $validated['province'] ?? null;
                $user->district = $validated['district'] ?? null;
                $user->onboarding_completed_at = now();
                $user->save();

                if (!empty($validated['invite_code'])) {
                    $conn = TrustedConnection::where('invite_code', $validated['invite_code'])->first();
                    if ($conn) {
                        $conn->update([
                            'trusted_user_id' => $user->id,
                            'relationship' => $validated['relationship'],
                            'contact_channel' => $validated['contact_channel'],
                            'status' => 'active',
                        ]);
                    }
                }

                MeImpactEvent::create([
                    'event_type' => 'trusted_partner_onboarded',
                    'province' => $user->province ?? 'Lusaka',
                    'district' => $user->district ?? 'Lusaka',
                    'anonymized_cohort' => 'Companion',
                    'metadata' => [
                        'relationship' => $validated['relationship'],
                    ],
                    'created_at' => now(),
                ]);

                return redirect()->route('trusted-circle.companion')->with('success', 'Companion setup complete! You are ready to support.');

            case 'community_partner':
                $validated = $request->validate([
                    'organization_name' => 'required|string|max:150',
                    'hub_type' => 'required|in:school,ngo,clinic,pharmacy,youth_center,safe_space',
                    'province' => 'required|string|max:50',
                    'district' => 'required|string|max:50',
                    'address' => 'required|string|max:255',
                    'latitude' => 'nullable|numeric',
                    'longitude' => 'nullable|numeric',
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

                $user->province = $validated['province'];
                $user->district = $validated['district'];
                $user->onboarding_completed_at = now();
                $user->save();

                $hub = CommunityServiceHub::updateOrCreate(
                    ['manager_user_id' => $user->id],
                    [
                        'organization_name' => $validated['organization_name'],
                        'hub_type' => $validated['hub_type'],
                        'province' => $validated['province'],
                        'district' => $validated['district'],
                        'address' => $validated['address'],
                        'latitude' => $validated['latitude'] ?? -15.4167,
                        'longitude' => $validated['longitude'] ?? 28.2833,
                        'contact_phone' => $validated['contact_phone'] ?? $user->phone,
                        'operating_hours' => $validated['operating_hours'] ?? 'Mon - Fri: 08:00 - 16:00',
                        'offers_free_pads' => $validated['offers_free_pads'] ?? true,
                        'offers_emergency_kits' => $validated['offers_emergency_kits'] ?? true,
                        'offers_reusable_pads' => $validated['offers_reusable_pads'] ?? true,
                        'offers_health_referrals' => $validated['offers_health_referrals'] ?? false,
                        'free_pads_qty' => $validated['free_pads_qty'] ?? 100,
                        'emergency_kits_qty' => $validated['emergency_kits_qty'] ?? 50,
                        'current_reusable_pads_stock' => $validated['current_reusable_pads_stock'] ?? 50,
                        'languages_spoken' => $validated['languages_spoken'] ?? ['en', 'bem', 'nya'],
                        'verification_status' => 'pending',
                        'last_inventory_update_at' => now(),
                    ]
                );
                $hub->recalculateStockLevels();

                return redirect()->route('portal.partner')->with('success', 'Hub profile registered! Welcome to the Community Partner portal.');

            case 'health_reviewer':
                $validated = $request->validate([
                    'clinical_specialty' => 'required|string|max:100',
                    'hpcz_registration_number' => 'required|string|max:50',
                    'default_hub_id' => 'nullable|exists:community_service_hubs,id',
                    'review_locales' => 'required|array',
                    'bio' => 'nullable|string|max:500',
                ]);

                $user->clinical_specialty = $validated['clinical_specialty'];
                $user->hpcz_registration_number = $validated['hpcz_registration_number'];
                $user->default_hub_id = $validated['default_hub_id'] ?? null;
                $user->review_locales = $validated['review_locales'];
                $user->bio = $validated['bio'] ?? null;
                $user->onboarding_completed_at = now();
                $user->save();

                return redirect()->route('portal.reviewer')->with('success', 'Clinician verification submitted! Welcome to the Medical Review portal.');

            case 'donor_sponsor':
                $validated = $request->validate([
                    'donor_default_anonymous' => 'nullable|boolean',
                    'phone' => 'nullable|string|max:30',
                    'province' => 'nullable|string|max:50',
                    'district' => 'nullable|string|max:50',
                    'default_hub_id' => 'nullable|exists:community_service_hubs,id',
                ]);

                $user->donor_default_anonymous = $validated['donor_default_anonymous'] ?? false;
                if (!empty($validated['phone'])) {
                    $lenco = app(BroadPayLencoService::class);
                    $user->phone = $lenco->formatZambianPhone($validated['phone']);
                }
                $user->province = $validated['province'] ?? null;
                $user->district = $validated['district'] ?? null;
                $user->default_hub_id = $validated['default_hub_id'] ?? null;
                $user->onboarding_completed_at = now();
                $user->save();

                return redirect()->route('public.sponsor')->with('success', 'Sponsor preferences calibrated! Thank you for supporting Zambian girls.');

            case 'admin':
                $validated = $request->validate([
                    'admin_scope' => 'required|in:PM_M&E,Safeguarding_Lead,System_SuperAdmin',
                    'phone' => 'nullable|string|max:30',
                ]);

                $user->admin_scope = $validated['admin_scope'];
                if (!empty($validated['phone'])) {
                    $user->phone = $validated['phone'];
                }
                $user->onboarding_completed_at = now();
                $user->save();

                return redirect()->route('portal.admin')->with('success', 'Administrator privileges configured.');

            default:
                $user->onboarding_completed_at = now();
                $user->save();
                return redirect()->route('dashboard');
        }
    }
}

