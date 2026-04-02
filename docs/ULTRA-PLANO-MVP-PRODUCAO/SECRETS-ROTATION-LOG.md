# Secrets Rotation Log

## Instruções
- Não registrar valores de secrets.
- Registrar apenas metadados da rotação.
- Atualizar este log em toda rotação (planejada ou emergencial).

| Data (UTC) | Secret | Domínio | Criticidade | Tipo (planejada/emergencial) | Owner executor | Resultado | Evidência |
|---|---|---|---|---|---|---|---|
| 2026-02-20 | Baseline iniciado (Lote 004) | Governança | P0 | planejada | Backend Security Owner | runbook + drill publicados | SECRETS-ROTATION-RUNBOOK.md / SECRETS-RECOVERY-DRILL.generated.md |
