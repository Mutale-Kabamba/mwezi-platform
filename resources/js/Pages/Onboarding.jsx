import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/i18n/LanguageContext';
import { LunaFloralBackdrop } from '@/Components/LunaSideDrawer';
import {
    Calendar,
    BookOpen,
    Sparkles,
    MapPin,
    ChevronRight,
    ChevronLeft,
    HeartHandshake,
    ArrowRight,
    Globe,
    CheckCircle2,
    Moon,
    Heart,
} from 'lucide-react';

export default function Onboarding() {
    const { locale, setLocale, t, languages } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);

    // 5 Mwezi Core Pillars
    const slides = [
        {
            category: 'Welcome to Mwezi',
            title: 'Dignity in Every Cycle',
            desc: 'Your confidential companion for every Zambian girl and young woman to track, learn, and access menstrual dignity without stigma.',
            tag: 'Dignity',
            icon: HeartHandshake,
            previewLabel: 'Care & Dignity',
            tint: 'from-rose-100/80 to-purple-100/60',
            iconColor: 'text-rose-500',
        },
        {
            category: 'Encrypted Health',
            title: 'Private Cycle Tracking',
            desc: 'Predict your rhythm safely with discreet PIN protection. Log daily symptoms, flow, and moods with field-level encryption.',
            tag: 'Encrypted',
            icon: Calendar,
            previewLabel: 'Day 14 • Flow',
            tint: 'from-pink-100/80 to-rose-100/60',
            iconColor: 'text-pink-500',
        },
        {
            category: 'Medically Verified',
            title: 'Learn & Bust Myths',
            desc: 'Explore verified, illustrated guides on reusable pad care, washing, and dignified sun drying in your language.',
            tag: 'Verified',
            icon: BookOpen,
            previewLabel: 'Care Guides',
            tint: 'from-purple-100/80 to-indigo-100/60',
            iconColor: 'text-purple-500',
        },
        {
            category: 'Luna AI Assistant',
            title: 'Ask Luna AI Safely 24/7',
            desc: 'Got private questions about cramps, flow, or hygiene? Luna provides medically verified answers and connects you to nearby clinics.',
            tag: '24/7 AI',
            icon: Sparkles,
            previewLabel: 'Safe Companion',
            tint: 'from-amber-100/75 to-rose-100/60',
            iconColor: 'text-rose-500',
        },
        {
            category: 'Community Access',
            title: 'Emergency Supplies & Hubs',
            desc: 'Locate verified school and community hubs like Play It Forward for free emergency kits and subsidized reusable pads in your area.',
            tag: 'Free Hubs',
            icon: MapPin,
            previewLabel: 'Find Pads',
            tint: 'from-emerald-100/75 to-teal-100/60',
            iconColor: 'text-emerald-600',
        },
    ];

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [currentSlide, isPaused, slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const slide = slides[currentSlide];
    const ActiveIcon = slide.icon;

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
                className="relative z-10 w-full max-w-[400px] min-h-[680px] sm:min-h-[740px] rounded-[36px] bg-white/45 backdrop-blur-2xl border border-white/80 shadow-[0_24px_60px_-15px_rgba(92,71,112,0.16)] px-7 py-7 flex flex-col justify-between overflow-hidden"
            >
                <LunaFloralBackdrop />
                {/* Top Utility Bar: Region + Language */}
                <div className="flex items-center justify-between text-[11px] text-[#5E546B]">
                    <span className="font-semibold tracking-wider uppercase text-[10px] text-[#6E637C]/85">
                        {t('onboarding_zambia', 'Zambia • 24/7')}
                    </span>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowLangMenu((prev) => !prev)}
                            className="inline-flex items-center space-x-1.5 rounded-full bg-white/55 hover:bg-white/80 border border-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#3C334B] transition"
                        >
                            <Globe className="w-3 h-3 text-[#6E637C]" />
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
                                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Centered Minimal Brand Header */}
                <div className="text-center pt-3">
                    <div className="inline-flex items-center space-x-2 text-[#2D2638]">
                        <div className="w-7 h-7 rounded-full bg-white/75 border border-white flex items-center justify-center shadow-xs">
                            <Moon className="w-4 h-4 text-[#3D334D]" strokeWidth={2.2} />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            {t('app_title', 'Mwezi')}
                        </span>
                    </div>
                    <p className="text-[11px] font-medium text-[#6E637C] mt-1">
                        {t('app_subtitle', 'Menstrual Health & Dignity')}
                    </p>
                </div>

                {/* Center Circular Illustration / Pillar Stage */}
                <div className="my-auto py-4 flex flex-col items-center text-center">
                    <div className="relative flex items-center justify-center w-full">
                        <button
                            type="button"
                            onClick={prevSlide}
                            aria-label="Previous Feature"
                            className="p-2 rounded-full text-[#7C718B] hover:text-[#2D2638] hover:bg-white/50 transition"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div
                            key={currentSlide}
                            className="mx-3 w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-b from-white/90 via-white/65 to-white/30 border border-white/90 shadow-[0_14px_40px_rgba(255,255,255,0.65)] flex flex-col items-center justify-center transition-all duration-500 animate-fadeIn"
                        >
                            <div
                                className={`w-20 h-20 rounded-full bg-gradient-to-br ${slide.tint} border border-white flex items-center justify-center shadow-inner`}
                            >
                                <ActiveIcon className={`w-9 h-9 ${slide.iconColor}`} strokeWidth={1.75} />
                            </div>
                            <span className="mt-3 text-[11px] font-semibold text-[#5E546B] bg-white/70 border border-white px-3 py-0.5 rounded-full">
                                {slide.previewLabel}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={nextSlide}
                            aria-label="Next Feature"
                            className="p-2 rounded-full text-[#7C718B] hover:text-[#2D2638] hover:bg-white/50 transition"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Minimal Pagination Dots */}
                    <div className="flex items-center justify-center space-x-1.5 mt-5">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentSlide(idx)}
                                aria-label={`Slide ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    currentSlide === idx
                                        ? 'w-5 bg-[#3D334D]/75'
                                        : 'w-1.5 bg-[#3D334D]/20 hover:bg-[#3D334D]/40'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Active Pillar Copy */}
                    <div key={`copy-${currentSlide}`} className="mt-5 px-2 space-y-2 animate-fadeIn">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A6F8A]">
                            {t(`slide${currentSlide}_tag`, slide.category)}
                        </p>
                        <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight text-[#2D2638] leading-tight">
                            {t(`slide${currentSlide}_title`, slide.title)}
                        </h1>
                        <p className="text-[13px] leading-relaxed text-[#5E546B] max-w-[295px] mx-auto font-normal">
                            {t(`slide${currentSlide}_desc`, slide.desc)}
                        </p>
                    </div>
                </div>

                {/* Bottom Minimal CTA & Links */}
                <div className="space-y-4 pt-2">
                    <Link
                        href="/register"
                        className="w-full rounded-full bg-white/75 hover:bg-white border border-white/95 shadow-[0_10px_28px_-8px_rgba(92,71,112,0.18)] px-6 py-3.5 flex items-center justify-between text-[#2D2638] font-semibold text-sm transition active:scale-[0.99]"
                    >
                        <span>{t('onboarding_get_started', 'Get Started Free')}</span>
                        <ArrowRight className="w-4 h-4 text-[#2D2638]" />
                    </Link>

                    <div className="text-center space-y-2">
                        <p className="text-xs text-[#5E546B]">
                            {t('onboarding_have_account', 'Already have an account?')}{' '}
                            <Link
                                href="/login"
                                className="font-bold text-[#2D2638] hover:underline"
                            >
                                {t('onboarding_sign_in', 'Sign in')}
                            </Link>
                        </p>

                        <Link
                            href="/sponsor"
                            className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-[#6E637C] hover:text-[#2D2638] transition"
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
