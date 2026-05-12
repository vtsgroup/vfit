/**
 * src/lib/wake-lock.ts
 *
 * Wake Lock API — impede a tela de dormir durante treino ativo.
 * Graceful fallback para navegadores sem suporte.
 */

let wakeLock: WakeLockSentinel | null = null

export async function requestWakeLock(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined') return false
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
      wakeLock.addEventListener('release', () => {
        wakeLock = null
      })
      return true
    }
  } catch {
    // Best-effort only: browsers may block Wake Lock outside a direct user gesture.
  }
  return false
}

export async function releaseWakeLock(): Promise<void> {
  try {
    if (wakeLock) {
      await wakeLock.release()
      wakeLock = null
    }
  } catch {
    // Best-effort only.
  }
}

export function isWakeLockActive(): boolean {
  return wakeLock !== null && !wakeLock.released
}
