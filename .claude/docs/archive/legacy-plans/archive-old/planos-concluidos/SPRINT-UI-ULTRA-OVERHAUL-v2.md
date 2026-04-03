# 🎬 SPRINT UI ULTRA OVERHAUL v2 — VFIT v4.8.1 → v4.9.x

> **Criado:** 08/03/2026 · **Baseado em:** Auditoria Ultra-Completa de 21 seções
> **Objetivo:** Transformar CADA pixel do app em referência visual moderna
> **Método:** Sprints incrementais, cada um deployável independentemente
> **Status:** Sprints 1-12 ✅ TODOS COMPLETOS · Build limpo · Pendente deploy

---

## 📊 RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| **Total de Sprints** | 12 |
| **Total de Tarefas** | 58 |
| **Arquivos estimados** | ~45 arquivos (13 novos, ~32 modificados) |
| **Prioridade** | Impacto visual × Frequência de uso × Complexidade |
| **Stack de animação** | Framer Motion (já instalado) + CSS @keyframes + Web APIs |

### Legenda de Prioridade
- 🔴 **P0 — Crítico**: Visto em TODA navegação (header, nav, sidebar)
- 🟠 **P1 — Alto**: Páginas mais acessadas (dashboard, alunos, treinos)
- 🟡 **P2 — Médio**: Páginas frequentes (financeiro, cobranças, agenda)
- 🟢 **P3 — Baixo**: Páginas secundárias (logs, marketplace, IA, afiliados)

---

## 🗺️ MAPA: AUDITORIA → SPRINT

| Seção da Auditoria | Sprint | Prioridade |
|---------------------|--------|:----------:|
| 1. Header / Top Bar | Sprint 1 | 🔴 P0 |
| 2. Sidebar / Menu Lateral | Sprint 2 | 🔴 P0 |
| 3. Bottom Navigation Bar | Sprint 3 | 🔴 P0 |
| 21. Melhorias Globais (tokens, sombras, easings) | Sprint 4 | 🔴 P0 |
| 4. Página Alunos (Lista) | Sprint 5 | 🟠 P1 |
| 5. Detalhes do Aluno | Sprint 6 | 🟠 P1 |
| 6. Página Treinos | Sprint 7 | 🟠 P1 |
| 10. Dashboard Financeiro | Sprint 8 | 🟡 P2 |
| 11. Cobranças (Payments) | Sprint 8 | 🟡 P2 |
| 7. Biblioteca de Exercícios | Sprint 9 | 🟡 P2 |
| 8. Avaliações Físicas | Sprint 9 | 🟡 P2 |
| 9. Agenda / Calendário | Sprint 10 | 🟡 P2 |
| 12. Mensagens | Sprint 10 | 🟡 P2 |
| 13. Notificações | Sprint 10 | 🟡 P2 |
| 15. Configurações | Sprint 11 | 🟢 P3 |
| 14. IA Assistente | Sprint 11 | 🟢 P3 |
| 16. Afiliados | Sprint 11 | 🟢 P3 |
| 17. Marketplace | Sprint 11 | 🟢 P3 |
| 18. Logs | Sprint 11 | 🟢 P3 |
| 19. Convidar Aluno | Sprint 11 | 🟢 P3 |
| 20. FAB (IA Assistente) | Sprint 12 | 🟢 P3 |
| 21. Transições de página | Sprint 12 | 🟢 P3 |
| 21. Haptic + Performance | Sprint 12 | 🟢 P3 |

---

## SPRINT 1 — Header Ultra Premium 🔴 P0

> **Impacto:** Visível em 100% das páginas · 1 arquivo principal + globals.css
> **Estimativa:** ~2h · **Deploy:** Independente

### Estado Atual (Auditoria)
- Header usa classe `.header-surface` (blur 48px, saturate 220%, border 0.08)
- Breadcrumb estático, sem animação
- Notification badge vermelho sem pulse
- Avatar sem ring de status
- Hamburger sem morphing animation
- Sem sombra progressiva no scroll

### Tarefas

| # | Tarefa | Arquivo | Detalhe Técnico |
|---|--------|---------|-----------------|
| 1.1 | **Sombra progressiva no scroll** | `header.tsx` | `IntersectionObserver` ou `useScroll` do Framer Motion para detectar scroll > 0. Adicionar classe `.header-scrolled` com `box-shadow: 0 1px 12px rgba(0,0,0,0.06)` transitando via CSS. State: `const [scrolled, setScrolled] = useState(false)` |
| 1.2 | **Breadcrumb animado** | `header.tsx` | Separadores chevron com `motion.span` e micro-hover `whileHover={{ scale: 1.05 }}`. Cada item clicável com `hover:text-brand-primary transition-colors` |
| 1.3 | **Notification badge pulse** | `header.tsx` | Adicionar `animate-pulse` ou keyframe `pulse-ring` customizado no badge vermelho quando `count > 0`. Ring externo com `@keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4) } 100% { box-shadow: 0 0 0 8px transparent } }` |
| 1.4 | **Avatar ring de status** | `header.tsx` | Ring verde 2px com gradiente animado `conic-gradient` ao redor do avatar. Classes: `ring-2 ring-green-500` com glow `shadow-[0_0_8px_rgba(34,197,94,0.3)]` |
| 1.5 | **Hamburger morphing** | `header.tsx` | CSS transition das 3 linhas → X. Usar `transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)` com classes condicionais `isOpen` que rotam +45°/-45° e escondem linha central |

### Critério de Aceite ✅ v4.8.2
- [x] Header ganha sombra ao rolar e perde ao voltar ao topo
- [x] Breadcrumbs com hover colorido e chevrons animados
- [x] Badge de notificação pulsa quando há notificações
- [x] Avatar com ring verde de status online
- [x] Hamburger transiciona suavemente para X quando drawer abre

---

## SPRINT 2 — Sidebar Cinema Premium 🔴 P0

> **Impacto:** Desktop: visível em 100% das páginas · Mobile drawer
> **Estimativa:** ~2.5h · **Deploy:** Independente

### Estado Atual (Auditoria)
- Sidebar usa `.sidebar-premium` (gradient #0D1324→#070C18, shadow 32px)
- Seções em caps lock texto simples (PRINCIPAL, FINANCEIRO, etc.)
- Ícones monocromáticos (todos mesma cor)
- Hover genérico (bg-white/4)
- Perfil do usuário com glow ring básico
- Mobile drawer entra da DIREITA com Framer spring

### Tarefas

| # | Tarefa | Arquivo | Detalhe Técnico |
|---|--------|---------|-----------------|
| 2.1 | **Hover com gradiente direcional** | `sidebar.tsx` | Cada item de menu: `hover:bg-gradient-to-r hover:from-white/8 hover:to-transparent hover:translate-x-1 transition-all duration-200`. Substituir `hover:bg-white/6` por gradiente |
| 2.2 | **Item ativo com borda-esquerda glow** | `sidebar.tsx` | Item ativo: left border 3px com `bg-brand-primary` + `box-shadow: 0 0 20px rgba(34,197,94,0.15)`. Já existe pill animado — adicionar borda lateral + glow |
| 2.3 | **Dividers decorativos nas seções** | `sidebar.tsx` | Substituir texto CAPS simples por: `<div>` com linha gradiente `divider-gradient` (já existe no globals.css!) + texto muted acima |
| 2.4 | **Ícones coloridos por seção** | `sidebar.tsx` | Map de cores: Principal → `text-emerald-400`, Financeiro → `text-amber-400`, Inteligência → `text-violet-400`, Outros → `text-slate-400`, Admin → `text-purple-400`. Aplicar via prop de seção |
| 2.5 | **Card de perfil glassmorphism** | `sidebar.tsx` | Avatar maior (lg→xl), badge de role (Admin/Personal/Aluno) como `<Badge variant="premium">`, indicador de plano (Free/Pro) com ícone |
| 2.6 | **Transição drawer mobile refinada** | `mobile-nav.tsx` | Ajustar cubic-bezier para `transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)`. Overlay escuro com `motion.div` fade-in separado |

### Critério de Aceite ✅ v4.8.2
- [x] Hover em menu items desliza gradiente para direita
- [x] Item ativo tem borda verde esquerda com glow
- [x] Seções separadas por linha gradiente decorativa
- [x] Ícones com cores distintas por seção
- [x] Perfil mostra badge de role e plano
- [x] Drawer mobile abre com curva suave

---

## SPRINT 3 — Bottom Nav Ultra 🔴 P0

> **Impacto:** Mobile: visível em 100% das páginas · ~820 linhas no arquivo
> **Estimativa:** ~2h · **Deploy:** Independente

### Estado Atual (Auditoria)
- Bottom nav usa `.nav-premium` (blur 52px, saturate 220%, glow 32px)
- FAB central com `fab-pulse` animation e gradient
- MD3 pill indicator com layoutId (já funciona)
- SVG icons custom com filled/outline states
- Safe-area PWA handling
- Haptic feedback via navigator.vibrate

### Tarefas

| # | Tarefa | Arquivo | Detalhe Técnico |
|---|--------|---------|-----------------|
| 3.1 | **FAB 3D aprimorado** | `mobile-nav.tsx` | Sombra: `box-shadow: 0 8px 32px rgba(34,197,94,0.4), 0 2px 8px rgba(0,0,0,0.1)`. Anel glow pulsante externo com pseudo-element `::after` e `pulse-ring` animation |
| 3.2 | **Ripple effect no FAB** | `mobile-nav.tsx` | Implementar ripple CSS: `::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: rgba(255,255,255,0.3); transform: scale(0); }` com `.active::after { animation: ripple 0.5s }` |
| 3.3 | **Bounce sutil ao selecionar tab** | `mobile-nav.tsx` | Adicionar `whileTap={{ scale: 0.9 }}` e no callback de seleção `motion.animate(el, { y: [-2, 0] }, { type: 'spring' })` |
| 3.4 | **Indicador pill no topo do ícone** | `mobile-nav.tsx` | Mover pill de fundo (atrás do ícone) para barra superior: `<motion.div layoutId="nav-pill-top" className="absolute -top-1 h-[3px] w-8 rounded-full bg-brand-primary" />` ACIMA do ícone ativo |
| 3.5 | **Glassmorphism da barra refinado** | `globals.css` | `.nav-premium` já está forte. Adicionar: `border-top: 1px solid rgba(255,255,255,0.04)` para light mode. Verificar safe-area `padding-bottom: env(safe-area-inset-bottom)` |

### Critério de Aceite ✅ v4.8.2
- [x] FAB tem sombra 3D pronunciada com anel pulsante
- [x] Tap no FAB mostra ripple materializado
- [x] Selecionar tab faz bounce sutil
- [x] Pill indicator como barra superior de 3px verde
- [x] Borda superior sutil na bottom bar

---

## SPRINT 4 — Design Tokens Globais 🔴 P0

> **Impacto:** Base para todos os sprints seguintes · globals.css
> **Estimativa:** ~1.5h · **Deploy:** Independente (não-breaking)

### Estado Atual (Auditoria)
- 7 shadow tokens + 4 específicos (card-glow, glass-premium, etc.)
- 16 animation tokens, 18 keyframes
- Radius tokens de sm a 2xl
- Não existe sistema de elevação unificado (1-5)
- Não existe sistema de easings nomeados
- Cores semânticas parciais (status-success/warning/error/info existem)

### Tarefas

| # | Tarefa | Arquivo | Detalhe Técnico |
|---|--------|---------|-----------------|
| 4.1 | **Sistema de elevação 5 níveis** | `globals.css` | Adicionar ao `@theme`: `--shadow-elevation-1: 0 1px 2px rgba(0,0,0,0.05); --shadow-elevation-2: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04); --shadow-elevation-3: 0 12px 28px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04); --shadow-elevation-4: 0 24px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05); --shadow-elevation-5: 0 40px 64px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)` |
| 4.2 | **Easings nomeados** | `globals.css` | `--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1); --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` no @theme |
| 4.3 | **Durações padronizadas** | `globals.css` | `--duration-fast: 150ms; --duration-normal: 250ms; --duration-slow: 400ms; --duration-entrance: 500ms` |
| 4.4 | **Cores semânticas completas** | `globals.css` | Já existem `--color-status-*`. Adicionar aliases: `--color-ai: #8B5CF6` (roxo IA), `--color-whatsapp: #25D366`. Criar 5 tonalidades para cada status (50/100/200/500/900) |
| 4.5 | **Border-radius padronizado** | `globals.css` | Documentar e adicionar aliases utilitários: `--radius-card: 16px; --radius-card-sm: 12px; --radius-input: 8px; --radius-pill: 999px` |
| 4.6 | **Utility classes globais** | `globals.css` | `.hover-lift { transition: transform var(--duration-normal) var(--ease-smooth); } .hover-lift:hover { transform: translateY(-2px); }`. `.hover-lift-lg:hover { transform: translateY(-4px); }`. `.fade-in-up { animation: fade-in 0.3s, slide-up 0.3s; }` |

### Critério de Aceite ✅ v4.8.2
- [x] 5 níveis de sombra documentados e disponíveis
- [x] 4 easings nomeados disponíveis como CSS vars
- [x] Durações padronizadas para micro/normal/slow/entrance
- [x] Cor de IA (violet) e WhatsApp adicionadas
- [x] Utility classes hover-lift prontas para uso

---

## SPRINT 5 — Página Alunos (Lista) 🟠 P1

> **Impacto:** Página mais acessada por personais · Lista principal do app
> **Estimativa:** ~3h · **Deploy:** Independente

### Estado Atual (Auditoria)
- Cards com inline Tailwind, sem componente extraído
- Avatar com iniciais, Badge status ATIVO/INATIVO
- Borda esquerda verde sutil
- Sem animação de entrada ou hover 3D
- Campo de busca simples
- Botões "Convidar" e "Novo Aluno" sem micro-interactions
- Sem skeleton loading dedicado
- Pull-to-refresh já existe no componente global

### Tarefas

| # | Tarefa | Arquivo(s) | Detalhe Técnico |
|---|--------|------------|-----------------|
| 5.1 | **Card de aluno com elevação 3D** | `students/page.tsx` ou componente de lista | `shadow-elevation-2` default → `shadow-elevation-3` hover. `whileHover={{ y: -2 }}` com `transition: { type: 'spring', stiffness: 300 }` |
| 5.2 | **Avatar com ring de status** | Componente de card | Ring colorido: verde ATIVO (com `shadow-[0_0_8px_rgba(16,185,129,0.3)]`), vermelho INATIVO, amarelo PENDENTE |
| 5.3 | **Badges animados** | Componente de card | Badge ATIVO: `bg-emerald-500/12 text-emerald-600` com ícone check inline. Badge INATIVO: `bg-gray-500/12 text-gray-500` com ícone pause. Usar componente Badge existente |
| 5.4 | **Staggered list entrance** | `students/page.tsx` | Envolver lista com `StaggeredList` (já existe!) ou `motion.div` com staggerChildren: 0.05 |
| 5.5 | **Skeleton shimmer dedicado** | `students/page.tsx` | Criar skeleton específico com 3-4 cards shimmer (similar ao `StatsGridSkeleton` do dashboard) |
| 5.6 | **Botões com micro-interactions** | `students/page.tsx` | "Convidar Aluno": ícone com `whileHover={{ rotate: 15 }}`. "Novo Aluno": ícone com `whileHover={{ scale: 1.1 }}` |
| 5.7 | **Filtro com indicator dot** | `students/page.tsx` | Quando filtros ativos, dot verde no ícone de funil: `<span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-brand-primary" />` |
| 5.8 | **Indicador de último acesso** | Componente de card | Dot de presença: verde = última semana, amarelo = último mês, cinza = +30 dias. Calcular com `dayjs` |

### Critério de Aceite
- [ ] Cards elevam ao hover/touch com spring animation
- [ ] Avatar mostra ring colorido por status
- [ ] Badges ATIVO/INATIVO com ícones e cores distintas
- [ ] Lista entra com staggered animation
- [ ] Skeleton shimmer enquanto carrega
- [ ] Botões de ação com micro-animações no hover
- [ ] Indicador visual de filtros ativos
- [ ] Dot de presença mostra recência do acesso

---

## SPRINT 6 — Detalhes do Aluno 🟠 P1

> **Impacto:** Tela de detalhe mais importante · Onde personal passa mais tempo
> **Estimativa:** ~3h · **Deploy:** Independente

### Tarefas

| # | Tarefa | Arquivo(s) | Detalhe Técnico |
|---|--------|------------|-----------------|
| 6.1 | **Header do perfil com gradiente** | `students/view/page.tsx` | Gradiente sutil verde→transparente no card topo. Avatar com borda gradiente animada `conic-gradient` |
| 6.2 | **Badges com fade-in + slide** | `students/view/page.tsx` | `motion.span` com `initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}` |
| 6.3 | **Botão CRIAR TREINO shimmer** | `students/view/page.tsx` | Manter gradient verde, adicionar shimmer overlay com `::after` e `animation: shimmer 2s infinite` (keyframe já existe) |
| 6.4 | **Quick actions 3D coloridos** | `students/view/page.tsx` | Editar=azul, Enviar App=verde, Avaliação=roxo, WhatsApp=#25D366. Cada card com `whileTap={{ scale: 0.95 }}` e spring. Sombra colorida per-action |
| 6.5 | **Métricas grid 2×2 com gradientes** | `students/view/page.tsx` | Reorganizar cards: Treinos (verde), Último acesso (azul), Badges (roxo), Streak (laranja). Cada um com fundo gradiente sutil. Números com `AnimatedCounter` (já existe!) |
| 6.6 | **Calendário com indicadores visuais** | `students/view/page.tsx` | Dias com treino: dot verde. Dia atual: ring pulsante. Transição mês: slide horizontal com Framer |
| 6.7 | **Seção Informações como cards** | `students/view/page.tsx` | Substituir tabela por cards com ícones inline. "Não informado" em `italic text-muted` em vez de traço |
| 6.8 | **Seção Pagamentos com ícones de status** | `students/view/page.tsx` | Cards com: verde+check = pago, vermelho+alert = pendente, amarelo+clock = vencendo |

### Critério de Aceite
- [ ] Header do perfil com gradiente e avatar animado
- [ ] Badges entram com animação slide
- [ ] Botão CRIAR TREINO com shimmer contínuo
- [ ] Quick actions coloridos com scale press
- [ ] Métricas em grid 2×2 com countUp
- [ ] Calendário com indicadores de atividade
- [ ] Informações como cards com ícones
- [ ] Pagamentos com status visual colorido

---

## SPRINT 7 — Página Treinos 🟠 P1

> **Impacto:** Core do app · Criação e visualização de treinos
> **Estimativa:** ~2h · **Deploy:** Independente

### Tarefas

| # | Tarefa | Arquivo(s) | Detalhe Técnico |
|---|--------|------------|-----------------|
| 7.1 | **Banners de ação com 3D hover** | `workouts/page.tsx` | Gradientes mais vibrantes + `perspective(800px)`. Ícone com `animation: float 3s infinite`. Sombra colorida per-banner |
| 7.2 | **Estado vazio aprimorado** | `workouts/page.tsx` | Usar `EmptyState` com illustration "workouts" (já existe SVG). CTA pulsante com glow verde |
| 7.3 | **Cards de treino premium** | `workouts/page.tsx` | Quando há treinos: card com nome, aluno, progress ring (SVG circle com stroke-dasharray animado), data, thumbnails de exercícios |
| 7.4 | **Skeleton shimmer para lista** | `workouts/page.tsx` | 2-3 skeleton cards com shimmer (layout: banner + list) |

### Critério de Aceite
- [ ] Banners com hover 3D, ícone flutuante, sombra colorida
- [ ] Estado vazio com animação e CTA pulsante
- [ ] Cards de treino com progress visual
- [ ] Skeleton enquanto carrega

---

## SPRINT 8 — Dashboard Financeiro + Cobranças 🟡 P2

> **Impacto:** Área financeira completa do personal
> **Estimativa:** ~3h · **Deploy:** Independente

### Tarefas

| # | Tarefa | Arquivo(s) | Detalhe Técnico |
|---|--------|------------|-----------------|
| 8.1 | **KPI cards grid 2×2** | `financeiro/page.tsx` | Reorganizar em grid. Cada card: ícone grande colorido esquerda, valor bold, micro-sparkline direita. Crescimento negativo: fundo `bg-red-500/5`, seta vermelha |
| 8.2 | **Gráficos area chart com gradiente** | `financeiro/page.tsx` + charts/ | Adicionar `<defs><linearGradient>` no Recharts para gradient fill abaixo da linha. Animação draw-in com `isAnimationActive` |
| 8.3 | **Tooltip estilizado nos gráficos** | Charts components | Custom tooltip com glassmorphism card, borda verde, sombra |
| 8.4 | **Cobranças: cards resumo com shimmer** | `payments/page.tsx` | 4 cards topo com skeleton shimmer → fade-in. Design: gradiente colorido, ícone, valor bold. Recebidos=verde, Pendentes=amarelo, Vencidos=vermelho, Total=azul |
| 8.5 | **Lista de cobranças premium** | `payments/page.tsx` | Avatar aluno, nome bold, badge status (chip colorido animado), método com ícone (PIX/cartão logo), valor destaque direita |
| 8.6 | **Filtros como chips horizontais** | `payments/page.tsx` | Substituir dropdowns por chips scrolláveis: `<ScrollArea orientation="horizontal">` com chips coloridos |

### Critério de Aceite
- [ ] KPIs financeiros em grid com sparklines
- [ ] Crescimento negativo em vermelho com seta
- [ ] Gráficos com gradient fill e tooltip glass
- [ ] Cobranças: 4 cards resumo com shimmer→fade
- [ ] Lista de cobranças com avatares e badges animados
- [ ] Filtros como chips horizontais

---

## SPRINT 9 — Exercícios + Avaliações 🟡 P2

> **Impacto:** Bibliotecas do personal · Visual colorido
> **Estimativa:** ~2.5h · **Deploy:** Independente

### Tarefas

| # | Tarefa | Arquivo(s) | Detalhe Técnico |
|---|--------|------------|-----------------|
| 9.1 | **Cards de exercício com 3D tilt** | `exercises/page.tsx` | `perspective(800px) rotateX(2deg)` default → `rotateX(0deg) translateY(-4px)` hover. Sombra colorida expandida per-grupo |
| 9.2 | **Emojis com staggered bounce** | `exercises/page.tsx` | Entrada: staggerChildren 0.05, each emoji `y: [-10, 0]` com spring bounce |
| 9.3 | **Cores mais saturadas** | `exercises/page.tsx` | Aumentar saturação +15% nos backgrounds pastel. Adicionar gradiente vivo per-card |
| 9.4 | **Chips de filtro por grupo muscular** | `exercises/page.tsx` | Horizontal scroll chips com cor per-grupo, animação de seleção (scale + sombra) |
| 9.5 | **Avaliações: botões hierarquia visual** | `assessments/page.tsx` | Primário "Nova Avaliação" = gradient verde + shadow. Secundário "Criar Teste" = outline roxo com hover fill |
| 9.6 | **Avaliações: estado vazio aprimorado** | `assessments/page.tsx` | EmptyState com illustration + CTA pulsante |

### Critério de Aceite
- [ ] Cards de exercício com 3D tilt e sombra colorida
- [ ] Emojis entram com bounce staggered
- [ ] Cores mais vibrantes nos cards
- [ ] Chips de filtro scrolláveis
- [ ] Botões de avaliação com hierarquia clara
- [ ] Estado vazio animado

---

## SPRINT 10 — Agenda + Mensagens + Notificações 🟡 P2

> **Impacto:** Comunicação e organização do personal
> **Estimativa:** ~3h · **Deploy:** Independente

### Tarefas

| # | Tarefa | Arquivo(s) | Detalhe Técnico |
|---|--------|------------|-----------------|
| 10.1 | **Calendário: avatares reais** | `calendar/page.tsx` | Substituir ícone genérico por `Avatar` component com foto do personal |
| 10.2 | **Calendário: legenda como chips** | `calendar/page.tsx` | Dots → chips clicáveis para filtrar por status |
| 10.3 | **Calendário: linha "agora"** | `calendar/page.tsx` | Linha horizontal vermelha no horário atual com `position: absolute; top: calc()` atualizada por interval |
| 10.4 | **Calendário: transição semana/dia** | `calendar/page.tsx` | AnimatePresence com slide horizontal entre views |
| 10.5 | **Mensagens: busca redesenhada** | `messages/page.tsx` | Fundo branco com borda, ícone animado de busca |
| 10.6 | **Mensagens: estado vazio** | `messages/page.tsx` | EmptyState com illustration "chat" e CTA |
| 10.7 | **Notificações: tabs com pill slide** | `notifications/page.tsx` | Indicador pill que desliza entre tabs com `layoutId`. Badge "Não lidas" com pulse |
| 10.8 | **Notificações: ícones por tipo** | `notifications/page.tsx` | Sino=amarelo, cifrão=verde, haltere=roxo, engrenagem=azul |
| 10.9 | **Notificações: agrupamento por data** | `notifications/page.tsx` | Headers sticky "Hoje", "Ontem", "Esta semana" com separação visual |
| 10.10 | **Notificações: dismiss animation** | `notifications/page.tsx` | Marcar como lida: fade + slide-left. Deletar: slide-out + bounce |

### Critério de Aceite
- [ ] Calendário com avatares, chips de legenda, linha "agora"
- [ ] Transição animada semana/dia
- [ ] Mensagens com busca clean e estado vazio
- [ ] Notificações com pill deslizante, ícones coloridos, agrupamento
- [ ] Animações de dismiss/read

---

## SPRINT 11 — Páginas Secundárias 🟢 P3

> **Impacto:** Páginas menos frequentes mas que completam a experiência
> **Estimativa:** ~4h · **Deploy:** Independente

### Tarefas

| # | Tarefa | Arquivo(s) | Detalhe Técnico |
|---|--------|------------|-----------------|
| 11.1 | **Configurações: seções card** | `settings/page.tsx` | Cada seção em card com border-radius 20px, header com ícone colorido |
| 11.2 | **Configurações: floating labels** | `settings/page.tsx` | Labels que sobem ao focar (CSS `:focus-within + label { transform: translateY(-100%) scale(0.85) }`) |
| 11.3 | **Configurações: tema visual** | `settings/page.tsx` | Seletor com ícones sol/lua morphing. Preview miniatura de cada tema |
| 11.4 | **Configurações: toggles premium** | `settings/page.tsx` | Switch com bounce animation, track verde/cinza com transition |
| 11.5 | **IA: KPI cards animados** | `ai/page.tsx` | Ícones com gradientes, countUp nos números, incentivo visual quando zero |
| 11.6 | **IA: cards de ferramentas redesign** | `ai/page.tsx` | Ícone grande com fundo gradient circular, título bold, descrição 2 linhas, botão "Usar" com arrow animado. Sombra 3D e hover lift |
| 11.7 | **IA: sparkles no header** | `ai/page.tsx` | Partículas sutis (CSS `::before` com radial-gradient animado) atrás do ícone robô |
| 11.8 | **Afiliados: métricas com gradientes** | `affiliates/page.tsx` | Cards: verde=ganhos, azul=indicados, amarelo=saldo, roxo=mês. Progress bar com animação fill + milestones |
| 11.9 | **Afiliados: copiar link feedback** | `affiliates/page.tsx` | Ícone muda para check + toast "Copiado!" por 2s |
| 11.10 | **Marketplace: chips coloridos** | `marketplace/page.tsx` | Fundos gradientes individuais por categoria. Chip ativo: scale-up + sombra |
| 11.11 | **Marketplace: busca premium** | `marketplace/page.tsx` | Sombra interna, ícone animado, autocomplete dropdown |
| 11.12 | **Logs: syntax highlighting** | `logs/page.tsx` | Cores por nível: error=vermelho, warn=amarelo, info=azul, debug=cinza. Zebra striping |
| 11.13 | **Convidar: QR moldura premium** | `students/invite/page.tsx` | QR com logo central, borda gradiente verde, animação scan line |

### Critério de Aceite
- [ ] Configurações com cards, floating labels, tema visual, toggles
- [ ] IA com KPIs animados, cards redesenhados, sparkles
- [ ] Afiliados com métricas coloridas, progress animada, copy feedback
- [ ] Marketplace com chips coloridos e busca premium
- [ ] Logs com syntax highlighting
- [ ] Convidar com QR premium

---

## SPRINT 12 — FAB + Transições + Performance 🟢 P3

> **Impacto:** Polish final · Experiência sistêmica
> **Estimativa:** ~2.5h · **Deploy:** Independente

### Tarefas

| # | Tarefa | Arquivo(s) | Detalhe Técnico |
|---|--------|------------|-----------------|
| 12.1 | **FAB redesenhado** | `mobile-nav.tsx` (já contém FAB inline) | Sombra 3D: `0 8px 32px rgba(34,197,94,0.3)`. Glow pulsante sutil idle. Click expand: semi-círculo de opções (Gerar Treino, Chat IA, Sugestões) com stagger |
| 12.2 | **FAB morph → chat** | `mobile-nav.tsx` ou componente dedicado | Ao abrir chat: FAB faz morph radial (borderRadius 50%→16px, expand width/height) transicionando para card de chat. Usar `layout` prop do Framer |
| 12.3 | **Shared element transitions** | `page-transition.tsx` | Investigar `layoutId` do Framer Motion para avatar de aluno lista→detalhe. Se complexo demais, skip e manter blur transitions |
| 12.4 | **Haptic feedback global** | Criar `lib/haptics.ts` | Utilitário: `hapticLight()` = `navigator.vibrate?.(10)`, `hapticMedium()` = `vibrate(20)`, `hapticHeavy()` = `vibrate([10,30,10])`. Integrar em: buttons, toggles, swipe actions |
| 12.5 | **Content-visibility em listas** | `globals.css` + list components | Adicionar `.auto-contain { content-visibility: auto; contain-intrinsic-size: 0 80px; }` para items de lista longa |
| 12.6 | **will-change seletivo** | `globals.css` | `.will-animate { will-change: transform, opacity; }`. Aplicar APENAS em elementos que realmente animam (cards hover, page transition, FAB) |
| 12.7 | **Lazy blur-up images** | `optimized-image.tsx` | Placeholder blur: thumbnail 10px base64 → lazy load full image com crossfade |

### Critério de Aceite
- [ ] FAB com sombra 3D e glow idle
- [ ] FAB expande opções em semi-círculo
- [ ] Haptic feedback utilitário disponível globalmente
- [ ] Content-visibility em listas longas
- [ ] will-change apenas onde necessário
- [ ] Imagens com blur-up placeholder

---

## 📋 RESUMO TOTAL DE TAREFAS

| Sprint | Nome | Tarefas | Prioridade | Est. |
|:------:|------|:-------:|:----------:|:----:|
| 1 | Header Ultra Premium | 5 | 🔴 P0 | ✅ v4.8.2 |
| 2 | Sidebar Cinema Premium | 6 | 🔴 P0 | ✅ v4.8.2 |
| 3 | Bottom Nav Ultra | 5 | 🔴 P0 | ✅ v4.8.2 |
| 4 | Design Tokens Globais | 6 | 🔴 P0 | ✅ v4.8.2 |
| 5 | Página Alunos (Lista) | 8 | 🟠 P1 | ~3h |
| 6 | Detalhes do Aluno | 8 | 🟠 P1 | ~3h |
| 7 | Página Treinos | 4 | 🟠 P1 | ~2h |
| 8 | Dashboard Financeiro + Cobranças | 6 | 🟡 P2 | ~3h |
| 9 | Exercícios + Avaliações | 6 | 🟡 P2 | ~2.5h |
| 10 | Agenda + Mensagens + Notificações | 10 | 🟡 P2 | ~3h |
| 11 | Páginas Secundárias | 13 | 🟢 P3 | ~4h |
| 12 | FAB + Transições + Performance | 7 | 🟢 P3 | ~2.5h |
| **TOTAL** | | **84** | | **~31h** |

---

## 🔄 ORDEM DE EXECUÇÃO RECOMENDADA

```
Sprint 4 (Tokens)  ←── BASE: precisa existir primeiro
   ↓
Sprint 1 (Header)  ←── P0: visto em 100% das páginas
   ↓
Sprint 2 (Sidebar) ←── P0: desktop + mobile drawer
   ↓
Sprint 3 (Bottom Nav) ←── P0: mobile 100%
   ↓
Sprint 5 (Alunos Lista) ←── P1: página mais usada
   ↓
Sprint 6 (Aluno Detalhe) ←── P1: tela de detalhe core
   ↓
Sprint 7 (Treinos) ←── P1: core do app
   ↓
Sprint 8 (Financeiro + Cobranças) ←── P2: área financeira
   ↓
Sprint 9 (Exercícios + Avaliações) ←── P2: bibliotecas
   ↓
Sprint 10 (Agenda + Msg + Notif) ←── P2: comunicação
   ↓
Sprint 11 (Secundárias) ←── P3: completude
   ↓
Sprint 12 (FAB + Perf) ←── P3: polish final
```

---

## 📐 REGRAS DE IMPLEMENTAÇÃO

### CSS
- **Tailwind v4 canônico** — Sem `bg-gradient-to-r` (usar `bg-linear-to-r`), sem bracket opacidade (`/[0.06]` → `/6`)
- **Novos tokens** → `globals.css` no `@theme` block
- **Novas classes utilitárias** → `globals.css` abaixo do `@theme`
- **Nunca inline style** quando existe token/classe equivalente

### Animações
- **Framer Motion** para: entrada/saída, layout, gestos, physics-based
- **CSS @keyframes** para: loops infinitos (pulse, shimmer, float, glow), pseudo-elements
- **Web Animation API** para: one-shot (ripple, confetti)
- **`prefers-reduced-motion`** → SEMPRE respeitar com media query

### Performance
- **will-change** → SOMENTE em elementos que animam (NUNCA global)
- **content-visibility: auto** → em listas com >10 items
- **Lazy loading** → todas imagens abaixo do fold
- **Bundle** → Zero novas dependências (exceto se Lottie for aprovado futuramente)

### Testes
- **Build** → `npm run build` deve passar com zero errors após cada sprint
- **Visual** → Verificar dark mode + light mode + mobile + desktop
- **A11y** → Contraste WCAG AA mínimo, `prefers-reduced-motion` respeitado

---

## 🚀 COMO COMEÇAR

```bash
# Antes de cada sprint:
git checkout main && git pull

# Após cada sprint:
npm run build    # zero errors
# Visual check dark + light + mobile
node scripts/cf-deploy.js patch --msg "Sprint X: [descrição]"
```

> **Regra:** Cada sprint é deployável independentemente. Nunca acumular sprints sem deploy.

---

*Documento gerado em 08/03/2026 · Atualizado 09/03/2026 · VFIT v4.8.2 (Sprints 1-4 P0 ✅) → v4.9.x*
