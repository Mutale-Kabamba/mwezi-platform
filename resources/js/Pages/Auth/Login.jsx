import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from '@/i18n/LanguageContext';
import { 
    ChevronLeft, 
    Eye, 
    EyeOff, 
    Wifi, 
    BatteryMedium, 
    Sparkles, 
    UserCheck,
    Globe,
    Moon
} from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { t, locale, setLocale, languages } = useTranslation();
    const [showLangMenu, setShowLangMenu] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [currentTime, setCurrentTime] = useState('09:41');
    const [showDemoModal, setShowDemoModal] = useState(false);

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
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Demo role accounts
    const demoAccounts = [
        { label: 'Natasha', desc: 'Primary User', email: 'natasha@mwezi.org' },
        { label: 'Chileshe', desc: 'Companion', email: 'chileshe@mwezi.org' },
        { label: 'Sister Mary', desc: 'Hub Partner', email: 'partner@playitforward.org' },
        { label: 'Dr. Mwamba', desc: 'Clinic Reviewer', email: 'dr.mwamba@mwezi.org' },
    ];

    const selectDemo = (email) => {
        setData({
            email: email,
            password: 'password',
            remember: true,
        });
        setShowDemoModal(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#FBECEF] via-[#F4F1F4] to-[#EBF3F5] flex items-center justify-center p-0 sm:py-6 sm:px-4 font-sans selection:bg-rose-100 selection:text-rose-900">
            <Head title="Sign In - Mwezi" />

            {/* NATIVE PHONE FRAME */}
            <div className="w-full max-w-[420px] h-screen sm:h-[840px] sm:max-h-[92vh] bg-white sm:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(112,38,56,0.22)] sm:border-[8px] sm:border-slate-900/90 sm:ring-1 sm:ring-black/10 relative flex flex-col justify-between overflow-hidden">
                
                {/* 1. TOP SOLID RED ROUNDED HEADER SECTION (Matches Onboarding) */}
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
                        <Link 
                            href="/" 
                            className="p-1.5 -ml-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                            aria-label="Back"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>

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
                                href="/register" 
                                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold border border-white/20 backdrop-blur-sm shadow-xs transition active:scale-95"
                            >
                                {t('auth_sign_up', 'Sign up')}
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

                {/* 2. WHITE CONTENT SECTION (Modern Figma Form Layout) */}
                <div className="bg-white px-7 pt-4 pb-6 flex-1 flex flex-col justify-between overflow-y-auto hide-scrollbar z-10">
                    <div className="space-y-4">
                        {/* Centered Heading */}
                        <div className="text-center pt-1">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {t('auth_login_title', 'Welcome Back')}
                            </h1>
                            <p className="text-xs text-slate-500 font-normal mt-1">
                                {t('auth_login_desc', "We're excited to see you again")}
                            </p>
                        </div>

                        {status && (
                            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center">
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={submit} className="space-y-3 pt-1">
                            {/* Email / Identifier Input */}
                            <div>
                                <input
                                    type="text"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder={t('auth_identifier_placeholder', 'Email address or Phone')}
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] transition shadow-2xs"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-[11px] text-[#C81E3D] mt-1 pl-1 font-medium">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Input with Eye Toggle */}
                            <div>
                                <div className="relative flex items-center">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder={t('auth_password', 'Password')}
                                        className="w-full px-4 py-3.5 pr-11 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#C81E3D] focus:ring-1 focus:ring-[#C81E3D] transition shadow-2xs"
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

                                {/* Forgot Password Link - Aligned Right Under Password */}
                                {canResetPassword && (
                                    <div className="text-right mt-1.5">
                                        <Link
                                            href={route('password.request')}
                                            className="text-[11px] text-slate-500 hover:text-[#C81E3D] transition font-normal"
                                        >
                                            {t('auth_forgot_password', 'Forgot password?')}
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Main Action Button */}
                            <div className="pt-1.5">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 rounded-xl bg-[#C81E3D] hover:bg-[#B01733] active:scale-[0.99] text-white font-semibold text-sm transition shadow-sm disabled:opacity-60"
                                >
                                    {processing ? t('loading', 'Logging in...') : t('auth_log_in', 'Log in')}
                                </button>
                            </div>

                            {/* Direct Sublink */}
                            <div className="text-center pt-1 text-xs text-slate-500">
                                <span>{t('auth_new_to_mwezi', 'New to Mwezi?')} </span>
                                <Link 
                                    href="/register" 
                                    className="text-[#C81E3D] font-semibold hover:underline"
                                >
                                    {t('auth_sign_up', 'Sign up')}
                                </Link>
                            </div>
                        </form>
                    </div>

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
                                <button
                                    type="button"
                                    onClick={() => selectDemo('natasha@mwezi.org')}
                                    className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition active:scale-95 shadow-2xs"
                                    title="Sign in with Google"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.37 7.31 24 12 24z"/>
                                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.04.01 12c0 1.96.45 3.8 1.26 5.42l4.01-3.15z"/>
                                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                                    </svg>
                                </button>
                                <span className="text-[11px] text-slate-500 font-medium">Google</span>
                            </div>

                            {/* Demo Roles Button */}
                            <div className="flex flex-col items-center space-y-1">
                                <button
                                    type="button"
                                    onClick={() => setShowDemoModal(true)}
                                    className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-[#C81E3D] transition active:scale-95 shadow-2xs"
                                    title="Quick Demo Roles"
                                >
                                    <UserCheck className="w-5 h-5" />
                                </button>
                                <span className="text-[11px] text-slate-500 font-medium">Demo Roles</span>
                            </div>
                        </div>

                        {/* Bottom Phone Indicator */}
                        <div className="pt-2 text-center">
                            <div className="w-32 h-1 bg-slate-300 rounded-full opacity-60 mx-auto" />
                        </div>
                    </div>
                </div>

                {/* Quick Demo Login Modal */}
                {showDemoModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                        <div
                            className="fixed inset-0 bg-transparent"
                            onClick={() => setShowDemoModal(false)}
                        />
                        <div className="relative bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-rose-100 space-y-3 z-10">
                            <div className="flex justify-between items-center border-b border-rose-100 pb-2.5">
                                <div className="flex items-center space-x-2">
                                    <Sparkles className="w-4 h-4 text-[#C81E3D]" />
                                    <h3 className="font-bold text-sm text-slate-900">Select Demo Account</h3>
                                </div>
                                <button
                                    onClick={() => setShowDemoModal(false)}
                                    className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-2">
                                {demoAccounts.map((account, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => selectDemo(account.email)}
                                        className="w-full text-left p-2.5 rounded-2xl border border-slate-200 hover:border-[#C81E3D] hover:bg-rose-50/70 transition flex items-center justify-between group"
                                    >
                                        <div>
                                            <p className="font-bold text-xs text-slate-800 group-hover:text-[#C81E3D]">{account.label}</p>
                                            <p className="text-[10px] text-slate-500">{account.desc} • {account.email}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-[#C81E3D] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/50">
                                            Use
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-1 text-center">
                                <span className="text-[10px] text-slate-400">All demo accounts share password: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">password</code></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
