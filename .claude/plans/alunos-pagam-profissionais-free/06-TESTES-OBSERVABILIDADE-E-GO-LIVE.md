# 06 — Testes, Observabilidade e Go-live

## Matriz de testes

## Unit
1. Capability resolver por role sem plano profissional.
2. State machine de consultation order.
3. Cálculo fee/net/settlement.

## Integration
1. Checkout order -> webhook -> paid.
2. paid -> session_start permitido.
3. unpaid -> session_start bloqueado.

## E2E
1. Professional cria oferta, aluno compra e inicia consultoria.
2. Tentativa de acesso sem pagamento.
3. Reembolso e revogação de acesso.

## Smoke pós deploy

1. Auth student/professional/nutritionist.
2. Criar oferta, comprar e confirmar pagamento.
3. Start de sessão premium.
4. Registro em ledger.

## Observabilidade mínima obrigatória

## Logs estruturados
- consultation_order_created
- consultation_payment_confirmed
- consultation_session_started
- settlement_generated
- settlement_blocked_inconsistency

## Métricas
- conversion_consultation_checkout
- paid_orders_per_day
- failed_payment_ratio
- unauthorized_premium_attempts
- ledger_reconciliation_diff

## Alertas
1. P1: ledger_reconciliation_diff > threshold.
2. P1: unauthorized_premium_attempts spike.
3. P2: webhook delay acima de SLA.
4. P2: checkout error rate acima de baseline.

## Go-live checklist

1. Flags em staged rollout (1%, 10%, 50%, 100%).
2. Dashboard validado por produto e engenharia.
3. Runbook de rollback ensaiado.
4. Comunicação para creators e alunos publicada.
