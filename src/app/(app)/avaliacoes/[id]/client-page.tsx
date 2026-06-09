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
  const [inviteOpen, setInviteOpen] = useState(false)

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
    <div className="mx-auto max-w-lg pb-24">
      {/* ─── Premium Hero ─── */}
      <div
        className="relative -mb-2 overflow-hidden rounded-b-3xl px-4 pt-5 pb-7 backdrop-blur-md"
        style={{ background: 'linear-gradient(to bottom, #0b1d36 0%, #0c1f38 20%, #0b1c35 40%, #0a1830 65%, #071628 85%, #050A12 100%)', boxShadow: '0 6px 28px 0 rgba(5,10,18,0.6)' }}
      >
        {/* Ambient mesh */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_85%_15%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_15%_85%,rgba(59,130,246,0.16),transparent_55%)]" />

        <div className="relative z-1 mb-4 flex items-center gap-3">
          <button
            aria-label="Voltar"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/80 transition-colors hover:bg-white/10"
          >
            <DSIcon name="arrowLeft" size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Avaliação física
            </p>
            <h1 className="text-xl font-black text-white leading-tight">
              {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </h1>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15 ring-1 ring-brand-primary/30">
            <DSIcon name="clipboardList" size={18} className="text-brand-primary" />
          </div>
        </div>

        {/* Hero stats — premium tiles */}
        <div className="relative z-1 grid grid-cols-3 gap-2.5">
          <HeroStat icon="scale" label="Peso" value={`${assessment.weight_kg}`} unit="kg" tone="emerald" />
          <HeroStat
            icon="activity"
            label="IMC"
            value={`${assessment.bmi}`}
            tone="blue"
            valueClass={getBMIColor(assessment.bmi)}
          />
          <HeroStat
            icon="percent"
            label="Gordura"
            value={assessment.body_fat_percentage ? `${assessment.body_fat_percentage}` : '—'}
            unit={assessment.body_fat_percentage ? '%' : ''}
            tone="amber"
          />
        </div>
      </div>

      <div className="mt-5 space-y-5 px-4">
      {/* BMI category */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-5 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Classificação IMC</p>
        <p className={`text-[22px] font-black tracking-tight ${getBMIColor(assessment.bmi)}`}>
          {assessment.bmi_category}
        </p>
        <BMIBar bmi={assessment.bmi} />
      </div>

      {/* Evolution vs previous */}
      {prev && (
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <DSIcon name="trendingUp" size={12} className="text-brand-primary" />
            Evolução
          </h3>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
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
      <div className="grid grid-cols-2 gap-3">
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/12 ring-1 ring-amber-400/25">
              <DSIcon name="zap" size={12} className="text-amber-300" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Atividade</p>
          </div>
          <p className="text-[13px] font-bold text-white">{getActivityLabel(assessment.activity_level)}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/12 ring-1 ring-emerald-400/25">
              <DSIcon name="target" size={12} className="text-emerald-300" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Objetivo</p>
          </div>
          <p className="text-[13px] font-bold text-white">{getGoalLabel(assessment.goal)}</p>
        </div>
      </div>

      {/* Measurements */}
      <div>
        <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          <DSIcon name="ruler" size={12} className="text-brand-primary" />
          Medidas
        </h3>
        <div className="rounded-2xl border border-white/8 bg-white/3 divide-y divide-white/5">
          {measurements.map((m) => (
            <div key={m.label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[13px] text-zinc-400">{m.label}</span>
              <span className="text-[14px] font-semibold text-white tabular-nums">
                {m.value !== null ? `${m.value} ${m.unit}` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {assessment.notes && (
        <div className="rounded-xl border border-white/6 bg-white/3 p-4">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Notas</p>
          <p className="text-[13px] text-zinc-300">{assessment.notes}</p>
        </div>
      )}

      {/* Personal invite — elegant, collapsible, demoted below data */}
      {studentProfile?.personal_name ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/18 bg-emerald-500/8 px-4 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/30">
            <DSIcon name="checkCircle" size={18} className="text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90">Personal vinculado</p>
            <p className="truncate text-[14px] font-bold text-white">{studentProfile.personal_name}</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
          <button
            type="button"
            onClick={() => setInviteOpen((v) => !v)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/12 ring-1 ring-brand-primary/25">
              <DSIcon name="userPlus" size={18} className="text-emerald-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white">Melhorar com personal</p>
              <p className="mt-0.5 text-[11px] text-text-muted">Convide um treinador para completar sua avaliação</p>
            </div>
            <DSIcon name="chevronDown" size={18} className={`shrink-0 text-text-muted transition-transform ${inviteOpen ? 'rotate-180' : ''}`} />
          </button>

          {inviteOpen && (
            <div className="border-t border-white/6 px-4 pb-4 pt-3.5">
              <div className="mb-3 flex gap-2">
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
              <div className="flex flex-wrap gap-2">
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
          )}
        </div>
      )}

      <div className="pt-1">
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
    </div>
  )
}

function HeroStat({
  icon,
  label,
  value,
  unit,
  tone,
  valueClass,
}: {
  icon: 'scale' | 'activity' | 'percent'
  label: string
  value: string
  unit?: string
  tone: 'emerald' | 'blue' | 'amber'
  valueClass?: string
}) {
  const toneStyles = {
    emerald: { bg: 'bg-emerald-500/12', ring: 'ring-emerald-400/30', icon: 'text-emerald-300', glow: 'shadow-[0_0_30px_-8px_rgba(16,185,129,0.5)]' },
    blue: { bg: 'bg-blue-500/12', ring: 'ring-blue-400/30', icon: 'text-blue-300', glow: 'shadow-[0_0_30px_-8px_rgba(59,130,246,0.5)]' },
    amber: { bg: 'bg-amber-500/12', ring: 'ring-amber-400/30', icon: 'text-amber-300', glow: 'shadow-[0_0_30px_-8px_rgba(245,158,11,0.5)]' },
  }[tone]

  return (
    <div className={`relative flex flex-col items-center rounded-2xl border border-white/8 bg-white/4 px-2 py-3 backdrop-blur-sm ${toneStyles.glow}`}>
      <div className={`mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg ${toneStyles.bg} ring-1 ${toneStyles.ring}`}>
        <DSIcon name={icon} size={14} className={toneStyles.icon} />
      </div>
      <p className={`text-2xl font-black leading-none tabular-nums ${valueClass ?? 'text-white'}`}>
        {value}
        {unit && <span className="ml-0.5 text-[10px] font-semibold text-zinc-400"> {unit}</span>}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
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
      <div className="mt-1.5 flex justify-between text-[9px] font-medium text-text-muted">
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
