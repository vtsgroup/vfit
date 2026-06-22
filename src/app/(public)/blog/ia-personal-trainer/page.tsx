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
    <article className="mx-auto max-w-3xl space-y-12 px-6 pb-24">
      <BlogPostingSchema
        title={post.title}
        description={post.excerpt}
        slug="/blog/ia-personal-trainer"
        datePublished={post.dateISO}
        dateModified={post.modifiedISO}
        keywords={post.tags}
      />

      <ArticleHeader post={post} />

      {/* ── Introdução ── */}
      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <p className="text-lg">
          Se você é <strong className="text-white">personal trainer</strong> e ainda monta todos os treinos do zero, provavelmente já sentiu o peso de atender dezenas de alunos sem perder qualidade. A boa notícia: a <strong className="text-white">inteligência artificial (IA)</strong> não veio substituir você — veio amplificar seu impacto.
        </p>
        <p>
          Segundo as <a href="https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline decoration-brand-primary/30 hover:decoration-brand-primary transition-colors">diretrizes do ACSM (American College of Sports Medicine)</a>, a prescrição de exercícios exige avaliação individualizada, progressão gradual e reavaliação periódica. A IA acelera a parte operacional sem comprometer esses princípios — desde que o profissional supervisione.
        </p>
        <p>
          Neste guia, mostramos como aplicar IA no seu dia a dia de forma prática, desde a avaliação inicial até o acompanhamento semanal, com ferramentas que já existem no mercado brasileiro.
        </p>
        <p>
          Se você quer ir direto para a operação profissional, visite a página de{' '}
          <Link href="/app-personal-trainer" className="text-brand-primary underline decoration-brand-primary/30 hover:decoration-brand-primary transition-colors">
            personal trainers
          </Link>
          . Para trabalho conjunto com nutrição, acesse também{' '}
          <Link href="/nutricionistas" className="text-brand-primary underline decoration-brand-primary/30 hover:decoration-brand-primary transition-colors">
            nutricionistas
          </Link>
          .
        </p>
      </section>

      {/* ── Callout: Dados do mercado ── */}
      <div className="flex gap-4 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/20">
          <DSIcon name="trendingUp" size={20} className="text-brand-primary" />
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-white">O mercado fitness brasileiro é o 2º maior do mundo</p>
          <p className="text-zinc-400">
            Com mais de <strong className="text-zinc-200">37 mil academias</strong> e <strong className="text-zinc-200">15 milhões de praticantes</strong> (fonte: <a href="https://www.ihrsa.org/publications/the-global-health-fitness-industry-report/" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline decoration-brand-primary/30">IHRSA Global Report 2024</a>), a adoção de tecnologia por personal trainers é uma vantagem competitiva real.
          </p>
        </div>
      </div>

      {/* ── Fluxo recomendado — Steps ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary" style={{ fontFamily: 'ui-monospace, monospace' }}>/FLUXO RECOMENDADO</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">4 passos para usar IA com qualidade</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((step) => (
            <div key={step.num} className="group relative rounded-2xl border border-white/8 bg-white/2 p-6 transition-all hover:border-brand-primary/30 hover:bg-brand-primary/3">
              <span className="text-3xl font-black text-brand-primary/15 transition-colors group-hover:text-brand-primary/25" style={{ fontFamily: 'ui-monospace, monospace' }}>{step.num}</span>
              <h3 className="mt-2 text-base font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefícios — Cards com stats ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary" style={{ fontFamily: 'ui-monospace, monospace' }}>/BENEFÍCIOS</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Por que usar IA na prescrição de treinos?</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-white/8 bg-white/2 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
                  <DSIcon name={b.icon} size={18} className="text-brand-primary" />
                </div>
                <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-bold text-brand-primary uppercase tracking-wider" style={{ fontFamily: 'ui-monospace, monospace' }}>{b.stat}</span>
              </div>
              <h3 className="text-base font-bold text-white">{b.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona na prática ── */}
      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary" style={{ fontFamily: 'ui-monospace, monospace' }}>/NA PRÁTICA</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Como a IA gera treinos de qualidade</h2>
        </div>
        <p>
          Plataformas especializadas como o <strong className="text-white">VFIT</strong> usam modelos de linguagem treinados com dados de milhares de protocolos de treino para sugerir exercícios, séries, repetições e tempos de descanso adequados ao perfil de cada aluno.
        </p>
        <p>
          O processo é simples: você preenche o perfil (nível, objetivos, restrições, equipamentos) e a IA gera um programa completo. Você revisa, ajusta e publica. O aluno recebe tudo no celular, com vídeos demonstrativos e instruções claras.
        </p>
        <p>
          Diferentemente do que recomendam alguns estudos sobre prescrição automatizada (veja <a href="https://www.who.int/news-room/fact-sheets/detail/physical-activity" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline decoration-brand-primary/30 hover:decoration-brand-primary">diretrizes da OMS sobre atividade física</a>), a IA não elimina a necessidade do profissional — ela <em>acelera</em> o processo para que você dedique mais tempo à relação com o aluno e à supervisão técnica.
        </p>
      </section>

      {/* ── Comparativo — Table ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary" style={{ fontFamily: 'ui-monospace, monospace' }}>/COMPARATIVO</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">IA genérica vs IA especializada</h2>
        </div>
        <p className="text-zinc-400">ChatGPT pode até sugerir treinos, mas sem contexto. Veja a diferença real:</p>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">IA genérica vs IA especializada</caption>
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Critério</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">IA Genérica</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-brand-primary">IA Especializada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-200">{row.feature}</td>
                    <td className="px-4 py-3 text-zinc-500">{row.generic}</td>
                    <td className="px-4 py-3 text-zinc-300">{row.specialized}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Quando NÃO usar IA ── */}
      <section className="space-y-4">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/LIMITAÇÕES</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Quando NÃO usar IA</h2>
        </div>
        <p className="text-zinc-300 leading-relaxed">
          A IA é excelente para gerar a base do treino e variações. Mas o olhar clínico é insubstituível, conforme o <a href="https://www.confef.org.br/confef/conteudo/471" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline decoration-brand-primary/30">CONFEF</a>:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: 'alertTriangle' as DSIconName, text: 'Alunos com lesões ou restrições complexas que exigem avaliação presencial contínua' },
            { icon: 'target' as DSIconName, text: 'Atletas em fase de competição com periodização avançada e peaking' },
            { icon: 'eye' as DSIconName, text: 'Situações que exigem correção técnica visual em tempo real' },
          ].map((item) => (
            <div key={item.text} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
              <DSIcon name={item.icon} size={18} className="text-amber-400" />
              <p className="text-sm text-zinc-300 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Evidências científicas ── */}
      <section className="space-y-4">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary" style={{ fontFamily: 'ui-monospace, monospace' }}>/EVIDÊNCIAS</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">O que a ciência diz sobre IA no fitness</h2>
        </div>
        <div className="space-y-4 text-zinc-300 leading-relaxed">
          <p>
            Uma revisão publicada no <em>Journal of Sports Science &amp; Medicine</em> (2024) demonstrou que sistemas de IA podem atingir até <strong className="text-white">91% de concordância</strong> com prescrições feitas por profissionais certificados, quando treinados com dados de qualidade.
          </p>
          <p>
            Os pesquisadores enfatizam que a IA funciona melhor como <strong className="text-white">&quot;copiloto&quot;</strong> — gerando sugestões que o profissional valida, ajusta e personaliza. O modelo híbrido (IA + humano) supera tanto a prescrição 100% manual quanto a 100% automatizada em adesão, segurança e satisfação do aluno.
          </p>
          <p>
            As <a href="https://www.nsca.com/education/articles/" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline decoration-brand-primary/30">diretrizes da NSCA</a> recomendam que ferramentas tecnológicas na prescrição sigam os princípios de sobrecarga progressiva, especificidade e individualização.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqInline items={FAQ_BLOG_IA} />

      <section className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Rota recomendada por perfil</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrackedCtaLink href="/app-personal-trainer" cta="Sou personal trainer" placement="blog_ia_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="rounded-xl border border-white/10 bg-white/4 p-4 hover:border-brand-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base">
            <h3 className="text-sm font-bold text-white">Sou personal trainer</h3>
            <p className="mt-1 text-xs text-zinc-400">Gestão, IA e operação em escala.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/nutricionistas" cta="Sou nutricionista" placement="blog_ia_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="rounded-xl border border-white/10 bg-white/4 p-4 hover:border-brand-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base">
            <h3 className="text-sm font-bold text-white">Sou nutricionista</h3>
            <p className="mt-1 text-xs text-zinc-400">Integração com treino e acompanhamento conjunto.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/afiliados" cta="Quero monetizar indicação" placement="blog_ia_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="rounded-xl border border-white/10 bg-white/4 p-4 hover:border-brand-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base">
            <h3 className="text-sm font-bold text-white">Quero monetizar indicação</h3>
            <p className="mt-1 text-xs text-zinc-400">Ganhe comissão recorrente com afiliados.</p>
          </TrackedCtaLink>
        </div>
      </section>

      {/* ── Fontes ── */}
      <section className="rounded-2xl border border-white/8 bg-white/3 p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500" style={{ fontFamily: 'ui-monospace, monospace' }}>Fontes e referências</h3>
        <ul className="space-y-2">
          {SOURCES.map((s) => (
            <li key={s.url} className="flex items-start gap-2 text-sm">
              <DSIcon name="externalLink" size={14} className="mt-0.5 shrink-0 text-brand-primary/60" />
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline decoration-white/10 hover:text-brand-primary hover:decoration-brand-primary/30 transition-colors">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Share */}
      <ArticleShare title={post.title} slug={post.slug} />

      {/* Related */}
      <ArticleRelated posts={related} />

      {/* ── CTA ── */}
      <section className="text-center rounded-2xl border border-brand-primary/30 bg-linear-to-b from-brand-primary/10 to-transparent p-8 sm:p-10 space-y-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary" style={{ fontFamily: 'ui-monospace, monospace' }}>/PRÓXIMO PASSO</span>
        <h2 className="text-2xl font-bold text-white">Quer testar a IA na prática?</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          30 dias grátis, sem cartão — crie sua conta no VFIT e gere seu primeiro treino com inteligência artificial em menos de 2 minutos.
        </p>
        <TrackedCtaLink
          href="/register"
          cta="Criar conta grátis"
          placement="blog_ia_legacy_cta"
          pageSegment="blog"
          event="lp_register_start"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-bg-dark hover:bg-brand-primary-hover transition-colors shadow-lg shadow-brand-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
        >
          Criar conta grátis
          <DSIcon name="arrowRight" size={16} />
        </TrackedCtaLink>
      </section>

      {/* Navigation */}
      <ArticleNavigation prev={prev} next={next} />
    </article>
  )
}
