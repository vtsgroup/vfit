/**
 * src/app/(app)/perfil/desafios/page.tsx
 *
 * Sprint 34 — Tela de Streak & Desafios Semanais
 */

'use client'

import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui'
import { useStreak, useWeeklyChallenges } from '@/hooks/use-challenges'
import { cn } from '@/lib/utils'

export default function DesafiosPage() {
  const router = useRouter()
  const { data: streak, isLoading: loadingStreak } = useStreak()
  const { data: challenges, isLoading: loadingChallenges } = useWeeklyChallenges()

  const isLoading = loadingStreak || loadingChallenges

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-bg-primary/80 px-4 py-3 backdrop-blur-lg">
        <button onClick={() => router.back()} className="p-1">
          <DSIcon name="arrowLeft" className="h-5 w-5 text-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-text-primary">Desafios</h1>
      </header>

      <div className="space-y-6 px-4 pt-2">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <DSIcon name="loader" className="h-6 w-6 animate-spin text-brand-primary" />
          </div>
        )}

        {/* ── Streak Section ── */}
        {streak && (
          <div className="rounded-2xl bg-linear-to-br from-orange-500/10 to-amber-400/5 p-5">
            {/* Streak counter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🔥</span>
                <div>
                  <p className="text-3xl font-black text-text-primary">
                    {streak.current_streak}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {streak.current_streak === 1 ? 'dia seguido' : 'dias seguidos'}
                  </p>
                </div>
              </div>

              {/* Melhor streak */}
              <div className="text-right">
                <p className="text-sm font-semibold text-text-secondary">
                  Recorde
                </p>
                <p className="text-lg font-bold text-text-primary">
                  {streak.best_streak} dias
                </p>
              </div>
            </div>

            {/* Status hoje */}
            <div
              className={cn(
                'mt-4 flex items-center gap-2 rounded-lg px-3 py-2',
                streak.trained_today
                  ? 'bg-brand-primary/15'
                  : 'bg-amber-500/15'
              )}
            >
              <DSIcon
                name={streak.trained_today ? 'checkCircle2' : 'flame' as DSIconName}
                className={cn(
                  'h-4 w-4',
                  streak.trained_today
                    ? 'text-brand-primary'
                    : 'text-amber-500'
                )}
              />
              <p className="text-xs font-medium text-text-primary">
                {streak.trained_today
                  ? 'Treino de hoje concluído! 💪'
                  : 'Treine hoje para manter o streak!'}
              </p>
            </div>

            {/* Milestones */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-text-secondary">
                Milestones
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {streak.milestones.map((m) => (
                  <div
                    key={m.days}
                    className={cn(
                      'flex shrink-0 flex-col items-center rounded-lg px-3 py-2',
                      m.reached
                        ? 'bg-brand-primary/15'
                        : 'bg-bg-tertiary'
                    )}
                  >
                    <span className="text-lg">
                      {m.reached ? '✅' : '🔒'}
                    </span>
                    <p
                      className={cn(
                        'text-xs font-semibold',
                        m.reached
                          ? 'text-brand-primary'
                          : 'text-text-muted'
                      )}
                    >
                      {m.days}d
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximo milestone */}
            {streak.next_milestone && (
              <p className="mt-3 text-center text-xs text-text-secondary">
                Faltam <span className="font-bold text-text-primary">{streak.days_to_next} dias</span>{' '}
                para o milestone de {streak.next_milestone} dias
              </p>
            )}
          </div>
        )}

        {/* ── Desafios Semanais ── */}
        {challenges && challenges.length > 0 && (
          <div>
            <h2 className="mb-3 text-base font-bold text-text-primary">
              ⚡ Desafios da Semana
            </h2>
            <div className="space-y-3">
              {challenges.map((ch) => (
                <ChallengeCard key={ch.id} challenge={ch} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Challenge card ─────────────────────────────────────
function ChallengeCard({
  challenge,
}: {
  challenge: {
    id: string
    title: string
    description: string
    icon: string
    target: number
    current: number
    completed: boolean
    xp_reward: number
  }
}) {
  const percent = Math.round((challenge.current / challenge.target) * 100)

  return (
    <div
      className={cn(
        'rounded-xl p-4 transition-all',
        challenge.completed
          ? 'bg-brand-primary/10 ring-1 ring-brand-primary/20'
          : 'bg-bg-secondary'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{challenge.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary">
              {challenge.title}
            </p>
            {challenge.completed && (
              <DSIcon
                name="checkCircle2"
                className="h-4 w-4 text-brand-primary"
              />
            )}
          </div>
          <p className="text-xs text-text-secondary">{challenge.description}</p>

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-tertiary">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  challenge.completed
                    ? 'bg-brand-primary'
                    : 'bg-amber-500'
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-text-secondary">
              {challenge.current}/{challenge.target}
            </span>
          </div>

          {/* XP reward */}
          <p className="mt-1 text-xs text-brand-primary">
            +{challenge.xp_reward} XP
          </p>
        </div>
      </div>
    </div>
  )
}
