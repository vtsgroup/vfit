#!/usr/bin/env node

/**
 * sync-ai-docs.mjs
 * 
 * Gera .github/copilot-instructions.md a partir dos arquivos em .claude/docs/
 * 
 * Uso:
 *   node scripts/sync-ai-docs.mjs          # gera o arquivo
 *   node scripts/sync-ai-docs.mjs --check  # verifica se está em sync (CI)
 * 
 * Ordem dos arquivos no output:
 *   1. COST-OPTIMIZATION.md  (Copilot-specific, vai primeiro)
 *   2. RULES.md
 *   3. STACK.md
 *   4. CONVENTIONS.md
 *   5. DEPLOY.md
 *   6. DESIGN-SYSTEM.md
 *   7. BACKEND.md (includes backend map)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS_DIR = join(ROOT, '.claude', 'docs');
const OUTPUT = join(ROOT, '.github', 'copilot-instructions.md');

// Ordem dos arquivos a incluir (MIGRATION-CONTEXT e PLAN-* são excluídos)
const FILES_ORDER = [
  'COST-OPTIMIZATION.md',
  'RULES.md',
  'STACK.md',
  'CONVENTIONS.md',
  'DEPLOY.md',
  'DESIGN-SYSTEM.md',
];

const HEADER = `# VFIT — Copilot Instructions

> **AUTO-GENERATED** — NÃO editar diretamente.
> Fonte: \`.claude/docs/*.md\` · Script: \`scripts/sync-ai-docs.mjs\`
> Para editar, modifique os arquivos em \`.claude/docs/\` e execute:
> \`\`\`bash
> node scripts/sync-ai-docs.mjs
> \`\`\`

---

`;

function generateContent() {
  const sections = [];

  for (const file of FILES_ORDER) {
    const filePath = join(DOCS_DIR, file);
    if (!existsSync(filePath)) {
      console.warn(`⚠️  Arquivo não encontrado: .claude/docs/${file} — pulando`);
      continue;
    }
    const content = readFileSync(filePath, 'utf-8').trim();
    sections.push(content);
  }

  return HEADER + sections.join('\n\n---\n\n') + '\n';
}

function getHash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 12);
}

// Main
const isCheck = process.argv.includes('--check');
const generated = generateContent();

if (isCheck) {
  if (!existsSync(OUTPUT)) {
    console.error('❌ .github/copilot-instructions.md não existe. Execute: node scripts/sync-ai-docs.mjs');
    process.exit(1);
  }
  const current = readFileSync(OUTPUT, 'utf-8');
  if (getHash(current) !== getHash(generated)) {
    console.error('❌ .github/copilot-instructions.md está desatualizado. Execute: node scripts/sync-ai-docs.mjs');
    process.exit(1);
  }
  console.log('✅ .github/copilot-instructions.md está em sync com .claude/docs/');
  process.exit(0);
}

writeFileSync(OUTPUT, generated, 'utf-8');
const lineCount = generated.split('\n').length;
console.log(`✅ .github/copilot-instructions.md gerado (${lineCount} linhas, hash: ${getHash(generated)})`);
console.log(`   Fonte: ${FILES_ORDER.length} arquivos de .claude/docs/`);
