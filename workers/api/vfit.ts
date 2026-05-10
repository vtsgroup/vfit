/**
 * workers/api/vfit.ts
 *
 * VFIT B2C — Endpoints de Treinos, Nutrição, Avaliações & IA
 *
 * GET    /api/v1/vfit/workouts             — Listar workouts (library + own)
 * GET    /api/v1/vfit/workouts/:id         — Detalhe de workout
 * POST   /api/v1/vfit/workouts             — Criar workout
 * PUT    /api/v1/vfit/workouts/:id         — Atualizar workout
 * DELETE /api/v1/vfit/workouts/:id         — Deletar workout
 *
 * POST   /api/v1/vfit/sessions             — Iniciar sessão de treino
 * PUT    /api/v1/vfit/sessions/:id/complete — Finalizar sessão
 * POST   /api/v1/vfit/sessions/:id/sets    — Registrar set
 * GET    /api/v1/vfit/sessions/history      — Histórico de sessões
 *
 * GET    /api/v1/vfit/foods                — Buscar alimentos
 * POST   /api/v1/vfit/meals                — Registrar refeição
 * GET    /api/v1/vfit/meals/today          — Refeições do dia
 *
 * POST   /api/v1/vfit/evaluations          — Criar avaliação
 * GET    /api/v1/vfit/evaluations           — Listar avaliações do usuário
 *
 * GET    /api/v1/vfit/profile              — Perfil AI do usuário
 *
 * Auth: authMiddleware (obrigatório em todas)
 * DB: Neon (vfit_* tables)
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created, paginated, noContent } from '@lib/response'
import { BadRequestError, NotFoundError, ForbiddenError } from '@lib/errors'
import { callWorkersAIWithFallback } from '@lib/workers-ai'
import { z } from 'zod'

const vfit = new Hono<AppContext>()

vfit.use('*', authMiddleware)

// ============================================
// WORKOUTS
// ============================================

/**
 * GET /workouts — Listar workouts (library públicos + próprios)
 */
vfit.get('/workouts', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const page = parseInt(c.req.query('page') || '1', 10)
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 50)
  const offset = (page - 1) * limit
  const muscle = c.req.query('muscle')
  const difficulty = c.req.query('difficulty')
  const search = c.req.query('search')

  let where = `WHERE (w.is_library = true OR w.creator_id = $1)`
  const params: unknown[] = [userId]
  let paramIdx = 2

  if (muscle) {
    where += ` AND w.primary_muscle = $${paramIdx}`
    params.push(muscle)
    paramIdx++
  }
  if (difficulty) {
    where += ` AND w.difficulty_level = $${paramIdx}`
    params.push(difficulty)
    paramIdx++
  }
  if (search) {
    where += ` AND (w.name ILIKE $${paramIdx} OR w.description ILIKE $${paramIdx})`
    params.push(`%${search}%`)
    paramIdx++
  }

  const { rows: countRows } = await pgQuery<{ count: number }>(
    env,
    `SELECT COUNT(*)::int as count FROM vfit_workouts w ${where}`,
    params
  )
  const total = countRows[0]?.count ?? 0

  const workouts = await pgQuery(
    env,
    `SELECT w.id, w.name, w.description, w.difficulty_level, w.duration_minutes,
            w.primary_muscle, w.secondary_muscles, w.exercises, w.cover_image_url,
            w.is_library, w.is_public, w.creator_id, w.created_at
     FROM vfit_workouts w ${where}
     ORDER BY w.is_library DESC, w.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset]
  )

  return c.json(paginated(workouts.rows, { page, per_page: limit, total }))
})

/**
 * GET /workouts/:id — Detalhe
 */
vfit.get('/workouts/:id', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const id = c.req.param('id')

  const workout = await pgQueryOne(
    env,
    `SELECT * FROM vfit_workouts
     WHERE id = $1 AND (is_library = true OR creator_id = $2)`,
    [id, userId]
  )

  if (!workout) throw new NotFoundError('Workout not found')
  return c.json(success(workout))
})

/**
 * POST /workouts — Criar workout
 */
vfit.post('/workouts', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const body = await c.req.json()

  const CreateSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    duration_minutes: z.number().int().min(5).max(300).default(45),
    primary_muscle: z.string().default('full_body'),
    secondary_muscles: z.array(z.string()).default([]),
    exercises: z.array(z.object({
      exercise_id: z.string().min(1),
      sets: z.number().int().min(1).max(20),
      reps: z.string().min(1),
      rest_seconds: z.number().int().min(0).max(600).default(90),
      notes: z.string().optional(),
    })).min(1),
    cover_image_url: z.string().url().optional(),
    is_public: z.boolean().default(false),
  })

  const data = CreateSchema.parse(body)

  const workout = await pgQueryOne(
    env,
    `INSERT INTO vfit_workouts (creator_id, name, description, difficulty_level, duration_minutes,
       primary_muscle, secondary_muscles, exercises, cover_image_url, is_public)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      userId, data.name, data.description || null, data.difficulty_level,
      data.duration_minutes, data.primary_muscle,
      JSON.stringify(data.secondary_muscles), JSON.stringify(data.exercises),
      data.cover_image_url || null, data.is_public,
    ]
  )

  return c.json(created(workout), 201)
})

/**
 * PUT /workouts/:id — Atualizar workout
 */
vfit.put('/workouts/:id', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const id = c.req.param('id')
  const body = await c.req.json()

  // Verifica ownership
  const existing = await pgQueryOne<{ creator_id: string }>(
    env,
    `SELECT creator_id FROM vfit_workouts WHERE id = $1`,
    [id]
  )
  if (!existing) throw new NotFoundError('Workout not found')
  if (existing.creator_id !== userId) throw new ForbiddenError('Not your workout')

  const UpdateSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    duration_minutes: z.number().int().min(5).max(300).optional(),
    primary_muscle: z.string().optional(),
    secondary_muscles: z.array(z.string()).optional(),
    exercises: z.array(z.object({
      exercise_id: z.string().min(1),
      sets: z.number().int().min(1).max(20),
      reps: z.string().min(1),
      rest_seconds: z.number().int().min(0).max(600).default(90),
      notes: z.string().optional(),
    })).min(1).optional(),
    cover_image_url: z.string().url().optional(),
    is_public: z.boolean().optional(),
  })

  const data = UpdateSchema.parse(body)

  // Build dynamic SET
  const sets: string[] = []
  const params: unknown[] = []
  let idx = 1

  if (data.name !== undefined) { sets.push(`name = $${idx}`); params.push(data.name); idx++ }
  if (data.description !== undefined) { sets.push(`description = $${idx}`); params.push(data.description); idx++ }
  if (data.difficulty_level !== undefined) { sets.push(`difficulty_level = $${idx}`); params.push(data.difficulty_level); idx++ }
  if (data.duration_minutes !== undefined) { sets.push(`duration_minutes = $${idx}`); params.push(data.duration_minutes); idx++ }
  if (data.primary_muscle !== undefined) { sets.push(`primary_muscle = $${idx}`); params.push(data.primary_muscle); idx++ }
  if (data.secondary_muscles !== undefined) { sets.push(`secondary_muscles = $${idx}`); params.push(JSON.stringify(data.secondary_muscles)); idx++ }
  if (data.exercises !== undefined) { sets.push(`exercises = $${idx}`); params.push(JSON.stringify(data.exercises)); idx++ }
  if (data.cover_image_url !== undefined) { sets.push(`cover_image_url = $${idx}`); params.push(data.cover_image_url); idx++ }
  if (data.is_public !== undefined) { sets.push(`is_public = $${idx}`); params.push(data.is_public); idx++ }

  if (sets.length === 0) throw new BadRequestError('No fields to update')

  sets.push(`updated_at = NOW()`)
  params.push(id)

  const workout = await pgQueryOne(
    env,
    `UPDATE vfit_workouts SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  )

  return c.json(success(workout))
})

/**
 * DELETE /workouts/:id — Deletar workout
 */
vfit.delete('/workouts/:id', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const id = c.req.param('id')

  const existing = await pgQueryOne<{ creator_id: string }>(
    env,
    `SELECT creator_id FROM vfit_workouts WHERE id = $1`,
    [id]
  )
  if (!existing) throw new NotFoundError('Workout not found')
  if (existing.creator_id !== userId) throw new ForbiddenError('Not your workout')

  await pgQuery(env, `DELETE FROM vfit_workouts WHERE id = $1`, [id])
  return c.json(noContent())
})

// ============================================
// SESSIONS
// ============================================

/**
 * POST /sessions — Iniciar sessão de treino
 */
vfit.post('/sessions', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const body = await c.req.json()

  const schema = z.object({
    workout_id: z.string().uuid(),
  })
  const data = schema.parse(body)

  // Verifica se workout existe e é acessível
  const workout = await pgQueryOne(
    env,
    `SELECT id FROM vfit_workouts WHERE id = $1 AND (is_library = true OR creator_id = $2)`,
    [data.workout_id, userId]
  )
  if (!workout) throw new NotFoundError('Workout not found')

  const session = await pgQueryOne(
    env,
    `INSERT INTO vfit_workout_sessions (user_id, workout_id) VALUES ($1, $2) RETURNING *`,
    [userId, data.workout_id]
  )

  return c.json(created(session), 201)
})

/**
 * PUT /sessions/:id/complete — Finalizar sessão
 */
vfit.put('/sessions/:id/complete', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))

  const schema = z.object({
    rpe_overall: z.number().int().min(1).max(10).optional(),
    notes: z.string().optional(),
  })
  const data = schema.parse(body)

  const session = await pgQueryOne(
    env,
    `UPDATE vfit_workout_sessions
     SET is_completed = true, completed_at = NOW(),
         duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::int,
         rpe_overall = COALESCE($3, rpe_overall),
         notes = COALESCE($4, notes)
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId, data.rpe_overall || null, data.notes || null]
  )

  if (!session) throw new NotFoundError('Session not found')
  return c.json(success(session))
})

/**
 * POST /sessions/:id/sets — Registrar set
 */
vfit.post('/sessions/:id/sets', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const sessionId = c.req.param('id')
  const body = await c.req.json()

  // Verifica ownership
  const session = await pgQueryOne<{ id: string }>(
    env,
    `SELECT id FROM vfit_workout_sessions WHERE id = $1 AND user_id = $2`,
    [sessionId, userId]
  )
  if (!session) throw new NotFoundError('Session not found')

  const schema = z.object({
    exercise_id: z.string().min(1),
    set_number: z.number().int().min(1),
    reps: z.number().int().min(0).optional(),
    weight_kg: z.number().min(0).optional(),
    rpe: z.number().int().min(1).max(10).optional(),
    notes: z.string().optional(),
  })
  const data = schema.parse(body)

  const set = await pgQueryOne(
    env,
    `INSERT INTO vfit_workout_sets (session_id, exercise_id, set_number, reps, weight_kg, rpe, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [sessionId, data.exercise_id, data.set_number, data.reps || null,
     data.weight_kg || null, data.rpe || null, data.notes || null]
  )

  return c.json(created(set), 201)
})

/**
 * GET /sessions/history — Histórico de sessões do usuário
 */
vfit.get('/sessions/history', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const page = parseInt(c.req.query('page') || '1', 10)
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 50)
  const offset = (page - 1) * limit

  const { rows: countRows } = await pgQuery<{ count: number }>(
    env,
    `SELECT COUNT(*)::int as count FROM vfit_workout_sessions WHERE user_id = $1`,
    [userId]
  )
  const total = countRows[0]?.count ?? 0

  const sessions = await pgQuery(
    env,
    `SELECT s.id, s.workout_id, w.name as workout_name, s.started_at, s.completed_at,
            s.duration_seconds, s.rpe_overall, s.is_completed, s.notes,
            (SELECT COUNT(*) FROM vfit_workout_sets WHERE session_id = s.id)::int as total_sets
     FROM vfit_workout_sessions s
     LEFT JOIN vfit_workouts w ON w.id = s.workout_id
     WHERE s.user_id = $1
     ORDER BY s.started_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  )

  return c.json(paginated(sessions.rows, { page, per_page: limit, total }))
})

// ============================================
// FOODS & MEALS
// ============================================

const FoodInputSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional(),
  category: z.string().min(2).max(100).default('manual'),
  calories: z.coerce.number().min(0).max(9999),
  protein_g: z.coerce.number().min(0).max(999),
  carbs_g: z.coerce.number().min(0).max(999),
  fat_g: z.coerce.number().min(0).max(999),
  fiber_g: z.coerce.number().min(0).max(999).optional().default(0),
  sodium_mg: z.coerce.number().min(0).max(99999).optional().default(0),
  standard_portion_g: z.coerce.number().int().min(1).max(5000).default(100),
})

async function foodFavoritesTableExists(env: AppContext['Bindings']): Promise<boolean> {
  const row = await pgQueryOne<{ exists: boolean }>(
    env,
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'vfit_food_favorites'
     ) as exists`,
    []
  )
  return row?.exists === true
}

async function selectFoodWithFavorite(env: AppContext['Bindings'], foodId: string, userId: string) {
  if (await foodFavoritesTableExists(env)) {
    return pgQueryOne(
      env,
      `SELECT f.*, (fav.food_id IS NOT NULL) as is_favorite
         FROM vfit_foods f
         LEFT JOIN vfit_food_favorites fav
           ON fav.food_id = f.id AND fav.user_id = $2
        WHERE f.id = $1 AND (f.is_library = true OR f.creator_id = $2)
        LIMIT 1`,
      [foodId, userId]
    )
  }

  return pgQueryOne(
    env,
    `SELECT f.*, false as is_favorite
       FROM vfit_foods f
      WHERE f.id = $1 AND (f.is_library = true OR f.creator_id = $2)
      LIMIT 1`,
    [foodId, userId]
  )
}

/**
 * GET /foods/recent — Alimentos usados recentemente pelo usuário
 */
vfit.get('/foods/recent', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const limit = Math.min(parseInt(c.req.query('limit') || '12', 10), 30)
  const hasFavorites = await foodFavoritesTableExists(env)

  const foods = await pgQuery(
    env,
    `SELECT * FROM (
       SELECT DISTINCT ON (f.id) f.*,
              m.created_at as last_logged_at,
              ${hasFavorites ? `(fav.food_id IS NOT NULL)` : `false`} as is_favorite
         FROM vfit_user_meals m
         JOIN vfit_foods f ON f.id = m.food_id
         ${hasFavorites ? `LEFT JOIN vfit_food_favorites fav ON fav.food_id = f.id AND fav.user_id = $1` : ``}
        WHERE m.user_id = $1
        ORDER BY f.id, m.created_at DESC
     ) recent
      ORDER BY last_logged_at DESC
      LIMIT $2`,
    [userId, limit]
  )

  return c.json(success(foods.rows))
})

/**
 * GET /foods/favorites — Favoritos do usuário
 */
vfit.get('/foods/favorites', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const limit = Math.min(parseInt(c.req.query('limit') || '30', 10), 50)

  if (!(await foodFavoritesTableExists(env))) {
    return c.json(success([]))
  }

  const foods = await pgQuery(
    env,
    `SELECT f.*, true as is_favorite, fav.created_at as favorited_at
       FROM vfit_food_favorites fav
       JOIN vfit_foods f ON f.id = fav.food_id
      WHERE fav.user_id = $1 AND (f.is_library = true OR f.creator_id = $1)
      ORDER BY fav.created_at DESC
      LIMIT $2`,
    [userId, limit]
  )

  return c.json(success(foods.rows))
})

/**
 * POST /foods — Entrada manual/customizada de alimento
 */
vfit.post('/foods', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const data = FoodInputSchema.parse(await c.req.json())

  const food = await pgQueryOne(
    env,
    `INSERT INTO vfit_foods
      (name, description, category, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg,
       standard_portion_g, is_library, is_custom, creator_id, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, true, $11, ARRAY['manual'])
     RETURNING *, false as is_favorite`,
    [
      data.name.trim(), data.description || null, data.category.trim().toLowerCase(),
      data.calories, data.protein_g, data.carbs_g, data.fat_g,
      data.fiber_g, data.sodium_mg, data.standard_portion_g, userId,
    ]
  )

  return c.json(created(food), 201)
})

/**
 * POST /foods/:id/favorite — Favoritar alimento
 */
vfit.post('/foods/:id/favorite', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const foodId = c.req.param('id')

  if (!(await foodFavoritesTableExists(env))) {
    throw new BadRequestError('Tabela de favoritos ainda nao foi migrada')
  }

  const food = await selectFoodWithFavorite(env, foodId, userId)
  if (!food) throw new NotFoundError('Food not found')

  await pgQuery(
    env,
    `INSERT INTO vfit_food_favorites (user_id, food_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, food_id) DO NOTHING`,
    [userId, foodId]
  )

  return c.json(success({ food_id: foodId, is_favorite: true }))
})

/**
 * DELETE /foods/:id/favorite — Remover favorito
 */
vfit.delete('/foods/:id/favorite', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const foodId = c.req.param('id')

  if (await foodFavoritesTableExists(env)) {
    await pgQuery(env, `DELETE FROM vfit_food_favorites WHERE user_id = $1 AND food_id = $2`, [userId, foodId])
  }

  return c.json(success({ food_id: foodId, is_favorite: false }))
})

/**
 * GET /foods — Buscar alimentos (library + custom do user)
 */
vfit.get('/foods', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const search = c.req.query('search') || c.req.query('q') || ''
  const category = c.req.query('category')
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100)
  const hasFavorites = await foodFavoritesTableExists(env)

  let where = `WHERE (f.is_library = true OR f.creator_id = $1)`
  const searchPattern = search ? `%${search}%` : ''
  const params: unknown[] = [userId, searchPattern]
  let idx = 3

  if (search) {
    where += ` AND f.name ILIKE $2`
  }
  if (category) {
    where += ` AND f.category = $${idx}`
    params.push(category)
    idx++
  }

  params.push(limit)
  const foods = await pgQuery(
    env,
    `SELECT f.*, ${hasFavorites ? `(fav.food_id IS NOT NULL)` : `false`} as is_favorite
     FROM vfit_foods f
     ${hasFavorites ? `LEFT JOIN vfit_food_favorites fav ON fav.food_id = f.id AND fav.user_id = $1` : ``}
     ${where}
     ORDER BY
       CASE WHEN $2 <> '' AND f.name ILIKE $2 THEN 0 ELSE 1 END,
       f.name
     LIMIT $${idx}`,
    params
  )

  return c.json(success(foods.rows))
})

/**
 * POST /meals — Registrar refeição
 */
vfit.post('/meals', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const body = await c.req.json()

  const schema = z.object({
    food_id: z.string().uuid(),
    meal_type: z.enum(['breakfast', 'lunch', 'snack', 'dinner', 'pre_workout', 'post_workout']),
    quantity_g: z.number().int().min(1).default(100),
    logged_at: z.string().date().optional(),
  })
  const data = schema.parse(body)

  // Busca dados nutricionais do food
  const food = await pgQueryOne<{
    calories: string; protein_g: string; carbs_g: string; fat_g: string; standard_portion_g: string
  }>(
    env,
    `SELECT calories, protein_g, carbs_g, fat_g, standard_portion_g FROM vfit_foods WHERE id = $1`,
    [data.food_id]
  )
  if (!food) throw new NotFoundError('Food not found')

  // Calcula macros proporcionais
  const ratio = data.quantity_g / parseInt(food.standard_portion_g || '100', 10)
  const calories = parseFloat(food.calories) * ratio
  const protein = parseFloat(food.protein_g) * ratio
  const carbs = parseFloat(food.carbs_g) * ratio
  const fat = parseFloat(food.fat_g) * ratio

  const meal = await pgQueryOne(
    env,
    `INSERT INTO vfit_user_meals (user_id, food_id, meal_type, quantity_g, logged_at,
       calories_total, protein_total, carbs_total, fat_total)
     VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE), $6, $7, $8, $9)
     RETURNING *`,
    [userId, data.food_id, data.meal_type, data.quantity_g,
     data.logged_at || null, calories, protein, carbs, fat]
  )

  return c.json(created(meal), 201)
})

/**
 * GET /meals/today — Refeições do dia
 */
vfit.get('/meals/today', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const date = c.req.query('date') || new Date().toISOString().slice(0, 10)

  const meals = await pgQuery(
    env,
    `SELECT m.*, f.name as food_name, f.category as food_category
     FROM vfit_user_meals m
     JOIN vfit_foods f ON f.id = m.food_id
     WHERE m.user_id = $1 AND m.logged_at = $2
     ORDER BY m.created_at`,
    [userId, date]
  )

  // Totais do dia
  const totals = await pgQueryOne<{
    total_calories: string; total_protein: string; total_carbs: string; total_fat: string
  }>(
    env,
    `SELECT COALESCE(SUM(calories_total), 0) as total_calories,
            COALESCE(SUM(protein_total), 0) as total_protein,
            COALESCE(SUM(carbs_total), 0) as total_carbs,
            COALESCE(SUM(fat_total), 0) as total_fat
     FROM vfit_user_meals WHERE user_id = $1 AND logged_at = $2`,
    [userId, date]
  )

  return c.json(success({
    date,
    meals: meals.rows,
    totals: {
      calories: parseFloat(totals?.total_calories || '0'),
      protein: parseFloat(totals?.total_protein || '0'),
      carbs: parseFloat(totals?.total_carbs || '0'),
      fat: parseFloat(totals?.total_fat || '0'),
    },
  }))
})

// ============================================
// EVALUATIONS
// ============================================

/**
 * POST /evaluations — Criar avaliação (self ou por trainer)
 */
vfit.post('/evaluations', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const body = await c.req.json()

  const schema = z.object({
    evaluation_type: z.enum(['body_composition', 'strength', 'flexibility', 'balance', 'custom']).default('body_composition'),
    metrics: z.record(z.string(), z.any()),
    photos: z.array(z.string().url()).default([]),
    evaluation_date: z.string().date().optional(),
  })
  const data = schema.parse(body)

  const evaluation = await pgQueryOne(
    env,
    `INSERT INTO vfit_evaluations (user_id, evaluation_type, metrics, photos, evaluation_date)
     VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE))
     RETURNING *`,
    [userId, data.evaluation_type, JSON.stringify(data.metrics),
     JSON.stringify(data.photos), data.evaluation_date || null]
  )

  return c.json(created(evaluation), 201)
})

/**
 * GET /evaluations — Listar avaliações do usuário
 */
vfit.get('/evaluations', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const type = c.req.query('type')
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 50)

  let where = `WHERE user_id = $1`
  const params: unknown[] = [userId]
  let idx = 2

  if (type) {
    where += ` AND evaluation_type = $${idx}`
    params.push(type)
    idx++
  }

  params.push(limit)
  const evaluations = await pgQuery(
    env,
    `SELECT * FROM vfit_evaluations ${where} ORDER BY evaluation_date DESC LIMIT $${idx}`,
    params
  )

  return c.json(success(evaluations))
})

// ============================================
// AI PROFILE
// ============================================

/**
 * GET /profile — Perfil AI do usuário (contexto p/ IA)
 */
vfit.get('/profile', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  // Busca ou cria perfil
  let profile = await pgQueryOne(
    env,
    `SELECT * FROM vfit_user_ai_profiles WHERE user_id = $1`,
    [userId]
  )

  if (!profile) {
    profile = await pgQueryOne(
      env,
      `INSERT INTO vfit_user_ai_profiles (user_id) VALUES ($1) RETURNING *`,
      [userId]
    )
  }

  // Enriquecer com dados recentes
  const recentSessions = await pgQuery(
    env,
    `SELECT s.id, w.name as workout_name, s.started_at, s.duration_seconds, s.rpe_overall
     FROM vfit_workout_sessions s
     LEFT JOIN vfit_workouts w ON w.id = s.workout_id
     WHERE s.user_id = $1 AND s.is_completed = true
     ORDER BY s.started_at DESC LIMIT 5`,
    [userId]
  )

  const recentMeals = await pgQuery(
    env,
    `SELECT m.meal_type, f.name as food_name, m.calories_total, m.logged_at
     FROM vfit_user_meals m
     JOIN vfit_foods f ON f.id = m.food_id
     WHERE m.user_id = $1
     ORDER BY m.created_at DESC LIMIT 10`,
    [userId]
  )

  return c.json(success({
    ...profile,
    recent_workouts_data: recentSessions,
    recent_meals_data: recentMeals,
  }))
})

// ============================================
// FOOD IDENTIFY — Vision AI
// ============================================

/**
 * POST /food-identify — Identifica alimento por foto (base64 JPEG/PNG ≤ 1MB)
 *
 * Body: { image_base64: string, mime_type?: 'image/jpeg' | 'image/png' }
 * Returns: { suggestions: Array<{ name: string, confidence: number }>, search_query: string }
 *
 * Sprint 14 — Scanner & Macro Ring
 */
vfit.post('/food-identify', async (c) => {
  const env = c.env
  const body = await c.req.json()

  const schema = z.object({
    image_base64: z.string().min(100).max(1_500_000), // ≤ 1MB base64
    mime_type: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
  })

  const { image_base64 } = schema.parse(body)

  // Prompt direto para identificação de alimentos
  const prompt = `Você é um especialista em nutrição e identificação de alimentos brasileiro.
Analise esta imagem e identifique os alimentos visíveis.
Responda SOMENTE com JSON no formato:
{
  "suggestions": [
    { "name": "Nome do alimento em português", "confidence": 0.95 },
    { "name": "Alternativa provável", "confidence": 0.6 }
  ],
  "search_query": "termo de busca principal no banco TACO"
}
Máximo 3 sugestões. Use nomes de alimentos comuns no Brasil (ex: arroz branco, feijão carioca, peito de frango grelhado).`

  try {
    // Usar Workers AI com llama-3.2-11b-vision se disponível, senão llama-3.1
    let result: string

    if (env.AI) {
      // Workers AI — llama-3.2-11b-vision-instruct suporta imagens
      const response = await (env.AI as {
        run: (model: string, inputs: Record<string, unknown>) => Promise<{ response: string }>
      }).run('@cf/meta/llama-3.2-11b-vision-instruct', {
        prompt,
        image: image_base64,
        max_tokens: 300,
      })
      result = response.response || ''
    } else {
      // Fallback: usar Workers AI texto com descrição da imagem (sem vision)
      const { response: aiResponse } = await callWorkersAIWithFallback(
        env,
        '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        `${prompt}\n\n[Imagem não disponível para análise direta — forneça sugestões genéricas de alimentos comuns no Brasil]`,
        { max_tokens: 300 }
      )
      result = aiResponse
    }

    // Parse da resposta JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return c.json(success({
        suggestions: [],
        search_query: '',
        raw: result,
      }))
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      suggestions: Array<{ name: string; confidence: number }>
      search_query: string
    }

    return c.json(success(parsed))
  } catch (err) {
    throw new BadRequestError(
      `Erro ao identificar alimento: ${err instanceof Error ? err.message : 'unknown'}`
    )
  }
})

// ============================================
// FOOD BARCODE LOOKUP
// ============================================

/**
 * GET /food-barcode/:code — Busca alimento por código de barras EAN
 *
 * Tenta localizar no banco local (vfit_foods.barcode) primeiro,
 * depois tenta Open Food Facts como fallback.
 *
 * Sprint 14 — Scanner & Macro Ring
 */
vfit.get('/food-barcode/:code', async (c) => {
  const env = c.env
  const code = c.req.param('code')

  if (!/^\d{8,14}$/.test(code)) {
    throw new BadRequestError('Código de barras inválido (deve ter 8-14 dígitos)')
  }

  // 1. Buscar no banco local
  const localFood = await pgQueryOne(
    env,
    `SELECT * FROM vfit_foods
      WHERE is_library = true
        AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'vfit_foods' AND column_name = 'barcode'
        )
        AND barcode = $1
      LIMIT 1`,
    [code]
  ).catch(() => null)

  if (localFood) {
    return c.json(success({ source: 'local', food: localFood }))
  }

  // 2. Fallback: Open Food Facts API (gratuita, sem auth)
  try {
    const offRes = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
      { headers: { 'User-Agent': 'VFIT App/1.0 (contact@vfit.app.br)' } }
    )
    if (offRes.ok) {
      const offData = await offRes.json() as {
        status: number
        product?: {
          product_name: string
          nutriments: Record<string, number>
          serving_size?: string
        }
      }

      if (offData.status === 1 && offData.product) {
        const p = offData.product
        const n = p.nutriments
        return c.json(success({
          source: 'openfoodfacts',
          food: {
            name: p.product_name || 'Alimento desconhecido',
            calories: Math.round(n['energy-kcal_100g'] || 0),
            protein_g: Math.round((n['proteins_100g'] || 0) * 10) / 10,
            carbs_g: Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
            fat_g: Math.round((n['fat_100g'] || 0) * 10) / 10,
            fiber_g: Math.round((n['fiber_100g'] || 0) * 10) / 10,
            standard_portion_g: 100,
            category: 'industrializado',
          },
        }))
      }
    }
  } catch {
    // Fallback silencioso
  }

  throw new NotFoundError('Código de barras não encontrado na base de dados')
})

export { vfit as vfitRoutes }
