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
        return Inertia::render('Auth/Register', [
            'initialInviteCode' => $request->query('invite'),
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

        // Check if an invite code was supplied for trusted contact
        $trustedConnection = null;
        if ($request->invite_code) {
            $trustedConnection = TrustedConnection::where('invite_code', $request->invite_code)->first();
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
                'trusted_user_id' => $user->id,
                'status' => 'active',
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        // Redirect all new signups to Step 2: Role-Specific Intelligence Calibration
        return redirect()->route('onboarding.wizard');
    }
}
