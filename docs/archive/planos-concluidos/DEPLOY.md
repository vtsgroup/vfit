# VFIT — Deploy Guide

> Atualizado em 17/02/2026

## Pré-requisitos

1. **Conta Cloudflare** com Workers, Pages, D1, KV, R2 configurados
2. **Banco PostgreSQL** (gerenciado) — conexão via `DATABASE_URL` (fallback legado: `NEON_DATABASE_URL`)
3. **wrangler** instalado (`npx wrangler` ou global)
4. **Node.js 20+**

> ⚠️ Hyperdrive está configurado mas BYPASSED — `neon()` HTTP driver é incompatível com TCP.

## Secrets do Worker (13 — todos ✅ configurados)

```bash
# Auth
wrangler secret put JWT_SECRET
wrangler secret put JWT_REFRESH_SECRET

# Database (padrão novo)
wrangler secret put DATABASE_URL

# Database (legado — manter só durante migração)
wrangler secret put NEON_DATABASE_URL

# Pagamentos (PRODUÇÃO)
wrangler secret put ASAAS_API_KEY          # Prefixo $aact_ = produção
wrangler secret put ASAAS_WEBHOOK_TOKEN    # Token forte (64 hex chars)
wrangler secret put STRIPE_SECRET_KEY

# IA
wrangler secret put REPLICATE_API_TOKEN

# Push Notifications
wrangler secret put ONESIGNAL_APP_ID       # 3043de4e-d7aa-4fa1-a61b-5abea28d2f47
wrangler secret put ONESIGNAL_REST_API_KEY

# Anti-bot (PRODUÇÃO — bypass removido)
wrangler secret put TURNSTILE_SECRET_KEY

# OAuth
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET

# Email
wrangler secret put RESEND_API_KEY
```

## Deploy Manual (apenas referência)

> ⚠️ Em produção, **não** executar deploy manual. Usar somente `npm run cf:deploy` (pipeline oficial).

### Frontend (Cloudflare Pages)

```bash
npm run build
CLOUDFLARE_ACCOUNT_ID=b0bf95d0fabb322ac3df37bd84ec0c77 npx wrangler pages deploy out --project-name=personal-ia-prod --commit-dirty=true
```

| Campo | Valor |
|---|---|
| Projeto Pages | `personal-ia-prod` |
| URL principal | https://iapersonal.app.br |
| URL fallback | https://personal-ia-prod.pages.dev |
| Output dir | `out/` (Next.js static export) |

### Backend (Cloudflare Workers)

```bash
npx wrangler deploy --env=""
```

| Campo | Valor |
|---|---|
| Worker name | `vfiti-api` |
| URL | https://api.iapersonal.app.br |
| Entry point | `workers/index.ts` |

### Migrations

#### D1 (dados estáticos — exercícios, templates)
```bash
npx wrangler d1 execute vfiti-exercises --remote --file=migrations/d1/0001_initial_schema.sql
npx wrangler d1 execute vfiti-exercises --remote --file=migrations/d1/0002_seed_data.sql
npx wrangler d1 execute vfiti-exercises --remote --file=migrations/d1/0003_expanded_exercises.sql
```

#### PostgreSQL (Neon) — via script dedicado
```bash
DATABASE_URL="$DATABASE_URL" node scripts/run-migration-neon.mjs migrations/hyperdrive/ARQUIVO.sql
```

**Migrations disponíveis (7):**
| # | Arquivo | Descrição |
|---|---|---|
| 1 | `0001_initial_schema.sql` | Schema base (17 tabelas) |
| 2 | `0002_admin_subscriptions_transfers.sql` | Admin, subscriptions, pix_transfers |
| 3 | `0003_ai_usage_logs.sql` | Tabela ai_usage_logs + indexes |
| 4 | `0004_chat_tables.sql` | conversations + messages + 6 indexes |
| 5 | `0005_oauth_cpf_nullable.sql` | CPF nullable para OAuth |
| 6 | `0006_consultoria_marketplace.sql` | Consultoria + marketplace fields |
| 7 | `0007_user_passkeys.sql` | Tabela user_passkeys para WebAuthn |

#### PostgreSQL via psql direto
```bash
/opt/homebrew/opt/libpq/bin/psql "$NEON_DATABASE_URL"
```

## Deploy Automatizado (Scripts)

```bash
# Pipeline completo (backup + build + deploy + tag)
npm run cf:deploy           # Patch (1.0.x)
npm run cf:deploy:minor     # Minor (1.x.0)
npm run cf:deploy:major     # Major (x.0.0)

# Dry-run
npm run cf:deploy:dry

# Componentes individuais
npm run cf:backup           # Backup D1/KV antes de deploy
npm run cf:pages            # Deploy somente Pages
npm run wrangler:deploy     # Deploy somente Workers
```

## 🔐 Gate obrigatório antes de deploy

Antes de qualquer deploy (incluindo hotfix), executar obrigatoriamente:

```bash
npm run smoke:auth:local
```

Critério de aprovação:
- `Falhou: 0` em [docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md](docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md)
- `SMOKE_PERSONAL_TOKEN` e `SMOKE_STUDENT_TOKEN` válidos no `.env.local`

Se falhar, o deploy deve ser bloqueado até correção.

## Logs e Debug

```bash
# Logs em tempo real
npx wrangler tail --format=pretty

# Listar secrets
npx wrangler secret list

# Health check
curl -s "https://api.iapersonal.app.br/health" | jq
```

## ⚠️ Regra Pós-Deploy

> **OBRIGATÓRIO:** Após cada deploy, atualizar a documentação na mesma sessão:
> - `CHANGELOG.md` — entry com data e mudanças
> - Arquivo relevante (BACKEND.md, PLANO-EXECUTIVO.md, etc.)
> - Números em COPILOT-MEMORY.md se mudaram
   - Deploy Workers → Cloudflare Workers

## 📲 WhatsApp Gateway (Unipile) — Mensagens de tarefa (OBRIGATÓRIO)

Para tarefas operacionais relevantes (deploy, hotfix, migração, gate, auditoria, etc.), deve existir **mensagem de início** e **mensagem de fim** no grupo WhatsApp.

- Gateway: https://whatsapp.iapersonal.app.br
- Doc completa: [docs/WHATSAPP-GATEWAY.md](docs/WHATSAPP-GATEWAY.md)

### Regra

1) Sempre enviar `event=start` no começo.
2) Sempre enviar `event=end` no final.
3) No `end`, sempre incluir `started_at` + `ended_at` para o worker calcular e exibir **Duração**.
4) Mensagem deve seguir template padronizado (início e fechamento) com o **mesmo `task_id`**.

> Regra obrigatória absoluta: toda ação operacional iniciada deve abrir com `start` e encerrar com `end`. Sem os dois eventos, a execução é não conforme.

### Template obrigatório (início/fim)

**Início (start):**

```text
[🤖 Developer Agent]

⏱️ Iniciando etapa: <descrição objetiva da tarefa>

Por que agora: <motivo curto ligado ao objetivo do dia>
Resultado esperado: <ganho prático esperado>

ID: <TASK_ID>
Início (BRT): <DD/MM, HH:mm>
```

**Fim (end):**

```text
[🤖 Developer Agent]

✅ Finalizado: <descrição objetiva da entrega>

Resultado direto: <resultado final em 1 frase assertiva>
Motivo: <motivo em 1 frase, sem repetir resultado>
Vantagem prática: <benefício direto para operação/usuário>

ID: <TASK_ID>
Início (BRT): <DD/MM, HH:mm>
Fim (BRT): <DD/MM, HH:mm>
Duração: <calculada automaticamente>
Versão: <opcional>

Status: <resultado final>
```

> O cálculo de duração é obrigatório e depende de `started_at` + `ended_at`.
> Sem `started_at`, o evento `end` deve ser considerado inválido.

> O pipeline [scripts/cf-deploy.js](scripts/cf-deploy.js) exige start/end por padrão. Sem `WHATSAPP_NOTIFY_URL` e `WHATSAPP_NOTIFY_TOKEN`, o deploy falha (exceto com bypass explícito `--allow-no-whatsapp`).

## Variáveis de Ambiente (.env)

Copie `.env.example` e configure:

```bash
cp .env.example .env.local
```

Variáveis principais:
- `NEXT_PUBLIC_API_URL` — URL da API (Workers)
- `NEXT_PUBLIC_APP_URL` — URL do frontend (Pages)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — OAuth Google
- `NEXT_PUBLIC_FACEBOOK_APP_ID` — OAuth Facebook
