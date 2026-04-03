/**
 * src/components/auth/passkey-prompt.tsx
 *
 * Passkey Prompt — Ultra-modern glassmorphism modal
 *
 * Exports: PasskeyPrompt
 * Hooks: useState, useEffect, useAuthStore, usePasskeys, useRegisterPasskey, useScrollLock
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Passkey Prompt — Ultra-modern glassmorphism modal
// Shown after login to offer biometric registration
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { DSIcon } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'
import {
  supportsPasskey,
  hasPasskeyRegistered,
  isPasskeyDismissed,
  dismissPasskeyPrompt,
  usePasskeys,
  useRegisterPasskey,
} from '@/hooks/use-passkey'
import { useScrollLock } from '@/hooks/use-scroll-lock'

export function PasskeyPrompt() {
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)
  const registerPasskey = useRegisterPasskey()

  useScrollLock(show)
  const { data: passkeys, isLoading: isLoadingPasskeys } = usePasskeys()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || !user) return

    const timer = setTimeout(() => {
      if (isLoadingPasskeys) {
        setShow(false)
        return
      }

      const serverHasPasskeys = (passkeys?.length ?? 0) > 0

      if (serverHasPasskeys) {
        if (!hasPasskeyRegistered(user.id)) {
          localStorage.setItem(`passkey_registered_${user.id}`, 'true')
        }
        if (user.email) {
          localStorage.setItem('passkey_email', user.email)
        }
        setShow(false)
        return
      }

      const shouldShow =
        supportsPasskey() &&
        !hasPasskeyRegistered(user.id) &&
        !isPasskeyDismissed(user.id)

      setShow(shouldShow)
    }, 2000)

    return () => clearTimeout(timer)
  }, [isHydrated, user, passkeys, isLoadingPasskeys])

  if (!show || !user || !mounted) return null

  function handleDismiss() {
    if (user) dismissPasskeyPrompt(user.id)
    setShow(false)
  }

  async function handleRegister() {
    try {
      await registerPasskey.mutateAsync(getDeviceName())
      setShow(false)
    } catch {
      // Error handled in hook
    }
  }

  const modal = (
    <div
      className="fixed inset-0 z-99999 isolate"
      role="dialog"
      aria-modal="true"
      aria-label="Ativar login biométrico"
    >
      {/* Backdrop with animated gradient */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={handleDismiss}
      />

      {/* Floating particles effect (decorative) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-brand-primary/8 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/3 h-48 w-48 animate-pulse rounded-full bg-emerald-500/6 blur-3xl delay-700" />
      </div>

      {/* Modal — centered on full screen */}
      <div className="relative flex min-h-dvh items-center justify-center p-4">
        <div
          className="w-full max-w-sm animate-in zoom-in-90 fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* Glass card */}
          <div
            className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]"
            style={{
              background: 'linear-gradient(135deg, rgba(11,18,33,0.85) 0%, rgba(5,10,18,0.92) 100%)',
              backdropFilter: 'blur(40px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
            }}
          >
            {/* Top shimmer line */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/40 to-transparent" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-text-muted backdrop-blur-sm transition-all hover:bg-white/10 hover:text-text-primary hover:scale-110 active:scale-95"
            >
              <DSIcon name="close" size={16} />
            </button>

            {/* Content */}
            <div className="p-6 pt-8">
              {/* Animated icon */}
              <div className="mx-auto mb-5 relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 mx-auto h-20 w-20 animate-ping rounded-full bg-brand-primary/15 duration-2000" style={{ animationDuration: '3s' }} />
                {/* Icon container */}
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-brand-primary/20 to-emerald-500/10 ring-2 ring-brand-primary/20">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-brand-primary to-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <DSIcon name="fingerprint" size={28} className="text-white drop-shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Title with sparkle */}
              <div className="text-center">
                <div className="mb-1.5 flex items-center justify-center gap-1.5">
                  <DSIcon name="sparkles" size={14} className="text-brand-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                    Recomendado
                  </span>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight text-text-primary">
                  Login com biometria
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Use Face ID, impressão digital ou Windows Hello para entrar
                  instantaneamente.
                </p>
              </div>

              {/* Benefits — glass pills */}
              <div className="mt-5 space-y-2.5">
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/3 px-4 py-3 transition-colors hover:bg-white/5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
                    <DSIcon name="flame" size={16} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">1 segundo</p>
                    <p className="text-[11px] text-text-muted">Login sem digitar senha</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/3 px-4 py-3 transition-colors hover:bg-white/5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                    <DSIcon name="shield" size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Ultra seguro</p>
                    <p className="text-[11px] text-text-muted">Biometria nunca sai do dispositivo</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2.5">
                <button
                  onClick={handleRegister}
                  disabled={registerPasskey.isPending}
                  className="group relative w-full overflow-hidden rounded-2xl bg-linear-to-r from-brand-primary to-emerald-400 p-px font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.98] disabled:opacity-60"
                >
                  <span className="flex w-full items-center justify-center gap-2 rounded-[15px] bg-linear-to-r from-brand-primary to-emerald-400 px-6 py-3 text-sm font-bold text-white">
                    {registerPasskey.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <DSIcon name="fingerprint" size={16} />
                        Ativar agora
                      </>
                    )}
                  </span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-full rounded-2xl py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                >
                  Agora não
                </button>
              </div>
            </div>

            {/* Bottom shimmer line */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

/** Get a user-friendly device name */
function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Dispositivo'
  const ua = navigator.userAgent
  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/iPad/i.test(ua)) return 'iPad'
  if (/Mac/i.test(ua)) return 'Mac'
  if (/Android/i.test(ua)) return 'Android'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Dispositivo'
}
