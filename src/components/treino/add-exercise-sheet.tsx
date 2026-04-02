/**
 * src/components/treino/add-exercise-sheet.tsx
 *
 * Bottom Sheet — Adicionar exercícios ao treino
 * Multi-select com filtro por músculo + busca
 *
 * Sprint 18
 */

'use client'

import { useState, useMemo } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { useExercises, useMuscleGroups } from '@/hooks/use-exercises'
import type { Exercise } from '@/hooks/use-exercises'

// ============================================
// Props
// ============================================

interface AddExerciseSheetProps {
  open: boolean
  onClose: () => void
  onAdd: (exercises: Exercise[]) => void
  excludeIds?: string[]
}

// ============================================
// Component
// ============================================

export function AddExerciseSheet({ open, onClose, onAdd, excludeIds = [] }: AddExerciseSheetProps) {
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const { data: muscleGroups } = useMuscleGroups()
  const { data: exercisesData, isLoading } = useExercises({
    muscle_group: muscleFilter || undefined,
    q: search || undefined,
    per_page: 100,
  })

  const exercises = useMemo(() => {
    const all = exercisesData?.exercises || []
    return all.filter((ex) => !excludeIds.includes(ex.id))
  }, [exercisesData, excludeIds])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAdd = () => {
    const selectedExercises = exercises.filter((ex) => selected.has(ex.id))
    onAdd(selectedExercises)
    setSelected(new Set())
    setSearch('')
    setMuscleFilter(null)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative mx-auto w-full max-w-lg rounded-t-3xl border-t border-white/10 bg-bg-secondary pb-safe animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="text-[17px] font-bold text-white">Adicionar Exercícios</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-white"
          >
            <DSIcon name="x" size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <DSIcon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar exercício..."
              className="w-full rounded-xl border border-white/8 bg-white/3 py-2.5 pl-9 pr-4 text-[14px] text-white placeholder:text-zinc-600 focus:border-brand-primary/30 focus:outline-none"
            />
          </div>
        </div>

        {/* Muscle group chips */}
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 scrollbar-hide">
          <button
            type="button"
            onClick={() => setMuscleFilter(null)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
              !muscleFilter ? 'bg-brand-primary/15 text-brand-primary' : 'bg-white/5 text-zinc-500'
            }`}
          >
            Todos
          </button>
          {(muscleGroups || []).map((mg) => (
            <button
              key={mg.id}
              type="button"
              onClick={() => setMuscleFilter(mg.id === muscleFilter ? null : mg.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
                muscleFilter === mg.id ? 'bg-brand-primary/15 text-brand-primary' : 'bg-white/5 text-zinc-500'
              }`}
            >
              {mg.name_pt}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="max-h-80 overflow-y-auto px-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-white/3" />
              ))}
            </div>
          ) : exercises.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-zinc-500">Nenhum exercício encontrado</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {exercises.map((ex) => {
                const isSelected = selected.has(ex.id)
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => toggleSelect(ex.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
                      isSelected
                        ? 'bg-brand-primary/10 border border-brand-primary/30'
                        : 'bg-white/3 border border-transparent hover:bg-white/5'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary text-white'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      {isSelected && <DSIcon name="check" size={12} />}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {ex.name_pt || ex.name}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {(muscleGroups || []).find((mg) => mg.id === ex.muscle_group_id)?.name_pt || ex.muscle_group_id}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        {selected.size > 0 && (
          <div className="border-t border-white/6 px-4 py-4 mt-3">
            <button
              type="button"
              onClick={handleAdd}
              className="w-full rounded-2xl bg-brand-primary py-3.5 text-[14px] font-bold text-white shadow-lg transition-all active:scale-[0.97]"
            >
              Adicionar {selected.size} exercício{selected.size > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
