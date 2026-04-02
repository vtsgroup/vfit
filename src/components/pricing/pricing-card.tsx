// ============================================
// pricing-card.tsx — Card de plano de preços
// ============================================
//
// O que faz:
//   Exibe um plano de preços com nome, preço mensal/anual, features e CTA.
//   Preço anual calculado via getAnnualPrice() com desconto aplicado.
//   Card destacado para plano recomendado (variant="featured").
//   CTA linka para /cadastro com query param de plano.
//
// Exports principais:
//   PricingCard — card de plano de preços
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import type { PricingPlan } from '@/data/pricing-plans'
import { getAnnualPrice, formatPriceInteger, formatPriceCents } from '@/data/pricing-plans'

const monoStyle = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

interface PricingCardProps {
  plan: PricingPlan
  isAnnual: boolean
}

export function PricingCard({ plan, isAnnual }: PricingCardProps) {
  const price = isAnnual ? getAnnualPrice(plan.monthlyPrice) : plan.monthlyPrice
  const isPopular = plan.popular

  return (
    <div
      className={`relative flex h-full flex-col overflow-visible rounded-2xl border p-6 sm:p-8 transition-all ${
        isPopular
          ? 'border-brand-primary/40 bg-brand-primary/5 shadow-[0_0_40px_rgba(99,102,241,0.08)]'
          : 'border-white/8 bg-white/2 hover:border-white/15'
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className="rounded-full bg-brand-primary px-3 py-1 text-[10px] font-bold text-gray-900 uppercase tracking-wider"
            style={monoStyle}
          >
            {plan.badge}
          </span>
        </div>
      )}

      {/* Tier */}
      <span
        className="text-[10px] text-zinc-400 uppercase tracking-widest"
        style={monoStyle}
      >
        {plan.tier}
      </span>

      {/* Name */}
      <h3 className="mt-2 text-xl font-bold text-white">{plan.name}</h3>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-1">
        {price === 0 ? (
          <span className="text-4xl font-bold text-white">Grátis</span>
        ) : (
          <>
            <span className="text-sm text-zinc-300">R$</span>
            <span className="text-4xl font-bold text-white" style={monoStyle}>
              {formatPriceInteger(price)}
            </span>
            <span className="text-lg font-bold text-white" style={monoStyle}>
              {formatPriceCents(price)}
            </span>
            <span className="text-sm text-zinc-400">/mês</span>
          </>
        )}
      </div>

      {/* Annual savings */}
      {isAnnual && plan.monthlyPrice > 0 && (
        <div className="mt-1 text-xs text-emerald-400">
          Economia de R$ {((plan.monthlyPrice - getAnnualPrice(plan.monthlyPrice)) * 12).toFixed(2).replace('.', ',')} /ano
        </div>
      )}

      {/* Description */}
      <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{plan.description}</p>

      {/* Features */}
      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5 text-sm">
            <DSIcon name="check" size={16} className={`mt-0.5 shrink-0 ${isPopular ? 'text-brand-primary' : 'text-emerald-400'}`} />
            <span className="text-zinc-300">{f.text}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={plan.href}
        className={`mt-8 flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
          isPopular
            ? 'bg-brand-primary text-gray-900 hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20'
            : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
        }`}
      >
        {plan.cta}
        <DSIcon name="arrowRight" size={16} />
      </Link>
    </div>
  )
}
