import { Hono } from 'hono'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import type { AppContext } from '@workers/types'
import { pgQuery, generateId } from '@lib/db'
import { success, created, noContent } from '@lib/response'
import { BadRequestError, NotFoundError } from '@lib/errors'
import {
  createB2CMediaSchema,
  updateB2CMediaSchema,
  uploadB2CMediaQuerySchema,
} from '@workers/schemas/b2c-exercise-media'

interface B2CMediaRow {
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

async function findB2CMediaById(env: AppContext['Bindings'], id: string): Promise<B2CMediaRow> {
  const { rows } = await pgQuery<B2CMediaRow>(
    env,
    `SELECT id, exercise_id, video_url, thumbnail_url, setup_notes, duration_seconds, is_active, created_at, updated_at
     FROM b2c_exercise_media
     WHERE id = $1
     LIMIT 1`,
    [id]
  )

  const row = rows[0]
  if (!row) throw new NotFoundError('Mídia de exercício B2C não encontrada')
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

const b2cMediaRoutes = new Hono<AppContext>()

b2cMediaRoutes.use('*', authMiddleware)

// ============================================
// GET /b2c/exercises/:exerciseId/media
// ============================================
b2cMediaRoutes.get('/:exerciseId/media', async (c) => {
  const exerciseId = c.req.param('exerciseId')

  const { rows } = await pgQuery<B2CMediaRow>(
    c.env,
    `SELECT id, exercise_id, video_url, thumbnail_url, setup_notes, duration_seconds, is_active, created_at, updated_at
     FROM b2c_exercise_media
     WHERE exercise_id = $1 AND is_active = true
     ORDER BY created_at DESC`,
    [exerciseId]
  )

  return success({ items: rows })
})

// ============================================
// POST /b2c/exercises/:exerciseId/media
// ============================================
b2cMediaRoutes.post('/:exerciseId/media', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const exerciseId = c.req.param('exerciseId')
  const parsed = createB2CMediaSchema.parse(await c.req.json())
  const now = new Date().toISOString()
  const id = generateId()

  await pgQuery(c.env, `
    INSERT INTO b2c_exercise_media (id, exercise_id, video_url, thumbnail_url, setup_notes, duration_seconds, is_active, created_at, updated_at)
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

  const row = await findB2CMediaById(c.env, id)
  return created(row)
})

// ============================================
// PUT /b2c/exercises/:exerciseId/media/:id
// ============================================
b2cMediaRoutes.put('/:exerciseId/media/:id', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const exerciseId = c.req.param('exerciseId')
  const id = c.req.param('id')
  const parsed = updateB2CMediaSchema.parse(await c.req.json())

  const current = await findB2CMediaById(c.env, id)
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
    UPDATE b2c_exercise_media
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

  const row = await findB2CMediaById(c.env, id)
  return success(row)
})

// ============================================
// DELETE /b2c/exercises/:exerciseId/media/:id (soft delete)
// ============================================
b2cMediaRoutes.delete('/:exerciseId/media/:id', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const exerciseId = c.req.param('exerciseId')
  const id = c.req.param('id')

  const current = await findB2CMediaById(c.env, id)
  if (current.exercise_id !== exerciseId) {
    throw new NotFoundError('Mídia não encontrada para este exercício')
  }

  await pgQuery(c.env, `
    UPDATE b2c_exercise_media
       SET is_active = false,
           updated_at = $1
     WHERE id = $2
  `, [new Date().toISOString(), id])

  return noContent()
})

// ============================================
// POST /b2c/exercises/:exerciseId/media/upload (R2)
// ============================================
b2cMediaRoutes.post('/:exerciseId/media/upload', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const exerciseId = c.req.param('exerciseId')
  const parsedQuery = uploadB2CMediaQuerySchema.parse({
    type: c.req.query('type') || undefined,
    key: c.req.query('key') || undefined,
  })

  const contentType = c.req.header('Content-Type') || 'application/octet-stream'
  const body = await c.req.arrayBuffer()

  if (parsedQuery.type === 'video') {
    if (!c.env.R2_VIDEOS) {
      throw new BadRequestError('R2_VIDEOS binding ausente')
    }

    if (!contentType.startsWith('video/')) {
      throw new BadRequestError('Arquivo de vídeo deve usar Content-Type video/*')
    }
    if (body.byteLength > 50 * 1024 * 1024) {
      throw new BadRequestError('Vídeo excede 50MB')
    }

    const ext = pickExtensionFromContentType(contentType, 'mp4')
    const key = parsedQuery.key || `b2c-exercise-media/${exerciseId}/videos/${generateId()}.${ext}`

    await c.env.R2_VIDEOS.put(key, body, {
      httpMetadata: { contentType },
      customMetadata: {
        exercise_id: exerciseId,
        uploaded_at: new Date().toISOString(),
      },
    })

    const base = normalizePublicBase(c.env.R2_VIDEOS_URL, 'https://videos.vfit.app.br')
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
  const key = parsedQuery.key || `b2c-exercise-media/${exerciseId}/thumbnails/${generateId()}.${ext}`

  if (!c.env.R2_IMAGES) {
    throw new BadRequestError('R2_IMAGES binding ausente')
  }

  await c.env.R2_IMAGES.put(key, body, {
    httpMetadata: { contentType },
    customMetadata: {
      exercise_id: exerciseId,
      uploaded_at: new Date().toISOString(),
    },
  })

  const base = normalizePublicBase(c.env.R2_IMAGES_URL, 'https://images.vfit.app.br')
  const thumbnailUrl = `${base}/${key}`

  return created({
    type: 'thumbnail',
    key,
    content_type: contentType,
    size_bytes: body.byteLength,
    url: thumbnailUrl,
  })
})

export { b2cMediaRoutes as b2cExerciseMediaRoutes }
