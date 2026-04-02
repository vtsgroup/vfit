# Authenticated Smoke Report (Gerado automaticamente)

> Gerado em: 2026-02-28T19:06:41.154Z
> Base URL: https://api.iapersonal.app.br
> test_run_id: run-20260228190641-auth
> session_id: session-smoke-1772305601

## Como executar (sem vazar token)

Opção 1 — Tokens diretos (mais simples)
- exportar no terminal (sem eco):
  - `export SMOKE_PERSONAL_TOKEN=...`
  - `export SMOKE_STUDENT_TOKEN=...`
  - (opcional) `export SMOKE_ADMIN_TOKEN=...`

Opção 2 — Mint via super_admin (recomendado)
- Se você tiver `SMOKE_ADMIN_TOKEN`, o script consegue mintar tokens de personal/aluno automaticamente quando você informar o alvo:
  - `export SMOKE_ADMIN_TOKEN=...`
  - `export SMOKE_MINT_PERSONAL_EMAIL=...` (ou `SMOKE_MINT_PERSONAL_ID`)
  - `export SMOKE_MINT_STUDENT_EMAIL=...` (ou `SMOKE_MINT_STUDENT_ID`)

Opção 3 — UI (super_admin)
- Abra `https://iapersonal.app.br/dashboard/admin/smoke` e gere tokens temporários para colar no terminal usando `read -s`.

## Configuração de tokens
- Personal token: informado
- Student token: informado
- Admin token: informado
- Personal préflight: válido
- Student préflight: válido
- Admin préflight: válido

## Configuração operacional
- allow_mutations: false
- timeout_ms: 15000
- retries(GET): 1

## Resumo
- Passou: **8**
- Falhou: **0**
- Skipped: **4**

## Execuções
| Fluxo | Método | Rota | Status | HTTP | Latência (ms) | request_id | Observação |
|---|---|---|---|---:|---:|---|---|
| Personal: auth/me | GET | /api/v1/auth/me | passed | 200 | 4775.23 | 9d5233721f02d346-FRA | - |
| Personal: students list (seed) | GET | /api/v1/students?page=1&per_page=1 | passed | 200 | 614.28 | 9d523376ab5fd346-FRA | - |
| Chat: create/get conversation | POST | /api/v1/chat/conversations | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Feedback (user): create | POST | /api/v1/feedback | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Payments: create local pending (no Asaas) | POST | /api/v1/payments | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Student: auth/me | GET | /api/v1/auth/me | passed | 200 | 614.01 | 9d52337a8dded346-FRA | - |
| Payments: my list | GET | /api/v1/payments/my?page=1&per_page=5 | passed | 200 | 635.17 | 9d52337e686ad346-FRA | - |
| Checkout auth route: pix (expect not-found on fake/isolated payment) | POST | /api/v1/payments/67a35012-1d4d-4a26-897d-15c0e0597196/pay | passed | 404 | 550.9 | 9d523382bc37d346-FRA | - |
| Checkout auth route: boleto (expect not-found on fake/isolated payment) | POST | /api/v1/payments/67a35012-1d4d-4a26-897d-15c0e0597196/pay | passed | 404 | 600.21 | 9d523385eca0d346-FRA | - |
| Checkout auth route: credit_card (expect not-found on fake/isolated payment) | POST | /api/v1/payments/67a35012-1d4d-4a26-897d-15c0e0597196/pay | passed | 404 | 416.34 | 9d523389cf5dd346-FRA | - |
| Admin: feedback list | GET | /api/v1/admin/feedback?page=1&per_page=5 | passed | 200 | 827.19 | 9d52338c5e7ed346-FRA | - |
| Admin: feedback detail (from user smoke) | GET | /api/v1/admin/feedback/{feedback_id} | skipped | - | 0 | - | mutations desabilitadas; feedback_id não é gerado (SMOKE_ALLOW_MUTATIONS=1 para habilitar) |

## Evidências de contexto
- student_id utilizado: 5a810c22-e366-465a-a2eb-2fba69ae28ab
- feedback_id criado: (não criado)
- payment_id criado: (não criado)

## Notas de segurança
- O script não imprime token em logs.
- Checkout é validado com pagamento isolado/fake quando não há contexto de cobrança real.
- Para execução controlada em produção, usar conta de teste e janela operacional aprovada.
