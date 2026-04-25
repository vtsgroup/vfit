/**
 * src/components/progresso/chart-skeleton.tsx
 *
 * Skeleton placeholders for KPI grid + bar charts while loading.
 * S2.6 — Phase 2: Skeleton states on charts
 */

'use client'

// Generic shimmer animation via CSS var
const shimmer = 'animate-pulse bg-white/5'

/** Single KPI card skeleton */
export function KPICardSkeleton() {
  return (
    <div className={`${shimmer} h-[84px] rounded-2xl`} />
  )
}

/** 2×3 KPI grid skeleton — matches the 6-card grid on progresso */
export function KPIGridSkeleton() {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Bar chart skeleton — mimics MiniBarChart layout */
export function BarChartSkeleton({ height = 100, bars = 7 }: { height?: number; bars?: number }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      {/* Title row */}
      <div className="mb-3 flex items-center gap-2">
        <div className={`${shimmer} h-3.5 w-3.5 rounded`} />
        <div className={`${shimmer} h-3 w-24 rounded`} />
      </div>

      {/* Bars */}
      <div
        className="flex items-end justify-between gap-1"
        style={{ height }}
      >
        {Array.from({ length: bars }).map((_, i) => {
          // Vary heights so it looks like real data
          const pct = 30 + ((i * 37 + 17) % 55)
          return (
            <div
              key={i}
              className={`${shimmer} flex-1 rounded-t-sm`}
              style={{ height: `${pct}%` }}
            />
          )
        })}
      </div>

      {/* X labels */}
      <div className="mt-2 flex justify-between gap-1">
        {Array.from({ length: bars }).map((_, i) => (
          <div key={i} className={`${shimmer} h-2.5 flex-1 rounded`} />
        ))}
      </div>
    </div>
  )
}

/** Full progresso page loading skeleton */
export function ProgressoPageSkeleton() {
  return (
    <>
      <KPIGridSkeleton />
      <div className="space-y-4">
        <BarChartSkeleton bars={7} />
        <BarChartSkeleton bars={7} />
      </div>
    </>
  )
}
