/**
 * src/app/(app)/plano/editar/page.tsx
 *
 * EDITAR TREINO — Reordenar, remover e adicionar exercícios ao dia.
 *
 * Sprint 18
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { AddExerciseSheet } from '@/components/treino'
import { useCurrentPlan, useUpdatePlanExercises, useRemovePlanExercise } from '@/hooks/use-plans'
import type { PlanExercise } from '@/hooks/use-plans'
import type { Exercise } from '@/hooks/use-exercises'

// ============================================
// Emoji map
// ============================================

const MUSCLE_EMOJI: Record<string, string> = {
  chest: '🫁', back: '🔙', shoulders: '🎯', biceps: '💪', triceps: '🦾',
  legs: '🦵', quadriceps: '🦵', hamstrings: '🦵', glutes: '🍑', calves: '🦶',
  abs: '🧱', core: '🧱', forearms: '🤛', traps: '🔺', full_body: '🏋️',
}

// ============================================
// Page
// ============================================

export default function EditarPlanoClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dayIndexParam = searchParams.get('day') || '0'
  const dayIndex = parseInt(dayIndexParam, 10)

  const { data: plan, isLoading } = useCurrentPlan()
  const updateExercises = useUpdatePlanExercises()
  const removeExercise = useRemovePlanExercise()

  const [showAddSheet, setShowAddSheet] = useState(false)
  const [editingExercise, setEditingExercise] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<string | null>(null)

  const currentDay = plan?.days?.[dayIndex]
  const exercises = useMemo(() => currentDay?.exercises || [], [currentDay?.exercises])

  const existingExerciseIds = useMemo(
    () => exercises.map((e) => e.exercise_id),
    [exercises]
  )

  // ============================================
  // Handlers
  // ============================================

  const handleRemove = useCallback(
    async (exerciseRowId: string) => {
      if (!plan || !currentDay) return
      await removeExercise.mutateAsync({
        planId: plan.id,
        dayId: currentDay.id,
        exerciseId: exerciseRowId,
      })
      setContextMenu(null)
    },
    [plan, currentDay, removeExercise]
  )

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0 || !plan || !currentDay) return
      const newList = [...exercises]
      const temp = newList[index]
      newList[index] = newList[index - 1]
      newList[index - 1] = temp

      updateExercises.mutate({
        planId: plan.id,
        dayId: currentDay.id,
        exercises: newList.map((ex) => ({
          id: ex.id,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          weight_kg: ex.weight_kg,
          rest_seconds: ex.rest_seconds,
          is_warmup: ex.is_warmup,
          is_superset: ex.is_superset,
          superset_group: ex.superset_group,
          notes: ex.notes,
        })),
      })
    },
    [exercises, plan, currentDay, updateExercises]
  )

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= exercises.length - 1 || !plan || !currentDay) return
      const newList = [...exercises]
      const temp = newList[index]
      newList[index] = newList[index + 1]
      newList[index + 1] = temp

      updateExercises.mutate({
        planId: plan.id,
        dayId: currentDay.id,
        exercises: newList.map((ex) => ({
          id: ex.id,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          weight_kg: ex.weight_kg,
          rest_seconds: ex.rest_seconds,
          is_warmup: ex.is_warmup,
          is_superset: ex.is_superset,
          superset_group: ex.superset_group,
          notes: ex.notes,
        })),
      })
    },
    [exercises, plan, currentDay, updateExercises]
  )

  const handleAddExercises = useCallback(
    (newExercises: Exercise[]) => {
      if (!plan || !currentDay) return
      const combined = [
        ...exercises.map((ex) => ({
          id: ex.id,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          weight_kg: ex.weight_kg,
          rest_seconds: ex.rest_seconds,
          is_warmup: ex.is_warmup,
          is_superset: ex.is_superset,
          superset_group: ex.superset_group,
          notes: ex.notes,
        })),
        ...newExercises.map((ne) => ({
          exercise_id: ne.id,
          sets: 3,
          reps: '12',
          weight_kg: null,
          rest_seconds: 60,
          is_warmup: false,
          is_superset: false,
          superset_group: null,
          notes: null,
        })),
      ]

      updateExercises.mutate({
        planId: plan.id,
        dayId: currentDay.id,
        exercises: combined,
      })
    },
    [exercises, plan, currentDay, updateExercises]
  )

  const handleUpdateExerciseField = useCallback(
    (index: number, field: keyof PlanExercise, value: unknown) => {
      if (!plan || !currentDay) return
      const newList = exercises.map((ex, i) => ({
        id: ex.id,
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        weight_kg: ex.weight_kg,
        rest_seconds: ex.rest_seconds,
        is_warmup: ex.is_warmup,
        is_superset: ex.is_superset,
        superset_group: ex.superset_group,
        notes: ex.notes,
        ...(i === index ? { [field]: value } : {}),
      }))

      updateExercises.mutate({
        planId: plan.id,
        dayId: currentDay.id,
        exercises: newList,
      })
      setEditingExercise(null)
    },
    [exercises, plan, currentDay, updateExercises]
  )

  // ============================================
  // Loading / empty
  // ============================================

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="mb-6 h-8 w-32 animate-pulse rounded-lg bg-white/5" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/3" />
          ))}
        </div>
      </div>
    )
  }

  if (!currentDay) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <button
          aria-label="Voltar"
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-[13px] text-brand-primary"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar
        </button>
        <div className="rounded-2xl border border-white/6 bg-white/2 p-6 text-center">
          <p className="text-[13px] text-zinc-500">Dia não encontrado</p>
        </div>
      </div>
    )
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            aria-label="Voltar"
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-zinc-400 hover:text-white transition-all"
          >
            <DSIcon name="arrowLeft" size={20} />
          </button>
          <div>
            <h1 className="text-[17px] font-bold text-white">Editar Exercícios</h1>
            <p className="text-[12px] text-zinc-500">{currentDay.name} — {exercises.length} exercícios</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddSheet(true)}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-brand-primary/15 px-3 text-[12px] font-semibold text-brand-primary transition-all hover:bg-brand-primary/25"
        >
          <DSIcon name="plus" size={16} />
          Adicionar
        </button>
      </div>

      {/* Exercise list — editable */}
      <div className="space-y-2">
        {exercises.map((ex, index) => (
          <div
            key={ex.id}
            className="relative rounded-2xl border border-white/6 bg-white/3 p-3"
          >
            <div className="flex items-center gap-3">
              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="flex h-6 w-6 items-center justify-center rounded text-zinc-600 hover:text-white disabled:opacity-20"
                >
                  <DSIcon name="chevronUp" size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === exercises.length - 1}
                  className="flex h-6 w-6 items-center justify-center rounded text-zinc-600 hover:text-white disabled:opacity-20"
                >
                  <DSIcon name="chevronDown" size={14} />
                </button>
              </div>

              {/* Emoji */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl">
                {MUSCLE_EMOJI[ex.muscle_group || ''] || '💪'}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white">
                  {ex.exercise_name || 'Exercício'}
                </p>
                <p className="text-[11px] text-zinc-500">
                  {ex.sets} × {ex.reps} {ex.weight_kg ? `· ${ex.weight_kg}kg` : ''}
                </p>
              </div>

              {/* Context menu button */}
              <button
                type="button"
                onClick={() => setContextMenu(contextMenu === ex.id ? null : ex.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5"
              >
                <DSIcon name="gripVertical" size={16} />
              </button>
            </div>

            {/* Context menu dropdown */}
            {contextMenu === ex.id && (
              <div className="absolute right-3 top-14 z-10 w-44 rounded-xl border border-white/10 bg-bg-secondary shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setEditingExercise(ex.id)
                    setContextMenu(null)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] text-white hover:bg-white/5 rounded-t-xl"
                >
                  <DSIcon name="edit" size={14} className="text-zinc-500" />
                  Editar Sets/Reps
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(ex.id)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] text-red-400 hover:bg-red-500/10 rounded-b-xl"
                >
                  <DSIcon name="trash" size={14} />
                  Remover
                </button>
              </div>
            )}

            {/* Inline edit panel */}
            {editingExercise === ex.id && (
              <div className="mt-3 border-t border-white/6 pt-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1 block text-[10px] text-zinc-500 uppercase">Séries</label>
                    <input
                      type="number"
                      defaultValue={ex.sets}
                      onBlur={(e) => handleUpdateExerciseField(index, 'sets', parseInt(e.target.value) || 3)}
                      className="w-full rounded-lg border border-white/10 bg-white/3 px-2.5 py-1.5 text-center text-[13px] text-white focus:border-brand-primary/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-zinc-500 uppercase">Reps</label>
                    <input
                      type="text"
                      defaultValue={ex.reps}
                      onBlur={(e) => handleUpdateExerciseField(index, 'reps', e.target.value || '12')}
                      className="w-full rounded-lg border border-white/10 bg-white/3 px-2.5 py-1.5 text-center text-[13px] text-white focus:border-brand-primary/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-zinc-500 uppercase">Peso (kg)</label>
                    <input
                      type="number"
                      defaultValue={ex.weight_kg || ''}
                      onBlur={(e) => handleUpdateExerciseField(index, 'weight_kg', parseFloat(e.target.value) || null)}
                      className="w-full rounded-lg border border-white/10 bg-white/3 px-2.5 py-1.5 text-center text-[13px] text-white focus:border-brand-primary/30 focus:outline-none"
                      placeholder="—"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="mb-1 block text-[10px] text-zinc-500 uppercase">Descanso (seg)</label>
                  <input
                    type="number"
                    defaultValue={ex.rest_seconds}
                    onBlur={(e) => handleUpdateExerciseField(index, 'rest_seconds', parseInt(e.target.value) || 60)}
                    className="w-full rounded-lg border border-white/10 bg-white/3 px-2.5 py-1.5 text-center text-[13px] text-white focus:border-brand-primary/30 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="mt-2 w-full rounded-lg bg-brand-primary/10 py-2 text-[12px] font-semibold text-brand-primary"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {exercises.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/6 bg-white/2 p-8 text-center">
          <DSIcon name="dumbbell" size={28} className="mb-3 text-zinc-600" />
          <h3 className="text-[15px] font-bold text-white">Nenhum exercício</h3>
          <p className="mt-1 text-[13px] text-zinc-500">
            Toque em &quot;Adicionar&quot; para começar a montar seu treino.
          </p>
        </div>
      )}

      {/* Add Exercise Sheet */}
      <AddExerciseSheet
        open={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={handleAddExercises}
        excludeIds={existingExerciseIds}
      />
    </div>
  )
}
