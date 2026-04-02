/**
 * workers/api/self-assessments.ts
 *
 * API para auto-avaliações B2C — aluno faz sua própria avaliação
 * Montado em /api/v1/self-assessments
 *
 * Endpoints:
 *   POST /           — criar auto-avaliação
 *   GET  /           — listar avaliações do usuário
 *   GET  /:id        — detalhe de uma avaliação
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created } from '@lib/response'
import { BadRequestError, NotFoundError } from '@lib/errors'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)

// ── POST / — Criar auto-avaliação ──────────────────────
app.post('/', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const body = await c.req.json<{
    weight_kg?: number
    height_cm?: number
    body_fat_percentage?: number
    waist_cm?: number
    hip_cm?: number
    chest_cm?: number
    arm_left_cm?: number
    arm_right_cm?: number
    thigh_left_cm?: number
    thigh_right_cm?: number
    calf_left_cm?: number
    calf_right_cm?: number
    activity_level?: string
    goal?: string
    notes?: string
  }>()

  if (!body.weight_kg || !body.height_cm) {
    throw new BadRequestError('weight_kg e height_cm são obrigatórios')
  }

  const id = generateId()
  const heightM = body.height_cm / 100
  const bmi = +(body.weight_kg / (heightM * heightM)).toFixed(1)

  // Classificação IMC
  let bmiCategory = 'Normal'
  if (bmi < 18.5) bmiCategory = 'Abaixo do peso'
  else if (bmi < 25) bmiCategory = 'Normal'
  else if (bmi < 30) bmiCategory = 'Sobrepeso'
  else if (bmi < 35) bmiCategory = 'Obesidade Grau I'
  else if (bmi < 40) bmiCategory = 'Obesidade Grau II'
  else bmiCategory = 'Obesidade Grau III'

  // Estimativa de gordura corporal (fórmula Navy se cintura+quadril disponíveis)
  let estimatedBodyFat = body.body_fat_percentage ?? null
  if (!estimatedBodyFat && body.waist_cm && body.hip_cm && body.height_cm) {
    // Fórmula simplificada: baseada no BMI
    // Para mais precisão, a fórmula Navy precisa de neck_cm
    estimatedBodyFat = +(1.2 * bmi + 0.23 * 30 - 5.4).toFixed(1) // aprox com idade média
  }

  await pgQuery(
    env,
    `INSERT INTO self_assessments (id, user_id, weight_kg, height_cm, bmi, bmi_category,
      body_fat_percentage, waist_cm, hip_cm, chest_cm,
      arm_left_cm, arm_right_cm, thigh_left_cm, thigh_right_cm,
      calf_left_cm, calf_right_cm, activity_level, goal, notes, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19, NOW())`,
    [
      id, userId, body.weight_kg, body.height_cm, bmi, bmiCategory,
      estimatedBodyFat, body.waist_cm ?? null, body.hip_cm ?? null,
      body.chest_cm ?? null, body.arm_left_cm ?? null, body.arm_right_cm ?? null,
      body.thigh_left_cm ?? null, body.thigh_right_cm ?? null,
      body.calf_left_cm ?? null, body.calf_right_cm ?? null,
      body.activity_level ?? null, body.goal ?? null, body.notes ?? null,
    ]
  )

  return created({
    id,
    weight_kg: body.weight_kg,
    height_cm: body.height_cm,
    bmi,
    bmi_category: bmiCategory,
    body_fat_percentage: estimatedBodyFat,
  })
})

// ── GET / — Listar avaliações ─────────────────────────
app.get('/', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50)

  const { rows } = await pgQuery(
    env,
    `SELECT id, weight_kg, height_cm, bmi, bmi_category,
            body_fat_percentage, activity_level, goal, created_at
     FROM self_assessments
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  )

  return success(rows)
})

// ── GET /:id — Detalhe ───────────────────────────────
app.get('/:id', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const id = c.req.param('id')

  const row = await pgQueryOne(
    env,
    `SELECT * FROM self_assessments WHERE id = $1 AND user_id = $2`,
    [id, userId]
  )

  if (!row) throw new NotFoundError('Avaliação não encontrada')

  return success(row)
})

export { app as selfAssessmentsRoutes }
