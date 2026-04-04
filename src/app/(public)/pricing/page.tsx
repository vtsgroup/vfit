// ============================================
// page.tsx — Página de Preços
// ============================================
//
// O que faz:
//   Página pública de preços com PricingSection (cards de planos) e FAQ de preços.
//   RSC: metadata estático com buildSeoMetadata.
//   Renderiza PageHero, PricingSection e FaqInline de perguntas sobre planos.
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   PricingPage — page component (RSC)
import type { Metadata } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { DSIcon } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { FAQ_PRICING } from '@/data/faqs'
import { PricingSection } from '@/components/pricing/pricing-section'
import { PLANS } from '@config/constants'
import { Button } from '@/components/ui/button'

// Perf: FaqInline é below-the-fold → lazy load para reduzir JS inicial
const FaqInline = dynamic(
  () => import('@/components/shared/faq-inline').then((m) => ({ default: m.FaqInline })),
  { loading: () => <div className="h-64 animate-pulse rounded-2xl bg-white/5" /> }
)

export const metadata: Metadata = buildSeoMetadata({
  title: 'Planos e Preços — VFIT',
  description:
    'Compare os planos do VFIT: Grátis, Pro, Pro+ e Max. Desconto de 20% no anual. Comece grátis sem cartão de crédito.',
  path: '/pricing',
  ogImage: '/og/og-pricing.png',
})

export default function PricingPage() {
  return (
    <>
      {/* JSON-LD Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Planos e Preços — VFIT',
            description: 'Compare os planos do VFIT para personal trainers.',
            url: 'https://vfit.app.br/pricing',
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: 4,
              itemListElement: (() => {
                const shippingDetails = { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'BRL' }, shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'BR' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' } } }
                const returnPolicy = { '@type': 'MerchantReturnPolicy', applicableCountry: 'BR', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 7, returnMethod: 'https://schema.org/ReturnByMail', returnFees: 'https://schema.org/FreeReturn' }
                return [
                {
                  '@type': 'Product',
                  position: 1,
                  name: 'VFIT Grátis',
                  description: 'Plano gratuito para sempre. Até 5 alunos ativos.',
                  image: 'https://vfit.app.br/og/og-pricing.png',
                  brand: { '@type': 'Brand', name: 'VFIT' },
                  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.7', bestRating: '5', ratingCount: '86' },
                  review: { '@type': 'Review', author: { '@type': 'Person', name: 'Lucas Mendes' }, datePublished: '2026-01-15', reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' }, reviewBody: 'Excelente para começar! Gerencio meus 5 primeiros alunos sem pagar nada.' },
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'BRL',
                    priceValidUntil: '2026-12-31',
                    availability: 'https://schema.org/InStock',
                    url: 'https://vfit.app.br/pricing',
                    seller: { '@type': 'Organization', name: 'VFIT' },
                    shippingDetails,
                    hasMerchantReturnPolicy: returnPolicy,
                  },
                },
                {
                  '@type': 'Product',
                  position: 2,
                  name: 'VFIT Pro',
                  description: 'Alunos ilimitados e automação completa.',
                  image: 'https://vfit.app.br/og/og-pricing.png',
                  brand: { '@type': 'Brand', name: 'VFIT' },
                  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', bestRating: '5', ratingCount: '142' },
                  review: { '@type': 'Review', author: { '@type': 'Person', name: 'Fernanda Oliveira' }, datePublished: '2026-02-10', reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' }, reviewBody: 'Melhor custo-benefício. Automação de cobranças e treinos economiza horas do meu dia.' },
                  offers: {
                    '@type': 'Offer',
                    price: String(PLANS.pro.price_brl),
                    priceCurrency: 'BRL',
                    priceValidUntil: '2026-12-31',
                    availability: 'https://schema.org/InStock',
                    url: 'https://vfit.app.br/pricing',
                    seller: { '@type': 'Organization', name: 'VFIT' },
                    shippingDetails,
                    hasMerchantReturnPolicy: returnPolicy,
                  },
                },
                {
                  '@type': 'Product',
                  position: 3,
                  name: 'VFIT Pro+',
                  description: 'Contratos, invoices e NFs em um único app.',
                  image: 'https://vfit.app.br/og/og-pricing.png',
                  brand: { '@type': 'Brand', name: 'VFIT' },
                  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', bestRating: '5', ratingCount: '67' },
                  review: { '@type': 'Review', author: { '@type': 'Person', name: 'Ricardo Santos' }, datePublished: '2026-02-25', reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' }, reviewBody: 'Contratos e NFs integrados facilitaram muito a gestão financeira do meu studio.' },
                  offers: {
                    '@type': 'Offer',
                    price: String(PLANS.profissional.price_brl),
                    priceCurrency: 'BRL',
                    priceValidUntil: '2026-12-31',
                    availability: 'https://schema.org/InStock',
                    url: 'https://vfit.app.br/pricing',
                    seller: { '@type': 'Organization', name: 'VFIT' },
                    shippingDetails,
                    hasMerchantReturnPolicy: returnPolicy,
                  },
                },
                {
                  '@type': 'Product',
                  position: 4,
                  name: 'VFIT Max',
                  description: 'White-label completo com domínio próprio.',
                  image: 'https://vfit.app.br/og/og-pricing.png',
                  brand: { '@type': 'Brand', name: 'VFIT' },
                  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', bestRating: '5', ratingCount: '31' },
                  review: { '@type': 'Review', author: { '@type': 'Person', name: 'Carla Ribeiro' }, datePublished: '2026-03-05', reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' }, reviewBody: 'White-label perfeito. Meus alunos acessam pelo meu domínio, com minha marca.' },
                  offers: {
                    '@type': 'Offer',
                    price: String(PLANS.max.price_brl),
                    priceCurrency: 'BRL',
                    priceValidUntil: '2026-12-31',
                    availability: 'https://schema.org/InStock',
                    url: 'https://vfit.app.br/pricing',
                    seller: { '@type': 'Organization', name: 'VFIT' },
                    shippingDetails,
                    hasMerchantReturnPolicy: returnPolicy,
                  },
                },
              ]})(),
            },
          }),
        }}
      />

      <PageHero
        title="Planos e Preços"
        subtitle="Do gratuito ao premium. Escolha o plano certo para o tamanho da sua operação."
        badge="Pricing"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Preços' },
        ]}
      />

      <div className="mx-auto max-w-6xl space-y-20 px-6 pb-24">
        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
          <div className="group flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-brand-primary/20 hover:shadow-[0_0_16px_rgba(16,185,129,0.06)]">
            <DSIcon name="shield" size={16} className="text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
            <span>Sem cartão de crédito</span>
          </div>
          <div className="group flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-brand-primary/20 hover:shadow-[0_0_16px_rgba(16,185,129,0.06)]">
            <DSIcon name="creditCard" size={16} className="text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
            <span>Cancele quando quiser</span>
          </div>
          <div className="group flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-brand-primary/20 hover:shadow-[0_0_16px_rgba(16,185,129,0.06)]">
            <DSIcon name="flame" size={16} className="text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
            <span>Setup em 2 minutos</span>
          </div>
        </div>

        {/* Pricing Cards + Toggle + Comparison Table */}
        <PricingSection />

        {/* FAQ */}
        <FaqInline items={FAQ_PRICING} />

        {/* CTA Final */}
        <section className="text-center rounded-2xl border border-brand-primary/30 bg-linear-to-b from-brand-primary/8 to-transparent p-8 sm:p-12 space-y-5 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Pronto para digitalizar seu trabalho?
          </h2>
          <p className="mx-auto max-w-lg text-sm text-zinc-300 sm:text-base">
            Junte-se a centenas de personal trainers que já usam o VFIT para gerenciar alunos, cobrar automaticamente e escalar sua operação.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg">
                Começar grátis
                <DSIcon name="arrowRight" size={16} />
              </Button>
            </Link>
            <Link href="/contato">
              <Button variant="outline" size="lg">
                Falar com vendas
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
