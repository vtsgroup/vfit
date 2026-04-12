import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { Button } from '@/components/ui/button'
import { faqSchema } from '@/lib/schemas'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { AFFILIATE_PROGRAM, AFFILIATE_TIERS } from '@config/constants'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Programa de Afiliados VFIT | Indique e Ganhe Comissão Recorrente',
  description:
    'Ganhe comissão recorrente indicando o VFIT. Sem limite de indicações, com dashboard de performance e pagamentos.',
  path: '/afiliados',
  ogImage: '/og/og-default.png',
})

export default function AfiliadosPublicPage() {
  const faq = faqSchema([
    {
      question: 'Como funciona o programa de afiliados da VFIT?',
      answer: 'Você ativa seu link de indicação, compartilha com sua audiência e acompanha as conversões no dashboard.',
    },
    {
      question: 'A comissão é recorrente?',
      answer: 'Sim. O programa opera com comissão recorrente enquanto a assinatura indicada estiver ativa e adimplente.',
    },
    {
      question: 'Quem pode ser afiliado?',
      answer: 'Personal trainers, nutricionistas, alunos e criadores de conteúdo do nicho fitness.',
    },
  ])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <PageHero
        title="Indique o VFIT. Ganhe Todo Mês. Sem Limite."
        subtitle="Cada indicação ativa pode gerar comissão recorrente. Você compartilha seu link e acompanha tudo no dashboard."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Afiliados' },
        ]}
      />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ['Cadastre-se', 'Crie sua conta e ative seu link de indicação em poucos minutos.'],
          ['Compartilhe', 'Divulgue com alunos, profissionais e criadores do nicho fitness.'],
          ['Receba', 'Acompanhe conversões e comissões recorrentes pelo painel.'],
        ].map(([title, desc]) => (
          <article key={title} className="surface-card rounded-2xl p-5">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Para quem é</h2>
        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
          <li>• Personal trainers que indicam colegas e alunos</li>
          <li>• Nutricionistas que querem monetizar a base de pacientes</li>
          <li>• Criadores e influenciadores do nicho fitness</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <TrackedCtaLink href="/dashboard/affiliates" cta="Ativar programa" placement="afiliados_page_main_cta" pageSegment="afiliados" event="lp_register_start"><Button>Ativar programa</Button></TrackedCtaLink>
          <TrackedCtaLink href="/app-personal-trainer" cta="Sou personal trainer" placement="afiliados_page_main_cta" pageSegment="afiliados" event="lp_cta_secondary_click"><Button variant="outline">Sou personal trainer</Button></TrackedCtaLink>
          <TrackedCtaLink href="/nutricionistas" cta="Sou nutricionista" placement="afiliados_page_main_cta" pageSegment="afiliados" event="lp_cta_secondary_click"><Button variant="ghost">Sou nutricionista</Button></TrackedCtaLink>
        </div>
      </section>

      <section className="mt-6 surface-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-text-primary">Modelo de comissão oficial</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Pagamento via {AFFILIATE_PROGRAM.payout_method}, frequência {AFFILIATE_PROGRAM.payout_frequency}. {AFFILIATE_PROGRAM.commission_note}
        </p>

        <div className="mt-4 overflow-hidden rounded-xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/4">
                <th className="px-3 py-2 text-left text-text-secondary">Tier</th>
                <th className="px-3 py-2 text-left text-text-secondary">Comissão</th>
                <th className="px-3 py-2 text-left text-text-secondary">Ativação</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(AFFILIATE_TIERS).map((tier) => (
                <tr key={tier.name} className="border-t border-white/6">
                  <td className="px-3 py-2 text-text-primary">{tier.name}</td>
                  <td className="px-3 py-2 text-text-primary">{tier.commission_percentage}%</td>
                  <td className="px-3 py-2 text-text-secondary">{tier.min_referrals} indicações ativas</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
