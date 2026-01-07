// Nom du cache et fichiers à mettre en cache
const CACHE_NAME = 'medtracker-v2';
const ASSETS = [
  'Index.html',
  'manifest.json',
  'icon.png',
  'icon-192.png',
  // Ajouter ici tous tes fichiers JS internes séparés si tu en as
  // Exemple: 'app.js', 'meds.js', etc.
  'https://cdn.tailwindcss.com'
];

// INSTALLATION : mettre en cache tous les fichiers essentiels
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Force l’activation immédiate du SW
});

// ACTIVATION : supprimer les anciens caches si besoin
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
  self.clients.claim(); // Prendre le contrôle des pages immédiatement
});

// FETCH : servir d’abord depuis le cache, sinon réseau
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      if (res) return res;
      return fetch(event.request)
        .then(resp => {
          // On met en cache la réponse si c’est une requête GET
          if (event.request.method === 'GET') {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, resp.clone());
            });
          }
          return resp;
        })
        .catch(() => {
          // Optionnel : afficher une page offline si tu en as
          if (event.request.destination === 'document') {
            return caches.match('Index.html');
          }
        });
    })
  );
});

// PUSH NOTIFICATIONS
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
