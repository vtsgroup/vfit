# 09 — Expansões Aprovadas (CEO Review)

> Adicionadas ao escopo no `/plan-ceo-review` (modo SELECTIVE EXPANSION, 2026-06-21).
> Estas NÃO existiam no produto. São alavancas de **crescimento e retenção**, apoiadas em infra que o VFIT já possui.

---

## E1 — WhatsApp como Canal de Produto ✅ NO ESCOPO

### Visão
O brasileiro vive no WhatsApp. Hoje o WhatsApp no VFIT é só processo operacional (RULES §18). Transformá-lo em **canal de produto** é o maior diferencial competitivo possível no mercado BR.

### Escopo
1. **Lembrete de treino** — push do treino do dia via WhatsApp ("Bora treinar 💪 Peito & Tríceps hoje").
2. **Check-in do aluno** — aluno responde "✅ treinei" → registra adesão (alimenta gamificação/streak e o radar de churn E4 futuro).
3. **Cobrança via WhatsApp** — link de pagamento Asaas (PIX) enviado pelo WhatsApp pelo personal; confirmação automática via webhook.
4. **Onboarding assist** — boas-vindas + ativação do trial via WhatsApp.

### Provider: Unipile API ✅ (decisão do usuário)
- **Usaremos a Unipile API** para o WhatsApp (não WhatsApp Business API/HSM direto).
- **Já há infra:** `lib/unipile-agents.ts` no projeto (hoje dispatch de Instagram) → estender para WhatsApp.
- Vantagem: sem fila de aprovação de templates HSM; envio/recepção via Unipile; mesma camada para múltiplos canais.

### Apoio em infra existente
- `lib/unipile-agents.ts` (cliente Unipile já presente).
- Pagamentos Asaas (PIX/link) já robustos (`payments.ts`).
- OneSignal/notifications como fallback.

### Backend novo
- `workers/api/whatsapp.ts` — webhook de entrada (respostas via Unipile), envio de mensagens, opt-in/opt-out.
- `lib/unipile-whatsapp.ts` — wrapper sobre a Unipile API (send/receive), reaproveitando padrão de `unipile-agents.ts`.
- Secret `UNIPILE_API_KEY` / `UNIPILE_DSN` (env local autorizado).
- Tabela `whatsapp_optin` (LGPD: consentimento explícito) + `whatsapp_messages` (log).

### Riscos
- LGPD: opt-in obrigatório, opt-out fácil.
- Limites/custo da conta Unipile → medir.
- Mapeamento de conta WhatsApp ↔ Unipile (provisionar conexão).

### Tarefas (ver TRACKING S-WA)
- [ ] WA.1 Conectar conta WhatsApp na Unipile + `lib/unipile-whatsapp.ts`
- [ ] WA.2 `workers/api/whatsapp.ts` (envio + webhook entrada via Unipile)
- [ ] WA.3 Opt-in/opt-out + tabela consentimento (LGPD)
- [ ] WA.4 Lembrete de treino (cron + template)
- [ ] WA.5 Check-in do aluno (resposta → adesão)
- [ ] WA.6 Cobrança via WhatsApp (link Asaas + confirmação webhook)
- [ ] WA.7 Painel admin: logs/opt-in/métricas WhatsApp

> **Sequenciamento:** sprint dedicado **S-WA**, depois de S1 (trial) e em paralelo a S5/S6. Não bloqueia o núcleo.

---

## E2 — Loop Viral no Trial ✅ NO ESCOPO

### Visão
Você já vai dar 30 dias grátis sem cartão (doc 02). Em vez de o trial ser puro custo, ele vira **motor de aquisição**: "indique um amigo, os dois ganham +30 dias".

### Escopo
1. **Refer-a-friend:** cada usuário (personal e aluno) tem link de indicação.
2. **Recompensa dupla:** indicado e indicador ganham +30 dias de Premium ao indicado ativar o trial (ou converter).
3. **Aluno → Personal:** aluno satisfeito indica seu personal (ou vira lead para a plataforma).
4. **Tracking e antifraude:** reaproveita `referrals`/`affiliates` + anti-abuso do doc 02 A.6 (1 trial/CPF/device).

### Apoio em infra existente
- Tabelas `referrals` e `affiliates` já existem (auth.ts cria referral_code no signup).
- Sistema de entitlements (doc 02) controla a extensão de prazo.

### Backend
- Estender `affiliates.ts`/`referrals` para conceder **extensão de trial** (não só comissão).
- Endpoint `POST /referrals/redeem` + validação antifraude.

### Riscos
- Abuso (contas falsas farmando dias) → antifraude do doc 02 + cap de extensões por conta.
- Canibalização de receita → cap total de dias grátis acumuláveis (ex.: máx 90d).

### Tarefas (ver TRACKING, integra ao S1)
- [ ] V.1 Link de indicação por usuário (personal + aluno)
- [ ] V.2 `POST /referrals/redeem` concede +30d (com cap)
- [ ] V.3 Antifraude (1 trial/CPF/device + cap de dias acumulados)
- [ ] V.4 UI: tela "indique e ganhe" + compartilhamento (WhatsApp via E1)
- [ ] V.5 Painel admin: métricas de viralidade (k-factor)

> **Sequenciamento:** integra ao **S1** (trial). É o complemento natural do trial sem cartão.

---

## Integração com o roadmap
- **E2 (viral)** → dentro do **S1**.
- **E1 (WhatsApp)** → novo sprint **S-WA** (após S1, paralelo a S5/S6).
- Métricas novas no painel admin (doc 05 §4): k-factor (viral), engajamento WhatsApp.

Ver [`08-ROADMAP-SPRINTS.md`](./08-ROADMAP-SPRINTS.md) e [`TRACKING.md`](./TRACKING.md) atualizados.
