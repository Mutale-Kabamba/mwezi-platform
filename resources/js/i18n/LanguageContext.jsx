import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { translations, languages } from './translations';

const LanguageContext = createContext({
    locale: 'en',
    setLocale: () => {},
    t: (key, fallback) => fallback || key,
    languages: languages,
});

export function LanguageProvider({ children, initialLocale = 'en' }) {
    const [locale, setLocaleState] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mwezi_locale');
            if (saved && translations[saved]) {
                return saved;
            }
        }
        return initialLocale && translations[initialLocale] ? initialLocale : 'en';
    });

    useEffect(() => {
        if (initialLocale && translations[initialLocale] && !localStorage.getItem('mwezi_locale')) {
            setLocaleState(initialLocale);
        }
    }, [initialLocale]);

    const setLocale = (newLocale) => {
        if (!translations[newLocale]) return;
        setLocaleState(newLocale);
        if (typeof window !== 'undefined') {
            localStorage.setItem('mwezi_locale', newLocale);
        }

        // Attempt persisting to user profile if logged in
        try {
            router.patch(route('profile.privacy'), {
                preferred_language: newLocale,
            }, {
                preserveScroll: true,
                preserveState: true,
                onError: () => {},
            });
        } catch (e) {
            // Silently ignore when guest / unauthenticated
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
