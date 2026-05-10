# Authenticated Smoke Report (Gerado automaticamente)

> Gerado em: 2026-05-10T02:07:54.192Z
> Base URL: https://api.vfit.app.br
> test_run_id: run-20260510020754-auth
> session_id: session-smoke-1778378874

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
- Admin token: ausente
- Personal préflight: válido
- Student préflight: válido
- Admin préflight: expirado

## Configuração operacional
- allow_mutations: false
- timeout_ms: 15000
- retries(GET): 1

## Resumo
- Passou: **7**
- Falhou: **0**
- Skipped: **2**

## Execuções
| Fluxo | Método | Rota | Status | HTTP | Latência (ms) | request_id | Observação |
|---|---|---|---|---:|---:|---|---|
| Personal: auth/me | GET | /api/v1/auth/me | passed | 200 | 1305.49 | 9f95649c4f3dcae7-GIG | - |
| Personal: students list (seed) | GET | /api/v1/students?page=1&per_page=1 | passed | 200 | 766.79 | 9f9564a40a8ccae7-GIG | - |
| Personal: seed student_id | GET | /api/v1/students?page=1&per_page=1 | skipped | - | 0 | - | nenhum aluno disponível para smoke autenticado |
| Student: auth/me | GET | /api/v1/auth/me | passed | 200 | 656.21 | 9f9564a8dcb2cae7-GIG | - |
| Payments: my list | GET | /api/v1/payments/my?page=1&per_page=5 | passed | 200 | 628.77 | 9f9564acfed0cae7-GIG | - |
| Checkout auth route: pix (expect not-found on fake/isolated payment) | POST | /api/v1/payments/5051efaf-f4a8-4330-9392-51eac9a879b5/pay | passed | 404 | 711.3 | 9f9564b0e87ecae7-GIG | - |
| Checkout auth route: boleto (expect not-found on fake/isolated payment) | POST | /api/v1/payments/5051efaf-f4a8-4330-9392-51eac9a879b5/pay | passed | 404 | 486.76 | 9f9564b55ab6cae7-GIG | - |
| Checkout auth route: credit_card (expect not-found on fake/isolated payment) | POST | /api/v1/payments/5051efaf-f4a8-4330-9392-51eac9a879b5/pay | passed | 404 | 490.78 | 9f9564b86c17cae7-GIG | - |
| Admin: feedback list | GET | /api/v1/admin/feedback?page=1&per_page=5 | skipped | - | 0 | - | token não informado para este fluxo |

## Evidências de contexto
- student_id utilizado: (não definido)
- feedback_id criado: (não criado)
- payment_id criado: (não criado)

## Notas de segurança
- O script não imprime token em logs.
- Checkout é validado com pagamento isolado/fake quando não há contexto de cobrança real.
- Para execução controlada em produção, usar conta de teste e janela operacional aprovada.
