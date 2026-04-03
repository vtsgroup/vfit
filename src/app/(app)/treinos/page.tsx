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

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import {
  useWorkoutTemplates,
  getDifficultyLabel,
  getDifficultyColor,
} from '@/hooks/use-workout-templates'
import { hapticLight } from '@/lib/haptics'
import { useCurrentPlan } from '@/hooks/use-plans'
import { useMealsToday, useNutritionTargets } from '@/hooks/use-vfit-nutrition'

const DIFFICULTY_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
]

// ── T7.5 — Progress Ring SVG ──────────────────────────
function ProgressRing({
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
}

export default function TreinosPage() {
  const [difficulty, setDifficulty] = useState('')
  const { data: templates, isLoading } = useWorkoutTemplates(
    difficulty ? { difficulty } : undefined
  )

  // T7.3-T7.5 — Current plan data
  const { data: plan } = useCurrentPlan()

  // T7.6 — Nutrition today
  const { data: mealsData } = useMealsToday()
  const { data: targets = { calories: 2000, protein: 150, carbs: 250, fat: 65 } } =
    useNutritionTargets()

  // Treino de hoje — map current_day to plan day
  const todayDay = useMemo(() => {
    if (!plan?.days?.length) return null
    const dayIdx = plan.days.findIndex((d) => d.day_number === plan.current_day)
    if (dayIdx >= 0) return plan.days[dayIdx]
    return plan.days[(plan.current_day - 1) % plan.days.length] ?? plan.days[0]
  }, [plan])

  const totals = mealsData?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const planPct = plan && plan.total_days > 0 ? Math.round((plan.current_day / plan.total_days) * 100) : 0
  const calPct = targets.calories > 0 ? Math.round((totals.calories / targets.calories) * 100) : 0

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      <h1 className="mb-1 text-xl font-black text-text-primary">Treinos</h1>
      <p className="mb-5 text-[13px] text-text-muted">Recursos personalizados para você</p>

      {/* T7.3 — Card "Treino de Hoje" */}
      {todayDay && (
        <Link href="/plano" className="mb-4 block" onClick={() => hapticLight()}>
          <div className="glass-card rounded-2xl border border-brand-primary/20 bg-linear-to-br from-brand-primary/8 to-transparent p-4">
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
          </div>
        </Link>
      )}

      {/* T7.4 + T7.5 + T7.6 — KPI cards (plano + nutrição) */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {/* T7.5 — Plano progress ring */}
        <Link href="/plano" className="glass-card block rounded-2xl p-3">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Plano Atual
          </p>
          {plan ? (
            <div className="flex items-center gap-3">
              <ProgressRing value={plan.current_day} max={plan.total_days} size={52} stroke={5} color="#10B981">
                <span className="text-[10px] font-bold text-text-primary">{planPct}%</span>
              </ProgressRing>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-text-primary">
                  Dia {plan.current_day}
                  <span className="font-normal text-text-muted">/{plan.total_days}</span>
                </p>
                <p className="truncate text-[11px] text-text-muted">{plan.name}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-1">
              <DSIcon name="sparkles" size={16} className="text-brand-primary" />
              <p className="text-[12px] text-text-muted">Gere seu plano</p>
            </div>
          )}
        </Link>

        {/* T7.6 — Nutrição hoje */}
        <Link href="/nutricao" className="glass-card block rounded-2xl p-3">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Nutrição Hoje
          </p>
          <div className="flex items-center gap-3">
            <ProgressRing
              value={totals.calories}
              max={targets.calories || 2000}
              size={52}
              stroke={5}
              color="#F59E0B"
            >
              <span className="text-[10px] font-bold text-text-primary">{calPct}%</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-text-primary">
                {Math.round(totals.calories)}
                <span className="font-normal text-[10px] text-text-muted">kcal</span>
              </p>
              <p className="text-[11px] text-text-muted">
                P:{Math.round(totals.protein)}g · C:{Math.round(totals.carbs)}g
              </p>
            </div>
          </div>
        </Link>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
            <DSIcon name="clipboardList" size={20} className="text-blue-400" />
          </div>
          <p className="text-[13px] font-bold text-text-primary">Meu Plano</p>
          <p className="text-[11px] text-text-muted">Treino atual ativo</p>
        </Link>
      </div>

      {/* Templates section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-text-primary">Treinos Prontos</h2>
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
              className="glass-card flex items-center gap-3 rounded-2xl p-4 transition-all hover:border-white/12"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl">
                {t.image_emoji}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <p className="truncate text-[14px] font-bold text-text-primary">{t.name}</p>
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
