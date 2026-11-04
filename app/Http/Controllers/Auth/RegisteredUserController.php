<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserPrivacySetting;
use App\Models\CycleProfile;
use App\Models\CyclePrediction;
use App\Models\TrustedConnection;
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
            'role' => 'nullable|string|in:primary_user,trusted_contact,community_partner,health_reviewer,donor_sponsor',
            'preferred_language' => 'nullable|string|in:en,bem,nya,toi,loz',
            'invite_code' => 'nullable|string|max:40',
        ]);

        $role = $request->role ?? 'primary_user';

        // Check and validate invite code for trusted companion
        $trustedConnection = null;
        if ($role === 'trusted_contact' || $request->invite_code) {
            if ($request->invite_code) {
                $trustedConnection = TrustedConnection::where('invite_code', $request->invite_code)
                    ->where('status', 'invited')
                    ->first();
            }

            if ($role === 'trusted_contact' && !$trustedConnection) {
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
            'preferred_language' => $request->preferred_language ?? 'en',
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

        // If primary user, set default cycle profile without fabricating fake period dates
        if ($role === 'primary_user') {
            CycleProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'average_cycle_length' => 28,
                    'average_period_length' => 5,
                    'last_period_start' => null,
                ]
            );
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

        // Companions go straight to Companion Care Hub; others go to Calibration Wizard
        if ($role === 'trusted_contact') {
            return redirect()->route('trusted-circle.companion')
                ->with('success', "Welcome to Mwezi! You are now connected with {$trustedConnection->primaryUser?->name}.");
        }

        return redirect()->route('onboarding.wizard');
    }
}
