/**
 * src/app/(onboarding)/layout.tsx
 *
 * Onboarding Layout — Server component
 * Route group for the quiz flow, no bottom nav
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { buildSeoMetadata, NO_INDEX_ROBOTS } from '@/lib/seo'
import { OnboardingTransition } from '@/components/layout/onboarding-transition'

// Funil de onboarding: NOINDEX (não deve ranquear), mas com título + OG decentes
// para quando o link é compartilhado. Páginas filhas (ex: /welcome) podem sobrescrever.
export const metadata: Metadata = buildSeoMetadata({
  title: 'Criar meu plano de treino com IA | VFIT',
  description:
    'Monte em minutos um plano de treino personalizado com a IA do VFIT — pelo seu objetivo, nível e rotina. 30 dias grátis, sem cartão.',
  path: '/onboarding',
  ogImage: '/og/og-default.png',
  robots: NO_INDEX_ROBOTS,
})

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-bg-primary">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-primary" />
        </div>
      }
    >
      <OnboardingTransition>{children}</OnboardingTransition>
    </Suspense>
  )
}
