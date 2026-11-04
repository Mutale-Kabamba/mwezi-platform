import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import {
    Sparkles,
    Send,
    Mic,
    MicOff,
    Trash2,
    ShieldAlert,
    BookOpen,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    Lock,
    Paperclip,
    FileText,
    Image as ImageIcon,
    X,
    Play,
    Pause,
    Volume2,
    VolumeX,
    AlertCircle,
    Loader2,
    File
} from 'lucide-react';

// Helper to format bytes into readable KB / MB
const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Helper to format seconds into mm:ss
const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Helper to parse inline markdown (bold, italic, code, links)
const formatInline = (text) => {
    if (!text) return '';
    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    const tokenRegex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`)(.*?)\5|\[(.*?)\]\((.*?)\)/;

    while (remaining) {
        const match = remaining.match(tokenRegex);
        if (!match) {
            parts.push(remaining);
            break;
        }

        const matchIndex = match.index;
        if (matchIndex > 0) {
            parts.push(remaining.substring(0, matchIndex));
        }

        if (match[2] !== undefined) {
            parts.push(
                <strong key={`b-${keyIdx++}`} className="font-bold text-slate-900">
                    {formatInline(match[2])}
                </strong>
            );
        } else if (match[4] !== undefined) {
            parts.push(
                <em key={`i-${keyIdx++}`} className="italic">
                    {formatInline(match[4])}
                </em>
            );
        } else if (match[6] !== undefined) {
            parts.push(
                <code key={`c-${keyIdx++}`} className="bg-rose-50 text-rose-700 px-1 py-0.5 rounded text-[11px] font-mono border border-rose-100">
                    {match[6]}
                </code>
            );
        } else if (match[7] !== undefined && match[8] !== undefined) {
            parts.push(
                <a
                    key={`a-${keyIdx++}`}
                    href={match[8]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 underline hover:text-rose-700 font-medium"
                >
                    {match[7]}
                </a>
            );
        }

        remaining = remaining.substring(matchIndex + match[0].length);
    }

    return parts;
};

// Block Markdown Renderer
function FormattedMessage({ content, isUser }) {
    if (!content) return null;
    if (isUser) {
        return <p className="whitespace-pre-wrap break-words">{content}</p>;
    }

    const lines = content.split('\n');
    const elements = [];
    let currentList = null;

    const flushList = () => {
        if (!currentList) return;
        if (currentList.type === 'ul') {
            elements.push(
                <ul key={`ul-${elements.length}`} className="my-1.5 space-y-1 pl-0.5">
                    {currentList.items.map((item, i) => (
                        <li key={i} className="flex items-start text-xs leading-relaxed text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 mr-2 shrink-0" />
                            <span className="flex-1 min-w-0">{formatInline(item)}</span>
                        </li>
                    ))}
                </ul>
            );
        } else if (currentList.type === 'ol') {
            elements.push(
                <ol key={`ol-${elements.length}`} className="my-1.5 space-y-1 pl-0.5">
                    {currentList.items.map((item, i) => (
                        <li key={i} className="flex items-start text-xs leading-relaxed text-slate-700">
                            <span className="font-bold text-rose-600 mr-2 shrink-0 text-[11px] min-w-[14px]">
                                {i + 1}.
                            </span>
                            <span className="flex-1 min-w-0">{formatInline(item)}</span>
                        </li>
                    ))}
                </ol>
            );
        }
        currentList = null;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            flushList();
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
        if (headingMatch) {
            flushList();
            const level = headingMatch[1].length;
            const headingText = headingMatch[2];
            elements.push(
                <div
                    key={`h-${i}`}
                    className={`font-bold mt-2.5 mb-1 ${level === 1 ? 'text-sm text-rose-800' : level === 2 ? 'text-xs text-rose-700' : 'text-xs text-slate-800'
                        }`}
                >
                    {formatInline(headingText)}
                </div>
            );
            continue;
        }

        const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
        if (ulMatch) {
            if (currentList && currentList.type !== 'ul') flushList();
            if (!currentList) currentList = { type: 'ul', items: [] };
            currentList.items.push(ulMatch[1]);
            continue;
        }

        const olMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
        if (olMatch) {
            if (currentList && currentList.type !== 'ol') flushList();
            if (!currentList) currentList = { type: 'ol', items: [] };
            currentList.items.push(olMatch[2]);
            continue;
        }

        const quoteMatch = trimmed.match(/^>\s*(.+)$/);
        if (quoteMatch) {
            flushList();
            elements.push(
                <blockquote
                    key={`quote-${i}`}
                    className="border-l-2 border-rose-400 bg-rose-50/60 pl-2.5 py-1 my-1.5 text-xs text-slate-700 italic rounded-r-lg"
                >
                    {formatInline(quoteMatch[1])}
                </blockquote>
            );
            continue;
        }

        flushList();
        elements.push(
            <p key={`p-${i}`} className="text-xs leading-relaxed text-slate-700 my-1 first:mt-0 last:mb-0">
                {formatInline(trimmed)}
            </p>
        );
    }

    flushList();
    return <div className="space-y-1">{elements}</div>;
}

// Custom Audio Player for Voice Notes
function AudioPlayerBubble({ src, duration = null, isUser = false }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(duration || 0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
        if (!audioDuration && audioRef.current.duration) {
            setAudioDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const progressPercent = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

    return (
        <div className={`flex items-center space-x-2.5 py-1 px-1 rounded-xl ${isUser ? 'text-white' : 'text-slate-800'}`}>
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={(e) => {
                    if (e.target.duration && !audioDuration) {
                        setAudioDuration(e.target.duration);
                    }
                }}
            />

            <button
                type="button"
                onClick={togglePlay}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 ${isUser
                    ? 'bg-white text-rose-700 hover:bg-rose-50 shadow-xs'
                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
                    }`}
            >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
            </button>

            <div className="flex-1 min-w-[120px]">
                {/* Progress bar */}
                <div
                    className={`h-1.5 rounded-full overflow-hidden cursor-pointer ${isUser ? 'bg-white/30' : 'bg-slate-200'}`}
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        if (audioRef.current && audioDuration) {
                            audioRef.current.currentTime = pos * audioDuration;
                        }
                    }}
                >
                    <div
                        className={`h-full rounded-full transition-all duration-100 ${isUser ? 'bg-white' : 'bg-rose-600'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="flex justify-between items-center text-[10px] mt-1 font-mono opacity-80">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{audioDuration ? formatDuration(audioDuration) : 'Voice note'}</span>
                </div>
            </div>
        </div>
    );
}

export default function LunaChat({
    conversation,
    messages: initialMessages = [],
    suggestedPrompts = []
}) {
    const { t, locale } = useTranslation();
    const [messages, setMessages] = useState(initialMessages);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isEphemeral, setIsEphemeral] = useState(conversation?.is_ephemeral || false);
    const [speakingMsgId, setSpeakingMsgId] = useState(null);

    // File Upload State (Max 2MB per file, up to 5 files)
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [fileError, setFileError] = useState('');
    const fileInputRef = useRef(null);

    // Audio Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isSending, attachedFiles]);

    // Handle File Selection with 2MB & 5 files limits
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        setFileError('');

        if (attachedFiles.length + files.length > 5) {
            setFileError('You can attach a maximum of 5 files.');
            return;
        }

        const validFiles = [];
        for (const file of files) {
            // 2MB = 2048 * 1024 bytes = 2,097,152 bytes
            if (file.size > 2 * 1024 * 1024) {
                setFileError(`"${file.name}" exceeds the 2MB size limit.`);
                return;
            }
            validFiles.push(file);
        }

        setAttachedFiles(prev => [...prev, ...validFiles]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeAttachedFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Audio Recording Handling
    const startRecording = async () => {
        setFileError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunksRef.current = [];

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                if (audioBlob.size > 2 * 1024 * 1024) {
                    setFileError('Recorded audio exceeds 2MB limit.');
                    return;
                }

                // Send voice note
                handleSendVoiceNote(audioBlob, recordingTime);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            alert('Microphone permission is required to record audio notes.');
            console.error('Audio record error:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.ondataavailable = null;
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        }
    };

    // Live Speech Synthesis (Luna reads answer aloud)
    const toggleSpeechSynthesis = (msgId, text) => {
        if (!('speechSynthesis' in window)) return;

        if (speakingMsgId === msgId) {
            window.speechSynthesis.cancel();
            setSpeakingMsgId(null);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.onend = () => setSpeakingMsgId(null);
        utterance.onerror = () => setSpeakingMsgId(null);

        setSpeakingMsgId(msgId);
        window.speechSynthesis.speak(utterance);
    };

    // Send Message with Text & Attached Files
    const handleSendMessage = async (textToSend = null) => {
        const text = textToSend !== null ? textToSend : inputText;
        if ((!text.trim() && attachedFiles.length === 0) || isSending) return;

        const formData = new FormData();
        formData.append('conversation_id', conversation.id);
        if (text.trim()) {
            formData.append('message', text.trim());
        }
        formData.append('locale', locale);
        formData.append('is_ephemeral', isEphemeral ? 1 : 0);

        attachedFiles.forEach((file) => {
            formData.append('files[]', file);
        });

        // Optimistic UI display
        const tempAttachments = attachedFiles.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
            is_image: f.type.startsWith('image/'),
            url: URL.createObjectURL(f),
        }));

        const optimisticUserMessage = {
            id: 'temp-' + Date.now(),
            sender: 'user',
            message_text: text || (attachedFiles.length > 0 ? `Shared ${attachedFiles.length} file(s)` : ''),
            attachments: tempAttachments.length > 0 ? tempAttachments : null,
            safety_flag: 'none',
        };

        setMessages(prev => [...prev, optimisticUserMessage]);
        setInputText('');
        setAttachedFiles([]);
        setFileError('');
        setIsSending(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(route('luna.message'), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                setMessages(prev => [
                    ...prev.slice(0, -1), // Replace optimistic message with persistent model
                    data.user_message,
                    {
                        ...data.luna_message,
                        escalation: data.escalation,
                        referenced_resources: data.referenced_resources,
                    }
                ]);
            } else {
                setFileError(data.message || 'Error sending message.');
            }
        } catch (err) {
            console.error('Error sending message to Luna:', err);
            setFileError('Failed to send. Please check your connection.');
        } finally {
            setIsSending(false);
        }
    };

    // Send Voice Note Audio
    const handleSendVoiceNote = async (audioBlob, duration) => {
        setIsSending(true);

        const formData = new FormData();
        formData.append('conversation_id', conversation.id);
        formData.append('audio', audioBlob, 'voicenote.webm');
        formData.append('audio_duration', duration);
        formData.append('locale', locale);
        formData.append('is_ephemeral', isEphemeral ? 1 : 0);

        const optimisticUserMessage = {
            id: 'temp-' + Date.now(),
            sender: 'user',
            message_text: `Voice message (${duration}s)`,
            audio_url: URL.createObjectURL(audioBlob),
            audio_duration: duration,
            safety_flag: 'none',
        };

        setMessages(prev => [...prev, optimisticUserMessage]);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(route('luna.message'), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                setMessages(prev => [
                    ...prev.slice(0, -1),
                    data.user_message,
                    {
                        ...data.luna_message,
                        escalation: data.escalation,
                        referenced_resources: data.referenced_resources,
                    }
                ]);
            }
        } catch (err) {
            console.error('Error sending voice note:', err);
        } finally {
            setIsSending(false);
        }
    };

    const handleClearHistory = () => {
        if (confirm('Clear messages in this consultation?')) {
            router.delete(route('luna.clear'), {
                onSuccess: () => setMessages([]),
            });
        }
    };

    return (
        <MobileAppLayout
            title={conversation?.title || 'Luna AI'}
            backUrl={route('luna.index')}
            showNav={false}
            fullHeight={true}
        >
            <Head title={`Luna AI - ${conversation?.title || 'Chat'}`} />

            <div className="flex flex-col h-full w-full min-w-0 overflow-hidden">

                {/* 1. CHAT SCROLL AREA */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 pr-1 hide-scrollbar min-w-0 w-full pb-2">
                    {/* Privacy Note */}
                    <div className="flex justify-center pt-1 pb-0.5">
                        <span className="inline-flex items-center space-x-1 text-[10px] text-slate-400 bg-slate-100/70 px-2.5 py-0.5 rounded-full font-medium">
                            <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span>Private & Encrypted Health AI</span>
                        </span>
                    </div>

                    {/* Welcome Bubble from Luna */}
                    <div className="flex items-start space-x-2.5 w-full min-w-0">
                        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs text-xs text-slate-800 leading-relaxed shadow-2xs border border-rose-100/90 flex-1 min-w-0">
                            <p className="font-bold text-rose-700 mb-1">
                                {t('luna_welcome_title', "Hello, I'm Luna!")}
                            </p>
                            <p className="text-slate-600">
                                {t('luna_welcome_desc', "I'm your confidential companion. Ask me anything, attach photos/reports (up to 5 files, 2MB each), or record a voice note. How can I support you today?")}
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
                                        {/* Audio Voice Note Bubble */}
                                        {msg.audio_url && (
                                            <div className="mb-2">
                                                <AudioPlayerBubble
                                                    src={msg.audio_url}
                                                    duration={msg.audio_duration}
                                                    isUser={isUser}
                                                />
                                            </div>
                                        )}

                                        {/* Attachments Preview (Images / Documents) */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mb-2 space-y-1.5">
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {msg.attachments.map((att, aIdx) => (
                                                        att.is_image ? (
                                                            <a
                                                                key={aIdx}
                                                                href={att.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block rounded-xl overflow-hidden border border-black/10 hover:opacity-90 transition"
                                                            >
                                                                <img
                                                                    src={att.url}
                                                                    alt={att.name}
                                                                    className="w-full h-24 object-cover"
                                                                />
                                                            </a>
                                                        ) : (
                                                            <a
                                                                key={aIdx}
                                                                href={att.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                                className={`flex items-center space-x-1.5 p-2 rounded-xl text-[10px] font-medium border truncate transition ${isUser
                                                                    ? 'bg-white/15 border-white/20 text-white hover:bg-white/25'
                                                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                                                <span className="truncate">{att.name}</span>
                                                            </a>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Text content */}
                                        {msg.message_text && (!msg.audio_url || msg.message_text !== 'Voice message') && (
                                            <FormattedMessage content={msg.message_text} isUser={isUser} />
                                        )}

                                        {/* Audio Playback of Luna's Response (Speech Synthesis) */}
                                        {!isUser && msg.message_text && (
                                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSpeechSynthesis(msg.id || idx, msg.message_text)}
                                                    className="inline-flex items-center space-x-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 transition"
                                                >
                                                    {speakingMsgId === (msg.id || idx) ? (
                                                        <>
                                                            <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                                                            <span>Stop Listening</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                                                            <span>Listen to Luna</span>
                                                        </>
                                                    )}
                                                </button>
                                                <span className="text-[9px] text-slate-400 font-medium">Grounded AI</span>
                                            </div>
                                        )}

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

                {/* 3. INPUT DOCK PINNED AT BOTTOM */}
                <div className="space-y-2 pt-1.5 shrink-0 w-full min-w-0 bg-[#FAF6F7]">

                    {/* File Attachment Previews Shelf (Max 5 files, 2MB each) */}
                    {attachedFiles.length > 0 && (
                        <div className="bg-white p-2.5 rounded-2xl border border-rose-100 shadow-2xs space-y-1 animate-fadeIn">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
                                <span>Attached Files ({attachedFiles.length}/5)</span>
                                <span className="text-[10px] text-slate-400 font-normal">Max 2MB each</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {attachedFiles.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center space-x-1.5 pl-2 pr-1.5 py-1 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-slate-800"
                                    >
                                        {file.type.startsWith('image/') ? (
                                            <ImageIcon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                        ) : (
                                            <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                        )}
                                        <span className="truncate max-w-[110px] text-[11px] font-medium">{file.name}</span>
                                        <span className="text-[9.5px] text-slate-400">({formatFileSize(file.size)})</span>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachedFile(idx)}
                                            className="p-0.5 rounded-full hover:bg-rose-200 text-rose-700 transition"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Notice */}
                    {fileError && (
                        <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{fileError}</span>
                        </div>
                    )}

                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    {/* LIVE AUDIO RECORDING BAR (Active Mode) */}
                    {isRecording ? (
                        <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-rose-600 text-white p-2 px-4 rounded-2xl shadow-md animate-pulse">
                            <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                                <span className="font-bold text-xs">Recording Voice Note</span>
                                <span className="font-mono text-xs font-black bg-black/20 px-2 py-0.5 rounded-md">
                                    {formatDuration(recordingTime)}
                                </span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={cancelRecording}
                                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="px-3 py-1 bg-white text-rose-700 rounded-xl text-xs font-bold shadow-xs hover:bg-rose-50 transition"
                                >
                                    Send Voice Note
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* STANDARD INPUT DOCK */
                        <div className="flex items-center space-x-1.5 bg-white p-1.5 pl-2 rounded-2xl shadow-xs border border-rose-200/80 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition w-full min-w-0">

                            {/* File Attachment Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={attachedFiles.length >= 5}
                                className={`p-2 rounded-xl transition shrink-0 relative ${attachedFiles.length > 0
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                                    }`}
                                title="Attach files (Max 5, 2MB each)"
                            >
                                <Paperclip className="w-4 h-4" />
                                {attachedFiles.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                                        {attachedFiles.length}
                                    </span>
                                )}
                            </button>

                            {/* Audio Record Button */}
                            <button
                                type="button"
                                onClick={startRecording}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition shrink-0"
                                title="Record voice note"
                            >
                                <Mic className="w-4 h-4" />
                            </button>

                            {/* Text Input */}
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={t('luna_input_placeholder', 'Ask Luna about cramps, flow, or pads...')}
                                className="flex-1 min-w-0 border-0 focus:ring-0 text-xs px-2 py-1 placeholder-slate-400 font-sans bg-transparent"
                            />

                            {/* Send Button */}
                            <button
                                type="button"
                                onClick={() => handleSendMessage()}
                                disabled={(!inputText.trim() && attachedFiles.length === 0) || isSending}
                                className="p-2.5 rounded-xl bg-[#BE123C] hover:bg-[#9F1239] active:scale-95 text-white disabled:opacity-40 transition shadow-2xs shrink-0"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </MobileAppLayout>
    );
}
