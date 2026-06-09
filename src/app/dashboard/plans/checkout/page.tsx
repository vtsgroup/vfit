/**
 * src/app/dashboard/plans/checkout/page.tsx
 *
 * Legacy creator plan checkout page (deprecated)
 */

'use client'

import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

export default function CheckoutPage() {
  const router = useRouter()

  return (
    <AuthGuard>
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <GlassCard variant="surface" padding="lg" radius="2xl" className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-400">
              <DSIcon name="alertTriangle" size={18} />
            </div>
            <div>
              <h1 className="text-xl font-black text-text-primary">Checkout de plano descontinuado</h1>
              <p className="mt-1 text-sm text-text-secondary">
                O VFIT nao cobra mais assinatura de profissionais e nutricionistas.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border-light bg-bg-tertiary/40 p-4 text-sm text-text-secondary">
            O novo modelo e student-first: profissionais monetizam via alunos e consultorias dentro da plataforma.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full" onClick={() => router.push('/dashboard/payments')}>
              <DSIcon name="wallet" size={16} />
              Ir para monetizacao
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/plans')}>
              Voltar
            </Button>
          </div>
        </GlassCard>
      </div>
    </AuthGuard>
  )
}
