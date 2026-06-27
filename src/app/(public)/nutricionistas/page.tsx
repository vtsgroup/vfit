import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { faqSchema } from '@/lib/schemas'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import {
  LightBand, SectionHead, FeatureCard, CheckItem, HoverEdge, PillArrow,
  lightCard, greenChip, monoLabel, pillPrimaryClass, pillGhostClass,
} from '@/components/shared/light-section'

export const metadata: Metadata = buildSeoMetadata({
  title: 'VFIT para Nutricionistas | Integre Nutrição e Treino com IA',
  description:
    'Nutricionistas: trabalhe com personal trainers no mesmo painel, acompanhe progresso integrado do aluno, use área de nutrição e monetize com afiliados.',
  path: '/nutricionistas',
  ogImage: '/og/og-default.png',
})

const FEATURES: { icon: DSIconName; title: string; desc: string }[] = [
  { icon: 'apple', title: 'Área de nutrição dedicada', desc: 'Acesse um fluxo próprio para conduta nutricional e acompanhamento contínuo do aluno.' },
  { icon: 'activity', title: 'Visão conjunta com personal', desc: 'Entenda treino, frequência e resposta do aluno para ajustar dieta com mais precisão.' },
  { icon: 'fileSpreadsheet', title: 'Relatórios integrados', desc: 'Use dados de evolução conjunta para consultas objetivas e decisões baseadas em evidência.' },
  { icon: 'userPlus', title: 'Canal de aquisição + afiliados', desc: 'Ganhe novos pacientes e monetize indicações qualificadas com comissão recorrente.' },
]

const MVP = ['Contexto de treino para leitura clínica da conduta', 'Jornada do paciente alinhada ao acompanhamento do personal', 'Colaboração entre profissionais com comunicação contextual', 'Captação de parceria via landing e fluxo dedicado']
const ROADMAP = ['Camada de plano alimentar integrada ao fluxo do aluno', 'Relatórios conjuntos treino + nutrição para consulta', 'IA de suporte para recomendações baseadas em rotina real']

export default function NutricionistasPage() {
  const professionalServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'VFIT para Nutricionistas',
    serviceType: 'Plataforma de integração entre treino e nutrição',
    audience: { '@type': 'ProfessionalAudience', audienceType: 'Nutritionists' },
    provider: { '@type': 'Organization', name: 'VFIT', url: 'https://vfit.app.br' },
    areaServed: 'BR',
  }

  const faq = faqSchema([
    { question: 'Nutricionistas precisam pagar para começar no VFIT?', answer: 'A entrada inicial pode ser feita com cadastro de interesse e validação de parceria comercial.' },
    { question: 'Consigo acompanhar evolução de treino dos meus pacientes?', answer: 'Sim, a proposta do VFIT é integrar contexto de treino com conduta nutricional para melhor adesão.' },
    { question: 'O VFIT ajuda na aquisição de pacientes?', answer: 'Sim, a página e o posicionamento de parceria foram desenhados para ampliar descoberta e conversão.' },
    { question: 'Nutricionista e personal conseguem conversar no contexto do aluno?', answer: 'Sim. A proposta do VFIT inclui comunicação entre profissionais para alinhar dieta e treino com decisões mais rápidas.' },
    { question: 'Nutricionista também ganha comissões por indicação?', answer: 'Sim. O nutricionista pode indicar novos alunos e receber comissão recorrente conforme o programa de afiliados ativo.' },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <PageHero
        title="Nutricionistas: Seu Paciente Treina com IA. Você Cuida da Dieta."
        subtitle="No VFIT, nutricionista e personal trabalham juntos no mesmo painel para acelerar resultado real com treino + dieta alinhados."
        badge="Nutricionistas"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Nutricionistas', href: '/nutricionistas' }]}
      />

      <LightBand>
        {/* Features */}
        <div>
          <SectionHead icon="apple" eyebrow="/PARA NUTRICIONISTAS" lead="Nutrição e treino" accent="no mesmo painel" sub="Acompanhe o paciente com contexto de treino real — e ganhe um canal novo de pacientes." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title}>{f.desc}</FeatureCard>
            ))}
          </div>
        </div>

        {/* Painel colaborativo */}
        <div>
          <SectionHead icon="heartHandshake" eyebrow="/COLABORAÇÃO" lead="Painel colaborativo:" accent="treino + dieta" sub="Você e o personal acompanham o mesmo aluno, com comunicação no contexto." />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              { icon: 'clipboardList' as const, title: 'O que a nutrição acompanha', items: ['Frequência e consistência de treino', 'Indicadores de progresso e adesão', 'Feedback do aluno para ajustes alimentares'] },
              { icon: 'messageSquare' as const, title: 'Comunicação entre profissionais', items: ['Chat entre personal e nutricionista no caso do aluno', 'Ajustes rápidos para manter plano coerente', 'Menos conflito de orientação e mais resultado'] },
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

        {/* Comece como parceiro — card destaque */}
        <div className="relative overflow-hidden rounded-3xl p-7 sm:p-9" style={lightCard}>
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent" />
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-brand-primary" style={greenChip}><DSIcon name="userPlus" size={22} /></span>
          <h3 className="font-syne text-xl font-black tracking-tight text-gray-950">Comece como parceiro</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
            Cadastre seu interesse para atuar na área de nutrição do VFIT e colaborar com personais no acompanhamento conjunto dos alunos.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <TrackedCtaLink href="/register/personal?type=nutri" cta="Quero ser parceiro" placement="nutri_page_main_cta" pageSegment="nutricionistas" event="lp_register_start" className={pillPrimaryClass}>Quero ser parceiro <PillArrow /></TrackedCtaLink>
            <TrackedCtaLink href="/app-personal-trainer" cta="Ver solução para personais" placement="nutri_page_main_cta" pageSegment="nutricionistas" event="lp_cta_secondary_click" className={pillGhostClass}>Solução para personais</TrackedCtaLink>
            <TrackedCtaLink href="/afiliados" cta="Programa de afiliados" placement="nutri_page_main_cta" pageSegment="nutricionistas" event="lp_cta_secondary_click" className={pillGhostClass}>Programa de afiliados</TrackedCtaLink>
          </div>
        </div>

        {/* MVP + roadmap */}
        <div>
          <SectionHead icon="rocket" eyebrow="/INTEGRAÇÃO" lead="Treino + nutrição:" accent="MVP e roadmap" sub="O que já roda hoje e o que vem na próxima fase." />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {/* MVP */}
            <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1" style={lightCard}>
              <HoverEdge />
              <div className="relative flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-brand-primary" style={greenChip}><DSIcon name="checkCircle" size={18} /></span>
                <h3 className="font-syne text-base font-black tracking-tight text-gray-950">MVP <span className="text-emerald-600">· já disponível</span></h3>
              </div>
              <ul className="relative mt-4 space-y-2.5">{MVP.map((it) => <CheckItem key={it}>{it}</CheckItem>)}</ul>
            </div>
            {/* Roadmap */}
            <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1" style={lightCard}>
              <HoverEdge />
              <div className="relative flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 ring-1 ring-slate-200" style={{ background: 'linear-gradient(180deg, #ffffff, #f1f5f9)' }}><DSIcon name="calendarClock" size={18} /></span>
                <h3 className="font-syne text-base font-black tracking-tight text-gray-950">Roadmap <span className="text-slate-400" style={monoLabel}>· próxima fase</span></h3>
              </div>
              <ul className="relative mt-4 space-y-2.5">
                {ROADMAP.map((it) => (
                  <li key={it} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-slate-400 ring-1 ring-slate-200"><DSIcon name="arrowRight" size={10} /></span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Acesso direto */}
        <div>
          <SectionHead icon="logIn" eyebrow="/ACESSO DIRETO" lead="Entre ou cadastre seu" accent="perfil profissional" />
          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedCtaLink href="/login" cta="Entrar nutri" placement="nutri_page_quick_access" pageSegment="nutricionistas" event="lp_cta_secondary_click" className={pillGhostClass}><DSIcon name="logIn" size={15} /> Entrar</TrackedCtaLink>
            <TrackedCtaLink href="/register/personal?type=nutri" cta="Cadastrar nutri" placement="nutri_page_quick_access" pageSegment="nutricionistas" event="lp_register_start" className={pillPrimaryClass}>Cadastrar <PillArrow /></TrackedCtaLink>
            <TrackedCtaLink href="/afiliados" cta="Afiliados nutri" placement="nutri_page_quick_access" pageSegment="nutricionistas" event="lp_cta_secondary_click" className={pillGhostClass}>Afiliados</TrackedCtaLink>
            <TrackedCtaLink href="/termos" cta="Termos nutri" placement="nutri_page_quick_access" pageSegment="nutricionistas" event="lp_cta_secondary_click" className={pillGhostClass}>Termos e Condições</TrackedCtaLink>
          </div>
        </div>
      </LightBand>
    </>
  )
}
