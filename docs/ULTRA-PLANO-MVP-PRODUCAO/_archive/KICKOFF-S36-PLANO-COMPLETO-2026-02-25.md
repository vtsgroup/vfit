# KICKOFF S36 — Plano Completo (Ultra) para Próximo Ciclo

> Data: 25/02/2026  
> Contexto de entrada: Lote 61–100 concluído (**20/20 = 100%**)

## 1) Objetivo do ciclo S36+

Construir a próxima etapa premium do produto com três pilares:

1. **Gamificação diária real** (metas, streak, missões, recompensa por consistência).  
2. **Mídia de treino premium** (vídeo em **todos os exercícios**).  
3. **Execução guiada full-screen** no estilo stories, com progressão automática entre exercício → descanso → próximo aparelho.

---

## 2) Resultado de produto esperado

- Aluno treina no modo “história” em tela cheia, sem fricção.
- Cada exercício possui vídeo demonstrativo com replay ilimitado.
- Ao terminar exercício, app inicia descanso automaticamente e prepara próximo exercício com imagem + instruções de setup.
- Gamificação diária aumenta recorrência semanal.
- XP vira moeda interna auditável (fase 1) e prepara base de compliance para evolução regulada (fase 2).

---

## 3) Escopo funcional obrigatório

## 3.1 Gamificação diária (núcleo)

- Missões diárias por perfil (iniciante/intermediário/avançado).
- Recompensa de XP por ação válida:
  - treino concluído;
  - série concluída;
  - check-in diário;
  - streak semanal.
- Bônus anti-fraude:
  - sem duplicidade no mesmo evento;
  - limite diário por ação sensível.
- Tela de progresso diário com:
  - meta do dia;
  - XP ganho hoje;
  - streak atual;
  - próxima recompensa.

## 3.2 Moeda XP (“crypto legalizada”) — abordagem segura

### Fase 1 (obrigatória neste ciclo)
- Implementar como **moeda interna de fidelidade (off-chain)** com ledger auditável.
- Sem promessa de ativo financeiro negociável.
- Regras claras de emissão/uso/expiração.

### Fase 2 (opcional, só após parecer jurídico)
- Estudo de tokenização regulada e eventual integração com infraestrutura externa.
- Somente após validação formal de compliance (jurídico + fiscal + regulatório).

> Decisão de segurança: primeiro consolidar economia virtual interna legalmente segura, depois avaliar token regulado.

## 3.3 Vídeo obrigatório por exercício

- Todo exercício novo ou existente precisa ter:
  - `video_url` válida;
  - `thumbnail_url` para prévia;
  - `setup_notes` (como ajustar aparelho/posição).
- Se faltar vídeo, o exercício fica com status “incompleto” para publicação.

## 3.4 Player “stories” full-screen

- Exibição em tela cheia cobrindo tudo.
- Camada visual com **z-index: 99999999**.
- Controles:
  - play/pause;
  - replay do exercício atual;
  - avançar/voltar etapa;
  - sair com confirmação.
- Persistir progresso por exercício (retomar sessão).

## 3.5 Fluxo automático exercício → descanso → próximo

- Ao marcar exercício como concluído:
  1. inicia cronômetro de descanso automaticamente;
  2. abre prévia do próximo exercício com imagem;
  3. mostra “como configurar o aparelho”; 
  4. termina descanso e inicia próxima etapa automaticamente.
- Se usuário tocar “ver vídeo novamente”, replay imediato sem perder contexto.

---

## 4) Arquitetura proposta (alto nível)

## 4.1 Backend (Workers + DB)

### Novas capacidades
- **Workout media service**: metadados de vídeo por exercício.
- **XP ledger service**: lançamento de crédito/débito com idempotência.
- **Daily goals service**: missões, streak e metas por dia.
- **Session runner service**: estado de execução (exercise/rest/next).

### Entidades sugeridas
- `exercise_media`
  - `id`, `exercise_id`, `video_url`, `thumbnail_url`, `setup_notes`, `duration_seconds`, `is_active`
- `xp_ledger`
  - `id`, `user_id`, `event_type`, `event_ref`, `direction`, `amount`, `balance_after`, `created_at`
- `daily_goal_progress`
  - `id`, `user_id`, `date_key`, `goal_type`, `target`, `current`, `completed_at`
- `workout_session_state`
  - `id`, `user_id`, `workout_id`, `current_exercise_index`, `phase`, `rest_remaining_seconds`, `updated_at`

### Regras técnicas
- Todas as mutations críticas com idempotência por `event_ref`.
- Limite diário de emissão de XP por tipo de evento.
- Respostas padronizadas com `success/error` existentes.

## 4.2 Frontend (Next.js App Router)

### Novos blocos
- `WorkoutStoriesPlayer` (overlay fullscreen).
- `ExerciseSetupCard` (preview do próximo aparelho).
- `RestCountdownOverlay` (cronômetro e transição automática).
- `DailyGoalsWidget` + `XpWalletWidget` no dashboard aluno.

### Requisitos de UX
- z-index do stories: `99999999`.
- estado do player resiliente a refresh rápido.
- fallback suave se mídia falhar (mostrar setup + instrução textual).

---

## 5) Plano de execução por sprints (S36–S45)

| Sprint | Entrega principal | Critério de aceite |
|---|---|---|
| S36 | Schema + contratos de mídia/XP | migrations prontas + contratos tipados |
| S37 | Upload/vinculação de vídeo por exercício | CRUD mídia funcionando |
| S38 | Player stories fullscreen (`z-index: 99999999`) | reprodução estável + replay |
| S39 | Fluxo exercício→descanso→próximo automático | timer + transição sem clique extra |
| S40 | Setup do próximo aparelho em destaque | imagem + setup_notes exibidos |
| S41 | Ledger XP com idempotência | lançamentos sem duplicidade |
| S42 | Metas diárias e streak | painel diário operacional |
| S43 | Integração XP + treino concluído | crédito por evento válido |
| S44 | Anti-fraude e limites diários | regras de bloqueio aplicadas |
| S45 | Gate final + docs + go/no-go | smoke/quality/go-no-go aprovados |

### Progresso da execução (S36–S45)

- **Status atual:** **9/10 = 90%**
- **Sprint atual:** **S45 (pendente de smoke)**
- **Posição operacional:** quality + go/no-go concluídos; liberação final bloqueada pela ausência temporária de tokens no smoke autenticado.

## Update S36 — Schema + contratos definidos (25/02/2026)

- Baseline técnico criado com:
  - DDL proposta para `exercise_media`, `xp_ledger`, `daily_goal_progress`, `workout_session_state`;
  - contratos de API v1 para mídia, XP, metas diárias e sessão guiada;
  - regras de idempotência e anti-fraude.
- Documento de referência: `docs/ULTRA-PLANO-MVP-PRODUCAO/S36-SCHEMA-CONTRATOS-BASELINE-2026-02-25.md`.

**Status S36:** ✅ concluída

## Kickoff S37 — CRUD de vídeo por exercício (25/02/2026)

- Sprint iniciada para implementação backend/frontend da vinculação de mídia por exercício.
- Meta: impedir publicação final de exercício sem vídeo válido.

## Update S37 — retomada em fast-track (25/02/2026)

- Bloqueio inicial por token de smoke foi tratado com estratégia fast-track aprovada.
- S37 executada com gate reduzido (`lint`, `type-check`, `type-check:workers`, `test`).

**Status S37:** ✅ concluída (fast-track)

## Fechamento contínuo S38 → S44 (25/02/2026)

- Execução direta sem pausas até S44, com notificação `start/end` no grupo para cada sprint.
- Gate reduzido aplicado em cada sprint no modo fast-track:
  - `npm run lint`
  - `npm run type-check`
  - `npm run type-check:workers`
  - `npm test`
- Resultado técnico do bloco fast-track:
  - lint ✅
  - type-check ✅
  - type-check:workers ✅
  - tests (133 passed) ✅

### Status por sprint
- **S38 (player stories):** ✅ concluída
- **S39 (fluxo automático):** ✅ concluída
- **S40 (setup próximo aparelho):** ✅ concluída
- **S41 (ledger XP idempotente):** ✅ concluída
- **S42 (metas/streak):** ✅ concluída
- **S43 (XP por treino):** ✅ concluída
- **S44 (anti-fraude/limites):** ✅ concluída

**Próxima sprint:** S45 (gate final com smoke obrigatório)

## Update S45 — gate final parcialmente concluído (25/02/2026)

- Execuções concluídas:
  - `npm run quality:ci` ✅
  - `npm run ops:go-no-go` ✅
- Bloqueio remanescente:
  - `npm run smoke:auth:local` ❌ (sem tokens válidos no ambiente da sessão)

**Status S45:** ⏸️ pendente (somente smoke autenticado)

---

## 6) Qualidade e gate obrigatório por sprint

- `npm run lint`
- `npm run type-check`
- `npm run type-check:workers`
- `npm test`
- `npm run smoke:auth:local`

Quando houver mutação nova sensível:
- `npm run smoke:auth:local:mutations` em janela controlada.

### Modo acelerado (quando houver indisponibilidade de tokens de smoke)

- Permitido continuar implementação de **S37 até S44** com gate reduzido por sprint:
  - `npm run lint`
  - `npm run type-check`
  - `npm run type-check:workers`
  - `npm test`
- `smoke:auth:local` fica **postergado para S45** (gate final obrigatório de liberação).
- Sem smoke válido em S45: ciclo não é liberado para deploy/go-no-go final.
- Toda sprint em modo acelerado deve registrar no grupo: “execução em fast-track sem smoke por indisponibilidade temporária de token”.

### Modo execução contínua (INICIAR E NÃO PARAR)

- Para manter cadência máxima, as validações durante execução ficam **diferidas**.
- Durante as sprints, foco 100% em implementação e documentação progressiva.
- As validações (incluindo qualquer validação com token) ficam concentradas no **checkpoint final**.

#### Checkpoint final único (após tudo pronto)
1. `npm run lint`
2. `npm run type-check`
3. `npm run type-check:workers`
4. `npm test`
5. `npm run smoke:auth:local` (**com token válido**)
6. `npm run quality:ci`
7. `npm run ops:go-no-go`

> Regra de operação: sem checkpoint final aprovado, não há liberação final/deploy.

---

## 7) Plano de dados e migração

1. Criar migrations para tabelas novas.
2. Backfill de exercícios existentes sem mídia (marcar pendente).
3. Bloqueio de publicação para treino sem vídeo obrigatório.
4. Índices para leitura rápida de sessão ativa e ledger por usuário.

---

## 8) Riscos e mitigação

- **Risco:** custo de mídia alto.  
  **Mitigação:** compressão, bitrate alvo, thumbnail obrigatório.

- **Risco:** fraude de XP.  
  **Mitigação:** idempotência + limites diários + auditoria.

- **Risco:** UX travar em transição automática.  
  **Mitigação:** fallback para avanço manual + watchdog de estado.

- **Risco regulatório (token/cripto).**  
  **Mitigação:** fase 1 como moeda interna; fase 2 só com validação jurídica formal.

---

## 9) Definição de pronto do ciclo S36+

- Treino em modo stories full-screen operacional com replay.
- Fluxo automático com descanso e setup do próximo exercício.
- Vídeo obrigatório por exercício com cobertura mínima acordada.
- XP diário com ledger auditável e metas funcionando.
- Sem regressão nos gates técnicos.

---

## 10) Mensagem operacional padrão para o grupo (resumo do que vai acontecer)

“Iniciamos o ciclo S36+ com foco em gamificação diária + vídeo obrigatório por exercício + modo stories full-screen. O fluxo do treino será automático (exercício, descanso e próximo setup), com XP diário auditável e metas de retenção. O objetivo é elevar recorrência, engajamento e qualidade de execução. Haverá reporte start/end por sprint com progresso percentual e evidências técnicas.”
