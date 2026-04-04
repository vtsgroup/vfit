#!/bin/bash
# setup.sh — Configura ambiente TWA pela primeira vez
# Uso: npm run setup

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEYSTORE_DIR="$DIR/keystore"
KEYSTORE_FILE="$KEYSTORE_DIR/vfit-release.jks"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   VFIT — TWA Setup Inicial               ║"
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
  read -p "   Organização (VFIT Tecnologia): " DNAME_ORG
  DNAME_ORG="${DNAME_ORG:-VFIT Tecnologia}"

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
echo "     curl https://vfit.app.br/.well-known/assetlinks.json"
echo ""
echo "  7. Build final:"
echo "     npm run build"
echo ""
