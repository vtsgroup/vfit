# 🔍 Auditoria Completa — Dashboard → Design System Glass

> **Data**: 19/03/2026 · **Escopo**: 26 páginas do dashboard  
> **Objetivo**: Migrar 100% do dashboard para DS glass/moderno  
> **Versão DS**: v3 (GlassCard, Button 3D, MD3Input, StatsCard, SlidingTabs, Toggle, Modal, EmptyStateDS)

---

## 📊 Resumo Executivo

| Severidade | Qtd | Páginas |
|:----------:|:---:|---------|
| 🔴 **HIGH** | **6** | workouts/create, payments/create, marketplace, exercises, ai, students |
| 🟡 **MEDIUM** | **7** | dashboard, financeiro, affiliates, plans, complete-profile, students/invite, workouts |
| 🟢 **LOW** | **4** | settings, notifications, logs, messages |
| ✅ **OK** | **5** | layout, calendar, onboarding, students/view, payments/view, workouts/view |
| **Total páginas** | **22** | (excl. wrappers/loading/error) |

---

## 🏗️ Componentes DS Disponíveis vs Uso Atual

| Componente DS | Pronto | Usado no Dashboard | Oportunidades |
|---------------|:------:|:------------------:|:-------------:|
| `GlassCard` (6 variants) | ✅ | ❌ **0 páginas** | 🔴 15+ containers raw |
| `Button` (10 variants, 3D) | ✅ | 🟡 ~50% | 🔴 25+ raw `<button>` |
| `StatsCard` (DS v3) | ✅ | 🟡 2 páginas | 🔴 8+ KpiCard inline |
| `PageHeader` (icon+actions+back) | ✅ | ❌ **0 páginas** | 🔴 10 headers manuais |
| `Input` (Apple-style glow) | ✅ | ❌ **0 páginas** | 🔴 20+ raw `<input>` |
| `MD3Input` (floating label) | ✅ | ❌ **0 páginas** | 🟡 premium forms |
| `MD3SearchBar` (pill glass) | ✅ | ❌ **0 páginas** | 🔴 6+ raw search |
| `Toggle` (spring anim) | ✅ | ❌ **0 páginas** | 🔴 5+ raw toggles |
| `SlidingTabs` (3D slider) | ✅ | ❌ **0 páginas** | 🔴 8+ raw tabs |
| `Modal` (portal+trap) | ✅ | ❌ **0 páginas** | 🔴 3+ raw modals |
| `BottomSheet` (drag) | ✅ | ❌ usada fora do dash | 🟡 mobile modals |
| `EmptyStateDS` (icon+CTA) | ✅ | ❌ **0 páginas** | 🟡 empty lists |
| `MD3Card` (5 variants) | ✅ | 🟡 settings | 🟡 seções de formulários |
| `Badge` | ✅ | ✅ bom uso | ✅ OK |
| `Spinner`/`Skeleton` | ✅ | ✅ bom uso | ✅ OK |

---

## 📑 Auditoria Por Página — Detalhada

---

### 🔴 HIGH PRIORITY

---

#### 1. `workouts/create/page.tsx` — 1839 linhas

**O maior arquivo. Máximo impacto visual.**

| Problema | Qtd | Componente DS |
|----------|:---:|---------------|
| Raw `<input>` (séries, reps, carga, descanso, obs, AI goal) | 8+ | → `Input` ou `MD3Input` |
| Raw `<button>` (type selector, complexity, split, days, goals, tabs) | 10+ | → `Button` variant ghost/outline + `SlidingTabs` |
| Raw `<textarea>` (AI instructions) | 1 | → `MD3TextArea` |
| Container divs como cards (`rounded-xl border bg-bg-secondary`) | 5+ | → `GlassCard` variant glass/elevated |
| Modal raw com `fixed inset-0` (exercise picker, AI gen) | 2 | → `Modal` |
| Header manual | 1 | → `PageHeader` |
| Step indicators custom | 1 | ⚠️ Manter custom (stepper específico) |

**Ações:**
```
□ Header → PageHeader com back button
□ Step containers → GlassCard variant="glass"
□ Exercise selector raw buttons → SlidingTabs + FilterChips
□ 8+ inputs → Input (label+error+hint)
□ Type/complexity/split selectors → Button group (ghost variant)
□ 2 modais → Modal (portal + focus trap)
□ AI suggestion cards → GlassCard variant="tonal"
□ Template cards → GlassCard variant="elevated" interactive
□ Preview section → GlassCard variant="premium"
```

---

#### 2. `payments/create/page.tsx` — 696 linhas

**Flow crítico de receita.**

| Problema | Qtd | Componente DS |
|----------|:---:|---------------|
| Raw `<input>` (amount, date, PIX, link) | 6+ | → `Input` ou `MD3Input` |
| Raw `<button>` tabs (Asaas/manual) | 2 | → `SlidingTabs` |
| Raw `<button>` payment method selector | 3 | → `Button` group ou `SlidingTabs` |
| Raw toggle switches (Asaas, machine fee) | 2 | → `Toggle` |
| Raw `<textarea>` (description) | 1 | → `MD3TextArea` |
| Header manual | 1 | → `PageHeader` |
| Container divs como cards | 3+ | → `GlassCard` |
| Hardcoded rgba shadows em tabs | 2 | → Tokens CSS ou GlassCard shadow |

**Ações:**
```
□ Header → PageHeader com back
□ Tab switcher (Asaas/manual) → SlidingTabs
□ Payment method buttons → SlidingTabs ou Button group
□ 6+ inputs → Input (com currency mask p/ valor)
□ 2 toggle switches → Toggle
□ Form containers → GlassCard variant="glass"
□ Success card → GlassCard variant="tonal"
□ Remover rgba hardcoded das tabs
```

---

#### 3. `marketplace/page.tsx` — 282 linhas

**Vitrine pública, dark-only tokens.**

| Problema | Qtd | Componente DS |
|----------|:---:|---------------|
| PlanCard complexo raw | 6+ | → `GlassCard` variant="elevated" + children |
| Raw `<button>` category chips | 6 | → `FilterChip` ou `Button` variant ghost |
| Raw `<input>` search | 1 | → `MD3SearchBar` |
| Raw `<button>` order toggle | 1 | → `Button` variant outline |
| Raw `<button>` limpar filtros | 1 | → `Button` variant ghost |
| Raw pagination buttons | 2 | → `Button` variant outline |
| Header manual | 1 | → `PageHeader` |
| Dark-only tokens (`bg-bg-tertiary`, `text-text-muted`) | — | Já funciona (tokens semânticos) |

**Ações:**
```
□ Header → PageHeader com actions (search + filters)
□ PlanCards → GlassCard variant="elevated" interactive
□ Category chips → FilterChip ou Button ghost small
□ Search → MD3SearchBar
□ Pagination → Button variant="outline" size="sm"
□ Empty state → EmptyStateDS
```

---

#### 4. `exercises/page.tsx` — 680 linhas

**Visualmente rica, muscle map 3D.**

| Problema | Qtd | Componente DS |
|----------|:---:|---------------|
| Raw `<input>` search | 1 | → `MD3SearchBar` |
| Raw `<button>` difficulty pills | 3 | → `FilterChip` ou `SlidingTabs` |
| Raw `<button>` favorites toggle | 1 | → `Button` variant ghost icon |
| Exercise cards raw | 10+ | → `GlassCard` variant="glass" interactive |
| Detail modal raw (`fixed inset-0`) | 1 | → `Modal` ou `BottomSheet` |
| Header manual | 1 | → `PageHeader` |
| Muscle group cards com 3D (18 cores) | 18 | ⚠️ Manter custom — cores por região são semânticas |

**Ações:**
```
□ Header → PageHeader
□ Search → MD3SearchBar
□ Difficulty pills → SlidingTabs ou FilterChip
□ Exercise cards → GlassCard variant="glass" interactive
□ Detail modal → Modal (portal) ou BottomSheet (mobile)
□ Manter muscle group cards (custom 3D por região)
□ Empty state → EmptyStateDS
```

---

#### 5. `ai/page.tsx` — 663 linhas

**Chat interface, muitos raw elements.**

| Problema | Qtd | Componente DS |
|----------|:---:|---------------|
| Chat bubbles raw | ∞ | ⚠️ Manter custom (chat é específico) |
| Raw `<textarea>` input | 1 | → Custom glass input (chat-specific) |
| Suggestion chips raw (8 categorias) | 8 | → `FilterChip` ou custom glass chips |
| Raw `<button>` send | 1 | → `Button` variant primary icon |
| Header manual | 1 | → `PageHeader` |
| `white/X` opacity classes (20+) | 20+ | → Tokens semânticos ou `dark:/light:` |
| Colors raw por categoria | 8 | ⚠️ Manter — semântico por categoria |

**Ações:**
```
□ Header → PageHeader
□ Chat container → GlassCard variant="glass" como wrapper
□ Suggestion chips → GlassCard mini ou FilterChip
□ Send button → Button variant="primary" size="icon"
□ Corrigir white/X → dark:/light: pairs
□ Manter chat bubbles custom
□ Empty chat → EmptyStateDS
```

---

#### 6. `students/page.tsx` — 583 linhas

**Listagem principal de alunos.**

| Problema | Qtd | Componente DS |
|----------|:---:|---------------|
| Raw `<input>` search | 1 | → `MD3SearchBar` |
| Raw `<button>` tabs (active/invited) × 2 blocos duplicados | 4 | → `SlidingTabs` |
| Student cards raw | 10+ | → `GlassCard` variant="glass" interactive |
| Header manual | 1 | → `PageHeader` |
| Inline styles (`animationDelay`) | 2 | ⚠️ OK para stagger |
| rgba hardcoded box-shadows | 3 | → Token shadow |

**Ações:**
```
□ Header → PageHeader com action (Convidar Aluno)
□ Tabs duplicados → SlidingTabs (1 instância, não 2)
□ Search → MD3SearchBar
□ Student cards → GlassCard variant="glass" interactive
□ Invite CTA → Button variant="primary"
□ Empty state → EmptyStateDS
```

---

### 🟡 MEDIUM PRIORITY

---

#### 7. `dashboard/page.tsx` (main) — 209 linhas

| Problema | Componente DS |
|----------|---------------|
| Welcome card: raw div com `glass-premium` | → `GlassCard` variant="premium" |
| Header manual | → `PageHeader` |
| Já usa `StatsCard` ✅ | ✅ OK |
| Já usa componentes dashboard ✅ | ✅ OK |

---

#### 8. `financeiro/page.tsx` — 138 linhas

| Problema | Componente DS |
|----------|---------------|
| `KpiCard` inline (function local) | → `StatsCard` ou `GlassStatsCard` |
| `formatCurrency` redefinido local | → Importar de `@/lib/utils` |
| Header manual | → `PageHeader` |
| Listas (pendentes, top alunos) em raw div | → `GlassCard` variant="glass" |

---

#### 9. `affiliates/page.tsx` — 326 linhas

| Problema | Componente DS |
|----------|---------------|
| `StatCard` inline | → `StatsCard` do DS |
| `TierCard` inline | → `GlassCard` variant="tonal" |
| 2 raw inputs (valor, PIX) | → `Input` |
| Header manual | → `PageHeader` |
| Referral form container raw | → `GlassCard` variant="glass" |

---

#### 10. `plans/page.tsx` — 827 linhas

| Problema | Componente DS |
|----------|---------------|
| PlanCard complex raw (com ring/blur) | → `GlassCard` variant="premium" |
| Toggle switch raw (mensal/anual) | → `SlidingTabs` (2 items) |
| FAQ accordion raw | → Manter custom ou `Accordion` |
| Hero `bg-kpi-dark` hardcoded | → Token `bg-bg-primary` |
| rgba em dados JS | ⚠️ Aceitável — dados de config |
| Já usa `GlassCard` parcialmente ✅ | ✅ Expandir uso |

---

#### 11. `complete-profile/page.tsx` — 247 linhas

| Problema | Componente DS |
|----------|---------------|
| 2 raw inputs (phone, CREF) | → `Input` |
| 16 specialty chips raw | → `FilterChip` ou custom pill |
| Form container raw | → `GlassCard` variant="glass" |
| Step indicator manual | ⚠️ Manter custom |

---

#### 12. `students/invite/page.tsx` — 934 linhas

| Problema | Componente DS |
|----------|---------------|
| Containers raw (`rounded-xl border bg-bg-secondary`) | → `GlassCard` variant="glass" |
| Type selector (2 raw buttons) | → `SlidingTabs` |
| 1 raw textarea | → `MD3TextArea` |
| Já usa `Button` + `Input` ✅ | ✅ Bom |
| Success card raw | → `GlassCard` variant="tonal" |

---

#### 13. `workouts/page.tsx` (lista) — 530 linhas

| Problema | Componente DS |
|----------|---------------|
| Quick action cards (3×) raw com rgba shadows | → `ActionCard3D` ou `GlassCard` |
| Raw search input | → `MD3SearchBar` |
| Workout cards raw | → `GlassCard` variant="glass" interactive |
| Header manual | → `PageHeader` |
| `white/X` colors extensivas | → Tokens + `dark:/light:` |

---

### 🟢 LOW PRIORITY

---

#### 14. `settings/page.tsx` — 709 linhas

| Estado | Detalhe |
|--------|---------|
| ✅ Melhor adesão ao DS | Já usa `MD3Card` consistentemente |
| 🟡 Raw inputs (text, email, tel, password) | → `Input` ou `MD3Input` |
| 🟡 Theme toggles raw | → `SlidingTabs` (dark/light/system) |
| 🟡 Header manual | → `PageHeader` |

---

#### 15. `notifications/page.tsx` — 369 linhas

| Estado | Detalhe |
|--------|---------|
| ✅ Boa adesão DS v3 | Usa `Badge`, `Button`, `SlidingTabs`-like tabs |
| 🟡 Notification cards raw | → `GlassCard` ou manter (estilização DS v3 já) |
| 🟡 Header manual | → `PageHeader` |

---

#### 16. `logs/page.tsx` — 303 linhas

| Estado | Detalhe |
|--------|---------|
| ✅ Bom uso de Card/Button/Badge | Quase migrado |
| 🟡 2 raw inputs (search, filter) | → `MD3SearchBar` + `Input` |
| 🟡 Header manual | → `PageHeader` |

---

#### 17. `messages/page.tsx` — 118 linhas

| Estado | Detalhe |
|--------|---------|
| ✅ Delegação para componentes | ChatSidebar, ChatView, ChatEmpty são componentes |
| 🟡 Header com opacity manual | → `PageHeader` |

---

## 🎯 Plano de Migração — Sprints

### Sprint 1 — Quick Wins Globais (impacto em TODAS as páginas)

> **1 componente = 10 páginas corrigidas**

| # | Tarefa | Impacto | Esforço |
|:-:|--------|:-------:|:-------:|
| 1 | **PageHeader em todas as 10 páginas** — substituir header manual por `<PageHeader>` | 🔴 10 pgs | 🟢 Baixo |
| 2 | **Search inputs → MD3SearchBar** — students, workouts, exercises, marketplace, logs | 🔴 5 pgs | 🟢 Baixo |
| 3 | **Tabs duplicados → SlidingTabs** — students, payments/create, plans, workouts/create | 🔴 4 pgs | 🟡 Médio |
| 4 | **Toggle switches → Toggle** — payments/create, settings (tema) | 🟡 3 pgs | 🟢 Baixo |

### Sprint 2 — Glass Containers (impacto visual máximo)

| # | Tarefa | Impacto | Esforço |
|:-:|--------|:-------:|:-------:|
| 5 | **Containers → GlassCard** — form wrappers, list containers, info boxes | 🔴 15+ containers | 🟡 Médio |
| 6 | **KpiCard inline → StatsCard** — financeiro, affiliates, dashboard | 🟡 3 pgs | 🟢 Baixo |
| 7 | **Empty states → EmptyStateDS** — todas as listas vazias | 🟡 5+ pgs | 🟢 Baixo |

### Sprint 3 — Forms Premium

| # | Tarefa | Impacto | Esforço |
|:-:|--------|:-------:|:-------:|
| 8 | **Raw inputs → Input/MD3Input** — settings, payments/create, workouts/create, affiliates | 🔴 20+ inputs | 🟡 Médio |
| 9 | **Raw textareas → MD3TextArea** — ai, workouts/create, payments/create, students/invite | 🟡 4 textareas | 🟢 Baixo |

### Sprint 4 — Cards & Lists Glass

| # | Tarefa | Impacto | Esforço |
|:-:|--------|:-------:|:-------:|
| 10 | **Student cards → GlassCard interactive** — students | 🟡 1 pg | 🟡 Médio |
| 11 | **Workout cards → GlassCard interactive** — workouts | 🟡 1 pg | 🟡 Médio |
| 12 | **Exercise cards → GlassCard interactive** — exercises | 🟡 1 pg | 🟡 Médio |
| 13 | **Payment cards → GlassCard interactive** — payments | 🟡 1 pg | 🟡 Médio |
| 14 | **PlanCards → GlassCard premium** — marketplace, plans | 🟡 2 pgs | 🟡 Médio |

### Sprint 5 — Modals & Special

| # | Tarefa | Impacto | Esforço |
|:-:|--------|:-------:|:-------:|
| 15 | **Raw modals → Modal/BottomSheet** — workouts/create (2), exercises (1) | 🟡 2 pgs | 🟡 Médio |
| 16 | **AI chat polish** — chips, send button, container glass | 🟡 1 pg | 🔴 Alto |
| 17 | **Quick action cards → ActionCard3D** — workouts, dashboard | 🟡 2 pgs | 🟢 Baixo |

---

## 📐 Equivalência de Padrões — Antes → Depois

### Headers
```tsx
// ❌ ANTES — Raw header (repetido 10×)
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-xl font-bold text-text-primary">Alunos</h1>
    <p className="text-sm text-text-secondary">Gerencie seus alunos</p>
  </div>
  <Button onClick={...}>+ Novo Aluno</Button>
</div>

// ✅ DEPOIS
<PageHeader
  title="Alunos"
  subtitle="Gerencie seus alunos"
  icon="users"
  actions={<Button>+ Novo Aluno</Button>}
/>
```

### Containers/Cards
```tsx
// ❌ ANTES — Raw div card
<div className="rounded-xl border border-border-light bg-bg-secondary p-5">
  {children}
</div>

// ✅ DEPOIS — Glass card
<GlassCard variant="glass" padding="md">
  {children}
</GlassCard>

// ✅ DEPOIS — Glass com header
<GlassCard variant="elevated" padding="md">
  <GlassCardHeader title="Treinos" icon={<DSIcon name="dumbbell" />} />
  <GlassCardContent>{children}</GlassCardContent>
</GlassCard>
```

### Search Input
```tsx
// ❌ ANTES — Raw search
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
  <input placeholder="Buscar..." className="rounded-xl border ..." />
</div>

// ✅ DEPOIS
<MD3SearchBar
  placeholder="Buscar alunos..."
  value={search}
  onChange={setSearch}
  onClear={() => setSearch('')}
/>
```

### Tabs
```tsx
// ❌ ANTES — Raw buttons duplicados
<div className="flex gap-1 rounded-xl bg-bg-tertiary p-1">
  <button className={tab === 'active' ? 'bg-brand-primary ...' : 'text-text-muted ...'}>
    Ativos
  </button>
  <button className={tab === 'invited' ? 'bg-brand-primary ...' : 'text-text-muted ...'}>
    Convidados
  </button>
</div>

// ✅ DEPOIS
<SlidingTabs
  tabs={[
    { id: 'active', label: 'Ativos', count: activeCount },
    { id: 'invited', label: 'Convidados', count: invitedCount },
  ]}
  activeTab={tab}
  onChange={setTab}
/>
```

### Toggle Switch
```tsx
// ❌ ANTES — Raw toggle inline
<button className={`flex h-6 w-11 items-center rounded-full ${
  value ? 'bg-brand-primary' : 'bg-zinc-600'
}`}>
  <div className={`h-5 w-5 rounded-full ${value ? 'translate-x-5' : ''}`} />
</button>

// ✅ DEPOIS
<Toggle checked={value} onChange={setValue} label="Ativar Asaas" />
```

### KPI Cards
```tsx
// ❌ ANTES — KpiCard inline
function KpiCard({ label, value, icon }) {
  return <div className="rounded-xl border bg-bg-secondary p-4">...</div>
}

// ✅ DEPOIS
<StatsCard
  icon="dollarSign"
  title="Receita Total"
  value={formatCurrency(revenue)}
  accentColor="#10B981"
  badge={{ text: '+12%', color: 'green', icon: 'trendUp' }}
/>
```

### Modais
```tsx
// ❌ ANTES — Raw modal
<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
  <div className="rounded-xl bg-bg-secondary p-6 max-w-lg">
    <button onClick={close}>✕</button>
    {children}
  </div>
</div>

// ✅ DEPOIS
<Modal open={open} onClose={close} title="Selecionar Exercício" maxWidth="max-w-2xl">
  {children}
</Modal>
```

### Empty States
```tsx
// ❌ ANTES — Empty inline
<div className="text-center py-12">
  <p className="text-text-muted">Nenhum treino encontrado</p>
</div>

// ✅ DEPOIS
<EmptyStateDS
  icon="dumbbell"
  title="Nenhum treino"
  description="Crie seu primeiro treino para começar"
  actionLabel="Criar Treino"
  actionHref="/dashboard/workouts/create"
/>
```

---

## 📈 Impacto Estimado

| Métrica | Antes | Depois |
|---------|:-----:|:------:|
| Componentes DS usados | ~5 | ~15 |
| Raw `<div>` como cards | ~40 | ~5 (muscle groups, chat bubbles) |
| Raw `<button>` | ~35 | ~5 (chips semânticos) |
| Raw `<input>` | ~25 | 0 |
| Headers manuais | 10 | 0 |
| Glass morphism | 1 pg (plans) | 22 pgs |
| Consistência visual | ~40% | ~95% |

---

## ⚠️ Exceções (Manter Custom)

1. **Muscle group cards** (exercises) — 18 cores por região, 3D effect intencional
2. **Chat bubbles** (ai) — layout Claude-like é específico
3. **Step indicators** (workouts/create, complete-profile) — stepper customizado
4. **Calendar grid** (calendar) — componente externo dedicado
5. **Splash screen** — sempre dark, intencional
6. **Onboarding flow** — componente externo dedicado

---

## 🔧 Notas Técnicas

- **GlassCard** tem 6 variants: `default`, `glass`, `elevated`, `outlined`, `tonal`, `premium`
- **Button** 3D tem ripple effect + glass shine overlay por padrão
- **SlidingTabs** tem indicador animado com `ease-out-expo 300ms`
- **Toggle** tem spring animation + checkmark ✓ quando ativo
- **Modal** usa `createPortal` para escapar stacking contexts
- **MD3SearchBar** tem pill shape, clear button, 3 sizes
- **Input** tem Apple-style focus glow ring
- Todos os componentes têm suporte `dark:/light:` ✅
