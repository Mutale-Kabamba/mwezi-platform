import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    Calendar,
    BookOpen,
    Sparkles,
    MapPin,
    Users,
    Shield,
    Menu,
    X,
    Heart,
    PhoneCall,
    Bell,
    Settings,
    LogOut,
    CheckCircle2,
    ChevronRight,
    Wifi,
    BatteryMedium,
    ArrowLeft
} from 'lucide-react';

export default function MobileAppLayout({
    children,
    title = 'Mwezi',
    subtitle = 'Menstrual Health & Dignity',
    showNav = true,
    actionButton = null,
    fullHeight = false
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    // Quick Exit / Discreet Shield Mode State
    const [discreetMode, setDiscreetMode] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [currentTime, setCurrentTime] = useState('09:41');
    const [quizAnswer, setQuizAnswer] = useState(null);

    // Update digital clock for native status bar
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

    // Escape key for quick exit
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setDiscreetMode(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const navItems = [
        { name: 'Home', href: '/dashboard', icon: Home, match: '/dashboard' },
        { name: 'Track', href: '/cycle', icon: Calendar, match: '/cycle' },
        { name: 'Learn', href: '/learn', icon: BookOpen, match: '/learn' },
        { name: 'Luna AI', href: '/luna', icon: Sparkles, match: '/luna' },
        { name: 'Support', href: '/support', icon: MapPin, match: '/support' },
    ];

    const drawerNavItems = [
        { name: 'Home Dashboard', href: '/dashboard', icon: Home },
        { name: 'Cycle Tracker & Logs', href: '/cycle', icon: Calendar },
        { name: 'Learn Hub & Guides', href: '/learn', icon: BookOpen },
        { name: 'Busting Myths vs Facts', href: '/learn/myths-facts', icon: CheckCircle2 },
        { name: 'Ask Luna AI Assistant', href: '/luna', icon: Sparkles },
        { name: 'Community Discussions', href: '/community', icon: Users },
        { name: 'Emergency Supplies', href: '/support/request', icon: Heart },
        { name: 'Find Pad Hubs & Clinics', href: '/support/map', icon: MapPin },
        { name: 'Sponsor a Girl', href: '/support/sponsor', icon: Heart },
        { name: 'Trusted Family Circle', href: '/trusted-circle', icon: Users },
        { name: 'Profile & Privacy Settings', href: '/profile', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#FBECEF] via-[#F4F1F4] to-[#EBF3F5] flex items-center justify-center p-0 sm:py-6 sm:px-4 font-sans selection:bg-rose-100 selection:text-rose-900">

            {/* NATIVE APP SHELL (Mobile Frame on Desktop, Edge-to-Edge on Handheld) */}
            <div className="w-full max-w-[440px] h-screen sm:h-[860px] sm:max-h-[92vh] bg-[#FAF6F7] sm:rounded-[48px] shadow-[0_20px_60px_-15px_rgba(112,38,56,0.18)] sm:border-[8px] sm:border-slate-900/90 sm:ring-1 sm:ring-black/10 relative flex flex-col overflow-hidden [transform:translateZ(0)]">

                {/* 1. NATIVE SYSTEM STATUS BAR (Clock, Dynamic Notch, Battery) */}
                <div className="w-full bg-white/90 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-slate-800 text-xs font-semibold z-50 select-none border-b border-rose-100/40 shrink-0">
                    <span className="font-bold tracking-tight text-[11px]">{currentTime}</span>

                    {/* Native Pill Dynamic Island / Speaker */}
                    <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
                        <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                        <div className="w-2.5 h-1 rounded-full bg-slate-700" />
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-700">
                        <Wifi className="w-3.5 h-3.5" />
                        <BatteryMedium className="w-4 h-4 text-emerald-600" />
                    </div>
                </div>

                {discreetMode ? (
                    /* DISCREET STUDY MODE SCREEN (Fully fits inside phone mockup, authentic school revision) */
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 text-slate-800 overflow-hidden font-sans">
                        {/* Study App Top Bar */}
                        <div className="bg-emerald-800 text-white px-4 py-2.5 flex items-center justify-between shadow-xs shrink-0">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-xs leading-none">ECZ Revision Hub</h2>
                                    <span className="text-[10px] text-emerald-200">Grade 11 Biology • Unit 4</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setDiscreetMode(false)}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-700/80 hover:bg-emerald-700 active:scale-95 text-emerald-100 hover:text-white rounded-lg transition flex items-center space-x-1"
                                title="Exit study notes (ESC)"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                <span>Exit Notes</span>
                            </button>
                        </div>

                        {/* Study Content Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 hide-scrollbar">
                            {/* Subject Banner */}
                            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Syllabus Topic 4.2
                                </span>
                                <h1 className="font-bold text-sm text-slate-900 mt-1">
                                    Plant Respiration & Photosynthesis
                                </h1>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Term 2 Exam Preparation • Ministry of General Education Zambia
                                </p>
                            </div>

                            {/* Core Notes */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 text-xs text-slate-700 leading-relaxed">
                                <h3 className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-1 flex items-center space-x-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                    <span>Key Examination Concepts</span>
                                </h3>

                                <p>
                                    <strong className="text-slate-900">1. Chloroplast Structure:</strong> Chloroplasts contain chlorophyll pigments situated within thylakoid membranes where light-dependent reactions take place.
                                </p>

                                <p>
                                    <strong className="text-slate-900">2. Calvin Cycle (Dark Reactions):</strong> Carbon dioxide (CO₂) is fixed into 3-carbon sugars in the stroma using ATP and NADPH generated during the light phase.
                                </p>

                                <p>
                                    <strong className="text-slate-900">3. Gas Exchange & Stomata:</strong> Specialized guard cells regulate transpiration and carbon dioxide intake while guarding against excessive water loss in arid environments.
                                </p>
                            </div>

                            {/* Chemical Formula Callout */}
                            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-xs">
                                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-1">
                                    Balanced Photosynthesis Equation
                                </span>
                                <div className="font-mono text-[11px] font-bold text-emerald-950 bg-white/80 p-2 rounded-xl text-center border border-emerald-200/60 shadow-2xs">
                                    6CO₂ + 6H₂O + Light Energy ➔ C₆H₁₂O₆ + 6O₂
                                </div>
                            </div>

                            {/* Interactive Revision Quiz */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Quick Check Question
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        ECZ Past Paper
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-slate-800">
                                    Which organelle is the primary site of aerobic cellular respiration in plant cells?
                                </p>
                                <div className="space-y-1.5 pt-1">
                                    {[
                                        { id: 'A', text: 'Ribosome' },
                                        { id: 'B', text: 'Mitochondrion (Site of ATP synthesis)', correct: true },
                                        { id: 'C', text: 'Golgi Apparatus' },
                                        { id: 'D', text: 'Endoplasmic Reticulum' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setQuizAnswer(opt.id)}
                                            className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between border ${
                                                quizAnswer === opt.id
                                                    ? opt.correct
                                                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                                                        : 'bg-rose-50 border-rose-300 text-rose-900'
                                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span><strong className="mr-1.5">{opt.id}.</strong> {opt.text}</span>
                                            {quizAnswer === opt.id && (
                                                <span className={`text-[10px] font-bold ${opt.correct ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                    {opt.correct ? '✓ Correct' : '✕ Try Again'}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Assignment Box */}
                            <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-start space-x-2.5">
                                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                    !
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Weekly Assignment</span>
                                    <span>Complete revision questions 4.1 to 4.5 in textbook Chapter 4 by Friday 17:00.</span>
                                </div>
                            </div>

                            <div className="text-center pt-2 pb-1">
                                <span className="text-[10px] text-slate-400">Class notes saved locally • Offline ready • Press ESC to return</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 2. NATIVE APP TOP BAR */}
                        <header className="bg-white/90 backdrop-blur-xl px-4 py-2.5 border-b border-rose-100/70 flex items-center justify-between sticky top-0 z-40 shadow-[0_2px_12px_rgba(112,38,56,0.03)] shrink-0">
                            {/* Left: Brand Icon + Title */}
                            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
                                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-xs group-active:scale-95 transition">
                                    <span className="text-xs">🌙</span>
                                </div>
                                <div>
                                    <span className="font-extrabold text-base text-slate-900 tracking-tight leading-none block">
                                        {title}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[170px] leading-tight">
                                        {subtitle}
                                    </span>
                                </div>
                            </Link>

                            {/* Right: Action Button, Quick Exit & Menu Trigger */}
                            <div className="flex items-center space-x-1.5">
                                {actionButton}

                                {/* Discreet Safety Mode Trigger */}
                                <button
                                    onClick={() => setDiscreetMode(true)}
                                    title="Discreet Mode / Quick Disguise (ESC)"
                                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 flex items-center justify-center shadow-xs transition active:scale-90"
                                    aria-label="Quick Exit"
                                >
                                    <Shield className="w-4 h-4 text-rose-600" />
                                </button>

                                {/* Native Drawer Menu Trigger */}
                                <button
                                    onClick={() => setDrawerOpen(true)}
                                    aria-label="Open App Menu"
                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition active:scale-90"
                                >
                                    <Menu className="w-4 h-4" />
                                </button>
                            </div>
                        </header>

                        {/* 3. NATIVE SCROLLABLE APP BODY */}
                        <main className={`flex-1 min-h-0 w-full min-w-0 overflow-x-hidden ${
                            fullHeight
                                ? `flex flex-col overflow-hidden px-3 pt-2 ${showNav ? 'pb-20' : 'pb-2'}`
                                : `overflow-y-auto px-4 pt-4 hide-scrollbar ${showNav ? 'pb-24' : 'pb-4'}`
                        }`}>
                            {children}
                        </main>

                        {/* 4. NATIVE FLOATING SEMI-GLASS TAB BAR */}
                        {showNav && (
                            <div className="absolute bottom-2.5 inset-x-3 z-40 pointer-events-none">
                                <nav className="pointer-events-auto bg-white/75 backdrop-blur-2xl border border-white/80 ring-1 ring-rose-200/50 shadow-[0_12px_36px_-6px_rgba(112,38,56,0.18),0_4px_16px_rgba(0,0,0,0.04)] rounded-full px-1.5 py-1.5 flex items-center justify-around">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = currentUrl === item.match || currentUrl.startsWith(item.match + '/');

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-200 active:scale-90 ${isActive
                                                    ? 'text-rose-600 font-bold'
                                                    : 'text-slate-400 hover:text-slate-600 font-medium'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-rose-50/90 text-rose-600 shadow-2xs scale-105' : ''
                                                    }`}>
                                                    <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                                                </div>
                                                <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                                                    {item.name}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        )}
                    </>
                )}

            {/* 5. NATIVE HOME INDICATOR BAR (iPhone Home Indicator) */}
            <div className="absolute bottom-0.5 inset-x-0 h-1 flex justify-center pointer-events-none z-50">
                <div className="w-32 h-1 bg-slate-300 rounded-full opacity-60" />
            </div>

            {/* NATIVE SLIDE-IN APP DRAWER */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                    <div
                        className="fixed inset-0 bg-transparent"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className="relative w-full h-full bg-white p-5 flex flex-col justify-between z-10 overflow-y-auto border-r border-rose-100 hide-scrollbar">
                    <div>
                        {/* Drawer User Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{user?.name || 'Mwezi Member'}</h3>
                                    <p className="text-[10px] text-rose-600 font-semibold capitalize mt-0.5">
                                        {user?.role?.replace('_', ' ') || 'Primary User'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
                                aria-label="Close Drawer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Menu Options List */}
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">App Navigation</span>
                            {drawerNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentUrl === item.href || currentUrl.startsWith(item.href + '/');

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition active:scale-[0.98] ${isActive
                                            ? 'bg-rose-50 text-rose-700 font-bold'
                                            : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        onClick={() => setDrawerOpen(false)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                                            <span>{item.name}</span>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Special Operational Portals */}
                        {(user?.role === 'admin' || user?.role === 'community_partner' || user?.role === 'health_reviewer') && (
                            <div className="mt-4 pt-3 border-t border-rose-100">
                                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider px-2">Operational Portals</span>
                                {user?.role === 'community_partner' && (
                                    <Link
                                        href="/portal/partner"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-2xl bg-amber-50 text-amber-900 font-semibold text-xs mt-1.5"
                                        onClick={() => setDrawerOpen(false)}
                                    >
                                        <span>Hub Distribution Portal</span>
                                    </Link>
                                )}
                                {user?.role === 'health_reviewer' && (
                                    <Link
                                        href="/portal/reviewer"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-2xl bg-teal-50 text-teal-900 font-semibold text-xs mt-1.5"
                                        onClick={() => setDrawerOpen(false)}
                                    >
                                        <span>Medical Review Portal</span>
                                    </Link>
                                )}
                                {user?.role === 'admin' && (
                                    <Link
                                        href="/portal/admin"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-2xl bg-purple-50 text-purple-900 font-semibold text-xs mt-1.5"
                                        onClick={() => setDrawerOpen(false)}
                                    >
                                        <span>Admin & M&E Dashboard</span>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom Native Actions */}
                    <div className="pt-4 border-t border-rose-100 space-y-2">
                        <button
                            onClick={() => { setDrawerOpen(false); setShowEmergencyModal(true); }}
                            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition"
                        >
                            <PhoneCall className="w-4 h-4" />
                            <span>Emergency Helplines (116)</span>
                        </button>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full py-2 px-4 text-xs text-rose-700 hover:bg-rose-50 rounded-xl font-medium flex items-center justify-center space-x-1.5 transition"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Log Out</span>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

            {/* EMERGENCY HELPLINES NATIVE MODAL */}
            {showEmergencyModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                    <div
                        className="fixed inset-0 bg-transparent"
                        onClick={() => setShowEmergencyModal(false)}
                    />
                    <div className="relative bg-white rounded-t-[32px] w-full p-6 shadow-2xl space-y-4 border-t border-rose-100 z-10">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-1" />
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                                    <PhoneCall className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">Emergency Support (Zambia)</h3>
                                    <p className="text-[10px] text-slate-500">Free, confidential 24/7 hotlines</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEmergencyModal(false)} className="text-slate-400 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            <a
                                href="tel:116"
                                className="block p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 shadow-xs"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800">Childline / Lifeline Zambia</span>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">116</span>
                                </div>
                                <div className="text-sm font-extrabold text-emerald-700 mt-0.5">Toll-Free 116</div>
                                <div className="text-[10px] text-slate-500">24/7 reproductive & psychosocial support</div>
                            </a>

                            <a
                                href="tel:992"
                                className="block p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/70 shadow-xs"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800">National GBV Hotline</span>
                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">992</span>
                                </div>
                                <div className="text-sm font-extrabold text-rose-700 mt-0.5">Toll-Free 992</div>
                                <div className="text-[10px] text-slate-500">Immediate emergency intervention</div>
                            </a>
                        </div>

                        <button
                            onClick={() => setShowEmergencyModal(false)}
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-2xl transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
