import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import * as Accordion from '@radix-ui/react-accordion';
import { 
    HelpCircle, 
    ChevronDown, 
    PhoneCall, 
    Heart, 
    MapPin, 
    MessageSquare, 
    Send, 
    ShieldCheck, 
    X,
    LifeBuoy
} from 'lucide-react';

export default function SupportIndex({ faqs = [], activeRequests = [], campaign }) {
    const { t } = useTranslation();
    const [faqSearch, setFaqSearch] = useState('');
    const [showTicketModal, setShowTicketModal] = useState(false);

    const filteredFaqs = faqs.filter(f => 
        f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        f.answer.toLowerCase().includes(faqSearch.toLowerCase())
    );

    const { data, setData, post, processing, reset } = useForm({
        subject: '',
        description: '',
        channel: 'live_chat',
        priority: 'normal',
    });

    const submitTicket = (e) => {
        e.preventDefault();
        post(route('support.ticket.store'), {
            onSuccess: () => {
                setShowTicketModal(false);
                reset();
            },
        });
    };

    return (
        <MobileAppLayout title={t('support_title', 'Support & Hubs')} subtitle={t('support_subtitle', 'Emergency Supplies & Care')}>
            <Head title="Get Support & FAQ - Mwezi" />

            <div className="space-y-4">
                
                {/* 1. EMERGENCY CALL HELPLINES CONTAINER (#8E484B Muted Red styling) */}
                <div className="bg-mwezi-tertiary text-white rounded-[20px] p-5 shadow-mwezi space-y-3">
                    <div className="flex items-center space-x-2">
                        <PhoneCall className="w-5 h-5 text-mwezi-brandText animate-pulse" />
                        <h2 className="font-heading font-bold text-sm text-mwezi-brandText uppercase tracking-wider">
                            {t('support_helplines_title', 'Zambian Emergency Helplines (Free & 24/7)')}
                        </h2>
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed">
                        {t('support_helplines_desc', 'If you are experiencing severe pain, crisis distress, or safeguarding concerns, call immediately free of charge:')}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                            href="tel:116"
                            className="p-3 rounded-[16px] bg-white/15 hover:bg-white/25 border border-white/20 transition flex flex-col items-center justify-center text-center group"
                        >
                            <span className="font-heading font-extrabold text-base text-mwezi-brandText">116</span>
                            <span className="text-[10px] font-semibold text-white">{t('support_childline_title', 'Childline / Lifeline')}</span>
                        </a>

                        <a
                            href="tel:992"
                            className="p-3 rounded-[16px] bg-white/15 hover:bg-white/25 border border-white/20 transition flex flex-col items-center justify-center text-center group"
                        >
                            <span className="font-heading font-extrabold text-base text-mwezi-brandText">992</span>
                            <span className="text-[10px] font-semibold text-white">{t('support_gbv_title', 'National GBV Helpline')}</span>
                        </a>
                    </div>
                </div>

                {/* 2. EMERGENCY SUPPLIES & DIRECTORY SHORTCUTS */}
                <div className="grid grid-cols-2 gap-2.5">
                    <Link
                        href="/support/request"
                        className="p-4 bg-mwezi-accent text-white rounded-[20px] shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                    >
                        <Heart className="w-6 h-6 text-white mb-2" />
                        <div>
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase mb-1 inline-block">Free Packs</span>
                            <h3 className="font-heading font-bold text-xs leading-tight">{t('support_request_btn', 'Request Emergency Supplies')}</h3>
                            <p className="text-[10px] text-white/90 mt-0.5">{t('support_request_card_desc', 'Discreet pickup at schools or local partner clinics.')}</p>
                        </div>
                    </Link>

                    <Link
                        href="/support/map"
                        className="p-4 bg-mwezi-secondary text-mwezi-tertiary rounded-[20px] shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                    >
                        <MapPin className="w-6 h-6 text-mwezi-tertiary mb-2" />
                        <div>
                            <span className="bg-white/80 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase mb-1 inline-block">Locator</span>
                            <h3 className="font-heading font-bold text-xs leading-tight">{t('support_map_btn', 'Find Free Pad Hubs & Clinics')}</h3>
                            <p className="text-[10px] text-gray-700 mt-0.5">{t('support_map_card_desc', 'Check real-time pad stocks.')}</p>
                        </div>
                    </Link>
                </div>

                {/* 3. SEARCHABLE RADIX FAQ ACCORDION */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                            <HelpCircle className="w-4 h-4 text-mwezi-tertiary" />
                            <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider">
                                Frequently Asked Questions
                            </h3>
                        </div>
                        <button
                            onClick={() => setShowTicketModal(true)}
                            className="text-[11px] font-bold text-mwezi-accent hover:underline flex items-center space-x-1"
                        >
                            <LifeBuoy className="w-3.5 h-3.5" />
                            <span>Contact Helpdesk</span>
                        </button>
                    </div>

                    <input
                        type="text"
                        value={faqSearch}
                        onChange={(e) => setFaqSearch(e.target.value)}
                        placeholder="Search FAQ questions..."
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent"
                    />

                    <Accordion.Root type="single" collapsible className="space-y-2">
                        {filteredFaqs.map((faq) => (
                            <Accordion.Item
                                key={faq.id}
                                value={`faq-${faq.id}`}
                                className="border border-gray-100 rounded-xl overflow-hidden shadow-xs"
                            >
                                <Accordion.Header>
                                    <Accordion.Trigger className="w-full p-3 text-left text-xs font-semibold text-gray-800 flex justify-between items-center hover:bg-mwezi-primary/10 transition group">
                                        <span className="pr-2">{faq.question}</span>
                                        <ChevronDown className="w-4 h-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform shrink-0" />
                                    </Accordion.Trigger>
                                </Accordion.Header>
                                <Accordion.Content className="p-3 bg-gray-50/70 text-xs text-gray-600 leading-relaxed border-t border-gray-100 font-body">
                                    {faq.answer}
                                </Accordion.Content>
                            </Accordion.Item>
                        ))}
                    </Accordion.Root>
                </div>

                {/* 4. ACTIVE REQUESTS HISTORY */}
                {activeRequests.length > 0 && (
                    <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
                        <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider mb-2.5">
                            My Recent Requests
                        </h3>
                        <div className="space-y-2">
                            {activeRequests.map((req) => (
                                <div key={req.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <span className="font-mono text-[10px] text-gray-500">{req.request_code}</span>
                                        <p className="text-xs font-bold text-gray-800 capitalize">{req.request_type.replace('_', ' ')}</p>
                                        <p className="text-[10px] text-gray-500">Hub: {req.hub?.organization_name || 'Community Hub'}</p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mwezi-secondary text-mwezi-tertiary uppercase">
                                        {req.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* HELPDESK TICKET MODAL */}
            {showTicketModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[24px] max-w-sm w-full p-5 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <h3 className="font-heading font-bold text-base text-mwezi-tertiary flex items-center space-x-2">
                                <MessageSquare className="w-5 h-5 text-mwezi-accent" />
                                <span>Mwezi Support Helpdesk</span>
                            </h3>
                            <button onClick={() => setShowTicketModal(false)} className="text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitTicket} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="e.g. Free pad availability query"
                                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-mwezi-accent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Support Channel</label>
                                <select
                                    value={data.channel}
                                    onChange={(e) => setData('channel', e.target.value)}
                                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs font-medium"
                                >
                                    <option value="live_chat">In-App Live Chat Response</option>
                                    <option value="email_support">Email Response</option>
                                    <option value="helpline_callback">Phone Helpline Callback</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">How can we assist you?</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    placeholder="Describe what you need support with..."
                                    className="w-full p-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-mwezi-accent"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2.5 bg-mwezi-accent text-white font-bold rounded-[20px] text-xs shadow-md transition disabled:opacity-50"
                            >
                                {processing ? 'Submitting...' : 'Submit Support Ticket'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MobileAppLayout>
    );
}

