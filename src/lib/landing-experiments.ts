// ============================================
// landing-experiments.ts — utilitários de A/B testing (landing)
// ============================================

'use client'

import { trackLandingEvent } from '@/lib/landing-analytics'

export type ExperimentVariant = 'A' | 'B'

const EXP_STORAGE_PREFIX = 'pia_exp_variant:'
const EXP_VIEW_PREFIX = 'pia_exp_view_tracked:'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function getOverrideVariant(experimentId: string): ExperimentVariant | null {
  if (!isBrowser()) return null

  try {
    const url = new URL(window.location.href)
    const value = (url.searchParams.get(`exp_${experimentId}`) || '').toUpperCase()
    if (value === 'A' || value === 'B') return value
    return null
  } catch {
    return null
  }
}

export function getExperimentVariant(experimentId: string): ExperimentVariant {
  if (!isBrowser()) return 'A'

  const override = getOverrideVariant(experimentId)
  if (override) return override

  const key = `${EXP_STORAGE_PREFIX}${experimentId}`

  try {
    const stored = localStorage.getItem(key)
    if (stored === 'A' || stored === 'B') return stored

    const assigned: ExperimentVariant = Math.random() < 0.5 ? 'A' : 'B'
    localStorage.setItem(key, assigned)
    return assigned
  } catch {
    return 'A'
  }
}

export function trackExperimentViewOnce(experimentId: string, variant: ExperimentVariant): void {
  if (!isBrowser()) return

  const sessionKey = `${EXP_VIEW_PREFIX}${experimentId}:${variant}:${window.location.pathname}`

  if (sessionStorage.getItem(sessionKey) === '1') return

  trackLandingEvent('lp_experiment_view', {
    experiment_id: experimentId,
    experiment_variant: variant,
    page_path: window.location.pathname,
  })

  sessionStorage.setItem(sessionKey, '1')
}
