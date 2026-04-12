import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { Button } from '@/components/ui/button'
import { faqSchema } from '@/lib/schemas'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'

export const metadata: Metadata = buildSeoMetadata({
  title: 'VFIT para Nutricionistas | Integre Nutrição e Treino com IA',
  description:
    'Nutricionistas: acompanhe pacientes que treinam com IA, integre plano alimentar e amplie receita com parceria VFIT.',
  path: '/nutricionistas',
  ogImage: '/og/og-default.png',
})

export default function NutricionistasPage() {
  const professionalServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'VFIT para Nutricionistas',
    serviceType: 'Plataforma de integração entre treino e nutrição',
    audience: {
      '@type': 'ProfessionalAudience',
      audienceType: 'Nutritionists',
    },
    provider: {
      '@type': 'Organization',
      name: 'VFIT',
      url: 'https://vfit.app.br',
    },
    areaServed: 'BR',
  }

  const faq = faqSchema([
    {
      question: 'Nutricionistas precisam pagar para começar no VFIT?',
      answer: 'A entrada inicial pode ser feita com cadastro de interesse e validação de parceria comercial.',
    },
    {
      question: 'Consigo acompanhar evolução de treino dos meus pacientes?',
      answer: 'Sim, a proposta do VFIT é integrar contexto de treino com conduta nutricional para melhor adesão.',
    },
    {
      question: 'O VFIT ajuda na aquisição de pacientes?',
      answer: 'Sim, a página e o posicionamento de parceria foram desenhados para ampliar descoberta e conversão.',
    },
  ])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <PageHero
        title="Nutricionistas: Seu Paciente Treina com IA. Você Cuida da Dieta."
        subtitle="Integre acompanhamento nutricional ao contexto real de treino para melhorar adesão e resultado."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Nutricionistas' },
        ]}
      />

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          ['Visão do contexto de treino', 'Entenda frequência, esforço e evolução para ajustar conduta nutricional com mais precisão.'],
          ['Plano alimentar integrado', 'Centralize recomendações e acompanhamento no mesmo app do paciente.'],
          ['Relatórios de evolução', 'Use dados de progresso para consultas mais objetivas e com maior percepção de valor.'],
          ['Canal de aquisição', 'Posicione seu serviço para alunos que já treinam com rotina orientada por IA.'],
        ].map(([title, desc]) => (
          <article key={title} className="surface-card rounded-2xl p-5">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Comece como parceiro</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Cadastre seu interesse e seja priorizado no programa de nutricionistas parceiros da VFIT.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <TrackedCtaLink href="/register/personal?type=nutri" cta="Quero ser parceiro" placement="nutri_page_main_cta" pageSegment="nutricionistas" event="lp_register_start"><Button>Quero ser parceiro</Button></TrackedCtaLink>
          <TrackedCtaLink href="/app-personal-trainer" cta="Ver solução para personais" placement="nutri_page_main_cta" pageSegment="nutricionistas" event="lp_cta_secondary_click"><Button variant="outline">Ver solução para personais</Button></TrackedCtaLink>
          <TrackedCtaLink href="/afiliados" cta="Programa de afiliados" placement="nutri_page_main_cta" pageSegment="nutricionistas" event="lp_cta_secondary_click"><Button variant="ghost">Programa de afiliados</Button></TrackedCtaLink>
        </div>
      </section>

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Integração treino + nutrição: MVP e roadmap</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-white/8 bg-white/4 p-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">MVP (já disponível)</h3>
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              <li>• Contexto de treino para leitura clínica da conduta</li>
              <li>• Jornada do paciente alinhada ao acompanhamento do personal</li>
              <li>• Captação de parceria via landing e fluxo dedicado</li>
            </ul>
          </article>

          <article className="rounded-xl border border-white/8 bg-white/4 p-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Roadmap (próxima fase)</h3>
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              <li>• Camada de plano alimentar integrada ao fluxo do aluno</li>
              <li>• Relatórios conjuntos treino + nutrição para consulta</li>
              <li>• IA de suporte para recomendações baseadas em rotina real</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  )
}
