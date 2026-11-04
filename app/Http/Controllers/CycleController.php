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
        $normalizedDate = Carbon::parse($validated['logged_date'])->toDateString();

        $log = CycleLog::where('user_id', $user->id)
            ->where(function ($query) use ($normalizedDate) {
                $query->whereDate('logged_date', $normalizedDate)
                    ->orWhere('logged_date', 'like', $normalizedDate . '%');
            })
            ->first();

        $payload = [
            'flow_intensity' => $validated['flow_intensity'],
            'symptoms' => $validated['symptoms'] ?? [],
            'moods' => $validated['moods'] ?? [],
            'pad_changes_count' => $validated['pad_changes_count'] ?? 0,
            'private_notes' => $validated['private_notes'] ?? null,
        ];

        if ($log) {
            $log->update($payload);
        } else {
            $payload['user_id'] = $user->id;
            $payload['logged_date'] = $normalizedDate;
            $log = CycleLog::create($payload);
        }

        // Update profile last_period_start if this is a heavy/medium flow entry
        if (in_array($validated['flow_intensity'], ['heavy', 'medium'])) {
            $profile = CycleProfile::where('user_id', $user->id)->first();
            if ($profile) {
                // If it's a new period start (more than 15 days from previous start)
                $loggedDate = Carbon::parse($validated['logged_date']);
                if (!$profile->last_period_start || Carbon::parse($profile->last_period_start)->diffInDays($loggedDate) > 15) {
                    $profile->update(['last_period_start' => $loggedDate->toDateString()]);

                    // Recalculate dynamic rolling cycle average from past 3 to 6 cycles
                    $this->recalculateCycleRollingAverage($profile);
                    $profile->refresh();

                    // Recalculate prediction (with teen calibration window if menarche active)
                    $cycleLen = $profile->average_cycle_length ?: ($profile->is_first_year_menarche ? 32 : 28);
                    $nextStart = (clone $loggedDate)->addDays($cycleLen);
                    $nextEnd = (clone $nextStart)->addDays($profile->average_period_length ?: 5);

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
                            'confidence_score' => $profile->is_first_year_menarche ? 0.85 : 0.92,
                        ]
                    );
                }
            }
        }

        return back()->with('success', 'Cycle log saved securely.');
    }

    /**
     * Recalculate dynamic rolling average from previous cycle logs.
     */
    protected function recalculateCycleRollingAverage(CycleProfile $profile): void
    {
        $periodLogs = CycleLog::where('user_id', $profile->user_id)
            ->whereIn('flow_intensity', ['medium', 'heavy'])
            ->orderBy('logged_date', 'asc')
            ->pluck('logged_date')
            ->map(fn ($d) => Carbon::parse($d));

        if ($periodLogs->count() < 2) {
            return;
        }

        $starts = [];
        $lastDate = null;
        foreach ($periodLogs as $date) {
            if (!$lastDate || $lastDate->diffInDays($date) > 5) {
                $starts[] = $date;
            }
            $lastDate = $date;
        }

        if (count($starts) < 2) {
            return;
        }

        $intervals = [];
        for ($i = 1; $i < count($starts); $i++) {
            $diff = $starts[$i - 1]->diffInDays($starts[$i]);
            $minGap = 20;
            $maxGap = $profile->is_first_year_menarche ? 45 : 38;
            if ($diff >= $minGap && $diff <= $maxGap) {
                $intervals[] = $diff;
            }
        }

        if (!empty($intervals)) {
            $recentIntervals = array_slice($intervals, -6);
            $avg = (int) round(array_sum($recentIntervals) / count($recentIntervals));
            if ($avg >= 20 && $avg <= 45) {
                $profile->average_cycle_length = $avg;
                $profile->save();
            }
        }
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'average_cycle_length' => 'required|integer|min:20|max:45',
            'average_period_length' => 'required|integer|min:2|max:10',
            'last_period_start' => 'nullable|date',
            'is_first_year_menarche' => 'nullable|boolean',
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

    /**
     * Delete a single daily cycle log entry and refresh rolling average.
     */
    public function destroyLog(Request $request, CycleLog $cycleLog)
    {
        if ($cycleLog->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $cycleLog->delete();

        $profile = CycleProfile::where('user_id', $request->user()->id)->first();
        if ($profile) {
            $this->recalculateCycleRollingAverage($profile);
        }

        return back()->with('success', 'Daily log entry removed.');
    }

    /**
     * Reset the user's cycle baseline to defaults and clear predictions.
     */
    public function destroyProfile(Request $request)
    {
        $user = $request->user();

        CycleProfile::where('user_id', $user->id)->update([
            'average_cycle_length' => 28,
            'average_period_length' => 5,
            'last_period_start' => null,
            'contraceptive_or_health_notes' => null,
        ]);

        CyclePrediction::where('user_id', $user->id)->delete();

        return back()->with('success', 'Cycle baseline reset to defaults.');
    }
}

