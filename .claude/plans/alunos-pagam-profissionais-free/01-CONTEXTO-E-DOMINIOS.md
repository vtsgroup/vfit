# 01 — Contexto e Domínios

## Estado atual identificado

- B2B de profissionais ainda existe em constants/pricing e em rotas de platform/payments.
- B2C de alunos já existe (vfit_subscriptions + perfil/assinatura), mas não é o centro da estratégia.
- payments.ts acumula múltiplos domínios (cobrança B2B, marketplace, webhook, B2C, repasse), elevando risco de regressão.

## Princípios de produto

1. Profissional usa o VFIT sem assinatura para operar.
2. Aluno paga para consumir premium e consultorias.
3. Consultoria fora da API do VFIT não conta como consultoria oficial da plataforma.
4. Toda consultoria oficial tem trilha: oferta -> checkout -> confirmação -> entrega -> ledger.

## Novos domínios canônicos

## D1) Entitlement

- Define o que cada papel pode fazer sem depender de plano profissional.
- Source of truth:
  - role do usuário
  - status de conta
  - políticas de risco/compliance

## D2) Student Billing

- Assinatura e pagamento do aluno (mensal/anual e add-ons).
- Já existente, mas vira eixo principal de receita.

## D3) Consultation Commerce

- Produto "consultoria" transacionável pela API.
- Entidades novas: consultation_offers, consultation_orders, consultation_sessions.

## D4) Ledger & Settlement

- Registro imutável por evento financeiro.
- Suporte a fee da plataforma, split creator, estorno, disputa e reconciliação.

## D5) Policy & Exclusividade

- Consultoria oficial exige pagamento confirmado via API VFIT.
- Entrega premium (chat consultivo, sessão síncrona, plano premium) bloqueada sem payment_status confirmado.

## Anti-objetivos

1. Não manter dois modelos de verdade para cobrança de creator em paralelo por muito tempo.
2. Não usar webhook como única fonte de verdade sem ledger interno.
3. Não acoplar regra de monetização diretamente ao frontend.
