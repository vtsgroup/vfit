/**
 * workers/api/gamification.ts
 *
 * Sprint 33 — XP, Níveis e Badges API
 * Montado em /api/v1/gamification
 *
 * Endpoints:
 *   GET /profile  — XP total, nível, XP para próximo nível
 *   GET /badges   — badges do usuário (locked/unlocked)
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { pgQueryOne } from '@lib/db'
import { success } from '@lib/response'
import { LEVEL_THRESHOLDS, BADGES } from '@config/constants'
import type { BadgeType } from '@config/constants'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)

// ── GET /profile — XP e nível do usuário ───────────────
app.get('/profile', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  // Buscar XP total dos treinos concluídos
  const xpRow = await pgQueryOne<{ total_xp: number }>(
    env,
    `SELECT COALESCE(SUM(xp_earned), 0)::int AS total_xp
     FROM workout_sessions
     WHERE user_id = $1 AND status = 'completed'`,
    [userId]
  )

  const totalXp = xpRow?.total_xp ?? 0

  // Calcular nível
  let level = 1
  let xpForCurrentLevel = 0
  let xpForNextLevel: number = LEVEL_THRESHOLDS[0] // 100

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 2
      xpForCurrentLevel = LEVEL_THRESHOLDS[i]
      xpForNextLevel = LEVEL_THRESHOLDS[i + 1] ?? LEVEL_THRESHOLDS[i] + 1000
    } else {
      break
    }
  }

  const xpInLevel = totalXp - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const progressPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  // Stats resumidos
  const statsRow = await pgQueryOne<{
    total_workouts: number
    total_records: number
  }>(
    env,
    `SELECT
       (SELECT COUNT(*) FROM workout_sessions WHERE user_id = $1 AND status = 'completed')::int AS total_workouts,
       (SELECT COUNT(*) FROM personal_records WHERE user_id = $1)::int AS total_records`,
    [userId]
  )

  return success({
    total_xp: totalXp,
    level,
    xp_in_level: xpInLevel,
    xp_needed: xpNeeded,
    progress_percent: progressPercent,
    total_workouts: statsRow?.total_workouts ?? 0,
    total_records: statsRow?.total_records ?? 0,
  })
})

// ── GET /badges — Badges do usuário ────────────────────
app.get('/badges', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  // Stats para determinar quais badges foram desbloqueados
  const statsRow = await pgQueryOne<{
    total_workouts: number
    total_records: number
  }>(
    env,
    `SELECT
       (SELECT COUNT(*) FROM workout_sessions WHERE user_id = $1 AND status = 'completed')::int AS total_workouts,
       (SELECT COUNT(*) FROM personal_records WHERE user_id = $1)::int AS total_records`,
    [userId]
  )

  const totalWorkouts = statsRow?.total_workouts ?? 0
  const totalRecords = statsRow?.total_records ?? 0

  // Condições por badge
  const conditionMap: Record<string, boolean> = {
    streak_7: false,
    streak_30: false,
    streak_100: false,
    workouts_10: totalWorkouts >= 10,
    workouts_50: totalWorkouts >= 50,
    workouts_100: totalWorkouts >= 100,
    weight_goal: false,
    body_fat_goal: false,
    first_review: false,
    early_bird: false,
  }

  // Se fez pelo menos 1 treino, dar badge implícito
  if (totalWorkouts >= 1) {
    conditionMap['early_bird'] = false // isso é por data de cadastro
  }

  const badges = (Object.keys(BADGES) as BadgeType[]).map((key) => ({
    id: key,
    ...BADGES[key],
    unlocked: conditionMap[key] ?? false,
  }))

  return success(badges)
})

export { app as gamificationRoutes }
