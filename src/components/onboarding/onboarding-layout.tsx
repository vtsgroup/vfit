/**
 * src/components/onboarding/onboarding-layout.tsx
 *
 * Onboarding Layout Client — Step container "VFIT BROADCAST".
 * Placar de transmissão: navy seco + grade técnica, header com leitura NN/TT em mono,
 * progresso como placar de arena (segmentos lima acendendo), título Syne, footer CTA
 * verde→lima. Re-skina TODAS as etapas do wizard de uma vez.
 */

'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'

function BroadcastProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1" aria-label={`Etapa ${current + 1} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
            i < current
              ? 'bg-green-400/80'
              : i === current
                ? 'bg-green-300 shadow-[0_0_14px_rgba(74,222,128,0.6)]'
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
  const nn = String(currentStep + 1).padStart(2, '0')
  const tt = String(totalSteps).padStart(2, '0')

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
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#04080f] text-white">
      {/* atmosfera "impressa" seca — grade técnica + sheen no topo (sem orbs/aurora) */}
      <div aria-hidden className="vfit-flow-grid pointer-events-none absolute inset-0 opacity-[0.22]" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 70% at 82% -8%, rgba(34,197,94,0.10), transparent 55%)' }} />

      {/* ─── Header de transmissão ─── */}
      <header className="safe-area-top relative z-30 border-b border-green-400/20 bg-[#04080f]/85 px-5 pb-3 pt-3 backdrop-blur-md sm:pt-4">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            {showBack ? (
              <button
                onClick={handleBack}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70 transition-all hover:border-green-400/50 hover:bg-green-400/10 hover:text-white active:scale-95"
                aria-label="Voltar"
              >
                <DSIcon name="chevronLeft" className="h-5 w-5" />
              </button>
            ) : (
              <div className="h-10 w-10" />
            )}

            <span className="bc-mono inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-green-300/80">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Plano IA · Leitura {nn}/{tt}
            </span>

            <span className="bc-mono shrink-0 text-[11px] font-bold tabular-nums text-white/80">{progressPercent}%</span>
          </div>

          <BroadcastProgress current={currentStep} total={totalSteps} />
        </div>
      </header>

      <main
        className={`relative z-10 mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-5 pt-6 transition-all duration-300 sm:pt-8 ${
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
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="bc-mono inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-green-300/70">
              <DSIcon name="brainCircuit" size={13} className="text-green-300" />
              Leitura {nn}
            </span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span className="bc-mono inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
              <DSIcon name="shieldCheck" size={13} className="text-green-300" />
              Dados protegidos
            </span>
          </div>

          <h1
            className={`font-syne text-[30px] font-black leading-[1.02] tracking-tight text-white transition-all duration-500 min-[380px]:text-[34px] sm:text-[42px] ${
              mounted && direction === 'enter' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`mt-2.5 max-w-lg text-sm font-medium leading-6 text-slate-300 transition-all delay-100 duration-500 sm:mt-3 ${
                mounted && direction === 'enter' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              {subtitle}
            </p>
          )}
        </section>

        <section className="mt-6 sm:mt-7">{children}</section>
      </main>

      {!hideFooter && (
        <div className="safe-area-bottom fixed inset-x-0 bottom-0 z-30 border-t border-green-400/20 bg-[#04080f]/90 px-5 pb-3 pt-3 backdrop-blur-md sm:pb-6 sm:pt-4">
          <div className="mx-auto max-w-2xl">
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              aria-label={continueLabel}
              className="bc-foot-cta group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full text-[#06210f] outline-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04080f] disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-35 disabled:saturate-[0.4] sm:h-16"
              style={{ background: 'linear-gradient(135deg,#4ade80 0%,#22c55e 50%,#16a34a 100%)' }}
            >
              {canContinue && <span aria-hidden className="bc-foot-sweep" />}
              <span className="bc-jumbo-font relative z-10 text-[15px] font-black uppercase tracking-tight sm:text-[17px]">{continueLabel}</span>
              <DSIcon name="arrowRight" size={18} className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .bc-jumbo-font { font-family: var(--font-ds-display), var(--font-syne), 'Syne', sans-serif; }
        .bc-foot-cta { box-shadow: 0 16px 40px -14px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.45); }
        .bc-foot-sweep { position: absolute; inset: 0; z-index: 5; pointer-events: none; background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%); transform: translateX(-130%) skewX(-18deg); animation: bcFootSweep 3.6s ease-in-out 1.4s infinite; }
        .bc-foot-cta:hover .bc-foot-sweep { animation-duration: 1.1s; }
        @keyframes bcFootSweep { 0% { transform: translateX(-130%) skewX(-18deg); } 60%,100% { transform: translateX(260%) skewX(-18deg); } }
        @media (prefers-reduced-motion: reduce) { .bc-foot-sweep { animation: none !important; } }
      `}</style>
    </div>
  )
}
