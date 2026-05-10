# Design System — VFIT

> Paleta web (Next.js), contrastes WCAG, componentes UI, tokens CSS.
> Para design system mobile (React Native), ver `.claude/vfit-design-system.md`.

## Atualização — 100% Polish & Premium Variants (13/04/2026) ✨

- **Button Sizes:** Aumentadas para melhor touch target — `sm: h-11`, `md: h-13`, `lg: h-16` (moderna "pílula" com `rounded-xl/2xl`)
- **Variantes Premium:** `gradient` (multi-color glow para CTAs principais) e `glass` (glassmorphism para overlays)
- **Landing Page:** Botões principais agora `size="lg" variant="gradient"` com glow de emerald
- **Spacing Tokens:** Padronizados em globals.css — `--card-padding: 1.5rem`, `--section-gap: 6rem`, `--card-gap: 1rem`
- **Landing Sections:** p-padding aumentado de `p-4/p-5` para `p-6/p-8` (respira visualmente melhor)
- **Button Gap:** Aumentado de `gap-2` para `gap-3/gap-4` (melhor alinhamento visual em mobile/desktop)

## Atualização — Hotfix visual (08/04/2026)

- Destaques principais revertidos para **VFIT Green** (brand primary)
- `Button` variante `primary` voltou para gradiente/hover em emerald
- Tokens globais de marca e glow retornaram para paleta verde em `globals.css`
- Build e regressão Playwright não-Chrome validados após o ajuste

## Atualização — Botões Secondary + Radius (25/04/2026)

- `Button.secondary` migrou para **Slate Blue-Gray 3D** (cinza escuro/azulado com contraste forte e visual mais sóbrio).
- Radius canônico reduzido para evitar pílulas excessivamente arredondadas.
- Sistema 3D padronizado com linha superior fina + base inferior com contraste forte.
- Botões de ação no card "Personal Trainer" (Treinos) atualizados para `variant="secondary"`.

## Atualização — Botão Primary Verde 3D Premium (10/05/2026)

- `Button.primary` usa gradiente emerald premium `emerald-300 → emerald-500 → green-700`.
- A borda do CTA principal é uma linha fina de verde escuro (`emerald-900/70`), alinhada ao detalhe 3D.
- Profundidade 3D do botão principal agora é exclusivamente verde escuro (`#064e3b`), sem cinza no shadow/base.
- `Button.gradient` foi alinhado ao mesmo padrão: borda verde escura, profundidade verde escura e glow controlado.

## Atualização — Botão Secondary Navy Blue-Gray (10/05/2026)

- `Button.secondary` usa gradiente navy blue-gray `slate-500 → slate-600 → slate-800` com texto branco.
- A profundidade 3D é `#0f172a`, mantendo a aparência sóbria sem competir com o verde do CTA principal.
- Hover adiciona brilho sky controlado e mantém contraste forte em light/dark.

---

## Cores & Contraste (Web — Tema Atual)

### Fundos do Tema

| Token | Light | Dark |
|-------|-------|------|
| `bg-primary` | `#ffffff` | `#050A12` |
| `bg-secondary` | `#F8FAFB` | `#0B1221` |
| `bg-tertiary` | `#F1F4F6` | `#111B2E` |

### Texto Seguro (mín WCAG AA 4.5:1)

| Texto | vs Light bg | vs Dark bg |
|-------|:-----------:|:----------:|
| `text-primary` (#0F172A / #F0F4F8) | **17.85:1** AAA | **17.95:1** AAA |
| `text-secondary` (#475569 / #94A3B8) | **7.58:1** AAA | **7.74:1** AAA |
| `text-muted` (#94A3B8 / #64748B) | **2.56:1** ❌ | **4.17:1** ⚠️ |

> ⚠️ `text-muted` em light mode (2.56:1) — APENAS para placeholders/captions decorativos, NUNCA para texto informativo.

### Botões — Escala Slate Blue-Gray (Canônico)

| Variant | Light (bg → text) | Dark (bg → text) |
|---------|-------------------|-------------------|
| **secondary** | `slate-500→600→800` → `white` · navy 3D alto contraste | `slate-500→600→800` → `white` · navy 3D alto contraste |
| **outline** | `zinc-200` (#e4e4e7) → `zinc-600` · 13.62:1 AAA | `zinc-500` (#71717a) → `zinc-100` · 4.37:1 AA-lg |

> `secondary` agora é canônico em **slate blue-gray** para manter contraste perfeito e evitar saturação excessiva.

### ❌ NUNCA em Light Mode (contraste < 3:1 vs branco)

- `text-brand-primary` (#22C55E) como texto → use `green-700` (#15803d, 4.67:1)
- `text-success` (#10B981) como texto → use `emerald-700` (#047857, 5.47:1)
- `text-warning` (#F59E0B) como texto → use `amber-700` (#B45309, 4.86:1)
- `text-whatsapp` (#25D366) como texto → use `green-700` (#15803d, 4.67:1)

> **Regra**: Cores vibrantes em light mode → usar como **superfície com texto escuro**, nunca como texto sobre branco.

### ✅ Seguro em Dark Mode (todas ≥ 4.5:1 vs #050A12)

- `brand-primary` 8.71:1 · `success` 7.82:1 · `warning` 9.24:1 · `error` 5.27:1 · `info` 5.39:1 · `ai` 4.68:1 · `whatsapp` 10.0:1

### Shadow 3D — Fórmula

```
Light: superfície → shadow 2 tons mais escuro (zinc-300 → shadow zinc-400 #a1a1aa)
Dark:  superfície → shadow zinc-800 (#27272a) — funciona universal
```

---

## Componente `<Button>` — Design System

**Arquivo:** `@/components/ui/button`

### Variantes

| Variant | Uso |
|---------|-----|
| `primary` (default) | CTA principal — verde com depth 3D |
| `secondary` | Ação secundária destacada — slate blue-gray 3D |
| `outline` | Ação terciária — borda com hover |
| `ghost` | Ação sutil — sem borda, hover leve |
| `ghost-danger` | Ação destrutiva sutil |
| `danger` | Ação destrutiva enfática |
| `workout` | Específico de treinos |
| `assessment` | Específico de avaliações |
| `payment` | Específico de pagamentos |

### Tamanhos

| Size | Height |
|------|--------|
| `sm` | h-10 |
| `md` (default) | h-12 |
| `lg` | h-14 |
| `icon` | h-11 w-11 |

### Radius Canônico (OBRIGATÓRIO)

- `sm` e `icon`: `rounded-[11px]`
- `md`, `lg`, `icon-lg`: `rounded-[13px]`
- Evitar `rounded-full`/`rounded-2xl` em botões de texto (somente casos especiais: chips/toggles)

### 3D Canônico (OBRIGATÓRIO)

- Linha superior fina: `border-t-*` com opacidade maior
- Laterais suaves: `border-x-*`
- Base inferior contrastada: `border-b-*` + `shadow` com offset vertical
- Press state sempre reduz profundidade (`active:translate-y` + shadow curta)

### Props

- `loading` — Spinner + disabled automático
- `ripple` — Efeito ripple (default true)

---

## Ícones — DSIcon (OBRIGATÓRIO)

```typescript
// ❌ import { Bell } from 'lucide-react'
// ✅ import { DSIcon } from '@/components/ui/ds-icon'
//    <DSIcon name="bell" size={20} />
```

Componente wrapper que centraliza todos os ícones. Nunca importar lucide/heroicons diretamente.

---

## CSS Tokens (globals.css)

### Cores semânticas

```css
--ds-brand-primary: var(--color-green-500);
--ds-text-primary: ...;
--ds-text-secondary: ...;
--ds-text-muted: ...;
--ds-bg-primary: ...;
--ds-bg-secondary: ...;
--ds-bg-tertiary: ...;
```

### Aliases do tema

| Alias | Uso | Exemplo |
|-------|-----|---------|
| `bg-kpi-dark` | Background KPI cards (dark) | `bg-kpi-dark/80` |
| `shadow-glass` | Shadow glassmorphism | `shadow-glass` |

### Regras de CSS

- CSS vars `--ds-*` e classes Tailwind semânticas (`brand-primary`, `text-primary`)
- **Nunca** hardcode cores hex no JSX
- Usar aliases do tema (`bg-kpi-dark`) em vez de brackets (`bg-[#0E1525]`)

---

## Acessibilidade (WCAG 2.1 AA)

- Contraste ≥4.5:1 para texto normal, ≥3:1 para texto grande
- Focus states visíveis (2–4px ring)
- Cor + ícone para significado semântico (erro = vermelho + X)
- Botões: min 44×44px touch target
- `prefers-reduced-motion: reduce` respeitado

---

## Doc Detalhado

Para paleta completa, contrastes exaustivos e regras de manutenção:
→ Ver seção "Cores & Contraste" abaixo (merged)

Para design system v3 spec:
→ `.claude/docs/design-system/vfit-design-system-v3-docs.md`
# 🎨 Design System — Cores & Contraste (Data-Driven)

> **v3.0** · Atualizado em 18/03/2026 · Auditado via WCAG 2.1 contrast ratio
> **Fonte**: `src/app/globals.css` + `src/components/ui/button.tsx` + `src/components/ui/avatar-plan-badge.tsx`
> **Referência rápida** para criar combinações perfeitas e manter consistência visual.

---

## 📐 Padrões WCAG 2.1

| Nível | Ratio mínimo | Uso |
|-------|:------------:|-----|
| **AAA** ✅ | ≥ 7.0:1 | Texto body · máxima legibilidade |
| **AA** ✅ | ≥ 4.5:1 | Texto normal · mínimo aceitável |
| **AA-lg** ⚠️ | ≥ 3.0:1 | Texto ≥18px bold ou ≥24px · ícones · bordas UI |
| **FAIL** ❌ | < 3.0:1 | Não usar para texto · apenas decoração |

> **Regra do projeto**: Texto body → mínimo AA (4.5:1). Títulos grandes/ícones → mínimo AA-lg (3.0:1). Botões com bg colorido → texto no botão mínimo AA (4.5:1).

---

## 🌙 Paleta Completa

### Backgrounds

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `bg-primary` | `#ffffff` | `#050A12` | Fundo principal da página |
| `bg-secondary` | `#F8FAFB` | `#0B1221` | Cards, seções alternadas |
| `bg-tertiary` | `#F1F4F6` | `#111B2E` | Inputs, áreas recuadas |
| `bg-page` | `#F5F7FA` | `#050A12` | Área de conteúdo (alias) |
| `bg-elevated` | — | `#080E1A` | Camada elevada (modais, popovers) |
| `bg-surface-1` | — | `#0B1221` | Superfície nível 1 |
| `bg-surface-2` | — | `#111B2E` | Superfície nível 2 |
| `bg-surface-3` | — | `#182640` | Superfície nível 3 (mais clara) |
| `kpi-dark` | `#F8FAFC` | `#0E1525` | Cards KPI hero |

### Textos

| Token | Light | Dark | vs bg-primary Light | vs bg-primary Dark |
|-------|-------|------|:-------------------:|:------------------:|
| `text-primary` | `#0F172A` | `#F0F4F8` | **17.85:1** AAA ✅ | **17.95:1** AAA ✅ |
| `text-secondary` | `#475569` | `#94A3B8` | **7.58:1** AAA ✅ | **7.74:1** AAA ✅ |
| `text-muted` | `#94A3B8` | `#64748B` | **2.56:1** FAIL ❌ | **4.17:1** AA-lg ⚠️ |

> ⚠️ **`text-muted` em light mode** tem apenas 2.56:1 — usar **apenas** para texto decorativo, placeholders, captions ≥14px. NUNCA para texto informativo crítico.

### Brand

| Token | Hex | vs Dark bg | vs Light bg | Uso |
|-------|-----|:----------:|:-----------:|-----|
| `brand-primary` | `#22C55E` | **8.71:1** AAA ✅ | **2.28:1** FAIL ❌ | Botão CTA, ícones, badges |
| `brand-primary-hover` | `#4ADE80` | — | — | Hover do brand-primary |
| `brand-accent` | `#84CC16` | **10.07:1** AAA ✅ | — | Destaque secundário |
| `brand-mint` | `#86EFAC` | **14.17:1** AAA ✅ | — | Gradientes, glow |
| `brand-deep` | `#166534` | — | — | Shadow 3D do primary |
| `brand-glow` | `rgba(34,197,94,0.30)` | — | — | Glow effects |

> ⚠️ **`brand-primary` em light mode** tem apenas 2.28:1 vs branco — funciona como **cor de superfície** (botão) mas **NÃO** como texto sobre fundo branco. Para texto verde em light mode, use `brand-deep` (#166534, 8.04:1 vs branco).

### Status

| Token | Hex | on Dark bg | on Light bg | Texto branco sobre | Nota |
|-------|-----|:----------:|:-----------:|:------------------:|------|
| `success` | `#10B981` | **7.82:1** AAA ✅ | **2.54:1** FAIL ❌ | **2.54:1** FAIL ❌ | ⚠️ Light: usar como bg com texto escuro |
| `warning` | `#F59E0B` | **9.24:1** AAA ✅ | **2.15:1** FAIL ❌ | **2.15:1** FAIL ❌ | ⚠️ Light: usar como bg com texto escuro |
| `error` | `#EF4444` | **5.27:1** AA ✅ | **3.76:1** AA-lg ⚠️ | **3.76:1** AA-lg ⚠️ | Texto branco OK apenas ≥18px bold |
| `info` | `#3B82F6` | **5.39:1** AA ✅ | **3.68:1** AA-lg ⚠️ | **3.68:1** AA-lg ⚠️ | Similar ao error |
| `ai` | `#8B5CF6` | **4.68:1** AA ✅ | **4.23:1** AA-lg ⚠️ | **4.23:1** AA-lg ⚠️ | Borderline — preferir texto escuro |
| `whatsapp` | `#25D366` | **10.0:1** AAA ✅ | **1.98:1** FAIL ❌ | **1.98:1** FAIL ❌ | Light: sempre texto escuro |

> **Regra**: Cores de status como `success`, `warning`, `whatsapp` **em light mode** devem ser usadas como **background com texto escuro** (#0F172A), nunca como texto sobre branco.

### Sidebar

| Combo | Ratio | Grade |
|-------|:-----:|:-----:|
| Texto branco ON sidebar-bg (dark `#102A20`) | **15.28:1** | AAA ✅ |
| Brand dot ON sidebar-bg (dark) | **6.71:1** | AA ✅ |
| Texto ativo ON sidebar-active (dark `#1A3B2E`) | **11.12:1** | AAA ✅ |
| Texto ON sidebar-bg (light `#ffffff`) | **7.58:1** | AAA ✅ |
| Texto ativo ON sidebar-active (light `#F0FDF4`) | **17.05:1** | AAA ✅ |

---

## 🔘 Botões — Análise Completa

### Hierarquia Visual (por importância)

| # | Variant | Light bg | Dark bg | Propósito |
|---|---------|----------|---------|-----------|
| 1 | `primary` | `#22C55E` (brand) | `#22C55E` | CTA principal — ação primária |
| 2 | `secondary` | `#475569 → #1e293b` (slate navy) | `#475569 → #1e293b` (slate navy) | Ação secundária forte |
| 3 | `outline` | `#e4e4e7` (zinc-200) | `#71717a` (zinc-500) | Ação terciária / cancelar |
| 4 | `ghost` | transparent | transparent | Ação contextual mínima |
| 5 | `danger` | `#EF4444` | `#EF4444` | Ação destrutiva |
| 6 | `workout` | emerald gradient | emerald gradient | Contextual — treinos |
| 7 | `assessment` | violet gradient | violet gradient | Contextual — avaliações |
| 8 | `payment` | amber gradient | amber gradient | Contextual — pagamentos |

### Por que Zinc? (Pesquisa de Design Systems)

**Análise de subtom RGB** das escalas de cinza Tailwind:
| Scale | 300 subtom | 600 subtom | Compatibilidade com verde |
|-------|:----------:|:----------:|:-------------------------:|
| **slate** | AZUL (+11) | AZUL (+18) | ❌ Compete com brand verde |
| **gray** | AZUL (+5) | AZUL (+13) | ⚠️ Leve competição |
| **zinc** | NEUTRO (+4) | AZUL (+6) | ✅ Mínima interferência |
| **neutral** | NEUTRO (0) | NEUTRO (0) | ✅ Ultra-neutro, mas "flat" |
| **stone** | NEUTRO → QUENTE | VERMELHO (+6) | ❌ Tom quente ≠ tech/fitness |

**Referências reais:**
- **Apple HIG**: System Gray usa subtom azul mínimo (+3 RGB) — `zinc` é o match mais próximo
- **Material Design 3**: Usa "surface container" levemente tinted pela cor primária — para marca verde, neutro funciona melhor
- **Conclusão**: `zinc` → equilíbrio perfeito entre neutralidade (não compete com verde) e personalidade (não parece "flat")

**Para ambos os modos**: Mesma escala (zinc), tons diferentes:
- Light mode: `zinc-300` (#d4d4d8) / `zinc-200` (#e4e4e7)
- Dark mode: `zinc-600` (#52525b) / `zinc-500` (#71717a)
- Shadow 3D: `zinc-400` (#a1a1aa) light / `zinc-800` (#27272a) dark

### Contraste Detalhado

| Variant | Mode | Btn bg | vs Page bg | Text vs Btn | Text Grade | 3D Shadow depth |
|---------|------|--------|:----------:|:-----------:|:----------:|:---------------:|
| **primary** | light | `#22C55E` | 2.28:1 | **8.73:1** | AAA ✅ | 3.13:1 |
| | dark | `#22C55E` | 8.71:1 | **8.73:1** | AAA ✅ | 3.13:1 |
| **secondary** | light | `#475569→#1e293b` | ≥7.58:1 | **≥7.58:1** | AAA ✅ | forte |
| | dark | `#475569→#1e293b` | ≥2.62:1 | **≥7.58:1** | AAA ✅ | forte |
| **outline** | light | `#e4e4e7` (zinc-200) | 1.23:1 | **13.62:1** | AAA ✅ | 1.52:1 |
| | dark | `#71717a` (zinc-500) | 4.10:1 | **4.37:1** | AA-lg ⚠️ | 1.60:1 |
| **danger** | light | `#EF4444` | 3.76:1 | **3.76:1** | AA-lg ⚠️ | 2.21:1 |
| | dark | `#EF4444` | 5.27:1 | **3.76:1** | AA-lg ⚠️ | 2.21:1 |
| **workout** | light | `#34d399` | 1.92:1 | 1.92:1 | FAIL ❌ | 4.0:1 |
| | dark | `#34d399` | 10.32:1 | 1.92:1 | FAIL ❌ | 4.0:1 |
| **assessment** | light | `#a78bfa` | 2.72:1 | 2.72:1 | FAIL ❌ | 4.03:1 |
| | dark | `#a78bfa` | 7.29:1 | 2.72:1 | FAIL ❌ | 4.03:1 |
| **payment** | light | `#fbbf24` | 1.67:1 | 1.67:1 | FAIL ❌ | 4.25:1 |
| | dark | `#fbbf24` | 11.88:1 | 1.67:1 | FAIL ❌ | 4.25:1 |

> **Nota**: `workout`, `assessment`, `payment` usam texto branco sobre cores vibrantes — o contraste texto/bg é baixo (design choice para impacto visual). Compensado pelo tamanho grande (font-bold, ≥14px) e alta saturação da cor. Para texto small nesses botões, usar texto escuro.

### Shadow 3D — Cores de Profundidade

| Variant | Shadow color | vs Btn bg | Efeito |
|---------|-------------|:---------:|--------|
| primary | `#166534` | 3.13:1 | Forte — profundidade clara |
| secondary (light) | `#94a3b8` | 1.73:1 | Sutil — coerente com tom neutro |
| secondary (dark) | `#1e293b` | 2.96:1 | Médio — visível no dark |
| outline (light) | `#94a3b8` | 2.08:1 | Sutil |
| outline (dark) | `#1e293b` | 1.86:1 | Sutil |
| danger | `#991B1B` | 2.21:1 | Médio |
| workout | `#065F46` | 4.0:1 | Forte |
| assessment | `#4C1D95` | 4.03:1 | Forte |
| payment | `#92400E` | 4.25:1 | Forte |

---

## 📊 Slate Scale — Referência Rápida

A escala Slate é a base dos botões neutros. Tabela de contraste para decisões rápidas:

| Tom | Hex | vs Branco | vs `#050A12` | vs slate-700 | vs slate-100 |
|-----|-----|:---------:|:------------:|:------------:|:------------:|
| **slate-100** | `#f1f5f9` | 1.10:1 | **18.11:1** | **9.45:1** | 1.0:1 |
| **slate-200** | `#e2e8f0` | 1.23:1 | **16.09:1** | **8.40:1** | 1.13:1 |
| **slate-300** | `#cbd5e1` | 1.48:1 | **13.36:1** | **6.97:1** | 1.36:1 |
| **slate-400** | `#94a3b8` | 2.56:1 | **7.74:1** | 4.04:1 | 2.34:1 |
| **slate-500** | `#64748b` | **4.76:1** | **4.17:1** | 2.18:1 | **4.34:1** |
| **slate-600** | `#475569` | **7.58:1** | 2.62:1 | 1.37:1 | **6.92:1** |
| **slate-700** | `#334155` | **10.35:1** | 1.92:1 | 1.0:1 | **9.45:1** |
| **slate-800** | `#1e293b` | **14.63:1** | 1.36:1 | 1.41:1 | **13.35:1** |
| **slate-900** | `#0f172a` | **17.85:1** | 1.11:1 | 1.72:1 | **16.30:1** |

### Fórmula de Escolha de Slate

**Light mode** (fundo branco `#ffffff`):
- Botão surface: **slate-200 a slate-300** (visível sem ser pesado)
- Texto sobre botão: **slate-600 a slate-700** (AA+ garantido)
- Texto body: **slate-700+** para AA, **slate-900** para AAA

**Dark mode** (fundo `#050A12`):
- Botão surface: **slate-500 a slate-600** (destaque suficiente 2.6–4.2:1)
- Texto sobre botão: **slate-100** (6.9–4.3:1 = AA)
- Texto body: **slate-200+** para AAA

---

## 🏗️ Dark Mode — Camadas de Profundidade

| Camada | Hex | Contraste com anterior | Uso |
|--------|-----|:----------------------:|-----|
| 0 — bg-primary | `#050A12` | — (base) | Fundo da página |
| 1 — bg-elevated | `#080E1A` | 1.03:1 | Modais, drawers |
| 2 — bg-surface-1 | `#0B1221` | 1.03:1 | Cards nível 1 |
| 3 — bg-surface-2 | `#111B2E` | 1.09:1 | Cards nível 2, inputs |
| 4 — bg-surface-3 | `#182640` | 1.14:1 | Áreas destacadas, hovers |

> Os deltas são sutis (1.03–1.14:1) — é proposital para o estilo "midnight pulse". A distinção vem de: (1) bordas glass `rgba(255,255,255,0.08)`, (2) shadows `shadow-surface`, (3) gradientes sutis. NÃO depender apenas da cor de fundo para separar camadas.

---

## ⚠️ Problemas Conhecidos & Decisões

### 1. `text-muted` em Light Mode = 2.56:1 (FAIL)
**Decisão**: Aceito como design choice. Usado APENAS para:
- Placeholders de input
- Timestamps e metadata decorativa
- Captions em texto ≥14px
- **NUNCA** para labels de formulário, mensagens de erro, ou texto informativo

### 2. Status colors em Light Mode (success/warning/whatsapp < 3:1)
**Decisão**: Essas cores são usadas como **superfícies** (badges, pills) com texto escuro (#0F172A), não como texto sobre branco. Em dark mode funcionam perfeitamente como texto.

### 3. Botões coloridos (workout/assessment/payment) — texto branco FAIL
**Decisão**: Texto branco sobre cores vibrantes é uma escolha de impacto visual. Os botões são sempre ≥14px bold (tamanho grande), o que reduz o requisito para AA-lg (3:1). A alta saturação cromática compensa perceptualmente.

### 4. Brand-primary como texto em light mode = 2.28:1 (FAIL)
**Regra**: NUNCA usar `text-brand-primary` para texto sobre fundo branco. Usar `text-green-700` (#15803d, 4.67:1 AA ✅) ou `brand-deep` (#166534, 8.04:1 AAA ✅).

---

## 🧮 Combinações Seguras — Quick Reference

### Texto sobre fundos (mínimo AA 4.5:1)

| Fundo (Light) | Texto seguro |
|----------------|-------------|
| `#ffffff` (bg-primary) | `#0F172A` (17.85:1) · `#475569` (7.58:1) · `#334155` (10.35:1) |
| `#F8FAFB` (bg-secondary) | `#0F172A` (17.05:1) · `#475569` (7.24:1) |
| `#F5F7FA` (bg-page) | `#0F172A` (16.63:1) · `#475569` (7.06:1) |
| `#cbd5e1` (btn secondary) | `#334155` (6.97:1) · `#475569` (5.10:1) |
| `#e2e8f0` (btn outline) | `#334155` (8.40:1) · `#475569` (6.15:1) |

| Fundo (Dark) | Texto seguro |
|--------------|-------------|
| `#050A12` (bg-primary) | `#F0F4F8` (17.95:1) · `#94A3B8` (7.74:1) · `#e2e8f0` (16.09:1) |
| `#0B1221` (bg-secondary) | `#F0F4F8` (16.92:1) · `#94A3B8` (7.30:1) |
| `#111B2E` (bg-tertiary) | `#F0F4F8` (15.57:1) · `#94A3B8` (6.71:1) |
| `#475569` (btn secondary) | `#f1f5f9` (6.92:1) · `#F0F4F8` (6.15:1) |
| `#64748b` (btn outline) | `#f1f5f9` (4.34:1) · `#F0F4F8` (3.86:1) |

### Cores sobre fundos escuros (para ícones/badges, mín AA-lg 3:1)

| Cor | vs `#050A12` | Grade |
|-----|:------------:|:-----:|
| `#22C55E` brand-primary | 8.71:1 | AAA ✅ |
| `#10B981` success | 7.82:1 | AAA ✅ |
| `#F59E0B` warning | 9.24:1 | AAA ✅ |
| `#EF4444` error | 5.27:1 | AA ✅ |
| `#3B82F6` info | 5.39:1 | AA ✅ |
| `#8B5CF6` ai | 4.68:1 | AA ✅ |
| `#25D366` whatsapp | 10.0:1 | AAA ✅ |

### Cores sobre fundos claros (para ícones/badges, mín AA-lg 3:1)

| Cor | vs `#ffffff` | Grade | Alternativa segura |
|-----|:------------:|:-----:|-------------------|
| `#22C55E` brand | 2.28:1 | FAIL ❌ | Use `#15803d` green-700 (4.67:1 AA ✅) |
| `#10B981` success | 2.54:1 | FAIL ❌ | Use `#047857` emerald-700 (5.47:1 AA ✅) |
| `#F59E0B` warning | 2.15:1 | FAIL ❌ | Use `#B45309` amber-700 (4.86:1 AA ✅) |
| `#EF4444` error | 3.76:1 | AA-lg ⚠️ | Use `#B91C1C` red-700 (6.05:1 AA ✅) |
| `#3B82F6` info | 3.68:1 | AA-lg ⚠️ | Use `#1D4ED8` blue-700 (6.50:1 AA ✅) |
| `#8B5CF6` ai | 4.23:1 | AA-lg ⚠️ | OK para ícones grandes; texto use `#6D28D9` violet-700 (6.95:1) |
| `#25D366` whatsapp | 1.98:1 | FAIL ❌ | Use `#15803d` green-700 (4.67:1 AA ✅) |

---

## 🎯 Regras para Manutenção

### Ao criar novos componentes:

1. **Verificar contraste texto/fundo** — mínimo 4.5:1 (AA) para texto normal
2. **Verificar contraste superfície/fundo** — botões precisam ≥1.3:1 em light, ≥2.5:1 em dark
3. **Shadow 3D** — cor do shadow deve ser ≥1.5:1 mais escura que a superfície
4. **Testar ambos os modos** — SEMPRE light E dark. Cores vibrantes geralmente só funcionam em um
5. **Usar scale Zinc** para neutros — tom neutro sem competir com verde da marca

### Ao escolher cores:

```
Light mode: fundo claro → texto escuro → status como superfície
Dark mode:  fundo escuro → texto claro → status como texto direto
```

### Hierarquia de botões (respeitando contraste):

```
primary (verde 3D) > secondary (navy slate 3D) > outline (zinc-200/500 3D) > ghost (transparente)
```

### Fórmula para shadow 3D sólido:

```
Regra: shadow-color ≈ 2 tons mais escuro que a superfície na escala Zinc
Light: superfície zinc-300 → shadow zinc-400 (#a1a1aa)
Dark:  superfície zinc-600 → shadow zinc-800 (#27272a)
```

---

## 📝 Formulários — Selects & Inputs

### Estilos Globais (globals.css)

Todos os `<select>`, `<input>` e `<textarea>` recebem estilos consistentes via CSS global:

| Propriedade | Light | Dark |
|-------------|-------|------|
| Background | `#ffffff` (branco) | `var(--color-bg-surface-1)` (#0B1221) |
| Border | `#E2E8F0` (slate-200) | `rgba(255,255,255,0.10)` |
| Text | `var(--color-text-primary)` | `var(--color-text-primary)` |
| Focus border | `rgba(34,197,94,0.5)` | `rgba(34,197,94,0.5)` |
| Focus ring | `0 0 0 3px rgba(34,197,94,0.12)` | `0 0 0 3px rgba(34,197,94,0.12)` |
| Border radius | `0.75rem` (12px) | `0.75rem` (12px) |

> **Dark mode inputs**: Usam `bg-surface-1` (#0B1221) — 1 nível acima do bg da página (#050A12) — para diferenciar o input do fundo sem ser jarring.

### Select Arrow

Custom SVG arrow via `background-image` — cor `#94A3B8` (text-secondary) para ambos os modos.

---

## 🔒 Modais — Z-Index & Scroll Lock

### Hierarquia de Z-Index

| Nível | z-index | Uso |
|-------|:-------:|-----|
| Base content | 0-10 | Click-away overlays, menus dropdown |
| Mobile nav backdrop | 40 | Overlay escuro do menu mobile |
| Mobile nav bar | 45 | Barra de navegação inferior |
| **Standard modals** | **50** | Edição, confirmação, detalhes |
| Calendar/crop modals | 60 | Modais sobre modais |
| PWA overlays | 9998-10000 | Install banners, gates |
| Splash screen | 9999 | Tela de loading inicial |

### Scroll Lock (useScrollLock)

Hook `src/hooks/use-scroll-lock.ts` — previne scroll do body quando modais estão abertos:
- Usa `position: fixed` no body (preserva posição do scroll)
- Suporta modais aninhados via counter
- Restaura scroll position ao fechar

**Aplicado em**: admin/personals, admin/users, admin/payments, exercises, feedback-modal, calendar, workouts/create, photo-upload, passkey-prompt

---

## 🔧 Script de Auditoria

Para re-auditar após mudanças, rodar:

```bash
python3 -c "
# Cole o script Python do audit aqui
# Ou execute: python3 scripts/audit-colors.py
"
```

> **Atualizar este doc** sempre que: mudar `globals.css`, alterar button.tsx, criar novo componente com cores, ou durante sprints de UI/polish.

---

## 👤 AvatarWithPlanBadge — Componente DS Premium

> **Desde v5.8.5** · `src/components/ui/avatar-plan-badge.tsx`

Componente que combina Avatar + indicador de plano como overlay premium. Substitui o antigo `PlanBadge` standalone (que ocupava espaço horizontal no header).

### Design (v3 — Border-based, SVG Icons)

```
  ┌──────────┐
  │   •      │  ← Dot verde ativo (top-right, animate-pulse)
  │ ┌──────┐ │
  │ │Avatar│ │  ← Border colorida real (border-2, border-box)
  │ └──────┘ │      Sizing preciso: sm=36px = ds3-action-btn
  │  [⚡Pro] │  ← Badge centralizado (SVG filled icon + label)
  └──────────┘
```

### Sizing Pixel-Perfect (Material Design 3)

O container usa `border` real (não `ring`) para sizing preciso via `border-box`:

| Size | Avatar | Container | Border | Total | Match |
|------|--------|-----------|--------|------:|-------|
| `sm` | 32px (h-8) | 36px (h-9 w-9) | border-2 (2px×2) | **36px** | = ds3-action-btn ✓ |
| `md` | 40px (h-10) | 44px (h-11 w-11) | border-2 (2px×2) | **44px** | — |
| `lg` | 48px (h-12) | 52px (h-13 w-13) | border-2 (2px×2) | **52px** | — |
| `xl` | 64px (h-16) | 68px (h-17 w-17) | border-2 (2px×2) | **68px** | — |

> **Fórmula:** Container = Avatar + (border-width × 2). Border é `border-box`, consumida dentro do container.
> **Alinhamento:** `sm` = 36px = `ds3-action-btn` (36×36) — pixel-perfect no header.

### Ícones SVG Filled

Todos os ícones são **SVG filled inline** (`fill="currentColor"`, viewBox `0 0 12 12`). Zero emojis.

| Plano | Ícone | Descrição | SVG Path |
|-------|:-----:|-----------|----------|
| trial | ✦ sparkle | 4-pointed sparkle preenchido | `M6 0L7.5 4.5L12 6L...` |
| pro | ⚡ bolt | Raio/lightning bolt preenchido | `M7 0L3 7h3l-1 5...` |
| profissional | ★ star | Estrela 5 pontas preenchida | `M6 .5l1.76 3.57...` |
| max | 👑 crown | Coroa preenchida com base | `M1 8l1.5-5L5.5 6...` |

### Configuração por Plano

| Slug DB | Nome Display | Ícone SVG | Border | Badge BG | Glow |
|---------|:------------|:---------:|--------|----------|------|
| `trial` | **Grátis** | sparkle | zinc-300 / zinc-600 | zinc-600 | — |
| `pro` | **Pro** | bolt | emerald-400 / emerald-500 | emerald-600 | `0_0_6px rgba(34,197,94,0.3)` |
| `profissional` | **Pro+** | star | violet-400 / violet-500 | violet-600 | `0_0_6px rgba(139,92,246,0.3)` |
| `max` | **Max** | crown | amber-400 / amber-500 | gradient amber→orange | `0_0_8px rgba(245,158,11,0.35)` |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `src` | `string \| null` | — | URL da foto do avatar |
| `name` | `string` | — | Nome para initials fallback |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Tamanho do avatar + badge |
| `showActiveDot` | `boolean` | `true` | Dot verde animado top-right |
| `linkToPlans` | `boolean` | `false` | Wrapa com Link para `/dashboard/plans` |
| `planOverride` | `string` | — | Forçar slug do plano (para previews) |
| `hideBadge` | `boolean` | `false` | Ocultar badge de plano |

### Badge Details por Tamanho

| Size | Badge text | Badge padding | Icon size | Dot size | Dot border |
|------|-----------|--------------|-----------|----------|-----------|
| `sm` | 5.5px | px-1 py-px | 7×7px | 8×8px | border (1px) |
| `md` | 6.5px | px-1.5 py-px | 8×8px | 10×10px | border-[1.5px] |
| `lg` | 7.5px | px-1.5 py-0.5 | 10×10px | 12×12px | border-2 |
| `xl` | 9px | px-2 py-0.5 | 12×12px | 14×14px | border-2 |

### Uso

```tsx
import { AvatarWithPlanBadge } from '@/components/ui/avatar-plan-badge'

// Header — user pill com badge + link para upgrade (36px = ds3-action-btn)
<AvatarWithPlanBadge src={user?.avatar_url} name={user?.full_name} size="sm" linkToPlans />

// Sidebar — card de info com badge
<AvatarWithPlanBadge src={user.avatar_url} name={user.full_name} size="md" linkToPlans />

// Sem dot verde
<AvatarWithPlanBadge src={user.avatar_url} name={user.full_name} showActiveDot={false} />

// Preview forçando plano
<AvatarWithPlanBadge src={user.avatar_url} name={user.full_name} planOverride="max" />
```

### Integração atual

| Local | Size | linkToPlans | Notas |
|-------|------|:-----------:|-------|
| Header desktop (user pill) | `sm` | ✅ | 36px — alinhado com ds3-action-btn |
| Header mobile | `sm` | ✅ | 36px — alinhado com bell/hamburger |
| Sidebar user card | `md` | ✅ | 44px — glassmorphism card |
| Mobile drawer | `md` | ✅ | 44px — badge overlay no drawer |

### Histórico de Versões

| Versão | Data | Mudanças |
|--------|------|----------|
| v1 | v5.8.4 | Ring overlay no avatar, emojis como ícones |
| v2 | v5.8.5 | Ring + badge centralizado + dot + glow |
| **v3** | **v5.8.6** | **Border real (não ring) para sizing preciso, SVG filled icons, sm=36px=ds3-action-btn** |

### Nomenclatura de Planos — Canônica (v5.8.5+)

| Slug DB | Display Name | Tier (UI) | Preço | Alunos |
|---------|:------------|:--------:|------:|--------|
| `trial` | **Grátis** | GRÁTIS | R$ 0 | 5 |
| `pro` | **Pro** | PRO | R$ 29,90/mês | Ilimitados |
| `profissional` | **Pro+** | PRO+ | R$ 69,90/mês | Ilimitados |
| `max` | **Max** | MAX | R$ 129,90/mês | Ilimitados |

> ⚠️ **Regra**: NUNCA usar "Essencial", "Trainer", "Trial", "Free", "Profissional" como display name. Os nomes canônicos são **Grátis, Pro, Pro+, Max**.
> O slug no banco de dados permanece `trial`, `pro`, `profissional`, `max` (sem alterar schema).

---

*Última auditoria: 18/03/2026 — Todas as combinações verificadas com WCAG 2.1 contrast ratio algorithm.*
