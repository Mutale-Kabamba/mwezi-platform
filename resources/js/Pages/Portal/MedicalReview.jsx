import React from 'react';
import { Head, router } from '@inertiajs/react';
import PortalDashboardLayout from '@/Layouts/PortalDashboardLayout';
import { 
    Stethoscope, 
    CheckCircle, 
    Clock, 
    FileText, 
    ShieldCheck, 
    Eye, 
    Check, 
    AlertCircle 
} from 'lucide-react';

export default function MedicalReview({ pendingArticles = [], approvedArticles = [] }) {
    const handleApprove = (articleId) => {
        router.post(route('portal.reviewer.approve', articleId));
    };

    return (
        <PortalDashboardLayout portalTitle="Clinical & Health Content Governance" portalRole="Reviewer">
            <Head title="Medical Review Queue - Mwezi" />

            <div className="space-y-6">
                
                {/* 1. CLINICAL GOVERNANCE BANNER */}
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-mwezi-primary/40 flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-[16px] bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-xs">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Healthcare Partner Workspace</span>
                            <h2 className="font-heading font-extrabold text-xl text-gray-900 mt-0.5">
                                Verified Medical Clearance Desk
                            </h2>
                            <p className="text-xs text-gray-500">
                                Ensure every article, reusable pad guide, and Luna AI response chunk adheres to adolescent health standards.
                            </p>
                        </div>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[16px] text-center">
                        <span className="font-heading font-extrabold text-xl text-emerald-800 block">
                            {approvedArticles.length}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Approved</span>
                    </div>
                </div>

                {/* 2. PENDING REVIEW QUEUE */}
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-heading font-bold text-base text-mwezi-tertiary">
                                Awaiting Medical Clearance
                            </h3>
                            <p className="text-xs text-gray-500">Guides requiring clinical review before mobile publication.</p>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                            {pendingArticles.length} Pending
                        </span>
                    </div>

                    {pendingArticles.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-800">All submissions clinically approved!</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">No pending articles in the verification queue.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {pendingArticles.map((art) => (
                                <div key={art.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[10px] font-bold text-mwezi-tertiary bg-mwezi-primary/40 px-2 py-0.5 rounded-md">
                                                {art.category?.name}
                                            </span>
                                            <h4 className="font-heading font-bold text-sm text-gray-900">{art.title}</h4>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{art.summary}</p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleApprove(art.id)}
                                            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Grant Medical Clearance</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. APPROVED CONTENT CATALOG */}
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-heading font-bold text-base text-gray-900">
                        Active Verified Educational Resources
                    </h3>

                    <div className="divide-y divide-gray-100">
                        {approvedArticles.map((art) => (
                            <div key={art.id} className="py-3 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-xs text-gray-800">{art.title}</h4>
                                    <p className="text-[10px] text-gray-500">{art.category?.name} • {art.read_time_minutes} min read</p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                        <span>Medically Approved</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PortalDashboardLayout>
    );
}

