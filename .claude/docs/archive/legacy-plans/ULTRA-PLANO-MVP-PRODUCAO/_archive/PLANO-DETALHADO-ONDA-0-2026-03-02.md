# Plano Detalhado — Onda 0 (Execução até 02/03/2026)

> Status: Pronto para execução imediata  
> Escopo: transformar o cronograma macro em tarefas técnicas por arquivo/endpoint/tela  
> Importante: manter placeholders `[A DEFINIR]` para inserir detalhes reais sem quebrar o fluxo.

---

## 1) Meta operacional da Onda 0

Entregar base pronta de lançamento com trilhas críticas implementadas e rastreáveis:

1. Compliance de cadastro (CPF/CREF)
2. Fluxo aluno sem vínculo + vínculo posterior
3. Afiliados para alunos
4. SEO em noindex até gate final
5. Base de agentes Unipile (Instagram)
6. Modo simulação do super admin

---

## 2) Sequência recomendada (ordem técnica)

1. **Dados e validação** (migrations + schemas + rotas)
2. **Fluxos de negócio** (cadastro/vínculo/afiliados)
3. **Admin e observabilidade** (modo simulação + auditoria)
4. **SEO e conteúdo** (templates + noindex global)
5. **Unipile agents base** (arquitetura mínima funcional)
6. **Gates finais** (smoke + quality + go/no-go)

---

## 3) Backlog detalhado por trilha

Status Sprint A (fechamento deploy): ✅ concluída em produção via retry
- bloqueio inicial por OAuth timeout regularizado após atualização de autenticação
- versão publicada: **v3.7.7** (inclui Sprint C: SEO lote 1 + noindex global)

## T1 — CPF obrigatório e único + CREF obrigatório

Status Sprint A: 🟡 em andamento (checkpoint 1 concluído)

### Backend
- Migration PostgreSQL:
  - tabela `users`: coluna `cpf` obrigatória com índice único global
  - tabela `personals`: coluna `cref` obrigatória
  - estratégia de normalização CPF (somente dígitos)
- Arquivos alvo:
  - `migrations/hyperdrive/[A_DEFINIR]_cpf_cref_constraints.sql`
  - `workers/schemas/auth.ts`
  - `workers/schemas/users.ts` [A DEFINIR se já existir]
  - `workers/api/auth.ts`
  - `workers/api/users.ts`

### Frontend
- Cadastro/alteração de perfil:
  - máscara CPF + validação de formato
  - mensagem de erro de unicidade amigável
  - CREF obrigatório no onboarding personal
- Arquivos alvo:
  - `src/app/register/personal/page.tsx`
  - `src/app/register/student/page.tsx`
  - `src/app/dashboard/complete-profile/page.tsx`
  - `src/hooks/use-auth.ts`

### Critérios de aceite
- CPF não pode repetir em nenhum usuário
- cadastro sem CPF bloqueado
- personal sem CREF bloqueado
- testes cobrindo validação e duplicidade

Campos em aberto:
- política de CPF para usuários já existentes: [A DEFINIR]

---

## T2 — Aluno sem vínculo inicial + vínculo posterior

Status Sprint A: 🟡 em andamento (cadastro autônomo + endpoint de vínculo posterior entregues)

### Backend
- Ajustar fluxo de criação de aluno sem `personal_id` obrigatório
- Criar endpoint para vínculo posterior aluno↔personal
- Regras de segurança/convite para vinculação
- Arquivos alvo:
  - `workers/api/students.ts`
  - `workers/schemas/students.ts`
  - `workers/api/users.ts` (se houver jornada unificada)

### Frontend
- Cadastro aluno autônomo
- Tela/ação para “vincular com personal” depois
- Estado visual de aluno sem personal vinculado
- Arquivos alvo:
  - `src/app/register/student/page.tsx`
  - `src/app/dashboard/students/[A_DEFINIR]`
  - `src/hooks/use-students.ts`

### Critérios de aceite
- aluno registra conta sem personal
- vínculo posterior funciona e audita ação
- sem regressão no fluxo atual de personal

Checkpoint 2 entregue:
- `POST /api/v1/students/me/link-personal` via `referral_code`

Campos em aberto:
- regra de aprovação do vínculo: [A DEFINIR]

---

## T3 — Afiliados para alunos (nova trilha)

Status Sprint B: 🟡 iniciado (checklist técnico aberto)

### Backend
- Definir regra de atribuição de afiliado para aluno
- Persistir vínculo e comissão
- Ajustar relatórios/admin
- Arquivos alvo:
  - `workers/api/affiliates.ts`
  - `workers/api/payments.ts`
  - `config/constants.ts` (regras/comissões)

### Frontend
- Exibir origem de afiliação do aluno (quando aplicável)
- atualizar visão admin/financeiro
- Arquivos alvo:
  - `src/app/dashboard/admin/payments/page.tsx`
  - `src/app/dashboard/affiliates/page.tsx`
  - hooks de affiliates/payments

### Critérios de aceite
- afiliação aluno rastreável fim-a-fim
- comissão calculada conforme regra definida
- auditoria administrativa disponível

Campos em aberto:
- modelo de atribuição oficial: [A DEFINIR]

---

## T4 — API de CPF (autofill de cadastro)

### Integração
- Criar adapter de provedor externo com timeout/fallback
- Endpoint backend para consulta segura
- Log de consentimento e uso
- Arquivos alvo:
  - `lib/[A_DEFINIR]-cpf.ts`
  - `workers/api/users.ts` ou `workers/api/auth.ts` [A DEFINIR]
  - `workers/schemas/[A DEFINIR].ts`

### Frontend
- Botão “Buscar dados por CPF”
- autopreencher campos permitidos
- manter edição manual disponível
- Arquivos alvo:
  - páginas de cadastro/onboarding

### Critérios de aceite
- consulta funciona com fallback
- fluxo não trava se provedor cair
- dados sensíveis tratados conforme LGPD

Campos em aberto:
- provedor e contrato: [A DEFINIR]

---

## T5 — SEO em escala com noindex até segunda

### Técnico
- Garantir noindex global em páginas SEO até gate final
- templates com metadata consistente
- sitemap e robots com estratégia de pré-lançamento
- Arquivos alvo:
  - `src/app/[seo-routes]/page.tsx` [A DEFINIR]
  - `public/robots.txt`
  - `public/sitemap.xml`
  - metadata em `src/app/layout.tsx` e/ou por rota

### Conteúdo
- Lote 1 e lote 2 de páginas SEO
- estrutura por cluster e interlinking

### Critérios de aceite
- páginas publicadas e não indexáveis antes do go-live
- checklist de reversão para index pronto

Campos em aberto:
- volume final de páginas por lote: [A DEFINIR]

---

## T6 — Agentes Unipile em Workers (Instagram)

### Base técnica
- definir arquitetura de agentes (roteador + intents + actions)
- módulos mínimos:
  - post scheduler
  - DM responder
  - comment responder
  - atendimento (handoff humano)
- Arquivos alvo:
  - `workers/api/[A DEFINIR]-agents.ts`
  - `lib/[A DEFINIR]-unipile.ts`
  - `scripts/[A DEFINIR]-unipile-smoke.mjs`

### Segurança e operação
- rate limits por canal
- auditoria de ações automáticas
- kill-switch por ambiente

### Critérios de aceite
- fluxo base funcional em ambiente controlado
- resposta automática com fallback humano
- logs/auditoria por evento

Campos em aberto:
- catálogo de intents e mensagens: [A DEFINIR]

---

## T7 — Super Admin: modo simulação Aluno/Personal/Super Admin

Status Sprint B: 🟡 em andamento (checkpoint 1 concluído)

### Backend
- endpoint seguro para alternância de modo de visualização
- preservar permissões reais para ações críticas
- registrar auditoria de troca e uso
- Arquivos alvo:
  - `workers/api/admin.ts`
  - `workers/middleware/auth.ts`

### Frontend
- toggle global de modo no dashboard admin
- banner fixo indicando modo ativo
- simulação “Personal premium” e “Aluno padrão”
- Arquivos alvo:
  - `src/app/dashboard/admin/page.tsx`
  - `src/stores/auth-store.ts`
  - `src/components/layout/[A DEFINIR].tsx`

### Critérios de aceite
- troca de modo estável e reversível
- nenhuma permissão indevida concedida
- auditoria completa de uso

Campos em aberto:
- escopo de ações permitidas em simulação: [A DEFINIR]

Checkpoint 1 entregue (Sprint B):
- sessão de simulação persistida no backend (sem alterar permissões reais ainda)
- novos endpoints (super_admin):
  - `GET /api/v1/admin/simulation/session`
  - `POST /api/v1/admin/simulation/session`
- persistência em `KV_SESSIONS` com TTL operacional de 8h
- auditoria best-effort de alteração de contexto de simulação
- arquivo: [workers/api/admin.ts](workers/api/admin.ts)
- validação: `npm run type-check:workers` ✅

Checklist técnico Sprint B (ativo):
- [x] Definir checkpoint inicial da trilha de simulação
- [x] Implementar endpoints backend para sessão de simulação
- [x] Validar compilação workers
- [x] Publicar checkpoint UX Treinos (atalhos + bibliotecas de exercícios/mídias) em produção
- [x] Validar smoke auth pós-deploy (`8 passed / 0 failed`)
- [x] Conectar dashboard admin ao estado de simulação
- [x] Implementar checkpoint inicial da trilha de afiliados para aluno

Próximos passos executivos (Sprint principal ativo):
1. **B.2.1 UI admin de afiliados:** expor `student_referrals` nas telas operacionais
2. **Sprint D (Unipile base):** iniciar implementação do roteador inicial de agentes com kill-switch operacional

---

## 4) Cronograma tático (sexta → segunda)

## Sexta (27/02)
- T1 (compliance CPF/CREF) + T2 (aluno sem vínculo)
- Gate: `type-check`, `type-check:workers`, `lint`, `test`

## Sábado (28/02)
- T3 (afiliados aluno) + T7 (simulação super admin)
- Início T5 (SEO lote 1 em noindex)
- Gate: QA funcional em jornadas críticas

## Domingo (01/03)
- T6 (Unipile base) + T5 (SEO lote 2)
- T4 (API CPF adapter) em paralelo se provedor já definido
- Gate: segurança + go/no-go pré-lançamento

## Segunda (02/03)
- Correções finais
- smoke auth + quality + go/no-go final
- liberar indexação SEO somente após aprovação
- deploy oficial + docs finais

---

## 5) Gates obrigatórios por dia

- `npm run docs:gate`
- `npm run smoke:auth:local`
- `npm run quality:ci`
- `npm run ops:go-no-go`

Campos em aberto:
- critério de bloqueio por risco moderado: [A DEFINIR]

---

## 6) Governança e rastreabilidade

- Toda etapa operacional com start/end no WhatsApp
- Toda entrega com atualização em:
  - `docs/CHANGELOG.md`
  - plano da sprint corrente
  - memória operacional quando necessário

---

## 7) Espaço para novas IDEIAS (aberto)

- [A DEFINIR]
- [A DEFINIR]
- [A DEFINIR]

Regra de entrada:
- objetivo claro,
- impacto esperado,
- owner,
- risco.

---

## 8) Checkpoint de conclusão

### MVP técnico
- Estado atual: 98%
- Para 100%: uptime externo + alertas

### Projeto inteiro (com redesign + pricing + SEO + novas frentes)
- Reestimar ao fim de cada dia com base no avanço real.
- Campo de status diário: [A DEFINIR]
