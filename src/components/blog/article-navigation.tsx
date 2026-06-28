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

  const cardClass =
    'group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_16px_34px_-20px_rgba(34,197,94,0.45)]'

  return (
    <nav className="grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link href={`/blog/${prev.slug}`} className={cardClass}>
          <span className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-500">
            <DSIcon name="arrowLeft" size={12} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            Artigo anterior
          </span>
          <p className="line-clamp-2 text-sm font-bold text-gray-950 transition-colors group-hover:text-emerald-700">
            {prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link href={`/blog/${next.slug}`} className={`${cardClass} text-right`}>
          <span className="mb-2 flex items-center justify-end gap-1 text-xs font-semibold text-slate-500">
            Próximo artigo
            <DSIcon name="arrowRight" size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
          <p className="line-clamp-2 text-sm font-bold text-gray-950 transition-colors group-hover:text-emerald-700">
            {next.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
