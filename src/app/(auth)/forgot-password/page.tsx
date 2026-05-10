/**
 * src/app/(auth)/forgot-password/page.tsx
 *
 * Forgot Password — Ultra-modern · 3D button · White inputs
 *
 * Exports: ForgotPasswordPage
 * Hooks: useState, useRef, useForgotPassword
 * Features: 'use client' · DSIcon
 */

// ============================================
// Forgot Password — Ultra-modern · 3D button · White inputs
// Koyeb-inspired, matching login redesign
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
  letterSpacing: '0',
}
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0',
}

/* ─── Input classes ─── */
const inputClass = 'vfit-flow-field h-12 w-full rounded-2xl px-4 text-[14px] transition-all duration-200 focus:outline-none'

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
      <div className="animate-blur-in">
        {/* Turnstile — invisible-first, fallback to interactive */}
        <Turnstile
          ref={turnstileRef}
          onVerify={(token) => { setTurnstileToken(token); setTurnstileError(false) }}
          onExpire={() => setTurnstileToken('')}
          onError={() => setTurnstileError(true)}
        />

        {/* ─── Header ─── */}
        <div className="mb-7">
          <Link
            href="/login"
            className="mb-3 flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-white transition-colors"
          >
            <DSIcon name="arrowLeft" size={14} /> Voltar ao login
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <DSIcon name="mail" size={14} className="text-brand-primary/60" />
            <p className="text-[9px] uppercase text-brand-primary/70" style={monoLabel}>
              RECUPERAÇÃO
            </p>
          </div>
          <h1 className="text-[1.75rem] text-white leading-none" style={headingFont}>
            Recuperar senha
          </h1>
          <p className="mt-1.5 text-[13px] text-slate-400">
            Informe seu email para receber um link e um código de recuperação
          </p>
        </div>

        {sent ? (
          <div className="space-y-5">
            {/* Success alert — glass style */}
            <div className="flex items-start gap-3 rounded-2xl border border-brand-primary/20 bg-brand-primary/6 px-4 py-3.5">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-brand-primary shrink-0 animate-pulse" />
              <p className="text-[12px] font-medium leading-relaxed text-brand-primary">
                Se o email informado estiver cadastrado, você receberá um link e um código de recuperação em instantes.
                Verifique também sua caixa de spam.
              </p>
            </div>

            {/* Resend — outline button */}
            <Button
              variant="secondary"
              size="lg"
              onClick={handleResend}
              className="w-full"
            >
              <DSIcon name="rotateCcw" size={14} />
              Enviar novamente
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                <DSIcon name="mail" size={12} className="text-zinc-500" /> EMAIL
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
              <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/6 px-4 py-2.5">
                <p className="text-[11px] text-amber-400">
                  Verificação de segurança com problema.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTurnstileError(false)
                    setTurnstileToken('')
                    turnstileRef.current?.reset()
                  }}
                  className="shrink-0 rounded-lg bg-amber-500/15 px-3 py-1 text-[10px] font-bold text-amber-400 hover:bg-amber-500/25 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Submit — 3D button */}
            <Button
              type="submit"
              size="lg"
              disabled={!email || !turnstileToken}
              loading={forgotPassword.isPending}
              className="w-full uppercase font-black"
            >
              <DSIcon name="send" size={16} />
              ENVIAR RECUPERAÇÃO
            </Button>

            {/* Error */}
            {forgotPassword.isError && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/6 px-4 py-3">
                <div className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
                <p className="text-[12px] font-medium text-red-400">
                  Erro ao enviar email de recuperação. Tente novamente.
                </p>
              </div>
            )}
          </form>
        )}

        {/* Footer */}
        <div className="mt-7 flex items-center justify-between">
          <p className="text-[13px] text-zinc-500">
            Lembrou a senha?{' '}
            <Link href="/login" className="font-bold text-brand-primary hover:text-brand-primary/80 transition-colors">
              Entrar
            </Link>
          </p>
          <span className="flex items-center gap-1.5 text-[9px] text-zinc-700" style={monoLabel}>
            <DSIcon name="shield" size={12} /> SSL · LGPD
          </span>
        </div>
      </div>
    </GuestGuard>
  )
}
