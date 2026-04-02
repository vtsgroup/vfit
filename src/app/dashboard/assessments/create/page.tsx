/**
 * src/app/dashboard/assessments/create/page.tsx
 *
 * Create Assessment Page — v2 Wizard
 *
 * Exports: CreateAssessmentPage
 * Hooks: useRouter, useStudents
 * Features: 'use client' · DSIcon
 */

// ============================================
// Create Assessment Page — v2 Wizard
// ============================================

'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { WizardPageSkeleton } from '@/components/ui/page-skeletons'
import { useStudents } from '@/hooks/use-students'

// Lazy-load assessment wizard (1253 lines, multi-step form)
const AssessmentFormV2 = dynamic(() => import('@/components/assessments/assessment-form-v2'), {
  ssr: false,
  loading: () => <WizardPageSkeleton />,
})

export default function CreateAssessmentPage() {
  const { data: studentData } = useStudents({ per_page: 200 })
  const router = useRouter()
  const students = studentData?.students ?? []

  return (
    <AuthGuard requiredType="personal">
      <div className="w-full space-y-6">
        {/* Back */}
        <Link
          href="/dashboard/assessments"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar para avaliações
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
            <DSIcon name="clipboardList" size={20} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary">
              Nova Avaliação Física
            </h1>
            <p className="text-sm text-text-muted">
              Wizard completo — protocolo, dobras, medidas e composição corporal.
            </p>
          </div>
        </div>

        {/* v2 Wizard */}
        <AssessmentFormV2
          students={students.map((s) => ({ id: s.id, full_name: s.full_name }))}
          onCancel={() => router.push('/dashboard/assessments')}
        />
      </div>
    </AuthGuard>
  )
}
