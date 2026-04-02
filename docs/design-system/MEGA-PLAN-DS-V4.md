# 🎨 MEGA PLANO — Design System v4 Ultra-Modern

> **Data**: 18/03/2026 · **Objetivo**: Uplift completo de 37 componentes UI
> **Princípio**: MD3 + Apple HIG + Glassmorphism · Dark-first · WCAG AA · 3D Depth

---

## 📊 Estado Atual (Auditoria v3)

| Métrica | Atual | Meta v4 |
|---------|:-----:|:-------:|
| Tokens perfeitos | 14/35 (40%) | **35/35 (100%)** |
| Cores hardcoded | 12/35 (34%) | **0/35 (0%)** |
| Glassmorphism | 12/35 (34%) | **25/35 (71%)** |
| 3D effects | 10/35 (29%) | **20/35 (57%)** |
| Framer Motion | 8/35 (23%) | **15/35 (43%)** |
| A11y excelente | 12/35 (34%) | **30/35 (86%)** |
| A11y crítica | 2/35 FAIL | **0/35 (0%)** |
| useReducedMotion | 2/35 (6%) | **10/35 (29%)** |

---

## 🏗️ SPRINTS

### Sprint 1: 🔴 Critical A11y & Type Safety ✅ DONE
- [x] Fix 13 prop mismatches no showcase
- [x] Fix SlidingTabs `id`→`key`, `onTabChange`→`onChange`
- [x] Fix MD3Tabs `onTabChange`→`onChange`
- [x] Fix font-mono/font-bold conflict
- [x] Zero type errors confirmed

---

### Sprint 2: 🎯 Token Migration — Backgrounds
**Objetivo**: Eliminar TODOS os `bg-white`, `dark:bg-slate-*`, `bg-[#hex]` hardcoded

| Componente | De (hardcoded) | Para (token) |
|-----------|----------------|--------------|
| **stats-card.tsx** | `bg-white dark:bg-slate-800/50` | `bg-bg-primary` ou `bg-bg-secondary` |
| **tool-card.tsx** | `bg-white dark:bg-slate-800/50` | `bg-bg-primary` ou `bg-bg-secondary` |
| **page-header.tsx** | Back btn `bg-white dark:bg-slate-800` | `bg-bg-secondary` |
| **alert.tsx** | `bg-white/90 dark:bg-slate-800/85` | `bg-bg-primary/90 dark:bg-bg-elevated/85` |
| **tooltip.tsx** | `bg-[rgba(30,41,59,0.92)]` | `bg-bg-elevated/92` |
| **spinner.tsx** | `bg-emerald-500/5` PageLoader | `bg-brand-primary/5` |
| **avatar-group.tsx** | `bg-bg-surface-2`, `bg-[#1a2744]` | `bg-bg-secondary`, `bg-bg-tertiary` |
| **divider.tsx** | `border-white/8`, `from-white/20` | `border-border-light`, `from-border-primary/20` |

---

### Sprint 3: 🎯 Token Migration — Cores de Estado
**Objetivo**: Substituir `emerald-*`, `zinc-*`, `slate-*` hardcoded por tokens semânticos

| Componente | Padrão Hardcoded | Token Correto |
|-----------|-----------------|---------------|
| **button.tsx** | `emerald-500`, `zinc-600` etc. | `brand-primary`, tokens surface |
| **toggle.tsx** | `emerald-400/500` | `brand-primary` |
| **checkbox.tsx** | `emerald-400/500` | `brand-primary` |
| **badge.tsx** | `emerald-500`, `violet-500` etc. | Tokens semânticos por variante |
| **radio-group.tsx** | `emerald-*` selecionado | `brand-primary` |
| **filter-pills.tsx** | `zinc-700/800`, `emerald-*` | Tokens surface + brand |
| **sliding-tabs.tsx** | `zinc-200`, `emerald-*` | Tokens surface + brand |
| **spinner.tsx** | `emerald-500` | `brand-primary` |

---

### Sprint 4: 💎 Glassmorphism Uplift
**Objetivo**: Adicionar efeitos glass onde faz sentido visual

| Componente | Efeito a Adicionar |
|-----------|-------------------|
| **stats-card.tsx** | `backdrop-blur-sm`, `bg-bg-primary/80`, borda `border-white/6` |
| **tool-card.tsx** | `backdrop-blur-sm`, glass shine `::after` |
| **notification-card.tsx** | `backdrop-blur-sm`, borda sutil luminosa |
| **page-header.tsx** | Container com glass sutil quando tem bg |
| **avatar.tsx** | `backdrop-blur-sm` no fallback de iniciais |
| **accordion.tsx** (card variant) | `backdrop-blur-sm` no card container |
| **filter-pills.tsx** | Active pill com glass overlay |
| **modal.tsx** | Content panel com `backdrop-blur-lg`, glass border |

---

### Sprint 5: 🧊 3D Depth & Shadows
**Objetivo**: Sistema de sombras 3D consistente em todos os componentes interativos

| Componente | Melhoria 3D |
|-----------|-------------|
| **stats-card.tsx** | Shadow DS v3 tokens (`shadow-elevation-1`), hover lift |
| **tool-card.tsx** | Shadow `shadow-elevation-2`, hover `shadow-elevation-3` + `translate-y-[-2px]` |
| **notification-card.tsx** | Shadow sutil, hover micro-lift |
| **alert.tsx** | Shadow por variante (success=green glow, error=red glow) |
| **modal.tsx** | `shadow-elevation-5` no content panel |
| **custom-select-3d.tsx** | Dropdown shadow `shadow-elevation-4` |
| **badge.tsx** | Sombra 3D sutil nas variantes premium/admin |

---

### Sprint 6: ✨ Animações Modernas
**Objetivo**: Transições fluidas, shimmer premium, stagger polido

| Componente | Animação |
|-----------|----------|
| **modal.tsx** | Framer Motion `AnimatePresence`, spring scale + fade backdrop |
| **stats-card.tsx** | Hover: `scale(1.02)` + shadow expand, 200ms ease-out |
| **notification-card.tsx** | Slide-in-right entrance via Framer Motion |
| **avatar.tsx** | Image `onLoad` fade-in (opacity 0→1) |
| **skeleton.tsx** | Shimmer moderno: gradiente com `mask-image` para edge-fade |
| **accordion.tsx** | Substituir JS height por Framer Motion `AnimatePresence` |
| **stagger.tsx** | Adicionar `useReducedMotion` fallback |
| **badge.tsx** | Micro-bounce entrance (`animation: gentle-bounce 0.4s`) |
| **empty-state.tsx** | Floating particles com `useReducedMotion` |

---

### Sprint 7: ♿ ARIA Patterns Completos
**Objetivo**: Todos os padrões ARIA implementados

| Componente | Padrão ARIA |
|-----------|-------------|
| **modal.tsx** | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, **focus trap**, ESC close |
| **md3-tabs.tsx** | `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `tabIndex` roving |
| **sliding-tabs.tsx** | Mesmo padrão tablist |
| **filter-pills.tsx** | `role="tablist"` + `aria-selected` |
| **custom-select-3d.tsx** | `role="listbox"`, `role="option"`, `aria-expanded`, keyboard arrows |
| **md3-select.tsx** | Mesmo padrão listbox |
| **skeleton.tsx** | `aria-busy="true"`, `aria-label="Carregando"` |
| **md3-badge.tsx** | `aria-label` no dismiss button do Chip |

---

### Sprint 8: 🎨 Contraste & Polish de Cores
**Objetivo**: WCAG AA garantido + paleta refinada

| Área | Melhoria |
|-----|---------|
| **text-muted** em light mode | 2.56:1 → usar `text-secondary` (7.58:1) para texto informativo |
| **brand-primary** em light mode | Não usar como texto — apenas superfície. Texto: `brand-deep` |
| **Status colors** light mode | success/warning como bg+texto escuro, nunca como texto em branco |
| **Hover states** | Aumentar contraste: hover mais proeminente que rest state |
| **Focus rings** | Padronizar: `ring-2 ring-brand-primary/40 ring-offset-2 ring-offset-bg-primary` |
| **Disabled states** | Padronizar: `opacity-50 pointer-events-none saturate-50` |

---

### Sprint 9: 🖱️ Micro-Interactions & States
**Objetivo**: Feedback tátil em TODOS os elementos interativos

| Área | Implementação |
|-----|--------------|
| **Hover lift** | Cards: `hover:-translate-y-0.5`, buttons: `hover:-translate-y-px` |
| **Active press** | `active:translate-y-0.5 active:scale-[0.98]` |
| **Cursor** | `cursor-pointer` em todo elemento clicável |
| **Touch target** | Mínimo 44×44px (Apple HIG) |
| **Loading states** | Spinner + disabled em async operations |
| **Ripple** | Manter no Button, considerar em cards clicáveis |
| **Transition** | Padronizar: `transition-all duration-200 ease-out` |
| **Reduced motion** | `@media (prefers-reduced-motion)` → sem transform, opacity only |

---

### Sprint 10: 📱 Layout Components (Sidebar, Header, Mobile Nav)
**Objetivo**: Auditar e upliftar componentes de layout usados globalmente

| Componente | Foco |
|-----------|------|
| **sidebar.tsx** | Verificar tokens, glass, animação collapse |
| **header.tsx** | Verificar glass header, sticky behavior |
| **mobile-nav.tsx** | Verificar 3D pill, safe-area, haptic |

---

### Sprint 11: 🖼️ Showcase v3 — Mega Update
**Objetivo**: Atualizar showcase para demonstrar TODAS as melhorias v4

| Seção | Adição |
|-------|--------|
| Token System | Demo interativo light/dark toggle |
| Glass Effects | Comparação before/after |
| 3D Shadows | Elevation scale interativa |
| ARIA | Keyboard nav demo |
| Motion | Reduced motion toggle |
| Responsive | Mobile preview embeds |

---

## 📋 Ordem de Execução

```
Sprint 1  ✅ DONE — Type errors fixed
Sprint 2  → Token Migration Backgrounds (8 componentes)
Sprint 3  → Token Migration Cores (8 componentes)
Sprint 4  → Glassmorphism Uplift (8 componentes)
Sprint 5  → 3D Depth & Shadows (7 componentes)
Sprint 6  → Animações Modernas (9 componentes)
Sprint 7  → ARIA Patterns (8 componentes)
Sprint 8  → Contraste & Polish (6 áreas)
Sprint 9  → Micro-Interactions (8 áreas)
Sprint 10 → Layout Components (3 componentes)
Sprint 11 → Showcase v3 (6 seções)
```

**Total**: 11 sprints · ~37 componentes · ~75 melhorias individuais

---

## 🎯 KPIs de Sucesso

- [ ] Zero `bg-white` ou `dark:bg-slate-*` hardcoded
- [ ] Zero `emerald-*` hardcoded onde deveria ser `brand-primary`
- [ ] 100% ARIA patterns nos interactive components
- [ ] Glassmorphism em 70%+ dos cards/surfaces
- [ ] 3D depth em 50%+ dos elementos interativos
- [ ] `useReducedMotion` em 100% dos Framer Motion components
- [ ] WCAG AA (4.5:1) em 100% do texto informativo
- [ ] Focus trap no modal
- [ ] Keyboard nav em todos selects/tabs
- [ ] Zero type errors
- [ ] Showcase v3 com coverage 100%
