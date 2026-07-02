# 🤖 PROMPT PARA USAR NO CLAUDE CODE

**Copie e cole este prompt para começar:**

---

## PROMPT 1: Fix dos 3 Bugs (Comece com este)

```
/deploy patch

Vamos fixar os 3 bugs críticos que bloqueiam MVP:

1. Roteamento interno: /desafios, /comunidade, /perfil/seguranca, /configuracoes servem landing page
   → Fix: Criar 4 placeholder pages (Em Breve)
   → Cada página: <div> com título + "Em breve"
   → Usar design BROADCAST dark (mesmo estilo das outras páginas)

2. Páginas travadas: /treinos, /nutricao, /progresso stuck em "Carregando..."
   → Fix: Adicionar timeout (5s) + fallback UI ao fetch
   → Se timeout, mostrar mensagem: "Falha ao carregar. Tente novamente."
   → Usar fetchWithTimeout() wrapper

3. Avaliação física duplicada: POST /api/assessments cria 2 registros
   → Fix: Desabilitar botão após clique (submitted state)
   → Adicionar Idempotency-Key header na requisição
   → Add constraint BD: UNIQUE(user_id, DATE(created_at))

Referência: .claude/plans/plano-final/IMMEDIATE_ACTION_PLAN.md

Depois: Deploy v5.4.1 para produção com npm run cf:deploy
```

---

## PROMPT 2: Depois dos Bugs Fixados (Semana 1)

```
Agora vamos implementar o MVP completo:

Tenho 3 tracks paralelos para a semana 1:

**Track A - Treinos Backend (12h)**
- CRUD de treinos (create, list, update, delete)
- Assignment de treino a aluno
- Execution tracking (aluno marca como feito)
- Earn XP on completion
Referência: .claude/plans/plano-final/ARCHITECTURE_WORKOUTS.md

**Track B - Dashboard + Gamificação (11.5h)**
- Dashboard pessoal (próximo treino, streak, XP, stats)
- Unificar XP em Zustand (parar de valores different por rota)
- Streak logic + cron job (atualizar diariamente)

**Track C - Marketplace + Notificações (12.5h)**
- Marketplace listing de produtos/treinos
- WhatsApp notifications (when workout assigned, when streak reached)
- Add to Cart button (checkout semana 2)

Total: 36h human / 6h CC em 1.5 semanas = MVP pronto

Qual track você quer implementar primeiro?
```

---

## PROMPT 3: Pagamentos & Checkout (Semana 2)

```
MVP pronto! Agora monetização:

**Semana 2 - Ganhar Dinheiro**

1. Asaas Integration (4h)
   - Personal pode receber pagamento
   - Aluno pode pagar por treino/coaching
   - Referência: .claude/docs/ASAAS-INTEGRATION.md

2. Checkout Flow (3h)
   - Add to cart → checkout → Asaas → success
   - Error handling para transações

3. Financial Dashboard (2h)
   - Personal vê: revenue total, transactions, payout

Resultado: 🎉 Primeira venda possível

Quer começar?
```

---

## PROMPT 4: Status & Planning

```
/plan-ceo-review

Status da semana 1: Como está o progresso dos 3 tracks?
- Track A (treinos): X% completo
- Track B (dashboard): X% completo
- Track C (marketplace): X% completo

Bloqueadores encontrados?
Ajustes de scope necessários?
Confiança de lançar MVP fim de semana? (72h a partir de agora)
```

---

## PROMPT 5: Code Review de Features

```
/review

Review todo o código de:
- Treinos backend (APIs + testes)
- Dashboard + gamificação (Zustand + UI)
- Marketplace + notificações (APIs + triggers)

Focando em:
- Edge cases handling
- Error paths (timeout, network fail, duplicates)
- Performance (N+1 queries, bundle size)
- Security (auth guards, SQL injection, XSS)
- Tests coverage (unit + integration)

Report: Critical issues primeiro, depois nice-to-haves
```

---

## PROMPT 6: QA & Testing

```
/qa

Testar MVP completo:

**Flows para validar:**
1. Personal trainer cria treino → atribui a 3 alunos → gets notificação WhatsApp
2. Aluno vê treino atribuído → executa (check-in) → ganha XP → streak incrementa
3. Personal vê relatório de alunos completando treinos
4. Aluno compra treino adicional via marketplace → pagamento Asaas → sucesso

**Mobile testing:**
- iPhone 375px (small phone)
- iPad 768px (tablet)
- Landscape orientation

**Smoke tests:**
- Zero console errors
- Offline mode funciona (PWA fallback)
- Timeouts handled gracefully
- No duplicates em nenhuma operação

Report: Bugs encontrados com screenshot + repro steps
```

---

## PROMPT 7: Deployment & Go-Live

```
/ship

Pronto para fazer deploy v5.5.0 (MVP completo)?

Checklist:
- [ ] 3 bugs críticos fixados e deployed (v5.4.1)
- [ ] Treinos funcional (CRUD + execution + XP)
- [ ] Dashboard live (pessoal vê seus treinos)
- [ ] Gamificação funciona (XP + streaks unified)
- [ ] Marketplace live (listing + detail pages)
- [ ] Notificações WhatsApp ativa (3 triggers)
- [ ] Pagamentos Asaas pronto (beta com 10-20 users)
- [ ] Tests passando (coverage >80%)
- [ ] Zero critical bugs abertos

Qual é o status?
- [ ] Tudo pronto → Deploy agora
- [ ] Faltam X features → Por quanto tempo?
- [ ] Encontrados bugs → Qual severidade?
```

---

## 🎯 Resumo dos Prompts

| # | Prompt | Quando | Output |
|---|--------|--------|--------|
| 1 | 3 Bugs | HOJE (2-3h) | v5.4.1 deployed |
| 2 | MVP Tracks | Amanhã | Paralelizar 3 tracks |
| 3 | Pagamentos | Semana 2 | First revenue possible |
| 4 | Status Review | Semanal | Bloqueadores + ajustes |
| 5 | Code Review | Após features | Critical issues |
| 6 | QA Testing | Antes de deploy | Bugs encontrados |
| 7 | Ship | Fim de sprint | Go-live decisions |

---

## 🚀 COMECE AGORA

**Passo 1 (AGORA):**
Copie o PROMPT 1 acima e cole aqui no Claude Code

**Resultado esperado:**
- v5.4.1 deployada em 3-4 horas
- 3 bugs críticos fixados
- MVP desbloqueado

**Próximo:**
Amanhã, copie PROMPT 2 para começar Sprint 1

---

**Você tem tudo. Boa sorte! 🚀**
