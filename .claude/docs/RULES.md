# Regras Críticas — VFIT

> **NÃO VIOLAR** — Estas regras existem por bugs reais encontrados em produção.
> Qualquer violação pode causar 401s, dados errados, deploy quebrado ou pagamentos incorretos.

---

## 1. Neon Driver — SEMPRE `.query()`

```typescript
// ❌ await sql(query, params)     → tagged template, não aceita (string, params)
// ✅ await sql.query(query, params)
```

---

## 2. React Query — AUTH GUARD OBRIGATÓRIO em todo useQuery

```typescript
// ❌ return useQuery({ queryKey: ['x'], queryFn: ... })  → 401 antes de hidratar
// ✅ SEMPRE:
const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
return useQuery({ queryKey: ['x'], queryFn: ..., enabled: isReady })
// Com ID: enabled: isReady && !!id
// Com polling: refetchInterval: isReady ? 60_000 : false
```

> Sem guard → Zustand não hidratou → request sem token → 401 → demo mode ativado silenciosamente.

---

## 3. TypeScript Dual Config

- `tsconfig.json` → Editor IntelliSense (lib/, workers/, src/)
- `tsconfig.workers.json` → Wrangler build (só lib/, workers/, config/)
- `next.config.ts` → `ignoreBuildErrors: true` (workers/lib não passam pelo Next build)

---

## 4. Turnstile — Bypass REMOVIDO

- Dummy token `XXXX.DUMMY.TOKEN.XXXX` **não funciona** desde 14/02/2026
- Para testes curl: use token real ou desative no CF dashboard

---

## 5. Asaas — PRODUÇÃO ATIVA

- `lib/asaas.ts` detecta sandbox vs prod pelo prefixo da API key
- **⚠️ Pagamentos reais!** `$aact_xxx` = produção

---

## 6. OneSignal — sempre best-effort

```typescript
await notifyPaymentReceived(c.env, { ... }).catch(() => {})  // nunca falhar o endpoint principal
```

---

## 7. Pagamentos — net_amount do Asaas

```typescript
// ❌ netAmount = amount - platformFee                    → platformFee é 0%, errado
// ✅ netAmount = asaasPayment.netValue                   → valor real creditado
// ❌ netAmount = amount - platformFee - commissionAmount  → comissão é custo da PLATAFORMA
// ✅ commission_amount salvo para tracking, NÃO subtrai do net_amount
```

---

## 8. Demo Mode — recovery automático

- Backend offline → demo mode (mock data) → retry /health a cada 30s → auto-recovery
- UI: `DemoModeBanner` exibe aviso amarelo fixo

---

## 9. Schema PostgreSQL — Colunas corretas

```
❌ personals.user_id / students.user_id    → ✅ personals.id = users.id (same PK)
❌ u.avatar_url                            → ✅ u.profile_photo_url
❌ a.weight / a.height                     → ✅ a.weight_kg / a.height_cm
❌ a.body_fat                              → ✅ a.body_fat_percentage
❌ slug                                    → ✅ public_url_slug
❌ plan_type / plan_expires_at             → ✅ subscription_plan / subscription_expires_at
❌ billing_type / fail_reason              → ✅ payment_method / failed_reason
❌ read (boolean)                          → ✅ read_at (timestamptz)
```

---

## 10. Auth Store Types

```typescript
type UserType = 'personal' | 'student' | 'admin'  // user.user_type
type Role = 'user' | 'admin' | 'super_admin'       // user.role
// ❌ user.type → ✅ user.user_type
// ❌ user_type === 'super_admin' → ✅ role === 'super_admin'
```

---

## 11. Smoke Auth — OBRIGATÓRIO no QA/deploy gate

- Para qualquer bloco de QA final, go/no-go ou preparação de deploy: executar `npm run smoke:auth:local`
- `SMOKE_PERSONAL_TOKEN` + `SMOKE_STUDENT_TOKEN` devem estar válidos no `.env.local`
- Evidência obrigatória em `docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md`
- Se houver `failed` no smoke autenticado: **deploy bloqueado** até correção

---

## 12. Tailwind CSS v4 — Sintaxe Canônica OBRIGATÓRIA

**Gradientes:**
```
❌ bg-gradient-to-r   → ✅ bg-linear-to-r
❌ bg-gradient-to-b   → ✅ bg-linear-to-b
```

**Opacidade — NUNCA bracket notation:**
```
❌ bg-white/[0.06]    → ✅ bg-white/6
❌ border-white/[0.03] → ✅ border-white/3
```

**Cores customizadas — SEMPRE alias do tema:**
```
❌ bg-[#0E1525]       → ✅ bg-kpi-dark
```

**Flexbox:**
```
❌ flex-shrink-0      → ✅ shrink-0
❌ flex-grow          → ✅ grow
```

**Tamanhos — Classes canônicas quando divisível por 4px:**
```
❌ h-[600px]          → ✅ h-150    (600/4=150)
❌ w-[800px]          → ✅ w-200    (800/4=200)
```

**Z-index — Sem brackets:**
```
❌ z-[9999]           → ✅ z-9999
```

> **Regra de grep:** `grep -rn "bg-gradient-to-" src/` antes de commit. Zero tolerância.

---

## 13. Tailwind CSS v4 — Variáveis CSS (Sintaxe Nova)

```
❌ bg-[var(--md3-surface)]        → ✅ bg-(--md3-surface)
❌ text-[var(--md3-on-surface)]   → ✅ text-(--md3-on-surface)
❌ border-[var(--md3-outline)]    → ✅ border-(--md3-outline)
```

**Background size:**
```
❌ bg-[length:200%_100%]  → ✅ bg-size-[200%_100%]
```

> **Regra de grep:** `grep -rn "\-\[var(--" src/components/ui/` deve retornar **zero** resultados.

---

## 14. Componente `<Button>` — OBRIGATÓRIO para CTAs

**SEMPRE usar `<Button>` de `@/components/ui/button` para:**
- Botões de submit/enviar (formulários, chat, geradores)
- CTAs primários (Gerar Treino, Gerar Conteúdo, Assinar)
- Botões de ação com texto (Copiar, Tentar Novamente, Deletar)

**Variantes:** `primary` (default), `secondary`, `outline`, `ghost`, `ghost-danger`, `danger`, `workout`, `assessment`, `payment`

**Tamanhos:** `sm` (h-10), `md` (h-12, default), `lg` (h-14), `icon` (h-11 w-11)

**Props especiais:** `loading` (spinner + disabled), `ripple` (default true)

**Permitido como `<button>` nativo:** Chips, tabs, toggles, dot indicators, hamburger, accordion, close X, drag handles, cards clicáveis, dropdown items.

```typescript
// ❌ NUNCA para CTAs:
<button className="rounded-xl bg-brand-primary px-6 py-3 ...">Gerar Treino</button>

// ✅ SEMPRE:
import { Button } from '@/components/ui/button'
<Button loading={isPending}><Sparkles className="h-4 w-4" />Gerar Treino</Button>
```

---

## 15. Barrel Exports (index.ts) — NOMES DEVEM COINCIDIR

- Barrel file: `src/components/ui/index.ts`
- **SEMPRE** verificar o nome exato exportado pelo arquivo-fonte antes de adicionar ao barrel
- Ao criar novo componente em `ui/`, adicionar ao barrel no mesmo PR

```typescript
// ❌ NUNCA inventar nomes: export { MD3StatusIndicator } from './md3-badge'
// ✅ SEMPRE verificar: export { MD3Badge, MD3Chip, MD3Status } from './md3-badge'
```

---

## 16. Ícones — SEMPRE DSIcon

```typescript
// ❌ import { Bell } from 'lucide-react'
// ✅ import { DSIcon } from '@/components/ui/ds-icon'
//    <DSIcon name="bell" size={20} />
```

---

## 17. Wrangler — SEMPRE ATUALIZADO

**🔴 REGRA ABSOLUTA:** Atualizar antes de qualquer deploy e no início de cada sessão:

```bash
npm install -g wrangler@latest && wrangler --version
```

**❌ NUNCA** fazer deploy com wrangler desatualizado.

---

## 18. WhatsApp Operacional — INÍCIO/FIM OBRIGATÓRIO

- Toda ação operacional deve registrar `start` e `end` no grupo WhatsApp
- Escopo: deploy, hotfix, migração, rollback, correção crítica, auditoria
- O `end` deve conter `started_at` + `ended_at` para duração
- Deploy sem WhatsApp = falha (cf-deploy.js exige, bypass só com `--allow-no-whatsapp`)

> Ver `DEPLOY.md` para detalhes do helper script e formato das mensagens.

---

## 19. Documentação Pós-Deploy

Após CADA deploy, atualizar **na mesma sessão**:
1. `docs/CHANGELOG.md` — entry com data + mudanças
2. Arquivo relevante — backend→`BACKEND.md`, migration→schema docs
3. Este arquivo — se regras mudaram

**Nunca** deploy sem documentação correspondente.

---

## O que NUNCA fazer

- Não commitar direto na `main`. Sempre feature branch.
- Não usar `git push --force` sem confirmação explícita.
- Não rodar `npm run cf:deploy` sem o usuário confirmar.
- Não alterar scripts em `scripts/` sem instrução explícita.
- Não rodar migrations sem planejar rollback.
- Não instalar dependências novas sem justificar.
- Não remover validações de auth/segurança existentes.
- Não ler/escrever `.env` ou `.env.local`.

---

## Prioridades

`segurança > correção > UX > performance > DX`
