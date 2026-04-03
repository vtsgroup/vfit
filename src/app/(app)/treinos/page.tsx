/**
 * src/app/(app)/treinos/page.tsx
 *
 * Sprint 30 — Tab Treinos: Explorar & Templates
 * Cards: Criar Rápido (IA), Meu Plano, Templates filtráveis
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import {
  useWorkoutTemplates,
  getDifficultyLabel,
  getDifficultyColor,
} from '@/hooks/use-workout-templates'
import { hapticLight } from '@/lib/haptics'

const DIFFICULTY_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
]

export default function TreinosPage() {
  const [difficulty, setDifficulty] = useState('')
  const { data: templates, isLoading } = useWorkoutTemplates(
    difficulty ? { difficulty } : undefined
  )

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      <h1 className="mb-1 text-xl font-black text-text-primary">Treinos</h1>
      <p className="mb-5 text-[13px] text-text-muted">Recursos personalizados para você</p>

      {/* Quick actions */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Link
          href="/plano"
          className="group glass-card flex flex-col gap-2 rounded-2xl p-4 transition-all hover:border-brand-primary/20"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/12">
            <DSIcon name="sparkles" size={20} className="text-brand-primary" />
          </div>
          <p className="text-[13px] font-bold text-text-primary">Criar com IA</p>
          <p className="text-[11px] text-text-muted">Treino personalizado</p>
        </Link>

        <Link
          href="/plano"
          className="group glass-card flex flex-col gap-2 rounded-2xl p-4 transition-all hover:border-info/20"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
            <DSIcon name="clipboardList" size={20} className="text-blue-400" />
          </div>
          <p className="text-[13px] font-bold text-text-primary">Meu Plano</p>
          <p className="text-[11px] text-text-muted">Treino atual ativo</p>
        </Link>
      </div>

      {/* Templates section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-text-primary">Treinos Prontos</h2>
      </div>

      {/* Difficulty filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {DIFFICULTY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              hapticLight()
              setDifficulty(f.value)
            }}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all ${
              difficulty === f.value
                ? 'bg-brand-primary text-black'
                : 'bg-white/5 text-text-secondary hover:bg-white/8'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <DSIcon name="loader" size={24} className="animate-spin text-text-muted" />
        </div>
      )}

      {/* Templates grid */}
      {templates && templates.length > 0 && (
        <div className="space-y-3">
          {templates.map((t) => (
            <Link
              key={t.id}
              href={`/treinos/${t.id}`}
              className="glass-card flex items-center gap-3 rounded-2xl p-4 transition-all hover:border-white/12"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl">
                {t.image_emoji}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <p className="truncate text-[14px] font-bold text-text-primary">{t.name}</p>
                  {t.is_premium && (
                    <DSIcon name="lock" size={12} className="shrink-0 text-yellow-400" />
                  )}
                </div>
                <p className="mb-1.5 line-clamp-1 text-[11px] text-text-muted">{t.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getDifficultyColor(t.difficulty)}`}>
                    {getDifficultyLabel(t.difficulty)}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {t.total_days} dias · {t.estimated_duration_min}min
                  </span>
                </div>
              </div>

              <DSIcon name="chevronRight" size={16} className="shrink-0 text-text-muted" />
            </Link>
          ))}
        </div>
      )}

      {/* Empty */}
      {templates && templates.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-[13px] text-text-muted">Nenhum treino encontrado para esse filtro.</p>
        </div>
      )}
    </div>
  )
}
