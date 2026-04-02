// ============================================
// layout.tsx — Layout dinâmico de rota de aluno [id]
// ============================================
//
// O que faz:
//   Layout wrapper para /dashboard/students/[id]/*.
//   dynamicParams=false + generateStaticParams vazio: todos os IDs são dinâmicos em runtime.
//   Passthrough de children sem UI adicional.
//
// Exports principais:
//   dynamicParams — false (desabilita params estáticos)
//   generateStaticParams() → [] — nenhum ID pré-gerado
//   StudentDynamicLayout — layout passthrough
import type { ReactNode } from 'react'

export const dynamicParams = false

export function generateStaticParams(): Array<{ id: string }> {
  return []
}

export default function StudentDynamicLayout({ children }: { children: ReactNode }) {
  return children
}
