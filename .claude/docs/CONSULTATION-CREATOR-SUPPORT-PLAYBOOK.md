# Consultation Creator Support Playbook

Updated: 2026-06-09
Audience: support and operations

## Objective

Handle creator-facing tickets during the student-first monetization model where creators do not require mandatory subscription and consultation revenue is controlled by consultation orders + ledger consistency.

## Common Ticket Types

1. "Meu saque foi bloqueado"
2. "Pagamento da consultoria foi confirmado e a sessao nao liberou"
3. "Pedido foi reembolsado, mas status nao atualizou"
4. "Nao consigo iniciar sessao premium"

## Support Flow

1. Collect creator ID and order ID when available.
2. Check creator ledger status endpoint.
3. Check order status in consultation_orders.
4. Check session status in consultation_sessions.
5. Check whether webhook event reached payments webhook path.

## Diagnostic Endpoints

- GET /api/v1/consultations/admin/ledger/creator/:id/status
- GET /api/v1/consultations/admin/ledger/reconciliation?days=7

## Decision Guide

- If payout_blocked=true:
  - Explain that payout is auto-protected by reconciliation guard.
  - Escalate to engineering with creator ID and affected order IDs.
- If order is pending:
  - Ask creator/student to complete payment method and retry.
- If order is paid but session not started:
  - Confirm participant permissions and start path.
- If refunded:
  - Confirm that session remains cancelled by policy.

## Creator-Facing Template

"Seu saque foi protegido automaticamente porque encontramos uma divergencia de conciliacao financeira em pedidos de consultoria. Ja abrimos a reconciliacao interna e vamos liberar assim que os eventos estiverem consistentes."

## Escalation Package

Include all items:

1. Creator ID
2. Order IDs impacted
3. Output from reconciliation endpoint
4. Output from creator status endpoint
5. Timestamp and timezone

## SLA Guidance

- P1 financial inconsistency: first response in 15 min, mitigation in 60 min
- P2 checkout/webhook degradation: first response in 30 min, mitigation in 4 h
