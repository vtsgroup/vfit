/**
 * src/components/assessments/assessment-detail.tsx
 *
 * Assessment Detail — Client Component
 *
 * Exports: AssessmentDetailClient
 * Hooks: useEffect, useState, useAssessment, useDeleteAssessment, useEditAssessmentPhotos, useRequestAssessmentPdf
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Assessment Detail — Client Component
// ============================================


'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import {
  useAssessment,
  useDeleteAssessment,
  useEditAssessmentPhotos,
  useRequestAssessmentPdf,
  useAssessmentPdfStatus,
  useAssessmentEvolution,
  useShareAssessment,
  useUpdateAssessment,
} from '@/hooks/use-assessments'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AssessmentDetailSkeleton } from '@/components/ui/page-skeletons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider'
import AssessmentResultV2 from '@/components/assessments/assessment-result-v2'
import EvolutionCharts from '@/components/assessments/evolution-charts'
import { HealthIndicatorsSection } from '@/components/assessments/health-indicators'
import { TemporalProjection } from '@/components/assessments/temporal-projection'
import { SignaturePad, SignedBadge } from '@/components/assessments/signature-pad'
import { useAuthStore } from '@/stores/auth-store'
import { generateBeforeAfterStoryPng, shareStoryImage } from '@/lib/story-export'

const measurementLabels: Record<string, string> = {
  chest: 'Peitoral',
  waist: 'Cintura',
  hips: 'Quadril',
  right_arm: 'Braço D (relax.)',
  left_arm: 'Braço E (relax.)',
  right_arm_contracted: 'Braço D (contra.)',
  left_arm_contracted: 'Braço E (contra.)',
  right_thigh: 'Coxa D',
  left_thigh: 'Coxa E',
  right_calf: 'Panturrilha D',
  left_calf: 'Panturrilha E',
  right_forearm: 'Antebraço D',
  left_forearm: 'Antebraço E',
  shoulders: 'Ombros',
  neck: 'Pescoço',
  abdomen: 'Abdômen',
  thorax_inspired: 'Tórax Inspirado',
  thorax_expired: 'Tórax Expirado',
  scapular_waist: 'Cintura Escapular',
}

const photoTypeLabels: Record<string, string> = {
  front: 'Frente',
  back: 'Costas',
  side_left: 'Lateral Esq.',
  side_right: 'Lateral Dir.',
  custom: 'Outra',
}

const photoOrderPriority: Record<string, number> = {
  front: 0,
  side_left: 1,
  side_right: 1,
  back: 2,
  custom: 3,
}

export default function AssessmentDetailClient({ id }: { id: string }) {
  const { data: assessment, isLoading } = useAssessment(id)
  const { data: evolution } = useAssessmentEvolution(id)
  const previousAssessmentId = evolution?.previous_assessment_id || ''
  const { data: previousAssessment } = useAssessment(previousAssessmentId)
  const deleteAssessment = useDeleteAssessment(id)
  const editPhotos = useEditAssessmentPhotos()
  const user = useAuthStore((s) => s.user)
  const canManage = user?.user_type === 'personal' || user?.role === 'admin' || user?.role === 'super_admin'

  const requestPdf = useRequestAssessmentPdf(id)
  const shareAssessment = useShareAssessment()
  const [pdfPolling, setPdfPolling] = useState(false)
  const { data: pdfStatus } = useAssessmentPdfStatus(id, pdfPolling)

  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [editStyle, setEditStyle] = useState<'leaner_man' | 'leaner_woman' | 'muscular_man' | null>(null)
  const [isSharingComparisons, setIsSharingComparisons] = useState(false)
  const [isSharingBeforeAfter, setIsSharingBeforeAfter] = useState(false)
  const [isExportingStory, setIsExportingStory] = useState(false)
  const [isExportingIaStory, setIsExportingIaStory] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const updateAssessment = useUpdateAssessment(id)

  useEffect(() => {
    if (!pdfPolling) return
    if (!pdfStatus) return

    if ('pdf_url' in pdfStatus && pdfStatus.pdf_url) {
      setPdfPolling(false)
      window.open(pdfStatus.pdf_url, '_blank', 'noopener,noreferrer')
    }
  }, [pdfPolling, pdfStatus])

  if (isLoading) return (
    <AuthGuard>
      <AssessmentDetailSkeleton />
    </AuthGuard>
  )

  if (!assessment) return (
    <AuthGuard>
      <div className="py-20 text-center">
        <p className="text-text-muted">Avaliação não encontrada.</p>
        <Link href="/dashboard/assessments" className="mt-2 text-sm text-brand-primary hover:underline">
          Voltar para avaliações
        </Link>
      </div>
    </AuthGuard>
  )

  function handleDelete() {
    deleteAssessment.mutate()
  }

  async function handlePdf(opts?: { force?: boolean }) {
    if (!assessment) return

    // Se já está pronto e não é force, abre direto
    const existingUrl = assessment.pdf_url
    if (!opts?.force && assessment.pdf_generated && existingUrl) {
      window.open(existingUrl, '_blank', 'noopener,noreferrer')
      return
    }

    // Solicita geração (ou gera síncrono, se queue não existir)
    try {
      const res = await requestPdf.mutateAsync({ force: opts?.force })
      if ('pdf_url' in res && res.pdf_url) {
        window.open(res.pdf_url, '_blank', 'noopener,noreferrer')
        return
      }
      setPdfPolling(true)
    } catch {
      // toast já é tratado no api-client; aqui evita crash
    }
  }

  async function handleShareComparisons() {
    if (!assessment?.ai_analysis?.edited_photos?.length) return

    setIsSharingComparisons(true)
    try {
      const ordered = [...assessment.ai_analysis.edited_photos].sort(
        (a, b) => (photoOrderPriority[a.type] ?? 999) - (photoOrderPriority[b.type] ?? 999)
      )

      const lines = ordered.flatMap((ep) => [
        `${photoTypeLabels[ep.type] || ep.type}`,
        `• Original: ${ep.original_url}`,
        `• IA: ${ep.edited_url}`,
      ])

      const text = [
        'Comparativo de evolução (Antes x IA)',
        `Aluno: ${assessment.student_name || 'Aluno'}`,
        '',
        ...lines,
      ].join('\n')

      if (navigator.share) {
        await navigator.share({
          title: 'Comparativo de Fotos — VFIT',
          text,
          url: window.location.href,
        })
        return
      }

      await navigator.clipboard.writeText(text)
      window.alert('Links de antes/depois copiados. Agora é só colar e enviar para o aluno.')
    } catch {
      // usuário cancelou share ou navegador bloqueou; não quebra UX
    } finally {
      setIsSharingComparisons(false)
    }
  }

  async function handleExportIaStory() {
    if (!assessment?.ai_analysis?.edited_photos?.length) return
    const ordered = [...assessment.ai_analysis.edited_photos].sort(
      (a, b) => (photoOrderPriority[a.type] ?? 999) - (photoOrderPriority[b.type] ?? 999)
    )
    const first = ordered[0]
    if (!first?.original_url || !first?.edited_url) return

    setIsExportingIaStory(true)
    try {
      const metrics = [
        assessment.body_fat_percentage != null
          ? { label: '% Gordura', value: `${assessment.body_fat_percentage}%`, color: 'info' }
          : null,
        assessment.bmi != null
          ? { label: 'IMC', value: String(assessment.bmi), color: 'success' }
          : null,
        assessment.muscle_mass_kg != null
          ? { label: 'Massa Muscular', value: `${assessment.muscle_mass_kg} kg`, color: 'success' }
          : null,
        assessment.weight_kg != null
          ? { label: 'Peso', value: `${assessment.weight_kg} kg`, color: 'warning' }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string; color?: string }>

      const blob = await generateBeforeAfterStoryPng({
        title: 'Antes x IA',
        subtitle: 'Visualização gerada por IA',
        beforeUrl: first.original_url,
        afterUrl: first.edited_url,
        beforeLabel: 'ANTES',
        afterLabel: 'IA',
        metrics,
      })

      await shareStoryImage(blob, `story-antes-ia-${assessment.id}.png`)
    } catch {
      // best-effort
    } finally {
      setIsExportingIaStory(false)
    }
  }

  function pickPhotoUrlByTypes(
    photos: Array<{ type: string; url: string }> | undefined,
    types: string[]
  ): string | null {
    if (!photos || photos.length === 0) return null
    for (const t of types) {
      const found = photos.find((p) => p.type === t && typeof p.url === 'string')
      if (found?.url) return found.url
    }
    return null
  }

  async function handleShareBeforeAfter() {
    if (!assessment || !previousAssessment) return

    setIsSharingBeforeAfter(true)
    try {
      const currentPhotos = assessment.photos || []
      const prevPhotos = previousAssessment.photos || []

      const pairs: Array<{ label: string; before: string; after: string }> = []
      const addPair = (label: string, types: string[]) => {
        const before = pickPhotoUrlByTypes(prevPhotos, types)
        const after = pickPhotoUrlByTypes(currentPhotos, types)
        if (before && after) pairs.push({ label, before, after })
      }

      addPair('Frente', ['front'])
      addPair('Perfil', ['side_left', 'side_right'])
      addPair('Costas', ['back'])

      if (pairs.length === 0) return

      const text = [
        'Comparativo de evolução (Antes x Agora)',
        `Aluno: ${assessment.student_name || 'Aluno'}`,
        `Anterior: ${new Date(previousAssessment.assessment_date).toLocaleDateString('pt-BR')}`,
        `Atual: ${new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}`,
        '',
        ...pairs.flatMap((p) => [
          p.label,
          `• Antes: ${p.before}`,
          `• Agora: ${p.after}`,
        ]),
      ].join('\n')

      if (navigator.share) {
        await navigator.share({
          title: 'Antes e Depois — VFIT',
          text,
          url: window.location.href,
        })
        return
      }

      await navigator.clipboard.writeText(text)
      window.alert('Links de antes/depois copiados. Agora é só colar e enviar.')
    } catch {
      // best-effort
    } finally {
      setIsSharingBeforeAfter(false)
    }
  }

  async function handleExportStory(beforeUrl: string, afterUrl: string) {
    if (!assessment || !previousAssessment) return

    setIsExportingStory(true)
    try {
      const metrics = [
        assessment.body_fat_percentage != null
          ? { label: '% Gordura', value: `${assessment.body_fat_percentage}%`, color: 'info' }
          : null,
        assessment.bmi != null
          ? { label: 'IMC', value: String(assessment.bmi), color: 'success' }
          : null,
        assessment.muscle_mass_kg != null
          ? { label: 'Massa Muscular', value: `${assessment.muscle_mass_kg} kg`, color: 'success' }
          : null,
        assessment.weight_kg != null
          ? { label: 'Peso', value: `${assessment.weight_kg} kg`, color: 'warning' }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string; color?: string }>

      const blob = await generateBeforeAfterStoryPng({
        title: 'Antes x Agora',
        subtitle: `${new Date(previousAssessment.assessment_date).toLocaleDateString('pt-BR')} → ${new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}`,
        beforeUrl,
        afterUrl,
        beforeLabel: 'ANTES',
        afterLabel: 'AGORA',
        metrics,
      })

      await shareStoryImage(blob, `story-antes-agora-${assessment.id}.png`)
    } catch {
      // best-effort
    } finally {
      setIsExportingStory(false)
    }
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Back */}
        <Link
          href="/dashboard/assessments"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar para avaliações
        </Link>

        {/* Header card */}
        <div className="flex flex-col gap-4 rounded-xl border border-border-light bg-bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
              <DSIcon name="clipboardList" className="text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Avaliação Física
                {!assessment.student_id && (
                  <span className="ml-2 inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                    TESTE
                  </span>
                )}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-muted">
                <span className="flex items-center gap-1">
                  <DSIcon name="user" size={14} /> {assessment.student_name || '(Sem aluno - teste)'}
                </span>
                <span className="flex items-center gap-1">
                  <DSIcon name="calendar" size={14} />
                  {new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}
                </span>
                {assessment.photos.length > 0 && (
                  <span className="flex items-center gap-1">
                    <DSIcon name="camera" size={14} />
                    {assessment.photos.length} foto{assessment.photos.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex flex-wrap gap-2 shrink-0">
            {/* Signed badge or Sign button */}
            {assessment.notes?.includes('__SIGNED__') ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-brand-primary/20 bg-brand-primary/5 px-3 py-1.5 text-xs font-medium text-brand-primary">
                <DSIcon name="shield" size={14} />
                Assinado
              </div>
            ) : canManage && (
              <Button
                variant="outline"
                onClick={() => setShowSignaturePad(true)}
              >
                <DSIcon name="shield" size={16} className="mr-1.5" />
                Assinar
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => shareAssessment.mutate(id)}
              loading={shareAssessment.isPending}
            >
              <DSIcon name="share" size={16} className="mr-1.5" />
              Compartilhar
            </Button>

            <Button
              variant="outline"
              onClick={() => handlePdf()}
              loading={requestPdf.isPending}
            >
              <DSIcon name="fileDown" size={16} className="mr-1.5" />
              {assessment.pdf_generated && assessment.pdf_url ? 'Baixar PDF' : 'Gerar PDF'}
            </Button>

            {canManage && (
              <div className="relative">
                <Button variant="outline" size="icon" onClick={() => setShowMenu(!showMenu)}>
                  <DSIcon name="settings" size={16} />
                </Button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-border-light bg-bg-secondary py-1 shadow-lg">
                      {assessment.pdf_generated && (
                        <button
                          onClick={() => { handlePdf({ force: true }); setShowMenu(false) }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <DSIcon name="fileDown" size={16} /> Regenerar PDF
                        </button>
                      )}
                      <button
                        onClick={() => { setShowDeleteConfirm(true); setShowMenu(false) }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5"
                      >
                          <DSIcon name="trash" size={16} /> Remover avaliação
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete confirm */}
        {canManage && showDeleteConfirm && (
          <div className="rounded-xl border border-error/20 bg-error/5 p-4">
            <p className="text-sm font-medium text-error">
              Tem certeza que deseja remover esta avaliação?
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Esta ação é irreversível. Todas as fotos e dados serão removidos.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="danger" size="sm" onClick={handleDelete} loading={deleteAssessment.isPending}>
                Sim, remover
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Metrics grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon="dumbbell"
            label="Peso"
            value={assessment.weight_kg ? `${assessment.weight_kg} kg` : '—'}
            color="text-brand-primary"
          />
          <MetricCard
            icon="ruler"
            label="Altura"
            value={assessment.height_cm ? `${assessment.height_cm} cm` : '—'}
            color="text-info"
          />
          <MetricCard
            icon="percent"
            label="% Gordura"
            value={assessment.body_fat_percentage ? `${assessment.body_fat_percentage}%` : '—'}
            color="text-warning"
          />
          <MetricCard
            icon="dumbbell"
            label="Massa Muscular"
            value={assessment.muscle_mass_kg ? `${assessment.muscle_mass_kg} kg` : '—'}
            color="text-success"
          />
        </div>

        {/* ====== Assessment v2 Results ====== */}
        {(assessment.body_fat_percentage != null || assessment.fat_mass_kg != null || assessment.lean_mass_kg != null || assessment.protocol) && (
          <AssessmentResultV2 assessment={assessment} />
        )}

        {/* ====== Evolution Charts ====== */}
        {assessment.student_id && (
          <EvolutionCharts studentId={assessment.student_id} />
        )}

        {/* IMC + AI Feedback (legacy — hidden if v2 is active) */}
        {assessment.bmi && !assessment.protocol && (
          <Card className="border-brand-primary/30 bg-brand-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Índice de Massa Corporal (IMC)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* IMC Display */}
              <div className="flex items-center justify-between rounded-xl border border-brand-primary/20 bg-bg-secondary p-6">
                <div>
                  <p className="text-sm text-text-muted">Seu IMC</p>
                  <p className="text-4xl font-bold text-brand-primary">{assessment.bmi}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {assessment.bmi < 18.5
                      ? 'Abaixo do peso'
                      : assessment.bmi < 25
                        ? 'Peso ideal'
                        : assessment.bmi < 30
                          ? 'Sobrepeso'
                          : 'Obesidade'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Composição</p>
                  <p className="text-sm font-medium text-text-primary">
                    {assessment.weight_kg}kg / {assessment.height_cm}cm
                  </p>
                </div>
              </div>

              {/* AI Feedback */}
              {assessment.ai_analysis?.feedback && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="rounded-xl bg-success/10 border border-success/30 p-4">
                    <h3 className="font-semibold text-success mb-2">Visão Geral</h3>
                    <p className="text-sm text-text-secondary">
                      {assessment.ai_analysis.feedback.summary}
                    </p>
                  </div>

                  {/* Strengths */}
                  {assessment.ai_analysis?.feedback?.strengths && assessment.ai_analysis.feedback.strengths.length > 0 && (
                    <div className="rounded-xl bg-info/10 border border-info/30 p-4">
                      <h3 className="font-semibold text-info mb-3">Pontos Positivos</h3>
                      <ul className="space-y-2">
                        {assessment.ai_analysis.feedback.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="flex gap-2 text-sm text-text-secondary">
                            <span className="shrink-0">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {assessment.ai_analysis?.feedback?.improvements && assessment.ai_analysis.feedback.improvements.length > 0 && (
                    <div className="rounded-xl bg-warning/10 border border-warning/30 p-4">
                      <h3 className="font-semibold text-warning mb-3">Pontos a Melhorar</h3>
                      <ul className="space-y-2">
                        {assessment.ai_analysis.feedback.improvements.map((improvement: string, idx: number) => (
                          <li key={idx} className="flex gap-2 text-sm text-text-secondary">
                            <span className="shrink-0">→</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Measurements */}
          <Card>
            <CardHeader>
              <CardTitle>Medidas Corporais</CardTitle>
            </CardHeader>
            <CardContent>
              {assessment.measurements && Object.keys(assessment.measurements).length > 0 ? (
                <div className="space-y-2 text-sm">
                  {Object.entries(assessment.measurements).map(([key, value]) => {
                    if (!value) return null
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-text-muted">{measurementLabels[key] || key}</span>
                        <span className="font-medium text-text-primary">{value} cm</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-text-muted">
                  Nenhuma medida registrada.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              {assessment.notes ? (
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{assessment.notes}</p>
              ) : (
                <p className="py-4 text-center text-sm text-text-muted">
                  Nenhuma observação registrada.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Anamnese & Metas (from measurements passthrough fields) */}
        {assessment.measurements && (() => {
          const m = assessment.measurements as Record<string, unknown>
          const hasAnamnesis = Object.keys(m).some((k) => k.startsWith('anamnesis_') || k.startsWith('goal_'))
          if (!hasAnamnesis) return null

          const scoreItems: Array<{ label: string; key: string; max?: number }> = [
            { label: 'Autoimagem', key: 'anamnesis_self_image', max: 10 },
            { label: 'Autoestima', key: 'anamnesis_self_esteem', max: 10 },
            { label: 'Energia diária', key: 'anamnesis_daily_energy', max: 10 },
            { label: 'Estresse', key: 'anamnesis_stress', max: 10 },
            { label: 'Qualidade do sono', key: 'anamnesis_sleep_quality', max: 10 },
          ]

          const goalHealthItems: Array<{ label: string; key: string; unit: string }> = [
            { label: '% Gordura', key: 'goal_health_bf_pct', unit: '%' },
            { label: 'Peso alvo', key: 'goal_health_weight_kg', unit: 'kg' },
            { label: 'Cintura', key: 'goal_health_waist_cm', unit: 'cm' },
          ]

          const goalAestheticItems: Array<{ label: string; key: string; unit: string }> = [
            { label: '% Gordura mín.', key: 'goal_aesthetic_bf_min', unit: '%' },
            { label: '% Gordura máx.', key: 'goal_aesthetic_bf_max', unit: '%' },
            { label: 'Peso mín.', key: 'goal_aesthetic_weight_min', unit: 'kg' },
            { label: 'Peso máx.', key: 'goal_aesthetic_weight_max', unit: 'kg' },
          ]

          const visibleScores = scoreItems.filter((si) => m[si.key] != null)
          const visibleHealthGoals = goalHealthItems.filter((gi) => m[gi.key] != null)
          const visibleAestheticGoals = goalAestheticItems.filter((gi) => m[gi.key] != null)
          const medications = m['anamnesis_medications'] as string | undefined
          const mealsPerDay = m['anamnesis_meals_per_day'] as number | undefined
          const waterLiters = m['anamnesis_water_liters'] as number | undefined
          const activityGoal = m['anamnesis_activity_goal_per_week'] as number | undefined

          return (
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Perfil Psicológico */}
              {visibleScores.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <DSIcon name="brain" size={18} className="text-brand-primary" />
                      Perfil Psicológico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {visibleScores.map((si) => {
                      const val = Number(m[si.key])
                      const max = si.max ?? 10
                      const pct = Math.min(100, (val / max) * 100)
                      const color = pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-error'
                      return (
                        <div key={si.key}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="text-text-secondary">{si.label}</span>
                            <span className="font-semibold text-text-primary">{val}/{max}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-bg-tertiary">
                            <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                    {(medications || mealsPerDay != null || waterLiters != null || activityGoal != null) && (
                      <div className="border-t border-border-light pt-3 space-y-1.5 text-sm">
                        {mealsPerDay != null && (
                          <div className="flex justify-between"><span className="text-text-muted">Refeições/dia</span><span className="font-medium text-text-primary">{mealsPerDay}×</span></div>
                        )}
                        {waterLiters != null && (
                          <div className="flex justify-between"><span className="text-text-muted">Água/dia</span><span className="font-medium text-text-primary">{waterLiters} L</span></div>
                        )}
                        {activityGoal != null && (
                          <div className="flex justify-between"><span className="text-text-muted">Treinos/semana (meta)</span><span className="font-medium text-text-primary">{activityGoal}×</span></div>
                        )}
                        {medications && (
                          <div className="mt-1.5 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">{medications}</div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Metas */}
              {(visibleHealthGoals.length > 0 || visibleAestheticGoals.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <DSIcon name="target" size={18} className="text-brand-primary" />
                      Metas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {visibleHealthGoals.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Meta de Saúde</p>
                        <div className="space-y-1.5">
                          {visibleHealthGoals.map((gi) => (
                            <div key={gi.key} className="flex justify-between rounded-lg bg-success/5 px-3 py-1.5 text-sm">
                              <span className="text-text-secondary">{gi.label}</span>
                              <span className="font-semibold text-success">{String(m[gi.key] ?? '')} {gi.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {visibleAestheticGoals.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Meta Estética</p>
                        <div className="space-y-1.5">
                          {visibleAestheticGoals.map((gi) => (
                            <div key={gi.key} className="flex justify-between rounded-lg bg-brand-primary/5 px-3 py-1.5 text-sm">
                              <span className="text-text-secondary">{gi.label}</span>
                              <span className="font-semibold text-brand-primary">{String(m[gi.key] ?? '')} {gi.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )
        })()}

        {/* Health Indicators — S09-07 Anamnese & Hábitos Visual */}
        <HealthIndicatorsSection assessment={assessment} />

        {/* Temporal Projection — S09-08 */}
        {assessment.student_id && (
          <TemporalProjection assessment={assessment} studentId={assessment.student_id} />
        )}

        {/* AI Before/After Comparison */}
        {assessment.ai_analysis?.edited_photos && assessment.ai_analysis.edited_photos.length > 0 && (
          <Card className="border-brand-primary/30 bg-brand-primary/5">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <span>Comparativo IA — Antes e Depois</span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShareComparisons}
                    loading={isSharingComparisons}
                    className="transition-all duration-300 hover:shadow-[0_0_18px_rgba(61,252,164,0.25)]"
                  >
                    <DSIcon name="share" size={16} className="mr-1.5" />
                    Compartilhar
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isExportingIaStory}
                    onClick={handleExportIaStory}
                  >
                    {isExportingIaStory ? 'Gerando...' : 'Story'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-muted mb-4">
                Deslize para comparar. Toque em <strong>Tela cheia</strong> para uma visualização premium e use <strong>Compartilhar</strong> para enviar os links de antes/depois ao aluno.
              </p>
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {assessment.ai_analysis.edited_photos.map((ep, idx) => (
                  <div key={idx}>
                    <p className="mb-2 text-sm font-medium text-text-primary">
                      {photoTypeLabels[ep.type] || ep.type}
                    </p>
                    <ImageComparisonSlider
                      beforeUrl={ep.original_url}
                      afterUrl={ep.edited_url}
                      beforeLabel="Original"
                      afterLabel="IA"
                      alt={photoTypeLabels[ep.type] || ep.type}
                      storyGoal={ep.style === 'muscular_man' ? 'muscle_gain' : ep.style === 'leaner_man' || ep.style === 'leaner_woman' ? 'definition' : 'recomposition'}
                      storyPersona={ep.style === 'leaner_woman' ? 'female' : ep.style === 'leaner_man' || ep.style === 'muscular_man' ? 'male' : 'neutral'}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real Before/After Comparison (previous assessment photos) */}
        {previousAssessment?.photos?.length && assessment.photos.length ? (
          (() => {
            const currentPhotos = assessment.photos || []
            const prevPhotos = previousAssessment.photos || []
            const frontBefore = pickPhotoUrlByTypes(prevPhotos, ['front'])
            const frontAfter = pickPhotoUrlByTypes(currentPhotos, ['front'])
            const sideBefore = pickPhotoUrlByTypes(prevPhotos, ['side_left', 'side_right'])
            const sideAfter = pickPhotoUrlByTypes(currentPhotos, ['side_left', 'side_right'])
            const backBefore = pickPhotoUrlByTypes(prevPhotos, ['back'])
            const backAfter = pickPhotoUrlByTypes(currentPhotos, ['back'])

            const hasAny = Boolean(
              (frontBefore && frontAfter) || (sideBefore && sideAfter) || (backBefore && backAfter)
            )
            if (!hasAny) return null

            return (
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <span>Antes e Depois (Fotos reais)</span>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleShareBeforeAfter}
                        loading={isSharingBeforeAfter}
                      >
                        <DSIcon name="share" size={16} className="mr-1.5" />
                        Compartilhar
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={isExportingStory}
                        onClick={() => {
                          const b = frontBefore || sideBefore || backBefore
                          const a = frontAfter || sideAfter || backAfter
                          if (b && a) handleExportStory(b, a)
                        }}
                      >
                        {isExportingStory ? 'Gerando...' : 'Story'}
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">
                    {new Date(previousAssessment.assessment_date).toLocaleDateString('pt-BR')} → {new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {frontBefore && frontAfter && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-text-primary">Frente</p>
                        <ImageComparisonSlider
                          beforeUrl={frontBefore}
                          afterUrl={frontAfter}
                          beforeLabel="Antes"
                          afterLabel="Agora"
                          alt="Frente"
                        />
                      </div>
                    )}
                    {sideBefore && sideAfter && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-text-primary">Perfil</p>
                        <ImageComparisonSlider
                          beforeUrl={sideBefore}
                          afterUrl={sideAfter}
                          beforeLabel="Antes"
                          afterLabel="Agora"
                          alt="Perfil"
                        />
                      </div>
                    )}
                    {backBefore && backAfter && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-text-primary">Costas</p>
                        <ImageComparisonSlider
                          beforeUrl={backBefore}
                          afterUrl={backAfter}
                          beforeLabel="Antes"
                          afterLabel="Agora"
                          alt="Costas"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })()
        ) : null}

        {/* Edit with AI Button */}
        {canManage && assessment.photos.length > 0 && !assessment.ai_analysis?.edited_photos?.length && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-text-primary">Editar fotos com IA</p>
                  <p className="text-sm text-text-muted">
                    Gere uma visualização de como o aluno ficaria mais magro ou musculoso
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={editStyle === 'leaner_man' ? 'primary' : 'outline'}
                    className="transition-all duration-300 hover:shadow-[0_0_18px_rgba(61,252,164,0.28)] hover:-translate-y-0.5"
                    onClick={() => {
                      setEditStyle('leaner_man')
                      editPhotos.mutate({ assessment_id: id, style: 'leaner_man' })
                    }}
                    loading={editPhotos.isPending && editStyle === 'leaner_man'}
                    disabled={editPhotos.isPending}
                  >
                    Mais Magro
                  </Button>
                  <Button
                    size="sm"
                    variant={editStyle === 'muscular_man' ? 'primary' : 'outline'}
                    className="transition-all duration-300 hover:shadow-[0_0_18px_rgba(61,252,164,0.28)] hover:-translate-y-0.5"
                    onClick={() => {
                      setEditStyle('muscular_man')
                      editPhotos.mutate({ assessment_id: id, style: 'muscular_man' })
                    }}
                    loading={editPhotos.isPending && editStyle === 'muscular_man'}
                    disabled={editPhotos.isPending}
                  >
                    Mais Musculoso
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        {assessment.photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fotos ({assessment.photos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {assessment.photos
                  .sort((a, b) => {
                    const byType = (photoOrderPriority[a.type] ?? 999) - (photoOrderPriority[b.type] ?? 999)
                    if (byType !== 0) return byType
                    return a.order - b.order
                  })
                  .map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhoto(photo.url)}
                      className="group relative aspect-3/4 overflow-hidden rounded-xl border border-border-light"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photoTypeLabels[photo.type] || 'Foto'}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2">
                        <Badge variant="default" className="text-[9px] bg-black/40 text-white border-0">
                          {photoTypeLabels[photo.type] || photo.type}
                        </Badge>
                      </div>
                    </button>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photo Lightbox */}
        {selectedPhoto && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto}
                alt="Foto avaliação"
                className="max-h-[85vh] max-w-full rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </>
        )}

        {/* Signature Pad Modal — S11-06 */}
        {showSignaturePad && (
          <SignaturePad
            personalName={user?.full_name || 'Personal Trainer'}
            cref={(user as unknown as Record<string, string>)?.cref || undefined}
            isSigning={updateAssessment.isPending}
            onCancel={() => setShowSignaturePad(false)}
            onSign={(signatureDataUrl) => {
              const signatureMetadata = `__SIGNED__|${new Date().toISOString()}|${user?.full_name || ''}|${(user as unknown as Record<string, string>)?.cref || ''}`
              const existingNotes = assessment.notes || ''
              const newNotes = existingNotes
                ? `${existingNotes}\n\n${signatureMetadata}`
                : signatureMetadata
              updateAssessment.mutate(
                { notes: newNotes } as Record<string, string>,
                {
                  onSuccess: () => {
                    setShowSignaturePad(false)
                    // Store signature image locally for PDF rendering
                    try {
                      localStorage.setItem(`vfit:sig:${id}`, signatureDataUrl)
                    } catch { /* quota exceeded ok */ }
                  },
                }
              )
            }}
          />
        )}

        {/* Signed badge at bottom */}
        {assessment.notes?.includes('__SIGNED__') && (() => {
          const sigLine = assessment.notes!.split('\n').find(l => l.includes('__SIGNED__'))
          if (!sigLine) return null
          const parts = sigLine.split('|')
          return (
            <SignedBadge
              signedAt={parts[1] || assessment.updated_at}
              personalName={parts[2] || 'Personal'}
              cref={parts[3] || undefined}
            />
          )
        })()}
      </div>
    </AuthGuard>
  )
}

// ============================================
// Metric Card
// ============================================

function MetricCard({ icon, label, value, color }: {
  icon: DSIconName
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-secondary p-4">
      <DSIcon name={icon} size={20} className={cn(color)} />
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  )
}
