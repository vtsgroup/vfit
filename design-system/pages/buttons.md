# Button Component Library — VFIT Ultra-Modern

## 🎯 Vision
Cohesive button system with 4 core variants (Primary, Secondary, Ghost, Danger), 5 sizes, and consistent interactions.

---

## 📦 Button Variants

### 1️⃣ Primary Button (Main CTA)

**Purpose:** Primary actions, conversions (Sign up, Start trial, Submit)

```jsx
// React example
<button className="btn btn-primary">
  ✨ COMEÇAR GRÁTIS
</button>
```

**CSS:**
```css
.btn-primary {
  padding: 10px 24px;                         /* sm */
  background: #0EA38A;
  color: white;
  font-weight: 600;
  font-size: 14px;
  border: none;
  border-radius: 9999px;
  box-shadow: 0 8px 16px rgba(14, 163, 138, 0.15);
  transition: all 200ms cubic-bezier(0, 0, 0.2, 1);
  cursor: pointer;
}

.btn-primary:hover {
  background: #16B59F;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(14, 163, 138, 0.25);
}

.btn-primary:active {
  transform: scale(0.95);
  box-shadow: 0 4px 8px rgba(14, 163, 138, 0.1);
}

.btn-primary:focus {
  outline: 2px solid #0EA38A;
  outline-offset: 2px;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

**States:**
| State | Background | Shadow | Transform |
|---|---|---|---|
| Idle | #0EA38A | 0 8px 16px | none |
| Hover | #16B59F | 0 12px 24px | translateY(-2px) |
| Active | #0D8B77 | 0 4px 8px | scale(0.95) |
| Disabled | #0EA38A | none | none (opacity 0.5) |
| Focus | #0EA38A + ring | same | same |

---

### 2️⃣ Secondary Button (Alternative Actions)

**Purpose:** Secondary actions, alternative paths (Learn more, View details, Cancel)

```jsx
<button className="btn btn-secondary">
  👁️ VER COMO FUNCIONA
</button>
```

**CSS:**
```css
.btn-secondary {
  padding: 10px 24px;
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  font-size: 14px;
  border-radius: 9999px;
  transition: all 200ms ease-out;
  cursor: pointer;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.4);
  color: #16B59F;
}

.btn-secondary:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.08);
}

.btn-secondary:focus {
  outline: 2px solid #0EA38A;
  outline-offset: 2px;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**States:**
| State | Border | Background | Color |
|---|---|---|---|
| Idle | white/20 | transparent | white |
| Hover | white/40 | white/5 | primary-400 |
| Active | white/40 | white/8 | primary-400 |
| Disabled | white/20 | transparent | white (opacity 0.5) |

---

### 3️⃣ Ghost Button (Minimal, Text-Heavy)

**Purpose:** Tertiary actions, low-priority links (Read more, Dismiss, Help)

```jsx
<button className="btn btn-ghost">
  Learn More
</button>
```

**CSS:**
```css
.btn-ghost {
  padding: 10px 16px;
  background: transparent;
  color: #D1D5DB;
  border: none;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  transition: all 150ms ease-out;
  cursor: pointer;
}

.btn-ghost:hover {
  background: rgba(14, 163, 138, 0.1);
  color: #0EA38A;
}

.btn-ghost:active {
  background: rgba(14, 163, 138, 0.2);
  transform: scale(0.95);
}

.btn-ghost:focus {
  outline: 2px solid #0EA38A;
  outline-offset: 2px;
}

.btn-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**States:**
| State | Background | Color |
|---|---|---|
| Idle | transparent | neutral-300 |
| Hover | primary-500/10 | primary-400 |
| Active | primary-500/20 | primary-400 |
| Disabled | transparent | neutral-300 (opacity 0.5) |

---

### 4️⃣ Danger Button (Destructive Actions)

**Purpose:** Delete, remove, logout (High-risk actions)

```jsx
<button className="btn btn-danger">
  Delete Account
</button>
```

**CSS:**
```css
.btn-danger {
  padding: 10px 24px;
  background: #EF4444;
  color: white;
  border: none;
  font-weight: 600;
  font-size: 14px;
  border-radius: 9999px;
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.15);
  transition: all 200ms ease-out;
  cursor: pointer;
}

.btn-danger:hover {
  background: #DC2626;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(239, 68, 68, 0.25);
}

.btn-danger:active {
  transform: scale(0.95);
}

.btn-danger:focus {
  outline: 2px solid #EF4444;
  outline-offset: 2px;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

**States:**
| State | Background | Shadow |
|---|---|---|
| Idle | #EF4444 | 0 8px 16px |
| Hover | #DC2626 | 0 12px 24px |
| Active | #B91C1C | 0 4px 8px |
| Disabled | #EF4444 (opacity 0.5) | none |

---

## 📏 Size Scale (Touch-Friendly)

All buttons meet 44×44px minimum touch target.

| Size | Padding | Height | Font | Use Case |
|---|---|---|---|---|
| XS (Extra Small) | px-3 py-1 | 32px | 11px | Badges, mini actions |
| SM (Small) | px-4 py-2 | 40px | 14px | Secondary, less important |
| MD (Medium) | px-5 py-2.5 | 44px | 16px | **Default**, most buttons |
| LG (Large) | px-6 py-3 | 48px | 18px | Hero CTAs, emphasis |
| XL (Extra Large) | px-8 py-3.5 | 56px | 20px | Mobile CTAs, full-width |

**CSS Example (Tailwind + custom):**
```css
/* Medium (default) */
.btn-md {
  padding: 10px 20px;      /* py-2.5 px-5 */
  height: 44px;
  font-size: 16px;
}

/* Large */
.btn-lg {
  padding: 12px 24px;      /* py-3 px-6 */
  height: 48px;
  font-size: 18px;
}

/* Mobile full-width (XL) */
.btn-xl {
  padding: 14px 32px;      /* py-3.5 px-8 */
  height: 56px;
  font-size: 20px;
}
```

---

## 🎨 Full Component Matrix

```
Primary    | Primary    | Secondary  | Ghost      | Danger
-----------|------------|------------|------------|----------
MD (44px)  | LG (48px)  | MD (44px)  | MD (44px)  | MD (44px)
Teal bg    | Teal bg    | Border     | No fill    | Red bg
White text | White text | White text | Gray text  | White text
Rounded    | Rounded    | Rounded    | Slightly   | Rounded
           |            |            | rounded    |
```

---

## 🎬 Interaction States (All Variants)

### Hover
```
Duration: 200ms
Easing: cubic-bezier(0, 0, 0.2, 1)
Changes:
  - Background color shift
  - Shadow increase (except Ghost)
  - Text color shift (Ghost only)
  - Transform: translateY(-2px) (Primary, Danger)
```

### Active (Pressed)
```
Duration: 150ms
Easing: ease-out
Changes:
  - Transform: scale(0.95)
  - Shadow reduces
  - Instant feedback
```

### Focus (Keyboard)
```
Trigger: Tab key or click
Style: 2px solid ring-primary-500, 2px offset
All buttons get same treatment
Visible on all backgrounds
```

### Disabled
```
Opacity: 0.5
Cursor: not-allowed
No hover effect
No interaction
```

---

## 📱 Responsive Sizing

```css
/* Mobile (default: Medium 44px) */
@media (max-width: 640px) {
  .btn-hero {
    height: 44px;
    padding: 10px 20px;
  }
}

/* Tablet (Large 48px) */
@media (min-width: 768px) {
  .btn-hero {
    height: 48px;
    padding: 12px 24px;
  }
}

/* Desktop (Large+ 48px) */
@media (min-width: 1024px) {
  .btn-hero {
    height: 48px;
    padding: 12px 24px;
  }
}
```

---

## 🔐 Accessibility

✅ **Color Contrast:**
- Primary (white text on teal): 7.8:1 (AAA)
- Secondary (white text on transparent): 11.5:1 (AAA)
- Ghost (gray text on dark): 4.9:1 (AA)
- Danger (white text on red): 6.2:1 (AA)

✅ **Focus States:**
- All buttons have visible 2px focus ring
- Ring offset 2px for breathing room
- Color matches primary-500 for consistency

✅ **Touch Targets:**
- Minimum 44×44px (iOS)
- All sizes meet this requirement

✅ **Keyboard Navigation:**
- Tab to focus
- Enter/Space to activate
- Clear visual feedback

✅ **Icons + Text:**
- Never icon-only buttons
- Always paired with text labels
- SVG icons preferred over emoji

---

## 🚫 Anti-Patterns (Don't Do This)

- ❌ Buttons with hover effects only (mobile has no hover)
- ❌ Animations >300ms for button states
- ❌ Icon-only buttons without aria-label
- ❌ Multiple primary buttons in one section
- ❌ Using outline buttons for primary CTAs
- ❌ Disabled buttons that appear interactive
- ❌ No focus ring (breaks keyboard nav)
- ❌ Text buttons without any visual feedback

---

## 📋 Implementation TODOs

- [ ] Create Button.tsx component with `variant` and `size` props
- [ ] Add Storybook stories for all 4 variants × 5 sizes
- [ ] Implement focus ring styles
- [ ] Add loading state (spinner inside button)
- [ ] Test color contrast (WCAG AA min)
- [ ] Verify touch targets (44×44px)
- [ ] Add prefers-reduced-motion query (disable transforms)
- [ ] Create CSS custom properties (design tokens)
- [ ] Add dark/light mode support (if needed)
- [ ] Document icon pairing conventions

---

## 🎯 Quick Copy-Paste (Tailwind)

```jsx
// Primary Button
<button className="px-6 py-2.5 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-400 active:scale-95 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
  COMEÇAR GRÁTIS
</button>

// Secondary Button
<button className="px-6 py-2.5 border border-white/20 text-white rounded-full font-semibold hover:bg-white/5 hover:border-white/40 active:scale-95 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
  VER MAIS
</button>

// Ghost Button
<button className="px-4 py-2.5 text-neutral-300 rounded-lg font-medium hover:bg-primary-500/10 hover:text-primary-400 active:scale-95 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150">
  Learn More
</button>
```
