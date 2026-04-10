// ============================================
// Service Worker — VFIT PWA v4
// Unified: PWA caching + OneSignal Push (v16)
// Single SW file to avoid registration conflicts
// ============================================

// OneSignal Push — wrapped in try/catch so PWA works even if blocked
try {
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch (e) {
  console.warn('[SW] OneSignal SW script failed to load (likely ad blocker):', e.message)
}

const CACHE_VERSION = 'v8'
const CACHE_STATIC = `vfit-static-${CACHE_VERSION}`
const CACHE_DYNAMIC = `vfit-dynamic-${CACHE_VERSION}`
const CACHE_API = `vfit-api-${CACHE_VERSION}`

// App shell - pre-cached on install
const APP_SHELL = [
  '/',
  '/dashboard',
  '/dashboard/students',
  '/dashboard/workouts',
  '/dashboard/assessments',
  '/dashboard/notifications',
  '/dashboard/settings',
  '/dashboard/admin/users',
  '/login',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
]

// Max cache sizes
const MAX_DYNAMIC_CACHE = 100
const MAX_API_CACHE = 50

// ── Install ────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return Promise.allSettled(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to cache: ${url}`, err)
          })
        )
      )
    })
  )
  self.skipWaiting()
})

// ── Activate ───────────────────────────────────────

self.addEventListener('activate', (event) => {
  const validCaches = [CACHE_STATIC, CACHE_DYNAMIC, CACHE_API]
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all([
        ...keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => {
            console.log(`[SW] Deleting old cache: ${key}`)
            return caches.delete(key)
          }),
        revalidateAppShell(),
      ])
    )
  )
  self.clients.claim()
})

// ── Fetch ──────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-http, non-GET, chrome-extension, etc.
  if (!url.protocol.startsWith('http')) return
  if (request.method !== 'GET') return

  // Skip hot-reload / webpack HMR in dev
  if (url.pathname.includes('_next/webpack-hmr')) return
  if (url.pathname.startsWith('/_next/data')) return

  // Skip manifest.json and SW files — Chrome must fetch these directly
  if (url.pathname === '/manifest.json') return
  if (url.pathname === '/sw.js') return
  if (url.pathname === '/OneSignalSDKWorker.js') return

  // Skip cross-origin requests
  if (url.hostname !== self.location.hostname) return

  // API calls → Network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHE_API, MAX_API_CACHE))
    return
  }

  // Navigation → Network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request))
    return
  }

  // Static assets (JS, CSS, images, fonts) → Cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_STATIC))
    return
  }

  // Everything else → Stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_DYNAMIC, MAX_DYNAMIC_CACHE))
})

// ── Strategies ─────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request, cacheName, maxEntries) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
      trimCache(cacheName, maxEntries)
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cached = await caches.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const responseClone = response.clone()
        caches.open(cacheName).then((c) => c.put(request, responseClone))
        trimCache(cacheName, maxEntries)
      }
      return response
    })
    .catch(() => cached)

  return cached || fetchPromise
}

async function navigationHandler(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    const shellCached = await caches.match('/')
    if (shellCached) return shellCached

    const offlinePage = await caches.match('/offline')
    if (offlinePage) return offlinePage

    return new Response('Offline', { status: 503 })
  }
}

// ── Helpers ────────────────────────────────────────

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico)$/i.test(pathname) ||
    pathname.startsWith('/_next/static/')
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries)
    await Promise.all(toDelete.map((key) => cache.delete(key)))
  }
}

// ── Messages ───────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_VERSION })
  }

  if (event.data && event.data.type === 'CLEAR_CACHES') {
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => {
      event.ports[0]?.postMessage({ cleared: true })
    })
  }

  if (event.data && event.data.type === 'REVALIDATE_SHELL') {
    revalidateAppShell().then(() => {
      event.ports[0]?.postMessage({ ok: true, type: 'REVALIDATE_SHELL' })
    }).catch(() => {
      event.ports[0]?.postMessage({ ok: false, type: 'REVALIDATE_SHELL' })
    })
  }

  // S08-08: Pre-cache workout for offline use
  if (event.data && event.data.type === 'CACHE_WORKOUT') {
    const { workoutId, apiBase } = event.data
    const url = `${apiBase || ''}/api/v1/workouts/${workoutId}`
    cacheWorkoutForOffline(url).then(() => {
      event.ports[0]?.postMessage({ ok: true, type: 'CACHE_WORKOUT', workoutId })
    }).catch(() => {
      event.ports[0]?.postMessage({ ok: false, type: 'CACHE_WORKOUT', workoutId })
    })
  }

  // S08-08: Queue offline workout completion for sync
  if (event.data && event.data.type === 'QUEUE_OFFLINE_COMPLETION') {
    const payload = event.data.payload
    queueOfflineCompletion(payload).then(() => {
      event.ports[0]?.postMessage({ ok: true, type: 'QUEUE_OFFLINE_COMPLETION' })
    }).catch(() => {
      event.ports[0]?.postMessage({ ok: false, type: 'QUEUE_OFFLINE_COMPLETION' })
    })
  }
})

// ── Background Sync ────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending') {
    console.log('[SW] Background sync triggered')
  }
})

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(revalidateAppShell())
  }
})

// ── Push notification click handler ────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // Extract URL from notification data (OneSignal sends as launchURL or url)
  const url = event.notification.data?.launchURL
    || event.notification.data?.url
    || '/dashboard'

  // Handle action buttons if present
  if (event.action === 'view') {
    // "View" action — navigate to the specific URL
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Focus existing window if available
        for (const client of windowClients) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        // Open new window
        return clients.openWindow(url)
      })
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification (already done above)
    return
  } else {
    // Default click — open/focus the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        for (const client of windowClients) {
          if ('focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        return clients.openWindow(url)
      })
    )
  }

  // Clear app badge on notification interaction
  if (self.navigator && self.navigator.clearAppBadge) {
    self.navigator.clearAppBadge().catch(() => {})
  }
})

// ── Push event — update badge count ────────────────

self.addEventListener('push', (event) => {
  // Update app badge on incoming push
  if (self.navigator && self.navigator.setAppBadge) {
    // We don't know the exact count, just increment badge visibility
    self.navigator.setAppBadge().catch(() => {})
  }
})

// ── Silent background revalidation ─────────────────

async function revalidateAppShell() {
  const cache = await caches.open(CACHE_STATIC)
  await Promise.allSettled(
    APP_SHELL.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-store' })
        if (response && response.ok) {
          await cache.put(url, response.clone())
        }
      } catch {
        // best-effort
      }
    })
  )
}

// ── S08-08: Offline Workout Support ────────────────

const CACHE_WORKOUT_OFFLINE = `vfit-workout-offline-${CACHE_VERSION}`
const OFFLINE_QUEUE_KEY = 'vfit-offline-queue'

async function cacheWorkoutForOffline(workoutUrl) {
  try {
    const cache = await caches.open(CACHE_WORKOUT_OFFLINE)
    const response = await fetch(workoutUrl, { credentials: 'include' })
    if (response.ok) {
      await cache.put(workoutUrl, response.clone())
      console.log('[SW] Workout cached for offline:', workoutUrl)
    }
  } catch (err) {
    console.warn('[SW] Failed to cache workout:', err)
  }
}

async function queueOfflineCompletion(payload) {
  // Store in IndexedDB via simple cache mechanism
  try {
    const cache = await caches.open(CACHE_WORKOUT_OFFLINE)
    const existing = await cache.match(OFFLINE_QUEUE_KEY)
    let queue = []
    if (existing) {
      try { queue = await existing.json() } catch { queue = [] }
    }
    queue.push({ ...payload, queued_at: new Date().toISOString() })
    await cache.put(
      OFFLINE_QUEUE_KEY,
      new Response(JSON.stringify(queue), {
        headers: { 'Content-Type': 'application/json' }
      })
    )
    console.log('[SW] Offline completion queued:', payload.workout_id)
  } catch (err) {
    console.warn('[SW] Failed to queue offline completion:', err)
  }
}

// On sync, replay offline completions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending') {
    console.log('[SW] Background sync triggered')
  }
  if (event.tag === 'sync-workout-completions') {
    event.waitUntil(replayOfflineCompletions())
  }
})

async function replayOfflineCompletions() {
  try {
    const cache = await caches.open(CACHE_WORKOUT_OFFLINE)
    const existing = await cache.match(OFFLINE_QUEUE_KEY)
    if (!existing) return

    const queue = await existing.json()
    if (!queue || queue.length === 0) return

    const failed = []
    for (const item of queue) {
      try {
        const res = await fetch(`/api/v1/workouts/${item.workout_id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(item),
        })
        if (!res.ok) {
          failed.push(item)
        } else {
          console.log('[SW] Synced offline completion:', item.workout_id)
        }
      } catch {
        failed.push(item)
      }
    }

    // Save remaining failed items
    if (failed.length > 0) {
      await cache.put(
        OFFLINE_QUEUE_KEY,
        new Response(JSON.stringify(failed), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    } else {
      await cache.delete(OFFLINE_QUEUE_KEY)
    }
  } catch (err) {
    console.warn('[SW] Replay failed:', err)
  }
}
