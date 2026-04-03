/**
 * workers/api/plans.ts
 *
 * VFIT B2C — Geração de Plano de Treino via IA
 *
 * POST /api/v1/plans/generate — Gerar plano baseado no perfil do onboarding
 *
 * Auth: optionalAuth (funciona com guest ou autenticado)
 * IA: Workers AI (Llama 3.3 70B) → fallback Replicate → fallback template
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created } from '@lib/response'
import { BadRequestError, NotFoundError, InternalError } from '@lib/errors'
import { callWorkersAIWithFallback } from '@lib/workers-ai'
import { PROMPTS } from '@lib/ai-prompts'
import { generatePlanInputSchema, generatedPlanSchema } from '@workers/schemas/plan-generation'
import type { GeneratedPlan } from '@workers/schemas/plan-generation'
import { getDefaultPlan } from '@config/default-plans'
import { authMiddleware } from '@workers/middleware/auth'
import { notify } from '@lib/onesignal'

const plans = new Hono<AppContext>()

// ============================================
// POST /generate — Gerar plano com IA
// ============================================
plans.post('/generate', async (c) => {
  const body = await c.req.json()
  const input = generatePlanInputSchema.parse(body)

  // Free plan limit: 1 plan per month (skip check if no auth)
  const userId = c.get('jwtPayload')?.sub
  if (userId) {
    const user = await pgQueryOne<{ subscription_plan: string }>(c.env,
      'SELECT subscription_plan FROM users WHERE id = $1', [userId]
    )
    const isPremium = user?.subscription_plan && user.subscription_plan !== 'free'
    if (!isPremium) {
      const count = await pgQueryOne<{ count: string }>(c.env, `
        SELECT COUNT(*) as count FROM workout_plans
        WHERE user_id = $1 AND created_at >= date_trunc('month', NOW())
      `, [userId])
      if (parseInt(count?.count || '0') >= 1) {
        throw new BadRequestError('Limite gratuito atingido. Assine o Premium para planos ilimitados.')
      }
    }
  }

  let plan: GeneratedPlan
  let source: 'ai' | 'fallback' = 'ai'

  try {
    // Montar prompt
    const prompt = PROMPTS.generate_b2c_plan({
      gender: input.gender,
      experience_level: input.experience_level,
      training_frequency: input.training_frequency,
      goal: input.goal,
      training_location: input.training_location,
      target_muscles: input.target_muscles,
      age: input.age,
      height_cm: input.height_cm,
      weight_kg: input.weight_kg,
      target_weight_kg: input.target_weight_kg || input.weight_kg,
      days_per_week: input.days_per_week,
      session_duration: input.session_duration,
      injuries: input.injuries,
      preferred_time: input.preferred_time,
    })

    // Chamar IA com fallback automático
    // Scale max_tokens by days_per_week to prevent truncation of larger plans
    const dynamicMaxTokens = Math.min(2048 + (input.days_per_week * 1024), 8192)
    const result = await callWorkersAIWithFallback(
      c.env,
      '@cf/meta/llama-4-scout-17b-16e-instruct',
      prompt,
      {
        max_tokens: dynamicMaxTokens,
        temperature: 0.6,
        fallbackModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      }
    )

    // Extrair JSON da resposta (pode vir com markdown wrappers)
    const raw = result.response
    let parsed: unknown

    // Strategy 1: Direct JSON parse
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Strategy 2: Extract from markdown code block ```json ... ```
      const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (codeBlockMatch) {
        try {
          parsed = JSON.parse(codeBlockMatch[1].trim())
        } catch {
          // Strategy 3: Greedy brace extraction
          const braceMatch = raw.match(/\{[\s\S]*\}/)
          if (braceMatch) {
            parsed = JSON.parse(braceMatch[0])
          } else {
            throw new InternalError('IA não retornou JSON válido')
          }
        }
      } else {
        // Strategy 3: Greedy brace extraction (no code block found)
        const braceMatch = raw.match(/\{[\s\S]*\}/)
        if (braceMatch) {
          parsed = JSON.parse(braceMatch[0])
        } else {
          throw new InternalError('IA não retornou JSON válido')
        }
      }
    }

    plan = generatedPlanSchema.parse(parsed)

  } catch (err) {
    // Fallback: usar template pré-montado
    console.warn('[Plans] AI generation failed, using fallback template:', err)
    plan = getDefaultPlan({
      goal: input.goal,
      training_location: input.training_location,
      experience_level: input.experience_level,
      days_per_week: input.days_per_week,
    })
    source = 'fallback'
  }

  // Garantir que o número de dias bate
  if (plan.days.length !== input.days_per_week) {
    plan = getDefaultPlan({
      goal: input.goal,
      training_location: input.training_location,
      experience_level: input.experience_level,
      days_per_week: input.days_per_week,
    })
    source = 'fallback'
  }

  // Calcular stats
  const totalExercises = plan.days.reduce((sum, d) => sum + d.exercises.length, 0)
  const avgExercisesPerDay = Math.round(totalExercises / plan.days.length)
  const durationMinutes: Record<string, number> = {
    quick_15: 15, short_30: 30, medium_45: 45, long_60: 60,
  }
  const sessionMinutes = durationMinutes[input.session_duration] || 45

  return success({
    plan,
    source,
    stats: {
      total_days: plan.days.length,
      total_exercises: totalExercises,
      avg_exercises_per_day: avgExercisesPerDay,
      session_duration_minutes: sessionMinutes,
      estimated_weekly_calories: (plan.estimated_calories_per_session || 250) * plan.days.length,
    },
  })
})

// ============================================
// POST /save — Salvar plano gerado na DB
// ============================================
plans.post('/save', async (c) => {
  // Requer userId (vem do auth ou é gerado como guest)
  const userId = c.get('userId')
  if (!userId) {
    throw new BadRequestError('Usuário não identificado')
  }

  const body = await c.req.json()
  const plan = generatedPlanSchema.parse(body.plan)

  const planId = generateId()
  const now = new Date().toISOString()

  // Inserir plano
  await pgQuery(
    c.env,
    `INSERT INTO workout_plans (id, user_id, name, description, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'active', $5, $5)`,
    [planId, userId, plan.plan_name, plan.description, now]
  )

  // Inserir dias + exercícios
  for (const day of plan.days) {
    const dayId = generateId()

    await pgQuery(
      c.env,
      `INSERT INTO workout_plan_days (id, plan_id, day_number, name, focus, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [dayId, planId, day.day_number, day.name, day.focus, now]
    )

    for (let i = 0; i < day.exercises.length; i++) {
      const ex = day.exercises[i]
      await pgQuery(
        c.env,
        `INSERT INTO workout_plan_exercises (id, day_id, name, muscle_group, sets, reps, rest_seconds, weight_suggestion_kg, notes, order_index, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [generateId(), dayId, ex.name, ex.muscle_group, ex.sets, ex.reps, ex.rest_seconds, ex.weight_suggestion_kg || null, ex.notes || null, i, now]
      )
    }
  }

  // D1 Sync: Replicate workout to D1 for offline/PWA access (best-effort)
  try {
    if (c.env.DB) {
      const planData = {
        id: planId,
        name: plan.plan_name,
        description: plan.description,
        days: plan.days,
        stats: {
          total_exercises: plan.days.reduce((s, d) => s + d.exercises.length, 0),
          created_at: now,
        },
      }

      await c.env.DB.prepare(
        `INSERT OR REPLACE INTO user_workouts_cache (id, user_id, name, data, synced_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        planId,
        userId,
        plan.plan_name,
        JSON.stringify(planData),
        Date.now(),
        Math.floor(new Date(now).getTime())
      ).run()

      console.log(`[D1] Synced workout ${planId} for user ${userId}`)
    }
  } catch (err) {
    // D1 is cache — do NOT fail the request if sync fails
    console.warn(`[D1] Failed to sync workout ${planId}:`, err)
  }

  // T8.7 — Push: novo plano gerado pela IA (best-effort)
  await notify(c.env, userId, {
    type: 'workout.new',
    title: '🏋️ Seu plano está pronto!',
    message: `"${plan.plan_name}" foi gerado com sucesso. Hora de começar!`,
    link: '/plano',
  }).catch(() => {})

  return created({ plan_id: planId })
})

// ============================================
// GET /current — Plano ativo do usuário
// ============================================
plans.get('/current', authMiddleware, async (c) => {
  const userId = c.get('userId')

  // Buscar plano ativo mais recente
  const plan = await pgQueryOne<{
    id: string
    name: string
    type: string
    status: string
    total_days: number
    current_day: number
    settings: Record<string, unknown>
    created_at: string
  }>(
    c.env,
    `SELECT id, name, type, status, total_days, current_day, settings, created_at
     FROM workout_plans
     WHERE user_id = $1 AND status = 'active'
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  )

  if (!plan) {
    throw new NotFoundError('Nenhum plano ativo encontrado')
  }

  // Buscar dias do plano
  const daysResult = await pgQuery<{
    id: string
    day_number: number
    name: string
    muscle_groups: string[]
    estimated_duration_min: number
  }>(
    c.env,
    `SELECT id, day_number, name, muscle_groups, estimated_duration_min
     FROM workout_plan_days
     WHERE plan_id = $1
     ORDER BY day_number ASC`,
    [plan.id]
  )
  const days = daysResult.rows

  // Buscar exercícios de todos os dias
  const dayIds = days.map((d) => d.id)
  let exercises: Array<{
    id: string
    plan_day_id: string
    exercise_id: string
    sort_order: number
    sets: number
    reps: string
    weight_kg: number | null
    rest_seconds: number
    is_warmup: boolean
    is_superset: boolean
    superset_group: string | null
    notes: string | null
    exercise_name: string | null
    muscle_group: string | null
  }> = []

  if (dayIds.length > 0) {
    const placeholders = dayIds.map((_: string, i: number) => `$${i + 1}`).join(', ')
    const exResult = await pgQuery(
      c.env,
      `SELECT pe.id, pe.plan_day_id, pe.exercise_id, pe.sort_order, pe.sets, pe.reps,
              pe.weight_kg, pe.rest_seconds, pe.is_warmup, pe.is_superset, pe.superset_group, pe.notes,
              e.name AS exercise_name, e.muscle_group
       FROM workout_plan_exercises pe
       LEFT JOIN exercises e ON e.id = pe.exercise_id
       WHERE pe.plan_day_id IN (${placeholders})
       ORDER BY pe.sort_order ASC`,
      dayIds
    )
    exercises = exResult.rows as typeof exercises
  }

  // Agrupar exercícios por dia
  const daysWithExercises = days.map((day) => ({
    ...day,
    exercises: exercises.filter((ex) => ex.plan_day_id === day.id),
  }))

  return success({
    plan: {
      ...plan,
      days: daysWithExercises,
    },
  })
})

// ============================================
// PATCH /:id/settings — Atualizar configurações do plano
// ============================================
plans.patch('/:id/settings', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const planId = c.req.param('id')
  const body = await c.req.json<{
    days_per_week?: number
    session_duration?: number
    rest_day_mode?: string
    goal?: string
    level?: string
    equipment?: string[]
  }>()

  // Verificar propriedade do plano
  const plan = await pgQueryOne<{ id: string; settings: Record<string, unknown> }>(
    c.env,
    'SELECT id, settings FROM workout_plans WHERE id = $1 AND user_id = $2',
    [planId, userId]
  )

  if (!plan) {
    throw new NotFoundError('Plano não encontrado')
  }

  // Merge settings
  const updatedSettings = {
    ...(plan.settings || {}),
    ...(body.days_per_week !== undefined && { days_per_week: body.days_per_week }),
    ...(body.session_duration !== undefined && { session_duration: body.session_duration }),
    ...(body.rest_day_mode !== undefined && { rest_day_mode: body.rest_day_mode }),
    ...(body.goal !== undefined && { goal: body.goal }),
    ...(body.level !== undefined && { level: body.level }),
    ...(body.equipment !== undefined && { equipment: body.equipment }),
  }

  await pgQuery(
    c.env,
    'UPDATE workout_plans SET settings = $1, updated_at = NOW() WHERE id = $2',
    [JSON.stringify(updatedSettings), planId]
  )

  return success({ settings: updatedSettings })
})

// ============================================
// POST /regenerate — Gerar novo plano (descarta o anterior)
// ============================================
plans.post('/regenerate', authMiddleware, async (c) => {
  const userId = c.get('userId')

  // Desativar plano atual
  await pgQuery(
    c.env,
    `UPDATE workout_plans SET status = 'replaced', updated_at = NOW()
     WHERE user_id = $1 AND status = 'active'`,
    [userId]
  )

  // Buscar perfil do usuário para gerar novo plano
  const profile = await pgQueryOne<{
    gender: string
    training_location: string
    experience_level: string
    goal: string
    height_cm: number
    weight_kg: number
    training_frequency: number
    session_duration: number
    injuries: string[]
  }>(
    c.env,
    `SELECT u.gender, u.height_cm, u.weight_kg,
            s.training_location, s.experience_level, s.goal,
            s.training_frequency, s.session_duration, s.injuries
     FROM users u
     LEFT JOIN students s ON s.id = u.id
     WHERE u.id = $1`,
    [userId]
  )

  if (!profile) {
    throw new BadRequestError('Perfil não encontrado. Complete o onboarding primeiro.')
  }

  // Gerar com IA (reusa a lógica de /generate)
  const prompt = PROMPTS.generate_b2c_plan({
    gender: profile.gender || 'male',
    experience_level: profile.experience_level || 'beginner',
    training_frequency: String(profile.training_frequency || 3),
    goal: profile.goal || 'muscle_gain',
    training_location: profile.training_location || 'gym',
    target_muscles: [],
    age: 25,
    height_cm: profile.height_cm || 170,
    weight_kg: profile.weight_kg || 70,
    target_weight_kg: profile.weight_kg || 70,
    days_per_week: profile.training_frequency || 3,
    session_duration: `medium_${profile.session_duration || 45}`,
    injuries: profile.injuries || [],
    preferred_time: 'morning',
  })

  let generatedPlan: GeneratedPlan | null = null

  try {
    const regenMaxTokens = Math.min(2048 + ((profile.training_frequency || 3) * 1024), 8192)
    const aiResult = await callWorkersAIWithFallback(
      c.env,
      '@cf/meta/llama-4-scout-17b-16e-instruct',
      prompt,
      {
        max_tokens: regenMaxTokens,
        temperature: 0.6,
        fallbackModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      }
    )
    const jsonMatch = aiResult.response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      generatedPlan = generatedPlanSchema.parse(JSON.parse(jsonMatch[0]))
    }
  } catch {
    // fallback to template
  }

  if (!generatedPlan) {
    generatedPlan = getDefaultPlan({
      training_location: profile.training_location || 'gym',
      goal: profile.goal || 'muscle_gain',
      experience_level: profile.experience_level || 'beginner',
      days_per_week: profile.training_frequency || 3,
    })
  }

  // Salvar novo plano
  const newPlanId = generateId()
  await pgQuery(
    c.env,
    `INSERT INTO workout_plans (id, user_id, name, type, status, total_days, current_day, settings)
     VALUES ($1, $2, $3, 'ai_generated', 'active', $4, 1, $5)`,
    [
      newPlanId,
      userId,
      generatedPlan.plan_name,
      generatedPlan.days.length,
      JSON.stringify({
        goal: profile.goal,
        level: profile.experience_level,
        location: profile.training_location,
        estimated_calories: generatedPlan.estimated_calories_per_session,
      }),
    ]
  )

  // Salvar dias + exercícios
  for (const day of generatedPlan.days) {
    const dayId = generateId()
    const muscleGroups = [...new Set(day.exercises.map((e) => e.muscle_group))]
    await pgQuery(
      c.env,
      `INSERT INTO workout_plan_days (id, plan_id, day_number, name, muscle_groups, estimated_duration_min, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [dayId, newPlanId, day.day_number, day.name, muscleGroups, profile.session_duration || 60, day.day_number]
    )

    for (let i = 0; i < day.exercises.length; i++) {
      const ex = day.exercises[i]
      await pgQuery(
        c.env,
        `INSERT INTO workout_plan_exercises (id, plan_day_id, exercise_id, sort_order, sets, reps, weight_kg, rest_seconds, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          generateId(), dayId, generateId(), i + 1,
          ex.sets, ex.reps, ex.weight_suggestion_kg || null, ex.rest_seconds, ex.notes || null,
        ]
      )
    }
  }

  // D1 Sync: Replicate regenerated workout to D1 (best-effort)
  try {
    if (c.env.DB) {
      const planData = {
        id: newPlanId,
        name: generatedPlan.plan_name,
        days: generatedPlan.days,
        stats: {
          total_exercises: generatedPlan.days.reduce((s, d) => s + d.exercises.length, 0),
          regenerated: true,
        },
      }

      await c.env.DB.prepare(
        `INSERT OR REPLACE INTO user_workouts_cache (id, user_id, name, data, synced_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        newPlanId,
        userId,
        generatedPlan.plan_name,
        JSON.stringify(planData),
        Date.now(),
        Date.now()
      ).run()

      console.log(`[D1] Synced regenerated workout ${newPlanId} for user ${userId}`)
    }
  } catch (err) {
    console.warn(`[D1] Failed to sync regenerated workout ${newPlanId}:`, err)
  }

  return created({ plan_id: newPlanId, plan_name: generatedPlan.plan_name })
})

// ============================================
// PATCH /plans/:planId/days/:dayId/exercises — Update exercises for a day
// ============================================
plans.patch('/:planId/days/:dayId/exercises', authMiddleware, async (c) => {
  const userId = c.get('jwtPayload').sub
  const planId = c.req.param('planId')
  const dayId = c.req.param('dayId')

  // Verify ownership
  const plan = await pgQueryOne(c.env,
    'SELECT id FROM workout_plans WHERE id = $1 AND user_id = $2 AND status = $3',
    [planId, userId, 'active']
  )
  if (!plan) return c.json({ success: false, error: 'Plan not found' }, 404)

  // Verify day belongs to plan
  const day = await pgQueryOne(c.env,
    'SELECT id FROM workout_plan_days WHERE id = $1 AND plan_id = $2',
    [dayId, planId]
  )
  if (!day) return c.json({ success: false, error: 'Day not found' }, 404)

  const body = await c.req.json<{
    exercises: Array<{
      id?: string
      exercise_id: string
      sets: number
      reps: string
      weight_kg?: number | null
      rest_seconds?: number
      is_warmup?: boolean
      is_superset?: boolean
      superset_group?: string | null
      notes?: string | null
    }>
  }>()

  // Delete existing exercises for this day
  await pgQuery(c.env,
    'DELETE FROM workout_plan_exercises WHERE plan_day_id = $1',
    [dayId]
  )

  // Insert new exercises
  for (let i = 0; i < body.exercises.length; i++) {
    const ex = body.exercises[i]
    await pgQuery(c.env,
      `INSERT INTO workout_plan_exercises (id, plan_day_id, exercise_id, sort_order, sets, reps, weight_kg, rest_seconds, is_warmup, is_superset, superset_group, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        ex.id || generateId(), dayId, ex.exercise_id, i + 1,
        ex.sets, ex.reps, ex.weight_kg || null, ex.rest_seconds || 60,
        ex.is_warmup || false, ex.is_superset || false,
        ex.superset_group || null, ex.notes || null,
      ]
    )
  }

  // Update muscle_groups array on the day
  const muscleGroups = [...new Set(body.exercises.map((e) => e.exercise_id))]
  await pgQuery(c.env,
    'UPDATE workout_plan_days SET estimated_duration_min = $1 WHERE id = $2',
    [body.exercises.length * 5, dayId]
  )

  return success({ updated: body.exercises.length })
})

// ============================================
// DELETE /plans/:planId/days/:dayId/exercises/:exerciseId — Remove exercise from day
// ============================================
plans.delete('/:planId/days/:dayId/exercises/:exerciseId', authMiddleware, async (c) => {
  const userId = c.get('jwtPayload').sub
  const planId = c.req.param('planId')
  const dayId = c.req.param('dayId')
  const exerciseId = c.req.param('exerciseId')

  // Verify ownership
  const plan = await pgQueryOne(c.env,
    'SELECT id FROM workout_plans WHERE id = $1 AND user_id = $2 AND status = $3',
    [planId, userId, 'active']
  )
  if (!plan) return c.json({ success: false, error: 'Plan not found' }, 404)

  await pgQuery(c.env,
    'DELETE FROM workout_plan_exercises WHERE id = $1 AND plan_day_id = $2',
    [exerciseId, dayId]
  )

  return success({ deleted: true })
})

// ============================================
// GET /history — Plan history for user
// ============================================
plans.get('/history', authMiddleware, async (c) => {
  const userId = c.get('jwtPayload').sub
  const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50)

  const { rows } = await pgQuery(c.env, `
    SELECT wp.id, wp.name, wp.goal, wp.experience_level, wp.days_per_week,
           wp.status, wp.created_at, wp.updated_at,
           (SELECT COUNT(*) FROM workout_plan_days wpd WHERE wpd.plan_id = wp.id) as total_days
    FROM workout_plans wp
    WHERE wp.user_id = $1
    ORDER BY wp.created_at DESC
    LIMIT $2
  `, [userId, limit])

  return success(rows)
})

// ============================================
// GET /limits — Check user plan generation limits
// ============================================
plans.get('/limits', authMiddleware, async (c) => {
  const userId = c.get('jwtPayload').sub

  // Check subscription
  const user = await pgQueryOne<{ subscription_plan: string }>(c.env,
    'SELECT subscription_plan FROM users WHERE id = $1', [userId]
  )
  const isPremium = user?.subscription_plan && user.subscription_plan !== 'free'

  // Count plans generated this month
  const count = await pgQueryOne<{ count: string }>(c.env, `
    SELECT COUNT(*) as count FROM workout_plans
    WHERE user_id = $1 AND created_at >= date_trunc('month', NOW())
  `, [userId])

  const plansThisMonth = parseInt(count?.count || '0')
  const maxPlans = isPremium ? -1 : 1

  return success({
    plans_this_month: plansThisMonth,
    max_plans: maxPlans,
    is_premium: !!isPremium,
    can_generate: isPremium || plansThisMonth < 1,
  })
})

export { plans as plansRoutes }
