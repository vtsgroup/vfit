/**
 * workers/api/calendar.ts
 *
 * calendar.ts — Agenda de sessões e eventos
 * Features: DB: Neon
 */

// ============================================
// calendar.ts — Agenda de sessões e eventos
// ============================================
//
// O que faz:
//   CRUD de eventos de agenda: sessões com alunos, bloqueios e eventos gerais.
//   Tabela calendar_events criada via ensureCalendarSchema() (lazy migration
//   inline — não está em migrations/). Students veem só seus eventos;
//   personals veem os próprios; admin vê tudo.
//
// Exports principais:
//   calendarRoutes — Hono app montado em /api/v1/calendar
//
// Auth: requireAuth em todas. POST/PATCH/DELETE exigem personal ou admin.
// DB: calendar_events (lazy-created inline), users (JOIN para nomes)
// ============================================

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created, noContent } from '@lib/response'
import { BadRequestError, ForbiddenError, NotFoundError } from '@lib/errors'
import {
  listCalendarEventsQuerySchema,
  createCalendarEventSchema,
  updateCalendarEventSchema,
} from '@workers/schemas/calendar'
import { ConflictError } from '@lib/errors'

const calendar = new Hono<AppContext>()
calendar.use('*', authMiddleware)

// ============================================
// Helpers
// ============================================

function isAdminUser(userRole: string | undefined, userType: string | undefined): boolean {
  return userRole === 'admin' || userRole === 'super_admin' || userType === 'admin' || userType === 'super_admin'
}

// Column list for recurring-series bulk INSERT — derive FIELDS_PER_ROW to avoid magic numbers
const CALENDAR_SERIES_COLUMNS = [
  'id', 'personal_id', 'student_id', 'title', 'notes', 'meeting_url',
  'start_at', 'end_at', 'color', 'status', 'recurrence_group_id', 'recurrence_index',
] as const
const FIELDS_PER_ROW = CALENDAR_SERIES_COLUMNS.length

/**
 * Computes the UTC start time for the i-th recurrence instance.
 * Monthly frequency is clamped to end-of-month to avoid JS Date overflow
 * (e.g. Jan 31 + 1 month → Feb 28, not March 3).
 */
export function computeRecurringOffset(baseMs: number, i: number, freq: 'daily' | 'weekly' | 'monthly'): number {
  if (freq === 'daily') return baseMs + i * 24 * 60 * 60 * 1000
  if (freq === 'weekly') return baseMs + i * 7 * 24 * 60 * 60 * 1000
  // monthly: advance i months, clamp if day overflows (e.g. Jan 31 → Feb 28, not March 3)
  const base = new Date(baseMs)
  const target = new Date(baseMs)
  target.setUTCMonth(target.getUTCMonth() + i)
  if (target.getUTCDate() !== base.getUTCDate()) {
    target.setUTCDate(0) // setUTCDate(0) = last day of the previous month
  }
  return target.getTime()
}

// T10.4 — Schema garantido via migration 0012_calendar_events.sql (DDL runtime desabilitado)
let _schemaEnsured = true

async function ensureCalendarSchema(env: AppContext['Bindings']) {
  if (_schemaEnsured) return

  // Best-effort schema creation.
  // This keeps production unblocked even if a manual migration wasn't run yet.
  await pgQuery(env, `
    CREATE TABLE IF NOT EXISTS calendar_events (
      id UUID PRIMARY KEY,
      personal_id UUID NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE SET NULL,

      title VARCHAR(120),
      notes TEXT,
      meeting_url TEXT,

      start_at TIMESTAMPTZ NOT NULL,
      end_at TIMESTAMPTZ NOT NULL,

      color VARCHAR(20) NOT NULL DEFAULT 'blue',
      status VARCHAR(20),

      recurrence_group_id UUID,
      recurrence_index INT,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)

  // Add recurrence columns to existing tables (idempotent for existing deployments)
  await pgQuery(env, `ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS recurrence_group_id UUID;`)
  await pgQuery(env, `ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS recurrence_index INT;`)

  await pgQuery(env, `CREATE INDEX IF NOT EXISTS idx_calendar_events_personal_start ON calendar_events(personal_id, start_at);`)
  await pgQuery(env, `CREATE INDEX IF NOT EXISTS idx_calendar_events_student_start ON calendar_events(student_id, start_at);`)
  await pgQuery(env, `CREATE INDEX IF NOT EXISTS idx_calendar_events_recurrence_group ON calendar_events(recurrence_group_id) WHERE recurrence_group_id IS NOT NULL;`)

  _schemaEnsured = true
}

// ============================================
// checkConflict — throws 409 if personal has an overlapping event
// excludeId: pass event id on PATCH to skip checking against itself
// ============================================
async function checkConflict(
  env: AppContext['Bindings'],
  personalId: string,
  startAt: string,
  endAt: string,
  excludeId?: string
) {
  const conflict = await pgQueryOne<{ id: string }>(
    env,
    `
      SELECT id FROM calendar_events
      WHERE personal_id = $1
        AND NOT (end_at <= $2 OR start_at >= $3)
        ${excludeId ? 'AND id != $4' : ''}
      LIMIT 1
    `,
    excludeId ? [personalId, startAt, endAt, excludeId] : [personalId, startAt, endAt]
  )
  if (conflict) {
    throw new ConflictError('Conflito de horário: já existe um evento nesse período')
  }
}

// ============================================
// GET /calendar/events
// ============================================
calendar.get('/events', async (c) => {
  await ensureCalendarSchema(c.env)

  const userId = c.get('userId')
  const userType = c.get('userType')
  const userRole = c.get('userRole')

  const url = new URL(c.req.url)
  const query = listCalendarEventsQuerySchema.parse({
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
  })

  const from = query.from
  const to = query.to

  // Students can only see their own.
  // Personal can see their own (including student-linked ones).
  // Admin can see all.
  const conditions: string[] = ['e.start_at < $1', 'e.end_at > $2']
  const params: unknown[] = [to, from]
  let idx = 3

  const isAdmin = isAdminUser(userRole, userType)
  if (!isAdmin) {
    if (userType === 'student') {
      conditions.push(`e.student_id = $${idx}`)
      params.push(userId)
      idx++
    } else {
      // personal
      conditions.push(`e.personal_id = $${idx}`)
      params.push(userId)
      idx++
    }
  }

  const where = conditions.join(' AND ')

  const { rows } = await pgQuery<CalendarEventRow>(
    c.env,
    `
      SELECT
        e.id, e.personal_id, e.student_id, e.title, e.notes, e.meeting_url,
        e.start_at, e.end_at, e.color, e.status,
        e.recurrence_group_id, e.recurrence_index,
        e.created_at, e.updated_at,
        up.full_name as personal_name,
        us.full_name as student_name
      FROM calendar_events e
      JOIN users up ON up.id = e.personal_id
      LEFT JOIN users us ON us.id = e.student_id
      WHERE ${where}
      ORDER BY e.start_at ASC
    `,
    params
  )

  return success({ events: rows })
})

// ============================================
// POST /calendar/events
// ============================================
calendar.post('/events', requireType('personal', 'admin', 'super_admin'), async (c) => {
  await ensureCalendarSchema(c.env)

  const userId = c.get('userId')
  const userType = c.get('userType')
  const userRole = c.get('userRole')

  const body = createCalendarEventSchema.parse(await c.req.json<Record<string, unknown>>())

  if (body.end_at <= body.start_at) {
    throw new BadRequestError('end_at deve ser maior que start_at')
  }

  const isAdmin = isAdminUser(userRole, userType)

  // If personal is creating for a student, ensure the student belongs to the personal.
  if (body.student_id && !isAdmin) {
    const belongs = await pgQueryOne<{ id: string }>(
      c.env,
      'SELECT id FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
      [body.student_id, userId]
    )
    if (!belongs) throw new ForbiddenError('Aluno não pertence ao personal')
  }

  // Conflict check for the first (or only) instance
  await checkConflict(c.env, userId, body.start_at, body.end_at)

  const title = body.title || (body.student_id ? 'Sessão' : 'Bloqueio')
  const color = body.color ?? 'blue'
  const recurrence = body.recurrence

  // ── Single event (no recurrence) ──────────────────────────────────
  if (!recurrence) {
    const id = generateId()
    await pgQuery(
      c.env,
      `
        INSERT INTO calendar_events
          (id, personal_id, student_id, title, notes, meeting_url, start_at, end_at, color, status)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
      [
        id,
        userId,
        body.student_id ?? null,
        title,
        body.notes ?? null,
        body.meeting_url ?? null,
        body.start_at,
        body.end_at,
        color,
        body.status ?? null,
      ]
    )

    const event = await pgQueryOne<CalendarEventRow>(
      c.env,
      `
        SELECT
          e.id, e.personal_id, e.student_id, e.title, e.notes, e.meeting_url,
          e.start_at, e.end_at, e.color, e.status,
          e.recurrence_group_id, e.recurrence_index,
          e.created_at, e.updated_at,
          up.full_name as personal_name,
          us.full_name as student_name
        FROM calendar_events e
        JOIN users up ON up.id = e.personal_id
        LEFT JOIN users us ON us.id = e.student_id
        WHERE e.id = $1
        LIMIT 1
      `,
      [id]
    )
    return created({ event })
  }

  // ── Recurring event — bulk INSERT ─────────────────────────────────
  const groupId = generateId()
  const startMs = new Date(body.start_at).getTime()
  const durationMs = new Date(body.end_at).getTime() - startMs

  // Pre-compute all instance timestamps (uses module-level computeRecurringOffset
  // which handles monthly end-of-month clamping correctly)
  const allInstances = Array.from({ length: recurrence.count }, (_, i) => {
    const iStartMs = computeRecurringOffset(startMs, i, recurrence.freq)
    return {
      id: generateId(),
      startAt: new Date(iStartMs).toISOString(),
      endAt: new Date(iStartMs + durationMs).toISOString(),
      index: i,
    }
  })

  // Batch conflict check for instances 1..N-1 in a single query.
  // Instance 0 is already validated by checkConflict() above.
  let instances = [allInstances[0]]
  if (allInstances.length > 1) {
    const batchStart = allInstances[1].startAt
    const batchEnd = allInstances[allInstances.length - 1].endAt
    const { rows: conflicts } = await pgQuery<{ start_at: string; end_at: string }>(
      c.env,
      `SELECT start_at, end_at FROM calendar_events
       WHERE personal_id = $1 AND NOT (end_at <= $2 OR start_at >= $3)`,
      [userId, batchStart, batchEnd]
    )
    for (const inst of allInstances.slice(1)) {
      const hasConflict = conflicts.some(
        ex => !(ex.end_at <= inst.startAt || ex.start_at >= inst.endAt)
      )
      if (!hasConflict) instances.push(inst)
    }
  }

  if (instances.length === 0) {
    throw new ConflictError('Todos os horários da série estão em conflito com eventos existentes')
  }

  // Bulk INSERT + immediate SELECT in a single CTE for atomicity:
  // both operations succeed or fail together (no partial-series state on error)
  const valuePlaceholders = instances.map((_, i) => {
    const base = i * FIELDS_PER_ROW
    return `(${Array.from({ length: FIELDS_PER_ROW }, (_, j) => `$${base + j + 1}`).join(',')})`
  })

  const bulkParams: unknown[] = []
  for (const inst of instances) {
    bulkParams.push(
      inst.id, userId, body.student_id ?? null, title,
      body.notes ?? null, body.meeting_url ?? null,
      inst.startAt, inst.endAt, color, body.status ?? null,
      groupId, inst.index
    )
  }

  const { rows: events } = await pgQuery<CalendarEventRow>(
    c.env,
    `
      WITH inserted AS (
        INSERT INTO calendar_events (${CALENDAR_SERIES_COLUMNS.join(', ')})
        VALUES ${valuePlaceholders.join(', ')}
        RETURNING id, recurrence_index
      )
      SELECT
        e.id, e.personal_id, e.student_id, e.title, e.notes, e.meeting_url,
        e.start_at, e.end_at, e.color, e.status,
        e.recurrence_group_id, e.recurrence_index,
        e.created_at, e.updated_at,
        up.full_name as personal_name,
        us.full_name as student_name
      FROM calendar_events e
      JOIN inserted i ON i.id = e.id
      JOIN users up ON up.id = e.personal_id
      LEFT JOIN users us ON us.id = e.student_id
      ORDER BY e.recurrence_index ASC
    `,
    bulkParams
  )

  return created({ events })
})

// ============================================
// PATCH /calendar/events/:id
// ============================================
calendar.patch('/events/:id', requireType('personal', 'admin', 'super_admin'), async (c) => {
  await ensureCalendarSchema(c.env)

  const userId = c.get('userId')
  const userType = c.get('userType')
  const userRole = c.get('userRole')
  const id = c.req.param('id')

  const patch = updateCalendarEventSchema.parse(await c.req.json<Record<string, unknown>>())

  const existing = await pgQueryOne<{ id: string; personal_id: string; student_id: string | null; start_at: string; end_at: string }>(
    c.env,
    'SELECT id, personal_id, student_id, start_at, end_at FROM calendar_events WHERE id = $1 LIMIT 1',
    [id]
  )
  if (!existing) throw new NotFoundError('Evento')

  const isAdmin = isAdminUser(userRole, userType)
  if (!isAdmin && existing.personal_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }

  const nextStart = patch.start_at ?? existing.start_at
  const nextEnd = patch.end_at ?? existing.end_at

  if (nextEnd <= nextStart) {
    throw new BadRequestError('end_at deve ser maior que start_at')
  }

  // If start or end changed, run conflict check.
  // Use existing.personal_id (not userId) so admin edits check the correct personal's calendar.
  if (patch.start_at !== undefined || patch.end_at !== undefined) {
    await checkConflict(c.env, existing.personal_id, nextStart, nextEnd, id)
  }

  // If changing student_id as personal, ensure belongs
  if (patch.student_id && !isAdmin) {
    const belongs = await pgQueryOne<{ id: string }>(
      c.env,
      'SELECT id FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
      [patch.student_id, userId]
    )
    if (!belongs) throw new ForbiddenError('Aluno não pertence ao personal')
  }

  // Explicit allowlist — prevents new schema fields from becoming silently writable
  const PATCHABLE = ['student_id', 'title', 'notes', 'meeting_url', 'start_at', 'end_at', 'color', 'status'] as const
  type PatchableKey = (typeof PATCHABLE)[number]

  const fields: string[] = []
  const params: unknown[] = []
  let idx = 1

  for (const key of PATCHABLE) {
    const value = (patch as Partial<Record<PatchableKey, unknown>>)[key]
    if (value === undefined) continue
    fields.push(`${key} = $${idx}`)
    params.push(value)
    idx++
  }

  if (fields.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  fields.push(`updated_at = NOW()`)

  await pgQuery(
    c.env,
    `UPDATE calendar_events SET ${fields.join(', ')} WHERE id = $${idx}`,
    [...params, id]
  )

  const event = await pgQueryOne<CalendarEventRow>(
    c.env,
    `
      SELECT
        e.id, e.personal_id, e.student_id, e.title, e.notes, e.meeting_url,
        e.start_at, e.end_at, e.color, e.status,
        e.recurrence_group_id, e.recurrence_index,
        e.created_at, e.updated_at,
        up.full_name as personal_name,
        us.full_name as student_name
      FROM calendar_events e
      JOIN users up ON up.id = e.personal_id
      LEFT JOIN users us ON us.id = e.student_id
      WHERE e.id = $1
      LIMIT 1
    `,
    [id]
  )

  return success({ event })
})

// ============================================
// DELETE /calendar/events/:id
// ============================================
calendar.delete('/events/:id', requireType('personal', 'admin', 'super_admin'), async (c) => {
  await ensureCalendarSchema(c.env)

  const userId = c.get('userId')
  const userType = c.get('userType')
  const userRole = c.get('userRole')
  const id = c.req.param('id')

  const existing = await pgQueryOne<{ id: string; personal_id: string }>(
    c.env,
    'SELECT id, personal_id FROM calendar_events WHERE id = $1 LIMIT 1',
    [id]
  )
  if (!existing) throw new NotFoundError('Evento')

  const isAdmin = isAdminUser(userRole, userType)
  if (!isAdmin && existing.personal_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }

  await pgQuery(c.env, 'DELETE FROM calendar_events WHERE id = $1', [id])

  return noContent()
})

interface CalendarEventRow {
  id: string
  personal_id: string
  student_id: string | null
  title: string | null
  notes: string | null
  meeting_url: string | null
  start_at: string
  end_at: string
  color: string
  status: string | null
  recurrence_group_id: string | null
  recurrence_index: number | null
  created_at: string
  updated_at: string
  personal_name: string
  student_name: string | null
}

export { calendar as calendarRoutes }
