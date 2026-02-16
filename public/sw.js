/**
 * Service Worker — network-first strategy for HTML/navigation,
 * cache-first for immutable hashed assets (Vite outputs).
 *
 * Bump CACHE_VERSION on every deploy to invalidate stale caches.
 */
const CACHE_VERSION = 5;
const CACHE_NAME = `spa-salon-v${CACHE_VERSION}`;

self.addEventListener('install', () => {
  // Activate immediately — don't wait for old SW to release
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle http/https — skip chrome-extension:// and other schemes
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Never cache external API requests (Supabase, analytics, etc.)
  if (url.origin !== self.location.origin) return;

  // Navigation requests (HTML pages) — always network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Hashed assets (Vite fingerprinted files) — cache-first (immutable)
  if (url.pathname.match(/\/assets\/.*\.[a-f0-9]{8}\./)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Everything else — network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
