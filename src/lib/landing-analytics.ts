/**
 * src/lib/landing-analytics.ts
 *
 * Landing Analytics — Funil de aquisição (GA4/dataLayer)
 *
 * Exports: persistUtmContextFromCurrentUrl, trackLandingEvent, trackLandingPageViewOnce
 * Features: 'use client'
 */

// ============================================
// Landing Analytics — Funil de aquisição (GA4/dataLayer)
// ============================================

'use client'

type LandingEventName =
  | 'lp_view'
  | 'lp_cta_primary_click'
  | 'lp_cta_secondary_click'
  | 'lp_pricing_view'
  | 'lp_how_it_works_view'
  | 'lp_register_start'
  | 'lp_register_complete'
  | 'cta_click'
  | 'plan_click'
  | 'pricing_toggle'
  | 'how_it_works_tab'
  | 'signup_start'

type EventParams = Record<string, string | number | boolean | null | undefined>

interface UtmContext {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  landing_path?: string
  first_seen_at?: string
}

const UTM_STORAGE_KEY = 'pia_utm_context_v1'
const LP_VIEW_SESSION_KEY = 'pia_lp_view_tracked'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function cleanParams(params: EventParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  ) as Record<string, string | number | boolean>
}

function readStoredUtmContext(): UtmContext {
  if (!isBrowser()) return {}
  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UtmContext) : {}
  } catch {
    return {}
  }
}

function writeStoredUtmContext(ctx: UtmContext): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(ctx))
  } catch {
    // ignore storage failures
  }
}

export function persistUtmContextFromCurrentUrl(): UtmContext {
  if (!isBrowser()) return {}

  const url = new URL(window.location.href)
  const incoming: UtmContext = {
    utm_source: url.searchParams.get('utm_source') || undefined,
    utm_medium: url.searchParams.get('utm_medium') || undefined,
    utm_campaign: url.searchParams.get('utm_campaign') || undefined,
    utm_content: url.searchParams.get('utm_content') || undefined,
    utm_term: url.searchParams.get('utm_term') || undefined,
  }

  const existing = readStoredUtmContext()

  const merged: UtmContext = {
    ...existing,
    ...Object.fromEntries(Object.entries(incoming).filter(([, v]) => !!v)),
    landing_path: existing.landing_path || window.location.pathname,
    first_seen_at: existing.first_seen_at || new Date().toISOString(),
  }

  writeStoredUtmContext(merged)
  return merged
}

export function trackLandingEvent(event: LandingEventName, params: EventParams = {}): void {
  if (!isBrowser()) return

  const utm = readStoredUtmContext()
  const payload = cleanParams({
    ...utm,
    ...params,
    page_path: window.location.pathname,
  })

  try {
    ;(window as Window & { dataLayer?: unknown[] }).dataLayer =
      (window as Window & { dataLayer?: unknown[] }).dataLayer || []
    ;(window as Window & { dataLayer?: unknown[] }).dataLayer?.push({
      event,
      ...payload,
    })

    const gtag = (window as Window & {
      gtag?: (command: string, name: string, data?: Record<string, unknown>) => void
    }).gtag

    if (typeof gtag === 'function') {
      gtag('event', event, payload)

      // Eventos base para dashboard unificado (MVP-SEO Sprint 00)
      if (event === 'lp_cta_primary_click' || event === 'lp_cta_secondary_click') {
        gtag('event', 'cta_click', cleanParams({
          cta_location: params.placement,
          cta_text: params.cta,
          page_path: window.location.pathname,
        }))
      }

      if (event === 'lp_register_start') {
        gtag('event', 'signup_start', cleanParams({
          source_page: window.location.pathname,
          placement: params.placement,
          plan: params.plan,
        }))
      }
    }
  } catch {
    // best-effort analytics
  }
}

export function trackLandingPageViewOnce(): void {
  if (!isBrowser()) return

  const pageKey = `${LP_VIEW_SESSION_KEY}:${window.location.pathname}`
  if (sessionStorage.getItem(pageKey) === '1') return

  persistUtmContextFromCurrentUrl()
  trackLandingEvent('lp_view', { section: 'home' })
  sessionStorage.setItem(pageKey, '1')
}
