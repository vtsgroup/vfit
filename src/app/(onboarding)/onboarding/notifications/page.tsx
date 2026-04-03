'use client'

/**
 * src/app/(onboarding)/onboarding/notifications/page.tsx
 *
 * Tela de permissão de notificações (antes do paywall)
 * Pede permissão push → navega para paywall
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

const BENEFITS: { icon: DSIconName; title: string; desc: string }[] = [
  {
    icon: 'bell',
    title: 'Lembretes de treino',
    desc: 'Nunca mais pule um dia',
  },
  {
    icon: 'chart',
    title: 'Progresso semanal',
    desc: 'Acompanhe sua evolução',
  },
  {
    icon: 'trophy',
    title: 'Conquistas e recordes',
    desc: 'Celebre suas vitórias',
  },
  {
    icon: 'lightbulb',
    title: 'Dicas personalizadas',
    desc: 'Conteúdo exclusivo para você',
  },
]

export default function OnboardingNotificationsPage() {
  const router = useRouter()
  const [requesting, setRequesting] = useState(false)

  const handleAllow = async () => {
    setRequesting(true)
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          // OneSignal will handle the rest
        }
      }
    } catch {
      // ignore — follow-through regardless
    } finally {
      setRequesting(false)
      router.push('/onboarding/paywall')
    }
  }

  const handleSkip = () => {
    router.push('/onboarding/paywall')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary px-6">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mx-auto w-full max-w-sm space-y-8 text-center">
          {/* ─── Bell icon ─── */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/8">
            <DSIcon name="bell" className="h-12 w-12 text-brand-primary" />
          </div>

          {/* ─── Title ─── */}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Ative as Notificações
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Receba lembretes inteligentes para nunca perder um treino
            </p>
          </div>

          {/* ─── Benefits ─── */}
          <div className="space-y-3 text-left">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex items-center gap-3 rounded-xl border border-border-primary bg-bg-secondary p-3"
              >
                <DSIcon name={b.icon} className="h-6 w-6 shrink-0 text-brand-primary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{b.title}</p>
                  <p className="text-xs text-text-muted">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom CTAs ─── */}
      <div className="mx-auto w-full max-w-sm space-y-3 pb-10 pt-6">
        <Button
          size="lg"
          className="w-full"
          loading={requesting}
          onClick={handleAllow}
        >
          <DSIcon name="bell" className="h-4 w-4" />
          Ativar Notificações
        </Button>
        <button
          onClick={handleSkip}
          className="w-full py-2 text-center text-xs text-text-muted hover:text-text-secondary"
        >
          Agora não
        </button>
      </div>
    </div>
  )
}
