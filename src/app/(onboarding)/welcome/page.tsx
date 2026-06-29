/**
 * src/app/(onboarding)/welcome/page.tsx
 *
 * Welcome Screen — VFIT (redesign "Cinematic Performance / Editorial").
 *
 * Direção: hero editorial ousado — headline gigante (Syne), fundo cinematográfico
 * (aurora + grain + grid + ghost wordmark), e o "device" do PLANO IA flutuando em
 * 3D com chips orbitando. Pegada Vibrant Energy (verde→lima sobre navy).
 *
 * IMPORTANT: animações são CSS-only (sem JS/framer-motion) — o conteúdo aparece
 * mesmo com hidratação lenta (crítico para PWA standalone no iPhone).
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { supportsPasskey, getPasskeyEmail, isBiometricAutoUnlockEnabled, isBiometricInCooldown } from '@/hooks/use-passkey'
import Link from 'next/link'

const TRUST_BADGES: { icon: DSIconName; text: string }[] = [
  { icon: 'shieldCheck', text: 'Sem cartão' },
  { icon: 'clock', text: '2 minutos' },
  { icon: 'lock', text: 'Dados protegidos' },
]

/* Sinais do plano (device IA) */
const PLAN_SIGNALS: { icon: DSIconName; label: string; value: string }[] = [
  { icon: 'target', label: 'Objetivo', value: 'Emagrecer, força ou hipertrofia' },
  { icon: 'dumbbell', label: 'Estrutura', value: 'Casa, academia ou peso corporal' },
  { icon: 'clock', label: 'Tempo', value: '15, 30, 45 ou 60 minutos' },
  { icon: 'activity', label: 'Nível', value: 'Intensidade na medida certa' },
]

/* Chips que orbitam o device */
const ORBIT_CHIPS: { icon: DSIconName; label: string; pos: string; anim: string }[] = [
  { icon: 'clock', label: '45 min', pos: '-left-5 top-16 sm:-left-9', anim: 'wl-float-a' },
  { icon: 'flame', label: '3x / semana', pos: '-right-4 top-1/3 sm:-right-8', anim: 'wl-float-b' },
  { icon: 'brainCircuit', label: 'IA adapta', pos: 'bottom-10 -left-4 sm:-left-7', anim: 'wl-float-c' },
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

  return (
    <div className="vfit-energy-bg wl-grain relative flex min-h-dvh flex-col overflow-hidden text-white">
      {/* ─── Atmosfera cinematográfica ─── */}
      <div className="vfit-flow-grid pointer-events-none absolute inset-0 opacity-70" />
      <div aria-hidden className="welcome-orb1 pointer-events-none absolute -left-40 -top-28 h-[30rem] w-[30rem] rounded-full bg-emerald-500/20 blur-[150px]" />
      <div aria-hidden className="welcome-orb2 pointer-events-none absolute -right-32 top-1/4 h-[26rem] w-[26rem] rounded-full bg-lime-400/14 blur-[150px]" />
      {/* bloom focal atrás do device (foco + drama) */}
      <div aria-hidden className="pointer-events-none absolute right-[6%] top-[42%] h-[44rem] w-[44rem] -translate-y-1/2 rounded-full bg-emerald-500/16 blur-[150px]" />
      {/* vinheta cinematográfica nos cantos */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 78% 62% at 42% 38%, transparent 32%, rgba(2,6,14,0.62) 100%)' }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-300/45 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-bg-base via-bg-base/70 to-transparent" />
      {/* ghost wordmark gigante (profundidade editorial) */}
      <span aria-hidden className="wl-ghost font-syne pointer-events-none absolute -bottom-10 -left-6 select-none text-[28vw] font-black leading-none tracking-tighter text-white/[0.018] sm:-bottom-24 lg:text-[20vw]">VFIT</span>

      {/* ─── Top bar minimalista ─── */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+16px)] sm:px-8">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicons/favicon.svg" alt="" width={34} height={34} className="h-8.5 w-8.5 rounded-xl shadow-[0_8px_22px_-8px_rgba(34,197,94,0.7)]" />
          <span className="font-syne text-lg font-black tracking-tight text-white">VFIT</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link href="/register/personal?from=welcome" className="hidden rounded-full px-3 py-2 text-[13px] font-semibold text-white/60 transition-colors hover:text-white sm:block">
            Sou Personal
          </Link>
          <button onClick={() => router.push('/login')} className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[13px] font-bold text-white/85 backdrop-blur-xl transition-all hover:border-emerald-300/40 hover:text-white">
            Entrar
          </button>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-10 pt-8 sm:px-8 sm:pt-10 lg:grid lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-10 lg:pt-6">
        {/* ── Coluna esquerda: copy + CTA ── */}
        <div className="wl-stagger flex flex-col items-start">
          {/* kicker */}
          <span className="group/k relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-emerald-300/25 bg-emerald-400/[0.06] py-1.5 pl-2 pr-4 backdrop-blur-xl">
            <span className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-2.5 py-1" style={{ background: 'linear-gradient(135deg,#22c55e,#15803d)', boxShadow: '0 4px 16px -3px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.35)' }}>
              <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-linear-to-r from-transparent via-white/40 to-transparent group-hover/k:translate-x-[120%] [transition:transform_0.7s]" />
              <DSIcon name="sparkles" size={11} className="relative text-[#08122B]" />
              <span className="relative text-[10px] font-black uppercase tracking-[0.1em] text-[#08122B]">Plano IA</span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-100/80">30 dias grátis · sem cartão</span>
          </span>

          {/* headline gigante */}
          <h1 className="font-syne mt-6 text-[clamp(3.4rem,11vw,7.2rem)] font-black leading-[0.9] tracking-[-0.04em] text-white [text-shadow:0_4px_40px_rgba(0,0,0,0.55)]">
            Seu treino
            <br />
            pronto hoje,
            <br />
            <span className="wl-kinetic">no seu corpo.</span>
          </h1>

          <p className="mt-6 max-w-md text-[15px] font-medium leading-7 text-slate-300/90 sm:text-[17px] sm:leading-8">
            Em 2 minutos a IA do VFIT lê seu objetivo, rotina, equipamentos e nível —
            e entrega um plano que você <span className="font-bold text-white">começa sem enrolar</span>.
          </p>

          {/* CTA */}
          <div className="mt-8 w-full max-w-md">
            <button
              onClick={handlePrimaryStudentFlow}
              className="group/cta relative inline-flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl pl-7 pr-3 text-[15px] font-black uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] [text-shadow:0_1px_2px_rgba(2,44,34,0.5)]"
              style={{ background: 'linear-gradient(135deg,#2BD24E 0%,#16a34a 52%,#15803d 100%)', boxShadow: '0 18px 44px -10px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(6,78,59,0.5)' }}
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-linear-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover/cta:translate-x-[130%]" />
              <DSIcon name={hasSavedProgress ? 'play' : 'sparkles'} size={19} className="relative z-10" />
              <span className="relative z-10">{hasSavedProgress ? 'Continuar meu plano' : 'Criar meu plano grátis'}</span>
              <span className="relative z-10 ml-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#08122B]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <DSIcon name="arrowRight" size={18} className="text-[#4ADE80] transition-transform duration-300 group-hover/cta:translate-x-0.5" />
              </span>
            </button>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <span className="text-[12px] font-medium text-white/55">30 dias grátis · tudo liberado · sem cartão</span>
              {hasSavedProgress && (
                <button onClick={handleStart} className="text-[12px] font-semibold text-white/45 underline-offset-2 transition-colors hover:text-white/75 hover:underline">
                  Recomeçar do início
                </button>
              )}
            </div>
          </div>

          {/* trust + papéis */}
          <div className="mt-7 flex flex-wrap items-center gap-2">
            {TRUST_BADGES.map((b) => (
              <span key={b.text} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 text-[11.5px] font-bold text-slate-200 backdrop-blur-xl">
                <DSIcon name={b.icon} size={13} className="text-emerald-300" />
                {b.text}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3 text-[12.5px] sm:hidden">
            <Link href="/register/personal?from=welcome" className="font-semibold text-white/60 underline-offset-2 hover:text-white hover:underline">Sou Personal</Link>
            <span className="text-white/20">•</span>
            <Link href="/register/personal?type=nutri&from=welcome" className="font-semibold text-white/60 underline-offset-2 hover:text-white hover:underline">Sou Nutricionista</Link>
          </div>
        </div>

        {/* ── Coluna direita: DEVICE do plano IA (3D float) ── */}
        <div className="wl-device-stage relative mt-12 flex justify-center lg:mt-0">
          {/* chips orbitando */}
          {ORBIT_CHIPS.map((c) => (
            <span
              key={c.label}
              className={`${c.anim} ${c.pos} absolute z-20 hidden lg:inline-flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-bg-base/70 px-3 py-2 text-[11.5px] font-black text-emerald-100 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-xl`}
            >
              <DSIcon name={c.icon} size={14} className="text-emerald-300 [filter:drop-shadow(0_0_6px_rgba(52,211,153,0.6))]" />
              {c.label}
            </span>
          ))}

          <div className="wl-device-tilt relative w-full max-w-md">
            <div className="wl-device relative overflow-hidden rounded-[28px] border border-white/10 p-5 sm:p-6" style={{ background: 'linear-gradient(160deg, rgba(16,28,52,0.92) 0%, rgba(7,16,32,0.88) 60%, rgba(5,10,18,0.9) 100%)', boxShadow: '0 50px 120px -40px rgba(0,0,0,0.85), 0 0 0 1px rgba(52,211,153,0.08), inset 0 1px 0 rgba(255,255,255,0.12)' }}>
              {/* borda-gradiente viva */}
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[28px]" style={{ padding: '1px', background: 'linear-gradient(135deg, rgba(52,211,153,0.6) 0%, rgba(132,204,22,0.22) 45%, transparent 72%)', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
              <span aria-hidden className="vfit-energy-beam rounded-[28px]" />
              <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/18 blur-[60px]" />

              {/* header */}
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300/80">Prévia do seu plano</p>
                  <h2 className="font-syne mt-1 text-[22px] font-black leading-[1.05] text-white">A IA vira respostas<br />em treino.</h2>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/30 text-emerald-200" style={{ background: 'linear-gradient(180deg, rgba(52,211,153,0.28), rgba(34,197,94,0.06))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 20px -6px rgba(34,197,94,0.6)' }}>
                  <DSIcon name="brainCircuit" size={24} className="[filter:drop-shadow(0_0_8px_rgba(52,211,153,0.7))]" />
                </span>
              </div>

              {/* sinais */}
              <div className="relative mt-5 space-y-2">
                {PLAN_SIGNALS.map((s, i) => (
                  <div key={s.label} className="wl-row flex items-center gap-3 rounded-2xl border border-white/8 px-3 py-2.5" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.018))', animationDelay: `${0.5 + i * 0.12}s` }}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/20 text-emerald-200" style={{ background: 'linear-gradient(180deg, rgba(52,211,153,0.18), rgba(34,197,94,0.04))' }}>
                      <DSIcon name={s.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-black text-white">{s.label}</span>
                      <span className="block text-[11px] font-medium leading-4 text-slate-400">{s.value}</span>
                    </span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-bg-base" style={{ background: 'linear-gradient(135deg,#34e565,#16a34a)', boxShadow: '0 3px 10px -1px rgba(34,197,94,0.6)' }}>
                      <DSIcon name="check" size={13} />
                    </span>
                  </div>
                ))}
              </div>

              {/* barra pronto */}
              <div className="relative mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-400/[0.07] p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-[12px] font-black text-emerald-100">Plano pronto pra começar hoje</p>
                  <span className="rounded-full bg-emerald-300 px-2.5 py-0.5 text-[11px] font-black text-bg-base">92%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className="wl-fill h-full w-[92%] rounded-full bg-linear-to-r from-emerald-300 via-lime-200 to-emerald-300 shadow-[0_0_18px_rgba(134,239,172,0.5)]" />
                </div>
                <p className="mt-3 text-[11px] font-medium leading-5 text-slate-300/90">Intensidade calibrada pra você não desistir na primeira semana.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Faixa de prova/benefício (rodapé do hero) ─── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-[max(env(safe-area-inset-bottom),20px)] sm:px-8">
        <div className="wl-band flex flex-wrap items-center justify-center gap-x-7 gap-y-3 rounded-3xl border border-white/8 bg-white/[0.03] px-5 py-4 backdrop-blur-xl sm:justify-between">
          {[
            { icon: 'zap' as DSIconName, k: 'Hoje', v: 'Treino claro e executável' },
            { icon: 'flame' as DSIconName, k: 'Amanhã', v: 'Streak pra você voltar' },
            { icon: 'chart' as DSIconName, k: 'Semana', v: 'Progresso visível' },
            { icon: 'trophy' as DSIconName, k: 'Sempre', v: 'Sem cartão, sem trava' },
          ].map((b) => (
            <div key={b.k} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/22 text-emerald-200" style={{ background: 'linear-gradient(180deg, rgba(52,211,153,0.18), rgba(34,197,94,0.04))' }}>
                <DSIcon name={b.icon} size={17} />
              </span>
              <span>
                <span className="block text-[12.5px] font-black text-white">{b.k}</span>
                <span className="block text-[11px] font-medium text-slate-400">{b.v}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Animações (CSS-only, reduced-motion safe) ─── */}
      <style>{`
        .wl-grain::after {
          content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
          opacity: 0.05; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        @keyframes wlRise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .wl-stagger > * { animation: wlRise 0.75s cubic-bezier(0.22,1,0.36,1) both; }
        .wl-stagger > *:nth-child(1) { animation-delay: 0.05s; }
        .wl-stagger > *:nth-child(2) { animation-delay: 0.13s; }
        .wl-stagger > *:nth-child(3) { animation-delay: 0.21s; }
        .wl-stagger > *:nth-child(4) { animation-delay: 0.29s; }
        .wl-stagger > *:nth-child(5) { animation-delay: 0.37s; }
        .wl-stagger > *:nth-child(6) { animation-delay: 0.45s; }

        /* kinetic accent word */
        .wl-kinetic {
          background: linear-gradient(100deg, #4ade80 0%, #a3e635 26%, #86efac 52%, #22c55e 100%);
          background-size: 220% auto;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: wlSheen 4.5s linear infinite;
          text-shadow: none;
        }
        @keyframes wlSheen { to { background-position: 220% center; } }

        /* device: aparição + tilt 3D + float */
        .wl-device-stage { perspective: 1400px; }
        .wl-device-tilt {
          transform-style: preserve-3d;
          animation: wlDeviceIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s both;
        }
        @keyframes wlDeviceIn { from { opacity: 0; transform: translateY(34px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (min-width: 1024px) {
          .wl-device { animation: wlTilt 9s ease-in-out 1.1s infinite; will-change: transform; }
        }
        @keyframes wlTilt {
          0%, 100% { transform: rotateX(9deg) rotateY(-17deg) translateY(0) translateZ(0); }
          50%      { transform: rotateX(6deg) rotateY(-11deg) translateY(-20px) translateZ(36px); }
        }
        .wl-row { animation: wlRise 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .wl-fill { transform-origin: left; animation: wlFill 1.2s cubic-bezier(0.16,1,0.3,1) 0.9s both; }
        @keyframes wlFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }

        /* chips orbitando */
        .wl-float-a, .wl-float-b, .wl-float-c { animation: wlChipIn 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .wl-float-a { animation: wlChipIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.7s both, wlFloat 5.5s ease-in-out 1.4s infinite; }
        .wl-float-b { animation: wlChipIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.85s both, wlFloat 6.5s ease-in-out 1.6s infinite reverse; }
        .wl-float-c { animation: wlChipIn 0.7s cubic-bezier(0.22,1,0.36,1) 1s both, wlFloat 7s ease-in-out 1.8s infinite; }
        @keyframes wlChipIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
        @keyframes wlFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

        .wl-band { animation: wlRise 0.8s cubic-bezier(0.22,1,0.36,1) 0.5s both; }
        .wl-ghost { animation: wlRise 1.2s ease-out 0.2s both; }

        @media (prefers-reduced-motion: reduce) {
          .wl-stagger > *, .wl-device-tilt, .wl-device, .wl-row, .wl-fill,
          .wl-float-a, .wl-float-b, .wl-float-c, .wl-band, .wl-ghost, .wl-kinetic {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .wl-kinetic { color: #86efac !important; }
        }
      `}</style>
    </div>
  )
}
