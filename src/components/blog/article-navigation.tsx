// ============================================
// article-navigation.tsx — Navegação prev/next entre artigos
// ============================================
//
// O que faz:
//   Exibe links de navegação para artigo anterior e próximo.
//   Grid de 2 colunas em desktop, empilhado em mobile.
//   Renderiza null se não há prev nem next.
//
// Exports principais:
//   ArticleNavigation — nav de paginação entre posts
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import type { BlogPost } from '@/data/blog-posts'

interface ArticleNavigationProps {
  prev: BlogPost | null
  next: BlogPost | null
}

export function ArticleNavigation({ prev, next }: ArticleNavigationProps) {
  if (!prev && !next) return null

  return (
    <nav className="grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group rounded-2xl border border-white/8 bg-white/3 p-5 backdrop-blur-sm transition-all duration-300 hover:border-brand-primary/20 hover:bg-brand-primary/3 hover:shadow-[0_0_24px_rgba(16,185,129,0.06)]"
        >
          <span className="flex items-center gap-1 text-xs text-zinc-500 mb-2">
            <DSIcon name="arrowLeft" size={12} />
            Artigo anterior
          </span>
          <p className="text-sm font-medium text-white group-hover:text-brand-primary transition-colors line-clamp-2">
            {prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          className="group rounded-2xl border border-white/8 bg-white/3 p-5 text-right backdrop-blur-sm transition-all duration-300 hover:border-brand-primary/20 hover:bg-brand-primary/3 hover:shadow-[0_0_24px_rgba(16,185,129,0.06)]"
        >
          <span className="flex items-center justify-end gap-1 text-xs text-zinc-500 mb-2">
            Próximo artigo
            <DSIcon name="arrowRight" size={12} />
          </span>
          <p className="text-sm font-medium text-white group-hover:text-brand-primary transition-colors line-clamp-2">
            {next.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
