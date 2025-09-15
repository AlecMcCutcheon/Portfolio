/* eslint-disable no-restricted-globals */
const CACHE_VERSION = 'portfolio-v12';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// GitHub Pages base path
const BASE_PATH = '/Portfolio';

// Static assets to cache immediately - Fixed paths for GitHub Pages
const STATIC_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/images/Profile_Image.webp`,
  `${BASE_PATH}/images/CompTIA_badge.webp`,
  `${BASE_PATH}/images/Icon.ico`,
  `${BASE_PATH}/pdfs/resume.pdf`
];


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
          return undefined;
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
  
  // Skip Google Analytics and other third-party scripts to prevent MIME type issues
  if (url.hostname === 'www.googletagmanager.com' || 
      url.hostname === 'www.google-analytics.com' ||
      url.hostname === 'www.googleadservices.com') {
    return;
  }
  
  // Force all requests to go through service worker by responding to ALL requests
  event.respondWith(handleRequest(request));
  
  // Debug logging for cache control troubleshooting
  console.log('Service Worker intercepting:', request.url);
});

// Handle all requests through service worker
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Special handling for main bundle to force network request and cache bust
  if (url.pathname.includes('/static/js/main.') || url.pathname.includes('/static/css/main.')) {
    console.log('Force network request for main bundle:', request.url);
    return networkFirstWithHeaders(request, STATIC_CACHE);
  }
  
  // Determine cache strategy based on request type
  if (url.pathname.includes('/api/') || url.hostname === 'api.github.com' || url.hostname === 'api.emailjs.com') {
    return networkFirst(request, DYNAMIC_CACHE);
  } else if (url.pathname.match(/\.(webp|svg|png|jpg|jpeg|gif|ico)$/)) {
    // Images get aggressive caching with explicit cache headers
    return cacheFirstWithHeaders(request, IMAGE_CACHE);
  } else if (url.pathname.match(/\.(js|css|woff|woff2|ttf|eot|pdf)$/)) {
    // Static assets get aggressive caching with explicit cache headers
    return cacheFirstWithHeaders(request, STATIC_CACHE);
  } else if (url.pathname.endsWith('.html') || url.pathname === '/') {
    // HTML gets stale-while-revalidate
    return staleWhileRevalidate(request, STATIC_CACHE);
  } else {
    return networkFirst(request, DYNAMIC_CACHE);
  }
}

// Aggressive cache-first strategy with long-term caching
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      // Add cache control headers to cached responses
      const response = new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: {
          ...Object.fromEntries(cached.headers.entries()),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Served-By': 'Service-Worker'
        }
      });
      return response;
    }
    
    const networkResponse = await fetch(request);
    const contentType = networkResponse.headers.get("content-type") || "";
    
    // Guard against HTML masquerading as other files (GitHub Pages 404 fallback)
    if (networkResponse.ok && !contentType.includes("text/html")) {
      // Create a new response with enhanced cache headers
      const enhancedResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers.entries()),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Served-By': 'Service-Worker-Network'
        }
      });
      
      // Cache the enhanced response
      cache.put(request, enhancedResponse.clone());
      return enhancedResponse;
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Network error', { status: 408 });
  }
}

// Aggressive cache-first strategy with explicit cache headers
async function cacheFirstWithHeaders(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('Serving from cache with headers:', request.url);
      // Return cached version with explicit cache headers
      const originalHeaders = Object.fromEntries(cached.headers.entries());
      // Remove the original cache-control header to avoid conflicts
      delete originalHeaders['cache-control'];
      
      const response = new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: {
          ...originalHeaders,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Served-By': 'Service-Worker-Cache',
          'X-Cache-TTL': '31536000'
        }
      });
      console.log('Cache response headers:', Object.fromEntries(response.headers.entries()));
      return response;
    }
    
    console.log('Fetching from network with headers:', request.url);
    const networkResponse = await fetch(request);
    const contentType = networkResponse.headers.get("content-type") || "";
    
    // Guard against HTML masquerading as other files (GitHub Pages 404 fallback)
    if (networkResponse.ok && !contentType.includes("text/html")) {
      // Create a new response with enhanced cache headers
      const originalHeaders = Object.fromEntries(networkResponse.headers.entries());
      // Remove the original cache-control header to avoid conflicts
      delete originalHeaders['cache-control'];
      
      const enhancedResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...originalHeaders,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Served-By': 'Service-Worker-Network',
          'X-Cache-TTL': '31536000'
        }
      });
      
      console.log('Enhanced response headers:', Object.fromEntries(enhancedResponse.headers.entries()));
      
      // Cache the enhanced response
      cache.put(request, enhancedResponse.clone());
      return enhancedResponse;
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
    const contentType = networkResponse.headers.get("content-type") || "";
    
    // Guard against HTML masquerading as other files (GitHub Pages 404 fallback)
    if (networkResponse.ok && !contentType.includes("text/html")) {
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

// Network-first strategy with explicit cache headers
async function networkFirstWithHeaders(request, cacheName) {
  try {
    console.log('Fetching from network with headers (forced):', request.url);
    const networkResponse = await fetch(request);
    const contentType = networkResponse.headers.get("content-type") || "";
    
    // Guard against HTML masquerading as other files (GitHub Pages 404 fallback)
    if (networkResponse.ok && !contentType.includes("text/html")) {
      // Create a new response with enhanced cache headers
      const originalHeaders = Object.fromEntries(networkResponse.headers.entries());
      // Remove the original cache-control header to avoid conflicts
      delete originalHeaders['cache-control'];
      
      const enhancedResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...originalHeaders,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Served-By': 'Service-Worker-Network-Forced',
          'X-Cache-TTL': '31536000'
        }
      });
      
      console.log('Enhanced response headers (forced):', Object.fromEntries(enhancedResponse.headers.entries()));
      
      // Cache the enhanced response
      const cache = await caches.open(cacheName);
      cache.put(request, enhancedResponse.clone());
      return enhancedResponse;
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
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
