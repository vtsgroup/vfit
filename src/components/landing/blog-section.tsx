// ============================================
// blog-section.tsx — Seção de posts do blog na landing page
// ============================================
//
// O que faz:
//   Exibe preview dos últimos posts do blog em grid na landing.
//   Cards com imagem, categoria, título e link para /blog/{slug}.
//   Usa IntersectionReveal para animação de entrada.
//
// Exports principais:
//   BlogSection — seção de blog da landing
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { Button } from '@/components/ui/button'

const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

/* ─── Blog data ─── */
interface BlogPost {
  slug: string
  image: string
  tag: string
  tagColor: string
  tagIcon: DSIconName
  date: string
  title: string
  excerpt: string
}

const blogPosts: BlogPost[] = [
  {
    slug: '/blog/app-treino-ia-gratis-iniciantes',
    image: '/blog/hero-treino-iniciante.webp',
    tag: 'INICIANTES',
    tagColor: 'bg-brand-primary text-bg-dark',
    tagIcon: 'dumbbell',
    date: 'FEV 20, 2026',
    title: 'App de treino com IA grátis: como começar sem se perder na academia',
    excerpt:
      'Veja como sair da planilha genérica, montar uma rotina simples e acompanhar evolução direto pelo celular.',
  },
  {
    slug: '/blog/ia-personal-trainer',
    image: '/blog/hero-ia-personal-trainer.webp',
    tag: 'IA',
    tagColor: 'bg-bg-page text-white',
    tagIcon: 'brainCircuit',
    date: 'FEV 15, 2026',
    title: 'Personal trainer com IA: o que muda no seu treino de verdade',
    excerpt:
      'Entenda como a IA ajuda no plano, onde o profissional entra e por que acompanhamento ainda faz diferença.',
  },
  {
    slug: '/blog/nutricionista-personal-trainer-trabalho-conjunto',
    image: '/blog/hero-nutricao-personal.webp',
    tag: 'NUTRIÇÃO',
    tagColor: 'bg-brand-primary text-bg-dark',
    tagIcon: 'heartHandshake',
    date: 'FEV 10, 2026',
    title: 'Treino e dieta juntos: como alinhar personal e nutricionista',
    excerpt:
      'Quando treino, alimentação e dados conversam, fica mais fácil manter constância e ver resultado.',
  },
]

/* ─── Blog Card Component ─── */
function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={post.slug}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/5"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100 sm:h-52">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {/* Reading time badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-bold text-white/80 backdrop-blur-sm">
          <DSIcon name="clock" size={10} />
          5 MIN
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {/* Tag + Date row */}
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${post.tagColor}`}
            style={monoLabel}
          >
                        <DSIcon name={post.tagIcon} size={12} />
            {post.tag}
          </span>
          <span
            className="text-[11px] text-gray-400 uppercase"
            style={monoLabel}
          >
            {post.date}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-syne mb-3 text-lg leading-snug font-bold text-gray-950 transition-colors duration-200 group-hover:text-brand-primary"
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-500">
          {post.excerpt}
        </p>

        {/* Read more — with arrow icon */}
        <div className="mt-auto">
          <span
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-950 uppercase transition-colors duration-200 group-hover:text-brand-primary"
            style={monoLabel}
          >
            LER ARTIGO
            <DSIcon name="arrowRight" size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function BlogSection() {
  return (
    <section className="relative bg-bg-landing-light py-16 sm:py-32" aria-label="Blog">
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-200" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Label */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-5 text-center">
            <span
              className="inline-block text-xs text-gray-400 uppercase"
              style={monoLabel}
            >
              /BLOG
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading */}
        <IntersectionReveal animation="blur-in" delay={50}>
          <h2
            className="font-syne mb-10 text-center uppercase text-gray-950 sm:mb-16"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: '0.95',
            }}
          >
            CONTEÚDO PARA{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">
              EVOLUIR
            </span>
          </h2>
        </IntersectionReveal>

        {/* Cards grid */}
        <div className="grid gap-5 md:grid-cols-3 md:gap-8">
          {blogPosts.map((post, i) => (
            <IntersectionReveal key={post.slug} animation="fade-in" delay={i * 100}>
              <BlogCard post={post} />
            </IntersectionReveal>
          ))}
        </div>

        {/* Visit blog button */}
        <IntersectionReveal animation="fade-in" delay={400}>
          <div className="mt-14 text-center">
            <Link href="/blog">
              <Button variant="outline" size="lg" className="text-xs uppercase tracking-wider">
                VISITE NOSSO BLOG
                <DSIcon name="arrowRight" size={14} />
              </Button>
            </Link>
          </div>
        </IntersectionReveal>
      </div>
    </section>
  )
}
