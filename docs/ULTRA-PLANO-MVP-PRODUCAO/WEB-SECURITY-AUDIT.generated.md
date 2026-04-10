# Web Security Audit — LOTE 019

Gerado em: **2026-04-10T22:02:17.673Z**

Status geral: **GO ✅**

| Alvo | HTTP | Tempo | Resultado |
|---|---:|---:|---|
| Frontend | 200 | 582ms | ✅ |
| API Health | 200 | 1220ms | ✅ |

## Frontend

URL: https://vfit.app.br

| Header | Presente | Valor |
|---|---|---|
| strict-transport-security | ✅ | max-age=63072000; includeSubDomains; preload |
| content-security-policy | ✅ | default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://*.challenges.cloudflare.com https://static.cloudflareinsights.com https://cdn.onesignal.com https://*.onesignal.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.r2.cloudflarestorage.com https://images.vfit.app.br https://images.iapersonal.app.br https://*.replicate.delivery https://replicate.delivery https://vfit.app.br https://www.google-analytics.com https://www.googletagmanager.com https://lh3.googleusercontent.com https://*.fbcdn.net; connect-src 'self' https://api.vfit.app.br https://challenges.cloudflare.com https://*.challenges.cloudflare.com https://static.cloudflareinsights.com https://cloudflareinsights.com https://onesignal.com https://*.onesignal.com https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.googletagmanager.com https://accounts.google.com; frame-src https://challenges.cloudflare.com https://*.challenges.cloudflare.com https://accounts.google.com; manifest-src 'self'; worker-src 'self' https://cdn.onesignal.com https://challenges.cloudflare.com https://*.challenges.cloudflare.com; child-src 'self' https://challenges.cloudflare.com https://*.challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests |
| x-content-type-options | ✅ | nosniff |
| x-frame-options | ✅ | DENY |
| referrer-policy | ✅ | strict-origin-when-cross-origin |

## API Health

URL: https://api.vfit.app.br/health

| Header | Presente | Valor |
|---|---|---|
| strict-transport-security | ✅ | max-age=63072000; includeSubDomains; preload |
| x-content-type-options | ✅ | nosniff |
| x-frame-options | ✅ | DENY |
| referrer-policy | ✅ | strict-origin-when-cross-origin |
| access-control-allow-origin | ✅ | https://vfit.app.br |

## Critérios

- Frontend: CSP + HSTS + hardening headers presentes.
- API: CORS explícito + hardening headers presentes.
- Divergências devem gerar ajuste em `public/_headers`, middleware e CORS policy.
