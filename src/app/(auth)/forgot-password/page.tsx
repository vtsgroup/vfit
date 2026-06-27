/**
 * src/app/(auth)/forgot-password/page.tsx
 *
 * Forgot Password — Light premium · 3D button · White inputs
 *
 * Exports: ForgotPasswordPage
 * Hooks: useState, useRef, useForgotPassword
 * Features: 'use client' · DSIcon
 */

// ============================================
// Forgot Password — Light premium · matching login redesign
// White surfaces, brand-green accents, 3D CTA
// ============================================

'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useForgotPassword } from '@/hooks/use-auth'
import { GuestGuard, Turnstile, type TurnstileRef } from '@/components/auth'

/* ─── Design tokens ─── */
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.01em',
}
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0',
}

/* ─── Light input ─── */
const inputClass = 'auth-light-field h-12 w-full rounded-2xl px-4 text-[14px] transition-all duration-200 focus:outline-none'

const STEPS = [
  { icon: 'mail', label: 'Informe seu email' },
  { icon: 'send', label: 'Receba o link + código' },
  { icon: 'lock', label: 'Crie uma nova senha' },
] as const

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState(false)
  const [sent, setSent] = useState(false)
  const turnstileRef = useRef<TurnstileRef>(null)

  const forgotPassword = useForgotPassword()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !turnstileToken) return

    forgotPassword.mutate(
      { email, turnstile_token: turnstileToken },
      { onSuccess: () => setSent(true) }
    )
  }

  function handleResend() {
    setSent(false)
    setEmail('')
    setTurnstileToken('')
    turnstileRef.current?.reset()
  }

  return (
    <GuestGuard>
      <div className="login-stagger">
        {/* Turnstile — invisible-first, fallback to interactive */}
        <Turnstile
          ref={turnstileRef}
          onVerify={(token) => { setTurnstileToken(token); setTurnstileError(false) }}
          onExpire={() => setTurnstileToken('')}
          onError={() => setTurnstileError(true)}
        />

        {/* ─── Header ─── */}
        <div className="mb-5">
          <Link
            href="/login"
            className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <DSIcon name="arrowLeft" size={14} /> Voltar ao login
          </Link>

          {/* Icon badge */}
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 shadow-[0_10px_24px_-8px_rgba(34,197,94,0.55)]">
            <DSIcon name="mail" size={22} className="text-white" />
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <DSIcon name="sparkles" size={13} className="text-emerald-600" />
            <p className="text-[9px] uppercase text-emerald-600" style={monoLabel}>
              RECUPERAÇÃO DE SENHA
            </p>
          </div>
          <h1 className="text-[1.75rem] text-slate-900 leading-none" style={headingFont}>
            Recuperar senha
          </h1>
          <p className="mt-1.5 text-[13px] text-slate-500">
            Informe seu email para receber um link e um código de recuperação
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            {/* Success card */}
            <div role="status" aria-live="polite" className="auth-light-soft flex items-start gap-3 rounded-2xl px-4 py-3.5">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true" focusable="false">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[12px] font-medium leading-relaxed text-emerald-800">
                Se o email informado estiver cadastrado, você receberá um link e um código de recuperação em instantes.
                Verifique também sua caixa de spam.
              </p>
            </div>

            {/* Resend */}
            <Button variant="secondary" size="lg" onClick={handleResend} className="w-full">
              <DSIcon name="rotateCcw" size={14} />
              Enviar novamente
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 mb-1.5" style={monoLabel}>
                <DSIcon name="mail" size={12} className="text-slate-400" /> EMAIL
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
                className={inputClass}
              />
            </div>

            {turnstileError && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5">
                <p className="text-[11px] text-amber-700">
                  Verificação de segurança com problema.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTurnstileError(false)
                    setTurnstileToken('')
                    turnstileRef.current?.reset()
                  }}
                  className="shrink-0 rounded-lg bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-200 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={!email || !turnstileToken}
              loading={forgotPassword.isPending}
              className="auth-submit-cta-light w-full uppercase font-black"
            >
              <DSIcon name="send" size={16} />
              ENVIAR RECUPERAÇÃO
            </Button>

            {/* Error */}
            {forgotPassword.isError && (
              <div role="alert" className="flex items-center gap-2.5 rounded-2xl border border-red-300 bg-red-50 px-4 py-3">
                <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-[12px] font-medium text-red-600">
                  Erro ao enviar email de recuperação. Tente novamente.
                </p>
              </div>
            )}
          </form>
        )}

        {/* ─── How it works — fills space, reassures ─── */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3.5">
          <p className="mb-3 text-[9px] uppercase text-slate-400" style={monoLabel}>
            COMO FUNCIONA
          </p>
          <div className="space-y-2.5">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                  <DSIcon name={s.icon} size={13} />
                </div>
                <span className="text-[12px] text-slate-600">
                  <span className="font-bold text-slate-400 mr-1.5">{i + 1}.</span>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-[13px] text-slate-500">
            Lembrou a senha?{' '}
            <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              Entrar
            </Link>
          </p>
          <span className="flex items-center gap-1.5 text-[9px] text-slate-400" style={monoLabel}>
            <DSIcon name="shield" size={12} /> SSL · LGPD
          </span>
        </div>
      </div>
    </GuestGuard>
  )
}
