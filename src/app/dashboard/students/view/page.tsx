/**
 * src/app/dashboard/students/view/page.tsx
 *
 * Student View Page — /dashboard/students/view?id=xxx
 *
 * Exports: StudentViewPage
 * Hooks: useSearchParams
 * Features: 'use client'
 */

// ============================================
// Student View Page — /dashboard/students/view?id=xxx
// ============================================
// Rota estática compatível com output: "export".
// O ID do aluno é recebido via query‑param (?id=).

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import StudentDetailClient from '@/components/students/student-detail'
import { StudentDetailSkeleton } from '@/components/ui/page-skeletons'

function StudentViewContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''

  if (!id) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-muted">ID do aluno não informado.</p>
        <a
          href="/dashboard/students"
          className="mt-2 inline-block text-sm text-brand-primary hover:underline"
        >
          Voltar para alunos
        </a>
      </div>
    )
  }

  return <StudentDetailClient id={id} />
}

export default function StudentViewPage() {
  return (
    <Suspense
      fallback={
        <StudentDetailSkeleton />
      }
    >
      <StudentViewContent />
    </Suspense>
  )
}
