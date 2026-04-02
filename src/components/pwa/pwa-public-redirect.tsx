// ============================================
// pwa-public-redirect.tsx — Redirect public pages to browser when in PWA mode
// ============================================
//
// O que faz:
//   Detecta se o app está rodando em modo standalone (PWA instalada).
//   Se sim, redireciona automaticamente para /dashboard ao invés de exibir
//   páginas públicas (landing, blog, legal, etc.).
//   O PWA é para uso do app — páginas públicas devem abrir no navegador.
//
// Exports principais:
//   PWAPublicRedirect — client component que redireciona em PWA mode
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Paths allowed inside PWA standalone mode.
 * Everything else gets redirected to /dashboard.
 */
const PWA_ALLOWED_PATHS = [
  '/login',
  '/register',
  '/register/personal',
  '/register/student',
  '/reset-password',
  '/verify-email',
  '/dashboard',
]

function isPWAStandalone(): boolean {
  if (typeof window === 'undefined') return false

  // iOS: navigator.standalone
  if ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone) {
    return true
  }

  // Android/Desktop: display-mode: standalone
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }

  // TWA: document.referrer from android-app
  if (document.referrer.includes('android-app://')) {
    return true
  }

  return false
}

export function PWAPublicRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (!isPWAStandalone()) return

    const path = window.location.pathname

    // Check if current path is allowed in PWA
    const isAllowed = PWA_ALLOWED_PATHS.some(
      (allowed) => path === allowed || path.startsWith(allowed + '/')
    )

    if (!isAllowed) {
      // Detect user type to redirect students → /treinos, others → /dashboard
      let userType = ''
      try {
        const raw = localStorage.getItem('vfit-auth')
        if (raw) {
          const parsed = JSON.parse(raw)
          userType = parsed?.state?.user?.user_type || ''
        }
      } catch {}

      const home = userType === 'student' ? '/treinos' : '/dashboard'
      router.replace(home)
    }
  }, [router])

  return null
}
