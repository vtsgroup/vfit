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
import { useWorkoutLogs, useMyWorkouts } from '@/hooks/use-workouts'
import { useDailyGoal, useStreak, useXPBalance } from '@/hooks/use-xp'
import { useSubscriptionStatus } from '@/hooks/use-vfit-checkout'
import { useB2COnboardingCompleted } from '@/hooks/use-b2c-onboarding'
import { useStudentProfile, useLinkPersonalTrainer } from '@/hooks/use-student-app'
import { useExercises, useMuscleGroups, type Exercise } from '@/hooks/use-exercises'
import { useAuthStore } from '@/stores/auth-store'
import { LoadFailed } from '@/components/ui/load-failed'
import { HeroWorkbench } from '@/components/treinos/hero-variants/variant-41-workbench'

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
  const { data: templates, isLoading, isError: templatesError, refetch: refetchTemplates } = useWorkoutTemplates(
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
  const { data: myWorkoutsData } = useMyWorkouts({ status: 'active', per_page: 10 })
  const assignedWorkouts = myWorkoutsData?.workouts ?? []
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
    <div className="min-h-dvh" style={{ background: 'linear-gradient(180deg, #e6ecf5, #f4f7fb 420px)' }}>
    <div className="mx-auto max-w-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300 px-4 pt-0 pb-4">
      <HeroWorkbench
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

      {/* Treinos atribuídos pelo personal (B2B) */}
      {assignedWorkouts.length > 0 && (
        <section className="mb-5">
          <div className="mb-3">
            <h2 className="text-[17px] font-semibold tracking-tight text-[var(--color-text-primary-cool)]">Treinos do seu personal</h2>
          </div>

          <div className="space-y-3">
            {assignedWorkouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/treinos/executar?id=${workout.id}`}
                className="group relative block overflow-hidden rounded-[var(--radius-3xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)] p-4 transition-transform duration-150 ease-out active:scale-[0.99] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)]"
              >
                <div className="pointer-events-none absolute -left-10 -top-12 h-30 w-30 rounded-full bg-emerald-200/45 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-white/10 bg-white/5 text-[var(--color-brand-mint)]">
                    <DSIcon name="dumbbell" size={21} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold leading-tight text-[var(--color-text-primary-cool)]">{workout.name}</p>
                    <p className="mt-0.5 truncate text-[12px] font-semibold text-[var(--color-text-muted-cool)]">
                      {workout.personal_name ? `Por ${workout.personal_name}` : 'Treino personalizado'}
                      {' · '}
                      {workout.exercise_count} exercício{workout.exercise_count === 1 ? '' : 's'}
                    </p>
                    {workout.times_completed > 0 && (
                      <p className="mt-0.5 text-[11px] font-bold text-emerald-400 tabular-nums">
                        Concluído {workout.times_completed}x
                      </p>
                    )}
                  </div>
                  <span className="flex h-10 items-center gap-1.5 rounded-full border border-white/10 px-3 text-[11px] font-medium text-[var(--color-brand-mint)]">
                    Iniciar
                    <DSIcon name="play" size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* T5.9 — Assessment summary card (pós-onboarding) */}
      {latestAssessment ? (
        <Link href="/avaliacoes" className="group mb-5 block">
          <div className="relative overflow-hidden rounded-[var(--radius-3xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)] p-4 transition-transform duration-150 ease-out group-active:scale-[0.995] motion-reduce:transition-none">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-[var(--color-text-primary-cool)]">Sua avaliação</h2>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-muted-cool)]">Composição corporal</p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[var(--color-text-muted-cool)] transition-colors group-hover:border-[var(--color-brand-ring)] group-hover:text-[var(--color-brand-mint)]">
                <DSIcon name="chevronRight" size={15} />
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-[var(--radius-lg)] bg-white/4 px-2 py-3 text-center">
                <p className="text-[20px] font-bold leading-none tracking-tight text-[var(--color-text-primary-cool)] tabular-nums">
                  {latestAssessment.weight_kg}
                  <span className="ml-0.5 text-[10px] font-medium text-[var(--color-text-muted-cool)]">kg</span>
                </p>
                <p className="mt-1.5 text-[11px] text-[var(--color-text-muted-cool)]">Peso</p>
              </div>
              <div className="rounded-[var(--radius-lg)] bg-white/4 px-2 py-3 text-center">
                <p className={`text-[20px] font-bold leading-none tracking-tight tabular-nums ${getBMIColor(latestAssessment.bmi)}`}>
                  {latestAssessment.bmi}
                </p>
                <p className="mt-1.5 text-[11px] text-[var(--color-text-muted-cool)]">IMC</p>
              </div>
              <div className="rounded-[var(--radius-lg)] bg-white/4 px-2 py-3 text-center">
                <p className="text-[20px] font-bold leading-none tracking-tight text-[var(--color-text-primary-cool)] tabular-nums">
                  {latestAssessment.body_fat_percentage != null
                    ? `${latestAssessment.body_fat_percentage}%`
                    : '—'}
                </p>
                <p className="mt-1.5 text-[11px] text-[var(--color-text-muted-cool)]">Gordura</p>
              </div>
            </div>
            {latestAssessment.bmi_category && (
              <p className="mt-3 text-center text-[12px] text-[var(--color-text-secondary-cool)]">
                {latestAssessment.bmi_category}
              </p>
            )}
          </div>
        </Link>
      ) : (
        <Link href="/avaliacoes/nova" className="group mb-5 block">
          <div className="relative flex min-h-22 items-center gap-3 overflow-hidden rounded-[var(--radius-3xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)] p-4 transition-transform duration-150 ease-out group-active:scale-[0.995] motion-reduce:transition-none">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-white/10 bg-white/5 text-[var(--color-brand-mint)]">
              <DSIcon name="clipboardList" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[var(--color-text-primary-cool)]">Criar avaliação corporal</p>
              <p className="mt-0.5 text-[12px] text-[var(--color-text-muted-cool)]">Peso, IMC e gordura em um só painel</p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[var(--color-text-muted-cool)] transition-colors group-hover:border-[var(--color-brand-ring)] group-hover:text-[var(--color-brand-mint)]">
              <DSIcon name="chevronRight" size={15} />
            </span>
          </div>
        </Link>
      )}

      {/* Loja horizontal — suplementos e itens fitness */}
      <section className="mb-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold tracking-tight text-[var(--color-text-primary-cool)]">Loja VFIT</h2>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-muted-cool)]">Performance para hoje</p>
          </div>
          <Link href="/dashboard/marketplace" className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3 text-[12px] font-medium text-[var(--color-text-secondary-cool)] transition-colors hover:border-[var(--color-brand-ring)] hover:text-[var(--color-brand-mint)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)]">
            Ver loja
            <DSIcon name="chevronRight" size={13} />
          </Link>
        </div>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
          {FITNESS_STORE_PRODUCTS.map((product) => (
            <Link
              key={product.name}
              href="/dashboard/marketplace"
              className="group relative min-h-38 w-64 shrink-0 overflow-hidden rounded-[var(--radius-2xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)] p-4 transition-transform duration-150 ease-out hover:border-[var(--color-brand-ring)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)] active:scale-[0.99] motion-reduce:transition-none"
            >
              <div className={cn('mb-3 flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-linear-to-br text-white', product.accent)}>
                <DSIcon name={product.icon} size={20} />
              </div>
              <div className="min-w-0">
                <div className="mb-2 inline-flex rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-text-secondary-cool)]">
                  {product.tag}
                </div>
                <h3 className="text-[16px] font-semibold leading-tight text-[var(--color-text-primary-cool)]">{product.name}</h3>
                <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-[var(--color-text-muted-cool)]">{product.subtitle}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[17px] font-semibold tabular-nums text-[var(--color-text-primary-cool)]">{product.price}</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-[var(--color-text-muted-cool)] transition-colors group-hover:border-[var(--color-brand-ring)] group-hover:text-[var(--color-brand-mint)]">
                    <DSIcon name="shoppingBag" size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Convite/Vínculo com Personal Trainer */}
      <details className="group mb-5 overflow-hidden rounded-[var(--radius-3xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)]">
        <summary className="relative flex cursor-pointer list-none items-start justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
          <div className="pointer-events-none absolute -left-10 -top-12 h-30 w-30 rounded-full bg-emerald-200/45 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-white/10 bg-white/5 text-[var(--color-brand-mint)]">
              <DSIcon name="userPlus" size={19} />
            </div>
            <div>
              <p className="text-[14px] font-semibold leading-tight text-[var(--color-text-primary-cool)]">
                Acompanhamento profissional
              </p>
              <p className="mt-1 text-[12px] font-semibold text-[var(--color-text-muted-cool)]">
                Vincule um profissional quando quiser revisão humana do plano.
              </p>
            {studentProfile?.personal_name && (
              <p className="mt-1 text-[12px] font-bold text-emerald-400">
                Vinculado com: {studentProfile.personal_name}
              </p>
            )}
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium text-[var(--color-text-muted-cool)]">
              Opcional
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[var(--color-text-muted-cool)] transition-colors group-open:text-[var(--color-brand-mint)]">
              <DSIcon name="chevronRight" size={16} className="transition-transform group-open:rotate-90" />
            </span>
          </div>
        </summary>

        <div className="relative border-t border-white/8 bg-white/4 p-4 pt-4">

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
                className="h-44 w-44 rounded-[var(--radius-2xl)] border border-white/8 bg-white p-2"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-[var(--radius-lg)] border border-white/10 bg-white/5">
                <DSIcon name="loader" size={20} className="animate-spin text-text-muted" />
              </div>
            )}
          </div>
        )}
        </div>
      </details>

      {/* T8.9 — Upgrade prompt após 3 treinos no free */}
      {showUpgradePrompt && (
        <Link
          href="/perfil/assinatura"
          className="mb-5 block transition-transform duration-150 ease-out active:scale-[0.99] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)]"
        >
          <div className="relative overflow-hidden rounded-[var(--radius-3xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)] p-4">
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-200/55 blur-2xl" />
            <div className="relative mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] border border-white/10 bg-white/5 text-amber-400">
                <DSIcon name="sparkles" size={19} />
              </div>
              <div>
                <span className="text-[12px] font-semibold text-amber-400 tabular-nums">
                  Parabéns! {workoutCount} treinos concluídos
                </span>
                <p className="mt-0.5 text-[13px] font-semibold text-[var(--color-text-primary-cool)]">
                  Desbloqueie planos ilimitados com o Premium.
                </p>
              </div>
            </div>
            <div className="relative mt-3 flex items-center justify-between rounded-[var(--radius-lg)] border border-white/8 bg-white/4 px-3 py-2">
              <span className="text-[12px] font-bold text-[var(--color-text-muted-cool)]">
                A partir de R$ 29,90/mês
              </span>
              <span className="rounded-[var(--radius-lg)] bg-amber-400 px-3 py-1.5 text-[12px] font-semibold text-slate-950">
                Ver planos
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* ── Gamificação VFIT — Hub Redesigned ── */}
      <details className="group mb-5 overflow-hidden rounded-[var(--radius-3xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)]">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 [&::-webkit-details-marker]:hidden">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-[var(--color-text-primary-cool)]">Streak, XP e metas</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
            <span className="text-[11px] font-bold text-emerald-400 tabular-nums">Nv. {xpBalance?.level ?? 1}</span>
            <DSIcon name="chevronRight" size={14} className="text-[var(--color-text-muted-cool)] transition-transform group-open:rotate-90" />
          </div>
        </summary>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-12 top-8 h-36 w-36 rounded-full bg-emerald-200/45 blur-2xl" />
        <div className="pointer-events-none absolute -right-14 bottom-8 h-40 w-40 rounded-full bg-amber-100/75 blur-3xl" />
        {/* Top accent line */}
        <div className="relative h-px w-full bg-linear-to-r from-transparent via-emerald-300/70 to-transparent" />

        <div className="px-4 pt-4 pb-5">
          {/* Header */}
          <div className="relative mb-4 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[17px] font-semibold tracking-tight text-[var(--color-text-primary-cool)]">Streak, XP e metas</h2>
            </div>
              <Link
                href="/progresso/streaks"
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-2.5 py-1 transition-colors hover:border-[var(--color-brand-ring)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)]"
              >
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400 tabular-nums">Nv. {xpBalance?.level ?? 1}</span>
            </Link>
          </div>

          {/* 3 main stat cards */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            {/* XP */}
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-white/4 p-3">
              <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-emerald-200/45 blur-xl" />
              <DSIcon name="zap" size={13} className="mb-2 text-emerald-400" />
              <p className="text-[9px] font-medium text-[var(--color-text-muted-cool)]">XP atual</p>
              <p className="mt-0.5 text-xl font-bold leading-none text-emerald-400 tabular-nums">{xpBalance?.balance ?? 0}</p>
              <div className="mt-2">
                <div className="mb-0.5 flex justify-between">
                  <span className="text-[9px] font-semibold text-[var(--color-text-muted-cool)] tabular-nums">Nv {xpBalance?.level ?? 1}</span>
                  <span className="text-[9px] font-semibold text-[var(--color-text-muted-cool)] tabular-nums">Nv {(xpBalance?.level ?? 1) + 1}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-1 rounded-full bg-linear-to-r from-emerald-500 to-emerald-300 transition-all duration-700"
                    style={{ width: `${Math.min(100, ((xpBalance?.balance ?? 0) % 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-white/4 p-3">
              <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-amber-200/50 blur-xl" />
              <DSIcon name="flame" size={13} className="mb-2 text-amber-400" />
              <p className="text-[9px] font-medium text-[var(--color-text-muted-cool)]">Streak</p>
              <div className="mt-0.5 flex items-end gap-1">
                <p className="text-xl font-bold leading-none text-amber-400 tabular-nums">{streak?.current_streak ?? 0}</p>
                <p className="mb-0.5 text-[10px] font-bold text-amber-400/70">dias</p>
              </div>
              <p className="mt-2 text-[9px] font-semibold text-[var(--color-text-muted-cool)] tabular-nums">Recorde: {streak?.longest_streak ?? 0} dias</p>
            </div>

            {/* Meta diária */}
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-white/4 p-3">
              <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-violet-200/45 blur-xl" />
              <DSIcon name="target" size={13} className="mb-2 text-violet-400" />
              <p className="text-[9px] font-medium text-[var(--color-text-muted-cool)]">Meta diária</p>
              <div className="mt-0.5 flex items-end gap-0.5">
                <p className="text-xl font-bold leading-none text-violet-400 tabular-nums">{dailyGoal?.earned_xp ?? 0}</p>
                <p className="mb-0.5 text-[11px] font-bold text-[var(--color-text-muted-cool)] tabular-nums">/{dailyGoal?.target_xp ?? 0}</p>
              </div>
              <p className="mt-2 text-[9px] font-semibold text-[var(--color-text-muted-cool)]">XP hoje</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative rounded-[var(--radius-lg)] border border-white/8 bg-white/4 p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DSIcon name="trophy" size={13} className="text-emerald-400" />
                <span className="text-[11px] font-bold text-[var(--color-text-secondary-cool)]">Meta do dia</span>
              </div>
              <span className="text-[12px] font-bold text-emerald-400 tabular-nums">{Math.round((dailyGoal?.progress ?? 0) * 100)}%</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-500 via-emerald-400 to-teal-300 transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(2, Math.min(100, Math.round((dailyGoal?.progress ?? 0) * 100)))}%`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[var(--color-text-muted-cool)] tabular-nums">{dailyGoal?.workouts_done ?? 0}/{dailyGoal?.workouts_target ?? 0} treinos hoje</span>
              <Link
                href="/progresso/streaks"
                className="text-[10px] font-bold text-[var(--color-brand-mint)] transition-colors hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)]"
              >
                Ver detalhes →
              </Link>
            </div>
          </div>

          {/* Weekly activity dots */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] font-bold text-[var(--color-text-muted-cool)]">Semana</p>
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
                        isToday ? 'text-white' : hasActivity ? 'text-emerald-400' : 'text-[var(--color-text-muted-cool)]'
                      )}
                      style={
                        isToday
                          ? { background: 'rgba(16,185,129,0.9)' }
                          : hasActivity
                          ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)' }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
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
          <h2 className="text-[17px] font-semibold tracking-tight text-[var(--color-text-primary-cool)]">Detalhes do treino de hoje</h2>
        </div>
      </div>

      {todayDay ? (
        <div className="relative mb-5 overflow-hidden rounded-[var(--radius-3xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)] p-4">
          <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-emerald-200/45 blur-3xl" />
          <div className="relative mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-white/10 bg-white/5 text-[var(--color-brand-mint)]">
                <DSIcon name="dumbbell" size={21} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-[var(--color-text-primary-cool)]">
                  Dia {plan?.current_day} — {todayDay.name}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-[var(--color-text-muted-cool)]">Plano do dia com carga estimada por IA</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-medium text-emerald-400">
              Hoje
            </span>
          </div>

          <div className="relative mb-4 rounded-[var(--radius-lg)] border border-amber-400/20 bg-amber-400/8 px-3 py-2.5 text-[11px] font-semibold leading-snug text-amber-300">
            Carga estimada por IA. Peça para o professor da academia revisar o peso de cada exercício antes de executar.
          </div>

          {!!todayMuscles.length && (
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-semibold text-[var(--color-text-muted-cool)]">
                Músculos alvo de hoje
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {todayMuscles.map((group) => (
                  <Link
                    key={group.name}
                    href={`/musculos/detalhe?muscle=${encodeURIComponent(group.name)}`}
                    className="relative z-10 shrink-0 cursor-pointer rounded-[var(--radius-lg)] border border-white/8 bg-white/4 p-2 transition-colors hover:border-[var(--color-brand-ring)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)]"
                  >
                    <Image
                      src={group.imageUrl || buildPlaceholderImage(group.name, group.tone)}
                      alt={`Grupo muscular ${group.name}`}
                      width={96}
                      height={80}
                      unoptimized
                      className="h-20 w-24 rounded-[var(--radius-lg)] object-cover"
                    />
                    <p className="mt-1 text-center text-[11px] font-bold text-[var(--color-text-secondary-cool)]">{group.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {isSuperAdmin && (
            <div className="relative mb-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/4 p-2.5 text-[10px] font-semibold text-[var(--color-text-muted-cool)]">
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
                className="relative z-10 flex min-h-20 w-full cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/4 p-2.5 text-left transition-colors hover:border-[var(--color-brand-ring)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)]"
              >
                <div className="relative shrink-0">
                  <Image
                    src={(ex.exercise_id ? exerciseById.get(ex.exercise_id)?.thumbnail_url : null) || buildPlaceholderImage(ex.exercise_name || ex.muscle_group || 'Exercício', toneByMuscle(ex.muscle_group))}
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
                      className="absolute -right-1 -bottom-1 h-7 w-7 rounded-lg border border-white bg-white object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary-cool)]">{ex.exercise_name || 'Exercício'}</p>
                  <p className="text-[10px] font-semibold text-[var(--color-text-muted-cool)]">
                    {ex.sets} séries · {ex.reps} · descanso {ex.rest_seconds}s
                  </p>
                  <p className="text-[10px] font-bold text-emerald-400 tabular-nums">
                    Carga estimada IA: {ex.weight_kg != null ? `${ex.weight_kg} kg` : 'ajustar com professor'}
                  </p>
                  {!!(ex.exercise_id ? exerciseById.get(ex.exercise_id)?.video_url_vertical : null) && (
                    <p className="text-[10px] font-semibold text-[var(--color-text-muted-cool)]">Vídeo disponível</p>
                  )}
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[var(--color-text-muted-cool)]">
                  <DSIcon name="chevronRight" size={14} />
                </span>
              </Link>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mb-5 rounded-[var(--radius-3xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)] p-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/10 bg-white/5 text-[var(--color-brand-mint)]">
            <DSIcon name="dumbbell" size={21} />
          </div>
          <p className="text-[14px] font-semibold text-[var(--color-text-primary-cool)]">Seu treino do dia ainda não foi gerado</p>
          <p className="mx-auto mt-1 max-w-70 text-[12px] font-semibold leading-snug text-[var(--color-text-muted-cool)]">
            Gere seu plano com IA para ver séries, descanso, carga estimada e músculos alvo.
          </p>
        </div>
      )}

      {/* Templates section */}
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-[var(--color-text-primary-cool)]">Biblioteca de treinos prontos</h2>
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
            className={cn(
              'min-h-10 shrink-0 rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-transform duration-150 ease-out active:scale-[0.99] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)]',
              difficulty === f.value
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-white/10 text-[var(--color-text-secondary-cool)] hover:border-[var(--color-brand-ring)]'
            )}
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

      {/* Error state — timeout/rede */}
      {!isLoading && templatesError && (
        <LoadFailed onRetry={() => refetchTemplates()} />
      )}

      {/* Templates grid */}
      {templates && templates.length > 0 && (
        <div className="space-y-3">
          {templates.map((t) => (
            <Link
              key={t.id}
              href={`/treinos/${t.id}`}
              className="group relative flex min-h-24 items-center gap-3 overflow-hidden rounded-[var(--radius-2xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)] p-4 transition-transform duration-150 ease-out active:scale-[0.99] motion-reduce:transition-none hover:border-[var(--color-brand-ring)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)]"
            >
              <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-emerald-200/45 blur-2xl transition-opacity group-hover:opacity-80" />
              <Image
                src={buildPlaceholderImage(t.name || t.category || 'Treino', toneByMuscle(t.category))}
                alt={`Placeholder treino ${t.name}`}
                width={56}
                height={56}
                unoptimized
                className="relative h-16 w-16 shrink-0 rounded-[var(--radius-lg)] object-cover"
              />

              <div className="relative min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <p className="truncate text-[14px] font-semibold text-[var(--color-text-primary-cool)]">{t.name}</p>
                  <DSIcon name="activity" size={12} className="text-emerald-400" />
                  {t.is_premium && (
                    <DSIcon name="lock" size={12} className="shrink-0 text-yellow-400" />
                  )}
                </div>
                <p className="mb-1.5 line-clamp-1 text-[11px] font-semibold text-[var(--color-text-muted-cool)]">{t.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getDifficultyColor(t.difficulty)}`}>
                    {getDifficultyLabel(t.difficulty)}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--color-text-muted-cool)] tabular-nums">
                    {t.total_days} dias · {t.estimated_duration_min}min
                  </span>
                </div>
              </div>

              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-[var(--color-text-muted-cool)]">
                <DSIcon name="chevronRight" size={16} />
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Empty */}
      {templates && templates.length === 0 && (
        <div className="rounded-[var(--radius-2xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)] p-8 text-center">
          <p className="text-[13px] font-bold text-[var(--color-text-muted-cool)]">Nenhum treino encontrado para esse filtro.</p>
        </div>
      )}
    </div>
    </div>
  )
}
