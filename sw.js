// Service Worker for 考研备考打卡 PWA
// Cache-first strategy: app shell pre-cached, HTML stale-while-revalidate

const CACHE_NAME = 'kaoyan-pwa-v7';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('SW install: some resources failed to cache', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate for HTML, cache-first for other assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only handle GET requests for same origin or relative paths
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Skip non-http(s) and chrome-extension requests
  if (!url.protocol.startsWith('http')) return;

  // For HTML (navigation): stale-while-revalidate
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match('./index.html').then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put('./index.html', response.clone());
            }
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // For other assets (manifest, icon, etc.): cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        }
        return response;
      }).catch(() => {
        // Offline fallback for non-critical assets — just fail gracefully
        return new Response('', { status: 408 });
      });
    })
  );
});

// ===== Web Push =====
self.addEventListener("push", function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "该学习了", body: "先完成一个保底任务，今天就不算断线。" };
  }
  const title = data.title || "该学习了";
  const options = {
    body: data.body || "先完成一个保底任务，今天就不算断线。",
    icon: "./icon.svg",
    badge: "./icon.svg",
    data: { url: data.url || "./#checkin" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : "./#checkin";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ("focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
