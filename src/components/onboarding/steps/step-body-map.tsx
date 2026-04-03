/**
 * src/components/onboarding/steps/step-body-map.tsx
 *
 * Onboarding Step 6 — Body Map (seleção múltipla de regiões)
 * Chips clicáveis para cada grupo muscular
 * Mín 1 seleção para continuar
 */

'use client'

import { useCallback } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'

type MuscleGroup = {
  id: string
  label: string
  icon: DSIconName
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: 'chest', label: 'Peito', icon: 'heart' },
  { id: 'back', label: 'Costas', icon: 'shield' },
  { id: 'shoulders', label: 'Ombros', icon: 'trendingUp' },
  { id: 'arms', label: 'Braços', icon: 'dumbbell' },
  { id: 'abs', label: 'Abdômen', icon: 'target' },
  { id: 'glutes', label: 'Glúteos', icon: 'flame' },
  { id: 'legs', label: 'Pernas', icon: 'footprints' },
  { id: 'calves', label: 'Panturrilha', icon: 'activity' },
  { id: 'full_body', label: 'Corpo todo', icon: 'zap' },
]

export function StepBodyMap() {
  const { data, updateData } = useOnboardingStore()
  const selected = data.target_muscles

  const toggle = useCallback(
    (id: string) => {
      // If 'full_body' is selected, deselect everything else
      if (id === 'full_body') {
        updateData({
          target_muscles: selected.includes('full_body') ? [] : ['full_body'],
        })
        return
      }

      // Remove full_body if selecting individual groups
      const without = selected.filter((m) => m !== 'full_body')

      if (without.includes(id)) {
        updateData({ target_muscles: without.filter((m) => m !== id) })
      } else {
        updateData({ target_muscles: [...without, id] })
      }
    },
    [selected, updateData]
  )

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <p className="text-xs text-white/40">
        Selecione as áreas que você quer focar · mínimo 1
      </p>

      {/* Chip grid */}
      <div className="flex flex-wrap gap-2.5">
        {MUSCLE_GROUPS.map((group) => {
          const isSelected = selected.includes(group.id)
          return (
            <button
              key={group.id}
              onClick={() => toggle(group.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 transition-all duration-300 ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary/15 shadow-sm shadow-brand-primary/10 scale-[1.03]'
                  : 'border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/6'
              }`}
            >
              <DSIcon name={group.icon} className={`h-4 w-4 transition-colors ${isSelected ? 'text-brand-primary' : 'text-white/50'}`} />
              <span
                className={`text-sm font-medium transition-colors ${
                  isSelected ? 'text-white' : 'text-white/70'
                }`}
              >
                {group.label}
              </span>
              {isSelected && (
                <DSIcon name="check" className="h-3.5 w-3.5 text-brand-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <p className="text-center text-xs text-white/40">
          {selected.includes('full_body')
            ? 'Corpo todo selecionado — treino equilibrado'
            : `${selected.length} ${selected.length === 1 ? 'área selecionada' : 'áreas selecionadas'}`}
        </p>
      )}
    </div>
  )
}
