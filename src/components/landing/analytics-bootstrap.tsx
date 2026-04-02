// ============================================
// analytics-bootstrap.tsx — Bootstrap de analytics da landing page
// ============================================
//
// O que faz:
//   Componente cliente que dispara trackLandingPageViewOnce() no mount.
//   Garante que o pageview seja registrado apenas uma vez por sessão.
//   Renderiza null — sem UI.
//
// Exports principais:
//   LandingAnalyticsBootstrap — bootstrap de analytics (renderiza null)
'use client'

import { useEffect } from 'react'
import { trackLandingPageViewOnce } from '@/lib/landing-analytics'

export function LandingAnalyticsBootstrap() {
  useEffect(() => {
    trackLandingPageViewOnce()
  }, [])

  return null
}
