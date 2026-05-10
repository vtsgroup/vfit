/**
 * src/components/progresso/streak-calendar.tsx
 *
 * GitHub-style contribution calendar para visualizar frequência de treinos.
 * Usa dados do useHeatmap() — 365 dias de { date, count }.
 * 52 colunas × 7 linhas (Dom–Sáb), cor por intensidade.
 */

'use client'

import { useMemo, useState, useCallback } from 'react'
import type { HeatmapDay } from '@/hooks/use-progress'

// ============================================
// Constants
// ============================================

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const
const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const

/** Intensity levels → Tailwind classes (dark-mode optimized) */
const INTENSITY_CLASSES = [
  'bg-slate-200/80 dark:bg-white/4',
  'bg-emerald-100 dark:bg-emerald-900/60',
  'bg-emerald-300 dark:bg-emerald-700/70',
  'bg-emerald-500/80 dark:bg-emerald-500/80',
  'bg-emerald-600 dark:bg-emerald-400',
] as const

// ============================================
// Types
// ============================================

interface StreakCalendarProps {
  days: HeatmapDay[]
  /** Number of weeks to display (default 52 = ~1 year) */
  weeks?: number
}

interface TooltipData {
  date: string
  count: number
  x: number
  y: number
}

// ============================================
// Helpers
// ============================================

function getIntensityLevel(count: number): number {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 3) return 3
  return 4
}

function formatDatePt(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()]
  return `${weekday}, ${d} de ${MONTHS_PT[m - 1]} ${y}`
}

function buildGrid(days: HeatmapDay[], numWeeks: number) {
  // Create a map date→count for O(1) lookup
  const countMap = new Map<string, number>()
  for (const d of days) {
    countMap.set(d.date, d.count)
  }

  // End date is today, start date is numWeeks*7 days ago (aligned to Sunday)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find the Saturday of the current week (end of grid)
  const endDay = new Date(today)
  endDay.setDate(endDay.getDate() + (6 - endDay.getDay()))

  // Start from (numWeeks) Sundays back
  const startDay = new Date(endDay)
  startDay.setDate(startDay.getDate() - (numWeeks * 7 - 1))

  // Build columns (weeks) of 7 cells each
  const columns: { date: string; count: number; isToday: boolean; isFuture: boolean }[][] = []
  const monthLabels: { label: string; colIndex: number }[] = []

  let lastMonth = -1
  const cursor = new Date(startDay)

  for (let week = 0; week < numWeeks; week++) {
    const column: typeof columns[0] = []

    for (let day = 0; day < 7; day++) {
      const dateStr = cursor.toISOString().slice(0, 10)
      const isFuture = cursor > today
      const isToday = dateStr === today.toISOString().slice(0, 10)

      column.push({
        date: dateStr,
        count: isFuture ? 0 : (countMap.get(dateStr) || 0),
        isToday,
        isFuture,
      })

      // Track month boundaries (on the 1st day row of each week)
      if (day === 0) {
        const m = cursor.getMonth()
        if (m !== lastMonth) {
          monthLabels.push({ label: MONTHS_PT[m], colIndex: week })
          lastMonth = m
        }
      }

      cursor.setDate(cursor.getDate() + 1)
    }

    columns.push(column)
  }

  return { columns, monthLabels }
}

// ============================================
// Component
// ============================================

export function StreakCalendar({ days, weeks = 52 }: StreakCalendarProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  const { columns, monthLabels } = useMemo(() => buildGrid(days, weeks), [days, weeks])

  const totalDays = useMemo(() => days.filter(d => d.count > 0).length, [days])

  const handleCellEnter = useCallback((e: React.PointerEvent, date: string, count: number) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const container = (e.target as HTMLElement).closest('[data-streak-calendar]')
    const containerRect = container?.getBoundingClientRect()
    if (!containerRect) return

    setTooltip({
      date,
      count,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 4,
    })
  }, [])

  const handleCellLeave = useCallback(() => setTooltip(null), [])

  // Cell size: 10px square, 2px gap
  const cellSize = 10
  const gap = 2
  const labelWidth = 16 // weekday labels column
  const monthLabelHeight = 14 // matches mb-1 + text-[9px] line-height visual

  return (
    <div className="w-full overflow-hidden" data-streak-calendar>
      {/* Layout: weekday labels (fixed) + scrollable area (month labels + grid) */}
      <div className="relative flex">
        {/* Weekday labels — fixed column, includes spacer matching month-labels row */}
        <div className="flex flex-col shrink-0" style={{ width: labelWidth }}>
          {/* Spacer to align with month labels row */}
          <div style={{ height: monthLabelHeight }} />
          <div className="flex flex-col" style={{ gap }}>
            {WEEKDAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="text-[8px] font-medium text-text-muted leading-none flex items-center justify-end pr-1"
                style={{ height: cellSize }}
              >
                {i % 2 === 1 ? label : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Scrollable region — month labels + columns scroll together */}
        <div
          className="flex-1 min-w-0 overflow-x-auto scrollbar-hide"
          style={{ paddingLeft: gap }}
        >
          {/* Month labels — share scroller with grid */}
          <div className="flex" style={{ height: monthLabelHeight }}>
            {monthLabels.map((m, i) => {
              const nextCol = monthLabels[i + 1]?.colIndex ?? columns.length
              const span = nextCol - m.colIndex
              return (
                <span
                  key={`${m.label}-${m.colIndex}`}
                  className="text-[9px] font-medium text-text-muted leading-none shrink-0"
                  style={{ width: span * (cellSize + gap) }}
                >
                  {span >= 3 ? m.label : ''}
                </span>
              )
            })}
          </div>

          {/* Columns (weeks) */}
          <div className="flex" style={{ gap }}>
            {columns.map((week, wi) => (
              <div key={wi} className="flex flex-col shrink-0" style={{ gap }}>
                {week.map((cell) => (
                  <div
                    key={cell.date}
                    className={`rounded-xs transition-colors ${
                      cell.isFuture
                        ? 'bg-transparent'
                        : INTENSITY_CLASSES[getIntensityLevel(cell.count)]
                    } ${cell.isToday ? 'ring-1 ring-brand-primary/50' : ''}`}
                    style={{ width: cellSize, height: cellSize }}
                    onPointerEnter={(e) => !cell.isFuture && handleCellEnter(e, cell.date, cell.count)}
                    onPointerLeave={handleCellLeave}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-lg bg-surface-2 border border-white/10 px-2.5 py-1.5 shadow-lg"
            style={{ left: tooltip.x + labelWidth, top: tooltip.y }}
          >
            <p className="text-[11px] font-bold text-text-primary whitespace-nowrap">
              {tooltip.count === 0 ? 'Nenhum treino' : `${tooltip.count} treino${tooltip.count > 1 ? 's' : ''}`}
            </p>
            <p className="text-[9px] text-text-muted whitespace-nowrap">
              {formatDatePt(tooltip.date)}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-text-muted">
          {totalDays} dia{totalDays !== 1 ? 's' : ''} ativo{totalDays !== 1 ? 's' : ''} no último ano
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-text-muted mr-1">Menos</span>
          {INTENSITY_CLASSES.map((cls, i) => (
            <div
              key={i}
              className={`rounded-xs ${cls}`}
              style={{ width: cellSize, height: cellSize }}
            />
          ))}
          <span className="text-[9px] text-text-muted ml-1">Mais</span>
        </div>
      </div>
    </div>
  )
}
