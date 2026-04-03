/**
 * src/components/onboarding/steps/step-social-proof.tsx
 *
 * Onboarding Step — Social Proof
 * Comparação OUTRO PLANO vs VFIT + reviews
 */

'use client'

import { useEffect, useState } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

const REVIEWS: { name: string; rating: number; text: string; badgeIcon: DSIconName; badgeText: string }[] = [
  {
    name: 'Lucas M.',
    rating: 5,
    text: 'Em 4 semanas já vi diferença no espelho. O plano é muito melhor que qualquer genérico.',
    badgeIcon: 'dumbbell',
    badgeText: '4 semanas',
  },
  {
    name: 'Ana P.',
    rating: 5,
    text: 'Nunca tinha conseguido manter uma rotina. A gamificação do VFIT me motivou demais!',
    badgeIcon: 'flame',
    badgeText: '60 dias streak',
  },
  {
    name: 'Rafael S.',
    rating: 5,
    text: 'O treino de 30 minutos é perfeito para minha rotina. Resultados reais em pouco tempo.',
    badgeIcon: 'zap',
    badgeText: '30 min/dia',
  },
]

const COMPARISON = [
  { feature: 'Plano personalizado por IA', vfit: true, other: false },
  { feature: 'Adaptação ao seu nível', vfit: true, other: false },
  { feature: 'Gamificação + Streaks', vfit: true, other: false },
  { feature: 'Respeita suas lesões', vfit: true, other: false },
  { feature: 'Progressão automática', vfit: true, other: false },
  { feature: 'Vídeos dos exercícios', vfit: true, other: true },
]

export function StepSocialProof() {
  const [mounted, setMounted] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % REVIEWS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const review = REVIEWS[reviewIndex]

  return (
    <div className="space-y-6">
      {/* Comparison table */}
      <div
        className={`rounded-2xl border border-white/8 bg-white/4 p-4 transition-all duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="mb-3 grid grid-cols-[1fr,auto,auto] gap-2 text-center">
          <span />
          <span className="w-20 text-[10px] font-semibold tracking-wider text-white/30 uppercase">
            Outros
          </span>
          <span className="w-20 text-[10px] font-bold tracking-wider text-brand-primary uppercase">
            VFIT
          </span>
        </div>

        {COMPARISON.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr,auto,auto] items-center gap-2 border-t border-white/5 py-2"
          >
            <span className="text-xs text-white/60">{row.feature}</span>
            <span className="flex w-20 justify-center">
              {row.other ? (
                <DSIcon name="check" className="h-4 w-4 text-white/30" />
              ) : (
                <DSIcon name="x" className="h-4 w-4 text-white/15" />
              )}
            </span>
            <span className="flex w-20 justify-center">
              {row.vfit ? (
                <DSIcon name="check" className="h-4 w-4 text-brand-primary" />
              ) : (
                <DSIcon name="x" className="h-4 w-4 text-white/15" />
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Review carousel */}
      <div
        className={`rounded-2xl border border-white/8 bg-white/4 p-4 transition-all delay-300 duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="mb-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <DSIcon
              key={star}
              name="star"
              className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-white/15'}`}
            />
          ))}
          <span className="ml-2 text-xs text-white/40">{review.name}</span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          &ldquo;{review.text}&rdquo;
        </p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/6 px-2.5 py-1 text-[11px] text-white/50">
          <DSIcon name={review.badgeIcon} className="h-3 w-3 text-brand-primary" />
          {review.badgeText}
        </span>

        {/* Dot indicators */}
        <div className="mt-3 flex justify-center gap-1.5">
          {REVIEWS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === reviewIndex ? 'w-4 bg-brand-primary' : 'w-1.5 bg-white/15'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
