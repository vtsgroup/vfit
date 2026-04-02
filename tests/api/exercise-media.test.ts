import { describe, expect, it } from 'vitest'
import {
  createExerciseMediaSchema,
  updateExerciseMediaSchema,
  uploadExerciseMediaQuerySchema,
} from '@workers/schemas/exercise-media'

describe('exercise-media schemas', () => {
  it('aceita create válido com defaults', () => {
    const parsed = createExerciseMediaSchema.safeParse({
      video_url: 'https://cdn.exemplo.com/video.mp4',
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.duration_seconds).toBe(0)
      expect(parsed.data.is_active).toBe(true)
    }
  })

  it('rejeita create com url inválida', () => {
    const parsed = createExerciseMediaSchema.safeParse({
      video_url: 'video-local.mp4',
    })
    expect(parsed.success).toBe(false)
  })

  it('rejeita duration acima de 1h', () => {
    const parsed = createExerciseMediaSchema.safeParse({
      video_url: 'https://cdn.exemplo.com/video.mp4',
      duration_seconds: 3601,
    })
    expect(parsed.success).toBe(false)
  })

  it('aceita update parcial', () => {
    const parsed = updateExerciseMediaSchema.safeParse({
      setup_notes: 'Atenção ao posicionamento da coluna',
      is_active: false,
    })
    expect(parsed.success).toBe(true)
  })

  it('query de upload aceita type default', () => {
    const parsed = uploadExerciseMediaQuerySchema.safeParse({})
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.type).toBe('video')
    }
  })

  it('query de upload rejeita type inválido', () => {
    const parsed = uploadExerciseMediaQuerySchema.safeParse({ type: 'gif' })
    expect(parsed.success).toBe(false)
  })
})
