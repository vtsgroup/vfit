/**
 * src/components/onboarding/onboarding-layout.tsx
 *
 * Onboarding Layout Client — Step container
 * Progress bar segmentada (tracinhos), back button, step counter
 * Slide animation between steps
 */

'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'

// ============================================
// Progress Bar segmentada (tracinhos estilo Befit)
// ============================================

function SegmentedProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
            i < current
              ? 'bg-brand-primary'
              : i === current
                ? 'bg-brand-primary/60'
                : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  )
}

// ============================================
// Main Layout
// ============================================

interface OnboardingStepLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  showBack?: boolean
  canContinue?: boolean
  onContinue?: () => void
  continueLabel?: string
  hideFooter?: boolean
}

export function OnboardingStepLayout({
  children,
  title,
  subtitle,
  showBack = true,
  canContinue = false,
  onContinue,
  continueLabel = 'Continuar',
  hideFooter = false,
}: OnboardingStepLayoutProps) {
  const router = useRouter()
  const { currentStep, totalSteps, prevStep } = useOnboardingStore()
  const [direction, setDirection] = useState<'enter' | 'exit'>('enter')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDirection('enter')
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      router.push('/welcome')
    } else {
      setDirection('exit')
      setTimeout(() => {
        prevStep()
      }, 200)
    }
  }, [currentStep, prevStep, router])

  const handleContinue = useCallback(() => {
    if (!canContinue || !onContinue) return
    setDirection('exit')
    setTimeout(() => {
      onContinue()
    }, 200)
  }, [canContinue, onContinue])

  return (
    <div className="flex min-h-dvh flex-col bg-bg-dark">
      {/* ─── Header: back + progress ─── */}
      <div className="safe-area-top px-5 pt-4">
        <div className="mb-4 flex items-center justify-between">
          {showBack ? (
            <button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/8 active:bg-white/12"
              aria-label="Voltar"
            >
              <DSIcon name="chevronLeft" className="h-5 w-5 text-white/70" />
            </button>
          ) : (
            <div className="w-10" />
          )}

          <span className="text-xs font-medium tracking-wider text-white/40 uppercase">
            {currentStep + 1} / {totalSteps}
          </span>

          <div className="w-10" />
        </div>

        <SegmentedProgressBar current={currentStep} total={totalSteps} />
      </div>

      {/* ─── Title ─── */}
      <div className="px-6 pt-8 pb-4">
        <h1
          className={`text-2xl font-bold text-white transition-all duration-500 ${
            mounted && direction === 'enter'
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0'
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`mt-2 text-sm text-white/50 transition-all delay-100 duration-500 ${
              mounted && direction === 'enter'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* ─── Step content with slide animation ─── */}
      <div
        className={`flex-1 px-6 transition-all duration-400 ${
          mounted && direction === 'enter'
            ? 'translate-x-0 opacity-100'
            : direction === 'exit'
              ? '-translate-x-8 opacity-0'
              : 'translate-x-8 opacity-0'
        }`}
      >
        {children}
      </div>

      {/* ─── Footer: continue button ─── */}
      {!hideFooter && (
        <div className="safe-area-bottom px-6 pb-6 pt-4">
          <Button
            size="lg"
            className="w-full"
            onClick={handleContinue}
            disabled={!canContinue}
          >
            {continueLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
