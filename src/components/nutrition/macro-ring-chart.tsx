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

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

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

interface TooltipState {
  key: string | null
  x: number
  y: number
}

interface MacroItem {
  key: string
  label: string
  short: string
  icon: DSIconName
  iconBg: string
  value: number
  target: number
  kcal: number
  pct: number
  color: string
  pattern: string
  glow: string
  gradFrom: string
  gradTo: string
  gradId: string
  segLen: number
  segOff: number
}

// ── Helpers ────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v))
}

function positionTooltip(event: React.PointerEvent | React.MouseEvent, key: string) {
  const padding = 18
  const tooltipWidth = 150
  const x = clamp(event.clientX, padding + tooltipWidth / 2, window.innerWidth - padding - tooltipWidth / 2)
  const y = clamp(event.clientY - 12, 72, window.innerHeight - padding)
  return { key, x, y }
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
  const [tooltip, setTooltip] = useState<TooltipState>({ key: null, x: 0, y: 0 })
  const [hiddenMacros, setHiddenMacros] = useState<Set<string>>(new Set())
  const svgRef = useRef<SVGSVGElement>(null)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const toggleMacro = (key: string) => {
    setHiddenMacros((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

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
  const macros: MacroItem[] = [
    {
      key: 'protein',
      label: 'Proteína',
      short: 'P',
      icon: 'flask',
      iconBg: 'bg-emerald-500',
      value: protein,
      target: proteinTarget,
      kcal: proteinKcal,
      pct: clamp((protein / Math.max(proteinTarget, 0.01)) * 100),
      color: '#34d399',
      pattern: 'url(#patternP)',
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
      icon: 'wheat',
      iconBg: 'bg-amber-500',
      value: carbs,
      target: carbsTarget,
      kcal: carbsKcal,
      pct: clamp((carbs / Math.max(carbsTarget, 0.01)) * 100),
      color: '#fbbf24',
      pattern: 'url(#patternC)',
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
      icon: 'droplets',
      iconBg: 'bg-orange-500',
      value: fat,
      target: fatTarget,
      kcal: fatKcal,
      pct: clamp((fat / Math.max(fatTarget, 0.01)) * 100),
      color: '#fb923c',
      pattern: 'url(#patternF)',
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
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-[28px] border border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/45 to-slate-50 p-4 shadow-[0_28px_70px_rgba(15,23,42,0.16)] sm:p-5',
        className
      )}
    >
      <div className="pointer-events-none absolute -left-9 -top-11 h-36 w-36 rounded-full bg-emerald-200/55 blur-2xl" />
      <div className="pointer-events-none absolute -right-12 bottom-12 h-44 w-44 rounded-full bg-sky-100/65 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-linear-to-b from-white/85 to-transparent" />

      <div className="relative mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700/80">Macros</p>
          <p className="mt-0.5 text-[12px] font-semibold text-slate-500">Resumo nutricional de hoje</p>
        </div>
        <div className="flex h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-white/85 px-3 text-[11px] font-black text-emerald-700 shadow-[0_4px_12px_rgba(5,150,105,0.14)]">
          <DSIcon name="sparkles" size={13} />
          VFIT
        </div>
      </div>

      {/* ── SVG Ring ── */}
      <div className="relative mx-auto" style={{ width: size, height: size }}>

        {/* Ambient glow backdrop */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgba(16,185,129,0.22) 0%, transparent 100%)',
            filter: 'blur(14px)',
          }}
        />

        <div className="pointer-events-none absolute inset-[14%] rounded-full border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]" />

        <svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
          role="img"
          aria-label={`Resumo de macros: ${Math.round(calories).toLocaleString('pt-BR')} kcal consumidas de ${Math.round(calorieTarget).toLocaleString('pt-BR')} kcal. Proteína ${Math.round(protein)}g, carboidratos ${Math.round(carbs)}g, gordura ${Math.round(fat)}g.`}
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
            stroke="rgba(15,23,42,0.06)"
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
            stroke="rgba(15,23,42,0.06)"
            strokeWidth={18}
          />

          {/* ── Macro segments (positioned via dashoffset) ── */}
          {hasData && macros.map((m, i) => {
            const isHidden = hiddenMacros.has(m.key)
            return (
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
                  opacity: mounted && !isHidden ? 1 : isHidden ? 0.15 : 0,
                  transition: prefersReducedMotion ? 'none' : `opacity 0.6s ease ${0.2 + i * 0.1}s`,
                  cursor: 'pointer',
                }}
                onClick={() => toggleMacro(m.key)}
                onMouseEnter={(event) => setTooltip(positionTooltip(event, m.key))}
                onMouseMove={(event) => setTooltip(positionTooltip(event, m.key))}
                onMouseLeave={() => setTooltip({ key: null, x: 0, y: 0 })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    toggleMacro(m.key)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={!isHidden}
                aria-label={`${m.label}: ${Math.round(m.value)}g de ${Math.round(m.target)}g alvo (${Math.round(m.kcal)} kcal). Clique para alternar visibilidade.`}
              />
            )
          })}

          {/* ── Empty state dashes ── */}
          {!hasData && (
            <>
              <circle
                cx={cx} cy={cy} r={innerR}
                fill="none"
                stroke="url(#gCal)"
                strokeWidth={18}
                strokeLinecap="round"
                strokeDasharray="10 12"
                opacity={0.22}
              />
              <circle
                cx={cx} cy={cy} r={innerR - 14}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="3 9"
                opacity={0.28}
              />
            </>
          )}
        </svg>

        {/* ── Center text ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'rgba(5,150,105,0.7)' }}
          >
            consumido
          </span>
          <span
            className="mt-0.5 text-[28px] font-black leading-none tabular-nums tracking-tight text-slate-900"
          >
            {Math.round(calories).toLocaleString('pt-BR')}
          </span>
          <span
            className="text-[10px] font-medium tabular-nums"
            style={{ color: 'rgba(15,23,42,0.5)' }}
          >
            kcal
          </span>

          {/* Divider */}
          <div
            className="my-2 h-px w-8"
            style={{ background: 'rgba(15,23,42,0.12)' }}
          />

          <span
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: isOver ? 'rgba(225,29,72,0.9)' : 'rgba(15,23,42,0.58)' }}
          >
            {isOver
              ? `+${Math.round(calories - calorieTarget).toLocaleString('pt-BR')} excedido`
              : `${Math.round(remaining).toLocaleString('pt-BR')} restantes`}
          </span>
        </div>
      </div>

      {/* ── Legend (Interactive - Toggle Series) ── */}
      <div className="relative mt-4 w-full space-y-2" role="group" aria-label="Filtro de macronutrientes">
        {macros.map((m) => {
          const isHidden = hiddenMacros.has(m.key)
          return (
            <button
              key={m.key}
              onClick={() => toggleMacro(m.key)}
              onMouseEnter={(event) => setTooltip(positionTooltip(event, m.key))}
              onMouseMove={(event) => setTooltip(positionTooltip(event, m.key))}
              onMouseLeave={() => setTooltip({ key: null, x: 0, y: 0 })}
              className={cn(
                'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-2xl border-t border-x border-b-2 px-3 py-2 transition-all active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                isHidden
                  ? 'opacity-45 border-emerald-300/65 bg-white/80 border-b-emerald-300/40'
                  : 'opacity-100 border-emerald-300/80 bg-white/90 border-b-emerald-500/55 hover:border-emerald-400 hover:bg-emerald-50/80'
              )}
              style={{
                boxShadow: isHidden
                  ? '0 2px 4px rgba(15,23,42,0.08), inset 0 1px 0 rgba(16,185,129,0.08)'
                  : '0 5px 12px rgba(5,150,105,0.2), inset 0 1px 0 rgba(16,185,129,0.16)',
              }}
              aria-label={`${m.label}: ${isHidden ? 'oculto' : 'visível'}. Clique para alternar.`}
            >
              {/* Icon + Pattern Indicator (not just color) */}
              <div className={cn('relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-[0_9px_18px_-10px_rgba(15,23,42,0.85),inset_0_1px_0_rgba(255,255,255,0.24)]', m.iconBg)}>
                <DSIcon name={m.icon} size={16} className="m-auto" />
              </div>

              {/* Label */}
              <span className="w-24 shrink-0 text-[12px] font-bold" style={{ color: 'rgba(15,23,42,0.72)' }}>
                {m.label}
              </span>

              {/* Progress bar (fixed width, animated via transform translateX) */}
              <div className="relative h-1.25 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(15,23,42,0.08)' }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: '100%',
                    transformOrigin: 'left',
                    transform: `scaleX(${mounted ? Math.min(m.pct, 100) / 100 : 0})`,
                    background: `linear-gradient(90deg, ${m.gradFrom}, ${m.gradTo})`,
                    boxShadow: `0 0 8px ${m.glow}`,
                    transition: prefersReducedMotion ? 'none' : `transform 0.95s cubic-bezier(.22,1,.36,1)`,
                  }}
                />
              </div>

              {/* Value / target */}
              <span className="w-16 shrink-0 text-right text-[12px] tabular-nums">
                <span className="font-bold text-slate-900">{Math.round(m.value)}</span>
                <span style={{ color: 'rgba(15,23,42,0.42)' }}>/{m.target}g</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Tooltip (on hover) ── */}
      {tooltip.key && (
        <div
          className="pointer-events-none fixed z-50 flex flex-col gap-1 rounded-lg border border-emerald-200 bg-white/95 px-2.5 py-1.5 text-[10px] shadow-[0_8px_22px_rgba(15,23,42,0.12)] backdrop-blur"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {macros.map((m) => {
            if (m.key !== tooltip.key) return null
            return (
              <div key={m.key} className="whitespace-nowrap">
                <span style={{ color: m.color }}>{m.label}</span>
                <span style={{ color: 'rgba(15,23,42,0.6)' }}>: {Math.round(m.value)}g</span>
                <span style={{ color: 'rgba(15,23,42,0.45)' }}> ({Math.round(m.kcal)} kcal)</span>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Calorie target footer ── */}
      <div
        className="mt-4 flex min-h-9 items-center justify-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]"
      >
        <span
          className="text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: 'rgba(15,23,42,0.36)' }}
        >
          Meta diária
        </span>
        <span
          className="text-[11px] font-bold tabular-nums"
          style={{ color: 'rgba(15,23,42,0.6)' }}
        >
          {Math.round(calorieTarget).toLocaleString('pt-BR')} kcal
        </span>
      </div>
    </div>
  )
}
