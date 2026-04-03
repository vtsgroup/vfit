# 10. Mobile-First + Desktop Responsive Strategy

**Versão:** v1.1 (mobile-first + desktop)  
**Aplicável:** Phases 2-4 + admin panel (futuro)  
**Framework:** Next.js 15 App Router + Tailwind v4

---

## Philosophy: Mobile-First Always

```
┌─────────────────────────────────────────────────────────┐
│  VFIT é um app mobile (PRIMARY)                         │
│  Desktop é secondary (some users, all admins)          │
│  →  Code mobile layouts FIRST, then scale UP to desktop │
└─────────────────────────────────────────────────────────┘
```

---

## Breakpoint Strategy

```
MOBILE       0-640px    [DEFAULT] ← Start here, build everything
             (iPhone SE, 6, 7, 8)

TABLET       sm: 640px  [ENHANCE] 
             (iPad mini, small tablets)

LARGE        md: 768px  [ENHANCE]
             (iPad, iPad Air)

DESKTOP      lg: 1024px [OPTIMIZE for admin]
             (MacBook, Windows)

XL DESKTOP   xl: 1280px [RARE, ultra-wide]
```

---

## Implementation Rules (Mobile-First)

### 1. **Always Code Mobile First**

```typescript
// ❌ DON'T: Desktop-first
<div className="w-full md:max-w-screen-lg lg:grid-cols-3">

// ✅ DO: Mobile-first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Principle**: Default styles are mobile. Add `md:`, `lg:` for larger screens.

---

### 2. **Mobile Layout Patterns**

#### Full-Width Stacks (Mobile)
```typescript
// Workout list on mobile: single column, full width
<div className="flex flex-col gap-3 px-4 py-6">
  {workouts.map(w => (
    <WorkoutCard key={w.id} workout={w} /> // h-24, full width
  ))}
</div>

// Desktop: 2-3 columns
// → Add: md:grid md:grid-cols-2 lg:grid-cols-3
```

#### Bottom Sheets (Mobile)
```typescript
// Mobile: bottom sheet modal
// → Tailwind: fixed bottom-0 left-0 right-0 rounded-t-3xl

// Desktop: centered modal
// → Add: md:fixed md:inset-0 md:flex md:items-center md:justify-center
```

#### Bottom Navigation (Mobile Only)
```typescript
// Mobile: 5-item bottom nav
<nav className="fixed bottom-0 left-0 right-0 h-16 border-t ...">

// Desktop: hidden, use sidebar instead
// → Add: md:hidden
```

---

### 3. **Safe Area + Notches**

```typescript
// Mobile: respect notch + home indicator
<div className="pt-safe pb-safe px-4">
  // content
</div>

// Tailwind v4 safe areas
className="pt-safe" // top safe area (notch)
className="pb-safe" // bottom safe area (home indicator)
className="pl-safe" // left (iPad landscape)
className="pr-safe" // right (iPad landscape)

// Or use env() directly:
style={{
  paddingTop: 'env(safe-area-inset-top)',
  paddingBottom: 'env(safe-area-inset-bottom)',
}}
```

---

### 4. **Touch-Friendly Targets (Mobile)**

```typescript
// Mobile: 44pt (11px) minimum
<button className="h-11 w-11 p-2.5 rounded-lg">
  <Icon size={16} />
</button>

// Spacing between: 8pt minimum
<div className="flex gap-2"> {/* 8px gap */}
  <button className="h-11 px-4">Action 1</button>
  <button className="h-11 px-4">Action 2</button>
</div>

// Desktop: can go smaller (buttons h-9, h-10)
// → Add: md:h-10 lg:h-9
```

---

### 5. **Responsive Typography**

```typescript
// Mobile: readable base (16px)
<p className="text-sm md:text-base lg:text-lg">Body text</p>

// Headings: scale with screen
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Title</h1>

// Never go below 12px on mobile
<span className="text-xs md:text-sm">Caption</span> // ✅
<span className="text-[10px]">Tiny text</span>    // ❌ Never
```

---

### 6. **Visible Focus Rings (Keyboard)**

Desktop users (admin, developers) use keyboard. All interactive elements need visible focus:

```typescript
// Every button, link, input
<button className="
  rounded-lg px-4 py-2
  focus-visible:outline-2 outline-offset-2 outline-brand-primary
  active:scale-95
">
  Action
</button>

// Never remove focus ring!
// ❌ outline-none
// ✅ focus-visible:outline-2
```

---

## Responsive Component Checklist

### Buttons

```typescript
// Mobile
<Button size="md" className="h-10 px-4" /> // Touch-friendly

// Desktop
<Button size="sm" className="md:h-9 md:px-3" /> // Can be smaller
```

### Cards

```typescript
// Mobile: full width
<Card className="w-full rounded-2xl p-4" />

// Desktop: grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
</div>
```

### Forms

```typescript
// Mobile: full-width inputs
<input className="w-full h-11 px-4" />

// Desktop: max-width
<form className="w-full max-w-md">
  <input className="w-full" />
</form>
```

### Navigation

```typescript
// Mobile: bottom nav only
<nav className="fixed bottom-0 left-0 right-0 h-16 md:hidden">
  {/* 5 items */}
</nav>

// Desktop: sidebar + top nav
<aside className="hidden md:block fixed left-0 top-0 w-64 h-screen">
  {/* sidebar */}
</aside>
```

---

## Performance: Mobile Optimization

### Image Optimization
```typescript
// Use srcset for responsive images
<img
  src="/hero-mobile.webp"
  srcSet="
    /hero-mobile.webp 640w,
    /hero-tablet.webp 1024w,
    /hero-desktop.webp 1920w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
  alt="Hero"
/>

// Or use Next.js Image
<Image
  src="/hero.webp"
  alt="Hero"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
  responsive
/>
```

### Code Splitting
```typescript
// Import components only when needed
import dynamic from 'next/dynamic'

const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {
  loading: () => <Skeleton />,
  ssr: false, // Admin panel = client-only
})

// On mobile: lazy load admin (never shown anyway)
```

### PWA: Service Worker
```typescript
// Cache strategy: Network first for workouts, cache first for assets
// Mobile: offline workouts via D1 cache (Phase 3)
// Desktop: less critical, always online
```

---

## Responsive Testing Checklist

- [ ] **Mobile (375px)**: All text readable, buttons tappable (44pt), no horizontal scroll
- [ ] **Tablet (768px)**: 2-column layouts, touch-friendly, landscape working
- [ ] **Desktop (1024px+)**: 3+ columns, admin panels visible, keyboard navigation
- [ ] **Dark mode**: All text contrast ≥4.5:1 on all breakpoints
- [ ] **Landscape mode**: Portrait aspect ratio maintained (iPad landscape)
- [ ] **Reduced motion**: Animations respect prefers-reduced-motion
- [ ] **Font scaling**: Dynamic Type (iOS), text scaling (Android) supported
- [ ] **Touch targets**: All ≥44pt on mobile, ≥48dp on Android

---

## Tailwind v4 Mobile-First Syntax

```typescript
// ✅ CORRECT: Mobile default, then breakpoints
<div className="
  text-sm space-y-2
  md:text-base md:space-y-4
  lg:text-lg lg:space-y-6
">

// ❌ WRONG: Not mobile-first
<div className="
  md:text-base space-y-4 text-lg
">

// ✅ Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// ✅ Responsive padding
<div className="px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">

// ✅ Responsive display
<div className="block md:hidden">Mobile only</div>
<div className="hidden md:block">Desktop only</div>
```

---

## Admin Panel: Desktop-Optimized

Since admin (Victor) uses mostly desktop:

```typescript
// src/app/dashboard/admin/layout.tsx

<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Mobile: full-width sections */}
  {/* Desktop: 3-column layout + sidebar */}
  
  <aside className="hidden lg:block col-span-1">
    {/* Admin sidebar */}
  </aside>
  
  <main className="col-span-1 lg:col-span-3">
    {/* Admin content: 3 columns wide */}
  </main>
</div>
```

**Admin rules:**
- Mobile: simplified view (read-only or minimal editing)
- Desktop: full CRUD, multi-column, keyboard shortcuts
- Never force admin through mobile UI

---

## Summary: Mobile-First Wins

```
✅ All users benefit from fast, touch-friendly mobile UI
✅ Admins get desktop-optimized experience (sidebar, 3-columns)
✅ No compromises: mobile doesn't force desktop onto small screens
✅ Progressive enhancement: mobile works offline (D1 PWA)
✅ Desktop admin works online, uses real-time DB

🎯 Mobile-first means: write for small first, enhance for big second.
```

---

**Apply this strategy to all phases for a seamless, modern experience! 📱💻**
