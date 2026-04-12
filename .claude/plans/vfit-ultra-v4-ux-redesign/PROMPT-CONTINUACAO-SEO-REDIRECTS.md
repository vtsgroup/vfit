# PROMPT DE CONTINUAÇÃO — SEO Redirects + Migração de Config do Domínio Antigo (IA Personal)

## Contexto
Você está no projeto VFIT (`/Users/macos/Development/apps/vfit-production`) e deve continuar a estratégia de SEO/redirects para capturar tráfego que já está chegando em domínios/rotas antigas (ex.: iapersonal/personal-ia) e consolidar tudo no domínio atual (`vfit.app.br`).

## Objetivo Macro
Executar uma migração **completa, segura e orientada a SEO** de URLs antigas para URLs canônicas da VFIT, preservando ranking, cliques e autoridade:
- copiar/aplicar configurações essenciais do domínio antigo (redirect rules, canonical, sitemap/robots equivalentes, headers relevantes);
- definir e implementar redirects 301 permanentes para todas as rotas antigas mapeadas;
- preparar estrutura de landing pages novas:
  1. landing para **Personais** (B2B);
  2. landing para **Nutrição/Nutricionistas**;
  3. experiência inicial para **usuário final** (B2C) sem canibalizar as duas LPs acima.

---

## Regras Críticas (seguir sem quebrar)
1. Não remover segurança/autenticação existente.
2. Não quebrar PWA/TWA, manifest, service worker e roteamento atual.
3. Não introduzir regressão no tema/header já ajustado (top dark/theme-color).
4. Em frontend React Query, manter auth guard obrigatório quando aplicável.
5. Em workers/db, respeitar padrões existentes e regras do projeto (`.github/copilot-instructions.md`).
6. Não alterar scripts em `scripts/` sem necessidade explícita.
7. Nunca fazer deploy fora do pipeline oficial.

---

## Escopo Técnico — Fase 1 (Diagnóstico e Inventário)
1. Levantar URLs antigas com potencial tráfego orgânico/pago:
   - antigo domínio principal e subdomínios;
   - rotas históricas de blog, pricing, onboarding, login e páginas institucionais.
2. Levantar configuração atual de redirects em:
   - `public/_redirects`
   - `public/_headers`
   - `next.config.ts`
   - possíveis rewrites/rules em worker/pages config.
3. Produzir matriz de mapeamento:
   - `old_url` → `new_url` (canônica)
   - status code esperado (301)
   - intenção da página (informacional, comercial, transacional)
   - observação de parâmetro UTM/query string.

Entrega da Fase 1: documento versionado em `.claude/docs/` com tabela completa de mapeamento.

---

## Escopo Técnico — Fase 2 (Implementação Redirects SEO-First)
1. Implementar redirects 301 permanentes, priorizando:
   - páginas com cliques já ativos;
   - páginas com backlinks;
   - rotas de conversão (pricing/registro/login).
2. Garantir preservação de query params relevantes (UTM, gclid/fbclid quando aplicável).
3. Evitar chains e loops de redirect:
   - no máximo 1 salto até a URL final.
4. Validar canônicos:
   - canonical consistente com URL final;
   - sem canonical apontando para domínio antigo.
5. Validar sitemap e robots:
   - remover URL antiga do sitemap atual;
   - sitemap só com canônicas atuais.

Entrega da Fase 2: PR com alterações + evidências de testes (`curl -I`/matriz de validação).

---

## Escopo Técnico — Fase 3 (Landing Pages por Segmento)
Criar/ajustar estrutura de LP com mensagens separadas para evitar canibalização:

### LP 1 — Personais (B2B)
- foco: aquisição de personal trainer;
- CTA principal: cadastro/upgrade;
- prova social + dores de gestão + benefícios operacionais.

### LP 2 — Nutrição/Nutricionistas
- foco: profissionais de nutrição;
- proposta de valor específica (plano alimentar, acompanhamento, retenção).

### LP 3 — Usuário final (B2C)
- foco: treino e evolução pessoal;
- entrada clara para jornada de onboarding B2C.

Regras de SEO de LP:
- title/description/h1 únicos por LP;
- schema apropriado (Organization/SoftwareApplication/WebSite quando fizer sentido);
- evitar conteúdo duplicado entre LPs;
- interlink interno claro entre páginas.

---

## QA e Validação Obrigatória
1. Verificar status HTTP esperado para cada URL antiga (301 -> 200 final).
2. Verificar ausência de redirect loop.
3. Verificar canonical final no HTML renderizado.
4. Validar build (`npm run build`) e checks necessários do projeto.
5. Validar que não houve regressão em navegação principal.

---

## Deploy e Documentação
1. Deploy somente via pipeline oficial (`deploy-vfit-patch-no-whatsapp` quando aplicável).
2. Atualizar obrigatoriamente:
   - `.claude/docs/CHANGELOG.md`
   - `.claude/plans/vfit-ultra-v4-ux-redesign/TRACKING.md`
   - documentação de SEO/redirects em `.claude/docs/`.
3. Registrar versão publicada e evidência de URLs testadas.

---

## Formato de Execução Esperado
Execute em etapas curtas e reportáveis:
1. Inventário completo de URLs/configs antigas.
2. Plano final de mapeamento (tabela old→new).
3. Implementação incremental dos redirects.
4. Criação/ajuste das LPs segmentadas.
5. QA técnico + SEO.
6. Deploy + documentação final.

---

## Resultado de Sucesso
- Tráfego do domínio/rotas antigas consolidado no domínio atual sem perda de intenção.
- 100% das URLs antigas críticas com 301 para canônica correta.
- LPs segmentadas publicadas (Personais, Nutrição, Usuário final).
- Projeto estável, sem regressão visual/funcional, com documentação e tracking atualizados.
