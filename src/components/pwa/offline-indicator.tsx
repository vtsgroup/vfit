/**
 * src/components/pwa/offline-indicator.tsx
 *
 * Offline Indicator — Shows when user is offline
 *
 * Exports: OfflineIndicator
 * Hooks: useState, useEffect
 * Features: 'use client' · DSIcon
 */

// ============================================
// Offline Indicator — Shows when user is offline
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => {
      setIsOffline(false)
    }

    setIsOffline(!navigator.onLine)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      className="fixed left-0 right-0 z-60 bg-yellow-500/90 backdrop-blur-sm"
      style={{ top: 'var(--demo-banner-offset, 0px)' }}
    >
      <div className="flex items-center justify-center gap-2 px-4 py-2">
        <DSIcon name="wifiOff" size={16} className="text-bg-dark" />
        <span className="text-xs font-semibold text-bg-dark">
          Sem conexão — modo offline
        </span>
      </div>
    </div>
  )
}
