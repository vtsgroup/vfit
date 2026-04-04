/**
 * src/app/(app)/progresso/streaks/page.tsx
 *
 * STREAKS — Sequência de treinos, heatmap anual, conquistas de consistência
 * Usa useStreak() para KPIs e useHeatmap() para o calendário
 */

'use client'

import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { useStreak, useHeatmap } from '@/hooks/use-progress'
import { StreakCalendar } from '@/components/progresso'

// ============================================
// Milestone thresholds
// ============================================

const MILESTONES = [
  { days: 3, label: '3 dias', icon: '🔥', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { days: 7, label: '1 semana', icon: '⚡', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { days: 14, label: '2 semanas', icon: '💪', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { days: 30, label: '1 mês', icon: '🏆', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { days: 60, label: '2 meses', icon: '🌟', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { days: 90, label: '3 meses', icon: '👑', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { days: 180, label: '6 meses', icon: '💎', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { days: 365, label: '1 ano', icon: '🏅', color: 'text-rose-400', bg: 'bg-rose-400/10' },
] as const

export default function StreaksPage() {
  const router = useRouter()
  const { data: streak, isLoading: loadingStreak } = useStreak()
  const { data: heatmap, isLoading: loadingHeatmap } = useHeatmap()

  const currentStreak = streak?.current_streak || 0
  const bestStreak = streak?.best_streak || 0
  const totalDays = streak?.total_workout_days || 0

  // Calculate next milestone
  const nextMilestone = MILESTONES.find(m => m.days > currentStreak)
  const prevMilestone = [...MILESTONES].reverse().find(m => m.days <= currentStreak)
  const progressToNext = nextMilestone
    ? Math.min(100, Math.round(((currentStreak - (prevMilestone?.days || 0)) / (nextMilestone.days - (prevMilestone?.days || 0))) * 100))
    : 100

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <DSIcon name="chevronLeft" size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-xl font-black text-text-primary leading-tight">Sequência</h1>
          <p className="text-[12px] text-text-muted">Consistência é o caminho</p>
        </div>
      </div>

      {/* Loading */}
      {(loadingStreak || loadingHeatmap) && (
        <div className="flex items-center justify-center py-16">
          <DSIcon name="loader" size={24} className="animate-spin text-brand-primary" />
        </div>
      )}

      {!loadingStreak && !loadingHeatmap && (
        <>
          {/* Hero streak card */}
          <div className="glass-card mb-5 rounded-2xl p-5 text-center">
            <div className="mb-2 text-4xl">🔥</div>
            <p className="text-5xl font-black text-text-primary leading-none">{currentStreak}</p>
            <p className="mt-1 text-[13px] font-medium text-text-muted">
              {currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}
            </p>

            {/* Progress to next milestone */}
            {nextMilestone && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-text-muted">
                    {prevMilestone ? `${prevMilestone.icon} ${prevMilestone.label}` : 'Início'}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {nextMilestone.icon} {nextMilestone.label}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/6 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-brand-primary to-emerald-400 transition-all duration-700"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-text-muted">
                  Faltam <span className="font-bold text-brand-primary">{nextMilestone.days - currentStreak}</span> dias para {nextMilestone.label}
                </p>
              </div>
            )}

            {/* All milestones achieved */}
            {!nextMilestone && currentStreak > 0 && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <DSIcon name="trophy" size={14} className="text-amber-400" />
                <span className="text-[12px] font-bold text-amber-400">Todas as metas conquistadas!</span>
              </div>
            )}
          </div>

          {/* KPI Row */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            {/* Current */}
            <div className="glass-card flex flex-col items-center rounded-xl p-3">
              <DSIcon name="flame" size={18} className="mb-1 text-orange-400" />
              <p className="text-lg font-black text-text-primary">{currentStreak}</p>
              <p className="text-[10px] text-text-muted">Atual</p>
            </div>

            {/* Best */}
            <div className="glass-card flex flex-col items-center rounded-xl p-3">
              <DSIcon name="trophy" size={18} className="mb-1 text-amber-400" />
              <p className="text-lg font-black text-text-primary">{bestStreak}</p>
              <p className="text-[10px] text-text-muted">Recorde</p>
            </div>

            {/* Total */}
            <div className="glass-card flex flex-col items-center rounded-xl p-3">
              <DSIcon name="calendar" size={18} className="mb-1 text-blue-400" />
              <p className="text-lg font-black text-text-primary">{totalDays}</p>
              <p className="text-[10px] text-text-muted">Total</p>
            </div>
          </div>

          {/* Heatmap calendar */}
          <div className="glass-card mb-5 rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <DSIcon name="calendar" size={14} className="text-brand-primary" />
              <span className="text-[12px] font-semibold text-text-secondary">
                Atividade no último ano
              </span>
            </div>
            <StreakCalendar days={heatmap?.days || []} />
          </div>

          {/* Milestones achieved */}
          <div className="glass-card rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <DSIcon name="award" size={14} className="text-amber-400" />
              <span className="text-[12px] font-semibold text-text-secondary">Conquistas de Sequência</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {MILESTONES.map((m) => {
                const achieved = bestStreak >= m.days
                return (
                  <div
                    key={m.days}
                    className={`flex flex-col items-center gap-1 rounded-xl p-2.5 transition-all ${
                      achieved
                        ? `${m.bg} border border-white/10`
                        : 'bg-white/3 opacity-40 grayscale'
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span className={`text-[10px] font-bold ${achieved ? m.color : 'text-text-muted'}`}>
                      {m.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
