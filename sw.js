const CACHE_NAME = 'zentrader-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  // Cache the Tailwind script so styles work offline
  'https://cdn.tailwindcss.com',
  // Note: In production build, Vite generates hashed filenames. 
  // For a simple PWA, caching the root and external libs is a good start.
  // The browser will handle caching of the JS bundle implicitly via standard HTTP cache usually,
  // but for strict offline, a more complex workbox setup is ideal. 
  // For this MVP, we ensure the shell and critical CSS (via CDN) are cached.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});