/**
 * src/app/(app)/ia/treino-adaptado/page.tsx
 *
 * Stub — Adaptar Treino com IA
 * Futuro: não previsto para esta sprint
 */

'use client'

import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui'

export default function TreinoAdaptadoIAPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary pb-24">
      <header className="sticky top-14 z-20 flex items-center gap-3 bg-bg-primary/80 px-4 py-3 backdrop-blur-lg">
        <button onClick={() => router.back()} className="p-1">
          <DSIcon name="arrowLeft" className="h-5 w-5 text-text-primary" />
        </button>
        <div className="flex items-center gap-2">
          <DSIcon name="dumbbell" className="h-5 w-5 text-brand-primary" />
          <h1 className="text-lg font-bold text-text-primary">Adaptar Treino</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/8 mb-4">
          <DSIcon name="dumbbell" size={32} className="text-brand-primary" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Em breve!</h2>
        <p className="text-sm text-text-secondary max-w-xs leading-relaxed">
          A IA vai adaptar seu treino conforme sua avaliação física e progressão.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 rounded-xl bg-bg-secondary px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-tertiary"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
