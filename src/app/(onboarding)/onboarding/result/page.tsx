'use client'

/**
 * src/app/(onboarding)/onboarding/result/page.tsx
 *
 * Result Page — Plano gerado exibido ao usuário
 * Ultra-modern redesign: Glass card + animated counters + staggered features
 *
 * Mostra: resumo com stats, preview do Dia 1, CTA para paywall/signup
 * Dados vêm do sessionStorage (gravados pela loading page)
 */

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { useAuthStore } from '@/stores/auth-store'
import {
  GlassCard,
  AnimatedCounter,
  AnimatedCheckmark,
  StaggerContainer,
  MeshGradientBg,
  FloatingOrbs,
} from '@/components/onboarding/onboarding-animations'

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
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center text-white bg-slate-950">
        <MeshGradientBg animate />
        <FloatingOrbs />
        <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 12 }}
            className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-300/20 bg-amber-300/10 mx-auto"
          >
            <DSIcon name="helpCircle" className="h-10 w-10 text-amber-400" />
          </motion.div>
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
      </div>
    )
  }

  const { plan, stats } = result

  return (
    <div className="relative min-h-dvh overflow-hidden pb-40 text-white bg-slate-950">
      {/* ─── Background Elements ─── */}
      <MeshGradientBg animate />
      <FloatingOrbs />
      <div className="vfit-flow-grid pointer-events-none absolute inset-0" />

      {/* ─── Top light gradient ─── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-white/5 to-transparent" />

      {/* ─── Header ─── */}
      <div className="relative z-10 px-6 pt-[calc(env(safe-area-inset-top)+48px)] pb-8">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold uppercase text-emerald-200 backdrop-blur-sm"
          >
            <DSIcon name="sparkles" size={13} />
            30 Dias Grátis
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-3 text-4xl font-black leading-tight text-white"
          >
            {plan.plan_name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm leading-6 text-slate-300"
          >
            {plan.description}
          </motion.p>

          {/* ─── Goal badge ─── */}
          {data.goal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 backdrop-blur-sm"
            >
              <DSIcon name="target" className="h-3.5 w-3.5 text-brand-primary" />
              <span className="text-xs font-medium text-brand-primary">
                {GOAL_LABELS[data.goal] || data.goal}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-md space-y-6 px-6">
        {/* ─── Stats grid with animated counters ─── */}
        <div className="grid grid-cols-4 gap-2">
          {statsCards.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
              className="flex flex-col items-center rounded-2xl backdrop-blur-md border border-emerald-500/20 p-3"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.4) 100%)',
              }}
            >
              <DSIcon name={stat.icon} className="h-5 w-5 text-brand-primary mb-1" />
              <AnimatedCounter
                value={stat.value}
                delay={0.5 + idx * 0.1}
                className="text-lg font-bold text-white"
              />
              <span className="text-center text-[10px] leading-tight text-slate-400 mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* ─── Days preview ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="mb-3 text-sm font-bold text-slate-300 uppercase tracking-wide">
            Seus Treinos
          </h3>

          {/* Day tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {plan.days.map((day, idx) => (
              <motion.button
                key={day.day_number}
                onClick={() => setExpandedDay(day.day_number)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  expandedDay === day.day_number
                    ? 'bg-brand-primary text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.3)] border border-emerald-400'
                    : 'border border-emerald-500/20 bg-emerald-500/5 text-slate-300 hover:bg-emerald-500/10'
                }`}
              >
                Dia {day.day_number}
              </motion.button>
            ))}
          </div>

          {/* Expanded day */}
          {plan.days
            .filter((d) => d.day_number === expandedDay)
            .map((day) => (
              <motion.div
                key={day.day_number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                <motion.div
                  className="mb-4 flex items-center gap-3 rounded-2xl backdrop-blur-md border border-emerald-500/20 p-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(15, 23, 42, 0.3) 100%)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/20">
                    <span className="text-sm font-bold text-brand-primary">{day.day_number}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{day.name}</p>
                    <p className="text-xs text-slate-400">{day.exercises.length} exercícios</p>
                  </div>
                </motion.div>

                <StaggerContainer staggerDelay={0.08}>
                  {day.exercises.map((ex, i) => (
                    <div
                      key={`${day.day_number}-${i}`}
                      className="flex items-center gap-3 rounded-2xl backdrop-blur-md border border-emerald-500/15 p-3"
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.2) 0%, rgba(15, 23, 42, 0.3) 100%)',
                      }}
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
                </StaggerContainer>

                {/* Exercise notes */}
                {day.exercises.some((ex) => ex.notes) && (
                  <motion.div
                    className="mt-3 rounded-2xl backdrop-blur-md border border-amber-500/20 p-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(15, 23, 42, 0.2) 100%)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="mb-2 flex items-center gap-1 text-xs font-medium text-amber-400">
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
                  </motion.div>
                )}
              </motion.div>
            ))}
        </motion.div>

        {/* ─── Estimated results ─── */}
        <GlassCard delay={0.7}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
          >
            <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <DSIcon name="target" className="h-4 w-4 text-brand-primary" />
              Resultados Estimados em 4 Semanas
            </h4>
            <div className="space-y-3">
              {[
                {
                  label: 'Sessões completadas',
                  value: stats.total_days * 4,
                },
                {
                  label: 'Calorias queimadas',
                  value: `${(stats.estimated_weekly_calories * 4).toLocaleString('pt-BR')} kcal`,
                },
                {
                  label: 'Tempo investido',
                  value: `${Math.round((stats.session_duration_minutes * stats.total_days * 4) / 60)}h`,
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                >
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className="text-sm font-semibold text-brand-primary">{item.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </GlassCard>
      </div>

      {/* ─── Bottom CTA — salvar plano + signup (reverse trial, sem paywall) ─── */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-emerald-500/20 px-6 pb-8 pt-4 backdrop-blur-2xl"
        style={{
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 100%)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="mx-auto max-w-md space-y-3">
          {useAuthStore.getState().isAuthenticated ? (
            /* Já logado — plano pronto, entra direto no app */
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full bg-brand-primary hover:bg-emerald-500"
                onClick={() => {
                  markCompleted()
                  router.push('/treinos')
                }}
              >
                <DSIcon name="sparkles" size={18} />
                Começar agora
                <DSIcon name="arrowRight" size={18} />
              </Button>
            </motion.div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="w-full bg-brand-primary hover:bg-emerald-500"
                  onClick={() => {
                    markCompleted()
                    router.push('/register/student?from=onboarding')
                  }}
                >
                  <DSIcon name="sparkles" size={18} />
                  Criar conta e salvar meu plano
                  <DSIcon name="arrowRight" size={18} />
                </Button>
              </motion.div>
              <motion.p
                className="flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <DSIcon name="shieldCheck" size={13} className="text-emerald-300" />
                30 dias grátis · tudo liberado · sem cartão
              </motion.p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
