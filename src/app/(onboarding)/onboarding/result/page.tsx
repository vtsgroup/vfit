'use client'

/**
 * src/app/(onboarding)/onboarding/result/page.tsx
 *
 * Result Page — "VFIT BROADCAST · PLANO Nº 01".
 * Reveal do plano gerado como capa/placar: título Syne, stats em box-score, treinos
 * em abas de placar, exercícios em linhas secas, CTA verde→lima. Navy seco, aparato mono.
 * Dados via sessionStorage (gravados pela loading page).
 */

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { useAuthStore } from '@/stores/auth-store'
import { AnimatedCounter } from '@/components/onboarding/onboarding-animations'

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

  useEffect(() => {
    setMounted(true)
    try {
      const stored = sessionStorage.getItem('vfit_plan')
      if (stored) setResult(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  const statsCards = useMemo(() => {
    if (!result) return []
    return [
      { icon: 'calendar' as DSIconName, value: `${result.stats.total_days}×`, label: 'por semana' },
      { icon: 'dumbbell' as DSIconName, value: String(result.stats.total_exercises), label: 'exercícios' },
      { icon: 'clock' as DSIconName, value: `${result.stats.session_duration_minutes}min`, label: 'por sessão' },
      { icon: 'flame' as DSIconName, value: String(result.stats.estimated_weekly_calories), label: 'kcal/semana' },
    ]
  }, [result])

  if (!mounted) return null

  if (!result) {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-x-hidden bg-[#04080f] px-6 text-center text-white">
        <div aria-hidden className="vfit-flow-grid pointer-events-none absolute inset-0 opacity-[0.22]" />
        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10">
            <DSIcon name="helpCircle" className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="font-syne mb-2 text-2xl font-black text-white">Nenhum plano encontrado</h2>
          <p className="bc-mono mb-8 text-[11px] uppercase tracking-[0.16em] text-slate-400">A geração expirou · vamos recomeçar</p>
          <Button onClick={() => router.push('/onboarding')}>Recomeçar Quiz</Button>
        </div>
      </div>
    )
  }

  const { plan, stats } = result
  const isAuth = useAuthStore.getState().isAuthenticated

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#04080f] pb-40 text-white">
      <div aria-hidden className="vfit-flow-grid pointer-events-none absolute inset-0 opacity-[0.22]" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(110% 55% at 78% -6%, rgba(34,197,94,0.12), transparent 55%)' }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-green-300/40 to-transparent" />

      {/* ─── Header / capa ─── */}
      <header className="relative z-10 px-6 pt-[calc(env(safe-area-inset-top)+40px)]">
        <div className="mx-auto max-w-md">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bc-mono mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-green-300/90"
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Plano Nº 01 · Gerado pela IA
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="font-syne mb-3 text-[34px] font-black uppercase leading-[0.98] tracking-tight text-white sm:text-[42px]"
          >
            {plan.plan_name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.5 }}
            className="text-sm leading-6 text-slate-300"
          >
            {plan.description}
          </motion.p>
          {data.goal && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24 }}
              className="bc-mono mt-4 inline-flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-green-200"
            >
              <DSIcon name="target" size={12} />
              {GOAL_LABELS[data.goal] || data.goal}
            </motion.span>
          )}
        </div>
      </header>

      {/* ─── Stats box-score ─── */}
      <div className="relative z-10 mx-auto mt-7 max-w-md px-6">
        <div className="grid grid-cols-4 overflow-hidden rounded-lg border border-green-400/15">
          {statsCards.map((stat, idx) => (
            <div
              key={stat.label}
              className={`flex flex-col gap-1.5 px-2 py-4 ${idx % 2 === 1 ? 'bg-green-900/15' : ''} ${idx < 3 ? 'border-r border-white/8' : ''}`}
            >
              <DSIcon name={stat.icon} size={16} className="text-green-300" />
              <AnimatedCounter value={stat.value} delay={0.4 + idx * 0.1} className="font-syne text-xl font-black leading-none text-white tabular-nums" />
              <span className="bc-mono text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Treinos ─── */}
      <div className="relative z-10 mx-auto mt-8 max-w-md px-6">
        <h2 className="bc-mono mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-green-300/70">Seus treinos</h2>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {plan.days.map((day) => (
            <button
              key={day.day_number}
              onClick={() => setExpandedDay(day.day_number)}
              className={`bc-mono shrink-0 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all ${
                expandedDay === day.day_number
                  ? 'text-[#06210f]'
                  : 'border border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/25'
              }`}
              style={expandedDay === day.day_number ? { background: 'linear-gradient(135deg,#4ade80,#22c55e)', boxShadow: '0 8px 20px -8px rgba(34,197,94,0.6)' } : undefined}
            >
              Dia {String(day.day_number).padStart(2, '0')}
            </button>
          ))}
        </div>

        {plan.days
          .filter((d) => d.day_number === expandedDay)
          .map((day) => (
            <motion.div key={day.day_number} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <div className="mb-3 flex items-center gap-3 rounded-lg border border-green-400/15 bg-white/[0.02] p-3">
                <span className="font-syne flex h-10 w-10 items-center justify-center rounded-md text-lg font-black text-[#06210f]" style={{ background: 'linear-gradient(135deg,#4ade80,#22c55e)' }}>
                  {day.day_number}
                </span>
                <div className="min-w-0">
                  <p className="font-syne truncate text-[15px] font-black uppercase leading-tight text-white">{day.name}</p>
                  <p className="bc-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">{day.exercises.length} exercícios · {day.focus}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-white/8">
                {day.exercises.map((ex, i) => (
                  <motion.div
                    key={`${day.day_number}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                    className={`flex items-center gap-3 px-3 py-3 ${i > 0 ? 'border-t border-white/8' : ''}`}
                  >
                    <span className="bc-mono w-6 shrink-0 text-[11px] font-bold tabular-nums text-green-300/55">{String(i + 1).padStart(2, '0')}</span>
                    <DSIcon name={MUSCLE_ICON[ex.muscle_group] || 'dumbbell'} size={18} className="shrink-0 text-green-300" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-white">{ex.name}</p>
                      <p className="bc-mono text-[10px] uppercase tracking-[0.1em] text-slate-500">
                        {ex.sets}×{ex.reps}
                        {ex.weight_suggestion_kg ? ` · ${ex.weight_suggestion_kg}kg` : ''}
                        {ex.rest_seconds ? ` · ${ex.rest_seconds}s desc` : ''}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {day.exercises.some((ex) => ex.notes) && (
                <div className="mt-3 rounded-lg border border-amber-400/20 border-l-2 border-l-amber-400/60 bg-amber-400/[0.04] p-3">
                  <p className="bc-mono mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
                    <DSIcon name="lightbulb" size={12} />
                    Dicas
                  </p>
                  {day.exercises
                    .filter((ex) => ex.notes)
                    .map((ex, i) => (
                      <p key={i} className="text-[11px] leading-5 text-slate-400">
                        • <strong className="text-slate-200">{ex.name}:</strong> {ex.notes}
                      </p>
                    ))}
                </div>
              )}
            </motion.div>
          ))}
      </div>

      {/* ─── Resultados estimados — box-score ─── */}
      <div className="relative z-10 mx-auto mt-6 max-w-md px-6">
        <div className="rounded-lg border border-green-400/15 bg-white/[0.02] p-4">
          <h3 className="bc-mono mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-green-300/80">
            <DSIcon name="target" size={13} />
            Resultados · 4 semanas
          </h3>
          <div className="divide-y divide-white/8">
            {[
              { label: 'Sessões completadas', value: String(stats.total_days * 4) },
              { label: 'Calorias queimadas', value: `${(stats.estimated_weekly_calories * 4).toLocaleString('pt-BR')} kcal` },
              { label: 'Tempo investido', value: `${Math.round((stats.session_duration_minutes * stats.total_days * 4) / 60)}h` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2.5">
                <span className="bc-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">{item.label}</span>
                <span className="font-syne text-base font-black text-green-300 tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CTA fixo — verde→lima ─── */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-green-400/25 bg-[#04080f]/92 px-6 pt-4 backdrop-blur-md"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        <div className="mx-auto max-w-md">
          <button
            onClick={() => {
              markCompleted()
              router.push(isAuth ? '/treinos' : '/register/student?from=onboarding')
            }}
            aria-label={isAuth ? 'Começar agora' : 'Criar conta e salvar meu plano'}
            className="bc-res-cta group relative flex h-15 w-full items-center gap-3 overflow-hidden rounded-full pl-6 pr-2 text-[#06210f] outline-none transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04080f]"
            style={{ background: 'linear-gradient(135deg,#4ade80 0%,#22c55e 50%,#16a34a 100%)' }}
          >
            <span aria-hidden className="bc-res-sweep" />
            <DSIcon name="sparkles" size={19} className="relative z-10 shrink-0" />
            <span className="font-syne relative z-10 text-[14px] font-black uppercase tracking-tight sm:text-[16px]">
              {isAuth ? 'Começar agora' : 'Criar conta e salvar plano'}
            </span>
            <span className="relative z-10 ml-auto flex h-11 shrink-0 items-center justify-center rounded-full bg-[#052e16]/95 px-3.5 text-green-300">
              <DSIcon name="arrowRight" size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </button>
          {!isAuth && (
            <p className="bc-mono mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
              <DSIcon name="shieldCheck" size={13} className="text-green-300" />
              30 dias grátis · tudo liberado · sem cartão
            </p>
          )}
        </div>
      </div>

      <style>{`
        .bc-res-cta { box-shadow: 0 18px 44px -12px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.45); animation: bcResBreathe 3.4s ease-in-out 1.5s infinite; }
        @keyframes bcResBreathe { 0%,100% { box-shadow: 0 16px 40px -14px rgba(34,197,94,0.45), inset 0 1px 0 rgba(255,255,255,0.45); } 50% { box-shadow: 0 24px 60px -10px rgba(34,197,94,0.7), inset 0 1px 0 rgba(255,255,255,0.5); } }
        .bc-res-sweep { position: absolute; inset: 0; z-index: 5; pointer-events: none; background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%); transform: translateX(-130%) skewX(-18deg); animation: bcResSweep 3.6s ease-in-out 2s infinite; }
        .bc-res-cta:hover .bc-res-sweep { animation-duration: 1.1s; }
        @keyframes bcResSweep { 0% { transform: translateX(-130%) skewX(-18deg); } 60%,100% { transform: translateX(260%) skewX(-18deg); } }
        @media (prefers-reduced-motion: reduce) { .bc-res-cta, .bc-res-sweep { animation: none !important; } }
      `}</style>
    </div>
  )
}
