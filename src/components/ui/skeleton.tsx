/**
 * src/components/ui/skeleton.tsx
 *
 * Skeleton Loading System — Enterprise shimmer components
 *
 * Exports: SkeletonCard, SkeletonStatsGrid, SkeletonTable, SkeletonList, SkeletonChart
 * Features: 'use client'
 */

// ============================================
// Skeleton Loading System — Enterprise shimmer components
// ============================================

'use client'

import { cn } from '@/lib/utils'

// ─── Base shimmer ─────────────────────────────
function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-lg bg-black/5 dark:bg-white/5 relative overflow-hidden',
        className
      )}
      style={style}
    >
      {/* Brand-tinted shimmer sweep */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.06) 40%, rgba(52,211,153,0.10) 50%, rgba(16,185,129,0.06) 60%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        }}
      />
    </div>
  )
}

// ─── Skeleton Card ────────────────────────────
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div aria-busy="true" aria-label="Carregando conteúdo" className={cn('rounded-xl border border-border-light bg-black/3 dark:bg-white/3 backdrop-blur-sm p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-8 w-32" />
        </div>
        <Shimmer className="h-10 w-10 rounded-xl" />
      </div>
      <Shimmer className="mt-4 h-3 w-40" />
    </div>
  )
}

// ─── Skeleton Stats Grid ──────────────────────
export function SkeletonStatsGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// ─── Skeleton Table ───────────────────────────
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-light bg-black/2 dark:bg-white/2 shadow-sm backdrop-blur-sm">
      {/* Header */}
      <div className="flex gap-4 border-b border-border-light bg-black/3 dark:bg-white/3 px-5 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="h-3.5 flex-1 max-w-30" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 border-b border-border-light px-5 py-4 last:border-0"
        >
          <Shimmer className="h-8 w-8 shrink-0 rounded-full" />
          {Array.from({ length: cols - 1 }).map((_, colIdx) => (
            <Shimmer
              key={colIdx}
              className={cn(
                'h-4 flex-1',
                colIdx === 0 ? 'max-w-45' : 'max-w-25'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Skeleton List ────────────────────────────
export function SkeletonList({ count = 5, withAvatar = true }: { count?: number; withAvatar?: boolean }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-border-light bg-black/2 dark:bg-white/2 p-4 backdrop-blur-sm"
        >
          {withAvatar && <Shimmer className="h-10 w-10 shrink-0 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-2/5" />
            <Shimmer className="h-3 w-3/5" />
          </div>
          <Shimmer className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// ─── Skeleton Chart ───────────────────────────
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border-light bg-black/2 dark:bg-white/2 p-5 backdrop-blur-sm', className)}>
      <div className="space-y-2">
        <Shimmer className="h-5 w-32" />
        <Shimmer className="h-3 w-48" />
      </div>
      {/* Fake chart bars */}
      <div className="mt-6 flex items-end justify-between gap-2 h-40">
        {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
          <Shimmer
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      {/* X-axis labels */}
      <div className="mt-3 flex justify-between gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Shimmer key={i} className="h-2.5 flex-1 max-w-7.5" />
        ))}
      </div>
    </div>
  )
}

// ─── Skeleton Profile ─────────────────────────
export function SkeletonProfile() {
  return (
    <div className="rounded-2xl border border-border-light bg-black/2 dark:bg-white/2 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Shimmer className="h-16 w-16 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-5 w-40" />
          <Shimmer className="h-3.5 w-56" />
          <Shimmer className="h-3 w-32" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Skeleton Page (full page loading) ────────
export function SkeletonPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Shimmer className="h-7 w-48" />
        <Shimmer className="h-4 w-72" />
      </div>
      {/* Stats */}
      <SkeletonStatsGrid count={4} />
      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      {/* Table */}
      <SkeletonTable />
    </div>
  )
}

// ─── Skeleton Form ────────────────────────────
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="rounded-2xl border border-border-light bg-black/2 dark:bg-white/2 p-6 backdrop-blur-sm">
      <Shimmer className="mb-6 h-6 w-40" />
      <div className="space-y-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Shimmer className="h-3.5 w-24" />
            <Shimmer className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <Shimmer className="mt-6 h-10 w-32 rounded-xl" />
    </div>
  )
}

// ─── Export all ────────────────────────────────
export { Shimmer }
