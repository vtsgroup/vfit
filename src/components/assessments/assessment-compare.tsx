// ============================================
// assessment-compare.tsx — Comparação entre duas avaliações físicas
// ============================================
//
// O que faz:
//   Exibe delta entre avaliação atual e anterior por métrica (peso, gordura, etc.).
//   DeltaBadge indica melhora (verde), piora (vermelho) ou estável.
//   positiveWhenDown flag inverte lógica de cor para métricas como % de gordura.
//
// Exports principais:
//   AssessmentCompare — card de comparação entre avaliações
'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CompareMetric {
  label: string
  current: number | null
  previous: number | null
  unit: string
  positiveWhenDown?: boolean
}

function DeltaBadge({ value, positiveWhenDown = false }: { value: number | null; positiveWhenDown?: boolean }) {
  if (value == null || value === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border-light px-2 py-1 text-xs text-text-muted">
        <span className="inline-block h-0.5 w-3 rounded-full bg-current" />
        Estável
      </span>
    )
  }

  const isDown = value < 0
  const isPositive = positiveWhenDown ? isDown : !isDown
  const Icon = isDown ? 'arrowDown' : 'arrowUp'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${isPositive ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
      <DSIcon name={Icon} size={12} />
      {isDown ? '' : '+'}{value.toFixed(2)}
    </span>
  )
}

export function AssessmentCompare({
  hasPrevious,
  metrics,
}: {
  hasPrevious: boolean
  metrics: CompareMetric[]
}) {
  if (!hasPrevious) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparativo com avaliação anterior</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">Sem avaliação anterior para comparar.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo com avaliação anterior</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {metrics.map((metric) => {
          const delta = metric.current != null && metric.previous != null
            ? metric.current - metric.previous
            : null

          return (
            <div key={metric.label} className="flex items-center justify-between rounded-lg border border-border-light bg-bg-secondary px-3 py-2">
              <div>
                <p className="text-sm font-medium text-text-primary">{metric.label}</p>
                <p className="text-xs text-text-muted">
                  {metric.previous == null ? '—' : metric.previous.toFixed(2)} → {metric.current == null ? '—' : metric.current.toFixed(2)} {metric.unit}
                </p>
              </div>
              <DeltaBadge value={delta} positiveWhenDown={metric.positiveWhenDown} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
