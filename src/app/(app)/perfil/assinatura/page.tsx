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
import { ProfileCard, ProfileDetailShell, ProfilePill, ProfileTintCard } from '@/components/profile/settings-shell'
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

  const { data: subStatus, isLoading } = useSubscriptionStatus(pixData && !paymentConfirmed ? 5_000 : undefined)
  const checkout = useVfitCheckout()
  const cancelSub = useCancelSubscription()

  const currentPlan: Plan = (subStatus?.plan_type as Plan) || 'free'
  const isPremium = subStatus?.is_premium ?? false
  const paymentStatus = subStatus?.payment_status

  const [forceCheckout, setForceCheckout] = useState(false)
  useEffect(() => {
    const savedPlan = localStorage.getItem('vfit_selected_plan')
    if (savedPlan && savedPlan !== 'free') {
      setForceCheckout(true)
    }
  }, [])
  const showUpgrade = (!isPremium || forceCheckout) && !pixData

  useEffect(() => {
    if (pixData && !paymentConfirmed && paymentStatus === 'confirmed') {
      setPaymentConfirmed(true)
      setPixData(null)
    }
  }, [pixData, paymentConfirmed, paymentStatus])

  useEffect(() => {
    if (subStatus?.cpf && !cpf) {
      const raw = subStatus.cpf.replace(/\D/g, '')
      if (raw.length === 11) {
        setCpf(raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'))
      }
    }
  }, [subStatus?.cpf, cpf])

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
        setForceCheckout(false)
      }
    } catch {
      // Error handled by mutation
    }
  }, [cpf, selectedPlan, checkout])

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
      <ProfileDetailShell title="Minha assinatura" subtitle="Plano, cobrança e benefícios Premium." icon="creditCard" tone="amber">
        <ProfileCard>
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          </div>
        </ProfileCard>
      </ProfileDetailShell>
    )
  }

  return (
    <ProfileDetailShell
      title="Minha assinatura"
      subtitle="Gerencie seu plano, gere PIX e acompanhe a ativação Premium."
      icon="creditCard"
      tone="amber"
      meta={<ProfilePill tone={isPremium ? 'emerald' : 'slate'}>{isPremium ? 'Premium ativo' : 'Conta gratuita'}</ProfilePill>}
    >
      <div className="space-y-5">
        <ProfileTintCard tone={isPremium ? 'emerald' : 'slate'}>
          <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-[17px] ${isPremium ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-emerald-300'}`}>
              <DSIcon name={isPremium ? 'crown' : 'user'} size={23} />
            </div>
            <div>
              <p className="text-[15px] font-black text-slate-950">{PLAN_DISPLAY[currentPlan].name}</p>
              <p className="text-[12px] font-medium text-slate-600">
                {isPremium && subStatus?.renews_at
                  ? `Ativo · Renova em ${new Date(subStatus.renews_at).toLocaleDateString('pt-BR')}`
                  : 'Conta gratuita'}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {PLAN_DISPLAY[currentPlan].features.map((feature) => (
              <div key={feature} className="flex items-start gap-2 rounded-[16px] bg-white/70 px-3 py-2">
                <DSIcon name="check" size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <span className="text-[12px] font-semibold leading-snug text-slate-600">{feature}</span>
              </div>
            ))}
          </div>
        </ProfileTintCard>

        {paymentConfirmed && (
          <ProfileTintCard tone="emerald" className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <DSIcon name="check" size={28} />
            </div>
            <h2 className="text-lg font-black text-slate-950">Pagamento confirmado</h2>
            <p className="mt-1 text-[13px] font-medium text-slate-600">Sua assinatura Premium foi ativada com sucesso.</p>
            <Button className="mt-4 w-full" onClick={() => router.push('/treinos')}>
              <DSIcon name="sparkles" size={16} />
              Começar a treinar
            </Button>
          </ProfileTintCard>
        )}

        {pixData && (
          <ProfileCard>
            <h2 className="mb-3 text-center text-[15px] font-black text-slate-950">
              <DSIcon name="qrcode" size={18} className="mr-2 inline text-emerald-600" />
              Pague via PIX
            </h2>
            <div className="mb-4 flex justify-center">
              <img
                src={`data:image/png;base64,${pixData.qr_code_base64}`}
                alt="QR Code PIX"
                className="h-48 w-48 rounded-xl bg-white p-2 ring-1 ring-slate-200"
              />
            </div>
            <Button variant="secondary" size="sm" className="w-full" onClick={handleCopy}>
              <DSIcon name={copied ? 'check' : 'copy'} size={16} />
              {copied ? 'Copiado!' : 'Copiar código PIX'}
            </Button>
            <p className="mt-2 text-center text-[10px] font-medium text-slate-500">
              Após o pagamento, sua assinatura será ativada automaticamente
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand-primary" />
              <span className="text-[11px] font-bold text-slate-500">Aguardando pagamento...</span>
            </div>
          </ProfileCard>
        )}

        {showUpgrade && (
          <ProfileCard>
            <p className="mb-3 text-[11px] font-black uppercase text-slate-500">Upgrade para Premium</p>
            <div className="mb-4 space-y-3">
              {(['premium', 'premium_annual'] as const).map((plan) => {
                const display = PLAN_DISPLAY[plan]
                const isSelected = selectedPlan === plan
                const isBest = plan === 'premium_annual'
                return (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => {
                      hapticLight()
                      setSelectedPlan(plan)
                    }}
                    className={`relative min-h-22 w-full rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${isSelected ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    {isBest && (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-brand-primary px-3 py-1 text-[10px] font-black text-slate-950 shadow-sm">
                        Melhor valor
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                        {isSelected && <DSIcon name="check" size={13} className="text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-black text-slate-950">{display.name}</p>
                        <p className="text-[12px] font-medium text-slate-500">
                          <span className="text-lg font-black text-slate-950">{display.price}</span>{display.priceDetail}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <label className="mb-1.5 block text-[12px] font-black text-slate-600" htmlFor="checkout-cpf">CPF</label>
            <input
              id="checkout-cpf"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(event) => setCpf(event.target.value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'))}
              maxLength={14}
              className="mb-4 min-h-13 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[14px] font-semibold text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white"
            />

            <Button className="w-full" loading={checkout.isPending} onClick={handleCheckout} disabled={!cpf || cpf.replace(/\D/g, '').length < 11}>
              <DSIcon name="crown" size={18} />
              Assinar {PLAN_DISPLAY[selectedPlan].name}
            </Button>
            <p className="mt-3 text-center text-[10px] font-medium text-slate-500">Cancele a qualquer momento · Pagamento seguro via PIX</p>
          </ProfileCard>
        )}

        {isPremium && (
          <ProfileCard>
            {!showCancel ? (
              <button
                type="button"
                onClick={() => setShowCancel(true)}
                className="min-h-11 text-[12px] font-black text-slate-500 transition-colors hover:text-red-600"
              >
                Cancelar assinatura
              </button>
            ) : (
              <div className="rounded-[22px] border border-red-200 bg-red-50 p-4">
                <p className="mb-2 text-[14px] font-black text-slate-950">Tem certeza?</p>
                <p className="mb-4 text-[12px] font-medium leading-relaxed text-slate-600">
                  Ao cancelar, você perde acesso aos recursos Premium ao final do período atual. Seus dados serão mantidos.
                </p>
                <div className="flex gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setShowCancel(false)} className="flex-1">
                    Voltar
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1" loading={cancelSub.isPending} onClick={handleCancel}>
                    Confirmar cancelamento
                  </Button>
                </div>
              </div>
            )}
          </ProfileCard>
        )}
      </div>
    </ProfileDetailShell>
  )
}