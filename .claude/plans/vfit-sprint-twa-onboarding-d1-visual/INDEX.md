# VFIT Sprint Planning — Complete Index

**Plano Completo:** 🟢 PRONTO PARA COPILOT EXECUTAR

---

## 📋 Arquivos do Plano

1. **[README.md](./README.md)** — Overview + Sumário Executivo
2. **[01-ARCHITECTURE.md](./01-ARCHITECTURE.md)** — Diagramas + Fluxos + Schemas Zod
3. **[02-PHASE-1-TWA-ENTRY.md](./02-PHASE-1-TWA-ENTRY.md)** — Task 1: 22 min
4. **[03-PHASE-2-ONBOARDING-FIX.md](./03-PHASE-2-ONBOARDING-FIX.md)** — Task 2: 2-3h (crítica)
5. **[04-PHASE-3-D1-SYNC.md](./04-PHASE-3-D1-SYNC.md)** — Task 3: 1h 45min
6. **[05-PHASE-4-VISUAL-POLISH.md](./05-PHASE-4-VISUAL-POLISH.md)** — Task 4: 1h
7. **[06-TESTING-STRATEGY.md](./06-TESTING-STRATEGY.md)** — Testes + E2E
8. **[07-DEPLOYMENT-CHECKLIST.md](./07-DEPLOYMENT-CHECKLIST.md)** — Deploy + Rollback
9. **[TRACKING.md](./TRACKING.md)** — Real-time progress tracker
10. **[COPILOT-HANDOFF.md](./COPILOT-HANDOFF.md)** — Instruções para Copilot

---

## ⚡ Quick Start para Copilot

```bash
1. Ler este INDEX
2. Ler COPILOT-HANDOFF.md (instruções rápidas)
3. Ler 01-ARCHITECTURE.md (entender fluxos)
4. Ler 02-PHASE-1-TWA-ENTRY.md
5. Executar Phase 1
6. Continuar com Phases 2-4 conforme planejado
```

---

## 📊 Resumo das Phases

| Phase | Duração | Bloqueador | Status |
|-------|---------|-----------|--------|
| 1: TWA Entry | 22 min | Nenhum | ⏳ Ready |
| 2: Onboarding Fix | 2-3h | **SIM** | ⏳ Ready |
| 3: D1 Sync | 1h 45min | Phase 2 | ⏳ Ready |
| 4: Visual Polish | 1h | Nenhum | ⏳ Ready |
| **Total** | **5.5h** | | |

---

## ✅ DoD (Definition of Done)

### Phase 1
- TWA abre `/welcome` (novo usuário)
- Usuário logado → `/dashboard` automático

### Phase 2
- Onboarding 17 passos completa
- Plano gerado SEM erro "Ops!"

### Phase 3
- D1 `user_workouts_cache` table existe
- Treinos novos replicados para D1

### Phase 4
- Header usa `<Button>` + `<DSIcon>`
- Zero inline hex colors

### Geral
- `npm run type-check` ✅
- `npm run lint` ✅
- `npm run smoke:auth:local` ✅
- Commits: Conventional format
- WhatsApp: notificações start/end

---

## 🎯 Critical Path

```
Phase 1 (22 min)
    ↓
Phase 2 (2-3h) ← BLOQUEADOR
    ↓
Phase 3 (1h 45min)
    
Phase 4 (1h) ← paralelo com 2-3
```

**Total critical path:** ~4h 45min

---

## 📝 Próximas Ações

### Para Copilot
1. ✅ Ler plano (este arquivo + COPILOT-HANDOFF)
2. ⏳ Confirmar que entendeu as 4 phases
3. ⏳ Começar Phase 1
4. ⏳ Executar segundo cronograma
5. ⏳ Enviar WhatsApp updates por phase

### Para Claude Code (você)
1. ✅ Criar plano completo (FEITO!)
2. ⏳ Apresentar ao usuário para aprovação
3. ⏳ Invocar `/plan-eng-review` (se necessário)
4. ⏳ Compilar feedback
5. ⏳ Criar handoff final para Copilot
6. ⏳ Acompanhar via TRACKING.md

---

## 📚 Files to Touch (Completa List)

**Phase 1:**
- twa/twa-manifest.json
- twa/config/twa-manifest.json
- src/app/(onboarding)/welcome/page.tsx

**Phase 2:**
- src/app/(onboarding)/onboarding/loading/page.tsx
- workers/api/plans.ts
- workers/schemas/plan-generation.ts
- lib/ai-prompts.ts (maybe)

**Phase 3:**
- migrations/d1/0005_user_workouts_cache.sql (NEW)
- workers/api/plans.ts
- workers/api/ai.ts (maybe)

**Phase 4:**
- src/components/layout/header.tsx
- src/components/layout/sidebar.tsx (audit)
- src/components/layout/mobile-nav.tsx (audit)

---

## 🚨 Red Flags

- 🔴 Phase 2 é crítica — se falhar, onboarding quebra
- 🟡 Phase 3 requer migration — testar local antes
- 🟢 Phase 4 é safe — pode reverter facilmente

---

## 📞 Support

Dúvidas? Consulte:
- Fase específica: leia o arquivo da phase
- Troubleshooting: ver 07-DEPLOYMENT-CHECKLIST.md
- Contexto de código: ver 01-ARCHITECTURE.md

---

**Plano criado:** 2026-04-03  
**Versão:** 1.0 (completo)  
**Status:** 🟢 PRONTO PARA EXECUTAR
