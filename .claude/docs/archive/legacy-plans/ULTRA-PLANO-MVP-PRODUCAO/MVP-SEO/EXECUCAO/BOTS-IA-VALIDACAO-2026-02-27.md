# Validação de Bots IA — 27/02/2026

## Escopo validado
- `public/robots.txt` atualizado com `Allow: /` para crawlers de IA e buscadores.
- Metadata pública em `index,follow` no app root.
- Áreas privadas/técnicas com `noindex` (`(auth)`, `dashboard`, `offline`, `profile`).
- Teste ativo em produção via `curl` com User-Agent dedicado.

## Evidências de código
- `public/robots.txt`
- `src/lib/seo.ts`
- `src/app/layout.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/offline/layout.tsx`
- `src/app/profile/layout.tsx`

## Evidências de teste em produção (iapersonal.app.br)

| User-Agent | HTTP | Status |
|---|---:|---|
| GPTBot/1.0 | 200 | ✅ permitido |
| ChatGPT-User/1.0 | 200 | ✅ permitido |
| PerplexityBot/1.0 | 200 | ✅ permitido |
| ClaudeBot/1.0 | 200 | ✅ permitido |
| Googlebot/2.1 | 200 | ✅ permitido |
| Bingbot/2.0 | 403 | ❌ bloqueado no edge |

## Evidências adicionais de go-live SEO (produção pós-deploy v3.8.5)
- `/` retornando `<meta name="robots" content="index, follow"`
- `/login` e `/dashboard` mantendo `noindex`
- `/llms.txt` retornando `200`
- `/sitemap.xml` retornando `200`
- `/sitemap-blog.xml` retornando `200`

## Conclusão
- **Conforme em configuração**: regra final aplicada com segurança para Bing (`cf.client.bot` + `user_agent contains bingbot`, ação `Skip`).
- Em teste local por spoof de User-Agent, o `bingbot` pode retornar `403` (comportamento esperado quando o request não é bot verificado).
- Itens de go-live SEO permanecem concluídos em produção.

## Reteste rápido (27/02 — ajuste temporário de WAF)
- Regra temporária aplicada no Cloudflare: `http.user_agent contains "bingbot"` com ação `Skip` (componentes WAF/Super Bot Fight).
- Resultado de terminal após ajuste:
  - `bingbot` (UA completo): `HTTP 200`
  - `bingbot` (UA simples): `HTTP 200`
  - `googlebot`: `HTTP 200`
- Status: **teste rápido aprovado**.

> Próximo passo recomendado: remover/estreitar a regra temporária (ex.: IP+UA) e manter regra permanente baseada em bot verificado para não aceitar spoof amplo.

## Estado final aplicado (27/02)
- Regra temporária removida.
- Regra ativa única:
  - Nome: `Allow verified bingbot`
  - Expressão: `(cf.client.bot and http.user_agent contains "bingbot")`
  - Ação: `Skip`
- Validação final necessária no painel `Security Events`: confirmar eventos de `bingbot` com `Known bot = true` e sem bloqueio.

## Ação corretiva obrigatória (Cloudflare Dashboard)
Aplicar regra de allow em WAF/Bots conforme plano unificado:
- Security → Bots:
  - Bot Fight Mode: OFF ou "Allow verified bots"
  - Super Bot Fight Mode: permitir verified bots
- WAF → Custom Rule (Allow):
  - `(http.user_agent contains "GPTBot") or`
  - `(http.user_agent contains "ChatGPT-User") or`
  - `(http.user_agent contains "PerplexityBot") or`
  - `(http.user_agent contains "ClaudeBot") or`
  - `(http.user_agent contains "anthropic-ai") or`
  - `(http.user_agent contains "Google-Extended") or`
  - `(http.user_agent contains "cohere-ai") or`
  - `(http.user_agent contains "meta-externalagent") or`
  - `(http.user_agent contains "bingbot")`

## Critério de aceite
Reexecutar os curls e obter `HTTP 200` para todos os user-agents acima.
