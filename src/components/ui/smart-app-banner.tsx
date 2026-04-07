/**
 * src/components/ui/smart-app-banner.tsx
 *
 * Smart App Banner — iOS/Android install banner
 * NÃO exibe em PWA/TWA (standalone mode)
 *
 * Exports: SmartAppBanner
 * Features: 'use client' · localStorage dismiss · platform detect
 */

// ============================================
// Smart App Banner — install prompt for mobile browsers
// Hidden when running as PWA (standalone) or TWA (android-app)
// ============================================

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'

const DISMISS_KEY = 'vfit_banner_dismissed'
const DISMISS_DAYS = 14 // Re-show after 14 days

// Routes where SmartAppBanner should NOT appear
const SUPPRESS_APP_BANNER_ROUTES = [
  '/welcome',
  '/register',
  '/register/student',
  '/register/personal',
  '/onboarding',
  '/reset-password',
  '/verify-email',
  '/auth',
  '/login',
]

function shouldSuppressAppBanner(pathname: string): boolean {
  return SUPPRESS_APP_BANNER_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

// Play Store URL (TWA package: br.app.vfit)
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=br.app.vfit'
// Website URL como fallback
const WEBSITE_URL = 'https://vfit.app.br'

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // PWA standalone
  if (window.matchMedia?.('(display-mode: standalone)')?.matches) return true
  // iOS standalone (Safari Add to Home Screen)
  if ((navigator as unknown as { standalone?: boolean }).standalone) return true
  // TWA (Android)
  if (document.referrer.includes('android-app://')) return true
  return false
}

function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isDismissed(): boolean {
  if (typeof window === 'undefined') return false
  const dismissed = localStorage.getItem(DISMISS_KEY)
  if (!dismissed) return false
  const dismissedAt = parseInt(dismissed, 10)
  const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
  return daysSince < DISMISS_DAYS
}

export function SmartAppBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if on suppressed route (early exit)
    if (typeof window !== 'undefined' && shouldSuppressAppBanner(window.location.pathname)) {
      return
    }

    // Delay to avoid layout shift on initial render
    const timer = setTimeout(() => {
      if (!isStandalone() && isMobile() && !isDismissed()) {
        setVisible(true)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setVisible(false)
  }

  const handleOpen = () => {
    if (isIOS()) {
      // iOS — sem App Store, abre o site (PWA install prompt)
      window.location.href = WEBSITE_URL
    } else {
      // Android — Play Store
      window.location.href = PLAY_STORE_URL
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-9999 animate-slide-up" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center gap-3 bg-white dark:bg-[#111B2E] border-t border-zinc-200 dark:border-white/8 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.15)]">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Fechar banner"
        >
          <DSIcon name="x" size={16} />
        </button>

        {/* App icon */}
        <div className="shrink-0 h-11 w-11 rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-white/10">
          <Image
            src="/icons/apple-touch-icon.png"
            alt="VFIT"
            width={44}
            height={44}
            className="h-full w-full object-cover"
          />
        </div>

        {/* App info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-zinc-900 dark:text-white leading-tight truncate">
            VFIT
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight truncate">
            Treinos com IA
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">
            {isIOS() ? 'Adicionar à Tela de Início' : 'Google Play — Grátis'}
          </p>
        </div>

        {/* CTA button */}
        <button
          onClick={handleOpen}
          className="shrink-0 rounded-full bg-brand-primary px-4 py-1.5 text-[12px] font-bold text-white uppercase tracking-wide transition-all active:scale-95 hover:bg-brand-primary/90"
        >
          {isIOS() ? 'ABRIR' : 'INSTALAR'}
        </button>
      </div>
    </div>
  )
}
