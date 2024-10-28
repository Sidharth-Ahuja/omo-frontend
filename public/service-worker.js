const CACHE_NAME = 'asset-cache-v1';

self.addEventListener('install', (event) => {
    // Activate immediately after installation
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim()); // Start controlling all pages immediately
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Only cache media files like images or mp3
    if (event.request.destination === 'image' || requestUrl.pathname.endsWith('.mp3')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                // If found in cache, serve the cached response
                if (cachedResponse) {
                    return cachedResponse;
                }

                // If not in cache, fetch from network, cache it, and serve it
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const clonedResponse = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clonedResponse);
                        });
                    }
                    return networkResponse;
                }).catch(error => {
                    console.error("Fetch failed:", error);
                    throw error;
                });
            })
        );
    }
});
