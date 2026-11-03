import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                mwezi: {
                    // Soft Modern Healthcare & Calming Palette
                    primary: '#FDE2E4',       // Soft Rose Blush (Calming, gentle)
                    primaryLight: '#FFF5F6',  // Airy Blossom White
                    primaryDark: '#F43F5E',   // Vibrant Rose CTA & Indicators
                    secondary: '#EDE8F5',     // Soft Lilac / Lavender Tint
                    secondaryDark: '#9333EA', // Muted Violet for Highlights
                    tertiary: '#702638',      // Deep Burgundy / Wine (High-contrast accessible text & headings)
                    accent: '#FB7185',        // Warm Coral Rose (Primary buttons & badges)
                    accentHover: '#E11D48',   // Deeper Rose for hover states
                    brandText: '#FFFFFF',     // Clean White for high-contrast text
                    mint: '#E6F4F1',          // Gentle Mint / Powder Teal for health & verified status
                    mintDark: '#0D9488',      // Deep Teal for medical icons & trust badges
                    surface: '#FCF9F9',       // Cashmere / Soft Warm Sand Base
                    card: '#FFFFFF',          // Crisp White Card Surface
                    dark: '#1E293B',          // Slate 800 body text (readable, soft)
                    muted: '#64748B',         // Slate 500 for captions & subtitles
                    border: '#F1E5E7',        // Subtle warm border
                    light: '#FAF5F6',         // Off-white pastel base
                },
            },
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
                body: ['Poppins', ...defaultTheme.fontFamily.sans],
                heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'mwezi': '24px',
                '20': '20px',
                '30': '30px',
            },
            boxShadow: {
                'mwezi': '0 10px 30px -5px rgba(112, 38, 56, 0.06), 0 4px 12px -2px rgba(251, 113, 133, 0.08)',
                'mwezi-hover': '0 20px 35px -5px rgba(225, 29, 72, 0.12), 0 8px 16px -4px rgba(112, 38, 56, 0.06)',
                'mwezi-glow': '0 0 25px 0 rgba(251, 113, 133, 0.25)',
                'mwezi-card': '0 4px 20px 0 rgba(0, 0, 0, 0.04)',
                'mwezi-float': '0 14px 34px 0 rgba(112, 38, 56, 0.10)',
            },
        },
    },

    plugins: [forms],
};
