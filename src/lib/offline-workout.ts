/**
 * src/lib/offline-workout.ts
 *
 * Offline Workout Support — S08-08
 *
 * Exports: isOnline
 */

// ============================================
// Offline Workout Support — S08-08
// Pre-cache workout data + queue completions for sync
// ============================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface OfflineWorkoutCompletionPayload {
  client_completion_id: string
  plan_id: string
  plan_day_id: string
  day_number: number
  started_at: string
  duration_seconds: number
  exercises: Array<{
    exercise_id: string | null
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
}

/**
 * Send a message to the Service Worker and wait for a response
 */
function swMessage(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      reject(new Error('No SW controller'))
      return
    }

    const channel = new MessageChannel()
    channel.port1.onmessage = (event) => {
      if (event.data?.ok) {
        resolve(event.data)
      } else {
        reject(new Error('SW message failed'))
      }
    }

    navigator.serviceWorker.controller.postMessage(data, [channel.port2])

    // Timeout after 10s
    setTimeout(() => reject(new Error('SW timeout')), 10_000)
  })
}

function migrateLegacyCompletionQueue() {
  const key = 'vfit:offline-completions'
  const legacyKey = 'personaliai:offline-completions'
  const legacyData = localStorage.getItem(legacyKey)
  if (legacyData && !localStorage.getItem(key)) {
    localStorage.setItem(key, legacyData)
    localStorage.removeItem(legacyKey)
  }
  return key
}

function storeLocalCompletion(payload: Record<string, unknown>): boolean {
  try {
    const key = migrateLegacyCompletionQueue()
    const existing = JSON.parse(localStorage.getItem(key) || '[]') as Array<Record<string, unknown>>
    const completionId = payload.client_completion_id
    const next = { ...payload, queued_at: new Date().toISOString() }
    const deduped = completionId
      ? existing.filter((item) => item.client_completion_id !== completionId)
      : existing
    deduped.push(next)
    localStorage.setItem(key, JSON.stringify(deduped))
    return true
  } catch {
    return false
  }
}

/**
 * Pre-cache a workout for offline execution
 */
export async function cacheWorkoutForOffline(workoutId: string): Promise<boolean> {
  try {
    await swMessage({
      type: 'CACHE_WORKOUT',
      workoutId,
      apiBase: API_BASE,
    })
    return true
  } catch {
    console.warn('[Offline] Failed to cache workout:', workoutId)
    return false
  }
}

/**
 * Queue a workout completion for background sync
 */
export async function queueOfflineCompletion(payload: {
  client_completion_id?: string
  workout_id?: string
  plan_id?: string
  plan_day_id?: string
  day_number?: number
  started_at?: string
  duration_seconds?: number
  duration_minutes?: number
  feeling?: string
  student_notes?: string
  exercises?: unknown[]
  exercises_completed?: unknown[]
}): Promise<boolean> {
  const localQueued = storeLocalCompletion(payload as Record<string, unknown>)

  try {
    // Try SW message first
    await swMessage({ type: 'QUEUE_OFFLINE_COMPLETION', payload: { ...payload, api_base: API_BASE } })

    // Register background sync if supported
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      if ('sync' in reg) {
        await (reg as unknown as { sync: { register: (tag: string) => Promise<void> } })
          .sync.register('sync-workout-completions')
      }
    }

    return true
  } catch {
    return localQueued
  }
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

/**
 * Replay any localStorage-queued completions when back online
 */
export async function replayLocalCompletions(apiPost: (url: string, body: unknown) => Promise<unknown>): Promise<number> {
  const key = migrateLegacyCompletionQueue()
  const raw = localStorage.getItem(key)
  if (!raw) return 0

  try {
    const queue = JSON.parse(raw) as Array<{ workout_id?: string; plan_id?: string; [k: string]: unknown }>
    if (queue.length === 0) return 0

    const failed: typeof queue = []
    let synced = 0

    for (const item of queue) {
      try {
        const endpoint = item.plan_id ? '/workouts/b2c/complete' : `/workouts/${item.workout_id}/complete`
        await apiPost(endpoint, item)
        synced++
      } catch {
        failed.push(item)
      }
    }

    if (failed.length > 0) {
      localStorage.setItem(key, JSON.stringify(failed))
    } else {
      localStorage.removeItem(key)
    }

    return synced
  } catch {
    return 0
  }
}
