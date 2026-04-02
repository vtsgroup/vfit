// ============================================
// article-header.tsx — Header do artigo de blog com breadcrumbs e metadados
// ============================================
//
// O que faz:
//   Renderiza o header de um post de blog: breadcrumbs, categoria colorida,
//   título, excerpt, metadados (autor, data, leitura) e hero image.
//   Usa CATEGORY_COLORS de @/data/blog-posts para badge de categoria.
//
// Exports principais:
//   ArticleHeader — header completo do post de blog
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import type { BlogPost } from '@/data/blog-posts'
import { CATEGORY_COLORS } from '@/data/blog-posts'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'

interface ArticleHeaderProps {
  post: BlogPost
}

export function ArticleHeader({ post }: ArticleHeaderProps) {
  return (
    <header className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Blog', href: '/blog' },
          { label: post.category, href: '/blog' },
          { label: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      {/* Category badge */}
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
          CATEGORY_COLORS[post.category] || ''
        }`}
      >
        {post.category}
      </span>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white sm:text-4xl leading-tight">
        {post.title}
      </h1>

      {/* Subtitle / Excerpt */}
      <p className="text-lg text-zinc-400 leading-relaxed">
        {post.excerpt}
      </p>

      {/* Author bar */}
      <div className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/3 px-5 py-4 backdrop-blur-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 ring-1 ring-brand-primary/20">
          <DSIcon name="user" size={20} className="text-brand-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{post.author.name}</p>
          <p className="text-xs text-zinc-500">{post.author.role}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <time dateTime={post.dateISO}>{post.date}</time>
          <span className="flex items-center gap-1">
            <DSIcon name="clock" size={12} />
            {post.readingTime}
          </span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
      </div>
    </header>
  )
}
