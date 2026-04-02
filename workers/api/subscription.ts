/**
 * workers/api/subscription.ts
 *
 * Subscription API — VFIT B2C
 *
 * GET /api/v1/subscription/status — Status da assinatura
 *
 * Auth: requireAuth
 * DB: users (Neon)
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { pgQueryOne } from '@lib/db'
import { success } from '@lib/response'
import { authMiddleware } from '@workers/middleware/auth'

const subscription = new Hono<AppContext>()

subscription.use('*', authMiddleware)

/**
 * GET /api/v1/subscription/status
 * Returns current subscription plan and limits
 */
subscription.get('/status', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  const user = await pgQueryOne<{
    subscription_plan: string | null
    subscription_status: string | null
    subscription_expires_at: string | null
    trial_ends_at: string | null
  }>(env, `
    SELECT p.subscription_plan, p.subscription_status,
           p.subscription_expires_at, p.trial_ends_at
    FROM personals p
    WHERE p.id = $1
    LIMIT 1
  `, [userId])

  // Default to free plan for users without personal record
  const plan = user?.subscription_plan || 'free'
  const status = user?.subscription_status || 'active'
  const expiresAt = user?.subscription_expires_at || null
  const trialEndsAt = user?.trial_ends_at || null

  // Check if trial/subscription is expired
  const now = new Date()
  const isExpired = expiresAt ? new Date(expiresAt) < now : false
  const isTrialExpired = trialEndsAt ? new Date(trialEndsAt) < now : false

  // Determine effective plan
  let effectivePlan = plan
  if (isExpired || isTrialExpired) {
    effectivePlan = 'free'
  }

  // Map B2B plan names to B2C equivalents
  const b2cPlan = mapToB2CPlan(effectivePlan)

  return success({
    plan: b2cPlan,
    status: isExpired ? 'expired' : status,
    expires_at: expiresAt,
    trial_ends_at: trialEndsAt,
    is_premium: b2cPlan !== 'free',
    limits: getPlanLimits(b2cPlan),
  })
})

function mapToB2CPlan(plan: string): string {
  // Map existing B2B plans to B2C equivalents
  switch (plan) {
    case 'trial':
    case 'free':
      return 'free'
    case 'pro':
    case 'profissional':
    case 'max':
    case 'premium':
    case 'premium_annual':
      return 'premium'
    default:
      return 'free'
  }
}

function getPlanLimits(plan: string) {
  if (plan === 'premium') {
    return {
      ai_plans_per_month: -1,
      workouts_per_week: -1,
      ai_chat_messages: -1,
      exercise_library: 'full',
      streak_freezes: -1,
    }
  }

  return {
    ai_plans_per_month: 1,
    workouts_per_week: 3,
    ai_chat_messages: 10,
    exercise_library: 'basic',
    streak_freezes: 1,
  }
}

export { subscription as subscriptionRoutes }
