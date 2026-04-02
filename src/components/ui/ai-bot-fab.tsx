/**
 * src/components/ui/ai-bot-fab.tsx
 *
 * AI Bot FAB — DS v2 Floating Action Button
 *
 * Exports: AIBotFab
 * Hooks: useState, usePathname, useAuthStore
 * Features: Auth: useAuthStore · 'use client'
 */

// ============================================
// AI Bot FAB — DS v2 Floating Action Button
// 56×56px, gradient verde, custom bot SVG icon
// Scale + rotate hover, glow shadow
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

/* AI Bot SVG — DS v2 premium custom icon */
function AiBotIcon({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <rect x="4" y="8" width="24" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="17" r="2.5" fill="currentColor" />
      <circle cx="20" cy="17" r="2.5" fill="currentColor" />
      <path d="M12 22c0 0 2 2.5 4 2.5s4-2.5 4-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 8V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="3" r="1.5" fill="currentColor" />
      <path d="M4 15H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 15h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function AIBotFab() {
  const [hovered, setHovered] = useState(false)
  const pathname = usePathname()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Only show on dashboard pages for authenticated users
  if (!isAuthenticated) return null
  if (!pathname?.startsWith('/dashboard')) return null
  // Don't show on AI page itself or messages page
  if (pathname === '/dashboard/ai' || pathname === '/dashboard/messages') return null

  return (
    <Link
      href="/dashboard/ai"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center',
        'rounded-[18px] border-0 text-white',
        'bg-linear-to-br from-emerald-400 via-emerald-500 to-emerald-700',
        'shadow-[0_4px_16px_rgba(16,185,129,0.35)]',
        'transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
        // Safe area for mobile
        'max-sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px)+4.5rem)]',
        hovered ? 'shadow-[0_8px_24px_rgba(16,185,129,0.5),0_0_0_4px_rgba(16,185,129,0.12)] scale-108 -rotate-5' : '',
      )}
      title="Assistente IA"
      aria-label="Abrir Assistente IA"
    >
      <AiBotIcon size={28} />
    </Link>
  )
}

export { AiBotIcon }
