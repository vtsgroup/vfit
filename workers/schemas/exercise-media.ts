// ============================================
// exercise-media.ts (schema) — Validação de mídia de exercícios
// ============================================
//
// O que faz:
//   Schemas Zod para CRUD de mídia vinculada a exercícios do catálogo:
//   criação, atualização e query de upload de vídeo/thumbnail.
//
// Exports principais:
//   createExerciseMediaSchema — body de POST /:id/media
//     (video_url, thumbnail_url?, setup_notes?, duration_seconds, is_active)
//   updateExerciseMediaSchema — body de PATCH /:id/media/:mediaId (todos opcionais)
//   uploadExerciseMediaQuerySchema — query string de upload (type: video|thumbnail)
//   CreateExerciseMediaInput, UpdateExerciseMediaInput, UploadExerciseMediaQuery
// ============================================
import { z } from 'zod'

export const createExerciseMediaSchema = z.object({
  video_url: z.string().url('video_url deve ser uma URL válida'),
  thumbnail_url: z.string().url('thumbnail_url deve ser uma URL válida').optional().nullable(),
  setup_notes: z.string().max(2000).optional().nullable(),
  duration_seconds: z.coerce.number().int().min(0).max(60 * 60).default(0),
  is_active: z.boolean().default(true),
})

export const updateExerciseMediaSchema = z.object({
  video_url: z.string().url('video_url deve ser uma URL válida').optional(),
  thumbnail_url: z.string().url('thumbnail_url deve ser uma URL válida').optional().nullable(),
  setup_notes: z.string().max(2000).optional().nullable(),
  duration_seconds: z.coerce.number().int().min(0).max(60 * 60).optional(),
  is_active: z.boolean().optional(),
})

export const uploadExerciseMediaQuerySchema = z.object({
  type: z.enum(['video', 'thumbnail']).default('video'),
  key: z.string().min(1).max(500).optional(),
})

export type CreateExerciseMediaInput = z.infer<typeof createExerciseMediaSchema>
export type UpdateExerciseMediaInput = z.infer<typeof updateExerciseMediaSchema>
export type UploadExerciseMediaQuery = z.infer<typeof uploadExerciseMediaQuerySchema>
