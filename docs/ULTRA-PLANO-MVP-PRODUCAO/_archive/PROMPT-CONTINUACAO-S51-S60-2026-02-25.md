# Prompt de Continuação — S51 até S60 (MVP)

Use este prompt na próxima sessão para retomar exatamente do ponto atual.

---

Você está no projeto VFIT. Continue a execução contínua da onda S46–S60 a partir da **S51**.

## Contexto atual
- Trilha A (S46–S50) concluída.
- S51 iniciada.
- S45 do ciclo anterior está pendente apenas de smoke autenticado por indisponibilidade temporária de tokens.

## Objetivo imediato
Concluir S51–S60 sem perder ritmo, mantendo documentação e mensagens operacionais por sprint.

## Ordem de execução
1. S51 — consolidar contratos de crédito/débito XP (`event_type`, regras de emissão/consumo).
2. S52 — limites diários por evento + anti-duplicidade reforçada.
3. S53 — carteira XP no dashboard (saldo + histórico simples).
4. S54 — metas diárias e streak com feedback visual.
5. S55 — expiração/queima controlada de moeda interna.
6. S56 — testes direcionados de fluxo guiado e regressão crítica.
7. S57 — hardening de latência/performance do player e mídia.
8. S58 — documentação de governança da economia XP (produto/compliance).
9. S59 — pré-go/no-go da onda S46–S60.
10. S60 — gate final completo + decisão operacional.

## Regras operacionais obrigatórias
- Enviar `start` e `end` no grupo para cada sprint.
- Atualizar docs a cada fechamento:
  - `docs/ULTRA-PLANO-MVP-PRODUCAO/PLANO-S46-S60-CONTINUIDADE-2026-02-25.md`
  - `docs/CHANGELOG.md`

## Estratégia de validação (modo contínuo)
- Durante sprints: foco em implementação e documentação.
- No fechamento final (checkpoint único), executar:
  1) `npm run lint`
  2) `npm run type-check`
  3) `npm run type-check:workers`
  4) `npm test`
  5) `npm run smoke:auth:local` (com token válido)
  6) `npm run quality:ci`
  7) `npm run ops:go-no-go`

## Pendência conhecida
- S45 ainda precisa de `smoke:auth:local` com token válido para fechamento formal do ciclo anterior.
- Assim que token existir, executar smoke e registrar fechamento em docs/changelog e grupo.

---

Saída esperada ao final de cada sprint:
- status da sprint concluída;
- próxima sprint iniciada;
- percentual da onda atualizado;
- links dos arquivos atualizados.
