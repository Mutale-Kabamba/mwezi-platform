import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from '@/i18n/LanguageContext';
import { LunaFloralBackdrop, MweziMoonIcon } from '@/Components/LunaSideDrawer';
import {
    ChevronRight,
    ChevronLeft,
    ArrowRight,
    Globe,
    CheckCircle2,
    Heart,
} from 'lucide-react';

function SlideIllustration({ type }) {
    if (type === 'dignity') {
        return (
            <svg viewBox="0 0 140 140" fill="none" className="w-36 h-36" aria-hidden="true">
                <circle cx="70" cy="70" r="54" fill="#F5EDFF" />
                {/* Soft Lotus Petals */}
                <path
                    d="M70 42C60 56 60 76 70 92C80 76 80 56 70 42Z"
                    fill="#FBCFE8"
                    stroke="#2D2638"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M70 92C52 84 42 70 44 54C56 58 65 72 70 92Z"
                    fill="#DDD6FE"
                    stroke="#2D2638"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M70 92C88 84 98 70 96 54C84 58 75 72 70 92Z"
                    fill="#DDD6FE"
                    stroke="#2D2638"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Crescent Moon above */}
                <path
                    d="M96 34A11 11 0 0 1 83 22A11 11 0 1 0 96 34Z"
                    fill="#C4B5FD"
                    stroke="#2D2638"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <circle cx="44" cy="40" r="3" fill="#F472B6" />
                <circle cx="100" cy="88" r="2.5" fill="#8B5CF6" />
                <path d="M52 100H88" stroke="#2D2638" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
        );
    }

    if (type === 'track') {
        return (
            <svg viewBox="0 0 140 140" fill="none" className="w-36 h-36" aria-hidden="true">
                <circle cx="70" cy="70" r="54" fill="#FCE7F3" />
                {/* Minimal Cycle Ring */}
                <circle cx="70" cy="70" r="34" stroke="#E9D5FF" strokeWidth="8" />
                <path
                    d="M70 36A34 34 0 0 1 104 70"
                    stroke="#7C3AED"
                    strokeWidth="8"
                    strokeLinecap="round"
                />
                <path
                    d="M70 36A34 34 0 0 0 42 51"
                    stroke="#F472B6"
                    strokeWidth="8"
                    strokeLinecap="round"
                />
                <circle cx="70" cy="70" r="22" fill="#FFFFFF" stroke="#2D2638" strokeWidth="2.2" />
                {/* Privacy Lock inside Ring */}
                <rect x="62" y="69" width="16" height="12" rx="3.5" fill="#DDD6FE" stroke="#2D2638" strokeWidth="2" />
                <path d="M65.5 69V65.5A4.5 4.5 0 0 1 74.5 65.5V69" stroke="#2D2638" strokeWidth="2" strokeLinecap="round" />
                <circle cx="104" cy="70" r="5" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2.5" />
            </svg>
        );
    }

    if (type === 'learn') {
        return (
            <svg viewBox="0 0 140 140" fill="none" className="w-36 h-36" aria-hidden="true">
                <circle cx="70" cy="70" r="54" fill="#EDE9FE" />
                {/* Open Minimal Book */}
                <path
                    d="M36 52C36 49 38 47 41 47H58C64 47 68 50 70 55C72 50 76 47 82 47H99C102 47 104 49 104 52V92C104 94 102 96 99 96H80C75 96 71 98 70 101C69 98 65 96 60 96H41C38 96 36 94 36 92V52Z"
                    fill="#FFFFFF"
                    stroke="#2D2638"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                />
                <path d="M70 55V100" stroke="#2D2638" strokeWidth="2" strokeLinecap="round" />
                {/* Subtle Text Lines */}
                <path d="M46 62H61M46 71H59M46 80H56" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M79 62H94M79 71H92" stroke="#F472B6" strokeWidth="2.2" strokeLinecap="round" />
                {/* Verified Badge */}
                <circle cx="94" cy="44" r="11" fill="#A7F3D0" stroke="#2D2638" strokeWidth="2" />
                <path d="M89.5 44L92.5 47L98.5 41" stroke="#2D2638" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    if (type === 'luna') {
        return (
            <svg viewBox="0 0 140 140" fill="none" className="w-36 h-36" aria-hidden="true">
                <circle cx="70" cy="70" r="54" fill="#F3E8FF" />
                {/* Soft Chat Bubble */}
                <rect x="34" y="42" width="72" height="52" rx="22" fill="#FFFFFF" stroke="#2D2638" strokeWidth="2.2" />
                <path d="M52 94L42 104V92" fill="#FFFFFF" stroke="#2D2638" strokeWidth="2.2" strokeLinejoin="round" />
                {/* Crescent Moon inside Bubble */}
                <path
                    d="M78 75A13 13 0 0 1 63 60A13 13 0 1 0 78 75Z"
                    fill="#C084FC"
                    stroke="#2D2638"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                {/* Floating Sparkles */}
                <path d="M96 34L98 39L103 41L98 43L96 48L94 43L89 41L94 39L96 34Z" fill="#F472B6" />
                <circle cx="79" cy="60" r="2.8" fill="#EC4899" />
            </svg>
        );
    }

    // hubs / supplies
    return (
        <svg viewBox="0 0 140 140" fill="none" className="w-36 h-36" aria-hidden="true">
            <circle cx="70" cy="70" r="54" fill="#ECFDF5" />
            {/* Map Pin */}
            <path
                d="M70 104C70 104 96 82 96 62A26 26 0 1 0 44 62C44 82 70 104 70 104Z"
                fill="#FFFFFF"
                stroke="#2D2638"
                strokeWidth="2.2"
                strokeLinejoin="round"
            />
            {/* Heart inside Pin */}
            <path
                d="M70 74C70 74 58 66.5 58 58.5C58 54.8 60.8 52 64.2 52C66.5 52 68.6 53.3 70 55.2C71.4 53.3 73.5 52 75.8 52C79.2 52 82 54.8 82 58.5C82 66.5 70 74 70 74Z"
                fill="#FBCFE8"
                stroke="#2D2638"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <ellipse cx="70" cy="108" rx="18" ry="3.5" fill="#A7F3D0" />
        </svg>
    );
}

export default function Onboarding() {
    const { locale, setLocale, t, languages } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);

    const slides = [
        {
            category: 'Welcome to Mwezi',
            title: 'Dignity in Every Cycle',
            type: 'dignity',
        },
        {
            category: 'Encrypted Health',
            title: 'Private Cycle Tracking',
            type: 'track',
        },
        {
            category: 'Medically Verified',
            title: 'Learn & Bust Myths',
            type: 'learn',
        },
        {
            category: 'Luna AI Assistant',
            title: 'Ask Luna AI Safely 24/7',
            type: 'luna',
        },
        {
            category: 'Community Access',
            title: 'Emergency Supplies & Hubs',
            type: 'hubs',
        },
    ];

    const isLastSlide = currentSlide === slides.length - 1;

    const nextSlide = useCallback(() => {
        if (currentSlide === slides.length - 1) {
            router.visit('/register');
            return;
        }
        setCurrentSlide((prev) => prev + 1);
    }, [currentSlide, slides.length]);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev > 0 ? prev - 1 : 0));
    }, []);

    // Auto-advance until the last slide
    useEffect(() => {
        if (isPaused || isLastSlide) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
        }, 4500);
        return () => clearInterval(interval);
    }, [currentSlide, isPaused, isLastSlide, slides.length]);

    // Keyboard arrow key slider support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextSlide, prevSlide]);

    const slide = slides[currentSlide];

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#F8EAE6] flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-purple-200/60 selection:text-[#2D2638]">
            <Head title="Welcome to Mwezi - Stigma-Free Health & Dignity" />

            {/* Ambient Soft Pastel Mesh Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-28 -left-24 h-[420px] w-[420px] rounded-full bg-[#FADCD3] opacity-90 blur-3xl" />
                <div className="absolute top-1/4 -right-28 h-[460px] w-[460px] rounded-full bg-[#D8C2FA] opacity-75 blur-3xl" />
                <div className="absolute -bottom-32 left-1/4 h-[440px] w-[440px] rounded-full bg-[#F3D2E5] opacity-85 blur-3xl" />
                <div className="absolute bottom-10 right-10 h-[300px] w-[300px] rounded-full bg-[#E5D4FC] opacity-70 blur-3xl" />
            </div>

            {/* Minimal Frosted Glass Card */}
            <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="relative z-10 w-full max-w-[400px] min-h-[680px] sm:min-h-[740px] rounded-[36px] bg-white/50 backdrop-blur-2xl border border-white/80 shadow-[0_24px_60px_-15px_rgba(92,71,112,0.16)] px-7 py-7 flex flex-col justify-between overflow-hidden"
            >
                <LunaFloralBackdrop />

                {/* Top Bar: Logo (Top Left) + Language (Top Right) */}
                <div className="relative z-20 flex items-center justify-between">
                    <div className="inline-flex items-center space-x-2 text-[#2D2638]">
                        <div className="w-8 h-8 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-2xs">
                            <MweziMoonIcon className="w-5 h-5" />
                        </div>
                        <span className="text-base font-bold tracking-tight">
                            {t('app_title', 'Mwezi')}
                        </span>
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowLangMenu((prev) => !prev)}
                            className="inline-flex items-center space-x-1.5 rounded-full bg-white/65 hover:bg-white/90 border border-white px-3 py-1.5 text-[11px] font-semibold text-[#3C334B] transition"
                        >
                            <Globe className="w-3.5 h-3.5 text-[#6E637C]" />
                            <span className="uppercase">{locale}</span>
                        </button>

                        {showLangMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40 bg-transparent"
                                    onClick={() => setShowLangMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl border border-white py-1.5 z-50 text-[#2D2638]">
                                    <div className="px-3 py-1 text-[10px] font-bold uppercase text-[#8A7F99] tracking-wider border-b border-slate-100">
                                        {t('select_language', 'Select Language')}
                                    </div>
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            type="button"
                                            onClick={() => {
                                                setLocale(lang.code);
                                                setShowLangMenu(false);
                                            }}
                                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition ${
                                                locale === lang.code
                                                    ? 'bg-purple-50 text-[#2D2638] font-bold'
                                                    : 'text-[#5E546B] hover:bg-slate-50/80'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>{lang.flag}</span>
                                                <span>{lang.localName}</span>
                                            </div>
                                            {locale === lang.code && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Center Illustration & Heading Stage */}
                <div className="relative z-10 my-auto py-6 flex flex-col items-center text-center">
                    <div className="relative flex items-center justify-center w-full">
                        <button
                            type="button"
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            aria-label="Previous Feature"
                            className="p-2.5 rounded-full text-[#7C718B] hover:text-[#2D2638] hover:bg-white/60 disabled:opacity-25 transition"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div
                            key={currentSlide}
                            className="mx-2 w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-white/95 via-white/75 to-white/40 border border-white shadow-[0_16px_42px_rgba(124,58,237,0.12)] flex items-center justify-center transition-all duration-500 animate-fadeIn"
                        >
                            <SlideIllustration type={slide.type} />
                        </div>

                        <button
                            type="button"
                            onClick={nextSlide}
                            aria-label={isLastSlide ? 'Continue to Get Started' : 'Next Feature'}
                            className="p-2.5 rounded-full text-[#7C718B] hover:text-[#2D2638] hover:bg-white/60 transition"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Minimal Pagination Dots */}
                    <div className="flex items-center justify-center space-x-1.5 mt-6">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentSlide(idx)}
                                aria-label={`Slide ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    currentSlide === idx
                                        ? 'w-6 bg-[#7C3AED]'
                                        : 'w-1.5 bg-[#3D334D]/20 hover:bg-[#3D334D]/40'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Heading Only (No Paragraph) */}
                    <div key={`copy-${currentSlide}`} className="mt-6 px-3 space-y-2 animate-fadeIn">
                        <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#7A6F8A]">
                            {t(`slide${currentSlide}_tag`, slide.category)}
                        </p>
                        <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight text-[#2D2638] leading-tight">
                            {t(`slide${currentSlide}_title`, slide.title)}
                        </h1>
                    </div>
                </div>

                {/* Bottom Minimal CTA & Sponsor Link (No "Already have an account?") */}
                <div className="relative z-10 space-y-3.5 pt-2">
                    <Link
                        href="/register"
                        className="w-full rounded-full bg-white/85 hover:bg-white border border-white shadow-[0_10px_28px_-8px_rgba(92,71,112,0.18)] px-6 py-3.5 flex items-center justify-between text-[#2D2638] font-semibold text-sm transition active:scale-[0.99]"
                    >
                        <span>{t('onboarding_get_started', 'Get Started Free')}</span>
                        <ArrowRight className="w-4 h-4 text-[#7C3AED]" />
                    </Link>

                    <div className="text-center">
                        <Link
                            href="/sponsor"
                            className="inline-flex items-center space-x-1.5 text-[11.5px] font-semibold text-[#6E637C] hover:text-[#2D2638] transition"
                        >
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400/20" />
                            <span>{t('onboarding_sponsor_pack', "Sponsor a Girl's Dignity Pack")}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
