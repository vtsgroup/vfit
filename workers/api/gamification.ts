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
import { getXPBalance, computeLevelProgress, getOrCreateStreak } from '@lib/xp-service'
import { BADGES } from '@config/constants'
import type { BadgeType } from '@config/constants'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)

// ── GET /profile — XP e nível do usuário ───────────────
app.get('/profile', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  // XP do ledger (xp_balances) — mesma fonte de /xp/balance, evita divergência entre rotas
  const balance = await getXPBalance(env, userId)
  const levelInfo = computeLevelProgress(balance.total_earned)

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
    total_xp: balance.total_earned,
    level: levelInfo.level,
    xp_in_level: levelInfo.xp_in_level,
    xp_needed: levelInfo.xp_needed,
    progress_percent: levelInfo.progress_percent,
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

  // Streak real do ledger (badge = conquista: usa longest_streak)
  const streak = await getOrCreateStreak(env, userId).catch(() => null)
  const longestStreak = streak?.longest_streak ?? 0

  // Condições por badge
  const conditionMap: Record<string, boolean> = {
    streak_7: longestStreak >= 7,
    streak_30: longestStreak >= 30,
    streak_100: longestStreak >= 100,
    workouts_10: totalWorkouts >= 10,
    workouts_50: totalWorkouts >= 50,
    workouts_100: totalWorkouts >= 100,
    weight_goal: false,
    body_fat_goal: false,
    first_review: false,
    early_bird: false,
  }

  const badges = (Object.keys(BADGES) as BadgeType[]).map((key) => ({
    id: key,
    ...BADGES[key],
    unlocked: conditionMap[key] ?? false,
  }))

  return success(badges)
})

export { app as gamificationRoutes }
