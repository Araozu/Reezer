// Minimal service worker for PWA "add to homescreen" support
// No caching - just satisfies browser requirements for PWA installability

self.addEventListener("install", () =>
{
	self.skipWaiting();
});

self.addEventListener("activate", (event) =>
{
	event.waitUntil(clients.claim());
});

self.addEventListener("fetch", () =>
{
	// Do nothing - let the browser handle all requests normally
	// Not calling event.respondWith() passes the request through unchanged
});
