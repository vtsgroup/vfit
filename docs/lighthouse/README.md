# 🚀 Lighthouse Optimization — Guia Completo de Otimização

> **Projeto:** VFIT · **Stack:** Next.js 15 (App Router, static export) + Cloudflare Pages
> **Resultado final:** `/pricing` → **Performance 100 | A11y 100 | Best Practices 100 | SEO 100**
> **Jornada:** v5.6.4 (Perf 66) → v5.6.7 (93) → v5.7.2 (94) → v5.7.5 (100) → v5.7.6 (100, polished)
> **Última atualização:** 16/03/2026

---

## 📋 Índice

1. [Resumo da Jornada](#1-resumo-da-jornada)
2. [Otimização 1 — Acessibilidade (84→100)](#2-otimização-1--acessibilidade-84100)
3. [Otimização 2 — CSS Render-Blocking (maior impacto individual)](#3-otimização-2--css-render-blocking)
4. [Otimização 3 — Provider Split (~50-60KB gzip removidos)](#4-otimização-3--provider-split)
5. [Otimização 4 — Scripts de Terceiros](#5-otimização-4--scripts-de-terceiros)
6. [Otimização 5 — Dynamic Imports (DeferredComponents)](#6-otimização-5--dynamic-imports)
7. [Otimização 6 — Dead Code Removal](#7-otimização-6--dead-code-removal)
8. [Otimização 7 — Build Config (browserslist, tree-shaking)](#8-otimização-7--build-config)
9. [Otimização 8 — Imagens e Preload](#9-otimização-8--imagens-e-preload)
10. [Otimização 9 — Cache Headers](#10-otimização-9--cache-headers)
11. [Otimização 10 — SplashScreen movido para dashboard](#11-otimização-10--splashscreen)
12. [Checklist Reutilizável para Novas Páginas](#12-checklist-reutilizável)
13. [Erros Cometidos e Lições Aprendidas](#13-erros-e-lições)
14. [Comandos de Auditoria](#14-comandos-de-auditoria)
15. [Arquivos Modificados (Referência)](#15-arquivos-modificados)
16. [Plano de Ação — Todas as Páginas](#16-plano-de-ação--todas-as-páginas)

---

## 1. Resumo da Jornada

### Cronologia de Scores (PageSpeed Insights — Desktop, `/pricing`)

| Versão | Perf | A11y | BP | SEO | Mudança Principal |
|:------:|:----:|:----:|:--:|:---:|-------------------|
| v5.6.4 | **66** | 84 | 100 | 100 | Baseline (sem otimizações) |
| v5.6.7 | **93** | **100** | 100 | 100 | A11y fixes + OneSignal delay + browserslist |
| v5.6.9 | 93 | 100 | 100 | 100 | Mais contrast fixes + OneSignal 4s |
| v5.7.0 | **93** | 100 | 100 | 100 | CSS inline (TBT spike 150ms — revertido) |
| v5.7.1 | **87** | 100 | 100 | 100 | Smart inline ≤10KiB (pior — revertido) |
| v5.7.2 | **94** | 100 | 100 | 100 | CSS inline + JS link restore (fix definitivo) |
| v5.7.3 | **94** | 100 | 100 | 100 | SplashScreen movido para dashboard |
| v5.7.4 | **94+** | 100 | 100 | 100 | Provider split (framer-motion/auth/OneSignal fora de público) |
| v5.7.5 | **100** | 100 | 100 | 100 | Cookie LCP fix + GA4 @next/third-parties + CF Email Obfuscation OFF + browserslist 91 |
| v5.7.6 | **100** | 100 | 100 | 100 | CSS restore deferido (requestIdleCallback) + cache headers favicons 30d |

### Métricas Finais (v5.7.5)

| Métrica | Valor | Status | Alvo |
|---------|:-----:|:------:|:----:|
| FCP (First Contentful Paint) | 0.3s | ✅ | < 1.8s |
| LCP (Largest Contentful Paint) | 0.5s | ✅ | < 2.5s |
| TBT (Total Blocking Time) | 0ms | ✅ | < 200ms |
| CLS (Cumulative Layout Shift) | 0 | ✅ | < 0.1 |
| Speed Index | 0.5s | ✅ | < 3.4s |

---

## 2. Otimização 1 — Acessibilidade (84→100)

### Impacto: +16 pontos A11y

### 2.1 Contraste de Texto WCAG 2.1

**Problema:** Textos com opacidade baixa (`text-white/25`, `/30`, `/40`) sobre fundo escuro (`#050A12`) falhavam no contraste mínimo WCAG AA (4.5:1).

**Regra de ouro:**

| Contexto | Mínimo | Recomendado |
|----------|--------|-------------|
| Texto body (< 18px) | `text-white/40` (8.2:1) | `text-white/60` (12.2:1) |
| Texto grande (≥ 18px bold) | `text-white/20` (4.1:1) | `text-white/50` (10.2:1) |
| Links navegáveis | `text-white/50` (10.2:1) | `text-white/70` (14.3:1) |
| Ícones informativos | `text-white/30` (6.1:1) | `text-white/40` (8.2:1) |
| Ícones decorativos | `text-white/15` OK | `text-white/20` |
| Placeholders | `text-white/30` OK | — |

**Substituições aplicadas:**

```diff
# Footer
- text-white/40 → text-white/70
- text-white/30 → text-white/70
- text-white/25 → text-white/50

# CTA Section
- text-white/40 → text-white/60
- text-white/25 → text-white/50

# Cookie Consent
- text-zinc-500 → text-zinc-400
- text-zinc-600 → text-zinc-500
```

### 2.2 Texto sobre `bg-brand-primary` (#22C55E)

**CRÍTICO:** `text-white` sobre verde = 2.8:1 (FALHA WCAG!)

```diff
# Todos os botões CTA, badges, toggles ativos sobre verde:
- text-white → text-gray-900  (7.5:1 AAA ✅)
```

**Onde se aplica:**
- Botões CTA primários com fundo verde
- Badges "MAIS POPULAR", "PRO"
- Toggle ativo de tabs/chips
- FAQ accordion ícone ativo

### 2.3 Heading Hierarchy

```diff
# Footer: <h4> sem h2/h3 pai → viola hierarchy
- <h4>RECURSOS</h4>
+ <p className="font-semibold uppercase">RECURSOS</p>

# Pricing: cards h3 sem h2 acima
+ <h2 className="sr-only">Escolha seu plano</h2>  ← antes do grid
```

**Regras:**
1. Exatamente 1 `<h1>` por página
2. Headings sequenciais: h1 → h2 → h3 (nunca pular)
3. Footer: NUNCA `<h4>` — usar `<p>` com classes visuais
4. Se cards vêm direto após h1: `<h2 className="sr-only">` antes do grid

### 2.4 Elementos Interativos

```tsx
// ❌ Botão sem texto acessível
<button onClick={toggle}><ChevronDown /></button>

// ✅ Com aria-label
<button onClick={toggle} aria-label="Expandir detalhes"><ChevronDown /></button>
```

---

## 3. Otimização 2 — CSS Render-Blocking

### Impacto: +7 pontos Performance (87→94) · Maior lever individual

### O Problema

Next.js com `output: "export"` gera `<link rel="stylesheet" data-precedence="next"/>` no HTML. Esses links são **render-blocking** — o navegador para de pintar até baixar todo o CSS (~462 KiB).

> **Nota:** `optimizeCss` (critters) do Next.js **NÃO funciona** com `output: "export"`.

### Tentativas e Resultados

| Versão | Estratégia | Resultado | Problema |
|--------|-----------|-----------|----------|
| v5.7.0 | Inline ALL CSS + remove `<link>` | Perf 93, TBT **150ms** | React hydration mismatch → full re-render |
| v5.7.1 | Smart inline (≤10KiB) | Perf **87** | CSS >10KiB mantido como `<link>` = render-blocking |
| **v5.7.2** | **Inline ALL + JS link restore** | **Perf 94** | ✅ **Solução definitiva** |

### Solução Final (v5.7.2) — `scripts/inline-css.mjs`

**Conceito:**
1. Inline TODO o CSS como `<style data-inline-css>` → elimina render-blocking
2. Remove todos os `<link rel="stylesheet">` do HTML
3. Adiciona `<script>` que recria os `<link>` via `document.createElement()` → **links criados por JS NÃO são render-blocking** (spec do Chrome/Lighthouse)
4. React encontra os `<link data-precedence>` no DOM → sem hydration mismatch → sem TBT spike

**Por que funciona:**
- `<link>` no HTML = **RENDER BLOCKING** (parser HTML bloqueia)
- `document.createElement('link')` = **NON-blocking** (API JS)
- React Float encontra `<link data-precedence>` no DOM = sem mismatch
- Melhor dos dois mundos: render instantâneo + React feliz

**Script integrado ao build:**
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "postbuild": "node scripts/inline-css.mjs"
  }
}
```

**Output do script:**
```
⚡ Full CSS Inline + Hydration-Safe Link Restore (v5.7.2)...
  📦 CSS files: 2 (462.7 KiB total)
  📄 HTML files: 74
  ✅ Links inlined + restored: 148
  🎯 Strategy: <style> inline (no render-blocking) + JS link restore (React-safe)
```

### Como Reutilizar

O script é genérico para qualquer projeto Next.js com `output: "export"`:

1. Copiar `scripts/inline-css.mjs` para o projeto
2. Adicionar `"postbuild": "node scripts/inline-css.mjs"` ao `package.json`
3. Funciona automaticamente em cada `npm run build`

---

## 4. Otimização 3 — Provider Split

### Impacto: ~50-60KB gzip removidos das páginas públicas

### O Problema

O `Providers` wrapper no root layout carregava bibliotecas pesadas para TODAS as rotas:

| Biblioteca | Tamanho gzip (est.) | Usada em `/pricing`? |
|------------|:-------------------:|:--------------------:|
| framer-motion (MotionConfig) | ~30-45 KB | ❌ |
| zustand + auth-store + api-client | ~8-10 KB | ❌ |
| OneSignal SDK | ~2-3 KB | ❌ |
| Sentry + debug-logger | ~3-5 KB | ❌ |
| CacheEventListener + QueryWarmup | ~1-2 KB | ❌ |
| PwaInstallProvider (767 linhas) | ~4-6 KB | ❌ |
| **Total desnecessário** | **~48-71 KB** | ❌ |

**Agravante:** O `AuthProvider` **bloqueava FCP/LCP** com um spinner de loading enquanto verificava sessão — em TODAS as páginas, incluindo públicas!

### A Solução

Separar providers em dois níveis:

```
ANTES:
RootLayout → Providers(TUDO) → Todas as rotas

DEPOIS:
RootLayout → Providers(leve: Query + Theme) → Todas as rotas
  └── DashboardLayout → DashboardProviders(pesado) → Só /dashboard/*
```

**Root `Providers`** (carregado em TODAS as rotas):
```tsx
// src/components/providers/index.tsx
export function Providers({ children }) {
  return (
    <QueryProvider>        {/* react-query — usado em /p, /profile, /auth */}
      <ThemeProvider>       {/* dark mode — 30 bytes, useEffect only */}
        {children}
        <CookieConsentBanner />  {/* dynamic import, ssr: false */}
      </ThemeProvider>
    </QueryProvider>
  )
}
```

**Dashboard `DashboardProviders`** (carregado APENAS em `/dashboard/*`):
```tsx
// src/components/providers/dashboard-providers.tsx
export function DashboardProviders({ children }) {
  return (
    <AuthProvider>           {/* zustand hydration + session check */}
      <OneSignalProvider>    {/* push notifications SDK */}
        <MotionConfig reducedMotion="user">  {/* framer-motion */}
          <CacheEventListener />
          <QueryWarmup />
          {children}
        </MotionConfig>
      </OneSignalProvider>
    </AuthProvider>
  )
}
```

**Dashboard layout atualizado:**
```tsx
// src/app/dashboard/layout.tsx
export default function DashboardRootLayout({ children }) {
  return (
    <DashboardProviders>
      <PwaInstallProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </PwaInstallProvider>
    </DashboardProviders>
  )
}
```

### Resultado Build

```
/pricing    → First Load JS: 129 KB (shared: 102 KB)  ← LEVE
/dashboard  → First Load JS: 399 KB (shared: 102 KB + providers pesados)
```

### Como Reutilizar

**Princípio:** NUNCA coloque no root layout providers que só uma parte do app precisa.

**Diagnóstico:**
1. Liste todos os providers no root layout
2. Para cada um, pergunte: "Esta biblioteca é usada na página mais simples do site?"
3. Se NÃO → mova para o layout da seção que precisa

**Sinais de alerta:**
- `framer-motion` no root layout (se landing não usa animações)
- Auth provider que bloqueia render com loading state
- SDKs de terceiros (OneSignal, Intercom, etc.) que só servem para logados
- Cache warmup / prefetch que só faz sentido no dashboard

---

## 5. Otimização 4 — Scripts de Terceiros

### Impacto: ~5-8 pontos Performance

| Script | Estratégia | Config |
|--------|-----------|--------|
| **GA4** | `strategy="lazyOnload"` | Carrega APÓS page load |
| **OneSignal SDK** | `setTimeout(4000)` no useEffect | 4s delay |
| **PWA capture** | `strategy="lazyOnload"` | Carrega idle |
| **Turnstile** | Sob demanda no formulário | Quando necessário |

```tsx
// GA4 — lazyOnload (zero impacto no LCP/CLS)
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XGXZ4R6JXH"
  strategy="lazyOnload"
/>

// PWA beforeinstallprompt — lazyOnload
<Script id="pwa-install-capture" strategy="lazyOnload">
  {`window.addEventListener('beforeinstallprompt', ...)`}
</Script>
```

### Regra Geral de Script Strategies

| Criticidade | Strategy | Exemplos |
|-------------|----------|----------|
| Crítico (afeta LCP) | Inline no `<head>` | Dark mode force, font preload |
| Importante (funcional) | `afterInteractive` | Auth redirect, feature flags |
| Não-crítico (analytics) | `lazyOnload` | GA4, pixel FB, OneSignal |
| Sob demanda | Import dinâmico | Turnstile, Stripe.js |

---

## 6. Otimização 5 — Dynamic Imports (DeferredComponents)

### Impacto: ~800 linhas de JS removidas do bundle inicial

**Problema:** Componentes que renderizam `null` na maioria dos cenários (banner demo, loading bar, debug panel) estavam no bundle principal.

**Solução:** Wrapper `'use client'` com `next/dynamic` + `ssr: false`:

```tsx
// src/components/layout/deferred-components.tsx
'use client'
import dynamic from 'next/dynamic'

const DemoModeBanner = dynamic(
  () => import('@/components/ui/demo-mode-banner').then(m => ({ default: m.DemoModeBanner })),
  { ssr: false }
)
const LoadingBar = dynamic(...)       // framer-motion — lazy
const ReferralCapture = dynamic(...)  // retorna null, lê URL params
const PwaDebugPanel = dynamic(...)    // 459 linhas, só com ?pwa-debug=1
const ServiceWorkerRegistration = dynamic(...)  // retorna null, delayed
const OfflineIndicator = dynamic(...)  // null quando online

export function DeferredComponents() {
  return (
    <>
      <DemoModeBanner />
      <LoadingBar />
      <ReferralCapture />
      <PwaDebugPanel />
      <ServiceWorkerRegistration />
      <OfflineIndicator />
    </>
  )
}
```

### Critérios para Dynamic Import

Candidatos ideais para `dynamic(() => import(...), { ssr: false })`:

| Critério | Exemplo |
|----------|---------|
| Renderiza `null` na maioria dos casos | DemoModeBanner, OfflineIndicator |
| Só visível com interação | Debug panels, overlays, modais |
| Depende de APIs do browser | ServiceWorker, geolocation |
| Importa bibliotecas pesadas | Componentes com framer-motion, charts |
| Nunca visível no first paint | Banners com delay, toasts |

---

## 7. Otimização 6 — Dead Code Removal

### Impacto: ~236 linhas + framer-motion AnimatePresence removidos

**Descoberta:** `ToastProvider` de `modern-toast.tsx` (236 linhas) importado no root layout mas **NUNCA usado** por nenhum componente. Todos os toasts usavam `@/stores/app-store` (Zustand).

**Diagnóstico:**
```bash
# Buscar quem usa o export
grep -rn "ToastProvider\|useToast\|modern-toast" src/ --include="*.tsx" --include="*.ts"
# → Só encontrado no próprio arquivo e no layout.tsx (import)
```

**Ação:** Removido import do root layout. Arquivo mantido (pode ser útil no futuro), mas não entra mais no bundle.

### Como Encontrar Dead Code

```bash
# Exports não referenciados
grep -rn "export.*function\|export.*const" src/components/ui/ | while read line; do
  name=$(echo "$line" | grep -oP '(?:function|const)\s+\K\w+')
  count=$(grep -rn "$name" src/ --include="*.tsx" --include="*.ts" | wc -l)
  if [ "$count" -le 2 ]; then echo "⚠️ Possível dead code: $name ($count refs)"; fi
done
```

---

## 8. Otimização 7 — Build Config

### 8.1 browserslist Moderno

```json
// package.json
{
  "browserslist": [
    "chrome >= 90",
    "firefox >= 90",
    "safari >= 15",
    "edge >= 90"
  ]
}
```

**Impacto:** Elimina ~11.7 KiB de polyfills (Array.at, Object.hasOwn, structuredClone).

### 8.2 browsersListForSwc

```ts
// next.config.ts
experimental: {
  browsersListForSwc: true,  // Usa browserslist para compilação SWC
}
```

### 8.3 optimizePackageImports

```ts
// next.config.ts
experimental: {
  optimizePackageImports: [
    'recharts',
    'framer-motion',
    'date-fns',
    '@radix-ui/react-dialog',
    '@radix-ui/react-popover',
    '@radix-ui/react-select',
    '@radix-ui/react-tabs',
  ],
}
```

### 8.4 removeConsole

```ts
// next.config.ts
compiler: {
  removeConsole: process.env.NODE_ENV === 'production'
    ? { exclude: ['error', 'warn'] }
    : false,
}
```

### 8.5 tsconfig.json target

```json
// ES2020 alinha com browserslist moderno — elimina transforms desnecessários
{
  "compilerOptions": {
    "target": "ES2020"
  }
}
```

---

## 9. Otimização 8 — Imagens e Preload

### Preload da Imagem LCP

```tsx
// src/app/layout.tsx — <head>
<link rel="preload" href="/images/logo-transparent-96.webp" as="image" type="image/webp" />
```

**Ordem no `<head>`:**
1. `<link rel="preload">` (recurso LCP) — PRIMEIRO
2. `<link rel="dns-prefetch">` — DEPOIS

### Logo Otimizado

```
logo-transparent-400.webp → logo-transparent-140.webp
  19.5 KiB → 4.3 KiB (78% menor)
  Tamanho: 140×112 (exatamente 2x do renderizado 70×56 para Retina)
```

### Regras de Imagem

| Regra | Detalhe |
|-------|---------|
| Formato | WebP preferido (PNG para ícones complexos) |
| Imagem LCP | `priority` + `<link rel="preload">` |
| Below-the-fold | `loading="lazy"` (padrão Next/Image) |
| Tamanho | Máximo 2x do renderizado (Retina) |
| `sizes` | Sempre definir quando não é full-width |

### Preconnect vs DNS-Prefetch

```
preconnect   → APENAS recursos dos primeiros 3s (fonts, CDN crítico)
dns-prefetch → APIs e CDNs usados após interação (backend, OneSignal, GA)
```

```tsx
// ✅ Correto para páginas públicas (API não é chamada no load)
<link rel="dns-prefetch" href="https://api.iapersonal.app.br" />

// ❌ Desperdiça conexão TCP/TLS
<link rel="preconnect" href="https://api.iapersonal.app.br" />
```

---

## 10. Otimização 9 — Cache Headers

### `public/_headers` (Cloudflare Pages)

```yaml
# Next.js static chunks — immutable (hash no filename garante cache-busting)
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

# Ícones PWA — long cache
/icons/*
  Cache-Control: public, max-age=31536000, immutable

# Imagens — long cache
/images/*
  Cache-Control: public, max-age=31536000, immutable

# Favicons — 30 dias (versionados por ?v= no layout.tsx)
/favicon.ico
  Cache-Control: public, max-age=2592000
/favicons/*
  Cache-Control: public, max-age=2592000
/apple-touch-icon.png
  Cache-Control: public, max-age=2592000

# Service Worker — NUNCA cachear
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate

# Manifest — no cache (PWA updates)
/manifest.json
  Cache-Control: no-cache
```

> **v5.7.6:** Favicons mudaram de `no-cache` → `max-age=2592000` (30 dias).
> São versionados por `?v=${APP_VERSION}` no `layout.tsx`, então cache-busting é automático.
> Isso resolve o "Use efficient cache lifetimes" do Lighthouse (~4 KiB savings).

---

## 10.1 Otimização 10 — CSS Restore Deferido (v5.7.6)

### Impacto: Remove CSS da dependency tree do Lighthouse (unscored, mas limpa o relatório)

**Problema:** O script de restore CSS criava `<link>` tags imediatamente via IIFE, fazendo o browser
baixar CSS antes de idle. Lighthouse mostrava 2 CSS files na "Network dependency tree" (~57 KiB, 325ms).

**Solução:** Usar `requestIdleCallback` com timeout de 2s (fallback `setTimeout(50)` para Safari):

```javascript
// ANTES (v5.7.2) — execução imediata
(()=>{[entries].forEach(([h,p])=>{
  const l=document.createElement("link");
  l.rel="stylesheet";l.href=h;l.dataset.precedence=p;
  document.head.appendChild(l)
})})()

// DEPOIS (v5.7.6) — deferido para idle time
(()=>{
  function r(){[entries].forEach(([h,p])=>{
    const l=document.createElement("link");
    l.rel="stylesheet";l.href=h;l.dataset.precedence=p;
    document.head.appendChild(l)
  })};
  typeof requestIdleCallback!=="undefined"
    ? requestIdleCallback(r,{timeout:2000})
    : setTimeout(r,50)
})()
```

**Por que funciona:**
- `requestIdleCallback` adia a execução para quando o main thread estiver ocioso
- Lighthouse mede apenas o critical path → CSS não aparece mais na dependency tree
- O inline `<style data-inline-css>` já cobre toda a renderização (sem FOUC)
- Os `<link>` restaurados servem apenas para client-side navigation
- Timeout de 2s garante que os links são restaurados antes de interação do usuário
- Fallback `setTimeout(50)` para Safari (sem suporte a rIC)

**Resultado:** Dependency tree limpa — apenas o HTML inicial, sem CSS encadeado.

---

## 11. Otimização 10 — SplashScreen

### Impacto: ~1 ponto Performance (LCP)

**Problema:** `SplashScreen` no root layout era o LCP element para o PageSpeed bot (que não tem `sessionStorage`). O bot sempre via o splash antes do conteúdo real.

**Solução:** Mover `<SplashScreen />` do root layout para `dashboard/layout.tsx` — apenas usuários logados veem splash.

```diff
# src/app/layout.tsx
- <SplashScreen />

# src/app/dashboard/layout.tsx
+ <SplashScreen />
```

---

## 12. Checklist Reutilizável

### Para cada nova página pública, verificar:

```
□ ACESSIBILIDADE
  □ Contraste texto ≥ 4.5:1 (AA) para body, ≥ 3.0:1 para títulos ≥18px bold
  □ Heading hierarchy sequencial (h1 → h2 → h3)
  □ Botões com aria-label ou texto visível
  □ Imagens com alt descritivo
  □ Links com texto descritivo
  □ Sem text-white sobre bg-brand-primary (usar text-gray-900)
  □ Sem text-white/XX com opacidade < 40 para texto informativo

□ PERFORMANCE
  □ A página NÃO carrega providers pesados (auth, framer-motion, SDKs)
  □ Scripts 3rd-party com lazyOnload
  □ Imagem LCP com priority + preload no <head>
  □ CSS inline ativo via postbuild script (npm run build, NUNCA npx next build)
  □ CSS restore deferido via requestIdleCallback (v5.7.6)
  □ Componentes below-the-fold não bloqueiam first paint
  □ Sem providers que bloqueiam render (loading spinners)
  □ Cache headers corretos (favicons 30d, static 1y immutable, SW no-cache)
  □ Build sempre via `npm run build` (para postbuild rodar inline-css.mjs)

□ SEO
  □ <title> + <meta description> definidos
  □ Open Graph tags (título, descrição, imagem 1200×630)
  □ Canonical URL definido
  □ robots: index, follow (para públicas)

□ BEST PRACTICES
  □ HTTPS (Cloudflare auto)
  □ Sem mixed content
  □ CSP headers em _headers

□ TAILWIND v4
  □ Sem bg-gradient-to-* (usar bg-linear-to-*)
  □ Sem bracket notation de opacidade (white/[0.06] → white/6)
  □ Sem [var(--x)] (usar (--x))
  □ Sem flex-shrink-0 (usar shrink-0)
```

### ⚡ Stack de Performance Completa (v5.7.6)

A combinação de técnicas que garante **Performance 100** em qualquer página estática:

```
┌─ BUILD TIME ─────────────────────────────────────────────────┐
│ 1. next build (output: "export")                             │
│ 2. postbuild: inline-css.mjs                                 │
│    ├─ Remove <link rel="stylesheet"> (render-blocking)       │
│    ├─ Inline ALL CSS as <style data-inline-css>              │
│    └─ Add <script> with requestIdleCallback (non-blocking)   │
└──────────────────────────────────────────────────────────────┘

┌─ HTML STRUCTURE ─────────────────────────────────────────────┐
│ <head>                                                       │
│   ├─ <link preload font> (Inter, woff2)                      │
│   ├─ <link preload image> (LCP image)                        │
│   ├─ <link dns-prefetch> (API, GTM, OneSignal, Turnstile)    │
│   ├─ <script> dark mode (inline, sync)                       │
│   ├─ <style data-inline-css> ALL CSS (~464 KiB)              │
│   └─ <script data-css-hydration> rIC restore (deferred)      │
│ <body>                                                       │
│   ├─ JSON-LD schemas                                         │
│   ├─ Providers LEVE (Query + Theme + Cookie)                 │
│   ├─ Page content (SSR)                                      │
│   └─ GA4 (lazyOnload) + OneSignal (4s delay)                 │
└──────────────────────────────────────────────────────────────┘

┌─ CACHE STRATEGY ─────────────────────────────────────────────┐
│ HTML:           max-age=0, must-revalidate (fresh on every)  │
│ _next/static/*: max-age=1y, immutable (hash = cache-bust)    │
│ /icons/*:       max-age=1y, immutable                        │
│ /images/*:      max-age=1y, immutable                        │
│ /favicons/*:    max-age=30d (versionado por ?v=)             │
│ /sw.js:         no-cache, must-revalidate                    │
│ /manifest.json: no-cache (PWA updates)                       │
└──────────────────────────────────────────────────────────────┘

┌─ PROVIDER ARCHITECTURE ─────────────────────────────────────┐
│ Root Layout:      QueryProvider + ThemeProvider + Cookie      │
│ Dashboard Layout: AuthProvider + OneSignal + MotionConfig     │
│ Public Pages:     ZERO heavy providers                       │
└──────────────────────────────────────────────────────────────┘
```

### 🔴 Erros Fatais a Evitar

| Erro | Impacto | Correção |
|------|---------|----------|
| `npx next build` em vez de `npm run build` | CSS fica render-blocking (postbuild não roda) | SEMPRE `npm run build` |
| AuthProvider no root layout | FCP/LCP bloqueados em páginas públicas | Mover para dashboard/layout |
| Remover `<link>` sem restaurar via JS | TBT +150ms (hydration mismatch) | Usar requestIdleCallback restore |
| text-white sobre bg-brand-primary | Contraste 2.8:1 (WCAG FAIL) | Usar text-gray-900 |
| Favicons com no-cache | "Cache lifetimes" warning | max-age=30d + ?v= para bust |

---

## 13. Erros Cometidos e Lições Aprendidas

### ❌ v5.7.0 — Inline ALL CSS + Remove Links

**O que fez:** Inlinou todo o CSS como `<style>` e removeu os `<link>` completamente.

**Resultado:** TBT subiu para **150ms** (de ~30ms).

**Por quê:** React espera encontrar `<link data-precedence="next"/>` no DOM durante hydration. Sem ele → React re-renderiza tudo → TBT spike.

**Lição:** Nunca remover elementos que React espera no DOM. Recriá-los via JS é a solução.

---

### ❌ v5.7.1 — Smart Inline (≤10KiB Only)

**O que fez:** Inline apenas CSS pequenos (≤10KiB), mantém CSS grandes como `<link>`.

**Resultado:** Perf **caiu** para **87** (de 93).

**Por quê:** O CSS grande (~460KiB) mantido como `<link>` continua render-blocking. O penalty de blocking (150ms) é pior que o TBT spike (100ms).

**Lição:** A eliminação de render-blocking é mais valiosa que evitar TBT. A solução correta é eliminar blocking SEM causar mismatch.

---

### ❌ AuthProvider no Root Layout

**O que fez:** `AuthProvider` montado no root layout para todas as rotas. Mostrava spinner até sessão ser verificada.

**Resultado:** FCP/LCP bloqueados em TODAS as páginas (incluindo `/pricing` pública).

**Por quê:** O PageSpeed bot não está logado → AuthProvider faz `GET /auth/me` → falha → mostra spinner → só depois mostra conteúdo.

**Lição:** Providers que fazem fetch ou bloqueiam render devem ficar APENAS nas seções que os precisam.

---

### ✅ Regra de Ouro

> **Se uma otimização causa um efeito colateral em outra métrica, a solução não é reverter — é encontrar uma forma que resolva AMBOS os problemas.**
>
> CSS inline causava TBT → A solução não é tirar o inline (volta blocking), é recriar links via JS (resolve ambos).
> CSS restore imediato mostrava na dependency tree → A solução é usar requestIdleCallback (deferido + sem mismatch).
> Favicons sem cache causava warning → A solução é cache 30d + ?v= para bust automático.

---

## 14. Comandos de Auditoria

### Pré-Deploy

```bash
# 1. Contraste — zero violações em landing
grep -rn "text-white/[12][0-9]\b" src/components/landing/ | grep -v "//\|hover:"

# 2. Heading hierarchy — zero h4 no footer
grep -rn "<h4" src/components/landing/footer.tsx

# 3. Bracket notation legada
grep -rn "white/\[0\." src/components/landing/

# 4. text-white sobre brand-primary
grep -rn "bg-brand-primary.*text-white" src/app/\(public\)/ src/components/landing/

# 5. Gradientes legados
grep -rn "bg-gradient-to-" src/

# 6. Variáveis CSS legadas
grep -rn "\-\[var(--" src/components/

# 7. Providers pesados no root layout (NÃO deve ter)
grep -n "MotionConfig\|AuthProvider\|OneSignalProvider" src/components/providers/index.tsx
```

### PageSpeed Online

```bash
# Desktop
open "https://pagespeed.web.dev/analysis?url=https://iapersonal.app.br/pricing&form_factor=desktop"

# Mobile
open "https://pagespeed.web.dev/analysis?url=https://iapersonal.app.br/pricing&form_factor=mobile"
```

### Bundle Analyzer

```bash
ANALYZE=true npm run build
```

---

## 15. Arquivos Modificados (Referência)

### Configuração

| Arquivo | O que mudou |
|---------|-------------|
| `next.config.ts` | `browsersListForSwc`, `optimizePackageImports`, `removeConsole`, `@next/bundle-analyzer` |
| `package.json` | `browserslist`, `postbuild` script, `@next/bundle-analyzer` dep |
| `tsconfig.json` | `target: ES2020` |
| `public/_headers` | Cache headers otimizados para static assets |

### Scripts

| Arquivo | O que faz |
|---------|-----------|
| `scripts/inline-css.mjs` | Post-build: inline CSS + JS link restore (elimina render-blocking) |

### Providers

| Arquivo | O que mudou |
|---------|-------------|
| `src/components/providers/index.tsx` | Removido: AuthProvider, OneSignalProvider, MotionConfig, CacheEventListener, QueryWarmup |
| `src/components/providers/dashboard-providers.tsx` | **NOVO** — providers pesados para /dashboard/ |

### Layouts

| Arquivo | O que mudou |
|---------|-------------|
| `src/app/layout.tsx` | Removido: PwaInstallProvider, SplashScreen, ToastProvider, Suspense. Adicionado: DeferredComponents |
| `src/app/dashboard/layout.tsx` | Adicionado: DashboardProviders, PwaInstallProvider, SplashScreen |
| `src/app/(auth)/layout.tsx` | Adicionado: `<Suspense>` boundary para useSearchParams |
| `src/app/(public)/layout.tsx` | Sem mudanças (já era limpo) |

### Componentes

| Arquivo | O que mudou |
|---------|-------------|
| `src/components/layout/deferred-components.tsx` | **NOVO** — 6 dynamic imports com ssr:false |
| `src/components/landing/footer.tsx` | Contraste corrigido, `<h4>` → `<p>` |
| `src/components/ui/cookie-consent.tsx` | Contraste corrigido |
| `src/components/pricing/*.tsx` | `text-white` → `text-gray-900` sobre verde |

---

### v5.7.5 — Lighthouse 100

| Arquivo | O que mudou |
|---------|-------------|
| `src/components/ui/cookie-consent.tsx` | `requestIdleCallback` + 2.5s delay — banner pós-LCP |
| `src/app/layout.tsx` | GA4 via `<GoogleAnalytics>` de `@next/third-parties/google` |
| `package.json` | browserslist: chrome/edge ≥ 91, dep `@next/third-parties` |
| Cloudflare (API) | `email_obfuscation: off`, `server_side_exclude: off` |

---

## 16. Plano de Ação — Todas as Páginas

> **Doc completo:** [`docs/lighthouse/PLANO-ACAO-TODAS-PAGINAS.md`](PLANO-ACAO-TODAS-PAGINAS.md)

Com `/pricing` em **100/100/100/100**, a infraestrutura está pronta.
O plano detalha:

- **74 páginas** classificadas em 4 tiers (público, auth, dashboard, especial)
- **Checklist universal** reutilizável para qualquer página nova
- **Problemas conhecidos** por categoria (LCP, TBT, CLS, A11y) com soluções
- **Script de auditoria em massa** via PageSpeed API
- **Tracking table** para registrar scores conforme cada página é auditada
- **6 sprints** com estimativa de tempo e ordem de prioridade

---

## 📖 Docs Relacionados

| Doc | Conteúdo |
|-----|----------|
| [`PLANO-ACAO-TODAS-PAGINAS.md`](PLANO-ACAO-TODAS-PAGINAS.md) | Plano de ação para 100 em todas as 74 páginas |
| `docs/DESIGN-SYSTEM-COLORS.md` | Paleta de cores com contrastes WCAG calculados |
| `docs/CHANGELOG.md` | Histórico completo de cada versão (v5.6.4 → v5.7.5) |
| `.github/copilot-instructions.md` | Regras Tailwind v4 (12-15) |

---

> **Mantra:** O Lighthouse não é um número — é um checklist de boas práticas. Cada ponto perdido tem uma causa raiz específica e uma solução documentada. Use este guia para não repetir erros e aplicar as mesmas técnicas em qualquer página nova.
