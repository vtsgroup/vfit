// gen-assetlinks.js
// Extrai SHA-256 do keystore e gera assetlinks.json em 2 destinos:
//   1. twa/assetlinks/assetlinks.json
//   2. ../../public/.well-known/assetlinks.json  (servido como arquivo estático)

import { execSync } from "child_process";
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYSTORE = join(__dirname, "../keystore/vfit-release.jks");
const ENV_FILE = join(__dirname, "../keystore/.env");
const OUT_TWA = join(__dirname, "../assetlinks");
const OUT_PUBLIC = join(__dirname, "../../public/.well-known");

// ─── Carregar senha do keystore ───────────────────────────────────
if (!existsSync(ENV_FILE)) {
  console.error("❌ Arquivo keystore/.env não encontrado.");
  console.error("   Execute: npm run setup");
  process.exit(1);
}

const envContent = readFileSync(ENV_FILE, "utf8");
const passMatch = envContent.match(/^KEYSTORE_PASS=(.+)$/m);
if (!passMatch) {
  console.error("❌ KEYSTORE_PASS não encontrado em keystore/.env");
  process.exit(1);
}
const KEYSTORE_PASS = passMatch[1].trim();

// ─── Verificar keystore ───────────────────────────────────────────
if (!existsSync(KEYSTORE)) {
  console.error(`❌ Keystore não encontrado: ${KEYSTORE}`);
  console.error("   Execute: npm run setup");
  process.exit(1);
}

console.log("\n🔑 Extraindo SHA-256 do keystore...");

let output;
try {
  output = execSync(
    `keytool -list -v -keystore "${KEYSTORE}" -alias vfit -storepass "${KEYSTORE_PASS}"`,
    { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
  );
} catch (e) {
  console.error("❌ Erro ao ler keystore. Senha incorreta?");
  console.error(e.message);
  process.exit(1);
}

const sha256Match = output.match(/SHA256:\s*([A-F0-9:]+)/i);
if (!sha256Match) {
  console.error("❌ SHA-256 não encontrado no output do keytool.");
  process.exit(1);
}

const sha256 = sha256Match[1].toUpperCase();
console.log(`  Upload Key SHA-256: ${sha256}`);

// Google Play App Signing Key SHA-256 (obtido do Play Console → Integridade do app)
const GOOGLE_APP_SIGNING_SHA256 = "43:50:06:06:7A:2A:9B:66:58:4E:D6:F1:C0:9B:03:73:F1:B4:30:54:EB:13:AE:10:75:1E:B0:92:01:95:35:F1";
console.log(`  App Signing SHA-256: ${GOOGLE_APP_SIGNING_SHA256}`);

// ─── Gerar assetlinks.json ────────────────────────────────────────
const assetLinks = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "br.app.vfit",
      sha256_cert_fingerprints: [GOOGLE_APP_SIGNING_SHA256, sha256],
    },
  },
];

const json = JSON.stringify(assetLinks, null, 2);

// Destino 1: twa/assetlinks/
mkdirSync(OUT_TWA, { recursive: true });
writeFileSync(join(OUT_TWA, "assetlinks.json"), json);

// Destino 2: public/.well-known/
mkdirSync(OUT_PUBLIC, { recursive: true });
writeFileSync(join(OUT_PUBLIC, "assetlinks.json"), json);

console.log("\n  ✅ assetlinks.json gerado!");
console.log(`     → twa/assetlinks/assetlinks.json`);
console.log(`     → public/.well-known/assetlinks.json`);
console.log("\n📋 Próximo passo:");
console.log("   cd .. && npm run cf:deploy  (para ativar assetlinks em produção)");
console.log(
  "   Verificar: curl https://iapersonal.app.br/.well-known/assetlinks.json\n"
);
