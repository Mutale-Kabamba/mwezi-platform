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
    CheckCircle
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
    }, [messages]);

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
        <MobileAppLayout title="Luna AI" subtitle="Safe Health Companion">
            <Head title="Ask Luna AI - Menstrual Companion" />

            <div className="flex flex-col h-[calc(100vh-210px)] justify-between space-y-2">
                
                {/* 1. NON-MEDICAL DISCLAIMER & EPHEMERAL BAR */}
                <div className="bg-white rounded-[20px] p-3 shadow-sm border border-mwezi-secondary flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <Sparkles className="w-4 h-4 text-mwezi-accent shrink-0" />
                        <span>Luna gives verified guidance, not medical diagnoses.</span>
                    </div>

                    <button
                        onClick={handleClearHistory}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-mwezi-tertiary transition"
                        title="Clear history"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* 2. CHAT SCROLL AREA */}
                <div className="flex-1 overflow-y-auto px-1 space-y-3 pt-2">
                    {/* Welcome Bubble from Luna */}
                    <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 rounded-full bg-mwezi-accent flex items-center justify-center text-white shrink-0 shadow-sm">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="max-w-[85%] bg-mwezi-primary p-3.5 rounded-[20px] rounded-tl-sm text-xs text-mwezi-dark leading-relaxed shadow-sm border border-white">
                            <p className="font-semibold text-mwezi-tertiary mb-1">Hello! I am Luna.</p>
                            <p>I am here to answer your questions about period symptoms, washing reusable pads, body changes, and finding free emergency supplies in Zambia. What would you like to explore?</p>
                        </div>
                    </div>

                    {/* Messages Render */}
                    {messages.map((msg, idx) => {
                        const isUser = msg.sender === 'user';

                        return (
                            <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-start space-x-2 max-w-[88%]">
                                    {!isUser && (
                                        <div className="w-8 h-8 rounded-full bg-mwezi-accent flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                    )}

                                    <div
                                        className={`p-3.5 rounded-[20px] text-xs leading-relaxed shadow-sm ${
                                            isUser
                                                ? 'bg-mwezi-secondary text-mwezi-dark rounded-tr-sm border border-white'
                                                : 'bg-mwezi-primary text-mwezi-dark rounded-tl-sm border border-white'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.message_text}</p>

                                        {/* CRITICAL SAFETY ESCALATION CARD (#8E484B Container) */}
                                        {msg.escalation && (
                                            <div className="mt-3 p-3 bg-mwezi-tertiary text-white rounded-[16px] shadow-md space-y-2">
                                                <div className="flex items-center space-x-1.5 font-heading font-bold text-xs text-mwezi-brandText">
                                                    <ShieldAlert className="w-4 h-4" />
                                                    <span>{msg.escalation.title}</span>
                                                </div>

                                                <p className="text-[11px] text-white/90 leading-tight">
                                                    {msg.escalation.advice}
                                                </p>

                                                {msg.escalation.facility && (
                                                    <div className="text-[10px] text-white/80 bg-white/10 p-2 rounded-lg">
                                                        <p className="font-bold">{msg.escalation.facility}</p>
                                                        <p>{msg.escalation.address} • {msg.escalation.phone}</p>
                                                    </div>
                                                )}

                                                {msg.escalation.phone_1 && (
                                                    <div className="space-y-1 pt-1">
                                                        <a href="tel:116" className="block text-center py-1.5 bg-mwezi-accent text-white rounded-xl font-bold text-xs">
                                                            {msg.escalation.phone_1}
                                                        </a>
                                                    </div>
                                                )}

                                                {msg.escalation.action_url && (
                                                    <Link
                                                        href={msg.escalation.action_url}
                                                        className="block text-center py-2 bg-mwezi-brandText text-mwezi-tertiary font-bold text-xs rounded-xl shadow-sm hover:opacity-95 transition"
                                                    >
                                                        {msg.escalation.action_text}
                                                    </Link>
                                                )}
                                            </div>
                                        )}

                                        {/* Grounded Resource Reference Pills */}
                                        {msg.referenced_resources?.length > 0 && (
                                            <div className="mt-2.5 pt-2 border-t border-mwezi-primary/50 space-y-1">
                                                <span className="text-[9px] font-bold text-mwezi-tertiary uppercase tracking-wider block">
                                                    Verified Knowledge Reference
                                                </span>
                                                {msg.referenced_resources.map((ref, rIdx) => (
                                                    <Link
                                                        key={rIdx}
                                                        href={`/learn/article/${ref.slug}`}
                                                        className="inline-flex items-center space-x-1 text-[10px] font-bold text-mwezi-tertiary bg-white/70 px-2.5 py-1 rounded-full hover:bg-white transition shadow-xs"
                                                    >
                                                        <BookOpen className="w-3 h-3 text-mwezi-accent" />
                                                        <span className="truncate max-w-[200px]">{ref.title}</span>
                                                        <ChevronRight className="w-3 h-3" />
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {isSending && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500 italic py-2">
                            <div className="w-6 h-6 rounded-full bg-mwezi-accent/40 flex items-center justify-center animate-pulse">
                                <Sparkles className="w-3.5 h-3.5 text-mwezi-tertiary" />
                            </div>
                            <span>Luna is thinking safely...</span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* 3. SUGGESTED CHIPS & INPUT DOCK */}
                <div className="pt-2 space-y-2">
                    {/* Prompt Chips */}
                    <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar py-1">
                        {suggestedPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSendMessage(prompt)}
                                className="px-3 py-1 bg-white border border-mwezi-secondary text-gray-700 hover:bg-mwezi-primary/20 rounded-full text-[11px] font-medium whitespace-nowrap transition shadow-xs"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <div className="flex items-center space-x-2 bg-white p-2 rounded-[20px] shadow-md border border-gray-200">
                        <button
                            type="button"
                            onClick={toggleSpeechRecognition}
                            className={`p-2.5 rounded-full transition ${
                                isListening ? 'bg-red-500 text-white animate-bounce' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title="Speak question (Microphone)"
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>

                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask Luna about health, pads, or cramps..."
                            className="flex-1 border-0 focus:ring-0 text-xs px-2 py-1 placeholder-gray-400 font-sans"
                        />

                        <button
                            type="button"
                            onClick={() => handleSendMessage()}
                            disabled={!inputText.trim() || isSending}
                            className="p-2.5 rounded-full bg-mwezi-accent text-white hover:bg-mwezi-accent/90 active:scale-95 disabled:opacity-40 transition shadow-sm"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </MobileAppLayout>
    );
}

