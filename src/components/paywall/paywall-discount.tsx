'use client'

/**
 * src/components/paywall/paywall-discount.tsx
 *
 * Paywall Layer 2 — Bottom sheet 20% OFF + countdown
 * Paywall Layer 3 — Full screen 40% OFF final offer
 *
 * Props: layer (2|3), onAccept, onDismiss, countdown endTime
 */

import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import { VFIT_PLANS } from '@config/constants'

interface PaywallDiscountProps {
  layer: 2 | 3
  endTime: Date | number
  onAccept: () => void
  onDismiss: () => void
  loading?: boolean
}

const LAYER_CONFIG = {
  2: {
    discount: '20%',
    title: 'Espere! Oferta Especial',
    subtitle: 'Ganhe 20% de desconto no plano anual',
    price: Math.round(VFIT_PLANS.premium_annual.price_brl * 0.80 * 100) / 100,
    originalPrice: VFIT_PLANS.premium_annual.price_brl,
    pricePerMonth: Math.round((VFIT_PLANS.premium_annual.price_brl * 0.80 / 12) * 100) / 100,
    badge: '20% OFF',
    badgeColor: 'bg-amber-500',
  },
  3: {
    discount: '40%',
    title: 'Nossa MELHOR Oferta!',
    subtitle: '40% OFF — Exclusivo agora, não voltará!',
    price: Math.round(VFIT_PLANS.premium_annual.price_brl * 0.60 * 100) / 100,
    originalPrice: VFIT_PLANS.premium_annual.price_brl,
    pricePerMonth: Math.round((VFIT_PLANS.premium_annual.price_brl * 0.60 / 12) * 100) / 100,
    badge: '40% OFF',
    badgeColor: 'bg-red-500',
  },
}

export function PaywallDiscount({
  layer,
  endTime,
  onAccept,
  onDismiss,
  loading,
}: PaywallDiscountProps) {
  const config = LAYER_CONFIG[layer]

  if (layer === 2) {
    // ─── Layer 2: Bottom Sheet style ───
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onDismiss} />

        {/* Sheet */}
        <div className="vfit-flow-bg relative z-10 w-full max-w-md animate-[slideUp_0.3s_ease-out] overflow-hidden rounded-t-[2rem] px-6 pb-10 pt-6 text-white">
          <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
          {/* Grab bar */}
          <div className="relative mx-auto mb-4 h-1 w-10 rounded-full bg-white/18" />

          {/* Badge */}
          <div className="mb-4 flex justify-center">
            <span className={`rounded-full ${config.badgeColor} px-4 py-1 text-sm font-bold text-white`}>
              {config.badge}
            </span>
          </div>

          <h2 className="relative mb-1 text-center text-2xl font-black text-white">
            {config.title}
          </h2>
          <p className="relative mb-4 text-center text-sm text-slate-400">
            {config.subtitle}
          </p>

          {/* Countdown */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <DSIcon name="clock" className="h-4 w-4 text-red-400" />
            <span className="text-xs text-slate-500">Oferta expira em</span>
            <CountdownTimer
              endTime={endTime}
              className="text-sm text-red-400"
            />
          </div>

          {/* Price */}
          <div className="mb-6 text-center">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-sm text-slate-600 line-through">
                R${config.originalPrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-3xl font-black text-white">
                R${config.price.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-sm text-slate-500">/ano</span>
            </div>
            <p className="mt-1 text-xs text-brand-primary font-medium">
              Apenas R${config.pricePerMonth.toFixed(2).replace('.', ',')}/mês
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            loading={loading}
            onClick={onAccept}
          >
            Aceitar {config.discount} OFF
          </Button>

          <button
            onClick={onDismiss}
            className="mt-3 w-full py-2 text-center text-xs text-slate-500 hover:text-slate-300"
          >
            Não, obrigado
          </button>
        </div>
      </div>
    )
  }

  // ─── Layer 3: Full Screen ───
  return (
    <div className="vfit-flow-bg fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6 text-white">
      <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
      {/* Close */}
      <button
        onClick={onDismiss}
        aria-label="Fechar oferta"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-400 backdrop-blur-xl hover:text-white"
      >
        <DSIcon name="x" className="h-4 w-4" />
      </button>

      <div className="mx-auto w-full max-w-sm text-center">
        {/* Fire icon */}
        <div className="vfit-flow-panel mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem]">
          <DSIcon name="flame" className="h-10 w-10 text-red-400" />
        </div>

        {/* Badge */}
        <div className="mb-4 inline-block">
          <span className={`rounded-full ${config.badgeColor} px-5 py-1.5 text-lg font-bold text-white`}>
            {config.badge}
          </span>
        </div>

        <h1 className="mb-2 text-3xl font-black text-white">
          {config.title}
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          {config.subtitle}
        </p>

        {/* Countdown */}
        <div className="vfit-flow-panel-soft mb-6 flex items-center justify-center gap-2 rounded-2xl px-4 py-3">
          <DSIcon name="clock" className="h-5 w-5 text-red-400" />
          <span className="text-sm text-slate-400">Expira em</span>
          <CountdownTimer
            endTime={endTime}
            format="mm:ss"
            showLabels
            className="text-red-400"
          />
        </div>

        {/* Price card */}
        <div className="vfit-flow-panel mb-6 rounded-3xl p-6">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-lg text-slate-600 line-through">
              R${config.originalPrice.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-4xl font-black text-brand-primary">
              R${config.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">/ano</p>
          <p className="mt-2 text-sm font-semibold text-brand-primary">
            = R${config.pricePerMonth.toFixed(2).replace('.', ',')}/mês
          </p>
        </div>

        {/* Features compact */}
        <div className="mb-6 space-y-2 text-left">
          {['Treinos IA ilimitados', 'Biblioteca completa', 'Chat com IA', 'Análise de progresso'].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <DSIcon name="check" className="h-4 w-4 shrink-0 text-brand-primary" />
              <span className="text-sm text-slate-300">{f}</span>
            </div>
          ))}
        </div>

        <Button
          size="lg"
          className="w-full"
          loading={loading}
          onClick={onAccept}
        >
          <DSIcon name="flame" className="h-4 w-4" />
          Quero {config.discount} OFF Agora
        </Button>

        <button
          onClick={onDismiss}
          className="mt-3 w-full py-2 text-center text-xs text-slate-500 hover:text-slate-300"
        >
          Não, prefiro pagar mais depois
        </button>

        <p className="mt-4 text-[10px] text-slate-500">
          Garantia de 7 dias. Cancele quando quiser.
        </p>
      </div>
    </div>
  )
}
