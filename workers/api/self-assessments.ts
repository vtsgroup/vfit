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
import { success, created, noContent } from '@lib/response'
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

// ── DELETE /:id — Deletar avaliação definitivamente ───────────────
app.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const id = c.req.param('id')

  const { rows } = await pgQuery<{ id: string }>(
    env,
    `DELETE FROM self_assessments
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId]
  )

  if (rows.length === 0) throw new NotFoundError('Avaliação não encontrada')

  return noContent()
})

// ── POST /from-onboarding — Create assessment from onboarding data ──
app.post('/from-onboarding', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  // Get onboarding data
  const onboarding = await pgQueryOne<{
    gender: string
    age: number
    height_cm: number
    weight_kg: number
    target_weight_kg: number | null
    goal: string
    experience_level: string
    training_frequency: string
  }>(env,
    `SELECT gender, age, height_cm, weight_kg, target_weight_kg, goal,
            experience_level, training_frequency
     FROM user_onboarding WHERE user_id = $1 LIMIT 1`,
    [userId]
  )

  if (!onboarding) {
    throw new BadRequestError('Onboarding não encontrado. Complete o questionário primeiro.')
  }

  // Map onboarding training_frequency to activity_level
  const activityMap: Record<string, string> = {
    '1-2': 'light',
    '3-4': 'moderate',
    '5-6': 'active',
    '7': 'very_active',
  }
  const activityLevel = activityMap[onboarding.training_frequency] || 'moderate'

  // Calculate BMI
  const heightM = onboarding.height_cm / 100
  const bmi = +(onboarding.weight_kg / (heightM * heightM)).toFixed(1)
  let bmiCategory = 'Normal'
  if (bmi < 18.5) bmiCategory = 'Abaixo do peso'
  else if (bmi < 25) bmiCategory = 'Normal'
  else if (bmi < 30) bmiCategory = 'Sobrepeso'
  else if (bmi < 35) bmiCategory = 'Obesidade Grau I'
  else if (bmi < 40) bmiCategory = 'Obesidade Grau II'
  else bmiCategory = 'Obesidade Grau III'

  // Body fat estimate via BMI (Deurenberg formula)
  const isMale = onboarding.gender === 'male' || onboarding.gender === 'masculino'
  const sexFactor = isMale ? 1 : 0
  const bodyFat = +(1.2 * bmi + 0.23 * onboarding.age - 10.8 * sexFactor - 5.4).toFixed(1)

  // Calculate nutrition targets (Mifflin-St Jeor)
  let bmr: number
  if (isMale) {
    bmr = 10 * onboarding.weight_kg + 6.25 * onboarding.height_cm - 5 * onboarding.age + 5
  } else {
    bmr = 10 * onboarding.weight_kg + 6.25 * onboarding.height_cm - 5 * onboarding.age - 161
  }

  const activityMultiplier: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  }
  const tdee = Math.round(bmr * (activityMultiplier[activityLevel] || 1.55))

  // Adjust calories based on goal
  const goalMap: Record<string, string> = {
    lose_weight: 'lose_weight', perder_peso: 'lose_weight', emagrecer: 'lose_weight',
    gain_muscle: 'gain_muscle', ganhar_musculo: 'gain_muscle', hipertrofia: 'gain_muscle',
    maintain: 'maintain', manter: 'maintain', improve_health: 'maintain', saude: 'maintain',
  }
  const normalizedGoal = goalMap[onboarding.goal] || 'maintain'
  let targetCalories = tdee
  if (normalizedGoal === 'lose_weight') targetCalories = Math.round(tdee * 0.8)
  else if (normalizedGoal === 'gain_muscle') targetCalories = Math.round(tdee * 1.15)

  // Macro distribution
  const proteinGrams = Math.round(onboarding.weight_kg * (normalizedGoal === 'gain_muscle' ? 2.0 : 1.6))
  const fatGrams = Math.round((targetCalories * 0.25) / 9)
  const carbGrams = Math.round((targetCalories - proteinGrams * 4 - fatGrams * 9) / 4)

  // Create self-assessment
  const id = generateId()
  await pgQuery(env,
    `INSERT INTO self_assessments (id, user_id, weight_kg, height_cm, bmi, bmi_category,
      body_fat_percentage, activity_level, goal, notes, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())
     ON CONFLICT DO NOTHING`,
    [id, userId, onboarding.weight_kg, onboarding.height_cm, bmi, bmiCategory,
     bodyFat, activityLevel, onboarding.goal, 'Criado automaticamente do onboarding']
  )

  // Store nutrition targets in users table
  await pgQuery(env,
    `UPDATE users SET
       target_weight_kg = COALESCE($1, target_weight_kg),
       body_fat_percent = $2,
       updated_at = NOW()
     WHERE id = $3`,
    [onboarding.target_weight_kg, bodyFat, userId]
  )

  return created({
    assessment_id: id,
    bmi,
    bmi_category: bmiCategory,
    body_fat_percentage: bodyFat,
    nutrition_targets: {
      bmr,
      tdee,
      target_calories: targetCalories,
      protein_grams: proteinGrams,
      carbs_grams: carbGrams,
      fat_grams: fatGrams,
      goal: normalizedGoal,
    },
  })
})

export { app as selfAssessmentsRoutes }
