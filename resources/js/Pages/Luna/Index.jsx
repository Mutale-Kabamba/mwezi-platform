import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import {
    Sparkles,
    Plus,
    MessageSquare,
    Clock,
    Trash2,
    ChevronRight,
    Paperclip,
    Mic,
    Lock,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

export default function LunaIndex({
    conversations = [],
    suggestedPrompts = []
}) {
    const { t } = useTranslation();

    const handleStartNewChat = (initialPrompt = null) => {
        router.post(route('luna.conversation.create'), {
            prompt: initialPrompt || '',
        });
    };

    const handleDeleteConversation = (e, conversationId) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirm(t('luna_delete_confirm', 'Delete this conversation history?'))) {
            router.delete(route('luna.conversation.destroy', conversationId));
        }
    };

    const handleClearAll = () => {
        if (confirm(t('luna_clear_all_confirm', 'Clear all conversation history with Luna?'))) {
            router.delete(route('luna.clear'));
        }
    };

    return (
        <MobileAppLayout
            title="Luna AI"
            actionButton={
                conversations.length > 0 ? (
                    <button
                        onClick={handleClearAll}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Clear all chat history"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                ) : null
            }
        >
            <Head title="Luna AI - My Consultations" />

            <div className="space-y-4 pb-4">

                {/* 1. LUNA HERO CARD */}
                <div className="bg-gradient-to-br from-rose-500 via-[#BE123C] to-pink-600 rounded-3xl p-5 text-white shadow-md shadow-rose-200/50 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

                    <div className="relative z-10 flex items-start space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                                <h2 className="font-heading font-black text-lg tracking-tight text-white">
                                    Luna AI
                                </h2>
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 text-[10px] font-bold border border-emerald-300/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                    <span>Live 24/7</span>
                                </span>
                            </div>
                            <p className="text-xs text-rose-100/90 leading-snug mt-1">
                                {t('luna_hero_desc', 'Your private menstrual health guide. Ask questions, upload files, record voice notes, or continue your past consultations.')}
                            </p>
                        </div>
                    </div>

                    {/* Features Strip */}
                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-rose-100 font-medium">
                        <span className="flex items-center space-x-1">
                            <Lock className="w-3 h-3 text-rose-200" />
                            <span>Encrypted chats</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <Paperclip className="w-3 h-3 text-rose-200" />
                            <span>Up to 5 files (2MB)</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <Mic className="w-3 h-3 text-rose-200" />
                            <span>Voice notes</span>
                        </span>
                    </div>
                </div>

                {/* 2. PRIMARY ACTION: START NEW CHAT BUTTON */}
                <button
                    onClick={() => handleStartNewChat()}
                    className="w-full py-3.5 px-4 bg-[#BE123C] hover:bg-[#9F1239] active:scale-[0.99] text-white rounded-2xl font-bold text-xs shadow-md shadow-rose-200/50 transition flex items-center justify-center space-x-2"
                >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span className="text-sm tracking-tight">{t('luna_start_new_chat', 'Start New Chat')}</span>
                </button>

                {/* 3. QUICK QUESTION PROMPTS (Tap to start chat directly with prompt) */}
                <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                        {t('luna_quick_prompts', 'Suggested Questions')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {suggestedPrompts.slice(0, 4).map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleStartNewChat(prompt)}
                                className="px-3 py-1.5 bg-white border border-rose-100 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-full text-[11px] font-medium transition shadow-2xs active:scale-95 text-left"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. PREVIOUS CONVERSATIONS LIST */}
                <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wider">
                            {t('luna_past_chats', 'Previous Consultations')} ({conversations.length})
                        </h3>
                        {conversations.length > 0 && (
                            <span className="text-[10px] text-slate-400">
                                Tap to continue
                            </span>
                        )}
                    </div>

                    {conversations.length === 0 ? (
                        <div className="p-8 bg-white rounded-3xl border border-dashed border-rose-200 text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-xs text-slate-800">
                                {t('luna_no_chats_title', 'No consultations yet')}
                            </h4>
                            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                                {t('luna_no_chats_desc', 'Tap "Start New Chat" above or select any suggested question to ask Luna about cramps, flow, or menstrual dignity.')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {conversations.map((conv) => (
                                <Link
                                    key={conv.id}
                                    href={route('luna.chat', conv.id)}
                                    className="block p-3.5 bg-white hover:bg-rose-50/50 rounded-2xl border border-rose-100/80 shadow-2xs transition group"
                                >
                                    <div className="flex items-start justify-between space-x-2">
                                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                                            <div className="w-9 h-9 rounded-xl bg-rose-50 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 transition mt-0.5">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-rose-700 transition">
                                                    {conv.title}
                                                </h4>
                                                {conv.last_message ? (
                                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                        <span className="font-semibold text-slate-600">
                                                            {conv.last_message.sender === 'user' ? 'You: ' : 'Luna: '}
                                                        </span>
                                                        {conv.last_message.text}
                                                    </p>
                                                ) : (
                                                    <p className="text-[11px] text-slate-400 italic mt-0.5">
                                                        Empty consultation
                                                    </p>
                                                )}

                                                <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-slate-400">
                                                    <span className="flex items-center space-x-1">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        <span>{conv.updated_at}</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span>{conv.messages_count} {conv.messages_count === 1 ? 'message' : 'messages'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1 shrink-0 pt-1">
                                            <button
                                                onClick={(e) => handleDeleteConversation(e, conv.id)}
                                                className="p-1.5 text-slate-300 hover:text-red-600 rounded-lg transition"
                                                title="Delete chat"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 transition group-hover:translate-x-0.5" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </MobileAppLayout>
    );
}

