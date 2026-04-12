/**
 * src/app/dashboard/payments/withdraw/page.tsx
 *
 * PIX Withdrawal Page
 *
 * Exports: WithdrawPage
 * Hooks: useState, useBalance, useTransfers, useRequestPixTransfer
 * Features: 'use client' · DSIcon
 */

// ============================================
// PIX Withdrawal Page
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyStateDS } from '@/components/ui/empty-state-ds'
import { MD3Input } from '@/components/ui/md3-input'
import {
  useBalance,
  useTransfers,
  useRequestPixTransfer,
  type PixTransferItem,
} from '@/hooks/use-payments'

function formatCurrency(value: number) {
  const safe = typeof value === 'number' && !isNaN(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe)
}

const transferStatusConfig: Record<string, { label: string; color: string; icon: DSIconName }> = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning', icon: 'clock' },
  processing: { label: 'Processando', color: 'bg-info/10 text-info', icon: 'clock' },
  completed: { label: 'Concluído', color: 'bg-success/10 text-success', icon: 'checkCircle' },
  failed: { label: 'Rejeitado', color: 'bg-error/10 text-error', icon: 'alertTriangle' },
  cancelled: { label: 'Cancelado', color: 'bg-text-muted/10 text-text-muted', icon: 'alertTriangle' },
}

export default function WithdrawPage() {
  const { data: balanceData, isLoading: balanceLoading } = useBalance()
  const { data: transfersData, isLoading: transfersLoading } = useTransfers()
  const requestTransfer = useRequestPixTransfer()

  const [pixKey, setPixKey] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [showForm, setShowForm] = useState(false)

  const transfers = transfersData?.transfers ?? []
  const balance = balanceData

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) return

    requestTransfer.mutate(
      {
        amount: parsedAmount,
        pix_key: pixKey.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setPixKey('')
          setAmount('')
          setDescription('')
          setShowForm(false)
        },
      }
    )
  }

  const parsedAmount = parseFloat(amount)
  const isValid = !!pixKey.trim() && !isNaN(parsedAmount) && parsedAmount > 0
  const availableBalance = balance?.available_balance ?? 0

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <DSIcon name="wallet" size={20} className="text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-text-primary">Saques PIX</h1>
              <p className="text-sm text-text-muted">
                Transfira seu saldo diretamente para seu PIX.
              </p>
            </div>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <DSIcon name="download" size={16} className="mr-1.5" />
              Novo Saque
            </Button>
          )}
        </div>

        {/* Balance Cards */}
        {balanceLoading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border-light bg-bg-secondary p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-border-light/60 relative overflow-hidden"><div className="shimmer absolute inset-0" /></div>
                  <div className="h-3 w-20 rounded-lg bg-border-light/60 relative overflow-hidden"><div className="shimmer absolute inset-0" /></div>
                </div>
                <div className="h-7 w-24 rounded-lg bg-border-light/60 relative overflow-hidden"><div className="shimmer absolute inset-0" /></div>
              </div>
            ))}
          </div>
        ) : balance ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <BalanceCard
              icon="wallet"
              label="Saldo Disponível"
              value={formatCurrency(balance.available_balance)}
              color="text-success"
              bgColor="bg-success/10"
            />
            <BalanceCard
              icon="dollar"
              label="Total Recebido"
              value={formatCurrency(balance.total_received)}
              color="text-brand-primary"
              bgColor="bg-brand-primary/10"
            />
            <BalanceCard
              icon="download"
              label="Total Sacado"
              value={formatCurrency(balance.total_withdrawn)}
              color="text-warning"
              bgColor="bg-warning/10"
            />
            {balance.asaas_balance !== null && (
              <BalanceCard
                icon="dollar"
                label="Saldo Asaas"
                value={formatCurrency(balance.asaas_balance)}
                color="text-info"
                bgColor="bg-info/10"
              />
            )}
          </div>
        ) : null}

        {/* New Transfer Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DSIcon name="send" size={20} className="text-brand-primary" />
                Solicitar Saque PIX
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* PIX Key */}
                <MD3Input
                  label="Chave PIX"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="CPF, email, telefone ou chave aleatória"
                  leadingIcon={<DSIcon name="key" size={16} />}
                  helperText="Digite sua chave PIX cadastrada no banco"
                  required
                />

                {/* Amount */}
                <MD3Input
                  label="Valor do Saque (R$)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                  step="0.01"
                  min="0.01"
                  helperText={`Saldo disponível: ${formatCurrency(availableBalance)}`}
                  required
                />

                {parsedAmount > availableBalance && !isNaN(parsedAmount) && availableBalance > 0 && (
                  <div className="rounded-xl border border-warning/20 bg-warning/5 px-3 py-2">
                    <p className="text-xs text-warning">
                      Valor acima do saldo exibido. O backend validará com o saldo real do Asaas.
                    </p>
                  </div>
                )}

                {/* Description */}
                <MD3Input
                  label="Descrição (opcional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Saque mensal, etc."
                  maxLength={200}
                />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid || parsedAmount > availableBalance}
                    loading={requestTransfer.isPending}
                  >
                    <DSIcon name="send" size={16} className="mr-1.5" />
                    Solicitar Saque
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transfer History */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Histórico de Saques</h2>

          {transfersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-border-light bg-bg-secondary p-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-border-light/60 relative overflow-hidden"><div className="shimmer absolute inset-0" /></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/5 rounded-lg bg-border-light/60 relative overflow-hidden"><div className="shimmer absolute inset-0" /></div>
                    <div className="h-3 w-3/5 rounded-lg bg-border-light/60 relative overflow-hidden"><div className="shimmer absolute inset-0" /></div>
                  </div>
                  <div className="h-8 w-20 rounded-lg bg-border-light/60 relative overflow-hidden"><div className="shimmer absolute inset-0" /></div>
                </div>
              ))}
            </div>
          ) : transfers.length === 0 ? (
            <EmptyStateDS
              icon="arrowDownToLine"
              title="Nenhum saque realizado"
              description="Seus saques PIX aparecerão aqui."
            />
          ) : (
            <div className="space-y-3">
              {transfers.map((transfer) => (
                <TransferCard key={transfer.id} transfer={transfer} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

// ============================================
// Balance Card
// ============================================

function BalanceCard({ icon, label, value, color, bgColor }: {
  icon: DSIconName
  label: string
  value: string
  color: string
  bgColor: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-secondary p-4">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', bgColor)}>
        <DSIcon name={icon} size={20} className={color} />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  )
}

// ============================================
// Transfer Card
// ============================================

function TransferCard({ transfer }: { transfer: PixTransferItem }) {
  const config = transferStatusConfig[transfer.status] ?? transferStatusConfig.pending

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border-light bg-bg-secondary p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
        <DSIcon name="download" size={20} className="text-success" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-text-primary">
            PIX: {transfer.pix_key}
          </p>
          <Badge className={cn('text-[10px]', config.color)}>
            <DSIcon name={config.icon} size={12} className="mr-0.5" />
            {config.label}
          </Badge>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span>{new Date(transfer.requested_at).toLocaleDateString('pt-BR')}</span>
          {transfer.fee > 0 && (
            <>
              <span>·</span>
              <span>Taxa: {formatCurrency(transfer.fee)}</span>
            </>
          )}
          {transfer.completed_at && (
            <>
              <span>·</span>
              <span>Concluído: {new Date(transfer.completed_at).toLocaleDateString('pt-BR')}</span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-semibold text-text-primary">
          {formatCurrency(transfer.amount)}
        </p>
        {transfer.net_amount !== transfer.amount && (
          <p className="text-xs text-text-muted">
            Líquido: {formatCurrency(transfer.net_amount)}
          </p>
        )}
      </div>
    </div>
  )
}
