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
                    primary: '#B8E3E9',     // Powder Blue
                    secondary: '#EDC8FF',   // Light Lilac
                    tertiary: '#8E484B',    // Muted Red (contrast & alerts)
                    accent: '#F98B88',      // Peach Pink (CTAs & Header)
                    brandText: '#89F6FA',   // Aqua (Header Brand Text)
                    dark: '#1F2937',        // Dark Charcoal body text
                    light: '#F8FCFD',       // Off-white pastel base
                },
            },
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
                body: ['Poppins', ...defaultTheme.fontFamily.sans],
                heading: ['Bernoru', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'mwezi': '20px',
                '20': '20px',
            },
            boxShadow: {
                'mwezi': '0 8px 24px -4px rgba(142, 72, 75, 0.08), 0 4px 12px -2px rgba(184, 227, 233, 0.3)',
                'mwezi-hover': '0 12px 28px -4px rgba(249, 139, 136, 0.25)',
            },
        },
    },

    plugins: [forms],
};
