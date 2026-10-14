const CACHE_NAME = 'kajigon-cache-v2.6.1';
const urlsToCache = [
  './',
  './index.html',
  './style.css?v=2.6.1',
  './script.js?v=2.6.1',
  './js/data/bosses.js?v=2.6.1',
  './js/data/karuta.js?v=2.6.1',
  './js/data/spirit_profiles.js?v=2.6.1',
  './js/data/dialogues.js?v=2.6.1',
  './js/data/newspaper.js?v=2.6.1',
  './js/core/sound.js?v=2.6.1',
  './js/core/state.js?v=2.6.1',
  './js/components/toast.js?v=2.6.1',
  './js/components/furniture.js?v=2.6.1',
  './js/components/bosses.js?v=2.6.1',
  './js/components/encyclopedia.js?v=2.6.1',
  './js/components/stone_tablet.js?v=2.6.1',
  './js/components/newspaper.js?v=2.6.1',
  './js/components/companion.js?v=2.6.1',
  './js/components/chores.js?v=2.6.1',
  './images/spirits/dragon_all.png',
  './images/spirits/kajigon_baby.png',
  './images/spirits/kajigon_teen.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Network-First Strategy: Always fetch fresh network content first!
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
