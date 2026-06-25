# VFIT Ultra-Modern Design System v1.0
> SaaS Fitness + AI | Minimalismo + Glassmorphism | WCAG AA Compliant

---

## 🎨 Color System

### Primary Palette (Dark-First)
```
Background:
  - bg-base: #0f1117 (deep navy, slightly warmer than pure black)
  - bg-surface: #161b22 (elevated surfaces, cards)
  - bg-surface-light: #1d2229 (secondary surfaces, hover states)

Brand (Teal-Green):
  - primary-500: #0EA38A (main CTA, actions)
  - primary-400: #16B59F (hover, secondary)
  - primary-300: #2EC9B6 (light, focus states)

Semantic:
  - success-500: #10B981
  - warning-500: #F59E0B
  - error-500: #EF4444
  - neutral-200: #E5E7EB (text on dark)
  - neutral-400: #9CA3AF (secondary text)
  - neutral-600: #4B5563 (borders, dividers)
```

### Glass Layer System
```
Glass-1 (hero, modals):    backdrop-blur-xl, rgba(22, 27, 34, 0.45)
Glass-2 (cards, sections): backdrop-blur-lg, rgba(22, 27, 34, 0.35)
Glass-3 (elements):        backdrop-blur-md, rgba(22, 27, 34, 0.2)
```

---

## 🔤 Typography System

### Font Stack
```
Headlines: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Body:      "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Mono:      "Fira Code", "Courier New", monospace
```

### Scale (8pt grid)
```
Display 1: 48px / 1.1  / 600 weight  → hero headlines
Display 2: 40px / 1.15 / 600 weight  → section titles
Headline:  32px / 1.2  / 600 weight  → major sections
Title 1:   24px / 1.3  / 600 weight  → cards, modals
Title 2:   20px / 1.4  / 500 weight  → subtitles
Body lg:   16px / 1.5  / 400 weight  → primary body text
Body md:   14px / 1.5  / 400 weight  → secondary body
Label:     12px / 1.4  / 500 weight  → badges, hints
Caption:   11px / 1.4  / 400 weight  → small text
```

### Weight Strategy
- **600**: Headlines (primary visual hierarchy)
- **500**: Subheads, labels, emphasis
- **400**: Body, descriptive text

---

## 🎯 Component System

### Buttons (Touch target: ≥44×44pt)

#### Primary CTA
```
Idle:     bg-primary-500, text-white, h-11 (44px), px-6, radius-full
Hover:    bg-primary-400, shadow-lg blur-glass
Pressed:  scale-0.95, bg-primary-600
Disabled: opacity-50, cursor-not-allowed
```

#### Secondary
```
Idle:     bg-neutral-800/60 (glass-3), text-neutral-200, border-1 border-neutral-600
Hover:    bg-neutral-700/80, border-neutral-500
Focus:    ring-2 ring-primary-500 ring-offset-2 ring-offset-bg-base
```

#### Ghost (Minimal)
```
Idle:     text-neutral-200, no-fill
Hover:    text-primary-400, bg-primary-500/10
Focus:    outline-2 outline-primary-500
```

### Cards & Surfaces
```
Glass Card:
  - bg: glass-2 (backdrop-blur-lg, rgba(..., 0.35))
  - border: 1px solid rgba(255,255,255, 0.1)
  - shadow: 0 8px 32px rgba(0,0,0,0.1)
  - radius: 16px (8pt grid ÷ 2)
  - padding: 24px (3×8pt)

Hover State:
  - shadow: 0 16px 48px rgba(0,0,0,0.15)
  - border: 1px solid rgba(255,255,255, 0.15)
  - translate: -2px (subtle lift)
```

### Inputs & Forms
```
Input Field:
  - h-11 (44px, touch-friendly)
  - bg: glass-3 + border (neutral-600)
  - focus: ring-2 ring-primary-500, shadow-focus
  - label: body-md, font-500, above input
  - helper-text: caption, neutral-400

Validation:
  - Success: ring-2 ring-success-500, checkmark icon
  - Error: ring-2 ring-error-500, error message below
  - Disabled: opacity-50, cursor-not-allowed
```

---

## 📐 Spacing & Layout

### Spacing Scale (8pt increments)
```
xs:  4px    (micro-spacing, gaps)
sm:  8px    (component gaps, small padding)
md:  16px   (default padding, section gaps)
lg:  24px   (section padding, major gaps)
xl:  32px   (hero padding, large sections)
2xl: 48px   (vertical rhythm, major sections)
3xl: 64px   (hero spacing, top-level)
```

### Responsive Breakpoints
```
mobile:  375px  (smallest iPhone)
tablet:  768px  (iPad min)
desktop: 1024px (desktop min)
widescreen: 1280px
ultra:   1920px
```

### Grid & Container
```
max-width: 1280px (content container, desktop)
Content gutters:
  - mobile:  16px (sm)
  - tablet:  24px (lg)
  - desktop: 32px (xl)

Grid:
  - 4 columns mobile
  - 8 columns tablet
  - 12 columns desktop
```

---

## ✨ Effects & Motion

### Shadows
```
shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
shadow-md:  0 4px 6px rgba(0,0,0,0.1)
shadow-lg:  0 8px 16px rgba(0,0,0,0.15)  [default card]
shadow-xl:  0 16px 32px rgba(0,0,0,0.2)
shadow-2xl: 0 24px 48px rgba(0,0,0,0.3)  [hero, modals]
```

### Blur Effects (Glassmorphism)
```
blur-sm:  blur(4px)   [subtle background]
blur-md:  blur(8px)   [card backgrounds]
blur-lg:  blur(12px)  [modal, overlay]
blur-xl:  blur(16px)  [hero, hero-text]
```

### Border Radius
```
rounded-sm:  4px   (mini, badges)
rounded-md:  8px   (inputs, small elements)
rounded-lg:  12px  (default, components)
rounded-xl:  16px  (cards, larger elements)
rounded-2xl: 20px  (hero, major surfaces)
rounded-full: 9999px (pills, full-width rounded)
```

### Animation Tokens
```
Duration:
  - fast:   150ms   (micro-interactions)
  - normal: 300ms   (standard transitions)
  - slow:   500ms   (complex animations)

Easing:
  - ease-in-out-cubic: cubic-bezier(0.4, 0, 0.2, 1)
  - ease-out-cubic:    cubic-bezier(0, 0, 0.2, 1)
  - ease-spring:       cubic-bezier(0.17, 0.67, 0.83, 1)

Common Patterns:
  - Fade in:  opacity 0→1, 300ms ease-out
  - Scale in: transform scale(0.95)→1, 300ms ease-out-cubic
  - Slide up: transform translateY(8px)→0, 300ms ease-out-cubic
  - Hover:    scale(1.02), 200ms ease-out
```

---

## 🎬 Hero Section (Above the Fold)

### Layout
```
Hero container:
  - Full viewport (min-height: 100dvh)
  - Gradient background: bg-base → subtle teal tint (5% opacity primary)
  - Flexbox, centered, space-between

Headline:
  - Display 1 (48px, 600w)
  - Primary + secondary accent (teal on last word)
  - Line-height 1.1, max-width 800px

Subheadline:
  - Body lg (16px, 400w)
  - neutral-400, max-width 600px
  - Below headline, 24px gap

CTA Group:
  - 2 buttons: Primary (full CTA) + Secondary (info)
  - Horizontal on desktop, stacked on mobile (16px gap)
  - Touch-friendly (44px height min)

Visual Element:
  - Abstract gradient shape (teal→primary)
  - Positioned absolute, top-right, opacity-20
  - SVG or CSS blob, no photography
```

---

## 📱 Header / Navbar

### Structure
```
Sticky top:
  - height: 64px (8×8pt grid)
  - bg: glass-1 (heavily blurred, semi-transparent)
  - border-bottom: 1px solid rgba(255,255,255, 0.1)
  - padding: 0 32px (desktop), 0 16px (mobile)

Left side:
  - Logo + brand name ("VFIT")
  - Font: Display 2, 24px, 600w
  - Color: primary-500

Center (desktop only):
  - Navigation items: 4-5 links (Plataforma, Recursos, Preços, FAQ, Contato)
  - Font: Body md, 400w, neutral-200
  - Hover: primary-400

Right side (desktop):
  - "ENTRAR" (ghost button, 40px)
  - "COMEÇAR GRÁTIS" (primary button, 44px)

Mobile:
  - Hamburger menu icon (24×24)
  - Only logo visible
  - Drawer nav on tap
```

---

## 🦶 Footer

### 2-Column Layout (Desktop), Stacked (Mobile)
```
Left Column (40% width):
  - "© 2026 VFIT. Seu personal trainer com IA."
  - Social links: icon-only (24×24), with focus rings
  - Alignment: start, top

Right Column (3 sub-columns, 20% each):
  - "Plataforma": links list (small text)
  - "Recursos": links list
  - "Legal": Privacidade, Cookies, Termos

Footer container:
  - bg: glass-1 (darker glass)
  - border-top: 1px solid rgba(255,255,255, 0.1)
  - padding: 64px 32px (desktop), 32px 16px (mobile)
  - gap: 32px (columns)
  - text: neutral-400

Link hover:
  - color: primary-400
  - underline: auto
  - duration: 200ms
```

---

## 🎯 Button Sizes (Tailwind-Mapped)

```
Extra Small (32px):  px-3, py-1, text-11px, label weight
Small (40px):        px-4, py-2, text-14px, body-md weight
Medium (44px):       px-5, py-2.5, text-16px, body-md weight [DEFAULT]
Large (48px):        px-6, py-3, text-18px, title-2 weight
Extra Large (56px):  px-8, py-3.5, text-20px, title-2 weight
```

---

## 🔐 Accessibility (WCAG AA Compliance)

### Color Contrast
```
Text on primary-500:        white (7:1 AAA)
Text on bg-base:            neutral-200 (11.5:1 AAA)
Text on bg-surface:         neutral-200 (10.2:1 AAA)
Border on neutral-600:      neutral-200 (4.8:1 AA)
Secondary text (neutral-400): only on bg-base/surface (4.6:1 AA)
```

### Interactive Elements
- **Focus ring**: 2px solid primary-500, 2px offset
- **Touch targets**: Minimum 44×44px (met by all CTAs)
- **Keyboard nav**: Tab order matches visual flow
- **Disabled state**: opacity-50 + cursor-not-allowed
- **Icons + text**: Always pair icons with text labels (no icon-only)

### Motion & Vestibular
- `prefers-reduced-motion`: Remove all keyframe animations
- Hover effects remain as color/opacity (no motion)
- No infinite animations, no rapid flashing

### Semantic HTML
- Proper heading hierarchy (h1 → h2 → h3)
- Form labels with `<label for="id">`
- ARIA roles for custom components
- Alt text for all meaningful images

---

## 🚫 Anti-Patterns (What NOT to Do)

- ❌ Emoji as navigation icons (use SVG)
- ❌ Pure #000 or #FFF (use warm neutrals instead)
- ❌ Gray-on-gray text (low contrast)
- ❌ Animations >500ms without purpose
- ❌ Multiple-background layers without clear hierarchy
- ❌ Floating buttons without context
- ❌ Cookie modals that block content (use banner instead)
- ❌ Fixed headers that overlap main content
- ❌ Hover-only interactions (mobile must have tap state)
- ❌ More than 5 nav items in header

---

## 📦 Component Library (Phase 1)

### 1. Button (4 variants)
```
- Primary (teal background, white text)
- Secondary (glass bg, border)
- Ghost (no fill, hover bg)
- Danger (red background, for destructive)
```

### 2. Card (glass style)
```
- Hover lift effect
- Subtle border & shadow
- 24px padding default
```

### 3. Input Field
```
- 44px height (touch-friendly)
- Focus ring: primary-500
- Error state support
```

### 4. Navigation (Header Nav)
```
- Sticky glass bar
- Logo + links + CTAs
- Mobile drawer fallback
```

### 5. Footer Links
```
- Icon-only social
- Multi-column layout
- Glass background
```

---

## 🎨 Figma Tokens (CSS Variable Mapping)

```css
:root {
  /* Colors */
  --color-bg-base: #0f1117;
  --color-bg-surface: #161b22;
  --color-primary-500: #0EA38A;
  --color-primary-400: #16B59F;
  --color-neutral-200: #E5E7EB;
  --color-neutral-400: #9CA3AF;

  /* Typography */
  --font-display-1: 48px / 1.1 / 600;
  --font-headline: 32px / 1.2 / 600;
  --font-body-lg: 16px / 1.5 / 400;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Effects */
  --shadow-lg: 0 8px 16px rgba(0,0,0,0.15);
  --blur-lg: blur(12px);
  --radius-lg: 12px;

  /* Animation */
  --duration-normal: 300ms;
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
}
```

---

## 📋 Implementation Checklist

- [ ] Header (sticky nav, glass style, responsive menu)
- [ ] Hero Section (headline + 2 CTAs + gradient shape)
- [ ] Button Component Library (4 variants, all sizes)
- [ ] Card Component (glass style, hover lift)
- [ ] Footer (2-col layout, links, social)
- [ ] Dark Mode CSS (all colors pre-defined, no inversion)
- [ ] Accessibility Audit (contrast, keyboard nav, ARIA)
- [ ] Responsive Tests (375px, 768px, 1024px viewports)
- [ ] Animation Performance (60fps, prefers-reduced-motion)
- [ ] Cookie Banner Redesign (slide-in, not modal blocking)
