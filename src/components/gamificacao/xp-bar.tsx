/**
 * src/components/gamificacao/xp-bar.tsx
 *
 * Sprint 33 — Barra de XP animada com nível e progresso
 */

'use client'

import { cn } from '@/lib/utils'
import { getLevelTitle, getLevelEmoji } from '@/hooks/use-gamification'

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
  const emoji = getLevelEmoji(level)

  return (
    <div className={cn('rounded-2xl bg-bg-secondary p-4', className)}>
      {/* Header: nível + título */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-sm font-bold text-text-primary">Nível {level}</p>
            <p className="text-xs text-text-secondary">{title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-brand-primary">
            {totalXp.toLocaleString('pt-BR')} XP
          </p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="relative h-3 overflow-hidden rounded-full bg-bg-tertiary">
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
      <p className="mt-1.5 text-right text-xs text-text-muted">
        {xpInLevel} / {xpNeeded} XP para nível {level + 1}
      </p>
    </div>
  )
}
