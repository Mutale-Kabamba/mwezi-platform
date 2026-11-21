import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MarkdownRenderer from '@/Components/MarkdownRenderer';
import { useTranslation } from '@/i18n/LanguageContext';
import {
    CheckCircle,
    Volume2,
    Share2,
    Clock,
    CheckSquare,
    Square,
    Sparkles,
    CheckCircle2,
    VolumeX,
    Play,
    Pause,
    BookOpen,
    ChevronRight,
    ShieldCheck,
    Download,
    FileText,
    HelpCircle,
} from 'lucide-react';

export default function LearnShow({
    resource,
    progress,
    related = [],
    currentLocale = 'en',
}) {
    const { locale, t } = useTranslation();
    const isTier1 = Boolean(usePage().props?.auth?.tierPolicy?.is_tier_1);

    useEffect(() => {
        if (locale && locale !== currentLocale) {
            router.get(route('learn.show', resource.slug), {
                locale: locale,
            }, { preserveState: true, preserveScroll: true });
        }
    }, [locale]);

    const translation = resource.translations?.[0];
    const title = translation?.translated_title || resource.title;
    const body = translation?.translated_body || resource.body_content;

    const audioUrl = translation?.audio_narration_url || resource.audio_narration_url;
    const audioRef = useRef(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);

    const [isCompleted, setIsCompleted] = useState(!!progress?.completed_at);
    const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

    const toggleAudioPlay = () => {
        if (!audioRef.current) return;
        if (isPlayingAudio) {
            audioRef.current.pause();
            setIsPlayingAudio(false);
        } else {
            audioRef.current.play();
            setIsPlayingAudio(true);
        }
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        setAudioProgress(audioRef.current.currentTime);
        setAudioDuration(audioRef.current.duration || 0);
    };

    const handleAudioEnded = () => {
        setIsPlayingAudio(false);
        setAudioProgress(0);
    };

    const handleSeek = (e) => {
        if (!audioRef.current) return;
        const targetTime = parseFloat(e.target.value);
        audioRef.current.currentTime = targetTime;
        setAudioProgress(targetTime);
    };

    const formatAudioTime = (sec) => {
        if (!sec || isNaN(sec)) return '0:00';
        const mins = Math.floor(sec / 60);
        const secs = Math.floor(sec % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const [checkedSteps, setCheckedSteps] = useState([false, false, false, false]);

    const toggleStep = (idx) => {
        const next = [...checkedSteps];
        next[idx] = !next[idx];
        setCheckedSteps(next);
    };

    const toggleSpeech = () => {
        if (!('speechSynthesis' in window)) {
            alert('Text-to-speech is not supported on this browser.');
            return;
        }

        if (isPlayingSpeech) {
            window.speechSynthesis.cancel();
            setIsPlayingSpeech(false);
        } else {
            const cleanText = `${title}. ${body.replace(/[#*`>]/g, '')}`;
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 0.95;
            utterance.onend = () => setIsPlayingSpeech(false);
            utterance.onerror = () => setIsPlayingSpeech(false);
            window.speechSynthesis.speak(utterance);
            setIsPlayingSpeech(true);
        }
    };

    const markCompleted = () => {
        router.post(route('learn.progress'), {
            resource_id: resource.id,
            progress_percent: 100,
            quiz_score: 100,
        }, {
            preserveScroll: true,
            onSuccess: () => setIsCompleted(true),
        });
    };

    const isReusableGuide = resource.slug.includes('reusable') || resource.slug.includes('washing');
    const isPlayingAny = audioUrl ? isPlayingAudio : isPlayingSpeech;

    const attachments = resource.attachments || [];
    const quizQuestions = Array.isArray(resource.quiz_questions) ? resource.quiz_questions : [];
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(progress?.quiz_score !== null && progress?.quiz_score !== undefined);
    const [quizScore, setQuizScore] = useState(progress?.quiz_score ?? null);

    const getEmbedUrl = (url) => {
        if (!url) return null;
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&playsinline=1&rel=0`;
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1`;
        return null;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleQuizSubmit = () => {
        if (quizQuestions.length === 0) return;
        let correct = 0;
        quizQuestions.forEach((q, idx) => {
            if (Number(quizAnswers[idx]) === Number(q.correct_index)) {
                correct += 1;
            }
        });
        const pct = Math.round((correct / quizQuestions.length) * 100);
        setQuizScore(pct);
        setQuizSubmitted(true);

        router.post(route('learn.progress'), {
            resource_id: resource.id,
            progress_percent: 100,
            quiz_score: pct,
        }, {
            preserveScroll: true,
            onSuccess: () => setIsCompleted(true),
        });
    };

    const embedUrl = getEmbedUrl(resource.video_url);

    return (
        <MobileAppLayout
            title={resource.category?.name || 'Guide'}
            subtitle={`${resource.read_time_minutes} min read`}
            backUrl="/learn"
            actionButton={
                !isTier1 ? (
                    <button
                        type="button"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({ title, text: resource.summary, url: window.location.href });
                            }
                        }}
                        className="w-8 h-8 rounded-full bg-white/75 hover:bg-white border border-white text-[#5E546B] hover:text-[#2D2638] flex items-center justify-center transition"
                        title="Share"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                ) : null
            }
        >
            <Head title={`${title} - Mwezi Learn`} />

            <div className="space-y-4 pb-6">

                {/* 1. MEDIA / VOICE NARRATION STAGE (Only on readable/audio materials) */}
                {['article', 'checklist', 'audio_guide'].includes(resource.format || 'article') && (
                <div className="bg-gradient-to-br from-[#3B1764] via-[#4C1D95] to-[#6D28D9] rounded-3xl p-5 text-white shadow-md shadow-purple-400/25 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />

                    {audioUrl && (
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            preload="none"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleTimeUpdate}
                            onEnded={handleAudioEnded}
                        />
                    )}

                    <div className="flex items-center justify-between text-[10px] font-semibold text-purple-200 mb-4 relative z-10">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 uppercase tracking-wider">
                            {audioUrl
                                ? (currentLocale === 'en' ? 'English Audio' : `${currentLocale.toUpperCase()} Voice`)
                                : 'Audio & Read Mode'}
                        </span>
                        <span className="inline-flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{resource.read_time_minutes} min</span>
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-3 relative z-10">
                        <button
                            type="button"
                            onClick={audioUrl ? toggleAudioPlay : toggleSpeech}
                            className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/35 flex items-center justify-center transition active:scale-95 shadow-lg"
                            title={isPlayingAny ? 'Pause narration' : 'Listen to lesson'}
                        >
                            {isPlayingAny ? (
                                <Pause className="w-6 h-6 text-white" />
                            ) : audioUrl ? (
                                <Play className="w-6 h-6 text-white ml-0.5" />
                            ) : (
                                <Volume2 className="w-6 h-6 text-white" />
                            )}
                        </button>
                        <span className="text-[11px] font-semibold text-purple-100 mt-2.5">
                            {isPlayingAny ? 'Playing narration...' : 'Tap to listen to this guide'}
                        </span>
                    </div>

                    {audioUrl && (
                        <div className="mt-3 space-y-1 relative z-10">
                            <input
                                type="range"
                                min={0}
                                max={audioDuration || 100}
                                value={audioProgress}
                                onChange={handleSeek}
                                className="w-full h-1.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                            <div className="flex justify-between text-[10px] font-mono text-purple-200">
                                <span>{formatAudioTime(audioProgress)}</span>
                                <span>{formatAudioTime(audioDuration)}</span>
                            </div>
                        </div>
                    )}
                </div>
                )}

                {/* 2. LESSON HEADER & CLINICAL CLEARANCE */}
                <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/90 space-y-3">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
                            {resource.category?.name || 'Education'}
                        </span>
                        <h1 className="font-bold text-lg text-[#2D2638] leading-snug mt-0.5">
                            {title}
                        </h1>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 flex items-center space-x-2.5 text-xs text-emerald-900">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                            <span className="font-bold block text-[11px]">
                                {t('learn_medically_verified', 'Reviewed by Verified Healthcare Partner')}
                            </span>
                            <span className="text-[10px] text-emerald-700">
                                Dr. Mwamba Tembo (Adolescent Health Specialist)
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. INTERACTIVE WASH & DRY CHECKLIST (If Pad Care Guide) */}
                {isReusableGuide && (
                    <div className="bg-purple-50/75 backdrop-blur-xl rounded-3xl p-4 border border-white/90 shadow-2xs space-y-2.5">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                            <h3 className="font-bold text-xs text-[#2D2638] uppercase tracking-wider">
                                {t('learn_pad_care_title', 'Interactive Wash & Dry Checklist')}
                            </h3>
                        </div>

                        <div className="space-y-2">
                            {[
                                '1. Pre-soak in cold or lukewarm water for 15–30 minutes (Never hot water).',
                                '2. Gently lather with mild bar soap; avoid chlorine bleach to protect fabric.',
                                '3. Rinse repeatedly until wash water is 100% clean and clear of soap.',
                                '4. Hang in direct sunlight with dignity (Sunlight is a natural sanitizer!).',
                            ].map((step, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => toggleStep(idx)}
                                    className={`w-full p-2.5 rounded-2xl text-left text-xs transition flex items-start space-x-2 border ${
                                        checkedSteps[idx]
                                            ? 'bg-white font-semibold text-emerald-800 border-emerald-300 shadow-2xs'
                                            : 'bg-white/70 text-[#5E546B] border-white hover:bg-white'
                                    }`}
                                >
                                    {checkedSteps[idx] ? (
                                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    ) : (
                                        <Square className="w-4 h-4 text-[#8A7F99] shrink-0 mt-0.5" />
                                    )}
                                    <span>{step}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. VIDEO LESSON (If video_url is attached) */}
                {resource.video_url && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-full bg-purple-100/85 text-[#7C3AED] flex items-center justify-center">
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                </div>
                                <span className="text-xs font-bold text-[#2D2638]">Video Lesson</span>
                            </div>
                            <a
                                href={resource.video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-bold text-[#7C3AED] hover:underline"
                            >
                                Open Video
                            </a>
                        </div>

                        {embedUrl ? (
                            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900">
                                <iframe
                                    src={embedUrl}
                                    title={title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <video
                                controls
                                autoPlay
                                muted
                                playsInline
                                src={resource.video_url}
                                className="w-full rounded-2xl bg-slate-900 max-h-56"
                            />
                        )}
                    </div>
                )}

                {/* 4.05 INFOGRAPHIC / VISUAL POSTER (If thumbnail_url is attached) */}
                {resource.thumbnail_url && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-3 shadow-2xs border border-white/95 overflow-hidden">
                        <img
                            src={resource.thumbnail_url}
                            alt={title}
                            className="w-full rounded-2xl object-cover max-h-96 bg-slate-50"
                        />
                    </div>
                )}

                {/* 4.1 VIDEO OVERVIEW OR ARTICLE BODY CONTENT */}
                {resource.format === 'video' ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-2xs border border-white/95 space-y-1.5">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED]">
                            Overview
                        </h3>
                        <p className="text-xs text-[#2D2638] leading-relaxed">
                            {translation?.translated_summary || resource.summary}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-2xs border border-white/95">
                        <MarkdownRenderer content={body} />
                    </div>
                )}

                {/* 4.2 DOWNLOADABLE LESSON MATERIALS (PDF, DOC, PPTX, XLSX, etc.) */}
                {attachments.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-full bg-teal-100/85 text-teal-600 flex items-center justify-center">
                                    <FileText className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-[#2D2638]">Downloadable Materials</h3>
                                    <p className="text-[10px] text-[#6E637C]">PDF, Word, Slides &amp; Worksheets</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100/80 text-[#7C3AED]">
                                {attachments.length} {attachments.length === 1 ? 'file' : 'files'}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {attachments.map((att) => (
                                <a
                                    key={att.id}
                                    href={route('learn.attachments.download', att.id)}
                                    className="flex items-center justify-between p-3 rounded-2xl bg-white/80 hover:bg-white border border-white transition active:scale-[0.98]"
                                >
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                        <span className="px-2 py-1 rounded-xl bg-purple-100/85 text-[#7C3AED] font-mono text-[10px] font-extrabold uppercase shrink-0">
                                            {att.file_extension || 'FILE'}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-[#2D2638] truncate">
                                                {att.title || att.original_name}
                                            </p>
                                            <p className="text-[10px] text-[#6E637C] truncate">
                                                {att.original_name}
                                                {att.file_size ? ` • ${formatFileSize(att.file_size)}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0 ml-2 shadow-xs">
                                        <Download className="w-3.5 h-3.5" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4.3 INTERACTIVE LESSON QUIZ */}
                {quizQuestions.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-full bg-purple-100/85 text-[#7C3AED] flex items-center justify-center">
                                    <HelpCircle className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-[#2D2638]">Quick Quiz</h3>
                                    <p className="text-[10px] text-[#6E637C]">{quizQuestions.length} questions</p>
                                </div>
                            </div>
                            {quizScore !== null && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    Score: {quizScore}%
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            {quizQuestions.map((q, qIdx) => (
                                <div key={qIdx} className="p-3 rounded-2xl bg-white/75 border border-white space-y-2">
                                    <p className="text-xs font-bold text-[#2D2638]">
                                        {qIdx + 1}. {q.question}
                                    </p>
                                    <div className="space-y-1.5">
                                        {(q.options || []).map((opt, oIdx) => {
                                            const selected = Number(quizAnswers[qIdx]) === oIdx;
                                            const isCorrect = Number(q.correct_index) === oIdx;
                                            let pillStyle = 'bg-white/85 border-white text-[#5E546B] hover:bg-white';
                                            if (quizSubmitted) {
                                                if (isCorrect) {
                                                    pillStyle = 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold';
                                                } else if (selected && !isCorrect) {
                                                    pillStyle = 'bg-rose-100 border-rose-300 text-rose-800 font-semibold';
                                                }
                                            } else if (selected) {
                                                pillStyle = 'bg-[#7C3AED] border-[#7C3AED] text-white font-bold';
                                            }
                                            return (
                                                <button
                                                    key={oIdx}
                                                    type="button"
                                                    disabled={quizSubmitted}
                                                    onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                                                    className={`w-full text-left px-3 py-2 rounded-xl border text-[11px] transition ${pillStyle}`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {quizSubmitted && q.explanation && (
                                        <p className="text-[10.5px] text-[#6E637C] italic pt-1">
                                            {q.explanation}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {!quizSubmitted ? (
                            <button
                                type="button"
                                onClick={handleQuizSubmit}
                                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                                className="w-full py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-bold text-xs rounded-full shadow-md shadow-purple-300/40 transition active:scale-95"
                            >
                                Submit Quiz
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuizAnswers({});
                                    setQuizSubmitted(false);
                                }}
                                className="w-full py-2 px-4 bg-white/85 hover:bg-white text-[#7C3AED] font-bold text-xs rounded-full border border-white transition"
                            >
                                Retake Quiz
                            </button>
                        )}
                    </div>
                )}

                {/* 5. BOTTOM ACTION PILLS (Back & Mark Done) */}
                <div className="grid grid-cols-2 gap-2.5">
                    <Link
                        href="/learn"
                        className="py-3 px-4 rounded-full bg-white/80 hover:bg-white border border-white text-[#2D2638] font-bold text-xs flex items-center justify-center space-x-1.5 shadow-2xs transition"
                    >
                        <BookOpen className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>All Guides</span>
                    </Link>

                    <button
                        type="button"
                        onClick={markCompleted}
                        disabled={isCompleted}
                        className={`py-3 px-4 rounded-full text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md ${
                            isCompleted
                                ? 'bg-emerald-500 text-white shadow-emerald-200/50 cursor-default'
                                : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-purple-300/40 active:scale-95'
                        }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isCompleted ? t('learn_completed', 'Done') : t('learn_mark_completed', 'Mark done')}</span>
                    </button>
                </div>

                {/* 6. UP NEXT / RELATED GUIDES */}
                {related.length > 0 && (
                    <div className="pt-1 space-y-2">
                        <h3 className="font-bold text-xs text-[#6E637C] uppercase tracking-wider px-1">
                            {t('learn_more_in_category', 'Up next')}
                        </h3>
                        <div className="space-y-2">
                            {related.map((rel) => (
                                <Link
                                    key={rel.id}
                                    href={`/learn/article/${rel.slug}`}
                                    className="flex items-center justify-between p-3 bg-white/75 backdrop-blur-xl rounded-2xl border border-white/95 shadow-2xs hover:bg-white transition group"
                                >
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-[#7C3AED] flex items-center justify-center shrink-0">
                                            <Play className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-[#2D2638] group-hover:text-[#7C3AED] truncate">
                                            {rel.title}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[#8A7F99] shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MobileAppLayout>
    );
}
