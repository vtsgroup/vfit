/**
 * src/app/(app)/avaliacoes/nova/page.tsx
 *
 * Sprint 26 — Wizard de auto-avaliação (3 steps)
 * Step 1: Medidas básicas (peso, altura, cintura, quadril, peito, braço, coxa)
 * Step 2: Nível de atividade + objetivo
 * Step 3: Resultado (IMC + classificação)
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useCreateSelfAssessment, getBMIColor, getActivityLabel, getGoalLabel } from '@/hooks/use-self-assessments'
import type { SelfAssessmentInput } from '@/hooks/use-self-assessments'
import { hapticLight, hapticSuccess } from '@/lib/haptics'

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
  { value: 'light', label: 'Levemente ativo', desc: '1-3x por semana' },
  { value: 'moderate', label: 'Moderado', desc: '3-5x por semana' },
  { value: 'active', label: 'Ativo', desc: '6-7x por semana' },
  { value: 'very_active', label: 'Muito ativo', desc: '2x por dia ou trabalho físico' },
]

const GOALS: Array<{ value: string; label: string; icon: DSIconName }> = [
  { value: 'lose_weight', label: 'Perder peso', icon: 'flame' },
  { value: 'gain_muscle', label: 'Ganhar massa muscular', icon: 'dumbbell' },
  { value: 'maintain', label: 'Manter a forma', icon: 'zap' },
  { value: 'improve_health', label: 'Melhorar saúde geral', icon: 'heart' },
]

export default function NovaAvaliacaoPage() {
  const router = useRouter()
  const createAssessment = useCreateSelfAssessment()
  const [step, setStep] = useState(1)

  // Step 1 fields
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [waistCm, setWaistCm] = useState('')
  const [hipCm, setHipCm] = useState('')
  const [chestCm, setChestCm] = useState('')
  const [armCm, setArmCm] = useState('')
  const [thighCm, setThighCm] = useState('')

  // Step 2 fields
  const [activityLevel, setActivityLevel] = useState('')
  const [goal, setGoal] = useState('')

  // Result
  const [result, setResult] = useState<{
    bmi: number
    bmi_category: string
    body_fat_percentage: number | null
  } | null>(null)

  const canProceedStep1 = !!weightKg && !!heightCm
  const canProceedStep2 = !!activityLevel && !!goal

  const handleSubmit = useCallback(async () => {
    const input: SelfAssessmentInput = {
      weight_kg: parseFloat(weightKg),
      height_cm: parseFloat(heightCm),
      waist_cm: waistCm ? parseFloat(waistCm) : undefined,
      hip_cm: hipCm ? parseFloat(hipCm) : undefined,
      chest_cm: chestCm ? parseFloat(chestCm) : undefined,
      arm_left_cm: armCm ? parseFloat(armCm) : undefined,
      arm_right_cm: armCm ? parseFloat(armCm) : undefined,
      thigh_left_cm: thighCm ? parseFloat(thighCm) : undefined,
      thigh_right_cm: thighCm ? parseFloat(thighCm) : undefined,
      activity_level: activityLevel,
      goal,
    }

    try {
      const res = await createAssessment.mutateAsync(input)
      hapticSuccess()
      setResult({
        bmi: res.bmi,
        bmi_category: res.bmi_category,
        body_fat_percentage: res.body_fat_percentage ?? null,
      })
      setStep(3)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar avaliação. Tente novamente.'
      // Show inline error since toast may not be available in (app) layout
      alert(message)
    }
  }, [weightKg, heightCm, waistCm, hipCm, chestCm, armCm, thighCm, activityLevel, goal, createAssessment])

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <button
          onClick={() => (step > 1 && step < 3 ? setStep(step - 1) : router.back())}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Nova Avaliação</h1>
          {step < 3 && (
            <p className="text-[11px] text-zinc-500">Passo {step} de 2</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {step < 3 && (
        <div className="mb-6 flex gap-1.5">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-brand-primary' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
      )}

      {/* Step 1: Medidas */}
      {step === 1 && (
        <div>
          <h2 className="mb-1 text-[15px] font-bold text-white">Suas medidas</h2>
          <p className="mb-5 text-[12px] text-zinc-500">
            Peso e altura são obrigatórios. As demais são opcionais.
          </p>

          <div className="space-y-3">
            <MeasureInput label="Peso" unit="kg" value={weightKg} onChange={setWeightKg} required />
            <MeasureInput label="Altura" unit="cm" value={heightCm} onChange={setHeightCm} required />
            <div className="my-4 h-px bg-white/5" />
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Medidas opcionais</p>
            <MeasureInput label="Cintura" unit="cm" value={waistCm} onChange={setWaistCm} />
            <MeasureInput label="Quadril" unit="cm" value={hipCm} onChange={setHipCm} />
            <MeasureInput label="Peito" unit="cm" value={chestCm} onChange={setChestCm} />
            <MeasureInput label="Braço" unit="cm" value={armCm} onChange={setArmCm} />
            <MeasureInput label="Coxa" unit="cm" value={thighCm} onChange={setThighCm} />
          </div>

          <div className="mt-6">
            <Button
              disabled={!canProceedStep1}
              onClick={() => { hapticLight(); setStep(2) }}
              className="w-full"
            >
              Próximo
              <DSIcon name="chevronRight" size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Atividade + Objetivo */}
      {step === 2 && (
        <div>
          <h2 className="mb-1 text-[15px] font-bold text-white">Nível de atividade</h2>
          <p className="mb-4 text-[12px] text-zinc-500">Como é sua rotina de exercícios?</p>

          <div className="mb-6 space-y-2">
            {ACTIVITY_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => { hapticLight(); setActivityLevel(lvl.value) }}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  activityLevel === lvl.value
                    ? 'border-brand-primary/50 bg-brand-primary/5'
                    : 'border-white/5 bg-white/2 hover:border-white/10'
                }`}
              >
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  activityLevel === lvl.value ? 'border-brand-primary bg-brand-primary' : 'border-zinc-600'
                }`}>
                  {activityLevel === lvl.value && <DSIcon name="check" size={12} className="text-black" />}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{lvl.label}</p>
                  <p className="text-[11px] text-zinc-500">{lvl.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <h2 className="mb-1 text-[15px] font-bold text-white">Seu objetivo</h2>
          <p className="mb-4 text-[12px] text-zinc-500">O que você quer alcançar?</p>

          <div className="mb-6 grid grid-cols-2 gap-2.5">
            {GOALS.map((g) => {
              const selected = goal === g.value
              return (
                <button
                  key={g.value}
                  onClick={() => { hapticLight(); setGoal(g.value) }}
                  className={`group flex flex-col items-center gap-2.5 rounded-2xl border px-3 py-4 transition-all ${
                    selected
                      ? 'border-brand-primary/45 bg-brand-primary/8'
                      : 'border-white/8 bg-white/3 hover:border-white/14 hover:bg-white/5'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                      selected
                        ? 'border-brand-primary/40 bg-brand-primary/15'
                        : 'border-white/8 bg-white/4'
                    }`}
                  >
                    <DSIcon
                      name={g.icon}
                      size={18}
                      className={selected ? 'text-brand-primary' : 'text-text-secondary'}
                    />
                  </div>
                  <span className={`text-[12px] font-semibold leading-tight text-center ${
                    selected ? 'text-text-primary' : 'text-zinc-300'
                  }`}>
                    {g.label}
                  </span>
                </button>
              )
            })}
          </div>

          <Button
            disabled={!canProceedStep2}
            loading={createAssessment.isPending}
            onClick={handleSubmit}
            className="w-full"
          >
            <DSIcon name="check" size={18} />
            Finalizar Avaliação
          </Button>
        </div>
      )}

      {/* Step 3: Resultado */}
      {step === 3 && result && (
        <div className="flex flex-col items-center pt-4">
          <div
            className="relative mb-5 flex h-24 w-24 items-center justify-center"
          >
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.45) 0%, transparent 70%)' }}
            />
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(34,197,94,0.32) 0%, rgba(22,101,52,0.20) 60%, rgba(5,10,18,0.85) 100%)',
                border: '1px solid rgba(74,222,128,0.4)',
                boxShadow: '0 0 30px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <DSIcon name="checkCircle2" size={36} className="text-emerald-300" />
            </div>
          </div>
          <h2 className="text-[22px] font-black tracking-tight text-text-primary">Avaliação concluída</h2>
          <p className="mt-1 mb-6 text-[13px] font-medium text-text-secondary">Aqui estão seus resultados</p>

          {/* Result card */}
          <div
            className="mb-5 w-full overflow-hidden rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/4">
                  <DSIcon name="scale" size={14} className="text-text-secondary" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Peso</p>
                <p className="mt-0.5 text-[18px] font-black tabular-nums text-text-primary">
                  {weightKg}<span className="text-[11px] font-medium text-text-muted"> kg</span>
                </p>
              </div>
              <div>
                <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/4">
                  <DSIcon name="activity" size={14} className="text-text-secondary" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">IMC</p>
                <p className={`mt-0.5 text-[18px] font-black tabular-nums ${getBMIColor(result.bmi)}`}>
                  {result.bmi}
                </p>
              </div>
              <div>
                <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/4">
                  <DSIcon name="percent" size={14} className="text-text-secondary" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Gordura</p>
                <p className="mt-0.5 text-[18px] font-black tabular-nums text-text-primary">
                  {result.body_fat_percentage ? `${result.body_fat_percentage}%` : '—'}
                </p>
              </div>
            </div>

            <div
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
              style={{
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.18)',
              }}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Classificação IMC</p>
                <p className={`mt-0.5 text-[14px] font-black ${getBMIColor(result.bmi)}`}>
                  {result.bmi_category}
                </p>
              </div>
              <DSIcon name="checkCircle" size={20} className="text-brand-primary" />
            </div>
          </div>

          {/* Info cards */}
          <div className="mb-6 grid w-full grid-cols-2 gap-2.5">
            <div
              className="flex items-center gap-2.5 rounded-2xl px-3 py-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/10">
                <DSIcon name="activity" size={14} className="text-violet-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Atividade</p>
                <p className="truncate text-[12px] font-bold text-text-primary">{getActivityLabel(activityLevel)}</p>
              </div>
            </div>
            <div
              className="flex items-center gap-2.5 rounded-2xl px-3 py-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/10">
                <DSIcon name="target" size={14} className="text-amber-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Objetivo</p>
                <p className="truncate text-[12px] font-bold text-text-primary">{getGoalLabel(goal)}</p>
              </div>
            </div>
          </div>

          <Button onClick={() => router.push('/avaliacoes')} className="w-full">
            Ver minhas avaliações
            <DSIcon name="arrowRight" size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}

function MeasureInput({
  label,
  unit,
  value,
  onChange,
  required,
}: {
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-20 text-[13px] text-zinc-400">
        {label} {required && <span className="text-brand-primary">*</span>}
      </label>
      <div className="relative flex-1">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 pr-12 text-[14px] text-white placeholder:text-zinc-700 outline-none focus:border-brand-primary/50"
        />
        <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[11px] text-zinc-600">{unit}</span>
      </div>
    </div>
  )
}
