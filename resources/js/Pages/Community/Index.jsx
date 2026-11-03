import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { 
    MessageSquare, 
    Heart, 
    Share2, 
    Plus, 
    Shield, 
    User, 
    Send, 
    X, 
    Sparkles,
    Flag,
    EyeOff
} from 'lucide-react';

export default function CommunityIndex({ 
    topics = [], 
    posts = [], 
    selectedTopicSlug = null 
}) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);

    // Post creation form
    const { data: postData, setData: setPostData, post: submitPost, processing: postProcessing, reset: resetPost } = useForm({
        topic_id: topics[0]?.id || '',
        title: '',
        body: '',
        is_anonymous: true,
        audience_scope: 'open_community',
    });

    // Comment submission form
    const { data: commentData, setData: setCommentData, post: submitComment, processing: commentProcessing, reset: resetComment } = useForm({
        body: '',
        is_anonymous: false,
    });

    const handleCreatePost = (e) => {
        e.preventDefault();
        submitPost(route('community.post.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                resetPost();
            },
        });
    };

    const handleAddComment = (e, postId) => {
        e.preventDefault();
        submitComment(route('community.comment.store', postId), {
            onSuccess: () => {
                setActiveCommentPostId(null);
                resetComment();
            },
        });
    };

    const handleReact = (postId) => {
        router.post(route('community.react', postId), {}, { preserveScroll: true });
    };

    return (
        <MobileAppLayout title="Community" subtitle="Safe • Stigma-Free • Supportive">
            <Head title="Community Forums - Mwezi" />

            <div className="space-y-4">
                
                {/* 1. SAFE SPACE & ANONYMITY BANNER */}
                <div className="bg-white rounded-[20px] p-3.5 shadow-sm border border-mwezi-secondary flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-mwezi-secondary/60 flex items-center justify-center text-mwezi-tertiary shrink-0">
                            <EyeOff className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-bold text-gray-800 block">100% Anonymous Posting Available</span>
                            <span className="text-[10px] text-gray-500">Ask sensitive questions safely without revealing your name.</span>
                        </div>
                    </div>
                </div>

                {/* 2. TOPIC FILTER PILLS */}
                <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar py-1">
                    <Link
                        href="/community"
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                            !selectedTopicSlug 
                                ? 'bg-mwezi-accent text-white shadow-sm' 
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        All Channels
                    </Link>
                    {topics.map((t) => {
                        const isActive = selectedTopicSlug === t.slug;
                        return (
                            <Link
                                key={t.id}
                                href={`/community?topic=${t.slug}`}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                    isActive 
                                        ? 'bg-mwezi-accent text-white shadow-sm' 
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {t.name}
                            </Link>
                        );
                    })}
                </div>

                {/* 3. POSTS FEED */}
                <div className="space-y-3">
                    {posts.map((post) => (
                        <div key={post.id} className="p-4 bg-white rounded-[20px] shadow-sm border border-gray-100 space-y-3">
                            {/* Post Author Bar */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-mwezi-primary/40 flex items-center justify-center text-mwezi-tertiary font-bold text-xs">
                                        {post.is_anonymous ? '?' : (post.user?.name?.charAt(0) || 'U')}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 leading-tight">
                                            {post.is_anonymous ? 'Anonymous Sister' : post.user?.name}
                                        </p>
                                        <span className="text-[10px] text-mwezi-accent font-semibold capitalize">
                                            {post.topic?.name}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => alert('Post reported to Mwezi safeguarding moderators.')}
                                    className="text-gray-300 hover:text-gray-500" 
                                    title="Report post"
                                >
                                    <Flag className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div>
                                <h3 className="font-heading font-bold text-sm text-gray-900 mb-1 leading-snug">
                                    {post.title}
                                </h3>
                                <p className="text-xs text-gray-700 leading-relaxed font-body">
                                    {post.body}
                                </p>
                            </div>

                            {/* Post Actions (Like, Comment, Share) */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs text-gray-600">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleReact(post.id)}
                                        className="flex items-center space-x-1 text-xs font-semibold text-mwezi-tertiary hover:opacity-80 transition"
                                    >
                                        <Heart className={`w-4 h-4 ${post.likes_count > 0 ? 'fill-mwezi-accent text-mwezi-accent' : ''}`} />
                                        <span>{post.likes_count}</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                                        className="flex items-center space-x-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{post.comments_count}</span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({ title: post.title, text: post.body, url: window.location.href });
                                        }
                                    }}
                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                                >
                                    <Share2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Nested Comments */}
                            {post.comments?.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-gray-50">
                                    {post.comments.map((comment) => (
                                        <div key={comment.id} className="p-2.5 rounded-xl bg-gray-50 text-xs">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="font-bold text-gray-800 text-[11px]">
                                                    {comment.is_anonymous ? 'Anonymous Friend' : comment.user?.name}
                                                </span>
                                                <span className="text-[9px] text-gray-400">Supportive Reply</span>
                                            </div>
                                            <p className="text-gray-700 leading-tight">{comment.body}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Input Box */}
                            {activeCommentPostId === post.id && (
                                <form onSubmit={(e) => handleAddComment(e, post.id)} className="space-y-2 pt-1">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={commentData.body}
                                            onChange={(e) => setCommentData('body', e.target.value)}
                                            placeholder="Write an encouraging reply..."
                                            className="flex-1 p-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-mwezi-accent"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={commentProcessing}
                                            className="p-2 bg-mwezi-accent text-white rounded-xl hover:bg-mwezi-accent/90 transition shadow-xs"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-1.5 px-1">
                                        <input
                                            type="checkbox"
                                            id={`anon-${post.id}`}
                                            checked={commentData.is_anonymous}
                                            onChange={(e) => setCommentData('is_anonymous', e.target.checked)}
                                            className="rounded text-mwezi-accent focus:ring-mwezi-accent text-xs"
                                        />
                                        <label htmlFor={`anon-${post.id}`} className="text-[10px] text-gray-500 font-medium">
                                            Post reply anonymously
                                        </label>
                                    </div>
                                </form>
                            )}
                        </div>
                    ))}
                </div>

                {/* 4. FLOATING ACTION BUTTON (FAB in #F98B88 Peach Pink) */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-mwezi-accent text-white shadow-xl hover:scale-105 active:scale-95 transition flex items-center justify-center z-40"
                    aria-label="Create New Community Post"
                >
                    <Plus className="w-7 h-7" />
                </button>
            </div>

            {/* CREATE POST MODAL WITH ANONYMOUS TOGGLE */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[24px] max-w-sm w-full p-5 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <h3 className="font-heading font-bold text-base text-mwezi-tertiary flex items-center space-x-2">
                                <MessageSquare className="w-5 h-5 text-mwezi-accent" />
                                <span>Create Safe Post</span>
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePost} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Channel / Topic</label>
                                <select
                                    value={postData.topic_id}
                                    onChange={(e) => setPostData('topic_id', e.target.value)}
                                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs font-medium"
                                >
                                    {topics.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Headline / Question</label>
                                <input
                                    type="text"
                                    value={postData.title}
                                    onChange={(e) => setPostData('title', e.target.value)}
                                    placeholder="e.g. Tips for drying reusable pads during rainy season?"
                                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-mwezi-accent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Share your experience or question</label>
                                <textarea
                                    value={postData.body}
                                    onChange={(e) => setPostData('body', e.target.value)}
                                    rows="4"
                                    placeholder="Write respectfully. Stigma, bullying, or harassment is strictly prohibited."
                                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-mwezi-accent"
                                    required
                                />
                            </div>

                            {/* Anonymous Posting Toggle Switch */}
                            <div className="p-3 rounded-xl bg-mwezi-light border border-mwezi-primary/40 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <EyeOff className="w-4 h-4 text-mwezi-tertiary" />
                                    <div>
                                        <span className="text-xs font-bold text-gray-800 block">Post Anonymously</span>
                                        <span className="text-[10px] text-gray-500">Hide your name & avatar</span>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={postData.is_anonymous}
                                    onChange={(e) => setPostData('is_anonymous', e.target.checked)}
                                    className="rounded border-gray-300 text-mwezi-accent focus:ring-mwezi-accent w-4 h-4"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={postProcessing}
                                className="w-full py-3 bg-mwezi-accent text-white font-bold rounded-[20px] text-xs shadow-md transition disabled:opacity-50"
                            >
                                {postProcessing ? 'Publishing...' : 'Publish to Community'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MobileAppLayout>
    );
}

