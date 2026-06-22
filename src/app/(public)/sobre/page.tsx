// ============================================
// page.tsx — Página Sobre
// ============================================
//
// O que faz:
//   Página institucional "Sobre" com história, valores e equipe.
//   RSC: metadata estático com buildSeoMetadata.
//   Renderiza PageHero, AboutSection e PageMetadata.
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   SobrePage — page component (RSC)
import type { Metadata } from 'next'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { PageMetadata } from '@/components/shared/page-metadata'
import { FaqInline } from '@/components/shared/faq-inline'
import { FAQ_SOBRE } from '@/data/faqs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Sobre a VFIT: missão, valores e visão para personal trainers',
  description:
    'Conheça a história da VFIT e como ajudamos personal trainers a escalar gestão, resultados e receita com tecnologia.',
  path: '/sobre',
  ogImage: '/og/og-sobre.png',
})

const VALUES = [
  {
    icon: 'flame' as DSIconName,
    title: 'Inovação',
    description: 'Usamos IA de ponta para automatizar tarefas e potencializar resultados.',
  },
  {
    icon: 'heart' as DSIconName,
    title: 'Paixão por Fitness',
    description: 'Somos apaixonados por saúde e acreditamos no poder da tecnologia para transformar vidas.',
  },
  {
    icon: 'users' as DSIconName,
    title: 'Comunidade',
    description: 'Construímos uma plataforma pensada por e para personal trainers brasileiros.',
  },
  {
    icon: 'globe' as DSIconName,
    title: 'Acessibilidade',
    description: 'Planos acessíveis para que todo personal trainer possa digitalizar seu trabalho.',
  },
]

const STATS = [
  { value: '500+', label: 'Personal Trainers' },
  { value: '3.000+', label: 'Alunos ativos' },
  { value: '15.000+', label: 'Treinos criados' },
  { value: '99.9%', label: 'Uptime' },
]

export default function SobrePage() {
  return (
    <>
      <PageHero
        title="Tecnologia a serviço do fitness"
        subtitle="Nascemos com a missão de empoderar personal trainers com as melhores ferramentas de gestão e inteligência artificial, permitindo que foquem no que fazem de melhor: transformar vidas."
        badge="Sobre a VFIT"
        breadcrumbs={[{ label: 'Sobre', href: '/sobre' }]}
      />

      <div className="mx-auto max-w-5xl px-6 space-y-16 pb-24">
      <PageMetadata lastUpdated="14 de fevereiro de 2026" readingTime="5 min" />

      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'VFIT',
          url: 'https://vfit.app.br',
          logo: 'https://vfit.app.br/favicons/icon-512x512.png?v=4.3.4',
          description: 'Plataforma SaaS para personal trainers com IA, gestão de alunos e cobranças automáticas.',
          foundingDate: '2025',
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'contato@vfit.app.br',
            contactType: 'customer support',
            availableLanguage: 'Portuguese',
          },
        }) }}
      />

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-white/8 bg-white/3 p-6 text-center transition-all duration-300 hover:border-brand-primary/25 hover:shadow-[0_0_24px_rgba(16,185,129,0.06)] backdrop-blur-sm"
          >
            <p className="text-3xl font-bold text-brand-primary transition-transform duration-300 group-hover:scale-110">{stat.value}</p>
            <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Story */}
      <section className="rounded-2xl border border-white/8 bg-white/3 p-8 sm:p-12 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
        <h2 className="text-2xl font-bold text-white mb-6">Nossa História</h2>
        <div className="space-y-4 text-zinc-400 leading-relaxed">
          <p>
            A VFIT nasceu em 2025, quando percebemos que a maioria dos personal trainers
            brasileiros ainda gerenciava seus alunos com planilhas, WhatsApp e cadernos. Havia
            uma lacuna enorme entre a tecnologia disponível e as ferramentas que esses profissionais usavam.
          </p>
          <p>
            Combinamos nossa experiência em desenvolvimento de software e inteligência artificial
            com o conhecimento profundo do mercado fitness brasileiro para criar uma plataforma
            que realmente resolve os problemas do dia a dia do personal trainer.
          </p>
          <p>
            Hoje, a VFIT é uma plataforma completa que vai desde a criação de treinos
            com IA até a gestão financeira com cobranças automáticas, passando por avaliações
            físicas, programa de afiliados e muito mais.
          </p>
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-2xl font-bold text-white text-center mb-8">Nossos Valores</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="group rounded-2xl border border-white/8 bg-white/3 p-6 transition-all duration-300 hover:border-brand-primary/25 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-all duration-300 group-hover:bg-brand-primary/20 group-hover:scale-110 group-hover:-rotate-6">
                <DSIcon name={value.icon} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{value.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <FaqInline items={FAQ_SOBRE} />

      {/* CTA */}
      <section className="text-center rounded-2xl border border-brand-primary/25 bg-brand-primary/3 p-8 sm:p-12 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.04)]">
        <h2 className="text-2xl font-bold text-white mb-4">Pronto para transformar sua carreira?</h2>
        <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
          Junte-se a centenas de personal trainers que já estão usando IA para
          potencializar seus resultados.
        </p>
        <Link href="/register/personal">
          <Button size="lg">
            <DSIcon name="checkCircle" size={16} />
            Começar grátis
          </Button>
        </Link>
        <p className="mt-4 text-sm text-zinc-400">30 dias grátis, sem cartão.</p>
      </section>
      </div>
    </>
  )
}
