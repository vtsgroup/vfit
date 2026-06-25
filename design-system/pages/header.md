# Header Component — VFIT Ultra-Modern

## 🎯 Vision
Sticky glass navbar with minimal clutter, smooth interactions, mobile-first responsive drawer.

---

## 📐 Desktop Layout (1024px+)

```html
<!-- Structure -->
<header class="sticky top-0 z-40 backdrop-blur-xl bg-neutral-950/45 border-b border-white/10">
  <nav class="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
    
    <!-- Logo (left) -->
    <div class="flex items-center gap-2">
      <svg class="w-8 h-8 text-primary-500" />  <!-- VFIT logo -->
      <span class="text-2xl font-semibold text-white">VFIT</span>
    </div>

    <!-- Nav Links (center) -->
    <div class="hidden lg:flex items-center gap-8">
      <a href="#" class="text-neutral-300 hover:text-primary-400 transition-colors">Plataforma</a>
      <a href="#" class="text-neutral-300 hover:text-primary-400 transition-colors">Recursos</a>
      <a href="#" class="text-neutral-300 hover:text-primary-400 transition-colors">Preços</a>
      <a href="#" class="text-neutral-300 hover:text-primary-400 transition-colors">FAQ</a>
      <a href="#" class="text-neutral-300 hover:text-primary-400 transition-colors">Contato</a>
    </div>

    <!-- CTAs (right) -->
    <div class="flex items-center gap-4">
      <button class="hidden md:block px-4 py-2 text-neutral-200 hover:text-white transition">
        ENTRAR
      </button>
      <button class="px-6 py-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-400 transition shadow-lg">
        COMEÇAR GRÁTIS
      </button>
      
      <!-- Mobile menu toggle -->
      <button class="lg:hidden p-2 text-neutral-300 hover:text-white">
        <svg class="w-6 h-6" />  <!-- Hamburger icon -->
      </button>
    </div>
  </nav>
</header>
```

---

## 📱 Mobile Layout (375px)

```
[VFIT] [                      ] [☰]
```

- Logo only (20px width)
- Hamburger menu (right)
- Full-width, no center nav

---

## 🎨 Styling Details

### Glass Effect
```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 64px;
  backdrop-filter: blur(12px);
  background: rgba(15, 17, 23, 0.45);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Nav Links
```css
.nav-link {
  font-size: 14px;
  font-weight: 400;
  color: #D1D5DB;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  transition: color 200ms ease-out, border-color 200ms ease-out;
}

.nav-link:hover {
  color: #0EA38A;
  border-bottom-color: #0EA38A;
}
```

### Primary CTA Button
```css
.btn-primary {
  padding: 10px 24px;
  border-radius: 9999px;
  background: #0EA38A;
  color: white;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 8px 16px rgba(14, 163, 138, 0.15);
  transition: background 200ms ease-out, transform 150ms ease-out;
}

.btn-primary:hover {
  background: #16B59F;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(14, 163, 138, 0.25);
}

.btn-primary:active {
  transform: scale(0.95);
}
```

---

## 📱 Mobile Drawer (Overlay)

```html
<!-- Mobile Menu (hidden by default) -->
<div class="fixed inset-0 z-50 lg:hidden" style="display: none;">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />
  
  <!-- Drawer Slide-In -->
  <nav class="absolute inset-y-0 left-0 w-64 bg-neutral-900 border-r border-white/10 p-6 flex flex-col gap-6">
    <a href="#" class="text-neutral-300 hover:text-white">Plataforma</a>
    <a href="#" class="text-neutral-300 hover:text-white">Recursos</a>
    <a href="#" class="text-neutral-300 hover:text-white">Preços</a>
    <a href="#" class="text-neutral-300 hover:text-white">FAQ</a>
    <a href="#" class="text-neutral-300 hover:text-white">Contato</a>
    
    <div class="border-t border-white/10 pt-4 flex flex-col gap-3">
      <button class="w-full px-4 py-2 text-white border border-white/20 rounded-lg">ENTRAR</button>
      <button class="w-full px-4 py-3 bg-primary-500 text-white rounded-lg">COMEÇAR GRÁTIS</button>
    </div>
  </nav>
</div>
```

### Drawer Animation
```css
@media (max-width: 1024px) {
  .mobile-menu.open {
    animation: slideInLeft 300ms cubic-bezier(0, 0, 0.2, 1);
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## ✨ Interaction States

### Hover (Desktop)
- Link color: `#D1D5DB` → `#0EA38A` (200ms ease-out)
- Underline appears smoothly
- No transform (keeps stable)

### Active/Pressed (Desktop)
- Button scale: `1` → `0.95` (150ms ease-out)
- Shadow reduces slightly
- Instant feedback

### Focus (Keyboard)
- Focus ring: `2px solid #0EA38A` + `2px offset`
- All interactive elements must be keyboard-navigable
- Tab order: Logo → Links → ENTRAR → COMEÇAR GRÁTIS

### Mobile Touch
- Drawer slides in from left (300ms)
- Backdrop fade-in concurrent
- Touch targets: min 44×44px

---

## 🔄 Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| 375px (mobile) | Logo only, hamburger menu, hide center nav |
| 640px (sm) | Add "ENTRAR" button |
| 768px (tablet) | Show some nav links (Plataforma, Preços) |
| 1024px (lg) | Show all nav links, full desktop layout |

---

## 📋 Implementation TODOs

- [ ] Replace hardcoded navbar with sticky glass component
- [ ] Update logo SVG (if needed)
- [ ] Implement mobile drawer with framer-motion or vanilla JS
- [ ] Add keyboard navigation (Tab through links)
- [ ] Test focus ring visibility (WCAG AA)
- [ ] Verify mobile touch target sizes (44×44px min)
- [ ] Remove old cookie modal from header
- [ ] Test sticky behavior on scroll
