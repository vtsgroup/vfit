# Neon Backup/Restore Drill (Gerado automaticamente)

> Gerado em: 2026-02-26T14:15:40.714Z
> Drill ID: NEON-DRILL-20260226-141540
> Escopo: PostgreSQL Neon (backup lógico + restore controlado)
> Tipo: tabletop com comandos executáveis
> Último backup Cloudflare identificado: backups/2026-02-20T18-23-23

## Objetivo do lote 010
- Formalizar procedimento de backup/restore com critérios de aceite operacionais.
- Definir alvo de continuidade com RTO e RPO mensuráveis.
- Produzir evidência versionada para auditoria de recuperação.

## Metas de continuidade (baseline)
- RTO alvo: <= 60 minutos
- RPO alvo: <= 15 minutos
- Janela recomendada para drill real: baixa utilização + freeze de escrita.

## Pré-check obrigatório
- [ ] `NEON_DATABASE_URL` disponível no ambiente de execução.
- [ ] Ferramentas instaladas: `pg_dump`, `pg_restore`, `psql`.
- [ ] Banco de restauração isolado (staging/sandbox) provisionado.
- [ ] Responsáveis de operação e aprovação definidos.

## Passo 1 — Backup lógico (snapshot)
```bash
TS=$(date +%Y%m%d-%H%M%S)
mkdir -p backups/neon/$TS
pg_dump "$NEON_DATABASE_URL" --format=custom --no-owner --no-privileges --file="backups/neon/$TS/neon-backup.dump"
```

## Passo 2 — Restore controlado (ambiente isolado)
```bash
export NEON_RESTORE_DATABASE_URL="<neon-restore-url>"
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$NEON_RESTORE_DATABASE_URL" "backups/neon/$TS/neon-backup.dump"
```

## Passo 3 — Validação pós-restore
```bash
psql "$NEON_RESTORE_DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
psql "$NEON_RESTORE_DATABASE_URL" -c "SELECT COUNT(*) FROM assessments;"
psql "$NEON_RESTORE_DATABASE_URL" -c "SELECT COUNT(*) FROM payments;"
```

## Critérios de aceite
- [ ] Restore concluído sem erro crítico.
- [ ] Contagens mínimas de tabelas-chave válidas.
- [ ] API health e login validados contra ambiente restaurado.
- [ ] Tempo total medido e registrado (RTO real).
- [ ] Diferença temporal do backup registrada (RPO real).

## Evidência operacional (preencher ao executar drill real)
- Início do restore: 2026-02-26T14:15:40.714Z
- Fim do restore: <preencher>
- Duração (RTO real): <preencher>
- Ponto de backup utilizado (RPO real): <preencher>
- Resultado final: <pass/fail>
- Observações: <preencher>
