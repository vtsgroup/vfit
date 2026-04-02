/**
 * src/components/onboarding/steps/step-motivational.tsx
 *
 * Onboarding Step 7 — Motivacional
 * "Conquiste sua melhor versão" — auto-advance
 */

'use client'

import { useEffect, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'

const STATS = [
  { value: '94%', label: 'dos usuários veem resultados em 4 semanas' },
  { value: '2.5x', label: 'mais consistência com plano personalizado' },
  { value: '12min', label: 'tempo médio por sessão para iniciantes' },
]

export function StepMotivational() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Icon */}
      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full bg-brand-primary/15 transition-all duration-700 ${
          mounted ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <DSIcon name="trophy" className="h-12 w-12 text-brand-primary" />
      </div>

      {/* Title */}
      <div
        className={`text-center transition-all delay-200 duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <h2 className="text-xl font-bold text-white">
          Conquiste sua
          <span className="text-brand-primary"> melhor versão</span>
        </h2>
        <p className="mt-3 text-sm text-white/50 leading-relaxed">
          Com um plano feito sob medida por IA, seus resultados
          são mais rápidos e duradouros.
        </p>
      </div>

      {/* Stats */}
      <div className="w-full space-y-3">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-white/6 bg-white/4 px-4 py-3"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 0.5s ${300 + i * 150}ms, transform 0.5s ${300 + i * 150}ms`,
            }}
          >
            <span className="text-xl font-bold text-brand-primary">{stat.value}</span>
            <span className="text-xs text-white/60">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
