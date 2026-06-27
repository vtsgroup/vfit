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
import { LightBand, monoLabel, lightCard, greenChip, pillPrimaryClass, PillSweep, PillArrow } from '@/components/shared/light-section'
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

        {/* CTA final — card claro com textura suave */}
        <div className="relative overflow-hidden rounded-3xl p-8 text-center sm:p-14" style={lightCard}>
          {/* hairline topo */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent" />
          {/* dot grid verde (mascarado no centro) */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: 0.6, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(34,197,94,0.10) 1px, transparent 0)', backgroundSize: '22px 22px', WebkitMaskImage: 'radial-gradient(ellipse 78% 70% at 50% 35%, #000, transparent 76%)', maskImage: 'radial-gradient(ellipse 78% 70% at 50% 35%, #000, transparent 76%)' }} />
          {/* glow verde no topo + wash inferior */}
          <span aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[30rem] -translate-x-1/2 rounded-full bg-brand-primary/10 blur-[90px]" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28" style={{ background: 'linear-gradient(to top, rgba(34,197,94,0.05), transparent)' }} />
          {/* marcas "+" (blueprint sutil) */}
          <span aria-hidden="true" className="pointer-events-none absolute left-7 top-7 text-brand-primary/25"><svg width="11" height="11" viewBox="0 0 12 12"><path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5" /></svg></span>
          <span aria-hidden="true" className="pointer-events-none absolute bottom-7 right-7 text-brand-primary/25"><svg width="11" height="11" viewBox="0 0 12 12"><path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5" /></svg></span>

          <div className="relative">
            <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-brand-primary ring-1 ring-brand-primary/15" style={greenChip}><DSIcon name="rocket" size={26} /></span>
            <h2 className="font-syne text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">Comece hoje, <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">grátis</span></h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 sm:text-[15px]">30 dias pra testar tudo, sem cartão. Cancele quando quiser.</p>
            <div className="mt-7 flex justify-center">
              <a href="/register" className={pillPrimaryClass}>
                <PillSweep />
                <span className="relative z-10">Começar grátis</span>
                <PillArrow />
              </a>
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-wider text-slate-400" style={monoLabel}>Sem cartão · Sem fidelidade</p>
          </div>
        </div>
      </LightBand>
    </>
  )
}
