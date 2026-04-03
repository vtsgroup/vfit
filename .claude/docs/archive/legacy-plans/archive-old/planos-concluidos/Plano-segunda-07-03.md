# VFIT — Auditoria Visual Completa + Plano de Ação Ultra Detalhado

***

## DIAGNÓSTICO POR EVIDÊNCIA VISUAL

### PROBLEMAS CRÍTICOS — MODO CLARO (LIGHT MODE)

**1. Inversão total de tema nos cards do Dashboard** [vfit.app](https://iapersonal.app.br/dashboard)
Cards como "Evolução de Carga", "Suas Conquistas", "Seus Treinos", "Exercício Monitorado" permanecem com fundo escuro (`bg-surface-dark` / `#0D1324`) no modo claro. A troca de tema não aplica as classes corretas nesses componentes. É o bug mais grave visualmente — o app parece quebrado.

**2. Texto invisível no card "Treino de Hoje"** [vfit.app](https://iapersonal.app.br/dashboard)
"HIPERTROFIA" e o subtexto "10 exercício(s) -  ~60 min" são renderizados em branco/esverdeado claro sobre fundo verde-claro (quase branco), resultando em contraste WCAG de aproximadamente 1.2:1 — ilegível e reprovado em todas as categorias AA e AAA.

**3. "Olá, Victor!" sem contraste** [vfit.app](https://iapersonal.app.br/dashboard)
O texto de saudação usa um verde deslavado sobre fundo cinza claro. Contraste estimado ~2.8:1, abaixo do mínimo de 4.5:1 para texto normal.

**4. "R$ NaN" no cartão de Cobranças** [vfit.app](https://iapersonal.app.br/dashboard/payments)
Tanto "A PAGAR" quanto "TOTAL PAGO" exibem "R$ NaN" — bug de parsing de valor (provavelmente `parseFloat(undefined)` ou divisão por zero). Além do bug funcional, os cartões continuam com fundo escuro no modo claro.

**5. Cards KPI com fundo escuro fixo na tela de Cobranças** [vfit.app](https://iapersonal.app.br/dashboard/payments)
Os dois cards de resumo financeiro ("A PAGAR" e "TOTAL PAGO") usam `bg-[#0D1324]` hardcoded, ignorando o sistema de tokens semânticos.

**6. Chart "Frequência Semanal" vazando para fora do card** [vfit.app](https://iapersonal.app.br/dashboard)
O gráfico de barras Recharts usa largura 100% sem `overflow: hidden` no container, e o eixo X transborda os limites do card arredondado — visível claramente no scroll do dashboard.

**7. Botão "Pular para próximo" sem hierarquia visual** [vfit.app](https://iapersonal.app.br/dashboard/workouts/execute?id=2a57af5a-607e-4eba-ad2d-369b66bdd441)
Botão secundário usa `bg-white` com borda muito tênue (quasi-invisível em fundo branco). Não tem a mesma altura que o botão primário "Concluir exercício". Em mobile com fundo claro, o botão praticamente desaparece.

**8. Botões de ajuste rápido (-1 rep, +1 rep, -2.5kg, +2.5kg)** [vfit.app](https://iapersonal.app.br/dashboard/workouts/execute?id=2a57af5a-607e-4eba-ad2d-369b66bdd441)
Fundo quase idêntico ao background da página em modo claro, sem sombra ou contraste de borda suficiente. Parecem desabilitados mesmo estando ativos.

**9. Seção "Aparência" nas Configurações** [vfit.app](https://iapersonal.app.br/dashboard/settings)
O botão "Claro" ativo tem fundo verde muito claro, mas o rótulo "Claro" some visualmente. O botão "Escuro" e "Sistema" inativos são quase idênticos visualmente — nenhuma diferença de estado claro.

**10. Ícones usando emoji** [vfit.app](https://iapersonal.app.br/dashboard/workouts)
Vários lugares usam emoji diretamente no UI (🏋️, 🔥, ⚡, 📅, 💳, 📊, 🏆, 📋). Isso resulta em renderização inconsistente entre Android/iOS/desktop e quebra o sistema visual.

***

### PROBLEMAS ESTRUTURAIS — AMBOS OS MODOS

**11. Nomes de exercícios como slugs brutos**
"ex-abductors-001" exibido diretamente como título do exercício — sem transformação para nome legível humano.

**12. Hierarquia tipográfica inconsistente**
- Header `Dashboard` usa `font-black` mas subtítulos de seção usam pesos variados sem padrão
- `TREINOS CONCLUÍDOS`, `STREAK ATUAL` em CAPS inconsistente com outras seções

**13. Bottom navigation — pill indicator mal posicionado**
O indicador verde abaixo do ícone ativo deveria ser uma barra superior (conforme spec do plano SPRINT-UI), mas permanece como underline simples, sem animação de transição entre tabs.

**14. Avatar sem status ring animado**
O avatar do usuário no header tem apenas um ponto verde estático, sem ring animado conforme spec.

**15. Botão "Salvar" nas Configurações** [vfit.app](https://iapersonal.app.br/dashboard/settings)
Verde com ícone de câmera (ícone de foto dentro do botão de salvar perfil) — ícone incorreto para a ação.

**16. Cards de gamificação sem profundidade**
"Streak", "XP total", "Conquistas" são cards flat sem elevação ou diferenciação visual entre si.

**17. Heatmap de consistência** [vfit.app](https://iapersonal.app.br/dashboard)
Legenda "menos / mais" sem indicadores visuais adequados. Os quadrados do heatmap são muito pequenos em mobile e não têm bordas arredondadas.

**18. Página de Avaliações — empty state genérico** [vfit.app](https://iapersonal.app.br/dashboard/assessments)
Ícone SVG de clipboard sem estilo, texto plano, sem CTA primária.

**19. Treinos — card com pouco aproveitamento visual** [vfit.app](https://iapersonal.app.br/dashboard/workouts)
Card de "HIPERTROFIA" tem muito espaço em branco desperdiçado, sem progress ring, sem indicador visual de progresso do treino.

***

## PLANO DE AÇÃO — SPRINTS DETALHADOS

### SPRINT A1 — CORREÇÕES CRÍTICAS DE TEMA (LIGHT MODE BROKEN)
**Prioridade: P0-BLOQUEADOR | Duração: 2-3 dias | URL: `/dashboard`, `/dashboard/payments`**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A1-01 | Corrigir cards do Dashboard que não respondem ao tema | `dashboard/page.tsx` e todos os sub-componentes | Substituir todos `bg-[#0D1324]`, `bg-[#070C18]`, `bg-surface-dark` hardcoded por tokens semânticos `bg-surface-card dark:bg-surface-card-dark` |
| A1-02 | Corrigir cartões KPI de Cobranças | `payments/page.tsx` | Mesma correção — remover hex hardcoded, usar `bg-surface-elevated` |
| A1-03 | Fix contraste do card "Treino de Hoje" | `components/workout-today-card.tsx` | Texto deve usar `text-text-primary` em modo claro. Fundo do card usar `bg-brand-primary/10` com borda `border-brand-primary/20`. Texto "HIPERTROFIA" em `text-text-primary` (não branco). |
| A1-04 | Fix contraste do header "Olá, Victor!" | `dashboard/page.tsx` | Garantir que o texto use `text-text-primary` com contraste mínimo 4.5:1 |
| A1-05 | Fix "R$ NaN" nas cobranças | `payments/page.tsx` | Adicionar guard `isNaN(value) ? 'R$ 0,00' : formatCurrency(value)` em todos os pontos de exibição |
| A1-06 | Audit global de hardcoded colors | `grep -r "#0D1324\|#070C18\|#09090B" src/` | Substituir TODOS os hex escuros hardcoded por CSS vars semânticas em todos os arquivos |
| A1-07 | Testar light/dark mode em todas as 5 páginas do aluno | QA manual | Verificar cada card, cada botão, cada texto em ambos os modos |

***

### SPRINT A2 — TIPOGRAFIA, HIERARQUIA E REMOÇÃO DE EMOJI
**Prioridade: P0 | Duração: 2 dias | URLs: todas as páginas**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A2-01 | Substituir todos os emoji por ícones SVG premium | `components/icons/` (criar biblioteca) | Criar `src/components/icons/index.tsx` com SVGs inline para cada ícone usado: Fogo (streak), Raio (XP), Calendário, Carteira, Troféu, Haltere, Gráfico, Coração, Estrela. Usar stroke-width 1.5, arredondados, estilo linear moderno (Lucide-compatible) |
| A2-02 | Padronizar hierarquia tipográfica | `globals.css` + todos os pages | `h1` dashboard: `text-2xl font-black tracking-tight`. Subtítulos de seção: `text-xs font-semibold uppercase tracking-widest text-text-muted`. Valores KPI grandes: `text-3xl font-black tabular-nums`. Texto descritivo: `text-sm text-text-secondary` |
| A2-03 | Normalizar CAPS inconsistente | Todas as pages | Seções como "TREINOS CONCLUÍDOS" → usar classe CSS `section-label` com `font-semibold text-xs tracking-widest uppercase text-text-muted` padronizando via componente `<SectionLabel>` |
| A2-04 | Nomes de exercícios humanizados | `utils/exercise.ts` | Criar `formatExerciseName(slug: string)`: `ex-abductors-001` → `Abdutores 01`. Regex: substituir `ex-`, `-`, adicionar capitalização e número formatado |

***

### SPRINT A3 — BOTÕES: HIERARQUIA, ALTURA E CONTRASTE
**Prioridade: P0 | Duração: 2 dias | URL: `/dashboard/workouts/execute`**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A3-01 | Botão secundário com cor e altura correta | `components/ui/button.tsx` | Variant `secondary`: `bg-surface-elevated border-2 border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10 active:scale-[0.98]`. Mesma height que primário: `h-14` (56px) |
| A3-02 | Botões de ajuste rápido (-1 rep etc.) | `workout-execution` component | Usar `bg-surface-card border border-border-light shadow-elevation-1`. Hover: `bg-surface-elevated shadow-elevation-2 -translate-y-0.5`. Fonte: `text-sm font-bold`. Min-width: `80px` |
| A3-03 | Botão "Pular para próximo" | Idem | Aplicar variant `secondary` novo. Adicionar ícone SVG de seta-direita antes do texto. Garantir mesma height do "Concluir exercício" |
| A3-04 | "Trocar foto" e "Remover" nas Configurações | `settings/page.tsx` | "Trocar foto": variant `secondary` com ícone upload SVG. "Remover": variant `ghost-danger` com ícone trash e cor `text-danger` |
| A3-05 | Botão "Salvar" perfil — ícone errado | `settings/page.tsx` | Trocar ícone de câmera por ícone de check ou floppy. Label "Salvar alterações" |
| A3-06 | Sistema de sombra 3D nos botões primários | `globals.css` | `.btn-primary { box-shadow: 0 4px 0 0 rgba(0,0,0,0.2), 0 6px 12px rgba(34,197,94,0.25); } .btn-primary:active { box-shadow: 0 2px 0 0 rgba(0,0,0,0.2), 0 3px 6px rgba(34,197,94,0.15); transform: translateY(2px); }` |

***

### SPRINT A4 — DASHBOARD: CARDS KPI E GAMIFICAÇÃO PREMIUM
**Prioridade: P1 | Duração: 3 dias | URL: `/dashboard`**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A4-01 | Cards KPI com ícones SVG coloridos e gradiente | `components/kpi-card.tsx` | Layout: ícone SVG 40x40 com fundo circular gradiente (ex: streak=laranja, XP=roxo, avaliação=azul, pagamento=verde). Valor em `text-3xl font-black`. Label acima em `section-label`. Fundo: `bg-surface-card` + `shadow-elevation-2` + `hover:shadow-elevation-3 hover:-translate-y-0.5 transition-all` |
| A4-02 | Card "Treino de Hoje" redesenhado | `components/workout-today-card.tsx` | Background: `bg-gradient-to-br from-brand-primary/15 to-brand-primary/5` (light) / `from-brand-primary/25 to-brand-primary/10` (dark). Borda: `border border-brand-primary/20`. Badge "TREINO DE HOJE" com ícone SVG de haltere (não emoji). Nome do treino em `text-xl font-black text-text-primary`. Botão "Iniciar Treino" full-width com shadow 3D |
| A4-03 | Fix chart "Frequência Semanal" vazando | `components/weekly-frequency-chart.tsx` | Container com `overflow: hidden; border-radius: 16px`. Recharts `<ResponsiveContainer width="100%" height={140}>`. Adicionar `style={{ overflow: 'hidden' }}` no wrapper. Padding interno de 16px para o eixo não vazar |
| A4-04 | Heatmap de consistência melhorado | `components/consistency-heatmap.tsx` | Quadrados: `w-3 h-3 rounded-sm` (mobile) / `w-4 h-4 rounded-sm` (desktop). Cores: 4 tons de verde com proper dark/light tokens. Legenda com visual de escala de cor real (5 quadrados do vazio ao cheio). Tooltip ao hover com data e contagem |
| A4-05 | Cards de conquistas | `components/achievements.tsx` | Card de conquista com fundo gradiente sutil, ícone SVG de troféu dourado (não emoji estrela). Badge numerado. "Sem conquistas" com ilustração SVG inline |
| A4-06 | Seção "Seus Treinos" | `dashboard/page.tsx` | Card do treino com `border-l-4 border-brand-primary`. Ícone de haltere SVG. Chip "ATIVO" com ponto verde pulsante. Seta SVG de navigate à direita. Hover: `shadow-elevation-2 -translate-y-0.5` |
| A4-07 | Motivação do dia | `components/motivation-card.tsx` | Card com borda esquerda `brand-primary
Continuando exatamente de onde parou — **A4-07** — e completando todos os sprints restantes do plano:

***

### SPRINT A4 — DASHBOARD: CARDS KPI E GAMIFICAÇÃO PREMIUM *(continuação)*

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A4-07 | Motivação do dia | `components/motivation-card.tsx` | Card com borda esquerda `4px solid brand-primary`. Ícone SVG de aspas (quote marks) no canto superior direito em `text-brand-primary/20`, tamanho 48px. Texto em `text-base font-medium italic text-text-secondary`. Fundo `bg-surface-card`. Sem emoji |
| A4-08 | Progress ring semanal | `components/weekly-progress-ring.tsx` | SVG circle com `stroke-dasharray` animado via Framer Motion. Valor central em `text-2xl font-black`. Label abaixo: "dias treinados esta semana". Cores: trilha `bg-border-light`, progresso `stroke-brand-primary` |
| A4-09 | XP progress bar | `components/xp-progress.tsx` | Barra full-width com `h-2 rounded-full bg-border-light`. Preenchimento animado `bg-gradient-to-r from-violet-500 to-purple-500`. Label: "Nível 1 -  0/100 XP" em `text-xs font-semibold`. Chip de nível com fundo `bg-violet-500/10 text-violet-600 border border-violet-500/20` |
| A4-10 | Skeleton loaders para o Dashboard | `components/dashboard-skeleton.tsx` | Shimmer para cada seção: card treino hoje (1 bloco grande), KPI grid (4 blocos 2x2), chart frequência (bloco retangular). Usar `animate-pulse bg-surface-card` com bordas arredondadas corretas |

***

### SPRINT A5 — HEADER E NAVEGAÇÃO GLOBAL
**Prioridade: P0 | Duração: 2 dias | URLs: todas**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A5-01 | Header — sombra progressiva no scroll | `components/header.tsx` | `useEffect` com `window.addEventListener('scroll', ...)`. Quando `scrollY > 0`: adicionar `shadow: 0 1px 12px rgba(0,0,0,0.06)` via classe `.header-scrolled`. Transition `box-shadow 200ms ease` no CSS |
| A5-02 | Header — breadcrumb com separadores SVG | `components/header.tsx` | Substituir `>` texto por ícone SVG `ChevronRight` 14x14 `text-text-muted`. Cada item clicável com `hover:text-brand-primary transition-colors duration-150`. Item atual: `font-semibold text-text-primary` |
| A5-03 | Avatar — ring de status animado | `components/header.tsx` | Wrapper do avatar com `ring-2 ring-brand-primary ring-offset-2 ring-offset-surface-base`. Ponto online: `absolute bottom-0 right-0 w-3 h-3 rounded-full bg-brand-primary border-2 border-surface-base` |
| A5-04 | Badge de notificação com pulse | `components/header.tsx` | Quando `count > 0`: adicionar `after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-red-500/40 after:animate-ping` no badge vermelho |
| A5-05 | Ícone hamburguer → X morphing | `components/header.tsx` | 3 linhas SVG com `transition-transform duration-300`. `isOpen`: linha superior `rotate-45 translate-y-[7px]`, central `opacity-0 scale-x-0`, inferior `-rotate-45 -translate-y-[7px]` |
| A5-06 | Bottom nav — pill indicator topo | `components/mobile-nav.tsx` | Mover indicador de underline para `absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-brand-primary` acima do ícone. Animar com `layoutId="nav-pill"` Framer Motion |
| A5-07 | Bottom nav — bounce ao selecionar tab | `components/mobile-nav.tsx` | No callback de seleção: `motion.animate(iconEl, { y: [-3, 0] }, { type: 'spring', stiffness: 400, damping: 15 })` |
| A5-08 | Bottom nav — glassmorphism refinado | `globals.css` | `.nav-premium { border-top: 1px solid rgba(255,255,255,0.06); }` — light mode: `border-top: 1px solid rgba(0,0,0,0.06)` |

***

### SPRINT A6 — PÁGINA DE EXECUÇÃO DE TREINO
**Prioridade: P1 | Duração: 2-3 dias | URL: `/dashboard/workouts/execute?id=*`**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A6-01 | Progress bar do treino | `workout-execution/page.tsx` | Bar com `h-2.5 rounded-full`. Background `bg-border-light`. Fill: `bg-gradient-to-r from-brand-primary to-emerald-400`. Texto "10%" em `text-xs font-bold text-brand-primary`. Ícone SVG de relógio antes do percentual |
| A6-02 | Nome do exercício humanizado | Idem + `utils/exercise.ts` | `formatExerciseName('ex-abductors-001')` → `"Abdutores — Série 01"`. Exibir em `text-2xl font-black text-text-primary` |
| A6-03 | Container do vídeo | Idem | Quando sem vídeo: `bg-surface-card border-2 border-dashed border-border-light rounded-2xl`. Ícone SVG de play em `text-text-muted`. Texto "Vídeo não disponível" em `text-sm text-text-muted`. Aspect ratio `16/9` fixo via `aspect-video` |
| A6-04 | Inputs Reps e Carga | Idem | `h-14 rounded-xl border-2 border-border-light focus:border-brand-primary bg-surface-card text-base font-semibold text-text-primary`. Placeholder em `text-text-muted`. Label flutuante no focus |
| A6-05 | Botões ajuste rápido (4 botões) | Idem | `h-11 rounded-xl bg-surface-card border border-border-light text-sm font-bold text-text-primary shadow-elevation-1`. Hover: `bg-surface-elevated shadow-elevation-2 -translate-y-0.5`. Active: `translate-y-0 shadow-elevation-1` |
| A6-06 | Botão "Concluir exercício" | Idem | Manter verde. Adicionar ícone SVG de check (não play triangle). `h-14 rounded-2xl text-base font-bold`. Shadow 3D: `shadow-[0_4px_0_0_rgba(0,0,0,0.2),0_6px_16px_rgba(34,197,94,0.3)]`. Press: `translate-y-[2px] shadow-[0_2px_0_0_rgba(0,0,0,0.2)]` |
| A6-07 | Botão "Pular para próximo" | Idem | `h-14 rounded-2xl border-2 border-border-light bg-surface-card text-text-secondary font-semibold`. Ícone SVG de seta-direita à direita. Hover: `border-brand-primary/40 text-brand-primary`. Mesma altura que primário |
| A6-08 | Indicador "Exercício X de Y" | Idem | Badge com `bg-brand-primary/10 text-brand-primary text-xs font-bold px-3 py-1 rounded-full`. Ícone SVG de haltere antes do texto |
| A6-09 | Contador de séries | Idem | Chips de série: `w-9 h-9 rounded-full`. Série pendente: `border-2 border-border-light text-text-muted`. Série ativa: `border-2 border-brand-primary bg-brand-primary/10 text-brand-primary font-bold`. Série concluída: `bg-brand-primary text-white` com ícone check SVG |

***

### SPRINT A7 — PÁGINA DE TREINOS (LISTA)
**Prioridade: P1 | Duração: 1-2 dias | URL: `/dashboard/workouts`**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A7-01 | Card de treino com progress visual | `workouts/page.tsx` | Layout: borda esquerda `4px solid brand-primary`. Linha superior: nome em `font-black` + chip "ATIVO". Linha média: trio de stats com ícones SVG (haltere = N exercícios, check = Nx concluído, pessoa = personal). Botão play SVG à direita com `w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white` |
| A7-02 | Chips de status | Idem | "ATIVO": `bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold px-2 py-0.5 rounded-full`. Ponto pulsante antes do texto: `w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse` |
| A7-03 | Staggered entrance da lista | Idem | Envolver cada card em `motion.div` com `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}` |
| A7-04 | Empty state premium | Idem | SVG ilustração de haltere (não emoji). Título `text-lg font-black text-text-primary`. Subtexto `text-sm text-text-muted`. Sem CTA (aluno não cria treino) |

***

### SPRINT A8 — PÁGINA DE COBRANÇAS
**Prioridade: P1 | Duração: 2 dias | URL: `/dashboard/payments`**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A8-01 | Fix R$ NaN | `payments/page.tsx` | Guard em todos os pontos: `const safeVal = isNaN(val) \|\| val === undefined ? 0 : val`. Formatar com `new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeVal)` |
| A8-02 | Cards "A Pagar" e "Total Pago" com tokens semânticos | Idem | Remover hex hardcoded. "A Pagar": `bg-amber-500/10 border border-amber-500/20`. "Total Pago": `bg-emerald-500/10 border border-emerald-500/20`. Ambos com `rounded-2xl p-5 shadow-elevation-1`. Ícone SVG circulado no canto direito |
| A8-03 | Card de cobrança pendente | Idem | Avatar circular com iniciais do personal. Nome do personal em `font-semibold`. Chip "ATRASADO": `bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-bold px-2 py-0.5 rounded-full`. Método PIX/cartão com ícone SVG. Data vencimento em `text-red-500 text-xs font-semibold`. Valor em `text-lg font-black` |
| A8-04 | Botão "Pagar Agora" | Idem | Manter verde full-width. Ícone SVG de cartão de crédito. `h-13 rounded-xl font-bold text-base`. Shadow 3D padrão |
| A8-05 | Seção header "Cobranças Pendentes (2)" | Idem | Ícone SVG de relógio com triângulo de aviso (não emoji). Cor `text-amber-500`. Texto em `font-bold text-text-primary` |

***

### SPRINT A9 — PÁGINA DE AVALIAÇÕES
**Prioridade: P1 | Duração: 1 dia | URL: `/dashboard/assessments`**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A9-01 | Empty state premium | `assessments/page.tsx` | SVG inline de prancheta/corpo humano (não emoji). Círculo de fundo `w-24 h-24 rounded-full bg-brand-primary/10 flex items-center justify-center` com SVG `w-12 h-12 text-brand-primary`. Título `text-lg font-black`. Subtexto 2 linhas em `text-sm text-text-muted text-center` |
| A9-02 | Contador "0 avaliações encontradas" | Idem | Usar `text-text-muted text-sm` (não destacado). Remover "encontradas" — usar apenas "Nenhuma avaliação ainda" |

***

### SPRINT A10 — CONFIGURAÇÕES
**Prioridade: P2 | Duração: 2 dias | URL: `/dashboard/settings`**  [vfit.app](https://iapersonal.app.br/dashboard/settings)

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A10-01 | Header da página | `settings/page.tsx` | Ícone SVG de engrenagem com fundo `w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary`. Título "Configurações" em `text-2xl font-black`. Subtítulo em `text-sm text-text-muted`. Layout lado a lado mobile: ícone + texto |
| A10-02 | Seção Aparência — seletor de tema | Idem | Três botões em grid `grid-cols-3 gap-3`. Cada um: `h-20 rounded-2xl border-2`. Inativo: `border-border-light bg-surface-card`. Ativo: `border-brand-primary bg-brand-primary/8 shadow-elevation-2`. Ícone SVG: sol (Claro), lua (Escuro), monitor (Sistema). Ícone em `w-6 h-6` + label em `text-xs font-semibold mt-2`. Label do botão ativo em `text-brand-primary` |
| A10-03 | Inputs de perfil com floating label | Idem | Labels que sobem com `transform translateY(-100%) scale(0.85)` no focus. Border `2px solid border
Continuando de exatamente onde cortou — **A10-03** — e completando o plano inteiro até o último detalhe:

***

### SPRINT A10 — CONFIGURAÇÕES *(continuação de A10-03)*
**URL: `/dashboard/settings`** [vfit.app](https://iapersonal.app.br/dashboard/settings)

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A10-03 | Inputs de perfil com floating label | `settings/page.tsx` | Label flutua ao focus: `transform: translateY(-100%) scale(0.85); color: var(--brand-primary)`. Input: `h-14 rounded-xl border-2 border-border-light bg-surface-card px-4 pt-5 pb-1 text-base font-medium text-text-primary`. Focus: `border-brand-primary ring-4 ring-brand-primary/10`. Input desabilitado (e-mail): `opacity-50 cursor-not-allowed bg-surface-card/50`. Erro: `border-danger ring-danger/10`. Ícone de cadeado SVG no e-mail desabilitado |
| A10-04 | Botão "Salvar" perfil | Idem | Ícone SVG de check (não câmera). Label "Salvar alterações". Variant primário padrão com shadow 3D. `w-full` em mobile, `w-auto min-w-[160px]` em desktop. Alinhamento à direita do card |
| A10-05 | Seletor de tema — estados visuais claros | Idem | Botão ativo recebe `aria-pressed="true"` + checkmark SVG `w-4 h-4 text-brand-primary` no canto superior direito. Ícone SVG de sol, lua, monitor: `w-7 h-7`. Transição `transition-all duration-200` entre estados |
| A10-06 | Seção Notificações — toggle redesenhado | Idem | Switch pill: `w-12 h-6 rounded-full`. Inativo: `bg-border-light`. Ativo: `bg-brand-primary`. Thumb: `w-5 h-5 rounded-full bg-white shadow-elevation-2 translate-x-0.5`. Ativo: `translate-x-6.5`. Transition: `transition-transform duration-200 ease-[var(--ease-bounce)]` |
| A10-07 | Labels de toggle em CAPS | Idem | Substituir CAPS hardcoded por classe `section-label` — `text-xs font-semibold tracking-widest uppercase text-text-secondary`. Descritivos abaixo em `text-xs text-text-muted` normal case |
| A10-08 | Botão "Desativar notificações" | Idem | Variant `ghost-danger`: sem fundo, `text-danger border border-danger/30 hover:bg-danger/8`. Ícone SVG de sino-riscado à esquerda |
| A10-09 | Seção Login Biométrico | Idem | Badge "Ativo": `bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-bold`. Ícone SVG de impressão digital ou face-id. Card do dispositivo "Android": ícone SVG android + nome do dispositivo bold + datas em `text-xs text-text-muted`. Botões "Remover passkey" e "Adicionar outro dispositivo" em layout row com separação clara |
| A10-10 | Seção Alterar Senha | Idem | Inputs com floating label igual ao A10-03. Cada campo com ícone SVG de cadeado no final (toggle show/hide com SVG olho/olho-fechado). Botão "Alterar Senha": variant primário full-width |
| A10-11 | Seção Privacidade e LGPD | Idem | Dois botões lado a lado: "Exportar dados" (secondary) com ícone SVG download. "Excluir conta" (ghost-danger) com ícone SVG trash. Texto descritivo em `text-xs text-text-muted` abaixo dos botões |
| A10-12 | Cards de seção com espaçamento correto | Idem | Cada seção em card próprio: `rounded-2xl border border-border-light bg-surface-elevated p-6 space-y-4 shadow-elevation-1`. Header de seção: ícone SVG + título `text-base font-bold text-text-primary`. Separação entre seções: `space-y-4` no container pai |

***

### SPRINT A11 — SISTEMA DE ÍCONES SVG PREMIUM (GLOBAL)
**Prioridade: P0 | Duração: 2 dias | Impacto: todas as URLs**

Este sprint cria a biblioteca central de ícones e substitui todos os emoji do app.

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A11-01 | Criar `src/components/icons/index.tsx` | `components/icons/index.tsx` | Exportar componentes SVG tipados: `interface IconProps { size?: number; className?: string; strokeWidth?: number }`. Tamanho padrão 20px, stroke 1.5, `currentColor`, viewBox padrão `0 0 24 24`, `fill="none"` |
| A11-02 | Ícones de navegação (bottom nav) | Idem | `IconHome`, `IconDumbbell`, `IconClipboardCheck`, `IconCreditCard`, `IconSettings`. SVG desenhados no estilo linear moderno (Lucide-style). Estado ativo: versão filled com `fill="currentColor"` ou stroke mais espesso `strokeWidth={2}` |
| A11-03 | Ícones de gamificação | Idem | `IconFlame` (streak), `IconZap` (XP/energia), `IconTrophy` (conquistas), `IconStar` (badge), `IconTarget` (meta), `IconCalendar` (avaliação). Cada um com variante de cor via `className` prop |
| A11-04 | Ícones de ação | Idem | `IconPlay`, `IconCheck`, `IconChevronRight`, `IconArrowLeft`, `IconSkip`, `IconPlus`, `IconMinus`, `IconUpload`, `IconTrash`, `IconEye`, `IconEyeOff`, `IconLock`, `IconBell`, `IconBellOff`, `IconDownload`, `IconShare`, `IconQrCode`, `IconCopy` |
| A11-05 | Ícones de status | Idem | `IconAlertTriangle` (aviso), `IconAlertCircle` (erro), `IconCheckCircle` (sucesso), `IconInfoCircle` (info), `IconClock` (pendente), `IconXCircle` (cancelado) |
| A11-06 | Substituição global de emoji | Todas as pages | Varredura completa: grep por `🏋️\|🔥\|⚡\|📅\|💳\|📊\|🏆\|📋\|⭐\|💪\|🎯\|📈\|🟢` e substituir por componentes `<Icon*>` com `className` adequado. Zero emoji restantes na UI |
| A11-07 | Ícones para grupos musculares | `components/icons/muscles.tsx` | SVGs anatômicos simples (silhueta humana com destaque por grupo) para uso futuro na biblioteca de exercícios. Por ora: ícones placeholder circulares com letra inicial do grupo |

***

### SPRINT A12 — TOKENS DE COR E SOMBRA — AUDITORIA FINAL
**Prioridade: P0 | Duração: 1 dia | Arquivo: `globals.css`**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A12-01 | Tokens semânticos de superfície — modo claro | `globals.css` | `:root { --surface-base: #FFFFFF; --surface-card: #F8FAFC; --surface-elevated: #FFFFFF; --surface-overlay: rgba(255,255,255,0.85); --border-light: #E2E8F0; --border-dark: #CBD5E1; --text-primary: #0F172A; --text-secondary: #475569; --text-muted: #94A3B8; }` |
| A12-02 | Tokens semânticos de superfície — modo escuro | `globals.css` | `.dark { --surface-base: #09090B; --surface-card: #0D1324; --surface-elevated: #131929; --surface-overlay: rgba(9,9,11,0.85); --border-light: rgba(255,255,255,0.06); --border-dark: rgba(255,255,255,0.12); --text-primary: #F8FAFC; --text-secondary: #94A3B8; --text-muted: #64748B; }` |
| A12-03 | Garantir que NENHUM componente use hex hardcoded escuro | Varredura global | `grep -rn "#0D1324\|#070C18\|#09090B\|#131929\|#050A12\|#111113" src/app/dashboard` — cada ocorrência substituída por token semântico correto |
| A12-04 | Tokens de sombra por modo | `globals.css` | `:root { --shadow-elevation-1: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); --shadow-elevation-2: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04); --shadow-elevation-3: 0 12px 28px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06); }` Dark mode: multiplicar alpha por 1.5 |
| A12-05 | Radius padronizado | `globals.css` | `--radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px; --radius-2xl: 24px; --radius-full: 9999px`. Aplicar em todos os components via `rounded-[var(--radius-lg)]` ou Tailwind custom values |

***

### SPRINT A13 — GLASSMORPHISM E EFEITOS DE PROFUNDIDADE
**Prioridade: P2 | Duração: 1-2 dias | Impacto: header, bottom nav, modais**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A13-01 | Header glassmorphism premium | `globals.css` + `header.tsx` | `.header-glass { background: rgba(255,255,255,0.82); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border-bottom: 1px solid rgba(0,0,0,0.06); }` Dark: `background: rgba(9,9,11,0.80); border-bottom: 1px solid rgba(255,255,255,0.06)` |
| A13-02 | Bottom nav glassmorphism | `globals.css` | `.nav-glass { background: rgba(255,255,255,0.85); backdrop-filter: blur(24px) saturate(180%); border-top: 1px solid rgba(0,0,0,0.06); }` Dark: `rgba(9,9,11,0.88)` |
| A13-03 | Cards com micro-elevação em light mode | `globals.css` | Cards em light mode devem ter sombra suave: `box-shadow: var(--shadow-elevation-1)` padrão, `var(--shadow-elevation-2)` no hover. Em dark mode: sem sombra pesada — usar apenas `border: 1px solid var(--border-light)` |
| A13-04 | Modal/drawer overlay | `globals.css` | `.overlay-glass { background: rgba(0,0,0,0.40); backdrop-filter: blur(4px); }`. Animação: `opacity 0 → 1` em `200ms ease`. O drawer em si: `background: var(--surface-elevated); border-radius: 24px 24px 0 0` (bottom sheet mobile) |
| A13-05 | Chips e badges com glassmorphism seletivo | `components/ui/badge.tsx` | Badge premium: `background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); color: #16A34A; backdrop-filter: blur(8px)`. Dark mode: `rgba(34,197,94,0.15)` |

***

### SPRINT A14 — MICROINTERAÇÕES E ANIMAÇÕES
**Prioridade: P2 | Duração: 2 dias | Impacto: todas as interações**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A14-01 | Page transitions suaves | `components/page-transition.tsx` | `AnimatePresence mode="wait"`. Entrada: `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}`. Duration: `300ms`. Easing: `cubic-bezier(0.16, 1, 0.3, 1)` |
| A14-02 | Staggered list reveal | Todas as listas | `motion.ul` com `variants={{ visible: { transition: { staggerChildren: 0.05 } } }}`. Cada item `motion.li`: `hidden: { opacity: 0, y: 12 }` → `visible: { opacity: 1, y: 0 }` |
| A14-03 | Contadores animados (KPIs) | `components/animated-counter.tsx` | `useMotionValue(0)` + `animate(0, target, { duration: 0.8, ease: 'easeOut' })`. Formatar valor durante animação. Disparar quando componente entra no viewport via `useInView` |
| A14-04 | Shimmer skeleton global | `globals.css` | `@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }`. `.skeleton { background: linear-gradient(90deg, var(--surface-card) 25%, var(--border-light) 50%, var(--surface-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }` |
| A14-05 | Ripple no tap de botões | `components/ui/button.tsx` | `onPointerDown`: criar `div` absoluto com `border-radius: 50%; background: rgba(255,255,255,0.3); animation: ripple 0.5s ease-out`. `@keyframes ripple { from { transform: scale(0); opacity: 1 } to { transform: scale(3); opacity: 0 } }` |
Sim, ainda tem conteúdo. Completando o plano do ponto exato onde cortou — **A14-06** — até o encerramento total:

***

### SPRINT A14 — MICROINTERAÇÕES E ANIMAÇÕES *(continuação de A14-06)*

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A14-06 | Haptic feedback utilitário | `lib/haptics.ts` | `export const haptic = { light: () => navigator.vibrate?.(10), medium: () => navigator.vibrate?.(20), heavy: () => navigator.vibrate?.([10, 30, 10]), success: () => navigator.vibrate?.([10, 50, 10, 50, 10]) }`. Integrar em: botão "Concluir exercício" (`haptic.success()`), botões de ajuste rápido (`haptic.light()`), tabs do bottom nav (`haptic.light()`), confirmações de pagamento (`haptic.medium()`) |
| A14-07 | `prefers-reduced-motion` — respeitar em tudo | `globals.css` | `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }`. Framer Motion: usar `const shouldReduceMotion = useReducedMotion()` e setar `duration: shouldReduceMotion ? 0 : 0.3` |

***

### SPRINT A15 — RESPONSIVIDADE E TOUCH TARGETS
**Prioridade: P1 | Duração: 2 dias | URLs: todas**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A15-01 | Touch targets mínimos WCAG 2.5.5 | Todos os componentes interativos | Todos os botões, links e switches: `min-height: 44px; min-width: 44px`. Chips pequenos: adicionar `padding: 8px 12px` para atingir o mínimo. Ícones clicáveis isolados: envolver em `button` com `p-2` para área de toque adequada |
| A15-02 | Safe area insets para notch e home indicator | `globals.css` | `padding-bottom: env(safe-area-inset-bottom)` no bottom nav. `padding-top: env(safe-area-inset-top)` no header quando em fullscreen PWA. `padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right)` no layout raiz |
| A15-03 | Grid do dashboard — 1 col mobile, 2 col tablet | `dashboard/page.tsx` | KPI cards: `grid grid-cols-2 gap-3` (mobile) / `sm:grid-cols-2 lg:grid-cols-4`. Seções de analytics: `grid grid-cols-1 md:grid-cols-2 gap-4`. Sem scroll horizontal em nenhum breakpoint |
| A15-04 | Viewport test checklist | QA | Testar em 375px (iPhone SE), 390px (iPhone 14), 430px (iPhone 14 Plus), 360px (Android), 768px (iPad), 1024px (iPad Pro). Documentar breakpoints com screenshots para aprovação |
| A15-05 | Nenhum overflow horizontal em card algum | `globals.css` | `.dashboard-section { overflow: hidden; }` em todos os containers de seção. Recharts: `<ResponsiveContainer width="99%">` (não 100%) para evitar loop de resize |
| A15-06 | Bottom nav — não sobrepor conteúdo scrollável | `globals.css` + layouts | Main content com `padding-bottom: calc(72px + env(safe-area-inset-bottom))` para sempre que bottom nav estiver visível |

***

### SPRINT A16 — ACESSIBILIDADE (A11Y)
**Prioridade: P1 | Duração: 1-2 dias | Impacto: todas as URLs**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A16-01 | Contraste mínimo WCAG AA em todos os textos | Auditoria + fix | Usar Chrome DevTools Accessibility panel. Focos críticos: texto sobre fundo brand-primary (verificar se branco passa 4.5:1), texto muted em light mode (mínimo 4.5:1 para texto normal, 3:1 para texto grande). Ajustar `--text-muted` de `#94A3B8` para `#64748B` em light mode se necessário |
| A16-02 | Focus ring visível em todos os interativos | `globals.css` | `*:focus-visible { outline: 3px solid var(--brand-primary); outline-offset: 2px; border-radius: var(--radius-sm); }`. Remover `outline: none` de qualquer lugar que não seja `focus:not(:focus-visible)` |
| A16-03 | Aria-labels em ícones standalone | Todos os botões ícone | Botão play no card de treino: `aria-label="Iniciar treino HIPERTROFIA"`. Botão de notificação: `aria-label="Notificações, 20 não lidas"`. Sair: `aria-label="Sair da conta"`. Menu: `aria-label="Abrir menu de navegação"` |
| A16-04 | Roles semânticos corretos | Todas as pages | KPI cards: usar `<article>` ou `role="region"` com `aria-label`. Chips de status: `role="status"` nos badges de "ATIVO", "ATRASADO". Bottom nav: `<nav aria-label="Navegação principal">`. Progress bar: `role="progressbar" aria-valuenow={10} aria-valuemin={0} aria-valuemax={100}` |
| A16-05 | Screen reader — conteúdo oculto decorativo | Idem | Ícones puramente decorativos: `aria-hidden="true"`. Animações e SVGs decorativos: `aria-hidden="true"`. Textos visualmente ocultos mas necessários para SR: usar classe `.sr-only` (já existe no Tailwind) |

***

### SPRINT A17 — MODO ESCURO — POLIMENTO FINO
**Prioridade: P1 | Duração: 1 dia | Impacto: todas as URLs**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A17-01 | Auditoria de contraste em dark mode | QA visual | Os cards escuros agora funcionam corretamente em dark mode (confirmado nas screenshots iniciais), mas verificar: texto `text-text-muted` sobre `bg-surface-card` dark deve ter mínimo 3:1. Ajustar `--text-muted` dark para `#94A3B8` se `#64748B` não passar |
| A17-02 | Sombras em dark mode | `globals.css` | Em dark mode, sombras tradicionais somem. Usar `border: 1px solid var(--border-light)` como substituto de elevação. Cards de nível 2 (modais, dropdowns): `border-color: var(--border-dark)` |
| A17-03 | Light mode — cards de seção sem fundo escuro | `dashboard/page.tsx` e sub-componentes | Verificar após A1-01: cada card usa `bg-surface-card` (não hex). Em light mode `bg-surface-card = #F8FAFC`. Adicionar `border: 1px solid var(--border-light)` em todos para manter definição visual sem sombra pesada |
| A17-04 | Inputs em dark mode | `globals.css` | `input, textarea, select { background: var(--surface-card); border-color: var(--border-light); color: var(--text-primary); }`. Focus: `border-color: var(--brand-primary); box-shadow: 0 0 0 4px rgba(34,197,94,0.15)` |
| A17-05 | Scrollbar estilizada | `globals.css` | `::-webkit-scrollbar { width: 6px; height: 6px; }`. `::-webkit-scrollbar-track { background: transparent; }`. `::-webkit-scrollbar-thumb { background: var(--border-dark); border-radius: 9999px; }`. `::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }` |

***

### SPRINT A18 — PERFORMANCE E POLISH FINAL
**Prioridade: P1 | Duração: 2 dias**

| ID | Tarefa | Arquivo | Detalhe Técnico |
|----|--------|---------|-----------------|
| A18-01 | `will-change` seletivo | `globals.css` | Aplicar `will-change: transform` SOMENTE em: cards com hover elevation, bottom nav ativo, FAB, page transition wrapper. NUNCA aplicar globalmente |
| A18-02 | `content-visibility: auto` em listas longas | Componentes de lista | Cards de lista com mais de 10 itens: `content-visibility: auto; contain-intrinsic-size: 0 80px` para melhorar rendering performance |
| A18-03 | Lazy blur-up em imagens | `components/optimized-image.tsx` | Placeholder: `blur(20px)` no elemento, com `<img onLoad={() => setLoaded(true)}`. Quando loaded: `transition: filter 400ms ease; filter: blur(0)`. Aplicar em: foto de perfil do header, foto de perfil nas configurações |
| A18-04 | Zero `console.error` em light mode | QA | Rodar app em light mode com DevTools aberto. Qualquer erro de token/var CSS faltando ou `NaN` deve ser corrigido. Meta: zero erros no console em todas as 5 páginas do aluno |
| A18-05 | Build de produção sem warnings | Terminal | `npm run build` deve completar sem erros ou warnings de Tailwind, TypeScript ou Next.js. Especialmente verificar: tipos dos novos ícones SVG, `any` implícitos nos utilitários de formatação |

***

### RESUMO EXECUTIVO DO PLANO COMPLETO

| Sprint | Nome | Prioridade | Duração | URLs Impactadas |
|--------|------|-----------|---------|-----------------|
| A1 | Correções Críticas de Tema Light Mode | P0-BLOQUEADOR | 2-3 dias | `/dashboard`, `/dashboard/payments` |
| A2 | Tipografia, Hierarquia e Remoção de Emoji | P0 | 2 dias | Todas |
| A3 | Botões: Hierarquia, Altura e Contraste | P0 | 2 dias | `/dashboard/workouts/execute` |
| A4 | Dashboard: Cards KPI e Gamificação Premium | P1 | 3 dias | `/dashboard` |
| A5 | Header e Navegação Global | P0 | 2 dias | Todas |
| A6 | Execução de Treino | P1 | 2-3 dias | `/dashboard/workouts/execute` |
| A7 | Página de Treinos (Lista) | P1 | 1-2 dias | `/dashboard/workouts` |
| A8 | Página de Cobranças | P1 | 2 dias | `/dashboard/payments` |
| A9 | Página de Avaliações | P1 | 1 dia | `/dashboard/assessments` |
| A10 | Configurações | P2 | 2 dias | `/dashboard/settings` |
| A11 | Sistema de Ícones SVG Premium (Global) | P0 | 2 dias | Todas |
| A12 | Tokens de Cor e Sombra — Auditoria Final | P0 | 1 dia | `globals.css` |
| A13 | Glassmorphism e Efeitos de Profundidade | P2 | 1-2 dias | Header, nav, modais |
| A14 | Microinterações e Animações | P2 | 2 dias | Todas |
| A15 | Responsividade e Touch Targets | P1 | 2 dias | Todas |
| A16 | Acessibilidade (A11Y) | P1 | 1-2 dias | Todas |
| A17 | Modo Escuro — Polimento Fino | P1 | 1 dia | Todas |
| A18 | Performance e Polish Final | P1 | 2 dias | Todas |

**Total estimado: 16-18 dias de trabalho focado divididos em 18 sprints independentes e deployáveis.**

***

### ORDEM DE EXECUÇÃO RECOMENDADA

```
SEMANA 1 — BLOQUEADORES (P0)
Dia 1-2: A12 → tokens base primeiro (base para tudo)
Dia 2-3: A1  → fix light mode quebrado
Dia 3-4: A11 → biblioteca de ícones SVG
Dia 4-5: A2  → tipografia + remoção de emoji
Dia 5-6: A3  → botões com hierarquia correta
Dia 6-7: A5  → header + bottom nav

SEMANA 2 — CORE UX (P1)
Dia 8-9:   A6  → execução de treino
Dia 9-10:  A4  → dashboard premium
Dia 10-11: A7  → lista de treinos
Dia 11-12: A8  → cobranças (fix NaN incluso)
Dia 12:    A9  → avaliações empty state
Dia 13-14: A15 → responsividade + touch targets
Dia 14-15: A16 → acessibilidade
Dia 15:    A17 → dark mode polish

SEMANA 3 — POLISH FINAL (P2)
Dia 16:    A10 → configurações
Dia 16-17: A13 → glassmorphism
Dia 17-18: A14 → microinterações
Dia 18:    A18 → performance + build final
```

***

### REGRA DE OURO PARA CADA SPRINT

Antes de cada sprint:
```bash
git checkout main && git pull
```
Após cada sprint:
```bash
npm run build    # zero errors obrigatório
# visual check: light mode + dark mode + mobile 375px
git commit -m "sprint A[N]: descrição"
```

**Nenhum sprint é acumulado sem deploy e validação visual em ambos os modos de cor.**

Este é o plano 100% completo. Todo detalhe visual identificado nas screenshots foi coberto, da correção crítica do NaN e do light mode quebrado até o polimento final de glassmorphism, haptics, acessibilidade e performance.