/**
 * lib/onesignal.ts
 *
 * OneSignal Push Notification Helper
 *
 * Exports: PushPayload, PushCategory, SendPushOptions
 * Features: DB: Neon
 */

// ============================================
// OneSignal Push Notification Helper
// REST API v1 — https://documentation.onesignal.com/reference
// ============================================

import { pgQuery, generateId } from '@lib/db'
import { mapNotificationTypeToPreferenceKey, getOrCreateNotificationPreferences } from '@lib/notification-preferences'
import { resolveNotificationEvent } from '@lib/notification-events'
import type { Bindings } from '@workers/types'

const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1'

// ── Types ────────────────────────────────────────

export interface PushPayload {
  title: string
  message: string
  url?: string
  icon?: string
  data?: Record<string, string>
}

export type PushCategory = 'workout' | 'payment' | 'motivational' | 'system'

export interface SendPushOptions {
  /** Send to specific user by external_id (our user.id) */
  userId?: string
  /** Send to multiple users */
  userIds?: string[]
  /** Send to a segment (e.g., "personal", "student") */
  segment?: string
  /** Filter by tags */
  filters?: Array<{
    field: 'tag'
    key: string
    relation: '=' | '!=' | '>' | '<' | 'exists' | 'not_exists'
    value?: string
  }>
  /** Categoriza push para analytics/segmentação */
  category?: PushCategory
  /** Agendamento em ISO-8601 UTC */
  sendAfter?: string
}

interface OneSignalResponse {
  id?: string
  recipients?: number
  errors?: unknown
}

// ── Core Send Function ────────────────────────────

export async function sendPush(
  env: { ONESIGNAL_APP_ID: string; ONESIGNAL_REST_KEY: string },
  payload: PushPayload,
  options: SendPushOptions
): Promise<{ success: boolean; notification_id?: string; recipients?: number }> {
  try {
    if (!env.ONESIGNAL_REST_KEY) {
      console.warn('[OneSignal] REST_KEY not configured, skipping push')
      return { success: false }
    }

    const body: Record<string, unknown> = {
      app_id: env.ONESIGNAL_APP_ID,
      headings: { en: payload.title },
      contents: { en: payload.message },
      ...(payload.url && { url: payload.url }),
      ...(payload.icon && { chrome_web_icon: payload.icon }),
      ...(payload.data && { data: payload.data }),
      ...(options.category && { data: { ...(payload.data || {}), category: options.category } }),
      ...(options.sendAfter && { send_after: options.sendAfter }),
    }

    // Target: specific user(s) by external_id
    if (options.userId) {
      body.include_aliases = { external_id: [options.userId] }
      body.target_channel = 'push'
    } else if (options.userIds && options.userIds.length > 0) {
      body.include_aliases = { external_id: options.userIds }
      body.target_channel = 'push'
    } else if (options.segment) {
      body.included_segments = [options.segment]
    } else if (options.filters) {
      body.filters = options.filters
    } else {
      console.warn('[OneSignal] No target specified, skipping push')
      return { success: false }
    }

    const response = await fetch(`${ONESIGNAL_API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${env.ONESIGNAL_REST_KEY}`,
      },
      body: JSON.stringify(body),
    })

    const result = (await response.json()) as OneSignalResponse

    if (!response.ok) {
      console.error('[OneSignal] Send failed:', result)
      return { success: false }
    }

    console.log('[OneSignal] Push sent:', result.id, 'recipients:', result.recipients)
    return {
      success: true,
      notification_id: result.id,
      recipients: result.recipients,
    }
  } catch (err) {
    console.error('[OneSignal] Send error:', err)
    return { success: false }
  }
}

// ── High-Level Notify Function ─────────────────────
// Sends push AND creates in-app notification record

export async function notify(
  env: Bindings,
  userId: string,
  notification: {
    type: string
    title: string
    message: string
    link?: string
  }
): Promise<void> {
  const id = generateId()
  const now = new Date().toISOString()
  const sentVia: string[] = []

  const preferences = await getOrCreateNotificationPreferences(env, userId).catch(() => null)
  const typePrefKey = mapNotificationTypeToPreferenceKey(notification.type)
  const typeEnabled = !preferences || !typePrefKey
    ? true
    : (preferences as unknown as Record<string, unknown>)[typePrefKey] === undefined
      ? true
      : Boolean((preferences as unknown as Record<string, unknown>)[typePrefKey])

  const canSendInApp = typeEnabled && (preferences ? preferences.in_app_enabled : true)
  const canSendPush = typeEnabled && (preferences ? preferences.push_enabled : true)

  const timezone = preferences?.timezone || 'America/Sao_Paulo'
  const quietEnabled = preferences ? preferences.quiet_hours_enabled : true
  const quietStart = preferences ? preferences.quiet_hours_start_hour : 22
  const quietEnd = preferences ? preferences.quiet_hours_end_hour : 8
  const isQuietTime = quietEnabled && isWithinQuietHours(new Date(), timezone, quietStart, quietEnd)

  if (!canSendInApp && !canSendPush) {
    return
  }

  // 1. Create in-app notification record
  if (canSendInApp) {
    sentVia.push('in_app')
    try {
      await pgQuery(
        env,
        `INSERT INTO notifications (id, user_id, type, title, message, link, sent_via, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, userId, notification.type, notification.title, notification.message, notification.link || null, `{${sentVia.join(',')}}`, now]
      )
    } catch (err) {
      console.error('[Notify] DB insert error:', err)
    }
  }

  // 2. Send push notification (best-effort, don't throw)
  const category = inferCategory(notification.type)
  const pushResult = canSendPush && !isQuietTime
    ? await sendPush(
      env,
      {
        title: notification.title,
        message: notification.message,
        url: notification.link
          ? `https://vfit.app.br${notification.link}`
          : undefined,
      },
      { userId, category }
    )
    : { success: false }

  // 3. Update sent_via if push was successful
  if (pushResult.success) {
    sentVia.push('push')
    try {
      await pgQuery(
        env,
        `UPDATE notifications SET sent_via = $1 WHERE id = $2`,
        [`{${sentVia.join(',')}}`, id]
      )
    } catch {
      // non-critical
    }
  }
}

// ── Event-based notify (padronizado) ─────────────────

export async function notifyEvent(
  env: Bindings,
  userId: string,
  type: Parameters<typeof resolveNotificationEvent>[0],
  input: Parameters<typeof resolveNotificationEvent>[1]
): Promise<void> {
  const event = resolveNotificationEvent(type, input)
  await notify(env, userId, {
    type: event.domainType,
    title: event.title,
    message: event.message,
    link: event.link,
  })
}

// ── Convenience Functions ──────────────────────────

/** Notify student about new workout */
export async function notifyNewWorkout(
  env: Parameters<typeof notify>[0],
  studentUserId: string,
  workoutName: string
) {
  await notifyEvent(env as Bindings, studentUserId, 'workout.new', { workoutName })
}

/** Notify personal about payment received */
export async function notifyPaymentReceived(
  env: Parameters<typeof notify>[0],
  personalUserId: string,
  studentName: string,
  amount: number
) {
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  await notifyEvent(env as Bindings, personalUserId, 'payment.received', { studentName, amount: formatted })
}

/** Notify student about overdue payment */
export async function notifyPaymentOverdue(
  env: Parameters<typeof notify>[0],
  studentUserId: string,
  amount: number
) {
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  await notifyEvent(env as Bindings, studentUserId, 'payment.overdue', { amount: formatted })
}

/** Notify personal about new student */
export async function notifyNewStudent(
  env: Parameters<typeof notify>[0],
  personalUserId: string,
  studentName: string
) {
  await notifyEvent(env as Bindings, personalUserId, 'student.new', { studentName })
}

/** Notify personal about new assessment completed by student */
export async function notifyAssessmentCompleted(
  env: Parameters<typeof notify>[0],
  personalUserId: string,
  studentName: string
) {
  await notifyEvent(env as Bindings, personalUserId, 'assessment.completed', { studentName })
}

export async function notifyUsersBatch(
  env: Parameters<typeof sendPush>[0],
  userIds: string[],
  payload: PushPayload,
  options?: { category?: PushCategory; sendAfter?: string }
) {
  if (!userIds.length) return { success: false }
  return sendPush(env, payload, {
    userIds,
    category: options?.category,
    sendAfter: options?.sendAfter,
  })
}

function inferCategory(type: string): PushCategory {
  const t = type.toLowerCase()
  if (t.includes('workout')) return 'workout'
  if (t.includes('payment') || t.includes('subscription')) return 'payment'
  if (t.includes('motivation') || t.includes('xp')) return 'motivational'
  return 'system'
}

function isWithinQuietHours(date: Date, timezone: string, startHour: number, endHour: number): boolean {
  const hour = getHourInTimezone(date, timezone)
  if (startHour === endHour) return false
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour
  }
  return hour >= startHour || hour < endHour
}

function getHourInTimezone(date: Date, timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    }).formatToParts(date)

    const hourPart = parts.find((part) => part.type === 'hour')?.value
    const parsed = Number(hourPart)
    if (Number.isFinite(parsed)) return parsed
  } catch {
    // fallback abaixo
  }
  return date.getHours()
}

/** Notify about trial expiring soon */
export async function notifyTrialExpiring(
  env: Parameters<typeof notify>[0],
  personalUserId: string,
  daysLeft: number
) {
  const event = resolveNotificationEvent('trial.expiring', { daysLeft })
  await notify(env, personalUserId, {
    type: event.domainType,
    title: event.title,
    message: event.message,
    link: event.link,
  })
}
