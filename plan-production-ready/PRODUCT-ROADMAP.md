<!-- /autoplan restore point: /Users/macos/.gstack/projects/vtsgroup-vfit/main-autoplan-restore-20260509-221720.md -->
# Product Roadmap — VFIT Completo

## Premissa central

VFIT deve ser o sistema operacional diário de fitness para profissionais e alunos. O produto não ganha por ter uma tela de treino, uma tela de nutrição e uma tela de pagamento. Ganha quando essas telas viram um loop de valor que o usuário sente toda semana.

## Autoplan decision — 2026-05-10

Feedback incorporado: "Está ficando legal mas precisa de muitas melhorias ainda, não tem nenhum alimento para adicionar, nada está super funcional ainda."

Decisão aprovada para execução: **Student-first depth**.

O plano original continua válido como visão completa, mas a ordem de entrega muda. Antes de ampliar marketplace, nutricionista, SEO, social ou personal OS, o aluno precisa conseguir completar o loop diário sem sentir que está usando uma demo:

```text
Abrir app -> entender treino de hoje -> executar treino -> salvar mesmo offline
          -> ver progresso -> registrar refeicao com alimentos reais
          -> receber proxima acao clara -> voltar amanha
```

### Decision audit trail

| Review | Veredito | Implicacao |
|---|---|---|
| CEO review | Replanejar por profundidade, nao por amplitude | Pausar novas personas e frentes ate o aluno ter um fluxo funcional de treino + progresso + nutricao. |
| Design review | UI esta melhorando, mas faltam estados operacionais | Food search vazio, execucao de treino, offline, onboarding e mobile keyboard/nav precisam de states explicitos. |
| Engineering review | Infra existe, integracao funcional ainda e baixa | Popular `vfit_foods`, consolidar estado de workout e implementar offline sync antes de loja. |
| DX/operability review | Nao da para escalar sem gates repetiveis | Smoke auth, WhatsApp deploy gate, dados seed e quality gate precisam virar fluxo reprodutivel. |

### Premissas invalidadas

- "Mais telas" nao torna o produto mais pronto. O usuario esta reagindo a loops incompletos, nao a falta de superficie visual.
- Loja antes de treino/nutricao funcional vira discovery sem uso real.
- Nutricionista OS antes de food catalog e meal logging real cria um portal sem insumo.
- SEO/campanhas antes de smoke auth, OneSignal, WhatsApp gate e core loops estaveis aumenta risco de churn e suporte.

### Novo principio de sequencing

1. **Functional loop first:** treino executavel, progresso confiavel, nutricao com alimentos reais.
2. **Validation before expansion:** smoke auth, browser smoke, fixtures e deploy sem bypass antes de novos lancamentos.
3. **Marketplace only after use:** compra de plano so conta quando o aluno ativa e inicia o treino comprado.
4. **New personas after data exists:** nutricionista entra quando refeicoes e historico do aluno ja existem.

### Criterio de "super funcional"

O app aluno so passa para expansao quando um aluno consegue, em mobile:

- abrir `/treinos` e ver uma proxima acao clara;
- iniciar, pausar, editar sets, concluir e retomar treino;
- continuar registrando treino com rede instavel e sincronizar sem duplicidade;
- abrir `/nutricao`, buscar/adicionar alimento real, usar recentes/favoritos e ver macros atualizados;
- abrir `/progresso` sem 500/empty state morto e entender a evolucao da semana;
- passar por rotas criticas sem tela branca, erro silencioso, scroll horizontal ou CTA falso.

### Execucao revisada — proximas 5 semanas

| Semana | Foco | Resultado esperado |
|---|---|---|
| 1 | Gates + dados de base | Smoke auth renovavel, deploy sem bypass planejado, food catalog versionado/idempotente com pelo menos 150 alimentos PT-BR. |
| 2 | Treino funcional | Estado canonico de workout, execucao Start -> Rest -> Next -> Finish, resume e offline queue basica. |
| 3 | Nutricao funcional | Busca de alimentos, adicionar refeicao, recentes, favoritos, entrada manual e estados de erro/retry. |
| 4 | Progresso + QA | Progress sem 500, resumo semanal util, Playwright student matrix e evidencia visual mobile/desktop. |
| 5 | Loja com uso real | `/loja`, detalhe, compra idempotente, biblioteca, ativacao do plano e primeiro treino comprado iniciado. |

### Deferred ate o loop do aluno fechar

- Nutricionista OS completo.
- Lead pipeline/personal OS avancado.
- SEO programatico e campanhas.
- Social/feed amplo.
- Admin dashboard amplo de operacao, exceto itens P0 de gate/observabilidade.

```text
Personal cria valor      Aluno executa valor      Plataforma captura valor
-------------------      -------------------      ------------------------
Treino + avaliação  ->   execução + progresso ->  retenção + pagamento
Cobrança automática ->   acesso + confiança   ->  receita previsível
IA + templates      ->   plano personalizado  ->  upsell + marketplace
Nutrição integrada  ->   dieta + treino juntos ->  colaboração + stickiness
```

## Personas e jobs to be done

### 1. Personal trainer

**Job principal:** cuidar de alunos, vender mais, receber sem constrangimento e parecer profissional.

**Jornada completa alvo:**

```text
Lead -> convite -> cadastro -> anamnese -> avaliação -> treino -> cobrança
     -> acompanhamento -> mensagens -> retenção -> renovação/upsell -> indicação
```

**O que já existe:**

- Dashboard com alunos, treinos, avaliações, pagamentos, financeiro, agenda, IA, mensagens e afiliados.
- Criação de treino manual e com IA.
- Cobranças e assinaturas via payments.
- Marketplace para vender planos de treino.
- Admin e smoke tooling.

**Gaps para ficar completo:**

- Pipeline de leads e conversão precisa ficar mais explícito: origem, status, próxima ação, lembrete e conversão.
- Agenda ainda aparece como “semana/dia + lembretes em breve”; precisa virar ferramenta operacional real.
- Mensagens existem, mas precisam de templates, automações e trilhas de reengajamento.
- Financeiro precisa eliminar warning de chart e ter explicabilidade: recebível, atrasado, inadimplente, taxa, previsão.
- AI precisa conectar ações reais: gerar treino, mensagem, cobrança, recuperação de aluno, revisão de progresso.
- Marketplace precisa dar ao personal fluxo completo de seller: publicar, revisar, vendas, ratings, suporte, payout.

### 2. Aluno

**Job principal:** treinar hoje, entender se está evoluindo, receber orientação e permanecer motivado.

**Jornada completa alvo:**

```text
Onboarding -> objetivo -> plano -> treino de hoje -> execução -> conclusão
           -> XP/streak -> progresso -> nutrição -> compra/upgrade -> retenção
```

**O que já existe:**

- App aluno com treinos, nutrição, avaliações, progresso, exercícios, IA, plano, perfil e social.
- Gamificação, XP, streaks, conquistas e perfil.
- Nutrição com macros/refeições e vínculo com nutricionista por código.
- IA para dieta/macros/recuperação/treino adaptado.

**Gaps para ficar completo:**

- Corrigir `/students/me` 404 para garantir identidade estável.
- Corrigir `/progress/top-exercises` 500.
- Loja dentro do app: descobrir planos, comprar, ver compras, instalar plano comprado, avaliar criador.
- Biblioteca de planos comprados separada de treinos próprios.
- Estados de offline e sync para treino em execução.
- Skeletons e error states específicos para todas as rotas principais do app aluno.
- Conteúdo de nutrição precisa ter câmera, barcode, favoritos e base alimentar com estados confiáveis.
- Social precisa de propósito claro: ranking? comunidade? feed? desafios? Sem isso vira ruído.

### 3. Nutricionista

**Job principal:** acompanhar pacientes que treinam, prescrever alimentação e colaborar com personais sem perder contexto.

**Jornada completa alvo:**

```text
Landing -> cadastro nutri -> perfil -> convite/vínculo -> paciente
        -> avaliação nutricional -> plano alimentar -> check-in -> ajuste
        -> relatório compartilhado -> cobrança/assinatura -> retenção
```

**O que já existe:**

- Landing `/nutricionistas`.
- Backend `workers/api/nutritionist.ts` com profile, patients, meal plans, assessments e dashboard.
- Link aluno-nutricionista em `POST /students/me/link-nutritionist`.
- Páginas dashboard para meal plans e nutrition assessments.

**Gaps para ficar completo:**

- Onboarding próprio de nutricionista e role `nutritionist` no frontend.
- Dashboard específico de nutricionista, não apenas reuse genérico do personal/admin.
- Convites e permissões claras: aluno pode ter personal e nutricionista; quem vê quais dados?
- Plano alimentar precisa de versão, aceite do paciente, substituições e lista de compras.
- Avaliação nutricional precisa de evolução, fotos, medidas, bioimpedância e histórico.
- Monetização: consulta avulsa, pacote mensal, plano alimentar vendido, parceria com personal.
- Landing precisa provar caso de uso e SEO para intenção “nutricionista esportivo + app”.

### 4. Admin/super admin

**Job principal:** operar plataforma, investigar erro, ajustar monetização e proteger produção.

**O que já existe:**

- Painel admin, users, personals, payments, exercises, config, smoke tokens, design system.

**Gaps para ficar completo:**

- Operability dashboard: erros por rota, latency, smoke auth, deploy version, OneSignal status, CSP violations.
- Console de incidentes: timeline, impacted users, rollback actions, external provider status.
- Feature flags e kill switches: push, marketplace checkout, AI generators, payment webhooks, nutrition links.
- Audit log para operações sensíveis.
- Admin de loja: moderação, refunds, disputes, creators, plan review queue.

### 5. Público/SEO

**Job principal:** entender se VFIT resolve meu problema e converter para cadastro.

**O que já existe:**

- Landing home.
- Landing personal trainer.
- Landing nutricionistas.
- Landing afiliados.
- Pricing.
- Blog com 7 posts.
- FAQs e SEO metadata.

**Gaps para ficar completo:**

- Clusters por intenção com páginas programáticas: personal trainer, aluno, nutricionista, cobrança, treino IA, avaliação física, app de treino, marketplace.
- Páginas comparativas: “VFIT vs planilha”, “VFIT vs WhatsApp”, “VFIT vs app X”.
- Páginas de caso de uso por perfil: autônomo, studio, academia pequena, nutricionista esportivo, consultoria online.
- Schema.org completo: Organization, SoftwareApplication, Product, FAQPage, Article, BreadcrumbList, Review quando houver dados reais.
- Experiência pública em modo incognito validada com cookies, consent, no auth leakage.

## Loja dentro do app do aluno

### Por que é essencial

O marketplace atual parece orientado ao personal no dashboard. Para virar receita real, o aluno precisa encontrar, comprar e usar planos dentro do fluxo onde ele já treina.

### Experiência alvo

```text
Aluno abre app -> vê treino atual -> descobre plano complementar
               -> filtra por objetivo/equipamento/duração/preço
               -> preview seguro -> checkout -> plano entra na biblioteca
               -> aluno ativa plano -> progresso e avaliações seguem integrados
```

### Superfícies novas

- `/loja` ou tab dentro de `/treinos` para aluno.
- `/loja/[id]` detalhe do plano.
- `/loja/compras` biblioteca comprada.
- `/loja/checkout` ou reaproveitamento do checkout marketplace atual.
- Card “Planos recomendados para seu objetivo” em `/treinos` e `/plano`.
- Seller profile público do personal.

### Regras de negócio mínimas

- O aluno não compra duas vezes o mesmo plano.
- Plano comprado não some se personal despublicar depois da compra.
- Refund/disputa tem estado explícito.
- Conteúdo comprado é clonado/versionado para não quebrar se o criador editar o plano original.
- Creator share e platform share seguem `FEES.marketplace_creator_share`.
- Checkout de plano deve ser idempotente para double-click, reload e retry.

### Métricas

- View -> detail CTR.
- Detail -> checkout conversion.
- Checkout success rate.
- Plano comprado -> primeiro treino iniciado.
- Plano comprado -> treino concluído em 7 dias.
- Refund/dispute rate.
- Creator payout pending/paid.

## Skeletons, loading e estados vazios

### Estado atual

Há um bom sistema de skeletons em `src/components/ui/skeleton.tsx` e `src/components/ui/page-skeletons.tsx`, mas a cobertura por rota não é completa. Só um `loading.tsx` de rota foi detectado (`src/app/dashboard/loading.tsx`). Muitas páginas usam skeletons internos, mas app aluno precisa de uma política uniforme.

### Padrão alvo

Cada rota crítica deve declarar:

```text
Route loading.tsx -> Page skeleton -> Section skeleton -> Empty state -> Error state -> Retry action
```

### Cobertura obrigatória

- App aluno: `/treinos`, `/nutricao`, `/avaliacoes`, `/progresso`, `/exercicios`, `/ia`, `/perfil`, `/plano`, `/loja`.
- Dashboard personal: alunos, treinos, avaliações, financeiro, calendar, AI, messages, marketplace.
- Nutricionista: patients, meal plans, assessments, dashboard.
- Admin: users, payments, config, exercises, smoke.

### Critérios de aceite

- Nenhuma rota crítica mostra tela branca durante fetch inicial.
- Skeleton preserva dimensão para minimizar CLS.
- Empty state tem CTA útil, não só “nenhum item”.
- Error state nomeia problema em linguagem humana e oferece retry.
- Loading em ações mutantes usa `Button loading`, evita double-submit e mostra sucesso/falha.

## Sprints de produto

### Sprint P0 — Estabilização de produção

- Corrigir OneSignal domain.
- Corrigir CSP/R2 images.
- Corrigir `/students/me` 404 ou tornar comportamento explícito por role.
- Corrigir `/progress/top-exercises` 500.
- Corrigir cache/SW/chunk stale.
- Corrigir chart dimensions no financeiro.
- Revalidar smoke auth com tokens atuais.

### Sprint P1 — App aluno completo

- Smoke auth renovavel e release gate sem bypass.
- Base alimentar versionada, idempotente e pesquisavel.
- Treino de hoje executavel com estados Start -> In Progress -> Rest -> Finish.
- Offline/sync para treino ativo.
- Nutrição com busca real, entrada manual, favoritos, recentes e estados completos.
- Progresso sem 500 e com zero-data útil.
- Skeleton/error/empty state em todas rotas do aluno.

### Sprint P1.5 — Loja apenas depois do loop base

- Loja dentro do app.
- Biblioteca de compras.
- Plano comprado ativável.
- Compra idempotente e sem duplicidade.
- Estado “pago, liberando plano” para entrega assíncrona.
- Primeiro treino comprado iniciado como fim do fluxo, nao apenas checkout aprovado.

### Sprint P2 — Personal OS

- Pipeline de leads.
- Agenda real e recorrência segura.
- Mensagens com templates e automações.
- Financeiro confiável e explicável.
- AI action center conectado a dados reais.
- Seller dashboard do marketplace.

### Sprint P3 — Nutricionista OS

- Role frontend e onboarding.
- Dashboard específico.
- Patients, assessments e meal plans completos.
- Colaboração com personal/aluno.
- Monetização própria.
- Relatórios e check-ins.

### Sprint P4 — SEO e aquisição

- Clusters programáticos.
- Comparativos.
- Landing por persona/caso de uso.
- Schema.org e internal linking.
- Conteúdo E-E-A-T com fontes, autores, revisão e atualização.

### Sprint P5 — Operação e escala

- Observability dashboard.
- Feature flags.
- Visual regression.
- Lighthouse CI.
- Runbooks.
- Release train e canary.

## Product principles

1. **Cada tela precisa de uma próxima ação clara.** Sem “painéis museu”.
2. **Cada feature precisa fechar um loop.** Criar treino sem execução e progresso é incompleto.
3. **Toda falha precisa aparecer.** Silent fallback em app fitness destrói confiança.
4. **Aluno primeiro no mobile.** Personal pode tolerar dashboard denso; aluno precisa fluxo rápido.
5. **Nutrição não é apêndice.** É segundo produto conectado ao treino.
6. **Loja só vale se vira uso.** Comprar plano é meio; começar e concluir treino é fim.
7. **SEO precisa capturar intenção real.** Não escrever blog genérico que não converte.

## Design UX decisions locked by review

Fonte detalhada: `DESIGN-UX-REVIEW.md`.

Estas decisoes passam a ser parte do roadmap antes de implementar UI:

1. **App aluno:** `/treinos` vira a home operacional do aluno: treino de hoje primeiro, progresso semanal segundo, loja/recomendacao terceiro.
2. **Loja:** entrada primaria aparece no contexto de treino; `/loja` continua existindo como superficie profunda para descoberta.
3. **Plano comprado:** compra nao termina no pagamento; termina quando o plano entra na biblioteca e pode ser ativado em `/treinos`.
4. **Social:** fase atual usa desafios semanais ligados a XP/streak. Feed amplo fica fora de escopo.
5. **Personal:** dashboard inicial prioriza no maximo tres next actions, business pulse e work queue. Sidebar nao pode ser o unico modelo mental.
6. **Nutricionista:** portal usa patient timeline e attention queue, nao dashboard generico de KPIs.
7. **Public SEO:** first viewport deve ser brand/product first, com sinal real de produto e sem hero em card.
8. **Estados:** link nutricionista, compra de plano e treino offline precisam de state machine user-visible antes de implementacao.
9. **Mobile:** somente um FAB maximo; bottom nav e FAB escondem/recuam quando teclado virtual cria conflito.
10. **Acessibilidade:** checkout, auth, link nutricionista, start workout e meal plan builder entram no gate de teclado/screen reader.

## UI hierarchy reference

```text
Student /treinos
1. Treino de hoje -> Comecar treino
2. Progresso da semana -> manter streak
3. Planos recomendados -> ver loja

Student /loja
1. Recomendado para seu objetivo
2. Filtros rapidos
3. Lista de planos com creator proof

Personal /dashboard
1. Next actions this week
2. Business pulse
3. Work queue

Nutritionist /dashboard
1. Patients needing attention
2. Patient timeline
3. Meal plan workbench
```

## NOT in scope desta fase de planejamento

- App iOS/Android nativo completo fora TWA/PWA.
- Nova stack de pagamentos.
- LLM próprio ou treino de modelo.
- Rebranding total.
- Internationalização fora PT-BR.
- Comunidade social estilo rede social ampla sem tese de retenção validada.