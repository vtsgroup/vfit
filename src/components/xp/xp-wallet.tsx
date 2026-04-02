// ============================================
// xp-wallet.tsx — Carteira XP com saldo, nível e histórico
// ============================================
//
// O que faz:
//   Exibe saldo XP atual, nível do aluno e progresso até próximo nível.
//   Barra de progresso animada com percentual até próximo nível.
//   Lista de transações XP recentes (earned/expired/bonus) com ícones.
//   Status de limites diários via useXPLimits.
//
// Exports principais:
//   XPWallet — carteira XP completa com saldo, nível e histórico
'use client'

import { useState } from 'react'
import { useXPBalance, useXPHistory, useXPLimits } from '@/hooks/use-xp'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

export function XPWallet() {
  const balance = useXPBalance()
  const history = useXPHistory(10, 0)
  const limits = useXPLimits()
  const [showHistory, setShowHistory] = useState(false)

  if (balance.isLoading) {
    return (
      <div className="rounded-xl border border-border-light bg-bg-secondary p-6 animate-pulse">
        <div className="h-4 w-32 bg-bg-tertiary rounded mb-4" />
        <div className="h-8 w-24 bg-bg-tertiary rounded" />
      </div>
    )
  }

  if (balance.isError) {
    return (
      <div className="rounded-xl border border-border-error bg-error/10 p-4 flex items-center gap-2">
        <DSIcon name="alertCircle" size={20} className="text-error" />
        <p className="text-sm text-error">Erro ao carregar XP</p>
      </div>
    )
  }

  const data = balance.data
  if (!data) return null

  const nextLevelXP = data.next_level_threshold
  const progress = Math.min(1, Math.max(0, data.balance / nextLevelXP))

  return (
    <div className="space-y-4">
      {/* Main Card: Balance + Level */}
      <div className="rounded-xl border border-border-light bg-linear-to-br from-brand-accent/5 to-brand-primary/5 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-text-muted">Carteira XP</p>
            <p className="text-3xl font-bold text-text-primary mt-1">{data.balance}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-accent/20">
            <DSIcon name="zap" size={24} className="text-brand-accent" />
          </div>
        </div>

        {/* Level Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-text-muted">Nível</p>
            <p className="text-2xl font-bold text-brand-primary">{data.level}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Ganho</p>
            <p className="text-lg font-semibold text-text-primary">{data.total_earned}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-text-muted">Progresso Nível {data.level}</p>
            <p className="text-xs font-semibold text-brand-accent">{Math.round(progress * 100)}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-bg-tertiary">
            <div
              className="h-full rounded-full bg-linear-to-r from-brand-primary to-brand-accent transition-all duration-700"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-xs text-text-muted text-right">
            {data.balance} / {data.next_level_threshold} XP
          </p>
        </div>
      </div>

      {/* Daily Limits Status */}
      {limits.isSuccess && limits.data?.limits && (
        <div className="rounded-xl border border-border-light bg-bg-secondary p-4 space-y-3">
          <div className="flex items-center gap-2">
            <DSIcon name="clock" size={16} className="text-text-muted" />
            <p className="text-sm font-medium text-text-primary">Limites Diários</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {limits.data.limits.map((limit) => (
              <div
                key={limit.event_type}
                className={cn(
                  'rounded-lg p-2',
                  limit.allowed
                    ? 'bg-success/10 border border-success/30'
                    : 'bg-warning/10 border border-warning/30'
                )}
              >
                <p className="font-medium text-text-primary line-clamp-1">
                  {limit.event_type.replace(/_/g, ' ')}
                </p>
                <p className={limit.allowed ? 'text-success' : 'text-warning'}>
                  {limit.current_count}/{limit.limit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="rounded-xl border border-border-light bg-bg-secondary overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-4 flex items-center justify-between hover:bg-bg-tertiary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <DSIcon name="trendingUp" size={16} className="text-text-muted" />
            <p className="font-medium text-text-primary">Histórico Recente</p>
          </div>
          <span
            className={cn(
              'text-xs font-medium text-text-muted transition-transform',
              showHistory && 'rotate-180'
            )}
          >
            ▼
          </span>
        </button>

        {showHistory && (
          <div className="border-t border-border-light p-4 space-y-2 max-h-96 overflow-y-auto">
            {history.isLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="flex items-center justify-between py-2"><div className="space-y-1.5"><div className="h-3.5 w-28 animate-pulse rounded bg-white/8" /><div className="h-2.5 w-20 animate-pulse rounded bg-white/5" /></div><div className="h-4 w-14 animate-pulse rounded bg-white/8" /></div>)}
              </div>
            ) : history.data?.transactions?.length === 0 ? (
              <p className="text-sm text-text-muted">Nenhuma transação ainda</p>
            ) : (
              history.data?.transactions?.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 text-sm border-b border-border-light last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-text-primary line-clamp-1">
                      {tx.event_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(tx.created_at).toLocaleDateString('pt-BR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'font-semibold whitespace-nowrap ml-2',
                      tx.direction === 'credit' ? 'text-success' : 'text-text-muted'
                    )}
                  >
                    {tx.direction === 'credit' ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <p className="text-xs text-text-muted text-center">
        XP é resetado automaticamente a cada 90 dias
      </p>
    </div>
  )
}
