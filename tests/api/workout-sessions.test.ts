import { describe, expect, it } from 'vitest'
import { sessionAdvanceSchema, sessionLogSchema } from '@workers/schemas/workout-sessions'

describe('workout-sessions schemas', () => {
  it('aceita advance sem payload', () => {
    const parsed = sessionAdvanceSchema.safeParse({})
    expect(parsed.success).toBe(true)
  })

  it('aceita advance com force_phase e rest válido', () => {
    const parsed = sessionAdvanceSchema.safeParse({
      force_phase: 'rest',
      rest_remaining_seconds: 90,
    })
    expect(parsed.success).toBe(true)
  })

  it('rejeita advance com phase inválida', () => {
    const parsed = sessionAdvanceSchema.safeParse({ force_phase: 'invalid_phase' })
    expect(parsed.success).toBe(false)
  })

  it('rejeita rest acima de 3600', () => {
    const parsed = sessionAdvanceSchema.safeParse({ rest_remaining_seconds: 3601 })
    expect(parsed.success).toBe(false)
  })

  it('aceita log completo', () => {
    const parsed = sessionLogSchema.safeParse({
      exercise_id: 'bench-press',
      sets_done: 4,
      reps_done: '12',
      load_used: '60kg',
      notes: 'Execução estável',
    })
    expect(parsed.success).toBe(true)
  })

  it('rejeita sets_done negativo', () => {
    const parsed = sessionLogSchema.safeParse({
      exercise_id: 'bench-press',
      sets_done: -1,
    })
    expect(parsed.success).toBe(false)
  })

  it('rejeita sets_done acima de 100', () => {
    const parsed = sessionLogSchema.safeParse({
      exercise_id: 'bench-press',
      sets_done: 101,
    })
    expect(parsed.success).toBe(false)
  })
})
