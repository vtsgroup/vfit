import type { Metadata } from 'next'
import { DSIcon } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { getPost, getRelatedPosts, BLOG_POSTS } from '@/data/blog-posts'
import { ArticleHeader } from '@/components/blog/article-header'
import { ArticleShare } from '@/components/blog/article-share'
import { ArticleNavigation } from '@/components/blog/article-navigation'
import { ArticleRelated } from '@/components/blog/article-related'
import { FaqInline } from '@/components/shared/faq-inline'
import { articleSchema, faqSchema, howToSchema } from '@/lib/schemas'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'

const post = getPost('ia-montar-treinos-personalizados-personal')!

export const metadata: Metadata = buildSeoMetadata({
  title: post.title,
  description: post.excerpt,
  path: '/blog/ia-montar-treinos-personalizados-personal',
  ogImage: post.ogImage,
  type: 'article',
  section: post.category,
  tags: post.tags,
  publishedTime: post.dateISO,
  modifiedTime: post.modifiedISO,
})

const steps = [
  { name: 'Preencha o contexto do aluno', text: 'Objetivo, nível, lesões, equipamentos, frequência semanal e histórico recente.' },
  { name: 'Gere uma primeira versão', text: 'A IA cria a estrutura-base com exercícios, séries, repetições e descanso.' },
  { name: 'Revise criticamente', text: 'Ajuste seleção de exercícios, volume e intensidade de acordo com sua leitura técnica.' },
  { name: 'Publique e acompanhe', text: 'Envie para o aluno e acompanhe adesão, execução e necessidade de progressão.' },
]

const faq = [
  {
    question: 'IA pode substituir o personal trainer na montagem de treino?',
    answer:
      'Não. A IA acelera a parte operacional, mas o julgamento técnico continua com o profissional, especialmente em casos com restrições, dor, lesões e objetivos complexos.',
  },
  {
    question: 'Quanto tempo dá para economizar com IA?',
    answer:
      'Para muitos profissionais, a montagem inicial cai de dezenas de minutos para poucos minutos, liberando mais tempo para revisão, venda e relacionamento com o aluno.',
  },
  {
    question: 'O que devo revisar antes de publicar um treino gerado por IA?',
    answer:
      'Compatibilidade com o contexto do aluno, equilíbrio de volume, progressão, segurança técnica e clareza das instruções de execução.',
  },
]

export default function IAMontarTreinosPersonalizadosPage() {
  const idx = BLOG_POSTS.findIndex((p) => p.slug === post.slug)
  const prev = idx > 0 ? BLOG_POSTS[idx - 1] : null
  const next = idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null
  const related = getRelatedPosts(post.slug, 3)

  const article = articleSchema({
    title: post.title,
    description: post.excerpt,
    slug: '/blog/ia-montar-treinos-personalizados-personal',
    datePublished: post.dateISO,
    dateModified: post.modifiedISO,
    image: `https://vfit.app.br${post.image}`,
    keywords: post.tags,
  })

  return (
    <article className="mx-auto max-w-3xl space-y-12 px-6 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faq)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema(post.title, steps)) }} />

      <ArticleHeader post={post} />

      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <p className="text-lg">
          Se você quer usar <strong className="text-white">IA para montar treinos personalizados</strong>, o objetivo não deve ser terceirizar sua responsabilidade técnica. O melhor uso da IA é transformar minutos operacionais em minutos estratégicos.
        </p>
        <p>
          Em vez de começar do zero para cada aluno, você pode usar a IA para gerar uma base coerente e concentrar sua energia no que realmente diferencia um bom personal trainer: leitura do caso, adaptação fina, acompanhamento e comunicação.
        </p>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">/PASSO A PASSO</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Como gerar um treino em menos de 2 minutos</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <div key={step.name} className="rounded-2xl border border-white/8 bg-white/2 p-6">
              <span className="text-xs font-bold tracking-[0.2em] text-brand-primary">0{index + 1}</span>
              <h3 className="mt-3 text-lg font-bold text-white">{step.name}</h3>
              <p className="mt-2 text-sm text-zinc-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Quais dados a IA precisa para acertar mais</h2>
        <p>
          Quanto melhor o input, melhor o output. Antes de clicar em gerar, vale garantir que o cadastro do aluno tenha objetivo principal, experiência anterior, limitações, equipamentos disponíveis e frequência semanal. Sem isso, a IA vira só um gerador de fichas bonitas.
        </p>
        <p>
          No VFIT, a força está em conectar contexto do aluno, biblioteca de exercícios e histórico de uso. Isso cria um ambiente mais próximo da rotina real de um software para personal trainer do que de um prompt solto em uma IA genérica.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['Mais velocidade', 'Reduz o tempo de montagem e libera agenda para atendimento e vendas.'],
          ['Mais consistência', 'Ajuda a manter padrão técnico entre vários alunos e objetivos.'],
          ['Mais escala', 'Permite atender mais pessoas sem perder a sensação de personalização.'],
        ].map(([title, desc]) => (
          <div key={title} className="rounded-2xl border border-white/8 bg-white/2 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
              <DSIcon name="sparkles" size={18} className="text-brand-primary" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{desc}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-3">
        <h2 className="text-xl font-bold text-white">Checklist de revisão antes de publicar</h2>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>• volume semanal coerente com o nível do aluno;</li>
          <li>• exercícios compatíveis com equipamento e limitações;</li>
          <li>• ordem de execução lógica e segura;</li>
          <li>• progressão possível para a próxima semana;</li>
          <li>• linguagem clara para o aluno executar sem dúvida.</li>
        </ul>
      </section>

      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">IA genérica vs plataforma especializada</h2>
        <p>
          Uma IA genérica pode até sugerir treino, mas não conhece seu negócio. Já uma plataforma especializada combina geração, publicação, acompanhamento e visão operacional no mesmo fluxo. Isso reduz retrabalho e aumenta a percepção de valor do aluno.
        </p>
        <p>
          Se o seu objetivo é usar tecnologia para crescer com qualidade, a pergunta certa não é apenas “qual IA gera texto melhor?”, mas sim “qual sistema me ajuda a operar melhor?”.
        </p>
      </section>

      <FaqInline items={faq} />
      <ArticleShare title={post.title} slug={post.slug} />
      <ArticleRelated posts={related} />

      <section className="text-center rounded-2xl border border-brand-primary/30 bg-linear-to-b from-brand-primary/10 to-transparent p-8 sm:p-10 space-y-5">
        <h2 className="text-2xl font-bold text-white">Quer criar treinos com IA agora?</h2>
        <p className="mx-auto max-w-md text-sm text-zinc-400">
          Teste o VFIT, gere sua primeira estrutura de treino e transforme revisão técnica em vantagem competitiva.
        </p>
        <TrackedCtaLink href="/register/personal" cta="Criar treino com IA agora" placement="blog_ia_montar_treinos_cta" pageSegment="blog" event="lp_register_start" className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-bg-dark hover:bg-brand-primary-hover transition-colors shadow-lg shadow-brand-primary/20">
          Criar treino com IA agora
          <DSIcon name="arrowRight" size={16} />
        </TrackedCtaLink>
      </section>

      <ArticleNavigation prev={prev} next={next} />
    </article>
  )
}
