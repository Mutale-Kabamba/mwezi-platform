<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserPrivacySetting;
use App\Models\CycleProfile;
use App\Models\CyclePrediction;
use App\Models\TrustedConnection;
use App\Models\CommunityServiceHub;
use App\Services\HpczVerificationService;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        $inviteCode = $request->query('invite') ?? $request->query('code') ?? '';

        return Inertia::render('Auth/Register', [
            'initialInviteCode' => $inviteCode,
        ]);
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|lowercase|email|max:255|unique:'.User::class.',email|required_without_all:phone,username',
            'phone' => 'nullable|string|max:25|unique:'.User::class.',phone|required_without_all:email,username',
            'username' => 'nullable|string|max:50|unique:'.User::class.',username|required_without_all:email,phone',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'nullable|string|in:primary_user,trusted_contact,parent_guardian,community_partner,health_reviewer,donor_sponsor',
            'preferred_language' => 'nullable|string|in:en,bem,nya,toi,loz',
            'invite_code' => 'nullable|string|max:40',
            // Role-specific fields (Step 2 Dynamic Registration)
            'gender' => 'nullable|string|in:female,male,other',
            'has_personal_cycle' => 'nullable|boolean',
            'age_band' => 'nullable|string|in:10_13_early_teen,14_17_secondary,18_24_young_adult,25_plus',
            'child_tier_group' => 'nullable|string|in:tier_1,tier_2,both',
            'child_name' => 'nullable|string|max:120',
            'child_age' => 'nullable|integer|min:10|max:13',
            'child_username' => 'nullable|string|max:50|unique:users,username',
            'child_pin_code' => 'nullable|digits:4',
            'luna_ai_level' => 'nullable|in:guided,restricted,full',
            'emergency_alerts' => 'nullable|boolean',
            'tip_sharing' => 'nullable|boolean',
            'teen_name' => 'nullable|string|max:120',
            'teen_contact_channel' => 'nullable|string|max:100',
            'has_started_period' => 'nullable|boolean',
            'last_period_start' => 'nullable|date',
            'average_cycle_length' => 'nullable|integer|min:18|max:60',
            'average_period_length' => 'nullable|integer|min:1|max:14',
            'cycle_regularity' => 'nullable|string|in:regular,irregular,unsure',
            'typical_symptoms' => 'nullable|array',
            'preferred_product_type' => 'nullable|string|in:reusable_pads,disposable_pads,cloth,both,need_supplies',
            'province' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'pin_code' => 'nullable|digits:4',
            'organization_name' => 'nullable|string|max:200',
            'hub_type' => 'nullable|string|in:school,ngo,clinic,pharmacy,youth_center,safe_space',
            'address' => 'nullable|string|max:255',
            'clinical_specialty' => 'nullable|string|max:100',
            'hpcz_registration_number' => 'nullable|string|max:50',
            'review_locales' => 'nullable|array',
            'donor_default_anonymous' => 'nullable|boolean',
        ]);

        $requestedRole = $request->role ?? 'primary_user';
        $isParentGuardian = $requestedRole === 'parent_guardian';
        $role = $isParentGuardian ? 'trusted_contact' : $requestedRole;

        // Enforce child-safeguarding: ages 10-13 cannot self-register without a parent/guardian
        if ($role === 'primary_user' && $request->age_band === '10_13_early_teen') {
            return back()->withErrors([
                'age_band' => 'Ages 10–13 accounts can only be registered and managed by a Parent / Guardian.',
            ])->withInput();
        }

        if ($isParentGuardian && in_array($request->child_tier_group, ['tier_1', 'both'], true)) {
            $request->validate([
                'child_name' => 'required|string|max:120',
                'child_username' => 'required|string|max:50|unique:users,username',
                'child_pin_code' => 'required|digits:4',
            ]);
        }

        // Check and validate invite code for trusted companion (non-parent invite flow)
        $trustedConnection = null;
        if ($requestedRole === 'trusted_contact' || $request->invite_code) {
            if ($request->invite_code) {
                $trustedConnection = TrustedConnection::where('invite_code', $request->invite_code)
                    ->where('status', 'invited')
                    ->first();
            }

            if ($requestedRole === 'trusted_contact' && !$trustedConnection) {
                return back()->withErrors([
                    'invite_code' => 'A valid companion invite code is required to register as a Trusted Companion.',
                ]);
            }

            if ($trustedConnection) {
                $role = 'trusted_contact';
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email ?: null,
            'phone' => $request->phone ?: null,
            'username' => $request->username ?: null,
            'password' => Hash::make($request->password),
            'role' => $role,
            'gender' => $request->gender ?: ($role === 'primary_user' ? 'female' : null),
            'has_personal_cycle' => $request->has('has_personal_cycle') ? $request->boolean('has_personal_cycle') : ($role === 'primary_user' ? true : null),
            'preferred_language' => $request->preferred_language ?? 'en',
            'province' => $request->province ?: null,
            'district' => $request->district ?: null,
            'pin_code_hash' => $request->filled('pin_code') ? Hash::make($request->pin_code) : null,
            'clinical_specialty' => $role === 'health_reviewer' ? ($request->clinical_specialty ?: null) : null,
            'hpcz_registration_number' => $role === 'health_reviewer' ? ($request->hpcz_registration_number ?: null) : null,
            'review_locales' => $role === 'health_reviewer' ? ($request->review_locales ?: ['en']) : null,
            'donor_default_anonymous' => $role === 'donor_sponsor' ? (bool) $request->boolean('donor_default_anonymous') : false,
            'onboarding_completed_at' => $role === 'trusted_contact' ? now() : null,
        ]);

        // Default privacy settings
        UserPrivacySetting::create([
            'user_id' => $user->id,
            'allow_anonymous_forum_default' => true,
            'share_cycle_with_trusted' => false,
            'share_symptoms_with_trusted' => false,
            'receive_discreet_notifications' => true,
            'data_retention_consent_at' => now(),
        ]);

        // All roles have primary user cycle tracking features
        $hasStartedPeriod = $request->has('has_started_period') ? $request->boolean('has_started_period') : true;
        $avgCycleLen = (int) ($request->average_cycle_length ?: 28);
        $avgPeriodLen = (int) ($request->average_period_length ?: 5);
        $lmpDate = ($hasStartedPeriod && $request->filled('last_period_start')) ? $request->last_period_start : null;

        CycleProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'age_band' => $request->age_band ?: null,
                'has_started_period' => $hasStartedPeriod,
                'average_cycle_length' => $avgCycleLen,
                'average_period_length' => $avgPeriodLen,
                'cycle_regularity' => $request->cycle_regularity ?: null,
                'typical_symptoms' => $request->typical_symptoms ?: null,
                'preferred_product_type' => $request->preferred_product_type ?: 'disposable_pads',
                'last_period_start' => $lmpDate,
            ]
        );

        if ($lmpDate) {
            $lmp = Carbon::parse($lmpDate);
            $nextStart = (clone $lmp)->addDays($avgCycleLen);
            $nextEnd = (clone $nextStart)->addDays($avgPeriodLen);

            CyclePrediction::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'predicted_start_date' => $nextStart->toDateString(),
                    'predicted_end_date' => $nextEnd->toDateString(),
                    'ovulation_window' => [
                        'start' => (clone $lmp)->addDays(max(10, $avgCycleLen - 16))->toDateString(),
                        'peak' => (clone $lmp)->addDays(max(12, $avgCycleLen - 14))->toDateString(),
                        'end' => (clone $lmp)->addDays(max(14, $avgCycleLen - 12))->toDateString(),
                    ],
                    'confidence_score' => 0.90,
                ]
            );
        }

        // Role-specific initial provisioning from Step 2 dynamic registration
        if ($role === 'community_partner' && $request->filled('organization_name')) {
            CommunityServiceHub::updateOrCreate(
                ['manager_user_id' => $user->id],
                [
                    'organization_name' => $request->organization_name,
                    'hub_type' => $request->hub_type ?: 'ngo',
                    'province' => $request->province ?: 'Lusaka',
                    'district' => $request->district ?: 'Lusaka',
                    'address' => $request->address ?: 'TBD',
                    'latitude' => -15.4167,
                    'longitude' => 28.2833,
                    'contact_phone' => $user->phone ?: '+260000000000',
                    'verification_status' => 'pending',
                ]
            );
        }

        if ($role === 'health_reviewer' && $request->filled('hpcz_registration_number')) {
            app(HpczVerificationService::class)->verify($user, $request->hpcz_registration_number);
        }

        // Parent / Guardian Registration Panel: provision 10-13 child sub-account &/or 14-19 consent invite
        if ($isParentGuardian) {
            if (in_array($request->child_tier_group, ['tier_1', 'both'], true) && $request->filled('child_username')) {
                $child = User::create([
                    'name' => $request->child_name,
                    'username' => $request->child_username,
                    'password' => Hash::make($request->child_pin_code . '0000'),
                    'pin_code_hash' => Hash::make($request->child_pin_code),
                    'role' => 'primary_user',
                    'preferred_language' => $user->preferred_language,
                    'province' => $user->province,
                    'district' => $user->district,
                    'onboarding_completed_at' => now(),
                ]);

                UserPrivacySetting::create([
                    'user_id' => $child->id,
                    'allow_anonymous_forum_default' => true,
                    'share_cycle_with_trusted' => true,
                    'share_symptoms_with_trusted' => false,
                    'receive_discreet_notifications' => true,
                    'data_retention_consent_at' => now(),
                ]);

                CycleProfile::create([
                    'user_id' => $child->id,
                    'age_band' => '10_13_early_teen',
                    'has_started_period' => false,
                    'average_cycle_length' => 32,
                    'average_period_length' => 5,
                    'preferred_product_type' => 'disposable_pads',
                ]);

                TrustedConnection::create([
                    'primary_user_id' => $child->id,
                    'trusted_user_id' => $user->id,
                    'invite_code' => 'MWZ-T1-' . strtoupper(Str::random(5)),
                    'contact_name' => $user->name,
                    'contact_channel' => $user->phone ?: ($user->email ?: $user->username),
                    'relationship' => 'guardian',
                    'status' => 'active',
                    'permissions' => [
                        'tier' => 'tier_1_10_13',
                        'child_age' => (int) ($request->child_age ?: 12),
                        'luna_ai_level' => $request->luna_ai_level ?: 'guided',
                        'emergency_alerts' => $request->boolean('emergency_alerts', true),
                        'tip_sharing' => $request->boolean('tip_sharing', true),
                        'cycle_phase' => true,
                        'tips' => true,
                        'care_reminders' => true,
                    ],
                ]);
            }

            if (in_array($request->child_tier_group, ['tier_2', 'both'], true) && $request->filled('teen_name')) {
                TrustedConnection::create([
                    'primary_user_id' => $user->id,
                    'trusted_user_id' => $user->id,
                    'invite_code' => 'MWZ-T2-' . strtoupper(Str::random(5)),
                    'contact_name' => $request->teen_name,
                    'contact_channel' => $request->teen_contact_channel ?: 'Invite Link',
                    'relationship' => 'guardian',
                    'status' => 'invited',
                    'permissions' => [
                        'tier' => 'tier_2_14_19',
                        'guardian_consent' => true,
                        'cycle_phase' => false,
                        'tips' => true,
                        'care_reminders' => true,
                    ],
                ]);
            }
        }

        // Link invite if present
        if ($trustedConnection) {
            $trustedConnection->update([
                'contact_name' => $request->name,
                'contact_channel' => $request->email ?: ($request->phone ?: $request->username),
                'trusted_user_id' => $user->id,
                'status' => 'active',
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        // Companions & Parent/Guardians go straight to Companion Care Hub; others go to Calibration Wizard
        if ($role === 'trusted_contact') {
            $welcomeMsg = $isParentGuardian
                ? 'Welcome to Mwezi! Your Parent / Guardian portal is ready.'
                : "Welcome to Mwezi! You are now connected with {$trustedConnection->primaryUser?->name}.";

            return redirect()->route('trusted-circle.companion')
                ->with('success', $welcomeMsg);
        }

        return redirect()->route('onboarding.wizard');
    }
}
