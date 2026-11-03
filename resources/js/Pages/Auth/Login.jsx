import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ChevronLeft, 
    Eye, 
    EyeOff, 
    Wifi, 
    BatteryMedium, 
    Sparkles, 
    ShieldCheck, 
    UserCheck,
    Lock
} from 'lucide-react';

export default function Login({ status, canResetPassword }) {
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

            {/* NATIVE APP FRAME (Matches Reference Screenshot Layout) */}
            <div className="w-full max-w-[420px] h-screen sm:h-[840px] sm:max-h-[92vh] bg-white sm:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(112,38,56,0.22)] sm:border-[8px] sm:border-slate-900/90 sm:ring-1 sm:ring-black/10 relative flex flex-col justify-between overflow-hidden">
                
                {/* 1. TOP SOLID COLOR LOGO & NOTIFICATION BAR SECTION (Continuous Solid Color) */}
                <div className="bg-[#BE123C] text-white shrink-0 relative pb-18 pt-3 select-none">
                    
                    {/* Integrated Phone Notification Bar (Seamless Solid Background) */}
                    <div className="w-full px-6 pb-2 flex items-center justify-between text-xs font-semibold">
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
                    <div className="flex items-center justify-between px-5 pt-1">
                        <Link 
                            href="/" 
                            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                            aria-label="Back"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>

                        <div className="flex items-center space-x-2 text-xs">
                            <span className="text-[11px] text-rose-100 font-medium hidden xs:inline">
                                Don't have an account?
                            </span>
                            <Link 
                                href="/register" 
                                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold border border-white/20 backdrop-blur-sm shadow-xs transition active:scale-95"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>

                    {/* Centered Brand Title with Spacious Room */}
                    <div className="text-center pt-4 pb-2">
                        <div className="inline-flex items-center space-x-2.5">
                            <span className="text-2xl drop-shadow-sm">🌙</span>
                            <span className="font-black text-3xl tracking-tight text-white font-sans drop-shadow-xs">
                                Mwezi
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. FLOATING WHITE CARD (Slightly less height to give room to the top logo section) */}
                <div className="bg-white rounded-t-[36px] -mt-8 pt-5 px-6 pb-4 flex-1 flex flex-col justify-between overflow-y-auto hide-scrollbar relative z-10 shadow-2xl">
                    <div className="space-y-3.5">
                        {/* Title and Subtitle */}
                        <div className="text-center space-y-0.5">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Welcome Back
                            </h1>
                            <p className="text-xs text-slate-400 font-medium">
                                Enter your details below
                            </p>
                        </div>

                        {status && (
                            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200/70 text-center">
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={submit} className="space-y-2.5 pt-0.5">
                            {/* Email Input Field with Top Micro-Label */}
                            <div className="border border-slate-200/90 rounded-2xl p-2.5 px-3.5 bg-white focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100 transition shadow-2xs">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nicholas@ergemla.com"
                                    className="w-full p-0 border-0 text-xs font-semibold text-slate-900 placeholder-slate-300 focus:ring-0 bg-transparent"
                                    required
                                />
                            </div>
                            {errors.email && <div className="text-[11px] text-rose-600 pl-1 font-medium">{errors.email}</div>}

                            {/* Password Input Field with Top Micro-Label & Eye Toggle */}
                            <div className="border border-slate-200/90 rounded-2xl p-2.5 px-3.5 bg-white focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100 transition shadow-2xs">
                                <div className="flex justify-between items-center mb-0.5">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Password
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full p-0 border-0 text-xs font-semibold text-slate-900 placeholder-slate-300 focus:ring-0 bg-transparent"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-slate-400 hover:text-slate-600 p-0.5 transition"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            {errors.password && <div className="text-[11px] text-rose-600 pl-1 font-medium">{errors.password}</div>}

                            {/* Gradient Primary Sign In Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E11D48] via-rose-500 to-[#FB7185] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-500/25 transition active:scale-98 disabled:opacity-50 mt-1"
                            >
                                {processing ? 'Signing In...' : 'Sign in'}
                            </button>

                            {/* Forgot Password Link */}
                            {canResetPassword && (
                                <div className="text-center pt-0.5">
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs text-slate-400 hover:text-rose-600 font-medium transition"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                            )}
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-1.5">
                            <div className="flex-1 border-t border-slate-200/80"></div>
                            <span className="px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Or sign in with
                            </span>
                            <div className="flex-1 border-t border-slate-200/80"></div>
                        </div>

                        {/* Quick Sign-In Pills (Matching Google / Demo in Reference) */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => selectDemo('natasha@mwezi.org')}
                                className="py-2.5 px-3 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 transition flex items-center justify-center space-x-2 shadow-2xs active:scale-95 text-xs font-bold text-slate-700"
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.37 7.31 24 12 24z"/>
                                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.04.01 12c0 1.96.45 3.8 1.26 5.42l4.01-3.15z"/>
                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                                </svg>
                                <span>Google</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowDemoModal(true)}
                                className="py-2.5 px-3 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 transition flex items-center justify-center space-x-2 shadow-2xs active:scale-95 text-xs font-bold text-rose-700"
                            >
                                <UserCheck className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>Demo Roles</span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Home Indicator */}
                    <div className="pt-2 text-center shrink-0">
                        <div className="w-32 h-1 bg-slate-300 rounded-full opacity-60 mx-auto" />
                    </div>
                </div>
            </div>

            {/* Quick Demo Login Modal */}
            {showDemoModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-rose-100 space-y-3">
                        <div className="flex justify-between items-center border-b border-rose-100 pb-2.5">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="w-4 h-4 text-rose-600" />
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
                                    className="w-full text-left p-2.5 rounded-2xl border border-rose-100 hover:border-rose-400 hover:bg-rose-50/70 transition flex items-center justify-between group"
                                >
                                    <div>
                                        <p className="font-bold text-xs text-slate-800 group-hover:text-rose-700">{account.label}</p>
                                        <p className="text-[10px] text-slate-500">{account.desc} • {account.email}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/50">
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
    );
}
