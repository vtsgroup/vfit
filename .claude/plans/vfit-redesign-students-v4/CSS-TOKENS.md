# 🎨 CSS Tokens & Tailwind Classes — Copy/Paste Reference

All tokens are from VFIT design system. **Never use raw hex values** — use Tailwind semantic tokens.

---

## Colors

### Text

```tsx
// Primary text (headings, labels)
className="text-text-primary"

// Secondary text (subtitles, descriptions)
className="text-text-secondary"

// Muted text (placeholders, disabled)
className="text-text-muted"

// On brand (white text on brand background)
className="text-white"  // or system white
```

### Backgrounds

```tsx
// Page background (default)
className="bg-bg-page"

// Primary surface (cards, containers)
className="bg-bg-primary"

// Secondary surface (hover states, nested surfaces)
className="bg-bg-secondary/50"  // with opacity

// Tertiary (very light, hover buttons)
className="bg-bg-tertiary"
```

### Borders

```tsx
// Light border (dividers, subtle)
className="border border-border-light"

// Light border with opacity (very subtle)
className="border border-border-light/50"

// Darker border on active states
className="border-border-light/80"
```

### Brand

```tsx
// Primary accent (buttons, active states, FAB)
className="bg-brand-primary"
className="text-brand-primary"

// Emerald gradient (FAB gradient)
className="bg-linear-to-br from-emerald-400 via-emerald-500 to-emerald-700"
```

---

## Effects

### Backdrop (Header & Modal Overlay)

```tsx
// Standard header backdrop (v4)
className="backdrop-blur-2xl backdrop-saturate-180"

// Alternative (lighter)
className="backdrop-blur-xl"

// Background with backdrop
className="bg-bg-primary/85 backdrop-blur-2xl backdrop-saturate-180"
```

### Shadows

```tsx
// FAB shadow (glow effect)
className="shadow-[0_4px_16px_rgba(16,185,129,0.35)]"

// FAB shadow on hover (enhanced)
className="shadow-[0_8px_24px_rgba(16,185,129,0.5),0_0_0_4px_rgba(16,185,129,0.12)]"

// Header shadow (subtle, on scroll)
className="shadow-lg shadow-black/20"

// Light shadow (cards, hover)
className="shadow-sm"
```

### Blur

```tsx
// Header/modal blur (v4 standard)
className="backdrop-blur-2xl"

// Lighter blur
className="backdrop-blur-xl"
```

---

## Spacing

### Padding

```tsx
// Header horizontal padding
className="px-4 lg:px-6"

// Header vertical (with safe area)
style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}

// Content padding (all sides)
className="px-3 py-4 sm:px-4 sm:py-5 md:px-5 lg:px-6 lg:py-6"

// Tight padding
className="p-2"
```

### Gaps

```tsx
// Header gap between elements
className="gap-3"  // Large gap
className="gap-2"  // Small gap
className="gap-1.5"  // Tiny gap

// Nav gap between tabs
className="gap-0"  // No gap (full width)
className="gap-2"  // With spacing
```

### Insets (Content Positioning)

```tsx
// Main content padding below header
className="pt-[calc(4rem+env(safe-area-inset-top,0px))]"

// Main content padding above bottom nav
className="pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]"

// Both (full safe area)
className="pt-[calc(4rem+env(safe-area-inset-top,0px))] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]"
```

### Margin

```tsx
// Margin between sections
className="mb-4 md:mb-6"

// Margin top
className="mt-3"
```

---

## Typography

### Font Size

```tsx
// Page title (h1)
className="text-base lg:text-lg"  // or text-xl

// Section title
className="text-sm font-bold"  // or text-base

// Body text
className="text-sm"

// Small text (labels, captions)
className="text-xs"  // 12px
className="text-[13px]"  // 13px exact

// Extra small (very tiny labels)
className="text-[11px]"
```

### Font Weight

```tsx
// Heading weight
className="font-bold"  // 700

// Semibold (active tabs, labels)
className="font-semibold"  // 600

// Medium (nav labels)
className="font-medium"  // 500

// Regular (body)
className="font-normal"  // 400
```

### Line Height

```tsx
// Tight (headings)
className="leading-tight"  // 1.25

// Normal (body)
className="leading-normal"  // 1.5

// Relaxed (large text)
className="leading-relaxed"  // 1.625
```

### Truncate & Overflow

```tsx
// Single line truncate
className="truncate"

// With max-width
className="truncate max-w-24"

// Ellipsis (explicit)
className="overflow-hidden text-ellipsis whitespace-nowrap"

// Line clamp (multiple lines)
className="line-clamp-2"
```

---

## Sizing

### Width

```tsx
// Full width
className="w-full"

// Min/max width
className="min-w-0"  // Allows flex items to shrink
className="max-w-none"

// Icons
className="w-4"  // 16px
className="w-5"  // 20px
className="w-6"  // 24px
className="w-7"  // 28px

// Buttons (flex)
className="w-10"  // 40px (icon button)
className="w-14"  // 56px (FAB)
```

### Height

```tsx
// Header height
className="h-14"  // 56px (standard header)

// Icon/button height
className="h-9"  // 36px
className="h-10"  // 40px
className="h-14"  // 56px (FAB)

// Fixed heights (text line)
className="h-px"  // 1px (divider)
className="h-0.5"  // 2px
```

### Border Radius

```tsx
// Standard rounded
className="rounded-xl"  // 12px

// Larger radius (FAB)
className="rounded-[18px]"

// Full circle
className="rounded-full"

// Small radius
className="rounded-[5px]"
className="rounded-[10px]"
```

---

## Layout

### Display

```tsx
// Flex layout
className="flex"
className="inline-flex"

// Grid layout
className="grid"
className="grid-cols-2"  // 2 columns

// Hidden
className="hidden"
className="hidden lg:block"  // Hidden on mobile, visible on desktop
```

### Flexbox

```tsx
// Direction
className="flex-row"  // Horizontal
className="flex-col"  // Vertical

// Alignment
className="items-center"  // Vertical center
className="items-start"
className="items-end"

className="justify-between"  // Space between
className="justify-center"
className="justify-start"
className="justify-end"

// Wrapping
className="flex-wrap"
className="flex-nowrap"  // No wrap

// Grow/shrink
className="flex-1"  // Grow to fill
className="shrink-0"  // Don't shrink
className="grow"
```

### Grid

```tsx
// 2×3 grid (FAB menu)
className="grid grid-cols-2 gap-3"

// 3 columns (bottom nav)
className="grid grid-cols-3"

// Gap between items
className="gap-2"
className="gap-3"
```

---

## Positioning

### Fixed/Sticky

```tsx
// Fixed (sticky to viewport)
className="fixed"
className="fixed top-0 left-0 right-0"  // Top bar
className="fixed bottom-0 left-0 right-0"  // Bottom bar

// Sticky (within scroll context)
className="sticky top-0"

// Z-index layering
className="z-30"  // Header
className="z-40"  // Bottom nav
className="z-50"  // FAB
className="z-60"  // Modal backdrop
```

### Positioning Values

```tsx
// Top/bottom/left/right
className="top-0"  // 0px
className="bottom-0"
className="left-0"
className="right-0"

className="top-2"  // 8px
className="bottom-6"  // 24px

// With calculations (env vars)
style={{ top: 'var(--demo-banner-offset, 0px)' }}
style={{ bottom: 'calc(5.5rem+env(safe-area-inset-bottom))' }}
```

---

## Transitions & Animations

### Duration

```tsx
// Standard duration
className="transition-all duration-200"
className="transition-all duration-300"  // Most common

// Specific properties
className="transition-colors duration-200"
className="transition-shadow duration-300"
className="transition-opacity duration-300"
className="transition-transform duration-300"
```

### Transforms

```tsx
// Scale
className="scale-95"  // 95%
className="scale-100"  // 100% (normal)
className="scale-108"  // 108% (hover)

// Rotate
className="-rotate-5"  // -5 degrees
className="rotate-0"

// Translate
className="translate-y-1"  // Move down 4px

// All together
className="transition-all duration-300 hover:scale-105 hover:-rotate-2"
```

### Hover & Active States

```tsx
// Hover state
className="hover:bg-bg-tertiary"
className="hover:text-brand-primary"
className="hover:scale-105"
className="hover:shadow-lg"

// Active/pressed state
className="active:scale-95"
className="active:opacity-80"

// Focus state (keyboard)
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"

// Group hover (for parent interaction)
className="group hover:text-brand-primary"
```

---

## Responsive

### Breakpoints

```tsx
// Mobile-first (no prefix = mobile)
className="text-sm"  // All sizes

// Small devices (640px+)
className="sm:px-4"

// Medium devices (768px+)
className="md:px-5"

// Large devices (1024px+)
className="lg:pl-65"  // Add left padding on desktop

// Extra large (1280px+)
className="xl:px-7"
```

### Conditional Visibility

```tsx
// Hidden on mobile, visible on desktop
className="hidden lg:flex"
className="hidden lg:block"

// Visible on mobile, hidden on desktop
className="lg:hidden"

// Mobile breakpoints
className="max-sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
```

---

## Common Component Patterns

### Button Base

```tsx
className="flex items-center justify-center px-4 py-2 rounded-xl border-0 transition-all duration-200 text-sm font-medium"
```

### Icon Button

```tsx
className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:scale-95"
```

### FAB Button

```tsx
className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-[18px] border-0 text-white bg-linear-to-br from-emerald-400 via-emerald-500 to-emerald-700 shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(16,185,129,0.5)] hover:scale-108 hover:-rotate-5 max-sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
```

### Header

```tsx
className="fixed right-0 left-0 z-30 backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300"
```

### Bottom Nav Item

```tsx
className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors text-text-muted hover:text-brand-primary hover:bg-bg-tertiary active:scale-95"
```

### Nav Item Active

```tsx
className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors text-brand-primary font-semibold"
```

### Scroll Detection Class

```tsx
// Applied conditionally:
<header className={cn(
  'ds3-header fixed right-0 z-30',
  scrolled && 'ds3-header-scrolled'  // This class adds shadow
)}>
```

---

## Dark Mode

### Text Dark Mode

```tsx
// Automatically adapts
className="text-text-primary"  // Light/dark aware

// Explicit dark mode
className="dark:text-white"
className="dark:text-text-primary/80"
```

### Background Dark Mode

```tsx
// Automatic
className="bg-bg-primary"  // Adapts to theme

// Explicit dark mode
className="dark:bg-slate-900"
```

### Border Dark Mode

```tsx
// Automatic
className="border-border-light"  // Adapts brightness

// Explicit (if needed)
className="dark:border-white/10"
```

---

## Opacity & Transparency

```tsx
// Full opacity
className="opacity-100"

// Reduced opacity
className="opacity-80"
className="opacity-60"
className="opacity-50"
className="opacity-40"

// Very light
className="opacity-20"
className="opacity-10"

// With colors
className="bg-white/5"
className="bg-black/20"
className="text-text-muted/60"
className="border-border-light/50"
```

---

## Combining Classes (cn() utility)

```tsx
import { cn } from '@/lib/utils'

// Conditional classes
className={cn(
  'base-class text-sm font-medium',  // Always applied
  scrolled && 'shadow-lg',  // Conditional
  isActive ? 'text-brand-primary' : 'text-text-muted'  // Ternary
)}
```

---

## Safe Area Variables

### CSS Environment Variables

```tsx
// Top safe area (notch, status bar)
style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}

// Bottom safe area (gesture bar, home indicator)
style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}

// Left/right (landscape mode)
style={{ paddingLeft: 'env(safe-area-inset-left, 0px)' }}

// Calc with safe area
className="pt-[calc(4rem+env(safe-area-inset-top,0px))]"
className="pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]"
```

---

## Common Tailwind Patterns

### Center Content

```tsx
// Flex center
className="flex items-center justify-center"

// Grid center
className="grid place-items-center"
```

### Truncate Text

```tsx
// Single line
className="truncate"

// With max width
className="truncate max-w-24"

// Multiple lines
className="line-clamp-2"
```

### Gap Spacing

```tsx
className="gap-1"    // 4px
className="gap-1.5"  // 6px
className="gap-2"    // 8px
className="gap-3"    // 12px
className="gap-4"    // 16px
className="gap-5"    // 20px
className="gap-6"    // 24px
```

### Flex Grow/Shrink

```tsx
className="flex-1"   // Grow to fill, shrink if needed
className="flex-auto"  // Grow and shrink equally
className="grow"     // Flex-grow: 1
className="shrink-0" // Don't shrink (fixed size)
className="min-w-0"  // Allow flex items to shrink below content width
```

---

## Quick Copy-Paste Blocks

### Header (v4 Style)

```tsx
<header className={cn(
  'fixed right-0 left-0 z-30 backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300',
  scrolled && 'ds3-header-scrolled'
)}>
  <div className="flex h-14 items-center justify-between px-4 lg:px-6">
    {/* Content */}
  </div>
  <div className={cn(
    'absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300',
    scrolled ? 'bg-border-light opacity-100' : 'bg-border-light/50 opacity-60'
  )} />
</header>
```

### Bottom Nav

```tsx
<nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-between backdrop-blur-xl bg-bg-primary/85 border-t border-border-light/50 px-4">
  {tabs.map(tab => (
    <Link
      key={tab.path}
      href={tab.path}
      className={cn(
        'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors',
        isActive(tab.path)
          ? 'text-brand-primary font-semibold'
          : 'text-text-muted hover:text-brand-primary'
      )}
    >
      <DSIcon name={tab.icon} size={24} />
      <span className="text-xs">{tab.label}</span>
    </Link>
  ))}
</nav>
```

### FAB Button

```tsx
<Link
  href="/dashboard/ai"
  className={cn(
    'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center',
    'rounded-[18px] border-0 text-white',
    'bg-linear-to-br from-emerald-400 via-emerald-500 to-emerald-700',
    'shadow-[0_4px_16px_rgba(16,185,129,0.35)]',
    'transition-all duration-300',
    'max-sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]',
    hovered ? 'shadow-[0_8px_24px_rgba(16,185,129,0.5)] scale-108 -rotate-5' : ''
  )}
>
  <DSIcon name="sparkles" size={28} />
</Link>
```

---

## Reference

- **Design System**: `.claude/docs/DESIGN-SYSTEM.md`
- **Tailwind Docs**: `tailwindcss.com`
- **Utility Classes**: All classes are standard Tailwind v3/v4

---

**Last Updated**: 2026-04-05  
**Version**: 1.0
