import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, Eye, EyeOff, Shield, ArrowRight, UserCheck, ShieldCheck, Wifi, BatteryMedium, ChevronLeft } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
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

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Quick demo role autofill
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
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#FBECEF] via-[#F4F1F4] to-[#EBF3F5] flex items-center justify-center p-0 sm:py-6 sm:px-4 font-sans selection:bg-rose-100 selection:text-rose-900">
            <Head title="Sign In - Mwezi" />

            {/* NATIVE APP FRAME */}
            <div className="w-full max-w-[440px] min-h-screen sm:min-h-[850px] sm:max-h-[92vh] bg-white sm:rounded-[48px] shadow-[0_20px_60px_-15px_rgba(112,38,56,0.18)] sm:border-[8px] sm:border-slate-900/90 sm:ring-1 sm:ring-black/10 relative flex flex-col justify-between overflow-hidden">
                
                {/* 1. NATIVE STATUS BAR */}
                <div className="w-full bg-white/90 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-slate-800 text-xs font-semibold z-50 select-none border-b border-rose-100/40">
                    <span className="font-bold tracking-tight text-[11px]">{currentTime}</span>
                    <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
                        <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                        <div className="w-2.5 h-1 rounded-full bg-slate-700" />
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-700">
                        <Wifi className="w-3.5 h-3.5" />
                        <BatteryMedium className="w-4 h-4 text-emerald-600" />
                    </div>
                </div>

                {/* 2. NATIVE APP TOP BAR */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-rose-100/60">
                    <Link href="/" className="p-1 rounded-xl text-slate-600 hover:bg-slate-100">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <span className="font-bold text-sm text-slate-800">Sign In</span>
                    <Link href="/register" className="text-xs font-bold text-rose-600">
                        Register
                    </Link>
                </div>

                {/* 3. SCROLLABLE FORM BODY */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 hide-scrollbar">
                    <div className="text-center pt-2">
                        <div className="w-12 h-12 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center mx-auto shadow-md shadow-rose-200/50 mb-3">
                            <span className="text-white text-lg font-bold">🌙</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Access your private health companion</p>
                    </div>

                    {status && (
                        <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-3 rounded-2xl border border-emerald-200/70">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                            {errors.email && <div className="text-xs text-rose-600 mt-1">{errors.email}</div>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-slate-800">Password</label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-[11px] text-rose-600 hover:underline font-semibold">
                                        Forgot?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <div className="text-xs text-rose-600 mt-1">{errors.password}</div>}
                        </div>

                        <div className="flex items-center pt-1">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                            />
                            <label htmlFor="remember" className="ml-2 text-xs text-slate-600 font-medium">
                                Keep me signed in
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-200/60 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-1"
                        >
                            <span>{processing ? 'Signing In...' : 'Sign In'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    {/* 1-Tap Demo Role Fast Login */}
                    <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center space-x-1.5 mb-2">
                            <UserCheck className="w-3.5 h-3.5 text-rose-600" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                                1-Tap Quick Demo Logins
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {demoAccounts.map((acc, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => selectDemo(acc.email)}
                                    className="p-2 rounded-2xl text-left bg-rose-50/60 hover:bg-rose-100/70 border border-rose-100 transition active:scale-95"
                                >
                                    <span className="text-[11px] font-bold text-slate-800 block truncate">{acc.label}</span>
                                    <span className="text-[9px] text-slate-500 block truncate">{acc.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. NATIVE HOME INDICATOR */}
                <div className="py-2 text-center border-t border-slate-100 bg-white">
                    <span className="inline-flex items-center space-x-1 text-[10px] text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Protected by field-level encryption</span>
                    </span>
                    <div className="w-32 h-1 bg-slate-300 rounded-full opacity-60 mx-auto mt-2" />
                </div>
            </div>
        </div>
    );
}
