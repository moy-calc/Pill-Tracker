const CACHE_NAME = 'medtracker-v3'; // Incrémenté à v3 pour forcer le nettoyage
const ASSETS = [
  'Index.html',
  'manifest.json',
  'icon.png',
  'icon-192.png',
  'https://cdn.tailwindcss.com'
];

// INSTALLATION
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ACTIVATION : Nettoie radicalement les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// FETCH : Stratégie Stale-While-Revalidate
self.addEventListener('fetch', event => {
  // Ignorer les requêtes Firebase/Analytics pour ne pas bloquer la synchro cloud
  if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('google')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Si la réponse est valide, on met à jour le cache en arrière-plan
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.destination === 'document') return caches.match('Index.html');
      });

      // Retourne le cache s'il existe, sinon attend le réseau
      return cachedResponse || fetchPromise;
    })
  );
});

// PUSH NOTIFICATIONS (Inchangé pour préserver tes réglages)
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
