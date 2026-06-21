# 02 — Trial 30 dias sem cartão + Onboarding/Login instantâneos

> A mudança de **maior alavancagem** do plano. Aqui mora a diferença entre "produto bom" e "máquina de ativação".

---

## PARTE A — Trial de 1 mês grátis, sem cartão/PIX

### A.1 Estado atual
- **Personal:** trial **14 dias** sem cartão, mas **sem downgrade automático** ao expirar.
- **Aluno:** **sem trial**; free imediato + paywall que **pede cartão** para premium logo após o quiz.
- **Bug:** check de subscription no app sempre `false`.

### A.2 Decisão de produto

> **⚠️ DECISÃO 1 (para CEO review):** Trial de **30 dias de acesso COMPLETO (Pro/Premium), sem nenhum dado de pagamento**, para **personal E aluno**. Cartão/PIX só na hora de assinar de fato.

**Modelo unificado de ciclo de vida da conta:**

```
NOVO  ──signup──▶  TRIALING (30d, full access, sem cartão)
                        │
            ┌───────────┼────────────────────────┐
            │ dia 25-29 │ assina                  │ não assina até dia 30
            ▼           ▼                          ▼
      reminders    ACTIVE (pago)             EXPIRED → downgrade gracioso
      (email/push)                           (FREE p/ aluno · READ-ONLY p/ personal)
```

### A.3 Mudanças de banco (migrations)

Nova migration `migrations/hyperdrive/00XX_unified_trial.sql`:

```sql
-- Personals: padronizar trial para 30d e status de ciclo
ALTER TABLE personals
  ALTER COLUMN subscription_status SET DEFAULT 'trialing';
-- (trial_ends_at já existe; passa a ser NOW()+30d no signup)

-- vfit_subscriptions (aluno): suportar trial sem pagamento
ALTER TABLE vfit_subscriptions
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(20) DEFAULT 'trialing'
       CHECK (lifecycle_status IN ('trialing','active','past_due','expired','canceled','free'));

-- Índices para o cron de expiração
CREATE INDEX IF NOT EXISTS idx_personals_trial_ends ON personals (trial_ends_at)
  WHERE subscription_status = 'trialing';
CREATE INDEX IF NOT EXISTS idx_vfitsub_trial_ends ON vfit_subscriptions (trial_ends_at)
  WHERE lifecycle_status = 'trialing';
```

> **Regra:** seguir RULES §1 (`sql.query`), §9 (nomes de coluna corretos: `subscription_plan`/`subscription_expires_at`). Planejar rollback (RULES "nunca migration sem rollback").

### A.4 Mudanças de backend

1. **Signup (`auth.ts`):**
   - Personal: `trial_ends_at = NOW()+30d`, `subscription_status='trialing'`, `subscription_plan='pro'` durante o trial.
   - Aluno: criar `vfit_subscriptions` com `lifecycle_status='trialing'`, `plan_type='premium'`, `trial_started_at=NOW()`, `trial_ends_at=NOW()+30d`. **Nenhuma chamada Asaas.**

2. **Novo helper `lib/entitlements.ts`** — fonte única de verdade de "o que esse usuário pode fazer":
   ```ts
   // resolve plano efetivo considerando trial ativo
   export function resolveEntitlements(user, sub): {
     plan: 'free'|'pro'|'premium'|'max',
     isTrialing: boolean, trialDaysLeft: number, canAccessPremium: boolean
   }
   ```
   Usado tanto no middleware quanto no frontend (via `/auth/me`).

3. **`/auth/me` retorna entitlements** → corrige o bug do check sempre `false`. O frontend para de adivinhar.

4. **Middleware de gating** (`workers/middleware/entitlements.ts`): rotas premium checam `canAccessPremium`. Durante trial = `true`.

5. **Cron de expiração** (estende `workers/cron/`):
   - Diário: marca `trialing` com `trial_ends_at < NOW()` como `expired` → downgrade.
   - D-5, D-2, D-0: dispara emails/push de lembrete (via queue, best-effort).

### A.5 Mudanças de frontend

1. **Pós-signup vai direto ao produto** (não ao paywall). Banner: "🎁 Você tem 30 dias Premium grátis — sem cartão."
2. **Paywall reposicionado:** só aparece para `free` (pós-trial) ou via CTA "Assinar" — **nunca** bloqueando o início.
3. **Widget de trial** persistente e elegante (não-intrusivo): "Premium grátis · faltam 12 dias" com CTA suave "Garantir meu plano".
4. **Tela `/perfil/assinatura`** mostra status real do ciclo (trialing/active/expired) com dias restantes.
5. **Reminders in-app** dias 25-30 com social proof e oferta (mantém as camadas de desconto existentes, mas no fim do trial, não no início).

### A.6 Anti-abuso (trial sem cartão atrai fraude)
- Reusar `banned_identifiers` (já existe) + 1 trial por CPF + 1 por device fingerprint + email único.
- Rate-limit de signup por IP (já há infra de rate-limit).
- Flag de risco no admin (já existe `risk_level`) alimentada por heurística (mesmo device, múltiplos CPFs).

> **⚠️ DECISÃO 2:** Pós-trial do **personal** — downgrade para **read-only** (vê dados, não cria/edita) ou **bloqueio total com tela de upgrade**? Recomendação: **read-only** (menos hostil, preserva dados, facilita reativação).

> **⚠️ DECISÃO 3:** Pós-trial do **aluno** — cai para **free** (perde recursos premium da IA/nutrição avançada) mantendo histórico. Recomendação: **free com histórico preservado**.

---

## PARTE B — Onboarding & Login mais rápidos possíveis

### Princípio-guia
> **Tempo até valor < 60 segundos.** A pessoa precisa VER o plano dela antes de qualquer fricção. Cadastro e pagamento vêm depois do valor demonstrado.

### B.1 Login (já bom → tornar instantâneo)
- **Passkey/biometria como caminho primário** quando disponível (já implementado — promover na UI).
- **OAuth Google em 1 toque** no topo (já existe).
- **Turnstile invisível** (manter, mas modo invisível; só desafia em risco).
- **"Lembrar de mim" + sessão de 30d** já há refresh — garantir reentrada sem re-login.
- Meta: usuário recorrente reentra em **< 3s, 1 toque**.

### B.2 Cadastro do Aluno — "entre primeiro, complete depois"
Fluxo novo:
```
/welcome → quiz (enxuto) → PLANO INSTANTÂNEO visível → [criar conta em 1 toque: Google/Apple/email]
         → conta criada em background → já dentro do app com 30d Premium
```
- **Cadastro adiado:** o quiz roda **sem conta**; ao ver o plano, conta criada com 1 toque (OAuth) ou email+senha mínimos.
- CPF **opcional** no cadastro (pedir só quando necessário p/ pagamento).
- Verificação de email **não-bloqueante** (já é assim) — banner suave para verificar.

### B.3 Quiz do Aluno — de 16 → ≤ 12 passos
Cortes e otimizações:

| Passo atual | Ação |
|-------------|------|
| Motivacional (6) e Prova social (15) | **Remover como passos** (virar micro-elemento na transição, não tela) |
| Idade, altura, peso, peso-alvo | **Agrupar em 1 tela** "sobre você" com defaults e teclado numérico |
| Lesões / restrições | Manter, mas com "nenhuma" em destaque (skip rápido) |
| Horário preferido | **Default "qualquer"** + skip |
| Músculos-alvo | Manter (é diferencial visual) |

Resultado: **10-12 interações reais**, ~60-90s.

### B.4 Plano INSTANTÂNEO (a mudança que mais acelera o "aha")
- **Hoje:** `POST /plans/generate` usa IA (30-45s) → tela de loading longa.
- **Novo modelo de 2 fases:**
  1. **Fase instantânea (< 1s):** motor **rule-based** local/edge mapeia respostas do quiz → template pré-construído. Usuário vê o plano **imediatamente**.
  2. **Fase de refino (background):** IA refina/personaliza e atualiza o plano sem travar a tela ("✨ Personalizando seu plano..." → atualiza in-place quando pronto).
- Banco de **templates curados** (já há `/templates` em D1) cobrindo combinações comuns (objetivo × nível × local × dias).

### B.5 Cadastro do Personal — reduzir atrito do 2-passos
- **Passo 1 mínimo:** email + senha (ou OAuth) → **já entra no dashboard** com trial 30d.
- **Passo 2 adiado:** CREF, estado, especialidades viram **checklist de "complete seu perfil"** dentro do dashboard (já existe `/dashboard/complete-profile` + `/dashboard/onboarding` checklist).
- CPF/lookup só quando for configurar recebimentos (Asaas).
- Resultado: personal vê o dashboard em **< 30s**, completa o resto no próprio ritmo.

### B.6 Métricas-alvo
| Fluxo | Hoje | Meta |
|-------|------|------|
| Login recorrente | ~5-10s | **< 3s, 1 toque** |
| Quiz aluno | 16 passos / 2-3 min | **≤ 12 passos / < 90s** |
| Ver 1º plano | +30-45s (IA) | **< 1s (rule-based)** |
| Signup → dentro do app | ~3-4 min | **< 60s** |
| Personal → dashboard | ~2-3 min | **< 30s** |

---

## C — Tarefas (resumo; tracking detalhado no TRACKING.md)

**Trial:**
- [ ] T-TRIAL-1 Migration unified trial (+rollback)
- [ ] T-TRIAL-2 `lib/entitlements.ts` (fonte única)
- [ ] T-TRIAL-3 Signup personal+aluno cria trial 30d sem Asaas
- [ ] T-TRIAL-4 `/auth/me` retorna entitlements (corrige bug check `false`)
- [ ] T-TRIAL-5 Middleware de gating premium
- [ ] T-TRIAL-6 Cron expiração + reminders D-5/D-2/D-0
- [ ] T-TRIAL-7 Frontend: banner trial, paywall reposicionado, widget dias restantes
- [ ] T-TRIAL-8 Anti-abuso (1 trial/CPF/device)

**Onboarding/Login:**
- [ ] T-ONB-1 Quiz 16→12 passos (remover telas motivacional/prova social; agrupar dados)
- [ ] T-ONB-2 Motor rule-based de plano instantâneo (+ banco de templates)
- [ ] T-ONB-3 Refino IA em background (update in-place)
- [ ] T-ONB-4 Cadastro aluno adiado (quiz sem conta → 1-tap signup)
- [ ] T-ONB-5 Cadastro personal mínimo + complete-profile checklist
- [ ] T-ONB-6 Login: passkey/OAuth primário, Turnstile invisível
- [ ] T-ONB-7 Instrumentar funil (eventos para medir as métricas-alvo)

---

## D — Critério de "perfeito" para este bloco
- ✅ Pessoa nova vê seu primeiro plano em **< 1s** e está dentro do app em **< 60s**, sem cartão.
- ✅ Trial de 30d funciona ponta-a-ponta (signup → uso → reminders → expiração → downgrade/assinatura).
- ✅ Bug de subscription `false` eliminado; entitlements corretos em todo o app.
- ✅ Funil instrumentado e medindo as metas da seção B.6.
