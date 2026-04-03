# Design System — VFIT

> Paleta web (Next.js), contrastes WCAG, componentes UI, tokens CSS.
> Para design system mobile (React Native), ver `.claude/vfit-design-system.md`.

---

## Cores & Contraste (Web — Tema Atual)

### Fundos do Tema

| Token | Light | Dark |
|-------|-------|------|
| `bg-primary` | `#ffffff` | `#050A12` |
| `bg-secondary` | `#F8FAFB` | `#0B1221` |
| `bg-tertiary` | `#F1F4F6` | `#111B2E` |

### Texto Seguro (mín WCAG AA 4.5:1)

| Texto | vs Light bg | vs Dark bg |
|-------|:-----------:|:----------:|
| `text-primary` (#0F172A / #F0F4F8) | **17.85:1** AAA | **17.95:1** AAA |
| `text-secondary` (#475569 / #94A3B8) | **7.58:1** AAA | **7.74:1** AAA |
| `text-muted` (#94A3B8 / #64748B) | **2.56:1** ❌ | **4.17:1** ⚠️ |

> ⚠️ `text-muted` em light mode (2.56:1) — APENAS para placeholders/captions decorativos, NUNCA para texto informativo.

### Botões — Escala Zinc

| Variant | Light (bg → text) | Dark (bg → text) |
|---------|-------------------|-------------------|
| **secondary** | `zinc-300` (#d4d4d8) → `zinc-700` · 12.08:1 AAA | `zinc-600` (#52525b) → `zinc-100` · 6.99:1 AA |
| **outline** | `zinc-200` (#e4e4e7) → `zinc-600` · 13.62:1 AAA | `zinc-500` (#71717a) → `zinc-100` · 4.37:1 AA-lg |

> **Por que zinc?** Slate tem subtom azul (+18 RGB) que compete com verde da marca. Zinc é neutro (+4 RGB), como Apple HIG System Gray.

### ❌ NUNCA em Light Mode (contraste < 3:1 vs branco)

- `text-brand-primary` (#22C55E) como texto → use `green-700` (#15803d, 4.67:1)
- `text-success` (#10B981) como texto → use `emerald-700` (#047857, 5.47:1)
- `text-warning` (#F59E0B) como texto → use `amber-700` (#B45309, 4.86:1)
- `text-whatsapp` (#25D366) como texto → use `green-700` (#15803d, 4.67:1)

> **Regra**: Cores vibrantes em light mode → usar como **superfície com texto escuro**, nunca como texto sobre branco.

### ✅ Seguro em Dark Mode (todas ≥ 4.5:1 vs #050A12)

- `brand-primary` 8.71:1 · `success` 7.82:1 · `warning` 9.24:1 · `error` 5.27:1 · `info` 5.39:1 · `ai` 4.68:1 · `whatsapp` 10.0:1

### Shadow 3D — Fórmula

```
Light: superfície → shadow 2 tons mais escuro (zinc-300 → shadow zinc-400 #a1a1aa)
Dark:  superfície → shadow zinc-800 (#27272a) — funciona universal
```

---

## Componente `<Button>` — Design System

**Arquivo:** `@/components/ui/button`

### Variantes

| Variant | Uso |
|---------|-----|
| `primary` (default) | CTA principal — verde com depth 3D |
| `secondary` | Ação secundária — zinc neutro |
| `outline` | Ação terciária — borda com hover |
| `ghost` | Ação sutil — sem borda, hover leve |
| `ghost-danger` | Ação destrutiva sutil |
| `danger` | Ação destrutiva enfática |
| `workout` | Específico de treinos |
| `assessment` | Específico de avaliações |
| `payment` | Específico de pagamentos |

### Tamanhos

| Size | Height |
|------|--------|
| `sm` | h-10 |
| `md` (default) | h-12 |
| `lg` | h-14 |
| `icon` | h-11 w-11 |

### Props

- `loading` — Spinner + disabled automático
- `ripple` — Efeito ripple (default true)

---

## Ícones — DSIcon (OBRIGATÓRIO)

```typescript
// ❌ import { Bell } from 'lucide-react'
// ✅ import { DSIcon } from '@/components/ui/ds-icon'
//    <DSIcon name="bell" size={20} />
```

Componente wrapper que centraliza todos os ícones. Nunca importar lucide/heroicons diretamente.

---

## CSS Tokens (globals.css)

### Cores semânticas

```css
--ds-brand-primary: var(--color-green-500);
--ds-text-primary: ...;
--ds-text-secondary: ...;
--ds-text-muted: ...;
--ds-bg-primary: ...;
--ds-bg-secondary: ...;
--ds-bg-tertiary: ...;
```

### Aliases do tema

| Alias | Uso | Exemplo |
|-------|-----|---------|
| `bg-kpi-dark` | Background KPI cards (dark) | `bg-kpi-dark/80` |
| `shadow-glass` | Shadow glassmorphism | `shadow-glass` |

### Regras de CSS

- CSS vars `--ds-*` e classes Tailwind semânticas (`brand-primary`, `text-primary`)
- **Nunca** hardcode cores hex no JSX
- Usar aliases do tema (`bg-kpi-dark`) em vez de brackets (`bg-[#0E1525]`)

---

## Acessibilidade (WCAG 2.1 AA)

- Contraste ≥4.5:1 para texto normal, ≥3:1 para texto grande
- Focus states visíveis (2–4px ring)
- Cor + ícone para significado semântico (erro = vermelho + X)
- Botões: min 44×44px touch target
- `prefers-reduced-motion: reduce` respeitado

---

## Doc Detalhado

Para paleta completa, contrastes exaustivos e regras de manutenção:
→ `docs/DESIGN-SYSTEM-COLORS.md`

Para design system v3 spec:
→ `docs/design-system/vfit-design-system-v3-docs.md`
