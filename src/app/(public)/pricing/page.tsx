// ============================================
// page.tsx — Planos VFIT (Alunos | Profissionais) — banda CLARA
// ============================================
//
// O que faz:
//   Página pública de planos. RSC: metadata + JSON-LD (Offers reais dos planos de
//   aluno) + PageHero escuro. Banda CLARA com trust badges + PricingContent
//   (switch Alunos|Profissionais, toggle Mensal/Anual, formas de pagamento, FAQ).
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   PricingPage — page component (RSC)
import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { VFIT_PLANS } from '@config/constants'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { LightBand, monoLabel } from '@/components/shared/light-section'
import { PricingContent } from '@/components/pricing/pricing-content'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Planos VFIT: 30 dias grátis para alunos | Profissionais sem mensalidade',
  description:
    'Alunos: 30 dias grátis sem cartão, depois Premium R$ 19,90/mês ou R$ 149,90/ano (−37%). Profissionais: sem mensalidade, só taxas da plataforma com cobrança e gestão.',
  path: '/pricing',
  ogImage: '/og/og-pricing.png',
})

const TRUST: { icon: DSIconName; label: string }[] = [
  { icon: 'shield', label: 'Sem cartão de crédito' },
  { icon: 'refresh', label: 'Cancele quando quiser' },
  { icon: 'flame', label: 'Setup em 2 minutos' },
]

export default function PricingPage() {
  const shippingDetails = { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'BRL' }, shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'BR' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' } } }
  const returnPolicy = { '@type': 'MerchantReturnPolicy', applicableCountry: 'BR', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 7, returnMethod: 'https://schema.org/ReturnByMail', returnFees: 'https://schema.org/FreeReturn' }
  const plans = [VFIT_PLANS.free, VFIT_PLANS.premium, VFIT_PLANS.premium_annual]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Planos VFIT',
    description: 'Planos de aluno (30 dias grátis, Premium mensal e anual) e modelo profissional sem mensalidade.',
    url: 'https://vfit.app.br/pricing',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: plans.length,
      itemListElement: plans.map((p, i) => ({
        '@type': 'Product',
        position: i + 1,
        name: `VFIT ${p.name}`,
        description: p.features.slice(0, 3).join(' · '),
        image: 'https://vfit.app.br/og/og-pricing.png',
        brand: { '@type': 'Brand', name: 'VFIT' },
        offers: {
          '@type': 'Offer',
          price: String(p.price_brl),
          priceCurrency: 'BRL',
          priceValidUntil: '2026-12-31',
          availability: 'https://schema.org/InStock',
          url: 'https://vfit.app.br/pricing',
          seller: { '@type': 'Organization', name: 'VFIT' },
          shippingDetails,
          hasMerchantReturnPolicy: returnPolicy,
        },
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        title="Planos VFIT"
        subtitle="Alunos: 30 dias grátis, sem cartão. Profissionais: sem mensalidade — você só paga as taxas da plataforma."
        badge="Planos"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Planos', href: '/pricing' }]}
      />

      <LightBand>
        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {TRUST.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <DSIcon name={t.icon} size={15} className="text-brand-primary" />
              {t.label}
            </span>
          ))}
        </div>

        {/* Switch + planos + pagamento + FAQ */}
        <PricingContent />

        {/* CTA final */}
        <div className="relative overflow-hidden rounded-3xl px-7 py-10 text-center sm:px-10" style={{ background: 'linear-gradient(135deg, #15803d 0%, #16a34a 48%, #22c55e 100%)', boxShadow: '0 28px 70px -24px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.25)' }}>
          <span aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-white/20 blur-[80px]" />
          <h2 className="relative font-syne text-2xl font-black tracking-tight text-white sm:text-3xl">Comece hoje, grátis</h2>
          <p className="relative mx-auto mt-2 max-w-md text-sm text-white/85 sm:text-[15px]">30 dias pra testar tudo, sem cartão. Cancele quando quiser.</p>
          <a href="/register" className="group/cta relative mt-6 inline-flex h-13 items-center gap-2.5 rounded-full bg-white pl-7 pr-2.5 text-[13px] font-black uppercase tracking-wider text-emerald-700 shadow-[0_14px_30px_-10px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5">
            <span className="sr-only">Começar grátis</span>Começar grátis
            <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #34e565, #16a34a)' }}><DSIcon name="arrowRight" size={14} className="text-white transition-transform duration-300 group-hover/cta:translate-x-0.5" /></span>
          </a>
          <p className="relative mt-4 text-[11px] uppercase tracking-wider text-white/70" style={monoLabel}>Sem cartão · Sem fidelidade</p>
        </div>
      </LightBand>
    </>
  )
}
