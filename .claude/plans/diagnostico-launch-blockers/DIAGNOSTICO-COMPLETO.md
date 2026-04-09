# 🔴 DIAGNÓSTICO TÉCNICO — Launch Blockers v1.9.9

> **Data:** 09/04/2026 · **Status:** 8 Issues críticos impedindo lançamento  
> **Objetivo:** Mapear root causes e criar roadmap estruturado de correção

---

## 📊 Sumário Executivo

| # | Issue | Severidade | Blocker | Impact | User Flow |
|---|-------|:----------:|:-------:|--------|-----------|
| **1** | Avaliações → "não encontrada" | 🔴 P0 | ✅ Sim | 100% do fluxo personal-student | Personal vê evaluation |
| **2** | Treino 5 dias → 3 dias | 🔴 P0 | ✅ Sim | Expectativa vs entrega | Student vê treino |
| **3** | CPF sem validação + botão disabled | 🔴 P0 | ✅ Sim | 100% do fluxo checkout → signup | Student → Aluno convertido |
| **4** | Treinos não sincronizam | 🔴 P0 | ✅ Sim | Zero treinos visíveis | Student acessa treinos |
| **5** | Falta contador students (60s) | 🟡 P1 | ⚠️ Degradação UX | Dashboard pessoal vazio | Personal vê seus alunos |
| **6** | Mídia exercícios invisível | 🟡 P1 | ❌ Não (parcial) | Conteúdo incompleto | Student executa treino |
| **7** | Erro geração PIX | 🔴 P0 | ✅ Sim | Zero pagamentos | Personal/Student paga |
| **8** | Recuperar UI dashboard students | 🔵 Referência | ❌ Não | Roadmap design | — |

---

## 🔍 DETALHAMENTO — Root Causes & Soluções

### 1️⃣ AVALIAÇÕES QUEBRADAS — "Avaliação não encontrada"

**Sintoma:** `/dashboard/assessments` retorna tela vazia com mensagem "Avaliação não encontrada"

**Investigação Realizada:**
```typescript
// File: src/app/dashboard/assessments/page.tsx (linha 34-56)
const { data, isLoading, isError } = useAssessments(params)  // ❌ PROBLEMA AQUI

// File: src/hooks/use-assessments.ts (linha 396)
export function useAssessments(params: AssessmentListParams = {}) {
  const isReady = useAuthStore((s) => {
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike  // ← Check correto
  })
  return useQuery({
    enabled: isReady,  // ← Desabilita query se usuário NÃO é personal
  })
}
```

**Root Cause:** Página de assessments chama `useAssessments` SEM verificar se é `personal`. Se for `student`, a query fica desabilitada (`enabled: false`), retorna `null` → UI renderiza "não encontrada".

**Solução:**
```typescript
// assessments/page.tsx deve checar tipo de usuário:
const isPersonal = isPersonalView  // ← já existe em linha 40
if (!isPersonal) {
  // Usar useMyAssessments em vez de useAssessments
  return <MyAssessmentsSection />
}
```

**Timeline:** 30 min (fix tipo + rotas + testes)  
**Dependências:** Nenhuma

---

### 2️⃣ TREINO 5 DIAS → 3 DIAS — IA gerando quantidade errada

**Sintoma:** Aluno solicita treino de 5 dias, recebe 3 dias

**Investigação Necessária:**
```typescript
// File: workers/api/ai.ts ou workers/api/workouts.ts
// Procurar: geração de treino via IA
// Verificar:
//   1. Prompt IA contém "X dias" corretamente?
//   2. Algoritmo de distribuição de exercícios
//   3. Limites em config/constants.ts
```

**Possíveis Root Causes:**
1. **Prompt IA hardcoded:** Pode estar usando `${days || 3}` → fallback 3 dias
2. **Distribuição:** Loop `for (let i = 0; i < 3; i++)` em vez de `i < days`
3. **Config:** Limite máximo em `WORKOUT_CONSTRAINTS.max_days = 3`

**Solução:** (após investigação)
```typescript
// Pseudo-código fix
const days = req.body.days || 5
if (days < 1 || days > 7) throw BadRequestError('1-7 dias')

const prompt = `Crie treino de ${days} dias...`  // ← explicit days
const workout = await ai.generate({ prompt, days })
```

**Timeline:** 1-2 horas (investigar + testar com 5 dias)  
**Dependências:** AI API (Replicate)

---

### 3️⃣ CPF SEM VALIDAÇÃO + BOTÃO DISABLED — Cadastro bloqueado

**Sintoma:** 
- Input CPF não tem validação em tempo real
- Após preencher CPF e clicar, botão fica disabled e não progride
- Usuário não consegue terminar cadastro

**Investigação Realizada:**
```typescript
// File: src/app/(auth)/register/student/page.tsx (linha 108-143)
const requireCpf = fromOnboarding && !!selectedPlanId && selectedPlanId !== 'free'

const formValid =
  form.full_name.trim().length >= 2 &&
  form.email &&
  form.password.length >= 8 &&
  turnstileToken &&
  acceptedTerms &&
  (!requireCpf || form.cpf.replace(/\D/g, '').length === 11)  // ← Só checa LENGTH

// Não há:
// - validateCpf(cpf) async
// - CPF validation state
// - Error message para CPF inválido
```

**Root Cause:** 
1. Sem validação de CPF real (algoritmo dígito verificador)
2. Sem feedback em tempo real
3. Botão `disabled={!formValid}` fica disabled porque CPF.length !== 11 MESMO após preencher

**Solução (Priority Fix):**
```typescript
// 1. Criar hook useCpfValidation
export function useCpfValidation(cpf: string) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  
  useEffect(() => {
    if (!cpf) { setIsValid(null); return }
    const raw = cpf.replace(/\D/g, '')
    if (raw.length !== 11) { 
      setIsValid(false); 
      setError('CPF deve ter 11 dígitos')
      return 
    }
    // Algoritmo verificador CPF
    const isValidCpf = validateCpfAlgorithm(raw)
    setIsValid(isValidCpf)
    if (!isValidCpf) setError('CPF inválido')
  }, [cpf])
  
  return { isValid, error }
}

// 2. Usar no form
const { isValid: cpfValid, error: cpfError } = useCpfValidation(form.cpf)
const formValid = ... && (!requireCpf || cpfValid === true)
```

**Timeline:** 1 hora (hook + validação + UI feedback)  
**Dependências:** Nenhuma

---

### 4️⃣ TREINOS NÃO SINCRONIZAM — Invisíveis após geração

**Sintoma:**
- Aluno gera treino (via modal ou onboarding)
- Treino criado com sucesso
- MAS não aparece em `/dashboard/treinos`
- Se loga com outra conta, também não vê (sincronização perdida)

**Investigação Necessária:**
```typescript
// File: src/hooks/use-workouts.ts — GET /workouts
// Verificar:
//   1. Query filter user_id vs student_id vs personal_id
//   2. Cache TTL & revalidation
//   3. POST /workouts retorna treino? Atualiza cache?

// File: workers/api/workouts.ts
// Verificar schema:
//   - Qual relação: workouts.user_id ou workouts.student_id?
//   - Personal_id separado?
//   - Quando aluno gera treino, vai com student_id = aluno_id?
```

**Possíveis Root Causes:**
1. **Schema mismatch:** POST retorna `personal_id` mas GET filtra `user_id`
2. **Cache não revalida:** Após POST, cache continua mostrando lista antiga
3. **Permissões:** Aluno só vê treinos se `owner_id === student_id`, mas treino criado com `personal_id` (do AI)

**Solução (após investigação):**
```typescript
// No hook após POST /workouts:
queryClient.invalidateQueries({ queryKey: ['workouts', userId] })

// Ou em GET /workouts:
const query = `
  SELECT * FROM workouts 
  WHERE user_id = $1 OR student_id = $1 OR personal_id = $1
  ORDER BY created_at DESC
`
```

**Timeline:** 1-2 horas (investigar schema + testar cross-account)  
**Dependências:** Nenhuma

---

### 5️⃣ FALTA CONTADOR STUDENTS — 60 segundos real-time

**Sintoma:** Dashboard personal sem widget de "Alunos (X)" com contador em tempo real

**Investigação Necessária:**
```bash
# Procurar em git history:
git log --all --oneline | grep -i "student.*count\|widget\|counter"
git log --all -p src/app/dashboard/page.tsx | grep -A10 -B10 "student"
```

**Possível estrutura anterior:**
```tsx
<StatsCard icon="users" label="Alunos" value={studentCount} />
<CounterWidget icon="users" count={studentCount} updateInterval={60000} />
```

**Solução:**
1. Recuperar componente de git history OU reconstruir
2. Hook `useStudentCount()` com polling 60s
3. Real-time updates via WebSocket (optional)

**Timeline:** 1-2 horas (recuperar + restaurar)  
**Dependências:** Nenhuma (ou WebSocket para real-time premium)

---

### 6️⃣ MÍDIA EXERCÍCIOS INVISÍVEL — Admin upload não aparece

**Sintoma:**
- Admin faz upload de imagem/vídeo para exercício (em Super Admin)
- Upload funciona (sem erro)
- MAS aluno não vê imagem/vídeo ao executar treino

**Investigação Necessária:**
```typescript
// File: workers/api/exercises.ts — GET /exercises/:id
// Verificar retorno:
const response = {
  id, name, description,
  image_url: ???  // ← Vem aqui? Vazio?
  video_url: ???  // ← Vem aqui? Vazio?
  media: []       // ← Ou aqui?
}

// Verificar schema:
// - Table: exercise_media? exercise_images? exercise_videos?
// - Campos: url, type, order
```

**Possíveis Root Causes:**
1. **Schema não retorna:** SELECT sem o campo de media
2. **Permissions:** Query filtra media de admin-only
3. **R2 URL missing:** Stored no R2 mas URL não é construída

**Solução:**
```typescript
const exercise = await pgQueryOne(`
  SELECT e.*, 
    json_agg(json_build_object('url', em.url, 'type', em.media_type)) 
      FILTER (WHERE em.id IS NOT NULL) as media
  FROM exercises e
  LEFT JOIN exercise_media em ON e.id = em.exercise_id
  WHERE e.id = $1
  GROUP BY e.id
`, [exerciseId])
```

**Timeline:** 30 min (verificar schema + adicionar SELECT)  
**Dependências:** Nenhuma

---

### 7️⃣ ERRO GERAÇÃO PIX — Pagamento falha

**Sintoma:**
- Aluno clica "Assinar" ou "Gerar PIX"
- Asaas retorna erro
- PIX não é gerado

**Investigação Necessária:**
```typescript
// File: workers/api/subscription.ts ou workers/api/payments.ts
// POST /subscription/checkout
// Procurar Asaas error handling:

try {
  const payment = await createAsaasPayment({...})
} catch (error) {
  // Qual é o erro específico?
  // - "Chave PIX inválida"?
  // - "CPF inválido"?
  // - "Customer inválido"?
}
```

**Possíveis Root Causes:**
1. **Chave PIX personal não configurada:** `personal.pix_key = null`
2. **CPF do payment inválido:** Algoritmo validação com erro
3. **Asaas API error:** Rate limit, token expirado

**Solução:**
```typescript
// Adicionar validação:
if (!personal.pix_key) {
  throw BadRequestError('Personal não tem chave PIX configurada. Vá para Configurações > Pagamento.')
}

// Adicionar retry com fallback:
try {
  payment = await createAsaasPayment({ billingType: 'PIX', ... })
} catch (e) {
  if (e.message.includes('Chave PIX')) {
    // Fallback: gerar com UNDEFINED (Asaas choose method)
    payment = await createAsaasPayment({ billingType: 'UNDEFINED', ... })
  }
}
```

**Timeline:** 1-2 horas (investigar erro + testar manualmente)  
**Dependências:** Asaas API

---

### 8️⃣ RECUPERAR DASHBOARD STUDENTS — Referência UI

**Objetivo:** Encontrar layout/componentes antigos para replicar

**Ação:**
```bash
# 1. Buscar em git branches antigas
git branch -a | grep -E "feature|old|backup"
git log --all --grep="dashboard"

# 2. Procurar arquivos antigos
git log --diff-filter=D --summary | grep "dashboard" | head -10
git show <commit>:src/app/dashboard/page.tsx

# 3. Recuperar arquivo específico
git checkout <old_commit> -- src/app/dashboard/page.tsx
```

**Timeline:** 30 min (busca + cópia)

---

## 🎯 ROADMAP ESTRUTURADO — Pré-Launch

### Fase 0: TODAY (P0 Blockers) — 4-6 horas

| ID | Task | Owner | Est. | Deps | Status |
|----|------|-------|------|------|--------|
| P0.1 | Fix avaliações (type check) | eng | 30m | — | 🔴 TODO |
| P0.2 | Fix treino 5→3 dias (IA) | eng | 1h | ai-api | 🔴 TODO |
| P0.3 | Fix CPF validação + botão disabled | eng | 1h | — | 🔴 TODO |
| P0.4 | Fix treinos não sincronizam | eng | 1.5h | db-schema | 🔴 TODO |
| P0.5 | Fix PIX erro (Asaas) | eng | 1h | asaas | 🔴 TODO |

**Go/No-Go Gate:** Smoke auth + manual testing todos os 5 issues

---

### Fase 1: TOMORROW (P1 — Nice-to-have) — 2-3 horas

| ID | Task | Owner | Est. | Deps | Status |
|----|------|-------|------|------|--------|
| P1.1 | Restaurar contador students 60s | eng | 1h | git-history | 🟡 DEFER |
| P1.2 | Exibir mídia exercícios | eng | 30m | schema | 🟡 DEFER |
| P1.3 | UI polish dashboard | design | 1h | — | 🟡 DEFER |

---

## 📋 CHECKLIST ANTES DE DEPLOY

- [ ] P0.1: Page assessments redireciona para `useMyAssessments` se student
- [ ] P0.2: Treino 5 dias gerado com 5 dias (verificar IA prompt)
- [ ] P0.3: CPF valida em tempo real, erro message, botão ativa
- [ ] P0.4: Treino POST → GET sincroniza (invalidate cache)
- [ ] P0.5: PIX gera sem erro, aluno vê QR code

**Smoke Tests:**
```bash
npm run smoke:auth:local
npm run test:e2e -- --grep "assessment|workout|checkout|pix"
```

---

## 📈 PRÓXIMAS AÇÕES

1. **Começar por P0.1 (avaliações)** — mais rápido, unlock personal workflow
2. **Paralelizar P0.2 + P0.3** — independent (IA + form)
3. **P0.4 depois** — precisa entender schema (db time)
4. **P0.5 manual** — testar com Asaas real (30m)
5. **QA gate** — todos os 5 com passing tests

---

**Estimativa Total:** 4-6 horas (P0) + 2-3 horas (P1) = **6-9 horas**

Pronto para começar? Qual quer que eu ataque primeiro?
