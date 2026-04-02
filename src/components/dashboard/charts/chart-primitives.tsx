/**
 * src/components/dashboard/charts/chart-primitives.tsx
 *
 * Chart Primitives — Dashboard Pro
 *
 * Exports: ChartCard, ChartCardSkeleton, ChartTooltipGlass, ChartLegend, ChartEmptyState
 * Features: 'use client'
 */

// ============================================
// Chart Primitives — Dashboard Pro
// Ultra-clear design for easy readability
// ============================================

'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/glass-card'

interface ChartCardProps {
  title: string
  subtitle?: string
  rightActions?: ReactNode
  children: ReactNode
  className?: string
  chartClassName?: string
}

interface ChartCardSkeletonProps {
  title: string
  chartClassName?: string
}

export function ChartCard({
  title,
  subtitle,
  rightActions,
  children,
  className,
  chartClassName,
}: ChartCardProps) {
  return (
    <GlassCard variant="surface" padding="md" radius="2xl" className={className}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-primary">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
        </div>
        {rightActions && <div className="text-right">{rightActions}</div>}
      </div>

      <div className={cn('h-56', chartClassName)}>{children}</div>
    </GlassCard>
  )
}

export function ChartCardSkeleton({ title, chartClassName }: ChartCardSkeletonProps) {
  return (
    <GlassCard variant="surface" padding="md" radius="2xl">
      <span className="sr-only">{title}</span>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="h-5 w-32 animate-pulse rounded bg-black/5 dark:bg-white/5" />
          <div className="mt-1 h-4 w-24 animate-pulse rounded bg-black/5 dark:bg-white/5" />
        </div>
        <div className="text-right">
          <div className="h-6 w-24 animate-pulse rounded bg-black/5 dark:bg-white/5" />
        </div>
      </div>
      <div className={cn('h-56 flex items-center justify-center', chartClassName)}>
        <div className="h-full w-full animate-pulse rounded-xl bg-black/3 dark:bg-white/3" />
      </div>
    </GlassCard>
  )
}

export function ChartTooltipGlass({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-light bg-kpi-dark px-3.5 py-2.5 shadow-elevation-3 backdrop-blur-xl',
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================
// Chart Legend — Consistent didactic legend
// ============================================

export function ChartLegend({ items }: { items: Array<{ color: string; label: string }> }) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
          <span className="text-xs font-medium text-text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ============================================
// Chart Empty State
// ============================================

export function ChartEmptyState({ title, message }: { title: string; message: string }) {
  return (
    <GlassCard variant="surface" padding="md" radius="2xl">
      <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      <div className="flex h-44 items-center justify-center">
        <p className="text-sm text-text-muted">{message}</p>
      </div>
    </GlassCard>
  )
}