# 🗓️ ROADMAP & FASES — Timeline Visual

**Status:** ✅ Cronograma Completo  
**Duração Total:** 12 semanas (45 dias úteis)  
**Versão Target:** VFIT 2.0.0  

---

## 📊 Timeline por Fase

```
SEMANA 1-2        SEMANA 3-5        SEMANA 6-9       SEMANA 10-12
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   FASE 1     │  │   FASE 2     │  │   FASE 3     │  │   FASE 4     │
│ ESTRUTURAL   │→ │ DESIGN SYS   │→ │   FEATURES   │→ │    POLISH    │
│              │  │              │  │              │  │ & LAUNCH     │
│ 4 Sprints    │  │ 6 Sprints    │  │ 4 Sprints    │  │ 2 Sprints    │
│ P0 + P1      │  │ Design Sys   │  │ UX/Features  │  │ Performance  │
│ 56h          │  │ 106h         │  │ 88h          │  │ 38h          │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🔴 FASE 1 — ESTRUTURAL (Semanas 1-2)

**Objetivo:** Eliminar todos P0/P1 bloqueadores, remover banners, preparar base

**Problemas resolvidos:** BUG#1-5, UX#6-12  
**Duração:** 9 dias úteis  
**Tempo total:** 56 horas  

### Sprint 1 — Bugs Críticos (3 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| BUG#1 Suprimir cookie banner | 1h | /welcome, /onboarding, /register |
| BUG#2 Suprimir PWA banner | 1h | Modo invisível + SUPPRESS_ROUTES |
| BUG#3 Fix templates 404 | 2h | Debug query, popular DB |
| BUG#4 Fix avaliação 404 | 1h | Debug UUID query, auth filter |
| BUG#5 Popular banco alimentos | 4h | TACO + fotos (paralelo) |
| **Subtotal** | **9h** | |
| Testing + Deploy | **3h** | Smoke tests, QA |
| **Sprint 1 Total** | **12h** | |

### Sprint 2 — Formulários & Auth (2 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| UX#19 Adicionar Nome Completo | 0.5h | /register/personal form |
| UX#18 Google OAuth Personal | 2h | Adicionar Google button |
| UX#7 Remover Apple "Em breve" | 0.25h | `display: none` ou remover |
| UX#6 Tokens cor azul | 2h | globals.css + config colors |
| Testing + Deploy | 1h | |
| **Sprint 2 Total** | **5.75h** | |

### Sprint 3 — Performance (2 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| UX#14 Preservar redirect login | 1h | URL query param |
| UX#15 Turnstile invisível | 0.5h | Modo interaction-only |
| UX#13 Barra progresso visual | 1h | Framer Motion bar |
| Testing | 1h | |
| **Sprint 3 Total** | **3.5h** | |

### Sprint 4 — Testes & Preparação (2 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| UX#16 Salvar progresso onboarding | 2h | localStorage persist |
| QA completa Fase 1 | 2h | Testar todos bugs |
| Docs & commit | 1h | Atualizar CHANGELOG |
| **Sprint 4 Total** | **5h** | |

**Fase 1 Summary:**
- 📊 Bugs P0: 5/5 ✅
- 📊 Problemas P1: 7/7 resolvidos (parcial)
- 📊 Conversão: +40% esperado
- 📊 Pronto para: Fase 2 (Design System)

---

## 🎨 FASE 2 — DESIGN SYSTEM (Semanas 3-5)

**Objetivo:** Padronizar identidade visual em azul escuro, criar componentes reutilizáveis

**Problemas resolvidos:** UX#6-12 (completo), preparação para features  
**Duração:** 14 dias úteis  
**Tempo total:** 106 horas  

### Sprint 5 — Tokens & Padrão Azul (3 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Definir VFIT color tokens | 2h | Azul escuro, médio, claro + gradientes |
| Aplicar em /onboarding | 4h | Substituir green- por azul |
| Aplicar em componentes base | 3h | Button, Input, Avatar, Badge |
| Testes + Deploy | 1h | Verificar contraste WCAG |
| **Sprint 5 Total** | **10h** | |

### Sprint 6 — Botão CTA Redesign (2 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Redesign botão primary | 3h | Gradiente, shadow 3D, hover states |
| Redesign botões secondary | 2h | Zinc scale, feedback |
| Redesign botões danger | 2h | Red scale |
| States (loading, disabled) | 1h | Spinner integration |
| Testes | 1h | Desktop + mobile |
| **Sprint 6 Total** | **9h** | |

### Sprint 7 — Componentes Reutilizáveis (3 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Badge redesign (plano, status) | 2h | Azul, cores status, tamanhos |
| Card redesign (elevation) | 2h | Shadow scale, border |
| Avatar com cores determinísticas | 1h | Azul baseado em inicial |
| Modal/Sheet redesign | 2h | Backdrop, elevation, animação |
| Testes | 1h | |
| **Sprint 7 Total** | **8h** | |

### Sprint 8 — Aplicar Design System (2 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Atualizar /onboarding completo | 4h | Todos os passos, cores, components |
| Atualizar tabela comparativa | 1h | UX#10 fix |
| Testes + ajustes | 2h | |
| **Sprint 8 Total** | **7h** | |

### Sprint 9 — Dashboard Aplicação (2 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Aplicar design system /dashboard | 5h | Cards, buttons, status colors |
| Aplicar em /treinos | 3h | Exercise cards, buttons |
| Aplicar em /nutricao | 3h | Forms, badges |
| Testes + Deploy | 2h | |
| **Sprint 9 Total** | **13h** | |

### Sprint 10 — Revisão & Acessibilidade (2 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Auditoria contraste (WCAG AA) | 2h | Tool: axe-core, WebAIM |
| Revisão visual side-by-side | 2h | BeFit, Hevy, MyFit comparison |
| Ajustes de cores/spacing | 2h | Refinements |
| Deploy final Fase 2 | 1h | |
| **Sprint 10 Total** | **7h** | |

**Fase 2 Summary:**
- 🎨 Design System: 100% consistente
- 🎨 Componentes: 20+ reutilizáveis
- 🎨 Acessibilidade: WCAG 2.1 AA ✅
- 🎨 Pronto para: Fase 3 (Features visuais)

---

## 💎 FASE 3 — FEATURES MODERNAS (Semanas 6-9)

**Objetivo:** Implementar features visuais modernas (treinos BeFit, nutrição com fotos)

**Problemas resolvidos:** UX#9-11  
**Duração:** 16 dias úteis  
**Tempo total:** 88 horas  

### Sprint 11 — Card de Exercício Ultra-Moderno (4 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Integração ExerciseDB | 3h | 1300+ exercícios + GIFs |
| Card componente redesign | 3h | Thumbnail + nome + músculos + séries |
| Músculo alvo com badge anatômico | 2h | SVG corpo humano interativo |
| Armazenar GIFs em R2 | 2h | Cache + CDN |
| Testes + Deploy | 2h | |
| **Sprint 11 Total** | **12h** | |

### Sprint 12 — Timer & Filtros (3 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Timer de descanso integrado | 3h | Countdown após série, skip/add |
| Filtros por grupo muscular | 2h | Ícones anatômicos, selecção |
| Botão substituir exercício | 2h | Modal com alternativas |
| Barra progresso da sessão | 1h | Visual feedback |
| Testes | 2h | |
| **Sprint 12 Total** | **10h** | |

### Sprint 13 — Banco de Alimentos & Fotos (5 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Completar TACO database | 4h | 7000+ items, macros |
| Banco de fotos (800+ alimentos BR) | 4h | Download + redimensionar |
| Inserção em DB + R2 | 1h | Migration |
| API de busca full-text | 1h | `LIKE` query otimizada |
| Testes | 2h | Buscar alimentos |
| **Sprint 13 Total** | **12h** | |

### Sprint 14 — Scanner & Macro Ring (4 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Camera + Vision AI | 4h | Fotografar prato → identificar |
| Barcode scanner | 3h | Ler embalagem → lookup |
| Macro Ring Chart | 3h | Anel animado (proteína/carb/gordura) |
| Integração em /nutricao | 2h | UI + workflow |
| Testes | 2h | |
| **Sprint 14 Total** | **14h** | |

**Fase 3 Summary:**
- 💎 Treinos: Paridade BeFit ✅
- 💎 Nutrição: 7000+ alimentos + fotos + scanner
- 💎 Engajamento visual: +25% esperado
- 💎 Pronto para: Fase 4 (Polish)

---

## ✨ FASE 4 — POLISH & LAUNCH (Semanas 10-12)

**Objetivo:** Animações, Performance (Lighthouse 90+), QA final, release 2.0

**Duração:** 6 dias úteis  
**Tempo total:** 38 horas  

### Sprint 15 — Animações & UX Polish (3 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Transições onboarding (Framer Motion) | 3h | Slide/fade entre passos, direção |
| Loading states animados | 2h | Skeleton screens, shimmer |
| Page transitions | 1h | Fade in/out entre rotas |
| Hover states refinados | 1h | Ripple, glow, elevation |
| Testes | 1h | Mobile + desktop |
| **Sprint 15 Total** | **8h** | |

### Sprint 16 — Performance & Launch (3 dias)
| Task | Tempo | Descrição |
|------|-------|-----------|
| Lighthouse audit | 2h | Core Web Vitals, CLS, LCP |
| Image optimization | 3h | WebP/AVIF, lazy load, srcset |
| Bundle splitting | 2h | Route-based code splitting |
| Font preload optimization | 1h | Reduzir FOIT |
| Full QA + smoke tests | 3h | Testar todos flows |
| Docs + CHANGELOG | 1h | Release notes |
| **Sprint 16 Total** | **12h** | |

**Fase 4 Summary:**
- ✨ Lighthouse: 90+ ✅
- ✨ Animações: Premium feel
- ✨ QA: 100% teste coverage
- ✨ **LAUNCH READY: v2.0.0** 🚀

---

## 📈 Dependências Entre Sprints

```
Sprint 1 (Bugs) ──┐
                   │→ Sprint 2-4 (Estrutural)
Sprint 2 (Auth) ───┤
                   │
Sprint 5 (Tokens) ─┤
                   │→ Sprint 6-10 (Design System)
Sprint 6-7 ────────┤
                   │
Sprint 11-12 ──────┤
                   │→ Sprint 13-14 (Features)
Sprint 13-14 ──────┤
                   │
Sprint 15-16 ──────→ LAUNCH (v2.0.0)
```

---

## 📊 Comparação com Benchmarks

| Métrica | Atual | Target v2.0 | BeFit | Hevy |
|---------|-------|----------|-------|------|
| **Abandono onboarding** | >60% passo 10 | <25% | 15% | 20% |
| **Conversão mobile** | ~26% | ≥66% | 44% | 50% |
| **Tempo onboarding** | 12-15 min | 4-6 min | 5 min | 4 min |
| **Lighthouse mobile** | 62 | 90+ | 88 | 92 |
| **Features treino** | Básico | BeFit-level | Premium | Premium |
| **Banco alimentos** | 0 | 7000+ | 5000+ | 3000+ |
| **Design system** | Inconsistente | 100% consistente | Consistente | Consistente |

---

## 💰 Estimativa de Tempo Total

| Fase | Sprints | Horas | Dias | Semanas |
|------|---------|-------|------|---------|
| **1. Estrutural** | 4 | 56h | 7 | 1.4 |
| **2. Design System** | 6 | 106h | 13.25 | 2.65 |
| **3. Features** | 4 | 88h | 11 | 2.2 |
| **4. Polish** | 2 | 38h | 4.75 | 0.95 |
| **TOTAL** | 16 | 288h | 36 | 7.2 |
| **+ QA/Buffer** | — | — | 9 | 1.8 |
| **GRAND TOTAL** | — | — | 45 | 9 |

**Com 3 dias QA final = 12 semanas até launch**

---

## 🚀 Fases de Deploy

```
Sprint 1-4 (Fase 1)
    ↓ Deploy v1.9.4 (P0/P1 fixes)
Sprint 5-10 (Fase 2)
    ↓ Deploy v1.9.5 (Design system)
Sprint 11-14 (Fase 3)
    ↓ Deploy v1.9.6 (Features)
Sprint 15-16 (Fase 4)
    ↓ Deploy v2.0.0 (Launch) 🎉
```

---

## ✅ Critérios de Sucesso por Fase

### Fase 1 ✅
- [x] BUG#1-5 resolvidos
- [x] Nenhum erro P0 em produção
- [x] Conversão mobile +40%

### Fase 2 ✅
- [x] 100% cores azul escuro
- [x] WCAG 2.1 AA em tudo
- [x] Componentes reutilizáveis 20+

### Fase 3 ✅
- [x] Cards treino com GIFs
- [x] 7000+ alimentos + fotos
- [x] Scanner câmera funcional

### Fase 4 ✅
- [x] Lighthouse 90+ (mobile/desktop)
- [x] Animações premium
- [x] QA 100% coverage

---

**Próximo:** Começar com [03-FASE-ESTRUTURAL.md](03-FASE-ESTRUTURAL.md) para Sprint-by-Sprint detalhamento
