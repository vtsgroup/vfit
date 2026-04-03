# VFIT Sprint Tracking — Real-Time Status

**Data Início:** 2026-04-03  
**Meta Conclusão:** 2026-04-03 EOD  
**Total Estimado:** 5.5 horas

---

## Timeline Executado

```
10:00 — Planejamento iniciado
10:30 — Arquitetura completa
11:00 — Phase 1-4 docs criados
11:30 — Testing strategy definida
12:00 — Deploy checklist pronto
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Planejamento total: 2h
Copilot pode começar: 🟢 PRONTO
```

---

## Phase 1: TWA Entry — 22 min estimado

**Status:** ⏳ BLOQUEADO (aguardando Copilot)

- [ ] Atualizar `twa/twa-manifest.json` — startUrl=/welcome
- [ ] Atualizar `twa/config/twa-manifest.json` — idem
- [ ] Adicionar auth redirect em `welcome/page.tsx`
- [ ] Teste local — verificar redirects
- [ ] Commit: `feat(twa): update startUrl to /welcome`

**Início esperado:** Imediatamente  
**Fim esperado:** 22 min depois

---

## Phase 2: Onboarding Fix — 2-3h estimado

**Status:** ⏳ BLOQUEADO (depende Phase 1, mas pode começar em paralelo)

**Sub-tasks:**
- [ ] **Investigação (30 min)**
  - [ ] Ler payload em loading/page.tsx (linhas 72-87)
  - [ ] Comparar com generatePlanInputSchema
  - [ ] Testar payload com curl local
  - [ ] Verificar IA fallback + timeout
  
- [ ] **Fix Implementation (45 min)**
  - [ ] Ajustar enum values (se necessário)
  - [ ] Melhorar JSON parsing (se necessário)
  - [ ] Verificar days count validation
  - [ ] Testar fallback template
  
- [ ] **Testing (30 min)**
  - [ ] Teste E2E: 17 steps → plano gerado
  - [ ] Teste error retry logic
  - [ ] Verificar sessionStorage
  
- [ ] **Deploy (15 min)**
  - [ ] Type check + lint
  - [ ] Commit: `feat(onboarding): fix POST /plans/generate`
  - [ ] Deploy com WhatsApp notification

**Início esperado:** 10:25 (após Phase 1 start, pode ser paralelo)  
**Fim esperado:** 13:00

---

## Phase 3: D1 Sync — 1h 45min estimado

**Status:** ⏳ BLOQUEADO (depende Phase 2)

**Sub-tasks:**
- [ ] **Migration (15 min)**
  - [ ] Criar `migrations/d1/0005_user_workouts_cache.sql`
  - [ ] Aplicar: `wrangler d1 migrations apply vfit-exercises --remote`
  
- [ ] **Code Changes (45 min)**
  - [ ] Modificar `workers/api/plans.ts` (POST /save + /regenerate)
  - [ ] Verificar `workers/api/ai.ts` (se gera planos)
  - [ ] Adicionar D1 INSERT com error handling
  
- [ ] **Testing (20 min)**
  - [ ] Teste local: INSERT to D1
  - [ ] Verificar: `SELECT * FROM user_workouts_cache`
  - [ ] Teste error case (D1 fail, PostgreSQL success)
  
- [ ] **Deploy (15 min)**
  - [ ] Commit: `feat(d1): add user_workouts_cache sync`
  - [ ] Deploy + verify D1 table exists

**Início esperado:** 13:15 (após Phase 2)  
**Fim esperado:** 15:00

---

## Phase 4: Visual Polish — 1h estimado

**Status:** ⏳ BLOQUEADO (independente, pode ser paralelo)

**Sub-tasks:**
- [ ] **Audit (30 min)**
  - [ ] Grep para `<button>` em layout files
  - [ ] Classificar como CTA ou nav
  - [ ] Verificar DSIcon usage
  - [ ] Verificar Tailwind v4 syntax
  
- [ ] **Changes (20 min)**
  - [ ] Converter logout button para `<Button variant="danger">`
  - [ ] Verificar sidebar + mobile-nav
  - [ ] Zero lucide-react imports
  
- [ ] **Teste (10 min)**
  - [ ] Dark mode contrast check
  - [ ] Visual inspection em mobile + desktop
  
- [ ] **Deploy (10 min)**
  - [ ] Commit: `feat(dashboard): polish header with DS components`
  - [ ] Type check + lint

**Início esperado:** 12:00 (paralelo com Phase 2)  
**Fim esperado:** 13:00

---

## Critical Path

```
Phase 1 (22 min)
    ↓
Phase 2 (2-3h) ← BLOQUEADOR
    ↓
Phase 3 (1h 45min) ← BLOQUEADO POR PHASE 2

Phase 4 (1h) ← PARALELO COM PHASES 2-3
```

**Critical path duration:** Phase 1 + Phase 2 + Phase 3 = **4h 45min**

---

## WhatsApp Notifications Enviadas

- [ ] START (após planejamento aprovado)
- [ ] Phase 1 COMPLETE
- [ ] Phase 2 COMPLETE
- [ ] Phase 3 COMPLETE
- [ ] Phase 4 COMPLETE
- [ ] END (release v1.1.0)

---

## Handoff para Copilot

**Quando:** Assim que usuário aprovar plano  
**Como:** Arquivo `COPILOT-HANDOFF.md` (próximo arquivo)

---

## DoD Checklist (Pronto?)

### Phase 1
- [ ] TWA abre /welcome (novo usuário)
- [ ] Usuário logado → /dashboard direto

### Phase 2
- [ ] Quiz 17 passos → plano gerado
- [ ] POST /plans/generate sem erro

### Phase 3
- [ ] D1 table existe
- [ ] Treino novo → user_workouts_cache
- [ ] `SELECT COUNT(*)` > 0

### Phase 4
- [ ] Header usa `<Button>`
- [ ] Todos icons são `<DSIcon>`
- [ ] Dark mode contrast OK

### Geral
- [ ] `npm run type-check` ✅
- [ ] `npm run lint` ✅
- [ ] `npm run smoke:auth:local` ✅
- [ ] Commits seguem Conventional
- [ ] WhatsApp notifications enviadas

---

## Notas de Risco

⚠️ **Phase 2 é crítica** — se falhar, whole onboarding breaks  
⚠️ **Phase 3 requer migration** — rollback pode ser complexo  
⚠️ **TWA rebuild necessário** para realmente atualizar startUrl em produção

---

## Próximas Steps

1. Copilot executa Phases 1-4 conforme plano
2. User monitora via WhatsApp + repo commits
3. Claude Code valida DoD ao final
4. PR → merge → release v1.1.0
