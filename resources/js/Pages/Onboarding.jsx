import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Calendar, 
    BookOpen, 
    Sparkles, 
    MapPin, 
    Users, 
    ChevronRight, 
    Shield, 
    HeartHandshake,
    ArrowRight
} from 'lucide-react';

export default function Onboarding() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Dignity in Every Cycle",
            subtitle: "Track – Learn – Ask – Access – Connect – Get Support",
            description: "Mwezi is your private, stigma-free menstrual health companion designed for every Zambian girl and young woman.",
            icon: HeartHandshake,
            badge: "Welcome to Mwezi",
            bgColor: "bg-mwezi-primary/40",
            iconColor: "text-mwezi-tertiary",
        },
        {
            title: "Private Cycle Tracking",
            subtitle: "Predict arrivals & understand your body",
            description: "Track symptoms, flow, and moods with field-level encryption. Keep your records completely private or share support tips with trusted family.",
            icon: Calendar,
            badge: "Track with Confidence",
            bgColor: "bg-mwezi-secondary/50",
            iconColor: "text-mwezi-tertiary",
        },
        {
            title: "Learn & Bust Myths",
            subtitle: "Verified health guidance in your language",
            description: "Explore illustrated guides on reusable pad care, washing and dignified sun drying, backed by certified healthcare professionals.",
            icon: BookOpen,
            badge: "Learn with Dignity",
            bgColor: "bg-mwezi-primary/40",
            iconColor: "text-mwezi-tertiary",
        },
        {
            title: "Ask Luna AI Safely",
            subtitle: "Instant compassionate answers 24/7",
            description: "Got private questions about pain or changes? Luna provides verified advice and immediately connects you to real clinics if you feel unwell.",
            icon: Sparkles,
            badge: "Safe Health Companion",
            bgColor: "bg-mwezi-secondary/50",
            iconColor: "text-mwezi-accent",
        },
        {
            title: "Emergency Supplies & Hubs",
            subtitle: "Free pads when you need them most",
            description: "Locate verified school and community hubs like Play It Forward for free emergency kits and subsidized reusable pads.",
            icon: MapPin,
            badge: "Community Access",
            bgColor: "bg-mwezi-primary/40",
            iconColor: "text-mwezi-tertiary",
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
        <div className="w-full max-w-[440px] mx-auto min-h-screen bg-[#F0F9FA] flex flex-col justify-between shadow-2xl relative font-sans overflow-hidden">
            <Head title="Welcome to Mwezi - Dignity in Every Cycle" />

            {/* Top Bar with Discreet Shield & Skip */}
            <div className="p-6 flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-[14px] bg-mwezi-accent flex items-center justify-center shadow-md">
                        <span className="font-heading font-extrabold text-xl text-mwezi-brandText">M</span>
                    </div>
                    <span className="font-heading font-bold text-2xl text-mwezi-tertiary tracking-wide">Mwezi</span>
                </div>

                <Link
                    href="/login"
                    className="text-xs font-semibold text-mwezi-tertiary hover:underline px-3 py-1.5 rounded-full bg-white/60 shadow-sm"
                >
                    Sign In
                </Link>
            </div>

            {/* Slide Content */}
            <div className="px-6 flex-1 flex flex-col justify-center items-center text-center z-10">
                {/* Central Graphic Container */}
                <div className={`w-36 h-36 rounded-[28px] ${slide.bgColor} flex items-center justify-center mb-6 shadow-inner transition-all duration-300 relative`}>
                    <IconComponent className={`w-16 h-16 ${slide.iconColor}`} />
                    <div className="absolute -bottom-2 -right-2 bg-white px-2.5 py-0.5 rounded-full text-[10px] font-bold text-mwezi-tertiary shadow-sm border border-mwezi-primary">
                        {slide.badge}
                    </div>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-mwezi-tertiary/80 mb-2">
                    {slide.subtitle}
                </span>

                <h1 className="font-heading font-extrabold text-[28px] leading-tight text-mwezi-tertiary mb-3">
                    {slide.title}
                </h1>

                <p className="text-xs text-gray-600 leading-relaxed max-w-[320px] mb-6">
                    {slide.description}
                </p>

                {/* Dots indicator */}
                <div className="flex items-center space-x-2 mb-4">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-2 transition-all duration-200 rounded-full ${
                                currentSlide === idx ? 'w-6 bg-mwezi-accent' : 'w-2 bg-mwezi-primary'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 space-y-3 z-10 bg-white/70 backdrop-blur-md rounded-t-[24px] border-t border-mwezi-primary/40">
                {currentSlide < slides.length - 1 ? (
                    <button
                        onClick={nextSlide}
                        className="w-full py-3.5 bg-mwezi-accent hover:bg-mwezi-accent/95 active:scale-[0.99] text-white font-bold rounded-[20px] text-sm flex items-center justify-center space-x-2 shadow-lg transition"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <Link
                        href="/register"
                        className="w-full py-3.5 bg-mwezi-accent hover:bg-mwezi-accent/95 active:scale-[0.99] text-white font-bold rounded-[20px] text-sm flex items-center justify-center space-x-2 shadow-lg transition"
                    >
                        <span>Get Started Free</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                )}

                <div className="flex items-center justify-between pt-1">
                    <Link
                        href="/sponsor"
                        className="text-xs font-semibold text-mwezi-tertiary hover:underline"
                    >
                        Sponsor a Girl / Donate
                    </Link>

                    <Link
                        href="/login"
                        className="text-xs font-bold text-mwezi-accent hover:underline"
                    >
                        Already have an account?
                    </Link>
                </div>
            </div>
        </div>
    );
}

