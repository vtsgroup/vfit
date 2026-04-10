# VFIT Ultra v4 — Implementation Guide for Copilot

> **Documento:** Passo-a-passo técnico para começar a implementação dos 8 sprints  
> **Última atualização:** 10/04/2026  
> **Responsável por:** Sequência de ações, verificações, troubleshooting

---

## 🚀 Quick Start

```bash
# 1. Criar feature branch (se não existir)
git checkout -b feat/vfit-ultra-v4-s1-tokens

# 2. Ler documentação (NÃO pular)
# PLAN.md → visão geral
# DESIGN-TOKENS.md → tokens a adicionar
# COMPONENT-SPECS.md → componentes a modificar
# PAGES-REDESIGN.md → layouts

# 3. Começar Sprint 1 (ver seção Sprint 1 abaixo)
```

---

## 📋 Pré-Requisitos

### ✅ Verificar antes de começar

```bash
# 1. Node/npm atualizado
npm --version  # ≥ 10.0.0
node --version # ≥ 20.0.0

# 2. Tailwind CSS v4
grep "tailwindcss" package.json | grep "4"  # Deve exibir versão 4.x.x

# 3. Framer Motion instalado (para animações)
grep "framer-motion" package.json

# 4. TypeScript strict mode
grep "strict" tsconfig.json  # Deve ser true

# 5. Wrangler atualizado (para deploy)
wrangler --version  # ≥ 3.x.x
```

### 📖 Ler estas docs ANTES de começar

- `.claude/docs/RULES.md` — 19 regras críticas (lê completamente!)
- `.claude/docs/DESIGN-SYSTEM.md` — cores WCAG, contrastes
- `.claude/docs/CONVENTIONS.md` — imports, CSS, auth guard

---

## 🔄 Workflow Geral por Sprint

```
1. Ler spec do sprint (PLAN.md, COMPONENT-SPECS.md, PAGES-REDESIGN.md)
2. Criar branch feature
3. Implementar mudanças (editar código)
4. Rodar quality checks
5. Testar em device (mobile + desktop)
6. Atualizar TRACKING.md
7. Commit + PR
8. Deploy (quando pronto)
```

---

## 🎯 Sprint 1 — Tokens CSS + Botão Secondary 3D

### Arquivos a Modificar

```
src/app/globals.css              [+90 linhas] — novos tokens CSS
src/components/ui/button.tsx     [~10 linhas] — gradient + shadow secondary
```

### Passo 1.1: Adicionar Tokens CSS em `globals.css`

**Localização:** Procurar por `/* Ultra Glass v4 */` ou adicionar antes de `:root {`

```bash
# 1. Abrir arquivo
code src/app/globals.css

# 2. Procurar por "/* Design System Tokens */" ou similar
# 3. Adicionar ANTES ou DEPOIS, conforme organização existente
```

**O que adicionar (copiar de DESIGN-TOKENS.md):**
- `--glass-v4-bg`, `--glass-v4-border-*`, `--glass-v4-shine`, `--glass-v4-blur`, `--glass-v4-shadow`
- `--btn-secondary-light-from`, `--btn-secondary-light-via`, `--btn-secondary-light-to`, `--btn-secondary-light-shadow`, `--btn-secondary-light-text-shadow`, `--btn-secondary-light-glow`
- `--shadow-glass-sm`, `--shadow-glass-md`, `--shadow-glass-lg`, `--shadow-glass-xl`, `--shadow-glass-2xl`
- `--shadow-glass-inset-*`
- `--kpi-*-light`, `--kpi-*-border`, `--kpi-*-icon-bg`
- Keyframes: `@keyframes lift {}`, `@keyframes glow-pulse {}`, `@keyframes slide-up {}`, `@keyframes scale-spring {}`

**Verificação:**
```bash
grep "glass-v4-bg" src/app/globals.css  # Deve retornar 1 resultado
grep "@keyframes lift" src/app/globals.css  # Deve retornar 1 resultado
```

### Passo 1.2: Adicionar Classes CSS em `globals.css`

**O que adicionar:**
```css
/* Classes para glassmorfismo v4 */
.glass-ultra { ... }
.glass-ultra::before { ... }
.glass-ultra:hover { ... }
.glass-depth { ... }
```

**Verificação:**
```bash
grep "\.glass-ultra {" src/app/globals.css  # Deve retornar 1
grep "\.glass-depth {" src/app/globals.css  # Deve retornar 1
```

### Passo 1.3: Modificar Button Secondary em `button.tsx`

**Localização:** Procurar por `secondary` ou linha ~70

**Mudanças:**
- Light mode gradient: trocar `from-zinc-100 via-zinc-200 to-zinc-400` para `from-zinc-200 via-zinc-300 to-zinc-400`
- Light mode shadow: trocar `#27272a` para `#71717a` (zinc-600)
- Adicionar text-shadow (novo)
- Adicionar hover glow

**Antes de fazer mudança:**
```bash
# 1. Ler a função completa
code src/components/ui/button.tsx:70:85

# 2. Localizar o trecho de secondary
```

**Depois de fazer mudança:**
```bash
# 1. Verificar contraste com ferramentas
# https://contrastchecker.com

# 2. Testar em light mode
npm run dev
# Abrir http://localhost:3000
# Navegar para uma página que usa <Button variant="secondary">
# Verificar em light mode (tema branco)

# 3. Verificar que o contraste agora é ≥3:1
```

### Passo 1.4: Rodar Quality Checks

```bash
# 1. TypeScript check
npm run type:check

# 2. Linter (ESLint)
npm run lint

# 3. Quality CI (simulado)
npm run quality:ci

# Deve passar todos sem erros!
```

### Passo 1.5: Atualizar TRACKING.md

```markdown
- [x] T1.1 — Adicionar tokens CSS em globals.css (DESIGN-TOKENS.md)
- [x] T1.2 — Adicionar classes .glass-ultra e .glass-depth
- [x] T1.3 — Modificar Button secondary gradient + shadow
- [x] T1.4 — Rodar quality checks (npm run quality:ci)
- [x] T1.5 — Testar em light mode e dark mode
```

### Passo 1.6: Commit

```bash
git add src/app/globals.css src/components/ui/button.tsx

git commit -m "feat: S1 — secondary button 3D + ultra glass tokens

- Add --glass-v4-* tokens for premium glassmorphism
- Add .glass-ultra and .glass-depth CSS classes
- Improve secondary button contrast in light mode (1.48:1 → 3.5:1)
- Add text-shadow for better readability
- Add motion keyframes (lift, glow-pulse, slide-up, scale-spring)

Sprint: S1 (Tokens CSS + Botão Secundário 3D)
Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## 🎨 Sprint 2 — GlassCard v4

### Arquivos a Modificar

```
src/components/ui/glass-card.tsx     [+8 variantes] — nova variante ultra + depth
```

### Passo 2.1: Adicionar Variante `ultra` em `glass-card.tsx`

**O que fazer:**
1. Abrir `src/components/ui/glass-card.tsx`
2. Procurar por `type GlassCardVariant = 'surface' | 'glass' | ...`
3. Adicionar `| 'ultra' | 'depth'` ao tipo
4. Procurar por `VARIANT_STYLES`
5. Adicionar:
```typescript
ultra: 'glass-ultra',
depth: 'glass-depth',
```

**Verificação:**
```bash
grep "ultra:" src/components/ui/glass-card.tsx  # Deve retornar 1
grep "depth:" src/components/ui/glass-card.tsx  # Deve retornar 1
```

### Passo 2.2: Testar Variantes

```bash
npm run dev

# Abrir uma página que usa <GlassCard>
# Mudar variant para "ultra" ou "depth"
# Verificar que renderiza com novo estilo
```

---

## 📊 Sprint 3 — KPI Cards

### Arquivos a Modificar

```
src/components/progresso/kpi-card.tsx     [~50 linhas] — redesign completo
```

### Passo 3.1: Reescrever KPICard

Ver COMPONENT-SPECS.md para código completo.

**O que mudar:**
- Props: adicionar `color: 'blue' | 'cyan' | 'purple' | 'amber'`
- Adicionar `trend: { delta: number, isPositive: boolean }`
- Renderizar icon em container colorido
- Renderizar trend badge com seta

### Passo 3.2: Testar KPICard

```bash
npm run dev

# Navegar para treinos page
# Verificar que KPI cards têm cores diferentes
# Verificar que icons estão em containers coloridos
# Verificar que labels têm melhor contraste
```

---

## 🏋️ Sprint 4 — Página Treinos

### Arquivos a Modificar

```
src/app/(app)/treinos/page.tsx     [~30 linhas] — redesign total dos cards
```

### Passo 4.1: Redesenhar Hero Card

Ver PAGES-REDESIGN.md seção "Treino do Dia".

**O que fazer:**
1. Trocar `.glass-card` por `<GlassCard variant="ultra">`
2. Adicionar strip 3px verde à esquerda
3. Aumentar ProgressRing para 160x160
4. Adicionar informação do próximo exercício
5. Adicionar CTA button `lg`

### Passo 4.2: Redesenhar KPI Grid

Ver PAGES-REDESIGN.md seção "KPI Grid".

**O que fazer:**
1. Usar novo componente KPICard com cores temáticas
2. Passar `color="blue"` para passos, `color="cyan"` para água, etc.
3. Adicionar trend data

### Passo 4.3: Redesenhar Nutrição Card

Ver PAGES-REDESIGN.md seção "Card Nutrição".

**O que fazer:**
1. Adicionar gradiente amber no header
2. Adicionar barra de progresso com animação spring
3. Mostrar outros macros em grid

### Passo 4.4: Redesenhar Avaliação Card

Ver PAGES-REDESIGN.md seção "Card Avaliação".

**O que fazer:**
1. Adicionar gradiente violet
2. Adicionar emoji rating buttons
3. Adicionar CTA com Button `assessment` variant

### Passo 4.5: Redesenhar Templates Section

Ver PAGES-REDESIGN.md seção "Templates Explorer".

**O que fazer:**
1. Adicionar thumbnail com gradiente por grupo muscular
2. Adicionar ícone DSIcon visível
3. Adicionar hover scale effect

---

## 📋 Sprint 5 — Página Plano

### Arquivos a Modificar

```
src/app/(app)/plano/page.tsx     [~40 linhas] — MuscleChip + ExerciseCard redesign
src/components/exercicios/exercise-card.tsx  [novo ou modificado] — ExerciseCard com glassmorfismo
```

### Passo 5.1: Migrar MuscleChip para Tokens

**O que fazer:**
1. Procurar por `MUSCLE_COLORS` ou `style={{ backgroundColor: ... }}`
2. Remover inline styles
3. Criar `MUSCLE_CHIP_CLASSES` record com classes Tailwind
4. Usar `bg-(--muscle-${muscle}-primary)`

**Verificação:**
```bash
grep "style={{" src/app/(app)/plano/page.tsx  # Não deve ter backgroundColor nenhum
grep "MUSCLE_COLORS" src/app/(app)/plano/page.tsx  # Deve ser removido
```

### Passo 5.2: Renderizar MuscleChip com DSIcon

**O que fazer:**
1. Adicionar `<DSIcon name={getMuscleIcon(muscle)} />`
2. Remover MUSCLE_EMOJI completamente

---

## 🔍 Sprint 6 — Página Exercícios

### Arquivos a Modificar

```
src/app/(app)/exercicios/page.tsx     [~20 linhas] — remover MUSCLE_EMOJI
src/app/(app)/exercicios/[id]/client-page.tsx     [~30 linhas] — hero section + instructions
src/components/exercicios/exercise-card.tsx  [novo ou modificado]
```

### Passo 6.1: Remover MUSCLE_EMOJI

**O que fazer:**
```bash
# 1. Procurar por MUSCLE_EMOJI
grep "MUSCLE_EMOJI" src/app/\(app\)/exercicios/page.tsx

# 2. Substituir por DSIcon
# ❌ {MUSCLE_EMOJI[muscle]}
# ✅ <DSIcon name={getMuscleIcon(muscle)} size={16} />

# 3. Verificar
grep "MUSCLE_EMOJI" src/app/\(app\)/exercicios/page.tsx  # Zero resultados!
```

### Passo 6.2: Adicionar Filter Chips com Ícones

Ver PAGES-REDESIGN.md seção "Muscle Filter Chips".

**O que fazer:**
1. Renderizar MuscleChip para cada filtro
2. Adicionar ícone via DSIcon
3. Adicionar hover state com cor temática

### Passo 6.3: Redesenhar Exercise Grid

Ver PAGES-REDESIGN.md seção "Exercise Grid".

**O que fazer:**
1. Usar novo ExerciseCard componente
2. Adicionar Framer Motion para staggered animation
3. Adicionar layout animado para filter transitions

### Passo 6.4: Redesenhar Exercise Detail Page

Ver PAGES-REDESIGN.md seção "Exercício Detail Page".

**O que fazer:**
1. Hero section com gradiente temático
2. Info chips (dificuldade, grupo, equipamento)
3. Instructions com step badges
4. CTA fixo no bottom

---

## 🧭 Sprint 7 — Navigation

### Arquivos a Modificar

```
src/components/navigation/bottom-navigation.tsx     [~15 linhas] — spring animations
src/components/layout/sidebar.tsx                   [~10 linhas] — active indicator 3D
```

### Passo 7.1: Bottom Navigation Spring Animations

**O que fazer:**
1. Adicionar `spring` transition ao active indicator
2. Adicionar scale 1.08 e glow shadow
3. Adicionar FAB pulsing animation

---

## 🎨 Sprint 8 — Inputs, Empty States, Notificações

### Arquivos a Modificar

```
src/components/ui/md3-input.tsx              [~15 linhas] — glow ring focus
src/components/ui/empty-state-ds.tsx         [~20 linhas] — CTA lg, icon maior
src/components/ui/modern-notification.tsx    [~15 linhas] — animação entrada
```

### Passo 8.1: Melhorar MD3 Input Focus

**O que fazer:**
1. Adicionar `box-shadow: 0 0 0 3px rgba(34,197,94,0.15)` ao focus
2. Adicionar shake animation ao error
3. Adicionar fade-in ao helper text

### Passo 8.2: Melhorar Empty State

**O que fazer:**
1. Aumentar icon size para 48px
2. Usar CTA Button `lg` em vez de `md`
3. Adicionar background ao icon (rounded-full bg-brand-primary/15)

### Passo 8.3: Adicionar Animações a Notifications

**O que fazer:**
1. Adicionar slide-up + spring animation ao mount
2. Adicionar pulse animation ao status dot
3. Adicionar fade-out animation ao dismiss

---

## ⚠️ Troubleshooting

### Problema: Tokens CSS não aparecem

**Solução:**
```bash
# 1. Verificar que estão em globals.css
grep "glass-v4-bg" src/app/globals.css

# 2. Verificar sintaxe Tailwind v4
# ❌ bg-[var(--color-glass)]
# ✅ bg-(--color-glass)

# 3. Limpar cache Tailwind
rm -rf node_modules/.cache
npm run dev
```

### Problema: Componente não renderiza novo variant

**Solução:**
```bash
# 1. Verificar que tipo foi atualizado
grep "type GlassCardVariant" src/components/ui/glass-card.tsx

# 2. Verificar que VARIANT_STYLES foi atualizado
grep "ultra:" src/components/ui/glass-card.tsx

# 3. Hard refresh do browser
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

### Problema: Contraste não passa no WCAG

**Solução:**
```bash
# 1. Usar https://contrastchecker.com
# 2. Ajustar valores em globals.css
# 3. Testar novamente com ferramentas

# Valores obrigatórios:
# Normal text: ≥4.5:1 (AA)
# Large text (18px+): ≥3:1 (AA)
```

### Problema: Animação não funciona

**Solução:**
```bash
# 1. Verificar que Framer Motion está importado
grep "from 'framer-motion'" src/components/...

# 2. Verificar que prefers-reduced-motion é respeitado
# Em globals.css, adicionar:
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}

# 3. Testar em Safari (mais restritivo)
```

---

## ✅ Pre-Deploy Checklist

Antes de fazer deploy/PR:

```bash
# 1. TypeScript (zero errors)
npm run type:check

# 2. Linter (zero errors)
npm run lint

# 3. Quality gate
npm run quality:ci

# 4. Build test
npm run build

# 5. Smoke auth test
npm run smoke:auth:local

# 6. Visual test no device
# iPhone 14: abrir http://localhost:3000 e testar todas as páginas
# Desktop (1440px): verificar responsiveness

# 7. TRACKING.md atualizado
# - Todas as tasks marcadas como [x]
# - Progresso: N/M (%)

# 8. Commit + PR
git push origin feat/vfit-ultra-v4-sX-...
gh pr create --title "feat: SX — ..." --body "..."
```

---

## 📞 Contato & Help

Se ficar bloqueado:
1. Ler RULES.md e DESIGN-SYSTEM.md de novo
2. Procurar por erro no troubleshooting acima
3. Perguntar ao user (verificar contexto do plano)
4. Ver exemplo de component similar já implementado
