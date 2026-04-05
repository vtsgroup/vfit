# 🚀 Quick Start — Student v4 Redesign

**What's changing?** Header + BottomNav + FAB to match dashboard v3→v4 upgrade.

---

## 3 Files to Modify

| File | Phase | What | Time |
|------|-------|------|------|
| `src/components/navigation/student-header.tsx` | 1 | Upgrade backdrop + scroll effect + modern icons | 20 min |
| `src/components/navigation/student-bottom-nav.tsx` | 2 | **CREATE NEW** — 5-tab nav with modern styling | 45 min |
| `src/components/navigation/student-fab-menu.tsx` | 3 | **CREATE NEW** — Expandable AI submenu (2×3 grid) | 30 min |

**Total**: ~95 minutes + integration testing

---

## 3 Benchmark Files (READ FIRST)

Study these to understand dashboard v4 patterns:

1. **`src/components/layout/header.tsx`** (450 tokens)
   - Lines 129–135: Scroll detection + shadow animation
   - Lines 140–146: Backdrop effect classes
   - Lines 309–312: Subtle bottom border

2. **`src/components/layout/mobile-nav.tsx`** (1200 tokens)
   - Lines 43–47: Haptic feedback helper
   - Lines 77–156: Ultra-modern icon SVGs (filled vs outline)
   - Lines 200–280: Active tab indicator styling
   - Lines 300–400: FAB + quick actions grid with Framer Motion

3. **`src/components/ui/ai-bot-fab.tsx`** (80 tokens)
   - FAB styling template (gradient, shadow, hover scale)

---

## Phase 1: Header (20 min) ⚡

**File**: `src/components/navigation/student-header.tsx`

**Changes**:
1. Replace backdrop: `bg-(--color-bg-primary)/85 backdrop-blur-xl` 
   → `backdrop-blur-2xl backdrop-saturate-180 bg-bg-primary/85`

2. Add scroll detection (copy from dashboard `header.tsx` lines 129–135):
   ```tsx
   const [scrolled, setScrolled] = useState(false)
   useEffect(() => {
     const onScroll = () => setScrolled(window.scrollY > 8)
     window.addEventListener('scroll', onScroll, { passive: true })
     return () => window.removeEventListener('scroll', onScroll)
   }, [])
   ```

3. Add CSS class on header: `ds3-header` (defines styling)

4. Conditionally add shadow: 
   ```tsx
   scrolled && 'ds3-header-scrolled'
   ```

5. Add bottom border (lines 309–312 from dashboard):
   ```tsx
   <div className={cn(
     'absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300',
     scrolled ? 'bg-border-light opacity-100' : 'bg-border-light/50 opacity-60'
   )} />
   ```

---

## Phase 2: Bottom Nav (45 min) 📱

**File**: Create `src/components/navigation/student-bottom-nav.tsx`

**Structure** (study `mobile-nav.tsx` for patterns):
```tsx
export function StudentBottomNav() {
  // 1. Detect active route
  const pathname = usePathname()
  
  // 2. Define 5 tabs (for students):
  const tabs = [
    { path: '/treinos', label: 'Treinos', icon: 'home' },
    { path: '/nutricao', label: 'Nutrição', icon: 'apple' },
    { path: '/ia', label: 'IA & Dicas', icon: 'sparkles' },
    { path: '/avaliacoes', label: 'Avaliações', icon: 'chart' },
    { path: '/perfil', label: 'Perfil', icon: 'user' },
  ]
  
  // 3. Render sticky bottom nav with:
  // - Flex row of 5 icon buttons
  // - Active tab indicator (accent color + bold icon)
  // - FAB in the center (but DON'T add quick actions grid here)
  // - Safe area padding: bottom-[calc(4.5rem+env(safe-area-inset-bottom))]
}
```

**Styling** (from dashboard):
- `fixed bottom-0 left-0 right-0 z-40`
- `backdrop-blur-xl bg-bg-primary/85 border-t border-border-light/50`
- Icons: `DSIcon` with size 24
- Active state: `text-brand-primary` + weight-600
- Inactive state: `text-text-muted` + opacity-60
- Touch feedback: `active:scale-95` + haptic on click

**Haptic** (copy from mobile-nav.tsx):
```tsx
function haptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(8)
  }
}
```

---

## Phase 3: FAB Menu (30 min) 🤖

**File**: Create `src/components/navigation/student-fab-menu.tsx`

**What it does**:
- Central FAB button (same green gradient as current)
- On tap → expands to 6-item grid (2×3)
- Grid items: Goals, Progress, Recommended Exercise, Nutrition Tip, Quick Q&A, Close
- Backdrop blur overlay (tap to close)
- Spring animation (each item staggered 50ms)
- Routes to `/ia?action=goals`, `/ia?action=progress`, etc.

**Structure**:
```tsx
export function StudentFabMenu() {
  const [expanded, setExpanded] = useState(false)
  
  const actions = [
    { icon: 'target', label: 'Metas', action: 'goals' },
    { icon: 'trending', label: 'Progresso', action: 'progress' },
    { icon: 'dumbbell', label: 'Exercício', action: 'exercise' },
    { icon: 'apple', label: 'Nutrição', action: 'nutrition' },
    { icon: 'brain', label: 'Perguntas', action: 'qa' },
    { icon: 'x', label: 'Fechar', action: 'close' },
  ]
  
  // 1. Render FAB button (study ai-bot-fab.tsx)
  // 2. When clicked, setExpanded(true)
  // 3. Render grid overlay with Framer Motion stagger
  // 4. Each item onClick → router.push(`/ia?action=${action}`)
  // 5. Tap backdrop or item → setExpanded(false) + haptic
}
```

**Animation**:
- Use Framer Motion `AnimatePresence` + `motion.div`
- Backdrop fade: `opacity: expanded ? 1 : 0, pointerEvents: expanded ? 'auto' : 'none'`
- Grid items: scale `0.8 → 1.0` with stagger `0.05s` per item
- Spring physics: `type: "spring", damping: 12, stiffness: 200`

---

## Integration (10 min) 🔌

**File**: `src/app/(app)/layout.tsx`

Check that:
```tsx
import { StudentHeader } from '@/components/navigation/student-header'
import { StudentBottomNav } from '@/components/navigation/student-bottom-nav'
import { StudentFabMenu } from '@/components/navigation/student-fab-menu'

export default function StudentLayout({ children }) {
  return (
    <div className="min-h-dvh bg-bg-page">
      <StudentHeader />
      <main className="pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <StudentBottomNav />
      <StudentFabMenu />
    </div>
  )
}
```

---

## ✅ Checklist Before Ship

- [ ] Header backdrop effect matches dashboard (blur-2xl + saturate-180)
- [ ] Scroll shadow appears/disappears smoothly (no jank)
- [ ] Bottom nav icons are v4 modern style (DSIcon handles this)
- [ ] Active tab indicator is clear (color + weight)
- [ ] FAB menu expands with spring animation
- [ ] Each FAB submenu item routes correctly
- [ ] Haptic feedback on FAB open/close ✨
- [ ] Touch targets all ≥44×44px
- [ ] Safe areas respected (top + bottom)
- [ ] Dark mode contrast verified (≥4.5:1)
- [ ] Tested on real mobile device (scroll, haptic, animation)

---

## 🎯 Next Steps

1. Read the full [PLAN.md](./PLAN.md)
2. Open Phase 1 file: `student-header.tsx`
3. Copy scroll logic from dashboard `header.tsx`
4. Run `/ui-ux-pro-max` to review visual consistency
5. Test on device before shipping

---

**Estimated Total Time**: 1.5–2 hours (including testing)
