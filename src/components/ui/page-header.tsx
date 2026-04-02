// ============================================
// page-header.tsx — Header de página DS v2 (4 variantes)
// ============================================
//
// O que faz:
//   Header padronizado de páginas do dashboard com título, subtítulo e ações.
//   Variantes: default | compact | hero | minimal.
//   Suporta breadcrumb, badge de status, botão de volta e slot de ações (ReactNode).
//   Usa tokens DS v2: text-text-primary, text-text-muted, bg-surface-card.
//
// Exports principais:
//   PageHeader — header de página
//   PageHeaderProps — interface de props
'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from './ds-icon'

/* ─────────────────────────────────────────────
 * PageHeader — DS v2 Reusable Page Header
 * Covers 4 layout variants across 31 dashboard pages:
 *   1. Simple (title + description)
 *   2. With actions (+ buttons right)
 *   3. With icon (decorative icon box + title)
 *   4. Full (icon + title + actions + back)
 * ───────────────────────────────────────────── */

export interface PageHeaderProps {
  /** Page title */
  title: string
  /** Static description or dynamic ReactNode (e.g. skeleton-backed count) */
  description?: string | ReactNode
  /** DS icon name for decorative icon box */
  icon?: DSIconName
  /** Icon size (default 20) */
  iconSize?: number
  /** Custom icon container className (default: bg-brand-primary/10 rounded-xl) */
  iconContainerClassName?: string
  /** Custom icon color className (default: text-brand-primary) */
  iconClassName?: string
  /** Action buttons rendered on the right side */
  actions?: ReactNode
  /** Badge/tag rendered next to the title */
  badge?: ReactNode
  /** Back button — pass a DSIcon name (default: 'chevronLeft') or `true` */
  onBack?: () => void
  /** Heading level (default: h1) — use h2 inside modals/nested contexts */
  as?: 'h1' | 'h2' | 'h3'
  /** Additional className for wrapper */
  className?: string
}

export function PageHeader({
  title,
  description,
  icon,
  iconSize = 20,
  iconContainerClassName,
  iconClassName,
  actions,
  badge,
  onBack,
  as: Tag = 'h1',
  className,
}: PageHeaderProps) {
  const hasIcon = !!icon
  const hasActions = actions || badge

  return (
    <div
      className={cn(
        hasActions
          ? 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'
          : '',
        className
      )}
    >
      <div className={cn(hasIcon || onBack ? 'flex items-center gap-3' : '')}>
        {/* Back button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-light bg-bg-secondary/80 text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <DSIcon name="chevronLeft" size={18} />
          </button>
        )}

        {/* Icon box */}
        {hasIcon && (
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              iconContainerClassName || 'bg-brand-primary/10'
            )}
          >
            <DSIcon
              name={icon}
              size={iconSize}
              className={cn(iconClassName || 'text-brand-primary')}
            />
          </div>
        )}

        {/* Text group */}
        <div className={hasIcon || onBack ? 'min-w-0 flex-1' : undefined}>
          <div className="flex items-center gap-2">
            <Tag className="text-2xl font-black tracking-tight text-text-primary">
              {title}
            </Tag>
            {badge}
          </div>

          {description && (
            <div className="mt-0.5 text-sm text-text-secondary">
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </div>
  )
}
