/**
 * src/components/onboarding/onboarding-signup.tsx
 *
 * Signup-at-End — the from=onboarding conversion screen (reverse trial, no-card).
 *
 * Replaces the old 3-layer paywall. After the quiz shows the AI plan (the reward),
 * this screen creates the account and logs the user in. One promise everywhere:
 * "30 dias grátis · tudo liberado · sem cartão". Google 1-tap primary, email/senha
 * collapsed secondary. Post-signup the useRegisterStudent hook routes to /treinos.
 *
 * Self-contained: owns its form state + register mutation. Render inside <GuestGuard>.
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useRegisterStudent } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { OAuthButtons, AuthDivider, Turnstile } from '@/components/auth'
import { ApiClientError } from '@/lib/api-client'

/* ─── Design tokens (match register/student) ─── */
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
const inputNormal = 'vfit-flow-field h-13 w-full rounded-2xl px-4 text-[15px] transition-all duration-300 focus:outline-none'

/* ─── Goal labels — mirrors the result page so the recap matches what the user saw ─── */
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

export function OnboardingSignup({ inviteToken }: { inviteToken?: string }) {
  const register = useRegisterStudent()

  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Recap chip — read the exact plan the user just saw (result page wrote 'vfit_plan')
  const [recap, setRecap] = useState({ goal: 'Treino IA', days: 3, minutes: 45 })
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('vfit_plan')
      if (!raw) return
      const p = JSON.parse(raw)
      setRecap({
        goal: (p?.data?.goal && (GOAL_LABELS[p.data.goal] || p.data.goal)) || 'Treino IA',
        days: p?.stats?.total_days ?? 3,
        minutes: p?.stats?.session_duration_minutes ?? 45,
      })
    } catch {
      /* keep fallback */
    }
  }, [])

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

  return (
    <div className="vfit-flow-bg relative min-h-dvh w-full overflow-hidden text-white">
      <div className="vfit-flow-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* emerald glow bloom behind hero (sky as cool secondary) */}
      <div
        className="vfit-onb-halo pointer-events-none absolute inset-x-0 top-0 h-[44vh]"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(110,231,183,0.18) 0%, rgba(56,189,248,0.06) 45%, transparent 72%)' }}
      />

      <div className="vfit-onb-stagger relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-[calc(env(safe-area-inset-top)+28px)]">

        {/* ═══════════ 1 · HERO — plan is ready ═══════════ */}
        <header className="text-center">
          <div className="vfit-onb-pop relative mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-400/12 ring-1 ring-emerald-300/25">
            <span className="absolute -z-10 h-16 w-16 rounded-2xl bg-emerald-300/20 blur-xl" aria-hidden="true" />
            <DSIcon name="sparkles" size={30} className="text-emerald-200" />
          </div>

          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-emerald-100">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-400">
              <DSIcon name="gift" size={11} className="text-bg-base" />
            </span>
            30 dias grátis · tudo liberado · sem cartão
          </span>

          <h1 className="mt-4 text-[26px] leading-[1.12] text-white" style={headingFont}>
            Seu plano está pronto.
            <br />
            <span className="text-emerald-200">Crie sua conta pra salvar.</span>
          </h1>

          <p className="mx-auto mt-2.5 max-w-[20rem] text-[14px] leading-relaxed text-slate-400">
            Montamos seu treino com IA com base nas suas respostas. Salve agora e comece hoje mesmo — sem pagar nada.
          </p>
        </header>

        {/* ═══════════ 2 · RECAP CHIP — this is YOUR plan (endowment) ═══════════ */}
        <div className="vfit-flow-panel-soft mt-6 flex items-stretch divide-x divide-white/8 rounded-2xl px-1 py-3">
          <div className="flex flex-1 flex-col items-center px-2 text-center">
            <DSIcon name="target" size={16} className="text-emerald-200" />
            <span className="mt-1.5 text-[13px] font-black leading-tight text-white">{recap.goal}</span>
            <span className="text-[9px] uppercase tracking-wide text-slate-500" style={monoLabel}>Objetivo</span>
          </div>
          <div className="flex flex-1 flex-col items-center px-2 text-center">
            <DSIcon name="dumbbell" size={16} className="text-emerald-200" />
            <span className="mt-1.5 text-[13px] font-black leading-tight text-white">{recap.days}x/sem</span>
            <span className="text-[9px] uppercase tracking-wide text-slate-500" style={monoLabel}>Frequência</span>
          </div>
          <div className="flex flex-1 flex-col items-center px-2 text-center">
            <DSIcon name="clock" size={16} className="text-emerald-200" />
            <span className="mt-1.5 text-[13px] font-black leading-tight text-white">{recap.minutes}min</span>
            <span className="text-[9px] uppercase tracking-wide text-slate-500" style={monoLabel}>Por sessão</span>
          </div>
        </div>

        {/* ═══════════ 3 · VALUE STACK — tudo liberado por 30 dias ═══════════ */}
        <section aria-label="O que você libera" className="vfit-flow-panel-soft mt-4 rounded-3xl px-4 py-4">
          <p className="mb-3 px-1 text-[10px] font-black uppercase tracking-wide text-emerald-200/70" style={monoLabel}>
            Tudo liberado por 30 dias
          </p>
          <ul className="space-y-2.5">
            {VALUE_ROWS.map((row) => (
              <li key={row.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-emerald-400/12 ring-1 ring-emerald-300/20">
                  <DSIcon name={row.icon} size={15} className="text-emerald-200" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[13.5px] font-bold leading-tight text-slate-100">
                    {row.title}
                    <DSIcon name="check" size={13} className="text-emerald-300" />
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-slate-400">{row.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ═══════════ 4 · PRIMARY ACTION — GOOGLE 1-TAP (single focus) ═══════════ */}
        <div className="mt-6">
          <p className="mb-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400" style={monoLabel}>
            Crie sua conta — leva 5 segundos
          </p>
          <div className="relative">
            <div className="vfit-onb-pulse pointer-events-none absolute -inset-1.5 rounded-3xl bg-emerald-400/18 blur-lg" aria-hidden="true" />
            <div className="relative rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.04] p-1.5 shadow-[0_0_40px_rgba(16,185,129,0.22)]">
              <OAuthButtons compact userType="student" invitationToken={inviteToken || undefined} />
            </div>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
            <DSIcon name="zap" size={12} className="text-emerald-300" />
            1 toque · sua conta fica pronta e você já entra no app
          </p>
        </div>

        {/* ═══════════ 5 · EMAIL/SENHA — collapsed secondary ═══════════ */}
        <details className="vfit-onb-email group mt-5">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-[13px] font-bold text-slate-300 transition-colors hover:border-emerald-300/20 hover:text-emerald-100 [&::-webkit-details-marker]:hidden">
            <DSIcon name="mail" size={15} className="text-slate-400" />
            Prefiro email e senha
            <DSIcon name="arrowRight" size={14} className="text-slate-500 transition-transform duration-300 group-open:rotate-90" />
          </summary>

          <div className="mt-4">
            <AuthDivider />

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400" style={monoLabel}>
                  Nome completo
                </label>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  autoComplete="name"
                  required
                  className={inputNormal}
                />
              </div>

              <div>
                <label className="mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400" style={monoLabel}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  autoComplete="email"
                  required
                  className={inputNormal}
                />
              </div>

              <div>
                <label className="mb-1.5 ml-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400" style={monoLabel}>
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    autoComplete="new-password"
                    required
                    className={`${inputNormal} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition-colors hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
                  >
                    {showPassword ? <DSIcon name="eyeOff" size={16} /> : <DSIcon name="eye" size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          form.password.length >= lvl * 3
                            ? form.password.length >= 12 ? 'bg-emerald-400' : form.password.length >= 8 ? 'bg-amber-400' : 'bg-red-400'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3 transition-colors hover:border-emerald-300/25">
                <span className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="grid h-5 w-5 place-items-center rounded-md border border-slate-600 bg-slate-900/60 transition-all duration-200 peer-checked:border-emerald-400 peer-checked:bg-emerald-400">
                    {acceptedTerms && <DSIcon name="check" size={13} className="text-bg-base" />}
                  </span>
                </span>
                <span className="text-[11.5px] leading-relaxed text-slate-400">
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" rel="noreferrer" className="font-bold text-emerald-200 hover:underline">Termos de Uso</Link>
                  {' '}e a{' '}
                  <Link href="/privacidade" target="_blank" rel="noreferrer" className="font-bold text-emerald-200 hover:underline">Política de Privacidade</Link>.
                </span>
              </label>

              <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!formValid}
                loading={register.isPending}
                className="w-full font-black uppercase"
              >
                <DSIcon name="gift" size={16} />
                Criar conta · 30 dias grátis
                <DSIcon name="arrowRight" size={16} />
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-center text-[11.5px] text-slate-500">
                <DSIcon name="lock" size={12} className="text-emerald-300/70" />
                Grátis por 30 dias · cancele quando quiser · sem cartão
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

        {/* ═══════════ Footer ═══════════ */}
        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-slate-500">
              Já tem conta?{' '}
              <Link href="/login?from=onboarding" className="font-bold text-emerald-200 transition-colors hover:text-emerald-100">
                Entrar
              </Link>
            </p>
            <span className="flex items-center gap-1.5 text-[9px] text-slate-600" style={monoLabel}>
              <DSIcon name="shieldCheck" size={12} /> SSL · LGPD
            </span>
          </div>
        </div>
      </div>

      {/* Animations — CSS-only, reduced-motion safe, content visible without JS */}
      <style>{`
        @keyframes vfitOnbRise { 0% { opacity:0; transform:translateY(14px) } 100% { opacity:1; transform:translateY(0) } }
        @keyframes vfitOnbPop  { 0% { opacity:0; transform:scale(.86) } 100% { opacity:1; transform:scale(1) } }
        @keyframes vfitOnbHalo { 0%,100% { opacity:.55 } 50% { opacity:.9 } }
        @keyframes vfitOnbPulse{ 0%,100% { opacity:.5; transform:scale(1) } 50% { opacity:.85; transform:scale(1.04) } }
        .vfit-onb-stagger > * { animation: vfitOnbRise .5s cubic-bezier(.22,1,.36,1) both }
        .vfit-onb-stagger > *:nth-child(2){ animation-delay:.06s }
        .vfit-onb-stagger > *:nth-child(3){ animation-delay:.12s }
        .vfit-onb-stagger > *:nth-child(4){ animation-delay:.18s }
        .vfit-onb-stagger > *:nth-child(5){ animation-delay:.24s }
        .vfit-onb-stagger > *:nth-child(6){ animation-delay:.30s }
        .vfit-onb-pop  { animation: vfitOnbPop .55s cubic-bezier(.22,1,.36,1) both }
        .vfit-onb-halo { animation: vfitOnbHalo 6s ease-in-out infinite }
        .vfit-onb-pulse{ animation: vfitOnbPulse 2.6s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) {
          .vfit-onb-stagger > *, .vfit-onb-pop, .vfit-onb-halo, .vfit-onb-pulse {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}
