// Minimal service worker for PWA "add to homescreen" support
// No caching - just satisfies browser requirements for PWA installability

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", () => {
  // Let all requests pass through to the network
});
