import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Calendar, 
    BookOpen, 
    Sparkles, 
    MapPin, 
    Users, 
    ChevronRight, 
    ChevronLeft,
    ShieldCheck, 
    HeartHandshake,
    ArrowRight,
    Lock,
    PhoneCall,
    Wifi,
    BatteryMedium
} from 'lucide-react';

export default function Onboarding() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentTime, setCurrentTime] = useState('09:41');

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

    const slides = [
        {
            title: "Dignity in Every Cycle",
            subtitle: "Private • Stigma-Free • Supportive",
            description: "Mwezi is your confidential menstrual health companion, tailored for every Zambian girl and young woman to track, learn, and thrive with dignity.",
            icon: HeartHandshake,
            badge: "Welcome to Mwezi",
            gradient: "from-rose-500 to-pink-400",
            accentText: "text-rose-600",
        },
        {
            title: "Private Cycle Tracking",
            subtitle: "Encrypted & 100% Confidential",
            description: "Predict your cycle rhythm, log daily symptoms, flow, and moods with field-level encryption. Keep records completely private.",
            icon: Calendar,
            badge: "Encrypted Health",
            gradient: "from-pink-500 to-rose-400",
            accentText: "text-pink-600",
        },
        {
            title: "Learn & Bust Myths",
            subtitle: "Verified Guidance in Your Language",
            description: "Explore illustrated guides on reusable pad care, washing, and dignified sun drying, backed by certified healthcare professionals.",
            icon: BookOpen,
            badge: "Medically Verified",
            gradient: "from-purple-500 to-rose-400",
            accentText: "text-purple-600",
        },
        {
            title: "Ask Luna AI Safely",
            subtitle: "Compassionate Answers 24/7",
            description: "Got private questions about pain, flow, or body changes? Luna provides medically verified answers and connects you to nearby clinics.",
            icon: Sparkles,
            badge: "Luna AI Assistant",
            gradient: "from-rose-500 to-purple-400",
            accentText: "text-rose-600",
        },
        {
            title: "Emergency Supplies & Hubs",
            subtitle: "Free Pads When You Need Them Most",
            description: "Locate verified school and community hubs like Play It Forward for free emergency kits and subsidized reusable pads in your area.",
            icon: MapPin,
            badge: "Community Access",
            gradient: "from-emerald-500 to-teal-400",
            accentText: "text-emerald-600",
        },
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const slide = slides[currentSlide];
    const IconComponent = slide.icon;

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#FBECEF] via-[#F4F1F4] to-[#EBF3F5] flex items-center justify-center p-0 sm:py-6 sm:px-4 font-sans selection:bg-rose-100 selection:text-rose-900">
            <Head title="Welcome to Mwezi - Dignity in Every Cycle" />

            {/* NATIVE APP FRAME */}
            <div className="w-full max-w-[440px] min-h-screen sm:min-h-[850px] sm:max-h-[92vh] bg-white sm:rounded-[48px] shadow-[0_20px_60px_-15px_rgba(112,38,56,0.18)] sm:border-[8px] sm:border-slate-900/90 sm:ring-1 sm:ring-black/10 relative flex flex-col justify-between overflow-hidden">
                
                {/* 1. NATIVE STATUS BAR */}
                <div className="w-full bg-white/90 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-slate-800 text-xs font-semibold z-50 select-none border-b border-rose-100/40">
                    <span className="font-bold tracking-tight text-[11px]">{currentTime}</span>
                    
                    {/* Dynamic Island / Camera Notch */}
                    <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
                        <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                        <div className="w-2.5 h-1 rounded-full bg-slate-700" />
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-700">
                        <Wifi className="w-3.5 h-3.5" />
                        <BatteryMedium className="w-4 h-4 text-emerald-600" />
                    </div>
                </div>

                {/* 2. NATIVE TOP APP BAR */}
                <div className="p-4 flex items-center justify-between z-10 border-b border-rose-100/60 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-xs">
                            <span className="text-xs font-bold">🌙</span>
                        </div>
                        <span className="font-extrabold text-lg text-slate-900 tracking-tight">Mwezi</span>
                    </div>

                    <Link
                        href="/login"
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200/50 shadow-xs transition"
                    >
                        Sign In
                    </Link>
                </div>

                {/* 3. NATIVE ONBOARDING SLIDE CONTENT */}
                <div className="px-6 py-6 flex-1 flex flex-col justify-center items-center text-center z-10 overflow-y-auto hide-scrollbar">
                    {/* Animated Slide Graphic Container */}
                    <div className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${slide.gradient} flex items-center justify-center mb-6 shadow-xl shadow-rose-200/60 relative transition-transform duration-300 hover:scale-105`}>
                        <IconComponent className="w-14 h-14 text-white" />
                        <div className="absolute -bottom-2.5 bg-white px-3 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-sm border border-slate-100">
                            {slide.badge}
                        </div>
                    </div>

                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 mb-2">
                        {slide.subtitle}
                    </span>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3 tracking-tight">
                        {slide.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-[320px] mb-6">
                        {slide.description}
                    </p>

                    {/* Native Pagination Dots Indicator */}
                    <div className="flex items-center space-x-2 mb-4">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-2 transition-all duration-200 rounded-full ${
                                    currentSlide === idx ? 'w-8 bg-rose-600' : 'w-2 bg-rose-200 hover:bg-rose-300'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* Safeguarding Trust Badges */}
                    <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-medium pt-2">
                        <span className="flex items-center space-x-1">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            <span>100% Private</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                            <PhoneCall className="w-3 h-3 text-rose-500" />
                            <span>Helpline 116</span>
                        </span>
                    </div>
                </div>

                {/* 4. NATIVE BOTTOM ACTION BAR */}
                <div className="p-5 space-y-2.5 z-10 bg-white border-t border-rose-100/80">
                    {currentSlide < slides.length - 1 ? (
                        <div className="flex items-center space-x-2">
                            {currentSlide > 0 && (
                                <button
                                    onClick={prevSlide}
                                    className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={nextSlide}
                                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-rose-200/60 transition"
                            >
                                <span>Continue</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/register"
                            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 active:scale-95 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-rose-200/60 transition"
                        >
                            <span>Get Started Free</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs">
                        <Link
                            href="/sponsor"
                            className="text-xs font-semibold text-rose-700 hover:underline"
                        >
                            Sponsor a Girl
                        </Link>

                        <Link
                            href="/login"
                            className="text-xs font-bold text-slate-700 hover:text-rose-600 hover:underline"
                        >
                            Already have an account?
                        </Link>
                    </div>
                </div>

                {/* 5. NATIVE HOME INDICATOR */}
                <div className="absolute bottom-1 inset-x-0 h-1 flex justify-center pointer-events-none z-50">
                    <div className="w-32 h-1 bg-slate-300 rounded-full opacity-60" />
                </div>
            </div>
        </div>
    );
}
