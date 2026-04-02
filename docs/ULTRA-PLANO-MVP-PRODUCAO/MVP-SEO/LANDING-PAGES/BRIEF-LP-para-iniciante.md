# Brief LP — Para Iniciantes (Novo Segmento PT)

## Objetivo
Landing page direcionada para PTs que estão começando a montar seu negócio (0-3 meses) — com foco em "como começar sem errar" + proposta de onboarding acelerado na plataforma.

## URL Slug
/para-iniciante

## Headline (v1)
Seu Primeiro Mês de Sucesso: Do Zero a PT Profissional em 30 Dias

## Subheadline
Plano passo-a-passo para PTs iniciantes cobrarem desde o 1º aluno, reterem 95% deles, e escalarem para 20+ alunos em 90 dias.

## Seções obrigatórias
1. **Hero + CTA primário:** "Comece seu onboarding gratuito" (lead magnet: guia de 7 dias)
2. **Problema:** PTs perdendo alunos no 1º mês por falta de gestão + PTs tendo dificuldade de cobrar
3. **Solução visível:** 3 pilar: Avaliação Digital + Contratos Sem Burocracia + Cobrança Automática
4. **Social Proof:** "500+ PTs começaram este mês com sucess"+ avatares + quote
5. **Roadmap 30 dias:** Semana 1 (estruturar), Semana 2 (primeiro aluno), Semana 3 (reter), Semana 4 (escalar)
6. **Comparativo light:** VFIT vs Planilha Excel (3 features diferenciadoras)
7. **FAQ:** "Quanto custa?", "Posso começar hoje?", "Perco meus alunos se vira da planilha?"
8. **CTA secundário:** "Agende demo de 15min com PT especialista" (calendly embed)
9. **Reassurance:** Badges de segurança, garantia 7 dias, suporte 24/5

## Schema
- JSON-LD: `SoftwareApplication` (name: "VFIT", applicationCategory: "BusinessApplication", offers: Plan com 30-day free trial)
- `BreadcrumbList`: Home > Para Iniciantes
- `LocalBusiness` (opcional): Se regional, adicionar address schema

## Eventos mínimos (GA4)
- `page_view`
- `scroll_depth` (25%, 50%, 75%, 100%)
- `demo_request_start` (usuário clica em demo button)
- `demo_request_submit` (usuário preenche form do calendly)
- `lead_magnet_view` (guia de 7 dias visível)
- `lead_magnet_submit` (guia baixado)
- `faq_open` (qual pergunta foi clicada)
- `pricing_view` (se mostrar plano)
- `cta_click_primary` (botão "Comece seu onboarding")

## Copy Hooks (Variações Teste A/B)
**Headline A (Racional):**
"Seu Primeiro Mês de Sucesso: Do Zero a PT Profissional em 30 Dias"

**Headline B (Emocional):**
"Não Deixe Alunos Escaparem: Aprenda a Reter 95% no Primeiro Mês"

**Subheadline A (Feature):**
"Plano passo-a-passo para cobrança + retenção + escalada em 90 dias"

**Subheadline B (Benefit):**
"De 0 a 20 alunos recorrentes: sem planilhas, sem burocracia, sem estresse"

## Definição de pronto
- [ ] Hero com imagem (PT iniciante em workspace, sorrindo + notebook/app)
- [ ] 2 variações de headline testadas (A/B ready)
- [ ] CTA primário em sticky header + below fold
- [ ] Roadmap visual (4 semanas, ícones representativos)
- [ ] Social proof com 5+ avatares + empresas/dados reais
- [ ] FAQ com 5-6 perguntas respondidas + schema FAQPage
- [ ] Comparativo 3-coluna: VFIT vs Excel vs Concorrente X
- [ ] Demo button com calendly integrado (ou typeform)
- [ ] Segurança badges (LGPD, PCI, Stripe)
- [ ] Mobile-responsive: testar em iphone 12 + android
- [ ] Lighthouse: Performance >75, Accessibility >90, SEO >90
- [ ] Tracking setup: GA4 events em todos CTAs + scroll depth
- [ ] Copy review: UX writer + PT especialista
- [ ] Expected CVR: 5-8% (lead magnet) + 2-3% (demo request)

## Internal Links (Obrigatórios)
- Link para /blog/jornada-12-semanas (Artigo 010) — na seção "Roadmap"
- Link para /blog/cobrar-alunos-sem-inadimplencia (Artigo 002) — na seção "Solução"
- Link para /blog/onboarding-alunos-24h (Artigo 004) — na seção "Como começar"
- Link para /vs-mfit (comparativo soft) — no FAQ, "qual a diferença de soluções pagas?"

## CTA Primário
Botão grande, background brand color (azul vfit), white text:
"Comece Seu Onboarding Gratuito"
Sublinha: "7 dias grátis + guia de 30 dias + suporte inicial"

## CTA Secundário
Link em copy:
"[Agende uma demo rápida com PT especialista](calendly link)"

## Público-alvo
- Personas: PT iniciante (0-3 meses), PT mudando de ferramenta, PT crescendo (10-20 alunos)
- Faixa etária: 25-45 anos
- Localização: Brasil (português)
- Problema crítico: perder alunos no 1º mês + falta de sistema de cobrança

## Motivação de Conteúdo
Segmentar para iniciantes reduz friction: eles têm medo de "entrar num sistema complexo". Uma LP dedicada com "roadmap de 30 dias" lowering barriers e aumentando CVR em até 40% vs LP genérica.

## Expected Results
- Lead magnet: 300-500 downloads/mês
- Demo requests: 50-100/mês
- Free trial activation: 20-30 PTs/mês
