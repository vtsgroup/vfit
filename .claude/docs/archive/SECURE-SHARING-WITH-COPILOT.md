# Compartilhar contexto com o Copilot (seguro)

Este guia explica como **me dar evidências** (config/migrations/PSQL) sem expor segredos.

## Regras (não negociar)

- **NUNCA** cole aqui:
  - `DATABASE_URL`, `NEON_DATABASE_URL`, tokens, chaves, cookies, JWT, headers `Authorization`.
  - outputs que contenham connection strings.
- **NÃO commite** segredos em arquivo (nem em `.env`, nem em `wrangler.toml`).
- Prefira sempre **provar** que está OK com **outputs redigidos** (sem valores sensíveis).

## O que você pode me enviar com segurança

- IDs e bindings (não-secret):
  - Hyperdrive `id` (já fica em `wrangler.toml`)
  - KV namespace IDs
  - R2 bucket names
  - nomes de variáveis/secrets (apenas o *nome*, sem valor)
- Outputs *sem segredos* de comandos:
  - `wrangler --version`
  - `npm run -s type-check:workers`
  - `npm test` (se não vazar tokens)
  - `curl -sS https://api.iapersonal.app.br/health` (resposta não deve conter secrets)

## Como habilitar acesso ao Postgres sem me mostrar a senha

### Opção A (recomendada): você executa, me envia o resultado
1) Rode a migration **localmente** usando o secret no seu terminal (sem colar aqui):
   - `NEON_DATABASE_URL=*** node scripts/run-migration-neon.mjs migrations/hyperdrive/0011_app_logs.sql`
2) Me envie apenas:
   - ✅ sucesso/erro
   - nome do arquivo aplicado
   - eventual stacktrace **sem** connection string

### Opção B: endpoint de “DB self-check” (sem vazar segredos)
Se você quiser, eu posso implementar um endpoint admin que:
- roda `SELECT 1` no Postgres via Hyperdrive
- retorna **somente** `ok/error` + latência aproximada
- (opcional) grava em `app_logs`

Assim você (super_admin) testa em produção e me envia só o JSON.

## Inventário de segurança (já existe)

- Rode: `npm run security:inventory`
- Se o output incluir algo sensível, **não cole** inteiro.
  - Cole só: lista de chaves (nomes) + status (present/missing)

## Como eu “verifico se está perfeito”

Eu consigo confirmar 100% apenas com:
- migration aplicada no Postgres (evidência de sucesso)
- um self-check (query simples) em produção
- e um smoke mínimo gerando 1 log e listando na UI

Sem isso, eu consigo validar o **código/config**, mas não o estado real do banco.
