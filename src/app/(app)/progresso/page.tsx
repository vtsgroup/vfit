/**
 * src/app/(app)/progresso/page.tsx
 *
 * PROGRESSO — Dashboard completo com KPIs, gráficos e streak
 * Sub-tabs: Último / Semana / Mês / Anual
 * Navegação por offset (< data >)
 */

'use client'

import { useState, useMemo } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { KPICard, MiniBarChart } from '@/components/progresso'
import { useProgressSummary, useProgressChart, useStreak } from '@/hooks/use-progress'

const PERIODS = [
  { key: 'last', label: 'Último' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
  { key: 'year', label: 'Anual' },
] as const

type PeriodKey = (typeof PERIODS)[number]['key']

export default function ProgressoPage() {
  const [period, setPeriod] = useState<PeriodKey>('week')
  const [offset, setOffset] = useState(0)

  const { data: summary, isLoading: loadingSummary } = useProgressSummary(period, offset)
  const { data: chart, isLoading: loadingChart } = useProgressChart(period, offset)
  const { data: streak } = useStreak()

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
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-black text-text-primary leading-tight">Progresso</h1>
        <p className="mt-1 text-[13px] text-text-muted">Acompanhe sua evolução</p>
      </div>

      {/* Streak card */}
      <div className="glass-card mb-5 rounded-2xl p-4">
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
          {(streak?.best_streak || 0) > 0 && (
            <div className="text-right">
              <p className="text-[13px] font-bold text-text-secondary">
                <DSIcon name="trophy" size={12} className="mr-1 inline text-amber-500" />
                {streak?.best_streak}
              </p>
              <p className="text-[10px] text-text-muted">Melhor</p>
            </div>
          )}
        </div>
      </div>

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

      {/* Loading state */}
      {loadingSummary && (
        <div className="flex items-center justify-center py-12">
          <DSIcon name="loader" size={24} className="animate-spin text-brand-primary" />
        </div>
      )}

      {/* Empty state */}
      {!loadingSummary && !hasData && (
        <div className="glass-card flex flex-col items-center justify-center rounded-3xl p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/8">
            <DSIcon name="barChart" size={28} className="text-brand-primary" />
          </div>
          <h2 className="text-base font-bold text-text-primary">Comece a treinar</h2>
          <p className="mt-2 text-[13px] text-text-muted max-w-xs">
            Seus gráficos de evolução, recordes pessoais e streak aparecerão aqui após seus primeiros treinos.
          </p>
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
              color="text-blue-400"
              iconBg="bg-blue-400/10"
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
              color="text-cyan-400"
              iconBg="bg-cyan-400/10"
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
                <MiniBarChart data={chartWorkouts} color="#22C55E" height={100} />
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
    </div>
  )
}
