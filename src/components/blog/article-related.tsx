// ============================================
// article-related.tsx — Artigos relacionados (light, editorial premium)
// ============================================
//
// O que faz:
//   Grid editorial de posts relacionados: capa 16:9 com chip de categoria,
//   título Syne, meta (data · tempo) e seta. Borda-gradiente verde + lift no
//   hover, zoom suave na imagem. Quando a contagem é ímpar, o último card vira
//   "wide" (imagem à esquerda, texto à direita) p/ não deixar buraco no grid.
//   Renderiza null se lista vazia.
//
// Exports principais:
//   ArticleRelated — seção de posts relacionados (light)
import Link from 'next/link'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import type { BlogPost } from '@/data/blog-posts'
import { CATEGORY_ICON } from '@/data/blog-posts'
import { HoverEdge, monoLabel } from '@/components/shared/light-section'

interface ArticleRelatedProps {
  posts: BlogPost[]
}

function CategoryChip({ post }: { post: BlogPost }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-900 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.3)] backdrop-blur-md">
      <DSIcon name={CATEGORY_ICON[post.category]} size={11} className="text-emerald-600" />
      {post.category}
    </span>
  )
}

function Meta({ post }: { post: BlogPost }) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-500">
      <span>{post.date}</span>
      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-300" />
      <span className="flex items-center gap-1">
        <DSIcon name="clock" size={12} />
        {post.readingTime}
      </span>
    </div>
  )
}

export function ArticleRelated({ posts }: ArticleRelatedProps) {
  if (posts.length === 0) return null
  const orphanWide = posts.length % 2 === 1

  return (
    <section className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
            style={{
              ...monoLabel,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)',
              border: '1px solid rgba(34,197,94,0.3)',
              boxShadow: '0 6px 16px -8px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              /CONTINUE LENDO
            </span>
          </span>
          <h2 className="font-syne text-2xl font-black leading-tight tracking-tight text-gray-950">
            Artigos relacionados
          </h2>
        </div>
        <Link
          href="/blog"
          className="hidden shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:text-emerald-700 sm:inline-flex"
        >
          Ver todos
          <DSIcon name="arrowRight" size={13} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {posts.map((post, i) => {
          const wide = orphanWide && i === posts.length - 1

          if (wide) {
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group relative flex overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_28px_60px_-30px_rgba(34,197,94,0.5)] sm:col-span-2"
              >
                <HoverEdge />
                <div className="relative aspect-4/3 w-2/5 shrink-0 overflow-hidden sm:aspect-auto">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 40vw, 300px"
                  />
                </div>
                <div className="relative flex min-w-0 flex-1 flex-col justify-center gap-2.5 p-5 sm:p-6">
                  <CategoryChip post={post} />
                  <h3 className="line-clamp-2 font-syne text-lg font-black leading-snug tracking-tight text-gray-950 transition-colors group-hover:text-emerald-700">
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
                  <Meta post={post} />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_28px_60px_-30px_rgba(34,197,94,0.5)]"
            >
              <HoverEdge />
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 360px"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/15 to-transparent" />
                <div className="absolute left-3 top-3">
                  <CategoryChip post={post} />
                </div>
              </div>
              <div className="relative flex flex-1 flex-col gap-2.5 p-5">
                <h3 className="line-clamp-2 font-syne text-base font-black leading-snug tracking-tight text-gray-950 transition-colors group-hover:text-emerald-700">
                  {post.title}
                </h3>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <Meta post={post} />
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white">
                    <DSIcon name="arrowRight" size={13} />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
