/**
 * src/app/(app)/perfil/unidades/page.tsx
 *
 * Unidades de medida — Métrico (kg/cm) ou Imperial (lb/in)
 * Persistência via localStorage (sem API por enquanto)
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { hapticLight, hapticSuccess } from '@/lib/haptics'

type UnitSystem = 'metric' | 'imperial'

const UNIT_OPTIONS: { key: UnitSystem; label: string; desc: string; examples: string }[] = [
  {
    key: 'metric',
    label: 'Métrico',
    desc: 'Sistema Internacional',
    examples: 'kg, cm, km',
  },
  {
    key: 'imperial',
    label: 'Imperial',
    desc: 'Sistema Anglo-Saxão',
    examples: 'lb, in, mi',
  },
]

const STORAGE_KEY = 'vfit_unit_system'

export default function UnidadesPage() {
  const router = useRouter()
  const [system, setSystem] = useState<UnitSystem>('metric')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'imperial') setSystem('imperial')
  }, [])

  const handleSelect = (s: UnitSystem) => {
    hapticLight()
    setSystem(s)
    localStorage.setItem(STORAGE_KEY, s)
  }

  const handleSave = () => {
    hapticSuccess()
    router.back()
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Unidades de Medida</h1>
          <p className="text-[11px] text-zinc-500">Defina o sistema de medidas</p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {UNIT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => handleSelect(opt.key)}
            className={cn(
              'flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all',
              system === opt.key
                ? 'bg-brand-primary/12 ring-1 ring-brand-primary/30'
                : 'bg-white/4 hover:bg-white/6'
            )}
          >
            <div className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl',
              system === opt.key ? 'bg-brand-primary/20' : 'bg-white/5'
            )}>
              <DSIcon
                name="ruler"
                size={22}
                className={system === opt.key ? 'text-brand-primary' : 'text-zinc-400'}
              />
            </div>
            <div className="flex-1">
              <p className={cn(
                'text-sm font-bold',
                system === opt.key ? 'text-brand-primary' : 'text-white'
              )}>
                {opt.label}
              </p>
              <p className="text-[11px] text-zinc-500">{opt.desc}</p>
              <p className="mt-1 text-[10px] text-zinc-600">{opt.examples}</p>
            </div>
            {system === opt.key && (
              <DSIcon name="checkCircle" size={20} className="text-brand-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Info card */}
      <div className="mt-6 rounded-2xl bg-white/4 p-4">
        <div className="flex items-start gap-2">
          <DSIcon name="info" size={14} className="mt-0.5 shrink-0 text-zinc-500" />
          <p className="text-xs leading-relaxed text-zinc-500">
            A alteração afeta como pesos e medidas são exibidos no app.
            Seus dados são sempre armazenados em formato métrico.
          </p>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-brand-primary/90 active:scale-[0.98]"
      >
        <DSIcon name="checkCircle" size={16} />
        Salvar
      </button>
    </div>
  )
}
