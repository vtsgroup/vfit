/**
 * tests/lib/marketplace-delivery.test.ts
 *
 * Testes do parser tolerante de plan_content → dias canônicos.
 * Shape real do form de criação: {weeks:[{week,days:[{day,exercises:[{name,sets,reps:'12',rest:'60s',notes}]}]}]}
 */

import { describe, it, expect } from 'vitest'
import { parsePlanContent } from '@lib/marketplace-delivery'

describe('parsePlanContent — shape do form de criação (weeks)', () => {
  const formContent = {
    weeks: [
      {
        week: 1,
        days: [
          {
            day: 'Segunda',
            exercises: [
              { name: 'Supino Reto', sets: 4, reps: '8-12', rest: '90s', notes: 'Barra' },
              { name: 'Crucifixo', sets: 3, reps: '12', rest: '60s', notes: '' },
            ],
          },
          {
            day: 'Quarta',
            exercises: [{ name: 'Agachamento', sets: 5, reps: '5', rest: '120s', notes: '' }],
          },
        ],
      },
      {
        week: 2,
        days: [
          {
            day: 'Segunda',
            exercises: [{ name: 'Levantamento Terra', sets: 3, reps: '6', rest: '180s', notes: '' }],
          },
        ],
      },
    ],
  }

  it('should flatten weeks into sequential days', () => {
    const days = parsePlanContent(formContent)
    expect(days).toHaveLength(3)
    expect(days[0].name).toBe('Segunda')
    expect(days[1].name).toBe('Quarta')
  })

  it('should coerce reps string ranges to first integer', () => {
    const days = parsePlanContent(formContent)
    expect(days[0].exercises[0].reps).toBe(8) // '8-12' → 8
    expect(days[0].exercises[1].reps).toBe(12)
  })

  it('should coerce rest strings like "90s" to seconds', () => {
    const days = parsePlanContent(formContent)
    expect(days[0].exercises[0].rest_seconds).toBe(90)
    expect(days[2].exercises[0].rest_seconds).toBe(180)
  })

  it('should keep sets as numbers', () => {
    const days = parsePlanContent(formContent)
    expect(days[0].exercises[0].sets).toBe(4)
    expect(days[1].exercises[0].sets).toBe(5)
  })
})

describe('parsePlanContent — shape genérico (days) e tolerância', () => {
  it('should accept generic {days:[...]} shape with exercise_name', () => {
    const days = parsePlanContent({
      days: [
        {
          name: 'Peito + Tríceps',
          focus: 'força',
          exercises: [
            { exercise_name: 'Supino', target_muscle: 'peito', sets: 4, reps: 8, rest_seconds: 90 },
          ],
        },
      ],
    })
    expect(days).toHaveLength(1)
    expect(days[0].focus).toBe('força')
    expect(days[0].exercises[0].name).toBe('Supino')
    expect(days[0].exercises[0].muscle_group).toBe('peito')
    expect(days[0].muscle_groups).toEqual(['peito'])
  })

  it('should parse JSON string content', () => {
    const days = parsePlanContent(
      JSON.stringify({ days: [{ name: 'A', exercises: [{ name: 'Remada', sets: 3, reps: 10 }] }] })
    )
    expect(days).toHaveLength(1)
    expect(days[0].exercises[0].rest_seconds).toBe(60) // default
  })

  it('should drop days without valid exercises', () => {
    const days = parsePlanContent({
      days: [
        { name: 'Vazio', exercises: [] },
        { name: 'Sem nome', exercises: [{ sets: 3 }] },
        { name: 'OK', exercises: [{ name: 'Rosca', sets: 3, reps: 10 }] },
      ],
    })
    expect(days).toHaveLength(1)
    expect(days[0].name).toBe('OK')
  })

  it('should return empty for garbage input', () => {
    expect(parsePlanContent(null)).toEqual([])
    expect(parsePlanContent('not json')).toEqual([])
    expect(parsePlanContent({ foo: 'bar' })).toEqual([])
    expect(parsePlanContent(42)).toEqual([])
  })

  it('should apply defaults for missing sets/reps/rest', () => {
    const days = parsePlanContent({
      days: [{ name: 'A', exercises: [{ name: 'Prancha' }] }],
    })
    expect(days[0].exercises[0].sets).toBe(3)
    expect(days[0].exercises[0].reps).toBe(10)
    expect(days[0].exercises[0].rest_seconds).toBe(60)
  })
})
