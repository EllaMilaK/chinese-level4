// 中文四册 — Service Worker
// Caches all lesson pages for offline use after first visit

const CACHE = 'chinese4-v2';
const PRECACHE = [
  './',
  './index.html',
  './lesson1.html',
  './lesson9.html',
  './manifest.json'
];

// On install: cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// On activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy: network first, fall back to cache
// HanziWriter CDN is always fetched fresh; local files use cache when offline
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go to network for CDN resources (HanziWriter, etc.)
  if (!url.origin.includes(self.location.origin)) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Local files: network first, cache fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Update cache with fresh copy
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
