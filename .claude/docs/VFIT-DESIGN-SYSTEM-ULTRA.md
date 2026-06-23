# VFIT Design System — Ultramoderno 2026

> **Version:** 1.0.0 · **Date:** 2026-06-23
> **Inspiration:** Stripe, Vercel, Figma, Framer
> **Style:** Minimalist · Glassmorphism · Dark-First

---

## 🎨 Color Tokens

### Primary Brand
- **Primary:** `#3AB54A` (Green — WCAG AA 4.5:1 on white, 3:1 on dark)
- **Primary Light:** `#4EC959` (Lighter variant for hover/active)
- **Primary Dark:** `#2A8A38` (Darker variant for deep surfaces)

### Semantic Grayscale (Dark Mode)
- **Surface 0** (Deepest): `#0A0E14` (Nearly black)
- **Surface 1**: `#121820` (Base background)
- **Surface 2**: `#1B2230` (Elevated surface)
- **Surface 3**: `#242E3D` (Cards, panels)
- **Text Primary**: `#F5F5F5` (White-ish)
- **Text Secondary**: `#A0A8B5` (Gray-400)
- **Text Tertiary**: `#6B7580` (Gray-600)

### Functional Colors
- **Success:** `#10B981` (Green, similar to primary)
- **Warning:** `#F59E0B` (Amber)
- **Error:** `#EF4444` (Red)
- **Info:** `#3B82F6` (Blue)

### Glass Effect Overlay
- **Glass Primary:** `rgba(58, 181, 74, 0.08)` (Green tint)
- **Glass Neutral:** `rgba(255, 255, 255, 0.05)` (White tint)
- **Glass Border:** `rgba(255, 255, 255, 0.08)`

---

## 📝 Typography

### Font Stack
```css
heading:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
body:     'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
mono:     'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace
```

### Type Scale
| Level | Size | Weight | Line-Height | Letter-Spacing | Use Case |
|-------|------|--------|-------------|----------------|----------|
| **Display XL** | 3.5rem | 900 | 1.1 | -0.02em | Hero titles |
| **Display L** | 2.25rem | 800 | 1.2 | -0.01em | Page titles |
| **Heading XL** | 1.875rem | 700 | 1.2 | 0 | Section titles |
| **Heading L** | 1.5rem | 700 | 1.3 | 0 | Subsection titles |
| **Heading M** | 1.125rem | 600 | 1.4 | 0 | Smaller headings |
| **Body L** | 1rem | 400 | 1.6 | 0 | Primary body text |
| **Body M** | 0.9375rem | 400 | 1.6 | 0 | Secondary body text |
| **Label L** | 0.875rem | 600 | 1.4 | 0.025em | Labels, buttons |
| **Label S** | 0.75rem | 700 | 1.4 | 0.05em | Micro labels |
| **Mono** | 0.875rem | 500 | 1.5 | 0 | Code, hints |

---

## 🧩 Component Design Patterns

### Button Variants

#### 1. **Primary Hero CTA** (Glassmorphism)
```
Style: Glass + Border + Glow
Background: rgba(58, 181, 74, 0.12) with gradient overlay
Border: 1px solid rgba(58, 181, 74, 0.3)
Text: "Começar Grátis" → #F5F5F5 (bold)
Padding: 12px 28px (44px min height)
Border-radius: 16px
Box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 16px rgba(58,181,74,0.15)
Hover: 
  - Background: rgba(58, 181, 74, 0.18)
  - Scale: 1.02
  - Glow: 0 12px 24px rgba(58,181,74,0.2)
Active:
  - Scale: 0.98
  - Background: rgba(58, 181, 74, 0.24)
```

#### 2. **Secondary Button**
```
Style: Subtle glass, no glow
Background: rgba(255, 255, 255, 0.04)
Border: 1px solid rgba(255, 255, 255, 0.08)
Text: #A0A8B5
Padding: 10px 24px (40px min height)
Border-radius: 12px
Hover:
  - Background: rgba(255, 255, 255, 0.08)
  - Border: rgba(255, 255, 255, 0.12)
  - Text: #F5F5F5
```

#### 3. **Text Link** (Minimal)
```
Text: #3AB54A
Underline: None (underline on hover)
Hover: Underline + lighter glow
Active: Darker green
```

### Input Fields
```
Style: Subtle glass
Background: rgba(255, 255, 255, 0.04)
Border: 1px solid rgba(255, 255, 255, 0.08)
Padding: 12px 16px (44px min height)
Border-radius: 12px
Text: #F5F5F5
Placeholder: #6B7580
Focus:
  - Border: 2px solid #3AB54A
  - Box-shadow: 0 0 0 3px rgba(58, 181, 74, 0.1)
  - Background: rgba(255, 255, 255, 0.06)
```

### Card / Elevated Surface
```
Style: Glassmorphism + subtle shadow
Background: rgba(255, 255, 255, 0.04)
Border: 1px solid rgba(255, 255, 255, 0.08)
Backdrop-filter: blur(8px)
Box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24), inset 0 1px 1px rgba(255,255,255,0.1)
Border-radius: 20px
Padding: 24px
Hover: Slight scale (1.01), enhanced glow
```

---

## ✨ Animation Tokens

### Timing
- **Micro:** 150ms (button press, toggle, simple state change)
- **Quick:** 200ms (modal entrance, card reveal)
- **Smooth:** 300ms (page transition, expansion)
- **Slow:** 400ms+ (hero animation, parallax)

### Easing
- **In:** `cubic-bezier(0.4, 0, 1, 1)` (ease-in)
- **Out:** `cubic-bezier(0, 0, 0.2, 1)` (ease-out)
- **InOut:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- **Spring:** `cubic-bezier(0.175, 0.885, 0.32, 1.275)` (bouncy)

### Common Transitions
```css
/* Smooth fade-in on page load */
@keyframes blur-in {
  from {
    opacity: 0;
    filter: blur(4px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}
animation: blur-in 400ms ease-out;

/* Subtle scale-in for cards */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
animation: scale-in 300ms ease-out 50ms backwards;

/* Smooth slide-up from below */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
animation: slide-up 300ms ease-out;

/* Loading pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
animation: pulse 2s ease-in-out infinite;

/* Glow effect (button hover) */
@keyframes glow {
  from {
    box-shadow: 0 0 0 0 rgba(58, 181, 74, 0.4);
  }
  to {
    box-shadow: 0 0 0 8px rgba(58, 181, 74, 0);
  }
}
animation: glow 1.5s ease-out infinite;
```

---

## 🏗️ Layout & Spacing

### Spacing Scale (4px base)
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
4xl: 96px
```

### Container Widths
- **Mobile:** 100% - 16px padding each side
- **Tablet:** 672px (md)
- **Desktop:** 1024px (lg)
- **Desktop XL:** 1280px (xl)
- **Max:** 1440px (2xl)

### Safe Areas & Gutters
- **Mobile:** 16px horizontal (both sides)
- **Tablet:** 24px horizontal
- **Desktop:** 32px horizontal (auto-center)

### Vertical Rhythm
- **Section gap:** 48px (mobile), 64px (desktop)
- **Component gap:** 16px
- **Line height:** 1.5–1.6 (body), 1.1–1.3 (heading)

---

## 🎯 Page Structure — Ultra-Modern

### Login Page Layout
```
Container: 100% mobile / 360px desktop max
Padding: 24px mobile, 32px desktop
Gap: 16px between sections

[ Logo / Header — 24px ]
[ Page Title "Entrar" — 32px ]
[ Subtitle text ]

[ Biometric Button (Passkey) ]
[ OAuth Buttons (Apple + Google) ]
[ Divider with text ]
[ Login Form ]
  - Identifier field (CPF or Email)
  - Password field (with show/hide)
  - 2FA field (conditional)
  - Turnstile (invisible)
  - Remember + Forgot password
[ Submit Button (Hero CTA) ]
[ Register Link + Trust badges ]

Animations:
- Page entry: blur-in 400ms
- Form fields: slide-up 300ms staggered (50ms each)
- Button hover: glow effect + scale
- Loading state: spinner pulse
```

### Loading Screen Layout
```
Container: Full viewport
Background: Gradient overlay (dark to darker green)

Centered Vertical Stack:
  [ Logo SVG — 80px animated scale pulse ]
  [ "Carregando..." text — fade pulse ]
  [ Progress bar (optional) — smooth fill ]

Animations:
- Logo: scale pulse 1s ease-in-out infinite
- Text: fade pulse 1.5s ease-in-out infinite
- Progress: smooth fill 0-100% (duration unknown)
```

### Homepage Hero Layout
```
Container: Full viewport / max-w-6xl centered

[ Navigation Bar — sticky top ]

Hero Section:
  Background: Gradient dark-to-darker with green tint
  Content:
    [ Tagline "30 DIAS GRÁTIS" — micro label ]
    [ Main heading — Display XL ]
    [ Subheading — Body L ]
    [ CTA Primary button + secondary ]
  
  Accent:
    [ Logo SVG — large, positioned bottom-right / top-right ]
    [ Animated shapes / glass cards ]

Section Gap: 64px

Features Grid: 3 columns
  [ Feature Card 1 ]
  [ Feature Card 2 ]
  [ Feature Card 3 ]

Animations:
- Hero title: blur-in + slide-up 400-500ms
- CTA buttons: scale-in 300ms with stagger
- Feature cards: scale-in 300ms with stagger (100ms)
- Logo: subtle float / rotation
```

---

## ♿ Accessibility Checklist

- [ ] Color contrast ≥4.5:1 (text), ≥3:1 (icons)
- [ ] All buttons have ≥44×44px touch target
- [ ] Form labels visible (not placeholder-only)
- [ ] Focus rings: 2–3px solid green, visible on dark
- [ ] Keyboard navigation: Tab order matches visual order
- [ ] Screen reader support: aria-labels, roles
- [ ] Reduced motion: `@media (prefers-reduced-motion: reduce)` disables animations
- [ ] Dark mode: designed separately, not inverted colors
- [ ] Icons: always paired with text OR aria-label
- [ ] Error messages: clear, near field, high contrast

---

## 🚀 Implementation Priority

### Phase 1 (MVP)
1. ✅ Login page redesign
2. ✅ Loading screen
3. ✅ CTA buttons (primary + secondary)

### Phase 2 (Soon)
1. Homepage hero redesign
2. Feature cards
3. Navigation bar

### Phase 3 (Polish)
1. Page transitions
2. Micro-interactions
3. Dark/light mode parity

---

## 📦 Dependencies

- `@tailwindcss/tailwindcss@4.0+` (CSS variables, backdrop-filter)
- `react` (hooks, animations)
- `next.js` (images, metadata)
- Optional: `framer-motion` (advanced animations)

---

## 🎬 Quick Design Principles

1. **Space is intentional** — every pixel has purpose
2. **Motion is meaningful** — animations guide, not distract
3. **Glass elevates** — frosted effect hints at depth
4. **Green is alive** — brand color commands attention
5. **Minimal is powerful** — remove, don't add
6. **Dark is default** — light respects users' eyes at night
7. **Touch-first** — 44×44px targets, no hover-dependent UX
8. **Fast feedback** — interactions feel instant (150ms)
