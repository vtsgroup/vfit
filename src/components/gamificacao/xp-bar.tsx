/**
 * src/components/gamificacao/xp-bar.tsx
 *
 * Sprint 33 — Barra de XP animada com nível e progresso
 */

'use client'

import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'
import { getLevelTitle } from '@/hooks/use-gamification'

interface XPBarProps {
  level: number
  xpInLevel: number
  xpNeeded: number
  progressPercent: number
  totalXp: number
  className?: string
}

export function XPBar({
  level,
  xpInLevel,
  xpNeeded,
  progressPercent,
  totalXp,
  className,
}: XPBarProps) {
  const title = getLevelTitle(level)

  return (
    <div className={cn('rounded-[22px] border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-white/4', className)}>
      {/* Header: nível + título */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-white/8 dark:text-amber-300 dark:ring-white/10">
            <DSIcon name="trophy" size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-950 dark:text-text-primary">Nível {level}</p>
            <p className="text-xs text-slate-500 dark:text-text-secondary">{title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-brand-primary">
            {totalXp.toLocaleString('pt-BR')} XP
          </p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="relative h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-bg-tertiary">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-brand-primary to-emerald-400 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Brilho animado */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* XP restante */}
      <p className="mt-1.5 text-right text-xs text-slate-500 dark:text-text-muted">
        {xpInLevel} / {xpNeeded} XP para nível {level + 1}
      </p>
    </div>
  )
}
