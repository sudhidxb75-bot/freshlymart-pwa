const CACHE_NAME = 'freshly-mart-pwa-v6-20260624';
const APP_SHELL = [
  './',
  './index.html',
  './category.html',
  './product.html',
  './cart.html',
  './checkout.html',
  './fresh-items.html',
  './local-stores.html',
  './sell-with-us.html',
  './join-hub.html',
  './refer.html',
  './contact.html',
  './returns.html',
  './policies.html',
  './seller-login.html',
  './seller-dashboard.html',
  './order-success.html',
  './offline.html',
  './assets/style.css',
  './assets/app.js',
  './assets/pwa.js',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Do not cache Apps Script/API calls. They must stay live.
  if (url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')) {
    event.respondWith(fetch(req).catch(() => new Response(JSON.stringify({ ok:false, message:'You are offline. Backend is not reachable.' }), { headers:{ 'Content-Type':'application/json' } })));
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(cached => cached || caches.match('./offline.html'))));
    return;
  }

  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
    if (req.method === 'GET' && res && res.status === 200 && url.origin === location.origin) {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    }
    return res;
  }).catch(() => cached)));
});