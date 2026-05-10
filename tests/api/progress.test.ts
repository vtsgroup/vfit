import { describe, expect, it } from 'vitest'
import { TOP_EXERCISES_QUERY } from '@workers/api/progress'

describe('progress routes', () => {
  it('mantém top-exercises usando apenas tabelas hot-data no Neon', () => {
    expect(TOP_EXERCISES_QUERY).toContain('FROM exercise_logs el')
    expect(TOP_EXERCISES_QUERY).toContain('JOIN workout_sessions ws')
    expect(TOP_EXERCISES_QUERY).not.toMatch(/\bJOIN\s+exercises\b/i)
  })
})