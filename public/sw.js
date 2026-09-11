const CACHE_NAME = 'dice-spec-v1';
const PRECACHE_URLS = ['/', '/manifest.webmanifest', '/favicon.ico', '/icon-192.png', '/icon-512.png', '/dice.wav'];
const PUBLIC_PAGE_PATTERN =
  /^\/(?:ja|en)?\/?(?:$|dice\/?$|expect\/?$|ccfolia\/?$|analyze-logs\/?$|blogs(?:\/|$)|terms\/?$|privacy-policy\/?$|specified-commercial-transactions\/?$)/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('range')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && PUBLIC_PAGE_PATTERN.test(url.pathname)) {
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request).then((response) => response ?? caches.match('/'))),
    );
    return;
  }

  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'audio'
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) void caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
            return response;
          }),
      ),
    );
  }
});
