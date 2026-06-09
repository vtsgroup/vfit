/**
 * src/app/dashboard/plans/checkout/success/page.tsx
 *
 * Legacy creator plan checkout success page (deprecated)
 */

'use client'

import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

export default function CheckoutSuccessPage() {
  const router = useRouter()

  return (
    <AuthGuard>
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <GlassCard variant="surface" padding="lg" radius="2xl" className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/12 text-brand-primary">
              <DSIcon name="check" size={18} />
            </div>
            <div>
              <h1 className="text-xl font-black text-text-primary">Fluxo legado encerrado</h1>
              <p className="mt-1 text-sm text-text-secondary">
                O checkout de plano de creator foi removido do modelo comercial atual.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border-light bg-bg-tertiary/40 p-4 text-sm text-text-secondary">
            Continue sua operacao em monetizacao de alunos e consultorias no VFIT.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full" onClick={() => router.push('/dashboard/payments')}>
              <DSIcon name="wallet" size={16} />
              Abrir monetizacao
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
              Ir para dashboard
            </Button>
          </div>
        </GlassCard>
      </div>
    </AuthGuard>
  )
}
