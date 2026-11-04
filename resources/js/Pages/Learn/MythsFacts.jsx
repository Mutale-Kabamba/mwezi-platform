import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MarkdownRenderer, { formatInlineText } from '@/Components/MarkdownRenderer';
import { useTranslation } from '@/i18n/LanguageContext';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    RotateCw,
    Sparkles,
    CheckCircle,
    Share2
} from 'lucide-react';

export default function MythsFacts({ myths = [], currentLocale = 'en' }) {
    const { locale, t } = useTranslation();

    useEffect(() => {
        if (locale && locale !== currentLocale) {
            router.get(route('learn.myths'), {
                locale: locale,
            }, { preserveState: true, preserveScroll: true });
        }
    }, [locale]);

    // Array of revealed myth IDs
    const [flippedCards, setFlippedCards] = useState({});

    const toggleFlip = (id) => {
        setFlippedCards(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const bustedCount = Object.values(flippedCards).filter(Boolean).length;

    return (
        <MobileAppLayout title="Myths vs. Facts" backUrl="/learn">
            <Head title="Myths vs Facts - Stigma Busting - Mwezi" />

            <div className="space-y-4">

                {/* Status Bar */}
                <div className="flex items-center justify-end">

                    <div className="flex items-center space-x-1 text-xs font-bold text-mwezi-tertiary bg-mwezi-secondary/60 px-3 py-1.5 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-mwezi-accent" />
                        <span>{bustedCount} of {myths.length} Taboos Busted</span>
                    </div>
                </div>

                {/* Header Banner */}
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-mwezi-primary/40">
                    <h1 className="font-heading font-extrabold text-lg text-mwezi-tertiary mb-1">
                        Break the Silence, Bust the Myth
                    </h1>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Harmful myths make girls feel ashamed or miss school. Tap any card below to flip it and uncover the medical fact verified by healthcare professionals.
                    </p>
                </div>

                {/* Flip Cards List */}
                <div className="space-y-3.5">
                    {myths.map((item, idx) => {
                        const isFlipped = !!flippedCards[item.id];

                        return (
                            <div
                                key={item.id}
                                onClick={() => toggleFlip(item.id)}
                                className={`p-5 rounded-[20px] shadow-sm transition-all duration-300 cursor-pointer border relative ${isFlipped
                                    ? 'bg-emerald-50/90 border-emerald-300'
                                    : 'bg-white border-mwezi-accent/40 hover:border-mwezi-accent'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center space-x-1 ${isFlipped ? 'bg-emerald-200 text-emerald-900' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {isFlipped ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        <span>{isFlipped ? 'Verified Scientific Fact' : 'Common Myth / Taboo'}</span>
                                    </span>

                                    <div className="flex items-center space-x-1 text-[11px] text-gray-400 font-semibold">
                                        <RotateCw className="w-3 h-3" />
                                        <span>{isFlipped ? 'Tap to see myth' : 'Tap to reveal fact'}</span>
                                    </div>
                                </div>

                                {!isFlipped ? (
                                    <div>
                                        <h3 className="font-heading font-bold text-sm text-gray-900 mb-2 leading-snug">
                                            "{formatInlineText(item.myth_statement)}"
                                        </h3>
                                        <p className="text-[11px] text-gray-500 italic">
                                            Have you heard this before? Tap anywhere on this card to bust this myth!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 animate-fadeIn">
                                        <h3 className="font-heading font-bold text-sm text-emerald-950 mb-1 leading-snug">
                                            The Scientific Truth:
                                        </h3>
                                        <div className="text-xs text-emerald-900 leading-relaxed font-body">
                                            <MarkdownRenderer content={item.fact_explanation} />
                                        </div>
                                        <div className="pt-2 flex items-center space-x-1.5 text-[10px] text-emerald-700 font-semibold">
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Clinically verified for adolescent health dignity</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </MobileAppLayout>
    );
}

