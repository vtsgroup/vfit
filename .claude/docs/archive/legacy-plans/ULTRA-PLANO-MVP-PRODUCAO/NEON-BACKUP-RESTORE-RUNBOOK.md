# Neon Backup/Restore Runbook

> Lote 010 — Continuidade de dados (PostgreSQL Neon)
> Atualizado em 20/02/2026

## Escopo
- Backup lógico do PostgreSQL Neon.
- Restore controlado em ambiente isolado.
- Validação funcional mínima pós-restore.

## Responsáveis
- Owner: Backend Operations
- Backup owner: SRE/Infra
- Aprovação de execução: Tech Lead

## Política de execução
- Frequência mínima recomendada de drill: mensal.
- Sempre executar em janela de baixo tráfego.
- Nunca restaurar sobre produção sem janela aprovada.

## Checklist operacional
- [ ] `NEON_DATABASE_URL` disponível
- [ ] `NEON_RESTORE_DATABASE_URL` provisionada (staging)
- [ ] Ferramentas `pg_dump`, `pg_restore`, `psql` instaladas
- [ ] Snapshot Cloudflare (`npm run cf:backup`) executado antes do drill
- [ ] Evidência registrada em `NEON-BACKUP-RESTORE-DRILL.generated.md`
- [ ] Registro em `NEON-BACKUP-RESTORE-LOG.md`

## Procedimento de alto nível
1. Gerar backup lógico (`pg_dump`) com timestamp.
2. Restaurar em banco isolado (`pg_restore --clean --if-exists`).
3. Validar tabelas críticas (`users`, `assessments`, `payments`).
4. Validar endpoints críticos (`/health`, `auth/login`) no ambiente restaurado.
5. Registrar RTO e RPO reais.

## Rollback do drill
- Se restore falhar: descartar banco de restore e reprovisionar vazio.
- Não aplicar mudanças no banco de produção durante drill.
- Reexecutar com novo snapshot e registrar falha no log operacional.
