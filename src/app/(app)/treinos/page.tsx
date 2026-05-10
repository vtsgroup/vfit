/**
 * src/app/(app)/treinos/page.tsx
 *
 * Sprint 30 — Tab Treinos: Dashboard B2C + Explorar & Templates
 * T7.3: Card "Treino de Hoje" — lê plano ativo (useCurrentPlan)
 * T7.4: Mini KPIs — dia atual, progresso do plano
 * T7.5: Progress ring do plano
 * T7.6: Card nutrição resumo (useMealsToday + useNutritionTargets)
 */

'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useWorkoutTemplates,
  getDifficultyLabel,
  getDifficultyColor,
} from '@/hooks/use-workout-templates'
import { hapticLight } from '@/lib/haptics'
import { useCurrentPlan, useAutoGeneratePlan, type CurrentPlan, type PlanDay } from '@/hooks/use-plans'
import { useMealsToday, useNutritionTargets } from '@/hooks/use-vfit-nutrition'
import { useSelfAssessments, getBMIColor, useAutoAssessmentFromOnboarding } from '@/hooks/use-self-assessments'
import { useWorkoutLogs } from '@/hooks/use-workouts'
import { useDailyGoal, useStreak, useXPBalance, type DailyGoalResponse, type StreakResponse, type XPBalance } from '@/hooks/use-xp'
import { useSubscriptionStatus } from '@/hooks/use-vfit-checkout'
import { useB2COnboardingCompleted } from '@/hooks/use-b2c-onboarding'
import { useStudentProfile, useLinkPersonalTrainer } from '@/hooks/use-student-app'
import { useExercises, useMuscleGroups, type Exercise } from '@/hooks/use-exercises'
import { useAuthStore } from '@/stores/auth-store'

const DIFFICULTY_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
]

const FITNESS_STORE_PRODUCTS: Array<{
  name: string
  subtitle: string
  price: string
  tag: string
  icon: DSIconName
  accent: string
}> = [
  {
    name: 'Whey Protein 900g',
    subtitle: 'Proteína para bater sua meta diária',
    price: 'R$ 119,90',
    tag: 'Mais vendido',
    icon: 'flask',
    accent: 'from-emerald-400 to-teal-500',
  },
  {
    name: 'Creatina 300g',
    subtitle: 'Força e performance no treino de hoje',
    price: 'R$ 79,90',
    tag: 'Performance',
    icon: 'zap',
    accent: 'from-sky-400 to-cyan-500',
  },
  {
    name: 'Pré-treino VFIT',
    subtitle: 'Energia limpa antes da primeira série',
    price: 'R$ 94,90',
    tag: 'Treino',
    icon: 'flame',
    accent: 'from-amber-400 to-orange-500',
  },
]

// Tradução de IDs de grupos musculares para português
const MUSCLE_PT: Record<string, string> = {
  chest: 'Peito', back: 'Costas', shoulders: 'Ombros', biceps: 'Bíceps',
  triceps: 'Tríceps', legs: 'Pernas', quadriceps: 'Quadríceps', hamstrings: 'Isquiotibiais',
  glutes: 'Glúteos', calves: 'Panturrilhas', abs: 'Abdômen', core: 'Core',
  forearms: 'Antebraços', traps: 'Trapézio', full_body: 'Corpo Total',
  lats: 'Dorsais', rhomboids: 'Romboides', lower_back: 'Lombar',
  hip_flexors: 'Flexores do Quadril', adductors: 'Adutores',
}
function musclePt(name: string) {
  return MUSCLE_PT[name.toLowerCase()] || MUSCLE_PT[name.toLowerCase().replace(/ /g, '_')] || name
}

function getUrgencyState(streak: StreakResponse | null): {
  workedOutToday: boolean
  daysSince: number
  urgencyLevel: 'done' | 'normal' | 'warning' | 'critical'
  urgencyText: string
  streakIcon: DSIconName
} {
  if (!streak?.last_activity_date) {
    return { workedOutToday: false, daysSince: -1, urgencyLevel: 'normal', urgencyText: 'Comece hoje!', streakIcon: 'dumbbell' }
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last = new Date(streak.last_activity_date)
  last.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  const workedOutToday = diffDays === 0

  if (workedOutToday) {
    return { workedOutToday: true, daysSince: 0, urgencyLevel: 'done', urgencyText: 'Treino feito hoje!', streakIcon: 'flame' }
  } else if (diffDays === 1) {
    const level = streak.current_streak >= 3 ? 'warning' : 'normal'
    return { workedOutToday: false, daysSince: 1, urgencyLevel: level, urgencyText: streak.current_streak >= 3 ? `Não quebre ${streak.current_streak} dias de streak!` : 'Treine hoje para começar um streak!', streakIcon: 'zap' }
  } else if (diffDays === 2) {
    return { workedOutToday: false, daysSince: 2, urgencyLevel: 'warning', urgencyText: `2 dias sem treinar — volte agora!`, streakIcon: 'alertTriangle' }
  } else {
    return { workedOutToday: false, daysSince: diffDays, urgencyLevel: 'critical', urgencyText: `${diffDays} dias parado — hora de voltar!`, streakIcon: 'alertCircle' }
  }
}

function FirstWinCommandCenter({
  userName,
  todayDay,
  plan,
  planPct,
  totals,
  targets,
  streak,
  xpBalance,
  dailyGoal,
  workoutCount,
}: {
  userName?: string
  todayDay: PlanDay | null
  plan: CurrentPlan | null | undefined
  planPct: number
  totals: { calories: number; protein: number; carbs: number; fat: number }
  targets: { calories: number; protein: number; carbs: number; fat: number }
  streak: StreakResponse | undefined
  xpBalance: XPBalance | undefined
  dailyGoal: DailyGoalResponse | undefined
  workoutCount: number
}) {
  const urgency = getUrgencyState(streak ?? null)
  const firstName = userName?.split(' ')[0] || 'atleta'
  const dailyProgress = Math.round((dailyGoal?.progress ?? 0) * 100)
  const proteinPct = targets.protein > 0 ? Math.min(100, Math.round((totals.protein / targets.protein) * 100)) : 0
  const caloriesPct = targets.calories > 0 ? Math.min(100, Math.round((totals.calories / targets.calories) * 100)) : 0
  const duration = todayDay?.estimated_duration_min ?? 0

  return (
    <section className="vfit-app-hero-gradient -mx-4 mb-4 overflow-hidden rounded-b-[28px] border-b border-white/8 text-white">
      <div className="relative px-4 pt-4 pb-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-18 bg-linear-to-b from-[#0b1d36] via-[#0b1d36]/82 to-transparent" />
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-[#0b1d36]/95 to-transparent" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{ background: 'linear-gradient(to top, #050A12 0%, rgba(5,10,18,0.78) 42%, transparent 100%)' }}
        />
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-12 bg-linear-to-t from-emerald-300/10 via-sky-300/6 to-transparent blur-xl" />
        <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-300/30 to-transparent" />

        <div className="relative z-10 mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-300/90">
              Primeira vitória do dia
            </p>
            <h1 className="mt-1 bg-linear-to-r from-white via-emerald-100 to-vfit-primary-300 bg-clip-text text-[34px] font-black leading-[0.94] text-transparent">
              Bora, {firstName}
            </h1>
            <p className="mt-1.5 max-w-62.5 text-[12px] leading-snug text-slate-300">
              Foco no treino de hoje. O resto entra no ritmo depois.
            </p>
          </div>
          <Link href="/progresso/streaks" className="shrink-0 rounded-card-lg border border-white/12 bg-white/7 px-3 py-2 text-right shadow-glass-inset-sm backdrop-blur active:scale-95">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Streak</p>
            <p className="mt-0.5 text-display-heading font-black leading-none text-amber-300">{streak?.current_streak ?? 0}d</p>
          </Link>
        </div>

        <div className="relative z-10 overflow-hidden rounded-[26px] border border-white/12 bg-white/7 p-3 shadow-[0_18px_46px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white/45 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-brand-primary/10 to-transparent" />
          {todayDay ? (
            <>
              <div className="relative mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-primary/24 bg-brand-primary/12 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-primary shadow-glass-inset-sm">
                    <DSIcon name={urgency.streakIcon} size={12} />
                    Dia {plan?.current_day ?? 1} de {plan?.total_days ?? todayDay.day_number}
                  </div>
                  <h2 className="max-w-62.5 text-[23px] font-black leading-none text-white">{todayDay.name}</h2>
                  <p className="mt-1.5 text-[12px] font-medium text-slate-300">
                    {todayDay.muscle_groups.slice(0, 3).map(musclePt).join(' · ') || 'Treino personalizado'}
                  </p>
                </div>
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] border border-white/8 bg-slate-950/66 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div
                    className="absolute inset-1 rounded-[15px]"
                    style={{ background: `conic-gradient(from 210deg, rgba(34,197,94,0.92) ${Math.min(100, Math.max(8, duration))}%, rgba(255,255,255,0.08) 0)` }}
                  />
                  <div className="relative flex h-14 w-14 flex-col items-center justify-center rounded-[15px] bg-slate-950">
                    <p className="text-display-heading font-black leading-none text-white">{todayDay.estimated_duration_min}</p>
                    <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">min</p>
                  </div>
                </div>
              </div>

              <div className="relative mb-3 grid grid-cols-3 gap-2">
                <MetricTile label="Plano" value={`${planPct}%`} progress={Math.min(100, planPct)} tone="green" />
                <MetricTile label="Meta" value={`${dailyProgress}%`} progress={Math.min(100, dailyProgress)} tone="blue" />
                <MetricTile label="XP" value={String(xpBalance?.balance ?? 0)} progress={Math.min(100, (xpBalance?.balance ?? 0) % 100)} tone="amber" />
              </div>

              <Link href="/plano" onClick={() => hapticLight()}>
                <Button
                  size="md"
                  className="h-11 w-full justify-center gap-2 rounded-[13px] border-t-emerald-300/45 border-x-emerald-500/28 border-b-zinc-700/82 px-5 text-[15px] font-semibold tracking-tight shadow-[0_4px_0_0_#52525b,0_12px_24px_-14px_rgba(15,23,42,0.75),inset_0_1px_0_rgba(255,255,255,0.22)] hover:-translate-y-px hover:shadow-[0_5px_0_0_#52525b,0_14px_28px_-14px_rgba(15,23,42,0.78),inset_0_1px_0_rgba(255,255,255,0.28)] active:translate-y-0.5 active:shadow-[0_1px_0_0_#52525b,0_4px_10px_-8px_rgba(15,23,42,0.62),inset_0_2px_5px_rgba(0,0,0,0.18)]"
                >
                  <DSIcon name="play" size={18} />
                  {urgency.workedOutToday ? 'Rever treino de hoje' : 'Começar treino de hoje'}
                </Button>
              </Link>
            </>
          ) : (
            <div className="py-2">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/12">
                <DSIcon name="sparkles" size={22} className="text-brand-primary" />
              </div>
              <h2 className="text-xl font-black text-white">Seu plano está nascendo</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-300">
                Gere um plano com IA a partir do seu objetivo e transforme a tela inicial em treino executável.
              </p>
              <Link href="/plano" className="mt-4 block">
                <Button size="lg" className="w-full justify-center">
                  <DSIcon name="sparkles" size={18} />
                  Gerar plano com IA
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="relative z-10 mt-2 grid grid-cols-2 gap-2">
          <Link href="/nutricao" className="rounded-[18px] border border-white/10 bg-white/7 p-2.5 shadow-glass-inset-sm backdrop-blur active:scale-[0.98]">
            <div className="mb-1.5 flex items-center justify-between">
              <DSIcon name="flask" size={15} className="text-emerald-300" />
              <span className="text-[10px] font-bold text-slate-400">{proteinPct}%</span>
            </div>
            <p className="text-[12px] font-bold text-white">Proteína</p>
            <p className="mt-0.5 text-[10px] text-slate-400">{Math.round(totals.protein)}g de {targets.protein}g</p>
          </Link>
          <Link href="/plano" className="rounded-[18px] border border-white/10 bg-white/7 p-2.5 shadow-glass-inset-sm backdrop-blur active:scale-[0.98]">
            <div className="mb-1.5 flex items-center justify-between">
              <DSIcon name="shoppingBag" size={15} className="text-brand-primary" />
              <span className="text-[10px] font-bold text-slate-400">Próximo</span>
            </div>
            <p className="text-[12px] font-bold text-white">Evoluir plano</p>
            <p className="mt-0.5 text-[10px] text-slate-400">{workoutCount > 0 ? `${workoutCount} treinos no histórico` : `${caloriesPct}% da meta calórica`}</p>
          </Link>
        </div>
      </div>
    </section>
  )
}

function MetricTile({ label, value, progress, tone }: { label: string; value: string; progress: number; tone: 'green' | 'blue' | 'amber' }) {
  const toneClasses = {
    green: { text: 'text-brand-primary', bar: 'from-brand-primary to-emerald-300' },
    blue: { text: 'text-sky-300', bar: 'from-sky-400 to-cyan-300' },
    amber: { text: 'text-amber-300', bar: 'from-amber-400 to-orange-300' },
  }[tone]

  return (
    <div className="rounded-[16px] border border-white/9 bg-slate-950/48 p-2 shadow-glass-inset-sm">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={cn('mt-1 text-[18px] font-black leading-none', toneClasses.text)}>{value}</p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className={cn('h-full rounded-full bg-linear-to-r transition-all duration-700', toneClasses.bar)}
          style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  )
}

function buildPlaceholderImage(label: string, tone: 'green' | 'blue' | 'orange' | 'violet' = 'green') {
  const safe = (label || 'Exercício').slice(0, 18)
  const palettes: Record<typeof tone, { bg1: string; bg2: string; fg: string }> = {
    green: { bg1: '#0f2a1b', bg2: '#1f8f57', fg: '#d1fae5' },
    blue: { bg1: '#0f1f33', bg2: '#2f74c0', fg: '#dbeafe' },
    orange: { bg1: '#2b1b0f', bg2: '#d97706', fg: '#ffedd5' },
    violet: { bg1: '#1e1433', bg2: '#7c3aed', fg: '#ede9fe' },
  }
  const p = palettes[tone]
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='${p.bg1}'/><stop offset='100%' stop-color='${p.bg2}'/></linearGradient></defs><rect width='320' height='180' fill='url(#g)' rx='18'/><circle cx='46' cy='44' r='20' fill='rgba(255,255,255,0.16)'/><rect x='24' y='132' width='272' height='12' rx='6' fill='rgba(255,255,255,0.16)'/><text x='24' y='108' fill='${p.fg}' font-family='Inter,Arial,sans-serif' font-size='20' font-weight='700'>${safe}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function toneByMuscle(muscle?: string | null): 'green' | 'blue' | 'orange' | 'violet' {
  const v = (muscle || '').toLowerCase()
  if (v.includes('peito') || v.includes('ombro') || v.includes('costa')) return 'blue'
  if (v.includes('perna') || v.includes('coxa') || v.includes('glúteo') || v.includes('panturr')) return 'orange'
  if (v.includes('bíceps') || v.includes('tríceps') || v.includes('braço')) return 'violet'
  return 'green'
}

function normalizeText(value?: string | null) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function getMuscleImageUrl(
  mg?: {
  image_female_url?: string | null
  image_male_url?: string | null
  image_url?: string | null
} | null,
  isSuperAdmin = false
) {
  if (isSuperAdmin) {
    return mg?.image_male_url || mg?.image_url || mg?.image_female_url || null
  }
  return mg?.image_female_url || mg?.image_male_url || mg?.image_url || null
}

export default function TreinosPage() {
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = user?.role === 'super_admin'

  const [difficulty, setDifficulty] = useState('')
  const { data: templates, isLoading } = useWorkoutTemplates(
    difficulty ? { difficulty } : undefined
  )
  const { data: muscleGroups = [] } = useMuscleGroups()
  const { data: exerciseCatalog } = useExercises({ per_page: 200 })

  // T7.3-T7.5 — Current plan data
  const { data: plan, isError: planError, isFetched: planFetched } = useCurrentPlan()

  // T7.6 — Nutrition today
  const { data: mealsData } = useMealsToday()
  const { data: targets = { calories: 2000, protein: 150, carbs: 250, fat: 65 } } =
    useNutritionTargets()

  // T5.9 — Assessment summary for post-onboarding card
  const { data: assessments } = useSelfAssessments(1)
  const latestAssessment = assessments?.[0]

  // Auto-create assessment from onboarding data if user has none yet
  const { data: onboardingStatus } = useB2COnboardingCompleted(true)
  useAutoAssessmentFromOnboarding(
    !!onboardingStatus?.completed,
    assessments?.length,
  )

  // Auto-generate workout plan from onboarding data if user has none yet
  useAutoGeneratePlan(
    !!onboardingStatus?.completed,
    planFetched, // true once the plan query has settled (success or error)
    !!plan && !planError, // true if plan exists
  )

  // T8.9 — Upgrade prompt after 3 workouts
  const { data: subscription } = useSubscriptionStatus()
  const isFree = !subscription?.is_premium
  const { data: logsData } = useWorkoutLogs({ per_page: 1 })
  const { data: xpBalance } = useXPBalance()
  const { data: dailyGoal } = useDailyGoal()
  const { data: streak } = useStreak()
  const workoutCount = logsData?.meta?.total ?? 0
  const showUpgradePrompt = isFree && workoutCount >= 3
  const { data: studentProfile } = useStudentProfile()
  const linkPersonalTrainer = useLinkPersonalTrainer()
  const [personalReferralCode, setPersonalReferralCode] = useState('')
  const [showPersonalQr, setShowPersonalQr] = useState(false)
  const [personalInviteQrUrl, setPersonalInviteQrUrl] = useState('')

  const personalInviteLink = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://vfit.app.br'
    const params = new URLSearchParams({
      source: 'student-invite',
      origin: 'treinos',
    })
    if (studentProfile?.id) params.set('student_id', studentProfile.id)
    return `${base}/register/personal?${params.toString()}`
  }, [studentProfile?.id])

  useEffect(() => {
    let cancelled = false

    async function generateQr() {
      if (!showPersonalQr) {
        setPersonalInviteQrUrl('')
        return
      }

      try {
        const dataUrl = await (await import('qrcode')).default.toDataURL(personalInviteLink, {
          margin: 1,
          width: 280,
          color: { dark: '#0a0f0a', light: '#ffffff' },
        })
        if (!cancelled) setPersonalInviteQrUrl(dataUrl)
      } catch {
        if (!cancelled) setPersonalInviteQrUrl('')
      }
    }

    void generateQr()

    return () => {
      cancelled = true
    }
  }, [showPersonalQr, personalInviteLink])

  // Treino de hoje — map current_day to plan day
  const todayDay = useMemo(() => {
    if (!plan?.days?.length) return null
    const dayIdx = plan.days.findIndex((d) => d.day_number === plan.current_day)
    if (dayIdx >= 0) return plan.days[dayIdx]
    return plan.days[(plan.current_day - 1) % plan.days.length] ?? plan.days[0]
  }, [plan])
  const todayExercises = todayDay?.exercises ?? []

  const exerciseById = useMemo(() => {
    const map = new Map<string, Exercise>()
    for (const ex of exerciseCatalog?.exercises ?? []) {
      map.set(ex.id, ex)
    }
    return map
  }, [exerciseCatalog?.exercises])

  const exerciseIdByName = useMemo(() => {
    const map = new Map<string, string>()
    for (const ex of exerciseCatalog?.exercises ?? []) {
      map.set(normalizeText(ex.name_pt), ex.id)
      map.set(normalizeText(ex.name), ex.id)
    }
    return map
  }, [exerciseCatalog?.exercises])

  const muscleByName = useMemo(() => {
    const map = new Map<string, (typeof muscleGroups)[number]>()
    for (const mg of muscleGroups ?? []) {
      map.set(normalizeText(mg.name_pt), mg)
      map.set(normalizeText(mg.name), mg)
    }
    return map
  }, [muscleGroups])

  const todayMuscles = useMemo(() => {
    return (todayDay?.muscle_groups ?? []).map((name) => {
      const match = muscleByName.get(normalizeText(name))
      return {
        name,
        imageUrl: getMuscleImageUrl(match, isSuperAdmin),
        tone: toneByMuscle(name),
      }
    })
  }, [todayDay?.muscle_groups, muscleByName, isSuperAdmin])

  const totals = mealsData?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const planPct = plan && plan.total_days > 0 ? Math.round((plan.current_day / plan.total_days) * 100) : 0

  return (
    <div className="mx-auto max-w-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300 px-4 pt-0 pb-4">
      <FirstWinCommandCenter
        userName={user?.full_name}
        todayDay={todayDay}
        plan={plan}
        planPct={planPct}
        totals={totals}
        targets={targets}
        streak={streak}
        xpBalance={xpBalance}
        dailyGoal={dailyGoal}
        workoutCount={workoutCount}
      />

      {/* T5.9 — Assessment summary card (pós-onboarding) */}
      {latestAssessment ? (
        <Link href="/avaliacoes" className="group mb-5 block">
          <div className="relative overflow-hidden rounded-[28px] border border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/40 to-slate-50 p-4 shadow-[0_24px_58px_rgba(15,23,42,0.14)] transition-all duration-300 group-active:translate-y-px">
            <div className="pointer-events-none absolute -left-10 -top-12 h-32 w-32 rounded-full bg-emerald-200/45 blur-2xl" />
            <div className="pointer-events-none absolute -right-12 bottom-4 h-36 w-36 rounded-full bg-violet-100/70 blur-3xl" />
            <div className="relative mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-200 bg-white text-violet-500 shadow-[0_8px_18px_rgba(124,58,237,0.14)]">
                  <DSIcon name="clipboardList" size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-500/85">
                    Sua Avaliação
                  </span>
                  <p className="mt-0.5 text-[12px] font-semibold text-slate-500">Composição corporal</p>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-400 shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition-colors group-hover:text-emerald-600">
                <DSIcon name="chevronRight" size={16} />
              </div>
            </div>

            <div className="relative grid grid-cols-3 divide-x divide-slate-200/80 rounded-3xl border border-white/80 bg-white/75 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_22px_rgba(15,23,42,0.06)]">
              <div className="px-2">
                <p className="text-[22px] font-black leading-none tracking-tight text-slate-950 tabular-nums">
                  {latestAssessment.weight_kg}
                  <span className="ml-0.5 text-[10px] font-bold text-slate-400">kg</span>
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">Peso</p>
              </div>
              <div className="px-2">
                <p className={`text-[22px] font-black leading-none tracking-tight tabular-nums ${getBMIColor(latestAssessment.bmi)}`}>
                  {latestAssessment.bmi}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">IMC</p>
              </div>
              <div className="px-2">
                <p className="text-[22px] font-black leading-none tracking-tight text-slate-950 tabular-nums">
                  {latestAssessment.body_fat_percentage != null
                    ? `${latestAssessment.body_fat_percentage}%`
                    : '—'}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">Gordura</p>
              </div>
            </div>
            {latestAssessment.bmi_category && (
              <div className="relative mt-3 flex justify-center">
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 shadow-[0_4px_12px_rgba(245,158,11,0.12)]">
                  {latestAssessment.bmi_category}
                </span>
              </div>
            )}
          </div>
        </Link>
      ) : (
        <Link href="/avaliacoes/nova" className="group mb-5 block">
          <div className="relative flex min-h-22 items-center gap-3 overflow-hidden rounded-[28px] border border-violet-100 bg-linear-to-br from-white via-violet-50/40 to-emerald-50/35 p-4 shadow-[0_22px_48px_rgba(15,23,42,0.12)] transition-all duration-300 group-active:translate-y-px">
            <div className="pointer-events-none absolute -left-8 -top-12 h-28 w-28 rounded-full bg-violet-200/45 blur-2xl" />
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-200 bg-white text-violet-500 shadow-[0_8px_18px_rgba(124,58,237,0.14)]">
              <DSIcon name="clipboardList" size={21} />
            </div>
            <div className="relative flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-500/85">Avaliação física</p>
              <p className="mt-1 text-[15px] font-black text-slate-950">Criar avaliação corporal</p>
              <p className="mt-0.5 text-[12px] font-semibold text-slate-500">Peso, IMC e gordura em um painel inteligente</p>
            </div>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-400 shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition-colors group-hover:text-emerald-600">
              <DSIcon name="chevronRight" size={16} />
            </div>
          </div>
        </Link>
      )}

      {/* Loja horizontal — suplementos e itens fitness */}
      <section className="mb-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600/85">Loja VFIT</p>
            <h2 className="mt-0.5 text-[17px] font-black tracking-tight text-slate-950">Performance para hoje</h2>
          </div>
          <Link href="/dashboard/marketplace" className="flex h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 text-[11px] font-black text-emerald-700 shadow-[0_8px_18px_rgba(5,150,105,0.12)] active:translate-y-px">
            Ver loja
            <DSIcon name="chevronRight" size={13} />
          </Link>
        </div>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
          {FITNESS_STORE_PRODUCTS.map((product) => (
            <Link
              key={product.name}
              href="/dashboard/marketplace"
              className="group relative min-h-38 w-64 shrink-0 overflow-hidden rounded-[26px] border border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/35 to-slate-50 p-4 shadow-[0_20px_44px_rgba(15,23,42,0.12)] transition-all duration-300 active:translate-y-px"
            >
              <div className="pointer-events-none absolute -right-12 -top-10 h-30 w-30 rounded-full bg-emerald-200/45 blur-2xl" />
              <div className={cn('relative mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]', product.accent)}>
                <DSIcon name={product.icon} size={21} />
              </div>
              <div className="relative">
                <div className="mb-2 inline-flex rounded-full border border-emerald-200 bg-white/75 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                  {product.tag}
                </div>
                <h3 className="text-[16px] font-black leading-tight text-slate-950">{product.name}</h3>
                <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-snug text-slate-500">{product.subtitle}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[17px] font-black text-slate-950">{product.price}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-emerald-600 shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition-colors group-hover:bg-emerald-50">
                    <DSIcon name="shoppingBag" size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Convite/Vínculo com Personal Trainer */}
      <details className="group mb-5 overflow-hidden rounded-[28px] border border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/40 to-slate-50 shadow-[0_22px_52px_rgba(15,23,42,0.13)]">
        <summary className="relative flex cursor-pointer list-none items-start justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
          <div className="pointer-events-none absolute -left-10 -top-12 h-30 w-30 rounded-full bg-emerald-200/45 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600 shadow-[0_8px_18px_rgba(5,150,105,0.14)]">
              <DSIcon name="userPlus" size={19} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600/85">Personal Trainer</p>
              <p className="mt-1 text-[14px] font-black leading-tight text-slate-950">
                Acompanhamento profissional
              </p>
              <p className="mt-1 text-[12px] font-semibold text-slate-500">
                Vincule um profissional quando quiser revisão humana do plano.
              </p>
            {studentProfile?.personal_name && (
              <p className="mt-1 text-[12px] font-bold text-emerald-700">
                Vinculado com: {studentProfile.personal_name}
              </p>
            )}
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-[10px] font-black text-emerald-700 shadow-[0_4px_12px_rgba(5,150,105,0.10)]">
              Opcional
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-400 shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition-colors group-open:text-emerald-600">
              <DSIcon name="chevronRight" size={16} className="transition-transform group-open:rotate-90" />
            </span>
          </div>
        </summary>

        <div className="relative border-t border-emerald-100/90 bg-white/55 p-4 pt-4">

        <div className="mb-3 flex gap-2">
          <Input
            value={personalReferralCode}
            onChange={(e) => setPersonalReferralCode(e.target.value.toUpperCase())}
            placeholder="Código do personal (ex: ABC123)"
            disabled={linkPersonalTrainer.isPending || !!studentProfile?.personal_id}
          />
          <Button
            onClick={() => linkPersonalTrainer.mutate(personalReferralCode)}
            loading={linkPersonalTrainer.isPending}
            disabled={!personalReferralCode.trim() || !!studentProfile?.personal_id}
          >
            Vincular
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigator.clipboard.writeText(personalInviteLink)}
          >
            <DSIcon name="copy" size={14} />
            Copiar link
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(`mailto:?subject=${encodeURIComponent('Convite para VFIT — Personal Trainer')}&body=${encodeURIComponent(`Olá! Quero te convidar para acompanhar minha avaliação completa no VFIT.\n\nCadastre-se aqui: ${personalInviteLink}`)}`, '_blank')}
          >
            <DSIcon name="mail" size={14} />
            Email
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Quero te convidar para me acompanhar no VFIT e realizar minha avaliação completa.\n\nCadastro: ${personalInviteLink}`)}`, '_blank')}
          >
            <DSIcon name="share2" size={14} />
            WhatsApp
          </Button>
          <Button
            variant={showPersonalQr ? 'workout' : 'secondary'}
            size="sm"
            onClick={() => setShowPersonalQr((v) => !v)}
          >
            <DSIcon name="qrcode" size={14} />
            QR Code
          </Button>
        </div>

        {showPersonalQr && (
          <div className="mt-4 flex justify-center">
            {personalInviteQrUrl ? (
              <Image
                src={personalInviteQrUrl}
                alt="QR Code convite personal"
                width={176}
                height={176}
                unoptimized
                className="h-44 w-44 rounded-2xl border border-emerald-100 bg-white p-2 shadow-[0_14px_32px_rgba(15,23,42,0.10)]"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-emerald-100 bg-white/80">
                <DSIcon name="loader" size={20} className="animate-spin text-text-muted" />
              </div>
            )}
          </div>
        )}
        </div>
      </details>

      {/* T8.9 — Upgrade prompt após 3 treinos no free */}
      {showUpgradePrompt && (
        <Link href="/perfil/assinatura" className="mb-5 block">
          <div className="relative overflow-hidden rounded-[28px] border border-amber-100 bg-linear-to-br from-white via-amber-50/60 to-slate-50 p-4 shadow-[0_22px_52px_rgba(15,23,42,0.13)]">
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-200/55 blur-2xl" />
            <div className="relative mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-white text-amber-500 shadow-[0_10px_22px_rgba(245,158,11,0.16)]">
                <DSIcon name="sparkles" size={19} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600/90">
                  Parabéns! {workoutCount} treinos concluídos
                </span>
                <p className="mt-0.5 text-[13px] font-black text-slate-950">
                  Desbloqueie planos ilimitados com o Premium.
                </p>
              </div>
            </div>
            <div className="relative mt-3 flex items-center justify-between rounded-2xl border border-amber-100 bg-white/80 px-3 py-2">
              <span className="text-[12px] font-bold text-slate-500">
                A partir de R$ 29,90/mês
              </span>
              <span className="rounded-xl bg-amber-400 px-3 py-1.5 text-[12px] font-black text-slate-950 shadow-[0_6px_14px_rgba(245,158,11,0.18)]">
                Ver planos
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* ── Gamificação VFIT — Hub Redesigned ── */}
      <details className="group mb-5 overflow-hidden rounded-[28px] border border-emerald-100/90 bg-white shadow-[0_22px_52px_rgba(15,23,42,0.13)]">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 [&::-webkit-details-marker]:hidden">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">Gamificação VFIT</p>
            <h2 className="mt-0.5 text-[17px] font-black tracking-tight text-slate-950">Streak, XP e metas</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
            <span className="text-[11px] font-bold text-emerald-700">Nv. {xpBalance?.level ?? 1}</span>
            <DSIcon name="chevronRight" size={14} className="text-emerald-600 transition-transform group-open:rotate-90" />
          </div>
        </summary>

      <div className="relative overflow-hidden bg-linear-to-br from-white via-emerald-50/40 to-slate-50">
        <div className="pointer-events-none absolute -left-12 top-8 h-36 w-36 rounded-full bg-emerald-200/45 blur-2xl" />
        <div className="pointer-events-none absolute -right-14 bottom-8 h-40 w-40 rounded-full bg-amber-100/75 blur-3xl" />
        {/* Top accent line */}
        <div className="relative h-px w-full bg-linear-to-r from-transparent via-emerald-300/70 to-transparent" />

        <div className="px-4 pt-4 pb-5">
          {/* Header */}
          <div className="relative mb-4 flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600/80">Gamificação VFIT</p>
              <h2 className="mt-0.5 text-[17px] font-black tracking-tight text-slate-950">Streak, XP e metas</h2>
            </div>
              <Link href="/progresso/streaks" className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/85 px-2.5 py-1 shadow-[0_6px_16px_rgba(5,150,105,0.12)] transition-all hover:bg-emerald-50">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] font-black text-emerald-700">Nv. {xpBalance?.level ?? 1}</span>
            </Link>
          </div>

          {/* 3 main stat cards */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            {/* XP */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/80 p-3 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
              <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-emerald-200/45 blur-xl" />
              <DSIcon name="zap" size={13} className="mb-2 text-emerald-400" />
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700/65">XP atual</p>
              <p className="mt-0.5 text-xl font-black leading-none text-emerald-700">{xpBalance?.balance ?? 0}</p>
              <div className="mt-2">
                <div className="mb-0.5 flex justify-between">
                  <span className="text-[9px] font-semibold text-slate-400">Nv {xpBalance?.level ?? 1}</span>
                  <span className="text-[9px] font-semibold text-slate-400">Nv {(xpBalance?.level ?? 1) + 1}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className="h-1 rounded-full bg-linear-to-r from-emerald-500 to-emerald-300 transition-all duration-700"
                    style={{ width: `${Math.min(100, ((xpBalance?.balance ?? 0) % 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-white/80 p-3 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
              <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-amber-200/50 blur-xl" />
              <DSIcon name="flame" size={13} className="mb-2 text-amber-400" />
              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700/65">Streak</p>
              <div className="mt-0.5 flex items-end gap-1">
                <p className="text-xl font-black leading-none text-amber-700">{streak?.current_streak ?? 0}</p>
                <p className="mb-0.5 text-[10px] font-bold text-amber-600/70">dias</p>
              </div>
              <p className="mt-2 text-[9px] font-semibold text-slate-400">Recorde: {streak?.longest_streak ?? 0} dias</p>
            </div>

            {/* Meta diária */}
            <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-white/80 p-3 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
              <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-violet-200/45 blur-xl" />
              <DSIcon name="target" size={13} className="mb-2 text-violet-400" />
              <p className="text-[9px] font-bold uppercase tracking-wider text-violet-700/65">Meta diária</p>
              <div className="mt-0.5 flex items-end gap-0.5">
                <p className="text-xl font-black leading-none text-violet-700">{dailyGoal?.earned_xp ?? 0}</p>
                <p className="mb-0.5 text-[11px] font-bold text-slate-400">/{dailyGoal?.target_xp ?? 0}</p>
              </div>
              <p className="mt-2 text-[9px] font-semibold text-slate-400">XP hoje</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative rounded-2xl border border-emerald-100 bg-white/80 p-3.5 shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DSIcon name="trophy" size={13} className="text-emerald-400" />
                <span className="text-[11px] font-bold text-slate-600">Meta do dia</span>
              </div>
              <span className="text-[12px] font-black text-emerald-700">{Math.round((dailyGoal?.progress ?? 0) * 100)}%</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-slate-200/80">
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-[0_6px_16px_rgba(16,185,129,0.28)] transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(2, Math.min(100, Math.round((dailyGoal?.progress ?? 0) * 100)))}%`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400">{dailyGoal?.workouts_done ?? 0}/{dailyGoal?.workouts_target ?? 0} treinos hoje</span>
              <Link href="/progresso/streaks" className="text-[10px] font-bold text-emerald-400 transition-colors hover:text-emerald-300">
                Ver detalhes →
              </Link>
            </div>
          </div>

          {/* Weekly activity dots */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400">Semana</p>
            <div className="flex gap-1.5">
              {(['D','S','T','Q','Q','S','S'] as const).map((day, i) => {
                const todayIdx = new Date().getDay()
                const isToday = i === todayIdx
                const isPast = i < todayIdx
                const hasActivity = isPast && (streak?.current_streak ?? 0) > 0
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        'h-6 w-6 rounded-lg text-[8px] font-bold flex items-center justify-center transition-all',
                        isToday ? 'text-white' : hasActivity ? 'text-emerald-700' : 'text-slate-400'
                      )}
                      style={
                        isToday
                          ? { background: 'rgba(16,185,129,0.9)', boxShadow: '0 8px 16px rgba(16,185,129,0.22)' }
                          : hasActivity
                          ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)' }
                          : { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(226,232,240,0.9)' }
                      }
                    >
                      {day}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom separator */}
        <div className="relative h-px w-full bg-linear-to-r from-transparent via-emerald-200/80 to-transparent" />
      </div>
      </details>

      {/* Detalhes do treino de hoje (IA) */}
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600/85">Treino inteligente</p>
          <h2 className="mt-0.5 text-[17px] font-black tracking-tight text-slate-950">Detalhes do treino de hoje</h2>
        </div>
      </div>

      {todayDay ? (
        <div className="relative mb-5 overflow-hidden rounded-[28px] border border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/35 to-slate-50 p-4 shadow-[0_22px_52px_rgba(15,23,42,0.13)]">
          <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-emerald-200/45 blur-3xl" />
          <div className="relative mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600 shadow-[0_10px_22px_rgba(5,150,105,0.14)]">
                <DSIcon name="dumbbell" size={21} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-black text-slate-950">
                  Dia {plan?.current_day} — {todayDay.name}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-500">Plano do dia com carga estimada por IA</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-black text-emerald-700 shadow-[0_6px_16px_rgba(5,150,105,0.12)]">
              Hoje
            </span>
          </div>

          <div className="relative mb-4 rounded-2xl border border-amber-200 bg-amber-50/90 px-3 py-2.5 text-[11px] font-semibold leading-snug text-amber-800">
            Carga estimada por IA. Peça para o professor da academia revisar o peso de cada exercício antes de executar.
          </div>

          {!!todayMuscles.length && (
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                Músculos alvo de hoje
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {todayMuscles.map((group) => (
                  <Link
                    key={group.name}
                    href={`/musculos/detalhe?muscle=${encodeURIComponent(group.name)}`}
                    className="relative z-10 shrink-0 cursor-pointer rounded-2xl border border-emerald-100 bg-white/85 p-2 shadow-[0_8px_18px_rgba(15,23,42,0.07)] transition-colors hover:bg-emerald-50/60"
                  >
                    <Image
                      src={group.imageUrl || buildPlaceholderImage(group.name, group.tone)}
                      alt={`Grupo muscular ${group.name}`}
                      width={96}
                      height={80}
                      unoptimized
                      className="h-20 w-24 rounded-xl object-cover"
                    />
                    <p className="mt-1 text-center text-[11px] font-bold text-slate-600">{group.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {isSuperAdmin && (
            <div className="relative mb-3 rounded-2xl border border-slate-200 bg-white/80 p-2.5 text-[10px] font-semibold text-slate-500">
              Você pode editar imagens de grupos musculares em
              {' '}
              <Link href="/dashboard/admin/muscle-groups" className="font-semibold text-brand-primary">
                Admin › Grupos Musculares
              </Link>
              {' '}e vídeos/thumbs de exercícios em{' '}
              <Link href="/dashboard/workouts/media/library" className="font-semibold text-brand-primary">
                Biblioteca de Mídia
              </Link>
              .
            </div>
          )}

          <div className="relative space-y-2.5">
            {todayExercises.map((ex) => {
              const byId = ex.exercise_id
              const byName = exerciseIdByName.get(normalizeText(ex.exercise_name || ''))
              const resolvedId = byId || byName
              const href = resolvedId
                ? `/exercicios/detalhe?id=${encodeURIComponent(resolvedId)}`
                : `/exercicios?q=${encodeURIComponent(ex.exercise_name || ex.muscle_group || 'exercicio')}`

              return (
              <Link
                key={ex.id}
                href={href}
                className="relative z-10 flex min-h-20 w-full cursor-pointer items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/85 p-2.5 text-left shadow-[0_10px_22px_rgba(15,23,42,0.07)] transition-colors hover:border-emerald-200 hover:bg-emerald-50/45"
              >
                <div className="relative shrink-0">
                  <Image
                    src={exerciseById.get(ex.exercise_id)?.thumbnail_url || buildPlaceholderImage(ex.exercise_name || ex.muscle_group || 'Exercício', toneByMuscle(ex.muscle_group))}
                    alt={ex.exercise_name || 'Exercício'}
                    width={64}
                    height={48}
                    unoptimized
                    className="h-14 w-18 rounded-xl object-cover"
                  />
                  {!!ex.muscle_group && (
                    <Image
                      src={getMuscleImageUrl(muscleByName.get(normalizeText(ex.muscle_group)), isSuperAdmin) || buildPlaceholderImage(ex.muscle_group, toneByMuscle(ex.muscle_group))}
                      alt={`Músculo ${ex.muscle_group}`}
                      width={24}
                      height={24}
                      unoptimized
                      className="absolute -right-1 -bottom-1 h-7 w-7 rounded-lg border border-white bg-white object-cover shadow-[0_6px_14px_rgba(15,23,42,0.16)]"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black text-slate-950">{ex.exercise_name || 'Exercício'}</p>
                  <p className="text-[10px] font-semibold text-slate-500">
                    {ex.sets} séries · {ex.reps} · descanso {ex.rest_seconds}s
                  </p>
                  <p className="text-[10px] font-bold text-emerald-700">
                    Carga estimada IA: {ex.weight_kg != null ? `${ex.weight_kg} kg` : 'ajustar com professor'}
                  </p>
                  {!!exerciseById.get(ex.exercise_id)?.video_url_vertical && (
                    <p className="text-[10px] font-semibold text-slate-400">Vídeo disponível</p>
                  )}
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                  <DSIcon name="chevronRight" size={14} />
                </span>
              </Link>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mb-5 rounded-[28px] border border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/35 to-slate-50 p-5 text-center shadow-[0_22px_52px_rgba(15,23,42,0.13)]">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600 shadow-[0_10px_22px_rgba(5,150,105,0.14)]">
            <DSIcon name="dumbbell" size={21} />
          </div>
          <p className="text-[14px] font-black text-slate-950">Seu treino do dia ainda não foi gerado</p>
          <p className="mx-auto mt-1 max-w-70 text-[12px] font-semibold leading-snug text-slate-500">
            Gere seu plano com IA para ver séries, descanso, carga estimada e músculos alvo.
          </p>
        </div>
      )}

      {/* Templates section */}
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600/85">Explorar</p>
          <h2 className="mt-0.5 text-[17px] font-black tracking-tight text-slate-950">Biblioteca de treinos prontos</h2>
        </div>
      </div>

      {/* Difficulty filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {DIFFICULTY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              hapticLight()
              setDifficulty(f.value)
            }}
            className={`min-h-10 shrink-0 rounded-full border px-4 py-1.5 text-[12px] font-black transition-all ${
              difficulty === f.value
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.20)]'
                : 'border-slate-200 bg-white text-slate-600 shadow-[0_6px_14px_rgba(15,23,42,0.06)] hover:bg-emerald-50/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <DSIcon name="loader" size={24} className="animate-spin text-text-muted" />
        </div>
      )}

      {/* Templates grid */}
      {templates && templates.length > 0 && (
        <div className="space-y-3">
          {templates.map((t) => (
            <Link
              key={t.id}
              href={`/treinos/${t.id}`}
              className="group relative flex min-h-24 items-center gap-3 overflow-hidden rounded-2xl border border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/25 to-slate-50 p-4 shadow-[0_16px_36px_rgba(15,23,42,0.10)] transition-all hover:border-emerald-200"
            >
              <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-emerald-200/45 blur-2xl transition-opacity group-hover:opacity-80" />
              <Image
                src={buildPlaceholderImage(t.name || t.category || 'Treino', toneByMuscle(t.category))}
                alt={`Placeholder treino ${t.name}`}
                width={56}
                height={56}
                unoptimized
                className="relative h-16 w-16 shrink-0 rounded-2xl object-cover shadow-[0_10px_22px_rgba(15,23,42,0.12)]"
              />

              <div className="relative min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <p className="truncate text-[14px] font-black text-slate-950">{t.name}</p>
                  <DSIcon name="activity" size={12} className="text-emerald-600" />
                  {t.is_premium && (
                    <DSIcon name="lock" size={12} className="shrink-0 text-yellow-400" />
                  )}
                </div>
                <p className="mb-1.5 line-clamp-1 text-[11px] font-semibold text-slate-500">{t.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getDifficultyColor(t.difficulty)}`}>
                    {getDifficultyLabel(t.difficulty)}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {t.total_days} dias · {t.estimated_duration_min}min
                  </span>
                </div>
              </div>

              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-[0_6px_16px_rgba(15,23,42,0.08)]">
                <DSIcon name="chevronRight" size={16} />
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Empty */}
      {templates && templates.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
          <p className="text-[13px] font-bold text-slate-500">Nenhum treino encontrado para esse filtro.</p>
        </div>
      )}
    </div>
  )
}
