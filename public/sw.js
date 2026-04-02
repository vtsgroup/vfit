// ============================================
// Service Worker — Compat Layer
// For old registrations that still point to /sw.js
// ============================================

try {
  // Reuse the unified PWA + OneSignal worker implementation
  importScripts('/OneSignalSDKWorker.js')
} catch {
  // Last-resort fallback so navigation still degrades gracefully offline
  self.addEventListener('install', () => self.skipWaiting())
  self.addEventListener('activate', () => self.clients.claim())

  self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() =>
          caches.match('/offline').then((r) => r || new Response('Offline', { status: 503 }))
        )
      )
    }
  })
}
