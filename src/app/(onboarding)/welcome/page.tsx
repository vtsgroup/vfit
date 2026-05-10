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

const FEATURES: { icon: DSIconName; text: string }[] = [
  { icon: 'target', text: 'Plano personalizado por IA' },
  { icon: 'chart', text: 'Progresso em tempo real' },
  { icon: 'trophy', text: 'Gamificação + Streaks' },
  { icon: 'zap', text: 'Treinos de 15 a 60 min' },
]

const FLOW_STATS = [
  { value: '2 min', label: 'para montar seu plano' },
  { value: '16', label: 'sinais analisados' },
  { value: 'IA', label: 'adaptação contínua' },
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-b from-white/8 to-transparent" />

      {/* ─── Background image with overlay ─── */}
      <div className="absolute inset-0 opacity-75">
        <Image
          src="/images/hero-1.webp"
          alt=""
          fill
          className="object-cover object-[58%_center]"
          priority
        />
        <div className="absolute inset-0 bg-bg-base/82" />
        <div className="absolute inset-0 bg-linear-to-b from-bg-base/20 via-bg-base/75 to-bg-base" />
        <div className="absolute inset-0 bg-linear-to-r from-bg-base via-bg-base/70 to-bg-base/20" />
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-10 pt-[calc(env(safe-area-inset-top)+18px)] sm:px-8 sm:pt-[calc(env(safe-area-inset-top)+24px)] lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-12 lg:pt-8">
        <div
          className="flex flex-col items-start"
          style={{ animation: 'welcome-slide-down 0.7s ease-out both' }}
        >
          <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-bold uppercase text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl sm:mb-5 sm:gap-3 sm:py-2 sm:text-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-bg-base">
              <DSIcon name="sparkles" size={15} />
            </span>
            Quiz inteligente VFIT
          </div>
          <h1
            className="max-w-xl text-[36px] leading-[1.02] text-white min-[380px]:text-[38px] sm:text-6xl lg:text-7xl"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, letterSpacing: 0 }}
          >
            Seu plano começa com uma leitura precisa do seu corpo.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300 sm:mt-5 sm:text-lg sm:leading-7">
            Responda o fluxo e receba um treino sob medida, com intensidade, rotina e metas ajustadas para você.
          </p>

          <div className="mt-6 w-full lg:hidden">
            <Button
              onClick={handlePrimaryStudentFlow}
              variant="primary"
              size="lg"
              className="h-14 w-full"
            >
              <DSIcon name={hasSavedProgress ? 'play' : 'graduationCap'} size={18} />
              Continuar
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
                <span className="text-xs text-white/45">Plano gratuito em 2 minutos</span>
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

          <div className="mt-8 grid w-full max-w-lg grid-cols-3 gap-2.5">
            {FLOW_STATS.map((stat) => (
              <div key={stat.label} className="vfit-flow-panel-soft rounded-2xl px-3 py-3">
                <p className="text-lg font-black text-white tabular-nums">{stat.value}</p>
                <p className="mt-1 text-[10px] leading-tight text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-10 space-y-3 lg:mt-0"
          style={{ animation: 'welcome-slide-up 0.7s ease-out 0.25s both' }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="vfit-flow-panel-soft group flex items-center gap-4 rounded-3xl px-4 py-4 transition-all duration-300 hover:border-emerald-300/30 hover:bg-emerald-300/8"
              style={{
                animation: `welcome-slide-right 0.5s ease-out ${400 + i * 100}ms both`,
              }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300 transition-transform duration-300 group-hover:scale-105">
                <DSIcon name={f.icon} size={20} />
              </span>
              <span className="text-sm font-semibold text-slate-100">{f.text}</span>
              <DSIcon name="chevronRight" size={16} className="ml-auto text-slate-500" />
            </div>
          ))}

          <div className="vfit-flow-panel mt-5 rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-bg-base">
                <DSIcon name="aiBot" size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-white">Plano pronto no final do fluxo</p>
                <p className="text-xs text-slate-400">Perguntas preservadas, visual de última geração.</p>
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
              <p className="text-sm font-black text-white">Comece como aluno</p>
              <p className="text-xs text-slate-400">Plano gratuito em 2 minutos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/register/personal?from=welcome" className="text-sm font-semibold text-slate-400 transition-colors hover:text-white">
              Sou Personal
            </Link>
            <Button onClick={handlePrimaryStudentFlow} size="lg">
              <DSIcon name={hasSavedProgress ? 'play' : 'sparkles'} size={18} />
              {hasSavedProgress ? 'Continuar fluxo' : 'Começar agora'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
