/**
 * src/components/providers/onesignal-provider.tsx
 *
 * OneSignal Web Push Provider
 *
 * Exports: OneSignalProvider, useOneSignal
 * Hooks: useState, useEffect, useRef, useCallback, useAuthStore, useOneSignal
 * Features: Auth: useAuthStore · 'use client'
 *
 * Fix v6.2.1: Prevents login() crash on partially-initialized SDK.
 * Root cause: pushOneSignal's deferred callbacks don't catch async rejections,
 * and login() was called before init() completed or after init() failed.
 * Solution: Store SDK reference only after successful init(), use direct calls
 * with proper await/catch, and gate all operations on sdkReady state.
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'

// ============================================
// OneSignal Web Push Provider
// SDK v16 — https://documentation.onesignal.com/docs/web-sdk
// ============================================

const ONESIGNAL_APP_ID = '3043de4e-d7aa-4fa1-a61b-5abea28d2f47'
const SAFARI_WEB_ID = 'web.onesignal.auto.18c45a69-7bf7-46f8-9483-0a7df130c3b6'

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalSDK) => void>
  }
}

interface OneSignalSDK {
  init(options: Record<string, unknown>): Promise<void>
  login(externalId: string): Promise<void>
  logout(): Promise<void>
  User: {
    addTags(tags: Record<string, string>): Promise<void>
    removeTags(tags: string[]): Promise<void>
    PushSubscription: {
      optIn(): Promise<void>
      optOut(): Promise<void>
      readonly id: string | null | undefined
      readonly token: string | null | undefined
    }
  }
  Notifications: {
    readonly permission: boolean
    readonly permissionNative: NotificationPermission
    requestPermission(): Promise<void>
    addEventListener(event: string, callback: (...args: unknown[]) => void): void
    removeEventListener(event: string, callback: (...args: unknown[]) => void): void
  }
  Slidedown: {
    promptPush(options?: Record<string, unknown>): Promise<void>
  }
}

// ── Module-level SDK reference (set only after successful init) ────────
let _sdkInstance: OneSignalSDK | null = null

/** Returns the SDK instance if init() succeeded, or null */
export function getOneSignalSDK(): OneSignalSDK | null {
  return _sdkInstance
}

function loadOneSignalSDK() {
  if (typeof window === 'undefined') return
  if (document.querySelector('script[src*="OneSignalSDK"]')) return

  window.OneSignalDeferred = window.OneSignalDeferred || []

  const script = document.createElement('script')
  script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
  script.defer = true
  document.head.appendChild(script)
}

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  const initRef = useRef(false)
  const loginRef = useRef<string | null>(null)
  const [sdkReady, setSdkReady] = useState(false)

  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const personalProfile = useAuthStore((s) => s.personalProfile)
  const studentProfile = useAuthStore((s) => s.studentProfile)

  // ── Initialize OneSignal SDK (delayed 4s to not compete with LCP) ────────────────────
  useEffect(() => {
    if (initRef.current) return
    if (typeof window === 'undefined') return

    initRef.current = true

    const timer = setTimeout(() => {
      loadOneSignalSDK()

      // Use the deferred array ONLY for init — login/logout use direct SDK reference
      window.OneSignalDeferred = window.OneSignalDeferred || []
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            safari_web_id: SAFARI_WEB_ID,
            allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
            serviceWorkerPath: '/OneSignalSDKWorker.js',
            serviceWorkerUpdaterPath: '/OneSignalSDKWorker.js',
            serviceWorkerParam: { scope: '/' },
            notifyButton: { enable: false },
            promptOptions: { autoPrompt: false },
            welcomeNotification: {
              title: 'VFIT',
              message: 'Notificações ativadas com sucesso!',
            },
            notificationClickHandlerMatch: 'origin',
            defaultUrl: 'https://iapersonal.app.br/dashboard',
            defaultNotificationIcon: 'https://iapersonal.app.br/icons/notification-badge-192.png',
          })
          // Store reference ONLY after successful init
          _sdkInstance = OneSignal
          setSdkReady(true)
          console.log('[OneSignal] SDK initialized successfully')
        } catch (err) {
          _sdkInstance = null
          console.error('[OneSignal] Init error (login/tags disabled):', err)
        }
      })
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  // ── Sync user login/logout + tags (only when SDK is ready) ────────────────
  useEffect(() => {
    if (!isHydrated || !sdkReady) return

    const sdk = _sdkInstance
    if (!sdk) return

    // Use an IIFE with proper async error handling (no pushOneSignal!)
    void (async () => {
      try {
        if (isAuthenticated && user) {
          // Already logged in with this user? Skip
          if (loginRef.current === user.id) return
          loginRef.current = user.id

          // Login with external user ID
          await sdk.login(user.id)

          // Set tags for segmentation
          const tags: Record<string, string> = {
            user_type: user.user_type,
          }

          if (user.user_type === 'student' && studentProfile?.personal_id) {
            tags.personal_id = studentProfile.personal_id
          }

          if (user.user_type === 'personal' && personalProfile?.plan_type) {
            tags.plan_type = personalProfile.plan_type
          }

          await sdk.User.addTags(tags)
          console.log('[OneSignal] User synced:', user.id, tags)
        } else {
          // User logged out
          if (loginRef.current) {
            loginRef.current = null
            await sdk.logout()
            console.log('[OneSignal] User logged out')
          }
        }
      } catch (err) {
        // Reset loginRef so it retries on next state change
        loginRef.current = null
        console.error('[OneSignal] Sync error:', err)
      }
    })()
  }, [sdkReady, isHydrated, isAuthenticated, user, studentProfile, personalProfile])

  return <>{children}</>
}

// ============================================
// Hook to interact with OneSignal from components
// ============================================

export function useOneSignal() {
  const requestPermission = useCallback(async () => {
    const sdk = _sdkInstance
    if (!sdk) {
      // SDK not initialized — check browser permission directly
      const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default'
      console.warn('[OneSignal] SDK not ready, browser permission:', permission)
      return permission === 'granted'
    }

    try {
      await sdk.Notifications.requestPermission()
      const granted = typeof Notification !== 'undefined' && Notification.permission === 'granted'
      if (granted) {
        sdk.User.PushSubscription.optIn().catch(() => {
          console.warn('[OneSignal] optIn failed (CORS), but browser permission granted')
        })
      }
      return granted
    } catch (err) {
      console.error('[OneSignal] Permission error:', err)
      const granted = typeof Notification !== 'undefined' && Notification.permission === 'granted'
      return granted
    }
  }, [])

  const getPermissionStatus = useCallback((): NotificationPermission => {
    if (typeof window === 'undefined') return 'default'
    if (!('Notification' in window)) return 'denied'
    return Notification.permission
  }, [])

  const optOut = useCallback(async () => {
    const sdk = _sdkInstance
    if (!sdk) return

    try {
      await sdk.User.PushSubscription.optOut()
      console.log('[OneSignal] User opted out')
    } catch (err) {
      console.error('[OneSignal] OptOut error:', err)
    }
  }, [])

  return {
    requestPermission,
    getPermissionStatus,
    optOut,
  }
}
