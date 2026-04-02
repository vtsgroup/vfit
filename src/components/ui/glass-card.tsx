/**
 * src/components/ui/glass-card.tsx
 *
 * GlassCard — Premium glassmorphism card component
 *
 * Exports: GlassCard, CardHeader, CardContent, CardFooter, StatsCard
 * Features: 'use client'
 */

// ============================================
// GlassCard — Premium glassmorphism card component
// Variants: surface, glass, elevated, outline, glow
// ============================================

'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'surface' | 'glass' | 'elevated' | 'outline' | 'glow' | 'gradient'
type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type CardRadius = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  radius?: CardRadius
  /** Enable hover elevation effect */
  hover?: boolean
  /** Show as clickable (cursor + hover) */
  clickable?: boolean
  /** Disable the card visually */
  disabled?: boolean
}

const VARIANT_STYLES: Record<CardVariant, string> = {
  surface: 'surface-card',
  glass: 'glass light:bg-white/75 light:border-slate-200/50',
  elevated: 'bg-bg-tertiary shadow-[0_4px_16px_rgba(0,0,0,0.16),0_2px_4px_rgba(0,0,0,0.06)] light:bg-slate-50 light:shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
  outline: 'border border-border-light bg-transparent',
  glow: 'surface-card border-brand-primary/20 shadow-[0_0_30px_rgba(61,252,164,0.08)]',
  gradient: 'bg-linear-to-br from-bg-secondary via-bg-secondary to-brand-primary/4 border border-border-light light:from-white light:via-white light:to-emerald-50 light:border-slate-200/60',
}

const PADDING_STYLES: Record<CardPadding, string> = {
  none: '',
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
  xl: 'p-6 sm:p-8',
}

const RADIUS_STYLES: Record<CardRadius, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  '2xl': 'rounded-[20px]',
  '3xl': 'rounded-3xl',
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = 'surface',
      padding = 'md',
      radius = 'xl',
      hover = false,
      clickable = false,
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base
          'relative overflow-hidden',
          // Variant
          VARIANT_STYLES[variant],
          // Padding
          PADDING_STYLES[padding],
          // Radius
          RADIUS_STYLES[radius],
          // Hover effect
          (hover || clickable) && !disabled && [
            'transition-all duration-200 ease-out',
            'hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.16)] light:hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]',
            'hover:border-border-light/80',
          ],
          // Clickable
          clickable && !disabled && 'cursor-pointer active:scale-[0.99]',
          // Disabled
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

// ─── Card Header ──────────────────────────
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function CardHeader({ title, subtitle, icon, action, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)} {...props}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-text-primary light:text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-text-muted light:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── Card Content ─────────────────────────
export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  )
}

// ─── Card Footer ──────────────────────────
export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-4 flex items-center justify-between border-t border-border-light pt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── Stats Card (KPI Dashboard) ───────────
interface StatsCardProps {
  title: string
  value: string | number
  change?: { value: number; label?: string }
  icon?: React.ReactNode
  iconColor?: string
  variant?: 'default' | 'gradient' | 'compact'
  sparkline?: React.ReactNode
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  iconColor = 'text-brand-primary bg-brand-primary/10',
  variant = 'default',
  sparkline,
  className,
}: StatsCardProps) {
  const isPositive = change && change.value >= 0
  const changeColor = isPositive ? 'text-success' : 'text-error'
  const changeIcon = isPositive ? '↑' : '↓'

  return (
    <GlassCard
      variant={variant === 'gradient' ? 'gradient' : 'surface'}
      padding={variant === 'compact' ? 'sm' : 'md'}
      hover
      className={className}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-muted light:text-slate-500 truncate">{title}</p>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-text-primary light:text-slate-900 tabular-nums">
            {value}
          </p>
        </div>
        {icon && (
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', iconColor)}>
            {icon}
          </div>
        )}
      </div>

      {change && (
        <p className={cn('mt-3 text-sm font-medium', changeColor)}>
          {changeIcon} {Math.abs(change.value)}%
          {change.label && <span className="text-text-muted light:text-slate-400 font-normal"> {change.label}</span>}
        </p>
      )}

      {sparkline && variant !== 'compact' && (
        <div className="mt-3 h-10">{sparkline}</div>
      )}
    </GlassCard>
  )
}

// ─── Feature Card (Landing Page) ──────────
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  iconColor?: string
  gradient?: string
  className?: string
}

export function FeatureCard({
  icon,
  title,
  description,
  iconColor = 'text-brand-primary',
  gradient = 'from-brand-primary/10 to-transparent',
  className,
}: FeatureCardProps) {
  return (
    <GlassCard
      variant="surface"
      padding="lg"
      hover
      className={cn('group', className)}
    >
      {/* Gradient accent top-left */}
      <div className={cn(
        'absolute top-0 left-0 h-32 w-32 -translate-x-8 -translate-y-8 rounded-full bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
        gradient
      )} />

      <div className="relative">
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-2xl bg-white/4 border border-white/6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg',
          'light:bg-slate-100 light:border-slate-200/60',
          iconColor
        )}>
          {icon}
        </div>

        <h3 className="mt-5 text-lg font-semibold text-text-primary light:text-slate-900 group-hover:text-brand-primary transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm text-text-muted light:text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>
    </GlassCard>
  )
}
