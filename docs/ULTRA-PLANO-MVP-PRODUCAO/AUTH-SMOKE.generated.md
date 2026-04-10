# Authenticated Smoke Report (Gerado automaticamente)

> Gerado em: 2026-04-10T21:51:25.156Z
> Base URL: https://api.vfit.app.br
> test_run_id: run-20260410215125-auth
> session_id: session-smoke-1775857885

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
- Personal token: ausente
- Student token: ausente
- Admin token: ausente
- Personal préflight: expirado
- Student préflight: expirado
- Admin préflight: expirado

## Configuração operacional
- allow_mutations: false
- timeout_ms: 15000
- retries(GET): 1

## Resumo
- Passou: **0**
- Falhou: **0**
- Skipped: **3**

## Execuções
| Fluxo | Método | Rota | Status | HTTP | Latência (ms) | request_id | Observação |
|---|---|---|---|---:|---:|---|---|
| Personal: auth/me | GET | /api/v1/auth/me | skipped | - | 0 | - | token não informado para este fluxo |
| Student: auth/me | GET | /api/v1/auth/me | skipped | - | 0 | - | token não informado para este fluxo |
| Admin: feedback list | GET | /api/v1/admin/feedback?page=1&per_page=5 | skipped | - | 0 | - | token não informado para este fluxo |

## Evidências de contexto
- student_id utilizado: (não definido)
- feedback_id criado: (não criado)
- payment_id criado: (não criado)

## Notas de segurança
- O script não imprime token em logs.
- Checkout é validado com pagamento isolado/fake quando não há contexto de cobrança real.
- Para execução controlada em produção, usar conta de teste e janela operacional aprovada.
