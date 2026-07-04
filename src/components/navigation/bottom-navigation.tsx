/**
 * src/components/navigation/bottom-navigation.tsx
 *
 * v6 — Bottom Navigation "Dock Flutuante" (B2C Student)
 *
 * Visual escolhido pelo dono no workshop Fase 2 (Experiência 1000):
 * dock carbono descolado das bordas, chanfros de 14px, fibra 3px (mesma
 * escala do hero/header), hairline emerald e célula IA emerald 3D integrada
 * ao dock (sem transbordar). Comportamento preservado da v5: FAB menu
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
// Ícones — mesmos glifos da v5 (stroke inativo, fill ativo)
// ============================================

function TreinosIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="1.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="19.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="4.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
        <rect x="15.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
        <rect x="8.5" y="10.5" width="7" height="3" rx="1.5" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="9" r="4.5" fill="currentColor" />
        <path d="M3 18c0-3 3.5-4.5 9-4.5s9 1.5 9 4.5v2.5a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5V18z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="9" r="4.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 18c0-2.8 3.5-4 8.5-4s8.5 1.2 8.5 4v2a.5.5 0 01-.5.5h-16a.5.5 0 01-.5-.5V18z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function AvaliacoesIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M15 2H9a1 1 0 00-1 1v1H5a2 2 0 00-2 2v15a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 00-1-1z" fill="currentColor" />
        <path d="M8.5 13l2.5 2.5L16 10" stroke="#0a0e14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 2.5h6a.5.5 0 01.5.5v1.5h2.5A1.5 1.5 0 0119.5 6v15a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 21V6A1.5 1.5 0 016 4.5h2.5V3a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 13l2.5 2.5L16 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PerfilIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="3.5" fill="currentColor" />
        <path d="M3 18.5C3 15.5 7.5 14 12 14s9 1.5 9 4.5v2a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5v-2z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 18.5C3.5 15.5 7.5 14.5 12 14.5s8.5 1 8.5 4v1.5a.5.5 0 01-.5.5h-16a.5.5 0 01-.5-.5v-1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function AISparkleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2.5L13.6 8.8L20 10.5L13.6 12.2L12 18.5L10.4 12.2L4 10.5L10.4 8.8L12 2.5Z" fill="rgba(3,12,5,0.92)" />
      <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" fill="rgba(3,12,5,0.72)" />
      <circle cx="6.5" cy="17.5" r="1.2" fill="rgba(3,12,5,0.46)" />
    </svg>
  )
}

// ============================================
// Geometria do dock (linguagem carbono)
// ============================================
const CHAMFER_DOCK =
  'polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)'
const CHAMFER_CELL =
  'polygon(7px 0, calc(100% - 7px) 0, 100% 7px, 100% calc(100% - 7px), calc(100% - 7px) 100%, 7px 100%, 0 calc(100% - 7px), 0 7px)'
const CHAMFER_IA =
  'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)'
const CARBON = [
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)',
].join(', ')

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
// Célula lateral do dock
// ============================================
function DockCell({
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
      className="group relative flex min-h-13 flex-1 flex-col items-center justify-center gap-1 transition-transform duration-150 active:translate-y-px active:scale-95"
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', clipPath: CHAMFER_CELL }}
    >
      {active && (
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath: CHAMFER_CELL,
            background:
              'linear-gradient(180deg, rgba(52,211,153,0.16) 0%, rgba(34,197,94,0.05) 70%, rgba(34,197,94,0.10) 100%)',
            boxShadow: 'inset 0 1px 0 rgba(110,231,183,0.35), 0 0 24px rgba(34,197,94,0.22)',
          }}
        />
      )}
      {active && (
        <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-emerald-300/80 to-transparent" />
      )}
      <span
        className={cn(
          'relative transition-colors duration-150',
          active
            ? 'text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.45)]'
            : 'text-slate-400 group-hover:text-slate-200'
        )}
      >
        {tab.icon(active)}
      </span>

      {typeof badge === 'number' && badge > 0 && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 24 }}
          className="absolute right-[18%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
        >
          {badge > 99 ? '99+' : badge}
        </motion.span>
      )}

      <span
        className={cn(
          'relative text-[9px] leading-none tracking-[0.04em] transition-colors duration-150',
          active ? 'font-black italic text-emerald-300' : 'font-semibold text-slate-400 group-hover:text-slate-300'
        )}
      >
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
    ? `max(calc(env(safe-area-inset-bottom, 0px) + 8px), ${pwaBottomExtraPx}px)`
    : `calc(env(safe-area-inset-bottom, 0px) + 8px)`

  // Hide on full-screen routes
  if (HIDDEN_ROUTES.has(pathname) || pathname.startsWith('/treino-ativo')) {
    return null
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const iaActive = isActive('/ia') || fabMenuOpen

  return (
    <nav
      aria-label="Navegação principal"
      className={cn('lg:hidden', inline ? 'relative w-full px-3 py-2' : 'fixed inset-x-0 bottom-0 z-45 px-3')}
      style={inline ? undefined : { paddingBottom: navBottomPadding }}
    >
      <style>{`
        @keyframes vfit-dock-idle { 0%, 100% { opacity: .45; } 50% { opacity: .9; } }
      `}</style>

      {/* Sombra fora do clip — drop-shadow acompanha o contorno chanfrado */}
      <div
        className="mx-auto max-w-md"
        style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.65)) drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            clipPath: CHAMFER_DOCK,
            background: `${CARBON}, radial-gradient(circle at 50% -60%, rgba(34,197,94,0.12), transparent 62%), linear-gradient(180deg, #12181f 0%, #0d1117 45%, #080b10 100%)`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.6)',
          }}
        >
          {/* Hairline emerald — assinatura no topo do dock */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent" />

          <div className="relative flex items-stretch gap-0.5 px-1.5 py-1.5">
            {LEFT_TABS.map((tab) => (
              <DockCell key={tab.id} tab={tab} active={isActive(tab.href)} />
            ))}

            {/* Célula IA — abre o menu FAB (comportamento v5 preservado) */}
            <button
              onClick={() => {
                haptic()
                onFabPress?.()
              }}
              aria-label={fabMenuOpen ? 'Fechar menu IA' : 'Abrir menu IA'}
              className="relative flex min-h-13 flex-[1.3] flex-col items-center justify-center gap-0.5 transition-all duration-150 hover:brightness-110 active:translate-y-px active:brightness-90"
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                cursor: 'pointer',
                clipPath: CHAMFER_IA,
                background: fabMenuOpen
                  ? 'linear-gradient(180deg, #10b981 0%, #059669 52%, #065f46 100%)'
                  : 'linear-gradient(180deg, #2ee06e 0%, #22C55E 45%, #166534 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -2px 0 rgba(2,44,34,0.45)',
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 animate-[vfit-dock-idle_3.4s_ease-in-out_infinite] motion-reduce:animate-none"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.22), transparent 55%)' }}
              />
              <motion.span
                className="relative"
                animate={{ rotate: fabMenuOpen ? 45 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <AISparkleIcon />
              </motion.span>
              <span
                className="relative text-[10px] font-black italic leading-none tracking-tight text-[#052e16]"
                style={{ transform: 'skewX(-6deg)' }}
              >
                IA
              </span>
            </button>

            {RIGHT_TABS.map((tab) => (
              <DockCell
                key={tab.id}
                tab={tab}
                active={isActive(tab.href)}
                badge={tab.id === 'perfil' ? notificationCount : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
