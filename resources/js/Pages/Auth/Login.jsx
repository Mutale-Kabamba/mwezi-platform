import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, Eye, EyeOff, Shield, ArrowRight, UserCheck } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Quick demo role autofill
    const demoAccounts = [
        { label: 'Natasha (Primary User / Girl)', email: 'natasha@mwezi.org', role: 'Track & Learn' },
        { label: 'Chileshe (Trusted Companion)', email: 'chileshe@mwezi.org', role: 'Support Ally' },
        { label: 'Sister Mary (Play It Forward Hub)', email: 'partner@playitforward.org', role: 'Community Partner' },
        { label: 'Dr. Mwamba (Apex Clinic)', email: 'dr.mwamba@mwezi.org', role: 'Healthcare Reviewer' },
        { label: 'Sarah Jenkins (Donor)', email: 'sarah.jenkins@globalgiving.org', role: 'Sponsorship' },
        { label: 'Mwezi Core Admin', email: 'admin@mwezi.org', role: 'M&E Oversight' },
    ];

    const selectDemo = (email) => {
        setData({
            email: email,
            password: 'password',
            remember: true,
        });
    };

    return (
        <div className="w-full max-w-[440px] mx-auto min-h-screen bg-[#F0F9FA] flex flex-col justify-between shadow-2xl p-6 font-sans">
            <Head title="Sign In - Mwezi" />

            {/* Header */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-9 h-9 rounded-[14px] bg-mwezi-accent flex items-center justify-center shadow-md">
                            <span className="font-heading font-extrabold text-xl text-mwezi-brandText">M</span>
                        </div>
                        <span className="font-heading font-bold text-2xl text-mwezi-tertiary">Mwezi</span>
                    </Link>
                    <Link href="/register" className="text-xs font-semibold text-mwezi-tertiary hover:underline">
                        Create Account
                    </Link>
                </div>

                <div className="mb-6">
                    <h1 className="font-heading font-bold text-2xl text-mwezi-tertiary">Welcome Back</h1>
                    <p className="text-xs text-gray-600 mt-1">Sign in to your private, stigma-free dashboard.</p>
                </div>

                {status && (
                    <div className="mb-4 text-xs font-medium text-green-700 bg-green-50 p-3 rounded-xl border border-green-200">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email or Username</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent focus:border-transparent transition"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        {errors.email && <div className="text-[11px] text-red-600 mt-1">{errors.email}</div>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-semibold text-gray-700">Password</label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-[11px] text-mwezi-tertiary hover:underline font-medium">
                                    Forgot password?
                                </Link>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent focus:border-transparent transition"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <div className="text-[11px] text-red-600 mt-1">{errors.password}</div>}
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300 text-mwezi-accent focus:ring-mwezi-accent"
                        />
                        <label htmlFor="remember" className="ml-2 text-xs text-gray-600 font-medium">
                            Keep me signed in
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 bg-mwezi-accent hover:bg-mwezi-accent/95 active:scale-[0.99] text-white font-bold rounded-[20px] text-sm flex items-center justify-center space-x-2 shadow-md transition disabled:opacity-50"
                    >
                        <span>{processing ? 'Signing In...' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                {/* 1-Click Fast Demo Switcher */}
                <div className="mt-6 pt-5 border-t border-gray-200">
                    <div className="flex items-center space-x-1 mb-2">
                        <UserCheck className="w-3.5 h-3.5 text-mwezi-tertiary" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-mwezi-tertiary">
                            Quick Demo Role Logins (Password: password)
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {demoAccounts.map((acc, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => selectDemo(acc.email)}
                                className="p-2 rounded-xl text-left bg-white border border-mwezi-primary/60 hover:bg-mwezi-secondary/40 transition flex flex-col"
                            >
                                <span className="text-[11px] font-bold text-gray-800 leading-tight truncate">{acc.label}</span>
                                <span className="text-[9px] text-gray-500">{acc.role}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-4 text-center">
                <p className="text-xs text-gray-500">
                    Protected by field-level encryption. Safe & Stigma-Free.
                </p>
            </div>
        </div>
    );
}
