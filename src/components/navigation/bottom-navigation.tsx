/**
 * src/components/navigation/bottom-navigation.tsx
 *
 * Bottom Navigation — VFIT B2C
 *
 * 5 tabs: Treinos · Nutrição · IA · Avaliações · Perfil
 * Estilo Befit: ícones sólidos com label, tab ativo com brand-primary.
 * Safe area bottom para iOS/Android.
 */

'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'

const tabs = [
  {
    label: 'Treinos',
    href: '/treinos',
    icon: 'dumbbell' as const,
    activeIcon: 'dumbbell' as const,
  },
  {
    label: 'Nutrição',
    href: '/nutricao',
    icon: 'apple' as const,
    activeIcon: 'apple' as const,
  },
  {
    label: 'IA',
    href: '/ia',
    icon: 'sparkles' as const,
    activeIcon: 'sparkles' as const,
  },
  {
    label: 'Avaliações',
    href: '/avaliacoes',
    icon: 'clipboardList' as const,
    activeIcon: 'clipboardList' as const,
  },
  {
    label: 'Perfil',
    href: '/perfil',
    icon: 'user' as const,
    activeIcon: 'user' as const,
  },
]

interface BottomNavigationProps {
  /** Optional notification badge count on Perfil tab */
  notificationCount?: number
}

export function BottomNavigation({ notificationCount = 0 }: BottomNavigationProps) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/6 bg-bg-dark/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="tablist"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
          const isPerfil = tab.href === '/perfil'

          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-all duration-200',
                isActive
                  ? 'text-brand-primary'
                  : 'text-zinc-600 hover:text-zinc-400 active:text-zinc-300'
              )}
              onClick={() => {
                // Haptic feedback for TWA
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  navigator.vibrate(10)
                }
              }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-brand-primary" />
              )}

              {/* Icon */}
              <div className="relative">
                <DSIcon
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  className={cn(
                    'transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
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
                  isActive ? 'opacity-100' : 'opacity-70'
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
