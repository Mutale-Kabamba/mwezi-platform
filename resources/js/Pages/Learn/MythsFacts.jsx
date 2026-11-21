import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MarkdownRenderer, { formatInlineText } from '@/Components/MarkdownRenderer';
import { useTranslation } from '@/i18n/LanguageContext';
import {
    CheckCircle2,
    XCircle,
    RotateCw,
    Sparkles,
    CheckCircle,
    Award,
    ArrowRight,
    Flame,
    BookOpen,
} from 'lucide-react';

function extractFactPrompt(explanation = '') {
    const clean = String(explanation)
        .replace(/[#*_`>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!clean) return '';
    const firstSentence = clean.match(/^[^.!?]+[.!?]/);
    return firstSentence ? firstSentence[0].trim() : clean.slice(0, 140);
}

function buildQuizDeck(myths = [], seedOffset = 0) {
    return myths.map((item, idx) => {
        const factPrompt = extractFactPrompt(item.fact_explanation);
        const useFact = factPrompt.length >= 25 && (idx + seedOffset) % 3 === 1;
        return {
            id: item.id,
            category: item.category?.name || 'Menstrual Health',
            statement: useFact ? factPrompt : item.myth_statement,
            isFact: useFact,
            mythStatement: item.myth_statement,
            factExplanation: item.fact_explanation,
        };
    });
}

export default function MythsFacts({ myths = [], currentLocale = 'en' }) {
    const { locale } = useTranslation();

    useEffect(() => {
        if (locale && locale !== currentLocale) {
            router.get(
                route('learn.myths'),
                { locale },
                { preserveState: true, preserveScroll: true }
            );
        }
    }, [locale]);

    const [mode, setMode] = useState('quiz'); // 'quiz' | 'study'
    const [roundSeed, setRoundSeed] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null); // null | 'myth' | 'fact'
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const deck = useMemo(() => buildQuizDeck(myths, roundSeed), [myths, roundSeed]);
    const totalCount = deck.length;
    const currentQuestion = deck[currentIndex] || null;

    const percentDone =
        totalCount > 0
            ? Math.round(((isFinished ? totalCount : answeredCount) / totalCount) * 100)
            : 0;

    const ringRadius = 26;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference - (percentDone / 100) * ringCircumference;

    const handleAnswer = (choice) => {
        if (!currentQuestion || selectedChoice !== null) return;
        setSelectedChoice(choice);
        setAnsweredCount((c) => c + 1);

        const isCorrect =
            (choice === 'fact' && currentQuestion.isFact) ||
            (choice === 'myth' && !currentQuestion.isFact);

        if (isCorrect) {
            setScore((s) => s + 1);
            setStreak((prev) => {
                const next = prev + 1;
                setBestStreak((b) => Math.max(b, next));
                return next;
            });
        } else {
            setStreak(0);
        }
    };

    const handleNext = () => {
        if (currentIndex + 1 < totalCount) {
            setCurrentIndex((i) => i + 1);
            setSelectedChoice(null);
        } else {
            setIsFinished(true);
        }
    };

    const handleRestart = () => {
        setRoundSeed((s) => s + 1);
        setCurrentIndex(0);
        setSelectedChoice(null);
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setAnsweredCount(0);
        setIsFinished(false);
        setMode('quiz');
    };

    const isCurrentCorrect =
        selectedChoice !== null &&
        currentQuestion &&
        ((selectedChoice === 'fact' && currentQuestion.isFact) ||
            (selectedChoice === 'myth' && !currentQuestion.isFact));

    const scorePercent = totalCount > 0 ? Math.round((score / totalCount) * 100) : 0;

    return (
        <MobileAppLayout title="Myths vs. Facts" subtitle="Interactive quiz engine" backUrl="/learn">
            <Head title="Myths vs Facts Quiz - Mwezi" />

            <div className="space-y-4 pb-6">
                {/* 1. PROGRESS & STREAK SUMMARY CARD */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r={ringRadius}
                                        fill="none"
                                        stroke="#EDE9FE"
                                        strokeWidth="5"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r={ringRadius}
                                        fill="none"
                                        stroke="#7C3AED"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeDasharray={ringCircumference}
                                        strokeDashoffset={ringOffset}
                                    />
                                </svg>
                                <span className="absolute text-xs font-extrabold text-[#2D2638]">
                                    {percentDone}%
                                </span>
                            </div>

                            <div>
                                <h1 className="font-bold text-sm text-[#2D2638]">
                                    Myth Buster Quiz
                                </h1>
                                <p className="text-[11px] text-[#6E637C] mt-0.5">
                                    Score: <strong className="text-[#2D2638]">{score}/{totalCount}</strong>
                                    {streak > 0 && (
                                        <span className="ml-2 inline-flex items-center text-amber-600 font-bold">
                                            <Flame className="w-3 h-3 mr-0.5" />
                                            {streak} streak
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div className="inline-flex bg-purple-100/70 p-0.5 rounded-full">
                            <button
                                type="button"
                                onClick={() => setMode('quiz')}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                    mode === 'quiz'
                                        ? 'bg-[#7C3AED] text-white shadow-2xs'
                                        : 'text-[#5E546B]'
                                }`}
                            >
                                Quiz
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('study')}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                    mode === 'study'
                                        ? 'bg-[#7C3AED] text-white shadow-2xs'
                                        : 'text-[#5E546B]'
                                }`}
                            >
                                Study All
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. QUIZ ENGINE MODE */}
                {mode === 'quiz' ? (
                    totalCount === 0 ? (
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-center border border-white/95 space-y-2">
                            <Sparkles className="w-6 h-6 text-[#7C3AED] mx-auto" />
                            <p className="text-xs font-bold text-[#2D2638]">No quiz questions available yet</p>
                            <p className="text-[11px] text-[#6E637C]">
                                Verified myths and facts will appear here once published.
                            </p>
                        </div>
                    ) : isFinished ? (
                        /* COMPLETION & BADGE SCREEN */
                        <div className="space-y-3 animate-fadeIn">
                            <div className="bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] rounded-3xl p-5 text-white shadow-md shadow-purple-400/30 space-y-3 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center mx-auto">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200 block">
                                        {scorePercent >= 80 ? 'New Badge Unlocked' : 'Quiz Complete'}
                                    </span>
                                    <h2 className="font-extrabold text-lg mt-0.5">
                                        {scorePercent >= 80 ? 'Myth Buster Ace' : 'Myth Challenger'}
                                    </h2>
                                    <p className="text-xs text-purple-100 mt-1">
                                        You scored <strong>{score} of {totalCount}</strong> ({scorePercent}%)
                                        {bestStreak > 1 ? ` • Best streak: ${bestStreak}` : ''}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleRestart}
                                        className="py-2.5 px-4 bg-white text-[#7C3AED] font-bold text-xs rounded-full shadow-xs flex items-center justify-center space-x-1.5 active:scale-95 transition"
                                    >
                                        <RotateCw className="w-3.5 h-3.5" />
                                        <span>Play Again</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('study')}
                                        className="py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-full border border-white/30 flex items-center justify-center space-x-1.5 active:scale-95 transition"
                                    >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>Review Facts</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ACTIVE QUESTION CARD */
                        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-5 shadow-2xs border border-white space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-full bg-purple-100/85 text-[#7C3AED] text-[10px] font-bold uppercase">
                                    {currentQuestion.category}
                                </span>
                                <span className="text-[11px] font-bold text-[#6E637C]">
                                    {currentIndex + 1} / {totalCount}
                                </span>
                            </div>

                            {/* Segmented Question Progress Bar */}
                            <div className="w-full h-1.5 bg-purple-100/80 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#7C3AED] rounded-full transition-all duration-300"
                                    style={{
                                        width: `${Math.round(((currentIndex + (selectedChoice ? 1 : 0)) / totalCount) * 100)}%`,
                                    }}
                                />
                            </div>

                            <div className="py-2 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7F99] block">
                                    Is this statement a Myth or a Fact?
                                </span>
                                <h2 className="font-extrabold text-base text-[#2D2638] leading-snug">
                                    &ldquo;{formatInlineText(currentQuestion.statement)}&rdquo;
                                </h2>
                            </div>

                            {/* TWO-OPTION INTERACTIVE BUTTONS */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    disabled={selectedChoice !== null}
                                    onClick={() => handleAnswer('myth')}
                                    className={`py-3.5 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 ${
                                        selectedChoice === null
                                            ? 'bg-rose-50/90 hover:bg-rose-100 border-rose-200 text-rose-700'
                                            : !currentQuestion.isFact
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                            : selectedChoice === 'myth'
                                            ? 'bg-rose-500 border-rose-500 text-white'
                                            : 'bg-white/60 border-white text-[#8A7F99] opacity-60'
                                    }`}
                                >
                                    <XCircle className="w-4 h-4" />
                                    <span>It&apos;s a Myth</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={selectedChoice !== null}
                                    onClick={() => handleAnswer('fact')}
                                    className={`py-3.5 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 ${
                                        selectedChoice === null
                                            ? 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                                            : currentQuestion.isFact
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                            : selectedChoice === 'fact'
                                            ? 'bg-rose-500 border-rose-500 text-white'
                                            : 'bg-white/60 border-white text-[#8A7F99] opacity-60'
                                    }`}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>It&apos;s a Fact</span>
                                </button>
                            </div>

                            {/* INSTANT VERIFIED EXPLANATION */}
                            {selectedChoice !== null && (
                                <div
                                    className={`p-4 rounded-2xl border space-y-2 animate-fadeIn ${
                                        isCurrentCorrect
                                            ? 'bg-emerald-50/90 border-emerald-200'
                                            : 'bg-rose-50/90 border-rose-200'
                                    }`}
                                >
                                    <div className="flex items-center space-x-1.5">
                                        {isCurrentCorrect ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                        )}
                                        <span
                                            className={`text-xs font-extrabold ${
                                                isCurrentCorrect ? 'text-emerald-800' : 'text-rose-800'
                                            }`}
                                        >
                                            {isCurrentCorrect
                                                ? `Correct! This is a ${currentQuestion.isFact ? 'Fact' : 'Myth'}.`
                                                : `Not quite — this is actually a ${currentQuestion.isFact ? 'Fact' : 'Myth'}.`}
                                        </span>
                                    </div>

                                    <div className="text-xs text-[#2D2638] leading-relaxed">
                                        <MarkdownRenderer content={currentQuestion.factExplanation} />
                                    </div>

                                    <div className="pt-1 flex items-center space-x-1.5 text-[10px] text-emerald-700 font-semibold">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Clinically verified for adolescent health dignity</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="w-full mt-2 py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-full shadow-md shadow-purple-300/40 flex items-center justify-center space-x-1.5 active:scale-95 transition"
                                    >
                                        <span>
                                            {currentIndex + 1 < totalCount ? 'Next Question' : 'See My Score'}
                                        </span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    /* 3. STUDY ALL REFERENCE LIST */
                    <div className="space-y-2.5">
                        {myths.map((item, idx) => (
                            <div
                                key={item.id}
                                className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/95 shadow-2xs space-y-2"
                            >
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-100/90 text-rose-700 text-[9.5px] font-bold uppercase inline-flex items-center space-x-1">
                                    <XCircle className="w-3 h-3" />
                                    <span>Myth {idx + 1}</span>
                                </span>
                                <h3 className="font-bold text-xs text-[#2D2638]">
                                    &ldquo;{formatInlineText(item.myth_statement)}&rdquo;
                                </h3>
                                <div className="p-3 rounded-2xl bg-emerald-50/85 border border-emerald-100 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                                        Verified Fact
                                    </span>
                                    <div className="text-xs text-emerald-950 leading-relaxed">
                                        <MarkdownRenderer content={item.fact_explanation} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MobileAppLayout>
    );
}
