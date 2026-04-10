# VFIT Ultra v4 — Component Specifications

> **Documento:** Detalhe técnico de cada componente a ser modificado  
> **Última atualização:** 10/04/2026  
> **Responsável por:** Props, variantes, código de exemplo

---

## 📋 Índice de Componentes

1. [Button (primary & secondary)](#button-primary--secondary)
2. [GlassCard (nova variante ultra)](#glasscard-nova-variante-ultra)
3. [KPICard (redesign completo)](#kpicard-redesign-completo)
4. [ExerciseCard (glassmorfismo temático)](#exercisecard-glassmorfismo-temático)
5. [MuscleChip (tokens vs inline styles)](#musclechip-tokens-vs-inline-styles)
6. [ProgressRing (maior, mais visível)](#progressring-maior-mais-visível)
7. [BottomNavigation (spring animations)](#bottomnavigation-spring-animations)
8. [EmptyState (CTA proeminente)](#emptystate-cta-proeminente)

---

## 🔘 Button (primary & secondary)

### Spec Sprint S1

**Arquivo:** `src/components/ui/button.tsx`

**Mudanças no Secondary:**

```typescript
// ANTES (linhas ~70-75)
// const secondaryGradient = 'from-zinc-100 via-zinc-200 to-zinc-400'
// const secondaryBg = 'bg-linear-to-b'
// const secondaryShadow = 'shadow-[0_4px_0_0_#27272a,0_6px_18px_-4px_rgba(39,39,42,0.3)]'

// DEPOIS
const secondaryGradient = 'from-zinc-200 via-zinc-300 to-zinc-400'  // Mais escuro
const secondaryBg = 'bg-linear-to-b'
const secondaryShadow = 'shadow-[0_4px_0_0_#71717a,0_6px_18px_-4px_rgba(113,113,122,0.4)]'  // zinc-600
const secondaryTextShadow = 'text-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'
const secondaryHoverGlow = 'hover:shadow-[0_4px_0_0_#71717a,0_6px_18px_-4px_rgba(113,113,122,0.6)]'
```

**Props a adicionar (para uso futuro em S7):**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'workout' | 'assessment' | 'payment'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  ripple?: boolean  // default: true
  glowEffect?: boolean  // novo — para future navigation glow
}
```

**Exemplo de uso após S1:**
```tsx
<Button variant="secondary" size="md">
  Cancelar
</Button>
```

---

## 🎨 GlassCard (nova variante ultra)

### Spec Sprint S2

**Arquivo:** `src/components/ui/glass-card.tsx`

**Nova variante `ultra` a adicionar:**

```typescript
type GlassCardVariant = 'surface' | 'glass' | 'elevated' | 'outline' | 'glow' | 'gradient' | 'ultra' | 'depth'

const VARIANT_STYLES: Record<GlassCardVariant, string> = {
  // ... existing variants ...
  
  ultra: 'glass-ultra',  // Usa a classe CSS nova com blur(40px), shine, depth
  
  depth: 'glass-depth',  // Usa a classe CSS com efeito 3D neumorphism
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant
  padding?: 'sm' | 'md' | 'lg'
  hoverLift?: boolean  // novo — lift animation ao hover
  glowColor?: string   // novo — para colorized glow effect em S2
}
```

**Exemplo de uso:**
```tsx
<GlassCard variant="ultra" padding="lg" hoverLift>
  <h3>Treino do Dia</h3>
  <p>Peito e Costas</p>
</GlassCard>
```

**CSS para variante `ultra` (já em DESIGN-TOKENS.md):**
```css
.glass-ultra {
  background: var(--glass-v4-bg);
  backdrop-filter: var(--glass-v4-blur);
  border: 1px solid rgba(255,255,255,0.10);
  border-top-color: var(--glass-v4-border-top);
  border-bottom-color: var(--glass-v4-border-bottom);
  box-shadow: var(--glass-v4-shadow);
  transition: all var(--ds-motion-normal) var(--ds-ease-spring);
}

.glass-ultra:hover {
  transform: translateY(-3px);
  box-shadow: var(--glass-v4-shadow-hover);
}
```

---

## 📊 KPICard (redesign completo)

### Spec Sprint S3

**Arquivo:** `src/components/progresso/kpi-card.tsx`

**Props atualizadas:**
```typescript
interface KPICardProps {
  icon: DSIconName
  label: string
  value: string | number
  unit?: string
  color: 'blue' | 'cyan' | 'purple' | 'amber' | 'green' | 'red'
  trend?: {
    delta: number        // +5, -2, etc
    isPositive: boolean
  }
  onClick?: () => void
}
```

**Novo markup (antes: 4 linhas, depois: 8 linhas com mais detalhe):**

```tsx
export function KPICard({
  icon,
  label,
  value,
  unit,
  color,
  trend,
  onClick,
}: KPICardProps) {
  // Mapear color para tokens CSS
  const colorTokens = {
    blue: { bg: 'var(--kpi-passos-light)', border: 'var(--kpi-passos-border)', iconBg: 'var(--kpi-passos-icon-bg)' },
    cyan: { bg: 'var(--kpi-agua-light)', border: 'var(--kpi-agua-border)', iconBg: 'var(--kpi-agua-icon-bg)' },
    purple: { bg: 'var(--kpi-sono-light)', border: 'var(--kpi-sono-border)', iconBg: 'var(--kpi-sono-icon-bg)' },
    amber: { bg: 'var(--kpi-calorias-light)', border: 'var(--kpi-calorias-border)', iconBg: 'var(--kpi-calorias-icon-bg)' },
  }
  
  const tokens = colorTokens[color]

  return (
    <GlassCard
      variant="glass"
      className={cn(
        'cursor-pointer transition-all hover:scale-105',
        'rounded-2xl border p-4',
        'hover:shadow-[var(--shadow-kpi-${color})]'  // shadow colorido
      )}
      style={{
        background: tokens.bg,
        borderColor: tokens.border,
      }}
      onClick={onClick}
    >
      {/* Icon Container — background colorido */}
      <div
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: tokens.iconBg }}
      >
        <DSIcon name={icon} size={20} className="text-white" />
      </div>

      {/* Value + Unit */}
      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-xl font-black text-white">{value}</span>
        {unit && <span className="text-xs text-text-secondary">{unit}</span>}
      </div>

      {/* Label — melhor contraste */}
      <div className="mb-3 text-xs font-medium text-zinc-400">{label}</div>

      {/* Trend Badge — novo */}
      {trend && (
        <div className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
          trend.isPositive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
        )}>
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.delta)}%</span>
        </div>
      )}
    </GlassCard>
  )
}
```

**Exemplo de uso após S3:**
```tsx
<KPICard
  icon="footprints"
  label="Passos"
  value={8234}
  unit="passos"
  color="blue"
  trend={{ delta: 12, isPositive: true }}
/>
```

---

## 🏃 ExerciseCard (glassmorfismo temático)

### Spec Sprint S5/S6

**Arquivo:** `src/components/exercicios/exercise-card.tsx` (verificar se existe)

**Props:**
```typescript
interface ExerciseCardProps {
  id: string
  name: string
  muscleGroup: 'peito' | 'costas' | 'ombros' | 'biceps' | 'triceps' | 'pernas' | 'abdomen' | 'gluteos'
  difficulty: 'iniciante' | 'intermediario' | 'avancado'
  imageUrl?: string
  sets?: number
  reps?: string
  onClick?: () => void
}
```

**Novo markup com glassmorfismo temático:**

```tsx
export function ExerciseCard({
  id,
  name,
  muscleGroup,
  difficulty,
  imageUrl,
  sets,
  reps,
  onClick,
}: ExerciseCardProps) {
  // Mapear muscleGroup para cores
  const colorMap = {
    peito: { primary: 'var(--muscle-peito-primary)', light: 'var(--muscle-peito-light)' },
    costas: { primary: 'var(--muscle-costas-primary)', light: 'var(--muscle-costas-light)' },
    // ... outros grupos ...
  }

  const colors = colorMap[muscleGroup]
  const difficultyColors = {
    iniciante: 'bg-green-500/15 text-green-400',
    intermediario: 'bg-amber-500/15 text-amber-400',
    avancado: 'bg-red-500/15 text-red-400',
  }

  return (
    <div
      className="group cursor-pointer rounded-xl transition-all hover:scale-105"
      onClick={onClick}
      style={{
        background: colors.light,
        borderColor: colors.primary,
      }}
    >
      {/* Image Container — 3D thumbnail */}
      <div className="relative h-40 w-full overflow-hidden rounded-t-xl bg-linear-to-br from-white/10 to-black/20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <DSIcon name={getMuscleIcon(muscleGroup)} size={40} className="opacity-40" />
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="space-y-2 p-3">
        {/* Exercise Name */}
        <h4 className="line-clamp-2 text-sm font-semibold text-white">{name}</h4>

        {/* Muscle + Difficulty Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <DSIcon
              name={getMuscleIcon(muscleGroup)}
              size={14}
              style={{ color: colors.primary }}
            />
            <span className="text-xs capitalize text-text-secondary">{muscleGroup}</span>
          </div>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', difficultyColors[difficulty])}>
            {difficulty.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Sets x Reps Badge */}
        {sets && reps && (
          <div className="rounded-lg bg-white/8 px-2 py-1 text-xs text-zinc-300">
            {sets}x {reps}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 🎯 MuscleChip (tokens vs inline styles)

### Spec Sprint S5

**Arquivo:** `src/app/(app)/plano/page.tsx`

**ANTES (❌ violação — inline style hardcoded hex):**
```tsx
const MUSCLE_COLORS = {
  peito: '#ef4444',
  costas: '#3b82f6',
  ombros: '#f59e0b',
  // ...
}

<button style={{ backgroundColor: MUSCLE_COLORS[muscle] }}>
  {muscle}
</button>
```

**DEPOIS (✅ usando tokens CSS):**
```tsx
const MUSCLE_CHIP_CLASSES = {
  peito: 'bg-(--muscle-peito-primary)',
  costas: 'bg-(--muscle-costas-primary)',
  ombros: 'bg-(--muscle-ombros-primary)',
  biceps: 'bg-(--muscle-biceps-primary)',
  triceps: 'bg-(--muscle-triceps-primary)',
  pernas: 'bg-(--muscle-pernas-primary)',
  abdomen: 'bg-(--muscle-abdomen-primary)',
  gluteos: 'bg-(--muscle-gluteos-primary)',
}

interface MuscleChipProps {
  muscle: keyof typeof MUSCLE_CHIP_CLASSES
  isActive?: boolean
  onClick?: () => void
}

export function MuscleChip({ muscle, isActive, onClick }: MuscleChipProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
        'transition-all hover:scale-105',
        isActive
          ? cn(MUSCLE_CHIP_CLASSES[muscle], 'text-white shadow-[0_0_12px_var(--muscle-${muscle}-primary)]')
          : 'bg-white/8 text-text-secondary hover:bg-white/12'
      )}
      onClick={onClick}
    >
      <DSIcon name={getMuscleIcon(muscle)} size={14} />
      <span className="capitalize">{muscle}</span>
    </button>
  )
}
```

---

## 📈 ProgressRing (maior, mais visível)

### Spec Sprint S4

**Arquivo:** (buscar em `src/components/...`)

**Mudanças:**
- Aumentar raio de stroke (de ~45px para ~60px)
- Aumentar size do SVG (de 120x120 para 160x160)
- Adicionar animação spring no mount (scale 0.8 → 1.0)
- Text display maior (de text-2xl para text-3xl)

**Exemplo:**
```tsx
interface ProgressRingProps {
  percent: number
  size?: number  // novo: default 120, pode ser 160
  strokeWidth?: number  // novo: default 4, pode ser 6
  color?: string
}

export function ProgressRing({
  percent,
  size = 160,  // Aumentado
  strokeWidth = 6,
  color = '#22c55e',
}: ProgressRingProps) {
  const circumference = 2 * Math.PI * 45  // raio 45 → 60
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="flex items-center justify-center animation-[scale-spring]">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={45}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={45}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute text-3xl font-black text-white">{percent}%</div>
    </div>
  )
}
```

---

## 🧭 BottomNavigation (spring animations)

### Spec Sprint S7

**Arquivo:** `src/components/navigation/bottom-navigation.tsx`

**Mudanças:**
- Active indicator: `scale(1.0)` → `scale(1.08)` com glow
- FAB central: adicionar pulsing glow animation
- Badge: scale animation ao aparecer

**Novo estado de animação:**
```tsx
const activeIndicatorVariants = {
  inactive: { scale: 0.9, opacity: 0.6 },
  active: {
    scale: 1.08,
    opacity: 1,
    boxShadow: '0 0 20px rgba(34,197,94,0.3)',
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
}

const fabVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.1,
    boxShadow: '0 0 30px rgba(34,197,94,0.4)',
  },
}
```

---

## 🗑️ EmptyState (CTA proeminente)

### Spec Sprint S8

**Arquivo:** `src/components/ui/empty-state-ds.tsx`

**Props:**
```typescript
interface EmptyStateProps {
  icon: DSIconName
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'error' | 'success'
}
```

**Novo markup com CTA tamanho `lg`:**

```tsx
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl bg-white/3 p-8 text-center">
      {/* Icon — maior, colorizado */}
      <div className="rounded-full bg-brand-primary/15 p-4">
        <DSIcon name={icon} size={48} className="text-brand-primary" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white">{title}</h3>

      {/* Description */}
      <p className="max-w-sm text-sm text-text-secondary">{description}</p>

      {/* CTA — tamanho lg */}
      {action && (
        <Button
          size="lg"  // novo: h-14 em vez de h-12
          onClick={action.onClick}
          className="mt-4 w-full max-w-xs"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

---

## ✅ Checklist por Componente

- [ ] Button: secondary gradient + shadow + text-shadow
- [ ] GlassCard: variante `ultra` + `depth` com CSS classes
- [ ] KPICard: icon container colorido + trend badge
- [ ] ExerciseCard: glassmorfismo temático + DSIcon
- [ ] MuscleChip: migrar para tokens CSS (ZERO hex hardcoded)
- [ ] ProgressRing: size 160x160, stroke 6, scale animation
- [ ] BottomNavigation: active indicator com scale + glow
- [ ] EmptyState: CTA size `lg`, icon maior

---

## 🔗 Referência Cruzada

| Componente | Sprint | Status | Arquivo |
|-----------|--------|--------|---------|
| Button | S1 | ⬜ | `src/components/ui/button.tsx` |
| GlassCard | S2 | ⬜ | `src/components/ui/glass-card.tsx` |
| KPICard | S3 | ⬜ | `src/components/progresso/kpi-card.tsx` |
| ExerciseCard | S5/S6 | ⬜ | `src/components/exercicios/exercise-card.tsx` |
| MuscleChip | S5 | ⬜ | `src/app/(app)/plano/page.tsx` (inline) |
| ProgressRing | S4 | ⬜ | `src/components/progresso/progress-ring.tsx` |
| BottomNavigation | S7 | ⬜ | `src/components/navigation/bottom-navigation.tsx` |
| EmptyState | S8 | ⬜ | `src/components/ui/empty-state-ds.tsx` |
