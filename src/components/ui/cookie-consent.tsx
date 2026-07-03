/**
 * src/components/ui/cookie-consent.tsx
 *
 * Cookie Consent Banner — Enterprise, LGPD Compliant
 *
 * Exports: CookieConsentBanner
 * Hooks: useState, useEffect, useCallback
 * Features: 'use client' · DSIcon
 *
 * Só aparece em navegador web: PWA instalado, TWA (Android) e iOS standalone
 * são suprimidos — nesses contextos o consentimento já foi dado na web ou o
 * ambiente não expõe cookies de terceiros configuráveis.
 */

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

// ─── Platform Suppression ────────────────────────────
// PWA instalado (Android/desktop), iOS standalone e TWA não veem o banner.
function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const displayModeApp =
      typeof window.matchMedia === 'function' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches)
    const iosStandalone =
      'standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    const twa =
      document.referrer.startsWith('android-app://') ||
      new URLSearchParams(window.location.search).get('utm_source') === 'twa'
    return displayModeApp || iosStandalone || twa
  } catch {
    return false
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
    // App instalado (PWA/TWA/iOS standalone) ou rota suprimida → não mostra banner.
    if (
      typeof window !== 'undefined' &&
      (isStandaloneApp() || shouldSuppressCookieBanner(window.location.pathname))
    ) {
      setMounted(true)
      return
    }

    // Aparece logo após a hidratação — o rAF garante que o 1º frame da página
    // já pintou antes de inserir o banner (LCP fica no herói, não aqui).
    setMounted(true)
    if (getStoredConsent()) return

    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
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
    <div
      role="dialog"
      aria-label="Preferências de cookies"
      className="vfit-consent-enter fixed inset-x-0 bottom-0 z-9999 p-3 sm:p-5"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <style>{`
        @keyframes vfit-consent-up {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .vfit-consent-enter {
          animation: vfit-consent-up 0.42s cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .vfit-consent-enter { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-md sm:max-w-lg">
        <div
          className="relative overflow-hidden rounded-card-lg backdrop-blur-2xl"
          style={{
            background: 'rgba(10, 16, 28, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow:
              '0 1px 2px rgba(0,0,0,0.4), 0 20px 50px -12px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Assinatura da marca: hairline emerald no topo, estática */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.55) 30%, rgba(34,197,94,0.55) 70%, transparent 100%)',
            }}
          />

          <div className="p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <DSIcon name="shieldCheck" size={17} className="shrink-0 text-brand-primary" />
                <h3 className="text-[13px] font-bold tracking-tight text-white">
                  Cookies & Privacidade
                </h3>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  LGPD
                </span>
              </div>
              <button
                onClick={handleRejectOptional}
                className="flex h-8 w-8 items-center justify-center rounded-[9px] text-zinc-500 transition-colors hover:bg-white/6 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
                aria-label="Fechar e manter somente cookies necessários"
              >
                <DSIcon name="x" size={15} />
              </button>
            </div>

            {/* Body */}
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-zinc-400">
              Usamos cookies <strong className="font-semibold text-zinc-200">estritamente necessários</strong> para
              a plataforma funcionar. Analytics opera via{' '}
              <strong className="font-semibold text-zinc-200">Cloudflare Analytics Engine</strong>{' '}
              (server-side, privacy-first), sem rastreamento pessoal.
            </p>

            {/* Toggle Details */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2.5 flex min-h-8 items-center gap-1 text-[11.5px] font-semibold text-brand-primary transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 rounded-md"
              aria-expanded={expanded}
            >
              <DSIcon name={expanded ? 'chevronUp' : 'chevronDown'} size={13} />
              {expanded ? 'Ocultar detalhes' : 'Personalizar'}
            </button>

            {/* Expanded Details */}
            {expanded && (
              <div className="mt-3 space-y-2">
                {/* Essential */}
                <div className="flex items-center justify-between rounded-[13px] border border-white/7 bg-white/3 px-3.5 py-3">
                  <div className="flex items-center gap-3">
                    <DSIcon name="lock" size={15} className="text-emerald-400" />
                    <div>
                      <p className="text-[12px] font-semibold text-white">Necessários</p>
                      <p className="text-[10.5px] text-zinc-500">Autenticação, sessão, segurança</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-emerald-400">
                    Sempre ativos
                  </span>
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between rounded-[13px] border border-white/7 bg-white/3 px-3.5 py-3">
                  <div className="flex items-center gap-3">
                    <DSIcon name="barChart" size={15} className="text-brand-primary" />
                    <div>
                      <p className="text-[12px] font-semibold text-white">Analytics</p>
                      <p className="text-[10.5px] text-zinc-500">Server-side, sem PII ·{' '}
                        <Link href="/cookies" className="text-brand-primary hover:underline">saiba mais</Link>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAnalytics(!analytics)}
                    className={`flex h-6.5 w-11.5 shrink-0 items-center rounded-full px-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 ${
                      analytics ? 'bg-brand-primary' : 'bg-zinc-700'
                    }`}
                    role="switch"
                    aria-checked={analytics}
                    aria-label="Permitir analytics"
                  >
                    <span
                      className={`h-5.5 w-5.5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-transform ${
                        analytics ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Actions — igualdade de escolha (LGPD) */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={expanded ? handleSavePreferences : handleRejectOptional}
                className="flex h-11 items-center justify-center rounded-[13px] border border-white/12 bg-white/5 px-4 text-[12px] font-bold text-zinc-200 transition-all hover:bg-white/9 active:translate-y-px active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
              >
                {expanded ? 'Salvar preferências' : 'Somente necessários'}
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex h-11 items-center justify-center gap-1.5 rounded-[13px] bg-brand-primary px-4 text-[12px] font-black text-white transition-all hover:brightness-105 active:translate-y-px active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
                style={{
                  border: '1px solid rgba(6,78,59,0.7)',
                  boxShadow:
                    '0 1px 2px rgba(2,44,34,0.4), 0 8px 20px -6px rgba(6,95,70,0.5), inset 0 1px 0 rgba(255,255,255,0.22)',
                  textShadow: '0 1px 2px rgba(2,44,34,0.38)',
                }}
              >
                Aceitar todos
                <DSIcon name="arrowRight" size={13} />
              </button>
            </div>

            {/* Legal links */}
            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-zinc-500">
              <Link href="/privacidade" className="transition-colors hover:text-zinc-300">Privacidade</Link>
              <span aria-hidden="true">·</span>
              <Link href="/cookies" className="transition-colors hover:text-zinc-300">Cookies</Link>
              <span aria-hidden="true">·</span>
              <Link href="/termos" className="transition-colors hover:text-zinc-300">Termos</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
