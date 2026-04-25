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
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'

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
        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <div className="surface-card rounded-2xl p-6 sm:p-8">
            <p className="mb-2 text-xs font-bold tracking-wider text-brand-primary uppercase">Escolha seu caminho</p>
            <h2 className="text-xl font-black text-text-primary sm:text-2xl">VFIT para alunos, profissionais e parceiros</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Se você é profissional de fitness ou quer monetizar indicações, acesse a página específica do seu perfil.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
              <TrackedCtaLink href="/app-personal-trainer" cta="Sou Personal Trainer" placement="segment_switcher_home" pageSegment="home" event="lp_cta_secondary_click"><Button size="sm" variant="secondary">Sou Personal Trainer</Button></TrackedCtaLink>
              <TrackedCtaLink href="/nutricionistas" cta="Sou Nutricionista" placement="segment_switcher_home" pageSegment="home" event="lp_cta_secondary_click"><Button size="sm" variant="outline">Sou Nutricionista</Button></TrackedCtaLink>
              <TrackedCtaLink href="/afiliados" cta="Quero ser Afiliado" placement="segment_switcher_home" pageSegment="home" event="lp_cta_secondary_click"><Button size="sm" variant="ghost">Quero ser Afiliado</Button></TrackedCtaLink>
            </div>
          </div>
        </section>
        <Features />
        <div className="h-px bg-linear-to-r from-transparent via-brand-primary/20 to-transparent" />
        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="surface-card rounded-2xl p-6 sm:p-8">
            <p className="text-xs font-bold tracking-wider text-brand-primary uppercase">Acesso para aluno</p>
            <h2 className="mt-2 text-xl font-black text-text-primary sm:text-2xl">Treine com IA de forma gratuita e evolua com acompanhamento real</h2>
            <p className="mt-2 text-sm text-text-secondary">
              A home do VFIT é para quem quer resultado no treino. O aluno começa sem cartão e acompanha evolução pelo celular.
              Profissionais têm páginas dedicadas com planos e operação completa.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <article className="rounded-xl border border-white/8 bg-white/4 p-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Aluno</h3>
                <p className="mt-2 text-sm text-text-secondary">Começa grátis, recebe treino personalizado e acompanha progresso no app.</p>
              </article>
              <article className="rounded-xl border border-white/8 bg-white/4 p-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Personal Trainer</h3>
                <p className="mt-2 text-sm text-text-secondary">Gestão de alunos, IA, cobrança e plano profissional em página dedicada.</p>
              </article>
              <article className="rounded-xl border border-white/8 bg-white/4 p-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Nutricionista</h3>
                <p className="mt-2 text-sm text-text-secondary">Acompanhamento nutricional integrado ao contexto de treino do aluno.</p>
              </article>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
              <TrackedCtaLink href="/welcome" cta="Sou aluno" placement="home_access_section" pageSegment="home" event="lp_register_start"><Button size="lg" variant="gradient">Sou aluno</Button></TrackedCtaLink>
              <TrackedCtaLink href="/app-personal-trainer" cta="Sou personal trainer" placement="home_access_section" pageSegment="home" event="lp_cta_secondary_click"><Button size="md" variant="outline">Personal trainer</Button></TrackedCtaLink>
              <TrackedCtaLink href="/nutricionistas" cta="Sou nutricionista" placement="home_access_section" pageSegment="home" event="lp_cta_secondary_click"><Button size="md" variant="soft">Nutricionista</Button></TrackedCtaLink>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <article className="rounded-xl border border-white/8 bg-white/4 p-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Aluno</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <TrackedCtaLink href="/login" cta="Entrar aluno" placement="home_quick_access" pageSegment="home" event="lp_cta_secondary_click"><Button size="sm" variant="secondary">Entrar</Button></TrackedCtaLink>
                  <TrackedCtaLink href="/register/student" cta="Cadastrar aluno" placement="home_quick_access" pageSegment="home" event="lp_register_start"><Button size="sm" variant="outline">Cadastrar</Button></TrackedCtaLink>
                  <TrackedCtaLink href="/termos" cta="Termos aluno" placement="home_quick_access" pageSegment="home" event="lp_cta_secondary_click"><Button size="sm" variant="ghost">Termos</Button></TrackedCtaLink>
                </div>
              </article>

              <article className="rounded-xl border border-white/8 bg-white/4 p-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Personal Trainer</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <TrackedCtaLink href="/login" cta="Entrar personal" placement="home_quick_access" pageSegment="home" event="lp_cta_secondary_click"><Button size="sm" variant="secondary">Entrar</Button></TrackedCtaLink>
                  <TrackedCtaLink href="/register/personal" cta="Cadastrar personal" placement="home_quick_access" pageSegment="home" event="lp_register_start"><Button size="sm" variant="outline">Cadastrar</Button></TrackedCtaLink>
                  <TrackedCtaLink href="/termos" cta="Termos personal" placement="home_quick_access" pageSegment="home" event="lp_cta_secondary_click"><Button size="sm" variant="ghost">Termos</Button></TrackedCtaLink>
                </div>
              </article>

              <article className="rounded-xl border border-white/8 bg-white/4 p-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Nutricionista</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <TrackedCtaLink href="/login" cta="Entrar nutri" placement="home_quick_access" pageSegment="home" event="lp_cta_secondary_click"><Button size="sm" variant="secondary">Entrar</Button></TrackedCtaLink>
                  <TrackedCtaLink href="/register/personal?type=nutri" cta="Cadastrar nutri" placement="home_quick_access" pageSegment="home" event="lp_register_start"><Button size="sm" variant="outline">Cadastrar</Button></TrackedCtaLink>
                  <TrackedCtaLink href="/termos" cta="Termos nutri" placement="home_quick_access" pageSegment="home" event="lp_cta_secondary_click"><Button size="sm" variant="ghost">Termos</Button></TrackedCtaLink>
                </div>
              </article>
            </div>
          </div>
        </section>
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
