# 🦸 PLANO DE AÇÃO — Admin Super Powers

> **v1.0** — Criado em 17/02/2026
> Plano para dar controle total ao super_admin sobre usuários, personals, saldos e pagamentos.

---

## 📍 Estado Atual (17/02/2026)

### O que JÁ existe no backend (`workers/api/admin.ts` — 1475 linhas, 27 endpoints):

| Endpoint | Função | Limitações atuais |
|---|---|---|
| `GET /admin/users` | Lista users com busca/filtro | ✅ OK |
| `GET /admin/users/:id` | Detalhe com profile + 10 pagamentos | ❌ Não mostra saldo, total recebido, total sacado |
| `PATCH /admin/users/:id` | Edita user (nome, email, phone, role, etc) | ❌ Poucos campos editáveis |
| `DELETE /admin/users/:id` | Hard delete (super_admin) | ✅ OK (cascade completo) |
| `POST /admin/users/:id/bonus` | Dá bônus como pagamento confirmed | ✅ Existe mas frontend é básico |
| `GET /admin/personals` | Lista personals com busca/filtro | ❌ Não mostra saldo/receita |
| `PATCH /admin/personals/:id` | Edita personal (plano, CREF, bio) | ❌ Poucos campos, falta saldo/status |
| `GET /admin/payments` | Todas transações | ✅ OK |
| `PATCH /admin/payments/:id` | Edita pagamento (status, etc) | ⚠️ Básico |
| `DELETE /admin/payments/:id` | Hard delete pagamento | ✅ OK (super_admin) |
| `GET /admin/transfers` | Todos saques PIX | ✅ OK |
| `POST /admin/transfers` | Criar saque manual (super_admin) | ✅ OK |
| `GET /admin/stats` | Stats da plataforma + Asaas | ✅ OK |

### O que JÁ existe no frontend:

| Página | Funcionalidades | Limitações |
|---|---|---|
| `/dashboard/admin` | Stats dashboard | ❌ Sem saldo por personal |
| `/dashboard/admin/users` | Lista, edição modal, bônus, delete | ❌ Edição limitada, sem saldo |
| `/dashboard/admin/personals` | Lista, edição modal (plano, CREF) | ❌ Sem saldo, sem receita, poucas ações |
| `/dashboard/admin/payments` | Cobranças + Saques PIX (2 tabs) | ❌ Sem ações de ajuste manual |
| `/dashboard/admin/workouts` | Lista treinos | ✅ OK |
| `/dashboard/admin/feedback` | Sugestões & Melhorias | ✅ OK |

---

## 🎯 Sprint 1 — Edição Completa de Usuários (Prioridade Alta)

### 1.1 Backend — `GET /admin/users/:id` com dados financeiros
**Arquivo:** `workers/api/admin.ts` → endpoint `GET /users/:id`

Adicionar ao retorno:
```typescript
// Dados financeiros do personal
const financials = await pgQueryOne(c.env, `
  SELECT 
    COALESCE(SUM(CASE WHEN status = 'confirmed' THEN net_amount ELSE 0 END), 0)::float as total_received,
    COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount - net_amount ELSE 0 END), 0)::float as total_fees,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::int as confirmed_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending_count,
    COUNT(CASE WHEN status = 'overdue' THEN 1 END)::int as overdue_count
  FROM payments WHERE recipient_id = $1
`, [id])

const withdrawals = await pgQueryOne(c.env, `
  SELECT 
    COALESCE(SUM(CASE WHEN status IN ('completed', 'processing', 'pending') THEN amount ELSE 0 END), 0)::float as total_withdrawn,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0)::float as completed_withdrawn
  FROM pix_transfers WHERE personal_id = $1
`, [id])

// Saldo = total_received - total_withdrawn
const balance = (financials.total_received || 0) - (withdrawals.total_withdrawn || 0)

return success({ user, profile, recent_payments: payments, financials, withdrawals, balance })
```

### 1.2 Backend — `PATCH /admin/users/:id` campos expandidos
**Arquivo:** `workers/api/admin.ts`

Campos adicionais para super_admin:
- `password_hash` → permitir resetar senha (hash antes de salvar)
- `is_active` → ativar/desativar conta
- `email_verified` → marcar como verificado
- `cpf` → editar CPF

### 1.3 Backend — Novo endpoint `GET /admin/users/:id/balance`
Endpoint dedicado para saldo detalhado:
```typescript
adminRoutes.get('/users/:id/balance', async (c) => {
  // Retorna: saldo_disponivel, total_recebido, total_sacado, total_taxas,
  // lista de pagamentos confirmed, lista de saques, histórico de bônus
})
```

### 1.4 Backend — Novo endpoint `POST /admin/users/:id/adjust-balance`
```typescript
adminRoutes.post('/users/:id/adjust-balance', requireSuperAdmin, async (c) => {
  const { amount, type, description } = body
  // type: 'credit' (bônus/correção) ou 'debit' (estorno/penalidade)
  // Cria pagamento especial com payment_method = 'admin_adjustment'
  // Registra admin_id, motivo, timestamp
})
```

### 1.5 Frontend — Modal de edição expandido em `/admin/users`
- Abas: **Dados** | **Financeiro** | **Ações**
- Tab Dados: todos os campos editáveis (nome, email, phone, tipo, role, status, senha)
- Tab Financeiro: cards de saldo (total recebido, total sacado, saldo disponível, taxas), tabela de últimos 20 pagamentos, tabela de saques
- Tab Ações: bônus, ajuste de saldo, resetar senha, desativar conta

---

## 🎯 Sprint 2 — Edição Completa de Personals (Prioridade Alta)

### 2.1 Backend — `GET /admin/personals` com saldo
Adicionar ao SELECT:
```sql
-- Subquery para saldo inline
(SELECT COALESCE(SUM(net_amount), 0)::float FROM payments 
 WHERE recipient_id = u.id AND status = 'confirmed') as total_received,
(SELECT COALESCE(SUM(amount), 0)::float FROM pix_transfers 
 WHERE personal_id = u.id AND status IN ('completed', 'processing', 'pending')) as total_withdrawn
```
E calcular `balance = total_received - total_withdrawn` no retorno.

### 2.2 Backend — `PATCH /admin/personals/:id` campos expandidos
Campos adicionais:
- `subscription_plan` → trial, free, pro, max
- `subscription_status` → active, inactive, cancelled, expired
- `subscription_started_at` → data início
- `subscription_expires_at` → data expiração (poder estender trial, dar pro grátis)
- `trial_ends_at` → estender trial
- `cref` → editar CREF
- `cref_state` → estado do CREF
- `cref_verified` → marcar como verificado
- `specialties` → array de especialidades
- `bio` → biografia
- `is_public_profile` → perfil público on/off
- `accepted_fee_percentage` → taxa aceita
- `referral_code` → código de indicação
- `total_students` → corrigir contagem
- `active_students` → corrigir contagem

### 2.3 Frontend — Página de personals com saldo
- Coluna extra na tabela: **Saldo** (formatCurrency)
- Badge verde se saldo > 0, cinza se 0
- Clicar no saldo abre modal com detalhes financeiros
- Modal de edição expandido com todos os campos acima

### 2.4 Frontend — Ação "Dar Plano Pro" rápida
- Botão ⚡ na tabela de personals
- Seleciona plano (pro/max) e duração (30d/90d/1ano/lifetime)
- Atualiza `subscription_plan`, `subscription_status`, `subscription_expires_at`

---

## 🎯 Sprint 3 — Gerenciamento Financeiro Admin (Prioridade Média)

### 3.1 Backend — `POST /admin/payments/:id/cancel`
Cancelar pagamento confirmed (ajusta saldo):
```typescript
// 1. Muda status para 'cancelled'
// 2. Registra motivo e admin_id
// 3. Recalcula saldo do personal
```

### 3.2 Backend — `POST /admin/payments/:id/refund`
Estorno parcial ou total:
```typescript
// 1. Cria registro de estorno
// 2. Tenta estorno no Asaas (se tiver asaas_payment_id)
// 3. Ajusta net_amount
```

### 3.3 Backend — `POST /admin/payments/manual`
Criar pagamento manual (sem Asaas):
```typescript
// 1. Super admin escolhe personal e aluno
// 2. Define valor, descrição, método
// 3. Pagamento já nasce como 'confirmed'
// 4. net_amount = amount (sem taxa, é ajuste manual)
```

### 3.4 Backend — `POST /admin/transfers/:id/cancel`
Cancelar saque PIX:
```typescript
// 1. Muda status para 'cancelled'
// 2. Tenta cancelar no Asaas (se possível)
// 3. Saldo restaurado automaticamente
```

### 3.5 Frontend — Tab "Ajustes Manuais" em admin/payments
- Formulário para criar pagamento manual
- Formulário para ajuste de saldo (bônus/débito)
- Tabela de ajustes manuais com filtros
- Histórico de ações do admin (audit trail)

---

## 🎯 Sprint 4 — Audit Log (Prioridade Média)

### 4.1 Migration — Nova tabela `admin_audit_logs`
```sql
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,          -- 'user.update', 'payment.cancel', 'balance.adjust', etc.
  target_type VARCHAR(50) NOT NULL,      -- 'user', 'personal', 'payment', 'transfer'
  target_id UUID NOT NULL,
  changes JSONB,                         -- { field: { old: X, new: Y } }
  metadata JSONB,                        -- dados extras (motivo, IP, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_target ON admin_audit_logs(target_type, target_id);
CREATE INDEX idx_audit_created ON admin_audit_logs(created_at DESC);
```

### 4.2 Backend — Helper `logAdminAction()`
```typescript
async function logAdminAction(env: Bindings, params: {
  adminId: string
  action: string
  targetType: string
  targetId: string
  changes?: Record<string, { old: unknown; new: unknown }>
  metadata?: Record<string, unknown>
}) {
  await pgQuery(env, `INSERT INTO admin_audit_logs ...`)
}
```

### 4.3 Frontend — Página `/dashboard/admin/audit`
- Tabela de logs com filtros (por admin, ação, target, data)
- Detalhes expandíveis mostrando changes (diff visual)
- Export CSV

---

## 🎯 Sprint 5 — Dashboard Financeiro Avançado (Prioridade Baixa)

### 5.1 Gráficos de receita
- Receita total por período (diário/semanal/mensal)
- Receita por personal (top 10)
- Taxas Asaas acumuladas
- Saques por período

### 5.2 Relatórios exportáveis
- CSV de pagamentos por período
- CSV de saques por período
- PDF resumo mensal

### 5.3 Alertas admin
- Notificação push quando pagamento > R$100
- Notificação quando saque > R$500
- Notificação de novo personal cadastrado

---

## 📊 Resumo de Estimativa

| Sprint | Descrição | Esforço | Arquivos |
|---|---|---|---|
| **Sprint 1** | Edição completa de usuários | ~4-6h | `admin.ts`, `use-admin.ts`, `admin/users/page.tsx` |
| **Sprint 2** | Edição completa de personals + saldo | ~4-6h | `admin.ts`, `use-admin.ts`, `admin/personals/page.tsx` |
| **Sprint 3** | Gerenciamento financeiro | ~3-4h | `admin.ts`, `use-admin.ts`, `admin/payments/page.tsx` |
| **Sprint 4** | Audit log | ~3-4h | migration, `admin.ts`, nova página |
| **Sprint 5** | Dashboard financeiro avançado | ~4-6h | `admin.ts`, nova página + Recharts |

---

## ⚡ Quick Wins (podem ser feitos individualmente)

1. **Mostrar saldo na lista de personals** — 30min (backend subquery + frontend coluna)
2. **Mostrar saldo no detalhe do user** — 30min (backend query + frontend card)
3. **Botão "Dar Pro"** — 45min (PATCH plano + modal frontend)
4. **Botão "Resetar Senha"** — 30min (PATCH password_hash + modal)
5. **Botão "Cancelar Pagamento"** — 45min (PATCH status + confirmação)
6. **Botão "Cancelar Saque"** — 30min (PATCH status)

---

## 🔴 Regras para Implementação

1. **Todo ajuste manual deve criar um registro** — nunca editar silenciosamente
2. **Bônus/débitos são pagamentos** com `payment_method = 'admin_adjustment'`
3. **net_amount de ajustes manuais = amount** (sem taxa Asaas)
4. **Audit log em TODA ação** — quem, quando, o quê, antes/depois
5. **Super admin only** para ações destrutivas (delete, débito, cancelamento)
6. **Admin** pode editar dados básicos e visualizar financeiro
7. **Confirmação dupla** para ações irreversíveis (delete, estorno)
