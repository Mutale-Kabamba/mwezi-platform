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
    Eye,
    Clock,
    CheckCircle2,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

export default function TrustedCircleManage({ 
    connections = [], 
    incomingRequests = [], 
    mySupportedUsers = [], 
    inviteUrlTemplate = '' 
}) {
    const { t } = useTranslation();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);
    const [copiedLink, setCopiedLink] = useState(null);

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

    const handleAcceptRequest = (connectionId) => {
        router.post(route('trusted-circle.request.accept', connectionId));
    };

    const handleDeclineRequest = (connectionId) => {
        if (confirm('Are you sure you want to decline this companion request?')) {
            router.post(route('trusted-circle.request.decline', connectionId));
        }
    };

    const copyInviteCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const copyInviteLink = (code) => {
        const link = `${inviteUrlTemplate}${code}`;
        navigator.clipboard.writeText(link);
        setCopiedLink(code);
        setTimeout(() => setCopiedLink(null), 2500);
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

                {/* 2. INCOMING REQUESTS TO THIS USER (IF ANY) */}
                {incomingRequests.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 rounded-2xl border border-amber-200 shadow-sm space-y-3">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                            <h3 className="font-heading font-bold text-xs text-amber-900 uppercase tracking-wider">
                                Companion Requests For You ({incomingRequests.length})
                            </h3>
                        </div>
                        <div className="space-y-2.5">
                            {incomingRequests.map((req) => (
                                <div key={req.id} className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-amber-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">
                                            {req.primary_user?.name || 'A primary user'}
                                        </p>
                                        <p className="text-[11px] text-slate-600">
                                            Invited you as a <span className="font-semibold capitalize text-rose-600">{req.relationship}</span> companion
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <button
                                            onClick={() => handleAcceptRequest(req.id)}
                                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleDeclineRequest(req.id)}
                                            className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-medium transition"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. INVITE NEW COMPANION BUTTON */}
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full py-3 bg-[#BE123C] hover:bg-[#9F1239] text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-200/50 transition flex items-center justify-center space-x-2 active:scale-98"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>{t('trusted_invite_btn', 'Invite Family Member or Partner')}</span>
                </button>

                {/* 4. ACTIVE & PENDING COMPANIONS LIST */}
                <div className="space-y-3">
                    <h3 className="font-heading font-bold text-xs text-slate-700 uppercase tracking-wider px-1">
                        My Companions ({connections.length})
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
                                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xs">
                                            {conn.contact_name ? conn.contact_name.charAt(0).toUpperCase() : 'C'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs text-gray-900">{conn.contact_name}</h4>
                                            <div className="flex items-center space-x-1.5 mt-0.5">
                                                <span className="text-[10px] text-gray-500 capitalize">{conn.relationship}</span>
                                                <span className="text-[10px] text-gray-300">•</span>
                                                {conn.status === 'active' && (
                                                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                                        <span>Active</span>
                                                    </span>
                                                )}
                                                {conn.status === 'pending' && (
                                                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        <span>Request Sent</span>
                                                    </span>
                                                )}
                                                {conn.status === 'invited' && (
                                                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
                                                        <span>Needs Setup</span>
                                                    </span>
                                                )}
                                            </div>
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
                                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium">
                                            Arrival Window Forecast
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                                            Partner Allyship Tips
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold flex items-center space-x-0.5">
                                            <Lock className="w-2.5 h-2.5" />
                                            <span>Private Notes Hidden</span>
                                        </span>
                                    </div>
                                </div>

                                {/* PENDING STATUS BANNER (for registered users) */}
                                {conn.status === 'pending' && (
                                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                                        <div className="flex items-center space-x-1 text-amber-800 font-semibold text-[11px]">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span>In-App Invitation Sent</span>
                                        </div>
                                        <p className="text-[10px] text-amber-700 leading-snug">
                                            {conn.contact_name} already has a registered Mwezi account. An invitation was sent to their dashboard to accept.
                                        </p>
                                    </div>
                                )}

                                {/* INVITED STATUS BANNER (for unregistered companions: password setup code & link) */}
                                {conn.status === 'invited' && conn.invite_code && (
                                    <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-rose-700 font-medium">Password Setup Code:</p>
                                                <span className="font-mono text-xs font-bold text-rose-900 tracking-wider">{conn.invite_code}</span>
                                            </div>
                                            <button
                                                onClick={() => copyInviteCode(conn.invite_code)}
                                                className="px-2 py-1 bg-white border border-rose-200 rounded-lg text-[10px] font-bold text-rose-700 flex items-center space-x-1 hover:bg-rose-50 transition"
                                            >
                                                {copiedCode === conn.invite_code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                                <span>{copiedCode === conn.invite_code ? 'Copied' : 'Copy Code'}</span>
                                            </button>
                                        </div>

                                        <div className="pt-1 border-t border-rose-100 flex items-center justify-between">
                                            <p className="text-[10px] text-slate-500">
                                                All they need is to set their password.
                                            </p>
                                            <button
                                                onClick={() => copyInviteLink(conn.invite_code)}
                                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 transition"
                                            >
                                                {copiedLink === conn.invite_code ? <Check className="w-3 h-3 text-white" /> : <ExternalLink className="w-3 h-3" />}
                                                <span>{copiedLink === conn.invite_code ? 'Link Copied!' : 'Copy Setup Link'}</span>
                                            </button>
                                        </div>
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

                        <div className="p-2.5 bg-rose-50 rounded-xl text-[11px] text-rose-900 leading-snug">
                            <p className="font-medium">
                                If this person is already registered on Mwezi, we'll send a companion request to their dashboard. If new, they only need to set a password using the generated code.
                            </p>
                        </div>

                        <form onSubmit={handleCreateInvite} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Companion Name</label>
                                <input
                                    type="text"
                                    value={data.contact_name}
                                    onChange={(e) => setData('contact_name', e.target.value)}
                                    placeholder="e.g. Chileshe Banda"
                                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-[#BE123C]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Companion Email or Phone</label>
                                <input
                                    type="text"
                                    value={data.contact_channel}
                                    onChange={(e) => setData('contact_channel', e.target.value)}
                                    placeholder="e.g. 0977... or chileshe@mwezi.org"
                                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-[#BE123C]"
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
                                className="w-full py-3 bg-[#BE123C] hover:bg-[#9F1239] text-white font-bold rounded-[20px] text-xs shadow-md transition disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Send Invite'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MobileAppLayout>
    );
}

