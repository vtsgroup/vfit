// ============================================
// page.tsx — Listagem do Blog (banda CLARA)
// ============================================
//
// O que faz:
//   Página de listagem do blog. RSC: metadata + JSON-LD + PageHero escuro, e uma
//   banda CLARA full-bleed (bg-bg-landing-light) — irmã das seções de conteúdo da
//   home (features/about/FAQ). Contém o switcher por perfil (ICP), a listagem de
//   posts (BlogListing) e o CTA de newsletter, todos em tema claro.
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   BlogPage — page component (RSC)
import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { BlogCollectionSchema } from '@/components/seo/json-ld'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { BLOG_POSTS } from '@/data/blog-posts'
import { BlogListing } from '@/components/blog/blog-listing'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Blog VFIT: IA, gestão e crescimento para fitness e wellness',
  description:
    'Artigos práticos sobre IA, gestão de alunos, retenção, cobrança automática e crescimento para personal trainers, nutricionistas e operações fitness.',
  path: '/blog',
  ogImage: '/og/og-blog.png',
})

/* ─── Tokens (irmãos das seções claras da home) ─── */
const headingFont: CSSProperties = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '0',
}
const monoLabel: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}
const greenChip: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(34,197,94,0.16), rgba(34,197,94,0.05))',
  border: '1px solid rgba(34,197,94,0.22)',
}
// Card claro reaproveitado via className (TrackedCtaLink não aceita `style`)
const lightCardClass =
  'bg-[linear-gradient(180deg,#ffffff_0%,#eef1f7_100%)] border border-slate-900/10 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-22px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]'

/* Borda-gradiente verde no hover (xor) — CSS puro */
function HoverBorder() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        padding: '1px',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.5) 0%, rgba(132,204,22,0.2) 45%, transparent 75%)',
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
    />
  )
}

/* Eyebrow pill + heading (claro) */
function SectionHead({ icon, eyebrow, lead, accent, sub }: { icon: DSIconName; eyebrow: string; lead: string; accent: string; sub?: string }) {
  return (
    <div className="max-w-xl">
      <span
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]"
        style={{ ...monoLabel, background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)', border: '1px solid rgba(34,197,94,0.32)', boxShadow: '0 8px 20px -8px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.9)' }}
      >
        <DSIcon name={icon} size={13} className="text-brand-primary" />
        <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{eyebrow}</span>
      </span>
      <h2 className="mt-5 font-black leading-[0.98] tracking-[-0.02em] text-gray-950" style={{ ...headingFont, fontSize: 'clamp(1.9rem, 4vw, 2.85rem)' }}>
        {lead}{' '}
        <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">{accent}</span>
      </h2>
      {sub && <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-[15px]">{sub}</p>}
    </div>
  )
}

/* ─── Switcher por perfil (ICP) ─── */
const ICP: { href: string; icon: DSIconName; title: string; desc: string; cta: string }[] = [
  { href: '/', icon: 'user', title: 'Sou aluno', desc: 'Treino com IA, evolução e constância no app.', cta: 'Sou aluno' },
  { href: '/app-personal-trainer', icon: 'dumbbell', title: 'Sou personal trainer', desc: 'IA, gestão, colaboração com nutrição e escala.', cta: 'Sou personal trainer' },
  { href: '/nutricionistas', icon: 'apple', title: 'Sou nutricionista', desc: 'Nutrição e trabalho conjunto com personal.', cta: 'Sou nutricionista' },
  { href: '/afiliados', icon: 'share2', title: 'Quero ser afiliado', desc: 'Indique e ganhe comissão recorrente.', cta: 'Quero ser afiliado' },
]

export default function BlogPage() {
  return (
    <>
      <BlogCollectionSchema
        items={BLOG_POSTS.map((post) => ({
          name: post.title,
          url: `https://vfit.app.br/blog/${post.slug}`,
        }))}
      />

      <PageHero
        title="Insights para Fitness e Wellness"
        subtitle="Conteúdo prático para personal trainers, nutricionistas e operações fitness crescerem com IA, retenção e melhor gestão."
        badge="Blog"
        breadcrumbs={[{ label: 'Blog', href: '/blog' }]}
      />

      {/* Banda CLARA (irmã das seções de conteúdo da home) */}
      <section className="relative overflow-hidden bg-bg-landing-light py-16 sm:py-24" aria-label="Artigos do blog">
        {/* Atmosfera */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gray-200" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: 0.3, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/3 rounded-full bg-brand-primary/5 blur-[140px]" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 -translate-x-1/3 rounded-full bg-lime-400/5 blur-[130px]" />

        <div className="relative z-10 mx-auto max-w-5xl space-y-16 px-6 sm:space-y-20">
          {/* Switcher ICP */}
          <div>
            <SectionHead
              icon="mapPin"
              eyebrow="/JORNADA POR PERFIL"
              lead="Escolha a rota certa pro seu"
              accent="objetivo"
              sub="Para levar cada público à proposta correta, escolha sua página principal antes de seguir na leitura."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ICP.map((item) => (
                <TrackedCtaLink
                  key={item.title}
                  href={item.href}
                  cta={item.cta}
                  placement="blog_hub_icp_switcher"
                  pageSegment="blog"
                  event="lp_cta_secondary_click"
                  className={`group relative block overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 ${lightCardClass}`}
                >
                  <HoverBorder />
                  <span className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-brand-primary" style={greenChip}>
                    <DSIcon name={item.icon} size={18} />
                  </span>
                  <h3 className="font-syne text-sm font-black tracking-tight text-gray-950">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                    Ver rota
                    <DSIcon name="arrowRight" size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </TrackedCtaLink>
              ))}
            </div>
          </div>

          {/* Listagem */}
          <div>
            <SectionHead icon="fileText" eyebrow="/ARTIGOS" lead="Tudo sobre IA, gestão e" accent="crescimento" sub="Conteúdo prático pra você crescer no fitness e wellness." />
            <div className="mt-8">
              <BlogListing posts={BLOG_POSTS} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
