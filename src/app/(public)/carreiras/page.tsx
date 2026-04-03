// ============================================
// page.tsx — Página de Carreiras
// ============================================
//
// O que faz:
//   Página institucional de carreiras/vagas da empresa.
//   RSC: metadata estático com buildSeoMetadata.
//   Renderiza PageHero, lista de benefícios e CTA para contato.
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   CarreirasPage — page component (RSC)
import type { Metadata } from 'next'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { PageMetadata } from '@/components/shared/page-metadata'
import { FaqInline } from '@/components/shared/faq-inline'
import { FAQ_CARREIRAS } from '@/data/faqs'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Carreiras na VFIT: vagas remotas em produto, design e growth',
  description:
    'Confira vagas abertas na VFIT e faça parte do time que está transformando o mercado fitness com tecnologia.',
  path: '/carreiras',
})

const BENEFITS = [
  { icon: 'mapPin' as DSIconName, title: '100% Remoto', description: 'Trabalhe de qualquer lugar do Brasil' },
  { icon: 'clock' as DSIconName, title: 'Horário Flexível', description: 'Organize seu tempo como preferir' },
  { icon: 'heart' as DSIconName, title: 'Saúde', description: 'Auxílio academia e wellbeing' },
  { icon: 'flame' as DSIconName, title: 'Crescimento', description: 'Budget anual para cursos e eventos' },
]

const OPENINGS = [
  {
    title: 'Desenvolvedor(a) Full-Stack Senior',
    department: 'Engenharia',
    type: 'CLT · Remoto',
    icon: 'code2' as DSIconName,
    description: 'Next.js, Cloudflare Workers, PostgreSQL. Ajude a construir a próxima geração da plataforma.',
  },
  {
    title: 'Designer de Produto (UI/UX)',
    department: 'Design',
    type: 'PJ · Remoto',
    icon: 'palette' as DSIconName,
    description: 'Crie experiências incríveis para personal trainers e alunos em mobile e desktop.',
  },
  {
    title: 'Growth Marketing',
    department: 'Marketing',
    type: 'PJ · Remoto',
    icon: 'trendingUp' as DSIconName,
    description: 'Lidere estratégias de aquisição e retenção para escalar a base de usuários.',
  },
]

export default function CarreirasPage() {
  return (
    <>
      <PageHero
        title="Construa o futuro do fitness"
        subtitle="Estamos montando um time incrível para revolucionar como personal trainers trabalham. Venha fazer parte dessa missão."
        badge="Carreiras"
        breadcrumbs={[{ label: 'Carreiras', href: '/carreiras' }]}
      />

      <div className="mx-auto max-w-5xl px-6 space-y-16 pb-24">
      <PageMetadata lastUpdated="5 de março de 2026" readingTime="4 min" />

      {/* JobPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Vagas Abertas — VFIT',
          itemListElement: OPENINGS.map((job, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'JobPosting',
              title: job.title,
              description: job.description,
              hiringOrganization: {
                '@type': 'Organization',
                name: 'VFIT',
                sameAs: 'https://iapersonal.app.br',
                logo: 'https://iapersonal.app.br/icons/icon-512x512.png',
              },
              jobLocation: {
                '@type': 'Place',
                address: { '@type': 'PostalAddress', addressCountry: 'BR' },
              },
              jobLocationType: 'TELECOMMUTE',
              applicantLocationRequirements: {
                '@type': 'Country',
                name: 'Brazil',
              },
              datePosted: '2026-03-01',
              validThrough: '2026-09-01T23:59:59-03:00',
              employmentType: job.type.includes('CLT') ? 'FULL_TIME' : 'CONTRACTOR',
              baseSalary: {
                '@type': 'MonetaryAmount',
                currency: 'BRL',
                value: {
                  '@type': 'QuantitativeValue',
                  minValue: job.type.includes('CLT') ? 12000 : 8000,
                  maxValue: job.type.includes('CLT') ? 20000 : 15000,
                  unitText: 'MONTH',
                },
              },
            },
          })),
        }) }}
      />

      {/* Benefits */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="group rounded-2xl border border-white/8 bg-white/3 p-5 text-center transition-all duration-300 hover:border-brand-primary/25 hover:shadow-[0_0_24px_rgba(16,185,129,0.06)] backdrop-blur-sm"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary mb-3 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <DSIcon name={b.icon} />
            </div>
            <h3 className="text-sm font-semibold text-white">{b.title}</h3>
            <p className="mt-1 text-xs text-zinc-500">{b.description}</p>
          </div>
        ))}
      </section>

      {/* Open Positions */}
      <section>
        <h2 className="text-2xl font-bold text-white text-center mb-8">Vagas Abertas</h2>
        <div className="space-y-4">
          {OPENINGS.map((job) => (
            <div
              key={job.title}
              className="group rounded-2xl border border-white/8 bg-white/3 p-6 transition-all duration-300 hover:border-brand-primary/25 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <DSIcon name={job.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-brand-primary transition-colors">
                      {job.title}
                    </h3>
                    <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-medium text-brand-primary">
                      {job.department}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 mb-2">{job.type}</p>
                  <p className="text-sm text-zinc-400">{job.description}</p>
                </div>
                <a
                  href="mailto:vagas@iapersonal.app.br"
                  className="shrink-0 hidden sm:inline-flex"
                >
                  <Button variant="outline" size="sm">
                    Candidatar-se
                    <DSIcon name="arrowRight" size={14} />
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <FaqInline items={FAQ_CARREIRAS} />

      {/* CTA */}
      <section className="text-center rounded-2xl border border-brand-primary/25 bg-brand-primary/3 p-8 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.04)]">
        <h2 className="text-xl font-bold text-white mb-4">Não encontrou sua vaga?</h2>
        <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
          Envie seu currículo mesmo assim! Estamos sempre em busca de talentos
          que compartilham nossa paixão por tecnologia e fitness.
        </p>
        <a href="mailto:vagas@iapersonal.app.br">
          <Button size="lg">
            <DSIcon name="send" size={16} />
            Enviar Currículo
          </Button>
        </a>
      </section>
      </div>
    </>
  )
}
