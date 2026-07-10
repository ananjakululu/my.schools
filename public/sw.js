// public/sw.js
const CACHE_NAME = 'tande-offline-v2'; // Changed to v2 to force browser to update

// Added dashboard files here!
const OFFLINE_ASSETS = [
    '/',
    '/login.html',
    '/auth.js',
    '/dashboard.html',
    '/index.html',
    '/script.js'
];

// 1. INSTALL: Save files when online
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching offline files (v2)');
            return cache.addAll(OFFLINE_ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// 3. FETCH: Fixed to prevent infinite loops
self.addEventListener('fetch', (event) => {
    // Only intercept requests for webpages (HTML)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // If offline, try to find the EXACT page requested
                    return caches.match(event.request.url).then((cachedPage) => {
                        
                        // If we have it cached (like dashboard.html), serve it!
                        if (cachedPage) return cachedPage;
                        
                        // If we don't have it, ONLY serve login.html if they asked for root or login
                        if (event.request.url.endsWith('/') || event.request.url.includes('login.html')) {
                            return caches.match('/login.html');
                        }
                        
                        // For anything else, just fail. DO NOT serve login.html to prevent loops.
                        return new Response('Offline: Page not cached.', { 
                            status: 503, 
                            headers: { 'Content-Type': 'text/plain' } 
                        });
                    });
                })
        );
    } else {
        // For CSS, JS, Fonts, etc.
        event.respondWith(
            caches.match(event.request).then((cached) => {
                return cached || fetch(event.request);
            })
        );
    }
});