import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { Button } from '@/components/ui/button'
import { faqSchema } from '@/lib/schemas'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'

export const metadata: Metadata = buildSeoMetadata({
  title: 'VFIT para Personal Trainers | Plataforma com IA para Gestão e Treinos',
  description:
    'A plataforma para personal trainers com IA, gestão de alunos, avaliações e cobrança automática. Comece grátis.',
  path: '/app-personal-trainer',
  ogImage: '/og/og-default.png',
})

export default function AppPersonalTrainerPage() {
  const faq = faqSchema([
    {
      question: 'O VFIT funciona para personal trainer iniciante?',
      answer: 'Sim. O VFIT atende desde profissionais iniciantes até operações avançadas com múltiplos alunos.',
    },
    {
      question: 'Consigo automatizar cobranças no VFIT?',
      answer: 'Sim. O fluxo permite automação de cobrança para reduzir inadimplência e esforço operacional.',
    },
    {
      question: 'Posso montar treinos com inteligência artificial?',
      answer: 'Sim. A IA acelera a prescrição e ajuda na personalização baseada no perfil do aluno.',
    },
  ])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <PageHero
        title="A Plataforma que Transforma Personal Trainers em Negócios de Sucesso"
        subtitle="Treinos com IA, gestão completa de alunos, avaliações e automação de cobrança em um único lugar."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'App Personal Trainer' },
        ]}
      />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ['Treinos com IA', 'Monte treinos personalizados em minutos com base no perfil e evolução de cada aluno.'],
          ['Gestão completa', 'Agenda, acompanhamento, avaliações e histórico centralizados em uma operação única.'],
          ['Cobrança automática', 'Automatize recorrência e reduza inadimplência com pagamentos no fluxo do app.'],
        ].map(([title, desc]) => (
          <article key={title} className="surface-card rounded-2xl p-5">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Como funciona</h2>
        <ol className="mt-3 space-y-2 text-sm text-text-secondary">
          <li>1. Crie sua conta profissional</li>
          <li>2. Cadastre seus alunos e objetivos</li>
          <li>3. Gere treinos com IA e acompanhe evolução</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <TrackedCtaLink href="/register/personal" cta="Começar grátis" placement="personal_page_main_cta" pageSegment="personal" event="lp_register_start"><Button>Começar grátis</Button></TrackedCtaLink>
          <TrackedCtaLink href="/pricing" cta="Ver planos" placement="personal_page_main_cta" pageSegment="personal" event="lp_cta_secondary_click"><Button variant="outline">Ver planos</Button></TrackedCtaLink>
          <TrackedCtaLink href="/nutricionistas" cta="Parceria com nutrição" placement="personal_page_main_cta" pageSegment="personal" event="lp_cta_secondary_click"><Button variant="ghost">Parceria com nutrição</Button></TrackedCtaLink>
        </div>
      </section>
    </main>
  )
}
