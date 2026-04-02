# 🎨 PLANO MASTER — Redesign Final VFIT

> **v1.0** · 27/02/2026 · Objetivo: UI/UX nível Figma profissional
> **Inspirações:** WinTrack, LunaFit, FitGuide, Modern Fitness App UI Kit

---

## 🎯 Visão

Transformar o VFIT em uma interface **de cair o queixo** — dark mode premium com acentos
neon-green/mint, transições cinematográficas, skeletons em tudo, imagens arredondadas,
cards glassmorphism, charts interativos e performance sub-1s.

**Futuro:** Flutter/app nativo. Todo componente deve ser pensado para portar facilmente.

---

## 🎨 Identidade Visual Definida

### Paleta de Cores (mantendo identidade atual)

| Token | Hex | Uso |
|-------|-----|-----|
| `--brand-primary` | `#22E6A8` | CTA principal, links, badges |
| `--brand-accent` | `#3DFCA4` | Glow, destaque IA, gamification |
| `--brand-lime` | `#A6FF4D` | Gradients secundários, charts |
| `--brand-deep` | `#0B6B4E` | Sidebar ativo, badges escuros |
| `--surface-dark` | `#09090B` | Background principal |
| `--surface-elevated` | `#111113` | Cards, modais |
| `--surface-overlay` | `#18181B` | Dropdowns, tooltips |
| `--surface-light` | `#FFFFFF` | Light mode bg |
| `--text-primary-dark` | `#FAFAFA` | Texto sobre dark |
| `--text-secondary-dark` | `#A1A1AA` | Texto auxiliar dark |
| `--text-muted` | `#71717A` | Placeholders |

### Tipografia

| Elemento | Font | Weight | Size |
|----------|------|--------|------|
| Display (Hero) | Inter | 900 (Black) | 72-88px |
| H1 | Inter | 800 (ExtraBold) | 48-56px |
| H2 | Inter | 700 (Bold) | 36-40px |
| H3 | Inter | 700 | 24-28px |
| Body | Inter | 400 | 16px |
| Small/Caption | Inter | 500 | 13-14px |
| Mono (código) | JetBrains Mono | 400 | 14px |

### Border Radius System

| Token | Value | Uso |
|-------|-------|-----|
| `--radius-sm` | `6px` | Badges, inputs pequenos |
| `--radius-md` | `8px` | Botões, inputs |
| `--radius-lg` | `12px` | Cards pequenos |
| `--radius-xl` | `16px` | Cards médios |
| `--radius-2xl` | `20px` | Cards grandes, modais |
| `--radius-3xl` | `28px` | Hero sections, imagens destaque |
| `--radius-full` | `9999px` | Avatares, pills, badges |

### Shadows (Elevation System)

| Nível | Shadow | Uso |
|-------|--------|-----|
| 0 | none | Flat elements |
| 1 | `0 1px 3px rgba(0,0,0,0.12)` | Cards estáticos |
| 2 | `0 4px 16px rgba(0,0,0,0.16)` | Cards hover |
| 3 | `0 8px 32px rgba(0,0,0,0.24)` | Modais, dropdowns |
| 4 | `0 16px 48px rgba(0,0,0,0.32)` | Hero mockups |
| Glow | `0 0 30px rgba(61,252,164,0.3)` | CTAs primários hover |

---

## 📋 Inventário Atual

| Métrica | Valor |
|---------|-------|
| Total páginas | **65** (42 dashboard + 8 auth + 7 institutional + 3 legal + 5 utility) |
| Total componentes | **110** em **24** pastas |
| Landing sections | **8** (Navbar, Hero, Features, HowItWorks, Pricing, Testimonials, CTA, Footer) |
| Dashboard pages | **42** |
| Layouts | **10** |
| Ícones PWA | **21** arquivos |

---

## 🏗️ Fases do Redesign

### Fase 1 — Foundation (Semana 1) ⭐ PRIORIDADE
> Design System + Assets + Performance Base

| # | Item | Arquivo(s) | Tempo |
|---|------|-----------|-------|
| 1.1 | Design Tokens CSS atualizado | `globals.css` | 2h |
| 1.2 | Favicon SVG master + todos os tamanhos | `public/favicons/` | 1h |
| 1.3 | OG Image template (1200×630) | `public/og/` | 2h |
| 1.4 | OG Images por página (landing, blog, dashboard) | `public/og/` | 3h |
| 1.5 | Componente `<Image>` wrapper com placeholder blur | `src/components/ui/optimized-image.tsx` | 1h |
| 1.6 | Skeleton system universal | `src/components/ui/skeleton-v2.tsx` | 2h |
| 1.7 | Button system (variants, sizes, loading) | `src/components/ui/button.tsx` | 2h |
| 1.8 | Card system (glass, elevated, outline) | `src/components/ui/card.tsx` | 2h |
| 1.9 | Input system (com label float, error states) | `src/components/ui/input.tsx` | 2h |
| 1.10 | Badge system (status, plan, xp) | `src/components/ui/badge.tsx` | 1h |

### Fase 2 — Landing Page (Semana 2)
> A vitrine do produto — deve impressionar em 3 segundos

| # | Item | Arquivo(s) | Tempo |
|---|------|-----------|-------|
| 2.1 | Hero redesign (video bg + mockup 3D) | `hero.tsx` | 4h |
| 2.2 | Navbar glassmorphism + mobile drawer | `navbar.tsx` | 3h |
| 2.3 | Features com ícones animados + hover effects | `features.tsx` | 3h |
| 2.4 | How It Works — timeline interativa | `how-it-works.tsx` | 3h |
| 2.5 | Pricing — cards com glow + toggle mensal/anual | `pricing.tsx` | 3h |
| 2.6 | Testimonials — carousel + avatares | `testimonials.tsx` | 2h |
| 2.7 | CTA final — impactante com stats | `cta-section.tsx` | 2h |
| 2.8 | Footer redesign | `footer.tsx` | 1h |

### Fase 3 — Auth & Onboarding (Semana 3)
> Primeira impressão depois do marketing

| # | Item | Arquivo(s) | Tempo |
|---|------|-----------|-------|
| 3.1 | Login page — split screen (visual + form) | `(auth)/login/page.tsx` | 3h |
| 3.2 | Register page — stepper visual | `(auth)/register/page.tsx` | 3h |
| 3.3 | Forgot/Reset password | `(auth)/forgot-password/` | 2h |
| 3.4 | Verify email — animated check | `(auth)/verify-email/` | 1h |
| 3.5 | Onboarding wizard redesign | `onboarding-wizard.tsx` | 4h |

### Fase 4 — Dashboard Shell (Semana 4)
> Layout base que envolve tudo

| # | Item | Arquivo(s) | Tempo |
|---|------|-----------|-------|
| 4.1 | Sidebar premium (collapsible + icons) | `layout/sidebar.tsx` | 4h |
| 4.2 | Header com search + notifications | `layout/header.tsx` | 3h |
| 4.3 | Mobile bottom nav (5 items) | `layout/mobile-nav.tsx` | 3h |
| 4.4 | Dashboard home KPIs redesign | `dashboard/page.tsx` | 4h |
| 4.5 | Charts system (Recharts + custom theme) | `charts/` | 4h |

### Fase 5 — Core Pages (Semanas 5-6)
> Páginas mais usadas do dia-a-dia

| # | Item | Arquivo(s) | Tempo |
|---|------|-----------|-------|
| 5.1 | Lista de alunos — cards com avatar | `students/` | 3h |
| 5.2 | Detalhe do aluno — tabs + evolução | `students/[id]/` | 4h |
| 5.3 | Lista de treinos — visual | `workouts/` | 3h |
| 5.4 | Detalhe do treino — player | `workouts/[id]/` | 4h |
| 5.5 | Avaliações — wizard + resultados visuais | `assessments/` | 4h |
| 5.6 | Financeiro — dashboard com charts | `financial/` | 4h |

### Fase 6 — Payment & Premium (Semana 7)
> Telas de pagamento devem ser confiáveis e bonitas

| # | Item | Arquivo(s) | Tempo |
|---|------|-----------|-------|
| 6.1 | Payment page redesign | `payments/` | 4h |
| 6.2 | Invoice/receipt view | `payments/invoices/` | 2h |
| 6.3 | Subscription management | `settings/subscription/` | 3h |
| 6.4 | Plan upgrade flow | componente novo | 3h |

### Fase 7 — Polish & Performance (Semana 8)
> Core Web Vitals e micro-interações

| # | Item | Impacto | Tempo |
|---|------|---------|-------|
| 7.1 | LCP: preload fonts + critical CSS | LCP < 1.2s | 2h |
| 7.2 | CLS: skeleton dimensions match real | CLS < 0.05 | 3h |
| 7.3 | INP: debounce handlers + `startTransition` | INP < 200ms | 3h |
| 7.4 | Bundle analysis + code splitting | JS < 150KB | 4h |
| 7.5 | Image optimization (WebP + blur placeholders) | 50% menos bytes | 3h |
| 7.6 | Micro-animações (Framer Motion) | UX premium | 4h |
| 7.7 | Haptic feedback (vibrate API) | Mobile UX | 1h |

---

## 📊 Metas de Performance (Core Web Vitals)

| Métrica | Meta | Atual (estimado) |
|---------|------|-------------------|
| **LCP** (Largest Contentful Paint) | < 1.2s | ~2.5s (video hero) |
| **FID/INP** (Interaction to Next Paint) | < 100ms | ~150ms |
| **CLS** (Cumulative Layout Shift) | < 0.05 | ~0.15 |
| **FCP** (First Contentful Paint) | < 0.8s | ~1.2s |
| **TTFB** (Time to First Byte) | < 200ms | ~100ms (CF Edge) |
| **TBT** (Total Blocking Time) | < 150ms | ~300ms |
| **Bundle JS** (initial) | < 150KB gzip | ~200KB |

### Técnicas de Performance

1. **Font**: `Inter` já usa `display: swap` + `next/font` ✅
2. **Images**: Converter tudo para WebP, usar `blur` placeholder
3. **Video Hero**: Lazy load, poster image como LCP, `preload="none"` → carregar após idle
4. **Code Splitting**: `dynamic()` para charts, modais, componentes pesados
5. **CSS**: Purge agressivo com Tailwind v4 (já built-in)
6. **Preload**: `<link rel="preload">` para hero image/font
7. **Service Worker**: Cache first para assets estáticos
8. **Skeleton CLS**: Cada skeleton deve ter EXATAMENTE as mesmas dimensões do conteúdo real

---

## 🗂️ Estrutura de Assets Necessária

```
public/
├── favicons/               ← NOVO (organizado)
│   ├── favicon.svg         ← Source SVG
│   ├── favicon.ico         ← 16+32 multi-size
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── favicon-48.png
│   ├── favicon-96.png
│   ├── apple-touch-icon.png (180×180)
│   └── android-chrome-512.png
├── og/                     ← NOVO
│   ├── og-default.png      (1200×630)
│   ├── og-blog.png
│   ├── og-login.png
│   ├── og-pricing.png
│   └── og-dashboard.png
├── images/                 ← NOVO
│   ├── hero-poster.webp    (LCP image)
│   ├── mockup-dashboard.webp
│   ├── mockup-mobile.webp
│   └── patterns/
│       ├── grid.svg
│       └── dots.svg
└── icons/                  ← Existente (PWA)
    └── ...
```

---

## 🧩 Componentes Novos Necessários

| Componente | Tipo | Prioridade |
|-----------|------|:----------:|
| `OptimizedImage` | UI base | 🔴 P0 |
| `GlassCard` | UI base | 🔴 P0 |
| `AnimatedButton` | UI base | 🔴 P0 |
| `FloatingInput` | UI base | 🔴 P0 |
| `StatusBadge` | UI base | 🟡 P1 |
| `AvatarGroup` | UI base | 🟡 P1 |
| `StatsCard` (novo design) | Dashboard | 🟡 P1 |
| `ChartCard` | Dashboard | 🟡 P1 |
| `EmptyState` (novo design) | Dashboard | 🟡 P1 |
| `PricingCard` | Landing | 🟡 P1 |
| `FeatureCard` | Landing | 🟡 P1 |
| `TestimonialCard` | Landing | 🟡 P1 |
| `TimelineStep` | Landing | 🟢 P2 |
| `PaymentMethodCard` | Payments | 🟢 P2 |
| `InvoicePreview` | Payments | 🟢 P2 |
| `OnboardingStep` | Auth | 🟢 P2 |
| `SplitAuthLayout` | Auth | 🟢 P2 |

---

## ✅ Checklist Pré-Redesign

- [x] Inventário completo de páginas (65)
- [x] Inventário de componentes (110)
- [x] Design tokens atuais documentados
- [x] Paleta de cores definida
- [x] Tipografia definida
- [x] Estrutura de assets planejada
- [ ] Favicon SVG master criado
- [ ] OG Image template criado
- [ ] Componentes base (Button, Card, Input) redesenhados
- [ ] Hero landing redesenhado
- [ ] Dashboard shell redesenhado

---

## 📅 Timeline Estimada

| Semana | Fase | Entrega |
|:------:|------|---------|
| 1 | Foundation | Design tokens + assets + componentes base |
| 2 | Landing | Todas as 8 seções redesenhadas |
| 3 | Auth | Login/Register/Onboarding |
| 4 | Dashboard Shell | Sidebar + Header + Home KPIs |
| 5-6 | Core Pages | Alunos, Treinos, Avaliações, Financeiro |
| 7 | Payments | Telas de pagamento premium |
| 8 | Polish | Performance + micro-animações |

**Total estimado: ~8 semanas (1 dev focado)**
**Com parallelismo: ~5 semanas**

---

## 🎨 Referências de Estilo

As imagens enviadas mostram uma direção clara:

1. **WinTrack** — Dark mode com acentos roxo/verde, cards arredondados, hierarchy visual forte
2. **LunaFit** — Tipografia bold condensada, preto/amarelo, seções com contraste alto
3. **FitGuide** — Cores neon sobre dark, UI Kit organizado com layers
4. **Red Fitness App** — Light mode com vermelho, goals selection, bottom nav
5. **Text-to-Speech App** — Glassmorphism, purple gradients, bottom sheet modals

**Nossa direção:** Mix de WinTrack (dark mode + organização) + LunaFit (tipografia impactante) com nossa identidade verde/mint, mantendo glassmorphism e micro-animações.

---

*Documento vivo — atualizar conforme avança cada fase.*
