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
      router.replace('/dashboard')
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
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-bg-dark">
      {/* ─── Background image with overlay ─── */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-1.webp"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#020810]/80" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#020810]/40 to-[#020810]" />
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pb-52 pt-16">
        {/* Top: Logo + branding — CSS animation, no JS dependency */}
        <div
          className="flex flex-col items-center"
          style={{ animation: 'welcome-slide-down 0.7s ease-out both' }}
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <DSIcon name="sparkles" className="h-8 w-8 text-brand-primary" />
          </div>
          <h1
            className="text-4xl tracking-tight text-white"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, letterSpacing: '-0.03em' }}
          >
            V<span className="text-brand-primary">FIT</span>
          </h1>
          <p className="mt-2 text-sm font-medium tracking-widest text-white/60 uppercase">
            Seu treino inteligente
          </p>
        </div>

        {/* Middle: Features — CSS animation with delay */}
        <div
          className="mt-12 w-full max-w-sm space-y-3"
          style={{ animation: 'welcome-slide-up 0.7s ease-out 0.3s both' }}
        >
          <h2 className="mb-5 text-center text-lg font-semibold text-white">
            Seu treino personalizado em
            <span className="text-brand-primary"> 2 minutos</span>
          </h2>

          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/4 px-4 py-3 backdrop-blur-sm"
              style={{
                animation: `welcome-slide-right 0.5s ease-out ${400 + i * 100}ms both`,
              }}
            >
              <DSIcon name={f.icon} className="h-5 w-5 shrink-0 text-brand-primary" />
              <span className="text-sm font-medium text-white/90">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: fluxo principal fixo para aluno */}
      <div
        className="fixed inset-x-0 bottom-0 z-20"
        style={{ animation: 'welcome-slide-up 0.7s ease-out 0.7s both' }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-[#020810] via-[#020810]/95 to-transparent" />

        <div className="relative mx-auto w-full max-w-sm px-6 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-6">
          <Button
            onClick={handlePrimaryStudentFlow}
            variant="primary"
            size="lg"
            className="w-full"
          >
            <DSIcon name={hasSavedProgress ? 'play' : 'graduationCap'} size={18} />
            Continuar
          </Button>

          <div className="mt-3 text-center text-sm text-white/65">
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

          <div className="mt-4 flex items-center justify-center gap-3 text-sm">
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
            className="mt-3 w-full py-2 text-center text-sm font-medium text-white/50 transition-colors hover:text-white/80"
          >
            Já tenho conta · Entrar
          </button>
        </div>
      </div>
    </div>
  )
}
