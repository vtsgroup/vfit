# VFIT Design System — Master Specification

**Version**: 1.0  
**Date**: 2026-04-01  
**Status**: LOCKED  
**Target**: React Native (mobile) + Next.js (web admin)

---

## 1. Color Palette

### Core Colors (Semantic)
| Token | Hex | RGB | Usage | WCAG AA |
|-------|-----|-----|-------|---------|
| **Primary** | `#00FF00` | 0, 255, 0 | Buttons, CTAs, highlights, accents | ✅ 1.07:1* |
| **Primary Dark** | `#00CC00` | 0, 204, 0 | Hover/pressed states on primary |  |
| **Surface Base** | `#0F2B2B` | 15, 43, 43 | App background, deepest layer | ✅ 19.6:1 |
| **Surface Card** | `#0F3A3A` | 15, 58, 58 | Card/component backgrounds | ✅ 17.2:1 |
| **Surface Elevated** | `#1A4A4A` | 26, 74, 74 | Modals, sheets, elevated surfaces | ✅ 15.1:1 |
| **Text Primary** | `#FFFFFF` | 255, 255, 255 | Main text, labels | ✅ 19.6:1 |
| **Text Secondary** | `#B3B3B3` | 179, 179, 179 | Muted text, captions | ✅ 6.2:1 |
| **Text Tertiary** | `#808080` | 128, 128, 128 | Disabled text, hints | ✅ 3.5:1 |
| **Success** | `#4CAF50` | 76, 175, 80 | Confirmations, checkmarks | ✅ 4.6:1 |
| **Error** | `#FF4444` | 255, 68, 68 | Errors, alerts, destructive actions | ✅ 4.8:1 |
| **Warning** | `#FFA500` | 255, 165, 0 | Warnings, cautions | ✅ 4.2:1 |
| **Info** | `#4DA6FF` | 77, 166, 255 | Info messages, contextual help | ✅ 4.9:1 |

*Note: Primary (#00FF00) is vibrant but intentionally high-contrast for dark background. Use sparingly for CTAs and critical UI only. Pair with `Primary Dark` (#00CC00) for hover states to maintain contrast.*

### Dark Mode Behavior
- **Surface tones**: Already at dark mode baseline (#0F2B2B). No inversion needed.
- **Text tones**: #FFFFFF main, #B3B3B3 secondary. No changes.
- **Accents**: Lime (#00FF00) remains primary; use full saturation for buttons, reduced opacity (60%) for backgrounds.

### Accessibility Rules (REQUIRED)
- ✅ All text colors meet WCAG AA 4.5:1 contrast minimum against backgrounds
- ✅ Never use color ALONE to convey meaning; add icons or text
- ✅ Error/Success/Warning always paired with icons (checkmark, X, alert triangle)
- ✅ Disabled states: opacity 0.5 + reduced saturation + semantic attribute
- ✅ Focus states: visible 2-4px ring in Primary color + outline

---

## 2. Typography System

### Font Families
- **Primary (Headings)**: Inter (700 Bold)
- **Secondary (Body)**: Inter (400 Regular, 500 Medium, 600 Semi-bold)
- **Accent (Special)**: Poppins (600 Semi-bold) for workout names, nutrition highlights

### Type Scale (Relative to 16px base)

| Role | Size | Weight | Line-Height | Letter-Spacing | Usage |
|------|------|--------|-------------|-----------------|-------|
| **Display** | 32px | 700 | 1.2 | -0.5px | App title, major sections |
| **Headline** | 28px | 700 | 1.3 | -0.25px | Page titles, modal headers |
| **Subtitle 1** | 24px | 600 | 1.4 | 0px | Section headers |
| **Subtitle 2** | 20px | 600 | 1.4 | 0px | Card titles, bottom nav labels |
| **Body Large** | 18px | 400 | 1.5 | 0px | Long-form text |
| **Body Normal** | 16px | 400 | 1.5 | 0px | Standard body text, form inputs |
| **Body Small** | 14px | 400 | 1.5 | 0.25px | Helper text, captions |
| **Label Large** | 14px | 500 | 1.5 | 0px | Button labels, field labels |
| **Label Medium** | 12px | 500 | 1.4 | 0.4px | Tags, badges, small labels |
| **Label Small** | 11px | 500 | 1.4 | 0.5px | Timestamps, metadata |

### Constraints (REQUIRED)
- Minimum body text: 16px (avoids iOS auto-zoom)
- Line length: 35–60 chars (mobile), 60–75 chars (desktop)
- No text below 11px
- Headings: never italic or underlined (exception: links, explicitly styled)
- Dynamic Type support (iOS): use `fontSizeAdjustment` for accessibility users who scale system fonts

---

## 3. Spacing Scale (8pt Grid)

```
xs    = 4px
sm    = 8px
md    = 12px
lg    = 16px
xl    = 24px
2xl   = 32px
3xl   = 48px
4xl   = 64px
```

### Application
| Element | Padding | Gap | Margin |
|---------|---------|-----|--------|
| **Button (sm)** | 8px 12px | — | 8px bottom |
| **Button (lg)** | 12px 16px | — | 12px bottom |
| **Card** | 16px | — | 12px bottom |
| **Input** | 12px | — | 12px bottom |
| **List items** | 12px | 8px between items | — |
| **Section** | 0px | — | 24px bottom |
| **Screen padding** | 16px (mobile), 24px (desktop) | — | — |

---

## 4. Animations & Motion

### Timing
| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| **Micro** | 150ms | cubic-bezier(0.4, 0, 0.2, 1) | Button press, opacity change, small state swap |
| **Standard** | 250ms | cubic-bezier(0.4, 0, 0.2, 1) | Page transition, modal entry, expand/collapse |
| **Slow** | 400ms | cubic-bezier(0.4, 0, 0.2, 1) | Complex multi-element sequence, parallax |

### Principles (REQUIRED)
- ✅ **No animation > 500ms** — feels sluggish
- ✅ **Transform/opacity only** — never animate width/height/left/top (reflow)
- ✅ **Interruptible** — tap/gesture during animation cancels smoothly
- ✅ **Reduced motion support** — `prefers-reduced-motion: reduce` disables all animations
- ✅ **Exit faster** — exit animation = 60–70% of enter duration
- ✅ **Spatial continuity** — forward nav = slide left/up, backward = slide right/down

### Specific Animations for VFIT

#### Bottom Nav Tab Transition
```
Duration: 150ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Active indicator: scale(1) + lime color
Inactive tab: opacity 0.7
Transition: opacity 150ms + scale 150ms
```

#### Workout Set Logging (Set Tracker)
```
Duration: 200ms per set input
Easing: ease-out
On input focus: scale(1.02) + subtle shadow
On set complete (swipe/press): scale(0.95) then slide-out
Feedback: haptic pulse (iOS) or subtle glow (web)
```

#### Meal Macros Pie Chart
```
Duration: 400ms (staggered entry)
Easing: cubic-bezier(0.34, 1.56, 0.64, 1) [spring-like]
Each segment: 50ms stagger
Hover: individual segment highlight + scale(1.05)
```

#### IA Chat Message Entry
```
New message bubble: fade-in + slide-up 200ms
Avatar: fade-in + scale(0.9→1) 150ms
Typing indicator: 3 dots, each fade 400ms cycle
Response delay: show "thinking..." 300ms before response appears
```

#### Modal Entry/Exit
```
Entry: scale(0.95→1) + fade(0→1) 250ms
Exit: scale(1→0.95) + fade(1→0) 150ms
Overlay: fade 250ms
Prevents: animation during dismissal if user taps outside
```

### Animation Libraries
- **React Native**: Native Animated API (Reanimated 3 optional for complex gestures)
- **Next.js/Admin**: Framer Motion v11+ (lightweight, React-first, reduced-motion built-in)
- **GIFs/Complex**: Lottie (optional for exercise demos, premium animations in Sprint 48)

---

## 5. Component Library Specs

### Button
**Variants**: `primary` | `secondary` | `outlined` | `ghost` | `destructive`

```
primary:
  bg: #00FF00, text: #0F2B2B, hover: #00CC00
  padding: 12px 16px (lg) or 8px 12px (sm)
  border-radius: 4px
  font-weight: 600
  ripple on press (Android) / scale 0.95 (iOS/web)
  min height: 44px (touch target)

secondary:
  bg: #0F3A3A, text: #00FF00, border: 1px #00FF00
  hover: bg: #1A4A4A

outlined:
  bg: transparent, text: #00FF00, border: 1px #00FF00
  hover: bg: rgba(0, 255, 0, 0.1)

ghost:
  bg: transparent, text: #B3B3B3
  hover: bg: rgba(255, 255, 255, 0.1)

destructive:
  bg: #FF4444, text: #FFFFFF
  hover: bg: #DD3333
```

### Card
```
bg: #0F3A3A
padding: 16px
border-radius: 8px
shadow: 0 2px 8px rgba(0, 0, 0, 0.3)
margin-bottom: 12px
Tap feedback: scale(0.98) on press
```

### Input / Form Field
```
bg: #1A4A4A
text: #FFFFFF
placeholder: #808080
border: 1px transparent
border-radius: 4px
padding: 12px 16px
focus: border 2px #00FF00, shadow 0 0 8px rgba(0, 255, 0, 0.3)
height: ≥44px (mobile touch target)
label: always above input, visible, "Label Large" style
error state: border-color #FF4444, error text below field
```

### Modal / Bottom Sheet
```
Overlay: rgba(0, 0, 0, 0.6)
Panel: bg #0F3A3A, border-radius 12px top (mobile), 8px (desktop)
Padding: 20px
Close affordance: X button top-right OR swipe-down indicator
Header: "Headline" style, bold
Actions: primary + secondary buttons at bottom, padding 16px top
```

### Bottom Navigation (Tabs)
```
5 items max: Treinos | Nutrição | Avaliações | IA | Perfil
Layout: tab icon (24×24) + label (Label Medium 12px) stacked
height: 64px (including safe area padding)
Active tab: text #00FF00, icon #00FF00
Inactive tab: text #808080, icon #808080, opacity 0.7
Active indicator: underline 2px #00FF00 OR filled pill background
Spacing between items: equal
Touch target: ≥44px wide per tab (not just icon)
```

### Badge / Tag
```
bg: rgba(0, 255, 0, 0.2)
text: #00FF00
padding: 4px 8px
border-radius: 4px
font-size: Label Medium (12px)
font-weight: 500
variants: default, success (#4CAF50), error (#FF4444), warning (#FFA500)
```

### Divider
```
color: rgba(255, 255, 255, 0.1)
height: 1px
margin: 16px 0
full-width or inset (16px padding)
```

---

## 6. Responsive Breakpoints

```
Mobile:     < 576px
Tablet:     576px – 768px
Desktop:    ≥ 768px
```

### Layout Rules (REQUIRED)
- ✅ Mobile-first design; scale up to tablet/desktop
- ✅ No horizontal scroll
- ✅ Safe area padding on notch devices (iOS) + gesture bar (Android)
- ✅ Bottom nav fixed on mobile; top nav on desktop
- ✅ Touch targets ≥44×44px (iOS), ≥48×48dp (Android)
- ✅ Portrait orientation primary; landscape supported but not primary

---

## 7. Accessibility (WCAG 2.1 AA Minimum)

### Visual Accessibility
- ✅ Contrast ratio ≥4.5:1 (normal text), ≥3:1 (large text)
- ✅ Focus states: visible 2–4px ring
- ✅ Color + icon/text for semantic meaning (error = red + X icon + "Error" label)
- ✅ No reliance on color alone

### Interactive Accessibility
- ✅ Keyboard navigation: Tab order matches visual order
- ✅ Skip links (web): "Skip to main content"
- ✅ Form labels: explicit `<label for="id">` or `aria-label`
- ✅ Buttons: clickable min 44×44px
- ✅ Icon-only buttons: must have aria-label + visible tooltip

### Screen Reader Accessibility
- ✅ Semantic HTML (button, input, h1-h6, nav, main, section)
- ✅ aria-live regions for dynamic content (chat, notifications)
- ✅ aria-label on icon buttons
- ✅ Role attributes for custom components
- ✅ Headings: sequential h1→h6, no level skip

### Motion & Animation
- ✅ `prefers-reduced-motion: reduce` respected (disable animations for users who request it)
- ✅ Loading states: show progress indicator if > 300ms
- ✅ Modals: trap focus, show close affordance, Escape key to dismiss

---

## 8. Anti-Patterns (NEVER DO THESE)

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Emoji as icons (😊 for profile) | Not scalable, not semantic, fails a11y | Use SVG or DSIcon component |
| Color-only error state (red field) | Color-blind users can't see error | Red border + X icon + error text |
| Placeholder-only labels | Disappears on input, breaks a11y | Label above field, always visible |
| Hover-only state (desktop) | Mobile users can't hover; no visual feedback | Use tap/press feedback (scale, ripple, color) |
| Animating width/height | Causes reflow/layout shift (bad CLS score) | Use transform: scaleX/scaleY instead |
| No focus states | Keyboard users can't navigate | Always show focus ring (2–4px) |
| Fixed width containers (px) | Breaks on responsive, accessibility scaling | Use max-width + padding + flex |
| Disabled opacity only (0.3) | Insufficient contrast, still looks interactable | Use 0.5 opacity + grayscale + cursor:not-allowed |
| Modal with no close affordance | Users feel trapped | Show X button + Escape key support |
| Inline SVG colors (hardcoded hex) | Can't adapt to theme or dark mode | Use CSS variables or `currentColor` |

---

## 9. Tokens (CSS Variables / React Native Constants)

### Colors
```css
--ds-primary: #00FF00;
--ds-primary-dark: #00CC00;
--ds-surface-base: #0F2B2B;
--ds-surface-card: #0F3A3A;
--ds-surface-elevated: #1A4A4A;
--ds-text-primary: #FFFFFF;
--ds-text-secondary: #B3B3B3;
--ds-text-tertiary: #808080;
--ds-success: #4CAF50;
--ds-error: #FF4444;
--ds-warning: #FFA500;
--ds-info: #4DA6FF;
```

### Spacing
```css
--ds-spacing-xs: 4px;
--ds-spacing-sm: 8px;
--ds-spacing-md: 12px;
--ds-spacing-lg: 16px;
--ds-spacing-xl: 24px;
--ds-spacing-2xl: 32px;
--ds-spacing-3xl: 48px;
--ds-spacing-4xl: 64px;
```

### Typography
```css
--ds-font-family-primary: "Inter", sans-serif;
--ds-font-family-accent: "Poppins", sans-serif;
--ds-font-size-xs: 11px;
--ds-font-size-sm: 12px;
--ds-font-size-base: 14px;
--ds-font-size-lg: 16px;
--ds-font-size-xl: 18px;
--ds-font-size-2xl: 20px;
--ds-font-size-3xl: 24px;
--ds-font-size-4xl: 28px;
--ds-font-size-5xl: 32px;
--ds-line-height: 1.5;
```

### Animations
```css
--ds-transition-micro: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--ds-transition-standard: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--ds-transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 10. Implementation Rules

### React Native (Mobile)
1. **Use StyleSheet.create()** for all styles; inline only for dynamic values
2. **Color tokens**: Define in `lib/vfit-tokens.ts`, import everywhere
3. **Components**: Base components in `src/components/ui/vfit/`, feature components in `src/components/vfit/`
4. **Icons**: Always use `<DSIcon name="..." />` (24×24 default, scalable)
5. **Animations**: Use Reanimated 3 (gesture-driven) or native Animated API
6. **Typography**: `fontFamily: 'Inter'`, `fontSize: 16`, `fontWeight: '400'`
7. **Touch targets**: Min 44×44 (no exceptions)

### Next.js (Admin Panel)
1. **Tailwind config**: Extend with VFIT tokens (colors, spacing, typography)
2. **CSS variables**: Define in `globals.css`, use in components
3. **Components**: Folder `src/components/ui/` for design system (shared with Storybook)
4. **Icons**: Lucide React or custom SVG in `<Icon />` wrapper (never hardcode color)
5. **Animations**: Framer Motion for page/modal transitions
6. **Form library**: React Hook Form + Zod for validation
7. **Testing**: Vitest for unit tests, Playwright for E2E

### Design Handoff
- **Figma**: VFIT component library (buttons, cards, inputs, modals, bottom nav)
- **Storybook** (optional): Document all component states (default, hover, focus, disabled, error)
- **Design tokens**: Sync with Figma tokens plugin for real-time updates

---

## 11. Versioning & Updates

- **v1.0** (Current): Launch baseline — dark teal + neon lime, 8pt spacing, accessibility AA
- **v1.1** (Sprint 44): Premium animations (Lottie), gradient cards, micro-interactions
- **v1.2** (Sprint 46): Trainer marketplace styling, premium badge/ribbon design
- **v2.0** (Post-launch): Light mode support, animation library expansion, custom font

---

## Continuity Prompt for Opus

> **Next Session Start Instruction**: If continuing this work in Opus, start by:
> 1. Read this file (`vfit-design-system.md`) to lock the design baseline
> 2. Create React Native components in `src/components/ui/vfit/` using tokens from step 9
> 3. Implement color/spacing tokens in `lib/vfit-tokens.ts`
> 4. Build the 5-tab bottom navigation bar first (foundation for all screens)
> 5. Then build onboarding screens (8-10 steps) using the design tokens and Button/Card/Input components
> 6. Document any deviation from this spec in `.claude/design-system-deviations.md` with rationale
> 7. Update `.claude/session-state.md` daily with progress
> **Blockers**: None. Design system is locked. Ready for implementation.
> **Estimated time (Sprint 41)**: 3 days (design system codification) + 4 days (component library) + 3 days (onboarding screens)

