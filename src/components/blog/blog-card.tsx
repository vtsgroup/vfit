// ============================================
// blog-card.tsx — Card de post de blog para listagem
// ============================================
//
// O que faz:
//   Card linkável para post de blog com imagem, badge de categoria, título,
//   excerpt e metadados (data, tempo de leitura).
//   Variante featured ocupa 2-3 colunas e usa aspect-ratio 21/9.
//
// Exports principais:
//   BlogCard — card de post com suporte a variante featured
import Image from 'next/image'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import type { BlogPost } from '@/data/blog-posts'
import { CATEGORY_COLORS } from '@/data/blog-posts'

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group rounded-2xl border border-white/8 bg-white/3 overflow-hidden transition-all duration-300 hover:border-brand-primary/25 hover:shadow-[0_0_30px_rgba(34,197,94,0.06)] ${
        featured ? 'sm:col-span-2 lg:col-span-3' : ''
      }`}
    >
      {/* Hero Image */}
      <div className={`relative w-full overflow-hidden ${featured ? 'aspect-[21/9]' : 'aspect-[16/9]'}`}>
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={featured
            ? '(max-width: 768px) 100vw, 900px'
            : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          }
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm ${
            CATEGORY_COLORS[post.category] || ''
          }`}
        >
          <DSIcon name="tag" size={12} />
          {post.category}
        </span>
      </div>

      <div className="p-6">
        {/* Author + Date */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary/10 ring-1 ring-brand-primary/20">
            <DSIcon name="user" size={14} className="text-brand-primary" />
          </div>
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-300">{post.author.name}</span>
            <span className="mx-1.5">·</span>
            <span>{post.date}</span>
          </div>
        </div>

        <h2
          className={`font-semibold text-white mb-2 group-hover:text-brand-primary transition-colors ${
            featured ? 'text-xl sm:text-2xl' : 'text-lg'
          }`}
        >
          {post.title}
        </h2>
        <p className={`text-zinc-400 leading-relaxed mb-4 ${featured ? 'text-sm sm:text-base' : 'text-sm'}`}>
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <DSIcon name="clock" size={12} />
            {post.readingTime}
          </span>
          <span className="flex items-center gap-1 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Ler artigo <DSIcon name="arrowRight" size={12} />
          </span>
        </div>
      </div>
    </Link>
  )
}
