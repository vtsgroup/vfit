// ============================================
// pricing-table.tsx — Tabela comparativa de funcionalidades por plano
// ============================================
//
// O que faz:
//   Tabela de comparação de features entre planos (trial, pro, max).
//   CellValue renderiza checkmark verde, X vermelho ou texto por valor.
//   Usa ComparisonRow de @/data/pricing-plans.
//
// Exports principais:
//   PricingTable — tabela comparativa de planos
import { DSIcon } from '@/components/ui/ds-icon'
import type { ComparisonRow } from '@/data/pricing-plans'

const monoStyle = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }

interface PricingTableProps {
  rows: ComparisonRow[]
}

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <>
        <DSIcon name="check" size={16} className="mx-auto text-emerald-400" />
        <span className="sr-only">Incluído</span>
      </>
    ) : (
      <>
        <DSIcon name="x" size={16} className="mx-auto text-zinc-400" />
        <span className="sr-only">Não incluído</span>
      </>
    )
  }
  return <span className="text-sm text-zinc-300">{value}</span>
}

export function PricingTable({ rows }: PricingTableProps) {
  const plans = ['gratis', 'pro', 'proPlus', 'max'] as const
  const planLabels = { gratis: 'Grátis', pro: 'Pro', proPlus: 'Pro+', max: 'Max' }

  return (
    <div
      className="overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label="Tabela comparativa de planos"
    >
      <table className="w-full text-left">
        <caption className="sr-only">Comparativo de recursos por plano</caption>
        <thead>
          <tr className="border-b border-white/8">
            <th scope="col" className="py-4 pr-4 text-sm font-medium text-zinc-300">Recurso</th>
            {plans.map((p) => (
              <th
                key={p}
                scope="col"
                className={`font-syne py-4 px-3 text-center text-xs uppercase tracking-wider ${
                  p === 'pro' ? 'text-brand-primary' : 'text-zinc-400'
                }`}
                style={monoStyle}
              >
                {planLabels[p]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.feature}
              className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/1' : ''}`}
            >
              <td className="py-3.5 pr-4 text-sm text-zinc-300">{row.feature}</td>
              {plans.map((p) => (
                <td key={p} className="py-3.5 px-3 text-center">
                  <CellValue value={row[p]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
