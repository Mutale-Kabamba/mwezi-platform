import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { 
    Users, 
    UserPlus, 
    Shield, 
    Share2, 
    Copy, 
    Check, 
    Trash2, 
    Lock, 
    HeartHandshake, 
    X,
    Eye
} from 'lucide-react';

export default function TrustedCircleManage({ connections = [], inviteUrlTemplate = '' }) {
    const { t } = useTranslation();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        contact_name: '',
        contact_channel: '',
        relationship: 'mother',
        permissions: ['cycle_phase', 'support_tips'],
    });

    const handleCreateInvite = (e) => {
        e.preventDefault();
        post(route('trusted-circle.invite'), {
            onSuccess: () => {
                setShowInviteModal(false);
                reset();
            },
        });
    };

    const handleRevoke = (connectionId) => {
        if (confirm('Are you sure you want to revoke companion access? They will no longer see any shared information.')) {
            router.delete(route('trusted-circle.revoke', connectionId));
        }
    };

    const copyInvite = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    return (
        <MobileAppLayout title={t('trusted_title', 'Trusted Circle')} subtitle={t('trusted_subtitle', 'Safe Family & Partner Sharing')}>
            <Head title="Trusted Circle - Family & Partner Sharing - Mwezi" />

            <div className="space-y-4">
                
                {/* 1. HERO EXPLANATION CONTAINER */}
                <div className="bg-rose-50/70 rounded-2xl p-4 shadow-2xs border border-rose-100 space-y-2">
                    <div className="flex items-center space-x-2">
                        <HeartHandshake className="w-5 h-5 text-rose-600" />
                        <h2 className="font-heading font-bold text-xs text-rose-800 uppercase tracking-wider">
                            {t('trusted_title', 'You Are Always in Control')}
                        </h2>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-body">
                        {t('trusted_safety_notice', 'Invite a parent, sister, guardian, or trusted partner to support you. They will only see general phase tips and arrival windows you explicitly choose to share. Your private diary notes are never shared.')}
                    </p>
                </div>

                {/* 2. INVITE NEW COMPANION BUTTON */}
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-200/50 transition flex items-center justify-center space-x-2 active:scale-98"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>{t('trusted_invite_btn', 'Invite Family Member or Partner')}</span>
                </button>

                {/* 3. ACTIVE CONNECTIONS LIST */}
                <div className="space-y-3">
                    <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider px-1">
                        Active Companions ({connections.length})
                    </h3>

                    {connections.length === 0 ? (
                        <div className="p-6 bg-white rounded-[20px] text-center border border-dashed border-gray-200">
                            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-gray-600">No companions added yet</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Invite a parent or partner to break stigma at home.</p>
                        </div>
                    ) : (
                        connections.map((conn) => (
                            <div key={conn.id} className="p-4 bg-white rounded-[20px] shadow-sm border border-gray-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-mwezi-primary/40 flex items-center justify-center text-mwezi-tertiary font-bold text-xs">
                                            {conn.contact_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs text-gray-900">{conn.contact_name}</h4>
                                            <span className="text-[10px] text-gray-500 capitalize">{conn.relationship} • {conn.status}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRevoke(conn.id)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 transition"
                                        title="Revoke access"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Permissions Badges */}
                                <div className="p-2.5 rounded-xl bg-gray-50 text-[10px] text-gray-600 space-y-1">
                                    <span className="font-bold block text-gray-700">What they can see:</span>
                                    <div className="flex flex-wrap gap-1">
                                        <span className="px-2 py-0.5 rounded-full bg-mwezi-primary/60 text-mwezi-tertiary font-medium">
                                            Arrival Window Forecast
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-mwezi-secondary text-mwezi-tertiary font-medium">
                                            Partner Allyship Tips
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold flex items-center space-x-0.5">
                                            <Lock className="w-2.5 h-2.5" />
                                            <span>Private Notes Hidden</span>
                                        </span>
                                    </div>
                                </div>

                                {conn.status === 'invited' && (
                                    <div className="flex items-center justify-between p-2 rounded-xl bg-mwezi-light border border-mwezi-primary/40 text-xs">
                                        <span className="font-mono text-[11px] font-bold text-mwezi-tertiary">{conn.invite_code}</span>
                                        <button
                                            onClick={() => copyInvite(conn.invite_code)}
                                            className="px-2.5 py-1 bg-white border rounded-lg text-[10px] font-bold text-gray-700 flex items-center space-x-1"
                                        >
                                            {copiedCode === conn.invite_code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedCode === conn.invite_code ? 'Copied' : 'Copy Code'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* INVITE COMPANION MODAL (Contained within mobile frame) */}
            {showInviteModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn rounded-[40px] overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-transparent"
                        onClick={() => setShowInviteModal(false)}
                    />
                    <div className="relative bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-rose-100 z-10 max-h-[90%] overflow-y-auto hide-scrollbar">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center space-x-2">
                                <UserPlus className="w-5 h-5 text-rose-600" />
                                <span>{t('trusted_invite_btn', 'Invite Trusted Companion')}</span>
                            </h3>
                            <button onClick={() => setShowInviteModal(false)} className="text-slate-400 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateInvite} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Companion Name</label>
                                <input
                                    type="text"
                                    value={data.contact_name}
                                    onChange={(e) => setData('contact_name', e.target.value)}
                                    placeholder="e.g. Chileshe Banda"
                                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-mwezi-accent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Companion Email or Phone</label>
                                <input
                                    type="text"
                                    value={data.contact_channel}
                                    onChange={(e) => setData('contact_channel', e.target.value)}
                                    placeholder="e.g. chileshe@mwezi.org or +26097..."
                                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-mwezi-accent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Relationship</label>
                                <select
                                    value={data.relationship}
                                    onChange={(e) => setData('relationship', e.target.value)}
                                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs font-medium"
                                >
                                    <option value="mother">Mother / Female Guardian</option>
                                    <option value="father">Father / Male Guardian</option>
                                    <option value="sibling">Sister / Brother</option>
                                    <option value="partner">Trusted Partner</option>
                                    <option value="mentor">School Mentor / Teacher</option>
                                </select>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs text-gray-700">
                                <span className="font-bold block text-[11px] text-gray-800">Default Sharing Permissions:</span>
                                <p className="text-[10px] text-gray-500">✓ General estimated arrival days (so they can provide supplies)</p>
                                <p className="text-[10px] text-gray-500">✓ Practical care tips on easing cramps</p>
                                <p className="text-[10px] text-red-600 font-semibold">✗ NEVER shared: Private symptoms, notes, or diary entries</p>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 bg-mwezi-accent text-white font-bold rounded-[20px] text-xs shadow-md transition disabled:opacity-50"
                            >
                                {processing ? 'Generating Invite...' : 'Generate Invite Code'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MobileAppLayout>
    );
}

