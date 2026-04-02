/**
 * tests/config/xp-levels.test.ts
 *
 * Sprint 39 — Testes do sistema de XP e níveis
 */

import { describe, expect, it } from 'vitest'
import { LEVEL_THRESHOLDS, XP_PER_ACTION, BADGES } from '../../config/constants'

describe('LEVEL_THRESHOLDS', () => {
  it('deve ter 19 thresholds (nível 2 a 20)', () => {
    expect(LEVEL_THRESHOLDS.length).toBe(19)
  })

  it('deve estar em ordem crescente', () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1])
    }
  })

  it('nível 2 requer 100 XP', () => {
    expect(LEVEL_THRESHOLDS[0]).toBe(100)
  })

  it('nível 20 requer 36000 XP', () => {
    expect(LEVEL_THRESHOLDS[18]).toBe(36000)
  })
})

describe('XP_PER_ACTION', () => {
  it('treino completado deve dar 50 XP', () => {
    expect(XP_PER_ACTION.workout_completed).toBe(50)
  })

  it('recorde pessoal deve dar 30 XP', () => {
    expect(XP_PER_ACTION.personal_record).toBe(30)
  })

  it('primeiro treino deve dar 100 XP (bônus)', () => {
    expect(XP_PER_ACTION.first_workout).toBe(100)
  })

  it('todas as ações devem ter XP positivo', () => {
    for (const [, xp] of Object.entries(XP_PER_ACTION)) {
      expect(xp).toBeGreaterThan(0)
    }
  })
})

describe('BADGES', () => {
  it('deve ter pelo menos 10 badges', () => {
    expect(Object.keys(BADGES).length).toBeGreaterThanOrEqual(10)
  })

  it('cada badge deve ter name, description, icon, points', () => {
    for (const [, badge] of Object.entries(BADGES)) {
      expect(badge).toHaveProperty('name')
      expect(badge).toHaveProperty('description')
      expect(badge).toHaveProperty('icon')
      expect(badge).toHaveProperty('points')
      expect(typeof badge.name).toBe('string')
      expect(typeof badge.points).toBe('number')
      expect(badge.points).toBeGreaterThan(0)
    }
  })

  it('streak badges devem existir (7, 30, 100)', () => {
    expect(BADGES.streak_7).toBeDefined()
    expect(BADGES.streak_30).toBeDefined()
    expect(BADGES.streak_100).toBeDefined()
  })

  it('workout milestones devem existir (10, 50, 100)', () => {
    expect(BADGES.workouts_10).toBeDefined()
    expect(BADGES.workouts_50).toBeDefined()
    expect(BADGES.workouts_100).toBeDefined()
  })
})
