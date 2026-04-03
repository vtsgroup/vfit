/**
 * src/app/(app)/exercicios/[id]/page.tsx
 *
 * EXERCÍCIO — Detalhe completo com tabs (ALVO / INSTRUÇÕES / EQUIPAMENTO)
 *
 * Sprint 17
 */

'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { useExerciseDetail } from '@/hooks/use-exercises'
import { useFavoriteExercises } from '@/hooks/use-favorite-exercises'

// ============================================
// Constants
// ============================================

type DetailTab = 'target' | 'instructions' | 'equipment'

const DETAIL_TABS: { id: DetailTab; label: string; icon: string }[] = [
  { id: 'target', label: 'Alvo', icon: '🎯' },
  { id: 'instructions', label: 'Instruções', icon: '📋' },
  { id: 'equipment', label: 'Equipamento', icon: '🔧' },
]

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Iniciante', color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  intermediate: { label: 'Intermediário', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  advanced: { label: 'Avançado', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
}

const MUSCLE_EMOJI: Record<string, string> = {
  chest: '🫁', back: '🔙', shoulders: '🎯', biceps: '💪', triceps: '🦾',
  legs: '🦵', quadriceps: '🦵', hamstrings: '🦵', glutes: '🍑', calves: '🦶',
  abs: '🧱', core: '🧱', forearms: '🤛', traps: '🔺', full_body: '🏋️',
}

const EQUIPMENT_EMOJI: Record<string, string> = {
  barbell: '🏋️', dumbbell: '💪', cable: '🔗', machine: '⚙️',
  bodyweight: '🤸', kettlebell: '🔔', band: '🎗️', smith: '🏗️',
  bench: '🪑', pullup_bar: '🏗️', ez_bar: '🏋️',
}

// ============================================
// Instructions parser — extracts from description
// ============================================

function parseInstructions(text: string | null): string[] {
  if (!text) return []
  // Split by numbered items (1. 2. 3.) or newlines
  const lines = text
    .split(/(?:\d+\.\s*|\n)+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
  return lines.length > 0 ? lines : [text]
}

// ============================================
// Page
// ============================================

export default function ExerciseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [activeTab, setActiveTab] = useState<DetailTab>('target')

  const { data: exercise, isLoading } = useExerciseDetail(id)
  const { isFavorite, toggleFavorite } = useFavoriteExercises()

  const diff = exercise ? (DIFFICULTY_MAP[exercise.difficulty] || DIFFICULTY_MAP.beginner) : DIFFICULTY_MAP.beginner

  const equipment = useMemo(() => {
    if (!exercise) return []
    try {
      return JSON.parse(exercise.equipment_needed || '[]') as string[]
    } catch {
      return []
    }
  }, [exercise])

  const instructions = useMemo(() => {
    if (!exercise) return []
    return parseInstructions(exercise.description_pt || exercise.description)
  }, [exercise])

  // ============================================
  // Loading
  // ============================================

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="mb-6 h-8 w-32 animate-pulse rounded-lg bg-white/5" />
        <div className="mb-4 h-48 animate-pulse rounded-3xl bg-white/3" />
        <div className="space-y-3">
          <div className="h-6 w-48 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
          <div className="h-12 animate-pulse rounded-xl bg-white/3" />
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1 text-[13px] text-brand-primary"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar
        </button>
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/6 bg-white/2 p-8 text-center">
          <DSIcon name="alertTriangle" size={32} className="mb-3 text-zinc-500" />
          <h2 className="text-[16px] font-bold text-white">Exercício não encontrado</h2>
        </div>
      </div>
    )
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      {/* Header with back + favorite */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-zinc-400 hover:text-white transition-all"
        >
          <DSIcon name="arrowLeft" size={20} />
        </button>

        <button
          type="button"
          onClick={() => toggleFavorite(exercise.id)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/3 transition-all hover:bg-white/6"
        >
          <DSIcon
            name="heart"
            size={20}
            className={isFavorite(exercise.id) ? 'text-red-400 fill-red-400' : 'text-zinc-400'}
          />
        </button>
      </div>

      {/* Hero image / emoji fallback */}
      <div className="mb-5 flex h-48 items-center justify-center rounded-3xl border border-white/6 bg-white/2 overflow-hidden">
        {exercise.thumbnail_url ? (
          <img
            src={exercise.thumbnail_url}
            alt={exercise.name_pt}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-7xl">{MUSCLE_EMOJI[exercise.muscle_group_id] || '💪'}</span>
        )}
      </div>

      {/* Title + tags */}
      <div className="mb-5">
        <h1 className="text-xl font-black text-white leading-tight">
          {exercise.name_pt || exercise.name}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {exercise.muscle_group && (
            <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[11px] font-medium text-brand-primary border border-brand-primary/20">
              {MUSCLE_EMOJI[exercise.muscle_group_id] || '💪'}{' '}
              {exercise.muscle_group.name_pt}
            </span>
          )}
          <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${diff.color}`}>
            {diff.label}
          </span>
          {exercise.view_count > 100 && (
            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-medium text-purple-400 border border-purple-500/20">
              🔥 Muito Popular
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-white/3 p-1">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg py-2 text-center text-[12px] font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-brand-primary/15 text-brand-primary'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'target' && (
        <TargetTab
          exercise={exercise}
        />
      )}

      {activeTab === 'instructions' && (
        <InstructionsTab
          instructions={instructions}
          exercise={exercise}
        />
      )}

      {activeTab === 'equipment' && (
        <EquipmentTab
          equipment={equipment}
        />
      )}
    </div>
  )
}

// ============================================
// Target Tab
// ============================================

function TargetTab({ exercise }: { exercise: import('@/hooks/use-exercises').ExerciseDetail }) {
  return (
    <div className="space-y-4">
      {/* Primary muscle */}
      <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
        <h3 className="mb-3 text-[13px] font-semibold text-zinc-400 uppercase tracking-wider">
          Músculo Primário
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/8 text-2xl">
            {MUSCLE_EMOJI[exercise.muscle_group_id] || '💪'}
          </div>
          <div>
            <p className="text-[15px] font-bold text-white">
              {exercise.muscle_group?.name_pt || exercise.muscle_group_id}
            </p>
            <p className="text-[12px] text-zinc-500">
              {exercise.muscle_group?.name || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Difficulty */}
      <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
        <h3 className="mb-3 text-[13px] font-semibold text-zinc-400 uppercase tracking-wider">
          Nível de Dificuldade
        </h3>
        <div className="flex gap-2">
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => {
            const d = DIFFICULTY_MAP[level]
            const isActive = exercise.difficulty === level
            return (
              <div
                key={level}
                className={`flex-1 rounded-xl border p-3 text-center transition-all ${
                  isActive
                    ? `${d.color} border-current`
                    : 'border-white/6 bg-white/2 text-zinc-600'
                }`}
              >
                <p className={`text-[12px] font-semibold ${isActive ? '' : 'text-zinc-600'}`}>
                  {d.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* View count */}
      {exercise.view_count > 0 && (
        <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
          <h3 className="mb-2 text-[13px] font-semibold text-zinc-400 uppercase tracking-wider">
            Popularidade
          </h3>
          <p className="text-[20px] font-black text-white">
            {exercise.view_count.toLocaleString('pt-BR')}
            <span className="ml-1 text-[13px] font-normal text-zinc-500">visualizações</span>
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================
// Instructions Tab
// ============================================

function InstructionsTab({
  instructions,
  exercise,
}: {
  instructions: string[]
  exercise: import('@/hooks/use-exercises').ExerciseDetail
}) {
  if (instructions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/6 bg-white/2 p-8 text-center">
        <DSIcon name="fileText" size={28} className="mb-3 text-zinc-600" />
        <h3 className="text-[15px] font-bold text-white">Instruções em breve</h3>
        <p className="mt-1 max-w-xs text-[13px] text-zinc-500">
          As instruções detalhadas para este exercício serão adicionadas em breve.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Video placeholder */}
      {(exercise.video_url_vertical || exercise.video_url_horizontal) && (
        <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
          <h3 className="mb-2 text-[13px] font-semibold text-zinc-400 uppercase tracking-wider">
            🎬 Vídeo Demonstrativo
          </h3>
          <div className="flex h-32 items-center justify-center rounded-xl bg-white/5 text-zinc-500">
            <DSIcon name="play" size={32} />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
        <h3 className="mb-3 text-[13px] font-semibold text-zinc-400 uppercase tracking-wider">
          Passo a Passo
        </h3>
        <div className="space-y-3">
          {instructions.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8 text-[12px] font-bold text-brand-primary">
                {i + 1}
              </div>
              <p className="flex-1 text-[13px] text-zinc-300 leading-relaxed pt-0.5">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Equipment Tab
// ============================================

function EquipmentTab({ equipment }: { equipment: string[] }) {
  if (equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/6 bg-white/2 p-8 text-center">
        <span className="mb-3 text-4xl">🤸</span>
        <h3 className="text-[15px] font-bold text-white">Peso Corporal</h3>
        <p className="mt-1 max-w-xs text-[13px] text-zinc-500">
          Este exercício não requer equipamento. Apenas o peso do seu corpo!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {equipment.map((eq) => (
        <div
          key={eq}
          className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/3 p-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">
            {EQUIPMENT_EMOJI[eq.toLowerCase().replace(/\s/g, '_')] || '🔧'}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white capitalize">{eq}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
