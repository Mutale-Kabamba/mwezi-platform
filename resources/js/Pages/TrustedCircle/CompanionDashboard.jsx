import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { 
    Users, 
    Calendar, 
    Heart, 
    ShieldCheck, 
    BookOpen, 
    Sparkles, 
    ChevronRight,
    Lock
} from 'lucide-react';

export default function CompanionDashboard({ 
    connection, 
    cycleSummary, 
    allyArticles = [] 
}) {
    const { t } = useTranslation();
    const [childGroupSelection, setChildGroupSelection] = useState('tier_1');
    const { data, setData, post, processing, reset, errors } = useForm({
        tier: 'tier_1_10_14',
        child_name: '',
        child_age: 12,
        username: '',
        pin_code: '',
        contact_channel: '',
        luna_ai_level: 'guided',
        emergency_alerts: true,
        tip_sharing: true,
    });

    const handleTierGroupSelect = (group) => {
        setChildGroupSelection(group);
        if (group === 'tier_2') {
            setData((prev) => ({ ...prev, tier: 'tier_2_15_19', child_age: 16 }));
        } else {
            setData((prev) => ({ ...prev, tier: 'tier_1_10_14', child_age: 12 }));
        }
    };

    const handleSubmitDependent = (e) => {
        e.preventDefault();
        post(route('trusted-circle.dependents.store'), {
            preserveScroll: true,
            onSuccess: () => reset('child_name', 'username', 'pin_code', 'contact_channel'),
        });
    };

    return (
        <MobileAppLayout title={t('trusted_title', 'Companion View')} backUrl="/dashboard">
            <Head title="Trusted Companion View - Mwezi" />

            <div className="space-y-4">
                
                {/* 1. COMPANION ROLE BANNER */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-mwezi-secondary/60 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-mwezi-secondary/80 flex items-center justify-center text-mwezi-tertiary font-bold">
                            <Users className="w-5 h-5 text-mwezi-tertiary" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-mwezi-tertiary">Trusted Companion</span>
                            <h2 className="font-heading font-bold text-sm text-gray-900 leading-tight">
                                Supporting {cycleSummary?.primary_name || 'Your Loved One'}
                            </h2>
                        </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active Ally
                    </span>
                </div>

                {/* 2. NON-INTRUSIVE ARRIVAL FORECAST CONTAINER */}
                {cycleSummary ? (
                    <div className="bg-mwezi-primary rounded-[20px] p-5 shadow-mwezi text-mwezi-dark relative overflow-hidden border border-white">
                        <div className="relative z-10">
                            <span className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-[10px] font-bold text-mwezi-tertiary tracking-wide uppercase">
                                General Cycle Forecast
                            </span>

                            <div className="my-3 flex items-baseline space-x-2">
                                <span className="font-heading font-extrabold text-[36px] leading-none text-mwezi-tertiary">
                                    ~{cycleSummary.days_until_next}
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    days until next expected cycle
                                </span>
                            </div>

                            <p className="text-xs text-gray-700 font-medium leading-relaxed mb-3">
                                Expected window starts around <strong>{cycleSummary.predicted_start_date}</strong>. This is a great time to ensure household pads and warm teas are stocked!
                            </p>

                            <div className="p-2.5 bg-white/80 rounded-xl text-[10px] text-gray-600 flex items-center space-x-1.5 font-medium">
                                <Lock className="w-3.5 h-3.5 text-mwezi-tertiary shrink-0" />
                                <span>Private symptom notes and diary logs are protected and strictly hidden.</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[20px] p-6 text-center border border-gray-100 shadow-sm">
                        <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <h3 className="font-bold text-xs text-gray-800">No Active Sharing Configured</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Ask your loved one to share an invite code with you.</p>
                    </div>
                )}

                {/* 3. PRACTICAL WAYS TO SUPPORT THIS WEEK */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 space-y-3">
                    <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider">
                        Practical Ways to Support This Week
                    </h3>

                    <div className="space-y-2">
                        {[
                            { title: 'Check the Sanitary Pad Supply', desc: 'Ensure clean disposable or reusable pads are readily accessible at home.' },
                            { title: 'Offer Warm Comfort', desc: 'A cup of warm ginger tea or a hot water bottle soothes abdominal muscle tightness.' },
                            { title: 'Normalize the Conversation', desc: 'Never tease, isolate, or treat menstruation as something dirty. Dignity starts at home.' },
                        ].map((tip, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                                <span className="font-bold text-gray-800 block mb-0.5">{tip.title}</span>
                                <span className="text-gray-600 text-[11px] leading-tight block">{tip.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. ALLYSHIP EDUCATIONAL GUIDES */}
                <div className="space-y-2.5">
                    <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider px-1">
                        Educational Guides for Family Allies
                    </h3>

                    {allyArticles.map((art) => (
                        <Link
                            key={art.id}
                            href={`/learn/article/${art.slug}`}
                            className="block p-3.5 bg-white rounded-[20px] border border-gray-100 shadow-sm hover:bg-mwezi-light transition"
                        >
                            <h4 className="font-heading font-bold text-xs text-gray-900 leading-snug mb-1">
                                {art.title}
                            </h4>
                            <p className="text-[11px] text-gray-600 line-clamp-2 mb-2">
                                {art.summary}
                            </p>
                            <div className="flex items-center text-[10px] font-bold text-mwezi-accent space-x-1">
                                <span>Read Full Guide</span>
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 4. PARENT & GUARDIAN MULTI-TIER CHILD MANAGEMENT */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-rose-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#BE123C]">Parent & Guardian Controls</span>
                            <h3 className="font-heading font-bold text-sm text-gray-900">Multi-Tier Child Selection</h3>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-[#BE123C]" />
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                        {[
                            { id: 'tier_1', label: 'Tier 1 (10–14)' },
                            { id: 'tier_2', label: 'Tier 2 (15–19)' },
                            { id: 'both', label: 'Both Tiers' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleTierGroupSelect(opt.id)}
                                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition ${
                                    childGroupSelection === opt.id
                                        ? 'bg-[#BE123C] text-white border-[#BE123C]'
                                        : 'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {childGroupSelection === 'both' && (
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setData((prev) => ({ ...prev, tier: 'tier_1_10_14', child_age: 12 }))}
                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border ${
                                    data.tier === 'tier_1_10_14' ? 'bg-rose-50 text-[#BE123C] border-rose-300' : 'bg-white text-gray-600 border-gray-200'
                                }`}
                            >
                                Add Tier 1 Child
                            </button>
                            <button
                                type="button"
                                onClick={() => setData((prev) => ({ ...prev, tier: 'tier_2_15_19', child_age: 16 }))}
                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border ${
                                    data.tier === 'tier_2_15_19' ? 'bg-rose-50 text-[#BE123C] border-rose-300' : 'bg-white text-gray-600 border-gray-200'
                                }`}
                            >
                                Invite Tier 2 Teen
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmitDependent} className="space-y-2.5 pt-1">
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                value={data.child_name}
                                onChange={(e) => setData('child_name', e.target.value)}
                                placeholder="Child First Name"
                                required
                                className="col-span-2 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE123C]"
                            />
                            <input
                                type="number"
                                min={data.tier === 'tier_1_10_14' ? 10 : 15}
                                max={data.tier === 'tier_1_10_14' ? 14 : 19}
                                value={data.child_age}
                                onChange={(e) => setData('child_age', Number(e.target.value))}
                                placeholder="Age"
                                className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#BE123C]"
                            />
                        </div>

                        {data.tier === 'tier_1_10_14' ? (
                            <div className="space-y-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="Child Username"
                                        required
                                        className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#BE123C]"
                                    />
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={data.pin_code}
                                        onChange={(e) => setData('pin_code', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="4-Digit PIN"
                                        required
                                        className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#BE123C]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 mb-1">Luna AI Access Level</label>
                                    <select
                                        value={data.luna_ai_level}
                                        onChange={(e) => setData('luna_ai_level', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#BE123C]"
                                    >
                                        <option value="guided">Guided (Age-Appropriate Health Education)</option>
                                        <option value="restricted">Restricted (Basic FAQ Only)</option>
                                        <option value="full">Full Access</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-gray-700 pt-1">
                                    <label className="flex items-center space-x-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.emergency_alerts}
                                            onChange={(e) => setData('emergency_alerts', e.target.checked)}
                                            className="rounded text-[#BE123C]"
                                        />
                                        <span>Emergency Alerts</span>
                                    </label>
                                    <label className="flex items-center space-x-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.tip_sharing}
                                            onChange={(e) => setData('tip_sharing', e.target.checked)}
                                            className="rounded text-[#BE123C]"
                                        />
                                        <span>Tip Sharing</span>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <p className="text-[11px] text-gray-600">
                                    Tier 2 (15–19) preserves older adolescent privacy. Provide guardian consent and send a join invite code.
                                </p>
                                <input
                                    type="text"
                                    value={data.contact_channel}
                                    onChange={(e) => setData('contact_channel', e.target.value)}
                                    placeholder="Teen Phone or Email (for invite)"
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#BE123C]"
                                />
                            </div>
                        )}

                        {(errors.username || errors.pin_code || errors.child_name) && (
                            <p className="text-[11px] text-[#BE123C] font-medium">
                                {errors.username || errors.pin_code || errors.child_name}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-2.5 bg-[#BE123C] hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                        >
                            {data.tier === 'tier_1_10_14' ? 'Provision Tier 1 Sub-Account' : 'Authorize & Send Tier 2 Join Invite'}
                        </button>
                    </form>
                </div>
            </div>
        </MobileAppLayout>
    );
}

