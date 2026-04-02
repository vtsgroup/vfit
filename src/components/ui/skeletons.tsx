/**
 * src/components/ui/skeletons.tsx
 *
 * Skeletons — Contextual loading placeholders
 *
 * Exports: StatsSkeleton, TableSkeleton, CardGridSkeleton, ChatSkeleton, DetailSkeleton
 * Features: 'use client'
 */

// ============================================
// Skeletons — Contextual loading placeholders
// 6 variants for different content types
// ============================================

'use client'

import { cn } from '@/lib/utils'

// Base skeleton pulse
function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-bg-tertiary',
        className
      )}
    />
  )
}

// ============================================
// Dashboard Stats Skeleton
// ============================================
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-5">
          <div className="flex items-center justify-between">
            <Bone className="h-4 w-24" />
            <Bone className="h-9 w-9 rounded-lg" />
          </div>
          <Bone className="mt-3 h-8 w-20" />
          <Bone className="mt-2 h-3 w-32" />
        </div>
      ))}
    </div>
  )
}

// ============================================
// Table / List Skeleton
// ============================================
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border-light bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border-light px-5 py-3">
        <Bone className="h-4 w-32" />
        <Bone className="h-4 w-24" />
        <Bone className="h-4 w-20 ml-auto" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-4 px-5 py-4',
            i < rows - 1 && 'border-b border-border-light'
          )}
        >
          <Bone className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Bone className="h-4 w-40" />
            <Bone className="h-3 w-24" />
          </div>
          <Bone className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ============================================
// Card Grid Skeleton
// ============================================
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-5">
          <div className="flex items-start justify-between">
            <Bone className="h-10 w-10 rounded-lg" />
            <Bone className="h-6 w-16 rounded-full" />
          </div>
          <Bone className="mt-4 h-5 w-3/4" />
          <Bone className="mt-2 h-4 w-1/2" />
          <div className="mt-4 flex gap-2">
            <Bone className="h-6 w-14 rounded-full" />
            <Bone className="h-6 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// Chat Skeleton
// ============================================
export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Message left */}
      <div className="flex gap-3">
        <Bone className="h-8 w-8 rounded-full shrink-0" />
        <div className="space-y-2">
          <Bone className="h-16 w-56 rounded-2xl rounded-tl-sm" />
          <Bone className="h-3 w-16" />
        </div>
      </div>
      {/* Message right */}
      <div className="flex gap-3 flex-row-reverse">
        <Bone className="h-8 w-8 rounded-full shrink-0" />
        <div className="space-y-2 flex flex-col items-end">
          <Bone className="h-12 w-48 rounded-2xl rounded-tr-sm" />
          <Bone className="h-3 w-12" />
        </div>
      </div>
      {/* Message left */}
      <div className="flex gap-3">
        <Bone className="h-8 w-8 rounded-full shrink-0" />
        <div className="space-y-2">
          <Bone className="h-20 w-64 rounded-2xl rounded-tl-sm" />
          <Bone className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

// ============================================
// Profile / Detail Skeleton
// ============================================
export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Bone className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Bone className="h-6 w-48" />
          <Bone className="h-4 w-32" />
        </div>
      </div>
      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-4 space-y-2">
            <Bone className="h-3 w-20" />
            <Bone className="h-5 w-32" />
          </div>
        ))}
      </div>
      {/* Content block */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-5 space-y-3">
        <Bone className="h-5 w-40" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-3/4" />
        <Bone className="h-4 w-5/6" />
      </div>
    </div>
  )
}

// ============================================
// Form Skeleton
// ============================================
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-5 rounded-xl border border-border-light bg-bg-secondary p-6">
      <Bone className="h-6 w-40" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Bone className="h-4 w-24" />
          <Bone className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Bone className="h-10 w-28 rounded-lg" />
        <Bone className="h-10 w-20 rounded-lg" />
      </div>
    </div>
  )
}
