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
import { AuthLayoutClient } from './layout-client'
import { AuthPageProviders } from '@/components/providers/auth-page-providers'

export const metadata: Metadata = {
  robots: 'index, follow',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthPageProviders>
      <AuthLayoutClient>
        <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-primary" /></div>}>
          {children}
        </Suspense>
      </AuthLayoutClient>
    </AuthPageProviders>
  )
}
