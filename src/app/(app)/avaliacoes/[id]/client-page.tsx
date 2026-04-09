/**
 * src/app/(app)/avaliacoes/[id]/client-page.tsx
 *
 * Sprint 26 + FASE 5 — Detalhe de auto-avaliação com seção de progresso
 */

'use client'

import { useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useSelfAssessmentDetail, useSelfAssessments, useDeleteSelfAssessment, getBMIColor, getActivityLabel, getGoalLabel } from '@/hooks/use-self-assessments'
import { useLinkPersonalTrainer, useStudentProfile } from '@/hooks/use-student-app'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/stores/app-store'
import { Input } from '@/components/ui/input'

export default function AvaliacaoDetalhePage() {
  const router = useRouter()
  const pathname = usePathname()
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const rawId = useParams<{ id: string }>().id
  const fallbackPathId = pathname.split('/').filter(Boolean).at(-1) ?? null
  const id = rawId && rawId !== '_' ? rawId : (fallbackPathId && fallbackPathId !== '_' ? decodeURIComponent(fallbackPathId) : null)
  const { data: assessment, isLoading } = useSelfAssessmentDetail(id)
  const { data: allAssessments } = useSelfAssessments(50)
  const deleteAssessment = useDeleteSelfAssessment(id)
  const { data: studentProfile } = useStudentProfile()
  const linkPersonalTrainer = useLinkPersonalTrainer()
  const [personalReferralCode, setPersonalReferralCode] = useState('')

  const personalInviteLink = (() => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://vfit.app.br'
    const params = new URLSearchParams({
      source: 'student-invite',
      origin: 'avaliacao-detalhe',
      context: 'assessment-complete',
    })
    if (studentProfile?.id) params.set('student_id', studentProfile.id)
    return `${base}/register/personal?${params.toString()}`
  })()

  // Find previous assessment for comparison
  const prev = (() => {
    if (!allAssessments || !assessment) return null
    const idx = allAssessments.findIndex((a) => a.id === assessment.id)
    return idx >= 0 && idx < allAssessments.length - 1 ? allAssessments[idx + 1] : null
  })()

  if (!isHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <DSIcon name="loader" size={24} className="animate-spin text-zinc-500" />
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center gap-3 py-32">
        <p className="text-zinc-500">Avaliação não encontrada</p>
        <button aria-label="Voltar" onClick={() => router.back()} className="text-brand-primary text-[13px]">Voltar</button>
      </div>
    )
  }

  function handleDelete() {
    if (!id) return
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
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Avaliação</h1>
          <p className="text-[11px] text-zinc-500">
            {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main stats */}
      <div className="mb-4 rounded-2xl border border-brand-primary/20 bg-brand-primary/8 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">
          Melhorar esta avaliação com personal
        </p>
        <p className="mt-1 text-[12px] text-zinc-400">
          Convide e vincule um personal trainer para completar sua avaliação.
        </p>
        {studentProfile?.personal_name && (
          <p className="mt-1 text-[12px] font-semibold text-brand-primary">
            Personal vinculado: {studentProfile.personal_name}
          </p>
        )}

        <div className="mt-3 flex gap-2">
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

        <div className="mt-2 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(personalInviteLink)}>
            <DSIcon name="copy" size={14} />
            Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Quero te convidar para completar minha avaliação física no VFIT.\n\nCadastro: ${personalInviteLink}`)}`, '_blank')}
          >
            <DSIcon name="share2" size={14} />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`mailto:?subject=${encodeURIComponent('Convite VFIT — Avaliação Completa')}&body=${encodeURIComponent(`Olá! Quero te convidar para me acompanhar no VFIT e completar minha avaliação física.\n\nCadastro: ${personalInviteLink}`)}`, '_blank')}
          >
            <DSIcon name="mail" size={14} />
            Email
          </Button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard label="Peso" value={`${assessment.weight_kg}`} unit="kg" />
        <StatCard
          label="IMC"
          value={`${assessment.bmi}`}
          colorClass={getBMIColor(assessment.bmi)}
        />
        <StatCard
          label="Gordura"
          value={assessment.body_fat_percentage ? `${assessment.body_fat_percentage}` : '—'}
          unit={assessment.body_fat_percentage ? '%' : ''}
        />
      </div>

      {/* BMI category */}
      <div className="mb-5 rounded-2xl border border-white/5 bg-white/2 p-4 text-center">
        <p className="mb-1 text-[11px] text-zinc-600">Classificação IMC</p>
        <p className={`text-[16px] font-bold ${getBMIColor(assessment.bmi)}`}>
          {assessment.bmi_category}
        </p>
        <BMIBar bmi={assessment.bmi} />
      </div>

      {/* Evolution vs previous */}
      {prev && (
        <div className="mb-5">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-zinc-500">Evolução</h3>
          <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
            <p className="mb-3 text-[11px] text-zinc-600">
              vs. {new Date(prev.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <EvolutionStat
                label="Peso"
                current={assessment.weight_kg}
                previous={prev.weight_kg}
                unit="kg"
              />
              <EvolutionStat
                label="IMC"
                current={assessment.bmi}
                previous={prev.bmi}
                unit=""
              />
              {assessment.body_fat_percentage && prev.body_fat_percentage ? (
                <EvolutionStat
                  label="Gordura"
                  current={assessment.body_fat_percentage}
                  previous={prev.body_fat_percentage}
                  unit="%"
                  invert
                />
              ) : (
                <div className="text-center">
                  <p className="text-[11px] text-zinc-600">Gordura</p>
                  <p className="text-[13px] text-zinc-600">—</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity + goal */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/2 p-3">
          <p className="text-[11px] text-zinc-600">Atividade</p>
          <p className="text-[13px] font-semibold text-zinc-300">{getActivityLabel(assessment.activity_level)}</p>
        </div>
        <div className="rounded-xl bg-white/2 p-3">
          <p className="text-[11px] text-zinc-600">Objetivo</p>
          <p className="text-[13px] font-semibold text-zinc-300">{getGoalLabel(assessment.goal)}</p>
        </div>
      </div>

      {/* Measurements */}
      <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-zinc-500">Medidas</h3>
      <div className="rounded-2xl border border-white/5 bg-white/2 divide-y divide-white/5">
        {measurements.map((m) => (
          <div key={m.label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[13px] text-zinc-400">{m.label}</span>
            <span className="text-[14px] font-semibold text-white">
              {m.value !== null ? `${m.value} ${m.unit}` : '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Notes */}
      {assessment.notes && (
        <div className="mt-5 rounded-xl bg-white/2 p-4">
          <p className="mb-1 text-[11px] text-zinc-600">Notas</p>
          <p className="text-[13px] text-zinc-300">{assessment.notes}</p>
        </div>
      )}

      <div className="mt-6">
        <Button
          variant="danger"
          className="w-full"
          loading={deleteAssessment.isPending}
          onClick={handleDelete}
        >
          <DSIcon name="trash2" size={16} />
          Deletar definitivamente
        </Button>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  colorClass = 'text-white',
}: {
  label: string
  value: string
  unit?: string
  colorClass?: string
}) {
  return (
    <div className="rounded-xl bg-white/2 p-3 text-center">
      <p className="text-[11px] text-zinc-600">{label}</p>
      <p className={`text-xl font-black ${colorClass}`}>
        {value}
        {unit && <span className="text-[11px] text-zinc-500"> {unit}</span>}
      </p>
    </div>
  )
}

function BMIBar({ bmi }: { bmi: number }) {
  // BMI range: 15 to 40+ mapped to 0-100%
  const pct = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))

  return (
    <div className="relative mt-3">
      <div className="flex h-2 overflow-hidden rounded-full">
        <div className="flex-1 bg-brand-primary/30" />
        <div className="flex-1 bg-emerald-500/30" />
        <div className="flex-1 bg-yellow-500/30" />
        <div className="flex-1 bg-red-500/30" />
      </div>
      <div
        className="absolute top-0 h-2 w-1 rounded-full bg-white shadow-sm"
        style={{ left: `${pct}%` }}
      />
      <div className="mt-1 flex justify-between text-[9px] text-zinc-700">
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
  /** true = negative delta is good (e.g. body fat decrease) */
  invert?: boolean
}) {
  const diff = +(current - previous).toFixed(1)
  const isPositive = diff > 0

  let color = 'text-zinc-500'
  let arrow = ''
  if (diff !== 0) {
    const isGood = invert ? !isPositive : isPositive
    color = isGood ? 'text-brand-primary' : 'text-red-400'
    arrow = isPositive ? '↑' : '↓'
  }

  return (
    <div className="text-center">
      <p className="text-[11px] text-zinc-600">{label}</p>
      <p className={`text-[15px] font-bold ${color}`}>
        {diff === 0 ? '=' : `${arrow}${Math.abs(diff)}${unit}`}
      </p>
    </div>
  )
}
