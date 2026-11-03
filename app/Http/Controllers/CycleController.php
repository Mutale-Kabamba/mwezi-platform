<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\CycleProfile;
use App\Models\CycleLog;
use App\Models\CyclePrediction;
use Carbon\Carbon;

class CycleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $profile = CycleProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'average_cycle_length' => 28,
                'average_period_length' => 5,
                'last_period_start' => Carbon::now()->subDays(14)->toDateString(),
            ]
        );

        $logs = CycleLog::where('user_id', $user->id)
            ->where('logged_date', '>=', Carbon::now()->subDays(90)->toDateString())
            ->orderBy('logged_date', 'desc')
            ->get();

        $prediction = CyclePrediction::where('user_id', $user->id)->latest()->first();

        // Symptoms and Moods catalog for quick-tap selection
        $availableSymptoms = [
            'Cramps', 'Headache', 'Backache', 'Tender Breasts', 'Acne / Breakouts',
            'Bloating', 'Fatigue', 'High Energy', 'Food Cravings', 'Nausea'
        ];

        $availableMoods = [
            'Happy', 'Calm', 'Sensitive', 'Irritable', 'Anxious', 'Confident', 'Tired', 'Energetic'
        ];

        return Inertia::render('Cycle/Index', [
            'profile' => $profile,
            'logs' => $logs,
            'prediction' => $prediction,
            'availableSymptoms' => $availableSymptoms,
            'availableMoods' => $availableMoods,
        ]);
    }

    public function storeLog(Request $request)
    {
        $validated = $request->validate([
            'logged_date' => 'required|date',
            'flow_intensity' => 'required|in:none,spotting,light,medium,heavy',
            'symptoms' => 'nullable|array',
            'moods' => 'nullable|array',
            'pad_changes_count' => 'nullable|integer|min:0|max:20',
            'private_notes' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        $log = CycleLog::updateOrCreate(
            [
                'user_id' => $user->id,
                'logged_date' => $validated['logged_date'],
            ],
            [
                'flow_intensity' => $validated['flow_intensity'],
                'symptoms' => $validated['symptoms'] ?? [],
                'moods' => $validated['moods'] ?? [],
                'pad_changes_count' => $validated['pad_changes_count'] ?? 0,
                'private_notes' => $validated['private_notes'] ?? null,
            ]
        );

        // Update profile last_period_start if this is a heavy/medium flow entry
        if (in_array($validated['flow_intensity'], ['heavy', 'medium'])) {
            $profile = CycleProfile::where('user_id', $user->id)->first();
            if ($profile) {
                // If it's a new period start (more than 15 days from previous start)
                $loggedDate = Carbon::parse($validated['logged_date']);
                if (!$profile->last_period_start || Carbon::parse($profile->last_period_start)->diffInDays($loggedDate) > 15) {
                    $profile->update(['last_period_start' => $loggedDate->toDateString()]);

                    // Recalculate prediction
                    $cycleLen = $profile->average_cycle_length ?: 28;
                    $nextStart = (clone $loggedDate)->addDays($cycleLen);
                    $nextEnd = (clone $nextStart)->addDays($profile->average_period_length ?: 5);

                    CyclePrediction::updateOrCreate(
                        ['user_id' => $user->id],
                        [
                            'predicted_start_date' => $nextStart->toDateString(),
                            'predicted_end_date' => $nextEnd->toDateString(),
                            'ovulation_window' => [
                                'start' => (clone $loggedDate)->addDays(12)->toDateString(),
                                'peak' => (clone $loggedDate)->addDays(14)->toDateString(),
                                'end' => (clone $loggedDate)->addDays(16)->toDateString(),
                            ],
                            'confidence_score' => 0.90,
                        ]
                    );
                }
            }
        }

        return back()->with('success', 'Cycle log saved securely.');
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'average_cycle_length' => 'required|integer|min:20|max:45',
            'average_period_length' => 'required|integer|min:2|max:10',
            'last_period_start' => 'nullable|date',
            'contraceptive_or_health_notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $profile = CycleProfile::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        // Recalculate prediction
        if ($profile->last_period_start) {
            $lastStart = Carbon::parse($profile->last_period_start);
            $nextStart = (clone $lastStart)->addDays($profile->average_cycle_length);
            $nextEnd = (clone $nextStart)->addDays($profile->average_period_length);

            CyclePrediction::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'predicted_start_date' => $nextStart->toDateString(),
                    'predicted_end_date' => $nextEnd->toDateString(),
                    'ovulation_window' => [
                        'start' => (clone $lastStart)->addDays(12)->toDateString(),
                        'peak' => (clone $lastStart)->addDays(14)->toDateString(),
                        'end' => (clone $lastStart)->addDays(16)->toDateString(),
                    ],
                    'confidence_score' => 0.92,
                ]
            );
        }

        return back()->with('success', 'Cycle profile updated.');
    }
}

