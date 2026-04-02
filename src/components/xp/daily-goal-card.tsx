/**
 * src/components/xp/daily-goal-card.tsx
 *
 * Cartão de Meta Diária + Streak
 * Exibe:
 * - Progresso da meta diária (barra circular ou linear)
 * - Status de treinos feitos
 * - Streak atual com ícone de chama
 * - Próximo milestone do streak
 * - Histórico semanal (7 dias) de metas
 */

'use client'

import { useDailyGoal, useStreak, useGoalHistory } from '@/hooks/use-xp'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

// ============================================
// Streak flame color by tier
// ============================================
function getStreakTier(streak: number) {
  if (streak >= 100) return { color: 'text-purple-500', bg: 'bg-purple-500/20', label: 'Lendário' }
  if (streak >= 30) return { color: 'text-orange-500', bg: 'bg-orange-500/20', label: 'Imparável' }
  if (streak >= 7) return { color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: 'Em Chamas' }
  if (streak >= 3) return { color: 'text-red-400', bg: 'bg-red-400/20', label: 'Aquecendo' }
  return { color: 'text-text-muted', bg: 'bg-bg-tertiary', label: 'Iniciante' }
}

export function DailyGoalCard() {
  const dailyGoal = useDailyGoal()
  const streak = useStreak()
  const goalHistory = useGoalHistory(7)

  // ============================================
  // LOADING
  // ============================================
  if (dailyGoal.isLoading) {
    return (
      <div className="rounded-xl border border-border-light bg-bg-secondary p-6 animate-pulse space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-bg-tertiary" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-28 bg-bg-tertiary rounded" />
            <div className="h-3 w-20 bg-bg-tertiary rounded" />
          </div>
        </div>
        <div className="h-3 w-full bg-bg-tertiary rounded-full" />
      </div>
    )
  }

  // ============================================
  // ERROR
  // ============================================
  if (dailyGoal.isError) {
    return (
      <div className="rounded-xl border border-border-error bg-error/10 p-4 flex items-center gap-2">
        <DSIcon name="alertCircle" size={20} className="text-error" />
        <p className="text-sm text-error">Erro ao carregar meta diária</p>
      </div>
    )
  }

  const goal = dailyGoal.data
  if (!goal) return null

  const streakData = streak.data
  const historyData = goalHistory.data

  const progressPercent = Math.round(goal.progress * 100)
  const streakTier = getStreakTier(streakData?.current_streak || 0)

  return (
    <div className="space-y-3">
      {/* ============================================ */}
      {/* MAIN CARD: Daily Goal + Streak Combined      */}
      {/* ============================================ */}
      <div className="rounded-xl border border-border-light bg-bg-secondary overflow-hidden">
        {/* Top Row: Today's Goal */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg',
                goal.completed ? 'bg-success/20' : 'bg-brand-primary/10'
              )}>
                {goal.completed
                  ? <DSIcon name="checkCircle2" size={20} className="text-success" />
                  : <DSIcon name="target" size={20} className="text-brand-primary" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {goal.completed ? 'Meta Concluída!' : 'Meta Diária'}
                </p>
                <p className="text-xs text-text-muted">
                  {goal.workouts_done}/{goal.workouts_target} treino{goal.workouts_target > 1 ? 's' : ''} · {goal.earned_xp}/{goal.target_xp} XP
                </p>
              </div>
            </div>

            <span className={cn(
              'text-lg font-bold',
              goal.completed ? 'text-success' : 'text-brand-primary'
            )}>
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                goal.completed
                  ? 'bg-linear-to-r from-success to-emerald-400'
                  : 'bg-linear-to-r from-brand-primary to-brand-accent'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border-light" />

        {/* Bottom Row: Streak Info */}
        {streakData && (
          <div className="p-4 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Flame icon with tier color */}
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', streakTier.bg)}>
                <DSIcon name="flame" size={20} className={streakTier.color} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-bold text-text-primary">{streakData.current_streak}</p>
                  <p className="text-sm text-text-muted">dias</p>
                </div>
                <p className={cn('text-xs font-medium', streakTier.color)}>{streakTier.label}</p>
              </div>
            </div>

            {/* Next milestone */}
            <div className="text-right">
              {streakData.next_milestone ? (
                <>
                  <div className="flex items-center gap-1 justify-end">
                    <DSIcon name="trophy" size={14} className="text-yellow-500" />
                    <p className="text-xs font-medium text-text-primary">
                      Próximo: {streakData.next_milestone} dias
                    </p>
                  </div>
                  <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-bg-tertiary ml-auto">
                    <div
                      className="h-full rounded-full bg-yellow-500 transition-all duration-500"
                      style={{ width: `${Math.round(streakData.progress_to_next * 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <DSIcon name="trophy" size={14} className="text-purple-500" />
                  <p className="text-xs font-medium text-purple-500">Todos desbloqueados!</p>
                </div>
              )}

              {/* Freeze indicator */}
              {streakData.freeze_count > 0 && (
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <DSIcon name="snowflake" size={12} className="text-blue-400" />
                  <p className="text-xs text-blue-400">
                    {streakData.max_freezes - streakData.freeze_count} freeze restante
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* WEEK HISTORY: 7-day heatmap dots              */}
      {/* ============================================ */}
      {historyData && historyData.goals.length > 0 && (
        <div className="rounded-xl border border-border-light bg-bg-secondary p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-text-muted">Últimos 7 dias</p>
            <p className="text-xs text-text-muted">
              {historyData.summary.days_completed}/{historyData.summary.days_tracked} dias
            </p>
          </div>

          {/* Heatmap Row */}
          <div className="flex items-center justify-between gap-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const dayIndex = 6 - i // Show newest on right
              const goal = historyData.goals[dayIndex]
              const dateLabel = goal
                ? new Date(goal.goal_date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })
                : ''

              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  {/* Day dot */}
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center transition-colors',
                      !goal ? 'bg-bg-tertiary' :
                      goal.completed ? 'bg-success' :
                      goal.earned_xp > 0 ? 'bg-brand-primary/40' :
                      'bg-bg-tertiary'
                    )}
                  >
                    {goal?.completed && (
                      <DSIcon name="checkCircle2" size={14} className="text-white" />
                    )}
                    {goal && !goal.completed && goal.earned_xp > 0 && (
                      <span className="text-[8px] font-bold text-white">
                        {Math.round((goal.earned_xp / goal.target_xp) * 100)}
                      </span>
                    )}
                    {goal && goal.earned_xp === 0 && (
                      <DSIcon name="xCircle" size={14} className="text-text-muted/40" />
                    )}
                  </div>
                  {/* Day label */}
                  <p className="text-[10px] text-text-muted leading-none capitalize">
                    {dateLabel.replace('.', '')}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Completion rate bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-tertiary">
              <div
                className="h-full rounded-full bg-success transition-all duration-500"
                style={{ width: `${Math.round(historyData.summary.completion_rate * 100)}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-success whitespace-nowrap">
              {Math.round(historyData.summary.completion_rate * 100)}%
            </p>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MILESTONES ACHIEVED                           */}
      {/* ============================================ */}
      {streakData?.milestones && streakData.milestones.length > 0 && (
        <div className="rounded-xl border border-border-light bg-bg-secondary p-4">
          <p className="text-xs font-medium text-text-muted mb-2">Marcos Conquistados</p>
          <div className="flex flex-wrap gap-2">
            {streakData.milestones.map((m) => (
              <div
                key={m.days}
                className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1"
              >
                <DSIcon name="trophy" size={12} className="text-yellow-500" />
                <span className="text-xs font-semibold text-yellow-600">{m.days} dias</span>
                <span className="text-xs text-text-muted">+{m.xp_awarded} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
