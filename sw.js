// sw.js - Service Worker minimal pour test
const CACHE_NAME = 'medtracker-v1';
const ASSETS = [
  'Index.html',
  'manifest.json',
  'icon.png'
];

// Installation et mise en cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activation (optionnel mais recommandé)
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Intercepter les requêtes pour le mode hors-ligne
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

// Gestion des notifications push (test)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {
    title: 'Rappel Médicament',
    body: "Il est l'heure de votre prise."
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'icon.png',
      badge: 'icon.png'
    })
  );
});
