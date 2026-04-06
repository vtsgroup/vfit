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
import { DSIcon } from '@/components/ui/ds-icon'
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

const GOALS = [
  { value: 'lose_weight', label: 'Perder peso', emoji: '🔥' },
  { value: 'gain_muscle', label: 'Ganhar massa muscular', emoji: '💪' },
  { value: 'maintain', label: 'Manter a forma', emoji: '⚡' },
  { value: 'improve_health', label: 'Melhorar saúde geral', emoji: '❤️' },
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

          <div className="mb-6 grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => { hapticLight(); setGoal(g.value) }}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-all ${
                  goal === g.value
                    ? 'border-brand-primary/50 bg-brand-primary/5'
                    : 'border-white/5 bg-white/2 hover:border-white/10'
                }`}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-[12px] font-medium text-zinc-300">{g.label}</span>
              </button>
            ))}
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
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-primary/15 text-brand-primary">
            <DSIcon name="checkCircle2" size={40} />
          </div>
          <h2 className="mb-1 text-[18px] font-black text-white">Avaliação Concluída!</h2>
          <p className="mb-6 text-[13px] text-zinc-500">Confira seus resultados</p>

          {/* Result card */}
          <div className="mb-6 w-full rounded-2xl border border-white/5 bg-white/2 p-5">
            <div className="mb-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[11px] text-zinc-600">Peso</p>
                <p className="text-xl font-black text-white">{weightKg}<span className="text-[11px] text-zinc-500"> kg</span></p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-600">IMC</p>
                <p className={`text-xl font-black ${getBMIColor(result.bmi)}`}>{result.bmi}</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-600">Gordura</p>
                <p className="text-xl font-black text-white">
                  {result.body_fat_percentage ? `${result.body_fat_percentage}%` : '—'}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white/3 px-4 py-3 text-center">
              <p className="text-[11px] text-zinc-500">Classificação</p>
              <p className={`text-[14px] font-bold ${getBMIColor(result.bmi)}`}>
                {result.bmi_category}
              </p>
            </div>
          </div>

          {/* Info cards */}
          <div className="mb-6 w-full space-y-2">
            <div className="flex items-center gap-3 rounded-xl bg-white/2 px-4 py-3">
              <DSIcon name="activity" size={18} className="text-zinc-500" />
              <div>
                <p className="text-[11px] text-zinc-600">Nível de atividade</p>
                <p className="text-[13px] font-medium text-zinc-300">{getActivityLabel(activityLevel)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/2 px-4 py-3">
              <DSIcon name="target" size={18} className="text-zinc-500" />
              <div>
                <p className="text-[11px] text-zinc-600">Objetivo</p>
                <p className="text-[13px] font-medium text-zinc-300">{getGoalLabel(goal)}</p>
              </div>
            </div>
          </div>

          <Button onClick={() => router.push('/avaliacoes')} className="w-full">
            Ver Minhas Avaliações
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
