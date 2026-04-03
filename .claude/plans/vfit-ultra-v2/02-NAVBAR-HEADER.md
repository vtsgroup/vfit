# Sprint 1 — Navbar & Header Premium

> **Fase:** 1 · **Prioridade:** 🔴 CRÍTICA · **Estimativa:** 6-8h
> **Objetivo:** Header fixo top + Bottom nav premium com ícones SVG e ícone IA

---

## 🎯 Problema

1. **Sem header no app B2C** — não tem título da página, avatar, notificações no topo
2. **Bottom nav simplória** — ícones genéricos DSIcon vs SVGs custom premium do personal
3. **Ícone IA genérico** — usa `sparkles` do lucide, precisa de ícone premium identificável
4. **Sem FAB** — personal tem FAB central verde com "+", student não tem equivalent

---

## 📋 Tasks

### T1.1 — Criar `StudentHeader` (sticky top)
**Arquivo:** `src/components/layout/student-header.tsx` (NOVO)

**Design:**
```
┌──────────────────────────────────────────┐
│  ← (back)  │  Treinos          🔔  👤   │
│             │  page title       bell pfp │
└──────────────────────────────────────────┘
```

**Specs:**
- `position: sticky; top: 0; z-index: 30`
- Background: `bg-primary/80 backdrop-blur-(--ds-backdrop)`
- Height: `h-14` (56px)
- Safe area: `pt-[env(safe-area-inset-top)]`
- Left: Back button (se não é tab root) com `aria-label="Voltar"`
- Center: Título da página (dinâmico baseado na rota)
- Right: Bell icon com badge count + Avatar mini (link para /perfil)
- Progressive shadow on scroll (como o header B2B)
- **Touch target mínimo:** 44×44px em todos os botões

**Mapa de títulos por rota:**
```typescript
const ROUTE_TITLES: Record<string, string> = {
  '/treinos': 'Treinos',
  '/nutricao': 'Nutrição',
  '/ia': 'IA & Dicas',
  '/avaliacoes': 'Avaliações',
  '/perfil': 'Perfil',
  '/plano': 'Meu Plano',
  '/treino-ativo': 'Treino Ativo',
  '/exercicios': 'Exercícios',
  '/progresso': 'Progresso',
  '/social': 'Comunidade',
}
```

**Back button:** Mostrar apenas em sub-rotas (ex: `/avaliacoes/nova`, `/perfil/editar`).
Nas 5 tabs root, NÃO mostrar back.

### T1.2 — Redesign `BottomNavigation` com SVGs premium
**Arquivo:** `src/components/layout/bottom-navigation.tsx`

**Estado atual:** Usa `DSIcon` com nomes genéricos.
**Target:** SVGs custom inline com dual-state (outline quando inativo, filled quando ativo).

**5 tabs finais:**

| Tab | Ícone Outline | Ícone Filled | Rota |
|-----|---------------|-------------|------|
| Treinos | Dumbbell outline | Dumbbell filled | `/treinos` |
| Nutrição | Apple/Heart outline | Apple/Heart filled | `/nutricao` |
| **IA** | **Brain/Sparkle custom** | **Brain/Sparkle filled** | `/ia` |
| Avaliações | Clipboard outline | Clipboard filled | `/avaliacoes` |
| Perfil | Person outline | Person filled | `/perfil` |

**Design da barra:**
```tsx
// Background: glass blur premium (como personal nav)
<nav className="fixed bottom-0 left-0 right-0 z-40
  bg-(--color-bg-primary)/90 backdrop-blur-xl
  border-t border-white/8
  pb-[env(safe-area-inset-bottom)]">
  <div className="flex h-16 items-center justify-around px-2">
    {tabs.map(tab => (
      <Link key={tab.href} href={tab.href}
        className="flex flex-col items-center gap-0.5 min-w-16 min-h-11">
        {/* Indicator line on top when active */}
        <div className={cn(
          "h-0.5 w-5 rounded-full transition-all",
          isActive ? "bg-brand-primary" : "bg-transparent"
        )} />
        {/* Icon: SVG inline, outline/filled based on active */}
        <div className={cn(
          "transition-transform",
          isActive && "scale-110"
        )}>
          {isActive ? tab.iconFilled : tab.iconOutline}
        </div>
        {/* Label */}
        <span className={cn(
          "text-[10px] font-medium transition-colors",
          isActive ? "text-brand-primary" : "text-text-muted"
        )}>
          {tab.label}
        </span>
      </Link>
    ))}
  </div>
</nav>
```

### T1.3 — Criar ícone IA premium
**Opções de design (escolher 1):**

**Opção A — Brain + Sparkle (recomendado):**
```svg
<!-- Cérebro estilizado com sparkles -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
  <!-- Brain shape simplificado -->
  <path d="M12 2C8 2 5 5 5 8c0 2 1 3.5 2.5 4.5L12 22l4.5-9.5C18 11.5 19 10 19 8c0-3-3-6-7-6z"/>
  <!-- Sparkle dots -->
  <circle cx="9" cy="7" r="0.5" fill="currentColor"/>
  <circle cx="15" cy="7" r="0.5" fill="currentColor"/>
  <circle cx="12" cy="10" r="0.5" fill="currentColor"/>
</svg>
```

**Opção B — Sparkles premium (4-pointed stars):**
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
  <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
  <path d="M5 16l1 2.5L8.5 20l-2.5 1L5 23.5 4 21l-2.5-1L4 18.5 5 16z" opacity="0.6"/>
  <path d="M19 14l.75 2 2 .75-2 .75L19 19.5l-.75-2-2-.75 2-.75L19 14z" opacity="0.4"/>
</svg>
```

**Implementação:** Criar componente `NavIcon` com prop `active` que alterna outline/filled.
Registrar no `DSIcon` como `name="ai-brain"` ou usar inline no BottomNav.

### T1.4 — Considerar quick-action em tab IA
**Em vez de FAB (que o personal tem como "+"):**
O tab IA já serve como hub de ações. Não precisa de FAB.
Porém, considerar **long-press** no tab IA para ação rápida "Gerar Treino".

### T1.5 — Safe-area insets no header
**Arquivo:** `src/components/layout/student-header.tsx`
```css
/* Aplicar no header */
padding-top: env(safe-area-inset-top);

/* Já aplicado no bottom nav (verificar) */
padding-bottom: env(safe-area-inset-bottom);
```

### T1.6 — Integrar no layout `(app)`
**Arquivo:** `src/app/(app)/layout.tsx`
```tsx
// ANTES:
<BottomNavigation />
{children}

// DEPOIS:
<StudentHeader />
<main className="pt-14 pb-20"> {/* header height + bottom nav height */}
  {children}
</main>
<BottomNavigation />
```

### T1.7 — Admin→Student view
**Arquivo:** `src/hooks/use-effective-user-view.ts`
Quando `isStudentView === true`, o dashboard deve:
1. Redirecionar para `/treinos` (tab root do B2C) em vez de `/dashboard`
2. Usar layout `(app)` com StudentHeader + BottomNavigation
3. Mostrar experiência B2C completa

---

## ✅ Critérios de Aceite

- [ ] Header sticky no topo com título, back, bell, avatar
- [ ] Bottom nav com SVGs dual-state (outline/filled)
- [ ] Ícone IA premium e identificável (não genérico)
- [ ] Touch targets ≥44×44px em todos os elementos interativos
- [ ] Safe-area insets funcionando em iOS e Android
- [ ] Admin→Student mostra app B2C completo
- [ ] TypeScript check: 0 erros

---

## 📁 Arquivos Impactados

```
src/components/layout/student-header.tsx (NOVO)
src/components/layout/bottom-navigation.tsx (REWRITE)
src/app/(app)/layout.tsx
src/hooks/use-effective-user-view.ts
src/components/layout/nav-icons.tsx (NOVO — SVGs premium)
```
