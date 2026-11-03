import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, Lock, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';

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

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="w-full max-w-[440px] mx-auto min-h-screen bg-[#F0F9FA] flex flex-col justify-between shadow-2xl p-6 font-sans">
            <Head title="Join Mwezi - Stigma-Free Health & Dignity" />

            <div>
                <div className="flex items-center justify-between mb-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-9 h-9 rounded-[14px] bg-mwezi-accent flex items-center justify-center shadow-md">
                            <span className="font-heading font-extrabold text-xl text-mwezi-brandText">M</span>
                        </div>
                        <span className="font-heading font-bold text-2xl text-mwezi-tertiary">Mwezi</span>
                    </Link>
                    <Link href="/login" className="text-xs font-semibold text-mwezi-tertiary hover:underline">
                        Sign In
                    </Link>
                </div>

                <div className="mb-5">
                    <h1 className="font-heading font-bold text-2xl text-mwezi-tertiary">Create Account</h1>
                    <p className="text-xs text-gray-600 mt-0.5">Start your private, stigma-free cycle journey.</p>
                </div>

                <form onSubmit={submit} className="space-y-3.5">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">I am joining as:</label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent focus:border-transparent font-medium"
                        >
                            <option value="primary_user">Girl / Young Woman (Track, Learn & Supplies)</option>
                            <option value="trusted_contact">Trusted Family / Partner Companion</option>
                            <option value="community_partner">School or Community NGO Hub</option>
                            <option value="health_reviewer">Healthcare Professional / Clinic</option>
                            <option value="donor_sponsor">Donor / Girl Sponsor</option>
                        </select>
                    </div>

                    {data.role === 'trusted_contact' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Invite Code (Optional)</label>
                            <input
                                type="text"
                                value={data.invite_code}
                                onChange={(e) => setData('invite_code', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent font-mono uppercase"
                                placeholder="e.g. MWEZI-7749-BAND"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">If your family member sent you an invite code, enter it here.</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name or Nickname</label>
                        <div className="relative">
                            <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent"
                                placeholder="e.g. Natasha Banda"
                                required
                            />
                        </div>
                        {errors.name && <div className="text-[11px] text-red-600 mt-1">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        {errors.email && <div className="text-[11px] text-red-600 mt-1">{errors.email}</div>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Language</label>
                        <select
                            value={data.preferred_language}
                            onChange={(e) => setData('preferred_language', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent"
                        >
                            <option value="en">English</option>
                            <option value="bem">Ichibemba (Bemba)</option>
                            <option value="nya">Chinyanja (Nyanja)</option>
                            <option value="toi">Chitonga (Tonga)</option>
                            <option value="loz">Silozi (Lozi)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full pl-9 pr-10 py-2 bg-white border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-400"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <div className="text-[11px] text-red-600 mt-1">{errors.password}</div>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 bg-mwezi-accent hover:bg-mwezi-accent/95 active:scale-[0.99] text-white font-bold rounded-[20px] text-sm flex items-center justify-center space-x-2 shadow-md transition disabled:opacity-50 mt-2"
                    >
                        <span>{processing ? 'Creating Account...' : 'Join Mwezi Free'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>

            <div className="pt-4 text-center">
                <p className="text-[11px] text-gray-500">
                    By registering you agree to Mwezi's Dignity and Safeguarding charter. All personal notes remain encrypted.
                </p>
            </div>
        </div>
    );
}
