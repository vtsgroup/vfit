/**
 * src/app/offline/page.tsx
 *
 * Offline fallback page — Modern design with SVG illustration
 *
 * Exports: OfflinePage
 * Hooks: useState, useEffect, useCallback
 * Features: 'use client' · DSIcon
 */

// ============================================
// Offline fallback page — Modern design with SVG illustration
// Auto-retry + manual reconnect + connection status
// ============================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isOnline, setIsOnline] = useState(false)

  const handleRetry = useCallback(async () => {
    setIsRetrying(true)
    try {
      const res = await fetch('/dashboard', { method: 'HEAD', cache: 'no-store' })
      if (res.ok) {
        setIsOnline(true)
        setTimeout(() => window.location.replace('/dashboard'), 500)
        return
      }
    } catch { /* still offline */ }
    setIsRetrying(false)
    setRetryCount(c => c + 1)
  }, [])

  // Auto-retry every 10s
  useEffect(() => {
    const id = setInterval(handleRetry, 10_000)
    return () => clearInterval(id)
  }, [handleRetry])

  // Listen for online event
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true)
      window.location.replace('/dashboard')
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="max-w-sm text-center">
        {/* SVG Illustration — Astronaut disconnected */}
        <div className="mx-auto mb-6 w-48">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            {/* Background circle */}
            <circle cx="100" cy="100" r="90" className="fill-bg-tertiary/50" />
            {/* Floating dumbbell */}
            <g className="animate-bounce" style={{ animationDuration: '3s' }}>
              <rect x="60" y="80" width="80" height="8" rx="4" className="fill-brand-primary/30" />
              <rect x="52" y="72" width="16" height="24" rx="4" className="fill-brand-primary/50" />
              <rect x="132" y="72" width="16" height="24" rx="4" className="fill-brand-primary/50" />
            </g>
            {/* WiFi icon with slash */}
            <g transform="translate(75, 110)">
              <path d="M25 40a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" className="fill-warning" />
              <path d="M15 28c5.5-5.5 14.5-5.5 20 0" className="stroke-warning" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M7 20c10-10 26-10 36 0" className="stroke-warning/60" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M0 12c14-14 36-14 50 0" className="stroke-warning/30" strokeWidth="3" strokeLinecap="round" fill="none" />
              {/* Slash */}
              <line x1="5" y1="5" x2="45" y2="45" className="stroke-error" strokeWidth="3" strokeLinecap="round" />
            </g>
            {/* Sparkle dots */}
            <circle cx="40" cy="50" r="2" className="fill-brand-primary/40 animate-pulse" />
            <circle cx="160" cy="60" r="3" className="fill-brand-accent/40 animate-pulse" style={{ animationDelay: '1s' }} />
            <circle cx="150" cy="140" r="2" className="fill-brand-primary/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </svg>
        </div>

        {/* Status icon */}
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-500 ${
          isOnline ? 'bg-success/15' : 'bg-warning/10'
        }`}>
          {isOnline ? (
            <DSIcon name="wifi" size={28} className="text-success animate-pulse" />
          ) : (
            <DSIcon name="wifiOff" size={28} className="text-warning" />
          )}
        </div>

        <h1 className="mt-5 text-2xl font-black tracking-tight text-text-primary">
          {isOnline ? 'Reconectado!' : 'Sem Conexão'}
        </h1>

        <p className="mt-2 text-sm text-text-muted leading-relaxed">
          {isOnline
            ? 'Redirecionando para o dashboard...'
            : 'Parece que você está offline. Seus dados estão salvos e seguros. Vamos reconectar automaticamente.'
          }
        </p>

        {/* Auto-retry indicator */}
        {!isOnline && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
            <div className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
            <span>Tentando reconectar automaticamente...</span>
            {retryCount > 0 && <span className="text-text-muted/60">({retryCount})</span>}
          </div>
        )}

        {/* Reconnect button */}
        {!isOnline && (
          <Button
            className="mt-6 gap-2"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            <DSIcon name="refresh" size={16} className={isRetrying ? 'animate-spin' : ''} />
            {isRetrying ? 'Verificando...' : 'Reconectar Agora'}
          </Button>
        )}

        {/* Brand footer */}
        <div className="mt-10 flex items-center justify-center gap-2 text-text-muted/40">
          <DSIcon name="dumbbell" size={16} />
          <span className="text-xs font-medium">VFIT</span>
        </div>
      </div>
    </div>
  )
}
