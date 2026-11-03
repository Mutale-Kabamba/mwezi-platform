import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/i18n/LanguageContext';
import { 
    Calendar, 
    BookOpen, 
    Sparkles, 
    MapPin, 
    ChevronRight, 
    ChevronLeft, 
    HeartHandshake, 
    ArrowRight, 
    Lock, 
    Wifi, 
    BatteryMedium,
    Plus,
    ShieldCheck,
    Globe,
    CheckCircle2
} from 'lucide-react';

export default function Onboarding() {
    const { locale, setLocale, t, languages } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentTime, setCurrentTime] = useState('09:41');
    const [isPaused, setIsPaused] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}`);
        };
        updateClock();
        const timer = setInterval(updateClock, 30000);
        return () => clearInterval(timer);
    }, []);

    // 5 Mwezi Core Pillars with the previous verified icons
    const slides = [
        {
            category: "Welcome to Mwezi",
            title: "Dignity in Every Cycle",
            desc: "Your confidential companion for every Zambian girl and young woman to track, learn, and access menstrual dignity without stigma.",
            tag: "Dignity",
            icon: HeartHandshake,
            accentBg: "bg-rose-50",
            accentText: "text-rose-600",
            iconBg: "bg-rose-500",
            previewLabel: "Care & Dignity",
        },
        {
            category: "Encrypted Health",
            title: "Private Cycle Tracking",
            desc: "Predict your rhythm safely with discreet PIN protection. Log daily symptoms, flow, and moods with field-level encryption.",
            tag: "Encrypted",
            icon: Calendar,
            accentBg: "bg-pink-50",
            accentText: "text-pink-600",
            iconBg: "bg-pink-500",
            previewLabel: "Day 14 • Flow",
        },
        {
            category: "Medically Verified",
            title: "Learn & Bust Myths",
            desc: "Explore verified, illustrated guides on reusable pad care, washing, and dignified sun drying in your language.",
            tag: "Verified",
            icon: BookOpen,
            accentBg: "bg-purple-50",
            accentText: "text-purple-600",
            iconBg: "bg-purple-500",
            previewLabel: "Care Guides",
        },
        {
            category: "Luna AI Assistant",
            title: "Ask Luna AI Safely 24/7",
            desc: "Got private questions about cramps, flow, or hygiene? Luna provides medically verified answers and connects you to nearby clinics.",
            tag: "24/7 AI",
            icon: Sparkles,
            accentBg: "bg-amber-50",
            accentText: "text-amber-600",
            iconBg: "bg-rose-600",
            previewLabel: "Safe Companion",
        },
        {
            category: "Community Access",
            title: "Emergency Supplies & Hubs",
            desc: "Locate verified school and community hubs like Play It Forward for free emergency kits and subsidized reusable pads in your area.",
            tag: "Free Hubs",
            icon: MapPin,
            accentBg: "bg-emerald-50",
            accentText: "text-emerald-700",
            iconBg: "bg-emerald-500",
            previewLabel: "Find Pads",
        },
    ];

    // Smooth auto-slide transition (pauses on user interaction)
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5500);
        return () => clearInterval(interval);
    }, [isPaused, slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const slide = slides[currentSlide];
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    const nextIndex = (currentSlide + 1) % slides.length;
    const PrevIcon = slides[prevIndex].icon;
    const ActiveIcon = slide.icon;
    const NextIcon = slides[nextIndex].icon;

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#FBECEF] via-[#F4F1F4] to-[#EBF3F5] flex items-center justify-center p-0 sm:py-6 sm:px-4 font-sans selection:bg-rose-100 selection:text-rose-900">
            <Head title="Welcome to Mwezi - Stigma-Free Health & Dignity" />

            {/* NATIVE APP FRAME */}
            <div 
                className="w-full max-w-[420px] h-screen sm:h-[840px] sm:max-h-[92vh] bg-white sm:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(112,38,56,0.22)] sm:border-[8px] sm:border-slate-900/90 sm:ring-1 sm:ring-black/10 relative flex flex-col justify-between overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                {/* 1. TOP SOLID COLOR LOGO & NOTIFICATION BAR SECTION (Seamless Flush Edges, No Corner Cutouts) */}
                <div className="bg-[#BE123C] text-white shrink-0 relative pt-3 pb-6 select-none flex flex-col justify-between shadow-md shadow-rose-950/10 z-20 border-b border-rose-800/40">
                    
                    {/* Integrated Phone Notification Bar (Seamless Solid Background) */}
                    <div className="w-full px-6 pb-2 flex items-center justify-between text-xs font-semibold">
                        <span className="font-bold tracking-tight text-[11px] text-white">{currentTime}</span>
                        
                        {/* Native Pill Dynamic Island */}
                        <div className="w-20 h-4 bg-slate-950/75 rounded-full flex items-center justify-center shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
                            <div className="w-2.5 h-1 rounded-full bg-slate-800" />
                        </div>

                        <div className="flex items-center space-x-1.5 text-white/95">
                            <Wifi className="w-3.5 h-3.5" />
                            <BatteryMedium className="w-4 h-4 text-emerald-300" />
                        </div>
                    </div>

                    {/* Top Right Quick Skip/Login Pill & Language Selector */}
                    <div className="px-5 pt-1 flex justify-between items-center relative">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-200/80">
                            {t('onboarding_zambia', 'Zambia • 24/7')}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                            {/* Language Switcher */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowLangMenu(prev => !prev)}
                                    className="px-2 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold border border-white/25 backdrop-blur-sm transition flex items-center space-x-1"
                                >
                                    <Globe className="w-3 h-3" />
                                    <span className="uppercase">{locale}</span>
                                </button>

                                {showLangMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40 bg-transparent"
                                            onClick={() => setShowLangMenu(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-rose-100 py-1.5 z-50 text-slate-800 animate-fadeIn">
                                            <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider border-b border-slate-100">
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
                                                            ? 'bg-rose-50 text-rose-700 font-bold'
                                                            : 'text-slate-700 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <span>{lang.flag}</span>
                                                        <span>{lang.localName}</span>
                                                    </div>
                                                    {locale === lang.code && (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <Link 
                                href="/login" 
                                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold border border-white/20 backdrop-blur-sm transition active:scale-95"
                            >
                                {t('onboarding_signin_pill', 'Sign in')}
                            </Link>
                        </div>
                    </div>

                    {/* Centered Brand Title with Spacious Room */}
                    <div className="text-center pt-4 pb-2">
                        <div className="inline-flex items-center space-x-2.5">
                            <span className="text-2xl drop-shadow-sm">🌙</span>
                            <span className="font-black text-3xl tracking-tight text-white font-sans drop-shadow-xs">
                                {t('app_title', 'Mwezi')}
                            </span>
                        </div>
                        <p className="text-[11px] text-rose-100 font-medium tracking-wide mt-0.5">
                            {t('app_subtitle', 'Menstrual Health & Dignity')}
                        </p>
                    </div>

                    {/* Pagination Indicator (Elongated Pill + Dots matching Reference Screenshot) */}
                    <div className="flex items-center justify-center space-x-1.5 mt-2">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`transition-all duration-300 rounded-full ${
                                    currentSlide === idx 
                                        ? 'w-7 h-1.5 bg-white shadow-xs' 
                                        : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                                }`}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* 2. WHITE CONTENT SECTION (Corner spaces filled in white, no red spikes) */}
                <div className="bg-white pt-5 px-6 pb-4 flex-1 min-h-0 flex flex-col justify-between overflow-y-auto hide-scrollbar relative z-10">
                    <div className="space-y-3.5 text-center">
                        
                        {/* Dynamic Floating Cards Illustration with Moving Icons to Match Content */}
                        <div className="w-full max-w-[290px] h-36 mx-auto relative flex items-center justify-center select-none">
                            {/* Soft glowing ambient backdrop */}
                            <div className="absolute inset-0 bg-rose-100/60 rounded-full blur-2xl transform scale-90" />

                            {/* Left Card (Tilted & Floating, Showing Previous Pillar Icon) */}
                            <button
                                onClick={prevSlide}
                                aria-label="Previous Feature"
                                className="absolute left-4 w-18 h-26 sm:w-20 sm:h-28 bg-white border border-rose-150/80 rounded-2xl shadow-md flex flex-col justify-between p-2.5 transform animate-card-left transition-all duration-500 hover:scale-105 active:scale-95"
                            >
                                <div className="flex justify-between items-center text-[10px] text-rose-500 font-bold">
                                    <span className="truncate max-w-[50px]">{slides[prevIndex].tag}</span>
                                    <div className="w-4 h-4 rounded-full bg-rose-50 flex items-center justify-center">
                                        <PrevIcon className="w-2.5 h-2.5 text-rose-600" />
                                    </div>
                                </div>
                                <div className="space-y-1 my-auto">
                                    <div className="w-full h-1 bg-rose-100 rounded-full" />
                                    <div className="w-3/4 h-1 bg-rose-100 rounded-full" />
                                    <div className="w-1/2 h-1 bg-rose-100 rounded-full" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 truncate block text-left">
                                    {slides[prevIndex].previewLabel}
                                </span>
                            </button>

                            {/* Right Card (Tilted & Floating, Showing Next Pillar Icon) */}
                            <button
                                onClick={nextSlide}
                                aria-label="Next Feature"
                                className="absolute right-4 w-18 h-26 sm:w-20 sm:h-28 bg-white border border-rose-150/80 rounded-2xl shadow-md flex flex-col justify-between p-2.5 transform animate-card-right transition-all duration-500 hover:scale-105 active:scale-95"
                            >
                                <div className="flex justify-between items-center text-[10px] text-pink-500 font-bold">
                                    <span className="truncate max-w-[50px]">{slides[nextIndex].tag}</span>
                                    <div className="w-4 h-4 rounded-full bg-pink-50 flex items-center justify-center">
                                        <NextIcon className="w-2.5 h-2.5 text-pink-600" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-1 py-1 my-auto">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="w-2.5 h-2 bg-pink-100 rounded-xs" />
                                    ))}
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 truncate block text-left">
                                    {slides[nextIndex].previewLabel}
                                </span>
                            </button>

                            {/* Center Upright Card (Animated, Dynamically Matches Current Active Slide's Icon) */}
                            <div 
                                key={currentSlide}
                                className="relative z-10 w-24 h-32 bg-white border-2 border-rose-200/90 rounded-2xl shadow-xl flex flex-col justify-between p-3 transform animate-card-center transition-all duration-500 ease-out"
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`text-[10px] font-black ${slide.accentText}`}>
                                        {slide.tag}
                                    </span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                </div>
                                
                                <div className="py-1 text-center my-auto">
                                    {/* Active Moving Icon */}
                                    <div className={`w-10 h-10 rounded-2xl ${slide.accentBg} ${slide.accentText} flex items-center justify-center mx-auto mb-1.5 shadow-xs border border-rose-100 transform transition-transform duration-500 hover:scale-110`}>
                                        <ActiveIcon className="w-5 h-5 transition-transform duration-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-800 block truncate">
                                        {slide.previewLabel}
                                    </span>
                                </div>

                                <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500" 
                                        style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Glowing Central Floating Gradient Button with '+' (Matches Reference) */}
                            <button
                                onClick={nextSlide}
                                aria-label="Next slide"
                                className="absolute -bottom-2 z-20 w-10 h-10 rounded-full bg-gradient-to-tr from-[#E11D48] via-rose-500 to-[#FB7185] text-white flex items-center justify-center shadow-lg shadow-rose-500/40 border-2 border-white transform animate-badge-plus transition hover:scale-110 active:scale-90"
                            >
                                <Plus className="w-4 h-4 font-bold" />
                            </button>
                        </div>

                        {/* Category Label */}
                        <div className="pt-1">
                            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                                {t(`slide${currentSlide}_tag`, slide.category)}
                            </span>
                        </div>

                        {/* Bold Headline (Updates seamlessly with Moving Content) */}
                        <h1 
                            key={`title-${currentSlide}`}
                            className="text-lg sm:text-xl font-black text-slate-900 leading-snug max-w-[300px] mx-auto tracking-tight transition-all duration-300"
                        >
                            {t(`slide${currentSlide}_title`, slide.title)}
                        </h1>

                        {/* Supportive Description */}
                        <p 
                            key={`desc-${currentSlide}`}
                            className="text-xs text-slate-500 leading-relaxed max-w-[300px] mx-auto font-medium transition-all duration-300"
                        >
                            {t(`slide${currentSlide}_desc`, slide.desc)}
                        </p>
                    </div>

                    {/* Bottom Action Area (Direct Get Started Navigation + Slide Controls) */}
                    <div className="space-y-2.5 pt-3">
                        {/* Direct Get Started CTA Button */}
                        <Link
                            href="/register"
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E11D48] via-rose-500 to-[#FB7185] hover:opacity-95 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-500/25 transition flex items-center justify-center space-x-2 text-center"
                        >
                            <span>{t('onboarding_get_started', 'Get Started Free')}</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>

                        {/* Slide Navigation Controls */}
                        <div className="flex items-center justify-between text-xs px-1 pt-0.5">
                            <button
                                onClick={prevSlide}
                                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center space-x-1 py-1"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>{t('onboarding_prev', 'Prev')}</span>
                            </button>

                            {/* Center Slide Indicator */}
                            <div className="flex items-center space-x-1">
                                {slides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`transition-all duration-200 rounded-full ${
                                            currentSlide === idx ? 'w-4 h-1.5 bg-rose-500' : 'w-1.5 h-1.5 bg-slate-200'
                                        }`}
                                        aria-label={`Slide ${idx + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextSlide}
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1 py-1"
                            >
                                <span>{t('onboarding_next', 'Next')}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Secondary Links: Sponsor & Already have an account */}
                        <div className="flex items-center justify-between text-xs px-2 pt-0.5">
                            <Link
                                href="/sponsor"
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline"
                            >
                                {t('onboarding_sponsor_pack', 'Sponsor a Girl')}
                            </Link>

                            <Link
                                href="/login"
                                className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                            >
                                {t('onboarding_have_account', 'Already have an account?')} <span className="text-rose-600 underline">{t('onboarding_sign_in', 'Sign in')}</span>
                            </Link>
                        </div>

                        {/* Native Home Indicator */}
                        <div className="pt-1.5 text-center shrink-0">
                            <div className="w-32 h-1 bg-slate-300 rounded-full opacity-60 mx-auto" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
