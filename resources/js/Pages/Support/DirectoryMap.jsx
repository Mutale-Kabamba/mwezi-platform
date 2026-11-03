import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { 
    ArrowLeft, 
    MapPin, 
    Phone, 
    Clock, 
    CheckCircle2, 
    AlertTriangle, 
    Building2, 
    Filter,
    Navigation
} from 'lucide-react';
import L from 'leaflet';

export default function DirectoryMap({ 
    hubs = [], 
    selectedProvince = '', 
    selectedHubType = '' 
}) {
    const { t } = useTranslation();
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    const [activeHub, setActiveHub] = useState(hubs[0] || null);

    // Initialize Leaflet map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Default Lusaka coordinates
        const centerLat = hubs.length > 0 ? hubs[0].latitude : -15.4167;
        const centerLng = hubs.length > 0 ? hubs[0].longitude : 28.2833;

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            mapInstanceRef.current = map;
        }

        const map = mapInstanceRef.current;

        // Clear existing markers
        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];

        // Custom Mwezi Map Marker Icon
        const mweziIcon = L.divIcon({
            className: 'custom-mwezi-pin',
            html: `<div style="background-color: #F98B88; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">M</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
        });

        hubs.forEach(hub => {
            const marker = L.marker([hub.latitude, hub.longitude], { icon: mweziIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="font-family: Poppins, sans-serif; font-size: 11px;">
                        <strong>${hub.organization_name}</strong><br/>
                        ${hub.address}<br/>
                        <span style="color: #8E484B; font-weight: bold;">Free Pads: ${hub.free_pad_stock_level}</span>
                    </div>
                `);

            marker.on('click', () => {
                setActiveHub(hub);
            });

            markersRef.current.push(marker);
        });

        if (hubs.length > 0) {
            const group = L.featureGroup(markersRef.current);
            map.fitBounds(group.getBounds().pad(0.15));
        }
    }, [hubs]);

    const handleFilter = (province, hubType) => {
        router.get(route('support.map'), {
            province: province || undefined,
            hub_type: hubType || undefined,
        }, { preserveState: true });
    };

    return (
        <MobileAppLayout title={t('support_map_btn', 'Hub Locator')} subtitle={t('support_subtitle', 'Verified Free Pad Stocks')}>
            <Head title="Service Directory & Free Pad Map - Mwezi" />

            <div className="space-y-3">
                
                {/* Header Back & Filters */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/support"
                        className="p-2 rounded-xl bg-white text-gray-700 hover:bg-gray-100 transition shadow-sm flex items-center space-x-1 text-xs font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('back', 'Support')}</span>
                    </Link>

                    <div className="flex items-center space-x-1.5">
                        <select
                            value={selectedProvince}
                            onChange={(e) => handleFilter(e.target.value, selectedHubType)}
                            aria-label="Filter by province"
                            className="py-1.5 px-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700"
                        >
                            <option value="">All Provinces</option>
                            <option value="Lusaka">Lusaka</option>
                            <option value="Copperbelt">Copperbelt</option>
                            <option value="Southern">Southern</option>
                        </select>

                        <select
                            value={selectedHubType}
                            onChange={(e) => handleFilter(selectedProvince, e.target.value)}
                            aria-label="Filter by facility type"
                            className="py-1.5 px-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700"
                        >
                            <option value="">All Types</option>
                            <option value="school">Schools</option>
                            <option value="ngo">NGOs</option>
                            <option value="clinic">Clinics</option>
                            <option value="safe_space">Safe Spaces</option>
                        </select>
                    </div>
                </div>

                {/* LEAFLET MAP CONTAINER (20px rounded) */}
                <div className="w-full h-56 bg-white rounded-[20px] shadow-sm border border-mwezi-primary/40 overflow-hidden relative">
                    <div ref={mapContainerRef} className="w-full h-full" />
                </div>

                {/* ACTIVE SELECTED HUB CARD */}
                {activeHub && (
                    <div className="bg-white rounded-[20px] p-4 shadow-sm border border-mwezi-accent/60 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-mwezi-tertiary bg-mwezi-secondary/60 px-2 py-0.5 rounded-full capitalize">
                                    {activeHub.hub_type?.replace('_', ' ')}
                                </span>
                                <h3 className="font-heading font-bold text-sm text-gray-900 mt-1 leading-tight">
                                    {activeHub.organization_name}
                                </h3>
                                <p className="text-xs text-gray-600 mt-0.5">{activeHub.address}</p>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                activeHub.free_pad_stock_level === 'in_stock' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-amber-100 text-amber-800'
                            }`}>
                                {activeHub.free_pad_stock_level === 'in_stock' ? 'Pads In Stock' : 'Low Stock'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1 border-t border-gray-100">
                            <div className="flex items-center space-x-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate">{activeHub.operating_hours}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <span>{activeHub.contact_phone}</span>
                            </div>
                        </div>

                        <div className="flex space-x-2 pt-1">
                            <Link
                                href="/support/request"
                                className="flex-1 py-2.5 bg-mwezi-accent text-white font-bold rounded-[16px] text-xs text-center shadow-sm hover:bg-mwezi-accent/90 transition"
                            >
                                Request Free Pack Here
                            </Link>

                            <a
                                href={`tel:${activeHub.contact_phone}`}
                                className="py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-[16px] text-xs flex items-center justify-center hover:bg-gray-200 transition"
                            >
                                <Phone className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                )}

                {/* ALL HUBS LIST */}
                <div className="space-y-2 pt-1">
                    <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider px-1">
                        Verified Hubs in this District ({hubs.length})
                    </h3>

                    {hubs.map((hub) => (
                        <div
                            key={hub.id}
                            onClick={() => {
                                setActiveHub(hub);
                                if (mapInstanceRef.current) {
                                    mapInstanceRef.current.setView([hub.latitude, hub.longitude], 14);
                                }
                            }}
                            className={`p-3 rounded-[16px] border transition cursor-pointer flex items-center justify-between ${
                                activeHub?.id === hub.id 
                                    ? 'bg-mwezi-primary/30 border-mwezi-tertiary' 
                                    : 'bg-white border-gray-100 hover:bg-gray-50'
                            }`}
                        >
                            <div>
                                <h4 className="font-bold text-xs text-gray-800">{hub.organization_name}</h4>
                                <p className="text-[10px] text-gray-500">{hub.district}, {hub.province}</p>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                hub.free_pad_stock_level === 'in_stock' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                            }`}>
                                {hub.free_pad_stock_level === 'in_stock' ? 'In Stock' : 'Low Stock'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </MobileAppLayout>
    );
}

