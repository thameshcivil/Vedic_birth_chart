// Service worker for the web version (the Android app bundles everything itself).
// App files are network-first so updates arrive; the cache answers when offline.
// Bump CACHE_VERSION whenever this file list changes.
const CACHE_VERSION = "aarush-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png",
  "./css/app.css",
  "./css/fonts.css",
  "./css/tokens.css",
  "./js/alarms.js",
  "./js/app.js",
  "./js/astro.js",
  "./js/festivals.js",
  "./js/format.js",
  "./js/i18n/en.js",
  "./js/i18n/hi.js",
  "./js/i18n/index.js",
  "./js/i18n/kn.js",
  "./js/i18n/ml.js",
  "./js/i18n/sa.js",
  "./js/i18n/sanskrit.js",
  "./js/i18n/ta.js",
  "./js/i18n/te.js",
  "./js/icons.js",
  "./js/jathagam-data.js",
  "./js/native.js",
  "./js/panchang.js",
  "./js/sankalpam.js",
  "./js/store.js",
  "./js/translit.js",
  "./js/vendor/astronomy.min.js",
  "./js/views/alarms.js",
  "./js/views/calendar.js",
  "./js/views/jathagam.js",
  "./js/views/sankalpam.js",
  "./js/views/settings.js",
  "./js/views/today.js",
  "./fonts/hind-devanagari-400-normal.woff2",
  "./fonts/hind-devanagari-600-normal.woff2",
  "./fonts/hind-guntur-telugu-400-normal.woff2",
  "./fonts/hind-guntur-telugu-600-normal.woff2",
  "./fonts/hind-latin-400-normal.woff2",
  "./fonts/hind-latin-600-normal.woff2",
  "./fonts/hind-latin-ext-400-normal.woff2",
  "./fonts/hind-latin-ext-600-normal.woff2",
  "./fonts/hind-madurai-tamil-400-normal.woff2",
  "./fonts/hind-madurai-tamil-600-normal.woff2",
  "./fonts/hind-mysuru-kannada-400-normal.woff2",
  "./fonts/hind-mysuru-kannada-600-normal.woff2",
  "./fonts/libre-baskerville-latin-400-normal.woff2",
  "./fonts/libre-baskerville-latin-700-normal.woff2",
  "./fonts/libre-baskerville-latin-ext-400-normal.woff2",
  "./fonts/libre-baskerville-latin-ext-700-normal.woff2",
  "./fonts/manjari-malayalam-400-normal.woff2",
  "./fonts/manjari-malayalam-700-normal.woff2",
  "./fonts/noto-serif-devanagari-devanagari-600-normal.woff2",
  "./fonts/noto-serif-kannada-kannada-600-normal.woff2",
  "./fonts/noto-serif-malayalam-malayalam-600-normal.woff2",
  "./fonts/noto-serif-tamil-tamil-600-normal.woff2",
  "./fonts/noto-serif-telugu-telugu-600-normal.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // place search etc. go straight to the network
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
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
