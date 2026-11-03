import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { translations, languages } from './translations';

const LanguageContext = createContext({
    locale: 'en',
    setLocale: () => {},
    t: (key, fallback) => fallback || key,
    languages: languages,
});

export function LanguageProvider({ children }) {
    const page = usePage();
    const userPreferred = page.props?.auth?.user?.preferred_language;

    const [locale, setLocaleState] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mwezi_locale');
            if (saved && translations[saved]) {
                return saved;
            }
        }
        return userPreferred && translations[userPreferred] ? userPreferred : 'en';
    });

    useEffect(() => {
        if (userPreferred && translations[userPreferred] && !localStorage.getItem('mwezi_locale')) {
            setLocaleState(userPreferred);
        }
    }, [userPreferred]);

    const setLocale = (newLocale) => {
        if (!translations[newLocale]) return;
        setLocaleState(newLocale);
        if (typeof window !== 'undefined') {
            localStorage.setItem('mwezi_locale', newLocale);
        }

        // If user is authenticated and language changed, persist to server
        if (page.props?.auth?.user && page.props.auth.user.preferred_language !== newLocale) {
            router.patch(route('profile.privacy'), {
                preferred_language: newLocale,
            }, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const t = (key, fallback = '') => {
        const activeDict = translations[locale] || translations.en;
        if (activeDict && activeDict[key]) {
            return activeDict[key];
        }
        // Fallback to English
        if (translations.en && translations.en[key]) {
            return translations.en[key];
        }
        return fallback || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t, languages }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    return useContext(LanguageContext);
}

export default LanguageContext;
