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
//   Tema CLARO ultra moderno (kit article-kit.tsx + light-section.tsx) — coerente
//   com a home e o índice do blog. SEO/conteúdo inalterados.
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
  TableOfContents,
  articleSlug,
} from '@/components/blog/article-kit'
import { FaqInline } from '@/components/shared/faq-inline'
import { FAQ_BLOG_COBRANCA } from '@/data/faqs'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'

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
  { day: 'D-3', action: 'Lembrete amigável de vencimento próximo via push + email', icon: 'bell', color: 'text-emerald-600', bg: 'bg-emerald-500/12' },
  { day: 'D-0', action: 'Notificação no dia do vencimento com link de pagamento', icon: 'clock', color: 'text-amber-600', bg: 'bg-amber-500/12' },
  { day: 'D+1', action: 'Aviso de pagamento em atraso — tom empático, não punitivo', icon: 'alertTriangle', color: 'text-orange-600', bg: 'bg-orange-500/12' },
  { day: 'D+3', action: 'Segundo lembrete com novo link de pagamento gerado', icon: 'send', color: 'text-red-500', bg: 'bg-red-500/12' },
  { day: 'D+7', action: 'Bloqueio automático do acesso + notificação final ao aluno', icon: 'ban', color: 'text-red-600', bg: 'bg-red-500/15' },
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
    <ArticleShell>
      <BlogPostingSchema
        title={post.title}
        description={post.excerpt}
        slug="/blog/cobranca-automatica-personal"
        datePublished={post.dateISO}
        dateModified={post.modifiedISO}
        keywords={post.tags}
      />

      <ArticleHeader post={post} />

      <TableOfContents
        items={[
          { id: articleSlug('PIX vs Cartão vs Boleto'), label: 'PIX vs Cartão vs Boleto' },
          { id: articleSlug('Como configurar em 5 passos'), label: 'Configurar em 5 passos' },
          { id: articleSlug('Régua de lembretes automática'), label: 'Régua de lembretes' },
          { id: articleSlug('Receita previsível: o superpoder financeiro'), label: 'Receita previsível' },
          { id: articleSlug('Resultados esperados'), label: 'Resultados esperados' },
          { id: 'faq', label: 'Perguntas frequentes' },
        ]}
      />

      {/* ── Introdução ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <p className="text-lg">
          Cobrar alunos manualmente é um dos maiores ralos de tempo e energia do personal trainer. Entre enviar mensagens, conferir comprovantes e lidar com atrasos, você perde <strong className="font-semibold text-slate-900">5 a 10 horas por mês</strong> que poderiam ser dedicadas a treinar mais alunos ou investir no seu negócio.
        </p>
        <p>
          Dados do <a href="https://www.bcb.gov.br/estabilidadefinanceira/pix" target="_blank" rel="noopener noreferrer" className={articleLinkClass}>Banco Central</a> mostram que o PIX já representa <strong className="font-semibold text-slate-900">mais de 45% das transações digitais no Brasil</strong> (2024), e a tendência de cobranças automatizadas cresce 30% ao ano entre microempreendedores.
        </p>
        <p>
          A cobrança automática resolve isso de forma definitiva: o sistema gera, envia e confirma pagamentos sem que você precise fazer nada. Neste guia, mostramos <strong className="font-semibold text-slate-900">como configurar em 5 passos</strong> e qual método funciona melhor para cada perfil de aluno.
        </p>
        <p>
          Se quiser ver o fluxo completo de operação profissional, acesse a página para{' '}
          <Link href="/app-personal-trainer" className={articleLinkClass}>
            personal trainers
          </Link>
          . Para receita adicional além das cobranças, veja também{' '}
          <Link href="/afiliados" className={articleLinkClass}>
            programa de afiliados
          </Link>
          .
        </p>
      </section>

      {/* ── Impacto financeiro — Callout ── */}
      <Callout icon="trendingUp" tone="amber" title="Inadimplência custa caro — e é evitável">
        Segundo o <a href="https://sebrae.com.br/sites/PortalSebrae/ufs/mg/artigos/gestao-financeira" target="_blank" rel="noopener noreferrer" className={articleLinkClass}>SEBRAE</a>, 62% dos microempreendedores brasileiros têm dificuldade com gestão de cobranças. Para personal trainers, cada aluno inadimplente representa em média <strong className="font-semibold text-slate-900">R$ 360/mês</strong> de receita perdida.
      </Callout>

      {/* ── Métodos de pagamento — Cards detalhados ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/COMPARATIVO">PIX vs Cartão vs Boleto</ArticleH2>

        <div className="space-y-4">
          {PAYMENT_METHODS.map((pm) => (
            <div key={pm.method} className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 sm:p-6" style={lightCard}>
              <HoverEdge />
              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-emerald-600" style={greenChip}>
                  <DSIcon name={pm.icon} size={22} />
                </div>
                <div className="grow">
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-syne text-lg font-black tracking-tight text-gray-950">{pm.method}</h3>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700" style={monoLabel}>{pm.fee}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{pm.speed} · {pm.best}</p>
                </div>
              </div>
              <p className="relative mt-3 text-sm leading-relaxed text-slate-600">{pm.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Alerta taxas ── */}
      <Callout icon="alertTriangle" tone="amber" title="Importante sobre taxas">
        As taxas variam conforme o gateway. O VFIT utiliza o <a href="https://docs.asaas.com/" target="_blank" rel="noopener noreferrer" className={articleLinkClass}>Asaas</a>, que oferece as menores taxas do mercado para personal trainers. PIX a partir de R$ 0,99 por transação.
      </Callout>

      {/* ── 5 Passos ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/SETUP">Como configurar em 5 passos</ArticleH2>

        <div className="space-y-4">
          {STEPS_SETUP.map((s) => (
            <div key={s.step} className="group relative flex gap-4 overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
              <HoverEdge />
              <span className="relative shrink-0 font-black text-emerald-500/25 transition-colors group-hover:text-emerald-500/45" style={{ ...monoLabel, fontSize: '1.6rem' }}>{s.step}</span>
              <div className="relative">
                <h3 className="font-syne font-black tracking-tight text-gray-950">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Régua de Lembretes ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/AUTOMAÇÃO">Régua de lembretes automática</ArticleH2>
        <p className="text-slate-600">O sistema envia notificações automaticamente conforme o status do pagamento:</p>

        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute bottom-5 left-5 top-5 w-px bg-linear-to-b from-emerald-500/40 via-amber-500/40 to-red-500/40" />

          {REGUA_LEMBRETES.map((item) => (
            <div key={item.day} className="relative flex items-start gap-4 py-3">
              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} ring-1 ring-black/5`}>
                <DSIcon name={item.icon} size={18} className={item.color} />
              </div>
              <div className="pt-1.5">
                <span className="font-mono text-sm font-bold text-gray-950">{item.day}</span>
                <span className="ml-3 text-sm text-slate-600">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Receita previsível ── */}
      <section className="space-y-5 text-[17px] leading-relaxed text-slate-600">
        <ArticleH2 eyebrow="/FINANÇAS">Receita previsível: o superpoder financeiro</ArticleH2>
        <p>
          A maior vantagem da cobrança automática não é economizar tempo — é ter <strong className="font-semibold text-slate-900">previsibilidade de caixa</strong>. Com recorrências ativas, você sabe exatamente quanto vai receber no próximo mês, podendo planejar investimentos, marketing e expansão com segurança.
        </p>
        <p>
          Segundo dados da <a href="https://www.ihrsa.org/publications/the-global-health-fitness-industry-report/" target="_blank" rel="noopener noreferrer" className={articleLinkClass}>IHRSA</a>, profissionais fitness com sistemas de cobrança automatizada têm em média <strong className="font-semibold text-slate-900">2,3x mais receita anual</strong> que aqueles que cobram manualmente — não porque cobram mais, mas porque perdem menos.
        </p>
      </section>

      {/* ── Resultados ── */}
      <section className="space-y-6">
        <ArticleH2 eyebrow="/RESULTADOS">Resultados esperados</ArticleH2>

        <div className="grid grid-cols-2 gap-4">
          {RESULTS.map((r) => (
            <div key={r.label} className="group relative space-y-2 overflow-hidden rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-0.5" style={lightCard}>
              <HoverEdge />
              <div className="relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-emerald-600" style={greenChip}>
                <DSIcon name={r.icon} size={18} />
              </div>
              <div className="relative text-2xl font-black text-gray-950" style={monoLabel}>{r.value}</div>
              <div className="relative text-xs text-slate-500">{r.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqInline items={FAQ_BLOG_COBRANCA} id="faq" />

      {/* ── ICP switcher ── */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6" style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -24px rgba(15,23,42,0.14)' }}>
        <h2 className="font-syne text-xl font-black tracking-tight text-gray-950">Direcione sua próxima ação</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrackedCtaLink href="/app-personal-trainer" cta="Operação profissional" placement="blog_cobranca_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Operação profissional</h3>
            <p className="mt-1 text-xs text-slate-500">Gestão + cobrança + IA no mesmo fluxo.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/afiliados" cta="Monetização por indicação" placement="blog_cobranca_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Monetização por indicação</h3>
            <p className="mt-1 text-xs text-slate-500">Comissão recorrente para aumentar receita.</p>
          </TrackedCtaLink>
          <TrackedCtaLink href="/" cta="Experiência do aluno" placement="blog_cobranca_legacy_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]">
            <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">Experiência do aluno</h3>
            <p className="mt-1 text-xs text-slate-500">Veja a home com foco em resultado do aluno.</p>
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
        <h2 className="relative mt-5 font-syne text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">Quer automatizar suas cobranças?</h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Configure cobrança automática com PIX, cartão e boleto em menos de 5 minutos. Integração com Asaas inclusa. Sem taxas de setup.
        </p>
        <div className="relative mt-6 flex justify-center">
          <TrackedCtaLink
            href="/register"
            cta="Começar agora"
            placement="blog_cobranca_legacy_cta"
            pageSegment="blog"
            event="lp_register_start"
            className={pillPrimaryClass}
          >
            <PillSweep />
            <span className="relative z-10">Começar agora</span>
            <PillArrow />
          </TrackedCtaLink>
        </div>
      </section>

      {/* Navigation */}
      <ArticleNavigation prev={prev} next={next} />
    </ArticleShell>
  )
}
