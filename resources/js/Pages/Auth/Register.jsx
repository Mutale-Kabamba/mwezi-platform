import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from '@/i18n/LanguageContext';
import { LunaFloralBackdrop } from '@/Components/LunaSideDrawer';
import { ZAMBIA_PROVINCES, PROVINCE_NAMES } from '@/constants/zambiaLocations';
import {
    ChevronLeft,
    Eye,
    EyeOff,
    Globe,
    Heart,
    HeartHandshake,
    Building2,
    Stethoscope,
    Sparkles,
    UserCheck,
    Moon,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';

export default function Register({ initialInviteCode = '' }) {
    const { t, locale, setLocale, languages } = useTranslation();
    const [showLangMenu, setShowLangMenu] = useState(false);

    // Step 1: Role Selection | Step 2: Role-Specific Form
    const [step, setStep] = useState(initialInviteCode ? 2 : 1);

    const [rawIdentifier, setRawIdentifier] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Companion Code Verification State
    const [codeVerified, setCodeVerified] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [codeError, setCodeError] = useState('');
    const [verifiedDetails, setVerifiedDetails] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        username: '',
        contact_channel: '',
        password: '',
        password_confirmation: '',
        role: initialInviteCode ? 'trusted_contact' : 'primary_user',
        preferred_language: locale || 'en',
        invite_code: initialInviteCode,
        gender: 'female',
        has_personal_cycle: true,
        age_band: '18_24_young_adult',
        has_started_period: true,
        last_period_start: '',
        average_cycle_length: 28,
        average_period_length: 5,
        cycle_regularity: 'regular',
        typical_symptoms: [],
        preferred_product_type: 'disposable_pads',
        province: 'Lusaka',
        district: 'Lusaka',
        pin_code: '',
        organization_name: '',
        hub_type: 'ngo',
        address: '',
        clinical_specialty: '',
        hpcz_registration_number: '',
        review_locales: ['en'],
        donor_default_anonymous: false,
        child_tier_group: 'tier_1',
        child_name: '',
        child_age: 12,
        child_username: '',
        child_pin_code: '',
        luna_ai_level: 'guided',
        emergency_alerts: true,
        tip_sharing: true,
        teen_name: '',
        teen_contact_channel: '',
        remember: true,
    });

    // Verify companion invite code
    const verifyInviteCode = async (codeToVerify) => {
        const cleanCode = (codeToVerify || data.invite_code || '').trim().toUpperCase();
        if (!cleanCode) {
            setCodeError('Please enter your companion invite code.');
            return;
        }

        setIsVerifyingCode(true);
        setCodeError('');

        try {
            const res = await fetch(`/companion/verify-code?code=${encodeURIComponent(cleanCode)}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const json = await res.json();
            if (json.success && json.connection) {
                setCodeVerified(true);
                setVerifiedDetails(json.connection);
                setData((prev) => ({
                    ...prev,
                    invite_code: json.connection.invite_code,
                    name: prev.name || json.connection.contact_name || '',
                    contact_channel: json.connection.contact_channel || '',
                }));
                handleIdentifierChange(json.connection.contact_channel || '');
            } else {
                setCodeVerified(false);
                setCodeError(json.message || 'Invalid or expired invite code.');
            }
        } catch (err) {
            setCodeError('Unable to verify code right now. Please try again.');
        } finally {
            setIsVerifyingCode(false);
        }
    };

    // Auto-verify if code passed in URL
    useEffect(() => {
        if (initialInviteCode) {
            setData((prev) => ({ ...prev, role: 'trusted_contact', invite_code: initialInviteCode }));
            setStep(2);
            verifyInviteCode(initialInviteCode);
        }
    }, [initialInviteCode]);

    const availableTowns = ZAMBIA_PROVINCES[data.province] || ZAMBIA_PROVINCES.Lusaka;

    const handleProvinceChange = (nextProvince) => {
        const towns = ZAMBIA_PROVINCES[nextProvince] || [];
        setData((prev) => ({
            ...prev,
            province: nextProvince,
            district: towns[0] || '',
        }));
    };

    // Synchronize identifier input into email, phone, or username
    const handleIdentifierChange = (value) => {
        setRawIdentifier(value);
        const clean = value.trim();
        if (clean.includes('@')) {
            setData((prev) => ({ ...prev, email: clean, phone: '', username: '', contact_channel: clean }));
        } else if (/^[\d+\s()-]+$/.test(clean) && clean.replace(/\D/g, '').length >= 6) {
            setData((prev) => ({ ...prev, phone: clean, email: '', username: '', contact_channel: clean }));
        } else {
            setData((prev) => ({ ...prev, username: clean, email: '', phone: '', contact_channel: clean }));
        }
    };

    const roles = [
        {
            id: 'primary_user',
            label: 'Girl / Teen / Woman',
            desc: 'Track cycle safely, ask Luna AI, and request dignity supplies',
            icon: Heart
        },
        {
            id: 'parent_guardian',
            label: 'Parent / Guardian',
            desc: 'Register & manage ages 10–13 or link ages 14–19 with consent',
            icon: ShieldCheck
        },
        {
            id: 'trusted_contact',
            label: 'Trusted Companion',
            desc: 'Support a daughter, sister, or partner using an invite code',
            icon: HeartHandshake
        },
        {
            id: 'community_partner',
            label: 'School / NGO Hub',
            desc: 'Manage local stock and distribute emergency hygiene packs',
            icon: Building2
        },
        {
            id: 'health_reviewer',
            label: 'Clinician / Midwife',
            desc: 'Verify medical guides and provide clinical review support',
            icon: Stethoscope
        },
        {
            id: 'donor_sponsor',
            label: 'Dignity Sponsor',
            desc: 'Directly fund reusable pad kits for Zambian schoolgirls',
            icon: Sparkles
        },
    ];

    const currentRoleConfig = roles.find((r) => r.id === data.role) || roles[0];

    // Role-specific field titles and descriptions
    const getRoleFormDetails = () => {
        switch (data.role) {
            case 'parent_guardian':
                return {
                    title: 'Parent / Guardian Registration',
                    subtitle: 'Manage ages 10–13 sub-accounts or authorize ages 14–19',
                    nameLabel: 'Parent / Guardian Full Name',
                    namePlaceholder: 'e.g. Grace Banda',
                    identifierPlaceholder: 'Mobile number or Email address',
                    hasInviteCode: false,
                };
            case 'trusted_contact':
                return {
                    title: 'Companion Registration',
                    subtitle: 'Create your account to support someone in your care',
                    nameLabel: 'Your full name',
                    namePlaceholder: 'e.g. Chileshe Mulenga',
                    identifierPlaceholder: 'Mobile number or Email address',
                    hasInviteCode: true,
                };
            case 'community_partner':
                return {
                    title: 'Register Service Hub',
                    subtitle: 'For schools, health posts, and local distribution centers',
                    nameLabel: 'School or Organization name',
                    namePlaceholder: 'e.g. Play It Forward Hub - Livingstone',
                    identifierPlaceholder: 'Hub coordinator phone or official email',
                    hasInviteCode: false,
                };
            case 'health_reviewer':
                return {
                    title: 'Clinician & Midwife Portal',
                    subtitle: 'Verified health professional registration for peer review',
                    nameLabel: 'Full name & professional title',
                    namePlaceholder: 'e.g. Dr. Bupe Mwamba (OB-GYN)',
                    identifierPlaceholder: 'Clinical email or phone number',
                    hasInviteCode: false,
                };
            case 'donor_sponsor':
                return {
                    title: 'Join as Dignity Sponsor',
                    subtitle: 'Support menstrual dignity packs for vulnerable girls',
                    nameLabel: 'Your name or organization',
                    namePlaceholder: 'e.g. Natasha Banda (or Anonymous)',
                    identifierPlaceholder: 'Mobile Money phone (Airtel/MTN) or Email',
                    hasInviteCode: false,
                };
            case 'primary_user':
            default:
                return {
                    title: 'Welcome to Mwezi',
                    subtitle: 'Kindly fill in your details to get started',
                    nameLabel: 'Your name or nickname',
                    namePlaceholder: 'Full name or preferred nickname',
                    identifierPlaceholder: 'Phone number or Email address',
                    hasInviteCode: false,
                };
        }
    };

    const roleDetails = getRoleFormDetails();

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#F8EAE6] flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-purple-200/60 selection:text-[#2D2638]">
            <Head title="Sign Up - Mwezi" />

            {/* Ambient Soft Pastel Mesh Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-28 -left-24 h-[420px] w-[420px] rounded-full bg-[#FADCD3] opacity-90 blur-3xl" />
                <div className="absolute top-1/4 -right-28 h-[460px] w-[460px] rounded-full bg-[#D8C2FA] opacity-75 blur-3xl" />
                <div className="absolute -bottom-32 left-1/4 h-[440px] w-[440px] rounded-full bg-[#F3D2E5] opacity-85 blur-3xl" />
                <div className="absolute bottom-10 right-10 h-[300px] w-[300px] rounded-full bg-[#E5D4FC] opacity-70 blur-3xl" />
            </div>

            {/* Minimal Frosted Glass Card */}
            <div className="relative z-10 w-full max-w-[430px] max-h-[92vh] rounded-[36px] bg-white/45 backdrop-blur-2xl border border-white/80 shadow-[0_24px_60px_-15px_rgba(92,71,112,0.16)] px-7 py-6 flex flex-col justify-between overflow-hidden">
                <LunaFloralBackdrop />

                {/* 1. TOP MINIMAL UTILITY & BRAND HEADER */}
                <div className="shrink-0 select-none pb-3">
                    <div className="flex items-center justify-between text-xs">
                        {step === 2 ? (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="p-2 -ml-2 rounded-full text-[#5E546B] hover:text-[#2D2638] hover:bg-white/60 transition active:scale-95"
                                aria-label="Back to role selection"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        ) : (
                            <Link
                                href="/"
                                className="p-2 -ml-2 rounded-full text-[#5E546B] hover:text-[#2D2638] hover:bg-white/60 transition active:scale-95"
                                aria-label="Back"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                        )}

                        <div className="flex items-center space-x-2">
                            {/* Language Switcher */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowLangMenu(!showLangMenu)}
                                    className="inline-flex items-center space-x-1.5 rounded-full bg-white/55 hover:bg-white/80 border border-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#3C334B] transition"
                                    title="Choose Language"
                                >
                                    <Globe className="w-3 h-3 text-[#6E637C]" />
                                    <span className="uppercase">{locale}</span>
                                </button>

                                {showLangMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowLangMenu(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl border border-white py-1.5 z-50 text-[#2D2638]">
                                            {languages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    type="button"
                                                    onClick={() => {
                                                        setLocale(lang.code);
                                                        setShowLangMenu(false);
                                                    }}
                                                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition ${locale === lang.code ? 'bg-purple-50 text-[#2D2638] font-bold' : 'text-[#5E546B] hover:bg-slate-50/80'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <span>{lang.flag}</span>
                                                        <span>{lang.localName}</span>
                                                    </div>
                                                    {locale === lang.code && (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <Link
                                href="/login"
                                className="rounded-full bg-white/60 hover:bg-white/85 border border-white/85 px-3 py-1 text-[11px] font-semibold text-[#2D2638] transition active:scale-95"
                            >
                                {t('auth_log_in', 'Log in')}
                            </Link>
                        </div>
                    </div>

                    {/* Centered Minimal Brand Header */}
                    <div className="text-center pt-1">
                        <div className="inline-flex items-center space-x-2 text-[#2D2638]">
                            <div className="w-7 h-7 rounded-full bg-white/75 border border-white flex items-center justify-center shadow-xs">
                                <Moon className="w-4 h-4 text-[#3D334D]" strokeWidth={2.2} />
                            </div>
                            <span className="text-lg font-bold tracking-tight">Mwezi</span>
                        </div>
                        <p className="text-[11px] font-medium text-[#6E637C] mt-0.5">
                            {t('app_subtitle', 'Menstrual Health & Dignity')}
                        </p>
                    </div>
                </div>

                {/* 2. MAIN CONTENT AREA */}
                <div className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto hide-scrollbar pr-0.5 z-10">

                    {/* STEP 1: ROLE SELECTION (Appears BEFORE the registration form) */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="text-center pt-1">
                                <h1 className="text-2xl font-bold text-[#2D2638] tracking-tight">
                                    I am joining as:
                                </h1>
                                <p className="text-xs text-[#5E546B] font-normal mt-1">
                                    Select your role to customize your Mwezi experience
                                </p>
                            </div>

                            {/* Role Selection Cards */}
                            <div className="space-y-2 pt-1">
                                {roles.map((r) => {
                                    const IconComponent = r.icon;
                                    const isSelected = data.role === r.id;
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setData('role', r.id)}
                                            className={`w-full p-3 rounded-2xl text-left transition border flex items-center justify-between group ${isSelected
                                                ? 'bg-white/85 border-[#9B7BB8] shadow-xs'
                                                : 'bg-white/55 border-white/85 hover:bg-white/75'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3 min-w-0 pr-2">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${isSelected ? 'bg-[#3D334D] text-white shadow-xs' : 'bg-white/80 text-[#5E546B] group-hover:bg-white'
                                                    }`}>
                                                    <IconComponent className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#2D2638]' : 'text-[#3C334B]'}`}>
                                                        {r.label}
                                                    </p>
                                                    <p className="text-[10px] text-[#6E637C] mt-0.5 line-clamp-1">
                                                        {r.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Selection Radio Indicator */}
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition ${isSelected
                                                ? 'border-[#3D334D] bg-[#3D334D]'
                                                : 'border-[#B9AEC7] bg-white/70'
                                                }`}>
                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Continue Button to Step 2 */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full rounded-full bg-white/80 hover:bg-white border border-white/95 shadow-[0_10px_28px_-8px_rgba(92,71,112,0.18)] px-6 py-3.5 flex items-center justify-between text-[#2D2638] font-semibold text-sm transition active:scale-[0.99]"
                                >
                                    <span>Continue to Registration</span>
                                    <ArrowRight className="w-4 h-4 text-[#2D2638]" />
                                </button>
                            </div>

                            {/* Sublink */}
                            <div className="text-center pt-0.5 text-xs text-[#5E546B]">
                                <span>{t('auth_already_have_account', 'Have an account?')} </span>
                                <Link
                                    href="/login"
                                    className="text-[#2D2638] font-bold hover:underline"
                                >
                                    {t('auth_log_in', 'Log in')}
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: ROLE-SPECIFIC REGISTRATION FORM */}
                    {step === 2 && (
                        <div className="space-y-3.5 animate-fadeIn">
                            {/* Role Badge & Back / Change Role Shortcut */}
                            <div className="flex items-center justify-between bg-white/65 p-2.5 px-3.5 rounded-2xl border border-white/90">
                                <div className="flex items-center space-x-2">
                                    <currentRoleConfig.icon className="w-4 h-4 text-[#3D334D]" />
                                    <span className="text-xs font-bold text-[#2D2638]">{currentRoleConfig.label}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        setCodeVerified(false);
                                        setVerifiedDetails(null);
                                    }}
                                    className="text-[11px] font-semibold text-[#5E546B] hover:text-[#2D2638] hover:underline"
                                >
                                    Change
                                </button>
                            </div>

                            {/* SPECIAL FLOW FOR COMPANION: STEP 2A - ENTER CODE */}
                            {data.role === 'trusted_contact' && !codeVerified ? (
                                <div className="space-y-4 pt-1 animate-fadeIn">
                                    <div className="text-center pt-0.5">
                                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                            Enter Companion Invite Code
                                        </h1>
                                        <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                                            Enter the code shared with you. Your details entered by the primary user will pop up automatically.
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Companion Code
                                            </label>
                                            <input
                                                type="text"
                                                value={data.invite_code}
                                                onChange={(e) => {
                                                    setData('invite_code', e.target.value.toUpperCase());
                                                    setCodeError('');
                                                }}
                                                placeholder="e.g. MWEZI-1234-ABCD"
                                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm font-mono font-bold tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:text-xs uppercase focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] transition shadow-2xs"
                                                autoFocus
                                            />
                                            {codeError && (
                                                <p className="text-[11px] text-[#C81E3D] mt-1.5 pl-1 font-medium flex items-center space-x-1">
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{codeError}</span>
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isVerifyingCode || !data.invite_code.trim()}
                                            onClick={() => verifyInviteCode(data.invite_code)}
                                            className="w-full py-3.5 rounded-xl bg-[#C81E3D] hover:bg-[#B01733] active:scale-[0.99] text-white font-semibold text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                                        >
                                            {isVerifyingCode ? (
                                                <span className="flex items-center space-x-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Finding Invitation...</span>
                                                </span>
                                            ) : (
                                                <>
                                                    <span>Find My Invitation</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100 text-[11px] text-slate-600 space-y-1">
                                        <p className="font-semibold text-slate-800">Need a code?</p>
                                        <p>Ask the girl, teen, or woman you're supporting to invite you from their "Trusted Circle" in the Mwezi app.</p>
                                    </div>
                                </div>
                            ) : (
                                /* STEP 2B - REGISTRATION FORM (OR COMPANION PASSWORD SETUP AFTER VERIFICATION) */
                                <div className="space-y-3.5 pt-0.5">
                                    {/* COMPANION POPUP CARD SHOWING PRIMARY USER'S DETAILS */}
                                    {data.role === 'trusted_contact' && codeVerified && (
                                        <div className="bg-gradient-to-r from-emerald-50 via-rose-50/50 to-emerald-50 p-3.5 rounded-2xl border border-emerald-200/90 shadow-2xs space-y-1.5 animate-fadeIn">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                    <span>Invitation Verified!</span>
                                                </div>
                                                <span className="font-mono text-[10px] font-bold text-slate-600 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200">
                                                    {data.invite_code}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-700">
                                                Invited by <strong className="text-slate-900">{verifiedDetails?.primary_user_name}</strong> as their <span className="font-semibold capitalize text-[#C81E3D]">{verifiedDetails?.relationship}</span> companion.
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                                Your details were pre-filled below. You can edit them if needed, then set your password.
                                            </p>
                                        </div>
                                    )}

                                    {/* Centered Heading */}
                                    <div className="text-center pt-0.5">
                                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                            {data.role === 'trusted_contact' ? 'Set Your Password' : roleDetails.title}
                                        </h1>
                                        <p className="text-xs text-slate-500 font-normal mt-0.5">
                                            {data.role === 'trusted_contact'
                                                ? 'Create your password to complete setup and activate companion view'
                                                : roleDetails.subtitle
                                            }
                                        </p>
                                    </div>

                                    {/* Sign Up Form */}
                                    <form onSubmit={submit} className="space-y-3 pt-1">
                                        {/* Name Input tailored to Role (Editable) */}
                                        <div>
                                            {data.role === 'trusted_contact' && (
                                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                    Your Name (as entered by primary user, editable)
                                                </label>
                                            )}
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder={roleDetails.namePlaceholder}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] transition shadow-2xs"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="text-[11px] text-[#C81E3D] mt-1 pl-1 font-medium">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Email address / Phone number tailored to Role (Editable) */}
                                        <div>
                                            {data.role === 'trusted_contact' && (
                                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                    Mobile Number or Email (editable)
                                                </label>
                                            )}
                                            <input
                                                type="text"
                                                value={rawIdentifier}
                                                onChange={(e) => handleIdentifierChange(e.target.value)}
                                                placeholder={roleDetails.identifierPlaceholder}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] transition shadow-2xs"
                                                required
                                            />
                                            {(errors.email || errors.phone || errors.username) && (
                                                <p className="text-[11px] text-[#C81E3D] mt-1 pl-1 font-medium">
                                                    {errors.email || errors.phone || errors.username}
                                                </p>
                                            )}
                                        </div>

                                        {/* ROLE-SPECIFIC DYNAMIC FIELDS (Step 2) */}
                                        {data.role === 'primary_user' && (
                                            <div className="space-y-2.5 pt-0.5">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Age Cohort</label>
                                                    <select
                                                        value={data.age_band}
                                                        onChange={(e) => setData('age_band', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] bg-white"
                                                    >
                                                        <option value="14_17_secondary">Secondary School (14–17 yrs)</option>
                                                        <option value="18_24_young_adult">Young Adult (18–24 yrs)</option>
                                                        <option value="25_plus">Adult (25+ yrs)</option>
                                                    </select>
                                                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                                                        <span>Ages 10–13 must be managed by a parent.</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setData('role', 'parent_guardian')}
                                                            className="font-bold text-[#C81E3D] hover:underline"
                                                        >
                                                            Parent Registration →
                                                        </button>
                                                    </div>
                                                    {errors.age_band && (
                                                        <p className="text-[11px] text-[#C81E3D] mt-1 pl-1 font-medium">{errors.age_band}</p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Province</label>
                                                        <select
                                                            value={data.province}
                                                            onChange={(e) => handleProvinceChange(e.target.value)}
                                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C81E3D] bg-white"
                                                        >
                                                            {PROVINCE_NAMES.map((prov) => (
                                                                <option key={prov} value={prov}>{prov}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Town / District</label>
                                                        <select
                                                            value={data.district}
                                                            onChange={(e) => setData('district', e.target.value)}
                                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C81E3D] bg-white"
                                                        >
                                                            {availableTowns.map((town) => (
                                                                <option key={town} value={town}>{town}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <input
                                                    type="password"
                                                    inputMode="numeric"
                                                    maxLength={4}
                                                    value={data.pin_code}
                                                    onChange={(e) => setData('pin_code', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                    placeholder="Optional 4-digit Quick-Lock PIN"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C81E3D]"
                                                />

                                                {/* Vital Menstrual Health Data Collection */}
                                                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 space-y-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-bold text-slate-800">Have you started your menstrual cycle?</span>
                                                        <div className="flex space-x-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setData('has_started_period', true)}
                                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${data.has_started_period
                                                                    ? 'bg-[#C81E3D] text-white'
                                                                    : 'bg-white text-slate-600 border border-slate-200'
                                                                    }`}
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setData('has_started_period', false)}
                                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${!data.has_started_period
                                                                    ? 'bg-[#C81E3D] text-white'
                                                                    : 'bg-white text-slate-600 border border-slate-200'
                                                                    }`}
                                                            >
                                                                Not yet
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {data.has_started_period && (
                                                        <div className="space-y-2 pt-1">
                                                            <div>
                                                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                                    Last Menstrual Period (LMP) Date
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    value={data.last_period_start}
                                                                    max={new Date().toISOString().split('T')[0]}
                                                                    onChange={(e) => setData('last_period_start', e.target.value)}
                                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#C81E3D]"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cycle Length (days)</label>
                                                                    <input
                                                                        type="number"
                                                                        min={18}
                                                                        max={60}
                                                                        value={data.average_cycle_length}
                                                                        onChange={(e) => setData('average_cycle_length', Number(e.target.value))}
                                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#C81E3D]"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Period Duration (days)</label>
                                                                    <input
                                                                        type="number"
                                                                        min={1}
                                                                        max={14}
                                                                        value={data.average_period_length}
                                                                        onChange={(e) => setData('average_period_length', Number(e.target.value))}
                                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#C81E3D]"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cycle Regularity</label>
                                                                    <select
                                                                        value={data.cycle_regularity}
                                                                        onChange={(e) => setData('cycle_regularity', e.target.value)}
                                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#C81E3D]"
                                                                    >
                                                                        <option value="regular">Regular</option>
                                                                        <option value="irregular">Irregular</option>
                                                                        <option value="unsure">Unsure</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Preferred Product</label>
                                                                    <select
                                                                        value={data.preferred_product_type}
                                                                        onChange={(e) => setData('preferred_product_type', e.target.value)}
                                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#C81E3D]"
                                                                    >
                                                                        <option value="disposable_pads">Disposable pads</option>
                                                                        <option value="reusable_pads">Reusable pads</option>
                                                                        <option value="cloth">Cloth</option>
                                                                        <option value="both">Both</option>
                                                                        <option value="need_supplies">Need supplies</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[11px] font-semibold text-slate-700 mb-1">Typical Cycle Symptoms</span>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {['Cramps', 'Fatigue', 'Mood changes', 'Headaches', 'Bloating', 'Backache'].map((sym) => {
                                                                        const active = data.typical_symptoms.includes(sym);
                                                                        return (
                                                                            <button
                                                                                key={sym}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const next = active
                                                                                        ? data.typical_symptoms.filter((s) => s !== sym)
                                                                                        : [...data.typical_symptoms, sym];
                                                                                    setData('typical_symptoms', next);
                                                                                }}
                                                                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${active
                                                                                    ? 'bg-[#C81E3D] text-white border-[#C81E3D]'
                                                                                    : 'bg-white text-slate-600 border-slate-200'
                                                                                    }`}
                                                                            >
                                                                                {sym}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {data.role === 'parent_guardian' && (
                                            <div className="space-y-2.5 pt-0.5">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Parent / Guardian Profile</label>
                                                    <select
                                                        value={data.gender === 'male' ? 'male' : (data.has_personal_cycle ? 'female_active' : 'female_past')}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === 'male') {
                                                                setData((prev) => ({ ...prev, gender: 'male', has_personal_cycle: false }));
                                                            } else if (val === 'female_past') {
                                                                setData((prev) => ({ ...prev, gender: 'female', has_personal_cycle: false }));
                                                            } else {
                                                                setData((prev) => ({ ...prev, gender: 'female', has_personal_cycle: true }));
                                                            }
                                                        }}
                                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C81E3D] bg-white"
                                                    >
                                                        <option value="female_active">Mother / Female Guardian (currently having cycles)</option>
                                                        <option value="female_past">Mother / Female Guardian (past cycle age)</option>
                                                        <option value="male">Father / Male Guardian (no personal tracker)</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Province</label>
                                                        <select
                                                            value={data.province}
                                                            onChange={(e) => handleProvinceChange(e.target.value)}
                                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C81E3D] bg-white"
                                                        >
                                                            {PROVINCE_NAMES.map((prov) => (
                                                                <option key={prov} value={prov}>{prov}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Town / District</label>
                                                        <select
                                                            value={data.district}
                                                            onChange={(e) => setData('district', e.target.value)}
                                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C81E3D] bg-white"
                                                        >
                                                            {availableTowns.map((town) => (
                                                                <option key={town} value={town}>{town}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 space-y-2.5">
                                                    <span className="block text-[11px] font-bold text-slate-800">
                                                        Select Child Age Group(s) You Manage
                                                    </span>
                                                    <div className="grid grid-cols-3 gap-1.5">
                                                        {[
                                                            { id: 'tier_1', label: 'Ages 10–13' },
                                                            { id: 'tier_2', label: 'Ages 14–19' },
                                                            { id: 'both', label: 'Both' },
                                                        ].map((opt) => (
                                                            <button
                                                                key={opt.id}
                                                                type="button"
                                                                onClick={() => setData('child_tier_group', opt.id)}
                                                                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${data.child_tier_group === opt.id
                                                                    ? 'bg-[#C81E3D] text-white border-[#C81E3D]'
                                                                    : 'bg-white text-slate-600 border-slate-200'
                                                                    }`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {(data.child_tier_group === 'tier_1' || data.child_tier_group === 'both') && (
                                                        <div className="space-y-2 pt-1 border-t border-rose-100">
                                                            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#C81E3D]">
                                                                Ages 10–13 Sub-Account (Parent-Managed)
                                                            </span>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={data.child_name}
                                                                    onChange={(e) => setData('child_name', e.target.value)}
                                                                    placeholder="Child First Name"
                                                                    required
                                                                    className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#C81E3D]"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    min={10}
                                                                    max={13}
                                                                    value={data.child_age}
                                                                    onChange={(e) => setData('child_age', Number(e.target.value))}
                                                                    placeholder="Age"
                                                                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#C81E3D]"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={data.child_username}
                                                                    onChange={(e) => setData('child_username', e.target.value)}
                                                                    placeholder="Child Username"
                                                                    required
                                                                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#C81E3D]"
                                                                />
                                                                <input
                                                                    type="password"
                                                                    inputMode="numeric"
                                                                    maxLength={4}
                                                                    value={data.child_pin_code}
                                                                    onChange={(e) => setData('child_pin_code', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                                    placeholder="4-Digit Child PIN"
                                                                    required
                                                                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#C81E3D]"
                                                                />
                                                            </div>
                                                            {(errors.child_name || errors.child_username || errors.child_pin_code) && (
                                                                <p className="text-[11px] text-[#C81E3D] font-medium">
                                                                    {errors.child_name || errors.child_username || errors.child_pin_code}
                                                                </p>
                                                            )}
                                                            <select
                                                                value={data.luna_ai_level}
                                                                onChange={(e) => setData('luna_ai_level', e.target.value)}
                                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#C81E3D]"
                                                            >
                                                                <option value="guided">Luna AI: Guided (Age-Appropriate)</option>
                                                                <option value="restricted">Luna AI: Restricted (Basic FAQ)</option>
                                                                <option value="full">Luna AI: Full Access</option>
                                                            </select>
                                                            <div className="flex items-center justify-between text-[11px] text-slate-700">
                                                                <label className="flex items-center space-x-1.5 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={data.emergency_alerts}
                                                                        onChange={(e) => setData('emergency_alerts', e.target.checked)}
                                                                        className="rounded text-[#C81E3D]"
                                                                    />
                                                                    <span>Emergency Alerts</span>
                                                                </label>
                                                                <label className="flex items-center space-x-1.5 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={data.tip_sharing}
                                                                        onChange={(e) => setData('tip_sharing', e.target.checked)}
                                                                        className="rounded text-[#C81E3D]"
                                                                    />
                                                                    <span>Tip Sharing</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(data.child_tier_group === 'tier_2' || data.child_tier_group === 'both') && (
                                                        <div className="space-y-2 pt-1 border-t border-rose-100">
                                                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                                                                Ages 14–19 Consent & Join Invite
                                                            </span>
                                                            <input
                                                                type="text"
                                                                value={data.teen_name}
                                                                onChange={(e) => setData('teen_name', e.target.value)}
                                                                placeholder="Teen First Name (optional now)"
                                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#C81E3D]"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={data.teen_contact_channel}
                                                                onChange={(e) => setData('teen_contact_channel', e.target.value)}
                                                                placeholder="Teen Phone or Email (for invite)"
                                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#C81E3D]"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {data.role === 'community_partner' && (
                                            <div className="space-y-2.5 pt-0.5">
                                                <input
                                                    type="text"
                                                    value={data.organization_name}
                                                    onChange={(e) => setData('organization_name', e.target.value)}
                                                    placeholder="Organization / Hub Name"
                                                    required
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C81E3D]"
                                                />
                                                <select
                                                    value={data.hub_type}
                                                    onChange={(e) => setData('hub_type', e.target.value)}
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C81E3D] bg-white"
                                                >
                                                    <option value="school">School</option>
                                                    <option value="ngo">NGO / Community Org</option>
                                                    <option value="clinic">Health Clinic</option>
                                                    <option value="pharmacy">Pharmacy</option>
                                                    <option value="youth_center">Youth Center</option>
                                                    <option value="safe_space">Safe Space</option>
                                                </select>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Province</label>
                                                        <select
                                                            value={data.province}
                                                            onChange={(e) => handleProvinceChange(e.target.value)}
                                                            required
                                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C81E3D] bg-white"
                                                        >
                                                            {PROVINCE_NAMES.map((prov) => (
                                                                <option key={prov} value={prov}>{prov}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Town / District</label>
                                                        <select
                                                            value={data.district}
                                                            onChange={(e) => setData('district', e.target.value)}
                                                            required
                                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C81E3D] bg-white"
                                                        >
                                                            {availableTowns.map((town) => (
                                                                <option key={town} value={town}>{town}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    placeholder="Physical Address / Plot No."
                                                    required
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C81E3D]"
                                                />
                                            </div>
                                        )}

                                        {data.role === 'health_reviewer' && (
                                            <div className="space-y-2.5 pt-0.5">
                                                <input
                                                    type="text"
                                                    value={data.clinical_specialty}
                                                    onChange={(e) => setData('clinical_specialty', e.target.value)}
                                                    placeholder="Clinical Specialty (e.g. Midwifery, OB-GYN)"
                                                    required
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C81E3D]"
                                                />
                                                <input
                                                    type="text"
                                                    value={data.hpcz_registration_number}
                                                    onChange={(e) => setData('hpcz_registration_number', e.target.value)}
                                                    placeholder="HPCZ Registration Number"
                                                    required
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C81E3D]"
                                                />
                                                <div>
                                                    <span className="block text-[11px] font-semibold text-slate-700 mb-1">Review Locales</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {['en', 'bem', 'nya', 'toi', 'loz'].map((loc) => {
                                                            const active = data.review_locales.includes(loc);
                                                            return (
                                                                <button
                                                                    key={loc}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const next = active
                                                                            ? data.review_locales.filter((l) => l !== loc)
                                                                            : [...data.review_locales, loc];
                                                                        setData('review_locales', next.length ? next : ['en']);
                                                                    }}
                                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase border transition ${active
                                                                        ? 'bg-[#C81E3D] text-white border-[#C81E3D]'
                                                                        : 'bg-white text-slate-600 border-slate-200'
                                                                        }`}
                                                                >
                                                                    {loc}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {data.role === 'donor_sponsor' && (
                                            <div className="pt-0.5">
                                                <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none bg-rose-50/60 border border-rose-100 rounded-xl px-3 py-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.donor_default_anonymous}
                                                        onChange={(e) => setData('donor_default_anonymous', e.target.checked)}
                                                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#C81E3D] focus:ring-[#C81E3D]"
                                                    />
                                                    <span className="text-[11px] font-medium text-slate-700">
                                                        Keep my sponsorships anonymous by default
                                                    </span>
                                                </label>
                                            </div>
                                        )}

                                        {/* Password with Eye Toggle */}
                                        <div>
                                            {data.role === 'trusted_contact' && (
                                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                    Create Password
                                                </label>
                                            )}
                                            <div className="relative flex items-center">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="Password (minimum 8 characters)"
                                                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] transition shadow-2xs"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition"
                                                    tabIndex={-1}
                                                    aria-label="Toggle password visibility"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-[11px] text-[#C81E3D] mt-1 pl-1 font-medium">{errors.password}</p>
                                            )}
                                        </div>

                                        {/* Confirm Password with Eye Toggle */}
                                        <div>
                                            {data.role === 'trusted_contact' && (
                                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                    Confirm Password
                                                </label>
                                            )}
                                            <div className="relative flex items-center">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder="Confirm password"
                                                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] transition shadow-2xs"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition"
                                                    tabIndex={-1}
                                                    aria-label="Toggle confirm password visibility"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.password_confirmation && (
                                                <p className="text-[11px] text-[#C81E3D] mt-1 pl-1 font-medium">{errors.password_confirmation}</p>
                                            )}
                                        </div>

                                        {/* Remember me Checkbox */}
                                        <div className="pt-0.5">
                                            <label className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={data.remember}
                                                    onChange={(e) => setData('remember', e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#C81E3D] focus:ring-[#C81E3D] transition"
                                                />
                                                <span className="text-[11px] text-slate-600 font-normal">
                                                    {t('auth_remember_me', 'Remember me')}
                                                </span>
                                            </label>
                                        </div>

                                        {/* Main Action Button */}
                                        <div className="pt-1">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full rounded-full bg-white/80 hover:bg-white border border-white/95 shadow-[0_10px_28px_-8px_rgba(92,71,112,0.18)] px-6 py-3.5 flex items-center justify-between text-[#2D2638] font-semibold text-sm transition active:scale-[0.99] disabled:opacity-60"
                                            >
                                                <span>
                                                    {processing
                                                        ? t('loading', 'Creating account...')
                                                        : (data.role === 'trusted_contact' ? 'Create Password & Done' : t('auth_create_account', 'Create account'))
                                                    }
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-[#2D2638]" />
                                            </button>
                                        </div>

                                        {/* If companion, option to re-enter code */}
                                        {data.role === 'trusted_contact' && (
                                            <div className="text-center pt-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCodeVerified(false);
                                                        setVerifiedDetails(null);
                                                    }}
                                                    className="text-[11px] text-[#5E546B] hover:text-[#2D2638] underline"
                                                >
                                                    Use a different invite code
                                                </button>
                                            </div>
                                        )}

                                        {/* Direct Sublink */}
                                        <div className="text-center pt-0.5 text-xs text-[#5E546B]">
                                            <span>{t('auth_already_have_account', 'Have an account?')} </span>
                                            <Link
                                                href="/login"
                                                className="text-[#2D2638] font-bold hover:underline"
                                            >
                                                {t('auth_log_in', 'Log in')}
                                            </Link>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. BOTTOM SECTION: Divider & Social/Quick Sign-In Icons */}
                    <div className="pt-4 space-y-3">
                        {/* Divider */}
                        <div className="relative flex items-center justify-center">
                            <div className="w-full border-t border-white/70" />
                            <span className="px-3 text-[11px] text-[#7A6F8A] font-medium shrink-0">
                                Or continue with
                            </span>
                            <div className="w-full border-t border-white/70" />
                        </div>

                        {/* Social / Quick Sign In Icon Buttons: Google & Demo Roles */}
                        <div className="flex items-center justify-center space-x-10 pt-1">
                            {/* Google Button */}
                            <div className="flex flex-col items-center space-y-1">
                                <Link
                                    href="/login"
                                    className="w-11 h-11 rounded-full bg-white/65 hover:bg-white border border-white/90 flex items-center justify-center transition active:scale-95 shadow-xs"
                                    title="Sign up with Google"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
                                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.37 7.31 24 12 24z" />
                                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.04.01 12c0 1.96.45 3.8 1.26 5.42l4.01-3.15z" />
                                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                                    </svg>
                                </Link>
                                <span className="text-[11px] text-[#5E546B] font-medium">Google</span>
                            </div>

                            {/* Demo Roles Shortcut Button */}
                            <div className="flex flex-col items-center space-y-1">
                                <Link
                                    href="/login"
                                    className="w-11 h-11 rounded-full bg-white/65 hover:bg-white border border-white/90 flex items-center justify-center text-[#3D334D] transition active:scale-95 shadow-xs"
                                    title="Explore Demo Accounts"
                                >
                                    <UserCheck className="w-5 h-5" />
                                </Link>
                                <span className="text-[11px] text-[#5E546B] font-medium">Demo Roles</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
