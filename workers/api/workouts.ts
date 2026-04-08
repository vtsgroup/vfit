/**
 * workers/api/workouts.ts
 *
 * workouts.ts — Treinos, exercícios e templates
 * Features: DB: Neon
 */

// ============================================
// workouts.ts — Treinos, exercícios e templates
// ============================================
//
// O que faz:
//   CRUD completo de treinos do personal: criar, listar, detalhar, editar,
//   remover. Gerencia exercícios dentro do treino (adicionar, reordenar,
//   remover) e atribuição/remoção de alunos. Importação de templates do D1.
//
// Exports principais:
//   workoutsRoutes — Hono app montado em /api/v1/workouts
//
// Auth: requireAuth. Personal gerencia; student vê treinos atribuídos.
// DB: workouts, workout_exercises, workout_assignments, exercises (D1)
// ============================================

import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  addExerciseSchema,
  updateExerciseSchema,
  reorderExercisesSchema,
  completeWorkoutSchema,
  listWorkoutsQuerySchema,
  listLogsQuerySchema,
  cloneTemplateSchema,
  workoutHeatmapQuerySchema,
  workoutProgressQuerySchema,
} from '@workers/schemas/workouts'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created, noContent } from '@lib/response'
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '@lib/errors'
import { notifyNewWorkout } from '@lib/onesignal'
import { creditXP, updateDailyGoalProgress, updateStreakAndCheckMilestones } from '@lib/xp-service'

const workouts = new Hono<AppContext>()

// Todas rotas requerem auth
workouts.use('*', authMiddleware)

// ============================================
// POST /workouts — Criar treino (personal)
// ============================================
workouts.post('/', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const body = await c.req.json()
  const parsed = createWorkoutSchema.parse(body)

  // Se is_template, não precisa de student_id
  if (!parsed.is_template && !parsed.student_id) {
    throw new BadRequestError('student_id é obrigatório para treinos de aluno')
  }

  // Verificar ownership do student (apenas se não é template)
  if (parsed.student_id && !parsed.is_template) {
    await ensureStudentBelongsToPersonal(c.env, parsed.student_id, personalId)
  }

  const workoutId = generateId()
  const now = new Date().toISOString()

  // Inserir workout
  await pgQuery(c.env, `
    INSERT INTO workouts (id, student_id, personal_id, template_id, name, description, status, start_date, end_date, notes, is_template, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, $9, $10, $11, $11)
  `, [
    workoutId,
    parsed.student_id || null,
    personalId,
    parsed.template_id || null,
    parsed.name,
    parsed.description || null,
    parsed.start_date,
    parsed.end_date || null,
    parsed.notes || null,
    parsed.is_template || false,
    now,
  ])

  // Inserir exercises (se fornecidos)
  if (parsed.exercises.length > 0) {
    for (const ex of parsed.exercises) {
      const exId = generateId()
      await pgQuery(c.env, `
        INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, rest_seconds, load, order_index, notes, technique_tips, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        exId,
        workoutId,
        ex.exercise_id,
        ex.sets,
        ex.reps,
        ex.rest_seconds,
        ex.load || null,
        ex.order_index,
        ex.notes || null,
        ex.technique_tips || null,
        now,
      ])
    }
  }

  // Notificar aluno via push + in-app (apenas para treinos de aluno, não templates)
  if (parsed.student_id && !parsed.is_template) {
    await notifyNewWorkout(c.env, parsed.student_id, parsed.name).catch(() => {})
  }

  // Retornar workout completo
  const workout = await findWorkoutWithExercises(c.env, workoutId)

  return created(workout)
})

// ============================================
// GET /workouts — Listar treinos (personal)
// ============================================
workouts.get('/', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)

  const query = listWorkoutsQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    student_id: url.searchParams.get('student_id') || undefined,
    status: url.searchParams.get('status') || undefined,
    search: url.searchParams.get('search') || undefined,
    sort: url.searchParams.get('sort') || undefined,
    order: url.searchParams.get('order') || undefined,
  })

  const offset = (query.page - 1) * query.per_page
  const conditions: string[] = ['w.personal_id = $1']
  const params: unknown[] = [personalId]
  let idx = 2

  if (query.student_id) {
    conditions.push(`w.student_id = $${idx}`)
    params.push(query.student_id)
    idx++
  }

  if (query.status) {
    conditions.push(`w.status = $${idx}`)
    params.push(query.status)
    idx++
  }

  // Filtro de templates
  if (query.is_template === true) {
    conditions.push('w.is_template = true')
  } else if (query.is_template === false) {
    conditions.push('(w.is_template = false OR w.is_template IS NULL)')
  }
  // Se não especificado, retorna todos

  if (query.search) {
    conditions.push(`(w.name ILIKE $${idx} OR w.description ILIKE $${idx})`)
    params.push(`%${query.search}%`)
    idx++
  }

  const where = conditions.join(' AND ')
  const sortMap: Record<string, string> = {
    created_at: 'w.created_at',
    start_date: 'w.start_date',
    name: 'w.name',
    status: 'w.status',
  }
  const sortField = sortMap[query.sort] || 'w.created_at'
  const sortOrder = query.order === 'asc' ? 'ASC' : 'DESC'

  // Count
  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM workouts w WHERE ${where}`,
    params
  )
  const total = countRows[0]?.count ?? 0

  // Fetch with student name (LEFT JOIN — student_id pode ser null para templates)
  const { rows } = await pgQuery<WorkoutListRow>(
    c.env,
    `SELECT w.id, w.name, w.description, w.status, w.start_date, w.end_date,
            w.ai_generated, w.is_template, w.created_at,
            u.full_name as student_name,
            (SELECT COUNT(*)::int FROM workout_exercises we WHERE we.workout_id = w.id) as exercise_count
     FROM workouts w
     LEFT JOIN users u ON u.id = w.student_id
     WHERE ${where}
     ORDER BY ${sortField} ${sortOrder} NULLS LAST
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, query.per_page, offset]
  )

  return success({
    workouts: rows,
    meta: {
      page: query.page,
      per_page: query.per_page,
      total,
      total_pages: Math.ceil(total / query.per_page),
    },
  })
})

// ============================================
// GET /workouts/templates — Meus treinos-modelo (marketplace)
// ============================================
workouts.get('/templates', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage
  const search = url.searchParams.get('search') || ''

  const conditions: string[] = ['w.personal_id = $1', 'w.is_template = true']
  const params: unknown[] = [personalId]
  let idx = 2

  if (search) {
    conditions.push(`(w.name ILIKE $${idx} OR w.description ILIKE $${idx})`)
    params.push(`%${search}%`)
    idx++
  }

  const where = conditions.join(' AND ')

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM workouts w WHERE ${where}`,
    params
  )

  const { rows } = await pgQuery<WorkoutListRow>(
    c.env,
    `SELECT w.id, w.name, w.description, w.status, w.start_date, w.end_date,
            w.ai_generated, w.is_template, w.created_at,
            (SELECT COUNT(*)::int FROM workout_exercises we WHERE we.workout_id = w.id) as exercise_count
     FROM workouts w
     WHERE ${where}
     ORDER BY w.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, perPage, offset]
  )

  return success({
    workouts: rows,
    meta: {
      page,
      per_page: perPage,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// GET /workouts/my — Treinos do aluno (student)
// ============================================
workouts.get('/my', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const url = new URL(c.req.url)

  const status = url.searchParams.get('status') || undefined
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage

  const conditions: string[] = ['w.student_id = $1']
  const params: unknown[] = [studentId]
  let idx = 2

  if (status) {
    conditions.push(`w.status = $${idx}`)
    params.push(status)
    idx++
  }

  const where = conditions.join(' AND ')

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM workouts w WHERE ${where}`,
    params
  )

  const { rows } = await pgQuery<WorkoutListRow>(
    c.env,
    `SELECT w.id, w.name, w.description, w.status, w.start_date, w.end_date,
            w.ai_generated, w.notes, w.created_at,
            pu.full_name as personal_name,
            (SELECT COUNT(*)::int FROM workout_exercises we WHERE we.workout_id = w.id) as exercise_count,
            (SELECT COUNT(*)::int FROM workout_logs wl WHERE wl.workout_id = w.id AND wl.student_id = w.student_id) as times_completed
     FROM workouts w
     LEFT JOIN users pu ON pu.id = w.personal_id
     WHERE ${where}
     ORDER BY w.start_date DESC NULLS LAST
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, perPage, offset]
  )

  return success({
    workouts: rows,
    meta: {
      page,
      per_page: perPage,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// GET /workouts/history/heatmap — Heatmap anual de treinos (student)
// ============================================
workouts.get('/history/heatmap', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const url = new URL(c.req.url)
  const query = workoutHeatmapQuerySchema.parse({
    year: url.searchParams.get('year') || undefined,
  })

  const start = `${query.year}-01-01T00:00:00.000Z`
  const end = `${query.year + 1}-01-01T00:00:00.000Z`

  const { rows } = await pgQuery<HeatmapRow>(
    c.env,
    `SELECT DATE(completed_at)::text as date, COUNT(*)::int as count
     FROM workout_logs
     WHERE student_id = $1
       AND completed_at >= $2
       AND completed_at < $3
     GROUP BY DATE(completed_at)
     ORDER BY DATE(completed_at) ASC`,
    [studentId, start, end]
  )

  const maxCount = rows.reduce((max, row) => Math.max(max, row.count), 0)
  const days = rows.map((row) => ({
    date: row.date,
    count: row.count,
    intensity: normalizeIntensity(row.count, maxCount),
  }))

  const monthMap = new Map<string, { month: string; days_trained: number; total_workouts: number }>()
  for (const row of rows) {
    const month = row.date.slice(0, 7)
    const current = monthMap.get(month) ?? { month, days_trained: 0, total_workouts: 0 }
    current.days_trained += 1
    current.total_workouts += row.count
    monthMap.set(month, current)
  }

  const months = Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month))

  return success({
    year: query.year,
    total_days_trained: rows.length,
    total_workouts: rows.reduce((sum, row) => sum + row.count, 0),
    max_day_count: maxCount,
    days,
    months,
  })
})

// ============================================
// GET /workouts/history/progress — Evolução de carga por exercício (student)
// ============================================
workouts.get('/history/progress', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const url = new URL(c.req.url)
  const query = workoutProgressQuerySchema.parse({
    exercise_id: url.searchParams.get('exercise_id') || undefined,
    days: url.searchParams.get('days') || undefined,
  })

  const fromDate = new Date()
  fromDate.setUTCDate(fromDate.getUTCDate() - (query.days - 1))
  const start = fromDate.toISOString()

  const { rows } = await pgQuery<ProgressLogRow>(
    c.env,
    `SELECT id, workout_id, completed_at, exercises_completed
     FROM workout_logs
     WHERE student_id = $1
       AND completed_at >= $2
     ORDER BY completed_at ASC`,
    [studentId, start]
  )

  const pointsByDate = new Map<string, { date: string; load: number; reps_done?: string | null; sets_done?: number | null }>()
  let sessionsTracked = 0

  for (const row of rows) {
    const completedExercises = parseCompletedExercises(row.exercises_completed)
    for (const ex of completedExercises) {
      if (ex.exercise_id !== query.exercise_id) continue
      const load = parseNumericLoad(ex.load_used)
      if (load == null) continue
      sessionsTracked += 1

      const date = new Date(row.completed_at).toISOString().split('T')[0]
      const existing = pointsByDate.get(date)

      if (!existing || load >= existing.load) {
        pointsByDate.set(date, {
          date,
          load,
          reps_done: ex.reps_done ?? null,
          sets_done: ex.sets_done ?? null,
        })
      }
    }
  }

  const points = Array.from(pointsByDate.values()).sort((a, b) => a.date.localeCompare(b.date))
  const loads = points.map((point) => point.load)

  const exerciseNameResult = await c.env.DB
    .prepare('SELECT COALESCE(name_pt, name) as name FROM exercises WHERE id = ? LIMIT 1')
    .bind(query.exercise_id)
    .first<{ name?: string }>()
    .catch(() => null)

  return success({
    exercise_id: query.exercise_id,
    exercise_name: exerciseNameResult?.name || query.exercise_id,
    days: query.days,
    points,
    summary: {
      sessions_tracked: sessionsTracked,
      unique_days: points.length,
      current_load: points.length > 0 ? points[points.length - 1].load : null,
      max_load: loads.length > 0 ? Math.max(...loads) : null,
      min_load: loads.length > 0 ? Math.min(...loads) : null,
    },
  })
})

// ============================================
// GET /workouts/logs — Histórico de logs
// ============================================
workouts.get('/logs', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const url = new URL(c.req.url)

  const query = listLogsQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    student_id: url.searchParams.get('student_id') || undefined,
    workout_id: url.searchParams.get('workout_id') || undefined,
    feeling: url.searchParams.get('feeling') || undefined,
  })

  const offset = (query.page - 1) * query.per_page
  const conditions: string[] = []
  const params: unknown[] = []
  let idx = 1

  // Filtro por tipo de user
  if (userType === 'student') {
    conditions.push(`wl.student_id = $${idx}`)
    params.push(userId)
    idx++
  } else {
    // Personal: só logs dos seus alunos
    conditions.push(`w.personal_id = $${idx}`)
    params.push(userId)
    idx++

    if (query.student_id) {
      conditions.push(`wl.student_id = $${idx}`)
      params.push(query.student_id)
      idx++
    }
  }

  if (query.workout_id) {
    conditions.push(`wl.workout_id = $${idx}`)
    params.push(query.workout_id)
    idx++
  }

  if (query.feeling) {
    conditions.push(`wl.feeling = $${idx}`)
    params.push(query.feeling)
    idx++
  }

  const where = conditions.length > 0 ? conditions.join(' AND ') : '1=1'

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count
     FROM workout_logs wl
     JOIN workouts w ON w.id = wl.workout_id
     WHERE ${where}`,
    params
  )

  const { rows } = await pgQuery<WorkoutLogRow>(
    c.env,
    `SELECT wl.id, wl.workout_id, wl.student_id, wl.completed_at, wl.duration_minutes,
            wl.exercises_completed, wl.student_notes, wl.feeling, wl.created_at,
            w.name as workout_name,
            u.full_name as student_name
     FROM workout_logs wl
     JOIN workouts w ON w.id = wl.workout_id
     JOIN users u ON u.id = wl.student_id
     WHERE ${where}
     ORDER BY wl.completed_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, query.per_page, offset]
  )

  return success({
    logs: rows,
    meta: {
      page: query.page,
      per_page: query.per_page,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / query.per_page),
    },
  })
})

// ============================================
// GET /workouts/logs/:id — Detalhe de um log
// ============================================
workouts.get('/logs/:id', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const logId = c.req.param('id')

  const { rows } = await pgQuery<WorkoutLogRow>(
    c.env,
    `SELECT wl.*, w.name as workout_name, w.personal_id, u.full_name as student_name
     FROM workout_logs wl
     JOIN workouts w ON w.id = wl.workout_id
     JOIN users u ON u.id = wl.student_id
     WHERE wl.id = $1 LIMIT 1`,
    [logId]
  )

  if (rows.length === 0) {
    throw new NotFoundError('Log de treino')
  }

  const log = rows[0]

  // Verificar acesso
  if (userType === 'student' && log.student_id !== userId) {
    throw new ForbiddenError('Sem permissão para ver este log')
  }
  if (userType === 'personal' && (log as WorkoutLogRow & { personal_id?: string }).personal_id !== userId) {
    throw new ForbiddenError('Sem permissão para ver este log')
  }

  return success({ log })
})

// ============================================
// POST /workouts/clone-template — Criar a partir de template D1
// ============================================
workouts.post('/clone-template', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const body = await c.req.json()
  const parsed = cloneTemplateSchema.parse(body)

  // Verificar ownership do student
  await ensureStudentBelongsToPersonal(c.env, parsed.student_id, personalId)

  // Buscar template no D1
  const template = await c.env.DB
    .prepare('SELECT * FROM workout_templates WHERE id = ?')
    .bind(parsed.template_id)
    .first<{ id: string; name_pt: string; template_data: string }>()

  if (!template) {
    throw new NotFoundError('Template')
  }

  const workoutId = generateId()
  const now = new Date().toISOString()
  const workoutName = parsed.name || template.name_pt

  // Criar workout
  await pgQuery(c.env, `
    INSERT INTO workouts (id, student_id, personal_id, template_id, name, status, start_date, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, $7)
  `, [workoutId, parsed.student_id, personalId, template.id, workoutName, parsed.start_date, now])

  // Parsear template_data e inserir exercícios
  try {
    const templateData = JSON.parse(template.template_data)
    if (Array.isArray(templateData)) {
      for (let i = 0; i < templateData.length; i++) {
        const ex = templateData[i]
        await pgQuery(c.env, `
          INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, rest_seconds, load, order_index, notes, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          generateId(),
          workoutId,
          ex.exercise_id || '',
          ex.sets || 3,
          ex.reps || '12',
          ex.rest_seconds || 60,
          ex.load || null,
          i,
          ex.notes || null,
          now,
        ])
      }
    }
  } catch {
    // Template data malformado — segue sem exercícios
    console.error('[Workouts] Failed to parse template_data for:', template.id)
  }

  const workout = await findWorkoutWithExercises(c.env, workoutId)

  return created(workout)
})

// ============================================
// POST /workouts/import — Importar treino (JSON)
// NOTA: deve ficar ANTES das rotas /:id para não conflitar
// ============================================
workouts.post('/import', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const body = await c.req.json()

  // Validar formato
  if (!body.workout || !body.workout.name) {
    throw new BadRequestError('Formato inválido: campo workout.name é obrigatório')
  }

  const { workout: importedWorkout } = body
  const studentId = body.student_id || null // Opcional: associar a um aluno

  // Se student_id fornecido, verificar ownership
  if (studentId) {
    await ensureStudentBelongsToPersonal(c.env, studentId, personalId)
  }

  const importWorkoutId = generateId()
  const now = new Date().toISOString()

  // Inserir workout
  await pgQuery(c.env, `
    INSERT INTO workouts (id, student_id, personal_id, name, description, status, start_date, notes, is_template, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, $8, $6, $6)
  `, [
    importWorkoutId,
    studentId,
    personalId,
    importedWorkout.name,
    importedWorkout.description || null,
    now,
    importedWorkout.notes || null,
    importedWorkout.is_template || false,
  ])

  // Inserir exercícios
  const exercises = importedWorkout.exercises || []
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i]
    await pgQuery(c.env, `
      INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, rest_seconds, load, notes, technique_tips, order_index, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      generateId(),
      importWorkoutId,
      ex.exercise_id || `imported_${i + 1}`,
      ex.sets || 3,
      ex.reps || '12',
      ex.rest_seconds || 60,
      ex.load || null,
      ex.notes || null,
      ex.technique_tips || null,
      ex.order_index ?? i,
      now,
    ])
  }

  // Retornar treino completo
  const importedResult = await findWorkoutWithExercises(c.env, importWorkoutId)

  return created(importedResult)
})

// ============================================
// GET /workouts/:id — Detalhes de um treino
// ============================================
workouts.get('/:id', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const workoutId = c.req.param('id')

  const workout = await findWorkoutWithExercises(c.env, workoutId)
  if (!workout) {
    throw new NotFoundError('Treino')
  }

  // Verificar acesso
  if (userType === 'personal' && workout.personal_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }
  if (userType === 'student' && workout.student_id && workout.student_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }

  // Buscar logs deste workout
  const { rows: logs } = await pgQuery<WorkoutLogRow>(
    c.env,
    `SELECT id, completed_at, duration_minutes, feeling, student_notes
     FROM workout_logs
     WHERE workout_id = $1
     ORDER BY completed_at DESC LIMIT 10`,
    [workoutId]
  )

  return success({ workout, logs })
})

// ============================================
// PATCH /workouts/:id — Atualizar treino (personal)
// ============================================
workouts.patch('/:id', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')
  const body = await c.req.json()
  const parsed = updateWorkoutSchema.parse(body)

  await ensureWorkoutOwnership(c.env, workoutId, personalId)

  const fields = Object.entries(parsed).filter(([, v]) => v !== undefined)
  if (fields.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  const setClauses: string[] = []
  const params: unknown[] = []
  let idx = 1

  for (const [key, value] of fields) {
    setClauses.push(`${key} = $${idx}`)
    params.push(value)
    idx++
  }

  setClauses.push(`updated_at = $${idx}`)
  params.push(new Date().toISOString())
  idx++

  params.push(workoutId)

  await pgQuery(c.env, `
    UPDATE workouts SET ${setClauses.join(', ')} WHERE id = $${idx}
  `, params)

  return success({ message: 'Treino atualizado' })
})

// ============================================
// DELETE /workouts/:id — Excluir treino permanentemente (personal)
// ============================================
workouts.delete('/:id', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')

  await ensureWorkoutOwnership(c.env, workoutId, personalId)

  // Hard delete: remove exercises, logs, then workout
  await pgQuery(c.env, `DELETE FROM workout_exercises WHERE workout_id = $1`, [workoutId])
  await pgQuery(c.env, `DELETE FROM workout_logs WHERE workout_id = $1`, [workoutId])
  await pgQuery(c.env, `DELETE FROM workouts WHERE id = $1`, [workoutId])

  return noContent()
})

// ============================================
// POST /workouts/:id/duplicate — Duplicar treino (opcionalmente para outro aluno)
// ============================================
workouts.post('/:id/duplicate', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')

  // Optional: assign to a different student
  let targetStudentId: string | null = null
  let targetStartDate: string | null = null
  let targetEndDate: string | null = null
  try {
    const body = await c.req.json()
    targetStudentId = body?.student_id || null
    targetStartDate = body?.start_date || null
    targetEndDate = body?.end_date || null
  } catch { /* no body = simple duplicate */ }

  const original = await findWorkoutWithExercises(c.env, workoutId)
  if (!original || original.personal_id !== personalId) {
    throw new NotFoundError('Treino')
  }

  const newId = generateId()
  const now = new Date().toISOString()

  // Duplicar workout — use target student or keep original
  const studentId = targetStudentId || original.student_id || null
  const startDate = targetStartDate || original.start_date
  const endDate = targetEndDate || original.end_date || null
  const suffix = targetStudentId ? '' : ' (cópia)'

  await pgQuery(c.env, `
    INSERT INTO workouts (id, student_id, personal_id, template_id, name, description, status, start_date, end_date, notes, is_template, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, $9, $10, $11, $11)
  `, [
    newId,
    studentId,
    personalId,
    original.template_id || null,
    `${original.name}${suffix}`,
    original.description || null,
    startDate,
    endDate,
    original.notes || null,
    false, // assigned workout is never a template
    now,
  ])

  // Duplicar exercises
  if (original.exercises && original.exercises.length > 0) {
    for (const ex of original.exercises) {
      await pgQuery(c.env, `
        INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, rest_seconds, load, order_index, notes, technique_tips, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        generateId(), newId, ex.exercise_id, ex.sets, ex.reps,
        ex.rest_seconds, ex.load, ex.order_index, ex.notes, ex.technique_tips, now,
      ])
    }
  }

  const duplicated = await findWorkoutWithExercises(c.env, newId)

  return created(duplicated)
})

// ============================================
// POST /workouts/:id/exercises — Adicionar exercício
// ============================================
workouts.post('/:id/exercises', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')
  const body = await c.req.json()
  const parsed = addExerciseSchema.parse(body)

  await ensureWorkoutOwnership(c.env, workoutId, personalId)

  const exId = generateId()
  const now = new Date().toISOString()

  await pgQuery(c.env, `
    INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, rest_seconds, load, order_index, notes, technique_tips, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [
    exId, workoutId, parsed.exercise_id, parsed.sets, parsed.reps,
    parsed.rest_seconds, parsed.load || null, parsed.order_index,
    parsed.notes || null, parsed.technique_tips || null, now,
  ])

  // Atualizar updated_at do workout
  await pgQuery(c.env, `UPDATE workouts SET updated_at = $1 WHERE id = $2`, [now, workoutId])

  return created({
    id: exId,
    workout_id: workoutId,
    ...parsed,
  })
})

// ============================================
// PATCH /workouts/:id/exercises/:eid — Atualizar exercício
// ============================================
workouts.patch('/:id/exercises/:eid', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')
  const exerciseId = c.req.param('eid')
  const body = await c.req.json()
  const parsed = updateExerciseSchema.parse(body)

  await ensureWorkoutOwnership(c.env, workoutId, personalId)

  const fields = Object.entries(parsed).filter(([, v]) => v !== undefined)
  if (fields.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  const setClauses: string[] = []
  const params: unknown[] = []
  let idx = 1

  for (const [key, value] of fields) {
    setClauses.push(`${key} = $${idx}`)
    params.push(value)
    idx++
  }

  params.push(exerciseId, workoutId)

  await pgQuery(c.env, `
    UPDATE workout_exercises SET ${setClauses.join(', ')} WHERE id = $${idx} AND workout_id = $${idx + 1}
  `, params)

  const now = new Date().toISOString()
  await pgQuery(c.env, `UPDATE workouts SET updated_at = $1 WHERE id = $2`, [now, workoutId])

  return success({ message: 'Exercício atualizado' })
})

// ============================================
// DELETE /workouts/:id/exercises/:eid
// ============================================
workouts.delete('/:id/exercises/:eid', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')
  const exerciseId = c.req.param('eid')

  await ensureWorkoutOwnership(c.env, workoutId, personalId)

  await pgQuery(c.env, `
    DELETE FROM workout_exercises WHERE id = $1 AND workout_id = $2
  `, [exerciseId, workoutId])

  const now = new Date().toISOString()
  await pgQuery(c.env, `UPDATE workouts SET updated_at = $1 WHERE id = $2`, [now, workoutId])

  return noContent()
})

// ============================================
// PUT /workouts/:id/exercises/reorder
// ============================================
workouts.put('/:id/exercises/reorder', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')
  const body = await c.req.json()
  const parsed = reorderExercisesSchema.parse(body)

  await ensureWorkoutOwnership(c.env, workoutId, personalId)

  for (const item of parsed.exercises) {
    await pgQuery(c.env, `
      UPDATE workout_exercises SET order_index = $1 WHERE id = $2 AND workout_id = $3
    `, [item.order_index, item.id, workoutId])
  }

  const now = new Date().toISOString()
  await pgQuery(c.env, `UPDATE workouts SET updated_at = $1 WHERE id = $2`, [now, workoutId])

  return success({ message: 'Exercícios reordenados' })
})

// ============================================
// POST /workouts/:id/complete — Registrar conclusão (student)
// ============================================
workouts.post('/:id/complete', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const workoutId = c.req.param('id')
  const body = await c.req.json()
  const parsed = completeWorkoutSchema.parse(body)

  // Verificar que o workout pertence ao aluno
  const { rows } = await pgQuery<{ id: string; student_id: string }>(
    c.env,
    'SELECT id, student_id FROM workouts WHERE id = $1 AND student_id = $2 LIMIT 1',
    [workoutId, studentId]
  )
  if (rows.length === 0) {
    throw new NotFoundError('Treino')
  }

  const logId = generateId()
  const now = new Date().toISOString()
  const today = now.split('T')[0]

  // Inserir log
  await pgQuery(c.env, `
    INSERT INTO workout_logs (id, workout_id, student_id, completed_at, duration_minutes, exercises_completed, student_notes, feeling, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    logId,
    workoutId,
    studentId,
    now,
    parsed.duration_minutes || null,
    JSON.stringify(parsed.exercises_completed),
    parsed.student_notes || null,
    parsed.feeling || null,
    now,
  ])

  // Get current student stats
  const { rows: studentRows } = await pgQuery<{
    total_workouts_completed: number; current_streak: number; longest_streak: number
  }>(c.env, 'SELECT total_workouts_completed, current_streak, longest_streak FROM students WHERE id = $1', [studentId])

  const student = studentRows[0] || { total_workouts_completed: 0, current_streak: 0, longest_streak: 0 }

  // Check last workout log date (excluding the one just created) for proper streak
  const { rows: lastLogRows } = await pgQuery<{ completed_at: string }>(
    c.env,
    'SELECT completed_at FROM workout_logs WHERE student_id = $1 AND id != $2 ORDER BY completed_at DESC LIMIT 1',
    [studentId, logId]
  )

  const lastLogDate = lastLogRows[0]?.completed_at
    ? new Date(lastLogRows[0].completed_at).toISOString().split('T')[0]
    : null

  // Calculate streak properly
  let newStreak: number
  if (lastLogDate === today) {
    // Already trained today — keep current streak
    newStreak = student.current_streak
  } else {
    const yesterday = new Date(new Date(today + 'T00:00:00Z').getTime() - 86400000)
      .toISOString().split('T')[0]
    if (lastLogDate === yesterday) {
      newStreak = student.current_streak + 1
    } else if (!lastLogDate) {
      newStreak = 1 // first workout ever
    } else {
      newStreak = 1 // streak broken
    }
  }

  const newTotal = student.total_workouts_completed + 1
  const newLongest = Math.max(student.longest_streak, newStreak)

  // Update student stats with corrected values
  await pgQuery(c.env, `
    UPDATE students
    SET total_workouts_completed = $1,
        current_streak = $2,
        longest_streak = $3,
        updated_at = $4
    WHERE id = $5
  `, [newTotal, newStreak, newLongest, now, studentId])

  // Check and award badges — returns newly awarded ones
  const newBadges = await checkAndAwardBadges(c.env, studentId, newTotal, newStreak)

  // Credit XP for workout completion (idempotency key = workout_log_id)
  const xpResult = await creditXP(c.env, studentId, 'workout_completed', {
    referenceType: 'workout_log',
    referenceId: logId,
    idempotencyKey: `workout_log:${logId}:completed`,
    notes: `Treino concluído: ${parsed.duration_minutes} minutos`,
    metadata: {
      workout_id: workoutId,
      duration_minutes: parsed.duration_minutes,
      streak_bonus: newStreak >= 7 ? 'level_2' : newStreak >= 3 ? 'level_1' : 'none',
    },
  })

  const xpEarned = xpResult.transaction.amount

  // Update daily goal progress (best-effort)
  let dailyGoal = null
  let goalJustCompleted = false
  try {
    const goalResult = await updateDailyGoalProgress(c.env, studentId, xpEarned, true)
    dailyGoal = goalResult.goal
    goalJustCompleted = goalResult.justCompleted
  } catch { /* non-blocking */ }

  // Check streak milestones and award bonus XP (best-effort)
  let streakMilestones: Array<{ days: number; xpAwarded: number }> = []
  try {
    const streakResult = await updateStreakAndCheckMilestones(c.env, studentId)
    streakMilestones = streakResult.newMilestones
  } catch { /* non-blocking */ }

  return created({
    log_id: logId,
    workout_id: workoutId,
    completed_at: now,
    duration_minutes: parsed.duration_minutes,
    feeling: parsed.feeling,
    stats: {
      total_workouts: newTotal,
      current_streak: newStreak,
      longest_streak: newLongest,
      xp_earned: xpEarned,
      xp_balance: xpResult.balanceAfter,
    },
    new_badges: newBadges,
    daily_goal: dailyGoal ? {
      target_xp: dailyGoal.target_xp,
      earned_xp: dailyGoal.earned_xp,
      completed: dailyGoal.completed,
      just_completed: goalJustCompleted,
    } : null,
    streak_milestones: streakMilestones,
  })
})

// ============================================
// HELPERS
// ============================================

async function ensureStudentBelongsToPersonal(
  env: Bindings,
  studentId: string,
  personalId: string
): Promise<void> {
  const { rows } = await pgQuery<{ id: string }>(
    env,
    'SELECT id FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
    [studentId, personalId]
  )
  if (rows.length === 0) {
    throw new ForbiddenError('Aluno não pertence ao seu perfil')
  }
}

async function ensureWorkoutOwnership(
  env: Bindings,
  workoutId: string,
  personalId: string
): Promise<void> {
  const { rows } = await pgQuery<{ id: string }>(
    env,
    'SELECT id FROM workouts WHERE id = $1 AND personal_id = $2 LIMIT 1',
    [workoutId, personalId]
  )
  if (rows.length === 0) {
    throw new NotFoundError('Treino')
  }
}

interface WorkoutWithExercises {
  id: string
  student_id: string | null
  personal_id: string
  template_id: string | null
  name: string
  description: string | null
  status: string
  start_date: string
  end_date: string | null
  ai_generated: boolean
  ai_model_used: string | null
  is_template: boolean
  notes: string | null
  created_at: string
  updated_at: string
  student_name?: string | null
  exercises: ExerciseRow[]
}

interface ExerciseRow {
  id: string
  workout_id: string
  exercise_id: string
  sets: number
  reps: string
  rest_seconds: number
  load: string | null
  order_index: number
  notes: string | null
  technique_tips: string | null
}

interface WorkoutListRow {
  id: string
  name: string
  description: string | null
  status: string
  start_date: string
  end_date: string | null
  ai_generated: boolean
  is_template: boolean
  created_at: string
  student_name?: string | null
  personal_name?: string
  exercise_count: number
  times_completed?: number
}

interface WorkoutLogRow {
  id: string
  workout_id: string
  student_id: string
  completed_at: string
  duration_minutes: number | null
  exercises_completed: unknown
  student_notes: string | null
  feeling: string | null
  created_at: string
  workout_name?: string
  student_name?: string
  personal_id?: string
}

interface HeatmapRow {
  date: string
  count: number
}

interface ProgressLogRow {
  id: string
  workout_id: string
  completed_at: string
  exercises_completed: unknown
}

interface CompletedExerciseLog {
  exercise_id?: string
  sets_done?: number
  reps_done?: string
  load_used?: string
}

async function findWorkoutWithExercises(
  env: Bindings,
  workoutId: string
): Promise<WorkoutWithExercises | null> {
  const { rows: workoutRows } = await pgQuery<WorkoutWithExercises & { student_name: string }>(
    env,
    `SELECT w.*, u.full_name as student_name
     FROM workouts w
     LEFT JOIN users u ON u.id = w.student_id
     WHERE w.id = $1 LIMIT 1`,
    [workoutId]
  )

  if (workoutRows.length === 0) return null

  const workout = workoutRows[0]

  const { rows: exercises } = await pgQuery<ExerciseRow>(
    env,
    'SELECT * FROM workout_exercises WHERE workout_id = $1 ORDER BY order_index ASC',
    [workoutId]
  )

  return {
    ...workout,
    exercises,
  }
}

function normalizeIntensity(count: number, maxCount: number): number {
  if (count <= 0 || maxCount <= 0) return 0
  const bucket = Math.ceil((count / maxCount) * 4)
  return Math.min(4, Math.max(1, bucket))
}

function parseCompletedExercises(payload: unknown): CompletedExerciseLog[] {
  if (!payload) return []

  const data = typeof payload === 'string'
    ? safeJsonParse(payload)
    : payload

  if (!Array.isArray(data)) return []
  return data.filter((item): item is CompletedExerciseLog => typeof item === 'object' && item !== null)
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function parseNumericLoad(load: unknown): number | null {
  if (typeof load !== 'string') return null
  const cleaned = load.trim().replace(',', '.')
  const match = cleaned.match(/\d+(\.\d+)?/)
  if (!match) return null
  const numeric = Number(match[0])
  return Number.isFinite(numeric) ? numeric : null
}

/**
 * Check and award badges — returns array of newly awarded badges
 */
async function checkAndAwardBadges(
  env: Bindings,
  studentId: string,
  totalWorkouts: number,
  currentStreak: number
): Promise<Array<{ type: string; name: string; icon: string }>> {
  const now = new Date().toISOString()
  const newBadges: Array<{ type: string; name: string; icon: string }> = []

  const badgeChecks = [
    { condition: totalWorkouts === 1, type: 'first_workout', name: 'Primeiro Treino!', icon: '🎉', desc: 'Completou o primeiro treino' },
    { condition: totalWorkouts === 10, type: 'workouts_10', name: 'Primeiro Passo', icon: '👟', desc: 'Completou 10 treinos' },
    { condition: totalWorkouts === 50, type: 'workouts_50', name: 'Dedicação', icon: '⚡', desc: 'Completou 50 treinos' },
    { condition: totalWorkouts === 100, type: 'workouts_100', name: 'Veterano', icon: '🎖️', desc: 'Completou 100 treinos' },
    { condition: currentStreak === 7, type: 'streak_7', name: 'Consistência Iniciante', icon: '🔥', desc: '7 dias consecutivos de treino' },
    { condition: currentStreak === 30, type: 'streak_30', name: 'Disciplina de Ferro', icon: '💪', desc: '30 dias consecutivos de treino' },
    { condition: currentStreak === 100, type: 'streak_100', name: 'Imparável', icon: '🏆', desc: '100 dias consecutivos' },
  ]

  for (const check of badgeChecks) {
    if (check.condition) {
      const awarded = await awardBadge(env, studentId, check.type, check.name, check.desc, now)
      if (awarded) {
        newBadges.push({ type: check.type, name: check.name, icon: check.icon })
      }
    }
  }

  return newBadges
}

async function awardBadge(
  env: Bindings,
  studentId: string,
  badgeType: string,
  badgeName: string,
  badgeDescription: string,
  now: string
): Promise<boolean> {
  // Verifica se já tem a badge
  const { rows } = await pgQuery<{ id: string }>(
    env,
    'SELECT id FROM student_badges WHERE student_id = $1 AND badge_type = $2 LIMIT 1',
    [studentId, badgeType]
  )

  if (rows.length > 0) return false // Já possui

  await pgQuery(env, `
    INSERT INTO student_badges (id, student_id, badge_type, badge_name, badge_description, earned_at)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [generateId(), studentId, badgeType, badgeName, badgeDescription, now])

  // Incrementar contador
  await pgQuery(env, `
    UPDATE students SET total_badges = total_badges + 1, updated_at = $1 WHERE id = $2
  `, [now, studentId])

  return true
}

// ============================================
// GET /workouts/:id/export — Exportar treino (JSON)
// ============================================
workouts.get('/:id/export', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')

  const workout = await findWorkoutWithExercises(c.env, workoutId)
  if (!workout || workout.personal_id !== personalId) {
    throw new NotFoundError('Treino')
  }

  // Formato portátil (sem IDs internos, sem personal/student refs)
  const exportData = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    source: 'VFIT',
    workout: {
      name: workout.name,
      description: workout.description || null,
      notes: workout.notes || null,
      is_template: workout.is_template,
      exercises: [...workout.exercises]
        .sort((a: ExerciseRow, b: ExerciseRow) => a.order_index - b.order_index)
        .map((ex: ExerciseRow) => ({
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          load: ex.load || null,
          notes: ex.notes || null,
          technique_tips: ex.technique_tips || null,
          order_index: ex.order_index,
        })),
    },
  }

  return new Response(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="treino-${workout.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.json"`,
    },
  })
})

// ============================================
// B2C ENDPOINTS — Treino Ativo
// ============================================

// POST /b2c/complete — Salvar treino B2C completo
workouts.post('/b2c/complete', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{
    plan_id: string
    plan_day_id: string
    day_number: number
    started_at: string
    duration_seconds: number
    exercises: Array<{
      exercise_id: string
      exercise_name: string
      muscle_group: string | null
      skipped: boolean
      sets: Array<{
        reps: number
        weight_kg: number
        is_warmup: boolean
        completed: boolean
      }>
    }>
  }>()

  if (!body.plan_id || !body.exercises?.length) {
    throw new BadRequestError('Dados do treino incompletos')
  }

  const workoutId = generateId()
  const totalSets = body.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0
  )
  const totalReps = body.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).reduce((sr, s) => sr + s.reps, 0), 0
  )
  const totalVolume = body.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).reduce((sv, s) => sv + s.reps * s.weight_kg, 0), 0
  )
  const estimatedCalories = Math.round(totalSets * 5 + (body.duration_seconds / 60) * 3)

  await pgQuery(
    c.env,
    `INSERT INTO workout_sessions (id, user_id, plan_id, plan_day_id,
       started_at, duration_seconds, total_sets, total_reps, total_volume_kg, calories_estimated, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'completed')`,
    [
      workoutId, userId, body.plan_id, body.plan_day_id,
      body.started_at, body.duration_seconds, totalSets, totalReps,
      Math.round(totalVolume * 100) / 100, estimatedCalories,
    ]
  )

  // Save exercise logs + check records
  const records: Array<{ exercise_name: string; weight_kg: number }> = []
  let setCounter = 0

  for (const ex of body.exercises) {
    if (ex.skipped) continue
    for (const set of ex.sets) {
      if (!set.completed) continue
      setCounter++
      const logId = generateId()
      const setType = set.is_warmup ? 'warmup' : 'normal'
      await pgQuery(
        c.env,
        `INSERT INTO exercise_logs (id, session_id, exercise_id,
           set_number, set_type, reps, weight_kg, is_completed, is_personal_record)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, false)`,
        [logId, workoutId, ex.exercise_id,
         setCounter, setType, set.reps, set.weight_kg]
      )
      if (!set.is_warmup && set.weight_kg > 0) {
        const existing = await pgQueryOne<{ max_weight: number }>(
          c.env,
          `SELECT MAX(weight_kg) AS max_weight FROM exercise_logs
           WHERE session_id IN (SELECT id FROM workout_sessions WHERE user_id = $1)
             AND exercise_id = $2 AND set_type != 'warmup' AND id != $3`,
          [userId, ex.exercise_id, logId]
        )
        if (!existing || set.weight_kg > (existing.max_weight || 0)) {
          records.push({ exercise_name: ex.exercise_name, weight_kg: set.weight_kg })
          // Mark as personal record
          await pgQuery(c.env,
            'UPDATE exercise_logs SET is_personal_record = true WHERE id = $1',
            [logId]
          )
        }
      }
    }
  }

  // Update plan current_day
  await pgQuery(
    c.env,
    `UPDATE workout_plans SET current_day = LEAST(current_day + 1, total_days), updated_at = NOW()
     WHERE id = $1 AND user_id = $2`,
    [body.plan_id, userId]
  )

  return created({
    workout_id: workoutId,
    summary: {
      duration_seconds: body.duration_seconds,
      total_sets: totalSets,
      total_reps: totalReps,
      total_volume_kg: Math.round(totalVolume * 100) / 100,
      estimated_calories: estimatedCalories,
      exercises_completed: body.exercises.filter((e) => !e.skipped).length,
      exercises_skipped: body.exercises.filter((e) => e.skipped).length,
    },
    records,
  })
})

// GET /b2c/records — Personal records do aluno B2C
workouts.get('/b2c/records', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const result = await pgQuery<{
    exercise_id: string
    max_weight: number
    max_reps: number
    last_date: string
  }>(
    c.env,
    `SELECT el.exercise_id,
            MAX(el.weight_kg) AS max_weight,
            MAX(el.reps) AS max_reps,
            MAX(el.performed_at) AS last_date
     FROM exercise_logs el
     JOIN workout_sessions ws ON ws.id = el.session_id
     WHERE ws.user_id = $1 AND el.set_type != 'warmup'
     GROUP BY el.exercise_id
     ORDER BY max_weight DESC`,
    [userId]
  )
  return success({ records: result.rows })
})

// ============================================
// POST /workouts/:id/cover-image — Upload imagem de capa do treino (R2)
// Personal faz upload direto; backend salva em R2_IMAGES e atualiza cover_image_url
// ============================================
workouts.post('/:id/cover-image', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')

  await ensureWorkoutOwnership(c.env, workoutId, personalId)

  const contentType = c.req.header('content-type') || ''
  if (!contentType.startsWith('image/')) {
    throw new BadRequestError('Content-Type deve ser image/*')
  }

  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const ext = extMap[contentType.split(';')[0].trim()] ?? 'jpg'
  const key = `workouts/${workoutId}/cover.${ext}`

  const body = await c.req.arrayBuffer()
  if (body.byteLength > 10 * 1024 * 1024) {
    throw new BadRequestError('Imagem deve ter no máximo 10 MB')
  }

  await c.env.R2_IMAGES.put(key, body, { httpMetadata: { contentType } })

  const base = (c.env.R2_IMAGES_URL || 'https://images.vfit.app.br').replace(/\/+$/, '')
  const coverUrl = `${base}/${key}`

  const now = new Date().toISOString()
  await pgQuery(c.env,
    'UPDATE workouts SET cover_image_url = $1, updated_at = $2 WHERE id = $3',
    [coverUrl, now, workoutId]
  )

  return success({ cover_image_url: coverUrl })
})

// ============================================
// DELETE /workouts/:id/cover-image — Remover imagem de capa
// ============================================
workouts.delete('/:id/cover-image', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')

  await ensureWorkoutOwnership(c.env, workoutId, personalId)

  // Remove todos os formatos possíveis (jpg, png, webp)
  for (const ext of ['jpg', 'png', 'webp']) {
    try { await c.env.R2_IMAGES.delete(`workouts/${workoutId}/cover.${ext}`) } catch { /* best-effort */ }
  }

  const now = new Date().toISOString()
  await pgQuery(c.env,
    'UPDATE workouts SET cover_image_url = NULL, updated_at = $1 WHERE id = $2',
    [now, workoutId]
  )

  return success({ cover_image_url: null })
})

// ============================================
// POST /workouts/:id/exercises/:eid/video — Upload vídeo customizado do aluno
// Personal faz upload do vídeo gravado na academia para substituir o da biblioteca
// ============================================
workouts.post('/:id/exercises/:eid/video', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')
  const exerciseRowId = c.req.param('eid')

  await ensureWorkoutOwnership(c.env, workoutId, personalId)

  // Verificar que o exercício pertence ao treino
  const exRow = await pgQueryOne<{ id: string }>(c.env,
    'SELECT id FROM workout_exercises WHERE id = $1 AND workout_id = $2',
    [exerciseRowId, workoutId]
  )
  if (!exRow) throw new NotFoundError('Exercício')

  const contentType = c.req.header('content-type') || ''
  if (!contentType.startsWith('video/')) {
    throw new BadRequestError('Content-Type deve ser video/*')
  }

  const extMap: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
  }
  const ext = extMap[contentType.split(';')[0].trim()] ?? 'mp4'
  const key = `workouts/${workoutId}/exercises/${exerciseRowId}.${ext}`

  const body = await c.req.arrayBuffer()
  if (body.byteLength > 100 * 1024 * 1024) {
    throw new BadRequestError('Vídeo deve ter no máximo 100 MB')
  }

  await c.env.R2_IMAGES.put(key, body, { httpMetadata: { contentType } })

  const base = (c.env.R2_IMAGES_URL || 'https://images.vfit.app.br').replace(/\/+$/, '')
  const videoUrl = `${base}/${key}`

  const now = new Date().toISOString()
  await pgQuery(c.env,
    'UPDATE workout_exercises SET custom_video_url = $1 WHERE id = $2',
    [videoUrl, exerciseRowId]
  )
  await pgQuery(c.env,
    'UPDATE workouts SET updated_at = $1 WHERE id = $2',
    [now, workoutId]
  )

  return success({ custom_video_url: videoUrl })
})

// ============================================
// DELETE /workouts/:id/exercises/:eid/video — Remover vídeo customizado
// ============================================
workouts.delete('/:id/exercises/:eid/video', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const workoutId = c.req.param('id')
  const exerciseRowId = c.req.param('eid')

  await ensureWorkoutOwnership(c.env, workoutId, personalId)

  const exRow = await pgQueryOne<{ id: string; custom_video_url: string | null }>(c.env,
    'SELECT id, custom_video_url FROM workout_exercises WHERE id = $1 AND workout_id = $2',
    [exerciseRowId, workoutId]
  )
  if (!exRow) throw new NotFoundError('Exercício')

  // Remove do R2 se o URL for nosso bucket
  if (exRow.custom_video_url?.includes('images.vfit.app.br')) {
    try {
      const urlParts = new URL(exRow.custom_video_url)
      await c.env.R2_IMAGES.delete(urlParts.pathname.replace(/^\//, ''))
    } catch { /* best-effort */ }
  }

  await pgQuery(c.env,
    'UPDATE workout_exercises SET custom_video_url = NULL WHERE id = $1',
    [exerciseRowId]
  )

  return success({ custom_video_url: null })
})

export { workouts as workoutsRoutes }
