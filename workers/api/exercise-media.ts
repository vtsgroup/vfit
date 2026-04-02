/**
 * workers/api/exercise-media.ts
 *
 * exercise-media.ts — Mídia vinculada a exercícios (vídeos/imagens)
 * Features: DB: Neon
 */

// ============================================
// exercise-media.ts — Mídia vinculada a exercícios (vídeos/imagens)
// ============================================
//
// O que faz:
//   Gerencia arquivos de mídia vinculados a exercícios do catálogo:
//   listagem, criação (link externo ou R2), atualização, remoção e
//   geração de presigned URL para upload direto ao R2_IMAGES.
//
// Exports principais:
//   exerciseMediaRoutes — Hono app montado em /api/v1/exercises
//
// Auth: requireAuth + requireType('personal', 'admin', 'super_admin')
// DB: exercise_media
// Side effects: upload para R2_IMAGES via presigned URL
// ============================================
import { Hono } from 'hono'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import type { AppContext } from '@workers/types'
import { pgQuery, generateId } from '@lib/db'
import { success, created, noContent } from '@lib/response'
import { BadRequestError, NotFoundError } from '@lib/errors'
import {
  createExerciseMediaSchema,
  updateExerciseMediaSchema,
  uploadExerciseMediaQuerySchema,
} from '@workers/schemas/exercise-media'

const mediaRoutes = new Hono<AppContext>()

mediaRoutes.use('*', authMiddleware)

// ============================================
// GET /exercises/:exerciseId/media
// ============================================
mediaRoutes.get('/:exerciseId/media', async (c) => {
  const exerciseId = c.req.param('exerciseId')

  const { rows } = await pgQuery<ExerciseMediaRow>(
    c.env,
    `SELECT id, exercise_id, video_url, thumbnail_url, setup_notes, duration_seconds, is_active, created_at, updated_at
     FROM exercise_media
     WHERE exercise_id = $1 AND is_active = true
     ORDER BY created_at DESC`,
    [exerciseId]
  )

  return success({ items: rows })
})

// ============================================
// POST /exercises/:exerciseId/media
// ============================================
mediaRoutes.post('/:exerciseId/media', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const exerciseId = c.req.param('exerciseId')
  const parsed = createExerciseMediaSchema.parse(await c.req.json())
  const now = new Date().toISOString()
  const id = generateId()

  await pgQuery(c.env, `
    INSERT INTO exercise_media (id, exercise_id, video_url, thumbnail_url, setup_notes, duration_seconds, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
  `, [
    id,
    exerciseId,
    parsed.video_url,
    parsed.thumbnail_url || null,
    parsed.setup_notes || null,
    parsed.duration_seconds,
    parsed.is_active,
    now,
  ])

  const row = await findExerciseMediaById(c.env, id)
  return created(row)
})

// ============================================
// PUT /exercises/:exerciseId/media/:id
// ============================================
mediaRoutes.put('/:exerciseId/media/:id', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const exerciseId = c.req.param('exerciseId')
  const id = c.req.param('id')
  const parsed = updateExerciseMediaSchema.parse(await c.req.json())

  const current = await findExerciseMediaById(c.env, id)
  if (current.exercise_id !== exerciseId) {
    throw new NotFoundError('Mídia não encontrada para este exercício')
  }

  const updated = {
    video_url: parsed.video_url ?? current.video_url,
    thumbnail_url: parsed.thumbnail_url !== undefined ? parsed.thumbnail_url : current.thumbnail_url,
    setup_notes: parsed.setup_notes !== undefined ? parsed.setup_notes : current.setup_notes,
    duration_seconds: parsed.duration_seconds ?? current.duration_seconds,
    is_active: parsed.is_active ?? current.is_active,
  }

  await pgQuery(c.env, `
    UPDATE exercise_media
       SET video_url = $1,
           thumbnail_url = $2,
           setup_notes = $3,
           duration_seconds = $4,
           is_active = $5,
           updated_at = $6
     WHERE id = $7
  `, [
    updated.video_url,
    updated.thumbnail_url,
    updated.setup_notes,
    updated.duration_seconds,
    updated.is_active,
    new Date().toISOString(),
    id,
  ])

  const row = await findExerciseMediaById(c.env, id)
  return success(row)
})

// ============================================
// DELETE /exercises/:exerciseId/media/:id (soft delete)
// ============================================
mediaRoutes.delete('/:exerciseId/media/:id', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const exerciseId = c.req.param('exerciseId')
  const id = c.req.param('id')

  const current = await findExerciseMediaById(c.env, id)
  if (current.exercise_id !== exerciseId) {
    throw new NotFoundError('Mídia não encontrada para este exercício')
  }

  await pgQuery(c.env, `
    UPDATE exercise_media
       SET is_active = false,
           updated_at = $1
     WHERE id = $2
  `, [new Date().toISOString(), id])

  return noContent()
})

// ============================================
// POST /exercises/:exerciseId/media/upload (R2)
// ============================================
mediaRoutes.post('/:exerciseId/media/upload', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const exerciseId = c.req.param('exerciseId')
  const parsedQuery = uploadExerciseMediaQuerySchema.parse({
    type: c.req.query('type') || undefined,
    key: c.req.query('key') || undefined,
  })

  const contentType = c.req.header('Content-Type') || 'application/octet-stream'
  const body = await c.req.arrayBuffer()

  if (parsedQuery.type === 'video') {
    if (!contentType.startsWith('video/')) {
      throw new BadRequestError('Arquivo de vídeo deve usar Content-Type video/*')
    }
    if (body.byteLength > 50 * 1024 * 1024) {
      throw new BadRequestError('Vídeo excede 50MB')
    }

    const ext = pickExtensionFromContentType(contentType, 'mp4')
    const key = parsedQuery.key || `exercise-media/${exerciseId}/videos/${generateId()}.${ext}`

    await c.env.R2_VIDEOS.put(key, body, {
      httpMetadata: { contentType },
      customMetadata: {
        exercise_id: exerciseId,
        uploaded_at: new Date().toISOString(),
      },
    })

    const base = normalizePublicBase(c.env.R2_VIDEOS_URL, 'https://videos.iapersonal.app.br')
    return created({
      type: 'video',
      key,
      content_type: contentType,
      size_bytes: body.byteLength,
      url: `${base}/${key}`,
    })
  }

  if (!contentType.startsWith('image/')) {
    throw new BadRequestError('Thumbnail deve usar Content-Type image/*')
  }
  if (body.byteLength > 2 * 1024 * 1024) {
    throw new BadRequestError('Thumbnail excede 2MB')
  }

  const ext = pickExtensionFromContentType(contentType, 'jpg')
  const key = parsedQuery.key || `exercise-media/${exerciseId}/thumbnails/${generateId()}.${ext}`

  await c.env.R2_IMAGES.put(key, body, {
    httpMetadata: { contentType },
    customMetadata: {
      exercise_id: exerciseId,
      uploaded_at: new Date().toISOString(),
    },
  })

  const base = normalizePublicBase(c.env.R2_IMAGES_URL, 'https://images.iapersonal.app.br')
  return created({
    type: 'thumbnail',
    key,
    content_type: contentType,
    size_bytes: body.byteLength,
    url: `${base}/${key}`,
  })
})

export { mediaRoutes as exerciseMediaRoutes }

interface ExerciseMediaRow {
  id: string
  exercise_id: string
  video_url: string
  thumbnail_url: string | null
  setup_notes: string | null
  duration_seconds: number
  is_active: boolean
  created_at: string
  updated_at: string
}

async function findExerciseMediaById(env: AppContext['Bindings'], id: string): Promise<ExerciseMediaRow> {
  const { rows } = await pgQuery<ExerciseMediaRow>(
    env,
    `SELECT id, exercise_id, video_url, thumbnail_url, setup_notes, duration_seconds, is_active, created_at, updated_at
     FROM exercise_media
     WHERE id = $1
     LIMIT 1`,
    [id]
  )

  const row = rows[0]
  if (!row) throw new NotFoundError('Mídia de exercício não encontrada')
  return row
}

function normalizePublicBase(value: string | undefined, fallback: string): string {
  const raw = (value || '').trim()
  if (!raw) return fallback
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}

function pickExtensionFromContentType(contentType: string, fallback: string): string {
  const map: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }

  return map[contentType.toLowerCase()] || fallback
}
