// ============================================
// notification-preferences.ts — CRUD de preferências de notificação
// ============================================
//
// O que faz:
//   Busca, cria ou atualiza preferências de notificação por usuário com upsert.
//   Defaults: tudo habilitado, quiet hours 22h–8h (America/Sao_Paulo).
//   Trata graciosamente tabela/coluna ausente (migration não aplicada).
//
// Exports principais:
//   getOrCreateNotificationPreferences(env, userId) → NotificationPreferences
//   updateNotificationPreferences(env, userId, patch) → NotificationPreferences
//   mapNotificationTypeToPreferenceKey(type) → keyof NotificationPreferences | null
//   NotificationPreferences, NotificationPreferenceUpdate — interfaces
//
// DB: notification_preferences (Neon PostgreSQL)
// ============================================
import { generateId, pgQueryOne, pgQuery } from '@lib/db'
import type { Bindings } from '@workers/types'

export interface NotificationPreferences {
  id: string
  user_id: string
  in_app_enabled: boolean
  push_enabled: boolean
  email_enabled: boolean
  workout_enabled: boolean
  payment_enabled: boolean
  student_enabled: boolean
  assessment_enabled: boolean
  calendar_enabled: boolean
  calendar_reminder_24h_enabled: boolean
  calendar_reminder_1h_enabled: boolean
  calendar_reminder_15m_enabled: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start_hour: number
  quiet_hours_end_hour: number
  timezone: string
  marketing_enabled: boolean
  created_at: string
  updated_at: string
}

export interface NotificationPreferenceUpdate {
  in_app_enabled?: boolean
  push_enabled?: boolean
  email_enabled?: boolean
  workout_enabled?: boolean
  payment_enabled?: boolean
  student_enabled?: boolean
  assessment_enabled?: boolean
  calendar_enabled?: boolean
  calendar_reminder_24h_enabled?: boolean
  calendar_reminder_1h_enabled?: boolean
  calendar_reminder_15m_enabled?: boolean
  quiet_hours_enabled?: boolean
  quiet_hours_start_hour?: number
  quiet_hours_end_hour?: number
  timezone?: string
  marketing_enabled?: boolean
}

function buildDefaultPreferences(userId: string): NotificationPreferences {
  const now = new Date().toISOString()
  return {
    id: `fallback-${userId}`,
    user_id: userId,
    in_app_enabled: true,
    push_enabled: true,
    email_enabled: true,
    workout_enabled: true,
    payment_enabled: true,
    student_enabled: true,
    assessment_enabled: true,
    calendar_enabled: true,
    calendar_reminder_24h_enabled: true,
    calendar_reminder_1h_enabled: true,
    calendar_reminder_15m_enabled: false,
    quiet_hours_enabled: true,
    quiet_hours_start_hour: 22,
    quiet_hours_end_hour: 8,
    timezone: 'America/Sao_Paulo',
    marketing_enabled: false,
    created_at: now,
    updated_at: now,
  }
}

function isMissingPreferencesTableError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  // table missing OR new column missing before migration applied
  if (message.includes('notification_preferences') && message.includes('does not exist')) return true
  if (message.includes('calendar_enabled') && message.includes('does not exist')) return true
  if (message.includes('calendar_reminder_24h_enabled') && message.includes('does not exist')) return true
  if (message.includes('calendar_reminder_1h_enabled') && message.includes('does not exist')) return true
  if (message.includes('calendar_reminder_15m_enabled') && message.includes('does not exist')) return true
  if (message.includes('quiet_hours_enabled') && message.includes('does not exist')) return true
  if (message.includes('quiet_hours_start_hour') && message.includes('does not exist')) return true
  if (message.includes('quiet_hours_end_hour') && message.includes('does not exist')) return true
  if (message.includes('timezone') && message.includes('does not exist')) return true
  return false
}

export function mapNotificationTypeToPreferenceKey(type: string): keyof NotificationPreferences | null {
  if (type === 'workout') return 'workout_enabled'
  if (type === 'payment' || type === 'subscription') return 'payment_enabled'
  if (type === 'student') return 'student_enabled'
  if (type === 'assessment') return 'assessment_enabled'
  if (type === 'calendar') return 'calendar_enabled'
  if (type === 'marketing') return 'marketing_enabled'
  return null
}

export async function getOrCreateNotificationPreferences(
  env: Bindings,
  userId: string
): Promise<NotificationPreferences> {
  let existing: NotificationPreferences | null = null
  try {
    existing = await pgQueryOne<NotificationPreferences>(
      env,
      'SELECT * FROM notification_preferences WHERE user_id = $1 LIMIT 1',
      [userId]
    )
  } catch (err) {
    if (isMissingPreferencesTableError(err)) {
      return buildDefaultPreferences(userId)
    }
    throw err
  }

  if (existing) return existing

  const id = generateId()
  try {
    await pgQuery(
      env,
      `INSERT INTO notification_preferences (
        id, user_id, in_app_enabled, push_enabled, email_enabled,
        workout_enabled, payment_enabled, student_enabled, assessment_enabled,
        calendar_enabled, calendar_reminder_24h_enabled, calendar_reminder_1h_enabled, calendar_reminder_15m_enabled,
        quiet_hours_enabled, quiet_hours_start_hour, quiet_hours_end_hour, timezone,
        marketing_enabled,
        created_at, updated_at
      ) VALUES ($1, $2,
        true, true, true,
        true, true, true, true,
        true, true, true, false,
        true, 22, 8, 'America/Sao_Paulo',
        false,
        $3, $3
      )
      ON CONFLICT (user_id) DO NOTHING`,
      [id, userId, new Date().toISOString()]
    )
  } catch (err) {
    if (isMissingPreferencesTableError(err)) {
      return buildDefaultPreferences(userId)
    }
    throw err
  }

  let created: NotificationPreferences | null = null
  try {
    created = await pgQueryOne<NotificationPreferences>(
      env,
      'SELECT * FROM notification_preferences WHERE user_id = $1 LIMIT 1',
      [userId]
    )
  } catch (err) {
    if (isMissingPreferencesTableError(err)) {
      return buildDefaultPreferences(userId)
    }
    throw err
  }

  if (!created) {
    throw new Error('Falha ao criar preferências de notificação')
  }

  return created
}

export async function updateNotificationPreferences(
  env: Bindings,
  userId: string,
  patch: NotificationPreferenceUpdate
): Promise<NotificationPreferences> {
  const current = await getOrCreateNotificationPreferences(env, userId)

  const fields = Object.entries(patch).filter(([key, value]) => {
    if (typeof value === 'boolean') return true
    if ((key === 'quiet_hours_start_hour' || key === 'quiet_hours_end_hour') && typeof value === 'number') {
      return value >= 0 && value <= 23
    }
    if (key === 'timezone' && typeof value === 'string' && value.trim().length > 0) return true
    return false
  })
  if (fields.length === 0) {
    return current
  }

  if (current.id.startsWith('fallback-')) {
    return {
      ...current,
      ...patch,
      updated_at: new Date().toISOString(),
    }
  }

  const now = new Date().toISOString()
  const setClauses = fields.map(([key], idx) => `${key} = $${idx + 1}`).join(', ')
  const values = fields.map(([, value]) => value)

  try {
    await pgQuery(
      env,
      `UPDATE notification_preferences
       SET ${setClauses}, updated_at = $${fields.length + 1}
       WHERE user_id = $${fields.length + 2}`,
      [...values, now, userId]
    )
  } catch (err) {
    if (isMissingPreferencesTableError(err)) {
      return {
        ...current,
        ...patch,
        updated_at: now,
      }
    }
    throw err
  }

  return getOrCreateNotificationPreferences(env, userId)
}
