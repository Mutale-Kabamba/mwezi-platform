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
    EyeOff, 
    PhoneCall, 
    Bell, 
    Settings,
    LogOut,
    CheckCircle2
} from 'lucide-react';

export default function MobileAppLayout({ 
    children, 
    title = 'Mwezi', 
    subtitle = 'Menstrual Health & Dignity', 
    showNav = true,
    actionButton = null 
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const currentUrl = window.location.pathname;

    // Quick Exit / Discreet Shield Mode State
    const [discreetMode, setDiscreetMode] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);

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

    // Discreet Mode disguised view (Study / Weather Notes)
    if (discreetMode) {
        return (
            <div className="w-full max-w-[440px] mx-auto min-h-screen bg-white p-6 font-sans text-gray-800">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Grade 11 Biology Notes</h1>
                        <p className="text-xs text-gray-500">Unit 4: Plant Cell Respiration & Photosynthesis</p>
                    </div>
                    <button 
                        onClick={() => setDiscreetMode(false)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded-md text-gray-600 font-medium"
                    >
                        Restore
                    </button>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-gray-700">
                    <p><strong>1. Chloroplast Structure:</strong> Chloroplasts contain chlorophyll within thylakoid membranes where light-dependent reactions take place.</p>
                    <p><strong>2. Calvin Cycle:</strong> Carbon dioxide is fixed into 3-carbon sugars in the stroma using ATP and NADPH produced during light reactions.</p>
                    <div className="p-4 bg-gray-50 border rounded-lg">
                        <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold block mb-1">Weekly Assignment</span>
                        Complete study exercises 4.1 to 4.5 by Friday at 17:00.
                    </div>
                </div>
            </div>
        );
    }

    const navItems = [
        { name: 'Home', href: '/dashboard', icon: Home, match: '/dashboard' },
        { name: 'Track', href: '/cycle', icon: Calendar, match: '/cycle' },
        { name: 'Learn', href: '/learn', icon: BookOpen, match: '/learn' },
        { name: 'Luna AI', href: '/luna', icon: Sparkles, match: '/luna' },
        { name: 'Support', href: '/support', icon: MapPin, match: '/support' },
        { name: 'Community', href: '/community', icon: Users, match: '/community' },
    ];

    return (
        <div className="w-full max-w-[440px] mx-auto min-h-screen bg-[#F0F9FA] relative flex flex-col justify-between shadow-2xl overflow-x-hidden selection:bg-mwezi-secondary">
            
            {/* TOP HEADER: 440x96px, Background #F98B88, Heading #89F6FA, Supporting #FFFFFF, Rounded-b-[20px] */}
            <header className="h-[96px] w-full bg-mwezi-accent rounded-b-[20px] px-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
                {/* Left: Branding & Subtitle */}
                <div className="flex flex-col justify-center">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <span className="font-heading font-extrabold text-[30px] leading-none text-mwezi-brandText drop-shadow-sm tracking-wide">
                            {title}
                        </span>
                    </Link>
                    <span className="text-white text-[12px] font-medium tracking-normal opacity-95">
                        {subtitle}
                    </span>
                </div>

                {/* Right: Quick Exit Shield & 50x50 Action / Menu Icon */}
                <div className="flex items-center space-x-2">
                    {/* Quick Exit / Discreet Shield Button */}
                    <button
                        onClick={() => setDiscreetMode(true)}
                        title="Discreet Mode / Quick Exit (ESC)"
                        className="h-10 px-2 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center space-x-1 transition duration-150 text-xs font-medium"
                    >
                        <Shield className="w-4 h-4 text-mwezi-brandText" />
                        <span className="hidden sm:inline">Discreet</span>
                    </button>

                    {/* Uniform 50x50 Menu Icon */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open Navigation Menu"
                        className="h-[50px] w-[50px] rounded-full bg-white/25 hover:bg-white/35 active:scale-95 flex items-center justify-center text-white transition-all shadow-inner"
                    >
                        <Menu className="w-6 h-6 text-white" />
                    </button>
                </div>
            </header>

            {/* SIDE DRAWER MODAL */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div 
                        className="fixed inset-0 bg-mwezi-dark/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className="relative w-[320px] max-w-full bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
                        <div>
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-mwezi-primary/40 flex items-center justify-center text-mwezi-tertiary font-bold text-lg">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 leading-tight">{user?.name || 'Mwezi Member'}</h3>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Primary User'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setDrawerOpen(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Quick Role Badges & Navigation */}
                            <div className="space-y-1 py-2">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">Navigation</span>
                                <Link 
                                    href="/dashboard" 
                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-mwezi-primary/20 text-gray-700 font-medium text-sm"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <Home className="w-4 h-4 text-mwezi-accent" />
                                    <span>Home Dashboard</span>
                                </Link>
                                <Link 
                                    href="/cycle" 
                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-mwezi-primary/20 text-gray-700 font-medium text-sm"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <Calendar className="w-4 h-4 text-mwezi-accent" />
                                    <span>Cycle Tracker & Logs</span>
                                </Link>
                                <Link 
                                    href="/learn" 
                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-mwezi-primary/20 text-gray-700 font-medium text-sm"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <BookOpen className="w-4 h-4 text-mwezi-accent" />
                                    <span>Learn Hub & Reusable Pads</span>
                                </Link>
                                <Link 
                                    href="/learn/myths-facts" 
                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-mwezi-primary/20 text-gray-700 font-medium text-sm"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <CheckCircle2 className="w-4 h-4 text-mwezi-accent" />
                                    <span>Myths vs. Facts</span>
                                </Link>
                                <Link 
                                    href="/luna" 
                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-mwezi-primary/20 text-gray-700 font-medium text-sm"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <Sparkles className="w-4 h-4 text-mwezi-accent" />
                                    <span>Ask Luna AI</span>
                                </Link>
                                <Link 
                                    href="/support/request" 
                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-mwezi-primary/20 text-gray-700 font-medium text-sm"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <Heart className="w-4 h-4 text-mwezi-tertiary" />
                                    <span>Request Emergency Supplies</span>
                                </Link>
                                <Link 
                                    href="/support/map" 
                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-mwezi-primary/20 text-gray-700 font-medium text-sm"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <MapPin className="w-4 h-4 text-mwezi-accent" />
                                    <span>Find Service Hubs & Pads</span>
                                </Link>
                                <Link 
                                    href="/support/sponsor" 
                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-mwezi-primary/20 text-gray-700 font-medium text-sm"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <Heart className="w-4 h-4 text-mwezi-accent" />
                                    <span>Sponsor a Girl / Donate</span>
                                </Link>
                                <Link 
                                    href="/trusted-circle" 
                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-mwezi-primary/20 text-gray-700 font-medium text-sm"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <Users className="w-4 h-4 text-mwezi-accent" />
                                    <span>Trusted Family Circle</span>
                                </Link>
                                <Link 
                                    href="/profile" 
                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-mwezi-primary/20 text-gray-700 font-medium text-sm"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <Settings className="w-4 h-4 text-gray-600" />
                                    <span>Profile & Privacy Settings</span>
                                </Link>
                            </div>

                            {/* Portals Access for Special Roles */}
                            {(user?.role === 'admin' || user?.role === 'community_partner' || user?.role === 'health_reviewer') && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <span className="text-[11px] font-bold text-mwezi-tertiary uppercase tracking-wider px-2">Operational Portals</span>
                                    {user?.role === 'community_partner' && (
                                        <Link 
                                            href="/portal/partner" 
                                            className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-mwezi-secondary/40 text-mwezi-tertiary font-semibold text-xs mt-2"
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            <span>Hub Distribution Portal</span>
                                        </Link>
                                    )}
                                    {user?.role === 'health_reviewer' && (
                                        <Link 
                                            href="/portal/reviewer" 
                                            className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-mwezi-secondary/40 text-mwezi-tertiary font-semibold text-xs mt-2"
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            <span>Medical Review Portal</span>
                                        </Link>
                                    )}
                                    {user?.role === 'admin' && (
                                        <Link 
                                            href="/portal/admin" 
                                            className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-mwezi-secondary/40 text-mwezi-tertiary font-semibold text-xs mt-2"
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            <span>Admin & M&E Dashboard</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Drawer Bottom Actions */}
                        <div className="pt-4 border-t border-gray-100 space-y-2">
                            <button
                                onClick={() => { setDrawerOpen(false); setShowEmergencyModal(true); }}
                                className="w-full py-2.5 px-4 bg-mwezi-tertiary text-white rounded-[20px] text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm"
                            >
                                <PhoneCall className="w-4 h-4" />
                                <span>Emergency Helplines (Zambia)</span>
                            </button>

                            <Link 
                                href="/logout" 
                                method="post" 
                                as="button"
                                className="w-full py-2 px-4 text-xs text-mwezi-tertiary hover:bg-red-50 rounded-xl font-medium flex items-center justify-center space-x-1"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Log Out</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* EMERGENCY HELPLINES MODAL */}
            {showEmergencyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[20px] max-w-sm w-full p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <h3 className="font-heading font-bold text-lg text-mwezi-tertiary flex items-center space-x-2">
                                <PhoneCall className="w-5 h-5 text-mwezi-tertiary" />
                                <span>Emergency Support (Zambia)</span>
                            </h3>
                            <button onClick={() => setShowEmergencyModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-600">
                            If you are in severe pain, need crisis counseling, or face immediate safeguarding issues:
                        </p>
                        <div className="space-y-2">
                            <a href="tel:116" className="block p-3 rounded-xl bg-mwezi-primary/30 border border-mwezi-primary hover:bg-mwezi-primary/50 transition">
                                <div className="text-xs font-bold text-gray-800">Childline / Lifeline Zambia</div>
                                <div className="text-sm font-extrabold text-mwezi-tertiary">Toll-Free 116</div>
                                <div className="text-[11px] text-gray-500">24/7 Free confidential psychosocial support</div>
                            </a>
                            <a href="tel:992" className="block p-3 rounded-xl bg-mwezi-secondary/40 border border-mwezi-secondary hover:bg-mwezi-secondary/60 transition">
                                <div className="text-xs font-bold text-gray-800">National Gender-Based Violence (GBV) Line</div>
                                <div className="text-sm font-extrabold text-mwezi-tertiary">Toll-Free 992</div>
                                <div className="text-[11px] text-gray-500">Safe, immediate emergency intervention</div>
                            </a>
                        </div>
                        <button 
                            onClick={() => setShowEmergencyModal(false)}
                            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <main className={`flex-1 w-full px-4 pt-4 pb-28`}>
                {children}
            </main>

            {/* BOTTOM NAVIGATION BAR: 440x96px, Top corners rounded 20px, 70x70px Nav circles */}
            {showNav && (
                <nav className="h-[96px] w-full max-w-[440px] bg-white/95 backdrop-blur-md border-t border-mwezi-secondary rounded-t-[20px] fixed bottom-0 z-40 px-2 flex items-center justify-around shadow-2xl">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentUrl === item.match || currentUrl.startsWith(item.match + '/');

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="group flex flex-col items-center justify-center relative"
                            >
                                {/* Uniform 70x70px Navigation Icon Circle */}
                                <div 
                                    className={`h-[56px] w-[56px] sm:h-[64px] sm:w-[64px] rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-mwezi-secondary text-mwezi-tertiary shadow-md scale-105 border-2 border-mwezi-accent' 
                                            : 'text-gray-500 hover:bg-mwezi-primary/20 hover:text-mwezi-tertiary'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-mwezi-tertiary stroke-[2.5]' : 'stroke-[1.8]'}`} />
                                    <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-bold text-mwezi-tertiary' : 'text-gray-600'}`}>
                                        {item.name}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            )}
        </div>
    );
}

