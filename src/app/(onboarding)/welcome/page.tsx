/**
 * src/app/(onboarding)/welcome/page.tsx
 *
 * Welcome Screen — First page of onboarding flow
 * Hero BG + VFIT branding + CTA to start quiz
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { supportsPasskey, getPasskeyEmail, isBiometricAutoUnlockEnabled, isBiometricInCooldown } from '@/hooks/use-passkey'

const FEATURES: { icon: DSIconName; text: string }[] = [
  { icon: 'target', text: 'Plano personalizado por IA' },
  { icon: 'chart', text: 'Progresso em tempo real' },
  { icon: 'trophy', text: 'Gamificação + Streaks' },
  { icon: 'zap', text: 'Treinos de 15 a 60 min' },
]

export default function WelcomePage() {
  const router = useRouter()
  const { reset } = useOnboardingStore()
  const { isAuthenticated, isHydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)

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

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStart = () => {
    reset()
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
        {/* Top: Logo + branding */}
        <div
          className={`flex flex-col items-center transition-all duration-700 ${
            mounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
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

        {/* Middle: Features */}
        <div
          className={`w-full max-w-sm space-y-3 transition-all delay-300 duration-700 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
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
                transitionDelay: `${400 + i * 100}ms`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-16px)',
                transition: 'opacity 0.5s, transform 0.5s',
              }}
            >
              <DSIcon name={f.icon} className="h-5 w-5 shrink-0 text-brand-primary" />
              <span className="text-sm font-medium text-white/90">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom: CTAs */}
        <div
          className={`w-full max-w-sm space-y-3 transition-all delay-700 duration-700 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <Button
            size="lg"
            className="w-full text-base"
            onClick={handleStart}
          >
            <DSIcon name="sparkles" className="h-5 w-5" />
            Criar Meu Plano Gratuito
          </Button>

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
