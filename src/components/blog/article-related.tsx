// ============================================
// article-related.tsx — Seção de artigos relacionados
// ============================================
//
// O que faz:
//   Exibe grid de posts relacionados ao artigo atual.
//   Cada card tem imagem, categoria, título e data.
//   Renderiza null se lista vazia.
//
// Exports principais:
//   ArticleRelated — seção com cards de posts relacionados
import Link from 'next/link'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import type { BlogPost } from '@/data/blog-posts'

interface ArticleRelatedProps {
  posts: BlogPost[]
  accentColor?: string
}

export function ArticleRelated({ posts }: ArticleRelatedProps) {
  if (posts.length === 0) return null

  return (
    <section
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -24px rgba(15,23,42,0.14)' }}
    >
      <h2 className="flex items-center gap-2 font-syne text-lg font-black tracking-tight text-gray-950">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl text-emerald-600"
          style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.16), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.22)' }}
        >
          <DSIcon name="sparkles" size={16} />
        </span>
        Artigos relacionados
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 rounded-xl border border-slate-200/80 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-slate-50 hover:shadow-[0_14px_30px_-18px_rgba(34,197,94,0.4)]"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-200">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="96px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold text-gray-950 transition-colors group-hover:text-emerald-700">
                {post.title}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>{post.date}</span>
                <span className="flex items-center gap-1">
                  <DSIcon name="clock" size={12} />
                  {post.readingTime}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
