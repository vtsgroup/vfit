/**
 * src/components/onboarding/steps/step-injuries.tsx
 *
 * Onboarding Step — Lesões ou restrições
 * Multi-select chips (pode pular)
 */

'use client'

import { useCallback } from 'react'
import type { DSIconName } from '@/components/ui/ds-icon'
import { OnboardingChoiceChip, OnboardingInsight } from '../onboarding-choice'
import { useOnboardingStore } from '@/stores/onboarding-store'

type InjuryOption = {
  id: string
  label: string
  icon: DSIconName
}

const INJURY_OPTIONS: InjuryOption[] = [
  { id: 'knee', label: 'Joelho', icon: 'footprints' },
  { id: 'shoulder', label: 'Ombro', icon: 'trendingUp' },
  { id: 'back_lower', label: 'Lombar', icon: 'activity' },
  { id: 'back_upper', label: 'Coluna', icon: 'shield' },
  { id: 'wrist', label: 'Pulso', icon: 'penLine' },
  { id: 'ankle', label: 'Tornozelo', icon: 'footprints' },
  { id: 'hip', label: 'Quadril', icon: 'activity' },
  { id: 'neck', label: 'Pescoço', icon: 'user' },
  { id: 'none', label: 'Nenhuma', icon: 'checkCircle' },
]

export function StepInjuries() {
  const { data, updateData } = useOnboardingStore()
  const selected = data.injuries

  const toggle = useCallback(
    (id: string) => {
      if (id === 'none') {
        updateData({ injuries: selected.includes('none') ? [] : ['none'] })
        return
      }
      const without = selected.filter((i) => i !== 'none')
      if (without.includes(id)) {
        updateData({ injuries: without.filter((i) => i !== id) })
      } else {
        updateData({ injuries: [...without, id] })
      }
    },
    [selected, updateData]
  )

  return (
    <div className="space-y-6">
      <OnboardingInsight icon="shieldCheck">Informe restrições para o VFIT trocar exercícios de risco por variações mais seguras.</OnboardingInsight>

      <div className="flex flex-wrap gap-2.5">
        {INJURY_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id)
          return (
            <OnboardingChoiceChip
              key={opt.id}
              onClick={() => toggle(opt.id)}
              selected={isSelected}
              icon={opt.icon}
              tone={opt.id === 'none' ? 'emerald' : 'amber'}
            >
              {opt.label}
            </OnboardingChoiceChip>
          )
        })}
      </div>

      {selected.length > 0 && !selected.includes('none') && (
        <p className="text-center text-xs font-medium text-slate-400">
          {selected.length} {selected.length === 1 ? 'lesão selecionada' : 'lesões selecionadas'} — treino adaptado
        </p>
      )}
    </div>
  )
}
