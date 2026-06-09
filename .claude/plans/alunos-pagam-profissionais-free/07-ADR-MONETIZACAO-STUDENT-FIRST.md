# ADR — Monetizacao Student-First

Date: 2026-06-09
Status: Approved
Decision ID: ADR-SF-2026-06-09

## Context

- O modelo anterior cobrava creators via assinatura obrigatoria.
- A direcao aprovada move monetizacao para compra de consultoria pelos alunos.
- Creators (personal e nutritionist) mantem acesso sem assinatura obrigatoria de plataforma.

## Decision

1. Revenue primario passa a ser consultation_orders pagas por students.
2. Assinatura obrigatoria de creator fica deprecada para novos fluxos.
3. Entregas premium de consultoria dependem de ordem com status paid.
4. Ledger interno append-only passa a ser a verdade contabil da plataforma.

## Consequences

- Positivas:
  - Menor friccao de entrada para creators.
  - Monetizacao alinhada ao uso real de consultoria.
  - Rastreabilidade financeira via ledger + reconciliacao.
- Custos:
  - Operacao precisa de monitoramento de webhook/ledger.
  - Fluxo de saque precisa de bloqueio por inconsistencias.

## Acceptance

- Consultation commerce ativo com offers/orders/sessions.
- Ledger ativo com eventos order_paid, fee_charged, creator_settled, refunded.
- Reconciliacao e alertas P1/P2 implementados.
