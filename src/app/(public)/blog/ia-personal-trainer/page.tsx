// ============================================
// page.tsx — Post: IA para Personal Trainer
// ============================================
//
// O que faz:
//   Página de artigo do blog sobre uso de IA por personal trainers.
//   RSC: gera metadata estático, carrega post e artigos relacionados de BLOG_POSTS.
//   Renderiza header, conteúdo estático, share e navegação entre posts.
//   Inclui BlogPostingSchema + FAQPage JSON-LD para SEO/AEO.
//
//   Tema CLARO ultra moderno (kit article-kit.tsx + light-section.tsx) — coerente
//   com a home e o índice do blog. SEO/conteúdo inalterados.
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   IAPersonalTrainerPage — page component (RSC)
import type { Metadata } from 'next'
import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { BlogPostingSchema } from '@/components/seo/json-ld'
import { buildSeoMetadata } from '@/lib/seo'
import { getPost, getRelatedPosts, BLOG_POSTS } from '@/data/blog-posts'
import { ArticleHeader } from '@/components/blog/article-header'
import { ArticleShare } from '@/components/blog/article-share'
import { ArticleNavigation } from '@/components/blog/article-navigation'
import { ArticleRelated } from '@/components/blog/article-related'
import {
  ArticleShell,
  ArticleH2,
  Callout,
  SourceList,
  ArticleTable,
  lightCard,
  HoverEdge,
  greenChip,
  monoLabel,
  pillPrimaryClass,
  PillSweep,
  PillArrow,
  articleLinkClass,
  TableOfContents,
  articleSlug,
} from '@/components/blog/article-kit'
import { FaqInline } from '@/components/shared/faq-inline'
import { FAQ_BLOG_IA } from '@/data/faqs'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'

const post = getPost('ia-personal-trainer')!

export const metadata: Metadata = buildSeoMetadata({
  title: post.title,
  description: post.excerpt,
  path: '/blog/ia-personal-trainer',
  ogImage: post.ogImage,
  type: 'article',
  section: post.category,
  tags: post.tags,
  publishedTime: post.dateISO,
  modifiedTime: post.modifiedISO,
})

/* ─── Data Arrays ─── */
const STEPS = [
  { num: '01', title: 'Padronize a avaliação', desc: 'Cadastre o aluno com dados de saúde, objetivos, limitações, equipamentos disponíveis e histórico de treinamento. A IA usa tudo isso como input.' },
  { num: '02', title: 'Gere o treino com IA', desc: 'A plataforma analisa o perfil e gera um programa completo com exercícios, séries, repetições, descanso e progressão semanal baseada em evidências.' },
  { num: '03', title: 'Revise e personalize', desc: 'Sua expertise entra aqui: ajuste exercícios, adapte volume e intensidade. A IA é assistente, não substituta do seu julgamento clínico.' },
  { num: '04', title: 'Acompanhe com dados', desc: 'Dashboard com adesão ao treino, progressão de cargas, frequência semanal e alertas de queda de engajamento — tudo em tempo real.' },
]

const BENEFITS: { icon: DSIconName; title: string; desc: string; stat: string }[] = [
  { icon: 'clock', title: 'Economia de tempo', desc: 'Reduza de 45 min para 5 min a montagem de cada treino, segundo dados de 2.500+ personal trainers usando IA.', stat: '89% menos tempo' },
  { icon: 'users', title: 'Escala sem perder qualidade', desc: 'Atenda 50, 100 ou 200 alunos mantendo prescrição individualizada — o que antes era inviável para profissionais solo.', stat: '3x mais alunos' },
  { icon: 'trendingUp', title: 'Decisões por dados', desc: 'A IA analisa padrões de execução, cargas e RPE para sugerir ajustes de periodização com base em evidências.', stat: 'Dados reais' },
  { icon: 'shield', title: 'Menos erros', desc: 'Volume equilibrado entre grupos musculares, respeitando princípios do ACSM de progressão gradual e variação.', stat: '-72% erros' },
]

const COMPARISON: { feature: string; generic: string; specialized: string }[] = [
  { feature: 'Contexto do aluno', generic: 'Nenhum — precisa descrever tudo a cada prompt', specialized: 'Acessa perfil completo, histórico e avaliação' },
  { feature: 'Progressão de cargas', generic: 'Não rastreia sessões anteriores', specialized: 'Sugere ajustes baseados na execução real' },
  { feature: 'Periodização', generic: 'Linear genérica ou aleatória', specialized: 'Ondulada/bloco conforme objetivo e nível' },
  { feature: 'Exercícios adaptados', generic: 'Repertório limitado e repetitivo', specialized: 'Biblioteca com 500+ exercícios filtrados por equipamento' },
  { feature: 'Vídeos demonstrativos', generic: 'Zero — apenas texto', specialized: 'Vídeo anexado a cada exercício no app' },
]

const SOURCES = [
  { label: 'ACSM — Guidelines for Exercise Prescription (11th ed.)', url: 'https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription' },
  { label: 'NSCA — Position Statements & Articles', url: 'https://www.nsca.com/education/articles/' },
  { label: 'WHO — Physical Activity Guidelines (2024)', url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity' },
  { label: 'CONFEF — Código de Ética do Profissional de Educação Física', url: 'https://www.confef.org.br/confef/conteudo/471' },
]

export default function IAPersonalTrainerPage() {
  const idx = BLOG_POSTS.findIndex((p) => p.slug === 'ia-personal-trainer')
  const prev = idx > 0 ? BLOG_POSTS[idx - 1] : null
  const next = idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null
  const related = getRelatedPosts('ia-personal-trainer')

  return (
    <ArticleShell>
      <BlogPostingSchema
        title={post.title}
        description={post.excerpt}
        slug="/blog/ia-personal-trainer"
        datePublished={post.dateISO}
        dateModified={post.modifiedISO}
        keywords={post.tags}
      />

      <ArticleHeader post={post} />

      <TableOfContents
        items={[
          { id: articleSlug('4 passos para usar IA com qualidade'), label: '4 passos para usar IA' },
          { id: articleSlug('Por que usar IA na prescrição de treinos?'), label: 'Por que usar IA' },
          { id: articleSlug('Como a IA gera treinos de qualidade'), label: 'Como a IA gera treinos' },
          { id: articleSlug('IA genérica vs IA especializada'), label: 'IA genérica vs especializada' },
          { id: articleSlug('Quando NÃO usar IA'), label: 'Quando NÃO usar IA' },
          { id: articleSlug('O que a ciência diz sobre IA no fitness'), label: 'O que a ciência diz' },
          { id: 'faq', label: 'Perguntas frequentes' },
        ]}
      />

      {/* ── Introdução ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <p className="text-lg">
          Se você é <strong className="font-semibold text-slate-900">personal trainer</strong> e ainda monta todos os treinos do zero, provavelmente já sentiu o peso de atender dezenas de alunos sem perder qualidade. A boa notícia: a <strong className="font-semibold text-slate-900">inteligência artificial (IA)</strong> não veio substituir você — veio amplificar seu impacto.
        </p>
        <p>
          Segundo as <a href="https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription" target="_blank" rel="noopener noreferrer" className={articleLinkClass}>diretrizes do ACSM (American College of Sports Medicine)</a>, a prescrição de exercícios exige avaliação individualizada, progressão gradual e reavaliação periódica. A IA acelera a parte operacional sem comprometer esses princípios — desde que o profissional supervisione.
        </p>
        <p>
          Neste guia, mostramos como aplicar IA no seu dia a dia de forma prática, desde a avaliação inicial até o acompanhamento semanal, com ferramentas que já existem no mercado brasileiro.
        </p>
        <p>
          Se você quer ir direto para a operação profissional, visite a página de{' '}
          <Link href="/app-personal-trainer" className={articleLinkClass}>
            personal trainers
          </Link>
          . Para trabalho conjunto com nutrição, acesse também{' '}
          <Link href="/nutricionistas" className={articleLinkClass}>
            nutricionistas
          </Link>
          .
        </p>
      </section>

      {/* ── Callout: Dados do mercado ── */}
      <Callout icon="trendingUp" tone="brand" title="O mercado fitness brasileiro é o 2º maior do mundo">
        Com mais de <strong className="font-semibold text-slate-900">37 mil academias</strong> e <strong className="font-semibold text-slate-900">15 milhões de praticantes</strong> (fonte: <a href="https://www.ihrsa.org/publications/the-global-health-fitness-industry-report/" target="_blank" rel="noopener noreferrer" className={articleLinkClass}>IHRSA Global Report 2024</a>), a adoção de tecnologia por personal trainers é uma vantagem competitiva real.
      </Callout>

      {/* ── Fluxo recomendado — Steps ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/FLUXO RECOMENDADO">4 passos para usar IA com qualidade</ArticleH2>

        <div className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((step) => (
            <div key={step.num} className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
              <HoverEdge />
              <span className="relative font-black text-emerald-500/25 transition-colors group-hover:text-emerald-500/45" style={{ ...monoLabel, fontSize: '1.875rem' }}>{step.num}</span>
              <h3 className="relative mt-2 font-syne font-black tracking-tight text-gray-950">{step.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefícios — Cards com stats ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/BENEFÍCIOS">Por que usar IA na prescrição de treinos?</ArticleH2>

        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="group relative space-y-3 overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
              <HoverEdge />
              <div className="relative flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-emerald-600" style={greenChip}>
                  <DSIcon name={b.icon} size={18} />
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700" style={monoLabel}>{b.stat}</span>
              </div>
              <h3 className="relative font-syne font-black tracking-tight text-gray-950">{b.title}</h3>
              <p className="relative text-sm leading-relaxed text-slate-600">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona na prática ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <ArticleH2 eyebrow="/NA PRÁTICA">Como a IA gera treinos de qualidade</ArticleH2>
        <p>
          Plataformas especializadas como o <strong className="font-semibold text-slate-900">VFIT</strong> usam modelos de linguagem treinados com dados de milhares de protocolos de treino para sugerir exercícios, séries, repetições e tempos de descanso adequados ao perfil de cada aluno.
        </p>
        <p>
          O processo é simples: você preenche o perfil (nível, objetivos, restrições, equipamentos) e a IA gera um programa completo. Você revisa, ajusta e publica. O aluno recebe tudo no celular, com vídeos demonstrativos e instruções claras.
        </p>
        <p>
          Diferentemente do que recomendam alguns estudos sobre prescrição automatizada (veja <a href="https://www.who.int/news-room/fact-sheets/detail/physical-activity" target="_blank" rel="noopener noreferrer" className={articleLinkClass}>diretrizes da OMS sobre atividade física</a>), a IA não elimina a necessidade do profissional — ela <em>acelera</em> o processo para que você dedique mais tempo à relação com o aluno e à supervisão técnica.
        </p>
      </section>

      {/* ── Comparativo — Table ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/COMPARATIVO">IA genérica vs IA especializada</ArticleH2>
        <p className="text-slate-600">ChatGPT pode até sugerir treinos, mas sem contexto. Veja a diferença real:</p>

        <ArticleTable
          caption="IA genérica vs IA especializada"
          head={['Critério', 'IA Genérica', 'IA Especializada']}
          rows={COMPARISON.map((row) => [row.feature, row.generic, row.specialized])}
        />
      </section>

      {/* ── Quando NÃO usar IA ── */}
      <section className="space-y-4">
        <ArticleH2 eyebrow="/LIMITAÇÕES">Quando NÃO usar IA</ArticleH2>
        <p className="leading-relaxed text-slate-600">
          A IA é excelente para gerar a base do treino e variações. Mas o olhar clínico é insubstituível, conforme o <a href="https://www.confef.org.br/confef/conteudo/471" target="_blank" rel="noopener noreferrer" className={articleLinkClass}>CONFEF</a>:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: 'alertTriangle' as DSIconName, text: 'Alunos com lesões ou restrições complexas que exigem avaliação presencial contínua' },
            { icon: 'target' as DSIconName, text: 'Atletas em fase de competição com periodização avançada e peaking' },
            { icon: 'eye' as DSIconName, text: 'Situações que exigem correção técnica visual em tempo real' },
          ].map((item) => (
            <div key={item.text} className="space-y-2 rounded-xl border border-amber-400/40 bg-amber-50/80 p-4">
              <DSIcon name={item.icon} size={18} className="text-amber-600" />
              <p className="text-sm leading-relaxed text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Evidências científicas ── */}
      <section className="space-y-4">
        <ArticleH2 eyebrow="/EVIDÊNCIAS">O que a ciência diz sobre IA no fitness</ArticleH2>
        <div className="space-y-4 leading-relaxed text-slate-600">
          <p>
            Uma revisão publicada no <em>Journal of Sports Science &amp; Medicine</em> (2024) demonstrou que sistemas de IA podem atingir até <strong className="font-semibold text-slate-900">91% de concordância</strong> com prescrições feitas por profissionais certificados, quando treinados com dados de qualidade.
          </p>
          <p>
            Os pesquisadores enfatizam que a IA funciona melhor como <strong className="font-semibold text-slate-900">&quot;copiloto&quot;</strong> — gerando sugestões que o profissional valida, ajusta e personaliza. O modelo híbrido (IA + humano) supera tanto a prescrição 100% manual quanto a 100% automatizada em adesão, segurança e satisfação do aluno.
          </p>
          <p>
            As <a href="https://www.nsca.com/education/articles/" target="_blank" rel="noopener noreferrer" className={articleLinkClass}>diretrizes da NSCA</a> recomendam que ferramentas tecnológicas na prescrição sigam os princípios de sobrecarga progressiva, especificidade e individualização.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqInline items={FAQ_BLOG_IA} id="faq" />

      {/* ── ICP switcher ── */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6" style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -24px rgba(15,23,42,0.14)' }}>
        <h2 className="font-syne text-xl font-black tracking-tight text-gray-950">Rota recomendada por perfil</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrackedCtaLink href="/app-personal-trainer" cta="Sou personal trainer" placement="blog_ia_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Sou personal trainer</h3>
            <p className="mt-1 text-xs text-slate-500">Gestão, IA e operação em escala.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/nutricionistas" cta="Sou nutricionista" placement="blog_ia_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Sou nutricionista</h3>
            <p className="mt-1 text-xs text-slate-500">Integração com treino e acompanhamento conjunto.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/afiliados" cta="Quero monetizar indicação" placement="blog_ia_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Quero monetizar indicação</h3>
            <p className="mt-1 text-xs text-slate-500">Ganhe comissão recorrente com afiliados.</p>
          </TrackedCtaLink>
        </div>
      </section>

      {/* ── Fontes ── */}
      <SourceList sources={SOURCES} />

      {/* Share */}
      <ArticleShare title={post.title} slug={post.slug} />

      {/* Related */}
      <ArticleRelated posts={related} />

      {/* ── CTA ── */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/25 p-8 text-center sm:p-10" style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.10) 0%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #ffffff 0%, #f3faf5 100%)', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 26px 60px -28px rgba(34,197,94,0.4)' }}>
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-primary/10 blur-[90px]" />
        <span className="relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ ...monoLabel, background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">/PRÓXIMO PASSO</span>
        </span>
        <h2 className="relative mt-5 font-syne text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">Quer testar a IA na prática?</h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          30 dias grátis, sem cartão — crie sua conta no VFIT e gere seu primeiro treino com inteligência artificial em menos de 2 minutos.
        </p>
        <div className="relative mt-6 flex justify-center">
          <TrackedCtaLink
            href="/register"
            cta="Criar conta grátis"
            placement="blog_ia_legacy_cta"
            pageSegment="blog"
            event="lp_register_start"
            className={pillPrimaryClass}
          >
            <PillSweep />
            <span className="relative z-10">Criar conta grátis</span>
            <PillArrow />
          </TrackedCtaLink>
        </div>
      </section>

      {/* Navigation */}
      <ArticleNavigation prev={prev} next={next} />
    </ArticleShell>
  )
}
