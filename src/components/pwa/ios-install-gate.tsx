/**
 * src/components/pwa/ios-install-gate.tsx
 *
 * iOS Install Gate v2 — Aggressive + Smart
 *
 * Exports: IOSInstallGate
 * Hooks: useState, useEffect, useCallback
 * Features: 'use client' · DSIcon
 */

// ============================================
// iOS Install Gate v2 — Aggressive + Smart
//
// Escalating aggressiveness:
// - Visit 1-2: Full-screen gate, NO skip button
// - Visit 3:   Full-screen gate, skip available
// - Visit 4+:  Persistent mini-banner (dismiss 4h)
//
// Smart detection:
// - If standalone detected → marks "installed" forever → never shows again
// - "Já instalei!" → marks installed forever
// - Tracks visit count in localStorage
// ============================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'

// ─── Constants ────────────────────────────────────────────────────────

const STORAGE = {
  INSTALLED: 'ios-pwa-installed',
  VISIT_COUNT: 'ios-gate-visit-count',
  DISMISS_TS: 'ios-gate-dismissed-ts',
  BANNER_DISMISS_TS: 'ios-banner-dismissed-ts',
} as const

const FULL_GATE_DISMISS_HOURS = 2
const BANNER_DISMISS_HOURS = 4
const MAX_FULL_GATE_VISITS = 3

// ─── Detection helpers ────────────────────────────────────────────────

// iOS Safari exposes `navigator.standalone` (non-standard)
interface SafariNavigator extends Navigator {
  readonly standalone?: boolean
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()
  return (
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as SafariNavigator).standalone === true
  )
}

// ─── Storage helpers ──────────────────────────────────────────────────

function isMarkedInstalled(): boolean {
  try { return localStorage.getItem(STORAGE.INSTALLED) === 'true' } catch { return false }
}

function markAsInstalled() {
  try { localStorage.setItem(STORAGE.INSTALLED, 'true') } catch {}
}

function getVisitCount(): number {
  try { return parseInt(localStorage.getItem(STORAGE.VISIT_COUNT) || '0', 10) } catch { return 0 }
}

function incrementVisitCount(): number {
  const next = getVisitCount() + 1
  try { localStorage.setItem(STORAGE.VISIT_COUNT, String(next)) } catch {}
  return next
}

function wasGateDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(STORAGE.DISMISS_TS)
    if (!ts) return false
    return Date.now() - parseInt(ts, 10) < FULL_GATE_DISMISS_HOURS * 3600000
  } catch { return false }
}

function wasBannerDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(STORAGE.BANNER_DISMISS_TS)
    if (!ts) return false
    return Date.now() - parseInt(ts, 10) < BANNER_DISMISS_HOURS * 3600000
  } catch { return false }
}

function markGateDismissed() {
  try { localStorage.setItem(STORAGE.DISMISS_TS, String(Date.now())) } catch {}
}

function markBannerDismissed() {
  try { localStorage.setItem(STORAGE.BANNER_DISMISS_TS, String(Date.now())) } catch {}
}

// ─── Types ────────────────────────────────────────────────────────────

type GateMode = 'none' | 'full-screen' | 'banner'

// ─── Main Component ───────────────────────────────────────────────────

export function IOSInstallGate() {
  const [mode, setMode] = useState<GateMode>('none')
  const [visitCount, setVisitCount] = useState(0)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isIOS() || isStandalone()) {
      if (isIOS() && isStandalone()) markAsInstalled()
      return
    }

    if (isMarkedInstalled()) return

    const count = getVisitCount()
    setVisitCount(count)

    const timer = setTimeout(() => {
      if (count < MAX_FULL_GATE_VISITS) {
        if (!wasGateDismissedRecently()) {
          incrementVisitCount()
          setVisitCount(count + 1)
          setMode('full-screen')
        } else if (!wasBannerDismissedRecently()) {
          setMode('banner')
        }
      } else {
        if (!wasBannerDismissedRecently()) {
          setMode('banner')
        }
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        markAsInstalled()
        setMode('none')
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const handleDismissGate = useCallback(() => {
    markGateDismissed()
    setMode('none')
    setTimeout(() => {
      if (!isMarkedInstalled() && !wasBannerDismissedRecently()) {
        setMode('banner')
      }
    }, 30000)
  }, [])

  const handleDismissBanner = useCallback(() => {
    markBannerDismissed()
    setMode('none')
  }, [])

  const handleMarkedInstalled = useCallback(() => {
    markAsInstalled()
    setMode('none')
  }, [])

  if (mode === 'none') return null

  if (mode === 'banner') {
    return (
      <IOSMiniInstallBanner
        onDismiss={handleDismissBanner}
        onInstalled={handleMarkedInstalled}
        onShowFull={() => setMode('full-screen')}
      />
    )
  }

  const canSkip = visitCount >= 3

  return (
    <IOSFullGate
      step={step}
      setStep={setStep}
      canSkip={canSkip}
      visitCount={visitCount}
      onDismiss={handleDismissGate}
      onInstalled={handleMarkedInstalled}
    />
  )
}

// ─── Full-Screen Gate ─────────────────────────────────────────────────

function IOSFullGate({
  step,
  setStep,
  canSkip,
  visitCount,
  onDismiss,
  onInstalled,
}: {
  step: number
  setStep: (s: number) => void
  canSkip: boolean
  visitCount: number
  onDismiss: () => void
  onInstalled: () => void
}) {
  useEffect(() => {
    if (!canSkip) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onDismiss()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canSkip, onDismiss])

  return (
    <div className="fixed inset-0 z-9999 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-bg-dark" />

      <div
        className="relative z-10 flex min-h-dvh flex-col items-center justify-center overflow-y-auto px-6"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        {canSkip && (
          <button
            onClick={onDismiss}
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:text-white hover:bg-white/10"
          >
            <DSIcon name="x" size={14} />
            Pular
          </button>
        )}

        {step === 0 ? (
          <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* App Icon */}
            <div className="relative mb-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-linear-to-br from-brand-primary to-emerald-600 shadow-2xl shadow-brand-primary/30">
                <span className="text-2xl font-black text-bg-dark tracking-tight">IA</span>
              </div>
              <div className="absolute -inset-3 rounded-[36px] border border-brand-primary/20 animate-pulse" />
              <div className="absolute -inset-6 rounded-[44px] border border-brand-primary/10" />
            </div>

            {/* Title — escalating urgency */}
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {visitCount <= 1 ? 'Instale o VFIT' : 'Instale para continuar'}
            </h1>
            <p className="mt-2 max-w-70 text-sm text-zinc-400 leading-relaxed">
              {visitCount <= 1
                ? 'Adicione à tela inicial para ter a experiência completa do app'
                : 'O app funciona melhor instalado — tela cheia, biometria e offline'}
            </p>

            {/* Benefits */}
            <div className="mt-8 w-full max-w-75 space-y-3">
              {[
                { icon: <DSIcon name="sparkles" size={20} />, text: 'Tela cheia, sem barra do Safari' },
                { icon: <DSIcon name="fingerprint" size={20} />, text: 'Login instantâneo com biometria' },
                { icon: <DSIcon name="wifi" size={20} />, text: 'Funciona offline' },
                { icon: <DSIcon name="smartphone" size={20} />, text: 'Ícone na tela como app nativo' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-white/4 border border-white/6 px-4 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-[13px] text-zinc-300">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setStep(1)}
              className="mt-8 w-full max-w-75 flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-brand-primary to-emerald-500 py-4 text-[15px] font-bold text-bg-dark transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,217,142,0.4)] active:scale-[0.98]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Instalar agora — 10 segundos
            </button>

            {canSkip && (
              <button
                onClick={onDismiss}
                className="mt-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Continuar no navegador
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-400">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Siga os 3 passos
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Leva menos de 10 segundos</p>

            <div className="mt-8 w-full max-w-80 space-y-4">
              {/* Step 1 */}
              <div className="relative flex items-start gap-4 rounded-2xl bg-white/4 border border-white/6 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-bg-dark">1</span>
                    <h3 className="text-[14px] font-semibold text-white">Toque em Compartilhar</h3>
                  </div>
                  <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed">
                    Toque no ícone <span className="inline-flex items-center mx-0.5 text-blue-400 font-medium">□↑</span> na barra inferior do Safari
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <svg className="h-5 w-5 text-zinc-700 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-4 rounded-2xl bg-white/4 border border-white/6 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary shrink-0">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-bg-dark">2</span>
                    <h3 className="text-[14px] font-semibold text-white">Adicionar à Tela Inicial</h3>
                  </div>
                  <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed">
                    Role a lista e toque em <span className="font-medium text-white">&quot;Adicionar à Tela de Início&quot;</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <svg className="h-5 w-5 text-zinc-700 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ animationDelay: '200ms' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-4 rounded-2xl bg-white/4 border border-white/6 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-bg-dark">3</span>
                    <h3 className="text-[14px] font-semibold text-white">Confirmar</h3>
                  </div>
                  <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed">
                    Toque em <span className="font-medium text-white">&quot;Adicionar&quot;</span> no canto superior direito
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-zinc-600">
              <svg className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="text-[11px]">O ícone □↑ fica na barra inferior do Safari</span>
            </div>

            <div className="mt-6 flex gap-3 w-full max-w-80">
              <button
                onClick={() => setStep(0)}
                className="flex-1 rounded-xl bg-white/6 border border-white/8 py-3 text-[13px] font-medium text-zinc-400 transition-all hover:bg-white/10"
              >
                Voltar
              </button>
              <button
                onClick={onInstalled}
                className="flex-1 rounded-xl bg-brand-primary/10 border border-brand-primary/20 py-3 text-[13px] font-medium text-brand-primary transition-all hover:bg-brand-primary/20"
              >
                Já instalei!
              </button>
            </div>

            {canSkip && (
              <button
                onClick={onDismiss}
                className="mt-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Continuar no navegador
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Mini Install Banner ──────────────────────────────────────────────

function IOSMiniInstallBanner({
  onDismiss,
  onInstalled,
  onShowFull,
}: {
  onDismiss: () => void
  onInstalled: () => void
  onShowFull: () => void
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-9998 animate-in slide-in-from-bottom duration-500"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-3 mb-3 overflow-hidden rounded-2xl">
        <div className="relative bg-bg-dark/80 backdrop-blur-xl border border-white/8">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent" />

          <div className="p-3.5">
            <div className="flex items-center gap-3">
              {/* App icon */}
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-linear-to-br from-brand-primary to-emerald-600 shadow-lg shadow-brand-primary/20 shrink-0">
                <span className="text-sm font-black text-bg-dark">IA</span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-bold text-white">Instale o VFIT</h3>
                <p className="text-[11px] text-zinc-400 truncate">Tela cheia · Biometria · Offline</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={onInstalled}
                  className="px-2 py-1 rounded-lg text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Já tenho instalado"
                >
                  Já tenho
                </button>
                <button
                  onClick={onShowFull}
                  className="flex items-center gap-1 rounded-xl bg-brand-primary px-3.5 py-2 text-[12px] font-bold text-bg-dark transition-all active:scale-95"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Instalar
                </button>
                <button
                  onClick={onDismiss}
                  className="p-1.5 rounded-lg text-zinc-600 hover:text-white transition-colors"
                  aria-label="Fechar"
                >
                  <DSIcon name="close" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
