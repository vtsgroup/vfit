/**
 * src/components/navigation/bottom-navigation.tsx
 *
 * Sprint 1 — Bottom Navigation Premium
 *
 * 5 tabs: Treinos · Nutrição · IA · Avaliações · Perfil
 * SVGs dual-state (outline inativo, filled ativo), glass blur premium.
 * Indicator line no top do tab ativo, scale-110 no ícone ativo.
 * Safe area bottom para iOS/Android.
 */

'use client'

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  IconDumbbell,
  IconApple,
  IconSparkles,
  IconClipboard,
  IconUser,
} from './nav-icons'

// ============================================
// Tab definitions
// ============================================
interface Tab {
  label: string
  href: string
  icon: (active: boolean) => ReactNode
}

interface Tab {
  label: string
  href: string
  icon: (active: boolean) => ReactNode
  isFab?: boolean
}

const tabs: Tab[] = [
  {
    label: 'Treinos',
    href: '/treinos',
    icon: (active) => <IconDumbbell active={active} size={22} />,
  },
  {
    label: 'Nutrição',
    href: '/nutricao',
    icon: (active) => <IconApple active={active} size={22} />,
  },
  {
    label: 'IA',
    href: '/ia',
    isFab: true,
    icon: (active) => <IconSparkles active={active} size={26} />,
  },
  {
    label: 'Avaliações',
    href: '/avaliacoes',
    icon: (active) => <IconClipboard active={active} size={22} />,
  },
  {
    label: 'Perfil',
    href: '/perfil',
    icon: (active) => <IconUser active={active} size={22} />,
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
}

export function BottomNavigation({ notificationCount = 0 }: BottomNavigationProps) {
  const pathname = usePathname()

  // Hide on full-screen routes
  if (HIDDEN_ROUTES.has(pathname) || pathname.startsWith('/treino-ativo')) {
    return null
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/8 bg-(--color-bg-primary)/90 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="tablist"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
          const isPerfil = tab.href === '/perfil'

          // ─── IA FAB — botão verde redondo destacado ───
          if (tab.isFab) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
                className="relative flex flex-1 flex-col items-center justify-start pt-0"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                    navigator.vibrate(10)
                  }
                }}
              >
                {/* FAB circle — sobe acima da nav bar */}
                <div
                  className={cn(
                    'relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.45)] transition-all duration-200 active:scale-95',
                    isActive
                      ? 'bg-linear-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-[0_4px_24px_rgba(16,185,129,0.6)]'
                      : 'bg-linear-to-br from-emerald-400 via-emerald-500 to-emerald-600'
                  )}
                >
                  {tab.icon(true)}
                </div>
                <span
                  className={cn(
                    'mt-0.5 text-[10px] font-semibold leading-none transition-all duration-200',
                    isActive ? 'text-brand-primary' : 'text-zinc-600'
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            )
          }

          // ─── Tab normal ───
          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              className={cn(
                'relative flex min-h-11 min-w-14 flex-1 flex-col items-center justify-center gap-0.5 transition-all duration-200',
                isActive
                  ? 'text-brand-primary'
                  : 'text-zinc-600 hover:text-zinc-400 active:text-zinc-300'
              )}
              onClick={() => {
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  navigator.vibrate(10)
                }
              }}
            >
              {/* Active indicator line on top */}
              <div
                className={cn(
                  'absolute top-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full transition-all duration-200',
                  isActive ? 'bg-brand-primary' : 'bg-transparent'
                )}
              />

              {/* Icon */}
              <div className="relative">
                <div className={cn('transition-transform duration-200', isActive && 'scale-110')}>
                  {tab.icon(isActive)}
                </div>

                {/* Notification badge on Perfil */}
                {isPerfil && notificationCount > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] font-semibold leading-none transition-all duration-200',
                  isActive ? 'text-brand-primary' : 'text-zinc-600'
                )}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
