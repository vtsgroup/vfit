// ============================================
// use-platform.ts — Detecção de ambiente de execução (TWA/PWA/browser)
// ============================================
//
// O que faz:
//   Detecta se o app está rodando como TWA (Android app), PWA instalado
//   ou browser convencional. Útil para condicionar UX e paddings nativos.
//
// Exports principais:
//   usePlatform() → 'twa' | 'pwa' | 'browser'
//
// Hooks usados: useState, useEffect
// ============================================

'use client'

import { useEffect, useState } from 'react'

type Platform = 'twa' | 'pwa' | 'browser'

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>('browser')

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isTWA =
      isStandalone &&
      (document.referrer.startsWith('android-app://') ||
        new URLSearchParams(window.location.search).get('utm_source') === 'twa')

    if (isTWA) setPlatform('twa')
    else if (isStandalone) setPlatform('pwa')
    else setPlatform('browser')
  }, [])

  return platform
}
