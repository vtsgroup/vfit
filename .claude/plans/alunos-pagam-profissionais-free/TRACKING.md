# TRACKING — Alunos Pagam, Profissionais Sem Plano

Última atualização: 2026-06-09
Progresso: 21/24 (88%)

## Fase 0 — Direção e contratos
- [ ] T0.1 ADR monetização student-first aprovada
- [ ] T0.2 Contratos consultation commerce aprovados
- [ ] T0.3 Matriz de flags e rollback aprovada

## Fase 1 — Entitlement sem plano profissional
- [x] T1.1 Remover gating por subscription_plan para personal
- [x] T1.2 Remover gating por subscription_plan para nutricionista
- [x] T1.3 Manter gating de aluno premium intacto
- [x] T1.4 Testes de regressão de permissões

## Fase 2 — Consultation commerce
- [x] T2.1 Modelo de oferta de consultoria criado
- [x] T2.2 Modelo de order criado
- [x] T2.3 Checkout de order implementado
- [x] T2.4 Confirmação de pagamento idempotente
- [x] T2.5 Sessão premium bloqueada sem paid
- [x] T2.6 Sessão premium liberada com paid

## Fase 3 — Ledger e settlement
- [x] T3.1 Ledger append-only em produção
- [x] T3.2 Eventos financeiros padronizados
- [x] T3.3 Job reconciliação diária ativo
- [x] T3.4 Painel admin de reconciliação ativo
- [x] T3.5 Payout bloqueado em inconsistência

## Fase 4 — Cutover e limpeza
- [x] T4.1 Deprecar GET /platform/subscription para creators
- [x] T4.2 Deprecar POST /platform/checkout para creators
- [x] T4.3 Atualizar páginas de pricing e copy comercial
- [x] T4.4 Limpeza de caminhos legados de plano creator

## Fase 5 — Operação
- [x] T5.1 Alertas P1/P2 em produção
- [x] T5.2 Smoke checklist automatizado
- [x] T5.3 Runbook de incidentes publicado
- [x] T5.4 Playbook de suporte para creators publicado

## Deploy log

| Versão | Data | Sprint | Commit | Notas |
|---|---|---|---|---|
| v4.4.7 | 2026-06-09 | R4 (parcial) | 1d41b060 | Deprecação de platform billing + UI inicial de monetização |
| v4.4.8 | 2026-06-09 | R4 (limpeza) | 014d18a2 | Checkout legado de creator removido e pricing/FAQ alinhados |
| v4.4.9 | 2026-06-09 | R2 (backend) | e6c4d7ec | Consultation commerce (offers/orders/sessions) + webhook de confirmação |
| v4.5.0 | 2026-06-09 | R3 (ledger) | b5f42aa3 | Ledger append-only + reconciliação + bloqueio de saque por inconsistência |
| - | 2026-06-09 | R5 (ops) | - | Smoke de consultoria + runbook de incidentes + playbook de suporte |
| - | 2026-06-09 | R6 (hardening) | - | Testes de permissões + alertas P1/P2 no cron + ajuste requireType(admin) |
