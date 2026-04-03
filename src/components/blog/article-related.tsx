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
    <section className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8 space-y-4 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <DSIcon name="sparkles" size={20} className="text-brand-primary" />
        Artigos relacionados
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 rounded-xl bg-white/3 p-3 transition-all duration-300 hover:bg-white/6 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)]"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white group-hover:text-brand-primary transition-colors line-clamp-2">
                {post.title}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
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
