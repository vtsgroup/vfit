<div align="center">

# VFIT

**SaaS completo para Personal Trainers**

Plataforma web + Android para gestão de alunos, treinos, avaliações, pagamentos e comunicação — tudo em um só lugar.

[![Deploy](https://img.shields.io/badge/deploy-cloudflare-F38020?logo=cloudflare&logoColor=white)](https://vfit.app.br)
[![Tests](https://img.shields.io/badge/tests-360%20passing-22C55E?logo=vitest&logoColor=white)](#testes)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](#)

</div>

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 15 · Tailwind CSS v4 · Zustand 5 · TanStack Query 5 |
| **Backend** | Hono.js v4 on Cloudflare Workers · ~150 endpoints |
| **Database** | Neon PostgreSQL 17 (26 tabelas) · D1 SQLite (cold data) |
| **Storage** | R2 (mídia) · KV (cache/sessions) · CF Stream (vídeos HLS) |
| **Payments** | Asaas (PIX/boleto/cartão) · Stripe |
| **Mobile** | TWA Android (Play Store) · PWA (iOS/desktop) |
| **Quality** | Vitest (360 tests) · Playwright E2E · GitHub Actions |

## Início rápido

```bash
# Instalar dependências
npm install

# Desenvolvimento local (frontend + API)
npm run dev

# Testes
npm run test           # unitários (Vitest)
npm run test:e2e       # E2E (Playwright)
npm run quality:ci     # gate completo
```

## Deploy

```bash
npm run cf:deploy                    # patch bump + build + deploy + git push
npm run cf:deploy:minor              # minor version
npm run cf:deploy:major              # major version
npm run cf:deploy:dry                # dry-run (simula sem executar)
```

> Deploy completo via `scripts/cf-deploy.js` — build, version bump, git tag, Wrangler deploy (Workers + Pages), notificação WhatsApp.

## Ambientes

| Ambiente | URL |
|----------|-----|
| **Frontend** | https://vfit.app.br |
| **API** | https://api.vfit.app.br |

## Estrutura

```
src/          → Frontend Next.js (48 pages, 76 hooks, 5 layouts)
workers/      → Backend Hono (17 sub-routers, ~150 endpoints)
lib/          → Shared utilities (DB, auth, errors, payments)
config/       → Constants, AI models, R2 CORS
twa/          → Android TWA (Play Store build pipeline)
migrations/   → SQL migrations (Neon + D1)
tests/        → Vitest unit tests (360+)
scripts/      → Deploy, backup, migration runners
docs/         → Architecture, operations, design system
```

## Documentação

| Doc | Conteúdo |
|-----|----------|
| [BACKEND.md](docs/BACKEND.md) | Todos os endpoints, schemas, middlewares |
| [DESIGN-SYSTEM-COLORS.md](docs/DESIGN-SYSTEM-COLORS.md) | Paleta, contrastes WCAG, regras |
| [CF-OPERATIONS.md](docs/CF-OPERATIONS.md) | Deploy, secrets, bindings, backup |
| [TWA-DOCUMENTATION.md](docs/TWA-DOCUMENTATION.md) | Android TWA: build, keystore, Play Store |
| [MEDIA-STRATEGY.md](docs/MEDIA-STRATEGY.md) | R2 vs Stream vs Images, custos |

---

<div align="center">
  <sub>Built with ☕ and 🏋️ by VFIT Team</sub>
</div>
