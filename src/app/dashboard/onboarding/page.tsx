// ============================================
// page.tsx — Onboarding de novos personals
// ============================================
//
// O que faz:
//   Página de onboarding guiado para novos personal trainers.
//   Protegida por AuthGuard (requiredType="personal").
//   Renderiza OnboardingWizard com checklist de primeiros passos.
//
// Auth: requiredType="personal"
//
// Exports principais:
//   OnboardingPage — page component (client)
'use client'

import { AuthGuard } from '@/components/auth'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export default function OnboardingPage() {
  return (
    <AuthGuard requiredType="personal">
      <div className="space-y-6">
        <OnboardingWizard />
      </div>
    </AuthGuard>
  )
}
