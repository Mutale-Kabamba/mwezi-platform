import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { 
    Users, 
    Calendar, 
    Heart, 
    ShieldCheck, 
    BookOpen, 
    Sparkles, 
    ChevronRight,
    Lock
} from 'lucide-react';

export default function CompanionDashboard({ 
    connection, 
    cycleSummary, 
    allyArticles = [] 
}) {
    return (
        <MobileAppLayout title="Companion View" subtitle="Supportive Family Ally">
            <Head title="Trusted Companion View - Mwezi" />

            <div className="space-y-4">
                
                {/* 1. COMPANION ROLE BANNER */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-mwezi-secondary/60 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-mwezi-secondary/80 flex items-center justify-center text-mwezi-tertiary font-bold">
                            <Users className="w-5 h-5 text-mwezi-tertiary" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-mwezi-tertiary">Trusted Companion</span>
                            <h2 className="font-heading font-bold text-sm text-gray-900 leading-tight">
                                Supporting {cycleSummary?.primary_name || 'Your Loved One'}
                            </h2>
                        </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active Ally
                    </span>
                </div>

                {/* 2. NON-INTRUSIVE ARRIVAL FORECAST CONTAINER */}
                {cycleSummary ? (
                    <div className="bg-mwezi-primary rounded-[20px] p-5 shadow-mwezi text-mwezi-dark relative overflow-hidden border border-white">
                        <div className="relative z-10">
                            <span className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-[10px] font-bold text-mwezi-tertiary tracking-wide uppercase">
                                General Cycle Forecast
                            </span>

                            <div className="my-3 flex items-baseline space-x-2">
                                <span className="font-heading font-extrabold text-[36px] leading-none text-mwezi-tertiary">
                                    ~{cycleSummary.days_until_next}
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    days until next expected cycle
                                </span>
                            </div>

                            <p className="text-xs text-gray-700 font-medium leading-relaxed mb-3">
                                Expected window starts around <strong>{cycleSummary.predicted_start_date}</strong>. This is a great time to ensure household pads and warm teas are stocked!
                            </p>

                            <div className="p-2.5 bg-white/80 rounded-xl text-[10px] text-gray-600 flex items-center space-x-1.5 font-medium">
                                <Lock className="w-3.5 h-3.5 text-mwezi-tertiary shrink-0" />
                                <span>Private symptom notes and diary logs are protected and strictly hidden.</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[20px] p-6 text-center border border-gray-100 shadow-sm">
                        <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <h3 className="font-bold text-xs text-gray-800">No Active Sharing Configured</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Ask your loved one to share an invite code with you.</p>
                    </div>
                )}

                {/* 3. PRACTICAL WAYS TO SUPPORT THIS WEEK */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 space-y-3">
                    <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider">
                        Practical Ways to Support This Week
                    </h3>

                    <div className="space-y-2">
                        {[
                            { title: 'Check the Sanitary Pad Supply', desc: 'Ensure clean disposable or reusable pads are readily accessible at home.' },
                            { title: 'Offer Warm Comfort', desc: 'A cup of warm ginger tea or a hot water bottle soothes abdominal muscle tightness.' },
                            { title: 'Normalize the Conversation', desc: 'Never tease, isolate, or treat menstruation as something dirty. Dignity starts at home.' },
                        ].map((tip, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                                <span className="font-bold text-gray-800 block mb-0.5">{tip.title}</span>
                                <span className="text-gray-600 text-[11px] leading-tight block">{tip.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. ALLYSHIP EDUCATIONAL GUIDES */}
                <div className="space-y-2.5">
                    <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider px-1">
                        Educational Guides for Family Allies
                    </h3>

                    {allyArticles.map((art) => (
                        <Link
                            key={art.id}
                            href={`/learn/article/${art.slug}`}
                            className="block p-3.5 bg-white rounded-[20px] border border-gray-100 shadow-sm hover:bg-mwezi-light transition"
                        >
                            <h4 className="font-heading font-bold text-xs text-gray-900 leading-snug mb-1">
                                {art.title}
                            </h4>
                            <p className="text-[11px] text-gray-600 line-clamp-2 mb-2">
                                {art.summary}
                            </p>
                            <div className="flex items-center text-[10px] font-bold text-mwezi-accent space-x-1">
                                <span>Read Full Guide</span>
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </MobileAppLayout>
    );
}

