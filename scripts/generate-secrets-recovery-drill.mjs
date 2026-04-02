#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const inventoryPath = resolve(root, 'docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-INVENTORY.generated.md')
const outputPath = resolve(root, 'docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-RECOVERY-DRILL.generated.md')

const inventory = readFileSync(inventoryPath, 'utf8')
const totalMatch = inventory.match(/Total de itens inventariados:\s*\*\*(\d+)\*\*/) 
const total = totalMatch ? Number(totalMatch[1]) : 0

const now = new Date().toISOString()

const content = `# Secrets Recovery Drill (Gerado automaticamente)

> Gerado em: ${now}
> Base de inventário: SECRETS-INVENTORY.generated.md

## Escopo do drill
- Tipo: tabletop (simulação controlada)
- Volume de secrets no inventário: **${total}**
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
- Comando de referência: \`npm run security:inventory\`
- Arquivos de apoio:
  - SECRETS-ROTATION-RUNBOOK.md
  - SECRETS-ROTATION-LOG.md
`

writeFileSync(outputPath, content, 'utf8')
console.log(`Recovery drill gerado em: ${outputPath}`)
