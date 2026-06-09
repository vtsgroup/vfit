# Contratos — Consultation Commerce

Date: 2026-06-09
Status: Approved

## Contract 1: Offer Management

- Endpoint: POST /api/v1/consultations/offers
- Roles: personal, nutritionist, admin, super_admin
- Invariant:
  - price_amount > 0
  - duration_minutes in [15, 240]

## Contract 2: Student Checkout

- Endpoint: POST /api/v1/consultations/orders
- Role: student
- Invariant:
  - student nao compra propria oferta
  - order inicia em pending
  - externalReference padrao consult_order_{orderId}

## Contract 3: Payment Confirmation

- Source: Asaas webhook
- Invariant:
  - paid transition idempotente
  - cria/garante consultation_session scheduled
  - grava ledger order_paid, fee_charged, creator_settled

## Contract 4: Refund

- Source: Asaas webhook
- Invariant:
  - order vai para refunded
  - session vai para cancelled
  - grava ledger refunded

## Contract 5: Session Start Guard

- Endpoint: POST /api/v1/consultations/sessions/:id/start
- Roles: participants + admin/super_admin
- Invariant:
  - somente orders paid podem iniciar sessao
  - tentativa sem paid gera security_violation no ledger

## Contract 6: Payout Guard

- Endpoint: POST /api/v1/payments/transfers/pix
- Invariant:
  - inconsistentOrders > 0 bloqueia saque
