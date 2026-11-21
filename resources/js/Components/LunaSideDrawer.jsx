import React from 'react';
import { Link } from '@inertiajs/react';
import {
    X,
    SquarePen,
    MessageSquare,
    Clock,
    Trash2,
    Home,
} from 'lucide-react';

export function MweziMoonIcon({ className = 'w-9 h-9' }) {
    return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
            <defs>
                <linearGradient id="mweziCrescentGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F43F5E" />
                    <stop offset="50%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#6D28D9" />
                </linearGradient>
            </defs>
            <path
                d="M27.4 22.8A12.4 12.4 0 0 1 13.2 8.6a12.4 12.4 0 1 0 14.2 14.2Z"
                fill="url(#mweziCrescentGrad)"
            />
            <circle cx="25.5" cy="10.5" r="2.2" fill="#EC4899" />
        </svg>
    );
}

export function LunaFloralBackdrop() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
            {/* Upper-Right Delicate Botanical Sprig & Lotus Blossom */}
            <svg
                viewBox="0 0 260 260"
                fill="none"
                className="absolute -top-6 -right-8 w-64 h-64 text-[#A855F7] opacity-[0.11]"
            >
                {/* Graceful Stem */}
                <path
                    d="M235 12C205 58 175 112 132 166C116 186 98 206 78 228"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                />
                {/* Soft Leaves along stem */}
                <path
                    d="M178 96C150 86 130 96 122 118C144 124 166 116 178 96Z"
                    fill="#F472B6"
                    fillOpacity="0.22"
                    stroke="currentColor"
                    strokeWidth="1.2"
                />
                <path
                    d="M154 134C178 134 198 148 202 172C178 174 160 158 154 134Z"
                    fill="#C084FC"
                    fillOpacity="0.20"
                    stroke="currentColor"
                    strokeWidth="1.2"
                />
                <path
                    d="M116 182C90 176 72 188 66 210C88 214 106 204 116 182Z"
                    fill="#F472B6"
                    fillOpacity="0.18"
                    stroke="currentColor"
                    strokeWidth="1.2"
                />
                {/* Delicate 5-Petal Lotus Bloom */}
                <g transform="translate(185, 58) rotate(-18)">
                    <path
                        d="M0 0C-12 -18 -10 -38 0 -48C10 -38 12 -18 0 0Z"
                        fill="#F472B6"
                        fillOpacity="0.24"
                        stroke="currentColor"
                        strokeWidth="1.2"
                    />
                    <path
                        d="M0 0C-26 -10 -36 -26 -34 -40C-18 -36 -6 -20 0 0Z"
                        fill="#C084FC"
                        fillOpacity="0.18"
                        stroke="currentColor"
                        strokeWidth="1.2"
                    />
                    <path
                        d="M0 0C26 -10 36 -26 34 -40C18 -36 6 -20 0 0Z"
                        fill="#C084FC"
                        fillOpacity="0.18"
                        stroke="currentColor"
                        strokeWidth="1.2"
                    />
                    <path
                        d="M0 0C-30 6 -42 -4 -44 -16C-28 -18 -12 -10 0 0Z"
                        stroke="currentColor"
                        strokeWidth="1.1"
                    />
                    <path
                        d="M0 0C30 6 42 -4 44 -16C28 -18 12 -10 0 0Z"
                        stroke="currentColor"
                        strokeWidth="1.1"
                    />
                </g>
                {/* Tiny floating dots */}
                <circle cx="96" cy="146" r="2.2" fill="#EC4899" />
                <circle cx="212" cy="126" r="1.8" fill="#8B5CF6" />
                <circle cx="136" cy="74" r="1.6" fill="#EC4899" />
            </svg>

            {/* Lower-Left Blooming Floral Arc & Petals */}
            <svg
                viewBox="0 0 280 280"
                fill="none"
                className="absolute -bottom-8 -left-10 w-72 h-72 text-[#EC4899] opacity-[0.11]"
            >
                {/* Curved Botanical Vine */}
                <path
                    d="M24 258C56 210 92 162 146 122C168 106 192 94 218 86"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                />
                {/* Soft Leaves */}
                <path
                    d="M78 186C74 156 88 136 112 132C116 156 102 176 78 186Z"
                    fill="#C084FC"
                    fillOpacity="0.22"
                    stroke="currentColor"
                    strokeWidth="1.2"
                />
                <path
                    d="M116 146C142 144 162 156 168 178C144 182 124 168 116 146Z"
                    fill="#F472B6"
                    fillOpacity="0.20"
                    stroke="currentColor"
                    strokeWidth="1.2"
                />
                {/* Main Blooming Flower */}
                <g transform="translate(86, 204) rotate(22)">
                    <path
                        d="M0 0C-14 -20 -12 -44 0 -56C12 -44 14 -20 0 0Z"
                        fill="#F472B6"
                        fillOpacity="0.26"
                        stroke="currentColor"
                        strokeWidth="1.2"
                    />
                    <path
                        d="M0 0C-30 -12 -44 -30 -40 -46C-22 -42 -8 -22 0 0Z"
                        fill="#A855F7"
                        fillOpacity="0.18"
                        stroke="currentColor"
                        strokeWidth="1.2"
                    />
                    <path
                        d="M0 0C30 -12 44 -30 40 -46C22 -42 8 -22 0 0Z"
                        fill="#A855F7"
                        fillOpacity="0.18"
                        stroke="currentColor"
                        strokeWidth="1.2"
                    />
                    <circle cx="0" cy="-14" r="3" fill="#EC4899" fillOpacity="0.6" />
                </g>
                {/* Tiny Moon & Petal Accents */}
                <path
                    d="M188 136A9 9 0 0 1 178 126A9 9 0 1 0 188 136Z"
                    fill="#8B5CF6"
                    fillOpacity="0.45"
                />
                <circle cx="152" cy="96" r="2" fill="#EC4899" />
                <circle cx="204" cy="112" r="1.8" fill="#A855F7" />
            </svg>
        </div>
    );
}

export default function LunaSideDrawer({
    open,
    onClose,
    conversations = [],
    activeConversationId = null,
    onNewChat,
    onDeleteConversation,
    onClearAll,
}) {
    if (!open) return null;

    return (
        <div className="absolute inset-0 z-40 flex animate-fadeIn">
            {/* Left Side Nav Panel */}
            <aside className="relative z-10 w-[82%] max-w-[300px] h-full bg-white/95 backdrop-blur-2xl border-r border-white shadow-2xl flex flex-col p-4 overflow-hidden">
                <LunaFloralBackdrop />
                {/* Drawer Header */}
                <div className="relative z-10 flex items-center justify-between pb-3 border-b border-purple-100/70">
                    <div className="flex items-center space-x-2">
                        <MweziMoonIcon className="w-6 h-6" />
                        <div>
                            <h2 className="font-bold text-xs text-[#2D2638] leading-none">Luna AI</h2>
                            <span className="text-[10px] text-[#7A6F8A]">Mwezi Health Companion</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full text-[#7A6F8A] hover:bg-slate-100 hover:text-[#2D2638] transition"
                        aria-label="Close chats"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="py-3">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onNewChat();
                        }}
                        className="w-full py-2.5 px-3.5 rounded-full bg-purple-100/80 hover:bg-purple-100 text-[#6D28D9] font-bold text-xs flex items-center justify-center space-x-2 transition active:scale-95"
                    >
                        <SquarePen className="w-3.5 h-3.5" />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* Recent Chats List */}
                <div className="flex items-center justify-between px-1 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7F99]">
                        Recent Chats ({conversations.length})
                    </span>
                    {conversations.length > 0 && onClearAll && (
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="text-[10px] font-bold text-rose-500 hover:text-rose-700"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-1 hide-scrollbar pr-0.5">
                    {conversations.length === 0 ? (
                        <div className="py-10 text-center space-y-1.5">
                            <MessageSquare className="w-6 h-6 text-purple-300 mx-auto" />
                            <p className="text-xs font-semibold text-[#5E546B]">No chats yet</p>
                            <p className="text-[10.5px] text-[#8A7F99]">
                                Your private Luna consultations will appear here.
                            </p>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const isActive = activeConversationId && Number(activeConversationId) === Number(conv.id);
                            return (
                                <Link
                                    key={conv.id}
                                    href={route('luna.chat', conv.id)}
                                    onClick={onClose}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-2xl transition group ${
                                        isActive
                                            ? 'bg-purple-100/85 text-[#5B21B6]'
                                            : 'hover:bg-slate-100/80 text-[#2D2638]'
                                    }`}
                                >
                                    <div className="min-w-0 pr-2">
                                        <p className={`text-xs truncate ${isActive ? 'font-bold' : 'font-medium'}`}>
                                            {conv.title || 'Health Consultation'}
                                        </p>
                                        <p className="text-[10px] text-[#8A7F99] flex items-center space-x-1 mt-0.5">
                                            <Clock className="w-2.5 h-2.5" />
                                            <span>{conv.updated_at || 'Recent'}</span>
                                        </p>
                                    </div>
                                    {onDeleteConversation && (
                                        <button
                                            type="button"
                                            onClick={(e) => onDeleteConversation(e, conv.id)}
                                            className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0 transition"
                                            title="Delete chat"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </Link>
                            );
                        })
                    )}
                </div>

                {/* Footer: Back to Mwezi Home */}
                <div className="pt-3 mt-2 border-t border-purple-100/70">
                    <Link
                        href="/dashboard"
                        onClick={onClose}
                        className="w-full py-2.5 px-3 rounded-2xl hover:bg-slate-100 text-xs font-semibold text-[#5E546B] flex items-center space-x-2 transition"
                    >
                        <Home className="w-4 h-4 text-[#7C3AED]" />
                        <span>Back to Mwezi Home</span>
                    </Link>
                </div>
            </aside>

            {/* Backdrop */}
            <div
                className="flex-1 bg-[#2D2638]/30 backdrop-blur-xs"
                onClick={onClose}
            />
        </div>
    );
}
