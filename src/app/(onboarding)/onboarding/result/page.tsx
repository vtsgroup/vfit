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
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-primary px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/8">
          <DSIcon name="helpCircle" className="h-10 w-10 text-white/40" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-text-primary">
          Nenhum plano encontrado
        </h2>
        <p className="mb-8 text-sm text-text-secondary">
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
    <div className="min-h-dvh bg-bg-primary pb-32">
      {/* ─── Header ─── */}
      <div className="relative overflow-hidden bg-linear-to-b from-white/5 to-transparent px-6 pt-14 pb-8">
        <div className="mx-auto max-w-md">
          <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-brand-primary">
            <DSIcon name="sparkles" className="h-4 w-4" />
            Seu plano está pronto!
          </div>
          <h1 className="mb-2 text-2xl font-bold text-text-primary">
            {plan.plan_name}
          </h1>
          <p className="text-sm text-text-secondary">
            {plan.description}
          </p>

          {/* ─── Goal badge ─── */}
          {data.goal && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1">
              <DSIcon name="target" className="h-3.5 w-3.5 text-brand-primary" />
              <span className="text-xs font-medium text-brand-primary">
                {GOAL_LABELS[data.goal] || data.goal}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-6 px-6">
        {/* ─── Stats grid ─── */}
        <div className="grid grid-cols-4 gap-2">
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-2xl border border-border-primary bg-bg-secondary p-3"
            >
              <DSIcon name={stat.icon} className="h-5 w-5 text-brand-primary" />
              <span className="mt-1 text-lg font-bold text-text-primary">{stat.value}</span>
              <span className="text-[10px] text-text-muted">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ─── Days preview ─── */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-text-secondary uppercase tracking-wider">
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
                    ? 'bg-brand-primary text-white'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8">
                    <span className="text-sm font-bold text-brand-primary">{day.day_number}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{day.name}</p>
                    <p className="text-xs text-text-muted">{day.exercises.length} exercícios</p>
                  </div>
                </div>

                {day.exercises.map((ex, i) => (
                  <div
                    key={`${day.day_number}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-border-primary bg-bg-secondary p-3"
                  >
                    <DSIcon
                      name={MUSCLE_ICON[ex.muscle_group] || 'dumbbell'}
                      className="h-5 w-5 shrink-0 text-brand-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {ex.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {ex.sets}x{ex.reps}
                        {ex.weight_suggestion_kg ? ` · ${ex.weight_suggestion_kg}kg` : ''}
                        {ex.rest_seconds ? ` · ${ex.rest_seconds}s desc.` : ''}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Exercise notes */}
                {day.exercises.some((ex) => ex.notes) && (
                  <div className="mt-2 rounded-xl bg-amber-500/5 p-3">
                    <p className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <DSIcon name="lightbulb" className="h-3.5 w-3.5" />
                      Dicas
                    </p>
                    {day.exercises
                      .filter((ex) => ex.notes)
                      .map((ex, i) => (
                        <p key={i} className="text-xs text-text-secondary">
                          • <strong>{ex.name}:</strong> {ex.notes}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* ─── Estimated results ─── */}
        <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4">
          <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
            <DSIcon name="target" className="h-4 w-4 text-brand-primary" />
            Resultados Estimados em 4 Semanas
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Sessões completadas</span>
              <span className="text-sm font-semibold text-brand-primary">{stats.total_days * 4}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Calorias queimadas</span>
              <span className="text-sm font-semibold text-brand-primary">
                {(stats.estimated_weekly_calories * 4).toLocaleString('pt-BR')} kcal
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Tempo investido</span>
              <span className="text-sm font-semibold text-brand-primary">
                {Math.round((stats.session_duration_minutes * stats.total_days * 4) / 60)}h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom CTA ─── */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border-primary bg-bg-primary/95 px-6 pb-8 pt-4 backdrop-blur-lg">
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
