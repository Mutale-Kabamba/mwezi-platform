<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\UserPrivacySetting;
use App\Models\CycleLog;
use App\Models\UserLearningProgress;

class ProfileController extends Controller
{
    /**
     * Display the user's profile and privacy center.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        $privacy = UserPrivacySetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'allow_anonymous_forum_default' => true,
                'share_cycle_with_trusted' => false,
                'share_symptoms_with_trusted' => false,
                'receive_discreet_notifications' => true,
            ]
        );

        $cycleLogsCount = CycleLog::where('user_id', $user->id)->count();
        $completedGuidesCount = UserLearningProgress::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();

        return Inertia::render('Profile/Index', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'privacy' => $privacy,
            'stats' => [
                'logs_count' => $cycleLogsCount,
                'completed_guides' => $completedGuidesCount,
                'has_pin' => !is_null($user->pin_code_hash),
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'username' => 'nullable|string|max:50|unique:users,username,' . $user->id,
            'preferred_language' => 'nullable|in:en,bem,nya,toi,loz',
            'phone' => 'nullable|string|max:30',
            'bio' => 'nullable|string|max:500',
        ]);

        if (!empty($validated['email']) && $user->email !== $validated['email']) {
            $user->email_verified_at = null;
        }

        if (empty($validated['preferred_language'])) {
            $validated['preferred_language'] = $user->preferred_language ?? 'en';
        }

        $user->fill($validated);
        $user->save();

        return Redirect::route('profile.edit')->with('success', 'Profile details updated.');
    }

    /**
     * Update granular privacy settings.
     */
    public function updatePrivacy(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'allow_anonymous_forum_default' => 'required|boolean',
            'share_cycle_with_trusted' => 'required|boolean',
            'share_symptoms_with_trusted' => 'required|boolean',
            'receive_discreet_notifications' => 'required|boolean',
        ]);

        UserPrivacySetting::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return Redirect::route('profile.edit')->with('success', 'Privacy preferences saved.');
    }

    /**
     * Set or change 4-digit quick PIN for discreet unlock.
     */
    public function updatePin(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pin' => 'required|string|digits:4',
        ]);

        $user = $request->user();
        $user->pin_code_hash = Hash::make($validated['pin']);
        $user->save();

        return Redirect::route('profile.edit')->with('success', '4-digit Quick PIN updated.');
    }

    /**
     * Delete the user's account and all personal health data.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
