# 📱 VFIT — TWA (Trusted Web Activity) · Plano Completo

> Pasta **isolada** do projeto principal. Empacota o PWA de `iapersonal.app.br`
> para a Google Play Store via Trusted Web Activity.
> **Zero mudança de lógica de negócio. Zero fork de UI.**

---

## 📋 Índice

1. [O que é TWA e por que não é WebView](#1-o-que-é-twa-e-por-que-não-é-webview)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Setup Inicial (único)](#4-setup-inicial-único)
5. [Arquivos de Configuração](#5-arquivos-de-configuração)
6. [Scripts](#6-scripts)
7. [Ajustes no Next.js (projeto principal)](#7-ajustes-no-nextjs-projeto-principal)
8. [Build Completo](#8-build-completo)
9. [Testes Locais](#9-testes-locais)
10. [Publicar na Play Store](#10-publicar-na-play-store)
11. [Push Notifications (OneSignal)](#11-push-notifications-onesignal)
12. [Localização (Geolocation)](#12-localização-geolocation)
13. [In-App Review (5 estrelas)](#13-in-app-review-5-estrelas)
14. [Manutenção e Versões](#14-manutenção-e-versões)
15. [Regras Críticas do TWA](#15-regras-críticas-do-twa)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. O que é TWA e por que não é WebView

| | WebView comum | TWA (Trusted Web Activity) |
|---|---|---|
| Engine | WebView Android (limitado) | Chrome real (Blink engine) |
| Cookies/Storage | Isolado, limitado | Compartilhado com Chrome |
| Service Worker | Não funciona | ✅ Funciona completo |
| Push Notifications | ❌ | ✅ Nativo via Web Push |
| OAuth / Login social | Bloqueado | ✅ Funciona |
| Play Store approval | Rejeitado | ✅ Aprovado |
| Barra de endereço | Sempre visível | Oculta (fullscreen) |
| Performance | Ruim | Igual ao Chrome mobile |

O Chrome dentro do TWA é o mesmo que o usuário usa normalmente.
O `assetlinks.json` é o que **prova** ao Android que o domínio pertence ao app
— sem ele o Chrome mostra a barra de endereço (quebra a "ilusão" nativa).

---

## 2. Pré-requisitos

### 2.1 Software (macOS)

```bash
# Java 17 (obrigatório para Bubblewrap/Gradle)
brew install openjdk@17
echo 'export JAVA_HOME=$(brew --prefix openjdk@17)' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
java -version  # deve mostrar openjdk 17

# Android Studio (instala SDK automaticamente)
brew install --cask android-studio
# Abra o Android Studio → More Actions → SDK Manager
# Instale: Android 14 (API 34) + Android SDK Build-Tools 34

# Variável ANDROID_HOME
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH="$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Bubblewrap CLI (ferramenta oficial Google para TWA)
npm install -g @bubblewrap/cli

# Verificar tudo
bubblewrap doctor
```

### 2.2 Conta Play Store

- Acesse: https://play.google.com/console
- Taxa única: **USD 25**
- Crie a conta antes de começar (aprovação pode levar 24-48h)

---

## 3. Estrutura de Pastas

```
twa/                                    ← raiz do projeto TWA (isolada do monorepo)
│
├── README.md                           ← este arquivo
├── package.json                        ← scripts locais + dependência sharp
├── .env.example                        ← variáveis necessárias
├── .gitignore                          ← ignora keystore, .env, dist, android/
│
├── config/
│   └── twa-manifest.json               ← configuração principal Bubblewrap
│
├── icons/
│   ├── source/
│   │   └── icon-1024.png               ← VOCÊ COLOCA AQUI (1024×1024, sem padding)
│   └── generated/                      ← auto-gerado pelo script generate-icons.js
│       ├── icon-mdpi-48.png
│       ├── icon-hdpi-72.png
│       ├── icon-xhdpi-96.png
│       ├── icon-xxhdpi-144.png
│       ├── icon-xxxhdpi-192.png
│       ├── splash-2048.png
│       └── feature-graphic-1024x500.png
│
├── scripts/
│   ├── setup.sh                        ← setup inicial: keystore + deps
│   ├── generate-icons.js               ← gera todos os ícones via Sharp
│   ├── gen-assetlinks.js               ← extrai SHA-256 + gera assetlinks.json
│   ├── build.sh                        ← pipeline completo: icons → links → AAB
│   └── validate.sh                     ← valida PWA, assetlinks, bubblewrap
│
├── keystore/
│   ├── .gitignore                      ← ignora *.jks e .env
│   ├── .env                            ← KEYSTORE_PASS (não vai pro git)
│   ├── .env.example                    ← template público
│   └── vfit-release.jks          ← gerado pelo setup.sh (não vai pro git)
│
├── assetlinks/
│   └── assetlinks.json                 ← Digital Asset Links (copiado para public/)
│
├── android/                            ← gerado pelo bubblewrap init (não vai pro git)
│
└── dist/                               ← AAB/APK gerados (não vai pro git)
    └── vfit-release-YYYYMMDD.aab
```

---

## 4. Setup Inicial (único)

Execute **uma única vez** para configurar o ambiente:

```bash
# A partir da raiz do monorepo:
mkdir twa
cd twa

# Crie todos os arquivos descritos abaixo
# Depois execute:
npm install
npm run setup
```

Após o setup:

```
twa/keystore/vfit-release.jks  ← FAÇA BACKUP IMEDIATAMENTE
twa/keystore/.env                    ← contém KEYSTORE_PASS
```

> ⚠️ **CRÍTICO**: Sem o `.jks` + senha, você **nunca mais** poderá atualizar o app na Play Store.
> Guarde o arquivo e a senha em 1Password / Bitwarden / cofre seguro.

---

## 5. Arquivos de Configuração

### 5.1 `twa/package.json`

```json
{
  "name": "vfit-twa",
  "version": "1.0.0",
  "description": "TWA build pipeline — VFIT (iapersonal.app.br)",
  "private": true,
  "type": "module",
  "scripts": {
    "setup": "bash scripts/setup.sh",
    "icons": "node scripts/generate-icons.js",
    "assetlinks": "node scripts/gen-assetlinks.js",
    "init": "bubblewrap init --manifest=https://iapersonal.app.br/manifest.json",
    "build": "bash scripts/build.sh",
    "build:debug": "bubblewrap build --skipSigning",
    "validate": "bash scripts/validate.sh",
    "update": "bubblewrap update",
    "doctor": "bubblewrap doctor"
  },
  "dependencies": {
    "sharp": "^0.33.5"
  },
  "devDependencies": {
    "dotenv": "^16.4.5"
  }
}
```

---

### 5.2 `twa/.gitignore`

```gitignore
# Android project (gerado pelo Bubblewrap)
android/

# Keystore e senhas
keystore/*.jks
keystore/*.keystore
keystore/.env

# Build outputs
dist/
*.apk
*.aab
*.zip

# Node
node_modules/

# Ícones gerados (regeneráveis)
icons/generated/

# Env
.env
.env.local
```

---

### 5.3 `twa/keystore/.gitignore`

```gitignore
*.jks
*.keystore
.env
```

---

### 5.4 `twa/keystore/.env.example`

```bash
# Copie para .env e preencha
KEYSTORE_PASS=sua_senha_super_segura_aqui
```

---

### 5.5 `twa/.env.example`

```bash
# Senha do keystore (obrigatória para build de produção)
KEYSTORE_PASS=

# Opcional: para validação automática de assetlinks
APP_DOMAIN=iapersonal.app.br
APP_PACKAGE=br.app.personalia
```

---

### 5.6 `twa/config/twa-manifest.json`

> **⚠️ Cores**: devem ser consistentes com `public/manifest.json` do projeto (`#09090B`).

```json
{
  "packageId": "br.app.personalia",
  "host": "iapersonal.app.br",
  "name": "VFIT",
  "launcherName": "VFIT",
  "display": "standalone",
  "orientation": "natural",
  "themeColor": "#09090B",
  "themeColorDark": "#09090B",
  "navigationColor": "#09090B",
  "navigationColorDark": "#09090B",
  "backgroundColor": "#09090B",
  "enableNotifications": true,
  "startUrl": "/dashboard?utm_source=twa&utm_medium=android&utm_campaign=playstore",
  "iconUrl": "https://iapersonal.app.br/icons/icon-512.png",
  "maskableIconUrl": "https://iapersonal.app.br/icons/icon-512-maskable.png",
  "monochromeIconUrl": "https://iapersonal.app.br/icons/icon-96-monochrome.png",
  "shortcuts": [
    {
      "name": "Meus Treinos",
      "short_name": "Treinos",
      "url": "/dashboard/workouts?utm_source=twa_shortcut",
      "icons": [
        {
          "src": "https://iapersonal.app.br/icons/icon-96.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Meus Alunos",
      "short_name": "Alunos",
      "url": "/dashboard/students?utm_source=twa_shortcut",
      "icons": [
        {
          "src": "https://iapersonal.app.br/icons/icon-96.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "signingKey": {
    "path": "../keystore/vfit-release.jks",
    "alias": "vfit"
  },
  "appVersionCode": 1,
  "appVersionName": "1.0.0",
  "minSdkVersion": 24,
  "targetSdkVersion": 34,
  "isChromeOSOnly": false,
  "isMetaQuest": false,
  "fullScopeUrl": "https://iapersonal.app.br/",
  "fingerprints": [],
  "additionalTrustedOrigins": [
    "https://personal-ia-prod.pages.dev"
  ],
  "retainedBundles": [],
  "features": {
    "locationDelegation": {
      "enabled": true
    },
    "playBilling": {
      "enabled": false
    }
  },
  "alphaDependencies": {
    "enabled": false
  },
  "serviceAccountJsonFile": "",
  "shareTarget": null,
  "webManifestUrl": "https://iapersonal.app.br/manifest.json"
}
```

> **Notas:**
> - `additionalTrustedOrigins`: inclui o fallback do Cloudflare Pages
> - `appVersionCode`: incrementar a cada novo AAB enviado para Play Store
> - `appVersionName`: seguir semver do projeto principal
> - `shortcuts`: atalhos no ícone (long press no Android) — apontam para `/dashboard/*`
> - `webManifestUrl`: usa `manifest.json` (conforme `public/manifest.json` existente)

---

## 6. Scripts

### 6.1 `twa/scripts/setup.sh`

```bash
#!/bin/bash
# setup.sh — Configura ambiente TWA pela primeira vez
# Uso: npm run setup

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEYSTORE_DIR="$DIR/keystore"
KEYSTORE_FILE="$KEYSTORE_DIR/vfit-release.jks"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   VFIT — TWA Setup Inicial        ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ─── Verificar Java ───────────────────────────────────────────────
echo "🔍 Verificando pré-requisitos..."

if ! command -v java &>/dev/null; then
  echo "❌ Java não encontrado."
  echo "   Execute: brew install openjdk@17"
  echo "   Depois adicione ao .zshrc:"
  echo '   export JAVA_HOME=$(brew --prefix openjdk@17)'
  exit 1
fi
JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VER" -lt 17 ]; then
  echo "❌ Java $JAVA_VER encontrado. Mínimo: Java 17."
  exit 1
fi
echo "  ✅ Java: $(java -version 2>&1 | head -1)"

# ─── Verificar keytool ────────────────────────────────────────────
if ! command -v keytool &>/dev/null; then
  echo "❌ keytool não encontrado (parte do JDK)"
  exit 1
fi
echo "  ✅ keytool: OK"

# ─── Verificar Android SDK ────────────────────────────────────────
if [ -z "$ANDROID_HOME" ]; then
  echo "⚠️  ANDROID_HOME não definido."
  echo "   Adicione ao .zshrc: export ANDROID_HOME=\$HOME/Library/Android/sdk"
  echo "   Continuando mesmo assim (Bubblewrap pode perguntar depois)..."
else
  echo "  ✅ ANDROID_HOME: $ANDROID_HOME"
fi

# ─── Verificar Bubblewrap ─────────────────────────────────────────
if ! command -v bubblewrap &>/dev/null; then
  echo "📦 Instalando Bubblewrap CLI..."
  npm install -g @bubblewrap/cli
fi
echo "  ✅ Bubblewrap: $(bubblewrap --version 2>/dev/null)"

# ─── Instalar dependências npm ────────────────────────────────────
echo ""
echo "📦 Instalando dependências npm..."
cd "$DIR"
npm install
echo "  ✅ Dependências instaladas"

# ─── Criar keystore ───────────────────────────────────────────────
mkdir -p "$KEYSTORE_DIR"

if [ -f "$KEYSTORE_FILE" ]; then
  echo ""
  echo "  ✅ Keystore já existe: $KEYSTORE_FILE"
  echo "  ℹ️  Para recriar, delete o arquivo e rode novamente."
else
  echo ""
  echo "🔑 Criando keystore de PRODUÇÃO..."
  echo "   ⚠️  CRÍTICO: Guarde a senha em 1Password/Bitwarden!"
  echo "   ⚠️  Sem o keystore + senha, não é possível atualizar na Play Store!"
  echo ""

  read -s -p "   Senha do keystore (mínimo 6 caracteres): " KEYSTORE_PASS
  echo ""
  read -s -p "   Confirme a senha: " KEYSTORE_PASS2
  echo ""

  if [ "$KEYSTORE_PASS" != "$KEYSTORE_PASS2" ]; then
    echo "❌ Senhas não coincidem. Execute novamente."
    exit 1
  fi

  if [ ${#KEYSTORE_PASS} -lt 6 ]; then
    echo "❌ Senha muito curta (mínimo 6 caracteres)."
    exit 1
  fi

  read -p "   Seu nome completo: " DNAME_NAME
  read -p "   Organização (Personal IA Tecnologia): " DNAME_ORG
  DNAME_ORG="${DNAME_ORG:-Personal IA Tecnologia}"

  keytool -genkey -v \
    -keystore "$KEYSTORE_FILE" \
    -alias vfit \
    -keyalg RSA \
    -keysize 2048 \
    -validity 36500 \
    -storepass "$KEYSTORE_PASS" \
    -keypass "$KEYSTORE_PASS" \
    -dname "CN=$DNAME_NAME, O=$DNAME_ORG, C=BR" \
    2>/dev/null

  # Salva senha no .env do keystore (não vai pro git)
  echo "KEYSTORE_PASS=$KEYSTORE_PASS" > "$KEYSTORE_DIR/.env"
  chmod 600 "$KEYSTORE_DIR/.env"

  echo ""
  echo "  ✅ Keystore criado: $KEYSTORE_FILE"
  echo "  ✅ Senha salva em: $KEYSTORE_DIR/.env"
fi

# ─── Criar pasta de ícones ────────────────────────────────────────
mkdir -p "$DIR/icons/source"
mkdir -p "$DIR/icons/generated"
mkdir -p "$DIR/assetlinks"
mkdir -p "$DIR/dist"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅ Setup concluído!                    ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "  1. Faça BACKUP do keystore:"
echo "     $KEYSTORE_FILE"
echo "     Senha em: $KEYSTORE_DIR/.env"
echo ""
echo "  2. Coloque o ícone base (1024×1024, PNG):"
echo "     twa/icons/source/icon-1024.png"
echo ""
echo "  3. Gere os ícones:"
echo "     npm run icons"
echo ""
echo "  4. Gere o assetlinks:"
echo "     npm run assetlinks"
echo ""
echo "  5. Deploy do frontend (para ativar assetlinks):"
echo "     cd .. && npm run cf:deploy"
echo ""
echo "  6. Verifique assetlinks em produção:"
echo "     curl https://iapersonal.app.br/.well-known/assetlinks.json"
echo ""
echo "  7. Build final:"
echo "     npm run build"
echo ""
```

---

### 6.2 `twa/scripts/generate-icons.js`

```javascript
// generate-icons.js
// Gera todos os ícones necessários para Android + PWA/manifest
// Input:  twa/icons/source/icon-1024.png  (1024×1024, sem padding, fundo #09090B)
// Output: twa/icons/generated/  +  ../../public/icons/

import sharp from "sharp";
import { existsSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(__dirname, "../icons/source/icon-1024.png");
const OUT_ANDROID = join(__dirname, "../icons/generated");
const OUT_PUBLIC = join(__dirname, "../../public/icons");

// Cor de fundo do tema VFIT (consistente com manifest.json)
const BG_COLOR = { r: 9, g: 9, b: 11, alpha: 1 }; // #09090B

// Densidades Android
const ANDROID_SIZES = [
  { size: 48, density: "mdpi" },
  { size: 72, density: "hdpi" },
  { size: 96, density: "xhdpi" },
  { size: 144, density: "xxhdpi" },
  { size: 192, density: "xxxhdpi" },
];

// Tamanhos PWA/manifest (devem cobrir todas as entradas do manifest.json)
const PWA_SIZES = [48, 72, 96, 128, 144, 152, 192, 384, 512];

async function run() {
  // Verificar arquivo fonte
  if (!existsSync(SOURCE)) {
    console.error("\n❌ Ícone base não encontrado!");
    console.error("   Coloque: twa/icons/source/icon-1024.png");
    console.error("   Tamanho: 1024×1024 pixels, PNG, fundo #09090B\n");
    process.exit(1);
  }

  // Criar pastas de saída
  [OUT_ANDROID, OUT_PUBLIC].forEach((d) => mkdirSync(d, { recursive: true }));

  const meta = await sharp(SOURCE).metadata();
  console.log(`\n📐 Ícone fonte: ${meta.width}×${meta.height}px (${meta.format})`);

  if (meta.width < 1024 || meta.height < 1024) {
    console.error("❌ Ícone muito pequeno! Mínimo 1024×1024px");
    process.exit(1);
  }

  console.log("\n🤖 Gerando ícones Android (densidades)...");
  for (const { size, density } of ANDROID_SIZES) {
    const file = `icon-${density}-${size}.png`;
    await sharp(SOURCE).resize(size, size).png({ quality: 100 }).toFile(join(OUT_ANDROID, file));
    console.log(`  ✅ ${file}`);
  }

  console.log("\n🌐 Gerando ícones PWA (manifest.json)...");
  for (const size of PWA_SIZES) {
    // Normal (any)
    const fileNormal = `icon-${size}.png`;
    await sharp(SOURCE)
      .resize(size, size)
      .png({ quality: 100 })
      .toFile(join(OUT_PUBLIC, fileNormal));

    // Maskable (safe zone: 80% = 10% padding em cada lado)
    const innerSize = Math.round(size * 0.8);
    const padding = Math.round(size * 0.1);
    const fileMaskable = `icon-${size}-maskable.png`;
    await sharp(SOURCE)
      .resize(innerSize, innerSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: BG_COLOR,
      })
      .png({ quality: 100 })
      .toFile(join(OUT_PUBLIC, fileMaskable));

    console.log(`  ✅ icon-${size}.png + icon-${size}-maskable.png`);
  }

  console.log("\n🔔 Gerando ícone monochrome (notificações Android)...");
  await sharp(SOURCE)
    .resize(96, 96)
    .greyscale()
    .png({ quality: 100 })
    .toFile(join(OUT_PUBLIC, "icon-96-monochrome.png"));
  console.log("  ✅ icon-96-monochrome.png");

  console.log("\n💦 Gerando splash screen (2048×2048)...");
  // Logo centralizado em fundo sólido
  const logoSize = Math.round(2048 * 0.35); // 35% do splash
  const splashPadding = Math.round((2048 - logoSize) / 2);
  await sharp(SOURCE)
    .resize(logoSize, logoSize)
    .extend({
      top: splashPadding,
      bottom: splashPadding,
      left: splashPadding,
      right: splashPadding,
      background: BG_COLOR,
    })
    .png({ quality: 100 })
    .toFile(join(OUT_ANDROID, "splash-2048.png"));
  console.log("  ✅ splash-2048.png");

  console.log("\n🖼️  Gerando feature graphic Play Store (1024×500)...");
  // Logo centralizado na área de 1024×500
  const logoH = 260;
  const logoW = 260;
  const fgPadTop = Math.round((500 - logoH) / 2);
  const fgPadLeft = Math.round((1024 - logoW) / 2);
  await sharp(SOURCE)
    .resize(logoW, logoH)
    .extend({
      top: fgPadTop,
      bottom: 500 - logoH - fgPadTop,
      left: fgPadLeft,
      right: 1024 - logoW - fgPadLeft,
      background: BG_COLOR,
    })
    .png({ quality: 100 })
    .toFile(join(OUT_ANDROID, "feature-graphic-1024x500.png"));
  console.log("  ✅ feature-graphic-1024x500.png");

  console.log("\n📲 Gerando ícone Play Store (512×512)...");
  await sharp(SOURCE)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(join(OUT_ANDROID, "play-store-icon-512.png"));
  copyFileSync(join(OUT_PUBLIC, "icon-512.png"), join(OUT_ANDROID, "icon-512.png"));
  console.log("  ✅ play-store-icon-512.png");

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   ✅ Todos os ícones gerados!            ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\n  Android:    twa/icons/generated/`);
  console.log(`  PWA/Public: public/icons/`);
  console.log("\n📋 Próximo: npm run assetlinks");
}

run().catch((err) => {
  console.error("❌ Erro ao gerar ícones:", err.message);
  process.exit(1);
});
```

---

### 6.3 `twa/scripts/gen-assetlinks.js`

```javascript
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
console.log(`  SHA-256: ${sha256}`);

// ─── Gerar assetlinks.json ────────────────────────────────────────
const assetLinks = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "br.app.personalia",
      sha256_cert_fingerprints: [sha256],
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
```

---

### 6.4 `twa/scripts/build.sh`

```bash
#!/bin/bash
# build.sh — Pipeline completo: icons → assetlinks → bubblewrap build
# Uso: npm run build

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   VFIT — TWA Build Pipeline      ║"
echo "╚══════════════════════════════════════════╝"

# ─── Carregar env ─────────────────────────────────────────────────
if [ -f "keystore/.env" ]; then
  export $(grep -v '^#' keystore/.env | xargs)
else
  echo "❌ keystore/.env não encontrado. Execute: npm run setup"
  exit 1
fi

# ─── Verificar ícone fonte ────────────────────────────────────────
if [ ! -f "icons/source/icon-1024.png" ]; then
  echo ""
  echo "❌ Ícone base não encontrado!"
  echo "   Coloque em: twa/icons/source/icon-1024.png"
  echo "   Tamanho: 1024×1024px, PNG, fundo #09090B"
  exit 1
fi

# ─── Gerar ícones ─────────────────────────────────────────────────
echo ""
echo "🎨 [1/5] Gerando ícones..."
node scripts/generate-icons.js

# ─── Gerar assetlinks ─────────────────────────────────────────────
echo ""
echo "🔑 [2/5] Gerando assetlinks.json..."
node scripts/gen-assetlinks.js

# ─── Copiar manifest para raiz (Bubblewrap espera na raiz) ────────
echo ""
echo "📋 [3/5] Preparando configuração Bubblewrap..."
cp config/twa-manifest.json twa-manifest.json

# ─── Verificar se projeto Android já foi inicializado ─────────────
if [ ! -d "android" ]; then
  echo ""
  echo "🤖 [4/5] Inicializando projeto Android (primeira vez)..."
  echo "   (Bubblewrap pode baixar ferramentas adicionais)"
  bubblewrap init --manifest=https://iapersonal.app.br/manifest.json
else
  echo ""
  echo "🔄 [4/5] Atualizando projeto Android..."
  bubblewrap update
fi

# ─── Build ────────────────────────────────────────────────────────
echo ""
echo "🏗️  [5/5] Build Android..."
bubblewrap build

# ─── Mover outputs ────────────────────────────────────────────────
mkdir -p dist
DATE=$(date +%Y%m%d)
VERSION=$(node -e "const m=JSON.parse(require('fs').readFileSync('config/twa-manifest.json')); console.log(m.appVersionName)")

if [ -f "app-release-bundle.aab" ]; then
  mv app-release-bundle.aab "dist/vfit-${VERSION}-${DATE}.aab"
  echo ""
  echo "  ✅ AAB: dist/vfit-${VERSION}-${DATE}.aab"
fi
if [ -f "app-release.apk" ]; then
  mv app-release.apk "dist/vfit-${VERSION}-${DATE}.apk"
  echo "  ✅ APK: dist/vfit-${VERSION}-${DATE}.apk"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅ Build concluído!                    ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "📱 Para testar no dispositivo:"
echo "   adb install dist/vfit-${VERSION}-${DATE}.apk"
echo ""
echo "🚀 Para publicar na Play Store:"
echo "   Suba o .aab em: https://play.google.com/console"
echo ""
```

---

### 6.5 `twa/scripts/validate.sh`

```bash
#!/bin/bash
# validate.sh — Valida PWA, assetlinks e ambiente antes do build
# Uso: npm run validate

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERRORS=0
WARNINGS=0

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   VFIT — TWA Validação           ║"
echo "╚══════════════════════════════════════════╝"

# ─── Validar assetlinks em produção ──────────────────────────────
echo ""
echo "🔍  Verificando assetlinks em produção..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  https://iapersonal.app.br/.well-known/assetlinks.json)

if [ "$RESPONSE" = "200" ]; then
  echo "  ✅ assetlinks.json acessível (HTTP 200)"
  CONTENT=$(curl -s https://iapersonal.app.br/.well-known/assetlinks.json)
  if echo "$CONTENT" | grep -q "br.app.personalia"; then
    echo "  ✅ Package ID correto: br.app.personalia"
  else
    echo "  ❌ Package ID não encontrado no assetlinks.json!"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "  ❌ assetlinks.json retornou HTTP $RESPONSE"
  echo "     Faça deploy do frontend primeiro: npm run cf:deploy (na raiz)"
  ERRORS=$((ERRORS + 1))
fi

# ─── Validar manifest PWA em produção ────────────────────────────
echo ""
echo "🔍  Verificando manifest.json em produção..."
MANIFEST_HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  https://iapersonal.app.br/manifest.json)

if [ "$MANIFEST_HTTP" = "200" ]; then
  echo "  ✅ manifest.json acessível (HTTP 200)"
  MANIFEST_CONTENT=$(curl -s https://iapersonal.app.br/manifest.json)
  if echo "$MANIFEST_CONTENT" | grep -q '"standalone"'; then
    echo "  ✅ display: standalone"
  else
    echo "  ⚠️  display não é standalone"
    WARNINGS=$((WARNINGS + 1))
  fi
  if echo "$MANIFEST_CONTENT" | grep -q '"icons"'; then
    echo "  ✅ icons definidos"
  else
    echo "  ❌ icons não encontrados no manifest!"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "  ❌ manifest.json retornou HTTP $MANIFEST_HTTP"
  ERRORS=$((ERRORS + 1))
fi

# ─── Validar ícones em produção ───────────────────────────────────
echo ""
echo "🔍  Verificando ícones em produção..."
for size in 192 512; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://iapersonal.app.br/icons/icon-${size}.png")
  if [ "$STATUS" = "200" ]; then
    echo "  ✅ icon-${size}.png (HTTP 200)"
  else
    echo "  ❌ icon-${size}.png retornou HTTP $STATUS"
    ERRORS=$((ERRORS + 1))
  fi
done

# ─── Verificar keystore ───────────────────────────────────────────
echo ""
echo "🔍  Verificando keystore..."
if [ -f "$DIR/keystore/vfit-release.jks" ]; then
  echo "  ✅ Keystore encontrado"
else
  echo "  ❌ Keystore não encontrado. Execute: npm run setup"
  ERRORS=$((ERRORS + 1))
fi

# ─── Verificar ícone fonte ────────────────────────────────────────
echo ""
echo "🔍  Verificando ícone base..."
if [ -f "$DIR/icons/source/icon-1024.png" ]; then
  echo "  ✅ icon-1024.png encontrado"
else
  echo "  ❌ Ícone base não encontrado: twa/icons/source/icon-1024.png"
  ERRORS=$((ERRORS + 1))
fi

# ─── Verificar Bubblewrap ─────────────────────────────────────────
echo ""
echo "🔍  Verificando Bubblewrap..."
if command -v bubblewrap &>/dev/null; then
  echo "  ✅ Bubblewrap: $(bubblewrap --version 2>/dev/null)"
else
  echo "  ❌ Bubblewrap não instalado: npm install -g @bubblewrap/cli"
  ERRORS=$((ERRORS + 1))
fi

# ─── Resultado ───────────────────────────────────────────────────
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "╔══════════════════════════════════════════╗"
  echo "║   ✅ Tudo OK! Pronto para: npm run build ║"
  echo "╚══════════════════════════════════════════╝"
else
  echo "╔══════════════════════════════════════════╗"
  if [ $ERRORS -gt 0 ]; then
    echo "║   ❌ $ERRORS erro(s) encontrado(s)              ║"
  fi
  if [ $WARNINGS -gt 0 ]; then
    echo "║   ⚠️  $WARNINGS aviso(s) encontrado(s)           ║"
  fi
  echo "╚══════════════════════════════════════════╝"
  echo ""
  echo "   Corrija os erros acima antes de fazer o build."
fi
echo ""

[ $ERRORS -eq 0 ]
```

---

## 7. Ajustes no Next.js (projeto principal)

> **⚠️ IMPORTANTE**: O projeto usa `output: "export"` (static export). Isso significa que
> **rotas API (route.ts) não funcionam**. Use arquivos estáticos em `public/` para servir
> `assetlinks.json` e `manifest.json`.

### 7.1 `public/.well-known/assetlinks.json`

Gerado automaticamente pelo script `npm run assetlinks` (no diretório `twa/`).
O arquivo é copiado para `public/.well-known/assetlinks.json` e servido como estático.

**Não é necessário criar `route.ts`** — o Cloudflare Pages serve direto de `public/`.

Para garantir o header `Content-Type: application/json`, adicionar ao `public/_headers`:

```
/.well-known/assetlinks.json
  Content-Type: application/json
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
```

---

### 7.2 `public/manifest.json` (já existente)

O projeto já tem `public/manifest.json` com todas as configurações PWA corretas.
O Bubblewrap deve apontar para `https://iapersonal.app.br/manifest.json`
(já configurado em `twa/config/twa-manifest.json`).

> **Nota**: Se o Bubblewrap exigir `manifest.webmanifest`, adicione um redirect em
> `public/_redirects`:
> ```
> /manifest.webmanifest  /manifest.json  200
> ```

---

### 7.3 Hook de detecção TWA/Standalone

```typescript
// src/hooks/use-platform.ts
// Detecta se está rodando como TWA, PWA instalado ou browser comum.
// Útil para condicionar UX (ex.: mostrar banner "instalar app", ajustar paddings)

'use client'

import { useEffect, useState } from 'react'

type Platform = 'twa' | 'pwa' | 'browser'

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>('browser')

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isTWA =
      isStandalone &&
      (document.referrer.startsWith('android-app://') ||
        new URLSearchParams(window.location.search).get('utm_source') === 'twa')

    if (isTWA) setPlatform('twa')
    else if (isStandalone) setPlatform('pwa')
    else setPlatform('browser')
  }, [])

  return platform
}
```

---

### 7.4 Provider OneSignal adaptado para TWA

```typescript
// src/components/providers/onesignal-provider.tsx
// Gerencia push via OneSignal Web SDK.
// No TWA: auto-prompt rápido (Chrome já tem permissão nativa).
// No browser: prompt manual após 3 pageviews.

'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { usePlatform } from '@/hooks/use-platform'

declare global {
  interface Window {
    OneSignal?: any
    OneSignalDeferred?: any[]
  }
}

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  // ✅ AUTH GUARD obrigatório (regra crítica do projeto)
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const platform = usePlatform()

  useEffect(() => {
    if (!isReady) return

    const isTWA = platform === 'twa'

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(function (OneSignal: any) {
      OneSignal.init({
        appId: '3043de4e-d7aa-4fa1-a61b-5abea28d2f47',
        serviceWorkerParam: { scope: '/' },
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: 'push',
                autoPrompt: isTWA,
                text: {
                  actionMessage: 'Receba alertas de treinos, pagamentos e novidades',
                  acceptButton: 'Permitir',
                  cancelButton: 'Agora não',
                },
                delay: {
                  pageViews: isTWA ? 1 : 3,
                  timeDelay: isTWA ? 2 : 15,
                },
              },
            ],
          },
        },
        welcomeNotification: {
          title: 'VFIT',
          message: 'Notificações ativadas! 💪',
        },
      }).catch(() => {
        // best-effort: nunca quebrar a UX principal
      })
    })
  }, [isReady, platform])

  return <>{children}</>
}
```

---

### 7.5 Hook de Localização (best-effort)

```typescript
// src/hooks/use-geolocation.ts

'use client'

import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export function useGeolocation() {
  // ✅ AUTH GUARD
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  const requestAndSaveLocation = () => {
    if (!isReady) return
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // best-effort: salva localização para personalização de treinos/academias próximas
        // api-client já prefixa /api/v1 automaticamente
        api
          .post('/profile/location', {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          })
          .catch(() => {
            // nunca quebrar fluxo principal
          })
      },
      (err) => {
        // 1 = PERMISSION_DENIED, 2 = UNAVAILABLE, 3 = TIMEOUT
        console.warn('[Geolocation] código:', err.code)
      },
      {
        enableHighAccuracy: false, // economiza bateria
        timeout: 10000,
        maximumAge: 60000 * 5, // cache por 5 min
      }
    )
  }

  return { requestAndSaveLocation }
}
```

---

## 8. Build Completo

### Sequência completa (primeira vez)

```bash
# ── PARTE 1: Setup e ícones ────────────────────────────────────────
cd twa
npm run setup              # cria keystore + instala deps

# Coloque o ícone base:
# twa/icons/source/icon-1024.png  (1024×1024, PNG, fundo #09090B)

npm run icons              # gera todos os tamanhos

# ── PARTE 2: Assetlinks + Deploy frontend ─────────────────────────
npm run assetlinks         # gera assetlinks.json

cd ..                      # voltar para raiz do monorepo
npm run cf:deploy          # deploy Next.js (ativa assetlinks em produção)

# ── PARTE 3: Validar ──────────────────────────────────────────────
cd twa
npm run validate           # verifica assetlinks, manifest, ícones em produção
                           # deve retornar: ✅ Tudo OK!

# ── PARTE 4: Build Android ────────────────────────────────────────
npm run build              # gera AAB + APK em twa/dist/
```

### Sequência para builds seguintes (somente quando config TWA muda)

```bash
cd twa
npm run build
# Suba o novo .aab na Play Console
# Incremente appVersionCode em config/twa-manifest.json
```

> **Importante**: para updates de features/UI, basta fazer `npm run cf:deploy` na raiz.
> O app da Play Store pega a versão nova automaticamente via Service Worker.
> **Novo AAB só é necessário quando muda:** ícone, permissões, packageId, appVersionCode, ou config Bubblewrap.

---

## 9. Testes Locais

### Instalar APK no dispositivo/emulador

```bash
# Dispositivo físico (USB debugging ativado)
adb devices                                             # confirmar dispositivo conectado
adb install twa/dist/vfit-*.apk                  # instalar

# Emulador (Android Studio AVD)
# Abra o emulador, depois:
adb install twa/dist/vfit-*.apk
```

### O que testar

```
[ ] App abre em fullscreen (sem barra de endereço)
[ ] Login/logout funciona normalmente
[ ] Fluxo de treinos carrega
[ ] Fluxo de alunos carrega
[ ] Pagamentos (PIX/cartão) funcionam
[ ] Push notification: OneSignal Dashboard → Send Test Push
[ ] Localização: abre prompt nativo do Android
[ ] Offline: ativar modo avião → ver DemoModeBanner
[ ] Voltar/home: ciclo de vida do app OK
[ ] Shortcuts (long press no ícone): Treinos e Alunos
[ ] Splash screen exibe corretamente
[ ] Ícone adaptativo (maskable) na home screen
```

### Verificar assetlinks (URL bar não deve aparecer)

Se a URL bar aparecer, o assetlinks está com problema:

```bash
# Verificar localmente
adb logcat | grep -i "digital asset"
# Deve mostrar: "Verified" para iapersonal.app.br

# Testar assetlinks online:
# https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://iapersonal.app.br&relation=delegate_permission/common.handle_all_urls
```

---

## 10. Publicar na Play Store

### 10.1 Criar app na Play Console

1. Acesse: https://play.google.com/console
2. **Criar app** → Preencher:
   - Nome: `VFIT`
   - Idioma padrão: `Português (Brasil)`
   - App ou jogo: `App`
   - Gratuito ou pago: `Gratuito` (com compras opcionais no futuro)
3. Aceitar políticas

### 10.2 Store Listing

```
Título (30 chars):     VFIT
Forma curta (80):      Plataforma para personal trainers com IA
Descrição completa:    [ver template abaixo]
Categoria:             Saúde e Fitness
Email de contato:      suporte@iapersonal.app.br
Política privacidade:  https://iapersonal.app.br/privacidade
```

**Template de descrição:**
```
VFIT é a plataforma completa para personal trainers modernos.

✅ Monte treinos personalizados com IA
✅ Gerencie seus alunos em um só lugar
✅ Controle pagamentos (PIX, boleto, cartão)
✅ Vídeos de exercícios em HD
✅ Notificações em tempo real
✅ Funciona offline

Para personal trainers e alunos. Cadastro gratuito.
```

### 10.3 Assets visuais necessários

```
Ícone do app (512×512):      twa/icons/generated/play-store-icon-512.png
Feature Graphic (1024×500):  twa/icons/generated/feature-graphic-1024x500.png
Screenshots (mínimo 2):      Capturar do emulador ou dispositivo físico
```

**Screenshots recomendadas:**
- Tela de login
- Dashboard do personal
- Tela de treino
- Tela de alunos
- Notificação push recebida

### 10.4 Content Rating

- Completar questionário IARC
- Sem violência, sem conteúdo adulto → classificação **Livre**

### 10.5 Data Safety

```
Dados coletados:
  ✅ Nome e email (obrigatório, não criptografado)
  ✅ Dados de saúde/fitness (peso, altura, % gordura — opcional)
  ✅ Localização (opcional, não precisa)
  ✅ Dados financeiros (pagamentos — criptografado)

Finalidade: Funcionalidade do app, analytics
Compartilhamento: Não compartilhado com terceiros
```

### 10.6 Fluxo de publicação

```bash
# 1. Internal testing (você + equipe testam)
#    Upload: twa/dist/vfit-*.aab
#    Adicionar e-mails de testadores

# 2. Closed testing (beta — até 100 testadores)
#    Aguardar feedback por 1-2 semanas

# 3. Open testing (opcional — qualquer usuário)

# 4. Production rollout
#    Rollout gradual: 10% → 30% → 100%
#    Aprovação: geralmente 1-3 dias úteis
```

---

## 11. Push Notifications (OneSignal)

### Como funciona no TWA

```
Usuário instala app (Play Store)
  ↓
Abre app → Chrome carrega PWA
  ↓
OneSignalProvider detecta plataforma = "twa"
  ↓
Solicita permissão (prompt nativo Android — mais confiável)
  ↓
Service Worker registra subscription
  ↓
Backend Hono (OneSignal lib) envia push via:
  notifyNewWorkout()       → novo treino criado
  notifyPaymentReceived()  → pagamento confirmado
  notifyPaymentOverdue()   → cobrança vencida
  notifyNewStudent()       → novo aluno vinculado
```

### Testar push

1. OneSignal Dashboard → **Messages** → **New Push**
2. Selecionar segmento → Send Test Push
3. Ou via curl:

```bash
curl -X POST "https://onesignal.com/api/v1/notifications" \
  -H "Authorization: Basic SEU_REST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "3043de4e-d7aa-4fa1-a61b-5abea28d2f47",
    "include_external_user_ids": ["ID_DO_USUARIO"],
    "headings": {"pt": "VFIT"},
    "contents": {"pt": "Teste de push 💪"}
  }'
```

---

## 12. Localização (Geolocation)

### Fluxo no Android TWA

```
TWA manifest: locationDelegation.enabled = true
  ↓
Android manifests: ACCESS_FINE_LOCATION + ACCESS_COARSE_LOCATION
  ↓
PWA chama: navigator.geolocation.getCurrentPosition()
  ↓
Android exibe: popup nativo "Permitir VFIT acessar localização?"
  ↓
Aprovado: coords enviadas para API → personalização de treinos/busca de academias
```

### Quando pedir localização (UX ideal)

```typescript
// Pedir localização em contextos relevantes, nunca no boot do app:

// Opção 1: onboarding do aluno (passo de "academias próximas")
// Opção 2: botão explícito "Ativar localização para treinos melhores"
// Opção 3: feature de "encontrar personal perto de mim"

// NUNCA: pedir no carregamento inicial (Play Store rejeita apps assim)
```

---

## 13. In-App Review (5 estrelas)

### Regras da Play Store

```
✅ Permitido:  Google Play In-App Review API (popup oficial nativo)
✅ Permitido:  Link sutil para Play Store em tela de "obrigado"
❌ Proibido:   "Dê 5 estrelas e ganhe X" (incentivado)
❌ Proibido:   Filtro "gostou? → Play Store / não gostou? → feedback interno"
❌ Proibido:   Popup customizado pedindo avaliação específica
```

### Implementação no LauncherActivity

Após `bubblewrap build`, abra `android/app/src/main/java/br/app/vfit/LauncherActivity.java`:

**1. Adicionar em `android/app/build.gradle`:**

```groovy
dependencies {
    // ... dependências existentes ...
    implementation 'com.google.android.play:review:2.0.1'
    implementation 'com.google.android.play:review-ktx:2.0.1'
}
```

**2. Adicionar em `LauncherActivity.java`:**

```java
import android.content.SharedPreferences;
import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;

public class LauncherActivity extends TwaLauncherActivity {

    private static final String PREFS = "vfit_prefs";
    private static final String KEY_SESSION_COUNT = "session_count";
    private static final int MIN_SESSIONS_BEFORE_REVIEW = 5;

    @Override
    protected void onResume() {
        super.onResume();
        incrementSessionAndMaybeReview();
    }

    private void incrementSessionAndMaybeReview() {
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        int sessions = prefs.getInt(KEY_SESSION_COUNT, 0) + 1;
        prefs.edit().putInt(KEY_SESSION_COUNT, sessions).apply();

        // Pede review após 5 sessões, e depois a cada 20
        if (sessions == MIN_SESSIONS_BEFORE_REVIEW ||
            (sessions > MIN_SESSIONS_BEFORE_REVIEW && sessions % 20 == 0)) {
            requestInAppReview();
        }
    }

    private void requestInAppReview() {
        ReviewManager manager = ReviewManagerFactory.create(this);
        manager.requestReviewFlow().addOnCompleteListener(task -> {
            if (task.isSuccessful()) {
                ReviewInfo reviewInfo = task.getResult();
                manager.launchReviewFlow(this, reviewInfo)
                       .addOnCompleteListener(r -> {
                           // Silencioso — Google não informa se o usuário avaliou
                       });
            }
        });
    }
}
```

---

## 14. Manutenção e Versões

### Quando fazer build novo (novo AAB)

| Situação | Novo AAB? | Ação |
|---|---|---|
| Update de feature/UI/bug | ❌ Não | Só `npm run cf:deploy` na raiz |
| Mudança de ícone | ✅ Sim | `npm run icons && npm run build` |
| Nova permissão Android | ✅ Sim | Atualizar `twa-manifest.json` + `npm run build` |
| Atualizar `appVersionCode` | ✅ Sim | Editar `config/twa-manifest.json` + `npm run build` |
| Mudança de `packageId` | ⛔ Nunca | Mudaria o app todo na Play Store |

### Incrementar versão do app

```json
// twa/config/twa-manifest.json — incrementar ANTES de cada build para Play Store:
{
  "appVersionCode": 2,       // ← inteiro, só sobe, nunca desce
  "appVersionName": "1.1.0"  // ← semver do projeto
}
```

### Documentação pós-update TWA

Seguindo as regras do projeto, após publicar novo AAB:

```
1. docs/CHANGELOG.md         → entry com: data, versão AAB, mudanças
2. docs/CF-OPERATIONS.md     → se deploy pipeline mudou
3. twa/config/twa-manifest.json → appVersionCode + appVersionName atualizados
```

### Backup do keystore

```bash
# Backup manual obrigatório (fazer no dia do setup e após qualquer mudança):
cp twa/keystore/vfit-release.jks ~/Desktop/BACKUP_KEYSTORE_$(date +%Y%m%d).jks
# Enviar para: Google Drive / 1Password / S3 seguro / pendrive criptografado
```

---

## 15. Regras Críticas do TWA

```
1. NUNCA mudar o packageId (br.app.personalia) após publicar na Play Store.

2. NUNCA perder o keystore (vfit-release.jks) + senha.
   Perder = criar novo app do zero na Play Store.

3. NUNCA fazer git commit com keystore/.jks ou keystore/.env.
   O .gitignore do twa/ já protege, mas verifique sempre.

4. NUNCA subir AAB sem incrementar appVersionCode.
   Play Store rejeita versão igual ou menor.

5. NUNCA pedir localização no boot do app sem contexto claro.
   Play Store pode rejeitar por "acesso desnecessário a localização".

6. NUNCA usar o dummy Turnstile token (removido em 14/02/2026).
   O TWA abre o site real — Turnstile funciona normalmente.

7. OneSignal no TWA = Web Push via Service Worker.
   NÃO usar OneSignal Android Native SDK (conflito + rejeição).

8. Assetlinks DEVE estar em produção ANTES do build final.
   Sem assetlinks válido → Chrome mostra URL bar → "não parece app".

9. O projeto usa output: "export" (static export no Next.js).
   NÃO criar route.ts para assetlinks/manifest — usar arquivos em public/.

10. O api-client já prefixa /api/v1.
    NÃO duplicar prefixo (usar api.post('/profile/location'), não '/api/v1/profile/location').
```

---

## 16. Troubleshooting

### URL bar aparece no app (não fullscreen)

```
Causa:    assetlinks.json inválido ou não acessível em produção
Verificar: curl https://iapersonal.app.br/.well-known/assetlinks.json
          → deve retornar JSON com SHA-256 do keystore
Corrigir:  cd twa && npm run assetlinks && cd .. && npm run cf:deploy && cd twa && npm run build
```

### Bubblewrap: "spawn jarsigner ENOENT"

```
Causa:    JAVA_HOME não configurado ou keytool não encontrado
Corrigir:
  export JAVA_HOME=$(brew --prefix openjdk@17)
  export PATH="$JAVA_HOME/bin:$PATH"
  which keytool  # deve retornar um path
```

### Bubblewrap: "Android SDK not found"

```
Causa:    ANDROID_HOME não configurado
Corrigir:
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH="$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$PATH"
  bubblewrap doctor  # verificar se resolve
```

### Push notification não chega no TWA

```
Verificar:
  1. Service Worker registrado? DevTools → Application → Service Workers
  2. OneSignal inicializado? Console → "OneSignal initialized"
  3. Permissão concedida? DevTools → Application → Notifications = "granted"
  4. HTTPS ativo? (Cloudflare já garante)
  5. OneSignal app ID correto? 3043de4e-d7aa-4fa1-a61b-5abea28d2f47
```

### App rejeitado pela Play Store

```
Motivos comuns para TWA:
  - Conteúdo insuficiente (precisa ser um "app real", não só wrapper)
  - Manifest PWA com score baixo no Lighthouse
  - Falta de política de privacidade
  - Permissões não justificadas (localização sem contexto)

Ações:
  1. Lighthouse PWA score > 80 (checar DevTools → Lighthouse)
  2. Adicionar política de privacidade: https://iapersonal.app.br/privacidade
  3. Justificar cada permissão na aba Data Safety
```

---

## 📦 Checklist Master

```
SETUP (uma vez)
[ ] brew install openjdk@17 + JAVA_HOME configurado
[ ] Android Studio instalado + SDK 34 + Build Tools 34
[ ] ANDROID_HOME configurado
[ ] npm install -g @bubblewrap/cli
[ ] cd twa && npm run setup  → keystore criado
[ ] Backup do keystore feito (Drive/1Password)

ÍCONES
[ ] icon-1024.png colocado em twa/icons/source/
[ ] npm run icons  → todos os tamanhos gerados
[ ] public/icons/ atualizado (para o Next.js)

ASSETLINKS
[ ] npm run assetlinks  → assetlinks.json gerado
[ ] public/.well-known/assetlinks.json atualizado
[ ] cd .. && npm run cf:deploy  (deploy frontend)
[ ] curl https://iapersonal.app.br/.well-known/assetlinks.json  → JSON válido

VALIDAÇÃO
[ ] cd twa && npm run validate  → ✅ Tudo OK

BUILD
[ ] npm run build  → AAB + APK em twa/dist/
[ ] adb install dist/vfit-*.apk  → testar no device
[ ] URL bar NÃO aparece (assetlinks OK)
[ ] Push notification funciona
[ ] Localização pede permissão nativa Android
[ ] Offline → DemoModeBanner aparece

PLAY STORE
[ ] Conta Play Console criada ($25)
[ ] App criado: "VFIT"
[ ] Store listing preenchido (título, descrição, screenshots)
[ ] Feature Graphic (1024×500) enviado
[ ] Ícone do app (512×512) enviado
[ ] Content rating preenchido (IARC)
[ ] Data safety preenchido
[ ] Política de privacidade vinculada
[ ] AAB enviado para Internal testing
[ ] Testadores internos aprovaram
[ ] Production rollout: 10% → 30% → 100%

DOCUMENTAÇÃO
[ ] docs/CHANGELOG.md atualizado com versão do TWA
[ ] twa/config/twa-manifest.json com appVersionCode correto
```

---

*Última atualização: 2026-03-04 · VFIT TWA v1.0.0*
*Mantenedor: vts dev · iapersonal.app.br*
