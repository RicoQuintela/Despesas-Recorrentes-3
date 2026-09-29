const VERSION = 'despesas-recorrentes-v2';
const BASE = new URL('./', self.registration.scope);
const CORE = [
  BASE.href,
  new URL('index.html', BASE).href,
  new URL('manifest.webmanifest', BASE).href,
  new URL('icons/icon-192.png', BASE).href,
  new URL('icons/icon-512.png', BASE).href,
  new URL('icons/apple-touch-icon.png', BASE).href
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('despesas-recorrentes-') && key !== VERSION).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(VERSION).then(cache => cache.put(BASE.href, copy));
      return response;
    }).catch(() => caches.match(BASE.href).then(cached => cached || caches.match(new URL('index.html', BASE).href))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) caches.open(VERSION).then(cache => cache.put(request, response.clone()));
    return response;
  })));
});
