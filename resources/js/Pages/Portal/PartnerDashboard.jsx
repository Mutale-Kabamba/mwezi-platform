import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import PortalDashboardLayout from '@/Layouts/PortalDashboardLayout';
import { 
    Package, 
    Heart, 
    CheckCircle2, 
    Clock, 
    Building2, 
    AlertCircle, 
    Check, 
    X, 
    Save,
    MapPin,
    Phone
} from 'lucide-react';

export default function PartnerDashboard({ hub, requests = [], stats = {} }) {
    const [padStock, setPadStock] = useState(hub?.free_pad_stock_level || 'in_stock');
    const [kitStock, setKitStock] = useState(hub?.emergency_kit_stock_level || 'in_stock');

    const handleUpdateStock = (e) => {
        e.preventDefault();
        router.post(route('portal.partner.inventory', hub.id), {
            free_pad_stock_level: padStock,
            emergency_kit_stock_level: kitStock,
        });
    };

    const handleUpdateRequestStatus = (requestId, newStatus) => {
        router.post(route('portal.partner.fulfill', requestId), {
            status: newStatus,
        });
    };

    return (
        <PortalDashboardLayout portalTitle="Distribution Hub Operations" portalRole="Partner">
            <Head title="Hub Management & Fulfillment - Mwezi" />

            <div className="space-y-6">
                
                {/* 1. HUB INFO & KPI STATS CARDS */}
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-mwezi-primary/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2">
                            <Building2 className="w-5 h-5 text-mwezi-accent" />
                            <span className="text-xs font-bold uppercase tracking-wider text-mwezi-tertiary">Verified Distribution Point</span>
                        </div>
                        <h2 className="font-heading font-extrabold text-xl text-gray-900 mt-1">
                            {hub?.organization_name || 'Play It Forward Community Youth Hub'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {hub?.address} • Phone: {hub?.contact_phone}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-mwezi-light rounded-[16px] text-center min-w-[100px] border border-mwezi-primary/40">
                            <span className="font-heading font-extrabold text-xl text-mwezi-tertiary block">
                                {stats.pending_requests || 0}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Pending</span>
                        </div>
                        <div className="p-3 bg-mwezi-light rounded-[16px] text-center min-w-[100px] border border-mwezi-primary/40">
                            <span className="font-heading font-extrabold text-xl text-emerald-700 block">
                                {stats.fulfilled_requests || 0}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Fulfilled</span>
                        </div>
                    </div>
                </div>

                {/* 2. LIVE INVENTORY MANAGEMENT CONTAINER */}
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-heading font-bold text-base text-mwezi-tertiary">Live Hub Stock Levels</h3>
                            <p className="text-xs text-gray-500">Update stock status visible on the user locator map.</p>
                        </div>
                        <span className="text-xs text-gray-400">Last updated: Just now</span>
                    </div>

                    <form onSubmit={handleUpdateStock} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Free Disposable Pads Stock</label>
                            <select
                                value={padStock}
                                onChange={(e) => setPadStock(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs font-semibold"
                            >
                                <option value="in_stock">In Stock (Available Free)</option>
                                <option value="low_stock">Low Stock (Replenishment requested)</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Emergency Dignity Kits Stock</label>
                            <select
                                value={kitStock}
                                onChange={(e) => setKitStock(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs font-semibold"
                            >
                                <option value="in_stock">In Stock (Available Free)</option>
                                <option value="low_stock">Low Stock (Replenishment requested)</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="py-2.5 px-6 bg-mwezi-accent hover:bg-mwezi-accent/90 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Live Stock Levels</span>
                        </button>
                    </form>
                </div>

                {/* 3. INCOMING SUPPLY REQUESTS FULFILLMENT QUEUE */}
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-heading font-bold text-base text-mwezi-tertiary">
                                Incoming Emergency & Free Supply Requests
                            </h3>
                            <p className="text-xs text-gray-500">Check request codes and mark packages ready for pickup.</p>
                        </div>
                        <span className="px-3 py-1 bg-mwezi-secondary text-mwezi-tertiary rounded-full text-xs font-bold">
                            {requests.length} Total Requests
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {requests.map((req) => (
                            <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-mono text-xs font-extrabold text-mwezi-tertiary bg-mwezi-primary/40 px-2 py-0.5 rounded-md">
                                            {req.request_code}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            req.urgency === 'immediate_emergency' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {req.urgency?.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs font-bold text-gray-800 capitalize">
                                            {req.request_type?.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-600 mt-1">
                                        Recipient: <strong>{req.user?.name}</strong> • Collection: <span className="capitalize">{req.delivery_method?.replace(/_/g, ' ')}</span>
                                    </p>

                                    {req.discreet_location_notes && (
                                        <p className="text-[11px] text-gray-500 italic mt-0.5 bg-gray-50 p-2 rounded-lg">
                                            Note: "{req.discreet_location_notes}"
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                        req.status === 'fulfilled' 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : req.status === 'ready_for_pickup'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {req.status?.replace(/_/g, ' ')}
                                    </span>

                                    {req.status !== 'ready_for_pickup' && req.status !== 'fulfilled' && (
                                        <button
                                            onClick={() => handleUpdateRequestStatus(req.id, 'ready_for_pickup')}
                                            className="px-3 py-1.5 bg-mwezi-accent text-white rounded-xl text-xs font-bold hover:bg-mwezi-accent/90 transition shadow-xs"
                                        >
                                            Mark Ready
                                        </button>
                                    )}

                                    {req.status !== 'fulfilled' && (
                                        <button
                                            onClick={() => handleUpdateRequestStatus(req.id, 'fulfilled')}
                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
                                        >
                                            Mark Fulfilled
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PortalDashboardLayout>
    );
}

