# Secrets Recovery Drill (Gerado automaticamente)

> Gerado em: 2026-02-20T17:50:34.560Z
> Base de inventário: SECRETS-INVENTORY.generated.md

## Escopo do drill
- Tipo: tabletop (simulação controlada)
- Volume de secrets no inventário: **21**
- Ambientes alvo: production (Cloudflare Workers)

## Cenários cobertos
1. Comprometimento de secret P0 (JWT/Pagamentos/Banco)
2. Expiração inesperada de credencial OAuth
3. Falha de webhook por token inválido

## Checklist de recuperação
- [x] Runbook de rotação referenciado
- [x] Sequência de rollback definida
- [x] Validação pós-rotação definida (health + smoke)
- [x] Registro de incidente e owner responsável definido
- [ ] Exercício com rotação real em ambiente controlado (agendar janela)

## Critérios de sucesso
- MTTR alvo para P0: <= 30 min
- MTTR alvo para P1: <= 60 min
- Sem vazamento de valor secreto em logs/docs

## Evidências
- Comando de referência: `npm run security:inventory`
- Arquivos de apoio:
  - SECRETS-ROTATION-RUNBOOK.md
  - SECRETS-ROTATION-LOG.md
