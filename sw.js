// Mindful Fit offline helper.
// Online: always checks for the newest version of the app.
// Offline: opens the copy saved on your phone.
// If you change the app later, change the number in CACHE (v5 -> v6).
var CACHE = "mindful-fit-v6";
var FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(FILES.map(function (u) {
      return fetch(u, { cache: "reload" }).then(function (r) {
        if (!r.ok) throw new Error("bad response");
        return c.put(u, r);
      });
    }));
  }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }).then(function (r) {
      if (r && r.ok && new URL(e.request.url).origin === self.location.origin) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) { return hit || caches.match("./index.html"); });
    })
  );
});
