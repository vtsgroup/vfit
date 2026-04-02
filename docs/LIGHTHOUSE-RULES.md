# 🎯 Lighthouse 100/100/100/100 — Regras para TODAS as Páginas

> **v1.0** · 15/03/2026 · Baseline: `/pricing` v5.6.7 (Perf 93→98 · A11y 95→100 · BP 100 · SEO 100)
> **Aplicar em:** Toda página pública + dashboard · Verificar antes de CADA deploy

---

## 📋 Checklist Rápido (copiar para cada página nova)

```
□ Contraste texto ≥ 4.5:1 (AA) para body, ≥ 3.0:1 (AA-lg) para títulos ≥18px bold
□ Heading hierarchy sequencial (h1 → h2 → h3), sem pulos
□ Todos os botões interativos com aria-label ou texto visível
□ Todas as imagens com alt descritivo
□ Links com texto descritivo (nunca "clique aqui" sozinho)
□ Sem text-white sobre bg-brand-primary (usar text-gray-900)
□ Sem text-white/XX com opacidade < 50 para texto informativo
□ Sem Tailwind bracket notation legada (Regras 12/13)
□ Botões CTA usando <Button> do Design System (Regra 14)
□ Scripts 3rd-party com lazyOnload ou afterInteractive
□ Imagens LCP com priority + preload
□ Sem preconnect desnecessário (usar dns-prefetch quando suficiente)
```

---

## 🔴 1. ACESSIBILIDADE (A11y) — Meta: 100

### 1.1 Contraste de Texto — WCAG 2.1

| Opacidade | Contraste vs `#050A12` | WCAG | Veredicto |
|:---------:|:----------------------:|:----:|:---------:|
| `text-white` (100%) | 20.38:1 | AAA ✅ | ✅ Qualquer uso |
| `text-white/90` | ~18.3:1 | AAA ✅ | ✅ Qualquer uso |
| `text-white/80` | ~16.3:1 | AAA ✅ | ✅ Qualquer uso |
| `text-white/70` | ~14.3:1 | AAA ✅ | ✅ Texto body, links |
| `text-white/60` | ~12.2:1 | AAA ✅ | ✅ Texto body (mínimo recomendado) |
| `text-white/50` | ~10.2:1 | AAA ✅ | ✅ Captions, bottom bar |
| **`text-white/40`** | **~8.2:1** | **AA ✅** | ⚠️ OK mas preferir /50+ |
| **`text-white/30`** | **~6.1:1** | **AA ✅** | ⚠️ Apenas texto ≥ 11px |
| **`text-white/25`** | **~5.1:1** | **AA ✅** | ⚠️ Apenas labels grandes ≥ 14px |
| **`text-white/20`** | **~4.1:1** | **AA-lg ⚠️** | ⛔ Apenas ícones decorativos ou texto ≥ 18px bold |
| **`text-white/15`** | **~3.1:1** | **AA-lg ⚠️** | ⛔ Apenas ícones/bordas, NUNCA texto |
| **`text-white/10`** | **~2.0:1** | **FAIL ❌** | ⛔ Apenas borders/dividers, NUNCA conteúdo |

#### Regras Absolutas

```
✅ Texto body (< 18px)       → mínimo text-white/40 (ratio ≥ 4.5:1 AA)
✅ Texto grande (≥ 18px bold) → mínimo text-white/20 (ratio ≥ 3.0:1 AA-lg)
✅ Links navegáveis            → mínimo text-white/50 (ratio ≥ 4.5:1 + hover claro)
✅ Labels uppercase 10-11px    → mínimo text-white/50 (texto pequeno precisa mais contraste)
✅ Ícones informativos         → mínimo text-white/30 (ratio ≥ 3.0:1 AA-lg)
✅ Ícones decorativos          → text-white/15 ou /20 OK (não transmitem informação)
✅ Placeholders de input       → text-white/30 OK (padrão de UX aceito)
⛔ NUNCA text-white/20 para texto < 14px informativo
⛔ NUNCA text-white/15 ou menor para qualquer texto legível
```

#### Mapeamento de Substituições

| Antes (violação) | Depois (corrigido) | Contexto |
|:-----------------:|:------------------:|----------|
| `text-white/25` | `text-white/50` | Links, labels, badges informativos |
| `text-white/30` | `text-white/60` ou `/70` | Descrições, subtítulos, labels |
| `text-white/40` | `text-white/50` ou `/60` | Parágrafos, textos informativos |
| `text-white/20` (ícone info) | `text-white/40` | Ícones que transmitem informação |
| `text-white/20` (ícone deco) | `text-white/20` ✅ | Ícones puramente decorativos (manter) |

> **Regra prática:** Na dúvida, use `/60`. É seguro para quase tudo e mantém a estética suave.

### 1.2 Botões sobre `bg-brand-primary` (#22C55E)

| Combinação | Contraste | WCAG |
|------------|:---------:|:----:|
| `text-white` sobre `#22C55E` | **2.8:1** | ❌ FAIL |
| `text-gray-900` (#111827) sobre `#22C55E` | **7.5:1** | ✅ AAA |
| `text-bg-dark` (#050A12) sobre `#22C55E` | **8.7:1** | ✅ AAA |

```
⛔ NUNCA: text-white sobre bg-brand-primary
✅ SEMPRE: text-gray-900 ou text-bg-dark sobre bg-brand-primary
```

**Onde se aplica:**
- Botões CTA primários com fundo verde
- Badges "MAIS POPULAR", "PRO", "NOVO"
- Toggle ativo de tabs/chips com fundo verde
- FAQ accordion ícone ativo
- Qualquer elemento com fundo `bg-brand-primary` que tenha texto

**Exceções (dashboard dark-on-dark):**
- Componentes do dashboard onde `bg-brand-primary/10` ou `/20` é usado como fundo sutil (texto branco OK pois o fundo real é escuro)

### 1.3 Heading Hierarchy — Sem Pulos

```
✅ CORRETO                    ❌ INCORRETO
h1 "Título da Página"        h1 "Título da Página"
  h2 "Seção"                    h3 "Seção"     ← pula h2!
    h3 "Subseção"                 h4 "Sub"     ← pula h3!
  h2 "Outra Seção"             h2 "Outra"
```

#### Regras

1. **Cada página deve ter exatamente 1 `<h1>`** — geralmente no `PageHero` ou título principal
2. **Headings devem ser sequenciais** — h1 → h2 → h3 (nunca h1 → h3)
3. **Footer não deve ter headings** — usar `<p>` com classes visuais de heading
4. **Se cards vêm direto após h1 sem h2** — adicionar `<h2 className="sr-only">` antes do grid
5. **Navbar não deve ter headings** — usar `<span>`, `<p>` ou `aria-label`

```tsx
// ✅ Solução para seções sem h2 visível
<h2 className="sr-only">Escolha seu plano</h2>
<div className="grid grid-cols-3 gap-6">
  {/* Cards com h3 */}
</div>
```

### 1.4 Footer — Padrão Correto

```tsx
// ❌ ANTES (violações múltiplas)
<h4 className="text-white/30 uppercase">RECURSOS</h4>
<a className="text-white/40">Blog</a>

// ✅ DEPOIS (corrigido)
<p className="text-white/70 uppercase">RECURSOS</p>
<a className="text-white/70">Blog</a>
```

| Elemento | Mínimo | Recomendado |
|----------|--------|-------------|
| Column labels (ex: "RECURSOS") | `text-white/60` | `text-white/70` |
| Links do footer | `text-white/60` | `text-white/70` |
| Copyright/bottom bar | `text-white/50` | `text-white/50` |
| Trust badges ("SSL", "LGPD") | `text-white/50` | `text-white/60` |
| Ícones sociais | `text-white/50` | `text-white/50` |

### 1.5 Elementos Interativos

- **Todo `<button>` deve ter** texto visível OU `aria-label`
- **Todo `<a>` deve ter** texto descritivo (não "clique aqui")
- **Todo `<input>` deve ter** `<label>` associado ou `aria-label`
- **Todo `<img>` deve ter** `alt` descritivo (exceto `role="presentation"`)
- **Formulários devem ter** `<fieldset>` + `<legend>` quando agrupados

```tsx
// ❌ Botão sem texto acessível
<button onClick={toggle}><ChevronDown /></button>

// ✅ Com aria-label
<button onClick={toggle} aria-label="Expandir detalhes"><ChevronDown /></button>
```

---

## ⚡ 2. PERFORMANCE — Meta: 100

### 2.1 LCP (Largest Contentful Paint) — Alvo: < 1.2s

| Ação | Impacto | Status |
|------|---------|--------|
| Imagem LCP com `priority` (Next/Image) | Alto | ✅ Implementado |
| `<link rel="preload">` para logo no `<head>` | Alto | ✅ Implementado |
| Preload ANTES de dns-prefetch no `<head>` | Médio | ✅ Implementado |
| CSS < 40 KiB (eliminar blocos não-usados) | Alto | 🔄 Em progresso |

```tsx
// ✅ Ordem correta no <head>
<link rel="preload" href="/images/logo-transparent-96.webp" as="image" type="image/webp" />
<link rel="dns-prefetch" href="https://api.iapersonal.app.br" />
<link rel="dns-prefetch" href="https://cdn.onesignal.com" />
```

### 2.2 Scripts de Terceiros — Carregamento Lazy

| Script | Estratégia | Delay |
|--------|-----------|-------|
| GA4 (Google Analytics) | `strategy="lazyOnload"` | Após page load |
| OneSignal SDK | `setTimeout(3000)` no useEffect | 3s após mount |
| Turnstile (CF) | Carregado sob demanda no formulário | Quando visível |
| PWA beforeinstallprompt | `strategy="afterInteractive"` | Após hydration |

```tsx
// ✅ GA4 — lazyOnload
<Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />

// ✅ OneSignal — delay 3s
useEffect(() => {
  const timer = setTimeout(() => { loadOneSignalSDK() }, 3000)
  return () => clearTimeout(timer)
}, [])

// ✅ PWA script — afterInteractive (não blocking)
<Script id="pwa-install-capture" strategy="afterInteractive">
  {`window.addEventListener('beforeinstallprompt', (e) => { ... })`}
</Script>
```

### 2.3 Preconnect vs DNS-Prefetch

```
✅ preconnect  → APENAS para recursos carregados nos primeiros 3s (fonts, CDN crítico)
✅ dns-prefetch → Para APIs e CDNs usados após interação (API backend, OneSignal, GA)
⛔ preconnect para API backend em páginas públicas (não faz fetch no load)
```

```tsx
// ✅ Correto para páginas públicas
<link rel="dns-prefetch" href="https://api.iapersonal.app.br" />

// ❌ Incorreto — desperdiça conexão TCP/TLS
<link rel="preconnect" href="https://api.iapersonal.app.br" />
```

### 2.4 Browserslist — Eliminar Polyfills

```json
// package.json
{
  "browserslist": ["chrome >= 90", "firefox >= 90", "safari >= 15", "edge >= 90"]
}
```

**Impacto:** Elimina ~11.7 KiB de polyfills (Array.at, Object.hasOwn, structuredClone).

### 2.5 Remove Console em Produção

```ts
// next.config.ts
compiler: {
  removeConsole: process.env.NODE_ENV === 'production'
    ? { exclude: ['error', 'warn'] }
    : false,
}
```

### 2.6 Imagens — Regras

| Regra | Detalhe |
|-------|---------|
| Formato preferido | WebP (fallback PNG para ícones complexos) |
| Imagem LCP | `priority` + preload no head |
| Imagens abaixo do fold | `loading="lazy"` (padrão do Next/Image) |
| Tamanho servido | Máximo 2x do tamanho exibido (Retina) |
| `sizes` prop | Sempre definir quando não é full-width |

```tsx
// ✅ Imagem LCP (above the fold)
<Image src="/images/logo.webp" width={40} height={32} alt="VFIT" priority />

// ✅ Imagem below the fold
<Image src="/images/feature.webp" width={600} height={400} alt="Dashboard de treinos" loading="lazy" />
```

---

## 🛡️ 3. BEST PRACTICES — Meta: 100

### 3.1 HTTPS — Forçado pelo Cloudflare ✅
### 3.2 Sem mixed content ✅
### 3.3 CSP headers definidos em `_headers` ✅
### 3.4 Sem `document.write()` ✅
### 3.5 Sem vulnerabilidades de JS detectadas ✅

---

## 🔍 4. SEO — Meta: 100

### 4.1 Meta Tags Obrigatórias

```tsx
export const metadata: Metadata = {
  title: 'Título da Página | VFIT',
  description: 'Descrição com 150-160 caracteres incluindo keywords.',
  openGraph: {
    title: 'Título para Social',
    description: 'Descrição para compartilhamento.',
    images: [{ url: '/og/pagina.png', width: 1200, height: 630 }],
  },
}
```

### 4.2 Robots + Sitemap ✅
- `public/robots.txt` configurado
- `public/sitemap.xml` com todas as páginas públicas
- `public/sitemap-blog.xml` para posts do blog

### 4.3 Links com `rel` correto
```tsx
// Links externos
<a href="https://..." target="_blank" rel="noopener noreferrer">

// Links internos
<Link href="/pricing">Preços</Link>
```

---

## 🎨 5. TAILWIND CSS v4 — Sintaxe Canônica

> **Regras 12/13 do copilot-instructions.md** — Zero tolerância a sintaxe legada.

### 5.1 Bracket Notation de Opacidade

```
❌ bg-white/[0.06]    → ✅ bg-white/6
❌ border-white/[0.03] → ✅ border-white/3
❌ text-white/[0.4]   → ✅ text-white/40
❌ hover:bg-white/[0.08] → ✅ hover:bg-white/8
```

### 5.2 Variáveis CSS

```
❌ bg-[var(--md3-surface)]  → ✅ bg-(--md3-surface)
❌ text-[var(--token)]      → ✅ text-(--token)
```

### 5.3 Gradientes

```
❌ bg-gradient-to-r  → ✅ bg-linear-to-r
❌ bg-gradient-to-b  → ✅ bg-linear-to-b
```

### 5.4 Flexbox

```
❌ flex-shrink-0 → ✅ shrink-0
❌ flex-grow     → ✅ grow
```

### 5.5 Tamanhos Divisíveis por 4

```
❌ h-[600px]  → ✅ h-150  (600÷4)
❌ w-[220px]  → ✅ w-55   (220÷4)
❌ h-[2px]    → ✅ h-0.5  (2÷4)
```

---

## 🔬 6. VERIFICAÇÃO — Comandos de Auditoria

### Antes de Cada Deploy

```bash
# 1. Contraste — zero violações em landing components
grep -rn "text-white/[12][0-9]\b" src/components/landing/ | grep -v "//\|hover:\|group-hover:"
# Deve retornar: APENAS text-white/15 em ícones decorativos (chevrons)

# 2. Heading hierarchy — zero h4 no footer
grep -rn "<h4" src/components/landing/footer.tsx
# Deve retornar: 0 resultados

# 3. Bracket notation — zero legacy
grep -rn "white/\[0\." src/components/landing/
# Deve retornar: 0 resultados

# 4. text-white sobre brand-primary em públicas
grep -rn "bg-brand-primary.*text-white\|text-white.*bg-brand-primary" src/app/\(public\)/ src/components/landing/ src/components/pricing/
# Deve retornar: 0 resultados (exceto bg-brand-primary/10 com alpha baixo)

# 5. Gradientes legados
grep -rn "bg-gradient-to-" src/
# Deve retornar: 0 resultados

# 6. Variáveis CSS legadas
grep -rn "\-\[var(--" src/components/
# Deve retornar: 0 resultados
```

### PageSpeed Insights — Validar Online

```bash
# Desktop
open "https://pagespeed.web.dev/analysis?url=https://iapersonal.app.br/PAGINA&form_factor=desktop"

# Mobile
open "https://pagespeed.web.dev/analysis?url=https://iapersonal.app.br/PAGINA&form_factor=mobile"
```

---

## 📌 7. VIOLAÇÕES CONHECIDAS (Pendentes de Correção)

### Páginas Públicas

| Arquivo | Violação | Severidade | Fix |
|---------|----------|:----------:|-----|
| `src/components/landing/hero.tsx` L231,265,278 | `white/[0.06]` bracket notation | Baixa | `white/6` |
| `src/components/landing/cta-section.tsx` L115 | `text-white/40` | Média | `text-white/60` |
| `src/components/landing/cta-section.tsx` L156 | `text-white/25` | Alta | `text-white/50` |
| `src/components/landing/numbers-section.tsx` L110 | `text-white/30` | Média | `text-white/60` |
| `src/components/landing/numbers-section.tsx` L153 | `text-white/40` | Média | `text-white/60` |
| `src/components/landing/gamification-section.tsx` L94,113,148,210,222 | `text-white/30` | Média | `text-white/60` |
| `src/components/landing/gamification-section.tsx` L196 | `text-white/40` | Média | `text-white/60` |
| `src/components/landing/navbar.tsx` L276 | `text-white/25` | Alta | `text-white/50` |
| `src/components/landing/navbar.tsx` L291,517 | `text-white/40` (ícones) | Baixa | `text-white/50` |
| `src/components/landing/navbar.tsx` L304 | `text-white/30` (descrição) | Média | `text-white/50` |
| `src/components/landing/navbar.tsx` L496 | `text-white/30` (chevron) | Baixa | `text-white/40` |
| `src/components/landing/navbar.tsx` L531,550 | `text-white/15` (chevron deco) | Info | Manter (decorativo) |
| `src/components/landing/navbar.tsx` L563,627 | `text-white/20` (label 10px) | Alta | `text-white/50` |
| `src/components/landing/footer.tsx` L226 | `text-white/25` (ícone extLink) | Baixa | `text-white/50` |
| `src/components/landing/pricing-koyeb.tsx` L485 | `text-white/30` | Média | `text-white/50` |

### Página `/p` (Perfil Público)

| Arquivo | Violação | Severidade | Fix |
|---------|----------|:----------:|-----|
| `src/app/p/page.tsx` L189,217,227,237,406 | `text-white/40` | Média | `text-white/60` |
| `src/app/p/page.tsx` L275 | `text-white/30` | Média | `text-white/60` |
| `src/app/p/page.tsx` L482 | `text-white/30` (link terms) | Alta | `text-white/50` |
| `src/app/p/page.tsx` L288 | `text-white/20` (link 12px) | Alta | `text-white/50` |
| `src/app/p/page.tsx` L293 | `text-white/20` (badge 10px) | Alta | `text-white/50` |
| `src/app/p/page.tsx` L106,122 e 7 mais | `text-white/20` (ícones input) | Baixa | Manter (decorativo) |

### Dashboard (Componentes Comuns)

| Arquivo | Violação | Severidade | Fix |
|---------|----------|:----------:|-----|
| `src/components/layout/sidebar.tsx` L260 | `text-white/20` (versão) | Baixa | Manter (decorativo) |
| `src/components/ui/modern-notification.tsx` L158 | `text-white/20` (close btn) | Baixa | `text-white/40` |

### Blog

| Arquivo | Violação | Severidade | Fix |
|---------|----------|:----------:|-----|
| `src/app/(public)/blog/retencao-alunos-personal/page.tsx` L234 | `<h4>` potencial hierarchy skip | Média | Verificar contexto |

---

## 📖 8. REFERÊNCIA CRUZADA

| Doc | Conteúdo Relacionado |
|-----|---------------------|
| `docs/DESIGN-SYSTEM-COLORS.md` | Paleta completa, contrastes WCAG, combinações seguras |
| `docs/lighthouse/SPRINT-PLAN.md` | Sprints originais executados em v5.6.7 |
| `docs/lighthouse/plan.md` | Auditoria PageSpeed original (com erros corrigidos no SPRINT-PLAN) |
| `.github/copilot-instructions.md` | Regras 12-15: Tailwind v4, Button, barrel exports |

---

## ✅ 9. RESUMO — O que foi aplicado em v5.6.7/v5.6.8

| Sprint | O que | Onde | Score |
|:------:|-------|------|:-----:|
| S1 | Footer contraste `/40`→`/70`, `/30`→`/70`, `/25`→`/50` | footer.tsx | A11y +3 |
| S1 | Footer `<h4>`→`<p>` | footer.tsx | A11y +1 |
| S1 | Pricing `text-white`→`text-gray-900` (btn+badge) | pricing-card.tsx | A11y +2 |
| S1 | Pricing CTA `text-white`→`text-gray-900` | pricing/page.tsx | A11y +1 |
| S1 | FAQ toggle `text-white`→`text-gray-900` | faq-section.tsx | A11y +1 |
| S1 | How It Works `text-white`→`text-gray-900` | how-it-works-v2.tsx | A11y +1 |
| S1 | Pricing `<h2 sr-only>` antes dos cards | pricing-section.tsx | A11y +1 |
| S2 | browserslist moderno | package.json | Perf +1 |
| S2 | removeConsole em prod | next.config.ts | Perf +0.5 |
| S2 | OneSignal delay 3s | onesignal-provider.tsx | Perf +1 |
| S3 | Preconnect → dns-prefetch only | layout.tsx | Perf +0.5 |
| S3 | Preload antes de dns-prefetch | layout.tsx | Perf +0.5 |
| S3 | PWA script → afterInteractive | layout.tsx | Perf +0.5 |
| S3 | Navbar bracket notation cleanup (20+) | navbar.tsx | Code quality |
| S3 | `_headers` filename fix | _headers | BP |
| v5.6.8 | Ícones 100% fill (EXT≥128, REG≤96) | public/icons/, favicons/ | PWA |
| v5.6.8 | Notification badges monocromáticos | public/icons/ | PWA |
