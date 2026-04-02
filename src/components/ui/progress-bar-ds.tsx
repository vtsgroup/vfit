// ============================================
// progress-bar-ds.tsx — Barra de progresso DS v2 com shimmer
// ============================================
//
// O que faz:
//   Barra de progresso padronizada do DS v2.
//   Animação shimmer (sliding highlight) sobre a barra preenchida.
//   Cores: emerald (padrão), brand, warn, error via variante.
//   Suporta label, valor textual e tamanhos sm | md | lg.
//
// Exports principais:
//   ProgressBarDS — barra de progresso animada
//   ProgressBarDSProps — interface de props
'use client'

import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────
 * ProgressBarDS — DS v2 Progress Bar
 * Height 8px · Rounded · Emerald gradient with shimmer animation
 * ───────────────────────────────────────────── */

export interface ProgressBarDSProps {
  /** Current value */
  value: number
  /** Maximum value */
  max: number
  /** Optional label shown above the bar (left) */
  label?: string
  /** Optional sub-label shown above the bar (right) */
  subLabel?: string
  /** Custom accent color — overrides the default emerald gradient */
  accentFrom?: string
  accentTo?: string
  /** Additional className for wrapper */
  className?: string
}

export function ProgressBarDS({
  value,
  max,
  label,
  subLabel,
  accentFrom,
  accentTo,
  className,
}: ProgressBarDSProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <div className={cn('w-full', className)}>
      {/* Labels above bar */}
      {(label || subLabel) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          {label && (
            <span className="text-sm font-semibold text-text-primary">{label}</span>
          )}
          {subLabel && (
            <span className="text-[13px] text-text-secondary">{subLabel}</span>
          )}
        </div>
      )}

      {/* Track */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        {/* Fill with shimmer */}
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out-expo"
          style={{
            width: `${pct}%`,
            background:
              accentFrom && accentTo
                ? `linear-gradient(90deg, ${accentFrom}, ${accentTo}, ${accentFrom})`
                : 'linear-gradient(90deg, #34d399, #10b981, #34d399)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  )
}
