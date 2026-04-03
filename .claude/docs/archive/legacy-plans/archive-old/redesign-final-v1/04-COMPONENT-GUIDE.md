# 🧩 Guia de Componentes — Redesign v2

> Especificação visual e funcional de todos os componentes base.

---

## Sistema de Componentes

### Princípios
1. **Composable** — Componentes pequenos que se combinam
2. **Token-based** — Tudo via CSS variables, nada hardcoded
3. **Responsive-first** — Mobile → Tablet → Desktop
4. **Animation-ready** — Toda interação tem feedback visual
5. **Accessible** — ARIA labels, focus rings, keyboard nav
6. **Flutter-ready** — Nomenclatura e estrutura portáveis

---

## 🔘 Button

### Variants

| Variant | Background | Text | Border | Uso |
|---------|-----------|------|--------|-----|
| `primary` | brand-primary | #09090B | none | CTA principal |
| `secondary` | white/5 | white | white/10 | CTA secundário |
| `ghost` | transparent | text-secondary | none | Links, ações leves |
| `outline` | transparent | brand-primary | brand-primary/30 | Ações médias |
| `danger` | error/10 | error | error/20 | Delete, cancel |
| `success` | success/10 | success | success/20 | Confirmar |

### Sizes

| Size | Height | Padding X | Font | Radius |
|------|--------|-----------|------|--------|
| `xs` | 28px | 10px | 12px | radius-sm |
| `sm` | 32px | 14px | 13px | radius-md |
| `md` | 40px | 18px | 14px | radius-md |
| `lg` | 48px | 24px | 16px | radius-lg |
| `xl` | 56px | 32px | 18px | radius-xl |

### States
```
Default → Hover (scale 1.02 + shadow) → Active (scale 0.98) → Disabled (opacity 0.5)
Loading → Spinner + text "Carregando..."
```

### Interação
```css
/* Hover */
transform: scale(1.02);
box-shadow: var(--shadow-2);

/* Active */  
transform: scale(0.98);

/* Primary hover glow */
box-shadow: 0 0 30px rgba(61, 252, 164, 0.3);
```

---

## 🃏 Card

### Variants

| Variant | Background | Border | Shadow | Uso |
|---------|-----------|--------|--------|-----|
| `surface` | bg-secondary | border-light | shadow-1 | Default |
| `glass` | glass-bg | glass-border | shadow-glass | Overlays |
| `elevated` | bg-tertiary | none | shadow-2 | Destaque |
| `outline` | transparent | border-light | none | Listas |
| `glow` | bg-secondary | brand-primary/20 | shadow-glow | Premium |

### Props
```tsx
interface CardProps {
  variant?: 'surface' | 'glass' | 'elevated' | 'outline' | 'glow'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  radius?: 'md' | 'lg' | 'xl' | '2xl'
  hover?: boolean     // Hover effect
  clickable?: boolean // Cursor pointer + hover
  className?: string
  children: React.ReactNode
}
```

### Hover Effect
```css
/* hover=true */
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

&:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-2);
  border-color: rgba(255, 255, 255, 0.12);
}
```

---

## 📝 Input

### Design: Floating Label
```
┌──────────────────────────────────────┐
│  Email                    [✓]        │ ← Label flutua para cima quando focused/filled
│  usuario@email.com                   │
└──────────────────────────────────────┘
     ↑ Green border quando focado
```

### States

| State | Border | Label | Icon |
|-------|--------|-------|------|
| Empty | border-light | inside, muted | none |
| Focused | brand-primary | floating, brand | none |
| Filled | border-light | floating, muted | ✓ verde |
| Error | error | floating, error | ⚠ vermelho |
| Disabled | border-light/50 | muted/50 | none |

### Variants

| Variant | Background | Uso |
|---------|-----------|-----|
| `default` | bg-secondary | Forms gerais |
| `glass` | glass-bg | Overlays, modais |
| `outline` | transparent | Clean forms |

---

## 🏷️ Badge

### Variants

| Variant | Background | Text | Uso |
|---------|-----------|------|-----|
| `default` | text-muted/10 | text-muted | Genérico |
| `primary` | brand-primary/15 | brand-primary | Destaque |
| `success` | success/15 | success | Ativo, completo |
| `warning` | warning/15 | warning | Pendente |
| `error` | error/15 | error | Atrasado, erro |
| `info` | info/15 | info | Informativo |
| `purple` | purple-500/15 | purple-400 | XP, gamification |

### Sizes

| Size | Height | Font | Padding X | Radius |
|------|--------|------|-----------|--------|
| `xs` | 18px | 10px | 6px | radius-full |
| `sm` | 22px | 11px | 8px | radius-full |
| `md` | 26px | 12px | 10px | radius-full |
| `lg` | 32px | 14px | 14px | radius-full |

---

## 👤 Avatar

### Sizes

| Size | Dimensão | Font (initials) | Radius |
|------|----------|-----------------|--------|
| `xs` | 24px | 10px | full |
| `sm` | 32px | 12px | full |
| `md` | 40px | 14px | full |
| `lg` | 56px | 20px | full |
| `xl` | 80px | 28px | full |
| `2xl` | 120px | 40px | full |

### Features
- Imagem com `border-radius: 9999px`
- Fallback: iniciais com gradiente (baseado no nome → hash → cor)
- Status dot: online (verde), offline (cinza), busy (amarelo)
- Ring: borda verde para premium/verified

---

## 📊 StatsCard (Dashboard KPI)

### Layout
```
┌──────────────────────────────────┐
│  📈  Alunos Ativos         +12% │
│                                  │
│       47                         │ ← Número grande, bold
│                                  │
│  ──────────────────── (sparkline)│
│  vs. mês anterior: +5           │
└──────────────────────────────────┘
```

### Variants
- `default` — Surface card com ícone colorido
- `gradient` — Background com gradiente sutil
- `compact` — Sem sparkline, menor

---

## 💀 Skeleton (Placeholder)

### Regras
1. **Tamanho EXATO** do conteúdo que substitui
2. **Shimmer animation** (linear, 2s loop)
3. **Border radius** igual ao conteúdo
4. **Background**: `border-light/60` (adapta dark/light)

### Componentes
```tsx
// Primitivo
<Shimmer className="h-4 w-32 rounded-md" />

// Compostos
<SkeletonCard />          // Card com header + body
<SkeletonStatsGrid />     // 4 KPI cards
<SkeletonTable rows={5} /> // Tabela com N linhas
<SkeletonAvatar size="md" /> // Avatar circular
<SkeletonChart />         // Área de gráfico
```

---

## 🖼️ OptimizedImage

### Props
```tsx
interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  blurDataURL?: string    // Base64 blur placeholder
  priority?: boolean      // Preload (LCP images)
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
  objectFit?: 'cover' | 'contain' | 'fill'
}
```

### Comportamento
1. Mostra blur placeholder enquanto carrega
2. Fade-in suave quando carregada (300ms)
3. Border-radius aplicado tanto no placeholder quanto na imagem
4. `aspect-ratio` calculado de width/height
5. `loading="lazy"` por padrão, `priority` desabilita lazy

---

## 🎠 Componentes Interativos

### Toggle (Switch)
```
┌──────┐      ┌──────┐
│ ○    │  →   │    ● │
└──────┘      └──────┘
 OFF (cinza)   ON (verde)
```
- Transition: 200ms spring
- Size: `sm` (16px) / `md` (20px) / `lg` (24px)

### Tooltip
- Delay: 300ms
- Background: bg-tertiary
- Border: border-light
- Shadow: shadow-3
- Radius: radius-md
- Max-width: 240px
- Arrow: 6px

### Dropdown Menu
- Glass background
- Border: glass-border
- Shadow: shadow-3
- Items: 36px height, hover bg-tertiary
- Separator: border-light
- Animation: scale-in 150ms

---

## 📐 Responsive Behavior

### Mobile (< 640px)
- Stack tudo verticalmente
- Cards full-width
- Bottom nav fixo (5 items)
- Sidebar → drawer
- Font scale: 90%

### Tablet (640-1024px)
- Grid 2 colunas
- Sidebar colapsada (ícones)
- Cards em grid
- Font scale: 95%

### Desktop (> 1024px)
- Grid 3-4 colunas
- Sidebar expandida
- Layout side-by-side
- Font scale: 100%

---

## 🎬 Micro-Animações

| Interação | Animação | Duração |
|----------|----------|---------|
| Hover card | translateY(-2px) + shadow | 200ms |
| Click button | scale(0.98) | 100ms |
| Open modal | scale-in + overlay fade | 300ms |
| Close modal | scale(0.95) + fade out | 200ms |
| Tab switch | slide-in direction-aware | 250ms |
| Toggle | spring slide + color | 200ms |
| Notification | slide-in-right + glow | 400ms |
| Page transition | fade + slide-up | 300ms |
| Counter increment | spring number flip | 500ms |
| Chart load | draw path + fade bars | 800ms |

---

*Referência para todos os devs. Atualizar conforme componentes são implementados.*
