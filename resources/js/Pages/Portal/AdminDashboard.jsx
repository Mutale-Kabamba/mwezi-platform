import React from 'react';
import { Head, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import {
    BarChart3,
    Users,
    Building2,
    Package,
    Heart,
    Activity,
    ShieldCheck,
} from 'lucide-react';

export default function AdminDashboard({
    kpis = {},
    campaign,
    telemetry = [],
    users = [],
    educatorApplications = [],
    pendingArticles = [],
}) {
    const reviewers = users.filter((u) => u.role === 'health_reviewer');

    const handleHpczVerify = (userId, status) => {
        router.post(route('portal.admin.users.verify-hpcz', userId), { status }, { preserveScroll: true });
    };

    const handleEducatorReview = (userId, status) => {
        router.post(route('portal.educators.review', userId), { status }, { preserveScroll: true });
    };

    const handleApproveContent = (resourceId) => {
        router.post(route('portal.reviewer.approve', resourceId), {}, { preserveScroll: true });
    };

    const handleRejectContent = (resourceId) => {
        router.post(route('portal.reviewer.reject', resourceId), {}, { preserveScroll: true });
    };

    const statCards = [
        {
            title: 'Girls & Women',
            value: kpis.primary_girls || 0,
            sub: 'Primary users',
            icon: Users,
            color: 'text-rose-600',
            bg: 'bg-rose-100/80',
        },
        {
            title: 'Active Hubs',
            value: kpis.verified_hubs || 0,
            sub: 'Schools & NGOs',
            icon: Building2,
            color: 'text-amber-600',
            bg: 'bg-amber-100/80',
        },
        {
            title: 'Fulfilled',
            value: kpis.fulfilled_requests || 0,
            sub: `${kpis.fulfillment_rate || 100}% rate`,
            icon: Package,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100/80',
        },
        {
            title: 'Raised (ZMW)',
            value: `K${Number(kpis.funds_raised_zmw || 0).toLocaleString()}`,
            sub: `${kpis.girls_sponsored || 0} sponsored`,
            icon: Heart,
            color: 'text-[#7C3AED]',
            bg: 'bg-purple-100/80',
        },
    ];

    const campaignPct = campaign?.target_amount_zmw > 0
        ? Math.min(100, Math.round((campaign.raised_amount_zmw / campaign.target_amount_zmw) * 100))
        : 0;

    return (
        <MobileAppLayout
            title="Governance & M&E"
            subtitle="Dignity & Retention Impact"
            backUrl="/dashboard"
        >
            <Head title="Admin & M&E Impact Dashboard - Mwezi" />

            <div className="space-y-4">
                {/* 1. M&E FRAMEWORK BANNER */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-2xl bg-purple-100/85 text-[#7C3AED] flex items-center justify-center shrink-0">
                                <BarChart3 className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] block">
                                    M&amp;E Framework
                                </span>
                                <h2 className="font-extrabold text-sm text-[#2D2638] leading-tight">
                                    Mwezi Dignity &amp; Retention Impact
                                </h2>
                            </div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-100/90 text-emerald-800 rounded-full text-[9.5px] font-bold inline-flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Zero Data Leakage</span>
                        </span>
                    </div>
                    <p className="text-[11px] text-[#6E637C] leading-relaxed">
                        Real-time anonymized telemetry measuring educational completion, emergency turnaround, and supply chain health in Zambia.
                    </p>
                </div>

                {/* 2. 2x2 MOBILE KPI GRID */}
                <div className="grid grid-cols-2 gap-2.5">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={idx}
                                className="p-3.5 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xs border border-white/95 flex flex-col justify-between space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-[#6E637C] uppercase tracking-wider">
                                        {card.title}
                                    </span>
                                    <div className={`w-7 h-7 rounded-full ${card.bg} flex items-center justify-center ${card.color} shrink-0`}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <div>
                                    <span className="font-extrabold text-xl text-[#2D2638] block leading-none">
                                        {card.value}
                                    </span>
                                    <span className="text-[10px] text-[#6E637C] mt-1 block">{card.sub}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 3. CAMPAIGN OVERSIGHT */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xs text-[#2D2638]">Campaign Oversight</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-bold uppercase">
                            Active
                        </span>
                    </div>

                    <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-2">
                        <h4 className="font-bold text-xs text-[#2D2638]">{campaign?.title || 'Dignity Campaign'}</h4>
                        <div className="flex justify-between text-[11px] text-[#5E546B]">
                            <span>
                                Raised: <strong className="text-[#2D2638]">ZMW {Number(campaign?.raised_amount_zmw || 0).toLocaleString()}</strong>
                            </span>
                            <span>Goal: ZMW {Number(campaign?.target_amount_zmw || 0).toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#7C3AED] rounded-full transition-all"
                                style={{ width: `${campaignPct}%` }}
                            />
                        </div>
                    </div>

                    <div className="text-[11px] text-[#6E637C] space-y-1">
                        <p>• <strong className="text-[#2D2638]">Target Cohort:</strong> 1,000 Schoolgirls in Lusaka &amp; Copperbelt</p>
                        <p>• <strong className="text-[#2D2638]">Intervention:</strong> 4 washable pads + hygiene soap per pack</p>
                        <p>• <strong className="text-[#2D2638]">Retention:</strong> ~92% attendance retention observed</p>
                    </div>
                </div>

                {/* 4. CLINICIAN HPCZ VERIFICATION QUEUE */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-xs text-[#2D2638]">Clinician HPCZ Verification</h3>
                            <p className="text-[10.5px] text-[#6E637C]">Review HPCZ credentials for medical reviewers</p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
                            {reviewers.length}
                        </span>
                    </div>

                    {reviewers.length === 0 ? (
                        <p className="text-xs text-[#6E637C] py-4 text-center bg-white/60 rounded-2xl border border-white">
                            No clinician reviewers registered yet.
                        </p>
                    ) : (
                        <div className="space-y-2.5">
                            {reviewers.map((rev) => {
                                const status = rev.hpcz_verification_status || 'unverified';
                                const badgeClass =
                                    status === 'verified'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : status === 'rejected'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800';
                                return (
                                    <div
                                        key={rev.id}
                                        className="p-3 rounded-2xl bg-white/85 border border-white space-y-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-xs text-[#2D2638] truncate">
                                                {rev.name}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase shrink-0 ${badgeClass}`}>
                                                {status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <p className="text-[10.5px] text-[#6E637C]">
                                            HPCZ:{' '}
                                            <span className="font-mono font-semibold text-[#2D2638]">
                                                {rev.hpcz_registration_number || 'N/A'}
                                            </span>
                                            {rev.clinical_specialty ? ` • ${rev.clinical_specialty}` : ''}
                                        </p>
                                        <div className="flex items-center gap-2 pt-0.5">
                                            {status !== 'verified' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleHpczVerify(rev.id, 'verified')}
                                                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-[11px] font-bold transition active:scale-95"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {status !== 'rejected' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleHpczVerify(rev.id, 'rejected')}
                                                    className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full text-[11px] font-bold transition active:scale-95"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 4.5 EDUCATOR APPLICATIONS & PENDING CONTENT APPROVAL */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-xs text-[#2D2638]">Educator Applications</h3>
                            <p className="text-[10.5px] text-[#6E637C]">Approve educators to create learning content</p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-purple-100 text-[#7C3AED] rounded-full text-[10px] font-bold">
                            {educatorApplications.filter((e) => e.educator_status === 'pending').length} Pending
                        </span>
                    </div>

                    {educatorApplications.length === 0 ? (
                        <p className="text-xs text-[#6E637C] py-3 text-center bg-white/60 rounded-2xl border border-white">
                            No educator applications yet.
                        </p>
                    ) : (
                        <div className="space-y-2.5">
                            {educatorApplications.map((app) => (
                                <div
                                    key={app.id}
                                    className="p-3 rounded-2xl bg-white/85 border border-white space-y-2"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-xs text-[#2D2638] truncate">{app.name}</span>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase shrink-0 ${
                                                app.educator_status === 'approved'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}
                                        >
                                            {app.educator_status}
                                        </span>
                                    </div>
                                    {app.educator_bio && (
                                        <p className="text-[10.5px] text-[#6E637C] line-clamp-2">{app.educator_bio}</p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {app.educator_status !== 'approved' && (
                                            <button
                                                type="button"
                                                onClick={() => handleEducatorReview(app.id, 'approved')}
                                                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-[11px] font-bold transition"
                                            >
                                                Approve Educator
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleEducatorReview(app.id, 'rejected')}
                                            className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full text-[11px] font-bold transition"
                                        >
                                            {app.educator_status === 'approved' ? 'Revoke' : 'Decline'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {pendingArticles.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-xs text-[#2D2638]">Pending Learning Content</h3>
                                <p className="text-[10.5px] text-[#6E637C]">Approve educator submissions to publish</p>
                            </div>
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                                {pendingArticles.length}
                            </span>
                        </div>
                        <div className="space-y-2.5">
                            {pendingArticles.map((art) => (
                                <div key={art.id} className="p-3 rounded-2xl bg-white/85 border border-white space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-xs text-[#2D2638] truncate">{art.title}</span>
                                        <span className="text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] shrink-0">
                                            {art.format?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-[10.5px] text-[#6E637C] line-clamp-2">{art.summary}</p>
                                    {art.author?.name && (
                                        <p className="text-[10px] text-[#7C3AED] font-semibold">By {art.author.name}</p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleApproveContent(art.id)}
                                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-[11px] font-bold transition"
                                        >
                                            Approve &amp; Publish
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRejectContent(art.id)}
                                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full text-[11px] font-bold transition"
                                        >
                                            Return Draft
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. ANONYMIZED IMPACT TELEMETRY */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-purple-100/85 text-[#7C3AED] flex items-center justify-center">
                                <Activity className="w-3.5 h-3.5" />
                            </div>
                            <h3 className="font-bold text-xs text-[#2D2638]">Impact Telemetry</h3>
                        </div>
                        <span className="text-[10px] text-[#6E637C] font-medium">Privacy Preserved</span>
                    </div>

                    <div className="space-y-1.5 max-h-64 overflow-y-auto hide-scrollbar">
                        {telemetry.map((evt, idx) => (
                            <div
                                key={idx}
                                className="p-2.5 rounded-2xl bg-white/80 border border-white flex items-center justify-between gap-2"
                            >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="font-bold text-[11px] text-[#2D2638] capitalize block truncate">
                                            {evt.event_type?.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-[10px] text-[#6E637C] block truncate">
                                            {evt.district || 'Lusaka Central'}, {evt.province || 'Lusaka'}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[10px] text-[#8A7F99] shrink-0">
                                    {new Date(evt.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MobileAppLayout>
    );
}
