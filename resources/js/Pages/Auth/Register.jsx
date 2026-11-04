import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from '@/i18n/LanguageContext';
import { 
    ChevronLeft, 
    Eye, 
    EyeOff, 
    Wifi, 
    BatteryMedium, 
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
    const [currentTime, setCurrentTime] = useState('09:41');

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
        remember: true,
    });

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}`);
        };
        updateClock();
        const timer = setInterval(updateClock, 30000);
        return () => clearInterval(timer);
    }, []);

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
        <div className="min-h-screen bg-gradient-to-tr from-[#FBECEF] via-[#F4F1F4] to-[#EBF3F5] flex items-center justify-center p-0 sm:py-6 sm:px-4 font-sans selection:bg-rose-100 selection:text-rose-900">
            <Head title="Sign Up - Mwezi" />

            {/* NATIVE PHONE FRAME */}
            <div className="w-full max-w-[420px] h-screen sm:h-[840px] sm:max-h-[92vh] bg-white sm:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(112,38,56,0.22)] sm:border-[8px] sm:border-slate-900/90 sm:ring-1 sm:ring-black/10 relative flex flex-col justify-between overflow-hidden">
                
                {/* 1. TOP SOLID RED ROUNDED HEADER SECTION (Matches Onboarding & Login) */}
                <div className="bg-[#BE123C] text-white shrink-0 relative pt-3 pb-7 px-5 select-none flex flex-col justify-between rounded-b-[32px] z-20">
                    
                    {/* Integrated Phone Notification Bar */}
                    <div className="w-full px-1 pb-2 flex items-center justify-between text-xs font-semibold">
                        <span className="font-bold tracking-tight text-[11px] text-white">{currentTime}</span>
                        
                        {/* Native Pill Dynamic Island */}
                        <div className="w-20 h-4 bg-slate-950/75 rounded-full flex items-center justify-center shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
                            <div className="w-2.5 h-1 rounded-full bg-slate-800" />
                        </div>

                        <div className="flex items-center space-x-1.5 text-white/95">
                            <Wifi className="w-3.5 h-3.5" />
                            <BatteryMedium className="w-4 h-4 text-emerald-300" />
                        </div>
                    </div>

                    {/* Top Action Navigation Bar */}
                    <div className="flex items-center justify-between pt-1">
                        {step === 2 ? (
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="p-1.5 -ml-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                                aria-label="Back to role selection"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        ) : (
                            <Link 
                                href="/" 
                                className="p-1.5 -ml-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                                aria-label="Back"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                        )}

                        <div className="flex items-center space-x-2 text-xs">
                            {/* Header Language Selector */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowLangMenu(!showLangMenu)}
                                    className="p-1 px-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold border border-white/20 backdrop-blur-sm shadow-xs transition flex items-center space-x-1"
                                    title="Choose Language"
                                >
                                    <Globe className="w-3 h-3 text-rose-200" />
                                    <span className="uppercase">{locale}</span>
                                </button>

                                {showLangMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowLangMenu(false)} />
                                        <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-2xl shadow-xl border border-rose-100 py-1 z-50 text-slate-800">
                                            {languages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    type="button"
                                                    onClick={() => {
                                                        setLocale(lang.code);
                                                        setShowLangMenu(false);
                                                    }}
                                                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition ${
                                                        locale === lang.code ? 'bg-rose-50 text-rose-700 font-bold' : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span>{lang.name}</span>
                                                    <span className="text-[10px] text-slate-400">{lang.localName}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <Link 
                                href="/login" 
                                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold border border-white/20 backdrop-blur-sm shadow-xs transition active:scale-95"
                            >
                                {t('auth_log_in', 'Log in')}
                            </Link>
                        </div>
                    </div>

                    {/* Centered Brand Title */}
                    <div className="text-center pt-3 pb-1">
                        <div className="inline-flex items-center space-x-2.5">
                            <Moon className="w-6 h-6 text-rose-200 fill-rose-200/30" />
                            <span className="font-black text-3xl tracking-tight text-white font-sans drop-shadow-xs">
                                Mwezi
                            </span>
                        </div>
                        <p className="text-[11px] text-rose-100 font-medium tracking-wide mt-0.5">
                            {t('app_subtitle', 'Menstrual Health & Dignity')}
                        </p>
                    </div>
                </div>

                {/* 2. MAIN CONTENT AREA */}
                <div className="bg-white px-7 pt-4 pb-6 flex-1 flex flex-col justify-between overflow-y-auto hide-scrollbar z-10">
                    
                    {/* STEP 1: ROLE SELECTION (Appears BEFORE the registration form) */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="text-center pt-1">
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    I am joining as:
                                </h1>
                                <p className="text-xs text-slate-500 font-normal mt-1">
                                    Select your role to customize your Mwezi experience
                                </p>
                            </div>

                            {/* Role Selection Cards */}
                            <div className="space-y-2.5 pt-1">
                                {roles.map((r) => {
                                    const IconComponent = r.icon;
                                    const isSelected = data.role === r.id;
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setData('role', r.id)}
                                            className={`w-full p-3 rounded-2xl text-left transition border flex items-center justify-between group ${
                                                isSelected
                                                    ? 'bg-rose-50/80 border-[#C81E3D] shadow-xs'
                                                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3 min-w-0 pr-2">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
                                                    isSelected ? 'bg-[#C81E3D] text-white shadow-xs' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80'
                                                }`}>
                                                    <IconComponent className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#C81E3D]' : 'text-slate-800'}`}>
                                                        {r.label}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                                        {r.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Selection Radio Indicator */}
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition ${
                                                isSelected 
                                                    ? 'border-[#C81E3D] bg-[#C81E3D]' 
                                                    : 'border-slate-300 bg-white'
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
                                    className="w-full py-3.5 rounded-xl bg-[#C81E3D] hover:bg-[#B01733] active:scale-[0.99] text-white font-semibold text-sm transition shadow-sm flex items-center justify-center space-x-2"
                                >
                                    <span>Continue to Registration</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Sublink */}
                            <div className="text-center pt-0.5 text-xs text-slate-500">
                                <span>{t('auth_already_have_account', 'Have an account?')} </span>
                                <Link 
                                    href="/login" 
                                    className="text-[#C81E3D] font-semibold hover:underline"
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
                            <div className="flex items-center justify-between bg-slate-50 p-2 px-3 rounded-xl border border-slate-200">
                                <div className="flex items-center space-x-2">
                                    <currentRoleConfig.icon className="w-4 h-4 text-[#C81E3D]" />
                                    <span className="text-xs font-bold text-slate-800">{currentRoleConfig.label}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        setCodeVerified(false);
                                        setVerifiedDetails(null);
                                    }}
                                    className="text-[11px] font-semibold text-[#C81E3D] hover:underline"
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
                                                className="w-full py-3.5 rounded-xl bg-[#C81E3D] hover:bg-[#B01733] active:scale-[0.99] text-white font-semibold text-sm transition shadow-sm disabled:opacity-60"
                                            >
                                                {processing 
                                                    ? t('loading', 'Creating account...') 
                                                    : (data.role === 'trusted_contact' ? 'Create Password & Done' : t('auth_create_account', 'Create account'))
                                                }
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
                                                    className="text-[11px] text-slate-500 hover:text-slate-700 underline"
                                                >
                                                    Use a different invite code
                                                </button>
                                            </div>
                                        )}

                                        {/* Direct Sublink */}
                                        <div className="text-center pt-0.5 text-xs text-slate-500">
                                            <span>{t('auth_already_have_account', 'Have an account?')} </span>
                                            <Link 
                                                href="/login" 
                                                className="text-[#C81E3D] font-semibold hover:underline"
                                            >
                                                {t('auth_log_in', 'Log in')}
                                            </Link>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. BOTTOM SECTION: Divider & Social/Quick Sign-In Icons (No Apple) */}
                    <div className="pt-4 space-y-3">
                        {/* Divider */}
                        <div className="relative flex items-center justify-center">
                            <div className="w-full border-t border-slate-200"></div>
                            <span className="absolute bg-white px-3 text-xs text-slate-400 font-medium">
                                Or
                            </span>
                        </div>

                        {/* Social / Quick Sign In Icon Buttons: Google & Demo Roles */}
                        <div className="flex items-center justify-center space-x-10 pt-1">
                            {/* Google Button */}
                            <div className="flex flex-col items-center space-y-1">
                                <Link
                                    href="/login"
                                    className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition active:scale-95 shadow-2xs"
                                    title="Sign up with Google"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.37 7.31 24 12 24z"/>
                                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.04.01 12c0 1.96.45 3.8 1.26 5.42l4.01-3.15z"/>
                                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                                    </svg>
                                </Link>
                                <span className="text-[11px] text-slate-500 font-medium">Google</span>
                            </div>

                            {/* Demo Roles Shortcut Button */}
                            <div className="flex flex-col items-center space-y-1">
                                <Link
                                    href="/login"
                                    className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-[#C81E3D] transition active:scale-95 shadow-2xs"
                                    title="Explore Demo Accounts"
                                >
                                    <UserCheck className="w-5 h-5" />
                                </Link>
                                <span className="text-[11px] text-slate-500 font-medium">Demo Roles</span>
                            </div>
                        </div>

                        {/* Bottom Phone Indicator */}
                        <div className="pt-2 text-center">
                            <div className="w-32 h-1 bg-slate-300 rounded-full opacity-60 mx-auto" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
