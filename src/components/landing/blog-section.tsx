// ============================================
// blog-section.tsx — Seção de posts do blog na landing page
// ============================================
//
// O que faz:
//   Exibe preview dos últimos posts do blog em grid na landing.
//   Cards premium (light) com imagem, categoria, título e link para /blog/{slug}.
//   Reusa a linguagem de hover da landing (spotlight + borda gradiente + glow).
//
// Exports principais:
//   BlogSection — seção de blog da landing
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { type MouseEvent } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'

const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

/* Spotlight verde que segue o cursor */
function handleCardMove(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/* ─── Blog data ─── */
interface BlogPost {
  slug: string
  image: string
  tag: string
  tagIcon: DSIconName
  date: string
  readMin: number
  title: string
  excerpt: string
}

const blogPosts: BlogPost[] = [
  {
    slug: '/blog/app-treino-ia-gratis-iniciantes',
    image: '/blog/hero-treino-iniciante.webp',
    tag: 'INICIANTES',
    tagIcon: 'dumbbell',
    date: 'FEV 20, 2026',
    readMin: 5,
    title: 'App de treino com IA grátis: como começar sem se perder na academia',
    excerpt:
      'Veja como sair da planilha genérica, montar uma rotina simples e acompanhar evolução direto pelo celular.',
  },
  {
    slug: '/blog/ia-personal-trainer',
    image: '/blog/hero-ia-personal-trainer.webp',
    tag: 'IA',
    tagIcon: 'brainCircuit',
    date: 'FEV 15, 2026',
    readMin: 6,
    title: 'Personal trainer com IA: o que muda no seu treino de verdade',
    excerpt:
      'Entenda como a IA ajuda no plano, onde o profissional entra e por que acompanhamento ainda faz diferença.',
  },
  {
    slug: '/blog/nutricionista-personal-trainer-trabalho-conjunto',
    image: '/blog/hero-nutricao-personal.webp',
    tag: 'NUTRIÇÃO',
    tagIcon: 'heartHandshake',
    date: 'FEV 10, 2026',
    readMin: 4,
    title: 'Treino e dieta juntos: como alinhar personal e nutricionista',
    excerpt:
      'Quando treino, alimentação e dados conversam, fica mais fácil manter constância e ver resultado.',
  },
]

/* ─── Blog Card — light premium ─── */
function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={post.slug}
      onMouseMove={handleCardMove}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 ease-out-expo hover:-translate-y-1.5"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(15,23,42,0.07)',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 16px 40px -18px rgba(15,23,42,0.16)',
      }}
    >
      {/* Borda gradiente no hover */}
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

      {/* Image */}
      <div className="relative h-44 overflow-hidden sm:h-48">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.07]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Duotone verde sutil no hover */}
        <div className="pointer-events-none absolute inset-0 bg-brand-primary/0 mix-blend-soft-light transition-colors duration-500 group-hover:bg-brand-primary/25" />
        {/* Gradiente inferior p/ profundidade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/40 to-transparent" />
        {/* Tempo de leitura — glass pill */}
        <div
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
          style={{ background: 'rgba(8,18,30,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.14)' }}
        >
          <DSIcon name="clock" size={10} />
          {post.readMin} MIN
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-6">
        {/* Spotlight verde no conteúdo */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(320px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.07), transparent 60%)' }}
        />

        {/* Tag + Date */}
        <div className="relative mb-4 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase text-[#08122B]"
            style={{
              ...monoLabel,
              background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)',
              boxShadow: '0 2px 8px -1px rgba(34,197,94,0.42), inset 0 1px 0 rgba(255,255,255,0.45)',
            }}
          >
            <DSIcon name={post.tagIcon} size={11} className="text-[#08122B]" />
            {post.tag}
          </span>
          <span className="text-[11px] uppercase text-slate-400" style={monoLabel}>
            {post.date}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-syne relative mb-3 text-lg font-bold leading-snug tracking-tight text-gray-950 transition-colors duration-200 group-hover:text-emerald-700">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="relative mb-6 flex-1 text-sm leading-relaxed text-slate-500">
          {post.excerpt}
        </p>

        {/* Read more */}
        <div className="relative mt-auto">
          <span
            className="inline-flex items-center gap-2 text-xs font-bold uppercase text-gray-900 transition-colors duration-200 group-hover:text-emerald-700"
            style={monoLabel}
          >
            Ler artigo
            <DSIcon name="arrowRight" size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function BlogSection() {
  return (
    <section className="relative overflow-hidden bg-bg-landing-light py-16 sm:py-32" aria-label="Blog">
      {/* Dot pattern sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.3,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Orb verde sutil */}
      <div aria-hidden="true" className="pointer-events-none absolute right-1/4 top-0 h-80 w-80 translate-x-1/2 rounded-full bg-brand-primary/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Eyebrow — pílula gradiente glass */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-6 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]"
              style={{
                ...monoLabel,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)',
                border: '1px solid rgba(34,197,94,0.32)',
                boxShadow: '0 8px 20px -8px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
              </span>
              <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">Blog</span>
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading */}
        <IntersectionReveal animation="blur-in" delay={50}>
          <h2
            className="font-syne mb-10 text-center font-black tracking-[-0.02em] text-gray-950 sm:mb-16"
            style={{ fontSize: 'clamp(2.25rem, 5.2vw, 3.75rem)', lineHeight: '0.96' }}
          >
            CONTEÚDO PARA{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">
              EVOLUIR
            </span>
          </h2>
        </IntersectionReveal>

        {/* Cards grid */}
        <div className="grid gap-5 md:grid-cols-3 md:gap-7">
          {blogPosts.map((post, i) => (
            <IntersectionReveal key={post.slug} animation="scale-in" delay={i * 100}>
              <BlogCard post={post} />
            </IntersectionReveal>
          ))}
        </div>

        {/* Visit blog button — verde gradiente + chip seta */}
        <IntersectionReveal animation="fade-in" delay={400}>
          <div className="mt-14 flex justify-center">
            <Link
              href="/blog"
              className="group/cta relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-full pl-6 pr-2 text-[13px] font-black uppercase tracking-wider text-[#08122B] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)',
                boxShadow: '0 12px 28px -8px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(6,78,59,0.4)',
              }}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-linear-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover/cta:translate-x-[120%]" />
              <span className="relative z-10">Visite nosso blog</span>
              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#08122B] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <DSIcon name="arrowRight" size={14} className="text-[#4ADE80] transition-transform duration-300 group-hover/cta:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </IntersectionReveal>
      </div>
    </section>
  )
}
