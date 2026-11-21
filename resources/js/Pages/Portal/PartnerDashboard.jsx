import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import {
    Building2,
    Save,
    MapPin,
    Phone,
    CheckCircle2,
    Package,
} from 'lucide-react';

export default function PartnerDashboard({ hub, requests = [], stats = {} }) {
    const [padStock, setPadStock] = useState(hub?.free_pad_stock_level || 'in_stock');
    const [kitStock, setKitStock] = useState(hub?.emergency_kit_stock_level || 'in_stock');
    const [savingStock, setSavingStock] = useState(false);

    const handleUpdateStock = (e) => {
        e.preventDefault();
        setSavingStock(true);
        router.post(
            route('portal.partner.inventory', hub.id),
            {
                free_pad_stock_level: padStock,
                emergency_kit_stock_level: kitStock,
            },
            {
                preserveScroll: true,
                onFinish: () => setSavingStock(false),
            }
        );
    };

    const handleUpdateRequestStatus = (requestId, newStatus) => {
        router.post(
            route('portal.partner.fulfill', requestId),
            { status: newStatus },
            { preserveScroll: true }
        );
    };

    return (
        <MobileAppLayout
            title="Hub Operations"
            subtitle={hub?.organization_name || 'Verified Distribution Hub'}
            backUrl="/dashboard"
        >
            <Head title="Hub Management & Fulfillment - Mwezi" />

            <div className="space-y-4 pb-6">

                {/* 1. HUB PROFILE & UNIFIED KPI STRIP */}
                <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/90 space-y-3.5">
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-100/90 text-[#7C3AED] flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#7C3AED] block">
                                Verified Distribution Point
                            </span>
                            <h2 className="font-bold text-sm text-[#2D2638] leading-snug mt-0.5">
                                {hub?.organization_name || 'Play It Forward Community Youth Hub'}
                            </h2>
                            <div className="mt-1 space-y-0.5 text-[11px] text-[#6E637C]">
                                {hub?.address && (
                                    <p className="flex items-center space-x-1 truncate">
                                        <MapPin className="w-3 h-3 shrink-0 text-[#8A7F99]" />
                                        <span className="truncate">{hub.address}</span>
                                    </p>
                                )}
                                {hub?.contact_phone && (
                                    <p className="flex items-center space-x-1">
                                        <Phone className="w-3 h-3 shrink-0 text-[#8A7F99]" />
                                        <span>{hub.contact_phone}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-purple-100/80 pt-3 border-t border-purple-100/70 text-center">
                        <div className="px-2">
                            <span className="text-[10px] font-semibold text-[#7A6F8A] block">Pending</span>
                            <span className="font-extrabold text-xl text-rose-500 block mt-0.5">
                                {stats.pending_requests || 0}
                            </span>
                        </div>
                        <div className="px-2">
                            <span className="text-[10px] font-semibold text-[#7A6F8A] block">Fulfilled</span>
                            <span className="font-extrabold text-xl text-emerald-600 block mt-0.5">
                                {stats.fulfilled_requests || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. LIVE INVENTORY MANAGEMENT */}
                <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/90 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-xs text-[#2D2638]">Live Hub Stock Levels</h3>
                            <p className="text-[10.5px] text-[#6E637C]">
                                Visible on the user locator map
                            </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
                            <Package className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    <form onSubmit={handleUpdateStock} className="space-y-2.5">
                        <div>
                            <label className="block text-[11px] font-semibold text-[#5E546B] mb-1">
                                Free Disposable Pads Stock
                            </label>
                            <select
                                value={padStock}
                                onChange={(e) => setPadStock(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white/85 border border-white rounded-2xl text-xs font-semibold text-[#2D2638] focus:outline-none focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="in_stock">In Stock (Available Free)</option>
                                <option value="low_stock">Low Stock (Replenishment requested)</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-[#5E546B] mb-1">
                                Emergency Dignity Kits Stock
                            </label>
                            <select
                                value={kitStock}
                                onChange={(e) => setKitStock(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white/85 border border-white rounded-2xl text-xs font-semibold text-[#2D2638] focus:outline-none focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="in_stock">In Stock (Available Free)</option>
                                <option value="low_stock">Low Stock (Replenishment requested)</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={savingStock}
                            className="w-full py-3 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-full text-xs shadow-md shadow-purple-300/40 transition flex items-center justify-center space-x-1.5 active:scale-98 disabled:opacity-60"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>{savingStock ? 'Saving...' : 'Save Live Stock Levels'}</span>
                        </button>
                    </form>
                </div>

                {/* 3. INCOMING SUPPLY REQUESTS QUEUE */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h3 className="font-bold text-xs text-[#2D2638]">
                                Incoming Supply Requests
                            </h3>
                            <p className="text-[10.5px] text-[#6E637C]">
                                Verify codes &amp; mark ready for pickup
                            </p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-purple-100/85 text-[#7C3AED] rounded-full text-[10px] font-bold">
                            {requests.length} Total
                        </span>
                    </div>

                    {requests.length === 0 ? (
                        <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-6 border border-white/90 text-center space-y-1.5">
                            <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                            <p className="text-xs font-bold text-[#2D2638]">All caught up</p>
                            <p className="text-[11px] text-[#6E637C]">No incoming supply requests right now.</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {requests.map((req) => (
                                <div
                                    key={req.id}
                                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-2.5"
                                >
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                            <span className="font-mono text-[11px] font-extrabold text-[#2D2638] bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                                                {req.request_code}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase ${
                                                    req.urgency === 'immediate_emergency'
                                                        ? 'bg-rose-100 text-rose-700'
                                                        : 'bg-slate-100 text-[#5E546B]'
                                                }`}
                                            >
                                                {req.urgency?.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase ${
                                                req.status === 'fulfilled'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : req.status === 'ready_for_pickup'
                                                    ? 'bg-sky-100 text-sky-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}
                                        >
                                            {req.status?.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-[#2D2638] capitalize">
                                            {req.request_type?.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-[11px] text-[#6E637C] mt-0.5">
                                            Recipient: <strong className="text-[#2D2638]">{req.user?.name}</strong> •{' '}
                                            <span className="capitalize">{req.delivery_method?.replace(/_/g, ' ')}</span>
                                        </p>
                                    </div>

                                    {req.discreet_location_notes && (
                                        <p className="text-[11px] text-[#5E546B] italic bg-white/70 border border-white p-2.5 rounded-2xl">
                                            Note: &ldquo;{req.discreet_location_notes}&rdquo;
                                        </p>
                                    )}

                                    {req.status !== 'fulfilled' && (
                                        <div className="flex items-center gap-2 pt-1">
                                            {req.status !== 'ready_for_pickup' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateRequestStatus(req.id, 'ready_for_pickup')}
                                                    className="flex-1 py-2 px-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full text-xs font-bold transition active:scale-95"
                                                >
                                                    Mark Ready
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleUpdateRequestStatus(req.id, 'fulfilled')}
                                                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition active:scale-95"
                                            >
                                                Mark Fulfilled
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MobileAppLayout>
    );
}
