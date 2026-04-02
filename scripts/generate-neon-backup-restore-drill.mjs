#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const now = new Date()
const generatedAt = now.toISOString()
const workspaceRoot = process.cwd()
const backupsDir = resolve(workspaceRoot, 'backups')
const outputPath = resolve(
  workspaceRoot,
  'docs/ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-DRILL.generated.md'
)

function getLatestBackupFolder() {
  if (!existsSync(backupsDir)) return null

  const folders = readdirSync(backupsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a))

  return folders.length > 0 ? folders[0] : null
}

function buildMarkdown() {
  const latestBackup = getLatestBackupFolder()
  const latestBackupDisplay = latestBackup
    ? `backups/${latestBackup}`
    : 'não identificado (executar `npm run cf:backup`)'

  const drillId = `NEON-DRILL-${generatedAt.slice(0, 10).replace(/-/g, '')}-${generatedAt.slice(11, 19).replace(/:/g, '')}`

  return [
    '# Neon Backup/Restore Drill (Gerado automaticamente)',
    '',
    `> Gerado em: ${generatedAt}`,
    `> Drill ID: ${drillId}`,
    '> Escopo: PostgreSQL Neon (backup lógico + restore controlado)',
    '> Tipo: tabletop com comandos executáveis',
    `> Último backup Cloudflare identificado: ${latestBackupDisplay}`,
    '',
    '## Objetivo do lote 010',
    '- Formalizar procedimento de backup/restore com critérios de aceite operacionais.',
    '- Definir alvo de continuidade com RTO e RPO mensuráveis.',
    '- Produzir evidência versionada para auditoria de recuperação.',
    '',
    '## Metas de continuidade (baseline)',
    '- RTO alvo: <= 60 minutos',
    '- RPO alvo: <= 15 minutos',
    '- Janela recomendada para drill real: baixa utilização + freeze de escrita.',
    '',
    '## Pré-check obrigatório',
    '- [ ] `NEON_DATABASE_URL` disponível no ambiente de execução.',
    '- [ ] Ferramentas instaladas: `pg_dump`, `pg_restore`, `psql`.',
    '- [ ] Banco de restauração isolado (staging/sandbox) provisionado.',
    '- [ ] Responsáveis de operação e aprovação definidos.',
    '',
    '## Passo 1 — Backup lógico (snapshot)',
    '```bash',
    'TS=$(date +%Y%m%d-%H%M%S)',
    'mkdir -p backups/neon/$TS',
    'pg_dump "$NEON_DATABASE_URL" --format=custom --no-owner --no-privileges --file="backups/neon/$TS/neon-backup.dump"',
    '```',
    '',
    '## Passo 2 — Restore controlado (ambiente isolado)',
    '```bash',
    'export NEON_RESTORE_DATABASE_URL="<neon-restore-url>"',
    'pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$NEON_RESTORE_DATABASE_URL" "backups/neon/$TS/neon-backup.dump"',
    '```',
    '',
    '## Passo 3 — Validação pós-restore',
    '```bash',
    'psql "$NEON_RESTORE_DATABASE_URL" -c "SELECT COUNT(*) FROM users;"',
    'psql "$NEON_RESTORE_DATABASE_URL" -c "SELECT COUNT(*) FROM assessments;"',
    'psql "$NEON_RESTORE_DATABASE_URL" -c "SELECT COUNT(*) FROM payments;"',
    '```',
    '',
    '## Critérios de aceite',
    '- [ ] Restore concluído sem erro crítico.',
    '- [ ] Contagens mínimas de tabelas-chave válidas.',
    '- [ ] API health e login validados contra ambiente restaurado.',
    '- [ ] Tempo total medido e registrado (RTO real).',
    '- [ ] Diferença temporal do backup registrada (RPO real).',
    '',
    '## Evidência operacional (preencher ao executar drill real)',
    `- Início do restore: ${generatedAt}`,
    '- Fim do restore: <preencher>',
    '- Duração (RTO real): <preencher>',
    '- Ponto de backup utilizado (RPO real): <preencher>',
    '- Resultado final: <pass/fail>',
    '- Observações: <preencher>',
    '',
  ].join('\n')
}

mkdirSync(resolve(workspaceRoot, 'docs/ULTRA-PLANO-MVP-PRODUCAO'), {
  recursive: true,
})

writeFileSync(outputPath, buildMarkdown(), 'utf8')
console.log(`Neon backup/restore drill gerado em: ${outputPath}`)
