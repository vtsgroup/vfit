# VFIT Sprint — TWA Smart Entry + Onboarding Fix + D1 Sync + Dashboard Visual Polish

**Data:** 2026-04-02  
**Versão:** v1.0.2 → v1.1.0  
**Executor:** GitHub Copilot via Opus 4.6  
**Contexto:** Handoff from Claude Code planning

---

## Sumário Executivo

Este sprint resolve 4 problemas críticos + 1 melhoria visual no VFIT:

| ID | Problema | Impacto | Prioridade |
|----|----|-------|-----------|
| **P1** | TWA abre `/dashboard` direto para novos usuários (sem auth) | Onboarding quebra, usuários veem erro | **CRÍTICA** |
| **P2** | POST `/plans/generate` falha no fim do quiz (17 passos) | "Ops! Algo deu errado" — conversão interrompida | **CRÍTICA** |
| **P3** | Treinos criados não vão para D1 | PWA offline não funciona; sem sync | **ALTA** |
| **P4** | Dashboard sem visual polish (layout dark navy) | UX genérica, sem destaque de marca | **MÉDIA** |

---

## Arquivos deste Plano

- **[01-ARCHITECTURE.md](./01-ARCHITECTURE.md)** — Arquitetura geral, fluxos, diagramas ASCII
- **[02-PHASE-1-TWA-ENTRY.md](./02-PHASE-1-TWA-ENTRY.md)** — P1: TWA startUrl inteligente
- **[03-PHASE-2-ONBOARDING-FIX.md](./03-PHASE-2-ONBOARDING-FIX.md)** — P2: POST /plans/generate corrigido
- **[04-PHASE-3-D1-SYNC.md](./04-PHASE-3-D1-SYNC.md)** — P3: Treinos → D1 migration
- **[05-PHASE-4-VISUAL-POLISH.md](./05-PHASE-4-VISUAL-POLISH.md)** — P4: Dashboard dark navy + header DS
- **[06-TESTING-STRATEGY.md](./06-TESTING-STRATEGY.md)** — Estratégia de testes por fase
- **[07-DEPLOYMENT-CHECKLIST.md](./07-DEPLOYMENT-CHECKLIST.md)** — Deploy, WhatsApp, rollback

---

## Ordem de Execução Recomendada

1. **Fase 1: TWA Entry** (30 min, sem blockers)
   - Mover `startUrl` em `twa-manifest.json`
   - Adicionar auth check em `welcome/page.tsx`
   
2. **Fase 2: Onboarding Fix** (2-3h, blockers)
   - Investigar POST `/plans/generate`
   - Corrigir payload ou schema Zod
   - Testar quiz completo end-to-end
   
3. **Fase 3: D1 Sync** (1.5-2h, após Phase 2)
   - Criar migration D1 para `user_workouts_cache`
   - Modificar `workers/api/plans.ts` + `ai.ts`
   - Testar com `wrangler d1 execute`
   
4. **Fase 4: Visual Polish** (1-1.5h, independente)
   - Revisar header.tsx (já usa DS components)
   - Garantir tokens CSS corretos
   - Testar dark mode no showcase

---

## Critérios de Sucesso (DoD)

- [ ] TWA abre `/welcome` → se logado → `/dashboard`
- [ ] Quiz 17 passos completa → plano gerado SEM erro
- [ ] Treino novo aparece em D1 via `SELECT * FROM user_workouts_cache`
- [ ] Header usa `<Button>` DS + `<DSIcon>` (zero hex colors inline)
- [ ] `npm run type-check` e `npm run lint` passam
- [ ] Smoke auth (`npm run smoke:auth:local`) — success
- [ ] WhatsApp notificações start/end enviadas

---

## Dependências de Código

```
Phase 1 (TWA)
  └─> Independente (sem blockers)

Phase 2 (Onboarding)
  ├─> Depende: onboarding-store.ts (já existe)
  ├─> Depende: plan-generation.ts schema (já existe)
  └─> Bloqueador: precisa passar para Phase 3

Phase 3 (D1 Sync)
  ├─> Bloqueado por: Phase 2 (treinos salvos em PostgreSQL primeiro)
  ├─> Depende: workers/api/plans.ts, ai.ts
  └─> Requer: D1 migration + wrangler build

Phase 4 (Visual)
  ├─> Independente (não bloqueia nada)
  ├─> Depende: components/layout/header.tsx
  └─> Depende: components/ui/button, ds-icon (já existem)
```

---

## Checklist do Orquestrador (você — Claude Code)

- [ ] Ler todos os 7 arquivos de plano na ordem
- [ ] Apresentar ao usuário para aprovação ANTES de invocar Copilot
- [ ] Invocar `/plan-eng-review` com contexto completo
- [ ] Compilar feedback do usuário + plano-eng-review
- [ ] Criar handoff document para Copilot
- [ ] Acompanhar progresso via WhatsApp task-notify (start/end por fase)
- [ ] Validar criterios DoD ao final de cada fase
- [ ] Criar PR + merge workflow

---

## Stack Resumido

| Camada | Tech |
|--------|------|
| TWA | Bubblewrap + twa-manifest.json |
| Frontend | Next.js 15 App Router + Zustand + TanStack Query |
| Workers | Hono + Cloudflare Workers |
| DB | Neon PostgreSQL (Hyperdrive) + Cloudflare D1 |
| AI | Workers AI (Llama) + Replicate fallback |
| Styling | Tailwind v4 + CSS vars `--ds-*` |
