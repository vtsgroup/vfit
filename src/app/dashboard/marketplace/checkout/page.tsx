/**
 * src/app/dashboard/marketplace/checkout/page.tsx
 *
 * Marketplace Checkout — Purchase workout plan
 *
 * Exports: MarketplaceCheckoutPage
 * Hooks: useState, useSearchParams, usePlanDetail, useBuyPlan
 * Features: Auth guard · 'use client' · DSIcon · Button · GlassCard · MD3
 * Split: 70% creator / 30% platform (FEES.marketplace_creator_share)
 */

// ============================================
// Marketplace Checkout — MD3 Payment Flow
// Pay for a workout plan from another personal
// ============================================

'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { cn, formatCurrency } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { CheckoutPageSkeleton } from '@/components/ui/page-skeletons'
import {
  usePlanDetail,
  useBuyPlan,
  usePurchaseStatus,
  categoryLabels,
  difficultyLabels,
  difficultyColors,
  type BuyPlanResult,
} from '@/hooks/use-marketplace'
import { FEES } from '@config/constants'

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
      <div className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
        selected ? 'border-brand-primary bg-brand-primary' : 'border-text-muted/30 bg-transparent'
      )}>
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>

      <div className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
        selected ? 'bg-brand-primary/15 text-brand-primary' : 'bg-bg-tertiary text-text-secondary'
      )}>
        <DSIcon name={icon} size={18} />
      </div>

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

/* ─── Checkout Content ─── */
function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan')
  const { data, isLoading } = usePlanDetail(planId)
  const buyPlan = useBuyPlan()
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix')
  const [cpf, setCpf] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [pixData, setPixData] = useState<BuyPlanResult | null>(null)
  const [copied, setCopied] = useState(false)

  const purchaseStatus = usePurchaseStatus(
    pixData?.purchase_id ?? null,
    pixData ? 5000 : undefined
  )
  const isConfirmed = purchaseStatus.data?.status === 'completed'
  const isDelivered = purchaseStatus.data?.delivered === true

  const plan = data?.plan

  if (isLoading) {
    return <CheckoutPageSkeleton />
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <DSIcon name="alertTriangle" size={40} className="text-warning" />
        <h2 className="text-lg font-bold text-text-primary">Plano não encontrado</h2>
        <p className="text-sm text-text-secondary max-w-md">
          O plano que você está tentando comprar não existe ou foi removido.
        </p>
        <Button variant="outline" onClick={() => router.push('/dashboard/marketplace')}>
          <DSIcon name="arrowLeft" size={14} />
          Voltar ao Marketplace
        </Button>
      </div>
    )
  }

  const creatorShare = plan.price_brl * (FEES.marketplace_creator_share / 100)

  async function handleCheckout() {
    if (!planId) return
    const digits = cpf.replace(/\D/g, '')
    if (digits.length !== 11) {
      setCpfError('Informe um CPF válido (11 dígitos)')
      return
    }
    setCpfError('')
    try {
      const result = await buyPlan.mutateAsync({ planId, cpf: digits })
      setPixData(result)
    } catch {
      // erro já exibido via toast do hook
    }
  }

  async function handleCopyPix() {
    if (!pixData?.pix.copy_paste) return
    try {
      await navigator.clipboard.writeText(pixData.pix.copy_paste)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch { /* clipboard indisponível */ }
  }

  // ─── Tela PIX: QR + aguardando confirmação / sucesso ───
  if (pixData) {
    return (
      <div className="w-full max-w-lg mx-auto space-y-6 pb-12">
        <GlassCard variant="surface" padding="lg" radius="2xl">
          {isConfirmed ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/15">
                <DSIcon name="checkCircle" size={32} className="text-brand-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-primary">Compra confirmada!</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {isDelivered
                    ? `"${plan.title}" já está na sua biblioteca. Bom treino!`
                    : `Pagamento confirmado! "${plan.title}" será liberado em instantes.`}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 pt-2">
                <Button variant="primary" size="lg" className="w-full" onClick={() => router.push('/plano')}>
                  <DSIcon name="dumbbell" size={16} />
                  Ver meu plano
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/marketplace')}>
                  Voltar ao marketplace
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div>
                <h2 className="text-xl font-black text-text-primary">Pague com Pix</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Escaneie o QR Code ou copie o código. Total: <strong className="text-text-primary">{formatCurrency(pixData.amount)}</strong>
                </p>
              </div>

              <div className="rounded-2xl border border-border-light bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${pixData.pix.qr_code_base64}`}
                  alt={`QR Code PIX para compra do plano ${plan.title}`}
                  className="h-56 w-56 rounded-xl bg-white object-contain"
                />
              </div>

              <Button variant="outline" className="w-full" onClick={handleCopyPix}>
                <DSIcon name={copied ? 'check' : 'copy'} size={14} />
                {copied ? 'Código copiado!' : 'Copiar código Pix'}
              </Button>

              <div className="flex items-center gap-2 rounded-xl bg-bg-tertiary/50 px-4 py-2.5">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary" />
                </div>
                <span className="text-xs text-text-secondary">
                  Aguardando pagamento — confirmação automática
                </span>
              </div>

              <p className="text-[11px] text-text-muted">
                Após o pagamento, o plano é clonado automaticamente para sua biblioteca.
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-12">
      {/* ─── Back + Title ─── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-bg-secondary/50 text-text-secondary hover:bg-bg-tertiary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
        </button>
        <div>
          <h1 className="text-xl font-black text-text-primary tracking-tight">
            Comprar plano de treino
          </h1>
          <p className="text-sm text-text-secondary">Finalize o pagamento para acessar o conteúdo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ─── LEFT: Plan Info + Payment ─── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Plan Preview */}
          <GlassCard variant="surface" padding="lg" radius="2xl">
            <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <DSIcon name="layers" size={16} className="text-brand-primary" />
              Detalhes do plano
            </h2>

            {/* Plan thumbnail + info */}
            <div className="flex gap-4">
              {plan.thumbnail_url ? (
                <Image
                  src={plan.thumbnail_url}
                  alt={plan.title}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-xl object-cover shrink-0"
                  unoptimized
                />
              ) : (
                <div className="h-24 w-24 rounded-xl bg-bg-tertiary flex items-center justify-center shrink-0">
                  <DSIcon name="dumbbell" size={24} className="text-text-muted" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 className="text-base font-bold text-text-primary leading-tight truncate">
                  {plan.title}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2">{plan.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-md bg-brand-primary/10 text-brand-primary px-2 py-0.5 text-[10px] font-bold">
                    {categoryLabels[plan.category]}
                  </span>
                  <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-bold', difficultyColors[plan.difficulty])}>
                    {difficultyLabels[plan.difficulty]}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted pt-0.5">
                  <span className="flex items-center gap-1">
                    <DSIcon name="calendar" size={11} />
                    {plan.duration_weeks} semanas
                  </span>
                  <span className="flex items-center gap-1">
                    <DSIcon name="dumbbell" size={11} />
                    {plan.workouts_per_week}x/semana
                  </span>
                  <span className="flex items-center gap-1">
                    <DSIcon name="user" size={11} />
                    {plan.creator_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats + Urgency */}
            {plan.total_sales > 0 && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-bg-tertiary/50 px-3 py-2">
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <DSIcon name="users" size={12} />
                  <span className="font-semibold text-text-primary">{plan.total_sales}</span> vendas
                </div>
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <DSIcon name="star" size={12} className="text-amber-400" />
                  <span className="font-semibold text-text-primary">Popular</span>
                </div>
              </div>
            )}

            {/* Urgency social proof */}
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500/5 border border-amber-500/10 px-3 py-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </div>
              <span className="text-xs text-text-secondary">
                <strong className="text-amber-400">{Math.floor(Math.random() * 8) + 3} pessoas</strong> estão vendo este plano agora
              </span>
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
                description="Em breve — use Pix por enquanto"
                icon="creditCard"
                selected={false}
                onSelect={() => setPaymentMethod('pix')}
                badge="EM BREVE"
              />
              <PaymentMethodCard
                name="Boleto Bancário"
                description="Em breve — use Pix por enquanto"
                icon="barChart"
                selected={false}
                onSelect={() => setPaymentMethod('pix')}
                badge="EM BREVE"
              />
            </div>
          </GlassCard>

          {/* Split info */}
          <div className="rounded-xl border border-border-light/50 bg-bg-secondary/30 p-4">
            <h3 className="text-xs font-bold text-text-primary mb-2 flex items-center gap-1.5">
              <DSIcon name="info" size={12} className="text-info" />
              Como funciona o pagamento
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-brand-primary" />
                  <span className="text-text-secondary">Criador do plano recebe</span>
                </div>
                <span className="font-bold text-brand-primary">{FEES.marketplace_creator_share}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-violet-400" />
                  <span className="text-text-secondary">Taxa da plataforma</span>
                </div>
                <span className="font-bold text-violet-400">{FEES.marketplace_platform_share}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-bg-tertiary overflow-hidden flex mt-1">
                <div className="h-full bg-brand-primary" style={{ width: `${FEES.marketplace_creator_share}%` }} />
                <div className="h-full bg-violet-400" style={{ width: `${FEES.marketplace_platform_share}%` }} />
              </div>
              <p className="text-[10px] text-text-muted pt-0.5">
                O valor de {formatCurrency(creatorShare)} vai direto para o criador {plan.creator_name}.
              </p>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Order Summary ─── */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 space-y-4">
            <GlassCard variant="surface" padding="lg" radius="2xl">
              <h2 className="text-sm font-bold text-text-primary mb-4">
                Resumo do pedido
              </h2>

              {/* Price line */}
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary truncate pr-2">{plan.title}</span>
                  <span className="font-semibold text-text-primary shrink-0">
                    {formatCurrency(plan.price_brl)}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border-light mb-4" />

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-text-primary">Total</span>
                <span className="text-xl font-black text-text-primary">
                  {formatCurrency(plan.price_brl)}
                </span>
              </div>

              {/* CPF (obrigatório no Asaas) */}
              <div className="mb-4">
                <label htmlFor="checkout-cpf" className="mb-1.5 block text-xs font-bold text-text-primary">
                  CPF do titular
                </label>
                <input
                  id="checkout-cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="h-12 w-full rounded-xl border border-border-light bg-bg-secondary/50 px-4 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary/50 focus:outline-none"
                />
                {cpfError && (
                  <p className="mt-1.5 text-xs font-semibold text-error">{cpfError}</p>
                )}
              </div>

              {/* CTA */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                loading={buyPlan.isPending}
                onClick={handleCheckout}
              >
                <DSIcon name="shieldCheck" size={16} />
                Pagar com Pix
              </Button>

              {/* Security */}
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

            {/* Includes */}
            <GlassCard variant="surface" padding="md" radius="2xl">
              <h3 className="text-xs font-bold text-text-primary mb-3">O que está incluído</h3>
              <ul className="space-y-2">
                {[
                  'Plano completo de treino',
                  `${plan.duration_weeks} semanas de programação`,
                  `${plan.workouts_per_week} treinos por semana`,
                  'Acesso vitalício ao conteúdo',
                  'Treinos clonados para sua biblioteca',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-text-secondary">
                    <DSIcon name="check" size={12} className="text-brand-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>

            {/* Guarantee */}
            <div className="rounded-xl border border-brand-primary/15 bg-brand-primary/5 p-3 flex items-center gap-2.5">
              <DSIcon name="shieldCheck" size={16} className="text-brand-primary shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">
                <strong className="text-text-primary">Satisfação garantida.</strong> O treino é clonado direto para sua biblioteca.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function MarketplaceCheckoutPage() {
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
