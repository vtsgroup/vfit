/**
 * src/components/layout/copy-link-fab.tsx
 *
 * CopyLinkFab → IA Floating Button
 *
 * Exports: CopyLinkFab
 * Hooks: usePathname, useEffectiveUserView
 * Features: 'use client'
 */

// ============================================
// CopyLinkFab → IA Floating Button
// Brand emerald FAB that links to /dashboard/ai
// Perfect bottom-right, above MobileBottomNav on mobile
// ============================================

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'

function AiRobotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Glow filter for the eyes */}
        <filter id="ai-eye-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Subtle gradient for the head */}
        <linearGradient id="ai-head-fill" x1="4" y1="6" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* Antenna stem */}
      <line x1="12" y1="6" x2="12" y2="3.2" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      {/* Antenna tip — pulsing dot */}
      <circle cx="12" cy="2.2" r="1.2" fill="white" opacity="0.95" />
      <circle cx="12" cy="2.2" r="0.5" fill="white" opacity="0.6" />

      {/* Head — rounded rect with gradient fill */}
      <rect x="4.5" y="6.5" width="15" height="12.5" rx="4" fill="url(#ai-head-fill)" />
      <rect x="4.5" y="6.5" width="15" height="12.5" rx="4" stroke="white" strokeWidth="1.4" opacity="0.85" />

      {/* Left eye */}
      <circle cx="9" cy="12" r="1.7" fill="white" filter="url(#ai-eye-glow)" />
      <circle cx="9.5" cy="11.5" r="0.45" fill="rgba(5,150,105,0.9)" />

      {/* Right eye */}
      <circle cx="15" cy="12" r="1.7" fill="white" filter="url(#ai-eye-glow)" />
      <circle cx="15.5" cy="11.5" r="0.45" fill="rgba(5,150,105,0.9)" />

      {/* Mouth — friendly arc */}
      <path d="M9.8 16c1 1 3.4 1 4.4 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />

      {/* Ear accents — side nodes */}
      <rect x="2" y="10.5" width="2" height="4" rx="1" fill="white" opacity="0.3" />
      <rect x="20" y="10.5" width="2" height="4" rx="1" fill="white" opacity="0.3" />
    </svg>
  )
}

export function CopyLinkFab() {
  const { isPersonalView, isStudentView } = useEffectiveUserView()
  const pathname = usePathname()

  // Show only for personal view (hide in student simulation)
  if (!isPersonalView || isStudentView) return null

  // Hide if already on AI page
  const isOnAiPage = pathname === '/dashboard/ai'

  return (
    <Link
      href="/dashboard/ai"
      className={cn(
        'fixed z-30 flex items-center justify-center rounded-full transition-all duration-300',
        // Perfect bottom-right: above mobile nav on small, absolute corner on desktop
        'bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] right-4',
        'lg:bottom-6 lg:right-6',
        // Compact size
        'h-12 w-12 lg:h-13 lg:w-13',
        // Brand emerald shadows — 3D pressed effect
        'shadow-[0_3px_0_0_#047857,0_6px_20px_rgba(16,185,129,0.35),0_0_24px_rgba(16,185,129,0.12)]',
        'hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_#047857,0_10px_28px_rgba(16,185,129,0.45),0_0_40px_rgba(16,185,129,0.18)]',
        'active:translate-y-0.5 active:shadow-[0_1px_0_0_#047857,0_3px_10px_rgba(16,185,129,0.3)] active:scale-95',
        isOnAiPage && 'opacity-60 pointer-events-none'
      )}
      style={{
        background: isOnAiPage
          ? 'linear-gradient(135deg, #059669, #047857)'
          : 'linear-gradient(135deg, #34D399, #10B981, #059669)',
      }}
      title="IA Assistente"
      aria-label="IA Assistente"
    >
      {/* Glass shine overlay */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-linear-to-b from-white/20 to-transparent" />
      <span className="relative">
        <AiRobotIcon />
      </span>
    </Link>
  )
}
