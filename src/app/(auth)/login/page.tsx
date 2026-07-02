/**
 * src/app/(auth)/login/page.tsx
 *
 * Login Page — VFIT BROADCAST · dark theme · matches welcome/onboarding funnel
 *
 * Exports: LoginPage
 * Hooks: useState, useRef, useEffect, useCallback, useSearchParams, useLogin
 * Features: 'use client' · DSIcon
 */

// ============================================
// Login Page — dark, same visual system as /welcome and onboarding.
// Turnstile-robust: auto-retry, pending submit, hard refresh.
// ============================================

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { useLogin } from '@/hooks/use-auth'
import { GuestGuard, OAuthButtons, Turnstile, PasskeyLogin, BiometricLockScreen, type TurnstileRef } from '@/components/auth'
import { supportsPasskey, getPasskeyEmail, isBiometricAutoUnlockEnabled, isBiometricInCooldown } from '@/hooks/use-passkey'
import { APP_VERSION } from '../../../../lib/version'
import { ApiClientError } from '@/lib/api-client'

/* ─── CPF mask ─── */
function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  let m = digits
  if (digits.length > 3) m = digits.slice(0, 3) + '.' + digits.slice(3)
  if (digits.length > 6) m = m.slice(0, 7) + '.' + digits.slice(6)
  if (digits.length > 9) m = m.slice(0, 11) + '-' + digits.slice(9)
  return m
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const reset = searchParams.get('reset')
  const verified = searchParams.get('verified')
  const oauthError = searchParams.get('error')
  const biometricParam = searchParams.get('biometric')
  const redirectParam = searchParams.get('redirect')

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [show2FA, setShow2FA] = useState(false)
  const [showBiometricLock, setShowBiometricLock] = useState(false)
  const turnstileRef = useRef<TurnstileRef>(null)
  const twoFactorInputRef = useRef<HTMLInputElement>(null)
  const identifierRef = useRef<HTMLInputElement>(null)

  // Auto-trigger biometric lock screen on mount (with cooldown)
  useEffect(() => {
    const email = getPasskeyEmail()
    const autoUnlock = isBiometricAutoUnlockEnabled()
    const inCooldown = isBiometricInCooldown()
    if ((autoUnlock || biometricParam === 'auto') && email && supportsPasskey() && !inCooldown) {
      setShowBiometricLock(true)
    }
  }, [biometricParam])

  // Auto-focus identifier on mount
  useEffect(() => {
    setTimeout(() => identifierRef.current?.focus(), 300)
  }, [])

  // Auto-detect if user is typing CPF (digits) or email
  const rawDigits = identifier.replace(/\D/g, '')
  const looksLikeCpf = rawDigits.length > 0 && !/[@a-zA-Z]/.test(identifier)
  const displayValue = looksLikeCpf ? maskCpf(identifier) : identifier

  const isFormFilled = identifier.trim().length > 0 && password.length > 0

  // ─── Turnstile callbacks (best-effort, non-blocking) ───
  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('')
    // Try to get a fresh token silently
    setTimeout(() => turnstileRef.current?.reset(), 500)
  }, [])

  const login = useLogin({
    redirect: redirectParam || undefined,
    onError: (error) => {
      // Reset Turnstile for next attempt
      setTurnstileToken('')
      turnstileRef.current?.reset()

      const msg = error instanceof ApiClientError ? error.message : (error as Error)?.message || ''

      // 2FA flow
      if (msg.includes('2FA obrigatório') || msg.includes('2fa obrigat')) {
        setShow2FA(true)
        setTimeout(() => twoFactorInputRef.current?.focus(), 100)
      }
    },
  })

  // ─── Submit: send immediately with whatever token we have ───
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormFilled || login.isPending) return

    // Send raw value — backend auto-detects CPF vs email
    const identifierValue = looksLikeCpf ? rawDigits : identifier.trim()

    login.mutate({
      identifier: identifierValue,
      password,
      two_factor_code: twoFactorCode.trim() || undefined,
      turnstile_token: turnstileToken, // may be empty — backend handles gracefully
    })
  }

  function handleIdentifierChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    // If only digits/dots/dashes → keep raw for CPF masking
    // If has @ or letters → treat as email
    setIdentifier(val)
  }

  const alertMsg = registered
    ? '✓ Conta criada! Verifique seu email.'
    : reset
    ? '✓ Senha redefinida!'
    : verified
    ? '✓ Email verificado!'
    : null

  const errorMsg = oauthError === 'oauth_failed'
    ? 'Falha ao autenticar com login social. Tente novamente.'
    : oauthError === 'oauth_denied'
    ? 'Login social cancelado.'
    : oauthError === 'oauth_missing_params'
    ? 'Erro na autenticação social. Tente novamente.'
    : null

  return (
    <GuestGuard>
      {/* ─── Biometric Lock Screen Overlay ─── */}
      {showBiometricLock && (
        <BiometricLockScreen onDismiss={() => setShowBiometricLock(false)} />
      )}

      {/* Figma-style staggered entrance — each child slides up + fades in */}
      <div className="login-stagger">
        {/* ─── Alerts ─── */}
        {alertMsg && (
          <div role="status" aria-live="polite" className="mb-5 flex items-center gap-2.5 rounded-2xl border border-green-400/25 bg-green-400/10 px-4 py-3">
            <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-400" />
            <span className="text-[12px] font-semibold text-green-200">{alertMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div role="alert" className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/8 px-4 py-3">
            <div className="h-2 w-2 shrink-0 rounded-full bg-red-400" />
            <span className="text-[12px] font-semibold text-red-300">{errorMsg}</span>
          </div>
        )}

        {/* ─── Page heading ─── */}
        <div className="mb-5">
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-green-300/25"
            style={{ background: 'linear-gradient(180deg, rgba(74,222,128,0.22), rgba(34,197,94,0.08))', boxShadow: '0 10px 24px -8px rgba(34,197,94,0.45)' }}
          >
            <DSIcon name="fingerprint" size={22} className="text-green-200" />
          </div>
          <p className="bc-mono mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-green-300/80">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Acesse sua conta
          </p>
          <h1 className="font-syne text-[1.9rem] font-black leading-none text-white">
            Bem-vindo de volta
          </h1>
          <p className="mt-1.5 text-[12.5px] text-slate-400">
            Evolua com inteligência — login unificado
          </p>
        </div>

        {/* ─── Biometric (Passkey) ─── */}
        <PasskeyLogin />

        {/* ─── OAuth — Apple + Google ─── */}
        <div className="mt-2">
          <OAuthButtons compact />
        </div>

        {/* ─── Divider ─── */}
        <div className="relative my-2.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bc-mono rounded-full border border-white/10 bg-[#04080f] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
              OU COM CPF / EMAIL
            </span>
          </div>
        </div>

        {/* ─── Form ─── */}
        <form onSubmit={handleSubmit} className="login-stagger space-y-2.5">
          {/* Unified identifier field — CPF or Email auto-detected */}
          <div>
            <label className="bc-mono mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-green-300/70">
              <DSIcon name={looksLikeCpf ? 'fingerprint' : 'mail'} size={12} className="text-green-300/60 transition-all duration-200" />
              {looksLikeCpf ? 'CPF' : identifier.includes('@') ? 'EMAIL' : 'CPF OU EMAIL'}
            </label>
            <input
              ref={identifierRef}
              type={looksLikeCpf ? 'text' : 'email'}
              inputMode={looksLikeCpf ? 'numeric' : 'email'}
              name="username"
              placeholder="000.000.000-00 ou email"
              value={displayValue}
              onChange={handleIdentifierChange}
              autoComplete="username"
              required
              className="vfit-flow-field h-12 w-full rounded-2xl px-4 text-[14px] transition-all duration-200 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="bc-mono mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-green-300/70">
              <DSIcon name="lock" size={12} className="text-green-300/60" /> SENHA
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="vfit-flow-field h-12 w-full rounded-2xl px-4 pr-12 text-[14px] transition-all duration-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/50"
              >
                {showPassword ? <DSIcon name="eyeOff" size={16} /> : <DSIcon name="eye" size={16} />}
              </button>
            </div>
          </div>

          {/* ─── 2FA — conditional ─── */}
          {show2FA && (
            <div className="animate-blur-in space-y-2">
              <div className="flex items-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/8 px-3.5 py-2.5">
                <DSIcon name="shieldCheck" size={14} className="shrink-0 text-amber-300" />
                <p className="text-[11px] text-amber-200">Conta com 2FA — informe o código do autenticador.</p>
              </div>
              <div>
                <label className="bc-mono mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300/80">
                  <DSIcon name="shieldCheck" size={12} className="text-amber-300/60" /> CÓDIGO 2FA
                </label>
                <input
                  ref={twoFactorInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-12 w-full rounded-2xl border border-amber-400/30 bg-amber-400/5 px-4 text-center text-[15px] tracking-[0.35em] text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-200 placeholder:text-amber-300/30 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
              </div>
            </div>
          )}

          {/* Turnstile — invisible-first; if it falls back to interactive, keep it in the form flow */}
          <Turnstile
            ref={turnstileRef}
            onVerify={handleTurnstileVerify}
            onExpire={handleTurnstileExpire}
          />

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="group flex cursor-pointer items-center gap-2.5">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-4.5 w-4.5 rounded-md border border-white/20 bg-white/5 transition-all duration-200 peer-checked:border-green-400 peer-checked:bg-green-400 flex items-center justify-center">
                  {remember && (
                    <svg className="h-2.5 w-2.5 text-[#06210f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5} aria-hidden="true" focusable="false">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="select-none text-[12px] text-slate-400 transition-colors group-hover:text-slate-200">
                Lembrar de mim
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-bold text-green-300 transition-colors hover:text-green-200"
            >
              Esqueceu a senha?
            </Link>
          </div>

          {/* ─── Submit — BROADCAST pill CTA ─── */}
          <button
            type="submit"
            disabled={!isFormFilled || login.isPending}
            className="bc-login-cta group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full text-[#06210f] outline-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04080f] disabled:pointer-events-none disabled:opacity-35 disabled:saturate-[0.4]"
            style={{ background: 'linear-gradient(135deg,#4ade80 0%,#22c55e 50%,#16a34a 100%)' }}
          >
            {isFormFilled && !login.isPending && <span aria-hidden className="bc-login-sweep" />}
            {login.isPending ? (
              <span aria-hidden className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-[#06210f]/30 border-t-[#06210f]" />
            ) : null}
            <span className="font-syne relative z-10 text-[15px] font-black uppercase tracking-tight">
              {login.isPending ? 'Entrando…' : 'Entrar'}
            </span>
            {!login.isPending && <DSIcon name="arrowRight" size={16} className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5" />}
          </button>

          {/* ─── Login Error ─── */}
          {login.isError && !((login.error as Error)?.message || '').includes('2FA obrigat') && (
            <div role="alert" className="flex items-center gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/8 px-4 py-3">
              <div className="h-2 w-2 shrink-0 rounded-full bg-red-400" />
              <p className="text-[12px] font-medium text-red-300">
                {(login.error as Error)?.message || 'CPF/email ou senha incorretos'}
              </p>
            </div>
          )}
        </form>

        {/* ─── Register link + Trust badges — sales-focused, no guest bypass ─── */}
        <div className="mt-3 rounded-2xl border border-green-400/20 bg-green-400/6 px-4 py-2.5 text-center">
          <p className="text-[13px] text-slate-300">
            Novo por aqui?{' '}
            <Link href="/register" className="font-black text-green-300 transition-colors hover:text-green-200">
              Teste 30 dias grátis
            </Link>
          </p>
          <span className="bc-mono mt-1.5 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">
            <DSIcon name="shield" size={12} /> SSL · LGPD · 30 DIAS GRÁTIS SEM CARTÃO
          </span>
        </div>

        {/* Version — hidden on mobile to keep no-scroll composition */}
        <p className="bc-mono mt-2 hidden select-none text-center text-[9px] font-bold uppercase tracking-[0.12em] text-white/25 sm:block">
          v{APP_VERSION}
        </p>
      </div>

      <style>{`
        .bc-login-cta { box-shadow: 0 16px 40px -14px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.45); }
        .bc-login-sweep { position: absolute; inset: 0; z-index: 5; pointer-events: none; background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%); transform: translateX(-130%) skewX(-18deg); animation: bcLoginSweep 3.6s ease-in-out 1.2s infinite; }
        .bc-login-cta:hover .bc-login-sweep { animation-duration: 1.1s; }
        @keyframes bcLoginSweep { 0% { transform: translateX(-130%) skewX(-18deg); } 60%,100% { transform: translateX(260%) skewX(-18deg); } }
        @media (prefers-reduced-motion: reduce) { .bc-login-sweep { animation: none !important; } }
      `}</style>
    </GuestGuard>
  )
}
