/**
 * src/components/providers/theme-provider.tsx
 *
 * Theme Provider — syncs app-store theme with <html> class
 *
 * Exports: ThemeProvider
 * Features: 'use client'
 *
 * Dashboard/app: respeita light/dark/system do app-store (settings)
 * Páginas públicas: não força light/dark; usa tokens CSS base existentes
 */

// ============================================
// Theme Provider — syncs Zustand theme → DOM
// ============================================

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/stores/app-store'

const STUDENT_LIGHT_ROUTES = [
  '/treinos',
  '/treino-ativo',
  '/plano',
  '/nutricao',
  '/ia',
  '/avaliacoes',
  '/perfil',
  '/progresso',
  '/exercicios',
  '/musculos',
  '/social',
]

const PUBLIC_UNTHEMED_ROUTES = [
  '/',
  '/afiliados',
  '/app-personal-trainer',
  '/blog',
  '/carreiras',
  '/contato',
  '/cookies',
  '/excluir-conta',
  '/guest',
  '/lgpd',
  '/nutricionistas',
  '/p',
  '/pricing',
  '/privacidade',
  '/sobre',
  '/status',
  '/termos',
]

function isStudentLightRoute(pathname: string | null) {
  if (!pathname) return false
  return STUDENT_LIGHT_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function isPublicUnthemedRoute(pathname: string | null) {
  if (!pathname) return false
  return PUBLIC_UNTHEMED_ROUTES.some((route) => pathname === route || (route !== '/' && pathname.startsWith(`${route}/`)))
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const resolvedTheme = useAppStore((s) => s.resolvedTheme)
  const theme = useAppStore((s) => s.theme)
  const setResolvedTheme = useAppStore((s) => s.setResolvedTheme)
  const isOnboardingRoute = pathname === '/welcome' || pathname.startsWith('/onboarding')
  const isB2CStudentRoute = isStudentLightRoute(pathname)
  const isPublicRouteWithoutForcedTheme = isPublicUnthemedRoute(pathname)
  const effectiveTheme: 'light' | 'dark' = isOnboardingRoute ? 'dark' : isB2CStudentRoute ? 'light' : resolvedTheme

  // Resolve theme deterministically from current preference + OS
  useEffect(() => {
    const nextResolved: 'light' | 'dark' = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : theme

    if (nextResolved !== resolvedTheme) {
      setResolvedTheme(nextResolved)
    }
  }, [theme, resolvedTheme, setResolvedTheme])

  // Sync resolved theme → <html> class + colorScheme + meta theme-color (TWA/PWA)
  useEffect(() => {
    const root = document.documentElement

    if (isPublicRouteWithoutForcedTheme) {
      root.classList.remove('light', 'dark', 'theme-switching')
      root.style.removeProperty('color-scheme')
      root.style.removeProperty('background-color')
      return
    }

    root.classList.add('theme-switching')

    if (effectiveTheme === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
      root.style.colorScheme = 'light'
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    }

    // Update <meta name="theme-color"> dynamically — Chrome TWA/PWA picks this up
    // for status bar color in real-time. App é dark-only para status bar — sempre #050A12.
    const topColor = '#050A12'
    // Bottom safe area (gesture bar / nav bar) — também dark sempre
    const bottomColor = effectiveTheme === 'light' ? '#f7fbfa' : '#050A12'

    // CRITICAL: Set html background-color to fill bottom safe area (iOS gesture bar / Android nav bar)
    root.style.backgroundColor = bottomColor

    let meta = document.querySelector('meta[name="theme-color"]:not([media])') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = topColor

    // Also update media-specific meta tags if they exist
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"][media]').forEach((el) => {
      el.content = topColor
    })

    const rafId = window.requestAnimationFrame(() => {
      root.classList.remove('theme-switching')
    })

    return () => {
      window.cancelAnimationFrame(rafId)
      root.classList.remove('theme-switching')
    }
  }, [effectiveTheme, isPublicRouteWithoutForcedTheme])

  // Listen for OS color scheme changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setResolvedTheme(mql.matches ? 'dark' : 'light')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [theme, setResolvedTheme])

  return <>{children}</>
}
