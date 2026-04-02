// ============================================
// blog-listing.tsx — Listagem de posts com filtro por categoria
// ============================================
//
// O que faz:
//   Grid de BlogCards com CategoryFilter no topo para filtrar por categoria.
//   Primeiro post destacado como featured (2-3 colunas).
//   Estado de filtro local (useState) — sem servidor.
//
// Exports principais:
//   BlogListing — listagem completa com filtro
'use client'

import { useState } from 'react'
import type { BlogPost, BlogCategory } from '@/data/blog-posts'
import { getCategories } from '@/data/blog-posts'
import { DSIcon } from '@/components/ui/ds-icon'
import { CategoryFilter } from './category-filter'
import { BlogCard } from './blog-card'

interface BlogListingProps {
  posts: BlogPost[]
}

export function BlogListing({ posts }: BlogListingProps) {
  const [selected, setSelected] = useState<BlogCategory | null>(null)
  const categories = getCategories()

  const filtered = selected ? posts.filter((p) => p.category === selected) : posts

  return (
    <div className="space-y-8">
      <CategoryFilter categories={categories} selected={selected} onChange={setSelected} />

      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/4 border border-white/8">
            <DSIcon name="search" size={24} className="text-zinc-500" />
          </div>
          <p className="text-zinc-400 font-medium">Nenhum artigo encontrado</p>
          <p className="text-sm text-zinc-500">Tente outra categoria ou volte para ver todos.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <BlogCard key={post.slug} post={post} featured={i === 0 && !selected} />
          ))}
        </div>
      )}
    </div>
  )
}
