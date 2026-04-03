# docs/ — Índice de Documentação — VFIT

> **Como usar este índice**: encontre o tema que precisa abaixo e navegue diretamente ao arquivo.
> Arquivos em `archive/` e `ULTRA-PLANO-MVP-PRODUCAO/_archive/` são históricos — não refletem o estado atual.

---

## Contexto do agente (Claude / Copilot)

| O que precisar | Arquivo |
|---|---|
| Stack, convenções, comandos essenciais | `CLAUDE.md` (raiz do projeto) |
| Arquitetura detalhada (fluxo de dados, módulos) | `.claude/docs/architecture.md` |
| Convenções de código (TypeScript, imports, hooks) | `.claude/docs/conventions.md` |
| Design System (componentes, ícones, tokens) | `.claude/docs/design-system.md` |
| Workers / Hono (rotas, bindings, lib) | `.claude/docs/workers.md` |
| Testes (Vitest + Playwright) | `.claude/docs/testing.md` |
| Deploy (cf:deploy, quality gate, migrations) | `.claude/docs/deploy.md` |
| Instruções para GitHub Copilot | `.github/copilot-instructions.md` |

---

## Design System

| O que precisar | Arquivo |
|---|---|
| Spec completo DS v3 (componentes, tokens, dark mode) | `design-system/vfit-design-system-v3-docs.md` |
| Plano de execução / migração DS v3 | `design-system/PLANO-DE-EXECUCAO-DS-v3.md` |
| Cores, contraste WCAG, variáveis CSS | `DESIGN-SYSTEM-COLORS.md` |
| Design System da Landing Page | `DESIGN-SYSTEM-LP.md` |
| Lighthouse 100/100 — Regras para TODAS as páginas | `LIGHTHOUSE-RULES.md` |
| Sprint plan Lighthouse (pricing, executado v5.6.7) | `lighthouse/SPRINT-PLAN.md` |

---

## Backend e Infraestrutura

| O que precisar | Arquivo |
|---|---|
| API: rotas, modelos de dados, autenticação | `BACKEND.md` |
| Cloudflare: comandos wrangler, KV, D1, R2, backups | `CF-OPERATIONS.md` |
| IDs de recursos Cloudflare (account, zone, namespaces) | `INFRAESTRUTURA-CF.md` |
| Integração Asaas (pagamentos BR) | `ASAAS-INTEGRATION.md` |
| R2 Storage: upload, URLs assinadas, buckets | `R2-STORAGE.md` |
| WhatsApp Gateway (Unipile) | `WHATSAPP-GATEWAY.md` |
| XP e gamificação: regras, limites, contratos | `XP-GOVERNANCE.md` |

---

## Segurança e Operações

| O que precisar | Arquivo |
|---|---|
| Mapa de secrets Cloudflare (nomes, sem valores) | `ULTRA-PLANO-MVP-PRODUCAO/CLOUDFLARE-SECRETS-MAP.md` |
| Runbook de incident / rollback de emergência | `ULTRA-PLANO-MVP-PRODUCAO/INCIDENT-ROLLBACK-RUNBOOK.md` |
| Runbooks Neon backup/restore | `ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-RUNBOOK.md` |
| Runbook de rotação de secrets | `ULTRA-PLANO-MVP-PRODUCAO/SECRETS-ROTATION-RUNBOOK.md` |
| Quality gates e definition of done | `ULTRA-PLANO-MVP-PRODUCAO/QUALITY-GATES.md` |
| Checklist LGPD | `ULTRA-PLANO-MVP-PRODUCAO/LGPD-FLOW-CHECKLIST.md` |
| Checklist go-no-go MVP | `ULTRA-PLANO-MVP-PRODUCAO/GO-NO-GO-MVP.generated.md` |
| Tarefas abertas de migração de domínio | `MIGRATION-TASKS.md` |
| Como compartilhar contexto seguro com Copilot | `SECURE-SHARING-WITH-COPILOT.md` |

---

## Produto

| O que precisar | Arquivo |
|---|---|
| Estratégia PWA (service worker, push, offline) | `PWA-MEGA-PLAN.md` |
| TWA / Android (Play Store, digital asset links) | `TWA-DOCUMENTATION.md` + `twa/TWA-MEGA-PLAN.md` |
| Estratégia de mídia (R2/Stream/Images) | `MEDIA-STRATEGY.md` |

---

## SEO / Conteúdo

| O que precisar | Arquivo |
|---|---|
| Plano SEO production-ready (páginas, meta, estrutura) | `seo-production-ready/SEO-PLAN.md` |
| Plano geral de páginas SEO | `PLANO-PAGINAS-SEO-COMPLETO.md` |
| Backlog editorial: briefs de artigos (90) | `ULTRA-PLANO-MVP-PRODUCAO/MVP-SEO/ARTIGOS/` |
| Backlog editorial: briefs comparativos (13) | `ULTRA-PLANO-MVP-PRODUCAO/MVP-SEO/COMPARATIVOS/` |
| Backlog editorial: briefs landing pages (16) | `ULTRA-PLANO-MVP-PRODUCAO/MVP-SEO/LANDING-PAGES/` |
| KPIs e métricas SEO semanais | `ULTRA-PLANO-MVP-PRODUCAO/MVP-SEO/METRICAS/KPIS-SEMANAIS.md` |

---

## Releases e Histórico

| O que precisar | Arquivo |
|---|---|
| Changelog completo de todos os releases | `CHANGELOG.md` |
| Guia de otimização do Claude Code | `CLAUDE-CODE-OPTIMIZATION-MEGA-GUIDE.md` |

---

## Arquivados (histórico — não refletem estado atual)

| Pasta | O que contém |
|---|---|
| `archive/planos-concluidos/` | Planos de execução encerrados (MVP, redesign, admin, etc.) |
| `archive/redesign-final-v1/` | Plano master do redesign original (v1) |
| `archive/mvp-build-logs/` | Logs de construção do MVP por módulo |
| `archive/operacoes-pontuais/` | Registros de operações únicas (limpeza CF, migração secrets) |
| `ULTRA-PLANO-MVP-PRODUCAO/_archive/` | Relatórios de progresso e sprints encerrados (fev/mar 2026) |
