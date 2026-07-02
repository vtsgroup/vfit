# VFIT — Análise de Bugs vs MVP Bloqueante

**Data:** 02/07/2026 | **Status:** v5.4.0 | **Objetivo:** Ganhar dinheiro com MVP funcional

---

## 🔴 CRÍTICO — Bloqueia MVP (RESOLVE PRIMEIRA)

### 1. Rotas internas servindo landing page (5.1)
**Status:** CRÍTICO — Funcionalidades essenciais inacessíveis
- **Afeta:** `/perfil/seguranca`, `/desafios`, `/comunidade`, `/configuracoes`
- **Impacto:** Usuário autenticado vê landing page pública em vez de telas específicas
- **Bloqueio MVP:** SIM — Aluno não consegue acessar desafios, comunidade, nem configurações
- **Causa:** Roteamento catch-all mal configurado ou páginas não implementadas
- **Fix:** Implementar as 4 páginas OU redirecionar para "Em Breve" (não landing)
- **Esforço:** S/M (implementar placeholders em breve) a L (implementar full)
- **Precedência:** FIX AGORA antes de qualquer outra coisa

### 2. Páginas travadas em carregamento (4.1)
**Status:** CRÍTICO — Bloqueio total de uso
- **Afeta:** `/treinos`, `/nutricao`, `/progresso` (parcialmente), lista `/perfil/notificacoes`
- **Impacto:** Renderizam "Carregando..." infinitamente — dados existem em outras rotas
- **Bloqueio MVP:** SIM — Treinos e nutrição são features core
- **Causa:** Falha silenciosa em API client-side, sem tratamento de erro/timeout
- **Fix:** Adicionar timeout, fallback UI, logging em Sentry
- **Esforço:** M
- **Precedência:** FIX AGORA — estas são as rotas principais

### 3. Avaliação física duplicada (1.1)
**Status:** CRÍTICO — Dados de saúde incorretos
- **Afeta:** `/avaliacoes` — duas avaliações idênticas
- **Impacto:** Saúde do usuário exibida errada, confusão em relatórios
- **Bloqueio MVP:** SIM — Avaliações são core para personal
- **Causa:** Double-submit ou falta de idempotência na API
- **Fix:** Implementar idempotency key, desabilitar botão após clique, constraint BD
- **Esforço:** S
- **Precedência:** FIX IMEDIATAMENTE

---

## 🟡 ALTA — Quebra confiança / gamificação (RESOLVE SEMANA 1)

### 4. XP inconsistente entre rotas (2.2)
**Status:** ALTA — Quebra confiança em gamificação
- **Afeta:** `/desafios` (12.480), `/avaliacoes` (4.920), `/comunidade` (3.280), `/configuracoes` (820)
- **Impacto:** Mesmo usuário vê 4 saldos diferentes — sistema parece broken
- **Bloqueio MVP:** SIM — Gamificação é diferencial VFIT
- **Causa:** Cada rota renderiza dados mockados/cache diferentes ao invés de estado global
- **Fix:** Unificar em Zustand store sincronizado com backend
- **Esforço:** M
- **Precedência:** FIX SEMANA 1

### 5. Streak sempre = 0 dias (2.4)
**Status:** ALTA — Desmotivação, gamificação quebrada
- **Afeta:** `/progresso`, `/progresso/streaks`, `/welcome`, `/login`
- **Impacto:** Contador nunca atualiza mesmo com XP sendo acumulado
- **Bloqueio MVP:** SIM — Streaks são motivador core
- **Causa:** Falta de sincronismo entre módulo de streak e motor de XP, cron/job não rodando
- **Fix:** Unificar lógica, validar cron/job, sincronizar com XP
- **Esforço:** M
- **Precedência:** FIX SEMANA 1

### 6. Notificação duplicada (1.2)
**Status:** MÉDIA — Ruído/confusão
- **Afeta:** `/perfil/notificacoes` — 2 notificações idênticas com 16s de diferença
- **Impacto:** Aluno vê "Seu plano está pronto!" duas vezes
- **Bloqueio MVP:** NÃO (cosmético, mas incomoda)
- **Causa:** Evento disparado 2x (falta idempotência/retry sem controle)
- **Fix:** Deduplicação por job ID, revisar retry de webhooks
- **Esforço:** S
- **Precedência:** DEFER se tempo apertar

---

## 🟠 MÉDIA — Inconsistência de dados (RESOLVE ANTES DE GANHAR DINHEIRO)

### 7. Meta de proteína divergente (2.1)
**Status:** MÉDIA — Inconsistência nutricional
- **Afeta:** `/welcome` (150g) vs `/login` e `/dashboard/marketplace` (152g)
- **Impacto:** Meta nutricional exibida com valores diferentes
- **Bloqueio MVP:** NÃO (marginal)
- **Causa:** Cálculo não centralizado
- **Fix:** Centralizar em endpoint/store único
- **Esforço:** S
- **Precedência:** DEFER 1 week

### 8. Badge notificações inconsistente (2.3)
**Status:** MÉDIA — Confusão visual
- **Afeta:** Header global — exibe "2" em alguns lugares, sem número em `/perfil`
- **Impacto:** Usuário não sabe se tem notificações não lidas
- **Bloqueio MVP:** NÃO (UI cosmética)
- **Causa:** Componente não puxando de estado global consistente
- **Fix:** Garantir sempre mesmo estado global
- **Esforço:** S
- **Precedência:** DEFER 2 weeks

---

## 🟢 BAIXA — UI/UX (POLISH DEPOIS DE FUNCIONAR)

### 9. Textos quebrados (3.1, 3.2)
**Status:** BAIXA — Poluição visual, não bloqueante
- **Exemplos:** "SEQUÊNCIA ATIVA: 0 dias" + "3 dias para 3 dias" + "Início: 3 dias"
- **Fix:** Revisar templates de interpolação
- **Esforço:** S
- **Precedência:** DEFER 2 weeks (polish)

### 10. Versão contraditória (6.1)
**Status:** BAIXA — Confusão para power users
- **Afeta:** Changelog mostra v7.0.0, 6.7.0, 6.5.0 mas build é 5.4.0
- **Fix:** Sincronizar número de versão com build real
- **Esforço:** S
- **Precedência:** DEFER 3 weeks (não impacta funcionalidade)

### 11. Estatísticas zeradas + depoimentos duplicados (7.1, 7.2)
**Status:** BAIXA — Marketing, não funcional
- **Fix:** Substituir por dados reais
- **Esforço:** S
- **Precedência:** DEFER post-launch

---

## 📊 Matriz de Priorização

| Prioridade | Bug | Esforço | Bloqueio MVP | Quando |
|---|---|---|---|---|
| 🔴 CRÍTICA | Rotas servindo landing (5.1) | M | SIM | **HOJE** |
| 🔴 CRÍTICA | Páginas travadas (4.1) | M | SIM | **HOJE** |
| 🔴 CRÍTICA | Avaliação duplicada (1.1) | S | SIM | **HOJE** |
| 🟡 ALTA | XP inconsistente (2.2) | M | SIM | Semana 1 |
| 🟡 ALTA | Streak = 0 (2.4) | M | SIM | Semana 1 |
| 🟠 MÉDIA | Notificação duplicada (1.2) | S | NÃO | Semana 1 (se tempo) |
| 🟠 MÉDIA | Meta proteína (2.1) | S | NÃO | Semana 2 |
| 🟠 MÉDIA | Badge notificações (2.3) | S | NÃO | Semana 2 |
| 🟢 BAIXA | Textos quebrados (3.1, 3.2) | S | NÃO | Polish |
| 🟢 BAIXA | Versão contraditória (6.1) | S | NÃO | Polish |
| 🟢 BAIXA | Estatísticas zeradas (7.1, 7.2) | S | NÃO | Post-launch |

---

## ✅ MVP Viabilidade

**Crítica — RESOLVE AGORA (3 bugs, ~8-10h human / ~1-2h CC):**
- ✅ Roteamento interno (rotas não servindo landing)
- ✅ Páginas travadas (timeout + fallback)
- ✅ Avaliação duplicada (idempotência)

**Depois PODE ganhar dinheiro com:**
- ✅ Treinos funcionais (novidade)
- ✅ Notificações WhatsApp (novidade)
- ✅ Marketplace (novidade)
- ⚠️ Gamificação (needs fixes na semana 1)

**NÃO BLOQUEIA MVP:**
- Outros 8 bugs (média + baixa prioridade)

---

## 🚀 Recomendação Executiva

1. **FIX HOJE (3-4h):** Rotas + páginas travadas + avaliação duplicada
2. **DEPLOY HOJE:** v5.4.1 com 3 fixes críticas
3. **SEMANA 1:** XP + Streaks + começar treinos reais
4. **SEMANA 2:** Treinos + Marketplace + Notificações = **MVP completo pronto para ganhar dinheiro**

**Não espere perfeição.** Arrisque, ganhe, itere.
