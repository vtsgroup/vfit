# 🔑 INFRAESTRUTURA CLOUDFLARE - IDs & Recursos

> ⚠️ Este arquivo contém IDs de produção. NÃO commitar secrets/tokens.
> Última atualização: 2026-02-22

---

## 📋 Conta Cloudflare

| Campo | Valor |
|-------|-------|
| **Account Name** | victor.pt @ vts dev |
| **Account ID** | `b0bf95d0fabb322ac3df37bd84ec0c77` |
| **Email** | vts@victor.pt |
| **Auth Method** | OAuth Token (via `wrangler login`) |

---

## 🗄️ D1 Database (Cold Data)

| Campo | Valor |
|-------|-------|
| **Name** | `vfiti-exercises` |
| **Database ID** | `988c03d5-bf9a-4394-b65a-adebbe0b87e4` |
| **Region** | ENAM (Eastern North America) |
| **Binding** | `DB` |
| **Uso** | Exercise library, templates, muscle groups, series types |

---

## 📦 KV Namespaces

### KV_CACHE (Cache geral)
| Campo | Valor |
|-------|-------|
| **Title** | `KV_CACHE` |
| **ID** | `e7147f8855184a4a8f72307756596df4` |
| **Binding** | `KV_CACHE` |
| **Uso** | Cache de dados, profiles, exercises |

### KV_SESSIONS (Sessões de auth)
| Campo | Valor |
|-------|-------|
| **Title** | `KV_SESSIONS` |
| **ID** | `91d34b6725564de39e8ed891e742e76d` |
| **Binding** | `KV_SESSIONS` |
| **Uso** | JWT sessions, refresh tokens, TTL 24h |

### KV_RATE_LIMIT (Rate limiting)
| Campo | Valor |
|-------|-------|
| **Title** | `KV_RATE_LIMIT` |
| **ID** | `d94c62b1e8f248a6bd1ea6a11e18f09c` |
| **Binding** | `KV_RATE_LIMIT` |
| **Uso** | Contadores de rate limit por IP/rota |

---

## 🪣 R2 Buckets

### R2_VIDEOS
| Campo | Valor |
|-------|-------|
| **Bucket Name** | `personal-ia-videos` |
| **Binding** | `R2_VIDEOS` |
| **Custom Domain** | `videos.iapersonal.app.br` |
| **Storage Class** | Standard |
| **Uso** | Vídeos de exercícios (vertical 9:16 + horizontal 16:9) |

### R2_IMAGES
| Campo | Valor |
|-------|-------|
| **Bucket Name** | `personal-ia-images` |
| **Binding** | `R2_IMAGES` |
| **Custom Domain** | `images.iapersonal.app.br` |
| **Storage Class** | Standard |
| **Uso** | Fotos de avaliações, profile photos, logos, PDFs |

---

## 📮 Queues (a criar quando deploy do Worker)

| Queue | Binding | Uso |
|-------|---------|-----|
| `vfiti-email-sender` | `EMAIL_QUEUE` | Envio de emails |
| `vfiti-video-encoder` | `VIDEO_ENCODE_QUEUE` | Encoding de vídeos |
| `vfiti-pdf-generator` | `PDF_QUEUE` | Geração de PDFs |
| `vfiti-ai-batch` | `AI_QUEUE` | Batch de requests IA |

> ⚠️ Queues são criados automaticamente no primeiro deploy do Worker.

---

## 🔗 Hyperdrive

| Campo | Valor |
|-------|-------|
| **Name** | `vfiti-db` |
| **Binding** | `HYPERDRIVE` |
| **Connection** | PostgreSQL via Neon |
| **Status** | ⚠️ **Configurado mas BYPASSED** |
| **Motivo** | `neon()` HTTP driver é incompatível com Hyperdrive TCP (causa HTTP 530 error 1016) |
| **Solução atual** | `lib/db.ts` usa `NEON_DATABASE_URL` diretamente (HTTP) |
| **Solução futura** | Migrar de `neon()` para `Pool` de `@neondatabase/serverless` (suporta TCP) |

> ⚠️ Hyperdrive está comentado no `wrangler.toml`. Reativar somente após migrar para `Pool`.

---

## 📊 Analytics Engine

| Campo | Valor |
|-------|-------|
| **Binding** | `ANALYTICS` |
| **Uso** | Tracking de eventos (AI usage, payments, workouts) |

> Auto-criado no primeiro deploy do Worker.

---

## 🔐 Secrets (todos ✅ configurados via `wrangler secret put`)

| Secret | Status | Descrição |
|--------|--------|-----------|
| `JWT_SECRET` | ✅ Configurado | Chave para assinar JWT access tokens (HMAC-SHA256) |
| `JWT_REFRESH_SECRET` | ✅ Configurado | Chave para refresh tokens |
| `NEON_DATABASE_URL` | ✅ Configurado | Connection string PostgreSQL Neon (sa-east-1) |
| `ASAAS_API_KEY` | ✅ **Produção** | API key Asaas (prefixo `$aact_` = produção, `$aact_hmlg_` = sandbox) |
| `ASAAS_WEBHOOK_TOKEN` | ✅ Configurado | Token forte (64 hex chars) para validar webhooks |
| `STRIPE_SECRET_KEY` | ✅ Configurado | Gateway de pagamento secundário |
| `REPLICATE_API_TOKEN` | ✅ Configurado | Token da API Replicate (IA) |
| `RESEND_API_KEY` | ✅ Configurado | Email transacional via Resend |
| `ONESIGNAL_APP_ID` | ✅ Configurado | `3043de4e-d7aa-4fa1-a61b-5abea28d2f47` |
| `ONESIGNAL_REST_API_KEY` | ✅ Configurado | REST API key OneSignal (push) |
| `TURNSTILE_SECRET_KEY` | ✅ **Produção** | Cloudflare Turnstile captcha (bypass REMOVIDO 14/02/2026) |
| `GOOGLE_CLIENT_ID` | ✅ Configurado | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | ✅ Configurado | OAuth Google |

> ℹ️ Total: **13 secrets** configurados. Facebook OAuth removido (não implementado).

---

## 🌐 Domínios

| Domínio | Serviço | Status |
|---------|---------|--------|
| `iapersonal.app.br` | Cloudflare Pages (frontend) | ✅ Ativo |
| `vfit.pages.dev` | Cloudflare Pages (fallback) | ✅ Ativo |
| `vfiti-api.vd-b0b.workers.dev` | Cloudflare Workers (backend fallback) | ✅ Ativo |
| `api.iapersonal.app.br` | Custom domain Workers (backend) | ✅ Ativo |
| `videos.iapersonal.app.br` | R2 Public Access (vídeos) | ⬜ Pendente |
| `images.iapersonal.app.br` | R2 Public Access (imagens) | ⬜ Pendente |
| `stream.iapersonal.app.br` | CF Stream (video adaptive) | ⬜ Futuro (Sprint E) |

---

## 📹 Cloudflare Stream (Futuro — Sprint E)

| Campo | Valor |
|-------|-------|
| **Status** | ⬜ A configurar |
| **Uso** | Vídeos de exercícios >30s com adaptive bitrate (HLS/DASH) |
| **Pricing** | $5/1000 min storage + $1/1000 min viewed |
| **Setup** | Dashboard > Stream > Enable + criar API token |
| **Secret** | `CF_STREAM_API_TOKEN` (a criar) |

> Vídeos curtos (≤30s, ≤10MB) ficam em R2. Stream só para vídeos longos que precisam de qualidade adaptativa.

---

## 🖼️ Cloudflare Image Resizing (Futuro)

| Campo | Valor |
|-------|-------|
| **Status** | ⬜ A habilitar |
| **Uso** | Otimização on-the-fly de imagens R2 (resize, WebP/AVIF) |
| **URL Pattern** | `images.iapersonal.app.br/cdn-cgi/image/width=300,quality=80/path/to/image.jpg` |
| **Pricing** | $0.50/1000 transformations únicas |
| **Setup** | Dashboard > Speed > Optimization > Image Resizing > Enable |

> Estratégia completa: ver `docs/MEDIA-STRATEGY.md`

---

## 📝 Comandos Úteis

### Revogar token Wrangler sem exposição

> Procedimento padrão quando houver suspeita de vazamento de credencial.

```bash
# 1) Encerrar sessão local (pode retornar erro se já estiver deslogado)
npx wrangler logout || true

# 2) Apagar credencial local antiga
rm -f ~/.wrangler/config/default.toml

# 3) Fazer login novamente (manual, via browser OAuth)
npx wrangler login

# 4) Validar autenticação sem imprimir token
npx wrangler whoami
```

Regras rápidas:
- Nunca usar `cat ~/.wrangler/config/default.toml` em terminal/log compartilhado.
- Nunca exportar token (`export CF_TOKEN=...`) em shell persistente.
- Nunca logar header `Authorization`.

```bash
# Verificar conta
npx wrangler whoami

# Listar recursos
npx wrangler d1 list
npx wrangler kv namespace list
npx wrangler r2 bucket list

# Aplicar migrations D1
npx wrangler d1 execute vfiti-exercises --remote --file=migrations/d1/0001_initial_schema.sql

# Criar Hyperdrive (quando tiver Neon)
npx wrangler hyperdrive create vfiti-db --connection-string="$NEON_DATABASE_URL"

# Configurar secrets
npx wrangler secret put JWT_SECRET
npx wrangler secret put REPLICATE_API_TOKEN

# Deploy
npx wrangler deploy
```
