import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import {
    Calendar,
    Sparkles,
    MapPin,
    Heart,
    Package,
    ChevronRight,
    Droplet,
    CheckCircle,
    ArrowUpRight,
    Plus,
    ShieldCheck,
    Clock,
    BookOpen,
    Sun,
    Leaf,
    HeartHandshake,
    Building,
    Stethoscope,
    FileText,
    Settings,
} from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

export default function Dashboard({
    cycleInfo = {},
    cycleProfile,
    todayLog,
    featuredArticle,
    recentRequests = [],
    nearbyHubsCount = 0,
    dailyTip = '',
    pendingCompanionRequests = [],
    companionCareSummaries = [],
    partnerManagement = null,
    reviewerManagement = null,
}) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth?.user;
    const firstName = (user?.name || 'Friend').split(' ')[0];
    const role = user?.role || 'primary_user';
    const isPartner = role === 'community_partner';
    const isReviewer = role === 'health_reviewer';
    const isSponsor = role === 'donor_sponsor';
    const isAdmin = role === 'admin';
    const canUsePersonalTracker = auth?.tierPolicy?.can_use_personal_tracker ?? true;
    const canViewSharedTracker = Boolean(auth?.tierPolicy?.can_view_shared_tracker);
    const isTier1 = Boolean(auth?.tierPolicy?.is_tier_1);
    const canViewSponsor = auth?.tierPolicy?.can_view_sponsor_portal ?? true;
    const sharedTrackerLabel = auth?.tierPolicy?.shared_tracker_label || "Your Child's / Partner's Tracker";
    const todayStr = new Date().toISOString().split('T')[0];

    const [activeFlow, setActiveFlow] = useState(todayLog?.flow_intensity || cycleInfo?.today_flow || 'none');
    const [activeSymptoms, setActiveSymptoms] = useState(todayLog?.symptoms || []);
    const [quickLogStatus, setQuickLogStatus] = useState('');
    const [isSubmittingQuickLog, setIsSubmittingQuickLog] = useState(false);

    const handleQuickLog = (newFlow, newSymptoms) => {
        setIsSubmittingQuickLog(true);
        router.post(
            route('cycle.log.store'),
            {
                logged_date: todayStr,
                flow_intensity: newFlow,
                symptoms: newSymptoms,
                moods: todayLog?.moods || [],
                pad_changes_count: todayLog?.pad_changes_count || 0,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setActiveFlow(newFlow);
                    setActiveSymptoms(newSymptoms);
                    setQuickLogStatus(t('logged_successfully', 'Saved'));
                    setTimeout(() => setQuickLogStatus(''), 2200);
                },
                onFinish: () => setIsSubmittingQuickLog(false),
            }
        );
    };

    const getPhaseBadge = (phase) => {
        const p = (phase || '').toLowerCase();
        if (p.includes('menstrual')) return { label: 'Menstrual', icon: Droplet };
        if (p.includes('follicular')) return { label: 'Follicular', icon: Sparkles };
        if (p.includes('ovulat')) return { label: 'Ovulation', icon: Sun };
        return { label: phase ? phase.replace(/ phase/i, '') : 'Luteal', icon: Leaf };
    };

    const phaseBadge = getPhaseBadge(cycleInfo?.phase);
    const avgCycle = cycleInfo?.average_cycle_length || 28;
    const daysLeft = Number(cycleInfo?.days_until_next ?? 14);
    const progressRatio = Math.max(0.08, Math.min(1, (avgCycle - daysLeft) / avgCycle));
    const ringRadius = 34;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference * (1 - progressRatio);

    const formattedToday = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    const quickActions = isPartner
        ? [
            { label: 'Hub Ops', href: '/portal/partner', icon: Building, tint: 'bg-amber-50 text-amber-600' },
            { label: 'Hub Map', href: '/support/map', icon: MapPin, tint: 'bg-teal-50 text-teal-600' },
            { label: 'Support', href: '/support', icon: Heart, tint: 'bg-rose-50 text-rose-500' },
            { label: 'Profile', href: '/profile', icon: Settings, tint: 'bg-purple-50 text-[#7C3AED]' },
        ]
        : isReviewer
        ? [
            { label: 'Review', href: '/portal/reviewer', icon: Stethoscope, tint: 'bg-teal-50 text-teal-600' },
            { label: 'Learn', href: '/learn', icon: BookOpen, tint: 'bg-purple-50 text-[#7C3AED]' },
            { label: 'Myths', href: '/learn/myths-facts', icon: CheckCircle, tint: 'bg-rose-50 text-rose-500' },
            { label: 'Hubs', href: '/support/map', icon: MapPin, tint: 'bg-amber-50 text-amber-600' },
        ]
        : isSponsor
        ? [
            { label: 'Sponsor', href: '/support/sponsor', icon: Heart, tint: 'bg-rose-50 text-rose-500' },
            { label: 'Hubs', href: '/support/map', icon: MapPin, tint: 'bg-teal-50 text-teal-600' },
            { label: 'Support', href: '/support', icon: HeartHandshake, tint: 'bg-purple-50 text-[#7C3AED]' },
            { label: 'Profile', href: '/profile', icon: Settings, tint: 'bg-slate-100 text-[#5E546B]' },
        ]
        : [
            { label: 'Supplies', href: '/support/request', icon: Heart, tint: 'bg-rose-50 text-rose-500' },
            { label: 'Hubs', href: '/support/map', icon: MapPin, tint: 'bg-teal-50 text-teal-600' },
            { label: 'Luna AI', href: '/luna', icon: Sparkles, tint: 'bg-purple-50 text-[#7C3AED]' },
            { label: 'Pad Care', href: '/learn/article/washing-drying-reusable-pads-in-dignity', icon: Package, tint: 'bg-amber-50 text-amber-600' },
        ];

    return (
        <MobileAppLayout title={t('app_title', 'Mwezi')}>
            <Head title="Home - Mwezi" />

            <div className="space-y-5 pb-4">
                {/* 1. OPEN-AIR GREETING HEADER */}
                <div className="flex items-end justify-between px-1 pt-1">
                    <div>
                        <p className="text-[11px] font-medium text-[#8A7F99]">{formattedToday}</p>
                        <h1 className="text-[22px] font-semibold tracking-tight text-[#2D2638] leading-tight mt-0.5">
                            Hi, {firstName}
                        </h1>
                    </div>
                    {canUsePersonalTracker && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/80 border border-white text-[10.5px] font-medium text-[#6E637C] shadow-2xs">
                            {React.createElement(phaseBadge.icon, { className: 'w-3 h-3 text-[#7C3AED]' })}
                            <span>{phaseBadge.label}</span>
                        </span>
                    )}
                </div>

                {/* 1.1 INCOMING COMPANION INVITATIONS */}
                {pendingCompanionRequests && pendingCompanionRequests.length > 0 && (
                    <div className="space-y-2">
                        {pendingCompanionRequests.map((req) => (
                            <div
                                key={req.id}
                                className="bg-white/90 backdrop-blur-xl border border-amber-200/80 rounded-[24px] p-4 shadow-2xs space-y-2.5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-amber-800 flex items-center space-x-1.5">
                                        <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Companion Request</span>
                                    </span>
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 capitalize">
                                        {req.relationship}
                                    </span>
                                </div>
                                <p className="text-xs text-[#5E546B] leading-relaxed">
                                    <strong className="text-[#2D2638]">{req.primary_user?.name || 'A family member'}</strong> invited you to their Trusted Circle.
                                </p>
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => router.post(route('trusted-circle.request.accept', req.id))}
                                        className="flex-1 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs rounded-full transition active:scale-95"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.post(route('trusted-circle.request.decline', req.id))}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#5E546B] font-semibold text-xs rounded-full transition active:scale-95"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. FOCAL CENTERPIECE (Role-Adaptive) */}
                {partnerManagement && (
                    <div className="bg-white/85 backdrop-blur-xl rounded-[26px] p-5 shadow-[0_8px_28px_-12px_rgba(45,38,56,0.10)] border border-white space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[10.5px] font-medium text-[#8A7F99] block">
                                    {partnerManagement.location}
                                </span>
                                <h2 className="font-semibold text-[15px] text-[#2D2638] truncate">
                                    {partnerManagement.hub_name}
                                </h2>
                            </div>
                            <Link
                                href="/portal/partner"
                                className="px-3.5 py-1.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-semibold shrink-0 transition active:scale-95"
                            >
                                Manage
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 divide-x divide-slate-100 text-center pt-1">
                            <div>
                                <span className="text-xl font-bold text-[#7C3AED] block leading-none">
                                    {partnerManagement.pending_requests_count}
                                </span>
                                <span className="text-[10px] text-[#8A7F99] font-medium mt-1 block">Pending</span>
                            </div>
                            <div>
                                <span className="text-xl font-bold text-[#2D2638] block leading-none">
                                    {partnerManagement.free_pads_qty}
                                </span>
                                <span className="text-[10px] text-[#8A7F99] font-medium mt-1 block">Free Pads</span>
                            </div>
                            <div>
                                <span className="text-xl font-bold text-[#2D2638] block leading-none">
                                    {partnerManagement.reusable_pads_stock}
                                </span>
                                <span className="text-[10px] text-[#8A7F99] font-medium mt-1 block">Reusable</span>
                            </div>
                        </div>
                    </div>
                )}

                {reviewerManagement && (
                    <div className="bg-white/85 backdrop-blur-xl rounded-[26px] p-5 shadow-[0_8px_28px_-12px_rgba(45,38,56,0.10)] border border-white space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[10.5px] font-medium text-[#8A7F99] block">
                                    Clinical Governance
                                </span>
                                <h2 className="font-semibold text-[15px] text-[#2D2638] truncate">
                                    Medical Clearance Desk
                                </h2>
                            </div>
                            <Link
                                href="/portal/reviewer"
                                className="px-3.5 py-1.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-semibold shrink-0 transition active:scale-95"
                            >
                                Review
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 divide-x divide-slate-100 text-center pt-1">
                            <div>
                                <span className="text-xl font-bold text-amber-600 block leading-none">
                                    {reviewerManagement.pending_articles_count}
                                </span>
                                <span className="text-[10px] text-[#8A7F99] font-medium mt-1 block">Pending</span>
                            </div>
                            <div>
                                <span className="text-xl font-bold text-[#2D2638] block leading-none">
                                    {reviewerManagement.approved_articles_count}
                                </span>
                                <span className="text-[10px] text-[#8A7F99] font-medium mt-1 block">Published</span>
                            </div>
                            <div>
                                <span className="text-xl font-bold text-[#2D2638] block leading-none">
                                    {reviewerManagement.myths_count}
                                </span>
                                <span className="text-[10px] text-[#8A7F99] font-medium mt-1 block">Facts</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* PERSONAL CYCLE RING & INLINE 1-TAP FLOW CHECK-IN */}
                {canUsePersonalTracker && (
                    <div className="bg-white/85 backdrop-blur-xl rounded-[26px] p-5 shadow-[0_8px_28px_-12px_rgba(45,38,56,0.10)] border border-white space-y-4">
                        <div className="flex items-center space-x-4">
                            {/* Minimal Cycle Ring */}
                            <Link href="/cycle" className="relative w-20 h-20 flex items-center justify-center shrink-0">
                                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r={ringRadius}
                                        fill="none"
                                        stroke="#F3E8FF"
                                        strokeWidth="6"
                                    />
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r={ringRadius}
                                        fill="none"
                                        stroke="#7C3AED"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray={ringCircumference}
                                        strokeDashoffset={ringOffset}
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="text-xl font-bold text-[#2D2638] leading-none block">
                                        {daysLeft}
                                    </span>
                                    <span className="text-[9.5px] font-medium text-[#8A7F99] block mt-0.5">
                                        {daysLeft === 1 ? 'day' : 'days'}
                                    </span>
                                </div>
                            </Link>

                            {/* Right Info & Pill CTA */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <p className="text-[11px] font-medium text-[#8A7F99]">
                                    Next period · {cycleInfo.next_period_date || 'Upcoming'}
                                </p>
                                <p className="text-xs text-[#3C334B] leading-snug line-clamp-2">
                                    {cycleInfo.phase_description}
                                </p>
                                <div className="pt-0.5">
                                    <Link
                                        href="/cycle"
                                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-semibold shadow-2xs active:scale-95 transition"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>{cycleInfo.has_logged_today ? 'Update Log' : 'Log Today'}</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Inline 1-Tap Flow Strip */}
                        <div className="pt-3 border-t border-slate-100/90 space-y-2">
                            <div className="flex items-center justify-between text-[10.5px]">
                                <span className="font-medium text-[#8A7F99]">Quick flow check-in</span>
                                {quickLogStatus ? (
                                    <span className="font-semibold text-emerald-600">✓ {quickLogStatus}</span>
                                ) : (
                                    <span className="text-[#B0A6BE]">1-tap save</span>
                                )}
                            </div>
                            <div className="grid grid-cols-5 gap-1.5">
                                {[
                                    { id: 'none', label: 'None' },
                                    { id: 'spotting', label: 'Spot' },
                                    { id: 'light', label: 'Light' },
                                    { id: 'medium', label: 'Med' },
                                    { id: 'heavy', label: 'Heavy' },
                                ].map((flow) => {
                                    const selected = activeFlow === flow.id;
                                    return (
                                        <button
                                            key={flow.id}
                                            type="button"
                                            disabled={isSubmittingQuickLog}
                                            onClick={() => handleQuickLog(flow.id, activeSymptoms)}
                                            className={`py-1.5 rounded-full text-[10.5px] font-medium transition active:scale-95 ${
                                                selected
                                                    ? 'bg-[#2D2638] text-white font-semibold'
                                                    : 'bg-slate-100/80 hover:bg-slate-200/70 text-[#6E637C]'
                                            }`}
                                        >
                                            {flow.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* TIER 1 PRE-MENARCHE STARTER CARD */}
                {!canUsePersonalTracker && isTier1 && !isPartner && !isSponsor && !isAdmin && (
                    <div className="bg-white/85 backdrop-blur-xl rounded-[26px] p-5 shadow-[0_8px_28px_-12px_rgba(45,38,56,0.10)] border border-white space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-[#2D2638]">Preparing for Your First Period</h2>
                                <p className="text-[11px] text-[#7A6F8A]">Body changes, hygiene &amp; pad care</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Link
                                href="/learn"
                                className="flex-1 py-2 text-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full text-xs font-semibold transition"
                            >
                                Puberty Guides
                            </Link>
                            <Link
                                href="/learn/myths-facts"
                                className="flex-1 py-2 text-center bg-slate-100 hover:bg-slate-200/70 text-[#2D2638] rounded-full text-xs font-semibold transition"
                            >
                                Myths Quiz
                            </Link>
                        </div>
                    </div>
                )}

                {/* SHARED TRACKER SHORTCUT */}
                {!canUsePersonalTracker && canViewSharedTracker && (
                    <Link
                        href="/trusted-circle/companion"
                        className="flex items-center justify-between bg-white/85 backdrop-blur-xl rounded-[24px] p-4 shadow-[0_6px_24px_-12px_rgba(45,38,56,0.08)] border border-white hover:bg-white transition"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xs font-semibold text-[#2D2638]">{sharedTrackerLabel}</h2>
                                <p className="text-[11px] text-[#8A7F99]">Consent-verified companion view</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#B8AFC4]" />
                    </Link>
                )}

                {/* 3. HORIZONTAL MINIMAL QUICK ACTIONS (4 Clean Circular Icons) */}
                <div className="grid grid-cols-4 gap-2 px-1">
                    {quickActions.map((act) => {
                        const Icon = act.icon;
                        return (
                            <Link
                                key={act.label}
                                href={act.href}
                                className="flex flex-col items-center space-y-1.5 group active:scale-95 transition"
                            >
                                <div
                                    className={`w-12 h-12 rounded-full ${act.tint} bg-white/90 border border-white shadow-[0_6px_20px_-8px_rgba(45,38,56,0.12)] flex items-center justify-center group-hover:scale-105 transition`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10.5px] font-medium text-[#5E546B] truncate max-w-full">
                                    {act.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* 4. COMPANION CARE SUMMARIES (If active) */}
                {companionCareSummaries && companionCareSummaries.length > 0 && (
                    <div className="bg-white/85 backdrop-blur-xl rounded-[24px] p-4 shadow-[0_6px_24px_-12px_rgba(45,38,56,0.08)] border border-white space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#2D2638]">Companion Care</span>
                            <Link href={route('trusted-circle.companion')} className="text-[11px] font-medium text-[#7C3AED]">
                                Open Hub
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {companionCareSummaries.map((summary) => (
                                <div
                                    key={summary.connection_id}
                                    className="px-3 py-2.5 rounded-2xl bg-slate-50/90 flex items-center justify-between"
                                >
                                    <div>
                                        <span className="font-semibold text-xs text-[#2D2638]">{summary.primary_name}</span>
                                        <span className="text-[10.5px] text-[#8A7F99] block">
                                            Expected {summary.predicted_start_date}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-[#7C3AED]">~{summary.days_until_next}d</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. ORG LIVE STOCK & PENDING QUEUE */}
                {isPartner && partnerManagement && (
                    <div className="space-y-3">
                        <div className="bg-white/85 backdrop-blur-xl rounded-[24px] p-4 shadow-[0_6px_24px_-12px_rgba(45,38,56,0.08)] border border-white space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#2D2638]">Pending Pickups</span>
                                <Link href="/portal/partner" className="text-[11px] font-medium text-[#7C3AED]">
                                    View all
                                </Link>
                            </div>

                            {!partnerManagement.recent_pending_requests ||
                            partnerManagement.recent_pending_requests.length === 0 ? (
                                <p className="text-xs text-[#8A7F99] text-center py-3">
                                    All caught up — no pending pickup requests.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {partnerManagement.recent_pending_requests.map((req) => (
                                        <div
                                            key={req.id}
                                            className="p-3 rounded-2xl bg-slate-50/90 flex items-center justify-between gap-2"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-[#2D2638] capitalize truncate">
                                                    {req.request_type?.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-[10.5px] text-[#8A7F99] truncate">
                                                    {req.request_code} · {req.user?.name || 'Recipient'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.post(
                                                        route('portal.partner.fulfill', req.id),
                                                        { status: 'ready_for_pickup' },
                                                        { preserveScroll: true }
                                                    )
                                                }
                                                className="shrink-0 px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[10.5px] font-semibold rounded-full transition active:scale-95"
                                            >
                                                Mark Ready
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 6. CONTEXTUAL HIGHLIGHT (Active Request OR Recommended Read) */}
                {!isPartner && !isSponsor && (
                    recentRequests.length > 0 ? (
                        <div className="bg-white/85 backdrop-blur-xl rounded-[24px] p-4 shadow-[0_6px_24px_-12px_rgba(45,38,56,0.08)] border border-white flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <span className="text-[10.5px] font-medium text-[#8A7F99] block">
                                    Active Supply Request · {recentRequests[0].request_code}
                                </span>
                                <p className="text-[13px] font-semibold text-[#2D2638] capitalize truncate mt-0.5">
                                    {recentRequests[0].request_type?.replace('_', ' ')}
                                </p>
                                <p className="text-[11px] text-[#7A6F8A] truncate">
                                    {recentRequests[0].hub?.organization_name || 'Community Hub'}
                                </p>
                            </div>
                            <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize shrink-0 ${
                                    recentRequests[0].status === 'ready_for_pickup'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-purple-50 text-[#7C3AED]'
                                }`}
                            >
                                {recentRequests[0].status?.replace('_', ' ')}
                            </span>
                        </div>
                    ) : featuredArticle ? (
                        <Link
                            href={`/learn/article/${featuredArticle.slug}`}
                            className="flex items-start space-x-3 p-4 bg-white/85 backdrop-blur-xl rounded-[24px] shadow-[0_6px_24px_-12px_rgba(45,38,56,0.08)] border border-white hover:bg-white transition group"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center space-x-1.5 text-[10.5px] text-[#8A7F99] font-medium">
                                    <span className="text-[#7C3AED] font-semibold">Recommended</span>
                                    <span>·</span>
                                    <span className="inline-flex items-center space-x-0.5">
                                        <Clock className="w-3 h-3" />
                                        <span>{featuredArticle.read_time_minutes} min</span>
                                    </span>
                                </div>
                                <h3 className="font-semibold text-[13px] text-[#2D2638] group-hover:text-[#7C3AED] transition line-clamp-1">
                                    {featuredArticle.title}
                                </h3>
                                <p className="text-[11px] text-[#7A6F8A] line-clamp-1">
                                    {featuredArticle.summary}
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#C2B9CE] shrink-0 mt-1 group-hover:translate-x-0.5 transition" />
                        </Link>
                    ) : null
                )}

                {/* 7. SUBTLE SPONSOR STRIP (Adults only) */}
                {!isPartner && !isSponsor && !isReviewer && canViewSponsor && (
                    <Link
                        href="/support/sponsor"
                        className="flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-xl rounded-full border border-white hover:bg-white transition group"
                    >
                        <div className="flex items-center space-x-2.5 min-w-0">
                            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                            <span className="text-xs font-medium text-[#2D2638] truncate">
                                Sponsor a girl&apos;s dignity pack
                            </span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#8A7F99] group-hover:text-[#2D2638] shrink-0" />
                    </Link>
                )}

                {/* 8. QUIET FOOTER NOTE (Personal/Companion users) */}
                {!isPartner && !isSponsor && !isAdmin && dailyTip && (
                    <p className="text-center text-[11px] text-[#8A7F99] italic px-4 pt-1 leading-relaxed">
                        &ldquo;{dailyTip}&rdquo;
                    </p>
                )}
            </div>
        </MobileAppLayout>
    );
}
