// Games Collection Service Worker
// Provides offline functionality and caching for PWA

const CACHE_NAME = 'games-collection-v1.0.0';
const STATIC_CACHE = 'games-static-v1.0.0';
const DYNAMIC_CACHE = 'games-dynamic-v1.0.0';

// Files to cache immediately for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/js/theme-switcher.js',
  '/js/device-adaptive.js',
  '/js/index-enhancements.js',
  '/js/game-loader.js',
  '/js/memory-manager.js',
  '/js/game-sound-client.js',
  // Essential game pages for offline play
  '/chess.html',
  '/wordsearch.html',
  '/classical-puzzle.html',
  '/debug.html',
  '/connectivity-test.html'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests (API calls, etc.)
  if (!url.origin.includes(self.location.origin)) return;

  // Skip streaming media and large files
  if (url.pathname.match(/\.(mp4|webm|ogg|mp3|wav|flac)$/)) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Return cached version
          return response;
        }

        // Fetch from network and cache
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.log('[SW] Fetch failed, returning offline fallback');
            // Return offline fallback for HTML pages
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for multiplayer games (future enhancement)
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'multiplayer-sync') {
    event.waitUntil(syncMultiplayerData());
  }
});

async function syncMultiplayerData() {
  // Future: Sync pending multiplayer moves when connection restored
  console.log('[SW] Syncing multiplayer data');
}

// Push notifications for game invites (future enhancement)
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: data.url,
      actions: [
        {
          action: 'play',
          title: 'Play Now'
        },
        {
          action: 'dismiss',
          title: 'Later'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'play') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Periodic background tasks (future enhancement)
self.addEventListener('periodicsync', event => {
  console.log('[SW] Periodic sync triggered:', event.tag);

  if (event.tag === 'update-game-data') {
    event.waitUntil(updateGameData());
  }
});

async function updateGameData() {
  // Future: Update game statistics, check for new content
  console.log('[SW] Updating game data');
}

// Message handling for communication with main thread
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
