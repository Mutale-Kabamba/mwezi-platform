import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { 
    Calendar, 
    Sparkles, 
    MapPin, 
    Heart, 
    Package, 
    ChevronRight, 
    Bell, 
    Droplet, 
    Smile, 
    CheckCircle, 
    AlertCircle, 
    Share2, 
    ArrowUpRight,
    Plus
} from 'lucide-react';

export default function Dashboard({ 
    cycleInfo, 
    featuredArticle, 
    recentRequests = [], 
    nearbyHubsCount = 0, 
    dailyTip = '' 
}) {
    const [quickLogSuccess, setQuickLogSuccess] = useState(false);

    return (
        <MobileAppLayout title="Mwezi" subtitle="Track • Learn • Dignity">
            <Head title="Home Dashboard - Mwezi" />

            <div className="space-y-4">
                
                {/* 1. DAILY WELLBEING BANNER */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-mwezi-primary/40 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-mwezi-secondary/60 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-mwezi-tertiary" />
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-mwezi-tertiary/70 block">
                            Daily Dignity Affirmation
                        </span>
                        <p className="text-xs text-gray-700 font-medium italic">
                            "{dailyTip}"
                        </p>
                    </div>
                </div>

                {/* 2. CURRENT CYCLE PHASE & COUNTDOWN HERO CONTAINER (#B8E3E9 Container, rounded-[20px]) */}
                <div className="bg-mwezi-primary rounded-[20px] p-5 shadow-mwezi text-mwezi-dark relative overflow-hidden border border-white/50">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-[11px] font-bold text-mwezi-tertiary tracking-wide uppercase">
                                {cycleInfo.phase}
                            </span>
                            <span className="text-xs font-semibold text-gray-700 flex items-center space-x-1">
                                <Calendar className="w-3.5 h-3.5 text-mwezi-tertiary" />
                                <span>{cycleInfo.next_period_date}</span>
                            </span>
                        </div>

                        <div className="my-3 flex items-baseline space-x-2">
                            <span className="font-heading font-extrabold text-[42px] leading-none text-mwezi-tertiary">
                                {cycleInfo.days_until_next}
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                                {cycleInfo.days_until_next === 1 ? 'day until next period' : 'days until next period'}
                            </span>
                        </div>

                        <p className="text-xs text-gray-700 font-medium mb-4 leading-relaxed">
                            {cycleInfo.phase_description}
                        </p>

                        {/* Action buttons inside Phase Container */}
                        <div className="flex items-center space-x-2 pt-2">
                            <Link
                                href="/cycle"
                                className="flex-1 py-2.5 px-4 bg-mwezi-accent hover:bg-mwezi-accent/95 active:scale-95 text-white font-bold text-xs rounded-[16px] text-center shadow-md transition flex items-center justify-center space-x-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{cycleInfo.has_logged_today ? 'Update Today’s Symptoms' : 'Log Today’s Symptoms'}</span>
                            </Link>
                            <Link
                                href="/cycle"
                                className="py-2.5 px-3 bg-white/80 hover:bg-white text-mwezi-tertiary font-bold text-xs rounded-[16px] transition flex items-center justify-center shadow-sm"
                                title="View Interactive Calendar"
                            >
                                <Calendar className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Subtle decorative background watermarks */}
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/20 blur-xl pointer-events-none" />
                </div>

                {/* 3. #EDC8FF QUICK ACTION CARDS */}
                <div>
                    <div className="flex items-center justify-between mb-2.5 px-1">
                        <h2 className="font-heading font-bold text-sm text-mwezi-tertiary uppercase tracking-wider">
                            Essential Support & Tools
                        </h2>
                        <span className="text-[10px] text-gray-500 font-medium">Quick Access</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        {/* 1. Request Emergency Supplies */}
                        <Link
                            href="/support/request"
                            className="p-3.5 bg-mwezi-secondary rounded-[20px] shadow-sm hover:shadow-md transition active:scale-[0.98] border border-white flex flex-col justify-between group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-mwezi-tertiary shadow-inner">
                                    <Heart className="w-5 h-5 text-mwezi-tertiary" />
                                </div>
                                <span className="bg-mwezi-tertiary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                                    Free
                                </span>
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xs text-mwezi-tertiary leading-tight group-hover:text-mwezi-accent transition">
                                    Request Emergency Supplies
                                </h3>
                                <p className="text-[10px] text-gray-600 mt-0.5">Discreet school & hub pickup</p>
                            </div>
                        </Link>

                        {/* 2. Find Nearby Free Pads */}
                        <Link
                            href="/support/map"
                            className="p-3.5 bg-mwezi-secondary rounded-[20px] shadow-sm hover:shadow-md transition active:scale-[0.98] border border-white flex flex-col justify-between group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-mwezi-accent shadow-inner">
                                    <MapPin className="w-5 h-5 text-mwezi-accent" />
                                </div>
                                <span className="bg-white/80 text-gray-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                    {nearbyHubsCount} Hubs
                                </span>
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xs text-mwezi-tertiary leading-tight group-hover:text-mwezi-accent transition">
                                    Find Nearby Hubs & Pads
                                </h3>
                                <p className="text-[10px] text-gray-600 mt-0.5">Live stock in your area</p>
                            </div>
                        </Link>

                        {/* 3. Ask Luna AI */}
                        <Link
                            href="/luna"
                            className="p-3.5 bg-mwezi-secondary rounded-[20px] shadow-sm hover:shadow-md transition active:scale-[0.98] border border-white flex flex-col justify-between group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-mwezi-accent shadow-inner">
                                    <Sparkles className="w-5 h-5 text-mwezi-accent" />
                                </div>
                                <span className="bg-mwezi-brandText text-mwezi-tertiary text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                    AI 24/7
                                </span>
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xs text-mwezi-tertiary leading-tight group-hover:text-mwezi-accent transition">
                                    Ask Luna AI Assistant
                                </h3>
                                <p className="text-[10px] text-gray-600 mt-0.5">Safe, verified answers</p>
                            </div>
                        </Link>

                        {/* 4. Reusable Pad Care Guide */}
                        <Link
                            href="/learn/article/washing-drying-reusable-pads-in-dignity"
                            className="p-3.5 bg-mwezi-secondary rounded-[20px] shadow-sm hover:shadow-md transition active:scale-[0.98] border border-white flex flex-col justify-between group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-mwezi-tertiary shadow-inner">
                                    <Package className="w-5 h-5 text-mwezi-tertiary" />
                                </div>
                                <span className="bg-white/80 text-mwezi-tertiary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                    Offline
                                </span>
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xs text-mwezi-tertiary leading-tight group-hover:text-mwezi-accent transition">
                                    Reusable Pad Washing Guide
                                </h3>
                                <p className="text-[10px] text-gray-600 mt-0.5">Step-by-step sun drying</p>
                            </div>
                        </Link>
                    </div>

                    {/* 5. Sponsor a Girl Card (Full width CTA) */}
                    <Link
                        href="/support/sponsor"
                        className="mt-2.5 p-3.5 bg-gradient-to-r from-mwezi-secondary to-mwezi-primary rounded-[20px] shadow-sm hover:shadow-md transition flex items-center justify-between border border-white group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-mwezi-accent flex items-center justify-center text-white shrink-0 shadow-sm">
                                <Heart className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xs text-mwezi-tertiary group-hover:text-mwezi-accent transition">
                                    Sponsor a Girl in School
                                </h3>
                                <p className="text-[10px] text-gray-700">Provide 1 year of reusable pads & dignity education</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-mwezi-tertiary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </Link>
                </div>

                {/* 4. FEATURED EDUCATIONAL ARTICLE */}
                {featuredArticle && (
                    <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-mwezi-tertiary bg-mwezi-primary/40 px-2 py-0.5 rounded-full">
                                Verified Learning
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                                {featuredArticle.read_time_minutes} min read
                            </span>
                        </div>

                        <h3 className="font-heading font-bold text-sm text-gray-900 mb-1 leading-snug">
                            {featuredArticle.title}
                        </h3>

                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                            {featuredArticle.summary}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                            <span className="text-[10px] font-medium text-emerald-700 flex items-center space-x-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Reviewed by Dr. Mwamba (Healthcare Partner)</span>
                            </span>

                            <Link
                                href={`/learn/article/${featuredArticle.slug}`}
                                className="text-xs font-bold text-mwezi-accent hover:underline flex items-center space-x-0.5"
                            >
                                <span>Read Guide</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* 5. RECENT EMERGENCY REQUEST STATUS (If user has pending request) */}
                {recentRequests.length > 0 && (
                    <div className="bg-white rounded-[20px] p-4 shadow-sm border border-mwezi-secondary/60">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-mwezi-tertiary">Active Supply Request</span>
                            <span className="text-[10px] font-mono text-gray-500 uppercase">{recentRequests[0].request_code}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-mwezi-light border border-mwezi-primary/40">
                            <div>
                                <p className="text-xs font-bold text-gray-800 capitalize">
                                    {recentRequests[0].request_type?.replace('_', ' ')}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                    Pickup: {recentRequests[0].hub?.organization_name || 'Community Hub'}
                                </p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                recentRequests[0].status === 'ready_for_pickup' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-mwezi-secondary text-mwezi-tertiary'
                            }`}>
                                {recentRequests[0].status?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </MobileAppLayout>
    );
}
