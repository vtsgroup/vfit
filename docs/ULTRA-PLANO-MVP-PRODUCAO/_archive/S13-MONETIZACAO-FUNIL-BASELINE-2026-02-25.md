# S13 — Monetização (Funil) Baseline

> Data: 25/02/2026

## Objetivo
Padronizar leitura do funil de monetização no produto para aumentar previsibilidade de receita.

## Funil inicial
1. Cobrança criada
2. Cobrança confirmada/paga
3. Cobrança vencida
4. Conversão líquida

## KPIs
- `conversion_paid_rate = total_confirmed / (total_confirmed + total_pending)`
- `overdue_rate = total_overdue / (total_confirmed + total_pending + total_overdue)`
- `platform_fee_capture = platform_fees / total_revenue`

## Fontes atuais
- `useAdminStats()` em [src/hooks/use-admin.ts](src/hooks/use-admin.ts)
- painel admin em [src/app/dashboard/admin/page.tsx](src/app/dashboard/admin/page.tsx)

## Critério de saída S13
- KPI de conversão de cobrança disponível no painel admin.
- KPI de inadimplência disponível no painel admin.
- Regra operacional documentada para ação quando conversão cair/inadimplência subir.

## Update S13.1 — Implementado (25/02/2026)

- Entrega aplicada no painel admin em [src/app/dashboard/admin/page.tsx](src/app/dashboard/admin/page.tsx):
	- Conversão paga (%), inadimplência por valor (%) e captura de taxa (%).
	- Bloco de decisão operacional automática com thresholds de ação.
- Resultado: baseline S13 deixou de ser apenas diagnóstico e passou a ter leitura operacional ativa no produto.
