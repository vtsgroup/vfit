'use client'

/**
 * src/components/paywall/paywall-plans.tsx
 *
 * Paywall Layer 1 — Tela principal com 2 planos (anual destacado)
 *
 * Features: badge "Mais Popular", economia anual vs mensal, lista de features,
 * "Garantia de 7 dias" selo, CTA primário
 */

import { useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

export interface PaywallPlan {
  id: 'monthly' | 'annual'
  name: string
  price: number
  originalPrice?: number
  period: string
  pricePerMonth: number
  savings?: string
  popular?: boolean
  features: string[]
}

const PLANS: PaywallPlan[] = [
  {
    id: 'monthly',
    name: 'Mensal',
    price: 14.90,
    period: '/mês',
    pricePerMonth: 14.90,
    features: [
      'Planos de treino ilimitados com IA',
      'Biblioteca completa de exercícios',
      'Acompanhamento de progresso',
      'Chat com IA',
    ],
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 89.90,
    originalPrice: 178.80,
    period: '/ano',
    pricePerMonth: 7.49,
    savings: 'Economize 50%',
    popular: true,
    features: [
      'Tudo do plano mensal',
      'Planos avançados (periodização)',
      'Análise de progresso com IA',
      'Prioridade em novas features',
      'Suporte prioritário',
    ],
  },
]

interface PaywallPlansProps {
  onSelect: (plan: PaywallPlan) => void
  onClose: () => void
  loading?: boolean
}

export function PaywallPlans({ onSelect, onClose, loading }: PaywallPlansProps) {
  const [selected, setSelected] = useState<'monthly' | 'annual'>('annual')
  const selectedPlan = PLANS.find((p) => p.id === selected)!

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary">
      {/* ─── Close button ─── */}
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary text-text-muted hover:text-text-primary"
        >
          <DSIcon name="x" className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-6">
        {/* ─── Header ─── */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-1">
            <DSIcon name="sparkles" className="h-3.5 w-3.5 text-brand-primary" />
            <span className="text-xs font-semibold text-brand-primary">PREMIUM</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Desbloqueie Todo o Potencial
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Treinos ilimitados com IA, personalizados para você
          </p>
        </div>

        {/* ─── Plan cards ─── */}
        <div className="mx-auto w-full max-w-sm space-y-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`relative w-full rounded-2xl border-2 p-4 text-left transition-all ${
                selected === plan.id
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-border-primary bg-bg-secondary'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary px-3 py-0.5">
                  <span className="text-[10px] font-bold text-white uppercase">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{plan.name}</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-text-primary">
                      R${plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-text-muted">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="mt-0.5 text-xs text-text-muted line-through">
                      R${plan.originalPrice.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-text-secondary">
                    R${plan.pricePerMonth.toFixed(2).replace('.', ',')}/mês
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      selected === plan.id
                        ? 'border-brand-primary bg-brand-primary'
                        : 'border-border-primary'
                    }`}
                  >
                    {selected === plan.id && (
                      <DSIcon name="check" className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  {plan.savings && (
                    <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
                      {plan.savings}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ─── Features list ─── */}
        <div className="mx-auto mt-6 w-full max-w-sm">
          <div className="space-y-2">
            {selectedPlan.features.map((feat) => (
              <div key={feat} className="flex items-center gap-2">
                <DSIcon name="check" className="h-4 w-4 shrink-0 text-brand-primary" />
                <span className="text-sm text-text-secondary">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Trust badge ─── */}
        <div className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-bg-secondary px-4 py-2">
          <DSIcon name="shieldCheck" className="h-4 w-4 text-brand-primary" />
          <span className="text-xs text-text-secondary">
            Garantia de 7 dias — cancele quando quiser
          </span>
        </div>
      </div>

      {/* ─── Bottom CTA ─── */}
      <div className="px-6 pb-10 pt-6">
        <div className="mx-auto max-w-sm space-y-2">
          <Button
            size="lg"
            className="w-full"
            loading={loading}
            onClick={() => onSelect(selectedPlan)}
          >
            Começar Agora — R${selectedPlan.pricePerMonth.toFixed(2).replace('.', ',')}/mês
          </Button>
          <p className="text-center text-[10px] text-text-muted">
            Renovação automática. Cancele a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  )
}
