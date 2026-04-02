# Plano Executivo ULTRA Completo — Redesign Massivo (Light + Dark) — 24/02/2026

> **Objetivo:** transformar o VFIT em um dashboard **premium, ultra-minimalista, rápido e consistente**, inspirado nas referências:
> - Energy Dashboard (sidebar escura + KPIs hero): https://syrup-text-13395340.figma.site/
> - Payment Successful (clean + focado): https://botany-cinch-32364957.figma.site/
> - Desktop ultra minimal (nav + ícones): https://chain-evade-33063161.figma.site/
> - Calendário (agenda + status + grid): https://claim-pants-29032711.figma.site/
>
> **Estado atual:** já existe base forte (tokens em globals.css, sidebar premium, KPIs hero, cards mais clean). Este plano é para evoluir para “nível enterprise”.

---

## 1) Norte (o que é “perfeito”)

### 1.1 Princípios
1. **Consistência > criatividade** (um sistema, não páginas isoladas).
2. **Hierarquia visual**: 1 coisa “hero” por seção; o resto é suporte.
3. **Densidade controlada**: desktop “mais informação”, mobile “menos ruído”.
4. **Zero overflow acidental**: nada “vaza” do card, nada quebra layout.
5. **Dark mode first-class**: não é inversão; é um tema com tokens próprios.

### 1.2 Metas mensuráveis (UX)
- Scroll/padding: **0 layout shift** ao carregar (onde possível).
- Toasts: empilhamento suave + não encosta no notch/gestos.
- Cards: mesmas alturas por grid; números sempre alinhados.
- Ícones: 1 estilo (stroke/size/opacidade) — sem mistura.

---

## 2) Arquitetura do Design System (sem quebrar o app)

### 2.1 Estratégia de tokens
**Regra:** adicionar tokens e migrar progressivamente.

**Fonte:** [src/app/globals.css](src/app/globals.css)

#### Tokens obrigatórios (UI)
- Layout
  - `--color-bg-page` (fundo “frio”)
  - `--color-bg-card` (card no light)
  - `--color-bg-card-dark` (card no dark)
- Sidebar
  - `--color-sidebar-bg`, `--color-sidebar-active`, `--color-sidebar-text`, `--color-sidebar-dot`
- Tipografia
  - tamanhos fixos: `title`, `subtitle`, `label`, `value`, `mono`
- Borders/shadows
  - sombras padronizadas: `--shadow-card`, `--shadow-card-hover`, `--shadow-nav`

#### Tokens de estados
- `success/warning/error/info` com **bg/fg** definidos para light e dark.

### 2.2 Utilitários obrigatórios
- `.sidebar-premium` (solid premium)
- `.kpi-hero` (fundo escuro, borda leve, sombra)
- `.surface` (card branco no light, “elevado” no dark)
- `.divider-soft` (separadores sutis)

---

## 3) Layout “Ultra Minimal Desktop” (inspirado no chain-evade)

### 3.1 Header (Topbar)
Arquivo: [src/components/layout/header.tsx](src/components/layout/header.tsx)

**Objetivo:** header extremamente limpo, com:
- brand mark pequeno
- título da página
- busca
- ações compactas

**Mudanças planejadas (próximo ciclo):**
- `Breadcrumbs` opcionais (ex.: Financeiro → Cobranças)
- Título da página pode ir para a direita em páginas “data-heavy” (modo analytics)
- Botão `Sair` já no header (feito). Pode virar “menu do usuário” (dropdown).

### 3.2 Sidebar (Desktop)
Arquivo: [src/components/layout/sidebar.tsx](src/components/layout/sidebar.tsx)

**Meta:** igual referência: ativo com pill + dot, inativos com opacidade.

**Evoluções:**
- compact mode: tooltips + ícones alinhados
- foco acessível: outline consistente

### 3.3 Spacing e grid
Arquivo: [src/components/layout/dashboard-layout.tsx](src/components/layout/dashboard-layout.tsx)

**Padrão proposto:**
- Mobile: `p-4`, `gap-4`, `rounded-xl`
- Desktop: `p-6`, `gap-6`, `rounded-2xl` (apenas em seções hero)

---

## 4) Cards de estatísticas “última geração” (inspirado no syrup)

### 4.1 KPI Hero (linha 1)
Componente: [src/components/dashboard/stats-card.tsx](src/components/dashboard/stats-card.tsx)

**Objetivo:**
- fundo escuro premium
- valor grande + unidade menor
- badge de status (normal/high/optimal)
- micro-trend (+5.2%)

**Implementação (próximo):**
- `tone="hero-dark"` já existe — evoluir para:
  - `statusBadge?: 'normal'|'high'|'optimal'|...`
  - `unit?: string` (kVA, kg, %)
  - `sparkline?: number[]` (mini gráfico)

### 4.2 KPI Standard (linha 2)
- card branco “clean”
- borda suave + sombra leve
- sem gradiente exagerado

---

## 5) Charts (mais modernos que a referência)

### 5.1 Diretrizes
- Fundo transparente
- Gridlines mínimas
- Tooltip “glass”
- Paleta: verde como série principal, cinza como secundária
- **Empty state** sempre bonito

### 5.2 Padronização
Criar um wrapper de chart:
- `ChartCard` (title, subtitle, rightActions)
- `ChartLegend` padronizada
- `ChartSkeleton` idêntico em todas páginas

---

## 6) Toasts “Ultra Modern” (sem bugs de overflow)

Arquivo atual: [src/components/layout/toast-container.tsx](src/components/layout/toast-container.tsx)

**Objetivo do upgrade:**
- largura responsiva sem “estourar” no mobile
- stacking com `max` + colapso suave
- ação secundária opcional (ex.: “Desfazer”)
- acessibilidade: `role="status"`, foco no botão fechar

**Hard rules:**
- toast nunca deve ultrapassar `100vw`
- respeitar `safe-area-inset-bottom`

---

## 7) Páginas de pagamento “ultra clean” (botany)

### 7.1 Caso de uso
- Checkout concluído
- Confirmação de pagamento
- Estado de sucesso/erro

**Implementação:**
- layout sem sidebar/topbar (foco total)
- card central com separadores
- botões: primário (escuro) + secundário (outline)

---

## 8) Calendário + notificações (claim-pants)

### 8.1 MVP (sem depender de integrações externas)
- visão semanal + diária
- filtros (professor/cliente/status)
- criação rápida

### 8.2 Notificações
- in-app + push (OneSignal)
- lembretes: 24h / 1h / 15min

### 8.3 Estrutura recomendada
- Tabela `calendar_events`
- Worker cron para lembretes
- UI com drag/drop (fase 2)

---

## 9) Avatar (R2) — “funcionar perfeitamente”

### 9.1 Requisitos
- URL sempre https
- cache-control correto
- fallback para iniciais

### 9.2 Padronização
- garantir que uploads gerem URL final (CDN / images domain)
- normalizar `avatar_url` no backend
- evitar `unoptimized` quando possível (se domínios permitirem) — ou manter, mas garantir performance via cache.

Arquivos relevantes:
- [src/components/ui/avatar.tsx](src/components/ui/avatar.tsx)
- [src/components/profile/photo-upload.tsx](src/components/profile/photo-upload.tsx)

---

## 10) Vídeos dos treinos: R2 vs Stream (recomendação)

### 10.1 Recomendação executiva
- **Cloudflare Stream** para entrega (transcoding + ABR + start rápido + analytics).
- **R2** como storage “bruto” (ou backup) e para assets não-vídeo (thumbs, imagens, PDFs).

### 10.2 Quando usar R2 puro
- poucos vídeos
- vídeos curtos
- você controla encoding (HLS) e range requests

### 10.3 Quando Stream é obrigatório
- catálogo grande
- dispositivos variados + 3G/4G
- precisa de HLS/DASH e qualidade automática

---

## 11) Roadmap de execução (sem travar produção)

### Sprint A (UI System Hardening)
- Tokens finalizados + utilitários
- Toast upgrade
- Grid/padding “perfeito”

**Checklist Sprint A (ultra detalhado):**
- [x] `Surface/Card` unificado (white no light, elevated no dark) em todo dashboard
- [x] `ToastContainer` sem overflow, stack limitado, safe-area e acessível
- [x] Remover hardcodes de cores/bordas no header e usar tokens
- [x] Ajustar `max-w` e paddings por breakpoint (sem “buracos” no desktop e sem aperto no mobile)

### Sprint B (Charts Pro)
- Chart wrappers
- Tooltips/legendas
- Empty states premium

**Checklist Sprint B (ultra detalhado):**
- [x] `ChartCard` (title, subtitle, rightActions, skeleton)
- [x] Tooltip glass padrão
- [x] Legend com swatches coerentes (verde primário, cinza secundário)
- [ ] Gridlines mínimas e ticks consistentes
- [ ] Modo dark: contraste correto (sem cinza “lavado”)

### Sprint C (Payments Clean)
- páginas clean (success/error)
- consistência de botões

**Checklist Sprint C:**
- [ ] Layout “sem nav” para páginas de confirmação
- [ ] Separadores horizontais suaves
- [ ] Botão primário escuro + secundário outline
- [ ] Estado de erro (retry + contato)

### Sprint D (Calendar MVP)
- CRUD + weekly view
- lembretes

**Checklist Sprint D:**
- [ ] Visão semanal com grid (7 dias)
- [ ] Filtros por aluno/personal/status
- [ ] Criar/editar evento (modal)
- [ ] Notificação in-app + push (lote) com cron

### Sprint E (Media)
- decisão Stream vs R2
- pipeline upload + thumbnail

**Checklist Sprint E:**
- [ ] Upload de vídeo + progresso
- [ ] Thumbnail automática
- [ ] Playback estável em 3G/4G
- [ ] Política de cache e expiração

---

## 14) Backlog por Épico (arquivos + entregas)

### Épico 1 — Layout/Spacing “perfeito”
**Entregas:**
- `LayoutPaddingSpec` (doc interno com `p/gap` por breakpoint)
- “No overflow policy” (nenhum componente pode vazar)

**Tarefas:**
- [ ] Revisar `DashboardLayout` wrappers e padronizar containers
- [ ] Revisar cards e listas para `overflow-hidden` onde necessário
- [ ] Revisar inputs/botões para alturas consistentes

### Épico 2 — KPI cards (ultra moderno)
**Entregas:**
- KPI Hero com: unidade, status badge, trend, (opcional) sparkline

**Tarefas:**
- [ ] Evoluir `StatsCard` com props opcionais (`unit`, `status`, `sparkline`)
- [ ] “Modo analytics” (densidade maior no desktop)

### Épico 3 — Charts (premium)
**Entregas:**
- Tooltips glass
- Skeletons consistentes
- Empty states com CTA

### Épico 4 — Toasts/feedback
**Entregas:**
- Toast empilhado com limite
- Ação secundária (ex.: desfazer)
- A11y e safe-area

### Épico 5 — Payments (página clean)
**Entregas:**
- Success/Failure pages sem sidebar/topbar
- Informação organizada em linhas + separators

### Épico 6 — Calendário + notificações
**Entregas:**
- MVP semanal + CRUD
- Notificações com cron

### Épico 7 — Avatar/Media (R2/Stream)
**Entregas:**
- Avatar 100% confiável (fallback em erro)
- Pipeline de mídia recomendado

---

## 15) Critérios de Aceite (por tema)

### Light
- [ ] Fundo `bg-page` frio, cards brancos com sombra leve
- [ ] Tipografia com contraste (nada “apagado”)
- [ ] Sidebar sempre premium (escura) com textos legíveis

### Dark
- [ ] Cards elevam sem virar “cinza chapado”
- [ ] Texto secundário legível, mas sem competir
- [ ] Gráficos com linhas/gridlines discretas

---

## 12) Entregáveis
- Documento de tokens “oficial”
- Component library (Card, KPI, ChartCard, Toast)
- 1 página “flagship” (Dashboard) com o novo padrão
- Calendário MVP com notificações

---

## 13) Notas operacionais
- Deploy sempre via script: `node scripts/cf-deploy.js ...`
- Atualizar changelog a cada deploy: [docs/CHANGELOG.md](docs/CHANGELOG.md)
