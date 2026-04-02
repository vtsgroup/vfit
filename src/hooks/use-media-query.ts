/**
 * src/hooks/use-media-query.ts
 *
 * useMediaQuery — responsive hook
 *
 * Exports: useMediaQuery, useIsMobile, useIsDesktop
 * Hooks: useMediaQuery, useEffect, useState, useIsMobile, useIsDesktop
 * Features: 'use client'
 */

// ============================================
// useMediaQuery — responsive hook
// ============================================

'use client'

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 1023px)')
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
