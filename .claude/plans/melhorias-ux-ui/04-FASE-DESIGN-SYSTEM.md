# 🎨 FASE 2 — DESIGN SYSTEM MODERNO

**Fase:** 2/4  
**Sprints:** 5-10  
**Duração:** 3 semanas (semanas 3-5 de projeto)  
**Horas:** 106h (dev) + 26h (QA)  
**Status:** ⏳ Bloqueado em Fase 1  
**Objetivo:** Implementar design system azul escuro, WCAG 2.1 AA compliance, componentes reutilizáveis  

---

## 📅 Timeline

```
Semana 3    Semana 4    Semana 5
───────────  ──────────  ──────────
Sprint 5     Sprint 6-7  Sprint 8-10
Tokens &     Buttons &   Apply
Colors       Components  Everywhere

10h dev      17h dev     27h dev
+ 1h qa      + 2h qa     + 5h qa

Definição    Novos       Dashboard
do padrão    componentes completo
```

---

## 📦 Pré-requisitos Fase 2

Antes de iniciar, confirmar:
- ✅ Fase 1: Todos bugs P0 corrigidos
- ✅ Color tokens: definidos em `config/vfit-colors.ts`
- ✅ Tailwind v4: instalado e configurado
- ✅ Design reference: skill UI/UX Pro Max validada

---

## 🎨 Sprint 5 — Color Tokens & Padrão Azul (10h Dev + 1h QA)

**Objetivo:** Definir paleta de cores azul escuro, tokens CSS, validar WCAG  
**Dependências:** Nenhuma (começa após Fase 1)  
**Acceptance:** 100% azul (vs. 30% verde), WCAG AA mínimo, zero hardcoded colors  

---

### Task 5.1: Definir Color Palette (3h)

Criar sistema de cores azul escuro + neutros.

**O que fazer:**

1. **Criar arquivo de tokens**
```typescript
// config/vfit-colors.ts
export const VFIT_COLORS = {
  // Primary — Azul escuro (vs. verde #22c55e anterior)
  primary: {
    50: '#f0f6ff',      // lightest
    100: '#e0ecff',
    200: '#bfd9ff',
    300: '#84c9ff',
    400: '#47b1ff',
    500: '#1d94ff',     // main (vs. #22c55e verde)
    600: '#0077db',     // darker
    700: '#0052b3',     // darkest
    800: '#003d8a',
    900: '#002d66'      // very dark
  },

  // Secondary — Cinza neutro (não compete com azul)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },

  // Status colors
  success: '#10b981',    // verde para sucesso
  warning: '#f59e0b',    // âmbar para aviso
  error: '#ef4444',      // vermelho para erro
  info: '#3b82f6',       // azul info

  // Semantic
  brand: {
    primary: '#1d94ff',  // CTA principal
    secondary: '#0077db', // ação secundária
    accent: '#84c9ff'    // destaque
  }
}
```

2. **Mapear para Tailwind**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1d94ff',
        'brand-secondary': '#0077db',
        'brand-accent': '#84c9ff',
        'text-primary': '#0f172a',      // light mode
        'text-secondary': '#475569',
        'text-muted': '#94a3b8',
        'bg-primary': '#ffffff',        // light
        'bg-secondary': '#f8fafb',
        'bg-tertiary': '#f1f4f6',
        'dark:text-primary': '#f0f4f8', // dark mode
        'dark:bg-primary': '#050a12',
        'dark:bg-secondary': '#0b1221'
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #1d94ff, #0077db)'
      }
    }
  }
}
```

3. **CSS variables**
```css
/* src/app/globals.css */
:root {
  /* Primary */
  --color-brand-primary: 29 148 255;      /* #1d94ff */
  --color-brand-secondary: 0 119 219;     /* #0077db */
  --color-brand-accent: 132 201 255;      /* #84c9ff */

  /* Status */
  --color-success: 16 185 137;            /* #10b981 */
  --color-warning: 245 158 11;            /* #f59e0b */
  --color-error: 239 68 68;               /* #ef4444 */
  --color-info: 59 130 246;               /* #3b82f6 */

  /* Text */
  --color-text-primary: 15 23 42;         /* #0f172a */
  --color-text-secondary: 71 85 105;      /* #475569 */
  --color-text-muted: 148 163 184;        /* #94a3b8 */

  /* Background (light mode) */
  --color-bg-primary: 255 255 255;        /* #ffffff */
  --color-bg-secondary: 248 250 252;      /* #f8fafb */
  --color-bg-tertiary: 241 244 246;       /* #f1f4f6 */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Text (dark mode) */
    --color-text-primary: 240 244 248;    /* #f0f4f8 */
    --color-text-secondary: 148 163 184;  /* #94a3b8 */

    /* Background (dark mode) */
    --color-bg-primary: 5 10 18;          /* #050a12 */
    --color-bg-secondary: 11 18 33;       /* #0b1221 */
    --color-bg-tertiary: 17 27 46;        /* #111b2e */
  }
}

/* Utility classes */
.text-primary { color: rgb(var(--color-text-primary) / <alpha-value>); }
.text-secondary { color: rgb(var(--color-text-secondary) / <alpha-value>); }
.text-muted { color: rgb(var(--color-text-muted) / <alpha-value>); }

.bg-primary { background-color: rgb(var(--color-bg-primary) / <alpha-value>); }
.bg-secondary { background-color: rgb(var(--color-bg-secondary) / <alpha-value>); }

.border-brand { border-color: rgb(var(--color-brand-primary) / <alpha-value>); }
```

4. **Validação WCAG**

```bash
# Instalar ferramenta de contraste
npm install contrast-checker --save-dev

# Testar combinações críticas
npx contrast-checker \
  --bg '#0f172a' --fg '#ffffff' \
  --bg '#050a12' --fg '#f0f4f8'
# Esperado: >7.0 (AAA) ✅
```

**Tempo:** 3h  
**QA:** 0.5h (validar WCAG, sem hardcoded colors)

---

### Task 5.2: Aplicar Tokens a Componentes Base (4h)

Atualizar Button, Badge, Input, etc.

**O que fazer:**

1. **Button component**
```typescript
// src/components/ui/button.tsx (update)
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-brand-primary hover:bg-brand-secondary text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-neutral-200 dark:bg-neutral-600 text-text-primary dark:text-text-primary hover:bg-neutral-300',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white',
    ghost: 'text-brand-primary hover:bg-brand-primary hover:bg-opacity-10',
    danger: 'bg-error text-white hover:bg-red-700'
  }

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
    icon: 'h-11 w-11'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      className={cn(
        'rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
        variants[variant],
        sizes[size],
        loading && 'opacity-70 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          {children}
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}
```

2. **Badge component**
```typescript
// src/components/ui/badge.tsx (update)
interface BadgeProps {
  variant?: 'solid' | 'outline' | 'soft'
  color?: 'brand' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  children: ReactNode
}

export function Badge({
  variant = 'soft',
  color = 'brand',
  children
}: BadgeProps) {
  const variants = {
    solid: {
      brand: 'bg-brand-primary text-white',
      success: 'bg-success text-white',
      warning: 'bg-warning text-gray-900',
      error: 'bg-error text-white',
      info: 'bg-info text-white',
      neutral: 'bg-neutral-300 dark:bg-neutral-600 text-text-primary'
    },
    outline: {
      brand: 'border-2 border-brand-primary text-brand-primary',
      success: 'border-2 border-success text-success',
      warning: 'border-2 border-warning text-warning',
      error: 'border-2 border-error text-error',
      info: 'border-2 border-info text-info',
      neutral: 'border-2 border-neutral-300 text-text-secondary'
    },
    soft: {
      brand: 'bg-brand-accent/20 text-brand-primary',
      success: 'bg-success/20 text-success',
      warning: 'bg-warning/20 text-warning',
      error: 'bg-error/20 text-error',
      info: 'bg-info/20 text-info',
      neutral: 'bg-neutral-100 dark:bg-neutral-700 text-text-secondary'
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
        variants[variant][color]
      )}
    >
      {children}
    </span>
  )
}
```

3. **Input component**
```typescript
// src/components/ui/input.tsx (update)
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border-2 border-neutral-200 dark:border-neutral-600 bg-white dark:bg-bg-secondary',
        'px-4 py-2 text-text-primary dark:text-text-primary',
        'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
        'transition-colors',
        className
      )}
      {...props}
    />
  )
}
```

4. **Teste**
   - Todos componentes: azul (vs. verde)
   - Contraste: ≥4.5:1
   - Dark mode: automático
   - Focus states: visível

**Tempo:** 4h  
**QA:** 0.5h

---

### Task 5.3: Validação de Cores (3h)

Fazer auditoria WCAG completa.

**O que fazer:**

```bash
# 1. Auditoria automatizada
npx axe-core src/components/

# 2. Check manual com WebAIM
# https://webaim.org/resources/contrastchecker/
# Testar todas 15+ combinações de cor+bg

# 3. Chrome DevTools
# DevTools → Lighthouse → Accessibility
# Target: 90+ score

# 4. Teste dark mode
# DevTools → Rendering → Emulate CSS media feature: prefers-color-scheme
# Verificar todos cores escuros funcionam

# 5. Teste com Voiceover/NVDA
# Ler todos textos, cores não dão significado sozinhas
```

**Resultado esperado:**
- ✅ 100% WCAG AA (4.5:1+)
- ✅ 0 color-only semantics
- ✅ Dark mode funcional
- ✅ Acessibilidade 90+ score

**Tempo:** 3h  
**QA:** Incluído acima

---

### Sprint 5 Summary

| Task | Tempo | QA | Total |
|------|-------|-----|-------|
| Color palette | 3h | 0.5h | **3.5h** |
| Update components | 4h | 0.5h | **4.5h** |
| WCAG validation | 3h | — | **3h** |
| **Sprint 5 Total** | **10h** | **1h** | **11h** |

**Acceptance:**
- ✅ Paleta azul definida
- ✅ Tokens em 5+ componentes
- ✅ WCAG AA 100%
- ✅ Dark mode funcionando
- ✅ 0 hardcoded colors

---

## 🔘 Sprint 6 — Button Redesign (9h Dev + 2h QA)

**Objetivo:** Redesenhar todos botões com novas cores, estados, animações  
**Dependências:** Sprint 5 (color tokens)  
**Acceptance:** 5 variantes + 4 tamanhos + 6 estados, 60fps, a11y perfeita  

### Task 6.1: Variantes de Botão (3h)

Definir 5 variantes completas.

**O que fazer:**

Já implementado em Task 5.2 Button component. Aqui expandir:

```typescript
// Adicionar mais variantes
const variants = {
  primary: {
    base: 'bg-brand-primary text-white',
    hover: 'hover:bg-brand-secondary shadow-lg hover:shadow-xl',
    active: 'active:scale-95',
    focus: 'focus:ring-2 focus:ring-brand-primary/50'
  },
  secondary: {
    base: 'bg-neutral-200 dark:bg-neutral-600 text-text-primary',
    hover: 'hover:bg-neutral-300 dark:hover:bg-neutral-500',
    active: 'active:scale-95',
    focus: 'focus:ring-2 focus:ring-neutral-400'
  },
  outline: {
    base: 'border-2 border-brand-primary text-brand-primary',
    hover: 'hover:bg-brand-primary hover:text-white',
    active: 'active:scale-95',
    focus: 'focus:ring-2 focus:ring-brand-primary/50'
  },
  ghost: {
    base: 'text-brand-primary',
    hover: 'hover:bg-brand-primary/10',
    active: 'active:scale-95',
    focus: 'focus:ring-2 focus:ring-brand-primary/50'
  },
  danger: {
    base: 'bg-error text-white',
    hover: 'hover:bg-red-700 shadow-lg hover:shadow-xl',
    active: 'active:scale-95',
    focus: 'focus:ring-2 focus:ring-error/50'
  }
}

// 4 tamanhos
const sizes = {
  sm: 'h-10 px-3 text-sm font-medium rounded-md',
  md: 'h-12 px-6 text-base font-semibold rounded-lg',
  lg: 'h-14 px-8 text-lg font-semibold rounded-lg',
  icon: 'h-11 w-11 rounded-lg flex items-center justify-center'
}

// 6 estados
states = [
  'default',
  'hover',
  'active/pressed',
  'focus (keyboard)',
  'disabled',
  'loading'
]
```

**Tempo:** 3h

---

### Task 6.2: Estados de Botão (3h)

Implementar todos 6 estados com Framer Motion.

**O que fazer:**

```typescript
export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      whileFocus={{ outline: '2px solid' }}
      disabled={loading || disabled}
      animate={loading ? { opacity: 0.6 } : { opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        /* base styles */
        'rounded-lg font-semibold transition-all',
        
        /* variant */
        variants[variant],
        
        /* size */
        sizes[size],
        
        /* disabled state */
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        
        className
      )}
      {...props}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        props.children
      )}
    </motion.button>
  )
}
```

**Tempo:** 3h

---

### Task 6.3: Testes de Button (3h)

Fazer testes visuais e funcionais.

**Testes:**
- [ ] 5 variantes × 4 tamanhos = 20 combinações visuais
- [ ] Todos 6 estados funcionam
- [ ] Contrast ratio ≥4.5:1
- [ ] Animações 60fps
- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] Screen reader accessibility
- [ ] Mobile: tap targets ≥44×44px

**Tempo:** 3h  
**QA:** 2h (visuais + acessibilidade)

---

### Sprint 6 Summary

| Task | Tempo | QA | Total |
|------|-------|-----|-------|
| Variantes | 3h | 0.75h | **3.75h** |
| Estados | 3h | 0.75h | **3.75h** |
| Testes | 3h | 0.5h | **3.5h** |
| **Sprint 6 Total** | **9h** | **2h** | **11h** |

**Acceptance:**
- ✅ 5 variantes completas
- ✅ 4 tamanhos + 6 estados
- ✅ 60fps animations
- ✅ WCAG AA compliance
- ✅ Keyboard accessible

---

## 📦 Sprint 7-10: Aplicar Design System Globalmente (68h Dev + 16h QA)

**Objetivo:** Aplicar novo design system a todas páginas e componentes  
**Divisão:**
- Sprint 7: Componentes reutilizáveis (Card, Modal, etc.) — 8h
- Sprint 8: Página /onboarding completa — 7h
- Sprint 9: Dashboard /treinos + /nutricao — 13h
- Sprint 10: Revisão visual final + deploy — 7h

**Acceptance:** 100% azul, WCAG AA 100%, zero verde hardcoded

---

### Sprint 7: Atualizar Componentes Reutilizáveis (8h + 1.5h QA)

Refatorar Badge, Card, Modal, Avatar, etc.

**Tasks:**
1. Badge (já feito em Sprint 6): 0.5h
2. Card: header + footer, shadows, rounded — 2h
3. Modal/Dialog: close button, overflow, background blur — 2h
4. Avatar: cores determinísticas, fallback, initials — 1.5h
5. Dropdown/Menu: items, separators, hover — 1.5h
6. Testes + validação — 0.5h

**Tempo:** 8h + 1.5h QA = **9.5h**

---

### Sprint 8: Redesign /onboarding (7h + 1.5h QA)

Aplicar design system a todo fluxo onboarding.

**Tasks:**
1. Step backgrounds: azul + gradiente — 1h
2. Form fields: novos estilos — 1h
3. Botões: primários/secundários com animações — 1h
4. Progress bar: azul + animada — 0.5h
5. Validação visual: error states — 0.75h
6. Dark mode: testado completamente — 0.75h
7. Mobile: optimizado responsivo — 1h
8. Testes + QA — 1.5h

**Tempo:** 7h + 1.5h QA = **8.5h**

---

### Sprint 9: Dashboard Aplicação (13h + 2.5h QA)

Redesign de /dashboard, /treinos, /nutricao.

**Tasks:**
1. Dashboard layout: sidebar + main — 2h
2. Cards de treino: novo design — 2h
3. Listagem de alimentos: novo design — 2h
4. Gráficos: cores novas — 1.5h
5. Tables: cabeçalhos, linhas alternadas — 1.5h
6. Mobile layout: adaptado — 2h
7. Dark mode: completo — 1h
8. Testes + QA — 2.5h

**Tempo:** 13h + 2.5h QA = **15.5h**

---

### Sprint 10: Validação & Deploy (7h + 1h QA)

Revisão visual final, performance check, deploy.

**Tasks:**
1. Side-by-side comparação: antes/depois — 1h
2. Lighthouse audit: target 80+ — 1h
3. Dark mode final: tudo testado — 1h
4. WCAG final: acessibilidade 100% — 1h
5. Performance: bundle size check — 0.5h
6. Correções de bugs achados — 1h
7. Deploy staging → production — 1h
8. Monitoring + logs — 1h

**Tempo:** 7h + 1h QA = **8h**

---

### Fase 2 Summary Completo

| Sprint | Dev | QA | Total |
|--------|:---:|:--:|:-----:|
| 5 | 10h | 1h | **11h** |
| 6 | 9h | 2h | **11h** |
| 7 | 8h | 1.5h | **9.5h** |
| 8 | 7h | 1.5h | **8.5h** |
| 9 | 13h | 2.5h | **15.5h** |
| 10 | 7h | 1h | **8h** |
| **Total Fase 2** | **54h** | **9.5h** | **63.5h** |

---

## 🎯 Fase 2 Success Metrics

**Antes (v1.9.3):**
```
- Cores: 30% azul, 70% verde #22c55e
- WCAG: 70% AA, 30% não conformante
- Lighthouse: 62 (mobile)
- Contraste: alguns <4.5:1
```

**Depois (v2.0.0 Fase 2):**
```
- Cores: 100% azul (0% verde)
- WCAG: 100% AA compliance
- Lighthouse: 80+ (mobile)
- Contraste: 100% ≥4.5:1
- Dark mode: 100% funcional
```

---

## 📝 Instruções de Execução

**Início:** Assim que Fase 1 estiver 100% completa

**Ordem:** Sprint 5 → 6 → 7 → 8 → 9 → 10 (sequencial)

**Commits:** 1 commit por sprint com tag de versão
```bash
git commit -m "feat: design system azul — Sprint 5-10 (fase 2)"
git tag v1.9.5-design-system
```

**Deploy:** Depois de Sprint 10
```bash
npm run cf:deploy:minor  # v1.9.x → v1.10.0
```

**Próximo:** Após sucesso Fase 2, começa [Fase 3 — Features](05-FASE-FEATURES.md)

---

**Volta para:** [README.md](README.md) | [INDEX.md](INDEX.md) | [ROADMAP](02-ROADMAP-FASES.md)
