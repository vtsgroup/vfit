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
  KeyTakeaways,
  ArticleTable,
  lightCard,
  HoverEdge,
  monoLabel,
  pillPrimaryClass,
  PillSweep,
  PillArrow,
  articleLinkClass,
} from '@/components/blog/article-kit'
import { FaqInline } from '@/components/shared/faq-inline'
import { articleSchema } from '@/lib/schemas'
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
    <ArticleShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />

      <ArticleHeader post={post} />

      <KeyTakeaways
        points={[
          'Um bom app de treino com IA grátis personaliza o plano pelo seu objetivo, nível e rotina — em vez de entregar uma ficha genérica.',
          'Para iniciantes, o que mais importa é clareza do plano, facilidade para registrar treinos e sensação real de progresso.',
          'A IA agrega valor em 3 frentes: progressão automática, motivação com gamificação e acompanhamento da evolução.',
          'No VFIT dá para começar grátis, sem cartão, e evoluir para recursos avançados quando fizer sentido.',
        ]}
      />

      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <p className="text-lg">
          Procurar um <strong className="font-semibold text-slate-900">app de treino com IA grátis</strong> faz sentido quando você quer começar com direção, consistência e menos tentativa e erro. O problema é que muita gente baixa qualquer app, recebe um treino genérico e abandona em poucos dias.
        </p>
        <p>
          Um bom app para iniciantes precisa fazer três coisas: entender seu nível atual, sugerir uma progressão realista e manter sua motivação alta nas primeiras semanas. É exatamente aí que a IA entrega mais valor.
        </p>
        <p>
          Neste guia, você vai entender como escolher um app de treino com IA, o que comparar e por que plataformas como o <strong className="font-semibold text-slate-900">VFIT</strong> conseguem unir personalização, gamificação e facilidade de uso sem exigir experiência prévia.
        </p>
        <p>
          Se quiser ir direto para a experiência de aluno, acesse a{' '}
          <Link href="/" className={articleLinkClass}>
            página inicial do VFIT
          </Link>
          . Se você for profissional, veja as páginas para{' '}
          <Link href="/app-personal-trainer" className={articleLinkClass}>
            personal trainer
          </Link>{' '}
          e{' '}
          <Link href="/nutricionistas" className={articleLinkClass}>
            nutricionistas
          </Link>
          .
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['1', 'Comece simples', 'Treinos curtos e sustentáveis valem mais do que programas perfeitos que você não consegue seguir.'],
          ['2', 'Acompanhe evolução', 'Ver histórico de frequência, cargas e metas aumenta a chance de continuidade.'],
          ['3', 'Ajuste semanal', 'A IA deve adaptar o plano conforme resposta, rotina e percepção de esforço.'],
        ].map(([num, title, desc]) => (
          <div key={title} className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
            <HoverEdge />
            <span className="relative text-xs font-bold tracking-[0.2em] text-emerald-600">{num}</span>
            <h2 className="relative mt-3 font-syne text-lg font-black tracking-tight text-gray-950">{title}</h2>
            <p className="relative mt-2 text-sm text-slate-600">{desc}</p>
          </div>
        ))}
      </section>

      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <ArticleH2>O que um iniciante deve avaliar antes de escolher</ArticleH2>
        <p>
          O melhor app não é necessariamente o mais famoso. Para iniciantes, os critérios mais importantes costumam ser clareza do plano, facilidade para registrar treinos e sensação de progresso. Se o aplicativo exige configurações demais ou entrega linguagem técnica demais, a adesão cai.
        </p>
        <p>
          Também vale olhar se existe <strong className="font-semibold text-slate-900">treino personalizado por objetivo</strong>, como emagrecimento, ganho de massa, condicionamento ou treino em casa. IA boa não é sobre parecer futurista; é sobre tomar decisões melhores com os dados que você informa.
        </p>
      </section>

      <section className="space-y-6">
        <ArticleH2 eyebrow="/COMPARATIVO">App comum vs app com IA</ArticleH2>
        <ArticleTable
          caption="App comum vs app com IA"
          head={['Critério', 'App comum', 'App com IA']}
          rows={comparison}
        />
      </section>

      <Callout icon="sparkles" tone="brand" title="Os 5 recursos que mais importam">
        <ul className="space-y-2">
          <li>• onboarding com objetivo, rotina e restrições;</li>
          <li>• sugestão automática de treinos realistas;</li>
          <li>• vídeos ou instruções claras de execução;</li>
          <li>• acompanhamento de consistência e evolução;</li>
          <li>• CTA simples para começar grátis e testar rápido.</li>
        </ul>
      </Callout>

      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <ArticleH2>Como começar com segurança no VFIT</ArticleH2>
        <p>
          No VFIT, o fluxo para iniciantes é direto: você cria a conta, informa objetivo, disponibilidade e contexto de treino, e a plataforma organiza um plano inicial. A partir disso, consegue acompanhar sua frequência, visualizar treinos no celular e ganhar motivação extra com metas e gamificação.
        </p>
        <p>
          O ponto mais importante é: comece com o menor compromisso que você consegue manter. Três sessões curtas por semana, bem executadas, são melhores do que tentar um plano impossível logo de início.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6" style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -24px rgba(15,23,42,0.14)' }}>
        <h2 className="font-syne text-xl font-black tracking-tight text-gray-950">Próximo passo por perfil</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <TrackedCtaLink href="/welcome" cta="Começar como aluno" placement="blog_iniciante_icp_switcher" pageSegment="blog" event="lp_register_start" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Sou aluno</h3>
            <p className="mt-1 text-xs text-slate-500">Inicie grátis e receba seu plano com IA.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/app-personal-trainer" cta="Sou personal trainer" placement="blog_iniciante_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Sou personal trainer</h3>
            <p className="mt-1 text-xs text-slate-500">Veja operação profissional e gestão completa.</p>
          </TrackedCtaLink>
        </div>
      </section>

      <FaqInline items={faq} />
      <ArticleShare title={post.title} slug={post.slug} />
      <ArticleRelated posts={related} />

      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/25 p-8 text-center sm:p-10" style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.10) 0%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #ffffff 0%, #f3faf5 100%)', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 26px 60px -28px rgba(34,197,94,0.4)' }}>
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-primary/10 blur-[90px]" />
        <span className="relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ ...monoLabel, background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">/PRÓXIMO PASSO</span>
        </span>
        <h2 className="relative mt-5 font-syne text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">Quer começar grátis com IA?</h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Crie sua conta no VFIT e receba um plano inicial mais inteligente, com adaptação, motivação e evolução no celular.
        </p>
        <div className="relative mt-6 flex justify-center">
          <TrackedCtaLink
            href="/register"
            cta="Criar conta grátis"
            placement="blog_app_treino_ia_cta"
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

      <ArticleNavigation prev={prev} next={next} />
    </ArticleShell>
  )
}
