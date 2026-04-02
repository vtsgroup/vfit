/**
 * src/components/progresso/mini-bar-chart.tsx
 *
 * Mini bar chart com SVG puro — sem dependências
 */

'use client'

interface MiniBarChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
}

export function MiniBarChart({ data, color = '#22C55E', height = 120 }: MiniBarChartProps) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const barWidth = Math.floor(100 / data.length) - 2
  const gap = 1

  return (
    <div className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * (height - 24)
          const x = i * (barWidth + gap * 2) + gap
          const y = height - 20 - barH

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 2)}
                rx={3}
                fill={d.value > 0 ? color : '#27272a'}
                opacity={d.value > 0 ? 0.9 : 0.3}
              />
            </g>
          )
        })}
      </svg>
      <div className="mt-1 flex justify-between px-0.5">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] text-zinc-600 text-center" style={{ width: `${100 / data.length}%` }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}
