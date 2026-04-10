# VFIT Ultra v4 — QA Checklist

> **Documento:** Testes, verificações e critérios de aceitação por sprint  
> **Última atualização:** 10/04/2026  
> **Responsável por:** Quality assurance, validação, sign-off

---

## 📋 Estrutura de Testes

Cada sprint tem:
1. **Code Quality** — TypeScript, linting, build
2. **Visual** — light/dark mode, mobile/desktop
3. **Accessibility** — contraste WCAG, keyboard nav, screen readers
4. **Performance** — Lighthouse, Core Web Vitals
5. **Functional** — comportamento dos componentes

---

## 🔄 Sprint 1 — Tokens CSS + Botão Secondary

### Code Quality

- [ ] `npm run type:check` passa sem erros
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` sucede
- [ ] Nenhum warning no console do browser
- [ ] Tokens CSS validam como CSS válido

### Visual — Light Mode

- [ ] Botão secondary é **visível** em light mode (vs white background)
- [ ] Gradiente é de cima para baixo (from zinc-200 → to zinc-400)
- [ ] Shadow é visível (não desaparece)
- [ ] Text é legível (não desaparece na cor do botão)

### Visual — Dark Mode

- [ ] Botão secondary mantém bom contraste
- [ ] Shadow é visível contra background escuro
- [ ] Cor é diferenciada do primary

### Accessibility

- [ ] Contraste Button secondary vs white background: **≥3.5:1** (AA+)
  - Ferramenta: https://contrastchecker.com
  - Cores: zinc-200 (#e4e4e7) vs white (#ffffff)
- [ ] Contraste texto (zinc-800) vs botão: **≥4.5:1** (AA)
- [ ] Focus ring é visível ao tab
- [ ] Botão é acessível via keyboard (Enter/Space)

### Performance

- [ ] Lighthouse Score ≥90 (Performance)
- [ ] Nenhum CSS não-utilizado (tree-shaking funciona)
- [ ] Time to Interactive <3s no 4G

### Functional

- [ ] Token `--glass-v4-bg` é acessível em CSS (verificar em DevTools)
- [ ] Token `--btn-secondary-light-shadow` aplica corretamente
- [ ] Classe `.glass-ultra` renderiza com blur correto
- [ ] Keyframes `@keyframes lift` executa ao hover
- [ ] Keyframes `@keyframes glow-pulse` pulsa infinito

### Device Testing

- [ ] iPhone 14 (375px): botão visível e interativo
- [ ] iPad (768px): scaling correto
- [ ] Desktop (1440px): botão tem tamanho consistente
- [ ] Touch: botão é clicável (44x44px min)
- [ ] Landscape: layout não quebra

### Sign-Off Criteria

✅ **Sprint 1 PRONTO PARA DEPLOY quando:**
- Code quality passa
- Contraste ≥3.5:1 validado em 3+ tools
- Visual OK em light + dark
- Accessibility checklist 100%
- Device testing 100%

---

## 🎨 Sprint 2 — GlassCard v4

### Code Quality

- [ ] `npm run type:check` passa (variantes tipadas)
- [ ] `npm run lint` passa
- [ ] Novo tipo `GlassCardVariant` inclui `'ultra' | 'depth'`
- [ ] Nenhuma variante foi quebrada (regressão)

### Visual — Ultra Variant

- [ ] Blur é **40px** (mais intenso que regular 24px)
- [ ] Border top é visível (white/18)
- [ ] Shine effect é visível (diagonal 135deg)
- [ ] Shadow externo é mais pronunciado (0 8px 40px)
- [ ] Cor de fundo é mais escura (rgba 0.55 vs 0.45)

### Visual — Depth Variant

- [ ] Border top-left é claro (diferenciado)
- [ ] Border bottom-right é escuro (diferenciado)
- [ ] Efeito 3D é visível (parece elevado)
- [ ] Shadow dupla (externa escura + interna clara)

### Visual — Hover State

- [ ] Ultra: lift animation (translateY -3px)
- [ ] Ultra: glow aumenta ao hover
- [ ] Depth: mantém 3D ao hover
- [ ] Transição é smooth (não snap)

### Accessibility

- [ ] Contraste fundo/borda ≥3:1
- [ ] Focus ring é visível em ambas variantes
- [ ] Texto dentro é legível (≥4.5:1 vs background)

### Functional

- [ ] `<GlassCard variant="ultra">` renderiza como `.glass-ultra`
- [ ] `<GlassCard variant="depth">` renderiza como `.glass-depth`
- [ ] Variantes antigas (`glass`, `elevated`, etc) continuam funcionando
- [ ] Pseudo-elemento `::before` (shine) não afeta interatividade

### Device Testing

- [ ] iPhone 14: blur não causa lag, shine é visível
- [ ] iPad: layout não quebracom cards maiores
- [ ] Desktop 4K: blur performance OK

### Sign-Off Criteria

✅ **Sprint 2 PRONTO PARA DEPLOY quando:**
- 100% visual checklist (ultra + depth + hover)
- Nenhuma regressão (variantes antigas OK)
- Performance OK (nenhum jank)
- Accessibility 100%

---

## 📊 Sprint 3 — KPI Cards

### Code Quality

- [ ] Props tipad corretamente (`color: 'blue' | 'cyan' | 'purple' | 'amber'`)
- [ ] `trend` prop é optional (não quebra se não passado)
- [ ] Componente renderiza sem erros de tipo
- [ ] Nenhuma dependência circular (imports)

### Visual — Icon Container

- [ ] Icon tem background colorido (não transparent)
- [ ] Icon background tem saturação consistente (opacity 0.15)
- [ ] Icon é centered no container
- [ ] Container é 40x40px (h-10 w-10)

### Visual — Label

- [ ] Label é `text-xs` (12px)
- [ ] Label é `text-zinc-400` (melhor contraste vs zinc-500)
- [ ] Label é legível em light + dark mode

### Visual — Trend Badge

- [ ] Trend badge mostra delta (ex: "+5%")
- [ ] Trend badge mostra seta ("↑" ou "↓")
- [ ] Positivo: cor verde com background verde/15
- [ ] Negativo: cor vermelha com background red/15
- [ ] Badge é arredondado (rounded-full)

### Visual — Colors

- [ ] Blue (passos): azul (#3b82f6) — visível e vibrante
- [ ] Cyan (água): cyan (#06b6d4) — visível e vibrante
- [ ] Purple (sono): violet (#8b5cf6) — visível e vibrante
- [ ] Amber (calorias): amber (#d97706) — visível e vibrante
- [ ] Em light + dark mode, cores são consistentes

### Accessibility

- [ ] Icon + label = compreensão clara do que é cada card
- [ ] Contraste label vs background ≥4.5:1
- [ ] Contraste icon vs background ≥4.5:1
- [ ] Contraste trend badge ≥3:1 (large text)
- [ ] Color não é única forma de comunicar trend (icon + seta importante)

### Functional

- [ ] Ao passar `color="blue"`, card rende com cores azuis
- [ ] Ao passar `trend={{ delta: 12, isPositive: true }}`, mostra "↑ 12%"
- [ ] Ao passar `trend={{ delta: -5, isPositive: false }}`, mostra "↓ 5%"
- [ ] Card é clicável (onClick funciona)
- [ ] Card mantém estado visual ao hover (scale+shadow)

### Performance

- [ ] Renderização de 4 cards: <200ms
- [ ] Nenhum memory leak ao mount/unmount múltiplas vezes
- [ ] Tailwind classes são built-time (não dinâmicas)

### Device Testing

- [ ] iPhone 14 (2 cols): cards cabem sem overflow
- [ ] iPad (3-4 cols): scaling correto
- [ ] Desktop 1440px (4 cols): layout correto
- [ ] Touch: cards são clicáveis (44x44px min touch area)

### Sign-Off Criteria

✅ **Sprint 3 PRONTO PARA DEPLOY quando:**
- Props tipadas corretamente (TypeScript strict)
- Todas as cores renderizam corretamente
- Trend badge funciona em ambas direções
- Accessibility 100% (contraste + color not alone)
- Visual OK em 3+ devices

---

## 🏋️ Sprint 4 — Página Treinos

### Code Quality

- [ ] Página compila sem erros TypeScript
- [ ] Não há console errors ao carregar página
- [ ] Componentes importados corretamente (sem typos)

### Visual — Hero Card (Treino do Dia)

- [ ] Card usa `.glass-ultra` (blur visível)
- [ ] Strip verde 3px na esquerda é visível
- [ ] ProgressRing é 160x160 (maior que antes)
- [ ] Próximo exercício é mostrado
- [ ] CTA button é proeminente (size `lg`)

### Visual — KPI Grid

- [ ] 4 cards em grid 2x2
- [ ] Cada card tem cor diferente (blue, cyan, purple, amber)
- [ ] Icons têm backgrounds coloridos
- [ ] Trend badges mostram deltas corretamente

### Visual — Nutrição Card

- [ ] Header tem gradiente amber
- [ ] Progress bar é animada (spring animation)
- [ ] Macros secundárias (carbs, gordura) mostram valores
- [ ] Layout é organizado e não overcrowded

### Visual — Avaliação Card

- [ ] Header tem gradiente violet
- [ ] Emoji rating buttons (4 opções)
- [ ] CTA button é proeminente
- [ ] Hover states em emojis (scale)

### Visual — Templates Section

- [ ] Thumbnails têm gradientes coloridos
- [ ] Ícone DSIcon é visível
- [ ] Hover scale effect funciona
- [ ] Labels de duração/dificuldade são visíveis

### Accessibility

- [ ] Ordem visual = ordem TAB (keyboard nav)
- [ ] Contraste CTA ≥4.5:1
- [ ] Emoji rating tem labels visíveis (não só emoji)
- [ ] ProgressRing tem label acessível (aria-label)
- [ ] Links/buttons têm focus visible

### Functional

- [ ] KPICard com color="blue" renderiza azul
- [ ] Trend badge mostra seta correta
- [ ] ProgressRing animado ao mount (scale-spring)
- [ ] Templates clicáveis (onClick funciona)
- [ ] Layout responsivo em mobile

### Performance

- [ ] Página carrega em <2s
- [ ] Lighthouse ≥85 (Performance)
- [ ] Nenhuma layout shift (CLS <0.1)
- [ ] Imagens são lazy-loaded (abaixo do fold)

### Device Testing

- [ ] iPhone 14 (375px): cards cabem sem horizontal scroll
- [ ] iPhone 14 landscape: layout ajusta
- [ ] iPad (768px): 2-3 cols OK
- [ ] Desktop 1440px: spacing é generoso
- [ ] Touch: todos os botões são 44x44px+

### Sign-Off Criteria

✅ **Sprint 4 PRONTO PARA DEPLOY quando:**
- Visual 100% em light + dark
- Accessibility keyboard nav + contrast OK
- Performance Lighthouse ≥85
- Responsiveness testada em 3+ devices
- Nenhuma regressão de funcionalidade anterior

---

## 📋 Sprint 5 — Página Plano

### Code Quality

- [ ] **ZERO** uso de `style={{ backgroundColor: ... }}`
- [ ] **ZERO** referências a `MUSCLE_COLORS` hardcoded
- [ ] Todas as cores usam tokens CSS
- [ ] MuscleChip renderiza corretamente

### Visual — Header Greeting

- [ ] Texto é colorido (gradiente brand-primary → brand-mint)
- [ ] Fonte é maior (text-4xl) e mais bold (font-black)
- [ ] Motivational phrase é visível abaixo

### Visual — Day Selector Tabs

- [ ] Active tab tem indicator visível
- [ ] Indicator é 3D (pill com sombra, não border-bottom)
- [ ] Transição é smooth (spring)
- [ ] Inactive tabs estão claros mas visíveis

### Visual — MuscleChip

- [ ] Icon visível (DSIcon, não emoji)
- [ ] Label capitalizado
- [ ] Ativo: cor temática + shadow glow
- [ ] Inativo: white/8 background
- [ ] Hover: scale 105

### Visual — ExerciseCard

- [ ] Thumbnail com gradiente por grupo muscular
- [ ] Ícone DSIcon do grupo visível
- [ ] Difficulty badge colorido
- [ ] Sets x Reps em badge
- [ ] Hover: scale 105

### Accessibility

- [ ] MuscleChip com ícone + label (color not alone)
- [ ] ExerciseCard imagem tem alt text
- [ ] Difficulty badges têm cores diferentes + text (color not alone)
- [ ] Contraste ≥4.5:1 todos elementos de texto
- [ ] Keyboard nav funciona (tab entre cards)

### Functional

- [ ] MuscleChip onClick filtra exercícios
- [ ] ExerciseCard onClick abre detalhe
- [ ] Day selector funciona (troca a semana)
- [ ] Sem erro de TypeScript/TypeErrors

### Performance

- [ ] Página carrega em <2s
- [ ] Scroll smooth (60fps)
- [ ] Nenhum CLS (layout shifts)

### Device Testing

- [ ] iPhone 14: layout single col
- [ ] iPad: layout 2 cols
- [ ] Desktop 1440px: layout 3+ cols
- [ ] Touch: MuscleChip + cards são clicáveis

### Sign-Off Criteria

✅ **Sprint 5 PRONTO PARA DEPLOY quando:**
- **ZERO** inline styles ou hardcoded colors
- MuscleChip rende com DSIcon (ZERO emoji)
- ExerciseCard rende com glassmorfismo temático
- Accessibility 100%
- Responsiveness testada em 3+ devices

---

## 🔍 Sprint 6 — Página Exercícios

### Code Quality

- [ ] **ZERO** referências a `MUSCLE_EMOJI`
- [ ] Todas as ícones usam `<DSIcon>`
- [ ] Nenhum console error
- [ ] TypeScript strict mode OK

### Visual — Tabs

- [ ] Tabs têm ícones visíveis
- [ ] Active tab tem indicator com sombra
- [ ] Transição é smooth (Framer Motion)

### Visual — Filter Chips

- [ ] Chips têm ícone DSIcon + label
- [ ] Ativo: cor temática + glow shadow
- [ ] Inativo: white/8 background
- [ ] Hover: escurece background

### Visual — Exercise Grid

- [ ] Cards têm thumbnails com gradiente
- [ ] Thumbnails têm ícone DSIcon visível
- [ ] Difficulty badges são coloridos
- [ ] Layout responsivo (2 cols mobile, 3+ desktop)
- [ ] Animação staggered (cards aparecem em sequência)

### Visual — Detail Page

- [ ] Hero section tem gradiente do grupo muscular
- [ ] Info chips mostram dificuldade, grupo, equipamento
- [ ] Instructions têm step badges numerados
- [ ] CTA button é fixo no bottom

### Accessibility

- [ ] Ícones têm aria-label (não só visual)
- [ ] Difficulty color + text (color not alone)
- [ ] Contraste ≥4.5:1
- [ ] Keyboard nav funciona (tabs, filters, card selection)
- [ ] Screen reader friendly (role, aria-label)

### Functional

- [ ] Filter chip onClick filtra exercícios
- [ ] Grid atualiza ao mudar filtro
- [ ] Card onClick abre detail page
- [ ] Detail page volta ao clicar back
- [ ] Todas as cores carregam corretamente

### Performance

- [ ] Página lista carrega em <2s
- [ ] Grid scroll é smooth (60fps)
- [ ] Detail page carrega em <1s
- [ ] Nenhum jank ao filtrar

### Device Testing

- [ ] iPhone 14: 2 cols, touch-friendly
- [ ] iPad: 3 cols
- [ ] Desktop 1440px: 4-5 cols
- [ ] Landscape: não quebra layout

### Sign-Off Criteria

✅ **Sprint 6 PRONTO PARA DEPLOY quando:**
- **ZERO** MUSCLE_EMOJI no codebase
- Todas as ícones são DSIcon
- Cores temáticas carregam corretamente
- Accessibility 100%
- Responsiveness testada em 3+ devices

---

## 🧭 Sprint 7 — Navigation

### Functional

- [ ] Bottom nav active indicator anima com spring
- [ ] FAB central tem pulsing glow
- [ ] Badge animada ao aparecer (scale)
- [ ] Sidebar active item tem strip 3D verde
- [ ] Collapsed state mantém funcionalidade

### Accessibility

- [ ] Focus ring visível em todos nav items
- [ ] Active indicator é semanticamente marcado (aria-current)
- [ ] Keyboard nav funciona (tab, arrow keys)

### Sign-Off Criteria

✅ **Sprint 7 PRONTO quando:**
- Todas animações executam smoothly (60fps)
- Accessibility OK
- Mobile + desktop OK

---

## 🎨 Sprint 8 — Inputs, Empty States, Notifications

### Functional

- [ ] Input focus glow ring é visível
- [ ] Input error shake animation executa
- [ ] Helper text fade-in é smooth
- [ ] Empty state CTA é tamanho `lg`
- [ ] Notification entrada anima (slide-up + spring)
- [ ] Notification dismiss anima (fade-out)

### Accessibility

- [ ] Input focus ring é visível (≥2px)
- [ ] Error message associada ao input
- [ ] Empty state CTA é keyboard accessible
- [ ] Notification aria-live para screen readers

### Sign-Off Criteria

✅ **Sprint 8 PRONTO quando:**
- Todas animações 150-300ms
- Accessibility 100%
- Responsiveness OK

---

## 🎯 Final Gate — Pronto para Deploy

### Full Stack Quality

- [ ] Todos 8 sprints têm **✅** sign-off
- [ ] `npm run quality:ci` passa 100%
- [ ] `npm run smoke:auth:local` passa
- [ ] Build sucesso
- [ ] Lighthouse ≥85 (Performance)

### Final Visual Test

- [ ] Light mode: OK em 3+ devices
- [ ] Dark mode: OK em 3+ devices
- [ ] Responsiveness: mobile, tablet, desktop OK
- [ ] Animações: smooth 60fps, respeitando prefers-reduced-motion

### Final Accessibility Audit

- [ ] WCAG AA standard passed (contrast ≥4.5:1)
- [ ] Keyboard navigation completo
- [ ] Screen reader tested (VoiceOver / NVDA)
- [ ] Color not alone para meaningful info

### Final Documentation

- [ ] TRACKING.md 100% completo (8/8 sprints ✅)
- [ ] CHANGELOG.md atualizado com versão + mudanças
- [ ] Commit messages de qualidade (Conventional Commits)
- [ ] PR description clara + screenshots

### 🚀 DEPLOY CHECKLIST

```bash
# 1. Quality gate
npm run quality:ci        ✅ PASSA

# 2. Build
npm run build            ✅ SUCESSO

# 3. Smoke auth
npm run smoke:auth:local ✅ PASSA

# 4. Git status
git status               ✅ CLEAN

# 5. Versão
lib/version.ts           ✅ BUMPED (v2.2.3)
package.json             ✅ BUMPED (v2.2.3)

# 6. Docs
CHANGELOG.md             ✅ UPDATED
.claude/docs/RULES.md    ✅ IF CHANGED

# 7. Commit + push
git add .
git commit -m "release: v2.2.3 — VFIT Ultra v4 UX redesign (8 sprints)"
git push origin main

# 8. Deploy
npm run cf:deploy        ✅ START (com confirmação do user)
```

---

## 📞 Emergency Fixes

Se um sprint quebra em produção:

```bash
# 1. Revert imediato
git revert HEAD
npm run cf:deploy        # rollback

# 2. Post-mortem
# - O que quebrou?
# - Por que QA não pegou?
# - Adicionar ao QA checklist?

# 3. Fix + redeploy
# - Fichar bug em TRACKING.md
# - Fixar em branch
# - Rodar QA completo NOVAMENTE
# - Deploy com cuidado extra
```
