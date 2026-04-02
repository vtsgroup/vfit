# S97-R2 — Observabilidade (Sentry + Uptime) Checklist

> Gerado em: 26/02/2026
> Objetivo: fechar S97-S98 com integração operacional completa e evidências versionadas.

## Status rápido

- [x] Baselines operacionais geradas (SLO, load, web-audit, Neon drill)
- [x] Gate de release local 100% verde (S96-R5)
- [x] Sentry integrado (frontend)
- [x] Sentry integrado (workers)
- [ ] Uptime monitor externo configurado (API + frontend)
- [ ] Alertas (email/Slack) configurados

## % atual do MVP funcional

**Estimativa operacional atual: 98%**

### Critério da estimativa

- Núcleo funcional (auth, alunos, treinos, avaliações, pagamentos): concluído
- Qualidade e gate local (smoke + quality + go/no-go): concluído
- Sentry frontend + workers: concluído
- Pendências para 100%: monitoramento externo (uptime + alertas)

## Plano de execução S97-R2

1. Integrar Sentry frontend (captura de erro global + boundaries)
2. Integrar Sentry workers (captura de exceções em fetch/queue/scheduled)
3. Configurar variáveis de ambiente:
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_DSN_WORKER`
   - `SENTRY_ENVIRONMENT`
   - `SENTRY_RELEASE`
4. Criar runbook de uptime externo (BetterStack/UptimeRobot)
5. Atualizar docs finais:
   - `docs/CHANGELOG.md`
   - `docs/CF-OPERATIONS.md`
   - `docs/ULTRA-PLANO-MVP-PRODUCAO/PLANO-FINAL-MASTER-S61-S120-2026-02-26.md`
   - `docs/COPILOT-MEMORY.md`

## Evidências desta etapa

- `docs/ULTRA-PLANO-MVP-PRODUCAO/SLO-SLA-BASELINE.generated.md`
- `docs/ULTRA-PLANO-MVP-PRODUCAO/LOAD-TEST-BASELINE.generated.md`
- `docs/ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-DRILL.generated.md`
- `docs/ULTRA-PLANO-MVP-PRODUCAO/WEB-SECURITY-AUDIT.generated.md`
