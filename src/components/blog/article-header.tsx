// ============================================
// article-header.tsx — Header do artigo de blog (tema CLARO, ultra moderno)
// ============================================
//
// O que faz:
//   Header do post: breadcrumbs, badge de categoria (gradiente verde + ícone,
//   gramática do blog-card), título Syne, excerpt, barra de autor em card claro
//   e hero image com moldura clara. Tema light coerente com a home/índice do blog.
//
// Exports principais:
//   ArticleHeader — header completo do post de blog (light)
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import type { BlogPost } from '@/data/blog-posts'
import { CATEGORY_ICON } from '@/data/blog-posts'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { badgeStyle, greenChip, lightCard } from '@/components/shared/light-section'

interface ArticleHeaderProps {
  post: BlogPost
}

export function ArticleHeader({ post }: ArticleHeaderProps) {
  return (
    <header className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        tone="light"
        items={[
          { label: 'Blog', href: '/blog' },
          { label: post.category, href: '/blog' },
          { label: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      {/* Category badge — gradiente verde + ícone (gramática do blog-card) */}
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] uppercase text-[#08122B]"
        style={badgeStyle}
      >
        <DSIcon name={CATEGORY_ICON[post.category]} size={11} className="text-[#08122B]" />
        {post.category}
      </span>

      {/* Title */}
      <h1 className="font-syne text-[2rem] font-black leading-[1.08] tracking-tight text-gray-950 sm:text-[2.6rem]">
        {post.title}
      </h1>

      {/* Subtitle / Excerpt */}
      <p className="text-lg leading-relaxed text-slate-600">{post.excerpt}</p>

      {/* Author bar */}
      <div className="flex items-center gap-4 rounded-2xl px-5 py-4" style={lightCard}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full text-emerald-600" style={greenChip}>
          <DSIcon name="user" size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-950">{post.author.name}</p>
          <p className="text-xs text-slate-500">{post.author.role}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <time dateTime={post.dateISO}>{post.date}</time>
          <span className="flex items-center gap-1">
            <DSIcon name="clock" size={12} />
            {post.readingTime}
          </span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.35)]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
      </div>
    </header>
  )
}
