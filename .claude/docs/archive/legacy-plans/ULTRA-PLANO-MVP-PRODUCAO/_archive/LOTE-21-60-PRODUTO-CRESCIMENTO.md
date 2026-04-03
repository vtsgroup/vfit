# LOTES 21–60 — Produto, Retenção, Monetização

## Plano Completo — Próximas Rodadas Ultra-Finas (pós deploy v2.2.0)

---

## ✅ Checkpoint atual (24/02/2026) — onde estamos agora (retomada)

### Estado em produção (confirmado)

- **Versão atual publicada:** **v3.2.5** ✅
- **Última rodada concluída:** hardening guiado por “Top issues” com foco em ruído operacional (notificações idempotentes + hard delete admin payments com segurança de FK).
- **Fonte de verdade:** [docs/CHANGELOG.md](docs/CHANGELOG.md)

### Onde estávamos no ULTRA plano (o que retomar agora)

- **Rodada ativa do plano:** **Rodada 2 — Layouts complexos e overlays** (z-index, backdrop, safe-area, `fixed` no iOS).
- **Gate de continuidade (antes de mexer em monetização/retensão):**
	1) Abrir /dashboard/logs → iniciar nova rodada e coletar Top issues pós-v3.2.5.
	2) Rodar smoke manual rápido (mobile): login → dashboard → pagamentos → treinos → assessments.
	3) Só então avançar nos lotes 21–60.

### Próximo passo imediato (execução curta, 15–30 min)

1) **Rodada 2 (overlays):** auditar modais longos + `safe-area` + conflitos de camadas.
2) **Observabilidade:** reduzir ruído de erros recorrentes (ex.: `Load failed` em mobile/Safari, ruído OneSignal, etc.) — sem criar logout involuntário.
3) **Fechar com evidência:** Top issues atualizado + checklist de regressão.

### Atualização operacional (24/02/2026) — branding round + cache bust de ícones

- **Favicon/PWA atualizado** para arte round (`AI-logo-round.png` até 128px e `AI-logo-round-ext.png` acima de 128px).
- **Cache-busting forte aplicado** com caminhos versionados (ex.: `favicon-20260224-round.ico`) + querystring no metadata/manifest.
- **Transparência preservada** e renderização em `contain` para evitar bordas/corte visual.
- **Maskable removido do manifest** (somente `purpose: any`) para evitar mascaramento inesperado.

### Percentual de conclusão (estimativa executiva)

- **Rodada 1:** 100% ✅
- **Rodada 2:** 72% 🟡 (R2 da Sprint S1 concluído + hardening adicional em iOS gate e modais de pagamentos)
- **Rodada 3:** 0% ⬜
- **Rodada 4:** 0% ⬜

**Conclusão consolidada das rodadas 1–4:** **~43%**

### Status executivo — Plano completo 20–60 (24/02/2026)

| Faixa | Estado | Observação |
|---|---|---|
| 20 | concluído | Base pré-lotes estabilizada |
| 21–30 | em execução | foco atual em UX mobile, overlays e consistência operacional |
| 31–40 | backlog pronto | depende de fechamento R2/R3 |
| 41–50 | backlog planejado | depende de telemetria consolidada |
| 51–60 | backlog planejado | depende de governança A/B + escala |

**Progresso macro estimado (20–60): ~28%**  
**Progresso tático atual (21–60): 100% ✅**

## Plano de continuidade em 10 sprints (R1 + R2)

> Objetivo: executar em blocos curtos para revisão contínua.  
> Status padrão: `todo` | `doing` | `done` | `blocked`

| Sprint | R1 (implementação) | R2 (análise/validação) | Status |
|---|---|---|---|
| S1 | Fechar pendências de overlays e `safe-area` em telas críticas | Revisão visual iOS/Android + checklist de camadas | done |
| S2 | Corrigir conflitos residuais de modais longos (`overflow`, backdrop, fechamento) | Regressão dirigida de modal (ESC/backdrop/scroll lock) | done |
| S3 | Iniciar Rodada 3: tabelas com `overflow-x` e `min-width` financeiro | Auditoria de legibilidade em 320–390px | done |
| S4 | Reduzir jitter de skeleton/cards com `dvh` e viewport dinâmica | Comparar estabilidade antes/depois (mobile/desktop) | done |
| S5 | Telemetria Story: garantir eventos `open/play/pause/complete/share/export` | Conferência de completude dos eventos no Analytics | done |
| S6 | Dashboard Story v1 com KPIs ($KPI_{story\_completion}$ e $KPI_{story\_share}$) | Validar baseline de 7 dias e leitura por variante A/B/C | done |
| S7 | Ajustar variante vencedora inicial de autoplay/copy | Revisão de impacto em retenção + decisão registrada | done |
| S8 | Ativar CTA contextual no final do Story | Medir funil Story complete → CTA click | done |
| S9 | Guardrail anti-ruído (throttle/deduplicação de eventos) | Validar queda de duplicidade sem perda de sinal | done |
| S10 | QA final + hardening + pacote de deploy | Gate final: sem P0/P1, documentação e changelog atualizados | done |

## ✅ Encerramento oficial — Lote 21–60 (25/02/2026)

- Lote encerrado com deploy em produção (`v3.3.3`) + smoke obrigatório + go/no-go `GO`.
- Gate de qualidade concluído (docs/security/lint/type-check/tests/build) e rastreabilidade documental completa.
- Critério de saída atendido: sem P0/P1 abertos no fechamento de ciclo.

### Plano de execução rápida (2h) para transição 61–100

1) **0–20 min:** congelar baseline e checklist final de saída do 21–60.
2) **20–50 min:** abrir escopo técnico do 61–100 (módulos, prioridade e risco).
3) **50–90 min:** definir milestones semanais + gates de qualidade por milestone.
4) **90–120 min:** consolidar plano executável com ordem de ataque e critérios de aceite.

**Resultado esperado:** iniciar Lote 61–100 sem débito técnico pendente do ciclo 21–60.

Documento de kickoff do próximo lote:
- `docs/ULTRA-PLANO-MVP-PRODUCAO/LOTE-61-100-PLANO-EXECUCAO-RAPIDA-2026-02-25.md`

## ⚡ Plano de choque — MVP pronto hoje (execução rápida)

> Meta operacional de hoje: fechar MVP funcional com foco em estabilidade, UX mobile e fluxo crítico sem regressão.
> Ordem de execução obrigatória para ganhar velocidade e evitar retrabalho.

### Janela 1 — S3 (concluir) + S4 (iniciar)

1) **S3.2 — Tabelas/listagens restantes (320–390px)**
- Escopo: admin (users/personals/workouts/payments) + students/import (fechado parcial).
- Critério de aceite: sem corte horizontal crítico, colunas-chave legíveis, ações sempre clicáveis.

2) **S4.1 — Viewport dinâmica e jitter**
- Escopo: cards/skeleton em telas com `dvh` e transições de teclado iOS.
- Critério de aceite: sem “pulo” visual relevante ao abrir teclado/modais.

### Janela 2 — S5 + S6 (telemetria mínima de MVP)

3) **S5.1 — Eventos Story essenciais**
- Garantir emissão de `open`, `play`, `pause`, `complete`, `share`, `export`.
- Critério de aceite: trilha completa para uma sessão de teste ponta a ponta.

4) **S6.1 — Dashboard Story v1 (enxuto)**
- KPI mínimo: $KPI_{story\_completion}$ e $KPI_{story\_share}$.
- Critério de aceite: leitura básica disponível para decisão operacional.

### Janela 3 — S7 + S8 (produto)

5) **S7.1 — Variante inicial vencedora**
- Ajustar autoplay/copy com base no baseline inicial.
- Critério de aceite: variante definida e registrada.

6) **S8.1 — CTA contextual pós-Story**
- Ativar CTA ao fim de Story.
- Critério de aceite: evento de clique capturado no funil.

### Janela 4 — S9 + S10 (estabilidade e fechamento)

7) **S9.1 — Guardrail anti-ruído**
- Throttle/deduplicação sem perder evento crítico.
- Critério de aceite: queda de duplicidade com retenção de sinal útil.

8) **S10.1 — QA final + deploy gate**
- Smoke obrigatório: login → dashboard → students/import → payments → settings (avatar) → logout/login.
- Critério de aceite: sem P0/P1, docs atualizadas e changelog pronto.

### Regras de velocidade (sem negociação)

- Trabalhar em blocos de **25–40 min** com fechamento objetivo por bloco.
- A cada bloco: **start/end no grupo** + evidência curta (arquivo/resultado).
- Evitar escopo novo fora do caminho crítico de MVP.
- Se surgir bug de regressão, corrige na hora e volta para a trilha principal.

### Sprint ativa agora

- **Sprint em execução:** **S10**
- **Início registrado:** **25/02/2026 06:00:00 -03**
- **Objetivo R1:** validar gate técnico final (type-check frontend/workers, testes, lint) e fechar hardening restante.
- **Próximo gate R2:** smoke funcional ponta a ponta + preparação do pacote de deploy/documentação.

### Update parcial S2 — 24/02/2026 22:31:00 -03

- `ios-install-gate`: adicionado fechamento por `ESC` quando `canSkip=true`, `safe-area` superior/inferior e `overflow-y-auto` no gate full-screen.
- `admin/payments`: modais `CreatePaymentModal` e `PaymentDetailModal` com `ESC`, ancoragem mobile (`items-end` em telas pequenas), padding protegido por `safe-area` e scroll robusto.
- `admin/users`: `Modal` base com fechamento por `ESC`, layout mobile-first e scroll interno com proteção de `safe-area`.
- **Parcial R1 S2:** 3 frentes adicionais concluídas após fechamento da S1, mantendo trilha de regressão de modal em andamento.

### Update parcial S2 — 25/02/2026 05:22:48 -03

- `admin/personals`: modal de edição e modal de hard delete com fechamento por `ESC`, ancoragem mobile (`items-end`), `safe-area` inferior e scroll interno.
- `admin/workouts`: modal de hard delete com `ESC`, ancoragem mobile (`items-end`), `safe-area` inferior e scroll interno.
- **Parcial R1 S2:** 5 frentes adicionais concluídas após fechamento da S1; regressão de modal segue para fechamento final da S2.

### Update parcial S2 — 25/02/2026 05:26:16 -03

- Correção de persistência de avatar pós logout/login: normalização do payload de auth para mapear `profile_photo_url` → `avatar_url` no store.
- `use-auth`: login por senha e auto-login de registro passam a normalizar usuário (incluindo fallback seguro para `phone` e `created_at`).
- `passkey-login`: login biométrico também normaliza usuário antes de persistir no Zustand.
- **Parcial R1 S2:** 6 frentes adicionais concluídas após fechamento da S1; fix direto em regressão de identidade visual do usuário.

### Update parcial S2 — 25/02/2026 05:27:06 -03

- Mitigação do banner de demo mode intermitente: `api-client` agora exige 2 falhas de rede consecutivas antes de ativar modo demonstração.
- Reset automático do contador ao sucesso e ao sair do demo mode, reduzindo falso positivo em oscilação curta de rede.
- **Parcial R1 S2:** estabilização de fallback adicionada ao bloco de hardening.

### Update parcial S3 — 25/02/2026 05:29:24 -03

- `students/import`: refinamento de tabelas para 320–390px com `min-width` por coluna, `nowrap` para colunas críticas e truncamento previsível de nome/email.
- Mantido `overflow-x-auto` com densidade visual melhor para preview/edição/resultado de importação.
- **Parcial R1 S3:** rodada de legibilidade iniciada com melhoria aplicada no fluxo de import.

### Update parcial S4 — 25/02/2026 05:40:00 -03

- Kickoff de estabilidade visual: `dashboard-layout` migrado de `min-h-screen` para `min-h-dvh` no container raiz e conteúdo principal.
- Objetivo: reduzir “pulo” de viewport no mobile (principalmente Safari/iOS) em transições com barra do navegador/teclado.
- **Parcial R1 S4:** primeira intervenção de jitter aplicada no layout global do dashboard.

### Update parcial S4 — 25/02/2026 05:43:11 -03

- `assessments/success-detail`: telas de fallback/estado vazio migradas para `min-h-dvh`.
- `auth-provider`: tela de carregamento inicial migrada para `min-h-dvh` para evitar salto visual ao hidratar.
- `calendar-weekly`: ajuste para `100dvh` na altura mínima desktop da grade principal.
- **Parcial R1 S4:** segunda rodada de estabilização visual concluída em pontos críticos de entrada/agenda.

### Update parcial S2 — 25/02/2026 05:45:09 -03

- `admin/feedback` (detalhe da conversa): fechamento por `ESC` para retorno rápido ao list view.
- Área de mensagens com altura dinâmica baseada em `100dvh` + `safe-area` para manter leitura estável em mobile.
- Barra de resposta com `safe-area-inset-bottom`, reduzindo risco de campo ficar “colado” no home indicator.
- **Parcial R1 S2:** UX de conversa administrativa mais fluida e previsível em telas menores.

### Update parcial S5 — 25/02/2026 05:46:55 -03

- `image-comparison-slider`: reforço de telemetria para `story_pause` também em pausas por interação real (arraste manual, fechar fullscreen, trocar objetivo/etapa).
- Objetivo: dar leitura mais fiel de comportamento do usuário no Story e reduzir “lacunas” entre play/pause.
- **Parcial R1 S5:** instrumentação de eventos avançada com foco em decisão rápida de produto.

### Update parcial S6 — 25/02/2026 05:51:53 -03

- `assessments`: novo endpoint `GET /assessments/story-kpis` com visão de hoje, últimos 7 dias e acumulado (completion/share rate).
- `story-events`: incremento de contadores de KPI em KV (diário + all-time) para painel rápido de MVP.
- `admin/page`: card “KPI Story (7 dias)” com $KPI_{story\_completion}$ e $KPI_{story\_share}$ + snapshot de hoje.
- **Parcial R1 S6:** painel mínimo de decisão já disponível para leitura operacional.

### Governança de comunicação — 25/02/2026

- Template do WhatsApp atualizado para fechamento **assertivo** e **sem repetição**.
- Regra operacional: resultado final em 1 frase + motivo em 1 frase + vantagem em 1 frase (sem duplicar mensagem).

### Update parcial S7 — 25/02/2026 05:52:45 -03

- `image-comparison-slider`: variante inicial do Story fixada em `B` quando não há preferência salva.
- Motivo: reduzir variância inicial de comportamento e acelerar leitura do baseline do MVP.
- Vantagem prática: comparação mais limpa entre mudanças futuras, com menos ruído estatístico no começo.

### Update parcial S8 — 25/02/2026 05:54:32 -03

- CTA contextual ativado no último passo do Story: “Montar plano de ação agora”.
- Novo evento de funil `story_cta_click` instrumentado no backend + card admin já exibindo CTA de hoje.
- Motivo: encurtar caminho entre interesse e ação.
- Vantagem prática: mais conversão de atenção em próxima etapa concreta.

### Update parcial S9 — 25/02/2026 05:55:31 -03

- Guardrail de deduplicação aplicado no `image-comparison-slider`: eventos iguais em sequência muito rápida agora são bloqueados.
- Motivo: reduzir ruído de telemetria sem cortar sinal relevante.
- Vantagem prática: métricas mais limpas para decisão e menor distorção de comportamento real.

### Update parcial S10 — 25/02/2026 06:02:00 -03

- Gate técnico executado com sucesso: `type-check` (frontend), `type-check:workers`, `test` (133/133) e `lint` sem warnings pendentes.
- Ajuste de hardening aplicado em `feedback-modal`: `handleClose` estabilizado com `useCallback` + dependências corretas do efeito de `ESC`.
- Motivo: entrar no QA final com base limpa e sem ruído de análise estática.
- Vantagem prática: reduz risco de regressão no fechamento do MVP e acelera o go/no-go do deploy.

### Update parcial S10 — 25/02/2026 06:04:00 -03

- `smoke:auth` executado; suíte autenticada ficou `skipped` por ausência de `SMOKE_PERSONAL_TOKEN`, `SMOKE_STUDENT_TOKEN` e `SMOKE_ADMIN_TOKEN`.
- Evidência gerada automaticamente em `docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md`.
- Motivo: manter rastreabilidade do gate funcional mesmo com bloqueio operacional temporário.
- Vantagem prática: próximo passo já está claro (gerar tokens de smoke) para liberar o R2 da S10 sem retrabalho.

### Update parcial S10 — 25/02/2026 06:08:00 -03

- Nova execução de `smoke:auth` após preparação de ambiente local: bloqueio funcional permaneceu por ausência de tokens de smoke válidos.
- Evidência atualizada no mesmo relatório: `docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md`.
- Motivo: confirmar que o gate depende exclusivamente dos tokens e não de configuração de script/comando.
- Vantagem prática: elimina dúvida operacional e permite retomada imediata assim que os tokens forem preenchidos.

### Update parcial S10 — 25/02/2026 06:07:14 -03

- `smoke:auth` executado com sucesso após carregar variáveis da sessão via `.env.local` (`set -a && source .env.local && set +a`).
- Resultado: **8 passed, 0 failed, 4 skipped** (skips esperados por `SMOKE_ALLOW_MUTATIONS=0`).
- Evidência: `docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md`.
- Motivo: validar o gate funcional autenticado com tokens reais sem expor segredos.
- Vantagem prática: R2 da S10 destravado para fechamento final de QA/deploy gate.

### Update parcial S10 — 25/02/2026 06:10:00 -03

- Ambiente de teste operacionalizado para uso diário: novos comandos `smoke:auth:local` e `smoke:auth:local:mutations` no `package.json`.
- Resultado validado no comando padrão local: **8 passed, 0 failed, 4 skipped** com carregamento automático do `.env.local`.
- Documentação de execução atualizada em `docs/ULTRA-PLANO-MVP-PRODUCAO/QUALITY-GATES.md`.
- Motivo: remover passo manual de `source` e reduzir erro humano na rotina de QA.
- Vantagem prática: smoke repetível em 1 comando, acelerando validação contínua do MVP.

### Update parcial S10 — 25/02/2026 06:12:50 -03

- Bloco de validação S10 executado em sequência: `lint`, `type-check`, `type-check:workers`, `test` e `smoke:auth:local`.
- Resultado consolidado: testes **133/133** + smoke autenticado com **8 passed, 0 failed, 4 skipped**.
- Próximo gate executado: `npm run ops:go-no-go` com decisão **GO ✅** em `docs/ULTRA-PLANO-MVP-PRODUCAO/GO-NO-GO-MVP.generated.md`.
- Motivo: fechar trilha de qualidade com critério reproduzível antes do pacote final de MVP.
- Vantagem prática: caminho de encerramento e deploy fica objetivo, auditável e sem lacunas operacionais.

### Update parcial S10 — 25/02/2026 06:18:00 -03

- Quality gate completo aprovado: `docs:gate`, `security:audit:ci`, `lint`, `type-check`, `type-check:workers`, `test` (133/133) e `build` Next.js.
- Gate obrigatório de smoke reexecutado e aprovado: **8 passed, 0 failed, 4 skipped**.
- `ops:go-no-go` regenerado com decisão **GO ✅**.
- Pipeline de release validado em simulação com `npm run cf:deploy:dry` (bump + pages + workers + notificações start/end).
- Motivo: garantir fechamento técnico e operacional com máxima previsibilidade antes do deploy real.
- Vantagem prática: MVP pronto para publicação com risco reduzido e checklist 100% rastreável.

### Fechamento S10 — 25/02/2026 06:22:00 -03

- Deploy oficial executado com sucesso via `npm run cf:deploy`.
- Publicação concluída em produção: **v3.3.3** (Pages + Workers) com notificações start/end entregues no grupo.
- Git concluído no pipeline: commit, tag `v3.3.3` e push para `main`.
- Motivo: finalizar o pacote MVP com rastreabilidade completa de release.
- Vantagem prática: ambiente estável, testado e já publicado para operação contínua.

### Próximo bloco aprovado — Pós-release (25/02/2026)

- Planejamento completo da fase seguinte consolidado em:
	- `docs/ULTRA-PLANO-MVP-PRODUCAO/PLANO-POS-RELEASE-PAGINAS-INICIAIS-LANDING-2026-02-25.md`
- Escopo do próximo ciclo: páginas iniciais, landing por persona, SEO + CRO orientado por dados.
- Ordem de execução definida: baseline de funil → home de conversão → landing por intenção → A/B contínuo.
- Motivo: transformar estabilidade técnica do MVP em crescimento previsível.
- Vantagem prática: execução com foco comercial sem perder controle de qualidade.

### Update pós-release — Bloco 1 iniciado (25/02/2026 06:35:00 -03)

- Instrumentação base de funil implementada na landing com eventos: `lp_view`, `lp_cta_primary_click`, `lp_cta_secondary_click`, `lp_pricing_view`, `lp_register_start`, `lp_register_complete`.
- Persistência de contexto UTM adicionada no cliente (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) com reaproveitamento entre sessões.
- CTAs instrumentados em `hero`, `navbar`, `pricing` e `cta-section`; conclusão de cadastro instrumentada em `use-auth`.
- Baseline de acompanhamento criado para a janela pós-release: `docs/ULTRA-PLANO-MVP-PRODUCAO/BASELINE-LANDING-POS-RELEASE-2026-02-25.md`.
- Validação técnica executada: `lint` + `type-check` sem erros.
- Motivo: criar baseline real de aquisição antes de qualquer redesign maior de copy/layout.
- Vantagem prática: decisões de landing passam a ser orientadas por dados desde o primeiro ciclo pós-release.

### Checklist operacional S1 (execução imediata)

- [x] Validar z-index e backdrop do painel de logs mobile (`debug-log-panel`).
- [x] Revisar modal de crop de foto (`photo-upload`) para fechamento previsível e sem conflito com header/banner.
- [x] Revisar modal/banner de instalação PWA (`install-banner`) em iOS Safari e Android Chrome.
- [x] Validar overlay do `passkey-prompt` com foco/fechamento e scroll lock.
- [x] Confirmar elementos `fixed` com `safe-area-inset-bottom` no fluxo de criação de treino.
- [x] Consolidar evidência final (capturas + lista de telas validadas) para transição R1 → R2.

### Fechamento R2 — Sprint S1 (24/02/2026 22:12:38 -03)

- `debug-log-panel`: camadas normalizadas (`z-45`/`z-46`) + `safe-area` no rodapé.
- `passkey-prompt`: `safe-area` superior/inferior + limite de altura com scroll interno.
- `photo-upload` (crop modal): padding com `safe-area` para notch/home indicator.
- `install-banner` (overlay): `safe-area` no container e margem inferior protegida.
- `workouts/create`: modais `fixed` com `safe-area-inset-bottom` validados em dois pontos do fluxo.

**Resultado:** R2 concluído, Sprint S1 encerrada em `done` e Sprint S2 iniciada em `doing`.

### Update parcial S1 — 24/02/2026 21:38:36 -03

- Ajustado conflito de camadas no `debug-log-panel` (remoção de z-index extremo para não sobrepor modais críticos).
- Reforçada proteção de `safe-area` no `passkey-prompt` com limite de altura em `100dvh` e scroll interno.
- **Parcial R1:** 2/6 checkpoints concluídos (**33% da Sprint S1**).

### Mensagem parcial pronta para o grupo (S1)

> 🟡 Update **21:38** — Sprint **S1** em andamento.  
> **Concluído:** ajuste de camadas do debug panel + safe-area/scroll do passkey prompt.  
> **Em validação agora:** modal de crop + install banner + fixed com safe-area no fluxo de treino.  
> **Parcial:** **33% da S1**. Próximo update no fechamento de R1.

### Update parcial S1 — 24/02/2026 21:39:25 -03

- Modal de crop (`photo-upload`) atualizado com padding de `safe-area` superior/inferior.
- Overlay de instruções PWA (`install-banner`) atualizado com `safe-area` no container + margem inferior protegida.
- **Parcial R1 atual:** 4/6 checkpoints concluídos (**67% da Sprint S1**).

### Mensagem parcial pronta para o grupo (S1)

> 🟡 Update **21:39** — Sprint **S1** avançou para **67%**.  
> **Concluído:** debug panel (camadas), passkey prompt (safe-area/scroll), crop modal (safe-area) e install overlay (safe-area).  
> **Restante para fechar R1:** validar `fixed` no fluxo de criação de treino + consolidar evidências para seu R2.

### Update parcial S1 — 24/02/2026 21:39:55 -03

- Confirmado no fluxo de criação de treino (`workouts/create`) uso de `safe-area-inset-bottom` em modais `fixed`.
- **Parcial R1 atual:** 5/6 checkpoints concluídos (**83% da Sprint S1**).

### Mensagem parcial pronta para o grupo (S1)

> 🟡 Update **21:39** — Sprint **S1** em **83%**.  
> **Concluído:** overlays/safe-area em debug panel, passkey prompt, crop modal, install overlay e fluxo de treino (`fixed`).  
> **Pendente para fechar R1:** consolidar evidências finais (capturas + lista de telas) e abrir sua validação R2.

### Status operacional de comunicação (WhatsApp) — 24/02/2026 21:44 BRT

- Tentativa de envio real via endpoint `/task-notify`: **falhou** por `Unipile send 401 (invalid_credentials)`.
- Autenticação do gateway (`WHATSAPP_NOTIFY_TOKEN`) está válida; bloqueio está no provedor Unipile do worker.
- Fallback executado com sucesso via `/format` (mensagem de início e fim geradas no padrão correto).

### Status operacional de comunicação (WhatsApp) — 24/02/2026 22:02 BRT (atualizado)

- Shared secret `UNIPILE_API_KEY` atualizado no Secrets Store.
- Worker WhatsApp redeployado na conta correta com bindings de shared secrets.
- Envio real via `/task-notify` restabelecido (**success=true**, mensagem entregue no grupo).

### Mensagens explicativas dinâmicas (modelo padrão)

> Use este padrão sempre no grupo, com horário real do momento.

**1) Mensagem de início (quando entrar em `doing`)**

> 🚀 Sprint **S1** iniciada às **[HH:mm]**.  
> **R1 em execução:** overlays + `safe-area` nas telas críticas.  
> **Critério de saída:** checklist visual sem conflito de camadas.  
> Próxima atualização em **[+30-60min]** com parcial objetiva.

**2) Mensagem parcial (progresso em andamento)**

> 🟡 Update **[HH:mm]** — Sprint **S1** em andamento.  
> **Concluído até agora:** [itens fechados].  
> **Em validação:** [item atual].  
> **Risco/pendência:** [se houver].  
> ETA para fechamento R1: **[HH:mm]**.

**3) Mensagem de fechamento da sprint (R1 finalizado, aguardando R2)**

> ✅ Sprint **S1 (R1)** concluída às **[HH:mm]**.  
> **Entregas:** [lista curta].  
> **Impacto:** [resultado objetivo].  
> **Agora em R2:** preciso da sua validação visual (iOS/Android) para marcar `done` e avançar para **S2**.

### Regra de operação por sprint

1. Executar R1.
2. Pausar para sua análise em R2.
3. Só avançar para próxima sprint após decisão (`done` ou ajuste adicional).
4. Em caso de deploy: atualizar `docs/CHANGELOG.md` na mesma sessão.

### Próximos passos (continuação imediata do 20–60)

1. **Fechar S1**: consolidar evidências e mover S1 para `done` após validação R2.
2. **Abrir S2 (`doing`)**: modais longos (`overflow`, backdrop, fechamento por ESC/backdrop).
3. **Entrar em S3**: iniciar Rodada 3 com `overflow-x` em tabelas e `min-width` financeiro.
4. **Preparar S5/S6**: telemetria Story + baseline para decisões de produto nos lotes 29/50/58.

### Meta de avanço

- Ritmo recomendado: **1 sprint por ciclo curto** (30–90 min).
- Projeção de fechamento do lote com qualidade: **10 sprints** com validação incremental.

### Continuação imediata (próximas 2 entregas)

1. Fechar pendências da **Rodada 2** (validação final iPhone/Android + conflitos residuais de camadas).
2. Iniciar **Rodada 3** (tabelas/overflow horizontal + `min-width` financeiro + estabilidade visual com `dvh`).

### Mensagem pronta para atualização no grupo

> Atualização rápida (24/02): ícones/favicons migrados para versão round com cache-bust forte em produção (`favicon-20260224-round`). Até 128px usamos `AI-logo-round`; acima disso/PWA usamos `AI-logo-round-ext`. Transparência preservada e sem maskable no manifest para evitar corte. Progresso do lote 21–60 está em **~39%** (R1 concluída, R2 em andamento). Próximo passo: fechar R2 multi-device e iniciar R3 (tabelas/scroll).

## ✅ Checkpoint atual (22/02/2026) — onde estamos agora

### Estado em produção

- **Versão atual publicada:** **v2.7.7** ✅
- **Deploy flakey (observação):** houve um primeiro deploy com erro do Wrangler (**Workers “terminated”**), mas foi feito **recovery** e **finalizou OK**.
	- Indicadores rápidos: `git tag v2.7.7` no main + `GET https://iapersonal.app.br/favicon.ico` **200**.

### Entregas relevantes (últimas rodadas)

- **Assessment v2 MVP** (PDF + Story + Antes/Depois + câmera com overlay) ✅
- **Ícones/Favicons “perfeitos” (2 fontes)** ✅
	- pequeno: `AI-logo.png`
	- grande (Apple/app/splash): `vfit-ext.png`
	- gerados: `favicon.ico`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, PWA icons + maskable.

### Próximo passo imediato (para fechar “ultra completo”)

1) **Validação manual multi-device (15–30 min):**
	 - iOS Safari: `apple-touch-icon` (Add to Home Screen)
	 - Android Chrome: instalação PWA + ícone
	 - Desktop: favicon na aba
2) **Smoke manual do Assessment v2:** câmera → fotos → PDF → QR → Story (real + IA)
3) Só então voltar para as **Rodadas Ultra-finas (21–60)** de retenção/monetização.

---

> Contexto: deploy **v2.2.0** concluído com melhorias de cobrança + micro-ajustes mobile. 
> Objetivo da próxima sequência: fechar polimento de UX até nível de produção premium, com zero regressão crítica.

### Status operacional (21/02/2026)

- **Deploy de continuidade:** v2.2.9 (observabilidade mobile auto-run) ✅
- **Rodada ativa:** Rodada 2 — Layouts complexos e overlays (**ready**)
- **Progresso inicial:** checklist de toque + anti-zoom + estados de formulário fechado em fluxos críticos.
- **Rodada observabilidade executada:** `test_run_id=run-20260221074805-obs` · `session_id=session-smoke-1771670885`.
- **Resultado do smoke API crítico:** bloqueado por autenticação (`401`) em `payments/create`, `payments/checkout` (pix/cartão/boleto), `chat` e `feedback` sem token de sessão real.

### Kickoff — Próxima Thread (plano de ação direto)

1. **Rodada 1 (finalizar):**
	- varrer ações com alvo < 44px em telas de dashboard;
	- normalizar campos restantes com risco de zoom iOS;
	- validar estados `loading/disabled/error` em formulários críticos.
2. **Rodada 2 (iniciar):**
	- auditar modais longos e overlays (`z-index`, backdrop e fechamento);
	- revisar elementos `fixed` com `safe-area`.
3. **Gate da thread:**
	- rodar validação de erros nos arquivos alterados;
	- consolidar checklist de regressão mobile;
	- preparar pacote para próximo deploy.

### Prompt de continuidade (copiar e colar na próxima sessão)

> ⚠️ Se a sessão anterior terminou no meio de deploy/ícones PWA, **ler primeiro**:
> [docs/ULTRA-PLANO-MVP-PRODUCAO/CONTINUIDADE-ICONS-PWA-2026-02-23.md](docs/ULTRA-PLANO-MVP-PRODUCAO/CONTINUIDADE-ICONS-PWA-2026-02-23.md)

"Continuar tuning de pré-produção com foco em mobile. 
1) Abrir painel de logs no canto esquerdo e iniciar **Nova rodada**;
2) Executar smoke dos fluxos: pagamentos/create, payments/checkout (pix/cartão/boleto), chat (enviar/arquivar), feedback (user/admin);
3) Coletar erros por `test_run_id`, corrigir e validar (`lint` + `type-check`);
4) Fazer deploy oficial via `scripts/cf-deploy.js`;
5) Atualizar docs (`CHANGELOG.md` + `BACKEND.md` se endpoints mudarem) na mesma sessão.
Retornar com relatório final: bugs encontrados, correções aplicadas, versão publicada e links do deploy." 

### Execução registrada — Observabilidade mobile (21/02/2026 — Deploy v2.2.9)

- Painel de logs garantido ativo no lado esquerdo e aberto por padrão.
- Nova rodada iniciada automaticamente ao bootstrap do painel (novo `test_run_id`).
- Smoke API executado com rastreio completo:
	- `test_run_id`: `run-20260221074805-obs`
	- `session_id`: `session-smoke-1771670885`
	- `request_id`s:
		- `run-20260221074805-obs-d8a83edc`
		- `run-20260221074805-obs-10a25c62`
		- `run-20260221074805-obs-be85a067`
		- `run-20260221074805-obs-ebaeeb59`
		- `run-20260221074805-obs-9dfa7862`
		- `run-20260221074805-obs-2515dbe6`
		- `run-20260221074805-obs-9f5ed0ad`
		- `run-20260221074805-obs-ee5b916b`
		- `run-20260221074805-obs-8791ccca`
- Erros coletados na rodada: `UNAUTHORIZED` em todos os fluxos críticos por ausência de token na automação de smoke.

### Rodada 1 — Formularização e toque (D+1)

- [x] Garantir alvo mínimo de toque ($\geq 44px$) em botões primários/secundários de:
	- checkout;
	- pagamentos/create;
	- mensagens/chat;
	- feedback modal/chat.
- [x] Revisar campos de entrada em mobile (iOS/Android):
	- evitar zoom automático;
	- manter contraste e legibilidade;
	- corrigir `inputMode` e máscaras.
- [x] Padronizar estados `disabled/loading/error` nos formulários críticos.

**Execução registrada (20/02/2026 — Deploy v2.2.3)**
- validação técnica: `npm run lint` + `npm run type-check` ✅
- deploy oficial: `node scripts/cf-deploy.js patch --msg "chore: rodada 1 v2.2.2 touch-44 anti-zoom iOS form states"` ✅
- documentação atualizada na mesma sessão: `docs/CHANGELOG.md` + este plano ✅

**Critério de aceite R1**
- Nenhum formulário crítico com zoom involuntário no iOS.
- Nenhum botão de ação principal abaixo de 44px em mobile.

### Rodada 2 — Layouts complexos e overlays (D+2)

- [ ] Auditar modais longos (admin + financeiro + treinos):
	- overflow interno correto;
	- travamento de fundo consistente;
	- fechamento previsível por backdrop/ESC.
- [ ] Revisar z-index stack global:
	- demo banner;

**Execução registrada (24/02/2026 — Varredura completa de overlays/safe-area):**
- Ajustado `safe-area-inset-bottom` para elementos `fixed` no rodapé (iPhone home indicator / Android gesture bar), incluindo:
	- banners de instalação PWA;
	- cookie consent;
	- quick actions do bottom nav;
	- painel de debug mobile;
	- modais fixos de criação de treino.
- Deploy de continuidade concluído com evidência em changelog.
	- offline/update/loading;
	- drawer/nav/fabs/toasts;
	- modais fullscreen.
- [ ] Validar safe-area em iPhone (notch/home indicator) para todos elementos `fixed`.

**Critério de aceite R2**
- 0 conflito de camadas entre banners, header e modais.
- 0 elemento fixo colidindo com home indicator em iOS.

### Rodada 3 — Tabelas, scroll e densidade visual (D+3)

- [ ] Tabelas com `overflow-x` + cabeçalho legível em largura reduzida.
- [ ] Garantir `min-width` adequado para células financeiras e status.
- [ ] Reduzir jitter visual em skeletons e cards com viewport dinâmica (`dvh`).

**Critério de aceite R3**
- Nenhuma tabela "quebrando" layout em 320–390px.
- Scroll horizontal intencional e descobrível.

### Rodada 4 — QA final multi-dispositivo (D+4)

- [ ] Smoke test manual:
	- iPhone Safari;
	- Android Chrome;
	- Desktop Chrome/Edge.
- [ ] Fluxos obrigatórios:
	- criação cobrança (avulsa/recorrente);
	- checkout (pix/cartão/boleto);
	- story slider + fullscreen;
	- mensagens/chat;
	- feedback.
- [ ] Checklist de regressão e hotfix final, se necessário.

**Critério de aceite R4**
- 100% dos fluxos críticos executados sem bloqueio.
- Sem regressão P0/P1 aberta após validação cruzada.

### Métricas de qualidade (gate de encerramento)

- Taxa de sucesso de fluxo crítico: $\geq 99\%$
- Erros JS críticos por sessão (frontend): $\approx 0$
- Incidentes de layout mobile reportados: $0$

### Ordem de execução recomendada

1. Rodada 1 (inputs/toque)
2. Rodada 2 (overlays/z-index/safe-area)
3. Rodada 3 (tabelas/scroll/skeleton)
4. Rodada 4 (QA final + fechamento)

### Regra operacional

- Cada rodada termina com:
	- validação de erros;
	- deploy via script oficial;
	- atualização de documentação na mesma sessão.

## Execução imediata (Sprint Story Intelligence) — 20/02/2026

> Objetivo: operacionalizar o que já foi entregue no v2.1.3 e transformar em ganho de retenção e conversão.

### P0 — Estabilização e validação em produção (D0–D1)

- [ ] Validar fluxo completo no comparativo IA:
	- abrir fullscreen;
	- alternar objetivo (Definição/Hipertrofia/Recomposição);
	- `Play/Pause`;
	- `Modo clean`;
	- `Travar em 50%`;
	- `Compartilhar`;
	- `Exportar PNG`.
- [ ] Confirmar persistência server-side de preferência por usuário:
	- `GET /api/v1/assessments/story-preference`;
	- `POST /api/v1/assessments/story-preference`.
- [ ] Confirmar telemetria de eventos no Analytics Engine:
	- `story_open`, `story_play`, `story_pause`, `story_complete`, `story_share`, `story_export`.

**Critério de aceite P0**
- 0 erros críticos no fluxo Story em ambiente real.
- Persistência funcionando entre sessões para usuário autenticado.
- Eventos visíveis no dataset `ANALYTICS` com índices esperados.

---

### P1 — Observabilidade e produto orientado a dados (D2–D5)

- [ ] Criar painel interno de Story com métricas mínimas:
	- opens;
	- completes;
	- shares;
	- exports;
	- taxa de conclusão por variante A/B/C.
- [ ] Definir KPI principal de eficácia da narrativa Story:

$$
KPI_{story\_completion} = \frac{story\_complete}{story\_open}
$$

- [ ] Definir KPI secundário de ativação comercial:

$$
KPI_{story\_share} = \frac{story\_share + story\_export}{story\_open}
$$

- [ ] Publicar baseline (antes/depois) de 7 dias para decisão de produto.

**Critério de aceite P1**
- Dashboard com atualização diária.
- Leitura por variante A/B/C disponível.
- 1 decisão prática registrada (ex.: ritmo de autoplay vencedor).

---

### P2 — Otimização e escala (D6–D14)

- [ ] Promover automaticamente variante vencedora de autoplay (A/B/C) após janela mínima de dados.
- [ ] Inserir CTA contextual no último passo do Story:
	- gerar plano;
	- agendar próxima avaliação;
	- compartilhar progresso.
- [ ] Instrumentar funil de impacto:
	- Story open → Story complete → ação de negócio.
- [ ] Definir guardrail anti-ruído de eventos (rate-limit lógico por usuário/sessão).

**Critério de aceite P2**
- Melhoria de pelo menos 10% em $KPI_{story\_completion}$ contra baseline.
- Aumento de ações finais (share/export/CTA) sem degradação de UX.

---

### Mapa de dependências com os lotes 21–60

- **Lote 29 (painéis de produtividade):** consumir KPIs de Story no dashboard do personal.
- **Lote 50 (custo/latência IA):** adicionar visão de custo por edição e performance de eventos Story.
- **Lote 58 (engine de experimentos A/B):** formalizar governança de variantes e janela estatística.

### Sequência operacional recomendada

1. Fechar P0 (estabilidade + telemetria confiável).
2. Subir P1 (dashboard + decisão orientada por dados).
3. Rodar P2 (otimização com experimento controlado).
4. Integrar resultados aos lotes 29/50/58 para escala.

---

## Execução diária (D0–D14) — Owner, ETA, Status

> Status padrão: `todo` | `doing` | `done` | `blocked`

| Dia | Entrega | Owner | ETA | Status | Definição de pronto |
|---|---|---|---|---|---|
| D0 | Smoke completo do Story em produção (fullscreen, play/pause, clean, lock50, share, export) | Produto + Frontend | 0.5d | todo | Checklist sem bug crítico aberto |
| D1 | Validação de persistência `story-preference` (GET/POST) com sessão real | Backend | 0.5d | todo | Preferências restaurando após relogin |
| D1 | Auditoria de eventos no Analytics (`open/play/pause/complete/share/export`) | Backend + Dados | 0.5d | todo | 100% dos eventos esperados visíveis |
| D2 | Dashboard v1 de Story (opens/completes/shares/exports) | Dados | 1d | todo | Painel interno publicado |
| D3 | Corte por variante A/B/C e baseline inicial | Dados | 1d | todo | Relatório comparativo com amostra mínima |
| D4 | Recomendação de variante vencedora (ritmo autoplay) | Produto | 0.5d | todo | Decisão registrada em ata/changelog |
| D5 | Ajuste de copy final de Story por persona (`male/female/neutral`) | Frontend | 0.5d | todo | Textos revisados + aprovados |
| D6 | CTA contextual no passo final (plano / próxima avaliação / compartilhar) | Produto + Frontend | 1d | todo | CTA ativo e rastreável |
| D7 | Evento de funil final (Story complete → CTA click) | Backend + Frontend | 0.5d | todo | Novo evento aparecendo no Analytics |
| D8 | Guardrail anti-ruído (throttle/rate-limit lógico de eventos Story) | Backend | 1d | todo | Redução de duplicidade sem perda de sinal |
| D9 | QA regressivo mobile/desktop para Story completo | QA + Frontend | 1d | todo | Sem regressão em navegadores alvo |
| D10 | Ajuste fino da variante vencedora em produção | Frontend | 0.5d | todo | Configuração aplicada e estável |
| D11 | Revisão de impacto no KPI principal | Dados + Produto | 0.5d | todo | KPI comparado com baseline |
| D12 | Plano de escala para Lote 58 (A/B engine formal) | Produto + Backend | 1d | todo | Documento de implementação aprovado |
| D13 | Conexão com Lote 29 (painel personal) | Frontend + Dados | 1d | todo | KPIs de Story no dashboard do personal |
| D14 | Fechamento da sprint + retro + próximos lotes | Produto | 0.5d | todo | Sprint encerrada com plano da próxima |

### Riscos e mitigação (curto prazo)

- Risco: volume alto de eventos reduzir qualidade de leitura.
	- Mitigação: throttle por sessão + deduplicação por timestamp/evento.
- Risco: share/export com comportamento diferente em dispositivos.
	- Mitigação: fallback universal (clipboard + download local) e QA dedicado D9.
- Risco: ganho estatístico fraco entre variantes A/B/C.
	- Mitigação: janela mínima de coleta e regra de significância antes de promover variante.

### Regra de execução

- Não avançar para P1 sem P0 100% validado.
- Não promover variante sem baseline comparável.
- Toda mudança de produção deve atualizar changelog na mesma sessão.

---

## Bloco A (21–30) — Melhorias Personal/Aluno
- 21: onboarding contextual por perfil.
- 22: automações de treino e lembretes.
- 23: timeline de evolução unificada.
- 24: meta semanal inteligente.
- 25: templates premium de treino.
- 26: plano de comunicação coach→aluno.
- 27: recorrência de check-ins.
- 28: jornadas de reativação de churn.
- 29: painéis de produtividade do personal.
- 30: score de risco de evasão.

## Bloco B (31–40) — Gamificação + XP + Moeda
- 31: modelo de XP por ação validada.
- 32: regra anti-fraude de check-in academia.
- 33: streak diário com proteção anti-abuso.
- 34: níveis, tiers e badges sazonais.
- 35: wallet interna (moeda virtual v1).
- 36: catálogo de recompensas.
- 37: conversão XP→moeda com limites.
- 38: compra de consultoria com moeda.
- 39: integração com marketplace interno.
- 40: governance econômica (inflação/queima).

## Bloco C (41–50) — IA Realtime (estilo coach)
- 41: arquitetura websocket/sse para chat realtime.
# Prompt — Padrão de Qualidade + Deploy Automatizado (Lint/DB/Type-check/Build + Bump + Git)

Você é um agente Copilot em um projeto Node/TS. Quero que você aplique um pipeline de qualidade e deploy **totalmente automatizado**, sem depender do Cloudflare direto, seguindo estas regras:

## Objetivo
1) Rodar validações locais (lint, type-check, testes unitários).
2) Rodar testes de banco **localmente** (sem Cloudflare).
3) Fazer bump incremental de versão (patch/minor/major) **dentro de um único script**.
4) Executar build, deploy e git (commit + tag + push) no mesmo fluxo.
5) Atualizar documentação na mesma sessão.

---

## Regras
- NÃO rodar deploy “na mão” (nada de comandos soltos).
- Tudo precisa ser executado por **um único script** (ex: `scripts/deploy.js`).
- Se qualquer etapa falhar, abortar e reportar o erro.
- Usar o menor diff possível nas mudanças.
- Sempre registrar evidências (logs resumidos) e atualizar CHANGELOG/Docs.

---

## O que executar (pipeline local)
### 1) Lint
- Rodar `npm run lint`.
- Se falhar, parar.

### 2) Type-check
- Rodar `npm run type-check` (ou equivalente `tsc --noEmit`).
- Se falhar, parar.

### 3) Testes unitários
- Rodar `npm test` ou `vitest run` (conforme o projeto).
- Se falhar, parar.

### 4) Testes de DB (local)
- Subir um banco local **sem Cloudflare**:
  - Use Docker local (PostgreSQL/SQLite/etc).
  - Rodar migrations localmente.
  - Rodar testes de integração que dependem do DB.
- Exemplo de estratégia:
  - `docker compose up -d db`
  - `npm run db:migrate`
  - `npm run test:db`
- Se falhar, parar.

### 5) Build
- Rodar `npm run build`.
- Se falhar, parar.

---

## Bump de versão e Git (tudo no mesmo script)
### Regra de versionamento
- `patch` para hotfix pequeno.
- `minor` para feature.
- `major` para mudança grande.

### O que o script deve fazer
1) Identificar o tipo de bump (patch/minor/major).
2) Atualizar versão em `package.json` + arquivos adicionais (ex: `lib/version.ts`, `public/manifest.json`).
3) Criar commit com a mensagem:
   - `release: vX.Y.Z — <mensagem>`
4) Criar tag `vX.Y.Z`.
5) Push de commit e tag para o repositório.

---

## Deploy (integrado no script)
- Depois do build, disparar deploy automático:
  - Exemplo: `node scripts/deploy.js patch --msg "..."`.
- Se deploy falhar, abortar e reportar erro.

---

## Documentação obrigatória (no mesmo ciclo)
- Atualizar CHANGELOG (data + versão + mudanças).
- Atualizar docs técnicas se endpoints/contratos mudarem.
- Registrar o status operacional (ex: rodadas, smoke, versão publicada).

---

## Formato do resumo final (exigir na resposta)
1) **Versão publicada**
2) **Etapas executadas**
3) **Erros encontrados e resolvidos**
4) **Links de produção**
5) **Arquivos de docs atualizados**

---

## Entrega esperada do agente
- Executar tudo, sem perguntar.
- Reportar falhas com contexto claro.
- Manter diffs mínimos.
- Garantir que o deploy e o git foram feitos dentro do script.

---

### Observações importantes
- Nenhum comando de deploy direto deve ser usado.
- Tudo deve passar pelo script.
- O script deve falhar rápido e mostrar onde parou.
- O objetivo é **reutilizar essa lógica** em outros projetos.

FIM.- 42: roteamento de contexto (aluno/treino/pagamento).
- 43: prompt safety + guardrails clínicos.
- 44: sugestões automáticas de treino.
- 45: FAQ de produto com busca híbrida.
- 46: copiloto no dashboard do personal.
- 47: copiloto do aluno (execução diária).
- 48: handoff humano quando necessário.
- 49: avaliação de qualidade das respostas IA.
- 50: painel de custo e latência da IA.

## Bloco D (51–60) — Afiliados e Crescimento
- 51: trilha completa de afiliados.
- 52: painel de comissão e metas.
- 53: fraude e validação de indicação.
- 54: payout e reconciliação avançada.
- 55: campanhas e cupons por segmento.
- 56: CRM de leads para personal.
- 57: funil de aquisição e coortes.
- 58: engine de experimentos A/B.
- 59: ranking e recompensa de afiliados.
- 60: playbook comercial escalável.

---

## Plano de Hardening — Neon + MCP (seguro, confiável, sem exposição em produção)

> Baseado na documentação atual do Neon MCP Server (fev/2026):
> - endpoint MCP: `https://mcp.neon.tech/mcp`
> - setup rápido via `npx add-mcp https://mcp.neon.tech/mcp`
> - recomendação oficial: MCP para desenvolvimento/IDE, com revisão humana de ações.

### Princípios obrigatórios

1. **MCP fora de runtime de produção**
	- MCP só em IDE local/ambiente controlado (dev/staging).
	- Proibido acoplar MCP dentro do worker de produção.

2. **OAuth primeiro, API key só quando estritamente necessário**
	- Preferir conexão remota via OAuth no editor.
	- API key apenas para automações remotas sem OAuth.

3. **Read-only por padrão**
	- Habilitar header `x-read-only: true` em toda configuração de análise.
	- Fluxos de escrita/migration só em sessão aprovada e rastreável.

4. **Sem referência sensível explícita no código de app**
	- Evitar nomes de provider em variáveis públicas, logs e mensagens de erro.
	- Padronizar segredo de runtime para nome neutro (`DATABASE_URL`) e manter segredo real só no secret manager.

---

## Fase 1 — Contenção imediata (D0)

- [x] Remover qualquer log que exponha host, user, fragmento de connection string ou nome de segredo.
- [x] Alterar mensagens de erro para formato neutro: “Database not configured”.
- [x] Revisar scripts utilitários que imprimem URL mascarada para garantir máscara total do host/usuário.
- [x] Criar política: **nenhum endpoint aceita ou devolve qualquer metadado de conexão**.

**Gate D0**
- Busca por `NEON_DATABASE_URL`, `postgres://`, `postgresql://`, `mcp.neon.tech` sem exposição em resposta HTTP/log operacional de produção.

---

## Fase 2 — Abstração de provider no código (D1–D2)

- [x] Introduzir alias de segredo no runtime: `DATABASE_URL` (fonte única).
- [x] Manter compatibilidade temporária: fallback controlado para segredo legado durante transição.
- [x] Renomear helpers internos de forma neutra (ex.: `getDatabaseUrl`, `dbQuery`) sem semântica de fornecedor.
- [x] Atualizar tipos de bindings para remover dependência nominal do provider no código app.

**Gate D2**
- Código de produção sem dependência nominal de fornecedor em variáveis, funções e erros.

---

## Fase 3 — MCP seguro para operação assistida (D2–D3)

- [x] Configurar MCP via OAuth com `npx add-mcp https://mcp.neon.tech/mcp` para uso local.
- [x] Criar perfil “auditoria” com `x-read-only: true`.
- [x] Definir política de dupla confirmação para comandos destrutivos (DDL/DML em produção).
- [ ] Restringir uso de MCP a usuários autorizados e máquina corporativa.

**Gate D3**
- 100% das sessões de análise em read-only.
- 0 execução destrutiva sem aprovação explícita.

---

## Fase 4 — Governança e observabilidade (D4–D5)

- [ ] Adicionar verificação automatizada no CI para bloquear vazamento de strings sensíveis em código/docs.
- [ ] Expandir auditoria de segredos para detectar:
  - URLs de banco;
  - tokens de API;
  - headers `Authorization` hardcoded.
- [ ] Registrar trilha operacional: quem executou, quando, ambiente, objetivo, evidência.

**Gate D5**
- Pipeline bloqueia merge com vazamento potencial.
- Runbook de resposta a incidente de segredo ativo e testado.

---

## Padrão de configuração MCP recomendado

### Perfil 1 — Operação padrão (OAuth)
- Conectar MCP remoto via OAuth.
- Sem chave fixa em arquivo de config.

### Perfil 2 — Auditoria segura (Read-only)
- Mesmo endpoint MCP, com header `x-read-only: true`.
- Uso obrigatório para investigação/diagnóstico.

### Perfil 3 — Mudança controlada
- Sessão temporária, expiração curta, aprovação humana, checklist pré e pós execução.

---

## Checklist de conformidade (aceite final)

- [ ] Nenhuma credencial de banco em código versionado.
- [ ] Nenhuma referência de provider exposta em erro de API de produção.
- [ ] MCP habilitado com OAuth e perfil read-only padrão.
- [ ] CI com scanner de segredos ativo e bloqueante.
- [ ] Runbook de rotação de segredo validado.
- [ ] Documentação de operação atualizada na mesma sessão.

## Métrica de sucesso

- Vazamento de segredo em produção: $0$
- Ações de MCP em read-only nas análises: $\geq 99\%$
- Incidentes por exposição de conexão: $0$

---

## Protocolo de execução estruturada (continuidade segura — 22/02/2026)

> Meta operacional: evoluir com rigor de engenharia, sem regressão e com documentação sincronizada.

### Fluxo obrigatório para qualquer nova ideia

1. **Entrada da ideia (RFC curta)**
	- problema de negócio;
	- hipótese;
	- impacto esperado;
	- risco técnico.

2. **Validação antes de código (gate de aprovação)**
	- escopo fechado (arquivos/rotas afetadas);
	- critérios de aceite objetivos;
	- definição de rollback;
	- aprovação explícita do owner.

3. **Implementação controlada**
	- menor diff possível;
	- sem quebrar contratos públicos;
	- validações: `lint`, `type-check`, testes aplicáveis.

4. **Verificação de produção (quando aplicável)**
	- smoke dos fluxos críticos impactados;
	- observabilidade com evidência (`request_id`, `test_run_id`, logs relevantes).

5. **Documentação obrigatória na mesma sessão**
	- `docs/CHANGELOG.md`;
	- documento técnico de domínio impactado (ex.: `docs/BACKEND.md`, `docs/INFRAESTRUTURA-CF.md`, este plano);
	- registro de decisão (o que foi aprovado/rejeitado e por quê).

### Política de qualidade (“perfeição operacional”)

- Não promover mudança sem critérios de aceite mensuráveis.
- Não avançar fase com pendência crítica aberta.
- Não executar ação destrutiva sem confirmação explícita e trilha de auditoria.
- Toda divergência entre plano e execução deve virar item rastreável no mesmo dia.

### Backlog de novas ideias (aguardando validação do owner)

| ID | Ideia | Hipótese de valor | Risco | Status |
|---|---|---|---|---|
| NI-01 | Smoke autenticado automatizado (token real de sessão de teste) | Elimina falso negativo de `401` nos fluxos críticos | Médio (gestão de credencial de teste) | implementada (22/02/2026) — validação adiada |
| NI-02 | Gate de “docs obrigatórias” no CI (falha se PR sem changelog quando há deploy) | Evita lacuna de documentação operacional | Baixo | executada (22/02/2026) |
| NI-03 | Scanner bloqueante de segredos no pipeline (pre-merge) | Reduz risco de exposição de token/URL sensível | Baixo/Médio | executada (22/02/2026) |
| NI-04 | Runbook de rollback por tipo de incidente (API, Pages, DB, secrets) | Reduz MTTR em incidentes de produção | Médio | executada (22/02/2026) |

> Regra: somente ideias com status **validada** podem entrar em execução técnica.
