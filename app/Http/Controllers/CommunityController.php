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
        $user = $request->user();
        $isRestrictedRole = $user && in_array($user->role, ['trusted_contact', 'donor_sponsor'], true);

        $selectedTopicSlug = $request->query('topic');
        $topicsQuery = CommunityTopic::orderBy('sort_order');
        if ($isRestrictedRole) {
            $topicsQuery->where('audience_scope', '!=', 'girls_only');
        }
        $topics = $topicsQuery->get();

        $query = CommunityPost::where('moderation_status', 'approved')
            ->with(['topic', 'user:id,name,role', 'comments' => function ($q) {
                $q->where('moderation_status', 'approved')
                  ->with('user:id,name,role')
                  ->latest()
                  ->take(5);
            }, 'reactions']);

        if ($isRestrictedRole) {
            $query->whereIn('audience_scope', ['open_community', 'trusted_support_circle', 'ask_an_expert'])
                  ->whereHas('topic', function ($q) {
                      $q->where('audience_scope', '!=', 'girls_only');
                  });
        }

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
        $topic = CommunityTopic::findOrFail($validated['topic_id']);

        if ($user && in_array($user->role, ['trusted_contact', 'donor_sponsor'], true)) {
            if (($validated['audience_scope'] ?? '') === 'girls_only' || $topic->audience_scope === 'girls_only') {
                abort(403, 'Restricted Forum: Girls-only space is reserved for primary users and healthcare providers.');
            }
        }

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

        if ($user && in_array($user->role, ['trusted_contact', 'donor_sponsor'], true)) {
            if ($post->audience_scope === 'girls_only' || $post->topic?->audience_scope === 'girls_only') {
                abort(403, 'Restricted Forum: Girls-only discussions are reserved for primary users and healthcare providers.');
            }
        }

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

    /**
     * Update author's community post.
     */
    public function updatePost(Request $request, CommunityPost $post)
    {
        $user = $request->user();
        if ($post->user_id !== $user->id && $user->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'body' => 'required|string|max:2000',
            'is_anonymous' => 'nullable|boolean',
        ]);

        $post->update($validated);

        return back()->with('success', 'Post updated successfully.');
    }

    /**
     * Delete author's community post.
     */
    public function destroyPost(Request $request, CommunityPost $post)
    {
        $user = $request->user();
        if ($post->user_id !== $user->id && $user->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $post->comments()->delete();
        $post->reactions()->delete();
        $post->delete();

        return back()->with('success', 'Post deleted.');
    }

    /**
     * Update author's comment.
     */
    public function updateComment(Request $request, CommunityComment $comment)
    {
        $user = $request->user();
        if ($comment->user_id !== $user->id && $user->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'body' => 'required|string|max:1000',
            'is_anonymous' => 'nullable|boolean',
        ]);

        $comment->update($validated);

        return back()->with('success', 'Reply updated successfully.');
    }

    /**
     * Delete author's comment.
     */
    public function destroyComment(Request $request, CommunityComment $comment)
    {
        $user = $request->user();
        if ($comment->user_id !== $user->id && $user->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $post = $comment->post;
        $comment->delete();
        if ($post) {
            $post->decrement('comments_count');
        }

        return back()->with('success', 'Reply deleted.');
    }
}

