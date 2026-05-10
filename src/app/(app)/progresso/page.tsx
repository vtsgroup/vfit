/**
 * src/app/(app)/progresso/page.tsx
 *
 * PROGRESSO — Dashboard completo com KPIs, gráficos e streak
 * Sub-tabs: Último / Semana / Mês / Anual
 * Navegação por offset (< data >)
 */

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { KPICard, MiniBarChart, ProgressoPageSkeleton } from '@/components/progresso'
import { useProgressSummary, useProgressChart, useStreak, useTopExercises, useExerciseProgress, type TopExercise } from '@/hooks/use-progress'

const PERIODS = [
  { key: 'last', label: 'Último' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
  { key: 'year', label: 'Anual' },
] as const

type PeriodKey = (typeof PERIODS)[number]['key']

// ─── S2.5: Exercise progression mini-card ──────────────────────────────────────
function ExerciseProgressCard({ exercise }: { exercise: TopExercise }) {
  const { data: progress } = useExerciseProgress(exercise.exercise_id, '3m')

  const chartData = progress?.weight_history
    ?.filter(p => p.max_weight > 0)
    .map(p => ({ label: p.date.slice(5), value: p.max_weight })) ?? []

  const hasTrend = chartData.length >= 2
  const first = chartData[0]?.value ?? 0
  const last = chartData[chartData.length - 1]?.value ?? 0
  const trendPct = hasTrend && first > 0 ? Math.round(((last - first) / first) * 100) : 0
  const isUp = trendPct >= 0

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/12">
            <DSIcon name="dumbbell" size={13} className="text-brand-primary" />
          </div>
          <p className="text-[13px] font-semibold text-text-primary line-clamp-1">{exercise.exercise_name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasTrend && (
            <span className={`text-[11px] font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isUp ? '+' : ''}{trendPct}%
            </span>
          )}
          {exercise.max_weight && exercise.max_weight > 0 && (
            <span className="text-[11px] text-text-muted">{exercise.max_weight}kg</span>
          )}
        </div>
      </div>

      {chartData.length > 1 ? (
        <MiniBarChart data={chartData} color="#22C55E" height={64} />
      ) : (
        <div className="flex h-16 items-center justify-center rounded-xl bg-white/3">
          <p className="text-[11px] text-text-muted">
            {exercise.session_count} treino{exercise.session_count !== 1 ? 's' : ''} registrado{exercise.session_count !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <p className="mt-1.5 text-right text-[10px] text-text-muted">
        {exercise.session_count} sessões · último: {new Date(exercise.last_performed).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
      </p>
    </div>
  )
}
// ───────────────────────────────────────────────────────────────────────────────

export default function ProgressoPage() {
  const [period, setPeriod] = useState<PeriodKey>('week')
  const [offset, setOffset] = useState(0)

  const { data: summary, isLoading: loadingSummary } = useProgressSummary(period, offset)
  const { data: chart, isLoading: loadingChart } = useProgressChart(period, offset)
  const { data: streak } = useStreak()
  const { data: topExercisesData } = useTopExercises(4)

  const kpis = summary?.kpis
  const hasData = kpis && kpis.workouts > 0

  // Reset offset when period changes
  const handlePeriodChange = (p: PeriodKey) => {
    setPeriod(p)
    setOffset(0)
  }

  const chartWorkouts = useMemo(
    () => chart?.data?.map(d => ({ label: d.label, value: d.workouts })) || [],
    [chart]
  )
  const chartVolume = useMemo(
    () => chart?.data?.map(d => ({ label: d.label, value: d.volume_kg })) || [],
    [chart]
  )

  return (
    <div className="mx-auto max-w-lg px-4 pt-0 pb-24">
      {/* Header */}
      <div
        className="-mx-4 mb-5 rounded-b-3xl border-b-0 px-4 py-5 backdrop-blur-md"
        style={{ background: 'linear-gradient(to bottom, #0b1d36 0%, #0c1f38 20%, #0b1c35 40%, #0a1830 65%, #071628 85%, #050A12 100%)', boxShadow: '0 6px 28px 0 rgba(5,10,18,0.6)' }}
      >
        <p className="text-xs font-semibold text-emerald-400">Sua consistência em foco</p>
        <h1 className="text-2xl leading-tight font-black text-white">Progresso</h1>
        <p className="mt-1 text-[13px] text-white/70">Acompanhe sua evolução</p>
      </div>

      {/* Streak card — links to /progresso/streaks */}
      <Link href="/progresso/streaks" className="block">
        <div className="glass-card mb-5 rounded-2xl p-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/8">
                <DSIcon name="flame" size={24} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-xl font-black text-text-primary">{streak?.current_streak || 0} dias</p>
                <p className="text-[11px] text-text-muted">Sequência atual</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(streak?.best_streak || 0) > 0 && (
                <div className="text-right">
                  <p className="text-[13px] font-bold text-text-secondary">
                    <DSIcon name="trophy" size={12} className="mr-1 inline text-amber-500" />
                    {streak?.best_streak}
                  </p>
                  <p className="text-[10px] text-text-muted">Melhor</p>
                </div>
              )}
              <DSIcon name="chevronRight" size={16} className="text-text-muted" />
            </div>
          </div>
        </div>
      </Link>

      {/* Period tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-white/3 p-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePeriodChange(p.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold transition-all ${
              period === p.key
                ? 'bg-brand-primary/20 text-brand-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Date navigation */}
      {period !== 'last' && (
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setOffset(o => o + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <DSIcon name="chevronLeft" size={16} className="text-text-secondary" />
          </button>
          <p className="text-[13px] font-medium text-text-secondary">
            {summary?.label || '...'}
          </p>
          <button
            onClick={() => setOffset(o => Math.max(0, o - 1))}
            disabled={offset === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30"
          >
            <DSIcon name="chevronRight" size={16} className="text-text-secondary" />
          </button>
        </div>
      )}

      {/* Loading state — skeleton instead of spinner */}
      {loadingSummary && <ProgressoPageSkeleton />}

      {/* Empty state */}
      {!loadingSummary && !hasData && (
        <div className="glass-card flex flex-col items-center justify-center rounded-3xl p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/8">
            <DSIcon name="barChart" size={28} className="text-brand-primary" />
          </div>
          <h2 className="text-base font-bold text-text-primary">Comece a treinar</h2>
          <p className="mt-2 mb-5 text-[13px] text-text-muted max-w-xs">
            Seus gráficos de evolução, recordes pessoais e streak aparecerão aqui após seus primeiros treinos.
          </p>
          <Link href="/treinos">
            <Button>
              <DSIcon name="dumbbell" size={16} />
              Ver meu treino de hoje
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Grid 2x3 */}
      {!loadingSummary && hasData && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3">
            <KPICard
              icon="dumbbell"
              label="Treinos"
              value={kpis.workouts}
              color="text-brand-primary"
              iconBg="bg-brand-primary/10"
            />
            <KPICard
              icon="target"
              label="Exercícios"
              value={kpis.exercises}
              color="text-brand-primary"
              iconBg="bg-brand-primary/10"
            />
            <KPICard
              icon="clock"
              label="Minutos"
              value={kpis.duration_min}
              unit="min"
              color="text-purple-400"
              iconBg="bg-purple-400/10"
            />
            <KPICard
              icon="flame"
              label="Calorias"
              value={kpis.calories}
              unit="kcal"
              color="text-orange-400"
              iconBg="bg-orange-400/10"
            />
            <KPICard
              icon="trendingUp"
              label="Repetições"
              value={kpis.total_reps.toLocaleString('pt-BR')}
              color="text-brand-primary"
              iconBg="bg-brand-primary/10"
            />
            <KPICard
              icon="scale"
              label="Volume Total"
              value={kpis.total_volume_kg.toLocaleString('pt-BR')}
              unit="kg"
              color="text-amber-400"
              iconBg="bg-amber-400/10"
            />
          </div>

          {/* Charts — only for week/month */}
          {['week', 'month'].includes(period) && !loadingChart && chartWorkouts.length > 0 && (
            <div className="space-y-4">
              {/* Treinos chart */}
              <div className="glass-card rounded-2xl p-4">
                <div className="mb-3 flex items-center gap-2">
                  <DSIcon name="barChart" size={14} className="text-brand-primary" />
                  <span className="text-[12px] font-semibold text-text-secondary">Treinos</span>
                </div>
                <MiniBarChart data={chartWorkouts} color="#10B981" height={100} />
              </div>

              {/* Volume chart */}
              <div className="glass-card rounded-2xl p-4">
                <div className="mb-3 flex items-center gap-2">
                  <DSIcon name="trendingUp" size={14} className="text-amber-400" />
                  <span className="text-[12px] font-semibold text-text-secondary">Volume (kg)</span>
                </div>
                <MiniBarChart data={chartVolume} color="#F59E0B" height={100} />
              </div>
            </div>
          )}
        </>
      )}

      {/* S2.5 — Exercise progression charts */}
      {topExercisesData && topExercisesData.exercises.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-text-primary">Evolução por exercício</h2>
            <span className="text-[11px] text-text-muted">Últimos 3 meses</span>
          </div>
          <div className="space-y-3">
            {topExercisesData.exercises.map((ex) => (
              <ExerciseProgressCard key={ex.exercise_id} exercise={ex} />
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-5 space-y-2">
        <Link
          href="/progresso/conquistas"
          className="glass-card flex items-center justify-between rounded-2xl p-4 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10">
              <DSIcon name="award" size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-text-primary">Conquistas</p>
              <p className="text-[11px] text-text-muted">Badges e nível de XP</p>
            </div>
          </div>
          <DSIcon name="chevronRight" size={16} className="text-text-muted" />
        </Link>

        <Link
          href="/progresso/corporal"
          className="glass-card flex items-center justify-between rounded-2xl p-4 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
              <DSIcon name="scale" size={20} className="text-brand-primary" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-text-primary">Evolução Corporal</p>
              <p className="text-[11px] text-text-muted">Peso, medidas e IMC</p>
            </div>
          </div>
          <DSIcon name="chevronRight" size={16} className="text-text-muted" />
        </Link>
      </div>
    </div>
  )
}
