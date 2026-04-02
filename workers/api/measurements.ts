/**
 * workers/api/measurements.ts
 *
 * VFIT B2C — Tracking de medidas corporais
 *
 * POST /api/v1/measurements — Salvar nova medição
 * GET /api/v1/measurements/history — Histórico de medições
 * GET /api/v1/measurements/latest — Última medição
 *
 * Auth: authMiddleware (obrigatório)
 * DB: Neon (body_measurements)
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created } from '@lib/response'
import { BadRequestError } from '@lib/errors'

const measurements = new Hono<AppContext>()

measurements.use('*', authMiddleware)

// ============================================
// POST / — Salvar nova medição
// ============================================
measurements.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const env = c.env

  const {
    weight_kg,
    height_cm,
    body_fat_percentage,
    chest_cm,
    waist_cm,
    hip_cm,
    arm_left_cm,
    arm_right_cm,
    thigh_left_cm,
    thigh_right_cm,
    calf_left_cm,
    calf_right_cm,
    notes,
    measured_at,
  } = body

  if (!weight_kg && !chest_cm && !waist_cm && !hip_cm) {
    throw new BadRequestError('Informe pelo menos peso ou uma medida corporal')
  }

  // Auto-calc BMI if weight + height
  let bmi: number | null = null
  const hCm = height_cm || null

  if (weight_kg && hCm) {
    const hM = hCm / 100
    bmi = Math.round((weight_kg / (hM * hM)) * 10) / 10
  } else if (weight_kg) {
    // Try to get height from last measurement
    const last = await pgQueryOne<{ height_cm: string }>(
      env,
      `SELECT height_cm FROM body_measurements WHERE user_id = $1 AND height_cm IS NOT NULL ORDER BY measured_at DESC LIMIT 1`,
      [userId]
    )
    if (last?.height_cm) {
      const hM = parseFloat(last.height_cm) / 100
      bmi = Math.round((weight_kg / (hM * hM)) * 10) / 10
    }
  }

  const id = generateId()

  await pgQuery(
    env,
    `INSERT INTO body_measurements (
      id, user_id, measured_at, weight_kg, height_cm, body_fat_percentage, bmi,
      chest_cm, waist_cm, hip_cm, arm_left_cm, arm_right_cm,
      thigh_left_cm, thigh_right_cm, calf_left_cm, calf_right_cm, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
    [
      id, userId, measured_at || new Date().toISOString().split('T')[0],
      weight_kg || null, hCm, body_fat_percentage || null, bmi,
      chest_cm || null, waist_cm || null, hip_cm || null,
      arm_left_cm || null, arm_right_cm || null,
      thigh_left_cm || null, thigh_right_cm || null,
      calf_left_cm || null, calf_right_cm || null,
      notes || null,
    ]
  )

  return c.json(created({ id, bmi }))
})

// ============================================
// GET /history — Histórico de medições
// ============================================
measurements.get('/history', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const limit = parseInt(c.req.query('limit') || '50', 10)

  const result = await pgQuery<{
    id: string
    measured_at: string
    weight_kg: string | null
    height_cm: string | null
    body_fat_percentage: string | null
    bmi: string | null
    chest_cm: string | null
    waist_cm: string | null
    hip_cm: string | null
    arm_left_cm: string | null
    arm_right_cm: string | null
    thigh_left_cm: string | null
    thigh_right_cm: string | null
    calf_left_cm: string | null
    calf_right_cm: string | null
    notes: string | null
    created_at: string
  }>(
    env,
    `SELECT * FROM body_measurements 
     WHERE user_id = $1 
     ORDER BY measured_at DESC 
     LIMIT $2`,
    [userId, limit]
  )

  return c.json(success(result.rows.map(r => ({
    id: r.id,
    measured_at: r.measured_at,
    weight_kg: r.weight_kg ? parseFloat(r.weight_kg) : null,
    height_cm: r.height_cm ? parseFloat(r.height_cm) : null,
    body_fat_percentage: r.body_fat_percentage ? parseFloat(r.body_fat_percentage) : null,
    bmi: r.bmi ? parseFloat(r.bmi) : null,
    chest_cm: r.chest_cm ? parseFloat(r.chest_cm) : null,
    waist_cm: r.waist_cm ? parseFloat(r.waist_cm) : null,
    hip_cm: r.hip_cm ? parseFloat(r.hip_cm) : null,
    arm_left_cm: r.arm_left_cm ? parseFloat(r.arm_left_cm) : null,
    arm_right_cm: r.arm_right_cm ? parseFloat(r.arm_right_cm) : null,
    thigh_left_cm: r.thigh_left_cm ? parseFloat(r.thigh_left_cm) : null,
    thigh_right_cm: r.thigh_right_cm ? parseFloat(r.thigh_right_cm) : null,
    calf_left_cm: r.calf_left_cm ? parseFloat(r.calf_left_cm) : null,
    calf_right_cm: r.calf_right_cm ? parseFloat(r.calf_right_cm) : null,
    notes: r.notes,
    created_at: r.created_at,
  }))))
})

// ============================================
// GET /latest — Última medição
// ============================================
measurements.get('/latest', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  const row = await pgQueryOne<{
    id: string
    measured_at: string
    weight_kg: string | null
    height_cm: string | null
    body_fat_percentage: string | null
    bmi: string | null
    chest_cm: string | null
    waist_cm: string | null
    hip_cm: string | null
    arm_left_cm: string | null
    arm_right_cm: string | null
    thigh_left_cm: string | null
    thigh_right_cm: string | null
    created_at: string
  }>(
    env,
    `SELECT * FROM body_measurements WHERE user_id = $1 ORDER BY measured_at DESC LIMIT 1`,
    [userId]
  )

  if (!row) {
    return c.json(success(null))
  }

  return c.json(success({
    id: row.id,
    measured_at: row.measured_at,
    weight_kg: row.weight_kg ? parseFloat(row.weight_kg) : null,
    height_cm: row.height_cm ? parseFloat(row.height_cm) : null,
    body_fat_percentage: row.body_fat_percentage ? parseFloat(row.body_fat_percentage) : null,
    bmi: row.bmi ? parseFloat(row.bmi) : null,
    chest_cm: row.chest_cm ? parseFloat(row.chest_cm) : null,
    waist_cm: row.waist_cm ? parseFloat(row.waist_cm) : null,
    hip_cm: row.hip_cm ? parseFloat(row.hip_cm) : null,
    arm_left_cm: row.arm_left_cm ? parseFloat(row.arm_left_cm) : null,
    arm_right_cm: row.arm_right_cm ? parseFloat(row.arm_right_cm) : null,
    thigh_left_cm: row.thigh_left_cm ? parseFloat(row.thigh_left_cm) : null,
    thigh_right_cm: row.thigh_right_cm ? parseFloat(row.thigh_right_cm) : null,
    created_at: row.created_at,
  }))
})

export { measurements as measurementsRoutes }
