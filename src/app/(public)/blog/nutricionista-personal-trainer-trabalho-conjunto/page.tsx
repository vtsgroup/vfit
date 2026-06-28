import type { Metadata } from 'next'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { getPost, getRelatedPosts, BLOG_POSTS } from '@/data/blog-posts'
import { ArticleHeader } from '@/components/blog/article-header'
import { ArticleShare } from '@/components/blog/article-share'
import { ArticleNavigation } from '@/components/blog/article-navigation'
import { ArticleRelated } from '@/components/blog/article-related'
import {
  ArticleShell,
  ArticleH2,
  lightCard,
  HoverEdge,
  greenChip,
  monoLabel,
  pillPrimaryClass,
  PillSweep,
  PillArrow,
  articleLinkClass,
} from '@/components/blog/article-kit'
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
    <ArticleShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faq)) }} />

      <ArticleHeader post={post} />

      {/* ── Introdução ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <p className="text-lg">
          A parceria entre <strong className="font-semibold text-slate-900">nutricionista e personal trainer</strong> costuma gerar resultados melhores porque treino e alimentação deixam de competir por atenção e passam a trabalhar na mesma direção.
        </p>
        <p>
          Para o paciente, isso significa menos mensagens contraditórias, mais clareza sobre prioridades e uma sensação maior de cuidado coordenado. Para os profissionais, significa percepção de valor, retenção mais forte e possibilidade real de indicação mútua.
        </p>
        <p>
          Se você quer ver a proposta completa por perfil, acesse a página para{' '}
          <Link href="/nutricionistas" className={articleLinkClass}>
            nutricionistas
          </Link>{' '}
          e a página para{' '}
          <Link href="/app-personal-trainer" className={articleLinkClass}>
            personal trainers
          </Link>
          .
        </p>
      </section>

      {/* ── Pilares ── */}
      <section className="grid gap-4 sm:grid-cols-3">
        {pillars.map(([title, desc]) => (
          <div key={title} className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
            <HoverEdge />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl text-emerald-600" style={greenChip}>
              <DSIcon name="heartHandshake" size={18} />
            </div>
            <h2 className="relative mt-4 font-syne text-lg font-black tracking-tight text-gray-950">{title}</h2>
            <p className="relative mt-2 text-sm text-slate-600">{desc}</p>
          </div>
        ))}
      </section>

      {/* ── Onde erram ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <ArticleH2 eyebrow="/ATENÇÃO">Onde as parcerias mais erram</ArticleH2>
        <p>
          O erro mais comum não é técnico: é operacional. Muitas parcerias falham porque cada profissional atua em uma bolha, sem compartilhar contexto mínimo sobre adesão, objetivo ou rotina. O paciente então vira o integrador manual do processo.
        </p>
        <p>
          Quando a comunicação é mínima, um ajuste de treino pode conflitar com uma estratégia nutricional e vice-versa. O resultado não é apenas menor evolução, mas também uma experiência menos consistente para quem paga pelo serviço.
        </p>
      </section>

      {/* ── Modelo de trabalho ── */}
      <section className="space-y-4 rounded-2xl p-6" style={lightCard}>
        <h2 className="font-syne text-2xl font-black tracking-tight text-gray-950">Modelo simples de trabalho conjunto</h2>
        <ol className="space-y-3 text-sm text-slate-600">
          <li>1. Definir o objetivo principal do paciente e o horizonte de 8 a 12 semanas.</li>
          <li>2. Compartilhar rotina: frequência de treino, limitações, horários, sinais de baixa adesão.</li>
          <li>3. Estabelecer checkpoints curtos para revisar resposta do paciente e ajustar o plano.</li>
          <li>4. Comunicar mudanças importantes de forma rápida e prática, sem burocracia excessiva.</li>
        </ol>
      </section>

      {/* ── Retenção ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <ArticleH2 eyebrow="/RETENÇÃO">Por que essa integração melhora retenção</ArticleH2>
        <p>
          Quando o paciente percebe coerência entre treino e nutrição, a motivação tende a aumentar. Ele entende melhor o porquê de cada ajuste, sente mais progresso e encontra menos atrito para continuar.
        </p>
        <p>
          Para clínicas, consultórios e operações de wellness, a colaboração também pode aumentar ticket médio, indicações e recorrência, porque o serviço passa a ser percebido como mais completo.
        </p>
      </section>

      {/* ── ICP switcher ── */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6" style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -24px rgba(15,23,42,0.14)' }}>
        <h2 className="font-syne text-xl font-black tracking-tight text-gray-950">Próxima rota por perfil</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrackedCtaLink href="/nutricionistas" cta="Sou nutricionista" placement="blog_nutri_personal_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Sou nutricionista</h3>
            <p className="mt-1 text-xs text-slate-500">Ative área de nutrição e parceria clínica.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/app-personal-trainer" cta="Sou personal trainer" placement="blog_nutri_personal_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Sou personal trainer</h3>
            <p className="mt-1 text-xs text-slate-500">Coordene treino e dieta no mesmo contexto.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/afiliados" cta="Monetizar com afiliados" placement="blog_nutri_personal_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Monetizar com afiliados</h3>
            <p className="mt-1 text-xs text-slate-500">Comissão recorrente por indicação ativa.</p>
          </TrackedCtaLink>
        </div>
      </section>

      {/* ── Onde o VFIT entra ── */}
      <section className="rounded-2xl border border-emerald-500/25 bg-emerald-50/70 p-6">
        <h2 className="font-syne text-xl font-black tracking-tight text-gray-950">Onde o VFIT entra</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          O VFIT ajuda a organizar o lado operacional da jornada: treino, evolução, contexto do paciente e relacionamento com parceiros. Isso facilita um modelo de atendimento mais integrado, sem exigir trocas longas e desorganizadas a cada ajuste.
        </p>
      </section>

      <FaqInline items={faq} />
      <ArticleShare title={post.title} slug={post.slug} />
      <ArticleRelated posts={related} />

      {/* ── CTA ── */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/25 p-8 text-center sm:p-10" style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.10) 0%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #ffffff 0%, #f3faf5 100%)', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 26px 60px -28px rgba(34,197,94,0.4)' }}>
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-primary/10 blur-[90px]" />
        <span className="relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ ...monoLabel, background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">/PRÓXIMO PASSO</span>
        </span>
        <h2 className="relative mt-5 font-syne text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">Quer estruturar essa parceria?</h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Veja como o VFIT apoia nutricionistas parceiros e operações com foco em adesão e resultado do paciente.
        </p>
        <div className="relative mt-6 flex justify-center">
          <TrackedCtaLink
            href="/nutricionistas"
            cta="Seja nutricionista parceiro"
            placement="blog_nutri_personal_cta"
            pageSegment="blog"
            event="lp_cta_primary_click"
            className={pillPrimaryClass}
          >
            <PillSweep />
            <span className="relative z-10">Seja nutricionista parceiro</span>
            <PillArrow />
          </TrackedCtaLink>
        </div>
      </section>

      <ArticleNavigation prev={prev} next={next} />
    </ArticleShell>
  )
}
