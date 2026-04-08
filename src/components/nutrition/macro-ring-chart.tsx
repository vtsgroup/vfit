/**
 * src/components/nutrition/macro-ring-chart.tsx
 *
 * MacroRingChart — Gráfico de donut SVG para distribuição de macronutrientes.
 *
 * Exibe proteína, carboidrato e gordura como segmentos coloridos
 * em um gráfico circular, com calorias e % kcal no centro.
 *
 * Sprint 14 — Scanner & Macro Ring
 */
'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────

interface Macro {
  label: string
  value: number
  target: number
  kcalPerG: number
  color: string
  trackColor: string
}

interface MacroRingChartProps {
  calories: number
  calorieTarget: number
  protein: number
  proteinTarget: number
  carbs: number
  carbsTarget: number
  fat: number
  fatTarget: number
  size?: number
  strokeWidth?: number
  className?: string
}

// ── Helpers ────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v))
}

/**
 * Calcula o dash offset para o segmento de um anel SVG.
 * @param pct - porcentagem 0-100 do anel a preencher
 * @param r   - raio do círculo
 */
function dashOffset(pct: number, r: number) {
  const circumference = 2 * Math.PI * r
  return circumference - (circumference * clamp(pct)) / 100
}

// ── Component ──────────────────────────────────────────

export function MacroRingChart({
  calories,
  calorieTarget,
  protein,
  proteinTarget,
  carbs,
  carbsTarget,
  fat,
  fatTarget,
  size = 200,
  strokeWidth = 14,
  className,
}: MacroRingChartProps) {
  const cx = size / 2
  const cy = size / 2

  // Três anéis concêntricos (raios decrescentes)
  const radii = [
    cx - strokeWidth / 2 - 2,
    cx - strokeWidth / 2 - 2 - strokeWidth - 4,
    cx - strokeWidth / 2 - 2 - (strokeWidth + 4) * 2,
  ]

  const data = useMemo<Macro[]>(
    () => [
      {
        label: 'Proteína',
        value: protein,
        target: proteinTarget,
        kcalPerG: 4,
        color: '#22C55E',
        trackColor: 'rgba(34,197,94,0.10)',
      },
      {
        label: 'Carbs',
        value: carbs,
        target: carbsTarget,
        kcalPerG: 4,
        color: '#F59E0B',
        trackColor: 'rgba(245,158,11,0.10)',
      },
      {
        label: 'Gordura',
        value: fat,
        target: fatTarget,
        kcalPerG: 9,
        color: '#EF4444',
        trackColor: 'rgba(239,68,68,0.10)',
      },
    ],
    [protein, proteinTarget, carbs, carbsTarget, fat, fatTarget]
  )

  const caloriePct = clamp((calories / Math.max(calorieTarget, 1)) * 100)
  const calLabel = Math.round(calories).toLocaleString('pt-BR')
  const calTarget = Math.round(calorieTarget).toLocaleString('pt-BR')

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* SVG Rings */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {data.map((macro, i) => {
            const r = radii[i]
            const circumference = 2 * Math.PI * r
            const pct = clamp((macro.value / Math.max(macro.target, 1)) * 100)
            const offset = dashOffset(pct, r)

            return (
              <g key={macro.label}>
                {/* Track */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={macro.trackColor}
                  strokeWidth={strokeWidth}
                />
                {/* Progress */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={macro.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)' }}
                />
              </g>
            )
          })}
        </svg>

        {/* Centro — calorias */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'rotate(0deg)' }} // contrariar o rotate(-90deg) do SVG
        >
          <span className="text-2xl font-black leading-none text-white">
            {calLabel}
          </span>
          <span className="mt-0.5 text-[10px] font-medium text-zinc-500">
            / {calTarget} kcal
          </span>
          {/* Mini bar de calorias */}
          <div className="mt-2 h-1 w-12 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-500"
              style={{ width: `${caloriePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 flex w-full justify-between px-2">
        {data.map((macro) => (
          <div key={macro.label} className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: macro.color }}
              />
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                {macro.label}
              </span>
            </div>
            <span className="text-sm font-bold text-white">
              {Math.round(macro.value)}
              <span className="text-xs font-normal text-zinc-500">g</span>
            </span>
            <span className="text-[10px] text-zinc-600">
              / {macro.target}g
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
