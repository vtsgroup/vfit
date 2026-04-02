// ============================================
// Tests: lib/db.ts — Database helper utilities
// ============================================

import { describe, it, expect } from 'vitest'
import { parsePagination, generateId, prefixedId } from '@lib/db'

describe('parsePagination()', () => {
  it('deve retornar valores padrão para URL sem params', () => {
    const url = new URL('https://api.test/endpoint')
    const result = parsePagination(url)
    expect(result).toEqual({ page: 1, per_page: 20, offset: 0 })
  })

  it('deve parsear page e per_page da query string', () => {
    const url = new URL('https://api.test/endpoint?page=3&per_page=10')
    const result = parsePagination(url)
    expect(result).toEqual({ page: 3, per_page: 10, offset: 20 })
  })

  it('deve limitar per_page ao máximo de 100', () => {
    const url = new URL('https://api.test/endpoint?per_page=500')
    const result = parsePagination(url)
    expect(result.per_page).toBe(100)
  })

  it('deve garantir page mínimo de 1', () => {
    const url = new URL('https://api.test/endpoint?page=0')
    const result = parsePagination(url)
    expect(result.page).toBe(1)
  })

  it('deve garantir page mínimo de 1 para valores negativos', () => {
    const url = new URL('https://api.test/endpoint?page=-5')
    const result = parsePagination(url)
    expect(result.page).toBe(1)
  })

  it('deve usar default 20 quando per_page=0 (falsy)', () => {
    const url = new URL('https://api.test/endpoint?per_page=0')
    const result = parsePagination(url)
    expect(result.per_page).toBe(20) // 0 é falsy → || 20
  })

  it('deve calcular offset correto', () => {
    const url = new URL('https://api.test/endpoint?page=5&per_page=10')
    const result = parsePagination(url)
    expect(result.offset).toBe(40) // (5-1) * 10
  })

  it('deve tratar params não numéricos como default', () => {
    const url = new URL('https://api.test/endpoint?page=abc&per_page=xyz')
    const result = parsePagination(url)
    expect(result).toEqual({ page: 1, per_page: 20, offset: 0 })
  })
})

describe('generateId()', () => {
  it('deve retornar UUID v4 válido', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('deve gerar IDs únicos', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(100)
  })
})

describe('prefixedId()', () => {
  it('deve gerar ID com prefixo', () => {
    const id = prefixedId('usr')
    expect(id).toMatch(/^usr_[0-9a-f]{16}$/)
  })

  it('deve gerar IDs únicos com mesmo prefixo', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 50; i++) {
      ids.add(prefixedId('pay'))
    }
    expect(ids.size).toBe(50)
  })

  it('deve ter formato prefix_hex16', () => {
    const id = prefixedId('wkt')
    const [prefix, hex] = id.split('_')
    expect(prefix).toBe('wkt')
    expect(hex).toHaveLength(16)
    expect(hex).toMatch(/^[0-9a-f]+$/)
  })
})
