/**
 * src/app/(app)/treinos/[id]/page.tsx
 *
 * Sprint 31 — Detalhe de um treino template
 * Header com emoji, info, CTA "Usar" ou "Iniciar"
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import {
  useWorkoutTemplateDetail,
  getDifficultyLabel,
  getDifficultyColor,
  getCategoryLabel,
  type TemplateDay,
} from '@/hooks/use-workout-templates'

export default function TreinoTemplatePage() {
  const router = useRouter()
  const rawId = useParams<{ id: string }>().id
  const id = rawId && rawId !== '_' ? rawId : null
  const { data: template, isLoading } = useWorkoutTemplateDetail(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <DSIcon name="loader" size={24} className="animate-spin text-zinc-500" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center gap-3 py-32">
        <p className="text-zinc-500">Template não encontrado</p>
        <button aria-label="Voltar" onClick={() => router.back()} className="text-brand-primary text-[13px]">
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-28">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-white">Detalhes do Treino</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <DSIcon name="share2" size={18} className="text-zinc-400" />
        </button>
      </div>

      {/* Hero */}
      <div className="mb-5 rounded-3xl border border-white/5 bg-white/2 p-6 text-center">
        <div className="mb-3 flex justify-center">
          <span className="text-6xl">{template.image_emoji}</span>
        </div>
        <h2 className="mb-1 text-xl font-black text-white">{template.name}</h2>
        <p className="mb-3 text-[13px] text-zinc-500">{template.description}</p>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${getDifficultyColor(template.difficulty)}`}>
            {getDifficultyLabel(template.difficulty)}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-zinc-400">
            {getCategoryLabel(template.category)}
          </span>
          {template.is_premium && (
            <span className="flex items-center gap-1 rounded-full bg-yellow-400/10 px-3 py-1 text-[11px] font-bold text-yellow-400">
              <DSIcon name="crown" size={12} />
              Premium
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatBox label="Dias" value={`${template.total_days}`} icon="calendar" />
        <StatBox label="Duração" value={`${template.estimated_duration_min}min`} icon="clock" />
        <StatBox label="Exercícios" value={`${template.exercises_count}`} icon="dumbbell" />
      </div>

      {/* Exercises */}
      <div className="mb-5">
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-zinc-500">
          Exercícios
        </h3>
        {template.days && template.days.length > 0 ? (
          <div className="space-y-4">
            {(template.days as TemplateDay[]).map((day) => (
              <div key={day.day} className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden">
                <div className="bg-white/3 px-4 py-2.5 border-b border-white/5">
                  <p className="text-sm font-bold text-white">Dia {day.day} — {day.name}</p>
                </div>
                <div className="divide-y divide-white/5">
                  {day.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                        <DSIcon name="dumbbell" size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white truncate">{ex.name}</p>
                        <p className="text-[11px] text-zinc-500">{ex.muscle_group}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12px] font-bold text-zinc-300">{ex.sets}×{ex.reps}</p>
                        <p className="text-[10px] text-zinc-600">{ex.rest_seconds}s desc.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/2 p-6 text-center">
            <DSIcon name="layers" size={24} className="mx-auto mb-2 text-zinc-600" />
            <p className="text-[13px] text-zinc-500">
              Detalhes dos exercícios disponíveis em breve
            </p>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="fixed right-0 bottom-20 left-0 z-40 px-4 pb-4">
        <div className="mx-auto flex max-w-lg gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/plano')}>
            <DSIcon name="clipboardList" size={18} />
            Usar este treino
          </Button>
          <Button className="flex-1">
            <DSIcon name="zap" size={18} />
            Iniciar agora
          </Button>
        </div>
      </div>
    </div>
  )
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: 'calendar' | 'clock' | 'dumbbell'
}) {
  return (
    <div className="rounded-xl bg-white/2 p-3 text-center">
      <DSIcon name={icon} size={18} className="mx-auto mb-1 text-zinc-500" />
      <p className="text-[15px] font-bold text-white">{value}</p>
      <p className="text-[10px] text-zinc-600">{label}</p>
    </div>
  )
}
