/**
 * src/app/(app)/exercicios/page.tsx
 *
 * EXERCÍCIOS — Tab 4 (💪)
 * Biblioteca de exercícios com busca, filtros por músculo/equipamento, favoritos.
 *
 * Sprint 16 — Catálogo completo
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { ExerciseCard } from '@/components/exercicios'
import { useExercises, useMuscleGroups } from '@/hooks/use-exercises'
import { useFavoriteExercises } from '@/hooks/use-favorite-exercises'
import { useImagePrefetch } from '@/hooks/use-image-prefetch'
import type { MuscleGroup } from '@/hooks/use-exercises'
import type { DSIconName } from '@/components/ui/ds-icon'

// ============================================
// Constants
// ============================================

type TabType = 'muscle' | 'equipment' | 'favorites'

const TABS: { id: TabType; label: string; icon: DSIconName }[] = [
  { id: 'muscle', label: 'Por Músculo', icon: 'dumbbell' },
  { id: 'equipment', label: 'Equipamento', icon: 'wrench' },
  { id: 'favorites', label: 'Favoritos', icon: 'heart' },
]

const EQUIPMENT_CATEGORIES = [
  { id: 'barbell', label: 'Barra', icon: 'dumbbell' as DSIconName },
  { id: 'dumbbell', label: 'Halteres', icon: 'dumbbell' as DSIconName },
  { id: 'cable', label: 'Cabos', icon: 'link2' as DSIconName },
  { id: 'machine', label: 'Máquinas', icon: 'settings' as DSIconName },
  { id: 'bodyweight', label: 'Peso Corporal', icon: 'activity' as DSIconName },
  { id: 'kettlebell', label: 'Kettlebell', icon: 'award' as DSIconName },
  { id: 'band', label: 'Elásticos', icon: 'layers' as DSIconName },
  { id: 'smith', label: 'Smith Machine', icon: 'building' as DSIconName },
]

const MUSCLE_ICON: Record<string, DSIconName> = {
  chest: 'target',
  back: 'activity',
  shoulders: 'shield',
  biceps: 'dumbbell',
  triceps: 'dumbbell',
  legs: 'footprints',
  quadriceps: 'footprints',
  hamstrings: 'footprints',
  glutes: 'award',
  calves: 'footprints',
  abs: 'shieldCheck',
  core: 'shieldCheck',
  forearms: 'dumbbell',
  traps: 'triangle',
  full_body: 'dumbbell',
}

// ============================================
// Page
// ============================================

export default function ExerciciosPage() {
  const [activeTab, setActiveTab] = useState<TabType>('muscle')
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)

  // Hooks
  const { data: muscleGroups } = useMuscleGroups()
  const { data: exercisesData, isLoading } = useExercises({
    muscle_group: selectedMuscle || undefined,
    q: searchQuery || undefined,
    per_page: 200,
  })
  const { favorites, isFavorite, toggleFavorite, count: favCount } = useFavoriteExercises()

  const exercises = useMemo(() => exercisesData?.exercises ?? [], [exercisesData?.exercises])
  const muscleGroupMap = useMemo(() => {
    const map: Record<string, MuscleGroup> = {}
    if (muscleGroups) {
      for (const mg of muscleGroups) {
        map[mg.id] = mg
      }
    }
    return map
  }, [muscleGroups])

  // Sprint 11 — Cache R2: prefetch de imagens de grupos musculares para offline
  useImagePrefetch(muscleGroups?.map((mg) => mg.image_url) ?? [])
  // Prefetch thumbnails dos exercícios carregados
  useImagePrefetch(exercises.slice(0, 30).map((ex) => ex.thumbnail_url))

  // Filtered exercises for equipment tab
  const equipmentFiltered = useMemo(() => {
    if (!selectedEquipment) return exercises
    return exercises.filter((ex) => {
      try {
        const eq = JSON.parse(ex.equipment_needed || '[]') as string[]
        return eq.some((e) => e.toLowerCase().includes(selectedEquipment))
      } catch {
        return false
      }
    })
  }, [exercises, selectedEquipment])

  // Favorite exercises
  const favoriteExercises = useMemo(() => {
    return exercises.filter((ex) => favorites.includes(ex.id))
  }, [exercises, favorites])

  const handleMuscleSelect = useCallback((id: string) => {
    setSelectedMuscle((prev) => (prev === id ? null : id))
  }, [])

  const handleEquipmentSelect = useCallback((id: string) => {
    setSelectedEquipment((prev) => (prev === id ? null : id))
  }, [])

  // ============================================
  // Render
  // ============================================

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">Exercícios</h1>
            <p className="mt-0.5 text-[13px] text-zinc-500">
              {exercisesData?.meta?.total || 0} exercícios disponíveis
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
              showSearch
                ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
                : 'border-white/8 bg-white/3 text-zinc-400 hover:text-white hover:bg-white/6'
            }`}
          >
            <DSIcon name="search" size={20} />
          </button>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="mt-3 relative">
            <DSIcon
              name="search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar exercício..."
              className="w-full rounded-xl border border-white/8 bg-white/3 py-2.5 pl-9 pr-4 text-[14px] text-white placeholder:text-zinc-600 focus:border-brand-primary/30 focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <DSIcon name="x" size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-white/3 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id)
              setSelectedMuscle(null)
              setSelectedEquipment(null)
            }}
            className={`flex-1 rounded-lg py-2 text-center text-[12px] font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-brand-primary/15 text-brand-primary'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="mr-1 inline-flex align-middle"><DSIcon name={tab.icon} size={14} /></span>
            {tab.label}
            {tab.id === 'favorites' && favCount > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500/20 px-1 text-[10px] text-red-400">
                {favCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'muscle' && (
        <MuscleTabContent
          muscleGroups={muscleGroups || []}
          selectedMuscle={selectedMuscle}
          onSelect={handleMuscleSelect}
          exercises={exercises}
          muscleGroupMap={muscleGroupMap}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'equipment' && (
        <EquipmentTabContent
          selectedEquipment={selectedEquipment}
          onSelect={handleEquipmentSelect}
          exercises={equipmentFiltered}
          muscleGroupMap={muscleGroupMap}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'favorites' && (
        <FavoritesTabContent
          exercises={favoriteExercises}
          muscleGroupMap={muscleGroupMap}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          isLoading={isLoading}
          totalFavorites={favCount}
        />
      )}
    </div>
  )
}

// ============================================
// Muscle Tab
// ============================================

function MuscleTabContent({
  muscleGroups,
  selectedMuscle,
  onSelect,
  exercises,
  muscleGroupMap,
  isFavorite,
  toggleFavorite,
  isLoading,
}: {
  muscleGroups: MuscleGroup[]
  selectedMuscle: string | null
  onSelect: (id: string) => void
  exercises: import('@/hooks/use-exercises').Exercise[]
  muscleGroupMap: Record<string, MuscleGroup>
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  isLoading: boolean
}) {
  // Group exercises by muscle for counts
  const countByMuscle = useMemo(() => {
    const map: Record<string, number> = {}
    for (const ex of exercises) {
      map[ex.muscle_group_id] = (map[ex.muscle_group_id] || 0) + 1
    }
    return map
  }, [exercises])

  return (
    <div>
      {/* Muscle Group Grid */}
      {!selectedMuscle && (
        <div className="grid grid-cols-2 gap-2">
          {muscleGroups.map((mg) => (
            <button
              key={mg.id}
              type="button"
              onClick={() => onSelect(mg.id)}
              className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/3 p-3 text-left transition-all hover:bg-white/6 active:scale-[0.97]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-brand-primary">
                <DSIcon name={MUSCLE_ICON[mg.id] || 'dumbbell'} size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white">
                  {mg.name_pt || mg.name}
                </p>
                <p className="text-[11px] text-zinc-500">
                  {countByMuscle[mg.id] || 0} exercícios
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected muscle → exercise list */}
      {selectedMuscle && (
        <div>
          <button
            type="button"
            onClick={() => onSelect(selectedMuscle)}
            className="mb-3 flex items-center gap-1 text-[13px] text-brand-primary hover:underline"
          >
            <DSIcon name="arrowLeft" size={14} />
            <span>Todos os músculos</span>
          </button>

          <h2 className="mb-3 text-[16px] font-bold text-white">
            <span className="mr-2 inline-flex align-middle text-brand-primary"><DSIcon name={MUSCLE_ICON[selectedMuscle] || 'dumbbell'} size={16} /></span>
            {muscleGroupMap[selectedMuscle]?.name_pt || selectedMuscle}
          </h2>

          <ExerciseList
            exercises={exercises}
            muscleGroupMap={muscleGroupMap}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}

// ============================================
// Equipment Tab
// ============================================

function EquipmentTabContent({
  selectedEquipment,
  onSelect,
  exercises,
  muscleGroupMap,
  isFavorite,
  toggleFavorite,
  isLoading,
}: {
  selectedEquipment: string | null
  onSelect: (id: string) => void
  exercises: import('@/hooks/use-exercises').Exercise[]
  muscleGroupMap: Record<string, MuscleGroup>
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  isLoading: boolean
}) {
  return (
    <div>
      {/* Equipment chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {EQUIPMENT_CATEGORIES.map((eq) => (
          <button
            key={eq.id}
            type="button"
            onClick={() => onSelect(eq.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium transition-all ${
              selectedEquipment === eq.id
                ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30'
                : 'bg-white/4 text-zinc-400 border border-white/6 hover:bg-white/6'
            }`}
          >
            <DSIcon name={eq.icon} size={14} />
            {eq.label}
          </button>
        ))}
      </div>

      <ExerciseList
        exercises={exercises}
        muscleGroupMap={muscleGroupMap}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        isLoading={isLoading}
      />
    </div>
  )
}

// ============================================
// Favorites Tab
// ============================================

function FavoritesTabContent({
  exercises,
  muscleGroupMap,
  isFavorite,
  toggleFavorite,
  isLoading,
  totalFavorites,
}: {
  exercises: import('@/hooks/use-exercises').Exercise[]
  muscleGroupMap: Record<string, MuscleGroup>
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  isLoading: boolean
  totalFavorites: number
}) {
  if (!isLoading && totalFavorites === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/6 bg-white/2 p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <DSIcon name="heart" size={28} className="text-red-400" />
        </div>
        <h2 className="text-[16px] font-bold text-white">Nenhum favorito</h2>
        <p className="mt-2 max-w-xs text-[13px] text-zinc-500">
          Toque no coração ❤️ em qualquer exercício para salvá-lo aqui para acesso rápido.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 text-[13px] text-zinc-500">
        {totalFavorites} exercício{totalFavorites !== 1 ? 's' : ''} favoritado{totalFavorites !== 1 ? 's' : ''}
      </p>
      <ExerciseList
        exercises={exercises}
        muscleGroupMap={muscleGroupMap}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        isLoading={isLoading}
      />
    </div>
  )
}

// ============================================
// Exercise List (shared)
// ============================================

function ExerciseList({
  exercises,
  muscleGroupMap,
  isFavorite,
  toggleFavorite,
  isLoading,
}: {
  exercises: import('@/hooks/use-exercises').Exercise[]
  muscleGroupMap: Record<string, MuscleGroup>
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  isLoading: boolean
}) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/3" />
        ))}
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/6 bg-white/2 p-6 text-center">
        <DSIcon name="search" size={24} className="mb-2 text-zinc-600" />
        <p className="text-[13px] text-zinc-500">Nenhum exercício encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {exercises.map((ex) => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          muscleGroup={muscleGroupMap[ex.muscle_group_id]}
          muscleGroupName={muscleGroupMap[ex.muscle_group_id]?.name_pt}
          isFavorite={isFavorite(ex.id)}
          onToggleFavorite={() => toggleFavorite(ex.id)}
          onClick={() => router.push(`/exercicios/detalhe?id=${encodeURIComponent(ex.id)}`)}
        />
      ))}
    </div>
  )
}
