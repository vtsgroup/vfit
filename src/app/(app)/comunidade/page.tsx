'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function ComunidadePage() {
  const router = useRouter()

  return (
    <div className="relative mx-auto min-h-dvh max-w-lg overflow-hidden bg-slate-950 pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative px-4 pt-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            <DSIcon name="chevronLeft" size={16} />
            Voltar
          </button>
          <h1 className="text-3xl font-black text-white">Comunidade</h1>
          <p className="mt-2 text-sm text-white/60">Conecte-se com outros atletas</p>
        </div>

        <div className="glass-card flex flex-col items-center justify-center rounded-2xl border border-white/10 p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/20">
            <DSIcon name="users" size={32} className="text-brand-primary" />
          </div>
          <h2 className="text-lg font-bold text-white">Em Breve</h2>
          <p className="mt-3 text-sm text-white/60">
            A comunidade VFIT está sendo construída. Em breve você poderá interagir com outros atletas e personal trainers.
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => router.back()}
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  )
}
