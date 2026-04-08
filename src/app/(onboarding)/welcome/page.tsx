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

const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.03em',
}

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
      <div className="relative z-10 flex flex-1 flex-col items-center justify-between px-6 pb-10 pt-16">
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
          className="w-full max-w-sm space-y-3"
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

        {/* Bottom: CTAs — CSS animation with longer delay */}
        <div
          className="w-full max-w-sm space-y-3"
          style={{ animation: 'welcome-slide-up 0.7s ease-out 0.7s both' }}
        >
            {/* ─── Role selection cards ─── */}
            <div className="space-y-2">
              <p
                className="text-center text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
              >
                Como você quer usar o VFIT?
              </p>

              {/* Personal Trainer */}
              <Link
                href="/register/personal?from=welcome"
                className="group flex items-center gap-3.5 rounded-2xl border border-white/8 bg-white/5 px-4 py-3.5 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/15 active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-primary to-[#16A34A] shadow-[0_4px_12px_rgba(34,197,94,0.3)]">
                  <DSIcon name="dumbbell" size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white" style={headingFont}>Personal Trainer</p>
                    <span className="rounded-full bg-brand-primary/20 px-1.5 py-px text-[9px] font-bold uppercase text-brand-primary tracking-wider">PRO</span>
                  </div>
                  <p className="text-[11px] text-white/45 mt-0.5 truncate">Gerencie alunos, treinos e cobranças</p>
                </div>
                <DSIcon name="arrowRight" size={16} className="text-white/30 transition-transform group-hover:translate-x-0.5" />
              </Link>

              {/* Nutricionista */}
              <Link
                href="/register/personal?type=nutri&from=welcome"
                className="group flex items-center gap-3.5 rounded-2xl border border-white/8 bg-white/5 px-4 py-3.5 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/15 active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 shadow-[0_4px_12px_rgba(52,211,153,0.3)]">
                  <DSIcon name="apple" size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white" style={headingFont}>Nutricionista</p>
                    <span className="rounded-full bg-emerald-400/20 px-1.5 py-px text-[9px] font-bold uppercase text-emerald-400 tracking-wider">PRO</span>
                  </div>
                  <p className="text-[11px] text-white/45 mt-0.5 truncate">Planos alimentares e acompanhamento</p>
                </div>
                <DSIcon name="arrowRight" size={16} className="text-white/30 transition-transform group-hover:translate-x-0.5" />
              </Link>

              {/* Aluno / Atleta */}
              {hasSavedProgress ? (
                <button
                  onClick={handleContinue}
                  className="group flex w-full items-center gap-3.5 rounded-2xl border border-brand-primary/25 bg-brand-primary/8 px-4 py-3.5 backdrop-blur-sm transition-all duration-200 hover:bg-brand-primary/12 active:scale-[0.98]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-primary to-emerald-600 shadow-[0_4px_12px_rgba(34,197,94,0.25)]">
                    <DSIcon name="play" size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-white" style={headingFont}>Continuar como Aluno</p>
                    <p className="text-[11px] text-brand-primary/70 mt-0.5">Retomar onde parei</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <DSIcon name="arrowRight" size={16} className="text-brand-primary/60 transition-transform group-hover:translate-x-0.5" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStart() }}
                      className="text-[9px] text-white/30 hover:text-white/60 transition-colors"
                    >
                      Recomeçar
                    </button>
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  className="group flex w-full items-center gap-3.5 rounded-2xl border border-brand-primary/20 bg-white/5 px-4 py-3.5 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/15 active:scale-[0.98]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-primary to-emerald-600 shadow-[0_4px_12px_rgba(34,197,94,0.25)]">
                    <DSIcon name="graduationCap" size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white" style={headingFont}>Sou Aluno / Atleta</p>
                      <span className="rounded-full bg-brand-primary/20 px-1.5 py-px text-[9px] font-bold uppercase text-brand-primary tracking-wider">FREE</span>
                    </div>
                    <p className="text-[11px] text-white/45 mt-0.5 truncate">Monte seu plano de treino gratuito</p>
                  </div>
                  <DSIcon name="arrowRight" size={16} className="text-white/30 transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full py-2 text-center text-sm font-medium text-white/50 transition-colors hover:text-white/80"
            >
              Já tenho conta · Entrar
            </button>
        </div>
      </div>
    </div>
  )
}
