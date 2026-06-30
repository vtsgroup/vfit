/**
 * src/app/(onboarding)/welcome/page.tsx
 *
 * Welcome Screen — VFIT "BROADCAST" (placar de arena tipográfico / editorial brutalista).
 *
 * Direção: a tela é um PLACAR DE TRANSMISSÃO. Tipografia gigante (Syne) como manchete de
 * arena, aparato de revista em mono (Space Grotesk), numerais outline como peso de placar,
 * e UMA única superfície sólida de cor — a barra-CTA verde→lima. Sem cards, sem device 3D,
 * sem aurora difusa: leitura em <2s, hierarquia brutal, conversão no único ponto que brilha.
 *
 * IMPORTANT: animações 100% CSS (sem JS/framer-motion) — aparece mesmo com hidratação lenta
 * (crítico p/ PWA standalone no iPhone). overflow-x-hidden + reduced-motion com estado final
 * sempre visível. Lógica de auth/onboarding preservada integralmente.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { VfitAnimatedMark } from '@/components/ui/vfit-animated-mark'
import { useAuthStore } from '@/stores/auth-store'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { supportsPasskey, getPasskeyEmail, isBiometricAutoUnlockEnabled, isBiometricInCooldown } from '@/hooks/use-passkey'

/* Box-score: a IA "ligando" o plano — prova viva, não promessa */
const PLAN_SIGNALS: { icon: DSIconName; label: string; value: string }[] = [
  { icon: 'target', label: 'Objetivo', value: 'Emagrecer, força ou hipertrofia' },
  { icon: 'dumbbell', label: 'Estrutura', value: 'Casa, academia ou peso corporal' },
  { icon: 'clock', label: 'Tempo', value: '15, 30, 45 ou 60 minutos' },
  { icon: 'activity', label: 'Nível', value: 'Intensidade na medida certa' },
]

/* Expediente / colofão — ficha técnica do produto */
const COLOFAO: { k: string; v: string }[] = [
  { k: 'Hoje', v: 'Treino claro e executável' },
  { k: 'Amanhã', v: 'Streak pra você voltar' },
  { k: 'Semana', v: 'Progresso visível' },
  { k: 'Sempre', v: 'Sem cartão, sem trava' },
]

const TRUST: { icon: DSIconName; text: string }[] = [
  { icon: 'shieldCheck', text: 'Sem cartão' },
  { icon: 'clock', text: '2 min de setup' },
  { icon: 'lock', text: 'Dados protegidos' },
]

export default function WelcomePage() {
  const router = useRouter()
  const { reset, currentStep, isCompleted } = useOnboardingStore()
  const { isAuthenticated, isHydrated } = useAuthStore()

  const hasSavedProgress = currentStep > 0 && !isCompleted

  // TWA smart entry: usuários logados → dashboard; biometria → login
  useEffect(() => {
    if (!isHydrated) return
    if (isAuthenticated) {
      const userType = useAuthStore.getState().user?.user_type
      if (userType === 'student') router.replace('/treinos')
      else if (userType === 'admin') router.replace('/dashboard/admin')
      else router.replace('/dashboard')
      return
    }
    const email = getPasskeyEmail()
    const autoUnlock = isBiometricAutoUnlockEnabled()
    if (autoUnlock && email && supportsPasskey() && !isBiometricInCooldown()) {
      router.replace('/login?biometric=auto')
    }
  }, [isHydrated, isAuthenticated, router])

  const handleStart = () => {
    reset()
    router.push('/onboarding')
  }
  const handleContinue = () => router.push('/onboarding')
  const handlePrimaryStudentFlow = () => {
    if (hasSavedProgress) handleContinue()
    else handleStart()
  }

  const ctaLabel = hasSavedProgress ? 'Continuar meu plano' : 'Criar meu plano grátis'
  const ctaIcon: DSIconName = hasSavedProgress ? 'play' : 'sparkles'

  const CtaBar = ({ fixed = false }: { fixed?: boolean }) => (
    <button
      onClick={handlePrimaryStudentFlow}
      aria-label={ctaLabel}
      className="bc-cta group/cta relative flex h-16 w-full items-center gap-3 overflow-hidden rounded-md pl-5 pr-2 text-[#06210f] outline-none transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-lime-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04080f]"
      style={{ background: 'linear-gradient(135deg,#a3e635 0%,#34e565 48%,#16a34a 100%)' }}
    >
      <span aria-hidden className={`bc-cta-sweep ${fixed ? 'bc-cta-sweep--fixed' : ''}`} />
      <DSIcon name={ctaIcon} size={20} className="relative z-10 shrink-0" />
      <span className="bc-jumbo-font relative z-10 text-[15px] font-black uppercase tracking-tight sm:text-[18px]">{ctaLabel}</span>
      <span className="relative z-10 ml-auto flex h-12 shrink-0 items-center gap-2 rounded bg-[#06210f] pl-3 pr-3 text-lime-300">
        <span className="bc-mono text-[10px] font-bold uppercase tracking-[0.18em] text-lime-200/90">2 min</span>
        <DSIcon name="arrowRight" size={18} className="transition-transform duration-200 group-hover/cta:translate-x-0.5" />
      </span>
    </button>
  )

  return (
    <div className="bc-root relative flex min-h-dvh flex-col overflow-x-hidden bg-[#04080f] pb-[140px] text-white lg:pb-0">
      {/* atmosfera "impressa": grade técnica seca + sheen no topo (sem orbs/aurora) */}
      <div aria-hidden className="vfit-flow-grid pointer-events-none absolute inset-0 opacity-[0.22]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-lime-300/40 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 80% -10%, rgba(34,197,94,0.10), transparent 55%)' }} />

      {/* ─── FAIXA 0 · MASTHEAD ─── */}
      <header
        className="bc-mast sticky top-0 z-40 border-b border-lime-400/20 bg-[#04080f]/85 backdrop-blur-md"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:px-7">
          <i aria-hidden className="bc-hr bc-hr-mast" />
          <div className="flex min-w-0 items-center gap-2.5">
            <VfitAnimatedMark size={28} className="shrink-0" />
            <span className="bc-mono text-[13px] font-bold uppercase tracking-[0.3em] text-white">VFIT</span>
            <span className="bc-mono hidden truncate text-[10px] uppercase tracking-[0.2em] text-lime-300/70 sm:inline">Nº 01 · Edição Atleta</span>
          </div>
          <span className="bc-mono hidden text-[10px] uppercase tracking-[0.32em] text-white/35 lg:block">Edição Jun · 2026</span>
          <nav className="bc-mono flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] sm:gap-2">
            <Link href="/register/personal?from=welcome" className="hidden items-center px-2 py-2.5 font-semibold text-white/50 transition-colors hover:text-white sm:flex">Sou Personal</Link>
            <span aria-hidden className="hidden h-3 w-px bg-white/15 sm:block" />
            <Link href="/register/personal?type=nutri&from=welcome" className="hidden items-center px-2 py-2.5 font-semibold text-white/50 transition-colors hover:text-white sm:flex">Sou Nutri</Link>
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-1 rounded border border-white/15 bg-white/[0.04] px-3 py-2 font-bold text-white/90 transition-colors hover:border-lime-300/50 hover:text-white"
            >
              Entrar <span aria-hidden className="text-lime-300">→</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        {/* ─── FAIXA 1 · A BOMBA ─── */}
        <section className="bc-bomba relative overflow-hidden px-4 pb-8 pt-9 sm:px-7 sm:pt-12">
          {/* numeral índice gigante (marca d'água editorial) */}
          <span aria-hidden className="bc-index bc-jumbo-font">01</span>
          {/* lombada vertical */}
          <span aria-hidden className="bc-vert bc-mono hidden text-[10px] uppercase tracking-[0.4em] text-lime-300/45 sm:block">Fitness · IA · Performance</span>

          {/* kicker */}
          <p className="bc-rise bc-mono relative z-10 mb-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lime-300/90">
            <span aria-hidden className="bc-livedot inline-block h-2 w-2 rounded-full bg-lime-400" />
            Plano IA · 30 dias grátis · sem cartão
          </p>

          {/* manchete-placar */}
          <h1 className="bc-jumbo bc-jumbo-font relative z-10 font-black uppercase">
            <span className="bc-line block">Seu treino</span>
            <span className="bc-line bc-outline block">pronto</span>
            <span className="bc-line bc-line3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>hoje</span>
              <span aria-hidden className="bc-clock" title="Setup em ~2 minutos">
                <span>02</span>
                <span className="bc-clock-colon">:</span>
                <span>00</span>
              </span>
            </span>
          </h1>

          {/* stat de capa: 30 DIAS */}
          <div className="bc-rise relative z-10 mt-7 flex items-end gap-4">
            <span aria-hidden className="bc-thirty bc-jumbo-font font-black leading-none">30</span>
            <span className="bc-mono pb-1 text-[11px] font-bold uppercase leading-4 tracking-[0.18em] text-white/70">
              dias grátis<br />
              <span className="text-lime-300/90">tudo liberado · sem cartão</span>
            </span>
          </div>
        </section>

        {/* ─── FAIXA 2 · DECK / PROVA VIVA ─── */}
        <section className="bc-deck relative grid grid-cols-2 border-y border-lime-400/15 lg:grid-cols-4">
          <i aria-hidden className="bc-hr bc-hr-deck" />
          {PLAN_SIGNALS.map((s, i) => (
            <div
              key={s.label}
              className={`bc-cell relative flex flex-col gap-2.5 border-white/8 px-4 py-5 sm:px-5 sm:py-6 ${i % 2 === 1 ? 'bg-emerald-900/15' : ''} ${i < 2 ? 'border-b' : ''} ${i % 2 === 0 ? 'border-r' : ''} lg:border-b-0`}
              style={{ animationDelay: `${0.45 + i * 0.12}s` }}
            >
              <div className="flex items-center justify-between">
                <span className="bc-mono text-[11px] font-bold tracking-[0.2em] text-lime-300/60">0{i + 1}</span>
                <span aria-hidden className="bc-dot relative flex h-4 w-4 items-center justify-center rounded-full" style={{ animationDelay: `${0.7 + i * 0.12}s` }}>
                  <DSIcon name="check" size={9} className="bc-dot-check text-[#06210f]" style={{ animationDelay: `${0.95 + i * 0.12}s` }} />
                </span>
              </div>
              <DSIcon name={s.icon} size={20} className="text-emerald-300" />
              <div>
                <h2 className="bc-jumbo-font text-[15px] font-extrabold uppercase tracking-tight text-white sm:text-[17px]">{s.label}</h2>
                <p className="mt-0.5 text-[12px] leading-4 text-slate-400">{s.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ─── FAIXA 3 · HANDOFF + CTA (inline desktop) ─── */}
        <section className="relative px-4 py-8 sm:px-7 sm:py-9">
          <span className="bc-chip bc-mono mb-4 inline-flex items-center gap-2 rounded-sm border border-lime-400/40 bg-lime-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-lime-200">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lime-400" />
            Pronto pra hoje
          </span>

          <div className="hidden lg:block">
            <CtaBar />
          </div>

          <p className="bc-mono mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
            <span className="text-lime-300/70">Sem cartão</span> · Tudo liberado · Cancela quando quiser
            {hasSavedProgress && (
              <button onClick={handleStart} className="ml-1 font-bold text-white/55 underline-offset-2 transition-colors hover:text-white hover:underline">
                · Recomeçar do início
              </button>
            )}
          </p>
        </section>

        {/* ─── FAIXA 4 · EXPEDIENTE ─── */}
        <footer className="bc-rise relative mt-auto border-t border-white/10 px-4 py-7 sm:px-7">
          <div className="grid grid-cols-2 gap-x-5 gap-y-5 lg:grid-cols-4">
            {COLOFAO.map((c) => (
              <div key={c.k} className="flex flex-col gap-0.5">
                <span className="bc-mono text-[10px] font-bold uppercase tracking-[0.22em] text-lime-300/80">{c.k}</span>
                <span className="text-[12px] leading-4 text-slate-400">{c.v}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/8 pt-5">
            {TRUST.map((t) => (
              <span key={t.text} className="bc-mono inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                <DSIcon name={t.icon} size={13} className="text-emerald-300" />
                {t.text}
              </span>
            ))}
            <span className="bc-mono ml-auto flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-white/40 sm:hidden">
              <Link href="/register/personal?from=welcome" className="hover:text-white">Sou Personal</Link>
              <Link href="/register/personal?type=nutri&from=welcome" className="hover:text-white">Sou Nutri</Link>
            </span>
          </div>
        </footer>
      </main>

      {/* ─── CTA fixo (mobile) — sempre no polegar, acima da safe-area ─── */}
      <div
        className="bc-cta-fixed fixed inset-x-0 bottom-0 z-50 border-t border-lime-400/25 bg-[#04080f]/90 px-4 pt-3 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
      >
        <CtaBar fixed />
      </div>

      {/* ─── Animações (CSS-only · reduced-motion safe) ─── */}
      <style>{`
        .bc-mono { font-family: var(--font-space-grotesk), 'Space Grotesk', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
        .bc-jumbo-font { font-family: var(--font-ds-display), var(--font-syne), 'Syne', sans-serif; }

        /* manchete-placar */
        .bc-jumbo { font-size: clamp(2.9rem, 15vw, 10.5rem); line-height: 0.84; letter-spacing: -0.045em; text-shadow: 0 6px 40px rgba(0,0,0,0.5); }
        .bc-line { padding-bottom: 0.04em; }
        .bc-line, .bc-thirty, .bc-index { clip-path: inset(0 0 -12% 0); }
        .bc-line { animation: bcSlam 0.85s cubic-bezier(0.22,1,0.36,1) both; }
        .bc-line:nth-child(1) { animation-delay: 0.08s; }
        .bc-line:nth-child(2) { animation-delay: 0.20s; }
        .bc-line:nth-child(3) { animation-delay: 0.32s; }

        /* acento lima sólido. NÃO usar -webkit-text-stroke em LETRAS na Syne: os glifos
           têm contornos internos não-mesclados (N vira "raio", P ganha marca interna).
           Numerais (30/01) saem limpos vazados — só letras quebram. Sólido = limpo + legível. */
        .bc-outline { color: #a3e635; text-shadow: 0 6px 34px rgba(132,204,22,0.28); }

        /* cronômetro de DURAÇÃO (não conta — só pisca o ':') */
        .bc-clock {
          display: inline-flex; align-items: center; gap: 0.06em;
          font-size: clamp(1.6rem, 6vw, 4rem); line-height: 1;
          background: #22c55e; color: #06210f; padding: 0.06em 0.22em 0.1em;
          border-radius: 0.12em; box-shadow: 0 10px 30px -8px rgba(34,197,94,0.7), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .bc-clock-colon { animation: bcBlink 1s steps(1) infinite; }
        @keyframes bcBlink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0.32; } }

        /* numeral índice marca d'água */
        .bc-index {
          position: absolute; top: -3vw; right: -1.5vw; z-index: 0; pointer-events: none; user-select: none;
          font-size: clamp(11rem, 42vw, 30rem); line-height: 0.78; font-weight: 800;
          color: rgba(132,204,22,0.07); -webkit-text-stroke: 1.5px rgba(132,204,22,0.22); -webkit-text-fill-color: transparent;
          animation: bcIndexIn 1s ease-out 0.1s both;
        }
        @keyframes bcIndexIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }

        /* lombada vertical */
        .bc-vert { position: absolute; left: 0.3rem; top: 50%; transform: translateY(-50%) rotate(180deg); writing-mode: vertical-rl; z-index: 0; }

        /* numeral 30 outline */
        .bc-thirty {
          font-size: clamp(3rem, 13vw, 7.5rem); letter-spacing: 0.02em;
          color: #a3e635; -webkit-text-stroke: 2.25px #a3e635; -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 6px 26px rgba(132,204,22,0.25));
          animation: bcSlam 0.85s cubic-bezier(0.22,1,0.36,1) 0.42s both;
        }

        @keyframes bcSlam { from { clip-path: inset(108% 0 -12% 0); } to { clip-path: inset(0 0 -12% 0); } }

        .bc-rise { animation: bcRise 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .bc-rise:nth-of-type(1) { animation-delay: 0.05s; }
        @keyframes bcRise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }

        /* hairlines "ligando" (placar acendendo) */
        .bc-hr { position: absolute; left: 0; right: 0; bottom: -1px; height: 1.5px; transform: scaleX(0); transform-origin: left; background: linear-gradient(90deg, transparent, rgba(132,204,22,0.6), transparent); }
        .bc-hr-mast { animation: bcRule 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .bc-hr-deck { top: -1px; bottom: auto; animation: bcRule 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
        @keyframes bcRule { to { transform: scaleX(1); } }

        /* live dot na masthead/kicker */
        .bc-livedot { box-shadow: 0 0 0 0 rgba(163,230,53,0.6); animation: bcPing 2.4s ease-out infinite; }
        @keyframes bcPing { 0% { box-shadow: 0 0 0 0 rgba(163,230,53,0.5); } 70%,100% { box-shadow: 0 0 0 7px rgba(163,230,53,0); } }

        /* deck: células ligando em cascata */
        .bc-cell { animation: bcCellIn 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes bcCellIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .bc-dot { background: #fbbf24; animation: bcDotArm 0.5s ease-out both; box-shadow: 0 0 0 0 rgba(251,191,36,0.5); }
        @keyframes bcDotArm { from { background: #fbbf24; box-shadow: 0 0 8px 0 rgba(251,191,36,0.5); } to { background: #22c55e; box-shadow: 0 0 12px 0 rgba(34,197,94,0.75); } }
        .bc-dot-check { opacity: 0; animation: bcCheckPop 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes bcCheckPop { 0% { opacity: 0; transform: scale(0.3); } 70% { opacity: 1; transform: scale(1.15); } 100% { opacity: 1; transform: scale(1); } }

        /* chip handoff */
        .bc-chip { animation: bcChipSnap 0.5s cubic-bezier(0.22,1,0.36,1) 1.45s both; }
        @keyframes bcChipSnap { 0% { opacity: 0; transform: scale(0.85); } 60% { opacity: 1; transform: scale(1.06); } 100% { opacity: 1; transform: scale(1); } }

        /* CTA: sweep mecânico + respiração emissiva (único ponto vivo) */
        .bc-cta { box-shadow: 0 18px 44px -12px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.45); animation: bcBreathe 3.4s ease-in-out 1.8s infinite; }
        @keyframes bcBreathe { 0%,100% { box-shadow: 0 16px 40px -14px rgba(34,197,94,0.45), inset 0 1px 0 rgba(255,255,255,0.45); } 50% { box-shadow: 0 24px 60px -10px rgba(132,204,22,0.7), inset 0 1px 0 rgba(255,255,255,0.5); } }
        .bc-cta-sweep { position: absolute; inset: 0; z-index: 5; pointer-events: none; background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%); transform: translateX(-130%) skewX(-18deg); animation: bcSweep 3.6s ease-in-out 2s infinite; }
        .bc-cta-sweep--fixed { animation-delay: 2.4s; }
        .bc-cta:hover .bc-cta-sweep { animation-duration: 1.1s; }
        @keyframes bcSweep { 0% { transform: translateX(-130%) skewX(-18deg); } 60%,100% { transform: translateX(260%) skewX(-18deg); } }

        .bc-cta-fixed { animation: bcRise 0.6s cubic-bezier(0.22,1,0.36,1) 1.2s both; }

        @media (max-width: 639px) {
          .bc-jumbo { font-size: clamp(2.9rem, 16vw, 5rem); }
          .bc-index { font-size: 58vw; top: -2vw; }
        }

        @media (prefers-reduced-motion: reduce) {
          .bc-line, .bc-thirty, .bc-index, .bc-rise, .bc-hr, .bc-cell, .bc-dot, .bc-dot-check,
          .bc-chip, .bc-cta, .bc-cta-sweep, .bc-cta-fixed, .bc-clock-colon, .bc-livedot {
            animation: none !important;
          }
          .bc-line, .bc-thirty, .bc-index { clip-path: none !important; }
          .bc-rise, .bc-cell, .bc-chip, .bc-cta-fixed, .bc-dot-check { opacity: 1 !important; transform: none !important; }
          .bc-hr { transform: scaleX(1) !important; }
          .bc-dot { background: #22c55e !important; box-shadow: 0 0 10px 0 rgba(34,197,94,0.6) !important; }
          .bc-clock-colon { opacity: 1 !important; }
        }
      `}</style>
    </div>
  )
}
