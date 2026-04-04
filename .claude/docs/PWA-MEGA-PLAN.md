# 🚀 VFIT — PWA Mega Evolution Plan

> **Objetivo:** Transformar o VFIT em um PWA de nível nativo, igual ou superior ao que o Progressier oferece, porém proprietário e sem dependências externas.
>
> **Inspiração:** Progressier.com features + design ultra-moderno com glassy orb
>
> **Atualizado:** 13/02/2026

---

## ✅ Decisão operacional atual (27/02/2026)

- O banner/badge manual de "nova atualização" foi removido do app.
- Motivo: em PWA com worker de push + ciclo frequente de registro, o aviso estava aparecendo sem mudança perceptível para o usuário final.
- Política vigente:
  - manter atualização em background sem interrupção visual recorrente;
  - só reintroduzir prompt manual se houver release breaking que exija reload explícito.

Arquivos de referência:
- [src/app/layout.tsx](src/app/layout.tsx)
- [src/components/pwa/sw-register.tsx](src/components/pwa/sw-register.tsx)

---

## 📋 Índice de Fases

| Fase | Nome | Prioridade | Complexidade |
|------|------|-----------|-------------|
| 1 | **Fix Instalação Nativa** | 🔴 CRÍTICA | Baixa |
| 2 | **Glassy Orb Landing** | 🟡 Alta | Média |
| 3 | **Push Notifications** | 🔴 CRÍTICA | Alta |
| 4 | **Biometric Auth (Passkeys/WebAuthn)** | 🟡 Alta | Alta |
| 5 | **App Badges & Shortcuts** | 🟢 Média | Baixa |
| 6 | **Web Share Target** | 🟢 Média | Baixa |
| 7 | **Background Sync & Periodic Sync** | 🟡 Alta | Média |
| 8 | **PWA Analytics Dashboard** | 🟡 Alta | Média |
| 9 | **Admin PWA Management Panel** | 🟡 Alta | Alta |
| 10 | **Offline-First Architecture** | 🟢 Média | Alta |
| 11 | **Rich Install UI (Chrome Rich)** | 🟢 Média | Baixa |
| 12 | **Dedicated Install Page** | 🟢 Média | Baixa |
| 13 | **QR Code Install** | 🟢 Média | Baixa |
| 14 | **Screen Wake Lock & Fullscreen** | 🟢 Média | Baixa |
| 15 | **File System Access** | ⚪ Futura | Média |
| 16 | **Vibration & Haptic Feedback** | ⚪ Futura | Baixa |

---

## 🔴 FASE 1 — Fix Instalação Nativa (IMEDIATA)

### Problema Atual
O `beforeinstallprompt` do Chrome **não está sendo capturado** → clicou "Instalar" → mostra overlay com instruções em vez do prompt nativo do navegador.

### Causa Raiz
Chrome tem **critérios rigorosos** para disparar `beforeinstallprompt`:
1. ✅ HTTPS (Cloudflare Pages)
2. ✅ Manifest válido com `name`, `icons` (192+512), `start_url`, `display: standalone`
3. ✅ Service Worker com `fetch` handler registrado
4. ⚠️ **Engagement heuristic** — usuário precisa ter interagido com a página
5. ⚠️ **Não pode já estar instalado**

### Solução — 4 Sub-etapas

#### 1.1 Debug Inspector
Criar componente `PwaDebugPanel` (apenas dev/admin) que mostra:
- Status do SW (registrado, ativo, esperando)
- Manifest detectado pelo browser
- `beforeinstallprompt` capturado? sim/não
- `window.__pwaPrompt` presente?
- `display-mode: standalone`?
- Plataforma detectada

```typescript
// src/components/pwa/debug-panel.tsx
// Painel flutuante com todas as informações de diagnóstico
// Acessível via Admin Panel > PWA > Debug
```

#### 1.2 Manifest otimizado para Rich Install UI
```json
{
  "id": "vfit",
  "name": "VFIT — Plataforma para Trainers",
  "description": "Crie treinos com IA, gerencie alunos, cobranças e avaliações",
  "screenshots": [
    { "src": "/screenshots/mobile-dashboard.png", "sizes": "390x844", "form_factor": "narrow" },
    { "src": "/screenshots/mobile-workouts.png", "sizes": "390x844", "form_factor": "narrow" },
    { "src": "/screenshots/desktop-dashboard.png", "sizes": "1280x800", "form_factor": "wide" },
    { "src": "/screenshots/desktop-students.png", "sizes": "1280x800", "form_factor": "wide" }
  ]
}
```

#### 1.3 Script de captura mais robusto
```html
<script>
  // Captura imediata, antes de QUALQUER JS carregar
  window.__pwaPrompt = null;
  window.__pwaPromptCaptured = false;
  window.__pwaInstalled = false;
  
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    window.__pwaPrompt = e;
    window.__pwaPromptCaptured = true;
    // Dispatch custom event para React ouvir
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });
  
  window.addEventListener('appinstalled', function() {
    window.__pwaInstalled = true;
    window.__pwaPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
</script>
```

#### 1.4 Provider com listener de custom events
```typescript
// No PwaInstallProvider, além de ler window.__pwaPrompt no mount:
useEffect(() => {
  const onPromptReady = () => {
    if (window.__pwaPrompt) {
      setDeferredPrompt(window.__pwaPrompt)
    }
  }
  window.addEventListener('pwa-prompt-ready', onPromptReady)
  return () => window.removeEventListener('pwa-prompt-ready', onPromptReady)
}, [])
```

### Arquivos Afetados
- `src/app/layout.tsx` — Script no head
- `src/components/pwa/install-banner.tsx` — Provider + custom events
- `public/manifest.json` — Otimizar
- `src/components/pwa/debug-panel.tsx` — NOVO

---

## 🎨 FASE 2 — Glassy Orb Landing (Visual Ultra-Moderno)

### Conceito
Adicionar efeito de **orb 3D com vidro líquido** na hero section, similar ao Progressier, usando WebGL/CSS puro.

### Implementação

#### 2.1 Orb com CSS (fallback) + WebM video (hero)
```html
<!-- Video orb como background element -->
<video src="/videos/orb-green.webm" loop playsinline autoplay preload="auto"
  class="h-full w-full object-contain transition-opacity duration-500" />
```

#### 2.2 Alternativa CSS pura (glassy sphere)
```css
.glassy-orb {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, 
    rgba(0, 217, 142, 0.4), 
    rgba(0, 217, 142, 0.1) 40%, 
    rgba(9, 9, 11, 0.6) 70%);
  backdrop-filter: blur(40px);
  box-shadow: 
    inset 0 0 60px rgba(0, 217, 142, 0.15),
    0 0 80px rgba(0, 217, 142, 0.1),
    0 20px 60px rgba(0, 0, 0, 0.5);
  animation: orb-float 8s ease-in-out infinite;
}
```

#### 2.3 Three.js micro-bundle (opcional, ~30KB)
Para animação interativa que reage ao mouse:
```typescript
// src/components/landing/glassy-orb.tsx
// Esfera de vidro refrativa com noise displacement
// Reage ao mouse com parallax
// Cores: #00D98E → #00FFB2 gradiente
```

### Arquivos
- `src/components/landing/glassy-orb.tsx` — NOVO
- `src/components/landing/hero.tsx` — Integrar orb
- `public/videos/orb-green.webm` — Asset de vídeo
- `src/app/globals.css` — Keyframes orb

---

## 📱 FASE 3 — Push Notifications

### Arquitetura

```
┌────────────┐     ┌──────────────┐     ┌───────────────┐
│  Frontend   │────▶│  Worker API  │────▶│  Web Push API │
│  Subscribe  │     │  /push/*     │     │  (VAPID)      │
└────────────┘     └──────────────┘     └───────────────┘
                          │
                    ┌─────▼─────┐
                    │  Neon DB  │
                    │  push_    │
                    │  subs     │
                    └───────────┘
```

### 3.1 Backend — Endpoints

| Endpoint | Método | Função |
|----------|--------|--------|
| `/api/v1/push/subscribe` | POST | Salvar subscription do usuário |
| `/api/v1/push/unsubscribe` | POST | Remover subscription |
| `/api/v1/push/send` | POST | Enviar notificação (admin/sistema) |
| `/api/v1/push/send-bulk` | POST | Enviar para múltiplos usuários |
| `/api/v1/push/test` | POST | Enviar teste para si mesmo |
| `/api/v1/push/preferences` | GET/PUT | Preferências do usuário |

### 3.2 Database — Tabelas

```sql
CREATE TABLE push_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  platform TEXT, -- 'android', 'ios', 'desktop'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE TABLE push_notifications_log (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  target_type TEXT, -- 'all', 'user', 'group'
  target_id TEXT,
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  sent_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE push_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  workout_reminders BOOLEAN DEFAULT true,
  payment_alerts BOOLEAN DEFAULT true,
  new_student_alerts BOOLEAN DEFAULT true,
  marketing BOOLEAN DEFAULT false,
  quiet_hours_start TIME, -- ex: 22:00
  quiet_hours_end TIME   -- ex: 07:00
);
```

### 3.3 Frontend — Componentes

```typescript
// src/components/pwa/push-permission.tsx
// Banner bonito pedindo permissão de notificação
// Aparece no momento certo (após 2ª visita ou ação relevante)

// src/hooks/use-push.ts
// usePushSubscription() — gerencia subscription
// usePushPreferences() — preferências do usuário

// src/components/dashboard/notification-settings.tsx
// UI para gerenciar preferências de notificação
```

### 3.4 Service Worker — Push Handler

```javascript
// Em sw.js — handler de push
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/dashboard' },
    actions: data.actions || [],
    tag: data.tag || 'default',
    renotify: true
  }
  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data.url
  event.waitUntil(clients.openWindow(url))
})
```

### 3.5 VAPID Keys
```bash
# Gerar VAPID keys (uma vez)
npx web-push generate-vapid-keys
# Armazenar como secrets no Cloudflare:
# VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:)
```

### Tipos de Notificações
| Tipo | Quando | Quem recebe |
|------|--------|-------------|
| Novo treino atribuído | Personal cria treino | Aluno |
| Pagamento vencendo | 3 dias antes | Aluno |
| Pagamento recebido | Webhook Asaas | Personal |
| Novo aluno cadastrado | Aluno aceita convite | Personal |
| Avaliação agendada | 1 dia antes | Aluno |
| Lembrete de treino | Configurável | Aluno |
| Sistema/Marketing | Admin envia | Todos |

---

## 🔐 FASE 4 — Biometric Auth (Passkeys/WebAuthn)

### Conceito
Login com **Face ID, Touch ID, Windows Hello** — sem digitar senha. Igual apps nativos.

### 4.1 Backend

```typescript
// workers/api/auth.ts — Novos endpoints:

// POST /api/v1/auth/passkey/register — Inicia registro de passkey
// Gera challenge, salva em KV (5min TTL)
// Retorna publicKeyCredentialCreationOptions

// POST /api/v1/auth/passkey/register/complete — Finaliza registro
// Verifica challenge, salva credencial no DB

// POST /api/v1/auth/passkey/login — Inicia login com passkey
// Gera challenge, busca credenciais do usuário

// POST /api/v1/auth/passkey/login/complete — Finaliza login
// Verifica assertion, gera JWT tokens

// DELETE /api/v1/auth/passkey/:id — Remove passkey
```

### 4.2 Database

```sql
CREATE TABLE user_passkeys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INT DEFAULT 0,
  device_name TEXT, -- "MacBook Pro Touch ID"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);
```

### 4.3 Frontend

```typescript
// src/hooks/use-passkeys.ts
// useRegisterPasskey() — registrar nova passkey
// useLoginWithPasskey() — login biométrico
// usePasskeys() — listar passkeys do usuário

// src/components/auth/passkey-login.tsx
// Botão "Entrar com Face ID / Touch ID"
// Ícone de biometria animado

// src/components/profile/passkey-manager.tsx
// Listar, nomear e remover passkeys
```

### 4.4 Fluxo de Login

```
1. Usuário abre app → detecta passkey salva
2. Mostra botão "Entrar com biometria" (ícone de fingerprint/face)
3. Clica → navigator.credentials.get()
4. Sistema pede Face ID / Touch ID / Windows Hello
5. Autenticação local no device → assertion enviada ao backend
6. Backend verifica → emite JWT → logado em <1 segundo
```

---

## 🏷️ FASE 5 — App Badges & Shortcuts Avançados

### 5.1 App Badge (notificação no ícone)

```typescript
// Badge API — mostrar número de notificações no ícone do app
if ('setAppBadge' in navigator) {
  navigator.setAppBadge(unreadCount) // número
  navigator.clearAppBadge() // limpar
}
```

### 5.2 Shortcuts dinâmicos

```json
// manifest.json — atalhos com ações rápidas
{
  "shortcuts": [
    {
      "name": "Criar Treino",
      "short_name": "Novo Treino",
      "url": "/dashboard/workouts/create",
      "icons": [{ "src": "/icons/shortcut-workout.png", "sizes": "96x96" }]
    },
    {
      "name": "Meus Alunos",
      "url": "/dashboard/students",
      "icons": [{ "src": "/icons/shortcut-students.png", "sizes": "96x96" }]
    },
    {
      "name": "Pagamentos",
      "url": "/dashboard/payments",
      "icons": [{ "src": "/icons/shortcut-payments.png", "sizes": "96x96" }]
    },
    {
      "name": "Criar Avaliação",
      "url": "/dashboard/assessments/create",
      "icons": [{ "src": "/icons/shortcut-assessment.png", "sizes": "96x96" }]
    }
  ]
}
```

---

## 🔗 FASE 6 — Web Share Target

### Conceito
Permitir que outros apps **compartilhem conteúdo** diretamente para o VFIT (ex: compartilhar vídeo de exercício do YouTube, imagem de progresso, etc.)

### 6.1 Manifest

```json
{
  "share_target": {
    "action": "/dashboard/share-receive",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "media",
          "accept": ["image/*", "video/*"]
        }
      ]
    }
  }
}
```

### 6.2 Share receiver page

```typescript
// src/app/dashboard/share-receive/page.tsx
// Recebe o conteúdo compartilhado
// Detecta tipo: imagem → upload para avaliação, URL → salvar referência
```

---

## 🔄 FASE 7 — Background Sync & Periodic Sync

### 7.1 Background Sync
Quando o usuário está offline e faz ações (criar treino, registrar presença), salvar localmente e sincronizar quando voltar online.

```javascript
// sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    event.waitUntil(syncPendingWorkouts())
  }
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncPendingAttendance())
  }
})

// Frontend — registrar sync
async function saveWorkoutOffline(workout) {
  await saveToIndexedDB('pending-workouts', workout)
  const reg = await navigator.serviceWorker.ready
  await reg.sync.register('sync-workouts')
}
```

### 7.2 Periodic Background Sync
Atualizar dados em background (a cada X horas).

```javascript
// Registrar
const reg = await navigator.serviceWorker.ready
await reg.periodicSync.register('refresh-dashboard', {
  minInterval: 4 * 60 * 60 * 1000 // 4 horas
})

// sw.js
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-dashboard') {
    event.waitUntil(refreshDashboardCache())
  }
})
```

### 7.3 IndexedDB Store

```typescript
// src/lib/idb-store.ts
// Wrapper tipado para IndexedDB
// Stores: pending-workouts, pending-attendance, cached-students, cached-payments
```

---

## 📊 FASE 8 — PWA Analytics Dashboard

### Métricas coletadas
| Métrica | Como |
|---------|------|
| Instalações | `appinstalled` event |
| Plataformas | `navigator.userAgent` parse |
| Push subscriptions | Contagem no DB |
| Uso offline | SW interceptou request sem rede |
| App opens (standalone) | `display-mode: standalone` check |
| Retention | Última visita do usuário |
| SW version | `/sw.js` GET_VERSION |

### Backend

```typescript
// POST /api/v1/analytics/pwa/event — Registra evento
// GET /api/v1/analytics/pwa/stats — Stats para admin
// GET /api/v1/analytics/pwa/installs — Lista de instalações
```

### Database

```sql
CREATE TABLE pwa_analytics (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'install', 'uninstall', 'push_subscribe', 'push_click', 'offline_use', 'app_open'
  user_id TEXT,
  platform TEXT,
  browser TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Admin UI
- Gráficos de instalações por dia/semana
- Breakdown por plataforma (iOS/Android/Desktop)
- Push: subscriptions, delivery rate, click rate
- Offline usage metrics

---

## ⚙️ FASE 9 — Admin PWA Management Panel

### Nova seção no Admin: `/dashboard/admin/pwa`

#### 9.1 Tabs do painel

| Tab | Funcionalidade |
|-----|---------------|
| **Geral** | Toggle PWA ativo, nome do app, description, theme colors, orientation |
| **Instalação** | Configurar banner (delay, texto, cooldown), toggle por plataforma |
| **Notificações** | Enviar push, agendar, ver histórico, gerenciar templates |
| **Manifest** | Editor visual do manifest (ícones, screenshots, shortcuts) |
| **Service Worker** | Ver versão, forçar update, cache stats, limpar caches |
| **Analytics** | Dashboard com métricas PWA |
| **Passkeys** | Ver passkeys registradas, revogar |
| **Debug** | Checklist de PWA health, teste de instalação |

#### 9.2 Configurações persistidas

```sql
CREATE TABLE pwa_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exemplos de keys:
-- 'install_banner' → { enabled: true, delay_ms: 4000, cooldown_hours: 12, text: {...} }
-- 'push' → { enabled: true, vapid_public: '...', quiet_hours: true }
-- 'manifest_overrides' → { theme_color: '#00D98E', ... }
-- 'sw_config' → { cache_version: 'v4', max_dynamic: 100 }
```

#### 9.3 API Endpoints

```
GET/PUT  /api/v1/admin/pwa/settings
POST     /api/v1/admin/pwa/push/send
GET      /api/v1/admin/pwa/push/history
GET      /api/v1/admin/pwa/analytics
POST     /api/v1/admin/pwa/cache/clear
POST     /api/v1/admin/pwa/sw/force-update
GET      /api/v1/admin/pwa/passkeys
DELETE   /api/v1/admin/pwa/passkeys/:id
```

---

## 📴 FASE 10 — Offline-First Architecture

### 10.1 Service Worker Avançado (v4)

```javascript
// Estratégias por rota:
// /dashboard → Network-first (15s timeout) → Cache → Offline shell
// /api/v1/students → Stale-while-revalidate → IndexedDB fallback
// /api/v1/workouts → Cache-first (atualiza em background)
// Static assets → Cache-first (immutable)

// Offline Queue:
// Ações feitas offline são salvas em IndexedDB
// Sync automático quando rede volta
// Indicador visual de "ações pendentes"
```

### 10.2 Offline Page rica

```typescript
// src/app/offline/page.tsx
// Não apenas "Você está offline"
// Mostrar: dados cacheados, treinos salvos, último estado do dashboard
// Permitir: navegar dados offline, preparar treinos, ver histórico
```

### 10.3 Cache Inteligente

```typescript
// src/lib/smart-cache.ts
// Pré-cachear dados do usuário logado:
// - Lista de alunos
// - Treinos ativos
// - Avaliações recentes
// - Perfil do personal
// Atualizar em background quando online
```

---

## 🎯 FASE 11 — Rich Install UI (Chrome 120+)

### Conceito
Chrome 120+ suporta **Rich Install UI** com screenshots, description e rating no prompt de instalação. Nosso manifest já tem screenshots, mas precisamos de screenshots reais e bonitas.

### Implementação

```bash
# Gerar screenshots reais das telas do app
# 390x844 (narrow) — mobile views
# 1280x800 (wide) — desktop views

# Screenshots necessárias:
# 1. Dashboard do personal (mobile)
# 2. Lista de treinos (mobile)
# 3. Criar treino com IA (mobile)
# 4. Dashboard completo (desktop)
# 5. Gestão de alunos (desktop)
```

### Manifest atualizado

```json
{
  "screenshots": [
    { "src": "/screenshots/mobile-dashboard.png", "sizes": "390x844", "form_factor": "narrow", "label": "Dashboard com métricas em tempo real" },
    { "src": "/screenshots/mobile-workouts.png", "sizes": "390x844", "form_factor": "narrow", "label": "Treinos criados com Inteligência Artificial" },
    { "src": "/screenshots/mobile-students.png", "sizes": "390x844", "form_factor": "narrow", "label": "Gestão completa de alunos" },
    { "src": "/screenshots/desktop-dashboard.png", "sizes": "1280x800", "form_factor": "wide", "label": "Visão completa do dashboard" },
    { "src": "/screenshots/desktop-workouts.png", "sizes": "1280x800", "form_factor": "wide", "label": "Crie treinos personalizados com IA" }
  ]
}
```

---

## 🔗 FASE 12 — Dedicated Install Page

### Conceito (estilo Progressier)
Página dedicada `vfit.app.br/install` que simula uma app store:

```
┌─────────────────────────────────┐
│  [Logo]  VFIT            │
│  ★★★★★ 5.0 (127 avaliações)    │
│                                 │
│  [========== Instalar ==========]│
│                                 │
│  📸 Screenshots carousel        │
│  📝 Descrição completa          │
│  ✅ Features list               │
│  📊 Stats (10k+ usuários)       │
│  💬 Reviews de usuários         │
│                                 │
│  Compatível com: Chrome, Safari,│
│  Edge, Samsung Internet         │
└─────────────────────────────────┘
```

### Implementação
```typescript
// src/app/install/page.tsx
// Landing page estilo app store
// Detecta plataforma → CTA contextual
// Link: vfit.app.br/install
```

---

## 📱 FASE 13 — QR Code Install

### Conceito
Para usuários desktop, mostrar QR code que abre a página de instalação no celular.

```typescript
// Quando detecta desktop + mobile-only context:
// Gera QR code com URL: vfit.app.br/install?utm_source=qr
// Usuário escaneia → abre install page no celular
// Biblioteca: qrcode.react (~5KB)
```

---

## 🔒 FASE 14 — Screen Wake Lock & Fullscreen

### Screen Wake Lock
Impedir que a tela apague durante treino ativo:

```typescript
// src/hooks/use-wake-lock.ts
export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false)
  
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      const lock = await navigator.wakeLock.request('screen')
      setIsLocked(true)
      lock.addEventListener('release', () => setIsLocked(false))
    }
  }
  
  return { isLocked, requestWakeLock, releaseWakeLock }
}
// Ativar automaticamente na tela de treino ativo
```

### Fullscreen API
Modo imersivo para demonstração de exercícios com vídeo:

```typescript
// Botão fullscreen nos vídeos de exercícios
document.documentElement.requestFullscreen()
```

---

## 📂 FASE 15 — File System Access (Futura)

### Conceito
Acesso direto ao sistema de arquivos para:
- Exportar relatórios de avaliação como PDF
- Salvar treinos como arquivo
- Importar planilhas de alunos

```typescript
// File System Access API
const handle = await window.showSaveFilePicker({
  suggestedName: 'avaliacao-joao.pdf',
  types: [{ accept: { 'application/pdf': ['.pdf'] } }]
})
```

---

## 📳 FASE 16 — Vibration & Haptic Feedback (Futura)

### Conceito
Feedback tátil em ações importantes:

```typescript
// Cronômetro de descanso acabou
navigator.vibrate([200, 100, 200])

// Treino concluído
navigator.vibrate([100, 50, 100, 50, 300])

// Erro
navigator.vibrate(300)
```

---

## 🗓️ Cronograma Sugerido

| Semana | Fases | Entregáveis |
|--------|-------|-------------|
| **Semana 1** | Fase 1 + 2 | Fix install nativo + Glassy orb + Deploy |
| **Semana 2** | Fase 3 | Push notifications backend + frontend + SW |
| **Semana 3** | Fase 4 + 5 | Biometric auth + App badges + Shortcuts |
| **Semana 4** | Fase 6 + 7 | Share target + Background sync |
| **Semana 5** | Fase 8 + 9 | Analytics dashboard + Admin PWA panel |
| **Semana 6** | Fase 10 + 11 | Offline-first + Rich install UI |
| **Semana 7** | Fase 12 + 13 + 14 | Install page + QR code + Wake lock |
| **Semana 8** | Fase 15 + 16 | File system + Vibration + Polish |

---

## 🛠️ Stack Técnica Necessária

### Dependências Novas
```json
{
  "web-push": "^3.6.0",        // Push notifications (backend)
  "@simplewebauthn/server": "^10", // WebAuthn server (backend)
  "@simplewebauthn/browser": "^10", // WebAuthn client
  "idb-keyval": "^6.2.0",      // IndexedDB wrapper
  "qrcode.react": "^4.0.0"     // QR code component
}
```

### Secrets Cloudflare (Novos)
```
VAPID_PUBLIC_KEY    — Chave pública VAPID
VAPID_PRIVATE_KEY   — Chave privada VAPID
VAPID_SUBJECT       — mailto:contato@vfit.app.br
WEBAUTHN_RP_ID      — vfit.app.br
WEBAUTHN_RP_NAME    — VFIT
```

### Migrações SQL (Novas tabelas)
```
push_subscriptions
push_notifications_log
push_preferences
user_passkeys
pwa_analytics
pwa_settings
```

---

## ✅ Checklist Progressier vs VFIT

| Feature Progressier | Status VFIT | Fase |
|---------------------|-------------------|------|
| Universal Installation | ⬜ Fix needed | 1 |
| Push Notifications | ⬜ Não implementado | 3 |
| Installation Page | ⬜ Não implementado | 12 |
| App Reviews/Wall of Love | ⬜ Futuro | - |
| PWA Analytics | ⬜ Não implementado | 8 |
| In-App Promotion | ✅ Banner existe | 1 |
| Web Share Target | ⬜ Não implementado | 6 |
| Service Worker | ✅ v3 funcional | 10 |
| Install Button | ✅ Implementado | 1 |
| Biometric Auth | ⬜ Não implementado | 4 |
| QR Code Install | ⬜ Não implementado | 13 |
| Offline Support | ⚡ Básico | 10 |
| App Badges | ⬜ Não implementado | 5 |
| Background Sync | ⚡ Básico no SW | 7 |

---

> **Próximo passo:** Fase 1 — Fix da instalação nativa + debug panel
> Diga "Vamos" para iniciar a implementação fase por fase.
