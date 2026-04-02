/**
 * workers/api/progress.ts
 *
 * VFIT B2C — Dashboard de Progresso
 *
 * GET /api/v1/progress/summary?period=week|month|year — KPIs aggregados
 * GET /api/v1/progress/chart?period=week|month — Dados para gráficos
 *
 * Auth: authMiddleware (obrigatório)
 * DB: Neon (workout_sessions, exercise_logs)
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { pgQuery, pgQueryOne } from '@lib/db'
import { success } from '@lib/response'
import { BadRequestError } from '@lib/errors'

const progress = new Hono<AppContext>()

progress.use('*', authMiddleware)

// ============================================
// GET /summary — KPIs por período
// ============================================
progress.get('/summary', async (c) => {
  const userId = c.get('userId')
  const period = c.req.query('period') || 'week'
  const offsetStr = c.req.query('offset') || '0'
  const offset = parseInt(offsetStr, 10)

  if (!['week', 'month', 'year', 'last'].includes(period)) {
    throw new BadRequestError('period must be week, month, year, or last')
  }

  const env = c.env

  // "last" retorna o último treino apenas
  if (period === 'last') {
    const lastSession = await pgQueryOne<{
      total_volume_kg: string
      total_sets: string
      total_reps: string
      calories_estimated: string
      duration_seconds: string
      started_at: string
    }>(
      env,
      `SELECT total_volume_kg, total_sets, total_reps, calories_estimated, 
              duration_seconds, started_at
       FROM workout_sessions 
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY started_at DESC LIMIT 1`,
      [userId]
    )

    if (!lastSession) {
      return c.json(success({
        period: 'last',
        offset: 0,
        label: 'Último treino',
        date_range: { start: null, end: null },
        kpis: {
          workouts: 0,
          exercises: 0,
          duration_min: 0,
          calories: 0,
          total_reps: 0,
          total_volume_kg: 0,
        },
      }))
    }

    // Count exercises from that session
    const exerciseCount = await pgQueryOne<{ count: string }>(
      env,
      `SELECT COUNT(DISTINCT exercise_id)::text as count FROM exercise_logs WHERE session_id = (
        SELECT id FROM workout_sessions WHERE user_id = $1 AND status = 'completed' ORDER BY started_at DESC LIMIT 1
      )`,
      [userId]
    )

    return c.json(success({
      period: 'last',
      offset: 0,
      label: 'Último treino',
      date_range: {
        start: lastSession.started_at,
        end: lastSession.started_at,
      },
      kpis: {
        workouts: 1,
        exercises: parseInt(exerciseCount?.count || '0', 10),
        duration_min: Math.round((parseInt(lastSession.duration_seconds || '0', 10)) / 60),
        calories: parseInt(lastSession.calories_estimated || '0', 10),
        total_reps: parseInt(lastSession.total_reps || '0', 10),
        total_volume_kg: parseFloat(lastSession.total_volume_kg || '0'),
      },
    }))
  }

  // Build date interval SQL based on period + offset
  let intervalSql: string
  let labelPrefix: string

  switch (period) {
    case 'week':
      intervalSql = `date_trunc('week', NOW() - interval '${offset} weeks') AND date_trunc('week', NOW() - interval '${offset} weeks') + interval '6 days 23 hours 59 minutes 59 seconds'`
      labelPrefix = offset === 0 ? 'Esta semana' : `${offset} semana${offset > 1 ? 's' : ''} atrás`
      break
    case 'month':
      intervalSql = `date_trunc('month', NOW() - interval '${offset} months') AND date_trunc('month', NOW() - interval '${offset} months') + interval '1 month' - interval '1 second'`
      labelPrefix = offset === 0 ? 'Este mês' : `${offset} ${offset > 1 ? 'meses' : 'mês'} atrás`
      break
    case 'year':
      intervalSql = `date_trunc('year', NOW() - interval '${offset} years') AND date_trunc('year', NOW() - interval '${offset} years') + interval '1 year' - interval '1 second'`
      labelPrefix = offset === 0 ? 'Este ano' : `${offset} ano${offset > 1 ? 's' : ''} atrás`
      break
    default:
      intervalSql = `date_trunc('week', NOW()) AND NOW()`
      labelPrefix = 'Esta semana'
  }

  // Aggregated KPIs
  const kpis = await pgQueryOne<{
    workouts: string
    duration_min: string
    calories: string
    total_reps: string
    total_volume_kg: string
    date_start: string
    date_end: string
  }>(
    env,
    `SELECT 
      COUNT(*)::text as workouts,
      COALESCE(SUM(duration_seconds) / 60, 0)::text as duration_min,
      COALESCE(SUM(calories_estimated), 0)::text as calories,
      COALESCE(SUM(total_reps), 0)::text as total_reps,
      COALESCE(SUM(total_volume_kg), 0)::text as total_volume_kg,
      MIN(started_at)::text as date_start,
      MAX(started_at)::text as date_end
    FROM workout_sessions 
    WHERE user_id = $1 
      AND status = 'completed'
      AND started_at BETWEEN ${intervalSql}`,
    [userId]
  )

  // Count distinct exercises
  const exerciseCount = await pgQueryOne<{ count: string }>(
    env,
    `SELECT COUNT(DISTINCT el.exercise_id)::text as count
     FROM exercise_logs el
     JOIN workout_sessions ws ON ws.id = el.session_id
     WHERE ws.user_id = $1 
       AND ws.status = 'completed'
       AND ws.started_at BETWEEN ${intervalSql}`,
    [userId]
  )

  return c.json(success({
    period,
    offset,
    label: labelPrefix,
    date_range: {
      start: kpis?.date_start || null,
      end: kpis?.date_end || null,
    },
    kpis: {
      workouts: parseInt(kpis?.workouts || '0', 10),
      exercises: parseInt(exerciseCount?.count || '0', 10),
      duration_min: Math.round(parseFloat(kpis?.duration_min || '0')),
      calories: parseInt(kpis?.calories || '0', 10),
      total_reps: parseInt(kpis?.total_reps || '0', 10),
      total_volume_kg: parseFloat(parseFloat(kpis?.total_volume_kg || '0').toFixed(1)),
    },
  }))
})

// ============================================
// GET /chart — Dados para gráficos
// ============================================
progress.get('/chart', async (c) => {
  const userId = c.get('userId')
  const period = c.req.query('period') || 'week'
  const offsetStr = c.req.query('offset') || '0'
  const offset = parseInt(offsetStr, 10)

  if (!['week', 'month'].includes(period)) {
    throw new BadRequestError('period must be week or month')
  }

  const env = c.env

  if (period === 'week') {
    // 7 days data (cada dia da semana)
    const rows = await pgQuery<{
      day_date: string
      workouts: string
      duration_min: string
      volume_kg: string
    }>(
      env,
      `WITH days AS (
        SELECT generate_series(
          date_trunc('week', NOW() - interval '${offset} weeks'),
          date_trunc('week', NOW() - interval '${offset} weeks') + interval '6 days',
          interval '1 day'
        )::date as day_date
      )
      SELECT 
        d.day_date::text,
        COALESCE(COUNT(ws.id), 0)::text as workouts,
        COALESCE(SUM(ws.duration_seconds) / 60, 0)::text as duration_min,
        COALESCE(SUM(ws.total_volume_kg), 0)::text as volume_kg
      FROM days d
      LEFT JOIN workout_sessions ws 
        ON ws.started_at::date = d.day_date 
        AND ws.user_id = $1 
        AND ws.status = 'completed'
      GROUP BY d.day_date
      ORDER BY d.day_date`,
      [userId]
    )

    const dayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

    return c.json(success({
      period: 'week',
      offset,
      data: rows.rows.map((r, i) => ({
        label: dayLabels[i] || '',
        date: r.day_date,
        workouts: parseInt(r.workouts, 10),
        duration_min: Math.round(parseFloat(r.duration_min)),
        volume_kg: parseFloat(parseFloat(r.volume_kg).toFixed(1)),
      })),
    }))
  }

  // month — 4-5 weeks
  const rows = await pgQuery<{
    week_start: string
    workouts: string
    duration_min: string
    volume_kg: string
  }>(
    env,
    `WITH weeks AS (
      SELECT generate_series(
        date_trunc('month', NOW() - interval '${offset} months'),
        date_trunc('month', NOW() - interval '${offset} months') + interval '1 month' - interval '1 day',
        interval '1 week'
      )::date as week_start
    )
    SELECT 
      w.week_start::text,
      COALESCE(COUNT(ws.id), 0)::text as workouts,
      COALESCE(SUM(ws.duration_seconds) / 60, 0)::text as duration_min,
      COALESCE(SUM(ws.total_volume_kg), 0)::text as volume_kg
    FROM weeks w
    LEFT JOIN workout_sessions ws 
      ON ws.started_at::date >= w.week_start 
      AND ws.started_at::date < w.week_start + 7
      AND ws.user_id = $1 
      AND ws.status = 'completed'
    GROUP BY w.week_start
    ORDER BY w.week_start`,
    [userId]
  )

  return c.json(success({
    period: 'month',
    offset,
    data: rows.rows.map((r, i) => ({
      label: `Sem ${i + 1}`,
      date: r.week_start,
      workouts: parseInt(r.workouts, 10),
      duration_min: Math.round(parseFloat(r.duration_min)),
      volume_kg: parseFloat(parseFloat(r.volume_kg).toFixed(1)),
    })),
  }))
})

// ============================================
// GET /streak — Streak atual + melhor
// ============================================
progress.get('/streak', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  // Dias distintos com treino completo
  const result = await pgQuery<{ workout_date: string }>(
    env,
    `SELECT DISTINCT started_at::date::text as workout_date
     FROM workout_sessions 
     WHERE user_id = $1 AND status = 'completed'
     ORDER BY workout_date DESC
     LIMIT 365`,
    [userId]
  )

  const dates = result.rows.map(r => r.workout_date)

  if (dates.length === 0) {
    return c.json(success({
      current_streak: 0,
      best_streak: 0,
      total_workout_days: 0,
    }))
  }

  // Calculate current streak
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i])
    d.setHours(0, 0, 0, 0)
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)
    expectedDate.setHours(0, 0, 0, 0)

    if (d.getTime() === expectedDate.getTime()) {
      currentStreak++
    } else if (i === 0) {
      // Allow yesterday as start too
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (d.getTime() === yesterday.getTime()) {
        currentStreak = 1
      } else {
        break
      }
    } else {
      break
    }
  }

  // Calculate best streak from sorted dates
  let bestStreak = 1
  let tempStreak = 1
  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i - 1])
    const prev = new Date(dates[i])
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays === 1) {
      tempStreak++
      bestStreak = Math.max(bestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  return c.json(success({
    current_streak: currentStreak,
    best_streak: Math.max(bestStreak, currentStreak),
    total_workout_days: dates.length,
  }))
})

// ============================================
// GET /exercise/:id — Evolução de um exercício
// ============================================
progress.get('/exercise/:id', async (c) => {
  const userId = c.get('userId')
  const exerciseId = c.req.param('id')
  const env = c.env
  const periodParam = c.req.query('period') || '3m' // 1m, 3m, 6m, 1y, all

  let intervalFilter = ''
  switch (periodParam) {
    case '1m': intervalFilter = "AND el.performed_at >= NOW() - interval '1 month'"; break
    case '3m': intervalFilter = "AND el.performed_at >= NOW() - interval '3 months'"; break
    case '6m': intervalFilter = "AND el.performed_at >= NOW() - interval '6 months'"; break
    case '1y': intervalFilter = "AND el.performed_at >= NOW() - interval '1 year'"; break
    default: intervalFilter = ''; break // all
  }

  // Weight over time (max weight per session)
  const weightData = await pgQuery<{
    session_date: string
    max_weight: string
    max_volume: string
    total_reps: string
  }>(
    env,
    `SELECT 
      ws.started_at::date::text as session_date,
      MAX(el.weight_kg)::text as max_weight,
      MAX(el.weight_kg * el.reps)::text as max_volume,
      SUM(el.reps)::text as total_reps
    FROM exercise_logs el
    JOIN workout_sessions ws ON ws.id = el.session_id
    WHERE ws.user_id = $1 
      AND el.exercise_id = $2
      AND ws.status = 'completed'
      ${intervalFilter}
    GROUP BY ws.started_at::date
    ORDER BY ws.started_at::date`,
    [userId, exerciseId]
  )

  // Personal records for this exercise
  const records = await pgQuery<{
    weight_kg: string
    reps: string
    set_type: string
    performed_at: string
  }>(
    env,
    `SELECT 
      el.weight_kg::text,
      el.reps::text,
      el.set_type,
      el.performed_at::text
    FROM exercise_logs el
    JOIN workout_sessions ws ON ws.id = el.session_id
    WHERE ws.user_id = $1 
      AND el.exercise_id = $2
      AND el.is_personal_record = TRUE
    ORDER BY el.performed_at DESC
    LIMIT 10`,
    [userId, exerciseId]
  )

  // Summary stats
  const stats = await pgQueryOne<{
    total_sessions: string
    total_sets: string
    total_reps: string
    max_weight: string
    max_volume: string
    avg_weight: string
  }>(
    env,
    `SELECT 
      COUNT(DISTINCT ws.id)::text as total_sessions,
      COUNT(el.id)::text as total_sets,
      SUM(el.reps)::text as total_reps,
      MAX(el.weight_kg)::text as max_weight,
      MAX(el.weight_kg * el.reps)::text as max_volume,
      ROUND(AVG(el.weight_kg), 1)::text as avg_weight
    FROM exercise_logs el
    JOIN workout_sessions ws ON ws.id = el.session_id
    WHERE ws.user_id = $1 
      AND el.exercise_id = $2
      AND ws.status = 'completed'
      ${intervalFilter}`,
    [userId, exerciseId]
  )

  return c.json(success({
    exercise_id: exerciseId,
    period: periodParam,
    weight_history: weightData.rows.map(r => ({
      date: r.session_date,
      max_weight: parseFloat(r.max_weight),
      max_volume: parseFloat(r.max_volume),
      total_reps: parseInt(r.total_reps, 10),
    })),
    personal_records: records.rows.map(r => ({
      weight_kg: parseFloat(r.weight_kg),
      reps: parseInt(r.reps, 10),
      set_type: r.set_type,
      performed_at: r.performed_at,
    })),
    stats: {
      total_sessions: parseInt(stats?.total_sessions || '0', 10),
      total_sets: parseInt(stats?.total_sets || '0', 10),
      total_reps: parseInt(stats?.total_reps || '0', 10),
      max_weight: parseFloat(stats?.max_weight || '0'),
      max_volume: parseFloat(stats?.max_volume || '0'),
      avg_weight: parseFloat(stats?.avg_weight || '0'),
    },
  }))
})

// ============================================
// GET /heatmap — Calendário de consistência
// ============================================
progress.get('/heatmap', async (c) => {
  const userId = c.get('userId')
  const env = c.env

  // Last 365 days: date + count of workouts
  const result = await pgQuery<{
    workout_date: string
    count: string
  }>(
    env,
    `SELECT 
      started_at::date::text as workout_date,
      COUNT(*)::text as count
    FROM workout_sessions 
    WHERE user_id = $1 
      AND status = 'completed'
      AND started_at >= NOW() - interval '365 days'
    GROUP BY started_at::date
    ORDER BY started_at::date`,
    [userId]
  )

  return c.json(success({
    days: result.rows.map(r => ({
      date: r.workout_date,
      count: parseInt(r.count, 10),
    })),
  }))
})

export { progress as progressRoutes }
