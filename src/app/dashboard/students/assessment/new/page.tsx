// ============================================
// page.tsx — Nova avaliação física para aluno
// ============================================
//
// O que faz:
//   Página para criar nova avaliação física de um aluno específico.
//   studentId lido de useSearchParams(?studentId=).
//   Renderiza AssessmentWizard com o ID do aluno pré-preenchido.
//   Botão de voltar para perfil do aluno.
//
// Auth: requiredType="personal"
//
// Exports principais:
//   StudentAssessmentWizardPage — page component (client)
'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { AssessmentWizard } from '@/components/assessments/assessment-wizard'

export default function StudentAssessmentWizardPage() {
  const router = useRouter()
  const params = useSearchParams()
  const studentId = params.get('studentId') || ''

  if (!studentId) {
    return (
      <AuthGuard requiredType="personal">
        <div className="w-full space-y-4">
          <p className="text-sm text-text-muted">Aluno não informado para iniciar avaliação.</p>
          <Link href="/dashboard/students" className="text-sm text-brand-primary hover:underline">
            Voltar para alunos
          </Link>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredType="personal">
      <div className="w-full space-y-6">
        <Link
          href={`/dashboard/students/view?id=${encodeURIComponent(studentId)}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar para aluno
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
            <DSIcon name="clipboardList" className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary">Nova avaliação física</h1>
            <p className="text-sm text-text-muted">Wizard de 5 etapas com medidas, dobras, fotos e comparativo.</p>
          </div>
        </div>

        <AssessmentWizard
          studentId={studentId}
          onCancel={() => router.push(`/dashboard/students/view?id=${encodeURIComponent(studentId)}`)}
        />
      </div>
    </AuthGuard>
  )
}
