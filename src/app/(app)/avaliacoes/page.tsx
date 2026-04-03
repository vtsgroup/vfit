/**
 * src/app/(app)/avaliacoes/page.tsx
 *
 * Sprint 26 + FASE 5 — Listagem de auto-avaliações com deltas de evolução
 */

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useSelfAssessments, getBMIColor } from '@/hooks/use-self-assessments'

/** Format delta with sign and color */
function DeltaBadge({ current, previous, unit, invert }: {
  current: number
  previous: number
  unit: string
  /** true = negative delta is good (e.g. weight loss when goal is lose_weight) */
  invert?: boolean
}) {
  const diff = +(current - previous).toFixed(1)
  if (diff === 0) return null
  const isPositive = diff > 0
  const color = invert
    ? (isPositive ? 'text-red-400' : 'text-brand-primary')
    : (isPositive ? 'text-brand-primary' : 'text-red-400')

  return (
    <span className={`ml-1 text-[10px] font-semibold ${color}`}>
      {isPositive ? '↑' : '↓'}{Math.abs(diff)}{unit}
    </span>
  )
}

export default function AvaliacoesPage() {
  const router = useRouter()
  const { data: assessments, isLoading } = useSelfAssessments()

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-text-secondary" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-text-primary">Avaliações Físicas</h1>
        <Link href="/avaliacoes/nova">
          <Button size="sm">
            <DSIcon name="plus" size={16} />
            Nova
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <DSIcon name="loader" size={24} className="animate-spin text-text-muted" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!assessments || assessments.length === 0) && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/8">
            <DSIcon name="clipboardList" size={32} className="text-brand-primary" />
          </div>
          <h2 className="text-[16px] font-bold text-text-primary">Nenhuma avaliação ainda</h2>
          <p className="max-w-65 text-[13px] text-text-muted">
            Faça sua primeira auto-avaliação para acompanhar sua evolução corporal.
          </p>
          <Link href="/avaliacoes/nova">
            <Button>
              <DSIcon name="plus" size={18} />
              Fazer Avaliação
            </Button>
          </Link>
        </div>
      )}

      {/* List */}
      {assessments && assessments.length > 0 && (
        <div className="space-y-3">
          {assessments.map((a, i) => {
            const date = new Date(a.created_at)
            const isFirst = i === 0
            // Previous assessment for delta comparison (list is desc by date)
            const prev = assessments[i + 1] ?? null
            return (
              <Link
                key={a.id}
                href={`/avaliacoes/${a.id}`}
                className={`glass-card block rounded-2xl p-4 transition-all hover:border-white/12 ${
                  isFirst
                    ? 'border-brand-primary/15'
                    : ''
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isFirst && (
                      <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-[9px] font-bold text-brand-primary">
                        MAIS RECENTE
                      </span>
                    )}
                    <span className="text-[12px] text-text-muted">
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <DSIcon name="chevronRight" size={16} className="text-text-muted" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[11px] text-text-muted">Peso</p>
                    <p className="text-[16px] font-bold text-text-primary">
                      {a.weight_kg}<span className="text-[11px] text-text-muted"> kg</span>
                      {prev && <DeltaBadge current={a.weight_kg} previous={prev.weight_kg} unit="kg" />}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">IMC</p>
                    <p className={`text-[16px] font-bold ${getBMIColor(a.bmi)}`}>
                      {a.bmi}
                      {prev && <DeltaBadge current={a.bmi} previous={prev.bmi} unit="" />}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">Gordura</p>
                    <p className="text-[16px] font-bold text-text-primary">
                      {a.body_fat_percentage ? `${a.body_fat_percentage}%` : '—'}
                      {prev && a.body_fat_percentage && prev.body_fat_percentage && (
                        <DeltaBadge current={a.body_fat_percentage} previous={prev.body_fat_percentage} unit="%" invert />
                      )}
                    </p>
                  </div>
                </div>

                {a.bmi_category && (
                  <p className="mt-2 text-[11px] text-text-muted">{a.bmi_category}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
