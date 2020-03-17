addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline').then((cache) => {
      cache.add('offline.html');
    }),
  );
});

addEventListener('fetch', (event) => {
  if (event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('offline.html'))
    );
  }
});
