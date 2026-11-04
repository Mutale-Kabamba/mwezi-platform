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
    CheckCircle2,
    Moon,
    Heart
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

    // Smooth continuous auto-scroll carousel (advances every 4 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [currentSlide, slides.length]);

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
            >
                {/* 1. TOP SOLID COLOR LOGO & NOTIFICATION BAR SECTION (Sleek rounded bottom corners, no murky drop-shadow) */}
                <div className="bg-[#BE123C] text-white shrink-0 relative pt-3 pb-8 px-5 select-none flex flex-col justify-between rounded-b-[32px] z-20">
                    
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
                            <Moon className="w-6 h-6 text-rose-200 fill-rose-200/30" />
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
                        
                        {/* Dynamic Full Icons Stage (Clean, shadow-free, prominent icons) */}
                        <div className="w-full max-w-[290px] h-32 mx-auto relative flex items-center justify-center select-none py-2">
                            {/* Left Previous Pillar Icon */}
                            <button
                                type="button"
                                onClick={prevSlide}
                                aria-label="Previous Feature"
                                className="absolute left-3 w-13 h-13 rounded-2xl bg-white border border-rose-200/80 flex flex-col items-center justify-center p-2 transition-all duration-300 hover:scale-105 active:scale-95 group hover:border-rose-400 hover:bg-rose-50/50"
                            >
                                <PrevIcon className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                                <span className="text-[8px] font-bold text-slate-400 group-hover:text-rose-600 truncate max-w-[44px] mt-0.5">
                                    {slides[prevIndex].tag}
                                </span>
                            </button>

                            {/* Center Active Hero Icon */}
                            <div 
                                key={currentSlide}
                                className="relative z-10 flex flex-col items-center justify-center transition-all duration-500 animate-fadeIn"
                            >
                                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#BE123C] via-rose-500 to-pink-500 text-white border-2 border-rose-100 flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
                                    <ActiveIcon className="w-8 h-8 sm:w-9 sm:h-9 text-white stroke-[2.2]" />
                                </div>
                                <span className={`text-[10px] font-extrabold mt-1.5 px-2.5 py-0.5 rounded-full ${slide.accentBg} ${slide.accentText} border border-rose-100/80`}>
                                    {slide.previewLabel}
                                </span>
                            </div>

                            {/* Right Next Pillar Icon */}
                            <button
                                type="button"
                                onClick={nextSlide}
                                aria-label="Next Feature"
                                className="absolute right-3 w-13 h-13 rounded-2xl bg-white border border-rose-200/80 flex flex-col items-center justify-center p-2 transition-all duration-300 hover:scale-105 active:scale-95 group hover:border-pink-400 hover:bg-pink-50/50"
                            >
                                <NextIcon className="w-5 h-5 text-slate-400 group-hover:text-pink-500 transition-colors" />
                                <span className="text-[8px] font-bold text-slate-400 group-hover:text-pink-600 truncate max-w-[44px] mt-0.5">
                                    {slides[nextIndex].tag}
                                </span>
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
                        <div className="flex flex-col items-center justify-center gap-1.5 pt-1 text-center">
                            <Link
                                href="/sponsor"
                                className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline"
                            >
                                <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600/20" />
                                <span>{t('onboarding_sponsor_pack', "Sponsor a Girl's Dignity Pack")}</span>
                            </Link>

                            <p className="text-[11px] font-medium text-slate-500">
                                {t('onboarding_have_account', 'Already have an account?')}{' '}
                                <Link
                                    href="/login"
                                    className="font-bold text-rose-600 hover:text-rose-700 underline"
                                >
                                    {t('onboarding_sign_in', 'Sign in')}
                                </Link>
                            </p>
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
