# Flags e Rollback Matrix

Date: 2026-06-09
Status: Approved

## Runtime Flags

| Flag | Default | Purpose | Rollback Effect |
|---|---|---|---|
| CONSULTATION_PAID_ONLY | on | Bloqueia sessao premium sem pagamento | permitiria fluxo legacy sem bloqueio |
| CONSULTATION_LEDGER_GUARD | on | Exige consistencia para payout | saque sem bloqueio por inconsistencias |
| CONSULTATION_RECONCILIATION_CRON | on | Roda verificacoes periodicas e alertas | reduz observabilidade e detecao precoce |

## Rollback Levels

1. L1 (safe): manter ledger + guard, reduzir apenas superficie de novas vendas.
2. L2 (controlled): pausar criacao de novas orders; manter processamento de webhooks e reconciliacao.
3. L3 (emergency): desligar paid-only temporariamente para continuidade operacional, mantendo ledger ativo para auditoria.

## Required During Rollback

1. Preservar tabela consultation_ledger_events.
2. Manter rastreio em app_logs de incidentes P1/P2.
3. Reconciliar eventos pendentes antes de reativar fluxo normal.

## Exit Criteria

- reconciliation missingEntries = 0
- sem spikes de security_violation
- smoke:consultations com checks criticos passando
