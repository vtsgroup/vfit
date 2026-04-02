/**
 * src/lib/wake-lock.ts
 *
 * Wake Lock API — impede a tela de dormir durante treino ativo.
 * Graceful fallback para navegadores sem suporte.
 */

let wakeLock: WakeLockSentinel | null = null

export async function requestWakeLock(): Promise<boolean> {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
      wakeLock.addEventListener('release', () => {
        wakeLock = null
      })
      return true
    }
  } catch (err) {
    console.warn('[WakeLock] Failed to acquire:', err)
  }
  return false
}

export async function releaseWakeLock(): Promise<void> {
  try {
    if (wakeLock) {
      await wakeLock.release()
      wakeLock = null
    }
  } catch (err) {
    console.warn('[WakeLock] Failed to release:', err)
  }
}

export function isWakeLockActive(): boolean {
  return wakeLock !== null && !wakeLock.released
}
