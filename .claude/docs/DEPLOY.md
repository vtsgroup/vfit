# Deploy & Operações — VFIT

> Pipeline de deploy, WhatsApp, smoke auth, manutenção.

---

## Deploy (OBRIGATÓRIO via script)

```bash
npm run cf:deploy                              # patch bump + build + deploy + git push
node scripts/cf-deploy.js patch --msg "fix X"  # com mensagem personalizada
npm run cf:deploy:minor                        # minor version
npm run cf:deploy:major                        # major version
npm run cf:deploy:dry                          # simula sem executar
# Parcial:
node scripts/cf-deploy.js patch --skip-workers --msg "frontend only"
node scripts/cf-deploy.js patch --skip-pages --msg "API only"
```

> **🔴 NUNCA** `wrangler deploy` ou `wrangler pages deploy` isolado.
> **🔴 NUNCA** `git push` sem bump de versão.

---

## Comandos Essenciais

```bash
npm run dev               # Dev frontend (Next.js)
npm run wrangler:dev      # Dev worker local
npm run lint              # ESLint
npm run type-check        # TypeScript (frontend + workers)
npm run test              # Vitest (unit)
npm run test:e2e          # Playwright (E2E)
npm run quality:ci        # Gate completo (docs + security + lint + type + test + build)
```

---

## Manutenção de Dependências

### Wrangler (CF Workers CLI)

- **🔴 OBRIGATÓRIO:** Atualizar antes de CADA deploy e no início de cada sessão:

```bash
npm install -g wrangler@latest && wrangler --version
```

- **NUNCA** fazer deploy com wrangler desatualizado — causa warnings, bugs, falhas silenciosas

### Comandos Auxiliares

```bash
# Migration Neon
NEON_DATABASE_URL="$NEON_DATABASE_URL" node scripts/run-migration-neon.mjs migrations/hyperdrive/ARQUIVO.sql

# Secrets / Logs
echo "valor" | npx wrangler secret put NOME --env=""
npx wrangler tail --format=pretty
```

---

## Smoke Auth — Gate de Deploy

- Para qualquer QA final ou go/no-go: executar `npm run smoke:auth:local`
- `SMOKE_PERSONAL_TOKEN` + `SMOKE_STUDENT_TOKEN` devem estar válidos no `.env.local`
- Evidência em `docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md`
- Se houver `failed`: **deploy bloqueado** até correção

---

## WhatsApp Operacional — REGRA OBRIGATÓRIA

> **Documentação completa:** `docs/WHATSAPP-GATEWAY.md`

### Quando enviar (escopo)

| Ação | Exige start/end? |
|------|:----------------:|
| Deploy (cf:deploy) | ✅ Sim (automático) |
| Hotfix / Migração SQL / Rollback | ✅ Sim |
| Correção crítica em produção | ✅ Sim |
| Sprint/feature longa (30+ min) | ✅ Sim |
| Edição simples 1-2 arquivos | ❌ Não |
| Leitura/análise / Testes locais | ❌ Não |

### Como enviar — Helper Script

**SEMPRE usar** `scripts/whatsapp-task.mjs`:

```bash
# START (antes de iniciar)
node scripts/whatsapp-task.mjs start \
  --task-id "DEPLOY-2026-04-02-AM" \
  --title "Deploy v1.0.3 — descrição curta" \
  --priority "ALTA" \
  --actor "Developer Agent" \
  --why "motivo curto" \
  --expected "ganho esperado"

# END (após concluir)
node scripts/whatsapp-task.mjs end \
  --task-id "DEPLOY-2026-04-02-AM" \
  --title "Deploy v1.0.3 — descrição curta" \
  --status "success" \
  --actor "Developer Agent" \
  --deploy "v1.0.3" \
  --result "Resultado direto: frase assertiva" \
  --reason "Motivo: frase complementar" \
  --benefit "Vantagem prática: benefício direto"
```

### Atalhos npm

```bash
npm run notify:start -- --task-id ID --title "..." --priority ALTA --why "..." --expected "..."
npm run notify:end   -- --task-id ID --title "..." --status success --result "..." --reason "..." --benefit "..."
```

### Preview (sem enviar)

```bash
node scripts/whatsapp-task.mjs preview start --task-id ID --title "..." --priority ALTA --why "..." --expected "..."
```

### Padrão do task_id

Formato: `<CONTEXTO>-<DATA>-<PERIODO>`

Exemplos: `DEPLOY-2026-04-02-AM`, `HOTFIX-AUTH-2026-04-02-PM`, `MIGRATION-USERS-2026-04-02-AM`

### Tom de comunicação

- **Menos técnico, mais executivo/objetivo**
- No fechamento: frase direta, sem rodeios
- resultado/motivo/benefício devem ser **complementares, sem repetição**
- **NÃO** incluir 🤖 ou colchetes no `--actor` (Worker adiciona automaticamente)

### Variáveis necessárias (já em `.env.local`)

```
WHATSAPP_NOTIFY_URL=https://whatsapp.iapersonal.app.br/task-notify
WHATSAPP_NOTIFY_TOKEN=<ADMIN_AUTH_TOKEN>
```

---

## Documentação Pós-Deploy

Após CADA deploy, atualizar **na mesma sessão**:

1. `docs/CHANGELOG.md` — entry com data + mudanças
2. Arquivo relevante (backend→`BACKEND.md`, migration→schema docs)
3. `.claude/docs/RULES.md` — se regras mudaram
