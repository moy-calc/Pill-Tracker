// Nom du cache et fichiers à mettre en cache
const CACHE_NAME = 'medtracker-v1';
const ASSETS = [
  'Index.html',
  'manifest.json',
  'icon.png',
  'https://cdn.tailwindcss.com' // CDN CSS
];

// INSTALLATION : mettre en cache tous les fichiers essentiels
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Force l’activation du SW immédiatement
});

// ACTIVATION : nettoyer les anciens caches si nécessaire
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim(); // Prendre le contrôle immédiat des pages
});

// FETCH : servir depuis le cache, sinon réseau
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

// NOTIFICATIONS PUSH
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
