/**
 * src/components/ui/page-skeletons.tsx
 *
 * Page Skeletons — Layout-preserving placeholders
 *
 * Exports: AssessmentsPageSkeleton, NotificationsPageSkeleton, MarketplacePageSkeleton, MarketplaceDetailSkeleton, AffiliatesPageSkeleton, FinanceiroPageSkeleton, PlansPageSkeleton, CalendarPageSkeleton, AIPageSkeleton, AdminFeedbackPageSkeleton, FormPageSkeleton, CheckoutPageSkeleton, WizardPageSkeleton
 * Features: 'use client'
 */

// ============================================
// Page Skeletons — Layout-preserving placeholders
// Matches exact rendered layout of each page to
// minimize CLS (Cumulative Layout Shift).
// ============================================

'use client'

import { cn } from '@/lib/utils'

// ─── Base shimmer (reuse the global .shimmer animation) ────
function S({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn('rounded-lg bg-border-light/60 relative overflow-hidden', className)}
      style={style}
    >
      <div className="shimmer absolute inset-0" />
    </div>
  )
}

// ─── Shared building blocks ────────────────────────────────

/** Header: icon square + title + subtitle */
function SkeletonHeader({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <S className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <S className="h-6 w-40" />
          <S className="h-3.5 w-56" />
        </div>
      </div>
      {withAction && <S className="h-9 w-32 rounded-lg" />}
    </div>
  )
}

/** Filter bar: search input + optional selects */
function SkeletonFilters({ selects = 1 }: { selects?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <S className="h-9 flex-1 min-w-48 rounded-lg" />
      <S className="h-9 w-16 rounded-lg" />
      {Array.from({ length: selects }).map((_, i) => (
        <S key={i} className="h-9 w-36 rounded-lg" />
      ))}
    </div>
  )
}

/** Pagination footer */
function SkeletonPagination() {
  return (
    <div className="flex items-center justify-between">
      <S className="h-4 w-28" />
      <div className="flex gap-2 items-center">
        <S className="h-8 w-8 rounded-lg" />
        <S className="h-4 w-12" />
        <S className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  )
}

/** Generic list item row with icon + text + trailing */
function SkeletonListItem({ withTrailing = true }: { withTrailing?: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border-light bg-bg-secondary p-4">
      <S className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <S className="h-4 w-2/5" />
        <S className="h-3 w-3/5" />
      </div>
      {withTrailing && <S className="h-8 w-20 rounded-lg" />}
    </div>
  )
}

// ─── Page-specific skeletons ───────────────────────────────

// ============================================
// Assessments List — /dashboard/assessments
// Header + list of assessment cards + pagination
// ============================================
export function AssessmentsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <S className="h-7 w-44" />
          <S className="h-4 w-48" />
        </div>
        <S className="h-9 w-36 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border-light bg-bg-secondary p-4">
            <S className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <S className="h-4 w-52" />
              <S className="h-3 w-36" />
            </div>
            <div className="hidden md:flex items-center gap-4">
              <S className="h-4 w-16" />
              <S className="h-5 w-20 rounded-full" />
            </div>
            <div className="hidden sm:block">
              <S className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
      <SkeletonPagination />
    </div>
  )
}

// ============================================
// Notifications — /dashboard/notifications
// Header + mark-all button + notification cards
// ============================================
export function NotificationsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <S className="h-7 w-36" />
          <S className="h-4 w-32" />
        </div>
        <S className="h-8 w-48 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-border-light bg-bg-secondary p-4">
            <S className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <S className="h-4 w-3/5" />
              <S className="h-3 w-4/5" />
              <S className="h-2.5 w-24" />
            </div>
            <div className="flex gap-1">
              <S className="h-7 w-7 rounded-lg" />
              <S className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Marketplace — /dashboard/marketplace
// Header + search/filters card + grid 3-col
// ============================================
export function MarketplacePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <S className="h-7 w-44" />
          <S className="h-4 w-64" />
        </div>
        <S className="h-9 w-32 rounded-lg" />
      </div>
      {/* Filters card */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-4 space-y-4">
        <S className="h-10 w-full rounded-lg" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <S key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex gap-3">
          <S className="h-8 w-28 rounded-lg" />
          <S className="h-8 w-32 rounded-lg" />
          <S className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary overflow-hidden">
            <S className="h-36 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <S className="h-5 w-16 rounded-full" />
                <S className="h-5 w-20 rounded-full" />
              </div>
              <S className="h-5 w-3/4" />
              <S className="h-3 w-full" />
              <S className="h-3 w-2/3" />
              <div className="flex items-center justify-between pt-2">
                <S className="h-6 w-20" />
                <S className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Marketplace Detail — /dashboard/marketplace/view
// Back + hero card + plan content
// ============================================
export function MarketplaceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <S className="h-4 w-36" />
      <div className="rounded-xl border border-border-light bg-bg-secondary overflow-hidden">
        <S className="h-48 sm:h-56 w-full rounded-none" />
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <S className="h-5 w-20 rounded-full" />
            <S className="h-5 w-16 rounded-full" />
          </div>
          <S className="h-7 w-3/5" />
          <S className="h-4 w-48" />
          <S className="h-4 w-full" />
          <S className="h-4 w-4/5" />
          <div className="grid grid-cols-4 gap-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border-light p-3 space-y-1.5">
                <S className="h-3 w-14" />
                <S className="h-5 w-10" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <S className="h-10 w-36 rounded-lg" />
            <S className="h-10 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Affiliates — /dashboard/affiliates
// Stats 4-col + progress + link card + tabs
// ============================================
export function AffiliatesPageSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-5">
            <div className="flex items-center justify-between">
              <S className="h-4 w-24" />
              <S className="h-9 w-9 rounded-lg" />
            </div>
            <S className="mt-3 h-7 w-20" />
            <S className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-4 space-y-3">
        <S className="h-4 w-40" />
        <S className="h-3 w-full rounded-full" />
        <S className="h-3 w-48" />
      </div>
      {/* Referral link */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-4 space-y-3">
        <S className="h-5 w-36" />
        <S className="h-10 w-full rounded-lg" />
        <div className="flex gap-2">
          <S className="h-9 w-24 rounded-lg" />
          <S className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <S key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>
      {/* Tab content */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Student Detail — /dashboard/students/view
// Back + profile card + stats + info grid
// ============================================
export function StudentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <S className="h-4 w-32" />
      {/* Profile header */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-5">
        <div className="flex items-center gap-4">
          <S className="h-16 w-16 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <S className="h-6 w-44" />
            <S className="h-4 w-56" />
            <div className="flex gap-2">
              <S className="h-5 w-16 rounded-full" />
              <S className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-4 space-y-2">
            <S className="h-3 w-20" />
            <S className="h-5 w-36" />
          </div>
        ))}
      </div>
      {/* Content block */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-5 space-y-3">
        <S className="h-5 w-32" />
        <S className="h-4 w-full" />
        <S className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// ============================================
// Workout Detail — /dashboard/workouts/view
// Back + header + exercise list
// ============================================
export function WorkoutDetailSkeleton() {
  return (
    <div className="space-y-6">
      <S className="h-4 w-32" />
      {/* Header card */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-5">
        <div className="flex items-start gap-4">
          <S className="h-14 w-14 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <S className="h-6 w-52" />
            <S className="h-4 w-36" />
            <div className="flex gap-2 pt-1">
              <S className="h-5 w-16 rounded-full" />
              <S className="h-5 w-14 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <S className="h-8 w-8 rounded-lg" />
            <S className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-3 text-center space-y-1.5">
            <S className="h-3 w-16 mx-auto" />
            <S className="h-5 w-10 mx-auto" />
          </div>
        ))}
      </div>
      {/* Exercise list */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-secondary p-3">
            <S className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <S className="h-4 w-40" />
              <S className="h-3 w-56" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Workout Execute — /dashboard/workouts/execute
// Loading screen while workout loads
// ============================================
export function WorkoutExecuteSkeleton() {
  return (
    <div className="space-y-6">
      <S className="h-4 w-32" />
      <div className="rounded-xl border border-border-light bg-bg-secondary p-5 space-y-4">
        <S className="h-7 w-56" />
        <S className="h-4 w-72" />
        <S className="h-2 w-full rounded-full" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border-light p-3">
              <S className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <S className="h-4 w-36" />
                <S className="h-3 w-48" />
              </div>
              <S className="h-6 w-6 rounded" />
            </div>
          ))}
        </div>
        <S className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

// ============================================
// Assessment Detail — /dashboard/assessments/view
// Back + info card + measurements grid + photos
// ============================================
export function AssessmentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <S className="h-4 w-32" />
      {/* Info card */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-5">
        <div className="flex items-center gap-4">
          <S className="h-14 w-14 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <S className="h-6 w-48" />
            <S className="h-4 w-32" />
          </div>
        </div>
      </div>
      {/* Measurements grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-3 space-y-1.5">
            <S className="h-3 w-16" />
            <S className="h-5 w-12" />
          </div>
        ))}
      </div>
      {/* Photos */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-5 space-y-3">
        <S className="h-5 w-24" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <S key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Payment Detail — /dashboard/payments/view
// Back + status card + breakdown + timeline
// ============================================
export function PaymentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <S className="h-4 w-32" />
      {/* Main card */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-5 space-y-4">
        <div className="flex items-center justify-between">
          <S className="h-7 w-36" />
          <S className="h-6 w-20 rounded-full" />
        </div>
        <S className="h-10 w-28" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <S className="h-4 w-24" />
            <S className="h-4 w-32" />
          </div>
          <div className="flex justify-between">
            <S className="h-4 w-20" />
            <S className="h-4 w-28" />
          </div>
          <div className="flex justify-between">
            <S className="h-4 w-28" />
            <S className="h-4 w-24" />
          </div>
        </div>
      </div>
      {/* Breakdown */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-5 space-y-3">
        <S className="h-5 w-28" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <S className="h-3.5 w-28" />
              <S className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Withdraw — /dashboard/payments/withdraw
// Back + header + balance cards + transfer list
// ============================================
export function WithdrawPageSkeleton() {
  return (
    <div className="space-y-6">
      <S className="h-4 w-40" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <S className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <S className="h-7 w-36" />
            <S className="h-4 w-44" />
          </div>
        </div>
        <S className="h-9 w-32 rounded-lg" />
      </div>
      {/* Balance cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-4 space-y-3">
            <div className="flex items-center gap-2">
              <S className="h-8 w-8 rounded-lg" />
              <S className="h-3 w-20" />
            </div>
            <S className="h-7 w-24" />
          </div>
        ))}
      </div>
      {/* Transfers */}
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Public Profile — /profile
// Hero + stats + specialties
// ============================================
export function PublicProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-6 text-center">
        <S className="h-24 w-24 rounded-full mx-auto" />
        <S className="mt-4 h-7 w-44 mx-auto" />
        <S className="mt-2 h-4 w-56 mx-auto" />
        <div className="mt-4 flex justify-center gap-6">
          <S className="h-4 w-20" />
          <S className="h-4 w-24" />
        </div>
      </div>
      {/* Specialties */}
      <div className="rounded-xl border border-border-light bg-bg-secondary p-5 space-y-3">
        <S className="h-5 w-32" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <S key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>
      {/* Reviews */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-4 space-y-2">
            <div className="flex items-center gap-3">
              <S className="h-8 w-8 rounded-full" />
              <S className="h-4 w-28" />
              <S className="ml-auto h-4 w-16" />
            </div>
            <S className="h-3 w-full" />
            <S className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Admin Dashboard — /dashboard/admin
// Header + 5-col metrics + 5-col finance + 2-col glass cards + quick links
// ============================================
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <S className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <S className="h-7 w-36" />
            <S className="h-4 w-48" />
          </div>
        </div>
        <S className="h-8 w-28 rounded-xl" />
      </div>
      {/* Metric cards 5-col */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-bg-secondary p-4">
            <div className="flex items-center gap-3">
              <S className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <S className="h-3 w-16" />
                <S className="h-5 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Finance cards 5-col */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-bg-secondary p-4 space-y-3">
            <div className="flex items-start justify-between">
              <S className="h-9 w-9 rounded-lg" />
              <S className="h-4 w-14 rounded-full" />
            </div>
            <S className="h-3 w-20" />
            <S className="h-6 w-24" />
          </div>
        ))}
      </div>
      {/* 2-col glass cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-5 space-y-3">
            <div className="flex items-center justify-between">
              <S className="h-5 w-32" />
              <S className="h-4 w-20" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 rounded-xl border border-border-light p-3">
                  <S className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <S className="h-4 w-28" />
                    <S className="h-3 w-20" />
                  </div>
                  <S className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-4">
            <div className="flex items-center gap-3">
              <S className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <S className="h-4 w-28" />
                <S className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Admin Users — /dashboard/admin/users
// Header + filters + user card list + pagination
// ============================================
export function AdminUsersPageSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonFilters selects={1} />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border-light bg-bg-secondary p-4">
            <S className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <S className="h-4 w-36" />
                <S className="h-4 w-16 rounded-full" />
              </div>
              <S className="h-3 w-48" />
            </div>
            <div className="flex gap-1.5">
              <S className="h-8 w-8 rounded-lg" />
              <S className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <SkeletonPagination />
    </div>
  )
}

// ============================================
// Admin Personals — /dashboard/admin/personals
// Header + filters + grid 3-col personal cards
// ============================================
export function AdminPersonalsPageSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonFilters selects={1} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-5 space-y-3">
            <div className="flex items-center gap-3">
              <S className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <S className="h-4 w-32" />
                <S className="h-3 w-40" />
              </div>
              <S className="h-5 w-12 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <S className="h-4 w-full" />
              <S className="h-4 w-full" />
              <S className="h-4 w-full" />
              <S className="h-4 w-full" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <S className="h-5 w-16 rounded-full" />
              <S className="h-5 w-20 rounded-full" />
              <S className="h-5 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <SkeletonPagination />
    </div>
  )
}

// ============================================
// Admin Payments — /dashboard/admin/payments
// Header + filters + table rows
// ============================================
export function AdminPaymentsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <S className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <S className="h-7 w-36" />
            <S className="h-4 w-32" />
          </div>
        </div>
        <S className="h-9 w-36 rounded-lg" />
      </div>
      <SkeletonFilters selects={2} />
      <div className="overflow-hidden rounded-xl border border-border-light">
        <div className="flex gap-4 border-b border-border-light bg-bg-secondary/50 px-4 py-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <S key={i} className="h-3.5 max-w-25 flex-1" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border-light/50 px-4 py-3 last:border-0">
            <div className="flex-1 space-y-1">
              <S className="h-4 w-28" />
              <S className="h-3 w-36" />
            </div>
            <div className="flex-1 space-y-1">
              <S className="h-4 w-24" />
              <S className="h-3 w-32" />
            </div>
            <S className="h-4 w-16" />
            <S className="h-5 w-12 rounded-full" />
            <S className="h-5 w-16 rounded-full" />
            <S className="h-3 w-20" />
            <S className="h-7 w-7 rounded" />
          </div>
        ))}
      </div>
      <SkeletonPagination />
    </div>
  )
}

// ============================================
// Admin Workouts — /dashboard/admin/workouts
// Header + filters + workout list items
// ============================================
export function AdminWorkoutsPageSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonFilters selects={1} />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border-light bg-bg-secondary p-4">
            <S className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <S className="h-4 w-40" />
                <S className="h-4 w-12 rounded-full" />
              </div>
              <S className="h-3 w-64" />
            </div>
            <S className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
      <SkeletonPagination />
    </div>
  )
}

// ============================================
// Messages — /dashboard/messages
// Split layout: conversation list + chat
// ============================================
export function MessagesPageSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-10rem)] overflow-hidden rounded-xl border border-border-light bg-bg-secondary">
      {/* Conversation list */}
      <div className="w-80 border-r border-border-light p-3 space-y-3 hidden lg:block">
        <S className="h-9 w-full rounded-lg" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-2.5">
              <S className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <S className="h-4 w-28" />
                <S className="h-3 w-40" />
              </div>
              <S className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-border-light px-4 py-3">
          <S className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <S className="h-4 w-28" />
            <S className="h-3 w-20" />
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 p-4 space-y-4">
          <div className="flex gap-3">
            <S className="h-8 w-8 shrink-0 rounded-full" />
            <S className="h-16 w-56 rounded-2xl" />
          </div>
          <div className="flex gap-3 flex-row-reverse">
            <S className="h-8 w-8 shrink-0 rounded-full" />
            <S className="h-12 w-48 rounded-2xl" />
          </div>
          <div className="flex gap-3">
            <S className="h-8 w-8 shrink-0 rounded-full" />
            <S className="h-20 w-64 rounded-2xl" />
          </div>
        </div>
        {/* Input */}
        <div className="border-t border-border-light p-3">
          <S className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ============================================
// Financeiro — /dashboard/financeiro
// 4 KPI cards + charts + 2 lists
// ============================================
export function FinanceiroPageSkeleton() {
  return (
    <div className="w-full space-y-6">
      <SkeletonHeader />
      {/* Export buttons */}
      <div className="flex gap-2">
        <S className="h-9 w-28 rounded-lg" />
        <S className="h-9 w-28 rounded-lg" />
      </div>
      {/* 4 KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-bg-secondary p-4">
            <div className="flex items-center gap-4">
              <S className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="space-y-2">
                <S className="h-3 w-20" />
                <S className="h-6 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Chart placeholder */}
      <div className="rounded-2xl border border-border-light bg-bg-secondary p-5">
        <S className="h-5 w-40 mb-4" />
        <S className="h-56 w-full rounded-xl" />
      </div>
      {/* 2 lists side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, j) => (
          <div key={j} className="rounded-2xl border border-border-light bg-bg-secondary p-5 space-y-3">
            <div className="flex items-center gap-2">
              <S className="h-5 w-5 rounded" />
              <S className="h-5 w-40" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border-light p-3">
                <div className="space-y-1.5">
                  <S className="h-4 w-28" />
                  <S className="h-3 w-36" />
                </div>
                <S className="h-4 w-16" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Plans — /dashboard/plans
// Plan cards grid (4 cards)
// ============================================
export function PlansPageSkeleton() {
  return (
    <div className="w-full space-y-6">
      <SkeletonHeader />
      {/* Billing toggle */}
      <div className="flex justify-center">
        <S className="h-10 w-64 rounded-full" />
      </div>
      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-bg-secondary p-5 space-y-4">
            <div className="flex items-center gap-3">
              <S className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <S className="h-4 w-16" />
                <S className="h-3 w-24" />
              </div>
            </div>
            <S className="h-8 w-28" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <S className="h-4 w-4 rounded-full" />
                  <S className="h-3 w-40" />
                </div>
              ))}
            </div>
            <S className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Calendar — /dashboard/calendar
// Weekly grid with time slots
// ============================================
export function CalendarPageSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Header bar: view toggle + nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <S className="h-9 w-24 rounded-lg" />
          <S className="h-9 w-24 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <S className="h-9 w-9 rounded-lg" />
          <S className="h-5 w-40" />
          <S className="h-9 w-9 rounded-lg" />
        </div>
        <S className="h-9 w-28 rounded-lg" />
      </div>
      {/* Calendar grid */}
      <div className="rounded-xl border border-border-light bg-bg-secondary overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-border-light">
          <S className="h-10 w-full" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center border-l border-border-light p-2">
              <S className="h-4 w-12" />
            </div>
          ))}
        </div>
        {/* Time rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid grid-cols-8 border-b border-border-light last:border-b-0" style={{ height: 48 }}>
            <div className="flex items-start justify-end pr-2 pt-1">
              <S className="h-3 w-10" />
            </div>
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="border-l border-border-light" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// AI — /dashboard/ai
// Chat interface with sidebar actions
// ============================================
export function AIPageSkeleton() {
  return (
    <div className="w-full space-y-6">
      <SkeletonHeader />
      {/* Stats row */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-3 space-y-2">
            <S className="h-3 w-16" />
            <S className="h-5 w-12" />
          </div>
        ))}
      </div>
      {/* Action cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-bg-secondary p-5 space-y-3">
            <S className="h-10 w-10 rounded-xl" />
            <S className="h-5 w-36" />
            <S className="h-3 w-full" />
            <S className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Admin Feedback — /dashboard/admin/feedback
// List + detail split panel
// ============================================
export function AdminFeedbackPageSkeleton() {
  return (
    <div className="w-full space-y-6">
      <SkeletonHeader />
      <SkeletonFilters selects={2} />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border-light bg-bg-secondary p-4">
            <S className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <S className="h-4 w-48" />
              <S className="h-3 w-72" />
            </div>
            <div className="flex items-center gap-2">
              <S className="h-5 w-16 rounded-full" />
              <S className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Form Page (generic) — assessments/create, students/import, etc.
// Header + form card skeleton
// ============================================
export function FormPageSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <S className="h-8 w-8 rounded-lg" />
        <div className="space-y-1.5">
          <S className="h-6 w-44" />
          <S className="h-3 w-56" />
        </div>
      </div>
      <div className="rounded-2xl border border-border-light bg-bg-secondary p-6 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <S className="h-3.5 w-24" />
            <S className="h-11 w-full rounded-lg" />
          </div>
        ))}
        <S className="h-11 w-36 rounded-xl" />
      </div>
    </div>
  )
}

// ============================================
// Checkout Page (generic) — plans/checkout, marketplace/checkout
// Summary card + payment method + CTA
// ============================================
export function CheckoutPageSkeleton() {
  return (
    <div className="mx-auto max-w-lg w-full space-y-6">
      <div className="flex items-center gap-3">
        <S className="h-8 w-8 rounded-lg" />
        <S className="h-6 w-32" />
      </div>
      {/* Plan summary */}
      <div className="rounded-2xl border border-border-light bg-bg-secondary p-5 space-y-4">
        <div className="flex items-center gap-3">
          <S className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <S className="h-5 w-32" />
            <S className="h-4 w-20" />
          </div>
        </div>
        <div className="border-t border-border-light pt-3 flex justify-between">
          <S className="h-4 w-16" />
          <S className="h-5 w-24" />
        </div>
      </div>
      {/* Payment methods */}
      <div className="rounded-2xl border border-border-light bg-bg-secondary p-5 space-y-3">
        <S className="h-5 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border-light p-3">
            <S className="h-8 w-8 rounded-lg" />
            <S className="h-4 w-28" />
          </div>
        ))}
      </div>
      {/* CTA */}
      <S className="h-12 w-full rounded-xl" />
    </div>
  )
}

// ============================================
// Wizard Page (generic) — workouts/create, complete-profile, onboarding
// Step indicator + form content
// ============================================
export function WizardPageSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <S className="h-8 w-8 rounded-lg" />
        <S className="h-6 w-44" />
      </div>
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <S className="h-8 w-8 rounded-full" />
            {i < 2 && <S className="h-0.5 w-12" />}
          </div>
        ))}
      </div>
      {/* Form content */}
      <div className="rounded-2xl border border-border-light bg-bg-secondary p-6 space-y-5">
        <S className="h-6 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <S className="h-3.5 w-24" />
            <S className="h-11 w-full rounded-lg" />
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-2">
          <S className="h-11 w-24 rounded-xl" />
          <S className="h-11 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
