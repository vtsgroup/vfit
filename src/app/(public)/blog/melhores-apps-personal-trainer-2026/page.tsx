import type { Metadata } from 'next'
import Link from 'next/link'
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
  lightCard,
  HoverEdge,
  monoLabel,
  pillPrimaryClass,
  PillSweep,
  PillArrow,
  articleLinkClass,
  TableOfContents,
  articleSlug,
} from '@/components/blog/article-kit'
import { FaqInline } from '@/components/shared/faq-inline'
import { articleSchema } from '@/lib/schemas'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'

const post = getPost('melhores-apps-personal-trainer-2026')!

export const metadata: Metadata = buildSeoMetadata({
  title: post.title,
  description: post.excerpt,
  path: '/blog/melhores-apps-personal-trainer-2026',
  ogImage: post.ogImage,
  type: 'article',
  section: post.category,
  tags: post.tags,
  publishedTime: post.dateISO,
  modifiedTime: post.modifiedISO,
})

const faq = [
  {
    question: 'Qual o melhor app para personal trainer em 2026?',
    answer:
      'Depende do momento do negócio. Para quem busca gestão, IA, cobrança e experiência do aluno no mesmo lugar, o melhor app é o que reduz ferramentas paralelas e aumenta eficiência operacional.',
  },
  {
    question: 'Planilha ainda funciona para personal trainer?',
    answer:
      'Funciona como ponto de partida, mas tende a limitar escala, experiência do aluno, acompanhamento e cobrança conforme a base cresce.',
  },
  {
    question: 'O que comparar antes de contratar uma plataforma?',
    answer:
      'Gestão de alunos, recursos de IA, cobrança, app do aluno, automações, relatórios e capacidade de gerar retenção e crescimento.',
  },
]

const comparison = [
  ['VFIT', 'IA + gestão + cobrança + experiência do aluno', 'Personais que querem operar e escalar em uma única plataforma'],
  ['MFIT', 'App e gestão com foco clássico de mercado', 'Profissionais que priorizam rotina mais tradicional'],
  ['Mobitrainer', 'Biblioteca e distribuição de treinos', 'Operações que valorizam prescrição digital básica'],
  ['Planilha/WhatsApp', 'Baixo custo inicial, alto retrabalho', 'Quem ainda está validando operação e atende poucos alunos'],
]

export default function MelhoresAppsPersonalTrainer2026Page() {
  const idx = BLOG_POSTS.findIndex((p) => p.slug === post.slug)
  const prev = idx > 0 ? BLOG_POSTS[idx - 1] : null
  const next = idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null
  const related = getRelatedPosts(post.slug, 3)

  const article = articleSchema({
    title: post.title,
    description: post.excerpt,
    slug: '/blog/melhores-apps-personal-trainer-2026',
    datePublished: post.dateISO,
    dateModified: post.modifiedISO,
    image: `https://vfit.app.br${post.image}`,
    keywords: post.tags,
  })

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: comparison.map(([name], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
    })),
  }

  return (
    <ArticleShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <ArticleHeader post={post} />

      <TableOfContents
        items={[
          { id: articleSlug('O que realmente comparar'), label: 'O que realmente comparar' },
          { id: articleSlug('Comparativo rápido'), label: 'Comparativo rápido' },
          { id: articleSlug('Quando faz sentido sair da planilha'), label: 'Quando sair da planilha' },
          { id: 'faq', label: 'Perguntas frequentes' },
        ]}
      />

      {/* ── Introdução ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <p className="text-lg">
          Buscar o <strong className="font-semibold text-slate-900">melhor app para personal trainer</strong> em 2026 é, na prática, decidir como sua operação vai crescer. O software certo economiza tempo, reduz inadimplência, melhora a experiência do aluno e evita que seu negócio dependa de planilhas soltas, mensagens perdidas e processos manuais.
        </p>
        <p>
          Mais do que perguntar qual plataforma tem mais recursos, o ideal é entender qual combina melhor com sua fase atual. Um personal com 10 alunos tem dores diferentes de quem já atende 80 ou quer vender online.
        </p>
        <p>
          Se você está comparando ferramentas para operação profissional, acesse a página dedicada para{' '}
          <Link href="/app-personal-trainer" className={articleLinkClass}>
            personal trainers
          </Link>
          . Para abordagem interdisciplinar, veja também a página de{' '}
          <Link href="/nutricionistas" className={articleLinkClass}>
            integração com nutricionistas
          </Link>
          .
        </p>
      </section>

      {/* ── Critérios ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/CRITÉRIOS">O que realmente comparar</ArticleH2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Gestão de alunos', 'Cadastro, evolução, comunicação e rotina operacional no mesmo lugar.'],
            ['IA e produtividade', 'Velocidade para montar treino, revisar e publicar com menos retrabalho.'],
            ['Cobrança', 'PIX, cartão, recorrência e previsibilidade financeira.'],
            ['Experiência do aluno', 'App claro, motivação, vídeos, gamificação e sensação de acompanhamento.'],
          ].map(([title, desc]) => (
            <div key={title} className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
              <HoverEdge />
              <h3 className="relative font-syne text-lg font-black tracking-tight text-gray-950">{title}</h3>
              <p className="relative mt-2 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparativo rápido ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/RANKING">Comparativo rápido</ArticleH2>
        <div className="space-y-4">
          {comparison.map(([name, strength, bestFor], index) => {
            const isVfit = name === 'VFIT'
            return (
              <div
                key={name}
                className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 sm:p-6"
                style={
                  isVfit
                    ? {
                        background: 'linear-gradient(180deg, rgba(34,197,94,0.10) 0%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #ffffff 0%, #f3faf5 100%)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 22px 50px -28px rgba(34,197,94,0.4)',
                      }
                    : lightCard
                }
              >
                <HoverEdge />
                <div className="relative flex items-start gap-4">
                  <span
                    className="shrink-0 font-black"
                    style={{ ...monoLabel, fontSize: '1.6rem', color: isVfit ? '#16a34a' : undefined }}
                  >
                    <span className={isVfit ? '' : 'text-emerald-500/30'}>{String(index + 1).padStart(2, '0')}</span>
                  </span>
                  <div className="grow">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-syne text-lg font-black tracking-tight text-gray-950">{name}</h3>
                      {isVfit && (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700" style={monoLabel}>
                          Recomendado
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{strength}</p>
                    <p className="mt-2 text-xs text-slate-500">Melhor para: {bestFor}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Sair da planilha ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <ArticleH2 eyebrow="/VIRADA">Quando faz sentido sair da planilha</ArticleH2>
        <p>
          O ponto de virada costuma acontecer quando você começa a sentir que está administrando demais e treinando de menos. Se cobrança, atualização de treino, acompanhamento e mensagens já consomem boa parte da semana, uma plataforma passa de “legal de ter” para “necessária”.
        </p>
        <p>
          Em geral, o melhor software para personal trainer é o que reduz contexto espalhado. Se você precisa de uma ferramenta para treino, outra para cobrança e outra para engajamento, o custo escondido aparece em tempo, erros e experiência pior para o aluno.
        </p>
      </section>

      {/* ── ICP switcher ── */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6" style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -24px rgba(15,23,42,0.14)' }}>
        <h2 className="font-syne text-xl font-black tracking-tight text-gray-950">Direcione seu próximo passo</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrackedCtaLink href="/app-personal-trainer" cta="Avaliar solução para personal" placement="blog_comparativo_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Sou personal trainer</h3>
            <p className="mt-1 text-xs text-slate-500">Avalie stack de operação e escala.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/afiliados" cta="Quero monetizar indicação" placement="blog_comparativo_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Quero monetizar indicação</h3>
            <p className="mt-1 text-xs text-slate-500">Ative comissão recorrente por conversão.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/" cta="Sou aluno" placement="blog_comparativo_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Sou aluno</h3>
            <p className="mt-1 text-xs text-slate-500">Conheça a experiência aluno-first da home.</p>
          </TrackedCtaLink>
        </div>
      </section>

      {/* ── Leitura rápida ── */}
      <Callout icon="trophy" tone="brand" title="Leitura rápida">
        Se você quer centralizar IA, gestão, cobrança e experiência do aluno, o VFIT tende a fazer mais sentido. Se está só começando e ainda valida sua operação, talvez a prioridade seja migrar de processos manuais para qualquer rotina digital consistente — e depois sofisticar.
      </Callout>

      <FaqInline items={faq} id="faq" />
      <ArticleShare title={post.title} slug={post.slug} />
      <ArticleRelated posts={related} />

      {/* ── CTA ── */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/25 p-8 text-center sm:p-10" style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.10) 0%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #ffffff 0%, #f3faf5 100%)', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 26px 60px -28px rgba(34,197,94,0.4)' }}>
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-primary/10 blur-[90px]" />
        <span className="relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ ...monoLabel, background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">/PRÓXIMO PASSO</span>
        </span>
        <h2 className="relative mt-5 font-syne text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">Quer comparar na prática?</h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Teste o VFIT 30 dias grátis, sem cartão, e veja como uma operação mais integrada pode melhorar gestão, retenção e receita.
        </p>
        <div className="relative mt-6 flex justify-center">
          <TrackedCtaLink
            href="/app-personal-trainer"
            cta="Ver solução para personais"
            placement="blog_melhores_apps_personal_cta"
            pageSegment="blog"
            event="lp_cta_primary_click"
            className={pillPrimaryClass}
          >
            <PillSweep />
            <span className="relative z-10">Ver solução para personais</span>
            <PillArrow />
          </TrackedCtaLink>
        </div>
      </section>

      <ArticleNavigation prev={prev} next={next} />
    </ArticleShell>
  )
}
