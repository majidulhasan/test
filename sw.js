const CACHE_NAME = 'passnest-cache-v1';
const urlsToCache = [
  './', // এটি আপনার মূল পেইজকে ক্যাশ করবে
  './index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
