# 🎯 PROMPT COMPLETO PARA COPILOT — Cole em Opus 4.6

---

## Contexto Inicial

Você é o executor de um **sprint de 4 phases** para o VFIT (SaaS Personal Trainer).

**Localização do plano:** `.claude/plans/vfit-sprint-twa-onboarding-d1-visual/`

**Status:** ✅ Plano 100% detalhado, pronto para executar

---

## ⚡ Quick Start (Leia isto PRIMEIRO)

```
1. Abra: INDEX.md (nesta pasta)
2. Leia: COPILOT-HANDOFF.md (instruções rápidas)
3. Leia: 01-ARCHITECTURE.md (entender fluxos)
4. Execute: Phase 1 (22 min)
5. Continue: Phases 2-4 conforme plano

Tempo total esperado: 5-6 horas
```

---

## 🚀 Stack & Setup

**Frontend:** Next.js 15 App Router + Tailwind v4 + Zustand v5  
**Backend:** Hono.js no Cloudflare Workers  
**Database:** Neon PostgreSQL + Cloudflare D1  
**AI:** Workers AI (Llama) + Replicate fallback  

**Dev local:**
```bash
npm run dev              # Frontend: localhost:3000
npm run wrangler:dev    # Backend: localhost:8787
```

---

## 📋 As 4 Phases (Ordem Sequencial)

### Phase 1: TWA Smart Entry (22 min)
**Problema:** TWA abre `/dashboard` direto → novo usuário vê 401  
**Solução:** Mudar `startUrl` para `/welcome` → smart router  
**Files:** 3 pequenos (twa-manifest.json × 2, welcome/page.tsx)

### Phase 2: Onboarding Fix (2-3h) ⚠️ CRÍTICA
**Problema:** POST `/plans/generate` falha → "Ops! Algo deu errado"  
**Solução:** Investigar payload/schema, corrigir, testar E2E  
**Files:** loading/page.tsx, plans.ts, plan-generation.ts

### Phase 3: D1 Sync (1h 45min)
**Problema:** Treinos não vão ao D1 → sem offline  
**Solução:** Criar table D1 + replicar cada treino novo  
**Files:** D1 migration (novo) + plans.ts, ai.ts

### Phase 4: Visual Polish (1h)
**Problema:** Dashboard header sem DS components  
**Solução:** Button + DSIcon everywhere, zero hex inline  
**Files:** header.tsx (audit + fix), sidebar.tsx, mobile-nav.tsx

---

## ✅ Definition of Done (Leia Completo!)

### Phase 1
- [ ] `twa/twa-manifest.json` → `startUrl: "/welcome"`
- [ ] `twa/config/twa-manifest.json` → mesmo
- [ ] `welcome/page.tsx` → add useEffect auth redirect
- [ ] Teste local: não autenticado → mostra hero; autenticado → /dashboard
- [ ] Commit: `feat(twa): update startUrl to /welcome`

### Phase 2
- [ ] Investigar: ler payload (loading/page.tsx:72-87)
- [ ] Debug: testar POST /plans/generate com curl
- [ ] Fix: ajustar payload/schema conforme erro
- [ ] Teste E2E: 17 steps completos → plano gerado (SEM erro!)
- [ ] Commit: `feat(onboarding): fix POST /plans/generate`

### Phase 3
- [ ] Criar: `migrations/d1/0005_user_workouts_cache.sql`
- [ ] Aplicar: `wrangler d1 migrations apply vfit-exercises --remote`
- [ ] Código: add D1 INSERT em plans.ts (2 locais: /save + /regenerate)
- [ ] Testar: `SELECT * FROM user_workouts_cache` → dados presentes
- [ ] Commit: `feat(d1): add user_workouts_cache sync`

### Phase 4
- [ ] Audit: grep `<button>` em layout files
- [ ] Fix: logout button → `<Button variant="danger">`
- [ ] Verify: zero lucide-react direto, todos DSIcon
- [ ] Verify: Tailwind v4 syntax (bg-linear-to-r, não bg-gradient-to-r)
- [ ] Dark mode: contrast check (WCAG AA minimum)
- [ ] Commit: `feat(dashboard): polish header with DS components`

### Geral
- [ ] `npm run type-check` ✅
- [ ] `npm run lint` ✅
- [ ] `npm run test` ✅
- [ ] `npm run test:e2e` ✅
- [ ] `npm run smoke:auth:local` ✅
- [ ] All commits: Conventional format

---

## 🎯 Critical Success Factors

### Phase 2 é CRÍTICA
Se POST /plans/generate falhar ainda depois do fix:
1. Check `wrangler tail` para erro específico
2. Testar IA timeout vs JSON parse failure vs schema
3. Se IA está timeout, aumentar timeout ou forçar fallback
4. Se JSON parse falha, melhorar regex ou try-catch

**Se Phase 2 fails, whole onboarding breaks!**

### Phase 3 requer care
- Sempre testar D1 migration `--local` ANTES `--remote`
- D1 INSERT MUST NOT fail the main request (continue on D1 error)
- PostgreSQL insert deve suceder mesmo se D1 falha

### Phase 4 é safe
- Pode reverter facilmente se quebrar
- Zero impacto em backend

---

## 📚 Arquivos do Plano (Ordem Leitura)

1. **INDEX.md** — Índice + quick links (2 min)
2. **COPILOT-HANDOFF.md** — Quick start para você (5 min)
3. **01-ARCHITECTURE.md** — Diagramas + fluxos + schemas (15 min)
4. **02-PHASE-1-TWA-ENTRY.md** — Phase 1 detalhada (5 min)
5. **03-PHASE-2-ONBOARDING-FIX.md** — Phase 2 investigação (15 min)
6. **04-PHASE-3-D1-SYNC.md** — Phase 3 migration (10 min)
7. **05-PHASE-4-VISUAL-POLISH.md** — Phase 4 audit (10 min)
8. **06-TESTING-STRATEGY.md** — Testes completos (10 min)
9. **07-DEPLOYMENT-CHECKLIST.md** — Deploy + rollback (10 min)
10. **TRACKING.md** — Progress sheet (update conforme executa)

---

## 💾 Git Workflow

```bash
# Você está em feature branch
git branch
# → feat/vfit-sprint-planning

# Phase 1
git commit -m "feat(twa): update startUrl to /welcome"

# Phase 2
git commit -m "feat(onboarding): fix POST /plans/generate"

# Phase 3
git commit -m "feat(d1): add user_workouts_cache sync"

# Phase 4
git commit -m "feat(dashboard): polish header with DS components"

# No final
git push origin feat/vfit-sprint-planning
# Criar PR no GitHub para review antes de merge
```

---

## 📞 WhatsApp Notifications (ENVIAR DURANTE EXECUÇÃO)

### START (antes de Phase 1)
```
🚀 VFIT Sprint v1.1.0 Iniciado
━━━━━━━━━━━━━━━━━━━━━━
🟢 Phase 1: TWA Entry (22 min)
🟢 Phase 2: Onboarding Fix (2-3h)
🟢 Phase 3: D1 Sync (1h 45min)
🟢 Phase 4: Visual Polish (1h)

Branch: feat/vfit-sprint-planning
Executor: Copilot Opus 4.6
```

### Phase 1 COMPLETE
```
✅ Phase 1 (TWA Entry) — 22 min
├─ twa-manifest.json updated
├─ welcome/page.tsx auth redirect added
└─ Tests passed: no auth → hero, auth → /dashboard
```

### Phase 2 COMPLETE
```
✅ Phase 2 (Onboarding Fix) — 2h 30m
├─ POST /plans/generate payload validated
├─ IA fallback working + JSON parsing fixed
├─ 17 steps → plan generated ✅
└─ E2E test passed
```

### Phase 3 COMPLETE
```
✅ Phase 3 (D1 Sync) — 1h 45m
├─ D1 migration applied
├─ workers/api/plans.ts modified
├─ Treino novo → user_workouts_cache ✅
└─ Verified: SELECT COUNT(*) > 0
```

### Phase 4 COMPLETE
```
✅ Phase 4 (Visual Polish) — 1h
├─ Header refactored: <Button> + <DSIcon>
├─ Dark mode contrast verified (WCAG AA)
├─ All tests passed
└─ Ready for deployment
```

### END (após tudo completo)
```
✅ VFIT Sprint v1.1.0 COMPLETO
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Phase 1: TWA Entry (22 min)
✅ Phase 2: Onboarding Fix (2h 30m)
✅ Phase 3: D1 Sync (1h 45m)
✅ Phase 4: Visual Polish (1h)

Total: 6h
All tests: ✅
All commits: ✅
Ready: 🚀 npm run cf:deploy
```

---

## 🔧 Quick Commands Reference

```bash
# Dev
npm run dev
npm run wrangler:dev

# Testing
npm run test
npm run test:e2e
npm run smoke:auth:local

# Quality
npm run type-check
npm run lint

# Debug
wrangler tail                    # Workers logs
curl -X POST http://localhost:8787/api/v1/plans/generate \
  -H "Content-Type: application/json" \
  -d '{...payload...}'           # Test POST /plans/generate

# D1
wrangler d1 execute vfit-exercises --local \
  --command "SELECT * FROM user_workouts_cache"

# Deploy (quando pronto)
npm run cf:deploy
```

---

## 🚨 TROUBLESHOOTING QUICK GUIDE

### Phase 2 Falha (POST /plans/generate)
1. Check logs: `wrangler tail`
2. Test payload: `curl -X POST ... /plans/generate`
3. Verify schema: `generatePlanInputSchema` matches input
4. Check IA: Workers AI timeout? Fallback working?
5. Debug JSON: IA returning valid JSON?

→ Referência completa: `03-PHASE-2-ONBOARDING-FIX.md`

### Phase 3 Falha (D1 Migration)
1. Test local: `wrangler d1 migrations apply vfit-exercises --local`
2. Check error: D1 binding missing? Schema syntax wrong?
3. Verify table: `SELECT name FROM sqlite_master WHERE type='table'`

→ Referência: `04-PHASE-3-D1-SYNC.md`

### Phase 4 Falha (Build error)
1. `npm run build` (full build)
2. Check TypeScript: `npm run type-check`
3. Check lint: `npm run lint`

→ Safe rollback: `git revert HEAD`

---

## 🎓 Key Patterns to Follow

### Payload Construction
```typescript
const payload = {
  gender: data.gender || 'prefer_not_say',
  experience_level: data.experience_level || 'beginner',
  // ... todos os campos obrigatórios com fallback
}
```

### D1 Insert Pattern
```typescript
try {
  await c.env.DB.prepare(
    'INSERT INTO user_workouts_cache (...) VALUES (...)'
  ).bind(...).run()
} catch (err) {
  console.warn('D1 sync failed:', err)
  // NÃO falhar o request principal!
}
```

### Button + DSIcon
```typescript
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'

<Button variant="danger" size="icon" onClick={logout}>
  <DSIcon name="logout" size={16} />
</Button>
```

---

## 📊 Tracking Progress

Update `TRACKING.md` conforme avança:
- [ ] Phase 1 started
- [ ] Phase 1 completed
- [ ] Phase 2 started
- [ ] Phase 2 completed (CRITICAL)
- [ ] Phase 3 started
- [ ] Phase 3 completed
- [ ] Phase 4 started
- [ ] Phase 4 completed
- [ ] All tests passing
- [ ] Ready for deploy

---

## 🏁 NEXT STEPS

1. **Ler agora:**
   - INDEX.md
   - COPILOT-HANDOFF.md
   - 01-ARCHITECTURE.md

2. **Começar Phase 1:**
   - Siga `02-PHASE-1-TWA-ENTRY.md` passo a passo

3. **Enviar WhatsApp:**
   - START message com timestamp

4. **Executar:**
   - Phase 1 → 2 → 3 → 4 (sequencial)
   - Phase 4 pode paralelizar com 2-3

5. **Finalizar:**
   - Deploy: `npm run cf:deploy`
   - END message
   - PR + merge

---

## ✨ Ready? Let's GO! 🚀

```
Plano: ✅ 100% completo
Files: ✅ Organizados
Docs: ✅ Detalhadas
Testing: ✅ Estratégia definida
Deploy: ✅ Procedimentos prontos

Status: 🟢 PRONTO PARA EXECUTAR
```

**Start with INDEX.md → COPILOT-HANDOFF.md → 01-ARCHITECTURE.md → Begin Phase 1**

---

**Boa sorte! 💪**

*Criado: 2026-04-03*  
*Versão: 1.0 (completo)*
