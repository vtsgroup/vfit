/**
 * src/app/dashboard/marketplace/create/page.tsx
 *
 * Create Workout Plan — Sell on Marketplace
 *
 * Exports: CreatePlanPage
 * Hooks: useState, useCreatePlan
 * Features: 'use client' · DSIcon
 */

// ============================================
// Create Workout Plan — Sell on Marketplace
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MD3Input, MD3TextArea } from '@/components/ui/md3-input'
import { StyledSelect } from '@/components/ui/styled-select'
import {
  useCreatePlan,
  categoryLabels,
  difficultyLabels,
  type PlanCategory,
  type PlanDifficulty,
} from '@/hooks/use-marketplace'

interface WeekPlan {
  week: number
  days: DayPlan[]
}

interface DayPlan {
  day: string
  exercises: ExercisePlan[]
}

interface ExercisePlan {
  name: string
  sets: number
  reps: string
  rest: string
  notes: string
}

const emptyExercise: ExercisePlan = { name: '', sets: 3, reps: '12', rest: '60s', notes: '' }
const defaultDay: DayPlan = { day: 'Segunda', exercises: [{ ...emptyExercise }] }

export default function CreatePlanPage() {
  const createPlan = useCreatePlan()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<PlanCategory>('hipertrofia')
  const [difficulty, setDifficulty] = useState<PlanDifficulty>('intermediate')
  const [durationWeeks, setDurationWeeks] = useState(4)
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(4)
  const [price, setPrice] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')

  // Conteúdo do plano — estrutura de semanas
  const [weeks, setWeeks] = useState<WeekPlan[]>([
    {
      week: 1,
      days: [{ ...defaultDay, exercises: [{ ...emptyExercise }] }],
    },
  ])

  function addWeek() {
    setWeeks([
      ...weeks,
      {
        week: weeks.length + 1,
        days: [{ ...defaultDay, exercises: [{ ...emptyExercise }] }],
      },
    ])
  }

  function removeWeek(weekIdx: number) {
    if (weeks.length <= 1) return
    const updated = weeks.filter((_, i) => i !== weekIdx).map((w, i) => ({ ...w, week: i + 1 }))
    setWeeks(updated)
  }

  function addDay(weekIdx: number) {
    const updated = [...weeks]
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
    const nextDay = dayNames[updated[weekIdx].days.length % 7]
    updated[weekIdx].days.push({ day: nextDay, exercises: [{ ...emptyExercise }] })
    setWeeks(updated)
  }

  function removeDay(weekIdx: number, dayIdx: number) {
    if (weeks[weekIdx].days.length <= 1) return
    const updated = [...weeks]
    updated[weekIdx].days = updated[weekIdx].days.filter((_, i) => i !== dayIdx)
    setWeeks(updated)
  }

  function addExercise(weekIdx: number, dayIdx: number) {
    const updated = [...weeks]
    updated[weekIdx].days[dayIdx].exercises.push({ ...emptyExercise })
    setWeeks(updated)
  }

  function removeExercise(weekIdx: number, dayIdx: number, exIdx: number) {
    if (weeks[weekIdx].days[dayIdx].exercises.length <= 1) return
    const updated = [...weeks]
    updated[weekIdx].days[dayIdx].exercises = updated[weekIdx].days[dayIdx].exercises.filter(
      (_, i) => i !== exIdx
    )
    setWeeks(updated)
  }

  function updateExercise(
    weekIdx: number,
    dayIdx: number,
    exIdx: number,
    field: keyof ExercisePlan,
    value: string | number
  ) {
    const updated = [...weeks]
    const ex = updated[weekIdx].days[dayIdx].exercises[exIdx]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(ex as any)[field] = value
    setWeeks(updated)
  }

  function updateDayName(weekIdx: number, dayIdx: number, name: string) {
    const updated = [...weeks]
    updated[weekIdx].days[dayIdx].day = name
    setWeeks(updated)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const priceBrl = parseFloat(price.replace(',', '.'))
    if (isNaN(priceBrl) || priceBrl < 9.90) {
      return
    }

    createPlan.mutate({
      title,
      description,
      category,
      difficulty,
      duration_weeks: durationWeeks,
      workouts_per_week: workoutsPerWeek,
      price_brl: priceBrl,
      plan_content: { weeks },
      thumbnail_url: thumbnailUrl || null,
    })
  }

  const priceBrl = parseFloat(price.replace(',', '.'))
  const platformFee = isNaN(priceBrl) ? 0 : Math.round(priceBrl * 20) / 100 // 20% plataforma
  const creatorEarns = isNaN(priceBrl) ? 0 : priceBrl - platformFee

  return (
    <AuthGuard requiredType="personal">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/marketplace"
            className="rounded-lg p-2 text-text-muted transition hover:bg-bg-tertiary hover:text-text-primary"
          >
            <DSIcon name="arrowLeft" />
          </Link>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary">
              <DSIcon name="shoppingBag" className="mr-2 inline text-brand-primary" />
              Vender Plano de Treino
            </h2>
            <p className="text-sm text-text-muted">
              Crie um plano de treino para vender no marketplace
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info básica */}
          <div className="rounded-xl border border-border-dark bg-bg-dark-secondary p-6">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">
              Informações do Plano
            </h3>

            <div className="space-y-4">
              <Input
                label="Título do Plano"
                placeholder="Ex: Treino de Hipertrofia Avançado - 12 Semanas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <MD3TextArea
                label="Descrição"
                placeholder="Descreva o plano detalhadamente: objetivo, público-alvo, resultados esperados, diferencial..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={20}
                rows={4}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Categoria
                  </label>
                  <StyledSelect
                    value={category}
                    onChange={(v) => setCategory(v as PlanCategory)}
                    options={Object.entries(categoryLabels).map(([val, label]) => ({ value: val, label }))}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Dificuldade
                  </label>
                  <StyledSelect
                    value={difficulty}
                    onChange={(v) => setDifficulty(v as PlanDifficulty)}
                    options={Object.entries(difficultyLabels).map(([val, label]) => ({ value: val, label }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <MD3Input
                  label="Duração (semanas)"
                  type="number"
                  min={1}
                  max={52}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                />

                <MD3Input
                  label="Treinos por semana"
                  type="number"
                  min={1}
                  max={7}
                  value={workoutsPerWeek}
                  onChange={(e) => setWorkoutsPerWeek(Number(e.target.value))}
                />

                <Input
                  label="URL da Thumbnail"
                  placeholder="https://..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Preço */}
          <div className="rounded-xl border border-border-dark bg-bg-dark-secondary p-6">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">
              <DSIcon name="dollarSign" size={16} className="mr-1 inline text-success" />
              Precificação
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
<MD3Input
                  label="Preço (R$)"
                  type="text"
                  placeholder="49,90"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  helperText="Mínimo: R$ 9,90"
                />

              <div className="rounded-xl border border-border-dark bg-bg-dark p-3">
                <p className="text-xs text-text-muted">Taxa da plataforma (20%)</p>
                <p className="text-lg font-bold text-error">
                  - {formatCurrency(platformFee)}
                </p>
              </div>

              <div className="rounded-xl border border-success/30 bg-success/5 p-3">
                <p className="text-xs text-text-muted">Você recebe (80%)</p>
                <p className="text-lg font-bold text-success">
                  {formatCurrency(creatorEarns)}
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo do plano — por semanas */}
          <div className="rounded-xl border border-border-dark bg-bg-dark-secondary p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">
                <DSIcon name="dumbbell" size={16} className="mr-1 inline text-brand-primary" />
                Conteúdo do Plano
              </h3>
              <Button type="button" variant="secondary" size="sm" onClick={addWeek}>
                <DSIcon name="plus" size={12} className="mr-1" /> Semana
              </Button>
            </div>

            <div className="space-y-6">
              {weeks.map((week, weekIdx) => (
                <div
                  key={weekIdx}
                  className="rounded-xl border border-border-dark bg-bg-dark p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-brand-primary">
                      Semana {week.week}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => addDay(weekIdx)}
                        className="text-xs text-brand-primary hover:underline"
                      >
                        + Dia
                      </button>
                      {weeks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWeek(weekIdx)}
                          className="text-xs text-error hover:underline"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>

                  {week.days.map((day, dayIdx) => (
                    <div key={dayIdx} className="mb-3 rounded-xl border border-border-dark/50 bg-bg-dark-secondary p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <input
                          type="text"
                          value={day.day}
                          onChange={(e) => updateDayName(weekIdx, dayIdx, e.target.value)}
                          className="rounded border border-transparent bg-transparent px-2 py-1 text-xs font-semibold text-text-primary outline-none focus:border-brand-primary"
                          placeholder="Nome do dia"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => addExercise(weekIdx, dayIdx)}
                            className="text-xs text-brand-primary hover:underline"
                          >
                            + Exercício
                          </button>
                          {week.days.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDay(weekIdx, dayIdx)}
                              className="text-xs text-error hover:underline"
                            >
                              <DSIcon name="trash2" size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {day.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              value={ex.name}
                              onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, 'name', e.target.value)}
                              placeholder="Exercício"
                              className="min-w-0 flex-1 rounded border border-border-dark bg-bg-dark px-2 py-1 text-xs text-text-primary outline-none focus:border-brand-primary"
                            />
                            <input
                              type="number"
                              value={ex.sets}
                              onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, 'sets', Number(e.target.value))}
                              className="w-14 rounded border border-border-dark bg-bg-dark px-2 py-1 text-xs text-text-primary outline-none focus:border-brand-primary"
                              placeholder="Sets"
                              min={1}
                            />
                            <span className="text-xs text-text-muted">×</span>
                            <input
                              type="text"
                              value={ex.reps}
                              onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, 'reps', e.target.value)}
                              className="w-16 rounded border border-border-dark bg-bg-dark px-2 py-1 text-xs text-text-primary outline-none focus:border-brand-primary"
                              placeholder="Reps"
                            />
                            <input
                              type="text"
                              value={ex.rest}
                              onChange={(e) => updateExercise(weekIdx, dayIdx, exIdx, 'rest', e.target.value)}
                              className="w-16 rounded border border-border-dark bg-bg-dark px-2 py-1 text-xs text-text-primary outline-none focus:border-brand-primary"
                              placeholder="Descanso"
                            />
                            {day.exercises.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExercise(weekIdx, dayIdx, exIdx)}
                                className="text-error hover:text-error/80"
                              >
                                <DSIcon name="trash2" size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/dashboard/marketplace">
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              loading={createPlan.isPending}
              disabled={!title || !description || !price}
            >
              <DSIcon name="save" size={16} className="mr-2" />
              Criar Plano
            </Button>
          </div>

          <p className="text-center text-xs text-text-muted">
            O plano será criado como <strong>rascunho</strong>. Você poderá publicar depois.
          </p>
        </form>
      </div>
    </AuthGuard>
  )
}

function formatCurrency(value: number) {
  const safe = typeof value === 'number' && !isNaN(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe)
}
