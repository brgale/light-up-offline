const CACHE_NAME = 'light-up-shell-v37';
const APP_ROOT = new URL('./', self.registration.scope);
const FILES = ['./', './index.html', './favicon.svg', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES.map(file => new URL(file, APP_ROOT).href))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    const appPage = new URL('./index.html', APP_ROOT);
    event.respondWith(fetch(request).then(response => {
      if (!response.ok) throw new Error('Network response was not successful');
      const copy = response.clone();
      return caches.open(CACHE_NAME).then(cache => cache.put(appPage, copy)).then(() => response);
    }).catch(() => caches.match(appPage)));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
    return response;
  })));
});
