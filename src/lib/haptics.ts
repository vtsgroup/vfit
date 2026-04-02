/**
 * src/lib/haptics.ts
 *
 * Haptic Feedback Utilities
 *
 * Exports: hapticLight, hapticMedium, hapticHeavy, hapticSuccess
 */

// ============================================
// Haptic Feedback Utilities
// Provides tactile feedback on mobile devices
// Safe no-op on unsupported platforms
// ============================================

/**
 * Light haptic — for toggles, checkboxes, minor interactions
 */
export function hapticLight() {
  try {
    navigator?.vibrate?.(10)
  } catch {
    // Silent fail on unsupported platforms
  }
}

/**
 * Medium haptic — for button presses, selections
 */
export function hapticMedium() {
  try {
    navigator?.vibrate?.(20)
  } catch {
    // Silent fail
  }
}

/**
 * Heavy haptic — for destructive actions, confirmations, swipe complete
 */
export function hapticHeavy() {
  try {
    navigator?.vibrate?.([10, 30, 10])
  } catch {
    // Silent fail
  }
}

/**
 * Success haptic — for task completion, payment confirmed
 */
export function hapticSuccess() {
  try {
    navigator?.vibrate?.([10, 50, 20])
  } catch {
    // Silent fail
  }
}
