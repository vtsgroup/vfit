/**
 * src/app/(app)/perfil/assinatura/page.tsx
 *
 * Minha Assinatura — plano atual, upgrade, cancelar
 * Sprint S4 — B2C Payment Infrastructure
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
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

const TRUST_SIGNALS: Array<{ icon: DSIconName; title: string; detail: string }> = [
  { icon: 'shieldCheck', title: 'SSL ativo', detail: 'Sessão criptografada' },
  { icon: 'lock', title: 'PIX seguro', detail: 'Asaas + VFIT' },
  { icon: 'server', title: 'Webhook', detail: 'Ativação automática' },
]

const PREMIUM_HIGHLIGHTS: Array<{ icon: DSIconName; title: string; detail: string }> = [
  { icon: 'aiBot', title: 'Treinos com IA', detail: 'Planos sob medida e ajustes contínuos.' },
  { icon: 'chart', title: 'Progresso visível', detail: 'Métricas, streaks e evolução do plano.' },
  { icon: 'zap', title: 'Rotina guiada', detail: 'Menos fricção para treinar com consistência.' },
]

const PIX_STEPS: Array<{ icon: DSIconName; title: string; detail: string }> = [
  { icon: 'copy', title: 'Copie o código', detail: 'Use o Pix Copia e Cola no banco.' },
  { icon: 'wifi', title: 'Pague no banco', detail: 'A confirmação chega pelo webhook.' },
  { icon: 'sparkles', title: 'Premium ativa', detail: 'Liberamos tudo automaticamente.' },
]

const SECURITY_PROMISES: Array<{ icon: DSIconName; title: string }> = [
  { icon: 'lock', title: 'TLS seguro' },
  { icon: 'shieldCheck', title: 'Dados protegidos' },
  { icon: 'server', title: 'Webhook Asaas' },
  { icon: 'refresh', title: 'Atualiza a cada 5s' },
]

export default function AssinaturaPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'premium_annual'>('premium_annual')
  const [showCancel, setShowCancel] = useState(false)
  const [cpf, setCpf] = useState('')
  const [pixData, setPixData] = useState<{ qr_code_base64: string; copy_paste: string; expiration?: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [autoCheckoutReady, setAutoCheckoutReady] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  const { data: subStatus, isLoading } = useSubscriptionStatus(pixData && !paymentConfirmed ? 5_000 : undefined)
  const checkout = useVfitCheckout()
  const cancelSub = useCancelSubscription()

  const currentPlan: Plan = (subStatus?.plan_type as Plan) || 'free'
  const isPremium = subStatus?.is_premium ?? false
  const paymentStatus = subStatus?.payment_status
  const selectedDisplay = PLAN_DISPLAY[selectedPlan]
  const cpfReady = cpf.replace(/\D/g, '').length === 11
  const pixCodePreview = pixData?.copy_paste ? `${pixData.copy_paste.slice(0, 42)}...${pixData.copy_paste.slice(-10)}` : ''
  const pixExpirationLabel = pixData?.expiration ? new Date(pixData.expiration).toLocaleString('pt-BR') : null

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
          expiration: result.pix.expiration,
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
        <ProfileCard className="overflow-hidden border-0 bg-slate-950 p-0 text-white shadow-[0_24px_58px_-34px_rgba(2,6,23,0.9)]">
          <div className="relative p-5">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-emerald-300/18 via-transparent to-slate-700/40" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card-lg border border-emerald-300/20 bg-emerald-300/12 text-emerald-200 shadow-glass-inset-md">
                <DSIcon name={isPremium ? 'crown' : 'shieldCheck'} size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase text-emerald-200">Ambiente seguro VFIT</p>
                <h2 className="mt-1 text-[24px] font-black leading-tight text-white">
                  Pagamento protegido e ativação automática
                </h2>
                <p className="mt-2 text-[13px] font-medium leading-6 text-slate-300">
                  Seu PIX é processado via Asaas, monitorado por webhook e confirmado no app sem precisar enviar comprovante.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-5 grid grid-cols-3 gap-2">
              {TRUST_SIGNALS.map((signal) => (
                <div key={signal.title} className="rounded-[18px] border border-white/10 bg-white/7 p-3 backdrop-blur-xl">
                  <DSIcon name={signal.icon} size={17} className="text-emerald-200" />
                  <p className="mt-2 text-[10px] font-black text-white">{signal.title}</p>
                  <p className="mt-0.5 text-[9px] font-medium leading-tight text-slate-400">{signal.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </ProfileCard>

        <ProfileTintCard tone={isPremium ? 'emerald' : 'slate'} className="overflow-hidden p-0">
          <div className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-card-lg ${isPremium ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-950 text-emerald-300'}`}>
                <DSIcon name={isPremium ? 'crown' : 'user'} size={25} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-black text-slate-950">{PLAN_DISPLAY[currentPlan].name}</p>
                <p className="text-[12px] font-semibold text-slate-600">
                  {isPremium && subStatus?.renews_at
                    ? `Ativo · Renova em ${new Date(subStatus.renews_at).toLocaleDateString('pt-BR')}`
                    : 'Conta gratuita · pronta para upgrade'}
                </p>
              </div>
              <ProfilePill tone={isPremium ? 'emerald' : 'slate'}>
                {isPremium ? 'Ativo' : 'Free'}
              </ProfilePill>
            </div>

            <div className="space-y-2">
              {PLAN_DISPLAY[currentPlan].features.slice(0, 4).map((feature) => (
                <div key={feature} className="flex items-start gap-2 rounded-[16px] border border-white/70 bg-white/78 px-3 py-2 shadow-sm">
                  <DSIcon name="check" size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span className="text-[12px] font-semibold leading-snug text-slate-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </ProfileTintCard>

        {paymentConfirmed && (
          <ProfileTintCard tone="emerald" className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <DSIcon name="check" size={30} />
            </div>
            <h2 className="text-xl font-black text-slate-950">Pagamento confirmado</h2>
            <p className="mt-1 text-[13px] font-semibold leading-6 text-slate-600">Sua assinatura Premium foi ativada automaticamente pelo webhook.</p>
            <Button className="mt-4 w-full" onClick={() => router.push('/treinos')}>
              <DSIcon name="sparkles" size={16} />
              Começar a treinar
            </Button>
          </ProfileTintCard>
        )}

        {pixData && (
          <ProfileCard className="overflow-hidden border-0 bg-slate-950 p-0 text-white shadow-[0_28px_72px_-38px_rgba(2,6,23,0.95)]">
            <div className="relative overflow-hidden px-5 pb-5 pt-5">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-emerald-300/20 via-slate-950 to-slate-900" />
              <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-300/18 blur-3xl" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 text-[10px] font-black uppercase text-emerald-100">
                    <DSIcon name="lock" size={12} /> Checkout protegido
                  </span>
                  <h2 className="mt-3 text-[26px] font-black leading-tight text-white">PIX Premium VFIT</h2>
                  <p className="mt-2 text-[12px] font-semibold leading-5 text-slate-300">
                    Copie o código, pague no banco e mantenha esta tela aberta para receber a ativação automática.
                  </p>
                </div>
                <div className="rounded-card-lg border border-white/10 bg-white/8 px-3 py-2 text-right backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase text-slate-400">Valor</p>
                  <p className="text-[15px] font-black text-white">{selectedDisplay.price}</p>
                </div>
              </div>

              <div className="relative z-10 mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SECURITY_PROMISES.map((item) => (
                  <div key={item.title} className="rounded-[16px] border border-white/10 bg-white/7 px-3 py-2.5 shadow-glass-inset-sm">
                    <DSIcon name={item.icon} size={15} className="text-emerald-200" />
                    <p className="mt-1.5 text-[9px] font-black leading-tight text-slate-200">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-linear-to-b from-white to-emerald-50/70 p-5 text-slate-950">
              <div className="grid gap-4 lg:grid-cols-[auto,1fr] lg:items-start">
                <div className="mx-auto rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.42)]">
                  <div className="rounded-[26px] border border-emerald-100 bg-emerald-50/55 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${pixData.qr_code_base64}`}
                      alt="QR Code PIX para pagamento da assinatura VFIT"
                      className="h-60 w-60 rounded-[18px] bg-white object-contain"
                    />
                  </div>
                </div>

                <div className="min-w-0 space-y-3">
                  <div className={`rounded-2xl border p-4 transition-all ${copied ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-[14px] ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <DSIcon name={copied ? 'check' : 'copy'} size={17} />
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-slate-900">{copied ? 'Código copiado' : 'Pix Copia e Cola'}</p>
                          <p className="text-[10px] font-semibold text-slate-500">{copied ? 'Agora finalize no seu banco' : 'Use o código abaixo se preferir não escanear'}</p>
                        </div>
                      </div>
                      <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-slate-950 px-2.5 text-[9px] font-black text-emerald-200">
                        <DSIcon name="shieldCheck" size={11} /> Seguro
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-[15px] border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="truncate font-mono text-[11px] text-slate-500">{pixCodePreview}</p>
                    </div>
                  </div>

                  <Button variant="secondary" size="lg" className="w-full" onClick={handleCopy}>
                    <DSIcon name={copied ? 'check' : 'copy'} size={18} />
                    {copied ? 'PIX copiado com segurança' : 'Copiar código PIX'}
                  </Button>

                  <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-[12px] font-black text-slate-800">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(34,197,94,0.12)]" />
                      Aguardando webhook do pagamento
                    </div>
                    <p className="mt-2 text-[12px] font-medium leading-6 text-slate-500">
                      Assim que o banco confirma o PIX, o Asaas envia o webhook para o VFIT e sua assinatura é liberada automaticamente nesta tela.
                    </p>
                    {pixExpirationLabel && (
                      <p className="mt-3 rounded-full bg-amber-50 px-3 py-2 text-center text-[10px] font-black text-amber-700">
                        Código válido até {pixExpirationLabel}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {PIX_STEPS.map((step, index) => {
                  const isDone = copied && index === 0
                  const isActive = index === 1
                  return (
                    <div key={step.title} className={`flex items-center gap-3 rounded-card-lg border px-3 py-3 ${isDone ? 'border-emerald-200 bg-emerald-50' : isActive ? 'border-emerald-200 bg-white shadow-sm' : 'border-slate-200 bg-white/80'}`}>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] ${isDone ? 'bg-emerald-600 text-white' : isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <DSIcon name={isDone ? 'check' : step.icon} size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-black text-slate-800">{step.title}</p>
                        <p className="text-[10px] font-semibold text-slate-500">{step.detail}</p>
                      </div>
                      {isActive && <DSIcon name="refresh" size={15} className="animate-spin text-emerald-600" />}
                    </div>
                  )
                })}
              </div>
            </div>
          </ProfileCard>
        )}

        {showUpgrade && (
          <ProfileCard className="overflow-hidden border-slate-200 bg-white p-0">
            <div className="bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 px-5 py-5 text-white">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase text-emerald-200">Upgrade para Premium</p>
                  <h2 className="mt-1 text-[25px] font-black leading-tight">Escolha seu plano</h2>
                </div>
                <div className="flex h-13 w-13 items-center justify-center rounded-card-lg border border-emerald-300/20 bg-emerald-300/12 text-emerald-200">
                  <DSIcon name="crown" size={25} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PREMIUM_HIGHLIGHTS.map((item) => (
                  <div key={item.title} className="rounded-[17px] border border-white/10 bg-white/7 p-3">
                    <DSIcon name={item.icon} size={16} className="text-emerald-200" />
                    <p className="mt-2 text-[9px] font-black leading-tight text-white">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5">
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
                      className={`relative min-h-24 w-full rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${isSelected ? 'border-emerald-300 bg-emerald-50 shadow-[0_18px_44px_-34px_rgba(5,150,105,0.55)]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    >
                      {isBest && (
                        <span className="absolute -top-2.5 right-4 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow-lg shadow-emerald-500/20">
                          Melhor valor
                        </span>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                          {isSelected && <DSIcon name="check" size={14} className="text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-black text-slate-950">{display.name}</p>
                          <p className="text-[12px] font-semibold text-slate-500">
                            <span className="text-xl font-black text-slate-950">{display.price}</span>{display.priceDetail}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-black text-slate-700" htmlFor="checkout-cpf">
                <DSIcon name="lock" size={13} className="text-emerald-600" />
                CPF para emissão segura
              </label>
              <div className="relative mb-4">
                <input
                  id="checkout-cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(event) => setCpf(event.target.value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'))}
                  maxLength={14}
                  className="min-h-14 w-full rounded-card-lg border border-slate-200 bg-slate-50 px-4 pr-12 text-[15px] font-bold text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
                <DSIcon name={cpfReady ? 'checkCircle2' : 'fingerprint'} size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 ${cpfReady ? 'text-emerald-600' : 'text-slate-400'}`} />
              </div>

              <Button className="w-full" size="lg" loading={checkout.isPending} onClick={handleCheckout} disabled={!cpfReady}>
                <DSIcon name="crown" size={18} />
                Assinar {selectedDisplay.name}
              </Button>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {TRUST_SIGNALS.map((signal) => (
                  <div key={signal.title} className="rounded-[16px] border border-slate-200 bg-slate-50 px-2 py-2">
                    <DSIcon name={signal.icon} size={15} className="mx-auto text-slate-500" />
                    <p className="mt-1 text-[9px] font-black text-slate-600">{signal.title}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-[10px] font-semibold text-slate-500">Cancele a qualquer momento · Pagamento seguro via PIX</p>
            </div>
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