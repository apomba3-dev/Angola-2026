const CACHE_NAME = 'angola-2026-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './fo.png'
];

// Instalar o Service Worker e guardar os ficheiros em cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativar e limpar caches antigas se houver atualizações
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
    })
  );
});

// Intercetar os pedidos de rede e servir os ficheiros salvos offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
