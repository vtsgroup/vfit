# Prompt de Continuação — Ciclo S36+ (retomada rápida)

Use este prompt na próxima sessão para continuar sem perder contexto:

---

Você está no projeto VFIT, com o lote 61–100 concluído (20/20). Continue imediatamente o ciclo **S36+** seguindo o plano em [docs/ULTRA-PLANO-MVP-PRODUCAO/KICKOFF-S36-PLANO-COMPLETO-2026-02-25.md](docs/ULTRA-PLANO-MVP-PRODUCAO/KICKOFF-S36-PLANO-COMPLETO-2026-02-25.md).

## Regras obrigatórias
- Enviar mensagem `start` no grupo ao iniciar cada sprint.
- Enviar mensagem `end` no grupo ao finalizar cada sprint (com resultado, motivo e vantagem prática).
- Atualizar progresso percentual no plano a cada fechamento.
- Atualizar [docs/CHANGELOG.md](docs/CHANGELOG.md) no mesmo ciclo.
- Rodar gate técnico mínimo por sprint:
  - `npm run lint`
  - `npm run type-check`
  - `npm run type-check:workers`
  - `npm test`

### Fast-track permitido (sem tokens de smoke no momento)
- Em S37–S44, se tokens de smoke estiverem indisponíveis:
  - executar apenas `lint`, `type-check`, `type-check:workers`, `test` por sprint;
  - registrar no grupo e nos docs que a sprint rodou em fast-track sem smoke.
- Em S45, `npm run smoke:auth:local` volta a ser obrigatório para liberar go/no-go/deploy.

## Ordem de execução inicial
1. S36 — schema + contratos de mídia/XP.
2. S37 — CRUD de vídeo por exercício.
3. S38 — player stories fullscreen (`z-index: 99999999`).
4. S39 — fluxo automático exercício→descanso→próximo.
5. S40 — setup do próximo aparelho com imagem e instrução.

## Restrições do produto
- Todo exercício deve possuir vídeo para publicação final.
- Replay de vídeo do exercício atual deve estar sempre disponível.
- Após término do exercício, descanso inicia automaticamente.
- Próximo exercício deve mostrar preview visual + setup.
- XP deve ser ledger auditável, idempotente e com limites anti-fraude.

## Nota de compliance
- Tratar “crypto legalizada” em duas fases:
  - Fase 1: moeda interna (off-chain) auditável;
  - Fase 2: tokenização opcional apenas com aprovação jurídica formal.

## Formato de reporte esperado ao final de cada sprint
- `%` do pacote atual.
- Sprint concluída e próxima sprint iniciada.
- Resultado de gate (`pass/failed/skipped`).
- Link dos docs atualizados.

---

Objetivo final: entregar experiência premium de treino guiado com mídia completa, gamificação diária robusta e execução operacional previsível.
