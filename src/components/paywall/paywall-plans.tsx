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
import { VFIT_PLANS } from '@config/constants'
import { getB2CMonthlyEquivalent, getB2CAnnualSavingsPercent } from '@lib/pricing'

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
    price: VFIT_PLANS.premium.price_brl,
    period: '/mês',
    pricePerMonth: VFIT_PLANS.premium.price_brl,
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
    price: VFIT_PLANS.premium_annual.price_brl,
    originalPrice: VFIT_PLANS.premium.price_brl * 12,
    period: '/ano',
    pricePerMonth: getB2CMonthlyEquivalent('premium_annual'),
    savings: `Economize ${getB2CAnnualSavingsPercent()}%`,
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
  onSkip?: () => void
  loading?: boolean
}

export function PaywallPlans({ onSelect, onClose, onSkip, loading }: PaywallPlansProps) {
  const [selected, setSelected] = useState<'monthly' | 'annual'>('annual')
  const selectedPlan = PLANS.find((p) => p.id === selected)!

  return (
    <div className="vfit-flow-bg relative flex min-h-dvh flex-col overflow-hidden text-white">
      <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
      {/* ─── Close button ─── */}
      <div className="relative z-10 flex justify-end p-4">
        <button
          onClick={onClose}
          aria-label="Fechar oferta"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-400 backdrop-blur-xl transition-colors hover:text-white"
        >
          <DSIcon name="x" className="h-4 w-4" />
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col px-6">
        {/* ─── Header ─── */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/8 px-3 py-1.5">
            <DSIcon name="sparkles" className="h-3.5 w-3.5 text-brand-primary" />
            <span className="text-xs font-bold text-brand-primary">PREMIUM</span>
          </div>
          <h1 className="text-4xl font-black leading-tight text-white">
            Desbloqueie seu plano completo
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
            Treinos ilimitados com IA, progressão automática e análise de evolução.
          </p>
        </div>

        {/* ─── Plan cards ─── */}
        <div className="mx-auto w-full max-w-sm space-y-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`relative w-full rounded-3xl border p-4 text-left transition-all duration-300 ${
                selected === plan.id
                  ? 'border-emerald-300/60 bg-emerald-300/10 shadow-[0_0_34px_rgba(34,197,94,0.16)]'
                  : 'border-white/10 bg-white/6 hover:bg-white/9'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-300 px-3 py-0.5 shadow-[0_0_18px_rgba(134,239,172,0.32)]">
                  <span className="text-[10px] font-black uppercase text-bg-base">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{plan.name}</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">
                      R${plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-slate-500">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="mt-0.5 text-xs text-slate-600 line-through">
                      R${plan.originalPrice.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    R${plan.pricePerMonth.toFixed(2).replace('.', ',')}/mês
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      selected === plan.id
                        ? 'border-brand-primary bg-brand-primary'
                        : 'border-white/15'
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
                <span className="text-sm text-slate-300">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Trust badge ─── */}
        <div className="vfit-flow-panel-soft mx-auto mt-6 flex items-center gap-2 rounded-2xl px-4 py-3">
          <DSIcon name="shieldCheck" className="h-4 w-4 text-brand-primary" />
          <span className="text-xs text-slate-300">
            Garantia de 7 dias — cancele quando quiser
          </span>
        </div>
      </div>

      {/* ─── Bottom CTA ─── */}
      <div className="relative z-10 px-6 pb-10 pt-6">
        <div className="mx-auto max-w-sm space-y-2">
          <Button
            size="lg"
            className="w-full"
            loading={loading}
            onClick={() => onSelect(selectedPlan)}
          >
            Começar Agora — R${selectedPlan.pricePerMonth.toFixed(2).replace('.', ',')}/mês
          </Button>
          <p className="text-center text-[10px] text-slate-500">
            Renovação automática. Cancele a qualquer momento.
          </p>
          {onSkip && (
            <button
              onClick={onSkip}
              className="mt-2 w-full py-2 text-center text-sm font-medium text-slate-500 underline underline-offset-2 transition-colors hover:text-slate-300 active:scale-[0.98]"
            >
              Continuar gratuitamente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
