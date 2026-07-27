/**
 * src/components/navigation/bottom-navigation.tsx
 *
 * v8 — Bottom Navigation "Edge-to-Edge Dock" (B2C Student)
 *
 * Redesign 2026-07 (Claude Design): removida a barra flutuante (pill com margem
 * e cantos 100% arredondados). Agora estrutura idêntica ao dock do admin/personal
 * (.nav-premium full-bleed, cantos só no topo, encostada nas laterais e embaixo),
 * com ícones e paleta próprios do aluno. Comportamento preservado: FAB menu
 * (fabMenuOpen/onFabPress), badge de notificações no Perfil, rotas ocultas,
 * padding extra em PWA standalone iOS e prop inline para preview.
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
// Ícones — glifos ultra-modernos (stroke uniforme 1.75, cantos arredondados)
// ============================================

function TreinosIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 11v2M22 11v2M5.5 8v8M18.5 8v8M8 12h8"
        stroke="currentColor"
        strokeWidth={active ? 2.25 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3.6" y="9.4" width="3.2" height="5.2" rx="1.6" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.16 : 0} />
      <rect x="17.2" y="9.4" width="3.2" height="5.2" rx="1.6" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.16 : 0} />
    </svg>
  )
}

function NutricaoIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21c-4.2 0-8-5.6-8-10.4C4 6.9 6.6 4.5 9.5 4.5c1.1 0 1.9.4 2.5.9.6-.5 1.4-.9 2.5-.9 2.9 0 5.5 2.4 5.5 6.1 0 4.8-3.8 10.4-8 10.4z"
        stroke="currentColor"
        strokeWidth={active ? 2.15 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.16 : 0}
      />
      <path d="M12 5.4V3.2c0-.6.5-1.1 1.2-1.4" stroke="currentColor" strokeWidth={active ? 2.15 : 1.75} strokeLinecap="round" fill="none" />
    </svg>
  )
}

function AvaliacoesIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4.5" y="3.5" width="15" height="17" rx="3.2"
        stroke="currentColor"
        strokeWidth={active ? 2.15 : 1.75}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.16 : 0}
      />
      <path d="M9 2.4h6a1 1 0 0 1 1 1V5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3.4a1 1 0 0 1 1-1z" fill="currentColor" opacity={active ? 1 : 0.9} />
      <path d="M8.2 12.6l2.3 2.3 5-5" stroke={active ? '#0a1628' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function PerfilIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="7.6" r="3.6" stroke="currentColor" strokeWidth={active ? 2.15 : 1.75} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.16 : 0} />
      <path
        d="M4.2 19.4c.9-3.4 4.2-5 7.8-5s6.9 1.6 7.8 5a1.1 1.1 0 0 1-1.1 1.4H5.3a1.1 1.1 0 0 1-1.1-1.4z"
        stroke="currentColor"
        strokeWidth={active ? 2.15 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.16 : 0}
      />
    </svg>
  )
}

function AISparkleIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2L13.9 8.4L20.2 10.3L13.9 12.2L12 18.6L10.1 12.2L3.8 10.3L10.1 8.4L12 2Z" fill="#03210f" />
      <path d="M18.5 2.6L19.2 4.9L21.5 5.6L19.2 6.3L18.5 8.6L17.8 6.3L15.5 5.6L17.8 4.9L18.5 2.6Z" fill="#03210f" opacity=".7" />
      <circle cx="5.6" cy="18" r="1.3" fill="#03210f" opacity=".5" />
    </svg>
  )
}

// ============================================
// Tabs
// ============================================
interface SideTab {
  id: string
  label: string
  href: string
  icon: (active: boolean) => ReactNode
}

const LEFT_TABS: SideTab[] = [
  { id: 'treinos', label: 'Treinos', href: '/treinos', icon: (a) => <TreinosIcon active={a} /> },
  { id: 'nutricao', label: 'Nutrição', href: '/nutricao', icon: (a) => <NutricaoIcon active={a} /> },
]
const RIGHT_TABS: SideTab[] = [
  { id: 'avaliacoes', label: 'Avaliações', href: '/avaliacoes', icon: (a) => <AvaliacoesIcon active={a} /> },
  { id: 'perfil', label: 'Perfil', href: '/perfil', icon: (a) => <PerfilIcon active={a} /> },
]

// Routes where bottom nav should be hidden (full-screen experiences)
const HIDDEN_ROUTES = new Set(['/treino-ativo', '/welcome'])

// ============================================
// Tab regular — mesmo padrão visual do dock admin/personal (pill spring + h-9 w-9)
// ============================================
function NavItem({
  tab,
  active,
  badge,
}: {
  tab: SideTab
  active: boolean
  badge?: number
}) {
  return (
    <Link
      href={tab.href}
      prefetch={true}
      onClick={haptic}
      aria-current={active ? 'page' : undefined}
      className="group relative flex min-w-10 flex-1 flex-col items-center active:scale-[0.88] transition-all duration-200"
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="relative flex h-9 w-9 items-center justify-center">
        {active && (
          <motion.div
            layoutId="student-nav-active-pill"
            className="absolute inset-0 rounded-[14px] bg-brand-primary/12"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <div className={cn('relative z-10 transition-all duration-200', active ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-200')}>
          {tab.icon(active)}
        </div>

        {typeof badge === 'number' && badge > 0 && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 24 }}
            className="absolute -right-1.5 -top-1 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
      </div>

      <span className={cn('relative z-10 mt-0.5 text-[9px] leading-none tracking-[0.3px] transition-all duration-200', active ? 'font-semibold text-brand-primary' : 'font-medium text-slate-400')}>
        {tab.label}
      </span>
    </Link>
  )
}

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
  /** Render relativo (showroom/preview) em vez de fixed */
  inline?: boolean
}

export function BottomNavigation({ notificationCount = 0, fabMenuOpen = false, onFabPress, inline = false }: BottomNavigationProps) {
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

  // Mesma fórmula do dock admin/personal: env() puro, sem +10px extra — encosta na borda.
  const navBottomPadding = pwaBottomExtraPx > 0
    ? `max(env(safe-area-inset-bottom, 0px), ${pwaBottomExtraPx}px)`
    : `env(safe-area-inset-bottom, 0px)`

  // Hide on full-screen routes
  if (HIDDEN_ROUTES.has(pathname) || pathname.startsWith('/treino-ativo')) {
    return null
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        'lg:hidden',
        inline ? 'relative w-full rounded-t-[28px]' : 'mobile-bottom-nav fixed -bottom-px left-0 right-0 z-45 rounded-t-[28px] bg-bg-dark'
      )}
    >
      {/* Nav card — full width, cantos só no topo, sem margem lateral (encosta nas bordas) */}
      <div
        className="relative z-5 w-full overflow-visible rounded-t-[28px] backdrop-blur-2xl backdrop-saturate-200"
        style={{ paddingBottom: inline ? undefined : navBottomPadding }}
      >
        {/* Mesmas cores do dock do admin/personal — classe .nav-premium 1:1 */}
        <div className="nav-premium pointer-events-none absolute inset-0 rounded-t-[28px]" />
        <span className="pointer-events-none absolute inset-x-[38px] top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.55), transparent)' }} />

        {/* PWA Standalone: fill sólido no safe-area — evita costura vidro→solid */}
        {!inline && pwaInfo.standalone && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-1"
            style={{ height: navBottomPadding, backgroundColor: '#050A12' }}
          />
        )}

        {/* Tab items — encostado nas laterais, mesma altura/padding do dock admin */}
        <div className="relative flex items-end justify-around px-1" style={{ height: 64, paddingBottom: 6 }}>
          {LEFT_TABS.map((tab) => (
            <NavItem key={tab.id} tab={tab} active={isActive(tab.href)} />
          ))}

          {/* Célula IA — FAB circular elevado. Abre o menu FAB (comportamento preservado) */}
          <div className="relative flex flex-col items-center" style={{ marginTop: -20 }}>
            <button
              onClick={() => {
                haptic()
                onFabPress?.()
              }}
              aria-label={fabMenuOpen ? 'Fechar menu IA' : 'Abrir menu IA'}
              className="fab-ring relative flex h-13 w-13 items-center justify-center rounded-full border-none transition-all duration-300 active:scale-90"
              style={{
                color: '#0a0f0a',
                background: fabMenuOpen
                  ? 'linear-gradient(135deg, #2ae88d, #1cc770)'
                  : 'linear-gradient(135deg, #3DFCA4, #28e08a)',
                boxShadow: fabMenuOpen
                  ? '0 8px 32px rgba(61, 252, 164, 0.45), 0 4px 12px rgba(61, 252, 164, 0.25), 0 0 0 1px rgba(255,255,255,0.12) inset'
                  : undefined,
                animation: fabMenuOpen ? 'none' : 'fab-pulse 3.2s ease-in-out infinite',
                cursor: 'pointer',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <motion.div animate={{ rotate: fabMenuOpen ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <AISparkleIcon />
              </motion.div>
            </button>
            <span className="mt-0.5 text-[9px] font-semibold leading-none tracking-wide text-brand-primary">IA</span>
          </div>

          {RIGHT_TABS.map((tab) => (
            <NavItem
              key={tab.id}
              tab={tab}
              active={isActive(tab.href)}
              badge={tab.id === 'perfil' ? notificationCount : undefined}
            />
          ))}
        </div>
      </div>
    </nav>
  )
}
