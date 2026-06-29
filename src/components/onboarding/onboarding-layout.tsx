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

function SegmentedProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1" aria-label={`Etapa ${current + 1} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            i < current
              ? 'bg-linear-to-r from-emerald-400 to-emerald-300 shadow-[0_0_14px_rgba(134,239,172,0.34)]'
              : i === current
                ? 'bg-linear-to-r from-emerald-300 to-lime-200 shadow-[0_0_20px_rgba(134,239,172,0.45)]'
                : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  )
}

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
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100)

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
    <div className="vfit-energy-bg relative flex min-h-dvh flex-col overflow-hidden text-white">
      {/* Vibrant Energy: fundo navy+aurora saturado (mesma assinatura do loading/result).
          Orbs de aurora vívidos à deriva — CSS-only (keyframes welcome-orb1/2), reduced-motion-aware. */}
      <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="welcome-orb1 pointer-events-none absolute -right-20 top-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-[120px]" />
      <div aria-hidden="true" className="welcome-orb2 pointer-events-none absolute -left-24 top-1/2 h-72 w-72 rounded-full bg-lime-400/16 blur-[130px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-95 bg-linear-to-b from-vfit-primary-500/22 via-sky-400/8 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-200/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-bg-base via-bg-base/70 to-transparent" />

      <div className="safe-area-top relative z-30 border-b border-white/8 bg-bg-base/72 px-5 pt-3 pb-2.5 shadow-[0_18px_48px_-34px_rgba(2,6,23,0.95)] backdrop-blur-2xl sm:pt-4 sm:pb-3">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
            {showBack ? (
              <button
                onClick={handleBack}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[15px] border border-white/12 bg-white/7 text-white/78 shadow-glass-inset-sm transition-all hover:bg-white/12 hover:text-white active:scale-95"
                aria-label="Voltar"
              >
                <DSIcon name="chevronLeft" className="h-5 w-5" />
              </button>
            ) : (
              <div className="h-11 w-11" />
            )}

            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-sky-200/12 bg-sky-300/8 px-3 text-[11px] font-black uppercase text-sky-100 shadow-glass-inset-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-300 text-[10px] text-bg-base">
                <DSIcon name="sparkles" size={12} />
              </span>
              Plano IA
            </span>

            <div className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/10 bg-white/7 px-2 text-[11px] font-black text-white">
              {progressPercent}%
            </div>
          </div>

          <SegmentedProgressBar current={currentStep} total={totalSteps} />
        </div>
      </div>

      <main
        className={`relative z-10 mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-5 pt-5 transition-all duration-400 sm:pt-7 ${
          !hideFooter ? 'pb-32 sm:pb-36' : 'pb-8'
        } ${
          mounted && direction === 'enter'
            ? 'translate-x-0 opacity-100'
            : direction === 'exit'
              ? '-translate-x-8 opacity-0'
              : 'translate-x-8 opacity-0'
        }`}
      >
        <section className="pb-1">
          <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4">
            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-300/16 bg-emerald-300/8 px-3 text-[11px] font-black uppercase text-emerald-200">
              <DSIcon name="brainCircuit" size={14} />
              Leitura {currentStep + 1}
            </span>
            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 text-[11px] font-bold text-slate-300">
              <DSIcon name="shieldCheck" size={13} className="text-emerald-200" />
              Dados protegidos
            </span>
          </div>

          <h1
            className={`text-[28px] font-black leading-[1.03] text-white transition-all duration-500 min-[380px]:text-[30px] sm:text-4xl ${
              mounted && direction === 'enter'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`mt-2 max-w-lg text-sm font-medium leading-6 text-slate-300 transition-all delay-100 duration-500 sm:mt-3 ${
                mounted && direction === 'enter'
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0'
              }`}
            >
              {subtitle}
            </p>
          )}
        </section>

        <section className="mt-5 sm:mt-7">{children}</section>
      </main>

      {!hideFooter && (
        <div className="fixed inset-x-0 bottom-0 z-30 safe-area-bottom border-t border-white/8 bg-bg-base/82 px-5 pb-2 pt-2 shadow-[0_-24px_62px_-38px_rgba(2,6,23,0.95)] backdrop-blur-2xl sm:pb-6 sm:pt-4">
          <div className="mx-auto max-w-2xl">
            <Button
              size="md"
              className="h-12 w-full sm:h-16"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              {continueLabel}
              <DSIcon name="arrowRight" size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}