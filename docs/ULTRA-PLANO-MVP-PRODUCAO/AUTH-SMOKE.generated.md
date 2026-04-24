# Authenticated Smoke Report (Gerado automaticamente)

> Gerado em: 2026-04-24T04:49:25.346Z
> Base URL: https://api.vfit.app.br
> test_run_id: run-20260424044925-auth
> session_id: session-smoke-1777006165

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
| Personal: auth/me | GET | /api/v1/auth/me | passed | 200 | 1074.4 | 9f127b37b985e0fd-GIG | - |
| Personal: students list (seed) | GET | /api/v1/students?page=1&per_page=1 | passed | 200 | 664.81 | 9f127b3dfba7e0fd-GIG | - |
| Personal: seed student_id | GET | /api/v1/students?page=1&per_page=1 | skipped | - | 0 | - | nenhum aluno disponível para smoke autenticado |
| Student: auth/me | GET | /api/v1/auth/me | passed | 200 | 643.87 | 9f127b422d44e0fd-GIG | - |
| Payments: my list | GET | /api/v1/payments/my?page=1&per_page=5 | passed | 200 | 625.25 | 9f127b463f09e0fd-GIG | - |
| Checkout auth route: pix (expect not-found on fake/isolated payment) | POST | /api/v1/payments/c9098c86-c21a-47ab-84fd-51b869ef7d93/pay | passed | 404 | 664.03 | 9f127b4a18b7e0fd-GIG | - |
| Checkout auth route: boleto (expect not-found on fake/isolated payment) | POST | /api/v1/payments/c9098c86-c21a-47ab-84fd-51b869ef7d93/pay | passed | 404 | 468.44 | 9f127b4e4a2be0fd-GIG | - |
| Checkout auth route: credit_card (expect not-found on fake/isolated payment) | POST | /api/v1/payments/c9098c86-c21a-47ab-84fd-51b869ef7d93/pay | passed | 404 | 466.02 | 9f127b513b37e0fd-GIG | - |
| Admin: feedback list | GET | /api/v1/admin/feedback?page=1&per_page=5 | passed | 200 | 699.8 | 9f127b541ccee0fd-GIG | - |
| Admin: feedback detail (from user smoke) | GET | /api/v1/admin/feedback/{feedback_id} | skipped | - | 0 | - | mutations desabilitadas; feedback_id não é gerado (SMOKE_ALLOW_MUTATIONS=1 para habilitar) |

## Evidências de contexto
- student_id utilizado: (não definido)
- feedback_id criado: (não criado)
- payment_id criado: (não criado)

## Notas de segurança
- O script não imprime token em logs.
- Checkout é validado com pagamento isolado/fake quando não há contexto de cobrança real.
- Para execução controlada em produção, usar conta de teste e janela operacional aprovada.
