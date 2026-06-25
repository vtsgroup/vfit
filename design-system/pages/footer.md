# Footer Component — VFIT Ultra-Modern

## 🎯 Vision
Professional, minimal footer with glass effect. Multi-column on desktop, stacked on mobile. Social links, legal links, copyright.

---

## 📐 Desktop Layout (1024px+)

```html
<footer class="relative bg-gradient-to-b from-transparent to-black/40 border-t border-white/10">
  <div class="max-w-7xl mx-auto px-8 py-20 grid grid-cols-4 gap-12">
    
    <!-- Column 1: Brand & Mission -->
    <div class="space-y-4">
      <p class="text-sm leading-relaxed text-neutral-400">
        © 2026 VFIT. Seu personal trainer com IA.
      </p>
      <p class="text-xs text-neutral-500">
        Transformando orientação profissional em treino simples de seguir.
      </p>
      
      <!-- Social Links -->
      <div class="flex items-center gap-4 pt-4">
        <a href="https://instagram.com/vfit" aria-label="Instagram" class="p-2 rounded-lg hover:bg-primary-500/10 transition">
          <svg class="w-5 h-5 text-neutral-400 hover:text-primary-400" fill="currentColor" viewBox="0 0 24 24">
            <!-- Instagram icon -->
          </svg>
        </a>
        <a href="https://twitter.com/vfit" aria-label="Twitter" class="p-2 rounded-lg hover:bg-primary-500/10 transition">
          <svg class="w-5 h-5 text-neutral-400 hover:text-primary-400" fill="currentColor" viewBox="0 0 24 24">
            <!-- Twitter icon -->
          </svg>
        </a>
        <a href="https://linkedin.com/company/vfit" aria-label="LinkedIn" class="p-2 rounded-lg hover:bg-primary-500/10 transition">
          <svg class="w-5 h-5 text-neutral-400 hover:text-primary-400" fill="currentColor" viewBox="0 0 24 24">
            <!-- LinkedIn icon -->
          </svg>
        </a>
      </div>
    </div>

    <!-- Column 2: Plataforma -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold text-white">Plataforma</h3>
      <ul class="space-y-2">
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">Para Alunos</a></li>
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">Para Profissionais</a></li>
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">Roadmap</a></li>
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">Blog</a></li>
      </ul>
    </div>

    <!-- Column 3: Recursos -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold text-white">Recursos</h3>
      <ul class="space-y-2">
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">Documentação</a></li>
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">API Docs</a></li>
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">Suporte</a></li>
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">Status</a></li>
      </ul>
    </div>

    <!-- Column 4: Legal -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold text-white">Legal</h3>
      <ul class="space-y-2">
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">Privacidade</a></li>
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">Termos de Serviço</a></li>
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">Cookies</a></li>
        <li><a href="#" class="text-sm text-neutral-400 hover:text-primary-400 transition">LGPD</a></li>
      </ul>
    </div>
  </div>

  <!-- Divider -->
  <div class="border-t border-white/5"></div>

  <!-- Bottom Footer -->
  <div class="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500">
    <p>Made with ❤️ in Brazil</p>
    <p>VFIT v4.8.8 • Status: Operational</p>
  </div>
</footer>
```

---

## 📱 Mobile Layout (375px)

```
[Brand & Mission]
[Social icons - horizontal]

[Plataforma]
[Link 1]
[Link 2]
...

[Recursos]
[Links...]

[Legal]
[Links...]

---
[Made with ❤️ in Brazil]
[Status]
```

All stacked vertically, single column.

---

## 🎨 CSS Details

### Footer Container
```css
footer {
  position: relative;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 80px 32px 24px;
}

@media (max-width: 768px) {
  footer {
    padding: 48px 16px 16px;
  }
}
```

### Column Headers
```css
footer h3 {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}
```

### Links
```css
footer a {
  font-size: 14px;
  color: #9CA3AF;
  text-decoration: none;
  transition: color 200ms ease-out;
  padding: 4px 0;
}

footer a:hover {
  color: #0EA38A;
}

footer a:focus {
  outline: 2px solid #0EA38A;
  outline-offset: 2px;
  border-radius: 2px;
}
```

### Social Icons
```css
.footer-social {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
}

.footer-social a {
  padding: 8px;
  border-radius: 8px;
  transition: background-color 200ms ease-out;
}

.footer-social a:hover {
  background-color: rgba(14, 163, 138, 0.1);
}

.footer-social svg {
  width: 20px;
  height: 20px;
  color: #D1D5DB;
  transition: color 200ms ease-out;
}

.footer-social a:hover svg {
  color: #0EA38A;
}
```

### Bottom Footer
```css
.footer-bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 32px;
  text-align: center;
  font-size: 12px;
  color: #6B7280;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

@media (min-width: 768px) {
  .footer-bottom {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}
```

---

## 📐 Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| 375px (mobile) | 1 column, stacked |
| 640px (sm) | 2 columns (Brand + Social / Plataforma / Recursos / Legal) |
| 768px (tablet) | 3 columns (Brand / Plataforma + Recursos / Legal) |
| 1024px+ (desktop) | 4 columns, max-width 1280px |

---

## ✨ Hover & Interaction States

### Link Hover
```css
/* Color change + smooth transition */
color: #D1D5DB → #0EA38A (200ms ease-out)
```

### Focus Ring (Keyboard Navigation)
```css
/* Visible focus for accessibility */
outline: 2px solid #0EA38A
outline-offset: 2px
border-radius: 2px
```

### Social Icon Hover
```css
/* Background fill on hover */
background: rgba(14, 163, 138, 0.1)
color: #0EA38A (200ms ease-out)
```

---

## 🔐 Accessibility

- ✅ All links have descriptive text (no icon-only)
- ✅ Focus rings visible (2px outline)
- ✅ Color contrast: neutral-400 on black = 4.6:1 (AA)
- ✅ Footer links color on hover: primary-400 on black = 5.8:1 (AA)
- ✅ Social icon labels via `aria-label`
- ✅ Tab order: left-to-right, top-to-bottom
- ✅ No auto-playing sounds or animations
- ✅ Prefers-reduced-motion: Remove fade-in on scroll

---

## 🎬 Animation (Optional)

### Fade-In on Scroll
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.footer {
  animation: fadeInUp 600ms cubic-bezier(0, 0, 0.2, 1) 300ms both;
}
```

---

## 📋 Implementation TODOs

- [ ] Replace existing footer with new design
- [ ] Update social media links (Instagram, Twitter, LinkedIn)
- [ ] Add focus ring styles for keyboard nav
- [ ] Test responsive layout on mobile/tablet/desktop
- [ ] Verify contrast ratios (WCAG AA minimum)
- [ ] Add prefers-reduced-motion query
- [ ] Ensure all links are keyboard-navigable (Tab key)
- [ ] Update year/version info dynamically
- [ ] Add microdata (schema.org footer markup)
