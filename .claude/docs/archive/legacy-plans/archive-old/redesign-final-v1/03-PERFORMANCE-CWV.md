# ⚡ Core Web Vitals — Plano de Performance

> Meta: Todas as páginas com score ≥ 90 no Lighthouse, LCP < 1.2s

---

## Estado Atual (Estimativa)

| Métrica | Valor Atual | Meta | Gap |
|---------|:-----------:|:----:|:---:|
| **LCP** | ~2.5s | < 1.2s | 🔴 -1.3s |
| **INP** | ~150ms | < 100ms | 🟡 -50ms |
| **CLS** | ~0.15 | < 0.05 | 🟡 -0.10 |
| **FCP** | ~1.2s | < 0.8s | 🟡 -0.4s |
| **TTFB** | ~100ms | < 200ms | ✅ OK |
| **TBT** | ~300ms | < 150ms | 🔴 -150ms |
| **JS Bundle** | ~200KB | < 150KB | 🟡 -50KB |

---

## Problemas Identificados & Soluções

### 🔴 1. LCP — Video Hero carrega 10MB+ (crítico)

**Problema:** O hero usa vídeo do Pexels (~10MB) com `preload="auto"`, que é o LCP element.

**Solução:**
```
1. Usar poster image (WebP, 100KB) como LCP → <video poster="/images/hero-poster.webp">
2. Mudar preload="auto" → preload="none"
3. Lazy-load o video após 2s idle (requestIdleCallback)
4. Adicionar <link rel="preload" href="/images/hero-poster.webp" as="image">
5. Hero poster deve ter width/height explícitos
```

**Impacto:** LCP de ~2.5s → ~0.8s

### 🟡 2. CLS — Skeletons com dimensões erradas

**Problema:** Alguns skeletons não correspondem ao tamanho real do conteúdo.

**Solução:**
```
1. Auditar cada skeleton vs conteúdo real
2. Fixar dimensões com min-height/min-width
3. Reservar espaço para imagens com aspect-ratio
4. Font loading: já usa display:swap ✅
```

**Impacto:** CLS de ~0.15 → ~0.03

### 🟡 3. INP — Event handlers pesados

**Problema:** Alguns click handlers (especialmente em listas de alunos/treinos) fazem queries síncronas.

**Solução:**
```
1. Usar startTransition para navegações
2. Debounce em search inputs (300ms)
3. Virtualizar listas longas (>50 items)
4. useDeferredValue para search results
```

**Impacto:** INP de ~150ms → ~80ms

### 🔴 4. TBT — Bundle JavaScript grande

**Problema:** Initial bundle inclui recharts, xlsx, papaparse, etc.

**Solução:**
```
1. Dynamic imports para:
   - recharts → dynamic(() => import('recharts'))
   - xlsx → only in export handler
   - papaparse → only in import handler
   - framer-motion → dynamic onde necessário
   - qrcode → only in QR components
2. Route-based code splitting (já usa App Router ✅)
3. Tree shake lucide-react (importar apenas ícones usados)
```

**Impacto:** TBT de ~300ms → ~120ms, Bundle de ~200KB → ~130KB

### 🟡 5. Imagens não otimizadas

**Problema:** `images.unoptimized: true` no next.config (necessário para static export).

**Solução:**
```
1. Converter todas as imagens para WebP no build time
2. Usar sharp para gerar blur placeholders
3. Implementar componente OptimizedImage com:
   - blur placeholder inline (base64)
   - width/height explícitos
   - loading="lazy" por padrão
   - priority prop para LCP images
   - srcset com múltiplos tamanhos
4. Servir via R2 CDN com cache headers
```

---

## Otimizações Já Implementadas ✅

- [x] `next/font` com `display: swap` (Inter)
- [x] Static export (CF Pages edge-cached, TTFB ~100ms)
- [x] Service Worker com cache-first para assets
- [x] `<meta name="viewport">` correto
- [x] Safe area insets para notch devices
- [x] Anti-aliased text
- [x] Skeleton system existente (878 linhas)
- [x] Shimmer animation CSS

---

## Checklist de Implementação

### Prioridade 1 — LCP (maior impacto)
- [ ] Criar hero poster WebP (1920×1080, < 100KB)
- [ ] Criar hero poster mobile WebP (640×960, < 50KB)
- [ ] Mudar `<video preload="auto">` → `preload="none"` + poster
- [ ] `<link rel="preload">` para hero poster no `<head>`
- [ ] LazyVideo component (carrega após idle)

### Prioridade 2 — Bundle Size
- [ ] Dynamic import recharts
- [ ] Dynamic import xlsx
- [ ] Dynamic import papaparse  
- [ ] Dynamic import qrcode
- [ ] Auditar importações de lucide-react (tree shake)
- [ ] `next build --analyze` para verificar bundle

### Prioridade 3 — CLS
- [ ] Auditar todos os skeletons vs layout real
- [ ] Adicionar `aspect-ratio` em containers de imagem
- [ ] Reservar altura fixa para font loading
- [ ] Testar CLS com Lighthouse CI

### Prioridade 4 — INP
- [ ] `startTransition` em navegações de lista
- [ ] Debounce em search inputs
- [ ] `useDeferredValue` para search results
- [ ] Virtualizar listas > 50 items

### Prioridade 5 — Assets
- [ ] Converter imagens existentes para WebP
- [ ] Gerar blur placeholders (base64)
- [ ] `OptimizedImage` component
- [ ] Cache headers para imagens no `_headers`

---

## Headers de Cache (atualizar `public/_headers`)

```
# Imagens — 1 ano (imutáveis com hash)
/images/*
  Cache-Control: public, max-age=31536000, immutable

/og/*
  Cache-Control: public, max-age=604800

/favicons/*
  Cache-Control: public, max-age=604800

# Fonts (já cacheados pelo next/font)
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## Ferramentas de Medição

| Ferramenta | URL | Uso |
|-----------|-----|-----|
| Lighthouse | Chrome DevTools | Score geral |
| PageSpeed Insights | web.dev/measure | Score real (CrUX) |
| WebPageTest | webpagetest.org | Waterfall detalhado |
| Bundle Analyzer | `ANALYZE=true npm run build` | Bundle size |
| CWV Extension | Chrome Extension | Real-time metrics |

---

## Métricas Alvo Pós-Redesign

| Métrica | Alvo | Score |
|---------|------|:-----:|
| LCP | < 1.0s | ✅ 100 |
| INP | < 80ms | ✅ 100 |
| CLS | < 0.03 | ✅ 100 |
| FCP | < 0.6s | ✅ 100 |
| TBT | < 120ms | ✅ 98+ |
| Performance Score | > 95 | 🎯 |
| Accessibility | > 95 | 🎯 |
| Best Practices | > 95 | 🎯 |
| SEO | > 95 | 🎯 |
