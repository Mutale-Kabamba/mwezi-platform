import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MarkdownRenderer from '@/Components/MarkdownRenderer';
import { useTranslation } from '@/i18n/LanguageContext';
import { 
    ArrowLeft, 
    CheckCircle, 
    Volume2, 
    Bookmark, 
    Share2, 
    Clock, 
    CheckSquare, 
    Square, 
    Sparkles, 
    CheckCircle2,
    VolumeX
} from 'lucide-react';

export default function LearnShow({ 
    resource, 
    progress, 
    related = [], 
    currentLocale = 'en' 
}) {
    const { locale, t } = useTranslation();

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

    const [isCompleted, setIsCompleted] = useState(!!progress?.completed_at);
    const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

    // Interactive Checklist state for Reusable pad steps
    const [checkedSteps, setCheckedSteps] = useState([false, false, false, false]);

    const toggleStep = (idx) => {
        const next = [...checkedSteps];
        next[idx] = !next[idx];
        setCheckedSteps(next);
    };

    // Text to Speech using Web Speech API
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

    // Mark as completed
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

    // Check if this is the reusable pad guide
    const isReusableGuide = resource.slug.includes('reusable') || resource.slug.includes('washing');

    return (
        <MobileAppLayout title="Article" subtitle="Verified Health Education">
            <Head title={`${title} - Mwezi Learn`} />

            <div className="space-y-4">
                
                {/* Top Nav Back & Controls */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/learn"
                        className="p-2 rounded-xl bg-white text-gray-700 hover:bg-gray-100 transition shadow-sm flex items-center space-x-1 text-xs font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>All Guides</span>
                    </Link>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleSpeech}
                            className={`p-2 rounded-xl border transition flex items-center space-x-1 text-xs font-semibold ${
                                isPlayingSpeech 
                                    ? 'bg-mwezi-accent text-white border-mwezi-accent' 
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                            title="Listen to Narration"
                        >
                            {isPlayingSpeech ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isPlayingSpeech ? 'Stop' : 'Listen'}</span>
                        </button>

                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({ title, text: resource.summary, url: window.location.href });
                                }
                            }}
                            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                            title="Share"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Article Header Card */}
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-[10px] font-bold text-mwezi-tertiary bg-mwezi-primary/40 px-2.5 py-0.5 rounded-full capitalize">
                            {resource.category?.name || 'Education'}
                        </span>
                        <span className="text-[10px] text-gray-500 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{resource.read_time_minutes} min read</span>
                        </span>
                    </div>

                    <h1 className="font-heading font-extrabold text-xl text-gray-900 leading-snug mb-3">
                        {title}
                    </h1>

                    {/* Medical Clearance Badge */}
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2.5 text-xs text-emerald-900">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                            <span className="font-bold block">Reviewed by Verified Healthcare Partner</span>
                            <span className="text-[10px] text-emerald-700">Dr. Mwamba Tembo (Adolescent Health Specialist)</span>
                        </div>
                    </div>
                </div>

                {/* REUSABLE PAD CARE INTERACTIVE CHECKLIST (If viewing pad care guide) */}
                {isReusableGuide && (
                    <div className="bg-mwezi-secondary/40 rounded-[20px] p-4 border border-mwezi-secondary shadow-sm space-y-3">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-mwezi-tertiary" />
                            <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider">
                                Interactive Wash & Dry Checklist
                            </h3>
                        </div>

                        <div className="space-y-2">
                            {[
                                "1. Pre-soak in cold or lukewarm water for 15-30 minutes (Never hot water).",
                                "2. Gently lather with mild bar soap; avoid chlorine bleach to protect fabric.",
                                "3. Rinse repeatedly until wash water is 100% clean and clear of soap.",
                                "4. Hang in direct sunlight with dignity (Sunlight is a natural sanitizer!)."
                            ].map((step, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => toggleStep(idx)}
                                    className={`w-full p-2.5 rounded-xl text-left text-xs transition flex items-start space-x-2 ${
                                        checkedSteps[idx] 
                                            ? 'bg-white font-semibold text-emerald-800 shadow-sm border border-emerald-300' 
                                            : 'bg-white/70 text-gray-700 hover:bg-white'
                                    }`}
                                >
                                    {checkedSteps[idx] ? (
                                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    ) : (
                                        <Square className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                    )}
                                    <span>{step}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Article Body Content (Richly Formatted Typography) */}
                <div className="bg-white rounded-3xl p-5 shadow-xs border border-rose-150/80">
                    <MarkdownRenderer content={body} />
                </div>

                {/* Mark as Finished CTA */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h4 className="font-heading font-bold text-xs text-gray-900">Finished Reading?</h4>
                        <p className="text-[10px] text-gray-500">Track your learning streak for health dignity.</p>
                    </div>

                    <button
                        onClick={markCompleted}
                        disabled={isCompleted}
                        className={`py-2 px-4 rounded-[16px] text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
                            isCompleted 
                                ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                                : 'bg-mwezi-accent hover:bg-mwezi-accent/95 text-white active:scale-95'
                        }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isCompleted ? 'Completed' : 'Mark Completed'}</span>
                    </button>
                </div>

                {/* Related Articles */}
                {related.length > 0 && (
                    <div className="pt-2 space-y-2">
                        <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider px-1">
                            More in this Category
                        </h3>
                        {related.map((rel) => (
                            <Link
                                key={rel.id}
                                href={`/learn/article/${rel.slug}`}
                                className="block p-3 bg-white rounded-[16px] border border-gray-100 shadow-sm hover:bg-mwezi-light text-xs font-medium text-gray-800 transition"
                            >
                                {rel.title}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </MobileAppLayout>
    );
}

