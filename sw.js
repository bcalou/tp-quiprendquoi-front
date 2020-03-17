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
      fetch(event.request)
        .then((res) => {
          if (isPartyPage(event.request.url)) {
            const copy = res.clone();
            caches
              .open('parties')
              .then((cache) => cache.put(event.request, copy));
            return res;
          } else {
            return res;
          }
        })
        .catch(() => {
          if (isPartyPage(event.request.url)) {
            return caches
              .match(event.request)
              .catch(() => caches.match('offline.html'));
          } else {
            return caches.match('offline.html');
          }
        }),
    );
  } else {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open('static').then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request)),
    );
  }
});

function isPartyPage(url) {
  return /party\/[a-zA-Z0-9]*$/.test(url);
}
