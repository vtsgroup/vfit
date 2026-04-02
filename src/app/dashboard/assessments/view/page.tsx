/**
 * src/app/dashboard/assessments/view/page.tsx
 *
 * Assessment View Page — /dashboard/assessments/view?id=xxx
 *
 * Exports: AssessmentViewPage
 * Hooks: useSearchParams
 * Features: 'use client'
 */

// ============================================
// Assessment View Page — /dashboard/assessments/view?id=xxx
// ============================================

'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { AssessmentDetailSkeleton } from '@/components/ui/page-skeletons'

// Lazy-load heavy assessment detail (892 lines + recharts charts)
const AssessmentDetailClient = dynamic(() => import('@/components/assessments/assessment-detail'), {
  ssr: false,
  loading: () => <AssessmentDetailSkeleton />,
})

function AssessmentViewContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''

  if (!id) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-muted">ID da avaliação não informado.</p>
        <a
          href="/dashboard/assessments"
          className="mt-2 inline-block text-sm text-brand-primary hover:underline"
        >
          Voltar para avaliações
        </a>
      </div>
    )
  }

  return <AssessmentDetailClient id={id} />
}

export default function AssessmentViewPage() {
  return (
    <Suspense
      fallback={
        <AssessmentDetailSkeleton />
      }
    >
      <AssessmentViewContent />
    </Suspense>
  )
}
