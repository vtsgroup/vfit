# VFIT Redesign — Integration Examples

> **Quick Start Guide** — Como usar os novos componentes ultramodernos
> **Version:** 1.0.0

---

## 🎯 Scenario 1: Update Homepage with Ultra Design

### Current Structure
```
src/app/page.tsx
├── Navbar (old)
├── Hero (old)
├── Features (old)
├── Footer
```

### New Ultra Structure
```
src/app/page.tsx
├── NavbarUltra (new)
├── HeroUltra (new)
├── FeatureCardsUltra (new)
├── Footer (reuse or redesign)
```

### Code Example
```tsx
// src/app/page.tsx

import { NavbarUltra } from '@/components/landing/navbar-ultra'
import { HeroUltra } from '@/components/landing/hero-ultra'
import { FeatureCardsUltra } from '@/components/landing/feature-cards-ultra'

export const metadata: Metadata = {
  title: 'VFIT — App de Treinos com IA',
  description: 'Baixe o VFIT grátis. Treinos personalizados com inteligência artificial.',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <NavbarUltra />
      <HeroUltra />
      <FeatureCardsUltra />
      {/* Keep existing sections */}
      <PricingSection />
      <TestimonialsSection />
      <Footer />
    </main>
  )
}
```

---

## 🎯 Scenario 2: Replace Login Page

### Current
```
src/app/(auth)/login/page.tsx
```

### Option A: Create New File (Safe)
```tsx
// Keep old: src/app/(auth)/login/page.tsx
// New:      src/app/(auth)/login/page-ultra.tsx
// Test it at: /auth/login-ultra
```

### Option B: Merge Into Original (Clean)
```tsx
// Delete page-ultra.tsx
// Update page.tsx with HeroUltra's design
// Keep all logic from original page.tsx

// src/app/(auth)/login/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { ButtonUltra } from '@/components/ui/button-ultra'
import { GuestGuard, OAuthButtons } from '@/components/auth'

// ... (keep all your auth logic)
// ... (use ButtonUltra instead of Button)
// ... (apply glass styling to form fields)
// ... (use logo SVG from public/favicons/favicon.svg)

export default function LoginPage() {
  // ... existing code ...
  
  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-950 px-4">
        <div className="w-full max-w-sm">
          {/* Logo at top */}
          <div className="w-16 h-16 mx-auto mb-6">
            <svg viewBox="0 0 1024 1024">
              {/* ... SVG from favicon.svg ... */}
            </svg>
          </div>
          
          {/* Form with glass styling */}
          <form className="space-y-4">
            <input className="w-full h-12 px-4 rounded-xl bg-white/4 border border-white/10 focus:border-brand-primary transition-all" />
            {/* ... more fields ... */}
            <ButtonUltra variant="glass-primary" size="lg" fullWidth>
              ENTRAR
            </ButtonUltra>
          </form>
        </div>
      </div>
    </GuestGuard>
  )
}
```

---

## 🎯 Scenario 3: Update Loading Screen

### Add to Layout

```tsx
// app/layout.tsx
import { LoadingScreenUltra } from '@/components/ui/loading-screen-ultra'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950">
        {/* Show during initial load */}
        <Suspense fallback={<LoadingScreenUltra />}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}
```

### Or Use in Specific Routes

```tsx
// app/(app)/dashboard/layout.tsx
import { LoadingScreenUltra } from '@/components/ui/loading-screen-ultra'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LoadingScreenUltra />}>
      {children}
    </Suspense>
  )
}
```

---

## 🎯 Scenario 4: Custom Button Variants

### Create Feature Section with Buttons

```tsx
// components/landing/cta-section-ultra.tsx

import { ButtonUltra } from '@/components/ui/button-ultra'
import { DSIcon } from '@/components/ui/ds-icon'

export function CtaSectionUltra() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-black text-white mb-6">
          Pronto para transformar?
        </h2>
        
        <p className="text-lg text-slate-400 mb-12">
          Comece seu teste grátis de 30 dias hoje. Sem cartão de crédito necessário.
        </p>

        {/* Button grid */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {/* Primary large */}
          <ButtonUltra
            variant="glass-primary"
            size="lg"
            className="col-span-3 sm:col-span-1 font-bold"
          >
            Começar Grátis
            <DSIcon name="arrowRight" size={18} />
          </ButtonUltra>

          {/* Secondary */}
          <ButtonUltra
            variant="glass-secondary"
            size="lg"
            className="col-span-3 sm:col-span-2"
          >
            Saiba Mais
          </ButtonUltra>
        </div>

        {/* Trust message */}
        <p className="mt-8 text-sm text-slate-500">
          ✓ 15.000+ usuarios satisfeitos · ✓ 98% satisfaction rating
        </p>
      </div>
    </section>
  )
}
```

---

## 🎯 Scenario 5: Custom Feature Card

### Create Brand-Specific Card

```tsx
// components/landing/custom-feature-card.tsx

import { ButtonUltra } from '@/components/ui/button-ultra'
import { DSIcon } from '@/components/ui/ds-icon'

interface CustomCardProps {
  icon: React.ReactNode
  title: string
  description: string
  cta?: string
  ctaHref?: string
}

export function CustomFeatureCard({
  icon,
  title,
  description,
  cta,
  ctaHref,
}: CustomCardProps) {
  return (
    <div className="relative p-8 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-md hover:bg-white/8 hover:border-white/15 transition-all duration-300 hover:scale-105">
      {/* Icon */}
      <div className="inline-flex p-3 rounded-xl bg-brand-primary/10 mb-4">
        <div className="text-brand-primary text-2xl">{icon}</div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-4">{description}</p>

      {/* CTA */}
      {cta && ctaHref && (
        <ButtonUltra
          variant="link"
          className="text-sm"
          asChild
        >
          <a href={ctaHref}>
            {cta} <DSIcon name="arrowRight" size={14} />
          </a>
        </ButtonUltra>
      )}
    </div>
  )
}
```

---

## 🎯 Scenario 6: Form Input with Ultra Styling

### Global Input Component

```tsx
// components/ui/input-ultra.tsx

import React from 'react'
import { cn } from '@/lib/utils'

interface InputUltraProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const InputUltra = React.forwardRef<
  HTMLInputElement,
  InputUltraProps
>(({ label, error, hint, className, ...props }, ref) => {
  return (
    <div>
      {label && (
        <label className="text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-2">
          {label}
        </label>
      )}

      <input
        ref={ref}
        className={cn(
          'w-full h-12 px-4 rounded-xl bg-white/4 border border-white/10',
          'text-white placeholder:text-slate-500',
          'focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30',
          'focus:bg-white/6 transition-all duration-200',
          error && 'border-red-500/50 focus:border-red-500',
          className
        )}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}

      {hint && (
        <p className="text-xs text-slate-500 mt-2">{hint}</p>
      )}
    </div>
  )
})

InputUltra.displayName = 'InputUltra'
```

### Usage

```tsx
<InputUltra
  label="CPF"
  type="text"
  placeholder="000.000.000-00"
  error={cpfError}
  hint="Use apenas números"
/>
```

---

## 🎯 Scenario 7: Dark Mode (Bonus)

### Light Mode Variants (If Needed)

```tsx
// For light backgrounds (future light mode)

// Button glass-primary on light
className="bg-brand-primary/8 border-brand-primary/25 text-slate-900"

// Form field on light
className="bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400"

// Card on light
className="bg-white/60 border border-slate-200 backdrop-blur-md"
```

---

## 🚀 Implementation Checklist

### Phase 1: Components (✅ Done)
- [x] Button Ultra created
- [x] Loading Screen Ultra created
- [x] Login Page Ultra created
- [x] Hero Ultra created
- [x] Feature Cards Ultra created
- [x] Navbar Ultra created

### Phase 2: Integration (Next)
- [ ] Review components in IDE
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Update homepage to use HeroUltra + FeatureCardsUltra
- [ ] Replace login page or merge styling
- [ ] Add LoadingScreenUltra to layout
- [ ] Create custom Input Ultra component
- [ ] Test all animations (blur-in, slide-up, scale-in)
- [ ] Verify accessibility (WCAG AA)

### Phase 3: Polish
- [ ] Adjust colors to match your brand
- [ ] Fine-tune animation timings
- [ ] Add scroll-triggered animations
- [ ] Test dark/light mode
- [ ] Performance audit

---

## 📱 Responsive Breakpoints

All components use Tailwind's responsive prefixes:

```
Mobile:    0 – 640px    (default, no prefix)
Tablet:    640px – 1024px    (md:)
Desktop:   1024px+      (lg:)
```

Examples:
```tsx
// Mobile first
<div className="text-4xl md:text-5xl lg:text-6xl">
  Mobile: 4xl, Tablet: 5xl, Desktop: 6xl
</div>

// Grid
<div className="grid md:grid-cols-2 lg:grid-cols-3">
  Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols
</div>
```

---

## ♿ Accessibility Tips

### For All Components
```tsx
// 1. Focus rings visible
focus-visible:ring-2 focus-visible:ring-brand-primary

// 2. Touch targets ≥44px
h-12  /* 48px with padding */
h-10  /* 40px minimum */

// 3. Color contrast
text-white/80  /* Not too light on dark background */
bg-white/4     /* Subtle but visible */

// 4. Reduced motion
@media (prefers-reduced-motion: reduce) {
  animation: none !important;
  transition: none !important;
}

// 5. Semantic HTML
<button> vs <div onclick>
<label> with <input>
aria-label for icon-only buttons
```

---

## 🎨 Color Customization

### Update Brand Color

```css
/* tailwind.config.ts */
theme: {
  extend: {
    colors: {
      brand: {
        primary: '#3AB54A',  /* Change here */
        light: '#4EC959',
        dark: '#2A8A38',
      }
    }
  }
}
```

Then use in components:
```tsx
className="text-brand-primary bg-brand-primary/10"
```

---

## 🚦 Quick Start Command

```bash
# 1. Check the new components
ls -la src/components/ui/button-ultra.tsx
ls -la src/components/ui/loading-screen-ultra.tsx
ls -la src/components/landing/hero-ultra.tsx

# 2. Import in your page
import { ButtonUltra } from '@/components/ui/button-ultra'

# 3. Use it
<ButtonUltra variant="glass-primary" size="lg">
  Click me
</ButtonUltra>

# 4. Run dev server
npm run dev
```

---

## 📞 Support

Each component has comments and TypeScript types. Hover over imports for intellisense.

Files created:
- `src/components/ui/button-ultra.tsx`
- `src/components/ui/loading-screen-ultra.tsx`
- `src/app/(auth)/login/page-ultra.tsx`
- `src/components/landing/hero-ultra.tsx`
- `src/components/landing/feature-cards-ultra.tsx`
- `src/components/landing/navbar-ultra.tsx`

Enjoy your ultra-modern redesign! 🎉

