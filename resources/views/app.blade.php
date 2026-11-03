<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
        <meta name="theme-color" content="#FB7185">
        <meta name="description" content="Mwezi Platform - Modern Menstrual Health, Dignity & Community Support Platform">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="Mwezi">

        <title inertia>{{ config('app.name', 'Mwezi Platform') }}</title>

        <!-- Manifest -->
        <link rel="manifest" href="/manifest.json">
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="apple-touch-icon" href="/icons/icon-192.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-body antialiased bg-[#FAF6F7] text-mwezi-dark min-h-screen selection:bg-rose-100 selection:text-rose-900">
        @inertia

        <script>
            // Register PWA Service Worker
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js').catch((err) => {
                        console.log('SW registration error:', err);
                    });
                });
            }
        </script>
    </body>
</html>
