# 🎯 Lighthouse 100/100 — Plano de Sprints

> **Versão:** 1.0 · **Baseline:** v5.6.6 · **Scores Atuais:** Perf 93 | A11y 95 | BP 100 | SEO 100
> **Meta:** 100 | 100 | 100 | 100
> **Página alvo:** `https://iapersonal.app.br/pricing`

---

## 📊 Diagnóstico Real (auditado no código, não estimativas)

### O que o plan.md original ERROU vs realidade:

| Claim do Plan.md | Realidade Auditada |
|---|---|
| Logo `400×320px` servido como 70×56 | ❌ Logo é `96×77px`, exibido `40×32` (desktop) e `32×26` (mobile) |
| Sem `fetchpriority="high"` | ❌ Desktop logo **JÁ TEM `priority`** (Next/Image gera fetchpriority) |
| GTM sem `lazyOnload` | ❌ **JÁ TEM `strategy="lazyOnload"`** desde v5.6.6 |
| Sem preload da imagem LCP | ❌ **JÁ TEM** `<link rel="preload" href="/images/logo-transparent-96.webp">` |
| Headings h1→h3 skip (sem h2) | ✅ Correto — PageHero=h1, PricingCard=h3, PricingSection=h2, page CTA=h2 |
| Footer h4 quebrando hierarquia | ✅ Correto — h4 no footer sem h2/h3 ancestral |
| Contraste botões brand-primary | ✅ Correto — `text-white` sobre `#22C55E` = ~2.8:1 |
| Footer text-white/40 e /30 | ✅ Correto — 5 ocorrências com contraste < 3:1 |
| Preconnect API desnecessário | ✅ Correto — API preconnect inútil no /pricing |

### LCP Breakdown Real (o que IMPORTA)

```
TTFB:                  0ms  ✅ (Cloudflare edge)
Resource Load Delay: 910ms  ❌ CSS blocking discovery
Resource Load Duration: 20ms ✅ (logo é tiny)
Element Render Delay: 910ms ❌ CSS blocking render
```

**Causa raiz:** CSS de 53.5 KiB bloqueando render. O browser precisa parsear TODO o CSS antes de pintar o LCP.
O preload da imagem já existe, mas o CSS bloqueia o render delay, NÃO o download.

---

## 🏃 Sprint 1 — Quick Wins A11y (contraste + headings)
> **Impacto:** A11y 95 → 100 | **Risco:** Zero | **Tempo:** ~30min

### Task 1.1 — Footer: text-white/40 → text-white/70
**Arquivo:** `src/components/landing/footer.tsx`

| Linha | Atual | Novo | Contraste |
|:-----:|-------|------|:---------:|
| 174 | `text-white/40` | `text-white/70` | 1.5:1 → ~4.8:1 ✅ |
| 179 | `text-white/40` | `text-white/70` | 1.5:1 → ~4.8:1 ✅ |

### Task 1.2 — Footer: text-white/30 → text-white/60
**Arquivo:** `src/components/landing/footer.tsx`

| Linha | Atual | Novo | Contraste |
|:-----:|-------|------|:---------:|
| 212 | `text-white/30` (h4) | `text-white/60` | 1.2:1 → ~3.8:1 ⚠️ |
| 243 | `text-white/30` (div) | `text-white/60` | 1.2:1 → ~3.8:1 ⚠️ |
| 249 | `text-white/30` (div) | `text-white/60` | 1.2:1 → ~3.8:1 ⚠️ |

> ⚠️ Para texto de 10px (< 14px bold / 18px normal) precisamos de 4.5:1 (AA).
> `text-white/60` dá ~3.8:1 → insuficiente para texto pequeno!
> **Decisão:** Usar `text-white/70` para os headings h4 também → ~4.8:1 ✅

### Task 1.3 — Footer: h4 → p (heading hierarchy)
**Arquivo:** `src/components/landing/footer.tsx` — Linha 212

```diff
- <h4 className="mb-5 text-[10px] text-white/30 uppercase" style={monoLabel}>
+ <p className="mb-5 text-[10px] text-white/70 uppercase" style={monoLabel}>
    {col}
- </h4>
+ </p>
```

**Justificativa:** h4 no footer quebra hierarquia semântica (pula h2→h3). Lighthouse penaliza.
Substituir por `<p>` com role decorativo. A semântica fica em `<nav aria-label="...">`.

### Task 1.4 — Pricing Card: contraste botão brand-primary
**Arquivo:** `src/components/pricing/pricing-card.tsx` — Linha 103

```diff
- ? 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20'
+ ? 'bg-brand-primary text-gray-900 hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20'
```

| Combinação | Contraste | WCAG |
|------------|:---------:|:----:|
| `text-white` em `#22C55E` | 2.8:1 | ❌ Fail |
| `text-gray-900` (#111827) em `#22C55E` | **7.5:1** | ✅ AAA |

### Task 1.5 — Pricing Card: contraste badge "MAIS POPULAR"
**Arquivo:** `src/components/pricing/pricing-card.tsx` — Linha 41

```diff
- className="rounded-full bg-brand-primary px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider"
+ className="rounded-full bg-brand-primary px-3 py-1 text-[10px] font-bold text-gray-900 uppercase tracking-wider"
```

### Task 1.6 — Pricing Page CTA: contraste botão "Começar grátis"
**Arquivo:** `src/app/(public)/pricing/page.tsx` — Linha ~191

```diff
- className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-8 py-3.5 text-sm font-bold text-white hover:bg-brand-primary/90 ..."
+ className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-8 py-3.5 text-sm font-bold text-gray-900 hover:bg-brand-primary/90 ..."
```

> **Nota:** Idealmente usar `<Button>` (Regra 14), mas para Sprint 1 focamos apenas no contraste.

### Task 1.7 — Pricing Page: heading hierarchy h1→h3 skip
**Atual:**
```
h1 "Planos e Preços" (PageHero)
  h3 "Essentials" (PricingCard)      ← SKIP! Falta h2
  h3 "Trainer" (PricingCard)
  h3 "Studio" (PricingCard)
  h2 "Comparativo completo" (PricingSection)
  h2 "Pronto para digitalizar..." (CTA)
```

**Correção no `pricing-card.tsx`:**
```diff
- <h3 className="mt-2 text-xl font-bold text-white">{plan.name}</h3>
+ <h3 className="mt-2 text-xl font-bold text-white">{plan.name}</h3>
```

Não precisa mudar o h3 — ele é correto. O problema é que não há h2 ANTES dos cards.

**Correção no `pricing-section.tsx` — adicionar h2 antes dos cards:**
Precisa de um h2 wrapper tipo "Escolha seu plano" antes do grid de cards, ou usar `sr-only`.

```diff
+ <h2 className="sr-only">Escolha seu plano</h2>
  {/* Grid de cards */}
```

### ✅ Critérios de Aceite — Sprint 1
- [ ] Zero falhas de contraste no Lighthouse para /pricing
- [ ] Heading hierarchy: h1 → h2 → h3 sequencial, sem pulos
- [ ] Footer sem `<h4>` — apenas `<p>` para labels
- [ ] Todos `text-white/30` e `text-white/40` eliminados do footer

---

## 🏃 Sprint 2 — Performance: Eliminar CSS Blocking (o gargalo real)
> **Impacto:** Perf 93 → ~97-98 | **Risco:** Médio | **Tempo:** ~1-2h

### Análise do Gargalo

O LCP de 1.5s é 95% causado pelo **CSS blocking** de 53.5 KiB. Isso não é um problema de imagem (o logo é tiny e já tem preload). O CSS precisa ser carregado e parseado antes que QUALQUER elemento visual seja renderizado.

**Chain real:**
```
HTML → CSS 3.16 KiB (358ms) → CSS 53.48 KiB (638ms) → Paint LCP
                                        ↑ GARGALO
```

### Task 2.1 — Preload do CSS principal
**Arquivo:** `src/app/layout.tsx`

Adicionar `<link rel="preload">` para o CSS principal, fazendo o browser descobri-lo ANTES de parsear o HTML que o referencia:

```tsx
<link rel="preload" href="/_next/static/css/[hash].css" as="style" />
```

**⚠️ Problema:** O hash do CSS muda a cada build. Não é viável hardcodar.

**Alternativa viável:** `next/font` com `display: 'swap'` (já implementado ✅) + reduzir tamanho do CSS.

### Task 2.2 — Reduzir globals.css (53.5 KiB → alvo < 30 KiB)

**Ações concretas:**
1. **Mover animações de landing para CSS Module** — `@keyframes` que só rodam em landing pages
2. **Purge de variáveis .light não usadas no /pricing** — .light tem ~60 vars, nenhuma usada em /pricing
3. **Mover chart styles para CSS Module** — `.recharts-*`, `.chart-*` etc.

**Estimativa de redução:**
| Bloco | Tamanho estimado | Ação |
|-------|:----------------:|------|
| Animações landing (@keyframes) | ~8 KiB | CSS Module |
| Variáveis .light | ~3 KiB | Manter (needed para dashboard) |
| Chart styles | ~5 KiB | CSS Module |
| Design tokens MD3 | ~4 KiB | Manter (reutilizados) |
| **Total removível** | **~13 KiB** | **53.5 → ~40 KiB** |

### Task 2.3 — browserslist moderno (eliminar polyfills)
**Arquivo:** `package.json`

```json
{
  "browserslist": [
    "chrome >= 90",
    "firefox >= 90",
    "safari >= 15",
    "edge >= 90"
  ]
}
```

**Impacto:** Elimina ~11.7 KiB de polyfills (Array.at, Object.hasOwn, etc.)

### Task 2.4 — compiler.removeConsole
**Arquivo:** `next.config.ts`

```ts
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
}
```

### Task 2.5 — OneSignal: delay de 3s após load
**Arquivo:** `src/components/pwa/sw-register.tsx`

O SDK já usa `defer` ✅, mas carrega imediatamente no mount.
Adicionar `setTimeout` de 3000ms para não competir com LCP:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    loadOneSignalSDK()
  }, 3000)
  return () => clearTimeout(timer)
}, [])
```

**Impacto:** -30.2 KiB de JS não-blocking no LCP window.

### ✅ Critérios de Aceite — Sprint 2
- [ ] CSS principal < 40 KiB (vs 53.5 KiB atual)
- [ ] LCP < 1.2s (vs 1.5s atual)
- [ ] Speed Index < 1.3s (vs 1.6s atual)
- [ ] Polyfills eliminados (chunk 1255 sem Array.at/Object.hasOwn)
- [ ] OneSignal carregado após 3s (verificar no Network tab)

---

## 🏃 Sprint 3 — Performance: Fine-tuning para 100
> **Impacto:** Perf ~98 → 100 | **Risco:** Baixo | **Tempo:** ~1h

### Task 3.1 — Otimizar logo para tamanho exato

O logo é `96×77px` mas é exibido em:
- Desktop: `width=40 height=32` → 80×64px @2x = 96px suficiente ✅
- Mobile: `width=32 height=26` → 64×52px @2x = 96px suficiente ✅

**Veredicto:** Logo 96px é adequado para 2x displays. NÃO precisa reduzir.
Mas podemos gerar uma versão otimizada menor (lossless → lossy com quality 80):

```bash
npx sharp -i public/images/logo-transparent-96.webp -o public/images/logo-transparent-96.webp --quality 75
```

### Task 3.2 — Preconnect cleanup

**Remover** (não usado no /pricing):
```diff
- <link rel="preconnect" href="https://api.iapersonal.app.br" />
- <link rel="dns-prefetch" href="https://api.iapersonal.app.br" />
```

**Problema:** API preconnect é usado no dashboard. Solução: mover para layout do dashboard.

**Alternativa segura:** Manter como `dns-prefetch` apenas (leve), remover `preconnect` (pesado):
```diff
- <link rel="preconnect" href="https://api.iapersonal.app.br" />
  <link rel="dns-prefetch" href="https://api.iapersonal.app.br" />
```

### Task 3.3 — PWA inline script → defer
**Arquivo:** `src/app/layout.tsx`

O script `beforeinstallprompt` (~30 linhas) é render-blocking. Mover para `next/script` com `afterInteractive`:

```tsx
<Script id="pwa-install-capture" strategy="afterInteractive">
  {`window.addEventListener('beforeinstallprompt', ...)`}
</Script>
```

### Task 3.4 — Tailwind v4 violations cleanup
**Arquivo:** `src/components/landing/navbar.tsx`

```diff
- className="... border-white/[0.06]"
+ className="... border-white/6"

- className="... bg-white/[0.04] border border-white/[0.08]"
+ className="... bg-white/4 border border-white/8"
```

> Regra 13: NUNCA `[var(...)]` ou `[0.xx]` — usar sintaxe canônica v4.

### ✅ Critérios de Aceite — Sprint 3
- [ ] Performance score = 100
- [ ] LCP < 1.0s
- [ ] Zero warnings de "preconnect unused"
- [ ] Zero bracket notation no CSS (Regra 12/13)
- [ ] PWA script não aparece no "render-blocking resources"

---

## 📋 Tracking Board

### Scores Alvo por Sprint

| Métrica | Baseline | Sprint 1 | Sprint 2 | Sprint 3 |
|---------|:--------:|:--------:|:--------:|:--------:|
| **Performance** | 93 | 93 | ~98 | **100** |
| **Accessibility** | 95 | **100** | 100 | 100 |
| **Best Practices** | 100 | 100 | 100 | 100 |
| **SEO** | 100 | 100 | 100 | 100 |

### Checklist Geral

| # | Task | Sprint | Status | Impacto |
|:-:|------|:------:|:------:|:-------:|
| 1 | Footer text-white/40 → /70 | S1 | ⬜ | A11y +2 |
| 2 | Footer text-white/30 → /70 | S1 | ⬜ | A11y +1 |
| 3 | Footer h4 → p | S1 | ⬜ | A11y +1 |
| 4 | Pricing btn text-white → text-gray-900 | S1 | ⬜ | A11y +2 |
| 5 | Pricing badge text-white → text-gray-900 | S1 | ⬜ | A11y +1 |
| 6 | Pricing CTA text-white → text-gray-900 | S1 | ⬜ | A11y +1 |
| 7 | Heading hierarchy h2 sr-only | S1 | ⬜ | A11y +1 |
| 8 | browserslist moderno | S2 | ⬜ | Perf +1 |
| 9 | removeConsole | S2 | ⬜ | Perf +0.5 |
| 10 | OneSignal delay 3s | S2 | ⬜ | Perf +1 |
| 11 | CSS split (keyframes → module) | S2 | ⬜ | Perf +2 |
| 12 | Preconnect cleanup | S3 | ⬜ | Perf +0.5 |
| 13 | PWA script → afterInteractive | S3 | ⬜ | Perf +0.5 |
| 14 | Tailwind v4 bracket cleanup | S3 | ⬜ | Code quality |
| 15 | Logo WebP compression | S3 | ⬜ | Perf +0.5 |

### Go/No-Go por Sprint

**Sprint 1 → Deploy quando:**
- `npx lighthouse https://iapersonal.app.br/pricing --only-categories=accessibility` → score 100
- `grep -rn "text-white/[234]0" src/components/landing/footer.tsx` → 0 results
- `grep -rn "<h4" src/components/landing/footer.tsx` → 0 results

**Sprint 2 → Deploy quando:**
- `npx lighthouse https://iapersonal.app.br/pricing --only-categories=performance` → score ≥ 98
- LCP < 1.2s no PageSpeed Insights
- `grep -rn "browserslist" package.json` → exists

**Sprint 3 → Deploy quando:**
- Todos os 4 scores = 100 no PageSpeed Insights Desktop
- `grep -rn "\[0\." src/components/landing/navbar.tsx` → 0 results

---

## 🚫 O que NÃO fazer (armadilhas do plan.md original)

1. **NÃO implementar Critical CSS inline** — Next.js 15 com static export não suporta manipulação de `<link>` hashes. O CSS é gerado pelo build e os hashes mudam. A lib `critical` é para SSR/SSG com server, não static export.

2. **NÃO remover preconnect da API se o dashboard usa** — Mover para layout do dashboard em sprint futuro, por agora apenas remover o `preconnect` e manter `dns-prefetch`.

3. **NÃO usar `@next/third-parties`** — O GA4 já está com `lazyOnload` e funciona perfeitamente. GoogleTagManager do @next/third-parties não é melhor para static export.

4. **NÃO gerar logo 70×56px** — O logo 96px serve displays @2x perfeitamente. Reduzir para 70px resultaria em logo pixelado em Retina.

5. **NÃO mudar tsconfig target** — `ES2017` é controlado pelo Next.js e Wrangler separadamente. Mudar pode quebrar builds.

---

## 📝 Notas

- **Cache de 3rd party** (Problema 7 do plan.md): Não controlamos cache headers do OneSignal/GA4. Isso é warning informativo do Lighthouse, não afeta o score.
- **Unused JS** (152 KiB): Maior parte é GA4 (60.4 KiB) e OneSignal (30.2 KiB) — ambos já com lazy loading. Os chunks 1st party (61.3 KiB) são do framework Next.js, não são facilmente eliminados sem análise profunda de tree-shaking.
- **O logo é o LCP element**: Confirmado. Mas como já tem `priority` + `preload`, o gargalo real é o CSS blocking, não a imagem.
