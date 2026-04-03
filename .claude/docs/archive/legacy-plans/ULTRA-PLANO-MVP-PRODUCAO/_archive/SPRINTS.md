# 🏃 Sprints — Execução rápida (22/02/2026)

> Objetivo: organizar a sequência de execução **com pressa**, mantendo qualidade (gates) e documentação mínima.

## 📌 Estado atual (baseline)
- Versão em produção: **v3.8.1**
- Ajustes recentes:
   - simulação efetiva do `super_admin` fora da área `/admin`;
   - notas privadas administrativas por conta (`admin_account_notes`);
   - smoke autenticado requer tokens válidos (`SMOKE_*`) e evidência atualizada em `AUTH-SMOKE.generated.md`.

---

## ✅ Regras de execução (sempre)
- Antes de deploy: `npm run quality:ci`
- Deploy: sempre via `node scripts/cf-deploy.js patch --msg "..."`
- Pós-deploy (na mesma sessão):
  - atualizar [docs/CHANGELOG.md](../CHANGELOG.md)

---

## Sprint 02 — Auth/Passkey/Observabilidade (hardening final)
**Meta:** estabilidade e UX sólida nos fluxos críticos de autenticação.

### Entregas
1. **Passkey — “estado único”**
   - Se existe passkey no servidor → não sugerir prompt, e UI refletir “Ativo”.
   - Se não existe → CTA claro “Ativar biometria”.

2. **Turnstile — reduzir “widget hung”**
   - Retentar widget quando expira/hang.
   - Mensagem para usuário sem travar fluxo.

3. **Debug logs — best-effort impecável**
   - Sem polling quando não autenticado.
   - Sem loop de erros silenciosos.
   - Persistência em Postgres (sem KV) e UI dedicada por role.

### Critérios de aceite
- Não há spam de `401` no console.
- Passkey: Apple e gerenciadores (NordPass) não travam fluxo.

---

## Sprint 03 — Payments (cobranças) + UX de falhas
**Meta:** reduzir fricção e aumentar previsibilidade de pagamentos.

### Entregas
- Mensagens de erro amigáveis (PIX/boleto/cartão).
- Checklist de sucesso pós-checkout.
- Melhorias em notificações (best-effort).

### Implementado (22/02/2026)
- Checkout do aluno: CPF obrigatório para emissão (PIX/Boleto) + banner de erro global.
- Polling por método (reduz spam/custo): PIX 5s, cartão 15s, boleto 60s.

---

## Sprint 04 — Chat/IA (qualidade e limites)
**Meta:** estabilidade, limites e UX consistente.

### Entregas
- Guardrails de custo/limite de uso.
- Melhorar fallback (demo mode) sem confundir.

### Implementado (22/02/2026)
- Guardrail mensal (quota) na API de IA + erro 429 amigável.

---

## Sprint 05 — Admin (super powers) + Governança
**Meta:** ferramentas admin rápidas e seguras.

### Entregas
- Auditoria/ações admin com confirmação.
- Log mínimo de ações admin (sem dados sensíveis).

### Implementado (22/02/2026)
- Auditoria mínima (best-effort) no backend gravando ações admin em `app_logs`.

---

## Sprint Final — NI-01 Smoke autenticado (deixar por último)
**Meta:** rodar `npm run smoke:auth:local` com tokens válidos e salvar evidência.

### Saídas
- Atualizar [docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md](AUTH-SMOKE.generated.md)
