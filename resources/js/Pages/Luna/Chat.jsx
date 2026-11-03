import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import {
    Sparkles,
    Send,
    Mic,
    MicOff,
    Trash2,
    ShieldAlert,
    PhoneCall,
    BookOpen,
    ChevronRight,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Lock,
    ShieldCheck
} from 'lucide-react';

export default function LunaChat({
    conversation,
    messages: initialMessages = [],
    suggestedPrompts = []
}) {
    const [messages, setMessages] = useState(initialMessages);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isEphemeral, setIsEphemeral] = useState(conversation?.is_ephemeral || false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isSending]);

    // Web Speech API Voice Recognition
    const toggleSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputText(prev => (prev ? prev + ' ' + transcript : transcript));
            setIsListening(false);
        };

        recognition.start();
    };

    const handleSendMessage = async (textToSend) => {
        const text = textToSend || inputText;
        if (!text.trim() || isSending) return;

        const optimisticUserMessage = {
            id: 'temp-' + Date.now(),
            sender: 'user',
            message_text: text,
            safety_flag: 'none',
        };

        setMessages(prev => [...prev, optimisticUserMessage]);
        setInputText('');
        setIsSending(true);

        try {
            const res = await fetch(route('luna.message'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    message: text,
                    is_ephemeral: isEphemeral,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setMessages(prev => [
                    ...prev,
                    {
                        ...data.luna_message,
                        escalation: data.escalation,
                        referenced_resources: data.referenced_resources,
                    }
                ]);
            }
        } catch (err) {
            console.error('Error sending message to Luna:', err);
        } finally {
            setIsSending(false);
        }
    };

    const handleClearHistory = () => {
        if (confirm('Clear all conversation messages for privacy?')) {
            router.delete(route('luna.clear'), {
                onSuccess: () => setMessages([]),
            });
        }
    };

    return (
        <MobileAppLayout
            title="Luna AI Assistant"
            subtitle="Confidential • Safe • Verified 24/7"
            fullHeight={true}
            actionButton={
                <button
                    onClick={handleClearHistory}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                    title="Clear Chat History"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            }
        >
            <Head title="Ask Luna AI - Menstrual Health Companion" />

            <div className="flex flex-col h-full w-full min-w-0 overflow-hidden">

                {/* 1. HEALTHCARE DISCLAIMER & PRIVACY PILL BAR */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-2xs border border-rose-150/80 flex items-center justify-between text-xs w-full min-w-0 shrink-0 mb-2">
                    <div className="flex items-center space-x-2 text-slate-600 min-w-0 flex-1 mr-2">
                        <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <Sparkles className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-medium text-slate-600 truncate block">
                            Certified health guidance, not a medical diagnosis.
                        </span>
                    </div>

                    <div className="shrink-0">
                        <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200/50">
                            <Lock className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Private & Encrypted</span>
                        </span>
                    </div>
                </div>

                {/* 2. CHAT SCROLL AREA */}
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 pr-1 hide-scrollbar min-w-0 w-full pb-2">
                        {/* Welcome Bubble from Luna */}
                        <div className="flex items-start space-x-2.5 w-full min-w-0">
                            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs text-xs text-slate-800 leading-relaxed shadow-2xs border border-rose-100/90 flex-1 min-w-0">
                                <p className="font-bold text-rose-700 mb-1">Hello, I'm Luna!</p>
                                <p className="text-slate-600">
                                    I'm your private, judgment-free companion. You can ask me anything about period pain, cycle irregularities, washing and sun-drying reusable pads, or finding free pads in Zambia. What's on your mind today?
                                </p>
                            </div>
                        </div>

                        {/* Messages Render */}
                        {messages.map((msg, idx) => {
                            const isUser = msg.sender === 'user';

                            return (
                                <div key={idx} className={`flex flex-col w-full min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-start space-x-2 max-w-[88%] min-w-0 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        {!isUser && (
                                            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5">
                                                <Sparkles className="w-3.5 h-3.5" />
                                            </div>
                                        )}

                                        <div
                                            className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs min-w-0 break-words ${isUser
                                                    ? 'bg-rose-600 text-white rounded-tr-xs shadow-rose-200/50'
                                                    : 'bg-white text-slate-800 rounded-tl-xs border border-rose-100/90'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap break-words">{msg.message_text}</p>

                                            {/* CRITICAL SAFETY ESCALATION CARD */}
                                            {msg.escalation && (
                                                <div className="mt-3 p-3 bg-gradient-to-r from-rose-700 to-red-800 text-white rounded-2xl shadow-md space-y-2">
                                                    <div className="flex items-center space-x-2 font-bold text-xs text-white">
                                                        <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
                                                        <span className="truncate">{msg.escalation.title || 'Medical Escalation Advice'}</span>
                                                    </div>

                                                    <p className="text-xs text-white/95 leading-relaxed">
                                                        {msg.escalation.advice}
                                                    </p>

                                                    {msg.escalation.facility && (
                                                        <div className="text-[11px] text-white/90 bg-white/10 p-2 rounded-xl border border-white/10">
                                                            <p className="font-bold">{msg.escalation.facility}</p>
                                                            <p className="text-white/80">{msg.escalation.address} • {msg.escalation.phone}</p>
                                                        </div>
                                                    )}

                                                    {msg.escalation.phone_1 && (
                                                        <div className="pt-1">
                                                            <a
                                                                href="tel:116"
                                                                className="block text-center py-2 bg-white text-rose-800 rounded-xl font-bold text-xs hover:bg-rose-50 transition shadow-xs"
                                                            >
                                                                Call Toll-Free 116 (Childline Zambia)
                                                            </a>
                                                        </div>
                                                    )}

                                                    {msg.escalation.action_url && (
                                                        <Link
                                                            href={msg.escalation.action_url}
                                                            className="block text-center py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition"
                                                        >
                                                            {msg.escalation.action_text || 'Find Immediate Clinic'}
                                                        </Link>
                                                    )}
                                                </div>
                                            )}

                                            {/* Grounded Resource Reference Pills */}
                                            {msg.referenced_resources?.length > 0 && (
                                                <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
                                                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                                                        Verified Knowledge Reference
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {msg.referenced_resources.map((ref, rIdx) => (
                                                            <Link
                                                                key={rIdx}
                                                                href={`/learn/article/${ref.slug}`}
                                                                className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 px-2.5 py-0.5 rounded-full transition"
                                                            >
                                                                <BookOpen className="w-3 h-3 text-rose-600 shrink-0" />
                                                                <span className="truncate max-w-[170px]">{ref.title}</span>
                                                                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {isSending && (
                            <div className="flex items-center space-x-2 text-xs text-slate-500 italic py-1 pl-1">
                                <div className="w-6 h-6 rounded-xl bg-rose-100 flex items-center justify-center animate-pulse shrink-0">
                                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                                </div>
                                <span>Luna is thinking safely...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* 3. SUGGESTED CHIPS & INPUT DOCK PINNED AT BOTTOM */}
                    <div className="space-y-2 pt-2 shrink-0 w-full min-w-0 bg-[#FAF6F7]">
                        {/* Prompt Chips Carousel (Strictly Overflow-X-Auto bounded to parent) */}
                        <div className="w-full min-w-0 overflow-x-auto hide-scrollbar py-0.5">
                            <div className="flex items-center space-x-1.5 whitespace-nowrap">
                                {suggestedPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSendMessage(prompt)}
                                        className="px-3 py-1 bg-white border border-rose-200/70 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 rounded-full text-[11px] font-medium shrink-0 transition shadow-2xs active:scale-95"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Modern Native Input Bar */}
                        <div className="flex items-center space-x-1.5 bg-white p-1.5 pl-2.5 rounded-2xl shadow-xs border border-rose-200/80 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition w-full min-w-0">
                            <button
                                type="button"
                                onClick={toggleSpeechRecognition}
                                className={`p-2 rounded-xl transition shrink-0 ${isListening
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                                    }`}
                                title="Voice Input (Microphone)"
                            >
                                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>

                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask Luna about cramps, flow, or pads..."
                                className="flex-1 min-w-0 border-0 focus:ring-0 text-xs px-2 py-1 placeholder-slate-400 font-sans bg-transparent"
                            />

                            <button
                                type="button"
                                onClick={() => handleSendMessage()}
                                disabled={!inputText.trim() || isSending}
                                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white disabled:opacity-40 transition shadow-2xs shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
        </MobileAppLayout>
    );
}
