import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, Lock, Shield, Eye, EyeOff, ArrowRight, ShieldCheck, Wifi, BatteryMedium, ChevronLeft } from 'lucide-react';

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

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#FBECEF] via-[#F4F1F4] to-[#EBF3F5] flex items-center justify-center p-0 sm:py-6 sm:px-4 font-sans selection:bg-rose-100 selection:text-rose-900">
            <Head title="Join Mwezi - Stigma-Free Health & Dignity" />

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

                {/* 2. NATIVE TOP APP BAR */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-rose-100/60">
                    <Link href="/" className="p-1 rounded-xl text-slate-600 hover:bg-slate-100">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <span className="font-bold text-sm text-slate-800">Create Account</span>
                    <Link href="/login" className="text-xs font-bold text-rose-600">
                        Sign In
                    </Link>
                </div>

                {/* 3. SCROLLABLE REGISTRATION FORM */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 hide-scrollbar">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Join Mwezi Free</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Start your private, stigma-free cycle journey.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-3.5">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">I am joining as:</label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-rose-500"
                            >
                                <option value="primary_user">Girl / Young Woman (Track & Learn)</option>
                                <option value="trusted_contact">Trusted Family Companion</option>
                                <option value="community_partner">School or Community Hub</option>
                                <option value="health_reviewer">Clinic / Health Partner</option>
                                <option value="donor_sponsor">Donor / Girl Sponsor</option>
                            </select>
                        </div>

                        {data.role === 'trusted_contact' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">Invite Code</label>
                                <input
                                    type="text"
                                    value={data.invite_code}
                                    onChange={(e) => setData('invite_code', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 font-mono uppercase"
                                    placeholder="e.g. MWEZI-7749-BAND"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">Full Name or Nickname</label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500"
                                    placeholder="e.g. Natasha Banda"
                                    required
                                />
                            </div>
                            {errors.name && <div className="text-[11px] text-rose-600 mt-1">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                            {errors.email && <div className="text-[11px] text-rose-600 mt-1">{errors.email}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">Preferred Language</label>
                            <select
                                value={data.preferred_language}
                                onChange={(e) => setData('preferred_language', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500"
                            >
                                <option value="en">English</option>
                                <option value="bem">Ichibemba</option>
                                <option value="nya">Chinyanja</option>
                                <option value="toi">Chitonga</option>
                                <option value="loz">Silozi</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-2.5 text-slate-400"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <div className="text-[11px] text-rose-600 mt-1">{errors.password}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-200/60 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-1"
                        >
                            <span>{processing ? 'Creating Account...' : 'Join Mwezi Free'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                {/* 4. NATIVE HOME INDICATOR */}
                <div className="py-2 text-center border-t border-slate-100 bg-white">
                    <span className="inline-flex items-center space-x-1 text-[10px] text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>All notes are field-level encrypted</span>
                    </span>
                    <div className="w-32 h-1 bg-slate-300 rounded-full opacity-60 mx-auto mt-2" />
                </div>
            </div>
        </div>
    );
}
