import type { Metadata } from 'next'
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

const post = getPost('app-treino-ia-gratis-iniciantes')!

export const metadata: Metadata = buildSeoMetadata({
  title: post.title,
  description: post.excerpt,
  path: '/blog/app-treino-ia-gratis-iniciantes',
  ogImage: post.ogImage,
  type: 'article',
  section: post.category,
  tags: post.tags,
  publishedTime: post.dateISO,
  modifiedTime: post.modifiedISO,
})

const faq = [
  {
    question: 'App de treino com IA grátis realmente funciona para iniciantes?',
    answer:
      'Funciona quando o app coleta objetivo, nível, rotina e limitações do usuário. A IA acelera a personalização e evita que o iniciante comece com um plano genérico demais.',
  },
  {
    question: 'Qual a diferença entre um app comum e um app com IA?',
    answer:
      'O app com IA adapta treino, progressão, frequência e sugestões de acordo com respostas e evolução do usuário, em vez de entregar apenas fichas fixas.',
  },
  {
    question: 'Preciso pagar para começar no VFIT?',
    answer:
      'Não. O VFIT tem plano Grátis para começar sem cartão, testar o app e evoluir para recursos mais avançados quando fizer sentido.',
  },
]

const comparison = [
  ['Personalização', 'Baixa ou fixa', 'Alta, com adaptação por perfil'],
  ['Progressão', 'Manual', 'Sugestões automáticas'],
  ['Motivação', 'Checklist simples', 'Gamificação e metas'],
  ['Acompanhamento', 'Poucos dados', 'Evolução e histórico no app'],
]

export default function AppTreinoIAGratisIniciantesPage() {
  const idx = BLOG_POSTS.findIndex((p) => p.slug === post.slug)
  const prev = idx > 0 ? BLOG_POSTS[idx - 1] : null
  const next = idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null
  const related = getRelatedPosts(post.slug, 3)

  const article = articleSchema({
    title: post.title,
    description: post.excerpt,
    slug: '/blog/app-treino-ia-gratis-iniciantes',
    datePublished: post.dateISO,
    dateModified: post.modifiedISO,
    image: `https://vfit.app.br${post.image}`,
    keywords: post.tags,
  })

  return (
    <article className="mx-auto max-w-3xl space-y-12 px-6 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faq)) }} />

      <ArticleHeader post={post} />

      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <p className="text-lg">
          Procurar um <strong className="text-white">app de treino com IA grátis</strong> faz sentido quando você quer começar com direção, consistência e menos tentativa e erro. O problema é que muita gente baixa qualquer app, recebe um treino genérico e abandona em poucos dias.
        </p>
        <p>
          Um bom app para iniciantes precisa fazer três coisas: entender seu nível atual, sugerir uma progressão realista e manter sua motivação alta nas primeiras semanas. É exatamente aí que a IA entrega mais valor.
        </p>
        <p>
          Neste guia, você vai entender como escolher um app de treino com IA, o que comparar e por que plataformas como o <strong className="text-white">VFIT</strong> conseguem unir personalização, gamificação e facilidade de uso sem exigir experiência prévia.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['1', 'Comece simples', 'Treinos curtos e sustentáveis valem mais do que programas perfeitos que você não consegue seguir.'],
          ['2', 'Acompanhe evolução', 'Ver histórico de frequência, cargas e metas aumenta a chance de continuidade.'],
          ['3', 'Ajuste semanal', 'A IA deve adaptar o plano conforme resposta, rotina e percepção de esforço.'],
        ].map(([num, title, desc]) => (
          <div key={title} className="rounded-2xl border border-white/8 bg-white/2 p-5">
            <span className="text-xs font-bold tracking-[0.2em] text-brand-primary">{num}</span>
            <h2 className="mt-3 text-lg font-bold text-white">{title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{desc}</p>
          </div>
        ))}
      </section>

      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">O que um iniciante deve avaliar antes de escolher</h2>
        <p>
          O melhor app não é necessariamente o mais famoso. Para iniciantes, os critérios mais importantes costumam ser clareza do plano, facilidade para registrar treinos e sensação de progresso. Se o aplicativo exige configurações demais ou entrega linguagem técnica demais, a adesão cai.
        </p>
        <p>
          Também vale olhar se existe <strong className="text-white">treino personalizado por objetivo</strong>, como emagrecimento, ganho de massa, condicionamento ou treino em casa. IA boa não é sobre parecer futurista; é sobre tomar decisões melhores com os dados que você informa.
        </p>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">/COMPARATIVO</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">App comum vs app com IA</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="px-4 py-3 text-left text-zinc-400">Critério</th>
                  <th className="px-4 py-3 text-left text-zinc-500">App comum</th>
                  <th className="px-4 py-3 text-left text-brand-primary">App com IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparison.map(([feature, regular, ai]) => (
                  <tr key={feature}>
                    <td className="px-4 py-3 text-zinc-200">{feature}</td>
                    <td className="px-4 py-3 text-zinc-500">{regular}</td>
                    <td className="px-4 py-3 text-zinc-300">{ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15">
            <DSIcon name="sparkles" size={18} className="text-brand-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Os 5 recursos que mais importam</h2>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>• onboarding com objetivo, rotina e restrições;</li>
              <li>• sugestão automática de treinos realistas;</li>
              <li>• vídeos ou instruções claras de execução;</li>
              <li>• acompanhamento de consistência e evolução;</li>
              <li>• CTA simples para começar grátis e testar rápido.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Como começar com segurança no VFIT</h2>
        <p>
          No VFIT, o fluxo para iniciantes é direto: você cria a conta, informa objetivo, disponibilidade e contexto de treino, e a plataforma organiza um plano inicial. A partir disso, consegue acompanhar sua frequência, visualizar treinos no celular e ganhar motivação extra com metas e gamificação.
        </p>
        <p>
          O ponto mais importante é: comece com o menor compromisso que você consegue manter. Três sessões curtas por semana, bem executadas, são melhores do que tentar um plano impossível logo de início.
        </p>
      </section>

      <FaqInline items={faq} />
      <ArticleShare title={post.title} slug={post.slug} />
      <ArticleRelated posts={related} />

      <section className="text-center rounded-2xl border border-brand-primary/30 bg-linear-to-b from-brand-primary/10 to-transparent p-8 sm:p-10 space-y-5">
        <h2 className="text-2xl font-bold text-white">Quer começar grátis com IA?</h2>
        <p className="mx-auto max-w-md text-sm text-zinc-400">
          Crie sua conta no VFIT e receba um plano inicial mais inteligente, com adaptação, motivação e evolução no celular.
        </p>
        <TrackedCtaLink href="/register" cta="Criar conta grátis" placement="blog_app_treino_ia_cta" pageSegment="blog" event="lp_register_start" className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-bg-dark hover:bg-brand-primary-hover transition-colors shadow-lg shadow-brand-primary/20">
          Criar conta grátis
          <DSIcon name="arrowRight" size={16} />
        </TrackedCtaLink>
      </section>

      <ArticleNavigation prev={prev} next={next} />
    </article>
  )
}
