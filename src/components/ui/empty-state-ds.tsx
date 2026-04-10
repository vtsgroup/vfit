// ============================================
// empty-state-ds.tsx — Empty state DS v2 com ícone, título e CTA
// ============================================
//
// O que faz:
//   Componente padronizado de estado vazio do DS v2.
//   Renderiza ícone (DSIcon), título, descrição opcional e botão CTA opcional.
//   Variantes de tamanho: sm | md | lg.
//   Usado em listas vazias, results sem dados, first-time setup.
//
// Exports principais:
//   EmptyStateDS — componente de empty state
//   EmptyStateDSProps — interface de props
'use client'

import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from './ds-icon'
import { Button } from './button'

/* ─────────────────────────────────────────────
 * EmptyStateDS — DS v2 Empty State (Clean variant)
 * 64×64 icon container · gentleBounce animation · centered text · CTA
 *
 * Use this for new pages aligned to DS v2.
 * The original <EmptyState> with SVG illustrations is preserved
 * for pages already using it.
 * ───────────────────────────────────────────── */

export interface EmptyStateDSProps {
  /** DS Icon name */
  icon: DSIconName
  /** Icon size inside the container (default 28) */
  iconSize?: number
  /** Main heading text */
  title: string
  /** Description text below heading */
  description?: string
  /** CTA button label */
  actionLabel?: string
  /** CTA button icon (DS icon name) */
  actionIcon?: DSIconName
  /** Called when CTA is clicked */
  onAction?: () => void
  /** Loading state for the CTA button */
  actionLoading?: boolean
  /** Additional className for wrapper */
  className?: string
}

export function EmptyStateDS({
  icon,
  iconSize = 48,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  actionLoading,
  className,
}: EmptyStateDSProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-8 py-12 text-center',
        className
      )}
    >
      {/* Icon container — mesh glow + bounce */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-brand-primary/8 blur-xl" />
        <div className="relative flex h-20 w-20 animate-gentle-bounce items-center justify-center rounded-full border border-brand-primary/20 bg-brand-primary/15 shadow-[0_0_24px_rgba(16,185,129,0.15)] dark:shadow-[0_0_32px_rgba(16,185,129,0.18)]">
          <DSIcon
            name={icon}
            size={iconSize}
            className="text-brand-primary"
          />
        </div>
      </div>

      {/* Title — Syne display */}
      <h3 className="font-syne text-lg font-bold tracking-tight text-text-primary">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mx-auto mt-2 max-w-75 text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      )}

      {/* CTA Button */}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button size="lg" onClick={onAction} loading={actionLoading}>
            {actionIcon && <DSIcon name={actionIcon} size={16} />}
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
