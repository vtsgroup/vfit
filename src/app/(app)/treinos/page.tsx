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

import { useState, useMemo, useEffect, memo } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import { KPICard } from '@/components/progresso'
import {
  useWorkoutTemplates,
  getDifficultyLabel,
  getDifficultyColor,
} from '@/hooks/use-workout-templates'
import { hapticLight } from '@/lib/haptics'
import { useCurrentPlan, useAutoGeneratePlan } from '@/hooks/use-plans'
import { useMealsToday, useNutritionTargets } from '@/hooks/use-vfit-nutrition'
import { useSelfAssessments, getBMIColor, useAutoAssessmentFromOnboarding } from '@/hooks/use-self-assessments'
import { useWorkoutLogs } from '@/hooks/use-workouts'
import { useDailyGoal, useStreak, useXPBalance } from '@/hooks/use-xp'
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

function getMuscleImageUrl(mg?: {
  image_female_url?: string | null
  image_male_url?: string | null
  image_url?: string | null
} | null) {
  return mg?.image_female_url || mg?.image_male_url || mg?.image_url || null
}

// ── T7.5 — Progress Ring SVG (T11.8: memo) ──────────────────────────
const ProgressRing = memo(function ProgressRing({
  value,
  max,
  size = 52,
  stroke = 5,
  color = '#10B981',
  children,
}: {
  value: number
  max: number
  size?: number
  stroke?: number
  color?: string
  children?: React.ReactNode
}) {
  const radius = (size - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const dashOffset = circumference * (1 - pct)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
})

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
        imageUrl: getMuscleImageUrl(match),
        tone: toneByMuscle(name),
      }
    })
  }, [todayDay?.muscle_groups, muscleByName])

  const totals = mealsData?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const planPct = plan && plan.total_days > 0 ? Math.round((plan.current_day / plan.total_days) * 100) : 0
  const calPct = targets.calories > 0 ? Math.round((totals.calories / targets.calories) * 100) : 0
  const proteinPct = targets.protein > 0 ? Math.round((totals.protein / targets.protein) * 100) : 0
  const carbsPct = targets.carbs > 0 ? Math.round((totals.carbs / targets.carbs) * 100) : 0

  return (
    <div className="mx-auto max-w-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300 px-4 pt-0 pb-24">
      {/* ─── Header ─── */}
      <div className="-mx-4 mb-5 rounded-b-3xl border-b border-white/8 bg-slate-950/95 px-4 py-5 backdrop-blur-md">
        <p className="text-xs font-semibold text-emerald-400">
          {(() => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite' })()}
        </p>
        <h1 className="bg-linear-to-r from-brand-primary to-brand-mint bg-clip-text text-4xl font-black text-transparent">
          Treinos
        </h1>
        <p className="mt-1 text-xs text-emerald-200/80">Recursos personalizados para você</p>
      </div>

      {/* T7.3 — Card "Treino de Hoje" */}
      {todayDay && (
        <Link href="/plano" className="mb-4 block" onClick={() => hapticLight()}>
          <GlassCard variant="ultra" padding="md" hoverLift className="rounded-2xl border border-brand-primary/18">
            <div className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-brand-primary/80" />
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/15">
                  <DSIcon name="dumbbell" size={14} className="text-brand-primary" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                  Treino de Hoje · Dia {plan?.current_day}
                </span>
              </div>
              <DSIcon name="chevronRight" size={14} className="text-text-muted" />
            </div>
            <p className="mb-1.5 text-[15px] font-bold text-text-primary">{todayDay.name}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-text-secondary">
              {todayDay.muscle_groups.length > 0 && (
                <span>{todayDay.muscle_groups.slice(0, 3).join(' · ')}</span>
              )}
              {todayDay.muscle_groups.length > 0 && <span className="text-text-muted">·</span>}
              <span>{todayDay.estimated_duration_min}min</span>
              <span className="text-text-muted">·</span>
              <span>{todayDay.exercises.length} exercícios</span>
            </div>
            <Button size="sm" className="mt-3 w-full">
              <DSIcon name="play" size={14} />
              Continuar treino
            </Button>
          </GlassCard>
        </Link>
      )}

      {/* KPI cards ultra-modernos */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <KPICard
          icon="footprints"
          label="Plano"
          value={planPct}
          unit="%"
          color="blue"
          trend={{ delta: Math.max(1, planPct - 50), isPositive: planPct >= 50 }}
        />
        <KPICard
          icon="flask"
          label="Proteína"
          value={Math.round(totals.protein)}
          unit="g"
          color="cyan"
          trend={{ delta: Math.abs(proteinPct - 100), isPositive: proteinPct >= 100 }}
        />
        <KPICard
          icon="moon"
          label="Carboidratos"
          value={Math.round(totals.carbs)}
          unit="g"
          color="purple"
          trend={{ delta: Math.abs(carbsPct - 100), isPositive: carbsPct >= 100 }}
        />
        <KPICard
          icon="flame"
          label="Calorias"
          value={Math.round(totals.calories)}
          unit="kcal"
          color="amber"
          trend={{ delta: Math.abs(calPct - 100), isPositive: calPct >= 100 }}
        />
      </div>

      {/* T5.9 — Assessment summary card (pós-onboarding) */}
      {latestAssessment ? (
        <Link href="/avaliacoes" className="mb-5 block">
          <GlassCard variant="depth" padding="md" hoverLift className="rounded-2xl border border-violet-400/18 bg-linear-to-br from-violet-500/8 to-transparent">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15">
                  <DSIcon name="clipboardList" size={14} className="text-violet-400" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                  Sua Avaliação
                </span>
              </div>
              <DSIcon name="chevronRight" size={14} className="text-text-muted" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[16px] font-bold text-text-primary">
                  {latestAssessment.weight_kg}
                  <span className="ml-0.5 text-[10px] font-normal text-text-muted">kg</span>
                </p>
                <p className="text-[10px] text-text-muted">Peso</p>
              </div>
              <div>
                <p className={`text-[16px] font-bold ${getBMIColor(latestAssessment.bmi)}`}>
                  {latestAssessment.bmi}
                </p>
                <p className="text-[10px] text-text-muted">IMC</p>
              </div>
              <div>
                <p className="text-[16px] font-bold text-text-primary">
                  {latestAssessment.body_fat_percentage != null
                    ? `${latestAssessment.body_fat_percentage}%`
                    : '—'}
                </p>
                <p className="text-[10px] text-text-muted">Gordura</p>
              </div>
            </div>
            {latestAssessment.bmi_category && (
              <p className="mt-2 text-center text-[11px] text-text-muted">
                {latestAssessment.bmi_category}
              </p>
            )}
          </GlassCard>
        </Link>
      ) : (
        <Link href="/avaliacoes/nova" className="mb-5 block">
          <div className="glass-card flex items-center gap-3 rounded-2xl p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <DSIcon name="clipboardList" size={20} className="text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-text-primary">Fazer Avaliação Física</p>
              <p className="text-[11px] text-text-muted">Acompanhe seu progresso corporal</p>
            </div>
            <DSIcon name="chevronRight" size={14} className="text-text-muted" />
          </div>
        </Link>
      )}

      {/* Convite/Vínculo com Personal Trainer */}
      <div className="mb-5 rounded-2xl border border-brand-primary/20 bg-linear-to-br from-brand-primary/8 to-transparent p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">Personal Trainer</p>
            <p className="mt-1 text-[13px] text-text-secondary">
              Convide um personal para sua avaliação completa ou vincule por código.
            </p>
            {studentProfile?.personal_name && (
              <p className="mt-1 text-[12px] font-semibold text-success">
                Vinculado com: {studentProfile.personal_name}
              </p>
            )}
          </div>
          <DSIcon name="userPlus" size={18} className="text-brand-primary" />
        </div>

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
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(personalInviteLink)}
          >
            <DSIcon name="copy" size={14} />
            Copiar link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`mailto:?subject=${encodeURIComponent('Convite para VFIT — Personal Trainer')}&body=${encodeURIComponent(`Olá! Quero te convidar para acompanhar minha avaliação completa no VFIT.\n\nCadastre-se aqui: ${personalInviteLink}`)}`, '_blank')}
          >
            <DSIcon name="mail" size={14} />
            Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Quero te convidar para me acompanhar no VFIT e realizar minha avaliação completa.\n\nCadastro: ${personalInviteLink}`)}`, '_blank')}
          >
            <DSIcon name="share2" size={14} />
            WhatsApp
          </Button>
          <Button
            variant={showPersonalQr ? 'secondary' : 'outline'}
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
              <img
                src={personalInviteQrUrl}
                alt="QR Code convite personal"
                className="h-44 w-44 rounded-xl border border-white/12 bg-white p-2"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-xl border border-white/12 bg-white/6">
                <DSIcon name="loader" size={20} className="animate-spin text-text-muted" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Link
          href="/plano"
          className="group glass-card flex flex-col gap-2 rounded-2xl p-4 transition-all hover:border-brand-primary/20"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/12">
            <DSIcon name="sparkles" size={20} className="text-brand-primary" />
          </div>
          <p className="text-[13px] font-bold text-text-primary">Criar com IA</p>
          <p className="text-[11px] text-text-muted">Treino personalizado</p>
        </Link>

        <Link
          href="/plano"
          className="group glass-card flex flex-col gap-2 rounded-2xl p-4 transition-all hover:border-info/20"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
            <DSIcon name="clipboardList" size={20} className="text-brand-primary" />
          </div>
          <p className="text-[13px] font-bold text-text-primary">Meu Plano</p>
          <p className="text-[11px] text-text-muted">Treino atual ativo</p>
        </Link>
      </div>

      {/* T8.9 — Upgrade prompt após 3 treinos no free */}
      {showUpgradePrompt && (
        <Link href="/perfil/assinatura" className="mb-5 block">
          <div className="glass-card rounded-2xl border border-amber-400/20 bg-linear-to-br from-amber-400/8 to-transparent p-4">
            <div className="mb-2 flex items-center gap-2">
              <DSIcon name="sparkles" size={16} className="text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Parabéns! {workoutCount} treinos concluídos
              </span>
            </div>
            <p className="mb-3 text-[13px] font-semibold text-text-primary">
              Você está indo bem! Desbloqueie planos ilimitados com o Premium.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text-muted">
                A partir de R$ 29,90/mês
              </span>
              <span className="rounded-xl bg-amber-400 px-3 py-1.5 text-[12px] font-bold text-black">
                Ver planos
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Gamificação — Streak + XP + Meta diária */}
      <div className="mb-5 rounded-2xl border border-emerald-400/25 bg-linear-to-br from-emerald-500/10 via-bg-secondary to-transparent p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Gamificação VFIT</p>
            <h2 className="mt-1 text-[15px] font-bold text-text-primary">Streak, XP e metas do dia</h2>
          </div>
          <span className="rounded-full border border-emerald-400/35 bg-emerald-500/14 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
            VFIT Coin (em breve)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-border-light bg-bg-secondary/70 p-2.5">
            <p className="text-[10px] text-text-muted">XP atual</p>
            <p className="mt-1 text-[15px] font-extrabold text-emerald-300">{xpBalance?.balance ?? 0}</p>
            <p className="text-[10px] text-text-secondary">Nível {xpBalance?.level ?? 1}</p>
          </div>
          <div className="rounded-xl border border-border-light bg-bg-secondary/70 p-2.5">
            <p className="text-[10px] text-text-muted">Streak</p>
            <p className="mt-1 text-[15px] font-extrabold text-amber-300">{streak?.current_streak ?? 0} dias</p>
            <p className="text-[10px] text-text-secondary">Máx: {streak?.longest_streak ?? 0}</p>
          </div>
          <div className="rounded-xl border border-border-light bg-bg-secondary/70 p-2.5">
            <p className="text-[10px] text-text-muted">Meta diária</p>
            <p className="mt-1 text-[15px] font-extrabold text-violet-300">
              {dailyGoal?.earned_xp ?? 0}/{dailyGoal?.target_xp ?? 0}
            </p>
            <p className="text-[10px] text-text-secondary">XP de hoje</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-border-light bg-bg-secondary/65 p-2.5">
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-text-secondary">
            <span>Progresso da meta do dia</span>
            <span>{Math.round((dailyGoal?.progress ?? 0) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-black/20">
            <div
              className="h-2 rounded-full bg-linear-to-r from-emerald-400 to-brand-primary transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, Math.round((dailyGoal?.progress ?? 0) * 100)))}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-text-muted">
            <span>{dailyGoal?.workouts_done ?? 0}/{dailyGoal?.workouts_target ?? 0} treinos hoje</span>
            <Link href="/progresso/streaks" className="font-semibold text-emerald-300 hover:text-emerald-200">
              Ver detalhes
            </Link>
          </div>
        </div>
      </div>

      {/* Treino de hoje (IA) */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-text-primary">Treinos Prontos de Hoje (IA)</h2>
      </div>

      {todayDay ? (
        <div className="mb-5 rounded-2xl border border-brand-primary/20 bg-linear-to-br from-brand-primary/8 to-transparent p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-bold text-text-primary">
              Dia {plan?.current_day} — {todayDay.name}
            </p>
            <span className="rounded-full bg-brand-primary/20 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
              Hoje
            </span>
          </div>

          <p className="mb-3 text-[11px] text-amber-700 dark:text-amber-300">
            Carga estimada por IA. Peça para o professor da academia revisar o peso de cada exercício antes de executar.
          </p>

          {!!todayMuscles.length && (
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Músculos alvo de hoje
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {todayMuscles.map((group) => (
                  <Link
                    key={group.name}
                    href={`/musculos/detalhe?muscle=${encodeURIComponent(group.name)}`}
                    className="relative z-10 shrink-0 cursor-pointer rounded-xl border border-border-light bg-bg-secondary/70 p-2 transition-colors hover:bg-bg-secondary"
                  >
                    <img
                      src={group.imageUrl || buildPlaceholderImage(group.name, group.tone)}
                      alt={`Grupo muscular ${group.name}`}
                      className="h-20 w-24 rounded-lg object-cover"
                    />
                    <p className="mt-1 text-center text-[11px] text-text-secondary">{group.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {isSuperAdmin && (
            <div className="mb-3 rounded-lg border border-border-light bg-bg-secondary/60 p-2.5 text-[10px] text-text-secondary">
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

          <div className="space-y-2">
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
                className="relative z-10 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border-light bg-bg-secondary/70 p-2.5 text-left transition-colors hover:bg-bg-secondary"
              >
                <div className="relative shrink-0">
                  <img
                    src={exerciseById.get(ex.exercise_id)?.thumbnail_url || buildPlaceholderImage(ex.exercise_name || ex.muscle_group || 'Exercício', toneByMuscle(ex.muscle_group))}
                    alt={ex.exercise_name || 'Exercício'}
                    className="h-12 w-16 rounded-lg object-cover"
                  />
                  {!!ex.muscle_group && (
                    <img
                      src={getMuscleImageUrl(muscleByName.get(normalizeText(ex.muscle_group))) || buildPlaceholderImage(ex.muscle_group, toneByMuscle(ex.muscle_group))}
                      alt={`Músculo ${ex.muscle_group}`}
                      className="absolute -right-1 -bottom-1 h-6 w-6 rounded-md border border-border-light bg-bg-secondary object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-text-primary">{ex.exercise_name || 'Exercício'}</p>
                  <p className="text-[10px] text-text-muted">
                    {ex.sets} séries · {ex.reps} · descanso {ex.rest_seconds}s
                  </p>
                  <p className="text-[10px] text-brand-primary">
                    Carga estimada IA: {ex.weight_kg != null ? `${ex.weight_kg} kg` : 'ajustar com professor'}
                  </p>
                  {!!exerciseById.get(ex.exercise_id)?.video_url_vertical && (
                    <p className="text-[10px] text-text-muted">Vídeo disponível</p>
                  )}
                </div>
                <DSIcon name="chevronRight" size={14} className="text-text-muted" />
              </Link>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mb-5 rounded-2xl border border-border-light bg-bg-secondary/60 p-4 text-[12px] text-text-muted">
          Ainda não há treino do dia gerado. Gere seu plano com IA para ver o treino pronto de hoje.
        </div>
      )}

      {/* Templates section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-text-primary">Biblioteca de Treinos Prontos</h2>
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
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all ${
              difficulty === f.value
                ? 'bg-brand-primary text-black'
                : 'bg-white/5 text-text-secondary hover:bg-white/8'
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
              className="glass-card group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-transparent p-4 transition-all hover:border-white/16"
            >
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-brand-primary/10 blur-2xl transition-opacity group-hover:opacity-80" />
              <img
                src={buildPlaceholderImage(t.name || t.category || 'Treino', toneByMuscle(t.category))}
                alt={`Placeholder treino ${t.name}`}
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <p className="truncate text-[14px] font-bold text-text-primary">{t.name}</p>
                  <DSIcon name="activity" size={12} className="text-brand-primary/80" />
                  {t.is_premium && (
                    <DSIcon name="lock" size={12} className="shrink-0 text-yellow-400" />
                  )}
                </div>
                <p className="mb-1.5 line-clamp-1 text-[11px] text-text-muted">{t.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getDifficultyColor(t.difficulty)}`}>
                    {getDifficultyLabel(t.difficulty)}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {t.total_days} dias · {t.estimated_duration_min}min
                  </span>
                </div>
              </div>

              <DSIcon name="chevronRight" size={16} className="shrink-0 text-text-muted" />
            </Link>
          ))}
        </div>
      )}

      {/* Empty */}
      {templates && templates.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-[13px] text-text-muted">Nenhum treino encontrado para esse filtro.</p>
        </div>
      )}
    </div>
  )
}
