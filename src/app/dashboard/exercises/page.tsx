/**
 * src/app/dashboard/exercises/page.tsx
 *
 * Exercises Library Page — /dashboard/exercises
 *
 * Exports: ExercisesPage
 * Hooks: useState, useMemo, useScrollLock, useMuscleGroups, useExerciseLibrary, useExerciseProgress
 * Features: Auth: useAuthStore · 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Exercises Library Page — /dashboard/exercises
// Grid de grupos musculares + lista de exercícios
// S06-01, S06-02, S06-03, S06-07
// ============================================

'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { useScrollLock } from '@/hooks/use-scroll-lock'
import { Badge } from '@/components/ui/badge'
import { MD3Input } from '@/components/ui/md3-input'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import {
  useMuscleGroups,
  useExerciseLibrary,
  useExerciseProgress,
  type D1MuscleGroup,
  type D1Exercise,
} from '@/hooks/use-workouts'
import { useExerciseMedia } from '@/hooks/use-exercise-media'
import { useFavoriteExercises } from '@/hooks/use-favorite-exercises'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import dynamic from 'next/dynamic'

const ExerciseProgressionChart = dynamic(
  () => import('@/components/workouts/exercise-progression-chart').then(m => m.ExerciseProgressionChart),
  { ssr: false }
)

// ============================================
// Body region colors for muscle group cards
// ============================================
const REGION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  chest: { bg: 'bg-brand-primary/10', border: 'border-brand-primary/20', text: 'text-brand-primary' },
  back: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  shoulders: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  biceps: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  triceps: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' },
  forearms: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  quadriceps: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  hamstrings: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400' },
  glutes: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400' },
  calves: { bg: 'bg-brand-primary/10', border: 'border-brand-primary/20', text: 'text-brand-primary' },
  abs: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
  traps: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  core: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
  'full-body': { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  adductors: { bg: 'bg-lime-500/10', border: 'border-lime-500/20', text: 'text-lime-400' },
  abductors: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', text: 'text-fuchsia-400' },
  obliques: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  'lower-back': { bg: 'bg-stone-500/10', border: 'border-stone-500/20', text: 'text-stone-400' },
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Iniciante', color: 'success' },
  intermediate: { label: 'Intermediário', color: 'warning' },
  advanced: { label: 'Avançado', color: 'error' },
}

const DEFAULT_COLORS = { bg: 'bg-black/5 dark:bg-white/5', border: 'border-black/10 dark:border-white/10', text: 'text-black/70 dark:text-white/70' }

// ============================================
// Main Page
// ============================================
export default function ExercisesPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [selectedExercise, setSelectedExercise] = useState<D1Exercise | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)

  // Lock body scroll when exercise detail modal is open
  useScrollLock(!!selectedExercise)

  const { data: muscleGroups = [], isLoading: groupsLoading } = useMuscleGroups()
  const { data: exercises = [], isLoading: exercisesLoading } = useExerciseLibrary({
    muscle_group_id: selectedGroup || undefined,
    search: search || undefined,
  })

  const { favorites, isFavorite, toggleFavorite, count: favCount } = useFavoriteExercises()

  // Count exercises per group
  const { data: allExercises = [] } = useExerciseLibrary()
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allExercises.forEach(e => {
      counts[e.muscle_group_id] = (counts[e.muscle_group_id] || 0) + 1
    })
    return counts
  }, [allExercises])

  const visibleMuscleGroups = useMemo(() => {
    return muscleGroups
      .filter((g) => !g.parent_id)
      .filter((g) => (groupCounts[g.id] || 0) > 0)
      .sort((a, b) => a.display_order - b.display_order)
  }, [muscleGroups, groupCounts])

  // Filter by difficulty locally
  const filteredExercises = useMemo(() => {
    let result = exercises
    if (difficultyFilter) {
      result = result.filter(e => e.difficulty === difficultyFilter)
    }
    return result
  }, [exercises, difficultyFilter])

  // Favorite exercises list
  const favoriteExercises = useMemo(() => {
    if (!showFavorites || favorites.length === 0) return []
    return allExercises.filter(e => favorites.includes(e.id))
  }, [showFavorites, favorites, allExercises])

  const selectedGroupData = muscleGroups.find(g => g.id === selectedGroup)

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl space-y-6 stagger-children px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {(selectedGroup || showFavorites) && (
            <button
              onClick={() => { setSelectedGroup(null); setShowFavorites(false); setSearch(''); setDifficultyFilter('') }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-bg-secondary text-text-muted transition-colors hover:bg-black/8 dark:hover:bg-white/8 hover:text-text-primary"
            >
              <DSIcon name="arrowLeft" size={20} />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary">
              {showFavorites
                ? 'Favoritos'
                : selectedGroup
                  ? (selectedGroupData?.name_pt || 'Exercícios')
                  : 'Biblioteca de Exercícios'}
            </h1>
            <p className="text-sm text-text-muted">
              {showFavorites
                ? `${favoriteExercises.length} exercício${favoriteExercises.length !== 1 ? 's' : ''} favoritados`
                : selectedGroup
                  ? `${filteredExercises.length} exercício${filteredExercises.length !== 1 ? 's' : ''}`
                  : `${visibleMuscleGroups.length} grupos musculares · ${allExercises.length} exercícios`
              }
            </p>
          </div>
          {/* Favorites toggle button */}
          {!selectedGroup && !showFavorites && (
            <button
              onClick={() => setShowFavorites(true)}
              className={cn(
                'relative flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all',
                favCount > 0
                  ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400 hover:bg-yellow-500/10'
                  : 'border-border-light bg-bg-secondary text-text-muted hover:bg-black/6 dark:hover:bg-white/6'
              )}
            >
              <DSIcon name="star" size={16} className={cn(favCount > 0 && 'fill-yellow-400')} />
              {favCount > 0 && (
                <span className="text-xs font-bold">{favCount}</span>
              )}
            </button>
          )}
        </div>

        {/* Muscle Groups Grid */}
        <AnimatePresence mode="wait">
          {/* Favorites List */}
          {showFavorites && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {favoriteExercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <DSIcon name="star" size={48} className="mb-3 text-text-muted/30" />
                  <p className="font-medium text-text-primary">Nenhum favorito ainda</p>
                  <p className="mt-1 text-sm text-text-muted">
                    Toque no ícone de coração em qualquer exercício para adicioná-lo aqui.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => setShowFavorites(false)}
                    className="mt-4"
                  >
                    Ver Biblioteca
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {favoriteExercises.map((exercise, idx) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      index={idx}
                      onClick={() => setSelectedExercise(exercise)}
                      isFavorite={true}
                      onToggleFavorite={() => toggleFavorite(exercise.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {!showFavorites && !selectedGroup && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {groupsLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <GlassCard key={i} variant="surface" padding="md" className="h-28 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleMuscleGroups.map((group, idx) => (
                    <MuscleGroupCard
                      key={group.id}
                      group={group}
                      count={groupCounts[group.id] || 0}
                      index={idx}
                      onClick={() => setSelectedGroup(group.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Exercise List */}
          {selectedGroup && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Search + filters */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <MD3Input
                    label="Buscar exercícios"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar exercícios..."
                    leadingIcon={<DSIcon name="search" size={16} />}
                    trailingIcon={search ? (
                      <button onClick={() => setSearch('')} className="text-text-muted hover:text-text-primary">
                        <DSIcon name="x" size={16} />
                      </button>
                    ) : undefined}
                  />
                </div>
                <div className="flex gap-2">
                  {['beginner', 'intermediate', 'advanced'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficultyFilter(difficultyFilter === d ? '' : d)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                        difficultyFilter === d
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                          : 'border-border-light bg-bg-secondary text-text-muted hover:bg-black/6 dark:hover:bg-white/6'
                      )}
                    >
                      {DIFFICULTY_LABELS[d].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              {exercisesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <GlassCard key={i} variant="surface" padding="md" className="h-20 animate-pulse" />
                  ))}
                </div>
              ) : filteredExercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <DSIcon name="dumbbell" size={48} className="mb-3 text-text-muted/30" />
                  <p className="font-medium text-text-primary">Nenhum exercício encontrado</p>
                  <p className="mt-1 text-sm text-text-muted">Tente buscar outro termo ou altere os filtros.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredExercises.map((exercise, idx) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      index={idx}
                      onClick={() => setSelectedExercise(exercise)}
                      isFavorite={isFavorite(exercise.id)}
                      onToggleFavorite={() => toggleFavorite(exercise.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise Detail Modal */}
        <AnimatePresence>
          {selectedExercise && (
            <ExerciseDetailModal
              exercise={selectedExercise}
              onClose={() => setSelectedExercise(null)}
              isFavorite={isFavorite(selectedExercise.id)}
              onToggleFavorite={() => toggleFavorite(selectedExercise.id)}
            />
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  )
}

// ============================================
// Muscle Group Card (3D effect)
// ============================================
function MuscleGroupCard({
  group,
  count,
  index,
  onClick,
}: {
  group: D1MuscleGroup
  count: number
  index: number
  onClick: () => void
}) {
  const colors = REGION_COLORS[group.id] || DEFAULT_COLORS

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border p-4 text-center',
        'shadow-[0_4px_0_0_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.04),0_12px_24px_rgba(0,0,0,0.10)]',
        'dark:shadow-[0_4px_0_0_rgba(0,0,0,0.2),0_6px_16px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_0_0_rgba(0,0,0,0.2),0_12px_24px_rgba(0,0,0,0.25)]',
        'transition-all duration-200',
        colors.bg, colors.border,
      )}
    >
      {/* Glass shine overlay */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-linear-to-b from-white/40 to-transparent dark:from-white/10" />

      {/* Icon — Lucide Dumbbell instead of emoji */}
      <div className={cn('relative flex h-10 w-10 items-center justify-center rounded-xl', colors.bg)}>
        <DSIcon name="dumbbell" size={20} className={colors.text} />
      </div>

      {/* Name */}
      <span className={cn('text-sm font-semibold', colors.text)}>
        {group.name_pt}
      </span>

      {/* Count badge */}
      <span className="rounded-full bg-black/8 dark:bg-white/8 px-2 py-0.5 text-[10px] font-medium text-text-muted">
        {count} exercício{count !== 1 ? 's' : ''}
      </span>

      {/* Hover glow */}
      <div className={cn(
        'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
        colors.bg,
      )} />
    </motion.button>
  )
}

// ============================================
// Exercise Card
// ============================================
function ExerciseCard({
  exercise,
  index,
  onClick,
  isFavorite,
  onToggleFavorite,
}: {
  exercise: D1Exercise
  index: number
  onClick: () => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
}) {
  const diffInfo = DIFFICULTY_LABELS[exercise.difficulty] || DIFFICULTY_LABELS.beginner
  const equipment = parseEquipment(exercise.equipment_needed)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.25 }}
      whileHover={{ y: -2 }}
    >
    <GlassCard variant="surface" hover padding="none" className="group relative">
      <div className="flex items-start gap-3 p-4 text-left">
      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
          className={cn(
            'absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all',
            isFavorite
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-transparent text-text-muted/30 opacity-0 group-hover:opacity-100 hover:bg-black/8 dark:hover:bg-white/8 hover:text-red-400'
          )}
        >
          <DSIcon name="heart" size={14} className={cn(isFavorite && 'fill-red-400')} />
        </button>
      )}

      <button onClick={onClick} className="flex flex-1 items-start gap-3 text-left">
        {/* Thumbnail or icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/6 dark:bg-white/6 overflow-hidden">
          {exercise.thumbnail_url ? (
            <img
              src={exercise.thumbnail_url}
              alt={exercise.name_pt}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <DSIcon name="dumbbell" size={20} className="text-text-muted" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary group-hover:text-brand-primary transition-colors">
            {exercise.name_pt}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant={diffInfo.color as 'success' | 'warning' | 'error'} className="text-[10px]">
              {diffInfo.label}
            </Badge>
            {equipment.slice(0, 2).map(eq => (
              <span key={eq} className="rounded bg-black/6 dark:bg-white/6 px-1.5 py-0.5 text-[10px] text-text-muted">
                {eq}
              </span>
            ))}
          </div>
          {exercise.description_pt && (
            <p className="mt-1.5 line-clamp-2 text-xs text-text-muted">
              {exercise.description_pt}
            </p>
          )}
        </div>

        {/* Chevron */}
        <DSIcon name="info" size={16} className="mt-1 shrink-0 text-text-muted/40 group-hover:text-brand-primary transition-colors" />
      </button>
      </div>
    </GlassCard>
    </motion.div>
  )
}

// ============================================
// Exercise Detail Modal (S06-03)
// ============================================
function ExerciseDetailModal({
  exercise,
  onClose,
  isFavorite,
  onToggleFavorite,
}: {
  exercise: D1Exercise
  onClose: () => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
}) {
  const { data: media = [] } = useExerciseMedia(exercise.id)
  const { isStudentView } = useEffectiveUserView()
  const { data: progressData } = useExerciseProgress(exercise.id, 90)
  const diffInfo = DIFFICULTY_LABELS[exercise.difficulty] || DIFFICULTY_LABELS.beginner
  const equipment = parseEquipment(exercise.equipment_needed)
  const colors = REGION_COLORS[exercise.muscle_group_id] || DEFAULT_COLORS

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal — bottom sheet on mobile, centered on desktop */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
      >
        <div className="max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-border-light bg-bg-secondary shadow-2xl sm:rounded-2xl">
          {/* Drag handle mobile */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-black/20 dark:bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between p-5">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-text-primary">{exercise.name_pt}</h2>
              <p className="mt-0.5 text-xs text-text-muted">{exercise.name}</p>
            </div>
            <div className="ml-3 flex items-center gap-1.5">
              {onToggleFavorite && (
                <button
                  onClick={onToggleFavorite}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                    isFavorite
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'text-text-muted hover:bg-black/8 dark:hover:bg-white/8 hover:text-red-400'
                  )}
                >
                  <DSIcon name="heart" size={16} className={cn(isFavorite && 'fill-red-400')} />
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-black/8 dark:hover:bg-white/8 hover:text-text-primary"
              >
                <DSIcon name="x" size={16} />
              </button>
            </div>
          </div>

          {/* Video */}
          {media.length > 0 && media[0].video_url && (
            <div className="px-5 pb-4">
              <video
                src={media[0].video_url}
                poster={media[0].thumbnail_url || undefined}
                controls
                playsInline
                className="w-full rounded-xl bg-black"
                style={{ maxHeight: '240px' }}
              />
              {media[0].setup_notes && (
                <p className="mt-2 text-xs text-text-muted">{media[0].setup_notes}</p>
              )}
            </div>
          )}

          {/* Info badges */}
          <div className="flex flex-wrap gap-2 px-5 pb-4">
            <Badge variant={diffInfo.color as 'success' | 'warning' | 'error'}>
              {diffInfo.label}
            </Badge>
            <Badge className={cn(colors.bg, colors.text, colors.border, 'border')}>
              {REGION_COLORS[exercise.muscle_group_id] ? exercise.muscle_group_id.replace('-', ' ') : exercise.muscle_group_id}
            </Badge>
            {equipment.map(eq => (
              <Badge key={eq} variant="outline">{eq}</Badge>
            ))}
          </div>

          {/* Description */}
          {exercise.description_pt && (
            <div className="px-5 pb-4">
              <h3 className="mb-1.5 text-sm font-semibold text-text-primary">Instruções</h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {exercise.description_pt}
              </p>
            </div>
          )}

          {/* Progression Chart — students only */}
          {isStudentView && (
            <div className="px-5 pb-4">
              <ExerciseProgressionChart exerciseId={exercise.id} />
            </div>
          )}

          {/* Last sessions — S06-06 */}
          {isStudentView && progressData && progressData.points.length > 0 && (
            <div className="px-5 pb-4">
              <h3 className="mb-2 text-sm font-semibold text-text-primary">Últimas Sessões</h3>
              <div className="space-y-1.5">
                {progressData.points.slice(-5).reverse().map((p, i) => (
                  <div
                    key={`${p.date}-${i}`}
                    className="flex items-center justify-between rounded-lg bg-black/5 dark:bg-white/5 px-3 py-2"
                  >
                    <span className="text-xs text-text-muted">
                      {new Date(p.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-text-primary">
                        {p.load > 0 ? `${p.load}kg` : '—'}
                      </span>
                      {p.sets_done != null && (
                        <span className="text-[10px] text-text-muted">
                          {p.sets_done}×{p.reps_done || '?'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional media */}
          {media.length > 1 && (
            <div className="px-5 pb-5">
              <h3 className="mb-2 text-sm font-semibold text-text-primary">Mais vídeos</h3>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {media.slice(1).map(m => (
                  <div key={m.id} className="shrink-0">
                    <video
                      src={m.video_url}
                      poster={m.thumbnail_url || undefined}
                      controls
                      playsInline
                      className="h-32 w-48 rounded-lg bg-black object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom padding for safe area */}
          <div className="h-2 sm:h-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
      </motion.div>
    </>
  )
}

// ============================================
// Helpers
// ============================================
function parseEquipment(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter(Boolean)
  } catch { /* ignore */ }
  return []
}
