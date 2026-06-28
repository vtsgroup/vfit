// ============================================
// blog-card.tsx — Card de post de blog (espelha o card premium da home)
// ============================================
//
// O que faz:
//   Card linkável idêntico em linguagem ao card de blog da landing
//   (blog-section.tsx): superfície branco→#f8fafc, 3 camadas de hover
//   (spotlight que segue o cursor + borda-gradiente verde + glow + hairline),
//   imagem com zoom + duotone verde, pill de leitura em glass, badge de
//   categoria verde-gradiente com ícone, título font-syne e rodapé com a logo
//   VFIT + autor.
//
// Exports principais:
//   BlogCard — card de post (uniforme, mesma linguagem da home)
import type { CSSProperties, MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import type { BlogPost } from '@/data/blog-posts'
import { CATEGORY_ICON } from '@/data/blog-posts'

const monoLabel: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

/* Spotlight verde que segue o cursor (assinatura da home) */
function handleMove(e: MouseEvent<HTMLAnchorElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      onMouseMove={handleMove}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 ease-out-expo hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(15,23,42,0.07)',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 16px 40px -18px rgba(15,23,42,0.16)',
      }}
    >
      {/* Borda-gradiente verde no hover (xor) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.55) 0%, rgba(132,204,22,0.22) 45%, transparent 75%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      {/* Glow verde no hover */}
      <span className="pointer-events-none absolute -inset-px z-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[0_24px_50px_-18px_rgba(34,197,94,0.5)]" />
      {/* Hairline superior no hover */}
      <span className="pointer-events-none absolute inset-x-5 top-0 z-30 h-px bg-linear-to-r from-transparent via-brand-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Imagem
          Grid lg:3-col dentro de max-w-5xl → card ~307px (não 33vw≈445px). O px fixo no
          fim do `sizes` evita baixar o variante 640w num slot de 307px; o CF serve o 384w
          (loader /cdn-cgi/image). Mantém vw menor antes p/ Next emitir o candidato 384w. */}
      <div className="relative h-44 overflow-hidden sm:h-48">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.07]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 310px"
        />
        {/* Duotone verde sutil no hover */}
        <div className="pointer-events-none absolute inset-0 bg-brand-primary/0 mix-blend-soft-light transition-colors duration-500 group-hover:bg-brand-primary/25" />
        {/* Gradiente inferior p/ profundidade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/40 to-transparent" />
        {/* Tempo de leitura — glass pill legível */}
        <div
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-white"
          style={{ background: 'rgba(8,18,30,0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.45)' }}
        >
          <DSIcon name="clock" size={12} className="text-brand-primary" />
          {post.readingTime}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-6">
        {/* Spotlight verde que segue o cursor */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(320px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.07), transparent 60%)' }}
        />

        {/* Categoria + data */}
        <div className="relative mb-4 flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase text-[#08122B]"
            style={{
              ...monoLabel,
              background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)',
              border: '1px solid rgba(20,120,60,0.28)',
              boxShadow: '0 2px 8px -1px rgba(34,197,94,0.42), inset 0 1px 0 rgba(255,255,255,0.45)',
            }}
          >
            <DSIcon name={CATEGORY_ICON[post.category]} size={11} className="text-[#08122B]" />
            {post.category}
          </span>
          <span className="text-[11px] uppercase text-slate-400" style={monoLabel}>{post.date}</span>
        </div>

        {/* Título */}
        <h3 className="font-syne relative mb-3 text-lg font-bold leading-snug tracking-tight text-gray-950 transition-colors duration-200 group-hover:text-emerald-700">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="relative mb-5 flex-1 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>

        {/* Rodapé — autor (logo VFIT) + ler artigo */}
        <div className="relative mt-auto flex items-center justify-between border-t border-slate-200/70 pt-4">
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-slate-900/5">
              <Image src="/favicons/favicon.svg" alt="VFIT" width={15} height={15} />
            </span>
            <span className="text-xs font-semibold text-slate-500">{post.author.name}</span>
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase text-gray-900 transition-colors duration-200 group-hover:text-emerald-700" style={monoLabel}>
            Ler artigo
            <DSIcon name="arrowRight" size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}
