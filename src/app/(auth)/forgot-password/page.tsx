/**
 * src/app/(auth)/forgot-password/page.tsx
 *
 * Forgot Password — VFIT BROADCAST dark · matching login/register
 *
 * Exports: ForgotPasswordPage
 * Hooks: useState, useRef, useForgotPassword
 * Features: 'use client' · DSIcon
 */

'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { useForgotPassword } from '@/hooks/use-auth'
import { GuestGuard, Turnstile, type TurnstileRef } from '@/components/auth'

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

  const canSubmit = !!email && !!turnstileToken

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
            className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400 transition-colors hover:text-white"
          >
            <DSIcon name="arrowLeft" size={14} /> Voltar ao login
          </Link>

          {/* Icon badge */}
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-green-300/25"
            style={{ background: 'linear-gradient(180deg, rgba(74,222,128,0.22), rgba(34,197,94,0.08))', boxShadow: '0 10px 24px -8px rgba(34,197,94,0.45)' }}
          >
            <DSIcon name="mail" size={22} className="text-green-200" />
          </div>

          <p className="bc-mono mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-green-300/80">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Recuperação de senha
          </p>
          <h1 className="font-syne text-[1.75rem] font-black leading-none text-white">
            Recuperar senha
          </h1>
          <p className="mt-1.5 text-[13px] text-slate-400">
            Informe seu email para receber um link e um código de recuperação
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            {/* Success card */}
            <div role="status" aria-live="polite" className="flex items-start gap-3 rounded-2xl border border-green-400/25 bg-green-400/8 px-4 py-3.5">
              <div
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#06210f]"
                style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)' }}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true" focusable="false">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[12px] font-medium leading-relaxed text-green-200">
                Se o email informado estiver cadastrado, você receberá um link e um código de recuperação em instantes.
                Verifique também sua caixa de spam.
              </p>
            </div>

            {/* Resend */}
            <button
              type="button"
              onClick={handleResend}
              className="bc-mono flex h-13 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/4 text-[12px] font-bold uppercase tracking-[0.14em] text-slate-300 transition-colors hover:border-green-400/30 hover:text-white"
            >
              <DSIcon name="rotateCcw" size={14} />
              Enviar novamente
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="bc-mono mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-green-300/70">
                <DSIcon name="mail" size={12} className="text-green-300/60" /> EMAIL
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
                className="vfit-flow-field h-12 w-full rounded-2xl px-4 text-[14px] transition-all duration-200 focus:outline-none"
              />
            </div>

            {turnstileError && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/8 px-4 py-2.5">
                <p className="text-[11px] text-amber-200">
                  Verificação de segurança com problema.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTurnstileError(false)
                    setTurnstileToken('')
                    turnstileRef.current?.reset()
                  }}
                  className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-bold text-amber-200 transition-colors hover:bg-amber-400/20"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Submit — BROADCAST pill CTA */}
            <button
              type="submit"
              disabled={!canSubmit || forgotPassword.isPending}
              className="bc-fp-cta group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full text-[#06210f] outline-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04080f] disabled:pointer-events-none disabled:opacity-35 disabled:saturate-[0.4]"
              style={{ background: 'linear-gradient(135deg,#4ade80 0%,#22c55e 50%,#16a34a 100%)' }}
            >
              {forgotPassword.isPending ? (
                <span aria-hidden className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-[#06210f]/30 border-t-[#06210f]" />
              ) : (
                <DSIcon name="send" size={16} className="relative z-10" />
              )}
              <span className="font-syne relative z-10 text-[15px] font-black uppercase tracking-tight">
                {forgotPassword.isPending ? 'Enviando…' : 'Enviar recuperação'}
              </span>
            </button>

            {/* Error */}
            {forgotPassword.isError && (
              <div role="alert" className="flex items-center gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/8 px-4 py-3">
                <div className="h-2 w-2 shrink-0 rounded-full bg-red-400" />
                <p className="text-[12px] font-medium text-red-300">
                  Erro ao enviar email de recuperação. Tente novamente.
                </p>
              </div>
            )}
          </form>
        )}

        {/* ─── How it works — fills space, reassures ─── */}
        <div className="mt-6 rounded-2xl border border-white/8 bg-white/3 px-4 py-3.5">
          <p className="bc-mono mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-green-300/60">
            COMO FUNCIONA
          </p>
          <div className="space-y-2.5">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-green-400/25 bg-green-400/10 text-green-300">
                  <DSIcon name={s.icon} size={13} />
                </div>
                <span className="text-[12px] text-slate-300">
                  <span className="bc-mono mr-1.5 font-bold text-green-300/50">{String(i + 1).padStart(2, '0')}</span>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-[13px] text-slate-400">
            Lembrou a senha?{' '}
            <Link href="/login" className="font-bold text-green-300 transition-colors hover:text-green-200">
              Entrar
            </Link>
          </p>
          <span className="bc-mono flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
            <DSIcon name="shield" size={12} /> SSL · LGPD
          </span>
        </div>
      </div>

      <style>{`
        .bc-fp-cta { box-shadow: 0 16px 40px -14px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.45); }
      `}</style>
    </GuestGuard>
  )
}
