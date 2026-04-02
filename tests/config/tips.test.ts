/**
 * tests/config/tips.test.ts
 *
 * Sprint 39 — Testes do sistema de dicas
 */

import { describe, expect, it } from 'vitest'
import { TIPS, TIP_CATEGORIES, getTipOfTheDay } from '../../config/tips'

describe('TIPS', () => {
  it('deve ter pelo menos 25 dicas', () => {
    expect(TIPS.length).toBeGreaterThanOrEqual(25)
  })

  it('cada dica deve ter todos os campos obrigatórios', () => {
    for (const tip of TIPS) {
      expect(tip.id).toBeTruthy()
      expect(tip.category).toBeTruthy()
      expect(tip.title).toBeTruthy()
      expect(tip.content).toBeTruthy()
      expect(tip.icon).toBeTruthy()
    }
  })

  it('categorias devem ser válidas', () => {
    const validCategories = ['nutrition', 'training', 'recovery', 'mindset']
    for (const tip of TIPS) {
      expect(validCategories).toContain(tip.category)
    }
  })

  it('IDs devem ser únicos', () => {
    const ids = TIPS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('deve ter dicas em todas as 4 categorias', () => {
    const categories = new Set(TIPS.map((t) => t.category))
    expect(categories.size).toBe(4)
  })
})

describe('TIP_CATEGORIES', () => {
  it('deve ter 5 categorias (incluindo "all")', () => {
    expect(TIP_CATEGORIES.length).toBe(5)
  })

  it('primeira categoria deve ser "all"', () => {
    expect(TIP_CATEGORIES[0].id).toBe('all')
  })
})

describe('getTipOfTheDay', () => {
  it('deve retornar uma dica válida', () => {
    const tip = getTipOfTheDay()
    expect(tip).toBeDefined()
    expect(tip.id).toBeTruthy()
    expect(tip.title).toBeTruthy()
    expect(tip.content).toBeTruthy()
  })

  it('deve retornar a mesma dica no mesmo dia', () => {
    const tip1 = getTipOfTheDay()
    const tip2 = getTipOfTheDay()
    expect(tip1.id).toBe(tip2.id)
  })
})
