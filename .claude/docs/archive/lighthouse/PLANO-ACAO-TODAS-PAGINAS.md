# 🎯 Plano de Ação — Lighthouse 100 em Todas as Páginas

> **Baseline:** `/pricing` atingiu **100/100/100/100** em v5.7.5 (16/03/2026)
> **Objetivo:** Replicar o score 100 em TODAS as 74 páginas do projeto
> **Estratégia:** As otimizações de infraestrutura (v5.6.4→v5.7.5) já beneficiam TODAS as rotas.
> Restam ajustes página-a-página focados em A11y e conteúdo.

---

## 📋 Índice

1. [Otimizações Globais Já Aplicadas](#1-otimizações-globais-já-aplicadas)
2. [Classificação de Páginas por Risco](#2-classificação-de-páginas-por-risco)
3. [Tier 1 — Páginas Públicas (SEO-critical)](#3-tier-1--páginas-públicas)
4. [Tier 2 — Páginas de Auth](#4-tier-2--páginas-de-auth)
5. [Tier 3 — Dashboard (app autenticado)](#5-tier-3--dashboard)
6. [Tier 4 — Páginas Especiais](#6-tier-4--páginas-especiais)
7. [Checklist Universal por Página](#7-checklist-universal-por-página)
8. [Problemas Conhecidos por Categoria](#8-problemas-conhecidos-por-categoria)
9. [Comandos de Auditoria em Massa](#9-comandos-de-auditoria-em-massa)
10. [Critérios de Sucesso](#10-critérios-de-sucesso)

---

## 1. Otimizações Globais Já Aplicadas

Estas otimizações impactam **TODAS** as rotas automaticamente — não precisam ser repetidas:

| Otimização | Versão | Impacto | Arquivo |
|-----------|--------|---------|---------|
| CSS inline + JS link restore | v5.7.2 | Elimina render-blocking CSS | `scripts/inline-css.mjs` |
| Provider split (root leve) | v5.7.4 | -50-60KB gzip em páginas públicas | `providers/index.tsx` |
| Cookie banner pós-LCP | v5.7.5 | Cookie não é mais LCP element | `cookie-consent.tsx` |
| GA4 @next/third-parties | v5.7.5 | Reduz TBT de GA4 | `layout.tsx` |
| CF Email Obfuscation OFF | v5.7.5 | Remove email-decode.min.js (580ms) | Cloudflare dashboard |
| CF Server-Side Excludes OFF | v5.7.5 | Remove injeção de HTML/scripts | Cloudflare dashboard |
| Browserslist chrome/edge ≥ 91 | v5.7.5 | Elimina polyfills legados | `package.json` |
| tsconfig ES2020 | v5.7.1 | Modern JS output | `tsconfig.json` |
| `optimizePackageImports` | v5.7.4 | Tree-shake recharts/framer/date-fns | `next.config.ts` |
| `removeConsole` em produção | v5.7.4 | Elimina console.log no bundle | `next.config.ts` |
| Preload logo 96px webp | v5.7.3 | LCP mais rápido | `layout.tsx` |
| Cache headers (`_headers`) | v5.6.7 | Cache-Control otimizado para assets | `public/_headers` |
| DeferredComponents ssr:false | v5.7.4 | 6 componentes carregados pós-hydration | `deferred-components.tsx` |
| SplashScreen só no dashboard | v5.7.3 | Remove logo pesado de páginas públicas | `dashboard/layout.tsx` |

**➡️ Resultado: qualquer página que use o root layout já herda TODAS essas otimizações.**

---

## 2. Classificação de Páginas por Risco

### 🟢 Risco BAIXO — Provavelmente já 100

Páginas leves, estáticas, sem JS pesado. Herdam a infraestrutura global.

| Página | First Load JS | Risco |
|--------|:------------:|:-----:|
| `/pricing` | 129 kB | ✅ **Confirmado 100** |
| `/carreiras` | 126 kB | 🟢 |
| `/cookies` | 126 kB | 🟢 |
| `/excluir-conta` | 126 kB | 🟢 |
| `/lgpd` | 126 kB | 🟢 |
| `/privacidade` | 126 kB | 🟢 |
| `/sobre` | 126 kB | 🟢 |
| `/termos` | 126 kB | 🟢 |
| `/contato` | 128 kB | 🟢 |
| `/offline` | 124 kB | 🟢 |
| `/status` | 103 kB | 🟢 |
| `/blog/*` (3 posts) | 131 kB | 🟢 |

### 🟡 Risco MÉDIO — Podem precisar de ajustes de A11y/LCP

| Página | First Load JS | Riscos Potenciais |
|--------|:------------:|-------------------|
| `/` (landing) | 162 kB | LCP (hero image/text), A11y (contraste), CLS (lazy images) |
| `/blog` (index) | 135 kB | LCP (lista de cards), A11y (links) |
| `/contato` | 128 kB | A11y (formulário labels, Turnstile) |
| `/profile` | 177 kB | CLS (componentes dinâmicos) |
| `/p` (public profile) | 248 kB | LCP (foto perfil), JS pesado (248kB shared) |

### 🔴 Risco ALTO — JS pesado, componentes complexos

| Página | First Load JS | Riscos Potenciais |
|--------|:------------:|-------------------|
| `/` (homepage) | 162 kB | Hero animations, multiple sections, lazy images |
| `/assessment/share` | 181 kB | PDF rendering, gráficos, imagens |
| `/register/student` | 248 kB | Forms complexos, validação |
| `/login` | 241 kB | Passkey UI, Turnstile, forms |
| `/register/personal` | 242 kB | Multi-step form |
| Dashboard (todos) | 240-416 kB | Fora de escopo SEO — mas A11y importa |

---

## 3. Tier 1 — Páginas Públicas

> **Prioridade: MÁXIMA** — São indexadas pelo Google, impactam Core Web Vitals.

### 3.1 Homepage (`/`)

**Bundle:** 22.9 kB page + 162 kB total

**Riscos:**
- 🎨 **LCP**: Hero heading ou hero background gradient — verificar que o LCP element é texto, não imagem
- 📏 **CLS**: Seções com lazy-loaded images (testimonials, features) podem causar layout shift
- ♿ **A11y**: Links de navegação, contraste de textos decorativos, ARIA labels
- ⏱️ **TBT**: Animações com framer-motion (se importado via intersection observer)

**Ações:**
1. Auditar com PageSpeed Insights → identificar LCP element
2. Garantir `width` e `height` explícitos em todas as `<img>`
3. Verificar que animações não usam framer-motion (deve usar CSS transitions)
4. Checar contraste de textos com opacidade < 50%
5. Verificar heading hierarchy (h1 > h2 > h3, sem pulos)

### 3.2 Blog Index (`/blog`)

**Bundle:** 6.17 kB page + 135 kB total

**Riscos:**
- 🎨 **LCP**: Primeiro card do blog com imagem — preload necessário?
- ♿ **A11y**: Links de cards precisam de nomes acessíveis

**Ações:**
1. Verificar se imagens dos cards têm `alt` descritivo
2. Confirmar que cards são `<article>` com heading
3. `fetchpriority="high"` na imagem do primeiro card (above the fold)

### 3.3 Blog Posts (`/blog/*`)

**Bundle:** 2.37 kB page + 131 kB total — **MENOR da app!**

**Riscos:** Praticamente nenhum — são markdown estático.

**Ações:**
1. Verificar `lang` attribute se tiver conteúdo em inglês
2. Confirmar heading hierarchy dentro do artigo

### 3.4 Contato (`/contato`)

**Bundle:** 4.47 kB page + 128 kB total

**Riscos:**
- ♿ **A11y**: Labels de formulário, `autocomplete` attributes
- ⏱️ **TBT**: Turnstile widget pode causar long task

**Ações:**
1. Verificar que todos os `<input>` têm `<label>` associado
2. Confirmar `autocomplete` em email e nome
3. Testar se Turnstile carrega lazy (após form interaction)

### 3.5 Páginas Legais (LGPD, Privacidade, Termos, Cookies, Excluir Conta, Carreiras, Sobre)

**Bundle:** ~126 kB total — **ultra-leve**

**Riscos:** Quase zero. São texto estático.

**Ações:**
1. Verificar heading hierarchy (h1 > h2 > h3)
2. Confirmar que links internos têm cor contrastante
3. Batch: auditar todas de uma vez com script

---

## 4. Tier 2 — Páginas de Auth

> **Prioridade: ALTA** — Primeira impressão do usuário, impactam conversão.
> Bundle ~240kB (shared chunk auth), mas NÃO são indexadas pelo Google (robots noindex ou não linkadas).

### 4.1 Login (`/login`)

**Bundle:** 3.99 kB page + 241 kB total

**Riscos:**
- ♿ **A11y**: Labels de form, contraste em "esqueceu senha?", focus states
- ⏱️ **TBT**: Turnstile + passkey detection podem causar long tasks
- 🎨 **LCP**: Formulário de login é o LCP element — ok (rápido)

**Ações:**
1. Garantir `aria-label` no botão de passkey
2. Verificar `autocomplete="email"` e `autocomplete="current-password"`
3. Focus visible nos inputs (outline 2px)
4. Contraste do link "Esqueceu a senha?"

### 4.2 Register (Personal + Student)

**Bundle:** 5.33-6.55 kB page + 242-248 kB total

**Riscos:**
- ♿ **A11y**: Multi-step forms, validação acessível, error messages
- 📏 **CLS**: Steps mudando altura do form

**Ações:**
1. `aria-live="polite"` para mensagens de erro
2. `role="alert"` em validação de campos
3. `min-height` no container de steps para evitar CLS
4. Labels em TODOS os campos (incluindo CREF, telefone)

### 4.3 Forgot/Reset Password

**Bundle:** ~240 kB total

**Ações:**
1. Mesmas regras de form do login
2. Confirmar `autocomplete="email"` e `autocomplete="new-password"`

---

## 5. Tier 3 — Dashboard

> **Prioridade: MÉDIA para Lighthouse** — Não indexado pelo Google, mas A11y e Performance impactam UX.
> O dashboard carrega providers pesados (~400kB+), então Performance 100 é improvável e **não é um objetivo**.
> **Foco: A11y 100 + Performance ≥ 80.**

### 5.1 Riscos Comuns do Dashboard

| Categoria | Risco | Solução |
|-----------|-------|---------|
| **LCP** | SplashScreen bloqueia LCP | Já movido — SplashScreen some em <1s |
| **TBT** | Framer-motion animations | `MotionConfig reducedMotion="user"` já aplicado |
| **CLS** | Skeletons sem dimensões fixas | Definir `min-height` em loading states |
| **A11y** | Tabelas sem headers | `<th scope="col">` em todas as tabelas |
| **A11y** | Modais sem focus trap | Usar `Dialog` com `aria-modal` |
| **A11y** | Charts sem alt text | `aria-label` em `<svg>` do Recharts |

### 5.2 Páginas Mais Pesadas (ação futura)

| Página | First Load JS | Ação |
|--------|:------------:|------|
| `/dashboard/financeiro` | 416 kB | Recharts tree-shake, lazy load tabs |
| `/dashboard` (home) | 399 kB | Lazy load cards de stats, defer charts |
| `/dashboard/students/import` | 360 kB | XLSX lib é enorme — dynamic import |
| `/dashboard/workouts/create` | 270 kB | Multi-step — ok para a complexidade |
| `/dashboard/messages` | 256 kB | Chat com websocket — ok |

### 5.3 Dashboard A11y Checklist

- [ ] Todas as tabelas têm `<caption>` ou `aria-label`
- [ ] Todos os botões de ação têm `aria-label` (não só ícone)
- [ ] Modais usam `role="dialog"` + `aria-modal="true"`
- [ ] Toasts/notificações usam `role="status"` ou `role="alert"`
- [ ] Navigation sidebar tem `role="navigation"` + `aria-label`
- [ ] Charts têm `aria-label` descritivo
- [ ] Empty states têm heading hierarchy correto
- [ ] Loading skeletons têm `aria-busy="true"`

---

## 6. Tier 4 — Páginas Especiais

### 6.1 Assessment Share (`/assessment/share`)

**Bundle:** 10.7 kB page + 181 kB total

**Riscos:**
- 🎨 **LCP**: Gráfico radar/body composition — pode ser SVG grande
- 📏 **CLS**: Dados carregados via query params + render condicional
- ♿ **A11y**: Gráficos SVG precisam de alt text

**Ações:**
1. `aria-label` em todos os SVG de gráficos
2. Tabela alternativa para dados de composição corporal (A11y)
3. Dimensões fixas nos containers de gráficos

### 6.2 Public Profile (`/p`)

**Bundle:** 5.98 kB page + 248 kB total

**Riscos:**
- 🎨 **LCP**: Foto do personal — precisa `fetchpriority="high"` + dimensões
- ♿ **A11y**: Link de WhatsApp precisa `aria-label` descritivo

**Ações:**
1. Foto do personal com `width`, `height`, `fetchpriority="high"`
2. `alt` descritivo na foto (não genérico "foto")
3. Links externos com `rel="noopener noreferrer"`

### 6.3 Profile Viewer (`/profile`)

**Bundle:** 5.7 kB page + 177 kB total

**Ações:**
1. Similar ao `/p` — foto com dimensões + alt
2. Verificar contraste de badges/tags

### 6.4 Offline (`/offline`)

**Bundle:** 3.78 kB page + 124 kB total — **ultra-leve**

**Ações:** Nenhuma. Página minimalista de fallback PWA.

---

## 7. Checklist Universal por Página

Use este checklist para auditar QUALQUER página nova ou existente:

### ⚡ Performance

- [ ] First Load JS < 170kB (público) ou < 300kB (dashboard)
- [ ] Nenhum `<link rel="stylesheet">` render-blocking (inline-css.mjs cuida)
- [ ] Nenhum script de terceiro no critical path
- [ ] Imagens above-the-fold com `fetchpriority="high"` + dimensões explícitas
- [ ] Imagens below-the-fold com `loading="lazy"`
- [ ] Fonts com `display: swap` (Inter via `next/font`)
- [ ] Sem `import` de framer-motion em páginas públicas
- [ ] `<Script strategy="lazyOnload">` para terceiros
- [ ] Console.log removido em prod (`removeConsole` no next.config)

### ♿ Acessibilidade

- [ ] Heading hierarchy: h1 → h2 → h3 (sem pulos, 1 h1 por página)
- [ ] Todos os inputs com `<label>` associado
- [ ] Todos os botões icon-only com `aria-label`
- [ ] Contraste ≥ 4.5:1 para texto body (WCAG AA)
- [ ] Contraste ≥ 3:1 para texto grande (≥ 18px bold)
- [ ] Imagens com `alt` descritivo (ou `alt=""` se decorativo)
- [ ] Links com texto visível (não só "clique aqui")
- [ ] `lang="pt-BR"` no `<html>`
- [ ] Skip link ("Pular para o conteúdo") — já global
- [ ] Focus visible em todos os interativos (outline)
- [ ] `role="navigation"`, `role="main"`, `role="banner"`, `role="contentinfo"`

### 🏆 Best Practices

- [ ] HTTPS (Cloudflare — automático)
- [ ] Sem erros de console em produção
- [ ] Sem APIs depreciadas (document.write, etc.)
- [ ] CSP headers adequados

### 🔍 SEO

- [ ] `<title>` único e descritivo (< 60 chars)
- [ ] `<meta name="description">` único (< 160 chars)
- [ ] `<link rel="canonical">` apontando para a URL correta
- [ ] `<meta name="robots" content="index, follow">` (páginas públicas)
- [ ] `<meta name="robots" content="noindex">` (dashboard, auth)
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Heading hierarchy válida
- [ ] Links crawláveis (não JS-only navigation)
- [ ] JSON-LD structured data (onde aplicável)

---

## 8. Problemas Conhecidos por Categoria

### 🎨 LCP — Largest Contentful Paint

| Problema | Causa | Fix |
|----------|-------|-----|
| Cookie banner como LCP | `position:fixed` + z-index alto renderiza antes do conteúdo | ✅ Fixed v5.7.5: `requestIdleCallback` + 2.5s delay |
| SplashScreen como LCP | Logo grande com `priority` em todas as páginas | ✅ Fixed v5.7.3: movido para dashboard-only |
| Hero image sem preload | Imagem acima do fold sem `fetchpriority` | Adicionar `fetchpriority="high"` |
| Fonts FOIT | Font bloqueia render por 3s default | ✅ Fixed: `display: "swap"` via next/font |

### ⏱️ TBT — Total Blocking Time

| Problema | Causa | Fix |
|----------|-------|-----|
| `email-decode.min.js` | CF Email Obfuscation injeta script bloqueante | ✅ Fixed v5.7.5: desabilitado via CF API |
| GA4 gtag.js long task | Script carrega e executa em main thread | ✅ Fixed v5.7.5: `@next/third-parties` otimiza |
| framer-motion hydration | ~30-45KB gz processado em TODA página | ✅ Fixed v5.7.4: movido para dashboard-only |
| AuthProvider blocking | Fetch `/auth/me` antes de render | ✅ Fixed v5.7.4: movido para dashboard-only |
| OneSignal SDK | SDK carrega em todas as páginas | ✅ Fixed v5.7.4: movido para dashboard-only |

### 📏 CLS — Cumulative Layout Shift

| Problema | Causa | Fix |
|----------|-------|-----|
| Imagens sem dimensão | `<img>` sem `width`/`height` causa reflow | Sempre incluir dimensões |
| Font swap | Font muda de fallback para Inter | ✅ Mitigado: `font-display: swap` + `size-adjust` |
| Ads/banners dinâmicos | Conteúdo injetado pós-load | Reservar espaço com `min-height` |
| Skeleton→content | Loading skeleton tem tamanho diferente do conteúdo | Dimensões fixas no skeleton |

### ♿ A11y — Acessibilidade

| Problema | Causa | Fix |
|----------|-------|-----|
| Contraste insuficiente | `text-white/25` sobre `#050A12` | Mínimo `text-white/40` para texto body |
| Heading pulos | h1 → h4 (sem h2, h3) | Sempre sequência h1 → h2 → h3 |
| Botão sem label | `<button>` com só ícone, sem `aria-label` | Sempre `aria-label` em icon buttons |
| Link sem nome | `<a>` com só ícone SVG | Adicionar `aria-label` ou texto visível |
| Form sem label | `<input>` sem `<label>` | Associar via `htmlFor`/`id` |

---

## 9. Comandos de Auditoria em Massa

### 🔍 Script: Auditar todas as páginas públicas

```bash
#!/bin/bash
# lighthouse-audit-all.sh — Audita todas as páginas públicas

PAGES=(
  "/"
  "/pricing"
  "/blog"
  "/blog/cobranca-automatica-personal"
  "/blog/ia-personal-trainer"
  "/blog/retencao-alunos-personal"
  "/contato"
  "/carreiras"
  "/cookies"
  "/excluir-conta"
  "/lgpd"
  "/privacidade"
  "/sobre"
  "/termos"
)

BASE_URL="https://iapersonal.app.br"
RESULTS_DIR="docs/lighthouse/results"
mkdir -p "$RESULTS_DIR"
DATE=$(date +%Y%m%d)

for page in "${PAGES[@]}"; do
  slug=$(echo "$page" | tr '/' '-' | sed 's/^-//')
  [[ -z "$slug" ]] && slug="home"
  echo "🔍 Auditing ${BASE_URL}${page}..."

  # PageSpeed Insights API (free, no key required for basic)
  curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${BASE_URL}${page}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=DESKTOP" \
    | python3 -c "
import sys, json
d = json.load(sys.stdin)
cats = d.get('lighthouseResult', {}).get('categories', {})
scores = {k: int(v.get('score', 0) * 100) for k, v in cats.items()}
print(f'  Perf: {scores.get(\"performance\", \"?\")} | A11y: {scores.get(\"accessibility\", \"?\")} | BP: {scores.get(\"best-practices\", \"?\")} | SEO: {scores.get(\"seo\", \"?\")}')
" 2>/dev/null

  sleep 3  # Rate limit: ~1 req/3s sem API key
done
```

### 🔍 Grep: Problemas comuns em batch

```bash
# 1. Contraste perigoso em todas as páginas públicas
grep -rn "text-white/[12][0-9]\b" src/app/\(public\)/ src/components/landing/ --include="*.tsx"

# 2. Imagens sem dimensão
grep -rn "<img " src/app/\(public\)/ src/components/landing/ --include="*.tsx" | grep -v "width\|height"

# 3. Botões sem aria-label (icon-only)
grep -rn "<button" src/app/\(public\)/ src/components/landing/ --include="*.tsx" | grep -v "aria-label"

# 4. Links sem texto acessível
grep -rn "<a " src/app/\(public\)/ src/components/landing/ --include="*.tsx" | grep "aria-hidden"

# 5. Heading hierarchy — contar por arquivo
for f in $(find src/app/\(public\) -name "*.tsx"); do
  h_counts=$(grep -cE "<h[1-6]" "$f" 2>/dev/null)
  [[ "$h_counts" -gt 0 ]] && echo "$f: $h_counts headings"
done

# 6. Forms sem labels
grep -rn "<input" src/app/ --include="*.tsx" | grep -v "aria-label\|htmlFor\|id="

# 7. Providers pesados onde não deviam estar
grep -rn "framer-motion\|MotionConfig\|AuthProvider\|OneSignalProvider" src/app/\(public\)/ src/components/landing/ --include="*.tsx"
```

---

## 10. Critérios de Sucesso

### 🏁 Definition of Done — Página otimizada

Uma página é considerada **otimizada** quando:

1. ✅ **Performance ≥ 95** (público) ou **≥ 80** (dashboard)
2. ✅ **Accessibility = 100**
3. ✅ **Best Practices = 100**
4. ✅ **SEO = 100** (se indexável)
5. ✅ Screenshot do PageSpeed salvo em `docs/lighthouse/results/`
6. ✅ Entrada na tabela de tracking abaixo

### 📊 Tracking — Status por Página

| Página | Perf | A11y | BP | SEO | Data | Status |
|--------|:----:|:----:|:--:|:---:|:----:|:------:|
| `/pricing` | **100** | **100** | **100** | **100** | 16/03/2026 | ✅ Done |
| `/` | — | — | — | — | — | ⏳ Pendente |
| `/blog` | — | — | — | — | — | ⏳ Pendente |
| `/blog/cobranca-automatica-personal` | — | — | — | — | — | ⏳ Pendente |
| `/blog/ia-personal-trainer` | — | — | — | — | — | ⏳ Pendente |
| `/blog/retencao-alunos-personal` | — | — | — | — | — | ⏳ Pendente |
| `/contato` | — | — | — | — | — | ⏳ Pendente |
| `/carreiras` | — | — | — | — | — | ⏳ Pendente |
| `/cookies` | — | — | — | — | — | ⏳ Pendente |
| `/excluir-conta` | — | — | — | — | — | ⏳ Pendente |
| `/lgpd` | — | — | — | — | — | ⏳ Pendente |
| `/privacidade` | — | — | — | — | — | ⏳ Pendente |
| `/sobre` | — | — | — | — | — | ⏳ Pendente |
| `/termos` | — | — | — | — | — | ⏳ Pendente |
| `/offline` | — | — | — | — | — | ⏳ Pendente |
| `/status` | — | — | — | — | — | ⏳ Pendente |
| `/login` | — | — | — | — | — | ⏳ Pendente |
| `/register` | — | — | — | — | — | ⏳ Pendente |
| `/register/personal` | — | — | — | — | — | ⏳ Pendente |
| `/register/student` | — | — | — | — | — | ⏳ Pendente |
| `/forgot-password` | — | — | — | — | — | ⏳ Pendente |
| `/reset-password` | — | — | — | — | — | ⏳ Pendente |
| `/verify-email` | — | — | — | — | — | ⏳ Pendente |
| `/auth/callback` | — | — | — | — | — | ⏳ Pendente |
| `/p` (public profile) | — | — | — | — | — | ⏳ Pendente |
| `/profile` | — | — | — | — | — | ⏳ Pendente |
| `/assessment/share` | — | — | — | — | — | ⏳ Pendente |
| `/dashboard` | — | — | — | — | — | ⏳ Pendente |
| `/dashboard/financeiro` | — | — | — | — | — | ⏳ Pendente |

### 🎯 Ordem de Execução Recomendada

| Sprint | Páginas | Estimativa | Justificativa |
|:------:|---------|:----------:|---------------|
| **1** | `/`, `/blog`, `/blog/*` | 1h | SEO-critical, alto tráfego orgânico |
| **2** | `/contato`, `/carreiras`, `/sobre` | 30min | Páginas com forms ou conteúdo médio |
| **3** | `/cookies`, `/lgpd`, `/privacidade`, `/termos`, `/excluir-conta` | 15min | Texto estático — provavelmente já 100 |
| **4** | `/login`, `/register/*`, `/forgot-password`, `/reset-password` | 1h | Forms com A11y complexa |
| **5** | `/p`, `/profile`, `/assessment/share` | 1h | Componentes dinâmicos, imagens |
| **6** | Dashboard (top 5 mais usadas) | 2h | Foco em A11y, não em Perf 100 |

---

## 📖 Referências

| Doc | Conteúdo |
|-----|----------|
| [README.md](README.md) | Guia completo da jornada v5.6.4 → v5.7.5 |
| [docs/DESIGN-SYSTEM-COLORS.md](../DESIGN-SYSTEM-COLORS.md) | Paleta de cores com contrastes WCAG |
| [docs/CHANGELOG.md](../CHANGELOG.md) | Histórico de cada versão |
| [.github/copilot-instructions.md](../../.github/copilot-instructions.md) | Regras Tailwind v4, componentes, padrões |

---

> **Nota final:** A infraestrutura está pronta. As 13 otimizações globais (seção 1) já beneficiam TODAS as 74 páginas.
> O trabalho restante é cirúrgico — A11y e LCP página-a-página.
> Use o checklist da seção 7 + os greps da seção 9 para auditar em massa antes de cada sprint.
