/**
 * src/components/navigation/nav-icons.tsx
 *
 * Sprint 1 — SVG Icons inline para BottomNavigation
 *
 * Cada ícone tem duas variantes: outline (inativo) e filled (ativo).
 * Renderizados inline para zero network requests e controle total de estado.
 */

import { cn } from '@/lib/utils'

interface NavIconProps {
  active?: boolean
  className?: string
  size?: number
}

// ============================================
// Home — Início
// ============================================
export function IconHome({ active, className, size = 24 }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all duration-200', className)}
    >
      {active ? (
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V10.5z" fill="currentColor" />
      ) : (
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V10.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      )}
    </svg>
  )
}

// ============================================
// Dumbbell — Treinos
// ============================================
export function IconDumbbell({ active, className, size = 24 }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all duration-200', className)}
    >
      {active ? (
        <>
          <rect x="1" y="9" width="3" height="6" rx="1" fill="currentColor" />
          <rect x="5" y="7" width="3" height="10" rx="1" fill="currentColor" />
          <rect x="16" y="7" width="3" height="10" rx="1" fill="currentColor" />
          <rect x="20" y="9" width="3" height="6" rx="1" fill="currentColor" />
          <rect x="8" y="11" width="8" height="2" rx="0.5" fill="currentColor" />
        </>
      ) : (
        <>
          <rect x="1" y="9" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="5" y="7" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="16" y="7" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="20" y="9" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

// ============================================
// Apple — Nutrição
// ============================================
export function IconApple({ active, className, size = 24 }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all duration-200', className)}
    >
      {active ? (
        <path
          d="M12 2.5c1 0 2.5.8 2.5 2.5h-5c0-1.7 1.5-2.5 2.5-2.5zM17.5 7C20 7 22 9.5 22 13c0 4-3 8.5-5.5 8.5-1 0-2-.5-3-.5h-3c-1 0-2 .5-3 .5C5 21.5 2 17 2 13c0-3.5 2-6 4.5-6 1.5 0 2.5.5 3.5.5h4c1 0 2-.5 3.5-.5z"
          fill="currentColor"
        />
      ) : (
        <>
          <path
            d="M12 3c1 0 2.5.8 2.5 2.5h-5C9.5 3.8 11 3 12 3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17.5 7.5C19.5 7.5 21.5 9.5 21.5 13c0 3.5-3 8-5 8-1 0-2-.5-3-.5h-3c-1 0-2 .5-3 .5-2 0-5-4.5-5-8 0-3.5 2-5.5 4-5.5 1.5 0 2.5.5 3.5.5h4c1 0 2-.5 3.5-.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  )
}

// ============================================
// Sparkles (IA) — Premium multi-star
// ============================================
export function IconSparkles({ active, className, size = 24 }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all duration-200', className)}
    >
      {active ? (
        <>
          {/* Main star */}
          <path
            d="M12 2l2.12 6.27L20.5 10l-6.38 1.73L12 18l-2.12-6.27L3.5 10l6.38-1.73L12 2z"
            fill="currentColor"
          />
          {/* Small star bottom-right */}
          <path
            d="M19 15l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z"
            fill="currentColor"
            opacity="0.7"
          />
          {/* Small star bottom-left */}
          <path
            d="M5 17l.6 1.8 1.8.6-1.8.6L5 21.8l-.6-1.8-1.8-.6 1.8-.6L5 17z"
            fill="currentColor"
            opacity="0.5"
          />
        </>
      ) : (
        <>
          <path
            d="M12 2l2.12 6.27L20.5 10l-6.38 1.73L12 18l-2.12-6.27L3.5 10l6.38-1.73L12 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M19 15l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
            opacity="0.6"
          />
          <path
            d="M5 17l.6 1.8 1.8.6-1.8.6L5 21.8l-.6-1.8-1.8-.6 1.8-.6L5 17z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
            opacity="0.4"
          />
        </>
      )}
    </svg>
  )
}

// ============================================
// Clipboard — Avaliações
// ============================================
export function IconClipboard({ active, className, size = 24 }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all duration-200', className)}
    >
      {active ? (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" fill="currentColor" />
          <rect x="8" y="1" width="8" height="4" rx="1.5" fill="currentColor" stroke="var(--color-bg-primary, #050A12)" strokeWidth="1.5" />
          <line x1="9" y1="10" x2="15" y2="10" stroke="var(--color-bg-primary, #050A12)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="14" x2="13" y2="14" stroke="var(--color-bg-primary, #050A12)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="8" y="1" width="8" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="9" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

// ============================================
// User — Perfil
// ============================================
export function IconUser({ active, className, size = 24 }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all duration-200', className)}
    >
      {active ? (
        <>
          <circle cx="12" cy="8" r="4" fill="currentColor" />
          <path
            d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}
