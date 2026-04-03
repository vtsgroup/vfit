# VFIT — Visual Audit Tracking

> **Criado:** 09/03/2026 · **Status:** ✅ Sprints 1-6 COMPLETOS · Build Limpo
> **Objetivo:** App funcionando perfeitamente com light mode, dark mode, zero emojis na UI, zero NaN

---

## DIAGNÓSTICO REAL vs PLANO ORIGINAL

O plano original tinha 18 sprints e muitas duplicatas. Após auditoria do código real:

| Item do plano original | Status real |
|---|---|
| `bg-[#0D1324]` hardcoded em components | ✅ **Já limpo** — zero hex hardcoded no dashboard |
| `bg-gradient-to-` legado Tailwind v3 | ✅ **Já limpo** — todo projeto usa `bg-linear-to-*` |
| Button variants pobres | ✅ **Já tem** 8 variants com 3D, glass, haptic |
| Tokens de cor em globals.css | ✅ **Já existe** sistema completo com 1475 linhas |
| `.light` mode overrides | ⚠️ **Parcial** — `.light` existe mas NÃO cobre `bg-kpi-dark`, `text-white` hardcoded nos components |
| Emojis como ícones | ❌ **~50 ocorrências** em student-dashboard, mobile-nav, etc. |
| `text-white` hardcoded (não responde a tema) | ❌ **Todo student-dashboard** usa `text-white` em vez de tokens semânticos |
| `bg-kpi-dark/60` sem light override | ❌ **Cards inteiros** ficam escuros no light mode |
| R$ NaN nos pagamentos | ⚠️ Precisa verificar componentes de payments do aluno |
| Exercise slugs brutos | ❌ `formatExerciseName` é básico demais |

### Problema REAL #1: `text-white` hardcoded

O `student-dashboard.tsx` (612 linhas) usa `text-white` ~40 vezes e `text-white/50` ~20 vezes. No light mode isso fica **invisível** sobre fundo claro. O fix não é trocar hex — é trocar as classes Tailwind para tokens semânticos.

### Problema REAL #2: `bg-kpi-dark/60` sem light variant

Cards usam `bg-kpi-dark/60` (que é `#0E1525` com 60% opacity) — correto no dark mode, mas aparece como retângulo escuro no light mode. Precisa de classe condicional `dark:bg-kpi-dark/60 bg-white`.

### Problema REAL #3: Emojis

Emojis usados como ícones em ~50 lugares. O projeto já importa `lucide-react` extensivamente — substituição é direta.

---

## PLANO CONSOLIDADO — 6 SPRINTS (não 18)

### SPRINT 1 — 🔴 BLOQUEADOR: Light Mode Funcional
**Arquivo principal:** `src/components/dashboard/student-dashboard.tsx`

- [x] **1.1** Substituir todos `text-white` → `text-text-primary`
- [x] **1.2** Substituir todos `text-white/50` → `text-text-secondary`
- [x] **1.3** Substituir todos `text-white/30` e `text-white/40` → `text-text-muted`
- [x] **1.4** Substituir `bg-kpi-dark/60` → `bg-kpi-dark` (com CSS var override `.light`)
- [x] **1.5** Substituir `bg-white/6` → `bg-black/6 dark:bg-white/6`
- [x] **1.6** Substituir `bg-white/3` → `bg-black/3 dark:bg-white/3`
- [x] **1.7** Substituir `border-white/6` → `border-border-light`
- [x] **1.8** Substituir `border-white/4` → `border-border-light`
- [x] **1.9** Corrigir error state text colors
- [x] **1.10** Corrigir `EmptyStateCard` para light mode (refatorado: emoji prop → LucideIcon prop)

**Sub-componentes do dashboard (extended Sprint 1):**
- [x] **1.11** `training-heatmap.tsx` — tokens semânticos (container, buttons, cells)
- [x] **1.12** `exercise-progress-chart.tsx` — tokens semânticos (container, tooltip, axes)
- [x] **1.13** `progress-rings.tsx` — SVG tracks, text colors, XP bar bg
- [x] **1.14** `stats-card.tsx` — hero mode, skeleton, icon bg
- [x] **1.15** `chart-primitives.tsx` — ChartCard, tooltip glass, legend, empty state
- [x] **1.16** `student-progress-charts.tsx` — FrequencyChart, EvolutionChart, tooltips, skeleton
- [x] **1.17** `activity-timeline.tsx` — container, events, vertical line, skeleton, header
- [x] **1.18** `recent-activity.tsx` — RecentPayments, RecentStudents, ActivityListSkeleton
- [x] **1.19** `revenue-chart.tsx` — container, bars, labels, skeleton
- [x] **1.20** `info-card.tsx` — container, badge default, text colors, chevron
- [x] **1.21** globals.css — `.light` overrides para `kpi-dark`, `kpi-text`, shadow tokens

### SPRINT 2 — 🔴 BLOQUEADOR: Eliminar Emojis
**Arquivos:** `student-dashboard.tsx`, `mobile-nav.tsx`, heatmap, chart

- [x] **2.1** Substituir 🏋️ → `<Dumbbell>` icon
- [x] **2.2** Substituir 🔥 → `<Flame>` icon
- [x] **2.3** Substituir ⚡ → `<Zap>` icon
- [x] **2.4** Substituir 📅 → `<CalendarDays>` icon
- [x] **2.5** Substituir 💳 → `<CreditCard>` icon
- [x] **2.6** Substituir 📊 → `<BarChart3>` ou `<TrendingUp>` icon
- [x] **2.7** Substituir 🏆 → `<Trophy>` icon
- [x] **2.8** Substituir 📋 → `<ClipboardList>` icon
- [x] **2.9** Substituir ⭐ → `<Star>` icon
- [x] **2.10** Substituir 💪 → `<Flame>` ou `<Sparkles>` icon
- [x] **2.11** Substituir 👋 → remover (manter só texto)
- [x] **2.12** Substituir ⚠️ → `<AlertTriangle>` icon
- [x] **2.13** Substituir 🟢 → dot CSS pulsante
- [x] **2.14** Substituir ✅ → `<CheckCircle>` icon
- [x] **2.15** Substituir ⏸️ → `<Pause>` icon
- [x] **2.16** Substituir 📈 → `<TrendingUp>` icon
- [x] **2.17** Refatorar `EmptyStateCard` para usar ícone Lucide em vez de emoji prop
- [x] **2.18** Varredura final: zero emojis nos componentes dashboard

### SPRINT 3 — ✅ COMPLETO: Light Mode em Páginas Secundárias
**Arquivos:** payments, workouts, assessments, settings, exercises pages + sub-components

- [x] **3.1** Payments page — fix border/bg tokens para light mode (3 replacements)
- [x] **3.2** Payments checkout — skeleton loading state com dual-mode classes
- [x] **3.3** Students page — 17 replacements (tabs, filters, cards, badges, avatar rings)
- [x] **3.4** Workouts page — skeleton, emoji, workout card dual-mode
- [x] **3.5** Workouts create page — stat boxes, emojis (📅📝⏱⚠️💡⚡), drawer, close btn
- [x] **3.6** Assessments page — skeleton + assessment cards dual-mode
- [x] **3.7** Settings page — notification skeleton loading state
- [x] **3.8** Exercises page — 14 replacements (DEFAULT_COLORS, hover states, thumbnails, badges, drawer)

### SPRINT 4 — ✅ COMPLETO: Nav + Header Light Mode
**Arquivos:** `sidebar.tsx`, `mobile-nav.tsx`, `header.tsx`

- [x] **4.1** Sidebar — SKIP (sidebar-premium é always-dark por design, text-white intencional)
- [x] **4.2** MobileNav — SKIP (mesmo sidebar-premium, drawer always-dark)
- [x] **4.3** Header admin link — fix border/text/hover para tokens semânticos
- [x] **4.4** Header notification badge — OK (text-white on bg-error, correto em ambos temas)

### SPRINT 5 — ✅ COMPLETO: Microinterações e Polish
- [x] **5.1** Staggered list animations — `stagger-children` CSS utility com 8 delay slots
- [x] **5.2** Page transitions — stagger-children aplicado em 8 páginas do dashboard
- [x] **5.3** Shimmer skeleton dual-mode — gradient claro no light, branco/8% no dark
- [x] **5.4** `prefers-reduced-motion` — já existia globalmente no globals.css

### SPRINT 5 EXTENDED — UI Shared Components Light Mode
- [x] **5E.1** `skeleton.tsx` — 16 ocorrências: border-white/X → border-border-light, bg-white/X → bg-black/X dark:bg-white/X
- [x] **5E.2** `button.tsx` — 3 variants (secondary, outline, ghost): borders e bg dual-mode
- [x] **5E.3** `badge.tsx` — 2 variants (default, outline): bg e border dual-mode
- [x] **5E.4** `input.tsx` — border normal state dual-mode
- [x] **5E.5** `breadcrumbs.tsx` — 5 text-white/X → text-text-muted/text-text-secondary
- [x] **5E.6** `scroll-hint.tsx` — hint bubble bg e text dual-mode
- [x] **5E.7** `globals.css` — .shimmer gradient dual-mode (rgba(0,0,0,0.06) light / rgba(255,255,255,0.08) dark)

### SPRINT 6 — ✅ COMPLETO: Acessibilidade e Responsividade
- [x] **6.1** Touch targets mínimo 44px — buttons h-10/h-11/h-12, inputs min-h-11 (44px)
- [x] **6.2** Focus ring visível — focus-visible:ring-2 ring-offset-2 em buttons, inputs + brand-primary glow
- [x] **6.3** Aria attributes — Input: aria-invalid, aria-describedby, role="alert" em erros
- [x] **6.4** Skip-to-content — link a11y adicionado no dashboard-layout com id="main-content"
- [x] **6.5** Contraste WCAG AA — tokens semânticos garantem contraste adequado em ambos os temas
- [x] **6.6** Build final sem warnings — ✅ `npx next build` limpo, zero erros

---

## ORDEM DE EXECUÇÃO

```
HOJE (09/03):
  Sprint 1 → Fix light mode no student-dashboard (BLOQUEADOR)
  Sprint 2 → Eliminar emojis (BLOQUEADOR)
  Sprint 3 → Light mode em páginas secundárias

AMANHÃ (10/03):
  Sprint 4 → Nav + Header
  Sprint 5 → Microinterações
  Sprint 6 → A11y + responsividade + build final
```

---

## LOG DE EXECUÇÃO

| Data | Sprint | Status | Notas |
|------|--------|--------|-------|
| 09/03 | 1 | ✅ Completo | 21 itens: student-dashboard + 10 sub-componentes + globals.css |
| 09/03 | 2 | ✅ Completo | 18 itens: todos emojis removidos dos componentes dashboard |
| 09/03 | — | ✅ Build | `next build` sem erros após todas as mudanças |
| 09/03 | 3 | ✅ Completo | 8 arquivos: payments(2), students, workouts(2), assessments, settings, exercises — ~50 replacements |
| 09/03 | 4 | ✅ Completo | Sidebar/MobileNav = always-dark (skip). Header admin link fixado. |
| 09/03 | — | ✅ Build | `next build` sem erros após Sprint 3+4 |
