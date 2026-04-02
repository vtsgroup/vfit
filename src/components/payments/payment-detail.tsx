/**
 * src/components/payments/payment-detail.tsx
 *
 * Payment Detail — Client Component
 *
 * Exports: PaymentDetailClient
 * Hooks: useState, useEffect, useRef, usePayment, useUpdatePaymentStatus, useCancelPayment
 * Features: 'use client' · DSIcon
 */

// ============================================
// Payment Detail — Client Component
// ============================================

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import {
  usePayment,
  useUpdatePaymentStatus,
  useCancelPayment,
} from '@/hooks/use-payments'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentDetailSkeleton } from '@/components/ui/page-skeletons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning' },
  confirmed: { label: 'Confirmado', color: 'bg-success/10 text-success' },
  failed: { label: 'Falhou', color: 'bg-error/10 text-error' },
  refunded: { label: 'Reembolsado', color: 'bg-info/10 text-info' },
  cancelled: { label: 'Cancelado', color: 'bg-text-muted/10 text-text-muted' },
}

const methodLabels: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  boleto: 'Boleto Bancário',
}

function formatCurrency(value: number) {
  const safe = typeof value === 'number' && !isNaN(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe)
}

export default function PaymentDetailClient({ id }: { id: string }) {
  const { data, isLoading } = usePayment(id, { pollingEnabled: true })
  const updateStatus = useUpdatePaymentStatus(id)
  const cancelPayment = useCancelPayment(id)
  const [showMenu, setShowMenu] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [justConfirmed, setJustConfirmed] = useState(false)
  const prevStatusRef = useRef<string | null>(null)

  const payment = data?.payment

  // Detectar quando status muda de pending → confirmed (via webhook/polling)
  const paymentStatus = payment?.status
  useEffect(() => {
    if (!paymentStatus) return
    if (prevStatusRef.current === 'pending' && paymentStatus === 'confirmed') {
      setJustConfirmed(true)
      setTimeout(() => setJustConfirmed(false), 5000)
    }
    prevStatusRef.current = paymentStatus
  }, [paymentStatus])

  if (isLoading) {
    return (
      <AuthGuard requiredType="personal">
        <PaymentDetailSkeleton />
      </AuthGuard>
    )
  }

  if (!payment) {
    return (
      <AuthGuard requiredType="personal">
        <div className="py-20 text-center">
          <p className="text-text-muted">Pagamento não encontrado.</p>
          <Link href="/dashboard/payments" className="mt-2 text-sm text-brand-primary hover:underline">
            Voltar para financeiro
          </Link>
        </div>
      </AuthGuard>
    )
  }

  const config = statusConfig[payment.status] ?? statusConfig.pending

  function handleConfirm() {
    updateStatus.mutate({ status: 'confirmed', paid_at: new Date().toISOString() })
  }

  function handleCancel() {
    cancelPayment.mutate()
  }

  return (
    <AuthGuard requiredType="personal">
      <div className="space-y-6">
        {/* Back */}
        <Link
          href="/dashboard/payments"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar para financeiro
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-xl border border-border-light bg-bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
              <DSIcon name="creditCard" className="text-brand-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-text-primary">
                  {formatCurrency(payment.amount)}
                </h2>
                <Badge className={cn('text-xs', config.color)}>{config.label}</Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-muted">
                <span className="flex items-center gap-1">
                  <DSIcon name="user" size={14} /> {payment.payer_name}
                </span>
                <span className="flex items-center gap-1">
                  <DSIcon name="receipt" size={14} /> {methodLabels[payment.payment_method]}
                </span>
                <span className="flex items-center gap-1">
                  <DSIcon name="calendar" size={14} />
                  {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex gap-2 shrink-0">
            {payment.status === 'pending' && (
              <Button
                size="sm"
                onClick={handleConfirm}
                loading={updateStatus.isPending}
              >
                <DSIcon name="checkCircle2" size={16} className="mr-1.5" />
                Confirmar
              </Button>
            )}
            <div className="relative">
              <Button variant="outline" size="icon" onClick={() => setShowMenu(!showMenu)}>
                <DSIcon name="settings" size={16} />
              </Button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-border-light bg-bg-secondary py-1 shadow-lg">
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => { setShowCancelConfirm(true); setShowMenu(false) }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5"
                      >
                        <DSIcon name="xCircle" size={16} /> Cancelar cobrança
                      </button>
                    )}
                    {payment.invoice_url && (
                      <a
                        href={payment.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-bg-primary"
                      >
                        <DSIcon name="externalLink" size={16} /> Ver fatura
                      </a>
                    )}
                    {payment.receipt_url && (
                      <a
                        href={payment.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-bg-primary"
                      >
                        <DSIcon name="externalLink" size={16} /> Ver comprovante
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Cancel confirm */}
        {showCancelConfirm && (
          <div className="rounded-xl border border-error/20 bg-error/5 p-4">
            <p className="text-sm font-medium text-error">
              Tem certeza que deseja cancelar esta cobrança?
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="danger" size="sm" onClick={handleCancel} loading={cancelPayment.isPending}>
                Sim, cancelar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(false)}>
                Não
              </Button>
            </div>
          </div>
        )}

        {/* Pagamento confirmado animation */}
        {justConfirmed && (
          <div className="animate-fade-in rounded-xl border border-success/30 bg-success/10 p-4">
            <div className="flex items-center gap-3">
              <DSIcon name="checkCircle2" className="text-success animate-bounce" />
              <div>
                <p className="font-semibold text-success">Pagamento Confirmado!</p>
                <p className="text-sm text-success/80">O pagamento foi recebido com sucesso.</p>
              </div>
            </div>
          </div>
        )}

        {/* Polling indicator for pending PIX */}
        {payment.status === 'pending' && payment.payment_method === 'pix' && (
          <div className="flex items-center gap-2 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
            <DSIcon name="loader" size={16} className="text-warning animate-spin" />
            <p className="text-sm text-warning">
              Aguardando pagamento PIX... a tela atualiza automaticamente.
            </p>
          </div>
        )}

        {/* Details grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Payment info */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow label="Aluno" value={payment.payer_name} />
              <DetailRow label="Método" value={methodLabels[payment.payment_method]} />
              <DetailRow label="Valor" value={formatCurrency(payment.amount)} />
              {payment.due_date && (
                <DetailRow
                  label="Vencimento"
                  value={new Date(payment.due_date).toLocaleDateString('pt-BR')}
                />
              )}
              {payment.paid_at && (
                <DetailRow
                  label="Pago em"
                  value={new Date(payment.paid_at).toLocaleDateString('pt-BR')}
                />
              )}
              {payment.description && (
                <DetailRow label="Descrição" value={payment.description} />
              )}
            </CardContent>
          </Card>

          {/* Financial breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow label="Valor Bruto" value={formatCurrency(payment.amount)} />
              <DetailRow
                label="Taxa Plataforma"
                value={`- ${formatCurrency(payment.platform_fee)}`}
                valueColor="text-error"
              />
              {payment.commission > 0 && (
                <DetailRow
                  label="Comissão Afiliado"
                  value={`- ${formatCurrency(payment.commission)}`}
                  valueColor="text-warning"
                />
              )}
              <div className="border-t border-border-light pt-3">
                <DetailRow
                  label="Valor Líquido"
                  value={formatCurrency(payment.net_amount)}
                  valueColor="text-success font-semibold"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}

// ============================================
// Detail Row
// ============================================

function DetailRow({ label, value, valueColor }: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted">{label}</span>
      <span className={cn('text-text-primary', valueColor)}>{value}</span>
    </div>
  )
}
