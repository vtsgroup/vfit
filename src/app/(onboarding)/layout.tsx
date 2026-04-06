/**
 * src/app/(onboarding)/layout.tsx
 *
 * Onboarding Layout — Server component
 * Route group for the quiz flow, no bottom nav
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NO_INDEX_ROBOTS } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'VFIT — Criar Meu Plano',
  robots: NO_INDEX_ROBOTS,
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-bg-primary">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-primary" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
