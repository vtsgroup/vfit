#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

// ============================================
// cf:deploy — Build, versão, deploy e git push
// Pipeline completo de deploy com versionamento
// ============================================

const { execSync } = require("child_process");
const { readFileSync, existsSync } = require("fs");
const { resolve } = require("path");

// Load .env.local if present (for WHATSAPP_NOTIFY_URL/TOKEN etc.)
const envLocalPath = resolve(__dirname, "..", ".env.local");
if (existsSync(envLocalPath)) {
  readFileSync(envLocalPath, "utf8").split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  });
}

const args = process.argv.slice(2);

// Detectar tipo de bump (primeiro arg que não começa com --)
const bumpType = args.find((a) => !a.startsWith("--")) || "patch";

if (!["patch", "minor", "major"].includes(bumpType)) {
  console.error(`❌ Tipo de versão inválido: ${bumpType}`);
  console.error("   Use: patch | minor | major");
  process.exit(1);
}

const skipWorkers = args.includes("--skip-workers");
const skipPages = args.includes("--skip-pages");
const skipGit = args.includes("--skip-git");
const dryRun = args.includes("--dry-run");
const noBump = args.includes("--no-bump") || args.includes("--skip-bump");
const includeWhatsApp = args.includes("--include-whatsapp") || args.includes("--whatsapp");
const allowNoWhatsApp = args.includes("--allow-no-whatsapp");
const requireWhatsAppNotify = !dryRun && !allowNoWhatsApp;

// Mensagem de deploy (tudo após --msg ou -m)
const msgIndex = args.findIndex((a) => a === "--msg" || a === "-m");
const deployMsg =
  msgIndex !== -1 && args[msgIndex + 1]
    ? args
        .slice(msgIndex + 1)
        .filter((a) => !a.startsWith("--"))
        .join(" ")
    : null;

// ============================================
// Helper
// ============================================
function run(cmd, label, options = {}) {
  console.log(`\n⏳ ${label}...`);
  const startTime = Date.now();
  try {
    if (dryRun && !options.alwaysRun) {
      console.log(`   [dry-run] ${cmd}`);
      return "";
    }
    const result = execSync(cmd, {
      stdio: options.silent ? "pipe" : "inherit",
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
    });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ✅ ${label} (${elapsed}s)`);
    return result || "";
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`   ❌ ${label} falhou (${elapsed}s)`);
    if (options.optional) {
      console.log("   ⚠️  Continuando...");
      return "";
    }
    throw error;
  }
}

function runSilent(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: "pipe" }).trim();
  } catch {
    return "";
  }
}

function runWithInput(cmd, label, input, options = {}) {
  console.log(`\n⏳ ${label}...`);
  const startTime = Date.now();
  try {
    if (dryRun && !options.alwaysRun) {
      console.log(`   [dry-run] ${cmd}`);
      return "";
    }
    const result = execSync(cmd, {
      stdio: options.silent ? "pipe" : "inherit",
      encoding: "utf8",
      input,
      maxBuffer: 50 * 1024 * 1024,
    });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ✅ ${label} (${elapsed}s)`);
    return result || "";
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`   ❌ ${label} falhou (${elapsed}s)`);
    if (options.optional) {
      console.log("   ⚠️  Continuando...");
      return "";
    }
    throw error;
  }
}

function notifyWhatsAppTask(event, payload, options = {}) {
  try {
    const url = process.env.WHATSAPP_NOTIFY_URL;
    const token = process.env.WHATSAPP_NOTIFY_TOKEN;
    const required = Boolean(options.required);
    if (!url || !token) {
      if (required) {
        throw new Error("WHATSAPP_NOTIFY_URL/WHATSAPP_NOTIFY_TOKEN ausentes. Use --allow-no-whatsapp apenas em exceções justificadas.");
      }
      return;
    }

    const body = {
      event,
      actor_label: process.env.WHATSAPP_ACTOR_LABEL || "Deploy Pipeline",
      group_name: process.env.WHATSAPP_GROUP_NAME || "Logs e Docs: VFIT",
      link_url: process.env.WHATSAPP_LINK_URL || "https://iapersonal.app.br",
      ...payload,
    };

    // Use -d with escaped JSON (stdin via --data-binary @- unreliable with execSync pipe)
    const jsonStr = JSON.stringify(body).replace(/'/g, "'\\''");
    const cmd = `curl -sS -X POST "${url}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${jsonStr}'`;
    const label = `[WhatsApp] task-notify (${event})`;
    console.log(`\n⏳ ${label}...`);
    if (dryRun) {
      console.log(`   [dry-run] ${label}`);
      return;
    }
    try {
      const result = execSync(cmd, { stdio: "pipe", encoding: "utf8", timeout: 15000 });
      const parsed = JSON.parse(result);
      if (parsed.success) {
        console.log(`   ✅ ${label} — enviado`);
      } else {
        throw new Error(parsed.error || "resposta sem success:true");
      }
    } catch (curlErr) {
      console.error(`   ❌ ${label} falhou: ${curlErr.message}`);
      if (required) throw curlErr;
      console.log("   ⚠️  Continuando sem WhatsApp...");
    }
  } catch (err) {
    if (options.required) throw new Error(`Falha ao enviar notificação obrigatória no grupo WhatsApp: ${err.message}`);
  }
}

// ============================================
// Pipeline
// ============================================
const startTime = Date.now();

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🚀 VFIT — Deploy Pipeline v2");
console.log(
  `📋 Bump: ${noBump ? 'skip' : bumpType} | Workers: ${!skipWorkers} | Pages: ${!skipPages} | Git: ${!skipGit}`
);
if (deployMsg) console.log(`📝 Msg: ${deployMsg}`);
if (dryRun) console.log("🧪 DRY RUN — nenhuma mudança será feita");
if (includeWhatsApp) console.log("📲 WhatsApp worker: ON");
if (requireWhatsAppNotify) console.log("📣 WhatsApp start/end: OBRIGATÓRIO");
if (allowNoWhatsApp) console.log("⚠️ WhatsApp start/end: bypass habilitado (--allow-no-whatsapp)");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const taskId = `DEPLOY-${Date.now().toString(36).toUpperCase()}`;
const taskStartedAtIso = new Date().toISOString();
notifyWhatsAppTask("start", {
  title: deployMsg ? `Deploy iniciado — ${deployMsg}` : "Deploy iniciado",
  task_id: taskId,
  priority: bumpType,
  action: "reduzir risco operacional e manter ritmo de entrega com rastreabilidade",
  details: "deploy completo com build, publicação e versionamento automáticos",
  started_at: taskStartedAtIso,
}, { required: requireWhatsAppNotify });

let version = "";
let deployStatus = "success";
let failureReason = "";

try {
  // 0. Check git status (avisar se tem mudanças não commitadas)
  const gitStatus = runSilent("git status --porcelain");
  if (gitStatus && !dryRun) {
    console.log("\n📌 Mudanças pendentes detectadas — serão incluídas no commit");
  }

  // 1. Bump versão (single-digit: 0-9 por segmento)
  // 1.0.9 → 1.1.0 (não 1.0.10), 1.9.9 → 2.0.0, 9.9.9 → 10.0.0
  const pkgPath = require("path").join(__dirname, "../package.json");
  const pkgRaw = require("fs").readFileSync(pkgPath, "utf8");
  const pkgData = JSON.parse(pkgRaw);
  let [major, minor, patch] = pkgData.version.split(".").map(Number);

  version = pkgData.version;

  if (!noBump) {
    if (bumpType === "patch") {
      patch++;
      if (patch > 9) { patch = 0; minor++; }
      if (minor > 9) { minor = 0; major++; }
    } else if (bumpType === "minor") {
      minor++;
      patch = 0;
      if (minor > 9) { minor = 0; major++; }
    } else if (bumpType === "major") {
      major++;
      minor = 0;
      patch = 0;
    }

    version = `${major}.${minor}.${patch}`;
    pkgData.version = version;
    require("fs").writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2) + "\n");
    console.log(`\n⏳ Bump versão (${bumpType})...`);
    console.log(`v${version}`);
    console.log(`   ✅ Bump versão (${bumpType})`);
  } else {
    console.log(`\n⏳ Bump versão (skip)...`);
    console.log(`v${version}`);
    console.log(`   ✅ Bump versão (skip)`);
  }

  console.log(`\n📦 Nova versão: v${version}`);

  // 2. Update version files (manifest.json + lib/version.ts)
  run("node scripts/update-version.js", "Atualizar version files");

  // 3. Build
  run("npm run build", "Build Next.js");

  // 4. Deploy Pages (cd /tmp evita que wrangler detecte wrangler.toml do Workers)
  if (!skipPages) {
    const outDir = `${process.cwd()}/out`;
    const pagesCmd = `cd /tmp && CLOUDFLARE_ACCOUNT_ID=b0bf95d0fabb322ac3df37bd84ec0c77 npx wrangler pages deploy "${outDir}" --project-name=vfit --commit-dirty=true --branch=main`;
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        run(pagesCmd, attempt === 1 ? "Deploy Cloudflare Pages" : `Deploy Cloudflare Pages (retry ${attempt}/${maxAttempts})`);
        break;
      } catch (err) {
        const msg = String(err?.message || err || "");
        const isTimeout = msg.toLowerCase().includes('timed out');
        if (!isTimeout || attempt >= maxAttempts) throw err;
        console.log('   ⚠️  Timeout no Pages deploy — tentando novamente em 3s...');
        try { execSync('sleep 3'); } catch {}
      }
    }
  }

  // 5. Deploy Workers
  if (!skipWorkers) {
    run('npx wrangler deploy --env=""', "Deploy Cloudflare Workers", {
      optional: true,
    });
  }

  // 5.1 Deploy WhatsApp worker (optional)
  if (includeWhatsApp) {
    run(
      'npx wrangler deploy --config workers/whatsapp/wrangler.toml',
      'Deploy WhatsApp Worker',
      { optional: true }
    );
  }

  // 6. Git add + commit + push
  if (!skipGit && !dryRun) {
    console.log("\n⏳ Git: add + commit + tag + push...");
    try {
      const commitMsg = deployMsg
        ? `release: v${version} — ${deployMsg}`
        : `release: v${version}`;

      execSync("git add -A", { stdio: "pipe" });
      execSync(`git commit -m "${commitMsg}" --allow-empty`, {
        stdio: "pipe",
      });
      execSync(`git tag -a v${version} -m "Release v${version}"`, {
        stdio: "pipe",
      });
      execSync("git push origin main --follow-tags", {
        stdio: "inherit",
      });
      console.log(`   ✅ Git: commit + tag v${version} + push to main`);
    } catch (err) {
      console.log(`   ⚠️  Git push falhou: ${err.message || "erro desconhecido"}`);
      console.log(
        "   💡 Execute manualmente: git push origin main --follow-tags"
      );
    }
  }
} catch (err) {
  deployStatus = "failed";
  failureReason = String(err?.message || err || "erro desconhecido");
  console.error(`\n❌ Deploy interrompido: ${failureReason}`);
} finally {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const taskEndedAtIso = new Date().toISOString();
  notifyWhatsAppTask("end", {
    title: deployMsg ? `Deploy finalizado — ${deployMsg}` : "Deploy finalizado",
    task_id: taskId,
    deploy_version: version ? `v${version}` : undefined,
    status: deployStatus,
    started_at: taskStartedAtIso,
    ended_at: taskEndedAtIso,
    summary: [
      deployStatus === "success"
        ? `Resultado direto: deploy ${version ? `v${version}` : "concluído"} executado.`
        : `Resultado direto: deploy interrompido (${failureReason.slice(0, 180)}).`,
      "Motivo: manter visibilidade operacional de início e término no grupo.",
      "Vantagem prática: decisão rápida com status consolidado e duração automática.",
      version ? `Versão: v${version}` : "Versão: não gerada",
      skipPages ? "Pages: SKIP" : "Pages: OK",
      skipWorkers ? "Workers: SKIP" : "Workers: OK",
      includeWhatsApp ? "WhatsApp worker: ON" : "WhatsApp worker: OFF",
    ],
  }, { required: requireWhatsAppNotify });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (deployStatus === "success") {
    console.log(`✅ Deploy v${version} completo em ${elapsed}s`);
    console.log(`📦 Versão: ${version}`);
    if (!skipPages) console.log("🌐 https://iapersonal.app.br");
    if (!skipWorkers) console.log("⚡ https://api.iapersonal.app.br");
    if (!skipGit && !dryRun) console.log("📤 Git: pushed to origin/main");
  } else {
    console.log(`❌ Deploy finalizado com falha em ${elapsed}s`);
    console.log(`🧨 Motivo: ${failureReason}`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

if (deployStatus !== "success") {
  process.exit(1);
}
