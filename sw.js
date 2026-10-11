// Service worker: keeps the chart generator working offline once it has been opened.
//
// App files are served NETWORK-FIRST: when online you always get the latest
// index.html / script.js / style.css (and the cache is refreshed), and only when the
// network fails does the cached copy answer. The earlier cache-first strategy meant an
// installed copy kept serving its first-ever version forever.
//
// Web fonts (Google Fonts CSS + font files) are cached on first use, cache-first, since
// a given font URL never changes. Everything else cross-origin (the place lookup) goes
// straight to the network.
//
// Bump CACHE_VERSION whenever the APP_SHELL list itself changes.
const CACHE_VERSION = "v3";
const APP_CACHE = `vedic-chart-app-${CACHE_VERSION}`;
const FONT_CACHE = "vedic-chart-fonts-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./tokens.css",
  "./style.css",
  "./script.js",
  "./astronomy.min.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png"
];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = [APP_CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => !keep.includes(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) =>
          cached || fetch(request).then((response) => {
            if (response.ok || response.type === "opaque") cache.put(request, response.clone());
            return response;
          })
        )
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(APP_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request, { ignoreSearch: true }).then((cached) =>
          cached || (request.mode === "navigate" ? caches.match("./index.html") : Response.error())
        )
      )
  );
});
