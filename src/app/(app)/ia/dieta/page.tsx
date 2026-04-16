/**
 * src/app/(app)/ia/dieta/page.tsx
 *
 * Dieta Personalizada com IA — VFIT B2C
 *
 * Puxa dados da última auto-avaliação, calcula TMB (Mifflin-St Jeor),
 * distribui macros por objetivo, e mostra plano de refeições sugerido.
 */

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DSIcon } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useSelfAssessments, type SelfAssessment } from '@/hooks/use-self-assessments'

// ── Diet calculation helpers ───────────────────────────

type Gender = 'male' | 'female'
type GoalType = 'lose' | 'maintain' | 'gain'

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const GOAL_LABELS: Record<GoalType, string> = {
  lose: 'Perder Peso',
  maintain: 'Manter Peso',
  gain: 'Ganhar Massa',
}

const GOAL_CALORIE_ADJUSTMENTS: Record<GoalType, number> = {
  lose: -500,
  maintain: 0,
  gain: 400,
}

const GOAL_MACROS: Record<GoalType, { proteinPerKg: number; fatPct: number }> = {
  lose: { proteinPerKg: 2.2, fatPct: 0.25 },
  maintain: { proteinPerKg: 1.8, fatPct: 0.28 },
  gain: { proteinPerKg: 2.0, fatPct: 0.25 },
}

interface DietPlan {
  bmr: number
  tdee: number
  targetCalories: number
  protein: number
  carbs: number
  fat: number
  meals: {
    name: string
    emoji: string
    caloriesPct: number
    calories: number
    protein: number
    carbs: number
    fat: number
  }[]
}

function calculateDietPlan(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: string,
  goal: GoalType
): DietPlan {
  // TMB — Mifflin-St Jeor
  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55
  const tdee = bmr * multiplier
  const targetCalories = Math.round(tdee + GOAL_CALORIE_ADJUSTMENTS[goal])

  // Macros
  const macros = GOAL_MACROS[goal]
  const protein = Math.round(macros.proteinPerKg * weightKg)
  const fat = Math.round((targetCalories * macros.fatPct) / 9)
  const carbsCal = targetCalories - protein * 4 - fat * 9
  const carbs = Math.max(Math.round(carbsCal / 4), 50)

  // Distribuição em 5 refeições
  const mealDistribution = [
    { name: 'Café da Manhã', emoji: '☀️', caloriesPct: 0.25 },
    { name: 'Lanche da Manhã', emoji: '🍎', caloriesPct: 0.10 },
    { name: 'Almoço', emoji: '🍽️', caloriesPct: 0.30 },
    { name: 'Lanche da Tarde', emoji: '🥤', caloriesPct: 0.10 },
    { name: 'Jantar', emoji: '🌙', caloriesPct: 0.25 },
  ]

  const meals = mealDistribution.map((m) => ({
    ...m,
    calories: Math.round(targetCalories * m.caloriesPct),
    protein: Math.round(protein * m.caloriesPct),
    carbs: Math.round(carbs * m.caloriesPct),
    fat: Math.round(fat * m.caloriesPct),
  }))

  return { bmr: Math.round(bmr), tdee: Math.round(tdee), targetCalories, protein, carbs, fat, meals }
}

function mapAssessmentGoal(goal: string | null): GoalType {
  if (!goal) return 'maintain'
  const lower = goal.toLowerCase()
  if (lower.includes('perd') || lower.includes('lose') || lower.includes('emagrec')) return 'lose'
  if (lower.includes('ganh') || lower.includes('gain') || lower.includes('massa') || lower.includes('hiper')) return 'gain'
  return 'maintain'
}

function mapActivityLevel(level: string | null): string {
  if (!level) return 'moderate'
  const lower = level.toLowerCase()
  if (lower.includes('sedent')) return 'sedentary'
  if (lower.includes('light') || lower.includes('leve')) return 'light'
  if (lower.includes('moder')) return 'moderate'
  if (lower.includes('very') || lower.includes('muito') || lower.includes('intens')) return 'very_active'
  if (lower.includes('activ') || lower.includes('ativ')) return 'active'
  return 'moderate'
}

// ── Component ──────────────────────────────────────────

export default function DietaIAPage() {
  const router = useRouter()
  const { data: assessments, isLoading } = useSelfAssessments(1)
  const latest: SelfAssessment | undefined = assessments?.[0]

  // User inputs (with assessment defaults)
  const [gender, setGender] = useState<Gender>('male')
  const [age, setAge] = useState(28)
  const [goal, setGoal] = useState<GoalType | null>(null)
  const [activityLevel, setActivityLevel] = useState<string | null>(null)
  const [showPlan, setShowPlan] = useState(false)

  // Derive from assessment if available
  const weightKg = latest?.weight_kg ?? 70
  const heightCm = latest?.height_cm ?? 170
  const effectiveGoal = goal ?? mapAssessmentGoal(latest?.goal ?? null)
  const effectiveActivity = activityLevel ?? mapActivityLevel(latest?.activity_level ?? null)

  const dietPlan = useMemo(
    () => calculateDietPlan(weightKg, heightCm, age, gender, effectiveActivity, effectiveGoal),
    [weightKg, heightCm, age, gender, effectiveActivity, effectiveGoal]
  )

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary pb-24">
      {/* Header */}
      <header className="sticky top-14 z-20 flex items-center gap-3 border-b border-white/8 bg-slate-950/95 px-4 py-3 backdrop-blur-xl">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/70 transition-colors hover:text-white"
        >
          <DSIcon name="arrowLeft" className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <DSIcon name="apple" className="h-5 w-5 text-emerald-400" />
          <h1 className="text-lg font-bold text-white">Dieta Personalizada</h1>
        </div>
      </header>

      <div className="space-y-5 px-4 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          </div>
        ) : !showPlan ? (
          /* ═══ Configuration Form ═══ */
          <>
            {/* Assessment data card */}
            {latest ? (
              <div className="rounded-2xl bg-bg-secondary p-4">
                <div className="mb-2 flex items-center gap-2">
                  <DSIcon name="checkCircle" size={16} className="text-brand-primary" />
                  <span className="text-xs font-bold text-brand-primary">Avaliação encontrada</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <span className="text-lg font-bold text-text-primary">{latest.weight_kg}</span>
                    <p className="text-[10px] text-text-muted">kg</p>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-text-primary">{latest.height_cm}</span>
                    <p className="text-[10px] text-text-muted">cm</p>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-text-primary">{latest.bmi != null ? Number(latest.bmi).toFixed(1) : '—'}</span>
                    <p className="text-[10px] text-text-muted">IMC</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-bg-secondary p-4 text-center">
                <DSIcon name="alertTriangle" size={24} className="mx-auto mb-2 text-amber-400" />
                <p className="text-sm font-semibold text-text-primary">Sem avaliação</p>
                <p className="mt-1 text-xs text-text-muted">
                  Crie uma avaliação para resultados mais precisos
                </p>
                <Link
                  href="/avaliacoes/nova"
                  className="mt-3 inline-block rounded-xl bg-brand-primary/12 px-4 py-2 text-xs font-semibold text-brand-primary"
                >
                  Criar Avaliação
                </Link>
              </div>
            )}

            {/* Gender */}
            <div>
              <label className="mb-2 block text-xs font-bold text-text-muted">Sexo Biológico</label>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      'rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                      gender === g
                        ? 'bg-brand-primary text-bg-primary'
                        : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                    )}
                  >
                    {g === 'male' ? '♂ Masculino' : '♀ Feminino'}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="mb-2 block text-xs font-bold text-text-muted">Idade</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Math.max(14, Math.min(80, parseInt(e.target.value) || 0)))}
                className="w-full rounded-xl border border-border-light/20 bg-bg-secondary px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                min={14}
                max={80}
              />
            </div>

            {/* Goal */}
            <div>
              <label className="mb-2 block text-xs font-bold text-text-muted">Objetivo</label>
              <div className="grid grid-cols-3 gap-2">
                {(['lose', 'maintain', 'gain'] as GoalType[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={cn(
                      'rounded-xl px-3 py-3 text-xs font-semibold transition-colors',
                      effectiveGoal === g
                        ? 'bg-brand-primary text-bg-primary'
                        : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                    )}
                  >
                    {g === 'lose' && '📉 '}
                    {g === 'maintain' && '⚖️ '}
                    {g === 'gain' && '📈 '}
                    {GOAL_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="mb-2 block text-xs font-bold text-text-muted">
                Nível de Atividade
              </label>
              <div className="space-y-2">
                {[
                  { key: 'sedentary', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
                  { key: 'light', label: 'Leve', desc: '1-3x/semana' },
                  { key: 'moderate', label: 'Moderado', desc: '3-5x/semana' },
                  { key: 'active', label: 'Ativo', desc: '6-7x/semana' },
                  { key: 'very_active', label: 'Muito Ativo', desc: '2x/dia ou trabalho físico' },
                ].map((level) => (
                  <button
                    key={level.key}
                    onClick={() => setActivityLevel(level.key)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors',
                      effectiveActivity === level.key
                        ? 'bg-brand-primary/12 ring-1 ring-brand-primary/30'
                        : 'bg-bg-secondary hover:bg-bg-tertiary'
                    )}
                  >
                    <div>
                      <p className={cn(
                        'text-sm font-semibold',
                        effectiveActivity === level.key ? 'text-brand-primary' : 'text-text-primary'
                      )}>
                        {level.label}
                      </p>
                      <p className="text-xs text-text-muted">{level.desc}</p>
                    </div>
                    {effectiveActivity === level.key && (
                      <DSIcon name="checkCircle" size={18} className="text-brand-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={() => setShowPlan(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 py-4 text-sm font-bold text-bg-primary transition-colors hover:bg-brand-primary/90 active:scale-[0.98]"
            >
              <DSIcon name="sparkles" size={18} />
              Gerar Plano Alimentar
            </button>
          </>
        ) : (
          /* ═══ Diet Plan Results ═══ */
          <>
            {/* Summary card */}
            <div className="rounded-2xl bg-bg-secondary p-4">
              <div className="mb-3 flex items-center gap-2">
                <DSIcon name="sparkles" size={16} className="text-brand-primary" />
                <span className="text-xs font-bold text-brand-primary">Plano Gerado</span>
              </div>

              <div className="mb-4 text-center">
                <span className="text-4xl font-extrabold text-text-primary">
                  {dietPlan.targetCalories}
                </span>
                <span className="ml-1 text-sm text-text-muted">kcal/dia</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-bg-primary/50 p-3">
                  <span className="text-xl font-bold text-brand-primary">{dietPlan.protein}g</span>
                  <p className="text-[10px] text-text-muted">Proteína</p>
                  <p className="text-[9px] text-text-muted">{Math.round((dietPlan.protein * 4 / dietPlan.targetCalories) * 100)}%</p>
                </div>
                <div className="rounded-xl bg-bg-primary/50 p-3">
                  <span className="text-xl font-bold text-amber-400">{dietPlan.carbs}g</span>
                  <p className="text-[10px] text-text-muted">Carboidrato</p>
                  <p className="text-[9px] text-text-muted">{Math.round((dietPlan.carbs * 4 / dietPlan.targetCalories) * 100)}%</p>
                </div>
                <div className="rounded-xl bg-bg-primary/50 p-3">
                  <span className="text-xl font-bold text-red-400">{dietPlan.fat}g</span>
                  <p className="text-[10px] text-text-muted">Gordura</p>
                  <p className="text-[9px] text-text-muted">{Math.round((dietPlan.fat * 9 / dietPlan.targetCalories) * 100)}%</p>
                </div>
              </div>
            </div>

            {/* Metabolic info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-bg-secondary p-3 text-center">
                <p className="text-xs text-text-muted">TMB</p>
                <p className="text-lg font-bold text-text-primary">{dietPlan.bmr}</p>
                <p className="text-[10px] text-text-muted">kcal/dia</p>
              </div>
              <div className="rounded-2xl bg-bg-secondary p-3 text-center">
                <p className="text-xs text-text-muted">TDEE</p>
                <p className="text-lg font-bold text-text-primary">{dietPlan.tdee}</p>
                <p className="text-[10px] text-text-muted">kcal/dia</p>
              </div>
            </div>

            {/* Goal badge */}
            <div className="flex items-center gap-2 rounded-2xl bg-bg-secondary p-3">
              <span className="text-lg">
                {effectiveGoal === 'lose' ? '📉' : effectiveGoal === 'gain' ? '📈' : '⚖️'}
              </span>
              <div>
                <p className="text-sm font-bold text-text-primary">{GOAL_LABELS[effectiveGoal]}</p>
                <p className="text-xs text-text-muted">
                  {effectiveGoal === 'lose'
                    ? `Déficit de ${Math.abs(GOAL_CALORIE_ADJUSTMENTS.lose)} kcal`
                    : effectiveGoal === 'gain'
                      ? `Superávit de ${GOAL_CALORIE_ADJUSTMENTS.gain} kcal`
                      : 'Calorias de manutenção'}
                </p>
              </div>
            </div>

            {/* Meal distribution */}
            <section>
              <h2 className="mb-3 text-sm font-bold text-text-primary">
                Distribuição por Refeição
              </h2>
              <div className="space-y-2">
                {dietPlan.meals.map((meal) => (
                  <div
                    key={meal.name}
                    className="rounded-2xl bg-bg-secondary p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{meal.emoji}</span>
                        <span className="text-sm font-bold text-text-primary">{meal.name}</span>
                      </div>
                      <span className="text-xs font-bold text-text-secondary">
                        {meal.calories} kcal
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <span className="rounded-lg bg-brand-primary/10 py-1 font-semibold text-brand-primary">
                        P: {meal.protein}g
                      </span>
                      <span className="rounded-lg bg-amber-400/10 py-1 font-semibold text-amber-400">
                        C: {meal.carbs}g
                      </span>
                      <span className="rounded-lg bg-red-400/10 py-1 font-semibold text-red-400">
                        G: {meal.fat}g
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Disclaimer */}
            <div className="rounded-2xl bg-amber-400/8 p-3">
              <div className="flex items-start gap-2">
                <DSIcon name="alertTriangle" size={14} className="mt-0.5 shrink-0 text-amber-400" />
                <p className="text-xs leading-relaxed text-text-secondary">
                  Este plano é uma estimativa calculada com a fórmula Mifflin-St Jeor.
                  Para resultados precisos, consulte um nutricionista.
                  Os valores devem ser ajustados conforme seus resultados.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPlan(false)}
                className="flex-1 rounded-xl bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-tertiary"
              >
                Ajustar
              </button>
              <Link
                href="/nutricao"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-bg-primary transition-colors hover:bg-brand-primary/90"
              >
                <DSIcon name="apple" size={16} />
                Ir para Nutrição
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
