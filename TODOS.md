# TODOS.md — VFIT

Itens identificados durante reviews e planejamento, capturados com contexto suficiente para serem retomados a qualquer momento.

---

## Backlog

### TODO-001 — Race condition no conflict check do calendário

**What:** Adicionar proteção a nível de DB contra double booking concorrente no sistema de agendamento.

**Why:** O conflict check em application-level (SELECT + INSERT separados) tem uma race window de ~1ms. Dois clientes criando slots simultaneamente para o mesmo personal podem ambos passar pela checagem e gerar double booking silencioso — sem erro, sem log, sem notificação.

**Pros:** Elimina o único critical gap de segurança identificado na review do sistema de agendamento. Neon PostgreSQL suporta `btree_gist` e exclusion constraints nativamente.

**Cons:** Exclusion constraints em Postgres exigem a extensão `btree_gist` — verificar suporte no plano Neon atual. Alternativa mais simples: `SELECT ... FOR UPDATE` em transaction explícita (sem extensão).

**Context:** O conflict check em application-level foi adicionado na PR de eventos recorrentes (mar/2026). O gap foi identificado como critical durante o plan-eng-review: codepath sem teste + sem error handling + falha seria silenciosa. `btree_gist` exclusion constraint seria: `EXCLUDE USING gist (personal_id WITH =, tstzrange(start_at, end_at) WITH &&)`.

**Depends on:** PR de eventos recorrentes + conflict detection (esta feature deve ser deployada primeiro).

---

### TODO-002 — "Editar este e futuros" para eventos recorrentes

**What:** UI + backend para editar ou deletar "apenas este evento" ou "este e todos os futuros" de uma série recorrente.

**Why:** Sem isso, alterar uma sessão em uma série recorrente exige deletar toda a série e recriar manualmente. UX inaceitável para personal trainers com 12+ sessões semanais agendadas.

**Pros:** UX padrão de calendários (Google Calendar, Outlook). Os building blocks (`recurrence_group_id` + `recurrence_index`) são criados na PR de eventos recorrentes — os dados para implementar estão no lugar.

**Cons:** Requer modal de escolha no frontend ("Editar só este" / "Editar este e futuros" / "Editar todos"). Backend: PATCH especializado com `UPDATE WHERE recurrence_group_id = $1 AND recurrence_index >= $2`. Teste: testar cada branch do modal.

**Context:** `recurrence_group_id` e `recurrence_index` são os pré-requisitos desta feature. Workaround aceitável para v1: delete + recriar a série. Retomar com feedback de usuários pós-lançamento de eventos recorrentes.

**Depends on:** PR de eventos recorrentes (TODO-001 é independente desta).

---

### TODO-003 — Migrar ensureCalendarSchema para sistema de migrations real

**What:** Substituir o DDL em runtime (`ensureCalendarSchema`) por um migration runner adequado (ex: `drizzle-kit` ou um `scripts/migrate.ts` simples), para que mudanças de schema sejam aplicadas exatamente uma vez no deploy.

**Why:** O DDL em runtime executa em todo cold start de Worker (potencialmente centenas de vezes por dia). Também é frágil para mudanças destrutivas (`DROP COLUMN`, renomear coluna) que `IF NOT EXISTS` não protege.

**Pros:** Elimina overhead de DDL em cold start; habilita mudanças de schema destrutivas com segurança; histórico de migrations versionado.

**Cons:** Requer escolher e integrar uma ferramenta de migrations; deve lidar com o modelo de conexão Neon/Cloudflare Workers (HTTP driver); DDL existente deve ser convertido para arquivo de migration inicial.

**Context:** A tabela `calendar_events` é a única gerenciada por DDL em runtime. Outras tabelas parecem ser gerenciadas de forma diferente. Identificado como Issue 8 neste plan-eng-review e diferido como decisão arquitetural separada. O Neon suporta SQL migrations nativamente.

**Depends on:** Nenhuma (independente do trabalho de features do calendário).

---

### TODO-004 — Workers AI para tarefas multimodais (comparação de fotos)

**What:** Migrar `/ai/photos/compare` de chamadas diretas ao Replicate para `callWorkersAIWithFallback` quando o Cloudflare Workers AI tiver suporte multimodal estável (`@cf/llava` ou equivalente).

**Why:** Este endpoint é o único que bypassa a nova arquitetura de fallback. Não tem rastreamento de provider no analytics, sem chain de fallback e sem tratamento 503 em falha do provider.

**Pros:** Arquitetura consistente em todos os endpoints de IA; tracking de provider + proteção de fallback de graça.

**Cons:** Suporte multimodal no Workers AI não está estável em março/2026. Prematuro construir agora.

**Context:** Issue 3 neste plan-eng-review. Documentado como exceção intencional (comentário adicionado na PR). Revisitar quando `@cf/llava-1.5` ou equivalente for GA no Workers AI.

**Depends on:** Workers AI multimodal GA no Cloudflare.

---
