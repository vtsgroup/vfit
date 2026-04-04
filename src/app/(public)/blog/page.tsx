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

export const metadata: Metadata = buildSeoMetadata({
  title: 'Blog VFIT: gestão, IA e crescimento para personal trainer',
  description:
    'Artigos práticos sobre gestão de alunos, inteligência artificial aplicada a treinos, retenção de clientes e cobrança automatizada para personal trainers.',
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
        title="Insights para Personal Trainers"
        subtitle="Dicas, tutoriais e novidades para ajudar você a crescer como personal trainer."
        badge="Blog"
        breadcrumbs={[{ label: 'Blog', href: '/blog' }]}
      />

      <div className="mx-auto max-w-5xl px-6 space-y-12 pb-24">
        <BlogListing posts={BLOG_POSTS} />

        {/* Newsletter CTA */}
        <section className="text-center rounded-2xl border border-white/8 bg-white/3 p-8 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
          <h2 className="text-xl font-bold text-white mb-2">Receba novidades por e-mail</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Cadastre-se para receber artigos e dicas exclusivas no seu e-mail.
          </p>
          <div className="flex max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all"
            />
            <Button size="md">
              Assinar
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}
