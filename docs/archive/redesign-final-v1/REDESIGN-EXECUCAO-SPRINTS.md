# VFIT — Execução do Redesign por Sprints (Produção Incremental)

Data: 27/02/2026
Base: `docs/redesign-final/vfit-redesign-plan.md`

## Objetivo
Executar o redesign radical em entregas curtas, com deploy progressivo, validação real em produção e comunicação operacional no grupo (WhatsApp) com protocolo start/end obrigatório.

---

## Cadência recomendada
- Sprint curta: **2 a 4 dias**
- Deploy: **1 deploy por sprint** (ou 2 no máximo, se quebrar risco)
- Ritual diário:
  - D-Start (grupo)
  - Atualização parcial (meio do dia)
  - D-End (grupo com resultado)

---

## Sprint 0 (1 dia) — Trava de execução e baseline

### Escopo
1. Congelar baseline visual (screenshots home/login/dashboard).
2. Criar checklist de gate (QA + smoke auth + Lighthouse + acessibilidade mínima).
3. Definir ordem de rollout por áreas:
   - Institucional (home)
   - Auth (login)
   - Dashboard principal

### Critérios de saída
- Baseline registrado
- Gate definido
- Plano validado no grupo

---

## Sprint 1 (2-3 dias) — Foundation do Design System

### Escopo
1. Migrar tokens para direção **Midnight Pulse** (cores/surface/glass/typography/radius/shadow).
2. Padronizar utilitários base:
   - `glass-card`
   - `btn-primary`, `btn-secondary`, `btn-ghost`
   - `input`, `badge`, `empty-state`
3. Adicionar fallback para ausência de `backdrop-filter`.
4. Garantir `prefers-reduced-motion` global.

### Arquivos foco
- `src/app/globals.css`
- componentes base de UI (conforme uso atual)

### Critérios de saída
- Nenhum valor visual novo hardcoded fora de token
- Estados base (hover/focus/disabled/loading) aplicados
- Regressão visual mínima no app autenticado

### Deploy
- Deploy controlado após QA + smoke auth

---

## Sprint 2 (2-4 dias) — Header + Hero + blocos críticos da Home

### Escopo
1. Header sticky premium (transparente → glass no scroll).
2. Hero “Dashboard Flutuante” (versão performance-first).
3. Seções: recursos + como funciona + CTA final.
4. Reduzir uso de verde para faixa 10-15% visual.

### Critérios de saída
- Home com nova identidade visual aplicada
- Mobile hero funcional e legível
- LCP controlado

### Deploy
- Deploy com monitoramento de conversão e bounce

---

## Sprint 3 (2-3 dias) — Login/Auth premium

### Escopo
1. Redesign completo de login (glass form + mesh fundo).
2. Estados de erro/sucesso/loading com microcopy melhorado.
3. Ajustes de acessibilidade (labels, focus, contraste).

### Critérios de saída
- Login moderno, estável e responsivo
- Sem regressão no fluxo de autenticação

### Deploy
- Deploy após smoke auth obrigatório

---

## Sprint 4 (3-4 dias) — Dashboard principal (história de dados)

### Escopo
1. Top KPIs com hierarquia visual e tendência.
2. Bloco principal (gráfico + atividade recente + agenda).
3. Empty states motivacionais.
4. Ajuste de sidebar para leitura premium.

### Critérios de saída
- Dashboard escaneável em até 5 segundos
- Visual premium consistente com home/login

### Deploy
- Deploy com validação de retenção inicial

---

## Sprint 5 (3-5 dias) — Módulos internos prioritários

### Escopo
1. Alunos (lista/cards/filtros/ações rápidas).
2. Treinos (lista + criação com UX refinada).
3. Avaliações (cards e progressão visual).

### Critérios de saída
- Fluxos principais do personal padronizados no novo visual

### Deploy
- Deploy incremental por módulo (se necessário)

---

## Gate obrigatório antes de cada deploy

1. Smoke auth local: `npm run smoke:auth:local`
2. Build e checks sem erro crítico
3. Revisão visual desktop + mobile dos blocos alterados
4. Atualização de docs de deploy (changelog e documentação relacionada)
5. Mensagens operacionais start/end no grupo (obrigatório)

---

## Protocolo de comunicação no grupo (WhatsApp)

## Mensagem START (modelo)
```
[START] Redesign Sprint X
started_at: YYYY-MM-DD HH:mm:ss
escopo: <itens objetivos>
risco: baixo|médio|alto
deploy: previsto para hoje? sim|não
```

## Mensagem END (modelo obrigatório)
```
[END] Redesign Sprint X
started_at: YYYY-MM-DD HH:mm:ss
ended_at: YYYY-MM-DD HH:mm:ss

Resultado direto:
- <o que entrou em produção>

Motivo:
- <por que essa entrega era importante>

Vantagem prática:
- <impacto no usuário/negócio>
```

---

## Estratégia de risco
- Não mexer em tudo ao mesmo tempo.
- Primeiro fundação visual, depois superfícies públicas, depois auth, depois painel.
- Cada sprint precisa sair com valor perceptível e regressão controlada.

---

## Próximo passo recomendado (imediato)
Iniciar **Sprint 1** com PR focada em tokens + componentes base, sem refatorar todas as páginas de uma vez.

---

## Log de execução

### Sprint 1 — START (2026-02-27)

Status: **em andamento**

Entregas já aplicadas:
- Tokens base Midnight Pulse em [src/app/globals.css](src/app/globals.css)
- Utilitários foundation: `glass-card`, `btn-*`, `input`, `badge`, `empty-state`
- Fallback para browsers sem `backdrop-filter`
- Regra global de acessibilidade para `prefers-reduced-motion`

Próxima etapa da sprint:
- Aplicar os novos utilitários nos componentes de superfície mais críticos (header, hero e auth no próximo ciclo)

### Sprint 2 — START (2026-02-27)

Status: **em andamento**

Escopo deste ciclo:
- Redesign do header público com comportamento glass no scroll
- Redesign do hero com linguagem Midnight Pulse, CTAs premium e mockup visual refinado
- Deploy incremental para validação visual imediata em produção