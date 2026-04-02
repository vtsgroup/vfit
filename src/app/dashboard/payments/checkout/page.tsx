/**
 * src/app/dashboard/payments/checkout/page.tsx
 *
 * Checkout Page — Pagamento in-app para alunos
 *
 * Exports: CheckoutPage
 * Hooks: useState, useEffect, useRef, useSearchParams, usePayment, useCheckoutPay
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Checkout Page — Pagamento in-app para alunos
// PIX (QR Code), Cartão de Crédito, Boleto
// ============================================

'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { CheckoutPageSkeleton } from '@/components/ui/page-skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StyledSelect } from '@/components/ui/styled-select'
import { MD3Input } from '@/components/ui'
import { usePayment, useCheckoutPay, type CheckoutPayResult } from '@/hooks/use-payments'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

type PaymentMethod = 'pix' | 'credit_card' | 'boleto'

function formatCurrency(value: number) {
  const safe = typeof value === 'number' && !isNaN(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe)
}

function detectCardBrand(number: string): string {
  const n = number.replace(/\D/g, '')
  if (n.startsWith('4')) return 'Visa'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard'
  if (n.startsWith('36') || n.startsWith('38') || n.startsWith('30')) return 'Diners'
  if (n.startsWith('34') || n.startsWith('37')) return 'Amex'
  if (n.startsWith('6011') || n.startsWith('65') || n.startsWith('644')) return 'Discover'
  if (/^(636368|438935|504175|451416|636297)/.test(n)) return 'Elo'
  if (n.startsWith('606282') || n.startsWith('384100') || n.startsWith('384140')) return 'Hipercard'
  return ''
}

function formatCardNumber(value: string): string {
  const v = value.replace(/\D/g, '').slice(0, 16)
  const groups = v.match(/.{1,4}/g)
  return groups ? groups.join(' ') : v
}

function formatCpf(value: string): string {
  const v = value.replace(/\D/g, '').slice(0, 11)
  if (v.length <= 3) return v
  if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`
  if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`
  return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`
}

function formatPhone(value: string): string {
  const v = value.replace(/\D/g, '').slice(0, 11)
  if (v.length <= 2) return v
  if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
}

function formatCep(value: string): string {
  const v = value.replace(/\D/g, '').slice(0, 8)
  if (v.length <= 5) return v
  return `${v.slice(0, 5)}-${v.slice(5)}`
}

// ============================================
// Checkout Inner Component
// ============================================

function CheckoutInner() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('id') || ''
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = usePayment(paymentId, { pollingEnabled: true })
  const checkout = useCheckoutPay(paymentId)

  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [checkoutResult, setCheckoutResult] = useState<CheckoutPayResult | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)
  const [copiedBoleto, setCopiedBoleto] = useState(false)
  const [showCvv, setShowCvv] = useState(false)
  const [cardSubmitAttempted, setCardSubmitAttempted] = useState(false)

  // Card form state
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolderName, setCardHolderName] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cvv, setCvv] = useState('')
  const [holderCpf, setHolderCpf] = useState('')
  const [holderPhone, setHolderPhone] = useState('')
  const [holderPostalCode, setHolderPostalCode] = useState('')
  const [holderAddressNumber, setHolderAddressNumber] = useState('')
  const [installmentCount, setInstallmentCount] = useState(1)

  // Detect confirmation via polling
  const prevStatus = useRef<string | null>(null)
  const [justConfirmed, setJustConfirmed] = useState(false)
  const paymentStatus = data?.payment?.status
  useEffect(() => {
    if (!paymentStatus) return
    if (prevStatus.current === 'pending' && paymentStatus === 'confirmed') {
      setJustConfirmed(true)
      setCheckoutResult((prev) => prev ? { ...prev, status: 'confirmed' } : null)
    }
    prevStatus.current = paymentStatus
  }, [paymentStatus])

  const payment = data?.payment

  // Método inicial deve refletir o método já configurado na cobrança.
  useEffect(() => {
    if (!payment || checkoutResult) return
    const m = payment.payment_method as PaymentMethod
    if (m === 'pix' || m === 'credit_card' || m === 'boleto') {
      setMethod(m)
    }
  }, [payment, checkoutResult])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg py-10">
        <div className="rounded-2xl border border-border-light bg-bg-secondary/50 p-6 backdrop-blur-sm space-y-5">
          <div className="h-6 w-40 animate-pulse rounded bg-black/8 dark:bg-white/8" />
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="space-y-1.5"><div className="h-3.5 w-24 animate-pulse rounded bg-black/6 dark:bg-white/6" /><div className="h-10 w-full animate-pulse rounded-xl bg-black/4 dark:bg-white/4" /></div>)}
          </div>
          <div className="h-10 w-32 animate-pulse rounded-xl bg-black/8 dark:bg-white/8" />
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <DSIcon name="alertTriangle" size={48} className="mx-auto text-text-muted mb-4" />
        <p className="text-text-muted">Pagamento não encontrado.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-brand-primary hover:underline">
          Voltar ao dashboard
        </Link>
      </div>
    )
  }

  // Se já está pago
  if (payment.status === 'confirmed' && !checkoutResult) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} /> Voltar
        </Link>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <DSIcon name="checkCircle" size={64} className="mx-auto text-success" />
            <h2 className="text-xl font-black tracking-tight text-success">Pagamento Confirmado!</h2>
            <p className="text-text-muted">
              {formatCurrency(payment.amount)} — pago em{' '}
              {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('pt-BR') : '—'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  function handleSelectMethod(m: PaymentMethod) {
    setMethod(m)
    setCheckoutResult(null)
  }

  async function handlePayPix() {
    checkout.mutate(
      { payment_method: 'pix', cpf: holderCpf.replace(/\D/g, '') || undefined },
      {
        onSuccess: (response) => {
          const result = (response as { data?: CheckoutPayResult })?.data
          if (result) setCheckoutResult(result)
        },
      }
    )
  }

  async function handlePayBoleto() {
    checkout.mutate(
      { payment_method: 'boleto', cpf: holderCpf.replace(/\D/g, '') || undefined },
      {
        onSuccess: (response) => {
          const result = (response as { data?: CheckoutPayResult })?.data
          if (result) setCheckoutResult(result)
        },
      }
    )
  }

  async function handlePayCard(e: React.FormEvent) {
    e.preventDefault()
    setCardSubmitAttempted(true)
    if (!isCardValid) return

    checkout.mutate(
      {
        payment_method: 'credit_card',
        card_holder_name: cardHolderName,
        card_number: cardNumber.replace(/\D/g, ''),
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        ccv: cvv,
        holder_name: cardHolderName,
        holder_email: user?.email,
        holder_cpf: holderCpf.replace(/\D/g, ''),
        holder_phone: holderPhone.replace(/\D/g, ''),
        holder_postal_code: holderPostalCode.replace(/\D/g, ''),
        holder_address_number: holderAddressNumber,
        installment_count: installmentCount > 1 ? installmentCount : undefined,
      },
      {
        onSuccess: (response) => {
          const result = (response as { data?: CheckoutPayResult })?.data
          if (result) setCheckoutResult(result)
        },
      }
    )
  }

  function copyPixPayload() {
    if (checkoutResult?.pix?.payload) {
      navigator.clipboard.writeText(checkoutResult.pix.payload)
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 2500)
    }
  }

  function copyBoletoLine() {
    if (checkoutResult?.boleto?.identificationField) {
      navigator.clipboard.writeText(checkoutResult.boleto.identificationField)
      setCopiedBoleto(true)
      setTimeout(() => setCopiedBoleto(false), 2500)
    }
  }

  const cardBrand = detectCardBrand(cardNumber)
  const isCardValid = cardNumber.replace(/\D/g, '').length >= 13 &&
    cardHolderName.length >= 3 && expiryMonth && expiryYear &&
    cvv.length >= 3 && holderCpf.replace(/\D/g, '').length >= 11 &&
    holderPhone.replace(/\D/g, '').length >= 10 &&
    holderPostalCode.replace(/\D/g, '').length >= 8 &&
    holderAddressNumber.length >= 1

  // Generate installment options
  const installmentOptions = []
  for (let i = 1; i <= 12; i++) {
    const value = payment.amount / i
    if (value >= 5) { // Mínimo R$5 por parcela
      installmentOptions.push({
        count: i,
        value: Math.round(value * 100) / 100,
        label: i === 1 ? `1x de ${formatCurrency(value)} (à vista)` : `${i}x de ${formatCurrency(value)}`,
      })
    }
  }

  const checkoutError = checkout.error as Error | null
  const controlClass =
    'w-full min-h-11 rounded-xl border border-border-light bg-bg-primary px-3 py-2.5 text-base text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/25'
  const invalidControlClass = 'border-error/70 focus:border-error focus:ring-error/20'
  const showCardError = cardSubmitAttempted && !isCardValid

  // ============================================
  // CONFIRMED STATE
  // ============================================
  if (checkoutResult?.status === 'confirmed' || justConfirmed) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} /> Voltar
        </Link>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <DSIcon name="checkCircle" size={40} className="text-success animate-bounce" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-success">Pagamento Confirmado!</h2>
            <p className="text-lg text-text-primary font-semibold">{formatCurrency(payment.amount)}</p>
            {checkoutResult?.credit_card && (
              <p className="text-sm text-text-muted">
                Cartão {checkoutResult.credit_card.brand} •••• {checkoutResult.credit_card.number}
              </p>
            )}
            <p className="text-sm text-text-muted">{payment.description}</p>
            <div className="pt-4">
              <Link href="/dashboard">
                <Button variant="outline">Voltar ao Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============================================
  // MAIN CHECKOUT UI
  // ============================================
  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <DSIcon name="arrowLeft" size={16} /> Voltar
      </Link>

      {/* Payment Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Valor a pagar</p>
              <p className="text-3xl font-black tracking-tight text-text-primary">{formatCurrency(payment.amount)}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10">
              <DSIcon name="creditCard" size={28} className="text-brand-primary" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-muted">
            {payment.recipient_name && (
              <span>Para: <span className="text-text-primary font-medium">{payment.recipient_name}</span></span>
            )}
            {payment.due_date && (
              <span>• Vence: {new Date(payment.due_date).toLocaleDateString('pt-BR')}</span>
            )}
          </div>
          {payment.description && (
            <p className="mt-2 text-sm text-text-secondary">{payment.description}</p>
          )}
          <Badge className="mt-3 bg-warning/10 text-warning text-xs">Aguardando Pagamento</Badge>
        </CardContent>
      </Card>

      {/* Method Selection */}
      {!checkoutResult && (
        <>
          {checkoutError && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {checkoutError.message || 'Falha ao processar pagamento. Revise os dados e tente novamente.'}
            </div>
          )}

          <div>
            <p className="mb-3 text-sm font-medium text-text-primary">Como deseja pagar?</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'pix' as const, label: 'PIX', icon: 'qrcode' as DSIconName, desc: 'Instantâneo' },
                { value: 'credit_card' as const, label: 'Cartão', icon: 'creditCard' as DSIconName, desc: 'Até 12x' },
                { value: 'boleto' as const, label: 'Boleto', icon: 'fileText' as DSIconName, desc: '1-3 dias' },
              ]).map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleSelectMethod(m.value)}
                  className={cn(
                    'group flex min-h-11 flex-col items-center justify-center gap-1.5 rounded-xl border p-4 transition-all',
                    method === m.value
                      ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/25'
                      : 'border-border-light bg-bg-secondary hover:border-brand-primary/30'
                  )}
                >
                  <DSIcon name={m.icon} size={24} className={cn(
                    'transition-colors',
                    method === m.value ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-primary'
                  )} />
                  <span className={cn(
                    'text-sm font-medium',
                    method === m.value ? 'text-brand-primary' : 'text-text-primary'
                  )}>{m.label}</span>
                  <span className="text-xs text-text-muted">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PIX Section */}
          {method === 'pix' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DSIcon name="qrcode" size={20} className="text-success" />
                  Pagamento via PIX
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-text-muted">
                  Clique no botão abaixo para gerar o QR Code PIX. O pagamento é confirmado instantaneamente.
                </p>

                <MD3Input
                  label="CPF *"
                  type="text"
                  inputMode="numeric"
                  value={formatCpf(holderCpf)}
                  onChange={(e) => setHolderCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  error={holderCpf.replace(/\D/g, '').length > 0 && holderCpf.replace(/\D/g, '').length < 11 ? 'CPF incompleto' : undefined}
                  helperText="Obrigatório para emitir o pagamento no gateway."
                  autoComplete="off"
                />

                <Button
                  className="w-full"
                  onClick={handlePayPix}
                  loading={checkout.isPending}
                  disabled={checkout.isPending}
                >
                  <DSIcon name="qrcode" size={16} className="mr-2" />
                  Gerar QR Code PIX
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Credit Card Form */}
          {method === 'credit_card' && (
            <form onSubmit={handlePayCard}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DSIcon name="creditCard" size={20} className="text-brand-primary" />
                    Cartão de Crédito
                    {cardBrand && (
                      <Badge className="ml-auto bg-bg-primary text-text-secondary text-xs">{cardBrand}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {checkoutError && (
                    <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                      {checkoutError.message || 'Falha ao processar pagamento. Revise os dados e tente novamente.'}
                    </div>
                  )}

                  {showCardError && (
                    <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                      Revise os campos obrigatórios do cartão e titular antes de continuar.
                    </div>
                  )}

                  {/* Card Number */}
                  <MD3Input
                    label="Número do Cartão *"
                    type="text"
                    inputMode="numeric"
                    value={formatCardNumber(cardNumber)}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="font-mono tracking-wider"
                    error={showCardError && cardNumber.replace(/\D/g, '').length < 13 ? 'Número inválido' : undefined}
                    required
                    autoComplete="cc-number"
                    trailingIcon={<DSIcon name="lock" size={16} />}
                  />

                  {/* Holder Name */}
                  <MD3Input
                    label="Nome no Cartão *"
                    type="text"
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
                    placeholder="NOME COMO NO CARTÃO"
                    className="uppercase tracking-wide"
                    error={showCardError && cardHolderName.length < 3 ? 'Nome obrigatório' : undefined}
                    required
                    autoComplete="cc-name"
                  />

                  {/* Expiry + CVV */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-primary">Mês *</label>
                      <StyledSelect
                        value={expiryMonth}
                        onChange={setExpiryMonth}
                        options={[
                          { value: '', label: 'MM' },
                          ...Array.from({ length: 12 }, (_, i) => {
                            const m = String(i + 1).padStart(2, '0')
                            return { value: m, label: m }
                          }),
                        ]}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-primary">Ano *</label>
                      <StyledSelect
                        value={expiryYear}
                        onChange={setExpiryYear}
                        options={[
                          { value: '', label: 'AAAA' },
                          ...Array.from({ length: 15 }, (_, i) => {
                            const y = String(new Date().getFullYear() + i)
                            return { value: y, label: y }
                          }),
                        ]}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-primary">CVV *</label>
                      <div className="relative">
                        <input
                          type={showCvv ? 'text' : 'password'}
                          inputMode="numeric"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="•••"
                          maxLength={4}
                          className={cn(controlClass, 'font-mono placeholder:text-text-muted', showCardError && cvv.length < 3 && invalidControlClass)}
                          aria-invalid={showCardError && cvv.length < 3}
                          required
                          autoComplete="cc-csc"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-text-muted hover:bg-bg-secondary hover:text-text-primary"
                        >
                          <DSIcon name={showCvv ? 'eyeOff' : 'eye'} size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Installments */}
                  {installmentOptions.length > 1 && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-primary">Parcelas</label>
                      <StyledSelect
                        value={String(installmentCount)}
                        onChange={(v) => setInstallmentCount(Number(v))}
                        options={installmentOptions.map((opt) => ({ value: String(opt.count), label: opt.label }))}
                      />
                    </div>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border-light" />
                    <span className="text-xs text-text-muted">Dados do titular</span>
                    <div className="h-px flex-1 bg-border-light" />
                  </div>

                  {/* CPF */}
                  <MD3Input
                    label="CPF *"
                    type="text"
                    inputMode="numeric"
                    value={formatCpf(holderCpf)}
                    onChange={(e) => setHolderCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    error={showCardError && holderCpf.replace(/\D/g, '').length < 11 ? 'CPF incompleto' : undefined}
                    required
                  />

                  {/* Phone + CEP */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <MD3Input
                        label="Telefone *"
                        type="tel"
                        value={formatPhone(holderPhone)}
                        onChange={(e) => setHolderPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        error={showCardError && holderPhone.replace(/\D/g, '').length < 10 ? 'Telefone inválido' : undefined}
                        required
                      />
                    </div>
                    <div>
                      <MD3Input
                        label="CEP *"
                        type="text"
                        inputMode="numeric"
                        value={formatCep(holderPostalCode)}
                        onChange={(e) => setHolderPostalCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="00000-000"
                        maxLength={9}
                        error={showCardError && holderPostalCode.replace(/\D/g, '').length < 8 ? 'CEP inválido' : undefined}
                        required
                      />
                    </div>
                  </div>

                  {/* Address Number */}
                  <MD3Input
                    label="Número do Endereço *"
                    type="text"
                    value={holderAddressNumber}
                    onChange={(e) => setHolderAddressNumber(e.target.value)}
                    placeholder="123"
                    maxLength={10}
                    error={showCardError && holderAddressNumber.length < 1 ? 'Obrigatório' : undefined}
                    required
                  />

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={checkout.isPending}
                    loading={checkout.isPending}
                  >
                    <DSIcon name="lock" size={16} className="mr-2" />
                    Pagar {formatCurrency(payment.amount)}
                  </Button>
                </CardContent>
              </Card>
            </form>
          )}

          {/* Boleto Section */}
          {method === 'boleto' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DSIcon name="fileText" size={20} className="text-warning" />
                  Boleto Bancário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-text-muted">
                  O boleto será gerado e pode ser pago em qualquer banco ou aplicativo. A confirmação leva 1 a 3 dias úteis.
                </p>

                <MD3Input
                  label="CPF *"
                  type="text"
                  inputMode="numeric"
                  value={formatCpf(holderCpf)}
                  onChange={(e) => setHolderCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  error={holderCpf.replace(/\D/g, '').length > 0 && holderCpf.replace(/\D/g, '').length < 11 ? 'CPF incompleto' : undefined}
                  helperText="Obrigatório para emitir o boleto no gateway."
                  autoComplete="off"
                />

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handlePayBoleto}
                  loading={checkout.isPending}
                  disabled={checkout.isPending}
                >
                  <DSIcon name="fileText" size={16} className="mr-2" />
                  Gerar Boleto
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ============================================ */}
      {/* PIX Result */}
      {/* ============================================ */}
      {checkoutResult?.payment_method === 'pix' && checkoutResult.pix && !checkoutResult.fallback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DSIcon name="qrcode" size={20} className="text-success" />
              QR Code PIX
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code Image */}
            <div className="flex justify-center">
              <div className="rounded-2xl border-2 border-success/20 bg-white p-5 shadow-sm">
                <Image
                  src={`data:image/png;base64,${checkoutResult.pix.qrCode}`}
                  alt="QR Code PIX"
                  width={220}
                  height={220}
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-xl bg-success/5 border border-success/10 p-4 space-y-2">
              <p className="text-sm font-medium text-success">Como pagar:</p>
              <ol className="text-xs text-text-secondary space-y-1 list-decimal list-inside">
                <li>Abra o app do seu banco</li>
                <li>Escolha pagar via PIX com QR Code</li>
                <li>Escaneie o código acima ou copie e cole</li>
                <li>Confirme o pagamento</li>
              </ol>
            </div>

            {/* Copy & Paste */}
            {checkoutResult.pix.payload && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                  PIX Copia e Cola
                </label>
                <div className="flex items-center gap-2">
                  <MD3Input
                    label=""
                    type="text"
                    readOnly
                    value={checkoutResult.pix.payload}
                    className="truncate font-mono text-xs"
                  />
                  <Button variant="outline" size="sm" type="button" onClick={copyPixPayload}>
                    <DSIcon name={copiedPix ? 'check' : 'copy'} size={16} className={copiedPix ? 'text-success' : ''} />
                  </Button>
                </div>
              </div>
            )}

            {/* Polling indicator */}
            <div className="flex items-center justify-center gap-2 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
              <DSIcon name="loader" size={16} className="text-warning animate-spin" />
              <p className="text-sm text-warning">
                Aguardando pagamento... atualiza automaticamente
              </p>
            </div>

            {checkoutResult.pix.expirationDate && (
              <p className="text-center text-xs text-text-muted">
                Expira em: {new Date(checkoutResult.pix.expirationDate).toLocaleString('pt-BR')}
              </p>
            )}

            <Button variant="outline" className="w-full" onClick={() => setCheckoutResult(null)}>
              Escolher outro método
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ============================================ */}
      {/* Fallback — PIX indisponível, redirecionamento para link Asaas */}
      {/* ============================================ */}
      {checkoutResult?.fallback && checkoutResult.invoice_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DSIcon name="externalLink" size={20} className="text-primary" />
              Link de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-warning/5 border border-warning/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <DSIcon name="alertTriangle" size={20} className="text-warning shrink-0" />
                <p className="text-sm font-medium text-warning">PIX direto temporariamente indisponível</p>
              </div>
              <p className="text-xs text-text-secondary">
                Criamos um link de pagamento seguro onde você pode escolher PIX, boleto ou cartão.
              </p>
            </div>

            <a
              href={checkoutResult.invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <DSIcon name="externalLink" size={16} />
              Abrir Link de Pagamento
            </a>

            <div className="flex items-center justify-center gap-2 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
              <DSIcon name="loader" size={16} className="text-warning animate-spin" />
              <p className="text-sm text-warning">
                Aguardando pagamento... atualiza automaticamente
              </p>
            </div>

            <div className="flex items-center gap-2 justify-center text-xs text-text-muted">
              <DSIcon name="shield" size={14} />
              <span>Pagamento processado pelo Asaas (Banco Central)</span>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setCheckoutResult(null)}>
              Escolher outro método
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ============================================ */}
      {/* Boleto Result */}
      {/* ============================================ */}
      {checkoutResult?.payment_method === 'boleto' && checkoutResult.boleto && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DSIcon name="fileText" size={20} className="text-warning" />
              Boleto Gerado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-warning/5 border border-warning/10 p-4 text-center">
              <p className="text-sm text-text-muted mb-1">Valor</p>
              <p className="text-2xl font-black tracking-tight text-text-primary">{formatCurrency(payment.amount)}</p>
              {payment.due_date && (
                <p className="text-xs text-text-muted mt-1">
                  Vencimento: {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            {/* Linha digitável */}
            {checkoutResult.boleto.identificationField && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                  Linha Digitável
                </label>
                <div className="flex items-center gap-2">
                  <MD3Input
                    label=""
                    type="text"
                    readOnly
                    value={checkoutResult.boleto.identificationField}
                    className="truncate font-mono text-xs"
                  />
                  <Button variant="outline" size="sm" type="button" onClick={copyBoletoLine}>
                    <DSIcon name={copiedBoleto ? 'check' : 'copy'} size={16} className={copiedBoleto ? 'text-success' : ''} />
                  </Button>
                </div>
              </div>
            )}

            {/* PDF Link */}
            {checkoutResult.boleto.bankSlipUrl && (
              <a
                href={checkoutResult.boleto.bankSlipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-light bg-bg-primary px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
              >
                <DSIcon name="externalLink" size={16} />
                Ver PDF do Boleto
              </a>
            )}

            {/* Polling */}
            <div className="flex items-center justify-center gap-2 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
              <DSIcon name="loader" size={16} className="text-warning animate-spin" />
              <p className="text-sm text-warning">
                Aguardando pagamento... confirmação em 1-3 dias úteis
              </p>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setCheckoutResult(null)}>
              Escolher outro método
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ============================================ */}
      {/* Security Badge */}
      {/* ============================================ */}
      <div className="flex items-center justify-center gap-4 rounded-xl border border-border-light bg-bg-secondary/50 px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <DSIcon name="shield" size={14} className="text-success" />
          <span>Pagamento Seguro</span>
        </div>
        <div className="h-3 w-px bg-border-light" />
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <DSIcon name="lock" size={14} className="text-success" />
          <span>SSL/TLS Criptografado</span>
        </div>
        <div className="h-3 w-px bg-border-light" />
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <DSIcon name="phone" size={14} className="text-success" />
          <span>VFIT</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Page Export (with Suspense for useSearchParams)
// ============================================
export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <CheckoutPageSkeleton />
      }>
        <CheckoutInner />
      </Suspense>
    </AuthGuard>
  )
}
