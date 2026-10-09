const CACHE_NAME = 'angola-2026-v2'; // Incrementa a versão sempre que atualizares o app
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './fo.png'
];

// Instala o Service Worker e guarda os ficheiros essenciais
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força a ativação imediata da nova versão
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativa a nova versão e limpa caches antigas imediatamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceta os pedidos: usa a cache offline primeiro, mas atualiza em segundo plano quando houver rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Atualiza a cache com a versão mais recente da web se houver ligação
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          let responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se estiver offline, retorna o que está guardado na cache
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
