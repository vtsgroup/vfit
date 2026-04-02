/**
 * workers/api/notifications.ts
 *
 * notifications.ts — Notificações in-app e preferências
 * Features: DB: Neon
 */

// ============================================
// notifications.ts — Notificações in-app e preferências
// ============================================
//
// O que faz:
//   Gestão de notificações in-app: listagem paginada, contagem de não lidas,
//   marcar como lida (individual ou em lote), remoção e CRUD de preferências
//   por categoria (workout, payment, student, assessment, marketing, etc.).
//
// Exports principais:
//   notificationsRoutes — Hono app montado em /api/v1/notifications
//
// Auth: requireAuth em todas as rotas
// DB: notifications, notification_preferences
// ============================================

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { listNotificationsQuerySchema } from '@workers/schemas/assessments'
import { pgQuery } from '@lib/db'
import { getOrCreateNotificationPreferences, updateNotificationPreferences } from '@lib/notification-preferences'
import { success, noContent } from '@lib/response'

const notifications = new Hono<AppContext>()

notifications.use('*', authMiddleware)

async function ensureNotificationPreferencesColumns(env: AppContext['Bindings']) {
  // Best-effort: keep endpoints working even if migrations weren't applied yet.
  try {
    await pgQuery(
      env,
      `ALTER TABLE notification_preferences
        ADD COLUMN IF NOT EXISTS calendar_enabled BOOLEAN NOT NULL DEFAULT TRUE;`,
      []
    )
    await pgQuery(
      env,
      `ALTER TABLE notification_preferences
        ADD COLUMN IF NOT EXISTS calendar_reminder_24h_enabled BOOLEAN NOT NULL DEFAULT TRUE;`,
      []
    )
    await pgQuery(
      env,
      `ALTER TABLE notification_preferences
        ADD COLUMN IF NOT EXISTS calendar_reminder_1h_enabled BOOLEAN NOT NULL DEFAULT TRUE;`,
      []
    )
    await pgQuery(
      env,
      `ALTER TABLE notification_preferences
        ADD COLUMN IF NOT EXISTS calendar_reminder_15m_enabled BOOLEAN NOT NULL DEFAULT FALSE;`,
      []
    )
    await pgQuery(
      env,
      `ALTER TABLE notification_preferences
        ADD COLUMN IF NOT EXISTS quiet_hours_enabled BOOLEAN NOT NULL DEFAULT TRUE;`,
      []
    )
    await pgQuery(
      env,
      `ALTER TABLE notification_preferences
        ADD COLUMN IF NOT EXISTS quiet_hours_start_hour INTEGER NOT NULL DEFAULT 22;`,
      []
    )
    await pgQuery(
      env,
      `ALTER TABLE notification_preferences
        ADD COLUMN IF NOT EXISTS quiet_hours_end_hour INTEGER NOT NULL DEFAULT 8;`,
      []
    )
    await pgQuery(
      env,
      `ALTER TABLE notification_preferences
        ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo';`,
      []
    )

    await pgQuery(
      env,
      `CREATE INDEX IF NOT EXISTS idx_notification_preferences_calendar
        ON notification_preferences(user_id, calendar_enabled);`,
      []
    )
    await pgQuery(
      env,
      `CREATE INDEX IF NOT EXISTS idx_notification_preferences_calendar_windows
        ON notification_preferences(user_id, calendar_enabled, calendar_reminder_24h_enabled, calendar_reminder_1h_enabled, calendar_reminder_15m_enabled);`,
      []
    )
  } catch {
    // ignore
  }
}

// ============================================
// GET /notifications — Listar notificações
// ============================================
notifications.get('/', async (c) => {
  const userId = c.get('userId')
  const url = new URL(c.req.url)

  const query = listNotificationsQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    type: url.searchParams.get('type') || undefined,
    unread_only: url.searchParams.get('unread_only') || undefined,
  })

  const offset = (query.page - 1) * query.per_page
  const conditions: string[] = ['n.user_id = $1']
  const params: unknown[] = [userId]
  let idx = 2

  if (query.type) {
    conditions.push(`n.type = $${idx}`)
    params.push(query.type)
    idx++
  }

  if (query.unread_only) {
    conditions.push('n.read_at IS NULL')
  }

  const where = conditions.join(' AND ')

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM notifications n WHERE ${where}`,
    params
  )
  const total = countRows[0]?.count ?? 0

  const { rows } = await pgQuery<NotificationRow>(
    c.env,
    `SELECT id, type, title, message, link, read_at, sent_via, created_at
     FROM notifications n
     WHERE ${where}
     ORDER BY n.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, query.per_page, offset]
  )

  return success({
    notifications: rows,
    meta: { page: query.page, per_page: query.per_page, total, total_pages: Math.ceil(total / query.per_page) },
  })
})

// ============================================
// GET /notifications/unread-count — Contagem não lidas
// ============================================
notifications.get('/unread-count', async (c) => {
  const userId = c.get('userId')

  const { rows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
    [userId]
  )

  return success({ unread_count: rows[0]?.count ?? 0 })
})

// ============================================
// GET /notifications/preferences — Preferências
// ============================================
notifications.get('/preferences', async (c) => {
  const userId = c.get('userId')
  await ensureNotificationPreferencesColumns(c.env)
  const preferences = await getOrCreateNotificationPreferences(c.env, userId)
  return success({
    preferences: {
      ...preferences,
      calendar_enabled: (preferences as unknown as Record<string, unknown>)['calendar_enabled'] === undefined
        ? true
        : Boolean((preferences as unknown as Record<string, unknown>)['calendar_enabled']),
      calendar_reminder_24h_enabled: (preferences as unknown as Record<string, unknown>)['calendar_reminder_24h_enabled'] === undefined
        ? true
        : Boolean((preferences as unknown as Record<string, unknown>)['calendar_reminder_24h_enabled']),
      calendar_reminder_1h_enabled: (preferences as unknown as Record<string, unknown>)['calendar_reminder_1h_enabled'] === undefined
        ? true
        : Boolean((preferences as unknown as Record<string, unknown>)['calendar_reminder_1h_enabled']),
      calendar_reminder_15m_enabled: (preferences as unknown as Record<string, unknown>)['calendar_reminder_15m_enabled'] === undefined
        ? false
        : Boolean((preferences as unknown as Record<string, unknown>)['calendar_reminder_15m_enabled']),
      quiet_hours_enabled: (preferences as unknown as Record<string, unknown>)['quiet_hours_enabled'] === undefined
        ? true
        : Boolean((preferences as unknown as Record<string, unknown>)['quiet_hours_enabled']),
      quiet_hours_start_hour: Number((preferences as unknown as Record<string, unknown>)['quiet_hours_start_hour'] ?? 22),
      quiet_hours_end_hour: Number((preferences as unknown as Record<string, unknown>)['quiet_hours_end_hour'] ?? 8),
      timezone: String((preferences as unknown as Record<string, unknown>)['timezone'] ?? 'America/Sao_Paulo'),
    },
  })
})

// ============================================
// PATCH /notifications/preferences — Atualizar preferências
// ============================================
notifications.patch('/preferences', async (c) => {
  const userId = c.get('userId')
  await ensureNotificationPreferencesColumns(c.env)
  const body = await c.req.json<Record<string, unknown>>()

  const allowedKeys = [
    'in_app_enabled',
    'push_enabled',
    'email_enabled',
    'workout_enabled',
    'payment_enabled',
    'student_enabled',
    'assessment_enabled',
    'calendar_enabled',
    'calendar_reminder_24h_enabled',
    'calendar_reminder_1h_enabled',
    'calendar_reminder_15m_enabled',
    'quiet_hours_enabled',
    'quiet_hours_start_hour',
    'quiet_hours_end_hour',
    'timezone',
    'marketing_enabled',
  ] as const

  const patch: Record<string, boolean | number | string> = {}
  for (const key of allowedKeys) {
    const value = body[key]
    if (typeof value === 'boolean') {
      patch[key] = value
    } else if ((key === 'quiet_hours_start_hour' || key === 'quiet_hours_end_hour') && typeof value === 'number') {
      patch[key] = Math.min(23, Math.max(0, Math.trunc(value)))
    } else if (key === 'timezone' && typeof value === 'string' && value.trim().length > 0) {
      patch[key] = value.trim()
    }
  }

  const preferences = await updateNotificationPreferences(c.env, userId, patch)
  return success({ message: 'Preferências atualizadas', preferences })
})

// ============================================
// PATCH /notifications/read-all — Marcar todas como lidas
// ============================================
notifications.patch('/read-all', async (c) => {
  const userId = c.get('userId')
  const now = new Date().toISOString()

  await pgQuery(c.env,
    'UPDATE notifications SET read_at = $1 WHERE user_id = $2 AND read_at IS NULL',
    [now, userId]
  )

  return success({ message: 'Todas notificações marcadas como lidas' })
})

// ============================================
// DELETE /notifications/clear — Limpar lidas
// ============================================
notifications.delete('/clear', async (c) => {
  const userId = c.get('userId')

  await pgQuery(c.env,
    'DELETE FROM notifications WHERE user_id = $1 AND read_at IS NOT NULL',
    [userId]
  )

  return noContent()
})

// ============================================
// PATCH /notifications/:id/read — Marcar como lida
// ============================================
notifications.patch('/:id/read', async (c) => {
  const userId = c.get('userId')
  const notificationId = c.req.param('id')

  const now = new Date().toISOString()
  await pgQuery(c.env,
    'UPDATE notifications SET read_at = $1 WHERE id = $2 AND user_id = $3',
    [now, notificationId, userId]
  )

  return success({ message: 'Notificação marcada como lida' })
})

// ============================================
// DELETE /notifications/:id — Remover notificação
// ============================================
notifications.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const notificationId = c.req.param('id')

  await pgQuery(c.env, 'DELETE FROM notifications WHERE id = $1 AND user_id = $2', [notificationId, userId])

  return noContent()
})

interface NotificationRow {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read_at: string | null
  sent_via: string[]
  created_at: string
}

export { notifications as notificationsRoutes }
