// ============================================
// page.tsx — Landing page principal (Home)
// ============================================
//
// O que faz:
//   Página raiz (/) com todas as seções da landing: Navbar, Hero, Features,
//   Pricing, HowItWorks, Numbers, Gamification, Blog, FAQ, About, CTA, Footer.
//   Inclui FAQSchema e LocalBusinessSchema JSON-LD para SEO.
//   RSC — sem 'use client'.
//
// Exports principais:
//   Home — page component (RSC)
import { LandingAnalyticsBootstrap, Navbar, Hero, Features, Testimonials, NumbersSection, GamificationSection, BlogSection, FaqSection, AboutSection, CtaSection, Footer } from '@/components/landing'
import { FAQSchema, LocalBusinessSchema } from '@/components/seo/json-ld'
import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { PUBLIC_SOCIAL_PROOF } from '@config/constants'

export const metadata: Metadata = buildSeoMetadata({
  title: 'VFIT — App de Treinos com IA | Treinos Personalizados Grátis',
  description:
    'Baixe o VFIT grátis. Treinos personalizados com inteligência artificial, evolução por dados e gamificação no celular.',
  path: '/',
  ogImage: '/og/og-default.png',
})

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-page dark">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:rounded-xl focus:bg-brand-primary focus:px-6 focus:py-3 focus:text-sm focus:font-bold focus:text-bg-dark focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>
      <FAQSchema />
      <LocalBusinessSchema />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'VFIT',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web, iOS, Android',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'BRL',
            },
            description:
              'App de treinos com inteligência artificial para alunos, personal trainers e nutricionistas.',
            featureList: [
              'Treinos personalizados com IA',
              'Gamificação com XP e rankings',
              'Avaliação física digital',
              'Conexão com personal trainer',
              'PWA com suporte offline',
            ],
          }),
        }}
      />
      <LandingAnalyticsBootstrap />
      <Navbar />
      <main id="main-content">
        <Hero />
        <section className="relative overflow-hidden border-y border-white/6 bg-bg-primary" aria-label="Comece como aluno">
          <div className="pointer-events-none absolute inset-0 opacity-3" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }} />
          <div className="relative mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="mb-3 text-xs font-bold tracking-wider text-brand-primary uppercase">Aluno primeiro</p>
              <h2 className="max-w-3xl text-2xl font-black text-text-primary sm:text-3xl">
                Treino de personal trainer online, criado com IA e pronto para começar hoje.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                Sem planilha perdida e sem dúvida sobre o próximo exercício. São 30 dias grátis, sem cartão — o VFIT guia seu treino, mostra evolução e conecta você a profissionais quando fizer sentido.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <TrackedCtaLink href="/welcome" cta="Começar grátis como aluno" placement="student_trust_strip" pageSegment="home" event="lp_register_start">
                  <Button size="lg" variant="gradient" className="w-full px-7 text-xs uppercase tracking-wider sm:w-auto">
                    <DSIcon name="sparkles" size={16} />
                    Começar grátis
                  </Button>
                </TrackedCtaLink>
                <TrackedCtaLink href="/#testimonials" cta="Ver depoimentos" placement="student_trust_strip" pageSegment="home" event="lp_cta_secondary_click">
                  <Button size="lg" variant="outline" className="w-full px-7 text-xs uppercase tracking-wider sm:w-auto">
                    <DSIcon name="star" size={15} />
                    Ver histórias reais
                  </Button>
                </TrackedCtaLink>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:w-150">
              {[
                { icon: 'users' as const, value: PUBLIC_SOCIAL_PROOF.active_students_label, label: 'alunos ativos' },
                { icon: 'star' as const, value: PUBLIC_SOCIAL_PROOF.satisfaction_label, label: 'satisfação' },
                { icon: 'dumbbell' as const, value: '500+', label: 'exercícios' },
              ].map((item) => (
                <article key={item.label} className="rounded-xl border border-white/8 bg-white/4 p-3 text-center sm:p-4">
                  <DSIcon name={item.icon} size={16} className="mx-auto mb-2 text-brand-primary" />
                  <p className="text-lg font-black text-text-primary sm:text-2xl">{item.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">{item.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <Features />
        <div className="h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
        <Testimonials />
        <div className="h-px bg-linear-to-r from-transparent via-brand-primary/15 to-transparent" />
        <NumbersSection />
        <GamificationSection />
        <div className="h-px bg-linear-to-r from-transparent via-brand-primary/20 to-transparent" />
        <BlogSection />
        <AboutSection />
        <div className="h-px bg-linear-to-r from-transparent via-brand-primary/15 to-transparent" />
        <CtaSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  )
}
