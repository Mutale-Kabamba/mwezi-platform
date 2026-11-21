import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import LunaSideDrawer, { MweziMoonIcon, LunaFloralBackdrop } from '@/Components/LunaSideDrawer';
import { useTranslation } from '@/i18n/LanguageContext';
import {
    Plus,
    Mic,
    Send,
    X,
    SquarePen,
    Menu,
    Sparkles,
    Camera,
    Image as ImageIcon,
    FileText,
    Loader2,
} from 'lucide-react';

export default function LunaIndex({
    conversations = [],
    suggestedPrompts = [],
}) {
    const { t } = useTranslation();
    const [promptInput, setPromptInput] = useState('');
    const [showSideNav, setShowSideNav] = useState(false);
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isStarting, setIsStarting] = useState(false);

    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const docInputRef = useRef(null);

    const handleAddFiles = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setAttachedFiles((prev) => [...prev, ...files].slice(0, 5));
        }
        setShowPlusMenu(false);
        e.target.value = '';
    };

    const removeFile = (idx) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleStartNewChat = async (initialPrompt = null) => {
        const text = typeof initialPrompt === 'string' ? initialPrompt : promptInput.trim();
        const hasPayload = Boolean(text) || attachedFiles.length > 0;

        if (!hasPayload) {
            router.post(route('luna.conversation.create'));
            return;
        }

        setIsStarting(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const createRes = await fetch(route('luna.conversation.create'), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({}),
            });
            const createData = await createRes.json();
            const convId = createData?.conversation?.id;

            if (!convId) {
                router.post(route('luna.conversation.create'));
                return;
            }

            const formData = new FormData();
            formData.append('conversation_id', convId);
            if (text) formData.append('message', text);
            attachedFiles.forEach((f) => formData.append('attachments[]', f));

            await fetch(route('luna.message'), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData,
            });

            router.visit(route('luna.chat', convId));
        } catch (err) {
            console.error('Error starting Luna chat:', err);
            setIsStarting(false);
        }
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
            backUrl="/dashboard"
            fullHeight={true}
            showNav={false}
            hideHeader={true}
        >
            <Head title="Luna AI - Mwezi" />

            <div className="relative flex flex-col h-full w-full overflow-hidden bg-white/80 backdrop-blur-xl">
                {/* Soft bottom pastel ambient wash */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#E6DAFF]/75 via-[#F8DCEF]/45 to-transparent" />
                <LunaFloralBackdrop />

                {/* Hidden Media & Capture Inputs */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleAddFiles}
                />
                <input
                    ref={galleryInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleAddFiles}
                />
                <input
                    ref={docInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,application/pdf"
                    className="hidden"
                    onChange={handleAddFiles}
                />

                {/* 1. GEMINI MOBILE TOP BAR */}
                <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowSideNav(true)}
                        className="relative w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-white shadow-xs flex items-center justify-center text-[#3C334B] transition active:scale-95"
                        title="Open chats"
                    >
                        <Menu className="w-5 h-5" />
                        {conversations.length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center">
                                {conversations.length}
                            </span>
                        )}
                    </button>

                    <div className="px-3.5 py-1.5 rounded-full bg-white/85 border border-white text-sm font-semibold text-[#2D2638] flex items-center space-x-1.5 shadow-2xs">
                        <span>Luna AI</span>
                        <span className="text-xs font-medium text-[#7A6F8A]">Mwezi</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleStartNewChat('')}
                        className="w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-white shadow-xs flex items-center justify-center text-[#3C334B] transition active:scale-95"
                        title="New chat"
                    >
                        <SquarePen className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. CENTERED EMPTY STATE WITH MWEZI ICON */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
                    <div className="mb-4 animate-fadeIn">
                        <MweziMoonIcon className="w-14 h-14 drop-shadow-sm" />
                    </div>
                    <h1 className="text-[26px] font-semibold tracking-tight text-[#2D2638] leading-snug max-w-[270px]">
                        {t('luna_focus_prompt', 'What should we focus on?')}
                    </h1>
                </div>

                {/* 3. MEDIA, CAPTURE & QUICK PROMPTS POPOVER (When '+' is tapped) */}
                {showPlusMenu && (
                    <div className="relative z-20 mx-3.5 mb-2.5 p-3.5 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white shadow-xl space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED]">
                                Add Media or Capture
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowPlusMenu(false)}
                                className="p-1 text-[#7A6F8A] hover:text-[#2D2638]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-purple-50/90 hover:bg-purple-100 text-[#2D2638] transition active:scale-95"
                            >
                                <div className="w-9 h-9 rounded-full bg-white text-[#7C3AED] flex items-center justify-center shadow-2xs mb-1.5">
                                    <Camera className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold">Camera</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => galleryInputRef.current?.click()}
                                className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-rose-50/90 hover:bg-rose-100 text-[#2D2638] transition active:scale-95"
                            >
                                <div className="w-9 h-9 rounded-full bg-white text-rose-500 flex items-center justify-center shadow-2xs mb-1.5">
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold">Gallery</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => docInputRef.current?.click()}
                                className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-teal-50/90 hover:bg-teal-100 text-[#2D2638] transition active:scale-95"
                            >
                                <div className="w-9 h-9 rounded-full bg-white text-teal-600 flex items-center justify-center shadow-2xs mb-1.5">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold">Files</span>
                            </button>
                        </div>

                        {suggestedPrompts.length > 0 && (
                            <div className="pt-2 border-t border-purple-100/70 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7F99] flex items-center space-x-1 px-1">
                                    <Sparkles className="w-3 h-3 text-[#7C3AED]" />
                                    <span>Quick Prompts</span>
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleStartNewChat(prompt)}
                                            className="px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-purple-100 text-[#2D2638] text-xs font-medium transition text-left active:scale-95"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Selected Files Shelf */}
                {attachedFiles.length > 0 && (
                    <div className="relative z-10 mx-3.5 mb-2 p-2.5 rounded-2xl bg-white/95 border border-white shadow-sm flex flex-wrap gap-1.5">
                        {attachedFiles.map((file, idx) => (
                            <div
                                key={idx}
                                className="flex items-center space-x-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs text-[#2D2638]"
                            >
                                <span className="truncate max-w-[130px] font-medium">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(idx)}
                                    className="p-0.5 rounded-full hover:bg-purple-200 text-[#7C3AED]"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* 4. BIGGER FLOATING PILL COMPOSER */}
                <div className="relative z-10 px-3.5 pb-4 pt-1 shrink-0">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleStartNewChat();
                        }}
                        className="flex items-center space-x-2 bg-white/95 backdrop-blur-2xl rounded-full px-3 py-2.5 min-h-[58px] shadow-[0_12px_32px_-8px_rgba(124,58,237,0.22)] border border-white"
                    >
                        <button
                            type="button"
                            onClick={() => setShowPlusMenu((v) => !v)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition shrink-0 ${
                                showPlusMenu
                                    ? 'bg-purple-100 text-[#7C3AED] rotate-45'
                                    : 'text-[#5E546B] hover:bg-slate-100'
                            }`}
                            title="Add photo, capture, or file"
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        <input
                            type="text"
                            value={promptInput}
                            onChange={(e) => setPromptInput(e.target.value)}
                            placeholder={t('luna_ask_placeholder', 'Ask Luna')}
                            className="flex-1 min-w-0 bg-transparent border-0 focus:ring-0 text-[15px] text-[#2D2638] placeholder-[#7A6F8A] px-1"
                        />

                        <button
                            type="button"
                            onClick={() => handleStartNewChat('')}
                            className="w-10 h-10 rounded-full text-[#5E546B] hover:bg-slate-100 flex items-center justify-center transition shrink-0"
                            title="Voice consultation"
                        >
                            <Mic className="w-5 h-5" />
                        </button>

                        <button
                            type="submit"
                            disabled={isStarting}
                            className="w-10 h-10 rounded-full bg-purple-100/90 hover:bg-[#7C3AED] text-[#7C3AED] hover:text-white flex items-center justify-center transition shrink-0 active:scale-95 disabled:opacity-50"
                            title="Send"
                        >
                            {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </form>
                </div>

                {/* 5. LEFT SLIDE-IN CHATS SIDE NAV */}
                <LunaSideDrawer
                    open={showSideNav}
                    onClose={() => setShowSideNav(false)}
                    conversations={conversations}
                    onNewChat={() => handleStartNewChat('')}
                    onDeleteConversation={handleDeleteConversation}
                    onClearAll={handleClearAll}
                />
            </div>
        </MobileAppLayout>
    );
}
