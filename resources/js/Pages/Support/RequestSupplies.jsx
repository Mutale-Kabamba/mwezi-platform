import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { 
    ArrowLeft, 
    Heart, 
    Package, 
    MapPin, 
    Check, 
    ShieldCheck, 
    ChevronRight, 
    Clock, 
    Building2 
} from 'lucide-react';

export default function RequestSupplies({ hubs = [], products = [], defaultHubId = null }) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        request_type: 'emergency_kit',
        assigned_hub_id: defaultHubId || (hubs[0]?.id || ''),
        urgency: 'immediate_emergency',
        delivery_method: 'hub_pickup',
        discreet_location_notes: '',
    });

    const submitRequest = (e) => {
        e.preventDefault();
        post(route('support.request.store'));
    };

    const packageOptions = [
        {
            type: 'emergency_kit',
            title: 'Emergency Dignity Kit',
            badge: 'Immediate Help',
            desc: 'Contains 2 quick-absorb pads, sanitizing wet wipes, and a discreet carry pouch for sudden cycles.',
            urgency: 'immediate_emergency',
            validity: 'Voucher valid for 72 hours from issue',
        },
        {
            type: 'free_monthly_pack',
            title: 'Monthly Disposable Pad Pack (10 count)',
            badge: 'Monthly Supply',
            desc: 'Ultra-thin winged pads for full school day protection and dignity. Subject to 1 pack per 21 days fair-use quota.',
            urgency: 'within_24h',
            validity: null,
        },
        {
            type: 'affordable_order',
            title: 'Mwezi Reusable Pad Pack (Set of 4)',
            badge: 'Sustainable (2 Years)',
            desc: 'Breathable 4-layer cotton reusable pads with leakproof wings, complete with washing soap.',
            urgency: 'standard',
            validity: null,
        },
    ];

    const selectedHub = hubs.find(h => h.id === parseInt(data.assigned_hub_id)) || hubs[0];

    return (
        <MobileAppLayout title={t('request_supplies_title', 'Request Supplies')} subtitle={t('request_supplies_subtitle', 'Discreet • Free • Safe')}>
            <Head title="Request Emergency Supplies - Mwezi" />

            <div className="space-y-4">
                
                {/* Top Nav Back & Step Indicator */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/support"
                        className="p-2 rounded-xl bg-white text-gray-700 hover:bg-gray-100 transition shadow-sm flex items-center space-x-1 text-xs font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Support</span>
                    </Link>

                    {/* Step pills */}
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-mwezi-tertiary">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-mwezi-accent text-white' : 'bg-gray-200 text-gray-600'}`}>1</span>
                        <span className="text-gray-300">•</span>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-mwezi-accent text-white' : 'bg-gray-200 text-gray-600'}`}>2</span>
                        <span className="text-gray-300">•</span>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-mwezi-accent text-white' : 'bg-gray-200 text-gray-600'}`}>3</span>
                    </div>
                </div>

                <form onSubmit={submitRequest} className="space-y-4">
                    
                    {/* STEP 1: SELECT PACKAGE */}
                    {step === 1 && (
                        <div className="space-y-3">
                            <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
                                <span className="text-[10px] font-bold text-mwezi-accent uppercase tracking-wider block mb-1">Step 1 of 3</span>
                                <h2 className="font-heading font-extrabold text-base text-mwezi-tertiary">
                                    Select What You Need
                                </h2>
                                <p className="text-xs text-gray-600">All emergency dignity packages are free of charge.</p>
                            </div>

                            {errors.request_type && (
                                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
                                    <span className="font-bold block mb-0.5">⚠️ Quota Notice:</span>
                                    {errors.request_type}
                                </div>
                            )}

                            <div className="space-y-2.5">
                                {packageOptions.map((pkg) => {
                                    const selected = data.request_type === pkg.type;
                                    return (
                                        <div
                                            key={pkg.type}
                                            onClick={() => {
                                                setData({
                                                    ...data,
                                                    request_type: pkg.type,
                                                    urgency: pkg.urgency,
                                                });
                                            }}
                                            className={`p-4 rounded-[20px] border transition cursor-pointer flex flex-col justify-between ${
                                                selected 
                                                    ? 'bg-mwezi-secondary/40 border-mwezi-accent shadow-sm' 
                                                    : 'bg-white border-gray-200 hover:border-mwezi-secondary'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1.5">
                                                <h3 className="font-heading font-bold text-xs text-mwezi-tertiary">{pkg.title}</h3>
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-mwezi-tertiary shadow-xs">
                                                    {pkg.badge}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2">{pkg.desc}</p>
                                            
                                            {pkg.validity && (
                                                <div className="mb-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/70 text-[10px] font-semibold">
                                                    <Clock className="w-3 h-3 text-amber-600 mr-0.5" />
                                                    <span>{pkg.validity}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-[10px] font-semibold text-mwezi-tertiary">
                                                <span>Cost: Free (Donor Subsidized)</span>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${selected ? 'bg-mwezi-accent text-white' : 'border border-gray-300'}`}>
                                                    {selected && <Check className="w-2.5 h-2.5" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full py-3.5 bg-mwezi-accent hover:bg-mwezi-accent/95 text-white font-bold rounded-[20px] text-xs shadow-md transition flex items-center justify-center space-x-1"
                            >
                                <span>Continue to Choose Hub</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: SELECT DISTRIBUTION HUB */}
                    {step === 2 && (
                        <div className="space-y-3">
                            <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
                                <span className="text-[10px] font-bold text-mwezi-accent uppercase tracking-wider block mb-1">Step 2 of 3</span>
                                <h2 className="font-heading font-extrabold text-base text-mwezi-tertiary">
                                    Choose Nearby Collection Point
                                </h2>
                                <p className="text-xs text-gray-600">Select the school or community hub closest to you.</p>
                            </div>

                            <div className="space-y-2.5">
                                {hubs.map((hub) => {
                                    const selected = parseInt(data.assigned_hub_id) === hub.id;
                                    return (
                                        <div
                                            key={hub.id}
                                            onClick={() => setData('assigned_hub_id', hub.id)}
                                            className={`p-4 rounded-[20px] border transition cursor-pointer ${
                                                selected 
                                                    ? 'bg-mwezi-primary/40 border-mwezi-tertiary shadow-sm' 
                                                    : 'bg-white border-gray-200 hover:border-mwezi-primary'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center space-x-2">
                                                    <Building2 className="w-4 h-4 text-mwezi-tertiary" />
                                                    <h3 className="font-heading font-bold text-xs text-gray-900">{hub.organization_name}</h3>
                                                </div>
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                                    In Stock
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-600 mb-1">{hub.address}</p>
                                            <div className="flex items-center justify-between text-[10px] text-gray-500">
                                                <span>Hours: {hub.operating_hours}</span>
                                                <span className="font-semibold text-mwezi-tertiary">{hub.contact_phone}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-[20px] text-xs"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-3 bg-mwezi-accent hover:bg-mwezi-accent/95 text-white font-bold rounded-[20px] text-xs shadow-md transition flex items-center justify-center space-x-1"
                                >
                                    <span>Continue to Delivery & Privacy</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: METHOD, NOTES & CONFIRMATION */}
                    {step === 3 && (
                        <div className="space-y-3">
                            <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
                                <span className="text-[10px] font-bold text-mwezi-accent uppercase tracking-wider block mb-1">Step 3 of 3</span>
                                <h2 className="font-heading font-extrabold text-base text-mwezi-tertiary">
                                    Discreet Delivery & Voucher
                                </h2>
                                <p className="text-xs text-gray-600">Choose how you wish to receive your supplies with complete privacy.</p>
                            </div>

                            {/* Delivery Method */}
                            <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 space-y-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Collection Preference</label>
                                {[
                                    { id: 'hub_pickup', title: 'Discreet Hub Front Desk Pickup', desc: 'Present your voucher code to the focal teacher or matron without questions.' },
                                    { id: 'school_focal_point', title: 'School Matron / Teacher Drop', desc: 'Delivered quietly to your designated school safe room.' },
                                    { id: 'discreet_community_drop', title: 'Community Safe Space Drop', desc: 'Left in a discreet wrapped parcel at the community center.' },
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setData('delivery_method', method.id)}
                                        className={`w-full p-3 rounded-xl text-left border transition flex flex-col ${
                                            data.delivery_method === method.id 
                                                ? 'bg-mwezi-secondary/40 border-mwezi-accent font-semibold' 
                                                : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <span className="text-xs font-bold text-gray-900">{method.title}</span>
                                        <span className="text-[10px] text-gray-600">{method.desc}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Discreet Location Note */}
                            <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
                                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                                    <span>Optional Discreet Note for Hub Matron</span>
                                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-0.5">
                                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                        <span>Encrypted</span>
                                    </span>
                                </label>
                                <textarea
                                    value={data.discreet_location_notes}
                                    onChange={(e) => setData('discreet_location_notes', e.target.value)}
                                    rows="2"
                                    placeholder="e.g. Will collect during 13:00 lunch break from Sister Mary."
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent"
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-[20px] text-xs"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-3.5 bg-mwezi-accent hover:bg-mwezi-accent/95 text-white font-bold rounded-[20px] text-xs shadow-md transition disabled:opacity-50"
                                >
                                    {processing ? 'Submitting Request...' : 'Confirm & Generate Voucher'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </MobileAppLayout>
    );
}

