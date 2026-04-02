/**
 * src/app/dashboard/assessments/success-detail/page.tsx
 *
 * Assessment Success Page — Full Screen Preview
 *
 * Exports: SuccessPage
 * Hooks: useSearchParams
 * Features: 'use client'
 */

// ============================================
// Assessment Success Page — Full Screen Preview
// ============================================

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SuccessContent from './success-content'

/** Shimmer placeholder for assessment detail */
function DetailSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="w-full max-w-2xl space-y-6 p-6">
        <div className="relative h-8 w-48 overflow-hidden rounded-lg bg-border-light/60">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="rounded-2xl border border-border-light bg-bg-secondary p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="relative h-4 w-28 overflow-hidden rounded bg-border-light/60">
                <div className="shimmer absolute inset-0" />
              </div>
              <div className="relative h-4 w-20 overflow-hidden rounded bg-border-light/60">
                <div className="shimmer absolute inset-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-red-600">Avaliação não encontrada</p>
      </div>
    )
  }

  return <SuccessContent params={{ id }} />
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <SuccessPageContent />
    </Suspense>
  )
}
