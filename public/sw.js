const CACHE_NAME = 'mwezi-offline-v2';
const OFFLINE_URLS = [
  '/',
  '/dashboard',
  '/cycle',
  '/support',
  '/learn',
  '/learn/myths-facts',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch((err) => {
        console.warn('Offline cache prefetch note:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Only handle same-origin GET requests
  if (url.origin !== self.location.origin) return;

  // Network-First with Cache Fallback for navigation, Inertia, and offline-accessible pages
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        const isHtmlOrInertia = event.request.headers.get('accept')?.includes('text/html') ||
                                event.request.headers.get('x-inertia');
        if (isHtmlOrInertia) {
          if (url.pathname.startsWith('/cycle')) {
            return caches.match('/cycle');
          }
          if (url.pathname.startsWith('/support')) {
            return caches.match('/support');
          }
          if (url.pathname.startsWith('/dashboard')) {
            return caches.match('/dashboard');
          }
          const defaultFallback = await caches.match('/learn/myths-facts');
          return defaultFallback || caches.match('/learn') || caches.match('/');
        }
      })
  );
});
