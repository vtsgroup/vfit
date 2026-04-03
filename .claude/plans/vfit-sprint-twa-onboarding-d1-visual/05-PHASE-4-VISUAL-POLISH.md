# Phase 4: Dashboard Visual Polish — Dark Navy + DS Header

**Duração:** 1-1.5 horas  
**Bloqueadores:** Nenhum  
**Dependências:** Phases 1-3 (independente)

---

## Contexto

Dashboard já usa dark navy theme (`#050a12` → `#0b1120`) do showcase. Goal: garantir header + nav usam 100% Design System components (`<Button>`, `<DSIcon>`) — ZERO inline HTML buttons, ZERO lucide-react imports diretos.

---

## Design System Colors (Audit)

```
Dark Theme (Current):
  bg-primary: #050a12 (darkest)
  bg-secondary: #0b1221
  bg-tertiary: #111b2e
  text-primary: #f0f4f8 (branco-ish)
  text-secondary: #94a3b8 (cinza)
  brand-primary: #10b981 (emerald — verde brand)
  border-light: rgba(255,255,255,0.08)

Used in:
  Header: header.tsx (lines 139-309)
  Sidebar: sidebar.tsx
  Mobile nav: mobile-nav.tsx
```

---

## Audit: Header Components

**File:** `src/components/layout/header.tsx`

### Current State

| Component | Type | Fix? |
|-----------|------|------|
| Home icon (line 161) | `<DSIcon name="home">` | ✅ OK |
| Chevron right (line 166) | `<DSIcon name="chevronRight">` | ✅ OK |
| Search button (line 188-200) | Native `<button>` → icon + text | ⚠️ Check if needs `<Button>` wrapper |
| Logout button (line 262-268) | `<button>` with `ds3-action-btn` class | ⚠️ Should be `<Button>` variant |
| Hamburger (line 281-300) | Native `<button>` | ⚠️ Check if should use `<Button icon>` |
| Bell (line 225-240) | `<Link>` with `ds3-action-btn` | ✅ OK (nav link not button) |
| Mail (line 205-213) | `<Link>` with `ds3-action-btn` | ✅ OK |
| Message (line 215-223) | `<Link>` with `ds3-action-btn` | ✅ OK |
| User pill (line 245-259) | `<AvatarWithPlanBadge>` | ✅ OK |

### RULES Recap

From `.claude/docs/RULES.md`:
- **Rule 14:** `<Button>` OBRIGATÓRIO para CTAs (não buttons nativos)
- **Rule 16:** `<DSIcon>` OBRIGATÓRIO, nunca lucide-react direto
- **Rule 12/13:** Tailwind v4 sintaxe canônica (sem `bg-[#hex]`, sem `bg-[var(--)]`)

### Decision: Button Usage Policy

**CTA buttons** (que precisam `<Button>`):
- Logout (ação destrutiva)
- Form submits
- "Criar", "Salvar", "Enviar"

**NOT buttons** (mantêm como nav links):
- Bell, Mail, Message → são nav items, não CTAs
- Breadcrumb home → é nav, não CTA
- Search palette trigger → pode ser `<button ghost>` ou permanecer como button nativo (baixa criticidade)

**Recommendation:** Converter logout para `<Button variant="danger">` apenas.

---

## Phase 4 Tasks

### 4.1 — Audit + Document Current Button Usage

**Action:**
1. Grep para encontrar todos os `<button>` no layout
2. Classificar como CTA (precisa `<Button>`) ou nav (OK)
3. Documentar em comentário no arquivo

```bash
grep -n "<button" src/components/layout/header.tsx src/components/layout/sidebar.tsx src/components/layout/mobile-nav.tsx
```

---

### 4.2 — Convert Logout Button

**File:** `src/components/layout/header.tsx`

**Current** (line 262-268):
```typescript
<button
  onClick={logout}
  className="ds3-action-btn hidden lg:flex hover:text-error! hover:border-error/20!"
  title="Sair"
>
  <DSIcon name="logout" size={16} />
</button>
```

**Change to:**
```typescript
import { Button } from '@/components/ui/button'

// Later in JSX
<Button
  variant="ghost-danger"
  size="icon"
  onClick={logout}
  title="Sair"
  aria-label="Sair da conta"
  className="hidden lg:flex"
>
  <DSIcon name="logout" size={16} />
</Button>
```

**Why:** Logout é ação destrutiva (Rule 14), merece `<Button>` com `variant="danger"`.

---

### 4.3 — Verify All Tailwind v4 Syntax

**Audit:**
```bash
grep -rn "bg-\[#" src/components/layout/
grep -rn "bg-\[var(" src/components/layout/
grep -rn "bg-gradient-to" src/components/layout/
grep -rn "flex-shrink" src/components/layout/
```

**Expected:** Zero matches (ou muito poucos, já estão usando tokens).

**Fix any:**
- `bg-[#0E1525]` → `bg-primary`
- `bg-gradient-to-r` → `bg-linear-to-r` (v4 syntax)

---

### 4.4 — Verify DSIcon Usage

**Audit:**
```bash
grep -rn "import.*from.*lucide-react" src/components/layout/
```

**Expected:** Zero matches.

**Current state:** Header.tsx line 24 imports `DSIcon` (bom), não lucide direto.

---

### 4.5 — Dark Mode Contrast Check

**Audit:**
Using WCAG Color Contrast Analyzer or visual inspection:

```
Text contrast (dark mode):
  text-primary (#f0f4f8) vs bg-primary (#050a12) = 17.85:1 ✅ AAA
  text-secondary (#94a3b8) vs bg-primary (#050a12) = 7.74:1 ✅ AAA
  
Icon contrast:
  brand-primary (#10b981) vs bg-primary = 8.71:1 ✅ AAA
  border-light (rgba(255,255,255,0.08)) = low but decorative (OK)
```

**No changes needed** — já está WCAG AAA.

---

### 4.6 — Sidebar Audit

**File:** `src/components/layout/sidebar.tsx`

**Checklist:**
- [ ] All nav icons use `<DSIcon>`
- [ ] No inline style hex colors
- [ ] No lucide-react imports
- [ ] Buttons use `<Button>` or semantic `<button role="tab">` etc.

**Expected state:** Já está OK (construído com UI-UX-Pro-Max skill).

---

### 4.7 — Mobile Nav Audit

**File:** `src/components/layout/mobile-nav.tsx`

**Same checklist as sidebar.**

---

## Teste Local

```bash
# 1. Dev mode
npm run dev

# 2. Load http://localhost:3000/dashboard

# 3. Visual checks:
#    - Header: all icons visible, green brand color visible
#    - Sidebar: nav items aligned, icons crisp
#    - Mobile (375px width): hamburger works, icons visible
#    - Dark mode: all text readable (contrast check)

# 4. Type check
npm run type-check

# 5. Lint
npm run lint

# 6. Snapshot/screenshot for comparison
```

---

## Deploy Checklist

- [ ] Zero `<button>` CTAs without `<Button>` wrapper
- [ ] Zero `lucide-react` imports in layout files
- [ ] Zero inline hex colors (use tokens)
- [ ] Tailwind v4 syntax: no `bg-gradient-to-*`, use `bg-linear-to-*`
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] Dark mode contrast verified (WCAG AA minimum)

---

## Estimativa

| Task | Tempo |
|------|-------|
| 4.1-4.5 | 30 min |
| 4.6-4.7 | 15 min |
| Teste | 10 min |
| Deploy | 5 min |
| **Total** | **1 hour** |

---

## Notes

- Esta phase é independente — pode ser feita em paralelo com 1-3
- Não requer backend changes
- Não requer database changes
- Pure frontend refactor/polish
