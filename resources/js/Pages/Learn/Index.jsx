import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { 
    Search, 
    BookOpen, 
    CheckCircle2, 
    Sparkles, 
    Heart, 
    Package, 
    Users, 
    ChevronRight, 
    Globe, 
    CheckCircle, 
    Bookmark,
    ArrowRight
} from 'lucide-react';

export default function LearnIndex({ 
    categories = [], 
    resources = [], 
    userProgress = {}, 
    selectedCategory = null, 
    search = '', 
    currentLocale = 'en',
    mythsCount = 4
}) {
    const { locale, setLocale, t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(search);

    useEffect(() => {
        if (locale && locale !== currentLocale) {
            router.get(route('learn.index'), {
                category: selectedCategory,
                search: searchTerm,
                locale: locale,
            }, { preserveState: true, preserveScroll: true });
        }
    }, [locale]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('learn.index'), {
            category: selectedCategory,
            search: searchTerm,
            locale: locale || currentLocale,
        }, { preserveState: true });
    };

    const handleCategoryClick = (slug) => {
        const newCategory = selectedCategory === slug ? null : slug;
        router.get(route('learn.index'), {
            category: newCategory,
            search: searchTerm,
            locale: locale || currentLocale,
        }, { preserveState: true });
    };

    const handleLocaleChange = (e) => {
        const newLocale = e.target.value;
        setLocale(newLocale);
        router.get(route('learn.index'), {
            category: selectedCategory,
            search: searchTerm,
            locale: newLocale,
        }, { preserveState: true });
    };

    return (
        <MobileAppLayout title="Learn">
            <Head title="Learn Hub & Reusable Pad Guides - Mwezi" />

            <div className="space-y-4">
                
                {/* 1. SEARCH & LANGUAGE SELECTION BAR */}
                <div className="flex items-center space-x-2">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search guides, pad care, cramps..."
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-[16px] text-xs focus:ring-2 focus:ring-mwezi-accent focus:border-transparent"
                        />
                    </form>

                    <div className="relative shrink-0">
                        <select
                            value={locale || currentLocale}
                            onChange={handleLocaleChange}
                            aria-label="Language selector"
                            className="py-2 pl-2.5 pr-6 bg-white border border-gray-200 rounded-[16px] text-xs font-semibold text-mwezi-tertiary focus:ring-2 focus:ring-mwezi-accent"
                        >
                            <option value="en">English (EN)</option>
                            <option value="bem">Icibemba (BEM)</option>
                            <option value="nya">Chinyanja (NYA)</option>
                            <option value="toi">Chitonga (TOI)</option>
                            <option value="loz">Silozi (LOZ)</option>
                        </select>
                    </div>
                </div>

                {/* 2. CATEGORY PILLS FILTER */}
                <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar py-1">
                    <button
                        onClick={() => handleCategoryClick(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                            !selectedCategory 
                                ? 'bg-mwezi-accent text-white shadow-sm' 
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        All Topics
                    </button>
                    {categories.map((cat) => {
                        const active = selectedCategory === cat.slug;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.slug)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                    active 
                                        ? 'bg-mwezi-accent text-white shadow-sm' 
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>

                {/* 3. GAMIFIED MYTHS VS FACTS HERO TEASER */}
                <Link
                    href="/learn/myths-facts"
                    className="p-4 bg-gradient-to-r from-mwezi-secondary to-mwezi-primary rounded-[20px] shadow-sm hover:shadow-md transition flex items-center justify-between border border-white group"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-mwezi-tertiary shadow-sm shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-mwezi-tertiary" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-mwezi-tertiary">Interactive Stigma Buster</span>
                            <h3 className="font-heading font-bold text-sm text-mwezi-tertiary">
                                Busting Menstrual Myths vs. Facts
                            </h3>
                            <p className="text-[10px] text-gray-700">Tap to flip & test {mythsCount} common Zambian taboos</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-mwezi-tertiary group-hover:translate-x-1 transition" />
                </Link>

                {/* 4. ARTICLES & GUIDES LIST */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider">
                            Verified Educational Articles
                        </h2>
                        <span className="text-[10px] text-gray-500 font-medium">{resources.length} Available</span>
                    </div>

                    {resources.map((res) => {
                        const progress = userProgress[res.id];
                        const translation = res.translations?.[0];
                        const title = translation?.translated_title || res.title;
                        const summary = translation?.translated_summary || res.summary;

                        return (
                            <Link
                                key={res.id}
                                href={`/learn/article/${res.slug}`}
                                className="block p-4 bg-white rounded-[20px] shadow-sm hover:shadow-md border border-gray-100 transition group"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-bold text-mwezi-tertiary bg-mwezi-primary/40 px-2 py-0.5 rounded-full capitalize">
                                        {res.category?.name || 'Guide'}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        {res.read_time_minutes} min read
                                    </span>
                                </div>

                                <h3 className="font-heading font-bold text-sm text-gray-900 group-hover:text-mwezi-accent transition leading-snug mb-1">
                                    {title}
                                </h3>

                                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                                    {summary}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px]">
                                    <span className="text-emerald-700 font-medium flex items-center space-x-1">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Medically Verified</span>
                                    </span>

                                    {progress?.completed_at ? (
                                        <span className="text-emerald-600 font-bold flex items-center space-x-0.5">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Completed</span>
                                        </span>
                                    ) : (
                                        <span className="text-mwezi-accent font-bold flex items-center space-x-0.5">
                                            <span>Start Reading</span>
                                            <ChevronRight className="w-3 h-3" />
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </MobileAppLayout>
    );
}

