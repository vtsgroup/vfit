# 📱 TWA (Trusted Web Activity) — Documentação Completa

> **v1.0** · Última atualização: 04/03/2026 · VFIT v4.3.5
> 
> Este documento contém TUDO sobre a publicação do VFIT na Google Play Store
> via TWA. Leia antes de qualquer manutenção, atualização ou republishing.

---

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura TWA](#2-arquitetura-twa)
3. [Estrutura de Arquivos](#3-estrutura-de-arquivos)
4. [Certificados e Chaves](#4-certificados-e-chaves)
5. [Configuração Bubblewrap](#5-configuração-bubblewrap)
6. [Scripts de Build](#6-scripts-de-build)
7. [Digital Asset Links](#7-digital-asset-links)
8. [Ícones e Assets Visuais](#8-ícones-e-assets-visuais)
9. [Next.js — Ajustes TWA](#9-nextjs--ajustes-twa)
10. [Google Play Console](#10-google-play-console)
11. [Comandos Rápidos](#11-comandos-rápidos)
12. [Atualização de Versão](#12-atualização-de-versão)
13. [Troubleshooting](#13-troubleshooting)
14. [Senhas e Credenciais](#14-senhas-e-credenciais)
15. [Play Store — Textos e Configurações](#15-play-store--textos-e-configurações)
16. [Checklist de Deploy](#16-checklist-de-deploy)

---

## 1. Visão Geral

### O que é TWA?

TWA (Trusted Web Activity) é a tecnologia do Google que permite publicar uma PWA (Progressive Web App) na Google Play Store como um app Android nativo. O app roda em Chrome Custom Tabs em modo fullscreen (sem barra de URL), desde que os Digital Asset Links estejam corretamente configurados.

### Por que TWA e não um app nativo?

| Critério | TWA | App Nativo |
|----------|-----|-----------|
| Base de código | Mesma do web (Next.js) | Código separado (Kotlin/Flutter) |
| Manutenção | Zero — atualiza o site, atualiza o app | Dupla manutenção |
| Tamanho do APK | ~2.3MB (só wrapper) | 10-50MB+ |
| Performance | Chrome engine (excelente) | Nativa |
| Custo | R$0 adicional | Alto (devs mobile) |
| Play Store | ✅ Publicável | ✅ Publicável |
| Push Notifications | ✅ Via OneSignal | ✅ Nativo |
| Geolocation | ✅ Via delegation | ✅ Nativo |

### Stack TWA

- **Bubblewrap CLI v1.24.1** — Ferramenta oficial do Google para gerar projeto Android a partir de uma PWA
- **JDK 17** — Bundled com Bubblewrap (~/.bubblewrap/)
- **Android SDK 34** — Bundled com Bubblewrap (~/.bubblewrap/)
- **Keystore PKCS12** — RSA 2048, validade 100 anos
- **Cloudflare Pages** — Host do frontend + assetlinks.json

---

## 2. Arquitetura TWA

```
┌─────────────────────────────────────────────────────────────┐
│                    Google Play Store                         │
│                    (AAB assinado)                            │
└─────────────┬───────────────────────────────────────────────┘
              │ Download + Install
              ▼
┌─────────────────────────────────────────────────────────────┐
│              Android Device (min SDK 24)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            TWA Shell (2.3MB)                          │   │
│  │  ┌───────────────────────────────────────────────┐   │   │
│  │  │         Chrome Custom Tab (fullscreen)         │   │   │
│  │  │                                                │   │   │
│  │  │   ┌─────────────────────────────────────┐     │   │   │
│  │  │   │   https://vfit.app.br          │     │   │   │
│  │  │   │   (Next.js 15 static export)         │     │   │   │
│  │  │   │                                      │     │   │   │
│  │  │   │   ┌──────────┐  ┌──────────────┐    │     │   │   │
│  │  │   │   │ Frontend │  │  API Worker   │    │     │   │   │
│  │  │   │   │  (Pages) │──│  (Hono.js)   │    │     │   │   │
│  │  │   │   └──────────┘  └──────────────┘    │     │   │   │
│  │  │   └─────────────────────────────────────┘     │   │   │
│  │  └───────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Verificação de Confiança:
  Android ──► vfit.app.br/.well-known/assetlinks.json
           ◄── SHA-256 match? → Fullscreen (sem barra URL)
           ◄── No match?      → Custom Tab (com barra URL)
```

---

## 3. Estrutura de Arquivos

```
twa/
├── package.json                    # Scripts npm (setup, icons, build, validate)
├── .gitignore                      # Ignora outputs, keystore, node_modules
├── .env.example                    # Template de variáveis
│
├── config/
│   └── twa-manifest.json           # Config REFERÊNCIA (nossa versão controlada)
│
├── twa-manifest.json               # Config ATIVA (gerada/usada pelo Bubblewrap)
│                                   # ⚠️ Bubblewrap modifica este arquivo!
│
├── keystore/
│   ├── .gitignore                  # Ignora .jks, .keystore, .env
│   ├── .env.example                # Template: KEYSTORE_PASS=
│   ├── .env                        # 🔒 Senha real (NÃO commitado)
│   └── vfit-release.jks      # 🔒 Keystore PRODUÇÃO (NÃO commitado)
│
├── scripts/
│   ├── setup.sh                    # Setup inicial (Java, keystore, deps)
│   ├── generate-icons.js           # Gera ícones Android + PWA (sharp)
│   ├── gen-assetlinks.js           # Gera assetlinks.json (2 destinos)
│   ├── build.sh                    # Pipeline completo: icons → assetlinks → build
│   └── validate.sh                 # Valida produção (assetlinks, manifest, ícones)
│
├── icons/
│   ├── source/
│   │   └── icon-1024.png           # Ícone base (1024×1024, fundo #09090B)
│   └── generated/                  # Ícones Android gerados (gitignored)
│       ├── icon-mdpi-48.png
│       ├── icon-hdpi-72.png
│       ├── icon-xhdpi-96.png
│       ├── icon-xxhdpi-144.png
│       ├── icon-xxxhdpi-192.png
│       ├── splash-2048.png
│       ├── feature-graphic-1024x500.png
│       └── play-store-icon-512.png
│
├── assetlinks/
│   └── assetlinks.json             # Cópia local gerada
│
├── dist/                           # AABs/APKs nomeados com versão+data
│   ├── vfit-1.0.0-20260304.aab
│   └── vfit-1.0.0-20260304.apk
│
├── app-release-bundle.aab          # Último AAB gerado (gitignored)
├── app-release-signed.apk          # Último APK gerado (gitignored)
│
├── app/                            # Projeto Android (gerado pelo Bubblewrap, gitignored)
├── build.gradle                    # Gerado pelo Bubblewrap
├── gradle/                         # Gerado pelo Bubblewrap
├── gradlew                         # Gerado pelo Bubblewrap
└── settings.gradle                 # Gerado pelo Bubblewrap

Arquivos no projeto principal:
├── public/
│   ├── .well-known/
│   │   └── assetlinks.json         # ✅ Servido em produção (2 SHA-256)
│   ├── _headers                    # Configurado para assetlinks + geolocation
│   ├── _redirects                  # /manifest.webmanifest → /manifest.json
│   ├── manifest.json               # PWA manifest (com monochrome icon)
│   └── icons/                      # Todos os ícones PWA + maskable
│
└── src/hooks/
    ├── use-platform.ts             # Detecta TWA vs PWA vs browser
    └── use-geolocation.ts          # Geolocation best-effort
```

---

## 4. Certificados e Chaves

### 🔐 Keystore de Produção

| Propriedade | Valor |
|-------------|-------|
| **Arquivo** | `twa/keystore/vfit-release.jks` |
| **Formato** | PKCS12 |
| **Algoritmo** | RSA 2048 |
| **Validade** | 100 anos (até 2126) |
| **Alias** | `vfit` |
| **Senha (store + key)** | Armazenada em `twa/keystore/.env` e NordPass |
| **Backup** | `~/Desktop/BACKUP_KEYSTORE_20260304.jks` |

> ⚠️ **CRÍTICO**: Sem o keystore + senha, é **impossível** publicar atualizações na Play Store.
> O Google Play vincula o app ao certificado de upload. Perder = criar app novo do zero.

### 🔑 SHA-256 — Upload Key (Nosso Keystore)

```
MD5:    D3:F3:1C:E0:B5:B6:FA:B9:94:A8:D8:38:D3:70:AE:E3
SHA-1:  58:14:E9:08:81:32:56:D7:62:A5:26:47:0F:FC:5E:11:91:85:BA:35
SHA-256: E1:55:72:99:10:B3:A7:42:D3:DF:DE:F2:D1:32:7E:9B:4C:8C:15:A8:08:4A:E8:6F:8B:07:28:FC:A4:E6:5F:3A
```

### 🔑 SHA-256 — Google App Signing Key (Chave do Google)

```
MD5:    C2:D2:84:88:AB:86:A8:79:54:16:A0:A3:65:C7:ED:4E
SHA-1:  0B:DB:76:41:72:E2:7C:2F:04:E0:33:33:3D:E3:3E:55:B8:08:98:B1
SHA-256: 43:50:06:06:7A:2A:9B:66:58:4E:D6:F1:C0:9B:03:73:F1:B4:30:54:EB:13:AE:10:75:1E:B0:92:01:95:35:F1
```

### Como funciona a assinatura dupla

1. **Nós** assinamos o AAB com nosso keystore (Upload Key)
2. **Google** verifica o upload com nosso certificado
3. **Google** re-assina o APK final com a App Signing Key dele
4. **Usuários** recebem o APK assinado pelo Google
5. **Android** verifica o SHA-256 da App Signing Key contra o `assetlinks.json`

→ Por isso o `assetlinks.json` precisa ter **AMBOS** SHA-256.

### Extrair SHA-256 do keystore

```bash
cd twa
source keystore/.env
keytool -list -v -keystore keystore/vfit-release.jks -alias vfit -storepass "$KEYSTORE_PASS"
```

---

## 5. Configuração Bubblewrap

### twa-manifest.json (configuração ativa)

| Campo | Valor | Notas |
|-------|-------|-------|
| `packageId` | `br.app.vfit` | ID único na Play Store |
| `host` | `vfit.app.br` | Domínio principal |
| `name` | `VFIT` | Nome completo |
| `launcherName` | `VFIT` | Nome no launcher Android |
| `display` | `standalone` | Fullscreen sem barra |
| `themeColor` | `#09090B` | Cor tema (status bar) |
| `navigationColor` | `#09090B` | Cor barra navegação |
| `backgroundColor` | `#09090B` | Cor splash screen |
| `enableNotifications` | `true` | Push via OneSignal |
| `startUrl` | `/dashboard` | URL inicial após abrir |
| `minSdkVersion` | `24` | Android 7.0+ |
| `targetSdkVersion` | `34` | Android 14 |
| `orientation` | `natural` | Auto-rotação |
| `locationDelegation` | `true` | Geolocation compartilhado |
| `playBilling` | `false` | Sem compras in-app |
| `additionalTrustedOrigins` | `vfit.pages.dev` | Fallback Cloudflare |
| `fallbackType` | `customtabs` | Chrome Custom Tab se não suporta TWA |

### Dois arquivos manifest — diferença importante

| Arquivo | Propósito | Quem edita |
|---------|-----------|------------|
| `twa/config/twa-manifest.json` | Referência controlada por nós | Humano |
| `twa/twa-manifest.json` | Arquivo ativo usado pelo Bubblewrap | Bubblewrap (auto-incrementa version) |

> **⚠️ CUIDADO**: `bubblewrap build` pergunta "apply changes?" e pode sobrescrever valores.
> Sempre verifique `twa-manifest.json` após cada build.

---

## 6. Scripts de Build

### Comandos npm (rodar de dentro de `twa/`)

| Comando | Descrição |
|---------|-----------|
| `npm run setup` | Setup inicial: verifica Java, cria keystore, instala deps |
| `npm run icons` | Gera todos os ícones Android + PWA a partir do source |
| `npm run assetlinks` | Extrai SHA-256 e gera assetlinks.json em 2 destinos |
| `npm run build` | Pipeline completo: icons → assetlinks → bubblewrap build |
| `npm run build:debug` | Build sem assinatura (debug) |
| `npm run validate` | Valida produção: assetlinks, manifest, ícones, ambiente |
| `npm run update` | Atualiza projeto Android com mudanças do manifest |
| `npm run doctor` | Diagnóstico do ambiente Bubblewrap |
| `npm run init` | Re-inicializa projeto Android do zero |

### Pipeline de build completo (`npm run build`)

```
[1/5] Gerar ícones (sharp) → twa/icons/generated/ + public/icons/
[2/5] Gerar assetlinks.json → twa/assetlinks/ + public/.well-known/
[3/5] Copiar config manifest → twa-manifest.json
[4/5] Inicializar/atualizar projeto Android (bubblewrap)
[5/5] Build Android (bubblewrap build) → AAB + APK
```

### Build manual (passo a passo)

```bash
cd twa

# 1. Gerar ícones
node scripts/generate-icons.js

# 2. Gerar assetlinks
node scripts/gen-assetlinks.js

# 3. Build
bubblewrap build
# → Vai pedir senha do keystore
# → Gera app-release-bundle.aab + app-release-signed.apk

# 4. Verificar assinatura
jarsigner -verify app-release-bundle.aab

# 5. Copiar para upload
cp app-release-bundle.aab ~/Desktop/vfit-UPLOAD.aab
```

---

## 7. Digital Asset Links

### O que são?

Arquivo JSON servido em `https://vfit.app.br/.well-known/assetlinks.json` que prova ao Android que o app `br.app.vfit` tem permissão para abrir URLs do domínio em modo fullscreen (sem barra de URL).

### Arquivo atual em produção

```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "br.app.vfit",
      "sha256_cert_fingerprints": [
        "43:50:06:06:7A:2A:9B:66:58:4E:D6:F1:C0:9B:03:73:F1:B4:30:54:EB:13:AE:10:75:1E:B0:92:01:95:35:F1",
        "E1:55:72:99:10:B3:A7:42:D3:DF:DE:F2:D1:32:7E:9B:4C:8C:15:A8:08:4A:E8:6F:8B:07:28:FC:A4:E6:5F:3A"
      ]
    }
  }
]
```

### Onde fica

| Localização | Propósito |
|-------------|-----------|
| `public/.well-known/assetlinks.json` | Servido em produção (Cloudflare Pages) |
| `twa/assetlinks/assetlinks.json` | Cópia local (referência) |

### Headers configurados (`public/_headers`)

```
/.well-known/assetlinks.json
  Content-Type: application/json
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
```

### Validação

```bash
# Verificar HTTP
curl -sI https://vfit.app.br/.well-known/assetlinks.json | head -5

# Verificar conteúdo
curl -s https://vfit.app.br/.well-known/assetlinks.json | python3 -m json.tool

# Verificar via Google API (fonte de verdade)
curl -s "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://vfit.app.br&relation=delegate_permission/common.handle_all_urls" | python3 -m json.tool
```

> **Nota**: A API do Google tem cache de ~1h. Após atualizar o assetlinks.json, pode levar até 1h para refletir.

---

## 8. Ícones e Assets Visuais

### Ícone fonte

- **Arquivo**: `twa/icons/source/icon-1024.png`
- **Tamanho**: 1024×1024px
- **Formato**: PNG
- **Fundo**: `#09090B` (cor tema VFIT)

### Ícones gerados automaticamente

| Tipo | Tamanhos | Destino |
|------|----------|---------|
| **Android (densidades)** | 48, 72, 96, 144, 192 | `twa/icons/generated/` |
| **PWA normal** | 48, 72, 96, 128, 144, 152, 192, 384, 512 | `public/icons/` |
| **PWA maskable** | Todos acima (80% inner, 10% padding) | `public/icons/icon-{size}-maskable.png` |
| **Monochrome** | 96 (greyscale) | `public/icons/icon-96-monochrome.png` |
| **Splash screen** | 2048×2048 (logo 35% centralizado) | `twa/icons/generated/splash-2048.png` |
| **Feature graphic** | 1024×500 | `twa/icons/generated/feature-graphic-1024x500.png` |
| **Play Store icon** | 512×512 | `twa/icons/generated/play-store-icon-512.png` |

### Regenerar ícones

```bash
cd twa
node scripts/generate-icons.js
```

> Requer `sharp` instalado (`npm install` dentro de `twa/`).

---

## 9. Next.js — Ajustes TWA

### Arquivos modificados para TWA

#### `public/_headers` — Geolocation + Assetlinks

```yaml
# Geolocation permission para TWA
Permissions-Policy: camera=(self), microphone=(), geolocation=(self), interest-cohort=()

# TWA — Digital Asset Links
/.well-known/assetlinks.json
  Content-Type: application/json
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
```

#### `public/_redirects` — Manifest webmanifest alias

```
/manifest.webmanifest  /manifest.json  200
```

Bubblewrap pede `/manifest.webmanifest` em vez de `/manifest.json`.

#### `public/manifest.json` — Monochrome icon

Adicionada entrada monochrome para notificações Android:
```json
{
  "src": "/icons/icon-96-monochrome.png",
  "sizes": "96x96",
  "type": "image/png",
  "purpose": "monochrome"
}
```

#### `src/hooks/use-platform.ts` — Detecção de plataforma

```typescript
type Platform = 'twa' | 'pwa' | 'browser'

// Detecta via:
// 1. display-mode: standalone (media query)
// 2. document.referrer starts with android-app://
// 3. utm_source=twa na URL
```

Uso:
```typescript
const platform = usePlatform()
if (platform === 'twa') {
  // Lógica específica Android/TWA
}
```

#### `src/hooks/use-geolocation.ts` — Geolocation best-effort

```typescript
// Captura localização com auth guard
// Salva via POST /profile/location
// Nunca quebra fluxo principal (.catch(() => {}))
// enableHighAccuracy: false (economia de bateria)
// Cache de 5 minutos
```

#### `src/app/(legal)/excluir-conta/page.tsx` — Exclusão de conta

Página pública exigida pelo Google Play para Data Deletion:
- **URL**: `https://vfit.app.br/excluir-conta`
- Self-service via app (Configurações → Excluir conta)
- Email para `contato@vfit.app.br`
- Lista o que é excluído
- Prazo (15 dias úteis) e base legal (LGPD)

---

## 10. Google Play Console

### Dados do App

| Campo | Valor |
|-------|-------|
| **Package ID** | `br.app.vfit` |
| **Nome** | VFIT |
| **Categoria** | Saúde e fitness |
| **País** | Brasil (somente) |
| **Idioma** | Português do Brasil |
| **URL Privacidade** | `https://vfit.app.br/privacidade` |
| **URL Exclusão de Dados** | `https://vfit.app.br/excluir-conta` |
| **Website** | `https://vfit.app.br` |
| **Email de contacto** | `contato@vfit.app.br` |

### Declarações preenchidas

| Seção | Resposta principal |
|-------|-------------------|
| **Política de Privacidade** | `https://vfit.app.br/privacidade` |
| **Acesso a apps** | Restrito — credenciais de teste fornecidas |
| **Anúncios** | Não contém anúncios |
| **ID de publicidade** | Não usa |
| **Classificação de conteúdo** | Livre (IARC) |
| **Público-alvo** | 18+ apenas |
| **Apps governamentais** | Não |
| **Funcionalidades financeiras** | Sim — pagamentos via Asaas |
| **Apps de saúde** | Sim — Atividade e fitness |

### Segurança dos dados — Resumo

**Dados recolhidos (não partilhados):**
- Nome, email, telefone
- Localização aproximada
- Informações de saúde e fitness
- Fotos e vídeos
- Histórico de compras
- Mensagens no app
- Atividade no app

**Dados recolhidos E partilhados:**
- Informações financeiras → com Asaas (processamento de pagamentos)
- IDs de dispositivo → com OneSignal (push notifications)

**Práticas de segurança:**
- ✅ Dados criptografados em trânsito (HTTPS/TLS)
- ✅ Dados criptografados em repouso (Neon PostgreSQL)
- ✅ Usuários podem solicitar exclusão de dados
- ✅ Segue LGPD

### Credenciais de teste (para revisores Google)

| Campo | Valor |
|-------|-------|
| Email | `google-review@vfit.app.br` |
| Senha | `GoogleReview2026!` |
| Tipo | Aluno (student) |

> ✅ **Conta criada no banco em 05/03/2026** — user_type=student, is_active=true, email_verified=true

---

## 11. Comandos Rápidos

### Setup (primeira vez em máquina nova)

```bash
# 1. Instalar Bubblewrap globalmente
npm install -g @bubblewrap/cli

# 2. Setup do TWA
cd twa
npm install
npm run setup

# 3. Colocar ícone fonte
# Copiar icon-1024.png para twa/icons/source/

# 4. Restaurar keystore (do backup ou NordPass)
# Copiar vfit-release.jks para twa/keystore/
# Criar twa/keystore/.env com KEYSTORE_PASS=<senha>

# 5. Validar tudo
npm run validate
```

### Build para publicação

```bash
cd twa
bubblewrap build
# Responder "Yes" para aplicar mudanças
# Digitar senha do keystore
# → app-release-bundle.aab (para Play Store)
# → app-release-signed.apk (para teste direto)
```

### Validação em produção

```bash
cd twa
npm run validate
```

### Deploy frontend (após alterar assetlinks/manifest/ícones)

```bash
cd /path/to/vfit
node scripts/cf-deploy.js patch --msg "descrição"
```

---

## 12. Atualização de Versão

### Para publicar uma atualização na Play Store:

```bash
cd twa

# 1. (Opcional) Editar twa-manifest.json — incrementar appVersionCode
# ⚠️ Bubblewrap auto-incrementa se você responder "Yes" no build

# 2. Build
bubblewrap build
# → Responda "Yes" para aplicar mudanças
# → Bubblewrap incrementa versionCode automaticamente

# 3. Verificar assinatura
jarsigner -verify app-release-bundle.aab

# 4. Upload no Play Console
# Play Console → Produção → Criar novo lançamento → Upload AAB

# 5. Preencher notas de lançamento e enviar para revisão
```

### Versionamento

| Campo | Descrição | Quem controla |
|-------|-----------|--------------|
| `appVersionCode` | Número inteiro, DEVE ser maior a cada upload | Bubblewrap (auto-incrementa) |
| `appVersionName` | String visível ao usuário (ex: "1.0.2") | Bubblewrap (auto-incrementa) |
| Web app version | `lib/version.ts` (ex: "4.3.5") | Deploy script |

> **IMPORTANTE**: O `appVersionCode` do Play Store é independente da versão do web app.
> O Play Store só exige que cada AAB tenha um versionCode maior que o anterior.

### Histórico de builds

| Data | versionCode | versionName | Motivo |
|------|:-----------:|:-----------:|--------|
| 04/03/2026 | 1 | 1.0.0 | Build inicial (não aceito — erro de assinatura no console) |
| 04/03/2026 | 2 | 1.0.0 | Rebuild com correções |
| 04/03/2026 | 3 | 1.0.1 | Rebuild para novo upload |
| 04/03/2026 | 4 | 1.0.2 | Versão final publicada em produção |
| 05/03/2026 | 6 | 1.0.4 | Rebuild para re-review Google (conta review criada) |

---

## 13. Troubleshooting

### ❌ "Todos os pacotes carregados têm de estar assinados"

**Causa**: Play Console não reconheceu a assinatura do AAB.

**Solução**:
1. Verificar: `jarsigner -verify app-release-bundle.aab` → deve retornar "jar verified"
2. Garantir que usou a **mesma senha** para store e key (PKCS12 usa mesma)
3. Rebuildar: `bubblewrap build`
4. Se persistir, verificar se o Play Console está configurado para "App Signing by Google Play" (obrigatório desde 2021)

### ❌ Barra de URL aparece no TWA (não fullscreen)

**Causa**: SHA-256 no assetlinks.json não corresponde ao certificado usado.

**Solução**:
1. O assetlinks.json DEVE conter o SHA-256 da **App Signing Key do Google** (não só o upload key)
2. Verificar: Play Console → Configuração → Integridade da app → SHA-256 do "Certificado da chave de assinatura de apps"
3. Adicionar no `assetlinks.json` e fazer deploy
4. Aguardar cache do Google expirar (~1h)
5. Validar: `curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://vfit.app.br&relation=delegate_permission/common.handle_all_urls"`

### ❌ `zsh: event not found` ao digitar senha

**Causa**: Caractere `!` no password é interpretado pelo zsh como "history expansion".

**Solução**: Não usar `!` na senha do keystore, ou escapar com `\!`, ou usar aspas simples.

### ❌ `-keypasswd` não funciona no PKCS12

**Causa**: Keystores PKCS12 usam a **mesma senha** para store e key.

**Solução**: Para trocar senha, recriar o keystore com `keytool`:
```bash
keytool -importkeystore \
  -srckeystore old.jks -destkeystore new.jks \
  -srcstorepass SENHA_VELHA -deststorepass SENHA_NOVA \
  -srcalias vfit -destalias vfit
```

### ❌ Bubblewrap usa defaults errados

**Causa**: `bubblewrap init` pega defaults do manifest.json que podem não corresponder ao que queremos.

**Solução**: Sempre verificar e corrigir `twa-manifest.json` após `bubblewrap init`:
- Cores: `#09090B` (não `#050A12`)
- Keystore path: caminho absoluto correto
- minSdkVersion: 24
- locationDelegation: enabled

### ❌ Ícones pixelados ou cortados

**Solução**: Regenerar a partir do source 1024×1024:
```bash
cd twa
node scripts/generate-icons.js
cd .. && node scripts/cf-deploy.js patch --msg "regenerate icons"
```

### ❌ Push notifications não funcionam na TWA

**Causa**: `enableNotifications: true` precisa estar no manifest E o OneSignal precisa estar configurado.

**Verificar**:
1. `twa-manifest.json` → `enableNotifications: true` ✓
2. OneSignal SDK carregado no frontend ✓
3. Service Worker registrado ✓

---

## 14. Senhas e Credenciais

### Armazenamento de senhas

| Credencial | Onde está | Backup |
|------------|-----------|--------|
| Senha keystore | `twa/keystore/.env` (local, gitignored) | NordPass |
| Keystore .jks | `twa/keystore/vfit-release.jks` (local, gitignored) | `~/Desktop/BACKUP_KEYSTORE_20260304.jks` + NordPass |
| Google Play Console | Conta Google do proprietário | — |
| Credenciais de teste | Banco de dados (a criar) | — |

### NordPass — Entrada recomendada

```
Título:    VFIT — Android Keystore (Play Store)
Username:  vfit (alias)
Password:  <senha do keystore>
Website:   https://play.google.com/console
Notas:
  Keystore: twa/keystore/vfit-release.jks
  Alias: vfit
  Formato: PKCS12
  Algoritmo: RSA 2048
  Validade: 100 anos (até 2126)
  Upload Key SHA-256: E1:55:72:99:10:B3:A7:42:D3:DF:DE:F2:D1:32:7E:9B:4C:8C:15:A8:08:4A:E8:6F:8B:07:28:FC:A4:E6:5F:3A
  Google App Signing SHA-256: 43:50:06:06:7A:2A:9B:66:58:4E:D6:F1:C0:9B:03:73:F1:B4:30:54:EB:13:AE:10:75:1E:B0:92:01:95:35:F1
  Package: br.app.vfit
```

---

## 15. Play Store — Textos e Configurações

### Descrição breve (80 caracteres)

```
App completo para Personal Trainers e Alunos: treinos, pagamentos e evolução.
```

### Descrição completa (4000 caracteres max)

```
VFIT — A plataforma mais completa para Personal Trainers e seus Alunos.

🏋️ PARA PERSONAL TRAINERS:
• Crie treinos personalizados com vídeos de exercícios
• Gerencie seus alunos em um só lugar
• Acompanhe avaliações físicas detalhadas (peso, medidas, % gordura)
• Cobre via PIX, boleto ou cartão — receba direto na sua conta
• Chat integrado com cada aluno
• Relatórios de evolução com gráficos
• Inteligência Artificial para sugestões de treino
• Calendário de agendamentos
• Dashboard financeiro completo

📱 PARA ALUNOS:
• Acesse seus treinos de qualquer lugar
• Acompanhe sua evolução com gráficos detalhados
• Veja vídeos demonstrativos de cada exercício
• Execute treinos com timer integrado
• Converse com seu personal pelo chat
• Receba notificações de novos treinos
• Pague mensalidades pelo app (PIX, boleto, cartão)
• Histórico completo de avaliações físicas

🔒 SEGURANÇA:
• Dados protegidos com criptografia
• Em conformidade com a LGPD
• Pagamentos processados pelo Asaas (intermediadora autorizada)
• Sem armazenamento de dados de cartão no app

⚡ TECNOLOGIA:
• App leve e rápido (funciona até com internet instável)
• Notificações push em tempo real
• Funciona offline para consulta de treinos
• Atualizações automáticas sem precisar baixar nova versão
```

### Notas de lançamento (versão 1.0)

```
🎉 Lançamento oficial do VFIT na Play Store!

Funcionalidades disponíveis:
• Dashboard completo para personal trainers e alunos
• Criação e gestão de treinos personalizados
• Avaliações físicas com gráficos de evolução
• Sistema de pagamentos integrado (PIX, boleto, cartão)
• Chat em tempo real entre personal e aluno
• Vídeos demonstrativos de exercícios
• Notificações push
• Modo offline para consulta de treinos
```

---

## 16. Checklist de Deploy

### Antes de publicar atualização na Play Store

- [ ] Versão web deployada e estável (`vfit.app.br` funcionando)
- [ ] `validate.sh` passando (todos ✅)
- [ ] Assetlinks verificado (Google API retorna statements)
- [ ] AAB gerado com `bubblewrap build`
- [ ] AAB assinado (`jarsigner -verify` → "jar verified")
- [ ] versionCode maior que o último upload
- [ ] Testar APK em device Android (se possível)

### Antes do primeiro lançamento (feito em 04/03/2026)

- [x] Keystore criado e backupeado
- [x] Senha salva em NordPass
- [x] Ícones gerados (todos os tamanhos)
- [x] Assetlinks com ambos SHA-256 (upload + Google signing)
- [x] Feature graphic (1024×500) uploadada
- [x] Play Store icon (512×512) uploadada
- [x] Screenshots uploadadas
- [x] Política de privacidade URL
- [x] Exclusão de conta URL
- [x] Classificação de conteúdo (IARC)
- [x] Segurança dos dados preenchida
- [x] Funcionalidades financeiras declaradas
- [x] Apps de saúde declarada
- [x] ID publicidade = Não
- [x] País = Brasil
- [x] Conta de teste configurada
- [x] Lançamento criado e enviado para revisão

---

## 📌 Links Úteis

| Recurso | URL |
|---------|-----|
| Play Console | https://play.google.com/console |
| Assetlinks (produção) | https://vfit.app.br/.well-known/assetlinks.json |
| Validador Google | https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://vfit.app.br&relation=delegate_permission/common.handle_all_urls |
| Bubblewrap docs | https://github.com/nichaelGuo/nichaelGuo.github.io/issues/4 |
| TWA docs Google | https://developer.chrome.com/docs/android/trusted-web-activity |
| Maskable icons tool | https://maskable.app |
| Play Console integridade | Play Console → Configuração → Integridade da app |
| Privacidade | https://vfit.app.br/privacidade |
| Exclusão de conta | https://vfit.app.br/excluir-conta |
| Manifest PWA | https://vfit.app.br/manifest.json |

---

> **Última atualização**: 05/03/2026 por Copilot
> **Versão web**: 4.4.9 | **Versão TWA**: 1.0.4 (versionCode 6)
> **Status Play Store**: Re-submetido para revisão com conta de teste ativa
