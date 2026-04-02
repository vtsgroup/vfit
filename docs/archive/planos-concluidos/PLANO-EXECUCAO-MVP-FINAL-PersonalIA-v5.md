# 🚀 VFIT — PLANO DE EXECUÇÃO MVP FINAL

> **v4.7.3 → v5.0** · 20 Sprints · 6 Fases · 153 Tarefas  
> **Data:** 08 de Março de 2026  
> **Preparado para:** Victor Agostinho Melo Duarte — Principal Engineering Architect & Growth Ops  
> **Estimativa total:** 8-12 semanas de trabalho focado

---

## 📋 RESUMO EXECUTIVO

Este documento detalha **20 sprints em 6 fases** para transformar o VFIT v4.7.3 no MVP Final v5.0.

| # | Fase | Foco |
|:-:|------|------|
| 1 | **Google Play Fixes Críticos** | 4 sprints para aprovação (responsividade, loading, empty states, fluxo aluno) |
| 2 | **Exercícios & Treinos** | 4 sprints (grupos musculares, biblioteca, builder, execução) |
| 3 | **Avaliação Ultra Moderna** | 3 sprints (PDF premium, fotos, compartilhamento) |
| 4 | **UI Modernização** | 4 sprints (design system 3D, animações, dashboards, responsividade) |
| 5 | **Marketplace** | 2 sprints (catálogo, checkout com Asaas) |
| 6 | **Performance & QA** | 3 sprints (otimização, PWA/TWA polish, QA final) |

---

## 📊 VISÃO GERAL DAS FASES

| Fase | Sprints | Tarefas | Duração | Prioridade |
|------|:-------:|:-------:|---------|:----------:|
| GOOGLE PLAY: FIXES CRÍTICOS | 4 | 31 | 2-3d, 1-2d, 2-3d, 3-4d | 🔴 CRÍTICO |
| EXERCÍCIOS & SISTEMA DE TREINOS | 4 | 31 | 3-4d, 3-4d, 3-4d, 3-4d | 🟡 ALTO |
| AVALIAÇÃO FÍSICA ULTRA MODERNA | 3 | 24 | 4-5d, 3-4d, 2-3d | 🟡 ALTO |
| UI/UX MODERNIZAÇÃO TOTAL | 4 | 30 | 3-4d, 2-3d, 3-4d, 3-4d | 🟡 ALTO |
| MARKETPLACE & COBRANÇA | 2 | 13 | 3-4d, 3-4d | 🔵 MÉDIO |
| PERFORMANCE, PWA & QA FINAL | 3 | 24 | 2-3d, 2-3d, 3-4d | 🔴 CRÍTICO |

---

## 🔍 DIAGNÓSTICO — PROBLEMAS IDENTIFICADOS

> *Baseado nos 5 screenshots da interface atual, PDF de avaliação e documento de contra-auditoria v4.7.3*

1. **LOADING INFINITO EM TREINOS MOBILE** — Aluno vê spinner 'Carregando...' sem fim na tela Treinos. Causa: endpoint retorna erro/timeout para alunos sem treinos. Fix: empty state + error boundary.

2. **RESPONSIVIDADE INSUFICIENTE** — Google Play rejeitou. Dashboard e listas não se adaptam corretamente a mobile (< 430px) e tablet (768-1024px).

3. **ÍCONES TWA** — Canal alpha removido em 08/03 mas AAB precisa rebuild, versionCode incremento e feature graphic profissional.

4. **TREINOS VAZIOS** — Página mostra '0 treinos encontrados' sem exercícios seed. Falta banco de grupos musculares e exercícios.

5. **FLUXO ALUNO INCOMPLETO** — Vários itens de navegação não levam a conteúdo funcional. Aluno precisa de fluxo completo desde primeiro login.

6. **PDF AVALIAÇÃO** — Conteúdo excelente (Emerson Xavier) mas design precisa upgrade: hero, gauges, fotos, compartilhamento.

### ✅ O QUE JÁ FUNCIONA BEM

Dashboard admin completo com KPIs, simulação de roles, métricas financeiras Asaas (R$ 148,74 confirmado). Lista de alunos funcional com 5 alunos, filtros e badges. Auth robusta (WebAuthn/Passkeys/OAuth). Gamificação XP completa. Infra CF Workers sólida. 95.000 linhas de código, 229 endpoints, 43 tabelas. Base excelente para evolução.

---

---

# 🔴 FASE 1 — GOOGLE PLAY: FIXES CRÍTICOS

> *Resolver TODOS os bloqueios para aprovação Google Play. Foco absoluto em responsividade, estados vazios, loading states e funcionalidade core do aluno. SEM ESTES FIXES, O APP NÃO SERÁ APROVADO.*

---

## S01: Responsividade Mobile & Loading States

| | |
|---|---|
| **Duração** | 2-3 dias |
| **Prioridade** | 🔴 CRÍTICO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S01-01 | Audit completo de responsividade em todas as páginas do aluno | 🔴 CRÍTICO | 4h | [x] |
| S01-02 | Fix loading infinito na página Treinos mobile (spinner eterno) | 🔴 CRÍTICO | 2h | [x] |
| S01-03 | Implementar skeleton loaders em vez de spinner genérico 'Carregando...' | 🟡 ALTO | 4h | [x] |
| S01-04 | Fix layout overflow em telas < 375px (iPhone SE, Android compacto) | 🔴 CRÍTICO | 3h | [x] |
| S01-05 | Testar e corrigir todas as páginas em viewport tablet (768-1024px) | 🟡 ALTO | 4h | [x] |
| S01-06 | Sidebar mobile: fechar ao navegar, overlay backdrop | 🔵 MÉDIO | 1h | [x] |
| S01-07 | Fix bottom nav bar sobreposição com conteúdo scrollável | 🟡 ALTO | 2h | [x] |
| S01-08 | Pull-to-refresh em listas (treinos, avaliações, alunos) | 🔵 MÉDIO | 3h | [x] |

---

## S02: TWA Build & Google Play Submission

| | |
|---|---|
| **Duração** | 1-2 dias |
| **Prioridade** | 🔴 CRÍTICO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S02-01 | Criar feature graphic profissional 1024x500 (gradiente + logo + tagline) | 🔴 CRÍTICO | 3h | [x] |
| S02-02 | Rebuild AAB: `cd twa && npx @nicolo-ribaudo/bubblewrap build` | 🔴 CRÍTICO | 1h | [x] |
| S02-03 | Incrementar versionCode para 7+ no twa-manifest.json | 🔴 CRÍTICO | 0.5h | [x] |
| S02-04 | Gerar 2 screenshots mobile (1080x1920) + 1 tablet (7") | 🟡 ALTO | 2h | [x] |
| S02-05 | Testar APK em dispositivo real Android | 🔴 CRÍTICO | 2h | [ ] |
| S02-06 | Verificar Digital Asset Links (.well-known/assetlinks.json) | 🟡 ALTO | 1h | [x] |
| S02-07 | Submeter AAB para Google Play Console review | 🔴 CRÍTICO | 1h | [ ] |

---

## S03: Empty States & Navegação do Aluno

| | |
|---|---|
| **Duração** | 2-3 dias |
| **Prioridade** | 🔴 CRÍTICO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S03-01 | Empty state visual para Treinos (ilustração SVG + CTA 3D 'Aguarde seu Personal') | 🔴 CRÍTICO | 3h | [x] |
| S03-02 | Empty state visual para Avaliações | 🟡 ALTO | 2h | [x] |
| S03-03 | Empty state visual para Mensagens | 🔵 MÉDIO | 2h | [x] |
| S03-04 | Empty state visual para Pagamentos/Cobranças | 🔵 MÉDIO | 2h | [x] |
| S03-05 | Fix Treinos do aluno que não abre/mostra nada (endpoint + UI) | 🔴 CRÍTICO | 3h | [x] |
| S03-06 | Garantir todos os itens do bottom nav mobile funcionam sem erro | 🔴 CRÍTICO | 2h | [x] |
| S03-07 | Breadcrumbs consistentes em mobile e desktop | 🔵 MÉDIO | 2h | [x] |
| S03-08 | Deep links para todas as seções (treinos/:id, avaliacoes/:id) | 🔵 MÉDIO | 3h | [x] |

---

## S04: Fluxo Core do Aluno — 100% Funcional

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🔴 CRÍTICO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S04-01 | Aluno visualiza treinos atribuídos pelo personal (lista com cards) | 🔴 CRÍTICO | 4h | [x] |
| S04-02 | Aluno abre treino: exercícios com séries/reps/carga | 🔴 CRÍTICO | 4h | [x] |
| S04-03 | Aluno inicia workout session com tracking em tempo real | 🔴 CRÍTICO | 6h | [x] |
| S04-04 | Aluno visualiza avaliações físicas (lista + detalhe) | 🟡 ALTO | 3h | [x] |
| S04-05 | Aluno vê gráficos de progressão (peso, gordura, massa magra) | 🟡 ALTO | 4h | [x] |
| S04-06 | Aluno envia/recebe mensagens do personal | 🟡 ALTO | 3h | [x] |
| S04-07 | Aluno visualiza cobranças e status de pagamento | 🟡 ALTO | 3h | [x] |
| S04-08 | Dashboard aluno: KPIs (treinos feitos, streak atual, XP total) | 🟡 ALTO | 4h | [x] |

---

---

# 🔵 FASE 2 — EXERCÍCIOS & SISTEMA DE TREINOS

> *Construir o sistema completo de grupos musculares, biblioteca de exercícios com mídia, builder de treinos drag-and-drop e execução com tracking.*

---

## S05: Banco de Grupos Musculares & Exercícios

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S05-01 | Schema: `muscle_groups` (id, name, icon_url, body_region, sort_order) | 🟡 ALTO | 2h | [x] |
| S05-02 | Schema: `exercises` (id, name, muscle_group_id, equipment, difficulty, instructions, video_url, image_url) | 🟡 ALTO | 2h | [x] |
| S05-03 | Migration SQL com índices, constraints e FKs | 🟡 ALTO | 2h | [x] |
| S05-04 | Seed: 12 grupos musculares (Peito, Costas, Ombros, Bíceps, Tríceps, Antebraço, Abdome, Quadríceps, Isquiotibiais, Glúteos, Panturrilha, Trapézio) | 🟡 ALTO | 3h | [x] |
| S05-05 | Seed: 150+ exercícios fundamentais categorizados por grupo | 🟡 ALTO | 6h | [x] |
| S05-06 | API CRUD `/api/muscle-groups` e `/api/exercises` (Hono) | 🟡 ALTO | 4h | [x] |
| S05-07 | Filtros: por grupo, equipamento, dificuldade, busca texto | 🟡 ALTO | 3h | [x] |
| S05-08 | Upload mídia (vídeo/imagem) para exercícios via R2 | 🟡 ALTO | 4h | [x] |

---

## S06: Biblioteca de Exercícios — UI Ultra Moderna

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S06-01 | Grid de grupos musculares: cards 3D com ícone anatômico SVG | 🟡 ALTO | 4h | [x] |
| S06-02 | Lista de exercícios por grupo: search + filtros + infinite scroll | 🟡 ALTO | 4h | [x] |
| S06-03 | Detalhe do exercício: vídeo demo, instruções, músculos primários/secundários | 🟡 ALTO | 4h | [x] |
| S06-04 | Diagrama muscular SVG interativo (highlight ao selecionar grupo) | 🔵 MÉDIO | 6h | [ ] |
| S06-05 | Favoritar exercícios + lista de favoritos rápida | 🔵 MÉDIO | 2h | [x] |
| S06-06 | Histórico de uso do exercício (últimas cargas registradas) | 🔵 MÉDIO | 3h | [x] |
| S06-07 | Responsividade: 1 col mobile, 2 col tablet, 3+ col desktop | 🟡 ALTO | 3h | [x] |

---

## S07: Workout Builder — Criador de Treinos 3D

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S07-01 | Interface drag-and-drop para ordenar exercícios no treino | 🟡 ALTO | 6h | [x] |
| S07-02 | Selecionar exercícios da biblioteca + adicionar ao treino | 🟡 ALTO | 3h | [x] |
| S07-03 | Configurar por exercício: séries, reps, carga, descanso, notas | 🟡 ALTO | 4h | [x] |
| S07-04 | Botões 3D consistentes em toda a interface (padrão 'Crie seu Treino') | 🟡 ALTO | 2h | [x] |
| S07-05 | Templates pré-configurados (ABC split, Push/Pull/Legs, Upper/Lower) | 🔵 MÉDIO | 4h | [x] |
| S07-06 | Duplicar e editar treinos existentes | 🔵 MÉDIO | 2h | [x] |
| S07-07 | Atribuir treino a aluno(s) com data de início e periodicidade | 🟡 ALTO | 3h | [x] |
| S07-08 | Preview completo do treino antes de salvar | 🔵 MÉDIO | 2h | [x] |

---

## S08: Execução de Treino & Tracking Real-Time

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S08-01 | Tela de execução full-screen: exercício atual + timer + controles | 🟡 ALTO | 6h | [x] |
| S08-02 | Registro de carga real por série (checkmark + input) | 🟡 ALTO | 4h | [x] |
| S08-03 | Timer de descanso entre séries com alarme sonoro | 🟡 ALTO | 3h | [x] |
| S08-04 | Ajuste rápido: +2.5kg, -2.5kg, +1rep, -1rep (botões 3D) | 🔵 MÉDIO | 2h | [x] |
| S08-05 | Resumo pós-treino: duração total, volume, XP ganho, comparação | 🟡 ALTO | 3h | [x] |
| S08-06 | Animação de conclusão com XP earned + badge notification | 🔵 MÉDIO | 3h | [x] |
| S08-07 | Histórico de sessions com gráficos de progressão de carga | 🟡 ALTO | 4h | [x] |
| S08-08 | Offline support: SW cache do treino + sync quando online | 🔵 MÉDIO | 4h | [x] |

---

---

# 🟣 FASE 3 — AVALIAÇÃO FÍSICA ULTRA MODERNA

> *Transformar avaliações com PDF/HTML premium, fotos de progressão, compartilhamento e validação CREF. Baseado na avaliação Emerson Xavier como referência.*

---

## S09: Template PDF/HTML — Design Premium

| | |
|---|---|
| **Duração** | 4-5 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S09-01 | Hero: gradiente verde + logo VFIT + dados aluno + badge avaliação #N | 🟡 ALTO | 4h | [x] |
| S09-02 | 4 cards de destaque: Peso, Estatura, % Gordura, FFMI com classificação | 🟡 ALTO | 3h | [x] |
| S09-03 | Tabela de dobras cutâneas com barras coloridas de classificação | 🟡 ALTO | 3h | [x] |
| S09-04 | Gauge charts para FFMI e % Gordura (posição do aluno destacada) | 🟡 ALTO | 4h | [x] |
| S09-05 | Seção Antropometria: circunferências + simetria bilateral + destaques | 🟡 ALTO | 4h | [x] |
| S09-06 | Índices de saúde: RCQ e RCA com gauge/progress visual | 🟡 ALTO | 3h | [x] |
| S09-07 | Anamnese e hábitos: cards com ícones e scores visuais | 🟡 ALTO | 3h | [x] |
| S09-08 | Projeção realista: timeline visual (atual → 6m → 12m → 18m) | 🔵 MÉDIO | 3h | [x] |
| S09-09 | Recomendações: 4 prioridades hierárquicas com ícones e ações | 🟡 ALTO | 3h | [x] |
| S09-10 | Footer: assinatura personal + CREF + QR code + próxima reavaliação | 🟡 ALTO | 2h | [x] |
| S09-11 | Engine de geração: HTML template → Puppeteer/CF Worker → PDF | 🟡 ALTO | 6h | [x] |

---

## S10: Fotos de Progressão & Tracking Visual

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S10-01 | Upload fotos na avaliação: frente, lateral esq, lateral dir, costas | 🟡 ALTO | 4h | [x] |
| S10-02 | Grid de fotos integrado no PDF/HTML com labels | 🟡 ALTO | 4h | [x] |
| S10-03 | Before/After: comparação lado a lado entre avaliações | 🟡 ALTO | 4h | [x] |
| S10-04 | Gráficos interativos de evolução (Recharts: peso, gordura, medidas) | 🟡 ALTO | 4h | [x] |
| S10-05 | Timeline de avaliações com thumbnails das fotos | 🔵 MÉDIO | 3h | [x] |
| S10-06 | Compressão + resize automático via CF Image Resizing | 🔵 MÉDIO | 2h | [x] |

---

## S11: Compartilhamento, Impressão & CREF

| | |
|---|---|
| **Duração** | 2-3 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S11-01 | Botão 'Compartilhar' (Web Share API → WhatsApp, email, etc.) | 🟡 ALTO | 2h | [x] |
| S11-02 | Link público temporário (token expirável) para visualizar avaliação | 🟡 ALTO | 3h | [x] |
| S11-03 | Download PDF direto pelo aluno (botão no app) | 🟡 ALTO | 2h | [x] |
| S11-04 | Print CSS otimizado para impressão em papel A4 | 🔵 MÉDIO | 2h | [x] |
| S11-05 | CREF do personal validado e visível no documento | 🟡 ALTO | 2h | [x] |
| S11-06 | Personal aprova/assina digitalmente antes de liberar ao aluno | 🟡 ALTO | 3h | [x] |
| S11-07 | Envio automático por email e/ou WhatsApp ao aluno | 🔵 MÉDIO | 3h | [x] |

---

---

# 🟢 FASE 4 — UI/UX MODERNIZAÇÃO TOTAL

> *Elevar toda a interface ao padrão ultra moderno: botões 3D em tudo, cards com depth, animações suaves e leves, glassmorphism seletivo, tipografia premium.*

---

## S12: Design System v2 — Componentes 3D & Cards

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S12-01 | Design tokens v2: cores, sombras 3D, bordas, espaçamento, tipografia | 🟡 ALTO | 3h | [x] |
| S12-02 | Button3D: primário (verde), secundário (outline), ghost, danger | 🟡 ALTO | 3h | [x] |
| S12-03 | Card3D: hover elevation + border-radius + shadow transition | 🟡 ALTO | 3h | [x] |
| S12-04 | InfoCard: ícone colorido + label + valor + badge/link (como KPI cards) | 🟡 ALTO | 3h | [x] |
| S12-05 | StatCard: valor grande + sparkline + trend indicator | 🔵 MÉDIO | 3h | [x] |
| S12-06 | Inputs modernos: float label + focus ring verde + error shake | 🔵 MÉDIO | 2h | [x] |
| S12-07 | Badge/Chip: gradient sutil + ícone (ATIVO, PENDENTE, etc.) | 🔵 MÉDIO | 2h | [x] |
| S12-08 | Type scale consistente: display, heading, body, caption | 🟡 ALTO | 2h | [x] |

---

## S13: Animações Ultra Leves & Modernas

| | |
|---|---|
| **Duração** | 2-3 dias |
| **Prioridade** | 🔵 MÉDIO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S13-01 | Page transitions suaves (Framer Motion AnimatePresence) | 🔵 MÉDIO | 3h | [x] |
| S13-02 | Staggered list reveal (alunos, treinos, avaliações entram 1 a 1) | 🔵 MÉDIO | 3h | [x] |
| S13-03 | Micro-interactions: hover scale, press depth, button ripple | 🔵 MÉDIO | 3h | [x] |
| S13-04 | Skeleton shimmer animation (em vez de 'Carregando...') | 🟡 ALTO | 2h | [x] |
| S13-05 | Counting animation para KPIs numéricos (0 → valor) | 🔵 MÉDIO | 2h | [x] |
| S13-06 | Toast slide-in + progress bar auto-dismiss | 🔵 MÉDIO | 2h | [x] |
| S13-07 | `prefers-reduced-motion`: desabilitar tudo automaticamente | 🔵 MÉDIO | 1h | [x] |

---

## S14: Dashboard Redesign — Personal & Aluno

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S14-01 | Personal: hero gradiente com stats (receita total, alunos ativos, treinos) | 🟡 ALTO | 4h | [x] |
| S14-02 | KPI cards redesign: ícone circular colorido + sparkline + trend | 🟡 ALTO | 3h | [x] |
| S14-03 | Receita por Mês: area chart com gradiente verde + tooltip moderno | 🔵 MÉDIO | 3h | [x] |
| S14-04 | Timeline de atividade recente (últimas ações do personal) | 🔵 MÉDIO | 3h | [x] |
| S14-05 | Aluno dashboard: próximo treino card, streak ring, XP progress, badges | 🟡 ALTO | 4h | [x] |
| S14-06 | Quick actions: grid de botões 3D (Novo Treino, Nova Avaliação, etc.) | 🟡 ALTO | 3h | [x] |
| S14-07 | Progresso semanal: ring chart animado (dias treinados / meta) | 🔵 MÉDIO | 3h | [x] |

---

## S15: Responsividade Pixel-Perfect

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S15-01 | Audit Chrome DevTools: 320, 375, 414, 768, 1024, 1280, 1440px | 🟡 ALTO | 3h | [x] |
| S15-02 | Sidebar: drawer + overlay mobile, collapsed tablet, full desktop | 🟡 ALTO | 4h | [x] |
| S15-03 | Tabelas: scroll horizontal mobile OU card-view adaptativa | 🟡 ALTO | 4h | [x] |
| S15-04 | Grid layouts: 1col → 2col → 3-4col fluido | 🟡 ALTO | 3h | [x] |
| S15-05 | Modais e drawers: bottom sheet mobile, centered desktop | 🔵 MÉDIO | 2h | [x] |
| S15-06 | Touch targets mínimo 44x44px (WCAG 2.5.5) | 🟡 ALTO | 2h | [x] |
| S15-07 | Safe area insets (`env(safe-area-inset-*)`) para notch devices | 🔵 MÉDIO | 1h | [x] |
| S15-08 | Teste real: iPhone SE, iPhone 15, Samsung Galaxy, iPad, Pixel | 🟡 ALTO | 3h | [ ] |

---

---

# 🟡 FASE 5 — MARKETPLACE & COBRANÇA

> *Ativar marketplace de treinos e planos com cobrança completa via Asaas. Comissão de plataforma e dashboard de vendas.*

---

## S16: Marketplace UI & Catálogo

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🔵 MÉDIO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S16-01 | Grid de produtos: cards 3D com imagem, nome, preço, rating, personal | 🟡 ALTO | 4h | [ ] |
| S16-02 | Detalhe do produto: preview treino, reviews, preço, botão 3D 'Comprar' | 🟡 ALTO | 4h | [ ] |
| S16-03 | Filtros: categoria, faixa de preço, avaliação, grupo muscular | 🔵 MÉDIO | 3h | [ ] |
| S16-04 | Perfil público do personal: foto, CREF, especialidades, avaliação média | 🔵 MÉDIO | 4h | [ ] |
| S16-05 | Carousel de destaques e promoções na home marketplace | 🔵 MÉDIO | 3h | [ ] |
| S16-06 | Sistema de reviews: rating 1-5 + comentário após compra | 🔵 MÉDIO | 4h | [ ] |

---

## S17: Checkout & Cobrança Marketplace

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🔵 MÉDIO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S17-01 | Carrinho de compras: adicionar, remover, quantidade, subtotal | 🟡 ALTO | 3h | [ ] |
| S17-02 | Checkout Asaas: PIX, boleto e cartão (mesmo fluxo de assinatura) | 🟡 ALTO | 4h | [ ] |
| S17-03 | Comissão plataforma: cálculo automático (ex: 15% VFIT) | 🟡 ALTO | 3h | [ ] |
| S17-04 | Webhook confirmação: atualizar status do pedido automaticamente | 🟡 ALTO | 3h | [ ] |
| S17-05 | Liberação automática do conteúdo (treino/plano) pós-pagamento | 🟡 ALTO | 3h | [ ] |
| S17-06 | Dashboard vendas: receita marketplace, comissões, top sellers | 🔵 MÉDIO | 4h | [ ] |
| S17-07 | Política de reembolso: regras + fluxo automático via Asaas | 🔵 MÉDIO | 2h | [ ] |

---

---

# 🟢 FASE 6 — PERFORMANCE, PWA & QA FINAL

> *Otimização máxima, ícones perfeitos arredondados, testes completos e submissão final para Google Play.*

---

## S18: Performance Optimization

| | |
|---|---|
| **Duração** | 2-3 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S18-01 | Lighthouse audit: LCP < 2.5s, FID < 100ms, CLS < 0.1 | 🟡 ALTO | 2h | [x] |
| S18-02 | Code splitting: dynamic imports por rota (reduzir bundle inicial) | 🟡 ALTO | 3h | [x] |
| S18-03 | Imagens: WebP, lazy loading, srcset, CF Image Resizing | 🟡 ALTO | 3h | [x] |
| S18-04 | Bundle analysis: tree-shake dependências não usadas | 🟡 ALTO | 3h | [x] |
| S18-05 | Prefetch: `link rel='prefetch'` para rotas mais prováveis | 🔵 MÉDIO | 2h | [x] |
| S18-06 | API caching: KV cache com TTL strategy por endpoint | 🟡 ALTO | 3h | [x] |
| S18-07 | Fonts: subset, preload, `font-display: swap` | 🔵 MÉDIO | 2h | [x] |
| S18-08 | Service Worker: cache-first para assets, network-first para API | 🔵 MÉDIO | 3h | [x] |

---

## S19: PWA/TWA Icons & Polish

| | |
|---|---|
| **Duração** | 2-3 dias |
| **Prioridade** | 🟡 ALTO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S19-01 | Ícone arredondado perfeito 512x512 maskable (safe zone respeitada) | 🟡 ALTO | 2h | [x] |
| S19-02 | Ícone adaptativo Android: foreground layer + background color | 🟡 ALTO | 2h | [x] |
| S19-03 | Splash screens para iOS (`apple-touch-startup-image`) | 🔵 MÉDIO | 2h | [x] |
| S19-04 | Manifest.json: shortcuts atualizados, screenshots novos, categories | 🟡 ALTO | 2h | [x] |
| S19-05 | Offline page: design moderno com ilustração + 'Reconectar' | 🔵 MÉDIO | 3h | [x] |
| S19-06 | Push notification UI: badge count, action buttons | 🔵 MÉDIO | 2h | [x] |
| S19-07 | Install banner: design customizado com preview do app | 🔵 MÉDIO | 2h | [x] |

---

## S20: QA Final & Google Play Submission

| | |
|---|---|
| **Duração** | 3-4 dias |
| **Prioridade** | 🔴 CRÍTICO |

| ID | Tarefa | Prioridade | Tempo | OK? |
|:--:|--------|:----------:|:-----:|:---:|
| S20-01 | E2E fluxo aluno completo (login → treino → avaliação → chat) | 🟡 ALTO | 6h | [x] |
| S20-02 | E2E fluxo personal completo (login → criar treino → atribuir → avaliar) | 🟡 ALTO | 6h | [x] |
| S20-03 | Testes regressão: auth, pagamentos, treinos, avaliações | 🟡 ALTO | 4h | [x] |
| S20-04 | Cross-browser: Chrome, Safari, Firefox, Samsung Internet | 🟡 ALTO | 3h | [x] |
| S20-05 | Accessibility audit: axe-core + screen reader manual test | 🔵 MÉDIO | 3h | [x] |
| S20-06 | Security re-audit: headers, rate limiting, injection | 🟡 ALTO | 2h | [x] |
| S20-07 | AAB final: build + sign + verify | 🔴 CRÍTICO | 2h | [x] |
| S20-08 | Google Play Console: upload AAB + listing completo | 🔴 CRÍTICO | 2h | [ ] |
| S20-09 | Monitor review + responder feedback Google rapidamente | 🟡 ALTO | 2h | [ ] |

---

---

# 📎 APÊNDICE A — SPEC PDF AVALIAÇÃO ULTRA MODERNA

> *Baseado no PDF de avaliação do Emerson Xavier (11 páginas). Novo design premium com identidade VFIT.*

**PÁG 1 — HERO + RESUMO:** Header gradiente verde (`#22C55E` → `#16A34A`), logo VFIT branco, nome aluno em fonte display, badge 'Avaliação #N' / 'Reavaliação'. 4 cards destaque (Peso, Estatura, %Gordura, FFMI). Resumo executivo personalizado. Nota sobre IMC quando enganoso.

**PÁG 2 — COMPOSIÇÃO CORPORAL:** Tabela de dobras cutâneas com barras coloridas (bom = verde, moderado = amarelo, alto = vermelho). Gauge charts FFMI e %Gordura com posição do aluno destacada. Distribuição corporal visual (body map heat).

**PÁG 3 — ANTROPOMETRIA:** Circunferências por região (Tronco Superior, Central, Membros Inferiores, Superiores). Simetria bilateral (D vs E). Destaques vs média populacional.

**PÁG 4 — SAÚDE:** RCQ e RCA com gauge charts modernos. TDEE por nível de atividade (4 faixas). Tabela de metas: saúde vs estética com valores atuais vs meta.

**PÁG 5 — ANAMNESE:** Cards com ícones (objetivos, autoimagem, disposição, stress, sono com scores visuais). Histórico saúde. Hábitos de vida. Pontos críticos com alerta visual.

**PÁG 6 — POTENCIAL:** Análise de potencial muscular com bullets visuais. Fatores limitantes com alertas. Timeline de projeção realista (atual → 6m → 12m → 18m) com silhuetas.

**PÁG 7 — RECOMENDAÇÕES:** 4 prioridades hierárquicas (P1 Sono, P2 Alimentação, P3 Treino, P4 Monitoramento). Cada uma com ícone, meta e action items. Tabela de treino semanal.

**PÁG 8 — FOTOS & ASSINATURA:** Grid fotos (frente, lateral, costas) se disponíveis. Before/after com avaliação anterior. Considerações finais. Assinatura personal + CREF. QR code para versão digital. Data próxima reavaliação.

---

# 📎 APÊNDICE B — DESIGN TOKENS v2

## Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--brand-primary` | `#22C55E` | Botões primários, CTAs, badges ativos |
| `--brand-dark` | `#09090B` | Background sidebar, headers, dark mode base |
| `--surface-base` | `#FFFFFF` | Background principal (light mode) |
| `--surface-card` | `#F8FAFC` | Background de cards, com borda sutil |
| `--surface-elevated` | `#FFFFFF` | Cards com shadow, modais, dropdowns |
| `--accent-blue` | `#3B82F6` | Info, links, badges informativas |
| `--accent-purple` | `#8B5CF6` | XP, gamificação, badges premium |
| `--accent-orange` | `#F97316` | Alertas, warnings, métricas |
| `--danger` | `#EF4444` | Erros, exclusão, vencidas |

## Sombras 3D (Padrão dos Botões)

```css
--shadow-btn-3d: 0 4px 0 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.08);
--shadow-btn-3d-hover: 0 6px 0 0 rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.12);
--shadow-btn-3d-active: 0 2px 0 0 rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.06);
--shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
--shadow-card-hover: 0 4px 12px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06);
```

## Animações

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);    /* entradas, page transitions */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);        /* hover states, toggles */
--duration-fast: 150ms;    /* micro-interactions */
--duration-normal: 250ms;  /* transições de estado */
--duration-slow: 400ms;    /* page transitions, modais */
--stagger-delay: 50ms;     /* delay entre itens de lista */
```

## Tipografia

| Nível | Font | Tamanho |
|-------|------|---------|
| Display | Plus Jakarta Sans 700 | 2.5rem / 3rem |
| Heading 1 | Plus Jakarta Sans 600 | 1.75rem / 2.25rem |
| Heading 2 | Plus Jakarta Sans 600 | 1.25rem / 1.75rem |
| Body | Inter 400 | 0.9375rem / 1.5rem |
| Caption | Inter 400 | 0.8125rem / 1.25rem |
| Mono | JetBrains Mono 400 | 0.875rem / 1.5rem |

---

# 📎 APÊNDICE C — CHECKLIST GOOGLE PLAY

| # | Requisito | Status | Sprint | OK? |
|:-:|-----------|:------:|:------:|:---:|
| 1 | App responde em < 3s em 3G lento | ✅ CONCLUÍDO | S18 | [x] |
| 2 | Sem loading infinito em nenhuma tela | ✅ CONCLUÍDO | S01 | [x] |
| 3 | Todas as páginas responsivas 320-1440px | ✅ CONCLUÍDO | S01/S15 | [x] |
| 4 | Empty states amigáveis em todas as listas | ✅ CONCLUÍDO | S03 | [x] |
| 5 | Navegação funcional em todos os menu items | ✅ CONCLUÍDO | S03 | [x] |
| 6 | Ícones sem transparência (RGB) | ✅ CONCLUÍDO | — | [x] |
| 7 | Feature graphic 1024x500 | ✅ CONCLUÍDO | S02 | [x] |
| 8 | Screenshots mobile e tablet atualizados | ✅ CONCLUÍDO | S02 | [x] |
| 9 | Digital Asset Links configurado | ✅ CONCLUÍDO | S02 | [x] |
| 10 | AAB versionCode incrementado (7+) | ✅ CONCLUÍDO | S02 | [x] |
| 11 | Treinos do aluno visíveis e funcionais | ✅ CONCLUÍDO | S04 | [x] |
| 12 | Avaliações do aluno acessíveis | ✅ CONCLUÍDO | S04 | [x] |
| 13 | Auth flow sem erros em mobile | ✅ CONCLUÍDO | — | [x] |
| 14 | Delete account funcional (LGPD) | ✅ CONCLUÍDO | — | [x] |
| 15 | Termos e Privacidade acessíveis | ✅ CONCLUÍDO | — | [x] |
| 16 | Sem crashes ou ANR detectados | ✅ CONCLUÍDO | S20 | [x] |
| 17 | Content policy compliance | ✅ CONCLUÍDO | — | [x] |

---

> **Última atualização:** 08/03/2026 — VFIT v4.7.3 → v5.0  
> **Confidencial** · Preparado para Victor Agostinho Melo Duarte
