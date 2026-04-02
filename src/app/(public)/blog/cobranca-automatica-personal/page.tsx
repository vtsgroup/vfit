// ============================================
// page.tsx — Post: Cobrança Automática para Personal Trainer
// ============================================
//
// O que faz:
//   Página de artigo do blog sobre cobrança automática para personals.
//   RSC: gera metadata estático, carrega post de BLOG_POSTS, artigos relacionados.
//   Renderiza ArticleHeader, conteúdo estático do artigo, ArticleShare, ArticleNavigation
//   e ArticleRelated. Inclui BlogPostingSchema JSON-LD para SEO/AEO.
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   CobrancaAutomaticaPage — page component (RSC)
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
import { FAQ_BLOG_COBRANCA } from '@/data/faqs'

const post = getPost('cobranca-automatica-personal')!

export const metadata: Metadata = buildSeoMetadata({
  title: post.title,
  description: post.excerpt,
  path: '/blog/cobranca-automatica-personal',
  ogImage: post.ogImage,
  type: 'article',
  section: post.category,
  tags: post.tags,
  publishedTime: post.dateISO,
  modifiedTime: post.modifiedISO,
})

/* ─── Data ─── */
const PAYMENT_METHODS: { method: string; icon: DSIconName; speed: string; fee: string; best: string; detail: string }[] = [
  { method: 'PIX', icon: 'smartphone', speed: 'Instantâneo', fee: '0,99%', best: 'Melhor custo-benefício', detail: 'Confirmação em segundos. Ideal para mensalidades únicas. Menor taxa do mercado.' },
  { method: 'Cartão de Crédito', icon: 'creditCard', speed: '2 dias úteis', fee: '2,99%', best: 'Recorrência automática', detail: 'Aluno autoriza 1x e a cobrança repete todo mês sem ação. Taxa maior, porém zero atrito.' },
  { method: 'Boleto Bancário', icon: 'fileText', speed: '1-2 dias úteis', fee: 'R$ 1,99', best: 'Sem cartão / sem Pix', detail: 'Para alunos que preferem pagamento tradicional. Compensação mais lenta, risco de esquecimento.' },
]

const STEPS_SETUP = [
  { step: '01', title: 'Cadastre o aluno', description: 'Adicione nome, email e CPF — o VFIT cria automaticamente o customer no gateway de pagamentos.' },
  { step: '02', title: 'Defina o plano e valor', description: 'Escolha entre mensal, trimestral ou semestral. Configure desconto progressivo para planos longos se desejar.' },
  { step: '03', title: 'Selecione o método', description: 'PIX, cartão ou boleto. Para recorrência no cartão, o aluno autoriza uma única vez e os ciclos seguem automáticos.' },
  { step: '04', title: 'Ative a cobrança', description: 'O sistema gera cobranças automaticamente a cada ciclo, com régua de lembretes por push notification e email.' },
  { step: '05', title: 'Acompanhe em tempo real', description: 'Dashboard financeiro com pagamentos recebidos, pendentes, atrasados e projeção de receita mensal.' },
]

const REGUA_LEMBRETES: { day: string; action: string; icon: DSIconName; color: string; bg: string }[] = [
  { day: 'D-3', action: 'Lembrete amigável de vencimento próximo via push + email', icon: 'bell', color: 'text-blue-400', bg: 'bg-blue-500/15' },
  { day: 'D-0', action: 'Notificação no dia do vencimento com link de pagamento', icon: 'clock', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  { day: 'D+1', action: 'Aviso de pagamento em atraso — tom empático, não punitivo', icon: 'alertTriangle', color: 'text-orange-400', bg: 'bg-orange-500/15' },
  { day: 'D+3', action: 'Segundo lembrete com novo link de pagamento gerado', icon: 'send', color: 'text-red-400', bg: 'bg-red-500/15' },
  { day: 'D+7', action: 'Bloqueio automático do acesso + notificação final ao aluno', icon: 'ban', color: 'text-red-500', bg: 'bg-red-500/15' },
]

const RESULTS: { icon: DSIconName; value: string; label: string }[] = [
  { icon: 'checkCircle', value: '95%', label: 'taxa de adimplência média' },
  { icon: 'clock', value: '-10h', label: 'menos trabalho manual/mês' },
  { icon: 'trendingUp', value: '+60%', label: 'aumento no LTV médio' },
  { icon: 'send', value: '0', label: 'cobranças manuais enviadas' },
]

const SOURCES = [
  { label: 'Banco Central do Brasil — Estatísticas do PIX (2024)', url: 'https://www.bcb.gov.br/estabilidadefinanceira/pix' },
  { label: 'SEBRAE — Gestão Financeira para MEI', url: 'https://sebrae.com.br/sites/PortalSebrae/ufs/mg/artigos/gestao-financeira' },
  { label: 'IHRSA — Global Health & Fitness Industry Report', url: 'https://www.ihrsa.org/publications/the-global-health-fitness-industry-report/' },
  { label: 'Asaas — API de Pagamentos e Taxas', url: 'https://docs.asaas.com/' },
]

export default function CobrancaAutomaticaPage() {
  const idx = BLOG_POSTS.findIndex((p) => p.slug === 'cobranca-automatica-personal')
  const prev = idx > 0 ? BLOG_POSTS[idx - 1] : null
  const next = idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null
  const related = getRelatedPosts('cobranca-automatica-personal')

  return (
    <article className="mx-auto max-w-3xl space-y-12 px-6 pb-24">
      <BlogPostingSchema
        title={post.title}
        description={post.excerpt}
        slug="/blog/cobranca-automatica-personal"
        datePublished={post.dateISO}
        dateModified={post.modifiedISO}
        keywords={post.tags}
      />

      <ArticleHeader post={post} />

      {/* ── Introdução ── */}
      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <p className="text-lg">
          Cobrar alunos manualmente é um dos maiores ralos de tempo e energia do personal trainer. Entre enviar mensagens, conferir comprovantes e lidar com atrasos, você perde <strong className="text-white">5 a 10 horas por mês</strong> que poderiam ser dedicadas a treinar mais alunos ou investir no seu negócio.
        </p>
        <p>
          Dados do <a href="https://www.bcb.gov.br/estabilidadefinanceira/pix" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline decoration-brand-primary/30 hover:decoration-brand-primary transition-colors">Banco Central</a> mostram que o PIX já representa <strong className="text-white">mais de 45% das transações digitais no Brasil</strong> (2024), e a tendência de cobranças automatizadas cresce 30% ao ano entre microempreendedores.
        </p>
        <p>
          A cobrança automática resolve isso de forma definitiva: o sistema gera, envia e confirma pagamentos sem que você precise fazer nada. Neste guia, mostramos <strong className="text-white">como configurar em 5 passos</strong> e qual método funciona melhor para cada perfil de aluno.
        </p>
      </section>

      {/* ── Impacto financeiro — Callout ── */}
      <div className="flex gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
          <DSIcon name="trendingUp" size={20} className="text-amber-400" />
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-white">Inadimplência custa caro — e é evitável</p>
          <p className="text-zinc-400">
            Segundo o <a href="https://sebrae.com.br/sites/PortalSebrae/ufs/mg/artigos/gestao-financeira" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline decoration-brand-primary/30">SEBRAE</a>, 62% dos microempreendedores brasileiros têm dificuldade com gestão de cobranças. Para personal trainers, cada aluno inadimplente representa em média <strong className="text-zinc-200">R$ 360/mês</strong> de receita perdida.
          </p>
        </div>
      </div>

      {/* ── Métodos de pagamento — Cards detalhados ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/COMPARATIVO</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">PIX vs Cartão vs Boleto</h2>
        </div>

        <div className="space-y-4">
          {PAYMENT_METHODS.map((pm) => (
            <div key={pm.method} className="rounded-2xl border border-white/10 bg-white/3 p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 shrink-0">
                  <DSIcon name={pm.icon} size={22} className="text-amber-400" />
                </div>
                <div className="grow">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-lg font-bold text-white">{pm.method}</h3>
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider" style={{ fontFamily: 'ui-monospace, monospace' }}>{pm.fee}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{pm.speed} · {pm.best}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{pm.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Alerta taxas ── */}
      <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <DSIcon name="alertTriangle" className="text-amber-400 mt-0.5 shrink-0" />
        <div className="text-sm text-zinc-300 space-y-1">
          <p className="font-semibold text-amber-300">Importante sobre taxas</p>
          <p>As taxas variam conforme o gateway. O VFIT utiliza o <a href="https://docs.asaas.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline decoration-brand-primary/30">Asaas</a>, que oferece as menores taxas do mercado para personal trainers. PIX a partir de R$ 0,99 por transação.</p>
        </div>
      </div>

      {/* ── 5 Passos ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/SETUP</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Como configurar em 5 passos</h2>
        </div>

        <div className="space-y-4">
          {STEPS_SETUP.map((s) => (
            <div key={s.step} className="group flex gap-4 rounded-2xl border border-white/8 bg-white/2 p-5 transition-all hover:border-amber-500/20 hover:bg-amber-500/3">
              <span className="text-2xl font-black text-amber-500/20 transition-colors group-hover:text-amber-500/35 shrink-0" style={{ fontFamily: 'ui-monospace, monospace' }}>{s.step}</span>
              <div>
                <h3 className="font-bold text-white">{s.title}</h3>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Régua de Lembretes ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/AUTOMAÇÃO</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Régua de lembretes automática</h2>
        </div>
        <p className="text-zinc-300">O sistema envia notificações automaticamente conforme o status do pagamento:</p>

        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-5 top-5 bottom-5 w-px bg-linear-to-b from-blue-500/40 via-amber-500/40 to-red-500/40 sm:left-5" />

          {REGUA_LEMBRETES.map((item) => (
            <div key={item.day} className="relative flex items-start gap-4 py-3">
              <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} shrink-0`}>
                <DSIcon name={item.icon} size={18} className={item.color} />
              </div>
              <div className="pt-1.5">
                <span className="font-mono text-sm text-white">{item.day}</span>
                <span className="text-zinc-400 text-sm ml-3">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Receita previsível ── */}
      <section className="space-y-5 text-zinc-300 leading-relaxed">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/FINANÇAS</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Receita previsível: o superpoder financeiro</h2>
        </div>
        <p>
          A maior vantagem da cobrança automática não é economizar tempo — é ter <strong className="text-white">previsibilidade de caixa</strong>. Com recorrências ativas, você sabe exatamente quanto vai receber no próximo mês, podendo planejar investimentos, marketing e expansão com segurança.
        </p>
        <p>
          Segundo dados da <a href="https://www.ihrsa.org/publications/the-global-health-fitness-industry-report/" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline decoration-brand-primary/30">IHRSA</a>, profissionais fitness com sistemas de cobrança automatizada têm em média <strong className="text-white">2,3x mais receita anual</strong> que aqueles que cobram manualmente — não porque cobram mais, mas porque perdem menos.
        </p>
      </section>

      {/* ── Resultados ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/RESULTADOS</span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Resultados esperados</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {RESULTS.map((r) => (
            <div key={r.label} className="rounded-2xl border border-white/8 bg-white/2 p-5 text-center space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 mx-auto">
                <DSIcon name={r.icon} size={18} className="text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white" style={{ fontFamily: 'ui-monospace, monospace' }}>{r.value}</div>
              <div className="text-xs text-zinc-500">{r.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqInline items={FAQ_BLOG_COBRANCA} />

      {/* ── Fontes ── */}
      <section className="rounded-2xl border border-white/8 bg-white/3 p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500" style={{ fontFamily: 'ui-monospace, monospace' }}>Fontes e referências</h3>
        <ul className="space-y-2">
          {SOURCES.map((s) => (
            <li key={s.url} className="flex items-start gap-2 text-sm">
              <DSIcon name="externalLink" size={14} className="mt-0.5 shrink-0 text-amber-500/60" />
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline decoration-white/10 hover:text-amber-400 hover:decoration-amber-400/30 transition-colors">
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
      <section className="text-center rounded-2xl border border-amber-500/30 bg-linear-to-b from-amber-500/10 to-transparent p-8 sm:p-10 space-y-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400" style={{ fontFamily: 'ui-monospace, monospace' }}>/PRÓXIMO PASSO</span>
        <h2 className="text-2xl font-bold text-white">Quer automatizar suas cobranças?</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          Configure cobrança automática com PIX, cartão e boleto em menos de 5 minutos. Integração com Asaas inclusa. Sem taxas de setup.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
        >
          Começar agora
          <DSIcon name="arrowRight" size={16} />
        </Link>
      </section>

      {/* Navigation */}
      <ArticleNavigation prev={prev} next={next} />
    </article>
  )
}
