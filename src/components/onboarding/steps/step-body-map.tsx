/**
 * src/components/onboarding/steps/step-body-map.tsx
 *
 * Onboarding Step 6 — Body Map (seleção múltipla de regiões)
 * Chips clicáveis para cada grupo muscular
 * Mín 1 seleção para continuar
 */

'use client'

import { useCallback } from 'react'
import type { DSIconName } from '@/components/ui/ds-icon'
import { OnboardingChoiceChip, OnboardingInsight } from '../onboarding-choice'
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
      <OnboardingInsight icon="target">Selecione as áreas que você quer priorizar. Um foco claro deixa o primeiro plano mais fácil de seguir.</OnboardingInsight>

      <div className="flex flex-wrap gap-2.5">
        {MUSCLE_GROUPS.map((group) => {
          const isSelected = selected.includes(group.id)
          return (
            <OnboardingChoiceChip
              key={group.id}
              onClick={() => toggle(group.id)}
              selected={isSelected}
              icon={group.icon}
            >
              {group.label}
            </OnboardingChoiceChip>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-center text-xs font-medium text-slate-400">
          {selected.includes('full_body')
            ? 'Corpo todo selecionado — treino equilibrado'
            : `${selected.length} ${selected.length === 1 ? 'área selecionada' : 'áreas selecionadas'}`}
        </p>
      )}
    </div>
  )
}
