'use client'

import { useEffect, type ComponentType } from 'react'
import { StudentHeader } from '@/components/navigation/student-header'
import { FirstWinCommandCenter } from '@/components/treinos/first-win-command-center'
import type { CurrentPlan, PlanDay } from '@/hooks/use-plans'
import type { StreakResponse, DailyGoalResponse, XPBalance } from '@/hooks/use-xp'
import type { HeroVariantProps } from '@/components/treinos/hero-variants/types'
import { HeroTerminal } from '@/components/treinos/hero-variants/variant-04-terminal'
import { HeroBilhete } from '@/components/treinos/hero-variants/variant-07-bilhete'
import { HeroCarbono } from '@/components/treinos/hero-variants/variant-08-carbono'
import { HeroPlacar } from '@/components/treinos/hero-variants/variant-12-placar'
import { HeroMonocoque } from '@/components/treinos/hero-variants/variant-31-monocoque'
import { HeroArena } from '@/components/treinos/hero-variants/variant-32-arena'
import { HeroPaddock } from '@/components/treinos/hero-variants/variant-33-paddock'
import { HeroLounge } from '@/components/treinos/hero-variants/variant-34-lounge'

const DAY: PlanDay = {
  id: 'day-5',
  day_number: 5,
  name: 'Costas e Bíceps',
  muscle_groups: ['back', 'biceps'],
  estimated_duration_min: 60,
  exercises: [],
}

const PLAN: CurrentPlan = {
  id: 'plan-1',
  name: 'Hipertrofia Casa',
  type: 'ai',
  status: 'active',
  total_days: 5,
  current_day: 5,
  settings: {},
  created_at: new Date(Date.now() - 30 * 86400e3).toISOString(),
  days: [DAY],
}

const yesterday = new Date(Date.now() - 86400e3).toISOString().slice(0, 10)

const STREAK: StreakResponse = {
  current_streak: 6,
  longest_streak: 11,
  last_activity_date: yesterday,
  streak_started_at: null,
  freeze_count: 0,
  max_freezes: 2,
  next_milestone: 7,
  progress_to_next: 0.85,
  milestones: [],
}

const XP: XPBalance = {
  balance: 340,
  level: 3,
  total_earned: 520,
  total_spent: 180,
  next_level_threshold: 450,
  transaction_count: 24,
}

const DAILY_GOAL: DailyGoalResponse = {
  goal_date: new Date().toISOString().slice(0, 10),
  target_xp: 50,
  earned_xp: 20,
  progress: 0.4,
  completed: false,
  completed_at: null,
  workouts_target: 1,
  workouts_done: 0,
}

const FIXTURES: HeroVariantProps = {
  userName: 'Victor Duarte',
  todayDay: DAY,
  plan: PLAN,
  planPct: 100,
  totals: { calories: 830, protein: 62, carbs: 90, fat: 28 },
  targets: { calories: 2200, protein: 150, carbs: 240, fat: 70 },
  streak: STREAK,
  xpBalance: XP,
  dailyGoal: DAILY_GOAL,
  workoutCount: 14,
}

const VARIANTS: Array<{ id: string; name: string; thesis: string; Comp: ComponentType<HeroVariantProps> }> = [
  { id: 'v08', name: '08 · Carbono ★ CAMPEÃO (em produção)', thesis: 'Superesportivo — fusão total header+hero, textura carbono contínua', Comp: HeroCarbono },
  { id: 'v31', name: '31 · Monocoque', thesis: 'Chassi de hipercarro — fibra 7px, costela com parafusos hex, ignição', Comp: HeroMonocoque },
  { id: 'v32', name: '32 · Arena', thesis: 'Jumbotron fundido — LED dot-matrix, spotlights, moldura de aço', Comp: HeroArena },
  { id: 'v33', name: '33 · Paddock', thesis: 'Box de F1 — semáforo de largada, monitores de telemetria, pit lane', Comp: HeroPaddock },
  { id: 'v34', name: '34 · Lounge', thesis: 'Check-in premium — split-flap board, ticket saindo da impressora', Comp: HeroLounge },
  { id: 'v12', name: '12 · Placar', thesis: 'Scoreboard de estádio — LED dot-matrix, confronto do dia, broadcast', Comp: HeroPlacar },
  { id: 'v07', name: '07 · Bilhete (reservada p/ outras áreas)', thesis: 'Boarding pass — candidata a check-in de treino / marketplace', Comp: HeroBilhete },
  { id: 'v04', name: '04 · Telemetria (reservada p/ treino-ativo)', thesis: 'HUD técnico — candidata a hero do Modo Atleta na área de treino', Comp: HeroTerminal },
]

function VariantLabel({ name, thesis }: { name: string; thesis: string }) {
  return (
    <div className="mx-4 mb-3 mt-12 border-l-2 border-brand-primary pl-3">
      <p className="text-[13px] font-black uppercase tracking-[0.14em] text-white">{name}</p>
      <p className="mt-0.5 text-[11px] text-slate-400">{thesis}</p>
    </div>
  )
}

export function HeroPreviewClient() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
    document.documentElement.style.backgroundColor = '#050A12'
  }, [])

  return (
    <div className="min-h-screen bg-[#050A12] pb-24">
      <main className="mx-auto max-w-lg">
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={() => {
              localStorage.removeItem('pia-cookie-consent')
              window.location.reload()
            }}
            className="rounded-[9px] border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
          >
            Rever cookie consent
          </button>
        </div>
        <section id="v00">
          <VariantLabel name="00 · Atual (baseline)" thesis="FirstWinCommandCenter em produção hoje" />
          <StudentHeader inline />
          <div className="px-4">
            <FirstWinCommandCenter {...FIXTURES} />
          </div>
        </section>

        {VARIANTS.map(({ id, name, thesis, Comp }) => (
          <section key={id} id={id}>
            <VariantLabel name={name} thesis={thesis} />
            {/* Header inline logo acima do hero: avalia a fusão header+hero sem emenda */}
            <StudentHeader inline />
            <div className="px-4">
              <Comp {...FIXTURES} />
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
