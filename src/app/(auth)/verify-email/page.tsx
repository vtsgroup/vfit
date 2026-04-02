/**
 * src/app/(auth)/verify-email/page.tsx
 *
 * Verify Email — Ultra-modern · Glass cards · Animated states
 *
 * Exports: VerifyEmailPage
 * Hooks: useEffect, useState, useSearchParams, useVerifyEmail
 * Features: 'use client' · DSIcon
 */

// ============================================
// Verify Email — Ultra-modern · Glass cards · Animated states
// Koyeb-inspired, matching login redesign
// 4 states: loading, success, error, no-token
// ============================================

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { useVerifyEmail } from '@/hooks/use-auth'
import { GuestGuard } from '@/components/auth'

/* ─── Design tokens ─── */
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

type VerifyState = 'loading' | 'success' | 'error' | 'no-token'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [state, setState] = useState<VerifyState>(token ? 'loading' : 'no-token')
  const verifyEmail = useVerifyEmail()

  useEffect(() => {
    if (!token) {
      setState('no-token')
      return
    }

    verifyEmail.mutate(
      { token },
      {
        onSuccess: () => setState('success'),
        onError: () => setState('error'),
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <GuestGuard>
      <div className="animate-blur-in">
        {/* ─── Loading State ─── */}
        {state === 'loading' && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20">
              <DSIcon name="loader" size={32} className="animate-spin text-brand-primary" />
            </div>
            <h1 className="text-[1.5rem] text-white leading-none" style={headingFont}>
              Verificando email...
            </h1>
            <p className="mt-2 text-[13px] text-zinc-600">
              Aguarde enquanto confirmamos seu email.
            </p>
          </div>
        )}

        {/* ─── Success State ─── */}
        {state === 'success' && (
          <div className="py-4">
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <DSIcon name="mail" size={14} className="text-brand-primary/60" />
                <p className="text-[9px] uppercase text-brand-primary/70" style={monoLabel}>
                  VERIFICAÇÃO
                </p>
              </div>

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20">
                <DSIcon name="checkCircle" size={32} className="text-brand-primary" />
              </div>

              <h1 className="text-[1.75rem] text-white leading-none text-center" style={headingFont}>
                Email verificado!
              </h1>
              <p className="mt-2 text-[13px] text-zinc-600 text-center">
                Seu email foi verificado com sucesso. Agora você pode acessar sua conta.
              </p>
            </div>

            {/* Success alert — glass style */}
            <div className="flex items-start gap-3 rounded-2xl border border-brand-primary/20 bg-brand-primary/6 px-4 py-3.5 mb-5">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-brand-primary shrink-0 animate-pulse" />
              <p className="text-[12px] font-medium leading-relaxed text-brand-primary">
                Conta ativada! Faça login para começar a usar a plataforma.
              </p>
            </div>

            {/* CTA — 3D button */}
            <Link
              href="/login?verified=true"
              className="w-full group relative flex items-center justify-center gap-2.5 rounded-2xl bg-linear-to-b from-brand-primary to-[#1ea84e] py-4 text-[14px] font-black text-bg-dark uppercase tracking-wider transition-all duration-200 shadow-[0_5px_0_0_#166534,0_8px_20px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_7px_0_0_#166534,0_10px_28px_rgba(34,197,94,0.2)] active:translate-y-1 active:shadow-[0_2px_0_0_#166534,0_3px_8px_rgba(0,0,0,0.3)]"
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

        {/* ─── Error State ─── */}
        {state === 'error' && (
          <div className="py-4">
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <DSIcon name="shieldAlert" size={14} className="text-red-400/60" />
                <p className="text-[9px] uppercase text-red-400/70" style={monoLabel}>
                  ERRO
                </p>
              </div>

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                <DSIcon name="shieldAlert" size={32} className="text-red-400" />
              </div>

              <h1 className="text-[1.5rem] text-white leading-none text-center" style={headingFont}>
                Verificação falhou
              </h1>
              <p className="mt-2 text-[13px] text-zinc-600 text-center">
                O link de verificação é inválido ou expirou.
                Faça login para solicitar um novo email de verificação.
              </p>
            </div>

            {/* Error alert */}
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/6 px-4 py-3.5 mb-5">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-red-400 shrink-0" />
              <p className="text-[12px] font-medium leading-relaxed text-red-400">
                Links de verificação expiram em 24 horas. Solicite um novo pelo painel.
              </p>
            </div>

            {/* CTA — outline */}
            <Link
              href="/login"
              className="w-full group flex items-center justify-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/40 py-3.5 text-[13px] font-semibold text-zinc-400 transition-all hover:border-zinc-600 hover:text-white hover:bg-zinc-800/60"
            >
              Ir para o login
              <DSIcon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* ─── No Token State ─── */}
        {state === 'no-token' && (
          <div className="py-4">
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <DSIcon name="shieldAlert" size={14} className="text-amber-400/60" />
                <p className="text-[9px] uppercase text-amber-400/70" style={monoLabel}>
                  AVISO
                </p>
              </div>

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <DSIcon name="shieldAlert" size={32} className="text-amber-400" />
              </div>

              <h1 className="text-[1.5rem] text-white leading-none text-center" style={headingFont}>
                Link inválido
              </h1>
              <p className="mt-2 text-[13px] text-zinc-600 text-center">
                Nenhum token de verificação encontrado.
                Verifique se o link está correto ou solicite um novo email.
              </p>
            </div>

            {/* Warning alert */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/6 px-4 py-3.5 mb-5">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-400 shrink-0" />
              <p className="text-[12px] font-medium leading-relaxed text-amber-400">
                Copie o link completo do email recebido e cole no navegador.
              </p>
            </div>

            {/* CTA — outline */}
            <Link
              href="/login"
              className="w-full group flex items-center justify-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/40 py-3.5 text-[13px] font-semibold text-zinc-400 transition-all hover:border-zinc-600 hover:text-white hover:bg-zinc-800/60"
            >
              Ir para o login
              <DSIcon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="mt-7 flex items-center justify-end">
          <span className="flex items-center gap-1.5 text-[9px] text-zinc-700" style={monoLabel}>
            <DSIcon name="shield" size={12} /> SSL · LGPD
          </span>
        </div>
      </div>
    </GuestGuard>
  )
}
