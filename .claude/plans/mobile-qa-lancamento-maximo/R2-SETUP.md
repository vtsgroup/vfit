# R2 SETUP — VFIT

> Configuração dos buckets R2 com domínio customizado para produção
> Última atualização: 2026-04-24

---

## Objetivo

Garantir entrega pública, segura e performática de mídia (imagens, vídeos, PDFs) via Cloudflare R2, com domínios dedicados:
- **Imagens:** https://images.vfit.app.br
- **Vídeos:** https://videos.vfit.app.br

---

## 1. Buckets R2

| Bucket         | Binding      | Domínio Custom           | Status   |
|---------------|--------------|--------------------------|----------|
| vfit-images   | R2_IMAGES    | images.vfit.app.br       | ✅ Ativo |
| vfit-videos   | R2_VIDEOS    | videos.vfit.app.br       | ✅ Ativo |

---

## 2. Configuração wrangler.toml

```toml
[[r2_buckets]]
binding = "R2_IMAGES"
bucket_name = "vfit-images"

[[r2_buckets]]
binding = "R2_VIDEOS"
bucket_name = "vfit-videos"

[vars]
R2_IMAGES_URL = "https://images.vfit.app.br"
R2_VIDEOS_URL = "https://videos.vfit.app.br"
```

---

## 3. Estrutura de Keys

### Imagens
- `profiles/{userId}/photo.{ext}`
- `assessments/{assessmentId}/{photoType}.{ext}`
- `exercises/{exerciseId}/thumb.{ext}`
- `logos/{personalId}/logo.{ext}`
- `pdfs/assessments/{assessmentId}.pdf`

### Vídeos
- `exercises/{exerciseId}/video.mp4`
- `exercises/{exerciseId}/video_vertical.mp4`

---

## 4. CORS e Segurança

- CORS liberado apenas para domínios do app (`*.vfit.app.br`)
- TLS 1.2 obrigatório
- URLs públicas, mas uploads/autenticação via backend

---

## 5. Cache e PWA

- Runtime caching via Service Worker (`media-r2`)
- Suporte a range requests para vídeos
- Expiração padrão: 30 dias

---

## 6. Referências
- `.claude/docs/MEDIA-STRATEGY.md`
- `.claude/docs/STACK.md`
- `wrangler.toml`

---

## 7. Status

- [x] Buckets criados e domínios ativos
- [x] Bindings e vars no wrangler.toml
- [x] CORS configurado
- [x] Documentação publicada (24/04/2026)
- [ ] Testes Playwright de entrega pública

---

## 8. Próximos Passos
- Validar uploads e downloads via API
- Garantir fallback offline PWA
- Auditar performance e billing
- Atualizar docs após QA
