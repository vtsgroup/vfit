# Authenticated Smoke Report (Gerado automaticamente)

> Gerado em: 2026-05-12T05:13:16.041Z
> Base URL: https://api.vfit.app.br
> test_run_id: run-20260512051316-auth
> session_id: session-smoke-1778562796

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
| Personal: auth/me | GET | /api/v1/auth/me | passed | 200 | 906.66 | 9fa6eee60a0564bb-GIG | - |
| Personal: students list (seed) | GET | /api/v1/students?page=1&per_page=1 | passed | 200 | 635.98 | 9fa6eeeb1b3164bb-GIG | - |
| Chat: create/get conversation | POST | /api/v1/chat/conversations | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Feedback (user): create | POST | /api/v1/feedback | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Payments: create local pending (no Asaas) | POST | /api/v1/payments | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Student: auth/me | GET | /api/v1/auth/me | passed | 200 | 632.94 | 9fa6eeef1c0764bb-GIG | - |
| Payments: my list | GET | /api/v1/payments/my?page=1&per_page=5 | passed | 200 | 629.23 | 9fa6eef31cb864bb-GIG | - |
| Checkout auth route: pix (expect not-found on fake/isolated payment) | POST | /api/v1/payments/2e049096-2405-412c-b812-3e44454583d3/pay | passed | 404 | 600.39 | 9fa6eef70d7964bb-GIG | - |
| Checkout auth route: boleto (expect not-found on fake/isolated payment) | POST | /api/v1/payments/2e049096-2405-412c-b812-3e44454583d3/pay | passed | 404 | 494.49 | 9fa6eeface4e64bb-GIG | - |
| Checkout auth route: credit_card (expect not-found on fake/isolated payment) | POST | /api/v1/payments/2e049096-2405-412c-b812-3e44454583d3/pay | passed | 404 | 515.55 | 9fa6eefdeed764bb-GIG | - |
| Admin: feedback list | GET | /api/v1/admin/feedback?page=1&per_page=5 | passed | 200 | 684.35 | 9fa6ef012f4e64bb-GIG | - |
| Admin: feedback detail (from user smoke) | GET | /api/v1/admin/feedback/{feedback_id} | skipped | - | 0 | - | mutations desabilitadas; feedback_id não é gerado (SMOKE_ALLOW_MUTATIONS=1 para habilitar) |

## Evidências de contexto
- student_id utilizado: ef5f0cfa-d1a0-4027-8fb6-6f8ec4e56388
- feedback_id criado: (não criado)
- payment_id criado: (não criado)

## Notas de segurança
- O script não imprime token em logs.
- Checkout é validado com pagamento isolado/fake quando não há contexto de cobrança real.
- Para execução controlada em produção, usar conta de teste e janela operacional aprovada.
