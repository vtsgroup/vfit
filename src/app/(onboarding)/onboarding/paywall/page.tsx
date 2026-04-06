'use client'

/**
 * src/app/(onboarding)/onboarding/paywall/page.tsx
 *
 * Paywall Page — Orquestra as 3 camadas de oferta
 *
 * Flow: L1 (main plans) → close → L2 (20% off) → close → L3 (40% off) → confirm → free
 * Select em qualquer camada → redirect para checkout (placeholder até Sprint 10 backend)
 */

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PaywallPlans, PaywallDiscount, ConfirmExitModal } from '@/components/paywall'
import type { PaywallPlan } from '@/components/paywall'
import { useAuthStore } from '@/stores/auth-store'

type Layer = 'L1' | 'L2' | 'L3' | 'confirm'

export default function OnboardingPaywallPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [layer, setLayer] = useState<Layer>('L1')
  const [loading, setLoading] = useState(false)

  // 15 minutos de countdown para urgência
  const countdownEnd = useMemo(() => Date.now() + 15 * 60 * 1000, [])

  // Where to go after paywall — authenticated users go to app, others to register
  const getDestination = useCallback((plan: string) => {
    if (isAuthenticated) {
      // Plano pago → ir para checkout de assinatura
      // Plano free → ir direto para treinos
      return plan === 'free' ? '/treinos' : '/perfil/assinatura'
    }
    return `/register/student?from=onboarding&plan=${plan}`
  }, [isAuthenticated])

  // Mapeia IDs de UI → IDs de backend
  const PLAN_ID_MAP: Record<string, string> = { monthly: 'premium', annual: 'premium_annual' }

  // ─── Handle plan selection ───
  const handleSelect = useCallback(
    async (plan: PaywallPlan) => {
      setLoading(true)
      try {
        // Salvar plano selecionado para pegar após signup/login
        const backendId = PLAN_ID_MAP[plan.id] || plan.id
        localStorage.setItem('vfit_selected_plan', backendId)
        router.push(getDestination(backendId))
      } catch {
        setLoading(false)
      }
    },
    [router, getDestination]
  )

  // ─── Handle discount accept ───
  const handleDiscountAccept = useCallback(async () => {
    setLoading(true)
    try {
      localStorage.setItem('vfit_selected_plan', 'premium_annual')
      router.push(getDestination('premium_annual'))
    } catch {
      setLoading(false)
    }
  }, [router, getDestination])

  // ─── Handle layer transitions ───
  const handleCloseL1 = useCallback(() => {
    setLayer('L2')
  }, [])

  const handleDismissL2 = useCallback(() => {
    setLayer('L3')
  }, [])

  const handleDismissL3 = useCallback(() => {
    setLayer('confirm')
  }, [])

  const handleStay = useCallback(() => {
    setLayer('L1')
  }, [])

  const handleLeave = useCallback(() => {
    router.push(getDestination('free'))
  }, [router, getDestination])

  return (
    <>
      {/* ─── Layer 1: Main plans ─── */}
      {layer === 'L1' && (
        <PaywallPlans
          onSelect={handleSelect}
          onClose={handleCloseL1}
          onSkip={handleLeave}
          loading={loading}
        />
      )}

      {/* ─── Layer 2: 20% off bottom sheet ─── */}
      {layer === 'L2' && (
        <PaywallDiscount
          layer={2}
          endTime={countdownEnd}
          onAccept={handleDiscountAccept}
          onDismiss={handleDismissL2}
          loading={loading}
        />
      )}

      {/* ─── Layer 3: 40% off full screen ─── */}
      {layer === 'L3' && (
        <PaywallDiscount
          layer={3}
          endTime={countdownEnd}
          onAccept={handleDiscountAccept}
          onDismiss={handleDismissL3}
          loading={loading}
        />
      )}

      {/* ─── Confirm exit modal ─── */}
      {layer === 'confirm' && (
        <ConfirmExitModal
          onStay={handleStay}
          onLeave={handleLeave}
        />
      )}
    </>
  )
}
