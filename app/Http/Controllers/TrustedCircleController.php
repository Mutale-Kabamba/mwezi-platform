<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\TrustedConnection;
use App\Models\CycleProfile;
use App\Models\CyclePrediction;
use App\Models\EducationalResource;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TrustedCircleController extends Controller
{
    public function manage(Request $request): Response
    {
        $user = $request->user();

        $connections = TrustedConnection::where('primary_user_id', $user->id)
            ->with('trustedUser:id,name,email')
            ->latest()
            ->get();

        $inviteUrlTemplate = url('/register?invite=');

        return Inertia::render('TrustedCircle/Manage', [
            'connections' => $connections,
            'inviteUrlTemplate' => $inviteUrlTemplate,
        ]);
    }

    public function companion(Request $request): Response
    {
        $user = $request->user();

        // Find active connection where this user is the trusted companion
        $connection = TrustedConnection::where('trusted_user_id', $user->id)
            ->where('status', 'active')
            ->with('primaryUser')
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
                    'primary_name' => $connection->contact_name,
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
        ]);
    }

    public function invite(Request $request)
    {
        $validated = $request->validate([
            'contact_name' => 'required|string|max:100',
            'contact_channel' => 'required|string|max:100',
            'relationship' => 'required|in:mother,father,guardian,partner,sibling,mentor',
            'permissions' => 'nullable|array',
        ]);

        $user = $request->user();
        $code = 'MWEZI-' . rand(1000, 9999) . '-' . strtoupper(Str::random(4));

        TrustedConnection::create([
            'primary_user_id' => $user->id,
            'invite_code' => $code,
            'contact_name' => $validated['contact_name'],
            'contact_channel' => $validated['contact_channel'],
            'relationship' => $validated['relationship'],
            'permissions' => $validated['permissions'] ?? ['cycle_phase', 'support_tips'],
            'status' => 'invited',
        ]);

        return back()->with('success', "Invite created! Share code {$code} with your trusted companion.");
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
}

