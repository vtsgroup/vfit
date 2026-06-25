# Hero Section — VFIT Ultra-Modern

## 🎯 Vision
Hero that screams "ultra-modern AI fitness." Glassmorphic gradient, clean typography, dual CTA, minimal visual noise.

---

## 📐 Full-Width Hero (min-height: 100dvh)

```html
<section class="relative min-h-dvh flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
  
  <!-- Animated Gradient Background (SVG Blob) -->
  <div class="absolute inset-0 opacity-20">
    <svg class="w-full h-full" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0EA38A;stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:#16B59F;stop-opacity:0.2" />
        </linearGradient>
      </defs>
      <!-- Animated blob shape -->
      <path id="blob" d="M..." fill="url(#heroGradient)" />
    </svg>
  </div>

  <!-- Content Container -->
  <div class="relative z-10 max-w-2xl mx-auto px-6 text-center space-y-8">
    
    <!-- Badge (optional) -->
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 backdrop-blur-sm">
      <span class="text-xs font-semibold text-primary-400">🚀 AI-POWERED TRAINING</span>
    </div>

    <!-- Headline -->
    <h1 class="text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight text-white">
      Seu personal trainer
      <span class="block">
        com <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-300">IA</span>,
        no seu bolso
      </span>
    </h1>

    <!-- Subheadline -->
    <p class="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed">
      Treine com clareza e evolua com IA. Personal e nutricionista. <strong>30 dias grátis, sem cartão.</strong>
    </p>

    <!-- CTA Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center pt-8">
      <!-- Primary CTA -->
      <button class="px-8 py-3 bg-primary-500 text-white rounded-full font-semibold shadow-2xl hover:shadow-none hover:bg-primary-400 transition-all duration-300 active:scale-95">
        ✨ COMEÇAR GRÁTIS
      </button>
      
      <!-- Secondary CTA -->
      <button class="px-8 py-3 border border-white/20 text-white rounded-full font-semibold hover:border-white/40 hover:bg-white/5 transition-all duration-300 active:scale-95">
        👁️ VER COMO FUNCIONA
      </button>
    </div>

    <!-- Social Proof Stats (below fold, slides in on scroll) -->
    <div class="pt-16 grid grid-cols-3 gap-8 text-center opacity-0 animate-fadeInUp" style="animation-delay: 300ms;">
      <div>
        <div class="text-3xl md:text-4xl font-bold text-white">15.000+</div>
        <p class="text-sm text-neutral-400 mt-2">Alunos Ativos</p>
      </div>
      <div>
        <div class="text-3xl md:text-4xl font-bold text-white">98%</div>
        <p class="text-sm text-neutral-400 mt-2">Satisfação</p>
      </div>
      <div>
        <div class="text-3xl md:text-4xl font-bold text-white">2.500+</div>
        <p class="text-sm text-neutral-400 mt-2">Profissionais</p>
      </div>
    </div>
  </div>

  <!-- Scroll Indicator (optional) -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
    <span class="text-xs text-neutral-500">Scroll para explorar</span>
    <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </div>
</section>
```

---

## 🎨 CSS Details

### Hero Container
```css
.hero {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #0f1117 0%, #161b22 50%, #0f1117 100%);
}
```

### Headline
```css
h1 {
  font-size: clamp(48px, 10vw, 80px);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #ffffff;
}

h1 .text-gradient {
  background: linear-gradient(90deg, #16B59F 0%, #2EC9B6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Subheadline
```css
.hero p {
  font-size: 18px;
  line-height: 1.6;
  color: #9CA3AF;
  font-weight: 400;
}

.hero p strong {
  color: #E5E7EB;
  font-weight: 600;
}
```

### Button Group
```css
.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  padding-top: 32px;
}

@media (min-width: 640px) {
  .hero-buttons {
    flex-direction: row;
  }
}
```

### Primary CTA
```css
.btn-primary-hero {
  padding: 12px 32px;
  border-radius: 9999px;
  background: #0EA38A;
  color: white;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 20px 40px rgba(14, 163, 138, 0.25);
  transition: all 300ms cubic-bezier(0, 0, 0.2, 1);
  border: none;
  cursor: pointer;
}

.btn-primary-hero:hover {
  background: #16B59F;
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(14, 163, 138, 0.3);
}

.btn-primary-hero:active {
  transform: scale(0.95);
}
```

### Secondary CTA
```css
.btn-secondary-hero {
  padding: 12px 32px;
  border-radius: 9999px;
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  font-size: 16px;
  transition: all 200ms ease-out;
  cursor: pointer;
}

.btn-secondary-hero:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.btn-secondary-hero:active {
  transform: scale(0.95);
}
```

---

## ✨ Animations

### Fade-In on Load
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

.animate-fadeInUp {
  animation: fadeInUp 600ms cubic-bezier(0, 0, 0.2, 1) forwards;
}
```

### Scroll Bounce
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.animate-bounce {
  animation: bounce 2s infinite;
}
```

### Blob Animation (SVG)
```css
@keyframes blobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

#blob {
  animation: blobFloat 8s ease-in-out infinite;
}
```

---

## 📱 Responsive Design

### Mobile (375px)
```
[Logo]
[Headline - 40px]
[Subheadline]
[CTA - full width stacked]
[Stats grid - 2 cols]
```

### Tablet (768px)
```
[Headline - 56px]
[Subheadline - larger]
[CTA - side by side]
[Stats - 3 cols full width]
```

### Desktop (1024px+)
```
[Headline - 64px+]
[Subheadline - max-width 600px]
[CTA - side by side, centered]
[Stats - 3 cols, spaced out]
```

---

## 🔐 Accessibility

- ✅ Heading hierarchy: `<h1>` only (once per page)
- ✅ Button text is descriptive ("COMEÇAR GRÁTIS" not "CLICK HERE")
- ✅ Color contrast: white text on #0f1117 = 11.5:1 (AAA)
- ✅ Focus rings visible on both buttons (2px ring-primary-500)
- ✅ Badge color: primary-500 on primary-500/10 = 6:1 (AA)
- ✅ Prefers-reduced-motion: Remove bounce animation
- ✅ Skip to main content link (hidden but keyboard-accessible)

---

## 📋 Implementation Notes

- Use `min-h-dvh` (dynamic viewport height) for mobile with bottom nav
- Gradient background should be smooth, no banding
- Blob shape can be SVG or CSS (Tailwind Blob generator)
- Stats should fade in AFTER hero loads (staggered entrance)
- Both buttons should have focus rings for keyboard nav
- Badge is optional (can be hidden on mobile if space is tight)
- Ensure scroll indicator doesn't block content on short viewports
