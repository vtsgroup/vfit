# 📚 VFIT Documentation Index

> **Atualizado:** 02/04/2026 · Toda documentação centralizada em `.claude/docs/`

---

## 📋 Documentos Ativos (13)

| Doc | Conteúdo | Público-alvo |
|-----|----------|--------------|
| [RULES.md](RULES.md) | Regras críticas de produção (19 regras) | Todos os agentes |
| [STACK.md](STACK.md) | Stack, infraestrutura, IDs CF, URLs | Todos os agentes |
| [CONVENTIONS.md](CONVENTIONS.md) | Padrões de código, imports, CSS | Todos os agentes |
| [DEPLOY.md](DEPLOY.md) | Pipeline deploy, WhatsApp, smoke auth, ops CF | Deploy / DevOps |
| [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) | Cores, contrastes WCAG, componentes UI, tokens | Frontend |
| [BACKEND.md](BACKEND.md) | ~150 endpoints, schemas, DB helpers, tabelas | Backend |
| [COST-OPTIMIZATION.md](COST-OPTIMIZATION.md) | Hierarquia de modelos, multiplicadores | GitHub Copilot |
| [CHANGELOG.md](CHANGELOG.md) | Histórico completo de deploys e mudanças | Referência |
| [ASAAS-INTEGRATION.md](ASAAS-INTEGRATION.md) | API Asaas completa, webhooks, pagamentos | Backend / Billing |
| [MEDIA-STRATEGY.md](MEDIA-STRATEGY.md) | R2 vs Stream vs Images vs Pages | Backend / Mídia |
| [PWA-MEGA-PLAN.md](PWA-MEGA-PLAN.md) | Service Worker, manifest, offline | Frontend / PWA |
| [TWA-DOCUMENTATION.md](TWA-DOCUMENTATION.md) | TWA: keystore, SHA-256, Play Store | Mobile / TWA |
| [WHATSAPP-GATEWAY.md](WHATSAPP-GATEWAY.md) | Gateway WhatsApp, notificações operacionais | Ops / WhatsApp |

---

## 🗂️ Subpastas

### `design-system/`

| Doc | Conteúdo |
|-----|----------|
| [MEGA-PLAN-DS-V4.md](design-system/MEGA-PLAN-DS-V4.md) | Plano completo Design System v4 |
| [vfit-design-system-v3-docs.md](design-system/vfit-design-system-v3-docs.md) | Spec completa DS v3 |

### `archive/` — Documentos históricos/legado

> Não são usados ativamente. Mantidos para referência histórica.

| Subpasta | Conteúdo |
|----------|----------|
| `legacy-plans/` | ULTRA-PLANO-MVP-PRODUCAO (sprints, auditorias, go/no-go) |
| `seo/` | Planos SEO antigos, production-ready |
| `operations/` | Releases, melhorias arquivadas |
| `audit/` | Auditorias de segurança e performance |
| `lighthouse/` | Sprints Lighthouse anteriores |
| `design-system/` | Redesign-final docs legados |
| `twa/` | Docs TWA antigos |
| `*.md` | 14 documentos individuais arquivados |

---

## 🔄 Sincronização

Os 6 docs core são sincronizados automaticamente para `.github/copilot-instructions.md`:

1. `COST-OPTIMIZATION.md`
2. `RULES.md`
3. `STACK.md`
4. `CONVENTIONS.md`
5. `DEPLOY.md`
6. `DESIGN-SYSTEM.md`

```bash
node scripts/sync-ai-docs.mjs  # Regenerar copilot-instructions.md
```

---

## 📍 Pontos de Entrada

| Agente | Começa por |
|--------|-----------|
| **Claude Code** | `CLAUDE.md` → `.claude/docs/RULES.md` → doc relevante |
| **GitHub Copilot** | `.github/copilot-instructions.md` (gerado automaticamente) |
| **Novo dev** | Este arquivo → `STACK.md` → `CONVENTIONS.md` |
