# 9. VFIT Style Guide 2026 — Ultra-Modern Design System

**Versão:** v2.0 (modernizado)  
**Padrão:** Dark-first + Glass + Micro-animations  
**Aplicável:** Phases 2-4 + futuras features

---

## Design Foundation

### 1. Color System (Dark-First)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BACKGROUNDS (Dark Mode Primary)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Primary (Darkest)        #050a12   — Hero, app background
Secondary (Dark)         #0b1221   — Modals, cards
Tertiary (Light Dark)    #111b2e   — Hover states, inputs
Overlay (Translucent)    rgba(255,255,255,0.05) — Scrim, glass base

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEXT & SEMANTIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Primary Text             #f0f4f8   — Headings, body (17.95:1 contrast ✅ AAA)
Secondary Text           #94a3b8   — Meta, labels (7.74:1 ✅ AAA)
Muted Text               #64748b   — Placeholders (4.17:1 ⚠️ AA)
Brand Primary            #10b981   — CTAs, highlights (8.71:1 ✅ AAA)
Brand Secondary          #06b6d4   — Interactive states
Error                    #ef4444   — Destructive actions (5.27:1 ✅ AAA)
Warning                  #f59e0b   — Alerts (9.24:1 ✅ AAA)
Success                  #10b981   — Confirmations (7.82:1 ✅ AAA)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BORDERS & DIVIDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Border Light             rgba(255,255,255,0.08)  — Default
Border Medium            rgba(255,255,255,0.12)  — Hover
Border Focus             #10b981                  — Active/Focus
```

### 2. Typography (Premium Spacing)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPE SCALE (Tailwind-based)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Display (h1)   — 32-48px, bold (600), tracking tight, lh 1.2
Headline (h2)  — 24-32px, semibold (600), tracking tight, lh 1.3
Title (h3)     — 20-24px, semibold (600), lh 1.4
Subtitle (h4)  — 16-18px, medium (500), lh 1.5
Body (p)       — 14-16px, normal (400), lh 1.6
Caption        — 12-14px, normal (400), lh 1.5
Label          — 11-12px, medium (500), lh 1.4

Base font: 16px (never smaller on mobile)
Line height: min 1.5 (readability)
Tracking: Default (no tight kern on body)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FONT FAMILIES (Heroic Pairing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Display/Headings    → "Inter" (clean, modern, corporate-friendly)
Body                → "Inter" (pairing with self, consistent)
Code                → "JetBrains Mono" (for code blocks)

[Rationale: Inter is iconic 2026 choice, single-family simplicity]
```

### 3. Spacing System (8pt Grid)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPACING TOKENS (Tailwind values)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

xs    → p-1 (4px)      — Tight spacing, small components
sm    → p-2 (8px)      — Default padding, buttons
md    → p-3 (12px)     — Medium density
lg    → p-4 (16px)     — Section spacing
xl    → p-6 (24px)     — Hero spacing, container padding
2xl   → p-8 (32px)     — Hero sections, large gaps
3xl   → p-12 (48px)    — Page margins

Gap between items: use consistent scale (gap-2 = 8px, gap-4 = 16px)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE: Avoid random px values. Always scale to 4pt grid.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Component Principles (2026 Modern)

### 1. **Glassmorphism + Depth**

Every interactive surface should have:

```typescript
// Glass base
className="bg-white/5 backdrop-blur border border-white/10"

// Hover elevation
className="hover:bg-white/10 hover:shadow-lg hover:shadow-white/5"

// Focus ring (accessible)
className="focus-visible:outline-2 outline-offset-2 outline-brand-primary"
```

### 2. **Micro-Interactions (All Motion)**

```typescript
// Rule: Every state change gets 150-300ms animation

// Enter
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.2 }}

// Hover
whileHover={{ scale: 1.02, y: -2 }}

// Press
whileTap={{ scale: 0.98 }}

// Exit
exit={{ opacity: 0, scale: 0.95 }}
```

### 3. **Touch Targets (44pt minimum)**

```typescript
// ALL tappable elements
className="h-10 w-10 min-h-11 min-w-11"

// If icon is smaller, extend hit area
className="p-2" // padding extends hit area to 44pt

// Never: icon-only without padding
// ✅ <button className="p-2"><Icon size={20} /></button>
// ❌ <button><Icon size={20} /></button>
```

### 4. **Contrast Rules (WCAG AAA)**

```
Primary text    (#f0f4f8 on #050a12) = 17.95:1 ✅ AAA
Secondary text  (#94a3b8 on #050a12) = 7.74:1  ✅ AAA
Muted text      (#64748b on #050a12) = 4.17:1  ⚠️ AA (caption only!)

Brand color     (#10b981 on #050a12) = 8.71:1  ✅ AAA
Error color     (#ef4444 on #050a12) = 5.27:1  ✅ AAA

RULE: Muted only for placeholders/captions. Never for body text.
```

---

## Component Library Standards

### Buttons

```typescript
// All variants MUST exist:
<Button variant="primary" />        {/* Green CTA, default */}
<Button variant="secondary" />      {/* Gray, secondary */}
<Button variant="outline" />        {/* Border only */}
<Button variant="ghost" />          {/* Transparent, hover only */}
<Button variant="ghost-danger" />   {/* Subtle danger */}
<Button variant="danger" />         {/* Red, destructive */}

// 2026 NEW variants:
<Button variant="soft" />           {/* Subtle green: bg-green/10 text-green */}
<Button variant="gradient" />       {/* Modern: brand gradient, text-white */}
<Button variant="glass" />          {/* Modern: glass + backdrop blur */}

// Sizes
<Button size="sm" />                {/* h-8 px-3 */}
<Button size="md" />                {/* h-10 px-4, default */}
<Button size="lg" />                {/* h-12 px-6 */}
<Button size="icon" />              {/* h-10 w-10 */}
<Button size="icon-lg" />           {/* h-12 w-12, NEW */}

// States
<Button loading={true} />           {/* Spinner, disabled */}
<Button disabled />                 {/* Opacity 50%, cursor not-allowed */}
<Button ripple={false} />           {/* Optional: disable ripple */}
```

### Icons (DSIcon)

```typescript
// ALWAYS use <DSIcon> (never lucide-react direct)
<DSIcon name="bell" size={16} />
<DSIcon name="check" size={20} className="text-brand-primary" />

// Sizes (semantic)
<DSIcon name="..." size={12} />     // xs: captions
<DSIcon name="..." size={16} />     // sm: default
<DSIcon name="..." size={20} />     // md: prominent
<DSIcon name="..." size={24} />     // lg: hero icons

// Colors: use semantic tokens
<DSIcon className="text-text-primary" />      // normal
<DSIcon className="text-brand-primary" />     // highlight
<DSIcon className="text-text-muted" />        // subtle
<DSIcon className="text-error" />             // danger
```

### Cards & Surfaces

```typescript
// Modern: Glass effect
className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur p-4"

// With hover
className="group rounded-2xl border border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5 transition-all"

// With shadow
className="rounded-2xl border border-white/8 bg-white/3 shadow-lg shadow-black/20"
```

### Forms

```typescript
// Input styling
<input className="rounded-lg border border-border-light bg-bg-secondary px-4 py-2.5 text-text-primary placeholder-text-muted focus-visible:outline-2 outline-offset-2 outline-brand-primary" />

// Label + helper text
<label className="block text-sm font-medium text-text-primary">
  Label
  <input className="..." />
  <p className="mt-1 text-xs text-text-muted">Helper text</p>
</label>

// Error state
<input className="border-error focus-visible:outline-error" />
<p className="mt-1 text-xs text-error">Error message</p>
```

---

## Animation Timing

```typescript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOTION CURVES (Framer Motion)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Micro-interaction
  → duration: 150-200ms
  → easing: easeOut (quick → ease)
  → use: button press, state toggle

Transition
  → duration: 250-300ms
  → easing: easeInOut or spring
  → use: modal enter/exit, page transition

Entrance
  → duration: 300-400ms
  → easing: easeOut or spring
  → use: list stagger, page load reveal

Spring (Natural)
  → type: 'spring'
  → damping: 20 (responsive)
  → stiffness: 300 (slightly bouncy)
  → use: drag, list reorder, delightful interactions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE: No animation > 500ms. Respect prefers-reduced-motion.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Responsive Breakpoints (Mobile-First)

```typescript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BREAKPOINTS (Tailwind)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mobile       0-640px    (default, all styles apply)
Tablet       sm: 640px  (medium devices)
Large        md: 768px  (iPad landscape)
Desktop      lg: 1024px (laptop)
XL           xl: 1280px (large screens)
2XL          2xl: 1536px (ultra-wide)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE: Start with mobile styles, add desktop with md:/lg:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Example:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />
```

---

## Tailwind v4 Syntax (Canonical)

```typescript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bg-linear-to-r           (gradient left-to-right)
bg-linear-to-b           (gradient top-to-bottom)
bg-white/10              (opacity: 10%)
border-white/20          (border opacity: 20%)
shrink-0                 (flex-shrink: 0)
grow                     (flex-grow: 1)
h-10 w-10                (size: 40px)
gap-2                    (gap: 8px)
p-4                      (padding: 16px)
text-brand-primary       (use semantic tokens!)
bg-bg-primary            (use semantic tokens!)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DON'T ❌
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bg-gradient-to-r         (old v3 syntax)
bg-[#10b981]             (hardcoded hex)
bg-white/[0.1]           (bracket notation)
flex-shrink-0            (old prefix)
h-[40px]                 (bracket dimensions)
var(--color)             (no dynamic vars, use theme)
```

---

## Dark Mode Best Practices

```typescript
// Dark mode is DEFAULT (no light mode toggle needed yet)

// Every color must work in dark:
text-text-primary       // #f0f4f8 on #050a12 = 17.95:1 ✅
bg-bg-tertiary hover   // rgba(255,255,255,0.08) border
border-white/8         // Subtle dividers

// Check contrast ALWAYS
WCAG.check('#f0f4f8', '#050a12') // Must be ≥ 4.5:1
```

---

## Accessibility Checklist

```typescript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVERY COMPONENT MUST HAVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Focus ring (outline-2, outline-offset-2, outline-brand-primary)
✅ Alt text (meaningful descriptions)
✅ Aria labels (icon-only buttons)
✅ Semantic HTML (button, link, form)
✅ Keyboard navigation (Tab order logical)
✅ Contrast (4.5:1 minimum, AAA preferred)
✅ Touch targets (44pt minimum)
✅ Reduced motion (prefers-reduced-motion support)
✅ Error messages (clear, near field, aria-live)
✅ Form labels (never placeholder-only)
```

---

## Summary: The 2026 VFIT Look

```
┌─────────────────────────────────────────────────────────────┐
│  Dark Navy (#050a12) + Emerald Green (#10b981)             │
│  Glass Surfaces + Subtle Animations + Premium Spacing      │
│  Mobile-First Responsive + WCAG AAA Accessible            │
│  Modern, Refined, Premium Feel                             │
└─────────────────────────────────────────────────────────────┘
```

**Apply this guide to all phases for a cohesive, modern product! 🌟**
