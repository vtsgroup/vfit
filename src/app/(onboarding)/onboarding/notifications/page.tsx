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
    <div className="vfit-flow-bg relative flex min-h-dvh flex-col overflow-hidden px-6 text-white">
      <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mx-auto w-full max-w-sm space-y-8 text-center">
          {/* ─── Bell icon ─── */}
          <div className="vfit-flow-panel mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem]">
            <DSIcon name="bell" className="h-12 w-12 text-brand-primary" />
          </div>

          {/* ─── Title ─── */}
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/8 px-3 py-1.5 text-[11px] font-bold uppercase text-emerald-200">
              <DSIcon name="sparkles" size={13} />
              Ritmo inteligente
            </div>
            <h1 className="text-3xl font-black text-white">
              Ative seus lembretes
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              O VFIT usa notificações para proteger sua consistência e manter o plano vivo.
            </p>
          </div>

          {/* ─── Benefits ─── */}
          <div className="space-y-3 text-left">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="vfit-flow-panel-soft flex items-center gap-3 rounded-2xl p-3.5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/10 text-brand-primary">
                  <DSIcon name={b.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{b.title}</p>
                  <p className="text-xs text-slate-400">{b.desc}</p>
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
          className="w-full py-2 text-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
        >
          Agora não
        </button>
      </div>
    </div>
  )
}
