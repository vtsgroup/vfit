/**
 * lib/xp-service.ts
 *
 * Core XP economy functions:
 * - createTransaction (credit/debit)
 * - getBalance
 * - checkDailyLimit
 * - antiDuplicate
 * - expireXP
 *
 * Usage:
 *   const result = await creditXP(env, studentId, 'workout_completed', { workoutLogId })
 *   const balance = await getXPBalance(env, studentId)
 *   await expireXPDaily(env)  // Cron job
 */

import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { RateLimitError, BadRequestError } from '@lib/errors'
import { getCached, invalidateCache, cacheKey, CACHE_STRATEGIES } from '@lib/cache'
import type { Bindings } from '@workers/types'

// ============================================
// TYPE DEFINITIONS
// ============================================

export type XPEventType =
  | 'workout_completed'
  | 'streak_3_days'
  | 'streak_7_days'
  | 'streak_30_days'
  | 'streak_100_days'
  | 'badge_earned'
  | 'goal_reached_weight'
  | 'goal_reached_body_fat'
  | 'assessment_completed'
  | 'referral_signup'
  | 'review_written'
  | 'workout_first'
  | 'workout_milestone_10'
  | 'workout_milestone_50'
  | 'workout_milestone_100'
  | 'custom_admin_reward'
  | 'store_purchase_refund'
  | 'xp_expiration'
  | 'xp_burn_conversion'

export interface XPTransactionInput {
  studentId: string
  personalId?: string
  eventType: XPEventType
  amount?: number  // Override base_amount from config
  referenceType?: string  // 'workout_log', 'badge', etc
  referenceId?: string
  idempotencyKey?: string  // For deduplication
  notes?: string
  metadata?: Record<string, unknown>
  expiresInDays?: number  // Override default expiration
}

export interface XPTransaction {
  id: string
  student_id: string
  personal_id?: string
  event_type: XPEventType
  amount: number
  direction: 'credit' | 'debit'
  reference_type?: string
  reference_id?: string
  idempotency_key?: string
  metadata: Record<string, unknown>
  notes?: string
  created_at: string
  expires_at?: string
  status: 'pending' | 'settled' | 'reversed' | 'expired'
  created_by: string
}

export interface XPBalance {
  student_id: string
  total_earned: number
  total_spent: number
  current_balance: number
  level: number
  next_level_threshold: number
  last_transaction_at?: string
  transaction_count: number
}

export interface XPTransactionResult {
  transaction: XPTransaction
  balanceBefore: number
  balanceAfter: number
  balanceUpdated: boolean
  newBalance?: XPBalance
}

// ============================================
// CACHE HELPERS
// ============================================

/** Invalidate all XP caches for a student */
export async function invalidateXPCache(env: Bindings, studentId: string): Promise<void> {
  await invalidateCache(env.KV_CACHE, [
    cacheKey('xp:balance', studentId),
    cacheKey('xp:streak', studentId),
    cacheKey('xp:goal', studentId),
    cacheKey('xp:milestones', studentId),
  ])
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Get event config including base amount and limits
 */
async function getEventConfig(env: Bindings, eventType: XPEventType) {
  const result = await pgQueryOne<{
    base_amount: number
    daily_limit: number | null
    expires_in_days: number | null
    name: string
    enabled: boolean
  }>(
    env,
    `
      SELECT base_amount, daily_limit, expires_in_days, name, enabled
      FROM xp_event_config
      WHERE event_type = $1
    `,
    [eventType]
  )

  if (!result) {
    throw new BadRequestError(`Unknown event type: ${eventType}`)
  }

  if (!result.enabled) {
    throw new BadRequestError(`Event type disabled: ${eventType}`)
  }

  return result
}

/**
 * Check daily limit for an event
 * Returns true if under limit, false if exceeded
 */
export async function checkDailyLimit(
  env: Bindings,
  studentId: string,
  eventType: XPEventType
): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
  const config = await getEventConfig(env, eventType)

  if (config.daily_limit === null) {
    return { allowed: true, currentCount: 0, limit: 0 }  // No limit
  }

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)

  const limit = await pgQueryOne<{
    current_count: number
    reset_at: string
  }>(
    env,
    `
      SELECT current_count, reset_at
      FROM xp_daily_limits
      WHERE student_id = $1 AND event_type = $2
      LIMIT 1
    `,
    [studentId, eventType]
  )

  if (!limit) {
    // First time - create entry
    await pgQuery(
      env,
      `
        INSERT INTO xp_daily_limits (id, student_id, event_type, limit_count, reset_at, current_count)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [generateId(), studentId, eventType, config.daily_limit, tomorrow.toISOString(), 1]
    )
    return { allowed: true, currentCount: 1, limit: config.daily_limit }
  }

  // Check if reset window has passed
  if (new Date(limit.reset_at) <= now) {
    // Reset
    await pgQuery(
      env,
      `
        UPDATE xp_daily_limits
        SET current_count = 1, reset_at = $1, updated_at = NOW()
        WHERE student_id = $2 AND event_type = $3
      `,
      [tomorrow.toISOString(), studentId, eventType]
    )
    return { allowed: true, currentCount: 1, limit: config.daily_limit }
  }

  // Still in same window
  const allowed = limit.current_count < config.daily_limit
  if (allowed) {
    await pgQuery(
      env,
      `
        UPDATE xp_daily_limits
        SET current_count = current_count + 1, updated_at = NOW()
        WHERE student_id = $1 AND event_type = $2
      `,
      [studentId, eventType]
    )
  }

  return {
    allowed,
    currentCount: limit.current_count,
    limit: config.daily_limit,
  }
}

/**
 * Check deduplication — prevent double transactions within 5 seconds
 */
export async function checkDeduplicate(
  env: Bindings,
  studentId: string,
  eventType: XPEventType,
  referenceId?: string
): Promise<{ isDuplicate: boolean; originalTransactionId?: string }> {
  if (!referenceId) {
    return { isDuplicate: false }  // No reference, can't dedupe
  }

  const dedupeEntry = await pgQueryOne<{
    transaction_id: string
    processed_at: string
  }>(
    env,
    `
      SELECT transaction_id, processed_at
      FROM xp_deduplication
      WHERE student_id = $1 AND event_type = $2 AND reference_id = $3
      LIMIT 1
    `,
    [studentId, eventType, referenceId]
  )

  if (!dedupeEntry) {
    return { isDuplicate: false }
  }

  // Check if within 5-second window
  const processedTime = new Date(dedupeEntry.processed_at)
  const now = new Date()
  const secondsAgo = (now.getTime() - processedTime.getTime()) / 1000

  if (secondsAgo < 5) {
    return { isDuplicate: true, originalTransactionId: dedupeEntry.transaction_id }
  }

  return { isDuplicate: false }
}

/**
 * Create XP transaction (main function)
 * Handles credit/debit, deduplication, daily limits, balance updates
 */
export async function createXPTransaction(
  env: Bindings,
  input: XPTransactionInput
): Promise<XPTransactionResult> {
  const {
    studentId,
    personalId,
    eventType,
    referenceType,
    referenceId,
    notes,
    metadata = {},
  } = input

  // 1. Get event config
  const config = await getEventConfig(env, eventType)
  const amount = input.amount ?? config.base_amount

  if (amount === 0) {
    throw new BadRequestError(`Invalid amount for event type ${eventType}`)
  }

  const direction = amount > 0 ? 'credit' : 'debit'
  const absoluteAmount = Math.abs(amount)

  // 2. Check daily limit
  const limitCheck = await checkDailyLimit(env, studentId, eventType)
  if (!limitCheck.allowed) {
    throw new RateLimitError(60) // Retry after 60 seconds
  }

  // 3. Check deduplication
  const dedupeCheck = await checkDeduplicate(env, studentId, eventType, referenceId)
  if (dedupeCheck.isDuplicate) {
    // Return existing transaction instead of creating duplicate
    const existing = await pgQueryOne<any>(
      env,
      `SELECT * FROM xp_transactions WHERE id = $1 LIMIT 1`,
      [dedupeCheck.originalTransactionId]
    )
    const balance = await getXPBalance(env, studentId)
    return {
      transaction: existing.rows as XPTransaction,
      balanceBefore: balance.current_balance - absoluteAmount,
      balanceAfter: balance.current_balance,
      balanceUpdated: false,
    }
  }

  // 4. Calculate expiration
  let expiresAt: string | null = null
  if (input.expiresInDays !== undefined || config.expires_in_days) {
    const expiryDays = input.expiresInDays ?? config.expires_in_days ?? 90
    const expiry = new Date()
    expiry.setUTCDate(expiry.getUTCDate() + expiryDays)
    expiresAt = expiry.toISOString()
  }

  // 5. Get balance before
  const balanceBefore = await getXPBalance(env, studentId)

  // 6. Create transaction
  const transactionId = generateId()
  const now = new Date().toISOString()
  const idempotencyKey =
    input.idempotencyKey || `${studentId}:${eventType}:${referenceId || transactionId}`

  await pgQuery(
    env,
    `
      INSERT INTO xp_transactions (
        id, student_id, personal_id, event_type, amount, direction,
        reference_type, reference_id, idempotency_key, notes, metadata,
        created_at, expires_at, status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `,
    [
      transactionId,
      studentId,
      personalId || null,
      eventType,
      direction === 'credit' ? absoluteAmount : -absoluteAmount,
      direction,
      referenceType || null,
      referenceId || null,
      idempotencyKey,
      notes || null,
      JSON.stringify(metadata),
      now,
      expiresAt,
      'settled',
      'system',
    ]
  )

  // 7. Register deduplication
  if (referenceId) {
    await pgQuery(
      env,
      `
        INSERT INTO xp_deduplication (id, student_id, event_type, reference_id, processed_at, transaction_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `,
      [generateId(), studentId, eventType, referenceId, now, transactionId]
    )
  }

  // 8. Update balance
  const balanceAfter = balanceBefore.current_balance + (direction === 'credit' ? absoluteAmount : -absoluteAmount)

  await pgQuery(
    env,
    `
      INSERT INTO xp_balances (student_id, total_earned, total_spent, current_balance, last_transaction_at, transaction_count)
      VALUES ($1, $2, $3, $4, $5, 1)
      ON CONFLICT (student_id) DO UPDATE SET
        total_earned = CASE WHEN $8::text = 'credit' THEN xp_balances.total_earned + $6::int ELSE xp_balances.total_earned END,
        total_spent = CASE WHEN $8::text = 'debit' THEN xp_balances.total_spent + $6::int ELSE xp_balances.total_spent END,
        current_balance = $4::int,
        last_transaction_at = $5::timestamptz,
        transaction_count = xp_balances.transaction_count + 1,
        updated_at = NOW()
    `,
    [studentId, balanceAfter, balanceAfter, absoluteAmount, now, absoluteAmount, direction]
  )

  // 9. Audit log
  await pgQuery(
    env,
    `
      INSERT INTO xp_audit_log (id, student_id, transaction_id, action, before_balance, after_balance, actor, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      generateId(),
      studentId,
      transactionId,
      'created',
      balanceBefore.current_balance,
      balanceAfter,
      'system',
      `${eventType}: +${absoluteAmount}`,
    ]
  )

  const newBalance = await getXPBalance(env, studentId)

  // Invalidate cache after balance change
  await invalidateXPCache(env, studentId).catch(() => {})

  return {
    transaction: {
      id: transactionId,
      student_id: studentId,
      personal_id: personalId,
      event_type: eventType,
      amount: direction === 'credit' ? absoluteAmount : -absoluteAmount,
      direction,
      reference_type: referenceType,
      reference_id: referenceId,
      idempotency_key: idempotencyKey,
      metadata,
      notes,
      created_at: now,
      expires_at: expiresAt,
      status: 'settled',
      created_by: 'system',
    } as XPTransaction,
    balanceBefore: balanceBefore.current_balance,
    balanceAfter,
    balanceUpdated: true,
    newBalance,
  }
}

/**
 * Convenience function: credit XP
 */
export async function creditXP(
  env: Bindings,
  studentId: string,
  eventType: XPEventType,
  opts?: Omit<XPTransactionInput, 'studentId' | 'eventType'>
) {
  return createXPTransaction(env, {
    studentId,
    eventType,
    ...opts,
  })
}

/**
 * Convenience function: debit XP
 */
export async function debitXP(
  env: Bindings,
  studentId: string,
  eventType: XPEventType,
  amount: number,
  opts?: Omit<XPTransactionInput, 'studentId' | 'eventType' | 'amount'>
) {
  return createXPTransaction(env, {
    studentId,
    eventType,
    amount: -amount,
    ...opts,
  })
}

/**
 * Get current XP balance for a student (cached via KV)
 */
export async function getXPBalance(env: Bindings, studentId: string): Promise<XPBalance> {
  return getCached<XPBalance>(
    env.KV_CACHE,
    cacheKey('xp:balance', studentId),
    async () => {
      const row = await pgQueryOne<XPBalance>(
        env,
        `
      SELECT student_id, total_earned, total_spent, current_balance, level, next_level_threshold,
             last_transaction_at, transaction_count
      FROM xp_balances
      WHERE student_id = $1
      LIMIT 1
    `,
        [studentId]
      )

      if (!row) {
        return {
          student_id: studentId,
          total_earned: 0,
          total_spent: 0,
          current_balance: 0,
          level: 1,
          next_level_threshold: 100,
          transaction_count: 0,
        }
      }

      return row
    },
    CACHE_STRATEGIES.xp_balance
  )
}

/**
 * Get transaction history for student
 */
export async function getXPHistory(
  env: Bindings,
  studentId: string,
  limit = 50,
  offset = 0
) {
  const { rows } = await pgQuery<XPTransaction>(
    env,
    `
      SELECT id, student_id, personal_id, event_type, amount, direction,
             reference_type, reference_id, idempotency_key, metadata, notes,
             created_at, expires_at, status, created_by
      FROM xp_transactions
      WHERE student_id = $1 AND status != 'expired'
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [studentId, limit, offset]
  )

  return rows
}

/**
 * Expire old XP (90+ days) — call from cron job
 */
export async function expireXPDaily(env: Bindings) {
  const now = new Date().toISOString()

  const { rows: toExpire } = await pgQuery<{ id: string; student_id: string; amount: number }>(
    env,
    `
      SELECT id, student_id, amount
      FROM xp_transactions
      WHERE expires_at < $1 AND status = 'settled'
      LIMIT 100
    `,
    [now]
  )

  for (const tx of toExpire) {
    // Mark as expired
    await pgQuery(
      env,
      `UPDATE xp_transactions SET status = 'expired' WHERE id = $1`,
      [tx.id]
    )

    // Debit from balance
    const balance = await getXPBalance(env, tx.student_id)
    const newBalance = balance.current_balance - Math.abs(tx.amount)

    await pgQuery(
      env,
      `
        UPDATE xp_balances
        SET current_balance = $1, total_spent = total_spent + $2, updated_at = NOW()
        WHERE student_id = $3
      `,
      [newBalance, Math.abs(tx.amount), tx.student_id]
    )

    // Audit
    await pgQuery(
      env,
      `
        INSERT INTO xp_audit_log (id, student_id, transaction_id, action, before_balance, after_balance, actor, reason)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        generateId(),
        tx.student_id,
        tx.id,
        'expired',
        balance.current_balance,
        newBalance,
        'system',
        'XP expiration (90+ days)',
      ]
    )

    // Invalidate cache for affected student
    await invalidateXPCache(env, tx.student_id).catch(() => {})
  }

  return { expiredCount: toExpire.length }
}

/**
 * Reverse a transaction (admin function)
 */
export async function reverseTransaction(
  env: Bindings,
  transactionId: string,
  reason: string,
  adminId: string
) {
  const { rows: tx } = await pgQueryOne<any>(
    env,
    `SELECT * FROM xp_transactions WHERE id = $1 LIMIT 1`,
    [transactionId]
  )

  if (!tx) {
    throw new BadRequestError(`Transaction not found: ${transactionId}`)
  }

  if (tx.status !== 'settled') {
    throw new BadRequestError(`Cannot reverse transaction with status: ${tx.status}`)
  }

  const now = new Date().toISOString()

  // Mark as reversed
  await pgQuery(
    env,
    `
      UPDATE xp_transactions
      SET status = 'reversed', reversed_at = $1, reversal_reason = $2
      WHERE id = $3
    `,
    [now, reason, transactionId]
  )

  // Adjust balance
  const balance = await getXPBalance(env, tx.student_id)
  const newBalance = balance.current_balance - tx.amount  // Reverse the transaction

  await pgQuery(
    env,
    `
      UPDATE xp_balances
      SET current_balance = $1, updated_at = NOW()
      WHERE student_id = $2
    `,
    [newBalance, tx.student_id]
  )

  // Audit
  await pgQuery(
    env,
    `
      INSERT INTO xp_audit_log (id, student_id, transaction_id, action, before_balance, after_balance, actor, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      generateId(),
      tx.student_id,
      transactionId,
      'reversed',
      balance.current_balance,
      newBalance,
      `admin:${adminId}`,
      reason,
    ]
  )

  // Invalidate cache after reversal
  await invalidateXPCache(env, tx.student_id).catch(() => {})

  return { reversedTransaction: tx, newBalance }
}

// ============================================
// DAILY GOALS
// ============================================

export interface DailyGoal {
  id: string
  student_id: string
  goal_date: string
  target_xp: number
  earned_xp: number
  completed: boolean
  completed_at: string | null
  workouts_target: number
  workouts_done: number
}

export interface StreakInfo {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  streak_started_at: string | null
  last_milestone_awarded: number
  freeze_count: number
  max_freezes: number
}

export interface StreakMilestone {
  milestone_days: number
  achieved_at: string
  xp_awarded: number
}

const STREAK_MILESTONES = [3, 7, 30, 100] as const
const STREAK_EVENT_MAP: Record<number, XPEventType> = {
  3: 'streak_3_days',
  7: 'streak_7_days',
  30: 'streak_30_days',
  100: 'streak_100_days',
}

/**
 * Get or create today's daily goal for a student
 */
export async function getOrCreateDailyGoal(
  env: Bindings,
  studentId: string,
  today?: string
): Promise<DailyGoal> {
  const goalDate = today || new Date().toISOString().split('T')[0]

  const existing = await pgQueryOne<DailyGoal>(
    env,
    `SELECT * FROM user_daily_goals WHERE student_id = $1 AND goal_date = $2 LIMIT 1`,
    [studentId, goalDate]
  )

  if (existing) {
    return existing
  }

  // Create today's goal (ON CONFLICT handles race conditions)
  const id = generateId()
  await pgQuery(
    env,
    `INSERT INTO user_daily_goals (id, student_id, goal_date, target_xp, workouts_target)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (student_id, goal_date) DO NOTHING`,
    [id, studentId, goalDate, 50, 1]
  )

  // Re-fetch in case another request created the row concurrently
  const created = await pgQueryOne<DailyGoal>(
    env,
    `SELECT * FROM user_daily_goals WHERE student_id = $1 AND goal_date = $2 LIMIT 1`,
    [studentId, goalDate]
  )

  return created ?? {
    id,
    student_id: studentId,
    goal_date: goalDate,
    target_xp: 50,
    earned_xp: 0,
    completed: false,
    completed_at: null,
    workouts_target: 1,
    workouts_done: 0,
  }
}

/**
 * Update daily goal progress after earning XP
 */
export async function updateDailyGoalProgress(
  env: Bindings,
  studentId: string,
  xpEarned: number,
  isWorkout: boolean
): Promise<{ goal: DailyGoal; justCompleted: boolean }> {
  const today = new Date().toISOString().split('T')[0]
  const goal = await getOrCreateDailyGoal(env, studentId, today)

  const newEarnedXP = goal.earned_xp + xpEarned
  const newWorkoutsDone = isWorkout ? goal.workouts_done + 1 : goal.workouts_done
  const xpMet = newEarnedXP >= goal.target_xp
  const workoutsMet = newWorkoutsDone >= goal.workouts_target
  const nowCompleted = xpMet && workoutsMet
  const justCompleted = nowCompleted && !goal.completed

  const now = new Date().toISOString()

  await pgQuery(
    env,
    `UPDATE user_daily_goals
     SET earned_xp = $1, workouts_done = $2, completed = $3,
         completed_at = CASE WHEN $3 AND completed_at IS NULL THEN $4::timestamptz ELSE completed_at END,
         updated_at = $4
     WHERE student_id = $5 AND goal_date = $6`,
    [newEarnedXP, newWorkoutsDone, nowCompleted, now, studentId, today]
  )

  const updatedGoal: DailyGoal = {
    ...goal,
    earned_xp: newEarnedXP,
    workouts_done: newWorkoutsDone,
    completed: nowCompleted,
    completed_at: justCompleted ? now : goal.completed_at,
  }

  // Invalidate goal cache after update
  await invalidateCache(env.KV_CACHE, [cacheKey('xp:goal', studentId)]).catch(() => {})

  return { goal: updatedGoal, justCompleted }
}

/**
 * Get daily goal history (last N days)
 */
export async function getDailyGoalHistory(
  env: Bindings,
  studentId: string,
  days = 7
): Promise<DailyGoal[]> {
  const { rows } = await pgQuery<DailyGoal>(
    env,
    `SELECT * FROM user_daily_goals
     WHERE student_id = $1
     ORDER BY goal_date DESC
     LIMIT $2`,
    [studentId, days]
  )
  return rows
}

// ============================================
// STREAK MANAGEMENT
// ============================================

/**
 * Get or create streak record for a student (cached via KV)
 */
export async function getOrCreateStreak(
  env: Bindings,
  studentId: string
): Promise<StreakInfo> {
  return getCached<StreakInfo>(
    env.KV_CACHE,
    cacheKey('xp:streak', studentId),
    async () => {
      const existing = await pgQueryOne<StreakInfo>(
        env,
        `SELECT current_streak, longest_streak, last_activity_date, streak_started_at,
            last_milestone_awarded, freeze_count, max_freezes
     FROM xp_streaks WHERE student_id = $1 LIMIT 1`,
        [studentId]
      )

      if (existing) {
        return existing
      }

      // Create streak record — sync from students table
      const studentData = await pgQueryOne<{
        current_streak: number
        longest_streak: number
      }>(
        env,
        `SELECT current_streak, longest_streak FROM students WHERE id = $1 LIMIT 1`,
        [studentId]
      )

      const streak: StreakInfo = {
        current_streak: studentData?.current_streak || 0,
        longest_streak: studentData?.longest_streak || 0,
        last_activity_date: null,
        streak_started_at: null,
        last_milestone_awarded: 0,
        freeze_count: 0,
        max_freezes: 1,
      }

      await pgQuery(
        env,
        `INSERT INTO xp_streaks (id, student_id, current_streak, longest_streak, last_milestone_awarded)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (student_id) DO NOTHING`,
        [generateId(), studentId, streak.current_streak, streak.longest_streak, 0]
      )

      return streak
    },
    CACHE_STRATEGIES.xp_streak
  )
}

/**
 * Update streak after a daily goal completion or workout
 * Returns any newly achieved milestones with XP rewards
 */
export async function updateStreakAndCheckMilestones(
  env: Bindings,
  studentId: string,
  personalId?: string
): Promise<{
  streak: StreakInfo
  newMilestones: Array<{ days: number; xpAwarded: number }>
}> {
  const today = new Date().toISOString().split('T')[0]
  const streak = await getOrCreateStreak(env, studentId)

  // Check if already counted today
  if (streak.last_activity_date === today) {
    return { streak, newMilestones: [] }
  }

  const yesterday = new Date(new Date(today + 'T00:00:00Z').getTime() - 86400000)
    .toISOString().split('T')[0]

  let newCurrentStreak: number
  let newStreakStartedAt: string

  if (streak.last_activity_date === yesterday) {
    // Continuing streak
    newCurrentStreak = streak.current_streak + 1
    newStreakStartedAt = streak.streak_started_at || today
  } else if (!streak.last_activity_date) {
    // First activity ever
    newCurrentStreak = 1
    newStreakStartedAt = today
  } else {
    // Streak broken — check freeze
    if (streak.freeze_count < streak.max_freezes) {
      // Use a freeze (gap of 1 day only)
      const dayBeforeYesterday = new Date(new Date(today + 'T00:00:00Z').getTime() - 2 * 86400000)
        .toISOString().split('T')[0]
      if (streak.last_activity_date === dayBeforeYesterday) {
        newCurrentStreak = streak.current_streak + 1
        newStreakStartedAt = streak.streak_started_at || today
        // Increment freeze usage
        await pgQuery(env,
          `UPDATE xp_streaks SET freeze_count = freeze_count + 1 WHERE student_id = $1`,
          [studentId]
        )
      } else {
        // Gap > 1 day — streak broken even with freeze
        newCurrentStreak = 1
        newStreakStartedAt = today
      }
    } else {
      // No freezes left — streak broken
      newCurrentStreak = 1
      newStreakStartedAt = today
    }
  }

  const newLongest = Math.max(streak.longest_streak, newCurrentStreak)

  // Update streak record
  await pgQuery(
    env,
    `UPDATE xp_streaks
     SET current_streak = $1, longest_streak = $2, last_activity_date = $3,
         streak_started_at = $4, updated_at = NOW()
     WHERE student_id = $5`,
    [newCurrentStreak, newLongest, today, newStreakStartedAt, studentId]
  )

  // Check milestones
  const newMilestones: Array<{ days: number; xpAwarded: number }> = []

  for (const milestone of STREAK_MILESTONES) {
    if (newCurrentStreak >= milestone && streak.last_milestone_awarded < milestone) {
      const eventType = STREAK_EVENT_MAP[milestone]
      if (!eventType) continue

      try {
        const xpResult = await creditXP(env, studentId, eventType, {
          personalId,
          referenceType: 'streak',
          referenceId: `streak_${milestone}_${studentId}`,
          idempotencyKey: `streak:${studentId}:${milestone}:${newStreakStartedAt}`,
          notes: `Streak de ${milestone} dias alcançado!`,
          metadata: { milestone, current_streak: newCurrentStreak, started_at: newStreakStartedAt },
        })

        newMilestones.push({ days: milestone, xpAwarded: xpResult.transaction.amount })

        // Record milestone
        await pgQuery(
          env,
          `INSERT INTO xp_streak_milestones (id, student_id, milestone_days, xp_awarded, transaction_id)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (student_id, milestone_days) DO NOTHING`,
          [generateId(), studentId, milestone, xpResult.transaction.amount, xpResult.transaction.id]
        )

        // Update last_milestone_awarded
        await pgQuery(
          env,
          `UPDATE xp_streaks SET last_milestone_awarded = $1 WHERE student_id = $2`,
          [milestone, studentId]
        )
      } catch {
        // Milestone XP failed (e.g., rate limited) — continue
      }
    }
  }

  const updatedStreak: StreakInfo = {
    current_streak: newCurrentStreak,
    longest_streak: newLongest,
    last_activity_date: today,
    streak_started_at: newStreakStartedAt,
    last_milestone_awarded: newMilestones.length > 0
      ? Math.max(...newMilestones.map((m) => m.days))
      : streak.last_milestone_awarded,
    freeze_count: streak.freeze_count,
    max_freezes: streak.max_freezes,
  }

  // Invalidate streak + milestones cache after update
  await invalidateXPCache(env, studentId).catch(() => {})

  return { streak: updatedStreak, newMilestones }
}

/**
 * Get streak milestones achieved by a student (cached via KV)
 */
export async function getStreakMilestones(
  env: Bindings,
  studentId: string
): Promise<StreakMilestone[]> {
  return getCached<StreakMilestone[]>(
    env.KV_CACHE,
    cacheKey('xp:milestones', studentId),
    async () => {
      const { rows } = await pgQuery<StreakMilestone>(
        env,
        `SELECT milestone_days, achieved_at, xp_awarded
     FROM xp_streak_milestones WHERE student_id = $1
     ORDER BY milestone_days ASC`,
        [studentId]
      )
      return rows
    },
    CACHE_STRATEGIES.xp_milestones
  )
}
