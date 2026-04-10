# VFIT Ultra v4 — Project Tracking

> **Status:** 🔄 Em Implementação  
> **Criado:** 10/04/2026  
> **Objetivo:** 8 sprints de redesign ultra-moderno (glassmorfismo, botões 3D, UX melhorado)  
> **Última atualização:** 10/04/2026

---

## 📊 Progresso Geral

```
Sprints Completos: 0/8 (0%)
Tasks Totais: 136
Tasks Concluídas: 0
Percentual: 0%
```

---

## 📋 Sprint 1 — Tokens CSS + Botão Secondary 3D

**Objetivo:** Adicionar novos tokens CSS (glassmorfismo v4, shadows, motion) e melhorar contraste do botão secondary

**Status:** ⬜ Pendente

### Tasks

- [ ] T1.1 — Adicionar `--glass-v4-*` tokens em globals.css (DESIGN-TOKENS.md)
- [ ] T1.2 — Adicionar `--btn-secondary-light-*` tokens para light mode
- [ ] T1.3 — Adicionar `--shadow-glass-*` e `--shadow-kpi-*` tokens
- [ ] T1.4 — Adicionar `--muscle-*-primary` e `--muscle-*-light` colors
- [ ] T1.5 — Adicionar classes CSS `.glass-ultra` e `.glass-depth` em globals.css
- [ ] T1.6 — Adicionar keyframes (`@keyframes lift`, `glow-pulse`, `slide-up`, `scale-spring`)
- [ ] T1.7 — Modificar `button.tsx` secondary gradient (zinc-100→zinc-200→zinc-400)
- [ ] T1.8 — Adicionar text-shadow ao secondary button em light mode
- [ ] T1.9 — Modificar secondary shadow color (zinc-800 → zinc-600)
- [ ] T1.10 — Rodar `npm run quality:ci` (deve passar)
- [ ] T1.11 — Testar botão secondary em light mode (contraste ≥3.5:1)
- [ ] T1.12 — Testar botão secondary em dark mode
- [ ] T1.13 — Verificar que `.glass-ultra` renderiza com blur correto
- [ ] T1.14 — Testar em iOS (iPhone 14)
- [ ] T1.15 — Atualizar TRACKING.md com tasks concluídas

**Commit esperado:** `feat: S1 — secondary button 3D + ultra glass tokens`

---

## 🎨 Sprint 2 — GlassCard v4 (nova variante ultra)

**Objetivo:** Adicionar variantes `ultra` e `depth` ao GlassCard com glassmorfismo aprimorado

**Status:** ⬜ Pendente

### Tasks

- [ ] T2.1 — Adicionar `'ultra' | 'depth'` ao tipo `GlassCardVariant` em glass-card.tsx
- [ ] T2.2 — Adicionar `ultra: 'glass-ultra'` ao `VARIANT_STYLES` record
- [ ] T2.3 — Adicionar `depth: 'glass-depth'` ao `VARIANT_STYLES` record
- [ ] T2.4 — Adicionar prop opcional `hoverLift?: boolean` ao GlassCard
- [ ] T2.5 — Adicionar prop opcional `glowColor?: string` ao GlassCard
- [ ] T2.6 — Testar `<GlassCard variant="ultra">` renderiza corretamente
- [ ] T2.7 — Testar `<GlassCard variant="depth">` renderiza corretamente
- [ ] T2.8 — Testar hover state em ambas variantes
- [ ] T2.9 — Verificar que variantes antigas continuam funcionando (regressão)
- [ ] T2.10 — Testar em light mode
- [ ] T2.11 — Testar em dark mode
- [ ] T2.12 — Testar em iOS (iPhone 14)
- [ ] T2.13 — Testar em desktop (1440px)
- [ ] T2.14 — Performance: verificar que blur não causa lag (<60fps)
- [ ] T2.15 — Rodar `npm run quality:ci` (deve passar)

**Commit esperado:** `feat: S2 — GlassCard ultra + depth variants`

---

## 📊 Sprint 3 — KPI Cards Ultra-Modernos

**Objetivo:** Redesenhar KPICard com cores temáticas, icon containers, trend badges

**Status:** ⬜ Pendente

### Tasks

- [ ] T3.1 — Adicionar prop `color: 'blue' | 'cyan' | 'purple' | 'amber'` ao KPICard
- [ ] T3.2 — Adicionar prop `trend: { delta: number, isPositive: boolean }` (optional)
- [ ] T3.3 — Reescrever markup KPICard com icon container colorido
- [ ] T3.4 — Renderizar icon em `rounded-xl` container com cor temática
- [ ] T3.5 — Renderizar label em `text-zinc-400` (vs zinc-500 anterior)
- [ ] T3.6 — Renderizar trend badge com seta + percentual
- [ ] T3.7 — Cores: blue (#3b82f6), cyan (#06b6d4), purple (#8b5cf6), amber (#d97706)
- [ ] T3.8 — Testar KPICard com color="blue" (deve renderizar azul)
- [ ] T3.9 — Testar KPICard com color="cyan" (deve renderizar cyan)
- [ ] T3.10 — Testar KPICard com trend positivo (seta ↑)
- [ ] T3.11 — Testar KPICard com trend negativo (seta ↓)
- [ ] T3.12 — Testar contraste label vs background (≥4.5:1)
- [ ] T3.13 — Testar em light mode
- [ ] T3.14 — Testar em dark mode
- [ ] T3.15 — Testar em iOS (44x44px touch area)
- [ ] T3.16 — Testar hover scale effect (1.05x)
- [ ] T3.17 — Rodar `npm run quality:ci`

**Commit esperado:** `feat: S3 — KPICard redesign with color themes`

---

## 🏋️ Sprint 4 — Página Treinos B2C Redesign

**Objetivo:** Redesenhar todos os cards da página treinos com variações visuais

**Status:** ⬜ Pendente

### Tasks Treino do Dia Hero Card

- [ ] T4.1 — Trocar `.glass-card` por `<GlassCard variant="ultra">`
- [ ] T4.2 — Adicionar strip verde 3px na esquerda (div `absolute left-0 w-1 bg-emerald-500`)
- [ ] T4.3 — Aumentar ProgressRing para 160x160 (vs 120)
- [ ] T4.4 — Adicionar informação do próximo exercício (nome + tempo)
- [ ] T4.5 — Adicionar CTA button `lg` com "Continuar Treino"

### Tasks KPI Grid

- [ ] T4.6 — Substituir cards genéricos por novo KPICard com cores
- [ ] T4.7 — Passos: color="blue"
- [ ] T4.8 — Água: color="cyan"
- [ ] T4.9 — Sono: color="purple"
- [ ] T4.10 — Calorias: color="amber"
- [ ] T4.11 — Adicionar trend data (delta + isPositive)

### Tasks Nutrição Card

- [ ] T4.12 — Adicionar header com gradiente amber
- [ ] T4.13 — Adicionar progress bar com animação spring
- [ ] T4.14 — Mostrar macros secundárias (carbs, gordura) em grid
- [ ] T4.15 — Layout clean e não overcrowded

### Tasks Avaliação Card

- [ ] T4.16 — Adicionar header com gradiente violet
- [ ] T4.17 — Adicionar emoji rating buttons (😞😐😊🤩)
- [ ] T4.18 — Adicionar CTA button com ícone Trophy

### Tasks Templates Section

- [ ] T4.19 — Adicionar thumbnails com gradiente por grupo muscular
- [ ] T4.20 — Adicionar ícone DSIcon visível
- [ ] T4.21 — Adicionar hover scale effect
- [ ] T4.22 — Mostrar duração + dificuldade

### Tasks Testing

- [ ] T4.23 — Verificar layout responsivo em iPhone 14
- [ ] T4.24 — Verificar layout em iPad (768px)
- [ ] T4.25 — Verificar layout em desktop (1440px)
- [ ] T4.26 — Testar interatividade de todos os cards
- [ ] T4.27 — Testar ProgressRing animation
- [ ] T4.28 — Testar contraste de todos os elementos (≥4.5:1)
- [ ] T4.29 — Rodar `npm run quality:ci`
- [ ] T4.30 — Lighthouse ≥85 (Performance)

**Commit esperado:** `feat: S4 — treinos page complete redesign`

---

## 📋 Sprint 5 — Página Meu Plano Redesign

**Objetivo:** Migrar MuscleChip para tokens, redesenhar ExerciseCard com glassmorfismo temático

**Status:** ⬜ Pendente

### Tasks Header & Tabs

- [ ] T5.1 — Adicionar gradient de texto ao header greeting (brand-primary → brand-mint)
- [ ] T5.2 — Aumentar fonte do greeting (text-4xl, font-black)
- [ ] T5.3 — Adicionar motivational phrase abaixo
- [ ] T5.4 — Redesenhar day selector tabs com indicator 3D (pill + sombra)
- [ ] T5.5 — Adicionar spring transition ao tab indicator

### Tasks MuscleChip

- [ ] T5.6 — **REMOVER** hardcoded `MUSCLE_COLORS` object
- [ ] T5.7 — **REMOVER** `style={{ backgroundColor: ... }}` (ZERO inline styles!)
- [ ] T5.8 — Criar `MUSCLE_CHIP_CLASSES` record com tokens CSS
- [ ] T5.9 — Usar `bg-(--muscle-${muscle}-primary)` em Tailwind v4 syntax
- [ ] T5.10 — Adicionar `<DSIcon>` ao MuscleChip (ZERO EMOJI!)
- [ ] T5.11 — Ativo state: cor temática + shadow glow
- [ ] T5.12 — Inativo state: white/8 background
- [ ] T5.13 — Hover: scale 105

### Tasks ExerciseCard

- [ ] T5.14 — Criar/modificar ExerciseCard com nova props (muscleGroup, difficulty, imageUrl, sets, reps)
- [ ] T5.15 — Renderizar thumbnail com gradiente por grupo muscular
- [ ] T5.16 — Adicionar ícone DSIcon do grupo visível
- [ ] T5.17 — Renderizar difficulty badge colorido (verde=iniciante, amber=intermediário, red=avançado)
- [ ] T5.18 — Renderizar sets x reps em badge
- [ ] T5.19 — Adicionar hover scale effect
- [ ] T5.20 — Testar glassmorfismo em light + dark mode

### Tasks Testing

- [ ] T5.21 — Verificar **ZERO** inline styles no código
- [ ] T5.22 — Verificar **ZERO** hex colors hardcoded
- [ ] T5.23 — Verificar **ZERO** MUSCLE_EMOJI references
- [ ] T5.24 — Testar MuscleChip filter funcionalidade
- [ ] T5.25 — Testar ExerciseCard click (abre detail)
- [ ] T5.26 — Testar responsiveness (2x cols mobile, 3+ desktop)
- [ ] T5.27 — Testar contraste cores vs background (≥4.5:1)
- [ ] T5.28 — Rodar `npm run quality:ci`

**Commit esperado:** `feat: S5 — plano page redesign + MuscleChip tokens`

---

## 🔍 Sprint 6 — Página Exercícios (Biblioteca)

**Objetivo:** Remover MUSCLE_EMOJI, adicionar DSIcon, redesenhar grid com glassmorfismo temático

**Status:** ⬜ Pendente

### Tasks Tabs

- [ ] T6.1 — Adicionar ícones aos tabs (músculos/equipamento/favoritos)
- [ ] T6.2 — Redesenhar tab indicator com sombra 3D
- [ ] T6.3 — Adicionar spring animation ao trocar tabs

### Tasks Filter Chips

- [ ] T6.4 — **REMOVER** todas referências a `MUSCLE_EMOJI`
- [ ] T6.5 — Substituir por `<DSIcon name={getMuscleIcon(muscle)} />`
- [ ] T6.6 — Chips têm ícone + label
- [ ] T6.7 — Ativo: cor temática + glow shadow
- [ ] T6.8 — Inativo: white/8 background

### Tasks Exercise Grid

- [ ] T6.9 — Renderizar ExerciseCard para cada exercício
- [ ] T6.10 — Adicionar animação staggered (Framer Motion)
- [ ] T6.11 — Atualizar grid ao mudar filtro (smooth transition)
- [ ] T6.12 — Testar em mobile (2 cols)
- [ ] T6.13 — Testar em tablet (3 cols)
- [ ] T6.14 — Testar em desktop (4-5 cols)

### Tasks Detail Page

- [ ] T6.15 — Hero section com gradiente do grupo muscular
- [ ] T6.16 — Info chips (dificuldade, grupo, equipamento)
- [ ] T6.17 — Instructions com step badges numerados
- [ ] T6.18 — CTA button fixo no bottom
- [ ] T6.19 — Testar responsiveness

### Tasks Testing

- [ ] T6.20 — Verificar **ZERO** MUSCLE_EMOJI no código
- [ ] T6.21 — Verificar que todos ícones são DSIcon
- [ ] T6.22 — Testar filter funcionalidade
- [ ] T6.23 — Testar card click (abre detail)
- [ ] T6.24 — Testar back navigation
- [ ] T6.25 — Testar contraste (≥4.5:1)
- [ ] T6.26 — Rodar `npm run quality:ci`

**Commit esperado:** `feat: S6 — exercicios page + remove MUSCLE_EMOJI`

---

## 🧭 Sprint 7 — Navigation Upgrade

**Objetivo:** Adicionar spring animations ao bottom nav, 3D indicator ao sidebar

**Status:** ⬜ Pendente

### Tasks Bottom Navigation

- [ ] T7.1 — Active indicator: spring animation (scale 1.0 → 1.08)
- [ ] T7.2 — Active indicator: glow shadow (0 0 20px green/30)
- [ ] T7.3 — FAB central: pulsing glow animation
- [ ] T7.4 — Badge: scale animation ao aparecer

### Tasks Sidebar

- [ ] T7.5 — Active item: strip verde 3D na esquerda (3px border-left)
- [ ] T7.6 — Active item: shadow verde sutil
- [ ] T7.7 — Collapsed state: ícones com background mais contrastante

### Tasks Testing

- [ ] T7.8 — Verificar animações em 60fps (nenhum jank)
- [ ] T7.9 — Testar keyboard navigation (tab entre items)
- [ ] T7.10 — Testar focus ring visível
- [ ] T7.11 — Testar em mobile (bottom nav prominent)
- [ ] T7.12 — Testar em desktop (sidebar)
- [ ] T7.13 — Rodar `npm run quality:ci`

**Commit esperado:** `feat: S7 — navigation spring animations`

---

## 🎨 Sprint 8 — Inputs, Empty States, Notifications

**Objetivo:** Melhorar feedback visual de inputs, empty states com CTA proeminente, notificações animadas

**Status:** ⬜ Pendente

### Tasks Inputs

- [ ] T8.1 — Focus state: glow ring 3px rgba(34,197,94,0.15)
- [ ] T8.2 — Error state: shake animation leve
- [ ] T8.3 — Helper text: fade-in animation

### Tasks Empty States

- [ ] T8.4 — Icon: tamanho 48px
- [ ] T8.5 — Icon: container rounded-full bg-brand-primary/15
- [ ] T8.6 — CTA Button: size `lg` (h-14)
- [ ] T8.7 — Testar em mobile + desktop

### Tasks Notifications

- [ ] T8.8 — Entrada: slide-up + spring animation
- [ ] T8.9 — Status dot: pulse animation
- [ ] T8.10 — Dismiss: fade-out animation
- [ ] T8.11 — Testar auto-dismiss timing (3-5s)

### Tasks Testing

- [ ] T8.12 — Verificar animações respeita prefers-reduced-motion
- [ ] T8.13 — Testar input focus em iOS (keyboard not blocking)
- [ ] T8.14 — Testar empty state CTA é acessível
- [ ] T8.15 — Testar notificação screen reader friendly
- [ ] T8.16 — Rodar `npm run quality:ci`

**Commit esperado:** `feat: S8 — inputs + empty states + notifications`

---

## 🔬 Final Validation (pós-sprints)

- [ ] T9.1 — `npm run quality:ci` passa 100%
- [ ] T9.2 — `npm run smoke:auth:local` passa
- [ ] T9.3 — Build sucesso sem warnings
- [ ] T9.4 — Lighthouse ≥85 (Performance)
- [ ] T9.5 — WCAG AA passed (contraste ≥4.5:1)
- [ ] T9.6 — Keyboard nav testado (tab, arrow keys)
- [ ] T9.7 — Screen reader testado (VoiceOver)
- [ ] T9.8 — Visual test light + dark mode
- [ ] T9.9 — Visual test iPhone 14 + iPad + Desktop 1440px
- [ ] T9.10 — Version bumped (lib/version.ts + package.json)
- [ ] T9.11 — CHANGELOG.md atualizado
- [ ] T9.12 — Branch pushed para review

**Status:** ⬜ Pendente

---

## 📈 Progresso por Sprint

| Sprint | Total Tasks | Concluídas | Percentual | Status |
|--------|-------------|-----------|-----------|--------|
| S1 | 15 | 0 | 0% | ⬜ |
| S2 | 15 | 0 | 0% | ⬜ |
| S3 | 17 | 0 | 0% | ⬜ |
| S4 | 30 | 0 | 0% | ⬜ |
| S5 | 28 | 0 | 0% | ⬜ |
| S6 | 26 | 0 | 0% | ⬜ |
| S7 | 13 | 0 | 0% | ⬜ |
| S8 | 16 | 0 | 0% | ⬜ |
| **Final** | **12** | **0** | **0%** | **⬜** |
| **TOTAL** | **136** | **0** | **0%** | **⬜** |

---

## 🚀 Histórico de Deploys

| Data | Sprint | Versão | Commit | Arquivos | Status |
|------|--------|--------|--------|----------|--------|
| - | - | - | - | - | Não iniciado |

---

## 📝 Notas

- **Última atualização:** 10/04/2026
- **Criado por:** Claude Code (planejamento)
- **Para começar:** Ler IMPLEMENTATION-GUIDE.md e seguir Sprint 1
- **Perguntas?** Consultar PLAN.md ou DESIGN-TOKENS.md
