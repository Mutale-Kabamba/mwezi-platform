import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
    Plus,
    ShieldCheck,
    Clock,
    BookOpen,
    Zap,
    Activity,
    Moon,
    Sun,
    Leaf
} from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

export default function Dashboard({ 
    cycleInfo, 
    cycleProfile,
    todayLog,
    featuredArticle, 
    recentRequests = [], 
    nearbyHubsCount = 0, 
    dailyTip = '' 
}) {
    const { t } = useTranslation();
    const todayStr = new Date().toISOString().split('T')[0];

    const [activeFlow, setActiveFlow] = useState(todayLog?.flow_intensity || (cycleInfo?.today_flow || 'none'));
    const [activeSymptoms, setActiveSymptoms] = useState(todayLog?.symptoms || []);
    const [quickLogStatus, setQuickLogStatus] = useState('');
    const [isSubmittingQuickLog, setIsSubmittingQuickLog] = useState(false);

    const handleQuickLog = (newFlow, newSymptoms) => {
        setIsSubmittingQuickLog(true);
        router.post(route('cycle.log.store'), {
            logged_date: todayStr,
            flow_intensity: newFlow,
            symptoms: newSymptoms,
            moods: todayLog?.moods || [],
            pad_changes_count: todayLog?.pad_changes_count || 0,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setActiveFlow(newFlow);
                setActiveSymptoms(newSymptoms);
                setQuickLogStatus(t('logged_successfully', 'Saved!'));
                setTimeout(() => setQuickLogStatus(''), 2500);
            },
            onFinish: () => {
                setIsSubmittingQuickLog(false);
            }
        });
    };

    const handleFlowSelect = (flow) => {
        handleQuickLog(flow, activeSymptoms);
    };

    const handleToggleSymptom = (sym) => {
        const nextSymptoms = activeSymptoms.includes(sym)
            ? activeSymptoms.filter(s => s !== sym)
            : [...activeSymptoms, sym];
        handleQuickLog(activeFlow, nextSymptoms);
    };
    // Dynamic phase badge styles
    const getPhaseBadge = (phase) => {
        const p = (phase || '').toLowerCase();
        if (p.includes('menstrual')) {
            return { label: 'Menstrual Phase', bg: 'bg-rose-100 text-rose-700 border-rose-200', icon: Droplet };
        } else if (p.includes('follicular')) {
            return { label: 'Follicular Phase', bg: 'bg-pink-100 text-pink-700 border-pink-200', icon: Sparkles };
        } else if (p.includes('ovulat')) {
            return { label: 'Ovulatory Phase', bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: Sun };
        } else {
            return { label: phase || 'Luteal Phase', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: Leaf };
        }
    };

    const phaseBadge = getPhaseBadge(cycleInfo?.phase);

    return (
        <MobileAppLayout title={t('app_title', 'Mwezi')} subtitle={t('app_subtitle', 'Menstrual Health & Dignity')}>
            <Head title="Home Dashboard - Mwezi" />

            <div className="space-y-4">
                
                {/* 1. DAILY DIGNITY AFFIRMATION */}
                <div className="bg-gradient-to-r from-rose-50/90 via-white to-pink-50/70 rounded-3xl p-4 shadow-xs border border-rose-150/80 flex items-center space-x-3 transition">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shrink-0 shadow-sm shadow-rose-200/50">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                                {t('daily_affirmation_title', 'Daily Affirmation')}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-rose-400" />
                            <span className="text-[10px] text-slate-400 font-medium">{t('self_care', 'Self-Care')}</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium italic mt-0.5 leading-snug">
                            "{dailyTip || t('daily_tip_default', 'Your cycle is your body’s natural power and wisdom. Treat yourself with gentleness today.')}"
                        </p>
                    </div>
                </div>

                {/* 2. CYCLE COUNTDOWN HERO CONTAINER */}
                <div className="bg-gradient-to-br from-rose-500 via-rose-500 to-pink-500 rounded-3xl p-5 shadow-lg shadow-rose-200/60 text-white relative overflow-hidden flex flex-col justify-between">
                    {/* Subtle ambient blur ornaments */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/30 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10">
                        {/* Phase & Next Period Header */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold text-white tracking-wide border border-white/20">
                                {React.createElement(phaseBadge.icon, { className: 'w-3.5 h-3.5 shrink-0' })}
                                <span>{phaseBadge.label}</span>
                            </span>

                            <span className="text-[11px] font-semibold text-rose-100 flex items-center space-x-1 bg-black/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                                <Calendar className="w-3 h-3 text-white" />
                                <span>{cycleInfo.next_period_date || t('upcoming', 'Upcoming')}</span>
                            </span>
                        </div>

                        {/* Large Days Countdown */}
                        <div className="my-2 flex items-baseline space-x-2.5">
                            <span className="font-extrabold text-5xl tracking-tight leading-none text-white drop-shadow-sm">
                                {cycleInfo.days_until_next}
                            </span>
                            <div>
                                <span className="text-xs font-bold text-white block">
                                    {cycleInfo.days_until_next === 1 ? t('day_until_period', 'day until next period') : t('dash_days_left', 'days until next period')}
                                </span>
                                <span className="text-[10px] text-rose-100 font-medium">
                                    {t('rhythm_prediction', 'Rhythm prediction: High confidence')}
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-rose-50/95 font-medium leading-relaxed mb-4">
                            {cycleInfo.phase_description}
                        </p>
                    </div>

                    {/* Action Buttons inside Hero Container */}
                    <div className="relative z-10 flex items-center space-x-2 pt-2 border-t border-white/20">
                        <Link
                            href="/cycle"
                            className="flex-1 py-2.5 px-4 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-2xl text-center shadow-md shadow-black/10 active:scale-95 transition flex items-center justify-center space-x-1.5"
                        >
                            <Plus className="w-3.5 h-3.5 text-rose-600" />
                            <span>{cycleInfo.has_logged_today ? t('update_today_symptoms', 'Update Today’s Symptoms') : t('dash_log_symptoms', 'Log Today’s Symptoms')}</span>
                        </Link>

                        <Link
                            href="/cycle"
                            className="py-2.5 px-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-1 border border-white/20"
                            title="Open Calendar"
                        >
                            <Calendar className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* TEEN MENARCHE CALIBRATION BANNER */}
                {cycleInfo?.is_first_year_menarche && (
                    <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-3.5 flex items-start space-x-3 shadow-2xs">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                    Teen Calibration Active
                                </span>
                                <span className="text-[9px] bg-amber-200/70 text-amber-900 font-semibold px-2 py-0.2 rounded-full">
                                    21–45 Days Normal
                                </span>
                            </div>
                            <p className="text-[11px] text-amber-900 font-medium leading-relaxed mt-0.5">
                                Your cycle rhythm is naturally calibrating. Irregular intervals during your first two years post-menarche are completely healthy and protected from false alarms.
                            </p>
                        </div>
                    </div>
                )}

                {/* 1-TAP QUICK LOG STRIP (Flow & Symptoms) */}
                <div className="bg-white rounded-3xl p-4 shadow-xs border border-rose-150/80 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Droplet className="w-3.5 h-3.5" />
                            </div>
                            <h2 className="text-xs font-bold text-slate-900">
                                1-Tap Today's Check-in
                            </h2>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            {quickLogStatus && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-fadeIn">
                                    ✓ {quickLogStatus}
                                </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium">
                                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                    </div>

                    {/* Flow Intensity Pills */}
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                            Flow Intensity
                        </span>
                        <div className="grid grid-cols-5 gap-1.5">
                            {[
                                { id: 'none', label: 'None', dot: 'bg-slate-300' },
                                { id: 'spotting', label: 'Spot', dot: 'bg-rose-300' },
                                { id: 'light', label: 'Light', dot: 'bg-rose-400' },
                                { id: 'medium', label: 'Medium', dot: 'bg-rose-500' },
                                { id: 'heavy', label: 'Heavy', dot: 'bg-rose-700' },
                            ].map((flow) => {
                                const isSelected = activeFlow === flow.id;
                                return (
                                    <button
                                        key={flow.id}
                                        type="button"
                                        disabled={isSubmittingQuickLog}
                                        onClick={() => handleFlowSelect(flow.id)}
                                        className={`py-2 px-1 rounded-2xl text-[11px] font-bold transition flex flex-col items-center justify-center space-y-1 active:scale-95 border ${
                                            isSelected
                                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                                : 'bg-slate-50 hover:bg-rose-50/50 text-slate-700 border-slate-200/80'
                                        }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : flow.dot}`} />
                                        <span>{flow.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Symptom Chips */}
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                            Quick Symptoms & Feelings
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { id: 'Cramps', label: 'Cramps', icon: Zap },
                                { id: 'Headache', label: 'Headache', icon: Activity },
                                { id: 'Backache', label: 'Backache', icon: ShieldCheck },
                                { id: 'Fatigue', label: 'Tired', icon: Moon },
                                { id: 'Happy', label: 'Energetic', icon: Sparkles },
                            ].map((sym) => {
                                const SymIcon = sym.icon;
                                const isSelected = activeSymptoms.includes(sym.id);
                                return (
                                    <button
                                        key={sym.id}
                                        type="button"
                                        disabled={isSubmittingQuickLog}
                                        onClick={() => handleToggleSymptom(sym.id)}
                                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition active:scale-95 border flex items-center space-x-1.5 ${
                                            isSelected
                                                ? 'bg-rose-50 border-rose-400 text-rose-700 font-bold'
                                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <SymIcon className={`w-3 h-3 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                                        <span>{sym.label}</span>
                                        {isSelected && <span className="text-rose-600 ml-0.5">✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 3. ESSENTIAL SUPPORT & TOOLS (2x2 Native Grid) */}
                <div>
                    <div className="flex items-center justify-between mb-2.5 px-1">
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Support & Tools
                        </h2>
                        <span className="text-[10px] text-slate-400 font-medium">Quick Access</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        {/* 1. Request Emergency Supplies */}
                        <Link
                            href="/support/request"
                            className="p-3.5 bg-white rounded-3xl shadow-xs hover:shadow-md transition active:scale-[0.98] border border-rose-150/70 flex flex-col justify-between group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                                    <Heart className="w-4 h-4 text-rose-600" />
                                </div>
                                <span className="bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                                    Free
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-xs text-slate-800 leading-tight group-hover:text-rose-600 transition">
                                    Emergency Supplies
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">School & hub pickup</p>
                            </div>
                        </Link>

                        {/* 2. Find Nearby Hubs */}
                        <Link
                            href="/support/map"
                            className="p-3.5 bg-white rounded-3xl shadow-xs hover:shadow-md transition active:scale-[0.98] border border-rose-150/70 flex flex-col justify-between group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-xs">
                                    <MapPin className="w-4 h-4 text-teal-600" />
                                </div>
                                <span className="bg-teal-100 text-teal-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                    {nearbyHubsCount} Hubs
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-xs text-slate-800 leading-tight group-hover:text-teal-600 transition">
                                    Nearby Hubs Map
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Live stock in Zambia</p>
                            </div>
                        </Link>

                        {/* 3. Ask Luna AI Assistant */}
                        <Link
                            href="/luna"
                            className="p-3.5 bg-white rounded-3xl shadow-xs hover:shadow-md transition active:scale-[0.98] border border-rose-150/70 flex flex-col justify-between group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                                    AI 24/7
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-xs text-slate-800 leading-tight group-hover:text-purple-600 transition">
                                    Ask Luna AI
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Safe medical answers</p>
                            </div>
                        </Link>

                        {/* 4. Pad Washing Guide */}
                        <Link
                            href="/learn/article/washing-drying-reusable-pads-in-dignity"
                            className="p-3.5 bg-white rounded-3xl shadow-xs hover:shadow-md transition active:scale-[0.98] border border-rose-150/70 flex flex-col justify-between group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
                                    <Package className="w-4 h-4 text-amber-600" />
                                </div>
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                                    Guide
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-xs text-slate-800 leading-tight group-hover:text-amber-600 transition">
                                    Reusable Pad Care
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Hygienic sun drying</p>
                            </div>
                        </Link>
                    </div>

                    {/* 5. Sponsor a Girl Banner (Full width Card) */}
                    <Link
                        href="/support/sponsor"
                        className="mt-2.5 p-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl shadow-sm hover:shadow-md transition flex items-center justify-between text-white group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/20">
                                <Heart className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs text-white">
                                    Sponsor a Girl in School
                                </h3>
                                <p className="text-[10px] text-rose-100">Provide 1 year of reusable pads & dignity packs</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </Link>
                </div>

                {/* 4. FEATURED HEALTH ARTICLE */}
                {featuredArticle && (
                    <div className="bg-white rounded-3xl p-4 shadow-xs border border-rose-100/80">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                                Verified Health Guide
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{featuredArticle.read_time_minutes} min read</span>
                            </span>
                        </div>

                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-1 leading-snug">
                            {featuredArticle.title}
                        </h3>

                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-3">
                            {featuredArticle.summary}
                        </p>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                            <span className="text-[10px] font-medium text-emerald-700 flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>Verified by Health Partners</span>
                            </span>

                            <Link
                                href={`/learn/article/${featuredArticle.slug}`}
                                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-0.5"
                            >
                                <span>Read</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* 5. RECENT EMERGENCY REQUEST OR COMMUNITY CARD */}
                {recentRequests.length > 0 ? (
                    <div className="bg-white rounded-3xl p-4 shadow-xs border border-rose-100/80">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-800">Active Supply Request</span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                                {recentRequests[0].request_code}
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-900 capitalize">
                                    {recentRequests[0].request_type?.replace('_', ' ')}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                    Pickup: {recentRequests[0].hub?.organization_name || 'Community Hub'}
                                </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                recentRequests[0].status === 'ready_for_pickup' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-rose-100 text-rose-800'
                            }`}>
                                {recentRequests[0].status?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-4 shadow-xs border border-rose-100/80">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                                Trusted Family Circle
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Encrypted</span>
                            </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mb-1">
                            Share Cycle Alerts Discreetly
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                            Send gentle reminders to a trusted parent or sister without revealing sensitive journal entries.
                        </p>
                        <Link 
                            href="/trusted-circle" 
                            className="text-xs font-bold text-rose-600 hover:underline flex items-center space-x-1"
                        >
                            <span>Manage Trusted Circle</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </div>
        </MobileAppLayout>
    );
}
