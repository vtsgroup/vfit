/**
 * src/components/navigation/bottom-navigation.tsx
 *
 * v5 — Bottom Navigation (B2C Student)
 *
 * 5 tabs: Treinos · Nutrição · IA (FAB center) · Avaliações · Perfil
 * EXACT same style as dashboard mobile-nav:
 * - mobile-bottom-nav CSS class + nav-premium glass
 * - Same SVG icon style (stroke inactive, filled active, opacity layers)
 * - Same FAB center (+) with fab-ring + fab-pulse
 * - Same Framer Motion active pill (layoutId)
 * - Same backdrop-blur-2xl backdrop-saturate-200
 */

'use client'

import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================
// Haptic feedback helper
// ============================================
function haptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(8)
  }
}

// ============================================
// PWA platform detection
// ============================================
type MobilePwaPlatform = 'ios' | 'android' | 'other'

function detectMobilePwaPlatform(): { standalone: boolean; platform: MobilePwaPlatform } {
  if (typeof window === 'undefined') {
    return { standalone: false, platform: 'other' }
  }
  const ua = window.navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isAndroid = /android/.test(ua)
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  return {
    standalone,
    platform: isIOS ? 'ios' : isAndroid ? 'android' : 'other',
  }
}

// ============================================
// Ultra-Premium Nav Icons — same style as dashboard mobile-nav.tsx
// 22×22, stroke inactive, solid fill active, opacity layers
// ============================================

function TreinosIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="1.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="19.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="4.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
        <rect x="15.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
        <rect x="8.5" y="10.5" width="7" height="3" rx="1.5" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="1.5" y="9.5" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="19.5" y="9.5" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4.5" y="7" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="15.5" y="7" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function NutricaoIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="4.5" fill="currentColor" />
        <path d="M3 18c0-3 3.5-4.5 9-4.5s9 1.5 9 4.5v2.5a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5V18z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="4.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 18c0-2.8 3.5-4 8.5-4s8.5 1.2 8.5 4v2a.5.5 0 01-.5.5h-16a.5.5 0 01-.5-.5V18z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function AvaliacoesIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M15 2H9a1 1 0 00-1 1v1H5a2 2 0 00-2 2v15a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 00-1-1z" fill="currentColor" />
        <path d="M8.5 13l2.5 2.5L16 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 2.5h6a.5.5 0 01.5.5v1.5h2.5A1.5 1.5 0 0119.5 6v15a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 21V6A1.5 1.5 0 016 4.5h2.5V3a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 13l2.5 2.5L16 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PerfilIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" fill="currentColor" />
        <path d="M3 18.5C3 15.5 7.5 14 12 14s9 1.5 9 4.5v2a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5v-2z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 18.5C3.5 15.5 7.5 14.5 12 14.5s8.5 1 8.5 4v1.5a.5.5 0 01-.5.5h-16a.5.5 0 01-.5-.5v-1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function AISparkleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Main 4-pointed star — refined proportions */}
      <path d="M12 2.5L13.6 8.8L20 10.5L13.6 12.2L12 18.5L10.4 12.2L4 10.5L10.4 8.8L12 2.5Z" fill="rgba(3,12,5,0.92)" />
      {/* Secondary sparkle — top right */}
      <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" fill="rgba(3,12,5,0.72)" />
      {/* Accent dot — bottom left */}
      <circle cx="6.5" cy="17.5" r="1.2" fill="rgba(3,12,5,0.46)" />
    </svg>
  )
}

// ============================================
// Tab definitions
// ============================================
interface Tab {
  id: string
  label: string
  href: string
  icon: (active: boolean) => ReactNode
  isFab?: boolean
}

const tabs: Tab[] = [
  {
    id: 'treinos',
    label: 'Treinos',
    href: '/treinos',
    icon: (active) => <TreinosIcon active={active} />,
  },
  {
    id: 'nutricao',
    label: 'Nutrição',
    href: '/nutricao',
    icon: (active) => <NutricaoIcon active={active} />,
  },
  {
    id: 'ia',
    label: 'IA',
    href: '/ia',
    isFab: true,
    icon: () => <AISparkleIcon />,
  },
  {
    id: 'avaliacoes',
    label: 'Avaliações',
    href: '/avaliacoes',
    icon: (active) => <AvaliacoesIcon active={active} />,
  },
  {
    id: 'perfil',
    label: 'Perfil',
    href: '/perfil',
    icon: (active) => <PerfilIcon active={active} />,
  },
]

// Routes where bottom nav should be hidden (full-screen experiences)
const HIDDEN_ROUTES = new Set(['/treino-ativo', '/welcome'])

// ============================================
// Component
// ============================================
interface BottomNavigationProps {
  /** Optional notification badge count on Perfil tab */
  notificationCount?: number
  /** FAB menu open state (controlled from parent) */
  fabMenuOpen?: boolean
  /** Callback to toggle FAB menu */
  onFabPress?: () => void
}

export function BottomNavigation({ notificationCount = 0, fabMenuOpen = false, onFabPress }: BottomNavigationProps) {
  const pathname = usePathname()
  const [pwaInfo, setPwaInfo] = useState<{ standalone: boolean; platform: MobilePwaPlatform }>({
    standalone: false,
    platform: 'other',
  })

  useEffect(() => {
    const update = () => setPwaInfo(detectMobilePwaPlatform())
    update()
    const mqStandalone = window.matchMedia('(display-mode: standalone)')
    const mqFullscreen = window.matchMedia('(display-mode: fullscreen)')
    mqStandalone.addEventListener('change', update)
    mqFullscreen.addEventListener('change', update)
    return () => {
      mqStandalone.removeEventListener('change', update)
      mqFullscreen.removeEventListener('change', update)
    }
  }, [])

  const pwaBottomExtraPx = useMemo(() => {
    if (!pwaInfo.standalone) return 0
    if (pwaInfo.platform === 'ios') return 34
    return 0
  }, [pwaInfo])

  const navBottomPadding = pwaBottomExtraPx > 0
    ? `max(env(safe-area-inset-bottom, 0px), ${pwaBottomExtraPx}px)`
    : `env(safe-area-inset-bottom, 0px)`

  // Hide on full-screen routes
  if (HIDDEN_ROUTES.has(pathname) || pathname.startsWith('/treino-ativo')) {
    return null
  }

  const isItemActive = (tab: Tab) => {
    if (tab.isFab) return pathname === tab.href || pathname.startsWith(`${tab.href}/`)
    return pathname === tab.href || pathname.startsWith(`${tab.href}/`)
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="mobile-bottom-nav fixed -bottom-px left-0 right-0 z-45 rounded-t-[28px] bg-bg-dark lg:hidden"
    >
      <div
        className="relative z-5 w-full overflow-visible rounded-t-[28px] backdrop-blur-2xl backdrop-saturate-200"
        style={{ paddingBottom: navBottomPadding }}
      >
        {/* Premium glass background */}
        <div className="nav-premium absolute inset-0 rounded-t-[28px]" />

        {/* PWA Standalone: solid fill for bottom safe area */}
        {pwaInfo.standalone && (
          <div
            className="absolute bottom-0 left-0 right-0 z-1"
            style={{
              height: navBottomPadding,
              backgroundColor: '#050A12',
            }}
          />
        )}

        {/* Tab items */}
        <div className="relative flex items-end justify-around px-1" style={{ height: 64, paddingBottom: 6 }}>
          {tabs.map((tab) => {
            const isActive = isItemActive(tab)

            // ===== FAB BUTTON — IA center =====
            if (tab.isFab) {
              return (
                <div
                  key={tab.id}
                  className="relative flex flex-col items-center"
                  style={{ marginTop: -22 }}
                >
                  <button
                    onClick={() => {
                      haptic()
                      onFabPress?.()
                    }}
                    className="fab-ring relative flex h-14 w-14 items-center justify-center rounded-full border-none transition-all duration-300 active:scale-90"
                    style={{
                      background: fabMenuOpen
                        ? 'linear-gradient(135deg, #16a34a, #15803d)'
                        : 'linear-gradient(135deg, #34d399, #22c55e 55%, #16a34a)',
                      boxShadow: fabMenuOpen
                        ? '0 10px 36px rgba(34, 197, 94, 0.55), 0 4px 14px rgba(34, 197, 94, 0.35), 0 0 0 1px rgba(255,255,255,0.16) inset'
                        : '0 10px 32px rgba(34, 197, 94, 0.5), 0 4px 12px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(255,255,255,0.18) inset',
                      animation: fabMenuOpen ? 'none' : 'fab-pulse 3.2s ease-in-out infinite',
                      cursor: 'pointer',
                    }}
                    aria-label={fabMenuOpen ? 'Fechar menu IA' : 'Abrir menu IA'}
                  >
                    <motion.div
                      animate={{ rotate: fabMenuOpen ? 45 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {tab.icon(false)}
                    </motion.div>
                  </button>
                  <span className="mt-1 text-[9px] font-semibold leading-none tracking-wide text-brand-primary">
                    {tab.label}
                  </span>
                </div>
              )
            }

            // ===== REGULAR TABS — Premium active indicator =====
            return (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={haptic}
                className="group relative flex min-w-10 flex-1 flex-col items-center active:scale-[0.88] transition-all duration-200"
              >
                <div className="relative flex h-9 w-9 items-center justify-center">
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-pill"
                      className="absolute inset-0 rounded-[14px] border border-brand-primary/20 bg-brand-primary/12 shadow-[0_0_20px_rgba(34,197,94,0.22)]"
                      initial={{ scale: 0.92, opacity: 0.7 }}
                      animate={{ scale: 1.05, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    />
                  )}
                  <div className={cn(
                    'relative z-10 transition-all duration-200',
                    isActive
                      ? 'text-brand-primary'
                      : 'text-slate-400 group-hover:text-slate-200'
                  )}>
                    {tab.icon(isActive)}
                  </div>
                </div>

                {/* Notification badge on Perfil */}
                {tab.id === 'perfil' && notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 24 }}
                    className="absolute -right-0.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </motion.span>
                )}

                <span className={cn(
                  'relative z-10 mt-0.5 text-[9px] leading-none tracking-[0.3px] transition-all duration-200',
                  isActive ? 'font-semibold text-brand-primary' : 'font-medium text-slate-400'
                )}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
