// ============================================
// Tests: Zod Schemas — Workouts Validation
// ============================================

import { describe, it, expect } from 'vitest'
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  workoutHeatmapQuerySchema,
  workoutProgressQuerySchema,
} from '@workers/schemas/workouts'

describe('createWorkoutSchema', () => {
  it('deve aceitar payload válido mínimo', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'Treino A',
      start_date: '2026-02-14',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Treino A')
      expect(result.data.start_date).toBe('2026-02-14')
      expect(result.data.exercises).toEqual([]) // default
      expect(result.data.is_template).toBe(false) // default
    }
  })

  it('deve aceitar payload completo com exercícios', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'Treino Full Body',
      description: 'Treino completo para iniciantes',
      start_date: '2026-02-14',
      end_date: '2026-03-14',
      student_id: '550e8400-e29b-41d4-a716-446655440000',
      is_template: true,
      notes: 'Aumentar carga progressivamente',
      exercises: [
        {
          exercise_id: 'bench_press',
          sets: 4,
          reps: '12',
          rest_seconds: 90,
          load: '60kg',
          notes: 'Foco na descida',
          technique_tips: 'Manter escápulas retraídas',
          order_index: 0,
        },
        {
          exercise_id: 'squat',
          sets: 3,
          reps: '10-12',
          rest_seconds: 120,
          order_index: 1,
        },
      ],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.exercises).toHaveLength(2)
      expect(result.data.is_template).toBe(true)
      expect(result.data.student_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    }
  })

  it('deve rejeitar nome muito curto', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'A',
      start_date: '2026-02-14',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar nome muito longo (>255)', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'x'.repeat(256),
      start_date: '2026-02-14',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar data em formato errado', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'Treino B',
      start_date: '14/02/2026',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar data sem separadores corretos', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'Treino B',
      start_date: '20260214',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar sets = 0', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'Treino C',
      start_date: '2026-02-14',
      exercises: [{
        exercise_id: 'bench',
        sets: 0,
        reps: '12',
        order_index: 0,
      }],
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar sets > 50', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'Treino C',
      start_date: '2026-02-14',
      exercises: [{
        exercise_id: 'bench',
        sets: 51,
        reps: '12',
        order_index: 0,
      }],
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar rest_seconds > 600', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'Treino C',
      start_date: '2026-02-14',
      exercises: [{
        exercise_id: 'bench',
        sets: 3,
        reps: '12',
        rest_seconds: 601,
        order_index: 0,
      }],
    })
    expect(result.success).toBe(false)
  })

  it('deve aceitar student_id null', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'Template',
      start_date: '2026-02-14',
      student_id: null,
      is_template: true,
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar student_id inválido (não UUID)', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'Treino D',
      start_date: '2026-02-14',
      student_id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('deve aplicar defaults (rest_seconds=60, is_template=false)', () => {
    const result = createWorkoutSchema.safeParse({
      name: 'Treino E',
      start_date: '2026-02-14',
      exercises: [{
        exercise_id: 'curl',
        sets: 3,
        reps: '15',
        order_index: 0,
      }],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.exercises[0].rest_seconds).toBe(60)
      expect(result.data.is_template).toBe(false)
    }
  })
})

describe('updateWorkoutSchema', () => {
  it('deve aceitar payload parcial (só nome)', () => {
    const result = updateWorkoutSchema.safeParse({
      name: 'Novo nome',
    })
    expect(result.success).toBe(true)
  })

  it('deve aceitar payload parcial (só status)', () => {
    const result = updateWorkoutSchema.safeParse({
      status: 'completed',
    })
    expect(result.success).toBe(true)
  })

  it('deve aceitar payload vazio (nenhum campo obrigatório)', () => {
    const result = updateWorkoutSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('deve rejeitar status inválido', () => {
    const result = updateWorkoutSchema.safeParse({
      status: 'in_progress',
    })
    expect(result.success).toBe(false)
  })

  it('deve aceitar todos os status válidos', () => {
    for (const status of ['active', 'completed', 'archived', 'paused']) {
      const result = updateWorkoutSchema.safeParse({ status })
      expect(result.success).toBe(true)
    }
  })

  it('deve aceitar notes null (para limpar)', () => {
    const result = updateWorkoutSchema.safeParse({
      notes: null,
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar description > 2000 chars', () => {
    const result = updateWorkoutSchema.safeParse({
      description: 'x'.repeat(2001),
    })
    expect(result.success).toBe(false)
  })
})

describe('workoutHeatmapQuerySchema', () => {
  it('deve aplicar ano atual por padrão', () => {
    const result = workoutHeatmapQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(typeof result.data.year).toBe('number')
      expect(result.data.year).toBeGreaterThanOrEqual(2020)
    }
  })

  it('deve aceitar ano válido no range', () => {
    const result = workoutHeatmapQuerySchema.safeParse({ year: 2026 })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar ano fora do range', () => {
    const result = workoutHeatmapQuerySchema.safeParse({ year: 1900 })
    expect(result.success).toBe(false)
  })
})

describe('workoutProgressQuerySchema', () => {
  it('deve exigir exercise_id e aplicar days default=180', () => {
    const result = workoutProgressQuerySchema.safeParse({ exercise_id: 'bench_press' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.days).toBe(180)
    }
  })

  it('deve rejeitar sem exercise_id', () => {
    const result = workoutProgressQuerySchema.safeParse({ days: 90 })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar days < 7', () => {
    const result = workoutProgressQuerySchema.safeParse({ exercise_id: 'squat', days: 3 })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar days > 730', () => {
    const result = workoutProgressQuerySchema.safeParse({ exercise_id: 'squat', days: 731 })
    expect(result.success).toBe(false)
  })
})
