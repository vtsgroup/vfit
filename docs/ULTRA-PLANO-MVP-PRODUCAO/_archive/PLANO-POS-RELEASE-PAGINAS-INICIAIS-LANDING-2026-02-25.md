# PLANO PÓS-RELEASE — Páginas Iniciais, Landing e Aquisição

> Data: 25/02/2026  
> Contexto: MVP já publicado em produção (v3.3.3) com gates técnicos e operacionais aprovados.

---

## 1) Objetivo executivo (próximo ciclo)

Transformar as páginas iniciais em um funil previsível de aquisição e ativação, com foco em:
- mais visitas qualificadas;
- maior taxa de cadastro;
- menor tempo entre cadastro e primeira ação no produto.

### Meta principal (30 dias)
- Aumentar taxa de conversão da home para cadastro em **+25%**.

### Metas secundárias
- Reduzir bounce da home em **-20%**.
- Aumentar CTR dos CTAs principais em **+30%**.
- Melhorar tempo de carregamento percebido no mobile (LCP) para **<= 2.5s**.

---

## 2) Escopo do plano (fases)

## Fase A — Estabilização pós-release (D+1 a D+2)
- Confirmar saúde dos fluxos principais após v3.3.3.
- Congelar mudanças estruturais de dashboard por 24h.
- Coletar baseline real (analytics + funil atual da home).

## Fase B — Landing core (D+3 a D+7)
- Refatorar blocos da landing para foco em conversão:
  - proposta de valor acima da dobra;
  - prova social forte;
  - CTA claro para público Personal e Aluno.
- Melhorar consistência visual e semântica SEO nas páginas institucionais.

## Fase C — Páginas por intenção (D+8 a D+12)
- Criar/otimizar páginas de entrada por intenção:
  - para personal trainer autônomo;
  - para estúdio/assessoria;
  - para aluno (acesso e acompanhamento).

## Fase D — CRO e escala (D+13 a D+20)
- Testes A/B em hero/copy/CTA.
- Ajustes finos por dados (não por opinião).
- Preparar backlog de expansão (conteúdo, campanhas, integrações).

---

## 3) Mapa de ativos atuais (base existente)

### Home/landing atual
- [src/app/page.tsx](src/app/page.tsx)
- [src/components/landing/hero.tsx](src/components/landing/hero.tsx)
- [src/components/landing/features.tsx](src/components/landing/features.tsx)
- [src/components/landing/how-it-works.tsx](src/components/landing/how-it-works.tsx)
- [src/components/landing/pricing.tsx](src/components/landing/pricing.tsx)
- [src/components/landing/testimonials.tsx](src/components/landing/testimonials.tsx)
- [src/components/landing/cta-section.tsx](src/components/landing/cta-section.tsx)
- [src/components/landing/navbar.tsx](src/components/landing/navbar.tsx)
- [src/components/landing/footer.tsx](src/components/landing/footer.tsx)

### Institucionais
- [src/app/(institutional)/sobre](src/app/(institutional)/sobre)
- [src/app/(institutional)/contato](src/app/(institutional)/contato)
- [src/app/(institutional)/carreiras](src/app/(institutional)/carreiras)
- [src/app/(institutional)/blog](src/app/(institutional)/blog)

---

## 4) Plano completo por bloco (execução prática)

## Bloco 1 — Baseline e instrumentação (obrigatório)

### Entregas
- Definir eventos mínimos do funil de aquisição:
  - `lp_view`
  - `lp_cta_primary_click`
  - `lp_cta_secondary_click`
  - `lp_pricing_view`
  - `lp_register_start`
  - `lp_register_complete`
- Garantir parâmetros de origem:
  - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`.

### Critério de aceite
- Eventos chegando de forma consistente em 3 navegadores + mobile.

## Bloco 2 — Estrutura da Home (copy + UX)

### Entregas
- Hero com proposta única em 1 frase clara.
- CTA principal único por dobra (evitar conflito de ação).
- Seção de benefícios por resultado mensurável (não só feature).
- Seção de prova social com evidência real.

### Critério de aceite
- Usuário entende “o que é”, “para quem é”, “qual próximo passo” em <= 8 segundos.

## Bloco 3 — Landing por persona (captura qualificada)

### Entregas
- Landing 1: Personal autônomo.
- Landing 2: Estúdio/assessoria.
- Landing 3: Aluno final.
- Copy e CTA específicos por persona.

### Critério de aceite
- Cada página com headline específica + CTA coerente + prova social do mesmo contexto.

## Bloco 4 — SEO técnico + conteúdo

### Entregas
- Revisão de metadata/title/description/canonical.
- Estrutura H1-H2-H3 limpa e semântica.
- Internal links entre home, institucionais e blog.
- FAQ orientada a intenção de busca.

### Critério de aceite
- Sem erros críticos de indexação e melhor cobertura semântica por página.

## Bloco 5 — CRO contínuo (A/B + iteração)

### Entregas
- A/B test 1: headline do hero.
- A/B test 2: texto do CTA principal.
- A/B test 3: ordem de blocos (prova social vs benefícios).

### Critério de aceite
- Decisão por dados com janela mínima de amostra e regra de desempate definida.

---

## 5) Padrão de qualidade (perfeição operacional)

### Regras não negociáveis
- Nenhuma entrega de landing entra sem evento de tracking.
- Nenhuma mudança visual entra sem revisão mobile (320–390px + iOS).
- Nenhuma publicação sem smoke obrigatório da rotina atual:
  - `npm run smoke:auth:local`

### Gate técnico por ciclo
- `npm run lint`
- `npm run type-check`
- `npm run type-check:workers`
- `npm test`
- `npm run build`

---

## 6) Backlog pós-release priorizado (ordem)

1. Instrumentação completa de funil (aquisição -> cadastro -> ativação).
2. Refino da home principal com copy de conversão.
3. Landing por persona com CTA dedicado.
4. SEO técnico e semântico nas páginas institucionais.
5. Testes A/B e otimização contínua por dados.

---

## 7) Sequência de execução recomendada (próxima sessão)

1. Rodar monitoramento rápido de estabilidade pós-release.
2. Fechar baseline de conversão atual da home.
3. Abrir Bloco 1 (instrumentação) e concluir no mesmo ciclo.
4. Abrir Bloco 2 (home conversion core).
5. Registrar evidências e decisão de próximo teste.

---

## 8) Definição de pronto do ciclo pós-release

O ciclo inicial pós-release será considerado pronto quando:
- baseline completo estiver registrado;
- home principal estiver com nova copy/CTA e tracking validado;
- pelo menos 1 landing por persona estiver publicada;
- primeira rodada de A/B tiver resultado documentado.

---

## 9) Resultado esperado

Ao final deste plano, o projeto sai de “MVP estável” para “motor de aquisição previsível”, reduzindo improviso e aumentando crescimento com controle.
