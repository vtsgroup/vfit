# 02 — Arquitetura e Fluxos

## Arquitetura alvo (12 meses)

```text
                 +-----------------------+
                 |   Student Billing     |
                 | vfit_subscriptions    |
                 +-----------+-----------+
                             |
                             v
+----------------+   +-------+--------+   +---------------------+
| Personal/Nutri |-->| Consultation  |-->| Ledger & Settlement |
| sem plano pago |   | Commerce API  |   | event-sourced       |
+----------------+   +-------+--------+   +---------------------+
                             |
                             v
                     +-------+--------+
                     | Delivery layer |
                     | chat/sessões   |
                     +----------------+
```

## Fluxo 1: aluno assina premium

```text
Aluno checkout -> pagamento API -> webhook -> confirmação interna -> entitlement ativo
```

Shadow paths:
- nil: cpf ausente -> erro validado.
- empty: plano inválido -> erro de contrato.
- error: webhook atrasado -> estado pendente com polling + timeout operacional.

## Fluxo 2: consultoria paga (exclusiva)

```text
Professional cria oferta -> aluno compra -> payment_confirmed -> sessão habilitada
```

Regras:
1. Sessão não pode ser iniciada se order.status != paid.
2. Mensagens premium de consultoria só são abertas com entitlement de order.
3. Qualquer tentativa de bypass gera evento de segurança no ledger.

## Fluxo 3: repasse e taxa

```text
order paid -> ledger credit bruto -> ledger debit fee plataforma -> ledger credit creator líquido
```

## Contratos de integração

1. Gateway externo (Asaas/Stripe) é processamento.
2. Ledger interno é verdade contábil da plataforma.
3. Estados externos não mudam sem reconciliação de evento interno.

## Fronteiras de autorização

1. student só compra e consome a própria consultoria.
2. professional/nutritionist só gerenciam ofertas e entregas próprias.
3. admin/super_admin têm acesso de auditoria e intervenção.
