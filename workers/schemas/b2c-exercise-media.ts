import { z } from 'zod'

export const createB2CMediaSchema = z.object({
  exercise_id: z.string().min(1, 'exercise_id é obrigatório'),
  video_url: z.string().url('video_url deve ser uma URL válida'),
  thumbnail_url: z.string().url('thumbnail_url deve ser uma URL válida').optional().nullable(),
  setup_notes: z.string().max(2000).optional().nullable(),
  duration_seconds: z.coerce.number().int().min(0).max(60 * 60).default(0),
  is_active: z.boolean().default(true),
})

export const updateB2CMediaSchema = z.object({
  video_url: z.string().url('video_url deve ser uma URL válida').optional(),
  thumbnail_url: z.string().url('thumbnail_url deve ser uma URL válida').optional().nullable(),
  setup_notes: z.string().max(2000).optional().nullable(),
  duration_seconds: z.coerce.number().int().min(0).max(60 * 60).optional(),
  is_active: z.boolean().optional(),
})

export const uploadB2CMediaQuerySchema = z.object({
  type: z.enum(['video', 'thumbnail']).default('video'),
  key: z.string().min(1).max(500).optional(),
})

export type CreateB2CMediaInput = z.infer<typeof createB2CMediaSchema>
export type UpdateB2CMediaInput = z.infer<typeof updateB2CMediaSchema>
export type UploadB2CMediaQuery = z.infer<typeof uploadB2CMediaQuerySchema>
