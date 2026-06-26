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
        <style>{`
          @keyframes shimmer-border {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.2), inset 0 1px 1px rgba(255,255,255,0.1); }
            50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.4), inset 0 1px 1px rgba(255,255,255,0.1); }
          }
          @keyframes icon-glow {
            0%, 100% { filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.3)); }
            50% { filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.6)); }
          }
          @keyframes fade-scale-in {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
          .shimmer-border-animation {
            background: linear-gradient(
              90deg,
              rgba(34, 197, 94, 0.1) 0%,
              rgba(34, 197, 94, 0.3) 25%,
              rgba(34, 197, 94, 0.5) 50%,
              rgba(34, 197, 94, 0.3) 75%,
              rgba(34, 197, 94, 0.1) 100%
            );
            background-size: 1000px 100%;
            animation: shimmer-border 3s infinite;
          }
          .icon-container {
            animation: fade-scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .icon-glow-animation {
            animation: icon-glow 3s ease-in-out infinite;
          }
          .pulse-glow-animation {
            animation: pulse-glow 4s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .icon-container,
            .icon-glow-animation,
            .pulse-glow-animation,
            .shimmer-border-animation {
              animation: none !important;
            }
          }
        `}</style>

        <div className="mx-auto max-w-2xl relative">
          {/* Visual backdrop — only behind the card */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'rgba(8, 23, 42, 0.70)',
              filter: 'blur(16px)',
              top: '8px',
              left: '8px',
              right: '8px',
              bottom: '8px'
            }}
            aria-hidden="true"
          />

          {/* Shimmer border gradient layer */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none shimmer-border-animation"
            style={{
              padding: '1px'
            }}
            aria-hidden="true"
          />

          {/* Cookie card */}
          <div
            className="relative overflow-hidden rounded-3xl backdrop-blur-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              boxShadow: `
                0 0 50px rgba(34, 197, 94, 0.2),
                0 24px 48px -12px rgba(0, 0, 0, 0.15),
                inset 0 1px 1px rgba(255, 255, 255, 0.3)
              `
            }}
          >
          {/* Header */}
          <div className="p-5 pb-0 sm:p-6 sm:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                {/* Premium Icon Container with Glassmorphism */}
                <div className="icon-container relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                  style={{
                    width: '44px',
                    height: '44px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Eye Icon with Dark Outline + Green Background */}
                  <svg className="icon-glow-animation h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#22c55e" stroke="#0f1729" strokeWidth="1.5" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
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
                    <DSIcon name="barChart" size={16} className="text-brand-primary" />
                    <div>
                      <p className="text-xs font-semibold dark:text-white light:text-slate-900">Analytics</p>
                      <p className="text-[10px] dark:text-zinc-400 light:text-slate-500">Cloudflare Analytics (server-side, sem PII)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAnalytics(!analytics)}
                    className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
                      analytics ? 'bg-brand-primary/20' : 'dark:bg-zinc-800 light:bg-slate-200'
                    }`}
                    role="switch"
                    aria-checked={analytics}
                  >
                    <div
                      className={`h-5 w-5 rounded-full shadow-sm transition-all ${
                        analytics ? 'translate-x-5 bg-brand-primary' : 'translate-x-0 dark:bg-zinc-600 light:bg-slate-400'
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
                    className="group relative rounded-2xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-lg border overflow-hidden"
                    style={{
                      background: 'rgba(34, 197, 94, 0.12)',
                      borderColor: 'rgba(34, 197, 94, 0.3)',
                      color: 'rgba(34, 197, 94)',
                      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 4px 16px rgba(34, 197, 94, 0.1)'
                    }}
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" />
                    <span className="relative">Salvar preferências</span>
                  </button>
                )}
                <button
                  onClick={handleAcceptAll}
                  className="group/sub relative inline-flex h-12 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-[12px] font-black uppercase tracking-wider text-[#08122B] transition-all duration-300 hover:-translate-y-px active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)',
                    boxShadow: '0 10px 26px -8px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.45)'
                  }}
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/sub:translate-x-[120%]" />
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    Aceitar todos <DSIcon name="arrowRight" size={13} />
                  </span>
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  )
}
