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

- `docs/ULTRA-PLANO-MVP-PRODUCAO/SLO-SLA-BASELINE.generated.md`
- `docs/ULTRA-PLANO-MVP-PRODUCAO/LOAD-TEST-BASELINE.generated.md`
- `docs/ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-DRILL.generated.md`
- `docs/ULTRA-PLANO-MVP-PRODUCAO/WEB-SECURITY-AUDIT.generated.md`

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

1. `https://api.iapersonal.app.br/health` (intervalo 1 min)
2. `https://iapersonal.app.br` (intervalo 1 min)

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

- `WHATSAPP_NOTIFY_URL` (ex.: https://whatsapp.iapersonal.app.br/task-notify)
- `WHATSAPP_NOTIFY_TOKEN` (Bearer = `ADMIN_AUTH_TOKEN` do gateway)
- `WHATSAPP_GROUP_NAME` (opcional; fallback)
- `WHATSAPP_LINK_URL` (opcional; ex.: https://iapersonal.app.br)
- `WHATSAPP_ACTOR_LABEL` (opcional)

Regras obrigatórias do formato estão em: [docs/WHATSAPP-GATEWAY.md](docs/WHATSAPP-GATEWAY.md)

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
- **URL**: https://api.iapersonal.app.br
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
