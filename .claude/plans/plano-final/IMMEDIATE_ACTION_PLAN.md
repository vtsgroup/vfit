# VFIT — Plano de Ação Imediato (Próximas 24h)

**Data:** 02/07/2026 | **Tempo:** Agora até amanhã | **Objetivo:** Deploy v5.4.1 com 3 bugs críticos fixados

---

## 🔴 HOJE — 3 Bugs Críticos (5-6h human)

### Bug #1: Roteamento Interno (2-3h)
**Problema:** `/desafios`, `/comunidade`, `/perfil/seguranca`, `/configuracoes` servem landing page  
**Solução:** Implementar placeholder pages "Em Breve"

**Files to Modify:**
- `src/app/desafios/page.tsx` — cria arquivo se não existe
- `src/app/comunidade/page.tsx` — cria arquivo se não existe
- `src/app/perfil/seguranca/page.tsx` — cria arquivo se não existe
- `src/app/configuracoes/page.tsx` — cria arquivo se não existe

**Quick Fix (30 min):**
```tsx
// src/app/desafios/page.tsx
export default function DesafiosPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Desafios</h1>
        <p className="text-gray-400">Coming soon...</p>
        <p className="text-sm text-gray-500">Em breve você poderá criar desafios para seus alunos</p>
      </div>
    </div>
  );
}
```

**Repeat para:** `/comunidade`, `/perfil/seguranca`, `/configuracoes`  
**Deploy:** Imediato

---

### Bug #2: Páginas Travadas (2-3h)
**Problema:** `/treinos`, `/nutricao`, `/progresso` stuck em "Carregando..."  
**Causa:** Falha silenciosa em chamadas de API  
**Solução:** Adicionar timeout + fallback UI + logging

**Files to Modify:**
- `src/lib/api-client.ts` — adicionar timeout wrapper
- Páginas que usam fetch (adicionar error boundary)

**Quick Fix:**
```typescript
// src/lib/api-client.ts
const TIMEOUT = 5000; // 5 segundos

export async function fetchWithTimeout(url: string, options?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('aborted')) {
      console.error(`Request timeout after ${TIMEOUT}ms:`, url);
      // Sentry.captureException({ message: 'API timeout', url });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

**Use em páginas:**
```tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await fetchWithTimeout('/api/treinos');
      setWorkouts(data);
    } catch (error) {
      setError('Falha ao carregar treinos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

---

### Bug #3: Avaliação Duplicada (1-2h)
**Problema:** POST `/api/assessments` cria 2 registros idênticos  
**Causa:** Double-click ou double-submit  
**Solução:** 
1. Idempotency key na requisição
2. Desabilitar botão após clique
3. Constraint BD

**Files to Modify:**
- Componente de formulário de avaliação (desabilitar botão)
- API endpoint `/api/assessments` (adicionar idempotência)

**Frontend Fix:**
```tsx
function AssessmentForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted) return; // Previne double-submit
    
    setSubmitted(true);
    setLoading(true);
    
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Idempotency-Key': `assessment-${Date.now()}-${Math.random()}`,
        }
      });
      // ...
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* campos */}
      <button disabled={loading || submitted} type="submit">
        {loading ? 'Salvando...' : 'Salvar Avaliação'}
      </button>
    </form>
  );
}
```

**Backend Fix (D1):**
```sql
-- Adicionar constraint único
ALTER TABLE assessments 
ADD CONSTRAINT unique_user_date UNIQUE(user_id, DATE(created_at));

-- OU usar idempotency keys table
CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  endpoint TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📋 Checklist de Deploy (v5.4.1)

- [ ] Bug #1 (roteamento) fixado e testado
- [ ] Bug #2 (páginas travadas) fixado e testado
- [ ] Bug #3 (avaliação duplicada) fixado e testado
- [ ] Versão em `lib/version.ts` bumped para v5.4.1
- [ ] `package.json` atualizado
- [ ] Todos os tests passam: `npm run quality:ci`
- [ ] Commit: `fix: resolve 3 critical bugs in v5.4.1`
- [ ] Push e criar PR
- [ ] Review + aprovação
- [ ] Deploy: `npm run cf:deploy`
- [ ] Smoke test em produção:
  - `/desafios` carrega (mostra "Coming soon")
  - `/treinos` carrega com timeout + fallback
  - `/avaliacoes` permite criar sem duplicar

---

## 📱 UI/UX Fine-tuning (Paralelo)

**Contexto:** `/register/student?from=onboarding` tem espaçamento grande no mobile  
**Skills rodando:** `/ui-ux-pro-max` deve retornar recomendações  
**Action:** Aguardar recomendações do skill, depois implementar

**Likely fixes:**
- Reduzir padding top/bottom em mobile (375px)
- Ajustar margin entre campos
- Fazer CTA button responsive

---

## 🚀 Semana Começar Amanhã (Semana 1)

**Dependência:** v5.4.1 deployed e estável

### Paralelo (Comece tudo amanhã):

**Track A - Treinos Backend (12h):**
- Day 1: Database schema + migrations
- Day 2-3: API endpoints (create, assign, execute)
- Day 4-5: Tests + deployment

**Track B - Dashboard & Gamificação (11.5h):**
- Day 1: Unificar XP em Zustand (2h)
- Day 2: Streak logic + cron (3h)
- Day 3-4: Dashboard UI (5.5h)
- Day 5: Tests + deployment (1h)

**Track C - Marketplace & Notifications (12.5h):**
- Day 1: Marketplace API (2.5h)
- Day 2-3: Marketplace UI (4h)
- Day 4: WhatsApp triggers (4h)

**Total:** 36h human / ~6h CC em 1.5 semanas

---

## 🎯 Skills Processando (Aguardar)

Você rodar 3 skills em paralelo:

1. **`/ui-ux-pro-max`** — Fine-tuning mobile `/register/student?from=onboarding`
   - Status: ⏳ Processando
   - ETA: Até 30 min
   - Output: Recomendações de espaçamento

2. **`/plan-ceo-review`** — MVP completo com ROI focus
   - Status: ⏳ Processando
   - ETA: Até 2h (skill pesada)
   - Output: Plano estratégico CEO

3. **`/plan-eng-review`** — Review de engenharia & arquitetura
   - Status: ⏳ Processando
   - ETA: Até 2h (skill pesada)
   - Output: Recomendações de arquitetura

**Consolidação:** Depois que todos retornarem, você terá:
- ✅ Análises completas (bugs, estado, roadmap)
- ✅ Recomendações UI/UX
- ✅ Plano CEO de monetização
- ✅ Review de engenharia

---

## 📊 Timeline Realista

```
HOJE (02/07):
├─ Fix 3 bugs: 5-6h
├─ Deploy v5.4.1: 30min
├─ Aguardar skills: 2h (paralelo)
└─ Consolidar plano: 30min
TOTAL: ~3h focused work

AMANHÃ (03/07):
└─ Start Sprint 1 (treinos + dashboard + marketplace)
```

---

## 💡 Se Algo Quebrar

**Timeout ao fix bug #2:**
- Opção A: Desabilitar `/treinos` enquanto fixa (mostrar "Temporarily unavailable")
- Opção B: Implementar rápido fallback (5 min)
- Recomendação: A (melhor UX do que infinite loading)

**Duplicação ainda ocorre após bug #3:**
- Checar se há race condition em requests paralelos
- Verificar BD constraint foi criado
- Implementar retry logic com exponential backoff

**Deploy falha:**
- Rollback para v5.4.0: `npm run cf:deploy -- --rollback`
- Investigar erro em Sentry
- Fix + redeploy

---

## ✅ Após v5.4.1 (First Revenue Check)

Com v5.4.1 deployado:
- Treinos backend começam
- Gamificação funciona
- Marketplace listagem começa
- WhatsApp notifications ativa

Em 2 semanas:
- MVP pronto
- Pagamentos live
- 1ª transação possível

---

## 🎬 Comece AGORA

1. Open Terminal
2. `cd /Users/macos/Development/apps/vfit-production`
3. `git checkout -b fix/critical-bugs-v541`
4. Criar arquivos de placeholder para 4 rotas (5 min)
5. Adicionar timeout ao API client (10 min)
6. Adicionar idempotência ao form (10 min)
7. Test local: `npm run dev`
8. `npm run quality:ci` (verify everything)
9. Commit + push + PR

**Total: ~45 min de trabalho prático.**

---

**Você pode estar com v5.4.1 em produção antes de sair de casa.**

Vamos lá. 🚀
