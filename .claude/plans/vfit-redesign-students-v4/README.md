# VFIT Student App v4 Redesign — Complete Plan

> **Status**: ✅ Ready for Implementation  
> **Date**: 2026-04-05  
> **Target**: Student (Aluno) B2C App Interface Redesign  
> **Scope**: Header + BottomNav + FAB (matching dashboard v3→v4)

---

## 📚 Plan Contents

This folder contains a **complete, token-optimized redesign plan** for the student app v4 upgrade. All files are ready for copilot implementation with **minimal token overhead**.

### Files in This Plan

| File | Purpose | Read Time | Best For |
|------|---------|-----------|----------|
| **[QUICK-START.md](./QUICK-START.md)** | Fast overview (3 files to modify, phases, checklist) | 5 min | Getting started quickly |
| **[PLAN.md](./PLAN.md)** | Complete strategy (architecture, phases, tokens, quality) | 10 min | Understanding the full scope |
| **[VISUAL-REFERENCE.md](./VISUAL-REFERENCE.md)** | ASCII mockups (header, nav, FAB, animations, states) | 8 min | Visual design reference |
| **[CSS-TOKENS.md](./CSS-TOKENS.md)** | Copy-paste Tailwind classes + design tokens | 12 min | Implementation reference |
| **[README.md](./README.md)** | This file — navigation guide | 2 min | Starting here |

---

## 🎯 What's Being Redesigned

### Current State (v3)
- Student header exists but is minimal (back button + title + avatar)
- **No persistent bottom nav** (student has no sidebar like personal/admin)
- Student FAB doesn't exist

### Target State (v4)
- **Header**: Upgrade backdrop effect, add scroll shadow, modern icons
- **Bottom Nav**: Create NEW persistent 5-tab navigation (matching dashboard style)
- **FAB Menu**: Create NEW expandable AI submenu (2×3 grid with 6 actions)

**Key difference**: Student role has **NO sidebar or hamburger menu** — only header + bottom nav.

---

## 🚀 Quick Start Path

### For Copilot Implementing This Plan

1. **Read [QUICK-START.md](./QUICK-START.md)** (5 min)
   - Understand the 3 phases
   - See which files to modify/create
   - Copy-paste code templates

2. **Study Benchmark Files** (15 min)
   - `src/components/layout/header.tsx` — Dashboard v4 header
   - `src/components/layout/mobile-nav.tsx` — Dashboard bottom nav
   - `src/components/ui/ai-bot-fab.tsx` — FAB template

3. **Implement Phase 1: Header** (20 min)
   - Modify `src/components/navigation/student-header.tsx`
   - Add scroll detection + backdrop upgrade
   - Reference [VISUAL-REFERENCE.md](./VISUAL-REFERENCE.md) for styling

4. **Implement Phase 2: Bottom Nav** (45 min)
   - Create `src/components/navigation/student-bottom-nav.tsx`
   - 5-tab layout with modern icons
   - Study haptic feedback from dashboard

5. **Implement Phase 3: FAB Menu** (30 min)
   - Create `src/components/navigation/student-fab-menu.tsx`
   - Expandable grid with spring animation
   - Copy animation patterns from dashboard

6. **Integration & Testing** (10 min)
   - Wire up in `src/app/(app)/layout.tsx`
   - Test on real mobile device
   - Verify haptic feedback + scroll behavior

**Total Time**: ~120 minutes (2 hours) including testing

---

## 📖 Reading Guide by Role

### For Product/Design Review
1. Start: [VISUAL-REFERENCE.md](./VISUAL-REFERENCE.md) — See all mockups
2. Then: [PLAN.md](./PLAN.md) § "Design Tokens & Style Guide" — Verify colors/effects
3. Check: Quality checklist in [PLAN.md](./PLAN.md) § "Quality Checklist"

### For Engineering (Copilot)
1. Start: [QUICK-START.md](./QUICK-START.md) — Get oriented
2. Then: [PLAN.md](./PLAN.md) § "Implementation Phases" — Understand structure
3. Reference: [CSS-TOKENS.md](./CSS-TOKENS.md) — Copy-paste classes
4. Visualize: [VISUAL-REFERENCE.md](./VISUAL-REFERENCE.md) — See target state

### For QA/Testing
1. Start: [PLAN.md](./PLAN.md) § "Quality Checklist" — Know what to verify
2. Then: [VISUAL-REFERENCE.md](./VISUAL-REFERENCE.md) — Understand expected behavior
3. Reference: [QUICK-START.md](./QUICK-START.md) § "Checklist Before Ship"

---

## 🎨 Design System Reference

All tokens are from VFIT's existing design system. **No new colors or effects are being created.**

### Key Design Tokens

**Colors**:
- `brand-primary` — Emerald/teal accent
- `text-primary`, `text-secondary`, `text-muted` — Text hierarchy
- `bg-primary`, `bg-secondary`, `bg-page` — Surfaces
- `border-light` — Subtle dividers

**Effects**:
- `backdrop-blur-2xl backdrop-saturate-180` — Header v4 glass effect
- `shadow-[0_4px_16px_rgba(16,185,129,0.35)]` — FAB glow
- `transition-all duration-300` — Smooth animations

**Spacing**:
- `px-4 lg:px-6` — Header padding
- `gap-3` — Large gap
- `gap-2` — Small gap
- Safe area vars: `env(safe-area-inset-top/bottom)` for mobile notches

See [CSS-TOKENS.md](./CSS-TOKENS.md) for complete reference.

---

## 📋 File Modification Matrix

| File | Phase | Type | Effort | Status |
|------|-------|------|--------|--------|
| `src/components/navigation/student-header.tsx` | 1 | Modify | 20 min | Ready |
| `src/components/navigation/student-bottom-nav.tsx` | 2 | Create | 45 min | Ready (has template) |
| `src/components/navigation/student-fab-menu.tsx` | 3 | Create | 30 min | Ready (has template) |
| `src/app/(app)/layout.tsx` | 4 | Wire-up | 10 min | Ready |
| `src/lib/navigation.ts` | 4 | Check | 5 min | Ready |

**Benchmark files to study** (don't modify):
- `src/components/layout/header.tsx` (450 tokens — scroll logic + backdrop)
- `src/components/layout/mobile-nav.tsx` (1200 tokens — icon styles + animation)
- `src/components/ui/ai-bot-fab.tsx` (80 tokens — FAB template)

---

## ✅ Quality Gates

Before final PR, verify:

### Visual Consistency
- [ ] Header backdrop matches dashboard exactly (blur-2xl + saturate-180)
- [ ] Bottom nav icons are v4 modern style (via DSIcon)
- [ ] FAB menu grid spacing matches dashboard quick actions
- [ ] All animations smooth (duration 150–300ms)

### Interaction
- [ ] Header scroll detection works smoothly
- [ ] Bottom nav tabs highlight active route
- [ ] FAB menu opens/closes with spring animation
- [ ] Touch targets all ≥44×44px

### Accessibility
- [ ] All icons have aria-labels
- [ ] Tab order correct
- [ ] Focus states visible
- [ ] Screen reader announces active tab

### Mobile Safety
- [ ] Safe areas respected (notch + gesture bar)
- [ ] No horizontal scroll
- [ ] Content not hidden behind fixed elements
- [ ] Tested on real device with haptic feedback

See [PLAN.md](./PLAN.md) § "Quality Checklist" for full requirements.

---

## 🔗 Related Documentation

- **Design System**: `.claude/docs/DESIGN-SYSTEM.md` — Colors, typography, spacing
- **Rules**: `.claude/docs/RULES.md` — Production rules & safety
- **Conventions**: `.claude/docs/CONVENTIONS.md` — Icon usage, TS, CSS patterns
- **TRACKING**: `.claude/plans/vfit-domain-migration/TRACKING.md` — Project status

---

## 📞 Notes & Questions

### Do's ✅
- Copy dashboard patterns from `header.tsx` and `mobile-nav.tsx`
- Reuse DSIcon for all icons (v4 support built-in)
- Study Framer Motion patterns in dashboard
- Test on real mobile device
- Use design tokens (never raw hex values)

### Don'ts ❌
- Don't create custom icon set (DSIcon handles it)
- Don't hard-code colors (use Tailwind tokens)
- Don't animate width/height (transform + opacity only)
- Don't skip accessibility
- Don't forget haptic feedback on mobile

### Clarifications Needed?
If copilot has questions, refer to:
1. [PLAN.md](./PLAN.md) — Usually has the answer
2. Dashboard source code — Always the source of truth
3. `.claude/docs/DESIGN-SYSTEM.md` — For design tokens
4. [QUICK-START.md](./QUICK-START.md) — For fast answers

---

## 📊 Token Economy

This plan was designed to **minimize token overhead**:

| Resource | Tokens | Purpose |
|----------|--------|---------|
| PLAN.md (full spec) | ~2,200 | Complete strategy + architecture |
| QUICK-START.md (fast) | ~1,100 | Quick overview + templates |
| VISUAL-REFERENCE.md (mockups) | ~2,600 | Visual + animation reference |
| CSS-TOKENS.md (copy-paste) | ~2,800 | Tailwind class reference |
| **Total** | **~8,700** | **4 documents covering all aspects** |

**Copilot cost to implement**: ~150–200 tokens per phase (just reading this plan + dashboard benchmarks).

---

## 🎬 Next Steps

1. **Copilot**: Read [QUICK-START.md](./QUICK-START.md) to get oriented
2. **Copilot**: Study dashboard `header.tsx`, `mobile-nav.tsx`, `ai-bot-fab.tsx`
3. **Copilot**: Start Phase 1 (header) — should take 20 min
4. **Product**: Review [VISUAL-REFERENCE.md](./VISUAL-REFERENCE.md) for design sign-off
5. **QA**: Prepare test cases from [PLAN.md](./PLAN.md) § "Quality Checklist"

---

## 📝 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-05 | 1.0 | Initial plan created |

---

**Created by**: Claude Code (ui-ux-pro-max skill)  
**Status**: Ready for Implementation ✅  
**Last Updated**: 2026-04-05 02:28 UTC
