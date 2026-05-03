/**
 * src/app/(auth)/login/page.tsx
 *
 * Login Page — Ultra-Modern · 3D Buttons · CPF/Email
 *
 * Exports: LoginPage
 * Hooks: useState, useRef, useEffect, useCallback, useSearchParams, useLogin
 * Features: 'use client' · DSIcon
 */

// ============================================
// Login Page — Ultra-Modern · 3D Buttons · CPF/Email
// Koyeb-inspired clean design, dark theme
// Turnstile-robust: auto-retry, pending submit, hard refresh
// ============================================

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useLogin } from '@/hooks/use-auth'
import { GuestGuard, OAuthButtons, Turnstile, PasskeyLogin, BiometricLockScreen, type TurnstileRef } from '@/components/auth'
import { supportsPasskey, getPasskeyEmail, isBiometricAutoUnlockEnabled, isBiometricInCooldown } from '@/hooks/use-passkey'
import { APP_VERSION } from '../../../../lib/version'
import { ApiClientError } from '@/lib/api-client'

/* ─── Design tokens (mesmos do Hero / landing) ─── */
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.03em',
}
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

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

      <div className="animate-blur-in">
        {/* ─── Alerts ─── */}
        {alertMsg && (
          <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-brand-primary/20 bg-brand-primary/6 px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse shrink-0" />
            <span className="text-[12px] font-semibold text-brand-primary">{alertMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/6 px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
            <span className="text-[12px] font-semibold text-red-400">{errorMsg}</span>
          </div>
        )}

        {/* ─── Page heading ─── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DSIcon name="sparkles" size={14} className="text-brand-primary/60" />
            <p className="text-[9px] uppercase text-brand-primary/70" style={monoLabel}>
              ACESSE SUA CONTA
            </p>
          </div>
          <h1
            className="text-[1.75rem] text-white leading-none"
            style={headingFont}
          >
            Entrar
          </h1>
          <p className="mt-1 text-[12px] text-slate-400">
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
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/6" />
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-4 py-1.5 text-[9px] uppercase text-zinc-500 rounded-full border border-zinc-700/50 bg-[#0F1729] backdrop-blur-sm shadow-lg"
              style={monoLabel}
            >
              OU COM CPF / EMAIL
            </span>
          </div>
        </div>

        {/* ─── Form ─── */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Unified identifier field — CPF or Email auto-detected */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
              <DSIcon name={looksLikeCpf ? 'fingerprint' : 'mail'} size={12} className="text-zinc-500 transition-all duration-200" />
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
              className="w-full h-11 rounded-xl border border-sky-400/20 bg-slate-950/70 px-4 text-[14px] text-white placeholder:text-slate-500 shadow-[0_1px_3px_rgba(0,0,0,0.28),inset_0_1px_2px_rgba(255,255,255,0.03)] transition-all duration-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/25"
            />
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
              <DSIcon name="lock" size={12} className="text-zinc-500" /> SENHA
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full h-11 rounded-xl border border-sky-400/20 bg-slate-950/70 px-4 pr-12 text-[14px] text-white placeholder:text-slate-500 shadow-[0_1px_3px_rgba(0,0,0,0.28),inset_0_1px_2px_rgba(255,255,255,0.03)] transition-all duration-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-sky-200 transition-colors rounded-lg hover:bg-white/6"
                tabIndex={-1}
              >
                {showPassword ? <DSIcon name="eyeOff" size={16} /> : <DSIcon name="eye" size={16} />}
              </button>
            </div>
          </div>

          {/* ─── 2FA — conditional ─── */}
          {show2FA && (
            <div className="animate-blur-in space-y-2">
              <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/4 px-3.5 py-2.5">
                <DSIcon name="shieldCheck" size={14} className="text-amber-400 shrink-0" />
                <p className="text-[11px] text-amber-400/90">Conta com 2FA — informe o código do autenticador.</p>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-500 mb-2" style={monoLabel}>
                  <DSIcon name="shieldCheck" size={12} className="text-zinc-600" /> CÓDIGO 2FA
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
                  className="w-full h-12 rounded-xl border border-amber-300/30 bg-amber-950/20 px-4 text-[15px] text-white placeholder:text-amber-300/45 tracking-[0.35em] text-center shadow-[0_1px_3px_rgba(0,0,0,0.24)] transition-all duration-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
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
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-4.5 w-4.5 rounded-md border border-zinc-600 bg-zinc-800 peer-checked:bg-brand-primary peer-checked:border-brand-primary transition-all duration-200 flex items-center justify-center">
                  {remember && (
                    <svg className="h-2.5 w-2.5 text-bg-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[12px] text-zinc-500 group-hover:text-zinc-300 select-none transition-colors">
                Lembrar de mim
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-semibold text-brand-primary/70 hover:text-brand-primary transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>

          {/* ─── Submit — 3D CTA button ─── */}
          <Button
            type="submit"
            size="lg"
            disabled={!isFormFilled}
            loading={login.isPending}
            className="auth-submit-cta w-full uppercase tracking-wider font-black"
          >
            ENTRAR
            <DSIcon name="arrowRight" size={16} />
          </Button>

          {/* ─── Login Error ─── */}
          {login.isError && !((login.error as Error)?.message || '').includes('2FA obrigat') && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/6 px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
              <p className="text-[12px] font-medium text-red-400">
                {(login.error as Error)?.message || 'CPF/email ou senha incorretos'}
              </p>
            </div>
          )}
        </form>

        {/* ─── Register link + Trust badges — sales-focused, no guest bypass ─── */}
        <div className="mt-4 rounded-2xl border border-sky-400/15 bg-sky-400/5 px-4 py-3 text-center">
          <p className="text-[13px] text-slate-400">
            Novo por aqui?{' '}
            <Link href="/register" className="font-black text-brand-primary hover:text-brand-primary/80 transition-colors">
              Comece grátis agora
            </Link>
          </p>
          <span className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-slate-600" style={monoLabel}>
            <DSIcon name="shield" size={12} /> SSL · LGPD · SEM CARTÃO NO CADASTRO
          </span>
        </div>

        {/* Version */}
        <p className="mt-3 text-center text-[9px] text-zinc-800 select-none" style={monoLabel}>
          v{APP_VERSION}
        </p>
      </div>
    </GuestGuard>
  )
}
