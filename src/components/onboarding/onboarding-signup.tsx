/**
 * src/components/onboarding/onboarding-signup.tsx
 *
 * Signup-at-End — conversão from=onboarding no sistema "VFIT BROADCAST".
 *
 * Placar de transmissão: navy seco + grade técnica, manchete Syne uppercase,
 * recap do plano em box-score, valor em telemetria mono numerada, Google 1-tap
 * como ação primária (pill branca sobre moldura verde) e email/senha colapsado.
 * Promessa única: "30 dias grátis · tudo liberado · sem cartão".
 *
 * Lógica preservada: useRegisterStudent → login automático → /treinos.
 * Self-contained: form state + mutation próprios. Renderizar dentro de <GuestGuard>.
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useRegisterStudent, useOAuthRedirect } from '@/hooks/use-auth'
import { Turnstile } from '@/components/auth'
import { ApiClientError } from '@/lib/api-client'
import { useOnboardingStore } from '@/stores/onboarding-store'

/* ─── Goal labels — espelha a result page pro recap bater com o que o usuário viu ─── */
const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Emagrecer',
  gain_muscle: 'Ganhar massa',
  get_stronger: 'Mais força',
  strength: 'Mais força',
  endurance: 'Resistência',
  health: 'Saúde geral',
  tone: 'Definição',
  flexibility: 'Flexibilidade',
}

const VALUE_ROWS: { icon: DSIconName; title: string; desc: string }[] = [
  { icon: 'dumbbell', title: 'Seu plano completo, executável', desc: 'Treinos, séries e cargas — prontos pra hoje.' },
  { icon: 'brainCircuit', title: 'A IA ajusta junto com você', desc: 'O plano evolui conforme seus resultados.' },
  { icon: 'flame', title: 'Streaks e progresso', desc: 'Acompanhe sua evolução semana a semana.' },
  { icon: 'shieldCheck', title: 'Sem cartão, sem compromisso', desc: 'Acesso total. Continue só se fizer sentido.' },
]

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

export function OnboardingSignup({ inviteToken }: { inviteToken?: string }) {
  const register = useRegisterStudent()
  const oauth = useOAuthRedirect()
  const storeGoal = useOnboardingStore((s) => s.data.goal)

  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Recap — o plano exato que o usuário acabou de ver (result page grava 'vfit_plan')
  const [recap, setRecap] = useState({ days: 3, minutes: 45 })
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('vfit_plan')
      if (!raw) return
      const p = JSON.parse(raw)
      setRecap({
        days: p?.stats?.total_days ?? 3,
        minutes: p?.stats?.session_duration_minutes ?? 45,
      })
    } catch {
      /* keep fallback */
    }
  }, [])
  const goalLabel = (storeGoal && GOAL_LABELS[storeGoal]) || 'Treino IA'

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const formValid =
    form.full_name.trim().length >= 2 &&
    !!form.email &&
    form.password.length >= 8 &&
    !!turnstileToken &&
    acceptedTerms

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid) return
    register.mutate({
      full_name: form.full_name.trim(),
      email: form.email,
      password: form.password,
      invitation_token: inviteToken || undefined,
      turnstile_token: turnstileToken,
    })
  }

  const recapCells: { icon: DSIconName; v: string; k: string }[] = [
    { icon: 'target', v: goalLabel, k: 'Objetivo' },
    { icon: 'calendar', v: `${recap.days}×/sem`, k: 'Frequência' },
    { icon: 'clock', v: `${recap.minutes}min`, k: 'Por sessão' },
  ]

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#04080f] text-white">
      {/* atmosfera "impressa" seca — grade técnica + bloom verde no topo */}
      <div aria-hidden className="vfit-flow-grid pointer-events-none absolute inset-0 opacity-[0.22]" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(110% 55% at 50% -6%, rgba(34,197,94,0.14), transparent 55%)' }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-green-400/40 to-transparent" />

      <div className="bc-su-stagger relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-[max(env(safe-area-inset-bottom),28px)] pt-[calc(env(safe-area-inset-top)+36px)]">
        {/* ─── kicker ─── */}
        <p className="bc-mono inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-green-300/90">
          <span aria-hidden className="bc-su-live h-2 w-2 rounded-full bg-green-400" />
          Plano Nº 01 · Pronto pra salvar
        </p>

        {/* ─── manchete ─── */}
        <h1 className="font-syne mt-4 text-[36px] font-black uppercase leading-[0.98] tracking-tight sm:text-[42px]">
          Seu plano
          <br />
          está{' '}
          <span className="text-[#22c55e]" style={{ textShadow: '0 6px 34px rgba(34,197,94,0.32)' }}>
            pronto
          </span>
        </h1>
        <p className="mt-3 max-w-[21rem] text-sm leading-6 text-slate-300">
          Crie sua conta pra salvar e começar hoje — <strong className="font-bold text-white">30 dias grátis</strong>, tudo liberado, sem cartão.
        </p>

        {/* ─── recap box-score — é o SEU plano ─── */}
        <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-xl border border-green-400/15">
          {recapCells.map((s, i) => (
            <div key={s.k} className={`flex flex-col gap-1.5 px-3 py-4 ${i === 1 ? 'bg-green-900/15' : ''} ${i < 2 ? 'border-r border-white/8' : ''}`}>
              <DSIcon name={s.icon} size={15} className="text-green-300" />
              <span className="font-syne text-[13px] font-black leading-tight text-white min-[400px]:text-[14px]">{s.v}</span>
              <span className="bc-mono text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{s.k}</span>
            </div>
          ))}
        </div>

        {/* ─── telemetria de valor — tudo liberado por 30 dias ─── */}
        <section aria-label="O que você libera" className="mt-6">
          <h2 className="bc-mono mb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-green-300/70">Tudo liberado por 30 dias</h2>
          <div className="border-y border-green-400/15">
            {VALUE_ROWS.map((row, i) => (
              <div key={row.title} className={`flex items-start gap-3 py-3 ${i > 0 ? 'border-t border-white/8' : ''}`}>
                <span className="bc-mono w-6 shrink-0 pt-0.5 text-[11px] font-bold tabular-nums text-green-300/55">{String(i + 1).padStart(2, '0')}</span>
                <DSIcon name={row.icon} size={17} className="mt-0.5 shrink-0 text-green-300" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-bold leading-tight text-white">{row.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-slate-400">{row.desc}</span>
                </span>
                <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#06210f]" style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)' }}>
                  <DSIcon name="check" size={11} />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── ação primária — Google 1-tap ─── */}
        <div className="mt-7">
          <p className="bc-mono mb-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Crie sua conta · leva 5 segundos</p>
          <button
            type="button"
            onClick={() => oauth.mutate({ provider: 'google', userType: 'student', invitationToken: inviteToken || undefined })}
            disabled={oauth.isPending}
            className="bc-su-google group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-white text-[15px] font-bold text-zinc-800 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-50 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04080f] disabled:pointer-events-none disabled:opacity-60"
          >
            {oauth.isPending ? (
              <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
            ) : (
              <GoogleIcon />
            )}
            Continuar com Google
          </button>
          <p className="bc-mono mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
            <DSIcon name="zap" size={12} className="text-green-300" />1 toque · você já entra no app
          </p>
        </div>

        {/* ─── email/senha — colapsado secundário ─── */}
        <details className="group mt-5">
          <summary className="bc-mono flex cursor-pointer list-none items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:border-green-400/30 hover:text-white [&::-webkit-details-marker]:hidden">
            <DSIcon name="mail" size={14} className="text-slate-400" />
            Prefiro email e senha
            <DSIcon name="arrowRight" size={13} className="text-slate-500 transition-transform duration-300 group-open:rotate-90" />
          </summary>

          <div className="mt-5">
            <div className="mb-4 flex items-center gap-3" aria-hidden>
              <span className="h-px flex-1 bg-white/10" />
              <span className="bc-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">ou</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="su-name" className="bc-mono mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-green-300/70">
                  Nome completo
                </label>
                <input
                  id="su-name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  autoComplete="name"
                  required
                  className="vfit-flow-field h-13 w-full rounded-2xl px-4 text-[15px] transition-all duration-300 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="su-email" className="bc-mono mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-green-300/70">
                  Email
                </label>
                <input
                  id="su-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  autoComplete="email"
                  required
                  className="vfit-flow-field h-13 w-full rounded-2xl px-4 text-[15px] transition-all duration-300 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="su-pass" className="bc-mono mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-green-300/70">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="su-pass"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    autoComplete="new-password"
                    required
                    className="vfit-flow-field h-13 w-full rounded-2xl px-4 pr-12 text-[15px] transition-all duration-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition-colors hover:text-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300/50"
                  >
                    {showPassword ? <DSIcon name="eyeOff" size={16} /> : <DSIcon name="eye" size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 flex gap-1" aria-hidden>
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          form.password.length >= lvl * 3
                            ? form.password.length >= 12
                              ? 'bg-green-400'
                              : form.password.length >= 8
                                ? 'bg-amber-400'
                                : 'bg-red-400'
                            : 'bg-white/15'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3 transition-colors hover:border-green-400/25">
                <span className="relative mt-0.5">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="peer sr-only" />
                  <span className="grid h-5 w-5 place-items-center rounded-md border border-slate-600 bg-slate-900/60 transition-all duration-200 peer-checked:border-green-400 peer-checked:bg-green-400">
                    {acceptedTerms && <DSIcon name="check" size={13} className="text-[#06210f]" />}
                  </span>
                </span>
                <span className="text-[11.5px] normal-case leading-relaxed tracking-normal text-slate-400">
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" rel="noreferrer" className="font-bold text-green-300 hover:underline">
                    Termos de Uso
                  </Link>{' '}
                  e a{' '}
                  <Link href="/privacidade" target="_blank" rel="noreferrer" className="font-bold text-green-300 hover:underline">
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>

              <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

              <button
                type="submit"
                disabled={!formValid || register.isPending}
                className="bc-su-cta group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full text-[#06210f] outline-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04080f] disabled:pointer-events-none disabled:opacity-35 disabled:saturate-[0.4]"
                style={{ background: 'linear-gradient(135deg,#4ade80 0%,#22c55e 50%,#16a34a 100%)' }}
              >
                {formValid && !register.isPending && <span aria-hidden className="bc-su-sweep" />}
                {register.isPending ? (
                  <span aria-hidden className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-[#06210f]/30 border-t-[#06210f]" />
                ) : (
                  <DSIcon name="gift" size={17} className="relative z-10" />
                )}
                <span className="font-syne relative z-10 text-[15px] font-black uppercase tracking-tight">
                  {register.isPending ? 'Criando conta…' : 'Criar conta · 30 dias grátis'}
                </span>
                {!register.isPending && <DSIcon name="arrowRight" size={17} className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5" />}
              </button>

              <p className="bc-mono flex items-center justify-center gap-1.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                <DSIcon name="lock" size={12} className="text-green-300/70" />
                Grátis por 30 dias · cancele quando quiser
              </p>

              {register.isError && (
                <div role="alert" className="flex items-center gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/8 px-4 py-3">
                  <DSIcon name="alertCircle" size={16} className="shrink-0 text-red-400" />
                  <p className="text-[12.5px] font-medium text-red-300">
                    {register.error instanceof ApiClientError ? register.error.message : 'Erro ao criar conta. Tente novamente.'}
                  </p>
                </div>
              )}
            </form>
          </div>
        </details>

        {/* ─── footer ─── */}
        <div className="mt-auto pt-7">
          <div className="flex items-center justify-between border-t border-white/8 pt-4">
            <p className="text-[13px] text-slate-400">
              Já tem conta?{' '}
              <Link href="/login?from=onboarding" className="font-bold text-green-300 transition-colors hover:text-green-200">
                Entrar
              </Link>
            </p>
            <span className="bc-mono flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
              <DSIcon name="shieldCheck" size={12} className="text-green-300/70" /> SSL · LGPD
            </span>
          </div>
        </div>
      </div>

      {/* Animações — CSS-only, reduced-motion safe, conteúdo visível sem JS */}
      <style>{`
        @keyframes bcSuRise { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: translateY(0); } }
        .bc-su-stagger > * { animation: bcSuRise 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .bc-su-stagger > *:nth-child(2) { animation-delay: 0.06s; }
        .bc-su-stagger > *:nth-child(3) { animation-delay: 0.12s; }
        .bc-su-stagger > *:nth-child(4) { animation-delay: 0.18s; }
        .bc-su-stagger > *:nth-child(5) { animation-delay: 0.24s; }
        .bc-su-stagger > *:nth-child(6) { animation-delay: 0.30s; }
        .bc-su-stagger > *:nth-child(7) { animation-delay: 0.36s; }
        .bc-su-stagger > *:nth-child(8) { animation-delay: 0.42s; }
        .bc-su-live { box-shadow: 0 0 0 0 rgba(74,222,128,0.6); animation: bcSuPing 2.4s ease-out infinite; }
        @keyframes bcSuPing { 0% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); } 70%,100% { box-shadow: 0 0 0 7px rgba(74,222,128,0); } }
        .bc-su-google { box-shadow: 0 0 0 1px rgba(34,197,94,0.35), 0 18px 44px -14px rgba(34,197,94,0.45), inset 0 1px 0 rgba(255,255,255,0.9); animation: bcSuBreathe 3.4s ease-in-out 1.2s infinite; }
        @keyframes bcSuBreathe { 0%,100% { box-shadow: 0 0 0 1px rgba(34,197,94,0.35), 0 16px 40px -14px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.9); } 50% { box-shadow: 0 0 0 1px rgba(34,197,94,0.55), 0 24px 60px -10px rgba(34,197,94,0.65), inset 0 1px 0 rgba(255,255,255,0.9); } }
        .bc-su-cta { box-shadow: 0 16px 40px -14px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.45); }
        .bc-su-sweep { position: absolute; inset: 0; z-index: 5; pointer-events: none; background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%); transform: translateX(-130%) skewX(-18deg); animation: bcSuSweep 3.6s ease-in-out 1.5s infinite; }
        @keyframes bcSuSweep { 0% { transform: translateX(-130%) skewX(-18deg); } 60%,100% { transform: translateX(260%) skewX(-18deg); } }
        @media (prefers-reduced-motion: reduce) {
          .bc-su-stagger > *, .bc-su-live, .bc-su-google, .bc-su-cta, .bc-su-sweep { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </div>
  )
}
