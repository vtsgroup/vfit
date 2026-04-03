# Sprint 9 — Animations, Icons & Micro-interactions

> **Fase:** 3 · **Prioridade:** 🟢 MÉDIA · **Estimativa:** 6-8h
> **Objetivo:** Polimento visual: LazyMotion, SVG icons premium, micro-interactions

---

## 🎯 Problema

1. **framer-motion full bundle** — 37 imports, ~40-60KB gzipped não otimizado
2. **Emojis em lugar de ícones** — loading, steps, cards usam 💪🏋️🎯 em vez de SVG
3. **Bottom nav sem dual-state icons** — outlined (inativo) vs filled (ativo)
4. **Sem micro-interactions** — botões não têm feedback, cards não animam
5. **Animações CSS pesadas** — 18 keyframes em globals.css, muitos não usados

---

## 📋 Tasks

### T9.1 — LazyMotion + dynamic imports
**Arquivo:** `src/components/providers/motion-provider.tsx` (NOVO)

```tsx
'use client'
import { LazyMotion, domAnimation } from 'framer-motion'

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}
```

**Arquivo:** Layouts que usam motion → wrap com `<MotionProvider>`

**Benefício:** ~40-60% redução do bundle de framer-motion.

### T9.2 — Migrar `motion.div` → `m.div`
**Em TODOS os componentes que usam framer-motion:**

```tsx
// ❌ Antes
import { motion } from 'framer-motion'
<motion.div animate={{ opacity: 1 }}>

// ✅ Depois
import { m } from 'framer-motion'
<m.div animate={{ opacity: 1 }}>
```

**Grep para encontrar:**
```bash
grep -rn "from 'framer-motion'" src/ | wc -l  # ~37 arquivos
grep -rn "motion\." src/ | wc -l              # instâncias a substituir
```

### T9.3 — Dynamic import para xlsx/pdf-lib/qrcode
**Componentes que importam pacotes pesados:**

```tsx
// ❌ Antes (bundle inclui sempre)
import * as XLSX from 'xlsx'
import { PDFDocument } from 'pdf-lib'
import QRCode from 'qrcode'

// ✅ Depois (carrega sob demanda)
const XLSX = await import('xlsx')
const { PDFDocument } = await import('pdf-lib')
const QRCode = await import('qrcode')
```

**Arquivos afetados:**
- `src/components/admin/` — exports Excel
- `src/components/payments/` — PDF de recibos
- `src/components/assessment/` — PDF de avaliação
- `src/components/student/` — QR code de convite

### T9.4 — SVG Icon Set para onboarding
**Criar:** `src/components/icons/onboarding-icons.tsx`

Set de ícones SVG para substituir emojis no onboarding:

| Contexto | Emoji | SVG Component |
|----------|:-----:|---------------|
| Peso | ⚖️ | `<ScaleIcon />` |
| Altura | 📏 | `<RulerIcon />` |
| Objetivo | 🎯 | `<TargetIcon />` |
| Exercício | 🏋️ | `<DumbbellIcon />` |
| Nutrição | 🍎 | `<AppleIcon />` |
| Progresso | 📈 | `<TrendUpIcon />` |
| Streak | 🔥 | `<FlameIcon />` |
| Timer | ⏱ | `<TimerIcon />` |
| Coração | ❤️ | `<HeartIcon />` |
| Estrela | ⭐ | `<StarIcon />` |

**Padrão:** 24×24 viewBox, `stroke="currentColor"`, strokeWidth 2, strokeLinecap round.

### T9.5 — Bottom Nav dual-state icons
**Arquivo:** `src/components/layout/bottom-navigation.tsx`

Ícones com estado visual diferente quando ativo:

```tsx
// Outlined (inativo)
function WorkoutIconOutlined() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 6.5h-3a1 1 0 00-1 1v9a1 1 0 001 1h3m0-11v11m0-11h4m-4 11h4m0-11h4m-4 11h4m0-11h3a1 1 0 011 1v9a1 1 0 01-1 1h-3" />
    </svg>
  )
}

// Filled (ativo)
function WorkoutIconFilled() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.5 6.5h-3a1 1 0 00-1 1v9a1 1 0 001 1h3m0-11v11m0-11h4m-4 11h4m0-11h4m-4 11h4m0-11h3a1 1 0 011 1v9a1 1 0 01-1 1h-3" />
    </svg>
  )
}

// No tab component:
{isActive ? <WorkoutIconFilled /> : <WorkoutIconOutlined />}
```

### T9.6 — Micro-interactions CSS
**Arquivo:** `src/app/globals.css`

Animações sutis e performáticas:

```css
/* Card hover lift */
.card-interactive {
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.card-interactive:active {
  transform: scale(0.98);
}

/* Skeleton shimmer otimizado */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton-shimmer {
  background: linear-gradient(90deg,
    var(--color-bg-surface-2) 25%,
    var(--color-bg-surface-3) 50%,
    var(--color-bg-surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Progress bar fill animation */
@keyframes fill-progress {
  from { width: 0; }
  to { width: var(--progress); }
}
```

### T9.7 — Cleanup CSS dead keyframes
**Arquivo:** `src/app/globals.css`

Remover keyframes não usados (identificados na auditoria):
- Verificar cada `@keyframes` com grep no src/
- Remover os que não têm referência
- Consolidar duplicatas

```bash
# Script de auditoria:
for kf in $(grep -oP '@keyframes \K\S+' src/app/globals.css); do
  count=$(grep -rn "$kf" src/ --include="*.tsx" --include="*.ts" --include="*.css" | wc -l)
  echo "$kf: $count refs"
done
```

### T9.8 — Button ripple effect
**Arquivo:** `src/components/ui/button.tsx`

O Button já tem prop `ripple` (default true). Verificar se está funcionando:
- Ripple deve ser CSS-only (não JS heavy)
- Cor do ripple deve ser `currentColor` com opacity 0.12
- Duração: 400ms

### T9.9 — Page transition animations
**Usar CSS animations, não framer-motion, para transições de página:**

```css
/* Entrada de página */
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: page-enter 300ms ease-out;
}
```

Aplicar a cada page root em `(app)/`:
```tsx
export default function TreinosPage() {
  return <div className="page-enter">{/* ... */}</div>
}
```

---

## ✅ Critérios de Aceite

- [ ] LazyMotion configurado, bundle reduzido
- [ ] `motion.` substituído por `m.` em todos os componentes
- [ ] xlsx/pdf-lib/qrcode importados dinamicamente
- [ ] Zero emojis como ícones de UI (SVGs everywhere)
- [ ] Bottom nav com dual-state icons (outlined/filled)
- [ ] Card hover/press feedback
- [ ] CSS keyframes dead code removido
- [ ] Page transitions suaves (CSS-only)

---

## 📁 Arquivos Impactados

```
src/components/providers/motion-provider.tsx (NOVO)
src/components/icons/onboarding-icons.tsx (NOVO)
src/components/layout/bottom-navigation.tsx — dual icons
src/app/globals.css — cleanup + novos keyframes
~37 arquivos com framer-motion — motion→m migration
~5 arquivos com xlsx/pdf-lib — dynamic import
```
