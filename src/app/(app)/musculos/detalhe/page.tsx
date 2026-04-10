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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="h-24 animate-pulse rounded-2xl bg-bg-secondary" />
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

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <button type="button" onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1 text-sm text-brand-primary">
        <DSIcon name="arrowLeft" size={14} /> Voltar
      </button>

      <div className="rounded-2xl border border-white/10 bg-bg-secondary p-4">
        <h1 className="text-xl font-black text-text-primary">{selected.name_pt || selected.name}</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {selected.description || 'Este grupo muscular participa de exercícios compostos e isolados. Foque em execução controlada e amplitude completa.'}
        </p>

        {selected.image_url ? (
          <Image
            src={selected.image_url}
            alt={selected.name_pt || selected.name}
            width={640}
            height={360}
            className="mt-3 h-40 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="mt-3 flex h-40 items-center justify-center rounded-xl border border-dashed border-white/15 bg-bg-tertiary text-text-muted">
            <div className="text-center">
              <DSIcon name="image" size={28} className="mx-auto" />
              <p className="mt-2 text-xs">Placeholder imagem do grupo muscular</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-bg-secondary p-4">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">Subgrupos</h2>

        {(selected.sub_muscles?.length ?? 0) === 0 ? (
          <p className="text-sm text-text-secondary">Sem subgrupos cadastrados ainda.</p>
        ) : (
          <div className="space-y-2">
            {selected.sub_muscles?.map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-bg-tertiary p-2.5">
                {sub.image_url ? (
                  <Image src={sub.image_url} alt={sub.name_pt || sub.name} width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/8">
                    <DSIcon name="activity" size={16} className="text-text-muted" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-text-primary">{sub.name_pt || sub.name}</p>
                  <p className="text-xs text-text-secondary">{sub.description || 'Subgrupo associado ao movimento principal.'}</p>
                </div>
              </div>
            ))}
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
