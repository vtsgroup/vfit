/**
 * src/app/profile/page.tsx
 *
 * Public Profile page — /profile?slug=xxx
 *
 * Exports: ProfilePage
 * Hooks: useSearchParams
 * Features: 'use client'
 */

// ============================================
// Public Profile page — /profile?slug=xxx
// ============================================

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PublicProfileSkeleton } from '@/components/ui/page-skeletons'
import PublicProfileClient from '@/components/profile/public-profile'

function ProfileViewInner() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') || ''
  return <PublicProfileClient slug={slug} />
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><PublicProfileSkeleton /></div>}>
      <ProfileViewInner />
    </Suspense>
  )
}
