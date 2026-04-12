import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { Button } from '@/components/ui/button'
import { faqSchema } from '@/lib/schemas'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'

export const metadata: Metadata = buildSeoMetadata({
  title: 'VFIT para Nutricionistas | Integre Nutrição e Treino com IA',
  description:
    'Nutricionistas: trabalhe com personal trainers no mesmo painel, acompanhe progresso integrado do aluno, use área de nutrição e monetize com afiliados.',
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
    {
      question: 'Nutricionista e personal conseguem conversar no contexto do aluno?',
      answer: 'Sim. A proposta do VFIT inclui comunicação entre profissionais para alinhar dieta e treino com decisões mais rápidas.',
    },
    {
      question: 'Nutricionista também ganha comissões por indicação?',
      answer: 'Sim. O nutricionista pode indicar novos alunos e receber comissão recorrente conforme o programa de afiliados ativo.',
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
        subtitle="No VFIT, nutricionista e personal trabalham juntos no mesmo painel para acelerar resultado real com treino + dieta alinhados."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Nutricionistas' },
        ]}
      />

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          ['Área de nutrição dedicada', 'Acesse um fluxo próprio para conduta nutricional e acompanhamento contínuo do aluno.'],
          ['Visão conjunta com personal', 'Entenda treino, frequência e resposta do aluno para ajustar dieta com mais precisão.'],
          ['Relatórios integrados', 'Use dados de evolução conjunta para consultas objetivas e decisões baseadas em evidência.'],
          ['Canal de aquisição + afiliados', 'Ganhe novos pacientes e monetize indicações qualificadas com comissão recorrente.'],
        ].map(([title, desc]) => (
          <article key={title} className="surface-card rounded-2xl p-5">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Painel colaborativo: treino + dieta</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-white/8 bg-white/4 p-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">O que a nutrição acompanha</h3>
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              <li>• Frequência e consistência de treino</li>
              <li>• Indicadores de progresso e adesão</li>
              <li>• Feedback do aluno para ajustes alimentares</li>
            </ul>
          </article>
          <article className="rounded-xl border border-white/8 bg-white/4 p-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Comunicação entre profissionais</h3>
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              <li>• Chat entre personal e nutricionista no caso do aluno</li>
              <li>• Ajustes rápidos para manter plano coerente</li>
              <li>• Menos conflito de orientação e mais resultado</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Comece como parceiro</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Cadastre seu interesse para atuar na área de nutrição do VFIT e colaborar com personais no acompanhamento conjunto dos alunos.
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
              <li>• Colaboração entre profissionais com comunicação contextual</li>
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

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Acesso direto para nutricionistas</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Entre, cadastre seu perfil profissional e consulte termos/condições do programa de parceria.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <TrackedCtaLink href="/login" cta="Entrar nutri" placement="nutri_page_quick_access" pageSegment="nutricionistas" event="lp_cta_secondary_click"><Button variant="secondary">Entrar</Button></TrackedCtaLink>
          <TrackedCtaLink href="/register/personal?type=nutri" cta="Cadastrar nutri" placement="nutri_page_quick_access" pageSegment="nutricionistas" event="lp_register_start"><Button variant="outline">Cadastrar</Button></TrackedCtaLink>
          <TrackedCtaLink href="/afiliados" cta="Afiliados nutri" placement="nutri_page_quick_access" pageSegment="nutricionistas" event="lp_cta_secondary_click"><Button variant="ghost">Afiliados</Button></TrackedCtaLink>
          <TrackedCtaLink href="/termos" cta="Termos nutri" placement="nutri_page_quick_access" pageSegment="nutricionistas" event="lp_cta_secondary_click"><Button variant="ghost">Termos e Condições</Button></TrackedCtaLink>
        </div>
      </section>
    </main>
  )
}
