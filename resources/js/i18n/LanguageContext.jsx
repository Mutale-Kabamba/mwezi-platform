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

            // Guard against calling profile update when unauthenticated / on guest routes
            const path = window.location.pathname;
            const guestPaths = ['/', '/login', '/register', '/onboarding', '/forgot-password', '/reset-password', '/sponsor'];
            const isGuestPath = guestPaths.some(p => path === p || path.startsWith(p + '/'));

            if (isGuestPath) {
                return;
            }

            try {
                const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                fetch('/profile/privacy', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        ...(token ? { 'X-CSRF-TOKEN': token } : {}),
                    },
                    body: JSON.stringify({ preferred_language: newLocale }),
                }).catch(() => {});
            } catch (_) {
                // Silently ignore
            }
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
