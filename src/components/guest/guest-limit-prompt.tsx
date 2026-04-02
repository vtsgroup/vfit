/**
 * src/components/guest/guest-limit-prompt.tsx
 *
 * Guest Limit Prompt — Modal/banner quando guest atinge limite
 *
 * Exibe CTA para criar conta quando o visitante atinge
 * o limite de uso free (ex: 3 views de treino).
 */

'use client'

import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useGuestStore } from '@/stores/guest-store'

interface GuestLimitPromptProps {
  /** Tipo de uso que atingiu o limite */
  feature: 'workoutViews' | 'calculatorUses' | 'aiMessages' | 'assessments'
  /** Callback quando o user fecha o prompt (opcional) */
  onDismiss?: () => void
}

const featureLabels: Record<string, { title: string; description: string; icon: 'dumbbell' | 'hash' | 'sparkles' | 'barChart' }> = {
  workoutViews: {
    title: 'Limite de treinos atingido',
    description: 'Você explorou todos os treinos disponíveis no modo visitante. Crie sua conta grátis para ter acesso ilimitado.',
    icon: 'dumbbell',
  },
  calculatorUses: {
    title: 'Limite de calculadoras atingido',
    description: 'Você usou todas as calculadoras disponíveis sem conta. Crie uma conta grátis para continuar.',
    icon: 'hash',
  },
  aiMessages: {
    title: 'Chat IA requer conta',
    description: 'Para conversar com a IA e receber treinos personalizados, crie sua conta grátis.',
    icon: 'sparkles',
  },
  assessments: {
    title: 'Avaliação requer conta',
    description: 'Para fazer uma avaliação física completa e acompanhar sua evolução, crie sua conta grátis.',
    icon: 'barChart',
  },
}

export function GuestLimitPrompt({ feature, onDismiss }: GuestLimitPromptProps) {
  const router = useRouter()
  const exitGuestMode = useGuestStore((s) => s.exitGuestMode)
  const label = featureLabels[feature]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-blur-in sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/8 bg-bg-secondary p-6 shadow-2xl">
        {/* Close */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/6 transition-colors"
          >
            <DSIcon name="x" size={18} />
          </button>
        )}

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
          <DSIcon name={label.icon} size={28} className="text-brand-primary" />
        </div>

        {/* Content */}
        <h2 className="text-center text-[18px] font-black text-white leading-tight">
          {label.title}
        </h2>
        <p className="mt-2 text-center text-[13px] text-zinc-400 leading-relaxed">
          {label.description}
        </p>

        {/* Benefits */}
        <div className="mt-5 space-y-2">
          {[
            'Treinos ilimitados com IA',
            'Avaliação física completa',
            'Acompanhamento de evolução',
            'Chat com IA',
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary/10">
                <DSIcon name="check" size={12} className="text-brand-primary" />
              </div>
              <span className="text-[12px] text-zinc-300">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          <Button
            onClick={() => {
              exitGuestMode()
              router.push('/register')
            }}
            className="w-full uppercase tracking-wider font-black"
          >
            CRIAR CONTA GRÁTIS
            <DSIcon name="arrowRight" size={16} />
          </Button>
          <button
            type="button"
            onClick={() => {
              exitGuestMode()
              router.push('/login')
            }}
            className="w-full rounded-xl py-2.5 text-[12px] font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Já tenho conta — Entrar
          </button>
        </div>
      </div>
    </div>
  )
}
