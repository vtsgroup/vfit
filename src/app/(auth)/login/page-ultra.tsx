/**
 * src/app/(auth)/login/page-ultra.tsx
 *
 * Ultra-Modern Login Page — Glassmorphism Edition
 *
 * Features:
 * - Animated logo SVG at top
 * - Glassmorphism design system
 * - Smooth animations (blur-in, slide-up)
 * - Dark-first, accessibility-focused
 * - CPF/Email auto-detection
 * - 2FA support
 * - Biometric unlock (Passkey)
 * - OAuth (Apple + Google)
 * - Turnstile CAPTCHA
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { ButtonUltra } from '@/components/ui/button-ultra'
import { useLogin } from '@/hooks/use-auth'
import { GuestGuard, OAuthButtons, Turnstile, PasskeyLogin, BiometricLockScreen, type TurnstileRef } from '@/components/auth'
import { supportsPasskey, getPasskeyEmail, isBiometricAutoUnlockEnabled, isBiometricInCooldown } from '@/hooks/use-passkey'
import { APP_VERSION } from '../../../../lib/version'
import { ApiClientError } from '@/lib/api-client'

/* ─── Design tokens ─── */
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.02em',
}

const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.05em',
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

export default function LoginPageUltra() {
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

  /* ─── Biometric lock screen on mount ─── */
  useEffect(() => {
    const email = getPasskeyEmail()
    const autoUnlock = isBiometricAutoUnlockEnabled()
    const inCooldown = isBiometricInCooldown()
    if ((autoUnlock || biometricParam === 'auto') && email && supportsPasskey() && !inCooldown) {
      setShowBiometricLock(true)
    }
  }, [biometricParam])

  useEffect(() => {
    setTimeout(() => identifierRef.current?.focus(), 300)
  }, [])

  const rawDigits = identifier.replace(/\D/g, '')
  const looksLikeCpf = rawDigits.length > 0 && !/[@a-zA-Z]/.test(identifier)
  const displayValue = looksLikeCpf ? maskCpf(identifier) : identifier
  const isFormFilled = identifier.trim().length > 0 && password.length > 0

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('')
    setTimeout(() => turnstileRef.current?.reset(), 500)
  }, [])

  const login = useLogin({
    redirect: redirectParam || undefined,
    onError: (error) => {
      setTurnstileToken('')
      turnstileRef.current?.reset()
      const msg = error instanceof ApiClientError ? error.message : (error as Error)?.message || ''
      if (msg.includes('2FA obrigatório') || msg.includes('2fa obrigat')) {
        setShow2FA(true)
        setTimeout(() => twoFactorInputRef.current?.focus(), 100)
      }
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormFilled || login.isPending) return

    const identifierValue = looksLikeCpf ? rawDigits : identifier.trim()

    login.mutate({
      identifier: identifierValue,
      password,
      two_factor_code: twoFactorCode.trim() || undefined,
      turnstile_token: turnstileToken,
    })
  }

  function handleIdentifierChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIdentifier(e.target.value)
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
      {showBiometricLock && (
        <BiometricLockScreen onDismiss={() => setShowBiometricLock(false)} />
      )}

      {/* ─── Full-viewport dark gradient background ─── */}
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8"
        style={{
          backgroundImage: `
            radial-gradient(circle at 60% 40%, rgba(58, 181, 74, 0.06) 0%, transparent 50%),
            linear-gradient(to bottom right, #0a0e14, #121820)
          `,
        }}
      >
        {/* Animated backdrop blur */}
        <div className="absolute inset-0 backdrop-blur-sm pointer-events-none" />

        {/* Content wrapper */}
        <div
          className="relative w-full max-w-sm animate-blur-in"
          style={{
            animation: 'blurIn 400ms ease-out',
          }}
        >
          {/* ─── Logo + Header ─── */}
          <div className="mb-8 text-center" style={{ animation: 'slideUp 400ms ease-out' }}>
            {/* Logo SVG */}
            <div
              className="w-16 h-16 mx-auto mb-6"
              style={{
                animation: 'logoScale 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <svg
                version="1.1"
                viewBox="0 0 1024 1024"
                className="w-full h-full drop-shadow-lg"
                style={{
                  filter: 'drop-shadow(0 8px 24px rgba(58, 181, 74, 0.25))',
                }}
              >
                <defs>
                  <clipPath id="roundedClip">
                    <rect x="0" y="0" width="1024" height="1024" rx="220" ry="220" />
                  </clipPath>
                </defs>
                <g clipPath="url(#roundedClip)">
                  <rect x="0" y="0" width="1024" height="1024" fill="#3AB54A" />
                  <path fill="#08122B" opacity="1" stroke="none" d="M415.889740,248.989182 C444.136658,251.162689 462.226135,266.718750 473.780396,290.935883 C478.271240,300.348389 480.280060,310.441864 480.046539,320.978149 C479.836151,330.471497 479.935852,339.973877 480.024475,349.471069 C480.117126,359.400116 485.657867,364.938446 495.536621,364.979858 C510.033356,365.040619 524.530701,365.043030 539.027405,364.980530 C549.567200,364.935120 554.928345,359.494904 554.984741,348.860413 C555.039551,338.529510 555.419006,328.177460 554.914124,317.871033 C553.706970,293.228333 574.263855,258.341980 609.192749,250.898941 C613.690857,249.940445 618.413879,249.688309 623.031677,249.696640 C660.177246,249.763702 697.329224,249.611679 734.465027,250.295380 C751.876587,250.615967 769.342102,250.619171 786.619507,254.478531 C815.045715,260.828217 840.351074,286.761261 844.962158,315.533630 C845.508362,318.941742 846.524292,322.320129 846.668030,325.739807 C847.581482,347.470551 839.342529,366.306244 827.454590,383.757996 C805.924194,415.364990 784.163391,446.815247 762.442810,478.292297 C747.624512,499.766724 732.701965,521.169189 717.841797,542.614685 C689.229187,583.907104 660.739197,625.285095 631.982239,666.476624 C613.052307,693.591980 594.302063,720.863403 574.415283,747.269592 C560.512939,765.729492 541.158936,775.888733 517.763977,777.783997 C488.599457,780.146545 465.336060,768.807800 447.714935,746.333801 C434.496277,729.474792 422.524414,711.621826 410.317200,693.989990 C388.729797,662.809753 367.355621,631.481628 345.950073,600.175842 C330.921814,578.196838 316.052917,556.108704 301.000092,534.146606 C276.734528,498.742981 252.245895,463.491516 228.109467,428.000336 C215.301392,409.166809 202.881439,390.063232 190.594421,370.884125 C184.813751,361.860901 181.302887,351.821686 179.794647,341.141754 C179.268707,337.417450 178.047607,333.708038 178.082199,330.000580 C178.509399,284.198364 211.334473,252.452209 253.152405,249.651260 C276.025604,248.119232 299.031708,248.249298 321.978638,248.219376 C353.120789,248.178772 384.263611,248.702927 415.889740,248.989182 z" />
                  <path fill="#36AB43" opacity="0.9" stroke="none" d="M370.515564,426.502441 C387.045929,412.658386 405.914490,404.116943 426.066864,398.232544 C477.557526,383.197540 529.740784,381.604492 582.348755,390.947479 C608.449829,395.582977 633.426025,403.597351 655.868530,418.211456 C674.747253,430.504913 686.869812,446.697479 685.879578,470.490814 C685.533691,478.803284 686.046448,487.165375 685.393616,495.443787 C685.164490,498.349731 683.232300,502.501678 680.959900,503.475189 C678.718262,504.435516 674.160706,503.018066 672.161072,501.065033 C637.042786,466.765015 592.293030,458.276611 546.127869,454.272125 C509.885620,451.128418 473.914978,453.882446 438.593445,463.113312 C417.189056,468.707123 396.675995,476.436615 378.672180,489.645966 C373.730591,493.271667 369.626678,498.040405 364.679199,501.656372 C362.108490,503.535156 357.766052,505.721252 355.615570,504.734802 C353.070312,503.567322 350.688141,499.180664 350.567810,496.098328 C350.107483,484.305664 350.033112,472.438141 350.851746,460.670746 C351.838806,446.482239 360.853149,436.384308 370.515564,426.502441 z" />
                </g>
              </svg>
            </div>

            {/* Heading */}
            <h1
              className="text-3xl font-black text-white mb-2"
              style={headingFont}
            >
              Bem-vindo de volta
            </h1>
            <p className="text-slate-400 text-sm">
              Acesse sua conta para continuar sua jornada
            </p>
          </div>

          {/* ─── Alerts ─── */}
          {(alertMsg || errorMsg) && (
            <div
              className={`mb-6 p-3 rounded-xl border backdrop-blur-sm flex items-center gap-3 ${
                alertMsg
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
              style={{ animation: 'slideUp 300ms ease-out' }}
            >
              <div className={`h-2 w-2 rounded-full shrink-0 ${alertMsg ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-sm ${alertMsg ? 'text-green-400' : 'text-red-400'}`}>
                {alertMsg || errorMsg}
              </span>
            </div>
          )}

          {/* ─── Passkey + OAuth ─── */}
          <div className="space-y-3 mb-6" style={{ animation: 'slideUp 350ms ease-out' }}>
            <PasskeyLogin />
            <OAuthButtons compact />
          </div>

          {/* ─── Divider ─── */}
          <div className="relative my-6" style={{ animation: 'slideUp 400ms ease-out' }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1 text-xs uppercase text-slate-500 backdrop-blur-sm"
                style={monoLabel}
              >
                ou com CPF / Email
              </span>
            </div>
          </div>

          {/* ─── Form ─── */}
          <form onSubmit={handleSubmit} className="space-y-4" style={{ animation: 'slideUp 450ms ease-out' }}>
            {/* Identifier */}
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-2" style={monoLabel}>
                <DSIcon name={looksLikeCpf ? 'fingerprint' : 'mail'} size={12} />
                {looksLikeCpf ? 'CPF' : 'Email'}
              </label>
              <input
                ref={identifierRef}
                type={looksLikeCpf ? 'text' : 'email'}
                inputMode={looksLikeCpf ? 'numeric' : 'email'}
                name="username"
                placeholder={looksLikeCpf ? '000.000.000-00' : 'seu@email.com'}
                value={displayValue}
                onChange={handleIdentifierChange}
                autoComplete="username"
                required
                className="w-full h-12 px-4 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus:bg-white/6 transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-2" style={monoLabel}>
                <DSIcon name="lock" size={12} />
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full h-12 px-4 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus:bg-white/6 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <DSIcon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
                </button>
              </div>
            </div>

            {/* 2FA — conditional */}
            {show2FA && (
              <div className="space-y-3" style={{ animation: 'slideUp 300ms ease-out' }}>
                <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10">
                  <DSIcon name="shieldCheck" size={14} className="text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300">Informe o código do seu autenticador</p>
                </div>
                <input
                  ref={twoFactorInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full h-12 rounded-xl border border-amber-400/30 bg-amber-950/20 px-4 text-center tracking-widest text-white placeholder:text-amber-400/50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
                />
              </div>
            )}

            {/* Turnstile */}
            <Turnstile
              ref={turnstileRef}
              onVerify={handleTurnstileVerify}
              onExpire={handleTurnstileExpire}
            />

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-4 h-4 rounded border border-white/20 bg-white/4 peer-checked:bg-brand-primary peer-checked:border-brand-primary flex items-center justify-center transition-all">
                  {remember && <DSIcon name="check" size={12} className="text-slate-900" />}
                </div>
                <span className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Lembrar de mim
                </span>
              </label>
              <Link href="/forgot-password" className="text-brand-primary hover:text-brand-primary/80 transition-colors">
                Esqueceu?
              </Link>
            </div>

            {/* Submit button */}
            <ButtonUltra
              type="submit"
              variant="glass-primary"
              size="lg"
              fullWidth
              disabled={!isFormFilled}
              loading={login.isPending}
              className="font-bold uppercase"
            >
              Entrar
              <DSIcon name="arrowRight" size={16} />
            </ButtonUltra>

            {/* Error message */}
            {login.isError && !((login.error as Error)?.message || '').includes('2FA obrigat') && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
                <p className="text-sm text-red-400">
                  {(login.error as Error)?.message || 'CPF/email ou senha incorretos'}
                </p>
              </div>
            )}
          </form>

          {/* ─── Register link ─── */}
          <div className="mt-6 p-4 rounded-xl border border-green-500/15 bg-green-500/5 text-center" style={{ animation: 'slideUp 500ms ease-out' }}>
            <p className="text-sm text-slate-400">
              Novo por aqui?{' '}
              <Link href="/register" className="font-bold text-brand-primary hover:text-brand-primary/80 transition-colors">
                Teste 30 dias grátis
              </Link>
            </p>
            <p className="mt-2 text-xs text-slate-500" style={monoLabel}>
              🔒 SSL · LGPD · 30 DIAS GRÁTIS SEM CARTÃO
            </p>
          </div>

          {/* Version */}
          <p className="mt-6 text-center text-xs text-slate-600 select-none" style={monoLabel}>
            v{APP_VERSION}
          </p>
        </div>
      </div>

      {/* ─── CSS Animations ─── */}
      <style>{`
        @keyframes blurIn {
          from {
            opacity: 0;
            filter: blur(4px);
          }
          to {
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes logoScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes blurIn,
          @keyframes slideUp,
          @keyframes logoScale {
            to { transform: none; filter: none; }
          }
        }
      `}</style>
    </GuestGuard>
  )
}
