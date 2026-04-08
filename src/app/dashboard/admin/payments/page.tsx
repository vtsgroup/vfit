/**
 * src/app/dashboard/admin/payments/page.tsx
 *
 * Admin Payments Page — Cobranças + Saques PIX
 *
 * Exports: AdminPaymentsPage
 * Hooks: useEffect, useState, useAdminPayments, useAdminUsers, useAdminPersonals, useAdminAffiliates
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Admin Payments Page — Cobranças + Saques PIX
// ============================================

'use client'

import { useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import Image from 'next/image'
import { cn, formatCurrency } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ActionIconButton } from '@/components/ui/action-icon-button'
import { AdminPaymentsPageSkeleton } from '@/components/ui/page-skeletons'
import { EmptyStateDS } from '@/components/ui/empty-state-ds'
import { ScrollHint } from '@/components/ui/scroll-hint'
import { StyledSelect } from '@/components/ui/styled-select'
import { MD3Input } from '@/components/ui/md3-input'
import { Modal } from '@/components/ui/modal'
import {
  useAdminPayments,
  useAdminUsers,
  useAdminPersonals,
  useAdminAffiliates,
  useCreateAdminPayment,
  useAdminDeletePayment,
  useAdminStats,
  useAdminTransfers,
  type AdminPayment,
  type AdminPaymentResponse,
} from '@/hooks/use-admin'
import { useAuthStore } from '@/stores/auth-store'
import { useScrollLock } from '@/hooks/use-scroll-lock'

type Tab = 'payments' | 'withdrawals'

// ============================================
// Status config
// ============================================
const statusConfig: Record<string, { label: string; color: string; icon: DSIconName }> = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning', icon: 'clock' },
  confirmed: { label: 'Confirmado', color: 'bg-success/10 text-success', icon: 'checkCircle2' },
  received: { label: 'Recebido', color: 'bg-success/10 text-success', icon: 'checkCircle2' },
  overdue: { label: 'Vencido', color: 'bg-error/10 text-error', icon: 'alertTriangle' },
  refunded: { label: 'Devolvido', color: 'bg-info/10 text-info', icon: 'xCircle' },
  cancelled: { label: 'Cancelado', color: 'bg-text-muted/10 text-text-muted', icon: 'xCircle' },
  failed: { label: 'Falhou', color: 'bg-error/10 text-error', icon: 'xCircle' },
  bonus: { label: 'Bônus', color: 'bg-brand-primary/10 text-brand-primary', icon: 'dollarSign' },
}

const transferStatusConfig: Record<string, { label: string; color: string; icon: DSIconName }> = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning', icon: 'clock' },
  processing: { label: 'Processando', color: 'bg-info/10 text-info', icon: 'clock' },
  completed: { label: 'Concluído', color: 'bg-success/10 text-success', icon: 'checkCircle2' },
  failed: { label: 'Falhou', color: 'bg-error/10 text-error', icon: 'xCircle' },
  cancelled: { label: 'Cancelado', color: 'bg-text-muted/10 text-text-muted', icon: 'xCircle' },
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('payments')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [pixResult, setPixResult] = useState<AdminPaymentResponse | null>(null)
  const [detailPayment, setDetailPayment] = useState<AdminPayment | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<AdminPayment | null>(null)
  const [deleteInput, setDeleteInput] = useState('')
  const [copied, setCopied] = useState(false)

  useScrollLock(!!showCreate || !!pixResult || !!detailPayment || !!deleteConfirm)

  // Withdrawals state
  const [withdrawPage, setWithdrawPage] = useState(1)

  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const isSA = isSuperAdmin()
  const deletePayment = useAdminDeletePayment()
  const { data: adminStats } = useAdminStats()

  const { data, isLoading } = useAdminPayments({
    page,
    status: statusFilter || undefined,
    payment_method: methodFilter || undefined,
    search: search || undefined,
  })

  const { data: transfersData, isLoading: transfersLoading } = useAdminTransfers({ page: withdrawPage })
  const { data: affiliatesData, isLoading: affiliatesLoading } = useAdminAffiliates({ page: 1 })

  const payments = data?.payments ?? []
  const meta = data?.meta

  const hasActiveFilters = Boolean(statusFilter || methodFilter || search)

  const transfers = transfersData?.transfers ?? []
  const transfersMeta = transfersData?.meta
  const affiliates = affiliatesData?.affiliates ?? []

  // Transfer stats
  const totalWithdrawn = transfers.reduce((sum, t) => t.status === 'completed' ? sum + t.amount : sum, 0)
  const totalPending = transfers.reduce((sum, t) => ['pending', 'processing'].includes(t.status) ? sum + t.amount : sum, 0)
  const totalFees = transfers.reduce((sum, t) => sum + t.fee, 0)

  function doSearch() {
    setSearch(searchInput)
    setPage(1)
  }

  async function copyPix(payload: string) {
    await navigator.clipboard.writeText(payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <AuthGuard requiredType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <DSIcon name="wallet" className="text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-text-primary">Pagamentos</h1>
              <p className="text-sm text-text-muted">
                {meta?.total ?? 0} transaç{(meta?.total ?? 0) !== 1 ? 'ões' : 'ão'}
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <DSIcon name="plus" size={16} className="mr-1.5" />Criar Cobrança
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-bg-primary p-1 border border-border-light">
          <button
            onClick={() => setActiveTab('payments')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
              activeTab === 'payments'
                ? 'bg-bg-secondary text-brand-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <DSIcon name="creditCard" size={16} />
            Cobranças
            {meta?.total ? <span className="text-xs text-text-muted">({meta.total})</span> : null}
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
              activeTab === 'withdrawals'
                ? 'bg-bg-secondary text-brand-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <DSIcon name="arrowDownToLine" size={16} />
            Saques PIX
            {transfersMeta?.total ? <span className="text-xs text-text-muted">({transfersMeta.total})</span> : null}
          </button>
        </div>

        {/* ================================================================ */}
        {/* PAYMENTS TAB */}
        {/* ================================================================ */}
        {activeTab === 'payments' && (
          <>
        {/* Balance Cards — Saldo real-time do Asaas */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <BalanceCard
            icon="wallet"
            label="Saldo Disponível"
            value={adminStats?.asaas_balance}
            accent="from-brand-primary to-brand-accent"
            description="Disponível para saque"
          />
          <BalanceCard
            icon="trendingUp"
            label="Receita Confirmada"
            value={adminStats?.asaas_statistics?.income?.confirmed}
            accent="from-brand-primary to-brand-accent"
            description="Cobranças confirmadas"
          />
          <BalanceCard
            icon="clock"
            label="Receita Estimada"
            value={adminStats?.asaas_statistics?.income?.estimated}
            accent="from-amber-500 to-orange-500"
            description="Cobranças pendentes"
          />
          <BalanceCard
            icon="alertTriangle"
            label="Receita Vencida"
            value={adminStats?.asaas_statistics?.income?.overdue}
            accent="from-red-500 to-rose-600"
            description="Cobranças em atraso"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48">
            <MD3Input
              label="Buscar pagamento"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              placeholder="Buscar por nome ou email..."
              leadingIcon={<DSIcon name="search" size={16} />}
            />
          </div>
          <Button variant="outline" size="sm" onClick={doSearch}>Buscar</Button>
          <StyledSelect
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1) }}
            options={[
              { value: '', label: 'Todos os status' },
              { value: 'pending', label: 'Pendente' },
              { value: 'confirmed', label: 'Confirmado' },
              { value: 'received', label: 'Recebido' },
              { value: 'overdue', label: 'Vencido' },
              { value: 'cancelled', label: 'Cancelado' },
            ]}
            compact
          />
          <StyledSelect
            value={methodFilter}
            onChange={(v) => { setMethodFilter(v); setPage(1) }}
            options={[
              { value: '', label: 'Todos os métodos' },
              { value: 'pix', label: 'PIX' },
              { value: 'credit_card', label: 'Cartão' },
              { value: 'boleto', label: 'Boleto' },
            ]}
            compact
          />
        </div>

        {/* Affiliates snapshot (Sprint B.2.1) */}
        <div className="rounded-2xl border border-border-light bg-bg-secondary p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-text-primary">Afiliados — Alunos atribuídos</h3>
            <Badge variant="outline" className="text-[10px]">B.2.1</Badge>
          </div>

          {affiliatesLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="flex items-center gap-4"><div className="h-4 w-28 animate-pulse rounded bg-white/8" /><div className="h-4 w-20 animate-pulse rounded bg-white/6" /><div className="h-4 w-14 animate-pulse rounded bg-white/6" /></div>)}
            </div>
          ) : affiliates.length === 0 ? (
            <p className="text-xs text-text-muted">Nenhum afiliado encontrado.</p>
          ) : (
            <ScrollHint>
              <table className="w-full min-w-190 text-left text-sm">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="py-2 pr-3 font-medium text-text-muted">Afiliado</th>
                    <th className="py-2 pr-3 font-medium text-text-muted">Código</th>
                    <th className="py-2 pr-3 font-medium text-text-muted text-right">Alunos atribuídos</th>
                    <th className="py-2 pr-0 font-medium text-text-muted text-right">Indicações totais</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.slice(0, 8).map((affiliate) => (
                    <tr key={affiliate.id} className="border-b border-border-light/60 last:border-0">
                      <td className="py-2 pr-3">
                        <p className="font-medium text-text-primary truncate max-w-56">{affiliate.full_name}</p>
                        <p className="text-xs text-text-muted truncate">{affiliate.email}</p>
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant="outline" className="text-[10px] uppercase">{affiliate.referral_code}</Badge>
                      </td>
                      <td className="py-2 pr-3 text-right font-semibold text-brand-primary">
                        {affiliate.student_referrals}
                      </td>
                      <td className="py-2 pr-0 text-right text-text-muted">
                        {affiliate.total_referrals}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollHint>
          )}
        </div>

        {/* Payment list */}
        {isLoading ? (
          <AdminPaymentsPageSkeleton />
        ) : payments.length === 0 ? (
          <EmptyStateDS
            icon={hasActiveFilters ? 'search' : 'wallet'}
            title={hasActiveFilters ? 'Nenhum pagamento encontrado' : 'Nenhuma cobrança ainda'}
            description={hasActiveFilters ? 'Tente ajustar os filtros ou limpar a busca.' : 'Quando houver cobranças, elas aparecerão aqui.'}
            actionLabel={hasActiveFilters ? 'Limpar filtros' : undefined}
            onAction={hasActiveFilters ? () => {
              setStatusFilter('')
              setMethodFilter('')
              setSearchInput('')
              setSearch('')
              setPage(1)
            } : undefined}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border-light bg-bg-secondary">
            <ScrollHint>
              <table className="w-full min-w-245 text-left text-sm">
                <thead>
                  <tr className="border-b border-border-light bg-bg-primary/60">
                    <th className="px-4 py-3 font-medium text-text-muted">Pagador</th>
                    <th className="px-4 py-3 font-medium text-text-muted">Recebedor</th>
                    <th className="px-4 py-3 font-medium text-text-muted text-right whitespace-nowrap">Valor</th>
                    <th className="px-4 py-3 font-medium text-text-muted whitespace-nowrap">Método</th>
                    <th className="px-4 py-3 font-medium text-text-muted whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 font-medium text-text-muted whitespace-nowrap">Data</th>
                    <th className="px-4 py-3 font-medium text-text-muted text-center whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const st = statusConfig[p.status] || statusConfig.pending
                    return (
                      <tr key={p.id} className="border-b border-border-light last:border-0 hover:bg-bg-tertiary focus-within:bg-bg-tertiary transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-text-primary truncate max-w-45">{p.payer_name}</p>
                            <p className="text-xs text-text-muted truncate">{p.payer_email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-text-primary truncate max-w-45">{p.recipient_name}</p>
                            <p className="text-xs text-text-muted truncate">{p.recipient_email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-semibold text-text-primary">{formatCurrency(p.amount)}</p>
                          {p.platform_fee > 0 && (
                            <p className="text-xs text-text-muted">Taxa: {formatCurrency(p.platform_fee)}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {p.payment_method === 'pix' ? 'PIX' : p.payment_method === 'credit_card' ? 'Cartão' : p.payment_method || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={cn('text-[10px]', st.color)}>
                            <DSIcon name={st.icon} size={12} className="mr-0.5" />{st.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
                          {new Date(p.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex justify-center gap-1">
                            <ActionIconButton icon={<DSIcon name="eye" />} tooltip="Detalhes" onClick={() => setDetailPayment(p)} />
                            {p.invoice_url && (
                              <a href={p.invoice_url} target="_blank" rel="noopener noreferrer">
                                <ActionIconButton icon={<DSIcon name="externalLink" />} tooltip="Fatura" />
                              </a>
                            )}
                            {isSA && (
                              <ActionIconButton icon={<DSIcon name="trash" />} tooltip="Deletar" destructive onClick={() => setDeleteConfirm(p)} />
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </ScrollHint>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">{meta.total} transações</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <DSIcon name="chevronLeft" size={16} />
              </Button>
              <span className="flex items-center px-3 text-sm text-text-muted">{page}/{meta.total_pages}</span>
              <Button variant="outline" size="sm" disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)}>
                <DSIcon name="chevronRight" size={16} />
              </Button>
            </div>
          </div>
        )}
          </>
        )}

        {/* ================================================================ */}
        {/* WITHDRAWALS TAB */}
        {/* ================================================================ */}
        {activeTab === 'withdrawals' && (
          <>
            {/* Withdrawal Stats */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-secondary p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10">
                  <DSIcon name="checkCircle2" className="text-success" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total Sacado</p>
                  <p className="font-semibold text-success">{formatCurrency(totalWithdrawn)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-secondary p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10">
                  <DSIcon name="clock" className="text-warning" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Em Processamento</p>
                  <p className="font-semibold text-warning">{formatCurrency(totalPending)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-secondary p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10">
                  <DSIcon name="dollarSign" className="text-info" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total em Taxas</p>
                  <p className="font-semibold text-info">{formatCurrency(totalFees)}</p>
                </div>
              </div>
            </div>

            {/* Transfers Table */}
            {transfersLoading ? (
              <AdminPaymentsPageSkeleton />
            ) : transfers.length === 0 ? (
              <EmptyStateDS
                icon="wallet"
                title="Nenhum saque PIX"
                description="Nenhum saque foi solicitado ainda. Quando houver solicitações, elas aparecerão aqui."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border-light bg-bg-secondary">
                <ScrollHint>
                    <table className="w-full min-w-270 text-left text-sm">
                    <thead>
                      <tr className="border-b border-border-light bg-bg-primary/60">
                          <th className="px-4 py-3 font-medium text-text-muted">Personal</th>
                          <th className="px-4 py-3 font-medium text-text-muted">Chave PIX</th>
                          <th className="px-4 py-3 font-medium text-text-muted text-right whitespace-nowrap">Valor</th>
                          <th className="px-4 py-3 font-medium text-text-muted text-right whitespace-nowrap">Taxa</th>
                          <th className="px-4 py-3 font-medium text-text-muted text-right whitespace-nowrap">Líquido</th>
                          <th className="px-4 py-3 font-medium text-text-muted whitespace-nowrap">Status</th>
                          <th className="px-4 py-3 font-medium text-text-muted whitespace-nowrap">Solicitado</th>
                          <th className="px-4 py-3 font-medium text-text-muted whitespace-nowrap">Concluído</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transfers.map((t) => {
                        const tStatus = transferStatusConfig[t.status] || transferStatusConfig.pending
                        return (
                          <tr key={t.id} className="border-b border-border-light last:border-0 hover:bg-bg-tertiary transition-colors">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-text-primary truncate max-w-40">{t.personal_name || '—'}</p>
                                <p className="text-xs text-text-muted truncate">{t.personal_email || '—'}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <DSIcon name="key" size={14} className="text-text-muted shrink-0" />
                                <div>
                                  <p className="text-xs font-mono text-text-primary truncate max-w-36">{t.pix_key}</p>
                                  <p className="text-[10px] text-text-muted uppercase">{t.pix_key_type}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <p className="font-semibold text-text-primary">{formatCurrency(t.amount)}</p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <p className={cn('text-xs', t.fee > 0 ? 'text-warning' : 'text-text-muted')}>
                                {t.fee > 0 ? formatCurrency(t.fee) : 'Grátis'}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <p className="font-medium text-success">{formatCurrency(t.net_amount)}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Badge className={cn('text-[10px]', tStatus.color)}>
                                <DSIcon name={tStatus.icon} size={12} className="mr-0.5" />{tStatus.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
                              {new Date(t.requested_at).toLocaleDateString('pt-BR')}
                              <br />
                              <span className="text-[10px]">{new Date(t.requested_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
                              {t.completed_at ? (
                                <>
                                  {new Date(t.completed_at).toLocaleDateString('pt-BR')}
                                  <br />
                                  <span className="text-[10px]">{new Date(t.completed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </>
                              ) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </ScrollHint>
              </div>
            )}

            {/* Pagination */}
            {transfersMeta && transfersMeta.total_pages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">{transfersMeta.total} saques</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={withdrawPage <= 1} onClick={() => setWithdrawPage(p => p - 1)}>
                    <DSIcon name="chevronLeft" size={16} />
                  </Button>
                  <span className="flex items-center px-3 text-sm text-text-muted">{withdrawPage}/{transfersMeta.total_pages}</span>
                  <Button variant="outline" size="sm" disabled={withdrawPage >= transfersMeta.total_pages} onClick={() => setWithdrawPage(p => p + 1)}>
                    <DSIcon name="chevronRight" size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Payment Modal */}
        {showCreate && (
          <CreatePaymentModal
            onClose={() => setShowCreate(false)}
            onSuccess={(result) => {
              setShowCreate(false)
              if (result.pix) {
                setPixResult(result)
              }
            }}
          />
        )}

        {/* PIX QR Code Result Modal */}
        {pixResult && (
          <Modal title="Cobrança PIX Criada" onClose={() => setPixResult(null)}>
              <div className="space-y-4">
                {/* Payment Info */}
                <div className="rounded-xl bg-bg-primary p-3 text-sm space-y-1">
                  <p><span className="text-text-muted">Valor:</span> <strong className="text-success">{formatCurrency(pixResult.amount)}</strong></p>
                  <p><span className="text-text-muted">Pagador:</span> {pixResult.payer_name}</p>
                  <p><span className="text-text-muted">Recebedor:</span> {pixResult.recipient_name}</p>
                  <p><span className="text-text-muted">Status:</span> <Badge className="text-[10px] bg-warning/10 text-warning">{pixResult.status}</Badge></p>
                  {pixResult.pix?.expirationDate && (
                    <p><span className="text-text-muted">Expira:</span> {new Date(pixResult.pix.expirationDate).toLocaleString('pt-BR')}</p>
                  )}
                </div>

                {/* QR Code */}
                {pixResult.pix?.qrCode && (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-border-light bg-bg-primary p-4">
                    <p className="text-sm font-medium text-text-primary">Escaneie o QR Code</p>
                    <Image
                      src={`data:image/png;base64,${pixResult.pix.qrCode}`}
                      alt="PIX QR Code"
                      width={224}
                      height={224}
                      className="h-56 w-56 rounded-lg"
                      unoptimized
                    />
                  </div>
                )}

                {/* PIX Copia e Cola */}
                {pixResult.pix?.payload && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">PIX Copia e Cola</label>
                    <div className="flex gap-2">
                      <textarea
                        readOnly
                        value={pixResult.pix.payload}
                        rows={3}
                        className="flex-1 rounded-xl border border-border-light bg-bg-primary px-3 py-2 text-xs text-text-primary font-mono resize-none"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 self-end"
                        onClick={() => copyPix(pixResult.pix!.payload!)}
                      >
                        {copied ? <DSIcon name="check" size={16} className="text-success" /> : <DSIcon name="copy" size={16} />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Invoice URL */}
                {pixResult.invoice_url && (
                  <a
                    href={pixResult.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-sm text-brand-primary hover:underline"
                  >
                    Abrir fatura do Asaas →
                  </a>
                )}

                <Button className="w-full" onClick={() => setPixResult(null)}>
                  Fechar
                </Button>
              </div>
          </Modal>
        )}

        {/* Payment Detail Modal */}
        {detailPayment && (
          <PaymentDetailModal payment={detailPayment} onClose={() => setDetailPayment(null)} />
        )}

        {/* Hard Delete Confirm Modal */}
        {deleteConfirm && isSA && (
          <Modal title="Deletar Pagamento" onClose={() => { setDeleteConfirm(null); setDeleteInput('') }}>
              <div className="space-y-4">
                <div className="rounded-xl bg-error/10 border border-error/20 p-3">
                  <div className="flex items-start gap-2">
                    <DSIcon name="alertTriangle" className="text-error shrink-0 mt-0.5" />
                    <div className="text-sm text-error">
                      <p className="font-semibold">AÇÃO IRREVERSÍVEL</p>
                      <p className="mt-1">Valor: <strong>{formatCurrency(deleteConfirm.amount)}</strong></p>
                      <p className="mt-0.5">Pagador: {deleteConfirm.payer_name} ({deleteConfirm.payer_email})</p>
                      <p className="mt-0.5">Recebedor: {deleteConfirm.recipient_name} ({deleteConfirm.recipient_email})</p>
                      <p className="mt-1">Isso irá deletar permanentemente este registro de pagamento. <strong>Não há como desfazer.</strong></p>
                    </div>
                  </div>
                </div>
                <MD3Input
                  label='Digite "DELETE" para confirmar'
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  error={deleteInput && deleteInput !== 'DELETE' ? 'Digite DELETE exatamente' : undefined}
                  autoFocus
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setDeleteConfirm(null); setDeleteInput('') }}>Cancelar</Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (deleteInput !== 'DELETE') return
                      deletePayment.mutate(deleteConfirm.id, {
                        onSuccess: () => { setDeleteConfirm(null); setDeleteInput('') },
                      })
                    }}
                    loading={deletePayment.isPending}
                    disabled={deleteInput !== 'DELETE'}
                  >
                    <DSIcon name="trash" size={16} className="mr-1.5" />Deletar Permanentemente
                  </Button>
                </div>
              </div>
          </Modal>
        )}
      </div>
    </AuthGuard>
  )
}


// ============================================
// Create Payment Modal — Form + Asaas integration
// ============================================
function CreatePaymentModal({ onClose, onSuccess }: {
  onClose: () => void
  onSuccess: (result: AdminPaymentResponse) => void
}) {
  const [payerId, setPayerId] = useState('')
  const [recipientId, setRecipientId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('pix')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })
  const [createInAsaas, setCreateInAsaas] = useState(true)
  const [payerSearch, setPayerSearch] = useState('')
  const [recipientSearch, setRecipientSearch] = useState('')

  const createPayment = useCreateAdminPayment()

  // Load users for dropdowns
  const { data: usersData } = useAdminUsers({ per_page: 100, search: payerSearch || undefined })
  const { data: personalsData } = useAdminPersonals({ search: recipientSearch || undefined })

  const users = usersData?.users ?? []
  const personals = personalsData?.personals ?? []

  function handleCreate() {
    if (!payerId || !recipientId || !amount) return

    createPayment.mutate(
      {
        payer_id: payerId,
        recipient_id: recipientId,
        amount: parseFloat(amount),
        payment_method: method,
        description: description || undefined,
        due_date: dueDate,
        create_in_asaas: createInAsaas,
      },
      {
        onSuccess: (result) => {
          onSuccess(result.data)
        },
      }
    )
  }

  return (
    <Modal title="Criar Cobrança" onClose={onClose} maxWidth="max-w-lg">
        <div className="space-y-4">
          {/* Payer — qualquer user */}
          <div>
            <MD3Input
              label="Pagador (quem paga)"
              value={payerSearch}
              onChange={(e) => setPayerSearch(e.target.value)}
              placeholder="Buscar pagador..."
              leadingIcon={<DSIcon name="search" size={16} />}
              className="mb-2"
            />
            <StyledSelect
              value={payerId}
              onChange={setPayerId}
              options={[
                { value: '', label: 'Selecione o pagador...' },
                ...users.map((u) => ({ value: u.id, label: `${u.full_name} — ${u.email} (${u.user_type})` })),
              ]}
            />
          </div>

          {/* Recipient — personal */}
          <div>
            <MD3Input
              label="Recebedor (personal)"
              value={recipientSearch}
              onChange={(e) => setRecipientSearch(e.target.value)}
              placeholder="Buscar personal..."
              leadingIcon={<DSIcon name="search" size={16} />}
              className="mb-2"
            />
            <StyledSelect
              value={recipientId}
              onChange={setRecipientId}
              options={[
                { value: '', label: 'Selecione o recebedor...' },
                ...personals.map((p) => ({ value: p.personal_id || p.id, label: `${p.full_name} — ${p.email} (${p.plan_type})` })),
              ]}
            />
          </div>

          {/* Amount */}
          <MD3Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.00"
          />

          {/* Method */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Método</label>
            <div className="flex gap-2">
              {([
                { val: 'pix', label: 'PIX', icon: 'qrcode' as DSIconName },
                { val: 'credit_card', label: 'Cartão', icon: 'creditCard' as DSIconName },
              ] as const).map(({ val, label, icon }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMethod(val)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition',
                    method === val
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-border-light bg-bg-primary text-text-secondary hover:border-brand-primary/30'
                  )}
                >
                  <DSIcon name={icon} size={16} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <MD3Input
            label="Vencimento"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          {/* Description */}
          <MD3Input
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mensalidade, aula avulsa..."
          />

          {/* Asaas toggle */}
          <label className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-primary p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={createInAsaas}
              onChange={(e) => setCreateInAsaas(e.target.checked)}
              className="h-4 w-4 rounded border-border-light text-brand-primary focus:ring-2 focus:ring-brand-primary/25"
            />
            <div>
              <p className="text-sm font-medium text-text-primary">Criar no Asaas</p>
              <p className="text-xs text-text-muted">Gera cobrança real com QR Code PIX</p>
            </div>
          </label>

          {/* Info */}
          {method === 'pix' && createInAsaas && (
            <div className="rounded-xl bg-success/5 border border-success/20 p-3">
              <p className="text-xs text-success">
                <DSIcon name="qrcode" size={14} className="inline mr-1" />
                Um QR Code PIX será gerado automaticamente. Você poderá escaneá-lo ou copiar o código PIX para testar o pagamento.
              </p>
            </div>
          )}

          {/* Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="rounded-xl bg-bg-primary p-3 text-xs space-y-1">
              <p className="font-medium text-text-primary mb-1">Resumo:</p>
              <p className="flex justify-between"><span className="text-text-muted">Valor bruto:</span> <span>{formatCurrency(parseFloat(amount))}</span></p>
              <p className="flex justify-between"><span className="text-text-muted">Taxa plataforma (10%):</span> <span className="text-warning">{formatCurrency(parseFloat(amount) * 0.1)}</span></p>
              <p className="flex justify-between font-medium"><span className="text-text-muted">Líquido personal:</span> <span className="text-success">{formatCurrency(parseFloat(amount) * 0.9)}</span></p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              onClick={handleCreate}
              loading={createPayment.isPending}
              disabled={!payerId || !recipientId || !amount || parseFloat(amount) < 5}
            >
              <DSIcon name="plus" size={16} className="mr-1.5" />Criar Cobrança
            </Button>
          </div>
        </div>
    </Modal>
  )
}


// ============================================
// Payment Detail Modal
// ============================================
function PaymentDetailModal({ payment, onClose }: { payment: AdminPayment; onClose: () => void }) {
  const st = statusConfig[payment.status] || statusConfig.pending

  return (
    <Modal title="Detalhes do Pagamento" onClose={onClose}>
        <div className="space-y-3 text-sm">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Status</span>
            <Badge className={cn('text-xs', st.color)}>
              <DSIcon name={st.icon} size={12} className="mr-0.5" />{st.label}
            </Badge>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Valor</span>
            <span className="text-lg font-bold text-text-primary">{formatCurrency(payment.amount)}</span>
          </div>

          <hr className="border-border-light" />

          {/* Payer */}
          <div>
            <p className="text-text-muted text-xs mb-0.5">Pagador</p>
            <p className="font-medium text-text-primary">{payment.payer_name}</p>
            <p className="text-xs text-text-muted">{payment.payer_email}</p>
          </div>

          {/* Recipient */}
          <div>
            <p className="text-text-muted text-xs mb-0.5">Recebedor</p>
            <p className="font-medium text-text-primary">{payment.recipient_name}</p>
            <p className="text-xs text-text-muted">{payment.recipient_email}</p>
          </div>

          <hr className="border-border-light" />

          {/* Financial breakdown */}
          <div className="rounded-xl bg-bg-primary p-3 space-y-1.5">
            <p className="flex justify-between text-xs"><span className="text-text-muted">Valor bruto:</span> <span>{formatCurrency(payment.amount)}</span></p>
            {payment.platform_fee > 0 && (
              <p className="flex justify-between text-xs"><span className="text-text-muted">Taxa plataforma:</span> <span className="text-warning">-{formatCurrency(payment.platform_fee)}</span></p>
            )}
            {payment.commission > 0 && (
              <p className="flex justify-between text-xs"><span className="text-text-muted">Comissão afiliado:</span> <span className="text-info">-{formatCurrency(payment.commission)}</span></p>
            )}
            <p className="flex justify-between text-xs font-medium border-t border-border-light pt-1.5">
              <span className="text-text-muted">Líquido:</span>
              <span className="text-success">{formatCurrency(payment.net_amount)}</span>
            </p>
          </div>

          {/* Method */}
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Método</span>
            <Badge variant="outline" className="text-xs uppercase">
              {payment.payment_method === 'pix' ? 'PIX' : payment.payment_method === 'credit_card' ? 'Cartão' : payment.payment_method || '-'}
            </Badge>
          </div>

          {/* Dates */}
          {payment.due_date && (
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Vencimento</span>
              <span className="text-text-primary">{new Date(payment.due_date).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          {payment.paid_at && (
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Pago em</span>
              <span className="text-success">{new Date(payment.paid_at).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Criado em</span>
            <span className="text-text-primary">{new Date(payment.created_at).toLocaleDateString('pt-BR')}</span>
          </div>

          {/* IDs */}
          {payment.asaas_payment_id && (
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Asaas ID</span>
              <span className="text-xs text-text-muted font-mono">{payment.asaas_payment_id}</span>
            </div>
          )}

          {payment.description && (
            <div>
              <p className="text-text-muted text-xs mb-0.5">Descrição</p>
              <p className="text-text-primary">{payment.description}</p>
            </div>
          )}

          {/* Invoice link */}
          {payment.invoice_url && (
            <a
              href={payment.invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-brand-primary hover:underline mt-2"
            >
              <DSIcon name="externalLink" size={14} className="inline mr-1" />
              Ver fatura no Asaas
            </a>
          )}

          <Button className="w-full mt-3" variant="outline" onClick={onClose}>Fechar</Button>
        </div>
    </Modal>
  )
}

// ============================================
// Balance Card component — Saldo Asaas real-time
// ============================================
function BalanceCard({
  icon,
  label,
  value,
  accent,
  description,
}: {
  icon: DSIconName
  label: string
  value: number | null | undefined
  accent: string
  description: string
}) {
  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-light bg-bg-card p-4 transition-shadow hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br', accent)}>
          <DSIcon name={icon} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-text-muted">{label}</p>
          <p className="text-lg font-bold text-text-primary">
            {value != null ? fmt(value) : '—'}
          </p>
          <p className="text-[11px] text-text-muted">{description}</p>
        </div>
      </div>
    </div>
  )
}
