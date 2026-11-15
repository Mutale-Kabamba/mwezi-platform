import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from '@/i18n/LanguageContext';
import {
    ChevronLeft,
    Eye,
    EyeOff,
    Sparkles,
    UserCheck,
    Globe,
    Moon,
    ArrowRight,
    CheckCircle2,
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
    const [showDemoModal, setShowDemoModal] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Demo role accounts (matches TestUsersSeeder)
    const demoAccounts = [
        { label: 'Mutinta (Ages 10–13)', desc: 'Tier 1 • Parent-Managed', email: 'tier1@mwezi.org' },
        { label: 'Natasha (Ages 14–17)', desc: 'Tier 2 • Primary User', email: 'natasha@mwezi.org' },
        { label: 'Mwila (Ages 18–24+)', desc: 'Tier 3 • Young Woman', email: 'mwila@mwezi.org' },
        { label: 'Mrs. Grace Phiri', desc: 'Parent / Guardian', email: 'parent@mwezi.org' },
        { label: 'Chileshe', desc: 'Trusted Companion', email: 'chileshe@mwezi.org' },
        { label: 'Sister Mary', desc: 'Hub Partner / NGO', email: 'partner@playitforward.org' },
        { label: 'Dr. Mwamba', desc: 'Clinic Reviewer (HPCZ)', email: 'dr.mwamba@mwezi.org' },
        { label: 'Sarah Jenkins', desc: 'Dignity Sponsor', email: 'sarah.jenkins@globalgiving.org' },
        { label: 'Mwezi Admin', desc: 'System SuperAdmin', email: 'admin@mwezi.org' },
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
        <div className="relative min-h-screen w-full overflow-hidden bg-[#F8EAE6] flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-purple-200/60 selection:text-[#2D2638]">
            <Head title="Sign In - Mwezi" />

            {/* Ambient Soft Pastel Mesh Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-28 -left-24 h-[420px] w-[420px] rounded-full bg-[#FADCD3] opacity-90 blur-3xl" />
                <div className="absolute top-1/4 -right-28 h-[460px] w-[460px] rounded-full bg-[#D8C2FA] opacity-75 blur-3xl" />
                <div className="absolute -bottom-32 left-1/4 h-[440px] w-[440px] rounded-full bg-[#F3D2E5] opacity-85 blur-3xl" />
                <div className="absolute bottom-10 right-10 h-[300px] w-[300px] rounded-full bg-[#E5D4FC] opacity-70 blur-3xl" />
            </div>

            {/* Minimal Frosted Glass Card */}
            <div className="relative z-10 w-full max-w-[400px] min-h-[680px] sm:min-h-[740px] rounded-[36px] bg-white/45 backdrop-blur-2xl border border-white/80 shadow-[0_24px_60px_-15px_rgba(92,71,112,0.16)] px-7 py-7 flex flex-col justify-between">

                {/* Top Utility Bar */}
                <div className="flex items-center justify-between text-xs">
                    <Link
                        href="/"
                        className="p-2 -ml-2 rounded-full text-[#5E546B] hover:text-[#2D2638] hover:bg-white/60 transition active:scale-95"
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>

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
                                                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition ${
                                                    locale === lang.code
                                                        ? 'bg-purple-50 text-[#2D2638] font-bold'
                                                        : 'text-[#5E546B] hover:bg-slate-50/80'
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
                            href="/register"
                            className="rounded-full bg-white/60 hover:bg-white/85 border border-white/85 px-3 py-1 text-[11px] font-semibold text-[#2D2638] transition active:scale-95"
                        >
                            {t('auth_sign_up', 'Sign up')}
                        </Link>
                    </div>
                </div>

                {/* Centered Minimal Brand Header */}
                <div className="text-center pt-2">
                    <div className="inline-flex items-center space-x-2 text-[#2D2638]">
                        <div className="w-7 h-7 rounded-full bg-white/75 border border-white flex items-center justify-center shadow-xs">
                            <Moon className="w-4 h-4 text-[#3D334D]" strokeWidth={2.2} />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Mwezi</span>
                    </div>
                    <p className="text-[11px] font-medium text-[#6E637C] mt-1">
                        {t('app_subtitle', 'Menstrual Health & Dignity')}
                    </p>
                </div>

                {/* Main Login Form */}
                <div className="my-auto py-4 space-y-5">
                    <div className="text-center space-y-1">
                        <h1 className="text-[28px] font-bold tracking-tight text-[#2D2638] leading-tight">
                            {t('auth_login_title', 'Welcome Back')}
                        </h1>
                        <p className="text-[13px] text-[#5E546B]">
                            {t('auth_login_desc', "We're excited to see you again")}
                        </p>
                    </div>

                    {status && (
                        <div className="text-xs font-semibold text-emerald-800 bg-emerald-50/85 p-3 rounded-2xl border border-emerald-200/80 text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-3.5">
                        <div>
                            <input
                                type="text"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder={t('auth_identifier_placeholder', 'Email address or Phone')}
                                className="w-full px-4 py-3.5 rounded-2xl bg-white/70 border border-white/90 text-sm text-[#2D2638] placeholder:text-[#8A7F99] placeholder:text-xs focus:outline-none focus:bg-white focus:border-[#9B7BB8] focus:ring-2 focus:ring-purple-200/60 transition shadow-2xs"
                                required
                            />
                            {errors.email && (
                                <p className="text-[11px] text-rose-600 mt-1.5 pl-1 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="relative flex items-center">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={t('auth_password', 'Password')}
                                    className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-white/70 border border-white/90 text-sm text-[#2D2638] placeholder:text-[#8A7F99] placeholder:text-xs focus:outline-none focus:bg-white focus:border-[#9B7BB8] focus:ring-2 focus:ring-purple-200/60 transition shadow-2xs"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 text-[#7C718B] hover:text-[#2D2638] transition"
                                    tabIndex={-1}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[11px] text-rose-600 mt-1.5 pl-1 font-medium">{errors.password}</p>
                            )}

                            {canResetPassword && (
                                <div className="text-right mt-2">
                                    <Link
                                        href={route('password.request')}
                                        className="text-[11px] text-[#6E637C] hover:text-[#2D2638] transition font-medium"
                                    >
                                        {t('auth_forgot_password', 'Forgot password?')}
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-full bg-white/80 hover:bg-white border border-white/95 shadow-[0_10px_28px_-8px_rgba(92,71,112,0.18)] px-6 py-3.5 flex items-center justify-between text-[#2D2638] font-semibold text-sm transition active:scale-[0.99] disabled:opacity-60"
                            >
                                <span>{processing ? t('loading', 'Logging in...') : t('auth_log_in', 'Log in')}</span>
                                <ArrowRight className="w-4 h-4 text-[#2D2638]" />
                            </button>
                        </div>

                        <div className="text-center pt-1 text-xs text-[#5E546B]">
                            <span>{t('auth_new_to_mwezi', 'New to Mwezi?')} </span>
                            <Link
                                href="/register"
                                className="text-[#2D2638] font-bold hover:underline"
                            >
                                {t('auth_sign_up', 'Sign up')}
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Bottom Section: Quick Sign-In & Demo Roles */}
                <div className="pt-2 space-y-3">
                    <div className="relative flex items-center justify-center">
                        <div className="w-full border-t border-white/70" />
                        <span className="px-3 text-[11px] text-[#7A6F8A] font-medium shrink-0">
                            Or continue with
                        </span>
                        <div className="w-full border-t border-white/70" />
                    </div>

                    <div className="flex items-center justify-center space-x-10 pt-1">
                        <div className="flex flex-col items-center space-y-1">
                            <button
                                type="button"
                                onClick={() => selectDemo('natasha@mwezi.org')}
                                className="w-11 h-11 rounded-full bg-white/65 hover:bg-white border border-white/90 flex items-center justify-center transition active:scale-95 shadow-xs"
                                title="Sign in with Google"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.37 7.31 24 12 24z"/>
                                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.04.01 12c0 1.96.45 3.8 1.26 5.42l4.01-3.15z"/>
                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                                </svg>
                            </button>
                            <span className="text-[11px] text-[#5E546B] font-medium">Google</span>
                        </div>

                        <div className="flex flex-col items-center space-y-1">
                            <button
                                type="button"
                                onClick={() => setShowDemoModal(true)}
                                className="w-11 h-11 rounded-full bg-white/65 hover:bg-white border border-white/90 flex items-center justify-center text-[#3D334D] transition active:scale-95 shadow-xs"
                                title="Quick Demo Roles"
                            >
                                <UserCheck className="w-5 h-5" />
                            </button>
                            <span className="text-[11px] text-[#5E546B] font-medium">Demo Roles</span>
                        </div>
                    </div>
                </div>

                {/* Quick Demo Login Modal */}
                {showDemoModal && (
                    <div className="fixed inset-0 bg-[#2D2638]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                        <div
                            className="fixed inset-0 bg-transparent"
                            onClick={() => setShowDemoModal(false)}
                        />
                        <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-white space-y-3 z-10">
                            <div className="flex justify-between items-center border-b border-purple-100/80 pb-2.5">
                                <div className="flex items-center space-x-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    <h3 className="font-bold text-sm text-[#2D2638]">Select Demo Account</h3>
                                </div>
                                <button
                                    onClick={() => setShowDemoModal(false)}
                                    className="text-[#7C718B] hover:text-[#2D2638] text-sm font-bold p-1"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                                {demoAccounts.map((account, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => selectDemo(account.email)}
                                        className="w-full text-left p-2.5 rounded-2xl bg-white/80 border border-purple-100/80 hover:border-purple-400 hover:bg-purple-50/70 transition flex items-center justify-between group"
                                    >
                                        <div>
                                            <p className="font-bold text-xs text-[#2D2638] group-hover:text-purple-800">{account.label}</p>
                                            <p className="text-[10px] text-[#6E637C]">{account.desc} • {account.email}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-[#2D2638] bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                                            Use
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-1 text-center">
                                <span className="text-[10px] text-[#6E637C]">
                                    All demo accounts share password: <code className="bg-purple-50 px-1.5 py-0.5 rounded font-mono text-[#2D2638]">password</code>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
