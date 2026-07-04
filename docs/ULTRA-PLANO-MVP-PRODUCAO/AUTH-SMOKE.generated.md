# Authenticated Smoke Report (Gerado automaticamente)

> Gerado em: 2026-07-04T01:29:03.878Z
> Base URL: https://api.vfit.app.br
> test_run_id: run-20260704012903-auth
> session_id: session-smoke-1783128543

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
| Personal: auth/me | GET | /api/v1/auth/me | passed | 200 | 1407.29 | a15a5b5f59705c72-MIA | - |
| Personal: students list (seed) | GET | /api/v1/students?page=1&per_page=1 | passed | 200 | 679.79 | a15a5b65c9365c72-MIA | - |
| Personal: seed student_id | GET | /api/v1/students?page=1&per_page=1 | skipped | - | 0 | - | nenhum aluno disponível para smoke autenticado |
| Student: auth/me | GET | /api/v1/auth/me | passed | 200 | 683.53 | a15a5b6a08245c72-MIA | - |
| Payments: my list | GET | /api/v1/payments/my?page=1&per_page=5 | passed | 200 | 685.94 | a15a5b6e5f2a5c72-MIA | - |
| Checkout auth route: pix (expect not-found on fake/isolated payment) | POST | /api/v1/payments/53819dbb-67e9-4e7e-837f-53fc003a6e74/pay | passed | 404 | 530 | a15a5b72af165c72-MIA | - |
| Checkout auth route: boleto (expect not-found on fake/isolated payment) | POST | /api/v1/payments/53819dbb-67e9-4e7e-837f-53fc003a6e74/pay | passed | 404 | 477.06 | a15a5b75fb215c72-MIA | - |
| Checkout auth route: credit_card (expect not-found on fake/isolated payment) | POST | /api/v1/payments/53819dbb-67e9-4e7e-837f-53fc003a6e74/pay | passed | 404 | 452.38 | a15a5b78f82a5c72-MIA | - |
| Admin: feedback list | GET | /api/v1/admin/feedback?page=1&per_page=5 | passed | 200 | 907.96 | a15a5b7bcac55c72-MIA | - |
| Admin: feedback detail (from user smoke) | GET | /api/v1/admin/feedback/{feedback_id} | skipped | - | 0 | - | mutations desabilitadas; feedback_id não é gerado (SMOKE_ALLOW_MUTATIONS=1 para habilitar) |

## Evidências de contexto
- student_id utilizado: (não definido)
- feedback_id criado: (não criado)
- payment_id criado: (não criado)

## Notas de segurança
- O script não imprime token em logs.
- Checkout é validado com pagamento isolado/fake quando não há contexto de cobrança real.
- Para execução controlada em produção, usar conta de teste e janela operacional aprovada.
