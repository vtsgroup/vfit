/**
 * src/components/ui/md3-badge.tsx
 *
 * MD3 Badge & Chip — Material Design 3
 *
 * Exports: MD3Badge, MD3Chip, MD3Status
 * Features: 'use client' · DSIcon
 */

// ============================================
// MD3 Badge & Chip — Material Design 3
// Tonal colors, icon support, dismissible
// ============================================

'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'

// ============================================
// MD3 Badge (small dot/count indicator)
// ============================================

interface MD3BadgeProps {
  /** Badge content (number, text, or empty for dot) */
  content?: number | string
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand'
  /** Size */
  size?: 'dot' | 'sm' | 'md'
  /** Pulsing animation */
  pulse?: boolean
  className?: string
  children?: ReactNode
}

const badgeColors = {
  default: 'bg-(--on-surface-variant) text-white',
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  brand: 'bg-brand-primary text-(--surface-container-lowest)',
}

export function MD3Badge({
  content,
  variant = 'error',
  size = 'sm',
  pulse = false,
  className,
  children,
}: MD3BadgeProps) {
  const isDot = size === 'dot' || content === undefined

  return (
    <span className={cn('relative inline-flex', className)}>
      {children}
      <span className={cn(
        'absolute flex items-center justify-center font-bold',
        badgeColors[variant],
        isDot && 'h-2.5 w-2.5 rounded-full -top-0.5 -right-0.5',
        size === 'sm' && !isDot && 'h-4 min-w-4 rounded-full px-1 text-[10px] -top-1 -right-1',
        size === 'md' && !isDot && 'h-5 min-w-5 rounded-full px-1.5 text-[11px] -top-1.5 -right-1.5',
        pulse && 'animate-pulse',
      )}>
        {!isDot && content}
      </span>
    </span>
  )
}

// ============================================
// MD3 Chip — Interactive, dismissible, tonal
// ============================================

type ChipVariant = 'tonal' | 'outlined' | 'elevated'
type ChipColor = 'default' | 'brand' | 'success' | 'warning' | 'error' | 'info' | 'ai'

interface MD3ChipProps {
  label: string
  icon?: ReactNode
  variant?: ChipVariant
  color?: ChipColor
  selected?: boolean
  dismissible?: boolean
  onDismiss?: () => void
  onClick?: () => void
  size?: 'sm' | 'md'
  className?: string
}

const chipTonalColors: Record<ChipColor, { bg: string; text: string; border: string; selectedBg: string }> = {
  default: {
    bg: 'bg-(--surface-container)',
    text: 'text-(--on-surface-variant)',
    border: 'border-(--outline-variant)',
    selectedBg: 'bg-(--surface-container-high)',
  },
  brand: {
    bg: 'bg-brand-primary/8',
    text: 'text-brand-primary',
    border: 'border-brand-primary/20',
    selectedBg: 'bg-brand-primary/15',
  },
  success: {
    bg: 'bg-emerald-500/8',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
    selectedBg: 'bg-emerald-500/15',
  },
  warning: {
    bg: 'bg-amber-500/8',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
    selectedBg: 'bg-amber-500/15',
  },
  error: {
    bg: 'bg-red-500/8',
    text: 'text-red-500',
    border: 'border-red-500/20',
    selectedBg: 'bg-red-500/15',
  },
  info: {
    bg: 'bg-blue-500/8',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
    selectedBg: 'bg-blue-500/15',
  },
  ai: {
    bg: 'bg-violet-500/8',
    text: 'text-violet-500',
    border: 'border-violet-500/20',
    selectedBg: 'bg-violet-500/15',
  },
}

export function MD3Chip({
  label,
  icon,
  variant = 'tonal',
  color = 'default',
  selected = false,
  dismissible = false,
  onDismiss,
  onClick,
  size = 'md',
  className,
}: MD3ChipProps) {
  const colors = chipTonalColors[color]

  const sizeClasses = {
    sm: 'h-7 text-xs px-2 gap-1',
    md: 'h-8 text-[13px] px-3 gap-1.5',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-lg font-medium transition-all duration-200',
        sizeClasses[size],
        variant === 'tonal' && cn(
          selected ? colors.selectedBg : colors.bg,
          colors.text,
          'border',
          selected ? colors.border : 'border-transparent',
          'hover:shadow-elevation-1'
        ),
        variant === 'outlined' && cn(
          'bg-transparent border',
          selected ? cn(colors.border, colors.text, colors.bg) : cn('border-(--outline)', 'text-(--on-surface-variant)'),
          'hover:bg-(--state-hover)'
        ),
        variant === 'elevated' && cn(
          selected ? cn(colors.bg, colors.text) : 'bg-(--surface-container-low) text-(--on-surface-variant)',
          'border border-(--outline-variant)',
          'shadow-elevation-1 hover:shadow-elevation-2'
        ),
        onClick && 'cursor-pointer active:scale-[0.97]',
        className
      )}
    >
      {/* Leading icon or checkmark for selected */}
      {selected && !icon && (
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
      {icon && <span className="shrink-0">{icon}</span>}

      <span>{label}</span>

      {/* Dismiss button */}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDismiss() }}
          className="shrink-0 ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-current/10 transition-colors"
        >
          <DSIcon name="x" size={12} />
        </button>
      )}
    </button>
  )
}

// ============================================
// MD3 Status Indicator (inline pill)
// ============================================

type StatusType = 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' | 'info'

interface MD3StatusProps {
  status: StatusType
  label?: string
  dot?: boolean
  className?: string
}

const statusStyles: Record<StatusType, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
  inactive: { bg: 'bg-zinc-500/10', text: 'text-zinc-500', dot: 'bg-zinc-500' },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500' },
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
  error: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500' },
  info: { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500' },
}

const statusLabels: Record<StatusType, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente',
  success: 'Sucesso',
  error: 'Erro',
  warning: 'Atenção',
  info: 'Info',
}

export function MD3Status({ status, label, dot = true, className }: MD3StatusProps) {
  const style = statusStyles[status]
  const displayLabel = label || statusLabels[status]

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
      style.bg,
      style.text,
      className
    )}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />}
      {displayLabel}
    </span>
  )
}
