/**
 * workers/api/onboarding.ts
 *
 * Onboarding API — VFIT B2C Quiz
 *
 * POST /api/v1/onboarding — Salvar respostas do quiz
 * GET  /api/v1/onboarding — Buscar respostas existentes
 * PUT  /api/v1/onboarding — Atualizar respostas
 *
 * Auth: requireAuth (any user type)
 * DB: user_onboarding (Neon)
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created } from '@lib/response'
import { BadRequestError, NotFoundError } from '@lib/errors'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import { z } from 'zod'

const onboarding = new Hono<AppContext>()

// ─── Schema ───
const onboardingSchema = z.object({
  gender: z.enum(['male', 'female', 'other', 'prefer_not_say']),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
  training_frequency: z.enum(['regularly', 'inconsistently', 'never']),
  goal: z.enum(['lose_weight', 'gain_muscle', 'tone', 'health', 'strength', 'flexibility']),
  training_location: z.enum(['gym_large', 'gym_small', 'home', 'bodyweight', 'outdoor']),
  target_muscles: z.array(z.string()).default([]),
  age: z.number().int().min(13).max(100),
  height_cm: z.number().min(100).max(250),
  weight_kg: z.number().min(30).max(300),
  target_weight_kg: z.number().min(30).max(300).optional(),
  days_per_week: z.number().int().min(1).max(7).default(3),
  session_duration: z.enum(['quick_15', 'short_30', 'medium_45', 'long_60']).default('medium_45'),
  injuries: z.array(z.string()).default([]),
  preferred_days: z.array(z.string()).default([]),
  preferred_time: z.enum(['morning', 'afternoon', 'evening', 'any']).default('any'),
})

// ─── Auth required for all routes ───
onboarding.use('*', authMiddleware)

/**
 * GET /api/v1/onboarding
 * Buscar respostas do onboarding do usuário autenticado
 */
onboarding.get('/', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  const row = await pgQueryOne<{
    id: string
    gender: string
    experience_level: string
    training_frequency: string
    goal: string
    training_location: string
    target_muscles: string[]
    age: number
    height_cm: number
    weight_kg: number
    target_weight_kg: number | null
    days_per_week: number
    session_duration: string
    injuries: string[]
    preferred_days: string[]
    preferred_time: string
    completed_at: string | null
    created_at: string
  }>(env, `
    SELECT id, gender, experience_level, training_frequency, goal, training_location,
           target_muscles, age, height_cm, weight_kg, target_weight_kg,
           days_per_week, session_duration, injuries, preferred_days, preferred_time,
           completed_at, created_at
    FROM user_onboarding WHERE user_id = $1 LIMIT 1
  `, [userId])

  if (!row) {
    return success({ completed: false, data: null })
  }

  return success({ completed: !!row.completed_at, data: row })
})

/**
 * POST /api/v1/onboarding
 * Salvar respostas do onboarding quiz
 */
onboarding.post('/', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const body = await c.req.json()
  const data = onboardingSchema.parse(body)

  // Check if already exists (upsert)
  const existing = await pgQueryOne<{ id: string }>(
    env, 'SELECT id FROM user_onboarding WHERE user_id = $1 LIMIT 1', [userId]
  )

  const now = new Date().toISOString()

  if (existing) {
    // Update existing
    await pgQuery(env, `
      UPDATE user_onboarding
      SET gender = $1, experience_level = $2, training_frequency = $3, goal = $4,
          training_location = $5, target_muscles = $6, age = $7, height_cm = $8,
          weight_kg = $9, target_weight_kg = $10, days_per_week = $11,
          session_duration = $12, injuries = $13, preferred_days = $14,
          preferred_time = $15, completed_at = $16, updated_at = $16
      WHERE user_id = $17
    `, [
      data.gender, data.experience_level, data.training_frequency, data.goal,
      data.training_location, data.target_muscles, data.age, data.height_cm,
      data.weight_kg, data.target_weight_kg || null, data.days_per_week,
      data.session_duration, data.injuries, data.preferred_days,
      data.preferred_time, now, userId,
    ])

    return success({ message: 'Onboarding atualizado' })
  }

  // Insert new
  const id = generateId()
  await pgQuery(env, `
    INSERT INTO user_onboarding (
      id, user_id, gender, experience_level, training_frequency, goal,
      training_location, target_muscles, age, height_cm, weight_kg, target_weight_kg,
      days_per_week, session_duration, injuries, preferred_days, preferred_time,
      completed_at, created_at, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$18,$18)
  `, [
    id, userId, data.gender, data.experience_level, data.training_frequency, data.goal,
    data.training_location, data.target_muscles, data.age, data.height_cm,
    data.weight_kg, data.target_weight_kg || null, data.days_per_week,
    data.session_duration, data.injuries, data.preferred_days,
    data.preferred_time, now,
  ])

  return created({ id, message: 'Onboarding salvo' })
})

export { onboarding as onboardingRoutes }
