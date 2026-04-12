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

const post = getPost('nutricionista-personal-trainer-trabalho-conjunto')!

export const metadata: Metadata = buildSeoMetadata({
  title: post.title,
  description: post.excerpt,
  path: '/blog/nutricionista-personal-trainer-trabalho-conjunto',
  ogImage: post.ogImage,
  type: 'article',
  section: post.category,
  tags: post.tags,
  publishedTime: post.dateISO,
  modifiedTime: post.modifiedISO,
})

const faq = [
  {
    question: 'Nutricionista e personal trainer precisam trabalhar juntos sempre?',
    answer:
      'Nem sempre, mas a integração tende a melhorar adesão, clareza de metas e percepção de resultado quando o paciente busca recomposição corporal, performance ou mudança de hábito.',
  },
  {
    question: 'Como evitar conflito de comunicação entre os profissionais?',
    answer:
      'Definindo papéis claros, combinando metas compartilhadas e usando um fluxo de atualização simples sobre treino, rotina e resposta do paciente.',
  },
  {
    question: 'O VFIT serve para esse modelo de parceria?',
    answer:
      'Sim. O VFIT ajuda a estruturar acompanhamento, contexto do treino e colaboração com parceiros, principalmente em rotinas com foco em adesão e evolução.',
  },
]

const pillars = [
  ['Meta comum', 'Ambos precisam saber qual resultado está sendo perseguido: emagrecimento, hipertrofia, performance ou saúde.'],
  ['Leitura de rotina', 'Sono, estresse, aderência alimentar e frequência de treino precisam entrar na mesma conversa.'],
  ['Ajustes rápidos', 'Quando treino ou dieta mudam, o paciente percebe coerência e sente mais segurança no processo.'],
]

export default function NutricionistaPersonalTrainerTrabalhoConjuntoPage() {
  const idx = BLOG_POSTS.findIndex((p) => p.slug === post.slug)
  const prev = idx > 0 ? BLOG_POSTS[idx - 1] : null
  const next = idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null
  const related = getRelatedPosts(post.slug, 3)

  const article = articleSchema({
    title: post.title,
    description: post.excerpt,
    slug: '/blog/nutricionista-personal-trainer-trabalho-conjunto',
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
          A parceria entre <strong className="text-white">nutricionista e personal trainer</strong> costuma gerar resultados melhores porque treino e alimentação deixam de competir por atenção e passam a trabalhar na mesma direção.
        </p>
        <p>
          Para o paciente, isso significa menos mensagens contraditórias, mais clareza sobre prioridades e uma sensação maior de cuidado coordenado. Para os profissionais, significa percepção de valor, retenção mais forte e possibilidade real de indicação mútua.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {pillars.map(([title, desc]) => (
          <div key={title} className="rounded-2xl border border-white/8 bg-white/2 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
              <DSIcon name="heartHandshake" size={18} className="text-brand-primary" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">{title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{desc}</p>
          </div>
        ))}
      </section>

      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Onde as parcerias mais erram</h2>
        <p>
          O erro mais comum não é técnico: é operacional. Muitas parcerias falham porque cada profissional atua em uma bolha, sem compartilhar contexto mínimo sobre adesão, objetivo ou rotina. O paciente então vira o integrador manual do processo.
        </p>
        <p>
          Quando a comunicação é mínima, um ajuste de treino pode conflitar com uma estratégia nutricional e vice-versa. O resultado não é apenas menor evolução, mas também uma experiência menos consistente para quem paga pelo serviço.
        </p>
      </section>

      <section className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white">Modelo simples de trabalho conjunto</h2>
        <ol className="space-y-3 text-sm text-zinc-300">
          <li>1. Definir o objetivo principal do paciente e o horizonte de 8 a 12 semanas.</li>
          <li>2. Compartilhar rotina: frequência de treino, limitações, horários, sinais de baixa adesão.</li>
          <li>3. Estabelecer checkpoints curtos para revisar resposta do paciente e ajustar o plano.</li>
          <li>4. Comunicar mudanças importantes de forma rápida e prática, sem burocracia excessiva.</li>
        </ol>
      </section>

      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Por que essa integração melhora retenção</h2>
        <p>
          Quando o paciente percebe coerência entre treino e nutrição, a motivação tende a aumentar. Ele entende melhor o porquê de cada ajuste, sente mais progresso e encontra menos atrito para continuar.
        </p>
        <p>
          Para clínicas, consultórios e operações de wellness, a colaboração também pode aumentar ticket médio, indicações e recorrência, porque o serviço passa a ser percebido como mais completo.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-6">
        <h2 className="text-xl font-bold text-white">Onde o VFIT entra</h2>
        <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
          O VFIT ajuda a organizar o lado operacional da jornada: treino, evolução, contexto do paciente e relacionamento com parceiros. Isso facilita um modelo de atendimento mais integrado, sem exigir trocas longas e desorganizadas a cada ajuste.
        </p>
      </section>

      <FaqInline items={faq} />
      <ArticleShare title={post.title} slug={post.slug} />
      <ArticleRelated posts={related} />

      <section className="text-center rounded-2xl border border-brand-primary/30 bg-linear-to-b from-brand-primary/10 to-transparent p-8 sm:p-10 space-y-5">
        <h2 className="text-2xl font-bold text-white">Quer estruturar essa parceria?</h2>
        <p className="mx-auto max-w-md text-sm text-zinc-400">
          Veja como o VFIT apoia nutricionistas parceiros e operações com foco em adesão e resultado do paciente.
        </p>
        <TrackedCtaLink href="/nutricionistas" cta="Seja nutricionista parceiro" placement="blog_nutri_personal_cta" pageSegment="blog" event="lp_cta_primary_click" className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-bg-dark hover:bg-brand-primary-hover transition-colors shadow-lg shadow-brand-primary/20">
          Seja nutricionista parceiro
          <DSIcon name="arrowRight" size={16} />
        </TrackedCtaLink>
      </section>

      <ArticleNavigation prev={prev} next={next} />
    </article>
  )
}
