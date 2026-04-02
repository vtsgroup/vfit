# 🎨 PLANO VISUAL ULTRA — VFIT
> **Versão:** 2.0 · **Criado:** 14/02/2026 · **Concluído:** 14/02/2026
> **Objetivo:** Transformar o VFIT em um produto visualmente impecável, com cara de app nativo no mobile e experiência premium em todas as telas.
> **Status:** ✅ **CONCLUÍDO** — Todos os 7 sprints executados com sucesso.

---

## 📊 AUDITORIA — Estado Atual

### Scores por Área
| Área | Score | Diagnóstico |
|---|---|---|
| Landing Footer | 3/10 | 7 links mortos (`#`), legais existem mas não linkadas |
| Mobile Bottom Nav | 9/10 | Excelente (framer + haptic + safe area), porém ícones quadrados |
| Dashboard Layout | 8/10 | Sólido, 3 páginas fantasma (IA, Relatórios, Reviews) |
| Loading States | 5/10 | Básico (Spinner genérico), sem skeletons contextuais, sem overlay |
| Turnstile Widget | 4/10 | Largura inconsistente, layout shift ao carregar |
| Login/Register | 7/10 | Bonito mas inconsistência de componentes entre páginas |
| AI Features | 2/10 | 8 endpoints backend prontos, ZERO frontend para acessá-los |
| Animações | 7/10 | Framer Motion nas áreas certas, CSS subutilizado |
| Design System CSS | 9/10 | Completo, glassmorphism, tokens, animations |
| Páginas Institucionais | 2/10 | Só existem termos/privacidade/cookies — falta sobre, blog, contato, LGPD, carreiras |

### Páginas Fantasma (404)
| Rota | No menu? | Existe? |
|---|---|---|
| `/dashboard/ai` | ✅ Sidebar + Mobile Nav | ❌ **404** |
| `/dashboard/reports` | ✅ Sidebar | ❌ **404** |
| `/dashboard/reviews` | ✅ Sidebar | ❌ **404** |
| `/sobre` | ✅ Footer | ❌ **LINK MORTO `#`** |
| `/blog` | ✅ Footer | ❌ **LINK MORTO `#`** |
| `/carreiras` | ✅ Footer | ❌ **LINK MORTO `#`** |
| `/contato` | ✅ Footer | ❌ **LINK MORTO `#`** |
| `/lgpd` | ✅ Footer | ❌ **LINK MORTO `#`** |

### Links do Footer Quebrados
```
Footer → "Sobre nós"     → href="#"   → ❌ deveria ser /sobre
Footer → "Blog"          → href="#"   → ❌ deveria ser /blog
Footer → "Carreiras"     → href="#"   → ❌ deveria ser /carreiras
Footer → "Contato"       → href="#"   → ❌ deveria ser /contato
Footer → "Termos de uso" → href="#"   → ❌ deveria ser /termos (página EXISTE!)
Footer → "Privacidade"   → href="#"   → ❌ deveria ser /privacidade (página EXISTE!)
Footer → "Cookies"       → href="#"   → ❌ deveria ser /cookies (página EXISTE!)
Footer → "LGPD"          → href="#"   → ❌ deveria ser /lgpd
```

---

## 🏗️ PLANO DE EXECUÇÃO — 7 Sprints

---

### SPRINT 1 — 🔧 Quick Fixes Críticos (2-3h)
> Corrige tudo que está quebrado AGORA. Zero funcionalidade nova.

#### 1.1 Footer — Corrigir TODOS os links mortos
**Arquivo:** `src/components/landing/footer.tsx`
- [ ] Linkar "Termos de uso" → `/termos`
- [ ] Linkar "Privacidade" → `/privacidade`
- [ ] Linkar "Cookies" → `/cookies`
- [ ] Linkar "Sobre nós" → `/sobre` (criar página Sprint 3)
- [ ] Linkar "Blog" → `/blog` (criar página Sprint 3)
- [ ] Linkar "Carreiras" → `/carreiras` (criar página Sprint 3)
- [ ] Linkar "Contato" → `/contato` (criar página Sprint 3)
- [ ] Linkar "LGPD" → `/lgpd` (criar página Sprint 3)
- [ ] Adicionar links sociais reais (Instagram, YouTube, LinkedIn) ou remover os mortos

#### 1.2 Turnstile — Layout Shift Fix
**Arquivos:** `src/components/auth/turnstile.tsx`, `src/app/(auth)/login/page.tsx`
- [ ] Adicionar `min-h-[65px]` placeholder no container Turnstile para evitar layout shift
- [ ] Definir largura `w-full max-w-full` no Turnstile para igualar aos campos do form
- [ ] Remover hack `[&_iframe]{max-height:65px}` do login (não funciona em Tailwind v4)
- [ ] Criar wrapper `<div className="w-full">` no Turnstile para ele ocupar 100% do form
- [ ] Adicionar skeleton/shimmer enquanto o Turnstile carrega (estado loading)

#### 1.3 Login — Padronizar com Register
**Arquivo:** `src/app/(auth)/login/page.tsx`
- [ ] Trocar inputs raw `<input>` pelos componentes `<Input>` e `<Label>` usados no Register
- [ ] Igualar altura dos campos (`h-10` padrão)
- [ ] Garantir que o botão submit tenha mesma altura que o Turnstile e campos
- [ ] Adicionar `focus-visible:ring-2 focus-visible:ring-brand-primary/30` consistente

#### 1.4 Remover Páginas Fantasma do Nav
**Arquivo:** `src/lib/navigation.ts`
- [ ] Remover `/dashboard/reviews` do nav (Star icon) — não será implementado agora
- [ ] Remover `/dashboard/reports` do nav (BarChart3 icon) — mover para dentro da página IA
- [ ] Manter `/dashboard/ai` (será criado Sprint 5)

---

### SPRINT 2 — 📱 Mobile Native Feel (4-6h)
> Fazer o PWA parecer um app nativo. Foco em touch, gestures, visual.

#### 2.1 Bottom Nav Upgrade — Ultra Modern
**Arquivo:** `src/components/layout/mobile-bottom-nav.tsx` (ou similar)

Design Target: Bottom nav com ícones arredondados, pill-shaped active indicator com glow verde, ícone central flutuante (FAB).

- [ ] **Pill-shaped active indicator** — ao invés de barra reta, usar pill com border-radius-3xl e gradiente verde sutil
- [ ] **Ícone central flutuante (FAB)** — o item do meio (IA para personal, Treinos para aluno) deve ser um botão circular elevado (~56px) com sombra glow verde, posicionado `bottom-4` acima do nav
- [ ] **Ícones com variantes** — usar `strokeWidth={1.5}` nos inativos e fill nos ativos (não apenas cor)
- [ ] **Label animada** — o label do item ativo aparece com `animate-slide-up`, os inativos somem
- [ ] **Backdrop blur no nav** — `bg-zinc-950/80 backdrop-blur-xl` para transparência premium
- [ ] **Safe area bottom** — `pb-[env(safe-area-inset-bottom)]` para iPhone home indicator
- [ ] **Dot notification** — badge vermelho no ícone de Mensagens quando há unread
- [ ] **Largura máxima** — `max-w-md mx-auto` para não esticar em tablets

#### 2.2 Pull-to-Refresh
**Novo componente:** `src/components/ui/pull-to-refresh.tsx`
- [ ] Gesto de pull-down no container principal do dashboard
- [ ] Spinner brand-primary aparece com spring animation
- [ ] Dispara `queryClient.invalidateQueries()` no release
- [ ] Threshold: 80px pull, bounce-back com framer-motion
- [ ] Haptic feedback (`navigator.vibrate(10)`) no threshold

#### 2.3 Gestures & Touch Polish
- [ ] **Swipe to delete** em notificações — gesto horizontal com reveal de botão delete
- [ ] **Long press** em cards de aluno/treino → context menu (Editar, Excluir, Compartilhar)
- [ ] **Tap feedback** global — `active:scale-[0.97]` em todos os botões interativos
- [ ] **Momentum scroll** — `-webkit-overflow-scrolling: touch` em containers scrolláveis
- [ ] **Overscroll-behavior** — `overscroll-behavior-y: contain` no dashboard para evitar pull do Chrome

#### 2.4 Status Bar & Chrome
- [ ] Verificar `theme-color` meta tag muda para `#09090B`
- [ ] `apple-mobile-web-app-status-bar-style: black-translucent` — conteúdo sob status bar
- [ ] CSS: `.standalone-mode` detectado via media query `(display-mode: standalone)`
- [ ] Em standalone mode, ajustar padding-top extra para status bar
- [ ] Testar iOS Safari, Chrome Android, Samsung Internet

#### 2.5 Page Transitions Premium
**Arquivo:** `src/components/layout/page-transition.tsx` (existente — melhorar)
- [ ] Transição de página com **shared element** (avatar se mantém entre lista e detalhe)
- [ ] Fade + slide com direction (swipe left = slide right)
- [ ] Duração curta (200ms) com `ease-out` para responsividade
- [ ] Loading bar no topo (NProgress style) em verde durante navigation

---

### SPRINT 3 — 📄 Páginas Institucionais (3-4h)
> Todas as páginas do footer devem existir. Design premium.

#### 3.1 Layout Institucional
**Novo arquivo:** `src/app/(institutional)/layout.tsx`
- [ ] Layout compartilhado: Navbar landing + Footer landing
- [ ] Background com mesh-gradient sutil
- [ ] Container `max-w-4xl mx-auto px-6 py-16`
- [ ] Breadcrumb discreto no topo

#### 3.2 Páginas a Criar

**`/sobre` — Sobre Nós**
- [ ] Hero com missão da empresa
- [ ] Seção "Nossa história" com timeline
- [ ] Seção "Nossos valores" (cards com ícones)
- [ ] Seção "Equipe" (cards com fotos/nomes/cargos) — pode ser placeholder
- [ ] Números (alunos, personals, treinos criados) — dados reais da API ou placeholder
- [ ] CTA "Comece grátis"

**`/blog` — Blog**
- [ ] Grid de artigos placeholder (6-8 posts fictícios sobre fitness/tech)
- [ ] Cards com imagem, título, resumo, data, tag de categoria
- [ ] Filtro por categoria (Fitness, Tecnologia, Dicas, Novidades)
- [ ] Página de artigo individual `/blog/[slug]` com layout de leitura
- [ ] **Futuramente:** Integrar com CMS (Notion API, MDX, ou Contentlayer)

**`/carreiras` — Carreiras**
- [ ] Hero "Trabalhe conosco"
- [ ] Seção "Cultura da empresa"
- [ ] Lista de vagas (pode estar vazio com mensagem "Sem vagas no momento, mas estamos sempre abertos a conhecer talentos!")
- [ ] Formulário simples (nome, email, LinkedIn, mensagem) → enviar via Resend
- [ ] Design inspirador com frases motivacionais

**`/contato` — Contato**
- [ ] Formulário de contato (nome, email, assunto, mensagem)
- [ ] Validação Zod no frontend
- [ ] Turnstile anti-bot
- [ ] Envio via API → Resend email
- [ ] Informações de contato (email, Instagram, horário de atendimento)
- [ ] FAQ collapse (5-8 perguntas frequentes)
- [ ] Mapa ou localização (opcional)

**`/lgpd` — Política LGPD**
- [ ] Mesmo estilo visual das outras páginas legais (termos, privacidade, cookies)
- [ ] Conteúdo sobre tratamento de dados, direitos do titular, DPO
- [ ] Link para solicitar exclusão de dados
- [ ] Link para contato do DPO

#### 3.3 Atualizar sitemap.xml
**Arquivo:** `public/sitemap.xml`
- [ ] Adicionar todas as novas URLs públicas (/sobre, /blog, /carreiras, /contato, /lgpd)
- [ ] Adicionar URLs de artigos do blog quando existirem

---

### SPRINT 4 — ✨ Animações & Loading Premium (3-4h)
> Micro-interactions, loading overlays, skeleton screens contextuais.

#### 4.1 Loading Overlay Global
**Novo componente:** `src/components/ui/loading-overlay.tsx`
- [ ] Overlay `fixed inset-0 z-50` com fundo `bg-zinc-950/80 backdrop-blur-sm`
- [ ] Logo VFIT no centro com animação `glow-pulse`
- [ ] Spinner orbital (3 dots girando) em verde
- [ ] Texto contextual ("Gerando treino...", "Processando pagamento...", "Carregando...")
- [ ] Variante: `fullscreen` (cobre tudo) vs `inline` (dentro de um card)
- [ ] Hook `useLoadingOverlay()` — `show(message)` / `hide()`

#### 4.2 Skeleton Screens Contextuais
**Novo arquivo:** `src/components/ui/skeletons.tsx`
- [ ] `StudentCardSkeleton` — shimmer com avatar circle + 2 linhas
- [ ] `WorkoutCardSkeleton` — shimmer com título + 3 exercise lines
- [ ] `PaymentRowSkeleton` — shimmer com table row
- [ ] `StatsCardSkeleton` — shimmer com número grande + label
- [ ] `ChatMessageSkeleton` — bolhas alternadas shimmer
- [ ] `AssessmentCardSkeleton` — shimmer com foto placeholder + métricas
- [ ] Cada skeleton deve ter **exatamente** o mesmo tamanho do componente real → zero layout shift
- [ ] Usar `animate-shimmer` do design system

#### 4.3 Stagger Animations em Listas
**Pattern a aplicar em todas as listas:**
```tsx
// Cada item da lista entra com delay crescente
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05, duration: 0.3 }}
>
```
- [ ] Lista de alunos (`/dashboard/students`)
- [ ] Lista de treinos (`/dashboard/workouts`)
- [ ] Lista de pagamentos (`/dashboard/payments`)
- [ ] Lista de avaliações (`/dashboard/assessments`)
- [ ] Cards do dashboard (stats)
- [ ] Lista de conversas (chat)

#### 4.4 Micro-Interactions
- [ ] **Botões** — `whileTap={{ scale: 0.97 }}` + `whileHover={{ scale: 1.02 }}` em botões primários
- [ ] **Cards** — hover lift `transition-transform hover:-translate-y-0.5` com sombra crescente
- [ ] **Toggle switches** — spring animation no thumb
- [ ] **Checkboxes** — scale bounce ao marcar
- [ ] **Counters** — animação numérica (count up) nos stats cards do dashboard
- [ ] **Success state** — checkmark animado (draw SVG) após salvar/criar com sucesso
- [ ] **Delete confirmation** — shake animation no botão ao tentar excluir
- [ ] **Toast notifications** — slide-in pela direita com spring (já existe, melhorar)

#### 4.5 Page Loading Bar
**Novo componente:** `src/components/ui/loading-bar.tsx`
- [ ] Barra fina (2-3px) no topo absoluto da viewport
- [ ] Cor verde brand-primary com gradiente brilhante
- [ ] Animação: cresce rápido 0→80%, pausa, completa 80→100% quando página carrega
- [ ] Integrar com `next/navigation` `usePathname()` change detection
- [ ] Variante: indeterminate (loop contínuo) para operações sem progresso definido

---

### SPRINT 5 — 🤖 IA Inteligente — Frontend Completo (6-8h)
> Conectar os 8 endpoints de IA do backend com interfaces ultra modernas.

#### 5.1 Página Principal de IA
**Novo arquivo:** `src/app/dashboard/ai/page.tsx`
- [ ] Layout tipo "centro de comando" — grid de cards com as ferramentas IA
- [ ] Header com "IA Assistente" + ícone Bot + indicador de uso mensal (barra de progresso)
- [ ] Cards para cada ferramenta:
  1. 🏋️ **Gerar Treino** — "Crie treinos personalizados com IA"
  2. 📸 **Comparar Fotos** — "Compare evolução com análise visual"
  3. 💬 **Chat Assistente** — "Tire dúvidas sobre treino e nutrição"
  4. 📝 **Gerar Conteúdo** — "Posts para redes sociais"
  5. 💰 **Cobranças Inteligentes** — "Sugestões de preços"
  6. 📊 **Análise de Sentimento** — "Entenda seus alunos"
- [ ] Cada card com ícone, descrição curta, botão "Usar", e indicador de créditos
- [ ] Seção "Uso do mês" — `GET /ai/usage` com gráfico de uso

#### 5.2 Geração de Treino com IA
**Novo componente:** `src/components/ai/workout-generator.tsx`
- [ ] Modal/Drawer que abre ao clicar "Gerar Treino"
- [ ] Step 1: Selecionar aluno (dropdown com busca)
- [ ] Step 2: Configurar treino:
  - Objetivo (hipertrofia, emagrecimento, força, condicionamento, funcional)
  - Complexidade (basic, standard, advanced)
  - Duração estimada
  - Equipamentos disponíveis
  - Instruções extras (textarea)
- [ ] Step 3: **Geração em tempo real** — streaming de resposta (ou polling)
  - Animação de "pensando" (3 dots pulsantes)
  - Texto aparece progressivamente
  - Preview do treino gerado em formato estruturado
- [ ] Step 4: **Revisão e Edição**
  - Treino gerado exibido em cards de exercícios
  - Personal pode editar séries, reps, peso
  - Botão "Regenerar" para tentar de novo
  - Botão "Salvar" → `POST /workouts` com dados do treino gerado
- [ ] **UX Premium:** loading overlay com mensagem "IA analisando perfil do aluno..."

#### 5.3 Chat Assistente IA
**Novo componente:** `src/components/ai/ai-chat.tsx`
- [ ] Interface tipo ChatGPT/Claude — bolhas de conversa
- [ ] Input com envio por Enter
- [ ] Mensagens do assistente aparecem com efeito "typing" (caractere por caractere)
- [ ] Sugestões rápidas em pills ("Como montar treino de peito?", "Substituir supino por?")
- [ ] Histórico da conversa (sessão apenas, não persiste)
- [ ] Contexto: IA sabe sobre o personal e seus alunos (enviar resumo no prompt)

#### 5.4 Comparação de Fotos IA
**Novo componente:** `src/components/ai/photo-comparison.tsx`
- [ ] Upload de 2 fotos (antes e depois)
- [ ] Preview lado a lado com slider (drag para comparar)
- [ ] Envio para `POST /ai/photos/compare`
- [ ] Resultado em markdown formatado — highlights das mudanças
- [ ] Salvar resultado na avaliação do aluno

#### 5.5 Gerador de Conteúdo Marketing
**Novo componente:** `src/components/ai/content-generator.tsx`
- [ ] Tipo de conteúdo: Post Instagram, Story, Bio, Email marketing
- [ ] Tom: Profissional, Casual, Motivacional, Educativo
- [ ] Tema ou palavra-chave
- [ ] Preview do conteúdo gerado com botão "Copiar"
- [ ] Opção de regenerar

#### 5.6 Sugestão Inteligente de Cobranças
**Integrar em:** `src/app/dashboard/payments/create/page.tsx`
- [ ] Botão "💡 Sugestão IA" no formulário de criação de cobrança
- [ ] Envia dados do aluno para `POST /ai/billing/smart`
- [ ] Retorna sugestão de valor, periodicidade, justificativa
- [ ] Personal pode aceitar ou modificar
- [ ] Tooltip "Baseado no perfil do aluno e preços do mercado"

#### 5.7 Integração na Criação de Treinos Existente
**Arquivo:** `src/app/dashboard/workouts/create/page.tsx`
- [ ] Adicionar botão "🤖 Gerar com IA" no topo do formulário
- [ ] Ao clicar, abre o workout-generator como drawer lateral
- [ ] Ao salvar treino gerado, preenche o formulário automaticamente
- [ ] Indicador "Gerado por IA" badge no treino salvo

---

### SPRINT 6 — 🎯 Polish Visual Ultra Modern (4-5h)
> Detalhes que fazem a diferença entre "bom" e "incrível".

#### 6.1 Dashboard Cards Redesign
- [ ] Stats cards com **gradiente de fundo sutil** baseado no tipo (verde = receita, azul = alunos, etc.)
- [ ] **Ícones com container** — ícone dentro de circle com gradiente e glow
- [ ] **Tendência** — seta up/down com porcentagem vs mês anterior
- [ ] **Hover effect** — card expande levemente com sombra crescente
- [ ] **Numbers** — animação count-up ao aparecer na tela (intersection observer)

#### 6.2 Sidebar Redesign
**Arquivo:** `src/components/layout/sidebar.tsx`
- [ ] **Active state** — pill-shaped background com gradiente verde sutil (não só border-left)
- [ ] **Hover** — background zinc-800/50 com transição suave
- [ ] **Ícones** — uniform size, 1.5px stroke, ícone ativo com preenchimento sutil
- [ ] **Seção title** — uppercase letter-spacing, zinc-500, font-mono vibe
- [ ] **Scroll** — se o menu for longo, scroll suave com fade top/bottom
- [ ] **User section** — card glassmorphism com avatar, nome truncado, plano (badge)

#### 6.3 Tables & Lists Redesign
- [ ] Tabelas com `hover:bg-zinc-800/30` row hover
- [ ] Alternating rows sutil `even:bg-zinc-900/30`
- [ ] Badges de status com cores vivas e dot indicator animado
- [ ] Empty states com ilustração SVG (não apenas texto)
- [ ] Pagination com design pill-shaped

#### 6.4 Forms Redesign
- [ ] Todos os inputs com `focus:ring-2 focus:ring-brand-primary/30` + `focus:border-brand-primary`
- [ ] Labels com `text-xs font-medium uppercase tracking-wider text-zinc-500`
- [ ] Error states com shake animation + border-red + text-red
- [ ] Success states com border-green flash
- [ ] Select dropdowns customizados (não native)
- [ ] Textarea com character counter animado

#### 6.5 Empty States Premium
**Novo componente:** `src/components/ui/empty-state.tsx` (melhorar existente)
- [ ] Ilustrações SVG únicas por contexto:
  - Alunos: pessoa com dumbbells
  - Treinos: clipboard vazio com IA sparkle
  - Pagamentos: carteira com coins
  - Avaliações: régua e balança
  - Mensagens: bolhas de chat
- [ ] Mensagem principal + submensagem
- [ ] CTA button (ex: "Convidar primeiro aluno")
- [ ] Animação float sutil na ilustração

#### 6.6 Notification System Upgrade
- [ ] Badge de unread **dinâmico** no header (não hardcoded)
- [ ] Usar `useUnreadMessages()` do chat + notificações
- [ ] Dropdown de notificações no header (quick view sem ir para a página)
- [ ] Notificações agrupadas por tipo/data
- [ ] Sound effect opcional (toggle em settings)

---

### SPRINT 7 — 🔬 Relatórios & Analytics Dashboard (4-5h)
> A seção "Relatórios" que está no nav mas não existe.

#### 7.1 Página de Relatórios
**Integrar na página de IA** (não criar rota separada) — ou mover para `/dashboard/ai` com tabs

- [ ] **Tab 1: Ferramentas IA** — cards das ferramentas (Sprint 5)
- [ ] **Tab 2: Relatórios** — dashboards analíticos
- [ ] **Tab 3: Uso de IA** — histórico de uso e créditos

#### 7.2 Relatórios Disponíveis
- [ ] **Receita mensal** — gráfico de área (últimos 6 meses)
- [ ] **Alunos ativos vs inativos** — donut chart
- [ ] **Treinos por semana** — bar chart
- [ ] **Taxa de conclusão** — percentage circle animado
- [ ] **Top alunos** (mais treinos completados) — leaderboard
- [ ] **Pagamentos pendentes** — lista com aging (1-7d, 8-15d, 15+d)
- [ ] **Exportar PDF** — relatório formatado para impressão

#### 7.3 Análise IA dos Dados
- [ ] Botão "Análise IA" — envia resumo dos dados para o assistente
- [ ] IA retorna insights ("Aluno X está com queda de frequência, considere conversar")
- [ ] Card de insight com ícone, texto, ação sugerida
- [ ] Periodicidade: weekly digest (quando crons estiverem ativos)

---

## 📋 PRIORIZAÇÃO — Ordem de Execução

| # | Sprint | Estimativa | Impacto | Prioridade |
|---|---|---|---|---|
| 1 | Quick Fixes (footer, turnstile, login) | 2-3h | 🔴 Crítico | **P0 — AGORA** |
| 2 | Mobile Native Feel | 4-6h | 🔴 Alto | **P1** |
| 3 | Páginas Institucionais | 3-4h | 🟡 Médio-Alto | **P2** |
| 4 | Animações & Loading | 3-4h | 🟡 Médio | **P2** |
| 5 | IA Inteligente — Frontend | 6-8h | 🔴 Alto | **P1** |
| 6 | Polish Visual Ultra | 4-5h | 🟡 Médio | **P3** |
| 7 | Relatórios & Analytics | 4-5h | 🟢 Médio-Baixo | **P3** |

**Tempo total estimado: 26-35h**

### Ordem sugerida de execução:
```
Sprint 1 (Quick Fixes) → Sprint 4 (Loading/Animações) → Sprint 2 (Mobile) →
Sprint 5 (IA) → Sprint 3 (Páginas) → Sprint 6 (Polish) → Sprint 7 (Relatórios)
```

---

## 🎨 REFERÊNCIAS DE DESIGN

### Paleta Confirma da
| Token | Hex | Uso |
|---|---|---|
| brand-primary | `#00D98E` | Botões, links, badges, glow |
| brand-secondary | `#09090B` | Background principal |
| glass-bg | `rgba(17,17,19,0.7)` | Cards glassmorphism |
| success | `#10B981` | Confirmações |
| warning | `#F59E0B` | Alertas |
| error | `#EF4444` | Erros |

### Princípios de Design
1. **Dark-first** — Tudo é escuro com acentos verdes. Nunca fundo branco nos cards.
2. **Glassmorphism** — Cards com `backdrop-blur` e bordas `white/[0.08]`.
3. **Glow accents** — Botões primários com `box-shadow` verde sutil.
4. **Rounded everything** — Mínimo `rounded-xl`, ideal `rounded-2xl`.
5. **Micro-animations** — Cada interação deve ter feedback visual (scale, color, glow).
6. **Native on mobile** — Zero aparência de "site mobile". Deve parecer app instalado.
7. **Progressive disclosure** — Informação em camadas. Summary → Detail on tap.

### Ícones
- Lucide React (já em uso)
- `strokeWidth={1.5}` padrão para consistência
- Ícones ativos: `fill-current` ou container com background
- Tamanho padrão: `w-5 h-5` (20px)

### Tipografia
- Inter (já em uso)
- Hierarchy: `text-2xl font-black` → `text-lg font-bold` → `text-sm font-medium` → `text-xs text-zinc-500`
- Letter spacing em labels: `tracking-wider uppercase`

---

## 📦 Dependências Necessárias

| Package | Uso | Status |
|---|---|---|
| `framer-motion` | Animações (já instalado) | ✅ |
| `date-fns` | Timestamps relativos (já instalado) | ✅ |
| `recharts` | Gráficos (já instalado para dashboard) | ✅ Verificar |
| `react-markdown` | Renderizar respostas da IA | ❌ Instalar |
| `react-dropzone` | Upload de fotos (comparação IA) | ❌ Instalar |
| `vaul` | Drawer/Sheet mobile-native | ❌ Instalar (opcional) |
| `react-hot-toast` ou `sonner` | Toast premium (se quiser trocar) | 🟡 Avaliar |
| `nprogress` | Loading bar topo (ou implementar custom) | 🟡 Avaliar |

---

## ✅ CRITÉRIOS DE SUCESSO

### Para considerar "Ultra Moderno":
- [ ] Zero links mortos no footer ou nav
- [ ] Zero layout shift (Turnstile, loading states)
- [ ] Todas as transições de página com animação suave
- [ ] Bottom nav com FAB central flutuante e glow
- [ ] Skeleton loading em 100% das listas
- [ ] IA funcional com pelo menos 3 ferramentas (treino, chat, conteúdo)
- [ ] Todas as páginas do footer existem e tem conteúdo
- [ ] Pull-to-refresh no mobile
- [ ] Loading overlay em operações longas (IA, pagamentos)
- [ ] Stagger animations em listas de cards
- [ ] Empty states com ilustrações SVG
- [ ] Nota do Lighthouse ≥ 90 em Performance, Accessibility, SEO

### Para considerar "App Nativo":
- [ ] Bottom nav pill-shaped com haptic feedback
- [ ] Safe area iOS respeitada
- [ ] Standalone mode (PWA instalado) sem Chrome UI
- [ ] Pull-to-refresh nativo
- [ ] Page transitions < 200ms
- [ ] Swipe gestures em listas
- [ ] Status bar dark/transparent
- [ ] Splash screen customizada
- [ ] No rubber-banding on overscroll
- [ ] Touch targets ≥ 44px (Apple HIG)

---

## 📝 NOTAS

- **NÃO alterar** a arquitetura backend — tudo está estável
- **NÃO alterar** os hooks de auth guard — padrão validado
- **NÃO alterar** a lógica de pagamentos/webhooks
- **Manter** Tailwind v4 + Inter font + glassmorphism aesthetic
- **Priorizar** mobile experience (70%+ dos usuários serão mobile)
- **Testar** em iPhone SE (menor tela), iPhone 15 Pro, Samsung Galaxy A52 (mid-range Android)
