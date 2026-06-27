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

const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.12em',
}
const activeStyle = {
  background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)',
  border: '1px solid rgba(20,120,60,0.28)',
  boxShadow: '0 8px 18px -6px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.45)',
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  const base = 'rounded-full border px-4 py-1.5 text-[11px] uppercase transition-all duration-300'
  const active = 'border-transparent text-[#08122B]'
  const idle =
    'border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f5f8fc)] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:-translate-y-0.5 hover:border-brand-primary/40 hover:text-emerald-700'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={() => onChange(null)} className={`${base} ${selected === null ? active : idle}`} style={selected === null ? { ...activeStyle, ...monoLabel } : monoLabel}>
        Todos
      </button>
      {categories.map((cat) => (
        <button key={cat} onClick={() => onChange(cat)} className={`${base} ${selected === cat ? active : idle}`} style={selected === cat ? { ...activeStyle, ...monoLabel } : monoLabel}>
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
