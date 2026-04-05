# VFIT Student App v4 Redesign Plan

> **Status**: Plan Ready for Implementation  
> **Date**: 2026-04-05  
> **Target**: Student (Aluno) B2C Interface Redesign  
> **Scope**: Header + BottomNav + FAB (matching dashboard v3→v4 upgrade)

---

## 📋 Executive Summary

Upgrade the **student app** from v3 to v4 design system, matching the **dashboard** (personal/admin) aesthetic. The student app gets:
1. **Identical header** — sticky, backdrop-blur, clean breadcrumb-free layout (centered title only)
2. **Identical bottom nav** — 5-6 tabs, ultra-modern styling, same visual language
3. **Identical FAB** — expanded menu with AI submenu options (Goals, Metas, etc.)
4. **Key difference**: **NO sidebar toggle** (student role never sees hamburger menu)

All components already exist; this plan outlines **what files to modify** and **where the copilot should apply v4 design tokens**.

---

## 🏗️ Architecture Overview

### Current File Structure

```
src/
├── app/(app)/
│   ├── layout.tsx                          ← Student app layout wrapper (uses StudentHeader + StudentBottomNav)
│   └── [route-pages]/                      ← All student routes
├── components/
│   ├── navigation/
│   │   └── student-header.tsx              ← 👈 MODIFY: Upgrade to v4, remove sidebar logic
│   ├── layout/
│   │   ├── mobile-nav.tsx                  ← REFERENCE: Study dashboard mobile-nav for patterns
│   │   ├── header.tsx                      ← REFERENCE: Dashboard v4 header (existing benchmark)
│   │   └── dashboard-layout.tsx            ← REFERENCE: Dashboard layout structure
│   └── ui/
│       ├── ai-bot-fab.tsx                  ← REFERENCE: Current FAB (will need student variant)
│       ├── ds-icon.tsx                     ← Use for modern v4 icons
│       └── button.tsx                      ← Use for FAB expansion menu buttons
├── lib/
│   └── navigation.ts                       ← REFERENCE: Student navigation config (update here for new routes)
└── stores/
    └── app-store.ts                        ← REFERENCE: Check for mobile state management
```

### Student App Routes (B2C)

Current routes in `src/app/(app)/`:
- `/treinos` — Workouts
- `/nutricao` — Nutrition
- `/ia` — IA & Tips
- `/avaliacoes` — Assessments
- `/perfil` — Profile
- `/plano` — My Plan

---

## 🎯 Implementation Phases

### Phase 1: Header Upgrade ✨
**Files to modify:**
- [`src/components/navigation/student-header.tsx`](src/components/navigation/student-header.tsx)

**What exists:**
- Sticky, back button or logo, centered title, bell + avatar
- NO sidebar menu (correct for student)
- backdrop-blur already present

**What to change:**
1. **Upgrade backdrop effect** → `backdrop-blur-2xl backdrop-saturate-180` (match dashboard header)
2. **Add scroll-triggered shadow** → Progressive shadow on scroll (study `header.tsx` lines 129–135)
3. **Icons upgrade** → Replace icon appearance with v4 modern Vibrante style (DSIcon already supports this)
4. **Typography refinement** → Match dashboard compact styling
5. **Remove/hide** any "3-line menu" logic (student has no sidebar)
6. **Add subtle border** → Bottom border matching dashboard (lines 309–312)

**Tokens to apply:**
- `backdrop-blur-2xl backdrop-saturate-180` (from dashboard)
- `ds3-header` CSS class (reuse from dashboard)
- Scroll detection + conditional `ds3-header-scrolled` class
- Border animation on scroll

**Estimated tokens**: ~150 (just CSS class updates + scroll logic)

---

### Phase 2: Bottom Navigation Redesign 📱
**Files to create/modify:**
- **CREATE**: `src/components/navigation/student-bottom-nav.tsx` (new component)
- **REFERENCE**: [`src/components/layout/mobile-nav.tsx`](src/components/layout/mobile-nav.tsx) (dashboard version)

**What exists:**
- Student app currently doesn't have a persistent bottom nav (uses header nav only)
- Dashboard has ultra-modern bottom nav with 5-6 tabs + central FAB

**What to build:**
1. **Create new `StudentBottomNav` component** — identical style to dashboard but:
   - Tab icons match student routes: 🏠 Início | 👤 Alunos → 🎯 Metas | 📊 Progresso | ⚙️ Config
   - NO "Quick Actions" grid (students don't need Criar Treino, etc.)
   - Central FAB **expands to AI submenu** instead
2. **Tab structure** (5 items for students):
   - Home (`/treinos`)
   - Nutrition (`/nutricao`)
   - AI & Tips (`/ia`) — or Goals (`/metas`)
   - Assessments (`/avaliacoes`)
   - Profile (`/perfil`)
3. **Active state styling** — Accent color, icon fill (study dashboard lines 77–100+)
4. **Haptic feedback** — Match dashboard `haptic()` function (lines 43–47)
5. **Safe area** — Respect bottom safe-area-inset

**Key patterns from dashboard to copy:**
- Framer Motion stagger on open
- Active tab indicator (underline or pill background)
- Icon SVG quality (filled vs outline based on state)
- Backdrop blur on FAB menu overlay
- Touch feedback (scale 0.95 on press)

**Estimated tokens**: ~300–400 (new component with animation + styling)

---

### Phase 3: FAB Menu (AI Submenu) 🤖
**Files to create/modify:**
- **CREATE**: `src/components/navigation/student-fab-menu.tsx` (new component)
- **REFERENCE**: 
  - [`src/components/ui/ai-bot-fab.tsx`](src/components/ui/ai-bot-fab.tsx) (current FAB)
  - [`src/components/layout/mobile-nav.tsx`](src/components/layout/mobile-nav.tsx) lines 200–300+ (quick actions grid)

**What to build:**
1. **FAB expands to 6-item grid** (2×3 like dashboard):
   - 🎯 Metas (Goals)
   - 📈 Progresso (Progress)
   - 💪 Exercício Recomendado (Recommended Exercise)
   - 🥗 Dica de Nutrição (Nutrition Tip)
   - 🧠 Pergunta Rápida (Quick Q&A)
   - ❌ Fechar (Close — or just backdrop tap to dismiss)

2. **Visual style**:
   - Same green gradient as current FAB (`from-emerald-400 via-emerald-500 to-emerald-700`)
   - Icon style matches v4 Vibrante (modern, clean, 28-32px)
   - Backdrop blur overlay when expanded
   - Staggered entrance (each button appears in sequence ~50ms apart)
   - Spring physics animation (not linear)

3. **Interaction**:
   - Tap FAB → grid slides/scales up from FAB position
   - Each action routes to `/ia?action=goals`, `/ia?action=progress`, etc.
   - Tap backdrop or any action → menu closes
   - Haptic on open/close

**Estimated tokens**: ~200–250 (animation + grid layout + button styling)

---

### Phase 4: Integration & Layout
**Files to modify:**
- `src/app/(app)/layout.tsx` — Wrap with StudentHeader + StudentBottomNav (if not already)
- `src/lib/navigation.ts` — Update student route list if new routes added

**What to check:**
- StudentHeader visibility on all routes
- StudentBottomNav visibility (should appear on tab-root routes only, like `/treinos`, `/ia`)
- Content padding (ensure not hidden behind header/nav)
- Safe area offsets (top for header, bottom for nav)

**Estimated tokens**: ~50 (just layout wrapping + route checks)

---

## 📂 File Reference Matrix

| File | Status | Purpose | Token Cost to Read |
|------|--------|---------|-------------------|
| `student-header.tsx` | ✏️ MODIFY | Current student header | ~150 |
| `header.tsx` | 🔍 STUDY | Dashboard v4 header (benchmark) | ~450 |
| `mobile-nav.tsx` | 🔍 STUDY | Dashboard bottom nav (full reference) | ~1200 |
| `ai-bot-fab.tsx` | 🔍 STUDY | Current FAB component | ~80 |
| `dashboard-layout.tsx` | 🔍 STUDY | Dashboard layout structure | ~100 |
| `app/(app)/layout.tsx` | ✏️ CHECK | Student app layout wrapper | ~80 |
| `lib/navigation.ts` | ✏️ CHECK | Route configuration | ~200 |

**Total reference cost**: ~2,260 tokens (already amortized by copilot reading)

---

## 🎨 Design Tokens & Style Guide

### Colors
- **Primary**: `brand-primary` (emerald/teal)
- **FAB gradient**: `from-emerald-400 via-emerald-500 to-emerald-700`
- **Text muted**: `text-muted`, `text-secondary`
- **Backgrounds**: `bg-primary`, `bg-secondary`, `bg-tertiary`
- **Borders**: `border-light`, `border-light/50`

### Effects
- **Backdrop**: `backdrop-blur-2xl backdrop-saturate-180`
- **Shadow**: `shadow-[0_4px_16px_rgba(16,185,129,0.35)]` (FAB), `shadow-lg shadow-black/20` (header on scroll)
- **Transitions**: `transition-all duration-300` (global standard)
- **Border radius**: `rounded-[18px]` (FAB), `rounded-xl` (buttons), `rounded-[10px]` (header buttons)

### Spacing
- **Insets**: `px-4 lg:px-6` (header), `px-4` (nav), `gap-3` (header), `gap-2` (nav)
- **Padding bottom (mobile)**: `pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]` (content under bottom nav)
- **Padding top**: `pt-[calc(4rem+env(safe-area-inset-top,0px))]` (content below header)

### Icons
- **Size**: `24–28px` typical (DSIcon size prop)
- **Active**: Filled or solid color
- **Inactive**: Outline or reduced opacity
- **Color**: Inherit from text color (text-muted → text-primary on active)

### Animations
- **Micro-interactions**: `duration-200` to `duration-300`
- **FAB expand**: Spring physics (Framer Motion `type="spring"`)
- **Stagger**: `50ms` per item in grid
- **Scale on press**: `scale-95` → `scale-100`
- **Fade backdrop**: `opacity-0` → `opacity-100` (200ms)

---

## ✅ Quality Checklist

Before final delivery, copilot must verify:

### Visual Consistency
- [ ] Header backdrop effect matches dashboard exactly
- [ ] Bottom nav icons are v4 Vibrante style (modern, not flat or skeuomorphic)
- [ ] FAB menu grid uses same spacing/sizing as dashboard quick actions
- [ ] All transitions use consistent duration (150–300ms)
- [ ] Dark mode contrast verified (4.5:1 minimum)

### Interaction
- [ ] Header scroll detection works smoothly (no jank)
- [ ] Bottom nav tabs highlight active route correctly
- [ ] FAB menu opens/closes with spring animation (not instant)
- [ ] All touch targets ≥44×44px (safe area respected)
- [ ] Haptic feedback on FAB open/close

### Accessibility
- [ ] All icons have `aria-label` (DSIcon supports this)
- [ ] Tab order matches visual order
- [ ] Keyboard navigation works on desktop
- [ ] Screen reader announces active tab
- [ ] Focus states visible (ring or indicator)

### Performance
- [ ] No layout shifts on scroll (use transform, not width/height)
- [ ] Icons load from DSIcon (not embedded images)
- [ ] Animations use `transform` + `opacity` only (no width/height animation)
- [ ] Framer Motion stagger is reasonable (<300ms total)

### Mobile Safety
- [ ] Header respects `safe-area-inset-top` (notch + status bar)
- [ ] Bottom nav respects `safe-area-inset-bottom` (gesture bar + home indicator)
- [ ] Content not hidden behind fixed bars
- [ ] No horizontal scroll on any device

---

## 🚀 Implementation Order

1. **Start with Header** (Phase 1) — fastest, isolated change
2. **Add Bottom Nav** (Phase 2) — largest component, study dashboard patterns first
3. **Build FAB Menu** (Phase 3) — depends on header + nav, most complex interaction
4. **Integration** (Phase 4) — wire up layout, test all routes

---

## 📝 Notes for Copilot

### Do's
✅ **Copy dashboard patterns** — `header.tsx` and `mobile-nav.tsx` are your source of truth  
✅ **Reuse DSIcon** — It already supports all v4 icons, no custom SVG needed  
✅ **Study animation patterns** — Framer Motion in `mobile-nav.tsx` is production-grade  
✅ **Preserve safe areas** — Mobile notches/gesture bars are handled via CSS env() vars  
✅ **Test on real device** — Haptic feedback and scroll detection need real testing  

### Don'ts
❌ **Don't create new icon set** — DSIcon handles v4 Vibrante style  
❌ **Don't hard-code colors** — Use Tailwind tokens (brand-primary, text-muted, etc.)  
❌ **Don't animate width/height** — Use transform + opacity only  
❌ **Don't skip accessibility** — aria-labels on every icon, focus states visible  
❌ **Don't forget haptic** — Mobile users expect vibration feedback on key actions  

---

## 📞 Questions for Clarification

- **Student FAB menu destinations**: Should each submenu item route to `/ia?action=X` or dedicated routes?
- **Bottom nav tab icons**: Any specific icons besides the defaults, or use DSIcon v4 standard set?
- **Sidebar toggle on student**: Is there ANY sidebar logic in current student header to remove, or is it already clean?
- **Animation performance**: Is spring physics required, or standard easing (ease-out) acceptable?

---

## 🔗 Related Docs

- `.claude/docs/DESIGN-SYSTEM.md` — Color tokens, typography, spacing
- `.claude/docs/RULES.md` — Production rules (safety, accessibility)
- `.claude/docs/CONVENTIONS.md` — Icon usage, Tailwind conventions

---

**Last Updated**: 2026-04-05  
**Plan Author**: Claude Code  
**Status**: Ready for Implementation
