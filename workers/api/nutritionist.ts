/**
 * workers/api/nutritionist.ts
 *
 * Nutritionist Routes — CRUD para nutricionistas e seus recursos
 *
 * Exports: nutritionistRoutes
 * Features: Auth: authMiddleware · requireType
 * DB: Neon PostgreSQL (patients, meal_plans, nutrition_assessments, nutritionists)
 */

// ============================================
// Nutritionist Routes
// Profile, Patients, Meal Plans, Assessments
// ============================================

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import { success, paginated, created } from '@lib/response'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { BadRequestError, NotFoundError } from '@lib/errors'

const nutritionist = new Hono<AppContext>()

// All nutritionist routes require auth
nutritionist.use('*', authMiddleware)

// ============================================
// PROFILE
// ============================================

/**
 * GET /nutritionist/profile — Get nutritionist profile
 */
nutritionist.get('/profile', requireType('nutritionist'), async (c) => {
  const userId = c.get('userId')

  const profile = await pgQueryOne(
    c.env,
    `SELECT n.*, u.full_name, u.email, u.phone, u.profile_photo_url
     FROM nutritionists n
     JOIN users u ON u.id = n.id
     WHERE n.id = $1`,
    [userId]
  )

  if (!profile) {
    throw new NotFoundError('Perfil de nutricionista não encontrado')
  }

  return success(profile)
})

/**
 * PUT /nutritionist/profile — Update nutritionist profile
 */
nutritionist.put('/profile', requireType('nutritionist'), async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const { bio, specialties, is_public_profile, show_testimonials } = body

  await pgQuery(
    c.env,
    `UPDATE nutritionists SET
       bio = COALESCE($2, bio),
       specialties = COALESCE($3, specialties),
       is_public_profile = COALESCE($4, is_public_profile),
       show_testimonials = COALESCE($5, show_testimonials),
       updated_at = NOW()
     WHERE id = $1`,
    [userId, bio, specialties, is_public_profile, show_testimonials]
  )

  return success({ message: 'Perfil atualizado' })
})

// ============================================
// PATIENTS
// ============================================

/**
 * GET /nutritionist/patients — List patients
 */
nutritionist.get('/patients', requireType('nutritionist'), async (c) => {
  const userId = c.get('userId')
  const page = parseInt(c.req.query('page') || '1')
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50)
  const status = c.req.query('status')
  const search = c.req.query('search')
  const offset = (page - 1) * limit

  let where = 'p.nutritionist_id = $1'
  const params: unknown[] = [userId]
  let paramIdx = 2

  if (status) {
    where += ` AND p.status = $${paramIdx}`
    params.push(status)
    paramIdx++
  }

  if (search) {
    where += ` AND (p.full_name ILIKE $${paramIdx} OR p.email ILIKE $${paramIdx})`
    params.push(`%${search}%`)
    paramIdx++
  }

  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM patients p WHERE ${where}`,
    params
  )
  const total = countResult?.count ?? 0

  const { rows } = await pgQuery(
    c.env,
    `SELECT p.*, 
            (SELECT COUNT(*) FROM meal_plans mp WHERE mp.patient_id = p.id) as total_meal_plans,
            (SELECT COUNT(*) FROM nutrition_assessments na WHERE na.patient_id = p.id) as total_assessments
     FROM patients p
     WHERE ${where}
     ORDER BY p.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset]
  )

  return paginated(rows, { page, per_page: limit, total })
})

/**
 * POST /nutritionist/patients — Create patient
 */
nutritionist.post('/patients', requireType('nutritionist'), async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const {
    full_name,
    email,
    phone,
    cpf,
    date_of_birth,
    gender,
    allergies,
    intolerances,
    pathologies,
    medications,
    dietary_restrictions,
    objectives,
    consultation_type,
    consultation_price,
  } = body

  if (!full_name) {
    throw new BadRequestError('Nome é obrigatório')
  }

  const id = generateId()

  await pgQuery(
    c.env,
    `INSERT INTO patients (id, nutritionist_id, full_name, email, phone, cpf, date_of_birth, gender,
       allergies, intolerances, pathologies, medications, dietary_restrictions, objectives,
       consultation_type, consultation_price)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      id, userId, full_name, email || null, phone || null, cpf || null,
      date_of_birth || null, gender || null,
      allergies || [], intolerances || [], pathologies || [], medications || null,
      dietary_restrictions || null, objectives || null,
      consultation_type || 'presencial', consultation_price || null,
    ]
  )

  // Update stats
  await pgQuery(
    c.env,
    `UPDATE nutritionists SET total_patients = total_patients + 1, active_patients = active_patients + 1, updated_at = NOW() WHERE id = $1`,
    [userId]
  )

  return created({ id, full_name })
})

/**
 * GET /nutritionist/patients/:id — Get patient detail
 */
nutritionist.get('/patients/:id', requireType('nutritionist'), async (c) => {
  const userId = c.get('userId')
  const patientId = c.req.param('id')

  const patient = await pgQueryOne(
    c.env,
    `SELECT p.*,
            (SELECT COUNT(*) FROM meal_plans mp WHERE mp.patient_id = p.id) as total_meal_plans,
            (SELECT COUNT(*) FROM nutrition_assessments na WHERE na.patient_id = p.id) as total_assessments,
            (SELECT na.assessment_date FROM nutrition_assessments na WHERE na.patient_id = p.id ORDER BY na.assessment_date DESC LIMIT 1) as last_assessment_date
     FROM patients p
     WHERE p.id = $1 AND p.nutritionist_id = $2`,
    [patientId, userId]
  )

  if (!patient) {
    throw new NotFoundError('Paciente não encontrado')
  }

  return success(patient)
})

/**
 * PUT /nutritionist/patients/:id — Update patient
 */
nutritionist.put('/patients/:id', requireType('nutritionist'), async (c) => {
  const userId = c.get('userId')
  const patientId = c.req.param('id')
  const body = await c.req.json()

  const existing = await pgQueryOne(
    c.env,
    'SELECT id FROM patients WHERE id = $1 AND nutritionist_id = $2',
    [patientId, userId]
  )
  if (!existing) {
    throw new NotFoundError('Paciente não encontrado')
  }

  const {
    full_name, email, phone, status, allergies, intolerances,
    pathologies, medications, dietary_restrictions, objectives,
    consultation_type, consultation_price, notes,
  } = body

  await pgQuery(
    c.env,
    `UPDATE patients SET
       full_name = COALESCE($3, full_name),
       email = COALESCE($4, email),
       phone = COALESCE($5, phone),
       status = COALESCE($6, status),
       allergies = COALESCE($7, allergies),
       intolerances = COALESCE($8, intolerances),
       pathologies = COALESCE($9, pathologies),
       medications = COALESCE($10, medications),
       dietary_restrictions = COALESCE($11, dietary_restrictions),
       objectives = COALESCE($12, objectives),
       consultation_type = COALESCE($13, consultation_type),
       consultation_price = COALESCE($14, consultation_price),
       notes = COALESCE($15, notes),
       updated_at = NOW()
     WHERE id = $1 AND nutritionist_id = $2`,
    [
      patientId, userId, full_name, email, phone, status,
      allergies, intolerances, pathologies, medications,
      dietary_restrictions, objectives, consultation_type,
      consultation_price, notes,
    ]
  )

  return success({ message: 'Paciente atualizado' })
})

// ============================================
// MEAL PLANS
// ============================================

/**
 * GET /nutritionist/meal-plans — List meal plans
 */
nutritionist.get('/meal-plans', requireType('nutritionist'), async (c) => {
  const userId = c.get('userId')
  const page = parseInt(c.req.query('page') || '1')
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50)
  const patientId = c.req.query('patient_id')
  const status = c.req.query('status')
  const offset = (page - 1) * limit

  let where = 'mp.nutritionist_id = $1'
  const params: unknown[] = [userId]
  let paramIdx = 2

  if (patientId) {
    where += ` AND mp.patient_id = $${paramIdx}`
    params.push(patientId)
    paramIdx++
  }
  if (status) {
    where += ` AND mp.status = $${paramIdx}`
    params.push(status)
    paramIdx++
  }

  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM meal_plans mp WHERE ${where}`,
    params
  )
  const total = countResult?.count ?? 0

  const { rows } = await pgQuery(
    c.env,
    `SELECT mp.*, p.full_name as patient_name
     FROM meal_plans mp
     JOIN patients p ON p.id = mp.patient_id
     WHERE ${where}
     ORDER BY mp.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset]
  )

  return paginated(rows, { page, per_page: limit, total })
})

/**
 * POST /nutritionist/meal-plans — Create meal plan
 */
nutritionist.post('/meal-plans', requireType('nutritionist'), async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const {
    patient_id, title, description, start_date, end_date,
    target_calories, target_protein_g, target_carbs_g, target_fat_g,
    target_fiber_g, target_water_ml, meals_per_day, notes, plan_data,
  } = body

  if (!patient_id || !title) {
    throw new BadRequestError('Paciente e título são obrigatórios')
  }

  // Verify patient belongs to this nutritionist
  const patient = await pgQueryOne(
    c.env,
    'SELECT id FROM patients WHERE id = $1 AND nutritionist_id = $2',
    [patient_id, userId]
  )
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado')
  }

  const id = generateId()

  await pgQuery(
    c.env,
    `INSERT INTO meal_plans (id, nutritionist_id, patient_id, title, description,
       start_date, end_date, target_calories, target_protein_g, target_carbs_g,
       target_fat_g, target_fiber_g, target_water_ml, meals_per_day, notes, plan_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      id, userId, patient_id, title, description || null,
      start_date || null, end_date || null,
      target_calories || null, target_protein_g || null, target_carbs_g || null,
      target_fat_g || null, target_fiber_g || null, target_water_ml || null,
      meals_per_day || 5, notes || null, JSON.stringify(plan_data || {}),
    ]
  )

  return created({ id, title })
})

// ============================================
// NUTRITION ASSESSMENTS
// ============================================

/**
 * GET /nutritionist/assessments — List nutrition assessments
 */
nutritionist.get('/assessments', requireType('nutritionist'), async (c) => {
  const userId = c.get('userId')
  const page = parseInt(c.req.query('page') || '1')
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50)
  const patientId = c.req.query('patient_id')
  const offset = (page - 1) * limit

  let where = 'na.nutritionist_id = $1'
  const params: unknown[] = [userId]
  let paramIdx = 2

  if (patientId) {
    where += ` AND na.patient_id = $${paramIdx}`
    params.push(patientId)
    paramIdx++
  }

  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM nutrition_assessments na WHERE ${where}`,
    params
  )
  const total = countResult?.count ?? 0

  const { rows } = await pgQuery(
    c.env,
    `SELECT na.*, p.full_name as patient_name
     FROM nutrition_assessments na
     JOIN patients p ON p.id = na.patient_id
     WHERE ${where}
     ORDER BY na.assessment_date DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset]
  )

  return paginated(rows, { page, per_page: limit, total })
})

/**
 * POST /nutritionist/assessments — Create nutrition assessment
 */
nutritionist.post('/assessments', requireType('nutritionist'), async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const {
    patient_id, assessment_date, weight_kg, height_cm, body_fat_percentage,
    lean_mass_kg, waist_circumference, hip_circumference, arm_circumference,
    chest_circumference, thigh_circumference, calf_circumference,
    bia_body_water_pct, bia_visceral_fat, bia_basal_metabolic_rate,
    dietary_recall, food_frequency, blood_pressure_systolic,
    blood_pressure_diastolic, blood_glucose, notes, recommendations,
  } = body

  if (!patient_id) {
    throw new BadRequestError('Paciente é obrigatório')
  }

  const patient = await pgQueryOne(
    c.env,
    'SELECT id FROM patients WHERE id = $1 AND nutritionist_id = $2',
    [patient_id, userId]
  )
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado')
  }

  const id = generateId()

  // Calculate BMI and waist-hip ratio
  const bmi = weight_kg && height_cm ? (weight_kg / ((height_cm / 100) ** 2)).toFixed(1) : null
  const waist_hip_ratio = waist_circumference && hip_circumference
    ? (waist_circumference / hip_circumference).toFixed(2)
    : null

  await pgQuery(
    c.env,
    `INSERT INTO nutrition_assessments (id, nutritionist_id, patient_id, assessment_date,
       weight_kg, height_cm, bmi, body_fat_percentage, lean_mass_kg,
       waist_circumference, hip_circumference, arm_circumference,
       chest_circumference, thigh_circumference, calf_circumference,
       waist_hip_ratio, bia_body_water_pct, bia_visceral_fat, bia_basal_metabolic_rate,
       dietary_recall, food_frequency, blood_pressure_systolic, blood_pressure_diastolic,
       blood_glucose, notes, recommendations)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)`,
    [
      id, userId, patient_id, assessment_date || new Date().toISOString().split('T')[0],
      weight_kg || null, height_cm || null, bmi, body_fat_percentage || null, lean_mass_kg || null,
      waist_circumference || null, hip_circumference || null, arm_circumference || null,
      chest_circumference || null, thigh_circumference || null, calf_circumference || null,
      waist_hip_ratio, bia_body_water_pct || null, bia_visceral_fat || null,
      bia_basal_metabolic_rate || null, dietary_recall || null,
      JSON.stringify(food_frequency || {}), blood_pressure_systolic || null,
      blood_pressure_diastolic || null, blood_glucose || null,
      notes || null, recommendations || null,
    ]
  )

  return created({ id })
})

// ============================================
// DASHBOARD STATS
// ============================================

/**
 * GET /nutritionist/dashboard — Dashboard stats
 */
nutritionist.get('/dashboard', requireType('nutritionist'), async (c) => {
  const userId = c.get('userId')

  const [profile, patientStats, recentAssessments, recentPlans] = await Promise.all([
    pgQueryOne(
      c.env,
      'SELECT total_patients, active_patients, total_revenue, subscription_plan FROM nutritionists WHERE id = $1',
      [userId]
    ),
    pgQuery(
      c.env,
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'active')::int as active_count,
         COUNT(*) FILTER (WHERE status = 'inactive')::int as inactive_count,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')::int as new_this_month
       FROM patients WHERE nutritionist_id = $1`,
      [userId]
    ),
    pgQuery(
      c.env,
      `SELECT na.id, na.assessment_date, na.weight_kg, na.bmi, p.full_name as patient_name
       FROM nutrition_assessments na
       JOIN patients p ON p.id = na.patient_id
       WHERE na.nutritionist_id = $1
       ORDER BY na.created_at DESC LIMIT 5`,
      [userId]
    ),
    pgQuery(
      c.env,
      `SELECT mp.id, mp.title, mp.status, mp.created_at, p.full_name as patient_name
       FROM meal_plans mp
       JOIN patients p ON p.id = mp.patient_id
       WHERE mp.nutritionist_id = $1
       ORDER BY mp.created_at DESC LIMIT 5`,
      [userId]
    ),
  ])

  return success({
    profile,
    patient_stats: patientStats.rows[0] || { active_count: 0, inactive_count: 0, new_this_month: 0 },
    recent_assessments: recentAssessments.rows,
    recent_plans: recentPlans.rows,
  })
})

export { nutritionist as nutritionistRoutes }
