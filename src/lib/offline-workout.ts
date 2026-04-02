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
  workout_id: string
  duration_minutes?: number
  feeling?: string
  student_notes?: string
  exercises_completed?: unknown[]
}): Promise<boolean> {
  try {
    // Try SW message first
    await swMessage({ type: 'QUEUE_OFFLINE_COMPLETION', payload })

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
    // Fallback: store in localStorage
    try {
      const key = 'vfit:offline-completions'
      // Migrate legacy key
      const legacyKey = 'personaliai:offline-completions'
      const legacyData = localStorage.getItem(legacyKey)
      if (legacyData && !localStorage.getItem(key)) {
        localStorage.setItem(key, legacyData)
        localStorage.removeItem(legacyKey)
      }
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.push({ ...payload, queued_at: new Date().toISOString() })
      localStorage.setItem(key, JSON.stringify(existing))
      return true
    } catch {
      return false
    }
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
  const key = 'vfit:offline-completions'
  // Migrate legacy key
  const legacyKey = 'personaliai:offline-completions'
  const legacyData = localStorage.getItem(legacyKey)
  if (legacyData && !localStorage.getItem(key)) {
    localStorage.setItem(key, legacyData)
    localStorage.removeItem(legacyKey)
  }
  const raw = localStorage.getItem(key)
  if (!raw) return 0

  try {
    const queue = JSON.parse(raw) as Array<{ workout_id: string; [k: string]: unknown }>
    if (queue.length === 0) return 0

    const failed: typeof queue = []
    let synced = 0

    for (const item of queue) {
      try {
        await apiPost(`/workouts/${item.workout_id}/complete`, item)
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
