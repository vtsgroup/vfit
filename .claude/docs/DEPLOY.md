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
- Evidência em `.claude/docs/archive/legacy-plans/AUTH-SMOKE.generated.md`
- Se houver `failed`: **deploy bloqueado** até correção

---

## WhatsApp Operacional — REGRA OBRIGATÓRIA

> **Documentação completa:** `.claude/docs/WHATSAPP-GATEWAY.md`

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
WHATSAPP_NOTIFY_URL=https://whatsapp.vfit.app.br/task-notify
WHATSAPP_NOTIFY_TOKEN=<ADMIN_AUTH_TOKEN>
```

---

## Documentação Pós-Deploy

Após CADA deploy, atualizar **na mesma sessão**:

1. `.claude/docs/CHANGELOG.md` — entry com data + mudanças
2. Arquivo relevante (backend→`.claude/docs/BACKEND.md`, migration→schema docs)
3. `.claude/docs/RULES.md` — se regras mudaram
# Operações Cloudflare — VFIT

> Guia de comandos para backup, deploy e manutenção do ambiente Cloudflare.
> Atualizado em 26/02/2026

---

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run cf:backup` | Backup de D1, KV e migrations |
| `npm run cf:deploy` | Deploy completo (patch: 1.0.0 → 1.0.1) |
| `npm run cf:deploy:minor` | Deploy com bump minor (1.0.0 → 1.1.0) |
| `npm run cf:deploy:major` | Deploy com bump major (1.0.0 → 2.0.0) |
| `npm run cf:deploy:dry` | Dry-run — simula deploy sem executar |
| `npm run cf:pages` | Deploy somente Pages (sem versão) |
| `npm run wrangler:deploy` | Deploy somente Workers |
| `npm run db:migrate:d1` | Aplicar migrations D1 |
| `npm run ops:slo:baseline` | Gerar baseline SLO/SLA inicial |
| `npm run ops:load:baseline` | Executar baseline de carga (cenários públicos) |
| `npm run ops:neon:drill` | Gerar runbook/evidência de backup+restore Neon |
| `npm run ops:web:audit` | Auditoria de headers e postura web de segurança |

---

## 🗂️ cf:backup

Faz backup dos dados do Cloudflare para o diretório local `backups/`.

### O que é salvo

| Recurso | Formato | Detalhes |
|---------|---------|----------|
| **D1 Database** | JSON por tabela | Tabelas de aplicação detectadas dinamicamente no D1 remoto |
| **D1 Schema** | SQL | DDL completo (`_schema.sql`) |
| **KV Keys** | JSON | Lista de chaves de cada namespace |
| **Migrations** | SQL | Cópia dos arquivos `migrations/d1/` e `migrations/hyperdrive/` |
| **Metadados** | JSON | Versão, timestamp, IDs dos recursos |

### Uso

```bash
npm run cf:backup
```

> Observação: o backup D1 usa `--remote` para consultar o banco Cloudflare remoto.

### Estrutura de saída

```
backups/
└── 2025-02-07T14-30-00/
    ├── backup-meta.json
    ├── d1/
    │   ├── _schema.sql
    │   ├── muscle_groups.json
    │   ├── exercises.json
    │   ├── workout_templates.json
    │   ├── series_types.json
    │   └── equipment_types.json
    ├── kv/
    │   ├── KV_CACHE_keys.json
    │   ├── KV_SESSIONS_keys.json
    │   └── KV_RATE_LIMIT_keys.json
    └── migrations/
        ├── d1/
        └── hyperdrive/
```

### Recursos Cloudflare

| Recurso | Nome / ID |
|---------|-----------|
| D1 Database | `vfiti-exercises` — `988c03d5-bf9a-4394-b65a-adebbe0b87e4` |
| KV Cache | `e7147f8855184a4a8f72307756596df4` |
| KV Sessions | `91d34b6725564de39e8ed891e742e76d` |
| KV Rate Limit | `d94c62b1e8f248a6bd1ea6a11e18f09c` |
| R2 Videos | `personal-ia-videos` |
| R2 Images | `personal-ia-images` |

---

## 📈 Baseline Operacional (S97-S98)

Conjunto de comandos para gerar evidências de monitoramento, performance e continuidade.

### Execução rápida

```bash
npm run ops:slo:baseline
npm run ops:load:baseline
npm run ops:neon:drill
npm run ops:web:audit
```

### Artefatos gerados

- `.claude/docs/archive/legacy-plans/SLO-SLA-BASELINE.generated.md`
- `.claude/docs/archive/legacy-plans/LOAD-TEST-BASELINE.generated.md`
- `.claude/docs/archive/legacy-plans/NEON-BACKUP-RESTORE-DRILL.generated.md`
- `.claude/docs/archive/legacy-plans/WEB-SECURITY-AUDIT.generated.md`

### Interpretação operacional mínima

- `ops:slo:baseline`: define metas iniciais e error budget para API/Auth/Payments.
- `ops:load:baseline`: estabelece referência p50/p95/p99 para comparação futura.
- `ops:neon:drill`: formaliza trilha de restore com critérios de aceite (RTO/RPO).
- `ops:web:audit`: valida headers críticos (CSP, HSTS, CORS e hardening).

---

## 👁️ Observabilidade (S97-R2)

### Sentry — variáveis mínimas

Frontend (`.env.local`):

```bash
NEXT_PUBLIC_SENTRY_DSN=<dsn-frontend>
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_RELEASE=<version>
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0
```

Worker (secret manager):

```bash
echo "<dsn-worker>" | npx wrangler secret put SENTRY_DSN_WORKER --env=""
echo "production" | npx wrangler secret put SENTRY_ENVIRONMENT --env=""
echo "<version>" | npx wrangler secret put SENTRY_RELEASE --env=""
echo "0" | npx wrangler secret put SENTRY_TRACES_SAMPLE_RATE --env=""
```

### Uptime monitor externo (runbook curto)

Monitores mínimos recomendados:

1. `https://api.vfit.app.br/health` (intervalo 1 min)
2. `https://vfit.app.br` (intervalo 1 min)

Alertas:

- Trigger: 2 falhas consecutivas
- Canal: email operacional + grupo técnico
- Escalonamento P0: indisponibilidade > 5 min

---

## 🚀 cf:deploy

Pipeline completo de deploy que executa em sequência:

```
Bump Versão → Update Files → Type Check → Lint → Build → Deploy Pages → Deploy Workers → Git Tag
```

### Uso

```bash
# Deploy padrão (patch: 1.0.0 → 1.0.1)
npm run cf:deploy

# Deploy minor (1.0.0 → 1.1.0)
npm run cf:deploy:minor

# Deploy major (1.0.0 → 2.0.0)
npm run cf:deploy:major

# Dry-run (simula tudo sem executar)
npm run cf:deploy:dry
```

### Opções avançadas (via node direto)

```bash
# Deploy somente Pages (sem Workers)
node scripts/cf-deploy.js patch --skip-workers

# Deploy somente Workers (sem Pages)
node scripts/cf-deploy.js minor --skip-pages

# Dry-run major
node scripts/cf-deploy.js major --dry-run

# Deploy (inclui WhatsApp gateway worker)
node scripts/cf-deploy.js patch --include-whatsapp
```

### Notificações automáticas no WhatsApp (deploy pipeline)

Quando configurado, o deploy pipeline envia mensagens `start/end` via gateway.

Variáveis de ambiente (local/CI):

- `WHATSAPP_NOTIFY_URL` (ex.: https://whatsapp.vfit.app.br/task-notify)
- `WHATSAPP_NOTIFY_TOKEN` (Bearer = `ADMIN_AUTH_TOKEN` do gateway)
- `WHATSAPP_GROUP_NAME` (opcional; fallback)
- `WHATSAPP_LINK_URL` (opcional; ex.: https://vfit.app.br)
- `WHATSAPP_ACTOR_LABEL` (opcional)

Regras obrigatórias do formato estão em: `.claude/docs/WHATSAPP-GATEWAY.md`

### Pipeline detalhado

| Etapa | Comando | Obrigatório |
|-------|---------|-------------|
| 1. Bump versão | `npm version {type}` | ✅ |
| 2. Update version files | `update-version.js` → `manifest.json` + `lib/version.ts` | ✅ |
| 3. Type check | `tsc --noEmit` | ✅ |
| 4. Lint | `eslint src/` | ⚠️ Opcional |
| 5. Build | `next build` | ✅ |
| 6. Deploy Pages | `wrangler pages deploy` → `vfit` | ✅* |
| 7. Deploy Workers | `wrangler deploy` | ⚠️ Opcional |
| 8. Git tag | `git tag v{version}` + commit | ⚠️ Opcional |

\* Pode ser pulado com `--skip-pages`

### Versionamento

O sistema usa [SemVer](https://semver.org/):

- **Patch** (1.0.**X**): Bug fixes, ajustes pequenos
- **Minor** (1.**X**.0): Novas features, melhorias
- **Major** (**X**.0.0): Breaking changes, redesigns

Arquivos atualizados automaticamente a cada deploy:
- `package.json` → campo `version`
- `public/manifest.json` → campo `version` (PWA)
- `lib/version.ts` → constantes `APP_VERSION`, `BUILD_DATE`, `BUILD_NUMBER`

---

## 🔄 Fluxo recomendado

### Deploy de rotina (bug fixes)

```bash
npm run cf:backup      # Backup antes
npm run cf:deploy      # Patch automático
git push --follow-tags # Push com tags
```

### Deploy de feature

```bash
npm run cf:backup
npm run cf:deploy:minor
git push --follow-tags
```

### Antes de mudanças no banco

```bash
npm run cf:backup                    # Backup OBRIGATÓRIO
npm run db:migrate:d1                # Aplicar migration
npm run cf:deploy:minor              # Deploy
```

---

## 🏗️ Infraestrutura

### Pages (Frontend)
- **Projeto**: `vfit`
- **URL**: https://vfit.pages.dev
- **Branch**: `main`
- **Output**: `out/` (Next.js static export)

### Workers (Backend API)
- **Nome**: `vfiti-api` (definido no `wrangler.toml`)
- **URL**: https://api.vfit.app.br
- **Bindings ativos**: D1, KV×3, R2×2, Analytics Engine
- **Bindings inativos**: Hyperdrive (bypassed — neon() HTTP incompatível com TCP), Queues×4, Crons×4 (free plan)

### Conta Cloudflare
- **Account ID**: `b0bf95d0fabb322ac3df37bd84ec0c77`
- **Email**: `vts@victor.pt`

---

## ⚠️ Troubleshooting

### "Wrangler not authenticated"
```bash
npx wrangler login
```

### Revogar token Wrangler com segurança (sem expor)

> Use este fluxo sempre que houver suspeita de exposição de credencial.

1. **Encerrar sessão local atual**
```bash
npx wrangler logout
```

2. **Revogar sessão/token no painel Cloudflare**
- Cloudflare Dashboard → Profile → **API Tokens / Connected Applications**
- Revogue a sessão/token relacionado ao Wrangler CLI

3. **Limpar credenciais locais antigas**
```bash
rm -f ~/.wrangler/config/default.toml
```

4. **Autenticar novamente com OAuth**
```bash
npx wrangler login
```

5. **Validar sem imprimir token**
```bash
npx wrangler whoami
```

#### Regras operacionais para não vazar token

- **Nunca** usar `cat ~/.wrangler/config/default.toml` em terminal compartilhado/gravado.
- **Nunca** exportar token em variável shell (`export CF_TOKEN=...`).
- **Nunca** registrar header `Authorization` em logs.
- Preferir comandos do Wrangler já autenticado (sem manipular token manualmente).
- Se precisar automação por API, usar token de curta duração e revogar ao final.

### Build falha no type-check
```bash
npm run type-check    # Ver erros
# Corrigir e tentar novamente
npm run cf:deploy
```

### Deploy Pages falha
```bash
# Verificar se o projeto existe
npx wrangler pages project list

# Deploy manual
npm run build
npm run cf:pages
```

### Restaurar backup D1
```bash
# Usar o arquivo SQL do schema
npx wrangler d1 execute vfiti-exercises --file=backups/<timestamp>/d1/_schema.sql

# Importar dados (precisa converter JSON → INSERT statements)
```
