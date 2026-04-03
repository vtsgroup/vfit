# Continuidade — Ícones PWA / SVG / Cache — 23/02/2026

## Estado atual (resumo rápido)

- **Produção** está servindo `manifest.json` com **version = 2.8.5** (ícones com `?v=2.8.5`).
- **Git (origin)** ainda está só até **v2.8.4**.
- Localmente existe um commit/tag **v2.8.5** (branch `main` está *ahead 1*), mas **não foi pushado**.

> Consequência: existe **drift** entre o que está publicado e o que está no GitHub.

## Objetivo

1) **Alinhar GitHub** com o que já está em produção (push do `v2.8.5`).
2) Resolver a percepção de “ícone pequeno/cortado”:
   - entender que **Android launcher usa `maskable`**,
   - entender que ícones em `/icons/*` têm cache **`immutable`**,
   - e que iOS/Android frequentemente exigem **remover e reinstalar** o PWA.
3) Garantir que os **SVG wrappers** não fiquem “modelo antigo” por cache/thumbnails.

## Passo 1 — Corrigir drift do Git (OBRIGATÓRIO)

Rodar no repo (sem bump):

- `git push origin main --follow-tags`

Depois confirmar:

- `git ls-remote --tags origin | tail`

> Esperado: aparecer `v2.8.5`.

## Passo 2 — Entender o problema real (cache + launcher)

### Android (launcher)

- O launcher costuma usar **`icon-512-maskable.png`**.
- Mesmo com `?v=...`, o Android pode continuar com o ícone antigo até reinstalar.

Checklist:

1) Remover o app instalado
2) Chrome → Configurações → Privacidade → **Excluir dados do site** (iapersonal.app.br)
3) Abrir o site → Instalar de novo

### iOS (Add to Home Screen)

1) Apagar o ícone da home
2) Ajustes → Safari → Avançado → Dados dos Sites → remover `iapersonal.app.br`
3) Adicionar novamente

### Finder / thumbnails

- O macOS pode manter **thumbnail antigo** para PNG/SVG.
- Validar abrindo o arquivo (Quick Look / Preview) ou conferindo `ETag` via curl.

## Passo 3 — Validar no ar (sem achismo)

### Ver versão do manifest

- `curl -sS https://iapersonal.app.br/manifest.json | grep -n '"version"'`

### Ver se icon novo está sendo servido (cache-busted)

- `curl -sS -I "https://iapersonal.app.br/icons/icon-512-maskable.png?v=2.8.5" | head`

Esperado:
- `HTTP/2 200`
- `cf-cache-status: MISS` (pelo menos na primeira vez)

## Passo 4 — SVGs “modelo antigo”

Hoje os SVGs são **wrappers** apontando para o PNG oficial (ex.: `icon-512.svg` → `<image href="icon-512.png" .../>`).

Se ainda aparecer “IA” (modelo antigo), é quase sempre:
- thumbnail local cacheada, ou
- cache do PNG sem query quando o SVG referencia `icon-512.png` sem `?v=`.

Plano (se precisar):
- atualizar wrappers para referenciar `icon-512.png?v=<APP_VERSION>` **ou** simplesmente remover SVGs do pacote (não são usados no manifest).

## Próximo passo (decisão)

Quando voltar na sessão:
1) alinhar Git (`push --follow-tags`)
2) testar Android/iOS com reinstall
3) se ainda ficar errado, decidir:
   - **A)** manter `maskable` com “PERSONAL” (ext) e calibrar crop/padding
   - **B)** usar sem texto no `maskable` (recomendado por guidelines) e deixar “PERSONAL” só em ícones `any` grandes.
