// ============================================
// onboarding-wizard.tsx — Wizard de onboarding para novos personals
// ============================================
//
// O que faz:
//   Checklist de passos de onboarding: completar perfil, criar treino, adicionar aluno.
//   Cada passo tem status (completo/pendente) via useOnboardingStatus.
//   Botão "Concluir" marca onboarding como completo via useUpdateOnboarding.
//   Redireciona para dashboard após conclusão.
//
// Exports principais:
//   OnboardingWizard — checklist de onboarding com progresso e ações
'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui'
import { useOnboardingStatus, useUpdateOnboarding } from '@/hooks/use-onboarding'
import { toast } from '@/stores/app-store'

const STEPS = [
  {
    id: 1,
    title: 'Complete seu perfil',
    description: 'Foto, bio, CREF e especialidades para passar confiança.',
    href: '/dashboard/settings',
    cta: 'Ir para perfil',
  },
  {
    id: 2,
    title: 'Convide seu primeiro aluno',
    description: 'Cadastre o primeiro aluno para começar a jornada prática.',
    href: '/dashboard/students/invite',
    cta: 'Convidar aluno',
  },
  {
    id: 3,
    title: 'Crie seu primeiro treino',
    description: 'Monte um treino inicial para ativar o fluxo principal.',
    href: '/dashboard/workouts/create',
    cta: 'Criar treino',
  },
  {
    id: 4,
    title: 'Configure cobranças',
    description: 'Ajuste cobrança para iniciar monetização com segurança.',
    href: '/dashboard/payments',
    cta: 'Abrir pagamentos',
  },
] as const

export function OnboardingWizard() {
  const status = useOnboardingStatus()
  const update = useUpdateOnboarding()

  if (status.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border-light bg-bg-secondary" />
        ))}
      </div>
    )
  }

  const onboarding = status.data?.onboarding

  if (!onboarding) {
    return (
      <EmptyState
        illustration="generic"
        title="Não foi possível carregar o onboarding"
        description="Atualize a página para tentar novamente."
      />
    )
  }

  if (onboarding.has_completed_onboarding) {
    return (
      <EmptyState
        illustration="workouts"
        title="Onboarding concluído"
        description="Seu ambiente está pronto. Agora é executar e escalar."
      />
    )
  }

  const onboardingState = onboarding

  const completedSet = new Set(onboardingState.completed_steps)
  const skippedSet = new Set(onboardingState.skipped_steps)

  async function completeStep(stepId: number) {
    const completed = Array.from(new Set([...onboardingState.completed_steps, stepId])).sort((a, b) => a - b)
    const isFinal = completed.length >= 4

    try {
      await update.mutateAsync({
        completed_steps: completed,
        current_step: Math.min(4, stepId + 1),
        has_completed_onboarding: isFinal,
      })
      toast.success('Etapa concluída', `Passo ${stepId} registrado.`)
    } catch {
      toast.error('Erro ao atualizar onboarding')
    }
  }

  async function skipStep(stepId: number) {
    const skipped = Array.from(new Set([...onboardingState.skipped_steps, stepId])).sort((a, b) => a - b)
    try {
      await update.mutateAsync({
        skipped_steps: skipped,
        current_step: Math.min(4, stepId + 1),
      })
      toast.info('Etapa marcada como pulada', `Passo ${stepId} foi pulado.`)
    } catch {
      toast.error('Erro ao atualizar onboarding')
    }
  }

  async function finishOnboarding() {
    try {
      await update.mutateAsync({
        has_completed_onboarding: true,
        completed_steps: [1, 2, 3, 4],
        current_step: 4,
      })
      toast.success('Onboarding concluído', 'Bônus de XP pode ser aplicado na próxima sprint.')
    } catch {
      toast.error('Erro ao concluir onboarding')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border-light bg-bg-secondary p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Onboarding do Personal</h2>
            <p className="mt-1 text-sm text-text-muted">
              Complete os 4 passos para ativar seu setup inicial e reduzir atrito operacional.
            </p>
          </div>
          <div className="rounded-lg bg-brand-primary/10 px-3 py-1.5 text-sm font-semibold text-brand-primary">
            {onboardingState.completed_steps.length}/4 concluídos
          </div>
        </div>

        <div className="mt-4 h-2 rounded-full bg-bg-primary">
          <div
            className="h-2 rounded-full bg-brand-primary transition-all"
            style={{ width: `${Math.min(100, (onboardingState.completed_steps.length / 4) * 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((step) => {
          const done = completedSet.has(step.id)
          const skipped = skippedSet.has(step.id)

          return (
            <div key={step.id} className="rounded-xl border border-border-light bg-bg-secondary p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {done ? (
                      <DSIcon name="checkCircle2" size={20} className="text-success" />
                    ) : (
                      <DSIcon name="circle" size={20} className="text-text-muted" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{step.id}. {step.title}</p>
                    <p className="text-sm text-text-muted">{step.description}</p>
                    {skipped && !done ? (
                      <p className="mt-1 text-xs font-medium text-warning">Etapa pulada</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Link href={step.href}>
                    <Button size="sm" variant="outline">{step.cta}</Button>
                  </Link>
                  {!done && (
                    <Button size="sm" onClick={() => void completeStep(step.id)} loading={update.isPending}>
                      Marcar concluída
                    </Button>
                  )}
                  {!done && !skipped && (
                    <Button size="sm" variant="ghost" onClick={() => void skipStep(step.id)} loading={update.isPending}>
                      Pular
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-brand-primary/25 bg-brand-primary/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-text-primary">
            <DSIcon name="rocket" size={16} className="text-brand-primary" />
            Finalize para marcar onboarding completo.
          </div>
          <Button onClick={() => void finishOnboarding()} loading={update.isPending}>
            Finalizar onboarding
          </Button>
        </div>
      </div>
    </div>
  )
}
