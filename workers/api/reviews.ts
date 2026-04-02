/**
 * workers/api/reviews.ts
 *
 * reviews.ts — Reviews de alunos sobre o personal
 * Features: DB: Neon
 */

// ============================================
// reviews.ts — Reviews de alunos sobre o personal
// ============================================
//
// O que faz:
//   Sistema de avaliações dos alunos sobre o personal: criar, atualizar,
//   remover e listar reviews. Personal pode ver e responder as suas.
//   Reviews aprovadas visíveis no perfil público do personal.
//
// Exports principais:
//   reviewsRoutes — Hono app montado em /api/v1/reviews
//
// Auth: Student cria/edita/remove a própria. GET /personal/:id é público.
// DB: reviews, users, students, personals
// ============================================

import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import {
  createReviewSchema,
  updateReviewSchema,
  manageReviewSchema,
  listReviewsQuerySchema,
} from '@workers/schemas/assessments'
import { pgQuery, generateId } from '@lib/db'
import { success, created, noContent } from '@lib/response'
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '@lib/errors'

const reviews = new Hono<AppContext>()

// ============================================
// GET /reviews/public/:personalId — Reviews públicas (sem auth)
// ============================================
reviews.get('/public/:personalId', async (c) => {
  const personalId = c.req.param('personalId')
  const url = new URL(c.req.url)

  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM personal_reviews WHERE personal_id = $1 AND is_public = true`,
    [personalId]
  )

  const { rows } = await pgQuery<ReviewRow>(
    c.env,
    `SELECT r.id, r.rating, r.review_text, r.is_featured, r.created_at,
            u.full_name as student_name
     FROM personal_reviews r
     JOIN users u ON u.id = r.student_id
     WHERE r.personal_id = $1 AND r.is_public = true
     ORDER BY r.is_featured DESC, r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [personalId, perPage, offset]
  )

  // Stats
  const { rows: statsRows } = await pgQuery<{ avg_rating: number; total_reviews: number }>(
    c.env,
    `SELECT ROUND(AVG(rating), 1)::float as avg_rating, COUNT(*)::int as total_reviews
     FROM personal_reviews WHERE personal_id = $1 AND is_public = true`,
    [personalId]
  )

  return success({
    reviews: rows,
    stats: statsRows[0] || { avg_rating: 0, total_reviews: 0 },
    meta: {
      page, per_page: perPage,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / perPage),
    },
  })
})

// Auth required a partir daqui
reviews.use('*', authMiddleware)

// ============================================
// POST /reviews — Criar review (student)
// ============================================
reviews.post('/', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const body = await c.req.json()
  const parsed = createReviewSchema.parse(body)

  // Buscar personal do aluno
  const { rows: studentRows } = await pgQuery<{ personal_id: string }>(
    c.env,
    'SELECT personal_id FROM students WHERE id = $1 LIMIT 1',
    [studentId]
  )
  if (studentRows.length === 0) throw new NotFoundError('Aluno')

  const personalId = studentRows[0].personal_id

  // Verificar se já tem review
  const { rows: existing } = await pgQuery<{ id: string }>(
    c.env,
    'SELECT id FROM personal_reviews WHERE personal_id = $1 AND student_id = $2 LIMIT 1',
    [personalId, studentId]
  )
  if (existing.length > 0) {
    throw new ConflictError('Você já avaliou este personal. Use PATCH para atualizar.')
  }

  const id = generateId()
  const now = new Date().toISOString()

  await pgQuery(c.env, `
    INSERT INTO personal_reviews (id, personal_id, student_id, rating, review_text, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $6)
  `, [id, personalId, studentId, parsed.rating, parsed.review_text || null, now])

  // Atualizar rating médio do personal
  await updatePersonalRating(c.env, personalId)

  return created({ id, rating: parsed.rating, review_text: parsed.review_text })
})

// ============================================
// GET /reviews/my — Minha review (student)
// ============================================
reviews.get('/my', requireType('student'), async (c) => {
  const studentId = c.get('userId')

  const { rows: studentRows } = await pgQuery<{ personal_id: string }>(
    c.env,
    'SELECT personal_id FROM students WHERE id = $1 LIMIT 1',
    [studentId]
  )
  if (studentRows.length === 0) throw new NotFoundError('Aluno')

  const { rows } = await pgQuery<ReviewRow>(
    c.env,
    `SELECT r.*, pu.full_name as personal_name
     FROM personal_reviews r
     JOIN users pu ON pu.id = r.personal_id
     WHERE r.student_id = $1 AND r.personal_id = $2 LIMIT 1`,
    [studentId, studentRows[0].personal_id]
  )

  if (rows.length === 0) {
    return success({ review: null })
  }

  return success({ review: rows[0] })
})

// ============================================
// PATCH /reviews/my — Atualizar review (student)
// ============================================
reviews.patch('/my', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const body = await c.req.json()
  const parsed = updateReviewSchema.parse(body)

  const { rows: studentRows } = await pgQuery<{ personal_id: string }>(
    c.env,
    'SELECT personal_id FROM students WHERE id = $1 LIMIT 1',
    [studentId]
  )
  if (studentRows.length === 0) throw new NotFoundError('Aluno')

  const personalId = studentRows[0].personal_id

  const setClauses: string[] = []
  const params: unknown[] = []
  let idx = 1

  if (parsed.rating !== undefined) {
    setClauses.push(`rating = $${idx}`)
    params.push(parsed.rating)
    idx++
  }
  if (parsed.review_text !== undefined) {
    setClauses.push(`review_text = $${idx}`)
    params.push(parsed.review_text)
    idx++
  }

  if (setClauses.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  setClauses.push(`updated_at = $${idx}`)
  params.push(new Date().toISOString())
  idx++

  params.push(personalId, studentId)

  const { rowCount } = await pgQuery(
    c.env,
    `UPDATE personal_reviews SET ${setClauses.join(', ')} WHERE personal_id = $${idx} AND student_id = $${idx + 1}`,
    params
  )

  if (rowCount === 0) throw new NotFoundError('Review')

  // Atualizar rating médio
  await updatePersonalRating(c.env, personalId)

  return success({ message: 'Review atualizada' })
})

// ============================================
// DELETE /reviews/my — Remover review (student)
// ============================================
reviews.delete('/my', requireType('student'), async (c) => {
  const studentId = c.get('userId')

  const { rows: studentRows } = await pgQuery<{ personal_id: string }>(
    c.env,
    'SELECT personal_id FROM students WHERE id = $1 LIMIT 1',
    [studentId]
  )
  if (studentRows.length === 0) throw new NotFoundError('Aluno')

  const personalId = studentRows[0].personal_id

  await pgQuery(c.env,
    'DELETE FROM personal_reviews WHERE personal_id = $1 AND student_id = $2',
    [personalId, studentId]
  )

  await updatePersonalRating(c.env, personalId)

  return noContent()
})

// ============================================
// GET /reviews — Listar reviews (personal)
// ============================================
reviews.get('/', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)

  const query = listReviewsQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    is_public: url.searchParams.get('is_public') || undefined,
  })
  const conditions: string[] = ['r.personal_id = $1']
  const params: unknown[] = [personalId]
  let idx = 2
  const offset = (query.page - 1) * query.per_page

  if (query.is_public !== undefined) {
    conditions.push(`r.is_public = $${idx}`)
    params.push(query.is_public)
    idx++
  }

  const where = conditions.join(' AND ')

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM personal_reviews r WHERE ${where}`,
    params
  )

  const { rows } = await pgQuery<ReviewRow>(
    c.env,
    `SELECT r.*, u.full_name as student_name
     FROM personal_reviews r
     JOIN users u ON u.id = r.student_id
     WHERE ${where}
     ORDER BY r.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, query.per_page, offset]
  )

  // Stats
  const { rows: statsRows } = await pgQuery<{ avg_rating: number; total_reviews: number }>(
    c.env,
    `SELECT ROUND(AVG(rating), 1)::float as avg_rating, COUNT(*)::int as total_reviews
     FROM personal_reviews WHERE personal_id = $1`,
    [personalId]
  )

  return success({
    reviews: rows,
    stats: statsRows[0] || { avg_rating: 0, total_reviews: 0 },
    meta: {
      page: query.page, per_page: query.per_page,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / query.per_page),
    },
  })
})

// ============================================
// PATCH /reviews/:id/manage — Gerenciar visibilidade (personal)
// ============================================
reviews.patch('/:id/manage', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const reviewId = c.req.param('id')
  const body = await c.req.json()
  const parsed = manageReviewSchema.parse(body)

  const setClauses: string[] = []
  const params: unknown[] = []
  let idx = 1

  if (parsed.is_public !== undefined) {
    setClauses.push(`is_public = $${idx}`)
    params.push(parsed.is_public)
    idx++
  }
  if (parsed.is_featured !== undefined) {
    setClauses.push(`is_featured = $${idx}`)
    params.push(parsed.is_featured)
    idx++
  }

  if (setClauses.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  setClauses.push(`updated_at = $${idx}`)
  params.push(new Date().toISOString())
  idx++

  params.push(reviewId, personalId)

  const { rowCount } = await pgQuery(
    c.env,
    `UPDATE personal_reviews SET ${setClauses.join(', ')} WHERE id = $${idx} AND personal_id = $${idx + 1}`,
    params
  )

  if (rowCount === 0) throw new NotFoundError('Review')

  return success({ message: 'Visibilidade atualizada' })
})

// ============================================
// HELPERS
// ============================================

interface ReviewRow {
  id: string
  personal_id: string
  student_id: string
  rating: number
  review_text: string | null
  is_public: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  student_name?: string
  personal_name?: string
}

async function updatePersonalRating(env: Bindings, personalId: string): Promise<void> {
  const { rows } = await pgQuery<{ avg_rating: number; total_reviews: number }>(
    env,
    `SELECT ROUND(AVG(rating), 1)::float as avg_rating, COUNT(*)::int as total_reviews
     FROM personal_reviews WHERE personal_id = $1`,
    [personalId]
  )

  const stats = rows[0] || { avg_rating: 0, total_reviews: 0 }

  await pgQuery(env, `
    UPDATE personals SET average_rating = $1, total_reviews = $2, updated_at = $3 WHERE id = $4
  `, [stats.avg_rating, stats.total_reviews, new Date().toISOString(), personalId])
}

export { reviews as reviewsRoutes }
