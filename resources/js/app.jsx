import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './i18n/LanguageContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        const initialLocale = props?.initialPage?.props?.auth?.user?.preferred_language || 'en';

        root.render(
            <LanguageProvider initialLocale={initialLocale}>
                <App {...props} />
            </LanguageProvider>
        );
    },
    progress: {
        color: '#BE123C',
    },
});
