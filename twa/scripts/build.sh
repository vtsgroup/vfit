#!/bin/bash
# build.sh — Pipeline completo: icons → assetlinks → bubblewrap build
# Uso: npm run build

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   VFIT — TWA Build Pipeline              ║"
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
  bubblewrap init --manifest=https://vfit.app.br/manifest.json
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
