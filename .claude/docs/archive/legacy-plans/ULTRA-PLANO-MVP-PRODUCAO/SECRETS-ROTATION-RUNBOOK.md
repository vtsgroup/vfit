# Runbook — Rotação de Secrets (Lote 004)

## Objetivo
Executar rotação segura de secrets no Cloudflare Workers com validação, rollback e rastreabilidade.

## Pré-requisitos
- Inventário atualizado: `npm run security:inventory`
- Janela de manutenção aprovada (para P0)
- Owner e backup owner definidos por domínio
- Acesso ao Cloudflare com permissão de secret update

## Sequência padrão de rotação
1. **Preparar**
   - Identificar domínio (`P0`/`P1`/`P2`)
   - Registrar ticket/incidente
   - Confirmar impacto e dependências
2. **Aplicar**
   - Atualizar secret no Cloudflare (`wrangler secret put`)
   - Evitar qualquer registro do valor em shell history/logs
3. **Validar**
   - Health check da API (`/health`)
   - Smoke tests críticos (`auth`, `payments`, `assessments`)
   - Verificar logs por `requestId`
4. **Encerrar**
   - Atualizar log de rotação
   - Registrar evidências e horário
   - Comunicar stakeholders

## Procedimento por criticidade

### P0 (JWT, Payments, DB)
- Janela obrigatória
- Rotação com dupla checagem (owner + backup owner)
- Rollback pronto antes da aplicação
- MTTR alvo: **<= 30 min**

### P1 (OAuth, Turnstile, IA, Comunicação)
- Janela recomendada
- Smoke completo após troca
- MTTR alvo: **<= 60 min**

### P2 (URLs públicas)
- Revisão periódica
- Validar DNS/certificados e impacto no frontend

## Rollback
1. Restaurar secret anterior no Cloudflare
2. Revalidar `/health` e smoke tests
3. Registrar rollback no log de rotação
4. Escalar incidente se falha persistir > 15 min (P0)

## Teste de recuperação (tabletop)
- Executar: `npm run security:drill`
- Evidência gerada em: `SECRETS-RECOVERY-DRILL.generated.md`

## Comandos de referência
- Atualizar secret: `echo "valor" | npx wrangler secret put NOME --env=""`
- Inventário: `npm run security:inventory`
- Drill: `npm run security:drill`

## Critérios de aceite
- [x] Inventário atualizado
- [x] Runbook publicado
- [x] Rollback definido
- [x] Drill de recuperação gerado
- [ ] Rotação real executada e auditada em janela controlada
