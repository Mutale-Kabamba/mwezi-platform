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
    Wifi, 
    BatteryMedium,
    Plus,
    Smile,
    Heart
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
            category: "Mwezi Dignity Hub",
            title: "Stigma-free menstrual health for every girl",
            desc: "Confidential cycle tracking, certified health guidance, and emergency hygiene kits for schools across Zambia.",
            badge: "Dignity",
            icon: Heart,
        },
        {
            category: "Private Tracking",
            title: "Encrypted cycle calendar & symptom logs",
            desc: "Predict your rhythm safely with discreet PIN protection. Know your flow dates without fear or embarrassment.",
            badge: "Encrypted",
            icon: Calendar,
        },
        {
            category: "Illustrated Guidance",
            title: "Learn, wash, and dry reusable pads with dignity",
            desc: "Culturally rooted healthcare guides in local languages. Medically reviewed and safe for continuous school attendance.",
            badge: "Verified",
            icon: BookOpen,
        },
        {
            category: "Luna AI Assistant",
            title: "24/7 private answers for your cycle & body",
            desc: "Ask confidential questions about cramps, flow, or hygiene with zero judgment and immediate clinic escalation if needed.",
            badge: "AI Guide",
            icon: Sparkles,
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

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#FBECEF] via-[#F4F1F4] to-[#EBF3F5] flex items-center justify-center p-0 sm:py-6 sm:px-4 font-sans selection:bg-rose-100 selection:text-rose-900">
            <Head title="Welcome to Mwezi - Stigma-Free Health & Dignity" />

            {/* NATIVE APP FRAME (Matches Center Onboarding Screen in Reference) */}
            <div className="w-full max-w-[420px] h-screen sm:h-[840px] sm:max-h-[92vh] bg-white sm:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(112,38,56,0.22)] sm:border-[8px] sm:border-slate-900/90 sm:ring-1 sm:ring-black/10 relative flex flex-col justify-between overflow-hidden">
                
                {/* 1. NATIVE STATUS BAR (iOS Style) */}
                <div className="w-full bg-gradient-to-r from-[#881337] via-[#BE123C] to-[#E11D48] text-white px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold select-none shrink-0 z-20">
                    <span className="font-bold tracking-tight text-[11px]">{currentTime}</span>
                    
                    {/* Native Pill Dynamic Island */}
                    <div className="w-20 h-4 bg-slate-950/80 rounded-full flex items-center justify-center shadow-inner">
                        <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
                        <div className="w-2.5 h-1 rounded-full bg-slate-800" />
                    </div>

                    <div className="flex items-center space-x-1.5 text-white/90">
                        <Wifi className="w-3.5 h-3.5" />
                        <BatteryMedium className="w-4 h-4 text-emerald-300" />
                    </div>
                </div>

                {/* 2. TOP COLORED HERO HEADER (Brand + Pill Slide Indicators) */}
                <div className="bg-gradient-to-b from-[#881337] via-[#BE123C] to-[#E11D48] text-white px-5 pt-3 pb-10 shrink-0 text-center relative">
                    <div className="inline-flex items-center space-x-2">
                        <span className="text-lg">🌙</span>
                        <span className="font-black text-2xl tracking-tight text-white font-sans">
                            Mwezi
                        </span>
                    </div>

                    {/* Pagination Indicator (Elongated Pill + Dots matching Reference Screenshot) */}
                    <div className="flex items-center justify-center space-x-1.5 mt-2.5">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`transition-all duration-300 rounded-full ${
                                    currentSlide === idx 
                                        ? 'w-7 h-1.5 bg-white' 
                                        : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                                }`}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* 3. FLOATING WHITE SHEET WITH GRAPHIC & HEADLINE (Matches Reference) */}
                <div className="bg-white rounded-t-[38px] -mt-6 pt-6 px-6 pb-4 flex-1 flex flex-col justify-between overflow-y-auto hide-scrollbar relative z-10 shadow-2xl">
                    <div className="space-y-4 text-center">
                        {/* Playful Floating Cards Graphic (Matches Reference Illustration with Glowing Floating Button) */}
                        <div className="w-full max-w-[280px] h-40 mx-auto relative flex items-center justify-center">
                            {/* Soft glowing backdrop */}
                            <div className="absolute inset-0 bg-rose-100/50 rounded-full blur-2xl transform scale-90" />

                            {/* Card 1 (Left Tilted) */}
                            <div className="absolute left-6 w-20 h-28 bg-white border border-rose-150/80 rounded-2xl shadow-md -rotate-8 flex flex-col justify-between p-2.5 transform hover:-rotate-4 transition duration-300">
                                <div className="flex justify-between items-center text-[10px] text-rose-500 font-bold">
                                    <span>Care</span>
                                    <Smile className="w-3.5 h-3.5 text-rose-500" />
                                </div>
                                <div className="space-y-1">
                                    <div className="w-full h-1 bg-rose-100 rounded-full" />
                                    <div className="w-3/4 h-1 bg-rose-100 rounded-full" />
                                    <div className="w-1/2 h-1 bg-rose-100 rounded-full" />
                                </div>
                                <span className="text-[9px] font-bold text-rose-700">Pads Kit</span>
                            </div>

                            {/* Card 3 (Right Tilted) */}
                            <div className="absolute right-6 w-20 h-28 bg-white border border-rose-150/80 rounded-2xl shadow-md rotate-8 flex flex-col justify-between p-2.5 transform hover:rotate-4 transition duration-300">
                                <div className="flex justify-between items-center text-[10px] text-pink-500 font-bold">
                                    <span>Learn</span>
                                    <BookOpen className="w-3.5 h-3.5 text-pink-500" />
                                </div>
                                <div className="grid grid-cols-3 gap-1 py-1">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="w-3 h-2.5 bg-pink-100 rounded-xs" />
                                    ))}
                                </div>
                                <span className="text-[9px] font-bold text-pink-700">Verified</span>
                            </div>

                            {/* Card 2 (Center Upright) */}
                            <div className="relative z-10 w-24 h-32 bg-white border border-rose-200/90 rounded-2xl shadow-lg flex flex-col justify-between p-3 transform transition hover:scale-105">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-extrabold text-rose-600">Cycle</span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                                <div className="py-2 text-center">
                                    <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1">
                                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-700">Day 14</span>
                                </div>
                                <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden">
                                    <div className="w-2/3 h-full bg-rose-500 rounded-full" />
                                </div>
                            </div>

                            {/* Glowing Central Floating Gradient Button (Matches '+' button in reference) */}
                            <div className="absolute -bottom-2 z-20 w-11 h-11 rounded-full bg-gradient-to-tr from-[#E11D48] via-rose-500 to-[#FB7185] text-white flex items-center justify-center shadow-lg shadow-rose-500/40 border-2 border-white transform transition hover:scale-110 active:scale-95">
                                <Plus className="w-5 h-5 font-bold" />
                            </div>
                        </div>

                        {/* Category Label */}
                        <div className="pt-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {slide.category}
                            </span>
                        </div>

                        {/* Bold Punchy Headline (Matches Reference Typography) */}
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight max-w-[300px] mx-auto tracking-tight">
                            {slide.title}
                        </h1>

                        {/* Supportive Description */}
                        <p className="text-xs text-slate-500 leading-relaxed max-w-[310px] mx-auto font-medium">
                            {slide.desc}
                        </p>
                    </div>

                    {/* Bottom Action Area (Matches Reference Button Style) */}
                    <div className="space-y-3 pt-4">
                        {currentSlide < slides.length - 1 ? (
                            <button
                                onClick={nextSlide}
                                className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100/80 active:scale-98 text-rose-700 font-extrabold text-xs sm:text-sm border border-rose-200/70 shadow-xs transition flex items-center justify-center space-x-2"
                            >
                                <span>Get Started</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <Link
                                href="/register"
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E11D48] via-rose-500 to-[#FB7185] hover:opacity-95 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-500/25 transition flex items-center justify-center space-x-2 text-center"
                            >
                                <span>Get Started Free</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}

                        <div className="flex items-center justify-between text-xs px-2 pt-1">
                            <Link
                                href="/sponsor"
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-700"
                            >
                                Sponsor a Girl
                            </Link>

                            <Link
                                href="/login"
                                className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                            >
                                Already have an account? <span className="text-rose-600 underline">Sign in</span>
                            </Link>
                        </div>

                        {/* Native Home Indicator */}
                        <div className="pt-2 text-center shrink-0">
                            <div className="w-32 h-1 bg-slate-300 rounded-full opacity-60 mx-auto" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
