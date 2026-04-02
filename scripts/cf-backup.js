#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

// ============================================
// cf:backup — Backup de D1, KV e metadados
// ============================================

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const pkg = require("../package.json");

const BACKUP_DIR = path.join(__dirname, "../backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const backupPath = path.join(BACKUP_DIR, timestamp);

// Recursos Cloudflare
const D1_DB_NAME = "personaliai-exercises"; // legacy CF D1 name
const D1_DB_ID = "988c03d5-bf9a-4394-b65a-adebbe0b87e4";
const KV_NAMESPACES = [
  { name: "KV_CACHE", id: "e7147f8855184a4a8f72307756596df4" },
  { name: "KV_SESSIONS", id: "91d34b6725564de39e8ed891e742e76d" },
  { name: "KV_RATE_LIMIT", id: "d94c62b1e8f248a6bd1ea6a11e18f09c" },
];

console.log(`\n🗂️  Backup VFIT v${pkg.version}`);
console.log(`📅 ${timestamp}`);
console.log(`📁 ${backupPath}\n`);

// Criar diretório
fs.mkdirSync(backupPath, { recursive: true });
fs.mkdirSync(path.join(backupPath, "d1"), { recursive: true });
fs.mkdirSync(path.join(backupPath, "kv"), { recursive: true });
fs.mkdirSync(path.join(backupPath, "migrations"), { recursive: true });

let success = 0;
let failed = 0;

// ============================================
// 1. D1 — Export todas as tabelas
// ============================================
console.log("━━━ D1 Database ━━━");

let d1Tables = [];

try {
  const tablesResult = execSync(
    `npx wrangler d1 execute ${D1_DB_NAME} --remote --command="SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name" --json 2>/dev/null`,
    { encoding: "utf8" }
  );
  const parsedTables = JSON.parse(tablesResult);
  d1Tables = (parsedTables[0]?.results || []).map((row) => row.name);
  console.log(`  ℹ️  Tabelas detectadas: ${d1Tables.length}`);
} catch {
  console.log("  ⚠️  Falha ao listar tabelas D1 remotas");
}

for (const table of d1Tables) {
  try {
    const result = execSync(
      `npx wrangler d1 execute ${D1_DB_NAME} --remote --command="SELECT * FROM ${table}" --json 2>/dev/null`,
      { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
    );

    const parsed = JSON.parse(result);
    const rows = parsed[0]?.results || [];

    fs.writeFileSync(
      path.join(backupPath, "d1", `${table}.json`),
      JSON.stringify(rows, null, 2)
    );
    console.log(`  ✅ ${table} — ${rows.length} registros`);
    success++;
  } catch (err) {
    console.log(`  ❌ ${table} — ${err.message?.slice(0, 80)}`);
    failed++;
  }
}

// D1 — Schema dump
try {
  const schema = execSync(
    `npx wrangler d1 execute ${D1_DB_NAME} --remote --command="SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL" --json 2>/dev/null`,
    { encoding: "utf8" }
  );
  const parsed = JSON.parse(schema);
  const sqls = (parsed[0]?.results || []).map((r) => r.sql).join(";\n\n");
  fs.writeFileSync(path.join(backupPath, "d1", "_schema.sql"), sqls);
  console.log("  ✅ _schema.sql — DDL completo");
  success++;
} catch {
  console.log("  ⚠️  Schema dump falhou (não crítico)");
}

// ============================================
// 2. KV — List keys (dados sensíveis ficam no CF)
// ============================================
console.log("\n━━━ KV Namespaces ━━━");

for (const ns of KV_NAMESPACES) {
  try {
    const result = execSync(
      `npx wrangler kv key list --namespace-id=${ns.id} 2>/dev/null`,
      { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
    );
    const keys = JSON.parse(result);
    fs.writeFileSync(
      path.join(backupPath, "kv", `${ns.name}_keys.json`),
      JSON.stringify(keys, null, 2)
    );
    console.log(`  ✅ ${ns.name} — ${keys.length} chaves`);
    success++;
  } catch (err) {
    console.log(`  ⚠️  ${ns.name} — ${err.message?.slice(0, 80)}`);
    // KV list pode falhar se vazio, não é crítico
  }
}

// ============================================
// 3. Migrations — Cópia local dos SQL files
// ============================================
console.log("\n━━━ Migrations ━━━");

const migrationsDir = path.join(__dirname, "../migrations");
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

const migCount = copyDir(
  migrationsDir,
  path.join(backupPath, "migrations")
);
console.log(`  ✅ ${migCount} arquivos de migration copiados`);

// ============================================
// 4. Metadados
// ============================================
const meta = {
  version: pkg.version,
  timestamp,
  date: new Date().toISOString(),
  d1: { database: D1_DB_NAME, id: D1_DB_ID, tables: d1Tables },
  kv: KV_NAMESPACES.map((ns) => ({ name: ns.name, id: ns.id })),
  stats: { success, failed },
};

fs.writeFileSync(
  path.join(backupPath, "backup-meta.json"),
  JSON.stringify(meta, null, 2)
);

// ============================================
// Resumo
// ============================================
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`✅ Backup completo: ${success} itens`);
if (failed > 0) console.log(`⚠️  Falhas: ${failed} itens`);
console.log(`📁 ${backupPath}`);

// Listar tamanho total
try {
  const size = execSync(`du -sh "${backupPath}" 2>/dev/null`, {
    encoding: "utf8",
  }).trim();
  console.log(`💾 Tamanho: ${size.split("\t")[0]}`);
} catch {}

console.log("");
