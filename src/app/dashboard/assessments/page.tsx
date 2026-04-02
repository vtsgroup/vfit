/**
 * src/app/dashboard/assessments/page.tsx
 *
 * Assessments List Page — /dashboard/assessments
 *
 * Exports: AssessmentsPage
 * Hooks: useState, useRouter, useAssessments, useMyAssessments, useCreateTestStudent, useAuthStore
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Assessments List Page — /dashboard/assessments
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { formatRelativeTime } from '@/lib/utils'
import { useAssessments, useMyAssessments, type AssessmentListItem, type AssessmentListParams } from '@/hooks/use-assessments'
import { useCreateTestStudent } from '@/hooks/use-students'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { AssessmentsPageSkeleton } from '@/components/ui/page-skeletons'
import { StaggeredList } from '@/components/ui/staggered-list'
import { AssessmentTimeline } from '@/components/assessments/assessment-timeline'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'

export default function AssessmentsPage() {
  const [page, setPage] = useState(1)
  const router = useRouter()
  const createTestStudent = useCreateTestStudent()
  const user = useAuthStore((s) => s.user)
  const { isPersonalView } = useEffectiveUserView()
  const isPersonal = isPersonalView

  const params: AssessmentListParams = {
    page,
    per_page: 20,
    sort: 'assessment_date',
    order: 'desc',
  }

  const { data, isLoading, isError, refetch } = useAssessments(params)
  const assessments = data?.assessments ?? []
  const meta = data?.meta

  const { data: myData, isLoading: isMyLoading, isError: isMyError, refetch: myRefetch } = useMyAssessments({ page, per_page: 20 })
  const myAssessments = myData?.assessments ?? []
  const myMeta = myData?.meta

  return (
    <AuthGuard>
      <div className="space-y-6 stagger-children">
        {/* Header — DS v3 PageHeader */}
        <PageHeader
          title={isPersonal ? 'Avaliações Físicas' : 'Minhas Avaliações'}
          icon="clipboard"
          description={
            isPersonal
              ? (meta ? `${meta.total} avaliação${meta.total !== 1 ? 'ões' : ''} encontrada${meta.total !== 1 ? 's' : ''}` : <span className="inline-block h-3.5 w-40 animate-pulse rounded bg-black/8 dark:bg-white/8" />)
              : (myMeta ? `${myMeta.total} avaliação${myMeta.total !== 1 ? 'ões' : ''} encontrada${myMeta.total !== 1 ? 's' : ''}` : <span className="inline-block h-3.5 w-40 animate-pulse rounded bg-black/8 dark:bg-white/8" />)
          }
          actions={
            isPersonal ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => createTestStudent.mutate()}
                  disabled={createTestStudent.isPending}
                  title="Criar um aluno de teste para experimentar sem afetar dados reais"
                  className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                >
                  <DSIcon name="flask" size={16} />
                  Criar Teste
                </Button>
                <Link href="/dashboard/assessments/create">
                  <Button variant="assessment" className="relative overflow-hidden">
                    <DSIcon name="plus" size={16} />
                    Nova Avaliação
                    <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/15 to-transparent" />
                  </Button>
                </Link>
              </div>
            ) : undefined
          }
        />

        {/* List */}
        {isPersonal ? (
          isLoading ? (
            <AssessmentsPageSkeleton />
          ) : isError ? (
            <EmptyState
              illustration="assessments"
              title="Erro ao carregar avaliações"
              description="Não foi possível carregar as avaliações. Tente novamente."
              actionLabel="Tentar Novamente"
              onAction={() => refetch()}
            />
          ) : assessments.length === 0 ? (
            <EmptyState
              illustration="assessments"
              title="Nenhuma avaliação encontrada"
              description="Crie a primeira avaliação física de um aluno!"
              actionLabel="Nova Avaliação"
              onAction={() => router.push('/dashboard/assessments/create')}
            />
          ) : (
            <>
              <AssessmentTimeline assessments={assessments} className="mb-4" />
              <StaggeredList className="space-y-2">
                {assessments.map((assessment) => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </StaggeredList>
            </>
          )
        ) : (
          isMyLoading ? (
            <AssessmentsPageSkeleton />
          ) : isMyError ? (
            <EmptyState
              illustration="assessments"
              title="Erro ao carregar avaliações"
              description="Não foi possível carregar suas avaliações. Tente novamente."
              actionLabel="Tentar Novamente"
              onAction={() => myRefetch()}
            />
          ) : myAssessments.length === 0 ? (
            <EmptyState
              illustration="assessments"
              title="Nenhuma avaliação encontrada"
              description="Quando seu personal finalizar uma avaliação, ela aparecerá aqui."
            />
          ) : (
            <StaggeredList className="space-y-2">
              {myAssessments.map((a) => (
                <GlassCard
                  key={a.id}
                  variant="surface"
                  hover
                  clickable
                  padding="none"
                  className="flex items-center gap-4 p-4 w-full text-left"
                  onClick={() => router.push(`/dashboard/assessments/view?id=${a.id}`)}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                    <DSIcon name="clipboardList" size={20} className="text-brand-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      Avaliação — {new Date(a.assessment_date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted truncate">
                      {a.personal_name ? `Personal: ${a.personal_name}` : 'Personal'}
                    </p>
                  </div>

                  <div className="hidden items-center gap-4 text-xs text-text-muted md:flex">
                    {a.weight_kg && (
                      <div className="flex items-center gap-1" title="Peso">
                        <DSIcon name="scale" size={14} />
                        <span>{a.weight_kg} kg</span>
                      </div>
                    )}
                    {a.body_fat_percentage && (
                      <div className="flex items-center gap-1" title="% Gordura">
                        <DSIcon name="percent" size={14} />
                        <span>{a.body_fat_percentage}%</span>
                      </div>
                    )}
                    {a.muscle_mass_kg && (
                      <div className="flex items-center gap-1" title="Massa muscular">
                        <DSIcon name="dumbbell" size={14} />
                        <span>{a.muscle_mass_kg} kg</span>
                      </div>
                    )}
                    {a.fat_classification && (
                      <Badge variant="info" className="text-[10px]">{a.fat_classification}</Badge>
                    )}
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <DSIcon name="calendar" size={12} />
                      <span>{formatRelativeTime(a.created_at)}</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </StaggeredList>
          )
        )}

        {/* Pagination */}
        {(isPersonal ? meta : myMeta) && (isPersonal ? meta!.total_pages : myMeta!.total_pages) > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Página {(isPersonal ? meta!.page : myMeta!.page)} de {(isPersonal ? meta!.total_pages : myMeta!.total_pages)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={(isPersonal ? meta!.page : myMeta!.page) <= 1}
                onClick={() => setPage((isPersonal ? meta!.page : myMeta!.page) - 1)}
              >
                <DSIcon name="chevronLeft" size={16} />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(isPersonal ? meta!.page : myMeta!.page) >= (isPersonal ? meta!.total_pages : myMeta!.total_pages)}
                onClick={() => setPage((isPersonal ? meta!.page : myMeta!.page) + 1)}
              >
                Próxima
                <DSIcon name="chevronRight" size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}

// ============================================
// Assessment Card
// ============================================

function AssessmentCard({ assessment }: { assessment: AssessmentListItem }) {
  return (
    <GlassCard variant="surface" hover padding="none" className="p-4">
    <Link
      href={`/dashboard/assessments/view?id=${assessment.id}`}
      className="flex items-center gap-4"
    >
      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
        <DSIcon name="clipboardList" size={20} className="text-brand-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-text-primary truncate">
            Avaliação — {new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <DSIcon name="user" size={12} />
            {assessment.student_name}
          </span>
          {assessment.photo_count > 0 && (
            <span className="flex items-center gap-1">
              <DSIcon name="camera" size={12} />
              {assessment.photo_count} foto{assessment.photo_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Metrics (desktop) */}
      <div className="hidden items-center gap-4 text-xs text-text-muted md:flex">
        {assessment.weight_kg && (
          <div className="flex items-center gap-1" title="Peso">
            <DSIcon name="scale" size={14} />
            <span>{assessment.weight_kg} kg</span>
          </div>
        )}
        {assessment.body_fat_percentage && (
          <Badge variant="default" className="text-[10px]">
            {assessment.body_fat_percentage}% gordura
          </Badge>
        )}
      </div>

      {/* Date */}
      <div className="hidden shrink-0 text-right sm:block">
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <DSIcon name="calendar" size={12} />
          <span>{formatRelativeTime(assessment.created_at)}</span>
        </div>
      </div>
    </Link>
    </GlassCard>
  )
}
