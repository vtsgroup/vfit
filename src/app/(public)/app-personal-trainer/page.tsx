import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { Button } from '@/components/ui/button'
import { faqSchema } from '@/lib/schemas'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'

export const metadata: Metadata = buildSeoMetadata({
  title: 'VFIT para Personal Trainers | Plataforma com IA para Gestão e Treinos',
  description:
    'Plataforma para personal trainers com IA, gestão de alunos, colaboração com nutricionistas, chat profissional e monetização por afiliados.',
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
    {
      question: 'Consigo trabalhar junto com nutricionista no VFIT?',
      answer: 'Sim. Personal e nutricionista acompanham o mesmo aluno em um fluxo integrado para alinhar treino, dieta e evolução.',
    },
    {
      question: 'Personal pode ganhar comissão por indicação?',
      answer: 'Sim. O personal pode indicar alunos e receber comissão recorrente por conversão qualificada no programa de afiliados.',
    },
  ])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <PageHero
        title="Personal Trainer + Nutricionista no Mesmo Painel"
        subtitle="Use IA para prescrever treinos, acompanhe a evolução real do aluno e trabalhe em conjunto com a nutricionista para acelerar resultado."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'App Personal Trainer' },
        ]}
      />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ['Treinos com IA', 'Monte treinos personalizados em minutos com base no perfil e evolução de cada aluno.'],
          ['Painel unificado', 'Treino, progresso e contexto nutricional do aluno no mesmo fluxo operacional.'],
          ['Cobrança automática', 'Automatize recorrência e reduza inadimplência com pagamentos no fluxo do app.'],
        ].map(([title, desc]) => (
          <article key={title} className="surface-card rounded-2xl p-5">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Trabalho conjunto com nutricionista</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-white/8 bg-white/4 p-4">
            <h3 className="text-sm font-bold text-text-primary tracking-wider">Visão clínica integrada</h3>
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              <li>• Entenda a estratégia alimentar ativa do aluno</li>
              <li>• Ajuste periodização com base na adesão nutricional</li>
              <li>• Acompanhe evolução com leitura de treino + nutrição</li>
            </ul>
          </article>
          <article className="rounded-xl border border-white/8 bg-white/4 p-4">
            <h3 className="text-sm font-bold text-text-primary tracking-wider">Chat entre profissionais</h3>
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              <li>• Personal e nutricionista conversam no contexto do aluno</li>
              <li>• Decisões mais rápidas para ajuste de treino e dieta</li>
              <li>• Menos ruído operacional e mais foco em resultado real</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Afiliados para personal trainers</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Além do acompanhamento, você também pode indicar alunos para o VFIT e ganhar comissão recorrente por cada conversão ativa, conforme as regras do programa de afiliados.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <TrackedCtaLink href="/afiliados" cta="Entender comissões" placement="personal_page_affiliate_cta" pageSegment="personal" event="lp_cta_secondary_click"><Button variant="outline">Entender comissões</Button></TrackedCtaLink>
        </div>
      </section>

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Como funciona</h2>
        <ol className="mt-3 space-y-2 text-sm text-text-secondary">
          <li>1. Crie sua conta profissional</li>
          <li>2. Cadastre aluno, objetivo e contexto nutricional</li>
          <li>3. Gere treino com IA e acompanhe evolução integrada</li>
          <li>4. Alinhe decisões com nutricionista no chat profissional</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <TrackedCtaLink href="/register/personal" cta="Começar grátis" placement="personal_page_main_cta" pageSegment="personal" event="lp_register_start"><Button>Começar grátis</Button></TrackedCtaLink>
          <TrackedCtaLink href="/pricing" cta="Ver planos" placement="personal_page_main_cta" pageSegment="personal" event="lp_cta_secondary_click"><Button variant="outline">Ver planos</Button></TrackedCtaLink>
          <TrackedCtaLink href="/nutricionistas" cta="Parceria com nutrição" placement="personal_page_main_cta" pageSegment="personal" event="lp_cta_secondary_click"><Button variant="ghost">Parceria com nutrição</Button></TrackedCtaLink>
        </div>
        <p className="mt-3 text-sm text-text-secondary">30 dias grátis, sem cartão.</p>
      </section>

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Acesso direto para personal trainer</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Entre na sua conta, faça cadastro profissional e revise termos/condições em um fluxo rápido.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <TrackedCtaLink href="/login" cta="Entrar personal" placement="personal_page_quick_access" pageSegment="personal" event="lp_cta_secondary_click"><Button variant="secondary">Entrar</Button></TrackedCtaLink>
          <TrackedCtaLink href="/register/personal" cta="Cadastrar personal" placement="personal_page_quick_access" pageSegment="personal" event="lp_register_start"><Button variant="outline">Cadastrar</Button></TrackedCtaLink>
          <TrackedCtaLink href="/pricing" cta="Planos personal" placement="personal_page_quick_access" pageSegment="personal" event="lp_cta_secondary_click"><Button variant="ghost">Planos</Button></TrackedCtaLink>
          <TrackedCtaLink href="/termos" cta="Termos personal" placement="personal_page_quick_access" pageSegment="personal" event="lp_cta_secondary_click"><Button variant="ghost">Termos e Condições</Button></TrackedCtaLink>
        </div>
      </section>
    </main>
  )
}
