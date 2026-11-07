// Service worker for the "الوطني" app (scope: grid.html only, so the family app is untouched).
// Network-first for same-origin files so updates show up immediately; the cached copy is
// only used when offline. The live data API (another origin) always goes to the network.
const CACHE = "watani-v1";
const SHELL = ["./grid.html", "./watani.webmanifest", "./watani-192.png", "./watani-512.png", "./watani-180.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("watani-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })),
  );
});
