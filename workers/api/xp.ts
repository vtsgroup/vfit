/**
 * workers/api/xp.ts
 *
 * xp.ts — Sistema de XP, streak e metas diárias
 * Features: DB: Neon
 */

// ============================================
// xp.ts — Sistema de XP, streak e metas diárias
// ============================================
//
// O que faz:
//   Endpoints do sistema de gamificação: saldo XP, histórico de transações,
//   limites diários, meta de hoje, histórico de metas (7 dias) e streak com
//   milestones. Personal consulta XP de alunos. Admin reverte transações.
//
// Exports principais:
//   default export (xpRoutes) — Hono app montado em /api/v1/xp
//
// Auth: requireAuth. Student: próprios dados. Personal: dados do aluno.
// DB: xp_transactions, xp_daily_goals, xp_streaks, students
// KV: KV_CACHE (xp_balance:{id}, xp_streak:{id}, xp_daily_goal:{id})
// ============================================
import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import {
  getXPBalance,
  getXPHistory,
  checkDailyLimit,
  reverseTransaction,
  getOrCreateDailyGoal,
  getDailyGoalHistory,
  getOrCreateStreak,
  getStreakMilestones,
  type XPEventType,
} from '@lib/xp-service'
import { handleXPExpiration } from '@workers/cron/xp-expiration'
import { success } from '@lib/response'
import { NotFoundError, ForbiddenError, BadRequestError } from '@lib/errors'
import { pgQuery } from '@lib/db'

const xp = new Hono<AppContext>()

// Todas rotas requerem auth
xp.use('*', authMiddleware)

// ============================================
// GET /xp/balance — Saldo XP do aluno atual
// ============================================
xp.get('/balance', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const balance = await getXPBalance(c.env, studentId)

  return success({
    balance: balance.current_balance,
    level: balance.level,
    total_earned: balance.total_earned,
    total_spent: balance.total_spent,
    next_level_threshold: balance.next_level_threshold,
    last_transaction_at: balance.last_transaction_at,
    transaction_count: balance.transaction_count,
  })
})

// ============================================
// GET /xp/history — Histórico de transações
// ============================================
xp.get('/history', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const limit = Math.min(100, Number(c.req.query('limit')) || 50)
  const offset = Math.max(0, Number(c.req.query('offset')) || 0)

  const transactions = await getXPHistory(c.env, studentId, limit, offset)

  return success({
    transactions: transactions.map((tx) => ({
      id: tx.id,
      event_type: tx.event_type,
      amount: tx.amount,
      direction: tx.direction,
      created_at: tx.created_at,
      expires_at: tx.expires_at,
      notes: tx.notes,
      reference_type: tx.reference_type,
      metadata: tx.metadata,
    })),
    pagination: {
      limit,
      offset,
    },
  })
})

// ============================================
// GET /xp/limits — Status de limites diários
// ============================================
xp.get('/limits', requireType('student'), async (c) => {
  const studentId = c.get('userId')

  // Tipos de eventos principais para verificação
  const eventTypes: XPEventType[] = [
    'workout_completed',
    'review_written',
    'assessment_completed',
    'badge_earned',
  ]

  const limits = await Promise.all(
    eventTypes.map(async (eventType) => {
      const check = await checkDailyLimit(c.env, studentId, eventType)
      return {
        event_type: eventType,
        current_count: check.currentCount,
        limit: check.limit,
        allowed: check.allowed,
        remaining: Math.max(0, check.limit - check.currentCount),
      }
    })
  )

  return success({
    limits,
    reset_at: new Date()
      .toLocaleString('en-US', { timeZone: 'UTC' })
      .split(' ')[0]
      .replace(/\//g, '-') + 'T00:00:00Z', // Midnight UTC next day
  })
})

// ============================================
// GET /xp/student/:id/balance — Personal visualiza aluno
// ============================================
xp.get('/student/:id/balance', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const studentId = c.req.param('id')

  // Verificar que o aluno pertence ao personal
  const { rows } = await pgQuery<{ id: string }>(
    c.env,
    'SELECT id FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
    [studentId, personalId]
  )

  if (rows.length === 0) {
    throw new NotFoundError('Aluno')
  }

  const balance = await getXPBalance(c.env, studentId)

  return success({
    student_id: studentId,
    balance: balance.current_balance,
    level: balance.level,
    total_earned: balance.total_earned,
    total_spent: balance.total_spent,
  })
})

// ============================================
// POST /xp/admin/reverse — Reverter transação (admin)
// ============================================
xp.post('/admin/reverse', requireType('personal'), async (c) => {
  // TODO: Check admin role when roles implemented
  const adminId = c.get('userId')
  const body = await c.req.json()
  const { transaction_id, reason } = body

  if (!transaction_id || !reason) {
    throw new BadRequestError('transaction_id e reason são obrigatórios')
  }

  const result = await reverseTransaction(c.env, transaction_id, reason, adminId)

  return success({
    reversed_transaction_id: result.reversedTransaction.id,
    new_balance: result.newBalance,
  })
})

// ============================================
// GET /xp/goals/today — Meta diária atual (student)
// ============================================
xp.get('/goals/today', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const goal = await getOrCreateDailyGoal(c.env, studentId)

  return success({
    goal_date: goal.goal_date,
    target_xp: goal.target_xp,
    earned_xp: goal.earned_xp,
    progress: Math.min(1, goal.earned_xp / goal.target_xp),
    completed: goal.completed,
    completed_at: goal.completed_at,
    workouts_target: goal.workouts_target,
    workouts_done: goal.workouts_done,
  })
})

// ============================================
// GET /xp/goals/history — Histórico de metas (student)
// ============================================
xp.get('/goals/history', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const days = Math.min(30, Number(c.req.query('days')) || 7)
  const goals = await getDailyGoalHistory(c.env, studentId, days)

  const completedCount = goals.filter((g) => g.completed).length
  const totalXPEarned = goals.reduce((sum, g) => sum + g.earned_xp, 0)

  return success({
    goals: goals.map((g) => ({
      goal_date: g.goal_date,
      target_xp: g.target_xp,
      earned_xp: g.earned_xp,
      completed: g.completed,
      completed_at: g.completed_at,
      workouts_done: g.workouts_done,
    })),
    summary: {
      days_tracked: goals.length,
      days_completed: completedCount,
      completion_rate: goals.length > 0 ? completedCount / goals.length : 0,
      total_xp_earned: totalXPEarned,
    },
  })
})

// ============================================
// GET /xp/streak — Streak atual + milestones (student)
// ============================================
xp.get('/streak', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const streak = await getOrCreateStreak(c.env, studentId)
  const milestones = await getStreakMilestones(c.env, studentId)

  // Calculate next milestone
  const nextMilestone = [3, 7, 30, 100].find((m) => m > streak.current_streak) || null
  const progressToNext = nextMilestone
    ? Math.min(1, streak.current_streak / nextMilestone)
    : 1

  return success({
    current_streak: streak.current_streak,
    longest_streak: streak.longest_streak,
    last_activity_date: streak.last_activity_date,
    streak_started_at: streak.streak_started_at,
    freeze_count: streak.freeze_count,
    max_freezes: streak.max_freezes,
    next_milestone: nextMilestone,
    progress_to_next: progressToNext,
    milestones: milestones.map((m) => ({
      days: m.milestone_days,
      achieved_at: m.achieved_at,
      xp_awarded: m.xp_awarded,
    })),
  })
})

// ============================================
// GET /xp/student/:id/streak — Personal visualiza streak do aluno
// ============================================
xp.get('/student/:id/streak', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const studentId = c.req.param('id')

  // Verificar que o aluno pertence ao personal
  const { rows } = await pgQuery<{ id: string }>(
    c.env,
    'SELECT id FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
    [studentId, personalId]
  )

  if (rows.length === 0) {
    throw new NotFoundError('Aluno')
  }

  const streak = await getOrCreateStreak(c.env, studentId)
  const milestones = await getStreakMilestones(c.env, studentId)

  return success({
    student_id: studentId,
    current_streak: streak.current_streak,
    longest_streak: streak.longest_streak,
    last_activity_date: streak.last_activity_date,
    milestones: milestones.map((m) => ({
      days: m.milestone_days,
      achieved_at: m.achieved_at,
      xp_awarded: m.xp_awarded,
    })),
  })
})

// ============================================
// GET /xp/expiring — XP prestes a expirar (student)
// ============================================
xp.get('/expiring', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const daysAhead = Math.min(30, Number(c.req.query('days')) || 7)

  const futureDate = new Date()
  futureDate.setUTCDate(futureDate.getUTCDate() + daysAhead)

  const { rows } = await pgQuery<{
    id: string
    amount: number
    event_type: string
    expires_at: string
    created_at: string
  }>(
    c.env,
    `SELECT id, amount, event_type, expires_at, created_at
     FROM xp_transactions
     WHERE student_id = $1 AND status = 'settled' AND expires_at IS NOT NULL AND expires_at <= $2
     ORDER BY expires_at ASC
     LIMIT 20`,
    [studentId, futureDate.toISOString()]
  )

  const totalExpiring = rows.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  return success({
    expiring_transactions: rows.map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      event_type: tx.event_type,
      expires_at: tx.expires_at,
      days_until_expiry: Math.ceil(
        (new Date(tx.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    })),
    total_expiring_xp: totalExpiring,
    check_window_days: daysAhead,
  })
})

// ============================================
// POST /xp/admin/expire — Trigger manual de expiração (admin)
// ============================================
xp.post('/admin/expire', requireType('personal'), async (c) => {
  const result = await handleXPExpiration(c.env)

  return success({
    expired_count: result.expiredCount,
    executed_at: result.executedAt,
  })
})

export default xp
