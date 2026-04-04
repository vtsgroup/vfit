# 🚀 Domain Migration: iapersonal.app.br → vfit.app.br

> **Migração de domínio completa para infraestrutura VFIT**
>
> v1.0 | 2026-04-04 | Planejamento em engenharia (eng-review mode)

---

## 📌 Visão Geral

Migrar **100% das referências** do domínio antigo (`iapersonal.app.br`) para o novo domínio de marca (`vfit.app.br`) sem downtime, mantendo compatibilidade backward e preservando funcionalidade crítica.

### O Problema

- **679 referências** espalhadas em 163 arquivos
- **8 integração points** críticos: Cloudflare Workers/Pages, R2 CDN, OAuth, Email, WebAuthn, TWA, Analytics
- **Sem plano coerente** = risco de gaps críticos, downtime, perda de funcionalidade

### A Solução

**5 sprints sequenciais** com validação automática:
1. **Sprint 1:** Infraestrutura Cloudflare + Config centralizada
2. **Sprint 2:** Backend handlers (passkeys, auth, emails, webhooks)
3. **Sprint 3:** Frontend (hardcodes, metadata, links)
4. **Sprint 4:** CDN + Media (R2, images, videos, WhatsApp)
5. **Sprint 5:** TWA + Mobile (manifest, keystore, deep linking)

Cada sprint tem validação, rollback plan e comunicação de usuário.

---

## ✅ Objetivos

- [ ] Migrar 100% das URLs hardcoded
- [ ] Atualizar 100% das configurações de infraestrutura
- [ ] Manter zero-downtime migration
- [ ] Preservar acesso a apps/clientes legados via fallback
- [ ] Documentar toda mudança para auditoria
- [ ] Comunicar usuarios sobre impactos (passkeys, re-login)

---

## ⚠️ Riscos Críticos

### 🔴 CRÍTICO: WebAuthn rpId Invalidation

**Problema:** WebAuthn passkeys têm rpId hardcoded como `iapersonal.app.br`. Se mudarmos rpId, passkeys antigos ficarão inválidos.

**Impacto:**
- Usuários com passkey não conseguem fazer login
- Sem passkey, devem usar password (fallback)
- Comunicação necessária antes de go-live

**Mitigação:**
1. **Dual-write em Sprint 2:** Aceitar AMBOS rpIds durante transition period (30 dias)
   ```typescript
   // workers/api/passkey.ts
   const VALID_RP_IDS = [
     'iapersonal.app.br',  // Legado
     'vfit.app.br'         // Novo
   ];
   ```
2. **Recovery flow:** Usuários podem fazer re-register de passkey via email
3. **Fallback:** Password authentication sempre disponível
4. **Email broadcast:** "Sua passkey foi sincronizada com novo domínio"

**Timeline:**
- Day 0 (go-live): Dual-write ativado
- Days 1-30: Transição (ambos rpIds aceitos)
- Day 31: Remove suporte a rpId antigo (usuários já migraram)

---

### 🟠 ALTO: Email Deliverability

**Problema:** Email sender `noreply@iapersonal.app.br` não funcionará se SPF/DKIM/DMARC não forem configurados para `vfit.app.br`.

**Impacto:**
- Emails caem em spam ou são rejeitados
- Usuários não recebem reset password, confirmação, notificações
- Support overload

**Mitigação:**
1. **Pré-requisito antes de Sprint 2:** Configurar DNS para `vfit.app.br`:
   ```
   # SPF
   v=spf1 include:resend.com ~all
   
   # DKIM (Resend gera automaticamente)
   # DMARC
   v=DMARC1; p=reject; rua=mailto:dmarc@vfit.app.br
   ```
2. **Teste em staging:** Enviar email de teste antes de go-live
3. **Monitoramento:** Track email bounce rates 24/7 pós-go-live
4. **Fallback:** Se email falhar, mostrar toast com recovery link

---

### 🟠 ALTO: OAuth Redirect URIs

**Problema:** Google, GitHub, etc. têm redirect URIs hardcoded. Se mudarmos domínio, autenticação quebra.

**Impacto:**
- OAuth login falha com "URI mismatch"
- Usuários não conseguem fazer login

**Mitigação:**
1. **Pré-requisito antes de Sprint 2:** Update redirect URIs em cada OAuth provider:
   - Google Cloud Console: adicionar `https://vfit.app.br/auth/callback/google`
   - GitHub: adicionar `https://vfit.app.br/auth/callback/github`
2. **Dual support:** Aceitar ambas URIs antigas e novas durante transição
3. **Fallback:** Password sempre funciona

**Checklist (fazer ANTES de go-live):**
- [ ] Google Cloud Console atualizado
- [ ] GitHub atualizado
- [ ] Testar OAuth flow em staging com novo domínio
- [ ] Testar fallback para password

---

### 🟡 MÉDIO: R2 CDN Custom Domains

**Problema:** R2 buckets têm custom domains (`images.iapersonal.app.br`, `videos.iapersonal.app.br`). Usuários em apps legados tentarão acessar via domínio antigo.

**Impacto:**
- Imagens/vídeos quebrados em apps legacy
- Clientes reclamam de "site quebrado"

**Mitigação:**
1. **Não delete domínios antigos:** Manter ambos ativos por 90 dias
2. **Redirect em R2:** Configurar redirect 301 de domínio antigo para novo
3. **CDN cache:** Images com `Cache-Control: public, max-age=31536000` (1 ano) — safe redirect
4. **Monitoramento:** Track requests aos domínios antigos, retire quando traffic cair

---

## 📊 Escopo

| Item | Valor | Notas |
|------|-------|-------|
| **Referências** | 679 | Mapeadas em DISCOVERY-INVENTORY.md |
| **Arquivos** | 163 | Espalhados em src/, workers/, lib/, scripts/, docs/ |
| **Sprints** | 5 | Sequenciais, 3-4 dias cada |
| **Integração points** | 8 | CF Workers, CF Pages, R2, OAuth, Email, WebAuthn, TWA, Analytics |
| **Downtime necessário?** | Não | Zero-downtime migration com dual-write |
| **Usuários afetados** | Todos | Requer re-login em mobile (TWA), passkey sync em web |

---

## 🎯 Success Criteria

- [ ] ✅ 100% das URLs migradas (verificado com grep)
- [ ] ✅ Zero requests para domínio antigo (monitored 24h)
- [ ] ✅ 99.9% email deliverability (Resend dashboard)
- [ ] ✅ 0 OAuth login failures pós-go-live
- [ ] ✅ 0 passkey failures (monitored, dual-write fallback)
- [ ] ✅ Smoke tests passam (auth, email, passkeys, webhooks)
- [ ] ✅ TWA rebuild + signed com novo domínio
- [ ] ✅ GA4 events rastreados (domain change captured)

---

## 📅 Timeline (Estimado)

```
Sprint 1 (Day 1-3):   Infra CF + Config    [8 tasks]
Sprint 2 (Day 4-6):   Backend handlers    [12 tasks]
Sprint 3 (Day 7-9):   Frontend            [18 tasks]
Sprint 4 (Day 10-11): CDN + Media         [6 tasks]
Sprint 5 (Day 12-13): TWA + Mobile        [4 tasks]
Day 14:               QA + Smoke tests    [validation]
Day 15:               Go-live             [deployment]
```

**Parallelização possível:**
- Sprint 1 é bloqueador (infra must be ready)
- Sprints 2-4 podem ser parcialmente paralelos (diferentes domínios de código)
- Sprint 5 precisa de Sprint 1 (domínio de manisfest)

---

## 🔄 Rollback Plan

Se algo quebrar pós-go-live:

1. **Revert DNS** (instantâneo, ~5min):
   ```bash
   # Cloudflare DNS → apontar vfit.app.br de volta para old worker
   # DNS fallback: vfit.app.br → vfit.pages.dev (old frontend)
   ```

2. **Revert código** (rápido, ~15min):
   ```bash
   git revert <commit-com-migration>
   npm run cf:deploy
   ```

3. **Comunicação de usuário:**
   - Status page: "Maintenance mode, we're fixing something"
   - Email: "We rolled back the domain change, reverting to iapersonal.app.br"

**RTO (Recovery Time Objective):** < 30 minutos

---

## 📋 Executar o Plano

### Pré-requisitos

- [ ] Branch criado: `feat/domain-migration-vfit-app-br`
- [ ] Acceso a Cloudflare Dashboard (Workers + Pages + R2 + D1 + KV)
- [ ] Acceso a OAuth provider consoles (Google, GitHub)
- [ ] Acceso a Resend email config
- [ ] Acceso a GitHub secrets (para .env updates)

### Como ler

1. **Arquitetura**: Leia `01-ARCHITECTURE.md`
2. **Inventário**: Leia `02-DISCOVERY-INVENTORY.md`
3. **Sprint-by-sprint**: Leia `03-SPRINT-PLAN.md`
4. **Rollout**: Leia `04-ROLLOUT-STRATEGY.md`
5. **Tracking**: Atualize `TRACKING.md` enquanto executa

### Como executar

Siga `03-SPRINT-PLAN.md` sequencialmente, completando cada task e validando ao final de cada sprint em `VALIDATION-CHECKLIST.md`.

---

## 🆘 Troubleshooting

| Problema | Causa Provável | Solução |
|----------|---|---|
| Emails caem em spam | SPF/DKIM/DMARC não configurados | Verificar DNS records em Cloudflare |
| OAuth login falha | Redirect URI não atualizado em provider | Update provider console + limpar browser cache |
| Passkey inválido | rpId mudou sem dual-write | Verificar VALID_RP_IDS array em passkey.ts |
| Images quebradas | CDN domain não atualizado | Verificar R2 custom domain config |
| TWA não abre | Manifest não atualizado | Rebuild TWA com novo domínio |

---

## 📞 Contato / Dúvidas

- **Arquitetura**: Leia `01-ARCHITECTURE.md` (diagramas, fluxos)
- **Tarefas**: Leia `03-SPRINT-PLAN.md` (detalhes, deps, validação)
- **Go-live**: Leia `04-ROLLOUT-STRATEGY.md` (timeline, comms, monitoring)
- **Tracking**: Veja `TRACKING.md` (status atual, completed tasks)

---

**Status:** 🔵 Planning (eng-review em progresso)
**Última atualização:** 2026-04-04 17:45 GMT-3
**Próximo milestone:** Aprovação de arquitetura → Sprint 1 kickoff
