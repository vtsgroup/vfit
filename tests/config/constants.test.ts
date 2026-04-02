// ============================================
// Tests: config/constants.ts — Application constants
// ============================================

import { describe, it, expect } from 'vitest'
import {
  APP_CONFIG,
  PLANS,
  FEES,
  AFFILIATE_TIERS,
  BADGES,
  RATE_LIMITS,
  CACHE_TTL,
} from '@config/constants'

describe('APP_CONFIG', () => {
  it('deve ter nome e domínio corretos', () => {
    expect(APP_CONFIG.name).toBe('VFIT')
    expect(APP_CONFIG.domain).toBe('iapersonal.app.br')
  })
})

describe('PLANS', () => {
  it('deve ter 4 planos: trial, pro, profissional, max', () => {
    expect(Object.keys(PLANS)).toEqual(['trial', 'pro', 'profissional', 'max'])
  })

  it('trial deve ser gratuito sem limite de tempo e 5 alunos', () => {
    expect(PLANS.trial.price_brl).toBe(0)
    expect(PLANS.trial.duration_days).toBeNull()
    expect(PLANS.trial.max_students).toBe(5)
  })

  it('pro deve custar R$29.90 com alunos ilimitados', () => {
    expect(PLANS.pro.price_brl).toBe(29.90)
    expect(PLANS.pro.max_students).toBe(-1)
  })

  it('max deve custar R$129.90 com alunos ilimitados (-1)', () => {
    expect(PLANS.max.price_brl).toBe(129.90)
    expect(PLANS.max.max_students).toBe(-1)
  })

  it('todos os planos devem ter features', () => {
    for (const plan of Object.values(PLANS) as { features: readonly string[] }[]) {
      expect(plan.features.length).toBeGreaterThan(0)
    }
  })
})

describe('FEES', () => {
  it('platform fee deve ser 3.5%', () => {
    expect(FEES.platform_fee_percentage).toBe(3.5)
  })

  it('marketplace split deve somar 100%', () => {
    expect(FEES.marketplace_platform_share + FEES.marketplace_creator_share).toBe(100)
  })
})

describe('AFFILIATE_TIERS', () => {
  it('deve ter 3 tiers: 25, 30, 35', () => {
    expect(Object.keys(AFFILIATE_TIERS)).toEqual(['25', '30', '35'])
  })

  it('comissões devem ser crescentes', () => {
    const tiers = Object.values(AFFILIATE_TIERS) as { commission_percentage: number }[]
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i].commission_percentage).toBeGreaterThan(tiers[i - 1].commission_percentage)
    }
  })
})

describe('BADGES', () => {
  it('deve ter 10 badges', () => {
    expect(Object.keys(BADGES)).toHaveLength(10)
  })

  it('todos os badges devem ter name, description, icon, points', () => {
    for (const [, badge] of Object.entries(BADGES) as [string, { name: string; description: string; icon: string; points: number }][]) {
      expect(badge.name).toBeDefined()
      expect(badge.description).toBeDefined()
      expect(badge.icon).toBeDefined()
      expect(badge.points).toBeGreaterThan(0)
    }
  })

  it('badges de streak devem ter pontos crescentes', () => {
    expect(BADGES.streak_7.points).toBeLessThan(BADGES.streak_30.points)
    expect(BADGES.streak_30.points).toBeLessThan(BADGES.streak_100.points)
  })
})

describe('RATE_LIMITS', () => {
  it('login deve ter 5 tentativas por 15 minutos', () => {
    expect(RATE_LIMITS['/api/v1/auth/login']).toEqual({ max: 5, windowSeconds: 900 })
  })

  it('register deve ter 3 tentativas por hora', () => {
    expect(RATE_LIMITS['/api/v1/auth/register']).toEqual({ max: 3, windowSeconds: 3600 })
  })

  it('forgot-password e reset-password devem ter limite definido', () => {
    expect(RATE_LIMITS['/api/v1/auth/forgot-password']).toBeDefined()
    expect(RATE_LIMITS['/api/v1/auth/reset-password']).toBeDefined()
  })

  it('todos os paths específicos devem usar prefixo /api/v1/', () => {
    for (const key of Object.keys(RATE_LIMITS)) {
      if (key === 'default') continue
      expect(key).toMatch(/^\/api\/v1\//)
    }
  })

  it('rotas de auth devem ser mais restritivas que o default', () => {
    const defaultLimit = RATE_LIMITS.default
    expect(RATE_LIMITS['/api/v1/auth/login'].max).toBeLessThan(defaultLimit.max)
    expect(RATE_LIMITS['/api/v1/auth/register'].max).toBeLessThan(defaultLimit.max)
  })

  it('default deve ter 100 req/min', () => {
    expect(RATE_LIMITS.default).toEqual({ max: 100, windowSeconds: 60 })
  })

  it('todos os limites devem ter max e windowSeconds positivos', () => {
    for (const limit of Object.values(RATE_LIMITS) as { max: number; windowSeconds: number }[]) {
      expect(limit.max).toBeGreaterThan(0)
      expect(limit.windowSeconds).toBeGreaterThan(0)
    }
  })
})

describe('CACHE_TTL', () => {
  it('exercises deve ter TTL de 7 dias', () => {
    expect(CACHE_TTL.exercises).toBe(7 * 24 * 60 * 60)
  })

  it('sessions deve ter TTL de 24 horas', () => {
    expect(CACHE_TTL.sessions).toBe(24 * 60 * 60)
  })

  it('todos os TTLs devem ser positivos', () => {
    for (const ttl of Object.values(CACHE_TTL)) {
      expect(ttl).toBeGreaterThan(0)
    }
  })
})
