/**
 * src/app/dashboard/plans/checkout/page.tsx
 *
 * Plan Checkout Page — Payment for platform subscription
 *
 * Exports: CheckoutPage
 * Hooks: useState, useSearchParams, useAuthStore, useCreateCheckout
 * Features: Auth guard · 'use client' · DSIcon · Button · GlassCard · MD3
 */

// ============================================
// Plan Checkout — MD3 Payment Flow
// Supports Pix, boleto, credit card
// ============================================

'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { CheckoutPageSkeleton } from '@/components/ui/page-skeletons'
import {
  useCurrentPlan,
  useCreateCheckout,
  PLAN_NAMES,
  PLAN_PRICES,
  type PlatformPlanSlug,
  type BillingCycle,
} from '@/hooks/use-platform-subscription'

/* ─── Plan visual config ─── */
interface PlanVisual {
  icon: DSIconName
  gradient: string
  badgeColor: string
  glowColor: string
}

const PLAN_VISUALS: Record<PlatformPlanSlug, PlanVisual> = {
  trial: {
    icon: 'user',
    gradient: 'from-zinc-400 to-zinc-600',
    badgeColor: 'bg-zinc-500/10 text-zinc-400',
    glowColor: 'rgba(161,161,170,0.1)',
  },
  pro: {
    icon: 'rocket',
    gradient: 'from-emerald-400 to-emerald-600',
    badgeColor: 'bg-brand-primary/10 text-brand-primary',
    glowColor: 'rgba(16,185,129,0.1)',
  },
  profissional: {
    icon: 'star',
    gradient: 'from-violet-400 to-violet-600',
    badgeColor: 'bg-violet-500/10 text-violet-400',
    glowColor: 'rgba(139,92,246,0.1)',
  },
  max: {
    icon: 'crown',
    gradient: 'from-amber-400 to-amber-600',
    badgeColor: 'bg-amber-500/10 text-amber-400',
    glowColor: 'rgba(245,158,11,0.1)',
  },
}

/* ─── Payment Method Card ─── */
function PaymentMethodCard({
  name,
  description,
  icon,
  selected,
  onSelect,
  badge,
}: {
  name: string
  description: string
  icon: DSIconName
  selected: boolean
  onSelect: () => void
  badge?: string
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300',
        selected
          ? 'border-brand-primary/40 bg-brand-primary/5 shadow-[0_0_20px_rgba(16,185,129,0.08)] ring-1 ring-brand-primary/20'
          : 'border-border-light bg-bg-secondary/50 hover:bg-bg-secondary/80 hover:border-border-light/80'
      )}
    >
      {/* Radio indicator */}
      <div className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
        selected
          ? 'border-brand-primary bg-brand-primary'
          : 'border-text-muted/30 bg-transparent'
      )}>
        {selected && (
          <div className="h-2 w-2 rounded-full bg-white" />
        )}
      </div>

      {/* Icon */}
      <div className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
        selected ? 'bg-brand-primary/15 text-brand-primary' : 'bg-bg-tertiary text-text-secondary'
      )}>
        <DSIcon name={icon} size={18} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-text-primary">{name}</p>
          {badge && (
            <span className="rounded-md bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
    </button>
  )
}

/* ─── Checkout Content (needs searchParams) ─── */
function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPlan = useCurrentPlan()
  const createCheckout = useCreateCheckout()

  // Parse URL params
  const planSlug = (searchParams.get('plan') || 'pro') as PlatformPlanSlug
  const billingParam = searchParams.get('billing') as BillingCycle | null
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(billingParam || 'monthly')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix')

  const planName = PLAN_NAMES[planSlug] || 'Trainer'
  const planVisual = PLAN_VISUALS[planSlug] || PLAN_VISUALS.pro
  const prices = PLAN_PRICES[planSlug] || PLAN_PRICES.pro

  const totalPrice = billingCycle === 'annual' ? prices.annual : prices.monthly
  const savings = billingCycle === 'annual' ? prices.monthly * 12 - prices.annual : 0

  const isUpgrade = currentPlan.isUpgradeFrom(planSlug)

  async function handleCheckout() {
    const checkout = await createCheckout.mutateAsync({
      plan_slug: planSlug,
      billing_cycle: billingCycle,
      payment_method: paymentMethod,
    })

    // For credit card without tokenized card data, Asaas creates a payment link
    // Redirect to Asaas checkout page (invoiceUrl) where user enters card details
    if (paymentMethod === 'credit_card' && checkout.checkout_url) {
      window.location.href = checkout.checkout_url
      return
    }

    // Build success page URL with payment result data
    const params = new URLSearchParams({
      plan: planSlug,
      amount: checkout.amount.toFixed(2).replace('.', ','),
      method: paymentMethod,
      status: 'pending', // Always pending — webhook confirms later
    })

    if (checkout.pix_copy_paste) params.set('pix_code', checkout.pix_copy_paste)
    if (checkout.boleto_url) params.set('boleto_url', checkout.boleto_url)
    if (checkout.due_date) params.set('expires_at', checkout.due_date)

    // Store QR code image in sessionStorage (base64 is too large for URL)
    if (checkout.pix_qr_code) {
      try { sessionStorage.setItem('pix_qr_image', checkout.pix_qr_code) } catch {}
    }

    router.push(`/dashboard/plans/checkout/success?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-12">
      {/* ─── Back + Title ─── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/plans')}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-bg-secondary/50 text-text-secondary hover:bg-bg-tertiary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
        </button>
        <div>
          <h1 className="text-xl font-black text-text-primary tracking-tight">
            {isUpgrade ? 'Upgrade para' : 'Assinar'} {planName}
          </h1>
          <p className="text-sm text-text-secondary">Complete seu pagamento para ativar o plano</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ─── LEFT: Payment Form ─── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Billing Cycle */}
          <GlassCard variant="surface" padding="lg" radius="2xl">
            <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <DSIcon name="calendar" size={16} className="text-brand-primary" />
              Ciclo de cobrança
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all duration-200',
                  billingCycle === 'monthly'
                    ? 'border-brand-primary/40 bg-brand-primary/5 ring-1 ring-brand-primary/20'
                    : 'border-border-light bg-bg-tertiary/50 hover:bg-bg-tertiary'
                )}
              >
                <p className="text-sm font-bold text-text-primary">Mensal</p>
                <p className="text-lg font-black text-text-primary mt-1">
                  R$ {prices.monthly.toFixed(2).replace('.', ',')}
                  <span className="text-xs font-medium text-text-muted ml-1">/mês</span>
                </p>
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={cn(
                  'relative rounded-xl border p-4 text-left transition-all duration-200',
                  billingCycle === 'annual'
                    ? 'border-brand-primary/40 bg-brand-primary/5 ring-1 ring-brand-primary/20'
                    : 'border-border-light bg-bg-tertiary/50 hover:bg-bg-tertiary'
                )}
              >
                <span className="absolute -top-2 right-3 rounded-md bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  -20%
                </span>
                <p className="text-sm font-bold text-text-primary">Anual</p>
                <p className="text-lg font-black text-text-primary mt-1">
                  R$ {(prices.annual / 12).toFixed(2).replace('.', ',')}
                  <span className="text-xs font-medium text-text-muted ml-1">/mês</span>
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  R$ {prices.annual.toFixed(2).replace('.', ',')} /ano
                </p>
              </button>
            </div>
          </GlassCard>

          {/* Payment Method */}
          <GlassCard variant="surface" padding="lg" radius="2xl">
            <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <DSIcon name="creditCard" size={16} className="text-brand-primary" />
              Forma de pagamento
            </h2>
            <div className="space-y-3">
              <PaymentMethodCard
                name="Pix"
                description="Aprovação instantânea via QR Code"
                icon="zap"
                selected={paymentMethod === 'pix'}
                onSelect={() => setPaymentMethod('pix')}
                badge="RECOMENDADO"
              />
              <PaymentMethodCard
                name="Cartão de Crédito"
                description="Visa, Master, Elo, Amex — até 12x"
                icon="creditCard"
                selected={paymentMethod === 'credit_card'}
                onSelect={() => setPaymentMethod('credit_card')}
              />
              <PaymentMethodCard
                name="Boleto Bancário"
                description="Compensação em até 3 dias úteis"
                icon="barChart"
                selected={paymentMethod === 'boleto'}
                onSelect={() => setPaymentMethod('boleto')}
              />
            </div>
          </GlassCard>
        </div>

        {/* ─── RIGHT: Order Summary ─── */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 space-y-4">
            <GlassCard variant="surface" padding="lg" radius="2xl">
              <h2 className="text-sm font-bold text-text-primary mb-4">
                Resumo do pedido
              </h2>

              {/* Plan card mini */}
              <div className={cn(
                'rounded-xl border p-4 mb-4',
                'border-border-light/50 bg-bg-tertiary/30'
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    planVisual.badgeColor
                  )}>
                    <DSIcon name={planVisual.icon} size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      Plano {planName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {billingCycle === 'annual' ? 'Cobrança anual' : 'Cobrança mensal'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    Plano {planName} ({billingCycle === 'annual' ? 'anual' : 'mensal'})
                  </span>
                  <span className="font-semibold text-text-primary">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {savings > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-primary font-medium">Economia anual</span>
                    <span className="font-bold text-brand-primary">
                      -R$ {savings.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-border-light mb-4" />

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-text-primary">Total</span>
                <div className="text-right">
                  <span className="text-xl font-black text-text-primary">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  {billingCycle === 'annual' && (
                    <p className="text-xs text-text-muted">
                      = R$ {(totalPrice / 12).toFixed(2).replace('.', ',')} /mês
                    </p>
                  )}
                </div>
              </div>

              {/* CTA */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                loading={createCheckout.isPending}
                onClick={handleCheckout}
              >
                <DSIcon name="shieldCheck" size={16} />
                {paymentMethod === 'pix' ? 'Gerar QR Code Pix' : paymentMethod === 'credit_card' ? 'Pagar com cartão' : 'Gerar boleto'}
              </Button>

              {/* Security badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-text-muted">
                <div className="flex items-center gap-1 text-xs">
                  <DSIcon name="shieldCheck" size={12} />
                  <span>SSL 256-bit</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <DSIcon name="lock" size={12} />
                  <span>Asaas</span>
                </div>
              </div>
            </GlassCard>

            {/* Guarantee */}
            <div className="rounded-xl border border-brand-primary/15 bg-brand-primary/5 p-3 flex items-center gap-2.5">
              <DSIcon name="shieldCheck" size={16} className="text-brand-primary shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">
                <strong className="text-text-primary">Garantia de 7 dias.</strong> Não gostou? Devolvemos 100%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <CheckoutPageSkeleton />
      }>
        <CheckoutContent />
      </Suspense>
    </AuthGuard>
  )
}
