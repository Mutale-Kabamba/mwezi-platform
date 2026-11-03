<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\CommunityTopic;
use App\Models\CommunityPost;
use App\Models\CommunityComment;
use App\Models\CommunityReaction;

class CommunityController extends Controller
{
    public function index(Request $request): Response
    {
        $selectedTopicSlug = $request->query('topic');
        $topics = CommunityTopic::orderBy('sort_order')->get();

        $query = CommunityPost::where('moderation_status', 'approved')
            ->with(['topic', 'user:id,name,role', 'comments' => function ($q) {
                $q->where('moderation_status', 'approved')
                  ->with('user:id,name,role')
                  ->latest()
                  ->take(5);
            }, 'reactions']);

        if ($selectedTopicSlug) {
            $query->whereHas('topic', function ($q) use ($selectedTopicSlug) {
                $q->where('slug', $selectedTopicSlug);
            });
        }

        $posts = $query->latest()->get();

        return Inertia::render('Community/Index', [
            'topics' => $topics,
            'posts' => $posts,
            'selectedTopicSlug' => $selectedTopicSlug,
        ]);
    }

    public function storePost(Request $request)
    {
        $validated = $request->validate([
            'topic_id' => 'required|exists:community_topics,id',
            'title' => 'required|string|max:150',
            'body' => 'required|string|max:2000',
            'is_anonymous' => 'nullable|boolean',
            'audience_scope' => 'nullable|in:girls_only,trusted_support_circle,open_community',
        ]);

        $user = $request->user();

        $post = CommunityPost::create([
            'topic_id' => $validated['topic_id'],
            'user_id' => $user->id,
            'title' => $validated['title'],
            'body' => $validated['body'],
            'is_anonymous' => $validated['is_anonymous'] ?? true,
            'audience_scope' => $validated['audience_scope'] ?? 'open_community',
            'moderation_status' => 'approved',
        ]);

        return back()->with('success', 'Your post has been published to the community forum.');
    }

    public function storeComment(Request $request, CommunityPost $post)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:1000',
            'is_anonymous' => 'nullable|boolean',
        ]);

        $user = $request->user();

        CommunityComment::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'body' => $validated['body'],
            'is_anonymous' => $validated['is_anonymous'] ?? false,
            'moderation_status' => 'approved',
        ]);

        $post->increment('comments_count');

        return back()->with('success', 'Reply posted.');
    }

    public function react(Request $request, CommunityPost $post)
    {
        $user = $request->user();
        $reactionType = $request->input('reaction_type', 'heart');

        $existing = CommunityReaction::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $post->decrement('likes_count');
        } else {
            CommunityReaction::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
                'reaction_type' => $reactionType,
            ]);
            $post->increment('likes_count');
        }

        return back();
    }
}

