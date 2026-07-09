# 🗄️ Runbook — Divergência de Banco (Neon) `.env.local` ↔ Produção

> **Incidente:** 2026-07-09 · Saques PIX em produção retornando 500 em cascata.
> **Status:** ✅ Resolvido · prod reconciliado com o histórico de migrations.

---

## TL;DR

O banco que o `.env.local` aponta **NÃO é o banco de produção**. São dois endpoints Neon distintos:

| | Host | Papel | Atividade |
|---|---|---|---|
| **Stale / dev** | `ep-lucky-meadow-acqd6iue.sa-east-1.aws.neon.tech` | é o que está no `.env.local` (`DATABASE_URL` / `NEON_DATABASE_URL`) | **parou em 06/04/2026** (último `app_logs`) |
| **Produção REAL** | `ep-dark-cherry-acytzooy-pooler.sa-east-1.aws.neon.tech` | secret `DATABASE_URL` do Worker `vfit-api` (usado por `pgQuery` em `lib/db.ts`) | ativo |

**Consequência:** toda migration aplicada localmente (`run-migration-neon.mjs`, `db:self-check`) caiu na branch **stale**, nunca em produção. A produção acumulou migrations faltantes → 500 em qualquer rota que use tabelas/colunas/constraints novos.

> ⚠️ **NUNCA** assuma que `.env.local` = produção. Para migrar prod, use a URL real (ver *Processo correto* abaixo).

---

## Como a produção diverge do repo (causa raiz)

1. A arquitetura de Postgres **não usa Hyperdrive nem tooling de migration versionado** — `pgQuery` (`lib/db.ts`) fala direto com `env.DATABASE_URL` (secret) via `@neondatabase/serverless`.
2. Migrations são aplicadas **à mão**: `DATABASE_URL=... node scripts/run-migration-neon.mjs <arquivo.sql>`.
3. Em ~06/04/2026 o secret `DATABASE_URL` do Worker foi repontado para um **novo endpoint** (`ep-dark-cherry`), mas o `.env.local` continuou no antigo (`ep-lucky-meadow`).
4. A partir daí, todo `run-migration-neon.mjs` local aplicou na branch **errada**. Prod ficou congelado no schema de ~abril + o que fosse aplicado por outros meios.

---

## O incidente (5 bloqueadores em cascata no saque PIX)

`POST /api/v1/payments/transfers/pix` (`workers/api/payments.ts:1810`) falhava. Cada fix revelava o próximo:

| # | Sintoma | Causa | Fix |
|---|---------|-------|-----|
| 1 | 500 `column idempotency_key does not exist` | migration `2026-07-08_withdrawal_idempotency` só na stale | `ADD COLUMN idempotency_key` + índices únicos em prod |
| 2 | 500 (sem msg) no `getCreatorConsultationLedgerStatus` | tabelas `consultation_*` (migrations 0034/0035) nunca criadas em prod | criadas em prod |
| 3 | — (bug de tipo) na criação | **0034/0035 declaravam `creator_id/student_id TEXT REFERENCES users(id)`, mas `users.id` é UUID** → `foreign key cannot be implemented` | colunas de FK de usuário → `UUID` (repo + prod) |
| 4 | 500 no INSERT do claim | `status='claiming'` não estava no CHECK `pix_transfers_status_check` (security-review 08/07 não migrou o constraint) | constraint recriado incluindo `claiming` |
| 5 | 500 no INSERT (chave aleatória) | `mapPixKeyType` retorna `EVP`→`'evp'`, mas `pix_key_type` CHECK só tinha `random` | constraint recriado incluindo `evp` |

**Reconciliação de schema (prod vs histórico completo):** além do acima, faltavam 2 colunas órfãs em prod, também aplicadas:
- `vfit_foods.barcode` (migration 0032)
- `workout_exercises.custom_video_url` (migration 0030)

Após os fixes, o diff de schema prod↔referência ficou **zerado** (fora as `consultation_*`, que prod agora tem a mais — correto).

### Bugs de código/migration corrigidos no repo (não só em prod)

- `migrations/hyperdrive/0034_consultation_commerce.sql` e `0035_consultation_ledger.sql`: `creator_id`/`student_id` `TEXT` → `UUID` (todos os ids do sistema são `crypto.randomUUID()`, ver `lib/db.ts:generateId`).
- `migrations/hyperdrive/2026-07-09_pix_transfers_status_keytype_constraints.sql` (**novo**): adiciona `claiming` ao status e `evp` ao pix_key_type — constraints que o security-review de 08/07 esqueceu.

---

## Processo correto para aplicar migration em PRODUÇÃO

1. Pegue a connection string **real** de prod: é o secret `DATABASE_URL` do Worker `vfit-api`. Endpoint = `ep-dark-cherry-acytzooy-pooler`. Fonte: Neon console (projeto de prod) — **não** copie do `.env.local`.
2. Rode apontando explicitamente para prod (não exporte no shell persistente; use inline):
   ```bash
   DATABASE_URL='postgresql://<user>:<pass>@ep-dark-cherry-acytzooy-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require' \
     node scripts/run-migration-neon.mjs migrations/hyperdrive/<arquivo>.sql
   ```
3. As migrations são idempotentes (`IF NOT EXISTS`, `DROP CONSTRAINT IF EXISTS`) → seguras para re-rodar.
4. Verifique com uma query de introspecção (ex: `information_schema.columns`, `pg_constraint`).

> 💡 **Recomendação:** unificar o `.env.local` para prod é **perigoso** (dev escreveria em prod). Melhor: manter uma var separada `DATABASE_URL_PROD` (fora do git) e um script `db:migrate:prod` explícito. Ou reconciliar a stale como ambiente de dev de verdade.

### Introspecção sem a connection string (fallback usado neste incidente)

Quando não se tem a URL real, dá pra descobrir o host e migrar **de dentro do Worker** (que conhece o `env.DATABASE_URL` real). Foi usado um endpoint temporário `POST /internal/db-admin` gated por secret `MIGRATION_TOKEN`, que:
- retornava `new URL(env.DATABASE_URL).host` (revela o endpoint real, sem vazar senha);
- rodava `sql[]` (DDL) e `query` (SELECT de introspecção) contra o banco real.

**Esse endpoint foi REMOVIDO após o uso** (não deixar rota de DDL em prod). O padrão fica documentado aqui caso precise de novo — recriar em branch, gated por `MIGRATION_TOKEN` (setar com `printf '%s'` sem newline; conferir `${#TOKEN}`=64), aplicar, e remover via deploy oficial.

---

## Checklist de verificação (pós-fix)

- [x] `pix_transfers.idempotency_key` e `payments.idempotency_key` existem
- [x] `consultation_offers/orders/sessions/ledger_events` existem (FK de usuário = UUID)
- [x] `pix_transfers_status_check` inclui `claiming`
- [x] `pix_transfers_pix_key_type_check` inclui `evp`
- [x] `vfit_foods.barcode`, `workout_exercises.custom_video_url` existem
- [x] diff de schema prod ↔ referência = 0
- [x] endpoint temporário `/internal/db-admin` removido; secret `MIGRATION_TOKEN` deletado
- [ ] **Pendente (produto):** testar um saque PIX real end-to-end (auth + step-up + Asaas)
