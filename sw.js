const cacheName = 'juego-pwa-v1';
const staticAssets = [
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    'icon.png' // Asegúrate de incluir tu icono
];

self.addEventListener('install', async () => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
});

self.addEventListener('fetch', async (req) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(req);

  return cachedResponse || fetch(req);
});