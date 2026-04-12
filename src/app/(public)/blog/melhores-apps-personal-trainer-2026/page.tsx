import type { Metadata } from 'next'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { getPost, getRelatedPosts, BLOG_POSTS } from '@/data/blog-posts'
import { ArticleHeader } from '@/components/blog/article-header'
import { ArticleShare } from '@/components/blog/article-share'
import { ArticleNavigation } from '@/components/blog/article-navigation'
import { ArticleRelated } from '@/components/blog/article-related'
import { FaqInline } from '@/components/shared/faq-inline'
import { articleSchema, faqSchema } from '@/lib/schemas'
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
    <article className="mx-auto max-w-3xl space-y-12 px-6 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faq)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <ArticleHeader post={post} />

      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <p className="text-lg">
          Buscar o <strong className="text-white">melhor app para personal trainer</strong> em 2026 é, na prática, decidir como sua operação vai crescer. O software certo economiza tempo, reduz inadimplência, melhora a experiência do aluno e evita que seu negócio dependa de planilhas soltas, mensagens perdidas e processos manuais.
        </p>
        <p>
          Mais do que perguntar qual plataforma tem mais recursos, o ideal é entender qual combina melhor com sua fase atual. Um personal com 10 alunos tem dores diferentes de quem já atende 80 ou quer vender online.
        </p>
        <p>
          Se você está comparando ferramentas para operação profissional, acesse a página dedicada para{' '}
          <Link href="/app-personal-trainer" className="text-brand-primary hover:text-brand-primary-hover underline underline-offset-2">
            personal trainers
          </Link>
          . Para abordagem interdisciplinar, veja também a página de{' '}
          <Link href="/nutricionistas" className="text-brand-primary hover:text-brand-primary-hover underline underline-offset-2">
            integração com nutricionistas
          </Link>
          .
        </p>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">/CRITÉRIOS</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">O que realmente comparar</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Gestão de alunos', 'Cadastro, evolução, comunicação e rotina operacional no mesmo lugar.'],
            ['IA e produtividade', 'Velocidade para montar treino, revisar e publicar com menos retrabalho.'],
            ['Cobrança', 'PIX, cartão, recorrência e previsibilidade financeira.'],
            ['Experiência do aluno', 'App claro, motivação, vídeos, gamificação e sensação de acompanhamento.'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-white/8 bg-white/2 p-5">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Comparativo rápido</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="px-4 py-3 text-left text-zinc-400">Opção</th>
                  <th className="px-4 py-3 text-left text-zinc-500">Força principal</th>
                  <th className="px-4 py-3 text-left text-brand-primary">Melhor para</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparison.map(([name, strength, bestFor]) => (
                  <tr key={name}>
                    <td className="px-4 py-3 text-zinc-200">{name}</td>
                    <td className="px-4 py-3 text-zinc-400">{strength}</td>
                    <td className="px-4 py-3 text-zinc-300">{bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Quando faz sentido sair da planilha</h2>
        <p>
          O ponto de virada costuma acontecer quando você começa a sentir que está administrando demais e treinando de menos. Se cobrança, atualização de treino, acompanhamento e mensagens já consomem boa parte da semana, uma plataforma passa de “legal de ter” para “necessária”.
        </p>
        <p>
          Em geral, o melhor software para personal trainer é o que reduz contexto espalhado. Se você precisa de uma ferramenta para treino, outra para cobrança e outra para engajamento, o custo escondido aparece em tempo, erros e experiência pior para o aluno.
        </p>
      </section>

      <section className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Direcione seu próximo passo</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrackedCtaLink href="/app-personal-trainer" cta="Avaliar solução para personal" placement="blog_comparativo_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="rounded-xl border border-white/10 bg-white/4 p-4 hover:border-brand-primary/30">
            <h3 className="text-sm font-bold text-white">Sou personal trainer</h3>
            <p className="mt-1 text-xs text-zinc-400">Avalie stack de operação e escala.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/afiliados" cta="Quero monetizar indicação" placement="blog_comparativo_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="rounded-xl border border-white/10 bg-white/4 p-4 hover:border-brand-primary/30">
            <h3 className="text-sm font-bold text-white">Quero monetizar indicação</h3>
            <p className="mt-1 text-xs text-zinc-400">Ative comissão recorrente por conversão.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/" cta="Sou aluno" placement="blog_comparativo_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="rounded-xl border border-white/10 bg-white/4 p-4 hover:border-brand-primary/30">
            <h3 className="text-sm font-bold text-white">Sou aluno</h3>
            <p className="mt-1 text-xs text-zinc-400">Conheça a experiência aluno-first da home.</p>
          </TrackedCtaLink>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15">
            <DSIcon name="trophy" size={18} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Leitura rápida</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Se você quer centralizar IA, gestão, cobrança e experiência do aluno, o VFIT tende a fazer mais sentido. Se está só começando e ainda valida sua operação, talvez a prioridade seja migrar de processos manuais para qualquer rotina digital consistente — e depois sofisticar.
            </p>
          </div>
        </div>
      </section>

      <FaqInline items={faq} />
      <ArticleShare title={post.title} slug={post.slug} />
      <ArticleRelated posts={related} />

      <section className="text-center rounded-2xl border border-brand-primary/30 bg-linear-to-b from-brand-primary/10 to-transparent p-8 sm:p-10 space-y-5">
        <h2 className="text-2xl font-bold text-white">Quer comparar na prática?</h2>
        <p className="mx-auto max-w-md text-sm text-zinc-400">
          Teste o VFIT grátis e veja como uma operação mais integrada pode melhorar gestão, retenção e receita.
        </p>
        <TrackedCtaLink href="/app-personal-trainer" cta="Ver solução para personais" placement="blog_melhores_apps_personal_cta" pageSegment="blog" event="lp_cta_primary_click" className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-bg-dark hover:bg-brand-primary-hover transition-colors shadow-lg shadow-brand-primary/20">
          Ver solução para personais
          <DSIcon name="arrowRight" size={16} />
        </TrackedCtaLink>
      </section>

      <ArticleNavigation prev={prev} next={next} />
    </article>
  )
}
