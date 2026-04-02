// ============================================
// layout.tsx — Layout dinâmico de rota de treino [id]
// ============================================
//
// O que faz:
//   Layout wrapper para /dashboard/workouts/[id]/*.
//   dynamicParams=false + generateStaticParams vazio: todos os IDs em runtime.
//   Passthrough de children sem UI adicional.
//
// Exports principais:
//   dynamicParams — false (desabilita params estáticos)
//   generateStaticParams() → [] — nenhum ID pré-gerado
//   WorkoutDynamicLayout — layout passthrough
import type { ReactNode } from 'react'

export const dynamicParams = false

export function generateStaticParams(): Array<{ id: string }> {
  return []
}

export default function WorkoutDynamicLayout({ children }: { children: ReactNode }) {
  return children
}
