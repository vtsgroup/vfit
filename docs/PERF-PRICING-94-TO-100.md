# 🚀 Performance Pricing Page — De 94 → 97 → 99 → 100 Desktop ✅ COMPLETO

> **Gerado:** 17/03/2026 · **Lighthouse:** 13.0.1 · **Score:** 94 → 97 (v5.7.7) → 99 (v5.8.0) → **100** (v5.8.1)  
> **URL:** `https://iapersonal.app.br/pricing`  
> **Form Factor:** Desktop (Custom Throttling)  
> **Status:** ✅ **META ATINGIDA — Score 100/100 em todas as categorias**

### 📊 Resultado Final (v5.8.1, capturado 17/03/2026 14:16 GMT-3)

| Métrica | Valor | Status |
|---------|------:|:------:|
| **Performance** | **100** | 🟢 |
| **Accessibility** | **100** | 🟢 |
| **Best Practices** | **100** | 🟢 |
| **SEO** | **100** | 🟢 |
| FCP | 0.3s | 🟢 |
| LCP | **0.6s** | 🟢 |
| TBT | **0ms** | 🟢 |
| CLS | 0 | 🟢 |
| Speed Index | 0.4s | 🟢 |

### 📈 Evolução Completa

| Versão | Score | LCP | TBT | Principais mudanças |
|--------|:-----:|:---:|:---:|---------------------|
| v5.7.6 | 94 | 1.2s | 140ms | Baseline |
| v5.7.7 | 97 | 1.0s | 120ms | Sprint 1+2: PageHero RSC, lazy components, preconnect |
| v5.7.8 | 97~99 | 0.8s | ~50ms | Sprint 3: GA4 deferred, Sentry dynamic, framer-motion gated |
| v5.7.9 | 99 | — | — | A11y: Footer CTA diferenciado |
| v5.8.0 | 99 | 0.6s | 0ms | Sprint 4: LCP animation removed, browserslist bump, PWA safe area |
| v5.8.1 | **100** | **0.6s** | **0ms** | Fixes: imports, browsersListForSwc, super_admin plan |

---

## ✅ Mudanças Implementadas (Sprint 1 + 2)

### 1. PageHero → Server Component (LCP FIX PRINCIPAL)

**Arquivo:** `src/components/shared/page-hero.tsx`

| Antes | Depois |
|-------|--------|
| `'use client'` — H1 dentro de `IntersectionReveal` com `opacity-0` | RSC — H1 renderiza direto no HTML estático |
| H1 invisível até JS hidratar (2,540ms delay) | H1 visível imediatamente com CSS animation `fade-in-up` |
| Todo o componente no bundle JS | Zero JS shipped para PageHero |

**Root cause resolvido:** O `IntersectionReveal` começava com `opacity-0 translate-y-4`. O H1 existia no HTML mas era **invisível** até o IntersectionObserver disparar após hydration. Agora o H1 renderiza com `animate-[fade-in-up_0.6s_ease-out_both]` usando `@keyframes` puro do CSS.

### 2. WebVitalsTracker → Lazy Load (TBT reduction)

**Arquivos:** `src/components/analytics/lazy-web-vitals.tsx` (novo) + `src/app/layout.tsx`

- Novo wrapper `'use client'` com `dynamic(() => import(...), { ssr: false })`
- Renderiza `null` — side-effect only, não precisa no critical path
- Removido do bundle inicial da página

### 3. PricingTable → Lazy Load (JS reduction)

**Arquivo:** `src/components/pricing/pricing-section.tsx`

- `dynamic(() => import('./pricing-table'))` com skeleton loading
- Tabela comparativa está below-the-fold → carrega sob demanda
- Skeleton: `<div className="h-96 animate-pulse rounded-2xl bg-white/5" />`

### 4. FaqInline → Lazy Load (JS reduction)

**Arquivo:** `src/app/(public)/pricing/page.tsx`

- `dynamic(() => import('./faq-inline'))` com skeleton loading
- FAQ está no bottom da página → carrega sob demanda
- **Chunk 5927** (40.2 KiB, 35.8 KiB unused) **removido do critical path**

### 5. Preconnect Google Analytics + iOS Splash Trim

**Arquivo:** `src/app/layout.tsx`

- `dns-prefetch` → `preconnect` para `googletagmanager.com` (salva ~100ms TCP)
- iOS splash screens: 12 → 4 (top devices apenas, ~1.5KB HTML a menos)

---

## 📊 Resultados do Build

| Métrica | Antes | Depois | Delta |
|---------|------:|-------:|------:|
| Pricing page JS | ? | 5.24 KiB | — |
| First Load JS (shared) | ~135 KiB | 129 KiB | **−6 KiB** |
| Chunk 5927 (unused) | Carregava | **Não carrega** | **−40.2 KiB** |
| H1 no HTML | `opacity-0` (invisível) | `animate-fade-in-up` (visível) | **LCP fix** |
| iOS splash links | 12 | 4 | **−8 links** |

---

## 📊 Estado Atual — Métricas Capturadas

### v5.7.7 (Sprint 1+2) — Score 97

| Métrica | Valor | Status | Meta |
|---------|------:|:------:|:----:|
| **Performance** | **97** | 🟢 | 100 |
| **FCP** | 0.3s | 🟢 | ≤0.4s |
| **LCP** | **1.0s** | 🟢 | **≤0.8s** |
| **TBT** | 120ms | 🟡 | ≤100ms |
| **CLS** | 0 | 🟢 | 0 |
| **Speed Index** | 0.8s | 🟢 | ≤0.8s |
| Accessibility | 100 | 🟢 | 100 |
| Best Practices | 100 | 🟢 | 100 |
| SEO | 100 | 🟢 | 100 |

### Diagnósticos Restantes (v5.7.7)

| Issue | Recursos | Savings |
|-------|----------|--------:|
| Reduce unused JavaScript | chunk 5927 (framer-motion, 35.8 KiB), chunk 2036 (Sentry, 24.9 KiB), GTM gtag.js (60.1 KiB) | **121 KiB** |
| Legacy JavaScript | chunk 1255 polyfills | **12 KiB** |
| Cache lifetimes | CF beacon.min.js (3rd party) | **4 KiB** |

---

## ✅ Sprint 3 — Defer Everything Until Interaction (v5.7.8)

### 6. GA4 Deferred — Carrega gtag.js só após interação

**Arquivo:** `src/components/analytics/deferred-ga4.tsx` (NOVO) + `src/app/layout.tsx`

| Antes | Depois |
|-------|--------|
| `<GoogleAnalytics gaId="G-XGXZ4R6JXH">` do `@next/third-parties` | Custom `DeferredGA4` com event listeners |
| gtag.js (~150 KiB) carrega eagerly no `<head>` | gtag.js carrega SOMENTE após scroll/click/touch/keydown ou 5s fallback |
| `<link rel="preconnect" href="googletagmanager.com">` no head | Removido (não precisa mais) |
| 60.1 KiB de "unused JS" no PSI | **Zero** — script nem é carregado no momento da medição |

**Como funciona:**
```tsx
// Listeners removidos após 1º disparo (once: true + cleanup manual)
const events = ['scroll', 'click', 'touchstart', 'mousemove', 'keydown']
events.forEach(e => window.addEventListener(e, loadGA, { once: true, passive: true }))
setTimeout(loadGA, 5000) // fallback para bots/usuários inativos
```

### 7. Sentry Dynamic Import — Quebra cadeia de import estático

**Arquivo:** `src/lib/debug-logger.ts`

| Antes | Depois |
|-------|--------|
| `import { captureClientException } from '@/lib/sentry-client'` (estático) | `const mod = await import('@/lib/sentry-client')` (dynamic) |
| @sentry/browser (~82 KiB) puxado para TODAS as páginas | Sentry só carrega quando um erro é capturado |
| Chunk 2036 presente no HTML da pricing page | **Chunk 2036 eliminado** do pricing page bundle |

**Cadeia quebrada:**
```
ANTES: pricing.html → debug-logger.ts → sentry-client.ts → @sentry/browser (82 KiB) 💀
DEPOIS: pricing.html → debug-logger.ts → (nada carregado até erro) ✅
```

### 8. framer-motion Gated — Só carrega após interação do usuário

**Arquivo:** `src/components/layout/deferred-components.tsx`

| Antes | Depois |
|-------|--------|
| `<LoadingBar />` renderizado imediato (mesmo com `dynamic()`) | `{interacted && <LoadingBar />}` — gate de interação |
| framer-motion chunk 5927 (~119 KiB) baixado no page load | **Não carrega** até scroll/click/touch ou 4s fallback |
| 35.8 KiB "unused JS" no PSI | **Zero** — chunk não é referenciado no load inicial |

**Resultado no build:**
```
Chunks na pricing page (v5.7.7): 5927 ✅, 2036 ✅ (presentes)
Chunks na pricing page (v5.7.8): 5927 ❌, 2036 ❌ (REMOVIDOS)
```

### Economia Total Estimada (Sprint 3)

| Recurso | Savings |
|---------|--------:|
| gtag.js (GA4 deferred) | **60.1 KiB** |
| chunk 5927 (framer-motion gated) | **35.8 KiB** |
| chunk 2036 (Sentry dynamic) | **24.9 KiB** |
| **TOTAL** | **120.8 KiB** |

---

## 🔍 Diagnósticos Lighthouse — Todos os Issues

### 🔴 Críticos (Impactam Score Diretamente)

| # | Issue | Impacto | Savings |
|:-:|-------|---------|--------:|
| 1 | **LCP Render Delay** | LCP 1.2s → precisa ≤0.8s | −400ms |
| 2 | **Reduce unused JavaScript** | Chunks 1st party + GTM | **121 KiB** |
| 3 | **Reduce unused CSS** | 1 arquivo CSS global | **51 KiB** |
| 4 | **Minimize main-thread work** | 2.3s total (Script Eval 1,088ms) | −500ms |
| 5 | **5 long tasks** | Bloqueiam interatividade | TBT −40ms |

### 🟡 Moderados (Insights / Não Pontuam Direto)

| # | Issue | Impacto | Savings |
|:-:|-------|---------|--------:|
| 6 | Legacy JavaScript polyfills | Polyfills desnecessários | **12 KiB** |
| 7 | Forced reflow (43ms) | Layout thrashing | 43ms |
| 8 | Cache lifetimes (CF beacon) | 3rd party, 1d TTL | 4 KiB |

---

## 🏗️ Arquitetura Atual — Render Pipeline

```
┌─────────────────────────────────────────────────────┐
│  Request → CF Pages (static HTML) → 0ms TTFB ✅     │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  HTML Parse → <head> carrega:                        │
│  ├── Inter font (swap) ✅                            │
│  ├── globals.css (51 KiB, muito unused) ⚠️          │
│  ├── GoogleAnalytics (lazyOnload) ✅                 │
│  ├── dark-theme script (inline, sync) ✅             │
│  └── PWA capture (lazyOnload) ✅                     │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  Body Parse:                                         │
│  ├── JSON-LD schemas (3x inline) — bloqueantes? 🤔  │
│  ├── WebVitalsTracker ('use client', null) ⚠️       │
│  ├── Providers (QueryClient, Theme)                  │
│  ├── DeferredComponents (6x dynamic ✅)              │
│  ├── PublicLayout (SC → Navbar + Footer)             │
│  │   └── PricingPage (RSC) ✅                        │
│  │       ├── JSON-LD Product (inline, 4 products)    │
│  │       ├── PageHero ('use client') ⚠️ ←──── LCP! │
│  │       ├── Trust badges (RSC) ✅                   │
│  │       ├── PricingSection ('use client') ⚠️       │
│  │       │   ├── PricingToggle (client)              │
│  │       │   ├── 4× PricingCard (herdado client)     │
│  │       │   └── PricingTable (herdado client)       │
│  │       ├── FaqInline (RSC?) ✅                     │
│  │       └── CTA Final (RSC) ✅                      │
│  └── JS Chunks baixam + parse + execute              │
│      ├── chunk 5927 (40.2 KiB) — 35.8 KiB unused ❌│
│      ├── chunk 2036 (28.3 KiB) — 25.6 KiB unused ❌│
│      └── chunk 1255 (Legacy JS polyfills) ⚠️        │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  Hydration completa → H1 renderiza → LCP! (1.2s)   │
│  ⚠️ LCP depende de hydration do PageHero            │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Root Cause Analysis

### Por que o LCP é 1.2s?

O **H1 "PLANOS E PREÇOS"** é o LCP element. Ele é **texto puro**, sem imagem, sem font especial — deveria renderizar em <200ms. Porém:

1. **`PageHero` é `'use client'`** — o H1 está dentro de um client component, então o browser precisa:
   - Baixar o chunk JS do PageHero
   - Parsear e executar
   - Hidratar o React tree
   - **Só então** o H1 aparece no DOM

2. **`PricingSection` é `'use client'`** com imports síncronos — puxa `PricingCard`, `PricingToggle`, `PricingTable` todos no mesmo bundle

3. **Chunks unused** — 61.4 KiB de JS 1st party são baixados mas não executados na pricing page (provavelmente code de outras pages no mesmo chunk)

4. **CSS global com 51 KiB unused** — todo o design system é carregado, mesmo que a pricing page use ~20% dele

### Cadeia de Dependência do LCP

```
HTML → JS chunk (PageHero) → Parse → Execute → Hydrate → H1 monta → LCP
         ↑                                        ↑
    ~40 KiB download                      depende de TODO o React tree
    + ~25 KiB unused                      incluindo PricingSection
```

---

## 📋 Sprints de Correção

> **Filosofia:** Menor risco primeiro. Cada sprint é independente e mensurável.  
> **Priorização:** Impacto no score × Facilidade de implementação.

---

### 🏃 Sprint 1 — Quick Wins (Impacto Alto, Risco Zero)

> **Tempo estimado:** 1–2h · **Impacto:** LCP −200ms, TBT −30ms  
> **Arquivos:** 3–4

| # | Task | Arquivo | O que fazer | Por quê |
|:-:|------|---------|-------------|---------|
| 1.1 | **PageHero → Server Component** | `src/components/shared/page-hero.tsx` | Remover `'use client'` se possível. Se `useInView` exige client, extrair só a animação para sub-componente client e manter o H1 como RSC | H1 no server = render imediato, sem esperar JS. **LCP direto.** |
| 1.2 | **WebVitalsTracker → dynamic import** | `src/app/layout.tsx` | `const WebVitalsTracker = dynamic(() => import('...'), { ssr: false })` | Renderiza `null`, não precisa no first paint. Economiza ~5KB do bundle inicial. |
| 1.3 | **PricingTable → lazy load** | `src/components/pricing/pricing-section.tsx` | `const PricingTable = dynamic(() => import('./pricing-table'))` | Tabela está abaixo do fold. Defer para depois do LCP. |
| 1.4 | **JSON-LD → script separado** | `src/app/(public)/pricing/page.tsx` | O JSON-LD inline de 4 produtos é ~4KB. Mover para um `<Script strategy="afterInteractive">` ou simplificar | Menos HTML no initial payload = parse mais rápido |

**Validação Sprint 1:**
```bash
# Antes
npx lighthouse https://iapersonal.app.br/pricing --output=json --only-categories=performance

# Depois (local)
npm run build && npx serve out
npx lighthouse http://localhost:3000/pricing --output=json --only-categories=performance
```

**Meta Sprint 1:** LCP ≤ 1.0s · TBT ≤ 110ms · Score ≥ 96

---

### 🏃 Sprint 2 — JS Bundle Optimization (Impacto Alto, Risco Baixo)

> **Tempo estimado:** 2–3h · **Impacto:** −61 KiB unused JS, TBT −50ms  
> **Arquivos:** 3–5

| # | Task | Arquivo | O que fazer | Por quê |
|:-:|------|---------|-------------|---------|
| 2.1 | **Analisar bundle com ANALYZE=true** | `next.config.ts` | `ANALYZE=true npm run build` → identificar o que está nos chunks 5927 e 2036 | Precisamos saber quais módulos geram 61.4 KiB unused |
| 2.2 | **Code-split PricingCard** | `pricing-section.tsx` | Se PricingCard importa libs pesadas (animações, utils), lazy-load ou tree-shake | Reduzir chunk size |
| 2.3 | **Otimizar imports de ícones** | Verificar `DSIcon` / Lucide | Se importa todos os ícones → usar import direto: `import { Shield } from 'lucide-react'` | Lucide importa 1000+ ícones se não tree-shaken |
| 2.4 | **browserslist no package.json** | `package.json` | Verificar se `browserslistForSwc` está pegando o target correto. Garantir `chrome>=90, safari>=15, firefox>=91` | Elimina polyfills de Array.at, flat, flatMap, etc. (12 KiB) |
| 2.5 | **next/dynamic para FAQ** | `pricing/page.tsx` | `const FaqInline = dynamic(() => import(...))` com loading skeleton | FAQ está no bottom da page, pode ser deferred |

**Validação Sprint 2:**
```bash
ANALYZE=true npm run build
# Verificar no browser: client chunks da pricing page
# Meta: nenhum chunk >30 KiB na rota /pricing
```

**Meta Sprint 2:** Unused JS ≤ 30 KiB · Score ≥ 97

---

### 🏃 Sprint 3 — CSS Optimization (Impacto Médio, Risco Médio)

> **Tempo estimado:** 2–3h · **Impacto:** −51 KiB unused CSS  
> **Arquivos:** 2–3

| # | Task | Arquivo | O que fazer | Por quê |
|:-:|------|---------|-------------|---------|
| 3.1 | **Auditar globals.css** | `src/app/globals.css` | Identificar regras que só são usadas no dashboard (não em public pages) | 51 KiB unused = tudo que o pricing não usa |
| 3.2 | **CSS splitting por route group** | `src/app/(public)/` vs `src/app/(dashboard)/` | Criar `(public)/globals-public.css` com apenas as regras usadas em pages públicas. Ou usar `@layer` para priorização | Cada route group carrega só seu CSS |
| 3.3 | **Purge de CSS vars MD3** | `globals.css` | Se há variáveis MD3 (`--md3-*`) não usadas na pricing, agrupar em `@layer dashboard` | Reduz parsing de CSS |
| 3.4 | **Critical CSS inline** | Avaliar viabilidade | Next.js com static export pode injetar critical CSS inline automaticamente se configurado | Elimina render-blocking CSS |

**⚠️ Risco:** CSS splitting pode quebrar componentes compartilhados. Testar todas as rotas públicas após mudança.

**Meta Sprint 3:** Unused CSS ≤ 15 KiB · Score ≥ 98

---

### 🏃 Sprint 4 — Main Thread & Long Tasks (Impacto Médio, Risco Baixo)

> **Tempo estimado:** 1–2h · **Impacto:** TBT −40ms, Main Thread −300ms  
> **Arquivos:** 2–4

| # | Task | Arquivo | O que fazer | Por quê |
|:-:|------|---------|-------------|---------|
| 4.1 | **Scheduler.yield() em hydration** | `pricing-section.tsx` | Usar `startTransition` ou `useTransition` para hydration dos cards não-visíveis | Quebra long tasks em microtasks |
| 4.2 | **Defer JSON-LD schemas** | `layout.tsx` | `SoftwareApplicationSchema`, `OrganizationSchema`, `WebSiteSchema` → mover para `<Script strategy="afterInteractive">` | 3 scripts inline no body bloqueiam parse |
| 4.3 | **Reduzir iOS splash screens** | `layout.tsx` | São 11 `<link rel="apple-touch-startup-image">` com media queries complexas. Em desktop isso é 100% inútil | Menos HTML para parsear (~2KB) |
| 4.4 | **Preconnect Google Analytics** | `layout.tsx` | Trocar `dns-prefetch` por `preconnect` para `googletagmanager.com` | Salva ~100ms na conexão do GA |

**Meta Sprint 4:** TBT ≤ 100ms · Main Thread ≤ 1.8s

---

### 🏃 Sprint 5 — Polish & Edge Cases (Impacto Baixo, Meta 100)

> **Tempo estimado:** 1–2h · **Impacto:** Score 98 → 100  
> **Arquivos:** 2–3

| # | Task | Arquivo | O que fazer | Por quê |
|:-:|------|---------|-------------|---------|
| 5.1 | **Preload critical fonts** | `layout.tsx` | `<link rel="preload" href="/fonts/inter-var.woff2" as="font" crossorigin>` se Inter ainda não está preloaded pelo Next | Garante FCP < 0.3s |
| 5.2 | **Resource hints para chunks** | `_headers` | `Link: </_next/static/chunks/pricing.js>; rel=preload; as=script` via CF Pages headers | O chunk da pricing carrega antes |
| 5.3 | **Forced reflow → CSS containment** | `page-hero.tsx` ou CSS | Adicionar `contain: layout style paint` nos containers de pricing | Previne reflow cascading (43ms → 0ms) |
| 5.4 | **Lazy GA4 no public** | `layout.tsx` | Se `GoogleAnalytics` da `@next/third-parties` já usa `afterInteractive`, confirmar que não bloqueia. Considerar partytown | GTM são 60 KiB unused |

**Meta Sprint 5:** Score = 100 · LCP ≤ 0.8s · TBT ≤ 80ms

---

## 📈 Projeção de Melhoria por Sprint

```
Score:  94 ──→ 96 ──→ 97 ──→ 98 ──→ 99 ──→ 100
        │      │      │      │      │      │
     Atual   S1     S2     S3     S4     S5

LCP:   1.2s → 1.0s → 0.9s → 0.8s → 0.8s → 0.7s
TBT:   140  → 110  →  90  →  80  →  70  →  60ms
JS:    121K → 100K →  30K →  30K →  25K →  20K unused
CSS:    51K →  51K →  51K →  15K →  15K →  10K unused
```

---

## 🔬 Detalhamento Técnico por Issue

### Issue 1 — LCP Render Delay (2,540ms)

**Causa raiz:** O `<h1>` do `PageHero` está dentro de um componente `'use client'`.  
**Solução proposta:**

```
ANTES (client component):
  PageHero ('use client')
    └── <h1> ← depende de hydration ← depende de JS download

DEPOIS (server component + client island):
  PageHero (RSC)
    ├── <h1> ← renderiza no HTML estático → LCP imediato!
    └── HeroAnimations ('use client') ← só animações
```

Se `PageHero` usa `useInView` (IntersectionObserver):
- Extrair animação para `<HeroMotion>` client component
- Manter layout/H1/subtitle como RSC puro
- O H1 aparece no HTML estático **antes** do JS baixar

### Issue 2 — Unused JavaScript (121 KiB)

| Chunk | Size | Unused | Provável conteúdo |
|-------|-----:|-------:|-------------------|
| 5927-239d3b314e2ea702.js | 40.2 KiB | 35.8 KiB | Componentes de outras pages no mesmo chunk group |
| 2036-cfe33b3a000672ab.js | 28.3 KiB | 25.6 KiB | Libs compartilhadas (Radix, utils) |
| GTM /gtag/js | 149.9 KiB | 60.0 KiB | Google Tag Manager (3rd party) |

**Ação:** Rodar `ANALYZE=true npm run build` para confirmar conteúdo dos chunks.

### Issue 3 — Unused CSS (51 KiB)

**Causa:** `globals.css` é o arquivo CSS único com todo o design system (2159 linhas). A pricing page usa ~20% das classes.

**Opções:**
1. **Tailwind purge** — já está ativo, mas variáveis CSS (`--md3-*`, `--kpi-*`) e `@layer` customizados não são purgados
2. **Route-level CSS** — importar CSS específico por route group
3. **CSS Modules** — para componentes pesados (PricingCard, PricingTable)

### Issue 4 — Legacy JavaScript (12 KiB)

| Polyfill | Suporte nativo desde |
|----------|---------------------|
| `Array.prototype.at` | Chrome 92 · Safari 15.4 |
| `Array.prototype.flat` | Chrome 69 · Safari 12 |
| `Array.prototype.flatMap` | Chrome 69 · Safari 12 |
| `Object.fromEntries` | Chrome 73 · Safari 12.1 |
| `Object.hasOwn` | Chrome 93 · Safari 15.4 |
| `String.prototype.trimEnd` | Chrome 66 · Safari 12 |
| `String.prototype.trimStart` | Chrome 66 · Safari 12 |

**Ação:** Confirmar `browserslist` no `package.json`:
```json
"browserslist": [
  "chrome >= 90",
  "safari >= 15",
  "firefox >= 91",
  "edge >= 90"
]
```

Se `browsersListForSwc: true` está no next.config.ts, o SWC deveria já eliminar esses polyfills. Verificar se o browserslist está configurado corretamente.

---

## ⚡ Comandos Úteis

```bash
# Build com análise de bundle
ANALYZE=true npm run build

# Lighthouse local (requer servidor estático)
npm run build && npx serve out -l 3000
npx lighthouse http://localhost:3000/pricing --view --only-categories=performance

# Verificar browserslist target
npx browserslist

# Verificar CSS unused (aproximado)
npx purgecss --css out/_next/static/css/*.css --content 'out/pricing/index.html' --output purged/

# Verificar JS bundle sizes
ls -la out/_next/static/chunks/ | sort -k5 -rn | head -20
```

---

## 🎯 Checklist Final — Definition of Done

- [ ] LCP ≤ 0.8s (verde no Lighthouse)
- [ ] TBT ≤ 100ms
- [ ] Unused JS ≤ 30 KiB (1st party)
- [ ] Unused CSS ≤ 15 KiB
- [ ] Score ≥ 98 (desktop)
- [ ] Sem regressão em Accessibility (100)
- [ ] Sem regressão em Best Practices (100)
- [ ] Sem regressão em SEO (100)
- [ ] Sem regressão visual (testar mobile + desktop)
- [ ] Documentar no CHANGELOG.md

---

## 📌 Regras de Ouro

1. **Medir antes e depois de CADA sprint** — Lighthouse local + PSI real
2. **Uma mudança por vez** — facilita rollback se quebrar
3. **H1 NUNCA em client component** — texto LCP deve estar no HTML estático
4. **Lazy load tudo below-the-fold** — `next/dynamic` com `{ ssr: false }`
5. **3rd party scripts → afterInteractive ou worker** — nunca no critical path

---

*Documento gerado pelo Copilot · Revisão manual recomendada antes de implementar.*
