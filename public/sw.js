const CACHE_VERSION = 'portfolio-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/Profile_Image.webp',
  '/images/CompTIA_badge.webp',
  '/images/Icon.ico',
  '/pdfs/resume.pdf'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  STATIC: 'cache-first',
  // Network first for API calls
  API: 'network-first',
  // Cache first for images
  IMAGES: 'cache-first',
  // Stale while revalidate for HTML
  HTML: 'stale-while-revalidate'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.startsWith(CACHE_VERSION)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Chrome extensions and other non-http requests
  if (!url.protocol.startsWith('http')) return;
  
  // Skip preconnect requests to allow them to work properly
  if (request.headers.get('purpose') === 'preconnect') return;

  // Determine cache strategy based on request type
  if (url.pathname.includes('/api/') || url.hostname === 'api.github.com' || url.hostname === 'api.emailjs.com') {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else if (url.pathname.match(/\.(webp|svg)$/)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  } else if (url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Cache-first strategy with extended cache lifetime
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      // Add cache control headers for better caching
      const response = new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: {
          ...cached.headers,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Expires': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
        }
      });
      return response;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Clone response with extended cache headers
      const responseToCache = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...networkResponse.headers,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Expires': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
        }
      });
      cache.put(request, responseToCache.clone());
      return networkResponse;
    }
    return networkResponse;
  } catch (error) {
    return new Response('Network error', { status: 408 });
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    return cached || new Response('Network error', { status: 408 });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cached || networkResponsePromise;
}
