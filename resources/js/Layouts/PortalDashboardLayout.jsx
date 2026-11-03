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
        <div className="min-h-screen bg-[#F4F9FB] flex flex-col md:flex-row text-mwezi-dark font-sans">
            {/* Mobile Header */}
            <div className="md:hidden bg-mwezi-accent h-16 px-4 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-2">
                    <span className="font-heading text-2xl font-bold text-mwezi-brandText">Mwezi</span>
                    <span className="text-white text-xs px-2 py-0.5 rounded bg-white/20">{portalRole}</span>
                </div>
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg bg-white/20 text-white"
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Sidebar Desktop & Mobile drawer */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-mwezi-primary/40 flex flex-col justify-between transition-transform duration-200
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6">
                    {/* Brand Banner */}
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 rounded-[14px] bg-mwezi-accent flex items-center justify-center shadow-md">
                            <span className="font-heading font-extrabold text-xl text-mwezi-brandText">M</span>
                        </div>
                        <div>
                            <h2 className="font-heading font-bold text-lg text-mwezi-tertiary leading-tight">Mwezi Portal</h2>
                            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{portalRole} Workspace</p>
                        </div>
                    </div>

                    {/* Navigation Groups */}
                    <div className="space-y-6">
                        {navSections.map((sec, idx) => (
                            <div key={idx}>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
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
                                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-[14px] text-xs font-semibold transition ${
                                                    active 
                                                        ? 'bg-mwezi-secondary text-mwezi-tertiary shadow-sm' 
                                                        : 'text-gray-600 hover:bg-mwezi-primary/20 hover:text-mwezi-tertiary'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span>{link.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
                                Mobile App Preview
                            </div>
                            <Link
                                href="/dashboard"
                                className="flex items-center space-x-3 px-3 py-2.5 rounded-[14px] text-xs font-semibold text-gray-600 hover:bg-mwezi-primary/20 hover:text-mwezi-tertiary transition"
                            >
                                <LayoutDashboard className="w-4 h-4 text-mwezi-accent" />
                                <span>Switch to User View</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* User info & Logout */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-mwezi-primary/60 flex items-center justify-center font-bold text-xs text-mwezi-tertiary">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-gray-800 truncate">{user?.name || 'Partner Staff'}</p>
                                <p className="text-[10px] text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full py-2 px-3 rounded-xl bg-white border border-red-200 text-mwezi-tertiary text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-red-50 transition"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
                {/* Desktop Topbar */}
                <header className="hidden md:flex h-16 bg-white border-b border-mwezi-primary/30 px-8 items-center justify-between sticky top-0 z-30">
                    <div>
                        <h1 className="font-heading font-bold text-xl text-mwezi-tertiary">{portalTitle}</h1>
                        <p className="text-xs text-gray-500">Mwezi Operations, Supply Chain & Verified Health Services</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 bg-mwezi-secondary text-mwezi-tertiary text-xs font-bold rounded-full">
                            Role: {user?.role?.replace('_', ' ')}
                        </span>
                        <Link 
                            href="/dashboard"
                            className="px-3 py-1.5 bg-mwezi-accent text-white hover:bg-mwezi-accent/90 text-xs font-bold rounded-xl transition shadow-sm"
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

