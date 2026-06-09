# TRACKING — Alunos Pagam, Profissionais Sem Plano

Última atualização: 2026-06-09
Progresso: 3/24 (13%)

## Fase 0 — Direção e contratos
- [ ] T0.1 ADR monetização student-first aprovada
- [ ] T0.2 Contratos consultation commerce aprovados
- [ ] T0.3 Matriz de flags e rollback aprovada

## Fase 1 — Entitlement sem plano profissional
- [ ] T1.1 Remover gating por subscription_plan para personal
- [ ] T1.2 Remover gating por subscription_plan para nutricionista
- [ ] T1.3 Manter gating de aluno premium intacto
- [ ] T1.4 Testes de regressão de permissões

## Fase 2 — Consultation commerce
- [ ] T2.1 Modelo de oferta de consultoria criado
- [ ] T2.2 Modelo de order criado
- [ ] T2.3 Checkout de order implementado
- [ ] T2.4 Confirmação de pagamento idempotente
- [ ] T2.5 Sessão premium bloqueada sem paid
- [ ] T2.6 Sessão premium liberada com paid

## Fase 3 — Ledger e settlement
- [ ] T3.1 Ledger append-only em produção
- [ ] T3.2 Eventos financeiros padronizados
- [ ] T3.3 Job reconciliação diária ativo
- [ ] T3.4 Painel admin de reconciliação ativo
- [ ] T3.5 Payout bloqueado em inconsistência

## Fase 4 — Cutover e limpeza
- [x] T4.1 Deprecar GET /platform/subscription para creators
- [x] T4.2 Deprecar POST /platform/checkout para creators
- [x] T4.3 Atualizar páginas de pricing e copy comercial
- [ ] T4.4 Limpeza de caminhos legados de plano creator

## Fase 5 — Operação
- [ ] T5.1 Alertas P1/P2 em produção
- [ ] T5.2 Smoke checklist automatizado
- [ ] T5.3 Runbook de incidentes publicado
- [ ] T5.4 Playbook de suporte para creators publicado

## Deploy log

| Versão | Data | Sprint | Commit | Notas |
|---|---|---|---|---|
| v4.4.7 | 2026-06-09 | R4 (parcial) | 1d41b060 | Deprecação de platform billing + UI inicial de monetização |
