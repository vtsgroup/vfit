/**
 * src/components/progresso/kpi-card.tsx
 *
 * Card KPI com ícone, valor e label — Grid 2x3
 */

'use client'

import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

interface KPICardProps {
  icon: DSIconName
  label: string
  value: string | number
  unit?: string
  color?: string
  iconBg?: string
}

export function KPICard({ icon, label, value, unit, color = 'text-brand-primary', iconBg = 'bg-white/8' }: KPICardProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/6 bg-white/3 p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
        <DSIcon name={icon} size={20} className={color} />
      </div>
      <div className="text-center">
        <p className="text-[20px] font-black text-white leading-none">
          {value}
          {unit && <span className="ml-0.5 text-[12px] font-medium text-zinc-500">{unit}</span>}
        </p>
        <p className="mt-1 text-[11px] font-medium text-zinc-500">{label}</p>
      </div>
    </div>
  )
}
