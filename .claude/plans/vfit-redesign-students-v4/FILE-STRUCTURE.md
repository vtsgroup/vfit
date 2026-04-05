# 📁 Complete File Structure Reference

This document maps exactly where files are and what to do with each one.

---

## Plan Folder Contents

```
.claude/plans/vfit-redesign-students-v4/
├── README.md                    ← Navigation guide (start here)
├── EXEC-SUMMARY.txt             ← 1-page executive summary
├── QUICK-START.md               ← 5-min fast track for copilot
├── PLAN.md                      ← Full 10-min comprehensive plan
├── VISUAL-REFERENCE.md          ← ASCII mockups + animations
├── CSS-TOKENS.md                ← Copy-paste Tailwind classes
└── FILE-STRUCTURE.md            ← This file
```

**Total**: 7 files, ~50KB, designed for 100% copilot self-service implementation

---

## Codebase Files: What to Modify

### Phase 1: Header (Modify)

```
src/components/navigation/student-header.tsx
├─ Current state: Sticky header, back button or logo, centered title, bell + avatar
├─ What to change:
│  ├─ Replace backdrop: bg-(--color-bg-primary)/85 backdrop-blur-xl
│  │                  → backdrop-blur-2xl backdrop-saturate-180 bg-bg-primary/85
│  ├─ Add scroll detection (copy lines 129-135 from dashboard header.tsx)
│  ├─ Add CSS class: ds3-header
│  ├─ Add conditional scrolled class: scrolled && 'ds3-header-scrolled'
│  └─ Add bottom border (lines 309-312 from dashboard)
├─ Estimated effort: 20 minutes
└─ Status: Ready to modify
```

### Phase 2: Bottom Nav (Create New)

```
src/components/navigation/student-bottom-nav.tsx
├─ Current state: DOES NOT EXIST
├─ What to create:
│  ├─ New component: StudentBottomNav()
│  ├─ Fixed bottom nav with 5 tabs
│  ├─ Tabs: 🏠 Treinos | 🥗 Nutrição | 🤖 IA & Dicas | 📊 Avaliações | 👤 Perfil
│  ├─ Study patterns from: src/components/layout/mobile-nav.tsx
│  ├─ Styling: backdrop-blur-xl, border-top, flex layout
│  ├─ Active state: text-brand-primary + font-semibold + underline
│  ├─ Inactive state: text-text-muted + opacity-60
│  └─ Haptic feedback: Copy function from mobile-nav.tsx lines 43-47
├─ Estimated effort: 45 minutes
└─ Status: Template ready
```

### Phase 3: FAB Menu (Create New)

```
src/components/navigation/student-fab-menu.tsx
├─ Current state: DOES NOT EXIST
├─ What to create:
│  ├─ New component: StudentFabMenu()
│  ├─ Floating action button (56×56px, green gradient)
│  ├─ Expands to 2×3 grid with 6 actions:
│  │  ├─ 🎯 Metas (Goals) → /ia?action=goals
│  │  ├─ 📈 Progresso (Progress) → /ia?action=progress
│  │  ├─ 💪 Exercício Recomendado (Exercise) → /ia?action=exercise
│  │  ├─ 🥗 Dica de Nutrição (Nutrition) → /ia?action=nutrition
│  │  ├─ 🧠 Pergunta Rápida (Q&A) → /ia?action=qa
│  │  └─ ❌ Fechar (Close) → setExpanded(false)
│  ├─ Study patterns from: src/components/layout/mobile-nav.tsx (full file)
│  ├─ Animation: Framer Motion spring physics, stagger 50ms per item
│  ├─ Backdrop: opacity 40-60%, blur overlay, tap to close
│  └─ Haptic: Vibrate on open/close
├─ Estimated effort: 30 minutes
└─ Status: Template ready
```

### Phase 4: Wire Up (Modify)

```
src/app/(app)/layout.tsx
├─ Current state: Layout wrapper (likely already exists)
├─ What to check/modify:
│  ├─ Import StudentHeader from '@/components/navigation/student-header'
│  ├─ Import StudentBottomNav from '@/components/navigation/student-bottom-nav'
│  ├─ Import StudentFabMenu from '@/components/navigation/student-fab-menu'
│  ├─ Render <StudentHeader /> at top
│  ├─ Render {children} in main with padding:
│  │  ├─ Top: pt-[calc(4rem+env(safe-area-inset-top))]
│  │  └─ Bottom: pb-[calc(5.5rem+env(safe-area-inset-bottom))]
│  ├─ Render <StudentBottomNav /> before closing div
│  ├─ Render <StudentFabMenu /> before closing div
│  └─ Ensure all 3 components render on all routes
├─ Estimated effort: 10 minutes
└─ Status: Ready to wire
```

### Route Configuration (Check)

```
src/lib/navigation.ts
├─ Current state: Probably defines student route list
├─ What to verify:
│  ├─ Student routes are defined: /treinos, /nutricao, /ia, /avaliacoes, /perfil
│  ├─ No new routes need adding (FAB uses query params: /ia?action=goals, etc.)
│  └─ Route config is used by StudentBottomNav to highlight active tab
├─ Estimated effort: 5 minutes
└─ Status: Review only (no changes needed)
```

---

## Benchmark Files: Study These (Don't Edit)

### Dashboard Header (Study Scroll Logic)

```
src/components/layout/header.tsx
├─ Token cost to read: ~450 tokens
├─ What to copy:
│  ├─ Lines 129-135: Scroll detection logic
│  │  └─ useState(false), useEffect with addEventListener
│  ├─ Lines 140-146: ds3-header class + conditional scrolled class
│  ├─ Lines 309-312: Bottom border fade on scroll
│  └─ Lines 112-138: Header structure pattern
├─ How to use:
│  └─ Copy exact scroll detection + apply to student-header.tsx
└─ Don't modify this file
```

### Dashboard Mobile Nav (Study Full Pattern)

```
src/components/layout/mobile-nav.tsx
├─ Token cost to read: ~1200 tokens
├─ What to copy:
│  ├─ Lines 43-47: haptic() function for vibration
│  ├─ Lines 77-156: Icon SVG patterns (filled vs outline)
│  ├─ Lines 200-280: Active tab indicator styling
│  ├─ Lines 300+: Framer Motion animation setup
│  ├─ Animation patterns: stagger, spring physics, scale on press
│  └─ Tab structure: icon + label pattern
├─ How to use:
│  ├─ Copy haptic function to student-bottom-nav.tsx
│  ├─ Use icon patterns as reference
│  ├─ Copy Framer Motion patterns to FAB menu
│  └─ Use active tab styling as template
└─ Don't modify this file
```

### Current FAB (Study Template)

```
src/components/ui/ai-bot-fab.tsx
├─ Token cost to read: ~80 tokens
├─ What to copy:
│  ├─ Lines 58-79: FAB button structure + className pattern
│  ├─ Gradient: from-emerald-400 via-emerald-500 to-emerald-700
│  ├─ Shadow: shadow-[0_4px_16px_rgba(16,185,129,0.35)]
│  ├─ Hover effect: scale-108 -rotate-5
│  ├─ Safe area: max-sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]
│  └─ Icon: AiBotIcon component
├─ How to use:
│  └─ Use as styling template for StudentFabMenu FAB button
└─ Don't modify this file
```

### Dashboard Layout (Study Structure)

```
src/components/layout/dashboard-layout.tsx
├─ Token cost to read: ~100 tokens
├─ What to understand:
│  ├─ Layout wrapper structure (Header + Sidebar + Main + Nav)
│  ├─ Main content padding calculation
│  ├─ How components are composed
│  └─ Safe area awareness
├─ How to use:
│  └─ Use as pattern for student-app layout wrapper
└─ Don't modify this file
```

---

## Design System Reference Files

### Main Design System Doc

```
.claude/docs/DESIGN-SYSTEM.md
├─ Contains: Color tokens, typography, spacing, effects, components
├─ How to use:
│  ├─ Reference for exact token names (text-primary, bg-primary, etc.)
│  ├─ Verify color contrast ratios (WCAG 4.5:1 minimum)
│  └─ Check spacing scale (4/8dp rhythm)
└─ Token cost: ~11,826 tokens (use sparingly, reference CSS-TOKENS.md instead)
```

### Critical Rules

```
.claude/docs/RULES.md
├─ Contains: 19 production rules
├─ Key rules for this project:
│  ├─ No console.log in production
│  ├─ All icons via DSIcon (no custom SVGs)
│  ├─ Safe area awareness (mobile notches)
│  ├─ Haptic feedback on key interactions
│  └─ WCAG contrast compliance
└─ Must read before final implementation
```

### Conventions

```
.claude/docs/CONVENTIONS.md
├─ Contains: Import structure, TypeScript conventions, CSS/Tailwind v4, auth guards
├─ How to use:
│  ├─ Follow import patterns (no circular imports)
│  ├─ Use Tailwind v4 conventions
│  └─ Reference auth patterns if needed
└─ Review before code submission
```

---

## Implementation Workflow

### Before You Start

```
1. Read this file (FILE-STRUCTURE.md) — 5 min
2. Read QUICK-START.md — 5 min
3. Skim PLAN.md § "Implementation Phases" — 5 min
   Total prep: 15 minutes
```

### Phase 1: Header (Start Here)

```
1. Open src/components/layout/header.tsx
   ├─ Read lines 129-135 (scroll detection)
   ├─ Read lines 140-146 (backdrop + class)
   └─ Read lines 309-312 (border animation)

2. Open src/components/navigation/student-header.tsx
   └─ Make the 5 changes documented above

3. Reference CSS-TOKENS.md for exact class names

4. Test: Scroll on mobile, verify shadow appears
```

### Phase 2: Bottom Nav (45 min)

```
1. Create new file: src/components/navigation/student-bottom-nav.tsx

2. Study src/components/layout/mobile-nav.tsx
   ├─ Lines 43-47 (haptic function)
   ├─ Lines 77-156 (icon patterns)
   ├─ Lines 200-280 (tab styling)
   └─ Entire file (animation patterns)

3. Use QUICK-START.md template as starting point

4. Copy haptic function and animation patterns

5. Test: Click tabs, verify active state + haptic
```

### Phase 3: FAB Menu (30 min)

```
1. Create new file: src/components/navigation/student-fab-menu.tsx

2. Study src/components/layout/mobile-nav.tsx (full file again)

3. Use QUICK-START.md template as starting point

4. Implement Framer Motion animation:
   ├─ State: expanded (boolean)
   ├─ Backdrop: fade in/out
   ├─ Grid items: scale 0.8→1.0 with stagger

5. Test: Tap FAB, verify menu opens with spring animation
```

### Phase 4: Integration (10 min)

```
1. Open src/app/(app)/layout.tsx

2. Import 3 components at top:
   ├─ import { StudentHeader } from '@/components/navigation/student-header'
   ├─ import { StudentBottomNav } from '@/components/navigation/student-bottom-nav'
   └─ import { StudentFabMenu } from '@/components/navigation/student-fab-menu'

3. Render structure:
   ├─ <StudentHeader />
   ├─ <main> with padding
   ├─ {children}
   ├─ <StudentBottomNav />
   └─ <StudentFabMenu />

4. Test: All routes render with header + nav + FAB
```

### Testing (Comprehensive)

```
Before shipping:

VISUAL:
  □ Screenshot on light mode
  □ Screenshot on dark mode
  □ Compare to VISUAL-REFERENCE.md

INTERACTION:
  □ Header: Scroll to trigger shadow
  □ Nav: Click each tab, verify highlight
  □ FAB: Tap to open, verify animation + grid
  □ FAB: Tap menu item, verify route change
  □ FAB: Tap close, verify menu closes

MOBILE SPECIFIC:
  □ On real iOS device:
    ├─ Safe area respected (notch visible)
    ├─ Bottom nav above gesture bar
    ├─ Haptic feedback works
    └─ FAB above nav, not hidden
  □ On real Android device:
    ├─ Safe area respected (gesture bar)
    ├─ Haptic feedback works
    └─ All touch targets ≥48dp

ACCESSIBILITY:
  □ Tab through with keyboard
  □ Verify focus visible (ring on buttons)
  □ Screen reader announces tabs
  □ All icons have labels
```

---

## Quick File Reference

| File | Location | Status | Purpose |
|------|----------|--------|---------|
| student-header.tsx | src/components/navigation/ | ✏️ MODIFY | Phase 1 |
| student-bottom-nav.tsx | src/components/navigation/ | 📝 CREATE | Phase 2 |
| student-fab-menu.tsx | src/components/navigation/ | 📝 CREATE | Phase 3 |
| layout.tsx | src/app/(app)/ | ⚙️ WIRE-UP | Phase 4 |
| header.tsx | src/components/layout/ | 🔍 STUDY | Reference |
| mobile-nav.tsx | src/components/layout/ | 🔍 STUDY | Reference |
| ai-bot-fab.tsx | src/components/ui/ | 🔍 STUDY | Reference |
| navigation.ts | src/lib/ | ✓ CHECK | Review |

---

## File Modification Checklist

### Phase 1: Header
- [ ] Backup original student-header.tsx
- [ ] Replace backdrop classes
- [ ] Add scroll detection code
- [ ] Add ds3-header class
- [ ] Add bottom border
- [ ] Test scroll behavior

### Phase 2: Bottom Nav
- [ ] Create student-bottom-nav.tsx
- [ ] Add 5 tabs with icons
- [ ] Style active state
- [ ] Add haptic feedback
- [ ] Add safe area padding
- [ ] Test tab highlighting

### Phase 3: FAB Menu
- [ ] Create student-fab-menu.tsx
- [ ] Style FAB button
- [ ] Build grid layout
- [ ] Add Framer Motion animation
- [ ] Add route handling
- [ ] Test menu open/close

### Phase 4: Integration
- [ ] Update layout.tsx imports
- [ ] Render 3 components
- [ ] Add content padding
- [ ] Test all routes
- [ ] Verify no layout shifts

### Testing
- [ ] Visual on light/dark mode
- [ ] Interaction on real device
- [ ] Accessibility with keyboard
- [ ] Mobile safe areas
- [ ] Haptic feedback
- [ ] Performance (no jank)

---

## Emergency Reference

If stuck on something:

| Issue | Look In | Lines |
|-------|----------|-------|
| Scroll shadow not working | header.tsx | 129-135, 309-312 |
| Active tab styling wrong | mobile-nav.tsx | 200-280 |
| FAB animation jerky | mobile-nav.tsx | Entire file (Framer Motion patterns) |
| Safe area padding off | dashboard-layout.tsx | 62-65 |
| Haptic not working | mobile-nav.tsx | 43-47 |
| Icons look wrong | DSIcon prop in any component | Check name prop |
| Backdrop effect missing | header.tsx | 140-146 |
| Touch targets too small | CSS-TOKENS.md | "touch-target-size" section |

---

## Summary

- **Total files to modify/create**: 4
- **Total files to study**: 4
- **Total time**: ~105 minutes
- **Total token cost**: ~2,260 tokens (to read benchmarks)
- **Plan documents**: 7 files in .claude/plans/vfit-redesign-students-v4/

You have everything you need. Go implement! ✨

---

**Last Updated**: 2026-04-05
