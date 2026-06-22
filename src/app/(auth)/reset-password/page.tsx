/**
 * src/app/(auth)/reset-password/page.tsx
 *
 * Reset Password — Ultra-modern · 3D button · White inputs
 *
 * Exports: ResetPasswordPage
 * Hooks: useState, useSearchParams, useResetPassword
 * Features: 'use client' · DSIcon
 */

// ============================================
// Reset Password — Ultra-modern · 3D button · White inputs
// Koyeb-inspired, matching login redesign
// Dual flow: token (email link) vs code (6 digits + email)
// ============================================

'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useResetPassword } from '@/hooks/use-auth'
import { GuestGuard } from '@/components/auth'

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-primary" /></div>}>
      <ResetPasswordInner />
    </Suspense>
  )
}

function ResetPasswordInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const usingTokenFlow = !!token

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const resetPassword = useResetPassword()

  const passwordsMatch = password === confirmPassword
  const formValid = usingTokenFlow
    ? password.length >= 8 && !!confirmPassword && passwordsMatch
    : password.length >= 8 && !!confirmPassword && passwordsMatch && !!email && code.length === 6

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid) return

    if (usingTokenFlow) {
      resetPassword.mutate({ token, password })
      return
    }

    resetPassword.mutate({
      email: email.trim().toLowerCase(),
      code: code.trim(),
      password,
    })
  }

  return (
    <GuestGuard>
      <div className="animate-blur-in">
        {/* ─── Header ─── */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-2">
            {usingTokenFlow
              ? <DSIcon name="keyRound" size={14} className="text-brand-primary/60" />
              : <DSIcon name="shieldAlert" size={14} className="text-brand-primary/60" />
            }
            <p className="text-[9px] uppercase text-brand-primary/70" style={monoLabel}>
              {usingTokenFlow ? 'REDEFINIÇÃO' : 'RECUPERAÇÃO'}
            </p>
          </div>
          <h1 className="text-[1.75rem] text-white leading-none" style={headingFont}>
            {usingTokenFlow ? 'Redefinir senha' : 'Recuperar conta'}
          </h1>
          <p className="mt-1.5 text-[13px] text-slate-400">
            {usingTokenFlow
              ? 'Escolha uma nova senha para sua conta'
              : 'Informe email + código de 6 dígitos enviado por email'}
          </p>
        </div>

        {/* ─── Form ─── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!usingTokenFlow && (
            <>
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
                  required
                  className={inputClass}
                />
              </div>

              {/* Code */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                  <DSIcon name="hash" size={12} className="text-zinc-500" /> CÓDIGO DE RECUPERAÇÃO
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  autoComplete="one-time-code"
                  required
                  className={`${inputClass} text-center font-mono text-lg`}
                />
              </div>
            </>
          )}

          {/* Nova senha */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
              <DSIcon name="lock" size={12} className="text-zinc-500" /> NOVA SENHA
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
                required
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/6 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              >
                {showPassword ? <DSIcon name="eyeOff" size={16} /> : <DSIcon name="eye" size={16} />}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
              <DSIcon name="lock" size={12} className="text-zinc-500" /> CONFIRMAR NOVA SENHA
            </label>
            <input
              type="password"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              className={inputClass}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1.5 text-[11px] text-red-400">Senhas não conferem</p>
            )}
          </div>

          {/* Submit — 3D button */}
          <Button
            type="submit"
            size="lg"
            disabled={!formValid}
            loading={resetPassword.isPending}
            className="w-full uppercase font-black"
          >
            REDEFINIR SENHA
            <DSIcon name="arrowRight" size={16} />
          </Button>

          {/* Error */}
          {resetPassword.isError && (
            <div role="alert" className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/6 px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
              <p className="text-[12px] font-medium text-red-400">
                Erro ao redefinir senha. Verifique os dados e tente novamente.
              </p>
            </div>
          )}

          {/* Success */}
          {resetPassword.isSuccess && (
            <div className="space-y-4">
              <div role="status" aria-live="polite" className="flex items-start gap-3 rounded-2xl border border-brand-primary/20 bg-brand-primary/6 px-4 py-3.5">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-brand-primary shrink-0 animate-pulse" />
                <p className="text-[12px] font-medium leading-relaxed text-brand-primary">
                  Senha redefinida com sucesso! Agora você pode fazer login com a nova senha.
                </p>
              </div>
              <Link
                href="/login"
                className="auth-submit-cta group relative flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-[14px] font-black uppercase transition-all duration-200 hover:-translate-y-0.5 active:translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
                style={headingFont}
              >
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>
                <span className="relative z-10 flex items-center gap-2">
                  IR PARA O LOGIN
                  <DSIcon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          )}

          {!usingTokenFlow && !resetPassword.isSuccess && (
            <p className="text-center text-[11px] text-zinc-400">
              Não recebeu o código?{' '}
              <Link href="/forgot-password" className="font-bold text-brand-primary hover:text-brand-primary/80 transition-colors">
                solicitar novo envio
              </Link>
            </p>
          )}
        </form>

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
