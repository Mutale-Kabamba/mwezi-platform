import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { 
    ArrowLeft, 
    Heart, 
    Sparkles, 
    ShieldCheck, 
    Users, 
    CheckCircle2, 
    ArrowRight,
    Smartphone,
    CreditCard,
    DollarSign,
    Lock,
    Building2,
    Info,
    Check,
    Loader2,
    AlertCircle,
    X,
    RefreshCw
} from 'lucide-react';

export default function SponsorPortal({ campaign, recentDonations = [], hubs = [], paymentResult: initialPaymentResult, lencoPublicKey }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;

    const [isCustomAmount, setIsCustomAmount] = useState(false);
    const [customAmountInput, setCustomAmountInput] = useState('100');

    // Live Checkout Modal State
    const [activePayment, setActivePayment] = useState(initialPaymentResult || null);
    const [verificationStatus, setVerificationStatus] = useState(initialPaymentResult?.status || null);
    const [verificationMessage, setVerificationMessage] = useState(initialPaymentResult?.instruction || '');
    const [verificationDetails, setVerificationDetails] = useState(null);
    const [pollSeconds, setPollSeconds] = useState(0);

    const pollingIntervalRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        donation_type: 'sponsor_a_girl_annual',
        amount_zmw: 150,
        donor_name: user?.name || '',
        donor_email: user?.email || '',
        donor_phone: '',
        payment_method: 'broadpay_momo', // broadpay_momo, broadpay_card
        target_hub_id: hubs[0]?.id || '',
    });

    // Detect if flash or new prop brought paymentResult
    useEffect(() => {
        if (initialPaymentResult) {
            setActivePayment(initialPaymentResult);
            setVerificationStatus(initialPaymentResult.status);
            setVerificationMessage(initialPaymentResult.instruction);
        }
    }, [initialPaymentResult]);

    // Polling logic when payment status is pending
    useEffect(() => {
        if (activePayment?.reference && (verificationStatus === 'pending' || verificationStatus === 'pay-offline')) {
            const checkStatus = async () => {
                try {
                    const response = await fetch(`/sponsor/verify/${encodeURIComponent(activePayment.reference)}`, {
                        headers: { 'Accept': 'application/json' }
                    });
                    const res = await response.json();

                    if (res.status === 'completed') {
                        setVerificationStatus('completed');
                        setVerificationDetails(res);
                        setVerificationMessage('Payment verified and confirmed by Lenco Gateway! Thank you.');
                        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    } else if (res.status === 'failed') {
                        setVerificationStatus('failed');
                        setVerificationMessage(res.message || 'Payment prompt was cancelled or timed out.');
                        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    }
                } catch (err) {
                    console.log('Status polling tick:', err);
                }
            };

            pollingIntervalRef.current = setInterval(checkStatus, 3000);
            return () => {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            };
        }
    }, [activePayment, verificationStatus]);

    // Track polling timer tick
    useEffect(() => {
        let timer;
        if (verificationStatus === 'pending') {
            timer = setInterval(() => {
                setPollSeconds(s => s + 1);
            }, 1000);
        } else {
            setPollSeconds(0);
        }
        return () => clearInterval(timer);
    }, [verificationStatus]);

    const presetTiers = [
        {
            type: 'reusable_pad_pack',
            amount: 150,
            title: 'Sponsor 1 Girl',
            desc: 'Provides 1 set of 4 washable pads + soap lasting 2 school years.',
            girls: 1,
        },
        {
            type: 'emergency_kit_bundle',
            amount: 450,
            title: 'School Dignity Kit Bundle',
            desc: 'Stocks 15 emergency menstrual kits in a local primary/secondary school safe space.',
            girls: 3,
        },
        {
            type: 'sponsor_a_girl_annual',
            amount: 1800,
            title: 'Sponsor 12 Girls Annually',
            desc: 'Full year of dignity packs, continuous attendance monitoring, and hygiene guidance.',
            girls: 12,
        },
    ];

    const handleSelectTier = (tier) => {
        setIsCustomAmount(false);
        setData(prev => ({
            ...prev,
            amount_zmw: tier.amount,
            donation_type: tier.type,
        }));
    };

    const handleSelectCustom = () => {
        setIsCustomAmount(true);
        const parsed = Math.max(10, parseFloat(customAmountInput) || 50);
        setData(prev => ({
            ...prev,
            amount_zmw: parsed,
            donation_type: 'custom_amount',
        }));
    };

    const handleCustomAmountChange = (e) => {
        const val = e.target.value;
        setCustomAmountInput(val);
        const parsed = parseFloat(val) || 0;
        setData(prev => ({
            ...prev,
            amount_zmw: parsed,
            donation_type: 'custom_amount',
        }));
    };

    const handleQuickAmountChip = (amt) => {
        setIsCustomAmount(true);
        setCustomAmountInput(String(amt));
        setData(prev => ({
            ...prev,
            amount_zmw: amt,
            donation_type: 'custom_amount',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('public.sponsor.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props.paymentResult) {
                    setActivePayment(page.props.paymentResult);
                    setVerificationStatus(page.props.paymentResult.status);
                    setVerificationMessage(page.props.paymentResult.instruction);
                }
            }
        });
    };

    // Calculate girls supported estimate based on ZMW amount (approx ZMW 150 per girl)
    const girlsSupported = Math.max(1, Math.floor(data.amount_zmw / 150));

    // Detect Zambian Network helper
    const detectNetwork = (phone) => {
        if (!phone) return null;
        const cleaned = phone.replace(/[^0-9]/g, '');
        const normalized = cleaned.startsWith('260') ? '0' + cleaned.substring(3) : cleaned;
        if (normalized.startsWith('097') || normalized.startsWith('077')) return { name: 'Airtel Money', color: 'bg-red-500 text-white', badge: 'AIRTEL' };
        if (normalized.startsWith('096') || normalized.startsWith('076')) return { name: 'MTN MoMo', color: 'bg-yellow-400 text-slate-900 font-bold', badge: 'MTN' };
        if (normalized.startsWith('095') || normalized.startsWith('075')) return { name: 'Zamtel Kwacha', color: 'bg-emerald-600 text-white', badge: 'ZAMTEL' };
        return null;
    };

    const networkBadge = detectNetwork(data.donor_phone);

    const percentRaised = campaign?.target_amount_zmw > 0 
        ? Math.min(100, Math.round((campaign.raised_amount_zmw / campaign.target_amount_zmw) * 100))
        : 60;

    return (
        <MobileAppLayout title="Sponsor a Girl" subtitle="Dignity & School Retention">
            <Head title="Sponsor a Girl - Mwezi Platform" />

            <div className="space-y-4 pb-8">
                
                {/* Top Nav Back */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/support"
                        className="p-1.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 transition shadow-xs flex items-center space-x-1 text-xs font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>

                    {user ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded-full">
                            Logged In: {user.name}
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-1 rounded-full">
                            Guest Sponsor (No Sign In Required)
                        </span>
                    )}
                </div>

                {/* CAMPAIGN PROGRESS HERO CONTAINER */}
                <div className="bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 text-white rounded-3xl p-5 shadow-lg shadow-rose-200/60 space-y-3 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center space-x-1.5">
                            <Heart className="w-4 h-4 text-white fill-white" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-100">
                                Active Community Campaign
                            </span>
                        </div>

                        <h1 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                            {campaign?.title || 'Keep 1,000 Zambian Schoolgirls in Class with Dignity'}
                        </h1>

                        <p className="text-xs text-rose-50 leading-relaxed font-medium">
                            Every reusable pad kit keeps a schoolgirl attending class without missing 4 to 5 days every month due to period poverty.
                        </p>

                        {/* Progress Bar */}
                        <div className="pt-2">
                            <div className="flex justify-between items-center text-xs mb-1 font-bold">
                                <span className="text-white">
                                    ZMW {Number(campaign?.raised_amount_zmw || 84500).toLocaleString()}
                                </span>
                                <span className="text-rose-100 text-[11px]">
                                    Goal: ZMW {Number(campaign?.target_amount_zmw || 150000).toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
                                <div 
                                    className="h-full bg-white rounded-full transition-all duration-500"
                                    style={{ width: `${percentRaised}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-rose-100 mt-1 font-medium">
                                <span>{percentRaised}% Funded</span>
                                <span>{campaign?.target_girls_count || 1000} Girls Target</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SPONSORSHIP FORM */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* 1. AMOUNT SELECTION */}
                    <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                                <span>1. Select Sponsorship Amount</span>
                            </h3>
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                ~{girlsSupported} {girlsSupported === 1 ? 'Girl' : 'Girls'} Supported
                            </span>
                        </div>

                        {/* Preset Tier Radio Cards */}
                        <div className="space-y-2">
                            {presetTiers.map((tier) => {
                                const isSelected = !isCustomAmount && data.amount_zmw === tier.amount;
                                return (
                                    <div
                                        key={tier.type}
                                        onClick={() => handleSelectTier(tier)}
                                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-start justify-between ${
                                            isSelected 
                                                ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20' 
                                                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="space-y-0.5 pr-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold text-xs text-slate-900">{tier.title}</span>
                                                <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.2 rounded-full">
                                                    {tier.girls} {tier.girls === 1 ? 'girl' : 'girls'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-tight">{tier.desc}</p>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-black text-slate-900 block">
                                                K{tier.amount}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-medium">ZMW</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Custom Amount Option */}
                        <div 
                            onClick={handleSelectCustom}
                            className={`p-3 rounded-2xl border transition cursor-pointer space-y-2 ${
                                isCustomAmount 
                                    ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20' 
                                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold text-xs text-slate-900">Enter Your Own Amount</span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                        Custom
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">Min K10</span>
                            </div>

                            {/* Input Field */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                                    ZMW
                                </div>
                                <input
                                    type="number"
                                    min="10"
                                    step="1"
                                    value={customAmountInput}
                                    onFocus={handleSelectCustom}
                                    onChange={handleCustomAmountChange}
                                    placeholder="Enter amount in Kwacha"
                                    className="w-full pl-12 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                />
                            </div>

                            {/* Quick Increment Chips */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                <span className="text-[10px] text-slate-500 font-semibold mr-1">Quick Add:</span>
                                {[50, 100, 250, 500, 1000].map((amt) => (
                                    <button
                                        type="button"
                                        key={amt}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickAmountChip(amt);
                                        }}
                                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition active:scale-95 shadow-2xs"
                                    >
                                        +K{amt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. PAYMENT METHOD & TELECOM DETECTION */}
                    <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="font-bold text-xs text-slate-900">
                                2. Lenco Online Payment Method
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>BroadPay Verified</span>
                            </span>
                        </div>

                        {/* Methods Toggle */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setData('payment_method', 'broadpay_momo')}
                                className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2 transition ${
                                    data.payment_method === 'broadpay_momo'
                                        ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20 text-rose-900'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                            >
                                <Smartphone className="w-4 h-4 text-rose-600 shrink-0" />
                                <div>
                                    <span className="block text-xs font-bold leading-tight">Mobile Money</span>
                                    <span className="text-[9px] text-slate-500">Airtel • MTN • Zamtel</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setData('payment_method', 'broadpay_card')}
                                className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2 transition ${
                                    data.payment_method === 'broadpay_card'
                                        ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20 text-rose-900'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                            >
                                <CreditCard className="w-4 h-4 text-slate-700 shrink-0" />
                                <div>
                                    <span className="block text-xs font-bold leading-tight">Debit / Card</span>
                                    <span className="text-[9px] text-slate-500">Visa • Mastercard 3DS</span>
                                </div>
                            </button>
                        </div>

                        {/* Phone Number Input (With Live Network Detection) */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[11px] font-bold text-slate-700">
                                    {data.payment_method === 'broadpay_momo' ? 'Zambian Mobile Money Number' : 'Contact Phone Number'}
                                </label>
                                {networkBadge && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-2xs ${networkBadge.color}`}>
                                        {networkBadge.name}
                                    </span>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    type="tel"
                                    value={data.donor_phone}
                                    onChange={(e) => setData('donor_phone', e.target.value)}
                                    placeholder="e.g. 0971234567 or 0961234567"
                                    required={data.payment_method === 'broadpay_momo'}
                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                                {data.payment_method === 'broadpay_momo' 
                                    ? 'A prompt will appear instantly on this phone to enter your PIN.' 
                                    : 'For receipt SMS updates and transaction security.'}
                            </p>
                        </div>
                    </div>

                    {/* 3. DONOR DETAILS (GUEST OR REGISTERED) */}
                    <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="font-bold text-xs text-slate-900">
                                3. Donor Information
                            </h3>
                            {user ? (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    Autofilled from Account
                                </span>
                            ) : (
                                <span className="text-[10px] font-semibold text-slate-500">
                                    Guest Sponsorship
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Full Name or Organization (Optional)
                            </label>
                            <input
                                type="text"
                                value={data.donor_name}
                                onChange={(e) => setData('donor_name', e.target.value)}
                                placeholder="Your Name (Leave blank for Anonymous)"
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Receipt Email Address
                            </label>
                            <input
                                type="email"
                                value={data.donor_email}
                                onChange={(e) => setData('donor_email', e.target.value)}
                                placeholder="Where should we send your official receipt?"
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500"
                                required={!user}
                            />
                        </div>

                        {/* Optional Target Hub Allocation */}
                        {hubs.length > 0 && (
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Allocate Supplies To (Optional)
                                </label>
                                <select
                                    value={data.target_hub_id}
                                    onChange={(e) => setData('target_hub_id', e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-rose-500"
                                >
                                    <option value="">Any Verified School Hub in Urgent Need</option>
                                    {hubs.map((hub) => (
                                        <option key={hub.id} value={hub.id}>
                                            {hub.organization_name} ({hub.province})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* CONFIRMATION BUTTON */}
                    <button
                        type="submit"
                        disabled={processing || !data.amount_zmw || data.amount_zmw < 10}
                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-3xl text-xs sm:text-sm shadow-md shadow-rose-200/70 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Connecting to Lenco Gateway...</span>
                            </>
                        ) : (
                            <>
                                <span>Pay ZMW {Number(data.amount_zmw || 0).toLocaleString()} via Lenco</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    {/* Security & BroadPay Gateway Badge */}
                    <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 pt-1">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Online payments powered by Lenco by BroadPay (ZMW). 256-Bit SSL Encrypted.</span>
                    </div>
                </form>

                {/* RECENT SUPPORTERS HONOR ROLL */}
                <div className="bg-white rounded-3xl p-4 shadow-xs border border-rose-150/80">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                        Recent Dignity Champions
                    </h3>
                    <div className="space-y-2">
                        {recentDonations.length === 0 ? (
                            <p className="text-xs text-slate-400 py-1 text-center">Be the first to sponsor a girl today!</p>
                        ) : (
                            recentDonations.map((d) => (
                                <div key={d.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 text-xs border border-slate-100">
                                    <div>
                                        <span className="font-bold text-slate-800">{d.donor_name}</span>
                                        <p className="text-[10px] text-slate-500 capitalize">
                                            {d.donation_type ? d.donation_type.replace(/_/g, ' ') : 'Sponsorship'}
                                        </p>
                                    </div>
                                    <span className="font-extrabold text-rose-600">
                                        ZMW {Number(d.amount_zmw).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* LIVE LENCO PAYMENT BOTTOM-SHEET / MODAL */}
            {activePayment && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 transition-all animate-fadeIn">
                    <div 
                        className="fixed inset-0 bg-transparent"
                        onClick={() => setActivePayment(null)}
                    />
                    <div className="relative bg-white w-full rounded-t-[32px] max-h-[88%] overflow-y-auto p-5 shadow-2xl space-y-4 border-t border-slate-100 animate-in slide-in-from-bottom duration-300 z-10">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                    <Lock className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-slate-900">Lenco Payment Gateway</h4>
                                    <span className="text-[10px] text-slate-400">BroadPay Zambia Rails</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setActivePayment(null)}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Status Icon & State */}
                        <div className="text-center py-2 space-y-3">
                            {verificationStatus === 'completed' ? (
                                <div className="space-y-2">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="font-black text-base text-slate-900">Payment Approved! 🎉</h3>
                                    <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                                        {verificationMessage}
                                    </p>
                                    <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-left space-y-1 mt-2">
                                        <div className="flex justify-between text-xs font-bold text-emerald-900">
                                            <span>Amount Paid:</span>
                                            <span>ZMW {Number(activePayment.amount || verificationDetails?.amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-emerald-800">
                                            <span>Lenco Reference:</span>
                                            <span className="font-mono">{activePayment.gateway_transaction_id || verificationDetails?.gateway_transaction_id || activePayment.reference}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-emerald-800">
                                            <span>Impact:</span>
                                            <span className="font-bold">~{verificationDetails?.girls_supported || Math.max(1, Math.floor(activePayment.amount / 150))} schoolgirls provided with hygiene kits</span>
                                        </div>
                                    </div>
                                </div>
                            ) : verificationStatus === 'failed' ? (
                                <div className="space-y-2">
                                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-bold text-sm text-red-600">Payment Incomplete</h3>
                                    <p className="text-xs text-slate-600">{verificationMessage}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Pulsing Phone Signal */}
                                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping" />
                                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center relative z-10">
                                            <Smartphone className="w-6 h-6 animate-pulse" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900">Check Your Phone</h3>
                                        <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                                            A Mobile Money prompt has been dispatched to{' '}
                                            <span className="font-bold text-slate-900">{activePayment.phone}</span>.
                                        </p>
                                    </div>

                                    {/* Prompt Info Box */}
                                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-left space-y-1.5 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Amount:</span>
                                            <span className="font-bold text-slate-900">ZMW {Number(activePayment.amount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Operator:</span>
                                            <span className="font-bold text-slate-800 uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px]">
                                                {activePayment.operator || 'Mobile Money'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400">
                                            <span>Reference:</span>
                                            <span className="font-mono">{activePayment.reference}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center space-x-1.5 text-[11px] text-rose-600 font-semibold pt-1">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Waiting for PIN entry ({pollSeconds}s)...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div>
                            {verificationStatus === 'completed' ? (
                                <button
                                    onClick={() => {
                                        setActivePayment(null);
                                        window.location.reload();
                                    }}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md transition"
                                >
                                    Done & View Dignity Roll
                                </button>
                            ) : verificationStatus === 'failed' ? (
                                <button
                                    onClick={() => setActivePayment(null)}
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition"
                                >
                                    Close & Try Again
                                </button>
                            ) : (
                                <button
                                    onClick={() => setActivePayment(null)}
                                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-2xl text-xs transition"
                                >
                                    Cancel & Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </MobileAppLayout>
    );
}
