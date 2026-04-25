/**
 * src/app/(app)/perfil/assinatura/page.tsx
 *
 * Minha Assinatura — plano atual, upgrade, cancelar
 * Sprint S4 — B2C Payment Infrastructure
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { hapticLight } from '@/lib/haptics'
import { VFIT_PLANS } from '@config/constants'
import { formatBRL, getB2CMonthlyEquivalent } from '@lib/pricing'
import { useSubscriptionStatus, useVfitCheckout, useCancelSubscription } from '@/hooks/use-vfit-checkout'

type Plan = 'free' | 'premium' | 'premium_annual'

const PLAN_DISPLAY: Record<Plan, { name: string; price: string; priceDetail: string; features: string[] }> = {
  free: {
    name: VFIT_PLANS.free.name,
    price: 'Grátis',
    priceDetail: '',
    features: VFIT_PLANS.free.features as unknown as string[],
  },
  premium: {
    name: VFIT_PLANS.premium.name,
    price: formatBRL(VFIT_PLANS.premium.price_brl),
    priceDetail: '/mês',
    features: VFIT_PLANS.premium.features as unknown as string[],
  },
  premium_annual: {
    name: VFIT_PLANS.premium_annual.name,
    price: formatBRL(getB2CMonthlyEquivalent('premium_annual')),
    priceDetail: `/mês (${formatBRL(VFIT_PLANS.premium_annual.price_brl)}/ano)`,
    features: VFIT_PLANS.premium_annual.features as unknown as string[],
  },
}

export default function AssinaturaPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'premium_annual'>('premium_annual')
  const [showCancel, setShowCancel] = useState(false)
  const [cpf, setCpf] = useState('')
  const [pixData, setPixData] = useState<{ qr_code_base64: string; copy_paste: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [autoCheckoutReady, setAutoCheckoutReady] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  // Polling a cada 5s quando PIX QR está ativo (detectar pagamento)
  const { data: subStatus, isLoading } = useSubscriptionStatus(pixData && !paymentConfirmed ? 5_000 : undefined)
  const checkout = useVfitCheckout()
  const cancelSub = useCancelSubscription()

  const currentPlan: Plan = (subStatus?.plan_type as Plan) || 'free'
  const isPremium = subStatus?.is_premium ?? false
  const paymentStatus = subStatus?.payment_status

  // Forçar exibição do checkout quando vindo do paywall ou para super_admin testando
  const [forceCheckout, setForceCheckout] = useState(false)
  useEffect(() => {
    const savedPlan = localStorage.getItem('vfit_selected_plan')
    if (savedPlan && savedPlan !== 'free') {
      setForceCheckout(true)
    }
  }, [])
  const showUpgrade = (!isPremium || forceCheckout) && !pixData

  // Detectar quando pagamento foi confirmado via polling (payment_status: pending → confirmed)
  useEffect(() => {
    if (pixData && !paymentConfirmed && paymentStatus === 'confirmed') {
      setPaymentConfirmed(true)
      setPixData(null)
    }
  }, [pixData, paymentConfirmed, paymentStatus])

  // Pré-carregar CPF salvo do perfil do usuário (backend)
  useEffect(() => {
    if (subStatus?.cpf && !cpf) {
      const raw = subStatus.cpf.replace(/\D/g, '')
      if (raw.length === 11) {
        setCpf(raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'))
      }
    }
  }, [subStatus?.cpf, cpf])

  // Ler plano e CPF pré-selecionados do onboarding
  useEffect(() => {
    const savedPlan = localStorage.getItem('vfit_selected_plan')
    const savedCpf = localStorage.getItem('vfit_checkout_cpf')
    if (savedPlan && (savedPlan === 'premium' || savedPlan === 'premium_annual')) {
      setSelectedPlan(savedPlan)
      localStorage.removeItem('vfit_selected_plan')
    }
    if (savedCpf && savedCpf.length === 11) {
      setCpf(savedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'))
      localStorage.removeItem('vfit_checkout_cpf')
      if (savedPlan && savedPlan !== 'free') {
        setAutoCheckoutReady(true)
      }
    }
  }, [])

  const handleCheckout = useCallback(async () => {
    if (!cpf || cpf.replace(/\D/g, '').length < 11) return
    hapticLight()
    try {
      const result = await checkout.mutateAsync({ plan: selectedPlan, cpf })
      if (result) {
        setPixData({
          qr_code_base64: result.pix.qr_code_base64,
          copy_paste: result.pix.copy_paste,
        })
        setForceCheckout(false) // Esconder upgrade section após gerar PIX
      }
    } catch {
      // Error handled by mutation
    }
  }, [cpf, selectedPlan, checkout])

  // Auto-checkout após registro com CPF (espera auth + subscription carregar)
  useEffect(() => {
    if (!autoCheckoutReady || isLoading || isPremium || pixData) return
    setAutoCheckoutReady(false)
    handleCheckout()
  }, [autoCheckoutReady, isLoading, isPremium, pixData, handleCheckout])

  const handleCopy = useCallback(() => {
    if (pixData?.copy_paste) {
      navigator.clipboard.writeText(pixData.copy_paste)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [pixData])

  const handleCancel = useCallback(async () => {
    hapticLight()
    await cancelSub.mutateAsync()
    setShowCancel(false)
  }, [cancelSub])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-0 pb-24">
      {/* Header */}
      <div
        className="-mx-4 mb-6 flex items-center gap-3 rounded-b-3xl border-b-0 px-4 py-5 backdrop-blur-md"
        style={{ background: 'linear-gradient(to bottom, #0b1d36 0%, #0c1f38 20%, #0b1c35 40%, #0a1830 65%, #071628 85%, #050A12 100%)', boxShadow: '0 6px 28px 0 rgba(5,10,18,0.6)' }}
      >
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/70 transition-colors hover:text-white"
        >
          <DSIcon name="arrowLeft" size={20} />
        </button>
        <h1 className="text-lg font-bold text-white">Minha Assinatura</h1>
      </div>

      {/* Current plan status */}
      <div className={`mb-6 rounded-2xl border p-5 ${
        isPremium
          ? 'border-brand-primary/25 bg-brand-primary/6'
          : 'border-border-primary bg-bg-secondary'
      }`}>
        <div className="mb-3 flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            isPremium ? 'bg-brand-primary/15 text-brand-primary' : 'bg-bg-tertiary text-text-secondary'
          }`}>
            <DSIcon name={isPremium ? 'crown' : 'user'} size={22} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-text-primary">{PLAN_DISPLAY[currentPlan].name}</p>
            <p className="text-[11px] text-text-secondary">
              {isPremium && subStatus?.renews_at
                ? `Ativo · Renova em ${new Date(subStatus.renews_at).toLocaleDateString('pt-BR')}`
                : 'Conta gratuita'}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          {PLAN_DISPLAY[currentPlan].features.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <DSIcon name="check" size={14} className="shrink-0 text-brand-primary" />
              <span className="text-[12px] text-text-secondary">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pagamento confirmado! */}
      {paymentConfirmed && (
        <div className="mb-6 rounded-2xl border border-brand-primary/30 bg-brand-primary/8 p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/20">
            <DSIcon name="check" size={28} className="text-brand-primary" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Pagamento Confirmado! 🎉</h2>
          <p className="mt-1 text-[13px] text-text-secondary">
            Sua assinatura Premium foi ativada com sucesso.
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => router.push('/treinos')}
          >
            <DSIcon name="sparkles" size={16} />
            Começar a treinar
          </Button>
        </div>
      )}

      {/* PIX QR Code Display */}
      {pixData && (
        <div className="mb-6 rounded-2xl border border-brand-primary/25 bg-bg-secondary p-5">
          <h2 className="mb-3 text-center text-[15px] font-bold text-text-primary">
            <DSIcon name="qrcode" size={18} className="mr-2 inline text-brand-primary" />
            Pague via PIX
          </h2>
          <div className="mb-4 flex justify-center">
            <img
              src={`data:image/png;base64,${pixData.qr_code_base64}`}
              alt="QR Code PIX"
              className="h-48 w-48 rounded-xl bg-white p-2"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={handleCopy}
          >
            <DSIcon name={copied ? 'check' : 'copy'} size={16} />
            {copied ? 'Copiado!' : 'Copiar código PIX'}
          </Button>
          <p className="mt-2 text-center text-[10px] text-text-secondary">
            Após o pagamento, sua assinatura será ativada automaticamente
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-brand-primary" />
            <span className="text-[11px] text-text-secondary">Aguardando pagamento...</span>
          </div>
        </div>
      )}

      {/* Upgrade section (free users, paywall redirect, or super_admin testing) */}
      {showUpgrade && (
        <>
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-text-secondary">
            Upgrade para Premium
          </h2>

          <div className="mb-4 space-y-3">
            {(['premium', 'premium_annual'] as const).map((plan) => {
              const p = PLAN_DISPLAY[plan]
              const isSelected = selectedPlan === plan
              const isBest = plan === 'premium_annual'
              return (
                <button
                  key={plan}
                  onClick={() => {
                    hapticLight()
                    setSelectedPlan(plan)
                  }}
                  className={`relative w-full rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-brand-primary/40 bg-brand-primary/7 shadow-lg shadow-brand-primary/6'
                      : 'border-border-primary bg-bg-secondary hover:bg-bg-tertiary hover:border-brand-primary/18'
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-brand-primary px-3 py-0.5 text-[10px] font-bold text-black">
                      MELHOR VALOR
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-brand-primary bg-brand-primary' : 'border-text-muted'
                    }`}>
                      {isSelected && <DSIcon name="check" size={12} className="text-black" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-text-primary">{p.name}</p>
                      <p className="text-[12px] text-text-secondary">
                        <span className="text-lg font-black text-text-primary">{p.price}</span>
                        {p.priceDetail}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* CPF Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="CPF (obrigatório para PIX)"
              value={cpf}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'))}
              maxLength={14}
              className="w-full rounded-xl border border-border-primary bg-bg-secondary px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted"
            />
          </div>

          <Button
            className="mb-4 w-full"
            loading={checkout.isPending}
            onClick={handleCheckout}
            disabled={!cpf || cpf.replace(/\D/g, '').length < 11}
          >
            <DSIcon name="crown" size={18} />
            Assinar {PLAN_DISPLAY[selectedPlan].name}
          </Button>
          <p className="text-center text-[10px] text-text-secondary">
            Cancele a qualquer momento · Pagamento seguro via PIX
          </p>
        </>
      )}

      {/* Cancel section (only for premium) */}
      {isPremium && (
        <div className="mt-4">
          {!showCancel ? (
            <button
              onClick={() => setShowCancel(true)}
              className="text-[12px] text-text-secondary transition-colors hover:text-red-500"
            >
              Cancelar assinatura
            </button>
          ) : (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="mb-2 text-[14px] font-bold text-text-primary">Tem certeza?</p>
              <p className="mb-4 text-[12px] text-text-secondary">
                Ao cancelar, você perde acesso aos recursos Premium ao final do período atual.
                Seus dados serão mantidos.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancel(false)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  loading={cancelSub.isPending}
                  onClick={handleCancel}
                >
                  Confirmar cancelamento
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
