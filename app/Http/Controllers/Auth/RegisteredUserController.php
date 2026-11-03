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
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
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
            'email' => $request->email,
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

        // If primary user, set default cycle profile
        if ($role === 'primary_user') {
            $lastStart = Carbon::now()->subDays(10);
            CycleProfile::create([
                'user_id' => $user->id,
                'average_cycle_length' => 28,
                'average_period_length' => 5,
                'last_period_start' => $lastStart->toDateString(),
            ]);

            $nextStart = (clone $lastStart)->addDays(28);
            CyclePrediction::create([
                'user_id' => $user->id,
                'predicted_start_date' => $nextStart->toDateString(),
                'predicted_end_date' => (clone $nextStart)->addDays(5)->toDateString(),
                'ovulation_window' => [
                    'start' => (clone $lastStart)->addDays(12)->toDateString(),
                    'peak' => (clone $lastStart)->addDays(14)->toDateString(),
                    'end' => (clone $lastStart)->addDays(16)->toDateString(),
                ],
                'confidence_score' => 0.85,
            ]);
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

        // Redirect based on role
        if ($role === 'community_partner') {
            return redirect()->route('portal.partner');
        } elseif ($role === 'health_reviewer') {
            return redirect()->route('portal.reviewer');
        } elseif ($role === 'trusted_contact') {
            return redirect()->route('trusted-circle.companion');
        }

        return redirect(route('dashboard', absolute: false));
    }
}
