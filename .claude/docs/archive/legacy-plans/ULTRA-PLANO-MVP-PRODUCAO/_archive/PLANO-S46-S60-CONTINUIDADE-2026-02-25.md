# Plano S46–S60 — Continuidade sem perda de ritmo

> Data: 25/02/2026  
> Contexto: ciclo S36–S45 em 90% com pendência controlada de smoke final em S45.

## Objetivo
Seguir evolução de produto e execução técnica **sem parar**, deixando o fechamento de smoke do S45 para janela rápida posterior, sem bloquear planejamento e construção da próxima onda.

## Princípio operacional
- Não travar desenvolvimento por credencial temporária.
- Manter rastreabilidade `start/end` no grupo para cada etapa.
- Fechamento formal do S45 ocorre assim que tokens estiverem disponíveis.

---

## Trilhas da onda S46–S60

### Progresso da onda
- **Status atual:** **5/15 = 33%**
- **Sprint atual:** **S51 (em andamento)**
- **Posição operacional:** Trilha A (S46–S50) concluída em execução contínua com start/end no grupo.

## Trilha A — Execução guiada premium (S46–S50)
- S46: modelagem final do `WorkoutStoriesPlayer` (estados, eventos, replay).
- S47: implementação de overlay full-screen (`z-index: 99999999`) + acessibilidade.
- S48: motor de transição automática exercício → descanso → próximo.
- S49: componente de setup do próximo aparelho (imagem + instrução objetiva).
- S50: telemetria da sessão guiada (abandono, replay, conclusão).

## Trilha B — Economia XP robusta (S51–S55)
- S51: consolidar contratos de crédito/débito e enum de `event_type`.
- S52: limites diários por evento e anti-duplicidade reforçada.
- S53: carteira XP no dashboard (saldo + histórico simplificado).
- S54: metas diárias e streak com feedback visual.
- S55: regras de expiração/queima controlada da moeda interna.

## Trilha C — Qualidade operacional e release (S56–S60)
- S56: testes direcionados de fluxo guiado e regressão crítica.
- S57: hardening de latência/performance do player e mídia.
- S58: documentação de governança da economia XP (produto/compliance).
- S59: pré-go/no-go da onda S46–S60 (sem deploy final).
- S60: gate final completo (incluindo smoke válido) + decisão operacional.

## Fechamento contínuo S46 → S50 (25/02/2026)

- Execução sem pausas com comunicação obrigatória `start/end` no grupo em todas as sprints.

### Status por sprint
- **S46 (modelagem do player stories):** ✅ concluída
- **S47 (overlay full-screen + acessibilidade):** ✅ concluída
- **S48 (motor de transição automática):** ✅ concluída
- **S49 (setup do próximo aparelho):** ✅ concluída
- **S50 (telemetria da sessão guiada):** ✅ concluída

## Kickoff S51 — contratos de crédito/débito XP (25/02/2026)

- Sprint iniciada imediatamente após S50.
- Meta: consolidar `event_type`, regras de crédito/débito e padronização da economia XP para sequência S52–S55.

**Status S51:** 🔄 em andamento

---

## Critérios de aceite por sprint
- Escopo sprint documentado e executável.
- Validações técnicas formais ficam diferidas para checkpoint final único.
- Mensagens obrigatórias no grupo (`start/end`) com resultado objetivo.
- Atualização de progresso no plano e no changelog.

## Checkpoint final único (depois de tudo pronto)
- `npm run lint`
- `npm run type-check`
- `npm run type-check:workers`
- `npm test`
- `npm run smoke:auth:local` (com token válido)
- `npm run quality:ci`
- `npm run ops:go-no-go`

> Diretriz desta onda: iniciar e não parar na implementação; validar tudo no fechamento.

---

## Pendência conhecida e estratégia
- Pendência atual: smoke S45 sem tokens válidos na sessão.
- Estratégia: seguir planejamento/execução da nova onda e reservar uma janela curta para:
  1) repor tokens;
  2) rodar checkpoint final completo;
  3) fechar S45 e consolidar S46–S60 formalmente.

---

## Prompt curto para retomada imediata
"Continuar pela S46 sem interromper cadência. Priorizar stories full-screen, transição automática treino/descanso/próximo e reforço da economia XP. Manter start/end no grupo a cada sprint e atualizar docs/changelog continuamente. Fechar S45 assim que tokens de smoke estiverem disponíveis."