/**
 * src/components/navigation/bottom-navigation.tsx
 *
 * v7 — Bottom Navigation "iOS Glass Dock" (B2C Student)
 *
 * Redesign 2026-07 (Claude Design): pivot carbono→iOS azul+verde. Barra flutuante
 * em vidro navy (blur 34px), 4 abas + célula IA central como FAB circular elevado
 * (verde radial, glow), hairline emerald, spring no tap. Comportamento preservado
 * da v6: FAB menu (fabMenuOpen/onFabPress), badge de notificações no Perfil, rotas
 * ocultas, padding extra em PWA standalone iOS e prop inline para preview.
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
// Ícones — glifos iOS (stroke inativo, fill ativo onde faz sentido)
// ============================================

function TreinosIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <rect x="1.5" y="9.5" width="3" height="5" rx="1" />
        <rect x="19.5" y="9.5" width="3" height="5" rx="1" />
        <rect x="4.5" y="7" width="4" height="10" rx="1.5" />
        <rect x="15.5" y="7" width="4" height="10" rx="1.5" />
        <rect x="8.5" y="10.5" width="7" height="3" rx="1.5" />
      </svg>
    )
  }
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="1.5" y="9.5" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="19.5" y="9.5" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4.5" y="7" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="15.5" y="7" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function NutricaoIcon({ active }: { active: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20.9c1.5 0 2.7 1.1 4 1.1 3 0 6-8 6-12.2A4.9 4.9 0 0 0 17 4.8c-1.5 0-2.7.7-5 .7s-3.5-.7-5-.7A4.9 4.9 0 0 0 2 9.8C2 14 5 22 8 22c1.3 0 2.5-1.1 4-1.1z" fill={active ? 'currentColor' : 'none'} />
      <path d="M10 2c1 .5 2 2 2 5" fill="none" />
    </svg>
  )
}

function AvaliacoesIcon({ active }: { active: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" aria-hidden>
      <path d="M9 2.5h6a.5.5 0 0 1 .5.5v1.5h2.5A1.5 1.5 0 0 1 19.5 6v15a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 21V6A1.5 1.5 0 0 1 6 4.5h2.5V3a.5.5 0 0 1 .5-.5z" fill={active ? 'currentColor' : 'none'} />
      <path d="M8.5 13l2.5 2.5L16 10" stroke={active ? '#0a1628' : 'currentColor'} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function PerfilIcon({ active }: { active: boolean }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="8" r="3.4" fill={active ? 'currentColor' : 'none'} />
      <path d="M3.8 19.2c.7-3 4-4.4 8.2-4.4s7.5 1.4 8.2 4.4a1 1 0 0 1-1 1.3H4.8a1 1 0 0 1-1-1.3z" fill={active ? 'currentColor' : 'none'} />
    </svg>
  )
}

function AISparkleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2.5L13.6 8.8L20 10.5L13.6 12.2L12 18.5L10.4 12.2L4 10.5L10.4 8.8L12 2.5Z" fill="#03210f" />
      <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" fill="#03210f" opacity=".75" />
      <circle cx="6.5" cy="17.5" r="1.2" fill="#03210f" opacity=".55" />
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
// Célula lateral do dock — tile iOS glass
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
      className={cn(
        'group relative flex flex-col items-center gap-[3px] py-0.5 transition-transform duration-150 active:scale-90',
        active ? 'text-brand-primary' : 'text-slate-400'
      )}
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)' }}
    >
      <span
        className={cn(
          'relative flex h-8 w-[42px] items-center justify-center rounded-[11px] transition-all duration-200',
          active && 'bg-brand-primary/12'
        )}
      >
        <span>{tab.icon(active)}</span>

        {typeof badge === 'number' && badge > 0 && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 24 }}
            className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
      </span>

      <span className={cn('text-[10px] leading-none tracking-[0.02em] whitespace-nowrap', active ? 'font-extrabold' : 'font-semibold')}>
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
    if (pwaInfo.platform === 'ios') return 24
    return 0
  }, [pwaInfo])

  const navBottomPadding = pwaBottomExtraPx > 0
    ? `max(calc(env(safe-area-inset-bottom, 0px) + 10px), ${pwaBottomExtraPx}px)`
    : `calc(env(safe-area-inset-bottom, 0px) + 10px)`

  // Hide on full-screen routes
  if (HIDDEN_ROUTES.has(pathname) || pathname.startsWith('/treino-ativo')) {
    return null
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <nav
      aria-label="Navegação principal"
      className={cn('lg:hidden flex justify-center', inline ? 'relative w-full px-3.5 py-2' : 'fixed inset-x-0 bottom-0 z-45 px-3.5')}
      style={inline ? { pointerEvents: 'auto' } : { paddingBottom: navBottomPadding, pointerEvents: 'none' }}
    >
      <div
        className="relative grid w-full max-w-[412px] grid-cols-5 items-end rounded-[32px] px-1.5 py-[9px]"
        style={{
          // Mesmas cores do dock do admin/personal: gradiente e sombra copiados
          // 1:1 de .nav-premium (globals.css) — nada de navy custom aqui.
          pointerEvents: 'auto',
          background: 'linear-gradient(180deg, rgba(8,47,73,0.9) 0%, rgba(7,38,66,0.92) 30%, rgba(6,25,43,0.97) 68%, rgba(5,10,18,0.995) 100%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 -6px 28px rgba(2,6,23,0.34), 0 -10px 38px -26px rgba(56,189,248,0.55), inset 0 1px 0 rgba(125,211,252,0.18)',
        }}
      >
        {/* Hairline + highlight radial */}
        <span className="pointer-events-none absolute inset-x-[38px] top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.55), transparent)' }} />
        <span className="pointer-events-none absolute inset-0 rounded-[32px]" style={{ background: 'radial-gradient(120% 90% at 18% 0%, rgba(255,255,255,0.12), transparent 45%)' }} />

        {LEFT_TABS.map((tab) => (
          <NavItem key={tab.id} tab={tab} active={isActive(tab.href)} />
        ))}

        {/* Célula IA — FAB circular elevado. Abre o menu FAB (comportamento preservado) */}
        <button
          onClick={() => {
            haptic()
            onFabPress?.()
          }}
          aria-label={fabMenuOpen ? 'Fechar menu IA' : 'Abrir menu IA'}
          className="fab-ring relative z-2 flex flex-col items-center gap-1 py-0.5 transition-transform duration-150 active:scale-[0.93]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', cursor: 'pointer', background: 'transparent', border: 'none', transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)' }}
        >
          {/* Mesmas cores do FAB "Novo" do admin/personal (linear-gradient verde + fab-pulse) */}
          <motion.span
            className="relative flex h-13 w-13 items-center justify-center rounded-full"
            style={{
              marginTop: '-20px',
              color: '#0a0f0a',
              background: fabMenuOpen
                ? 'linear-gradient(135deg, #2ae88d, #1cc770)'
                : 'linear-gradient(135deg, #3DFCA4, #28e08a)',
              boxShadow: fabMenuOpen
                ? '0 8px 32px rgba(61, 252, 164, 0.45), 0 4px 12px rgba(61, 252, 164, 0.25), 0 0 0 1px rgba(255,255,255,0.12) inset'
                : undefined,
              animation: fabMenuOpen ? 'none' : 'fab-pulse 3.2s ease-in-out infinite',
            }}
            animate={{ rotate: fabMenuOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <AISparkleIcon />
          </motion.span>
          <span className="text-[10px] font-semibold leading-none tracking-wide text-brand-primary">IA</span>
        </button>

        {RIGHT_TABS.map((tab) => (
          <NavItem
            key={tab.id}
            tab={tab}
            active={isActive(tab.href)}
            badge={tab.id === 'perfil' ? notificationCount : undefined}
          />
        ))}
      </div>
    </nav>
  )
}
