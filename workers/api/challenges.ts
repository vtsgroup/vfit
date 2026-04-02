/**
 * workers/api/challenges.ts
 *
 * Sprint 34 — Streaks & Desafios Semanais
 * Montado em /api/v1/challenges
 *
 * Endpoints:
 *   GET /streak   — streak atual + milestones
 *   GET /weekly   — desafios da semana
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { pgQuery, pgQueryOne } from '@lib/db'
import { success } from '@lib/response'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)

// ── Milestones de streak ───────────────────────────────
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 200, 365] as const

// ── GET /streak — Streak atual e milestones ────────────
app.get('/streak', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  // Buscar dias únicos com treino (últimos 365 dias)
  const { rows } = await pgQuery<{ day: string }>(
    env,
    `SELECT DISTINCT DATE(completed_at) as day
     FROM workout_sessions
     WHERE user_id = $1
       AND status = 'completed'
       AND completed_at > NOW() - INTERVAL '365 days'
     ORDER BY day DESC`,
    [userId]
  )

  // Calcular streak atual (dias consecutivos até hoje/ontem)
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daySet = new Set(rows.map((r) => r.day))

  // Verificar desde hoje para trás
  const check = new Date(today)
  // Se não treinou hoje, verificar se treinou ontem (streak não quebrou)
  const todayStr = check.toISOString().split('T')[0]
  if (!daySet.has(todayStr)) {
    check.setDate(check.getDate() - 1)
  }

  while (true) {
    const dateStr = check.toISOString().split('T')[0]
    if (daySet.has(dateStr)) {
      currentStreak++
      check.setDate(check.getDate() - 1)
    } else {
      break
    }
  }

  // Melhor streak (simplificado — max streak calculado)
  let bestStreak = 0
  let tempStreak = 0
  const sortedDays = [...daySet].sort()
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prev = new Date(sortedDays[i - 1])
      const curr = new Date(sortedDays[i])
      const diffMs = curr.getTime() - prev.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      tempStreak = diffDays === 1 ? tempStreak + 1 : 1
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak
  }

  // Milestones alcançados
  const milestones = STREAK_MILESTONES.map((days) => ({
    days,
    reached: bestStreak >= days,
    current: currentStreak >= days,
  }))

  // Próximo milestone
  const nextMilestone = STREAK_MILESTONES.find((m) => m > currentStreak) ?? null

  return success({
    current_streak: currentStreak,
    best_streak: bestStreak,
    trained_today: daySet.has(todayStr),
    milestones,
    next_milestone: nextMilestone,
    days_to_next: nextMilestone ? nextMilestone - currentStreak : 0,
  })
})

// ── GET /weekly — Desafios da semana ───────────────────
app.get('/weekly', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  // Stats desta semana
  const statsRow = await pgQueryOne<{
    workouts_this_week: number
    total_volume_this_week: number
    total_minutes_this_week: number
  }>(
    env,
    `SELECT
       COUNT(*)::int AS workouts_this_week,
       COALESCE(SUM(total_volume_kg), 0)::int AS total_volume_this_week,
       COALESCE(SUM(duration_seconds) / 60, 0)::int AS total_minutes_this_week
     FROM workout_sessions
     WHERE user_id = $1
       AND status = 'completed'
       AND completed_at >= DATE_TRUNC('week', NOW())`,
    [userId]
  )

  const wk = statsRow?.workouts_this_week ?? 0
  const vol = statsRow?.total_volume_this_week ?? 0
  const mins = statsRow?.total_minutes_this_week ?? 0

  // Desafios fixos semanais
  const challenges = [
    {
      id: 'wk_3_treinos',
      title: '3 treinos esta semana',
      description: 'Complete 3 treinos em 7 dias',
      icon: '💪',
      target: 3,
      current: Math.min(wk, 3),
      completed: wk >= 3,
      xp_reward: 50,
    },
    {
      id: 'wk_5_treinos',
      title: '5 treinos esta semana',
      description: 'Complete 5 treinos em 7 dias',
      icon: '🔥',
      target: 5,
      current: Math.min(wk, 5),
      completed: wk >= 5,
      xp_reward: 100,
    },
    {
      id: 'wk_volume_1000',
      title: 'Volume 1.000kg',
      description: 'Levante 1.000kg de volume total',
      icon: '🏋️',
      target: 1000,
      current: Math.min(vol, 1000),
      completed: vol >= 1000,
      xp_reward: 75,
    },
    {
      id: 'wk_120_min',
      title: '120 minutos',
      description: 'Treine 2h no total esta semana',
      icon: '⏱️',
      target: 120,
      current: Math.min(mins, 120),
      completed: mins >= 120,
      xp_reward: 60,
    },
  ]

  return success(challenges)
})

export { app as challengesRoutes }
