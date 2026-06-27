import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { faqSchema } from '@/lib/schemas'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { DSIcon } from '@/components/ui/ds-icon'
import {
  LightBand, SectionHead, FeatureCard, CheckItem, HoverEdge, PillArrow,
  lightCard, greenChip, pillPrimaryClass, pillGhostClass,
} from '@/components/shared/light-section'

export const metadata: Metadata = buildSeoMetadata({
  title: 'VFIT para Personal Trainers | Plataforma com IA para Gestão e Treinos',
  description:
    'Plataforma para personal trainers com IA, gestão de alunos, colaboração com nutricionistas, chat profissional e monetização por afiliados.',
  path: '/app-personal-trainer',
  ogImage: '/og/og-default.png',
})

const STEPS = [
  'Crie sua conta profissional',
  'Cadastre aluno, objetivo e contexto nutricional',
  'Gere treino com IA e acompanhe evolução integrada',
  'Alinhe decisões com nutricionista no chat profissional',
]

export default function AppPersonalTrainerPage() {
  const faq = faqSchema([
    { question: 'O VFIT funciona para personal trainer iniciante?', answer: 'Sim. O VFIT atende desde profissionais iniciantes até operações avançadas com múltiplos alunos.' },
    { question: 'Consigo automatizar cobranças no VFIT?', answer: 'Sim. O fluxo permite automação de cobrança para reduzir inadimplência e esforço operacional.' },
    { question: 'Posso montar treinos com inteligência artificial?', answer: 'Sim. A IA acelera a prescrição e ajuda na personalização baseada no perfil do aluno.' },
    { question: 'Consigo trabalhar junto com nutricionista no VFIT?', answer: 'Sim. Personal e nutricionista acompanham o mesmo aluno em um fluxo integrado para alinhar treino, dieta e evolução.' },
    { question: 'Personal pode ganhar comissão por indicação?', answer: 'Sim. O personal pode indicar alunos e receber comissão recorrente por conversão qualificada no programa de afiliados.' },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <PageHero
        title="Personal Trainer + Nutricionista no Mesmo Painel"
        subtitle="Use IA para prescrever treinos, acompanhe a evolução real do aluno e trabalhe em conjunto com a nutricionista para acelerar resultado."
        badge="Personal Trainer"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'App Personal Trainer', href: '/app-personal-trainer' }]}
      />

      <LightBand>
        {/* Features */}
        <div>
          <SectionHead icon="dumbbell" eyebrow="/PARA PERSONAL TRAINERS" lead="Tudo num" accent="painel só" sub="IA, gestão e cobrança no mesmo fluxo — você foca no aluno, a plataforma cuida do resto." />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <FeatureCard icon="brainCircuit" title="Treinos com IA">Monte treinos personalizados em minutos com base no perfil e evolução de cada aluno.</FeatureCard>
            <FeatureCard icon="layoutDashboard" title="Painel unificado">Treino, progresso e contexto nutricional do aluno no mesmo fluxo operacional.</FeatureCard>
            <FeatureCard icon="dollarSign" title="Cobrança automática">Automatize recorrência e reduza inadimplência com pagamentos no fluxo do app.</FeatureCard>
          </div>
        </div>

        {/* Colaboração com nutricionista */}
        <div>
          <SectionHead icon="heartHandshake" eyebrow="/COLABORAÇÃO" lead="Trabalho conjunto com" accent="nutricionista" sub="Treino e dieta no mesmo aluno, com comunicação no contexto — menos ruído, mais resultado." />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              { icon: 'activity' as const, title: 'Visão clínica integrada', items: ['Entenda a estratégia alimentar ativa do aluno', 'Ajuste periodização com base na adesão nutricional', 'Acompanhe evolução com leitura de treino + nutrição'] },
              { icon: 'messageSquare' as const, title: 'Chat entre profissionais', items: ['Personal e nutricionista conversam no contexto do aluno', 'Decisões mais rápidas para ajuste de treino e dieta', 'Menos ruído operacional e mais foco em resultado real'] },
            ].map((b) => (
              <div key={b.title} className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1" style={lightCard}>
                <HoverEdge />
                <div className="relative flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-brand-primary" style={greenChip}><DSIcon name={b.icon} size={18} /></span>
                  <h3 className="font-syne text-base font-black tracking-tight text-gray-950">{b.title}</h3>
                </div>
                <ul className="relative mt-4 space-y-2.5">
                  {b.items.map((it) => <CheckItem key={it}>{it}</CheckItem>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Como funciona — passos + CTA principal */}
        <div>
          <SectionHead icon="rocket" eyebrow="/COMO FUNCIONA" lead="Comece em" accent="4 passos" sub="Do cadastro ao acompanhamento integrado, sem fricção." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s} className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1" style={lightCard}>
                <HoverEdge />
                <span className="relative flex h-9 w-9 items-center justify-center rounded-xl font-syne text-sm font-black text-[#08122B]" style={{ background: 'linear-gradient(135deg, #34e565, #16a34a)', boxShadow: '0 4px 12px -2px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.4)' }}>{i + 1}</span>
                <p className="relative mt-3 text-sm font-medium leading-relaxed text-gray-800">{s}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <TrackedCtaLink href="/register/personal" cta="Começar grátis" placement="personal_page_main_cta" pageSegment="personal" event="lp_register_start" className={pillPrimaryClass}>Começar grátis <PillArrow /></TrackedCtaLink>
            <TrackedCtaLink href="/pricing" cta="Ver planos" placement="personal_page_main_cta" pageSegment="personal" event="lp_cta_secondary_click" className={pillGhostClass}>Ver planos</TrackedCtaLink>
            <TrackedCtaLink href="/nutricionistas" cta="Parceria com nutrição" placement="personal_page_main_cta" pageSegment="personal" event="lp_cta_secondary_click" className={pillGhostClass}>Parceria com nutrição</TrackedCtaLink>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500"><DSIcon name="checkCircle" size={15} className="text-brand-primary" /> 30 dias grátis, sem cartão.</p>
        </div>

        {/* Afiliados — card destaque */}
        <div className="relative overflow-hidden rounded-3xl p-7 sm:p-9" style={lightCard}>
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-brand-primary" style={greenChip}><DSIcon name="share2" size={22} /></span>
              <h3 className="font-syne text-xl font-black tracking-tight text-gray-950">Afiliados para personal trainers</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Além do acompanhamento, indique alunos para o VFIT e ganhe comissão recorrente por cada conversão ativa, conforme as regras do programa.
              </p>
            </div>
            <TrackedCtaLink href="/afiliados" cta="Entender comissões" placement="personal_page_affiliate_cta" pageSegment="personal" event="lp_cta_secondary_click" className={`shrink-0 ${pillGhostClass}`}>Entender comissões <DSIcon name="arrowRight" size={15} /></TrackedCtaLink>
          </div>
        </div>

        {/* Acesso direto */}
        <div>
          <SectionHead icon="logIn" eyebrow="/ACESSO DIRETO" lead="Entre ou cadastre seu" accent="perfil profissional" />
          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedCtaLink href="/login" cta="Entrar personal" placement="personal_page_quick_access" pageSegment="personal" event="lp_cta_secondary_click" className={pillGhostClass}><DSIcon name="logIn" size={15} /> Entrar</TrackedCtaLink>
            <TrackedCtaLink href="/register/personal" cta="Cadastrar personal" placement="personal_page_quick_access" pageSegment="personal" event="lp_register_start" className={pillPrimaryClass}>Cadastrar <PillArrow /></TrackedCtaLink>
            <TrackedCtaLink href="/pricing" cta="Planos personal" placement="personal_page_quick_access" pageSegment="personal" event="lp_cta_secondary_click" className={pillGhostClass}>Planos</TrackedCtaLink>
            <TrackedCtaLink href="/termos" cta="Termos personal" placement="personal_page_quick_access" pageSegment="personal" event="lp_cta_secondary_click" className={pillGhostClass}>Termos e Condições</TrackedCtaLink>
          </div>
        </div>
      </LightBand>
    </>
  )
}
