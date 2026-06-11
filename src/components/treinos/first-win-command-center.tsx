'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { hapticLight } from '@/lib/haptics'
import type { CurrentPlan, PlanDay } from '@/hooks/use-plans'
import type { StreakResponse, DailyGoalResponse, XPBalance } from '@/hooks/use-xp'

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
    return { workedOutToday: false, daysSince: 2, urgencyLevel: 'warning', urgencyText: '2 dias sem treinar — volte agora!', streakIcon: 'alertTriangle' }
  } else {
    return { workedOutToday: false, daysSince: diffDays, urgencyLevel: 'critical', urgencyText: `${diffDays} dias parado — hora de voltar!`, streakIcon: 'alertCircle' }
  }
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

export function FirstWinCommandCenter({
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
    <section className="vfit-app-hero-gradient -mx-4 -mt-px mb-4 overflow-hidden rounded-b-[28px] border-b border-white/8 text-white">
      <div className="relative px-4 pt-4 pb-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#0b1d36] via-[#0b1d36]/72 to-transparent" />
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
                    {todayDay.muscle_groups.slice(0, 3).map((m) => {
                      const MUSCLE_PT: Record<string, string> = {
                        chest: 'Peito', back: 'Costas', shoulders: 'Ombros', biceps: 'Bíceps',
                        triceps: 'Tríceps', legs: 'Pernas', quadriceps: 'Quadríceps', hamstrings: 'Isquiotibiais',
                        glutes: 'Glúteos', calves: 'Panturrilhas', abs: 'Abdômen', core: 'Core',
                        forearms: 'Antebraços', traps: 'Trapézio', full_body: 'Corpo Total',
                        lats: 'Dorsais', rhomboids: 'Romboides', lower_back: 'Lombar',
                        hip_flexors: 'Flexores do Quadril', adductors: 'Adutores',
                      }
                      return MUSCLE_PT[m.toLowerCase()] || MUSCLE_PT[m.toLowerCase().replace(/ /g, '_')] || m
                    }).join(' · ') || 'Treino personalizado'}
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
                  className="h-11 w-full justify-center gap-2 rounded-[13px] px-5 text-[15px] font-black tracking-tight"
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
