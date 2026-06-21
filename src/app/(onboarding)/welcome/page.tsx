/**
 * src/app/(onboarding)/welcome/page.tsx
 *
 * Welcome Screen — First page of onboarding flow
 * Hero BG + VFIT branding + CTA to start quiz
 *
 * IMPORTANT: Animations are CSS-only (no JS mounted state).
 * This ensures content is visible even if React hydration is slow
 * (critical for iPhone PWA standalone mode).
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
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

const PLAN_SIGNALS: { icon: DSIconName; label: string; value: string }[] = [
  { icon: 'target', label: 'Objetivo', value: 'Emagrecer, força ou hipertrofia' },
  { icon: 'dumbbell', label: 'Estrutura', value: 'Casa, academia ou peso corporal' },
  { icon: 'clock', label: 'Tempo', value: '15, 30, 45 ou 60 minutos' },
  { icon: 'activity', label: 'Nível', value: 'Intensidade sem exagero' },
]

const RETENTION_LOOP: { icon: DSIconName; title: string; text: string }[] = [
  { icon: 'zap', title: 'Hoje', text: 'Treino claro, curto e executável.' },
  { icon: 'flame', title: 'Amanhã', text: 'Streak e lembrete para voltar.' },
  { icon: 'chart', title: 'Semana', text: 'Progresso visível para manter ritmo.' },
]

const CONVERSION_POINTS: { icon: DSIconName; title: string; text: string }[] = [
  { icon: 'sparkles', title: 'Plano no final do fluxo', text: 'Você entende seu treino antes de qualquer compromisso.' },
  { icon: 'shieldCheck', title: 'Sem fricção inicial', text: 'Sem cartão, sem planilha, sem conversa longa.' },
  { icon: 'trophy', title: 'Volta guiada', text: 'Você sempre sabe o próximo treino e a próxima vitória.' },
] as const

export default function WelcomePage() {
  const router = useRouter()
  const { reset, currentStep, isCompleted } = useOnboardingStore()
  const { isAuthenticated, isHydrated } = useAuthStore()

  // Check if there's saved progress (step > 0 and not completed)
  const hasSavedProgress = currentStep > 0 && !isCompleted

  // TWA smart entry: redirect authenticated users to dashboard
  // or trigger biometric unlock if available
  useEffect(() => {
    if (!isHydrated) return
    if (isAuthenticated) {
      const userType = useAuthStore.getState().user?.user_type
      if (userType === 'student') {
        router.replace('/treinos')
      } else if (userType === 'admin') {
        router.replace('/dashboard/admin')
      } else {
        router.replace('/dashboard')
      }
      return
    }
    // If biometric auto-unlock is enabled AND not in cooldown, redirect to login with biometric trigger
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

  const handleContinue = () => {
    router.push('/onboarding')
  }

  const handlePrimaryStudentFlow = () => {
    if (hasSavedProgress) {
      handleContinue()
      return
    }

    handleStart()
  }

  return (
    <div className="vfit-flow-bg relative flex min-h-dvh flex-col overflow-hidden text-white">
      <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-linear-to-b from-vfit-primary-500/24 via-sky-300/8 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-200/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-bg-base to-transparent" />

      {/* ─── Background image with overlay ─── */}
      <div className="absolute inset-0 opacity-78">
        <Image
          src="/images/hero-1.webp"
          alt=""
          fill
          className="object-cover object-[62%_center]"
          priority
        />
        <div className="absolute inset-0 bg-bg-base/84" />
        <div className="absolute inset-0 bg-linear-to-b from-bg-base/15 via-bg-base/70 to-bg-base" />
        <div className="absolute inset-0 bg-linear-to-r from-bg-base via-bg-base/76 to-bg-base/24" />
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-8 pt-[calc(env(safe-area-inset-top)+18px)] sm:px-8 sm:pt-[calc(env(safe-area-inset-top)+24px)] lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12 lg:pb-10 lg:pt-8">
        <div
          className="flex flex-col items-start"
          style={{ animation: 'welcome-slide-down 0.7s ease-out both' }}
        >
          <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-black uppercase text-emerald-100 shadow-glass-inset-sm backdrop-blur-xl sm:mb-5 sm:gap-3 sm:py-2 sm:text-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-bg-base">
              <DSIcon name="sparkles" size={15} />
            </span>
            30 dias grátis · sem cartão
          </div>
          <h1
            className="max-w-2xl text-[38px] leading-[1.01] text-white min-[380px]:text-[42px] sm:text-6xl lg:text-[76px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, letterSpacing: 0 }}
          >
            Seu treino pronto hoje, feito para o seu corpo.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] font-medium leading-7 text-slate-300 sm:mt-5 sm:text-lg sm:leading-8">
            Em 2 minutos o VFIT entende seu objetivo, rotina, equipamentos e nível para montar um plano que você consegue começar sem enrolar.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {TRUST_BADGES.map((badge) => (
              <span key={badge.text} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 text-[11px] font-black text-slate-200 backdrop-blur-xl">
                <DSIcon name={badge.icon} size={13} className="text-emerald-200" />
                {badge.text}
              </span>
            ))}
          </div>

          <div className="mt-6 w-full lg:hidden">
            <Button
              onClick={handlePrimaryStudentFlow}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <DSIcon name={hasSavedProgress ? 'play' : 'graduationCap'} size={18} />
              {hasSavedProgress ? 'Continuar meu plano' : 'Criar meu plano grátis'}
            </Button>

            <div className="mt-2 text-center text-xs text-white/65">
              {hasSavedProgress ? (
                <button
                  onClick={handleStart}
                  className="text-xs font-medium text-white/45 underline-offset-2 transition-colors hover:text-white/70 hover:underline"
                >
                  Recomeçar do início
                </button>
              ) : (
                <span className="text-xs text-white/55">Sem cartão · resultado no final do fluxo</span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-3 text-xs">
              <Link
                href="/register/personal?from=welcome"
                className="font-medium text-white/60 underline-offset-2 transition-colors hover:text-white hover:underline"
              >
                Sou Personal
              </Link>
              <span className="text-white/25">•</span>
              <Link
                href="/register/personal?type=nutri&from=welcome"
                className="font-medium text-white/60 underline-offset-2 transition-colors hover:text-white hover:underline"
              >
                Sou Nutricionista
              </Link>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="mt-2 w-full py-1.5 text-center text-xs font-medium text-white/50 transition-colors hover:text-white/80"
            >
              Já tenho conta · Entrar
            </button>
          </div>

          <div className="mt-8 hidden w-full max-w-xl gap-2.5 sm:grid sm:grid-cols-3">
            {CONVERSION_POINTS.map((point) => (
              <div key={point.title} className="vfit-flow-panel-soft rounded-2xl px-3 py-3">
                <DSIcon name={point.icon} size={17} className="text-emerald-200" />
                <p className="mt-2 text-[12px] font-black text-white">{point.title}</p>
                <p className="mt-1 text-[10px] font-medium leading-4 text-slate-400">{point.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-9 space-y-4 lg:mt-0"
          style={{ animation: 'welcome-slide-up 0.7s ease-out 0.25s both' }}
        >
          <div className="vfit-flow-panel overflow-hidden rounded-[32px] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase text-emerald-200">Prévia do seu plano</p>
                <h2 className="mt-1 text-[22px] font-black leading-tight text-white">A IA transforma respostas em treino.</h2>
              </div>
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/18 bg-emerald-300/10 text-emerald-200">
                <DSIcon name="brainCircuit" size={25} />
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {PLAN_SIGNALS.map((signal, i) => (
                <div
                  key={signal.label}
                  className="group rounded-2xl border border-white/9 bg-white/6 p-3 shadow-glass-inset-sm transition-all duration-300 hover:border-emerald-300/24 hover:bg-emerald-300/8"
                  style={{ animation: `welcome-slide-right 0.5s ease-out ${360 + i * 90}ms both` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-white/10 bg-white/7 text-emerald-200 transition-transform duration-300 group-hover:scale-105">
                      <DSIcon name={signal.icon} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-black text-white">{signal.label}</p>
                        <DSIcon name="check" size={14} className="text-emerald-200" />
                      </div>
                      <p className="mt-0.5 text-[11px] font-medium leading-4 text-slate-400">{signal.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-300/16 bg-emerald-300/9 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[12px] font-black text-emerald-100">Plano pronto para começar hoje</p>
                <span className="rounded-full bg-emerald-300 px-2.5 py-1 text-[10px] font-black text-bg-base">92%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[92%] rounded-full bg-linear-to-r from-emerald-300 to-lime-200 shadow-[0_0_18px_rgba(134,239,172,0.42)]" />
              </div>
              <p className="mt-3 text-[11px] font-medium leading-5 text-slate-300">Intensidade ajustada para evitar desistência na primeira semana.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {RETENTION_LOOP.map((item) => (
              <div key={item.title} className="vfit-flow-panel-soft rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/8 text-emerald-200">
                    <DSIcon name={item.icon} size={15} />
                  </span>
                  <p className="text-[12px] font-black text-white">{item.title}</p>
                </div>
                <p className="mt-2 text-[10px] font-medium leading-4 text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="vfit-flow-panel-soft rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-bg-base">
                <DSIcon name="messageCircle" size={23} />
              </div>
              <div>
                <p className="text-sm font-black text-white">“Agora eu sei exatamente o que fazer.”</p>
                <p className="text-xs text-slate-400">Você sai com direção, tempo e intensidade definidos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto hidden w-full max-w-6xl px-8 pb-10 lg:block">
        <div className="vfit-flow-panel flex items-center justify-between gap-6 rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300 text-bg-base">
              <DSIcon name="graduationCap" size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-white">Comece como aluno, sem cartão</p>
              <p className="text-xs text-slate-400">Receba um plano executável antes de decidir qualquer upgrade.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/register/personal?from=welcome" className="text-sm font-semibold text-slate-400 transition-colors hover:text-white">
              Sou Personal
            </Link>
            <Button onClick={handlePrimaryStudentFlow} size="lg">
              <DSIcon name={hasSavedProgress ? 'play' : 'sparkles'} size={18} />
              {hasSavedProgress ? 'Continuar meu plano' : 'Criar meu plano grátis'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
