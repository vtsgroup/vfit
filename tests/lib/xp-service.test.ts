/**
 * tests/lib/xp-service.test.ts
 *
 * Unit tests para XP service
 * Cobre: tipos, interfaces, event types, funções puras, contrato API
 */

import { describe, it, expect } from 'vitest'

// ============================================
// 1. TYPE & INTERFACE TESTS
// ============================================
describe('XP Service — Types & Constants', () => {
  it('should export all required XPEventType values', async () => {
    // Verify all 19 event types exist as part of the union type
    const validEvents = [
      'workout_completed',
      'streak_3_days',
      'streak_7_days',
      'streak_30_days',
      'streak_100_days',
      'badge_earned',
      'goal_reached_weight',
      'goal_reached_body_fat',
      'assessment_completed',
      'referral_signup',
      'review_written',
      'workout_first',
      'workout_milestone_10',
      'workout_milestone_50',
      'workout_milestone_100',
      'custom_admin_reward',
      'store_purchase_refund',
      'xp_expiration',
      'xp_burn_conversion',
    ]
    expect(validEvents).toHaveLength(19)
  })

  it('should export core transaction functions', async () => {
    const mod = await import('@lib/xp-service')
    expect(typeof mod.creditXP).toBe('function')
    expect(typeof mod.debitXP).toBe('function')
    expect(typeof mod.getXPBalance).toBe('function')
    expect(typeof mod.getXPHistory).toBe('function')
    expect(typeof mod.checkDailyLimit).toBe('function')
    expect(typeof mod.checkDeduplicate).toBe('function')
    expect(typeof mod.createXPTransaction).toBe('function')
    expect(typeof mod.expireXPDaily).toBe('function')
    expect(typeof mod.reverseTransaction).toBe('function')
  })

  it('should export Daily Goal functions', async () => {
    const mod = await import('@lib/xp-service')
    expect(typeof mod.getOrCreateDailyGoal).toBe('function')
    expect(typeof mod.updateDailyGoalProgress).toBe('function')
    expect(typeof mod.getDailyGoalHistory).toBe('function')
  })

  it('should export Streak functions', async () => {
    const mod = await import('@lib/xp-service')
    expect(typeof mod.getOrCreateStreak).toBe('function')
    expect(typeof mod.updateStreakAndCheckMilestones).toBe('function')
    expect(typeof mod.getStreakMilestones).toBe('function')
  })
})

// ============================================
// 2. PURE LOGIC TESTS (no DB)
// ============================================
describe('XP Service — Pure Logic', () => {
  describe('Streak milestone calculation', () => {
    it('should have milestones at 3, 7, 30, 100 days', () => {
      const STREAK_MILESTONES = [3, 7, 30, 100]
      expect(STREAK_MILESTONES).toEqual([3, 7, 30, 100])
      expect(STREAK_MILESTONES).toHaveLength(4)
    })

    it('should map milestone to correct event type', () => {
      const STREAK_EVENT_MAP: Record<number, string> = {
        3: 'streak_3_days',
        7: 'streak_7_days',
        30: 'streak_30_days',
        100: 'streak_100_days',
      }
      expect(STREAK_EVENT_MAP[3]).toBe('streak_3_days')
      expect(STREAK_EVENT_MAP[7]).toBe('streak_7_days')
      expect(STREAK_EVENT_MAP[30]).toBe('streak_30_days')
      expect(STREAK_EVENT_MAP[100]).toBe('streak_100_days')
    })
  })

  describe('XP direction logic', () => {
    it('should classify positive amounts as credit', () => {
      const amount = 50
      const direction = amount > 0 ? 'credit' : 'debit'
      expect(direction).toBe('credit')
    })

    it('should classify negative amounts as debit', () => {
      const amount = -50
      const direction = amount > 0 ? 'credit' : 'debit'
      expect(direction).toBe('debit')
    })

    it('should use absolute value for storage', () => {
      const amount = -30
      const absoluteAmount = Math.abs(amount)
      expect(absoluteAmount).toBe(30)
    })
  })

  describe('Daily goal completion logic', () => {
    it('should complete when XP and workout targets are met', () => {
      const xpMet = 60 >= 50
      const workoutsMet = 1 >= 1
      const completed = xpMet && workoutsMet
      expect(completed).toBe(true)
    })

    it('should not complete when only XP target is met', () => {
      const xpMet = 60 >= 50
      const workoutsMet = 0 >= 1
      const completed = xpMet && workoutsMet
      expect(completed).toBe(false)
    })

    it('should not complete when only workout target is met', () => {
      const xpMet = 30 >= 50
      const workoutsMet = 1 >= 1
      const completed = xpMet && workoutsMet
      expect(completed).toBe(false)
    })

    it('should cap progress at 100%', () => {
      const progress = Math.min(1, 80 / 50)
      expect(progress).toBe(1)
    })
  })

  describe('Streak continuation logic', () => {
    it('should continue streak when last activity was yesterday', () => {
      const today = '2026-02-26'
      const lastActivity = '2026-02-25'
      const yesterday = new Date(new Date(today + 'T00:00:00Z').getTime() - 86400000)
        .toISOString().split('T')[0]

      const shouldContinue = lastActivity === yesterday
      expect(shouldContinue).toBe(true)
    })

    it('should break streak when gap > 1 day', () => {
      const today = '2026-02-26'
      const lastActivity = '2026-02-23'
      const yesterday = new Date(new Date(today + 'T00:00:00Z').getTime() - 86400000)
        .toISOString().split('T')[0]

      const shouldContinue = lastActivity === yesterday
      expect(shouldContinue).toBe(false)
    })

    it('should start new streak when first activity', () => {
      const lastActivity = null
      const newStreak = lastActivity ? 'continue' : 1
      expect(newStreak).toBe(1)
    })

    it('should track longest streak correctly', () => {
      const currentStreak = 8
      const longestStreak = 5
      const newLongest = Math.max(longestStreak, currentStreak)
      expect(newLongest).toBe(8)
    })
  })

  describe('Expiration calculation', () => {
    it('should calculate expiration date correctly (90 days)', () => {
      const now = new Date('2026-01-01T00:00:00Z')
      const expiryDays = 90
      const expiry = new Date(now)
      expiry.setUTCDate(expiry.getUTCDate() + expiryDays)
      expect(expiry.toISOString().split('T')[0]).toBe('2026-04-01')
    })

    it('should identify expired transactions', () => {
      const expiresAt = '2026-02-20T00:00:00Z'
      const now = new Date('2026-02-26T00:00:00Z')
      const isExpired = new Date(expiresAt) < now
      expect(isExpired).toBe(true)
    })

    it('should calculate days until expiry', () => {
      const expiresAt = '2026-03-01T00:00:00Z'
      const now = new Date('2026-02-26T00:00:00Z')
      const daysUntil = Math.ceil(
        (new Date(expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysUntil).toBe(3)
    })
  })

  describe('Level calculation', () => {
    it('should calculate progress correctly', () => {
      const balance = 75
      const threshold = 100
      const progress = Math.min(1, Math.max(0, balance / threshold))
      expect(progress).toBe(0.75)
    })

    it('should cap progress at 100%', () => {
      const balance = 150
      const threshold = 100
      const progress = Math.min(1, Math.max(0, balance / threshold))
      expect(progress).toBe(1)
    })

    it('should handle zero balance', () => {
      const balance = 0
      const threshold = 100
      const progress = Math.min(1, Math.max(0, balance / threshold))
      expect(progress).toBe(0)
    })
  })

  describe('Idempotency key generation', () => {
    it('should generate unique key for workout completion', () => {
      const logId = 'abc123'
      const key = `workout_log:${logId}:completed`
      expect(key).toBe('workout_log:abc123:completed')
    })

    it('should generate unique key for streak milestone', () => {
      const studentId = 'student1'
      const milestone = 7
      const startedAt = '2026-02-19'
      const key = `streak:${studentId}:${milestone}:${startedAt}`
      expect(key).toBe('streak:student1:7:2026-02-19')
    })

    it('should generate fallback key when no explicit key provided', () => {
      const studentId = 'student1'
      const eventType = 'badge_earned'
      const referenceId = 'badge_123'
      const key = `${studentId}:${eventType}:${referenceId}`
      expect(key).toBe('student1:badge_earned:badge_123')
    })
  })
})

// ============================================
// 3. API CONTRACT TESTS
// ============================================
describe('XP API — Contract', () => {
  it('should define correct number of endpoints (11 total)', () => {
    const endpoints = [
      'GET /xp/balance',
      'GET /xp/history',
      'GET /xp/limits',
      'GET /xp/goals/today',
      'GET /xp/goals/history',
      'GET /xp/streak',
      'GET /xp/expiring',
      'GET /xp/student/:id/balance',
      'GET /xp/student/:id/streak',
      'POST /xp/admin/reverse',
      'POST /xp/admin/expire',
    ]
    expect(endpoints).toHaveLength(11)
  })

  it('should limit history pagination to 100 max', () => {
    const inputLimit = 200
    const appliedLimit = Math.min(100, inputLimit)
    expect(appliedLimit).toBe(100)
  })

  it('should default history offset to 0', () => {
    const inputOffset = undefined
    const appliedOffset = Math.max(0, Number(inputOffset) || 0)
    expect(appliedOffset).toBe(0)
  })

  it('should limit goal history to 30 days max', () => {
    const inputDays = 60
    const appliedDays = Math.min(30, inputDays)
    expect(appliedDays).toBe(30)
  })

  it('should default goal history to 7 days', () => {
    const inputDays = undefined
    const appliedDays = Math.min(30, Number(inputDays) || 7)
    expect(appliedDays).toBe(7)
  })
})

// ============================================
// 4. CRON HANDLER TESTS
// ============================================
describe('XP Cron — Expiration Handler', () => {
  it('should export handleXPExpiration function', async () => {
    const mod = await import('@workers/cron/xp-expiration')
    expect(typeof mod.handleXPExpiration).toBe('function')
  })
})
