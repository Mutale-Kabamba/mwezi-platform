import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import {
    Search,
    CheckCircle2,
    ChevronRight,
    Play,
    FileText,
    ListChecks,
    Image as ImageIcon,
    Volume2,
    Sparkles,
    BookOpen,
} from 'lucide-react';

const FORMAT_META = {
    video: {
        label: 'Video',
        icon: Play,
        tint: 'bg-purple-50 text-[#7C3AED]',
    },
    checklist: {
        label: 'Checklist',
        icon: ListChecks,
        tint: 'bg-emerald-50 text-emerald-600',
    },
    infographic: {
        label: 'Visual',
        icon: ImageIcon,
        tint: 'bg-amber-50 text-amber-600',
    },
    audio_guide: {
        label: 'Audio',
        icon: Volume2,
        tint: 'bg-rose-50 text-rose-500',
    },
    article: {
        label: 'Read',
        icon: FileText,
        tint: 'bg-slate-100/90 text-[#5E546B]',
    },
};

export default function LearnIndex({
    categories = [],
    resources = [],
    userProgress = {},
    selectedCategory = null,
    search = '',
    currentLocale = 'en',
    mythsCount = 4,
}) {
    const { locale, setLocale } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(search);

    useEffect(() => {
        if (locale && locale !== currentLocale) {
            router.get(
                route('learn.index'),
                {
                    category: selectedCategory,
                    search: searchTerm,
                    locale: locale,
                },
                { preserveState: true, preserveScroll: true }
            );
        }
    }, [locale]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('learn.index'),
            {
                category: selectedCategory,
                search: searchTerm,
                locale: locale || currentLocale,
            },
            { preserveState: true }
        );
    };

    const handleCategoryClick = (slug) => {
        const newCategory = selectedCategory === slug ? null : slug;
        router.get(
            route('learn.index'),
            {
                category: newCategory,
                search: searchTerm,
                locale: locale || currentLocale,
            },
            { preserveState: true }
        );
    };

    const handleLocaleChange = (e) => {
        const newLocale = e.target.value;
        setLocale(newLocale);
        router.get(
            route('learn.index'),
            {
                category: selectedCategory,
                search: searchTerm,
                locale: newLocale,
            },
            { preserveState: true }
        );
    };

    const { completedCount, progressPercent } = useMemo(() => {
        const total = resources.length || 0;
        const done = resources.filter((r) => Boolean(userProgress[r.id]?.completed_at)).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return { completedCount: done, progressPercent: pct };
    }, [resources, userProgress]);

    return (
        <MobileAppLayout title="Learn" subtitle="Verified guides & lessons">
            <Head title="Learn - Mwezi" />

            <div className="space-y-4 pb-8">
                {/* 1. MINIMAL SEARCH & LANGUAGE BAR */}
                <div className="flex items-center space-x-2">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="w-4 h-4 text-[#9B90AB] absolute left-3.5 top-3" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search lessons..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/85 backdrop-blur-xl border border-white rounded-full text-xs text-[#2D2638] placeholder:text-[#9B90AB] focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-200/80 shadow-[0_4px_16px_-8px_rgba(45,38,56,0.08)] transition"
                        />
                    </form>

                    <select
                        value={locale || currentLocale}
                        onChange={handleLocaleChange}
                        aria-label="Language selector"
                        className="py-2.5 pl-3 pr-7 bg-white/85 backdrop-blur-xl border border-white rounded-full text-xs font-medium text-[#5E546B] focus:outline-none focus:ring-2 focus:ring-purple-200/80 shadow-[0_4px_16px_-8px_rgba(45,38,56,0.08)] shrink-0"
                    >
                        <option value="en">EN</option>
                        <option value="bem">BEM</option>
                        <option value="nya">NYA</option>
                        <option value="toi">TOI</option>
                        <option value="loz">LOZ</option>
                    </select>
                </div>

                {/* 2. SLEEK FEATURED QUIZ CARD (Myths vs Facts) */}
                <Link
                    href="/learn/myths-facts"
                    className="flex items-center justify-between p-4 bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] rounded-[24px] text-white shadow-[0_12px_28px_-10px_rgba(124,58,237,0.45)] group transition active:scale-[0.99]"
                >
                    <div className="space-y-1 min-w-0 pr-3">
                        <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-purple-200">
                            <Sparkles className="w-3 h-3" />
                            <span>Interactive Quiz • {mythsCount} myths</span>
                        </span>
                        <h2 className="font-semibold text-[15px] leading-snug">
                            Busting Myths vs. Facts
                        </h2>
                        <p className="text-[11px] text-purple-100/85">
                            Test your knowledge &amp; unlock badges
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition">
                        <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                </Link>

                {/* 3. SUBTLE CATEGORY PILLS */}
                <div className="flex items-center space-x-1.5 overflow-x-auto hide-scrollbar py-0.5">
                    <button
                        type="button"
                        onClick={() => handleCategoryClick(null)}
                        className={`px-3.5 py-1.5 rounded-full text-[11.5px] font-medium whitespace-nowrap transition ${
                            !selectedCategory
                                ? 'bg-[#2D2638] text-white shadow-2xs'
                                : 'bg-white/70 text-[#6E637C] hover:bg-white border border-white/90'
                        }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => {
                        const active = selectedCategory === cat.slug;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategoryClick(cat.slug)}
                                className={`px-3.5 py-1.5 rounded-full text-[11.5px] font-medium whitespace-nowrap transition ${
                                    active
                                        ? 'bg-[#2D2638] text-white shadow-2xs'
                                        : 'bg-white/70 text-[#6E637C] hover:bg-white border border-white/90'
                                }`}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>

                {/* 4. SUBTLE PROGRESS LINE & LESSON COUNT */}
                <div className="px-1 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#2D2638]">
                            Lessons
                        </span>
                        <span className="text-[#8A7F99] font-medium">
                            {completedCount}/{resources.length} completed
                        </span>
                    </div>
                    {resources.length > 0 && (
                        <div className="w-full h-1 bg-white/75 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#7C3AED] rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* 5. MINIMAL, WELL-CRAFTED LESSON CARDS */}
                {resources.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-8 border border-white text-center space-y-1.5">
                        <BookOpen className="w-6 h-6 text-[#9B90AB] mx-auto" />
                        <p className="text-xs font-semibold text-[#2D2638]">No lessons found</p>
                        <p className="text-[11px] text-[#8A7F99]">
                            Try clearing your search or switching topics.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {resources.map((res) => {
                            const progress = userProgress[res.id];
                            const isCompleted = Boolean(progress?.completed_at);
                            const pct = progress?.progress_percent || (isCompleted ? 100 : 0);
                            const translation = res.translations?.[0];
                            const title = translation?.translated_title || res.title;
                            const summary = translation?.translated_summary || res.summary;
                            const meta = FORMAT_META[res.format] || FORMAT_META.article;
                            const FormatIcon = meta.icon;

                            return (
                                <Link
                                    key={res.id}
                                    href={`/learn/article/${res.slug}`}
                                    className="block p-3.5 bg-white/85 backdrop-blur-xl rounded-[24px] border border-white shadow-[0_6px_24px_-12px_rgba(45,38,56,0.08)] hover:bg-white transition group active:scale-[0.99]"
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* Subtle Pastel Format Icon */}
                                        <div
                                            className={`w-11 h-11 rounded-2xl ${meta.tint} flex items-center justify-center shrink-0 mt-0.5`}
                                        >
                                            <FormatIcon className="w-4 h-4" strokeWidth={2} />
                                        </div>

                                        {/* Clean Content Stack */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            {/* Subtle Format Type & Meta */}
                                            <div className="flex items-center space-x-1.5 text-[10.5px] text-[#8A7F99] font-medium">
                                                <span className="text-[#6E637C] font-semibold">
                                                    {meta.label}
                                                </span>
                                                <span>·</span>
                                                <span className="truncate">
                                                    {res.category?.name || 'Guide'}
                                                </span>
                                                <span>·</span>
                                                <span className="shrink-0">
                                                    {res.read_time_minutes || 4} min
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="font-semibold text-[13.5px] text-[#2D2638] group-hover:text-[#7C3AED] transition leading-snug line-clamp-2">
                                                {title}
                                            </h3>

                                            {/* Subtle 1-Line Summary */}
                                            {summary && (
                                                <p className="text-[11.5px] text-[#7A6F8A] line-clamp-1 leading-relaxed">
                                                    {summary}
                                                </p>
                                            )}

                                            {/* Hairline Progress Bar (Only if started/completed) */}
                                            {pct > 0 && (
                                                <div className="pt-1.5 flex items-center space-x-2">
                                                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                isCompleted ? 'bg-emerald-500' : 'bg-[#7C3AED]'
                                                            }`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-[#8A7F99] font-medium">
                                                        {isCompleted ? 'Done' : `${pct}%`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Status Indicator */}
                                        <div className="pt-1 shrink-0">
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-[#C2B9CE] group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition" />
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </MobileAppLayout>
    );
}
