# LOTE 01 — Fundação do Projeto

> **Status:** 🟡 Em andamento
> **Data início:** 2026-02-06

## O que foi feito

### 1. Inicialização do Projeto
- `npx create-next-app@latest` com TypeScript, Tailwind, ESLint, App Router, src/
- Downgrade para Next.js ^15.4.10 + React ^18.3.1 (estabilidade + CF compatibility)
- Tailwind CSS v4 com `@tailwindcss/postcss` e `@import "tailwindcss"`

### 2. Dependências Instaladas
**Runtime:**
- `next@^15.5.12`, `react@^18.3.1`, `react-dom@^18.3.1`
- `hono@^4.x` (backend Workers)
- `@hono/zod-validator`, `zod@^4.x`
- `replicate@^1.x` (AI)
- `zustand@^5.x` (state)
- `@tanstack/react-query@^5.x` (data fetching)
- `framer-motion@^12.x` (animations)
- `next-pwa` (PWA support)
- `bcryptjs`, `uuid`

**Dev:**
- `wrangler@^4.x`, `@cloudflare/workers-types`
- `tailwindcss@^4`, `@tailwindcss/postcss@^4`
- `typescript@^5`, `eslint@^9`, `eslint-config-next@^15.x`

### 3. Configuração Cloudflare
- `wrangler.toml` com bindings: D1, Hyperdrive, KV (3 namespaces), R2 (2 buckets), Queues (4), Analytics Engine, Cron triggers
- `workers/types.ts` com tipagem completa de Bindings

### 4. Configuração da Aplicação
- `config/ai-models.ts` — Mapeamento dos 7 modelos de IA
- `config/constants.ts` — Planos, fees, badges, rate limits, cache TTLs
- `lib/ai-prompts.ts` — 6 templates de prompts otimizados
- `lib/cache.ts` — Strategy de cache com stale-while-revalidate
- `lib/version.ts` — Auto-versioning

### 5. Documentação
- `docs/COPILOT-MEMORY.md` — Memória principal do Copilot
- `docs/PLANO-EXECUCAO.md` — Plano completo 21 lotes
- `docs/mvp/01-fundacao.md` — Este arquivo

## Decisões Técnicas

| Decisão | Motivo |
|---------|--------|
| Next.js 15 (não 16) | Estabilidade, App Router maduro, CF Pages compatible |
| React 18 (não 19) | Menos edge cases, ecossistema mais estável |
| Tailwind v4 | CSS-first config, @theme inline, melhor performance |
| Hono.js (não Express) | Ultra-rápido em Workers V8, tipado, < 14KB |
| Zustand (não Redux) | Simples, sem boilerplate, SSR-friendly |
| Zod v4 | Validação runtime + TS inference |

## Arquivos Criados Neste Lote

```
wrangler.toml
.env.example
workers/types.ts
config/ai-models.ts
config/constants.ts
config/index.ts
lib/version.ts
lib/cache.ts
lib/ai-prompts.ts
docs/COPILOT-MEMORY.md
docs/PLANO-EXECUCAO.md
docs/mvp/01-fundacao.md
scripts/update-version.js
scripts/deploy-pages.js
migrations/d1/.gitkeep
migrations/hyperdrive/.gitkeep
workers/api/.gitkeep
workers/cron/.gitkeep
workers/queues/.gitkeep
workers/middleware/.gitkeep
src/components/.gitkeep
src/hooks/.gitkeep
src/stores/.gitkeep
src/lib/.gitkeep
```

## Próximo Lote
**LOTE 02 — Schemas de Banco:** Migrations D1 + PostgreSQL completas.
