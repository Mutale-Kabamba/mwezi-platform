<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\EducationalCategory;
use App\Models\EducationalResource;
use App\Models\EducationalResourceTranslation;
use App\Models\MythAndFact;
use App\Models\UserLearningProgress;

class LearnController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $selectedCategory = $request->query('category');
        $search = $request->query('search');
        $locale = $request->query('locale', $user->preferred_language ?? 'en');

        $categories = EducationalCategory::withCount('resources')
            ->orderBy('sort_order')
            ->get();

        $query = EducationalResource::where('review_status', 'approved')
            ->with(['category', 'reviewer', 'translations' => function ($q) use ($locale) {
                $q->where('locale', $locale);
            }]);

        if ($selectedCategory) {
            $query->whereHas('category', function ($q) use ($selectedCategory) {
                $q->where('slug', $selectedCategory);
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%")
                  ->orWhere('body_content', 'like', "%{$search}%");
            });
        }

        $resources = $query->orderBy('is_featured', 'desc')->latest()->get();

        // User learning bookmarks and progress map
        $userProgress = UserLearningProgress::where('user_id', $user->id)
            ->get()
            ->keyBy('resource_id');

        $mythsCount = MythAndFact::count();

        return Inertia::render('Learn/Index', [
            'categories' => $categories,
            'resources' => $resources,
            'userProgress' => $userProgress,
            'selectedCategory' => $selectedCategory,
            'search' => $search,
            'currentLocale' => $locale,
            'mythsCount' => $mythsCount,
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $user = $request->user();
        $locale = $request->query('locale', $user->preferred_language ?? 'en');

        $resource = EducationalResource::where('slug', $slug)
            ->where('review_status', 'approved')
            ->with(['category', 'author', 'reviewer', 'translations' => function ($q) use ($locale) {
                $q->where('locale', $locale);
            }])
            ->firstOrFail();

        $progress = UserLearningProgress::where('user_id', $user->id)
            ->where('resource_id', $resource->id)
            ->first();

        // Related articles
        $related = EducationalResource::where('category_id', $resource->category_id)
            ->where('id', '!=', $resource->id)
            ->where('review_status', 'approved')
            ->take(3)
            ->get();

        return Inertia::render('Learn/Show', [
            'resource' => $resource,
            'progress' => $progress,
            'related' => $related,
            'currentLocale' => $locale,
        ]);
    }

    public function mythsFacts(Request $request): Response
    {
        $locale = $request->query('locale', 'en');
        $myths = MythAndFact::with(['category', 'verifiedBy'])
            ->where('locale', $locale)
            ->orWhere('locale', 'en')
            ->get();

        return Inertia::render('Learn/MythsFacts', [
            'myths' => $myths,
            'currentLocale' => $locale,
        ]);
    }

    public function updateProgress(Request $request)
    {
        $validated = $request->validate([
            'resource_id' => 'required|exists:educational_resources,id',
            'progress_percent' => 'required|integer|min:0|max:100',
            'quiz_score' => 'nullable|integer|min:0|max:100',
        ]);

        $user = $request->user();

        $progress = UserLearningProgress::updateOrCreate(
            [
                'user_id' => $user->id,
                'resource_id' => $validated['resource_id'],
            ],
            [
                'progress_percent' => $validated['progress_percent'],
                'quiz_score' => $validated['quiz_score'] ?? null,
                'completed_at' => ($validated['progress_percent'] >= 100) ? now() : null,
            ]
        );

        return response()->json(['success' => true, 'progress' => $progress]);
    }

    public function toggleBookmark(Request $request)
    {
        $validated = $request->validate([
            'resource_id' => 'required|exists:educational_resources,id',
        ]);

        $user = $request->user();
        $progress = UserLearningProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'resource_id' => $validated['resource_id'],
            ],
            ['progress_percent' => 0]
        );

        $progress->bookmarked = !$progress->bookmarked;
        $progress->save();

        return back()->with('success', $progress->bookmarked ? 'Bookmarked.' : 'Bookmark removed.');
    }
}

