/**
 * src/app/(app)/perfil/equipamentos/page.tsx
 *
 * Seleção de equipamentos da academia — categorias com toggles
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useEquipment } from '@/hooks/use-equipment'
import { EQUIPMENT_CATEGORIES } from '@config/equipment'
import { hapticLight, hapticSuccess } from '@/lib/haptics'

export default function EquipamentosPage() {
  const router = useRouter()
  const {
    count,
    total,
    toggle,
    selectAll,
    selectAllGlobal,
    clearAll,
    isSelected,
    isCategoryFullySelected,
  } = useEquipment()

  const [expandedCat, setExpandedCat] = useState<string | null>(
    EQUIPMENT_CATEGORIES[0]?.id ?? null
  )

  const handleToggle = (id: string) => {
    hapticLight()
    toggle(id)
  }

  const handleSave = () => {
    hapticSuccess()
    router.back()
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-28">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Equipamentos</h1>
          <p className="text-[11px] text-zinc-500">
            {count} de {total} selecionados
          </p>
        </div>
        <button
          onClick={count === total ? clearAll : selectAllGlobal}
          className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-brand-primary hover:bg-brand-primary/10 transition-all"
        >
          {count === total ? 'Desmarcar tudo' : 'Marcar tudo'}
        </button>
      </div>

      <p className="mb-5 text-[12px] text-zinc-500 px-1">
        Selecione os equipamentos disponíveis na sua academia. Isso personaliza os exercícios sugeridos.
      </p>

      {/* Categories accordion */}
      <div className="space-y-2">
        {EQUIPMENT_CATEGORIES.map((cat) => {
          const isExpanded = expandedCat === cat.id
          const catFull = isCategoryFullySelected(cat.id)
          const catCount = cat.items.filter((i) => isSelected(i.id)).length

          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden"
            >
              {/* Category header */}
              <button
                onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-lg">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[14px] font-semibold text-white">{cat.name}</span>
                  <p className="text-[11px] text-zinc-600">
                    {catCount}/{cat.items.length} equipamentos
                  </p>
                </div>
                {catFull && (
                  <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                    TODOS
                  </span>
                )}
                <DSIcon
                  name="chevronRight"
                  size={16}
                  className={`text-zinc-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>

              {/* Items */}
              {isExpanded && (
                <div className="border-t border-white/5 px-2 pb-2">
                  {/* Select all category */}
                  <button
                    onClick={() => selectAll(cat.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-semibold text-brand-primary hover:bg-brand-primary/5 rounded-lg mt-1 transition-all"
                  >
                    <DSIcon name={catFull ? 'close' : 'check'} size={14} />
                    {catFull ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>

                  {/* Equipment items */}
                  {cat.items.map((item) => {
                    const selected = isSelected(item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                          selected
                            ? 'bg-brand-primary/8 text-white'
                            : 'text-zinc-400 hover:bg-white/3'
                        }`}
                      >
                        <span className="text-base">{item.emoji}</span>
                        <span className="flex-1 text-left text-[13px] font-medium">
                          {item.name}
                        </span>
                        {/* Toggle switch */}
                        <div
                          className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-all ${
                            selected ? 'bg-brand-primary' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                              selected ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Floating save button */}
      <div className="fixed right-0 bottom-20 left-0 z-40 px-4 pb-4">
        <div className="mx-auto max-w-lg">
          <Button onClick={handleSave} className="w-full shadow-lg">
            <DSIcon name="check" size={18} />
            Salvar ({count} equipamentos)
          </Button>
        </div>
      </div>
    </div>
  )
}
