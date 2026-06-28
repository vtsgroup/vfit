// ============================================
// article-related.tsx — Artigos relacionados (light, editorial premium)
// ============================================
//
// O que faz:
//   Grid UNIFORME de posts relacionados: capa 16:9 com chip de categoria, título
//   Syne, meta (data · tempo) e seta. Borda-gradiente verde + lift no hover, zoom
//   suave na imagem. Cards de tamanho igual (sem layout assimétrico).
//   Renderiza null se lista vazia.
//
// Exports principais:
//   ArticleRelated — seção de posts relacionados (light)
import Link from 'next/link'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import type { BlogPost } from '@/data/blog-posts'
import { CATEGORY_ICON } from '@/data/blog-posts'
import { HoverEdge } from '@/components/shared/light-section'

interface ArticleRelatedProps {
  posts: BlogPost[]
}

export function ArticleRelated({ posts }: ArticleRelatedProps) {
  if (posts.length === 0) return null

  return (
    <section className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-emerald-600"
            style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.16), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.22)' }}
          >
            <DSIcon name="sparkles" size={18} />
          </span>
          <div>
            <h2 className="font-syne text-xl font-black leading-tight tracking-tight text-gray-950 sm:text-2xl">
              Continue lendo
            </h2>
            <p className="text-xs text-slate-500">Artigos relacionados selecionados para você</p>
          </div>
        </div>
        <Link
          href="/blog"
          className="hidden shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:text-emerald-700 sm:inline-flex"
        >
          Ver todos
          <DSIcon name="arrowRight" size={13} />
        </Link>
      </div>

      {/* Grid uniforme */}
      <div className="grid gap-5 sm:grid-cols-2">
        {posts.map((post) => (
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
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-900 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.3)] backdrop-blur-md">
                <DSIcon name={CATEGORY_ICON[post.category]} size={11} className="text-emerald-600" />
                {post.category}
              </span>
            </div>
            <div className="relative flex flex-1 flex-col gap-3 p-5">
              <h3 className="line-clamp-2 font-syne text-base font-black leading-snug tracking-tight text-gray-950 transition-colors group-hover:text-emerald-700">
                {post.title}
              </h3>
              <div className="mt-auto flex items-center justify-between gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span>{post.date}</span>
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1">
                    <DSIcon name="clock" size={12} />
                    {post.readingTime}
                  </span>
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white">
                  <DSIcon name="arrowRight" size={13} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
