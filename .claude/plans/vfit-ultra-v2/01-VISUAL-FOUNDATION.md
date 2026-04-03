# Sprint 0 — Visual Foundation

> **Fase:** 1 · **Prioridade:** 🔴 CRÍTICA · **Estimativa:** 4-6h
> **Objetivo:** Transformar o visual B2C de "verde genérico" para "navy premium"

---

## 🎯 Problema

O app B2C usa fundo verde em cards, quick actions, stats — criando visual "flat" e genérico.
O design target é **navy blue profundo** (#050A12 → #0B1221 → #111B2E) com **acentos verdes** apenas em CTAs, badges e indicadores.

### Antes vs Depois

```
ANTES (screenshots):
┌─────────────────────┐
│  ████ VERDE ████    │  ← Quick action cards (bg-emerald)
│  ████ VERDE ████    │  ← Stats cards (bg-green/emerald gradient)
│  ████ VERDE ████    │  ← KPI cards (bg-green)
└─────────────────────┘

DEPOIS (target):
┌─────────────────────┐
│  ▓▓▓▓ NAVY ▓▓▓▓    │  ← Quick actions (bg-surface-2 + border glass)
│  ▓▓▓▓ NAVY ▓▓▓▓    │  ← Stats (bg-surface-1 + icon verde)
│  ▓▓▓▓ NAVY ▓▓▓▓    │  ← KPIs (bg-surface-2 + text verde p/ valores)
└─────────────────────┘
```

**Verde permitido APENAS em:** Botões CTA, badges, ícones, indicadores, progress bars, texto de destaque.

---

## 📋 Tasks

### T0.1 — Auditar ocorrências de fundo verde
**Arquivo:** Buscar em `src/app/(app)/` e `src/components/student/`
```bash
grep -rn "bg-green\|bg-emerald\|from-green\|from-emerald\|to-green\|to-emerald" \
  src/app/\(app\)/ src/components/student/ --include="*.tsx" | grep -v "text-\|border-"
```
**Resultado esperado:** Lista de ~20-30 ocorrências para corrigir.
**Ação:** Documentar cada ocorrência com o substituto correto.

### T0.2 — Redefinir tokens de fundo B2C
**Arquivo:** `src/app/globals.css`
**Ação:** Verificar que tokens existentes são suficientes:
```css
/* Já existem — usar estes para cards B2C: */
--color-bg-surface-1: #0B1221;   /* Cards nível 1 */
--color-bg-surface-2: #111B2E;   /* Cards nível 2, inputs */
--color-bg-surface-3: #182640;   /* Áreas destacadas */
```
**Se necessário**, criar aliases semânticos:
```css
--color-student-card: var(--color-bg-surface-1);
--color-student-card-hover: var(--color-bg-surface-2);
--color-student-highlight: var(--color-bg-surface-3);
```

### T0.3 — Substituir fundos verdes de cards
**Arquivos alvo** (baseado nos screenshots):

| Componente | Arquivo | Mudança |
|------------|---------|---------|
| Quick action cards (Treinar/Avaliações/Pagamentos) | `src/components/student/student-hero-card.tsx` | `bg-emerald-*` → `bg-surface-2` + `border border-white/8` |
| Stats cards (Treinos/Streak/Conquistas/Avaliações) | `src/components/student/student-dashboard.tsx` | Gradiente verde → `bg-surface-1` + ícone verde |
| KPI mini cards (Streak/XP/Última avaliação/Pagamento) | Idem | `bg-emerald-*` → `bg-surface-2` |
| Empty state container (Nenhum treino) | Idem | `bg-green-*` → `bg-surface-1` |

**Padrão de card navy:**
```tsx
<div className="rounded-2xl bg-(--color-bg-surface-1) border border-white/8 p-4
  shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
  {/* Ícone verde como acento */}
  <DSIcon name="dumbbell" className="text-brand-primary" size={24} />
  {/* Texto claro */}
  <span className="text-text-primary font-semibold">...</span>
</div>
```

### T0.4 — Quick Action Cards → Navy Glass
**Arquivo:** `src/components/student/student-hero-card.tsx`
**De:**
```tsx
// Card com bg verde (como no screenshot)
<div className="rounded-2xl bg-emerald-900/80 p-6 ...">
```
**Para:**
```tsx
<div className="rounded-2xl bg-(--color-bg-surface-2) border border-white/8
  backdrop-blur-(--ds-backdrop) p-6 transition-all hover:border-white/12">
  <div className="flex h-12 w-12 items-center justify-center rounded-xl
    bg-brand-primary/15">
    <DSIcon name="play" className="text-brand-primary" size={24} />
  </div>
  <span className="mt-3 text-sm font-medium text-text-primary">Treinar agora</span>
</div>
```

### T0.5 — Stats Cards → Navy com ícone verde
**Arquivo:** `src/components/student/student-dashboard.tsx`
**Padrão:**
```tsx
<div className="rounded-2xl bg-(--color-bg-surface-1) border border-white/6 p-4">
  <div className="flex items-center justify-between">
    <div>
      <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
        TREINOS CONCLUÍDOS
      </span>
      <p className="mt-1 text-2xl font-bold text-text-primary">0</p>
      <p className="text-xs text-text-secondary">0 treinos atribuídos</p>
    </div>
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
      <DSIcon name="dumbbell" className="text-brand-primary" size={20} />
    </div>
  </div>
</div>
```

### T0.6 — Empty States → Navy premium
**Padrão para empty states no app B2C:**
```tsx
<div className="flex flex-col items-center py-16 text-center">
  <div className="flex h-16 w-16 items-center justify-center rounded-2xl
    bg-brand-primary/10 mb-4">
    <DSIcon name="dumbbell" className="text-brand-primary/60" size={32} />
  </div>
  <h3 className="text-lg font-semibold text-text-primary">Nenhum treino ainda</h3>
  <p className="mt-2 max-w-xs text-sm text-text-secondary">
    Seu personal irá criar treinos para você em breve.
  </p>
</div>
```
**Eliminar:** SVG illustrations com glow verde excessivo.

### T0.7 — Documentar no DESIGN-SYSTEM.md
**Adicionar seção "B2C App Visual Rules":**
- Cards: `bg-surface-1` / `bg-surface-2` + `border-white/8`
- Verde: APENAS em ícones, badges, botões CTA, progress bars
- Empty states: Ícone em `bg-brand-primary/10`, sem SVG illustration pesado
- Gradientes: Proibidos como fundo de card. Apenas em botões contextuais.

---

## ✅ Critérios de Aceite

- [ ] Zero `bg-green-*` ou `bg-emerald-*` como fundo de card no app B2C
- [ ] Todos os cards usam tokens `bg-surface-*` com borda glass
- [ ] Verde presente apenas como acento (ícones, badges, CTAs)
- [ ] Visual consistente entre todas as páginas do `(app)` route group
- [ ] TypeScript check: 0 erros
- [ ] Screenshots antes/depois documentados

---

## 📁 Arquivos Impactados

```
src/components/student/student-hero-card.tsx
src/components/student/student-dashboard.tsx
src/app/(app)/treinos/page.tsx
src/app/(app)/avaliacoes/page.tsx
src/app/(app)/nutricao/page.tsx
src/app/(app)/ia/page.tsx
src/app/(app)/perfil/page.tsx
src/app/(app)/plano/page.tsx
src/app/globals.css (se novos tokens)
docs/DESIGN-SYSTEM.md
```
