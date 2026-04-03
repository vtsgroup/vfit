# 🎨 Design System — Landing Page

> **v2.0** · Atualizado 05/03/2026 · Glass-blur professional UI

---

## 📝 Tipografia

### `headingFont` — Títulos principais (Inter 900)

```typescript
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.03em',
}
```

**Uso:** Todos os `<h2>` e `<h3>` de seção. Sempre `uppercase`.

| Elemento | Classe Tailwind | Style |
|----------|----------------|-------|
| H2 de seção (escuro) | `text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl` | `headingFont` |
| H2 de seção (claro) | `uppercase text-gray-950` + `fontSize: clamp(2rem, 5.5vw, 3.75rem)` | `headingFont` |
| H3 nome do plano | `text-[22px] font-black tracking-tight text-white` | `headingFont` |
| H3 banner interno | `text-sm font-black uppercase tracking-wider text-white` | `monoStyle` |

### `monoLabel` / `monoStyle` — Labels e etiquetas

```typescript
// Seções claras (testimonials)
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

// Seções escuras (pricing)
const monoStyle = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
}
```

**Uso:** Labels de seção (`/DEPOIMENTOS`, `Planos`), tabs, toggle, preços, botões CTA, badges `Pro`, feature lists.

---

## 🎨 Cores

### Seções Escuras (Pricing, Hero, Features)

| Token | Valor | Uso |
|-------|-------|-----|
| `bg-[#050A12]` | Background base | `<section>` |
| `brand-primary` | `#22C55E` | Destaques, botões, badges |
| `brand-accent` | `#10B981` | Gradients secundários |
| `text-white` | `#FFFFFF` | Títulos, texto principal |
| `text-text-secondary-cool` | — | Subtítulos, descrições |
| `text-text-muted-cool` | — | Labels, preços secundários |
| Grid pattern | `rgba(34,197,94,0.15)` 45deg | Background decorativo |

### Seções Claras (Testimonials)

| Token | Valor | Uso |
|-------|-------|-----|
| `bg-[#F8F8F8]` | Background base | `<section>` |
| `emerald-500` | `#10B981` | Accent (tab ativo, CTA, highlights) |
| `text-gray-950` | — | Títulos |
| `text-gray-500` | — | Subtítulos |
| `text-gray-600` | — | Corpo de texto |
| `text-gray-400` | — | Labels, roles |
| Grid pattern | `rgba(0,0,0,0.035)` reto | Background decorativo |

---

## 📐 Componentes Padrão

### Cards de Depoimento

```
w-85 (340px) / sm:w-95 (380px)
rounded-2xl
border border-gray-200/80
bg-white
p-6
shadow-[0_1px_3px_rgba(0,0,0,0.06)]
```

**Hover:**
```
hover:-translate-y-2
hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]
transition-all duration-300
cursor-pointer
```

### Avatar

```
h-12 w-12
rounded-full
bg-linear-to-br from-emerald-400 to-emerald-600
ring-2 ring-emerald-500/20
```

Fallback: iniciais do nome em bold branco sobre gradiente emerald.

### Pill Tabs

```
Container: rounded-full border border-gray-200 bg-white p-1 shadow-sm
Tab ativo: bg-emerald-500 text-white shadow-md rounded-full
Tab inativo: text-gray-500 hover:text-gray-900
Tipografia: monoLabel · text-[11px]
```

### Botões 3D (Pricing)

```
Popular: bg-brand-primary text-bg-base
  shadow-[0_4px_0_0_#166534,0_6px_16px_rgba(0,0,0,0.3)]
  hover: -translate-y-0.5 + shadow expandido
  active: translate-y-0.5 + shadow comprimido

Normal: border border-brand-primary/30 bg-brand-primary/10
  group-hover: transforma em bg-brand-primary solid
```

### Botões 3D — Sistema Unificado (v2.0)

**Padrão aplicado em:** Navbar, Hero, CTA sections, futuramente Login/Register

#### Botão Primário (CTA verde)
```
rounded-xl bg-brand-primary px-5 py-2 text-[13px] font-black tracking-wide text-[#050A12] uppercase
shadow-[0_4px_0_0_#166534,0_6px_16px_rgba(0,0,0,0.3)]
hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#166534,0_10px_24px_rgba(34,197,94,0.2)]
active:translate-y-0.5 active:shadow-[0_2px_0_0_#166534,0_3px_8px_rgba(0,0,0,0.3)]
font-family: monospace
```

#### Botão Secundário 3D (ghost sem borda)
```
rounded-xl bg-white/6 px-5 py-2 text-[13px] font-black tracking-wide text-white/80 uppercase
shadow-[0_3px_0_0_rgba(255,255,255,0.06),0_4px_12px_rgba(0,0,0,0.3)]
hover:-translate-y-0.5 hover:bg-white/10 hover:text-white
hover:shadow-[0_5px_0_0_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.35)]
active:translate-y-0.5 active:shadow-[0_1px_0_0_rgba(255,255,255,0.06),0_2px_6px_rgba(0,0,0,0.3)]
font-family: monospace
```

**❌ NUNCA:** border em botões secundários da home/LP
**✅ SEMPRE:** efeito 3D via shadow + translate-y em ambos botões

#### Botão Demo (hero) — com backdrop-blur
```
Mesmo que secundário 3D + backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)_saturate(180%)]
```

### Navbar Header — Glass Effect (v2.0)

**Desde scroll 0 (topo):**
```
bg-[#070D17]/25 backdrop-blur-xl border-b border-white/4
```

**Ao rolar (scrolled):**
```
bg-[#070D17]/80 backdrop-blur-2xl border-b border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]
```

**❌ NUNCA:** `bg-transparent` no header (sempre ter blur + tint)
**✅ SEMPRE:** transição suave entre os estados

### Dropdown Menus — Glass Blur (v2.0)

**Container:**
```
rounded-2xl border border-white/6 bg-[#0A1628]/30
backdrop-blur-2xl [-webkit-backdrop-filter:blur(40px)_saturate(180%)]
shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)_inset]
```

**Ícones:** Lucide React (strokeWidth 1.8) — **NUNCA emojis**
```
Container do ícone: h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/8
Hover: bg-brand-primary/10 ring-brand-primary/20
Ícone: h-4 w-4 text-white/50 → hover: text-brand-primary
```

**Item do menu:**
```
flex items-start gap-3 rounded-xl px-3.5 py-3
hover:bg-white/6
Label: text-[13px] font-semibold tracking-wide text-white/85
Desc: text-[11px] text-white/30 font-normal
```

**Mobile drawer:** Mesmo glass-blur + ícones Lucide inline (h-3.5 w-3.5)

---

## 🎬 Animações

### Marquee (Testimonials)

```css
@keyframes testimonialMarquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

- **Duração:** 50s linear infinite
- **Hover:** `animationPlayState: 'paused'` (cards param ao passar mouse)
- **Troca de tab:** `key={activeTab}` remonta o div → reinicia animação
- **Técnica:** Array duplicado (`[...data, ...data]`) para loop contínuo

### IntersectionReveal

- `blur-in` — headings de pricing
- `fade-in` — labels, subtítulos, tabs, CTA
- `scale-in` — cards de plano (com delay escalonado `i * 80`)
- `slide-up` — cards de testimonial

---

## 🔲 Dividers

### Entre seções escura → clara

```html
<div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-300" />
```

- Sólido, sem gradiente, sem transparência
- Posicionado `absolute top-0` dentro da seção clara
- Cor `bg-gray-300` para contraste sutil

### Grid Patterns

| Seção | Pattern | Size |
|-------|---------|------|
| Escura (Pricing) | `45deg cross-hatch rgba(34,197,94,0.15)` | `128px` |
| Clara (Testimonials) | `reto grid rgba(0,0,0,0.035)` | `80px` |

---

## 🏗️ Glassmorphism (Pricing Banners)

```typescript
const forcedGlassStyle = {
  backdropFilter: 'blur(22px) saturate(1.45)',
  WebkitBackdropFilter: 'blur(22px) saturate(1.45)',
}
```

- Dual-layer: elemento base + pseudo-layer com `backdrop-blur-[18px]`
- Inner ring: `ring-1 ring-inset ring-white/14`
- Gradient overlay: `bg-linear-to-br from-brand-primary/16 via-white/5 to-brand-accent/9`
- Circuit SVG decoration com opacidade `0.08-0.12`

---

## 📋 Checklist para Novas Seções

- [ ] Usar `headingFont` para H2/H3 de seção
- [ ] Usar `monoLabel`/`monoStyle` para labels e tags
- [ ] Grid pattern no background (respeitando claro/escuro)
- [ ] `IntersectionReveal` com animação apropriada
- [ ] Hover states com `transition-all duration-300`
- [ ] Cards: `rounded-2xl` + sombra sutil + hover lift
- [ ] Manter palette: emerald (claro) / brand-primary (escuro)
- [ ] Dividers sólidos entre seções de contraste
- [ ] **Botões 3D:** primário verde + secundário ghost (sem borda)
- [ ] **Ícones:** Lucide React — NUNCA emojis
- [ ] **Menus/Dropdowns:** glass-blur (`bg-[#0A1628]/30 backdrop-blur-2xl`)
- [ ] **Header:** glass-blur desde scroll 0 (nunca `bg-transparent`)

---

## 📦 Arquivos de Referência

| Componente | Arquivo |
|-----------|---------|
| **Navbar (glass-blur + Lucide)** | `src/components/landing/navbar.tsx` |
| Testimonials (light) | `src/components/landing/how-it-works-v2.tsx` |
| Pricing (dark) | `src/components/landing/pricing-koyeb.tsx` |
| Hero | `src/components/landing/hero.tsx` |
| Features | `src/components/landing/features.tsx` |
| HowItWorks | `src/components/landing/how-it-works.tsx` |
| Barrel exports | `src/components/landing/index.ts` |
| Analytics | `src/lib/landing-analytics.ts` |
| **Design System (este doc)** | `docs/DESIGN-SYSTEM-LP.md` |
