// CanadaAccountants Service Worker - PWA Offline Capability
// Version 1.0

const CACHE_NAME = 'canadaaccountants-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/register.html',
  '/comparison.html',
  '/offline.html',
  // Add your CSS files here (if you have separate CSS files)
  // '/styles/main.css',
  // Add your JS files here (if you have separate JS files)
  // '/js/main.js',
  // Add critical images
  // '/images/logo.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become active
        return self.skipWaiting();
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages
      return self.clients.claim();
    })
  );
});

// Fetch Strategy: Cache First with Network Fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('https://fonts.googleapis.com')) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If online, update cache and return response
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
          return response;
        })
        .catch(() => {
          // If offline, try cache first
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If not in cache, return offline page
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Handle other requests (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache successful responses
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If it's an image request and offline, return a placeholder
            if (event.request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image Offline</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            // For other failed requests, just fail
            throw error;
          });
      })
  );
});

// Background Sync for Form Submissions (when back online)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-forms') {
    event.waitUntil(syncFormSubmissions());
  }
});

// Sync form submissions when back online
async function syncFormSubmissions() {
  try {
    // Get stored form submissions from IndexedDB
    const submissions = await getStoredSubmissions();
    
    for (const submission of submissions) {
      try {
        // Attempt to submit the form
        const response = await fetch(submission.url, {
          method: submission.method,
          headers: submission.headers,
          body: submission.body
        });
        
        if (response.ok) {
          // Remove successfully submitted form from storage
          await removeStoredSubmission(submission.id);
          console.log('Form submission synced:', submission.id);
        }
      } catch (error) {
        console.log('Failed to sync form submission:', submission.id, error);
      }
    }
  } catch (error) {
    console.log('Error during background sync:', error);
  }
}

// Placeholder functions for form storage (would integrate with IndexedDB)
async function getStoredSubmissions() {
  // Implementation would use IndexedDB to get stored form submissions
  return [];
}

async function removeStoredSubmission(id) {
  // Implementation would remove the submission from IndexedDB
  console.log('Removing stored submission:', id);
}

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update from CanadaAccountants',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'canadaaccountants-notification',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('CanadaAccountants', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Network status detection for better UX
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NETWORK_STATUS') {
    // Handle network status updates from the main app
    console.log('Network status:', event.data.online ? 'Online' : 'Offline');
  }
});
