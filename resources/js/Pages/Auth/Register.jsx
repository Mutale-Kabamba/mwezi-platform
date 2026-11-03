import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ChevronLeft, 
    Eye, 
    EyeOff, 
    Wifi, 
    BatteryMedium, 
    User, 
    Lock, 
    UserCheck,
    Check
} from 'lucide-react';

export default function Register({ initialInviteCode = '' }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: initialInviteCode ? 'trusted_contact' : 'primary_user',
        preferred_language: 'en',
        invite_code: initialInviteCode,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [currentTime, setCurrentTime] = useState('09:41');

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

    // Calculate dynamic password strength matching reference screenshot indicator
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { label: 'Enter password', color: 'text-slate-400', bars: 0, barColor: 'bg-slate-200' };
        if (pwd.length < 6) return { label: 'Weak', color: 'text-amber-500', bars: 1, barColor: 'bg-amber-400' };
        if (pwd.length < 8) return { label: 'Medium', color: 'text-rose-500', bars: 2, barColor: 'bg-rose-400' };
        return { label: 'Strong', color: 'text-emerald-500', bars: 3, barColor: 'bg-emerald-500' };
    };

    const strength = getPasswordStrength(data.password);

    const submit = (e) => {
        e.preventDefault();
        setData('password_confirmation', data.password);
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#FBECEF] via-[#F4F1F4] to-[#EBF3F5] flex items-center justify-center p-0 sm:py-6 sm:px-4 font-sans selection:bg-rose-100 selection:text-rose-900">
            <Head title="Get Started Free - Mwezi" />

            {/* NATIVE APP FRAME (Matches Screen 3 Right in Reference) */}
            <div className="w-full max-w-[420px] h-screen sm:h-[840px] sm:max-h-[92vh] bg-white sm:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(112,38,56,0.22)] sm:border-[8px] sm:border-slate-900/90 sm:ring-1 sm:ring-black/10 relative flex flex-col justify-between overflow-hidden">
                
                {/* 1. TOP SOLID COLOR LOGO & NOTIFICATION BAR SECTION */}
                <div className="bg-[#BE123C] text-white shrink-0 relative pt-3 pb-8 px-5 select-none flex flex-col justify-between">
                    
                    {/* Integrated Phone Notification Bar (Seamless Solid Background) */}
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
                            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                            aria-label="Back"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>

                        <div className="flex items-center space-x-2 text-xs">
                            <span className="text-[11px] text-rose-100 font-medium hidden xs:inline">
                                Already have an account?
                            </span>
                            <Link 
                                href="/login" 
                                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold border border-white/20 backdrop-blur-sm shadow-xs transition active:scale-95"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>

                    {/* Centered Brand Title with Generous Breathing Room */}
                    <div className="text-center pt-5 pb-3">
                        <div className="inline-flex items-center space-x-2.5">
                            <span className="text-2xl drop-shadow-sm">🌙</span>
                            <span className="font-black text-3xl tracking-tight text-white font-sans drop-shadow-xs">
                                Mwezi
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. WHITE CONTENT SECTION (With sleek rounded corners) */}
                <div className="bg-white rounded-t-[24px] -mt-3 pt-6 px-6 pb-4 flex-1 min-h-0 flex flex-col justify-between overflow-y-auto hide-scrollbar relative z-10 shadow-lg">
                    <div className="space-y-3">
                        {/* Title and Subtitle */}
                        <div className="text-center space-y-0.5">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Get started free.
                            </h1>
                            <p className="text-xs text-slate-400 font-medium">
                                Free forever. No credit card needed.
                            </p>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={submit} className="space-y-2 pt-0.5">
                            {/* Email Address Field with Micro-Label */}
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

                            {/* Your Name Field with Micro-Label */}
                            <div className="border border-slate-200/90 rounded-2xl p-2.5 px-3.5 bg-white focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100 transition shadow-2xs">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Nicholas Ergemla"
                                    className="w-full p-0 border-0 text-xs font-semibold text-slate-900 placeholder-slate-300 focus:ring-0 bg-transparent"
                                    required
                                />
                            </div>
                            {errors.name && <div className="text-[11px] text-rose-600 pl-1 font-medium">{errors.name}</div>}

                            {/* Password Field with Dynamic Strength Indicator (Matches Reference Screenshot) */}
                            <div className="border border-slate-200/90 rounded-2xl p-2.5 px-3.5 bg-white focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100 transition shadow-2xs">
                                <div className="flex justify-between items-center mb-0.5">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Password
                                    </label>

                                    {/* Password Strength Gauge (Matches Reference Screenshot) */}
                                    {data.password && (
                                        <div className="flex items-center space-x-1.5">
                                            <div className="flex space-x-1">
                                                <div className={`w-3.5 h-1 rounded-full ${strength.bars >= 1 ? strength.barColor : 'bg-slate-200'}`} />
                                                <div className={`w-3.5 h-1 rounded-full ${strength.bars >= 2 ? strength.barColor : 'bg-slate-200'}`} />
                                                <div className={`w-3.5 h-1 rounded-full ${strength.bars >= 3 ? strength.barColor : 'bg-slate-200'}`} />
                                            </div>
                                            <span className={`text-[10px] font-bold ${strength.color}`}>
                                                {strength.label}
                                            </span>
                                        </div>
                                    )}
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

                            {/* Role Selection Badge Chips */}
                            <div className="pt-0.5">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    I am joining as:
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setData('role', 'primary_user')}
                                        className={`py-1.5 px-2.5 rounded-xl text-left border text-[11px] font-bold transition ${
                                            data.role === 'primary_user'
                                                ? 'bg-rose-50 border-rose-500 text-rose-800'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        Girl / Woman (User)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('role', 'trusted_contact')}
                                        className={`py-1.5 px-2.5 rounded-xl text-left border text-[11px] font-bold transition ${
                                            data.role === 'trusted_contact'
                                                ? 'bg-rose-50 border-rose-500 text-rose-800'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        Companion / Partner
                                    </button>
                                </div>
                            </div>

                            {/* Gradient Primary Sign Up Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E11D48] via-rose-500 to-[#FB7185] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-500/25 transition active:scale-98 disabled:opacity-50 mt-1"
                            >
                                {processing ? 'Creating Account...' : 'Sign up'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-1">
                            <div className="flex-1 border-t border-slate-200/80"></div>
                            <span className="px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Or sign up with
                            </span>
                            <div className="flex-1 border-t border-slate-200/80"></div>
                        </div>

                        {/* Quick Sign-Up Pills (Matching Reference Google & Demo) */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <Link
                                href="/login"
                                className="py-2 px-3 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 transition flex items-center justify-center space-x-2 shadow-2xs active:scale-95 text-xs font-bold text-slate-700"
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.37 7.31 24 12 24z"/>
                                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.04.01 12c0 1.96.45 3.8 1.26 5.42l4.01-3.15z"/>
                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                                </svg>
                                <span>Google</span>
                            </Link>

                            <Link
                                href="/login"
                                className="py-2 px-3 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 transition flex items-center justify-center space-x-2 shadow-2xs active:scale-95 text-xs font-bold text-rose-700"
                            >
                                <UserCheck className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>Demo Roles</span>
                            </Link>
                        </div>
                    </div>

                    {/* 4. BOTTOM NATIVE HOME INDICATOR */}
                    <div className="pt-2 text-center shrink-0">
                        <div className="w-32 h-1 bg-slate-300 rounded-full opacity-60 mx-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
}
