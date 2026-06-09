# 03 — Migração de Dados e Contratos

## Superfícies atuais mapeadas

- config/constants.ts (PLANS, VFIT_PLANS)
- lib/pricing.ts (B2B e B2C misturados)
- workers/api/platform.ts (checkout de plano profissional)
- workers/api/payments.ts (B2B + B2C + webhook + marketplace)
- src/data/pricing-plans.ts (pricing de profissionais)
- src/app/(app)/perfil/assinatura/page.tsx (B2C aluno)

## Estratégia Strangler por ondas

## Onda A — Preparação (sem ruptura)

1. Introduzir feature flags:
   - FF_PROFESSIONAL_PLAN_BILLING
   - FF_CONSULTATION_PAID_ONLY
   - FF_LEDGER_V2
2. Criar tabela/coleção de ledger financeiro canônico.
3. Criar domínio de consultation_orders sem ativar exclusividade.

## Onda B — Entitlement sem plano profissional

1. Decoplar capabilities de professional/nutri de subscription_plan.
2. subscription_plan de professional vira legado para leitura, não gating.
3. Atualizar docs de produto e pricing público.

## Onda C — Consultoria paga exclusiva

1. Publicar rotas de offer/order/session.
2. Bloquear delivery premium sem payment_confirmed.
3. Registrar tentativa de bypass com sinal de fraude.

## Onda D — Cleanup legado

1. Descontinuar platform checkout B2B.
2. Remover plan cards e copy de plano profissional.
3. Migrar pricing interno para modelo student-first + taxas transacionais.

## Mudanças de contrato API (propostas)

1. GET /platform/subscription -> deprecado para professionals.
2. POST /platform/checkout -> deprecado para professionals.
3. Novo namespace:
   - POST /consultations/offers
   - GET /consultations/offers
   - POST /consultations/orders
   - POST /consultations/orders/:id/confirm
   - POST /consultations/sessions/:id/start

## Compatibilidade reversa

1. Manter respostas antigas sob flag por 1 ciclo de release.
2. Emitir campo deprecated_at nos payloads legados.
3. Dashboards internos mostram consumo de endpoints legados para guiar corte final.
