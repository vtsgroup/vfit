// ============================================
// page.tsx — Listagem do Blog
// ============================================
//
// O que faz:
//   Página de listagem de todos os posts do blog.
//   RSC: metadata estático, lista todos os posts de BLOG_POSTS.
//   Renderiza PageHero, BlogListing (com filtro por categoria) e CTA de cadastro.
//   Inclui BlogCollectionSchema JSON-LD para SEO.
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   BlogPage — page component (RSC)
import type { Metadata } from 'next'
import { BlogCollectionSchema } from '@/components/seo/json-ld'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { BLOG_POSTS } from '@/data/blog-posts'
import { BlogListing } from '@/components/blog/blog-listing'
import { Button } from '@/components/ui/button'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Blog VFIT: IA, gestão e crescimento para fitness e wellness',
  description:
    'Artigos práticos sobre IA, gestão de alunos, retenção, cobrança automática e crescimento para personal trainers, nutricionistas e operações fitness.',
  path: '/blog',
  ogImage: '/og/og-blog.png',
})

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

      <div className="mx-auto max-w-5xl px-6 space-y-12 pb-24">
        <section className="rounded-2xl border border-white/8 bg-white/3 p-6 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
          <p className="text-xs font-bold tracking-[0.18em] text-brand-primary uppercase">Jornada por perfil</p>
          <h2 className="mt-2 text-xl font-bold text-white">Escolha a rota certa para seu objetivo</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Para melhorar SEO por intenção e levar cada público para a proposta correta, escolha sua página principal antes de seguir na leitura.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TrackedCtaLink href="/" cta="Sou aluno" placement="blog_hub_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="rounded-xl border border-white/10 bg-white/4 p-4 transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base">
              <h3 className="text-sm font-bold text-white">Sou aluno</h3>
              <p className="mt-1 text-xs text-zinc-400">Treino com IA, evolução e constância no app.</p>
            </TrackedCtaLink>

            <TrackedCtaLink href="/app-personal-trainer" cta="Sou personal trainer" placement="blog_hub_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="rounded-xl border border-white/10 bg-white/4 p-4 transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base">
              <h3 className="text-sm font-bold text-white">Sou personal trainer</h3>
              <p className="mt-1 text-xs text-zinc-400">IA, gestão, colaboração com nutrição e escala.</p>
            </TrackedCtaLink>

            <TrackedCtaLink href="/nutricionistas" cta="Sou nutricionista" placement="blog_hub_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="rounded-xl border border-white/10 bg-white/4 p-4 transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base">
              <h3 className="text-sm font-bold text-white">Sou nutricionista</h3>
              <p className="mt-1 text-xs text-zinc-400">Área de nutrição e trabalho conjunto com personal.</p>
            </TrackedCtaLink>

            <TrackedCtaLink href="/afiliados" cta="Quero ser afiliado" placement="blog_hub_icp_switcher" pageSegment="blog" event="lp_cta_secondary_click" className="rounded-xl border border-white/10 bg-white/4 p-4 transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base">
              <h3 className="text-sm font-bold text-white">Quero ser afiliado</h3>
              <p className="mt-1 text-xs text-zinc-400">Indique e ganhe comissão recorrente.</p>
            </TrackedCtaLink>
          </div>
        </section>

        <BlogListing posts={BLOG_POSTS} />

        {/* Newsletter CTA */}
        <section className="text-center rounded-2xl border border-white/8 bg-white/3 p-8 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
          <h2 className="text-xl font-bold text-white mb-2">Receba novidades por e-mail</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Cadastre-se para receber artigos e dicas exclusivas no seu e-mail.
          </p>
          <form className="flex max-w-md mx-auto gap-3">
            <input
              type="email"
              aria-label="Seu e-mail"
              placeholder="seu@email.com"
              className="flex-1 rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all"
            />
            <Button type="submit" size="md">
              Assinar
            </Button>
          </form>
        </section>
      </div>
    </>
  )
}
