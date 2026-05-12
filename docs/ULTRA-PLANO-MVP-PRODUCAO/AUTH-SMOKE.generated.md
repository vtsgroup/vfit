# Authenticated Smoke Report (Gerado automaticamente)

> Gerado em: 2026-05-12T05:51:54.159Z
> Base URL: https://api.vfit.app.br
> test_run_id: run-20260512055154-auth
> session_id: session-smoke-1778565114

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
- Personal préflight: não informado
- Student préflight: não informado
- Admin préflight: válido

## Configuração operacional
- allow_mutations: false
- timeout_ms: 15000
- retries(GET): 1

## Resumo
- Passou: **9**
- Falhou: **0**
- Skipped: **4**

## Execuções
| Fluxo | Método | Rota | Status | HTTP | Latência (ms) | request_id | Observação |
|---|---|---|---|---:|---:|---|---|
| Admin: mint smoke tokens (super_admin) | POST | /api/v1/admin/smoke/tokens | passed | 200 | 1986.92 | 9fa7277ccaede013-GIG | - |
| Personal: auth/me | GET | /api/v1/auth/me | passed | 200 | 859.29 | 9fa727887c32e013-GIG | - |
| Personal: students list (seed) | GET | /api/v1/students?page=1&per_page=1 | passed | 200 | 633.98 | 9fa7278ddc97e013-GIG | - |
| Chat: create/get conversation | POST | /api/v1/chat/conversations | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Feedback (user): create | POST | /api/v1/feedback | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Payments: create local pending (no Asaas) | POST | /api/v1/payments | skipped | - | 0 | - | mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar) |
| Student: auth/me | GET | /api/v1/auth/me | passed | 200 | 609.49 | 9fa72791ccfbe013-GIG | - |
| Payments: my list | GET | /api/v1/payments/my?page=1&per_page=5 | passed | 200 | 596.3 | 9fa727959d46e013-GIG | - |
| Checkout auth route: pix (expect not-found on fake/isolated payment) | POST | /api/v1/payments/b6c35915-49e3-4809-b6d2-2e90a260a7f2/pay | passed | 404 | 711.54 | 9fa727995d99e013-GIG | - |
| Checkout auth route: boleto (expect not-found on fake/isolated payment) | POST | /api/v1/payments/b6c35915-49e3-4809-b6d2-2e90a260a7f2/pay | passed | 404 | 478.01 | 9fa7279dce1ae013-GIG | - |
| Checkout auth route: credit_card (expect not-found on fake/isolated payment) | POST | /api/v1/payments/b6c35915-49e3-4809-b6d2-2e90a260a7f2/pay | passed | 404 | 468.66 | 9fa727a0ce65e013-GIG | - |
| Admin: feedback list | GET | /api/v1/admin/feedback?page=1&per_page=5 | passed | 200 | 710.41 | 9fa727a3bea7e013-GIG | - |
| Admin: feedback detail (from user smoke) | GET | /api/v1/admin/feedback/{feedback_id} | skipped | - | 0 | - | mutations desabilitadas; feedback_id não é gerado (SMOKE_ALLOW_MUTATIONS=1 para habilitar) |

## Evidências de contexto
- student_id utilizado: 008688e2-5996-44c2-bc29-eb239b2cb834
- feedback_id criado: (não criado)
- payment_id criado: (não criado)

## Notas de segurança
- O script não imprime token em logs.
- Checkout é validado com pagamento isolado/fake quando não há contexto de cobrança real.
- Para execução controlada em produção, usar conta de teste e janela operacional aprovada.
