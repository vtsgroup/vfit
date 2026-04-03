/**
 * src/components/onboarding/steps/step-injuries.tsx
 *
 * Onboarding Step — Lesões ou restrições
 * Multi-select chips (pode pular)
 */

'use client'

import { useCallback } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
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
      <p className="text-xs text-white/40">
        Adaptaremos exercícios para proteger áreas sensíveis
      </p>

      <div className="flex flex-wrap gap-2.5">
        {INJURY_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 transition-all duration-300 ${
                isSelected
                  ? opt.id === 'none'
                    ? 'border-brand-primary bg-brand-primary/15 scale-[1.03]'
                    : 'border-orange-400/50 bg-orange-400/10 scale-[1.03]'
                  : 'border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/6'
              }`}
            >
              <DSIcon name={opt.icon} className={`h-4 w-4 transition-colors ${isSelected ? (opt.id === 'none' ? 'text-brand-primary' : 'text-orange-400') : 'text-white/50'}`} />
              <span
                className={`text-sm font-medium transition-colors ${
                  isSelected ? 'text-white' : 'text-white/70'
                }`}
              >
                {opt.label}
              </span>
              {isSelected && (
                <DSIcon
                  name="check"
                  className={`h-3.5 w-3.5 ${opt.id === 'none' ? 'text-brand-primary' : 'text-orange-400'}`}
                />
              )}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && !selected.includes('none') && (
        <p className="text-center text-xs text-white/40">
          {selected.length} {selected.length === 1 ? 'lesão selecionada' : 'lesões selecionadas'} — treino adaptado
        </p>
      )}
    </div>
  )
}
