import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    ClipboardCheck, 
    Heart, 
    Users, 
    BarChart3, 
    Settings, 
    LogOut, 
    Bell, 
    ChevronRight,
    ShieldCheck,
    Menu,
    X,
    Building2,
    Stethoscope,
    FileText
} from 'lucide-react';

export default function PortalDashboardLayout({ 
    children, 
    portalTitle = 'Mwezi Operations Portal',
    portalRole = 'Partner'
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const currentUrl = window.location.pathname;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Sidebar items based on portal/role
    const partnerLinks = [
        { name: 'Hub Inventory & Requests', href: '/portal/partner', icon: Package },
        { name: 'Emergency Supplies', href: '/portal/partner/supplies', icon: Heart },
        { name: 'Community Programs', href: '/portal/partner/programs', icon: Building2 },
    ];

    const reviewerLinks = [
        { name: 'Medical Review Queue', href: '/portal/reviewer', icon: Stethoscope },
        { name: 'Luna AI Knowledge Review', href: '/portal/reviewer/luna', icon: ShieldCheck },
        { name: 'Clinical Escalations', href: '/portal/reviewer/escalations', icon: FileText },
    ];

    const adminLinks = [
        { name: 'M&E Analytics & Impact', href: '/portal/admin', icon: BarChart3 },
        { name: 'Partner Hub Approvals', href: '/portal/admin/hubs', icon: Building2 },
        { name: 'Sponsorship Oversight', href: '/portal/admin/sponsorships', icon: Heart },
        { name: 'Safeguarding & Moderation', href: '/portal/admin/moderation', icon: ShieldCheck },
    ];

    let navSections = [];
    if (user?.role === 'admin') {
        navSections = [
            { label: 'Admin Oversight', links: adminLinks },
            { label: 'Partner Management', links: partnerLinks },
            { label: 'Clinical Review', links: reviewerLinks },
        ];
    } else if (user?.role === 'health_reviewer') {
        navSections = [{ label: 'Clinical Governance', links: reviewerLinks }];
    } else {
        navSections = [{ label: 'Distribution & Operations', links: partnerLinks }];
    }

    return (
        <div className="relative min-h-screen bg-[#F8EAE6] flex flex-col md:flex-row text-[#2D2638] font-sans selection:bg-purple-200/60 selection:text-[#2D2638]">
            {/* Ambient Soft Pastel Mesh Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-28 -left-24 h-[420px] w-[420px] rounded-full bg-[#FADCD3] opacity-85 blur-3xl" />
                <div className="absolute top-1/4 -right-28 h-[460px] w-[460px] rounded-full bg-[#D8C2FA] opacity-70 blur-3xl" />
                <div className="absolute -bottom-32 left-1/3 h-[440px] w-[440px] rounded-full bg-[#F3D2E5] opacity-80 blur-3xl" />
            </div>

            {/* Mobile Header */}
            <div className="relative z-20 md:hidden bg-white/65 backdrop-blur-xl border-b border-white/80 h-16 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="font-heading text-2xl font-bold text-[#2D2638]">Mwezi</span>
                    <span className="text-[#5E546B] text-xs px-2.5 py-0.5 rounded-full bg-white/75 border border-white">{portalRole}</span>
                </div>
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-xl bg-white/75 border border-white text-[#2D2638]"
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Sidebar Desktop & Mobile drawer */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-40 w-64 bg-white/55 backdrop-blur-2xl border-r border-white/80 flex flex-col justify-between transition-transform duration-200
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6">
                    {/* Brand Banner */}
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-300 via-pink-200 to-purple-300 border border-white flex items-center justify-center shadow-xs">
                            <span className="font-heading font-extrabold text-xl text-[#2D2638]">M</span>
                        </div>
                        <div>
                            <h2 className="font-heading font-bold text-lg text-[#2D2638] leading-tight">Mwezi Portal</h2>
                            <p className="text-[11px] font-medium text-[#6E637C] uppercase tracking-wider">{portalRole} Workspace</p>
                        </div>
                    </div>

                    {/* Navigation Groups */}
                    <div className="space-y-6">
                        {navSections.map((sec, idx) => (
                            <div key={idx}>
                                <div className="text-[10px] font-bold text-[#8A7F99] uppercase tracking-wider mb-2 px-3">
                                    {sec.label}
                                </div>
                                <div className="space-y-1">
                                    {sec.links.map((link) => {
                                        const Icon = link.icon;
                                        const active = currentUrl === link.href;
                                        return (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition ${
                                                    active 
                                                        ? 'bg-white/90 text-[#2D2638] border border-white shadow-xs' 
                                                        : 'text-[#5E546B] hover:bg-white/60 hover:text-[#2D2638]'
                                                }`}
                                            >
                                                <Icon className={`w-4 h-4 ${active ? 'text-rose-500' : 'text-[#7C718B]'}`} />
                                                <span>{link.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <div>
                            <div className="text-[10px] font-bold text-[#8A7F99] uppercase tracking-wider mb-2 px-3">
                                Mobile App Preview
                            </div>
                            <Link
                                href="/dashboard"
                                className="flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-xs font-semibold text-[#5E546B] hover:bg-white/60 hover:text-[#2D2638] transition"
                            >
                                <LayoutDashboard className="w-4 h-4 text-purple-500" />
                                <span>Switch to User View</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* User info & Logout */}
                <div className="p-4 border-t border-white/75 bg-white/35">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-200 to-purple-200 border border-white flex items-center justify-center font-bold text-xs text-[#2D2638]">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-[#2D2638] truncate">{user?.name || 'Partner Staff'}</p>
                                <p className="text-[10px] text-[#6E637C] capitalize">{user?.role?.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full py-2 px-3 rounded-full bg-white/80 hover:bg-white border border-white text-[#2D2638] text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-xs"
                    >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Log Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="relative z-10 flex-1 flex flex-col min-h-screen overflow-y-auto">
                {/* Desktop Topbar */}
                <header className="hidden md:flex h-16 bg-white/45 backdrop-blur-xl border-b border-white/80 px-8 items-center justify-between sticky top-0 z-30">
                    <div>
                        <h1 className="font-heading font-bold text-xl text-[#2D2638]">{portalTitle}</h1>
                        <p className="text-xs text-[#6E637C]">Mwezi Operations, Supply Chain & Verified Health Services</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-white/75 border border-white text-[#5E546B] text-xs font-semibold rounded-full">
                            Role: {user?.role?.replace('_', ' ')}
                        </span>
                        <Link 
                            href="/dashboard"
                            className="px-4 py-1.5 rounded-full bg-white/85 hover:bg-white border border-white text-[#2D2638] text-xs font-bold transition shadow-xs"
                        >
                            Open PWA App
                        </Link>
                    </div>
                </header>

                <main className="p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

