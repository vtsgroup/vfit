# Authenticated Smoke Report (Gerado automaticamente)

> Gerado em: 2026-04-16T22:16:48.876Z
> Base URL: https://api.vfit.app.br
> test_run_id: run-20260416221648-auth
> session_id: session-smoke-1776377808

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
- Skipped: **2**

## Execuções
| Fluxo | Método | Rota | Status | HTTP | Latência (ms) | request_id | Observação |
|---|---|---|---|---:|---:|---|---|
| Personal: auth/me | GET | /api/v1/auth/me | passed | 200 | 569.19 | 9ed68e7a6d5bcb10-GIG | - |
| Personal: students list (seed) | GET | /api/v1/students?page=1&per_page=1 | passed | 200 | 288.51 | 9ed68e7d5fc0cb10-GIG | - |
| Personal: seed student_id | GET | /api/v1/students?page=1&per_page=1 | skipped | - | 0 | - | nenhum aluno disponível para smoke autenticado |
| Student: auth/me | GET | /api/v1/auth/me | passed | 200 | 245.28 | 9ed68e7f293ecb10-GIG | - |
| Payments: my list | GET | /api/v1/payments/my?page=1&per_page=5 | passed | 200 | 228.01 | 9ed68e80aa62cb10-GIG | - |
| Checkout auth route: pix (expect not-found on fake/isolated payment) | POST | /api/v1/payments/22af3bc6-918b-4197-a6fa-8c8f9b56736c/pay | passed | 404 | 257.94 | 9ed68e822b46cb10-GIG | - |
| Checkout auth route: boleto (expect not-found on fake/isolated payment) | POST | /api/v1/payments/22af3bc6-918b-4197-a6fa-8c8f9b56736c/pay | passed | 404 | 46.75 | 9ed68e83bcc7cb10-GIG | - |
| Checkout auth route: credit_card (expect not-found on fake/isolated payment) | POST | /api/v1/payments/22af3bc6-918b-4197-a6fa-8c8f9b56736c/pay | passed | 404 | 47.23 | 9ed68e840d01cb10-GIG | - |
| Admin: feedback list | GET | /api/v1/admin/feedback?page=1&per_page=5 | passed | 200 | 274.47 | 9ed68e845d45cb10-GIG | - |
| Admin: feedback detail (from user smoke) | GET | /api/v1/admin/feedback/{feedback_id} | skipped | - | 0 | - | mutations desabilitadas; feedback_id não é gerado (SMOKE_ALLOW_MUTATIONS=1 para habilitar) |

## Evidências de contexto
- student_id utilizado: (não definido)
- feedback_id criado: (não criado)
- payment_id criado: (não criado)

## Notas de segurança
- O script não imprime token em logs.
- Checkout é validado com pagamento isolado/fake quando não há contexto de cobrança real.
- Para execução controlada em produção, usar conta de teste e janela operacional aprovada.
