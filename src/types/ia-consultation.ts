/**
 * src/types/ia-consultation.ts
 *
 * Tipos de consultas IA disponíveis no VFIT B2C.
 * Usado pelo hub /ia e futuramente pelos sub-módulos.
 */

import type { DSIconName } from '@/components/ui/ds-icon'

export type IAConsultationType =
  | 'diet_plan'
  | 'workout_adaptation'
  | 'macro_guidance'
  | 'recovery_guide'

export interface IAConsultationOption {
  id: IAConsultationType
  label: string
  icon: DSIconName
  description: string
  route: string
  /** false = mostra como "Em breve" com visual disabled */
  isAvailable: boolean
}

export const IA_CONSULTATION_OPTIONS: IAConsultationOption[] = [
  {
    id: 'diet_plan',
    label: 'Dieta Personalizada',
    icon: 'apple',
    description: 'Crie um plano alimentar baseado na sua avaliação',
    route: '/ia/dieta',
    isAvailable: true,
  },
  {
    id: 'workout_adaptation',
    label: 'Adaptar Treino',
    icon: 'dumbbell',
    description: 'Ajuste seu treino conforme seus objetivos',
    route: '/ia/treino-adaptado',
    isAvailable: false,
  },
  {
    id: 'macro_guidance',
    label: 'Orientação de Macros',
    icon: 'barChart',
    description: 'Entenda seus macronutrientes ideais',
    route: '/ia/macros',
    isAvailable: false,
  },
  {
    id: 'recovery_guide',
    label: 'Guia de Recuperação',
    icon: 'moon',
    description: 'Otimize seu descanso e recuperação',
    route: '/ia/recuperacao',
    isAvailable: false,
  },
]
