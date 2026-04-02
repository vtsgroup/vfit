// ============================================
// Tests: lib/cache.ts — Cache Strategy helpers
// ============================================

import { describe, it, expect } from 'vitest'
import { cacheKey, listCacheKey, CACHE_STRATEGIES } from '@lib/cache'

describe('cacheKey()', () => {
  it('deve gerar chave no formato prefix:id', () => {
    expect(cacheKey('profile', 'user_123')).toBe('profile:user_123')
  })

  it('deve funcionar com prefixos compostos', () => {
    expect(cacheKey('workout:exercises', 'w_456')).toBe('workout:exercises:w_456')
  })
})

describe('listCacheKey()', () => {
  it('deve gerar chave com params ordenados alfabeticamente', () => {
    const key = listCacheKey('workouts', { page: 1, per_page: 20, status: 'active' })
    expect(key).toBe('workouts:list:page=1&per_page=20&status=active')
  })

  it('deve gerar a mesma chave independente da ordem dos params', () => {
    const key1 = listCacheKey('students', { status: 'active', page: 2 })
    const key2 = listCacheKey('students', { page: 2, status: 'active' })
    expect(key1).toBe(key2)
  })

  it('deve funcionar com params vazio', () => {
    const key = listCacheKey('exercises', {})
    expect(key).toBe('exercises:list:')
  })
})

describe('CACHE_STRATEGIES', () => {
  it('deve ter strategy para exercises com TTL de 7 dias', () => {
    expect(CACHE_STRATEGIES.exercises).toBeDefined()
    expect(CACHE_STRATEGIES.exercises.ttl).toBe(7 * 24 * 60 * 60)
  })

  it('deve ter strategy para sessions sem staleWhileRevalidate', () => {
    expect(CACHE_STRATEGIES.sessions).toBeDefined()
    expect(CACHE_STRATEGIES.sessions.staleWhileRevalidate).toBeUndefined()
  })

  it('deve ter todas as strategies esperadas', () => {
    const expected = ['exercises', 'templates', 'workouts', 'sessions', 'profiles', 'public_profile']
    for (const key of expected) {
      expect(CACHE_STRATEGIES).toHaveProperty(key)
      expect(CACHE_STRATEGIES[key].ttl).toBeGreaterThan(0)
    }
  })
})
