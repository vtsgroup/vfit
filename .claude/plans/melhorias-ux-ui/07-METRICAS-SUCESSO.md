# 📊 MÉTRICAS DE SUCESSO v2.0

**Documento:** Framework de KPIs, acceptance criteria e validação  
**Versão:** v1.0  
**Status:** Definição inicial — será refinado ao início de cada fase  

---

## 🎯 Objetivos Principais (OKRs)

### OKR 1: Conversão no Onboarding
**Objetivo:** Passar de 40% → 75% conversion em mobile  
**Key Results:**
- 🟢 Converter 40% adicionais no Step 3-7 (remover cookie banner)
- 🟢 Reduzir drop-off por PWA banner de 8% → 0%
- 🟢 Implementar save progress para reduzir abandono
- 🟢 Atingir 75% conversão até fim Fase 1

**Métrica:** `(Users finished onboarding / Users started onboarding) × 100`

| Fase | Target | Métrica | Baseline |
|------|--------|---------|----------|
| 1 | +15% | 40% → 55% | Após Sprint 1 bug fixes |
| 2 | +15% | 55% → 70% | Após design system |
| 3 | +5% | 70% → 75% | Após features modernas |

---

### OKR 2: Excelência em Design
**Objetivo:** Design system 100% consistente + WCAG 2.1 AA  
**Key Results:**
- 🟢 0% uso de cores verde (#22c55e) em UI (vs. 30% atual)
- 🟢 100% de componentes com contraste ≥4.5:1
- 🟢 100% de componentes com estados de focus visíveis
- 🟢 0% de components "Em breve" não implementados

**Métrica:** `(Componentes conformes / Total de componentes) × 100`

| Fase | Target | Métrica | Baseline |
|------|--------|---------|----------|
| 1 | 30% | Tokens + padrão base | Design System preparado |
| 2 | 100% | Todos componentes | Após Sprint 5-10 |

---

### OKR 3: Paridade com Apps Líderes
**Objetivo:** Feature parity com MyFitnessPal, FatSecret em core UX  
**Key Results:**
- 🟢 Timer de descanso entre séries (Fase 3 Sprint 12)
- 🟢 Filtros de exercício por músculo (Fase 3 Sprint 12)
- 🟢 Banco de alimentos com fotos (Fase 3 Sprint 13)
- 🟢 Scanner de comida via câmera (Fase 3 Sprint 14)
- 🟢 Macro ring com visual intuitivo (Fase 3 Sprint 14)

**Métrica:** `(Features implementadas / Features alvo) × 100`

| Fase | Target | Implementadas | Status |
|------|--------|--------------|--------|
| 1 | 0% | — | Não iniciado |
| 2 | 0% | — | Bloqueado |
| 3 | 100% | 5/5 | Bloqueado |
| 4 | 100% | 5/5 + polished | Bloqueado |

---

### OKR 4: Performance & Confiabilidade
**Objetivo:** Web Vitals excelentes em mobile  
**Key Results:**
- 🟢 Lighthouse score ≥90 (mobile + desktop)
- 🟢 LCP (Largest Contentful Paint) <2.5s
- 🟢 FID (First Input Delay) <100ms
- 🟢 CLS (Cumulative Layout Shift) <0.1
- 🟢 TTFB <1s

**Métrica:** Lighthouse score (mobile)

| Métrica | Baseline (v1.9.3) | Target (v2.0) | Tool |
|---------|:----------------:|:-------------:|------|
| Lighthouse | 62 | **90+** | PageSpeed Insights |
| LCP | 4.2s | **<2.5s** | Core Web Vitals |
| FID | 120ms | **<100ms** | CrUX |
| CLS | 0.15 | **<0.1** | CrUX |
| TTFB | 1.5s | **<1s** | Chrome DevTools |

---

## 📋 Acceptance Criteria por Fase

### FASE 1 — Structural Fixes

#### Sprint 1: Bugs P0

| Bug | Acceptance Criteria | Método Validação |
|-----|-------------------|------------------|
| **BUG#1** Cookie banner | ❌ Banner não aparece em `/welcome` mobile | Chrome DevTools (mobile emulation) |
| **BUG#2** PWA banner | ❌ Banner não aparece em `/onboarding/*` | iOS Safari (add to home screen) |
| **BUG#3** Template 404 | ✅ `/treinos/uuid-válido` carrega corretamente | Manual test com UUID real |
| **BUG#4** Assessment 404 | ✅ `/avaliacoes/uuid-válido` carrega com permissão | Teste como owner da avaliação |
| **BUG#5** Alimentos faltando | ✅ TACO DB com 7000+ itens + fotos | DB query: `SELECT COUNT(*) FROM foods` |

**QA Checklist — Sprint 1:**
- [ ] Mobile (iPhone 12): Zero cookie banner
- [ ] Mobile (Android): Zero PWA banner
- [ ] 10 templates diferentes: 10/10 carregam
- [ ] 5 assessments: 5/5 carregam com auth
- [ ] Food search: 7000+ items retornados
- [ ] Smoke tests: 0 P0 errors
- [ ] Deploy: v1.9.4 tag criada

**Acceptance Status:** ❌ Não iniciado

---

#### Sprint 2: UX Improvements

| Feature | Acceptance Criteria | Método Validação |
|---------|-------------------|------------------|
| **UX#19** Nome Completo | Form field salva + retorna em perfil | Manual test + DB check |
| **UX#18** Google OAuth | Signup via Google → `/complete-profile` | OAuth flow test |
| **UX#7** Apple removido | Button não aparece em `/register/student` | Visual inspection |
| **UX#6** Color tokens | Todos valores definidos em config | Code review + grep check |

**QA Checklist — Sprint 2:**
- [ ] Full name form: salva em DB
- [ ] Google OAuth: fluxo completo funciona
- [ ] Layout: ajustado sem Apple button
- [ ] Colors: valores em `config/vfit-colors.ts`
- [ ] Type-check: 0 errors
- [ ] Deploy: v1.9.4 patch tag criada

**Acceptance Status:** ❌ Não iniciado

---

#### Sprints 3-4: Performance & Polish

| Feature | Acceptance Criteria | Método Validação |
|---------|-------------------|------------------|
| **UX#14** Redirect preservado | Retorna à página anterior após login | Manual deep-link test |
| **UX#15** Turnstile invisível | Captcha não aparece antes de resolver | DevTools element inspect |
| **UX#13** Barra progresso | Anima ao trocar de step | Chrome 60fps check |
| **UX#16** Progresso salvo | Volta para step N ao reabrir onboarding | localStorage inspection |

**QA Checklist — Sprints 3-4:**
- [ ] Redirect: `/dashboard?redirect=/treinos` funciona
- [ ] Captcha: `opacity: 0` até resolução
- [ ] Barra: suave 150-300ms transition
- [ ] localStorage: JSON válido ao fechar
- [ ] FCP: <2s mesmo em 3G
- [ ] Smoke auth: SMOKE_PERSONAL_TOKEN válido
- [ ] Production deploy: 0 errors

**Acceptance Status:** ❌ Não iniciado

---

### FASE 2 — Design System

#### Sprint 5-10: Color System & Components

| Componente | Acceptance Criteria | WCAG |
|------------|-------------------|------|
| **Primary Button** | Bkgd azul `#1d63d4`, texto branco, 7:1 ratio | ✅ AAA |
| **Secondary Button** | Bkgd gris, texto dark, 5:1+ ratio | ✅ AA |
| **Success Badge** | Verde com contraste 4.5:1 vs. fundo | ✅ AA |
| **Error State** | Vermelho com ícone X, 4.5:1 ratio | ✅ AA |
| **Focus Ring** | Outline 2px azul, visível em todos elementos | ✅ AA |

**QA Checklist — Fases 2:**
- [ ] WAVE audit: 0 errors, <10 warnings
- [ ] aXe DevTools: 0 violations
- [ ] Color contrast checker: tudo ≥4.5:1
- [ ] Keyboard navigation: Tab percorre todos interativos
- [ ] Screen reader: Voiceover/NVDA funciona
- [ ] Respons test: 320px-2560px sem quebras
- [ ] Browser: Chrome, Firefox, Safari, Edge
- [ ] Production Lighthouse: 90+ score

**Acceptance Status:** ❌ Não iniciado (Bloqueado)

---

### FASE 3 — Modern Features

#### Sprint 11-14: Feature Completeness

| Feature | Acceptance Criteria | Técnico |
|---------|-------------------|---------|
| **Exercise Card** | GIF de 320px, rápido (<500ms load), labels | Replicate/ExerciseDB |
| **Timer** | Contador regressivo, vibração, som beep | Browser API |
| **Food Photos** | 800+ fotos, load <1s, zoom | R2 + CF Image Resizing |
| **Camera Scanner** | Barcode + nutrition label OCR | Vision AI + BarcodeDB |
| **Macro Ring** | Semicircle visual, animado, responsivo | Framer Motion |

**QA Checklist — Fase 3:**
- [ ] Exercise card: 50 exercícios teste, GIFs todos carregam
- [ ] Timer: <5s para disparar alarme
- [ ] Food search: 100 queries, <500ms resposta
- [ ] Camera: 10 items scanned corretamente
- [ ] Macro ring: valores atualizam em tempo real
- [ ] Network: <3G simulated sem timeouts
- [ ] Battery: 1h uso não drena >30%
- [ ] Data: <500MB cache total

**Acceptance Status:** ❌ Não iniciado (Bloqueado)

---

### FASE 4 — Polish & Launch

#### Sprint 15-16: Performance & Release

| Métrica | Target | Método |
|---------|--------|--------|
| **Lighthouse** | 90+ | PageSpeed Insights |
| **Bundle** | <200KB (gzip) | `next/bundle-analyzer` |
| **Cache** | 1 ano para assets | CF Headers |
| **Errors** | 0 P0 em 1h after launch | Sentry |

**QA Checklist — Fase 4:**
- [ ] Lighthouse mobile: 90+
- [ ] Lighthouse desktop: 90+
- [ ] FCP: <2s
- [ ] LCP: <2.5s
- [ ] CLS: <0.1
- [ ] FID: <100ms
- [ ] TTI: <4s
- [ ] Size budget: <200KB JS
- [ ] SQL injections: 0 vulnerabilities
- [ ] XSS: 0 DOM-based vulnerabilities
- [ ] CSRF: tokens em todos forms
- [ ] Docs: CHANGELOG.md + release notes
- [ ] Production: v2.0 tag criada

**Acceptance Status:** ❌ Não iniciado (Bloqueado)

---

## 📊 Métricas de Analytics (GA4 Goals)

### Onboarding Funnel

**Goal:** Medir drop-off em cada step

```
Step 1 (signup): 100 users
Step 2 (photo): 82 users  (-18%)
Step 3 (bio): 65 users    (-23%)
Step 4 (goals): 52 users  (-20%)
Step 5 (freq): 42 users   (-19%)
Step 6 (equipment): 38 users (-9%)
Step 7 (confirm): 36 users (-5%)
Completed: 36 users       (36% conversion)

TARGET v2.0: 75 users (75% conversion)
```

**Tracking Code (GA4):**
```javascript
gtag('event', 'page_view', {
  page_title: 'Onboarding Step ' + step,
  page_location: window.location.href
});

// Goal: onboarding_complete
if (step === 7) {
  gtag('event', 'onboarding_completed', {
    engagement_time_msec: 240000,
    session_id: sessionStorage.getItem('session_id')
  });
}
```

---

### Feature Engagement

| Evento | Goal | Target | Baseline |
|--------|------|--------|----------|
| `treino_iniciado` | 80% users/week | 60% | 45% |
| `alimento_registrado` | 60% users/week | 40% | 15% |
| `macro_visualizado` | 50% users/week | 25% | 5% |
| `camera_usado` | 40% users/week | 15% | 0% (nova feature) |

---

## 🔬 Testes de Qualidade (QA Matrix)

### Teste de Compatibilidade

| Navegador | Versão | Status | Prioridade |
|-----------|--------|--------|-----------|
| Chrome | Latest | ✅ Suportado | P0 |
| Firefox | Latest | ✅ Suportado | P0 |
| Safari | Latest | ✅ Suportado | P0 |
| Edge | Latest | ✅ Suportado | P1 |
| Samsung Internet | Latest | ✅ Testado | P2 |

### Teste de Dispositivos

| Dispositivo | Tamanho | Conexão | Teste |
|-------------|---------|---------|-------|
| iPhone SE | 375px | 4G | ✅ Priority |
| iPhone 12 | 390px | 4G | ✅ Priority |
| iPhone 14 Pro Max | 430px | 4G | ✅ Priority |
| Pixel 4 | 412px | 4G | ✅ Priority |
| Pixel 8 | 420px | 4G | ✅ Priority |
| iPad Air | 768px | WiFi | ⚠️ Secondary |
| Desktop | 1920px | WiFi | ✅ Priority |

### Teste de Velocidade Conexão

| Tipo | Latência | Downlink | Uplink | Teste |
|------|----------|----------|--------|-------|
| 4G | 50ms | 4 Mbps | 3 Mbps | ✅ Priority (Brasil real) |
| 3G | 100ms | 1.5 Mbps | 0.75 Mbps | ✅ Priority (fallback) |
| 2G | 500ms | 0.4 Mbps | 0.1 Mbps | ⚠️ Graceful degrade |
| WiFi | 10ms | 30 Mbps | 10 Mbps | ✅ Baseline |

---

## 🧪 Testes Automatizados (Vitest + Playwright)

### Unit Tests

```typescript
// Esperado para Fase 1:
// - utils/cookie.ts: suppressCookieBanner()
// - utils/uuid.ts: isUUID(), formatUUID()
// - lib/auth: permission checks para assessment
// Total: 20+ test cases

// Esperado para Fase 2:
// - components/button: todos variants × states
// - components/badge: color logic determinístico
// Total: 40+ test cases

// Esperado para Fase 3:
// - hooks/useTimer: countdown logic
// - hooks/useFoodSearch: debounce + caching
// - hooks/useCamera: permission handling
// Total: 60+ test cases

// Esperado para Fase 4:
// - e2e/onboarding: funnel completo
// - e2e/treino: criar + editar + deletar
// - e2e/food: search + add + macro
// Total: 15+ e2e flows
```

### Cobertura Target

| Fase | Unit | Integration | E2E | Total |
|------|------|-------------|-----|-------|
| 1 | 60% | 40% | 0% | **50%** |
| 2 | 70% | 50% | 10% | **65%** |
| 3 | 75% | 60% | 30% | **75%** |
| 4 | 80% | 70% | 50% | **80%** |

---

## 🚨 Critérios de Bloqueador de Deploy

| Critério | Fase 1 | Fase 2 | Fase 3 | Fase 4 |
|----------|--------|--------|--------|--------|
| Nenhum erro P0 em produção | ✅ BLOQUEADOR | ✅ | ✅ | ✅ |
| Lighthouse ≥80 | — | ✅ | ✅ | ✅ BLOQUEADOR |
| 0 XSS vulnerabilities | ✅ | ✅ | ✅ | ✅ BLOQUEADOR |
| Smoke auth valid | ✅ BLOQUEADOR | ✅ | ✅ | ✅ |
| Docs CHANGELOG updated | ✅ | ✅ | ✅ | ✅ BLOQUEADOR |
| Git tag criada | ✅ | ✅ | ✅ | ✅ BLOQUEADOR |

**Deploy bloqueado se:**
- Qualquer critério vermelho não atendido
- Manual QA sign-off pendente
- Menos de 2h confirmação no grupo

---

## 📈 Sucessos Esperados

### Semana 1 (Após Sprint 1)
```
✅ Cookie banner suprimido
✅ PWA banner suprimido  
✅ Templates carregam
✅ Assessments carregam
✅ TACO DB (7000 foods)
✅ v1.9.4 em produção
```

### Semana 2 (Após Sprint 2-4)
```
✅ Google OAuth funciona
✅ Color tokens definidos
✅ Login preserva redirect
✅ Barra progresso visual
✅ localStorage persist
✅ Lighthouse >70
```

### Semana 3-5 (Após Fase 2)
```
✅ Design system 100% azul
✅ WCAG 2.1 AA completo
✅ Componentes atualizados
✅ Conversão 55%+
✅ Lighthouse >80
```

### Semana 6-9 (Após Fase 3)
```
✅ Timer descanso
✅ Filtros exercício
✅ 800+ food photos
✅ Camera scanner funciona
✅ Macro ring visual
✅ Engagement +25%
```

### Semana 10-12 (Após Fase 4)
```
✅ Lighthouse 90+
✅ Core Web Vitals OK
✅ 0 P0 errors
✅ Docs completos
✅ v2.0.0 em produção
✅ Conversão 75%
```

---

## 🎯 Success Metrics Summary (One-Pager)

| Métrica | Baseline | Target | Ganho | Status |
|---------|----------|--------|-------|--------|
| **Conversion Onboarding** | 40% | 75% | +35p | 🔴 Não iniciado |
| **Lighthouse (mobile)** | 62 | 90+ | +28p | 🔴 Não iniciado |
| **Design Consistency** | 30% azul | 100% azul | +70p | 🔴 Não iniciado |
| **Feature Parity** | 0/5 | 5/5 | +5 | 🔴 Não iniciado |
| **WCAG Compliance** | 70% AA | 100% AA | +30p | 🔴 Não iniciado |
| **Bundle Size** | 245KB | 180KB | -65KB | 🔴 Não iniciado |
| **TTFB** | 1.5s | <1s | -500ms | 🔴 Não iniciado |
| **User Engagement** | 45% active/day | 70% active/day | +25p | 🔴 Não iniciado |

---

**Pronto para execução:** Todas as métricas, critérios e testes definidos. Copilot pode começar Sprint 1 com 100% de clareza sobre o que significa "sucesso".

Para começar: Veja [03-FASE-ESTRUTURAL.md](03-FASE-ESTRUTURAL.md) com Sprint 1 detailed specs.
