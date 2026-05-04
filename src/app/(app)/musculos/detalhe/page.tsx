'use client'

import Image from 'next/image'
import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { useMuscleGroups } from '@/hooks/use-exercises'

function normalizeText(value?: string | null) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function MuscleDetailContent() {
  const router = useRouter()
  const params = useSearchParams()
  const muscle = params.get('muscle') || ''
  const { data: muscleGroups = [], isLoading } = useMuscleGroups()

  const selected = useMemo(() => {
    const target = normalizeText(muscle)
    if (!target) return null
    return muscleGroups.find((m) => (
      normalizeText(m.name_pt) === target
      || normalizeText(m.name) === target
    )) || null
  }, [muscle, muscleGroups])

  // Compute sub-muscles from flat API response using parent_id
  const subMuscles = useMemo(() => {
    if (!selected) return []
    return muscleGroups.filter((m) => m.parent_id === selected.id)
  }, [muscleGroups, selected])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="h-44 animate-pulse rounded-b-3xl bg-bg-secondary" />
        <div className="px-4 pt-5">
          <div className="h-8 animate-pulse rounded-xl bg-bg-secondary" />
        </div>
      </div>
    )
  }

  if (!selected) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <button type="button" onClick={() => router.back()} className="mb-4 text-sm text-brand-primary">
          Voltar
        </button>
        <div className="rounded-2xl border border-white/10 bg-bg-secondary p-4 text-text-secondary">
          Grupo muscular não encontrado.
        </div>
      </div>
    )
  }

  const muscleColor = selected.color_hex || '#22c55e'

  return (
    <div className="mx-auto max-w-lg pb-28">
      {/* ─── Hero ─── */}
      <div
        className="relative overflow-hidden rounded-b-3xl px-4 pb-6 pt-5"
        style={{ background: 'linear-gradient(to bottom, #0b1f0d 0%, #0c2110 20%, #091c0c 40%, #08180a 65%, #071408 85%, #050A12 100%)', boxShadow: '0 6px 28px 0 rgba(5,10,18,0.6)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(circle at 80% 30%, ${muscleColor}22, transparent 60%)` }}
        />
        <button type="button" onClick={() => router.back()} className="relative mb-3 inline-flex items-center gap-1 text-xs text-white/55 transition-colors hover:text-white/85">
          <DSIcon name="arrowLeft" size={12} /> Voltar
        </button>
        <div className="relative flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: muscleColor }}>Anatomia</p>
            <h1 className="text-3xl font-black text-white leading-tight">{selected.name_pt || selected.name}</h1>
          </div>
          {selected.image_url && (
            <Image
              src={selected.image_url}
              alt={selected.name_pt || selected.name}
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover opacity-90"
            />
          )}
        </div>
        <p className="relative mt-2 text-[13px] leading-relaxed text-white/60">
          {selected.description || 'Este grupo muscular participa de exercícios compostos e isolados. Foque em execução controlada e amplitude completa.'}
        </p>
      </div>

      <div className="px-4 pt-5">
        {/* Subgrupos */}
        {subMuscles.length > 0 ? (
          <div className="mb-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">Subgrupos Musculares</p>
            <div className="grid grid-cols-2 gap-2.5">
              {subMuscles.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2.5 rounded-2xl border bg-bg-secondary p-3"
                  style={{ borderColor: `${muscleColor}20` }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${muscleColor}18` }}
                  >
                    {sub.image_url ? (
                      <Image src={sub.image_url} alt={sub.name_pt || sub.name} width={36} height={36} className="h-9 w-9 rounded-xl object-cover" />
                    ) : (
                      <DSIcon name="activity" size={14} style={{ color: muscleColor }} />
                    )}
                  </div>
                  <p className="text-[12px] font-semibold leading-tight text-text-primary">{sub.name_pt || sub.name}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-white/6 bg-bg-secondary p-4 text-center">
            <DSIcon name="activity" size={20} className="mx-auto mb-2 text-text-muted" />
            <p className="text-sm text-text-secondary">Subgrupos não cadastrados ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MuscleDetailSkeleton() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="h-24 animate-pulse rounded-2xl bg-bg-secondary" />
    </div>
  )
}

export default function MuscleDetailPage() {
  return (
    <Suspense fallback={<MuscleDetailSkeleton />}>
      <MuscleDetailContent />
    </Suspense>
  )
}
