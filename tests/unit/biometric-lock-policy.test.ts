// @vitest-environment node
// ============================================
// biometric-lock-policy.test.ts — Política de app lock (biometria v2, B2)
// ============================================
//
// Cobre lockIntervalMs (4 políticas) e isUnlockDue: sem lastAuthAt, dentro/fora
// da janela, borda exata, policy=off, enabled=false, e clock skew (lastAuthAt no
// futuro não deve travar). `now` é sempre injetado → determinístico.

import { describe, it, expect } from 'vitest'
import {
  lockIntervalMs,
  isUnlockDue,
  isValidLockPolicy,
  DEFAULT_LOCK_POLICY,
  LOCK_POLICIES,
  type LockPolicy,
} from '@/lib/biometric-lock-policy'

const DAY = 24 * 60 * 60 * 1000
const WEEK = 7 * DAY
const NOW = 1_700_000_000_000 // referência fixa, nada de relógio real

describe('lockIntervalMs', () => {
  it('always → 0 (todo boot)', () => expect(lockIntervalMs('always')).toBe(0))
  it('daily → 24h', () => expect(lockIntervalMs('daily')).toBe(DAY))
  it('weekly → 7d', () => expect(lockIntervalMs('weekly')).toBe(WEEK))
  it('off → Infinity (nunca)', () => expect(lockIntervalMs('off')).toBe(Number.POSITIVE_INFINITY))
})

describe('isUnlockDue — guards', () => {
  it('enabled=false → nunca pede unlock', () => {
    expect(isUnlockDue({ enabled: false, lastAuthAt: null, policy: 'always', now: NOW })).toBe(false)
    expect(isUnlockDue({ enabled: false, lastAuthAt: 0, policy: 'daily', now: NOW })).toBe(false)
  })

  it('policy=off → nunca pede unlock, independente de lastAuthAt', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: null, policy: 'off', now: NOW })).toBe(false)
    expect(isUnlockDue({ enabled: true, lastAuthAt: NOW - WEEK * 10, policy: 'off', now: NOW })).toBe(false)
  })

  it('sem lastAuthAt → pede unlock (primeira vez)', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: null, policy: 'daily', now: NOW })).toBe(true)
    expect(isUnlockDue({ enabled: true, lastAuthAt: null, policy: 'weekly', now: NOW })).toBe(true)
    expect(isUnlockDue({ enabled: true, lastAuthAt: null, policy: 'always', now: NOW })).toBe(true)
  })
})

describe('isUnlockDue — janela daily', () => {
  it('dentro da janela → false', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: NOW - (DAY - 1000), policy: 'daily', now: NOW })).toBe(false)
  })
  it('fora da janela → true', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: NOW - (DAY + 1000), policy: 'daily', now: NOW })).toBe(true)
  })
  it('borda exata (== intervalo) → true', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: NOW - DAY, policy: 'daily', now: NOW })).toBe(true)
  })
})

describe('isUnlockDue — janela weekly', () => {
  it('3 dias depois → dentro da janela → false', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: NOW - 3 * DAY, policy: 'weekly', now: NOW })).toBe(false)
  })
  it('8 dias depois → fora da janela → true', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: NOW - 8 * DAY, policy: 'weekly', now: NOW })).toBe(true)
  })
})

describe('isUnlockDue — always', () => {
  it('qualquer lastAuthAt no passado → true', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: NOW - 1, policy: 'always', now: NOW })).toBe(true)
  })
  it('lastAuthAt == now → true (intervalo 0)', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: NOW, policy: 'always', now: NOW })).toBe(true)
  })
})

describe('isUnlockDue — clock skew (lastAuthAt no futuro)', () => {
  it('daily: futuro → false (não trava por relógio inconsistente)', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: NOW + DAY, policy: 'daily', now: NOW })).toBe(false)
  })
  it('always: futuro → false', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: NOW + WEEK, policy: 'always', now: NOW })).toBe(false)
  })
})

describe('isUnlockDue — default now', () => {
  it('lastAuthAt=0 (epoch) sem passar now → true (janela vencida há décadas)', () => {
    expect(isUnlockDue({ enabled: true, lastAuthAt: 0, policy: 'daily' })).toBe(true)
  })
})

describe('metadata + validação', () => {
  it('DEFAULT_LOCK_POLICY é daily', () => {
    expect(DEFAULT_LOCK_POLICY).toBe('daily')
  })
  it('LOCK_POLICIES tem as 4 políticas', () => {
    expect([...LOCK_POLICIES].sort()).toEqual(['always', 'daily', 'off', 'weekly'])
  })
  it('isValidLockPolicy aceita as 4 políticas', () => {
    for (const p of LOCK_POLICIES as readonly LockPolicy[]) {
      expect(isValidLockPolicy(p)).toBe(true)
    }
  })
  it('isValidLockPolicy rejeita valores inválidos', () => {
    expect(isValidLockPolicy('monthly')).toBe(false)
    expect(isValidLockPolicy(null)).toBe(false)
    expect(isValidLockPolicy(undefined)).toBe(false)
    expect(isValidLockPolicy('')).toBe(false)
    expect(isValidLockPolicy(42)).toBe(false)
  })
})
