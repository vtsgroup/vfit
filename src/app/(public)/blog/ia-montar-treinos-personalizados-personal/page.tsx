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
  Callout,
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
import { articleSchema, howToSchema } from '@/lib/schemas'
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
    <ArticleShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema(post.title, steps)) }} />

      <ArticleHeader post={post} />

      <TableOfContents
        items={[
          { id: articleSlug('Como gerar um treino em menos de 2 minutos'), label: 'Gerar treino em 2 minutos' },
          { id: articleSlug('Quais dados a IA precisa para acertar mais'), label: 'Quais dados a IA precisa' },
          { id: articleSlug('IA genérica vs plataforma especializada'), label: 'IA genérica vs especializada' },
          { id: 'faq', label: 'Perguntas frequentes' },
        ]}
      />

      {/* ── Introdução ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <p className="text-lg">
          Se você quer usar <strong className="font-semibold text-slate-900">IA para montar treinos personalizados</strong>, o objetivo não deve ser terceirizar sua responsabilidade técnica. O melhor uso da IA é transformar minutos operacionais em minutos estratégicos.
        </p>
        <p>
          Em vez de começar do zero para cada aluno, você pode usar a IA para gerar uma base coerente e concentrar sua energia no que realmente diferencia um bom personal trainer: leitura do caso, adaptação fina, acompanhamento e comunicação.
        </p>
        <p>
          Para estruturar essa operação no fluxo certo, veja a página para{' '}
          <Link href="/app-personal-trainer" className={articleLinkClass}>
            personal trainers
          </Link>
          . Se você atua junto com nutricionista, também vale revisar a página de{' '}
          <Link href="/nutricionistas" className={articleLinkClass}>
            colaboração em nutrição
          </Link>
          .
        </p>
      </section>

      {/* ── Passo a passo ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/PASSO A PASSO">Como gerar um treino em menos de 2 minutos</ArticleH2>
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <div key={step.name} className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
              <HoverEdge />
              <span className="relative font-black text-emerald-500/25 transition-colors group-hover:text-emerald-500/45" style={{ ...monoLabel, fontSize: '1.4rem' }}>0{index + 1}</span>
              <h3 className="relative mt-3 font-syne text-lg font-black tracking-tight text-gray-950">{step.name}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dados necessários ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <ArticleH2>Quais dados a IA precisa para acertar mais</ArticleH2>
        <p>
          Quanto melhor o input, melhor o output. Antes de clicar em gerar, vale garantir que o cadastro do aluno tenha objetivo principal, experiência anterior, limitações, equipamentos disponíveis e frequência semanal. Sem isso, a IA vira só um gerador de fichas bonitas.
        </p>
        <p>
          No VFIT, a força está em conectar contexto do aluno, biblioteca de exercícios e histórico de uso. Isso cria um ambiente mais próximo da rotina real de um software para personal trainer do que de um prompt solto em uma IA genérica.
        </p>
      </section>

      {/* ── Benefícios ── */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['Mais velocidade', 'Reduz o tempo de montagem e libera agenda para atendimento e vendas.'],
          ['Mais consistência', 'Ajuda a manter padrão técnico entre vários alunos e objetivos.'],
          ['Mais escala', 'Permite atender mais pessoas sem perder a sensação de personalização.'],
        ].map(([title, desc]) => (
          <div key={title} className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
            <HoverEdge />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl text-emerald-600" style={greenChip}>
              <DSIcon name="sparkles" size={18} />
            </div>
            <h3 className="relative mt-4 font-syne text-lg font-black tracking-tight text-gray-950">{title}</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
          </div>
        ))}
      </section>

      {/* ── Checklist de revisão ── */}
      <Callout icon="checkCircle" tone="amber" title="Checklist de revisão antes de publicar">
        <ul className="space-y-2">
          <li>• volume semanal coerente com o nível do aluno;</li>
          <li>• exercícios compatíveis com equipamento e limitações;</li>
          <li>• ordem de execução lógica e segura;</li>
          <li>• progressão possível para a próxima semana;</li>
          <li>• linguagem clara para o aluno executar sem dúvida.</li>
        </ul>
      </Callout>

      {/* ── IA genérica vs plataforma ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <ArticleH2>IA genérica vs plataforma especializada</ArticleH2>
        <p>
          Uma IA genérica pode até sugerir treino, mas não conhece seu negócio. Já uma plataforma especializada combina geração, publicação, acompanhamento e visão operacional no mesmo fluxo. Isso reduz retrabalho e aumenta a percepção de valor do aluno.
        </p>
        <p>
          Se o seu objetivo é usar tecnologia para crescer com qualidade, a pergunta certa não é apenas “qual IA gera texto melhor?”, mas sim “qual sistema me ajuda a operar melhor?”.
        </p>
      </section>

      {/* ── ICP switcher ── */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6" style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -24px rgba(15,23,42,0.14)' }}>
        <h2 className="font-syne text-xl font-black tracking-tight text-gray-950">Rota recomendada por objetivo</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrackedCtaLink href="/app-personal-trainer" cta="Operação para personal" placement="blog_ia_personal_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Operação para personal</h3>
            <p className="mt-1 text-xs text-slate-500">Gestão, IA, cobrança e colaboração clínica.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/nutricionistas" cta="Integração com nutrição" placement="blog_ia_personal_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Integração com nutrição</h3>
            <p className="mt-1 text-xs text-slate-500">Alinhe treino e dieta no mesmo contexto de aluno.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/afiliados" cta="Monetizar com afiliados" placement="blog_ia_personal_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Monetizar com afiliados</h3>
            <p className="mt-1 text-xs text-slate-500">Ganhe comissão recorrente por indicações.</p>
          </TrackedCtaLink>
        </div>
      </section>

      <FaqInline items={faq} id="faq" />
      <ArticleShare title={post.title} slug={post.slug} />
      <ArticleRelated posts={related} />

      {/* ── CTA ── */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/25 p-8 text-center sm:p-10" style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.10) 0%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #ffffff 0%, #f3faf5 100%)', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 26px 60px -28px rgba(34,197,94,0.4)' }}>
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-primary/10 blur-[90px]" />
        <span className="relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ ...monoLabel, background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">/PRÓXIMO PASSO</span>
        </span>
        <h2 className="relative mt-5 font-syne text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">Quer criar treinos com IA agora?</h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Teste o VFIT, gere sua primeira estrutura de treino e transforme revisão técnica em vantagem competitiva.
        </p>
        <div className="relative mt-6 flex justify-center">
          <TrackedCtaLink
            href="/register/personal"
            cta="Criar treino com IA agora"
            placement="blog_ia_montar_treinos_cta"
            pageSegment="blog"
            event="lp_register_start"
            className={pillPrimaryClass}
          >
            <PillSweep />
            <span className="relative z-10">Criar treino com IA agora</span>
            <PillArrow />
          </TrackedCtaLink>
        </div>
      </section>

      <ArticleNavigation prev={prev} next={next} />
    </ArticleShell>
  )
}
