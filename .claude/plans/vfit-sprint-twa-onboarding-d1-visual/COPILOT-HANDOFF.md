# 🚀 Copilot Handoff — Pronto para Executar

**Para:** GitHub Copilot + Opus 4.6  
**Contexto:** VFIT v1.0.2 → v1.1.0 Sprint  
**Plano:** Completo em `.claude/plans/vfit-sprint-twa-onboarding-d1-visual/`

---

## Tl;dr do Sprint

Resolve 4 problemas críticos em 4 phases:

| ID | Problema | Fix | Files |
|---|---|---|---|
| **P1** | TWA abre `/dashboard` sem auth | startUrl → `/welcome` | `twa-manifest.json` (2 files) + `welcome/page.tsx` |
| **P2** | POST `/plans/generate` falha no quiz | Corrigir payload/schema | `loading/page.tsx`, `plans.ts`, `plan-generation.ts` |
| **P3** | Treinos não vão ao D1 | Criar `user_workouts_cache` + sync | D1 migration + `plans.ts`, `ai.ts` |
| **P4** | Dashboard sem visual polish | Button + DSIcon everywhere | `header.tsx` + audit |

**Tempo total:** 5.5h (1 dia)

---

## Como Começar

### 1. Ler Plano (ordem)

```
1. README.md — overview
2. 01-ARCHITECTURE.md — entender fluxos
3. 02-PHASE-1-TWA-ENTRY.md — primeira task
4. 03-PHASE-2-ONBOARDING-FIX.md — investigar + fix
5. 04-PHASE-3-D1-SYNC.md — migration + sync
6. 05-PHASE-4-VISUAL-POLISH.md — polish
7. 06-TESTING-STRATEGY.md — como testar
8. 07-DEPLOYMENT-CHECKLIST.md — deploy
```

### 2. Setup Local

```bash
cd /Users/macos/Development/apps/vfit-production

# Estamos em feature branch
git branch
# → feat/vfit-sprint-planning

# Dev mode
npm run dev & npm run wrangler:dev
```

### 3. Executar Phases

**Phase 1 (22 min):**
```bash
# 1. Edit twa/twa-manifest.json — change startUrl to /welcome
# 2. Edit twa/config/twa-manifest.json — same change
# 3. Edit src/app/(onboarding)/welcome/page.tsx — add auth redirect effect
# 4. Test local
# 5. Commit
git commit -m "feat(twa): update startUrl to /welcome"
```

**Phase 2 (2-3h):**
```bash
# Investigar: ler loading/page.tsx + plans.ts + schema
# Debug: testar POST /plans/generate com curl
# Fix: ajustar payload ou schema conforme necessário
# Teste: completar 17 steps, verificar plan gerado
git commit -m "feat(onboarding): fix POST /plans/generate"
```

**Phase 3 (1h 45min):**
```bash
# 1. Criar migrations/d1/0005_user_workouts_cache.sql
# 2. Aplicar migration: wrangler d1 migrations apply vfit-exercises --remote
# 3. Modificar workers/api/plans.ts (add D1 INSERT)
# 4. Testar: verificar D1 table
git commit -m "feat(d1): add user_workouts_cache sync"
```

**Phase 4 (1h):**
```bash
# 1. Audit layout components (header, sidebar, mobile-nav)
# 2. Converter logout button para <Button variant="danger">
# 3. Verificar Dark mode contrast
git commit -m "feat(dashboard): polish header with DS components"
```

### 4. Deploy

```bash
# PRÉ-DEPLOY
npm run type-check
npm run lint
npm run test
npm run test:e2e
npm run smoke:auth:local

# DEPLOY
npm run cf:deploy

# PÓS-DEPLOY
# Verificar manualmente em staging/prod
# Enviar WhatsApp notification (end)
```

---

## Critical Decisions Already Made

### Phase 1
✅ **Decision:** Use `/welcome` como startUrl, não `/dashboard`  
**Why:** Smart router — redireciona se autenticado

### Phase 2
✅ **Decision:** Fix payload OR schema OR ambos  
**Investigation needed:** Ler error logs primeiro

### Phase 3
✅ **Decision:** D1 como "cache" (não source-of-truth)  
**Why:** PostgreSQL é live, D1 é offline fallback
⚠️ **Note:** D1 insert MUST NOT fail the whole request (continue on D1 error)

### Phase 4
✅ **Decision:** Logout button → `<Button variant="danger">`  
**Why:** Ação destrutiva, Rule 14 requer `<Button>`
✅ **Decision:** Manter nav links como `<Link>` (não `<Button>`)  
**Why:** Semanticamente correto, não são CTAs

---

## Red Flags to Watch

🚩 **Phase 2 Blocker:** Se POST /plans/generate falhar ainda depois do fix, precisa investigação mais profunda (IA timeout? JSON parse? Schema muito restritivo?)

🚩 **Phase 3 Risk:** D1 migration pode falhar em produção se schema estiver errado. Sempre `--local` first, then `--remote`

🚩 **Phase 4 Safe:** Geralmente seguro, pode ser reverted facilmente se quebrar

---

## Files to Touch (Completa)

### Phase 1
- `twa/twa-manifest.json` (1 line change)
- `twa/config/twa-manifest.json` (1 line change)
- `src/app/(onboarding)/welcome/page.tsx` (add useEffect)

### Phase 2
- `src/app/(onboarding)/onboarding/loading/page.tsx` (lines 72-87: verify payload)
- `workers/api/plans.ts` (lines 28-118: fix POST /generate)
- `workers/schemas/plan-generation.ts` (verify schema)
- `lib/ai-prompts.ts` (if exists: check prompt template)

### Phase 3
- `migrations/d1/0005_user_workouts_cache.sql` (NEW)
- `workers/api/plans.ts` (lines 123-167, 399-445: add D1 INSERT)
- `workers/api/ai.ts` (if generates plans: add D1 INSERT)

### Phase 4
- `src/components/layout/header.tsx` (line 262-268: logout button)
- `src/components/layout/sidebar.tsx` (audit)
- `src/components/layout/mobile-nav.tsx` (audit)

---

## Testing Quick Reference

```bash
# Phase 1
npm run dev
# Open http://localhost:3000/welcome (no auth)
# Expect: hero + "Começar" button
# Mock auth + reload
# Expect: redirect to /dashboard

# Phase 2
npm run dev & npm run wrangler:dev
# Complete 17 steps in onboarding
# Expect: plan generated, no error

# Phase 3
wrangler d1 execute vfit-exercises --remote \
  --command "SELECT COUNT(*) FROM user_workouts_cache"
# Expect: > 0 (if already synced test data)

# Phase 4
npm run dev
# Open /dashboard in dark mode
# Expect: header visible, all icons crisp, no contrast issues
```

---

## Status Updates via WhatsApp

Send these messages as you progress:

**Phase 1 Complete:**
```
✅ Phase 1 (TWA Entry) — 22 min
├─ twa-manifest.json updated
├─ welcome/page.tsx auth redirect added
└─ Tests passed
```

**Phase 2 Complete:**
```
✅ Phase 2 (Onboarding Fix) — 2h 15m
├─ POST /plans/generate payload validated
├─ IA fallback working
├─ 17 steps → plan generated ✅
└─ E2E test passed
```

**Phase 3 Complete:**
```
✅ Phase 3 (D1 Sync) — 1h 45m
├─ D1 migration applied
├─ workers/api/plans.ts modified
├─ Treino novo → user_workouts_cache ✅
└─ Verified: SELECT COUNT(*) > 0
```

**Phase 4 Complete:**
```
✅ Phase 4 (Visual Polish) — 1h
├─ Header refactored: <Button> + <DSIcon>
├─ Dark mode contrast verified
├─ All tests passed
└─ Ready for deployment
```

**Sprint End:**
```
✅ VFIT Sprint v1.1.0 Complete
━━━━━━━━━━━━━━━━━━━━━━
All 4 phases ✅
All tests ✅
All docs ✅
Ready to deploy 🚀

Branch: feat/vfit-sprint-planning
Commits: 4 (Conventional)
```

---

## Troubleshooting

### If Phase 2 Fails
1. Check `wrangler tail` for /plans/generate error
2. Verify payload matches schema (use curl to test)
3. Check AI fallback is working
4. If all else fails: refer to 03-PHASE-2-ONBOARDING-FIX.md for detailed debugging

### If Phase 3 Fails
1. Check D1 migration error: `wrangler d1 migrations apply --local` first
2. Verify D1 binding in wrangler.toml
3. If INSERT fails: catch error, log to Sentry, continue (don't fail request)

### If Phase 4 Fails
1. Check Next.js build error
2. Verify Button component has `variant="danger"` option
3. Can safely revert if needed

---

## Remember

- ✅ Read the plan files in order
- ✅ Send WhatsApp notification at start + each phase completion
- ✅ Run tests before deployment
- ✅ Use `--local` first for anything risky (D1, migration)
- ✅ Follow Conventional Commits format
- ✅ No force-push, no --no-verify
- ⚠️ Phase 2 is critical — if it fails, whole onboarding breaks
- ⚠️ Phase 3 requires care with D1 migration

---

## You're Ready!

Plano está 100% completo. Você tem:
- ✅ Architecture diagram
- ✅ Step-by-step tasks per phase
- ✅ Error investigation guide
- ✅ Testing strategy
- ✅ Deployment checklist
- ✅ Rollback procedures
- ✅ Tracking sheet

**Go! 🚀**
