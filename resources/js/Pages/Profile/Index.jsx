import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { 
    User, 
    Shield, 
    Lock, 
    Globe, 
    Bell, 
    Trash2, 
    LogOut, 
    Check, 
    Sparkles, 
    BookOpen, 
    Calendar,
    Save
} from 'lucide-react';

export default function ProfileIndex({ auth, privacy, stats = {} }) {
    const user = auth.user;

    // Profile Details Form
    const { data: profileData, setData: setProfileData, patch: submitProfile, processing: profileProcessing } = useForm({
        name: user.name || '',
        username: user.username || '',
        phone: user.phone || '',
        preferred_language: user.preferred_language || 'en',
        bio: user.bio || '',
    });

    // Privacy Settings Form
    const { data: privacyData, setData: setPrivacyData, patch: submitPrivacy, processing: privacyProcessing } = useForm({
        allow_anonymous_forum_default: privacy?.allow_anonymous_forum_default ?? true,
        share_cycle_with_trusted: privacy?.share_cycle_with_trusted ?? false,
        share_symptoms_with_trusted: privacy?.share_symptoms_with_trusted ?? false,
        receive_discreet_notifications: privacy?.receive_discreet_notifications ?? true,
    });

    // Quick PIN Form
    const { data: pinData, setData: setPinData, post: submitPin, processing: pinProcessing, reset: resetPin } = useForm({
        pin: '',
    });

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        submitProfile(route('profile.update'));
    };

    const handleUpdatePrivacy = (e) => {
        e.preventDefault();
        submitPrivacy(route('profile.privacy'));
    };

    const handleSetPin = (e) => {
        e.preventDefault();
        submitPin(route('profile.pin'), {
            onSuccess: () => resetPin(),
        });
    };

    return (
        <MobileAppLayout title="Profile & Privacy" subtitle="Security & Preferences">
            <Head title="Profile & Privacy Center - Mwezi" />

            <div className="space-y-4">
                
                {/* 1. USER IDENTITY CARD & STATS */}
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-mwezi-primary/40 space-y-4">
                    <div className="flex items-center space-x-3.5">
                        <div className="w-14 h-14 rounded-full bg-mwezi-accent flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-heading font-bold text-base text-gray-900">{user.name}</h2>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-mwezi-secondary text-mwezi-tertiary capitalize">
                                {user.role?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Stats counters */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-center">
                        <div className="p-2.5 bg-mwezi-light rounded-xl">
                            <span className="font-heading font-extrabold text-lg text-mwezi-tertiary block">
                                {stats.logs_count || 0}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-500">Days Logged</span>
                        </div>
                        <div className="p-2.5 bg-mwezi-light rounded-xl">
                            <span className="font-heading font-extrabold text-lg text-mwezi-accent block">
                                {stats.completed_guides || 0}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-500">Guides Completed</span>
                        </div>
                    </div>
                </div>

                {/* 2. PROFILE EDIT FORM */}
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 space-y-3">
                    <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider">
                        Personal Details & Language
                    </h3>

                    <form onSubmit={handleUpdateProfile} className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData('name', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-mwezi-accent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Language</label>
                            <select
                                value={profileData.preferred_language}
                                onChange={(e) => setProfileData('preferred_language', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs font-medium"
                            >
                                <option value="en">English</option>
                                <option value="bem">Ichibemba (Bemba)</option>
                                <option value="nya">Chinyanja (Nyanja)</option>
                                <option value="toi">Chitonga (Tonga)</option>
                                <option value="loz">Silozi (Lozi)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Bio / Notes</label>
                            <textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData('bio', e.target.value)}
                                rows="2"
                                placeholder="Short bio or school information..."
                                className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-mwezi-accent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={profileProcessing}
                            className="w-full py-2.5 bg-mwezi-secondary text-mwezi-tertiary hover:bg-mwezi-secondary/80 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Profile Details</span>
                        </button>
                    </form>
                </div>

                {/* 3. GRANULAR PRIVACY SETTINGS */}
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 space-y-3">
                    <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider">
                            Granular Privacy Controls
                        </h3>
                    </div>

                    <form onSubmit={handleUpdatePrivacy} className="space-y-3">
                        {[
                            {
                                key: 'allow_anonymous_forum_default',
                                title: 'Default Forum Anonymity',
                                desc: 'Automatically check anonymous toggle when creating community posts.',
                            },
                            {
                                key: 'share_cycle_with_trusted',
                                title: 'Share Estimated Cycle with Trusted Circle',
                                desc: 'Allow invited companions to see period forecast days.',
                            },
                            {
                                key: 'share_symptoms_with_trusted',
                                title: 'Share Common Symptoms with Trusted Circle',
                                desc: 'Allows companions to see general wellness tips for your cramps.',
                            },
                            {
                                key: 'receive_discreet_notifications',
                                title: 'Discreet Notification Language',
                                desc: 'Disguises reminders with neutral study/wellness phrasing.',
                            },
                        ].map((item) => (
                            <div key={item.key} className="flex items-start justify-between p-2.5 rounded-xl bg-gray-50">
                                <div className="pr-3">
                                    <span className="text-xs font-bold text-gray-800 block">{item.title}</span>
                                    <span className="text-[10px] text-gray-500 leading-tight block">{item.desc}</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={privacyData[item.key]}
                                    onChange={(e) => setPrivacyData(item.key, e.target.checked)}
                                    className="rounded border-gray-300 text-mwezi-accent focus:ring-mwezi-accent mt-1"
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={privacyProcessing}
                            className="w-full py-2.5 bg-mwezi-accent text-white font-bold rounded-xl text-xs shadow-sm hover:bg-mwezi-accent/90 transition"
                        >
                            Save Privacy Preferences
                        </button>
                    </form>
                </div>

                {/* 4. 4-DIGIT QUICK-PIN SETUP */}
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 space-y-3">
                    <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-mwezi-tertiary" />
                        <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider">
                            Discreet Quick PIN Lock
                        </h3>
                    </div>
                    <p className="text-[11px] text-gray-600">
                        Set a 4-digit PIN to protect your app screen when restoring from Discreet Study Mode.
                    </p>

                    <form onSubmit={handleSetPin} className="flex space-x-2">
                        <input
                            type="password"
                            maxLength="4"
                            value={pinData.pin}
                            onChange={(e) => setPinData('pin', e.target.value.replace(/\D/g, ''))}
                            placeholder="4-digit PIN"
                            className="w-32 p-2 bg-gray-50 border rounded-xl text-xs text-center font-mono tracking-widest font-bold"
                            required
                        />
                        <button
                            type="submit"
                            disabled={pinProcessing || pinData.pin.length !== 4}
                            className="flex-1 py-2 bg-gray-800 text-white font-bold rounded-xl text-xs hover:bg-gray-900 transition disabled:opacity-40"
                        >
                            Update PIN
                        </button>
                    </form>
                </div>

                {/* 5. LOG OUT & DESTRUCTION ACTIONS (#8E484B Muted Red) */}
                <div className="pt-2 space-y-2">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full py-3 bg-mwezi-tertiary text-white font-bold rounded-[20px] text-xs shadow-sm hover:opacity-95 transition flex items-center justify-center space-x-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Mwezi</span>
                    </Link>

                    <p className="text-[10px] text-center text-gray-500">
                        Right-to-be-forgotten: Request complete deletion of all encrypted records anytime in settings.
                    </p>
                </div>
            </div>
        </MobileAppLayout>
    );
}

