// ============================================
// use-geolocation.ts — Captura de geolocalização best-effort
// ============================================
//
// O que faz:
//   Solicita localização do dispositivo (TWA + PWA) e salva no servidor
//   para personalização futura (academias próximas, etc.).
//   Totalmente best-effort: falhas são silenciosas, nunca bloqueia o fluxo.
//
// Exports principais:
//   useGeolocation() → { requestAndSaveLocation }
//
// Hooks usados: useAuthStore
// Side effects: POST /profile/location com lat/lng/accuracy
// ============================================

'use client'

import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export function useGeolocation() {
  // ✅ AUTH GUARD obrigatório
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  const requestAndSaveLocation = () => {
    if (!isReady) return
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // best-effort: salva localização para personalização de treinos/academias próximas
        api
          .post('/profile/location', {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          })
          .catch(() => {
            // nunca quebrar fluxo principal
          })
      },
      (err) => {
        // 1 = PERMISSION_DENIED, 2 = UNAVAILABLE, 3 = TIMEOUT
        console.warn('[Geolocation] código:', err.code)
      },
      {
        enableHighAccuracy: false, // economiza bateria
        timeout: 10000,
        maximumAge: 60000 * 5, // cache por 5 min
      }
    )
  }

  return { requestAndSaveLocation }
}
