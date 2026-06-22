/**
 * src/components/auth/turnstile.tsx
 *
 * Turnstile — Cloudflare anti-bot
 *
 * Exports: TurnstileRef, Turnstile
 * Hooks: useEffect, useRef, useCallback, useImperativeHandle, useState
 * Features: 'use client'
 */

// ============================================
// Turnstile — Cloudflare anti-bot
// Strategy: invisible-first → fallback to interactive on failure
// 95%+ users never see anything. Bots are blocked.
// ============================================

'use client'

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
      execute: (container: string | HTMLElement, options?: Record<string, unknown>) => void
    }
    onTurnstileLoad?: () => void
    __vfitTurnstileOnLoadCallbacks?: Array<() => void>
  }
}

export interface TurnstileRef {
  reset: () => void
  execute: () => void
}

interface TurnstileProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAACbwFTxZJC74DsMB'

function shouldBypassTurnstileLocally() {
  if (typeof window === 'undefined') return false
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)
}

// How many invisible failures before escalating to interactive
const INVISIBLE_MAX_RETRIES = 2

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  function Turnstile({ onVerify, onExpire, onError }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)
    const retryCountRef = useRef(0)
    const [mode, setMode] = useState<'invisible' | 'interactive'>('invisible')
    const [isVerified, setIsVerified] = useState(false)
    const [isEnvironmentChecked, setIsEnvironmentChecked] = useState(false)
    const [bypassLocal, setBypassLocal] = useState(false)
    const modeRef = useRef<'invisible' | 'interactive'>('invisible')

    // Expose reset + execute to parent via ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        retryCountRef.current = 0
        setIsVerified(false) // Reset verification state
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current)
        }
      },
      execute: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.execute(widgetIdRef.current)
          } catch {
            // Widget may already be executing — safe to ignore
          }
        }
      },
    }))

    const cleanupWidget = useCallback(() => {
      try {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }
      } catch {
        // noop
      }
    }, [])

    useEffect(() => {
      const shouldBypass = shouldBypassTurnstileLocally()
      setBypassLocal(shouldBypass)
      setIsEnvironmentChecked(true)

      if (shouldBypass) {
        cleanupWidget()
        onVerify('dev-turnstile-bypass')
      }
    }, [cleanupWidget, onVerify])

    useEffect(() => {
      if (!isEnvironmentChecked) return
      if (bypassLocal) return
      if (!TURNSTILE_SITE_KEY) {
        console.warn('[Turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY não configurada')
      }
    }, [isEnvironmentChecked, bypassLocal])

    const renderWidget = useCallback((targetMode: 'invisible' | 'interactive') => {
      if (!TURNSTILE_SITE_KEY || !containerRef.current || !window.turnstile) return
      if (widgetIdRef.current) return

      // Turnstile API accepts: 'normal', 'compact', 'flexible' for size
      // Invisible behavior is achieved via appearance: 'interaction-only'
      // Interactive uses 'flexible' for 100% width responsiveness
      const size = targetMode === 'invisible' ? 'compact' : 'flexible'

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          setIsVerified(true) // Mark as verified for opacity
          onVerify(token)
        },
        'expired-callback': () => {
          onExpire?.()
          // Auto-reset to get fresh token
          setTimeout(() => {
            if (widgetIdRef.current && window.turnstile) {
              window.turnstile.reset(widgetIdRef.current)
            }
          }, 500)
        },
        'error-callback': (errorCode: string) => {
          const attempt = retryCountRef.current + 1
          console.warn(`[Turnstile] Error: ${errorCode} (mode=${modeRef.current}, attempt ${attempt})`)

          if (modeRef.current === 'invisible' && retryCountRef.current < INVISIBLE_MAX_RETRIES) {
            // Retry invisible with backoff
            retryCountRef.current++
            setTimeout(() => {
              cleanupWidget()
              renderWidget('invisible')
            }, 800 * retryCountRef.current)
          } else if (modeRef.current === 'invisible') {
            // Invisible exhausted → escalate to interactive checkbox
            console.warn('[Turnstile] Invisible failed — escalating to interactive mode')
            retryCountRef.current = 0
            modeRef.current = 'interactive'
            setMode('interactive')
            setTimeout(() => {
              cleanupWidget()
              renderWidget('interactive')
            }, 300)
          } else {
            // Interactive also failed — notify parent
            onError?.()
          }
        },
        theme: 'auto',
        size,
        retry: 'auto',
        'retry-interval': 5000,
        'refresh-expired': 'auto',
        appearance: targetMode === 'invisible' ? 'interaction-only' : 'always',
        execution: 'render',
      })
    }, [onVerify, onExpire, onError, cleanupWidget])

    useEffect(() => {
      if (!isEnvironmentChecked) return
      if (bypassLocal) return
      const startMode = modeRef.current === 'interactive' ? 'interactive' : 'invisible'
      const initRender = () => renderWidget(startMode)

      if (window.turnstile) {
        initRender()
        return
      }

      if (!window.__vfitTurnstileOnLoadCallbacks) {
        window.__vfitTurnstileOnLoadCallbacks = []
      }
      window.__vfitTurnstileOnLoadCallbacks.push(initRender)

      window.onTurnstileLoad = () => {
        const callbacks = window.__vfitTurnstileOnLoadCallbacks || []
        window.__vfitTurnstileOnLoadCallbacks = []
        callbacks.forEach((fn) => {
          try { fn() } catch { /* ignore */ }
        })
      }

      if (!document.getElementById('turnstile-script')) {
        const script = document.createElement('script')
        script.id = 'turnstile-script'
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
        script.async = true
        document.head.appendChild(script)
      }

      return () => {
        try {
          const list = window.__vfitTurnstileOnLoadCallbacks
          if (list) {
            window.__vfitTurnstileOnLoadCallbacks = list.filter((fn) => fn !== initRender)
          }
        } catch { /* noop */ }

        cleanupWidget()
      }
    }, [isEnvironmentChecked, bypassLocal, renderWidget, cleanupWidget])

    if (!isEnvironmentChecked || bypassLocal) return null

    // Invisible mode: widget renders out-of-flow (absolute) so it reserves ZERO
    // layout height — keeps token issuance identical (full-size render, opacity 0),
    // just no longer pushes the form apart. Interactive: in-flow visible checkbox.
    return (
      <div
        ref={containerRef}
        role={mode === 'invisible' ? undefined : 'group'}
        aria-label={mode === 'invisible' ? undefined : 'Verificação de segurança'}
        className={mode === 'invisible' ? 'pointer-events-none absolute' : 'flex min-h-18 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/95 p-2 shadow-glass-lg motion-safe:animate-blur-in [&>iframe]:w-full! [&>div]:w-full!'}
        style={{ opacity: mode === 'invisible' && !isVerified ? 0 : 1 }}
      />
    )
  }
)
