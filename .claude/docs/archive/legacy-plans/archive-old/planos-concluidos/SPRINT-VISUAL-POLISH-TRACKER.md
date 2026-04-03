# 🎨 SPRINT VISUAL POLISH — Tracker de Progresso

> **Iniciado:** 04/03/2026 · **Objetivo:** Uniformizar TODAS as páginas do dashboard com design consistente
> **Padrões aplicados:** headers `font-black tracking-tight`, containers/inputs `rounded-xl`, semantic color tokens, Tailwind v4 canônico

---

## 📏 Padrões de Design (Referência Rápida)

| Elemento | Classe padrão |
|----------|---------------|
| Header de página | `text-2xl font-black tracking-tight text-text-primary` |
| Containers, inputs, selects, textareas, alerts | `rounded-xl` |
| Elementos pequenos (icon 8x8/10x10, toggle pills, pagination, badges overlay, skeletons) | `rounded-lg` (manter) |
| Cores de fundo | `bg-bg-page`, `bg-bg-secondary`, `bg-bg-tertiary` |
| Texto | `text-text-primary`, `text-text-secondary`, `text-text-muted` |
| Bordas | `border-border-light`, `border-border-dark` |
| Focus rings | `focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10` |

---

## ✅ Sprint 1 — Layout + PageHero + Breadcrumbs (v4.4.9)
**Deploy:** v4.4.9 · **Data:** 04/03/2026
- [x] Componentes shared: `page-hero.tsx`, `breadcrumbs.tsx`
- [x] Route group `(public)` com layout unificado
- [x] 9 páginas públicas com Navbar + Footer + Hero

## ✅ Sprint 2 — PageMetadata + FaqInline + Legais (v4.5.0)
**Deploy:** v4.5.0 · **Data:** 04/03/2026
- [x] `page-metadata.tsx`, `faq-inline.tsx` components
- [x] 5 páginas legais redesenhadas (termos, privacidade, cookies, LGPD, excluir-conta)

## ✅ Sprint 3-5 — Institutional + Blog (v4.5.1)
**Deploy:** v4.5.1 · **Data:** 04/03/2026
- [x] Páginas institucionais (sobre, contato, carreiras)
- [x] Blog listing + Blog posts individuais

## ✅ Sprint 6 — Pricing Page (v4.5.2)
**Deploy:** v4.5.2 · **Data:** 04/03/2026
- [x] Página de preços dedicada redesenhada

## ✅ Sprint 7 — Auth Pages (v4.5.3)
**Deploy:** v4.5.3 · **Data:** 04/03/2026
- [x] forgot-password, reset-password, verify-email polished

## ✅ Sprint 8 — Dashboard Shell (v4.5.4)
**Deploy:** v4.5.4 · **Data:** 05/03/2026
- [x] `header.tsx` reescrito com breadcrumbs (35+ ROUTE_MAP)
- [x] `sidebar.tsx` refinado (glow, Tw4 fixes)

## ✅ Sprint 9 — Student-Facing Pages (v4.5.5)
**Deploy:** v4.5.5 · **Data:** 05/03/2026
- [x] `assessments/page.tsx` — header font-black
- [x] `payments/page.tsx` — ambas views font-black, filters rounded-xl
- [x] `notifications/page.tsx` — font-black, tabs rounded-xl
- [x] `messages/page.tsx` — semantic tokens, font-black
- [x] `settings/page.tsx` — font-black, all inputs rounded-xl

## ✅ Sprint 10 — Workout & Assessment Detail (v4.5.6)
**Deploy:** v4.5.6 · **Data:** 05/03/2026
- [x] `workouts/create/page.tsx` — font-black, containers rounded-xl
- [x] `workout-detail.tsx` — rounded-xl
- [x] `workout-player.tsx` — rounded-xl
- [x] `assessment-detail.tsx` — rounded-xl
- [x] `assessment-form-v2.tsx` — rounded-xl
- [x] Exercise create/library/media library pages — font-black headers

## ✅ Sprint 11 — Financial Pages (v4.5.7)
**Deploy:** v4.5.7 · **Data:** 05/03/2026
- [x] `financeiro/page.tsx` — header font-black, containers rounded-xl
- [x] `payments/create/page.tsx` — header text-2xl font-black, inputClassName rounded-xl, ~8 containers
- [x] `payments/checkout/page.tsx` — 4x headers font-black, inputs rounded-xl, alerts rounded-xl
- [x] `payments/withdraw/page.tsx` — header font-black, inputs rounded-xl, warning box rounded-xl
- [x] `affiliates/page.tsx` — 2x headers font-black, tab container rounded-xl, inputs rounded-xl
- [x] `marketplace/page.tsx` — header font-black, search/filter inputs rounded-xl
- [x] `marketplace/create/page.tsx` — header text-2xl font-black, ~8 inputs rounded-xl
- [x] `marketplace/view/page.tsx` — header font-black, stat boxes rounded-xl, workout cards rounded-xl

## ✅ Sprint 12 — Admin + Remaining Dashboard Pages (v4.5.8)
**Deploy:** v4.5.8 · **Data:** 05/03/2026

### Admin Pages (7 arquivos)
- [x] `admin/page.tsx` — header font-black, KPI values mantidos font-bold (dados numéricos)
- [x] `admin/feedback/page.tsx` — inputs/selects rounded-xl
- [x] `admin/payments/page.tsx` — header font-black, ~15 inputs/containers rounded-xl
- [x] `admin/personals/page.tsx` — header font-black, ~8 inputs rounded-xl, error containers rounded-xl
- [x] `admin/users/page.tsx` — header font-black, ~10 inputs/containers rounded-xl
- [x] `admin/workouts/page.tsx` — header font-black, inputs/error containers rounded-xl
- [x] `admin/smoke/page.tsx` — header font-black (já tinha rounded-xl nos botões)

### Remaining Dashboard Pages (5 arquivos)
- [x] `students/page.tsx` — header font-black, 2x filter selects rounded-xl
- [x] `ai/page.tsx` — header font-black, KPI values mantidos font-bold
- [x] `logs/page.tsx` — header text-2xl font-black (era text-xl), ~6 inputs rounded-xl, pre blocks rounded-xl
- [x] `complete-profile/page.tsx` — header font-black, ~3 inputs rounded-xl
- [x] `dashboard/page.tsx` — já estava limpo (sem font-bold headers, sem rounded-lg)

## ✅ Sprint 13 — A11y + Tw4 Cleanup (v4.5.9)
**Deploy:** v4.5.9 · **Data:** 05/03/2026
- [x] Bracket opacity `bg-white/[0.02]` → `bg-white/2` (register/student)
- [x] Bracket z-index eliminados: command-palette z-80, loading-overlay z-200, cookie-consent z-9998, debug-panel z-99999, ios-install-gate z-9998
- [x] 21x `text-[#09090B]` → `text-bg-dark` globalmente
- [x] 4x `text-[#050A12]` → `text-bg-dark`
- [x] `bg-[#050A12]` → `bg-bg-page` em (public)/layout, page.tsx, assessment/share, p/page
- [x] `bg-[#09090B]` → `bg-bg-dark` em ios-install-gate
- [x] `bg-[#111113]` → `bg-bg-dark-secondary` em install-banner, debug-panel
- [x] 6x `border-[#050A12]`/`border-[#09090B]` → `border-bg-dark` em auth pages
- [x] `h-[18px]`/`w-[18px]` → `h-4.5`/`w-4.5` globalmente
- [x] register/student: `p-[3px]`→`p-0.75`, `rounded-[12px]`→`rounded-lg`
- [x] workout-execution: `alt=""` → `alt={info.name_pt || info.name || 'Exercício'}`

## ✅ Sprint 14 — Final QA (v4.6.0)
**Deploy:** v4.6.0 · **Data:** 05/03/2026
### Audit Results (Zero Violations)
- [x] `bg-gradient-to-`: **0** ✅
- [x] `flex-shrink-0` / `flex-grow`: **0** ✅
- [x] Bracket opacity `bg-white/[`: **0** ✅
- [x] Bracket z-index `z-[`: **0** ✅
- [x] `h-[18px]` / `w-[18px]`: **0** ✅

### Residual Fixes Applied
- [x] `success-content.tsx` L36/L78: `font-bold` → `font-black tracking-tight` (2 page headers)
- [x] `students/assessment/new/page.tsx` L43: `text-xl font-bold` → `text-2xl font-black tracking-tight`
- [x] `students/edit/page.tsx` L155: `text-lg font-bold` → `text-2xl font-black tracking-tight`
- [x] `students/edit/page.tsx`: 4x `rounded-lg border` → `rounded-xl border` (inputs/textareas)
- [x] `students/import/page.tsx`: 4x `rounded-lg border` → `rounded-xl border` (table + inputs)
- [x] `students/invite/page.tsx`: 8x `rounded-lg border` → `rounded-xl border` (containers + inputs)

### Intentional Hardcoded Colors Verified
- 37x `bg-[#`: PWA green (#00D98E), landing gradients, Facebook blue — all intentional
- 9x `text-[#`: PWA green — intentional
- 5x `border-[#`: PWA green — intentional
- 4x `alt=""`: decorative icons — intentional

---

## 📊 Progresso Geral

| Sprint | Status | Versão | Arquivos |
|--------|--------|--------|----------|
| 1 | ✅ | v4.4.9 | 9 páginas públicas |
| 2 | ✅ | v4.5.0 | 5 legais |
| 3-5 | ✅ | v4.5.1 | 6 institutional+blog |
| 6 | ✅ | v4.5.2 | 1 pricing |
| 7 | ✅ | v4.5.3 | 3 auth |
| 8 | ✅ | v4.5.4 | 2 shell (header+sidebar) |
| 9 | ✅ | v4.5.5 | 5 student-facing |
| 10 | ✅ | v4.5.6 | 10 workout+assessment |
| 11 | ✅ | v4.5.7 | 8 financial |
| 12 | ✅ | v4.5.8 | 12 admin+remaining |
| 13 | ✅ | v4.5.9 | ~20 A11y+Tw4 cleanup |
| 14 | ✅ | v4.6.0 | 5 residual QA fixes |

**Progresso:** 14/14 sprints ✅ · ~66 arquivos polidos · 🎉 COMPLETO!
