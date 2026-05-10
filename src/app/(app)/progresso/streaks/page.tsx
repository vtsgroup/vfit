/**
 * src/app/(app)/progresso/streaks/page.tsx
 *
 * STREAKS — Sequência de treinos, heatmap anual, conquistas de consistência
 */

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useStreak, useHeatmap } from '@/hooks/use-progress'
import { StreakCalendar } from '@/components/progresso'
import { cn } from '@/lib/utils'

type Milestone = {
  days: number
  label: string
  icon: DSIconName
  color: string
  bg: string
}

const MILESTONES: ReadonlyArray<Milestone> = [
  { days: 3, label: '3 dias', icon: 'flame', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100' },
  { days: 7, label: '1 semana', icon: 'zap', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
  { days: 14, label: '2 semanas', icon: 'dumbbell', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  { days: 30, label: '1 mês', icon: 'trophy', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  { days: 60, label: '2 meses', icon: 'sparkles', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
  { days: 90, label: '3 meses', icon: 'crown', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
  { days: 180, label: '6 meses', icon: 'award', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
  { days: 365, label: '1 ano', icon: 'medal', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
] as const

const ROUTINE_ACTIONS = [
  { label: 'Fazer treino', href: '/treinos', icon: 'playCircle' as DSIconName, tone: 'emerald' },
  { label: 'Ver evolução', href: '/progresso', icon: 'trendingUp' as DSIconName, tone: 'sky' },
  { label: 'Ajustar meta', href: '/ia?action=goals', icon: 'target' as DSIconName, tone: 'violet' },
] as const

const toneClasses: Record<(typeof ROUTINE_ACTIONS)[number]['tone'], string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
}

export default function StreaksPage() {
  const router = useRouter()
  const { data: streak, isLoading: loadingStreak } = useStreak()
  const { data: heatmap, isLoading: loadingHeatmap } = useHeatmap()

  const currentStreak = streak?.current_streak || 0
  const bestStreak = streak?.best_streak || 0
  const totalDays = streak?.total_workout_days || 0
  const isLoading = loadingStreak || loadingHeatmap

  const nextMilestone = MILESTONES.find((milestone) => milestone.days > currentStreak)
  const prevMilestone = [...MILESTONES].reverse().find((milestone) => milestone.days <= currentStreak)
  const startDays = prevMilestone?.days || 0
  const progressToNext = nextMilestone
    ? Math.min(100, Math.round(((currentStreak - startDays) / (nextMilestone.days - startDays)) * 100))
    : 100
  const daysRemaining = nextMilestone ? Math.max(0, nextMilestone.days - currentStreak) : 0
  const weeklyPace = Math.min(7, heatmap?.days?.slice(-7).filter((day) => day.count > 0).length || 0)

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-linear-to-b from-white via-slate-50 to-white px-4 pt-0 pb-28 text-slate-950">
      <header className="vfit-app-hero-gradient relative -mx-4 -mt-px mb-5 overflow-hidden rounded-b-[34px] px-4 pt-5 pb-6 text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-white/7 to-transparent" />
        <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Voltar"
            className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/12 bg-white/8 text-white/75 shadow-glass-inset-md transition-all hover:bg-white/12 hover:text-white active:scale-95"
          >
            <DSIcon name="arrowLeft" size={20} />
          </button>

          <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.85)]" />
            Consistência
          </span>

          <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/12 bg-white/7 text-amber-200">
            <DSIcon name="flame" size={19} />
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-[auto_1fr] items-center gap-4">
          <div className="flex h-22 w-22 items-center justify-center rounded-[28px] border border-orange-200/25 bg-linear-to-b from-amber-200 via-orange-400 to-orange-600 text-orange-950 shadow-[0_18px_42px_-22px_rgba(251,146,60,0.9),inset_0_1px_0_rgba(255,255,255,0.42)]">
            <DSIcon name="flame" size={39} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200">Sequência ativa</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-[58px] font-black leading-none text-white tabular-nums">{currentStreak}</span>
              <span className="pb-2 text-[14px] font-bold text-slate-300">{currentStreak === 1 ? 'dia' : 'dias'}</span>
            </div>
            <p className="mt-1 text-[13px] font-medium leading-snug text-slate-300">
              {nextMilestone ? `${daysRemaining} dias para ${nextMilestone.label}` : 'Todas as metas de sequência foram liberadas.'}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-6 rounded-[24px] border border-white/10 bg-white/7 p-3 shadow-glass-inset-md">
          <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span>{prevMilestone?.label || 'Início'}</span>
            <span>{nextMilestone?.label || 'Lenda VFIT'}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-300 via-lime-300 to-amber-300 shadow-[0_0_22px_rgba(110,231,183,0.45)] transition-all duration-700"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex min-h-80 items-center justify-center rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]">
          <DSIcon name="loader" size={26} className="animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          <section className="mb-5 grid grid-cols-3 gap-3">
            <MetricCard icon="flame" label="Atual" value={currentStreak} tone="orange" />
            <MetricCard icon="trophy" label="Recorde" value={bestStreak} tone="amber" />
            <MetricCard icon="calendarCheck" label="Ativos" value={totalDays} tone="emerald" />
          </section>

          <section className="mb-5 rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Ritual da semana</p>
                <h2 className="mt-1 text-[18px] font-black text-slate-950">Mantenha o fogo aceso</h2>
                <p className="mt-1 text-[12px] font-medium leading-snug text-slate-500">{weeklyPace}/7 dias com atividade recente.</p>
              </div>
              <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-[11px] font-black text-emerald-700">
                <DSIcon name="zap" size={13} />
                {progressToNext}%
              </span>
            </div>

            <div className="grid gap-2">
              {ROUTINE_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex min-h-14 items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50/80 px-3 transition-all hover:border-emerald-200 hover:bg-white active:scale-[0.99]"
                >
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-[14px] ring-1', toneClasses[action.tone])}>
                    <DSIcon name={action.icon} size={18} />
                  </div>
                  <span className="flex-1 text-[13px] font-black text-slate-900">{action.label}</span>
                  <DSIcon name="chevronRight" size={17} className="text-slate-400" />
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-5 rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-600">Mapa anual</p>
                <h2 className="text-[17px] font-black text-slate-950">Dias em movimento</h2>
              </div>
              <DSIcon name="calendarDays" size={20} className="text-emerald-600" />
            </div>
            <StreakCalendar days={heatmap?.days || []} />
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600">Marcos</p>
                <h2 className="text-[17px] font-black text-slate-950">Conquistas de sequência</h2>
              </div>
              <DSIcon name="award" size={20} className="text-amber-500" />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {MILESTONES.map((milestone) => {
                const achieved = bestStreak >= milestone.days
                return (
                  <div
                    key={milestone.days}
                    className={cn(
                      'flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-[18px] border p-2 text-center transition-all',
                      achieved ? milestone.bg : 'border-slate-200 bg-slate-50 opacity-55'
                    )}
                  >
                    <DSIcon name={milestone.icon} size={20} className={achieved ? milestone.color : 'text-slate-400'} />
                    <span className={cn('text-[10px] font-black leading-tight', achieved ? milestone.color : 'text-slate-400')}>
                      {milestone.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function MetricCard({ icon, label, value, tone }: { icon: DSIconName; label: string; value: number; tone: 'orange' | 'amber' | 'emerald' }) {
  const styles = {
    orange: 'bg-orange-50 text-orange-600 ring-orange-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  }[tone]

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-3 text-center shadow-[0_16px_34px_-30px_rgba(15,23,42,0.45)]">
      <div className={cn('mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-[14px] ring-1', styles)}>
        <DSIcon name={icon} size={18} />
      </div>
      <p className="text-[22px] font-black leading-none text-slate-950 tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  )
}