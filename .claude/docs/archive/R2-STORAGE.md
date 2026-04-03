# ☁️ R2 Storage — Guia de Operações

> **Última atualização:** 12/03/2026 · v5.1.9
> **Account ID:** `b0bf95d0fabb322ac3df37bd84ec0c77`
> **Zone ID:** `71e8d150d12015b016231950337b075e` (iapersonal.app.br)

---

## 📦 Buckets

| Bucket | Binding | Custom Domain | TLS | CORS | Objetos | Tamanho |
|--------|---------|--------------|:---:|:----:|:-------:|:-------:|
| `personal-ia-images` | `R2_IMAGES` | `images.iapersonal.app.br` | 1.2 | ✅ | 24 | 16.3 MB |
| `personal-ia-videos` | `R2_VIDEOS` | `videos.iapersonal.app.br` | 1.2 | ✅ | — | — |

---

## 🗂️ Estrutura de Keys (Naming Convention)

### personal-ia-images
```
profiles/{userId}/{fileId}.{ext}         → Fotos de perfil (webp/jpg/png)
assessments/{assessmentId}/{fileId}.{ext} → Fotos de avaliação corporal
exercises/{exerciseId}/thumb.{ext}        → Thumbnails de exercícios
```

### personal-ia-videos
```
exercises/{exerciseId}/{fileId}.{ext}     → Vídeos de exercícios (≤10MB)
```

> **Regra de naming:** Sempre `{categoria}/{ownerId}/{fileId}.{ext}` — IDs são UUIDs v4 (via `generateId()`).

---

## 🔧 Comandos de Manutenção

### Listar domínios
```bash
npx wrangler r2 bucket domain list personal-ia-images
npx wrangler r2 bucket domain list personal-ia-videos
```

### Habilitar domínio custom (se `enabled: No`)
```bash
# 1. Remover domínio desabilitado
npx wrangler r2 bucket domain remove <bucket> --domain <domain> --force

# 2. Re-adicionar com TLS 1.2
npx wrangler r2 bucket domain add <bucket> --domain <domain> \
  --zone-id 71e8d150d12015b016231950337b075e --min-tls 1.2 --force

# 3. Verificar status
npx wrangler r2 bucket domain list <bucket>
# Esperar: enabled: Yes, ownership_status: active, ssl_status: active
```

### CORS
```bash
# Ver regras atuais
npx wrangler r2 bucket cors list <bucket>

# Aplicar config
npx wrangler r2 bucket cors set personal-ia-images --file config/r2-cors.json
npx wrangler r2 bucket cors set personal-ia-videos --file config/r2-cors-videos.json
```

### Info do bucket
```bash
npx wrangler r2 bucket info personal-ia-images
npx wrangler r2 bucket info personal-ia-videos
```

### Download de objeto (debug)
```bash
npx wrangler r2 object get personal-ia-images/profiles/{userId}/{fileId}.webp --file /tmp/test.webp
```

---

## 🔗 URLs Públicas

### Imagens
```
https://images.iapersonal.app.br/profiles/{userId}/{fileId}.webp
https://images.iapersonal.app.br/assessments/{assessmentId}/{fileId}.jpg
https://images.iapersonal.app.br/exercises/{exerciseId}/thumb.webp
```

### Image Resizing (via CF)
```
https://images.iapersonal.app.br/cdn-cgi/image/width=300,quality=80/profiles/{userId}/{fileId}.webp
```
> ⚠️ Image Resizing requer plano Pro+ no Cloudflare. Atualmente desabilitado — URLs diretas do R2.

### Vídeos
```
https://videos.iapersonal.app.br/exercises/{exerciseId}/{fileId}.mp4
```

---

## 🔐 CORS Configuration

### personal-ia-images (`config/r2-cors.json`)
```json
{
  "rules": [{
    "allowed": {
      "origins": ["https://iapersonal.app.br", "https://vfit.pages.dev", "http://localhost:3000"],
      "methods": ["GET", "HEAD"],
      "headers": ["*"]
    },
    "exposeHeaders": ["Content-Length", "Content-Type", "ETag"],
    "maxAgeSeconds": 86400
  }]
}
```

### personal-ia-videos (`config/r2-cors-videos.json`)
```json
{
  "rules": [{
    "allowed": {
      "origins": ["https://iapersonal.app.br", "https://vfit.pages.dev", "http://localhost:3000"],
      "methods": ["GET", "HEAD"],
      "headers": ["*"]
    },
    "exposeHeaders": ["Content-Length", "Content-Type", "Content-Range", "ETag"],
    "maxAgeSeconds": 86400
  }]
}
```

---

## 🐛 Troubleshooting

### Error 401 — "This bucket cannot be viewed"
**Causa:** Custom domain está `enabled: No`.
**Fix:** Remove + re-add o domínio (ver comandos acima).
**Verificação:** `curl -I https://images.iapersonal.app.br/` deve retornar 200 ou 404 (não 401).

### CORS errors no frontend
**Causa:** Bucket sem regra CORS ou origin não listada.
**Fix:** `npx wrangler r2 bucket cors set <bucket> --file config/r2-cors.json`

### SSL pending
**Causa:** Normal após adicionar domínio. Propaga em 1-5 minutos.
**Verificação:** `npx wrangler r2 bucket domain list <bucket>` → `ssl_status: active`

---

## 📋 Histórico

| Data | Ação | Detalhe |
|------|------|---------|
| 09/02/2026 | Buckets criados | `personal-ia-images` + `personal-ia-videos` |
| 10/03/2026 | DNS configurado | CNAMEs para `images.` e `videos.iapersonal.app.br` |
| 12/03/2026 | **Public Access habilitado** | Domínios re-adicionados com `enabled: Yes`, TLS 1.2, CORS configurado |
