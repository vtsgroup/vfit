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
import { useSubscriptionStatus } from '@/hooks/use-vfit-checkout'
import { useAuthStore } from '@/stores/auth-store'
import { useB2COnboardingCompleted } from '@/hooks/use-b2c-onboarding'
import { useExercises, useMuscleGroups } from '@/hooks/use-exercises'
import type { MuscleGroup } from '@/hooks/use-exercises'
import { cn } from '@/lib/utils'
import type { DSIconName } from '@/components/ui/ds-icon'

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

const MUSCLE_STYLES: Record<string, {
  chipBg: string
  chipBorder: string
  iconColor: string
  mutedBg: string
  cardBg: string
  cardBorder: string
  icon: DSIconName
}> = {
  chest: {
    chipBg: 'bg-(--muscle-peito-light)',
    chipBorder: 'border-(--muscle-peito-primary)',
    iconColor: 'text-red-400',
    mutedBg: 'bg-red-500/15',
    cardBg: 'bg-(--muscle-peito-light)',
    cardBorder: 'border-red-500/20',
    icon: 'target',
  },
  back: {
    chipBg: 'bg-(--muscle-costas-light)',
    chipBorder: 'border-(--muscle-costas-primary)',
    iconColor: 'text-blue-400',
    mutedBg: 'bg-blue-500/15',
    cardBg: 'bg-(--muscle-costas-light)',
    cardBorder: 'border-blue-500/20',
    icon: 'activity',
  },
  shoulders: {
    chipBg: 'bg-(--muscle-ombros-light)',
    chipBorder: 'border-(--muscle-ombros-primary)',
    iconColor: 'text-amber-400',
    mutedBg: 'bg-amber-500/15',
    cardBg: 'bg-(--muscle-ombros-light)',
    cardBorder: 'border-amber-500/20',
    icon: 'shield',
  },
  biceps: {
    chipBg: 'bg-(--muscle-biceps-light)',
    chipBorder: 'border-(--muscle-biceps-primary)',
    iconColor: 'text-violet-400',
    mutedBg: 'bg-violet-500/15',
    cardBg: 'bg-(--muscle-biceps-light)',
    cardBorder: 'border-violet-500/20',
    icon: 'dumbbell',
  },
  triceps: {
    chipBg: 'bg-(--muscle-triceps-light)',
    chipBorder: 'border-(--muscle-triceps-primary)',
    iconColor: 'text-pink-400',
    mutedBg: 'bg-pink-500/15',
    cardBg: 'bg-(--muscle-triceps-light)',
    cardBorder: 'border-pink-500/20',
    icon: 'dumbbell',
  },
  legs: {
    chipBg: 'bg-(--muscle-pernas-light)',
    chipBorder: 'border-(--muscle-pernas-primary)',
    iconColor: 'text-emerald-400',
    mutedBg: 'bg-emerald-500/15',
    cardBg: 'bg-(--muscle-pernas-light)',
    cardBorder: 'border-emerald-500/20',
    icon: 'footprints',
  },
  quadriceps: {
    chipBg: 'bg-(--muscle-pernas-light)',
    chipBorder: 'border-(--muscle-pernas-primary)',
    iconColor: 'text-emerald-400',
    mutedBg: 'bg-emerald-500/15',
    cardBg: 'bg-(--muscle-pernas-light)',
    cardBorder: 'border-emerald-500/20',
    icon: 'footprints',
  },
  hamstrings: {
    chipBg: 'bg-(--muscle-pernas-light)',
    chipBorder: 'border-(--muscle-pernas-primary)',
    iconColor: 'text-emerald-400',
    mutedBg: 'bg-emerald-500/15',
    cardBg: 'bg-(--muscle-pernas-light)',
    cardBorder: 'border-emerald-500/20',
    icon: 'footprints',
  },
  calves: {
    chipBg: 'bg-(--muscle-pernas-light)',
    chipBorder: 'border-(--muscle-pernas-primary)',
    iconColor: 'text-emerald-400',
    mutedBg: 'bg-emerald-500/15',
    cardBg: 'bg-(--muscle-pernas-light)',
    cardBorder: 'border-emerald-500/20',
    icon: 'footprints',
  },
  core: {
    chipBg: 'bg-(--muscle-abdomen-light)',
    chipBorder: 'border-(--muscle-abdomen-primary)',
    iconColor: 'text-cyan-400',
    mutedBg: 'bg-cyan-500/15',
    cardBg: 'bg-(--muscle-abdomen-light)',
    cardBorder: 'border-cyan-500/20',
    icon: 'shieldCheck',
  },
  abs: {
    chipBg: 'bg-(--muscle-abdomen-light)',
    chipBorder: 'border-(--muscle-abdomen-primary)',
    iconColor: 'text-cyan-400',
    mutedBg: 'bg-cyan-500/15',
    cardBg: 'bg-(--muscle-abdomen-light)',
    cardBorder: 'border-cyan-500/20',
    icon: 'shieldCheck',
  },
  glutes: {
    chipBg: 'bg-(--muscle-gluteos-light)',
    chipBorder: 'border-(--muscle-gluteos-primary)',
    iconColor: 'text-fuchsia-400',
    mutedBg: 'bg-fuchsia-500/15',
    cardBg: 'bg-(--muscle-gluteos-light)',
    cardBorder: 'border-fuchsia-500/20',
    icon: 'award',
  },
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

function getMotivationalPhrase(): string {
  const phrases = [
    'Consistência vence motivação: 1% melhor hoje.',
    'Seu próximo treino já está pronto. Bora pra cima!',
    'Cada série conta. Seu futuro agradece.',
    'Foco no processo. Resultado é consequência.',
  ]
  const daySeed = new Date().getDate() % phrases.length
  return phrases[daySeed]
}

function normalizeText(value?: string | null) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function getMuscleImageUrl(muscleGroup?: MuscleGroup) {
  return muscleGroup?.image_female_url || muscleGroup?.image_male_url || muscleGroup?.image_url || null
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
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/8 text-white/72 transition-all hover:bg-white/12 hover:text-white"
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
  href,
}: {
  muscleKey: string
  muscleGroup?: MuscleGroup
  href?: string
}) {
  const tone = MUSCLE_STYLES[muscleKey] || MUSCLE_STYLES.chest
  const label = muscleGroup?.name_pt || MUSCLE_NAME_MAP[muscleKey] || muscleKey

  const content = (
    <>
      {/* Anatomy image or icon fallback */}
      <div className={cn('relative flex h-15 w-15 items-center justify-center overflow-hidden rounded-[18px] border border-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]', tone.mutedBg)}>
        <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white/70" aria-hidden="true" />
        {getMuscleImageUrl(muscleGroup) ? (
          <Image
            src={getMuscleImageUrl(muscleGroup) as string}
            alt={label}
            width={56}
            height={56}
            className="h-full w-full object-cover saturate-125"
          />
        ) : (
          <DSIcon name={tone.icon} size={24} className={tone.iconColor} />
        )}
      </div>
      <span className="max-w-20 truncate text-[11px] font-black text-slate-800">{label}</span>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          'relative z-10 flex shrink-0 cursor-pointer flex-col items-center gap-2 overflow-hidden rounded-[22px] border p-3 text-center shadow-[0_16px_34px_-30px_rgba(15,23,42,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-32px_rgba(15,23,42,0.82)]',
          tone.chipBg,
          tone.chipBorder
        )}
      >
        {content}
      </a>
    )
  }

  return (
    <div
      className={cn(
        'relative flex shrink-0 flex-col items-center gap-2 overflow-hidden rounded-[22px] border p-3 text-center shadow-[0_16px_34px_-30px_rgba(15,23,42,0.75)]',
        tone.chipBg,
        tone.chipBorder
      )}
    >
      {content}
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
  href,
}: {
  exercise: PlanDay['exercises'][number]
  index: number
  muscleGroup?: MuscleGroup
  href?: string
}) {
  const tone = MUSCLE_STYLES[exercise.muscle_group || ''] || MUSCLE_STYLES.chest
  const muscleName = muscleGroup?.name_pt || MUSCLE_NAME_MAP[exercise.muscle_group || ''] || exercise.muscle_group
  const setLabel = `${exercise.sets}x${exercise.reps}`

  const content = (
    <>
      {/* Exercise thumbnail / number */}
      <div className="relative flex h-16 w-14 shrink-0 flex-col items-center justify-center overflow-hidden rounded-[19px] border border-slate-900/5 bg-slate-950 text-white shadow-[0_5px_0_0_#0f172a,0_16px_28px_-24px_rgba(2,6,23,0.9)]">
        <span className="text-[9px] font-black uppercase text-white/38">Ex</span>
        <span className="text-2xl font-black leading-none tabular-nums">{index + 1}</span>
      </div>

      <div className={cn('relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-white shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]', tone.mutedBg)}>
        {getMuscleImageUrl(muscleGroup) ? (
          <Image
            src={getMuscleImageUrl(muscleGroup) as string}
            alt={muscleName || ''}
            width={48}
            height={48}
            className="h-full w-full object-cover opacity-85 saturate-125"
          />
        ) : (
          <DSIcon name={tone.icon} size={22} className={tone.iconColor} />
        )}
      </div>

      {/* Exercise info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-black leading-tight text-slate-950">
          {exercise.exercise_name || `Exercício ${index + 1}`}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{setLabel}</span>
          {exercise.weight_kg ? (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{exercise.weight_kg}kg</span>
          ) : null}
          {exercise.rest_seconds ? (
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-700">{exercise.rest_seconds}s</span>
          ) : null}
        </div>
        {muscleName && <p className="mt-1.5 truncate text-[11px] font-semibold text-slate-400">{muscleName}</p>}
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
      {href && <DSIcon name="chevronRight" size={16} className="shrink-0 text-slate-300" />}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          'relative z-10 flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left shadow-[0_20px_48px_-42px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_54px_-42px_rgba(15,23,42,0.98)]',
          tone.cardBg,
          tone.cardBorder
        )}
      >
        <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/80" aria-hidden="true" />
        {content}
      </a>
    )
  }

  return (
    <div className={cn('relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left shadow-[0_20px_48px_-42px_rgba(15,23,42,0.9)]', tone.cardBg, tone.cardBorder)}>
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/80" aria-hidden="true" />
      {content}
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
  const { data: subscriptionStatus } = useSubscriptionStatus()
  const autoGenerate = useAutoGeneratePlanMutation()
  const [activeDay, setActiveDay] = useState(1)
  const savePlan = useSavePlan()
  const hasSavedPending = useRef(false)
  const { data: muscleGroups = [] } = useMuscleGroups()
  const { data: exerciseCatalog } = useExercises({ per_page: 300 })
  const isPremium = subscriptionStatus?.is_premium ?? false

  // Check if active day was already completed today (same-day blocking — T1.5-T1.8)
  const isDayCompletedToday = useMemo(() => {
    if (!plan) return false
    const today = new Date().toISOString().slice(0, 10)
    const key = `vfit_day_completed_${plan.id}_${activeDay}`
    try {
      return localStorage.getItem(key) === today
    } catch {
      return false
    }
  }, [plan, activeDay])

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

  const exerciseIdByName = useMemo(() => {
    const map = new Map<string, string>()
    for (const ex of exerciseCatalog?.exercises ?? []) {
      map.set(normalizeText(ex.name_pt), ex.id)
      map.set(normalizeText(ex.name), ex.id)
    }
    return map
  }, [exerciseCatalog?.exercises])

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
  const completedPlanDays = plan ? Math.max(0, Math.min(plan.current_day - 1, plan.total_days)) : 0
  const planProgressPercent = plan?.total_days ? Math.round((completedPlanDays / plan.total_days) * 100) : 0
  const dayExerciseCount = currentDay?.exercises.length || 0
  const daySetCount = currentDay?.exercises.reduce((sum, exercise) => sum + exercise.sets, 0) || 0
  const dayIntensityLabel = daySetCount >= 18 ? 'Alta' : daySetCount >= 12 ? 'Media' : 'Leve'

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
    <div className="relative mx-auto min-h-dvh max-w-lg overflow-hidden bg-linear-to-b from-slate-50 via-white to-emerald-50/40 pb-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-80"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
        }}
      />
      {/* ─── Header ─── */}
      <div className="relative px-4 pt-4">
        <div className="relative mb-4 overflow-hidden rounded-[32px] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-[0_32px_90px_-38px_rgba(2,6,23,0.98)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(circle at 18% 12%, rgba(110,231,183,0.28) 0%, transparent 34%), radial-gradient(circle at 88% 0%, rgba(56,189,248,0.18) 0%, transparent 36%), linear-gradient(135deg, rgba(34,197,94,0.18) 0%, transparent 38%), linear-gradient(315deg, rgba(245,158,11,0.12) 0%, transparent 34%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-45"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              maskImage: 'linear-gradient(to bottom, black, transparent 70%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 70%)',
            }}
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200 shadow-glass-inset-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.85)]" />
                {getGreeting()}
              </div>
              <h1 className="text-[44px] font-black leading-none text-white">Meu Plano</h1>
              <p className="mt-3 max-w-64 text-sm font-semibold leading-relaxed text-emerald-50/74">{getMotivationalPhrase()}</p>
            </div>
            <div className="flex items-center gap-2">
              <SharePlanButton planName={plan.name} totalDays={plan.total_days} />
              <button
                type="button"
                onClick={() => router.push('/plano/ajustes')}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white"
              >
                <DSIcon name="settings" size={20} />
              </button>
            </div>
          </div>
          <div className="relative mt-6 grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-white/12 bg-white/8 p-3 shadow-glass-inset-sm backdrop-blur-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">Treino selecionado</p>
              <p className="mt-1 truncate text-base font-black text-white">Dia {activeDay} — {currentDay?.name || plan.name}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full border border-white/8 bg-white/12">
                <div className="h-full rounded-full bg-linear-to-r from-emerald-300 via-lime-300 to-amber-200 transition-all duration-500" style={{ width: `${planProgressPercent}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-slate-950/42 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-200">{planProgressPercent}% plano</span>
                <span className="rounded-full bg-emerald-300/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-100">{daySetCount} sets</span>
              </div>
            </div>
            <div className="relative flex h-23 w-23 flex-col items-center justify-center overflow-hidden rounded-2xl border border-emerald-300/22 bg-emerald-300/12 text-center shadow-[0_16px_34px_-26px_rgba(16,185,129,0.65),inset_0_1px_0_rgba(255,255,255,0.16)]">
              <span className="absolute inset-x-3 top-0 h-px bg-emerald-100/70" aria-hidden="true" />
              <span className="text-[10px] font-black uppercase text-emerald-100/70">Dia</span>
              <span className="text-3xl font-black leading-none text-white">{activeDay}</span>
              <span className="mt-1 text-[10px] font-bold text-emerald-100/60">{dayExerciseCount} ex.</span>
            </div>
          </div>
          <div className="relative mt-3 grid grid-cols-3 gap-2">
            {[
              ['Intensidade', dayIntensityLabel],
              ['Local', settings?.location ? (LOCATION_LABELS[settings.location] || settings.location) : 'Livre'],
              ['Meta', settings?.goal ? (GOAL_LABELS[settings.goal] || settings.goal) : 'VFIT'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[18px] border border-white/8 bg-slate-950/38 px-2.5 py-2 shadow-glass-inset-sm">
                <p className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-white/34">{label}</p>
                <p className="mt-0.5 truncate text-[11px] font-black text-white/88">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Day Tabs (BeFit style) ─── */}
      <div className="mt-5 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {plan.days.map((day) => {
          const isActive = day.day_number === activeDay
          const today = new Date().toISOString().slice(0, 10)
          let completedToday = false
          try { completedToday = localStorage.getItem(`vfit_day_completed_${plan.id}_${day.day_number}`) === today } catch { /* noop */ }
          return (
            <button
              key={day.day_number}
              onClick={() => {
                setActiveDay(day.day_number)
              }}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 transition-all duration-300',
                isActive
                  ? 'border border-emerald-900/40 bg-linear-to-b from-emerald-300 via-brand-primary to-emerald-700 text-white shadow-[0_5px_0_0_#064e3b,0_16px_30px_-18px_rgba(6,95,70,0.9)]'
                  : completedToday
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 shadow-[0_12px_28px_-24px_rgba(4,120,87,0.55)]'
                  : 'border border-slate-200 bg-white text-slate-500 shadow-[0_14px_28px_-26px_rgba(15,23,42,0.6)] hover:bg-slate-50'
              )}
            >
              <DSIcon
                name={completedToday ? 'checkCircle' : 'dumbbell'}
                size={16}
                className={isActive ? 'text-white' : completedToday ? 'text-emerald-500' : 'text-text-muted'}
              />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-medium uppercase leading-tight">{completedToday && !isActive ? 'Feito' : 'Dia'}</span>
                <span className="text-base font-bold leading-tight">{day.day_number}</span>
              </div>
            </button>
          )
        })}
      </div>

      {isDayCompletedToday && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-emerald-500/22 bg-emerald-500/8 px-4 py-3 text-emerald-700 shadow-[0_14px_34px_-26px_rgba(4,120,87,0.55)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-[0_4px_0_0_#047857]">
            <DSIcon name="check" size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-emerald-800">Dia {activeDay} concluído</p>
            <p className="text-xs font-medium text-emerald-700/75">Escolha outro dia ou revise os exercícios abaixo.</p>
          </div>
        </div>
      )}

      {/* ─── Próximos treinos ─── */}
      <div className="mt-2 px-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Roteiro da semana</h3>
          <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-200">{completedPlanDays}/{plan.total_days}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {plan.days.slice(0, 5).map((day) => {
            const isActive = day.day_number === activeDay
            return (
              <button
                key={`next-${day.day_number}`}
                type="button"
                onClick={() => setActiveDay(day.day_number)}
                className={cn(
                  'min-w-42 rounded-2xl border px-3 py-3 text-left transition-all',
                  isActive
                    ? 'border-slate-900 bg-slate-950 text-white shadow-[0_20px_42px_-30px_rgba(2,6,23,0.95)]'
                    : 'border-slate-200 bg-white text-slate-700 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.58)]'
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={cn('text-[10px] font-black uppercase tracking-[0.14em]', isActive ? 'text-emerald-200' : 'text-slate-400')}>Dia {day.day_number}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', isActive ? 'bg-emerald-300/16 text-emerald-100' : 'bg-emerald-500/8 text-emerald-700')}>Liberado</span>
                </div>
                <p className={cn('truncate text-sm font-black', isActive ? 'text-white' : 'text-slate-900')}>{day.name}</p>
                <p className={cn('mt-0.5 text-xs font-medium', isActive ? 'text-white/58' : 'text-slate-500')}>{day.exercises.length} exercício{day.exercises.length !== 1 ? 's' : ''}</p>
              </button>
            )
          })}
        </div>
        {!isPremium && (
          <p className="mt-2 text-xs text-text-secondary">
            Plano grátis: todos os dias do plano atual estão liberados. Faça upgrade para gerar novos planos e liberar recursos premium.
          </p>
        )}
      </div>

      {/* ─── Config Chips (duration, muscles, location) ─── */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
        {currentDay && (
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.58)]">
            <DSIcon name="clock" size={14} className="text-text-muted" />
            <span className="text-xs font-medium text-text-secondary">
              {currentDay.estimated_duration_min || 45}min
            </span>
          </div>
        )}
        {dayMuscleKeys.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.58)]">
            <DSIcon name="activity" size={14} className="text-text-muted" />
            <span className="text-xs font-medium text-text-secondary">
              Músculos ({dayMuscleKeys.length})
            </span>
          </div>
        )}
        {settings?.location && (
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.58)]">
            <DSIcon name="mapPin" size={14} className="text-text-muted" />
            <span className="text-xs font-medium text-text-secondary">
              {LOCATION_LABELS[settings.location] || settings.location}
            </span>
          </div>
        )}
        {settings?.goal && (
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.58)]">
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
            <DSIcon name="flame" size={14} className="text-amber-500" />
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
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
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
                    href={`/musculos/detalhe?muscle=${encodeURIComponent(key)}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── EXERCÍCIOS — Section header ─── */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
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
              (() => {
                const byId = ex.exercise_id
                const byName = exerciseIdByName.get(normalizeText(ex.exercise_name || ''))
                const resolvedId = byId || byName
                const href = resolvedId
                  ? `/exercicios/detalhe?id=${encodeURIComponent(resolvedId)}`
                  : `/exercicios?q=${encodeURIComponent(ex.exercise_name || ex.muscle_group || 'exercicio')}`

                return (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                index={i}
                muscleGroup={muscleGroupMap.get((ex.muscle_group || '').toLowerCase())}
                href={href}
              />
                )
              })()
            ))}
          </div>
        </div>
      )}

      {/* ─── Floating CTA — INICIAR TREINO ─── */}
      {!isDayCompletedToday && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 px-4">
          <div className="mx-auto max-w-lg">
            <Button
              size="lg"
              className="pointer-events-auto w-full shadow-[0_9px_0_0_#064e3b,0_28px_54px_-28px_rgba(6,78,59,0.98),0_0_0_1px_rgba(255,255,255,0.18)_inset]"
              onClick={() => router.push(`/treino-ativo?day=${activeDay}`)}
            >
              <DSIcon name="play" className="h-5 w-5" />
              {`Iniciar treino — Dia ${activeDay}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
