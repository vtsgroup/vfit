# 📐 Design Tokens — VFIT Redesign

> Referência rápida de todos os tokens do design system.
> Fonte da verdade: `src/app/globals.css` → `@theme {}`

---

## Cores

### Brand
```
#22E6A8  — brand-primary (CTA, links)
#16D49A  — brand-primary-hover
#3DFCA4  — brand-accent (glow, IA sparkle)
#A6FF4D  — brand-lime (gradients, charts)
#0B6B4E  — brand-deep (sidebar, badge bg)
```

### Surfaces (Dark Mode — Padrão)
```
#09090B  — bg-primary (fundo principal)
#111113  — bg-secondary (cards)
#18181B  — bg-tertiary (dropdowns)
#1E1E22  — bg-elevated (hover cards)
#27272A  — bg-input (inputs dark)
```

### Surfaces (Light Mode)
```
#FFFFFF  — bg-primary
#F8FAF9  — bg-secondary
#F1F6F3  — bg-tertiary
#E4EDE8  — bg-elevated
#D4DDD8  — bg-input
```

### Text
```
#FAFAFA  — text-primary (dark mode)
#A1A1AA  — text-secondary (dark mode)
#71717A  — text-muted (ambos)
#09090B  — text-primary (light mode)
#52525B  — text-secondary (light mode)
```

### Status
```
#10B981  — success (verde)
#F59E0B  — warning (amarelo)
#EF4444  — error (vermelho)
#3B82F6  — info (azul)
#8B5CF6  — purple (gamification)
#EC4899  — pink (destaque feminino)
```

### Glass
```
rgba(17, 17, 19, 0.7)      — glass-bg
rgba(17, 17, 19, 0.4)      — glass-bg-light
rgba(255, 255, 255, 0.08)  — glass-border
rgba(255, 255, 255, 0.05)  — glass-border-light
```

---

## Tipografia

| Token | Font | Weight | Tamanho | Line Height |
|-------|------|--------|---------|-------------|
| `display-xl` | Inter | 900 | 72-88px | 0.92 |
| `display` | Inter | 800 | 48-56px | 0.95 |
| `h1` | Inter | 700 | 36-40px | 1.1 |
| `h2` | Inter | 700 | 28-32px | 1.15 |
| `h3` | Inter | 600 | 22-24px | 1.2 |
| `h4` | Inter | 600 | 18-20px | 1.3 |
| `body-lg` | Inter | 400 | 18px | 1.6 |
| `body` | Inter | 400 | 16px | 1.5 |
| `body-sm` | Inter | 400 | 14px | 1.5 |
| `caption` | Inter | 500 | 13px | 1.4 |
| `overline` | Inter | 600 | 12px | 1.2 |
| `mono` | JetBrains Mono | 400 | 14px | 1.5 |

---

## Espaçamento

Baseado em escala 4px:

| Token | Value |
|-------|-------|
| `space-0` | 0px |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |

---

## Border Radius

| Token | Value | Uso |
|-------|-------|-----|
| `radius-xs` | 4px | Micro elements |
| `radius-sm` | 6px | Badges, small inputs |
| `radius-md` | 8px | Buttons, inputs |
| `radius-lg` | 12px | Cards pequenos |
| `radius-xl` | 16px | Cards médios, modais |
| `radius-2xl` | 20px | Cards grandes |
| `radius-3xl` | 28px | Sections, hero |
| `radius-full` | 9999px | Pills, avatares |

---

## Shadows (Elevation)

| Level | Value | Uso |
|-------|-------|-----|
| `shadow-0` | none | Flat |
| `shadow-1` | `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)` | Cards |
| `shadow-2` | `0 4px 16px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.06)` | Cards hover |
| `shadow-3` | `0 8px 32px rgba(0,0,0,0.24)` | Modais, dropdowns |
| `shadow-4` | `0 16px 48px rgba(0,0,0,0.32)` | Overlays |
| `shadow-glow` | `0 0 30px rgba(61,252,164,0.3), 0 0 60px rgba(61,252,164,0.1)` | CTA glow |
| `shadow-glass` | `0 8px 32px rgba(0,0,0,0.3)` | Glass panels |

---

## Animações

| Token | Duration | Easing | Uso |
|-------|----------|--------|-----|
| `fade-in` | 300ms | ease-out | Entrada genérica |
| `slide-up` | 300ms | ease-out | Modais, cards |
| `blur-in` | 800ms | ease-out | Hero, títulos |
| `scale-in` | 500ms | spring | Badges, CTAs |
| `shimmer` | 2000ms | linear (loop) | Skeletons |
| `glow-pulse` | 4000ms | ease-in-out (loop) | Destaques |
| `float` | 6000ms | ease-in-out (loop) | Decorativos |

### Transições padrão
```css
/* Interações rápidas (hover, focus) */
transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

/* Mudanças de estado */
transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

/* Animações dramáticas */
transition: all 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## Breakpoints

| Token | Value | Dispositivo |
|-------|-------|-------------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / Desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

---

## Z-Index Scale

| Token | Value | Uso |
|-------|-------|-----|
| `z-base` | 0 | Conteúdo normal |
| `z-above` | 10 | Cards hover |
| `z-dropdown` | 20 | Dropdowns |
| `z-sticky` | 30 | Headers fixos |
| `z-overlay` | 40 | Overlays |
| `z-modal` | 50 | Modais |
| `z-toast` | 60 | Toasts |
| `z-max` | 100 | Loading bars |
