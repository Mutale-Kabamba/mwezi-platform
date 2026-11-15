<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\TrustedConnection;
use App\Models\CycleProfile;
use App\Models\CyclePrediction;
use App\Models\EducationalResource;
use App\Models\UserPrivacySetting;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TrustedCircleController extends Controller
{
    /**
     * Primary User: Manage Trusted Companions.
     */
    public function manage(Request $request): Response
    {
        $user = $request->user();

        // 1. Companions invited or linked by this user
        $connections = TrustedConnection::where('primary_user_id', $user->id)
            ->with('trustedUser:id,name,email,phone')
            ->latest()
            ->get();

        // 2. Incoming connection requests sent to this user (if this user was added by someone else)
        $incomingRequests = TrustedConnection::where('trusted_user_id', $user->id)
            ->where('status', 'pending')
            ->with('primaryUser:id,name')
            ->latest()
            ->get();

        // 3. Active companionships where this user is supporting someone
        $mySupportedUsers = TrustedConnection::where('trusted_user_id', $user->id)
            ->where('status', 'active')
            ->with('primaryUser:id,name')
            ->get();

        $inviteUrlTemplate = url('/companion/setup?code=');

        return Inertia::render('TrustedCircle/Manage', [
            'connections' => $connections,
            'incomingRequests' => $incomingRequests,
            'mySupportedUsers' => $mySupportedUsers,
            'inviteUrlTemplate' => $inviteUrlTemplate,
        ]);
    }

    /**
     * Companion Dashboard View.
     */
    public function companion(Request $request): Response
    {
        $user = $request->user();

        // Find active connection where this user is the trusted companion
        $connection = TrustedConnection::where('trusted_user_id', $user->id)
            ->where('status', 'active')
            ->with('primaryUser')
            ->latest()
            ->first();

        $cycleSummary = null;
        if ($connection) {
            $primaryId = $connection->primary_user_id;
            $prediction = CyclePrediction::where('user_id', $primaryId)->latest()->first();

            if ($prediction) {
                $predictedStart = Carbon::parse($prediction->predicted_start_date);
                $diff = (int) Carbon::now()->diffInDays($predictedStart, false);

                $cycleSummary = [
                    'days_until_next' => max(0, $diff),
                    'predicted_start_date' => $predictedStart->format('M d, Y'),
                    'permissions' => $connection->permissions ?? [],
                    'primary_name' => $connection->contact_name ?: ($connection->primaryUser?->name ?? 'Your Loved One'),
                ];
            }
        }

        // Ally educational guides for parents/partners
        $allyArticles = EducationalResource::whereHas('category', function ($q) {
                $q->where('slug', 'family-partner-support');
            })
            ->where('review_status', 'approved')
            ->get();

        return Inertia::render('TrustedCircle/CompanionDashboard', [
            'connection' => $connection,
            'cycleSummary' => $cycleSummary,
            'allyArticles' => $allyArticles,
            'isAlsoPrimaryUser' => $user->role === 'primary_user' || CycleProfile::where('user_id', $user->id)->exists(),
        ]);
    }

    /**
     * Invite / Add a Companion (Primary User side).
     * Automatically queries whether the person already has an account by phone or email.
     */
    public function invite(Request $request)
    {
        $validated = $request->validate([
            'contact_name' => 'required|string|max:100',
            'contact_channel' => 'required|string|max:100',
            'relationship' => 'required|in:mother,father,guardian,partner,sibling,mentor',
            'permissions' => 'nullable|array',
        ]);

        $user = $request->user();
        $channel = trim($validated['contact_channel']);
        $code = 'MWEZI-' . rand(1000, 9999) . '-' . strtoupper(Str::random(4));

        // 1. Query if an already registered user matches by email, phone, or username
        $existingUser = User::where(function ($q) use ($channel) {
            $q->where('email', $channel)
              ->orWhere('phone', $channel)
              ->orWhere('username', $channel);

            // Handle sanitized Zambian mobile phone numbers (e.g. 0977... vs +260977... vs 260977...)
            $digits = preg_replace('/\D/', '', $channel);
            if (strlen($digits) >= 9) {
                $short = substr($digits, -9);
                $q->orWhere('phone', 'like', "%{$short}");
            }
        })->first();

        // Prevent inviting oneself
        if ($existingUser && $existingUser->id === $user->id) {
            return back()->with('error', 'You cannot add your own account as a companion.');
        }

        // Case A: User is ALREADY registered
        if ($existingUser) {
            // Check if connection already exists
            $existingConn = TrustedConnection::where('primary_user_id', $user->id)
                ->where('trusted_user_id', $existingUser->id)
                ->whereIn('status', ['active', 'pending'])
                ->first();

            if ($existingConn) {
                $msg = $existingConn->status === 'active'
                    ? "{$existingUser->name} is already your active trusted companion."
                    : "A companion request is already pending for {$existingUser->name}.";
                return back()->with('info', $msg);
            }

            TrustedConnection::create([
                'primary_user_id' => $user->id,
                'trusted_user_id' => $existingUser->id,
                'invite_code' => $code,
                'contact_name' => $validated['contact_name'],
                'contact_channel' => $validated['contact_channel'],
                'relationship' => $validated['relationship'],
                'permissions' => $validated['permissions'] ?? ['cycle_phase', 'support_tips'],
                'status' => 'pending', // Waiting for the existing user to accept
            ]);

            \App\Models\MeImpactEvent::create([
                'event_type' => 'trusted_circle_request_sent_existing',
                'province' => $user->province ?? 'Lusaka',
                'district' => $user->district ?? 'Lusaka',
                'anonymized_cohort' => 'Support-Network',
                'metadata' => [
                    'relationship' => $validated['relationship'],
                    'matched_user_id' => $existingUser->id,
                ],
                'created_at' => now(),
            ]);

            return back()->with('success', "Found registered user {$existingUser->name}! A companion request has been sent to their account to accept.");
        }

        // Case B: User is NOT registered yet -> Create connection with code for password-only setup
        TrustedConnection::create([
            'primary_user_id' => $user->id,
            'trusted_user_id' => null,
            'invite_code' => $code,
            'contact_name' => $validated['contact_name'],
            'contact_channel' => $validated['contact_channel'],
            'relationship' => $validated['relationship'],
            'permissions' => $validated['permissions'] ?? ['cycle_phase', 'support_tips'],
            'status' => 'invited',
        ]);

        \App\Models\MeImpactEvent::create([
            'event_type' => 'trusted_circle_invite_sent_new',
            'province' => $user->province ?? 'Lusaka',
            'district' => $user->district ?? 'Lusaka',
            'anonymized_cohort' => 'Support-Network',
            'metadata' => [
                'relationship' => $validated['relationship'],
                'invite_code' => $code,
            ],
            'created_at' => now(),
        ]);

        return back()->with('success', "Companion added! Give code {$code} or setup link to {$validated['contact_name']}. All they need to do is set their password.");
    }

    /**
     * API: Verify Companion Invite Code and return connection details.
     */
    public function verifyInviteCode(Request $request)
    {
        $code = strtoupper(trim($request->input('code') ?? $request->query('code') ?? ''));

        if (!$code) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter your companion invite code.',
            ], 422);
        }

        $connection = TrustedConnection::where('invite_code', $code)
            ->where('status', 'invited')
            ->with('primaryUser:id,name')
            ->first();

        if (!$connection) {
            return response()->json([
                'success' => false,
                'message' => 'Invite code not found or already claimed. Please check with your family member or partner.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'connection' => [
                'invite_code' => $connection->invite_code,
                'contact_name' => $connection->contact_name,
                'contact_channel' => $connection->contact_channel,
                'relationship' => $connection->relationship,
                'primary_user_name' => $connection->primaryUser?->name ?? 'A family member',
            ],
        ]);
    }

    /**
     * Companion Setup Page (Password-only setup using generated code).
     */
    public function companionSetup(Request $request): Response
    {
        $code = trim($request->query('code', ''));
        $connection = null;

        if ($code) {
            $connection = TrustedConnection::where('invite_code', $code)
                ->where('status', 'invited')
                ->with('primaryUser:id,name')
                ->first();
        }

        return Inertia::render('Auth/CompanionSetup', [
            'initialCode' => $code,
            'connection' => $connection ? [
                'invite_code' => $connection->invite_code,
                'contact_name' => $connection->contact_name,
                'contact_channel' => $connection->contact_channel,
                'relationship' => $connection->relationship,
                'primary_user_name' => $connection->primaryUser?->name ?? 'A family member',
            ] : null,
        ]);
    }

    /**
     * Store Companion Password & Activate Account.
     */
    public function companionStorePassword(Request $request)
    {
        $validated = $request->validate([
            'invite_code' => 'required|string|exists:trusted_connections,invite_code',
            'name' => 'nullable|string|max:255',
            'contact_channel' => 'nullable|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $connection = TrustedConnection::where('invite_code', $validated['invite_code'])
            ->where('status', 'invited')
            ->first();

        if (!$connection) {
            return back()->withErrors(['invite_code' => 'This invite code is invalid or has already been used.']);
        }

        $companionName = !empty($validated['name']) ? trim($validated['name']) : $connection->contact_name;
        $channel = !empty($validated['contact_channel']) ? trim($validated['contact_channel']) : trim($connection->contact_channel);

        // Update connection with any edits made by companion
        $connection->update([
            'contact_name' => $companionName,
            'contact_channel' => $channel,
        ]);

        $email = null;
        $phone = null;
        $username = null;

        if (str_contains($channel, '@')) {
            $email = strtolower($channel);
        } elseif (preg_match('/^[\d+\s()-]+$/', $channel) && strlen(preg_replace('/\D/', '', $channel)) >= 6) {
            $phone = $channel;
        } else {
            $username = $channel;
        }

        // Check if user account was created in the meantime
        $existing = User::where(function ($q) use ($email, $phone, $username) {
            if ($email) $q->orWhere('email', $email);
            if ($phone) $q->orWhere('phone', $phone);
            if ($username) $q->orWhere('username', $username);
        })->first();

        if ($existing) {
            $user = $existing;
            $user->name = $companionName;
            $user->password = Hash::make($validated['password']);
            $user->save();
        } else {
            $user = User::create([
                'name' => $companionName,
                'email' => $email,
                'phone' => $phone,
                'username' => $username,
                'password' => Hash::make($validated['password']),
                'role' => 'trusted_contact',
                'preferred_language' => 'en',
                'onboarding_completed_at' => now(),
            ]);

            UserPrivacySetting::create([
                'user_id' => $user->id,
                'allow_anonymous_forum_default' => true,
                'share_cycle_with_trusted' => false,
                'share_symptoms_with_trusted' => false,
                'receive_discreet_notifications' => true,
                'data_retention_consent_at' => now(),
            ]);
        }

        // Activate connection
        $connection->update([
            'trusted_user_id' => $user->id,
            'status' => 'active',
        ]);

        \App\Models\MeImpactEvent::create([
            'event_type' => 'trusted_partner_onboarded',
            'province' => 'Lusaka',
            'district' => 'Lusaka',
            'anonymized_cohort' => 'Companion',
            'metadata' => [
                'relationship' => $connection->relationship,
                'invite_code' => $connection->invite_code,
            ],
            'created_at' => now(),
        ]);

        Auth::login($user);

        return redirect()->route('trusted-circle.companion')
            ->with('success', "Welcome to Mwezi, {$connection->contact_name}! Your companion account is now active.");
    }

    /**
     * Accept incoming companion request (for already registered users).
     */
    public function acceptRequest(Request $request, TrustedConnection $connection)
    {
        $user = $request->user();
        if ($connection->trusted_user_id !== $user->id || $connection->status !== 'pending') {
            abort(403);
        }

        $connection->update(['status' => 'active']);

        \App\Models\MeImpactEvent::create([
            'event_type' => 'trusted_partner_request_accepted',
            'province' => $user->province ?? 'Lusaka',
            'district' => $user->district ?? 'Lusaka',
            'anonymized_cohort' => 'Companion',
            'metadata' => [
                'relationship' => $connection->relationship,
            ],
            'created_at' => now(),
        ]);

        return back()->with('success', "You have accepted {$connection->primaryUser->name}'s companion request! You can now view your companion support hub.");
    }

    /**
     * Decline incoming companion request.
     */
    public function declineRequest(Request $request, TrustedConnection $connection)
    {
        $user = $request->user();
        if ($connection->trusted_user_id !== $user->id || $connection->status !== 'pending') {
            abort(403);
        }

        $connection->update(['status' => 'declined']);

        return back()->with('info', "Companion request from {$connection->primaryUser->name} was declined.");
    }

    public function updatePermissions(Request $request, TrustedConnection $connection)
    {
        $user = $request->user();
        if ($connection->primary_user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'permissions' => 'required|array',
        ]);

        $connection->update(['permissions' => $validated['permissions']]);

        return back()->with('success', 'Sharing permissions updated.');
    }

    public function revoke(Request $request, TrustedConnection $connection)
    {
        $user = $request->user();
        if ($connection->primary_user_id !== $user->id) {
            abort(403);
        }

        $connection->update(['status' => 'revoked']);

        return back()->with('success', 'Companion access revoked immediately.');
    }

    /**
     * Claim / Link an invite code manually.
     */
    public function claim(Request $request)
    {
        $validated = $request->validate([
            'invite_code' => 'required|string|exists:trusted_connections,invite_code',
        ]);

        $user = $request->user();
        $connection = TrustedConnection::where('invite_code', $validated['invite_code'])
            ->where('status', '!=', 'revoked')
            ->firstOrFail();

        $connection->update([
            'trusted_user_id' => $user->id,
            'status' => 'active',
        ]);

        return back()->with('success', "Successfully linked with {$connection->contact_name}!");
    }

    /**
     * Update companion contact channel and relationship.
     */
    public function updateCompanion(Request $request, TrustedConnection $connection)
    {
        if ($connection->trusted_user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'contact_channel' => 'required|string|max:100',
            'relationship' => 'required|in:mother,father,guardian,partner,sibling,mentor',
        ]);

        $connection->update($validated);

        return back()->with('success', 'Companion preferences updated.');
    }

    /**
     * Companion leaves / unlinks from support circle.
     */
    public function destroyCompanion(Request $request, TrustedConnection $connection)
    {
        if ($connection->trusted_user_id !== $request->user()->id) {
            abort(403);
        }

        $connection->update([
            'trusted_user_id' => null,
            'status' => 'revoked',
        ]);

        return back()->with('info', 'You have left this trusted support circle.');
    }

    /**
     * Parent / Guardian Multi-Tier Dependent Provisioning (Tier 1: 10-14 sub-account, Tier 2: 15-19 consent invite).
     */
    public function storeDependent(Request $request)
    {
        $guardian = $request->user();
        if (!in_array($guardian->role, ['trusted_contact', 'admin'], true)) {
            abort(403, 'Dependent provisioning is reserved for Parent / Guardian accounts.');
        }

        $validated = $request->validate([
            'tier' => 'required|in:tier_1_10_14,tier_2_15_19',
            'child_name' => 'required|string|max:120',
            'child_age' => 'nullable|integer|min:10|max:19',
            'username' => 'nullable|string|max:50|unique:users,username',
            'pin_code' => 'nullable|digits:4',
            'contact_channel' => 'nullable|string|max:100',
            'luna_ai_level' => 'nullable|in:guided,restricted,full',
            'emergency_alerts' => 'nullable|boolean',
            'tip_sharing' => 'nullable|boolean',
        ]);

        if ($validated['tier'] === 'tier_1_10_14') {
            $request->validate([
                'username' => 'required|string|max:50|unique:users,username',
                'pin_code' => 'required|digits:4',
            ]);

            $child = \App\Models\User::create([
                'name' => $validated['child_name'],
                'username' => $validated['username'],
                'password' => \Illuminate\Support\Facades\Hash::make($validated['pin_code'] . '0000'),
                'pin_code_hash' => \Illuminate\Support\Facades\Hash::make($validated['pin_code']),
                'role' => 'primary_user',
                'preferred_language' => $guardian->preferred_language ?? 'en',
                'province' => $guardian->province,
                'district' => $guardian->district,
                'onboarding_completed_at' => now(),
            ]);

            \App\Models\UserPrivacySetting::create([
                'user_id' => $child->id,
                'allow_anonymous_forum_default' => true,
                'share_cycle_with_trusted' => true,
                'share_symptoms_with_trusted' => false,
                'receive_discreet_notifications' => true,
                'data_retention_consent_at' => now(),
            ]);

            \App\Models\CycleProfile::create([
                'user_id' => $child->id,
                'age_band' => '10_13_early_teen',
                'has_started_period' => false,
                'average_cycle_length' => 32,
                'average_period_length' => 5,
            ]);

            TrustedConnection::create([
                'primary_user_id' => $child->id,
                'trusted_user_id' => $guardian->id,
                'invite_code' => 'MWZ-T1-' . strtoupper(\Illuminate\Support\Str::random(5)),
                'contact_name' => $guardian->name,
                'contact_channel' => $guardian->phone ?: ($guardian->email ?: $guardian->username),
                'relationship' => 'guardian',
                'status' => 'active',
                'permissions' => [
                    'tier' => 'tier_1_10_14',
                    'child_age' => $validated['child_age'] ?? 12,
                    'luna_ai_level' => $validated['luna_ai_level'] ?? 'guided',
                    'emergency_alerts' => (bool) ($validated['emergency_alerts'] ?? true),
                    'tip_sharing' => (bool) ($validated['tip_sharing'] ?? true),
                    'cycle_phase' => true,
                    'tips' => true,
                    'care_reminders' => true,
                ],
            ]);

            return back()->with('success', "Tier 1 sub-account created for {$child->name} (Username: {$child->username}).");
        }

        // Tier 2 (Ages 15-19): Guardian consent + privacy-preserving join invite
        $inviteCode = 'MWZ-T2-' . strtoupper(\Illuminate\Support\Str::random(5));

        TrustedConnection::create([
            'primary_user_id' => $guardian->id,
            'trusted_user_id' => $guardian->id,
            'invite_code' => $inviteCode,
            'contact_name' => $validated['child_name'],
            'contact_channel' => $validated['contact_channel'] ?? 'Invite Link',
            'relationship' => 'guardian',
            'status' => 'invited',
            'permissions' => [
                'tier' => 'tier_2_15_19',
                'child_age' => $validated['child_age'] ?? 16,
                'guardian_consent' => true,
                'cycle_phase' => false,
                'tips' => true,
                'care_reminders' => true,
            ],
        ]);

        return back()->with('success', "Tier 2 consent invite generated for {$validated['child_name']} (Code: {$inviteCode}).");
    }
}
