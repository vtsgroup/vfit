/**
 * src/app/(app)/avaliacoes/[id]/client-page.tsx
 *
 * Detalhe de avaliação mobile com fallback inteligente:
 * - Autoavaliação (self_assessments)
 * - Avaliação completa profissional (assessments)
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useSelfAssessmentDetail,
  useSelfAssessments,
  useDeleteSelfAssessment,
  getBMIColor,
  getActivityLabel,
  getGoalLabel,
  type SelfAssessment,
} from '@/hooks/use-self-assessments'
import {
  useAssessment,
  useRequestAssessmentPdf,
  useAssessmentPdfStatus,
  type AssessmentDetail,
} from '@/hooks/use-assessments'
import { useLinkPersonalTrainer, useStudentProfile } from '@/hooks/use-student-app'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/stores/app-store'

const measurementLabels: Record<string, string> = {
  chest: 'Peitoral',
  waist: 'Cintura',
  hips: 'Quadril',
  right_arm: 'Braço direito',
  left_arm: 'Braço esquerdo',
  right_arm_contracted: 'Braço dir. contraído',
  left_arm_contracted: 'Braço esq. contraído',
  right_thigh: 'Coxa direita',
  left_thigh: 'Coxa esquerda',
  right_calf: 'Panturrilha direita',
  left_calf: 'Panturrilha esquerda',
  right_forearm: 'Antebraço direito',
  left_forearm: 'Antebraço esquerdo',
  shoulders: 'Ombros',
  neck: 'Pescoço',
  abdomen: 'Abdômen',
  thorax_inspired: 'Tórax inspirado',
  thorax_expired: 'Tórax expirado',
  scapular_waist: 'Cintura escapular',
}

const photoTypeLabels: Record<string, string> = {
  front: 'Frente',
  back: 'Costas',
  side_left: 'Lateral esquerda',
  side_right: 'Lateral direita',
  custom: 'Foto',
}

function fmt(v: number | string | null | undefined, decimals?: number): string {
  if (v == null || v === '') return '—'
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  if (decimals !== undefined) return n.toFixed(decimals)
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}

function parseMeasurements(value: unknown): Array<{ key: string; label: string; value: number }> {
  if (!value || typeof value !== 'object') return []
  return Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => typeof entry === 'number' && Number.isFinite(entry))
    .map(([key, entry]) => ({
      key,
      label: measurementLabels[key] || key.replace(/_/g, ' '),
      value: Number(entry),
    }))
}

export default function AvaliacaoDetalhePage() {
  const pathname = usePathname()
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const rawId = useParams<{ id: string }>().id
  const fallbackPathId = pathname.split('/').filter(Boolean).at(-1) ?? null
  const id = rawId && rawId !== '_' ? rawId : (fallbackPathId && fallbackPathId !== '_' ? decodeURIComponent(fallbackPathId) : null)

  const { data: selfAssessment, isLoading: selfLoading } = useSelfAssessmentDetail(id)
  const { data: completeAssessment, isLoading: completeLoading } = useAssessment(id || '')

  if (!isHydrated || (selfLoading && completeLoading)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <DSIcon name="loader" size={24} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  if (completeAssessment) {
    return <CompleteAssessmentView assessment={completeAssessment} assessmentId={id || completeAssessment.id} />
  }

  if (selfAssessment) {
    return <SelfAssessmentView assessment={selfAssessment} assessmentId={id} />
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <DSIcon name="clipboardList" size={22} className="text-slate-500" />
      </div>
      <p className="text-[15px] font-bold text-slate-900">Avaliação não encontrada</p>
      <p className="max-w-72 text-[13px] leading-relaxed text-slate-500">Essa avaliação pode não estar disponível para o seu perfil neste momento.</p>
      <button aria-label="Voltar" onClick={() => history.back()} className="mt-1 text-[13px] font-bold text-emerald-700">Voltar</button>
    </div>
  )
}

function CompleteAssessmentView({ assessment, assessmentId }: { assessment: AssessmentDetail; assessmentId: string }) {
  const router = useRouter()
  const requestPdf = useRequestAssessmentPdf(assessmentId)
  const [pdfPolling, setPdfPolling] = useState(false)
  const { data: pdfStatus } = useAssessmentPdfStatus(assessmentId, pdfPolling)

  useEffect(() => {
    if (!pdfPolling || !pdfStatus) return
    if ('pdf_url' in pdfStatus && pdfStatus.pdf_url) {
      setPdfPolling(false)
      window.open(pdfStatus.pdf_url, '_blank', 'noopener,noreferrer')
    }
  }, [pdfPolling, pdfStatus])

  async function handlePdf(force?: boolean) {
    if (!force && assessment.pdf_generated && assessment.pdf_url) {
      window.open(assessment.pdf_url, '_blank', 'noopener,noreferrer')
      return
    }

    const result = await requestPdf.mutateAsync(force ? { force: true } : undefined)
    if ('pdf_url' in result && result.pdf_url) {
      window.open(result.pdf_url, '_blank', 'noopener,noreferrer')
      return
    }

    setPdfPolling(true)
  }

  const date = new Date(assessment.assessment_date)
  const measurements = useMemo(() => parseMeasurements(assessment.measurements), [assessment.measurements])

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-[#f4f7f6] pb-28">
      <div className="relative overflow-hidden rounded-b-[34px] bg-[#071728] px-4 pb-6 pt-5 text-white shadow-[0_18px_48px_-24px_rgba(2,6,23,0.9)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(52,211,153,0.24),transparent_42%),radial-gradient(circle_at_12%_92%,rgba(14,165,233,0.16),transparent_46%)]" />

        <div className="relative flex items-center gap-3 pt-2">
          <button aria-label="Voltar" onClick={() => router.back()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-white">
            <DSIcon name="arrowLeft" size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">Avaliação completa</p>
            <h1 className="mt-1 text-[22px] font-black leading-tight text-white">
              {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </h1>
            <p className="mt-1 truncate text-[12px] font-medium text-slate-300">{assessment.student_name || 'Aluno VFIT'}</p>
          </div>

          <button aria-label="Exportar PDF" onClick={() => handlePdf()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-[0_12px_28px_-12px_rgba(52,211,153,0.8)]">
            <DSIcon name="fileDown" size={18} />
          </button>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2.5">
          <MetricPill label="Peso" value={fmt(assessment.weight_kg)} unit="kg" icon="scale" />
          <MetricPill label="IMC" value={fmt(assessment.bmi)} icon="activity" accent="sky" />
          <MetricPill label="Gordura" value={fmt(assessment.body_fat_percentage)} unit="%" icon="percent" accent="amber" />
          <MetricPill label="Massa muscular" value={fmt(assessment.muscle_mass_kg)} unit="kg" icon="dumbbell" accent="violet" />
        </div>
      </div>

      <div className="space-y-4 px-4 pt-5">
        <section className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-[0_18px_46px_-32px_rgba(15,23,42,0.35)]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Composição corporal</p>
              <h2 className="text-[18px] font-black text-slate-950">Diagnóstico</h2>
            </div>
            {assessment.protocol && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-100">
                {assessment.protocol.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <DataCard label="Gordura total" value={fmt(assessment.fat_mass_kg)} unit="kg" />
            <DataCard label="Massa magra" value={fmt(assessment.lean_mass_kg)} unit="kg" />
            <DataCard label="Músculo" value={fmt(assessment.muscle_mass_kg)} unit="kg" />
            <DataCard label="TMB" value={fmt(assessment.basal_metabolic_rate, 0)} unit="kcal" />
          </div>

          {(assessment.bmi_classification || assessment.fat_classification || assessment.waist_risk) && (
            <div className="mt-3 space-y-2">
              {assessment.bmi_classification && <TagRow label="IMC" value={assessment.bmi_classification} />}
              {assessment.fat_classification && <TagRow label="Gordura" value={assessment.fat_classification} />}
              {assessment.waist_risk && <TagRow label="Risco cintura" value={assessment.waist_risk} />}
            </div>
          )}
        </section>

        {assessment.ai_interpretation && (
          <section className="rounded-3xl border border-sky-100 bg-white p-4 shadow-[0_18px_46px_-32px_rgba(15,23,42,0.35)]">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                <DSIcon name="sparkles" size={16} />
              </div>
              <h2 className="text-[16px] font-black text-slate-950">Interpretação profissional</h2>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-700">{assessment.ai_interpretation}</p>
          </section>
        )}

        {measurements.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_46px_-32px_rgba(15,23,42,0.35)]">
            <div className="mb-3 flex items-center gap-2">
              <DSIcon name="ruler" size={15} className="text-emerald-700" />
              <h2 className="text-[15px] font-black text-slate-950">Perimetrias</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {measurements.map((m) => (
                <div key={m.key} className="flex items-center justify-between py-2.5">
                  <span className="text-[13px] font-medium text-slate-600">{m.label}</span>
                  <span className="text-[14px] font-black tabular-nums text-slate-950">{fmt(m.value)} cm</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {assessment.photos.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_46px_-32px_rgba(15,23,42,0.35)]">
            <div className="mb-3 flex items-center gap-2">
              <DSIcon name="camera" size={15} className="text-emerald-700" />
              <h2 className="text-[15px] font-black text-slate-950">Fotos da avaliação</h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {assessment.photos.map((photo, index) => (
                <figure key={photo.url + String(index)} className="overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                  <img src={photo.url} alt={'Foto ' + (photoTypeLabels[photo.type] || String(index + 1))} className="aspect-3/4 w-full object-cover" />
                  <figcaption className="px-2.5 py-2 text-[11px] font-bold text-slate-600">{photoTypeLabels[photo.type] || 'Foto'}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <DSIcon name="fileDown" size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-black text-slate-950">Exportável em PDF</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-600">Baixe ou regenere o relatório completo para compartilhar com aluno.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handlePdf()} loading={requestPdf.isPending}>
                  <DSIcon name="fileDown" size={14} />
                  {assessment.pdf_generated && assessment.pdf_url ? 'Baixar PDF' : 'Gerar PDF'}
                </Button>
                {assessment.pdf_generated && (
                  <Button size="sm" variant="outline" onClick={() => handlePdf(true)} loading={requestPdf.isPending}>
                    Regenerar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function SelfAssessmentView({ assessment, assessmentId }: { assessment: SelfAssessment; assessmentId: string | null }) {
  const router = useRouter()
  const { data: allAssessments } = useSelfAssessments(50)
  const deleteAssessment = useDeleteSelfAssessment(assessmentId)
  const { data: studentProfile } = useStudentProfile()
  const linkPersonalTrainer = useLinkPersonalTrainer()
  const [personalReferralCode, setPersonalReferralCode] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const personalInviteLink = (() => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://vfit.app.br'
    const params = new URLSearchParams({ source: 'student-invite', origin: 'avaliacao-detalhe', context: 'assessment-complete' })
    if (studentProfile?.id) params.set('student_id', studentProfile.id)
    return base + '/register/personal?' + params.toString()
  })()

  const prev = (() => {
    if (!allAssessments) return null
    const idx = allAssessments.findIndex((a) => a.id === assessment.id)
    return idx >= 0 && idx < allAssessments.length - 1 ? allAssessments[idx + 1] : null
  })()

  function handleDelete() {
    if (!assessmentId) return
    const confirmed = window.confirm('Tem certeza que deseja deletar definitivamente esta avaliação? Esta ação não pode ser desfeita.')
    if (!confirmed) return

    deleteAssessment.mutate(undefined, {
      onSuccess: () => {
        toast.success('Avaliação deletada com sucesso')
        router.push('/avaliacoes')
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Erro ao deletar avaliação'
        toast.error(msg)
      },
    })
  }

  const date = new Date(assessment.created_at)

  const measurements: { label: string; value: number | null; unit: string }[] = [
    { label: 'Peso', value: assessment.weight_kg, unit: 'kg' },
    { label: 'Altura', value: assessment.height_cm, unit: 'cm' },
    { label: 'Cintura', value: assessment.waist_cm, unit: 'cm' },
    { label: 'Quadril', value: assessment.hip_cm, unit: 'cm' },
    { label: 'Peito', value: assessment.chest_cm, unit: 'cm' },
    { label: 'Braço E.', value: assessment.arm_left_cm, unit: 'cm' },
    { label: 'Braço D.', value: assessment.arm_right_cm, unit: 'cm' },
    { label: 'Coxa E.', value: assessment.thigh_left_cm, unit: 'cm' },
    { label: 'Coxa D.', value: assessment.thigh_right_cm, unit: 'cm' },
    { label: 'Panturrilha E.', value: assessment.calf_left_cm, unit: 'cm' },
    { label: 'Panturrilha D.', value: assessment.calf_right_cm, unit: 'cm' },
  ]

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-[#f4f7f6] pb-28">
      <div className="relative overflow-hidden rounded-b-[34px] bg-[#071728] px-4 pb-6 pt-5 text-white shadow-[0_18px_48px_-24px_rgba(2,6,23,0.9)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(52,211,153,0.24),transparent_42%),radial-gradient(circle_at_12%_92%,rgba(14,165,233,0.16),transparent_46%)]" />
        <div className="relative flex items-center gap-3 pt-2">
          <button aria-label="Voltar" onClick={() => router.back()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-white">
            <DSIcon name="arrowLeft" size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">Avaliação física</p>
            <h1 className="mt-1 text-[22px] font-black leading-tight text-white">
              {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </h1>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-3 gap-2.5">
          <MetricPill label="Peso" value={fmt(assessment.weight_kg)} unit="kg" icon="scale" />
          <MetricPill label="IMC" value={fmt(assessment.bmi)} icon="activity" accent="sky" valueClass={getBMIColor(assessment.bmi)} />
          <MetricPill label="Gordura" value={fmt(assessment.body_fat_percentage)} unit="%" icon="percent" accent="amber" />
        </div>
      </div>

      <div className="space-y-4 px-4 pt-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_46px_-32px_rgba(15,23,42,0.35)]">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Classificação IMC</p>
          <p className={`mt-1 text-[24px] font-black tracking-tight ${getBMIColor(assessment.bmi)}`}>{assessment.bmi_category}</p>
          <BMIBar bmi={assessment.bmi} />
        </section>

        {prev && (
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_46px_-32px_rgba(15,23,42,0.35)]">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Evolução vs. {new Date(prev.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
            <div className="grid grid-cols-3 gap-3">
              <EvolutionStat label="Peso" current={assessment.weight_kg} previous={prev.weight_kg} unit="kg" />
              <EvolutionStat label="IMC" current={assessment.bmi} previous={prev.bmi} unit="" />
              {assessment.body_fat_percentage && prev.body_fat_percentage
                ? <EvolutionStat label="Gordura" current={assessment.body_fat_percentage} previous={prev.body_fat_percentage} unit="%" invert />
                : <DataCard label="Gordura" value="—" />}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          <MiniPanel icon="zap" label="Atividade" value={getActivityLabel(assessment.activity_level)} accent="amber" />
          <MiniPanel icon="target" label="Objetivo" value={getGoalLabel(assessment.goal)} accent="emerald" />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_46px_-32px_rgba(15,23,42,0.35)]">
          <div className="mb-3 flex items-center gap-2">
            <DSIcon name="ruler" size={15} className="text-emerald-700" />
            <h2 className="text-[15px] font-black text-slate-950">Medidas</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {measurements.map((m) => (
              <div key={m.label} className="flex items-center justify-between py-2.5">
                <span className="text-[13px] font-medium text-slate-600">{m.label}</span>
                <span className="text-[14px] font-black tabular-nums text-slate-950">{m.value !== null ? fmt(m.value) + ' ' + m.unit : '—'}</span>
              </div>
            ))}
          </div>
        </section>

        {assessment.notes && (
          <section className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Notas</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{assessment.notes}</p>
          </section>
        )}

        {!studentProfile?.personal_name && (
          <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50">
            <button type="button" onClick={() => setInviteOpen((v) => !v)} className="flex w-full items-center gap-3 px-4 py-4 text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <DSIcon name="userPlus" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-black text-slate-950">Transformar em avaliação completa</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">Convide um personal para validar, complementar e exportar seu relatório.</p>
              </div>
              <DSIcon name="chevronDown" size={18} className={`text-slate-600 transition-transform ${inviteOpen ? 'rotate-180' : ''}`} />
            </button>

            {inviteOpen && (
              <div className="border-t border-emerald-200 px-4 pb-4 pt-3">
                <div className="flex gap-2">
                  <Input
                    value={personalReferralCode}
                    onChange={(e) => setPersonalReferralCode(e.target.value.toUpperCase())}
                    placeholder="Código do personal"
                    disabled={linkPersonalTrainer.isPending || !!studentProfile?.personal_id}
                  />
                  <Button
                    onClick={() => linkPersonalTrainer.mutate(personalReferralCode)}
                    loading={linkPersonalTrainer.isPending}
                    disabled={!personalReferralCode.trim() || !!studentProfile?.personal_id}
                  >
                    Vincular
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(personalInviteLink)}>
                    <DSIcon name="copy" size={14} />
                    Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(`Olá! Quero te convidar para completar minha avaliação física no VFIT.\n\nCadastro: ${personalInviteLink}`), '_blank')}
                  >
                    <DSIcon name="share2" size={14} />
                    WhatsApp
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

        <Button variant="danger" className="w-full" loading={deleteAssessment.isPending} onClick={handleDelete}>
          <DSIcon name="trash2" size={16} />
          Deletar definitivamente
        </Button>
      </div>
    </div>
  )
}

function MetricPill({ label, value, unit, icon, accent = 'emerald', valueClass }: {
  label: string
  value: string
  unit?: string
  icon: 'scale' | 'activity' | 'percent' | 'dumbbell'
  accent?: 'emerald' | 'sky' | 'amber' | 'violet'
  valueClass?: string
}) {
  const colors = {
    emerald: 'bg-emerald-400/14 text-emerald-200 ring-emerald-300/20',
    sky: 'bg-sky-400/14 text-sky-200 ring-sky-300/20',
    amber: 'bg-amber-400/14 text-amber-200 ring-amber-300/20',
    violet: 'bg-violet-400/14 text-violet-200 ring-violet-300/20',
  }[accent]

  return (
    <div className="rounded-3xl border border-white/10 bg-white/8 p-3 shadow-glass-inset-sm">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-2xl ring-1 ${colors}`}>
        <DSIcon name={icon} size={14} />
      </div>
      <p className={`text-[24px] font-black leading-none tabular-nums ${valueClass || 'text-white'}`}>
        {value}
        {unit && <span className="ml-0.5 text-[10px] font-bold text-slate-300">{unit}</span>}
      </p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-300">{label}</p>
    </div>
  )
}

function DataCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-[18px] font-black tabular-nums text-slate-950">
        {value}
        {unit && <span className="ml-1 text-[10px] font-bold text-slate-500">{unit}</span>}
      </p>
    </div>
  )
}

function TagRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
      <span className="text-[12px] font-bold text-slate-500">{label}</span>
      <span className="text-right text-[12px] font-black text-slate-950">{value}</span>
    </div>
  )
}

function MiniPanel({ icon, label, value, accent }: { icon: 'zap' | 'target'; label: string; value: string; accent: 'amber' | 'emerald' }) {
  const color = accent === 'amber' ? 'bg-amber-50 text-amber-700 ring-amber-100' : 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_46px_-32px_rgba(15,23,42,0.35)]">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-2xl ring-1 ${color}`}>
        <DSIcon name={icon} size={15} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-[13px] font-black text-slate-950">{value}</p>
    </div>
  )
}

function BMIBar({ bmi }: { bmi: number }) {
  const pct = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))

  return (
    <div className="relative mt-4">
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="flex-1 bg-sky-400" />
        <div className="flex-1 bg-emerald-400" />
        <div className="flex-1 bg-amber-400" />
        <div className="flex-1 bg-red-400" />
      </div>
      <div className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-slate-950 shadow-sm" style={{ left: `${pct}%` }} />
      <div className="mt-2 flex justify-between text-[9px] font-bold text-slate-500">
        <span>15</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>40</span>
      </div>
    </div>
  )
}

function EvolutionStat({ label, current, previous, unit, invert }: {
  label: string
  current: number
  previous: number
  unit: string
  invert?: boolean
}) {
  const diff = +(current - previous).toFixed(1)
  const isPositive = diff > 0

  let color = 'text-slate-500'
  let arrow = ''
  if (diff !== 0) {
    const isGood = invert ? !isPositive : isPositive
    color = isGood ? 'text-emerald-700' : 'text-red-600'
    arrow = isPositive ? '↑' : '↓'
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-100">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-[15px] font-black ${color}`}>
        {diff === 0 ? '=' : `${arrow}${Math.abs(diff)}${unit}`}
      </p>
    </div>
  )
}
