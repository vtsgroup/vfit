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
import { ProfileCard, ProfileDetailShell, ProfilePill, ProfileToggle } from '@/components/profile/settings-shell'
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

  const [expandedCat, setExpandedCat] = useState<string | null>(EQUIPMENT_CATEGORIES[0]?.id ?? null)

  const handleToggle = (id: string) => {
    hapticLight()
    toggle(id)
  }

  const handleSave = () => {
    hapticSuccess()
    router.back()
  }

  return (
    <ProfileDetailShell
      title="Equipamentos"
      subtitle="Informe o que existe na sua academia para personalizar sugestões de exercício."
      icon="dumbbell"
      tone="emerald"
      meta={<ProfilePill tone="emerald">{count} de {total} selecionados</ProfilePill>}
      action={
        <button
          type="button"
          onClick={count === total ? clearAll : selectAllGlobal}
          className="min-h-9 rounded-full border border-white/10 bg-white/8 px-3 text-[10px] font-black text-white/80 transition-colors hover:bg-white/12 hover:text-white"
        >
          {count === total ? 'Limpar' : 'Todos'}
        </button>
      }
    >
      <div className="space-y-4 pb-20">
        {EQUIPMENT_CATEGORIES.map((category) => {
          const isExpanded = expandedCat === category.id
          const catFull = isCategoryFullySelected(category.id)
          const catCount = category.items.filter((item) => isSelected(item.id)).length

          return (
            <ProfileCard key={category.id} className="overflow-hidden p-0">
              <button
                type="button"
                onClick={() => setExpandedCat(isExpanded ? null : category.id)}
                className="flex min-h-18 w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <DSIcon name="dumbbell" size={21} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-black text-slate-950">{category.name}</span>
                  <p className="text-[11px] font-medium text-slate-500">{catCount}/{category.items.length} equipamentos</p>
                </div>
                {catFull && <ProfilePill tone="emerald" className="min-h-7 px-2 text-[9px]">Todos</ProfilePill>}
                <DSIcon name="chevronRight" size={17} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 px-2 pb-2">
                  <button
                    type="button"
                    onClick={() => selectAll(category.id)}
                    className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-[16px] px-3 text-[12px] font-black text-emerald-700 transition-colors hover:bg-emerald-50"
                  >
                    <DSIcon name={catFull ? 'close' : 'check'} size={15} />
                    {catFull ? 'Desmarcar categoria' : 'Selecionar categoria'}
                  </button>

                  {category.items.map((item) => {
                    const selected = isSelected(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggle(item.id)}
                        className={`flex min-h-13 w-full items-center gap-3 rounded-[18px] px-3 py-2.5 transition-all ${selected ? 'bg-emerald-50 text-slate-950' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] ${selected ? 'bg-white text-emerald-600 ring-1 ring-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                          <DSIcon name="dumbbell" size={16} />
                        </div>
                        <span className="flex-1 text-left text-[13px] font-bold">{item.name}</span>
                        <ProfileToggle enabled={selected} />
                      </button>
                    )
                  })}
                </div>
              )}
            </ProfileCard>
          )
        })}
      </div>

      <div className="fixed right-0 bottom-20 left-0 z-40 px-4 pb-4">
        <div className="mx-auto max-w-lg">
          <Button onClick={handleSave} className="w-full shadow-[0_18px_40px_-24px_rgba(5,150,105,0.85)]">
            <DSIcon name="check" size={18} />
            Salvar ({count} equipamentos)
          </Button>
        </div>
      </div>
    </ProfileDetailShell>
  )
}