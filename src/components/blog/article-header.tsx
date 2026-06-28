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
import { badgeStyle, lightCard } from '@/components/shared/light-section'

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

      {/* Author + meta bar */}
      <div
        className="flex flex-col gap-4 rounded-2xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        style={lightCard}
      >
        <div className="flex items-center gap-3.5">
          <span className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/favicons/favicon.svg"
              alt="VFIT"
              width={44}
              height={44}
              className="rounded-[12px] shadow-[0_8px_20px_-8px_rgba(58,181,74,0.55)] ring-1 ring-black/5"
            />
            {/* selo "verificado" sobre o canto do mark */}
            <span
              className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-emerald-600 shadow-[0_2px_6px_-1px_rgba(15,23,42,0.25)]"
              aria-hidden="true"
            >
              <DSIcon name="shieldCheck" size={11} />
            </span>
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-bold text-gray-950">
              {post.author.name}
              <span className="rounded-full bg-emerald-50 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-500/20">
                Oficial
              </span>
            </p>
            <p className="text-xs text-slate-500">{post.author.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1">
            <DSIcon name="calendar" size={12} className="text-emerald-600" />
            <time dateTime={post.dateISO}>{post.date}</time>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1">
            <DSIcon name="clock" size={12} className="text-emerald-600" />
            {post.readingTime} de leitura
          </span>
        </div>
      </div>

      {/* Hero Image + crédito */}
      <figure className="space-y-2">
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
          {/* crédito sobreposto, canto inferior direito */}
          <figcaption className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">
            <DSIcon name="camera" size={12} className="opacity-80" />
            {post.imageCredit ?? 'Divulgação'}
          </figcaption>
        </div>
      </figure>
    </header>
  )
}
