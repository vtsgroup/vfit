// ============================================
// category-filter.tsx — Filtro de categorias do blog
// ============================================
//
// O que faz:
//   Pills clicáveis para filtrar posts por categoria.
//   Pill "Todos" sempre presente (selected === null).
//   Highlight com border-brand-primary quando ativo.
//
// Exports principais:
//   CategoryFilter — pills de filtro por categoria de blog
//   BlogFilterWrapper — wrapper cliente para gerenciar estado de filtro
'use client'

import { useState } from 'react'
import type { BlogCategory } from '@/data/blog-posts'

interface CategoryFilterProps {
  categories: BlogCategory[]
  selected: BlogCategory | null
  onChange: (cat: BlogCategory | null) => void
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
          selected === null
            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : 'border-white/8 text-zinc-400 hover:border-white/15 hover:text-zinc-200'
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
            selected === cat
              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : 'border-white/8 text-zinc-400 hover:border-white/15 hover:text-zinc-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

/** Wrapper with state for the blog listing */
export function BlogFilterWrapper({
  categories,
  children,
}: {
  categories: BlogCategory[]
  children: (selected: BlogCategory | null) => React.ReactNode
}) {
  const [selected, setSelected] = useState<BlogCategory | null>(null)

  return (
    <div className="space-y-8">
      <CategoryFilter categories={categories} selected={selected} onChange={setSelected} />
      {children(selected)}
    </div>
  )
}
