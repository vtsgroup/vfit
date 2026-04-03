/**
 * src/app/(app)/perfil/assinatura/page.tsx
 *
 * Minha Assinatura — plano atual, upgrade, cancelar
 * Sprint 25 — Subscription Management
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { hapticLight } from '@/lib/haptics'
import { VFIT_PLANS } from '@config/constants'
import { formatBRL, getB2CMonthlyEquivalent, getB2CAnnualSavingsPercent } from '@lib/pricing'

type Plan = 'free' | 'premium' | 'premium_annual'

const PLAN_DISPLAY: Record<Plan, { name: string; price: string; priceDetail: string; features: string[] }> = {
  free: {
    name: VFIT_PLANS.free.name,
    price: 'Grátis',
    priceDetail: '',
    features: VFIT_PLANS.free.features as unknown as string[],
  },
  premium: {
    name: VFIT_PLANS.premium.name,
    price: formatBRL(VFIT_PLANS.premium.price_brl),
    priceDetail: '/mês',
    features: VFIT_PLANS.premium.features as unknown as string[],
  },
  premium_annual: {
    name: VFIT_PLANS.premium_annual.name,
    price: formatBRL(getB2CMonthlyEquivalent('premium_annual')),
    priceDetail: `/mês (${formatBRL(VFIT_PLANS.premium_annual.price_brl)}/ano)`,
    features: VFIT_PLANS.premium_annual.features as unknown as string[],
  },
}

export default function AssinaturaPage() {
  const router = useRouter()
  const [currentPlan] = useState<Plan>('free') // TODO: fetch from API
  const [selectedPlan, setSelectedPlan] = useState<Plan>('premium_annual')
  const [showCancel, setShowCancel] = useState(false)

  const isPremium = currentPlan !== 'free'

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <h1 className="text-lg font-bold text-white">Minha Assinatura</h1>
      </div>

      {/* Current plan status */}
      <div className={`mb-6 rounded-2xl border p-5 ${
        isPremium
          ? 'border-brand-primary/30 bg-white/3'
          : 'border-white/5 bg-white/2'
      }`}>
        <div className="mb-3 flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            isPremium ? 'bg-brand-primary/15 text-brand-primary' : 'bg-zinc-800 text-zinc-400'
          }`}>
            <DSIcon name={isPremium ? 'crown' : 'user'} size={22} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-white">{PLAN_DISPLAY[currentPlan].name}</p>
            <p className="text-[11px] text-zinc-500">
              {isPremium ? 'Ativo · Renova em 15/04/2026' : 'Conta gratuita'}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          {PLAN_DISPLAY[currentPlan].features.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <DSIcon name="check" size={14} className="shrink-0 text-brand-primary" />
              <span className="text-[12px] text-zinc-400">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade section (only for free users) */}
      {!isPremium && (
        <>
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-zinc-500">
            Upgrade para Premium
          </h2>

          <div className="mb-6 space-y-3">
            {(['premium', 'premium_annual'] as const).map((plan) => {
              const p = PLAN_DISPLAY[plan]
              const isSelected = selectedPlan === plan
              const isBest = plan === 'premium_annual'
              return (
                <button
                  key={plan}
                  onClick={() => {
                    hapticLight()
                    setSelectedPlan(plan)
                  }}
                  className={`relative w-full rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-brand-primary/50 bg-white/3'
                      : 'border-white/5 bg-white/2 hover:border-white/10'
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-brand-primary px-3 py-0.5 text-[10px] font-bold text-black">
                      MELHOR VALOR
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-brand-primary bg-brand-primary' : 'border-zinc-600'
                    }`}>
                      {isSelected && <DSIcon name="check" size={12} className="text-black" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-white">{p.name}</p>
                      <p className="text-[12px] text-zinc-500">
                        <span className="text-lg font-black text-white">{p.price}</span>
                        {p.priceDetail}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <Button className="w-full mb-4">
            <DSIcon name="crown" size={18} />
            Assinar {PLAN_DISPLAY[selectedPlan].name}
          </Button>
          <p className="text-center text-[10px] text-zinc-600">
            Cancele a qualquer momento · Pagamento seguro via PIX ou cartão
          </p>
        </>
      )}

      {/* Cancel section (only for premium) */}
      {isPremium && (
        <div className="mt-4">
          {!showCancel ? (
            <button
              onClick={() => setShowCancel(true)}
              className="text-[12px] text-zinc-600 hover:text-red-400 transition-colors"
            >
              Cancelar assinatura
            </button>
          ) : (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="mb-2 text-[14px] font-bold text-white">Tem certeza?</p>
              <p className="mb-4 text-[12px] text-zinc-400">
                Ao cancelar, você perde acesso aos recursos Premium ao final do período atual.
                Seus dados serão mantidos.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancel(false)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button variant="danger" size="sm" className="flex-1">
                  Confirmar cancelamento
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
