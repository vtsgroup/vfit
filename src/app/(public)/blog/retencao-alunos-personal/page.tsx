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
import { FaqInline } from '@/components/shared/faq-inline'
import { FAQ_BLOG_RETENCAO } from '@/data/faqs'

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
    <article className="mx-auto max-w-3xl space-y-12 px-6 pb-24">
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
      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <p className="text-lg">
          A maioria dos personal trainers perde <strong className="text-white">30% a 50% dos alunos</strong> nos primeiros 3 meses. Isso não é falta de competência técnica — é falta de sistema. Os profissionais que retêm por mais tempo têm processos claros de onboarding, acompanhamento e comunicação proativa.
        </p>
        <p>
          Segundo o relatório da <a href="https://www.ihrsa.org/publications/the-global-health-fitness-industry-report/" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline decoration-brand-primary/30 hover:decoration-brand-primary transition-colors">IHRSA (International Health, Racquet &amp; Sportsclub Association)</a>, o custo de adquirir um novo aluno é <strong className="text-white">5 a 7 vezes maior</strong> do que reter um existente. Ou seja, cada aluno que você perde custa caro.
        </p>
        <p>
          Neste artigo, detalhamos as <strong className="text-white">5 alavancas mais eficazes</strong> para reduzir o churn (taxa de cancelamento) e aumentar o LTV (Lifetime Value) de cada aluno, com dados de mercado e aplicações práticas.
        </p>
      </section>

      {/* ── Dados de contexto — Stats cards ── */}
      <section className="space-y-4">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/DADOS DE MERCADO</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Números que todo personal precisa conhecer</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/2 p-5 text-center space-y-2">
              <div className="text-3xl font-bold text-emerald-400" style={{ fontFamily: 'ui-monospace, monospace' }}>{stat.value}</div>
              <p className="text-sm text-zinc-400 leading-relaxed">{stat.label}</p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{stat.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Custo do churn — Callout ── */}
      <div className="flex gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
          <DSIcon name="alertTriangle" size={20} className="text-emerald-400" />
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-white">O custo real do churn</p>
          <p className="text-zinc-400">
            Um personal com 30 alunos a R$ 300/mês que perde 10 por trimestre está deixando de faturar <strong className="text-zinc-200">R$ 36 mil/ano</strong>. Se retivesse metade desses alunos com um sistema simples de acompanhamento, o ganho seria de <strong className="text-zinc-200">R$ 18 mil anuais</strong> sem conquistar nenhum aluno novo.
          </p>
        </div>
      </div>

      {/* ── 5 Alavancas ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/ESTRATÉGIAS</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">As 5 alavancas da retenção</h2>
        </div>

        {LEVERS.map((lever) => (
          <div key={lever.num} className="group rounded-2xl border border-white/10 bg-white/3 p-6 space-y-4 transition-all hover:border-emerald-500/20 hover:bg-emerald-500/3">
            <div className="flex items-start gap-4">
              <span className="text-3xl font-black text-emerald-500/15 transition-colors group-hover:text-emerald-500/25 shrink-0" style={{ fontFamily: 'ui-monospace, monospace' }}>{lever.num}</span>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                    <DSIcon name={lever.icon} size={16} className="text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{lever.title}</h3>
                </div>
              </div>
            </div>
            <p className="text-zinc-300 leading-relaxed">{lever.content}</p>

            {/* Dica prática */}
            <div className="flex gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3">
              <DSIcon name="zap" size={14} className="text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-300/80 leading-relaxed"><strong className="text-emerald-300">Dica prática:</strong> {lever.tip}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Framework de comunicação ── */}
      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/COMUNICAÇÃO</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Framework de comunicação proativa</h2>
        </div>
        <p>
          A retenção depende de <strong className="text-white">timing</strong>. Segundo o modelo <a href="https://www.nirandfar.com/hooked/" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline decoration-brand-primary/30">Hook de Nir Eyal</a>, hábitos se formam com gatilhos no momento certo. Para personal trainers, isso significa:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { time: '24h', event: 'Após cadastro', action: 'Boas-vindas + primeiro treino pronto' },
            { time: '48h', event: 'Sem treinar', action: 'Mensagem empática: "está tudo bem?"' },
            { time: '7 dias', event: 'Primeira semana', action: 'Check-in: "como foi a primeira semana?"' },
          ].map((item) => (
            <div key={item.time} className="rounded-xl border border-white/8 bg-white/2 p-4 space-y-2">
              <span className="text-lg font-bold text-emerald-400" style={{ fontFamily: 'ui-monospace, monospace' }}>{item.time}</span>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{item.event}</p>
              <p className="text-sm text-zinc-300">{item.action}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Métricas ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/MÉTRICAS</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Métricas que você deve acompanhar</h2>
        </div>
        <p className="text-zinc-400">Para saber se suas estratégias estão funcionando, monitore semanalmente:</p>

        <div className="space-y-3">
          {METRICS.map((m) => (
            <div key={m.name} className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/2 p-4 transition-all hover:border-emerald-500/15">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 shrink-0">
                <DSIcon name={m.icon} size={18} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{m.name}</h4>
                <p className="text-xs text-zinc-500">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqInline items={FAQ_BLOG_RETENCAO} />

      {/* ── Fontes ── */}
      <section className="rounded-2xl border border-white/8 bg-white/3 p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500" style={{ fontFamily: 'ui-monospace, monospace' }}>Fontes e referências</h3>
        <ul className="space-y-2">
          {SOURCES.map((s) => (
            <li key={s.url} className="flex items-start gap-2 text-sm">
              <DSIcon name="externalLink" size={14} className="mt-0.5 shrink-0 text-emerald-500/60" />
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline decoration-white/10 hover:text-emerald-400 hover:decoration-emerald-400/30 transition-colors">
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
      <section className="text-center rounded-2xl border border-emerald-500/30 bg-linear-to-b from-emerald-500/10 to-transparent p-8 sm:p-10 space-y-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/PRÓXIMO PASSO</span>
        <h2 className="text-2xl font-bold text-white">Quer reter mais alunos?</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          O VFIT tem dashboard de retenção, alertas de queda de engajamento, gamificação integrada e cobrança automática. Tudo num só lugar.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
        >
          Criar conta grátis
          <DSIcon name="arrowRight" size={16} />
        </Link>
      </section>

      {/* Navigation */}
      <ArticleNavigation prev={prev} next={next} />
    </article>
  )
}
