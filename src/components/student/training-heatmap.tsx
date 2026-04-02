// ============================================
// training-heatmap.tsx — Heatmap de frequência de treino do aluno
// ============================================
//
// O que faz:
//   Calendário heatmap de 52 semanas com intensidade baseada em treinos/dia.
//   Tooltip ao hover mostra data e quantidade de treinos.
//   Skeleton loading enquanto dados carregam.
//
// Exports principais:
//   TrainingHeatmap — heatmap de frequência de treino semanal
'use client'

import { useMemo, useState } from 'react'
import type { StudentTrainingHeatmapResponse } from '@/hooks/use-student-app'

interface TrainingHeatmapProps {
  data?: StudentTrainingHeatmapResponse
  loading?: boolean
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function TrainingHeatmap({ data, loading = false }: TrainingHeatmapProps) {
  const defaultMonth = new Date().getMonth() + 1
  const [month, setMonth] = useState<number>(defaultMonth)

  const dayMap = useMemo(() => {
    const map = new Map<string, { count: number; intensity: number }>()
    for (const day of data?.days ?? []) {
      map.set(day.date, { count: day.count, intensity: day.intensity })
    }
    return map
  }, [data?.days])

  const monthGrid = useMemo(() => {
    const year = data?.year ?? new Date().getFullYear()
    const firstDay = new Date(Date.UTC(year, month - 1, 1))
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
    const weekdayOffset = (firstDay.getUTCDay() + 6) % 7 // Monday-based

    const cells: Array<{ date: string | null; count: number; intensity: number }> = []
    for (let i = 0; i < weekdayOffset; i++) {
      cells.push({ date: null, count: 0, intensity: 0 })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const mapped = dayMap.get(date)
      cells.push({
        date,
        count: mapped?.count ?? 0,
        intensity: mapped?.intensity ?? 0,
      })
    }

    while (cells.length % 7 !== 0) {
      cells.push({ date: null, count: 0, intensity: 0 })
    }

    return cells
  }, [data?.year, dayMap, month])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border-light bg-kpi-dark backdrop-blur-sm p-5">
        <div className="h-5 w-44 animate-pulse rounded bg-black/4 dark:bg-white/6" />
        <div className="mt-4 h-36 animate-pulse rounded bg-black/3 dark:bg-white/4" />
      </div>
    )
  }

  const year = data?.year ?? new Date().getFullYear()

  return (
    <div className="rounded-2xl border border-border-light bg-kpi-dark backdrop-blur-sm p-5 shadow-elevation-1">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-text-primary">Heatmap de consistência</h3>
          <p className="text-xs text-text-muted">
            {data?.total_days_trained ?? 0} dias treinados • {data?.total_workouts ?? 0} treinos no ano
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-border-light bg-black/4 dark:bg-white/4 px-2 py-1 text-xs text-text-muted hover:bg-black/8 dark:hover:bg-white/8 transition-colors disabled:opacity-30"
            onClick={() => setMonth((prev) => Math.max(1, prev - 1))}
            disabled={month <= 1}
          >
            ◀
          </button>
          <span className="min-w-[72px] text-center text-sm font-medium text-text-primary">
            {MONTH_NAMES[month - 1]}/{year}
          </span>
          <button
            type="button"
            className="rounded-lg border border-border-light bg-black/4 dark:bg-white/4 px-2 py-1 text-xs text-text-muted hover:bg-black/8 dark:hover:bg-white/8 transition-colors disabled:opacity-30"
            onClick={() => setMonth((prev) => Math.min(12, prev + 1))}
            disabled={month >= 12}
          >
            ▶
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-[10px] text-text-muted">
        <span>Seg</span>
        <span>Ter</span>
        <span>Qua</span>
        <span>Qui</span>
        <span>Sex</span>
        <span>Sáb</span>
        <span>Dom</span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthGrid.map((cell, idx) => (
          <div
            key={`${cell.date ?? 'empty'}-${idx}`}
            title={cell.date ? `${formatDate(cell.date)} • ${cell.count} treino(s)` : ''}
            className={`h-5 rounded ${cell.date ? getCellClass(cell.intensity) : 'bg-transparent'}`}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-text-muted">
        <span>menos</span>
        {[0, 1, 2, 3, 4].map((intensity) => (
          <span key={intensity} className={`h-2.5 w-2.5 rounded-sm ${getCellClass(intensity)}`} />
        ))}
        <span>mais</span>
      </div>
    </div>
  )
}

function getCellClass(intensity: number): string {
  switch (intensity) {
    case 1:
      return 'bg-emerald-500/20'
    case 2:
      return 'bg-emerald-500/40'
    case 3:
      return 'bg-emerald-500/65'
    case 4:
      return 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
    default:
      return 'bg-black/4 dark:bg-white/4'
  }
}

function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
}
