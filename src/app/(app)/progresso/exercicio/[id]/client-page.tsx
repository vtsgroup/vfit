/**
 * src/app/(app)/progresso/exercicio/[id]/page.tsx
 *
 * Evolução detalhada de um exercício — gráficos de peso, volume, PRs
 */

'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { MiniBarChart } from '@/components/progresso'
import { useExerciseProgress } from '@/hooks/use-progress'
import { useExerciseDetail } from '@/hooks/use-exercises'

const PERIOD_FILTERS = [
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: '1y', label: '1A' },
  { key: 'all', label: 'Tudo' },
] as const

export default function ExerciseProgressPage() {
  const params = useParams()
  const router = useRouter()
  const exerciseId = params.id as string
  const [period, setPeriod] = useState('3m')

  const { data: exercise } = useExerciseDetail(exerciseId)
  const { data: progress, isLoading } = useExerciseProgress(exerciseId, period)

  const stats = progress?.stats
  const hasData = stats && stats.total_sessions > 0

  const weightChartData = useMemo(
    () => progress?.weight_history?.map(p => ({
      label: new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: p.max_weight,
    })) || [],
    [progress]
  )

  const volumeChartData = useMemo(
    () => progress?.weight_history?.map(p => ({
      label: new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: p.max_volume,
    })) || [],
    [progress]
  )

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-white">
            {exercise?.name_pt || exercise?.name || 'Exercício'}
          </h1>
          <p className="text-[12px] text-zinc-500">Evolução detalhada</p>
        </div>
      </div>

      {/* Period filter */}
      <div className="mb-5 flex gap-1 rounded-xl bg-white/3 p-1">
        {PERIOD_FILTERS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all ${
              period === p.key
                ? 'bg-brand-primary/20 text-brand-primary'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <DSIcon name="loader" size={24} className="animate-spin text-brand-primary" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !hasData && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/6 bg-white/2 p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
            <DSIcon name="trendingUp" size={24} className="text-zinc-600" />
          </div>
          <h2 className="text-base font-bold text-white">Sem dados ainda</h2>
          <p className="mt-2 text-[13px] text-zinc-500">
            Complete treinos com este exercício para ver sua evolução.
          </p>
        </div>
      )}

      {/* Stats summary */}
      {!isLoading && hasData && (
        <>
          <div className="mb-5 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center rounded-xl border border-white/6 bg-white/3 p-3">
              <p className="text-lg font-black text-white">{stats.total_sessions}</p>
              <p className="text-[10px] text-zinc-500">Sessões</p>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-white/6 bg-white/3 p-3">
              <p className="text-lg font-black text-brand-primary">{stats.max_weight}<span className="text-[10px] font-normal text-zinc-500">kg</span></p>
              <p className="text-[10px] text-zinc-500">Peso máx</p>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-white/6 bg-white/3 p-3">
              <p className="text-lg font-black text-amber-400">{stats.avg_weight}<span className="text-[10px] font-normal text-zinc-500">kg</span></p>
              <p className="text-[10px] text-zinc-500">Peso médio</p>
            </div>
          </div>

          {/* Weight chart */}
          {weightChartData.length > 1 && (
            <div className="mb-4 rounded-2xl border border-white/6 bg-white/3 p-4">
              <div className="mb-3 flex items-center gap-2">
                <DSIcon name="trendingUp" size={14} className="text-brand-primary" />
                <span className="text-[12px] font-semibold text-zinc-400">Peso máximo (kg)</span>
              </div>
              <MiniBarChart
                data={weightChartData.slice(-14)}
                color="#10B981"
                height={110}
              />
            </div>
          )}

          {/* Volume chart */}
          {volumeChartData.length > 1 && (
            <div className="mb-4 rounded-2xl border border-white/6 bg-white/3 p-4">
              <div className="mb-3 flex items-center gap-2">
                <DSIcon name="barChart" size={14} className="text-purple-400" />
                <span className="text-[12px] font-semibold text-zinc-400">Volume (peso × reps)</span>
              </div>
              <MiniBarChart
                data={volumeChartData.slice(-14)}
                color="#A855F7"
                height={110}
              />
            </div>
          )}

          {/* Personal Records */}
          {progress?.personal_records && progress.personal_records.length > 0 && (
            <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
              <div className="mb-3 flex items-center gap-2">
                <DSIcon name="trophy" size={14} className="text-amber-400" />
                <span className="text-[12px] font-semibold text-zinc-400">Recordes Pessoais</span>
              </div>
              <div className="space-y-2">
                {progress.personal_records.map((pr, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-white/3 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-amber-400">🏆</span>
                      <div>
                        <p className="text-[13px] font-bold text-white">
                          {pr.weight_kg}kg × {pr.reps} reps
                        </p>
                        <p className="text-[10px] text-zinc-500">{pr.set_type}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-600">
                      {new Date(pr.performed_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
