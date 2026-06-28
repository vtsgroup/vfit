// ============================================
// article-navigation.tsx — Navegação prev/next (light, com thumbnail)
// ============================================
//
// O que faz:
//   Cards de "Artigo anterior" e "Próximo artigo" com thumbnail, rótulo e título.
//   Card do anterior alinhado à esquerda (seta + thumb à esquerda); o próximo
//   espelhado à direita. Borda-gradiente verde + lift no hover. Quando só existe
//   um lado, ele ocupa a largura inteira. Renderiza null se não há prev nem next.
//
// Exports principais:
//   ArticleNavigation — nav de paginação entre posts
import Link from 'next/link'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import type { BlogPost } from '@/data/blog-posts'
import { HoverEdge } from '@/components/shared/light-section'

interface ArticleNavigationProps {
  prev: BlogPost | null
  next: BlogPost | null
}

const card =
  'group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_18px_40px_-22px_rgba(34,197,94,0.5)]'

function Thumb({ post }: { post: BlogPost }) {
  return (
    <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200">
      <Image
        src={post.image}
        alt=""
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="64px"
      />
    </div>
  )
}

export function ArticleNavigation({ prev, next }: ArticleNavigationProps) {
  if (!prev && !next) return null
  const single = !prev || !next

  return (
    <nav className={`grid gap-4 ${single ? '' : 'sm:grid-cols-2'}`} aria-label="Mais artigos">
      {prev && (
        <Link href={`/blog/${prev.slug}`} className={card}>
          <HoverEdge />
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white">
            <DSIcon name="arrowLeft" size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
          </span>
          <div className="relative min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Anterior</span>
            <p className="mt-0.5 line-clamp-2 text-sm font-bold text-gray-950 transition-colors group-hover:text-emerald-700">
              {prev.title}
            </p>
          </div>
          <div className="relative hidden sm:block">
            <Thumb post={prev} />
          </div>
        </Link>
      )}

      {next && (
        <Link href={`/blog/${next.slug}`} className={`${card} text-right`}>
          <HoverEdge />
          <div className="relative hidden sm:block">
            <Thumb post={next} />
          </div>
          <div className="relative min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Próximo</span>
            <p className="mt-0.5 line-clamp-2 text-sm font-bold text-gray-950 transition-colors group-hover:text-emerald-700">
              {next.title}
            </p>
          </div>
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white">
            <DSIcon name="arrowRight" size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}
    </nav>
  )
}
