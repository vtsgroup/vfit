# 📸 MEDIA STRATEGY — Cloudflare Media Stack

> **v1.0** · Criado 01/03/2026 · VFIT SaaS

---

## 🎯 Visão Geral

O VFIT utiliza **4 camadas** de entrega de mídia, todas na edge Cloudflare:

| Camada | Serviço | Domínio | Caso de Uso |
|--------|---------|---------|-------------|
| **1. Pages (Static)** | CF Pages CDN | `iapersonal.app.br` | Assets estáticos do build (ícones, OG images, bg videos ≤1MB) |
| **2. R2 (Object Storage)** | CF R2 + Custom Domain | `images.iapersonal.app.br` / `videos.iapersonal.app.br` | Uploads de usuários (fotos, vídeos de exercícios, PDFs) |
| **3. Stream (Video)** | CF Stream | `stream.iapersonal.app.br` *(a configurar)* | Vídeos de exercícios com adaptive bitrate (HLS/DASH) |
| **4. Images (Transform)** | CF Images | via R2 ou transform rules | Otimização on-the-fly (resize, WebP/AVIF, variants) |

---

## 📊 Matriz de Decisão — Quando Usar Cada Serviço

### Por Tipo de Conteúdo

| Conteúdo | Serviço | Motivo | PWA Offline? |
|----------|---------|--------|:------------:|
| **Ícones/favicons** | Pages (public/) | ≤50KB, estático, cache permanente | ✅ SW precache |
| **OG images** | Pages (public/og/) | Estáticos, SEO | ❌ Não necessário |
| **Hero/BG video** (auth page) | Pages (public/videos/) | ≤1MB, Ken Burns loop, precisa carregamento instantâneo | ✅ SW precache |
| **Logo/brand assets** | Pages (public/images/) | Estáticos, raro mudar | ✅ SW precache |
| **Profile photos** | R2 (R2_IMAGES) | Upload do usuário, ~50-500KB, variam | ✅ Runtime cache |
| **Fotos de avaliação** | R2 (R2_IMAGES) | Upload do personal, ~200KB-2MB | ✅ Runtime cache |
| **Thumbs de exercícios** | R2 (R2_IMAGES) + Images transform | Geradas de vídeo, precisa múltiplos tamanhos | ✅ Runtime cache |
| **Vídeos de exercícios** (curtos, ≤30s) | R2 (R2_VIDEOS) | Upload direto, ≤10MB, sem necessidade de adaptive bitrate | ✅ Runtime cache |
| **Vídeos de exercícios** (longos, >30s) | **Stream** | Adaptive bitrate (HLS), múltiplas qualidades, analytics | ⚠️ Parcial* |
| **Vídeos de treino completo** | **Stream** | Podem ser 5-30min, precisa seek rápido e adaptação de banda | ⚠️ Parcial* |
| **PDFs de avaliação** | R2 (R2_IMAGES) | Gerados no backend, ~100KB-1MB | ✅ Runtime cache |
| **Blog images** | Pages (public/blog/) | Estáticas, geradas no build | ✅ SW precache |

> *⚠️ **PWA + Stream**: Stream entrega via HLS (m3u8 + chunks ts). O SW pode cachear chunks já assistidos para replay offline, mas não pré-cachear o stream inteiro. Para suporte offline completo de exercícios, manter uma cópia R2 como fallback.*

---

## 🪣 Camada 1: Pages (Static Assets)

**Quando usar:** Assets que fazem parte do build, não mudam entre deploys.

```
public/
├── favicons/          # Ícones (precache)
├── icons/             # PWA icons (precache)
├── images/            # Hero, patterns, brand (precache)
├── videos/            
│   └── gym-bg.mp4     # Auth BG video — 830KB, 720p, 16s Ken Burns (precache)
├── og/                # Open Graph images
├── blog/              # Blog images
└── manifest.json      # PWA manifest
```

**Cache strategy:** Service Worker precache (install event). Esses assets mudam somente no build.

**Limites:** Pages free = 25MB max por arquivo, 20K files, 500 deploys/mês.

---

## 🪣 Camada 2: R2 (Object Storage)

**Quando usar:** Uploads de usuários e conteúdo dinâmico que precisa de acesso público.

### Buckets

| Bucket | Binding | Domínio Custom | Status |
|--------|---------|---------------|--------|
| `personal-ia-videos` | `R2_VIDEOS` | `videos.iapersonal.app.br` | ✅ Ativo (TLS 1.2, CORS configurado) |
| `personal-ia-images` | `R2_IMAGES` | `images.iapersonal.app.br` | ✅ Ativo (TLS 1.2, CORS configurado) |

### Estrutura de Keys

```
# R2_IMAGES
profiles/{userId}/photo.{ext}           # Profile photos
assessments/{assessmentId}/{photoType}.{ext}  # Body photos
exercises/{exerciseId}/thumb.{ext}      # Exercise thumbnails
logos/{personalId}/logo.{ext}           # Personal brand logo
pdfs/assessments/{assessmentId}.pdf     # Assessment PDFs

# R2_VIDEOS
exercises/{exerciseId}/video.mp4        # Exercise demo videos (curtos, ≤10MB)
exercises/{exerciseId}/video_vertical.mp4  # Versão vertical 9:16
```

### Cache Strategy PWA

```javascript
// sw.js — Runtime caching para R2
registerRoute(
  ({url}) => url.hostname.includes('images.iapersonal.app.br') ||
             url.hostname.includes('videos.iapersonal.app.br'),
  new CacheFirst({
    cacheName: 'media-r2',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 dias
      new RangeRequestsPlugin(), // Suporte a range requests (video seek)
    ],
  })
);
```

### Pricing R2

| Item | Valor |
|------|-------|
| Storage | $0.015/GB/mês (10GB free) |
| Class A ops (PUT/POST) | $4.50/milhão (1M free) |
| Class B ops (GET) | $0.36/milhão (10M free) |
| Egress | **$0 (grátis!)** — principal vantagem |

---

## 📹 Camada 3: Cloudflare Stream

**Quando usar:** Vídeos de exercícios que precisam de adaptive bitrate, múltiplas qualidades, ou são mais longos (>30s).

### Vantagens sobre R2 para Vídeo

| Feature | R2 | Stream |
|---------|:--:|:------:|
| Adaptive bitrate (HLS/DASH) | ❌ | ✅ |
| Múltiplas qualidades (360p-1080p) | ❌ | ✅ Auto |
| Player embeddable | ❌ | ✅ |
| Thumbnails automáticos | ❌ | ✅ |
| Analytics (views, buffering) | ❌ | ✅ |
| Signed URLs (DRM-lite) | Manual | ✅ Built-in |
| Custo de storage | $0.015/GB | $5/1000min |
| Custo de delivery | $0 | $1/1000min viewed |

### Quando Usar Stream vs R2 para Vídeos

| Cenário | Escolha | Motivo |
|---------|---------|--------|
| Vídeo de exercício ≤30s, ≤10MB | **R2** | Simples, barato, PWA offline total |
| Vídeo de exercício >30s ou >10MB | **Stream** | Adaptive bitrate, carregamento progressivo |
| Vídeo de treino completo (5-30min) | **Stream** | Essencial para seek rápido, economia de banda |
| Background video decorativo (auth) | **Pages** | Estático, ≤1MB, precisa de carregamento instantâneo |
| Vídeo pré-gravado/tutorial | **Stream** | Qualidade adaptativa, analytics |

### Setup Stream (A Configurar)

```toml
# wrangler.toml — Binding para Stream (quando ativado)
# [vars]
# CF_STREAM_ACCOUNT_ID = "b0bf95d0fabb322ac3df37bd84ec0c77"
# CF_STREAM_API_TOKEN via secret
```

```typescript
// workers/types.ts — Futuro
CF_STREAM_ACCOUNT_ID?: string
CF_STREAM_API_TOKEN?: string
CF_STREAM_SUBDOMAIN?: string  // customer-xxx.cloudflarestream.com
```

### API Stream (Upload)

```typescript
// Upload via API (TUS ou direct creator upload)
const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`

// Direct creator upload (melhor para mobile)
const response = await fetch(uploadUrl, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiToken}` },
  body: JSON.stringify({
    maxDurationSeconds: 300, // 5min max
    meta: { exerciseId, personalId },
    requireSignedURLs: true,
  })
})
// Retorna uploadURL para o cliente fazer upload direto (sem passar pelo Worker)
```

### Reprodução Stream (Frontend)

```tsx
// Player iframe (simples)
<iframe
  src={`https://customer-${subdomain}.cloudflarestream.com/${videoId}/iframe`}
  allow="autoplay; fullscreen"
  style={{ border: 'none', width: '100%', aspectRatio: '16/9' }}
/>

// HLS.js (custom player, melhor para PWA)
import Hls from 'hls.js'
const hls = new Hls()
hls.loadSource(`https://customer-${subdomain}.cloudflarestream.com/${videoId}/manifest/video.m3u8`)
hls.attachMedia(videoElement)
```

### Pricing Stream

| Item | Valor |
|------|-------|
| Storage | $5.00/1.000 minutos armazenados/mês |
| Delivery | $1.00/1.000 minutos assistidos/mês |
| Encoding | Incluído no storage |
| Min. mensal | Sem mínimo |

> **Estimativa**: 500 exercícios × 30s = 250 min storage = ~$1.25/mês. 1000 views/dia × 30s = 500 min viewed = ~$0.50/mês. **Total: ~$1.75/mês**.

---

## 🖼️ Camada 4: Cloudflare Images

**Quando usar:** Quando precisa de otimização on-the-fly de imagens (resize, format conversion, variants).

### Abordagens

#### Opção A: Cloudflare Images (Standalone)

- Upload via API → retorna image ID
- Entrega via `https://imagedelivery.net/{accountHash}/{imageId}/{variant}`
- Variants configuráveis: `thumbnail` (150x150), `medium` (600x600), `large` (1200x1200)
- Conversão automática WebP/AVIF

| Item | Valor |
|------|-------|
| Storage | $5.00/100K images/mês |
| Delivery | Incluído |
| Transformations | Ilimitadas |

#### Opção B: Image Resizing (via R2 + Transform Rules)

- Mantém imagens no R2
- Usa Image Resizing na edge: `https://images.iapersonal.app.br/cdn-cgi/image/width=300,quality=80/profiles/user123/photo.jpg`
- Sem migração de storage necessária

| Item | Valor |
|------|-------|
| Transformations | $0.50/1.000 unique transformations |
| Após 5.000 | Grátis (cache) |

#### Recomendação: **Opção B** (Image Resizing via R2)

- ✅ Já temos R2 com as imagens
- ✅ Sem duplicação de storage
- ✅ Variants sob demanda via URL params
- ✅ Cache automático na edge
- ✅ Sem migração

### Uso no Frontend

```typescript
// Utility function
function cfImage(url: string, opts: { width?: number; height?: number; quality?: number; format?: 'webp' | 'avif' } = {}) {
  const params = []
  if (opts.width) params.push(`width=${opts.width}`)
  if (opts.height) params.push(`height=${opts.height}`)
  if (opts.quality) params.push(`quality=${opts.quality}`)
  if (opts.format) params.push(`format=${opts.format}`)
  params.push('fit=cover')
  
  // Para R2 custom domains com Image Resizing habilitado
  const url = new URL(originalUrl)
  return `${url.origin}/cdn-cgi/image/${params.join(',')}${url.pathname}`
}

// Uso
<img src={cfImage(profilePhotoUrl, { width: 150, format: 'webp' })} />
<img src={cfImage(assessmentPhotoUrl, { width: 800, quality: 85 })} />
```

---

## 📱 Estratégia PWA Offline

### Categorias de Cache

| Prioridade | Conteúdo | Estratégia | Max Size |
|:----------:|----------|-----------|----------|
| 🔴 **P0** | App shell (HTML/CSS/JS) | Precache | ~5MB |
| 🔴 **P0** | Auth BG video | Precache | 830KB |
| 🟡 **P1** | Profile photos | CacheFirst, 30d | ~50MB |
| 🟡 **P1** | Exercise thumbnails | CacheFirst, 30d | ~100MB |
| 🟡 **P1** | Exercise videos (R2, ≤10MB) | CacheFirst, 14d | ~500MB |
| 🟢 **P2** | Stream video chunks (HLS .ts) | CacheFirst, 7d | ~200MB |
| 🟢 **P2** | PDF assessments | CacheFirst, 30d | ~50MB |
| ⚪ **P3** | Blog images | StaleWhileRevalidate | ~20MB |

### Service Worker Routing

```javascript
// sw.js — Estratégia por domínio/path

// P0: App Shell — Precache (install event)
precacheAndRoute(self.__WB_MANIFEST)

// P0: Static media (Pages CDN)
registerRoute(
  ({url}) => url.pathname.startsWith('/videos/') || url.pathname.startsWith('/images/'),
  new CacheFirst({ cacheName: 'static-media', plugins: [expiration(365)] })
)

// P1: R2 Images (profiles, assessments, thumbs)
registerRoute(
  ({url}) => url.hostname === 'images.iapersonal.app.br',
  new CacheFirst({
    cacheName: 'r2-images',
    plugins: [expiration(30, 500), rangeRequests()],
  })
)

// P1: R2 Videos (exercise clips ≤10MB)
registerRoute(
  ({url}) => url.hostname === 'videos.iapersonal.app.br',
  new CacheFirst({
    cacheName: 'r2-videos',
    plugins: [expiration(14, 100), rangeRequests()],
  })
)

// P2: Stream chunks (HLS .ts segments)
registerRoute(
  ({url}) => url.hostname.includes('cloudflarestream.com') && url.pathname.endsWith('.ts'),
  new CacheFirst({
    cacheName: 'stream-chunks',
    plugins: [expiration(7, 200)],
  })
)

// P2: Stream manifests (always fresh)
registerRoute(
  ({url}) => url.hostname.includes('cloudflarestream.com') && url.pathname.endsWith('.m3u8'),
  new NetworkFirst({ cacheName: 'stream-manifests' })
)
```

### Offline Fallback para Vídeos

```typescript
// Se Stream offline → tentar R2 fallback → tentar cache → mostrar thumbnail + "Sem conexão"
async function getExerciseVideo(exerciseId: string): Promise<string> {
  const streamUrl = `https://customer-${subdomain}.cloudflarestream.com/${streamId}/manifest/video.m3u8`
  const r2Url = `https://videos.iapersonal.app.br/exercises/${exerciseId}/video.mp4`
  
  // 1. Try Stream (adaptive, melhor qualidade)
  if (navigator.onLine) return streamUrl
  
  // 2. Try R2 cache (offline completo)
  const r2Cache = await caches.match(r2Url)
  if (r2Cache) return r2Url
  
  // 3. Try Stream cache (chunks parciais)
  const streamCache = await caches.match(streamUrl)
  if (streamCache) return streamUrl
  
  // 4. Fallback: thumbnail estática
  return `https://images.iapersonal.app.br/exercises/${exerciseId}/thumb.webp`
}
```

---

## 🔧 Setup Checklist

### ✅ Já Configurado
- [x] R2 bucket `personal-ia-videos` (binding R2_VIDEOS)
- [x] R2 bucket `personal-ia-images` (binding R2_IMAGES)
- [x] Workers types com R2Bucket bindings
- [x] API endpoints para upload (exercise-media.ts, users.ts, assessments.ts)
- [x] Auth BG video em Pages (public/videos/gym-bg.mp4)

### ⬜ Pendente (Fase Atual)
- [x] **R2 Public Access — images**: `images.iapersonal.app.br` habilitado (12/03/2026)
  ```bash
  # Fix aplicado via CLI:
  npx wrangler r2 bucket domain remove personal-ia-images --domain images.iapersonal.app.br --force
  npx wrangler r2 bucket domain add personal-ia-images --domain images.iapersonal.app.br --zone-id 71e8d150d12015b016231950337b075e --min-tls 1.2 --force
  # CORS configurado via: config/r2-cors.json
  npx wrangler r2 bucket cors set personal-ia-images --file config/r2-cors.json
  ```
- [x] **R2 Public Access — videos**: `videos.iapersonal.app.br` habilitado (12/03/2026)
  ```bash
  # Mesmo procedimento do images:
  npx wrangler r2 bucket domain remove personal-ia-videos --domain videos.iapersonal.app.br --force
  npx wrangler r2 bucket domain add personal-ia-videos --domain videos.iapersonal.app.br --zone-id 71e8d150d12015b016231950337b075e --min-tls 1.2 --force
  # CORS: config/r2-cors-videos.json (inclui Content-Range para streaming)
  npx wrangler r2 bucket cors set personal-ia-videos --file config/r2-cors-videos.json
  ```
- [ ] **Wrangler re-login**: Conta atual diferente do projeto
  ```bash
  npx wrangler logout
  npx wrangler login  # Logar com vts@victor.pt → account b0bf95d0fabb322ac3df37bd84ec0c77
  ```
- [ ] **R2 CORS**: Configurar CORS nos buckets para o domínio iapersonal.app.br
- [ ] **Image Resizing**: Habilitar no CF Dashboard > Speed > Optimization > Image Resizing

### ⬜ Futuro (Sprint E — Exercícios)
- [ ] **Cloudflare Stream**: Ativar e configurar subdomain
- [ ] **Stream API Token**: Criar e adicionar como secret
- [ ] **Stream upload endpoint**: Implementar em `workers/api/exercise-media.ts`
- [ ] **Stream player**: Integrar HLS.js no frontend
- [ ] **PWA caching**: Implementar estratégias por camada no sw.js
- [ ] **Offline sync**: Exercícios marcados como "favoritos" → download R2 para cache offline

---

## 💰 Estimativa de Custos

### Cenário: 100 personals, 500 alunos, 1000 exercícios

| Serviço | Uso Estimado | Custo/Mês |
|---------|-------------|-----------|
| **R2 Storage** | ~5GB (fotos + PDFs + vídeos curtos) | $0.075 (dentro do free tier) |
| **R2 Ops** | ~500K GET + 50K PUT | $0 (dentro do free tier) |
| **Stream Storage** | ~500 min (1000 exercícios × 30s) | $2.50 |
| **Stream Delivery** | ~10.000 min/mês viewed | $10.00 |
| **Image Resizing** | ~20K transformations | $10.00 |
| **Total** | | **~$22.50/mês** |

> Scaling: custo cresce linearmente com visualizações. A 10x scale: ~$150/mês.

---

## 📌 Regras Rápidas

1. **Asset estático ≤1MB** → `public/` (Pages CDN, precache PWA)
2. **Upload de usuário (imagem)** → R2_IMAGES + Image Resizing
3. **Upload de usuário (vídeo ≤10MB, ≤30s)** → R2_VIDEOS (PWA offline total)
4. **Vídeo longo (>30s ou >10MB)** → Stream (adaptive bitrate, analytics)
5. **Thumbnail de vídeo** → R2_IMAGES (gerado no upload/encoding)
6. **Tudo precisa de fallback offline** → Cache SW com strategy por tipo
7. **Stream + R2 dual-store** para exercícios: Stream para playback online, R2 para offline
8. **NUNCA** hospedar vídeo de exercício em `public/` — R2 ou Stream
9. **NUNCA** servir imagens sem transform — usar Image Resizing ou variants
10. **SEMPRE** gerar thumbnails no upload — não depender de Stream para thumbs offline
