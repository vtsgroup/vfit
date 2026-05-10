/**
 * src/components/nutrition/macro-ring-chart.tsx
 *
 * MacroRingChart — Ultra-premium nutrition dashboard chart.
 *
 * Outer thin ring = calorie progress (full-circle animated stroke-dashoffset).
 * Inner wide donut = macro distribution as colored arc segments.
 * Center = calorie consumed + remaining.
 * Below = precision horizontal stat bars per macro.
 */
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────

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
  className?: string
}

// ── Helpers ────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v))
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
  size = 220,
  className,
}: MacroRingChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const cx = size / 2
  const cy = size / 2

  // ── Ring geometry ──
  const outerR = cx - 6          // thin calorie progress ring
  const innerR = cx - 26         // wide macro donut

  const outerC = 2 * Math.PI * outerR
  const innerC = 2 * Math.PI * innerR

  // ── Calorie ring ──
  const calPct = clamp((calories / Math.max(calorieTarget, 1)) * 100)
  const calOffset = outerC - (outerC * calPct) / 100

  // ── Macro kcal contributions ──
  const proteinKcal = protein * 4
  const carbsKcal   = carbs   * 4
  const fatKcal     = fat     * 9
  const totalMacroKcal = Math.max(proteinKcal + carbsKcal + fatKcal, 0.01)
  const hasData = totalMacroKcal > 0.5

  // ── Segment lengths on inner donut ──
  const GAP = (4 / 360) * innerC   // 4° gap between segments
  const usable = innerC - 3 * GAP
  const seg1Len = (proteinKcal / totalMacroKcal) * usable
  const seg2Len = (carbsKcal   / totalMacroKcal) * usable
  const seg3Len = (fatKcal     / totalMacroKcal) * usable

  // dashoffset positions each segment: offset = how far clockwise to start
  const seg1Off = 0
  const seg2Off = seg1Len + GAP
  const seg3Off = seg1Len + GAP + seg2Len + GAP

  // ── Macro stat config ──
  const macros = [
    {
      key: 'protein',
      label: 'Proteína',
      short: 'P',
      value: protein,
      target: proteinTarget,
      kcal: proteinKcal,
      pct: clamp((protein / Math.max(proteinTarget, 0.01)) * 100),
      color: '#34d399',
      glow: 'rgba(52,211,153,0.35)',
      gradFrom: '#34d399',
      gradTo: '#059669',
      gradId: 'gP',
      segLen: seg1Len,
      segOff: seg1Off,
    },
    {
      key: 'carbs',
      label: 'Carboidratos',
      short: 'C',
      value: carbs,
      target: carbsTarget,
      kcal: carbsKcal,
      pct: clamp((carbs / Math.max(carbsTarget, 0.01)) * 100),
      color: '#fbbf24',
      glow: 'rgba(251,191,36,0.35)',
      gradFrom: '#fbbf24',
      gradTo: '#d97706',
      gradId: 'gC',
      segLen: seg2Len,
      segOff: seg2Off,
    },
    {
      key: 'fat',
      label: 'Gordura',
      short: 'G',
      value: fat,
      target: fatTarget,
      kcal: fatKcal,
      pct: clamp((fat / Math.max(fatTarget, 0.01)) * 100),
      color: '#fb923c',
      glow: 'rgba(251,146,60,0.35)',
      gradFrom: '#fb923c',
      gradTo: '#dc2626',
      gradId: 'gF',
      segLen: seg3Len,
      segOff: seg3Off,
    },
  ]

  const remaining = Math.max(0, calorieTarget - calories)
  const isOver = calories > calorieTarget

  return (
    <div className={cn('w-full', className)}>

      {/* ── SVG Ring ── */}
      <div className="relative mx-auto" style={{ width: size, height: size }}>

        {/* Ambient glow backdrop */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgba(52,211,153,0.07) 0%, transparent 100%)',
            filter: 'blur(16px)',
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          <defs>
            {/* Outer calorie ring gradient */}
            <linearGradient id="gCal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>

            {/* Macro segment gradients */}
            {macros.map((m) => (
              <linearGradient key={m.gradId} id={m.gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={m.gradFrom} />
                <stop offset="100%" stopColor={m.gradTo} />
              </linearGradient>
            ))}

            {/* Subtle glow filter */}
            <filter id="glw" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
              <feComposite in="SourceGraphic" in2="b" operator="over" />
            </filter>
          </defs>

          {/* ── Outer track ── */}
          <circle
            cx={cx} cy={cy} r={outerR}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={4}
          />

          {/* ── Outer calorie progress ── */}
          <circle
            cx={cx} cy={cy} r={outerR}
            fill="none"
            stroke="url(#gCal)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={outerC}
            strokeDashoffset={mounted ? (isOver ? 0 : calOffset) : outerC}
            style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)' }}
          />

          {/* ── Inner donut track ── */}
          <circle
            cx={cx} cy={cy} r={innerR}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={18}
          />

          {/* ── Macro segments (positioned via dashoffset) ── */}
          {hasData && macros.map((m, i) => (
            <circle
              key={m.key}
              cx={cx} cy={cy} r={innerR}
              fill="none"
              stroke={`url(#${m.gradId})`}
              strokeWidth={18}
              strokeLinecap="round"
              strokeDasharray={`${m.segLen} ${innerC - m.segLen}`}
              strokeDashoffset={-m.segOff}
              filter="url(#glw)"
              style={{
                opacity: mounted ? 1 : 0,
                transition: `opacity 0.6s ease ${0.2 + i * 0.1}s`,
              }}
            />
          ))}

          {/* ── Empty state dashes ── */}
          {!hasData && (
            <circle
              cx={cx} cy={cy} r={innerR}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={18}
              strokeDasharray="3 10"
            />
          )}
        </svg>

        {/* ── Center text ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            consumido
          </span>
          <span
            className="mt-0.5 text-[30px] font-black leading-none tabular-nums tracking-tight text-white"
          >
            {Math.round(calories).toLocaleString('pt-BR')}
          </span>
          <span
            className="text-[10px] font-medium tabular-nums"
            style={{ color: 'rgba(255,255,255,0.28)' }}
          >
            kcal
          </span>

          {/* Divider */}
          <div
            className="my-2 h-px w-8"
            style={{ background: 'rgba(255,255,255,0.10)' }}
          />

          <span
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: isOver ? 'rgba(251,113,133,0.9)' : 'rgba(255,255,255,0.45)' }}
          >
            {isOver
              ? `+${Math.round(calories - calorieTarget).toLocaleString('pt-BR')} excedido`
              : `${Math.round(remaining).toLocaleString('pt-BR')} restantes`}
          </span>
        </div>
      </div>

      {/* ── Macro stat bars ── */}
      <div className="mt-5 w-full space-y-2.5 px-1">
        {macros.map((m, i) => (
          <div key={m.key} className="flex items-center gap-3">
            {/* Color dot with glow */}
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: m.color, boxShadow: `0 0 5px ${m.glow}` }}
            />

            {/* Label */}
            <span
              className="w-22 shrink-0 truncate text-[11px] font-medium"
              style={{ color: 'rgba(255,255,255,0.48)' }}
            >
              {m.label}
            </span>

            {/* Progress bar */}
            <div
              className="relative h-1.25 flex-1 overflow-hidden rounded-full"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: mounted ? `${Math.min(m.pct, 100)}%` : '0%',
                  background: `linear-gradient(90deg, ${m.gradFrom}, ${m.gradTo})`,
                  boxShadow: `0 0 8px ${m.glow}`,
                  transition: `width 0.95s cubic-bezier(.22,1,.36,1) ${0.15 + i * 0.07}s`,
                }}
              />
            </div>

            {/* Value / target */}
            <span
              className="w-15.5 shrink-0 text-right text-[11px] tabular-nums"
            >
              <span className="font-bold text-white">{Math.round(m.value)}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>/{m.target}g</span>
            </span>
          </div>
        ))}
      </div>

      {/* ── Calorie target footer ── */}
      <div
        className="mt-4 flex items-center justify-center gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}
      >
        <span
          className="text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Meta diária
        </span>
        <span
          className="text-[11px] font-bold tabular-nums"
          style={{ color: 'rgba(255,255,255,0.38)' }}
        >
          {Math.round(calorieTarget).toLocaleString('pt-BR')} kcal
        </span>
      </div>
    </div>
  )
}
