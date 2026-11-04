import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { 
    Sparkles, 
    Shield, 
    Calendar, 
    Heart, 
    Check, 
    Building2, 
    Stethoscope, 
    Lock, 
    MapPin, 
    Phone, 
    Package, 
    CheckCircle2, 
    ArrowRight,
    Users
} from 'lucide-react';

export default function RoleOnboardingWizard({
    user,
    verifiedHubs = [],
    cycleProfile = null,
    zambianRegions = {}
}) {
    const { t } = useTranslation();
    const role = user?.role || 'primary_user';

    const defaultProvince = user?.province || 'Lusaka';
    const initialDistricts = zambianRegions[defaultProvince] || ['Lusaka'];

    // Primary User Form State
    const primaryForm = useForm({
        province: defaultProvince,
        district: user?.district || initialDistricts[0] || 'Lusaka',
        age_cohort: cycleProfile?.age_band || '14_17_secondary',
        is_first_year_menarche: cycleProfile?.is_first_year_menarche ?? false,
        last_period_start: cycleProfile?.last_period_start || '',
        period_not_started: !cycleProfile?.last_period_start,
        average_cycle_length: cycleProfile?.average_cycle_length || 28,
        average_period_length: cycleProfile?.average_period_length || 5,
        preferred_product_type: cycleProfile?.preferred_product_type || 'both',
        default_hub_id: user?.default_hub_id || (verifiedHubs[0]?.id || ''),
        discreet_mode_enabled: user?.discreet_mode_enabled ?? true,
        pin: '',
    });

    // Trusted Contact Form State
    const companionForm = useForm({
        invite_code: '',
        relationship: 'mother',
        contact_channel: user?.phone || user?.email || '',
        province: defaultProvince,
        district: user?.district || 'Lusaka',
    });

    // Community Partner Form State
    const partnerForm = useForm({
        organization_name: '',
        hub_type: 'school',
        province: defaultProvince,
        district: user?.district || 'Lusaka',
        address: '',
        latitude: -15.4167,
        longitude: 28.2833,
        contact_phone: user?.phone || '',
        operating_hours: 'Mon - Fri: 08:00 - 16:00',
        offers_free_pads: true,
        offers_emergency_kits: true,
        offers_reusable_pads: true,
        offers_health_referrals: false,
        free_pads_qty: 100,
        emergency_kits_qty: 50,
        current_reusable_pads_stock: 50,
        languages_spoken: ['en', 'bem', 'nya'],
    });

    // Health Reviewer Form State
    const reviewerForm = useForm({
        clinical_specialty: 'Adolescent Nurse',
        hpcz_registration_number: '',
        default_hub_id: verifiedHubs[0]?.id || '',
        review_locales: ['en', 'bem'],
        bio: '',
    });

    // Donor Sponsor Form State
    const sponsorForm = useForm({
        donor_default_anonymous: false,
        phone: user?.phone || '',
        province: defaultProvince,
        district: user?.district || 'Lusaka',
        default_hub_id: verifiedHubs[0]?.id || '',
    });

    // Admin Form State
    const adminForm = useForm({
        admin_scope: 'PM_M&E',
        phone: user?.phone || '',
    });

    const handlePrimarySubmit = (e) => {
        e.preventDefault();
        primaryForm.post(route('onboarding.wizard.store'));
    };

    const handleCompanionSubmit = (e) => {
        e.preventDefault();
        companionForm.post(route('onboarding.wizard.store'));
    };

    const handlePartnerSubmit = (e) => {
        e.preventDefault();
        partnerForm.post(route('onboarding.wizard.store'));
    };

    const handleReviewerSubmit = (e) => {
        e.preventDefault();
        reviewerForm.post(route('onboarding.wizard.store'));
    };

    const handleSponsorSubmit = (e) => {
        e.preventDefault();
        sponsorForm.post(route('onboarding.wizard.store'));
    };

    const handleAdminSubmit = (e) => {
        e.preventDefault();
        adminForm.post(route('onboarding.wizard.store'));
    };

    const provincesList = Object.keys(zambianRegions);

    return (
        <MobileAppLayout
            title="Step 2: Setup"
            subtitle="Intelligence Calibration"
            showNav={false}
        >
            <Head title="Setup & Calibration - Mwezi" />

            <div className="space-y-4 pb-8">
                {/* Progress Header */}
                <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-100 mb-2">
                        <span>STEP 2 OF 2</span>
                        <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px]">
                            {role.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <h1 className="text-lg font-black tracking-tight text-white">
                        {role === 'primary_user' && 'Calibrate Your Cycle Rhythm'}
                        {role === 'trusted_contact' && 'Companion Link & Alerts'}
                        {role === 'community_partner' && 'Register Community Service Hub'}
                        {role === 'health_reviewer' && 'HPCZ Clinician Accreditation'}
                        {role === 'donor_sponsor' && 'Dignity Sponsorship Profile'}
                        {role === 'admin' && 'Platform Governance Setup'}
                    </h1>
                    <p className="text-xs text-rose-100/90 mt-1 leading-relaxed">
                        Customizing your Mwezi experience for Zambian community health, dignity, and offline readiness.
                    </p>
                </div>

                {/* ROLE 1: PRIMARY USER WIZARD */}
                {role === 'primary_user' && (
                    <form onSubmit={handlePrimarySubmit} className="space-y-3.5">
                        {/* Location: Province & District */}
                        <div className="bg-white p-4 rounded-3xl border border-rose-150 shadow-2xs space-y-3">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                                1. Your Location in Zambia
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Province</label>
                                    <select
                                        value={primaryForm.data.province}
                                        onChange={(e) => {
                                            const prov = e.target.value;
                                            primaryForm.setData({
                                                ...primaryForm.data,
                                                province: prov,
                                                district: zambianRegions[prov]?.[0] || 'Lusaka',
                                            });
                                        }}
                                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"
                                    >
                                        {provincesList.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">District</label>
                                    <select
                                        value={primaryForm.data.district}
                                        onChange={(e) => primaryForm.setData('district', e.target.value)}
                                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"
                                    >
                                        {(zambianRegions[primaryForm.data.province] || []).map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Age Cohort & Menarche Calibration */}
                        <div className="bg-white p-4 rounded-3xl border border-rose-150 shadow-2xs space-y-3">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                                2. Age & Cycle Stage
                            </span>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Age Group</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {[
                                        { id: '10_13_early_teen', label: '10–13 (Early Teen)' },
                                        { id: '14_17_secondary', label: '14–17 (Secondary)' },
                                        { id: '18_24_young_adult', label: '18–24 (Young Adult)' },
                                        { id: '25_plus', label: '25+ (Adult)' },
                                    ].map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => primaryForm.setData('age_cohort', c.id)}
                                            className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition ${
                                                primaryForm.data.age_cohort === c.id
                                                    ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Is this your first or second year having periods?
                                </label>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => primaryForm.setData('is_first_year_menarche', true)}
                                        className={`flex-1 p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1 ${
                                            primaryForm.data.is_first_year_menarche
                                                ? 'bg-amber-50 border-amber-500 text-amber-900'
                                                : 'bg-slate-50 border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <span>Yes (First 1–2 Years)</span>
                                        <Sparkles className="w-3 h-3 text-amber-600" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => primaryForm.setData('is_first_year_menarche', false)}
                                        className={`flex-1 p-2 rounded-xl border text-xs font-bold transition ${
                                            !primaryForm.data.is_first_year_menarche
                                                ? 'bg-rose-50 border-rose-500 text-rose-800'
                                                : 'bg-slate-50 border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        No (Periods Regular)
                                    </button>
                                </div>
                                {primaryForm.data.is_first_year_menarche && (
                                    <p className="text-[10px] text-amber-700 font-medium mt-1.5 leading-snug">
                                        ✨ Teen Calibration will automatically activate: 21–45 day cycles are completely normal and protected from false irregularity alerts!
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Last Period Date & Product Preference */}
                        <div className="bg-white p-4 rounded-3xl border border-rose-150 shadow-2xs space-y-3">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                                3. Period Start Date & Supplies
                            </span>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    First day of your last period
                                </label>
                                <input
                                    type="date"
                                    disabled={primaryForm.data.period_not_started}
                                    value={primaryForm.data.last_period_start || ''}
                                    onChange={(e) => primaryForm.setData('last_period_start', e.target.value)}
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 disabled:opacity-40"
                                />
                                <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={primaryForm.data.period_not_started}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            primaryForm.setData({
                                                ...primaryForm.data,
                                                period_not_started: checked,
                                                last_period_start: checked ? '' : primaryForm.data.last_period_start
                                            });
                                        }}
                                        className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                                    />
                                    <span className="text-xs text-slate-600 font-medium">
                                        I'm not sure / My period hasn't started yet
                                    </span>
                                </label>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                    What pads or supplies do you prefer?
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {[
                                        { id: 'reusable_pads', label: 'Reusable Cloth Pads' },
                                        { id: 'disposable_pads', label: 'Disposable Pads' },
                                        { id: 'both', label: 'Both / Either' },
                                        { id: 'need_supplies', label: 'Need Free School Pack' },
                                    ].map((prod) => (
                                        <button
                                            key={prod.id}
                                            type="button"
                                            onClick={() => primaryForm.setData('preferred_product_type', prod.id)}
                                            className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition ${
                                                primaryForm.data.preferred_product_type === prod.id
                                                    ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {prod.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Privacy & Discreet Security Mode */}
                        <div className="bg-white p-4 rounded-3xl border border-rose-150 shadow-2xs space-y-3">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                                4. Privacy & Discreet Shield (Optional)
                            </span>
                            <div className="space-y-2">
                                <label className="flex items-start space-x-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={primaryForm.data.discreet_mode_enabled}
                                        onChange={(e) => primaryForm.setData('discreet_mode_enabled', e.target.checked)}
                                        className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 mt-0.5"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 block">
                                            Enable Discreet Study Mode
                                        </span>
                                        <span className="text-[10px] text-slate-500 leading-tight block">
                                            Disguises your app as Grade 11 Biology Revision when opened on a shared family phone.
                                        </span>
                                    </div>
                                </label>

                                <div className="pt-2">
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Optional 4-Digit Quick PIN (To exit disguise)
                                    </label>
                                    <input
                                        type="password"
                                        maxLength={4}
                                        inputMode="numeric"
                                        value={primaryForm.data.pin}
                                        onChange={(e) => primaryForm.setData('pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="••••"
                                        className="w-32 text-center text-lg font-mono tracking-widest p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={primaryForm.processing}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-500/25 transition active:scale-98 flex items-center justify-center space-x-2"
                        >
                            <span>Complete Setup & Enter Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {/* ROLE 2: TRUSTED CONTACT WIZARD */}
                {role === 'trusted_contact' && (
                    <form onSubmit={handleCompanionSubmit} className="space-y-3.5">
                        <div className="bg-white p-4 rounded-3xl border border-rose-150 shadow-2xs space-y-3">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                                Link to Supported Family Member
                            </span>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Invite Code</label>
                                <input
                                    type="text"
                                    value={companionForm.data.invite_code}
                                    onChange={(e) => companionForm.setData('invite_code', e.target.value.toUpperCase())}
                                    placeholder="MWEZI-1234-ABCD"
                                    className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 uppercase"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Ask your daughter, sister, or partner for their Mwezi invite code, or enter later.
                                </p>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Your Relationship</label>
                                <select
                                    value={companionForm.data.relationship}
                                    onChange={(e) => companionForm.setData('relationship', e.target.value)}
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"
                                >
                                    <option value="mother">Mother / Female Guardian</option>
                                    <option value="father">Father / Male Guardian</option>
                                    <option value="guardian">Teacher / Mentor</option>
                                    <option value="partner">Husband / Partner</option>
                                    <option value="sibling">Sister / Brother</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Alert Channel (For 3-day pre-period reminders)
                                </label>
                                <input
                                    type="text"
                                    value={companionForm.data.contact_channel}
                                    onChange={(e) => companionForm.setData('contact_channel', e.target.value)}
                                    placeholder="Phone number (097...) or Email"
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={companionForm.processing}
                            className="w-full py-4 rounded-2xl bg-rose-600 text-white font-extrabold text-xs shadow-md transition active:scale-98 flex items-center justify-center space-x-2"
                        >
                            <span>Enter Companion Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {/* ROLE 3: COMMUNITY PARTNER WIZARD */}
                {role === 'community_partner' && (
                    <form onSubmit={handlePartnerSubmit} className="space-y-3.5">
                        <div className="bg-white p-4 rounded-3xl border border-rose-150 shadow-2xs space-y-3">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                                Hub Facility Details
                            </span>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Organization / School Name</label>
                                <input
                                    type="text"
                                    value={partnerForm.data.organization_name}
                                    onChange={(e) => partnerForm.setData('organization_name', e.target.value)}
                                    placeholder="e.g. Matero Girls Secondary School"
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Hub Type</label>
                                    <select
                                        value={partnerForm.data.hub_type}
                                        onChange={(e) => partnerForm.setData('hub_type', e.target.value)}
                                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="school">Secondary School</option>
                                        <option value="ngo">Community NGO Hub</option>
                                        <option value="clinic">Health Post / Clinic</option>
                                        <option value="pharmacy">Local Pharmacy</option>
                                        <option value="youth_center">Youth Safe Space</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Province</label>
                                    <select
                                        value={partnerForm.data.province}
                                        onChange={(e) => partnerForm.setData('province', e.target.value)}
                                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                    >
                                        {provincesList.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Address / Landmark</label>
                                <input
                                    type="text"
                                    value={partnerForm.data.address}
                                    onChange={(e) => partnerForm.setData('address', e.target.value)}
                                    placeholder="e.g. Off Lumumba Road, Matero"
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Free Packs</label>
                                    <input
                                        type="number"
                                        value={partnerForm.data.free_pads_qty}
                                        onChange={(e) => partnerForm.setData('free_pads_qty', parseInt(e.target.value) || 0)}
                                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Emergency Kits</label>
                                    <input
                                        type="number"
                                        value={partnerForm.data.emergency_kits_qty}
                                        onChange={(e) => partnerForm.setData('emergency_kits_qty', parseInt(e.target.value) || 0)}
                                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Reusable Pads</label>
                                    <input
                                        type="number"
                                        value={partnerForm.data.current_reusable_pads_stock}
                                        onChange={(e) => partnerForm.setData('current_reusable_pads_stock', parseInt(e.target.value) || 0)}
                                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={partnerForm.processing}
                            className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition active:scale-98 flex items-center justify-center space-x-2"
                        >
                            <span>Open Partner Hub Management</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {/* ROLE 4: HEALTH REVIEWER WIZARD */}
                {role === 'health_reviewer' && (
                    <form onSubmit={handleReviewerSubmit} className="space-y-3.5">
                        <div className="bg-white p-4 rounded-3xl border border-rose-150 shadow-2xs space-y-3">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                                Clinician Accreditation
                            </span>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Clinical Specialty</label>
                                <input
                                    type="text"
                                    value={reviewerForm.data.clinical_specialty}
                                    onChange={(e) => reviewerForm.setData('clinical_specialty', e.target.value)}
                                    placeholder="e.g. Registered Midwife, Adolescent Nurse, OB-GYN, Medical Officer"
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">HPCZ Registration ID</label>
                                <input
                                    type="text"
                                    value={reviewerForm.data.hpcz_registration_number}
                                    onChange={(e) => reviewerForm.setData('hpcz_registration_number', e.target.value)}
                                    placeholder="HPCZ-XXXX-2026"
                                    className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Affiliated Clinic Hub</label>
                                <select
                                    value={reviewerForm.data.default_hub_id}
                                    onChange={(e) => reviewerForm.setData('default_hub_id', e.target.value)}
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                >
                                    {verifiedHubs.map(h => (
                                        <option key={h.id} value={h.id}>{h.organization_name} ({h.district})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Professional Bio</label>
                                <textarea
                                    value={reviewerForm.data.bio}
                                    onChange={(e) => reviewerForm.setData('bio', e.target.value)}
                                    placeholder="Clinical experience in adolescent reproductive healthcare and community MHM..."
                                    rows="2"
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={reviewerForm.processing}
                            className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition active:scale-98 flex items-center justify-center space-x-2"
                        >
                            <span>Enter Medical Review Portal</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {/* ROLE 5: DONOR SPONSOR WIZARD */}
                {role === 'donor_sponsor' && (
                    <form onSubmit={handleSponsorSubmit} className="space-y-3.5">
                        <div className="bg-white p-4 rounded-3xl border border-rose-150 shadow-2xs space-y-3">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                                Sponsor Dignity Preferences
                            </span>
                            <label className="flex items-center space-x-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sponsorForm.data.donor_default_anonymous}
                                    onChange={(e) => sponsorForm.setData('donor_default_anonymous', e.target.checked)}
                                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                                />
                                <span className="text-xs text-slate-800 font-bold">
                                    Display donations as "Anonymous Friend" by default
                                </span>
                            </label>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Mobile Money Number (Airtel, MTN, or Zamtel)
                                </label>
                                <input
                                    type="tel"
                                    value={sponsorForm.data.phone}
                                    onChange={(e) => sponsorForm.setData('phone', e.target.value)}
                                    placeholder="0977 123456"
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Preferred School / Clinic to Support
                                </label>
                                <select
                                    value={sponsorForm.data.default_hub_id}
                                    onChange={(e) => sponsorForm.setData('default_hub_id', e.target.value)}
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                >
                                    {verifiedHubs.map(h => (
                                        <option key={h.id} value={h.id}>{h.organization_name} ({h.district})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={sponsorForm.processing}
                            className="w-full py-4 rounded-2xl bg-rose-600 text-white font-extrabold text-xs shadow-md transition active:scale-98 flex items-center justify-center space-x-2"
                        >
                            <span>Open Sponsorship Impact Hub</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {/* ROLE 6: ADMIN WIZARD */}
                {role === 'admin' && (
                    <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                        <div className="bg-white p-4 rounded-3xl border border-rose-150 shadow-2xs space-y-3">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                                Administrative Scope
                            </span>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Admin Department</label>
                                <select
                                    value={adminForm.data.admin_scope}
                                    onChange={(e) => adminForm.setData('admin_scope', e.target.value)}
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500"
                                >
                                    <option value="PM_M&E">Program Monitoring & Evaluation (M&E)</option>
                                    <option value="Safeguarding_Lead">Safeguarding & Case Escalation Lead</option>
                                    <option value="System_SuperAdmin">System Super Administrator</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Emergency Escalation Phone</label>
                                <input
                                    type="tel"
                                    value={adminForm.data.phone}
                                    onChange={(e) => adminForm.setData('phone', e.target.value)}
                                    placeholder="+260 97..."
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={adminForm.processing}
                            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-extrabold text-xs shadow-md transition active:scale-98 flex items-center justify-center space-x-2"
                        >
                            <span>Enter Platform Administration</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}
            </div>
        </MobileAppLayout>
    );
}

