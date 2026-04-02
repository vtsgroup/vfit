// ============================================
// pricing-section.tsx — Seção completa de preços com toggle e tabela
// ============================================
//
// O que faz:
//   Seção de pricing com toggle mensal/anual, grid de PricingCards e PricingTable.
//   Estado isAnnual local (useState) controla preços exibidos.
//
// Exports principais:
//   PricingSection — seção completa de pricing
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { PRICING_PLANS, COMPARISON_TABLE } from '@/data/pricing-plans'
import { PricingToggle } from '@/components/pricing/pricing-toggle'
import { PricingCard } from '@/components/pricing/pricing-card'

// Perf: PricingTable é below-the-fold → lazy load para reduzir bundle inicial
const PricingTable = dynamic(
  () => import('@/components/pricing/pricing-table').then((m) => ({ default: m.PricingTable })),
  {
    loading: () => (
      <div className="h-96 animate-pulse rounded-2xl bg-white/5" />
    ),
  }
)

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="space-y-16">
      {/* Toggle */}
      <PricingToggle isAnnual={isAnnual} onChange={setIsAnnual} />

      {/* Cards — Horizontal scroll on mobile with peek effect, grid on desktop */}
      <div className="relative -mx-6 px-6 sm:mx-0 sm:px-0">
        <h2 className="sr-only">Escolha seu plano</h2>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.slug}
              className="w-[80vw] shrink-0 snap-center sm:w-auto sm:shrink"
            >
              <PricingCard plan={plan} isAnnual={isAnnual} />
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl border border-white/8 bg-white/2 p-6 sm:p-8">
        <h2 className="mb-8 text-2xl font-bold text-white">Comparativo completo</h2>
        <PricingTable rows={COMPARISON_TABLE} />
      </div>
    </div>
  )
}
