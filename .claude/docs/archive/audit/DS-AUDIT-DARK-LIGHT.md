# 🔍 Auditoria Completa — Design System Dark/Light Mode

> **Data**: 19/03/2026
> **Escopo**: 62 componentes em `src/components/ui/`
> **Autor**: Copilot audit session

---

## 📊 Resumo Executivo

| Severidade | Qtd | Status |
|:----------:|:---:|:------:|
| 🔴 HIGH (quebrado em light mode) | **7** | ✅ Corrigido v6.3.8 |
| 🟡 MEDIUM (glitch visual) | **5** | ✅ 3 corrigidos · 2 aceitáveis |
| 🟢 LOW (inconsistência) | **2** | ⚠️ Aceitável |
| ✅ Limpo | **48** | ✅ OK |

> **Correção aplicada**: v6.3.8 — 19/03/2026 — ~70 classes corrigidas em 9 arquivos

### Causa Raiz dos Problemas

1. **`:where()` zero specificity** — `@custom-variant dark/light` usa `:where()`, então classes base sem `dark:`/`light:` prefix vencem as variantes
2. **Dark-first pattern** — componentes usam `bg-white/4`, `text-white` como base, esperando `light:` override, mas `light:` perde por especificidade
3. **Correção global aplicada** — `@layer base { border-color: var(--color-border-light) }` já resolve borders default

---

## 🔴 HIGH — Quebrado em Light Mode (7 componentes)

### 1. `command-palette.tsx`
- **Problema**: ~20+ classes dark-first sem `dark:` prefix, zero `light:` overrides
- **Afetado**: Trigger button, panel, items, separadores, texto, hover states
- **Classes**: `bg-white/6`, `text-white`, `text-white/50`, `border-white/8`, `hover:bg-white/8`
- **Fix**: Prefixar tudo com `dark:` + adicionar `light:` overrides

### 2. `cookie-consent.tsx`
- **Problema**: Hardcoded dark — fundo escuro, texto branco, zero mode support
- **Classes**: `bg-bg-secondary`, `text-white`, `text-white/70`, `bg-white/5`
- **Fix**: Adicionar `light:` overrides ou converter para tokens semânticos

### 3. `modern-form.tsx`
- **Problema**: ZERO suporte light mode — formulário inteiro dark-only
- **Classes**: `text-white`, `text-white/60`, `bg-white/5`, `border-white/10`, `placeholder:text-white/30`
- **Fix**: Refatorar para `dark:`/`light:` explícito em todos os elementos

### 4. `modern-filter.tsx`
- **Problema**: ZERO suporte light mode — filtros invisíveis em fundo claro
- **Classes**: `text-white`, `text-white/70`, `bg-white/5`, `border-white/8`, `bg-kpi-dark`
- **Fix**: Mesma abordagem — `dark:`/`light:` explícito

### 5. `modern-notification.tsx`
- **Problema**: ZERO suporte light mode — painel de notificações ilegível
- **Classes**: `text-white`, `text-white/50`, `bg-white/3`, `border-white/6`, `bg-[#0B1221]`
- **Fix**: Substituir hardcoded hex por tokens + `dark:`/`light:`

### 6. `modern-toast.tsx`
- **Problema**: ZERO suporte light mode — toasts com texto branco
- **Classes**: `text-white`, `text-white/80`, `bg-white/5`, `border-white/10`
- **Fix**: `dark:`/`light:` explícito

### 7. `bottom-sheet.tsx`
- **Problema**: Drag handle e close button invisíveis em light mode
- **Classes**: `bg-white/20` (drag handle), `hover:bg-white/10` (close)
- **Fix**: Prefixar com `dark:` + adicionar `light:` equivalentes

---

## 🟡 MEDIUM — Glitch Visual (5 componentes)

### 8. `action-button-3d.tsx`
- **Problema**: Sintaxe bracket deprecated (Regra 12 Tailwind v4)
- **Linha 201**: `dark:bg-white/[0.03]` → deveria ser `dark:bg-white/3`
- **Linha 202**: `dark:bg-white/[0.06]` → deveria ser `dark:bg-white/6`
- **Fix**: Substituir bracket notation por sintaxe canônica

### 9. `scroll-hint.tsx`
- **Problema**: Token `kpi-dark` hardcoded em gradiente
- **Fix**: Substituir por token semântico que mude com tema

### 10. `custom-select-3d.tsx`
- **Problema**: Hex hardcoded `dark:bg-[#0f1a2e]/95` no dropdown
- **Linha 117**: deveria usar `dark:bg-bg-surface-2/95`
- **Fix**: Substituir por token semântico

### 11. `md3-select.tsx`
- **Problema**: Hex hardcoded `dark:bg-[#0f1a2e]/95` + base classes dark-first que podem conflitar com `light:`
- **Linha 226**: `bg-white/95 dark:bg-[#0f1a2e]/95 light:bg-white/98`
- **Fix**: Remover `bg-white/95` base (conflita com `light:`) + substituir hex

### 12. `image-comparison-slider.tsx`
- **Problema**: Overlay fullscreen dark-only (possivelmente intencional — cinema mode)
- **Fix**: Avaliar se precisa de `light:` overrides para controles

---

## 🟢 LOW — Inconsistência de Estilo (2 componentes)

### 13. `sliding-tabs.tsx`
- **Problema**: `text-white` no badge do tab ativo sobre fundo verde — intencional
- **Ação**: Nenhuma — contexto visual justifica

### 14. `filter-pills.tsx`
- **Problema**: Padrão invertido (light-first em vez de dark-first) — funcional
- **Ação**: Nenhuma — funciona corretamente

---

## ✅ Componentes Limpos (48 — sem problemas)

accordion, action-buttons, ai-bot-fab, alert, animated-counter, avatar, avatar-group,
avatar-plan-badge, badge, button, card, checkbox, demo-mode-banner, divider, ds-icon,
empty-state, empty-state-ds, glass-card, input, intersection-reveal, loading-bar,
loading-overlay, md3-badge, md3-card, md3-input, md3-progress, md3-tabs, modal,
notification-card, optimized-image, page-header, page-skeletons, progress-bar-ds,
pull-to-refresh, radio-group, skeleton, skeletons, spinner, splash-screen, stagger,
staggered-list, stats-card, styled-select, toggle, tool-card, tooltip, user-search

---

## 🎯 Prioridade de Correção

### Sprint 1 — Crítico (impacta UX em light mode)
1. `modern-form.tsx` — usado em formulários de alunos
2. `modern-toast.tsx` — notificações visíveis em toda app
3. `bottom-sheet.tsx` — modal mobile essencial
4. `command-palette.tsx` — busca global

### Sprint 2 — Importante (componentes secundários)
5. `cookie-consent.tsx` — banner LGPD
6. `modern-notification.tsx` — painel de notificações
7. `modern-filter.tsx` — filtros de listagens

### Sprint 3 — Polish
8. `action-button-3d.tsx` — sintaxe deprecated
9. `custom-select-3d.tsx` — hex hardcoded
10. `md3-select.tsx` — hex hardcoded
11. `scroll-hint.tsx` — token hardcoded

---

## 🔧 Padrão de Correção (Template)

```tsx
// ❌ ANTES (dark-first sem prefix)
'bg-white/5 text-white border-white/10'

// ✅ DEPOIS (explícito em ambos modos)
'dark:bg-white/5 light:bg-slate-100 dark:text-white light:text-slate-900 dark:border-white/10 light:border-slate-200'

// ✅ MELHOR (tokens semânticos quando possível)
'bg-bg-secondary text-text-primary border-border-light'
```

### Equivalências de cores dark→light

| Dark | Light equivalent |
|------|-----------------|
| `bg-white/3-6` | `bg-slate-50` ou `bg-slate-100` |
| `bg-white/8-12` | `bg-slate-100` ou `bg-slate-200/60` |
| `text-white` | `text-slate-900` |
| `text-white/50-70` | `text-slate-500` ou `text-slate-600` |
| `text-white/30-40` | `text-slate-400` |
| `border-white/6-10` | `border-slate-200` ou `border-slate-200/60` |
| `border-white/15-20` | `border-slate-300` |
| `hover:bg-white/8` | `hover:bg-slate-100` ou `hover:bg-black/5` |
| `bg-[#0B1221]` | `bg-bg-secondary` (token) |
| `bg-[#0f1a2e]` | `bg-bg-surface-2` (token) |

---

## 📝 Notas Técnicas

- **`:where()` specificity = 0** — qualquer classe sem prefix vence `dark:`/`light:` variants
- **Tokens semânticos são o melhor caminho** — mudam via CSS variable sem luta de especificidade
- **`@layer base { border-color }` fix** — já aplicado globalmente, resolve borders default
- **Componentes "modern-*"** foram criados antes da migração dark/light — padrão dark-only
- **`splash-screen.tsx`** usa `bg-[#050A12]` hardcoded — intencional (sempre dark)
