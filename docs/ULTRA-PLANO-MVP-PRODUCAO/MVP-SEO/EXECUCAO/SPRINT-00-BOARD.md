# Sprint 00 — Board Operacional

> Sprint: 00  
> Janela: 27/02 → 01/03  
> Objetivo: fundação técnica 100% pronta para escalar Sprint 01

## Kanban

## TODO
- [x] Validar `generateSEO` + schemas core
- [x] Revisar `robots.txt` + `llms.txt`
- [ ] Validar liberação de bots IA no Cloudflare (regra segura aplicada; pendente evidência de `Known bot=true` sem block em Security Events)
- [x] Instrumentar eventos `cta_click`, `plan_click`, `signup_start`
- [x] Ativar teste A/B `hero-headline-v1`
- [ ] Coletar baseline GSC/GA4 (documento-base criado; pendente export dos painéis)

## DOING
- [ ] Planejamento de Sprint 01 (fila inicial)

## DONE
- [x] Estrutura da pasta MVP-SEO criada
- [x] Plano executivo publicado
- [x] Sprints publicadas
- [x] Backlogs criados
- [x] Pacote 01 de URLs definido
- [x] Briefings iniciais (2 LPs + 3 artigos) criados
- [x] Próximo bloco criado (LP retenção + artigo onboarding 24h)
- [x] Bloco BOFU criado (LP /vs-mfit + artigo retenção 1º mês)
- [x] Bloco migração criado (LP /vs-tecnofit + artigo anti-planilha)
- [x] Bloco comparativo 3 criado (LP /vs-personalgo + artigo escala consultoria)
- [x] Bloco consultoria criado (LP /consultoria-online + artigo avaliação física digital)
- [x] Bloco migrar + preço criado (LP /migrar + artigo precificação por valor)
- [x] Bloco para-iniciante criado (LP /para-iniciante + artigo jornada 12 semanas)
- [x] Bloco planos criado (LP /planos + artigo planos que vendem)
- [x] Bloco download criado (LP /download + artigo isca digital)
- [x] Bloco personal ativo criado (LP /para-personal-ativo + artigo escala sem perder qualidade)
- [x] Bloco personal profissional criado (LP /para-personal-profissional + artigo operação avançada)
- [x] Bloco studio criado (LP /para-studio + artigo estrutura de studio)
- [x] Bloco afiliados criado (LP /afiliados + artigo programa de afiliados)
- [x] Bloco comparativo criado (Comparativo 001 + artigo escolha de software)
- [x] Bloco comparativo mfit criado (Comparativo 002 + artigo 018)
- [x] Bloco comparativo tecnofit criado (Comparativo 003 + artigo 019)
- [x] Bloco comparativo personalgo criado (Comparativo 004 + artigo 020)
- [x] Bloco alternativas mfit criado (Comparativo 005 + artigo 021)
- [x] Bloco alternativas tecnofit criado (Comparativo 006 + artigo 022)
- [x] Mega bloco de 10 artigos criado (Artigos 023 a 032)
- [x] Mega bloco de 10 briefs criado (Artigos 033 a 036 + Comparativos 007 a 012)
- [x] Mega bloco de 15 briefs criado (+50%) (Artigos 037 a 050 + Comparativo 013)
- [x] Mega bloco de 10 artigos criado (Artigos 051 a 060)
- [x] Mega bloco de 10 artigos criado (Artigos 061 a 070)
- [x] Mega bloco de 10 artigos criado (Artigos 071 a 080)
- [x] Mega bloco de 10 artigos criado (Artigos 081 a 090)
- [x] Monitoramento CWV ativado (GA4 `web_vitals`) + `themeColor` dark/light por sistema
- [x] Metadata factory (`buildSeoMetadata`) validada em páginas institucionais/blog + schemas core ativos (WebSite/Organization/SoftwareApplication/FAQ/BlogPosting)
- [x] Política de indexação separada por contexto: público `index,follow` e áreas privadas com `noindex`
- [x] Validação de bots IA executada com evidência (5 UAs com 200; 1 bloqueio detectado em `bingbot`) — ver `BOTS-IA-VALIDACAO-2026-02-27.md`
- [x] Baseline técnico GA4/GSC registrado — ver `BASELINE-GA4-GSC-2026-02-27.md`
- [x] Gate `smoke:auth:local` reexecutado com sucesso (8 passed / 0 failed) após renovação de tokens
- [x] Deploy dry-run executado com sucesso (pipeline validada até publicação)
- [x] Deploy de produção concluído (v3.8.5): home `index,follow`, `llms.txt` 200 e `sitemap-blog.xml` 200

## Riscos e bloqueios
- [ ] Owner SEO ainda não nomeado
- [ ] Owner COPY ainda não nomeado
- [ ] Owner MKT ainda não nomeado
- [ ] Falta evidência final de tráfego Bing verificado (local spoof retorna 403 por desenho de segurança)
- [ ] Deploy de workers na rodada v3.8.5 apresentou `terminated` no Wrangler, apesar de `api/health` responder 200 pós-rodada

## Gate de saída da Sprint 00
- [ ] Base técnica sem bloqueio crítico
- [ ] Backlogs priorizados para Sprint 01
- [ ] Baseline de métricas coletado
