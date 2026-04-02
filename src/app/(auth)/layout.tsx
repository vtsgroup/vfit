/**
 * src/app/(auth)/layout.tsx
 *
 * Auth Layout — Ultra-modern split screen
 *
 * Exports: metadata, AuthLayout
 */

// ============================================
// Auth Layout — Ultra-modern split screen
// Server component for metadata + client layout
// ============================================

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NO_INDEX_ROBOTS } from '@/lib/seo'
import { AuthLayoutClient } from './layout-client'

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS,
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayoutClient>
      <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-primary" /></div>}>
        {children}
      </Suspense>
    </AuthLayoutClient>
  )
}