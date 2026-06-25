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
