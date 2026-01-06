const CACHE_NAME = 'medtracker-v1';
const ASSETS = [
  'Index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com'
];

// Installation et mise en cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Intercepter les requêtes pour le mode hors-ligne
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

// Gestion des notifications push
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : { title: 'Rappel Médicament', body: 'Il est l\'heure de votre prise.' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'icon.png',
      badge: 'icon.png'
    })
  );
});
