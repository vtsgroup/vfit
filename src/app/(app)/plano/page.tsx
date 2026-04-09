/**
 * src/app/(app)/plano/page.tsx
 *
 * MEU PLANO — Tab 1 (🏠)
 * Dashboard principal do aluno com plano de treino ativo.
 * Mostra: header, day tabs, músculo-alvo anatomy cards, exercícios do dia, CTA "Iniciar Treino"
 *
 * Redesign v2 — Estilo BeFit: anatomy muscle images, exercise cards com ícones visuais,
 * config chips (duração, músculos, local), day selector tabs.
 */

'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useCurrentPlan, useSavePlan, useAutoGeneratePlanMutation } from '@/hooks/use-plans'
import type { PlanDay } from '@/hooks/use-plans'
import { useAuthStore } from '@/stores/auth-store'
import { useB2COnboardingCompleted } from '@/hooks/use-b2c-onboarding'
import { useMuscleGroups } from '@/hooks/use-exercises'
import type { MuscleGroup } from '@/hooks/use-exercises'
import { cn } from '@/lib/utils'

// ============================================
// Constants & Helpers
// ============================================

/** Map muscle_group text (from AI) → canonical name for matching */
const MUSCLE_NAME_MAP: Record<string, string> = {
  chest: 'Peito',
  back: 'Costas',
  legs: 'Pernas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  core: 'Abdômen',
  abs: 'Abdômen',
  glutes: 'Glúteos',
  cardio: 'Cardio',
  calves: 'Panturrilha',
  quadriceps: 'Quadríceps',
  hamstrings: 'Posteriores',
  forearms: 'Antebraço',
  traps: 'Trapézio',
}

/** Fallback colors per muscle group */
const MUSCLE_COLORS: Record<string, string> = {
  chest: '#EF4444',
  back: '#3B82F6',
  legs: '#F59E0B',
  shoulders: '#8B5CF6',
  biceps: '#EC4899',
  triceps: '#EC4899',
  core: '#10B981',
  abs: '#10B981',
  glutes: '#F97316',
  cardio: '#EF4444',
  calves: '#F59E0B',
  quadriceps: '#F59E0B',
  hamstrings: '#F59E0B',
}

const LOCATION_LABELS: Record<string, string> = {
  gym: 'Academia',
  home: 'Em Casa',
  outdoor: 'Ar Livre',
  calisthenics: 'Calistenia',
}

const GOAL_LABELS: Record<string, string> = {
  muscle_gain: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  strength: 'Força',
  endurance: 'Resistência',
  flexibility: 'Flexibilidade',
  general_fitness: 'Fitness Geral',
  health: 'Saúde',
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

// ============================================
// Share Plan Button
// ============================================

function SharePlanButton({ planName, totalDays }: { planName: string; totalDays: number }) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const shareText = `💪 Confira meu plano de treino "${planName}" (${totalDays} dias) no VFIT! Junte-se a mim: https://vfit.app.br`

  const handleShare = useCallback(async (type: 'native' | 'whatsapp' | 'copy') => {
    if (type === 'native' && navigator.share) {
      try {
        await navigator.share({ title: `Plano: ${planName}`, text: shareText })
      } catch { /* user cancelled */ }
      setShowMenu(false)
      return
    }
    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
      setShowMenu(false)
      return
    }
    if (type === 'copy') {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setShowMenu(false)
    }
  }, [planName, shareText])

  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-primary bg-bg-secondary text-text-muted hover:text-text-primary transition-all"
        title="Compartilhar plano"
      >
        <DSIcon name="share2" size={18} />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-12 z-50 w-48 rounded-xl glass-card border border-white/10 p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={() => handleShare('native')}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-text-primary hover:bg-white/6 transition-colors"
            >
              <DSIcon name="share2" size={14} className="text-brand-primary" />
              Compartilhar...
            </button>
          )}
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-text-primary hover:bg-white/6 transition-colors"
          >
            <DSIcon name="messageCircle" size={14} className="text-emerald-400" />
            WhatsApp
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-text-primary hover:bg-white/6 transition-colors"
          >
            <DSIcon name={copied ? 'check' : 'copy'} size={14} className={copied ? 'text-emerald-400' : 'text-brand-primary'} />
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// Muscle Group Anatomy Chip — compact image card
// ============================================

function MuscleChip({
  muscleKey,
  muscleGroup,
}: {
  muscleKey: string
  muscleGroup?: MuscleGroup
}) {
  const color = muscleGroup?.color_hex || MUSCLE_COLORS[muscleKey] || '#22C55E'
  const label = muscleGroup?.name_pt || MUSCLE_NAME_MAP[muscleKey] || muscleKey

  return (
    <div
      className="relative flex shrink-0 flex-col items-center gap-1.5 overflow-hidden rounded-2xl border p-3"
      style={{
        backgroundColor: `${color}08`,
        borderColor: `${color}20`,
      }}
    >
      {/* Anatomy image or icon fallback */}
      <div
        className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: `${color}12` }}
      >
        {muscleGroup?.image_url ? (
          <Image
            src={muscleGroup.image_url}
            alt={label}
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        ) : (
          <DSIcon name="activity" size={24} style={{ color }} />
        )}
      </div>
      <span className="text-[11px] font-semibold text-text-primary">{label}</span>
    </div>
  )
}

// ============================================
// Exercise Card — visual with muscle color accent
// ============================================

function ExerciseCard({
  exercise,
  index,
  muscleGroup,
}: {
  exercise: PlanDay['exercises'][number]
  index: number
  muscleGroup?: MuscleGroup
}) {
  const color = muscleGroup?.color_hex || MUSCLE_COLORS[exercise.muscle_group || ''] || '#22C55E'
  const muscleName = muscleGroup?.name_pt || MUSCLE_NAME_MAP[exercise.muscle_group || ''] || exercise.muscle_group

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/6 bg-bg-secondary p-3 transition-all hover:border-white/12">
      {/* Exercise thumbnail / number */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: `${color}15` }}
      >
        {muscleGroup?.image_url ? (
          <Image
            src={muscleGroup.image_url}
            alt={muscleName || ''}
            width={48}
            height={48}
            className="h-full w-full object-cover opacity-70"
          />
        ) : (
          <span className="text-lg font-bold" style={{ color }}>
            {index + 1}
          </span>
        )}
      </div>

      {/* Exercise info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          {exercise.exercise_name || `Exercício ${index + 1}`}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-text-secondary">
          <span>{exercise.sets}×{exercise.reps}</span>
          {exercise.weight_kg ? (
            <>
              <span className="h-0.5 w-0.5 rounded-full bg-text-muted" />
              <span>{exercise.weight_kg}kg</span>
            </>
          ) : null}
          {exercise.rest_seconds ? (
            <>
              <span className="h-0.5 w-0.5 rounded-full bg-text-muted" />
              <span>{exercise.rest_seconds}s descanso</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Badges */}
      <div className="flex shrink-0 flex-col gap-1">
        {exercise.is_warmup && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
            Aquec.
          </span>
        )}
        {exercise.is_superset && (
          <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
            Super
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================
// Main Page
// ============================================

export default function PlanoPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const { data: plan, isLoading, error } = useCurrentPlan()
  const { data: onboardingStatus, isLoading: onboardingLoading } = useB2COnboardingCompleted(isReady)
  const autoGenerate = useAutoGeneratePlanMutation()
  const [activeDay, setActiveDay] = useState(1)
  const savePlan = useSavePlan()
  const hasSavedPending = useRef(false)
  const { data: muscleGroups = [] } = useMuscleGroups()

  // Build lookup: muscle_group key → MuscleGroup object
  const muscleGroupMap = useMemo(() => {
    const map = new Map<string, MuscleGroup>()
    for (const mg of muscleGroups) {
      // Match by name_pt or name (case-insensitive)
      const nameLower = mg.name?.toLowerCase()
      const namePtLower = mg.name_pt?.toLowerCase()
      // Direct matches
      if (nameLower) map.set(nameLower, mg)
      if (namePtLower) map.set(namePtLower, mg)
      // Also map the English keys from MUSCLE_NAME_MAP
      for (const [key, ptName] of Object.entries(MUSCLE_NAME_MAP)) {
        if (ptName.toLowerCase() === namePtLower || key === nameLower) {
          map.set(key, mg)
        }
      }
      // Sub-muscles
      for (const sub of mg.sub_muscles ?? []) {
        if (sub.name?.toLowerCase()) map.set(sub.name.toLowerCase(), sub)
        if (sub.name_pt?.toLowerCase()) map.set(sub.name_pt.toLowerCase(), sub)
      }
    }
    return map
  }, [muscleGroups])

  const handleGeneratePlan = useCallback(async () => {
    if (!onboardingStatus?.completed) {
      router.push('/onboarding')
      return
    }

    try {
      await autoGenerate.mutateAsync()
      queryClient.invalidateQueries({ queryKey: ['plans', 'current'] })
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : ''
      if (message.includes('onboarding') || message.includes('questionário') || message.includes('questionario')) {
        router.push('/onboarding')
      }
    }
  }, [onboardingLoading, onboardingStatus?.completed, router, autoGenerate, queryClient])

  // ─── Auto-save plan from sessionStorage (post-onboarding) ───
  useEffect(() => {
    if (!isReady || isLoading || plan || hasSavedPending.current) return

    const stored = sessionStorage.getItem('vfit_plan')
    if (!stored) return

    try {
      const planData = JSON.parse(stored) as { plan: Record<string, unknown> }
      if (!planData?.plan) return

      hasSavedPending.current = true
      savePlan.mutate(
        { plan: planData.plan },
        {
          onSuccess: () => {
            sessionStorage.removeItem('vfit_plan')
            queryClient.invalidateQueries({ queryKey: ['plans', 'current'] })
          },
          onError: () => {
            hasSavedPending.current = false
          },
        }
      )
    } catch {
      sessionStorage.removeItem('vfit_plan')
    }
  }, [isReady, isLoading, plan, savePlan, queryClient])

  // Dia ativo
  const currentDay: PlanDay | undefined = useMemo(() => {
    if (!plan) return undefined
    return plan.days.find((d) => d.day_number === activeDay) || plan.days[0]
  }, [plan, activeDay])

  // Unique muscle groups for current day
  const dayMuscleKeys = useMemo(() => {
    if (!currentDay) return []
    return [...new Set(currentDay.exercises.map((e) => e.muscle_group).filter(Boolean) as string[])]
  }, [currentDay])

  // Plan settings
  const settings = plan?.settings as { goal?: string; location?: string; level?: string } | undefined

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="mb-6">
          <p className="text-xs font-semibold text-brand-primary">{getGreeting()}</p>
          <h1 className="text-2xl font-black text-text-primary">Meu Plano</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-bg-secondary" />
          ))}
        </div>
      </div>
    )
  }

  // ─── Empty state ───
  if (!plan || error) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="mb-6">
          <p className="text-xs font-semibold text-brand-primary">{getGreeting()}</p>
          <h1 className="text-2xl font-black text-text-primary">Meu Plano</h1>
        </div>
        <div className="glass-card flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/8">
            <DSIcon name="sparkles" size={28} className="text-brand-primary" />
          </div>
          <h2 className="text-base font-bold text-text-primary">Nenhum plano ativo</h2>
          <p className="mt-2 max-w-xs text-sm text-text-secondary">
            Gere seu primeiro plano de treino personalizado com IA em menos de 2 minutos.
          </p>
          <Button
            className="mt-6"
            onClick={handleGeneratePlan}
            loading={autoGenerate.isPending}
          >
            <DSIcon name="sparkles" className="h-4 w-4" />
            Gerar Plano com IA
          </Button>
          {autoGenerate.isError && (
            <p className="mt-3 text-xs text-red-400">
              {autoGenerate.error?.message || 'Erro ao gerar plano'}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg pb-32">
      {/* ─── Header ─── */}
      <div className="px-4 pt-6">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brand-primary">{getGreeting()}</p>
            <h1 className="text-2xl font-black text-text-primary">Meu Plano</h1>
          </div>
          <div className="flex items-center gap-2">
            <SharePlanButton planName={plan.name} totalDays={plan.total_days} />
            <button
              type="button"
              onClick={() => router.push('/plano/ajustes')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-primary bg-bg-secondary text-text-muted hover:text-text-primary transition-all"
            >
              <DSIcon name="settings" size={20} />
            </button>
          </div>
        </div>
        <p className="text-sm text-text-secondary">{plan.name}</p>
      </div>

      {/* ─── Day Tabs (BeFit style) ─── */}
      <div className="mt-5 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {plan.days.map((day) => {
          const isActive = day.day_number === activeDay
          return (
            <button
              key={day.day_number}
              onClick={() => setActiveDay(day.day_number)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 transition-all',
                isActive
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              )}
            >
              <DSIcon name="dumbbell" size={16} className={isActive ? 'text-white' : 'text-text-muted'} />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-medium uppercase leading-tight">Dia</span>
                <span className="text-base font-bold leading-tight">{day.day_number}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* ─── Config Chips (duration, muscles, location) ─── */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
        {currentDay && (
          <div className="flex items-center gap-1.5 rounded-full bg-bg-secondary px-3 py-1.5">
            <DSIcon name="clock" size={14} className="text-text-muted" />
            <span className="text-xs font-medium text-text-secondary">
              {currentDay.estimated_duration_min || 45}min
            </span>
          </div>
        )}
        {dayMuscleKeys.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-bg-secondary px-3 py-1.5">
            <DSIcon name="activity" size={14} className="text-text-muted" />
            <span className="text-xs font-medium text-text-secondary">
              Músculos ({dayMuscleKeys.length})
            </span>
          </div>
        )}
        {settings?.location && (
          <div className="flex items-center gap-1.5 rounded-full bg-bg-secondary px-3 py-1.5">
            <DSIcon name="mapPin" size={14} className="text-text-muted" />
            <span className="text-xs font-medium text-text-secondary">
              {LOCATION_LABELS[settings.location] || settings.location}
            </span>
          </div>
        )}
        {settings?.goal && (
          <div className="flex items-center gap-1.5 rounded-full bg-bg-secondary px-3 py-1.5">
            <DSIcon name="target" size={14} className="text-text-muted" />
            <span className="text-xs font-medium text-text-secondary">
              {GOAL_LABELS[settings.goal] || settings.goal}
            </span>
          </div>
        )}
      </div>

      {/* ─── Streak counter ─── */}
      {plan.current_day > 1 && (
        <div className="mt-3 flex items-center gap-2 px-4">
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1">
            <span className="text-base">🔥</span>
            <span className="text-xs font-bold text-amber-500">{plan.current_day - 1} dias seguidos</span>
          </div>
        </div>
      )}

      {/* ─── Day content ─── */}
      {currentDay && (
        <div className="mt-5 px-4">
          {/* ─── MÚSCULOS ALVO — Anatomy cards ─── */}
          {dayMuscleKeys.length > 0 && (
            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Músculos Alvo
                </h3>
                <span className="text-[11px] text-text-muted">{dayMuscleKeys.length} grupo{dayMuscleKeys.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {dayMuscleKeys.map((key) => (
                  <MuscleChip
                    key={key}
                    muscleKey={key}
                    muscleGroup={muscleGroupMap.get(key.toLowerCase())}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── EXERCÍCIOS — Section header ─── */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {currentDay.exercises.length} Exercício{currentDay.exercises.length !== 1 ? 's' : ''}
            </h3>
            <button
              type="button"
              onClick={() => router.push(`/plano/editar?day=${activeDay}`)}
              className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
            >
              <DSIcon name="pencil" size={12} />
              Editar
            </button>
          </div>

          {/* ─── Exercise Cards ─── */}
          <div className="space-y-2">
            {currentDay.exercises.map((ex, i) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                index={i}
                muscleGroup={muscleGroupMap.get((ex.muscle_group || '').toLowerCase())}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Floating CTA — INICIAR TREINO ─── */}
      <div className="fixed inset-x-0 bottom-20 z-30 px-4">
        <div className="mx-auto max-w-lg">
          <Button
            size="lg"
            className="w-full shadow-2xl shadow-brand-primary/30"
            onClick={() => router.push('/treino-ativo')}
          >
            <DSIcon name="play" className="h-5 w-5" />
            INICIAR TREINO — Dia {activeDay}
          </Button>
        </div>
      </div>
    </div>
  )
}
