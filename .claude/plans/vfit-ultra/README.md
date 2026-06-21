# 🚀 VFIT ULTRA — Plano Mestre de Perfeição do Produto

> **Versão do plano:** 1.0.0 · **Criado:** 2026-06-21 · **Status:** 🟡 Aguardando aprovação (CEO + Eng review)
> **Objetivo:** Levar o VFIT de "70% pronto e bom" para **"100% funcional, ultramoderno e perfeito"** — cobrindo todos os painéis, todas as telas, todas as URLs, com onboarding/login instantâneos e trial de 1 mês grátis sem cartão.

---

## 🎯 Os 4 Pilares deste Plano

| # | Pilar | Resultado Esperado |
|---|-------|--------------------|
| 1 | **Trial 1 mês grátis, sem cartão/PIX** | Qualquer pessoa (personal **e** aluno) usa o produto completo por 30 dias sem fricção de pagamento. Conversão > coleta antecipada. |
| 2 | **Onboarding & Login instantâneos** | Tempo até o "aha moment" < 60s. Login em 1 toque (passkey/OAuth). Quiz reduzido + plano instantâneo. |
| 3 | **Cobertura total & perfeição** | Todas as ~169 telas, ~215 endpoints e 4 painéis funcionando perfeitamente. Zero TODO crítico, zero "Em breve" sem decisão. |
| 4 | **Ultramodernização** | Design system unificado, micro-interações, estados de loading/erro/vazio polidos. De 6.2/10 → **9/10**. |

---

## 📂 Índice dos Documentos

| Arquivo | O que contém |
|---------|--------------|
| [`00-EXECUTIVE-SUMMARY.md`](./00-EXECUTIVE-SUMMARY.md) | Visão, metas, métricas de sucesso, escopo e não-escopo |
| [`01-CURRENT-STATE.md`](./01-CURRENT-STATE.md) | Auditoria completa do que existe HOJE (URLs, painéis, backend, gaps) |
| [`02-TRIAL-AND-ONBOARDING.md`](./02-TRIAL-AND-ONBOARDING.md) | Trial 30d sem cartão + onboarding/login mais rápido possível |
| [`03-PANELS-STUDENT.md`](./03-PANELS-STUDENT.md) | Painel do Aluno: todas as telas, correções e melhorias |
| [`04-PANELS-PERSONAL.md`](./04-PANELS-PERSONAL.md) | Painel do Personal: todas as telas, correções e melhorias |
| [`05-PANELS-ADMIN.md`](./05-PANELS-ADMIN.md) | Admin + Super-Admin: telas, gaps e novas ferramentas |
| [`06-BACKEND-HARDENING.md`](./06-BACKEND-HARDENING.md) | Backend: paginação, transações, validação, performance, segurança |
| [`07-DESIGN-SYSTEM-ULTRA.md`](./07-DESIGN-SYSTEM-ULTRA.md) | Unificação do DS + polish ultramoderno |
| [`08-ROADMAP-SPRINTS.md`](./08-ROADMAP-SPRINTS.md) | Execução em sprints, sequência, dependências, riscos |
| [`09-EXPANSIONS.md`](./09-EXPANSIONS.md) | Expansões aprovadas no CEO review: E1 WhatsApp + E2 Loop viral |
| [`10-LOGIN-PUBLIC-REDESIGN.md`](./10-LOGIN-PUBLIC-REDESIGN.md) | Redesign de login + páginas públicas (spec de execução) |
| [`11-LOADING-SCREEN.md`](./11-LOADING-SCREEN.md) | Nova tela de loading leve ✅ **IMPLEMENTADA** |
| [`12-CONTENT-PIPELINE.md`](./12-CONTENT-PIPELINE.md) | Pipeline de conteúdo: imagens, vídeos, grupos musculares, avaliações |
| [`REVIEW-REPORTS.md`](./REVIEW-REPORTS.md) | Relatórios CEO + Eng + Design consolidados |
| [`TODOS.md`](./TODOS.md) | Itens adiados (E3 Coach IA, E4 Churn) + dívida técnica |
| [`TRACKING.md`](./TRACKING.md) | Tracking de tasks (obrigatório por RULES.md §20) |

---

## 🧭 Como ler este plano

1. Comece pelo **00-EXECUTIVE-SUMMARY** (5 min) → entende o porquê e as metas.
2. Veja **01-CURRENT-STATE** para o retrato fiel do hoje (a base de toda decisão).
3. Os docs **02–07** são os blocos de trabalho, cada um com: estado atual → o que mudar → tarefas → critério de "perfeito".
4. **08-ROADMAP** amarra tudo em sprints sequenciados.
5. **TRACKING** é a fonte de verdade da execução.

---

## ⚖️ Princípios de Decisão (herdados do projeto)

`segurança > correção > UX > performance > DX`

E para este plano, adicionamos:

- **Perfeição = nada pela metade.** Toda tela tem loading, vazio, erro e sucesso. Todo endpoint tem validação e paginação.
- **Velocidade percebida > velocidade real.** Plano instantâneo, optimistic UI, skeletons.
- **Trial sem atrito.** Coletar cartão é a última coisa, nunca a primeira.
- **Um só jeito de fazer cada coisa.** Um sistema de Card, uma hierarquia de Button, um token de cor.

---

> Próximo passo após aprovação: executar o **08-ROADMAP-SPRINTS** sprint a sprint, atualizando **TRACKING.md** em tempo real.
