/**
 * src/components/onboarding/steps/step-ready.tsx
 *
 * Onboarding Step 20 — "Estamos prontos!"
 * CTA final → CRIAR MEU PLANO
 */

'use client'

import { useEffect, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'

const PLAN_FEATURES = [
  { icon: '🎯', text: 'Personalizado para seu objetivo' },
  { icon: '📅', text: 'Adaptado à sua rotina' },
  { icon: '🛡️', text: 'Respeita suas limitações' },
  { icon: '📈', text: 'Progressão inteligente' },
]

export function StepReady() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Animated icon */}
      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full bg-brand-primary/15 transition-all duration-700 ${
          mounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <DSIcon name="sparkles" className="h-12 w-12 text-brand-primary" />
      </div>

      {/* Title */}
      <div
        className={`text-center transition-all delay-200 duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <h2 className="text-2xl font-bold text-white">
          É isso, estamos
          <span className="text-brand-primary"> prontos!</span>
        </h2>
        <p className="mt-3 text-sm text-white/50 leading-relaxed">
          Com base nas suas respostas, vamos gerar um
          plano de treino 100% personalizado.
        </p>
      </div>

      {/* What you'll get */}
      <div
        className={`w-full space-y-2 transition-all delay-400 duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <p className="mb-3 text-center text-xs font-semibold tracking-wider text-white/40 uppercase">
          Seu plano incluirá
        </p>
        {PLAN_FEATURES.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/4 px-4 py-3"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
              transition: `opacity 0.4s ${500 + i * 100}ms, transform 0.4s ${500 + i * 100}ms`,
            }}
          >
            <span className="text-lg">{f.icon}</span>
            <span className="text-sm font-medium text-white/80">{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
