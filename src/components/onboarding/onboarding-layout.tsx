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
    <div className="flex gap-1.5" aria-label={`Etapa ${current + 1} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all duration-500 ${
            i < current
              ? 'bg-emerald-300 shadow-[0_0_18px_rgba(134,239,172,0.46)]'
              : i === current
                ? 'bg-linear-to-r from-emerald-300 to-lime-300 shadow-[0_0_18px_rgba(134,239,172,0.34)]'
                : 'bg-white/9'
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
    <div className="vfit-flow-bg relative flex min-h-dvh flex-col overflow-hidden text-white">
      <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-b from-white/10 via-emerald-300/6 to-transparent" />
      <div className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full border border-emerald-300/14 bg-emerald-300/8 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-24 h-64 w-64 rounded-full border border-sky-300/10 bg-sky-300/7 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-px w-[86%] -translate-x-1/2 bg-linear-to-r from-transparent via-emerald-200/20 to-transparent" />

      {/* ─── Header: back + progress ─── */}
      <div className="safe-area-top relative z-10 mx-auto w-full max-w-2xl px-5 pt-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          {showBack ? (
            <button
              onClick={handleBack}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/9 text-white/80 shadow-glass-inset-sm backdrop-blur-xl transition-all hover:bg-white/14 hover:text-white active:scale-95"
              aria-label="Voltar"
            >
              <DSIcon name="chevronLeft" className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}

          <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 text-[11px] font-black uppercase text-emerald-100 shadow-glass-inset-sm backdrop-blur-xl">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-300 text-[10px] text-bg-base">
              <DSIcon name="sparkles" size={12} />
            </span>
            Plano IA
          </span>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/7 text-[11px] font-black text-white backdrop-blur-xl">
            {progressPercent}%
          </div>
        </div>

        <SegmentedProgressBar current={currentStep} total={totalSteps} />
      </div>

      {/* ─── Title ─── */}
      <div className="relative z-10 mx-auto w-full max-w-2xl px-5 pt-7 pb-3">
        <div className="rounded-[30px] border border-white/10 bg-white/8 p-4 shadow-[0_28px_72px_-42px_rgba(2,6,23,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/9 px-3 text-[11px] font-black uppercase text-emerald-200">
              <DSIcon name="brainCircuit" size={14} />
              Leitura {currentStep + 1}
            </div>
            <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 text-[11px] font-bold text-slate-300">
              <DSIcon name="shieldCheck" size={13} className="text-emerald-200" />
              Dados protegidos
            </div>
          </div>

          <h1
            className={`text-[30px] font-black leading-[1.03] text-white transition-all duration-500 sm:text-4xl ${
              mounted && direction === 'enter'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`mt-3 max-w-lg text-sm font-medium leading-6 text-slate-300 transition-all delay-100 duration-500 ${
                mounted && direction === 'enter'
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ─── Step content with slide animation ─── */}
      <div
        className={`relative z-10 mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-5 transition-all duration-400 ${
          !hideFooter ? 'pb-28' : 'pb-8'
        } ${
          mounted && direction === 'enter'
            ? 'translate-x-0 opacity-100'
            : direction === 'exit'
              ? '-translate-x-8 opacity-0'
              : 'translate-x-8 opacity-0'
        }`}
      >
        <div className="rounded-[30px] border border-white/10 bg-bg-base/28 p-3 shadow-[0_26px_70px_-46px_rgba(2,6,23,0.92),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
          <div className="rounded-2xl border border-white/7 bg-white/5 p-3">
            {children}
          </div>
        </div>
      </div>

      {/* ─── Footer: continue button — FIXED at bottom ─── */}
      {!hideFooter && (
        <div className="fixed inset-x-0 bottom-0 z-30 safe-area-bottom border-t border-white/8 bg-bg-base/88 px-5 pb-6 pt-4 shadow-[0_-24px_62px_-38px_rgba(2,6,23,0.95)] backdrop-blur-2xl">
          <div className="mx-auto max-w-2xl">
            <Button
              size="lg"
              className="w-full"
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
