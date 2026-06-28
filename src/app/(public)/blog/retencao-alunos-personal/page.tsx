// ============================================
// page.tsx — Post: Retenção de Alunos para Personal Trainer
// ============================================
//
// O que faz:
//   Página de artigo do blog sobre retenção de alunos por personal trainers.
//   RSC: metadata estático, post e artigos relacionados de BLOG_POSTS.
//   Renderiza header, conteúdo estático, share, navegação e artigos relacionados.
//   Inclui BlogPostingSchema JSON-LD para SEO/AEO.
//
//   Tema CLARO ultra moderno (kit article-kit.tsx + light-section.tsx) — coerente
//   com a home e o índice do blog. SEO/conteúdo inalterados.
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   RetencaoAlunosPage — page component (RSC)
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
import { FAQ_BLOG_RETENCAO } from '@/data/faqs'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'

const post = getPost('retencao-alunos-personal')!

export const metadata: Metadata = buildSeoMetadata({
  title: post.title,
  description: post.excerpt,
  path: '/blog/retencao-alunos-personal',
  ogImage: post.ogImage,
  type: 'article',
  section: post.category,
  tags: post.tags,
  publishedTime: post.dateISO,
  modifiedTime: post.modifiedISO,
})

/* ─── Data ─── */
const STATS: { value: string; label: string; source: string }[] = [
  { value: '67%', label: 'desistem em 3 meses sem acompanhamento estruturado', source: 'IHRSA 2024' },
  { value: '3x', label: 'mais retenção com onboarding nos primeiros 14 dias', source: 'ACE Fitness' },
  { value: '60%', label: 'aumento no LTV com cobrança automática integrada', source: 'Dados internos' },
]

const LEVERS: { icon: DSIconName; num: string; title: string; content: string; tip: string }[] = [
  {
    icon: 'target',
    num: '01',
    title: 'Onboarding forte nas primeiras 2 semanas',
    content: 'O período mais crítico é o início. Defina metas claras, faça a primeira avaliação física e entregue o primeiro treino em até 24h após o cadastro. Segundo o American Council on Exercise (ACE), alunos que treinam na primeira semana têm 3x mais chance de continuar após 3 meses.',
    tip: 'Envie uma mensagem de boas-vindas automatizada com vídeo de apresentação e o treino já pronto.',
  },
  {
    icon: 'trendingUp',
    num: '02',
    title: 'Acompanhamento semanal com dados reais',
    content: 'Não espere o aluno reclamar. Revise semanalmente: treinos concluídos, cargas progressivas e percepção de esforço (RPE). A IA do VFIT mostra esses dados automaticamente no seu dashboard, gerando alertas quando há queda de engajamento.',
    tip: 'Reserve 15 min toda segunda para revisar o dashboard de frequência da semana anterior.',
  },
  {
    icon: 'messageSquare',
    num: '03',
    title: 'Comunicação proativa em quedas de engajamento',
    content: 'Quando um aluno não treina por 3 dias seguidos, ative contato imediato. Uma revisão da IHRSA mostrou que uma mensagem simples ("Vi que não treinou essa semana, está tudo bem?") recupera até 40% dos alunos em risco de cancelamento.',
    tip: 'Configure notificações automáticas de inatividade no VFIT para nunca perder o timing.',
  },
  {
    icon: 'heart',
    num: '04',
    title: 'Gamificação e reconhecimento',
    content: 'Badges por consistência, XP por treinos concluídos e rankings entre alunos criam um ciclo de motivação intrínseca. Pesquisas da área de behavorial design mostram que alunos em programas gamificados têm 2x mais engajamento semanal e permanecem em média 4 meses a mais.',
    tip: 'Celebre publicamente conquistas de alunos — "50 treinos!" cria efeito social positivo.',
  },
  {
    icon: 'creditCard',
    num: '05',
    title: 'Renovação facilitada com cobrança automática',
    content: 'Inadimplência é o churn silencioso. O aluno não cancela ativamente — ele simplesmente "esquece" de renovar. Configure cobranças automáticas com régua de lembretes para eliminar esse atrito. Dados internos mostram aumento de até 60% no LTV médio com recorrência ativa.',
    tip: 'Ofereça desconto de 10% no plano trimestral para incentivar compromisso de longo prazo.',
  },
]

const METRICS: { name: string; desc: string; icon: DSIconName }[] = [
  { name: 'Taxa de frequência semanal', desc: '% de alunos que treinaram ≥ 2x na semana', icon: 'calendar' },
  { name: 'Taxa de conclusão de treino', desc: '% de treinos iniciados vs concluídos', icon: 'checkCircle' },
  { name: 'Churn mensal', desc: '% de alunos que cancelaram no mês', icon: 'trendingUp' },
  { name: 'NPS (Net Promoter Score)', desc: 'Satisfação geral medida a cada 30 dias', icon: 'heart' },
  { name: 'Tempo médio de permanência', desc: 'Quantos meses o aluno fica ativo na base', icon: 'clock' },
]

const SOURCES = [
  { label: 'IHRSA — Global Health & Fitness Industry Report (2024)', url: 'https://www.ihrsa.org/publications/the-global-health-fitness-industry-report/' },
  { label: 'ACE Fitness — Client Retention Strategies', url: 'https://www.acefitness.org/resources/pros/expert-articles/' },
  { label: 'ACSM — Exercise Prescription Guidelines', url: 'https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription' },
  { label: 'Nir Eyal — Hooked: How to Build Habit-Forming Products', url: 'https://www.nirandfar.com/hooked/' },
]

export default function RetencaoAlunosPage() {
  const idx = BLOG_POSTS.findIndex((p) => p.slug === 'retencao-alunos-personal')
  const prev = idx > 0 ? BLOG_POSTS[idx - 1] : null
  const next = idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null
  const related = getRelatedPosts('retencao-alunos-personal')

  return (
    <ArticleShell>
      <BlogPostingSchema
        title={post.title}
        description={post.excerpt}
        slug="/blog/retencao-alunos-personal"
        datePublished={post.dateISO}
        dateModified={post.modifiedISO}
        keywords={post.tags}
      />

      <ArticleHeader post={post} />

      {/* ── Introdução ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <p className="text-lg">
          A maioria dos personal trainers perde <strong className="font-semibold text-slate-900">30% a 50% dos alunos</strong> nos primeiros 3 meses. Isso não é falta de competência técnica — é falta de sistema. Os profissionais que retêm por mais tempo têm processos claros de onboarding, acompanhamento e comunicação proativa.
        </p>
        <p>
          Segundo o relatório da <a href="https://www.ihrsa.org/publications/the-global-health-fitness-industry-report/" target="_blank" rel="noopener noreferrer" className={articleLinkClass}>IHRSA (International Health, Racquet &amp; Sportsclub Association)</a>, o custo de adquirir um novo aluno é <strong className="font-semibold text-slate-900">5 a 7 vezes maior</strong> do que reter um existente. Ou seja, cada aluno que você perde custa caro.
        </p>
        <p>
          Neste artigo, detalhamos as <strong className="font-semibold text-slate-900">5 alavancas mais eficazes</strong> para reduzir o churn (taxa de cancelamento) e aumentar o LTV (Lifetime Value) de cada aluno, com dados de mercado e aplicações práticas.
        </p>
        <p>
          Para aplicar essas estratégias na prática com stack completo, veja a página para{' '}
          <Link href="/app-personal-trainer" className={articleLinkClass}>
            personal trainers
          </Link>
          {' '}e, quando fizer sentido clínico, a integração com{' '}
          <Link href="/nutricionistas" className={articleLinkClass}>
            nutricionistas
          </Link>
          .
        </p>
      </section>

      {/* ── Dados de contexto — Stats cards ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/DADOS DE MERCADO">Números que todo personal precisa conhecer</ArticleH2>

        <div className="grid gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="group relative space-y-2 overflow-hidden rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
              <HoverEdge />
              <div className="relative text-3xl font-black text-emerald-600" style={monoLabel}>{stat.value}</div>
              <p className="relative text-sm leading-relaxed text-slate-600">{stat.label}</p>
              <p className="relative text-[10px] uppercase tracking-wider text-slate-400">{stat.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Custo do churn — Callout ── */}
      <Callout icon="alertTriangle" tone="brand" title="O custo real do churn">
        Um personal com 30 alunos a R$ 300/mês que perde 10 por trimestre está deixando de faturar <strong className="font-semibold text-slate-900">R$ 36 mil/ano</strong>. Se retivesse metade desses alunos com um sistema simples de acompanhamento, o ganho seria de <strong className="font-semibold text-slate-900">R$ 18 mil anuais</strong> sem conquistar nenhum aluno novo.
      </Callout>

      {/* ── 5 Alavancas ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/ESTRATÉGIAS">As 5 alavancas da retenção</ArticleH2>

        {LEVERS.map((lever) => (
          <div key={lever.num} className="group relative space-y-4 overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
            <HoverEdge />
            <div className="relative flex items-start gap-4">
              <span className="shrink-0 font-black text-emerald-500/25 transition-colors group-hover:text-emerald-500/45" style={{ ...monoLabel, fontSize: '1.6rem' }}>{lever.num}</span>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600" style={greenChip}>
                    <DSIcon name={lever.icon} size={16} />
                  </div>
                  <h3 className="font-syne text-lg font-black tracking-tight text-gray-950">{lever.title}</h3>
                </div>
              </div>
            </div>
            <p className="relative leading-relaxed text-slate-600">{lever.content}</p>

            {/* Dica prática */}
            <div className="relative flex gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50/70 p-3">
              <DSIcon name="zap" size={14} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-xs leading-relaxed text-emerald-800"><strong className="font-semibold text-emerald-900">Dica prática:</strong> {lever.tip}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Framework de comunicação ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <ArticleH2 eyebrow="/COMUNICAÇÃO">Framework de comunicação proativa</ArticleH2>
        <p>
          A retenção depende de <strong className="font-semibold text-slate-900">timing</strong>. Segundo o modelo <a href="https://www.nirandfar.com/hooked/" target="_blank" rel="noopener noreferrer" className={articleLinkClass}>Hook de Nir Eyal</a>, hábitos se formam com gatilhos no momento certo. Para personal trainers, isso significa:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { time: '24h', event: 'Após cadastro', action: 'Boas-vindas + primeiro treino pronto' },
            { time: '48h', event: 'Sem treinar', action: 'Mensagem empática: "está tudo bem?"' },
            { time: '7 dias', event: 'Primeira semana', action: 'Check-in: "como foi a primeira semana?"' },
          ].map((item) => (
            <div key={item.time} className="group relative space-y-2 overflow-hidden rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
              <HoverEdge />
              <span className="relative text-lg font-black text-emerald-600" style={monoLabel}>{item.time}</span>
              <p className="relative text-xs uppercase tracking-wider text-slate-500">{item.event}</p>
              <p className="relative text-sm text-slate-600">{item.action}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Métricas ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/MÉTRICAS">Métricas que você deve acompanhar</ArticleH2>
        <p className="text-slate-600">Para saber se suas estratégias estão funcionando, monitore semanalmente:</p>

        <div className="space-y-3">
          {METRICS.map((m) => (
            <div key={m.name} className="group relative flex items-center gap-4 overflow-hidden rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
              <HoverEdge />
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-emerald-600" style={greenChip}>
                <DSIcon name={m.icon} size={18} />
              </div>
              <div className="relative">
                <h4 className="font-syne text-sm font-black tracking-tight text-gray-950">{m.name}</h4>
                <p className="text-xs text-slate-500">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqInline items={FAQ_BLOG_RETENCAO} />

      {/* ── ICP switcher ── */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6" style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -24px rgba(15,23,42,0.14)' }}>
        <h2 className="font-syne text-xl font-black tracking-tight text-gray-950">Próximo passo por perfil</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrackedCtaLink href="/app-personal-trainer" cta="Escalar operação" placement="blog_retencao_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Escalar operação</h3>
            <p className="mt-1 text-xs text-slate-500">Gestão e retenção com dados em tempo real.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/nutricionistas" cta="Apoio nutricional" placement="blog_retencao_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Apoio nutricional</h3>
            <p className="mt-1 text-xs text-slate-500">Treino + dieta para melhorar adesão do aluno.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/afiliados" cta="Monetização adicional" placement="blog_retencao_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Monetização adicional</h3>
            <p className="mt-1 text-xs text-slate-500">Comissão recorrente por indicação ativa.</p>
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
        <h2 className="relative mt-5 font-syne text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">Quer reter mais alunos?</h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          O VFIT tem dashboard de retenção, alertas de queda de engajamento, gamificação integrada e cobrança automática. Tudo num só lugar.
        </p>
        <div className="relative mt-6 flex justify-center">
          <TrackedCtaLink
            href="/register"
            cta="Criar conta grátis"
            placement="blog_retencao_legacy_cta"
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
