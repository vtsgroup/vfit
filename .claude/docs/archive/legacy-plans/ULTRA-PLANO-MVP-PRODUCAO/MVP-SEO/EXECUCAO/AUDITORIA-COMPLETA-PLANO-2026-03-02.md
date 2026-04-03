# Auditoria Completa — Plano de Execução (03/2026)

## Objetivo
Fechar auditoria técnica + SEO + conversão + segurança operacional após go-live das correções do Sprint 00.

## Janela sugerida
- Pré-auditoria: **28/02/2026**
- Auditoria completa: **02/03/2026**
- Revisão de achados + plano de ação: **03/03/2026**

## Pré-requisitos (antes da auditoria)
1. Renovar tokens `SMOKE_*` e obter `smoke:auth:local` 100% sem falhas.
2. Deploy das correções SEO pendentes (index/follow público + `llms.txt`).
3. Ajustar Cloudflare para remover bloqueio de `bingbot`.
4. Capturar baseline numérica GA4/GSC (7 dias).

## Escopo da auditoria

### 1) SEO técnico
- `robots.txt`, `llms.txt`, `sitemap.xml`, `sitemap-blog.xml`
- Meta robots por contexto (público vs privado)
- JSON-LD por tipo de página
- Canonical, OG/Twitter, title/meta description

### 2) Crawlers e edge
- Teste de UAs: GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Googlebot, Bingbot
- Verificação de regras Cloudflare (Bots/WAF)
- Evidência HTTP por URL crítica

### 3) Performance e CWV
- Validação de evento `web_vitals` no GA4
- LCP/CLS/INP por template principal
- Regressões de carregamento em home/LPs

### 4) Conversão e tracking
- Eventos base: `cta_click`, `plan_click`, `signup_start`
- Mapeamento de funil da landing
- Integridade de dataLayer/gtag

### 5) Segurança operacional
- Auth smoke (gate)
- Review de headers/CSP
- Status de monitoramento e logs críticos

## Evidências obrigatórias
- `docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md`
- `docs/ULTRA-PLANO-MVP-PRODUCAO/MVP-SEO/EXECUCAO/BOTS-IA-VALIDACAO-2026-02-27.md`
- `docs/ULTRA-PLANO-MVP-PRODUCAO/MVP-SEO/EXECUCAO/BASELINE-GA4-GSC-2026-02-27.md`
- Atualização do board/checklist com go/no-go final

## Critério de conclusão
Auditoria é considerada concluída quando todos os itens abaixo forem verdadeiros:
- `smoke:auth:local` sem `failed`
- Home com `index,follow` em produção
- `llms.txt` e `sitemap-blog.xml` respondendo 200
- `bingbot` respondendo 200
- Métricas baseline registradas com números
