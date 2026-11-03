import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { 
    ArrowLeft, 
    Heart, 
    Sparkles, 
    ShieldCheck, 
    Users, 
    CheckCircle2, 
    ArrowRight 
} from 'lucide-react';

export default function SponsorPortal({ campaign, recentDonations = [], hubs = [] }) {
    const { data, setData, post, processing } = useForm({
        donation_type: 'sponsor_a_girl_annual',
        amount_zmw: 150,
        donor_name: '',
        donor_email: '',
        target_hub_id: hubs[0]?.id || '',
    });

    const tiers = [
        {
            type: 'reusable_pad_pack',
            amount: 150,
            title: 'Sponsor 1 Girl',
            desc: 'Provides 1 set of 4 washable reusable pads + soap lasting 2 full school years.',
            girls: 1,
        },
        {
            type: 'emergency_kit_bundle',
            amount: 450,
            title: 'Emergency School Kit Bundle',
            desc: 'Stocks 15 emergency dignity kits in a local primary/secondary school safe space.',
            girls: 3,
        },
        {
            type: 'sponsor_a_girl_annual',
            amount: 1800,
            title: 'Sponsor 12 Girls Annually',
            desc: 'Full year of dignity kits, hygiene education, and continuous school retention support.',
            girls: 12,
        },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('support.sponsor.store'));
    };

    const percentRaised = campaign?.target_amount_zmw > 0 
        ? Math.min(100, Math.round((campaign.raised_amount_zmw / campaign.target_amount_zmw) * 100))
        : 60;

    return (
        <MobileAppLayout title="Sponsorship" subtitle="Dignity & School Retention">
            <Head title="Sponsor a Girl - Mwezi Platform" />

            <div className="space-y-4">
                
                {/* Top Nav Back */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/support"
                        className="p-2 rounded-xl bg-white text-gray-700 hover:bg-gray-100 transition shadow-sm flex items-center space-x-1 text-xs font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Support</span>
                    </Link>

                    <span className="text-xs font-bold text-mwezi-tertiary bg-mwezi-secondary/60 px-3 py-1.5 rounded-full">
                        Tax-Deductible Dignity Giving
                    </span>
                </div>

                {/* CAMPAIGN PROGRESS HERO CONTAINER */}
                <div className="bg-gradient-to-br from-mwezi-tertiary to-[#5A2B2D] text-white rounded-[20px] p-5 shadow-mwezi space-y-3">
                    <div className="flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-mwezi-accent fill-mwezi-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-mwezi-brandText">Active Campaign</span>
                    </div>

                    <h1 className="font-heading font-extrabold text-lg leading-tight text-white">
                        {campaign?.title || 'Keep 1,000 Zambian Schoolgirls in Class with Dignity'}
                    </h1>

                    <p className="text-xs text-white/90 leading-relaxed font-body">
                        {campaign?.description || 'Every reusable pad set keeps a girl attending class without missing 4-5 days every month.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="pt-2">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="font-bold text-mwezi-brandText">
                                ZMW {Number(campaign?.raised_amount_zmw || 84500).toLocaleString()}
                            </span>
                            <span className="text-white/80">Goal: ZMW {Number(campaign?.target_amount_zmw || 150000).toLocaleString()}</span>
                        </div>
                        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-mwezi-accent to-mwezi-brandText rounded-full transition-all duration-500"
                                style={{ width: `${percentRaised}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-white/70 mt-1">
                            <span>{percentRaised}% Funded</span>
                            <span>{campaign?.target_girls_count || 1000} Girls Target</span>
                        </div>
                    </div>
                </div>

                {/* DONATION TIERS */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <h2 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider px-1">
                        Select a Sponsorship Tier
                    </h2>

                    <div className="space-y-2">
                        {tiers.map((tier) => {
                            const isSelected = data.amount_zmw === tier.amount;
                            return (
                                <div
                                    key={tier.amount}
                                    onClick={() => {
                                        setData({
                                            ...data,
                                            amount_zmw: tier.amount,
                                            donation_type: tier.type,
                                        });
                                    }}
                                    className={`p-4 rounded-[20px] border transition cursor-pointer flex flex-col justify-between ${
                                        isSelected 
                                            ? 'bg-mwezi-secondary/40 border-mwezi-accent shadow-sm' 
                                            : 'bg-white border-gray-200 hover:border-mwezi-secondary'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-heading font-bold text-sm text-mwezi-tertiary">{tier.title}</h3>
                                        <span className="font-heading font-extrabold text-sm text-mwezi-accent">
                                            ZMW {tier.amount}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">{tier.desc}</p>
                                    <div className="flex items-center justify-between text-[10px] font-semibold text-emerald-800">
                                        <span>Supports ~{tier.girls} Schoolgirl{tier.girls > 1 ? 's' : ''}</span>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isSelected ? 'bg-mwezi-accent text-white' : 'border border-gray-300'}`}>
                                            {isSelected && <CheckCircle2 className="w-3 h-3" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Donor Details Card */}
                    <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 space-y-3">
                        <h3 className="font-heading font-bold text-xs text-gray-800">Donor Information (Optional)</h3>
                        <div>
                            <input
                                type="text"
                                value={data.donor_name}
                                onChange={(e) => setData('donor_name', e.target.value)}
                                placeholder="Your Name (Leave blank for Anonymous)"
                                className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-mwezi-accent"
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                value={data.donor_email}
                                onChange={(e) => setData('donor_email', e.target.value)}
                                placeholder="Receipt Email"
                                className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-mwezi-accent"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 bg-mwezi-accent hover:bg-mwezi-accent/95 text-white font-bold rounded-[20px] text-xs shadow-md transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                        <span>Confirm ZMW {data.amount_zmw} Sponsorship</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                {/* RECENT SUPPORTERS HONOR ROLL */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
                    <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider mb-2.5">
                        Recent Dignity Champions
                    </h3>
                    <div className="space-y-2">
                        {recentDonations.map((d) => (
                            <div key={d.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                <div>
                                    <span className="font-bold text-gray-800">{d.donor_name}</span>
                                    <p className="text-[10px] text-gray-500 capitalize">{d.donation_type.replace(/_/g, ' ')}</p>
                                </div>
                                <span className="font-bold text-mwezi-tertiary">
                                    ZMW {Number(d.amount_zmw).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MobileAppLayout>
    );
}

