# 📐 Visual Reference — Student v4 Layout

---

## Desktop View (Web/Responsive)

```
┌─────────────────────────────────────────────────────────┐
│ VF    Treinos        [Search ⌘K]    🔔 🧑 🔐         ← Header (v4)
│                                                          │ backdrop-blur-2xl
│ ─────────────────────────────────────────────────────── │ scroll → shadow
├─────────────────────────────────────────────────────────┤
│                                                          │
│                                                          │
│           [Content Area — 2xl max-width centered]       │
│                                                          │
│  Lorem ipsum dolor sit amet...                          │
│  Consectetur adipiscing elit...                         │
│                                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘

(No bottom nav on desktop — only mobile below)
```

---

## Mobile View — Bottom Navigation

```
┌───────────────────────────┐
│ VF    Treinos   🔔 🧑   ← Header (sticky, v4 backdrop)
├───────────────────────────┤
│                           │
│   [Content scrolls       │
│    here with padding]    │
│                           │
│                           │
│                           │
│                           │
│                           │
├───────────────────────────┤
│ 🏠 Treinos               │ ← Tab 1 (active)
│   🥗 Nutrição            │ ← Tab 2
│     🤖 IA & Dicas        │ ← Tab 3 (FAB center)
│        📊 Avaliações     │ ← Tab 4
│           👤 Perfil      │ ← Tab 5
└───────────────────────────┘
  ↑ Each tab is a link with icon + label
  ↑ Active tab: bold icon + accent color
```

---

## Mobile View — FAB Menu Expanded

```
┌───────────────────────────────┐
│ VF    Treinos   🔔 🧑        │
├───────────────────────────────┤
│                               │
│  [Content behind scrim]       │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← Backdrop blur overlay
│                               │ ← (opacity 40-60%)
│       ┌─────────────────┐     │
│       │ 🎯 Metas     │ 📈  │ ← Grid 2×3
│       │ Progresso │     │
│       ├─────────────────┤     │
│       │ 💪 Exercício  │ 🥗 │
│       │ Nutrição │     │
│       ├─────────────────┤     │
│       │ 🧠 Perguntas│ ❌ │
│       │ Fechar  │     │
│       └─────────────────┘     │
│                               │
├───────────────────────────────┤
│ 🏠 Treinos                     │
│   🥗 Nutrição                  │
│     🤖 (FAB expanded)          │
│        📊 Avaliações           │
│           👤 Perfil            │
└───────────────────────────────┘
```

---

## Header Detail — v4 Upgrade

### Before (v3)

```
┌────────────────────────────────────────┐
│ VF    Treinos           🔔 🧑         │
│                                        │
│ (Light backdrop, no shadow on scroll)  │
└────────────────────────────────────────┘
```

### After (v4)

```
┌────────────────────────────────────────┐
│ VF    Treinos           🔔 🧑         │ ← Modern icons (v4)
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │ ← Subtle border
│ (backdrop-blur-2xl + saturate-180)     │
│ (Shadow appears on scroll ↓)           │
└────────────────────────────────────────┘
```

**Changes**:
- `backdrop-blur-xl` → `backdrop-blur-2xl backdrop-saturate-180`
- Add subtle bottom border (hidden until scroll)
- Scroll detection: shadow appears when `window.scrollY > 8`
- Typography: More compact, matching dashboard

---

## Bottom Nav Detail — v4 Ultra-Modern

### Before (No Persistent Bottom Nav in Student App)

```
[No bottom nav existed — student used sidebar/header only]
```

### After (New v4 Bottom Nav)

```
┌──────────────┬───────────┬──────────┬──────────┬──────────┐
│ 🏠           │ 🥗        │ 🤖       │ 📊       │ 👤      │
│ Treinos      │ Nutrição  │ IA Dicas │ Avaliações│ Perfil │
│ (active)     │           │          │          │         │
│ ──────────   │           │          │          │         │
└──────────────┴───────────┴──────────┴──────────┴──────────┘
 ↑ Active: bold icon, accent color, underline
 ↑ Inactive: lighter gray, regular weight
 ↑ Safe area padding-bottom on mobile
```

**Styling**:
- Fixed bottom, full width
- `backdrop-blur-xl bg-bg-primary/85`
- Flex row, space-evenly
- Each tab: icon (24px) + label (text-xs)
- Active indicator: top border or background pill
- Touch target: 44×44px minimum

---

## FAB Menu Detail — Expandable AI Submenu

### Collapsed State

```
┌────────────────────────────┐
│                            │
│  (Content area)            │
│                            │
│                    ┌────┐  │
│                    │ 🤖 │  ← FAB button (56×56px)
│                    │    │  ← Green gradient
│                    └────┘  ← Shadow + glow
└────────────────────────────┘
```

**FAB Properties**:
- Size: 56×56px (h-14 w-14)
- Gradient: `from-emerald-400 via-emerald-500 to-emerald-700`
- Shadow: `shadow-[0_4px_16px_rgba(16,185,129,0.35)]`
- Position: `fixed bottom-6 right-6` (above bottom nav)
- Hover: scale 1.08 + rotate -5deg + enhanced shadow

### Expanded State

```
┌────────────────────────────────┐
│ (Backdrop scrim)               │ ← opacity 40-60%
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                │
│    ┌─────┐  ┌─────┐           │
│    │ 🎯 │  │ 📈 │           │ ← Row 1 (stagger: 0ms, 50ms)
│    └─────┘  └─────┘           │
│    ┌─────┐  ┌─────┐           │
│    │ 💪 │  │ 🥗 │           │ ← Row 2 (stagger: 100ms, 150ms)
│    └─────┘  └─────┘           │
│    ┌─────┐  ┌─────┐           │
│    │ 🧠 │  │ ❌ │           │ ← Row 3 (stagger: 200ms, 250ms)
│    └─────┘  └─────┘           │
└────────────────────────────────┘
```

**Animation**:
- Backdrop fade in (200ms)
- Grid items scale from 0.8 → 1.0 with spring physics
- Stagger: 50ms between each item
- On tap action or backdrop: all fade out + close (150ms)
- Haptic feedback on open/close

**Menu Items** (6 total):
1. 🎯 Metas → `/ia?action=goals`
2. 📈 Progresso → `/ia?action=progress`
3. 💪 Exercício Recomendado → `/ia?action=exercise`
4. 🥗 Dica de Nutrição → `/ia?action=nutrition`
5. 🧠 Pergunta Rápida → `/ia?action=qa`
6. ❌ Fechar → `setExpanded(false)` (or just tap backdrop)

---

## Scroll Behavior — Header Shadow Animation

### Scroll Position: 0px (Top of Page)

```
┌────────────────────────────────────┐
│ VF    Treinos           🔔 🧑     │
│                                    │ ← Light border (opacity-60)
│                                    │
│ [Content starts here]              │
│                                    │
```

### Scroll Position: 8px+ (User Scrolls Down)

```
┌────────────────────────────────────┐
│ VF    Treinos           🔔 🧑     │
│ ═════════════════════════════════ │ ← Shadow appears
│ ⬇️ Shadow gets darker/more visible │ ← Border opacity-100
│                                    │
│ [Content scrolled up]              │
│                                    │
```

**Shadow implementation**:
- Progressive: opacity increases with scroll
- Class toggle: `ds3-header-scrolled` when `scrollY > 8`
- Smooth transition: `transition-all duration-300`
- Effect: Elevates header visually from content

---

## Safe Area Awareness

### Status Bar & Notch (iOS/Android)

```
┌─ env(safe-area-inset-top) ─┐
│ [Status bar / notch space] │
├────────────────────────────┤
│ VF    Treinos    🔔 🧑    │ ← Header starts here
├────────────────────────────┤
│ [Content]                  │
│                            │
│                            │
│                            │
├────────────────────────────┤
│ 🏠 Treinos 🥗 Nutrição ... │ ← Bottom nav ends here
├─env(safe-area-inset-bottom)┤
│ [Gesture bar / home button]│
└────────────────────────────┘
```

**CSS Handling**:
- Header: `paddingTop: 'env(safe-area-inset-top, 0px)'`
- Content: `pt-[calc(4rem+env(safe-area-inset-top))]`
- Bottom nav: `pb-[calc(5.5rem+env(safe-area-inset-bottom))]`

---

## Dark Mode Comparison

### Light Mode

```
┌────────────────────────────────────┐
│ VF    Treinos         🔔 🧑       │ ← bg-bg-primary (light)
│ ────────────────────────────────── │ ← border-light
│                                    │
│ [White/light content]              │
│                                    │
├────────────────────────────────────┤
│ 🏠 🥗 🤖 📊 👤                    │ ← bg-bg-primary (light)
└────────────────────────────────────┘
```

### Dark Mode

```
┌────────────────────────────────────┐
│ VF    Treinos         🔔 🧑       │ ← bg-bg-primary (dark)
│ ════════════════════════════════ │ ← border-light (adjusted)
│                                    │
│ [Dark content, light text]         │
│                                    │
├────────────────────────────────────┤
│ 🏠 🥗 🤖 📊 👤                    │ ← bg-bg-primary (dark)
└────────────────────────────────────┘
```

**Contrast Requirements**:
- Text on header: ≥4.5:1 (WCAG AA)
- Border visibility: Adjusted per theme (border-light/50 light, border-light dark)
- FAB shadow: Readable in both modes

---

## Touch Targets & Spacing

### Header Icon Spacing

```
┌─────────────────────────┐
│ VF   Title   🔔  🧑   │
│    ↑               ↑    │
│  gap-3          gap-2   │
│                          │
└─────────────────────────┘
```

### Bottom Nav Item (Touch Target)

```
┌──────────────┐
│              │ ← 44×44px minimum
│     🏠       │ ← Icon centered
│   Treinos    │ ← Label below
│              │
└──────────────┘
```

**Padding**:
- Horizontal: `px-4` (header), `px-4` (nav items)
- Vertical: Icons auto-spaced with flex centering
- GAP: `gap-3` large, `gap-2` small
- Min touch target: 44×44px (iOS) / 48×48dp (Android)

---

## Icon Style — v4 Vibrante

### Current Style (v3)

```
🏠 → Outlined home (stroke only)
🥗 → Apple outline
🤖 → Custom bot SVG

(Mixed styles)
```

### v4 Vibrante Style

```
🏠 → Modern geometric home (clean outline)
🥗 → Crisp apple icon (consistent stroke)
🤖 → Sleek AI bot (refined custom SVG)

(Unified stroke width: 2px)
(Modern line caps: rounded)
(Consistent visual weight across all icons)
```

**Implementation**: Use `DSIcon` component with `name` prop — it automatically selects v4 assets.

---

## State Indicators

### Tab Active State

```
Inactive                 Active
┌──────────────┐        ┌──────────────┐
│ 🥗           │        │ 🏠           │
│ Nutrição     │        │ Treinos      │
│ (gray)       │        │ (accent)     │
│              │        │ ──────────   │ ← Underline
└──────────────┘        └──────────────┘

Color: text-muted       Color: brand-primary
Font: regular           Font: semibold
Icon: opacity-60        Icon: opacity-100
Border: none            Border: top-2 brand-primary
```

### FAB Press State

```
Normal                  Pressed
┌────┐                 ┌────┐
│ 🤖 │ scale: 100%     │ 🤖 │ scale: 95%
│    │ opacity: 1      │    │ opacity: 90%
└────┘                 └────┘
```

---

## Animation Timeline — FAB Open/Close

### Open Animation (300ms total)

```
t=0ms     ↑ User taps FAB
          ↓ Backdrop fade in (0→1 opacity in 200ms)
          ↓ Grid items scale: 0.8→1.0 (spring, 250ms)

t=50ms    ↓ Item 1 (🎯) animates
t=100ms   ↓ Item 2 (📈) animates
t=150ms   ↓ Item 3 (💪) animates
t=200ms   ↓ Item 4 (🥗) animates
t=250ms   ↓ Item 5 (🧠) animates
t=300ms   ↓ Item 6 (❌) animates

t=300ms   ✅ Full menu visible
```

### Close Animation (150ms total)

```
t=0ms     ↑ User taps item or backdrop
          ↓ Backdrop fade out (1→0 opacity in 150ms)
          ↓ Grid items scale: 1.0→0.8 (all together, 150ms)

t=150ms   ✅ Menu closed
```

---

## File Structure Recap

```
src/
├── components/navigation/
│   ├── student-header.tsx              ← MODIFY (Phase 1)
│   ├── student-bottom-nav.tsx          ← CREATE (Phase 2)
│   └── student-fab-menu.tsx            ← CREATE (Phase 3)
├── app/(app)/
│   └── layout.tsx                      ← Wire up components (Phase 4)
└── lib/
    └── navigation.ts                   ← Check routes (Phase 4)
```

---

## Next Steps

1. **Read Full Plan**: [PLAN.md](./PLAN.md)
2. **Study Dashboard Benchmarks**: `header.tsx` + `mobile-nav.tsx` + `ai-bot-fab.tsx`
3. **Implement Phase 1**: Header upgrade
4. **Implement Phase 2**: Bottom nav
5. **Implement Phase 3**: FAB menu
6. **Test**: On real mobile device with haptic feedback

---

**Visual Reference Version**: 1.0  
**Last Updated**: 2026-04-05
