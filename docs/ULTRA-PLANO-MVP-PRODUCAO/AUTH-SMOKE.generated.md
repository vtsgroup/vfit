# Authenticated Smoke Report (Gerado automaticamente)

> Gerado em: 2026-05-12T04:19:05.638Z
> Base URL: https://api.vfit.app.br
> test_run_id: run-20260512041905-auth
> session_id: session-smoke-1778559545

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
- Abra `https://vfit.app.br/dashboard/admin/smoke` e gere tokens temporários para colar no terminal usando `read -s`.

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
| Personal: auth/me | GET | /api/v1/auth/me | passed | 200 | 4706.58 | 9fa69fa2792a6487-GIG | - |
| Personal: students list (seed) | GET | /api/v1/students?page=1&per_page=1 | passed | 200 | 680.05 | 9fa69fa7f9ea6487-GIG | - |
| Chat: create/get conversation | POST | /api/v1/chat/conversations | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Feedback (user): create | POST | /api/v1/feedback | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Payments: create local pending (no Asaas) | POST | /api/v1/payments | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Student: auth/me | GET | /api/v1/auth/me | passed | 200 | 665.52 | 9fa69fac3a5a6487-GIG | - |
| Payments: my list | GET | /api/v1/payments/my?page=1&per_page=5 | passed | 200 | 683.43 | 9fa69fb06ad96487-GIG | - |
| Checkout auth route: pix (expect not-found on fake/isolated payment) | POST | /api/v1/payments/268da969-4a5a-4001-8da7-3f05aadc34e7/pay | passed | 404 | 648.38 | 9fa69fb4ab686487-GIG | - |
| Checkout auth route: boleto (expect not-found on fake/isolated payment) | POST | /api/v1/payments/268da969-4a5a-4001-8da7-3f05aadc34e7/pay | passed | 404 | 480.32 | 9fa69fb8bbca6487-GIG | - |
| Checkout auth route: credit_card (expect not-found on fake/isolated payment) | POST | /api/v1/payments/268da969-4a5a-4001-8da7-3f05aadc34e7/pay | passed | 404 | 489.53 | 9fa69fbbcc0d6487-GIG | - |
| Admin: feedback list | GET | /api/v1/admin/feedback?page=1&per_page=5 | passed | 200 | 959.62 | 9fa69fbedc636487-GIG | - |
| Admin: feedback detail (from user smoke) | GET | /api/v1/admin/feedback/{feedback_id} | skipped | - | 0 | - | mutations desabilitadas; feedback_id não é gerado (SMOKE_ALLOW_MUTATIONS=1 para habilitar) |

## Evidências de contexto
- student_id utilizado: ef5f0cfa-d1a0-4027-8fb6-6f8ec4e56388
- feedback_id criado: (não criado)
- payment_id criado: (não criado)

## Notas de segurança
- O script não imprime token em logs.
- Checkout é validado com pagamento isolado/fake quando não há contexto de cobrança real.
- Para execução controlada em produção, usar conta de teste e janela operacional aprovada.
