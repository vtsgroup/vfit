# 04 — Roadmap de Execução

## Sprint R0 — Design técnico e critérios de corte

Entregas:
1. ADR de monetização student-first.
2. Contratos de consultation commerce.
3. Matriz de flags e rollback.

Critério de saída:
- Aprovação de arquitetura, segurança e finanças.

## Sprint R1 — Entitlement e feature flags

Entregas:
1. Gating por role/capability, não por plano profissional.
2. Flags em backend e frontend.
3. Testes de regressão de acesso professional/nutri.

Critério de saída:
- Professional/nutri operam sem assinatura ativa sem quebrar billing aluno.

## Sprint R2 — Consultation commerce MVP

Entregas:
1. CRUD de ofertas.
2. Checkout de order de consultoria.
3. Session start condicionado a pagamento confirmado.

Critério de saída:
- Sem entrega premium antes de pagamento.

## Sprint R3 — Ledger e settlement

Entregas:
1. Ledger append-only com eventos order_paid, fee_charged, creator_settled, refunded.
2. Painel admin de reconciliação.
3. Job de reconciliação diária gateway x ledger.

Critério de saída:
- Diferença financeira reconciliada abaixo de limiar acordado.

## Sprint R4 — Cutover e limpeza

Entregas:
1. Deprecar endpoints B2B de plano profissional.
2. Atualizar pricing e narrativa comercial.
3. Limpeza de código legado de assinatura profissional.

Critério de saída:
- Zero tráfego relevante em endpoints legados por janela de 14 dias.

## Workstreams paralelos

1. Produto/comercial: reposicionamento de oferta e comunicação.
2. Suporte: playbook para creators na transição.
3. Jurídico/compliance: termos de exclusividade de consultoria.
