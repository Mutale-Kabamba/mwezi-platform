import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useTranslation } from '@/i18n/LanguageContext';
import { 
    ChevronLeft, 
    Eye, 
    EyeOff, 
    Wifi, 
    BatteryMedium, 
    Globe,
    HeartHandshake,
    Moon,
    ShieldCheck,
    CheckCircle2,
    Lock
} from 'lucide-react';

export default function CompanionSetup({ initialCode = '', connection = null }) {
    const { t, locale, setLocale, languages } = useTranslation();
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentTime, setCurrentTime] = useState('09:41');
    const [manualCode, setManualCode] = useState(initialCode);

    const { data, setData, post, processing, errors, reset } = useForm({
        invite_code: connection ? connection.invite_code : initialCode,
        name: connection ? connection.contact_name : '',
        contact_channel: connection ? connection.contact_channel : '',
        password: '',
        password_confirmation: '',
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

    const submit = (e) => {
        e.preventDefault();
        post(route('companion.setup.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleLookupCode = (e) => {
        e.preventDefault();
        if (manualCode.trim()) {
            router.get(route('companion.setup'), { code: manualCode.trim() });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#FBECEF] via-[#F4F1F4] to-[#EBF3F5] flex items-center justify-center p-0 sm:py-6 sm:px-4 font-sans selection:bg-rose-100 selection:text-rose-900">
            <Head title="Companion Setup - Mwezi" />

            {/* NATIVE PHONE FRAME */}
            <div className="w-full max-w-[420px] h-screen sm:h-[840px] sm:max-h-[92vh] bg-white sm:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(112,38,56,0.22)] sm:border-[8px] sm:border-slate-900/90 sm:ring-1 sm:ring-black/10 relative flex flex-col justify-between overflow-hidden">
                
                {/* 1. TOP SOLID RED ROUNDED HEADER SECTION */}
                <div className="bg-[#BE123C] text-white shrink-0 relative pt-3 pb-7 px-5 select-none flex flex-col justify-between rounded-b-[32px] z-20">
                    
                    {/* Status Bar */}
                    <div className="w-full px-1 pb-2 flex items-center justify-between text-xs font-semibold">
                        <span className="font-bold tracking-tight text-[11px] text-white">{currentTime}</span>
                        
                        {/* Dynamic Island */}
                        <div className="w-20 h-4 bg-slate-950/75 rounded-full flex items-center justify-center shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
                            <div className="w-2.5 h-1 rounded-full bg-slate-800" />
                        </div>

                        <div className="flex items-center space-x-1.5 text-white/95">
                            <Wifi className="w-3.5 h-3.5" />
                            <BatteryMedium className="w-4 h-4 text-emerald-300" />
                        </div>
                    </div>

                    {/* Navigation Bar */}
                    <div className="flex items-center justify-between pt-1">
                        <Link 
                            href="/" 
                            className="p-1.5 -ml-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                            aria-label="Back"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>

                        <div className="flex items-center space-x-2 text-xs">
                            {/* Language Selector */}
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
                            Trusted Companion Setup
                        </p>
                    </div>
                </div>

                {/* 2. WHITE CONTENT AREA */}
                <div className="bg-white px-7 pt-4 pb-6 flex-1 flex flex-col justify-between overflow-y-auto hide-scrollbar z-10">
                    {connection ? (
                        <div className="space-y-4 animate-fadeIn">
                            {/* Invitation Banner */}
                            <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-100 space-y-1.5">
                                <div className="flex items-center space-x-2">
                                    <HeartHandshake className="w-4 h-4 text-[#C81E3D]" />
                                    <span className="text-xs font-bold text-slate-800">Companion Invitation</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    <strong>{connection.primary_user_name}</strong> has invited you to be their Trusted Companion (<span className="capitalize">{connection.relationship}</span>).
                                </p>
                                <div className="text-[11px] text-slate-500 pt-0.5">
                                    Account Identifier: <span className="font-semibold text-slate-800">{connection.contact_channel}</span>
                                </div>
                            </div>

                            {/* Centered Heading */}
                            <div className="text-center pt-1">
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    Welcome, {connection.contact_name}!
                                </h1>
                                <p className="text-xs text-slate-500 font-normal mt-1">
                                    Your details entered by {connection.primary_user_name} are pre-filled below. You can edit them and create your password.
                                </p>
                            </div>

                            {/* Password Setup Form */}
                            <form onSubmit={submit} className="space-y-3 pt-1">
                                <input type="hidden" name="invite_code" value={data.invite_code} />

                                {/* Name (Editable) */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                        Your Full Name (editable)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Full name"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] transition shadow-2xs"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-[11px] text-[#C81E3D] mt-1 pl-1 font-medium">{errors.name}</p>
                                    )}
                                </div>

                                {/* Contact Channel (Editable) */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                        Mobile Number or Email (editable)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.contact_channel}
                                        onChange={(e) => setData('contact_channel', e.target.value)}
                                        placeholder="Mobile number or email"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] transition shadow-2xs"
                                        required
                                    />
                                    {errors.contact_channel && (
                                        <p className="text-[11px] text-[#C81E3D] mt-1 pl-1 font-medium">{errors.contact_channel}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                        Create Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Create password (minimum 8 characters)"
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

                                {/* Confirm Password */}
                                <div>
                                    <div className="relative flex items-center">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Confirm your password"
                                            className="w-full px-4 py-3.5 pr-11 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] transition shadow-2xs"
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

                                {errors.invite_code && (
                                    <p className="text-xs text-[#C81E3D] text-center font-medium bg-rose-50 p-2 rounded-xl border border-rose-200">
                                        {errors.invite_code}
                                    </p>
                                )}

                                {/* Action Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3.5 rounded-xl bg-[#C81E3D] hover:bg-[#B01733] active:scale-[0.99] text-white font-semibold text-sm transition shadow-sm disabled:opacity-60"
                                    >
                                        {processing ? 'Activating Companion Account...' : 'Set Password & Activate'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="text-center pt-2">
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    Enter Companion Code
                                </h1>
                                <p className="text-xs text-slate-500 font-normal mt-1">
                                    Please enter the invite code provided by your family member or partner
                                </p>
                            </div>

                            <form onSubmit={handleLookupCode} className="space-y-3.5 pt-2">
                                <div>
                                    <input
                                        type="text"
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. MWEZI-1234-ABCD"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] transition shadow-2xs font-mono uppercase text-center tracking-wider font-bold"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 rounded-xl bg-[#C81E3D] hover:bg-[#B01733] active:scale-[0.99] text-white font-semibold text-sm transition shadow-sm"
                                >
                                    Verify Code & Continue
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Bottom Phone Indicator */}
                    <div className="pt-4 text-center">
                        <div className="w-32 h-1 bg-slate-300 rounded-full opacity-60 mx-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
}

