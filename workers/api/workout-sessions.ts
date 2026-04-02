/**
 * workers/api/workout-sessions.ts
 *
 * workout-sessions.ts — Execução e log de sessões de treino
 * Features: DB: Neon
 */

// ============================================
// workout-sessions.ts — Execução e log de sessões de treino
// ============================================
//
// O que faz:
//   Gerencia sessões ativas de treino do aluno: ver sessão atual, avançar
//   para próximo exercício, registrar log de execução e finalizar sessão.
//   Integrado ao XP: credita pontos, atualiza streak e meta diária ao
//   completar exercícios via lib/xp-service.ts.
//
// Exports principais:
//   workoutSessionsRoutes — Hono app montado em /api/v1/workouts (sub-rota)
//
// Auth: requireAuth. Apenas student executa sessões.
// DB: workout_sessions, workout_session_logs, workouts, exercises
// Side effects: credita XP, atualiza streak e meta diária (lib/xp-service)
// ============================================
import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import { pgQuery, generateId } from '@lib/db'
import { success, created, noContent } from '@lib/response'
import { NotFoundError } from '@lib/errors'
import { sessionAdvanceSchema, sessionLogSchema } from '@workers/schemas/workout-sessions'
import { creditXP, updateDailyGoalProgress, updateStreakAndCheckMilestones } from '@lib/xp-service'

const workoutSessionsRoutes = new Hono<AppContext>()

workoutSessionsRoutes.use('*', authMiddleware)

// ============================================
// GET /workouts/:id/session
// ============================================
workoutSessionsRoutes.get('/:id/session', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const workoutId = c.req.param('id')

  const workout = await findStudentWorkout(c.env, workoutId, studentId)
  const exercises = await findWorkoutExercises(c.env, workoutId)

  let session = await findSession(c.env, workoutId, studentId)
  if (!session) {
    const first = exercises[0]
    const now = new Date().toISOString()
    const sessionId = generateId()
    await pgQuery(c.env, `
      INSERT INTO workout_session_state
      (id, user_id, workout_id, current_exercise_index, phase, rest_remaining_seconds, next_exercise_id, exercise_logs, started_at, updated_at)
      VALUES ($1, $2, $3, 0, 'exercise', 0, $4, '[]'::jsonb, $5, $5)
    `, [sessionId, studentId, workoutId, first?.exercise_id || null, now])

    session = await findSession(c.env, workoutId, studentId)
  }

  if (!session) throw new NotFoundError('Sessão')

  return success({
    workout,
    exercises,
    session,
  })
})

// ============================================
// POST /workouts/:id/session/advance
// ============================================
workoutSessionsRoutes.post('/:id/session/advance', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const workoutId = c.req.param('id')
  const parsed = sessionAdvanceSchema.parse(await c.req.json().catch(() => ({})))

  await findStudentWorkout(c.env, workoutId, studentId)
  const exercises = await findWorkoutExercises(c.env, workoutId)
  const session = await requireSession(c.env, workoutId, studentId)

  const now = new Date().toISOString()
  let nextPhase: SessionPhase = session.phase
  let nextIndex = session.current_exercise_index
  let nextExerciseId: string | null = session.next_exercise_id
  let restRemaining = session.rest_remaining_seconds

  if (parsed.force_phase) {
    nextPhase = parsed.force_phase
  } else if (session.phase === 'exercise') {
    const currentExercise = exercises[session.current_exercise_index]
    if (!currentExercise) {
      nextPhase = 'completed'
      nextExerciseId = null
      restRemaining = 0
    } else {
      nextPhase = 'rest'
      restRemaining = parsed.rest_remaining_seconds ?? Math.max(0, currentExercise.rest_seconds || 0)
      nextExerciseId = exercises[session.current_exercise_index + 1]?.exercise_id || null
    }
  } else if (session.phase === 'rest') {
    nextPhase = 'next_preview'
    restRemaining = parsed.rest_remaining_seconds ?? 0
  } else if (session.phase === 'next_preview') {
    nextIndex = session.current_exercise_index + 1
    const hasNext = !!exercises[nextIndex]
    nextPhase = hasNext ? 'exercise' : 'completed'
    nextExerciseId = exercises[nextIndex + 1]?.exercise_id || null
    restRemaining = 0
  }

  await pgQuery(c.env, `
    UPDATE workout_session_state
       SET current_exercise_index = $1,
           phase = $2,
           rest_remaining_seconds = $3,
           next_exercise_id = $4,
           updated_at = $5
     WHERE id = $6
  `, [nextIndex, nextPhase, restRemaining, nextExerciseId, now, session.id])

  const updated = await requireSession(c.env, workoutId, studentId)
  return success({ session: updated })
})

// ============================================
// POST /workouts/:id/session/log
// ============================================
workoutSessionsRoutes.post('/:id/session/log', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const workoutId = c.req.param('id')
  const parsed = sessionLogSchema.parse(await c.req.json())

  await findStudentWorkout(c.env, workoutId, studentId)
  const session = await requireSession(c.env, workoutId, studentId)

  const currentLogs = parseSessionLogs(session.exercise_logs)
  currentLogs.push({
    id: generateId(),
    ...parsed,
    logged_at: new Date().toISOString(),
  })

  await pgQuery(c.env, `
    UPDATE workout_session_state
       SET exercise_logs = $1,
           updated_at = $2
     WHERE id = $3
  `, [JSON.stringify(currentLogs), new Date().toISOString(), session.id])

  return created({
    total_logs: currentLogs.length,
    last_log: currentLogs[currentLogs.length - 1],
  })
})

// ============================================
// POST /workouts/:id/session/complete
// ============================================
workoutSessionsRoutes.post('/:id/session/complete', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const workoutId = c.req.param('id')

  await findStudentWorkout(c.env, workoutId, studentId)
  const session = await requireSession(c.env, workoutId, studentId)

  const now = new Date().toISOString()
  const logs = parseSessionLogs(session.exercise_logs)
  const logId = generateId()

  await pgQuery(c.env, `
    INSERT INTO workout_logs (id, workout_id, student_id, completed_at, duration_minutes, exercises_completed, student_notes, feeling, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    logId,
    workoutId,
    studentId,
    now,
    null,
    JSON.stringify(logs),
    null,
    null,
    now,
  ])

  await pgQuery(c.env, `
    UPDATE workout_session_state
       SET phase = 'completed',
           updated_at = $1
     WHERE id = $2
  `, [now, session.id])

  const xp = await creditXP(c.env, studentId, 'workout_completed', {
    referenceType: 'workout_log',
    referenceId: logId,
    idempotencyKey: `workout_log:${logId}:session_completed`,
    notes: 'Treino concluído via sessão guiada',
    metadata: {
      workout_id: workoutId,
      logs_count: logs.length,
      source: 'workout_session',
    },
  })

  let goal = null
  let milestones: Array<{ days: number; xpAwarded: number }> = []
  try {
    const goalResult = await updateDailyGoalProgress(c.env, studentId, xp.transaction.amount, true)
    goal = goalResult.goal
  } catch {}

  try {
    const streakResult = await updateStreakAndCheckMilestones(c.env, studentId)
    milestones = streakResult.newMilestones
  } catch {}

  return created({
    workout_log_id: logId,
    session_id: session.id,
    xp_earned: xp.transaction.amount,
    xp_balance: xp.balanceAfter,
    daily_goal: goal,
    streak_milestones: milestones,
  })
})

// ============================================
// DELETE /workouts/:id/session
// ============================================
workoutSessionsRoutes.delete('/:id/session', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const workoutId = c.req.param('id')

  await findStudentWorkout(c.env, workoutId, studentId)
  const session = await requireSession(c.env, workoutId, studentId)

  await pgQuery(c.env, 'DELETE FROM workout_session_state WHERE id = $1', [session.id])
  return noContent()
})

export { workoutSessionsRoutes }

type SessionPhase = 'exercise' | 'rest' | 'next_preview' | 'completed'

interface SessionRow {
  id: string
  user_id: string
  workout_id: string
  current_exercise_index: number
  phase: SessionPhase
  rest_remaining_seconds: number
  next_exercise_id: string | null
  exercise_logs: unknown
  started_at: string
  updated_at: string
}

interface WorkoutRow {
  id: string
  name: string
  student_id: string
  personal_id: string
  status: string
}

interface WorkoutExerciseRow {
  id: string
  workout_id: string
  exercise_id: string
  sets: number
  reps: string
  rest_seconds: number
  order_index: number
}

async function findStudentWorkout(env: AppContext['Bindings'], workoutId: string, studentId: string): Promise<WorkoutRow> {
  const { rows } = await pgQuery<WorkoutRow>(
    env,
    `SELECT id, name, student_id, personal_id, status
       FROM workouts
      WHERE id = $1 AND student_id = $2
      LIMIT 1`,
    [workoutId, studentId]
  )
  const row = rows[0]
  if (!row) throw new NotFoundError('Treino')
  return row
}

async function findWorkoutExercises(env: AppContext['Bindings'], workoutId: string): Promise<WorkoutExerciseRow[]> {
  const { rows } = await pgQuery<WorkoutExerciseRow>(
    env,
    `SELECT id, workout_id, exercise_id, sets, reps, rest_seconds, order_index
       FROM workout_exercises
      WHERE workout_id = $1
      ORDER BY order_index ASC`,
    [workoutId]
  )
  return rows
}

async function findSession(env: AppContext['Bindings'], workoutId: string, studentId: string): Promise<SessionRow | null> {
  const { rows } = await pgQuery<SessionRow>(
    env,
    `SELECT id, user_id, workout_id, current_exercise_index, phase, rest_remaining_seconds, next_exercise_id, exercise_logs, started_at, updated_at
       FROM workout_session_state
      WHERE workout_id = $1 AND user_id = $2
      LIMIT 1`,
    [workoutId, studentId]
  )
  return rows[0] || null
}

async function requireSession(env: AppContext['Bindings'], workoutId: string, studentId: string): Promise<SessionRow> {
  const session = await findSession(env, workoutId, studentId)
  if (!session) throw new NotFoundError('Sessão de treino')
  return session
}

function parseSessionLogs(value: unknown): Array<Record<string, unknown>> {
  if (!value) return []
  if (Array.isArray(value)) return value as Array<Record<string, unknown>>
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed as Array<Record<string, unknown>> : []
    } catch {
      return []
    }
  }
  return []
}
