/**
 * lib/calendar-reminders.ts
 *
 * Calendar Reminders — Cron job / manual trigger
 *
 * Exports: CalendarReminderRunResult
 * Features: DB: Neon
 */

// ============================================
// Calendar Reminders — Cron job / manual trigger
// Sends in-app + push reminders for upcoming calendar events
// ============================================

import type { Bindings } from '@workers/types'
import { pgQuery } from '@lib/db'
import { notifyEvent } from '@lib/onesignal'
import { getOrCreateNotificationPreferences, type NotificationPreferences } from '@lib/notification-preferences'

export interface CalendarReminderRunResult {
  checked: number
  sent: number
  deduped: number
  errors: number
}

type CalendarEventRow = {
  id: string
  personal_id: string
  student_id: string | null
  title: string | null
  start_at: string
  personal_name: string
  student_name: string | null
}

function dedupeKey(eventId: string, minutesBefore: number) {
  return `cal:rem:${eventId}:${minutesBefore}`
}

async function wasSent(env: Bindings, key: string): Promise<boolean> {
  try {
    const v = await env.KV_CACHE.get(key)
    return Boolean(v)
  } catch {
    return false
  }
}

async function markSent(env: Bindings, key: string): Promise<void> {
  try {
    // Keep for 7 days to avoid duplicates.
    await env.KV_CACHE.put(key, '1', { expirationTtl: 7 * 24 * 60 * 60 })
  } catch {
    // ignore
  }
}

function minutesToLabel(minutesBefore: number) {
  if (minutesBefore === 60) return '1 hora'
  if (minutesBefore === 1440) return '24 horas'
  if (minutesBefore % 60 === 0) return `${minutesBefore / 60} horas`
  return `${minutesBefore} min`
}

export async function dispatchCalendarReminders(
  env: Bindings,
  opts?: {
    windowsMinutes?: number[]
    toleranceMinutes?: number
    now?: Date
  }
): Promise<CalendarReminderRunResult> {
  const windowsMinutes = opts?.windowsMinutes?.length ? opts.windowsMinutes : [1440, 60, 15]
  const tolerance = typeof opts?.toleranceMinutes === 'number' ? opts.toleranceMinutes : 10
  const now = opts?.now || new Date()

  let checked = 0
  let sent = 0
  let deduped = 0
  let errors = 0

  const prefCache = new Map<string, NotificationPreferences | null>()

  async function getPrefs(userId: string): Promise<NotificationPreferences | null> {
    if (prefCache.has(userId)) return prefCache.get(userId) || null
    const p = await getOrCreateNotificationPreferences(env, userId).catch(() => null)
    prefCache.set(userId, p)
    return p
  }

  function windowEnabled(p: NotificationPreferences | null, minutesBefore: number): boolean {
    if (!p) return true

    const rec = p as unknown as Record<string, unknown>

    // Global calendar toggle
    const calEnabled = rec['calendar_enabled'] === undefined ? true : Boolean(rec['calendar_enabled'])
    if (!calEnabled) return false

    if (minutesBefore === 1440) {
      return rec['calendar_reminder_24h_enabled'] === undefined ? true : Boolean(rec['calendar_reminder_24h_enabled'])
    }
    if (minutesBefore === 60) {
      return rec['calendar_reminder_1h_enabled'] === undefined ? true : Boolean(rec['calendar_reminder_1h_enabled'])
    }
    if (minutesBefore === 15) {
      return rec['calendar_reminder_15m_enabled'] === undefined ? false : Boolean(rec['calendar_reminder_15m_enabled'])
    }

    // Unknown window → default on
    return true
  }

  for (const minutesBefore of windowsMinutes) {
    const start = new Date(now.getTime() + (minutesBefore - tolerance) * 60_000)
    const end = new Date(now.getTime() + (minutesBefore + tolerance) * 60_000)

    let rows: CalendarEventRow[] = []
    try {
      const res = await pgQuery<CalendarEventRow>(
        env,
        `SELECT
          e.id,
          e.personal_id,
          e.student_id,
          e.title,
          e.start_at,
          pu.full_name as personal_name,
          su.full_name as student_name
        FROM calendar_events e
        JOIN users pu ON pu.id = e.personal_id
        LEFT JOIN users su ON su.id = e.student_id
        WHERE e.start_at >= $1 AND e.start_at < $2
        ORDER BY e.start_at ASC`,
        [start.toISOString(), end.toISOString()]
      )
      rows = res.rows
    } catch (err) {
      console.error('[CalendarReminders] Query error:', err)
      errors++
      continue
    }

    for (const e of rows) {
      checked++

      const key = dedupeKey(e.id, minutesBefore)
      if (await wasSent(env, key)) {
        deduped++
        continue
      }

      const title = (e.title || '').trim() || (e.student_name ? 'Sessão' : 'Bloqueio')
      const when = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(e.start_at))

      let attempted = false

      // Personal reminder
      const personalPrefs = await getPrefs(e.personal_id)
      if (windowEnabled(personalPrefs, minutesBefore)) {
        attempted = true
        try {
          await notifyEvent(env, e.personal_id, 'calendar.reminder', {
            minutesLeft: minutesBefore,
            leadLabel: minutesToLabel(minutesBefore),
            title,
            when,
            counterpartName: e.student_name || 'agenda',
            role: 'personal',
          })
          sent++
        } catch (err) {
          console.error('[CalendarReminders] Notify personal error:', err)
          errors++
        }
      }

      // Student reminder (if linked)
      if (e.student_id) {
        const studentPrefs = await getPrefs(e.student_id)
        if (windowEnabled(studentPrefs, minutesBefore)) {
          attempted = true
          try {
            await notifyEvent(env, e.student_id, 'calendar.reminder', {
              minutesLeft: minutesBefore,
              leadLabel: minutesToLabel(minutesBefore),
              title,
              when,
              counterpartName: e.personal_name,
              role: 'student',
            })
            sent++
          } catch (err) {
            console.error('[CalendarReminders] Notify student error:', err)
            errors++
          }
        }
      }

      if (attempted) {
        await markSent(env, key)
      }
    }
  }

  return { checked, sent, deduped, errors }
}
