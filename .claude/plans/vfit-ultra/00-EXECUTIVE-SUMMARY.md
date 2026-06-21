# 00 — Sumário Executivo

> **Para quem tem 5 minutos.** O resto do plano detalha cada linha aqui.

---

## 1. Onde estamos (verdade nua)

O VFIT é um SaaS maduro e impressionante para personal trainers, com **duas faces**:

- **B2B (Dashboard)** — para o personal/admin: ~80-85% completo, sólido em alunos, treinos, pagamentos (Asaas/Stripe), avaliações físicas e gamificação.
- **B2C (App do Aluno)** — para o aluno: ~85% completo, com uma experiência de **treino ativo excepcional** (offline, wake-lock, timers), nutrição com câmera IA, e progresso.

Números reais do levantamento:
- **~169 páginas/rotas** Next.js (App Router, static export).
- **~215 endpoints** em **39 módulos** Hono no Cloudflare Workers.
- **59 tabelas PostgreSQL (Neon)** + **5 tabelas D1** (cold data de exercícios).
- **Design System v3** documentado, mas com inconsistências de implementação (nota atual **6.2/10**).

**Problema central:** o produto está "70-85% em quase tudo". Faltam os 15-30% finais que separam "bom" de "perfeito" — e algumas decisões de produto importantes (trial, paywall) não estão alinhadas com a estratégia de crescimento que o usuário quer.

---

## 2. Onde queremos chegar

> **VFIT como o app de personal trainer mais polido do Brasil — onde a pessoa entra, vê valor em < 60s, treina 1 mês grátis sem dar cartão, e converte por amor ao produto.**

Três mudanças estratégicas:

### 🎁 (A) Trial de 1 mês grátis, sem cartão/PIX
- **Hoje:** personal tem trial de **14 dias** (já sem cartão). Aluno tem free + paywall que pede cartão para premium.
- **Meta:** **30 dias** de acesso **completo** (Premium/Pro), **sem nenhum dado de pagamento**, para personal **e** aluno. Cartão só aparece quando a pessoa decide assinar — nunca para começar.
- **Por quê:** remover atrito de cadastro multiplica ativação. A coleta de cartão antecipada é o maior ralo de conversão em SaaS brasileiro.

### ⚡ (B) Onboarding & Login instantâneos
- **Hoje:** quiz de aluno tem **16 passos** + geração de plano por IA (30-45s). Cadastro de personal tem 2 passos + lookup de CPF. Login já é bom (passkey/OAuth).
- **Meta:** **"aha moment" em < 60s.** Quiz enxuto (10-12 passos com defaults inteligentes), **plano instantâneo** (rule-based em < 1s, IA refina em background), cadastro adiado ("entre primeiro, complete depois").

### 💎 (C) Cobertura total + ultramodernização
- Toda tela com os 4 estados (loading/vazio/erro/sucesso).
- Zero TODO crítico no código (ex.: subscription check sempre `false`, custom-workout API não conectada).
- Backend: paginação em todos os `/admin/*`, transações em pagamentos, validações faltantes, performance (N+1, TTLs).
- Design: unificar 5 sistemas de Card em 1, consolidar 13 variantes de Button, eliminar cores hardcoded, adicionar micro-interações.

---

## 3. Métricas de Sucesso (como saberemos que está perfeito)

| Métrica | Hoje (estimado) | Meta |
|---------|-----------------|------|
| Tempo até "aha moment" (signup → 1º plano visto) | ~3-4 min | **< 60s** |
| Passos do onboarding do aluno | 16 | **≤ 12** |
| Trial sem cartão | 14d (personal) / paywall (aluno) | **30d completo, ambos** |
| Telas com os 4 estados (loading/vazio/erro/sucesso) | ~40% | **100%** |
| Endpoints `/admin/*` com paginação | parcial | **100%** |
| TODOs críticos no código | ≥ 3 conhecidos | **0** |
| Nota Design System (auditoria interna) | 6.2/10 | **≥ 9/10** |
| Funcionalidades "Em breve" sem decisão | várias (social, IA subpages) | **0** (entregar ou remover) |
| Cobertura de testes em fluxos críticos (auth, pagamento, trial) | parcial | **smoke + unit verde** |

---

## 4. Escopo

### ✅ Dentro do escopo
- Reformular trial e paywall (B2B + B2C).
- Reduzir e acelerar onboarding/login.
- Completar/corrigir todas as telas dos 4 painéis.
- Endurecer (harden) o backend nos pontos levantados.
- Unificar e modernizar o design system.
- Garantir os 4 estados em 100% das telas.

### ❌ Fora do escopo (por ora — decisões a confirmar no review)
- Internacionalização (i18n) — produto é PT-BR only. *Candidato a fase futura.*
- Integração com wearables (Apple Watch, etc.). *Fase futura.*
- App nativo além do TWA existente.
- Reescrita de arquitetura (a stack atual é adequada).

---

## 5. Riscos principais (detalhe em 08-ROADMAP)

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Trial sem cartão → abuso/multi-conta | Média | Verificação por device/CPF/email + ban list já existente + limite por CPF |
| Mudança de paywall reduz receita curto prazo | Média | A/B test, medir conversão trial→pago, reminders inteligentes nos dias 25-30 |
| Webhook Asaas inconsistente em fluxo de pagamento | Alta | Wrapper transacional + idempotência por `asaas_payment_id` (já no backend) |
| Refactor de design system quebra telas | Média | Migração incremental, codemod, smoke visual por tela |
| Escopo gigante → fadiga | Alta | Sprints curtos, cada um entregável e deployável isoladamente |

---

## 6. Estratégia de Execução (resumo)

8 sprints, cada um **deployável** e com valor isolado:

1. **S1 — Trial & Paywall** (a mudança de maior alavancagem de negócio)
2. **S2 — Onboarding/Login instantâneo**
3. **S3 — Backend Hardening** (paginação, transações, validação)
4. **S4 — Design System Unificação** (Card, Button, tokens)
5. **S5 — Painel Aluno: completar tudo**
6. **S6 — Painel Personal: completar tudo**
7. **S7 — Admin/Super-Admin: completar tudo**
8. **S8 — Ultramodernização & polish final** (micro-interações, 4 estados, QA total)

Detalhe completo, tarefas e dependências em [`08-ROADMAP-SPRINTS.md`](./08-ROADMAP-SPRINTS.md).

---

> **Decisões que precisam do CEO/Eng review antes de executar:** ver caixas "⚠️ DECISÃO" espalhadas nos docs 02-07 e consolidadas no fim do 08-ROADMAP.
