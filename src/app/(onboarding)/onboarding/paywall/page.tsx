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

type Layer = 'L1' | 'L2' | 'L3' | 'confirm'

export default function OnboardingPaywallPage() {
  const router = useRouter()
  const [layer, setLayer] = useState<Layer>('L1')
  const [loading, setLoading] = useState(false)

  // 15 minutos de countdown para urgência
  const countdownEnd = useMemo(() => Date.now() + 15 * 60 * 1000, [])

  // ─── Handle plan selection ───
  const handleSelect = useCallback(
    async (plan: PaywallPlan) => {
      setLoading(true)
      try {
        // Salvar plano selecionado para pegar após signup/login
        sessionStorage.setItem('vfit_selected_plan', plan.id)
        router.push(`/register?from=onboarding&plan=${plan.id}`)
      } catch {
        setLoading(false)
      }
    },
    [router]
  )

  // ─── Handle discount accept ───
  const handleDiscountAccept = useCallback(async () => {
    setLoading(true)
    try {
      sessionStorage.setItem('vfit_selected_plan', 'premium')
      router.push('/register?from=onboarding&plan=premium')
    } catch {
      setLoading(false)
    }
  }, [router])

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
    router.push('/register?from=onboarding&plan=free')
  }, [router])

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
