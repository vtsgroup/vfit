/**
 * src/components/auth/referral-capture.tsx
 *
 * ReferralCapture — Captura ?ref= da URL e salva cookie
 *
 * Exports: ReferralCapture
 * Hooks: useEffect, useSearchParams
 * Features: 'use client'
 */

// ============================================
// ReferralCapture — Captura ?ref= da URL e salva cookie
// Montar em layout raiz para funcionar em qualquer página
// ============================================

'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { saveReferralCode } from '@/lib/referral-cookie'

export function ReferralCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      saveReferralCode(ref)
    }
  }, [searchParams])

  return null // Componente invisível
}
