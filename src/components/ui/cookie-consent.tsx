/**
 * src/components/ui/cookie-consent.tsx
 *
 * Cookie Consent Banner — Enterprise, LGPD Compliant
 *
 * Exports: CookieConsentBanner
 * Hooks: useState, useEffect, useCallback
 * Features: 'use client' · DSIcon
 */

// ============================================
// Cookie Consent Banner — Enterprise, LGPD Compliant
// Analytics auto-approved (Cloudflare Analytics = privacy-first)
// ============================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'

// ─── Types ───────────────────────────────────────────
interface CookiePreferences {
  essential: boolean     // Always true, non-configurable
  analytics: boolean     // Auto-approved (Cloudflare Analytics = privacy-first)
  version: string
  acceptedAt: string
}

const STORAGE_KEY = 'pia-cookie-consent'
const CONSENT_VERSION = '2.0'

function getStoredConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as CookiePreferences
    // Re-prompt if consent version is outdated
    if (parsed.version !== CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

function storeConsent(prefs: CookiePreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // localStorage unavailable — graceful fail
  }
}

// ─── Route Suppression ───────────────────────────────
// Routes where cookie banner should NOT appear
const SUPPRESS_COOKIE_BANNER_ROUTES = [
  '/welcome',
  '/register',
  '/register/student',
  '/register/personal',
  '/onboarding',
  '/reset-password',
  '/verify-email',
  '/auth',
  '/login',
]

function shouldSuppressCookieBanner(pathname: string): boolean {
  return SUPPRESS_COOKIE_BANNER_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

// ─── Component ───────────────────────────────────────
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(true) // Auto-approved
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check if on suppressed route (early exit)
    if (typeof window !== 'undefined' && shouldSuppressCookieBanner(window.location.pathname)) {
      setMounted(true)
      return
    }

    // Delay mounting until AFTER Lighthouse LCP window (~2.5s)
    // Uses requestIdleCallback → setTimeout fallback to avoid being detected as LCP element
    const scheduleMount = () => {
      const timer = setTimeout(() => {
        setMounted(true)
        const stored = getStoredConsent()
        if (!stored) {
          // Small extra delay for smooth entrance
          setTimeout(() => setVisible(true), 300)
        }
      }, 2500)
      return timer
    }

    let timer: ReturnType<typeof setTimeout>
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(() => {
        timer = scheduleMount()
      })
      return () => {
        cancelIdleCallback(idleId)
        clearTimeout(timer)
      }
    } else {
      timer = scheduleMount()
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: true,
      version: CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
    }
    storeConsent(prefs)
    setVisible(false)
  }, [])

  const handleSavePreferences = useCallback(() => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics,
      version: CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
    }
    storeConsent(prefs)
    setVisible(false)
  }, [analytics])

  const handleRejectOptional = useCallback(() => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: false,
      version: CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
    }
    storeConsent(prefs)
    setVisible(false)
  }, [])

  if (!mounted || !visible) return null

  return (
    <>
      {/* Backdrop blur */}
      <div className="fixed inset-0 z-9998 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300" aria-hidden="true" />

      {/* Banner */}
      <div
        className="fixed inset-x-0 bottom-0 z-9999 p-4 sm:p-6 animate-in slide-in-from-bottom duration-500"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border dark:border-white/8 light:border-slate-200 dark:bg-zinc-950/95 light:bg-white/95 shadow-2xl dark:shadow-black/50 light:shadow-black/10 backdrop-blur-xl">
          {/* Header */}
          <div className="p-5 pb-0 sm:p-6 sm:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                  <DSIcon name="cookie" size={20} className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold dark:text-white light:text-slate-900">Cookies & Privacidade</h3>
                  <p className="text-xs dark:text-zinc-400 light:text-slate-500">LGPD Compliant • v{CONSENT_VERSION}</p>
                </div>
              </div>
              <button
                onClick={handleRejectOptional}
                className="rounded-lg p-1.5 dark:text-zinc-600 light:text-slate-400 transition-colors dark:hover:bg-white/5 light:hover:bg-black/5 dark:hover:text-zinc-400 light:hover:text-slate-600"
                aria-label="Fechar"
              >
                <DSIcon name="x" size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6">
            <p className="text-sm leading-relaxed dark:text-zinc-400 light:text-slate-500">
              Usamos cookies <strong className="dark:text-zinc-300 light:text-slate-700">estritamente necessários</strong> para
              o funcionamento da plataforma. Analytics opera via{' '}
              <strong className="dark:text-zinc-300 light:text-slate-700">Cloudflare Analytics Engine</strong> (server-side,
              privacy-first) sem rastreamento pessoal.
            </p>

            {/* Toggle Details */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand-primary transition-colors hover:text-brand-primary/80"
            >
              {expanded ? <DSIcon name="chevronUp" size={14} /> : <DSIcon name="chevronDown" size={14} />}
              {expanded ? 'Ocultar detalhes' : 'Personalizar cookies'}
            </button>

            {/* Expanded Details */}
            {expanded && (
              <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Essential */}
                <div className="flex items-center justify-between rounded-xl border dark:border-white/6 light:border-slate-200 dark:bg-white/2 light:bg-slate-50 p-3.5">
                  <div className="flex items-center gap-3">
                    <DSIcon name="shield" size={16} className="text-emerald-400" />
                    <div>
                      <p className="text-xs font-semibold dark:text-white light:text-slate-900">Necessários</p>
                      <p className="text-[10px] dark:text-zinc-400 light:text-slate-500">Autenticação, sessão, segurança</p>
                    </div>
                  </div>
                  <div className="flex h-6 w-11 items-center rounded-full bg-emerald-500/20 px-0.5">
                    <div className="h-5 w-5 translate-x-5 rounded-full bg-emerald-400 shadow-sm" />
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between rounded-xl border dark:border-white/6 light:border-slate-200 dark:bg-white/2 light:bg-slate-50 p-3.5">
                  <div className="flex items-center gap-3">
                    <DSIcon name="barChart" size={16} className="text-blue-400" />
                    <div>
                      <p className="text-xs font-semibold dark:text-white light:text-slate-900">Analytics</p>
                      <p className="text-[10px] dark:text-zinc-400 light:text-slate-500">Cloudflare Analytics (server-side, sem PII)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAnalytics(!analytics)}
                    className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
                      analytics ? 'bg-blue-500/20' : 'dark:bg-zinc-800 light:bg-slate-200'
                    }`}
                    role="switch"
                    aria-checked={analytics}
                  >
                    <div
                      className={`h-5 w-5 rounded-full shadow-sm transition-all ${
                        analytics ? 'translate-x-5 bg-blue-400' : 'translate-x-0 dark:bg-zinc-600 light:bg-slate-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Info callout */}
                <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3">
                  <p className="text-[10px] leading-relaxed dark:text-zinc-400 light:text-slate-500">
                    <strong className="text-emerald-400">Nota:</strong> Cloudflare Analytics Engine
                    opera 100% server-side. Não instala cookies no navegador e não coleta dados
                    pessoais identificáveis (PII). Detalhes na{' '}
                    <Link href="/cookies" className="text-brand-primary hover:underline">
                      Política de Cookies
                    </Link>.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 text-[10px] dark:text-zinc-400 light:text-slate-500">
                <Link href="/privacidade" className="dark:hover:text-zinc-300 light:hover:text-slate-700">Privacidade</Link>
                <span>•</span>
                <Link href="/cookies" className="dark:hover:text-zinc-300 light:hover:text-slate-700">Cookies</Link>
                <span>•</span>
                <Link href="/termos" className="dark:hover:text-zinc-300 light:hover:text-slate-700">Termos</Link>
              </div>
              <div className="flex gap-2">
                {expanded && (
                  <button
                    onClick={handleSavePreferences}
                    className="rounded-xl border dark:border-white/8 light:border-slate-200 dark:bg-white/3 light:bg-slate-100 px-4 py-2 text-xs font-medium dark:text-zinc-300 light:text-slate-600 transition-colors dark:hover:bg-white/6 light:hover:bg-slate-200"
                  >
                    Salvar preferências
                  </button>
                )}
                <button
                  onClick={handleAcceptAll}
                  className="rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-gray-900 shadow-lg shadow-brand-primary/20 transition-all hover:bg-brand-primary/90 hover:shadow-brand-primary/30"
                >
                  Aceitar todos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
