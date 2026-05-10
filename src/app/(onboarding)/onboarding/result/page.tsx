'use client'

/**
 * src/app/(onboarding)/onboarding/result/page.tsx
 *
 * Result Page — Plano gerado exibido ao usuário
 *
 * Mostra: resumo com stats, preview do Dia 1, CTA para paywall/signup
 * Dados vêm do sessionStorage (gravados pela loading page)
 */

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { useAuthStore } from '@/stores/auth-store'

// ─── Types (inline — evita import de workers no frontend) ───
interface PlanExercise {
  name: string
  muscle_group: string
  sets: number
  reps: string
  rest_seconds: number
  weight_suggestion_kg?: number
  notes?: string
}

interface PlanDay {
  day_number: number
  name: string
  focus: string
  exercises: PlanExercise[]
}

interface PlanResult {
  plan: {
    plan_name: string
    description: string
    estimated_calories_per_session?: number
    days: PlanDay[]
  }
  source: 'ai' | 'fallback'
  stats: {
    total_days: number
    total_exercises: number
    avg_exercises_per_day: number
    session_duration_minutes: number
    estimated_weekly_calories: number
  }
}

// ─── Label maps ───
const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Perder Peso',
  gain_muscle: 'Ganhar Massa',
  tone: 'Definição',
  health: 'Saúde',
  strength: 'Força',
  flexibility: 'Flexibilidade',
}

const MUSCLE_ICON: Record<string, DSIconName> = {
  chest: 'heart',
  back: 'shield',
  legs: 'footprints',
  shoulders: 'trendingUp',
  biceps: 'dumbbell',
  triceps: 'dumbbell',
  core: 'target',
  glutes: 'flame',
  cardio: 'activity',
  calves: 'footprints',
}

export default function OnboardingResultPage() {
  const router = useRouter()
  const data = useOnboardingStore((s) => s.data)
  const markCompleted = useOnboardingStore((s) => s.markCompleted)
  const [result, setResult] = useState<PlanResult | null>(null)
  const [mounted, setMounted] = useState(false)
  const [expandedDay, setExpandedDay] = useState<number>(1)

  // ─── Load from sessionStorage ───
  useEffect(() => {
    setMounted(true)
    try {
      const stored = sessionStorage.getItem('vfit_plan')
      if (stored) {
        setResult(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  // ─── Stats display ───
  const statsCards = useMemo(() => {
    if (!result) return []
    return [
      {
        icon: 'calendar' as DSIconName,
        value: `${result.stats.total_days}x`,
        label: 'por semana',
      },
      {
        icon: 'dumbbell' as DSIconName,
        value: String(result.stats.total_exercises),
        label: 'exercícios',
      },
      {
        icon: 'clock' as DSIconName,
        value: `${result.stats.session_duration_minutes}min`,
        label: 'por sessão',
      },
      {
        icon: 'flame' as DSIconName,
        value: `${result.stats.estimated_weekly_calories}`,
        label: 'kcal/semana',
      },
    ]
  }, [result])

  if (!mounted) return null

  if (!result) {
    return (
      <div className="vfit-flow-bg relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center text-white">
        <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/8">
          <DSIcon name="helpCircle" className="h-10 w-10 text-white/40" />
        </div>
        <h2 className="relative mb-2 text-xl font-bold text-white">
          Nenhum plano encontrado
        </h2>
        <p className="relative mb-8 text-sm text-slate-400">
          Parece que a geração expirou. Vamos recomeçar?
        </p>
        <Button onClick={() => router.push('/onboarding')}>
          Recomeçar Quiz
        </Button>
      </div>
    )
  }

  const { plan, stats } = result

  return (
    <div className="vfit-flow-bg relative min-h-dvh overflow-hidden pb-36 text-white">
      <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
      {/* ─── Header ─── */}
      <div className="relative px-6 pt-[calc(env(safe-area-inset-top)+48px)] pb-8">
        <div className="mx-auto max-w-md">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/8 px-3 py-1.5 text-[11px] font-bold uppercase text-emerald-200">
            <DSIcon name="sparkles" size={13} />
            Plano pronto
          </div>
          <h1 className="mb-3 text-4xl font-black leading-tight text-white">
            {plan.plan_name}
          </h1>
          <p className="text-sm leading-6 text-slate-400">
            {plan.description}
          </p>

          {/* ─── Goal badge ─── */}
          {data.goal && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/18 bg-emerald-300/8 px-3 py-1.5">
              <DSIcon name="target" className="h-3.5 w-3.5 text-brand-primary" />
              <span className="text-xs font-medium text-brand-primary">
                {GOAL_LABELS[data.goal] || data.goal}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-md space-y-6 px-6">
        {/* ─── Stats grid ─── */}
        <div className="grid grid-cols-4 gap-2">
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              className="vfit-flow-panel-soft flex flex-col items-center rounded-2xl p-3"
            >
              <DSIcon name={stat.icon} className="h-5 w-5 text-brand-primary" />
              <span className="mt-1 text-lg font-bold text-white">{stat.value}</span>
              <span className="text-center text-[10px] leading-tight text-slate-500">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ─── Days preview ─── */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-300 uppercase">
            Seus Treinos
          </h3>

          {/* Day tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {plan.days.map((day) => (
              <button
                key={day.day_number}
                onClick={() => setExpandedDay(day.day_number)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  expandedDay === day.day_number
                    ? 'bg-brand-primary text-bg-base shadow-[0_0_20px_rgba(34,197,94,0.25)]'
                    : 'border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10'
                }`}
              >
                Dia {day.day_number}
              </button>
            ))}
          </div>

          {/* Expanded day */}
          {plan.days
            .filter((d) => d.day_number === expandedDay)
            .map((day) => (
              <div key={day.day_number} className="space-y-2">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/10">
                    <span className="text-sm font-bold text-brand-primary">{day.day_number}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{day.name}</p>
                    <p className="text-xs text-slate-500">{day.exercises.length} exercícios</p>
                  </div>
                </div>

                {day.exercises.map((ex, i) => (
                  <div
                    key={`${day.day_number}-${i}`}
                    className="vfit-flow-panel-soft flex items-center gap-3 rounded-2xl p-3"
                  >
                    <DSIcon
                      name={MUSCLE_ICON[ex.muscle_group] || 'dumbbell'}
                      className="h-5 w-5 shrink-0 text-brand-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {ex.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {ex.sets}x{ex.reps}
                        {ex.weight_suggestion_kg ? ` · ${ex.weight_suggestion_kg}kg` : ''}
                        {ex.rest_seconds ? ` · ${ex.rest_seconds}s desc.` : ''}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Exercise notes */}
                {day.exercises.some((ex) => ex.notes) && (
                  <div className="vfit-flow-panel-soft mt-2 rounded-2xl p-3">
                    <p className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <DSIcon name="lightbulb" className="h-3.5 w-3.5" />
                      Dicas
                    </p>
                    {day.exercises
                      .filter((ex) => ex.notes)
                      .map((ex, i) => (
                        <p key={i} className="text-xs text-slate-400">
                          • <strong>{ex.name}:</strong> {ex.notes}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* ─── Estimated results ─── */}
        <div className="vfit-flow-panel rounded-3xl p-5">
          <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-white">
            <DSIcon name="target" className="h-4 w-4 text-brand-primary" />
            Resultados Estimados em 4 Semanas
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Sessões completadas</span>
              <span className="text-sm font-semibold text-brand-primary">{stats.total_days * 4}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Calorias queimadas</span>
              <span className="text-sm font-semibold text-brand-primary">
                {(stats.estimated_weekly_calories * 4).toLocaleString('pt-BR')} kcal
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Tempo investido</span>
              <span className="text-sm font-semibold text-brand-primary">
                {Math.round((stats.session_duration_minutes * stats.total_days * 4) / 60)}h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom CTA ─── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-bg-base/88 px-6 pb-8 pt-4 backdrop-blur-2xl">
        <div className="mx-auto max-w-md space-y-2">
          {useAuthStore.getState().isAuthenticated ? (
            /* Já logado — opções: ver treino grátis ou fazer upgrade */
            <>
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  markCompleted()
                  router.push('/onboarding/paywall')
                }}
              >
                <DSIcon name="crown" className="h-4 w-4" />
                Desbloquear Premium
              </Button>
              <button
                onClick={() => {
                  markCompleted()
                  router.push('/treinos')
                }}
                className="w-full py-2 text-center text-xs text-text-muted hover:text-text-secondary"
              >
                Continuar gratuitamente
              </button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  markCompleted()
                  router.push('/onboarding/notifications')
                }}
              >
                <DSIcon name="sparkles" className="h-4 w-4" />
                Continuar — Ativar Meu Plano
              </Button>
              <button
                onClick={() => {
                  markCompleted()
                  router.push('/login?from=onboarding&plan=free')
                }}
                className="w-full py-2 text-center text-xs text-text-muted hover:text-text-secondary"
              >
                Continuar gratuitamente
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
