/**
 * src/app/(app)/treinos/novo/page.tsx
 *
 * Sprint 32 — Criar treino manual
 * Nome, adicionar exercícios, configurar sets/reps/peso
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { hapticLight, hapticSuccess } from '@/lib/haptics'

interface ManualExercise {
  id: string
  name: string
  sets: number
  reps: number
  weight_kg: number
  rest_seconds: number
}

export default function NovoTreinoPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [exercises, setExercises] = useState<ManualExercise[]>([])
  const [saving, setSaving] = useState(false)

  const addExercise = useCallback(() => {
    hapticLight()
    const newEx: ManualExercise = {
      id: `ex-${Date.now()}`,
      name: '',
      sets: 3,
      reps: 12,
      weight_kg: 0,
      rest_seconds: 60,
    }
    setExercises((prev) => [...prev, newEx])
  }, [])

  const updateExercise = useCallback((id: string, field: keyof ManualExercise, value: string | number) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    )
  }, [])

  const removeExercise = useCallback((id: string) => {
    hapticLight()
    setExercises((prev) => prev.filter((ex) => ex.id !== id))
  }, [])

  const handleSave = useCallback(async () => {
    if (!name.trim() || exercises.length === 0) return
    setSaving(true)
    // TODO: POST to /api/v1/custom-workouts
    hapticSuccess()
    setTimeout(() => {
      setSaving(false)
      router.push('/treinos')
    }, 500)
  }, [name, exercises, router])

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-28">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <h1 className="text-lg font-bold text-white">Novo Treino</h1>
      </div>

      {/* Name & Description */}
      <div className="mb-5 space-y-3">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-zinc-500">Nome do treino</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Treino de Peito e Tríceps"
            className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 outline-none focus:border-brand-primary/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-zinc-500">Descrição (opcional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição curta"
            className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 outline-none focus:border-brand-primary/50"
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-white">
          Exercícios ({exercises.length})
        </h2>
        <button
          onClick={addExercise}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-brand-primary hover:bg-brand-primary/10 transition-all"
        >
          <DSIcon name="plus" size={14} />
          Adicionar
        </button>
      </div>

      {exercises.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 py-8 text-center">
          <DSIcon name="dumbbell" size={28} className="mx-auto mb-2 text-zinc-700" />
          <p className="text-[13px] text-zinc-500">Adicione exercícios ao seu treino</p>
        </div>
      )}

      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <div key={ex.id} className="rounded-2xl border border-white/5 bg-white/2 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500">EXERCÍCIO {i + 1}</span>
              <button
                onClick={() => removeExercise(ex.id)}
                className="text-zinc-600 hover:text-red-400 transition-colors"
              >
                <DSIcon name="trash2" size={16} />
              </button>
            </div>

            <input
              type="text"
              value={ex.name}
              onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
              placeholder="Nome do exercício"
              className="mb-3 w-full rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 outline-none focus:border-brand-primary/50"
            />

            <div className="grid grid-cols-4 gap-2">
              <NumberField
                label="Séries"
                value={ex.sets}
                onChange={(v) => updateExercise(ex.id, 'sets', v)}
              />
              <NumberField
                label="Reps"
                value={ex.reps}
                onChange={(v) => updateExercise(ex.id, 'reps', v)}
              />
              <NumberField
                label="Peso (kg)"
                value={ex.weight_kg}
                onChange={(v) => updateExercise(ex.id, 'weight_kg', v)}
              />
              <NumberField
                label="Desc (s)"
                value={ex.rest_seconds}
                onChange={(v) => updateExercise(ex.id, 'rest_seconds', v)}
                step={15}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="fixed right-0 bottom-20 left-0 z-40 px-4 pb-4">
        <div className="mx-auto max-w-lg">
          <Button
            disabled={!name.trim() || exercises.length === 0}
            loading={saving}
            onClick={handleSave}
            className="w-full"
          >
            <DSIcon name="check" size={18} />
            Salvar Treino
          </Button>
        </div>
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] text-zinc-600">{label}</label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(0, value - step))}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-zinc-400"
        >
          <DSIcon name="minus" size={12} />
        </button>
        <span className="flex-1 text-center text-[13px] font-bold text-white">{value}</span>
        <button
          onClick={() => onChange(value + step)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-zinc-400"
        >
          <DSIcon name="plus" size={12} />
        </button>
      </div>
    </div>
  )
}
