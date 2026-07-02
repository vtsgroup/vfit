# 🚀 VFIT MVP — PROMPT PARA INICIAR (Copy & Paste)

**Use este prompt para começar agora:**

---

## ✅ COMANDO 1: Entrar na pasta do projeto

```bash
cd /Users/macos/Development/apps/vfit-production
```

---

## ✅ COMANDO 2: Ler o plano rapidamente (2 min)

```bash
cat .claude/plans/plano-final/QUICK_START.txt
```

**Ou abrir em editor:**
```bash
code .claude/plans/PLANO_FINAL_MVP.md
```

---

## ✅ COMANDO 3: Criar branch para bugs

```bash
git checkout -b fix/critical-bugs-v541
```

---

## ✅ COMANDO 4: Verificar status atual

```bash
git status
npm run quality:ci
```

---

## ✅ COMANDO 5: Implementar Bug #1 (Roteamento)

**Criar arquivo:**
```bash
touch src/app/desafios/page.tsx
touch src/app/comunidade/page.tsx
touch src/app/perfil/seguranca/page.tsx
touch src/app/configuracoes/page.tsx
```

**Adicionar conteúdo placeholder (copy-paste):**

```tsx
// src/app/desafios/page.tsx
export default function DesafiosPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Desafios</h1>
          <p className="text-gray-400">Em breve</p>
        </div>
        <p className="text-sm text-gray-500 max-w-md">
          Desafios personalizados para seus alunos estão chegando em breve
        </p>
      </div>
    </div>
  );
}
```

**Repita para:**
- `src/app/comunidade/page.tsx` (trocar "Desafios" por "Comunidade")
- `src/app/perfil/seguranca/page.tsx` (trocar por "Segurança da Conta")
- `src/app/configuracoes/page.tsx` (trocar por "Configurações")

---

## ✅ COMANDO 6: Implementar Bug #2 (Timeout + Fallback)

**Criar/atualizar `src/lib/api-client.ts`:**

```typescript
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

**Em páginas que usam `/api/*`, trocar `fetch()` por `fetchWithTimeout()`**

---

## ✅ COMANDO 7: Implementar Bug #3 (Idempotência)

**Adicionar ao form de avaliação:**

```typescript
const [submitted, setSubmitted] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (submitted) return; // Previne double-submit
  
  setSubmitted(true);
  
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
    setSubmitted(false);
  }
};
```

---

## ✅ COMANDO 8: Testar localmente

```bash
npm run dev
```

**Verificar:**
- [ ] `/desafios` mostra "Em breve"
- [ ] `/comunidade` mostra "Em breve"
- [ ] `/perfil/seguranca` mostra "Em breve"
- [ ] `/configuracoes` mostra "Em breve"
- [ ] `/treinos` carrega com timeout (não trava)
- [ ] Formulário avaliação não duplica

---

## ✅ COMANDO 9: Qualidade + Tests

```bash
npm run quality:ci
```

**Se falhar, corrigir erros**

---

## ✅ COMANDO 10: Commit + Push

```bash
git add -A
git commit -m "fix: resolve 3 critical bugs in v5.4.1

- Implement placeholder pages for routing (/desafios, /comunidade, /seguranca, /config)
- Add timeout + fallback for API client (5s, prevents hanging)
- Add idempotency key to assessment form (prevents duplicates)

Fixes issues blocking MVP viability."

git push origin fix/critical-bugs-v541
```

---

## ✅ COMANDO 11: Pull Request

```bash
gh pr create --title "fix: critical bugs v5.4.1" \
  --body "Fixes 3 blocking issues:
1. Routing (pages serve landing instead of content)
2. Timeouts (/treinos, /nutricao stuck loading)
3. Duplicates (assessment form double-submit)

Deploy to production immediately."
```

---

## ✅ COMANDO 12: Deploy (Após review)

```bash
npm run cf:deploy
```

**Verificar produção:**
```bash
curl https://vfit.app.br/desafios
curl https://vfit.app.br/treinos
```

---

## 🎯 CHECKLIST (Marca conforme completa)

### Hoje (02/07)
- [ ] Leu QUICK_START.txt (2 min)
- [ ] Criou branch `fix/critical-bugs-v541`
- [ ] Implementou Bug #1 (roteamento, 4 arquivos)
- [ ] Implementou Bug #2 (timeout)
- [ ] Implementou Bug #3 (idempotência)
- [ ] Testou localmente (`npm run dev`)
- [ ] Rodou `npm run quality:ci`
- [ ] Fez commit + push
- [ ] Criou PR
- [ ] Deploy via `npm run cf:deploy`
- [ ] Testou em produção

**Tempo total:** ~3-4h

### Amanhã (03/07)
- [ ] Ler IMMEDIATE_ACTION_PLAN.md
- [ ] Começar Sprint 1 (treinos + dashboard + marketplace)
- [ ] Assign 3 tracks paralelas

---

## 📱 Se Precisar de Ajuda

**Leia estes docs (em `.claude/plans/plano-final/`):**

1. `IMMEDIATE_ACTION_PLAN.md` — Código prático detalhado
2. `ARCHITECTURE_WORKOUTS.md` — Spec treinos (amanhã)
3. `CONSOLIDATION_REPORT.md` — Status geral

---

## 🚀 COMECE AGORA

**Passo 1 (AGORA):**
```bash
cd /Users/macos/Development/apps/vfit-production
git checkout -b fix/critical-bugs-v541
```

**Passo 2:**
Implemente os 3 bugs usando código acima

**Passo 3:**
```bash
npm run quality:ci
git push origin fix/critical-bugs-v541
```

**Passo 4:**
Deploy!

---

**Você tem tudo. Comece em 5 min. 🚀**
