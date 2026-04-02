/**
 * src/app/guest/calculators/page.tsx
 *
 * Guest Calculators — Calculadoras fitness para visitantes
 *
 * IMC, TMB (Harris-Benedict) e Macros. Uso limitado a 5x
 * via guest-store. CTA para criar conta.
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useGuestStore } from '@/stores/guest-store'
import { GuestLimitPrompt } from '@/components/guest/guest-limit-prompt'

// ─── Types ───
type CalcTab = 'imc' | 'tmb' | 'macros'
type Gender = 'male' | 'female'
type Goal = 'cut' | 'maintain' | 'bulk'

// ─── IMC ranges ───
const IMC_RANGES = [
  { max: 18.5, label: 'Abaixo do peso', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { max: 24.9, label: 'Peso normal', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { max: 29.9, label: 'Sobrepeso', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { max: 34.9, label: 'Obesidade Grau I', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { max: 39.9, label: 'Obesidade Grau II', color: 'text-red-400', bg: 'bg-red-500/10' },
  { max: Infinity, label: 'Obesidade Grau III', color: 'text-red-500', bg: 'bg-red-500/15' },
] as const

function getImcRange(imc: number) {
  return IMC_RANGES.find((r) => imc <= r.max) ?? IMC_RANGES[IMC_RANGES.length - 1]
}

// ─── Activity multipliers ───
const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentário', desc: 'Nenhum exercício' },
  { value: 1.375, label: 'Leve', desc: '1-3x/semana' },
  { value: 1.55, label: 'Moderado', desc: '3-5x/semana' },
  { value: 1.725, label: 'Intenso', desc: '6-7x/semana' },
  { value: 1.9, label: 'Muito intenso', desc: '2x/dia ou trabalho físico' },
] as const

// ─── Macro ratios by goal ───
const MACRO_RATIOS: Record<Goal, { protein: number; carbs: number; fat: number; label: string }> = {
  cut: { protein: 0.40, carbs: 0.30, fat: 0.30, label: 'Cutting (Definição)' },
  maintain: { protein: 0.30, carbs: 0.40, fat: 0.30, label: 'Manutenção' },
  bulk: { protein: 0.30, carbs: 0.50, fat: 0.20, label: 'Bulking (Ganho)' },
}

// ─── Components ───

function InputField({ label, value, onChange, suffix, type = 'number' }: {
  label: string; value: string; onChange: (v: string) => void; suffix?: string; type?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full rounded-xl border border-white/8 bg-white/4 px-4 text-[15px] font-semibold text-white placeholder-zinc-600 outline-none transition-colors focus:border-brand-primary/40 focus:bg-white/6"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-zinc-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function GenderToggle({ value, onChange }: { value: Gender; onChange: (v: Gender) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        Sexo biológico
      </label>
      <div className="flex gap-2">
        {([
          { v: 'male' as Gender, label: '♂ Masculino' },
          { v: 'female' as Gender, label: '♀ Feminino' },
        ]).map((opt) => (
          <button
            key={opt.v}
            type="button"
            onClick={() => onChange(opt.v)}
            className={`h-12 grow rounded-xl border text-[13px] font-semibold transition-all ${
              value === opt.v
                ? 'border-brand-primary/40 bg-brand-primary/10 text-brand-primary'
                : 'border-white/8 bg-white/4 text-zinc-400 hover:bg-white/6'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ResultCard({ label, value, unit, accent = false }: {
  label: string; value: string; unit?: string; accent?: boolean
}) {
  return (
    <div className={`rounded-xl border p-3.5 ${accent ? 'border-brand-primary/20 bg-brand-primary/5' : 'border-white/8 bg-white/3'}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-1 text-[22px] font-black ${accent ? 'text-brand-primary' : 'text-white'}`}>
        {value}
        {unit && <span className="ml-1 text-[13px] font-semibold text-zinc-400">{unit}</span>}
      </p>
    </div>
  )
}

// ─── Main Page ───

export default function GuestCalculatorsPage() {
  const router = useRouter()
  const incrementUsage = useGuestStore((s) => s.incrementUsage)
  const isLimitReached = useGuestStore((s) => s.isLimitReached)
  const getRemainingUses = useGuestStore((s) => s.getRemainingUses)

  const [tab, setTab] = useState<CalcTab>('imc')
  const [showLimit, setShowLimit] = useState(false)

  // ─── Shared inputs ───
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [activityLevel, setActivityLevel] = useState(1.55)
  const [goal, setGoal] = useState<Goal>('maintain')

  // ─── Results ───
  const [imcResult, setImcResult] = useState<number | null>(null)
  const [tmbResult, setTmbResult] = useState<number | null>(null)
  const [tdeeResult, setTdeeResult] = useState<number | null>(null)
  const [macrosResult, setMacrosResult] = useState<{ protein: number; carbs: number; fat: number; calories: number } | null>(null)

  const remaining = getRemainingUses('calculatorUses')

  const checkLimit = useCallback(() => {
    if (isLimitReached('calculatorUses')) {
      setShowLimit(true)
      return false
    }
    incrementUsage('calculatorUses')
    return true
  }, [isLimitReached, incrementUsage])

  // ─── Calculators ───
  const calcIMC = () => {
    if (!checkLimit()) return
    const w = parseFloat(weight)
    const h = parseFloat(height) / 100
    if (!w || !h) return
    setImcResult(w / (h * h))
  }

  const calcTMB = () => {
    if (!checkLimit()) return
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseInt(age)
    if (!w || !h || !a) return

    // Harris-Benedict
    let tmb: number
    if (gender === 'male') {
      tmb = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
    } else {
      tmb = 447.593 + 9.247 * w + 3.098 * h - 4.330 * a
    }
    const tdee = tmb * activityLevel
    setTmbResult(Math.round(tmb))
    setTdeeResult(Math.round(tdee))
  }

  const calcMacros = () => {
    if (!checkLimit()) return
    const tdee = tdeeResult
    if (!tdee) {
      calcTMB()
      return
    }
    const ratios = MACRO_RATIOS[goal]
    const goalCalories = goal === 'cut' ? tdee - 500 : goal === 'bulk' ? tdee + 300 : tdee
    setMacrosResult({
      calories: Math.round(goalCalories),
      protein: Math.round((goalCalories * ratios.protein) / 4),
      carbs: Math.round((goalCalories * ratios.carbs) / 4),
      fat: Math.round((goalCalories * ratios.fat) / 9),
    })
  }

  const tabs: { id: CalcTab; label: string; icon: 'hash' | 'flame' | 'barChart' }[] = [
    { id: 'imc', label: 'IMC', icon: 'hash' },
    { id: 'tmb', label: 'TMB', icon: 'flame' },
    { id: 'macros', label: 'Macros', icon: 'barChart' },
  ]

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/6 bg-bg-dark/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => router.push('/guest/explore')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/6 text-zinc-400 hover:bg-white/10 transition-colors"
          >
            <DSIcon name="arrowLeft" size={18} />
          </button>
          <div>
            <h1 className="text-[15px] font-bold text-white">Calculadoras</h1>
            <p className="text-[10px] text-zinc-500">IMC, TMB e Macros</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5">
        {/* Remaining uses */}
        {remaining > 0 && remaining <= 3 && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2">
            <DSIcon name="hash" size={14} className="text-amber-400" />
            <span className="text-[11px] text-amber-300">
              {remaining} {remaining === 1 ? 'cálculo restante' : 'cálculos restantes'} no modo visitante
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-5 flex gap-1.5 rounded-xl bg-white/3 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex grow items-center justify-center gap-1.5 rounded-lg py-2.5 text-[12px] font-bold transition-all ${
                tab === t.id
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <DSIcon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── IMC Tab ─── */}
        {tab === 'imc' && (
          <div className="space-y-4">
            <InputField label="Peso" value={weight} onChange={setWeight} suffix="kg" />
            <InputField label="Altura" value={height} onChange={setHeight} suffix="cm" />
            <Button onClick={calcIMC} className="w-full uppercase tracking-wider font-black">
              CALCULAR IMC
            </Button>

            {imcResult !== null && (
              <div className="mt-4 space-y-3">
                <ResultCard label="Seu IMC" value={imcResult.toFixed(1)} unit="kg/m²" accent />
                <div className={`rounded-xl ${getImcRange(imcResult).bg} border border-white/8 px-4 py-3`}>
                  <p className={`text-[14px] font-bold ${getImcRange(imcResult).color}`}>
                    {getImcRange(imcResult).label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Faixa saudável: 18.5 – 24.9 kg/m²
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TMB Tab ─── */}
        {tab === 'tmb' && (
          <div className="space-y-4">
            <GenderToggle value={gender} onChange={setGender} />
            <InputField label="Peso" value={weight} onChange={setWeight} suffix="kg" />
            <InputField label="Altura" value={height} onChange={setHeight} suffix="cm" />
            <InputField label="Idade" value={age} onChange={setAge} suffix="anos" />

            {/* Activity level */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Nível de atividade
              </label>
              <div className="space-y-1.5">
                {ACTIVITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setActivityLevel(level.value)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 transition-all ${
                      activityLevel === level.value
                        ? 'border-brand-primary/40 bg-brand-primary/10'
                        : 'border-white/8 bg-white/3 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <p className={`text-[13px] font-semibold ${activityLevel === level.value ? 'text-brand-primary' : 'text-white'}`}>
                        {level.label}
                      </p>
                      <p className="text-[10px] text-zinc-500">{level.desc}</p>
                    </div>
                    {activityLevel === level.value && (
                      <DSIcon name="check" size={16} className="text-brand-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={calcTMB} className="w-full uppercase tracking-wider font-black">
              CALCULAR TMB
            </Button>

            {tmbResult !== null && tdeeResult !== null && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <ResultCard label="TMB (Basal)" value={tmbResult.toLocaleString('pt-BR')} unit="kcal" />
                <ResultCard label="TDEE (Total)" value={tdeeResult.toLocaleString('pt-BR')} unit="kcal" accent />
              </div>
            )}
          </div>
        )}

        {/* ─── Macros Tab ─── */}
        {tab === 'macros' && (
          <div className="space-y-4">
            {!tdeeResult && (
              <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3">
                <p className="text-[12px] text-amber-300">
                  💡 Calcule seu TMB primeiro na aba anterior para resultados mais precisos.
                </p>
              </div>
            )}

            <GenderToggle value={gender} onChange={setGender} />
            <InputField label="Peso" value={weight} onChange={setWeight} suffix="kg" />
            <InputField label="Altura" value={height} onChange={setHeight} suffix="cm" />
            <InputField label="Idade" value={age} onChange={setAge} suffix="anos" />

            {/* Goal selector */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Objetivo
              </label>
              <div className="flex gap-2">
                {(Object.entries(MACRO_RATIOS) as [Goal, typeof MACRO_RATIOS[Goal]][]).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setGoal(key)}
                    className={`h-12 grow rounded-xl border text-[11px] font-bold transition-all ${
                      goal === key
                        ? 'border-brand-primary/40 bg-brand-primary/10 text-brand-primary'
                        : 'border-white/8 bg-white/4 text-zinc-400 hover:bg-white/6'
                    }`}
                  >
                    {val.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={calcMacros} className="w-full uppercase tracking-wider font-black">
              CALCULAR MACROS
            </Button>

            {macrosResult && (
              <div className="mt-4 space-y-3">
                <ResultCard label="Calorias diárias" value={macrosResult.calories.toLocaleString('pt-BR')} unit="kcal" accent />
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase text-blue-400">Proteína</p>
                    <p className="mt-1 text-[18px] font-black text-white">{macrosResult.protein}g</p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase text-amber-400">Carbos</p>
                    <p className="mt-1 text-[18px] font-black text-white">{macrosResult.carbs}g</p>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase text-rose-400">Gordura</p>
                    <p className="mt-1 text-[18px] font-black text-white">{macrosResult.fat}g</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA bottom */}
        <div className="mt-8 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-5 text-center">
          <h3 className="text-[15px] font-bold text-white">Quer acompanhar sua evolução?</h3>
          <p className="mt-1 text-[12px] text-zinc-400">
            Crie sua conta grátis e tenha calculadoras ilimitadas, acompanhamento de medidas e muito mais.
          </p>
          <Button
            onClick={() => router.push('/register')}
            className="mt-4 w-full uppercase tracking-wider font-black"
          >
            CRIAR CONTA GRÁTIS
            <DSIcon name="arrowRight" size={16} />
          </Button>
        </div>
      </main>

      {/* Limit prompt */}
      {showLimit && (
        <GuestLimitPrompt
          feature="calculatorUses"
          onDismiss={() => setShowLimit(false)}
        />
      )}
    </div>
  )
}
