/**
 * src/app/dashboard/payments/create/page.tsx
 *
 * Create Payment Page — Avulsa + Recorrente
 *
 * Exports: CreatePaymentPage
 * Hooks: useState, useEffect, useRef, useStudents, useAdminUsers, useAuthStore
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Create Payment Page — Avulsa + Recorrente
// ============================================

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StyledSelect } from '@/components/ui/styled-select'
import { MD3Input, MD3TextArea } from '@/components/ui/md3-input'
import { cn } from '@/lib/utils'
import { useStudents } from '@/hooks/use-students'
import { useAdminUsers } from '@/hooks/use-admin'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import {
  useCreatePayment,
  useCreateSubscription,
  usePayment,
  type CreatePaymentResponse,
} from '@/hooks/use-payments'

type TabType = 'single' | 'recurring'

const CARD_MACHINE_FEE_RATE = 0.0299

const REFERENCE_PERIOD_OPTIONS = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannually', label: 'Semestral' },
  { value: 'yearly', label: 'Anual' },
  { value: 'one_time', label: 'Avulsa / Única' },
] as const

function toMoney(value: number) {
  return Math.round(value * 100) / 100
}

export default function CreatePaymentPage() {
  const { hasAdminCapabilities, isSimulationActive } = useEffectiveUserView()
  const isAdmin = hasAdminCapabilities && !isSimulationActive
  const { data: studentData } = useStudents({ per_page: 200 })
  const { data: adminUsersData } = useAdminUsers({ per_page: 200, enabled: isAdmin })
  const createPayment = useCreatePayment()
  const createSubscription = useCreateSubscription()

  const [tab, setTab] = useState<TabType>('single')
  const [payerId, setPayerId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')
  const [createInAsaas, setCreateInAsaas] = useState(true)
  const [referencePeriod, setReferencePeriod] = useState<(typeof REFERENCE_PERIOD_OPTIONS)[number]['value']>('monthly')
  const [passMachineFeeToPayer, setPassMachineFeeToPayer] = useState(false)

  // Recurring-specific
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // PIX QR code result
  const [pixResult, setPixResult] = useState<CreatePaymentResponse | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)
  const [pixConfirmed, setPixConfirmed] = useState(false)
  const [copiedCheckoutLink, setCopiedCheckoutLink] = useState(false)
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Polling: quando PIX gerado, verifica status a cada 5s
  const pixPaymentId = pixResult?.id ?? ''
  const { data: polledPayment } = usePayment(pixPaymentId, { pollingEnabled: !!pixResult })
  const prevPolledStatus = useRef<string | null>(null)

  const polledStatus = polledPayment?.payment?.status
  useEffect(() => {
    if (!polledStatus) return
    if (prevPolledStatus.current === 'pending' && polledStatus === 'confirmed') {
      setPixConfirmed(true)
    }
    prevPolledStatus.current = polledStatus
  }, [polledStatus])

  const students = studentData?.students ?? []
  const adminUsers = adminUsersData?.users ?? []

  // Admin vê todos os users, personal vê seus alunos
  const payerOptions = isAdmin
    ? adminUsers.map((u) => ({ id: u.id, name: `${u.full_name} (${u.email})` }))
    : students.map((s) => ({ id: s.id, name: s.full_name }))

  function handleSubmitSingle(e: React.FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)
    if (isNaN(baseAmount) || baseAmount <= 0) return

    createPayment.mutate(
      {
        payer_id: payerId,
        amount: chargedAmount,
        payment_method: paymentMethod,
        due_date: dueDate || undefined,
        description: composeDescription(),
        create_in_asaas: createInAsaas,
      },
      {
        onSuccess: (response) => {
          const data = (response as { data?: CreatePaymentResponse })?.data
          if (data?.id) {
            setCreatedPaymentId(data.id)
          }
          if (data?.pix?.qrCode) {
            setPixResult(data)
          }
        },
      }
    )
  }

  function handleSubmitRecurring(e: React.FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)
    if (isNaN(baseAmount) || baseAmount <= 0) return

    createSubscription.mutate({
      payer_id: payerId,
      amount: chargedAmount,
      payment_method: paymentMethod,
      billing_cycle: billingCycle,
      start_date: startDate,
      end_date: endDate || undefined,
      description: composeDescription(),
    })
  }

  function copyPixPayload() {
    if (pixResult?.pix?.payload) {
      navigator.clipboard.writeText(pixResult.pix.payload)
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 2000)
    }
  }

  function copyCheckoutLink() {
    const payId = createdPaymentId || pixResult?.id
    if (payId) {
      const link = `${window.location.origin}/dashboard/payments/checkout?id=${payId}`
      navigator.clipboard.writeText(link)
      setCopiedCheckoutLink(true)
      setTimeout(() => setCopiedCheckoutLink(false), 2500)
    }
  }

  const isValid = !!payerId && !!amount && parseFloat(amount) > 0
  const isValidRecurring = isValid && !!startDate
  const isPending = tab === 'single' ? createPayment.isPending : createSubscription.isPending
  const formError = (tab === 'single' ? createPayment.error : createSubscription.error) as Error | null
  const showPayerError = submitAttempted && !payerId
  const showAmountError = submitAttempted && (!amount || parseFloat(amount) <= 0)
  const showStartDateError = submitAttempted && tab === 'recurring' && !startDate

  const controlClass =
    'w-full min-h-11 rounded-xl border border-border-light bg-bg-primary px-3 py-2 text-base text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/25'
  const invalidControlClass = 'border-error/70 focus:border-error focus:ring-error/20'

  const baseAmount = parseFloat(amount) || 0
  const shouldApplyMachineFee = paymentMethod === 'credit_card' && passMachineFeeToPayer
  const machineFeeAmount = shouldApplyMachineFee ? toMoney(baseAmount * CARD_MACHINE_FEE_RATE) : 0
  const chargedAmount = shouldApplyMachineFee ? toMoney(baseAmount + machineFeeAmount) : toMoney(baseAmount)
  const selectedReferencePeriodLabel = REFERENCE_PERIOD_OPTIONS.find((p) => p.value === referencePeriod)?.label || 'Mensal'

  useEffect(() => {
    if (paymentMethod !== 'credit_card' && passMachineFeeToPayer) {
      setPassMachineFeeToPayer(false)
    }
  }, [paymentMethod, passMachineFeeToPayer])

  const composeDescription = () => {
    const base = description.trim()
    const extras = [
      `Período: ${selectedReferencePeriodLabel}`,
      shouldApplyMachineFee ? 'Taxa de maquininha repassada ao pagador' : null,
    ].filter(Boolean) as string[]

    const full = [base, ...extras].filter(Boolean).join(' • ')
    return full.slice(0, 500) || null
  }

  return (
    <AuthGuard requiredType="personal">
      <div className="w-full space-y-6">
        {/* Back */}
        <Link
          href="/dashboard/payments"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar para financeiro
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
            <DSIcon name="creditCard" size={20} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary">
              Nova Cobrança
            </h1>
            <p className="text-sm text-text-muted">
              Gere uma cobrança avulsa ou recorrente.
            </p>
          </div>
        </div>

        {/* Tabs — DS v3 */}
        <div className="flex gap-1 rounded-xl bg-bg-secondary border border-border-light p-1">
          <button
            type="button"
            onClick={() => { setTab('single'); setPixResult(null) }}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
              tab === 'single'
                ? 'bg-brand-primary text-white shadow-[0_2px_0_rgba(5,150,105,0.6),0_4px_8px_rgba(5,150,105,0.25)]'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            <DSIcon name="creditCard" size={16} />
            Avulsa
          </button>
          <button
            type="button"
            onClick={() => { setTab('recurring'); setPixResult(null) }}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
              tab === 'recurring'
                ? 'bg-brand-primary text-white shadow-[0_2px_0_rgba(5,150,105,0.6),0_4px_8px_rgba(5,150,105,0.25)]'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            <DSIcon name="refresh" size={16} />
            Recorrente
          </button>
        </div>

        {/* PIX QR Code Result */}
        {pixResult?.pix?.qrCode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {pixConfirmed ? (
                  <>
                    <DSIcon name="checkCircle" size={20} className="text-success" />
                    Pagamento Confirmado!
                  </>
                ) : (
                  <>
                    <DSIcon name="qrcode" size={20} className="text-success" />
                    PIX Gerado com Sucesso!
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Success animation */}
              {pixConfirmed && (
                <div className="animate-fade-in rounded-xl border border-success/30 bg-success/10 p-4">
                  <div className="flex items-center gap-3">
                    <DSIcon name="checkCircle" size={24} className="text-success animate-bounce" />
                    <div>
                      <p className="font-semibold text-success">Pagamento recebido!</p>
                      <p className="text-sm text-success/80">O PIX foi confirmado com sucesso.</p>
                    </div>
                  </div>
                </div>
              )}

              {!pixConfirmed && (
                <>
                  <div className="flex justify-center">
                    <div className="rounded-xl border border-border-light bg-white p-4">
                      <Image
                        src={`data:image/png;base64,${pixResult.pix.qrCode}`}
                        alt="QR Code PIX"
                        width={200}
                        height={200}
                      />
                    </div>
                  </div>

                  {pixResult.pix.payload && (
                    <div>
                      <div className="flex items-center gap-2">
                        <MD3Input
                          label="Código Pix Copia e Cola"
                          readOnly
                          value={pixResult.pix.payload}
                          size="sm"
                          className="flex-1 truncate"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={copyPixPayload}
                        >
                          {copiedPix ? <DSIcon name="check" size={16} className="text-success" /> : <DSIcon name="copy" size={16} />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Polling indicator */}
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-warning/20 bg-warning/5 px-3 py-2">
                    <DSIcon name="loader" size={16} className="text-warning animate-spin" />
                    <p className="text-xs text-warning">
                      Aguardando pagamento... atualiza automaticamente
                    </p>
                  </div>
                </>
              )}

              {pixResult.pix.expirationDate && !pixConfirmed && (
                <p className="text-center text-xs text-text-muted">
                  Expira em: {new Date(pixResult.pix.expirationDate).toLocaleString('pt-BR')}
                </p>
              )}

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPixResult(null); setPixConfirmed(false); setCreatedPaymentId(null) }}
                >
                  {pixConfirmed ? 'Nova cobrança' : 'Criar outra cobrança'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checkout Link Card — shown after ANY payment creation */}
        {createdPaymentId && !pixResult?.pix?.qrCode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DSIcon name="checkCircle" size={20} className="text-success" />
                Cobrança Criada!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-muted">
                O aluno foi notificado e pode pagar diretamente pelo app com PIX, Cartão ou Boleto.
              </p>
              <div>
                <div className="flex items-center gap-2">
                  <MD3Input
                    label="Link de Pagamento (envie ao aluno)"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/payments/checkout?id=${createdPaymentId}`}
                    size="sm"
                    className="flex-1 truncate"
                  />
                  <Button variant="outline" size="sm" type="button" onClick={copyCheckoutLink}>
                    {copiedCheckoutLink ? <DSIcon name="check" size={16} className="text-success" /> : <DSIcon name="copy" size={16} />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/payments/checkout?id=${createdPaymentId}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Checkout
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => { setCreatedPaymentId(null); setPixResult(null); setPixConfirmed(false) }}
                >
                  Nova Cobrança
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {!pixResult?.pix?.qrCode && !createdPaymentId && (
          <form
            onSubmit={tab === 'single' ? handleSubmitSingle : handleSubmitRecurring}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {tab === 'single' ? 'Cobrança Avulsa' : 'Assinatura Recorrente'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formError && (
                  <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                    {formError.message || 'Não foi possível criar a cobrança. Tente novamente.'}
                  </div>
                )}

                {/* Payer */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    {isAdmin ? 'Pagador *' : 'Aluno *'}
                  </label>
                  <StyledSelect
                    value={payerId}
                    onChange={setPayerId}
                    options={[
                      { value: '', label: isAdmin ? 'Selecione o pagador' : 'Selecione o aluno' },
                      ...payerOptions.map((p) => ({ value: p.id, label: p.name })),
                    ]}
                  />
                  {isAdmin && (
                    <p className="mt-1 text-xs text-warning">
                      Modo admin: pode cobrar qualquer usuário da plataforma
                    </p>
                  )}
                  {showPayerError && <p className="mt-1 text-xs text-error">Selecione um pagador.</p>}
                </div>

                {/* Amount */}
                <MD3Input
                  label="Valor (R$)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="150.00"
                  step="0.01"
                  min="0.01"
                  error={showAmountError ? 'Informe um valor maior que R$ 0,00.' : undefined}
                  required
                />

                {/* Reference period */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Período de Referência
                  </label>
                  <StyledSelect
                    value={referencePeriod}
                    onChange={(v) => setReferencePeriod(v as (typeof REFERENCE_PERIOD_OPTIONS)[number]['value'])}
                    options={REFERENCE_PERIOD_OPTIONS.map((p) => ({ value: p.value, label: p.label }))}
                  />
                </div>

                {/* Payment method */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Método de Pagamento *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'pix', label: 'PIX' },
                      { value: 'credit_card', label: 'Cartão' },
                      { value: 'boleto', label: 'Boleto' },
                    ] as const).map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setPaymentMethod(m.value)}
                        className={`min-h-11 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                          paymentMethod === m.value
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                            : 'border-border-light bg-bg-primary text-text-secondary hover:border-brand-primary/30'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card machine fee pass-through */}
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-2 rounded-xl border border-warning/25 bg-warning/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          Repassar taxa da maquininha para o aluno?
                        </p>
                        <p className="mt-0.5 text-xs text-text-muted">
                          Aumenta o valor final cobrado no cartão.
                        </p>
                      </div>
                      <span className="rounded-full border border-warning/35 bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning">
                        Não recomendado
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPassMachineFeeToPayer((v) => !v)}
                      className={`relative h-11 w-14 rounded-full transition-colors ${
                        passMachineFeeToPayer ? 'bg-warning' : 'bg-border-light'
                      }`}
                      aria-label="Repassar taxa de maquininha"
                      aria-pressed={passMachineFeeToPayer}
                    >
                      <span
                        className={`absolute left-1 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-transform ${
                          passMachineFeeToPayer ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <p className="text-xs text-warning">
                      Use com cautela: a taxa costuma ser pequena e muitos clientes não gostam desse repasse.
                    </p>
                  </div>
                )}

                {/* Single: Due date */}
                {tab === 'single' && (
                  <MD3Input
                    label="Data de Vencimento"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                )}

                {/* Recurring: Billing cycle */}
                {tab === 'recurring' && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-primary">
                        Ciclo de Cobrança *
                      </label>
                      <StyledSelect
                        value={billingCycle}
                        onChange={setBillingCycle}
                        options={[
                          { value: 'weekly', label: 'Semanal' },
                          { value: 'biweekly', label: 'Quinzenal' },
                          { value: 'monthly', label: 'Mensal' },
                          { value: 'quarterly', label: 'Trimestral' },
                          { value: 'semiannually', label: 'Semestral' },
                          { value: 'yearly', label: 'Anual' },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <MD3Input
                        label="Data Início"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        error={showStartDateError ? 'Data de início é obrigatória.' : undefined}
                        required
                      />
                      <MD3Input
                        label="Data Fim"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Asaas toggle (single only) */}
                {tab === 'single' && (
                  <div className="flex items-center justify-between rounded-xl border border-border-light bg-bg-primary p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Cobrar via Asaas</p>
                      <p className="text-xs text-text-muted">Gera cobrança real com link de pagamento</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreateInAsaas(!createInAsaas)}
                      className={`relative h-11 w-14 rounded-full transition-colors ${
                        createInAsaas ? 'bg-brand-primary' : 'bg-border-light'
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-transform ${
                          createInAsaas ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Description */}
                <MD3TextArea
                  label="Descrição"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder={
                    tab === 'single'
                      ? 'Mensalidade janeiro, pacote 3 meses, etc.'
                      : 'Plano mensal de acompanhamento, etc.'
                  }
                />

                {/* Charge summary */}
                <div className="rounded-xl border border-border-light bg-bg-primary p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Resumo da cobrança</p>
                  <div className="space-y-1.5 text-sm">
                    <p className="flex items-center justify-between">
                      <span className="text-text-muted">Valor base</span>
                      <span className="font-semibold text-text-primary">R$ {toMoney(baseAmount).toFixed(2)}</span>
                    </p>
                    {shouldApplyMachineFee && (
                      <p className="flex items-center justify-between">
                        <span className="text-warning">Taxa maquininha estimada ({(CARD_MACHINE_FEE_RATE * 100).toFixed(2)}%)</span>
                        <span className="font-semibold text-warning">+ R$ {machineFeeAmount.toFixed(2)}</span>
                      </p>
                    )}
                    <p className="flex items-center justify-between border-t border-border-light pt-2">
                      <span className="text-text-muted">Total cobrado do aluno</span>
                      <span className="text-base font-bold text-brand-primary">R$ {chargedAmount.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Link href="/dashboard/payments">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={tab === 'single' ? !isValid : !isValidRecurring}
                loading={isPending}
              >
                <DSIcon name="check" size={16} className="mr-1.5" />
                {tab === 'single' ? 'Criar Cobrança' : 'Criar Assinatura'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AuthGuard>
  )
}
