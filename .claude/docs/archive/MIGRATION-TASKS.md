# Tarefas Pendentes — Migração de Domínio

> **Criado:** 10/03/2026 · **Domínio final:** `iapersonal.app.br`  
> **Status:** Quase concluído — falta limpeza de referências no código

---

## Contexto

| Domínio | Destino | Status |
|---------|---------|--------|
| `iapersonal.app.br` | **Domínio principal** (produção) | ✅ Zona `active` · NS apontado · Performance configurada |
| `iapersonal.victor.pt` | **Descontinuado** — era temporário | ✅ Removido (Pages + DNS + Turnstile) |
| `vfit.app.br` | **Descontinuado** — página estática | ✅ Concluído |

---

## 1. ~~Apontar NS do `iapersonal.app.br`~~ ✅ CONCLUÍDO (10/03/2026)

- [x] NS apontados para `aaden.ns.cloudflare.com` / `teagan.ns.cloudflare.com`
- [x] Zona status: `active`

---

## 2. ~~R2 Custom Domains + Performance~~ ✅ CONCLUÍDO (10/03/2026)

### R2 Custom Domains
- [x] `images.iapersonal.app.br` → bucket `personal-ia-images` (SSL: active, ownership: active)
- [x] `videos.iapersonal.app.br` → bucket `personal-ia-videos` (SSL: active, ownership: active)

### Performance (idêntico ao vfit.app.br, exceto Rocket Loader)

| Categoria | Setting | Valor |
|-----------|---------|-------|
| **SSL/TLS** | SSL Mode | `strict` |
| | Always Use HTTPS | `on` |
| | Min TLS Version | `1.3` |
| | TLS 1.3 | `zrt` (0-RTT) |
| | Auto HTTPS Rewrites | `on` |
| | Opportunistic Encryption | `on` |
| **Speed** | Brotli | `on` |
| | Early Hints | `on` |
| | HTTP/2 | `on` |
| | HTTP/3 (QUIC) | `on` |
| **Caching** | Browser Cache TTL | `0` (respect origin) |
| | Always Online | `on` |
| **Security** | Security Level | `medium` |
| | Challenge TTL | `1800` |
| | Email Obfuscation | `on` |
| | Hotlink Protection | `on` |

### Verificação de Endpoints (10/03/2026)
- [x] Frontend: `https://iapersonal.app.br/` → **200 OK**
- [x] API: `https://api.iapersonal.app.br/health` → **healthy** (d1: ok, kv: ok, r2_videos: ok, r2_images: ok)
- [x] Images R2: `https://images.iapersonal.app.br/` → **401** (normal sem path — bucket responde)
- [x] Videos R2: `https://videos.iapersonal.app.br/` → **401** (normal sem path — bucket responde)
- [x] `vfit.app.br` → **"Serviço Descontinuado"**
- [x] `iapersonal.victor.pt` → **DNS removido** (não resolve)

---

## 3. ~~Descontinuar `iapersonal.victor.pt`~~ ✅ CONCLUÍDO (10/03/2026)

- [x] **3a.** Removido custom domain `iapersonal.victor.pt` do projeto Pages `personal-ia-prod`
- [x] **3b.** Deletado CNAME DNS `iapersonal.victor.pt` da zona `victor.pt` (ID: `f1691c9e80022db8d36a2d7492d66f89`)
- [x] **3c.** Turnstile atualizado — domínios agora: `iapersonal.app.br`, `localhost` (removidos: `iapersonal.victor.pt`, `vfit.app.br`)

---

## 4. ~~Verificação final~~ ✅ CONCLUÍDO (10/03/2026)

Todos os endpoints verificados — ver seção 2 acima.

---

## 5. ~~Limpeza de referências no código~~ ✅ CONCLUÍDO (10/03/2026)

- [x] `public/og-image.svg` — `vfit.app.br` → `iapersonal.app.br`
- [x] `scripts/fix-whatsapp-shared-secrets.sh` — URL antiga corrigida
- [x] `.env.example` + `twa/.env.example` — domínios atualizados
- [x] `twa/package.json`, `twa/config/twa-manifest.json`, `twa/twa-manifest.json` — URLs atualizadas
- [x] `twa/scripts/*.sh`, `twa/scripts/*.js` — URLs atualizadas
- [x] `twa/app/build.gradle`, `twa/app/src/main/res/values/strings.xml`, `twa/app/src/main/res/xml/shortcuts.xml` — TWA source atualizado
- [x] Build artifacts limpos (`dist/`, `.wrangler/tmp/`, `out/`, `twa/app/build/`)
- [x] Deploy **v4.9.8** com todas as correções
- [x] Verificação: zero referências a `vfit.app.br` ou `iapersonal.victor.pt` no código de produção
- [x] Referências em `migrations/` e `docs/` são históricas — mantidas intencionalmente

- [x] Worker Custom Domain `whatsapp.iapersonal.app.br` criado (ID: `0c71eb241579c634f16a888ef0ee5596bb611063`)

---

## Referência Rápida — IDs Cloudflare

| Recurso | ID |
|---------|-----|
| CF Account | `b0bf95d0fabb322ac3df37bd84ec0c77` |
| Zona `iapersonal.app.br` | `71e8d150d12015b016231950337b075e` |
| Zona `vfit.app.br` | `d57de48cb732847e5397c7652ee4dd55` |
| Zona `victor.pt` | `602adfc50c415518629425f73342b0a5` |
| Pages `personal-ia-prod` | projeto principal |
| Pages `vfit-descontinuado` | página estática "Serviço Descontinuado" |
| Worker `vfiti-api` | Worker Custom Domain: `api.iapersonal.app.br` (ID: `02edf45ee96bcb3c0d425778e533fd60e98ac936`) |
| Worker `vfiti-whatsapp` | Worker Custom Domain: `whatsapp.iapersonal.app.br` (ID: `0c71eb241579c634f16a888ef0ee5596bb611063`) |
| R2 `personal-ia-images` | custom domain: `images.iapersonal.app.br` (SSL active) |
| R2 `personal-ia-videos` | custom domain: `videos.iapersonal.app.br` (SSL active) |
| DNS `iapersonal.victor.pt` | ~~CNAME ID: `f1691c9e80022db8d36a2d7492d66f89`~~ REMOVIDO |
| Turnstile sitekey | `0x4AAAAAACbwFTxZJC74DsMB` |
