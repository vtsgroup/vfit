# 📚 SUMÁRIO — Plano Completo VFIT v1.9.3 → v2.0.0

**Data de Criação:** 07 de Abril de 2026  
**Versão do Plano:** 1.0  
**Status:** ✅ Completo e pronto para execução  
**Target Copilot:** Opus 3.6 Fast  

---

## 🎯 Visão Geral

Este plano de melhoria contém a especificação completa para transformar VFIT de v1.9.3 para v2.0.0 em 12 semanas:

**Foco:** Corrigir bugs críticos, implementar design system azul, adicionar features modernas (timer, filtros, alimentos, camera)

**Baseline (v1.9.3):**
- 🔴 5 bugs P0 bloqueando usuários
- 🟠 7 problemas UX graves
- 🔵 40% conversão onboarding
- 📊 Lighthouse 62 (mobile)
- 🎨 30% verde (inconsistente)

**Target (v2.0.0):**
- ✅ 0 bugs P0 + all P1 fixed
- ✅ WCAG 2.1 AA 100%
- ✅ 75% conversão onboarding (+35p)
- ✅ Lighthouse 90+ (mobile)
- ✅ 100% design system azul

---

## 📖 Estrutura de Documentos

### Entrada (Começar aqui)

| Doc | Tempo | Uso |
|-----|------:|-----|
| **README.md** | 5 min | Visão geral + próximos passos |
| **INDEX.md** | 10 min | Índice navegável por role/tema |
| **SUMARIO-PLANO-COMPLETO.md** | 5 min | Este arquivo — visão consolidada |

### Contexto & Planejamento

| Doc | Tempo | Público | Descrição |
|-----|------:|---------|-----------|
| **00-VISAO-GERAL.md** | 30 min | Tech Lead, Product | 5 P0 bugs (2000 linhas), workflow maps, impacto |
| **01-ANALISE-CRITICA.md** | 45 min | Engineers, Tech Lead | 24 problemas detalhados com code samples |
| **02-ROADMAP-FASES.md** | 20 min | Product, Tech Lead | Timeline 12 semanas, 16 sprints, dependências |

### Implementação por Fase

| Doc | Sprints | Semanas | Horas | Status |
|-----|:-------:|:-------:|:-----:|--------|
| **03-FASE-ESTRUTURAL.md** | 1-4 | 1-2 | 56h | ✅ Planejado |
| **04-FASE-DESIGN-SYSTEM.md** | 5-10 | 3-5 | 106h | ✅ Planejado |
| **05-FASE-FEATURES.md** | 11-14 | 6-9 | 88h | ✅ Planejado |
| **06-FASE-POLISH.md** | 15-16 | 10-12 | 38h | ✅ Planejado |

### Referência & Tracking

| Doc | Uso | Atualização |
|-----|-----|-----------|
| **07-METRICAS-SUCESSO.md** | KPIs, acceptance criteria, test plans | Referência |
| **TRACKING.md** | Checklist de progresso por sprint | A cada sprint |

---

## 🚀 Resumo Executivo

### Problema Identificado (Audits 07/04/2026)

**5 Bugs Críticos (P0):**
1. 🍪 Cookie banner bloqueia onboarding mobile (-18% conversion)
2. 📱 PWA banner invisível em onboarding (-8% conversion)
3. 🔗 Template de treino retorna 404
4. 👤 Assessment UUID retorna 401 (permission bug)
5. 🍔 Banco de alimentos vazio (TACO não importado)

**7 Problemas UX Graves (P1):**
6. 🎨 Design verde vs. azul inconsistente (30% verde)
7. 🎯 Falta botões em dark mode
8. ⚙️ Falta apple OAuth (UI quebrada)
9. 📊 Falta filtros de exercício
10. ⏱️ Falta timer de descanso
11. 📸 Falta scanner de comida (camera)
12. 📈 Falta macro ring visual

**Impacto:** 40% conversão (vs. 75% alvo)

---

## 📋 Plano de Execução

### Fase 1: Correções Estruturais (Semanas 1-2, 56h)

**Sprint 1-2: Bugs P0 (12h)**
- ✅ Cookie banner suppression
- ✅ PWA banner invisível  
- ✅ Template query fix
- ✅ Assessment auth check
- ✅ TACO DB population

**Sprint 2-4: UX Improvements (44h)**
- ✅ Google OAuth
- ✅ Color tokens
- ✅ Login redirect
- ✅ Turnstile invisible
- ✅ Progress save

**Deploy:** v1.9.4 patch

---

### Fase 2: Design System (Semanas 3-5, 106h)

**Sprint 5: Tokens (10h)**
- Define paleta azul escuro
- CSS variables + Tailwind config
- WCAG validation

**Sprint 6: Components (9h)**
- Button redesign (5 variants)
- Badge, Card, Modal updates
- 60fps animations

**Sprint 7-10: Application (87h)**
- Apply design to all pages
- Onboarding complete
- Dashboard complete
- Dark mode 100%

**Conversion +15%** (40% → 55%)  
**Deploy:** v1.10.0 (design system release)

---

### Fase 3: Features Modernas (Semanas 6-9, 88h)

**Sprint 11: Exercise Cards (12h)**
- ExerciseDB integration
- GIF animations
- Muscle-tagged cards

**Sprint 12: Timer & Filters (10h)**
- Rest timer countdown
- Muscle group filters
- Exercise substitution

**Sprint 13: Food Database (12h)**
- TACO: 7000+ foods
- Full-text search <300ms
- Food photos R2

**Sprint 14: Camera Scanner (14h)**
- Barcode scanning
- Vision AI (food OCR)
- Macro ring visual

**Engagement +25%**  
**Deploy:** v1.11.0 (features release)

---

### Fase 4: Polish (Semanas 10-12, 38h)

**Sprint 15: Animations (8h)**
- Framer Motion transitions
- Loading skeletons
- Page transitions

**Sprint 16: Performance (9h)**
- Lighthouse 90+
- Core Web Vitals tune
- Security hardening
- QA final

**Sprint 16 QA (5h)**
- Full test pass
- Documentation
- Deploy v2.0.0

**Lighthouse 62 → 90+**  
**Deploy:** v2.0.0 (official release)

---

## 🎯 Métricas de Sucesso

### Baseline vs. Target

| Métrica | Baseline | Target | Ganho |
|---------|----------|--------|-------|
| **Conversão onboarding** | 40% | 75% | +35p ✅ |
| **Lighthouse mobile** | 62 | 90+ | +28p ✅ |
| **Design azul** | 30% | 100% | +70p ✅ |
| **WCAG AA** | 70% | 100% | +30p ✅ |
| **Bundle size** | 245KB | 180KB | -26% ✅ |
| **TTFB** | 1.5s | <1s | -33% ✅ |
| **Daily active users** | — | +25% | ✅ |

---

## 🔄 Como Usar Este Plano

### Para Tech Lead

1. Leia: [README.md](README.md) (5 min)
2. Leia: [02-ROADMAP-FASES.md](02-ROADMAP-FASES.md) (20 min)
3. Revise: [03-FASE-ESTRUTURAL.md](03-FASE-ESTRUTURAL.md) sprint 1
4. Inicie: Sprint 1 com time

### Para Engenheiro Executando

1. Leia: [README.md](README.md) (5 min)
2. Leia: Sprint específico em FASE document
3. Copie código samples
4. Siga checklist QA
5. Marca completo em TRACKING.md

### Para Copilot (Opus 3.6 Fast)

**Sessão 1 (Sprint 1):**
1. Leia: [README.md](README.md)
2. Leia: [03-FASE-ESTRUTURAL.md](03-FASE-ESTRUTURAL.md) — Sprint 1
3. Execute todos 5 bugs BUG#1-5
4. Run QA checklist
5. Commit + tag v1.9.4

**Sessão 2 (Sprint 2-4):**
1. Leia: [03-FASE-ESTRUTURAL.md](03-FASE-ESTRUTURAL.md) — Sprint 2-4
2. Execute UX#6-19
3. Run QA
4. Commit v1.9.5

**Sessão 3-5 (Fase 2):**
1. Leia: [04-FASE-DESIGN-SYSTEM.md](04-FASE-DESIGN-SYSTEM.md)
2. Execute Sprints 5-10
3. Deploy v1.10.0

**Sessão 6-8 (Fase 3):**
1. Leia: [05-FASE-FEATURES.md](05-FASE-FEATURES.md)
2. Execute Sprints 11-14
3. Deploy v1.11.0

**Sessão 9 (Fase 4):**
1. Leia: [06-FASE-POLISH.md](06-FASE-POLISH.md)
2. Execute Sprints 15-16
3. Deploy v2.0.0

---

## 📊 Tempo Total

```
Fase 1: 56h dev + 12h QA = 68h   (Sem 1-2)
Fase 2: 54h dev + 9h QA  = 63h   (Sem 3-5)
Fase 3: 48h dev + 12h QA = 60h   (Sem 6-9)
Fase 4: 8h dev + 5h QA   = 13h   (Sem 10-12)
─────────────────────────────────
TOTAL:  275h dev + 80h QA = 355h (12 semanas)

Custo estimado: 
- 1 engenheiro full-time: 6 semanas (~30h/semana)
- 1 QA part-time: continuado
- 1 designer (atualizar): 1 semana

Otimização:
- Parallelizar Sprint 1 task 5 (TACO DB) com Sprints 2-4
- Usar design tokens para acelerar Sprint 7-10
- Pré-testar features em staging antes de QA final
```

---

## 🎯 Success Criteria

**Fase 1 Complete:**
- ✅ 0 P0 bugs em produção
- ✅ Conversão 40% → 55%
- ✅ v1.9.4 deployed
- ✅ 0 regressions

**Fase 2 Complete:**
- ✅ 100% design azul
- ✅ WCAG 2.1 AA 100%
- ✅ Lighthouse 80+
- ✅ Conversão 55% → 70%

**Fase 3 Complete:**
- ✅ 5 modern features
- ✅ Engagement +25%
- ✅ Lighthouse 85+
- ✅ Conversão 70%+

**Fase 4 Complete:**
- ✅ Lighthouse 90+
- ✅ LCP <2.5s
- ✅ 0 P0 errors
- ✅ v2.0.0 production ready

---

## 🚨 Riscos & Mitigação

| Risco | Probabilidade | Mitigação |
|-------|:-------------:|-----------|
| TACO DB import fails | 🟡 Média | Scripts + manual fallback pronto |
| ExerciseDB API limits | 🟡 Média | Cache 30 dias + fallback data |
| Lighthouse not 90+ | 🟡 Média | Placeholder image optimization |
| Dark mode edge cases | 🔴 Alta | Teste completo em Sprint 10 |
| Performance regression | 🟡 Média | Bundle analyzer + Lighthouse CI |

---

## 📞 Suporte & Escalação

**Tech Questions:** Ver [01-ANALISE-CRITICA.md](01-ANALISE-CRITICA.md)  
**Design Questions:** Ver [04-FASE-DESIGN-SYSTEM.md](04-FASE-DESIGN-SYSTEM.md)  
**Metrics Questions:** Ver [07-METRICAS-SUCESSO.md](07-METRICAS-SUCESSO.md)  
**Progress Questions:** Ver [TRACKING.md](TRACKING.md)

---

## ✅ Checklist de Início

Antes de começar, confirmar:

- [ ] Todos 3 documentos de audit lidos (0.md + 1.md + SKILL.md)
- [ ] Fase 1 scope confirmado com stakeholders
- [ ] TACO DB arquivo obtido (7000+ foods)
- [ ] ExerciseDB API key ativa
- [ ] Replicate AI token válido
- [ ] Git branches criado (feature/vfit-v2)
- [ ] Team alinhado em timeline 12 semanas
- [ ] CI/CD pipeline testado (cf:deploy)

---

## 🎓 Documentação Adicional

### Código de Referência
- VFIT Stack: `.github/copilot-instructions.md`
- Design System: `.claude/docs/DESIGN-SYSTEM.md`
- Backend Routes: `.claude/docs/BACKEND.md`

### Audit Originals
- Audit 0: [melhorias-gerais-audit-0.md](../../../)
- Audit 1: [melhorias-gerais-audit-1.md](../../../)
- Skill: [SKILL.md](../../../) (UI/UX Pro Max)

---

## 🚀 Próximos Passos

**Imediatamente:**
1. ✅ Tech Lead revisa README.md + ROADMAP
2. ✅ Eng team pronto para Sprint 1
3. ✅ Data pra kickoff session (30 min)

**Kickoff Session:**
1. Revisar Fase 1 (30 min)
2. Confirmar Sprint 1 start (TBD)
3. Setup monitoring (Sentry, GA4)
4. Criar tickets para tracking

**Sprint 1 Start (Dia 1):**
1. Copilot lê [03-FASE-ESTRUTURAL.md](03-FASE-ESTRUTURAL.md)
2. Começa BUG#1 (cookie banner)
3. Daily standup: progress vs. plan

---

## 📊 Progress Dashboard (Template)

```
VFIT v2.0.0 PLAN — Week X of 12

┌─────────────────────────────────────────────────┐
│ OVERALL PROGRESS                                │
├─────────────────────────────────────────────────┤
│ Fase 1: ████████████░░░░░░░░░░░░░░░░░  50%     │
│ Fase 2: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%    │
│ Fase 3: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%    │
│ Fase 4: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%    │
├─────────────────────────────────────────────────┤
│ TOTAL:  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░ 12%   │
└─────────────────────────────────────────────────┘

Conversão: 40% → 55% (target 75%)
Lighthouse: 62 → 74 (target 90+)
```

---

**Pronto para execução! 🚀**

Comece em: [README.md](README.md)  
Próximo sprint: [03-FASE-ESTRUTURAL.md](03-FASE-ESTRUTURAL.md)
